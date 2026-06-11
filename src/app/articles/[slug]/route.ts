import { readFile } from "fs/promises";
import path from "path";
import { getArticleBySlug } from "../../../lib/db";

export const dynamic = "force-dynamic";

async function loadTemplate(name: string): Promise<string> {
  const filePath = path.join(process.cwd(), "templates", name);
  return readFile(filePath, "utf-8");
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function buildJsonLd(article: any, requestUrl: string): string {
  const articleType = article.type ?? "";
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": requestUrl,
    headline: article.title ?? "",
    description: article.description ?? "",
    articleSection: articleType || undefined,
    author: article.author
      ? { "@type": "Person", name: article.author }
      : { "@type": "Organization", name: "FlowMachinery" },
    publisher: {
      "@type": "Organization",
      "@id": "https://flowmachinery.com/#organization",
      name: "FlowMachinery",
      logo: { "@type": "ImageObject", url: "https://flowmachinery.com/assets/logo.svg" },
    },
    datePublished: article.published_time ?? new Date().toISOString(),
    dateModified: article.modified_time ?? article.published_time ?? new Date().toISOString(),
    mainEntityOfPage: { "@type": "WebPage", "@id": requestUrl },
  };
  if (article.img) {
    schema.image = article.img;
    schema.thumbnailUrl = article.img;
  }
  if (article.tag) {
    schema.keywords = article.tag.split(",").map((t: string) => t.trim()).filter(Boolean);
  }
  Object.keys(schema).forEach((k) => { if (schema[k] === undefined) delete schema[k]; });
  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug.replace(/\r/g, ""));
  if (!article) return new Response("Article not found", { status: 404 });

  const [header, footer] = await Promise.all([
    loadTemplate("header.html"),
    loadTemplate("footer.html"),
  ]);

  const title = article.title ?? "";
  const description = article.description ?? "";
  const author = article.author ?? "";
  const pubTime = article.published_time ?? article.modified_time;
  const coverImg = article.img ?? "";

  const renderedHeader = header
    .replace("{{TITLE}}", escapeHtml(title))
    .replace("{{DESCRIPTION}}", escapeHtml(description))
    .replace("{{CANONICAL}}", escapeHtml(_request.url))
    .replace("{{OG_TITLE}}", escapeHtml(title))
    .replace("{{OG_DESCRIPTION}}", escapeHtml(description))
    .replace("{{OG_IMAGE}}", escapeHtml(coverImg))
    .replace("{{OG_URL}}", escapeHtml(_request.url))
    .replace("{{ARTICLE_PUBLISHED_TIME}}", pubTime ?? "")
    .replace("{{ARTICLE_AUTHOR}}", escapeHtml(author))
    .replace("{{TWITTER_TITLE}}", escapeHtml(title))
    .replace("{{TWITTER_DESCRIPTION}}", escapeHtml(description))
    .replace("{{TWITTER_IMAGE}}", escapeHtml(coverImg));

  const authorSlug = encodeURIComponent(author.toLowerCase().replace(/\s+/g, "-"));
  const pubDate = pubTime ? new Date(pubTime).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "";
  const metaParts: string[] = [];
  if (author) metaParts.push(`By <a href="/author/${authorSlug}" class="meta-author">${escapeHtml(author)}</a>`);
  if (pubDate) metaParts.push(`<time class="meta-date">${escapeHtml(pubDate)}</time>`);
  const metaBlock = metaParts.length ? `<div class="article-meta">${metaParts.join(" · ")}</div>` : "";
  const coverBlock = coverImg ? `<img class="article-cover" src="${escapeHtml(coverImg)}" alt="${escapeHtml(title)}" loading="eager">` : "";
  const titleBlock = `${coverBlock}<h1>${escapeHtml(title)}</h1>${metaBlock}`;
  const jsonLd = buildJsonLd(article, _request.url);
  const html = renderedHeader + `<main class="article-wrap">` + titleBlock + (article.body ?? "") + footer.replace("</body>", `${jsonLd}</body>`);
  return new Response(html, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, s-maxage=31536000" } });
}
