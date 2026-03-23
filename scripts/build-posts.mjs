import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";
import { marked } from "marked";
import { globSync } from "glob";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const SITE_URL =
  process.env.SITE_URL || "https://thumuacapdonggiacao.com";

marked.use({
  gfm: true,
  mangle: false,
  headerIds: true,
});

function escapeHtml(s) {
  if (s == null) return "";
  return String(s).replace(/[&<>"']/g, (ch) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[ch] || ch;
  });
}

function formatDateVi(isoInput) {
  try {
    const d = new Date(isoInput);
    if (Number.isNaN(d.getTime())) return String(isoInput);
    return d.toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return String(isoInput);
  }
}

function toIsoDate(input) {
  const d = input ? new Date(input) : new Date();
  if (Number.isNaN(d.getTime())) return new Date().toISOString();
  return d.toISOString();
}

function renderHead({
  title,
  description,
  keywords,
  canonical,
  ogImageAbs,
  datePublished,
  dateModified,
  jsonLd,
}) {
  const kw = keywords
    ? `    <meta name="keywords" content="${escapeHtml(keywords)}" />\n`
    : "";
  return `<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
${kw}    <link rel="canonical" href="${escapeHtml(canonical)}" />
    <meta name="author" content="Công Ty Đức Minh" />
    <meta name="robots" content="index, follow" />
    <link rel="icon" href="/img/logo.svg" type="image/svg+xml" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${escapeHtml(canonical)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${escapeHtml(ogImageAbs)}" />
    <meta property="article:published_time" content="${escapeHtml(datePublished)}" />
    <meta property="article:modified_time" content="${escapeHtml(dateModified)}" />
    <meta property="article:author" content="Công Ty Đức Minh" />
    <meta name="theme-color" content="#e90b0b" />
    <link rel="stylesheet" href="/style.css" />
    <script type="application/ld+json">${jsonLd.replace(/</g, "\\u003c")}</script>
    <script>
      (function (w, d, s, l, i) {
        w[l] = w[l] || [];
        w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
        var f = d.getElementsByTagName(s)[0],
          j = d.createElement(s),
          dl = l != "dataLayer" ? "&l=" + l : "";
        j.async = true;
        j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
        f.parentNode.insertBefore(j, f);
      })(window, document, "script", "dataLayer", "GTM-NW8X6RD3");
    </script>
  </head>`;
}

function buildJsonLd({
  title,
  description,
  ogImageAbs,
  datePublished,
  dateModified,
  canonical,
  breadcrumbLabel,
}) {
  const graph = [
    {
      "@type": "Article",
      headline: title,
      name: title,
      image: ogImageAbs,
      datePublished,
      dateModified,
      author: {
        "@type": "Organization",
        name: "Công Ty Thu Mua Cáp Đồng Đức Minh",
      },
      publisher: {
        "@type": "Organization",
        name: "Công Ty Thu Mua Cáp Đồng Đức Minh",
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/img/logo.svg`,
        },
      },
      description,
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Trang Chủ",
          item: `${SITE_URL}/`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Tin Tức",
          item: `${SITE_URL}/tin-tuc/`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: breadcrumbLabel,
        },
      ],
    },
  ];
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": graph,
  });
}

const chromeBody = fs.readFileSync(
  path.join(ROOT, "templates", "chrome-body.html"),
  "utf8"
);
const chromeFooter = fs.readFileSync(
  path.join(ROOT, "templates", "chrome-footer.html"),
  "utf8"
);

const mainOpen = `
    <main>
      <div class="container">
        <article class="article-page">
`;

const mainClose = `
        </article>
      </div>
    </main>
`;

const mdFiles = globSync("tin-tuc/**/index.md", {
  cwd: ROOT,
  ignore: ["**/node_modules/**"],
});

if (mdFiles.length === 0) {
  console.log("build-posts: không có tin-tuc/**/index.md — bỏ qua.");
  process.exit(0);
}

for (const rel of mdFiles) {
  const fullMd = path.join(ROOT, rel);
  const raw = fs.readFileSync(fullMd, "utf8");
  const { data, content } = matter(raw);
  const slug = path.basename(path.dirname(fullMd));

  const title = data.title || slug;
  const description = data.description || "";
  const keywords = data.keywords || "";
  const ogImage =
    typeof data.og_image === "string" && data.og_image.trim()
      ? data.og_image.trim()
      : "/img/thu-mua-cap-dong-duc-minh.webp";
  const ogImageAbs = ogImage.startsWith("http")
    ? ogImage
    : `${SITE_URL}${ogImage.startsWith("/") ? "" : "/"}${ogImage}`;

  const datePublished = toIsoDate(data.date);
  const dateModified = data.updated
    ? toIsoDate(data.updated)
    : datePublished;

  const canonical = `${SITE_URL}/tin-tuc/${slug}/`;
  const breadcrumbLabel =
    data.breadcrumb_title || title.slice(0, 120);
  const showHero = data.show_hero !== false;

  const bodyHtml = marked.parse(content || "");

  const imgAlt = data.image_alt || title;

  const heroBlock =
    showHero && ogImage
      ? `
          <img
            src="${escapeHtml(ogImage.startsWith("/") ? ogImage : "/" + ogImage)}"
            alt="${escapeHtml(imgAlt)}"
            class="article-main-image"
            loading="lazy"
            width="1200"
            height="630"
          />
`
      : "";

  const articleInner = `
          <header class="article-header">
            <nav class="breadcrumb">
              <a href="/">Trang Chủ</a> &raquo;
              <a href="/tin-tuc/">Tin Tức</a> &raquo; ${escapeHtml(
                breadcrumbLabel
              )}
            </nav>
            <h1>${escapeHtml(title)}</h1>
            <p class="article-meta">
              Đăng bởi <strong>Công Ty Đức Minh</strong> |
              <time datetime="${escapeHtml(datePublished)}">${escapeHtml(
                formatDateVi(data.date || datePublished)
              )}</time>
            </p>
          </header>
${heroBlock}
          <div class="article-body">
            ${bodyHtml}
          </div>
`;

  const jsonLd = buildJsonLd({
    title,
    description,
    ogImageAbs,
    datePublished,
    dateModified,
    canonical,
    breadcrumbLabel,
  });

  const head = renderHead({
    title,
    description,
    keywords,
    canonical,
    ogImageAbs,
    datePublished,
    dateModified,
    jsonLd,
  });

  const html =
    `<!DOCTYPE html>
<html lang="vi">
` +
    head +
    "\n" +
    chromeBody +
    mainOpen +
    articleInner +
    mainClose +
    "\n" +
    chromeFooter;

  const outDir = path.dirname(fullMd);
  const outHtml = path.join(outDir, "index.html");
  fs.writeFileSync(outHtml, html, "utf8");
  console.log("Đã tạo:", path.relative(ROOT, outHtml));
}

console.log(`build-posts: xong ${mdFiles.length} bài.`);
