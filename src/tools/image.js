// MEGA TOOLS — Image tools (all processing happens in the browser via canvas)

const PRIVACY = '<div class="notice privacy"><strong>Your images stay on your device.</strong> Every step runs in your browser using the canvas API. Nothing is uploaded, stored or transmitted.</div>';

// Shared markup for a single-image tool: dropzone, preview, controls slot, output.
function shell(controls, opts) {
  opts = opts || {};
  return PRIVACY + `
<div class="drop" id="zone">
  <div class="dz-icon" aria-hidden="true">🖼</div>
  <div class="dz-main">Drop an image here, or click to choose</div>
  <div class="dz-sub">${opts.accept || 'JPG, PNG, WebP, GIF, BMP or AVIF'} · up to ${opts.limit || '25 MB'}</div>
  <input type="file" id="file" accept="image/*"${opts.multiple ? ' multiple' : ''}>
</div>
<div class="msg" id="msg"></div>
<div id="editor" hidden style="margin-top:18px">
  ${controls}
  <div class="actions">
    <button class="btn btn-primary" id="go">${opts.action || 'Convert'}</button>
    <button class="btn" id="dl" disabled>Download</button>
    <button class="btn btn-ghost" id="reset">Start over</button>
  </div>
  <div class="progress" id="prog"><i></i></div>
  <div class="stat-grid" id="stats" hidden style="margin-top:14px">
    <div class="stat"><div class="sv" id="s-orig">—</div><div class="sl">Original size</div></div>
    <div class="stat"><div class="sv" id="s-new">—</div><div class="sl">New size</div></div>
    <div class="stat"><div class="sv" id="s-dim">—</div><div class="sl">Dimensions</div></div>
    <div class="stat"><div class="sv" id="s-delta">—</div><div class="sl">Change</div></div>
  </div>
  <div class="preview-grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">
    <figure><img id="pv-before" alt="Original image preview"><figcaption id="cap-before">Original</figcaption></figure>
    <figure hidden id="after-fig"><img id="pv-after" alt="Processed image preview"><figcaption id="cap-after">Result</figcaption></figure>
  </div>
</div>`;
}

// Boilerplate shared by every single-image tool. Returns helpers to the caller.
const BOOT = function () {
  var S = window.__IMG = {
    file: null, img: null, blob: null, name: 'image'
  };
  MT.dropzone({
    zone: '#zone', input: '#file', accept: ['image/*'], maxSize: 25 * 1024 * 1024,
    onError: function (m) { MT.msg('#msg', m, 'err'); },
    onFiles: function (files) {
      var f = files[0];
      MT.clearMsg('#msg');
      MT.loadImage(f).then(function (img) {
        S.file = f; S.img = img; S.name = MT.safeName(f.name);
        MT.$('#pv-before').src = img.src;
        MT.$('#cap-before').textContent = f.name + ' · ' + img.naturalWidth + '×' + img.naturalHeight + ' · ' + MT.fmtBytes(f.size);
        MT.$('#editor').hidden = false;
        MT.$('#after-fig').hidden = true;
        MT.$('#stats').hidden = true;
        MT.$('#dl').disabled = true;
        S.blob = null;
        if (window.__onLoad) window.__onLoad(img, f);
      }).catch(function (e) { MT.msg('#msg', e.message, 'err'); });
    }
  });
  window.__finish = function (blob, ext, dims) {
    S.blob = blob;
    MT.$('#pv-after').src = URL.createObjectURL(blob);
    MT.$('#cap-after').textContent = dims + ' · ' + MT.fmtBytes(blob.size);
    MT.$('#after-fig').hidden = false;
    MT.$('#s-orig').textContent = MT.fmtBytes(S.file.size);
    MT.$('#s-new').textContent = MT.fmtBytes(blob.size);
    MT.$('#s-dim').textContent = dims;
    var d = (blob.size - S.file.size) / S.file.size * 100;
    MT.$('#s-delta').textContent = (d > 0 ? '+' : '') + d.toFixed(0) + '%';
    MT.$('#s-delta').style.color = d > 0 ? 'var(--warn)' : 'var(--ok)';
    MT.$('#stats').hidden = false;
    MT.$('#dl').disabled = false;
    window.__ext = ext;
    MT.done();
  };
  MT.on('#dl', 'click', function () {
    if (!S.blob) { MT.toast('Process the image first'); return; }
    MT.download(S.blob, MT.safeName(S.name, window.__ext));
  });
  MT.on('#reset', 'click', function () {
    S.file = null; S.img = null; S.blob = null;
    MT.$('#editor').hidden = true;
    MT.clearMsg('#msg');
  });
  return S;
};

export default [

/* ------------------------------------------------------------------ */
{
  slug: 'jpg-to-png',
  name: 'JPG to PNG',
  icon: '🖼',
  category: 'image',
  desc: 'Convert JPG photos to lossless PNG files.',
  seoTitle: 'JPG to PNG Converter — Free Online, No Upload',
  metaDescription: 'Convert JPG to PNG in your browser. Lossless output, optional white-to-transparent background, no upload and no watermark.',
  keywords: ['jpg to png', 'jpeg to png converter', 'convert jpg to png', 'jpg to png online'],
  popularity: 93, featured: true,
  related: ['png-to-jpg', 'webp-converter', 'image-compressor', 'image-resizer', 'image-to-base64'],
  intro: 'Convert a JPG into a PNG without re-compressing the pixels a second time. Optionally make a flat white background transparent.',
  html: shell(`
<div class="checkline"><input type="checkbox" id="transparent"><label for="transparent">Make near-white pixels transparent</label></div>
<div class="field" id="tol-wrap" hidden><label for="tol">Whiteness threshold: <span id="tolv">245</span></label><input type="range" id="tol" min="200" max="255" value="245"><p class="hint">Pixels brighter than this on all three channels become transparent. Works on flat backgrounds, not photographs.</p></div>`,
    { action: 'Convert to PNG', accept: 'JPG or JPEG' }),
  init: function () {
    BOOT();
    MT.on('#transparent', 'change', function (e) { MT.$('#tol-wrap').hidden = !e.target.checked; });
    MT.on('#tol', 'input', function (e) { MT.$('#tolv').textContent = e.target.value; });
    MT.on('#go', 'click', MT.guard(function () {
      var S = window.__IMG;
      if (!S.img) { MT.msg('#msg', 'Choose an image first.', 'warn'); return; }
      var btn = MT.$('#go');
      MT.busy(btn, true, 'Converting…');
      var c = document.createElement('canvas');
      c.width = S.img.naturalWidth; c.height = S.img.naturalHeight;
      var ctx = c.getContext('2d');
      ctx.drawImage(S.img, 0, 0);
      if (MT.$('#transparent').checked) {
        var t = parseInt(MT.$('#tol').value, 10);
        var data = ctx.getImageData(0, 0, c.width, c.height);
        var px = data.data, changed = 0;
        for (var i = 0; i < px.length; i += 4) {
          if (px[i] >= t && px[i + 1] >= t && px[i + 2] >= t) { px[i + 3] = 0; changed++; }
        }
        ctx.putImageData(data, 0, 0);
        MT.msg('#msg', MT.fmtNum(changed) + ' pixels made transparent (' + (changed / (c.width * c.height) * 100).toFixed(1) + '% of the image).', 'ok');
      } else MT.clearMsg('#msg');
      return MT.canvasToBlob(c, 'image/png').then(function (blob) {
        MT.busy(btn, false);
        window.__finish(blob, 'png', c.width + '×' + c.height);
      }).catch(function (e) { MT.busy(btn, false); throw e; });
    }));
  },
  howto: [
    'Drop a JPG onto the box, or click to choose one from your device.',
    'Optionally switch on transparency to knock out a flat white background.',
    'Press <b>Convert to PNG</b>, then download the result.'
  ],
  sections: [
    { h: 'What changes and what does not',
      p: `<p>JPG is lossy: detail was permanently discarded when the file was first saved. PNG is lossless: it stores every pixel exactly. Converting from one to the other preserves whatever survives in the JPG, but it cannot restore what was already thrown away.</p>
<p>The practical consequence is size. A photo saved as PNG is typically three to five times larger than the JPG it came from, because PNG cannot exploit the perceptual shortcuts that make JPG small. The gain is that repeated editing and re-saving no longer degrades the image — every JPG save loses a little more.</p>` },
    { h: 'When converting is worth it',
      p: `<ul>
<li><b>Before editing.</b> Convert once, edit in PNG, and export back to JPG at the end. This avoids generation loss across a dozen saves.</li>
<li><b>Screenshots and diagrams.</b> Anything with text, sharp edges or flat colour looks far better in PNG, and is often smaller too.</li>
<li><b>When you need transparency.</b> JPG has no alpha channel at all.</li>
<li><b>For a platform that requires PNG</b> — some app store assets, print workflows and logo submissions.</li>
</ul>
<p>Converting an ordinary photograph purely for storage is usually the wrong move: you get a much larger file with no visible improvement.</p>` },
    { h: 'About the transparency option',
      p: `<p>The white-to-transparent option scans every pixel and clears the alpha channel wherever all three colour channels exceed your threshold. On a logo or scanned document with a flat background, this works well.</p>
<p>On a photograph it will not — JPG compression introduces subtle colour variation, and clouds, snow and white shirts are also near-white. Lowering the threshold removes more background but also eats into light parts of the subject. For photographic cut-outs you need edge-aware selection, which is a job for an image editor.</p>` }
  ],
  faq: [
    { q: 'Will the image quality improve?', a: 'No. PNG preserves exactly what is in the JPG, including its compression artefacts. Quality is fixed at the moment the JPG was created; conversion prevents further loss rather than reversing past loss.' },
    { q: 'Why is my PNG so much larger?', a: 'PNG stores every pixel losslessly. For photographs, which have no large areas of identical colour, that means three to five times the size of the JPG. This is expected.' },
    { q: 'Is my photo uploaded to a server?', a: 'No. The file is read by your browser, drawn onto a canvas and re-encoded locally. Nothing crosses the network at any point.' },
    { q: 'Is EXIF metadata preserved?', a: 'No. Canvas conversion produces a clean image without EXIF, so camera model, timestamps and GPS coordinates are removed. That is often desirable before sharing a photo publicly.' }
  ]
},

/* ------------------------------------------------------------------ */
{
  slug: 'png-to-jpg',
  name: 'PNG to JPG',
  icon: '🏞',
  category: 'image',
  desc: 'Convert PNG to JPG with adjustable quality and background.',
  seoTitle: 'PNG to JPG Converter — Free Online, No Upload',
  metaDescription: 'Convert PNG to JPG in your browser with adjustable quality. Choose a background colour for transparent areas and see the size saving instantly.',
  keywords: ['png to jpg', 'png to jpeg converter', 'convert png to jpg', 'png to jpg online'],
  popularity: 92, featured: true,
  related: ['jpg-to-png', 'webp-converter', 'image-compressor', 'image-resizer', 'image-cropper'],
  intro: 'Turn a PNG into a much smaller JPG. Because JPG has no transparency, you choose what colour fills any transparent areas.',
  html: shell(`
<div class="field">
  <label for="q">JPG quality: <span id="qv">85</span></label>
  <input type="range" id="q" min="10" max="100" value="85">
  <p class="hint">85 is a good default. Below 60, compression artefacts become visible around edges and text.</p>
</div>
<div class="row" style="align-items:flex-end">
  <div class="field" style="flex:0 0 auto;width:130px"><label for="bg">Background</label><input type="color" id="bg" value="#ffffff"></div>
  <div class="field"><span class="lbl">&nbsp;</span><p class="hint" style="margin:0 0 12px">JPG cannot store transparency. Transparent pixels are filled with this colour.</p></div>
</div>`, { action: 'Convert to JPG', accept: 'PNG' }),
  init: function () {
    BOOT();
    MT.on('#q', 'input', function (e) { MT.$('#qv').textContent = e.target.value; });
    MT.on('#go', 'click', MT.guard(function () {
      var S = window.__IMG;
      if (!S.img) { MT.msg('#msg', 'Choose an image first.', 'warn'); return; }
      var btn = MT.$('#go');
      MT.busy(btn, true, 'Converting…');
      var c = document.createElement('canvas');
      c.width = S.img.naturalWidth; c.height = S.img.naturalHeight;
      var ctx = c.getContext('2d');
      ctx.fillStyle = MT.$('#bg').value;
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(S.img, 0, 0);
      var q = parseInt(MT.$('#q').value, 10) / 100;
      return MT.canvasToBlob(c, 'image/jpeg', q).then(function (blob) {
        MT.busy(btn, false);
        window.__finish(blob, 'jpg', c.width + '×' + c.height);
        var saved = (1 - blob.size / S.file.size) * 100;
        MT.msg('#msg', saved > 0
          ? 'Converted at quality ' + MT.$('#q').value + ' — ' + saved.toFixed(0) + '% smaller than the PNG.'
          : 'Converted. This image compresses poorly as JPG, which is common for flat graphics and text.', saved > 0 ? 'ok' : 'warn');
      }).catch(function (e) { MT.busy(btn, false); throw e; });
    }));
  },
  howto: [
    'Drop a PNG onto the box or click to choose one.',
    'Set the quality. Drag it down and press convert again to compare sizes before committing.',
    'If the PNG has transparency, pick the background colour that will replace it.'
  ],
  sections: [
    { h: 'Transparency has to go somewhere',
      p: `<p>The JPEG format has no alpha channel. Every transparent pixel must become an opaque colour, and the converter has to choose one.</p>
<p>White is the safe default because most pages have white backgrounds. But if your logo will sit on a dark header, white produces an obvious rectangle around it — pick a matching colour instead. If the destination background varies, or you need a genuine cut-out, JPG is the wrong format. Keep the PNG, or use WebP, which supports both transparency and lossy compression.</p>` },
    { h: 'Choosing a quality setting',
      p: `<table>
<tr><th>Quality</th><th>Result</th></tr>
<tr><td>90–100</td><td>Near-indistinguishable from the source, files stay large. Use for archival or further editing.</td></tr>
<tr><td>80–90</td><td>The sweet spot for most photographs on the web.</td></tr>
<tr><td>60–80</td><td>Noticeably smaller; artefacts appear around sharp edges. Fine for thumbnails.</td></tr>
<tr><td>Below 60</td><td>Visible blocking and colour banding. Only for very constrained situations.</td></tr>
</table>
<p>Quality is not a percentage of anything meaningful — it is an encoder setting. The relationship to file size is steep at the top: dropping from 100 to 90 can halve the file while looking identical.</p>` },
    { h: 'When PNG to JPG makes files bigger',
      p: `<p>It sounds impossible, but it happens regularly with screenshots, logos, line art and anything containing text. PNG compresses runs of identical colour extremely efficiently — a screenshot with a plain background may be mostly free to store. JPG, designed for photographic gradients, has to encode that flat area as frequency data and often does worse.</p>
<p>It also looks worse: JPG produces "mosquito noise" around high-contrast edges, which is exactly what text is made of. If the result is larger or the text looks fuzzy, keep the PNG.</p>` }
  ],
  faq: [
    { q: 'Why did my file get bigger?', a: 'Your PNG is probably a screenshot, logo or diagram. PNG excels at flat colour and JPG does not. Keep the original in that case.' },
    { q: 'What quality should I choose?', a: '85 suits most photographs. For images with text or sharp edges, go higher — 92 or above — or stay with PNG.' },
    { q: 'Can I keep transparency?', a: 'Not in JPG; the format has no alpha channel. Use PNG for lossless transparency, or WebP for transparency with lossy compression.' },
    { q: 'Is anything uploaded?', a: 'No. Decoding and re-encoding both happen in your browser, so the image never leaves your device.' }
  ]
},

/* ------------------------------------------------------------------ */
{
  slug: 'webp-converter',
  name: 'WebP Converter',
  icon: '🌐',
  category: 'image',
  desc: 'Convert images to and from WebP, with quality control.',
  seoTitle: 'WebP Converter — Convert To and From WebP Online',
  metaDescription: 'Convert images to WebP or back to JPG and PNG in your browser. Adjustable quality, transparency support, and a live size comparison.',
  keywords: ['webp converter', 'convert to webp', 'webp to jpg', 'webp to png', 'image to webp'],
  popularity: 86, featured: true,
  related: ['image-compressor', 'jpg-to-png', 'png-to-jpg', 'image-resizer', 'image-to-base64'],
  intro: 'WebP typically produces files 25–35% smaller than JPG at the same visual quality. Convert in either direction here.',
  html: shell(`
<div class="field">
  <label for="fmt">Convert to</label>
  <select id="fmt">
    <option value="image/webp">WebP — lossy</option>
    <option value="image/webp-lossless">WebP — lossless</option>
    <option value="image/jpeg">JPG</option>
    <option value="image/png">PNG</option>
  </select>
</div>
<div class="field" id="q-wrap">
  <label for="q">Quality: <span id="qv">82</span></label>
  <input type="range" id="q" min="10" max="100" value="82">
</div>
<div class="row" id="bg-wrap" hidden style="align-items:flex-end">
  <div class="field" style="flex:0 0 auto;width:130px"><label for="bg">Background</label><input type="color" id="bg" value="#ffffff"></div>
  <div class="field"><span class="lbl">&nbsp;</span><p class="hint" style="margin:0 0 12px">Used to fill transparency, which JPG cannot store.</p></div>
</div>`, { action: 'Convert', accept: 'WebP, JPG, PNG, GIF or AVIF' }),
  init: function () {
    BOOT();
    function sync() {
      var f = MT.$('#fmt').value;
      MT.$('#q-wrap').hidden = (f === 'image/png' || f === 'image/webp-lossless');
      MT.$('#bg-wrap').hidden = (f !== 'image/jpeg');
    }
    MT.on('#fmt', 'change', sync);
    MT.on('#q', 'input', function (e) { MT.$('#qv').textContent = e.target.value; });
    sync();

    // Confirm the browser can actually encode WebP before promising it
    var probe = document.createElement('canvas');
    probe.width = probe.height = 1;
    if (probe.toDataURL('image/webp').indexOf('data:image/webp') !== 0) {
      MT.msg('#msg', 'Your browser cannot create WebP files. Converting from WebP to JPG or PNG will still work.', 'warn');
    }

    MT.on('#go', 'click', MT.guard(function () {
      var S = window.__IMG;
      if (!S.img) { MT.msg('#msg', 'Choose an image first.', 'warn'); return; }
      var sel = MT.$('#fmt').value;
      var type = sel === 'image/webp-lossless' ? 'image/webp' : sel;
      var lossless = sel === 'image/webp-lossless';
      var btn = MT.$('#go');
      MT.busy(btn, true, 'Converting…');
      var c = document.createElement('canvas');
      c.width = S.img.naturalWidth; c.height = S.img.naturalHeight;
      var ctx = c.getContext('2d');
      if (type === 'image/jpeg') {
        ctx.fillStyle = MT.$('#bg').value;
        ctx.fillRect(0, 0, c.width, c.height);
      }
      ctx.drawImage(S.img, 0, 0);
      var q = lossless ? 1 : parseInt(MT.$('#q').value, 10) / 100;
      return MT.canvasToBlob(c, type, type === 'image/png' ? undefined : q).then(function (blob) {
        MT.busy(btn, false);
        if (blob.type !== type) {
          MT.msg('#msg', 'Your browser produced a ' + blob.type + ' file instead of ' + type + '. It does not support encoding that format.', 'err');
          return;
        }
        var ext = type === 'image/webp' ? 'webp' : type === 'image/jpeg' ? 'jpg' : 'png';
        window.__finish(blob, ext, c.width + '×' + c.height);
        var d = (1 - blob.size / S.file.size) * 100;
        MT.msg('#msg', d > 0 ? 'Converted — ' + d.toFixed(0) + '% smaller than the original.' :
          'Converted — the result is ' + Math.abs(d).toFixed(0) + '% larger. Try a lower quality, or keep the original.', d > 0 ? 'ok' : 'warn');
      }).catch(function (e) { MT.busy(btn, false); throw e; });
    }));
  },
  howto: [
    'Drop in any image your browser can open — including an existing WebP file.',
    'Choose the output format. WebP lossy suits photographs; WebP lossless suits graphics and screenshots.',
    'Press <b>Convert</b> and compare the sizes before downloading.'
  ],
  sections: [
    { h: 'What WebP does differently',
      p: `<p>WebP was designed to replace both JPG and PNG with a single format. It has two distinct modes:</p>
<ul>
<li><b>Lossy WebP</b> competes with JPG, and typically produces files 25–35% smaller at comparable visual quality. Unlike JPG, it also supports transparency.</li>
<li><b>Lossless WebP</b> competes with PNG, usually landing around 25% smaller for the same pixel-exact result.</li>
</ul>
<p>Browser support has been universal since 2020 — Chrome, Firefox, Safari and Edge all handle it. The remaining friction is outside the browser: some desktop editors, older CMS uploaders and social platforms still reject WebP files.</p>` },
    { h: 'WebP, AVIF and JPEG XL',
      p: `<p>AVIF compresses better still — often 20–30% below WebP — and supports HDR and wide colour. Its costs are slower encoding and support that arrived more recently, so older devices may not decode it.</p>
<p>JPEG XL is technically the strongest of the three but has limited browser support after Chrome removed it.</p>
<p>The pragmatic approach for a website is to serve WebP with a JPG fallback using the HTML <code>&lt;picture&gt;</code> element, and add AVIF on top if the extra saving justifies the build complexity.</p>` }
  ],
  faq: [
    { q: 'Does converting to WebP lose quality?', a: 'In lossy mode, yes — as with any lossy format. Converting an existing JPG to WebP compounds two lossy passes, so use a higher quality setting than you would from an original.' },
    { q: 'Can I open a WebP file on my computer?', a: 'Every modern browser can. Windows and macOS both support it in their built-in viewers now, though some older editing software still cannot import it. Convert to PNG or JPG here if you hit that.' },
    { q: 'Is WebP good for animation?', a: 'Yes, animated WebP is far more efficient than GIF. This tool converts still images only — canvas cannot read animation frames.' },
    { q: 'Why did my browser refuse to make a WebP?', a: 'A small number of browsers can display WebP but not encode it. The tool checks for this and warns you rather than silently handing back a PNG.' }
  ]
},

/* ------------------------------------------------------------------ */
{
  slug: 'image-compressor',
  name: 'Image Compressor',
  icon: '🗜',
  category: 'image',
  desc: 'Shrink image file size with a quality slider or a target size.',
  seoTitle: 'Image Compressor — Reduce Image File Size Online',
  metaDescription: 'Compress JPG, PNG and WebP images in your browser. Set a quality level or a target file size, optionally resize, and see the saving before downloading.',
  keywords: ['image compressor', 'compress image', 'reduce image size', 'photo compressor', 'shrink image file'],
  popularity: 97, featured: true,
  related: ['image-resizer', 'webp-converter', 'png-to-jpg', 'jpg-to-png', 'image-cropper'],
  intro: 'Reduce file size for email, web pages or upload limits. You can compress to a quality level, or give a target size and let the tool search for the setting that hits it.',
  html: shell(`
<div class="field">
  <span class="lbl" id="mo-lbl">Compression mode</span>
  <div class="seg" role="group" aria-labelledby="mo-lbl">
    <button type="button" data-mo="quality" aria-pressed="true">By quality</button>
    <button type="button" data-mo="target" aria-pressed="false">To a target size</button>
  </div>
</div>
<div class="field" data-panel="quality">
  <label for="q">Quality: <span id="qv">75</span></label>
  <input type="range" id="q" min="10" max="100" value="75">
</div>
<div class="row" data-panel="target" hidden>
  <div class="field"><label for="target">Target size</label><input type="number" id="target" value="200" min="5" step="5"></div>
  <div class="field" style="flex:0 0 auto;min-width:120px"><label for="tunit">Unit</label><select id="tunit"><option value="1024">KB</option><option value="1048576">MB</option></select></div>
</div>
<div class="row">
  <div class="field"><label for="fmt">Output format</label>
    <select id="fmt"><option value="image/jpeg">JPG — smallest for photos</option><option value="image/webp">WebP — smaller still</option><option value="image/png">PNG — lossless</option></select>
  </div>
  <div class="field"><label for="maxw">Also limit width to (px)</label><input type="number" id="maxw" value="0" min="0" step="100"><p class="hint">0 keeps the original width. Resizing usually saves more than quality alone.</p></div>
</div>`, { action: 'Compress' }),
  init: function () {
    BOOT();
    var mode = 'quality';
    MT.$$('[data-mo]').forEach(function (b) {
      b.addEventListener('click', function () {
        MT.$$('[data-mo]').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        mode = b.dataset.mo;
        MT.$$('[data-panel]').forEach(function (p) { p.hidden = p.dataset.panel !== mode; });
      });
    });
    MT.on('#q', 'input', function (e) { MT.$('#qv').textContent = e.target.value; });

    function render(maxW) {
      var S = window.__IMG;
      var w = S.img.naturalWidth, h = S.img.naturalHeight;
      if (maxW > 0 && w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
      var c = document.createElement('canvas');
      c.width = w; c.height = h;
      var ctx = c.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      if (MT.$('#fmt').value === 'image/jpeg') { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h); }
      ctx.drawImage(S.img, 0, 0, w, h);
      return c;
    }

    MT.on('#go', 'click', MT.guard(function () {
      var S = window.__IMG;
      if (!S.img) { MT.msg('#msg', 'Choose an image first.', 'warn'); return; }
      var type = MT.$('#fmt').value;
      var maxW = Math.max(0, Math.round(MT.num('#maxw', 0)));
      var btn = MT.$('#go');
      var c = render(maxW);
      var dims = c.width + '×' + c.height;

      if (mode === 'quality' || type === 'image/png') {
        MT.busy(btn, true, 'Compressing…');
        var q = parseInt(MT.$('#q').value, 10) / 100;
        return MT.canvasToBlob(c, type, type === 'image/png' ? undefined : q).then(function (blob) {
          MT.busy(btn, false);
          window.__finish(blob, type === 'image/jpeg' ? 'jpg' : type === 'image/webp' ? 'webp' : 'png', dims);
          report(blob, S);
        }).catch(function (e) { MT.busy(btn, false); throw e; });
      }

      // Target-size mode: binary search the quality setting
      var target = MT.num('#target', 0) * parseInt(MT.$('#tunit').value, 10);
      if (!target || target < 1024) { MT.msg('#msg', 'Enter a target size of at least 1 KB.', 'err'); return; }
      MT.busy(btn, true, 'Searching…');
      MT.progress('#prog', 0);
      var lo = 0.05, hi = 0.98, best = null, step = 0;

      function attempt() {
        var mid = (lo + hi) / 2;
        return MT.canvasToBlob(c, type, mid).then(function (blob) {
          step++;
          MT.progress('#prog', step / 9 * 100);
          if (blob.size <= target) { best = blob; lo = mid; } else { hi = mid; }
          if (step < 9 && hi - lo > 0.01) return attempt();
          return best;
        });
      }
      return attempt().then(function (blob) {
        MT.busy(btn, false);
        MT.progress('#prog', null);
        if (!blob) {
          MT.msg('#msg', 'Could not reach ' + MT.fmtBytes(target) + ' at this size even at minimum quality. Reduce the width limit as well, or raise the target.', 'err');
          return;
        }
        window.__finish(blob, type === 'image/jpeg' ? 'jpg' : 'webp', dims);
        MT.msg('#msg', 'Reached ' + MT.fmtBytes(blob.size) + ', within your ' + MT.fmtBytes(target) + ' target.', 'ok');
      }).catch(function (e) { MT.busy(btn, false); MT.progress('#prog', null); throw e; });

      function report(blob, S) {
        var d = (1 - blob.size / S.file.size) * 100;
        MT.msg('#msg', d > 0
          ? 'Saved ' + MT.fmtBytes(S.file.size - blob.size) + ' — ' + d.toFixed(0) + '% smaller.'
          : 'The result is larger than the original. The source is already well compressed; try a lower quality or a width limit.', d > 0 ? 'ok' : 'warn');
      }
    }));
  },
  howto: [
    'Drop in the image you want to shrink.',
    'Either drag the quality slider, or switch to target mode and type the size you need to hit.',
    'Add a width limit if the image is larger than it needs to be — this usually saves more than quality alone.'
  ],
  sections: [
    { h: 'Resize first, then compress',
      p: `<p>The most common reason a photo is too large is that it is far bigger than it will ever be displayed. A 4000-pixel-wide camera image shown in a 800-pixel column carries twenty-five times more pixels than the screen can use.</p>
<p>Because file size scales with the number of pixels, halving the width quarters the data before compression even begins. That is a much bigger lever than the quality slider, and it costs nothing visually if the image was oversized to start with. Set a width limit that matches where the image will actually appear.</p>` },
    { h: 'How target-size mode works',
      p: `<p>There is no formula that maps a quality setting to a file size — it depends entirely on image content. A photo of a blank wall compresses far better than one of a forest at the same setting.</p>
<p>So the tool searches. It encodes at a mid quality, checks the result against your target, and narrows the range from there, converging in about nine attempts. The output is the highest quality that still fits under your limit.</p>
<p>If the target cannot be reached even at minimum quality, the tool says so rather than silently returning something too large. In that case, reduce the dimensions too.</p>` },
    { h: 'Why compressing an already-compressed file often fails',
      p: `<p>Recompressing a JPG that was already saved at quality 70 will not help much, and can make things worse. Each lossy pass discards information and adds artefacts, which the next pass then has to encode faithfully — spending bits on the damage rather than the picture.</p>
<p>If the tool reports the result is larger, the source was already efficiently compressed. Reduce the dimensions instead, or switch the output to WebP, which can genuinely beat JPG on the same pixels.</p>` }
  ],
  faq: [
    { q: 'Will compressing ruin my photo?', a: 'At quality 75–85 the difference is hard to see on screen for most photographs. The preview lets you compare before downloading, and your original file is never modified.' },
    { q: 'What size should a web image be?', a: 'Under 200 KB is a reasonable target for a large content image, and under 100 KB for anything smaller. Page weight affects load time, which affects both visitors and search ranking.' },
    { q: 'Why is PNG compression limited?', a: 'PNG is lossless, so the only way to shrink it here is to reduce dimensions. For dramatic savings on graphics, convert to WebP lossless or reduce the colour palette in an image editor.' },
    { q: 'Are my images uploaded?', a: 'No. Compression runs entirely in your browser, so private photos and client work never leave your device.' }
  ]
},

/* ------------------------------------------------------------------ */
{
  slug: 'image-resizer',
  name: 'Image Resizer',
  icon: '⤢',
  category: 'image',
  desc: 'Resize images by pixels or percentage, with aspect lock.',
  seoTitle: 'Image Resizer — Resize Images Online Free',
  metaDescription: 'Resize images in your browser by exact pixels or percentage. Lock the aspect ratio, use social media presets, and download without uploading anything.',
  keywords: ['image resizer', 'resize image online', 'change image dimensions', 'resize photo', 'image size changer'],
  popularity: 94, featured: true,
  related: ['image-compressor', 'image-cropper', 'jpg-to-png', 'webp-converter', 'image-rotator'],
  intro: 'Set exact dimensions or scale by percentage. The aspect ratio is locked by default so images do not end up stretched.',
  html: shell(`
<div class="row" style="align-items:flex-end">
  <div class="field"><label for="w">Width (px)</label><input type="number" id="w" min="1" step="1"></div>
  <div class="field"><label for="h">Height (px)</label><input type="number" id="h" min="1" step="1"></div>
  <div class="field" style="flex:0 0 auto;min-width:150px"><span class="lbl">&nbsp;</span>
    <div class="checkline" style="margin:0 0 12px"><input type="checkbox" id="lock" checked><label for="lock">Lock ratio</label></div>
  </div>
</div>
<div class="field">
  <label for="pct">Or scale by percentage: <span id="pctv">100</span>%</label>
  <input type="range" id="pct" min="5" max="200" value="100">
</div>
<div class="field">
  <span class="lbl">Presets</span>
  <div class="chips">
    <button class="chip" data-w="1920" data-h="1080">1920×1080</button>
    <button class="chip" data-w="1280" data-h="720">1280×720</button>
    <button class="chip" data-w="1080" data-h="1080">Square 1080</button>
    <button class="chip" data-w="1200" data-h="630">Social 1200×630</button>
    <button class="chip" data-w="800" data-h="0">Width 800</button>
    <button class="chip" data-w="400" data-h="0">Width 400</button>
  </div>
</div>
<div class="row">
  <div class="field"><label for="fmt">Output format</label>
    <select id="fmt"><option value="keep">Keep original</option><option value="image/jpeg">JPG</option><option value="image/png">PNG</option><option value="image/webp">WebP</option></select>
  </div>
  <div class="field"><label for="q">Quality: <span id="qv">90</span></label><input type="range" id="q" min="10" max="100" value="90"></div>
</div>`, { action: 'Resize' }),
  init: function () {
    BOOT();
    var ratio = 1, natW = 0, natH = 0, syncing = false;

    window.__onLoad = function (img) {
      natW = img.naturalWidth; natH = img.naturalHeight;
      ratio = natW / natH;
      MT.$('#w').value = natW;
      MT.$('#h').value = natH;
      MT.$('#pct').value = 100;
      MT.$('#pctv').textContent = '100';
    };

    MT.on('#w', 'input', function () {
      if (syncing || !MT.$('#lock').checked || !ratio) return;
      syncing = true;
      MT.$('#h').value = Math.max(1, Math.round(MT.num('#w', 1) / ratio));
      syncPct(); syncing = false;
    });
    MT.on('#h', 'input', function () {
      if (syncing || !MT.$('#lock').checked || !ratio) return;
      syncing = true;
      MT.$('#w').value = Math.max(1, Math.round(MT.num('#h', 1) * ratio));
      syncPct(); syncing = false;
    });
    function syncPct() {
      if (!natW) return;
      var p = Math.round(MT.num('#w', natW) / natW * 100);
      if (p >= 5 && p <= 200) { MT.$('#pct').value = p; MT.$('#pctv').textContent = p; }
    }
    MT.on('#pct', 'input', function (e) {
      var p = parseInt(e.target.value, 10);
      MT.$('#pctv').textContent = p;
      if (!natW) return;
      syncing = true;
      MT.$('#w').value = Math.max(1, Math.round(natW * p / 100));
      MT.$('#h').value = Math.max(1, Math.round(natH * p / 100));
      syncing = false;
    });
    MT.$$('[data-w]').forEach(function (c) {
      c.addEventListener('click', function () {
        if (!natW) { MT.toast('Choose an image first'); return; }
        var w = parseInt(c.dataset.w, 10), h = parseInt(c.dataset.h, 10);
        syncing = true;
        MT.$('#w').value = w;
        MT.$('#h').value = h || Math.max(1, Math.round(w / ratio));
        if (h) MT.$('#lock').checked = false;
        syncPct(); syncing = false;
      });
    });
    MT.on('#q', 'input', function (e) { MT.$('#qv').textContent = e.target.value; });

    MT.on('#go', 'click', MT.guard(function () {
      var S = window.__IMG;
      if (!S.img) { MT.msg('#msg', 'Choose an image first.', 'warn'); return; }
      var w = Math.round(MT.num('#w', 0)), h = Math.round(MT.num('#h', 0));
      if (!w || !h || w < 1 || h < 1) { MT.msg('#msg', 'Enter a width and height of at least 1 pixel.', 'err'); return; }
      if (w > 12000 || h > 12000) { MT.msg('#msg', 'The maximum supported dimension is 12,000 pixels — beyond that most browsers run out of canvas memory.', 'err'); return; }

      var type = MT.$('#fmt').value;
      if (type === 'keep') type = S.file.type === 'image/png' ? 'image/png' : S.file.type === 'image/webp' ? 'image/webp' : 'image/jpeg';
      var btn = MT.$('#go');
      MT.busy(btn, true, 'Resizing…');

      // Step down in halves for large reductions — avoids the aliasing a single
      // large downscale produces in most browsers.
      var src = S.img, cw = S.img.naturalWidth, ch = S.img.naturalHeight;
      var canvas = document.createElement('canvas');
      var ctx;
      while (cw / 2 > w && ch / 2 > h) {
        cw = Math.round(cw / 2); ch = Math.round(ch / 2);
        var tmp = document.createElement('canvas');
        tmp.width = cw; tmp.height = ch;
        var tctx = tmp.getContext('2d');
        tctx.imageSmoothingQuality = 'high';
        tctx.drawImage(src, 0, 0, cw, ch);
        src = tmp;
      }
      canvas.width = w; canvas.height = h;
      ctx = canvas.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      if (type === 'image/jpeg') { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h); }
      ctx.drawImage(src, 0, 0, w, h);

      var q = parseInt(MT.$('#q').value, 10) / 100;
      return MT.canvasToBlob(canvas, type, type === 'image/png' ? undefined : q).then(function (blob) {
        MT.busy(btn, false);
        window.__finish(blob, type === 'image/jpeg' ? 'jpg' : type === 'image/webp' ? 'webp' : 'png', w + '×' + h);
        var up = w > natW;
        MT.msg('#msg', up
          ? 'Enlarged from ' + natW + '×' + natH + '. Upscaling cannot add detail that was not captured, so the result will look softer.'
          : 'Resized from ' + natW + '×' + natH + ' to ' + w + '×' + h + '.', up ? 'warn' : 'ok');
      }).catch(function (e) { MT.busy(btn, false); throw e; });
    }));
  },
  howto: [
    'Drop in your image. The current dimensions appear in the width and height boxes.',
    'Type a new width — the height follows automatically while the ratio is locked — or drag the percentage slider.',
    'Press <b>Resize</b>, check the preview, and download.'
  ],
  sections: [
    { h: 'Aspect ratio and why the lock matters',
      p: `<p>Aspect ratio is width divided by height. Change one dimension without the other and the image stretches — faces widen, circles become ovals. The lock keeps them proportional, which is right for almost every use.</p>
<p>Unlock it only when you deliberately need exact dimensions and accept the distortion, or when the source already matches the target ratio. If you need an exact ratio without stretching, crop rather than resize: the Image Cropper removes the excess instead of squashing it.</p>` },
    { h: 'How the downscaling works',
      p: `<p>Shrinking an image to a fraction of its size in one step produces aliasing — jagged edges and shimmering detail — because most browsers sample too few source pixels per output pixel.</p>
<p>This tool steps down in halves instead, repeatedly halving the image until it is within one factor of two of the target, then doing the final resize. Each halving averages four pixels into one, which preserves detail far better. The difference is clearly visible on text and fine patterns.</p>` },
    { h: 'Common target sizes',
      p: `<table>
<tr><th>Use</th><th>Dimensions</th></tr>
<tr><td>Full-width hero image</td><td>1920 × 1080</td></tr>
<tr><td>Blog content image</td><td>1200 wide</td></tr>
<tr><td>Open Graph / social preview</td><td>1200 × 630</td></tr>
<tr><td>Square profile picture</td><td>1080 × 1080 or 400 × 400</td></tr>
<tr><td>Thumbnail</td><td>300–400 wide</td></tr>
</table>
<p>For high-density screens, export at roughly twice the display size and let the browser scale it down — a 600-pixel column looks sharpest with a 1200-pixel image.</p>` }
  ],
  faq: [
    { q: 'Can I make a small image bigger?', a: 'You can, but it will look soft. Enlarging invents pixels by interpolating between existing ones; the detail was never captured. Beyond about 150% the softness becomes obvious.' },
    { q: 'Why does my file size barely change?', a: 'Format and quality matter as much as dimensions. If you resized but kept PNG at full quality, try JPG or WebP output, or use the Image Compressor.' },
    { q: 'How do I resize to an exact size without distortion?', a: 'Crop to the right ratio first, then resize. Cropping removes the excess rather than squashing it, which keeps everything in proportion.' },
    { q: 'Is there a size limit?', a: 'Files up to 25 MB and output up to 12,000 pixels on a side. Beyond that browsers commonly run out of canvas memory and fail silently.' }
  ]
},

/* ------------------------------------------------------------------ */
{
  slug: 'image-cropper',
  name: 'Image Cropper',
  icon: '⛶',
  category: 'image',
  desc: 'Crop images by dragging, with aspect ratio presets.',
  seoTitle: 'Image Cropper — Crop Photos Online Free',
  metaDescription: 'Crop images in your browser by dragging a selection. Lock to common aspect ratios, fine-tune with exact pixel values, and download without uploading.',
  keywords: ['image cropper', 'crop image online', 'crop photo', 'image crop tool', 'square crop'],
  popularity: 88,
  related: ['image-resizer', 'image-compressor', 'image-rotator', 'image-flipper', 'png-to-jpg'],
  intro: 'Drag a selection over the image, or type exact pixel coordinates. Ratio presets cover profile pictures, social posts and standard photo sizes.',
  html: shell(`
<div class="field">
  <span class="lbl">Aspect ratio</span>
  <div class="chips">
    <button class="chip" data-ar="0" aria-pressed="true">Free</button>
    <button class="chip" data-ar="1">1:1 square</button>
    <button class="chip" data-ar="1.7777">16:9</button>
    <button class="chip" data-ar="1.3333">4:3</button>
    <button class="chip" data-ar="0.8">4:5 portrait</button>
    <button class="chip" data-ar="1.9047">1.91:1 social</button>
  </div>
</div>
<div style="position:relative;display:inline-block;max-width:100%;border:1px solid var(--rule);border-radius:var(--radius-sm);overflow:hidden;background:var(--surface)">
  <canvas id="stage" style="max-width:100%;display:block;touch-action:none;cursor:crosshair"></canvas>
</div>
<div class="row" style="margin-top:12px">
  <div class="field"><label for="cx">X</label><input type="number" id="cx" value="0" min="0" step="1"></div>
  <div class="field"><label for="cy">Y</label><input type="number" id="cy" value="0" min="0" step="1"></div>
  <div class="field"><label for="cw">Width</label><input type="number" id="cw" value="0" min="1" step="1"></div>
  <div class="field"><label for="chh">Height</label><input type="number" id="chh" value="0" min="1" step="1"></div>
</div>
<p class="hint">Drag on the image to draw a selection, or type exact values. <button class="btn btn-sm btn-ghost" id="selall">Select all</button></p>`,
    { action: 'Crop' }),
  init: function () {
    BOOT();
    var stage = MT.$('#stage'), ctx = stage.getContext('2d');
    var scale = 1, ar = 0;
    var sel = { x: 0, y: 0, w: 0, h: 0 };
    var dragging = false, start = null;

    MT.$$('[data-ar]').forEach(function (b) {
      b.addEventListener('click', function () {
        MT.$$('[data-ar]').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        ar = parseFloat(b.dataset.ar);
        if (ar && sel.w) { sel.h = Math.round(sel.w / ar); clampSel(); draw(); syncInputs(); }
      });
    });

    window.__onLoad = function (img) {
      var maxW = Math.min(680, MT.$('#editor').clientWidth || 680);
      scale = Math.min(1, maxW / img.naturalWidth);
      stage.width = Math.round(img.naturalWidth * scale);
      stage.height = Math.round(img.naturalHeight * scale);
      sel = { x: 0, y: 0, w: img.naturalWidth, h: img.naturalHeight };
      draw(); syncInputs();
    };

    function draw() {
      var img = window.__IMG.img;
      if (!img) return;
      ctx.clearRect(0, 0, stage.width, stage.height);
      ctx.drawImage(img, 0, 0, stage.width, stage.height);
      if (sel.w > 0 && sel.h > 0) {
        var x = sel.x * scale, y = sel.y * scale, w = sel.w * scale, h = sel.h * scale;
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.fillRect(0, 0, stage.width, y);
        ctx.fillRect(0, y + h, stage.width, stage.height - y - h);
        ctx.fillRect(0, y, x, h);
        ctx.fillRect(x + w, y, stage.width - x - w, h);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 4]);
        ctx.strokeRect(x + .5, y + .5, w - 1, h - 1);
        ctx.setLineDash([]);
      }
    }
    function clampSel() {
      var img = window.__IMG.img;
      if (!img) return;
      sel.w = Math.max(1, Math.min(sel.w, img.naturalWidth));
      sel.h = Math.max(1, Math.min(sel.h, img.naturalHeight));
      sel.x = Math.max(0, Math.min(sel.x, img.naturalWidth - sel.w));
      sel.y = Math.max(0, Math.min(sel.y, img.naturalHeight - sel.h));
    }
    function syncInputs() {
      MT.$('#cx').value = Math.round(sel.x);
      MT.$('#cy').value = Math.round(sel.y);
      MT.$('#cw').value = Math.round(sel.w);
      MT.$('#chh').value = Math.round(sel.h);
    }
    function pos(e) {
      var r = stage.getBoundingClientRect();
      var cx = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      var cy = (e.touches ? e.touches[0].clientY : e.clientY) - r.top;
      var dispScale = stage.width / r.width;
      return { x: cx * dispScale / scale, y: cy * dispScale / scale };
    }
    function down(e) { e.preventDefault(); dragging = true; start = pos(e); }
    function move(e) {
      if (!dragging) return;
      e.preventDefault();
      var p = pos(e);
      var x = Math.min(start.x, p.x), y = Math.min(start.y, p.y);
      var w = Math.abs(p.x - start.x), h = Math.abs(p.y - start.y);
      if (ar) { h = w / ar; if (p.y < start.y) y = start.y - h; }
      sel = { x: x, y: y, w: Math.max(1, w), h: Math.max(1, h) };
      clampSel(); draw(); syncInputs();
    }
    function up() { dragging = false; }
    stage.addEventListener('mousedown', down);
    stage.addEventListener('touchstart', down, { passive: false });
    window.addEventListener('mousemove', move);
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('mouseup', up);
    window.addEventListener('touchend', up);

    MT.$$('#cx, #cy, #cw, #chh').forEach(function (el) {
      el.addEventListener('input', function () {
        sel = { x: MT.num('#cx', 0), y: MT.num('#cy', 0), w: MT.num('#cw', 1), h: MT.num('#chh', 1) };
        clampSel(); draw();
      });
    });
    MT.on('#selall', 'click', function () {
      var img = window.__IMG.img;
      if (!img) return;
      sel = { x: 0, y: 0, w: img.naturalWidth, h: img.naturalHeight };
      draw(); syncInputs();
    });

    MT.on('#go', 'click', MT.guard(function () {
      var S = window.__IMG;
      if (!S.img) { MT.msg('#msg', 'Choose an image first.', 'warn'); return; }
      clampSel();
      var w = Math.round(sel.w), h = Math.round(sel.h);
      if (w < 1 || h < 1) { MT.msg('#msg', 'Draw a selection on the image, or enter a width and height.', 'err'); return; }
      var btn = MT.$('#go');
      MT.busy(btn, true, 'Cropping…');
      var c = document.createElement('canvas');
      c.width = w; c.height = h;
      var cctx = c.getContext('2d');
      var isPng = S.file.type === 'image/png' || S.file.type === 'image/webp';
      if (!isPng) { cctx.fillStyle = '#ffffff'; cctx.fillRect(0, 0, w, h); }
      cctx.drawImage(S.img, Math.round(sel.x), Math.round(sel.y), w, h, 0, 0, w, h);
      var type = isPng ? 'image/png' : 'image/jpeg';
      return MT.canvasToBlob(c, type, 0.92).then(function (blob) {
        MT.busy(btn, false);
        window.__finish(blob, isPng ? 'png' : 'jpg', w + '×' + h);
        MT.msg('#msg', 'Cropped to ' + w + '×' + h + ' from ' + S.img.naturalWidth + '×' + S.img.naturalHeight + '.', 'ok');
      }).catch(function (e) { MT.busy(btn, false); throw e; });
    }));
  },
  howto: [
    'Drop in an image. It appears on a canvas below the controls.',
    'Drag across the image to draw a crop selection, or pick a ratio preset first to constrain it.',
    'Fine-tune with the X, Y, width and height boxes if you need exact pixels, then press <b>Crop</b>.'
  ],
  sections: [
    { h: 'Cropping versus resizing',
      p: `<p>These solve different problems and are often confused. <b>Cropping</b> removes part of the image — the remaining pixels are untouched, at their original resolution. <b>Resizing</b> keeps the whole image but changes how many pixels describe it.</p>
<p>If a photo is the wrong shape, crop. If it is the right shape but too large, resize. If it is both, crop to the ratio first and then resize — doing it in that order means the resize works on exactly the pixels you are keeping.</p>` },
    { h: 'Ratios worth knowing',
      p: `<table>
<tr><th>Ratio</th><th>Where it is used</th></tr>
<tr><td>1:1</td><td>Profile pictures, Instagram squares, app icons</td></tr>
<tr><td>16:9</td><td>Video, presentation slides, most screens</td></tr>
<tr><td>4:3</td><td>Older cameras, tablets, many print sizes</td></tr>
<tr><td>4:5</td><td>Portrait posts — the tallest most social feeds allow</td></tr>
<tr><td>1.91:1</td><td>Open Graph link previews on Facebook and LinkedIn</td></tr>
</table>
<p>Profile pictures are usually displayed as circles even when stored square, so keep the subject away from the corners.</p>` }
  ],
  faq: [
    { q: 'Does cropping reduce quality?', a: 'No. The kept pixels are copied unchanged. The only quality consideration is the output format — a JPG source is re-encoded once, so use PNG input if you need pixel-exact output.' },
    { q: 'Can I crop on my phone?', a: 'Yes. The canvas supports touch, so you can drag a selection with your finger, then adjust the numbers for precision.' },
    { q: 'How do I crop a precise size?', a: 'Type the exact width and height into the boxes, then adjust X and Y to position the frame. The dragged selection and the numbers stay in sync.' },
    { q: 'Why is my cropped image still large in file size?', a: 'Cropping reduces pixel count but the format and quality are unchanged. Run the result through the Image Compressor if size matters.' }
  ]
},

/* ------------------------------------------------------------------ */
{
  slug: 'image-rotator',
  name: 'Image Rotator',
  icon: '↻',
  category: 'image',
  desc: 'Rotate images by 90° steps or any custom angle.',
  seoTitle: 'Image Rotator — Rotate Photos Online Free',
  metaDescription: 'Rotate images by 90, 180 or 270 degrees, or any custom angle, in your browser. Straighten crooked photos and fix sideways pictures without uploading.',
  keywords: ['image rotator', 'rotate image online', 'rotate photo', 'straighten image', 'turn image sideways'],
  popularity: 77,
  related: ['image-flipper', 'image-cropper', 'image-resizer', 'image-compressor', 'jpg-to-png'],
  intro: 'Fix a sideways photo with one click, or straighten a crooked horizon with a fine angle slider.',
  html: shell(`
<div class="field">
  <span class="lbl">Quick rotation</span>
  <div class="chips">
    <button class="chip" data-rot="90">↻ 90° right</button>
    <button class="chip" data-rot="-90">↺ 90° left</button>
    <button class="chip" data-rot="180">180°</button>
    <button class="chip" data-rot="reset">Reset</button>
  </div>
</div>
<div class="field">
  <label for="angle">Fine angle: <span id="anglev">0</span>°</label>
  <input type="range" id="angle" min="-180" max="180" value="0" step="0.5">
  <p class="hint">Use small angles to straighten a horizon. The canvas grows to fit the rotated image.</p>
</div>
<div class="row" style="align-items:flex-end">
  <div class="field" style="flex:0 0 auto;width:130px"><label for="bg">Fill colour</label><input type="color" id="bg" value="#ffffff"></div>
  <div class="field"><span class="lbl">&nbsp;</span>
    <div class="checkline" style="margin:0 0 12px"><input type="checkbox" id="trans"><label for="trans">Transparent corners (PNG output)</label></div>
  </div>
</div>`, { action: 'Rotate' }),
  init: function () {
    BOOT();
    var angle = 0;
    function setAngle(a) {
      angle = ((a % 360) + 360) % 360;
      if (angle > 180) angle -= 360;
      MT.$('#angle').value = angle;
      MT.$('#anglev').textContent = angle;
    }
    MT.$$('[data-rot]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.dataset.rot === 'reset') setAngle(0);
        else setAngle(angle + parseFloat(b.dataset.rot));
      });
    });
    MT.on('#angle', 'input', function (e) { setAngle(parseFloat(e.target.value)); });

    MT.on('#go', 'click', MT.guard(function () {
      var S = window.__IMG;
      if (!S.img) { MT.msg('#msg', 'Choose an image first.', 'warn'); return; }
      if (angle === 0) { MT.msg('#msg', 'The angle is zero — set a rotation first.', 'warn'); return; }
      var btn = MT.$('#go');
      MT.busy(btn, true, 'Rotating…');

      var rad = angle * Math.PI / 180;
      var w = S.img.naturalWidth, h = S.img.naturalHeight;
      var cos = Math.abs(Math.cos(rad)), sin = Math.abs(Math.sin(rad));
      var nw = Math.round(w * cos + h * sin);
      var nh = Math.round(w * sin + h * cos);

      var c = document.createElement('canvas');
      c.width = nw; c.height = nh;
      var ctx = c.getContext('2d');
      var transparent = MT.$('#trans').checked;
      if (!transparent) { ctx.fillStyle = MT.$('#bg').value; ctx.fillRect(0, 0, nw, nh); }
      ctx.translate(nw / 2, nh / 2);
      ctx.rotate(rad);
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(S.img, -w / 2, -h / 2);

      var type = transparent ? 'image/png' : (S.file.type === 'image/png' ? 'image/png' : 'image/jpeg');
      return MT.canvasToBlob(c, type, 0.92).then(function (blob) {
        MT.busy(btn, false);
        window.__finish(blob, type === 'image/png' ? 'png' : 'jpg', nw + '×' + nh);
        MT.msg('#msg', 'Rotated ' + angle + '°. The canvas grew from ' + w + '×' + h + ' to ' + nw + '×' + nh + ' to fit the corners.', 'ok');
      }).catch(function (e) { MT.busy(btn, false); throw e; });
    }));
  },
  howto: [
    'Drop in the image you want to turn.',
    'Click a quick rotation for 90° steps, or drag the slider for a fine angle.',
    'Press <b>Rotate</b>. Choose transparent corners if you plan to crop the result afterwards.'
  ],
  sections: [
    { h: 'Why the canvas gets bigger',
      p: `<p>At 90° or 180° the rotated image fits a rectangle exactly — width and height simply swap. At any other angle the corners stick out, so the bounding box has to grow to contain them.</p>
<p>A square rotated 45° needs a canvas about 41% wider and taller, and the four new corner areas have no image data. They are filled with your chosen colour, or left transparent if you switch that on. Straightening a photo therefore usually means cropping slightly afterwards — rotate first, then use the Image Cropper to trim back to a clean rectangle.</p>` },
    { h: 'Right-angle rotations are lossless — almost',
      p: `<p>Rotating by exactly 90, 180 or 270 degrees only moves pixels; no interpolation happens, so no detail is lost. Any other angle has to compute new pixel values by blending neighbours, which softens fine detail very slightly.</p>
<p>One caveat: because this tool re-encodes the file, a JPG saved as JPG goes through one more compression pass. Output is written at quality 92, so the loss is minimal, but for pixel-exact right-angle rotations of a JPG, a dedicated lossless rotation tool avoids it entirely.</p>` },
    { h: 'Sideways photos and EXIF orientation',
      p: `<p>If a photo looks correct on your phone but sideways on a computer, the pixels were never rotated. The camera stored them in one orientation and added an EXIF tag saying "display this rotated". Some software honours the tag and some ignores it.</p>
<p>Rotating here fixes it permanently: the output has the pixels physically in the right place and no orientation tag, so it looks the same everywhere.</p>` }
  ],
  faq: [
    { q: 'Will rotating reduce quality?', a: 'Right-angle rotations move pixels without altering them. Other angles interpolate, which softens detail slightly. Either way the file is re-encoded once, at high quality.' },
    { q: 'How do I straighten a crooked horizon?', a: 'Use the fine slider — most crooked photos need less than 5°. Rotate, then crop the empty corners away with the Image Cropper.' },
    { q: 'Why are there white triangles in the corners?', a: 'Rotating a rectangle by a non-right angle leaves areas with no image data. Change the fill colour, switch on transparent corners, or crop them off afterwards.' },
    { q: 'Can I rotate several images at once?', a: 'Not currently — this tool handles one image at a time so you can check each result before downloading.' }
  ]
},

/* ------------------------------------------------------------------ */
{
  slug: 'image-flipper',
  name: 'Image Flipper',
  icon: '⇋',
  category: 'image',
  desc: 'Mirror images horizontally or vertically.',
  seoTitle: 'Image Flipper — Mirror Images Online Free',
  metaDescription: 'Flip images horizontally or vertically in your browser. Fix mirrored selfies, create reflections, and download without uploading anything.',
  keywords: ['image flipper', 'mirror image', 'flip image online', 'flip photo horizontally', 'reverse image'],
  popularity: 68,
  related: ['image-rotator', 'image-cropper', 'image-resizer', 'image-compressor', 'png-to-jpg'],
  intro: 'Mirror an image left-to-right or top-to-bottom. The most common use is undoing the mirroring a front-facing camera applies.',
  html: shell(`
<div class="field">
  <span class="lbl">Flip direction</span>
  <div class="chips">
    <button class="chip" data-flip="h" aria-pressed="true">⇋ Horizontal — mirror left to right</button>
    <button class="chip" data-flip="v">⇵ Vertical — mirror top to bottom</button>
    <button class="chip" data-flip="both">Both</button>
  </div>
</div>`, { action: 'Flip' }),
  init: function () {
    BOOT();
    var dir = 'h';
    MT.$$('[data-flip]').forEach(function (b) {
      b.addEventListener('click', function () {
        MT.$$('[data-flip]').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        dir = b.dataset.flip;
      });
    });
    MT.on('#go', 'click', MT.guard(function () {
      var S = window.__IMG;
      if (!S.img) { MT.msg('#msg', 'Choose an image first.', 'warn'); return; }
      var btn = MT.$('#go');
      MT.busy(btn, true, 'Flipping…');
      var w = S.img.naturalWidth, h = S.img.naturalHeight;
      var c = document.createElement('canvas');
      c.width = w; c.height = h;
      var ctx = c.getContext('2d');
      var isPng = S.file.type === 'image/png' || S.file.type === 'image/webp';
      if (!isPng) { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h); }
      ctx.translate(dir === 'h' || dir === 'both' ? w : 0, dir === 'v' || dir === 'both' ? h : 0);
      ctx.scale(dir === 'h' || dir === 'both' ? -1 : 1, dir === 'v' || dir === 'both' ? -1 : 1);
      ctx.drawImage(S.img, 0, 0);
      var type = isPng ? 'image/png' : 'image/jpeg';
      return MT.canvasToBlob(c, type, 0.92).then(function (blob) {
        MT.busy(btn, false);
        window.__finish(blob, isPng ? 'png' : 'jpg', w + '×' + h);
        MT.msg('#msg', 'Flipped ' + ({ h: 'horizontally', v: 'vertically', both: 'both ways' })[dir] + '.', 'ok');
      }).catch(function (e) { MT.busy(btn, false); throw e; });
    }));
  },
  howto: [
    'Drop in the image you want to mirror.',
    'Choose horizontal, vertical, or both.',
    'Press <b>Flip</b> and download the result.'
  ],
  sections: [
    { h: 'Flipping versus rotating',
      p: `<p>They are not the same operation, and no amount of rotation can produce a mirror image. Rotation preserves handedness — text stays readable, a left hand stays a left hand. Flipping reverses it: text reads backwards and a left hand becomes a right hand.</p>
<p>One combination is worth knowing: flipping both horizontally <em>and</em> vertically produces exactly the same result as rotating 180°. The double reversal cancels out, which is why "both" is offered as a shortcut here.</p>` },
    { h: 'Why selfies come out mirrored',
      p: `<p>Front-facing cameras show you a mirrored preview, because that is what you expect from a mirror. Some phones save the mirrored version and some save the true version, and settings differ between apps.</p>
<p>The result is that a selfie with visible text — a sign, a shirt logo, a whiteboard — sometimes has it running backwards. A horizontal flip fixes it. A quick check: if text in the photo is unreadable, it needs flipping.</p>` }
  ],
  faq: [
    { q: 'Does flipping lose quality?', a: 'The pixel data is unchanged — flipping only reverses the order. The file is re-encoded once at quality 92, so any loss is from that step rather than the flip.' },
    { q: 'Will it fix a sideways photo?', a: 'No, that needs rotation. Flipping mirrors an image; it cannot turn it. Use the Image Rotator for a photo that is on its side.' },
    { q: 'Is flipping both the same as rotating 180 degrees?', a: 'Yes, exactly. Two reversals cancel out and the result is identical.' },
    { q: 'Can I flip only part of the image?', a: 'Not directly. Crop the part you want, flip it, then recombine in an image editor.' }
  ]
},

/* ------------------------------------------------------------------ */
{
  slug: 'image-to-base64',
  name: 'Image to Base64',
  icon: '</>',
  category: 'image',
  desc: 'Convert an image to a Base64 data URI for CSS or HTML.',
  seoTitle: 'Image to Base64 Converter — Data URI Generator',
  metaDescription: 'Convert images to Base64 data URIs for embedding in HTML, CSS or JSON. Copy ready-made img, CSS background and Markdown snippets.',
  keywords: ['image to base64', 'base64 image encoder', 'data uri generator', 'image data url', 'embed image css'],
  popularity: 75,
  related: ['base64-encoder', 'base64-decoder', 'image-compressor', 'webp-converter', 'color-converter'],
  intro: 'Turn a small image into a text string you can paste directly into HTML, CSS or JSON — no separate file and no extra network request.',
  html: PRIVACY + `
<div class="drop" id="zone">
  <div class="dz-icon" aria-hidden="true">🖼</div>
  <div class="dz-main">Drop an image here, or click to choose</div>
  <div class="dz-sub">Any image format · up to 2 MB (Base64 grows files by about a third)</div>
  <input type="file" id="file" accept="image/*">
</div>
<div class="msg" id="msg"></div>
<div id="out-wrap" hidden style="margin-top:18px">
  <div class="preview-grid" style="grid-template-columns:minmax(0,200px)">
    <figure><img id="pv" alt="Selected image preview"><figcaption id="cap"></figcaption></figure>
  </div>
  <div class="field" style="margin-top:14px">
    <label for="format">Output format</label>
    <select id="format">
      <option value="raw">Data URI only</option>
      <option value="img">HTML &lt;img&gt; tag</option>
      <option value="css">CSS background-image</option>
      <option value="md">Markdown image</option>
      <option value="b64">Base64 payload without the prefix</option>
    </select>
  </div>
  <div class="actions">
    <button class="btn btn-primary" id="copy">Copy</button>
    <button class="btn" id="dl">Download as .txt</button>
    <button class="btn btn-ghost" id="reset">Start over</button>
  </div>
  <div class="stat-grid" style="margin-top:14px">
    <div class="stat"><div class="sv" id="s-file">—</div><div class="sl">File size</div></div>
    <div class="stat"><div class="sv" id="s-enc">—</div><div class="sl">Encoded size</div></div>
    <div class="stat"><div class="sv" id="s-grow">—</div><div class="sl">Overhead</div></div>
  </div>
  <div class="field" style="margin-top:14px">
    <label for="out">Result</label>
    <pre class="out" id="out" style="max-height:260px;overflow:auto" tabindex="0"></pre>
  </div>
</div>`,
  init: function () {
    var state = { uri: '', name: '', type: '', w: 0, h: 0 };

    function render() {
      var f = MT.$('#format').value;
      var payload = state.uri.split(',')[1] || '';
      var out;
      if (f === 'img') out = '<img src="' + state.uri + '" alt="" width="' + state.w + '" height="' + state.h + '">';
      else if (f === 'css') out = 'background-image: url("' + state.uri + '");';
      else if (f === 'md') out = '![](' + state.uri + ')';
      else if (f === 'b64') out = payload;
      else out = state.uri;
      MT.$('#out').textContent = out;
    }

    MT.dropzone({
      zone: '#zone', input: '#file', accept: ['image/*'], maxSize: 2 * 1024 * 1024,
      onError: function (m) { MT.msg('#msg', m, 'err'); },
      onFiles: function (files) {
        var f = files[0];
        MT.clearMsg('#msg');
        MT.readAs(f, 'dataURL').then(function (uri) {
          return MT.loadImage(uri).then(function (img) {
            state = { uri: uri, name: MT.safeName(f.name), type: f.type, w: img.naturalWidth, h: img.naturalHeight };
            MT.$('#pv').src = uri;
            MT.$('#cap').textContent = f.name + ' · ' + img.naturalWidth + '×' + img.naturalHeight;
            MT.$('#s-file').textContent = MT.fmtBytes(f.size);
            MT.$('#s-enc').textContent = MT.fmtBytes(uri.length);
            MT.$('#s-grow').textContent = '+' + ((uri.length / f.size - 1) * 100).toFixed(0) + '%';
            MT.$('#out-wrap').hidden = false;
            render();
            if (f.size > 100 * 1024) {
              MT.msg('#msg', 'This file is ' + MT.fmtBytes(f.size) + '. Data URIs are best kept under about 10 KB — larger images are usually better as separate files that the browser can cache.', 'warn');
            }
            MT.done();
          });
        }).catch(function (e) { MT.msg('#msg', e.message, 'err'); });
      }
    });
    MT.on('#format', 'change', render);
    MT.on('#copy', 'click', function (e) { MT.copy(MT.$('#out').textContent, e.currentTarget); });
    MT.on('#dl', 'click', function () {
      if (!state.uri) { MT.toast('Choose an image first'); return; }
      MT.download(MT.$('#out').textContent, MT.safeName(state.name, 'txt'));
    });
    MT.on('#reset', 'click', function () {
      state = { uri: '', name: '', type: '', w: 0, h: 0 };
      MT.$('#out-wrap').hidden = true;
      MT.clearMsg('#msg');
    });
  },
  howto: [
    'Drop in a small image — icons, logos and simple graphics work best.',
    'Choose the output you need: a raw data URI, an HTML tag, a CSS rule or Markdown.',
    'Press <b>Copy</b> and paste it straight into your code.'
  ],
  sections: [
    { h: 'What a data URI is',
      p: `<p>A data URI carries a file's contents inside the URL itself instead of pointing at a location. The structure is <code>data:</code>, the MIME type, <code>;base64,</code>, then the encoded bytes:</p>
<pre>data:image/png;base64,iVBORw0KGgoAAAANSUhEUg…</pre>
<p>Anywhere a URL is accepted — <code>src</code>, CSS <code>url()</code>, a Markdown image — a data URI works instead. The image travels with the document, so there is no second request and nothing to break if a file moves.</p>` },
    { h: 'When to use one, and when not to',
      p: `<p><b>Good uses:</b> tiny icons in a CSS sprite, a logo in an HTML email, an inline SVG placeholder, images in a self-contained HTML file that must work offline, or embedding an image in a JSON payload.</p>
<p><b>Poor uses:</b> photographs and anything above roughly 10 KB. Three costs stack up. Base64 adds about 33% to the size. The data cannot be cached separately, so it is re-downloaded with every page load. And because it sits in the HTML or CSS, it blocks rendering in a way a separate image request does not.</p>
<p>A useful rule: if the image is small enough that a separate HTTP request costs more than the bytes, inline it. Otherwise link to it.</p>` },
    { h: 'SVG deserves a mention',
      p: `<p>SVG is text, so it does not need Base64 at all. You can put the markup directly into a data URI with only the special characters escaped, avoiding the 33% overhead entirely — or better, paste the SVG straight into your HTML, where CSS can then style it.</p>` }
  ],
  faq: [
    { q: 'Why is the encoded string bigger than the file?', a: 'Base64 represents three bytes with four characters, adding about 33%. The data URI prefix adds a little more. That overhead is the price of embedding binary data in text.' },
    { q: 'Do data URIs work in email?', a: 'In some clients. Gmail\'s web interface and several others block them. For HTML email, hosted images with absolute URLs remain the reliable choice.' },
    { q: 'Is there a size limit?', a: 'Browsers accept very large data URIs, but practical limits arrive sooner: bloated HTML, slow parsing and no caching. This tool caps input at 2 MB and warns above 100 KB.' },
    { q: 'Can I convert a data URI back to an image?', a: 'Yes. Paste the part after the comma into the Base64 Decoder and download the result, or simply paste the whole URI into a browser address bar.' }
  ]
}

];

// The single-image tools share BOOT(). Tool `init` functions are serialised into
// each page standalone, so the build inlines this prelude alongside them.
export const PRELUDE = 'var BOOT = ' + BOOT.toString() + ';';
