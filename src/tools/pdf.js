// MEGA TOOLS — PDF tools
// pdf-lib handles structural edits; pdf.js handles rendering and text extraction.
// Both are loaded lazily, only on the pages that need them.

const PDFLIB_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
const PDFJS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
const PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
// pdf.js needs these two asset directories to draw glyphs for standard (non-
// embedded) fonts and CID-keyed embedded fonts. cdnjs is known to sometimes
// prune auxiliary asset directories like these from its mirror even when the
// core JS bundle is present, so they're served from jsDelivr instead, which
// mirrors the full npm package. Without a working standardFontDataUrl, text
// set in a standard font with no embedded glyphs renders as a blank page —
// silently, with no error — which is why this is pinned explicitly rather
// than left to a default.
const PDFJS_STANDARD_FONTS = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/standard_fonts/';
const PDFJS_CMAPS = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/';

const PRIVACY = '<div class="notice privacy"><strong>Your PDFs stay on your device.</strong> Files are opened and rewritten in your browser. Nothing is uploaded to a server at any point.</div>';

// Shared helpers, inlined into every PDF tool page by the build.
const HELPERS = function () {
  window.PDFH = {
    lib: function () {
      return MT.lib('PDFLIB_URL_PLACEHOLDER').then(function () {
        if (!window.PDFLib) throw new Error('The PDF library could not start. Reload the page and try again.');
        return window.PDFLib;
      });
    },
    js: function () {
      return MT.lib('PDFJS_URL_PLACEHOLDER').then(function () {
        var lib = window.pdfjsLib;
        if (!lib) throw new Error('The PDF reader could not start. Reload the page and try again.');
        lib.GlobalWorkerOptions.workerSrc = 'PDFJS_WORKER_PLACEHOLDER';
        return lib;
      });
    },
    // Merged into every getDocument() call. Without these, pdf.js silently
    // renders blank text wherever a page uses a standard font (Helvetica,
    // Times, etc.) that isn't embedded in the file, or an embedded CID-keyed
    // font that needs a character map — no error, just missing glyphs.
    docOpts: { standardFontDataUrl: 'PDFJS_FONTS_PLACEHOLDER', cMapUrl: 'PDFJS_CMAPS_PLACEHOLDER', cMapPacked: true },
    // Open a PDF with pdf-lib, translating the common failures into plain English.
    open: function (PDFLib, buf, opts) {
      return PDFLib.PDFDocument.load(buf, opts || { ignoreEncryption: false }).catch(function (e) {
        var m = String(e && e.message || e);
        if (/encrypted|password/i.test(m)) {
          throw new Error('This PDF is password-protected. Remove the password in your PDF reader first, then try again.');
        }
        if (/Failed to parse|Invalid PDF|No PDF header/i.test(m)) {
          throw new Error('This file could not be read as a PDF. It may be corrupt, or renamed from another format.');
        }
        throw new Error('This PDF could not be opened: ' + m);
      });
    },
    // Parse "1-3, 5, 8-10" into a zero-based page index list.
    ranges: function (spec, total) {
      var out = [], seen = {};
      var parts = String(spec).split(',');
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i].trim();
        if (!p) continue;
        var m = /^(\d+)\s*(?:-|–|to)\s*(\d+)$/.exec(p);
        if (m) {
          var a = parseInt(m[1], 10), b = parseInt(m[2], 10);
          if (a < 1 || b < 1) return { err: 'Page numbers start at 1.' };
          if (a > total || b > total) return { err: 'This document has ' + total + ' pages, so page ' + Math.max(a, b) + ' does not exist.' };
          var step = a <= b ? 1 : -1;
          for (var n = a; step > 0 ? n <= b : n >= b; n += step) {
            if (!seen[n]) { seen[n] = 1; out.push(n - 1); }
          }
          continue;
        }
        if (!/^\d+$/.test(p)) return { err: '“' + p + '” is not a valid page or range. Use a format like 1-3, 5, 8.' };
        var v = parseInt(p, 10);
        if (v < 1) return { err: 'Page numbers start at 1.' };
        if (v > total) return { err: 'This document has ' + total + ' pages, so page ' + v + ' does not exist.' };
        if (!seen[v]) { seen[v] = 1; out.push(v - 1); }
      }
      if (!out.length) return { err: 'Enter at least one page number.' };
      return { pages: out };
    },
    fileRow: function (f, i) {
      return '<li data-i="' + i + '"><span class="fdrag" aria-hidden="true">⠿</span>' +
        '<span class="fname">' + MT.escapeHtml(f.name) + '</span>' +
        '<span class="fsize">' + MT.fmtBytes(f.size) + '</span>' +
        '<button class="fx" data-remove="' + i + '" aria-label="Remove ' + MT.escapeHtml(f.name) + '">✕</button></li>';
    }
  };
};

export const PRELUDE = 'var PDF_HELPERS = ' + HELPERS.toString()
  .replace('PDFLIB_URL_PLACEHOLDER', PDFLIB_URL)
  .replace('PDFJS_URL_PLACEHOLDER', PDFJS_URL)
  .replace('PDFJS_WORKER_PLACEHOLDER', PDFJS_WORKER)
  .replace('PDFJS_FONTS_PLACEHOLDER', PDFJS_STANDARD_FONTS)
  .replace('PDFJS_CMAPS_PLACEHOLDER', PDFJS_CMAPS) + '; PDF_HELPERS();';

export default [

/* ------------------------------------------------------------------ */
{
  slug: 'pdf-merger',
  name: 'PDF Merger',
  icon: '📚',
  category: 'pdf',
  desc: 'Combine several PDFs into one, in the order you choose.',
  seoTitle: 'PDF Merger — Combine PDF Files Online Free',
  metaDescription: 'Merge multiple PDF files into one document in your browser. Reorder files before combining, with no upload, no watermark and no page limit.',
  keywords: ['pdf merger', 'merge pdf', 'combine pdf files', 'join pdf online', 'pdf combiner'],
  popularity: 96, featured: true,
  related: ['pdf-splitter', 'pdf-page-extractor', 'pdf-compressor', 'pdf-rotator', 'jpg-to-pdf'],
  intro: 'Combine two or more PDFs into a single file. Pages are copied without re-encoding, so text stays selectable and quality is untouched.',
  html: PRIVACY + `
<div class="drop" id="zone">
  <div class="dz-icon" aria-hidden="true">📄</div>
  <div class="dz-main">Drop PDF files here, or click to choose</div>
  <div class="dz-sub">Two or more PDFs · up to 100 MB each</div>
  <input type="file" id="file" accept="application/pdf,.pdf" multiple>
</div>
<div class="msg" id="msg"></div>
<ul class="filelist" id="list"></ul>
<div class="actions" id="actions" hidden>
  <button class="btn btn-primary" id="go">Merge PDFs</button>
  <button class="btn btn-ghost" id="clear">Clear all</button>
</div>
<div class="progress" id="prog"><i></i></div>
<div id="result" hidden style="margin-top:16px">
  <div class="result-hero"><div class="rv" id="r-pages">—</div><div class="rl" id="r-lab">pages in the merged document</div></div>
  <div class="actions"><button class="btn btn-primary" id="dl">Download merged PDF</button></div>
</div>`,
  init: function () {
    var files = [], merged = null;

    function render() {
      MT.$('#list').innerHTML = files.map(function (f, i) { return PDFH.fileRow(f, i); }).join('');
      MT.$('#actions').hidden = files.length === 0;
      MT.$$('[data-remove]').forEach(function (b) {
        b.addEventListener('click', function () {
          files.splice(parseInt(b.dataset.remove, 10), 1);
          render();
          MT.$('#result').hidden = true;
        });
      });
      // Drag to reorder
      MT.$$('#list li').forEach(function (li) {
        li.draggable = true;
        li.addEventListener('dragstart', function (e) { e.dataTransfer.setData('text/plain', li.dataset.i); li.style.opacity = '.5'; });
        li.addEventListener('dragend', function () { li.style.opacity = '1'; });
        li.addEventListener('dragover', function (e) { e.preventDefault(); });
        li.addEventListener('drop', function (e) {
          e.preventDefault();
          var from = parseInt(e.dataTransfer.getData('text/plain'), 10);
          var to = parseInt(li.dataset.i, 10);
          if (isNaN(from) || from === to) return;
          var m = files.splice(from, 1)[0];
          files.splice(to, 0, m);
          render();
        });
      });
    }

    MT.dropzone({
      zone: '#zone', input: '#file', accept: ['application/pdf', '.pdf'],
      maxSize: 100 * 1024 * 1024, multiple: true,
      onError: function (m) { MT.msg('#msg', m, 'err'); },
      onFiles: function (fs) {
        files = files.concat(fs);
        MT.clearMsg('#msg');
        MT.$('#result').hidden = true;
        render();
      }
    });

    MT.on('#clear', 'click', function () {
      files = []; merged = null; render();
      MT.$('#result').hidden = true; MT.clearMsg('#msg');
    });

    MT.on('#go', 'click', MT.guard(function () {
      if (files.length < 2) { MT.msg('#msg', 'Add at least two PDF files to merge.', 'warn'); return; }
      var btn = MT.$('#go');
      MT.busy(btn, true, 'Merging…');
      MT.progress('#prog', 5);

      return PDFH.lib().then(function (PDFLib) {
        return PDFLib.PDFDocument.create().then(function (out) {
          var i = 0, skipped = [];
          function next() {
            if (i >= files.length) return out;
            var f = files[i];
            return MT.readAs(f, 'buffer')
              .then(function (buf) { return PDFH.open(PDFLib, buf); })
              .then(function (src) {
                return out.copyPages(src, src.getPageIndices()).then(function (pages) {
                  pages.forEach(function (p) { out.addPage(p); });
                });
              })
              .catch(function (e) { skipped.push(f.name + ' — ' + e.message); })
              .then(function () {
                i++;
                MT.progress('#prog', 5 + i / files.length * 80);
                window.__skipped = skipped;
                return next();
              });
          }
          return next();
        });
      }).then(function (out) {
        MT.progress('#prog', 95);
        if (out.getPageCount() === 0) throw new Error('No pages could be read from any of those files.');
        return out.save().then(function (bytes) {
          merged = new Blob([bytes], { type: 'application/pdf' });
          MT.busy(btn, false);
          MT.progress('#prog', null);
          MT.$('#r-pages').textContent = out.getPageCount();
          MT.$('#r-lab').textContent = 'pages · ' + MT.fmtBytes(merged.size);
          MT.$('#result').hidden = false;
          var skipped = window.__skipped || [];
          MT.msg('#msg', skipped.length
            ? 'Merged, but ' + MT.plural(skipped.length, 'file') + ' could not be read: ' + skipped.join('; ')
            : 'Merged ' + MT.plural(files.length, 'file') + ' into ' + out.getPageCount() + ' pages.',
            skipped.length ? 'warn' : 'ok');
          MT.done({ files: files.length, pages: out.getPageCount() });
        });
      }).catch(function (e) { MT.busy(btn, false); MT.progress('#prog', null); throw e; });
    }));

    MT.on('#dl', 'click', function () {
      if (!merged) { MT.toast('Merge first'); return; }
      MT.download(merged, 'merged.pdf');
    });
  },
  howto: [
    'Drop in two or more PDFs, or click to select them. You can add more at any time.',
    'Drag the rows to set the order — files are merged top to bottom.',
    'Press <b>Merge PDFs</b>, then download the combined document.'
  ],
  sections: [
    { h: 'What merging does to your files',
      p: `<p>Merging copies page objects from each source document into a new one. The page content streams are transferred as they are, so text stays selectable and searchable, vector graphics stay sharp, and images are never re-compressed. Quality is identical to the originals.</p>
<p>Some document-level features do not survive, because they belong to the file rather than to any page: bookmarks and outlines, form field structure across documents, attached files, and document-level JavaScript. Page content, annotations and links within a page are preserved.</p>` },
    { h: 'Mixed page sizes',
      p: `<p>Each page keeps its own dimensions and orientation. Merging an A4 report with a US Letter appendix and a landscape chart produces one file with three different page geometries — which is perfectly valid PDF and prints correctly, though the paper tray behaviour depends on your printer.</p>
<p>If you need everything on one size, normalise the pages in a PDF editor before merging. There is no way to resize page content without re-rendering it, which would lose the text layer.</p>` },
    { h: 'Order matters and is easy to get wrong',
      p: `<p>Files merge in the order shown in the list, which is the order you added them — not alphabetical, and not the order your file picker displayed. Selecting several files at once often produces an order that surprises people.</p>
<p>Drag the rows to rearrange before merging. It is worth checking, since a merged document has no memory of which file each page came from.</p>` }
  ],
  faq: [
    { q: 'Is there a limit on how many files I can merge?', a: 'No fixed limit, though each file is capped at 100 MB and everything is held in memory. Very large batches may be slow on a phone; merging in two stages works around it.' },
    { q: 'Are my documents uploaded?', a: 'No. The PDF library runs in your browser and reads files from disk directly. Nothing is transmitted, which is why this is safe for contracts and medical records.' },
    { q: 'Can it merge password-protected PDFs?', a: 'No. Encrypted files cannot be read without the password. Open the file in your PDF reader, remove the protection, save a copy, then merge.' },
    { q: 'Will the merged file be as large as the originals combined?', a: 'Roughly, sometimes slightly smaller — shared resources like embedded fonts can be deduplicated. If size matters, run the result through the PDF Compressor.' },
    { q: 'Do bookmarks survive?', a: 'No. Outlines are document-level structures and are dropped when pages move into a new document. Page content, links and annotations are kept.' }
  ]
},

/* ------------------------------------------------------------------ */
{
  slug: 'pdf-splitter',
  name: 'PDF Splitter',
  icon: '✂',
  category: 'pdf',
  desc: 'Split a PDF into separate files by range or page count.',
  seoTitle: 'PDF Splitter — Split PDF Files Online Free',
  metaDescription: 'Split a PDF into separate documents in your browser. Divide at fixed intervals, split every page, or define custom ranges. No upload required.',
  keywords: ['pdf splitter', 'split pdf', 'divide pdf', 'separate pdf pages', 'split pdf online'],
  popularity: 90, featured: true,
  related: ['pdf-merger', 'pdf-page-extractor', 'pdf-compressor', 'pdf-rotator', 'pdf-to-jpg'],
  intro: 'Break one PDF into several. Split every page into its own file, cut at fixed intervals, or define exactly which pages go into each output.',
  html: PRIVACY + `
<div class="drop" id="zone">
  <div class="dz-icon" aria-hidden="true">📄</div>
  <div class="dz-main">Drop a PDF here, or click to choose</div>
  <div class="dz-sub">One PDF · up to 100 MB</div>
  <input type="file" id="file" accept="application/pdf,.pdf">
</div>
<div class="msg" id="msg"></div>
<div id="opts" hidden style="margin-top:18px">
  <p class="hint" id="info"></p>
  <div class="field">
    <span class="lbl" id="m-lbl">Split method</span>
    <div class="seg" role="group" aria-labelledby="m-lbl" style="flex-wrap:wrap">
      <button type="button" data-m="each" aria-pressed="true">Every page separately</button>
      <button type="button" data-m="every" aria-pressed="false">Every N pages</button>
      <button type="button" data-m="ranges" aria-pressed="false">Custom ranges</button>
    </div>
  </div>
  <div class="field" data-panel="every" hidden><label for="n">Pages per file</label><input type="number" id="n" value="10" min="1" step="1"></div>
  <div class="field" data-panel="ranges" hidden>
    <label for="spec">Ranges — one output file per line</label>
    <textarea id="spec" spellcheck="false" style="min-height:100px" placeholder="1-5&#10;6-10&#10;11, 13, 15"></textarea>
    <p class="hint">Each line becomes one PDF. Use <code>1-5</code> for a range and commas for individual pages.</p>
  </div>
  <div class="actions">
    <button class="btn btn-primary" id="go">Split PDF</button>
    <button class="btn btn-ghost" id="reset">Start over</button>
  </div>
  <div class="progress" id="prog"><i></i></div>
</div>
<div id="result" hidden style="margin-top:16px">
  <span class="lbl">Output files</span>
  <ul class="filelist" id="outlist"></ul>
  <div class="actions"><button class="btn btn-primary" id="dlall">Download all</button></div>
  <p class="hint">Downloads start a moment apart. Your browser may ask permission to save multiple files.</p>
</div>`,
  init: function () {
    var buf = null, total = 0, mode = 'each', outputs = [], baseName = 'document';

    MT.$$('[data-m]').forEach(function (b) {
      b.addEventListener('click', function () {
        MT.$$('[data-m]').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        mode = b.dataset.m;
        MT.$$('[data-panel]').forEach(function (p) { p.hidden = p.dataset.panel !== mode; });
      });
    });

    MT.dropzone({
      zone: '#zone', input: '#file', accept: ['application/pdf', '.pdf'], maxSize: 100 * 1024 * 1024,
      onError: function (m) { MT.msg('#msg', m, 'err'); },
      onFiles: function (fs) {
        var f = fs[0];
        baseName = MT.safeName(f.name);
        MT.clearMsg('#msg');
        MT.$('#result').hidden = true;
        MT.readAs(f, 'buffer').then(function (b) {
          buf = b;
          return PDFH.lib().then(function (PDFLib) { return PDFH.open(PDFLib, buf); });
        }).then(function (doc) {
          total = doc.getPageCount();
          MT.$('#info').textContent = f.name + ' — ' + MT.plural(total, 'page') + ', ' + MT.fmtBytes(f.size);
          MT.$('#opts').hidden = false;
          MT.$('#spec').placeholder = '1-' + Math.min(5, total) + '\n' + (total > 5 ? '6-' + total : '');
        }).catch(function (e) { MT.msg('#msg', e.message, 'err'); });
      }
    });

    MT.on('#reset', 'click', function () {
      buf = null; outputs = [];
      MT.$('#opts').hidden = true; MT.$('#result').hidden = true; MT.clearMsg('#msg');
    });

    MT.on('#go', 'click', MT.guard(function () {
      if (!buf) { MT.msg('#msg', 'Choose a PDF first.', 'warn'); return; }
      var groups = [];
      if (mode === 'each') {
        for (var i = 0; i < total; i++) groups.push({ label: 'page-' + (i + 1), pages: [i] });
      } else if (mode === 'every') {
        var n = Math.round(MT.num('#n', 0));
        if (!n || n < 1) { MT.msg('#msg', 'Enter how many pages each file should contain.', 'err'); return; }
        if (n >= total) { MT.msg('#msg', 'That is the whole document — nothing to split. Use a smaller number.', 'warn'); return; }
        for (var s = 0; s < total; s += n) {
          var pages = [];
          for (var k = s; k < Math.min(s + n, total); k++) pages.push(k);
          groups.push({ label: 'pages-' + (s + 1) + '-' + Math.min(s + n, total), pages: pages });
        }
      } else {
        var lines = MT.$('#spec').value.split('\n').filter(function (l) { return l.trim(); });
        if (!lines.length) { MT.msg('#msg', 'Enter at least one range.', 'warn'); return; }
        for (var li = 0; li < lines.length; li++) {
          var r = PDFH.ranges(lines[li], total);
          if (r.err) { MT.msg('#msg', 'Line ' + (li + 1) + ': ' + r.err, 'err'); return; }
          groups.push({ label: 'part-' + (li + 1), pages: r.pages });
        }
      }
      if (groups.length > 100) { MT.msg('#msg', 'That would create ' + groups.length + ' files. The limit is 100 — use larger groups.', 'err'); return; }

      var btn = MT.$('#go');
      MT.busy(btn, true, 'Splitting…');
      MT.progress('#prog', 5);
      outputs = [];

      return PDFH.lib().then(function (PDFLib) {
        return PDFH.open(PDFLib, buf).then(function (src) {
          var i = 0;
          function next() {
            if (i >= groups.length) return;
            var g = groups[i];
            return PDFLib.PDFDocument.create().then(function (out) {
              return out.copyPages(src, g.pages).then(function (pages) {
                pages.forEach(function (p) { out.addPage(p); });
                return out.save();
              }).then(function (bytes) {
                outputs.push({ name: baseName + '-' + g.label + '.pdf', blob: new Blob([bytes], { type: 'application/pdf' }), pages: g.pages.length });
                i++;
                MT.progress('#prog', 5 + i / groups.length * 90);
                return next();
              });
            });
          }
          return next();
        });
      }).then(function () {
        MT.busy(btn, false);
        MT.progress('#prog', null);
        MT.$('#outlist').innerHTML = outputs.map(function (o, i) {
          return '<li><span class="fname">' + MT.escapeHtml(o.name) + '</span>' +
            '<span class="fsize">' + MT.plural(o.pages, 'page') + ' · ' + MT.fmtBytes(o.blob.size) + '</span>' +
            '<button class="btn btn-sm" data-dl="' + i + '">Save</button></li>';
        }).join('');
        MT.$$('[data-dl]').forEach(function (b) {
          b.addEventListener('click', function () {
            var o = outputs[parseInt(b.dataset.dl, 10)];
            MT.download(o.blob, o.name);
          });
        });
        MT.$('#result').hidden = false;
        MT.msg('#msg', 'Split into ' + MT.plural(outputs.length, 'file') + '.', 'ok');
        MT.done({ files: outputs.length });
      }).catch(function (e) { MT.busy(btn, false); MT.progress('#prog', null); throw e; });
    }));

    MT.on('#dlall', 'click', function () {
      if (!outputs.length) { MT.toast('Split first'); return; }
      MT.downloadZipless(outputs);
    });
  },
  howto: [
    'Drop in the PDF you want to split. The page count appears once it opens.',
    'Choose a method: one file per page, a fixed number of pages per file, or custom ranges.',
    'Press <b>Split PDF</b>, then save the files individually or all at once.'
  ],
  sections: [
    { h: 'The three split methods',
      p: `<p><b>Every page separately</b> produces one PDF per page. Useful for scanned batches where each page is a separate document — invoices, receipts, forms.</p>
<p><b>Every N pages</b> cuts at fixed intervals. This suits documents with a regular structure, like a book split into equal chunks or a statement bundle where each account occupies four pages.</p>
<p><b>Custom ranges</b> gives full control. Each line becomes one output file, so <code>1-5</code> on the first line and <code>6-20</code> on the second produces two documents. A line can mix ranges and individual pages: <code>1-3, 7, 12-14</code> creates one file containing seven pages.</p>` },
    { h: 'Splitting does not re-encode',
      p: `<p>Pages are copied as complete objects into new documents, exactly as with merging. Text stays selectable, images are untouched, and no quality is lost regardless of how many times you split and recombine.</p>
<p>One consequence surprises people: the split files can add up to more than the original. Each output must carry its own copy of any font or image resource its pages reference, so a shared embedded font gets duplicated across every file that uses it. For a text-heavy document split into many parts, the total can grow noticeably.</p>` }
  ],
  faq: [
    { q: 'Why do the downloads arrive one at a time?', a: 'Browsers block rapid consecutive downloads, so they are spaced a fraction of a second apart. Your browser may also ask permission to save multiple files — allow it, or save each one individually.' },
    { q: 'Can I split by bookmark or chapter?', a: 'Not currently. Open the bookmarks panel in your PDF reader to find the page numbers, then enter those as custom ranges.' },
    { q: 'What happens to form fields?', a: 'Fields on a page travel with it, but the document-level form structure is rebuilt. Complex interactive forms with calculations or cross-page logic may not behave as they did.' },
    { q: 'Is there a page limit?', a: 'The tool creates up to 100 output files at once. A 500-page document split one page at a time exceeds that, so split it in stages using ranges.' },
    { q: 'Can I split a scanned PDF?', a: 'Yes. Scanned pages are images inside a PDF, and they copy across exactly like any other page.' }
  ]
},

/* ------------------------------------------------------------------ */
{
  slug: 'pdf-compressor',
  name: 'PDF Compressor',
  icon: '🗜',
  category: 'pdf',
  desc: 'Reduce PDF file size, with an honest account of the trade-offs.',
  seoTitle: 'PDF Compressor — Reduce PDF File Size Online',
  metaDescription: 'Compress PDF files in your browser. Choose a light structural pass that keeps text selectable, or a strong pass that rasterises pages for much smaller files.',
  keywords: ['pdf compressor', 'compress pdf', 'reduce pdf size', 'shrink pdf', 'pdf file size reducer'],
  popularity: 95, featured: true,
  related: ['pdf-merger', 'pdf-splitter', 'pdf-to-jpg', 'image-compressor', 'pdf-page-extractor'],
  intro: 'Two compression modes with genuinely different results. Read the note on each before choosing — one keeps your text searchable and one does not.',
  html: PRIVACY + `
<div class="drop" id="zone">
  <div class="dz-icon" aria-hidden="true">📄</div>
  <div class="dz-main">Drop a PDF here, or click to choose</div>
  <div class="dz-sub">One PDF · up to 100 MB</div>
  <input type="file" id="file" accept="application/pdf,.pdf">
</div>
<div class="msg" id="msg"></div>
<div id="opts" hidden style="margin-top:18px">
  <p class="hint" id="info"></p>
  <div class="field">
    <span class="lbl" id="m-lbl">Compression mode</span>
    <div class="seg" role="group" aria-labelledby="m-lbl" style="flex-wrap:wrap">
      <button type="button" data-m="light" aria-pressed="true">Light — keeps text</button>
      <button type="button" data-m="strong" aria-pressed="false">Strong — rasterises pages</button>
    </div>
  </div>
  <div class="msg msg-info" data-show="true" id="modenote"></div>
  <div data-panel="strong" hidden>
    <div class="row">
      <div class="field"><label for="dpi">Render quality</label>
        <select id="dpi"><option value="1.6">High — 150 dpi equivalent</option><option value="1.1" selected>Balanced — 100 dpi</option><option value="0.8">Small — 72 dpi</option></select>
      </div>
      <div class="field"><label for="q">Image quality: <span id="qv">70</span></label><input type="range" id="q" min="30" max="95" value="70"></div>
    </div>
    <div class="checkline"><input type="checkbox" id="gray"><label for="gray">Convert to greyscale — smaller still, good for scanned text</label></div>
  </div>
  <div class="actions">
    <button class="btn btn-primary" id="go">Compress PDF</button>
    <button class="btn btn-ghost" id="reset">Start over</button>
  </div>
  <div class="progress" id="prog"><i></i></div>
</div>
<div id="result" hidden style="margin-top:16px">
  <div class="stat-grid">
    <div class="stat"><div class="sv" id="s-before">—</div><div class="sl">Before</div></div>
    <div class="stat"><div class="sv" id="s-after">—</div><div class="sl">After</div></div>
    <div class="stat"><div class="sv" id="s-saved">—</div><div class="sl">Saved</div></div>
  </div>
  <div class="actions"><button class="btn btn-primary" id="dl">Download compressed PDF</button></div>
</div>`,
  init: function () {
    var buf = null, mode = 'light', out = null, origSize = 0, baseName = 'document';
    var NOTES = {
      light: 'Rewrites the file structure, removes unused objects and enables object streams. Text stays selectable and searchable and nothing is re-rendered — but the saving is modest, typically 5–20%, and near zero on files that were already optimised.',
      strong: 'Renders every page to an image and rebuilds the PDF from those. This can cut a scanned document by 70% or more, but the text becomes a picture: no longer selectable, searchable or accessible to screen readers. Use it for scans and image-heavy documents, not for text you need to search.'
    };
    MT.$('#modenote').textContent = NOTES.light;

    MT.$$('[data-m]').forEach(function (b) {
      b.addEventListener('click', function () {
        MT.$$('[data-m]').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        mode = b.dataset.m;
        MT.$$('[data-panel]').forEach(function (p) { p.hidden = p.dataset.panel !== mode; });
        MT.$('#modenote').textContent = NOTES[mode];
        MT.$('#modenote').className = 'msg ' + (mode === 'strong' ? 'msg-warn' : 'msg-info');
      });
    });
    MT.on('#q', 'input', function (e) { MT.$('#qv').textContent = e.target.value; });

    MT.dropzone({
      zone: '#zone', input: '#file', accept: ['application/pdf', '.pdf'], maxSize: 100 * 1024 * 1024,
      onError: function (m) { MT.msg('#msg', m, 'err'); },
      onFiles: function (fs) {
        var f = fs[0];
        origSize = f.size;
        baseName = MT.safeName(f.name);
        MT.clearMsg('#msg');
        MT.$('#result').hidden = true;
        MT.readAs(f, 'buffer').then(function (b) {
          buf = b;
          return PDFH.lib().then(function (PDFLib) { return PDFH.open(PDFLib, buf); });
        }).then(function (doc) {
          MT.$('#info').textContent = f.name + ' — ' + MT.plural(doc.getPageCount(), 'page') + ', ' + MT.fmtBytes(f.size);
          MT.$('#opts').hidden = false;
        }).catch(function (e) { MT.msg('#msg', e.message, 'err'); });
      }
    });

    MT.on('#reset', 'click', function () {
      buf = null; out = null;
      MT.$('#opts').hidden = true; MT.$('#result').hidden = true; MT.clearMsg('#msg');
    });

    function finish(blob, note, kind) {
      out = blob;
      MT.$('#s-before').textContent = MT.fmtBytes(origSize);
      MT.$('#s-after').textContent = MT.fmtBytes(blob.size);
      var pct = (1 - blob.size / origSize) * 100;
      MT.$('#s-saved').textContent = (pct > 0 ? pct.toFixed(0) + '%' : 'none');
      MT.$('#s-saved').style.color = pct > 0 ? 'var(--ok)' : 'var(--warn)';
      MT.$('#result').hidden = false;
      MT.msg('#msg', note, kind);
      MT.done({ mode: mode, saved: Math.round(pct) });
    }

    MT.on('#go', 'click', MT.guard(function () {
      if (!buf) { MT.msg('#msg', 'Choose a PDF first.', 'warn'); return; }
      var btn = MT.$('#go');
      MT.busy(btn, true, 'Compressing…');
      MT.progress('#prog', 5);

      if (mode === 'light') {
        return PDFH.lib().then(function (PDFLib) {
          return PDFH.open(PDFLib, buf).then(function (doc) {
            MT.progress('#prog', 50);
            return doc.save({ useObjectStreams: true, addDefaultPage: false });
          });
        }).then(function (bytes) {
          MT.busy(btn, false); MT.progress('#prog', null);
          var blob = new Blob([bytes], { type: 'application/pdf' });
          var pct = (1 - blob.size / origSize) * 100;
          finish(blob, pct > 1
            ? 'Structural pass complete — ' + pct.toFixed(0) + '% smaller, with text fully intact.'
            : 'This PDF was already well optimised, so a structural pass cannot shrink it. If it is a scan, try Strong mode.',
            pct > 1 ? 'ok' : 'warn');
        }).catch(function (e) { MT.busy(btn, false); MT.progress('#prog', null); throw e; });
      }

      // Strong: render each page with pdf.js, re-embed as JPEG via pdf-lib
      var scale = parseFloat(MT.$('#dpi').value);
      var quality = parseInt(MT.$('#q').value, 10) / 100;
      var gray = MT.$('#gray').checked;

      return Promise.all([PDFH.js(), PDFH.lib()]).then(function (mods) {
        var pdfjsLib = mods[0], PDFLib = mods[1];
        return pdfjsLib.getDocument(Object.assign({ data: buf.slice(0) }, PDFH.docOpts)).promise.then(function (src) {
          return PDFLib.PDFDocument.create().then(function (outDoc) {
            var n = src.numPages, i = 1;
            function next() {
              if (i > n) return outDoc;
              return src.getPage(i).then(function (page) {
                var vp = page.getViewport({ scale: scale });
                var canvas = document.createElement('canvas');
                canvas.width = Math.max(1, Math.floor(vp.width));
                canvas.height = Math.max(1, Math.floor(vp.height));
                var ctx = canvas.getContext('2d');
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                return page.render({ canvasContext: ctx, viewport: vp }).promise.then(function () {
                  if (gray) {
                    var d = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    var px = d.data;
                    for (var p = 0; p < px.length; p += 4) {
                      var v = (px[p] * 0.299 + px[p + 1] * 0.587 + px[p + 2] * 0.114) | 0;
                      px[p] = px[p + 1] = px[p + 2] = v;
                    }
                    ctx.putImageData(d, 0, 0);
                  }
                  return MT.canvasToBlob(canvas, 'image/jpeg', quality);
                }).then(function (blob) {
                  return blob.arrayBuffer();
                }).then(function (ab) {
                  return outDoc.embedJpg(ab).then(function (img) {
                    var orig = page.getViewport({ scale: 1 });
                    var pg = outDoc.addPage([orig.width, orig.height]);
                    pg.drawImage(img, { x: 0, y: 0, width: orig.width, height: orig.height });
                    i++;
                    MT.progress('#prog', 5 + (i - 1) / n * 90);
                    return next();
                  });
                });
              });
            }
            return next();
          });
        });
      }).then(function (outDoc) {
        return outDoc.save({ useObjectStreams: true });
      }).then(function (bytes) {
        MT.busy(btn, false); MT.progress('#prog', null);
        var blob = new Blob([bytes], { type: 'application/pdf' });
        var pct = (1 - blob.size / origSize) * 100;
        finish(blob, pct > 0
          ? 'Rasterised and compressed — ' + pct.toFixed(0) + '% smaller. The text in this file is now part of the page image and is no longer selectable or searchable.'
          : 'The result is larger than the original, which happens when the source is already a compact text PDF. Use Light mode instead.',
          pct > 0 ? 'warn' : 'err');
      }).catch(function (e) { MT.busy(btn, false); MT.progress('#prog', null); throw e; });
    }));

    MT.on('#dl', 'click', function () {
      if (!out) { MT.toast('Compress first'); return; }
      MT.download(out, MT.safeName(baseName, 'pdf').replace('.pdf', '-compressed.pdf'));
    });
  },
  howto: [
    'Drop in the PDF you want to shrink.',
    'Choose <b>Light</b> to keep text selectable, or <b>Strong</b> for a much smaller file where pages become images.',
    'Press <b>Compress PDF</b> and compare the before and after sizes before downloading.'
  ],
  sections: [
    { h: 'Why PDF compression is not one thing',
      p: `<p>A PDF is a container. Its size can come from embedded fonts, vector drawing instructions, scanned page images, metadata, or leftover objects from previous edits. There is no single operation that shrinks all of them, which is why "compress PDF" means different things in different tools — and why results vary so much between them.</p>
<p>This tool is explicit about which operation it is performing, because the trade-off matters more than the number:</p>
<ul>
<li><b>Light</b> rewrites the file structure: unreferenced objects are dropped and the remainder is packed into object streams. Nothing is re-rendered. Text, vectors and images survive exactly. The saving is real but modest.</li>
<li><b>Strong</b> renders each page to a bitmap and rebuilds the document around those images. The saving can be dramatic on scans, and the cost is that the page becomes a picture.</li>
</ul>` },
    { h: 'What Strong mode costs you',
      p: `<p>Rasterising is not a compression setting — it changes what the document <em>is</em>. After a strong pass:</p>
<ul>
<li>Text cannot be selected, copied or searched.</li>
<li>Screen readers cannot read the page, so the document is no longer accessible.</li>
<li>Links, form fields and annotations are gone.</li>
<li>Zooming in shows pixels rather than crisp type.</li>
</ul>
<p>For a scanned document these losses are mostly theoretical — the text was already an image. For a PDF exported from a word processor, they are severe, and the file will often get <em>larger</em> anyway, because a page of text compresses far better as text than as a photograph of text. The tool warns you when that happens.</p>` },
    { h: 'Getting a smaller PDF a different way',
      p: `<p>If neither mode gives what you need, the largest win is usually upstream. Export from the source application at a lower image resolution, or compress the images before placing them. A 300 dpi scan is often three times the size of a perfectly readable 150 dpi one.</p>
<p>Removing pages you do not need is also worth trying first — the PDF Page Extractor will pull out just the relevant section, which is frequently a bigger saving than any compression pass.</p>` }
  ],
  faq: [
    { q: 'Why did Light mode barely change the size?', a: 'The file was already optimised, or its bulk is images rather than structure. Structural compression can only remove overhead, and modern PDF exporters leave little of it.' },
    { q: 'Will Strong mode make my text blurry?', a: 'At the balanced setting, text stays readable on screen and prints acceptably. At the smallest setting it softens noticeably. Check the result before relying on it for anything printed.' },
    { q: 'Can I get the text back after Strong mode?', a: 'Not from this file — the text layer is gone. Keep your original. Recovering text from the images would require OCR, which is a different process.' },
    { q: 'Is my document uploaded?', a: 'No. Both modes run in your browser, including page rendering. Confidential documents never leave your device.' },
    { q: 'Which mode should I use for a scanned contract?', a: 'Strong, with greyscale switched on. Scans are already images, so you lose nothing that was there, and greyscale typically halves the size again.' }
  ]
},

/* ------------------------------------------------------------------ */
{
  slug: 'pdf-to-jpg',
  name: 'PDF to JPG',
  icon: '🖼',
  category: 'pdf',
  desc: 'Convert PDF pages into JPG or PNG images.',
  seoTitle: 'PDF to JPG Converter — Free Online, No Upload',
  metaDescription: 'Convert PDF pages to JPG or PNG images in your browser. Choose resolution and quality, convert selected pages, and download without uploading.',
  keywords: ['pdf to jpg', 'pdf to image', 'convert pdf to jpg', 'pdf to png', 'extract pdf images'],
  popularity: 91, featured: true,
  related: ['jpg-to-pdf', 'pdf-to-text', 'pdf-compressor', 'pdf-splitter', 'image-compressor'],
  intro: 'Render pages as images at the resolution you choose. Useful for slides, thumbnails, and pasting a page into a document that will not accept a PDF.',
  html: PRIVACY + `
<div class="drop" id="zone">
  <div class="dz-icon" aria-hidden="true">📄</div>
  <div class="dz-main">Drop a PDF here, or click to choose</div>
  <div class="dz-sub">One PDF · up to 100 MB</div>
  <input type="file" id="file" accept="application/pdf,.pdf">
</div>
<div class="msg" id="msg"></div>
<div id="opts" hidden style="margin-top:18px">
  <p class="hint" id="info"></p>
  <div class="row">
    <div class="field"><label for="pages">Pages</label><input type="text" id="pages" placeholder="all, or 1-5, 8" value="all"></div>
    <div class="field"><label for="dpi">Resolution</label>
      <select id="dpi"><option value="1.04">72 dpi — screen</option><option value="2.08" selected>150 dpi — general use</option><option value="4.17">300 dpi — print</option></select>
    </div>
  </div>
  <div class="row">
    <div class="field"><label for="fmt">Format</label><select id="fmt"><option value="image/jpeg">JPG</option><option value="image/png">PNG — lossless, larger</option></select></div>
    <div class="field" id="q-wrap"><label for="q">Quality: <span id="qv">88</span></label><input type="range" id="q" min="40" max="100" value="88"></div>
  </div>
  <div class="actions">
    <button class="btn btn-primary" id="go">Convert to images</button>
    <button class="btn btn-ghost" id="reset">Start over</button>
  </div>
  <div class="progress" id="prog"><i></i></div>
</div>
<div id="result" hidden style="margin-top:16px">
  <div class="actions"><button class="btn btn-primary" id="dlall">Download all</button></div>
  <div class="preview-grid" id="grid"></div>
</div>`,
  init: function () {
    var buf = null, total = 0, outputs = [], baseName = 'page';

    MT.on('#q', 'input', function (e) { MT.$('#qv').textContent = e.target.value; });
    MT.on('#fmt', 'change', function (e) { MT.$('#q-wrap').hidden = e.target.value === 'image/png'; });

    MT.dropzone({
      zone: '#zone', input: '#file', accept: ['application/pdf', '.pdf'], maxSize: 100 * 1024 * 1024,
      onError: function (m) { MT.msg('#msg', m, 'err'); },
      onFiles: function (fs) {
        var f = fs[0];
        baseName = MT.safeName(f.name);
        MT.clearMsg('#msg');
        MT.$('#result').hidden = true;
        MT.readAs(f, 'buffer').then(function (b) {
          buf = b;
          return PDFH.js().then(function (lib) { return lib.getDocument(Object.assign({ data: buf.slice(0) }, PDFH.docOpts)).promise; });
        }).then(function (doc) {
          total = doc.numPages;
          MT.$('#info').textContent = f.name + ' — ' + MT.plural(total, 'page') + ', ' + MT.fmtBytes(f.size);
          MT.$('#opts').hidden = false;
        }).catch(function (e) {
          MT.msg('#msg', /password/i.test(e.message)
            ? 'This PDF is password-protected. Remove the password first, then try again.'
            : 'This file could not be read as a PDF.', 'err');
        });
      }
    });

    MT.on('#reset', 'click', function () {
      buf = null; outputs = [];
      MT.$('#opts').hidden = true; MT.$('#result').hidden = true; MT.clearMsg('#msg');
    });

    MT.on('#go', 'click', MT.guard(function () {
      if (!buf) { MT.msg('#msg', 'Choose a PDF first.', 'warn'); return; }
      var spec = MT.$('#pages').value.trim();
      var wanted;
      if (!spec || spec.toLowerCase() === 'all') {
        wanted = [];
        for (var i = 0; i < total; i++) wanted.push(i);
      } else {
        var r = PDFH.ranges(spec, total);
        if (r.err) { MT.msg('#msg', r.err, 'err'); return; }
        wanted = r.pages;
      }
      if (wanted.length > 60) { MT.msg('#msg', 'Rendering ' + wanted.length + ' pages at once may exhaust memory. Convert up to 60 at a time.', 'err'); return; }

      var scale = parseFloat(MT.$('#dpi').value);
      var type = MT.$('#fmt').value;
      var q = parseInt(MT.$('#q').value, 10) / 100;
      var btn = MT.$('#go');
      MT.busy(btn, true, 'Rendering…');
      MT.progress('#prog', 3);
      outputs = [];

      return PDFH.js().then(function (lib) {
        return lib.getDocument(Object.assign({ data: buf.slice(0) }, PDFH.docOpts)).promise.then(function (doc) {
          var k = 0;
          function next() {
            if (k >= wanted.length) return;
            var pageNo = wanted[k] + 1;
            return doc.getPage(pageNo).then(function (page) {
              var vp = page.getViewport({ scale: scale });
              var canvas = document.createElement('canvas');
              canvas.width = Math.max(1, Math.floor(vp.width));
              canvas.height = Math.max(1, Math.floor(vp.height));
              var ctx = canvas.getContext('2d');
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              return page.render({ canvasContext: ctx, viewport: vp }).promise.then(function () {
                return MT.canvasToBlob(canvas, type, type === 'image/png' ? undefined : q);
              }).then(function (blob) {
                outputs.push({
                  name: baseName + '-page-' + pageNo + (type === 'image/png' ? '.png' : '.jpg'),
                  blob: blob, w: canvas.width, h: canvas.height, page: pageNo
                });
                k++;
                MT.progress('#prog', 3 + k / wanted.length * 95);
                return next();
              });
            });
          }
          return next();
        });
      }).then(function () {
        MT.busy(btn, false);
        MT.progress('#prog', null);
        MT.$('#grid').innerHTML = outputs.map(function (o, i) {
          return '<figure><img src="' + URL.createObjectURL(o.blob) + '" alt="Page ' + o.page + '" loading="lazy">' +
            '<figcaption>Page ' + o.page + ' · ' + o.w + '×' + o.h + ' · ' + MT.fmtBytes(o.blob.size) +
            '<br><button class="btn btn-sm" data-dl="' + i + '" style="margin-top:5px">Save</button></figcaption></figure>';
        }).join('');
        MT.$$('[data-dl]').forEach(function (b) {
          b.addEventListener('click', function () {
            var o = outputs[parseInt(b.dataset.dl, 10)];
            MT.download(o.blob, o.name);
          });
        });
        MT.$('#result').hidden = false;
        MT.msg('#msg', 'Rendered ' + MT.plural(outputs.length, 'page') + '.', 'ok');
        MT.done({ pages: outputs.length });
      }).catch(function (e) { MT.busy(btn, false); MT.progress('#prog', null); throw e; });
    }));

    MT.on('#dlall', 'click', function () {
      if (!outputs.length) { MT.toast('Convert first'); return; }
      MT.downloadZipless(outputs);
    });
  },
  howto: [
    'Drop in a PDF. The page count appears once it loads.',
    'Enter <code>all</code>, or a range like <code>1-5, 8</code>, and pick a resolution.',
    'Press <b>Convert to images</b>, then save individual pages or all of them.'
  ],
  sections: [
    { h: 'Choosing a resolution',
      p: `<p>PDF pages are described in points — 72 to the inch — so rendering means choosing how many pixels to produce per point. That decision drives both sharpness and file size, and size grows with the square of the scale: doubling the resolution quadruples the pixels.</p>
<table>
<tr><th>Setting</th><th>A4 page becomes</th><th>Good for</th></tr>
<tr><td>72 dpi</td><td>~595 × 842 px</td><td>Thumbnails, quick previews</td></tr>
<tr><td>150 dpi</td><td>~1240 × 1754 px</td><td>Screen viewing, slides, most uses</td></tr>
<tr><td>300 dpi</td><td>~2480 × 3508 px</td><td>Printing, archiving, OCR input</td></tr>
</table>` },
    { h: 'JPG or PNG?',
      p: `<p>It depends on what the page contains. <b>JPG</b> is right for pages with photographs or complex artwork — much smaller, and the compression suits continuous-tone imagery.</p>
<p><b>PNG</b> is right for pages that are mostly text, diagrams or line art. JPG compression produces ringing artefacts around sharp black-on-white edges, which is exactly what text is made of. PNG is lossless, so text renders cleanly — the file is larger, but for a text page it is sometimes smaller too.</p>
<p>If you plan to run OCR on the output, use PNG at 300 dpi. Recognition accuracy drops measurably on JPG artefacts.</p>` },
    { h: 'What you lose by converting',
      p: `<p>An image of a page is a picture. The text cannot be selected or searched, screen readers cannot read it, links stop working, and zooming in shows pixels instead of crisp type.</p>
<p>That is fine when an image is what you need — a slide, a preview thumbnail, a figure to drop into a presentation. It is the wrong move for sharing a document someone needs to read or search. Keep the PDF for that.</p>` }
  ],
  faq: [
    { q: 'Can I convert just one page?', a: 'Yes. Type the page number in the pages field. Ranges and lists work too, so 1-3, 7, 12 renders five specific pages.' },
    { q: 'Why is there a 60-page limit per run?', a: 'Each page is rendered to a canvas and held in memory. Beyond about sixty pages at print resolution, browsers commonly run out and fail. Convert in batches.' },
    { q: 'Does it extract the embedded images from the PDF?', a: 'No — it renders the complete page as it appears, including text and vector graphics. Pulling out original embedded images at their native resolution is a different operation.' },
    { q: 'Are my pages uploaded?', a: 'No. Rendering happens in your browser with pdf.js. Nothing crosses the network.' },
    { q: 'Why do the downloads come one at a time?', a: 'Browsers throttle rapid consecutive downloads, so they are spaced slightly apart. Allow multiple downloads when prompted, or save pages individually.' }
  ]
},

/* ------------------------------------------------------------------ */
{
  slug: 'jpg-to-pdf',
  name: 'JPG to PDF',
  icon: '📑',
  category: 'pdf',
  desc: 'Turn images into a single PDF, with page size options.',
  seoTitle: 'JPG to PDF Converter — Images to PDF Online Free',
  metaDescription: 'Combine JPG and PNG images into one PDF in your browser. Choose page size, orientation and margins, reorder images, and download without uploading.',
  keywords: ['jpg to pdf', 'image to pdf', 'convert jpg to pdf', 'png to pdf', 'photos to pdf'],
  popularity: 89, featured: true,
  related: ['pdf-to-jpg', 'pdf-merger', 'pdf-compressor', 'image-compressor', 'image-resizer'],
  intro: 'Combine photos or scans into one PDF. Choose a standard page size with margins, or let each page match its image exactly.',
  html: PRIVACY + `
<div class="drop" id="zone">
  <div class="dz-icon" aria-hidden="true">🖼</div>
  <div class="dz-main">Drop images here, or click to choose</div>
  <div class="dz-sub">JPG and PNG · up to 25 MB each</div>
  <input type="file" id="file" accept="image/jpeg,image/png,.jpg,.jpeg,.png" multiple>
</div>
<div class="msg" id="msg"></div>
<ul class="filelist" id="list"></ul>
<div id="opts" hidden style="margin-top:16px">
  <div class="row">
    <div class="field"><label for="size">Page size</label>
      <select id="size">
        <option value="fit">Fit each page to its image</option>
        <option value="a4" selected>A4 — 210 × 297 mm</option>
        <option value="letter">US Letter — 8.5 × 11 in</option>
        <option value="a5">A5 — 148 × 210 mm</option>
        <option value="legal">US Legal — 8.5 × 14 in</option>
      </select>
    </div>
    <div class="field"><label for="orient">Orientation</label>
      <select id="orient"><option value="auto">Match each image</option><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select>
    </div>
    <div class="field"><label for="margin">Margin (mm)</label><input type="number" id="margin" value="10" min="0" max="50" step="1"></div>
  </div>
  <div class="actions">
    <button class="btn btn-primary" id="go">Create PDF</button>
    <button class="btn btn-ghost" id="clear">Clear all</button>
  </div>
  <div class="progress" id="prog"><i></i></div>
</div>
<div id="result" hidden style="margin-top:16px">
  <div class="result-hero"><div class="rv" id="r-pages">—</div><div class="rl" id="r-lab">pages</div></div>
  <div class="actions"><button class="btn btn-primary" id="dl">Download PDF</button></div>
</div>`,
  init: function () {
    var files = [], out = null;
    var SIZES = { a4: [595.28, 841.89], letter: [612, 792], a5: [419.53, 595.28], legal: [612, 1008] };

    function render() {
      MT.$('#list').innerHTML = files.map(function (f, i) { return PDFH.fileRow(f, i); }).join('');
      MT.$('#opts').hidden = files.length === 0;
      MT.$$('[data-remove]').forEach(function (b) {
        b.addEventListener('click', function () {
          files.splice(parseInt(b.dataset.remove, 10), 1);
          render(); MT.$('#result').hidden = true;
        });
      });
      MT.$$('#list li').forEach(function (li) {
        li.draggable = true;
        li.addEventListener('dragstart', function (e) { e.dataTransfer.setData('text/plain', li.dataset.i); li.style.opacity = '.5'; });
        li.addEventListener('dragend', function () { li.style.opacity = '1'; });
        li.addEventListener('dragover', function (e) { e.preventDefault(); });
        li.addEventListener('drop', function (e) {
          e.preventDefault();
          var from = parseInt(e.dataTransfer.getData('text/plain'), 10), to = parseInt(li.dataset.i, 10);
          if (isNaN(from) || from === to) return;
          files.splice(to, 0, files.splice(from, 1)[0]);
          render();
        });
      });
    }

    MT.dropzone({
      zone: '#zone', input: '#file', accept: ['image/jpeg', 'image/png', '.jpg', '.jpeg', '.png'],
      maxSize: 25 * 1024 * 1024, multiple: true,
      onError: function (m) { MT.msg('#msg', m, 'err'); },
      onFiles: function (fs) {
        files = files.concat(fs);
        MT.clearMsg('#msg');
        MT.$('#result').hidden = true;
        render();
      }
    });
    MT.on('#clear', 'click', function () {
      files = []; out = null; render();
      MT.$('#result').hidden = true; MT.clearMsg('#msg');
    });

    MT.on('#go', 'click', MT.guard(function () {
      if (!files.length) { MT.msg('#msg', 'Add at least one image.', 'warn'); return; }
      var btn = MT.$('#go');
      MT.busy(btn, true, 'Building PDF…');
      MT.progress('#prog', 5);
      var sizeKey = MT.$('#size').value;
      var orient = MT.$('#orient').value;
      var marginMm = Math.max(0, Math.min(50, MT.num('#margin', 10)));
      var margin = marginMm * 2.834645669;

      return PDFH.lib().then(function (PDFLib) {
        return PDFLib.PDFDocument.create().then(function (doc) {
          var i = 0, failed = [];
          function next() {
            if (i >= files.length) return doc;
            var f = files[i];
            return MT.readAs(f, 'buffer').then(function (buf) {
              var isPng = f.type === 'image/png' || /\.png$/i.test(f.name);
              return (isPng ? doc.embedPng(buf) : doc.embedJpg(buf));
            }).then(function (img) {
              var iw = img.width, ih = img.height;
              var pw, ph;
              if (sizeKey === 'fit') {
                pw = iw; ph = ih;
                var page0 = doc.addPage([pw, ph]);
                page0.drawImage(img, { x: 0, y: 0, width: pw, height: ph });
              } else {
                var base = SIZES[sizeKey];
                var landscape = orient === 'landscape' || (orient === 'auto' && iw > ih);
                pw = landscape ? base[1] : base[0];
                ph = landscape ? base[0] : base[1];
                var page = doc.addPage([pw, ph]);
                var availW = Math.max(1, pw - margin * 2), availH = Math.max(1, ph - margin * 2);
                var scale = Math.min(availW / iw, availH / ih);
                var w = iw * scale, h = ih * scale;
                page.drawImage(img, { x: (pw - w) / 2, y: (ph - h) / 2, width: w, height: h });
              }
            }).catch(function () {
              failed.push(f.name);
            }).then(function () {
              i++;
              window.__failed = failed;
              MT.progress('#prog', 5 + i / files.length * 85);
              return next();
            });
          }
          return next();
        });
      }).then(function (doc) {
        if (doc.getPageCount() === 0) throw new Error('None of those images could be embedded. Only JPG and PNG are supported.');
        return doc.save().then(function (bytes) {
          out = new Blob([bytes], { type: 'application/pdf' });
          MT.busy(btn, false);
          MT.progress('#prog', null);
          MT.$('#r-pages').textContent = doc.getPageCount();
          MT.$('#r-lab').textContent = 'pages · ' + MT.fmtBytes(out.size);
          MT.$('#result').hidden = false;
          var failed = window.__failed || [];
          MT.msg('#msg', failed.length
            ? 'Created, but ' + MT.plural(failed.length, 'image') + ' could not be embedded: ' + failed.join(', ') + '. Convert them to JPG or PNG first.'
            : 'Created a ' + doc.getPageCount() + '-page PDF.', failed.length ? 'warn' : 'ok');
          MT.done({ pages: doc.getPageCount() });
        });
      }).catch(function (e) { MT.busy(btn, false); MT.progress('#prog', null); throw e; });
    }));

    MT.on('#dl', 'click', function () {
      if (!out) { MT.toast('Create the PDF first'); return; }
      MT.download(out, 'images.pdf');
    });
  },
  howto: [
    'Drop in your images, or click to select several at once.',
    'Drag the rows to set the page order.',
    'Choose a page size — A4 with margins for documents, or "fit each page to its image" for photos — then press <b>Create PDF</b>.'
  ],
  sections: [
    { h: 'Page size: fit or fixed?',
      p: `<p><b>Fit each page to its image</b> makes every page exactly the pixel dimensions of its image. Nothing is cropped, nothing is letterboxed, and the file stays compact. This is the right choice for photo collections and anything that will only be viewed on screen.</p>
<p><b>A fixed size</b> — A4, Letter and so on — gives every page identical dimensions with the image centred inside the margins. This is what you want for anything that will be printed, filed or submitted. Scanned receipts, forms and ID documents all belong here, because a document with consistent pages behaves predictably in a printer and a document management system.</p>` },
    { h: 'Image quality is carried through unchanged',
      p: `<p>JPG images are embedded exactly as they are — the original compressed data is placed into the PDF without decoding and re-encoding. The image in the PDF is bit-for-bit the file you supplied, so there is no second round of lossy compression.</p>
<p>PNG images are embedded losslessly too, but they can make the PDF considerably larger, since PNG does not compress photographic content well. If you are combining photos and the file size matters, convert them to JPG first with the Image Compressor.</p>
<p>Only JPG and PNG can be embedded directly. WebP, HEIC, GIF and TIFF are not supported by the PDF format itself — convert those to JPG or PNG first.</p>` }
  ],
  faq: [
    { q: 'What image formats work?', a: 'JPG and PNG. These are the two raster formats PDF supports natively. For anything else — WebP, HEIC from an iPhone, GIF or TIFF — convert first using the WebP Converter or PNG to JPG.' },
    { q: 'Can I reorder the images?', a: 'Yes. Drag the rows in the list before creating the PDF. Pages are built top to bottom in the order shown.' },
    { q: 'Why is my PDF so large?', a: 'It contains the images at full resolution. Phone photos are several megabytes each. Compress or resize them first if the total matters — a 10-page PDF of unedited phone photos can easily exceed 40 MB.' },
    { q: 'Will the text in my scans be searchable?', a: 'No. Images placed in a PDF stay images. Making scanned text searchable requires OCR, which is a separate process.' },
    { q: 'Are my photos uploaded?', a: 'No. The PDF is assembled in your browser and never leaves your device.' }
  ]
},

/* ------------------------------------------------------------------ */
{
  slug: 'pdf-rotator',
  name: 'PDF Rotator',
  icon: '↻',
  category: 'pdf',
  desc: 'Rotate PDF pages permanently, all or selected.',
  seoTitle: 'PDF Rotator — Rotate PDF Pages Online Free',
  metaDescription: 'Rotate PDF pages 90, 180 or 270 degrees and save the change permanently. Rotate every page or only the ones you choose, entirely in your browser.',
  keywords: ['pdf rotator', 'rotate pdf', 'rotate pdf pages', 'turn pdf sideways', 'fix pdf orientation'],
  popularity: 84,
  related: ['pdf-merger', 'pdf-splitter', 'pdf-page-extractor', 'pdf-to-jpg', 'image-rotator'],
  intro: 'Fix sideways scans permanently. Unlike rotating in a viewer, this writes the new orientation into the file so it stays that way everywhere.',
  html: PRIVACY + `
<div class="drop" id="zone">
  <div class="dz-icon" aria-hidden="true">📄</div>
  <div class="dz-main">Drop a PDF here, or click to choose</div>
  <div class="dz-sub">One PDF · up to 100 MB</div>
  <input type="file" id="file" accept="application/pdf,.pdf">
</div>
<div class="msg" id="msg"></div>
<div id="opts" hidden style="margin-top:18px">
  <p class="hint" id="info"></p>
  <div class="row">
    <div class="field"><label for="pages">Pages to rotate</label><input type="text" id="pages" value="all" placeholder="all, or 1-3, 7"></div>
    <div class="field"><label for="angle">Rotate by</label>
      <select id="angle"><option value="90">90° clockwise</option><option value="180">180°</option><option value="270">90° anticlockwise</option></select>
    </div>
  </div>
  <div class="checkline"><input type="checkbox" id="onlyLandscape"><label for="onlyLandscape">Only rotate pages that are currently landscape</label></div>
  <div class="actions">
    <button class="btn btn-primary" id="go">Rotate pages</button>
    <button class="btn btn-ghost" id="reset">Start over</button>
  </div>
  <div class="progress" id="prog"><i></i></div>
</div>
<div id="result" hidden style="margin-top:16px">
  <div class="result-hero"><div class="rv" id="r-count">—</div><div class="rl">pages rotated</div></div>
  <div class="actions"><button class="btn btn-primary" id="dl">Download rotated PDF</button></div>
</div>`,
  init: function () {
    var buf = null, total = 0, out = null, baseName = 'document';

    MT.dropzone({
      zone: '#zone', input: '#file', accept: ['application/pdf', '.pdf'], maxSize: 100 * 1024 * 1024,
      onError: function (m) { MT.msg('#msg', m, 'err'); },
      onFiles: function (fs) {
        var f = fs[0];
        baseName = MT.safeName(f.name);
        MT.clearMsg('#msg');
        MT.$('#result').hidden = true;
        MT.readAs(f, 'buffer').then(function (b) {
          buf = b;
          return PDFH.lib().then(function (PDFLib) { return PDFH.open(PDFLib, buf); });
        }).then(function (doc) {
          total = doc.getPageCount();
          MT.$('#info').textContent = f.name + ' — ' + MT.plural(total, 'page') + ', ' + MT.fmtBytes(f.size);
          MT.$('#opts').hidden = false;
        }).catch(function (e) { MT.msg('#msg', e.message, 'err'); });
      }
    });

    MT.on('#reset', 'click', function () {
      buf = null; out = null;
      MT.$('#opts').hidden = true; MT.$('#result').hidden = true; MT.clearMsg('#msg');
    });

    MT.on('#go', 'click', MT.guard(function () {
      if (!buf) { MT.msg('#msg', 'Choose a PDF first.', 'warn'); return; }
      var spec = MT.$('#pages').value.trim();
      var wanted;
      if (!spec || spec.toLowerCase() === 'all') {
        wanted = [];
        for (var i = 0; i < total; i++) wanted.push(i);
      } else {
        var r = PDFH.ranges(spec, total);
        if (r.err) { MT.msg('#msg', r.err, 'err'); return; }
        wanted = r.pages;
      }
      var by = parseInt(MT.$('#angle').value, 10);
      var onlyLandscape = MT.$('#onlyLandscape').checked;
      var btn = MT.$('#go');
      MT.busy(btn, true, 'Rotating…');
      MT.progress('#prog', 20);

      return PDFH.lib().then(function (PDFLib) {
        return PDFH.open(PDFLib, buf).then(function (doc) {
          var pages = doc.getPages(), changed = 0;
          wanted.forEach(function (idx) {
            var p = pages[idx];
            if (!p) return;
            var size = p.getSize();
            if (onlyLandscape && size.width <= size.height) return;
            var current = p.getRotation().angle || 0;
            p.setRotation(PDFLib.degrees((current + by) % 360));
            changed++;
          });
          MT.progress('#prog', 70);
          if (!changed) {
            throw new Error(onlyLandscape
              ? 'No landscape pages were found in that selection, so nothing was rotated.'
              : 'No pages matched that selection.');
          }
          return doc.save({ useObjectStreams: true }).then(function (bytes) {
            return { bytes: bytes, changed: changed };
          });
        });
      }).then(function (res) {
        MT.busy(btn, false);
        MT.progress('#prog', null);
        out = new Blob([res.bytes], { type: 'application/pdf' });
        MT.$('#r-count').textContent = res.changed;
        MT.$('#result').hidden = false;
        MT.msg('#msg', 'Rotated ' + MT.plural(res.changed, 'page') + ' by ' + by + '°. The change is saved into the file, so it stays rotated in every viewer.', 'ok');
        MT.done({ pages: res.changed, angle: by });
      }).catch(function (e) { MT.busy(btn, false); MT.progress('#prog', null); throw e; });
    }));

    MT.on('#dl', 'click', function () {
      if (!out) { MT.toast('Rotate first'); return; }
      MT.download(out, MT.safeName(baseName, 'pdf').replace('.pdf', '-rotated.pdf'));
    });
  },
  howto: [
    'Drop in the PDF with the wrongly oriented pages.',
    'Enter <code>all</code>, or list the pages that need turning — for example <code>2, 5-8</code>.',
    'Choose the angle and press <b>Rotate pages</b>, then download the corrected file.'
  ],
  sections: [
    { h: 'Why rotating in a viewer does not stick',
      p: `<p>Most PDF readers let you rotate the view, but that is a display setting held in the application. Close the file, send it to a colleague, or print it, and the pages are sideways again.</p>
<p>PDF stores orientation as a page attribute — a <code>/Rotate</code> value of 0, 90, 180 or 270. This tool changes that attribute and saves the file, so every viewer, printer and preview thumbnail shows the corrected orientation. That is the difference between rotating the view and rotating the document.</p>` },
    { h: 'Rotation is free',
      p: `<p>Changing the rotation attribute does not touch the page content at all. Nothing is re-rendered, no image is re-compressed, and text stays selectable. The file size is essentially unchanged, and you can rotate as many times as you like with no cumulative loss.</p>
<p>Rotations also accumulate on top of what is already there. If a page is already at 90° and you rotate it 90° more, it ends at 180° — the tool reads the current value and adds to it rather than replacing it.</p>` },
    { h: 'Mixed orientations in scanned documents',
      p: `<p>Batch scanners frequently produce documents where some pages are portrait and others landscape, particularly when a stack contains the occasional wide table or a sheet fed in the wrong way.</p>
<p>The "only rotate landscape pages" option handles this in one pass: it compares each page's width and height and skips anything already portrait. That saves working out which page numbers need attention in a long document.</p>` }
  ],
  faq: [
    { q: 'Will rotating reduce quality?', a: 'No. Only a page attribute changes. The content stream is untouched, so there is no re-rendering and no loss whatsoever.' },
    { q: 'Can I rotate only some pages?', a: 'Yes. Enter specific pages or ranges, such as 1, 3, 5-9. Leave it as "all" to rotate the whole document.' },
    { q: 'Why is 270 the same as anticlockwise?', a: 'PDF measures rotation clockwise only, so a 90° anticlockwise turn is recorded as 270° clockwise. The result on screen is identical.' },
    { q: 'My PDF looks fine but prints sideways. Will this fix it?', a: 'Usually yes — that symptom means your viewer is honouring a rotation your printer driver ignores. Writing the rotation into the file makes both agree.' }
  ]
},

/* ------------------------------------------------------------------ */
{
  slug: 'pdf-page-extractor',
  name: 'PDF Page Extractor',
  icon: '⎘',
  category: 'pdf',
  desc: 'Pull selected pages out of a PDF, or delete pages.',
  seoTitle: 'PDF Page Extractor — Extract or Delete PDF Pages',
  metaDescription: 'Extract specific pages from a PDF into a new document, or delete pages you do not need. Supports ranges and custom ordering, all in your browser.',
  keywords: ['pdf page extractor', 'extract pdf pages', 'delete pdf pages', 'remove pages from pdf', 'pdf page remover'],
  popularity: 87,
  related: ['pdf-splitter', 'pdf-merger', 'pdf-rotator', 'pdf-compressor', 'pdf-to-text'],
  intro: 'Keep only the pages you need, or remove the ones you do not. Page order follows exactly what you type, so you can reorder while extracting.',
  html: PRIVACY + `
<div class="drop" id="zone">
  <div class="dz-icon" aria-hidden="true">📄</div>
  <div class="dz-main">Drop a PDF here, or click to choose</div>
  <div class="dz-sub">One PDF · up to 100 MB</div>
  <input type="file" id="file" accept="application/pdf,.pdf">
</div>
<div class="msg" id="msg"></div>
<div id="opts" hidden style="margin-top:18px">
  <p class="hint" id="info"></p>
  <div class="field">
    <span class="lbl" id="m-lbl">Action</span>
    <div class="seg" role="group" aria-labelledby="m-lbl">
      <button type="button" data-m="keep" aria-pressed="true">Keep these pages</button>
      <button type="button" data-m="drop" aria-pressed="false">Delete these pages</button>
    </div>
  </div>
  <div class="field">
    <label for="pages">Pages</label>
    <input type="text" id="pages" placeholder="1-3, 7, 12-15">
    <p class="hint" id="ph">Order matters when keeping pages — <code>3,1,2</code> produces a document in that order. Reverse ranges work too: <code>10-1</code>.</p>
  </div>
  <div class="actions">
    <button class="btn btn-primary" id="go">Extract</button>
    <button class="btn btn-ghost" id="reset">Start over</button>
  </div>
  <div class="progress" id="prog"><i></i></div>
</div>
<div id="result" hidden style="margin-top:16px">
  <div class="result-hero"><div class="rv" id="r-pages">—</div><div class="rl" id="r-lab">pages in the new document</div></div>
  <div class="actions"><button class="btn btn-primary" id="dl">Download PDF</button></div>
</div>`,
  init: function () {
    var buf = null, total = 0, out = null, mode = 'keep', baseName = 'document';

    MT.$$('[data-m]').forEach(function (b) {
      b.addEventListener('click', function () {
        MT.$$('[data-m]').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        mode = b.dataset.m;
        MT.$('#ph').innerHTML = mode === 'keep'
          ? 'Order matters when keeping pages — <code>3,1,2</code> produces a document in that order. Reverse ranges work too: <code>10-1</code>.'
          : 'These pages will be removed. Everything else stays in its original order.';
      });
    });

    MT.dropzone({
      zone: '#zone', input: '#file', accept: ['application/pdf', '.pdf'], maxSize: 100 * 1024 * 1024,
      onError: function (m) { MT.msg('#msg', m, 'err'); },
      onFiles: function (fs) {
        var f = fs[0];
        baseName = MT.safeName(f.name);
        MT.clearMsg('#msg');
        MT.$('#result').hidden = true;
        MT.readAs(f, 'buffer').then(function (b) {
          buf = b;
          return PDFH.lib().then(function (PDFLib) { return PDFH.open(PDFLib, buf); });
        }).then(function (doc) {
          total = doc.getPageCount();
          MT.$('#info').textContent = f.name + ' — ' + MT.plural(total, 'page') + ', ' + MT.fmtBytes(f.size);
          MT.$('#pages').placeholder = '1-' + Math.min(3, total) + (total > 5 ? ', ' + total : '');
          MT.$('#opts').hidden = false;
        }).catch(function (e) { MT.msg('#msg', e.message, 'err'); });
      }
    });

    MT.on('#reset', 'click', function () {
      buf = null; out = null;
      MT.$('#opts').hidden = true; MT.$('#result').hidden = true; MT.clearMsg('#msg');
    });

    MT.on('#go', 'click', MT.guard(function () {
      if (!buf) { MT.msg('#msg', 'Choose a PDF first.', 'warn'); return; }
      var spec = MT.$('#pages').value.trim();
      if (!spec) { MT.msg('#msg', 'Enter which pages you want.', 'warn'); return; }
      var r = PDFH.ranges(spec, total);
      if (r.err) { MT.msg('#msg', r.err, 'err'); return; }

      var wanted;
      if (mode === 'keep') wanted = r.pages;
      else {
        var drop = {};
        r.pages.forEach(function (p) { drop[p] = 1; });
        wanted = [];
        for (var i = 0; i < total; i++) if (!drop[i]) wanted.push(i);
        if (!wanted.length) { MT.msg('#msg', 'That would delete every page. A PDF must keep at least one.', 'err'); return; }
      }

      var btn = MT.$('#go');
      MT.busy(btn, true, 'Extracting…');
      MT.progress('#prog', 20);

      return PDFH.lib().then(function (PDFLib) {
        return PDFH.open(PDFLib, buf).then(function (src) {
          return PDFLib.PDFDocument.create().then(function (doc) {
            return doc.copyPages(src, wanted).then(function (pages) {
              pages.forEach(function (p) { doc.addPage(p); });
              MT.progress('#prog', 75);
              return doc.save({ useObjectStreams: true }).then(function (bytes) {
                return { bytes: bytes, count: doc.getPageCount() };
              });
            });
          });
        });
      }).then(function (res) {
        MT.busy(btn, false);
        MT.progress('#prog', null);
        out = new Blob([res.bytes], { type: 'application/pdf' });
        MT.$('#r-pages').textContent = res.count;
        MT.$('#r-lab').textContent = 'pages · ' + MT.fmtBytes(out.size);
        MT.$('#result').hidden = false;
        MT.msg('#msg', mode === 'keep'
          ? 'Extracted ' + MT.plural(res.count, 'page') + ' from a ' + total + '-page document.'
          : 'Removed ' + MT.plural(total - res.count, 'page') + ', leaving ' + res.count + '.', 'ok');
        MT.done({ mode: mode, pages: res.count });
      }).catch(function (e) { MT.busy(btn, false); MT.progress('#prog', null); throw e; });
    }));

    MT.on('#dl', 'click', function () {
      if (!out) { MT.toast('Extract first'); return; }
      MT.download(out, MT.safeName(baseName, 'pdf').replace('.pdf', '-extracted.pdf'));
    });
  },
  howto: [
    'Drop in the PDF you want to work with.',
    'Choose whether the pages you list should be kept or deleted.',
    'Type the pages — <code>1-3, 7, 12-15</code> — and press <b>Extract</b>.'
  ],
  sections: [
    { h: 'Writing page ranges',
      p: `<table>
<tr><th>You type</th><th>You get</th></tr>
<tr><td><code>5</code></td><td>Page 5 only</td></tr>
<tr><td><code>1-10</code></td><td>Pages 1 through 10</td></tr>
<tr><td><code>1-3, 7, 12-15</code></td><td>Pages 1, 2, 3, 7, 12, 13, 14, 15</td></tr>
<tr><td><code>3, 1, 2</code></td><td>Those three pages, reordered</td></tr>
<tr><td><code>10-1</code></td><td>Pages 10 down to 1, reversed</td></tr>
</table>
<p>Duplicates are ignored, so <code>1-5, 3</code> gives five pages rather than six. Page numbers are the physical positions in the file, which may differ from printed page numbers if the document has unnumbered front matter.</p>` },
    { h: 'Extract, split or delete?',
      p: `<p>These three overlap, and the right one depends on what you want to end up with.</p>
<ul>
<li><b>Extract</b> produces <em>one</em> new document from the pages you select, and lets you reorder them. Use it to pull a single chapter or a set of scattered pages into one file.</li>
<li><b>Split</b> produces <em>several</em> documents from one. Use it when the source needs to become multiple separate files.</li>
<li><b>Delete</b> is extract inverted — keep everything except what you list. Easier when you want to remove a handful of pages from a long document.</li>
</ul>
<p>Removing pages is also the most reliable way to shrink a PDF. Cutting a 200-page report down to the 12 pages you need beats any compression setting.</p>` }
  ],
  faq: [
    { q: 'Can I reorder pages while extracting?', a: 'Yes. Pages are copied in exactly the order you type, so 5, 1, 3 produces a document with those pages in that sequence.' },
    { q: 'Does extracting lose quality?', a: 'No. Pages are copied as complete objects. Text stays selectable, images are not re-compressed, and the result is identical to the source pages.' },
    { q: 'Why is the extracted file not proportionally smaller?', a: 'Each page carries the resources it references — embedded fonts in particular. A one-page extract from a document with several large fonts keeps a full copy of those fonts.' },
    { q: 'How do I find the right page numbers?', a: 'Open the PDF in any viewer and use the page position shown in the toolbar, not the number printed on the page. Cover pages and roman-numeral front matter make these differ.' }
  ]
},

/* ------------------------------------------------------------------ */
{
  slug: 'pdf-to-text',
  name: 'PDF to Text',
  icon: '📝',
  category: 'pdf',
  desc: 'Extract the text content from a PDF.',
  seoTitle: 'PDF to Text — Extract Text From PDF Online Free',
  metaDescription: 'Extract text from PDF files in your browser. Copy or download the plain text, page by page or as one document. Explains why scanned PDFs return nothing.',
  keywords: ['pdf to text', 'extract text from pdf', 'pdf text extractor', 'copy text from pdf', 'pdf to txt'],
  popularity: 88,
  related: ['pdf-to-jpg', 'pdf-page-extractor', 'word-counter', 'pdf-splitter', 'text-sorter'],
  intro: 'Pull the text layer out of a PDF. If a document returns nothing, it is a scan — the explanation below covers what to do about that.',
  html: PRIVACY + `
<div class="drop" id="zone">
  <div class="dz-icon" aria-hidden="true">📄</div>
  <div class="dz-main">Drop a PDF here, or click to choose</div>
  <div class="dz-sub">One PDF · up to 100 MB</div>
  <input type="file" id="file" accept="application/pdf,.pdf">
</div>
<div class="msg" id="msg"></div>
<div id="opts" hidden style="margin-top:18px">
  <p class="hint" id="info"></p>
  <div class="row">
    <div class="field"><label for="pages">Pages</label><input type="text" id="pages" value="all" placeholder="all, or 1-10"></div>
    <div class="field"><label for="layout">Output style</label>
      <select id="layout">
        <option value="flow">Flowing paragraphs</option>
        <option value="lines">Preserve line breaks</option>
        <option value="marked">Preserve line breaks, mark each page</option>
      </select>
    </div>
  </div>
  <div class="actions">
    <button class="btn btn-primary" id="go">Extract text</button>
    <button class="btn" id="copy">Copy</button>
    <button class="btn" id="dl">Download .txt</button>
    <button class="btn btn-ghost" id="reset">Start over</button>
  </div>
  <div class="progress" id="prog"><i></i></div>
</div>
<div class="stat-grid" id="stats" hidden style="margin-top:14px">
  <div class="stat"><div class="sv" id="s-pages">0</div><div class="sl">Pages read</div></div>
  <div class="stat"><div class="sv" id="s-words">0</div><div class="sl">Words</div></div>
  <div class="stat"><div class="sv" id="s-chars">0</div><div class="sl">Characters</div></div>
</div>
<div class="field" id="out-wrap" hidden style="margin-top:16px">
  <label for="out">Extracted text</label>
  <pre class="out" id="out" style="max-height:460px;overflow:auto" tabindex="0"></pre>
</div>`,
  init: function () {
    var buf = null, total = 0, baseName = 'document';

    MT.dropzone({
      zone: '#zone', input: '#file', accept: ['application/pdf', '.pdf'], maxSize: 100 * 1024 * 1024,
      onError: function (m) { MT.msg('#msg', m, 'err'); },
      onFiles: function (fs) {
        var f = fs[0];
        baseName = MT.safeName(f.name);
        MT.clearMsg('#msg');
        MT.$('#out-wrap').hidden = true;
        MT.$('#stats').hidden = true;
        MT.readAs(f, 'buffer').then(function (b) {
          buf = b;
          return PDFH.js().then(function (lib) { return lib.getDocument(Object.assign({ data: buf.slice(0) }, PDFH.docOpts)).promise; });
        }).then(function (doc) {
          total = doc.numPages;
          MT.$('#info').textContent = f.name + ' — ' + MT.plural(total, 'page') + ', ' + MT.fmtBytes(f.size);
          MT.$('#opts').hidden = false;
        }).catch(function (e) {
          MT.msg('#msg', /password/i.test(e.message)
            ? 'This PDF is password-protected. Remove the password first, then try again.'
            : 'This file could not be read as a PDF.', 'err');
        });
      }
    });

    MT.on('#reset', 'click', function () {
      buf = null;
      MT.$('#opts').hidden = true; MT.$('#out-wrap').hidden = true;
      MT.$('#stats').hidden = true; MT.clearMsg('#msg');
    });

    MT.on('#go', 'click', MT.guard(function () {
      if (!buf) { MT.msg('#msg', 'Choose a PDF first.', 'warn'); return; }
      var spec = MT.$('#pages').value.trim();
      var wanted;
      if (!spec || spec.toLowerCase() === 'all') {
        wanted = [];
        for (var i = 0; i < total; i++) wanted.push(i);
      } else {
        var r = PDFH.ranges(spec, total);
        if (r.err) { MT.msg('#msg', r.err, 'err'); return; }
        wanted = r.pages;
      }
      var layout = MT.$('#layout').value;
      var btn = MT.$('#go');
      MT.busy(btn, true, 'Reading…');
      MT.progress('#prog', 3);

      return PDFH.js().then(function (lib) {
        return lib.getDocument(Object.assign({ data: buf.slice(0) }, PDFH.docOpts)).promise.then(function (doc) {
          var parts = [], k = 0;
          function next() {
            if (k >= wanted.length) return parts;
            var pageNo = wanted[k] + 1;
            return doc.getPage(pageNo).then(function (page) {
              return page.getTextContent();
            }).then(function (tc) {
              // Group items into lines using their vertical position.
              var lines = [], current = null, lastY = null;
              tc.items.forEach(function (item) {
                if (!item.str) return;
                var y = item.transform[5];
                if (lastY === null || Math.abs(y - lastY) > 2) {
                  if (current !== null) lines.push(current);
                  current = item.str;
                  lastY = y;
                } else {
                  current += (item.str.charAt(0) === ' ' || /\s$/.test(current) ? '' : ' ') + item.str;
                }
                if (item.hasEOL) { lines.push(current); current = null; lastY = null; }
              });
              if (current !== null) lines.push(current);
              var text = lines.map(function (l) { return l.replace(/\s+/g, ' ').trim(); })
                              .filter(function (l) { return l; }).join('\n');
              if (layout === 'flow') {
                text = text.replace(/-\n(\p{Ll})/gu, '$1').replace(/\n(?=[\p{Ll},;)])/gu, ' ');
              }
              if (layout === 'marked') text = '--- Page ' + pageNo + ' ---\n' + text;
              parts.push(text);
              k++;
              MT.progress('#prog', 3 + k / wanted.length * 95);
              return next();
            });
          }
          return next();
        });
      }).then(function (parts) {
        MT.busy(btn, false);
        MT.progress('#prog', null);
        var text = parts.join('\n\n');
        MT.$('#out').textContent = text;
        MT.$('#out-wrap').hidden = false;
        var words = text.trim() ? text.trim().split(/\s+/).length : 0;
        MT.$('#s-pages').textContent = MT.fmtNum(wanted.length);
        MT.$('#s-words').textContent = MT.fmtNum(words);
        MT.$('#s-chars').textContent = MT.fmtNum(text.length);
        MT.$('#stats').hidden = false;
        if (words === 0) {
          MT.msg('#msg', 'No text was found. This PDF almost certainly contains scanned images rather than a text layer — see the explanation below. Converting the pages to images and running OCR is the way forward.', 'warn');
        } else if (words < wanted.length * 10) {
          MT.msg('#msg', 'Only ' + MT.plural(words, 'word') + ' found across ' + MT.plural(wanted.length, 'page') + '. This document may be mostly scanned images with a little embedded text.', 'warn');
        } else {
          MT.msg('#msg', 'Extracted ' + MT.fmtNum(words) + ' words from ' + MT.plural(wanted.length, 'page') + '.', 'ok');
        }
        MT.done({ pages: wanted.length, words: words });
      }).catch(function (e) { MT.busy(btn, false); MT.progress('#prog', null); throw e; });
    }));

    MT.on('#copy', 'click', function (e) { MT.copy(MT.$('#out').textContent, e.currentTarget); });
    MT.on('#dl', 'click', function () {
      var t = MT.$('#out').textContent;
      if (!t) { MT.toast('Extract first'); return; }
      MT.download(t, MT.safeName(baseName, 'txt'));
    });
  },
  howto: [
    'Drop in the PDF you want to read.',
    'Choose which pages, and whether to keep the original line breaks or reflow into paragraphs.',
    'Press <b>Extract text</b>, then copy the result or download it as a text file.'
  ],
  sections: [
    { h: 'Why some PDFs return no text at all',
      p: `<p>There are two completely different kinds of PDF that look identical on screen.</p>
<p>A <b>digital PDF</b> — exported from Word, a browser or a design tool — stores text as characters with positions and fonts. Extraction reads those directly and is essentially perfect.</p>
<p>A <b>scanned PDF</b> is a photograph of paper. There are no characters in the file, only pixels arranged to look like letters. No extraction tool can read it, because there is nothing to read. If this tool reports zero words, that is what you have.</p>
<p>The way forward is OCR — optical character recognition — which analyses the image and guesses at the letters. Many PDF readers include it, and some scanners apply it automatically, producing a "searchable PDF" that has both the image and a hidden text layer. Those extract fine here.</p>` },
    { h: 'Why extracted text sometimes reads oddly',
      p: `<p>PDF is a layout format, not a document format. It records where each piece of text sits on the page, not which paragraph or column it belongs to. Reconstructing reading order is guesswork, and certain layouts defeat it:</p>
<ul>
<li><b>Multiple columns</b> can interleave, producing lines that alternate between columns.</li>
<li><b>Tables</b> lose their structure — cells come out as a run of values with no rows.</li>
<li><b>Headers, footers and page numbers</b> appear mixed into the body text.</li>
<li><b>Hyphenated words</b> split across lines may stay broken.</li>
<li><b>Ligatures</b> like fi and fl sometimes extract as unexpected characters.</li>
</ul>
<p>The "flowing paragraphs" option rejoins lines that appear to continue a sentence and repairs hyphenation. For anything with columns or tables, "preserve line breaks" gives you more to work with.</p>` },
    { h: 'A note on copying from PDFs',
      p: `<p>Text extraction gives you the words, not the rights to them. A PDF may be copyrighted, licensed, or confidential regardless of how easy the text is to copy. Some documents also carry technical restrictions on copying, which this tool does not attempt to bypass — encrypted files simply will not open.</p>` }
  ],
  faq: [
    { q: 'Why did I get no text from my PDF?', a: 'It is a scan — an image of pages rather than a text document. There is genuinely no text in the file to extract. You need OCR, which is available in Adobe Acrobat, many scanner apps and several free tools.' },
    { q: 'Does it do OCR?', a: 'No. OCR needs a trained recognition model, which is a substantial download and a different kind of processing. This tool reads the text layer that is already in the file.' },
    { q: 'Can it preserve formatting?', a: 'Not bold, italics or layout — the output is plain text. Line breaks can be preserved, which helps with poetry, code and structured documents.' },
    { q: 'Why are the columns jumbled?', a: 'Reading order is inferred from position on the page, and multi-column layouts are ambiguous. Try "preserve line breaks", or extract one column at a time by cropping the PDF first.' },
    { q: 'Is my document uploaded?', a: 'No. Extraction runs in your browser using pdf.js, so confidential material never leaves your device.' }
  ]
}

];
