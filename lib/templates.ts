// Auto-generated: inlined header/footer templates for Cloudflare Workers
// Source: templates/header.html + templates/footer.html

export const HEADER_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-95PY8PSZ0Y"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-95PY8PSZ0Y');
</script>

<meta charset="UTF-8">
<link rel="icon" href="/icon.png?v=2" type="image/png">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{TITLE}} — FlowMachinery</title>
<meta name="description" content="{{DESCRIPTION}}">
<link rel="canonical" href="{{CANONICAL}}">
<!-- Open Graph -->
<meta property="og:title" content="{{OG_TITLE}}">
<meta property="og:description" content="{{OG_DESCRIPTION}}">
<meta property="og:image" content="{{OG_IMAGE}}">
<meta property="og:url" content="{{OG_URL}}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="FlowMachinery">
<meta property="og:locale" content="en_US">
<meta property="article:published_time" content="{{ARTICLE_PUBLISHED_TIME}}">
<meta property="article:author" content="{{ARTICLE_AUTHOR}}">
<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{{TWITTER_TITLE}}">
<meta name="twitter:description" content="{{TWITTER_DESCRIPTION}}">
<meta name="twitter:image" content="{{TWITTER_IMAGE}}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/articles/article.css">
<style>
:root{--primary:#3b82f6;--accent:#06b6d4;--bg:#0a0e17;--surface:#111827;--text:#e0e6ed;--text-light:#94a3b8;--border:rgba(59,130,246,0.15);--radius:12px;--max-w:1240px}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:var(--bg);color:var(--text);line-height:1.6;-webkit-font-smoothing:antialiased}
a{color:inherit;text-decoration:none;transition:color 0.3s ease}
h1,h2,h3,h4,h5,h6{font-family:'Space Grotesk','Inter',sans-serif;line-height:1.2;font-weight:700}
header.site-header{position:sticky;top:0;z-index:100;background:rgba(10,14,23,0.95);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid var(--border);padding:0 24px}
.header-inner{max-width:var(--max-w);margin:0 auto;display:flex;align-items:center;justify-content:space-between;height:72px}
.logo{display:flex;align-items:center;gap:10px;font-family:'Space Grotesk',sans-serif;font-size:1.5rem;font-weight:700;color:#fff}
.logo-icon{width:40px;height:40px;background:linear-gradient(135deg,#3b82f6,#06b6d4);border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:1.2rem;color:#fff}
.logo span{color:var(--primary)}
nav.site-nav{display:flex;gap:8px;align-items:center}
nav.site-nav a{font-size:0.9rem;font-weight:500;color:var(--text-light);padding:10px 18px;border-radius:8px;transition:all 0.3s ease}
nav.site-nav a:hover{color:#fff;background:rgba(59,130,246,0.1)}
.type-page{max-width:var(--max-w);margin:0 auto;padding:40px 24px}
.type-page h1{font-size:2rem;margin-bottom:8px;color:#fff}
.type-page .page-info{color:var(--text-light);font-size:0.9rem;margin-bottom:28px}
.articles-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:28px}
.a-card{display:block;text-decoration:none;color:inherit;background:var(--surface);border-radius:var(--radius);overflow:hidden;border:1px solid var(--border);transition:transform 0.2s,box-shadow 0.2s}
.a-card:hover{transform:translateY(-4px);box-shadow:0 8px 24px rgba(59,130,246,0.15)}
.a-card img{width:100%;height:200px;object-fit:cover;display:block}
.a-card-body{padding:20px}
.a-card-body h2{font-size:1.1rem;margin-bottom:8px;line-height:1.4;color:#fff}
.a-card-body p{font-size:0.9rem;color:var(--text-light);margin-bottom:10px;line-height:1.5;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.a-card-body time{font-size:0.8rem;color:#64748b}
.a-card-author{font-size:0.8rem;color:var(--text-light);margin-right:8px}
.no-articles{color:var(--text-light);margin-top:24px;font-size:1rem}
.article-wrap{max-width:800px;margin:0 auto;padding:32px 24px 48px}
.article-header-area{margin-bottom:2rem}
.article-wrap h1{font-family:'Space Grotesk',sans-serif;font-size:clamp(1.6rem,4vw,2.2rem);margin:0 0 16px;line-height:1.25;font-weight:800;color:#fff}
.article-cover{width:100%;max-height:420px;object-fit:cover;border-radius:16px;margin-bottom:24px;box-shadow:0 8px 32px rgba(59,130,246,0.12)}
.article-meta{display:flex;gap:16px;align-items:center;color:var(--text-light);font-size:0.88rem;margin-bottom:8px;padding-bottom:20px;border-bottom:1px solid var(--border);flex-wrap:wrap}
.article-meta a{color:var(--primary);font-weight:600;transition:color 0.2s}
.article-meta a:hover{color:var(--accent)}
.article-meta .meta-date{color:#64748b}
.blog-post{line-height:1.8}
.related-articles{margin:48px 0 24px;padding-top:32px;border-top:1px solid var(--border)}
.related-articles h3{font-family:'Space Grotesk',sans-serif;font-size:1.2rem;font-weight:700;margin-bottom:20px;color:#fff;padding-left:14px;border-left:4px solid var(--primary)}
.related-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px}
.related-list a{display:flex;flex-direction:column;text-decoration:none;color:var(--text);border-radius:12px;overflow:hidden;background:var(--surface);border:1px solid var(--border);transition:transform 0.2s,box-shadow 0.2s}
.related-list a:hover{transform:translateY(-3px);box-shadow:0 6px 20px rgba(59,130,246,0.15)}
.related-list img{width:100%;height:120px;object-fit:cover}
.related-list span{font-size:0.88rem;line-height:1.4;padding:12px;font-weight:500}
.author-profile{text-align:center;margin-bottom:32px}
.author-avatar{width:120px;height:120px;border-radius:50%;object-fit:cover;margin:0 auto 16px;display:block;border:3px solid var(--primary)}
.author-bio{color:var(--text-light);font-size:1.05rem;line-height:1.7;max-width:600px;margin:0 auto 32px}
.back-link a{color:var(--primary)}
.team-desc{color:var(--text-light);font-size:1.05rem;line-height:1.7;margin-bottom:32px}
.team-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:24px}
.author-card{text-decoration:none;color:inherit;display:flex;flex-direction:column;align-items:center;text-align:center;background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:24px;transition:box-shadow 0.2s,border-color 0.2s}
.author-card:hover{box-shadow:0 4px 16px rgba(59,130,246,0.15);border-color:var(--primary)}
.author-card img{width:80px;height:80px;border-radius:50%;object-fit:cover;margin-bottom:12px}
.author-card h3{margin:0 0 8px;font-size:1.1rem;color:#fff}
.author-card p{margin:0;color:var(--text-light);font-size:0.9rem}
.breadcrumb{font-size:0.85rem;color:var(--text-light);margin-bottom:20px;padding:12px 0}
.breadcrumb a{color:var(--primary);text-decoration:none;transition:color 0.2s}
.breadcrumb a:hover{color:var(--accent);text-decoration:underline}
.breadcrumb span{color:var(--text-light);font-weight:500}
.pagination{display:flex;justify-content:center;align-items:center;gap:8px;margin-top:48px;flex-wrap:wrap}
.pagination a,.pagination span{display:inline-flex;align-items:center;justify-content:center;min-width:40px;height:40px;padding:0 12px;border-radius:8px;font-size:0.95rem;text-decoration:none;color:var(--text);background:var(--surface);border:1px solid var(--border);transition:all 0.2s}
.pagination a:hover{background:rgba(59,130,246,0.1);border-color:var(--primary)}
.pagination .active{background:var(--primary);color:#fff;border-color:var(--primary);font-weight:600}
.pagination .disabled{color:#475569;pointer-events:none;border-color:rgba(59,130,246,0.08)}
.pagination .ellipsis{border:none;background:none;color:var(--text-light);min-width:32px;padding:0}
@media(max-width:768px){
nav.site-nav{display:none}
.type-page,.article-wrap{padding:24px 16px}
.articles-grid{grid-template-columns:1fr}
}
</style>
<script>window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};</script>
<script defer src="/_vercel/insights/script.js" data-speed="4"></script>
</head>
<body>
<header class="site-header">
<div class="header-inner">
<a href="/" class="logo"><div class="logo-icon">FM</div>Flow<span>Machinery</span></a>
<nav class="site-nav">
<a href="/pumps">Pumps</a>
<a href="/valves">Valves</a>
<a href="/compressors">Compressors</a>
<a href="/heat-exchangers">Heat Exchangers</a>
<a href="/piping-flow">Piping & Flow</a>
<a href="/rotating-equipment">Rotating Equipment</a>
<a href="/fluid-seals">Seals</a>
<a href="/automation-control">Automation</a>
<a href="/general-machinery">More</a>
</nav>
</div>
</header>
`;

export const FOOTER_HTML = `<footer style="background:#111827;color:#94a3b8;padding:48px 24px 32px;margin-top:64px;border-top:1px solid rgba(59,130,246,0.15)">
<div style="max-width:1240px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:32px">
<div>
<div style="color:#fff;margin-bottom:12px;font-size:1.1rem;font-family:'Space Grotesk',sans-serif;font-weight:700">FlowMachinery</div>
<p style="font-size:0.85rem;line-height:1.6">High-performance CNC machines, hydraulic systems, industrial automation, and manufacturing equipment for global manufacturers.</p>
</div>
<div>
<div style="color:#fff;margin-bottom:12px;font-family:'Space Grotesk',sans-serif;font-weight:600">Products</div>
<ul style="list-style:none;font-size:0.85rem;line-height:2">
<li><a href="/cnc-machines" style="color:#94a3b8">CNC Machines</a></li>
<li><a href="/hydraulic-presses" style="color:#94a3b8">Hydraulic Presses</a></li>
<li><a href="/automation" style="color:#94a3b8">Automation Systems</a></li>
<li><a href="/welding" style="color:#94a3b8">Welding Equipment</a></li>
<li><a href="/conveyors" style="color:#94a3b8">Conveyors &amp; AGVs</a></li>
<li><a href="/inspection" style="color:#94a3b8">Inspection Systems</a></li>
</ul>
</div>
<div>
<div style="color:#fff;margin-bottom:12px;font-family:'Space Grotesk',sans-serif;font-weight:600">Industries</div>
<ul style="list-style:none;font-size:0.85rem;line-height:2">
<li><a href="/automotive" style="color:#94a3b8">Automotive</a></li>
<li><a href="/aerospace" style="color:#94a3b8">Aerospace</a></li>
<li><a href="/energy" style="color:#94a3b8">Energy &amp; Power</a></li>
<li><a href="/electronics" style="color:#94a3b8">Electronics</a></li>
<li><a href="/defense" style="color:#94a3b8">Defense</a></li>
<li><a href="/general-mfg" style="color:#94a3b8">General Mfg</a></li>
</ul>
</div>
<div>
<div style="color:#fff;margin-bottom:12px;font-family:'Space Grotesk',sans-serif;font-weight:600">Resources</div>
<ul style="list-style:none;font-size:0.85rem;line-height:2">
<li><a href="/catalog" style="color:#94a3b8">Product Catalog</a></li>
<li><a href="/case-studies" style="color:#94a3b8">Case Studies</a></li>
<li><a href="/whitepapers" style="color:#94a3b8">Whitepapers</a></li>
<li><a href="/blog" style="color:#94a3b8">Engineering Blog</a></li>
<li><a href="/webinars" style="color:#94a3b8">Webinars</a></li>
<li><a href="/faq" style="color:#94a3b8">FAQ</a></li>
</ul>
</div>
<div>
<div style="color:#fff;margin-bottom:12px;font-family:'Space Grotesk',sans-serif;font-weight:600">Company</div>
<ul style="list-style:none;font-size:0.85rem;line-height:2">
<li><a href="/about" style="color:#94a3b8">About Us</a></li>
<li><a href="/careers" style="color:#94a3b8">Careers</a></li>
<li><a href="/news" style="color:#94a3b8">News &amp; Press</a></li>
<li><a href="/partners" style="color:#94a3b8">Partners</a></li>
<li><a href="/sustainability" style="color:#94a3b8">Sustainability</a></li>
<li><a href="/author/team" style="color:#94a3b8">Our Team</a></li>
</ul>
</div>
</div>
<div style="text-align:center;margin-top:32px;padding-top:24px;border-top:1px solid rgba(59,130,246,0.1);font-size:0.8rem;color:#64748b">
&copy; 2026 FlowMachinery. All rights reserved.
</div>
</footer>
</body>
</html>
`;
