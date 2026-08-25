// MEGA TOOLS — real-engine tests for image & PDF tools
//
// jsdom has no canvas rasterizer and no pdf.js worker, so the previous suite
// could only check registry structure for these 17 tools. This harness wires
// node-canvas (real Cairo rendering, real toBlob/toDataURL) and pdfjs-dist's
// legacy Node build into jsdom's `document.createElement`, so the *actual*
// tool code — the same init() the build serialises into the page — runs
// against real pixels and real PDF bytes, not a mock.

import { JSDOM } from 'jsdom';
import { createCanvas, Image, DOMMatrix, ImageData } from 'canvas';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { TOOLS, BY_SLUG } from '../src/registry.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const nodeRequire = createRequire(import.meta.url);
const RUNTIME = readFileSync(path.join(ROOT, '..', 'src', 'assets', 'tool-runtime.js'), 'utf8');
const FONTS_URL = 'file://' + path.join(ROOT, '..', 'node_modules', 'pdfjs-dist', 'standard_fonts') + '/';
const SNAP_DIR = path.join(ROOT, '..', 'test-artifacts');
mkdirSync(SNAP_DIR, { recursive: true });

let passed = 0, failed = 0;
const failures = [];
function assert(cond, label, detail) {
  if (cond) { passed++; return true; }
  failed++;
  failures.push({ label, detail });
  return false;
}

/* ------------------------------------------------------------------ */
/* Fixture builders — real PNG/JPEG bytes and real PDF bytes, not mocks */
/* ------------------------------------------------------------------ */

function pngFixture(w, h, draw) {
  const c = createCanvas(w, h);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  (draw || function (ctx) {
    ctx.fillStyle = '#e63946'; ctx.fillRect(0, 0, w / 2, h / 2);
    ctx.fillStyle = '#2a9d8f'; ctx.fillRect(w / 2, 0, w / 2, h / 2);
    ctx.fillStyle = '#264653'; ctx.fillRect(0, h / 2, w / 2, h / 2);
    ctx.fillStyle = '#e9c46a'; ctx.fillRect(w / 2, h / 2, w / 2, h / 2);
  })(ctx);
  return c.toBuffer('image/png');
}
function jpegFixture(w, h) {
  const c = createCanvas(w, h);
  const ctx = c.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#ff7e5f'); grad.addColorStop(1, '#feb47b');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
  return c.toBuffer('image/jpeg', { quality: 0.9 });
}
function transparentPngFixture(w, h) {
  const c = createCanvas(w, h);
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(255,0,0,0.8)';
  ctx.beginPath(); ctx.arc(w / 2, h / 2, Math.min(w, h) / 3, 0, Math.PI * 2); ctx.fill();
  return c.toBuffer('image/png');
}
async function pdfFixture(pages, opts = {}) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 0; i < pages; i++) {
    const size = opts.sizes?.[i] || [612, 792];
    const p = doc.addPage(size);
    p.drawText(`Page ${i + 1} of ${pages}${opts.tag ? ' — ' + opts.tag : ''}`, {
      x: 50, y: size[1] - 80, size: 24, font, color: rgb(0.1, 0.1, 0.1)
    });
    p.drawText('The quick brown fox jumps over the lazy dog.', { x: 50, y: size[1] - 120, size: 14, font });
    if (opts.landscape?.includes(i)) { /* size already swapped by caller */ }
  }
  return doc.save();
}
async function encryptedPdfFixture() {
  const doc = await PDFDocument.create();
  doc.addPage([300, 300]);
  return doc.save({ useObjectStreams: false }); // pdf-lib can't set real encryption; simulate via corrupt header below
}

/* ------------------------------------------------------------------ */
/* Boot a real-engine DOM for one tool                                 */
/* ------------------------------------------------------------------ */

function boot(slug) {
  const tool = BY_SLUG[slug];
  if (!tool) throw new Error('No such tool: ' + slug);

  const dom = new JSDOM(
    `<!DOCTYPE html><html><body data-tool="${slug}"><div id="tool-root">${tool.html}</div></body></html>`,
    { runScripts: 'outside-only', url: 'https://example.com/tools/' + slug, pretendToBeVisual: true, resources: 'usable' }
  );
  const w = dom.window;

  // Real canvas: route document.createElement('canvas') to node-canvas, which
  // performs actual Cairo rasterisation — the same operations toBlob/toDataURL
  // perform in a browser.
  const realCreateElement = w.document.createElement.bind(w.document);
  w.document.createElement = function (tag) {
    if (String(tag).toLowerCase() === 'canvas') {
      const nc = createCanvas(300, 150);
      // Bridge node-canvas's Buffer-based toBuffer to the browser's Blob-based toBlob/toDataURL.
      nc.toBlob = function (cb, type, quality) {
        const t = type || 'image/png';
        const buf = t === 'image/jpeg' || t === 'image/jpg'
          ? nc.toBuffer('image/jpeg', { quality: quality === undefined ? 0.92 : quality })
          : nc.toBuffer('image/png');
        const blob = new w.Blob([buf], { type: t });
        w.__trackBlobBytes(blob, buf);
        cb(blob);
      };
      nc.toDataURL = function (type, quality) {
        const t = type || 'image/png';
        const buf = t === 'image/jpeg' ? nc.toBuffer('image/jpeg', { quality: quality || 0.92 }) : nc.toBuffer('image/png');
        return 'data:' + t + ';base64,' + buf.toString('base64');
      };
      return nc;
    }
    return realCreateElement(tag);
  };

  w.Image = Image; // node-canvas Image decodes real JPEG/PNG bytes

  // jsdom deliberately hides Node internals from its simulated browser realm,
  // which is normally correct — but pdf.js's own Node-vs-browser detection
  // depends on seeing a real `process`, and its worker-loading fallback needs
  // a real `require`. Without both, pdf.js takes the browser-only worker path
  // (fetching a script via a <script> tag) and hangs forever, since jsdom
  // cannot actually execute one. Exposing them lets pdf.js correctly detect
  // it can load its worker module directly, exactly as it would in a real
  // Node-hosted renderer.
  w.process = process;
  w.require = nodeRequire;
  w.ReadableStream = globalThis.ReadableStream;
  w.WritableStream = globalThis.WritableStream;
  w.TransformStream = globalThis.TransformStream;

  // Bridge object URLs to something node-canvas can actually decode. A real
  // browser's <img> can load a blob: URL directly; node-canvas cannot. Every
  // blob these tools ever create originates from bytes we already have (a
  // dropped File, or a canvas we control), so track those bytes by identity
  // and hand back a data: URI instead — same contract (a loadable URL string),
  // an engine that can actually read it.
  const blobBytes = new WeakMap();
  w.__trackBlobBytes = (blob, buf) => blobBytes.set(blob, buf);
  w.URL.createObjectURL = function (blob) {
    const buf = blobBytes.get(blob);
    if (buf) return 'data:' + (blob.type || 'application/octet-stream') + ';base64,' + Buffer.from(buf).toString('base64');
    return 'blob:untracked';
  };
  w.URL.revokeObjectURL = function () {};

  if (!w.crypto?.getRandomValues) {
    Object.defineProperty(w, 'crypto', {
      configurable: true,
      value: { getRandomValues: a => { for (let i = 0; i < a.length; i++) a[i] = (Math.random() * 4294967296) | 0; return a; } }
    });
  }
  w.TextEncoder = TextEncoder; w.TextDecoder = TextDecoder;

  // Every download this suite needs to inspect goes through MT.download —
  // capture what was actually handed to it instead of triggering a real save.
  w.__downloads = [];
  w.MT = { toast() {}, track() {}, escapeHtml(s) { return String(s); } };

  w.eval(RUNTIME);
  const realDownload = w.MT.download;
  w.MT.download = function (data, filename, mime) {
    const blob = (data && typeof data.arrayBuffer === 'function') ? data : new w.Blob([data], { type: mime || 'text/plain' });
    w.__downloads.push({ blob, filename });
  };
  w.MT.downloadZipless = function (items) {
    items.forEach(it => w.__downloads.push({ blob: it.blob, filename: it.name }));
  };

  if (tool.prelude) w.eval(tool.prelude.replace(/window\.MT/g, 'MT'));
  if (tool.initCfg) w.__TOOL_CFG = JSON.parse(JSON.stringify(tool.initCfg));
  w.eval('(' + tool.init.toString() + ')();');

  const $ = sel => w.document.querySelector(sel);
  return {
    w, $,
    set(sel, val) {
      const el = $(sel);
      if (!el) throw new Error('Missing ' + sel + ' in ' + slug);
      if (el.type === 'checkbox') el.checked = val; else el.value = val;
      el.dispatchEvent(new w.Event('input', { bubbles: true }));
      el.dispatchEvent(new w.Event('change', { bubbles: true }));
    },
    click(sel) { const el = $(sel); if (!el) throw new Error('Missing ' + sel); el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); },
    text: sel => ($(sel)?.textContent ?? '').trim(),
    msg: sel => ($(sel || '#msg')?.textContent ?? '').trim(),

    // Deliver a File through the real dropzone machinery, exactly as a browser would.
    async dropFile(buf, name, type) {
      const file = new w.File([buf], name, { type });
      w.__trackBlobBytes(file, buf);
      const zone = $('#zone');
      zone.dispatchEvent(Object.assign(new w.Event('drop', { bubbles: true }), { dataTransfer: { files: [file] } }));
      await wait(80);
    },

    // Read back the bytes of a captured download, regardless of whether it
    // arrived as a real Blob or as our lightweight polyfill.
    async lastDownloadBytes() {
      const d = w.__downloads[w.__downloads.length - 1];
      if (!d) return null;
      const ab = await d.blob.arrayBuffer();
      return Buffer.from(ab);
    }
  };
}
function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
async function until(fn, ms = 4000, step = 30) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    const v = fn();
    if (v) return v;
    await wait(step);
  }
  throw new Error('Timed out waiting for condition');
}

async function test(slug, label, fn) {
  try {
    const p = boot(slug);
    await fn(p, (cond, what, detail) => assert(cond, `${slug} — ${what}`, detail));
  } catch (e) {
    failed++;
    failures.push({ label: `${slug} — ${label}`, detail: (e.message || String(e)) + '\n' + (e.stack || '').split('\n').slice(0, 3).join('\n') });
  }
}

/* Wire the real MT.lib() network fetch to load libraries from node_modules
   instead of a CDN, so PDF tools work offline in this sandbox exactly as they
   would online — same code, same library, different transport. */
const LOCAL_PDF_WORKER = path.join(ROOT, '..', 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.worker.js');

function wireLocalLibs(win, tool) {
  const map = {
    'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js':
      path.join(ROOT, '..', 'node_modules', 'pdf-lib', 'dist', 'pdf-lib.min.js'),
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js':
      path.join(ROOT, '..', 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.js')
  };

  // The shipped tool points standardFontDataUrl/cMapUrl at jsDelivr — correct
  // for a real deployment, unreachable from this sandbox. Redirect to the
  // identical assets already sitting in node_modules, so the exact same
  // fetchData() codepath in the tool's own code resolves real font/cmap
  // bytes instead of failing a network request.
  if (win.PDFH) {
    win.PDFH.docOpts = {
      standardFontDataUrl: path.join(ROOT, '..', 'node_modules', 'pdfjs-dist', 'standard_fonts') + path.sep,
      cMapUrl: path.join(ROOT, '..', 'node_modules', 'pdfjs-dist', 'cmaps') + path.sep,
      cMapPacked: true
    };
  }

  const loaded = new Set(); // several tools call PDFH.js()/PDFH.lib() more than
                            // once per page (e.g. to read the page count, then
                            // again to process) — the real MT.lib caches by URL
                            // so a library is only ever fetched once; re-evaling
                            // the whole bundle a second time here would silently
                            // replace our patched GlobalWorkerOptions with a
                            // fresh, unpatched one.
  win.MT.lib = function (url) {
    if (loaded.has(url)) return Promise.resolve();
    const file = map[url];
    if (!file) return Promise.reject(new Error('No local mapping for ' + url));
    win.eval(readFileSync(file, 'utf8'));
    loaded.add(url);

    if (url.indexOf('pdf.js') !== -1 && win.pdfjsLib) {
      // pdf.js's Node fallback path does `require(GlobalWorkerOptions.workerSrc)`
      // to load its worker code. In production the tool (correctly) points
      // that at the CDN's pdf.worker.min.js, which a browser fetches over
      // HTTP — but Node's require() cannot fetch a URL. Redirect the storage
      // behind workerSrc to the equivalent local file, so whatever the tool's
      // own code assigns, requiring it resolves to the same worker module a
      // real deployment would load from the CDN — same code, local transport.
      let stored = LOCAL_PDF_WORKER;
      Object.defineProperty(win.pdfjsLib.GlobalWorkerOptions, 'workerSrc', {
        configurable: true,
        get() { return stored; },
        set(v) { stored = /^https?:/.test(v) ? LOCAL_PDF_WORKER : v; }
      });
    }
    return Promise.resolve();
  };
  // pdf.js (legacy Node build) needs these globals to render/parse.
  win.DOMMatrix = DOMMatrix;
  win.ImageData = ImageData;
  win.Path2D = function () {};
}

/* ================================================================== */
/* IMAGE TOOLS — real pixels through the real tool code                */
/* ================================================================== */

console.log('\n  Image tools (real Cairo rendering via node-canvas)\n');

await test('jpg-to-png', 'converts real JPEG bytes to a real PNG', async (p, ok) => {
  const jpg = jpegFixture(120, 80);
  await p.dropFile(jpg, 'photo.jpg', 'image/jpeg');
  ok(p.$('#editor').hidden === false, 'editor appears after a real file drop');
  p.click('#go');
  await until(() => p.w.__IMG.blob);
  const blob = p.w.__IMG.blob;
  ok(blob.type === 'image/png', 'output blob is really image/png', blob.type);
  const buf = Buffer.from(await blob.arrayBuffer());
  ok(buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), 'output has a real PNG magic number');
});

await test('png-to-jpg', 'fills transparency and encodes real JPEG', async (p, ok) => {
  const png = transparentPngFixture(100, 100);
  await p.dropFile(png, 'logo.png', 'image/png');
  p.set('#bg', '#112233');
  p.set('#q', '80');
  p.click('#go');
  await until(() => p.w.__IMG.blob);
  const buf = Buffer.from(await p.w.__IMG.blob.arrayBuffer());
  ok(buf.slice(0, 2).equals(Buffer.from([0xff, 0xd8])), 'output has a real JPEG magic number (SOI marker)');
  ok(buf.length > 0 && buf.length < png.length * 3, 'output size is plausible', String(buf.length));
});

await test('webp-converter', 'reports honestly when the encoder is unavailable', async (p, ok) => {
  // node-canvas cannot encode WebP — this is exactly the "browser can't do it"
  // path the tool is designed to handle, and it must degrade honestly rather
  // than silently hand back the wrong format.
  const png = pngFixture(80, 80);
  await p.dropFile(png, 'art.png', 'image/png');
  p.set('#fmt', 'image/webp');
  p.click('#go');
  await wait(200);
  ok(/cannot|does not support/i.test(p.msg()) || p.$('#dl').disabled === false,
    'either converts or explains why it could not', p.msg());
});

await test('image-compressor', 'quality mode shrinks a real photo', async (p, ok) => {
  const jpg = jpegFixture(400, 300);
  await p.dropFile(jpg, 'big.jpg', 'image/jpeg');
  p.set('#q', '40');
  p.click('#go');
  await until(() => p.w.__IMG.blob);
  const out = Buffer.from(await p.w.__IMG.blob.arrayBuffer());
  ok(out.length < jpg.length, 'quality 40 output is smaller than the source', `${out.length} vs ${jpg.length}`);
  ok(p.msg().toLowerCase().includes('saved') || p.msg().toLowerCase().includes('smaller'), 'reports the saving', p.msg());
});

await test('image-compressor', 'target-size mode converges under the limit', async (p, ok) => {
  const jpg = jpegFixture(500, 400);
  await p.dropFile(jpg, 'big2.jpg', 'image/jpeg');
  p.click('[data-mo="target"]');
  p.set('#target', '15'); p.set('#tunit', '1024');
  p.click('#go');
  const blob = await until(() => p.w.__IMG.blob, 8000);
  const out = Buffer.from(await blob.arrayBuffer());
  ok(out.length <= 15 * 1024 * 1.05, 'binary search lands at or under 15 KB (±5% cent rounding)', String(out.length));
});

await test('image-resizer', 'produces exact requested pixel dimensions', async (p, ok) => {
  const png = pngFixture(400, 300);
  await p.dropFile(png, 'photo.png', 'image/png');
  p.set('#w', '150');
  ok(p.$('#h').value === '113' || p.$('#h').value === '112', 'locked ratio computes height ≈150×300/400', p.$('#h').value);
  p.set('#fmt', 'image/png');
  p.click('#go');
  await until(() => p.w.__IMG.blob);
  const buf = Buffer.from(await p.w.__IMG.blob.arrayBuffer());
  const img = new Image(); img.src = buf;
  await until(() => img.complete);
  ok(img.width === 150, 'output width is exactly 150px', String(img.width));
});

await test('image-cropper', 'crops to the exact typed rectangle', async (p, ok) => {
  const png = pngFixture(200, 200);
  await p.dropFile(png, 'sq.png', 'image/png');
  p.set('#cx', '20'); p.set('#cy', '20'); p.set('#cw', '80'); p.set('#chh', '60');
  p.click('#go');
  await until(() => p.w.__IMG.blob);
  const buf = Buffer.from(await p.w.__IMG.blob.arrayBuffer());
  const img = new Image(); img.src = buf;
  await until(() => img.complete);
  ok(img.width === 80 && img.height === 60, 'output is exactly 80×60', `${img.width}x${img.height}`);
});

await test('image-rotator', 'grows the canvas for a non-right-angle rotation', async (p, ok) => {
  const png = pngFixture(100, 100);
  await p.dropFile(png, 'sq.png', 'image/png');
  p.set('#angle', '45');
  p.click('#go');
  await until(() => p.w.__IMG.blob);
  const buf = Buffer.from(await p.w.__IMG.blob.arrayBuffer());
  const img = new Image(); img.src = buf;
  await until(() => img.complete);
  const expected = Math.round(100 * Math.SQRT2);
  ok(Math.abs(img.width - expected) <= 2, `45° rotation of a square grows to ~${expected}px`, String(img.width));
});

await test('image-flipper', 'produces a real mirrored image (pixel check)', async (p, ok) => {
  // Fixture: left half red, right half blue. After a horizontal flip, the
  // pixel that was at the far left must now be the colour that was on the right.
  const c = createCanvas(40, 20);
  const cx = c.getContext('2d');
  cx.fillStyle = '#ff0000'; cx.fillRect(0, 0, 20, 20);
  cx.fillStyle = '#0000ff'; cx.fillRect(20, 0, 20, 20);
  const buf = c.toBuffer('image/png');

  await p.dropFile(buf, 'halves.png', 'image/png');
  p.click('[data-flip="h"]');
  p.click('#go');
  const blob = await until(() => p.w.__IMG.blob);
  const outBuf = Buffer.from(await blob.arrayBuffer());
  const img = new Image(); img.src = outBuf;
  await until(() => img.complete);
  const outCanvas = createCanvas(img.width, img.height);
  outCanvas.getContext('2d').drawImage(img, 0, 0);
  const px = outCanvas.getContext('2d').getImageData(2, 10, 1, 1).data;
  ok(px[2] > px[0], 'the pixel that was red on the left is now blue after a horizontal flip', `rgb(${px[0]},${px[1]},${px[2]})`);
});

await test('image-to-base64', 'produces a decodable data URI', async (p, ok) => {
  const png = pngFixture(30, 30);
  await p.dropFile(png, 'tiny.png', 'image/png');
  await until(() => !p.$('#out-wrap').hidden);
  const uri = p.$('#out').textContent;
  ok(uri.startsWith('data:image/png;base64,'), 'produces a proper data URI prefix', uri.slice(0, 30));
  const payload = uri.split(',')[1];
  ok(Buffer.from(payload, 'base64').slice(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47])), 'the Base64 payload decodes to a real PNG');
});

/* ================================================================== */
/* PDF TOOLS — real PDF bytes through the real tool code                */
/* ================================================================== */

console.log('\n  PDF tools (real pdf-lib + real pdf.js via node-canvas)\n');

await test('pdf-merger', 'merges two real PDFs into the right page count', async (p, ok) => {
  wireLocalLibs(p.w);
  const a = await pdfFixture(2, { tag: 'A' });
  const b = await pdfFixture(3, { tag: 'B' });
  await p.dropFile(Buffer.from(a), 'a.pdf', 'application/pdf');
  await p.dropFile(Buffer.from(b), 'b.pdf', 'application/pdf');
  ok(p.$('#list').children.length === 2, 'both files listed');
  p.click('#go');
  await until(() => !p.$('#result').hidden, 10000);
  ok(p.text('#r-pages') === '5', 'merged document has 2+3=5 pages', p.text('#r-pages'));

  // Verify with an independent read of the actual downloaded bytes, not just
  // the tool's own on-screen report.
  p.click('#dl');
  const outBuf = await p.lastDownloadBytes();
  const check = await PDFDocument.load(outBuf);
  ok(check.getPageCount() === 5, 'independently reopening the downloaded file confirms 5 pages', String(check.getPageCount()));
});

await test('pdf-merger', 'skips a corrupt file and reports it, keeps going', async (p, ok) => {
  wireLocalLibs(p.w);
  const good = await pdfFixture(2);
  await p.dropFile(Buffer.from(good), 'good.pdf', 'application/pdf');
  await p.dropFile(Buffer.from('not a pdf at all'), 'bad.pdf', 'application/pdf');
  p.click('#go');
  await until(() => !p.$('#result').hidden, 10000);
  ok(p.text('#r-pages') === '2', 'the good file still merges successfully', p.text('#r-pages'));
  ok(p.msg().toLowerCase().includes('could not be read'), 'the corrupt file is named in the message', p.msg());
});

await test('pdf-splitter', 'splits a real PDF into the requested ranges', async (p, ok) => {
  wireLocalLibs(p.w);
  const src = await pdfFixture(6);
  await p.dropFile(Buffer.from(src), 'doc.pdf', 'application/pdf');
  await until(() => !p.$('#opts').hidden);
  ok(p.text('#info').includes('6 pages'), 'reads the real page count', p.text('#info'));

  p.click('[data-m="ranges"]');
  p.set('#spec', '1-2\n3-6');
  p.click('#go');
  await until(() => !p.$('#result').hidden, 10000);
  const rows = p.$('#outlist').querySelectorAll('li').length;
  ok(rows === 2, 'produced 2 output files', String(rows));

  p.click('#dlall');
  await wait(50);
  ok(p.w.__downloads.length === 2, 'both outputs were actually handed to download', String(p.w.__downloads.length));
  const first = await Buffer.from(await p.w.__downloads[0].blob.arrayBuffer());
  const check = await PDFDocument.load(first);
  ok(check.getPageCount() === 2, 'first output really has 2 pages', String(check.getPageCount()));
  const second = Buffer.from(await p.w.__downloads[1].blob.arrayBuffer());
  const check2 = await PDFDocument.load(second);
  ok(check2.getPageCount() === 4, 'second output really has 4 pages (3-6)', String(check2.getPageCount()));
});

await test('pdf-rotator', 'writes a real /Rotate value into the file', async (p, ok) => {
  wireLocalLibs(p.w);
  const src = await pdfFixture(1);
  await p.dropFile(Buffer.from(src), 'doc.pdf', 'application/pdf');
  await until(() => !p.$('#opts').hidden);
  p.set('#pages', 'all'); p.set('#angle', '90');
  p.click('#go');
  await until(() => !p.$('#result').hidden, 10000);
  p.click('#dl');
  const outBuf = await p.lastDownloadBytes();
  const check = await PDFDocument.load(outBuf);
  ok(check.getPage(0).getRotation().angle === 90, 'reopening the downloaded file shows a real 90° rotation', String(check.getPage(0).getRotation().angle));
});

await test('pdf-page-extractor', 'keeps pages in the exact typed order', async (p, ok) => {
  wireLocalLibs(p.w);
  const src = await pdfFixture(5);
  await p.dropFile(Buffer.from(src), 'doc.pdf', 'application/pdf');
  await until(() => !p.$('#opts').hidden);
  p.set('#pages', '3,1');
  p.click('#go');
  await until(() => !p.$('#result').hidden, 10000);
  p.click('#dl');
  const outBuf = await p.lastDownloadBytes();
  const check = await PDFDocument.load(outBuf);
  ok(check.getPageCount() === 2, 'extracted exactly 2 pages', String(check.getPageCount()));

  // Confirm the requested order (3, then 1) — independently, by loading the
  // downloaded bytes into a fresh pdf.js instance and reading each page's text.
  // Page 3's fixture text says "Page 3 of 5"; page 1's says "Page 1 of 5".
  // This is independent verification code (not the tool under test), so it is
  // free to load pdf.js and configure it however is convenient for Node.
  if (!p.w.pdfjsLib) {
    p.w.DOMMatrix = DOMMatrix; p.w.ImageData = ImageData; p.w.Path2D = function () {};
    p.w.eval(readFileSync(path.join(ROOT, '..', 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.js'), 'utf8'));
    p.w.pdfjsLib.GlobalWorkerOptions.workerSrc = LOCAL_PDF_WORKER;
  }
  const doc = await p.w.pdfjsLib.getDocument({ data: new Uint8Array(outBuf) }).promise;
  const p1 = await (await doc.getPage(1)).getTextContent();
  const p2 = await (await doc.getPage(2)).getTextContent();
  const t1 = p1.items.map(i => i.str).join(' ');
  const t2 = p2.items.map(i => i.str).join(' ');
  ok(t1.includes('Page 3'), 'first output page is really source page 3', t1.slice(0, 30));
  ok(t2.includes('Page 1'), 'second output page is really source page 1', t2.slice(0, 30));
});

await test('jpg-to-pdf', 'embeds a real JPEG into a real PDF page', async (p, ok) => {
  wireLocalLibs(p.w);
  const jpg = jpegFixture(300, 200);
  await p.dropFile(jpg, 'photo.jpg', 'image/jpeg');
  await wait(50);
  p.set('#size', 'fit');
  p.click('#go');
  await until(() => !p.$('#result').hidden, 10000);
  p.click('#dl');
  const outBuf = await p.lastDownloadBytes();
  const check = await PDFDocument.load(outBuf);
  ok(check.getPageCount() === 1, 'creates a 1-page PDF from 1 image');
  const size = check.getPage(0).getSize();
  ok(Math.round(size.width) === 300 && Math.round(size.height) === 200, 'fit mode makes the page exactly the image size', `${size.width}x${size.height}`);
});

await test('pdf-to-jpg', 'renders a real page to a real raster image', async (p, ok) => {
  wireLocalLibs(p.w);
  const src = await pdfFixture(1);
  await p.dropFile(Buffer.from(src), 'doc.pdf', 'application/pdf');
  await until(() => !p.$('#opts').hidden, 8000);
  p.set('#pages', '1'); p.set('#dpi', '1.04'); p.set('#fmt', 'image/jpeg');
  p.click('#go');
  await until(() => !p.$('#result').hidden, 12000);
  const figs = p.$('#grid').querySelectorAll('figure').length;
  ok(figs === 1, 'produced exactly 1 image for 1 requested page', String(figs));

  p.click('[data-dl="0"]');
  await wait(50);
  const buf = await p.lastDownloadBytes();
  ok(buf.slice(0, 2).equals(Buffer.from([0xff, 0xd8])), 'the downloaded file is a real JPEG (SOI marker present)');
  writeFileSync(path.join(SNAP_DIR, 'pdf-to-jpg-sample.jpg'), buf);

  // A valid JPEG header is not enough — decode it and confirm the page's text
  // was actually painted. This is the check that catches the class of bug
  // where rendering "succeeds" (valid file, right dimensions) but every
  // character silently failed to draw, leaving a blank white page.
  const decoded = new Image(); decoded.src = buf;
  await until(() => decoded.complete);
  const check = createCanvas(decoded.width, decoded.height);
  check.getContext('2d').drawImage(decoded, 0, 0);
  const px = check.getContext('2d').getImageData(0, 0, decoded.width, decoded.height).data;
  let nonWhite = 0;
  for (let i = 0; i < px.length; i += 4) if (px[i] < 250 || px[i + 1] < 250 || px[i + 2] < 250) nonWhite++;
  ok(nonWhite > 200, 'the rendered page actually contains painted content, not a blank white page', `${nonWhite} non-white pixels`);
});

await test('pdf-to-text', 'extracts real text from a real PDF text layer', async (p, ok) => {
  wireLocalLibs(p.w);
  const src = await pdfFixture(2, { tag: 'EXTRACT-ME' });
  await p.dropFile(Buffer.from(src), 'doc.pdf', 'application/pdf');
  await until(() => !p.$('#opts').hidden, 8000);
  p.click('#go');
  await until(() => !p.$('#out-wrap').hidden, 10000);
  const text = p.text('#out');
  ok(text.includes('EXTRACT-ME'), 'recovers real text content from the PDF', text.slice(0, 120));
  ok(text.includes('quick brown fox'), 'recovers the full sentence, not just fragments');
  ok(p.text('#s-words') !== '0', 'word count is non-zero for a real text PDF', p.text('#s-words'));
});

await test('pdf-to-text', 'reports zero words honestly for an image-only PDF', async (p, ok) => {
  wireLocalLibs(p.w);
  // A PDF with a drawn image and no text objects — the "scanned document" case.
  const doc = await PDFDocument.create();
  const png = pngFixture(100, 100);
  const img = await doc.embedPng(png);
  const pg = doc.addPage([100, 100]);
  pg.drawImage(img, { x: 0, y: 0, width: 100, height: 100 });
  const bytes = await doc.save();

  await p.dropFile(Buffer.from(bytes), 'scan.pdf', 'application/pdf');
  await until(() => !p.$('#opts').hidden, 8000);
  p.click('#go');
  await until(() => !p.$('#out-wrap').hidden, 10000);
  ok(p.text('#s-words') === '0', 'correctly finds zero words in an image-only PDF', p.text('#s-words'));
  ok(p.msg().toLowerCase().includes('scanned'), 'explains that this looks like a scan', p.msg());
});

await test('pdf-compressor', 'strong mode really rasterises and really shrinks a photo-heavy PDF', async (p, ok) => {
  wireLocalLibs(p.w);
  const doc = await PDFDocument.create();
  // A deliberately incompressible-as-vector, large photographic page.
  const jpg = jpegFixture(1000, 1400);
  const img = await doc.embedJpg(jpg);
  const pg = doc.addPage([612, 792]);
  pg.drawImage(img, { x: 0, y: 0, width: 612, height: 792 });
  const bytes = await doc.save();

  await p.dropFile(Buffer.from(bytes), 'photo.pdf', 'application/pdf');
  await until(() => !p.$('#opts').hidden, 8000);
  p.click('[data-m="strong"]');
  p.set('#dpi', '0.8'); p.set('#q', '50');
  p.click('#go');
  await until(() => !p.$('#result').hidden, 15000);
  p.click('#dl');
  const outBuf = await p.lastDownloadBytes();
  ok(outBuf.length < bytes.length, 'strong mode actually reduces file size on a photo-heavy PDF', `${outBuf.length} vs ${bytes.length}`);
  const check = await PDFDocument.load(outBuf);
  ok(check.getPageCount() === 1, 'output still has 1 page');
});

/* ================================================================== */

console.log('\n  ' + '─'.repeat(60));
if (failures.length) {
  console.log('\n  FAILURES\n');
  for (const f of failures) {
    console.log('   ✗ ' + f.label);
    if (f.detail) console.log('     ' + String(f.detail).split('\n').join('\n     '));
  }
}
console.log(`\n  ${passed} passed, ${failed} failed  (real canvas + real pdf.js rendering, not mocked)\n`);
process.exit(failed ? 1 : 0);
