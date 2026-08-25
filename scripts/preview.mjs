// Builds self-contained single-file previews of chosen pages.
// Everything is inlined so the file works from disk with no server.
//
// Note: replacements use a function, not a string. A replacement *string*
// treats "$$" as an escape for a literal "$", which silently rewrites
// MT.$$ into MT.$ and breaks every tool.

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const OUT = process.argv[2] || path.join(ROOT, 'previews');

const read = p => readFileSync(path.join(DIST, p), 'utf8');
const css = read('assets/site.css');
const shell = read('assets/shell.js');
const runtime = read('assets/tool-runtime.js');
const index = read('search-index.json');

// literal replacement — never interprets $ patterns
const put = (haystack, needle, value) => haystack.replace(needle, () => value);

function inline(route, outName) {
  let h = read(route);

  h = put(h, '<link rel="stylesheet" href="/assets/site.css">', '<style>\n' + css + '\n</style>');

  h = put(h, '<script src="/assets/shell.js" defer></script>',
    '<script>window.__MT_INDEX = ' + index + ';</script>\n<script>\n' + shell + '\n</script>');

  // Only tool pages carry the runtime — the homepage and category pages
  // deliberately do not, which is the code splitting working as intended.
  const hasRuntime = h.includes('/assets/tool-runtime.js');
  if (hasRuntime) {
    h = put(h, '<script src="/assets/tool-runtime.js" defer></script>',
      '<script>\n' + runtime + '\n</script>');
  }

  // The search index is normally fetched; serve it from memory instead so the
  // standalone file works offline and from file://
  h = put(h,
    "fetch('/search-index.json', { cache: 'force-cache' })",
    'Promise.resolve({ ok: true, json: function () { return window.__MT_INDEX; } })');

  h = put(h, '<head>', '<head>\n<!-- Self-contained preview. The real build keeps CSS and JS as separate cacheable files. -->');

  const target = path.join(OUT, outName);
  writeFileSync(target, h);

  // Sanity check: the inliner must not have mangled the runtime.
  if (hasRuntime && !h.includes('MT.$$ = function')) {
    throw new Error('Inlining corrupted MT.$$ in ' + outName);
  }
  console.log('  ✓ ' + outName + '  ' + (h.length / 1024).toFixed(0) + ' KB');
  return target;
}

console.log('\n  Self-contained previews');
inline('index.html', 'preview-homepage.html');
inline(path.join('tools', 'json-formatter', 'index.html'), 'preview-json-formatter.html');
inline(path.join('tools', 'loan-calculator', 'index.html'), 'preview-loan-calculator.html');
inline(path.join('tools', 'pdf', 'index.html'), 'preview-category-pdf.html');
console.log('');
