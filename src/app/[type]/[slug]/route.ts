import { getArticleBySlug, getRelatedArticles, getAuthorBySlug } from "../../../lib/db";
import { HEADER_HTML, FOOTER_HTML } from "../../../../lib/templates";

export const dynamic = "force-dynamic";

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
  { params }: { params: Promise<{ type: string; slug: string }> }
) {
  const { type, slug } = await params;
  const article = await getArticleBySlug(slug.replace(/\r/g, ""));

  if (!article) return new Response("Article not found", { status: 404 });

  const authorName = article.author ?? "";
  const authorSlug = authorName.toLowerCase().replace(/\s+/g, "-");
  const [header, footer, related, authorData] = [HEADER_HTML, FOOTER_HTML, await getRelatedArticles(article.id, article.type ?? type), authorSlug ? await getAuthorBySlug(authorSlug) : null];

  const title = article.title ?? "";
  const description = article.description ?? "";
  const author = authorName;
  const pubTime = article.published_time ?? article.modified_time;
  const coverImg = article.img ?? "";
  const ogImage = coverImg || "https://flowmachinery.com/assets/og-image.jpg";

  const renderedHeader = header
    .replace("{{TITLE}}", escapeHtml(title))
    .replace("{{DESCRIPTION}}", escapeHtml(description))
    .replace("{{CANONICAL}}", _request.url)
    .replace("{{OG_TITLE}}", escapeHtml(title))
    .replace("{{OG_DESCRIPTION}}", escapeHtml(description))
    .replace("{{OG_IMAGE}}", escapeHtml(ogImage))
    .replace("{{OG_URL}}", escapeHtml(_request.url))
    .replace("{{ARTICLE_PUBLISHED_TIME}}", pubTime ? new Date(pubTime).toISOString() : "")
    .replace("{{ARTICLE_AUTHOR}}", escapeHtml(author))
    .replace("{{TWITTER_TITLE}}", escapeHtml(title))
    .replace("{{TWITTER_DESCRIPTION}}", escapeHtml(description))
    .replace("{{TWITTER_IMAGE}}", escapeHtml(ogImage));

  const encodedAuthorSlug = encodeURIComponent(authorSlug);
  const pubDate = pubTime ? new Date(pubTime).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "";
  const metaParts: string[] = [];
  if (author) metaParts.push(`By <a href="/author/${encodedAuthorSlug}" class="meta-author">${escapeHtml(author)}</a>`);
  if (pubDate) metaParts.push(`<time class="meta-date">${escapeHtml(pubDate)}</time>`);
  const metaBlock = metaParts.length ? `<div class="article-meta">${metaParts.join(" · ")}</div>` : "";
  const coverBlock = coverImg ? `<img class="article-cover" src="${escapeHtml(coverImg)}" alt="${escapeHtml(title)}" loading="eager">` : "";

  const typeName = type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, ' ');
  const breadcrumb = `<nav class="breadcrumb" aria-label="Breadcrumb">
    <a href="/">Home</a> › <a href="/${type}">${typeName}</a> › <span>${escapeHtml(title)}</span>
  </nav>`;

  const _baseUrl = new URL(_request.url).origin;
  const breadcrumbListSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": _baseUrl },
      { "@type": "ListItem", "position": 2, "name": typeName, "item": `${_baseUrl}/${type}` },
      { "@type": "ListItem", "position": 3, "name": title }
    ]
  };
  const breadcrumbListScript = `<script type="application/ld+json">${JSON.stringify(breadcrumbListSchema)}</script>`;

  const titleBlock = `<div class="article-header-area">` + breadcrumb + `${coverBlock}<h1>${escapeHtml(title)}</h1>${metaBlock}</div>`;

  // Author bio box
  let authorBioHtml = "";
  if (authorData) {
    const aName = escapeHtml(authorData.name ?? author);
    const aDesc = escapeHtml(authorData.description ?? "");
    const aImg = authorData.img
      ? `<img class="author-bio-avatar" src="${escapeHtml(authorData.img)}" alt="${aName}" loading="lazy">`
      : `<div class="author-bio-avatar author-bio-avatar-placeholder">${aName.split(" ").map((w: string) => w[0]).join("")}</div>`;
    authorBioHtml = `<div class="author-bio">${aImg}<div class="author-bio-info"><h4>Written by <a href="/author/${encodedAuthorSlug}">${aName}</a></h4>${aDesc ? `<p>${aDesc}</p>` : ""}</div></div>`;
  }

  let relatedHtml = "";
  if (related.length > 0) {
    const articleType = article.type ?? type;
    relatedHtml = `<div class="related-articles"><h3>More Articles</h3><div class="related-list">` +
    related.map((r: Record<string, any>) => {
        const t = escapeHtml(r.title ?? r.short_title ?? "");
        const rType = encodeURIComponent((r.type ?? articleType).toLowerCase());
        const rSlug = encodeURIComponent(r.short_title ?? "");
        const href = `/${rType}/${rSlug}`;
        const img = r.img ? `<img src="${escapeHtml(r.img)}" alt="${t}" loading="lazy">` : "";
        return `<a href="${href}">${img}<span>${t}</span></a>`;
      }).join("\n") + `</div></div>`;
  }

  const jsonLd = buildJsonLd(article, _request.url);
  const html = renderedHeader + `<main class="article-wrap"><article class="blog-post">` + titleBlock + (article.body ?? "") + `</article>` + authorBioHtml + relatedHtml + `</main>` + breadcrumbListScript + footer.replace("</body>", `${jsonLd}</body>`);
  return new Response(html, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, s-maxage=31536000" } });
}
