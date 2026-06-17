import { getArticlesByTypePaged } from "../../../../lib/db";
import { TYPE_SEO } from "../../../../../lib/type-seo";
import { HEADER_HTML, FOOTER_HTML } from "../../../../../lib/templates";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 100;

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function buildItemListJsonLd(type: string, articles: any[], page: number, canonical: string): string {
  const itemList: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${slugToTitle(type)} Articles`,
    url: canonical,
    itemListElement: articles.slice(0, 50).map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Article",
        "@id": `${canonical.split("?")[0]}/${encodeURIComponent(a.short_title ?? "")}`,
        headline: a.title ?? a.short_title ?? "",
        description: a.description ?? "",
        url: `${canonical.split("?")[0]}/${encodeURIComponent(a.short_title ?? "")}`,
        ...(a.img ? { image: a.img } : {}),
        datePublished: a.published_time ?? a.modified_time ?? undefined,
      },
    })),
  };
  const clean = (obj: Record<string, unknown>) => {
    Object.keys(obj).forEach((k) => {
      if (obj[k] === undefined) delete obj[k];
      else if (typeof obj[k] === "object" && obj[k] !== null) clean(obj[k] as Record<string, unknown>);
    });
  };
  clean(itemList);
  return `<script type="application/ld+json">${JSON.stringify(itemList)}</script>`;
}

function slugToTitle(slug: string): string {
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ type: string; pageNum: string }> }
) {
  const resolved = await params;
  const rawType: string = resolved.type;
  const pageNum: string = resolved.pageNum;

  const url = new URL(_request.url);
  const page = Math.max(2, parseInt(pageNum, 10) || 2);

  if (parseInt(pageNum, 10) <= 1) {
    return new Response(null, { status: 301, headers: { Location: `/${rawType}` } });
  }

  const { articles, total } = await getArticlesByTypePaged(rawType, page, PAGE_SIZE);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const header = HEADER_HTML;
  const footer = FOOTER_HTML;

  const seo = TYPE_SEO[rawType];
  const title = seo?.title ?? slugToTitle(rawType);
  const canonical = url.origin + url.pathname;

  const renderedHeader = header
    .replace("{{TITLE}}", escapeHtml(title + " - Page " + page))
    .replace("{{DESCRIPTION}}", escapeHtml(`Page ${page} of ${seo?.description ?? "Articles about " + title}`))
    .replace("{{CANONICAL}}", canonical)
    .replace("{{OG_TITLE}}", escapeHtml(`${title} — FlowMachinery`))
    .replace("{{OG_DESCRIPTION}}", escapeHtml(`Expert articles about ${title}.`))
    .replace("{{OG_IMAGE}}", "https://flowmachinery.com/assets/og-image.jpg")
    .replace("{{OG_URL}}", canonical)
    .replace("{{ARTICLE_PUBLISHED_TIME}}", "")
    .replace("{{ARTICLE_AUTHOR}}", "")
    .replace("{{TWITTER_TITLE}}", escapeHtml(`${title} — FlowMachinery`))
    .replace("{{TWITTER_DESCRIPTION}}", escapeHtml(`Expert articles about ${title}.`))
    .replace("{{TWITTER_IMAGE}}", "https://flowmachinery.com/assets/og-image.jpg");

  let listHtml = `<div class="type-page">
  <h1>${escapeHtml(title)}</h1>
  <div class="page-info">${total} articles total — Page ${page} of ${totalPages}</div>`;

  if (articles.length === 0) {
    listHtml += `<p class="no-articles">No articles yet.</p>`;
  } else {
    listHtml += `<div class="articles-grid">`;
    for (const a of articles) {
      const articleTitle = escapeHtml(a.title ?? "Untitled");
      const slug = encodeURIComponent(a.short_title ?? "");
      const desc = a.description ? escapeHtml(a.description) : "";
      const img = a.img ? `<img src="${escapeHtml(a.img)}" alt="${articleTitle}" loading="lazy" />` : "";
      const articleAuthor = a.author ? escapeHtml(a.author) : "";
      const date = a.modified_time
        ? new Date(a.modified_time).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
        : "";

      listHtml += `
      <a href="/${encodeURIComponent(rawType)}/${slug}" class="a-card">
        ${img}
        <div class="a-card-body">
          <h2>${articleTitle}</h2>
          ${desc ? `<p>${desc}</p>` : ""}
          ${articleAuthor ? `<span class="a-card-author">${articleAuthor}</span>` : ""}${date ? `<time>${date}</time>` : ""}
        </div>
      </a>`;
    }
    listHtml += `</div>`;

    if (totalPages > 1) {
      const basePath = `/${encodeURIComponent(rawType)}`;
      const pageLink = (p: number) => p === 1 ? basePath : `${basePath}/page/${p}`;

      listHtml += `<nav class="pagination" aria-label="Pagination">`;
      listHtml += page > 1
        ? `<a href="${pageLink(page - 1)}">&laquo; Prev</a>`
        : `<span class="disabled">&laquo; Prev</span>`;

      const pages: (number | string)[] = [];
      if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        if (page > 3) pages.push("…");
        for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
        if (page < totalPages - 2) pages.push("…");
        pages.push(totalPages);
      }

      for (const p of pages) {
        if (p === "…") listHtml += `<span class="ellipsis">…</span>`;
        else if (p === page) listHtml += `<span class="active">${p}</span>`;
        else listHtml += `<a href="${pageLink(p as number)}">${p}</a>`;
      }

      listHtml += page < totalPages
        ? `<a href="${pageLink(page + 1)}">Next &raquo;</a>`
        : `<span class="disabled">Next &raquo;</span>`;
      listHtml += `</nav>`;
    }
  }

  listHtml += `</div>`;

  const itemListJsonLd = articles.length > 0 ? buildItemListJsonLd(rawType, articles, page, canonical) : "";
  const html = renderedHeader + listHtml + footer.replace("</body>", `${itemListJsonLd}</body>`);

  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, s-maxage=31536000" },
  });
}
