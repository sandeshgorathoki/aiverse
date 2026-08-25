# MEGA TOOLS

**Free tools for everything you do online.**

A production static site: **62 working tools** across 7 categories, each on its own
crawlable URL, built from a single registry. No framework, no runtime dependencies,
no backend. Every tool runs in the visitor's browser.

```bash
npm install         # dev-only tooling (jsdom, canvas, pdf-lib, pdfjs-dist) — the site itself has zero deps
npm run build       # → dist/  (76 HTML pages, sitemap, robots, search index)
npm test            # 200 assertions — the 45 pure-logic tools
npm run test:real   # 42 assertions — the 17 image/PDF tools, against real Cairo + real pdf.js
npm run audit       # 58 checks against the generated HTML
npm run verify      # all four, in order
npm run serve       # http://localhost:8099
```

**All 62 tools pass 300 assertions across every suite** — including the 17 image
and PDF tools, verified against real Cairo rendering and a real pdf.js parser,
not mocks. See `TESTING.md` for the full matrix, and for a real bug this process
caught and fixed (PDF-to-JPG was silently rendering blank pages for a common
font case — now fixed and covered by a pixel-content assertion).

---

## Note on the brief

The brief opened by asking for an audit of an existing WhiteMouseAI codebase. No
codebase was supplied, and you then confirmed you wanted to start from scratch and
retire the old site — so this is a clean build. Nothing was migrated and nothing
was destroyed. Point your domain at `dist/` when you are ready to cut over.

---

## Architecture

```
src/
  registry.js          Single source of truth: site config, categories, validation
  build.mjs            Static site generator — reads the registry, writes dist/
  tools/
    pdf.js             8 tools   (pdf-lib + pdf.js, lazy-loaded)
    image.js           9 tools   (canvas)
    developer.js      14 tools   (pure JS)
    calculators.js    12 tools   (pure JS)
    text.js            9 tools   (pure JS)
    converters.js      7 tools   (pure JS)
    security.js        3 tools   (Web Crypto)
  assets/
    site.css           Design system — light default, dark + system supported
    shell.js           Theme, search, favourites, recents, analytics abstraction
    tool-runtime.js    Shared helpers every tool page loads
test/
  tools.test.mjs       Boots each pure-logic tool in a DOM and drives it (45 tools)
  real-engine.test.mjs Same, wired to real node-canvas + real pdf.js (17 tools)
  output.test.mjs      Audits the generated HTML
scripts/
  serve.mjs            Local static server
  preview.mjs          Builds self-contained single-file previews
  testing-matrix.mjs   Generates TESTING.md from the registry
```

### The registry is the product

A tool is one object. The build derives everything else from it — the page, the
metadata, the schema, the sitemap entry, the internal links, the category listing
and the search index.

```js
{
  slug: 'json-formatter',           // → /tools/json-formatter
  name: 'JSON Formatter',
  icon: '{ }',
  category: 'developer',
  desc: '…',                        // tile copy
  seoTitle: '…',                    // ≤60 chars, build fails otherwise
  metaDescription: '…',             // 70–170 chars, build fails otherwise
  keywords: [ … ],                  // search index only, never rendered
  popularity: 99, featured: true,   // ranking
  related: [ 'json-validator', … ], // internal linking
  intro: '…',                       // lede under the H1
  html: `…`,                        // the tool interface
  init() { … },                     // the tool's behaviour, serialised into the page
  howto: [ … ],                     // ≥2 steps
  sections: [ { h, p } ],           // ≥120 words of tool-specific explanation
  faq: [ { q, a } ]                 // ≥3 genuine questions
}
```

### Adding tool #63

1. Write the object in the right `src/tools/*.js` module.
2. Add its slug to `related` on two or three neighbours.
3. `npm run build`.

That is the whole process. No routing, no config, no build change. The sitemap,
category page, search index, footer and internal links all pick it up.

The build **refuses to ship** a tool that fails validation: a duplicate slug, an
over-long title, a description outside 70–170 characters, fewer than three FAQs,
under 120 words of explanation, a broken related-tool link, or a category with no
tools. This is what stops the registry drifting into thin pages as it grows.

---

## Why static HTML

Each tool is a real file at `dist/tools/<slug>/index.html`. Disable JavaScript and
you still get the H1, the lede, the instructions, the explanation, the FAQ, the
breadcrumbs and the internal links — every tool page carries over 500 words of
crawlable text before a single script runs. Only the interactive part needs JS,
and it says so in a `<noscript>` block.

**Code splitting is inherent.** Each page inlines only its own tool code. The Age
Calculator page is 24 KB and loads no PDF library; PDF pages fetch pdf-lib lazily
on first use, not on page load. The audit asserts this rather than assuming it:

```
✓ PDF libraries appear only on PDF tool pages
✓ homepage does not carry image tool code
✓ age calculator page is small (24 KB)
```

---

## SEO

Handled at build time, verified by `npm run audit`:

- Unique title, meta description and canonical on all 76 pages
- Visible, crawlable breadcrumbs on every page
- JSON-LD: `WebSite`, `Organization`, `SoftwareApplication`, `BreadcrumbList`, and
  `FAQPage` **only where the FAQ is genuinely rendered** — the audit fails if the
  schema and the visible page disagree
- Open Graph and Twitter cards, with a generated SVG social image
- `sitemap.xml` regenerated from the registry on every build (75 URLs)
- `robots.txt` that blocks nothing, including CSS and JS
- Every tool reachable through plain `<a href>` links from the homepage, its
  category page and the tool index — discovery never depends on JS search

Deliberately **not** done: no `/convert-x-to-y` combinatorial pages, no
auto-generated variants, no keyword stuffing. 62 pages that each contain a working
tool, rather than thousands that do not.

---

## Privacy

Every current tool processes input in the browser. Images go through canvas, PDFs
through client-side libraries, everything else is plain JavaScript. No file is
uploaded.

The test suite enforces the honesty of that claim — a tool whose UI says "stays on
your device" while its code contains `fetch` or `XMLHttpRequest` fails the build:

```
✓ no tool claims local processing while making network calls
```

Local storage holds three things: theme preference, favourites and recent tools.
No cookies are set, so there is no consent banner.

---

## Advertising

`adSlot(placement, size)` in `build.mjs` is the only way an ad reaches a page.
Slots are labelled "Advertisement", sized responsively, and placed **outside** the
tool interface — below the app and below the content. The audit enforces this:

```
✓ tool page has a sane number of ad slots (2)
✓ ads are labelled as advertisements
✓ no ad slot inside the tool interface
✓ 404 page carries no advertising
```

To go live, replace the placeholder markup in `adSlot()` with your AdSense unit.
Nothing else changes. Do not add slots inside `#tool-root`; the audit will fail,
which is the point.

---

## Analytics

`MT.analytics` in `shell.js` is a provider-agnostic sink. Events are queued until
one is attached:

```js
MT.analytics.use(payload => plausible(payload.event, { props: payload.props }));
```

Emitted: `page_view`, `tool_view`, `tool_input`, `tool_complete`, `tool_copy`,
`tool_download`, `search_query`, `favorite_add`, `theme_change`. No personal data,
no content from any tool.

---

## Deployment

`dist/` is a plain static directory — Netlify, Vercel, Cloudflare Pages, S3 or
nginx. Clean URLs come from the directory structure, so no rewrite rules are
needed. `vercel.json` and `_redirects` ship with cache headers and 404 handling.

**Before launch:**

1. Set `SITE.origin` in `src/registry.js` to your real domain — it drives every
   canonical URL and the sitemap.
2. Do a manual pass in real browsers (Chrome, Firefox, Safari, mobile) for the
   17 image/PDF tools. Their logic is verified against real Cairo rendering and
   a real pdf.js parser (see `TESTING.md`) — what's left is real-browser-only
   territory the test suite can't reach: Safari's stricter canvas memory
   limits, mobile touch/drag timing on the cropper, and actual CDN latency
   fetching pdf-lib/pdf.js on first use.
3. Insert your AdSense unit into `adSlot()`.
4. Attach an analytics provider via `MT.analytics.use()`.
5. Update the contact address in `SITE.email`.

---

## Roadmap to 200 tools

The architecture does not change. Categories already defined in the brief but
carrying no tools yet — SEO, Social Media, AI, File — were deliberately **not**
created, because an empty category page is a thin page. Add the tools first; the
category appears when it has something in it.

Good next candidates, on the same standard of "must genuinely work in a browser":
QR code generator, CSV to JSON, Markdown to HTML, cron expression explainer, JWT
decoder, image colour palette extractor, EXIF viewer and remover, favicon
generator, aspect ratio calculator, unit price comparison.
