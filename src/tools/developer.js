// MEGA TOOLS — Developer tools
export default [

/* ------------------------------------------------------------------ */
{
  slug: 'json-formatter',
  name: 'JSON Formatter',
  icon: '{ }',
  category: 'developer',
  desc: 'Format, indent and validate JSON with precise error locations.',
  seoTitle: 'JSON Formatter — Free Online JSON Beautifier',
  metaDescription: 'Format and validate JSON online for free. Choose your indent, see the exact line of any syntax error, then copy or download the result. Runs entirely in your browser.',
  keywords: ['json formatter', 'json beautifier', 'format json online', 'pretty print json', 'json indent'],
  popularity: 99, featured: true,
  related: ['json-validator', 'json-minifier', 'base64-encoder', 'url-encoder', 'javascript-formatter'],
  intro: 'Paste JSON, pick an indent width, and get readable output. If the syntax is broken, you get the line and column instead of a vague failure.',
  html: `
<div class="field">
  <label for="in">JSON input</label>
  <textarea id="in" spellcheck="false" placeholder='{"name":"Ada","langs":["js","py"],"active":true}'></textarea>
</div>
<div class="row tight" style="align-items:flex-end;gap:14px">
  <div style="flex:0 0 auto">
    <span class="lbl" id="indent-lbl">Indent</span>
    <div class="seg" role="group" aria-labelledby="indent-lbl">
      <button type="button" data-indent="2" aria-pressed="true">2 spaces</button>
      <button type="button" data-indent="4" aria-pressed="false">4 spaces</button>
      <button type="button" data-indent="tab" aria-pressed="false">Tab</button>
    </div>
  </div>
  <div class="checkline" style="flex:0 0 auto;margin:0 0 9px">
    <input type="checkbox" id="sortkeys"><label for="sortkeys">Sort keys A–Z</label>
  </div>
</div>
<div class="actions">
  <button class="btn btn-primary" id="go">Format JSON</button>
  <button class="btn" id="copy">Copy</button>
  <button class="btn" id="dl">Download .json</button>
  <button class="btn btn-ghost" id="clear">Clear</button>
</div>
<div class="msg" id="msg"></div>
<div class="field" style="margin-top:16px">
  <label for="out">Formatted output</label>
  <pre class="out" id="out" data-empty="Formatted JSON appears here." tabindex="0"></pre>
</div>
<div class="stat-grid" id="stats" hidden>
  <div class="stat"><div class="sv" id="s-keys">0</div><div class="sl">Keys</div></div>
  <div class="stat"><div class="sv" id="s-depth">0</div><div class="sl">Max depth</div></div>
  <div class="stat"><div class="sv" id="s-size">0</div><div class="sl">Output size</div></div>
</div>`,
  init: function () {
    var indent = 2;
    MT.$$('[data-indent]').forEach(function (b) {
      b.addEventListener('click', function () {
        MT.$$('[data-indent]').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        indent = b.dataset.indent === 'tab' ? '\t' : parseInt(b.dataset.indent, 10);
        if (MT.$('#out').textContent) format();
      });
    });

    function locate(text, err) {
      var m = /position (\d+)/.exec(err.message);
      if (!m) return err.message;
      var pos = Math.min(parseInt(m[1], 10), text.length);
      var before = text.slice(0, pos);
      var line = before.split('\n').length;
      var col = pos - before.lastIndexOf('\n');
      var reason = err.message.split(/ in JSON| at position/)[0].replace(/^JSON\.parse: /, '');
      return 'Invalid JSON at line ' + line + ', column ' + col + '. ' + reason + '.';
    }

    function sortDeep(v) {
      if (Array.isArray(v)) return v.map(sortDeep);
      if (v && typeof v === 'object') {
        return Object.keys(v).sort().reduce(function (acc, k) { acc[k] = sortDeep(v[k]); return acc; }, {});
      }
      return v;
    }

    function stats(v) {
      var keys = 0, depth = 0;
      (function walk(node, d) {
        if (d > depth) depth = d;
        if (Array.isArray(node)) node.forEach(function (n) { walk(n, d + 1); });
        else if (node && typeof node === 'object') {
          Object.keys(node).forEach(function (k) { keys++; walk(node[k], d + 1); });
        }
      })(v, 0);
      return { keys: keys, depth: depth };
    }

    function format() {
      var raw = MT.$('#in').value;
      if (!raw.trim()) {
        MT.msg('#msg', 'Paste some JSON first.', 'warn');
        MT.$('#out').textContent = '';
        MT.$('#stats').hidden = true;
        return;
      }
      var parsed;
      try { parsed = JSON.parse(raw); }
      catch (err) {
        MT.msg('#msg', locate(raw, err), 'err');
        MT.$('#out').textContent = '';
        MT.$('#stats').hidden = true;
        return;
      }
      if (MT.$('#sortkeys').checked) parsed = sortDeep(parsed);
      var text = JSON.stringify(parsed, null, indent);
      MT.$('#out').textContent = text;
      var st = stats(parsed);
      MT.$('#s-keys').textContent = MT.fmtNum(st.keys);
      MT.$('#s-depth').textContent = st.depth;
      MT.$('#s-size').textContent = MT.fmtBytes(new Blob([text]).size);
      MT.$('#stats').hidden = false;
      MT.msg('#msg', 'Valid JSON — formatted successfully.', 'ok');
      MT.done();
    }

    MT.on('#go', 'click', MT.guard(format));
    MT.on('#in', 'keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); format(); }
    });
    MT.on('#copy', 'click', function (e) { MT.copy(MT.$('#out').textContent, e.currentTarget); });
    MT.on('#dl', 'click', function () {
      var t = MT.$('#out').textContent;
      if (!t) { MT.toast('Format something first'); return; }
      MT.download(t, 'formatted.json', 'application/json');
    });
    MT.on('#clear', 'click', function () {
      MT.$('#in').value = ''; MT.$('#out').textContent = '';
      MT.$('#stats').hidden = true; MT.clearMsg('#msg'); MT.$('#in').focus();
    });
  },
  howto: [
    'Paste or type your JSON into the input box. Nothing is uploaded — parsing happens in your browser.',
    'Choose an indent width of 2 spaces, 4 spaces or a tab, and optionally sort object keys alphabetically.',
    'Press <b>Format JSON</b> (or <kbd>Ctrl</kbd> + <kbd>Enter</kbd>), then copy or download the result.'
  ],
  sections: [
    { h: 'What JSON formatting actually does',
      p: `<p>Formatting doesn't change your data — it changes the whitespace around it. A parser reads <code>{"a":1}</code> and <code>{\n  "a": 1\n}</code> identically. What changes is how easily a human can follow the nesting.</p>
<p>This tool runs <code>JSON.parse</code> on your input and then re-serialises it with <code>JSON.stringify</code>. That round trip is why formatting doubles as validation: if the parse fails, the input was never valid JSON to begin with. It also means key order is preserved exactly as written, unless you switch on alphabetical sorting.</p>
<p>One side effect worth knowing: the round trip normalises values. <code>1.50</code> comes back as <code>1.5</code>, <code>1e3</code> becomes <code>1000</code>, and duplicate keys collapse to the last one that appeared. That is standard JSON behaviour, not a bug in the formatter.</p>` },
    { h: 'Errors this tool catches, and what they mean',
      p: `<table>
<tr><th>Message</th><th>Usual cause</th></tr>
<tr><td>Unexpected token <code>}</code></td><td>A trailing comma after the last item. JSON forbids them; JavaScript allows them.</td></tr>
<tr><td>Unexpected token <code>'</code></td><td>Single quotes. JSON strings must use double quotes.</td></tr>
<tr><td>Unexpected token <code>o</code></td><td>Usually a bare word like <code>ok</code>, or a Python-style <code>None</code>/<code>True</code> instead of <code>null</code>/<code>true</code>.</td></tr>
<tr><td>Unexpected end of input</td><td>A brace or bracket was never closed.</td></tr>
<tr><td>Unexpected non-whitespace character after JSON</td><td>Two JSON documents pasted back to back, or a stray character at the end.</td></tr>
</table>
<p>The error line and column point at where the parser <em>gave up</em>, which is often one or two lines after the real mistake. If line 12 looks fine, check the end of line 11.</p>` },
    { h: 'Comments, trailing commas and JSON5',
      p: `<p>Strict JSON has no comments. <code>//</code> and <code>/* */</code> will both fail here, which is correct behaviour — a config file that accepts them is using JSON5, JSONC or YAML, not JSON. If you are editing a <code>tsconfig.json</code> or a VS Code settings file, strip the comments before formatting, or expect this tool to reject it.</p>` }
  ],
  faq: [
    { q: 'Is my JSON sent to a server?', a: 'No. The parsing and formatting run in your browser using the built-in JSON engine. Nothing is transmitted, logged or stored, which makes this safe for API responses containing tokens or customer data.' },
    { q: 'Why did my large numbers change?', a: 'JavaScript numbers lose precision above 2⁵³ − 1. An ID like 9007199254740993 may come back as 9007199254740992. If you work with large integers, store them as strings in JSON.' },
    { q: 'What is the difference between formatting and validating?', a: 'They are the same parse step with different output. Formatting shows you the beautified document; validating just reports pass or fail. If formatting succeeds, your JSON is valid.' },
    { q: 'Can it handle a very large file?', a: 'Files up to a few megabytes are fine on a modern machine. Beyond roughly 10 MB the browser has to hold the raw text, the parsed object and the output string in memory at once, so expect it to slow down.' },
    { q: 'Does sorting keys change my data?', a: 'It changes the order keys appear in the file. JSON objects are formally unordered, so most parsers do not care — but if something downstream depends on key order, leave sorting off.' }
  ]
},

/* ------------------------------------------------------------------ */
{
  slug: 'json-validator',
  name: 'JSON Validator',
  icon: '✓',
  category: 'developer',
  desc: 'Check whether JSON is valid and see exactly where it breaks.',
  seoTitle: 'JSON Validator — Check JSON Syntax Online',
  metaDescription: 'Validate JSON online for free. Get the exact line and column of any syntax error, plus a structural summary of your document. No upload required.',
  keywords: ['json validator', 'validate json', 'json syntax checker', 'check json online'],
  popularity: 88,
  related: ['json-formatter', 'json-minifier', 'regex-tester', 'base64-decoder', 'html-formatter'],
  intro: 'Paste a document and find out whether it parses. Failures come with a line, a column and the offending snippet, so you can fix the cause rather than hunt for it.',
  html: `
<div class="field">
  <label for="in">JSON to check</label>
  <textarea id="in" spellcheck="false" placeholder='{"order": 1042, "items": [{"sku": "A-1", "qty": 2}]}'></textarea>
</div>
<div class="actions">
  <button class="btn btn-primary" id="go">Validate</button>
  <button class="btn btn-ghost" id="clear">Clear</button>
</div>
<div class="msg" id="msg"></div>
<pre class="out" id="ctx" hidden></pre>
<div class="stat-grid" id="stats" hidden style="margin-top:14px">
  <div class="stat"><div class="sv" id="s-type">—</div><div class="sl">Root type</div></div>
  <div class="stat"><div class="sv" id="s-keys">0</div><div class="sl">Total keys</div></div>
  <div class="stat"><div class="sv" id="s-arr">0</div><div class="sl">Arrays</div></div>
  <div class="stat"><div class="sv" id="s-depth">0</div><div class="sl">Max depth</div></div>
</div>`,
  init: function () {
    function validate() {
      var raw = MT.$('#in').value;
      MT.$('#ctx').hidden = true;
      MT.$('#stats').hidden = true;
      if (!raw.trim()) { MT.msg('#msg', 'Paste a document to validate.', 'warn'); return; }
      try {
        var v = JSON.parse(raw);
        var keys = 0, arrays = 0, depth = 0;
        (function walk(n, d) {
          if (d > depth) depth = d;
          if (Array.isArray(n)) { arrays++; n.forEach(function (x) { walk(x, d + 1); }); }
          else if (n && typeof n === 'object') { Object.keys(n).forEach(function (k) { keys++; walk(n[k], d + 1); }); }
        })(v, 0);
        MT.$('#s-type').textContent = Array.isArray(v) ? 'array' : (v === null ? 'null' : typeof v);
        MT.$('#s-keys').textContent = MT.fmtNum(keys);
        MT.$('#s-arr').textContent = MT.fmtNum(arrays);
        MT.$('#s-depth').textContent = depth;
        MT.$('#stats').hidden = false;
        MT.msg('#msg', 'Valid JSON. The document parsed without errors.', 'ok');
        MT.done({ result: 'valid' });
      } catch (err) {
        var m = /position (\d+)/.exec(err.message);
        var text = 'Invalid JSON. ' + err.message;
        if (m) {
          var pos = Math.min(parseInt(m[1], 10), raw.length);
          var before = raw.slice(0, pos);
          var line = before.split('\n').length;
          var col = pos - before.lastIndexOf('\n');
          text = 'Invalid JSON at line ' + line + ', column ' + col + '. ' + err.message.replace(/ at position \d+/, '') + '.';
          var lines = raw.split('\n');
          var from = Math.max(0, line - 3), to = Math.min(lines.length, line + 2);
          var snippet = [];
          for (var i = from; i < to; i++) {
            var no = String(i + 1).padStart(String(to).length, ' ');
            snippet.push((i + 1 === line ? '> ' : '  ') + no + ' | ' + lines[i]);
            if (i + 1 === line) snippet.push('  ' + ' '.repeat(no.length) + ' | ' + ' '.repeat(Math.max(0, col - 1)) + '^');
          }
          MT.$('#ctx').textContent = snippet.join('\n');
          MT.$('#ctx').hidden = false;
        }
        MT.msg('#msg', text, 'err');
        MT.done({ result: 'invalid' });
      }
    }
    MT.on('#go', 'click', MT.guard(validate));
    MT.on('#in', 'keydown', function (e) { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); validate(); } });
    MT.on('#clear', 'click', function () {
      MT.$('#in').value = ''; MT.clearMsg('#msg');
      MT.$('#ctx').hidden = true; MT.$('#stats').hidden = true; MT.$('#in').focus();
    });
  },
  howto: [
    'Paste the JSON you want to check into the box.',
    'Press <b>Validate</b>. A green result means the document parses cleanly.',
    'If it fails, read the caret line under the snippet — it marks the exact column where the parser stopped.'
  ],
  sections: [
    { h: 'What "valid JSON" means',
      p: `<p>JSON is defined by a short specification (RFC 8259). A valid document is exactly one value: an object, an array, a string, a number, <code>true</code>, <code>false</code> or <code>null</code>. Anything else — two objects side by side, a stray comma, a comment — is invalid, no matter how readable it looks.</p>
<p>Validation here means syntactic validation. This tool answers "will a parser accept this?" It does not answer "does this match my schema?" A document can be perfectly valid JSON and still be missing every field your API requires.</p>` },
    { h: 'The five rules that catch most people',
      p: `<ul>
<li><b>Double quotes only.</b> Both keys and string values need them. <code>{'a': 1}</code> is invalid.</li>
<li><b>Keys must be quoted.</b> <code>{a: 1}</code> is a JavaScript object literal, not JSON.</li>
<li><b>No trailing commas.</b> <code>[1, 2, 3,]</code> fails.</li>
<li><b>No comments.</b> Strip <code>//</code> and <code>/* */</code> before validating.</li>
<li><b>Numbers are plain.</b> No leading zeros, no <code>+</code> prefix, no <code>NaN</code>, no <code>Infinity</code>, no hex.</li>
</ul>` },
    { h: 'Reading the error position',
      p: `<p>The reported column is where the parser encountered something it could not use — not necessarily where you made the mistake. A missing comma on line 8 is usually reported at the start of line 9, because the parser only notices when it sees a key where it expected a separator. Always check the line above the one flagged.</p>` }
  ],
  faq: [
    { q: 'Does a valid result mean my API will accept it?', a: 'It means the syntax is correct. Whether the fields, types and values match what a particular endpoint expects is schema validation, which is a separate step.' },
    { q: 'Why is an empty string invalid?', a: 'A JSON document must contain exactly one value. Empty input contains none, so parsers reject it. If you mean "no data", use null or {}.' },
    { q: 'Is JSONL or NDJSON valid here?', a: 'No. Newline-delimited JSON is many documents in one file. Each line is valid on its own, but the file as a whole is not a single JSON value. Validate one line at a time.' },
    { q: 'Can I validate a file instead of pasting?', a: 'Open the file in any text editor and paste its contents. Keeping the tool paste-only means nothing ever leaves your machine.' }
  ]
},

/* ------------------------------------------------------------------ */
{
  slug: 'json-minifier',
  name: 'JSON Minifier',
  icon: '⇥',
  category: 'developer',
  desc: 'Strip whitespace from JSON and see how many bytes you saved.',
  seoTitle: 'JSON Minifier — Compress JSON Online Free',
  metaDescription: 'Minify JSON online free. Remove all unnecessary whitespace, compare before and after size, then copy or download. Runs in your browser.',
  keywords: ['json minifier', 'minify json', 'compress json', 'json compact'],
  popularity: 76,
  related: ['json-formatter', 'json-validator', 'base64-encoder', 'css-formatter', 'javascript-formatter'],
  intro: 'Minifying removes every space and newline a parser does not need. Useful before sending JSON over the wire, storing it in a column, or embedding it in a data attribute.',
  html: `
<div class="field">
  <label for="in">JSON input</label>
  <textarea id="in" spellcheck="false" placeholder='{\n  "id": 7,\n  "tags": ["a", "b"]\n}'></textarea>
</div>
<div class="actions">
  <button class="btn btn-primary" id="go">Minify</button>
  <button class="btn" id="copy">Copy</button>
  <button class="btn" id="dl">Download .json</button>
  <button class="btn btn-ghost" id="clear">Clear</button>
</div>
<div class="msg" id="msg"></div>
<div class="field" style="margin-top:16px">
  <label for="out">Minified output</label>
  <pre class="out" id="out" data-empty="Minified JSON appears here." tabindex="0"></pre>
</div>
<div class="stat-grid" id="stats" hidden>
  <div class="stat"><div class="sv" id="s-before">0</div><div class="sl">Before</div></div>
  <div class="stat"><div class="sv" id="s-after">0</div><div class="sl">After</div></div>
  <div class="stat"><div class="sv" id="s-saved">0%</div><div class="sl">Saved</div></div>
</div>`,
  init: function () {
    function minify() {
      var raw = MT.$('#in').value;
      if (!raw.trim()) { MT.msg('#msg', 'Paste some JSON first.', 'warn'); return; }
      var parsed;
      try { parsed = JSON.parse(raw); }
      catch (err) {
        var m = /position (\d+)/.exec(err.message);
        var where = '';
        if (m) {
          var before = raw.slice(0, Math.min(parseInt(m[1], 10), raw.length));
          where = ' at line ' + before.split('\n').length + ', column ' + (before.length - before.lastIndexOf('\n'));
        }
        MT.msg('#msg', 'Invalid JSON' + where + '. Fix the syntax before minifying.', 'err');
        MT.$('#out').textContent = ''; MT.$('#stats').hidden = true;
        return;
      }
      var out = JSON.stringify(parsed);
      MT.$('#out').textContent = out;
      var a = new Blob([raw]).size, b = new Blob([out]).size;
      MT.$('#s-before').textContent = MT.fmtBytes(a);
      MT.$('#s-after').textContent = MT.fmtBytes(b);
      MT.$('#s-saved').textContent = a ? Math.max(0, Math.round((1 - b / a) * 100)) + '%' : '0%';
      MT.$('#stats').hidden = false;
      MT.msg('#msg', 'Minified. ' + MT.fmtBytes(Math.max(0, a - b)) + ' of whitespace removed.', 'ok');
      MT.done();
    }
    MT.on('#go', 'click', MT.guard(minify));
    MT.on('#in', 'keydown', function (e) { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); minify(); } });
    MT.on('#copy', 'click', function (e) { MT.copy(MT.$('#out').textContent, e.currentTarget); });
    MT.on('#dl', 'click', function () {
      var t = MT.$('#out').textContent;
      if (!t) { MT.toast('Minify something first'); return; }
      MT.download(t, 'minified.json', 'application/json');
    });
    MT.on('#clear', 'click', function () {
      MT.$('#in').value = ''; MT.$('#out').textContent = '';
      MT.$('#stats').hidden = true; MT.clearMsg('#msg'); MT.$('#in').focus();
    });
  },
  howto: [
    'Paste formatted JSON into the input box.',
    'Press <b>Minify</b>. The document is parsed first, so invalid JSON is rejected rather than silently mangled.',
    'Check the saving, then copy the compact output or download it as a file.'
  ],
  sections: [
    { h: 'How much minifying actually saves',
      p: `<p>The saving depends entirely on how deeply nested your document is, because indentation is what gets removed. A flat object with ten keys saves very little. A deeply nested configuration file indented with four spaces can shrink by 30–50%.</p>
<p>Before optimising for these bytes, check whether your transport already compresses. Gzip and Brotli handle repeated whitespace extremely well — often the difference between a minified and formatted document after compression is under 5%. Minifying matters most where compression is not available: database columns, <code>localStorage</code>, URL parameters and HTML data attributes.</p>` },
    { h: 'What minifying does not do',
      p: `<p>This is whitespace removal, not compression. It will not shorten your keys, drop null values, deduplicate repeated strings or change your structure. If you need a genuinely smaller payload, the wins come from schema design — shorter key names, arrays of values instead of arrays of objects — not from formatting.</p>
<p>Because the document is parsed and re-serialised, numeric values are normalised the same way as in the formatter: <code>2.0</code> becomes <code>2</code>, and <code>1e2</code> becomes <code>100</code>.</p>` }
  ],
  faq: [
    { q: 'Will minified JSON still parse everywhere?', a: 'Yes. Whitespace between tokens is optional in the JSON specification, so every conforming parser reads the minified form identically.' },
    { q: 'Is this the same as compressing?', a: 'No. Compression algorithms like gzip re-encode the data; minifying only deletes whitespace characters. You can do both, and the order does not matter.' },
    { q: 'Can I get my formatting back?', a: 'Yes — run the output through the JSON Formatter. Since only whitespace was removed, nothing is lost. Original indentation choices are not recoverable, but the data is identical.' },
    { q: 'Does it remove comments?', a: 'It rejects them. Comments are not valid JSON, so the document fails to parse before minifying begins.' }
  ]
},

/* ------------------------------------------------------------------ */
{
  slug: 'base64-encoder',
  name: 'Base64 Encoder',
  icon: '⇢',
  category: 'developer',
  desc: 'Encode text or files to Base64, with URL-safe output available.',
  seoTitle: 'Base64 Encoder — Encode Text and Files Online',
  metaDescription: 'Encode text or files to Base64 for free. Full Unicode support, optional URL-safe alphabet and line wrapping. Everything runs in your browser.',
  keywords: ['base64 encoder', 'encode base64', 'text to base64', 'base64 online'],
  popularity: 85,
  related: ['base64-decoder', 'url-encoder', 'image-to-base64', 'hash-generator', 'json-formatter'],
  intro: 'Turn text or a small file into a Base64 string. Unicode is handled correctly through UTF-8, and you can switch to the URL-safe alphabet for query strings and JWTs.',
  html: `
<div class="field">
  <label for="in">Text to encode</label>
  <textarea id="in" spellcheck="false" placeholder="Hello, world — こんにちは"></textarea>
</div>
<div class="row tight" style="gap:14px;align-items:center">
  <div class="checkline" style="margin:0"><input type="checkbox" id="urlsafe"><label for="urlsafe">URL-safe alphabet (<code>-_</code>, no padding)</label></div>
  <div class="checkline" style="margin:0"><input type="checkbox" id="wrap"><label for="wrap">Wrap at 76 characters</label></div>
</div>
<div class="actions">
  <button class="btn btn-primary" id="go">Encode</button>
  <button class="btn" id="pick">Encode a file…</button>
  <button class="btn" id="copy">Copy</button>
  <button class="btn btn-ghost" id="clear">Clear</button>
  <input type="file" id="file" hidden>
</div>
<div class="msg" id="msg"></div>
<div class="field" style="margin-top:16px">
  <label for="out">Base64 output</label>
  <pre class="out" id="out" data-empty="Encoded output appears here." tabindex="0"></pre>
</div>`,
  init: function () {
    function post(b64) {
      if (MT.$('#urlsafe').checked) b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      if (MT.$('#wrap').checked) b64 = b64.replace(/.{76}/g, '$&\n');
      return b64;
    }
    function bytesToB64(bytes) {
      var bin = '', chunk = 0x8000;
      for (var i = 0; i < bytes.length; i += chunk) {
        bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
      }
      return btoa(bin);
    }
    function encodeText() {
      var t = MT.$('#in').value;
      if (!t) { MT.msg('#msg', 'Enter some text, or choose a file to encode.', 'warn'); return; }
      var out = post(bytesToB64(new TextEncoder().encode(t)));
      MT.$('#out').textContent = out;
      MT.msg('#msg', 'Encoded ' + MT.fmtBytes(new Blob([t]).size) + ' into ' + MT.fmtNum(out.replace(/\n/g, '').length) + ' characters.', 'ok');
      MT.done({ mode: 'text' });
    }
    MT.on('#go', 'click', MT.guard(encodeText));
    MT.on('#pick', 'click', function () { MT.$('#file').click(); });
    MT.on('#file', 'change', MT.guard(function (e) {
      var f = e.target.files[0];
      if (!f) return;
      if (f.size > 5 * 1024 * 1024) {
        MT.msg('#msg', 'That file is ' + MT.fmtBytes(f.size) + '. Base64 grows data by about a third, so this tool caps file input at 5 MB.', 'err');
        return;
      }
      return MT.readAs(f, 'buffer').then(function (buf) {
        var out = post(bytesToB64(new Uint8Array(buf)));
        MT.$('#out').textContent = out;
        MT.msg('#msg', 'Encoded “' + f.name + '” (' + MT.fmtBytes(f.size) + ') into ' + MT.fmtNum(out.replace(/\n/g, '').length) + ' characters.', 'ok');
        MT.done({ mode: 'file' });
      });
    }));
    MT.on('#copy', 'click', function (e) { MT.copy(MT.$('#out').textContent, e.currentTarget); });
    MT.on('#clear', 'click', function () {
      MT.$('#in').value = ''; MT.$('#out').textContent = ''; MT.clearMsg('#msg'); MT.$('#in').focus();
    });
    ['#urlsafe', '#wrap'].forEach(function (s) {
      MT.on(s, 'change', function () { if (MT.$('#in').value) encodeText(); });
    });
  },
  howto: [
    'Type or paste your text, or press <b>Encode a file…</b> to pick a file from your device.',
    'Switch on the URL-safe alphabet if the result will travel in a URL, cookie or JWT.',
    'Press <b>Encode</b> and copy the output.'
  ],
  sections: [
    { h: 'What Base64 is for',
      p: `<p>Base64 maps arbitrary bytes onto 64 printable ASCII characters, so binary data can travel through channels that only accept text: email bodies, JSON string fields, XML documents, data URIs and HTTP headers.</p>
<p>The cost is size. Every three bytes become four characters, so encoded data is roughly 33% larger than the original, plus padding. That trade is worth it for a small icon inlined in CSS; it is a poor trade for a 4 MB photograph, which is why this tool caps file input at 5 MB.</p>` },
    { h: 'Standard vs URL-safe',
      p: `<p>The standard alphabet ends with <code>+</code> and <code>/</code>, and pads with <code>=</code>. All three are unsafe in URLs: <code>+</code> decodes to a space in query strings, <code>/</code> looks like a path separator, and <code>=</code> separates parameters.</p>
<p>The URL-safe variant (RFC 4648 §5) swaps <code>+</code> for <code>-</code>, <code>/</code> for <code>_</code>, and drops the padding. This is what JSON Web Tokens use. The two forms are not interchangeable — decode with the same alphabet you encoded with.</p>` },
    { h: 'Base64 is not encryption',
      p: `<p>Anyone can decode Base64 instantly, without a key. It provides zero confidentiality. If you are considering it to hide an API key or a password, it will not help — the value is fully recoverable by anyone who sees it. Use encryption for secrecy and hashing for verification.</p>` }
  ],
  faq: [
    { q: 'Does it handle emoji and non-Latin scripts?', a: 'Yes. The text is converted to UTF-8 bytes before encoding, so accented characters, CJK text and emoji all survive the round trip. The older btoa function alone would throw an error on these.' },
    { q: 'Why does my output end in one or two equals signs?', a: 'Base64 works in three-byte groups. When the input length is not a multiple of three, padding marks how many bytes were in the final partial group. The URL-safe option removes it.' },
    { q: 'What is line wrapping for?', a: 'MIME email requires lines no longer than 76 characters. If you are pasting into an email header or an old system, switch it on. For JSON or JavaScript, leave it off.' },
    { q: 'Are my files uploaded?', a: 'No. Files are read with the browser FileReader API and encoded locally. Nothing is sent over the network.' }
  ]
},

/* ------------------------------------------------------------------ */
{
  slug: 'base64-decoder',
  name: 'Base64 Decoder',
  icon: '⇠',
  category: 'developer',
  desc: 'Decode Base64 back to text, with automatic URL-safe detection.',
  seoTitle: 'Base64 Decoder — Decode Base64 to Text Online',
  metaDescription: 'Decode Base64 strings back to readable text for free. Handles URL-safe input, missing padding and whitespace automatically. Runs in your browser.',
  keywords: ['base64 decoder', 'decode base64', 'base64 to text', 'base64 decode online'],
  popularity: 84,
  related: ['base64-encoder', 'url-decoder', 'json-formatter', 'hash-generator', 'timestamp-converter'],
  intro: 'Paste a Base64 string and get the original text back. Whitespace, missing padding and the URL-safe alphabet are all handled without extra settings.',
  html: `
<div class="field">
  <label for="in">Base64 to decode</label>
  <textarea id="in" spellcheck="false" placeholder="SGVsbG8sIHdvcmxk"></textarea>
</div>
<div class="actions">
  <button class="btn btn-primary" id="go">Decode</button>
  <button class="btn" id="copy">Copy</button>
  <button class="btn" id="dl">Download as file</button>
  <button class="btn btn-ghost" id="clear">Clear</button>
</div>
<div class="msg" id="msg"></div>
<div class="field" style="margin-top:16px">
  <label for="out">Decoded output</label>
  <pre class="out" id="out" data-empty="Decoded text appears here." tabindex="0"></pre>
</div>`,
  init: function () {
    function decode() {
      var raw = MT.$('#in').value.trim();
      if (!raw) { MT.msg('#msg', 'Paste a Base64 string first.', 'warn'); return; }
      var s = raw.replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
      var urlSafe = /[-_]/.test(raw);
      while (s.length % 4) s += '=';
      if (!/^[A-Za-z0-9+/]*={0,2}$/.test(s)) {
        var bad = s.replace(/[A-Za-z0-9+/=]/g, '')[0];
        MT.msg('#msg', 'That is not valid Base64 — the character “' + bad + '” is not part of the alphabet.', 'err');
        MT.$('#out').textContent = '';
        return;
      }
      var bin;
      try { bin = atob(s); }
      catch (e) {
        MT.msg('#msg', 'That string could not be decoded. Its length suggests characters are missing.', 'err');
        MT.$('#out').textContent = '';
        return;
      }
      var bytes = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      var text;
      try { text = new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
      catch (e) {
        MT.$('#out').textContent = '';
        MT.msg('#msg', 'Decoded ' + MT.fmtBytes(bytes.length) + ' of binary data — this is not UTF-8 text, so it cannot be shown here. Use “Download as file” to save it.', 'warn');
        MT.$('#out').dataset.bin = '1';
        window.__mtBytes = bytes;
        return;
      }
      window.__mtBytes = bytes;
      MT.$('#out').textContent = text;
      MT.msg('#msg', 'Decoded ' + MT.fmtBytes(bytes.length) + ' of text' + (urlSafe ? ' (URL-safe input detected).' : '.'), 'ok');
      MT.done();
    }
    MT.on('#go', 'click', MT.guard(decode));
    MT.on('#in', 'keydown', function (e) { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); decode(); } });
    MT.on('#copy', 'click', function (e) { MT.copy(MT.$('#out').textContent, e.currentTarget); });
    MT.on('#dl', 'click', function () {
      if (!window.__mtBytes) { MT.toast('Decode something first'); return; }
      MT.download(new Blob([window.__mtBytes]), 'decoded.bin');
    });
    MT.on('#clear', 'click', function () {
      MT.$('#in').value = ''; MT.$('#out').textContent = '';
      window.__mtBytes = null; MT.clearMsg('#msg'); MT.$('#in').focus();
    });
  },
  howto: [
    'Paste the Base64 string. Line breaks and spaces are stripped automatically.',
    'Press <b>Decode</b>. URL-safe characters and missing padding are corrected for you.',
    'Copy the text, or download it as a file if the content turns out to be binary.'
  ],
  sections: [
    { h: 'Why decoding sometimes produces gibberish',
      p: `<p>Base64 carries no information about what the bytes mean. If the original data was a PNG, a ZIP or a protobuf message, decoding it produces exactly those bytes — which look like noise when displayed as text.</p>
<p>This tool detects that case. If the bytes are not valid UTF-8, it tells you so and offers a download instead of printing control characters into the page. A quick way to identify what you have: PNG files start with <code>iVBOR</code> in Base64, JPEGs with <code>/9j/</code>, PDFs with <code>JVBER</code> and ZIPs with <code>UEsD</code>.</p>` },
    { h: 'Decoding JWTs',
      p: `<p>A JSON Web Token is three URL-safe Base64 segments joined by dots: header, payload and signature. Paste a single segment here — not the whole token — and you will get readable JSON back.</p>
<p>Two cautions. The signature segment is raw binary, so it will not decode to text. And decoding a payload proves nothing about the token's validity: anyone can read a JWT, and the signature is what makes it trustworthy. Never treat a decoded payload as verified.</p>` }
  ],
  faq: [
    { q: 'Why does it say the length is wrong?', a: 'Valid Base64 has a length that is a multiple of four once padding is added. If it is not, characters were lost — usually by a line-length limit in a chat client or a truncated copy.' },
    { q: 'Do I need to strip line breaks first?', a: 'No. All whitespace is removed before decoding, so you can paste MIME-wrapped output directly.' },
    { q: 'Does it detect URL-safe input automatically?', a: 'Yes. If the string contains a hyphen or underscore, those are converted to the standard alphabet and any missing padding is restored before decoding.' },
    { q: 'Can I decode a password hash with this?', a: 'No. Base64 is reversible encoding; a hash is a one-way function. If a value decodes to random bytes rather than text, it was probably a hash and cannot be reversed.' }
  ]
},

/* ------------------------------------------------------------------ */
{
  slug: 'uuid-generator',
  name: 'UUID Generator',
  icon: '⁘',
  category: 'developer',
  desc: 'Generate cryptographically random UUIDs in bulk.',
  seoTitle: 'UUID Generator — Free Online UUID v4 Generator',
  metaDescription: 'Generate random UUIDs (version 4) online for free. Create up to 500 at once, choose uppercase, braces or no hyphens, then copy or download.',
  keywords: ['uuid generator', 'guid generator', 'uuid v4', 'random uuid'],
  popularity: 80,
  related: ['password-generator', 'hash-generator', 'random-number-generator', 'timestamp-converter', 'base64-encoder'],
  intro: 'Version 4 UUIDs built from your browser\'s cryptographic random number generator — the same source used for key material, not <code>Math.random</code>.',
  html: `
<div class="row">
  <div class="field">
    <label for="count">How many</label>
    <input type="number" id="count" value="5" min="1" max="500" step="1">
  </div>
  <div class="field">
    <label for="fmt">Format</label>
    <select id="fmt">
      <option value="plain">Standard — 8-4-4-4-12</option>
      <option value="upper">Uppercase</option>
      <option value="braces">Braces — {…}</option>
      <option value="nohyphen">No hyphens</option>
      <option value="urn">URN — urn:uuid:…</option>
    </select>
  </div>
</div>
<div class="actions">
  <button class="btn btn-primary" id="go">Generate</button>
  <button class="btn" id="copy">Copy all</button>
  <button class="btn" id="dl">Download .txt</button>
</div>
<div class="msg" id="msg"></div>
<div class="field" style="margin-top:16px">
  <label for="out">Generated UUIDs</label>
  <pre class="out" id="out" data-empty="Press Generate to create UUIDs." tabindex="0"></pre>
</div>`,
  init: function () {
    function uuid4() {
      if (crypto.randomUUID) return crypto.randomUUID();
      var b = new Uint8Array(16);
      crypto.getRandomValues(b);
      b[6] = (b[6] & 0x0f) | 0x40;
      b[8] = (b[8] & 0x3f) | 0x80;
      var h = [];
      for (var i = 0; i < 16; i++) h.push(b[i].toString(16).padStart(2, '0'));
      return h.slice(0, 4).join('') + '-' + h.slice(4, 6).join('') + '-' + h.slice(6, 8).join('') +
        '-' + h.slice(8, 10).join('') + '-' + h.slice(10, 16).join('');
    }
    function fmt(u, mode) {
      if (mode === 'upper') return u.toUpperCase();
      if (mode === 'braces') return '{' + u + '}';
      if (mode === 'nohyphen') return u.replace(/-/g, '');
      if (mode === 'urn') return 'urn:uuid:' + u;
      return u;
    }
    function gen() {
      var n = Math.round(MT.num('#count', 5));
      if (!isFinite(n) || n < 1) { MT.msg('#msg', 'Enter how many UUIDs you need — at least 1.', 'warn'); return; }
      if (n > 500) { MT.msg('#msg', 'The maximum per batch is 500. Generating 500 instead.', 'warn'); n = 500; MT.$('#count').value = 500; }
      else MT.clearMsg('#msg');
      var mode = MT.$('#fmt').value, list = [];
      for (var i = 0; i < n; i++) list.push(fmt(uuid4(), mode));
      MT.$('#out').textContent = list.join('\n');
      MT.done({ count: n });
    }
    MT.on('#go', 'click', MT.guard(gen));
    MT.on('#fmt', 'change', function () { if (MT.$('#out').textContent) gen(); });
    MT.on('#copy', 'click', function (e) { MT.copy(MT.$('#out').textContent, e.currentTarget); });
    MT.on('#dl', 'click', function () {
      var t = MT.$('#out').textContent;
      if (!t) { MT.toast('Generate some first'); return; }
      MT.download(t, 'uuids.txt');
    });
    gen();
  },
  howto: [
    'Set how many UUIDs you need, up to 500 in one batch.',
    'Pick a format — standard, uppercase, braces, no hyphens or URN.',
    'Press <b>Generate</b>, then copy the list or download it as a text file.'
  ],
  sections: [
    { h: 'What version 4 means',
      p: `<p>A UUID is 128 bits written as 32 hexadecimal digits. Version 4 fills those bits with random data, apart from six that identify the version and variant — which is why the third group always begins with <code>4</code> and the fourth begins with <code>8</code>, <code>9</code>, <code>a</code> or <code>b</code>. That leaves 122 random bits.</p>
<p>Other versions exist and solve different problems: v1 embeds a timestamp and MAC address, v5 hashes a name into a namespace deterministically, and v7 (newer) is time-ordered for better database index locality. Version 4 is the right default when you simply need an identifier that nobody else will generate.</p>` },
    { h: 'Are collisions realistic?',
      p: `<p>No, at any scale you are likely to reach. With 122 random bits you would need to generate roughly 2.7 × 10¹⁸ UUIDs before the chance of a single collision reaches 50%. Generating a billion per second, that is about 85 years.</p>
<p>The practical risk is never the maths — it is a weak random source. This tool uses <code>crypto.getRandomValues</code>, which draws from the operating system's cryptographic generator. Implementations built on <code>Math.random</code> are genuinely collision-prone and should not be used for identifiers that matter.</p>` },
    { h: 'A note on databases',
      p: `<p>Random UUIDs make poor clustered primary keys. Because each new value lands at an unpredictable point in the index, inserts scatter across pages and fragment the B-tree. If you are choosing a key for a large table, consider UUID v7 or a sortable ID scheme instead, or keep an auto-increment key internally and expose the UUID publicly.</p>` }
  ],
  faq: [
    { q: 'Are these safe to use as security tokens?', a: 'They are generated from a cryptographic source, so they are unguessable. But a UUID has no expiry, no signature and no scope. For session tokens, prefer a purpose-built token format with an expiry.' },
    { q: 'What is the difference between UUID and GUID?', a: 'None technically. GUID is Microsoft\'s name for the same 128-bit standard. Microsoft tooling often wraps them in braces, which is why that format is offered here.' },
    { q: 'Do the same UUIDs appear for other visitors?', a: 'No. Generation happens in your browser with your own random source. Nothing is sent to or stored on a server, so no two visitors share a sequence.' },
    { q: 'Can I generate a v1 or v5 UUID here?', a: 'Not currently — this tool produces version 4 only. Version 1 would leak your machine\'s identity, and version 5 needs a namespace and name that only make sense in your application.' }
  ]
},

/* ------------------------------------------------------------------ */
{
  slug: 'url-encoder',
  name: 'URL Encoder',
  icon: '⇗',
  category: 'developer',
  desc: 'Percent-encode text for URLs, query strings and form data.',
  seoTitle: 'URL Encoder — Percent Encode Text Online Free',
  metaDescription: 'Encode text for safe use in URLs. Choose component encoding, full-URI encoding or form encoding, with a live explanation of what changed.',
  keywords: ['url encoder', 'percent encoding', 'encode url online', 'urlencode'],
  popularity: 78,
  related: ['url-decoder', 'base64-encoder', 'slug-generator', 'json-formatter', 'regex-tester'],
  intro: 'Escape characters that would otherwise break a URL. Pick the mode that matches where the text is going — a query value, a whole URL, or a form body.',
  html: `
<div class="field">
  <label for="in">Text to encode</label>
  <textarea id="in" spellcheck="false" placeholder="search term & more=yes"></textarea>
</div>
<div class="field">
  <span class="lbl" id="mode-lbl">Encoding mode</span>
  <div class="seg" role="group" aria-labelledby="mode-lbl">
    <button type="button" data-mode="component" aria-pressed="true">Query value</button>
    <button type="button" data-mode="uri" aria-pressed="false">Whole URL</button>
    <button type="button" data-mode="form" aria-pressed="false">Form data</button>
  </div>
  <p class="hint" id="mode-hint">Escapes everything unsafe, including <code>&amp;</code>, <code>=</code>, <code>?</code> and <code>/</code>. Use this for a single parameter value.</p>
</div>
<div class="actions">
  <button class="btn btn-primary" id="go">Encode</button>
  <button class="btn" id="copy">Copy</button>
  <button class="btn btn-ghost" id="clear">Clear</button>
</div>
<div class="msg" id="msg"></div>
<div class="field" style="margin-top:16px">
  <label for="out">Encoded output</label>
  <pre class="out" id="out" data-empty="Encoded text appears here." tabindex="0"></pre>
</div>`,
  init: function () {
    var mode = 'component';
    var hints = {
      component: 'Escapes everything unsafe, including <code>&</code>, <code>=</code>, <code>?</code> and <code>/</code>. Use this for a single parameter value.',
      uri: 'Leaves URL structure intact — <code>:</code>, <code>/</code>, <code>?</code>, <code>&</code> and <code>#</code> survive. Use this on a complete address.',
      form: 'Component encoding, but spaces become <code>+</code>. This is what an HTML form posts as <code>application/x-www-form-urlencoded</code>.'
    };
    MT.$$('[data-mode]').forEach(function (b) {
      b.addEventListener('click', function () {
        MT.$$('[data-mode]').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        mode = b.dataset.mode;
        MT.$('#mode-hint').innerHTML = hints[mode];
        if (MT.$('#in').value) run();
      });
    });
    function run() {
      var t = MT.$('#in').value;
      if (!t) { MT.msg('#msg', 'Enter some text to encode.', 'warn'); MT.$('#out').textContent = ''; return; }
      var out;
      if (mode === 'uri') out = encodeURI(t);
      else if (mode === 'form') out = encodeURIComponent(t).replace(/%20/g, '+');
      else out = encodeURIComponent(t);
      MT.$('#out').textContent = out;
      var changed = 0;
      for (var i = 0; i < t.length; i++) if (encodeURIComponent(t[i]).length > 1) changed++;
      MT.msg('#msg', changed ? MT.plural(changed, 'character') + ' escaped.' : 'Nothing needed escaping — this text is already URL-safe.', changed ? 'ok' : 'info');
      MT.done({ mode: mode });
    }
    MT.on('#go', 'click', MT.guard(run));
    MT.on('#in', 'input', function () { if (MT.$('#out').textContent) run(); });
    MT.on('#copy', 'click', function (e) { MT.copy(MT.$('#out').textContent, e.currentTarget); });
    MT.on('#clear', 'click', function () {
      MT.$('#in').value = ''; MT.$('#out').textContent = ''; MT.clearMsg('#msg'); MT.$('#in').focus();
    });
  },
  howto: [
    'Paste the text you want to put into a URL.',
    'Choose a mode: <b>Query value</b> for one parameter, <b>Whole URL</b> for a full address, <b>Form data</b> for a POST body.',
    'Press <b>Encode</b> and copy the result.'
  ],
  sections: [
    { h: 'Choosing the right mode',
      p: `<p>The mode matters more than people expect, and picking the wrong one is the most common source of broken links.</p>
<table>
<tr><th>Input</th><th>Query value</th><th>Whole URL</th></tr>
<tr><td><code>a&amp;b</code></td><td><code>a%26b</code></td><td><code>a&amp;b</code></td></tr>
<tr><td><code>x/y</code></td><td><code>x%2Fy</code></td><td><code>x/y</code></td></tr>
<tr><td><code>hello world</code></td><td><code>hello%20world</code></td><td><code>hello%20world</code></td></tr>
</table>
<p>Encoding a whole URL in <b>Query value</b> mode destroys it — the <code>://</code> and every slash get escaped. Encoding a single value in <b>Whole URL</b> mode leaves <code>&amp;</code> intact, so a value containing an ampersand silently splits into two parameters. That is how a search for "salt &amp; pepper" turns into a search for "salt" plus a mystery parameter called "pepper".</p>` },
    { h: 'Why spaces have two encodings',
      p: `<p>In a path or query string, a space is <code>%20</code>. In a form body sent as <code>application/x-www-form-urlencoded</code>, it is <code>+</code>. Both are correct in their own context, and servers generally accept either in a query string — but <code>+</code> in a URL <em>path</em> means a literal plus sign, not a space. When in doubt, <code>%20</code> is safe everywhere.</p>` },
    { h: 'Encoding is not sanitising',
      p: `<p>Percent-encoding makes text safe to <em>transport</em> in a URL. It does not make it safe to <em>use</em>. A URL-encoded string can still carry an SQL injection payload, a path traversal sequence or a script tag once decoded on the far side. Validate and escape at the point of use as well.</p>` }
  ],
  faq: [
    { q: 'Which characters never need encoding?', a: 'Letters A–Z and a–z, digits 0–9, and the four marks hyphen, underscore, period and tilde. Everything else is either reserved or unsafe depending on position.' },
    { q: 'How are emoji and accented letters handled?', a: 'They are converted to UTF-8 bytes first, then each byte becomes a percent-escape. That is why a single emoji expands to four escape sequences.' },
    { q: 'Should I encode the same string twice?', a: 'No. Double-encoding turns % into %25, so %20 becomes %2520 and the receiver gets a literal "%20" rather than a space. Encode exactly once, at the point the value is placed into the URL.' },
    { q: 'Does encoding hide what I am sending?', a: 'Not at all. Percent-encoding is trivially reversible and is visible in server logs, browser history and proxies. It is a formatting rule, not a privacy measure.' }
  ]
},

/* ------------------------------------------------------------------ */
{
  slug: 'url-decoder',
  name: 'URL Decoder',
  icon: '⇙',
  category: 'developer',
  desc: 'Decode percent-encoded URLs and break them into parts.',
  seoTitle: 'URL Decoder — Decode Percent Encoded URLs Online',
  metaDescription: 'Decode URL-encoded text for free. Handles plus-as-space, double encoding and full URLs, with an automatic breakdown of query parameters.',
  keywords: ['url decoder', 'decode url', 'percent decode', 'urldecode online'],
  popularity: 77,
  related: ['url-encoder', 'base64-decoder', 'json-formatter', 'timestamp-converter', 'slug-generator'],
  intro: 'Turn <code>%20</code> back into a space. If you paste a full URL, the query parameters are also split into a readable table.',
  html: `
<div class="field">
  <label for="in">Encoded text or URL</label>
  <textarea id="in" spellcheck="false" placeholder="https://example.com/search?q=salt%20%26%20pepper&page=2"></textarea>
</div>
<div class="checkline"><input type="checkbox" id="plus" checked><label for="plus">Treat <code>+</code> as a space (form encoding)</label></div>
<div class="actions">
  <button class="btn btn-primary" id="go">Decode</button>
  <button class="btn" id="copy">Copy</button>
  <button class="btn btn-ghost" id="clear">Clear</button>
</div>
<div class="msg" id="msg"></div>
<div class="field" style="margin-top:16px">
  <label for="out">Decoded output</label>
  <pre class="out" id="out" data-empty="Decoded text appears here." tabindex="0"></pre>
</div>
<div id="params-wrap" hidden style="margin-top:16px">
  <span class="lbl">Query parameters</span>
  <table class="kv" id="params"></table>
</div>`,
  init: function () {
    function decode() {
      var raw = MT.$('#in').value.trim();
      MT.$('#params-wrap').hidden = true;
      if (!raw) { MT.msg('#msg', 'Paste an encoded URL or string first.', 'warn'); MT.$('#out').textContent = ''; return; }
      var s = MT.$('#plus').checked ? raw.replace(/\+/g, ' ') : raw;
      var out;
      try { out = decodeURIComponent(s); }
      catch (e) {
        var bad = /%[^0-9a-fA-F]|%[0-9a-fA-F][^0-9a-fA-F]|%.?$/.exec(s);
        MT.msg('#msg', 'This is not valid percent-encoding' + (bad ? ' — “' + bad[0] + '” is a broken escape sequence.' : '. A % must be followed by two hex digits.'), 'err');
        MT.$('#out').textContent = '';
        return;
      }
      MT.$('#out').textContent = out;
      var note = 'Decoded successfully.';
      if (/%25[0-9a-fA-F]{2}/.test(raw)) note = 'Decoded — but this string looks double-encoded. Run it through again to fully decode it.';
      MT.msg('#msg', note, /double/.test(note) ? 'warn' : 'ok');

      var qi = out.indexOf('?');
      if (qi !== -1 && /^[a-z][a-z0-9+.\-]*:\/\//i.test(out)) {
        var qs = out.slice(qi + 1).split('#')[0];
        var rows = qs.split('&').filter(Boolean).map(function (pair) {
          var eq = pair.indexOf('=');
          var k = eq === -1 ? pair : pair.slice(0, eq);
          var v = eq === -1 ? '' : pair.slice(eq + 1);
          return '<tr><td>' + MT.escapeHtml(k) + '</td><td style="text-align:left;font-weight:500;word-break:break-all">' + MT.escapeHtml(v || '—') + '</td></tr>';
        });
        if (rows.length) {
          MT.$('#params').innerHTML = rows.join('');
          MT.$('#params-wrap').hidden = false;
        }
      }
      MT.done();
    }
    MT.on('#go', 'click', MT.guard(decode));
    MT.on('#in', 'keydown', function (e) { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); decode(); } });
    MT.on('#plus', 'change', function () { if (MT.$('#out').textContent) decode(); });
    MT.on('#copy', 'click', function (e) { MT.copy(MT.$('#out').textContent, e.currentTarget); });
    MT.on('#clear', 'click', function () {
      MT.$('#in').value = ''; MT.$('#out').textContent = '';
      MT.$('#params-wrap').hidden = true; MT.clearMsg('#msg'); MT.$('#in').focus();
    });
  },
  howto: [
    'Paste the encoded string or the whole URL.',
    'Leave <b>Treat + as a space</b> switched on for form data; switch it off if a literal plus sign matters.',
    'Press <b>Decode</b>. Paste a full URL and the query parameters are listed separately.'
  ],
  sections: [
    { h: 'Spotting double encoding',
      p: `<p>If your decoded output still contains <code>%20</code> or <code>%26</code>, the string was encoded twice. It happens when a value is escaped once when built and again when placed into a link. The signature is <code>%25</code> in the input — that is an encoded percent sign, which means the escapes themselves got escaped.</p>
<p>The fix is to decode repeatedly until the output stops changing, then correct the code that encodes twice. This tool flags the pattern when it sees it, but decodes only one layer per press so you can watch what each pass removes.</p>` },
    { h: 'The plus sign problem',
      p: `<p>There is no way to know from a string alone whether <code>+</code> means a space or a literal plus. Context decides: in a form body it is a space, in a URL path it is a plus, and in a query string it depends on who built the URL.</p>
<p>This matters for real data. A phone number written <code>+15551234</code> decodes to <code>&nbsp;15551234</code> with the option on. If your decoded output has a suspicious leading space or a missing plus, switch the option off and decode again.</p>` }
  ],
  faq: [
    { q: 'Why does it say the escape sequence is broken?', a: 'A percent sign must be followed by exactly two hexadecimal digits. Text like "100% cotton" contains a percent that is not an escape, so decoding fails. Encode the percent as %25 first.' },
    { q: 'Can it decode a full URL safely?', a: 'Yes. Decoding a whole URL is safe to read, but do not use the decoded form as a link — the reserved characters are no longer escaped, so the address may be ambiguous.' },
    { q: 'Where did the query parameter table go?', a: 'It only appears when the decoded text looks like a complete URL with a scheme and a query string. A bare fragment of text has nothing to split.' },
    { q: 'Is anything sent to a server?', a: 'No. Decoding uses the browser\'s built-in decodeURIComponent, so URLs containing session tokens or personal data stay on your machine.' }
  ]
},

/* ------------------------------------------------------------------ */
{
  slug: 'html-formatter',
  name: 'HTML Formatter',
  icon: '<>',
  category: 'developer',
  desc: 'Indent and tidy HTML markup, or minify it back down.',
  seoTitle: 'HTML Formatter — Free Online HTML Beautifier',
  metaDescription: 'Format and indent HTML online for free. Beautify messy markup or minify it, with script and pre content preserved exactly. Runs in your browser.',
  keywords: ['html formatter', 'html beautifier', 'format html online', 'html indent', 'minify html'],
  popularity: 74,
  related: ['css-formatter', 'javascript-formatter', 'json-formatter', 'url-encoder', 'text-sorter'],
  intro: 'Re-indent HTML so the nesting is visible. Void elements, inline tags and the contents of <code>&lt;pre&gt;</code>, <code>&lt;script&gt;</code> and <code>&lt;style&gt;</code> are all handled properly.',
  html: `
<div class="field">
  <label for="in">HTML input</label>
  <textarea id="in" spellcheck="false" placeholder="<div class=&quot;card&quot;><h2>Title</h2><p>Body copy</p></div>"></textarea>
</div>
<div class="row tight" style="align-items:flex-end;gap:14px">
  <div style="flex:0 0 auto">
    <span class="lbl" id="i-lbl">Indent</span>
    <div class="seg" role="group" aria-labelledby="i-lbl">
      <button type="button" data-indent="2" aria-pressed="true">2</button>
      <button type="button" data-indent="4" aria-pressed="false">4</button>
      <button type="button" data-indent="tab" aria-pressed="false">Tab</button>
    </div>
  </div>
</div>
<div class="actions">
  <button class="btn btn-primary" id="go">Format</button>
  <button class="btn" id="min">Minify</button>
  <button class="btn" id="copy">Copy</button>
  <button class="btn" id="dl">Download .html</button>
  <button class="btn btn-ghost" id="clear">Clear</button>
</div>
<div class="msg" id="msg"></div>
<div class="field" style="margin-top:16px">
  <label for="out">Output</label>
  <pre class="out" id="out" data-empty="Formatted markup appears here." tabindex="0"></pre>
</div>`,
  init: function () {
    var indent = '  ';
    var VOID = ['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'];
    var INLINE = ['a','abbr','b','bdi','bdo','cite','code','data','dfn','em','i','kbd','mark','q','rp','rt','ruby','s','samp','small','span','strong','sub','sup','time','u','var'];
    var RAW = ['script','style','pre','textarea'];

    MT.$$('[data-indent]').forEach(function (b) {
      b.addEventListener('click', function () {
        MT.$$('[data-indent]').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        indent = b.dataset.indent === 'tab' ? '\t' : ' '.repeat(parseInt(b.dataset.indent, 10));
        if (MT.$('#out').textContent) format();
      });
    });

    function tokenize(html) {
      var tokens = [], i = 0;
      while (i < html.length) {
        if (html[i] === '<') {
          if (html.substr(i, 4) === '<!--') {
            var end = html.indexOf('-->', i);
            end = end === -1 ? html.length : end + 3;
            tokens.push({ t: 'comment', v: html.slice(i, end) });
            i = end; continue;
          }
          if (html.substr(i, 2) === '<!') {
            var e2 = html.indexOf('>', i);
            e2 = e2 === -1 ? html.length : e2 + 1;
            tokens.push({ t: 'doctype', v: html.slice(i, e2) });
            i = e2; continue;
          }
          var close = html.indexOf('>', i);
          if (close === -1) { tokens.push({ t: 'text', v: html.slice(i) }); break; }
          var tag = html.slice(i, close + 1);
          var nameM = /^<\/?\s*([a-zA-Z][\w:-]*)/.exec(tag);
          var name = nameM ? nameM[1].toLowerCase() : '';
          var isClose = tag[1] === '/';
          var selfClose = /\/>$/.test(tag) || VOID.indexOf(name) !== -1;
          tokens.push({ t: 'tag', v: tag, name: name, close: isClose, self: selfClose });
          i = close + 1;
          if (!isClose && !selfClose && RAW.indexOf(name) !== -1) {
            var endTag = '</' + name;
            var rawEnd = html.toLowerCase().indexOf(endTag, i);
            if (rawEnd === -1) rawEnd = html.length;
            tokens.push({ t: 'raw', v: html.slice(i, rawEnd) });
            i = rawEnd;
          }
          continue;
        }
        var next = html.indexOf('<', i);
        if (next === -1) next = html.length;
        tokens.push({ t: 'text', v: html.slice(i, next) });
        i = next;
      }
      return tokens;
    }

    function format() {
      var src = MT.$('#in').value;
      if (!src.trim()) { MT.msg('#msg', 'Paste some HTML first.', 'warn'); return; }
      var tokens = tokenize(src);
      var out = [], depth = 0, unclosed = 0;
      function pad() { return indent.repeat(Math.max(0, depth)); }
      tokens.forEach(function (tk) {
        if (tk.t === 'text') {
          var txt = tk.v.replace(/\s+/g, ' ').trim();
          if (txt) out.push(pad() + txt);
        } else if (tk.t === 'raw') {
          var body = tk.v.replace(/^\n+|\s+$/g, '');
          if (body) {
            var lines = body.split('\n');
            var min = Infinity;
            lines.forEach(function (l) { if (l.trim()) min = Math.min(min, l.match(/^\s*/)[0].length); });
            if (!isFinite(min)) min = 0;
            out.push(lines.map(function (l) { return l.trim() ? pad() + l.slice(min) : ''; }).join('\n'));
          }
        } else if (tk.t === 'comment' || tk.t === 'doctype') {
          out.push(pad() + tk.v.trim());
        } else {
          if (tk.close) { depth--; unclosed--; out.push(pad() + tk.v.trim()); }
          else if (tk.self) { out.push(pad() + tk.v.trim()); }
          else { out.push(pad() + tk.v.trim()); depth++; unclosed++; }
        }
      });
      var text = out.filter(function (l) { return l !== ''; }).join('\n');
      MT.$('#out').textContent = text;
      if (unclosed > 0) MT.msg('#msg', 'Formatted, but ' + MT.plural(unclosed, 'tag') + ' appears to be left open. Indentation past that point may be off.', 'warn');
      else if (unclosed < 0) MT.msg('#msg', 'Formatted, but there ' + (unclosed === -1 ? 'is 1 closing tag' : 'are ' + (-unclosed) + ' closing tags') + ' with no matching opener.', 'warn');
      else MT.msg('#msg', 'Formatted — all tags balanced.', 'ok');
      MT.done({ mode: 'format' });
    }

    function minify() {
      var src = MT.$('#in').value;
      if (!src.trim()) { MT.msg('#msg', 'Paste some HTML first.', 'warn'); return; }
      var tokens = tokenize(src), out = '';
      tokens.forEach(function (tk) {
        if (tk.t === 'comment') return;
        if (tk.t === 'raw') { out += tk.v.trim(); return; }
        if (tk.t === 'text') {
          var c = tk.v.replace(/\s+/g, ' ');
          if (c.trim() === '') { if (/ $/.test(out) === false && out) out += ' '; return; }
          out += c;
          return;
        }
        out += tk.v.replace(/\s+/g, ' ').replace(/\s+>/, '>');
      });
      out = out.replace(/>\s+</g, function (m) { return INLINE.length ? '><' : m; }).trim();
      MT.$('#out').textContent = out;
      var a = new Blob([src]).size, b = new Blob([out]).size;
      MT.msg('#msg', 'Minified from ' + MT.fmtBytes(a) + ' to ' + MT.fmtBytes(b) + '. Inline spacing between elements was collapsed — check text-heavy markup before shipping.', 'ok');
      MT.done({ mode: 'minify' });
    }

    MT.on('#go', 'click', MT.guard(format));
    MT.on('#min', 'click', MT.guard(minify));
    MT.on('#copy', 'click', function (e) { MT.copy(MT.$('#out').textContent, e.currentTarget); });
    MT.on('#dl', 'click', function () {
      var t = MT.$('#out').textContent;
      if (!t) { MT.toast('Format something first'); return; }
      MT.download(t, 'formatted.html', 'text/html');
    });
    MT.on('#clear', 'click', function () {
      MT.$('#in').value = ''; MT.$('#out').textContent = ''; MT.clearMsg('#msg'); MT.$('#in').focus();
    });
  },
  howto: [
    'Paste your HTML — a fragment or a whole document, both work.',
    'Choose an indent width, then press <b>Format</b> to expand the markup or <b>Minify</b> to collapse it.',
    'Copy the output or download it as an <code>.html</code> file.'
  ],
  sections: [
    { h: 'What the formatter preserves',
      p: `<p>Naïve indenters break pages by reformatting content where whitespace is significant. This one leaves four kinds of content alone: <code>&lt;pre&gt;</code>, <code>&lt;textarea&gt;</code>, <code>&lt;script&gt;</code> and <code>&lt;style&gt;</code>. Their inner content is re-indented as a block but never re-wrapped, so preformatted text keeps its line breaks and scripts stay syntactically intact.</p>
<p>Void elements — <code>&lt;br&gt;</code>, <code>&lt;img&gt;</code>, <code>&lt;input&gt;</code> and the rest — never increase the indent level, because they have no closing tag. Getting this wrong is what causes indentation to drift steadily to the right in most quick-and-dirty formatters.</p>` },
    { h: 'Formatting reveals structural bugs',
      p: `<p>Because the indent level tracks open and closed tags, an unbalanced document shows up immediately: the output either drifts rightwards forever or marches back past the left margin. The tool counts the imbalance and tells you how many tags are unaccounted for.</p>
<p>Note that HTML has optional closing tags. <code>&lt;li&gt;</code>, <code>&lt;tr&gt;</code> and <code>&lt;p&gt;</code> can legally be left open — browsers close them implicitly. This formatter treats them literally, so a document using that style will be reported as unbalanced even though it renders correctly.</p>` },
    { h: 'A caution on minifying',
      p: `<p>Whitespace between inline elements is <em>visible</em>. The space in <code>&lt;b&gt;bold&lt;/b&gt; &lt;i&gt;italic&lt;/i&gt;</code> is a real space on screen; removing it joins the words. Minified output should be checked visually rather than trusted blindly, especially in paragraphs and navigation bars. For production, a build-time minifier that understands your CSS display rules is a safer choice.</p>` }
  ],
  faq: [
    { q: 'Does it validate my HTML?', a: 'Only structurally. It counts opening and closing tags and warns when they do not match, but it does not check attribute names, nesting rules or accessibility. Use the W3C validator for conformance.' },
    { q: 'Will it change my attributes?', a: 'No. Attribute text is copied verbatim, including quoting style and order. Only the whitespace between tags is touched.' },
    { q: 'Can it format a whole page including the doctype?', a: 'Yes. Doctype declarations and comments are passed through intact and placed on their own lines.' },
    { q: 'Is my markup uploaded anywhere?', a: 'No. Tokenising and re-indenting happen in your browser, so unreleased page templates stay private.' }
  ]
},

/* ------------------------------------------------------------------ */
{
  slug: 'css-formatter',
  name: 'CSS Formatter',
  icon: '#',
  category: 'developer',
  desc: 'Beautify or minify CSS, with comment and string handling.',
  seoTitle: 'CSS Formatter — Free Online CSS Beautifier and Minifier',
  metaDescription: 'Format CSS online for free. Expand minified stylesheets into readable rules or minify them back, with comments, media queries and strings handled correctly.',
  keywords: ['css formatter', 'css beautifier', 'minify css', 'format css online'],
  popularity: 72,
  related: ['html-formatter', 'javascript-formatter', 'json-formatter', 'color-converter', 'text-sorter'],
  intro: 'Expand a minified stylesheet into readable rules, or compress one back down. Nested at-rules, comments and quoted content are all preserved.',
  html: `
<div class="field">
  <label for="in">CSS input</label>
  <textarea id="in" spellcheck="false" placeholder=".card{padding:16px;border-radius:8px}@media(max-width:600px){.card{padding:8px}}"></textarea>
</div>
<div class="row tight" style="align-items:flex-end;gap:14px">
  <div style="flex:0 0 auto">
    <span class="lbl" id="i-lbl">Indent</span>
    <div class="seg" role="group" aria-labelledby="i-lbl">
      <button type="button" data-indent="2" aria-pressed="true">2</button>
      <button type="button" data-indent="4" aria-pressed="false">4</button>
      <button type="button" data-indent="tab" aria-pressed="false">Tab</button>
    </div>
  </div>
  <div class="checkline" style="margin:0 0 9px"><input type="checkbox" id="keepcom" checked><label for="keepcom">Keep comments</label></div>
</div>
<div class="actions">
  <button class="btn btn-primary" id="go">Format</button>
  <button class="btn" id="min">Minify</button>
  <button class="btn" id="copy">Copy</button>
  <button class="btn" id="dl">Download .css</button>
  <button class="btn btn-ghost" id="clear">Clear</button>
</div>
<div class="msg" id="msg"></div>
<div class="field" style="margin-top:16px">
  <label for="out">Output</label>
  <pre class="out" id="out" data-empty="Formatted CSS appears here." tabindex="0"></pre>
</div>`,
  init: function () {
    var indent = '  ';
    MT.$$('[data-indent]').forEach(function (b) {
      b.addEventListener('click', function () {
        MT.$$('[data-indent]').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        indent = b.dataset.indent === 'tab' ? '\t' : ' '.repeat(parseInt(b.dataset.indent, 10));
        if (MT.$('#out').textContent) format();
      });
    });

    // Split CSS into tokens while respecting strings, comments and url()
    function scan(css) {
      var out = [], buf = '', i = 0, n = css.length;
      while (i < n) {
        var c = css[i];
        if (c === '/' && css[i + 1] === '*') {
          var e = css.indexOf('*/', i + 2);
          e = e === -1 ? n : e + 2;
          out.push({ t: 'comment', v: css.slice(i, e) });
          i = e; continue;
        }
        if (c === '"' || c === "'") {
          var q = c, j = i + 1;
          while (j < n && css[j] !== q) { if (css[j] === '\\') j++; j++; }
          buf += css.slice(i, Math.min(j + 1, n));
          i = j + 1; continue;
        }
        if (c === '{' || c === '}' || c === ';') {
          if (buf.trim()) out.push({ t: 'text', v: buf.trim() });
          buf = '';
          out.push({ t: c });
          i++; continue;
        }
        buf += c; i++;
      }
      if (buf.trim()) out.push({ t: 'text', v: buf.trim() });
      return out;
    }

    function tidyDecl(d) {
      return d.replace(/\s*:\s*/, ': ').replace(/\s*,\s*/g, ', ').replace(/\s+/g, ' ').trim();
    }
    function tidySel(s) {
      return s.replace(/\s*,\s*/g, ',\n').replace(/\s+/g, ' ').replace(/\s*([>+~])\s*/g, ' $1 ').trim();
    }

    function format() {
      var src = MT.$('#in').value;
      if (!src.trim()) { MT.msg('#msg', 'Paste some CSS first.', 'warn'); return; }
      var toks = scan(src), out = [], depth = 0, keep = MT.$('#keepcom').checked, rules = 0, open = 0;
      function pad() { return indent.repeat(Math.max(0, depth)); }
      for (var i = 0; i < toks.length; i++) {
        var tk = toks[i];
        if (tk.t === 'comment') { if (keep) out.push(pad() + tk.v.trim()); continue; }
        if (tk.t === '{') {
          var sel = out.pop() || '';
          out.push(sel.replace(/\n/g, '\n' + pad()) + ' {');
          depth++; open++; rules++;
          continue;
        }
        if (tk.t === '}') {
          depth--; open--;
          out.push(pad() + '}');
          continue;
        }
        if (tk.t === ';') continue;
        var isBlockStart = toks[i + 1] && toks[i + 1].t === '{';
        out.push(pad() + (isBlockStart ? tidySel(tk.v) : tidyDecl(tk.v) + ';'));
      }
      MT.$('#out').textContent = out.join('\n').replace(/\n\}/g, '\n}').replace(/\}\n(?!\n|$)/g, '}\n\n');
      if (open !== 0) MT.msg('#msg', 'Formatted ' + MT.plural(rules, 'rule') + ', but the braces do not balance — ' + Math.abs(open) + ' ' + (open > 0 ? 'block is left open' : 'stray closing brace') + '.', 'warn');
      else MT.msg('#msg', 'Formatted ' + MT.plural(rules, 'rule') + '.', 'ok');
      MT.done({ mode: 'format' });
    }

    function minify() {
      var src = MT.$('#in').value;
      if (!src.trim()) { MT.msg('#msg', 'Paste some CSS first.', 'warn'); return; }
      var toks = scan(src), out = '';
      toks.forEach(function (tk, i) {
        if (tk.t === 'comment') return;
        if (tk.t === '{') { out += '{'; return; }
        if (tk.t === '}') { out = out.replace(/;$/, '') + '}'; return; }
        if (tk.t === ';') return;
        var v = tk.v.replace(/\s+/g, ' ').replace(/\s*([:,>+~{}])\s*/g, '$1').trim();
        var isBlockStart = toks[i + 1] && toks[i + 1].t === '{';
        out += isBlockStart ? v : v + ';';
      });
      out = out.replace(/;\}/g, '}').replace(/0\.(\d)/g, '.$1');
      MT.$('#out').textContent = out;
      var a = new Blob([src]).size, b = new Blob([out]).size;
      MT.msg('#msg', 'Minified from ' + MT.fmtBytes(a) + ' to ' + MT.fmtBytes(b) + ' (' + Math.max(0, Math.round((1 - b / a) * 100)) + '% smaller).', 'ok');
      MT.done({ mode: 'minify' });
    }

    MT.on('#go', 'click', MT.guard(format));
    MT.on('#min', 'click', MT.guard(minify));
    MT.on('#copy', 'click', function (e) { MT.copy(MT.$('#out').textContent, e.currentTarget); });
    MT.on('#dl', 'click', function () {
      var t = MT.$('#out').textContent;
      if (!t) { MT.toast('Format something first'); return; }
      MT.download(t, 'styles.css', 'text/css');
    });
    MT.on('#clear', 'click', function () {
      MT.$('#in').value = ''; MT.$('#out').textContent = ''; MT.clearMsg('#msg'); MT.$('#in').focus();
    });
  },
  howto: [
    'Paste your CSS, minified or not.',
    'Press <b>Format</b> for one declaration per line, or <b>Minify</b> to strip everything optional.',
    'Copy the result or download it as a <code>.css</code> file.'
  ],
  sections: [
    { h: 'How the parser avoids common traps',
      p: `<p>Formatting CSS by splitting on braces and semicolons works until it meets real stylesheets. This tool scans character by character and tracks context, so three awkward cases behave correctly:</p>
<ul>
<li><b>Semicolons inside strings.</b> <code>content: "a;b"</code> is one declaration, not two.</li>
<li><b>Braces inside comments.</b> A commented-out rule does not change the indent level.</li>
<li><b>Nested at-rules.</b> <code>@media</code>, <code>@supports</code> and <code>@layer</code> contain full rules, so their contents are indented one level deeper.</li>
</ul>` },
    { h: 'What minifying removes — and what it does not',
      p: `<p>Minifying here strips comments, collapses whitespace, removes the final semicolon in each block and shortens leading zeros (<code>0.5em</code> becomes <code>.5em</code>). These are safe, purely syntactic changes.</p>
<p>It deliberately stops short of the risky optimisations that a build tool performs: it will not merge duplicate selectors, reorder declarations, shorten hex colours or drop rules it believes are unused. Those transformations require understanding the cascade, and getting them wrong changes how a page looks. For production builds, run a dedicated minifier in your pipeline; this tool is for quick, predictable cleanups.</p>` }
  ],
  faq: [
    { q: 'Does it work on SCSS or Less?', a: 'Partly. Plain nesting and standard syntax usually survive, but variables, mixins and control directives are treated as ordinary text. Compile to CSS first for reliable results.' },
    { q: 'Will formatting change how my page renders?', a: 'No. Only whitespace, comments and optional semicolons change. Selector specificity, declaration order and the cascade are untouched.' },
    { q: 'Why are my comments gone?', a: 'Switch on "Keep comments" before formatting. Minifying always removes them, including licence headers — copy those back manually if your project requires them.' },
    { q: 'Can it detect unused CSS?', a: 'No. That needs the HTML and JavaScript that use the stylesheet. Browser dev tools have a coverage panel that reports it for a live page.' }
  ]
},

/* ------------------------------------------------------------------ */
{
  slug: 'javascript-formatter',
  name: 'JavaScript Formatter',
  icon: 'JS',
  category: 'developer',
  desc: 'Re-indent JavaScript so nesting and blocks are readable.',
  seoTitle: 'JavaScript Formatter — Free Online JS Beautifier',
  metaDescription: 'Format JavaScript online for free. Re-indent minified or messy code with correct handling of strings, template literals, comments and regular expressions.',
  keywords: ['javascript formatter', 'js beautifier', 'format javascript online', 'js indent'],
  popularity: 71,
  related: ['json-formatter', 'css-formatter', 'html-formatter', 'regex-tester', 'base64-decoder'],
  intro: 'Restore indentation and line breaks to compressed or badly formatted JavaScript. Strings, template literals, comments and regular expressions are recognised and left intact.',
  html: `
<div class="notice"><strong>What this does:</strong> it re-indents code and splits statements onto their own lines. It is not a full parser, so it will not rewrite your syntax, rename anything or reflow long expressions. Broken code stays broken — but it becomes readable enough to fix.</div>
<div class="field">
  <label for="in">JavaScript input</label>
  <textarea id="in" spellcheck="false" placeholder="function greet(name){ if (!name) { return null } return &quot;Hi &quot; + name }"></textarea>
</div>
<div class="row tight" style="align-items:flex-end;gap:14px">
  <div style="flex:0 0 auto">
    <span class="lbl" id="i-lbl">Indent</span>
    <div class="seg" role="group" aria-labelledby="i-lbl">
      <button type="button" data-indent="2" aria-pressed="true">2</button>
      <button type="button" data-indent="4" aria-pressed="false">4</button>
      <button type="button" data-indent="tab" aria-pressed="false">Tab</button>
    </div>
  </div>
</div>
<div class="actions">
  <button class="btn btn-primary" id="go">Format</button>
  <button class="btn" id="copy">Copy</button>
  <button class="btn" id="dl">Download .js</button>
  <button class="btn btn-ghost" id="clear">Clear</button>
</div>
<div class="msg" id="msg"></div>
<div class="field" style="margin-top:16px">
  <label for="out">Output</label>
  <pre class="out" id="out" data-empty="Formatted JavaScript appears here." tabindex="0"></pre>
</div>`,
  init: function () {
    var indent = '  ';
    MT.$$('[data-indent]').forEach(function (b) {
      b.addEventListener('click', function () {
        MT.$$('[data-indent]').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        indent = b.dataset.indent === 'tab' ? '\t' : ' '.repeat(parseInt(b.dataset.indent, 10));
        if (MT.$('#out').textContent) format();
      });
    });

    function format() {
      var src = MT.$('#in').value;
      if (!src.trim()) { MT.msg('#msg', 'Paste some JavaScript first.', 'warn'); return; }

      var out = '', depth = 0, i = 0, n = src.length;
      var lineStart = true, parens = 0, inFor = 0;
      var prevSig = '';   // last significant character emitted

      function nl() {
        out = out.replace(/[ \t]+$/, '');
        out += '\n' + indent.repeat(Math.max(0, depth));
        lineStart = true;
      }
      function put(s) {
        if (lineStart && /^\s+$/.test(s)) return;
        out += s;
        var t = s.trim();
        if (t) { prevSig = t[t.length - 1]; lineStart = false; }
      }
      // Decide whether a '/' begins a regex literal rather than division
      function regexAllowed() {
        return prevSig === '' || '(,=:[!&|?{};+-*%~^<>'.indexOf(prevSig) !== -1;
      }

      while (i < n) {
        var c = src[i];

        // comments
        if (c === '/' && src[i + 1] === '/') {
          var e = src.indexOf('\n', i); e = e === -1 ? n : e;
          if (!lineStart) put(' ');
          put(src.slice(i, e).trim());
          i = e; nl(); continue;
        }
        if (c === '/' && src[i + 1] === '*') {
          var e2 = src.indexOf('*/', i + 2); e2 = e2 === -1 ? n : e2 + 2;
          put(src.slice(i, e2));
          i = e2; nl(); continue;
        }
        // strings
        if (c === '"' || c === "'") {
          var q = c, j = i + 1;
          while (j < n && src[j] !== q) { if (src[j] === '\\') j++; j++; }
          put(src.slice(i, Math.min(j + 1, n)));
          i = j + 1; continue;
        }
        // template literals (kept verbatim, including newlines)
        if (c === '`') {
          var k = i + 1, tdepth = 0;
          while (k < n) {
            if (src[k] === '\\') { k += 2; continue; }
            if (src[k] === '$' && src[k + 1] === '{') { tdepth++; k += 2; continue; }
            if (src[k] === '}' && tdepth > 0) { tdepth--; k++; continue; }
            if (src[k] === '`' && tdepth === 0) break;
            k++;
          }
          put(src.slice(i, Math.min(k + 1, n)));
          i = k + 1; continue;
        }
        // regex literal
        if (c === '/' && regexAllowed()) {
          var r = i + 1, inClass = false, ok = false;
          while (r < n) {
            if (src[r] === '\\') { r += 2; continue; }
            if (src[r] === '[') inClass = true;
            else if (src[r] === ']') inClass = false;
            else if (src[r] === '/' && !inClass) { ok = true; break; }
            else if (src[r] === '\n') break;
            r++;
          }
          if (ok) {
            var flags = /^[gimsuyvd]*/.exec(src.slice(r + 1))[0];
            put(src.slice(i, r + 1 + flags.length));
            i = r + 1 + flags.length; continue;
          }
        }
        // structure
        if (c === '{') {
          if (!lineStart && !/[\s({[]$/.test(out)) put(' ');
          put('{'); depth++; nl(); i++; continue;
        }
        if (c === '}') {
          depth--;
          if (!lineStart) nl();
          else out = out.replace(/[ \t]*$/, indent.repeat(Math.max(0, depth)));
          put('}');
          var after = src.slice(i + 1).match(/^\s*(else|catch|finally|while|\)|,|;|\.)/);
          i++;
          if (!after) nl();
          continue;
        }
        if (c === '(') { parens++; if (/\bfor\s*$/.test(out)) inFor = parens; put('('); i++; continue; }
        if (c === ')') { if (inFor === parens) inFor = 0; parens--; put(')'); i++; continue; }
        if (c === ';') {
          put(';');
          i++;
          if (!inFor) {
            var rest = src.slice(i).match(/^\s*(\}|$)/);
            if (!rest) nl();
          } else put(' ');
          continue;
        }
        if (c === ',') {
          put(',');
          i++;
          put(' ');
          continue;
        }
        if (/\s/.test(c)) {
          if (c === '\n') {
            var nxt = src.slice(i).match(/^\s*/)[0];
            if (/\n\s*\n/.test(nxt) && !lineStart) { nl(); out += '\n' + indent.repeat(Math.max(0, depth)); }
            else if (!lineStart) nl();
            i += nxt.length;
            continue;
          }
          if (!lineStart && !/[\s]$/.test(out)) put(' ');
          i++; continue;
        }
        put(c); i++;
      }

      var text = out.split('\n').map(function (l) { return l.replace(/\s+$/, ''); }).join('\n').replace(/\n{3,}/g, '\n\n').trim();
      MT.$('#out').textContent = text;
      if (depth !== 0) MT.msg('#msg', 'Formatted, but braces do not balance — ' + Math.abs(depth) + ' ' + (depth > 0 ? 'block left open' : 'extra closing brace') + '. Check the end of the file.', 'warn');
      else MT.msg('#msg', 'Formatted ' + MT.plural(text.split('\n').length, 'line') + '.', 'ok');
      MT.done();
    }

    MT.on('#go', 'click', MT.guard(format));
    MT.on('#copy', 'click', function (e) { MT.copy(MT.$('#out').textContent, e.currentTarget); });
    MT.on('#dl', 'click', function () {
      var t = MT.$('#out').textContent;
      if (!t) { MT.toast('Format something first'); return; }
      MT.download(t, 'formatted.js', 'text/javascript');
    });
    MT.on('#clear', 'click', function () {
      MT.$('#in').value = ''; MT.$('#out').textContent = ''; MT.clearMsg('#msg'); MT.$('#in').focus();
    });
  },
  howto: [
    'Paste JavaScript — minified, compressed or just untidy.',
    'Choose an indent width and press <b>Format</b>.',
    'Read the result, then copy it or download it as a <code>.js</code> file.'
  ],
  sections: [
    { h: 'Why formatting JavaScript is harder than JSON',
      p: `<p>JSON has one unambiguous grammar. JavaScript has several constructs where the same character means different things depending on what came before it, and a formatter that ignores this produces mangled output.</p>
<p>The hardest case is the forward slash. In <code>a / b</code> it is division; in <code>str.split(/,/)</code> it starts a regular expression. Telling them apart requires knowing whether an expression is currently expected — this tool decides from the previous significant character, which handles ordinary code correctly. Template literals are the other trap: everything between backticks is data, including newlines and braces, except inside <code>\${…}</code> where code resumes.</p>` },
    { h: 'What this tool will not do',
      p: `<p>It is an indenter, not a printer. Tools like Prettier parse your code into a syntax tree and print it back from scratch, which lets them wrap long argument lists, normalise quotes, add or remove semicolons and reformat chained calls. That requires a full JavaScript parser.</p>
<p>This tool works on the token stream instead. The trade is deliberate: it loads instantly, it never rewrites code it did not understand, and it happily formats a file with a syntax error — which is often exactly when you need to read it. For consistent project-wide style, use a proper formatter in your editor and commit hooks.</p>` },
    { h: 'A common use: reading minified code',
      p: `<p>The most frequent reason to reach for this is a compressed bundle you need to understand — a third-party script, an error trace pointing at column 14,208, or a snippet from a page you are debugging. Formatting turns one enormous line into something you can scroll. Variable names stay mangled, since only a source map can restore those, but control flow becomes visible.</p>` }
  ],
  faq: [
    { q: 'Does it change what my code does?', a: 'It only inserts and removes whitespace and line breaks outside strings, comments, template literals and regular expressions. Behaviour is unchanged — with one caveat below about semicolons.' },
    { q: 'Is it safe on code without semicolons?', a: 'Mostly, because line breaks are added where statements already ended. But automatic semicolon insertion is subtle, so if you write in a semicolon-free style, review the output before running it.' },
    { q: 'Can it format TypeScript or JSX?', a: 'It will not crash, but type annotations and JSX tags are treated as ordinary tokens, so indentation around them is approximate. A TypeScript-aware formatter will do better.' },
    { q: 'Can it un-minify variable names?', a: 'No. Minifiers discard the original names entirely. Only a source map published alongside the bundle can recover them.' },
    { q: 'Is my code uploaded?', a: 'No. Everything runs in your browser, so proprietary or unreleased code never leaves your machine.' }
  ]
},

/* ------------------------------------------------------------------ */
{
  slug: 'regex-tester',
  name: 'Regex Tester',
  icon: '.*',
  category: 'developer',
  desc: 'Test regular expressions live, with highlighted matches and groups.',
  seoTitle: 'Regex Tester — Test Regular Expressions Online Free',
  metaDescription: 'Test and debug regular expressions online. See highlighted matches, capture groups and named groups update as you type, with a built-in cheat sheet.',
  keywords: ['regex tester', 'regular expression tester', 'regex online', 'test regex', 'regex101 alternative'],
  popularity: 82, featured: true,
  related: ['text-sorter', 'remove-duplicate-lines', 'javascript-formatter', 'url-encoder', 'word-counter'],
  intro: 'Write a pattern, paste some text, and watch matches highlight as you type. Capture groups, named groups and match positions are listed underneath.',
  html: `
<div class="row" style="align-items:flex-end">
  <div class="field" style="flex:1 1 320px">
    <label for="pat">Pattern</label>
    <div style="display:flex;align-items:center;gap:6px">
      <span style="color:var(--muted);font-family:var(--mono)">/</span>
      <input type="text" id="pat" spellcheck="false" placeholder="(\\w+)@(\\w+)\\.com" style="font-family:var(--mono)">
      <span style="color:var(--muted);font-family:var(--mono)">/</span>
    </div>
  </div>
  <div class="field" style="flex:0 0 auto;min-width:190px">
    <label for="flags">Flags</label>
    <input type="text" id="flags" value="g" spellcheck="false" placeholder="gim" style="font-family:var(--mono);max-width:120px">
  </div>
</div>
<div class="row tight" style="gap:6px;margin:-6px 0 14px">
  <button class="btn btn-sm" data-flag="g" aria-pressed="true">g global</button>
  <button class="btn btn-sm" data-flag="i" aria-pressed="false">i ignore case</button>
  <button class="btn btn-sm" data-flag="m" aria-pressed="false">m multiline</button>
  <button class="btn btn-sm" data-flag="s" aria-pressed="false">s dotall</button>
  <button class="btn btn-sm" data-flag="u" aria-pressed="false">u unicode</button>
</div>
<div class="field">
  <label for="in">Test text</label>
  <textarea id="in" spellcheck="false" placeholder="ada@example.com&#10;grace@navy.com"></textarea>
</div>
<div class="msg" id="msg"></div>
<div class="field" style="margin-top:16px">
  <span class="lbl">Matches</span>
  <div class="out" id="hl" data-empty="Highlighted text appears here." style="white-space:pre-wrap"></div>
</div>
<div id="groups-wrap" hidden style="margin-top:16px">
  <span class="lbl">Match detail</span>
  <div class="out" id="groups" style="white-space:pre-wrap"></div>
</div>`,
  init: function () {
    var timer = null;

    function syncFlagButtons() {
      var f = MT.$('#flags').value;
      MT.$$('[data-flag]').forEach(function (b) {
        b.setAttribute('aria-pressed', f.indexOf(b.dataset.flag) !== -1 ? 'true' : 'false');
      });
    }
    MT.$$('[data-flag]').forEach(function (b) {
      b.addEventListener('click', function () {
        var f = MT.$('#flags').value, fl = b.dataset.flag;
        MT.$('#flags').value = f.indexOf(fl) !== -1 ? f.replace(fl, '') : f + fl;
        syncFlagButtons(); run();
      });
    });

    function run() {
      var pat = MT.$('#pat').value;
      var flags = MT.$('#flags').value.replace(/[^gimsuyvd]/g, '');
      MT.$('#flags').value = flags;
      syncFlagButtons();
      var text = MT.$('#in').value;
      MT.$('#groups-wrap').hidden = true;

      if (!pat) { MT.clearMsg('#msg'); MT.$('#hl').textContent = ''; return; }
      var re;
      try { re = new RegExp(pat, flags); }
      catch (err) {
        MT.msg('#msg', 'Invalid pattern: ' + err.message.replace(/^Invalid regular expression: [^:]*: /, ''), 'err');
        MT.$('#hl').textContent = '';
        return;
      }
      if (!text) { MT.msg('#msg', 'Add some test text to match against.', 'info'); MT.$('#hl').textContent = ''; return; }

      var matches = [], m, guard = 0;
      if (flags.indexOf('g') !== -1) {
        re.lastIndex = 0;
        while ((m = re.exec(text)) !== null) {
          matches.push(m);
          if (m[0] === '') re.lastIndex++;
          if (++guard > 10000) break;
        }
      } else {
        m = re.exec(text);
        if (m) matches.push(m);
      }

      // highlight
      var html = '', last = 0;
      matches.forEach(function (mm) {
        html += MT.escapeHtml(text.slice(last, mm.index));
        html += '<mark style="background:var(--accent-wash);color:var(--accent-ink);border-radius:3px;padding:0 1px">' +
          MT.escapeHtml(mm[0] === '' ? '\u200b' : mm[0]) + '</mark>';
        last = mm.index + (mm[0].length || 0);
      });
      html += MT.escapeHtml(text.slice(last));
      MT.$('#hl').innerHTML = html || '';

      if (!matches.length) {
        MT.msg('#msg', 'No matches. Check for anchors, escaping, or a missing “i” flag.', 'warn');
        return;
      }
      MT.msg('#msg', MT.plural(matches.length, 'match', 'matches') + ' found.' + (guard > 10000 ? ' Stopped at 10,000.' : ''), 'ok');

      var lines = matches.slice(0, 100).map(function (mm, i) {
        var parts = ['#' + (i + 1) + '  index ' + mm.index + '  “' + mm[0] + '”'];
        for (var g = 1; g < mm.length; g++) {
          parts.push('     group ' + g + ': ' + (mm[g] === undefined ? '(no match)' : '“' + mm[g] + '”'));
        }
        if (mm.groups) {
          Object.keys(mm.groups).forEach(function (k) {
            parts.push('     <' + k + '>: ' + (mm.groups[k] === undefined ? '(no match)' : '“' + mm.groups[k] + '”'));
          });
        }
        return parts.join('\n');
      });
      MT.$('#groups').textContent = lines.join('\n\n') + (matches.length > 100 ? '\n\n… ' + (matches.length - 100) + ' more' : '');
      MT.$('#groups-wrap').hidden = false;
      MT.done({ matches: matches.length });
    }

    function debounce() { clearTimeout(timer); timer = setTimeout(run, 140); }
    ['#pat', '#flags', '#in'].forEach(function (s) {
      MT.on(s, 'input', debounce);
      // Paste, autofill and blur fire 'change' without a keystroke — run at once
      // so the highlight never shows a stale result.
      MT.on(s, 'change', function () { clearTimeout(timer); run(); });
    });
    MT.$('#pat').value = '(\\w+)@(\\w+)\\.com';
    MT.$('#in').value = 'ada@example.com\ngrace@navy.com\nnot-an-email';
    run();
  },
  howto: [
    'Type a pattern in the top box — write it without the surrounding slashes.',
    'Toggle flags, or type them directly. <code>g</code> finds every match, <code>i</code> ignores case, <code>m</code> makes <code>^</code> and <code>$</code> match each line.',
    'Paste your test text. Matches highlight as you type, with capture groups listed below.'
  ],
  sections: [
    { h: 'Quick reference',
      p: `<table>
<tr><th>Token</th><th>Matches</th></tr>
<tr><td><code>.</code></td><td>Any character except a newline (add the <code>s</code> flag to include it)</td></tr>
<tr><td><code>\\d</code> <code>\\w</code> <code>\\s</code></td><td>Digit, word character, whitespace. Capitalise to invert.</td></tr>
<tr><td><code>*</code> <code>+</code> <code>?</code></td><td>Zero or more, one or more, optional</td></tr>
<tr><td><code>{2,5}</code></td><td>Between two and five times</td></tr>
<tr><td><code>[abc]</code> <code>[^abc]</code></td><td>Any one of these, none of these</td></tr>
<tr><td><code>(…)</code> <code>(?:…)</code></td><td>Capture group, non-capturing group</td></tr>
<tr><td><code>(?&lt;name&gt;…)</code></td><td>Named capture group</td></tr>
<tr><td><code>^</code> <code>$</code></td><td>Start and end of the string, or of each line with <code>m</code></td></tr>
<tr><td><code>\\b</code></td><td>Word boundary</td></tr>
<tr><td><code>a|b</code></td><td>Either alternative</td></tr>
</table>` },
    { h: 'Greedy versus lazy',
      p: `<p>Quantifiers take as much as they can. Against <code>&lt;b&gt;one&lt;/b&gt; &lt;b&gt;two&lt;/b&gt;</code>, the pattern <code>&lt;b&gt;.*&lt;/b&gt;</code> matches the entire line, because <code>.*</code> runs to the end and then backtracks to the <em>last</em> closing tag.</p>
<p>Adding <code>?</code> makes a quantifier lazy: <code>&lt;b&gt;.*?&lt;/b&gt;</code> stops at the first closing tag and returns two separate matches. This single character is the fix for most "my regex matched too much" problems.</p>` },
    { h: 'Where regex is the wrong tool',
      p: `<p>Regular expressions cannot reliably parse nested structures — HTML, JSON, or anything with matching brackets — because nesting requires counting, which regular grammars cannot do. Use a parser instead; for HTML, <code>DOMParser</code> in the browser.</p>
<p>Email validation is the other classic trap. The specification-complete pattern is thousands of characters long and still accepts addresses no mail server would deliver to. Check for an <code>@</code> with something on either side, then send a confirmation message. That is what real systems do.</p>` }
  ],
  faq: [
    { q: 'Which regex dialect is this?', a: 'JavaScript\'s, using the browser\'s built-in engine. It is close to PCRE but differs in places: no possessive quantifiers, no recursion, and lookbehind requires a recent browser.' },
    { q: 'Why does my pattern hang or feel slow?', a: 'Nested quantifiers like (a+)+ can cause catastrophic backtracking, where the engine explores exponentially many paths. Rewrite to avoid one repeated group inside another. This tool caps at 10,000 matches as a safety net.' },
    { q: 'How do I match a literal dot or slash?', a: 'Escape it with a backslash: \\. matches a full stop, and \\/ matches a slash. Inside a character class, most characters lose their special meaning, so [.] also works.' },
    { q: 'Do I need to escape my pattern differently than in code?', a: 'Type it here exactly as it appears between the slashes in a regex literal. If you build patterns from strings in code, remember that string escaping doubles every backslash.' },
    { q: 'Is my test text private?', a: 'Yes. Matching runs in your browser with the native engine, so you can safely test against log lines or customer records.' }
  ]
},

/* ------------------------------------------------------------------ */
{
  slug: 'timestamp-converter',
  name: 'Timestamp Converter',
  icon: '⏱',
  category: 'developer',
  desc: 'Convert Unix timestamps to dates and back, in any time zone.',
  seoTitle: 'Unix Timestamp Converter — Epoch to Date Online',
  metaDescription: 'Convert Unix timestamps to human-readable dates and back. Handles seconds, milliseconds and microseconds, with UTC, local and ISO 8601 output.',
  keywords: ['unix timestamp converter', 'epoch converter', 'timestamp to date', 'epoch to date', 'unix time'],
  popularity: 83,
  related: ['date-calculator', 'time-zone-converter', 'time-calculator', 'json-formatter', 'age-calculator'],
  intro: 'Paste an epoch value and read it as a date, or pick a date and get the epoch. Seconds, milliseconds and microseconds are detected automatically.',
  html: `
<div class="panel" style="box-shadow:none;margin-bottom:18px">
  <div class="panel-bar"><span class="dot"></span> Current time<span class="pb-right" id="live">—</span></div>
  <div class="panel-body" style="padding:12px 16px">
    <table class="kv">
      <tr><td>Unix seconds</td><td><span id="now-s">—</span> <button class="btn btn-sm btn-ghost" id="cp-s">Copy</button></td></tr>
      <tr><td>Unix milliseconds</td><td><span id="now-ms">—</span> <button class="btn btn-sm btn-ghost" id="cp-ms">Copy</button></td></tr>
      <tr><td>ISO 8601 (UTC)</td><td style="font-size:.85rem"><span id="now-iso">—</span></td></tr>
    </table>
  </div>
</div>

<h3 style="margin-top:0">Timestamp to date</h3>
<div class="row" style="align-items:flex-end">
  <div class="field"><label for="ts">Unix timestamp</label><input type="text" id="ts" inputmode="numeric" placeholder="1735689600" style="font-family:var(--mono)"></div>
  <div class="field" style="flex:0 0 auto;min-width:170px"><label for="unit">Unit</label>
    <select id="unit"><option value="auto">Detect automatically</option><option value="s">Seconds</option><option value="ms">Milliseconds</option><option value="us">Microseconds</option></select>
  </div>
</div>
<div class="actions"><button class="btn btn-primary" id="go1">Convert to date</button></div>
<div class="msg" id="msg1"></div>
<table class="kv" id="res1" hidden style="margin-top:14px">
  <tr><td>Local time</td><td id="r-local">—</td></tr>
  <tr><td>UTC</td><td id="r-utc">—</td></tr>
  <tr><td>ISO 8601</td><td id="r-iso" style="font-size:.85rem">—</td></tr>
  <tr><td>Relative</td><td id="r-rel">—</td></tr>
  <tr><td>Day of week</td><td id="r-dow">—</td></tr>
</table>

<h3>Date to timestamp</h3>
<div class="row" style="align-items:flex-end">
  <div class="field"><label for="dt">Date and time</label><input type="datetime-local" id="dt" step="1"></div>
  <div class="field" style="flex:0 0 auto;min-width:170px"><label for="zone">Interpret as</label>
    <select id="zone"><option value="local">Local time</option><option value="utc">UTC</option></select>
  </div>
</div>
<div class="actions"><button class="btn btn-primary" id="go2">Convert to timestamp</button></div>
<div class="msg" id="msg2"></div>
<table class="kv" id="res2" hidden style="margin-top:14px">
  <tr><td>Unix seconds</td><td id="r2-s">—</td></tr>
  <tr><td>Unix milliseconds</td><td id="r2-ms">—</td></tr>
  <tr><td>ISO 8601 (UTC)</td><td id="r2-iso" style="font-size:.85rem">—</td></tr>
</table>`,
  init: function () {
    function tick() {
      var d = new Date();
      MT.$('#live').textContent = Intl.DateTimeFormat().resolvedOptions().timeZone || 'local';
      MT.$('#now-s').textContent = Math.floor(d.getTime() / 1000);
      MT.$('#now-ms').textContent = d.getTime();
      MT.$('#now-iso').textContent = d.toISOString();
    }
    tick();
    setInterval(tick, 1000);
    MT.on('#cp-s', 'click', function (e) { MT.copy(MT.$('#now-s').textContent, e.currentTarget); });
    MT.on('#cp-ms', 'click', function (e) { MT.copy(MT.$('#now-ms').textContent, e.currentTarget); });

    function relative(ms) {
      var diff = ms - Date.now(), past = diff < 0, a = Math.abs(diff);
      var units = [[31536000000, 'year'], [2592000000, 'month'], [86400000, 'day'], [3600000, 'hour'], [60000, 'minute'], [1000, 'second']];
      for (var i = 0; i < units.length; i++) {
        if (a >= units[i][0]) {
          var v = Math.round(a / units[i][0]);
          return past ? MT.plural(v, units[i][1]) + ' ago' : 'in ' + MT.plural(v, units[i][1]);
        }
      }
      return 'just now';
    }

    MT.on('#go1', 'click', MT.guard(function () {
      var raw = MT.$('#ts').value.trim().replace(/[,_\s]/g, '');
      MT.$('#res1').hidden = true;
      if (!raw) { MT.msg('#msg1', 'Enter a timestamp.', 'warn'); return; }
      if (!/^-?\d+(\.\d+)?$/.test(raw)) { MT.msg('#msg1', 'A timestamp must be a number. Remove any letters or symbols.', 'err'); return; }
      var n = parseFloat(raw), unit = MT.$('#unit').value, ms;
      var digits = raw.replace(/^-|\..*$/g, '').length;
      if (unit === 'auto') {
        if (digits >= 16) { unit = 'us'; } else if (digits >= 12) { unit = 'ms'; } else { unit = 's'; }
      }
      ms = unit === 's' ? n * 1000 : unit === 'ms' ? n : n / 1000;
      var d = new Date(ms);
      if (isNaN(d.getTime())) { MT.msg('#msg1', 'That value is outside the range JavaScript can represent as a date.', 'err'); return; }
      MT.$('#r-local').textContent = d.toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'medium' });
      MT.$('#r-utc').textContent = d.toUTCString();
      MT.$('#r-iso').textContent = d.toISOString();
      MT.$('#r-rel').textContent = relative(ms);
      MT.$('#r-dow').textContent = d.toLocaleDateString(undefined, { weekday: 'long' });
      MT.$('#res1').hidden = false;
      MT.msg('#msg1', 'Read as ' + (unit === 's' ? 'seconds' : unit === 'ms' ? 'milliseconds' : 'microseconds') + '.', 'ok');
      MT.done({ dir: 'to-date' });
    }));

    MT.on('#go2', 'click', MT.guard(function () {
      var v = MT.$('#dt').value;
      MT.$('#res2').hidden = true;
      if (!v) { MT.msg('#msg2', 'Pick a date and time.', 'warn'); return; }
      var d = MT.$('#zone').value === 'utc' ? new Date(v + (v.length === 16 ? ':00' : '') + 'Z') : new Date(v);
      if (isNaN(d.getTime())) { MT.msg('#msg2', 'That date could not be read. Try picking it again.', 'err'); return; }
      MT.$('#r2-s').textContent = Math.floor(d.getTime() / 1000);
      MT.$('#r2-ms').textContent = d.getTime();
      MT.$('#r2-iso').textContent = d.toISOString();
      MT.$('#res2').hidden = false;
      MT.clearMsg('#msg2');
      MT.done({ dir: 'to-timestamp' });
    }));

    var now = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
    MT.$('#dt').value = now.toISOString().slice(0, 19);
  },
  howto: [
    'To read a timestamp: paste it into the first box and press <b>Convert to date</b>. The unit is detected from the number of digits.',
    'To create one: pick a date, choose whether it is local time or UTC, then press <b>Convert to timestamp</b>.',
    'The panel at the top shows the current time and can be copied with one click.'
  ],
  sections: [
    { h: 'What a Unix timestamp is',
      p: `<p>A Unix timestamp counts the seconds since midnight UTC on 1 January 1970 — the Unix epoch. It has no time zone, no daylight saving and no ambiguity, which is why almost every system stores time this way and converts to local time only for display.</p>
<p>The count deliberately ignores leap seconds. A day is always exactly 86,400 seconds, so on the rare days that carry a leap second, Unix time repeats or skips a value rather than counting it. For everything short of scientific timekeeping, this is what you want.</p>` },
    { h: 'Seconds, milliseconds or microseconds?',
      p: `<p>Getting the unit wrong is the most common timestamp bug — a value in milliseconds read as seconds lands in the year 56,000. Digit count is a reliable guide for any date in living memory:</p>
<table>
<tr><th>Digits</th><th>Unit</th><th>Example</th><th>Used by</th></tr>
<tr><td>10</td><td>Seconds</td><td>1735689600</td><td>Unix, PHP, Python, most APIs</td></tr>
<tr><td>13</td><td>Milliseconds</td><td>1735689600000</td><td>JavaScript, Java</td></tr>
<tr><td>16</td><td>Microseconds</td><td>1735689600000000</td><td>Postgres internals, some tracing systems</td></tr>
</table>
<p>A quick sanity check: a ten-digit timestamp starting with 17 is somewhere in the mid-2020s.</p>` },
    { h: 'The 2038 problem',
      p: `<p>Systems that store Unix time in a signed 32-bit integer overflow at 03:14:07 UTC on 19 January 2038, wrapping to 1901. Modern platforms use 64-bit values and are unaffected, but embedded devices, old database columns and legacy file formats still carry the limit. If you work with dates beyond 2038 — mortgage terms, pension records, expiry dates — it is worth checking what your storage layer actually uses.</p>` }
  ],
  faq: [
    { q: 'Why does the local time differ from what I expected?', a: 'Local conversion uses your device\'s time zone and its daylight-saving rules for that specific date. A timestamp from July shows a different offset than one from January in most of Europe and North America.' },
    { q: 'Can a timestamp be negative?', a: 'Yes. Negative values are dates before 1970 and are handled correctly here. Some older systems and databases reject them, which is worth knowing before storing historical dates.' },
    { q: 'What is ISO 8601?', a: 'A standard textual format like 2025-01-01T00:00:00.000Z. The trailing Z means UTC. Unlike a bare timestamp, it is human-readable while staying unambiguous, which makes it a good choice for logs and APIs.' },
    { q: 'Does this account for leap seconds?', a: 'No, and neither does Unix time itself. Every day counts as exactly 86,400 seconds by definition.' },
    { q: 'Why is the current time slightly off?', a: 'The clock reads your device. If it drifts, everything derived from it drifts too. Enabling automatic network time in your system settings fixes it.' }
  ]
},

/* ------------------------------------------------------------------ */
{
  slug: 'color-converter',
  name: 'Color Converter',
  icon: '◐',
  category: 'developer',
  desc: 'Convert colours between HEX, RGB, HSL and HSV with a live preview.',
  seoTitle: 'Color Converter — HEX to RGB, HSL and HSV Online',
  metaDescription: 'Convert colours between HEX, RGB, HSL and HSV for free. Live preview, alpha support and a contrast check against black and white.',
  keywords: ['color converter', 'hex to rgb', 'rgb to hex', 'hsl converter', 'color picker'],
  popularity: 79,
  related: ['image-to-base64', 'css-formatter', 'html-formatter', 'image-compressor', 'password-generator'],
  intro: 'Enter a colour in any common notation and get every other form back, plus a contrast reading you can check against accessibility requirements.',
  html: `
<div class="row" style="align-items:flex-end">
  <div class="field" style="flex:0 0 auto;width:110px"><label for="pick">Pick</label><input type="color" id="pick" value="#1a4fd6"></div>
  <div class="field"><label for="in">Or type a colour</label><input type="text" id="in" value="#1a4fd6" spellcheck="false" placeholder="#1a4fd6, rgb(26 79 214), hsl(222 79% 47%)" style="font-family:var(--mono)"></div>
</div>
<div class="msg" id="msg"></div>
<div id="swatch" style="height:88px;border-radius:10px;border:1px solid var(--rule);margin:16px 0;display:grid;place-items:center;font-weight:700;letter-spacing:-.02em"></div>
<table class="kv">
  <tr><td>HEX</td><td><span id="o-hex">—</span> <button class="btn btn-sm btn-ghost" data-cp="o-hex">Copy</button></td></tr>
  <tr><td>RGB</td><td><span id="o-rgb">—</span> <button class="btn btn-sm btn-ghost" data-cp="o-rgb">Copy</button></td></tr>
  <tr><td>HSL</td><td><span id="o-hsl">—</span> <button class="btn btn-sm btn-ghost" data-cp="o-hsl">Copy</button></td></tr>
  <tr><td>HSV</td><td><span id="o-hsv">—</span> <button class="btn btn-sm btn-ghost" data-cp="o-hsv">Copy</button></td></tr>
  <tr><td>Relative luminance</td><td id="o-lum">—</td></tr>
  <tr><td>Contrast with white</td><td id="o-cw">—</td></tr>
  <tr><td>Contrast with black</td><td id="o-cb">—</td></tr>
</table>`,
  init: function () {
    var NAMED = { black: '#000000', white: '#ffffff', red: '#ff0000', lime: '#00ff00', blue: '#0000ff', yellow: '#ffff00', cyan: '#00ffff', magenta: '#ff00ff', silver: '#c0c0c0', gray: '#808080', grey: '#808080', maroon: '#800000', olive: '#808000', green: '#008000', purple: '#800080', teal: '#008080', navy: '#000080', orange: '#ffa500', pink: '#ffc0cb', brown: '#a52a2a', gold: '#ffd700', indigo: '#4b0082', violet: '#ee82ee', tomato: '#ff6347', salmon: '#fa8072', crimson: '#dc143c', khaki: '#f0e68c', beige: '#f5f5dc', ivory: '#fffff0', coral: '#ff7f50', turquoise: '#40e0d0', lavender: '#e6e6fa' };

    function parse(str) {
      var s = String(str).trim().toLowerCase();
      if (NAMED[s]) s = NAMED[s];
      var m;
      if ((m = /^#?([0-9a-f]{3,8})$/.exec(s))) {
        var h = m[1];
        if (h.length === 3 || h.length === 4) h = h.split('').map(function (c) { return c + c; }).join('');
        if (h.length !== 6 && h.length !== 8) return null;
        return {
          r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16),
          a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1
        };
      }
      if ((m = /^rgba?\(([^)]+)\)$/.exec(s))) {
        var p = m[1].split(/[\s,\/]+/).filter(Boolean).map(parseFloat);
        if (p.length < 3 || p.some(isNaN)) return null;
        return { r: clamp(p[0]), g: clamp(p[1]), b: clamp(p[2]), a: p.length > 3 ? Math.min(1, Math.max(0, p[3])) : 1 };
      }
      if ((m = /^hsla?\(([^)]+)\)$/.exec(s))) {
        var q = m[1].split(/[\s,\/]+/).filter(Boolean).map(parseFloat);
        if (q.length < 3 || q.some(isNaN)) return null;
        var rgb = hsl2rgb(((q[0] % 360) + 360) % 360, Math.min(100, Math.max(0, q[1])) / 100, Math.min(100, Math.max(0, q[2])) / 100);
        rgb.a = q.length > 3 ? Math.min(1, Math.max(0, q[3])) : 1;
        return rgb;
      }
      return null;
    }
    function clamp(v) { return Math.max(0, Math.min(255, Math.round(v))); }
    function hsl2rgb(h, s, l) {
      var c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m2 = l - c / 2;
      var t = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
      return { r: Math.round((t[0] + m2) * 255), g: Math.round((t[1] + m2) * 255), b: Math.round((t[2] + m2) * 255), a: 1 };
    }
    function rgb2hsl(r, g, b) {
      r /= 255; g /= 255; b /= 255;
      var mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, h = 0, s = 0, l = (mx + mn) / 2;
      if (d) {
        s = d / (1 - Math.abs(2 * l - 1));
        h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
        h *= 60; if (h < 0) h += 360;
      }
      return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
    }
    function rgb2hsv(r, g, b) {
      r /= 255; g /= 255; b /= 255;
      var mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, h = 0;
      if (d) {
        h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
        h *= 60; if (h < 0) h += 360;
      }
      return { h: Math.round(h), s: Math.round((mx ? d / mx : 0) * 100), v: Math.round(mx * 100) };
    }
    function lum(r, g, b) {
      var f = [r, g, b].map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
      return 0.2126 * f[0] + 0.7152 * f[1] + 0.0722 * f[2];
    }
    function ratio(l1, l2) { return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); }
    function hex(n) { return n.toString(16).padStart(2, '0'); }
    function grade(r) {
      if (r >= 7) return 'AAA';
      if (r >= 4.5) return 'AA';
      if (r >= 3) return 'AA large text only';
      return 'fails WCAG';
    }

    function update(str, fromPicker) {
      var c = parse(str);
      if (!c) {
        MT.msg('#msg', 'That colour could not be read. Try a form like #1a4fd6, rgb(26 79 214) or hsl(222 79% 47%).', 'err');
        return;
      }
      MT.clearMsg('#msg');
      var hx = '#' + hex(c.r) + hex(c.g) + hex(c.b) + (c.a < 1 ? hex(Math.round(c.a * 255)) : '');
      var hs = rgb2hsl(c.r, c.g, c.b), hv = rgb2hsv(c.r, c.g, c.b);
      MT.$('#o-hex').textContent = hx;
      MT.$('#o-rgb').textContent = c.a < 1 ? 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + (+c.a.toFixed(3)) + ')' : 'rgb(' + c.r + ', ' + c.g + ', ' + c.b + ')';
      MT.$('#o-hsl').textContent = (c.a < 1 ? 'hsla(' : 'hsl(') + hs.h + ', ' + hs.s + '%, ' + hs.l + '%' + (c.a < 1 ? ', ' + (+c.a.toFixed(3)) : '') + ')';
      MT.$('#o-hsv').textContent = 'hsv(' + hv.h + ', ' + hv.s + '%, ' + hv.v + '%)';
      var L = lum(c.r, c.g, c.b);
      var cw = ratio(L, 1), cb = ratio(L, 0);
      MT.$('#o-lum').textContent = L.toFixed(4);
      MT.$('#o-cw').textContent = cw.toFixed(2) + ':1 — ' + grade(cw);
      MT.$('#o-cb').textContent = cb.toFixed(2) + ':1 — ' + grade(cb);
      var sw = MT.$('#swatch');
      sw.style.background = 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + c.a + ')';
      sw.style.color = cw > cb ? '#fff' : '#000';
      sw.textContent = hx.toUpperCase();
      if (!fromPicker) MT.$('#pick').value = '#' + hex(c.r) + hex(c.g) + hex(c.b);
      MT.done();
    }

    MT.on('#in', 'input', function (e) { update(e.target.value); });
    MT.on('#pick', 'input', function (e) { MT.$('#in').value = e.target.value; update(e.target.value, true); });
    MT.$$('[data-cp]').forEach(function (b) {
      b.addEventListener('click', function () { MT.copy(document.getElementById(b.dataset.cp).textContent, b); });
    });
    update('#1a4fd6');
  },
  howto: [
    'Use the swatch to pick a colour visually, or type one in any notation — HEX, RGB, HSL or a CSS colour name.',
    'Every other format updates instantly. Press <b>Copy</b> beside the one you need.',
    'Check the contrast rows before using the colour for text.'
  ],
  sections: [
    { h: 'Which format to use where',
      p: `<p><b>HEX</b> is compact and universal — the default in design tools and CSS. <b>RGB</b> maps directly to what a screen emits and is what canvas and image code works in. <b>HSL</b> is the one to reach for when you are building a palette: keep the hue, change the lightness, and you have a coherent set of tints and shades without guessing at hex digits.</p>
<p><b>HSV</b> (also called HSB) is what most colour pickers show internally. It differs from HSL in what the third value means: in HSV, full value with full saturation is the pure vivid hue, while in HSL that same hue sits at 50% lightness and 100% is always white.</p>` },
    { h: 'Reading the contrast numbers',
      p: `<p>Contrast ratio compares relative luminance and runs from 1:1 (identical) to 21:1 (black on white). WCAG 2.1 sets the thresholds:</p>
<ul>
<li><b>4.5:1</b> — minimum for normal body text (level AA)</li>
<li><b>3:1</b> — minimum for large text, 18pt or 14pt bold (level AA)</li>
<li><b>7:1</b> — enhanced contrast for body text (level AAA)</li>
<li><b>3:1</b> — minimum for icons, borders and other non-text elements</li>
</ul>
<p>The rows above test your colour against pure white and pure black, which tells you which text colour to place on it. For a specific pairing, convert both colours and compare their luminance values.</p>` },
    { h: 'Alpha and the eight-digit hex',
      p: `<p>Adding two more hex digits sets opacity: <code>#1a4fd680</code> is the same blue at 50%. Every current browser supports this, though older tooling sometimes does not. Note that a translucent colour has no fixed contrast ratio — it depends on whatever sits behind it, so the readings above assume full opacity.</p>` }
  ],
  faq: [
    { q: 'Why does my HSL conversion differ slightly from another tool?', a: 'HSL components are rounded to whole numbers for readability. Converting back and forth can shift a channel by one, which is invisible on screen but shows up in a string comparison.' },
    { q: 'Does it support the newer CSS colour spaces?', a: 'Not yet. oklch, lab and color() describe colours outside the sRGB gamut, so converting them to HEX would silently clip. This tool covers the sRGB formats where conversion is exact.' },
    { q: 'Can I paste a colour name?', a: 'Common CSS names like tomato, teal and lavender are recognised. The full list runs to 148 entries; if a name is not found, paste its hex value instead.' },
    { q: 'Is the contrast check enough for accessibility?', a: 'It covers the WCAG 2.1 numeric requirement, which is the one most audits test. It cannot judge whether text sits over a busy image or whether colour alone carries meaning — both need human review.' }
  ]
}

];
