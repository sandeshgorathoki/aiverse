// MEGA TOOLS — central registry
//
// Adding tool #63 is: write the tool object in the right category module,
// register the slug in `related` on a few neighbours, and rebuild.
// Nothing here or in build.mjs needs to change.

import pdf, { PRELUDE as pdfPrelude } from './tools/pdf.js';
import image, { PRELUDE as imagePrelude } from './tools/image.js';
import developer from './tools/developer.js';
import calculators from './tools/calculators.js';
import text from './tools/text.js';
import converters from './tools/converters.js';
import security from './tools/security.js';

export const SITE = {
  name: 'Mega Tools',
  brand: 'MEGA TOOLS',
  tagline: 'Free tools for everything you do online.',
  description: 'Convert, calculate, compress, format, generate and edit files with fast, free online tools. No sign-up, no watermarks, and most tools run entirely in your browser.',
  origin: 'https://whitemouseai.com',
  locale: 'en',
  email: 'hello@whitemouseai.com',
  twitter: '@megatools'
};

export const CATEGORIES = [
  {
    slug: 'pdf',
    name: 'PDF Tools',
    short: 'PDF',
    icon: '📄',
    tagline: 'Merge, split, compress, rotate and convert PDF documents.',
    intro: 'Everything here runs in your browser. PDFs frequently contain contracts, medical records, bank statements and identity documents, so nothing is uploaded to a server — the files are opened, edited and rewritten on your own device.',
    body: `<p>PDF is a layout format, which is why editing one is harder than editing a document. The tools here work at the level PDF actually supports: whole pages. You can rearrange, combine, separate, rotate and extract pages losslessly, because those operations move page objects around without touching their contents. Text stays selectable and images are never re-compressed.</p>
<p>The two tools that do change content are honest about it. The compressor tells you exactly what each mode costs, and PDF to JPG explains what you give up by turning a document into pictures.</p>
<p>Two things no browser-based tool can do: open a password-protected file without the password, and read text out of a scan. The first is by design. The second is because a scanned page contains no text at all, only an image of one — that needs OCR, which is a different kind of software entirely.</p>`
  },
  {
    slug: 'image',
    name: 'Image Tools',
    short: 'Image',
    icon: '🖼',
    tagline: 'Convert, compress, resize, crop and rotate images.',
    intro: 'Image editing that happens entirely on your device. Every tool here uses the browser canvas API, so your photos are never uploaded, never stored and never seen by anyone else.',
    body: `<p>Most image problems come down to three questions: is it the right format, the right size, and the right shape? Format determines how efficiently the file stores what it contains — JPG for photographs, PNG for graphics and transparency, WebP for both at a smaller size. Dimensions usually matter more than people expect; an oversized image is the most common reason a page loads slowly.</p>
<p>A useful order of operations: crop to the shape you need, resize to the dimensions you will actually display, then compress. Doing it that way means each step works on less data than the last, and you avoid compressing pixels you were about to throw away.</p>
<p>One caveat worth knowing: converting between lossy formats compounds quality loss. Convert from the highest-quality original you have rather than from something already compressed.</p>`
  },
  {
    slug: 'developer',
    name: 'Developer Tools',
    short: 'Developer',
    icon: '⌨',
    tagline: 'Format, validate, encode and test — JSON, Base64, regex and more.',
    intro: 'The small utilities that come up a dozen times a day. All of them run locally, which matters when the thing you are debugging is an API response containing a token.',
    body: `<p>These are deliberately narrow tools. A JSON formatter should format JSON, load instantly and tell you precisely where the syntax broke — not open a project workspace. Every tool here does one job, works without an account, and keeps your data on your machine.</p>
<p>That last point is the reason to prefer a client-side tool for this category specifically. Developers paste production data into formatters and decoders constantly: API responses, JWTs, log lines, config files. Anything pasted into a server-side tool has left your control. Nothing here makes a network request with your input.</p>
<p>The tools also try to explain rather than just transform. The regex tester shows capture groups and match positions, the encoders explain which mode to pick, and the formatters report what changed and why.</p>`
  },
  {
    slug: 'calculators',
    name: 'Calculators',
    short: 'Calculators',
    icon: '🧮',
    tagline: 'Loans, percentages, dates, ages and everyday arithmetic.',
    intro: 'Calculators that show their working. Every financial tool states its formula and its assumptions, because a number without either is impossible to check.',
    body: `<p>The problem with most online calculators is not the arithmetic — it is the hidden assumptions. A loan calculator that omits how it compounds, or a salary converter that quietly assumes 52 paid weeks, produces a plausible number that does not match reality.</p>
<p>These tools show the formula alongside the result, list what is excluded, and flag the situations where the answer stops being reliable. The financial ones say plainly that lenders and tax authorities apply their own rounding and fees, so treat the output as a well-specified estimate rather than a quote.</p>
<p>The date and time calculators handle the awkward cases explicitly: leap years, month-end arithmetic, daylight saving transitions and the difference between inclusive and exclusive day counting.</p>`
  },
  {
    slug: 'text',
    name: 'Text Tools',
    short: 'Text',
    icon: '✍',
    tagline: 'Count, convert, sort, deduplicate and compare text.',
    intro: 'Tools for working with words and lines. Useful whether you are writing to a character limit, cleaning up a list, or comparing two versions of a document.',
    body: `<p>Text handling looks trivial until you meet real text. Counting characters requires deciding whether an emoji is one character or four bytes. Sorting requires knowing that item10 should come after item9. Deduplicating requires noticing that two identical-looking lines differ by a trailing space.</p>
<p>Each tool here documents the choices it makes, so you can tell whether its answer is the one you need — particularly important when a word count decides whether an essay is accepted or a meta description is truncated.</p>
<p>Everything is Unicode-aware, so accented characters, non-Latin scripts and emoji are handled correctly rather than mangled. And nothing is transmitted, which matters when the text is an unpublished draft or a client document.</p>`
  },
  {
    slug: 'converters',
    name: 'Converters',
    short: 'Converters',
    icon: '⇄',
    tagline: 'Length, weight, temperature, speed, storage, time zones and number bases.',
    intro: 'Unit conversion with exact factors and the reasoning behind them. Each tool shows every unit at once, so you can sanity-check a result rather than trusting a single number.',
    body: `<p>Most conversions are a single multiplication, and the interesting part is not the arithmetic but knowing which unit you actually have. A "ton" can mean three different weights. A "mile" can be a statute mile or a nautical one. A "GB" can be a billion bytes or 1,073,741,824 of them, which is why a new drive appears smaller than advertised.</p>
<p>Every converter here shows the exact factor it uses and explains where the ambiguities lie. Where a conversion needs an offset rather than a factor — temperature — the formula is shown with each result.</p>
<p>The time zone converter is the outlier. It uses your browser's IANA database and applies the daylight saving rules in force on the specific date you choose, which is why converting "3pm next Tuesday" gives a different answer from converting "3pm today" during a changeover period.</p>`
  },
  {
    slug: 'security',
    name: 'Security & Generators',
    short: 'Security',
    icon: '🔐',
    tagline: 'Passwords, hashes, UUIDs and random numbers.',
    intro: 'Generators built on your browser\'s cryptographic random source rather than <code>Math.random</code>, with the entropy stated so you can judge the strength yourself.',
    body: `<p>Anything generating a secret must do it locally, and must do it properly. Both halves matter. A password generated on a server has been transmitted before you ever see it. A password generated from a weak random source is predictable no matter how long it is.</p>
<p>The tools here use <code>crypto.getRandomValues</code>, which draws on entropy collected by your operating system, and they use rejection sampling to avoid the modulo bias that skews most quick implementations. Nothing makes a network request — you can disconnect and generate offline to verify it.</p>
<p>Where a number is shown — bits of entropy, an estimated crack time — the assumptions behind it are stated, because a coloured strength bar with no explanation tells you nothing useful.</p>`
  }
];

const MODULES = [
  { tools: pdf, prelude: pdfPrelude },
  { tools: image, prelude: imagePrelude },
  { tools: developer, prelude: null },
  { tools: calculators, prelude: null },
  { tools: text, prelude: null },
  { tools: converters, prelude: null },
  { tools: security, prelude: null }
];

// Flatten, attaching the shared prelude each tool's `init` depends on.
export const TOOLS = MODULES.flatMap(m =>
  m.tools.map(t => ({ ...t, prelude: m.prelude || null }))
);

export const BY_SLUG = Object.fromEntries(TOOLS.map(t => [t.slug, t]));
export const CATEGORY_BY_SLUG = Object.fromEntries(CATEGORIES.map(c => [c.slug, c]));

export function toolsInCategory(slug) {
  return TOOLS.filter(t => t.category === slug)
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
}

export function popularTools(n = 10) {
  return [...TOOLS].sort((a, b) => (b.popularity || 0) - (a.popularity || 0)).slice(0, n);
}

export function featuredTools(n = 8) {
  return TOOLS.filter(t => t.featured)
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, n);
}

// Related tools come from the registry. If a tool under-specifies them, the gap
// is filled from its own category so every page still links onward.
export function relatedTools(tool, n = 5) {
  const out = [];
  const seen = new Set([tool.slug]);
  for (const slug of tool.related || []) {
    const t = BY_SLUG[slug];
    if (t && !seen.has(slug)) { out.push(t); seen.add(slug); }
    if (out.length >= n) return out;
  }
  for (const t of toolsInCategory(tool.category)) {
    if (out.length >= n) break;
    if (!seen.has(t.slug)) { out.push(t); seen.add(t.slug); }
  }
  return out;
}

// Fail the build rather than ship a broken page.
export function validate() {
  const errors = [];
  const seen = new Set();
  const required = ['slug', 'name', 'category', 'desc', 'seoTitle', 'metaDescription', 'html', 'init', 'howto', 'sections', 'faq'];

  for (const t of TOOLS) {
    for (const field of required) {
      if (!t[field]) errors.push(`${t.slug || '(no slug)'}: missing "${field}"`);
    }
    if (seen.has(t.slug)) errors.push(`Duplicate slug: ${t.slug}`);
    seen.add(t.slug);

    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(t.slug || '')) errors.push(`${t.slug}: slug must be lowercase kebab-case`);
    if (!CATEGORY_BY_SLUG[t.category]) errors.push(`${t.slug}: unknown category "${t.category}"`);
    if (typeof t.init !== 'function') errors.push(`${t.slug}: init must be a function`);

    // SEO limits — long titles and descriptions get truncated in results.
    if (t.seoTitle && t.seoTitle.length > 60) errors.push(`${t.slug}: seoTitle is ${t.seoTitle.length} chars (max 60 before the site suffix)`);
    if (t.metaDescription && (t.metaDescription.length < 70 || t.metaDescription.length > 170)) {
      errors.push(`${t.slug}: metaDescription is ${t.metaDescription.length} chars (aim for 70–170)`);
    }
    // Substance checks — these exist to stop thin pages being shipped.
    if ((t.faq || []).length < 3) errors.push(`${t.slug}: needs at least 3 FAQ entries, has ${(t.faq || []).length}`);
    if ((t.sections || []).length < 1) errors.push(`${t.slug}: needs at least one explanatory section`);
    if ((t.howto || []).length < 2) errors.push(`${t.slug}: needs at least 2 how-to steps`);

    const prose = (t.sections || []).map(s => s.p).join(' ').replace(/<[^>]+>/g, ' ');
    const words = prose.trim().split(/\s+/).filter(Boolean).length;
    if (words < 120) errors.push(`${t.slug}: supporting content is only ${words} words (minimum 120)`);

    for (const slug of t.related || []) {
      if (!BY_SLUG[slug]) errors.push(`${t.slug}: related tool "${slug}" does not exist`);
    }
  }

  for (const c of CATEGORIES) {
    if (!toolsInCategory(c.slug).length) errors.push(`Category "${c.slug}" has no tools — remove it or add one`);
  }
  return errors;
}
