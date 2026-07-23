import * as mysql from "mysql2/promise";

export const SITE = "flowmachinery";

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

export async function query(text: string, params: unknown[] = []) {
  const conn = await mysql.createConnection(getConnectionConfig());
  try {
    const [rows] = await conn.query(text, params);
    if (Array.isArray(rows)) {
      return rows.map((row: any) => ({ ...row }));
    }
    return rows;
  } finally {
    await conn.end();
  }
}

export async function getArticlesByTypePaged(type: string, page: number, pageSize: number) {
  const offset = (page - 1) * pageSize;
  const conn = await mysql.createConnection(getConnectionConfig());
  try {
    const [countRows] = await conn.query(
      "SELECT COUNT(*) as total FROM articles WHERE site = ? AND type = ? AND is_online = 'Y'",
      [SITE, type]
    );
    const total = (countRows as any)[0].total;
    const [rows] = await conn.query(
      "SELECT id, short_title, title, description, img, author, published_time, modified_time, type FROM articles WHERE site = ? AND type = ? AND is_online = 'Y' ORDER BY published_time DESC LIMIT ? OFFSET ?",
      [SITE, type, pageSize, offset]
    );
    return { articles: (rows as any[]).map((r: any) => ({ ...r })), total };
  } finally {
    await conn.end();
  }
}

export async function getArticleBySlug(slug: string) {
  const conn = await mysql.createConnection(getConnectionConfig());
  try {
    const [rows] = await conn.query(
      "SELECT * FROM articles WHERE site = ? AND short_title = ? AND is_online = 'Y' LIMIT 1",
      [SITE, slug]
    );
    if ((rows as any[]).length === 0) return null;
    return { ...(rows as any[])[0] };
  } finally {
    await conn.end();
  }
}

export async function getRelatedArticles(excludeId: number, type: string, limit = 3) {
  const conn = await mysql.createConnection(getConnectionConfig());
  try {
    const [rows] = await conn.query(
      "SELECT id, short_title, title, description, img, author, published_time, type FROM articles WHERE site = ? AND type = ? AND id != ? AND is_online = 'Y' ORDER BY published_time DESC LIMIT ?",
      [SITE, type, excludeId, limit]
    );
    return (rows as any[]).map((r: any) => ({ ...r }));
  } finally {
    await conn.end();
  }
}

export async function getAuthorBySlug(slug: string) {
  const conn = await mysql.createConnection(getConnectionConfig());
  try {
    const [rows] = await conn.query(
      "SELECT * FROM authors WHERE site = ? AND slug = ? LIMIT 1",
      [SITE, slug]
    );
    if ((rows as any[]).length === 0) return null;
    return { ...(rows as any[])[0] };
  } finally {
    await conn.end();
  }
}

export async function getAllAuthors() {
  const conn = await mysql.createConnection(getConnectionConfig());
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
