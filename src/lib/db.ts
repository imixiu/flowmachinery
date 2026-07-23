import * as mysql from "mysql2/promise";
import { tairGet } from "./tair";

const SITE = "flowmachinery";

function getConnectionConfig() {
  const url = process.env.MYSQL_URL;
  if (!url) throw new Error("MYSQL_URL is not set");
  const u = new URL(url);
  return {
    host: u.hostname,
    port: parseInt(u.port || "3306"),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, ""),
    connectTimeout: 10000,
    disableEval: true,
  };
}

async function getConn() {
  return mysql.createConnection(getConnectionConfig());
}

export async function getArticlesByType(type: string) {
  const conn = await getConn();
  try {
    const [rows] = await conn.query(
      "SELECT * FROM articles WHERE site = ? AND type = ? AND is_online = 'Y' ORDER BY published_time DESC LIMIT 50",
      [SITE, type]
    );
    return (rows as any[]).map((r: any) => ({ ...r }));
  } finally {
    await conn.end();
  }
}

export async function getArticlesByTypePaged(
  type: string,
  page: number,
  pageSize: number
): Promise<{ articles: any[]; total: number }> {
  const offset = (page - 1) * pageSize;
  const conn = await getConn();
  try {
    const [countRows] = await conn.query(
      "SELECT COUNT(*) AS total FROM articles WHERE site = ? AND type = ? AND is_online = 'Y'",
      [SITE, type]
    );
    const total = (countRows as any[])[0].total;
    const [rows] = await conn.query(
      "SELECT id, site, type, short_title, language, published_time, modified_time, author, img, title, description, url FROM articles WHERE site = ? AND type = ? AND is_online = 'Y' ORDER BY modified_time DESC, id DESC LIMIT ? OFFSET ?",
      [SITE, type, pageSize, offset]
    );
    return { articles: (rows as any[]).map((r: any) => ({ ...r })), total };
  } finally {
    await conn.end();
  }
}

export async function getArticleBySlug(slug: string) {
  const key = `flowmachinery:article:${slug}`;
  const cached = await tairGet(key);
  if (cached) return cached;

  const conn = await getConn();
  try {
    const [rows] = await conn.query(
      "SELECT * FROM articles WHERE site = ? AND short_title = ? AND is_online = 'Y' LIMIT 1",
      [SITE, slug.replace(/\r/g, "")]
    );
    const articles = rows as any[];
    return articles.length > 0 ? { ...articles[0] } : null;
  } finally {
    await conn.end();
  }
}

export async function getRelatedArticles(articleId: number, type: string) {
  const conn = await getConn();
  try {
    const [rows] = await conn.query(
      "SELECT * FROM articles WHERE site = ? AND type = ? AND id != ? AND is_online = 'Y' ORDER BY published_time DESC LIMIT 5",
      [SITE, type, articleId]
    );
    return (rows as any[]).map((r: any) => ({ ...r }));
  } finally {
    await conn.end();
  }
}

export async function getAllArticles() {
  const conn = await getConn();
  try {
    const [rows] = await conn.query(
      "SELECT * FROM articles WHERE site = ? AND is_online = 'Y' ORDER BY published_time DESC",
      [SITE]
    );
    return (rows as any[]).map((r: any) => ({ ...r }));
  } finally {
    await conn.end();
  }
}

export async function upsertArticle(a: {
  short_title: string; title: string; body: string;
  description?: string | null; type?: string | null;
  language?: string | null; author?: string | null;
  img?: string | null; url?: string | null;
  published_time?: string | null;
  tag?: string | null;
  is_online?: string;
}) {
  const conn = await getConn();
  try {
    const url = a.url ?? `/articles/${a.type}/${a.short_title}`;
    const now = new Date().toISOString();
    await conn.query(
      `INSERT INTO articles (site, short_title, title, body, description, type, language, author, img, url, published_time, modified_time, tag, is_online)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE title=VALUES(title), body=VALUES(body), description=VALUES(description), type=VALUES(type), author=VALUES(author), img=VALUES(img), url=VALUES(url), tag=VALUES(tag), is_online=VALUES(is_online), modified_time=VALUES(modified_time)`,
      [SITE, a.short_title.replace(/\r/g, ""), a.title, a.body, a.description ?? null, a.type ?? null, a.language ?? null, a.author ?? null, a.img ?? null, url, a.published_time ?? now, now, a.tag ?? null, a.is_online ?? 'Y']
    );
    const [rows] = await conn.query(
      "SELECT * FROM articles WHERE site = ? AND short_title = ? LIMIT 1",
      [SITE, a.short_title.replace(/\r/g, "")]
    );
    return (rows as any[])[0];
  } finally {
    await conn.end();
  }
}

export async function getAllAuthors() {
  const conn = await getConn();
  try {
    const [rows] = await conn.query(
      "SELECT * FROM authors WHERE site = ? ORDER BY id",
      [SITE]
    );
    return (rows as any[]).map((r: any) => ({ ...r }));
  } finally {
    await conn.end();
  }
}

export async function getAuthorBySlug(slug: string) {
  const conn = await getConn();
  try {
    const [rows] = await conn.query(
      "SELECT * FROM authors WHERE site = ? AND slug = ? LIMIT 1",
      [SITE, slug]
    );
    const authors = rows as any[];
    return authors.length > 0 ? { ...authors[0] } : null;
  } finally {
    await conn.end();
  }
}

export async function upsertAuthor(a: {
  name: string; slug: string; img?: string | null;
  description?: string | null; language?: string | null;
}) {
  const conn = await getConn();
  try {
    await conn.query(
      `INSERT INTO authors (site, name, slug, img, description, language)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name=VALUES(name), img=VALUES(img), description=VALUES(description)`,
      [SITE, a.name, a.slug, a.img ?? null, a.description ?? null, a.language ?? null]
    );
    const [rows] = await conn.query(
      "SELECT * FROM authors WHERE site = ? AND slug = ? LIMIT 1",
      [SITE, a.slug]
    );
    return (rows as any[])[0];
  } finally {
    await conn.end();
  }
}
