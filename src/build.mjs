// MEGA TOOLS — static site generator
//
// Emits one real HTML file per tool, category and page. No client-side routing
// is required to discover or read any content: every URL returns full markup.
// Each tool page inlines only its own JavaScript, so a calculator page never
// downloads the PDF libraries.

import { mkdir, writeFile, readFile, rm, cp } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  SITE, CATEGORIES, TOOLS, BY_SLUG, CATEGORY_BY_SLUG,
  toolsInCategory, popularTools, featuredTools, relatedTools, validate
} from './registry.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SRC = ROOT;
const OUT = path.join(ROOT, '..', 'dist');
const BUILT = new Date().toISOString().slice(0, 10);

/* ------------------------------------------------------------------ */
/* helpers                                                            */
/* ------------------------------------------------------------------ */

const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Strip tags for use in meta attributes, where markup would break the document.
const plain = s => String(s ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

const url = p => SITE.origin + p;

async function emit(routePath, html) {
  const dir = routePath === '/' ? OUT : path.join(OUT, routePath);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, 'index.html'), html, 'utf8');
}

/* ------------------------------------------------------------------ */
/* shared chrome                                                      */
/* ------------------------------------------------------------------ */

const ICONS = {
  search: '<svg class="mag" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  theme: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" aria-hidden="true"><path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 17l-5.2 2.7 1-5.9L3.5 9.7l5.9-.8z"/></svg>'
};

function head({ title, description, canonical, schema, extraCss }) {
  const full = title === SITE.brand ? `${SITE.brand} — ${SITE.tagline}` : `${title} | ${SITE.name}`;
  return `<!DOCTYPE html>
<html lang="${SITE.locale}" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(full)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(canonical)}">
<meta name="theme-color" content="#ffffff">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(SITE.name)}">
<meta property="og:title" content="${esc(full)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:image" content="${esc(url('/og.svg'))}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(full)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${esc(url('/og.svg'))}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/assets/site.css">
${extraCss || ''}
<script src="/assets/shell.js" defer></script>
${schema ? `<script type="application/ld+json">${JSON.stringify(schema)}</script>` : ''}
</head>`;
}

function header() {
  return `<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap header-in">
    <a class="brand" href="/"><span class="brand-mark" aria-hidden="true">MT</span>${esc(SITE.brand)}</a>
    <nav class="header-nav" aria-label="Categories">
      <a href="/tools">All tools</a>
      <a href="/tools/pdf">PDF</a>
      <a href="/tools/image">Image</a>
      <a href="/tools/developer">Developer</a>
      <a href="/tools/calculators">Calculators</a>
    </nav>
    <div class="header-spacer"></div>
    <div class="hsearch">
      ${ICONS.search}
      <label class="sr-only" for="hs">Search tools</label>
      <input type="search" id="hs" data-search-input placeholder="Search tools" autocomplete="off" spellcheck="false">
      <span class="slash" aria-hidden="true">/</span>
    </div>
    <button class="icon-btn" data-theme-toggle aria-label="Switch between light, dark and system theme" title="Switch theme">${ICONS.theme}</button>
  </div>
</header>`;
}

function footer() {
  const cols = CATEGORIES.slice(0, 4).map(c => `
    <div>
      <h4>${esc(c.short)}</h4>
      <ul>${toolsInCategory(c.slug).slice(0, 6)
        .map(t => `<li><a href="/tools/${t.slug}">${esc(t.name)}</a></li>`).join('')}
        <li><a href="/tools/${c.slug}"><strong>All ${esc(c.short.toLowerCase())} tools →</strong></a></li>
      </ul>
    </div>`).join('');

  return `<footer class="site-footer">
  <div class="wrap">
    <div class="foot-grid">
      <div class="foot-about">
        <a class="brand" href="/" style="margin-bottom:10px"><span class="brand-mark" aria-hidden="true">MT</span>${esc(SITE.brand)}</a>
        <p>${esc(SITE.tagline)} ${TOOLS.length} free tools, no sign-up, and most of them run entirely in your browser.</p>
      </div>
      ${cols}
    </div>
    <div class="foot-grid" style="margin-top:26px;grid-template-columns:repeat(auto-fit,minmax(150px,1fr))">
      <div>
        <h4>Categories</h4>
        <ul>${CATEGORIES.map(c => `<li><a href="/tools/${c.slug}">${esc(c.name)}</a></li>`).join('')}</ul>
      </div>
      <div>
        <h4>Company</h4>
        <ul>
          <li><a href="/about">About</a></li>
          <li><a href="/contact">Contact</a></li>
          <li><a href="/privacy">Privacy</a></li>
          <li><a href="/terms">Terms</a></li>
        </ul>
      </div>
      <div>
        <h4>Other</h4>
        <ul>
          <li><a href="/tools">All tools</a></li>
          <li><a href="/sitemap.xml">Sitemap</a></li>
        </ul>
      </div>
    </div>
    <div class="foot-bottom">
      <span>© ${new Date().getFullYear()} ${esc(SITE.name)}. Free to use.</span>
      <span>${TOOLS.length} tools across ${CATEGORIES.length} categories · updated ${BUILT}</span>
    </div>
  </div>
</footer>`;
}

// Ad placement is a component with a declared size, never inline markup.
// Slots render a labelled placeholder until a real publisher ID is configured.
function adSlot(placement, size) {
  return `<div class="ad-slot" data-ad="${esc(placement)}" data-size="${esc(size)}">
  <span class="ad-label">Advertisement</span>
  <div class="ad-box" role="presentation">Ad slot · ${esc(placement)} · ${esc(size)}</div>
</div>`;
}

function toolTile(t, opts = {}) {
  const badge = opts.badge ? `<span class="badge ${opts.badge === 'Popular' ? 'badge-hot' : 'badge-new'}" style="position:absolute;top:12px;right:12px">${esc(opts.badge)}</span>` : '';
  return `<a class="tool-tile" href="/tools/${t.slug}">
  ${badge}
  <div class="tt-top"><span class="tt-ico" aria-hidden="true">${esc(t.icon || '⚙')}</span><span class="tt-name">${esc(t.name)}</span></div>
  <p class="tt-desc">${esc(t.desc)}</p>
  <div class="tt-path">/tools/${esc(t.slug)}</div>
</a>`;
}

function page({ title, description, canonical, schema, body, bodyAttrs = '', extraJs = '', extraCss = '' }) {
  return `${head({ title, description, canonical, schema, extraCss })}
<body ${bodyAttrs}>
${header()}
<main id="main">
${body}
</main>
${footer()}
${extraJs}
</body>
</html>`;
}

/* ------------------------------------------------------------------ */
/* tool pages                                                         */
/* ------------------------------------------------------------------ */

function toolSchema(tool, cat) {
  const graph = [
    {
      '@type': 'SoftwareApplication',
      name: tool.name,
      url: url(`/tools/${tool.slug}`),
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any — runs in a web browser',
      description: tool.metaDescription,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      isAccessibleForFree: true,
      publisher: { '@type': 'Organization', name: SITE.name, url: SITE.origin }
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.origin },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: url('/tools') },
        { '@type': 'ListItem', position: 3, name: cat.name, item: url(`/tools/${cat.slug}`) },
        { '@type': 'ListItem', position: 4, name: tool.name, item: url(`/tools/${tool.slug}`) }
      ]
    }
  ];
  // FAQPage is only declared because the questions are genuinely rendered below.
  if (tool.faq?.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: tool.faq.map(f => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: plain(f.a) }
      }))
    });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}

function toolPage(tool) {
  const cat = CATEGORY_BY_SLUG[tool.category];
  const related = relatedTools(tool, 5);
  const canonical = url(`/tools/${tool.slug}`);

  const crumbs = `<nav class="crumbs" aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/tools">Tools</a></li>
    <li><a href="/tools/${cat.slug}">${esc(cat.name)}</a></li>
    <li><span aria-current="page">${esc(tool.name)}</span></li>
  </ol>
</nav>`;

  const howto = `<section aria-labelledby="h-howto">
  <h2 id="h-howto">How to use the ${esc(tool.name)}</h2>
  <ol class="steps">${tool.howto.map(s => `<li>${s}</li>`).join('')}</ol>
</section>`;

  const sections = tool.sections.map((s, i) =>
    `<section aria-labelledby="h-s${i}"><h2 id="h-s${i}">${esc(s.h)}</h2>${s.p}</section>`).join('');

  const faq = `<section aria-labelledby="h-faq">
  <h2 id="h-faq">Frequently asked questions</h2>
  ${tool.faq.map(f => `<details class="faq-item">
    <summary>${esc(f.q)}</summary>
    <div class="faq-a"><p>${esc(f.a)}</p></div>
  </details>`).join('')}
</section>`;

  const relatedBlock = `<section aria-labelledby="h-rel">
  <h2 id="h-rel">Related tools</h2>
  <div class="grid grid-3">${related.map(t => toolTile(t)).join('')}</div>
</section>`;

  const aside = `<aside class="tool-aside" aria-label="More tools">
  <div class="aside-card">
    <h3>${esc(cat.name)}</h3>
    <ul class="aside-links">
      ${toolsInCategory(cat.slug).filter(t => t.slug !== tool.slug).slice(0, 8)
        .map(t => `<li><a href="/tools/${t.slug}"><span class="al-ico" aria-hidden="true">${esc(t.icon || '⚙')}</span>${esc(t.name)}</a></li>`).join('')}
      <li><a href="/tools/${cat.slug}"><span class="al-ico" aria-hidden="true">→</span><strong>All ${toolsInCategory(cat.slug).length} ${esc(cat.short.toLowerCase())} tools</strong></a></li>
    </ul>
  </div>
  ${adSlot('tool-sidebar', 'rectangle')}
  <div class="aside-card" data-shelf="recent" hidden>
    <h3>Recently used</h3>
    <div class="grid" data-shelf-body style="gap:8px"></div>
  </div>
</aside>`;

  // Tool JS: shared runtime, the tool's own prelude if it needs one, its config,
  // then its init. Nothing from other tools is ever loaded on this page.
  const cfg = tool.initCfg ? `window.__TOOL_CFG = ${JSON.stringify(tool.initCfg)};\n` : '';
  const inline = `<script src="/assets/tool-runtime.js" defer></script>
<script defer>
document.addEventListener('DOMContentLoaded', function () {
  try {
    ${tool.prelude || ''}
    ${cfg}(${tool.init.toString()})();
  } catch (err) {
    console.error('Tool failed to start:', err);
    var box = document.getElementById('boot-error');
    if (box) { box.hidden = false; }
  }
});
</script>`;

  const body = `<div class="wrap tool-head">
  ${crumbs}
  <div class="tool-title-row">
    <span class="th-ico" aria-hidden="true">${esc(tool.icon || '⚙')}</span>
    <div style="flex:1 1 auto;min-width:0">
      <span class="path-chip">/tools/${esc(tool.slug)}</span>
      <h1>${esc(tool.name)}</h1>
      <p class="lede">${tool.intro}</p>
    </div>
    <button class="icon-btn fav-btn" data-fav="${esc(tool.slug)}" aria-pressed="false" aria-label="Save to favourites" title="Save to favourites">${ICONS.star}</button>
  </div>
</div>

<div class="wrap tool-layout">
  <div>
    <div class="panel" id="tool-panel">
      <div class="panel-bar"><span class="dot" aria-hidden="true"></span>${esc(tool.name)}<span class="pb-right">Runs in your browser</span></div>
      <div class="panel-body" id="tool-root">
        <div class="msg msg-err" id="boot-error" hidden data-show="true" role="alert">
          This tool could not start. It needs JavaScript enabled. If JavaScript is on, reloading the page usually fixes it.
        </div>
        <noscript><div class="msg msg-warn" data-show="true">This tool needs JavaScript to run. The instructions and explanations below are still readable without it.</div></noscript>
        ${tool.html}
      </div>
    </div>

    ${adSlot('tool-below-app', 'leaderboard')}

    <div class="prose">
      ${howto}
      ${sections}
      ${faq}
    </div>

    ${adSlot('tool-below-content', 'leaderboard')}

    ${relatedBlock}
  </div>
  ${aside}
</div>`;

  return page({
    title: tool.seoTitle,
    description: tool.metaDescription,
    canonical,
    schema: toolSchema(tool, cat),
    body,
    bodyAttrs: `data-page="tool" data-tool="${esc(tool.slug)}"`,
    extraJs: inline
  });
}

/* ------------------------------------------------------------------ */
/* homepage                                                           */
/* ------------------------------------------------------------------ */

function homePage() {
  const popular = popularTools(10);
  const featured = featuredTools(8);

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: SITE.name,
        url: SITE.origin,
        description: SITE.description,
        potentialAction: {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: url('/tools?q={search_term_string}') },
          'query-input': 'required name=search_term_string'
        }
      },
      { '@type': 'Organization', name: SITE.name, url: SITE.origin, email: SITE.email }
    ]
  };

  const body = `<section class="hero">
  <div class="wrap">
    <h1>${esc(SITE.brand)}</h1>
    <p class="tagline">${esc(SITE.tagline)}</p>
    <p class="sub">Convert, calculate, compress, format, generate and edit files with fast, free online tools. No sign-up, no watermarks, and most tools run entirely in your browser.</p>
    <div class="hero-search">
      ${ICONS.search}
      <label class="sr-only" for="hero-q">Search tools</label>
      <input type="search" id="hero-q" data-search-input placeholder="Search ${TOOLS.length}+ free tools…" autocomplete="off" spellcheck="false">
    </div>
    <div class="hero-stats">
      <span><b>${TOOLS.length}</b> working tools</span>
      <span><b>${CATEGORIES.length}</b> categories</span>
      <span><b>No</b> sign-up required</span>
      <span><b>Most</b> run without uploading your files</span>
    </div>
  </div>
</section>

<div class="wrap">${adSlot('home-below-hero', 'leaderboard')}</div>

<section class="section" aria-labelledby="h-pop">
  <div class="wrap">
    <div class="section-head">
      <h2 id="h-pop">Popular tools</h2>
      <a href="/tools">Browse all ${TOOLS.length} →</a>
    </div>
    <div class="grid grid-4">${popular.map(t => toolTile(t, { badge: 'Popular' })).join('')}</div>
  </div>
</section>

<section class="section" aria-labelledby="h-cat">
  <div class="wrap">
    <div class="section-head"><h2 id="h-cat">Browse by category</h2></div>
    <div class="grid grid-3">
      ${CATEGORIES.map(c => `<a class="cat-tile" href="/tools/${c.slug}">
        <div class="ct-name"><span aria-hidden="true">${esc(c.icon)}</span>${esc(c.name)}
          <span class="ct-count">${toolsInCategory(c.slug).length}</span></div>
        <p>${esc(c.tagline)}</p>
      </a>`).join('')}
    </div>
  </div>
</section>

<section class="section" aria-labelledby="h-feat">
  <div class="wrap">
    <div class="section-head"><h2 id="h-feat">Featured tools</h2></div>
    <div class="grid grid-4">${featured.map(t => toolTile(t)).join('')}</div>
  </div>
</section>

<section class="section" data-shelf="recent" hidden aria-labelledby="h-recent">
  <div class="wrap">
    <div class="section-head"><h2 id="h-recent">Recently used</h2></div>
    <div class="grid grid-4" data-shelf-body></div>
  </div>
</section>

<section class="section" data-shelf="favourite" hidden aria-labelledby="h-fav">
  <div class="wrap">
    <div class="section-head"><h2 id="h-fav">Your favourites</h2></div>
    <div class="grid grid-4" data-shelf-body></div>
  </div>
</section>

<section class="section" aria-labelledby="h-why">
  <div class="wrap">
    <div class="section-head"><h2 id="h-why">Why Mega Tools</h2></div>
    <div class="grid grid-2" style="gap:26px">
      <div class="prose" style="max-width:none">
        <h3 style="margin-top:0">Every tool actually works</h3>
        <p>There are no placeholders here and no "coming soon" pages. If a tool says it merges PDFs, it merges PDFs — and it is tested with real files before it ships. Each page also states what its tool <em>cannot</em> do, because knowing the limits saves more time than an optimistic description.</p>
        <h3>Your files usually stay on your device</h3>
        <p>The image and PDF tools run in your browser using the canvas API and client-side PDF libraries. Your files are never uploaded, which means they are faster, private by default, and usable on documents you would not send to a stranger's server. Where a tool has a real limitation — a browser that cannot encode WebP, a PDF that cannot be read without its password — it says so rather than failing quietly.</p>
      </div>
      <div class="prose" style="max-width:none">
        <h3 style="margin-top:0">Fast, because nothing is loaded that you do not need</h3>
        <p>Each tool page is a real HTML document that ships only its own code. Opening the Age Calculator does not download the PDF libraries; opening the JSON Formatter does not download the image processing. There is no framework, no tracking pixel and no cookie banner, because there is nothing to consent to.</p>
        <h3>No account, no watermark, no limits</h3>
        <p>Nothing here asks you to sign up, and no output is stamped with a logo or capped at three uses a day. The site is free to use and supported by advertising, kept to placements that sit outside the tool itself so they never interfere with a control or a download button.</p>
      </div>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="h-all">
  <div class="wrap">
    <div class="section-head">
      <h2 id="h-all">All tools</h2>
      <a href="/tools">Search and filter →</a>
    </div>
    ${CATEGORIES.map(c => `<h3 style="margin-top:1.6rem">${esc(c.icon)} <a href="/tools/${c.slug}">${esc(c.name)}</a></h3>
    <div class="grid grid-4">${toolsInCategory(c.slug).map(t => toolTile(t)).join('')}</div>`).join('')}
  </div>
</section>`;

  return page({
    title: SITE.brand,
    description: SITE.description,
    canonical: SITE.origin + '/',
    schema,
    body,
    bodyAttrs: 'data-page="home"'
  });
}

/* ------------------------------------------------------------------ */
/* tool index and category pages                                      */
/* ------------------------------------------------------------------ */

function filterScript() {
  return `<script defer>
document.addEventListener('DOMContentLoaded', function () {
  var q = document.getElementById('filter');
  var tiles = Array.prototype.slice.call(document.querySelectorAll('[data-tile]'));
  var groups = Array.prototype.slice.call(document.querySelectorAll('[data-group]'));
  var empty = document.getElementById('no-results');
  var count = document.getElementById('shown-count');
  if (!q) return;
  function run() {
    var v = q.value.trim().toLowerCase();
    var shown = 0;
    tiles.forEach(function (el) {
      var hit = !v || el.getAttribute('data-tile').indexOf(v) !== -1;
      el.hidden = !hit;
      if (hit) shown++;
    });
    groups.forEach(function (g) {
      g.hidden = !Array.prototype.some.call(g.querySelectorAll('[data-tile]'), function (t) { return !t.hidden; });
    });
    if (empty) empty.hidden = shown > 0;
    if (count) count.textContent = shown;
    if (window.MT && v.length > 2) MT.track('search_query', { q: v, hits: shown, where: 'index' });
  }
  q.addEventListener('input', run);
  var params = new URLSearchParams(location.search);
  if (params.get('q')) { q.value = params.get('q'); run(); }
});
</script>`;
}

function tileFiltered(t) {
  const key = [t.name, t.slug, t.desc, (t.keywords || []).join(' '), t.category].join(' ').toLowerCase();
  return `<div data-tile="${esc(key)}">${toolTile(t)}</div>`;
}

function toolsIndexPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.origin },
          { '@type': 'ListItem', position: 2, name: 'All tools', item: url('/tools') }
        ]
      },
      {
        '@type': 'CollectionPage',
        name: 'All tools',
        url: url('/tools'),
        description: `Every tool on ${SITE.name}, grouped by category.`
      }
    ]
  };

  const body = `<div class="wrap section" style="padding-bottom:0">
  <nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li><span aria-current="page">All tools</span></li></ol></nav>
  <h1>All ${TOOLS.length} tools</h1>
  <p class="lede">Every tool on the site, grouped by category. Each one has its own page with instructions, an explanation of how it works, and answers to the questions people actually ask about it.</p>
  <div class="filterbar" style="margin-top:22px">
    <label class="sr-only" for="filter">Filter tools</label>
    <input type="search" id="filter" placeholder="Filter by name, keyword or category…" autocomplete="off">
    <div class="chips">${CATEGORIES.map(c => `<a class="chip" href="/tools/${c.slug}">${esc(c.icon)} ${esc(c.short)}</a>`).join('')}</div>
  </div>
  <p class="hint"><span id="shown-count">${TOOLS.length}</span> tools shown</p>
</div>

<div class="wrap">${adSlot('index-top', 'leaderboard')}</div>

<div class="wrap" style="padding-bottom:40px">
  <div class="empty-state" id="no-results" hidden>
    <p><strong>No tools match that.</strong></p>
    <p>Try a broader word like “pdf”, “image”, “convert” or “calculator”.</p>
  </div>
  ${CATEGORIES.map(c => `<section data-group aria-labelledby="g-${c.slug}">
    <div class="section-head" style="margin-top:34px">
      <h2 id="g-${c.slug}" style="margin:0"><a href="/tools/${c.slug}">${esc(c.icon)} ${esc(c.name)}</a></h2>
      <span class="ct-count">${toolsInCategory(c.slug).length} tools</span>
    </div>
    <div class="grid grid-4">${toolsInCategory(c.slug).map(tileFiltered).join('')}</div>
  </section>`).join('')}
</div>`;

  return page({
    title: `All ${TOOLS.length} Free Online Tools`,
    description: `Browse all ${TOOLS.length} free online tools on ${SITE.name} — PDF, image, developer, calculator, text, converter and security tools. No sign-up required.`,
    canonical: url('/tools'),
    schema,
    body,
    bodyAttrs: 'data-page="tools-index"',
    extraJs: filterScript()
  });
}

function categoryPage(cat) {
  const tools = toolsInCategory(cat.slug);
  const others = CATEGORIES.filter(c => c.slug !== cat.slug);

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.origin },
          { '@type': 'ListItem', position: 2, name: 'Tools', item: url('/tools') },
          { '@type': 'ListItem', position: 3, name: cat.name, item: url(`/tools/${cat.slug}`) }
        ]
      },
      {
        '@type': 'CollectionPage',
        name: cat.name,
        url: url(`/tools/${cat.slug}`),
        description: cat.tagline,
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: tools.length,
          itemListElement: tools.map((t, i) => ({
            '@type': 'ListItem', position: i + 1, name: t.name, url: url(`/tools/${t.slug}`)
          }))
        }
      }
    ]
  };

  const body = `<div class="wrap section" style="padding-bottom:0">
  <nav class="crumbs" aria-label="Breadcrumb">
    <ol><li><a href="/">Home</a></li><li><a href="/tools">Tools</a></li><li><span aria-current="page">${esc(cat.name)}</span></li></ol>
  </nav>
  <span class="path-chip">/tools/${esc(cat.slug)}</span>
  <h1>${esc(cat.icon)} ${esc(cat.name)}</h1>
  <p class="lede">${cat.intro}</p>
  <div class="filterbar" style="margin-top:22px">
    <label class="sr-only" for="filter">Filter ${esc(cat.short)} tools</label>
    <input type="search" id="filter" placeholder="Filter ${tools.length} ${esc(cat.short.toLowerCase())} tools…" autocomplete="off">
    <span class="hint" style="margin:0"><span id="shown-count">${tools.length}</span> of ${tools.length}</span>
  </div>
</div>

<div class="wrap section" style="padding-top:20px">
  <div class="empty-state" id="no-results" hidden><p><strong>No tools match that.</strong> Clear the filter to see all ${tools.length}.</p></div>
  <div data-group><div class="grid grid-3">${tools.map(tileFiltered).join('')}</div></div>
</div>

<div class="wrap">${adSlot('category-mid', 'leaderboard')}</div>

<div class="wrap section" style="padding-top:0">
  <div class="prose">
    <h2>About ${esc(cat.name.toLowerCase())}</h2>
    ${cat.body}
  </div>
</div>

<div class="wrap section" style="padding-top:0">
  <div class="section-head"><h2>Most used in this category</h2></div>
  <div class="grid grid-4">${tools.slice(0, 4).map(t => toolTile(t, { badge: 'Popular' })).join('')}</div>
</div>

<div class="wrap section" style="padding-top:0;padding-bottom:44px">
  <div class="section-head"><h2>Other categories</h2></div>
  <div class="grid grid-3">
    ${others.map(c => `<a class="cat-tile" href="/tools/${c.slug}">
      <div class="ct-name"><span aria-hidden="true">${esc(c.icon)}</span>${esc(c.name)}<span class="ct-count">${toolsInCategory(c.slug).length}</span></div>
      <p>${esc(c.tagline)}</p>
    </a>`).join('')}
  </div>
</div>`;

  return page({
    title: `${cat.name} — ${tools.length} Free Online Tools`,
    description: `${cat.tagline} ${tools.length} free ${cat.short.toLowerCase()} tools that work in your browser, with no sign-up and no watermarks.`,
    canonical: url(`/tools/${cat.slug}`),
    schema,
    body,
    bodyAttrs: `data-page="category" data-category="${esc(cat.slug)}"`,
    extraJs: filterScript()
  });
}

/* ------------------------------------------------------------------ */
/* trust pages, 404                                                   */
/* ------------------------------------------------------------------ */

function simplePage({ slug, title, description, h1, content }) {
  const body = `<div class="wrap section">
  <nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li><span aria-current="page">${esc(h1)}</span></li></ol></nav>
  <h1>${esc(h1)}</h1>
  <div class="prose">${content}</div>
</div>`;
  return {
    slug,
    html: page({
      title, description,
      canonical: url('/' + slug),
      schema: {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.origin },
          { '@type': 'ListItem', position: 2, name: h1, item: url('/' + slug) }
        ]
      },
      body,
      bodyAttrs: `data-page="${esc(slug)}"`
    })
  };
}

const TRUST_PAGES = () => [
  simplePage({
    slug: 'about',
    title: 'About Mega Tools',
    description: `What ${SITE.name} is, who runs it, how the tools work and how the site is funded.`,
    h1: 'About Mega Tools',
    content: `<p>${SITE.name} is a collection of ${TOOLS.length} free online utilities — the small, specific jobs that come up constantly and do not deserve a software installation. Merging a PDF. Resizing an image. Formatting a JSON response. Working out what a loan actually costs.</p>

<h2>What we are trying to do</h2>
<p>Most free tool sites share the same problems: half the tools do not work, the useful ones are behind a sign-up, output arrives watermarked, and the pages are so cluttered with advertising that finding the download button is a puzzle.</p>
<p>The aim here is narrower and duller. Every tool works. Every tool page explains what the tool does, how to use it, and — importantly — what it cannot do. There is no account, no watermark and no daily limit.</p>

<h2>How the tools work</h2>
<p>Most of them run entirely in your browser. The image tools use the canvas API; the PDF tools use client-side PDF libraries; the calculators, converters and text tools are plain JavaScript. That means your files are not uploaded, not stored and not seen by anyone. It also makes them fast, since there is no round trip to a server.</p>
<p>Each tool page loads only its own code. Opening a calculator does not download the PDF libraries. There is no framework, no tracking pixel and no cookie banner — because there is nothing set that would require one.</p>
<p>Where a tool has a real limitation, the page says so. A browser that cannot encode WebP. A PDF that cannot be opened without its password. A scanned document with no text to extract. Being told why something will not work is more useful than a spinner that never finishes.</p>

<h2>How the site is funded</h2>
<p>Advertising. That is the whole model — no subscriptions, no premium tier, no upsells. Ads are placed in fixed slots outside the tool itself, so they never sit beside a control or disguise themselves as a download button. If an advertisement here is ever confusing or deceptive, please report it via the <a href="/contact">contact page</a>.</p>

<h2>What comes next</h2>
<p>More tools, added one at a time, each held to the same standard: it works with real input, it handles bad input gracefully, and its page tells you something worth knowing. The registry the site is built on makes adding a tool straightforward, but quantity is not the goal — a hundred tools that work beats a thousand that do not.</p>

<p>Questions, bug reports and suggestions are welcome at <a href="mailto:${esc(SITE.email)}">${esc(SITE.email)}</a>.</p>`
  }),
  simplePage({
    slug: 'privacy',
    title: 'Privacy Policy',
    description: `How ${SITE.name} handles your data — what stays on your device, what is stored locally, and what advertising involves.`,
    h1: 'Privacy Policy',
    content: `<p class="hint">Last updated ${BUILT}.</p>

<h2>The short version</h2>
<p>We do not have accounts, so we hold no account data. The great majority of the tools process your files and text entirely inside your browser, so that content never reaches us. What we do collect is limited to anonymous usage statistics, and advertising, which is explained below.</p>

<h2>Your files and text</h2>
<p>Every tool on this site currently processes your input on your own device. Images are handled with the browser canvas API; PDFs with client-side libraries; text, calculations and conversions in plain JavaScript. Your files are never transmitted to us, never stored, and never visible to anyone but you.</p>
<p>This is verifiable rather than a promise: open your browser's network panel and use any tool. You will see no request carrying your data. You can also disconnect from the internet and most tools will keep working.</p>
<p>If a tool ever does need to send data to a server, its page will say so plainly, on the page, before you use it. We will not describe a tool as private if it is not.</p>

<h2>What is stored in your browser</h2>
<p>We use your browser's local storage — not cookies — for three things: your theme preference, your list of favourite tools, and your recently used tools. This information stays on your device, is never sent to us, and can be cleared at any time by clearing site data in your browser settings.</p>

<h2>Analytics</h2>
<p>We record anonymous usage events: which pages are viewed, which tools are used, and what people search for on the site. This tells us which tools are worth improving and which are missing. We do not collect names, email addresses, IP-based profiles or any content you put into a tool. Search terms are recorded as typed, so please do not enter personal information into the search box.</p>

<h2>Advertising</h2>
<p>The site is funded by display advertising. Advertising partners may set their own cookies or use similar technologies to measure and target ads, in accordance with their own privacy policies. This is the one part of the site where a third party is involved, and it is the reason this policy exists at all.</p>
<p>You can limit ad personalisation through your browser settings, your device's advertising controls, or industry opt-out pages such as the Digital Advertising Alliance and Your Online Choices. Ad blockers work fine here and we do not detect or block them.</p>

<h2>Children</h2>
<p>This site is not directed at children under 13 and we do not knowingly collect information from them.</p>

<h2>Your rights</h2>
<p>Because we hold no personal data tied to you, there is generally nothing for us to retrieve or delete. Local data can be removed by clearing site data in your browser. If you have a question about data protection, contact us at <a href="mailto:${esc(SITE.email)}">${esc(SITE.email)}</a>.</p>

<h2>Changes</h2>
<p>If this policy changes, the date at the top will change with it. Material changes will be noted on the page.</p>`
  }),
  simplePage({
    slug: 'terms',
    title: 'Terms of Use',
    description: `The terms that apply when you use ${SITE.name} — acceptable use, disclaimers and limitations.`,
    h1: 'Terms of Use',
    content: `<p class="hint">Last updated ${BUILT}.</p>

<p>By using ${SITE.name} you agree to these terms. They are deliberately short.</p>

<h2>Using the site</h2>
<p>The tools are free to use, for personal and commercial work alike, with no account and no attribution required. You keep all rights to any file you process — we claim nothing over your content, and since almost everything runs in your browser, we never receive it in the first place.</p>

<h2>What you must not do</h2>
<ul>
<li>Use the tools to process material you have no right to process, or for anything unlawful.</li>
<li>Attempt to circumvent technical protections on files, including password protection or copy restrictions.</li>
<li>Automate access in a way that degrades the service for others.</li>
<li>Republish the site's content as your own.</li>
</ul>

<h2>No warranty</h2>
<p>The tools are provided "as is". We test them, but no software is free of defects, and browsers differ. <strong>Always keep an original copy of any file before processing it.</strong> Nothing here modifies your original file — every tool produces a new one — but a download can fail, a browser can run out of memory, and a result can be wrong.</p>

<h2>Calculators are estimates</h2>
<p>Financial, health and date calculators are informational tools, not professional advice. Lenders, tax authorities, payroll systems and clinicians apply their own rules, rounding and judgement. Do not rely on any figure here for a financial, legal, tax or medical decision. Consult a qualified professional.</p>

<h2>Limitation of liability</h2>
<p>To the fullest extent permitted by law, ${SITE.name} is not liable for any loss or damage arising from use of this site, including lost data, lost profits, or decisions made on the basis of a calculated result. Some jurisdictions do not allow certain exclusions, in which case the narrowest permitted exclusion applies.</p>

<h2>Third-party content</h2>
<p>The site displays advertising and links to external sites. We do not control their content and are not responsible for it.</p>

<h2>Changes and contact</h2>
<p>Tools may be added, changed or removed at any time, and these terms may be updated — the date above will reflect it. Questions: <a href="mailto:${esc(SITE.email)}">${esc(SITE.email)}</a>.</p>`
  }),
  simplePage({
    slug: 'contact',
    title: 'Contact Mega Tools',
    description: `Get in touch with ${SITE.name} — report a bug, suggest a tool, or ask about advertising.`,
    h1: 'Contact',
    content: `<p>Email is the fastest way to reach us: <a href="mailto:${esc(SITE.email)}"><strong>${esc(SITE.email)}</strong></a></p>

<h2>Reporting a problem with a tool</h2>
<p>Bug reports are genuinely welcome, and a few details make them far easier to act on:</p>
<ul>
<li>The tool's URL — for example <code>/tools/pdf-merger</code>.</li>
<li>What you did, what you expected, and what happened instead.</li>
<li>Your browser and operating system.</li>
<li>Roughly what the input was — file type and size. <strong>Please do not attach confidential files.</strong> A description is almost always enough, since we can reproduce the problem with a similar file.</li>
</ul>
<p>If a browser console error appeared, copying it in helps a great deal.</p>

<h2>Suggesting a tool</h2>
<p>Tell us what you are trying to do rather than what the tool should be called — the underlying problem is more useful than a feature request. Tools are more likely to be built when they solve a real recurring task, can work reliably in a browser, and do not depend on a paid external service.</p>

<h2>Advertising</h2>
<p>For advertising enquiries, email us with "Advertising" in the subject line.</p>

<h2>Privacy and legal</h2>
<p>For questions about data protection, or anything relating to the <a href="/privacy">privacy policy</a> or <a href="/terms">terms of use</a>, use the same address and we will route it appropriately.</p>

<h2>Response times</h2>
<p>This is a small operation. We read everything and reply to most messages within a few days. Bug reports affecting a broken tool get priority.</p>`
  })
];

function notFoundPage() {
  const body = `<div class="wrap section" style="text-align:center;padding-top:56px">
  <span class="path-chip">HTTP 404</span>
  <h1>That page does not exist</h1>
  <p class="lede" style="margin:0 auto 26px">The tool may have been renamed, or the link may be wrong. Search below, or pick one of the popular tools.</p>
  <div class="hero-search" style="margin:0 auto 30px">
    ${ICONS.search}
    <label class="sr-only" for="nf-q">Search tools</label>
    <input type="search" id="nf-q" data-search-input placeholder="Search ${TOOLS.length}+ tools…" autocomplete="off">
  </div>
  <div class="chips" style="justify-content:center;margin-bottom:34px">
    <a class="chip" href="/">Home</a>
    <a class="chip" href="/tools">All tools</a>
    ${CATEGORIES.map(c => `<a class="chip" href="/tools/${c.slug}">${esc(c.short)}</a>`).join('')}
  </div>
</div>
<div class="wrap section" style="padding-top:0">
  <div class="section-head"><h2>Popular tools</h2></div>
  <div class="grid grid-4">${popularTools(8).map(t => toolTile(t)).join('')}</div>
</div>`;
  // No ad slots here: a 404 is a dead end with no publisher content of value.
  return page({
    title: 'Page not found',
    description: 'That page could not be found. Search the tool index or browse by category.',
    canonical: url('/404'),
    body,
    bodyAttrs: 'data-page="404"'
  });
}

/* ------------------------------------------------------------------ */
/* sitemap, robots, search index, icons                               */
/* ------------------------------------------------------------------ */

function sitemap() {
  const entries = [
    { loc: SITE.origin + '/', pri: '1.0', freq: 'weekly' },
    { loc: url('/tools'), pri: '0.9', freq: 'weekly' },
    ...CATEGORIES.map(c => ({ loc: url(`/tools/${c.slug}`), pri: '0.8', freq: 'weekly' })),
    ...TOOLS.map(t => ({
      loc: url(`/tools/${t.slug}`),
      pri: t.featured ? '0.8' : (t.popularity >= 85 ? '0.7' : '0.6'),
      freq: 'monthly'
    })),
    ...['about', 'privacy', 'terms', 'contact'].map(s => ({ loc: url('/' + s), pri: '0.3', freq: 'yearly' }))
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(e => `  <url>
    <loc>${e.loc}</loc>
    <lastmod>${BUILT}</lastmod>
    <changefreq>${e.freq}</changefreq>
    <priority>${e.pri}</priority>
  </url>`).join('\n')}
</urlset>
`;
}

function robots() {
  return `# ${SITE.name}
User-agent: *
Allow: /

# Nothing is disallowed. CSS and JavaScript must stay crawlable so that
# search engines can render and evaluate the tool pages correctly.

Sitemap: ${url('/sitemap.xml')}
`;
}

function searchIndex() {
  return JSON.stringify(TOOLS.map(t => ({
    s: t.slug,
    n: t.name,
    d: t.desc,
    c: CATEGORY_BY_SLUG[t.category].name,
    i: t.icon || '⚙',
    k: (t.keywords || []).join(' '),
    p: t.popularity || 0
  })));
}

const FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<rect width="64" height="64" rx="14" fill="#0e1116"/>
<text x="32" y="42" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="26" font-weight="700" fill="#fff" text-anchor="middle" letter-spacing="-1">MT</text>
</svg>`;

const OG_IMAGE = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#ffffff"/>
<rect x="0" y="0" width="1200" height="8" fill="#0e1116"/>
<rect x="72" y="86" width="64" height="64" rx="16" fill="#0e1116"/>
<text x="104" y="130" font-family="ui-monospace,Menlo,monospace" font-size="26" font-weight="700" fill="#fff" text-anchor="middle" letter-spacing="-1">MT</text>
<text x="72" y="290" font-family="-apple-system,Segoe UI,Helvetica,Arial,sans-serif" font-size="96" font-weight="800" fill="#0e1116" letter-spacing="-4">MEGA TOOLS</text>
<text x="72" y="356" font-family="-apple-system,Segoe UI,Helvetica,Arial,sans-serif" font-size="38" font-weight="500" fill="#2b323b">Free tools for everything you do online.</text>
<text x="72" y="424" font-family="ui-monospace,Menlo,monospace" font-size="24" fill="#626c77">${TOOLS.length} working tools · no sign-up · runs in your browser</text>
<rect x="72" y="486" width="1056" height="1" fill="#e2e5ea"/>
<text x="72" y="540" font-family="ui-monospace,Menlo,monospace" font-size="22" fill="#626c77">PDF · IMAGE · DEVELOPER · CALCULATORS · TEXT · CONVERTERS · SECURITY</text>
</svg>`;

/* ------------------------------------------------------------------ */
/* build                                                              */
/* ------------------------------------------------------------------ */

async function build() {
  const t0 = Date.now();
  console.log('\n  MEGA TOOLS — build\n  ' + '─'.repeat(46));

  const errors = validate();
  if (errors.length) {
    console.error('\n  Registry validation failed:\n');
    errors.forEach(e => console.error('   ✗ ' + e));
    console.error('\n  Nothing was written. Fix the errors above and rebuild.\n');
    process.exit(1);
  }
  console.log(`  ✓ registry valid — ${TOOLS.length} tools, ${CATEGORIES.length} categories`);

  if (existsSync(OUT)) await rm(OUT, { recursive: true });
  await mkdir(OUT, { recursive: true });

  // assets
  await mkdir(path.join(OUT, 'assets'), { recursive: true });
  for (const f of ['site.css', 'shell.js', 'tool-runtime.js']) {
    await cp(path.join(SRC, 'assets', f), path.join(OUT, 'assets', f));
  }
  await writeFile(path.join(OUT, 'favicon.svg'), FAVICON);
  await writeFile(path.join(OUT, 'og.svg'), OG_IMAGE);

  // pages
  await emit('/', homePage());
  await emit('tools', toolsIndexPage());
  for (const c of CATEGORIES) await emit(path.join('tools', c.slug), categoryPage(c));
  for (const t of TOOLS) await emit(path.join('tools', t.slug), toolPage(t));
  for (const p of TRUST_PAGES()) await emit(p.slug, p.html);

  await writeFile(path.join(OUT, '404.html'), notFoundPage());
  await writeFile(path.join(OUT, 'sitemap.xml'), sitemap());
  await writeFile(path.join(OUT, 'robots.txt'), robots());
  await writeFile(path.join(OUT, 'search-index.json'), searchIndex());

  // Host config so clean URLs and the 404 work on common static hosts.
  await writeFile(path.join(OUT, '_redirects'), '/*  /404.html  404\n');
  await writeFile(path.join(OUT, 'vercel.json'), JSON.stringify({
    cleanUrls: true,
    trailingSlash: false,
    headers: [
      { source: '/assets/(.*)', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
      { source: '/(.*)', headers: [{ key: 'X-Content-Type-Options', value: 'nosniff' }, { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }] }
    ]
  }, null, 2));

  const total = 2 + CATEGORIES.length + TOOLS.length + 4 + 1;
  console.log(`  ✓ ${total} HTML pages written`);
  console.log(`  ✓ sitemap.xml — ${2 + CATEGORIES.length + TOOLS.length + 4} URLs`);
  console.log(`  ✓ robots.txt, search-index.json, favicon, og image`);
  console.log(`  ─ output: dist/`);
  console.log(`  ─ built in ${Date.now() - t0}ms\n`);
}

build().catch(e => {
  console.error('\n  Build failed:', e);
  process.exit(1);
});
