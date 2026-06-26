#!/usr/bin/env python3
"""
Batch generate cover images for flowmachinery articles (5 concurrent workers).
Qwen image-plus API → urllib download → Vercel Blob upload → DB update.

Usage:
  cd /root/vercel-projects/flowmachinery
  python3 -u scripts/generate-cover-images.py

Requires: psycopg2-binary
Reads DATABASE_URL and BLOB_READ_WRITE_TOKEN from .env.local directly.
"""

import os, sys, json, time, urllib.request, concurrent.futures, threading

# ── Config ──
SITE = "flowmachinery"
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DASHSCOPE_KEY = "sk-b11580cc1fec4c2a814a8a97e3dfd7d1"
QWEN_API = "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation"
IMAGE_SIZE = "1024*576"
CONCURRENCY = 5
BATCH_COMMIT_SIZE = 20

# Category → visual theme mapping
CATEGORY_THEMES = {
    "pumps": "industrial centrifugal pump, mechanical engineering, factory equipment",
    "valves": "industrial valve system, gate valve, ball valve, pipeline control",
    "compressors": "industrial air compressor, screw compressor, pneumatic system",
    "heat-exchangers": "shell and tube heat exchanger, industrial thermal equipment",
    "piping-flow": "industrial piping system, pipe fittings, flow measurement instruments",
    "rotating-equipment": "industrial bearing, gear system, rotating machinery components",
    "fluid-seals": "mechanical seal, O-ring, industrial sealing technology",
    "automation-control": "industrial automation, VFD motor drive, PLC control panel",
    "general-machinery": "industrial machinery, factory equipment, manufacturing tools",
}

# Thread-safe counters and DB access
lock = threading.Lock()
counters = {"success": 0, "failed": 0, "processed": 0}
db_conn = None
pending_updates = []

def load_env():
    """Read .env.local directly — avoids vercel env run buffering issues."""
    env_path = os.path.join(PROJECT_DIR, ".env.local")
    if not os.path.exists(env_path):
        print(f"ERROR: {env_path} not found"); sys.exit(1)
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if "=" in line and not line.startswith("#"):
                k, v = line.split("=", 1)
                os.environ[k] = v.strip().strip('"').strip("'")

def get_articles(conn):
    import psycopg2
    with conn.cursor() as cur:
        cur.execute(
            "SELECT id, slug, title, type FROM articles "
            "WHERE site = %s AND is_online = 'Y' AND (img IS NULL OR img = '') ORDER BY id",
            (SITE,))
        return cur.fetchall()

def generate_image(title, category):
    theme = CATEGORY_THEMES.get(category, "professional industrial machinery, engineering equipment")
    prompt = f"Professional editorial blog cover: {title[:100]}. Theme: {theme}. Clean modern photography style, dramatic lighting, no text overlay."
    payload = json.dumps({
        "model": "qwen-image-plus",
        "input": {"messages": [{"role": "user", "content": [{"text": prompt}]}]},
        "parameters": {"size": IMAGE_SIZE}
    }).encode()
    req = urllib.request.Request(QWEN_API, data=payload,
        headers={"Authorization": f"Bearer {DASHSCOPE_KEY}", "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=120) as resp:
        data = json.loads(resp.read())
    return data["output"]["choices"][0]["message"]["content"][0]["image"]

def download_image(oss_url, path):
    urllib.request.urlretrieve(oss_url, path)
    size = os.path.getsize(path)
    if size < 1024:
        raise ValueError(f"Downloaded file too small ({size}B)")

def upload_blob(path, blob_path, token):
    with open(path, "rb") as f:
        data = f.read()
    req = urllib.request.Request(
        f"https://blob.vercel-storage.com/{blob_path}", data=data,
        headers={
            "Authorization": f"Bearer {token}",
            "x-content-type": "image/png",
            "x-add-random-suffix": "true"
        }, method="PUT")
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read())["url"]

def process_article(article, blob_token):
    """Process a single article: generate → download → upload → queue DB update."""
    aid, slug, title, cat = article
    pid = os.getpid()
    tid = threading.current_thread().name
    tmp = f"/tmp/cover-{pid}-{tid}-{aid}.png"

    try:
        oss_url = generate_image(title, cat)
        download_image(oss_url, tmp)
        blob_path = f"covers/{SITE}/{slug}.png"
        blob_url = upload_blob(tmp, blob_path, blob_token)

        with lock:
            pending_updates.append((blob_url, aid))
            counters["success"] += 1
            counters["processed"] += 1
            s, f_, p = counters["success"], counters["failed"], counters["processed"]
            print(f"[{p:>5}] ✓ id={aid} {slug[:40]}... ({cat})", flush=True)
            if p % 50 == 0:
                print(f"  ── Progress: {s} success, {f_} failed, {p} total ──", flush=True)
        return True
    except Exception as e:
        with lock:
            counters["failed"] += 1
            counters["processed"] += 1
            p = counters["processed"]
            print(f"[{p:>5}] ✗ id={aid} FAIL: {e}", flush=True)
        return False
    finally:
        if os.path.exists(tmp):
            os.remove(tmp)

def commit_pending(conn):
    """Flush pending DB updates."""
    with lock:
        updates = list(pending_updates)
        pending_updates.clear()
    if not updates:
        return
    import psycopg2
    try:
        with conn.cursor() as cur:
            for blob_url, aid in updates:
                cur.execute("UPDATE articles SET img = %s WHERE id = %s", (blob_url, aid))
        conn.commit()
        print(f"  ── DB committed {len(updates)} updates ──", flush=True)
    except Exception as e:
        print(f"  ── DB commit error: {e}, retrying one-by-one ──", flush=True)
        conn.rollback()
        with conn.cursor() as cur:
            for blob_url, aid in updates:
                try:
                    cur.execute("UPDATE articles SET img = %s WHERE id = %s", (blob_url, aid))
                    conn.commit()
                except Exception as e2:
                    print(f"  ── DB single update error id={aid}: {e2} ──", flush=True)
                    conn.rollback()

def main():
    import psycopg2
    load_env()

    blob_token = os.environ.get("BLOB_READ_WRITE_TOKEN", "")
    if not blob_token:
        print("ERROR: BLOB_READ_WRITE_TOKEN not in .env.local"); sys.exit(1)

    db_url = os.environ.get("DATABASE_URL") or os.environ.get("POSTGRES_URL")
    if not db_url:
        print("ERROR: DATABASE_URL not in .env.local"); sys.exit(1)

    conn = psycopg2.connect(db_url, sslmode="require")
    articles = get_articles(conn)
    total = len(articles)
    print(f"Found {total} articles without cover images")
    print(f"Using {CONCURRENCY} concurrent workers")
    print(f"Blob token: {blob_token[:20]}...")
    print()

    start_time = time.time()
    last_commit = 0

    with concurrent.futures.ThreadPoolExecutor(max_workers=CONCURRENCY) as executor:
        futures = []
        for article in articles:
            future = executor.submit(process_article, article, blob_token)
            futures.append(future)

            # Check if we need to commit
            if len(futures) >= BATCH_COMMIT_SIZE:
                # Wait for batch to complete
                concurrent.futures.wait(futures, return_when=concurrent.futures.ALL_COMPLETED)
                commit_pending(conn)
                futures.clear()

                elapsed = time.time() - start_time
                with lock:
                    p = counters["processed"]
                rate = p / elapsed if elapsed > 0 else 0
                eta = (total - p) / rate / 60 if rate > 0 else 0
                print(f"  ── Batch done | {p}/{total} | {rate:.1f}/s | ETA: {eta:.0f}min ──", flush=True)

        # Process remaining
        if futures:
            concurrent.futures.wait(futures, return_when=concurrent.futures.ALL_COMPLETED)

    # Final commit
    commit_pending(conn)
    conn.close()

    elapsed = time.time() - start_time
    with lock:
        s, f_, p = counters["success"], counters["failed"], counters["processed"]
    print(f"\n{'='*60}")
    print(f"Done in {elapsed/60:.1f} minutes")
    print(f"Success: {s} | Failed: {f_} | Total processed: {p}/{total}")
    print(f"Rate: {p/elapsed:.1f} images/sec")

if __name__ == "__main__":
    main()
