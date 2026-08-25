// MEGA TOOLS — build output audit
// Checks the generated HTML rather than the source: what a crawler actually gets.

import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TOOLS, CATEGORIES, SITE } from '../src/registry.js';

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
let pass = 0, fail = 0;
const problems = [];

function check(cond, label, detail) {
  if (cond) { pass++; return true; }
  fail++;
  problems.push(label + (detail ? ' — ' + detail : ''));
  return false;
}

const read = p => readFileSync(path.join(OUT, p), 'utf8');
const html = route => read(path.join(route, 'index.html'));

console.log('\n  MEGA TOOLS — output audit\n  ' + '─'.repeat(56));

/* ---------- files exist ---------- */
for (const f of ['index.html', 'sitemap.xml', 'robots.txt', '404.html', 'search-index.json',
                 'favicon.svg', 'og.svg', 'assets/site.css', 'assets/shell.js', 'assets/tool-runtime.js']) {
  check(existsSync(path.join(OUT, f)), `exists: ${f}`);
}

/* ---------- every tool has a crawlable page ---------- */
let missing = 0;
for (const t of TOOLS) {
  if (!existsSync(path.join(OUT, 'tools', t.slug, 'index.html'))) { missing++; problems.push('no page for ' + t.slug); }
}
check(missing === 0, `all ${TOOLS.length} tools have their own crawlable URL`);
for (const c of CATEGORIES) {
  check(existsSync(path.join(OUT, 'tools', c.slug, 'index.html')), `category page: /tools/${c.slug}`);
}

/* ---------- per-tool page quality ---------- */
const titles = new Set(), descs = new Set();
let noH1 = 0, dupTitle = 0, dupDesc = 0, noCanon = 0, noCrumb = 0, noSchema = 0,
    noFaqVisible = 0, thin = 0, longTitle = 0, noInternalLinks = 0;

for (const t of TOOLS) {
  const h = html(path.join('tools', t.slug));

  if (!/<h1[^>]*>/.test(h)) noH1++;
  const title = (h.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  if (titles.has(title)) dupTitle++; titles.add(title);
  if (title.length > 70) longTitle++;

  const desc = (h.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  if (descs.has(desc)) dupDesc++; descs.add(desc);

  if (!h.includes(`<link rel="canonical" href="${SITE.origin}/tools/${t.slug}">`)) noCanon++;
  if (!h.includes('aria-label="Breadcrumb"')) noCrumb++;
  if (!h.includes('application/ld+json')) noSchema++;

  // FAQPage schema is only legitimate if the questions are on the page.
  if (h.includes('"FAQPage"')) {
    const firstQ = t.faq[0].q.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    if (!h.includes('<summary>' + firstQ + '</summary>')) noFaqVisible++;
  }

  // Text a crawler sees with JavaScript disabled.
  const visible = h.replace(/<script[\s\S]*?<\/script>/g, ' ')
                   .replace(/<style[\s\S]*?<\/style>/g, ' ')
                   .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (visible.split(' ').length < 500) thin++;

  const links = (h.match(/href="\/tools\/[a-z0-9-]+"/g) || []).length;
  if (links < 8) noInternalLinks++;
}

check(noH1 === 0, 'every tool page has an H1', `${noH1} missing`);
check(dupTitle === 0, 'every tool page title is unique', `${dupTitle} duplicates`);
check(dupDesc === 0, 'every meta description is unique', `${dupDesc} duplicates`);
check(longTitle === 0, 'no title exceeds 70 characters', `${longTitle} too long`);
check(noCanon === 0, 'every tool page has a correct canonical', `${noCanon} wrong`);
check(noCrumb === 0, 'every tool page has breadcrumbs', `${noCrumb} missing`);
check(noSchema === 0, 'every tool page has structured data', `${noSchema} missing`);
check(noFaqVisible === 0, 'FAQPage schema always matches visible FAQs', `${noFaqVisible} mismatched`);
check(thin === 0, 'no tool page is thin (all >500 words without JS)', `${thin} thin pages`);
check(noInternalLinks === 0, 'every tool page links to 8+ other tools', `${noInternalLinks} under-linked`);

/* ---------- code splitting ---------- */
const pdfLibRef = /pdf-lib|pdfjs/i;
let leaked = 0;
for (const t of TOOLS.filter(t => t.category !== 'pdf')) {
  if (pdfLibRef.test(html(path.join('tools', t.slug)))) { leaked++; problems.push('PDF libs referenced on ' + t.slug); }
}
check(leaked === 0, 'PDF libraries appear only on PDF tool pages');

const homeHtml = read('index.html');
check(!pdfLibRef.test(homeHtml), 'homepage does not reference PDF libraries');
check(!/BOOT\s*=/.test(homeHtml), 'homepage does not carry image tool code');

const ageSize = statSync(path.join(OUT, 'tools', 'age-calculator', 'index.html')).size;
const mergerSize = statSync(path.join(OUT, 'tools', 'pdf-merger', 'index.html')).size;
check(ageSize < 60000, `age calculator page is small (${(ageSize / 1024).toFixed(0)} KB)`);
check(mergerSize < 90000, `pdf merger page is reasonable (${(mergerSize / 1024).toFixed(0)} KB)`);

/* ---------- sitemap & robots ---------- */
const sm = read('sitemap.xml');
let smMissing = 0;
for (const t of TOOLS) if (!sm.includes(`<loc>${SITE.origin}/tools/${t.slug}</loc>`)) smMissing++;
check(smMissing === 0, 'sitemap lists every tool URL', `${smMissing} missing`);
for (const c of CATEGORIES) check(sm.includes(`/tools/${c.slug}</loc>`), `sitemap lists /tools/${c.slug}`);
check(sm.includes(`<loc>${SITE.origin}/</loc>`), 'sitemap lists the homepage');
check((sm.match(/<url>/g) || []).length === TOOLS.length + CATEGORIES.length + 6,
  'sitemap URL count matches the registry', String((sm.match(/<url>/g) || []).length));

const rb = read('robots.txt');
check(rb.includes('Sitemap: ' + SITE.origin + '/sitemap.xml'), 'robots.txt points at the sitemap');
check(!/Disallow:\s*\/(?:\s|$)/m.test(rb), 'robots.txt does not block the site');
check(!/Disallow:.*\.(css|js)/i.test(rb), 'robots.txt does not block CSS or JavaScript');

/* ---------- ads ---------- */
const toolHtml = html(path.join('tools', 'json-formatter'));
const adCount = (toolHtml.match(/class="ad-slot"/g) || []).length;
check(adCount >= 1 && adCount <= 3, `tool page has a sane number of ad slots (${adCount})`);
check(toolHtml.includes('<span class="ad-label">Advertisement</span>'), 'ads are labelled as advertisements');
const notFound = read('404.html');
check(!notFound.includes('class="ad-slot"'), '404 page carries no advertising');

// An ad must never sit inside the tool interface itself.
const toolRoot = toolHtml.split('id="tool-root"')[1]?.split('</div>\n\n    ')[0] || '';
check(!toolRoot.includes('ad-slot'), 'no ad slot inside the tool interface');

/* ---------- accessibility basics ---------- */
check(homeHtml.includes('class="skip"'), 'skip link present');
check(homeHtml.includes('<html lang="'), 'html lang attribute set');
let noLabel = 0;
for (const t of TOOLS.slice(0, 20)) {
  const h = html(path.join('tools', t.slug));
  const inputs = (h.match(/<(input|select|textarea)[^>]*id="([^"]+)"/g) || []);
  for (const inp of inputs) {
    const id = (inp.match(/id="([^"]+)"/) || [])[1];
    if (!id || /^(file|hs|hero-q|filter|nf-q)$/.test(id)) continue;
    if (/type="(checkbox|radio|range|color|hidden)"/.test(inp)) continue;
    if (!h.includes(`for="${id}"`) && !inp.includes('aria-label')) noLabel++;
  }
}
check(noLabel === 0, 'form controls are labelled', `${noLabel} unlabelled`);

/* ---------- search index ---------- */
const idx = JSON.parse(read('search-index.json'));
check(idx.length === TOOLS.length, 'search index covers every tool');
check(idx.every(t => t.s && t.n && t.d && t.c), 'search index entries are complete');
const idxSize = statSync(path.join(OUT, 'search-index.json')).size;
check(idxSize < 40000, `search index is small (${(idxSize / 1024).toFixed(1)} KB)`);

/* ---------- no placeholder content ---------- */
let placeholders = 0;
const banned = /coming soon|lorem ipsum dolor sit amet, consectetur adipiscing elit\. Sed do|TODO|FIXME|placeholder text here/i;
for (const t of TOOLS) {
  const h = html(path.join('tools', t.slug));
  // The lorem generator legitimately contains lorem text.
  if (t.slug === 'lorem-ipsum-generator') continue;
  if (banned.test(h)) { placeholders++; problems.push('placeholder content on ' + t.slug); }
}
check(placeholders === 0, 'no "coming soon" or placeholder copy anywhere');

/* ---------- totals ---------- */
function countFiles(dir) {
  let n = 0;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) n += countFiles(path.join(dir, e.name));
    else if (e.name.endsWith('.html')) n++;
  }
  return n;
}
const pages = countFiles(OUT);
check(pages === TOOLS.length + CATEGORIES.length + 6 + 1, `page count is right (${pages})`);

console.log('  ' + '─'.repeat(56));
if (problems.length) {
  console.log('\n  ISSUES\n');
  problems.forEach(p => console.log('   ✗ ' + p));
}
console.log(`\n  ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
