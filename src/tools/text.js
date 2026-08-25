// MEGA TOOLS — Text tools
export default [

/* ------------------------------------------------------------------ */
{
  slug: 'word-counter',
  name: 'Word Counter',
  icon: '📝',
  category: 'text',
  desc: 'Count words, characters, sentences and reading time as you type.',
  seoTitle: 'Word Counter — Free Online Word and Character Count',
  metaDescription: 'Count words, characters, sentences, paragraphs and reading time instantly. Includes keyword frequency and a live progress bar against a target word count.',
  keywords: ['word counter', 'word count tool', 'character count', 'reading time calculator', 'count words online'],
  popularity: 96, featured: true,
  related: ['character-counter', 'case-converter', 'text-sorter', 'remove-duplicate-lines', 'slug-generator'],
  intro: 'Paste or type and every count updates immediately. Useful for essays with a word limit, meta descriptions, and anything with a hard character cap.',
  html: `
<div class="field">
  <label for="in">Your text</label>
  <textarea id="in" class="plain" spellcheck="false" style="min-height:210px" placeholder="Start typing or paste your text here…"></textarea>
</div>
<div class="stat-grid">
  <div class="stat"><div class="sv" id="s-words">0</div><div class="sl">Words</div></div>
  <div class="stat"><div class="sv" id="s-chars">0</div><div class="sl">Characters</div></div>
  <div class="stat"><div class="sv" id="s-nospace">0</div><div class="sl">Characters, no spaces</div></div>
  <div class="stat"><div class="sv" id="s-sent">0</div><div class="sl">Sentences</div></div>
  <div class="stat"><div class="sv" id="s-para">0</div><div class="sl">Paragraphs</div></div>
  <div class="stat"><div class="sv" id="s-read">0s</div><div class="sl">Reading time</div></div>
</div>
<div class="row" style="margin-top:16px;align-items:flex-end">
  <div class="field" style="flex:0 0 auto;min-width:170px"><label for="target">Target word count</label><input type="number" id="target" value="0" min="0" step="10"></div>
  <div class="field" style="flex:1 1 200px">
    <span class="lbl">Progress</span>
    <div class="progress" data-show="true" style="margin-top:0"><i id="bar"></i></div>
    <p class="hint" id="prog">Set a target to track progress.</p>
  </div>
</div>
<div class="actions">
  <button class="btn" id="copy">Copy text</button>
  <button class="btn" id="freq">Show word frequency</button>
  <button class="btn btn-ghost" id="clear">Clear</button>
</div>
<div id="freq-wrap" hidden style="margin-top:16px">
  <span class="lbl">Most used words</span>
  <table class="kv" id="freq-table"></table>
</div>`,
  init: function () {
    var STOP = 'the a an and or but of to in on at for with is are was were be been it this that as by from not you your i we they he she'.split(' ');

    function count() {
      var t = MT.$('#in').value;
      var words = t.trim() ? t.trim().split(/\s+/).filter(function (w) { return /[\p{L}\p{N}]/u.test(w); }).length : 0;
      var chars = Array.from(t).length;
      var nospace = Array.from(t.replace(/\s/g, '')).length;
      var sentences = (t.match(/[^\s.!?…]+(?:[.!?…]+|$)/g) || []).filter(function (s) { return /[\p{L}\p{N}]/u.test(s); }).length;
      var paras = t.split(/\n\s*\n/).filter(function (p) { return p.trim(); }).length;
      var secs = Math.round(words / 238 * 60);

      MT.$('#s-words').textContent = MT.fmtNum(words);
      MT.$('#s-chars').textContent = MT.fmtNum(chars);
      MT.$('#s-nospace').textContent = MT.fmtNum(nospace);
      MT.$('#s-sent').textContent = MT.fmtNum(sentences);
      MT.$('#s-para').textContent = MT.fmtNum(paras);
      MT.$('#s-read').textContent = secs < 60 ? secs + 's' : Math.floor(secs / 60) + 'm ' + (secs % 60) + 's';

      var target = MT.num('#target', 0);
      if (target > 0) {
        var pct = Math.min(100, words / target * 100);
        MT.$('#bar').style.width = pct + '%';
        MT.$('#bar').style.background = words > target ? 'var(--warn)' : 'var(--accent)';
        MT.$('#prog').textContent = words >= target
          ? 'Target reached — ' + MT.fmtNum(words - target) + ' over.'
          : MT.fmtNum(target - words) + ' words to go (' + Math.round(pct) + '%).';
      } else {
        MT.$('#bar').style.width = '0%';
        MT.$('#prog').textContent = 'Set a target to track progress.';
      }
    }

    MT.on('#in', 'input', count);
    MT.on('#target', 'input', count);
    MT.on('#copy', 'click', function (e) { MT.copy(MT.$('#in').value, e.currentTarget); });
    MT.on('#clear', 'click', function () { MT.$('#in').value = ''; MT.$('#freq-wrap').hidden = true; count(); MT.$('#in').focus(); });
    MT.on('#freq', 'click', function () {
      var t = MT.$('#in').value.toLowerCase();
      var words = t.match(/[\p{L}\p{N}'-]+/gu) || [];
      if (!words.length) { MT.toast('Add some text first'); return; }
      var map = {};
      words.forEach(function (w) { if (w.length > 2 && STOP.indexOf(w) === -1) map[w] = (map[w] || 0) + 1; });
      var top = Object.keys(map).sort(function (a, b) { return map[b] - map[a] || a.localeCompare(b); }).slice(0, 12);
      if (!top.length) { MT.toast('No significant words found'); return; }
      MT.$('#freq-table').innerHTML = top.map(function (w) {
        return '<tr><td>' + MT.escapeHtml(w) + '</td><td>' + map[w] + ' × (' + (map[w] / words.length * 100).toFixed(1) + '%)</td></tr>';
      }).join('');
      MT.$('#freq-wrap').hidden = false;
      MT.done({ action: 'frequency' });
    });
    count();
  },
  howto: [
    'Type or paste your text into the box. Every statistic updates as you type.',
    'Set a target word count to see a progress bar and how many words remain.',
    'Press <b>Show word frequency</b> to see which words you lean on most.'
  ],
  sections: [
    { h: 'How each number is counted',
      p: `<p>Counting sounds trivial until you compare two tools and get different answers. Here is exactly what this one does:</p>
<ul>
<li><b>Words</b> — text split on whitespace, keeping only chunks that contain a letter or digit. A hyphenated compound counts as one word; a standalone dash does not count at all.</li>
<li><b>Characters</b> — every character including spaces and line breaks, counted by Unicode code point so an emoji counts as one, not two.</li>
<li><b>Sentences</b> — runs of text ending in a full stop, question mark or exclamation mark. Abbreviations like "e.g." inflate this slightly; no automated counter avoids that entirely.</li>
<li><b>Paragraphs</b> — blocks separated by a blank line.</li>
<li><b>Reading time</b> — words ÷ 238 per minute, the average for adult silent reading of general prose.</li>
</ul>` },
    { h: 'Common limits worth knowing',
      p: `<table>
<tr><th>Where</th><th>Limit</th></tr>
<tr><td>Meta description</td><td>~155 characters before truncation</td></tr>
<tr><td>Page title</td><td>~60 characters</td></tr>
<tr><td>SMS, single message</td><td>160 characters (70 with emoji or non-Latin script)</td></tr>
<tr><td>Bluesky post</td><td>300 characters</td></tr>
<tr><td>LinkedIn headline</td><td>220 characters</td></tr>
<tr><td>Email subject line</td><td>~50 characters on mobile</td></tr>
</table>
<p>Character limits almost always count spaces, which is why the "no spaces" figure is shown separately rather than as the headline number.</p>` },
    { h: 'Why word counts differ between tools',
      p: `<p>Microsoft Word, Google Docs and this tool can all disagree on the same document. The usual causes are hyphenated words, numbers with separators, text inside footnotes and headers, and whether standalone symbols count. Differences of 1–2% are normal.</p>
<p>If you are writing to a hard limit set by someone else, count in the tool they will use to check. For a university submission, that means the word count in your word processor.</p>` }
  ],
  faq: [
    { q: 'Is my text sent anywhere?', a: 'No. Counting happens in your browser as you type, so unpublished drafts, client work and confidential documents stay on your device.' },
    { q: 'How is reading time calculated?', a: 'Words divided by 238 per minute, an average from studies of adult silent reading. Technical material reads slower; simple prose faster. Treat it as an estimate.' },
    { q: 'Does it count words in other languages?', a: 'Yes for space-separated scripts, including Cyrillic, Greek and accented Latin. Chinese, Japanese and Thai do not separate words with spaces, so the word count is not meaningful for them — use the character count instead.' },
    { q: 'What counts as a word in the frequency list?', a: 'Words of three or more letters, with common function words like "the" and "and" filtered out so the list shows terms that carry meaning.' }
  ]
},

/* ------------------------------------------------------------------ */
{
  slug: 'character-counter',
  name: 'Character Counter',
  icon: '#',
  category: 'text',
  desc: 'Count characters against a limit, with a live countdown.',
  seoTitle: 'Character Counter — Count Characters With a Limit',
  metaDescription: 'Count characters online with a live limit countdown. Presets for meta descriptions, titles, SMS and social posts, with byte size and line counts.',
  keywords: ['character counter', 'character count', 'letter counter', 'count characters online', 'character limit'],
  popularity: 89,
  related: ['word-counter', 'case-converter', 'text-reverser', 'slug-generator', 'lorem-ipsum-generator'],
  intro: 'Built for writing to a limit. Pick a preset or set your own, and watch the counter turn amber then red as you approach it.',
  html: `
<div class="row" style="align-items:flex-end">
  <div class="field" style="flex:0 0 auto;min-width:200px"><label for="preset">Limit preset</label>
    <select id="preset">
      <option value="0">No limit</option>
      <option value="60">Page title — 60</option>
      <option value="155" selected>Meta description — 155</option>
      <option value="160">SMS — 160</option>
      <option value="300">Bluesky post — 300</option>
      <option value="220">LinkedIn headline — 220</option>
      <option value="2200">Instagram caption — 2200</option>
      <option value="custom">Custom…</option>
    </select>
  </div>
  <div class="field" style="flex:0 0 auto;min-width:140px"><label for="limit">Limit</label><input type="number" id="limit" value="155" min="0" step="1"></div>
</div>
<div class="field">
  <label for="in">Your text</label>
  <textarea id="in" class="plain" spellcheck="false" style="min-height:180px" placeholder="Type or paste here…"></textarea>
</div>
<div id="meter" class="msg msg-info" data-show="true" style="margin-top:0"></div>
<div class="stat-grid" style="margin-top:14px">
  <div class="stat"><div class="sv" id="s-chars">0</div><div class="sl">Characters</div></div>
  <div class="stat"><div class="sv" id="s-nospace">0</div><div class="sl">No spaces</div></div>
  <div class="stat"><div class="sv" id="s-letters">0</div><div class="sl">Letters only</div></div>
  <div class="stat"><div class="sv" id="s-words">0</div><div class="sl">Words</div></div>
  <div class="stat"><div class="sv" id="s-lines">0</div><div class="sl">Lines</div></div>
  <div class="stat"><div class="sv" id="s-bytes">0</div><div class="sl">UTF-8 size</div></div>
</div>
<div class="actions">
  <button class="btn" id="copy">Copy</button>
  <button class="btn" id="trim">Trim to limit</button>
  <button class="btn btn-ghost" id="clear">Clear</button>
</div>`,
  init: function () {
    function count() {
      var t = MT.$('#in').value;
      var chars = Array.from(t).length;
      var limit = MT.num('#limit', 0);
      MT.$('#s-chars').textContent = MT.fmtNum(chars);
      MT.$('#s-nospace').textContent = MT.fmtNum(Array.from(t.replace(/\s/g, '')).length);
      MT.$('#s-letters').textContent = MT.fmtNum((t.match(/\p{L}/gu) || []).length);
      MT.$('#s-words').textContent = MT.fmtNum(t.trim() ? t.trim().split(/\s+/).length : 0);
      MT.$('#s-lines').textContent = MT.fmtNum(t ? t.split('\n').length : 0);
      MT.$('#s-bytes').textContent = MT.fmtBytes(new Blob([t]).size);

      var m = MT.$('#meter');
      if (!limit) {
        m.className = 'msg msg-info';
        m.textContent = MT.fmtNum(chars) + ' characters. No limit set.';
        return;
      }
      var left = limit - chars;
      if (left < 0) {
        m.className = 'msg msg-err';
        m.textContent = MT.fmtNum(-left) + ' characters over the limit of ' + MT.fmtNum(limit) + '.';
      } else if (left <= limit * 0.1) {
        m.className = 'msg msg-warn';
        m.textContent = MT.fmtNum(left) + ' characters remaining of ' + MT.fmtNum(limit) + '.';
      } else {
        m.className = 'msg msg-ok';
        m.textContent = MT.fmtNum(left) + ' characters remaining of ' + MT.fmtNum(limit) + '.';
      }
      m.dataset.show = 'true';
    }
    MT.on('#preset', 'change', function (e) {
      if (e.target.value === 'custom') { MT.$('#limit').focus(); MT.$('#limit').select(); return; }
      MT.$('#limit').value = e.target.value;
      count();
    });
    MT.on('#limit', 'input', count);
    MT.on('#in', 'input', count);
    MT.on('#copy', 'click', function (e) { MT.copy(MT.$('#in').value, e.currentTarget); });
    MT.on('#trim', 'click', function () {
      var limit = MT.num('#limit', 0);
      if (!limit) { MT.toast('Set a limit first'); return; }
      var arr = Array.from(MT.$('#in').value);
      if (arr.length <= limit) { MT.toast('Already within the limit'); return; }
      MT.$('#in').value = arr.slice(0, limit).join('');
      count();
      MT.toast('Trimmed to ' + limit + ' characters');
      MT.done({ action: 'trim' });
    });
    MT.on('#clear', 'click', function () { MT.$('#in').value = ''; count(); MT.$('#in').focus(); });
    count();
  },
  howto: [
    'Choose a preset limit, or type your own number.',
    'Write or paste your text. The bar under the box shows how many characters remain.',
    'Use <b>Trim to limit</b> to cut the text down instantly, then edit for sense.'
  ],
  sections: [
    { h: 'Characters, code points and bytes',
      p: `<p>These three counts diverge, and knowing which one a system enforces matters.</p>
<p>An emoji like 👍 is one visible character. In UTF-16 — which JavaScript, Java and Windows use internally — it occupies two units. In UTF-8, the encoding of the web and most databases, it takes four bytes. A flag emoji or one with a skin-tone modifier can consume considerably more.</p>
<p>This tool counts visible characters by Unicode code point, which matches what a person sees and what most social platforms enforce. The UTF-8 size is shown separately because database columns and API limits are usually specified in bytes.</p>` },
    { h: 'The SMS 160-character rule',
      p: `<p>A single SMS holds 160 characters in the GSM 7-bit alphabet. Include one character outside that alphabet — an emoji, a curly quote, an accented letter, or the € sign — and the whole message switches to UCS-2 encoding, cutting the limit to 70 characters.</p>
<p>Longer messages are split and reassembled, but the segments carry a header that reduces capacity to 153 characters each (67 for UCS-2). This is why a 161-character message can cost double to send. Watch for smart quotes pasted from a word processor — they are the most common accidental trigger.</p>` }
  ],
  faq: [
    { q: 'Do spaces count towards the limit?', a: 'Almost always, yes. Every platform and database in the presets above counts spaces. The "no spaces" figure is provided for the rare cases that do not.' },
    { q: 'Why is my meta description still cut off at 155?', a: 'Search engines truncate on pixel width, not character count, so wide letters take more room. 155 is a safe guideline rather than a hard rule — front-load the important words.' },
    { q: 'How does it count line breaks?', a: 'Each newline counts as one character. Many platforms count them too, so a heavily formatted post uses more of its budget than it appears to.' },
    { q: 'Does trimming break emoji?', a: 'No. Trimming works on code points rather than raw units, so a multi-byte character is never cut in half.' }
  ]
},

/* ------------------------------------------------------------------ */
{
  slug: 'case-converter',
  name: 'Case Converter',
  icon: 'Aa',
  category: 'text',
  desc: 'Convert text between eight cases, including programming styles.',
  seoTitle: 'Case Converter — Uppercase, Title Case and camelCase',
  metaDescription: 'Convert text case online free. UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case and kebab-case, all in one click.',
  keywords: ['case converter', 'uppercase converter', 'title case', 'camelcase converter', 'snake case', 'text case'],
  popularity: 91, featured: true,
  related: ['word-counter', 'slug-generator', 'text-sorter', 'remove-duplicate-lines', 'text-reverser'],
  intro: 'Eight conversions in one place — including the four naming conventions programmers switch between constantly.',
  html: `
<div class="field">
  <label for="in">Your text</label>
  <textarea id="in" class="plain" spellcheck="false" placeholder="the quick brown fox jumps over the lazy dog"></textarea>
</div>
<div class="field">
  <span class="lbl">Convert to</span>
  <div class="chips">
    <button class="chip" data-c="upper">UPPERCASE</button>
    <button class="chip" data-c="lower">lowercase</button>
    <button class="chip" data-c="title">Title Case</button>
    <button class="chip" data-c="sentence">Sentence case</button>
    <button class="chip" data-c="camel">camelCase</button>
    <button class="chip" data-c="pascal">PascalCase</button>
    <button class="chip" data-c="snake">snake_case</button>
    <button class="chip" data-c="kebab">kebab-case</button>
    <button class="chip" data-c="constant">CONSTANT_CASE</button>
    <button class="chip" data-c="alternating">aLtErNaTiNg</button>
  </div>
</div>
<div class="actions">
  <button class="btn" id="copy">Copy result</button>
  <button class="btn" id="replace">Replace input with result</button>
  <button class="btn btn-ghost" id="clear">Clear</button>
</div>
<div class="msg" id="msg"></div>
<div class="field" style="margin-top:16px">
  <label for="out">Result</label>
  <pre class="out" id="out" data-empty="Pick a case above to convert your text." tabindex="0"></pre>
</div>`,
  init: function () {
    // Words that stay lowercase in title case unless first or last
    var MINOR = 'a an and as at but by for in nor of on or per so the to up via vs with from into onto over'.split(' ');

    function words(s) {
      return s
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
        .split(/[^\p{L}\p{N}]+/u)
        .filter(Boolean);
    }

    var convert = {
      upper: function (s) { return s.toUpperCase(); },
      lower: function (s) { return s.toLowerCase(); },
      title: function (s) {
        return s.split('\n').map(function (line) {
          var parts = line.split(/(\s+)/);
          var wordIdx = parts.filter(function (p) { return p.trim(); });
          var seen = 0;
          return parts.map(function (p) {
            if (!p.trim()) return p;
            seen++;
            var bare = p.toLowerCase();
            var isEdge = seen === 1 || seen === wordIdx.length;
            var core = bare.replace(/^[^\p{L}\p{N}]*/u, '');
            var lead = bare.slice(0, bare.length - core.length);
            if (!isEdge && MINOR.indexOf(core.replace(/[^\p{L}]+$/u, '')) !== -1) return bare;
            return lead + core.charAt(0).toUpperCase() + core.slice(1);
          }).join('');
        }).join('\n');
      },
      sentence: function (s) {
        return s.toLowerCase().replace(/(^\s*|[.!?…]\s+|\n\s*)(\p{L})/gu, function (m, p, c) { return p + c.toUpperCase(); })
          .replace(/\bi\b/g, 'I');
      },
      camel: function (s) {
        return words(s).map(function (w, i) {
          w = w.toLowerCase();
          return i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1);
        }).join('');
      },
      pascal: function (s) {
        return words(s).map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(); }).join('');
      },
      snake: function (s) { return words(s).map(function (w) { return w.toLowerCase(); }).join('_'); },
      kebab: function (s) { return words(s).map(function (w) { return w.toLowerCase(); }).join('-'); },
      constant: function (s) { return words(s).map(function (w) { return w.toUpperCase(); }).join('_'); },
      alternating: function (s) {
        var i = 0;
        return Array.from(s).map(function (c) {
          if (!/\p{L}/u.test(c)) return c;
          return (i++ % 2 === 0) ? c.toLowerCase() : c.toUpperCase();
        }).join('');
      }
    };

    MT.$$('[data-c]').forEach(function (b) {
      b.addEventListener('click', function () {
        var t = MT.$('#in').value;
        if (!t.trim()) { MT.msg('#msg', 'Enter some text to convert.', 'warn'); return; }
        MT.$$('[data-c]').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        var out = convert[b.dataset.c](t);
        MT.$('#out').textContent = out;
        MT.clearMsg('#msg');
        MT.done({ case: b.dataset.c });
      });
    });
    MT.on('#copy', 'click', function (e) { MT.copy(MT.$('#out').textContent, e.currentTarget); });
    MT.on('#replace', 'click', function () {
      var o = MT.$('#out').textContent;
      if (!o) { MT.toast('Convert something first'); return; }
      MT.$('#in').value = o;
      MT.toast('Input replaced');
    });
    MT.on('#clear', 'click', function () {
      MT.$('#in').value = ''; MT.$('#out').textContent = ''; MT.clearMsg('#msg'); MT.$('#in').focus();
    });
  },
  howto: [
    'Paste or type your text in the input box.',
    'Click the case you want. The result appears underneath.',
    'Copy it, or press <b>Replace input with result</b> to chain another conversion.'
  ],
  sections: [
    { h: 'The programming cases and where each is used',
      p: `<table>
<tr><th>Case</th><th>Example</th><th>Conventional home</th></tr>
<tr><td>camelCase</td><td>userAccountId</td><td>JavaScript and Java variables, JSON keys</td></tr>
<tr><td>PascalCase</td><td>UserAccountId</td><td>Class and component names, C# public members</td></tr>
<tr><td>snake_case</td><td>user_account_id</td><td>Python, Ruby, SQL columns, database tables</td></tr>
<tr><td>kebab-case</td><td>user-account-id</td><td>URLs, CSS classes, HTML attributes, filenames</td></tr>
<tr><td>CONSTANT_CASE</td><td>USER_ACCOUNT_ID</td><td>Constants and environment variables</td></tr>
</table>
<p>The converter splits on existing boundaries before rebuilding, so it recognises the case your text is already in. Feeding it <code>userAccountId</code> and asking for snake_case correctly gives <code>user_account_id</code>, not <code>useraccountid</code>.</p>` },
    { h: 'Title case is not just capitalising every word',
      p: `<p>Proper title case leaves short function words lowercase — articles, coordinating conjunctions and short prepositions — unless they are the first or last word. "The Lord of the Rings", not "The Lord Of The Rings".</p>
<p>Style guides disagree on the details. Chicago lowercases all prepositions regardless of length; AP capitalises those of four letters or more. This tool follows the common convention of lowercasing a standard list of short words, which matches most editorial house styles closely enough for headlines and titles. Proper nouns are the unavoidable gap — no automatic converter knows that "van Gogh" keeps its lowercase "van".</p>` },
    { h: 'Sentence case and accented text',
      p: `<p>Sentence case lowercases everything, then capitalises after each full stop, question mark, exclamation mark and line break. The standalone pronoun "I" is restored, since that is the one word that would otherwise look obviously wrong in English.</p>
<p>All conversions use Unicode-aware casing, so accented characters, Cyrillic and Greek convert correctly. A caveat for Turkish: the dotless ı and dotted İ have locale-specific rules that browsers apply only when told the locale, so Turkish text may need manual correction.</p>` }
  ],
  faq: [
    { q: 'Will it preserve my line breaks?', a: 'Yes for the text cases — upper, lower, title and sentence all keep your paragraph structure. The programming cases deliberately collapse everything into one identifier, since that is what an identifier is.' },
    { q: 'Why did my acronym get mangled in camelCase?', a: 'Runs of capitals are treated as word boundaries, so "parseHTMLDocument" becomes "parse_html_document" in snake_case. That matches most style guides, but check identifiers where an acronym should stay intact.' },
    { q: 'Can I convert a whole list at once?', a: 'Yes for the text cases — paste the list and each line is converted independently. For programming cases, convert one identifier at a time, since they join everything into a single token.' },
    { q: 'Does it handle non-English text?', a: 'Yes. Casing is Unicode-aware, so French, German, Spanish, Greek and Cyrillic all convert correctly. Turkish dotted and dotless i are the known exception.' }
  ]
},

/* ------------------------------------------------------------------ */
{
  slug: 'remove-duplicate-lines',
  name: 'Remove Duplicate Lines',
  icon: '⧉',
  category: 'text',
  desc: 'Strip repeated lines from a list, with case and trim options.',
  seoTitle: 'Remove Duplicate Lines — Deduplicate a List Online',
  metaDescription: 'Remove duplicate lines from text online free. Options for case sensitivity, whitespace trimming, sorting and showing only the duplicates.',
  keywords: ['remove duplicate lines', 'deduplicate list', 'unique lines', 'delete duplicate text'],
  popularity: 73,
  related: ['text-sorter', 'word-counter', 'case-converter', 'diff-checker', 'slug-generator'],
  intro: 'Clean a list down to unique entries. Useful for email lists, keyword sets, log lines and anything pasted together from several sources.',
  html: `
<div class="field">
  <label for="in">Paste your list — one item per line</label>
  <textarea id="in" spellcheck="false" placeholder="apple&#10;banana&#10;Apple&#10;banana "></textarea>
</div>
<div class="row tight" style="gap:16px;flex-wrap:wrap">
  <div class="checkline" style="margin:0"><input type="checkbox" id="ci" checked><label for="ci">Ignore case</label></div>
  <div class="checkline" style="margin:0"><input type="checkbox" id="trim" checked><label for="trim">Trim whitespace</label></div>
  <div class="checkline" style="margin:0"><input type="checkbox" id="blank" checked><label for="blank">Remove blank lines</label></div>
  <div class="checkline" style="margin:0"><input type="checkbox" id="sort"><label for="sort">Sort alphabetically</label></div>
</div>
<div class="field" style="margin-top:14px"><label for="mode">Output</label>
  <select id="mode">
    <option value="unique">Unique lines — keep the first of each</option>
    <option value="dupes">Only the lines that were duplicated</option>
    <option value="once">Only lines that appeared exactly once</option>
  </select>
</div>
<div class="actions">
  <button class="btn btn-primary" id="go">Process</button>
  <button class="btn" id="copy">Copy</button>
  <button class="btn" id="dl">Download .txt</button>
  <button class="btn btn-ghost" id="clear">Clear</button>
</div>
<div class="msg" id="msg"></div>
<div class="stat-grid" id="stats" hidden style="margin-top:14px">
  <div class="stat"><div class="sv" id="s-in">0</div><div class="sl">Lines in</div></div>
  <div class="stat"><div class="sv" id="s-out">0</div><div class="sl">Lines out</div></div>
  <div class="stat"><div class="sv" id="s-removed">0</div><div class="sl">Removed</div></div>
</div>
<div class="field" style="margin-top:16px">
  <label for="out">Result</label>
  <pre class="out" id="out" data-empty="Processed list appears here." tabindex="0"></pre>
</div>`,
  init: function () {
    function run() {
      var raw = MT.$('#in').value;
      if (!raw.trim()) { MT.msg('#msg', 'Paste a list first.', 'warn'); return; }
      var lines = raw.split('\n');
      var doTrim = MT.$('#trim').checked, ci = MT.$('#ci').checked, dropBlank = MT.$('#blank').checked;
      var counts = {}, order = [], display = {};
      lines.forEach(function (l) {
        var v = doTrim ? l.trim() : l;
        if (dropBlank && v.trim() === '') return;
        var key = ci ? v.toLowerCase() : v;
        if (counts[key] === undefined) { counts[key] = 0; order.push(key); display[key] = v; }
        counts[key]++;
      });
      var mode = MT.$('#mode').value;
      var keys = order.filter(function (k) {
        if (mode === 'unique') return true;
        if (mode === 'dupes') return counts[k] > 1;
        return counts[k] === 1;
      });
      if (MT.$('#sort').checked) keys.sort(function (a, b) { return display[a].localeCompare(display[b], undefined, { numeric: true, sensitivity: 'base' }); });
      var out = keys.map(function (k) { return display[k]; });
      MT.$('#out').textContent = out.join('\n');
      var inCount = lines.length;
      MT.$('#s-in').textContent = MT.fmtNum(inCount);
      MT.$('#s-out').textContent = MT.fmtNum(out.length);
      MT.$('#s-removed').textContent = MT.fmtNum(inCount - out.length);
      MT.$('#stats').hidden = false;
      var dupeCount = order.filter(function (k) { return counts[k] > 1; }).length;
      MT.msg('#msg', dupeCount
        ? MT.plural(dupeCount, 'value') + ' appeared more than once. ' + MT.fmtNum(inCount - out.length) + ' lines removed.'
        : 'No duplicates found — every line was already unique.', dupeCount ? 'ok' : 'info');
      MT.done({ mode: mode });
    }
    MT.on('#go', 'click', MT.guard(run));
    MT.$$('#ci, #trim, #blank, #sort, #mode').forEach(function (el) {
      el.addEventListener('change', function () { if (MT.$('#out').textContent) run(); });
    });
    MT.on('#copy', 'click', function (e) { MT.copy(MT.$('#out').textContent, e.currentTarget); });
    MT.on('#dl', 'click', function () {
      var t = MT.$('#out').textContent;
      if (!t) { MT.toast('Process a list first'); return; }
      MT.download(t, 'unique-lines.txt');
    });
    MT.on('#clear', 'click', function () {
      MT.$('#in').value = ''; MT.$('#out').textContent = '';
      MT.$('#stats').hidden = true; MT.clearMsg('#msg'); MT.$('#in').focus();
    });
  },
  howto: [
    'Paste your list with one item per line.',
    'Set the options — ignoring case and trimming whitespace catches near-duplicates that look identical but are not.',
    'Press <b>Process</b>, then copy or download the cleaned list.'
  ],
  sections: [
    { h: 'Why "identical" lines often are not',
      p: `<p>Two lines that look the same on screen frequently differ in ways you cannot see. The usual culprits:</p>
<ul>
<li><b>Trailing spaces</b>, added when text is copied from a table or a PDF.</li>
<li><b>Case differences</b> — <code>Ada@example.com</code> and <code>ada@example.com</code> are the same mailbox but different strings.</li>
<li><b>Non-breaking spaces</b> (U+00A0) pasted from web pages, which look identical to ordinary spaces.</li>
<li><b>Line ending style</b> — Windows files use CRLF, leaving an invisible carriage return at the end of each line.</li>
</ul>
<p>Trimming whitespace and ignoring case are both on by default because these account for most missed duplicates. Turn them off when exact matching matters, as it does for passwords, tokens and case-sensitive identifiers.</p>` },
    { h: 'The three output modes',
      p: `<p><b>Unique lines</b> keeps the first occurrence of each value and drops the rest — the standard deduplication.</p>
<p><b>Only duplicated lines</b> inverts the question: it shows which values appeared more than once. This is the mode for auditing rather than cleaning — finding double-booked records, repeated log entries or accidentally duplicated rows.</p>
<p><b>Only lines that appeared once</b> gives the true singletons, dropping every value that repeated at all. Useful for finding entries present in one list but not another after concatenating both.</p>` }
  ],
  faq: [
    { q: 'Does it keep my original order?', a: 'Yes, unless you switch on sorting. The first occurrence of each value stays in the position it appeared.' },
    { q: 'How large a list can it handle?', a: 'Hundreds of thousands of lines are fine — deduplication uses a hash map, so it scales linearly. Very large pastes are limited by the browser textarea rather than the algorithm.' },
    { q: 'Can I deduplicate on part of each line?', a: 'Not directly. Sort or split the data so the key you care about is the whole line, or use a spreadsheet for column-based deduplication.' },
    { q: 'Is the sort case-sensitive?', a: 'No. Sorting uses natural ordering that ignores case and handles embedded numbers sensibly, so item2 comes before item10.' }
  ]
},

/* ------------------------------------------------------------------ */
{
  slug: 'text-sorter',
  name: 'Text Sorter',
  icon: '↕',
  category: 'text',
  desc: 'Sort lines alphabetically, numerically, by length or at random.',
  seoTitle: 'Text Sorter — Sort Lines Alphabetically Online',
  metaDescription: 'Sort lines of text online free. Alphabetical, reverse, numeric, by length, or shuffled, with natural ordering that handles embedded numbers correctly.',
  keywords: ['text sorter', 'sort lines alphabetically', 'alphabetical sorter', 'sort list online', 'line sorter'],
  popularity: 70,
  related: ['remove-duplicate-lines', 'word-counter', 'case-converter', 'text-reverser', 'diff-checker'],
  intro: 'Sort any list of lines. Natural ordering is used by default, so <code>file10</code> sorts after <code>file9</code> rather than before it.',
  html: `
<div class="field">
  <label for="in">Lines to sort</label>
  <textarea id="in" spellcheck="false" placeholder="banana&#10;apple&#10;cherry"></textarea>
</div>
<div class="row">
  <div class="field"><label for="how">Sort by</label>
    <select id="how">
      <option value="alpha">Alphabetical, A → Z</option>
      <option value="alpha-desc">Alphabetical, Z → A</option>
      <option value="num">Numeric, low → high</option>
      <option value="num-desc">Numeric, high → low</option>
      <option value="len">Length, shortest first</option>
      <option value="len-desc">Length, longest first</option>
      <option value="shuffle">Shuffle randomly</option>
      <option value="reverse">Reverse current order</option>
    </select>
  </div>
</div>
<div class="row tight" style="gap:16px;flex-wrap:wrap">
  <div class="checkline" style="margin:0"><input type="checkbox" id="ci" checked><label for="ci">Ignore case</label></div>
  <div class="checkline" style="margin:0"><input type="checkbox" id="trim" checked><label for="trim">Trim whitespace</label></div>
  <div class="checkline" style="margin:0"><input type="checkbox" id="blank" checked><label for="blank">Remove blank lines</label></div>
  <div class="checkline" style="margin:0"><input type="checkbox" id="dedupe"><label for="dedupe">Remove duplicates</label></div>
</div>
<div class="actions">
  <button class="btn btn-primary" id="go">Sort</button>
  <button class="btn" id="copy">Copy</button>
  <button class="btn" id="dl">Download .txt</button>
  <button class="btn btn-ghost" id="clear">Clear</button>
</div>
<div class="msg" id="msg"></div>
<div class="field" style="margin-top:16px">
  <label for="out">Sorted result</label>
  <pre class="out" id="out" data-empty="Sorted lines appear here." tabindex="0"></pre>
</div>`,
  init: function () {
    function firstNumber(s) {
      var m = /-?\d+(\.\d+)?/.exec(s);
      return m ? parseFloat(m[0]) : NaN;
    }
    function run() {
      var raw = MT.$('#in').value;
      if (!raw.trim()) { MT.msg('#msg', 'Paste some lines to sort.', 'warn'); return; }
      var lines = raw.split('\n');
      if (MT.$('#trim').checked) lines = lines.map(function (l) { return l.trim(); });
      if (MT.$('#blank').checked) lines = lines.filter(function (l) { return l.trim() !== ''; });
      if (MT.$('#dedupe').checked) {
        var seen = {}, out = [];
        lines.forEach(function (l) {
          var k = MT.$('#ci').checked ? l.toLowerCase() : l;
          if (!seen[k]) { seen[k] = 1; out.push(l); }
        });
        lines = out;
      }
      var how = MT.$('#how').value;
      var ci = MT.$('#ci').checked;
      var coll = new Intl.Collator(undefined, { numeric: true, sensitivity: ci ? 'base' : 'variant' });
      var noNumbers = 0;

      if (how === 'alpha') lines.sort(function (a, b) { return coll.compare(a, b); });
      else if (how === 'alpha-desc') lines.sort(function (a, b) { return coll.compare(b, a); });
      else if (how === 'num' || how === 'num-desc') {
        lines.sort(function (a, b) {
          var x = firstNumber(a), y = firstNumber(b);
          if (isNaN(x) && isNaN(y)) return coll.compare(a, b);
          if (isNaN(x)) return 1;
          if (isNaN(y)) return -1;
          return how === 'num' ? x - y : y - x;
        });
        noNumbers = lines.filter(function (l) { return isNaN(firstNumber(l)); }).length;
      }
      else if (how === 'len') lines.sort(function (a, b) { return a.length - b.length || coll.compare(a, b); });
      else if (how === 'len-desc') lines.sort(function (a, b) { return b.length - a.length || coll.compare(a, b); });
      else if (how === 'reverse') lines.reverse();
      else if (how === 'shuffle') {
        for (var i = lines.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var t = lines[i]; lines[i] = lines[j]; lines[j] = t;
        }
      }
      MT.$('#out').textContent = lines.join('\n');
      var note = MT.plural(lines.length, 'line') + ' sorted.';
      if (noNumbers) note += ' ' + MT.plural(noNumbers, 'line') + ' contained no number and were placed at the end.';
      MT.msg('#msg', note, 'ok');
      MT.done({ how: how });
    }
    MT.on('#go', 'click', MT.guard(run));
    MT.$$('#how, #ci, #trim, #blank, #dedupe').forEach(function (el) {
      el.addEventListener('change', function () { if (MT.$('#out').textContent) run(); });
    });
    MT.on('#copy', 'click', function (e) { MT.copy(MT.$('#out').textContent, e.currentTarget); });
    MT.on('#dl', 'click', function () {
      var t = MT.$('#out').textContent;
      if (!t) { MT.toast('Sort something first'); return; }
      MT.download(t, 'sorted.txt');
    });
    MT.on('#clear', 'click', function () {
      MT.$('#in').value = ''; MT.$('#out').textContent = ''; MT.clearMsg('#msg'); MT.$('#in').focus();
    });
  },
  howto: [
    'Paste your lines into the input box.',
    'Pick a sort order and adjust the options — deduplicating while sorting is a common combination.',
    'Press <b>Sort</b>, then copy or download the result.'
  ],
  sections: [
    { h: 'Natural sorting versus ASCII sorting',
      p: `<p>A plain string sort compares character by character, which puts <code>item10</code> before <code>item9</code> — because the character "1" comes before "9". It also sorts all capitals before all lowercase, so <code>Zebra</code> lands ahead of <code>apple</code>.</p>
<p>This tool uses natural ordering instead. Digit sequences are compared as numbers, and case is ignored by default, giving the order a person expects: apple, Banana, cherry, item9, item10. Switch off "Ignore case" if you need strict comparison.</p>` },
    { h: 'Sorting text in other languages',
      p: `<p>Alphabetical order is language-specific. In Swedish, Å, Ä and Ö come after Z; in German they sort with A and O. Spanish once treated "ch" as a single letter. Sorting here uses your browser's locale collation, so the result follows the conventions of your system language.</p>
<p>If you need a specific language's ordering regardless of your device settings, sort in a tool where you can set the locale explicitly — a spreadsheet or a script.</p>` }
  ],
  faq: [
    { q: 'How does numeric sort handle lines with text?', a: 'It finds the first number in each line and sorts on that, so "Chapter 2" and "Chapter 10" order correctly. Lines with no number at all are placed at the end and reported in the message.' },
    { q: 'Is the shuffle truly random?', a: 'It uses a Fisher–Yates shuffle, which gives every permutation equal probability. It draws on Math.random, which is fine for shuffling a list but not suitable for anything security-related.' },
    { q: 'Can I sort by the second column?', a: 'Not directly. For column-aware sorting, paste the data into a spreadsheet. This tool treats each line as one value.' },
    { q: 'Does sorting change my text?', a: 'Only the line order, unless you enable trimming, blank-line removal or deduplication. The content of each line is never modified.' }
  ]
},

/* ------------------------------------------------------------------ */
{
  slug: 'text-reverser',
  name: 'Text Reverser',
  icon: '⇄',
  category: 'text',
  desc: 'Reverse text by character, word or line.',
  seoTitle: 'Text Reverser — Reverse Text, Words and Lines Online',
  metaDescription: 'Reverse text online free. Flip characters, reverse word order, or reverse line order, with correct handling of emoji and accented characters.',
  keywords: ['text reverser', 'reverse text', 'backwards text', 'reverse words', 'flip text'],
  popularity: 62,
  related: ['case-converter', 'text-sorter', 'word-counter', 'character-counter', 'remove-duplicate-lines'],
  intro: 'Three kinds of reversal, and a palindrome check. Emoji and accented characters survive intact, which naïve reversal breaks.',
  html: `
<div class="field">
  <label for="in">Your text</label>
  <textarea id="in" class="plain" spellcheck="false" placeholder="A man, a plan, a canal: Panama"></textarea>
</div>
<div class="field">
  <span class="lbl">Reverse by</span>
  <div class="chips">
    <button class="chip" data-r="chars">Characters</button>
    <button class="chip" data-r="words">Word order</button>
    <button class="chip" data-r="lines">Line order</button>
    <button class="chip" data-r="wordchars">Each word's letters</button>
  </div>
</div>
<div class="actions">
  <button class="btn" id="copy">Copy</button>
  <button class="btn" id="pal">Check palindrome</button>
  <button class="btn btn-ghost" id="clear">Clear</button>
</div>
<div class="msg" id="msg"></div>
<div class="field" style="margin-top:16px">
  <label for="out">Result</label>
  <pre class="out" id="out" data-empty="Pick a reversal above." tabindex="0"></pre>
</div>`,
  init: function () {
    function revChars(s) { return Array.from(s).reverse().join(''); }
    var ops = {
      chars: revChars,
      words: function (s) {
        return s.split('\n').map(function (l) { return l.split(/(\s+)/).reverse().join(''); }).join('\n');
      },
      lines: function (s) { return s.split('\n').reverse().join('\n'); },
      wordchars: function (s) {
        return s.replace(/\S+/g, function (w) { return revChars(w); });
      }
    };
    MT.$$('[data-r]').forEach(function (b) {
      b.addEventListener('click', function () {
        var t = MT.$('#in').value;
        if (!t) { MT.msg('#msg', 'Enter some text first.', 'warn'); return; }
        MT.$$('[data-r]').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        MT.$('#out').textContent = ops[b.dataset.r](t);
        MT.clearMsg('#msg');
        MT.done({ mode: b.dataset.r });
      });
    });
    MT.on('#pal', 'click', function () {
      var t = MT.$('#in').value;
      if (!t.trim()) { MT.msg('#msg', 'Enter some text to check.', 'warn'); return; }
      var norm = t.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
      if (!norm) { MT.msg('#msg', 'There are no letters or digits to check.', 'warn'); return; }
      var isPal = norm === Array.from(norm).reverse().join('');
      MT.msg('#msg', isPal
        ? 'That is a palindrome — it reads the same both ways once punctuation, spaces and case are ignored.'
        : 'Not a palindrome. Ignoring punctuation and case, it reads differently backwards.', isPal ? 'ok' : 'info');
      MT.done({ mode: 'palindrome' });
    });
    MT.on('#copy', 'click', function (e) { MT.copy(MT.$('#out').textContent, e.currentTarget); });
    MT.on('#clear', 'click', function () {
      MT.$('#in').value = ''; MT.$('#out').textContent = ''; MT.clearMsg('#msg'); MT.$('#in').focus();
    });
  },
  howto: [
    'Type or paste the text you want to reverse.',
    'Choose whether to flip characters, word order, line order, or the letters inside each word.',
    'Copy the result, or press <b>Check palindrome</b> to test whether the text reads the same both ways.'
  ],
  sections: [
    { h: 'Why reversing a string is harder than it looks',
      p: `<p>The textbook one-liner — <code>str.split('').reverse().join('')</code> — is subtly broken. It splits on UTF-16 units rather than characters, so any character outside the Basic Multilingual Plane is torn in half. Reverse "I 👍 this" that way and the emoji becomes two pieces of invalid text.</p>
<p>This tool uses <code>Array.from</code>, which iterates by code point and keeps emoji and rare scripts intact. One case remains genuinely unsolvable in a general way: combining marks. A letter with a separately encoded accent, or a family emoji built from several joined code points, can still split apart. Handling those properly needs grapheme cluster segmentation.</p>` },
    { h: 'Palindromes and what counts',
      p: `<p>A palindrome reads the same forwards and backwards. Conventionally, punctuation, spaces and capitalisation are ignored — which is why "A man, a plan, a canal: Panama" qualifies despite the commas and colon.</p>
<p>The check here strips everything that is not a letter or digit, lowercases the rest, and compares. It works across scripts, so palindromes in Cyrillic or Greek are detected the same way.</p>` }
  ],
  faq: [
    { q: 'Does it produce right-to-left text?', a: 'No. Reversing characters changes the order of the characters themselves. Displaying text right-to-left is a rendering direction, set with the CSS direction property or a Unicode marker.' },
    { q: 'Will my emoji survive?', a: 'Single emoji, yes. Compound sequences like family emoji or skin-tone modifiers may split, because they are several joined code points rather than one.' },
    { q: 'What is the difference between reversing words and reversing each word?', a: 'Reversing word order turns "hello big world" into "world big hello". Reversing each word\'s letters gives "olleh gib dlrow". The first keeps every word readable; the second keeps the sentence order.' },
    { q: 'Are line breaks preserved?', a: 'In word and line modes, yes. Reversing characters flips the whole text including newlines, so paragraph structure inverts along with everything else.' }
  ]
},

/* ------------------------------------------------------------------ */
{
  slug: 'slug-generator',
  name: 'Slug Generator',
  icon: '/',
  category: 'text',
  desc: 'Turn titles into clean, URL-safe slugs.',
  seoTitle: 'Slug Generator — Create URL-Friendly Slugs Online',
  metaDescription: 'Convert titles into clean URL slugs. Transliterates accents, strips punctuation, removes stop words optionally, and enforces a maximum length.',
  keywords: ['slug generator', 'url slug', 'permalink generator', 'seo url generator', 'slugify'],
  popularity: 76,
  related: ['case-converter', 'url-encoder', 'word-counter', 'text-sorter', 'character-counter'],
  intro: 'Convert a headline into the URL segment that should sit under it. Accented characters are transliterated rather than dropped, so nothing turns into an empty slug.',
  html: `
<div class="field">
  <label for="in">Title or heading — one per line for a batch</label>
  <textarea id="in" class="plain" spellcheck="false" style="min-height:120px" placeholder="10 Réasons Why Café Culture Is Thriving!"></textarea>
</div>
<div class="row">
  <div class="field" style="flex:0 0 auto;min-width:140px"><label for="sep">Separator</label>
    <select id="sep"><option value="-">Hyphen  -</option><option value="_">Underscore  _</option></select>
  </div>
  <div class="field" style="flex:0 0 auto;min-width:150px"><label for="max">Max length</label><input type="number" id="max" value="0" min="0" max="200" step="5"><p class="hint">0 means no limit</p></div>
</div>
<div class="row tight" style="gap:16px;flex-wrap:wrap">
  <div class="checkline" style="margin:0"><input type="checkbox" id="stop"><label for="stop">Remove common stop words</label></div>
  <div class="checkline" style="margin:0"><input type="checkbox" id="nums" checked><label for="nums">Keep numbers</label></div>
</div>
<div class="actions">
  <button class="btn btn-primary" id="go">Generate slug</button>
  <button class="btn" id="copy">Copy</button>
  <button class="btn btn-ghost" id="clear">Clear</button>
</div>
<div class="msg" id="msg"></div>
<div class="field" style="margin-top:16px">
  <label for="out">Slug</label>
  <pre class="out" id="out" data-empty="Your slug appears here." tabindex="0"></pre>
</div>`,
  init: function () {
    var STOP = 'a an the and or but of to in on at for with is are was were be been it this that as by from not your you'.split(' ');

    function slugify(text) {
      var sep = MT.$('#sep').value;
      var s = text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
      s = s.replace(/ß/g, 'ss').replace(/æ/gi, 'ae').replace(/œ/gi, 'oe').replace(/ø/gi, 'o').replace(/đ/gi, 'd').replace(/ł/gi, 'l').replace(/&/g, ' and ');
      s = s.toLowerCase();
      s = s.replace(MT.$('#nums').checked ? /[^a-z0-9]+/g : /[^a-z]+/g, ' ').trim();
      var words = s.split(/\s+/).filter(Boolean);
      if (MT.$('#stop').checked) {
        var kept = words.filter(function (w) { return STOP.indexOf(w) === -1; });
        if (kept.length) words = kept;
      }
      var slug = words.join(sep);
      var max = MT.num('#max', 0);
      if (max > 0 && slug.length > max) {
        slug = slug.slice(0, max);
        var cut = slug.lastIndexOf(sep);
        if (cut > max * 0.5) slug = slug.slice(0, cut);
      }
      return slug.replace(new RegExp('^\\' + sep + '+|\\' + sep + '+$', 'g'), '');
    }

    function run() {
      var raw = MT.$('#in').value;
      if (!raw.trim()) { MT.msg('#msg', 'Enter a title to convert.', 'warn'); return; }
      var lines = raw.split('\n').filter(function (l) { return l.trim(); });
      var slugs = lines.map(slugify);
      var empty = slugs.filter(function (s) { return !s; }).length;
      MT.$('#out').textContent = slugs.join('\n');
      if (empty) {
        MT.msg('#msg', MT.plural(empty, 'line') + ' produced an empty slug — the text contained no characters that survive transliteration. Non-Latin scripts need manual romanisation.', 'warn');
      } else {
        MT.msg('#msg', slugs.length === 1
          ? 'Slug is ' + slugs[0].length + ' characters.'
          : MT.plural(slugs.length, 'slug') + ' generated.', 'ok');
      }
      MT.done({ count: slugs.length });
    }
    MT.on('#go', 'click', MT.guard(run));
    MT.on('#in', 'input', function () { if (MT.$('#out').textContent) run(); });
    MT.$$('#sep, #max, #stop, #nums').forEach(function (el) {
      el.addEventListener('change', function () { if (MT.$('#out').textContent) run(); });
    });
    MT.on('#copy', 'click', function (e) { MT.copy(MT.$('#out').textContent, e.currentTarget); });
    MT.on('#clear', 'click', function () {
      MT.$('#in').value = ''; MT.$('#out').textContent = ''; MT.clearMsg('#msg'); MT.$('#in').focus();
    });
  },
  howto: [
    'Paste a title. Add several lines to convert a batch at once.',
    'Choose a separator and, if you want, a maximum length. Truncation snaps back to a word boundary rather than cutting mid-word.',
    'Press <b>Generate slug</b> and copy the result.'
  ],
  sections: [
    { h: 'What makes a good slug',
      p: `<p>A slug is the human-readable part of a URL. Good ones share a few properties:</p>
<ul>
<li><b>Lowercase.</b> Some servers treat URLs as case-sensitive, so mixed case creates duplicate addresses for one page.</li>
<li><b>Hyphens, not underscores.</b> Search engines have long treated hyphens as word separators and underscores as joiners.</li>
<li><b>Short but meaningful.</b> Three to six words is a good target. The slug should make sense read on its own.</li>
<li><b>Stable.</b> Changing a slug breaks every existing link. If you must change one, redirect the old address.</li>
</ul>
<p>Do not put a date in a slug unless the content is genuinely tied to a date — it makes an article look stale the following year.</p>` },
    { h: 'Transliteration versus deletion',
      p: `<p>Naïve slug functions strip anything that is not a–z, which turns "Café" into "caf" and a Greek headline into nothing at all. This tool normalises to NFKD first, separating accents from their base letters so the accents can be removed while the letters survive: café → cafe, naïve → naive, Zürich → zurich.</p>
<p>Ligatures and letters with strokes need explicit mapping, since decomposition does not cover them — ß becomes ss, æ becomes ae, ø becomes o. Non-Latin scripts cannot be handled this way at all. Cyrillic, Greek, Arabic and CJK need real romanisation, so the tool warns you rather than silently producing an empty slug.</p>` },
    { h: 'Should stop words be removed?',
      p: `<p>Removing "the", "of" and "a" makes slugs shorter and denser. It also makes some of them read oddly — "how-to-make-bread" becomes "how-make-bread". Search engines handle both fine, so this is a readability decision rather than a ranking one.</p>
<p>The option is off by default. When it is on, the tool keeps the original words if removing stop words would leave nothing behind.</p>` }
  ],
  faq: [
    { q: 'Hyphens or underscores?', a: 'Hyphens, for anything public-facing. Google has stated it treats hyphens as word separators and underscores as joiners, so my_blog_post may be read as one long token.' },
    { q: 'How long should a slug be?', a: 'Long enough to describe the page, short enough to read at a glance. Under 60 characters is a reasonable ceiling; there is no technical limit that matters at these lengths.' },
    { q: 'Why is my slug empty?', a: 'The input contained no Latin letters or digits after transliteration — usually a title in a non-Latin script or one made only of punctuation. Romanise it manually, or write an English slug.' },
    { q: 'Can I convert a whole list at once?', a: 'Yes. Put one title per line and each is converted separately, keeping the same order in the output.' }
  ]
},

/* ------------------------------------------------------------------ */
{
  slug: 'lorem-ipsum-generator',
  name: 'Lorem Ipsum Generator',
  icon: '¶',
  category: 'text',
  desc: 'Generate placeholder text by paragraph, sentence or word.',
  seoTitle: 'Lorem Ipsum Generator — Free Placeholder Text',
  metaDescription: 'Generate lorem ipsum placeholder text online free. Choose paragraphs, sentences or an exact word count, with optional HTML tags for mockups.',
  keywords: ['lorem ipsum generator', 'placeholder text', 'dummy text generator', 'filler text'],
  popularity: 74,
  related: ['word-counter', 'character-counter', 'case-converter', 'html-formatter', 'slug-generator'],
  intro: 'Placeholder copy for layouts and mockups. Choose how much you need and whether it should come wrapped in HTML tags.',
  html: `
<div class="row">
  <div class="field"><label for="count">How many</label><input type="number" id="count" value="3" min="1" max="200" step="1"></div>
  <div class="field"><label for="unit">Unit</label>
    <select id="unit"><option value="para">Paragraphs</option><option value="sent">Sentences</option><option value="word">Words</option><option value="list">List items</option></select>
  </div>
  <div class="field"><label for="len">Paragraph length</label>
    <select id="len"><option value="short">Short — 2–3 sentences</option><option value="medium" selected>Medium — 4–6 sentences</option><option value="long">Long — 7–10 sentences</option></select>
  </div>
</div>
<div class="row tight" style="gap:16px;flex-wrap:wrap">
  <div class="checkline" style="margin:0"><input type="checkbox" id="classic" checked><label for="classic">Start with “Lorem ipsum dolor sit amet”</label></div>
  <div class="checkline" style="margin:0"><input type="checkbox" id="html"><label for="html">Wrap in HTML tags</label></div>
</div>
<div class="actions">
  <button class="btn btn-primary" id="go">Generate</button>
  <button class="btn" id="copy">Copy</button>
  <button class="btn btn-ghost" id="clear">Clear</button>
</div>
<div class="msg" id="msg"></div>
<div class="field" style="margin-top:16px">
  <label for="out">Placeholder text</label>
  <pre class="out" id="out" data-empty="Generated text appears here." style="max-height:420px;overflow:auto" tabindex="0"></pre>
</div>`,
  init: function () {
    var WORDS = ('lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum at vero eos accusamus iusto odio dignissimos ducimus blanditiis praesentium voluptatum deleniti atque corrupti quos dolores quas molestias excepturi occaecati cupiditate similique mollitia animi dolorem fuga harum quidem rerum facilis expedita distinctio nam libero tempore cum soluta nobis eligendi optio cumque nihil impedit quo minus maxime placeat facere possimus omnis assumenda repellendus temporibus autem quibusdam aut officiis debitis necessitatibus saepe eveniet voluptates repudiandae recusandae itaque earum hic tenetur sapiente delectus reiciendis voluptatibus perferendis doloribus asperiores repellat').split(' ');

    function pick() { return WORDS[Math.floor(Math.random() * WORDS.length)]; }
    function sentence(minW, maxW) {
      var n = minW + Math.floor(Math.random() * (maxW - minW + 1));
      var w = [];
      for (var i = 0; i < n; i++) w.push(pick());
      var s = w.join(' ');
      // occasional comma for rhythm
      if (n > 8 && Math.random() < 0.6) {
        var at = 3 + Math.floor(Math.random() * (n - 6));
        var parts = s.split(' ');
        parts[at] = parts[at] + ',';
        s = parts.join(' ');
      }
      return s.charAt(0).toUpperCase() + s.slice(1) + '.';
    }
    function paragraph(range) {
      var n = range[0] + Math.floor(Math.random() * (range[1] - range[0] + 1));
      var out = [];
      for (var i = 0; i < n; i++) out.push(sentence(6, 16));
      return out.join(' ');
    }

    function gen() {
      var n = Math.round(MT.num('#count', 3));
      if (!isFinite(n) || n < 1) { MT.msg('#msg', 'Enter how much text you need — at least 1.', 'warn'); return; }
      if (n > 200) { MT.msg('#msg', 'The maximum is 200. Generating 200 instead.', 'warn'); n = 200; MT.$('#count').value = 200; }
      else MT.clearMsg('#msg');

      var unit = MT.$('#unit').value;
      var ranges = { short: [2, 3], medium: [4, 6], long: [7, 10] };
      var range = ranges[MT.$('#len').value];
      var useHtml = MT.$('#html').checked;
      var out = [];

      if (unit === 'para') {
        for (var i = 0; i < n; i++) out.push(paragraph(range));
      } else if (unit === 'sent') {
        for (var j = 0; j < n; j++) out.push(sentence(6, 16));
        out = [out.join(' ')];
      } else if (unit === 'list') {
        for (var k = 0; k < n; k++) out.push(sentence(4, 9).replace(/\.$/, ''));
      } else {
        var w = [];
        for (var m = 0; m < n; m++) w.push(pick());
        var text = w.join(' ');
        out = [text.charAt(0).toUpperCase() + text.slice(1) + '.'];
      }

      if (MT.$('#classic').checked && out.length) {
        var lead = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ';
        if (unit === 'word') {
          var target = n;
          var base = ('lorem ipsum dolor sit amet consectetur adipiscing elit ' + out[0].toLowerCase()).split(/\s+/).slice(0, target).join(' ');
          out[0] = base.charAt(0).toUpperCase() + base.slice(1) + '.';
        } else if (unit === 'list') {
          out[0] = 'Lorem ipsum dolor sit amet';
        } else {
          out[0] = lead + out[0];
        }
      }

      var text;
      if (useHtml) {
        if (unit === 'list') text = '<ul>\n' + out.map(function (l) { return '  <li>' + l + '</li>'; }).join('\n') + '\n</ul>';
        else text = out.map(function (p) { return '<p>' + p + '</p>'; }).join('\n');
      } else {
        text = unit === 'list' ? out.map(function (l) { return '• ' + l; }).join('\n') : out.join('\n\n');
      }

      MT.$('#out').textContent = text;
      var wc = text.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).length;
      MT.msg('#msg', MT.fmtNum(wc) + ' words generated.', 'ok');
      MT.done({ unit: unit, count: n });
    }
    MT.on('#go', 'click', MT.guard(gen));
    MT.$$('#unit, #len, #classic, #html').forEach(function (el) {
      el.addEventListener('change', function () { if (MT.$('#out').textContent) gen(); });
    });
    MT.on('#copy', 'click', function (e) { MT.copy(MT.$('#out').textContent, e.currentTarget); });
    MT.on('#clear', 'click', function () { MT.$('#out').textContent = ''; MT.clearMsg('#msg'); });
    gen();
  },
  howto: [
    'Choose how much text you need and whether to count in paragraphs, sentences, words or list items.',
    'Switch on HTML tags if you are pasting straight into markup.',
    'Press <b>Generate</b> — each press produces a different arrangement — then copy the result.'
  ],
  sections: [
    { h: 'Where lorem ipsum comes from',
      p: `<p>The text is scrambled Latin, derived from Cicero's <i>De finibus bonorum et malorum</i>, written in 45 BC. The familiar opening "Lorem ipsum dolor sit amet" is a fragment of "dolorem ipsum quia dolor sit amet" — a passage about pain being undesirable, cut mid-word.</p>
<p>Typesetters have used it since at least the 1500s, and it spread widely in the 1980s when Letraset and then desktop publishing software shipped it as sample text. Its value is that it is unreadable: nobody starts editing the copy instead of judging the layout.</p>` },
    { h: 'Why it looks right when English does not',
      p: `<p>Lorem ipsum has a word-length distribution and letter frequency close to English and other Latin-script languages. That means it produces realistic line breaks, ragged edges and text density — the things a layout is actually being tested for.</p>
<p>Repeating "text text text" or pasting the same paragraph over and over produces unnaturally even blocks that hide typographic problems. So does typing real content too early, which invites feedback on the words rather than the design.</p>` },
    { h: 'When not to use placeholder text',
      p: `<p>Two cautions. First, never ship it — lorem ipsum reaching production is common enough that searching for it turns up live pages on major sites. Add a check to your build or review process.</p>
<p>Second, it hides content problems. A design that looks balanced with even Latin paragraphs can fall apart with a real seven-word headline or a product name three times longer than expected. For any layout where content length varies, test with realistic extremes as well as placeholder text.</p>` }
  ],
  faq: [
    { q: 'Is lorem ipsum copyrighted?', a: 'No. The underlying text is from a work about two thousand years old, long in the public domain, and the scrambled version has no meaningful authorship. Use it freely.' },
    { q: 'Does using it hurt SEO?', a: 'Only if it reaches a live page. Placeholder text on a published page tells search engines and visitors the page is unfinished. It is harmless during development.' },
    { q: 'Why is the output different each time?', a: 'Words are selected randomly from a Latin vocabulary, so every press produces a fresh arrangement. Press again if a particular block does not suit your layout.' },
    { q: 'Can I generate an exact word count?', a: 'Yes — choose "Words" as the unit and enter the number. Paragraph and sentence modes vary their length deliberately, which is what makes the result look natural.' }
  ]
},

/* ------------------------------------------------------------------ */
{
  slug: 'diff-checker',
  name: 'Diff Checker',
  icon: '±',
  category: 'text',
  desc: 'Compare two blocks of text and highlight what changed.',
  seoTitle: 'Diff Checker — Compare Two Texts Online Free',
  metaDescription: 'Compare two blocks of text and see added, removed and unchanged lines highlighted side by side. Runs entirely in your browser.',
  keywords: ['diff checker', 'compare text', 'text difference', 'file compare online', 'diff tool'],
  popularity: 78,
  related: ['remove-duplicate-lines', 'text-sorter', 'word-counter', 'json-formatter', 'case-converter'],
  intro: 'Paste two versions and see exactly which lines were added, removed or left alone — the same line-based comparison a version control system uses.',
  html: `
<div class="row">
  <div class="field"><label for="a">Original</label><textarea id="a" spellcheck="false" placeholder="The quick brown fox&#10;jumps over&#10;the lazy dog"></textarea></div>
  <div class="field"><label for="b">Changed</label><textarea id="b" spellcheck="false" placeholder="The quick brown fox&#10;leaps over&#10;the lazy dog&#10;every morning"></textarea></div>
</div>
<div class="row tight" style="gap:16px;flex-wrap:wrap">
  <div class="checkline" style="margin:0"><input type="checkbox" id="trim" checked><label for="trim">Ignore leading and trailing whitespace</label></div>
  <div class="checkline" style="margin:0"><input type="checkbox" id="ci"><label for="ci">Ignore case</label></div>
</div>
<div class="actions">
  <button class="btn btn-primary" id="go">Compare</button>
  <button class="btn" id="swap">Swap sides</button>
  <button class="btn btn-ghost" id="clear">Clear</button>
</div>
<div class="msg" id="msg"></div>
<div class="stat-grid" id="stats" hidden style="margin-top:14px">
  <div class="stat"><div class="sv" id="s-add" style="color:var(--ok)">0</div><div class="sl">Added</div></div>
  <div class="stat"><div class="sv" id="s-del" style="color:var(--danger)">0</div><div class="sl">Removed</div></div>
  <div class="stat"><div class="sv" id="s-same">0</div><div class="sl">Unchanged</div></div>
</div>
<div class="field" style="margin-top:16px">
  <span class="lbl">Differences</span>
  <div class="out" id="out" data-empty="Press Compare to see the differences." style="white-space:pre-wrap"></div>
</div>`,
  init: function () {
    function norm(l) {
      var s = l;
      if (MT.$('#trim').checked) s = s.trim();
      if (MT.$('#ci').checked) s = s.toLowerCase();
      return s;
    }

    // Longest common subsequence over lines, then walk back to build the diff.
    function diff(a, b) {
      var n = a.length, m = b.length;
      if (n * m > 4000000) return null;
      var dp = [];
      for (var i = 0; i <= n; i++) dp.push(new Uint32Array(m + 1));
      for (i = n - 1; i >= 0; i--) {
        for (var j = m - 1; j >= 0; j--) {
          dp[i][j] = norm(a[i]) === norm(b[j]) ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
        }
      }
      var out = [];
      i = 0; j = 0;
      while (i < n && j < m) {
        if (norm(a[i]) === norm(b[j])) { out.push({ t: ' ', v: a[i] }); i++; j++; }
        else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push({ t: '-', v: a[i] }); i++; }
        else { out.push({ t: '+', v: b[j] }); j++; }
      }
      while (i < n) { out.push({ t: '-', v: a[i++] }); }
      while (j < m) { out.push({ t: '+', v: b[j++] }); }
      return out;
    }

    function run() {
      var av = MT.$('#a').value, bv = MT.$('#b').value;
      MT.$('#stats').hidden = true;
      if (!av.trim() && !bv.trim()) { MT.msg('#msg', 'Paste text into both boxes to compare them.', 'warn'); return; }
      var a = av.split('\n'), b = bv.split('\n');
      if (a.length > 2000 || b.length > 2000) {
        MT.msg('#msg', 'Each side is limited to 2,000 lines so the comparison stays fast. Compare a smaller section.', 'err');
        return;
      }
      var d = diff(a, b);
      if (!d) { MT.msg('#msg', 'That comparison is too large to run in the browser. Try smaller sections.', 'err'); return; }

      var add = 0, del = 0, same = 0;
      var html = d.map(function (row) {
        var esc = MT.escapeHtml(row.v === '' ? ' ' : row.v);
        if (row.t === '+') { add++; return '<div style="background:var(--ok-wash);color:var(--ok);padding:1px 5px;border-radius:3px">+ ' + esc + '</div>'; }
        if (row.t === '-') { del++; return '<div style="background:var(--danger-wash);color:var(--danger);padding:1px 5px;border-radius:3px">− ' + esc + '</div>'; }
        same++;
        return '<div style="padding:1px 5px;color:var(--muted)">&nbsp;&nbsp;' + esc + '</div>';
      }).join('');

      MT.$('#out').innerHTML = html;
      MT.$('#s-add').textContent = MT.fmtNum(add);
      MT.$('#s-del').textContent = MT.fmtNum(del);
      MT.$('#s-same').textContent = MT.fmtNum(same);
      MT.$('#stats').hidden = false;
      MT.msg('#msg', (add || del)
        ? MT.fmtNum(add) + ' added, ' + MT.fmtNum(del) + ' removed.'
        : 'The two texts are identical under the current options.', (add || del) ? 'ok' : 'info');
      MT.done({ added: add, removed: del });
    }
    MT.on('#go', 'click', MT.guard(run));
    MT.on('#swap', 'click', function () {
      var t = MT.$('#a').value; MT.$('#a').value = MT.$('#b').value; MT.$('#b').value = t;
      if (!MT.$('#stats').hidden) run();
    });
    MT.$$('#trim, #ci').forEach(function (el) {
      el.addEventListener('change', function () { if (!MT.$('#stats').hidden) run(); });
    });
    MT.on('#clear', 'click', function () {
      MT.$('#a').value = ''; MT.$('#b').value = ''; MT.$('#out').innerHTML = '';
      MT.$('#stats').hidden = true; MT.clearMsg('#msg'); MT.$('#a').focus();
    });
  },
  howto: [
    'Paste the original version on the left and the changed version on the right.',
    'Press <b>Compare</b>. Green lines were added, red lines removed, grey lines unchanged.',
    'Toggle the whitespace and case options to filter out differences you do not care about.'
  ],
  sections: [
    { h: 'How the comparison works',
      p: `<p>This is a line-based diff built on the longest common subsequence — the same foundation used by <code>diff</code>, Git and most code review tools. The algorithm finds the largest set of lines that appear in both versions in the same order, then marks everything else as added or removed.</p>
<p>That framing explains a behaviour people sometimes find surprising: a line with one word changed shows as one removal plus one addition, not as a modification. At the line level, a changed line genuinely is an old line gone and a new line arrived.</p>
<p>The comparison is quadratic in the number of lines, so each side is capped at 2,000 lines to keep the browser responsive.</p>` },
    { h: 'Using the ignore options well',
      p: `<p><b>Ignore whitespace</b> is on by default and hides differences in indentation and trailing spaces. This is what you want when comparing code that has been reformatted, or text pasted from two different sources. Switch it off when whitespace is meaningful — in Python, YAML, Markdown, or anywhere alignment matters.</p>
<p><b>Ignore case</b> is off by default, since case usually matters. Turn it on when comparing lists of names, email addresses or identifiers that were normalised differently by two systems.</p>` }
  ],
  faq: [
    { q: 'Can it show word-level changes within a line?', a: 'Not currently. Comparison is line by line, so an edited line appears as a removal and an addition. For prose where sentences shift slightly, that still makes the change easy to spot.' },
    { q: 'Are my two texts uploaded?', a: 'No. The comparison runs in your browser, so you can safely diff contracts, credentials, medical notes or unreleased code.' },
    { q: 'Why do identical-looking lines show as different?', a: 'Usually trailing whitespace, a non-breaking space pasted from a web page, or Windows versus Unix line endings. Switching on "Ignore leading and trailing whitespace" resolves most cases.' },
    { q: 'Can I compare two files?', a: 'Open each file in a text editor and paste the contents. Keeping the tool paste-only means nothing ever leaves your device.' }
  ]
}

];
