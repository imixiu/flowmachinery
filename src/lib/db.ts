import { neon } from "@neondatabase/serverless";

const SITE = "flowmachinery";

let _sql: ReturnType<typeof neon> | null = null;

function getDb() {
  if (!_sql) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL is not set");
    }
    _sql = neon(url);
  }
  return _sql;
}

export async function getArticlesByType(type: string) {
  return getDb()`SELECT * FROM articles WHERE site=${SITE} AND type=${type} AND is_online = 'Y' ORDER BY published_time DESC LIMIT 50`;
}

export async function getArticlesByTypePaged(
  type: string,
  page: number,
  pageSize: number
): Promise<{ articles: any[]; total: number }> {
  const sql = getDb();
  const offset = (page - 1) * pageSize;
  const [countRow, rows] = await Promise.all([
    sql`SELECT count(*)::int AS total FROM articles WHERE site = ${SITE} AND type = ${type} AND is_online = 'Y'`,
    sql`
      SELECT id, site, type, short_title, language, published_time, modified_time,
             author, img, title, description, url
      FROM articles
      WHERE site = ${SITE} AND type = ${type} AND is_online = 'Y'
      ORDER BY modified_time DESC NULLS LAST, id DESC
      LIMIT ${pageSize} OFFSET ${offset}
    `,
  ]) as [any[], any[]];
  return { articles: rows, total: (countRow as any)[0].total };
}

export async function getArticleBySlug(slug: string) {
  const results = await getDb()`SELECT * FROM articles WHERE site=${SITE} AND short_title=${slug.replace(/\r/g, "")} AND is_online = 'Y' LIMIT 1` as any[];
  return results[0];
}

export async function getRelatedArticles(articleId: number, type: string) {
  return getDb()`SELECT * FROM articles WHERE site=${SITE} AND type=${type} AND id != ${articleId} AND is_online = 'Y' ORDER BY published_time DESC LIMIT 5` as Promise<any[]>;
}

export async function getAllArticles() {
  return getDb()`SELECT * FROM articles WHERE site=${SITE} AND is_online = 'Y' ORDER BY published_time DESC`;
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
  const sql = getDb();
  const url = a.url ?? `/articles/${a.type}/${a.short_title}`;
  const results = await sql`
    INSERT INTO articles (site, short_title, title, body, description, type, language, author, img, url, published_time, modified_time, tag, is_online)
    VALUES (${SITE}, ${a.short_title.replace(/\r/g, "")}, ${a.title}, ${a.body}, ${a.description ?? null}, ${a.type ?? null}, ${a.language ?? null}, ${a.author ?? null}, ${a.img ?? null}, ${url}, ${a.published_time ?? new Date().toISOString()}, ${new Date().toISOString()}, ${a.tag ?? null}, ${a.is_online ?? 'Y'})
    ON CONFLICT (site, short_title) DO UPDATE SET title=${a.title}, body=${a.body}, description=${a.description ?? null}, type=${a.type ?? null}, author=${a.author ?? null}, img=${a.img ?? null}, url=${url}, tag=${a.tag ?? null}, is_online=${a.is_online ?? 'Y'}, modified_time=${new Date().toISOString()}
    RETURNING *
  ` as any[];
  return results[0];
}

export async function getAllAuthors() {
  return getDb()`SELECT * FROM authors WHERE site=${SITE} ORDER BY id`;
}

export async function getAuthorBySlug(slug: string) {
  const results = await getDb()`SELECT * FROM authors WHERE site=${SITE} AND slug=${slug} LIMIT 1` as any[];
  return results[0];
}

export async function upsertAuthor(a: {
  name: string; slug: string; img?: string | null;
  description?: string | null; language?: string | null;
}) {
  const sql = getDb();
  const results = await sql`
    INSERT INTO authors (site, name, slug, img, description, language)
    VALUES (${SITE}, ${a.name}, ${a.slug}, ${a.img ?? null}, ${a.description ?? null}, ${a.language ?? null})
    ON CONFLICT (site, slug) DO UPDATE SET name=${a.name}, img=${a.img ?? null}, description=${a.description ?? null}
    RETURNING *
  ` as any[];
  return results[0];
}
