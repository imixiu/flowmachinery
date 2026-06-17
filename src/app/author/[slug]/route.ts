import { getAuthorBySlug, getAllAuthors } from "../../../lib/db";
import { HEADER_HTML, FOOTER_HTML } from "../../../../lib/templates";

export const dynamic = "force-dynamic";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function addOGReplacements(header: string, title: string, description: string, url: string, image?: string): string {
  const img = image || "https://flowmachinery.com/assets/og-image.jpg";
  return header
    .replace("{{OG_TITLE}}", escapeHtml(title))
    .replace("{{OG_DESCRIPTION}}", escapeHtml(description))
    .replace("{{OG_IMAGE}}", escapeHtml(img))
    .replace("{{OG_URL}}", escapeHtml(url))
    .replace("{{ARTICLE_PUBLISHED_TIME}}", "")
    .replace("{{ARTICLE_AUTHOR}}", "")
    .replace("{{TWITTER_TITLE}}", escapeHtml(title))
    .replace("{{TWITTER_DESCRIPTION}}", escapeHtml(description))
    .replace("{{TWITTER_IMAGE}}", escapeHtml(img));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const header = HEADER_HTML;
  const footer = FOOTER_HTML;

  if (slug === "team") {
    const authors = (await getAllAuthors()) as Array<Record<string, any>>;
    const title = "Our Team";
    const canonical = _request.url;
    let renderedHeader = header
      .replace("{{TITLE}}", escapeHtml(title))
      .replace("{{DESCRIPTION}}", escapeHtml("Meet the FlowMachinery editorial team."))
      .replace("{{CANONICAL}}", canonical);
    renderedHeader = addOGReplacements(renderedHeader, `${title} — FlowMachinery`, "Meet our team of industrial experts, engineers, and technical journalists.", canonical);

    const teamAuthor = authors.find((a) => a.slug === "team");
    const memberAuthors = authors.filter((a) => a.slug !== "team");

    let bodyHtml = `<main class="article-wrap"><h1>${escapeHtml(title)}</h1>`;
    if (teamAuthor?.description) {
      bodyHtml += `<p class="team-desc">${escapeHtml(teamAuthor.description)}</p>`;
    }

    if (memberAuthors.length > 0) {
      bodyHtml += `<div class="team-grid">`;
      for (const a of memberAuthors) {
        const name = escapeHtml(a.name ?? "");
        const imgTag = a.img ? `<img src="${escapeHtml(a.img)}" alt="${name}" />` : "";
        const desc = a.description ? escapeHtml(a.description).slice(0, 120) + "..." : "";
        bodyHtml += `<a href="/author/${encodeURIComponent(a.slug ?? "")}" class="author-card">${imgTag}<h3>${name}</h3><p>${desc}</p></a>`;
      }
      bodyHtml += `</div>`;
    }
    bodyHtml += `</main>`;
    return new Response(renderedHeader + bodyHtml + footer, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, s-maxage=31536000" } });
  }

  const author = await getAuthorBySlug(slug);
  if (!author) return new Response("Author not found", { status: 404 });

  const name = author.name ?? "";
  const canonical = _request.url;
  let renderedHeader = header
    .replace("{{TITLE}}", escapeHtml(name))
    .replace("{{DESCRIPTION}}", escapeHtml(author.description ?? ""))
    .replace("{{CANONICAL}}", canonical);
  renderedHeader = addOGReplacements(renderedHeader, `${name} — FlowMachinery`, author.description ?? "Industrial expert at FlowMachinery.", canonical, author.img ?? undefined);

  const imgTag = author.img ? `<img src="${escapeHtml(author.img)}" alt="${escapeHtml(name)}" class="author-avatar" />` : "";
  let bodyHtml = `<main class="article-wrap"><div class="author-profile">${imgTag}<h1>${escapeHtml(name)}</h1></div>`;
  if (author.description) bodyHtml += `<p class="author-bio">${escapeHtml(author.description)}</p>`;
  bodyHtml += `<p class="back-link"><a href="/author/team">&larr; Back to team</a></p></main>`;

  return new Response(renderedHeader + bodyHtml + footer, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, s-maxage=31536000" } });
}
