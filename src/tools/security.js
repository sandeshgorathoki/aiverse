// MEGA TOOLS — Security & Generators
export default [

/* ------------------------------------------------------------------ */
{
  slug: 'password-generator',
  name: 'Password Generator',
  icon: '🔑',
  category: 'security',
  desc: 'Generate strong random passwords or passphrases.',
  seoTitle: 'Password Generator — Strong Random Passwords',
  metaDescription: 'Generate strong random passwords and passphrases in your browser. Uses cryptographic randomness, shows entropy in bits, and never transmits anything.',
  keywords: ['password generator', 'strong password generator', 'random password', 'passphrase generator', 'secure password'],
  popularity: 94, featured: true,
  related: ['hash-generator', 'uuid-generator', 'random-number-generator', 'base64-encoder', 'character-counter'],
  intro: 'Passwords built from your browser\'s cryptographic random source, with the entropy shown in bits so you can judge the strength rather than trust a coloured bar.',
  html: `
<div class="notice privacy"><strong>Generated locally.</strong> Passwords are created in your browser with <code>crypto.getRandomValues</code>. Nothing is sent over the network, logged or stored anywhere.</div>
<div class="field">
  <span class="lbl" id="t-lbl">Type</span>
  <div class="seg" role="group" aria-labelledby="t-lbl">
    <button type="button" data-t="chars" aria-pressed="true">Random characters</button>
    <button type="button" data-t="words" aria-pressed="false">Passphrase</button>
  </div>
</div>

<div data-panel="chars">
  <div class="field">
    <label for="len">Length: <span id="lenv">20</span> characters</label>
    <input type="range" id="len" min="6" max="64" value="20">
  </div>
  <div class="row tight" style="gap:16px;flex-wrap:wrap">
    <div class="checkline" style="margin:0"><input type="checkbox" id="lower" checked><label for="lower">a–z</label></div>
    <div class="checkline" style="margin:0"><input type="checkbox" id="upper" checked><label for="upper">A–Z</label></div>
    <div class="checkline" style="margin:0"><input type="checkbox" id="digits" checked><label for="digits">0–9</label></div>
    <div class="checkline" style="margin:0"><input type="checkbox" id="symbols" checked><label for="symbols">Symbols</label></div>
    <div class="checkline" style="margin:0"><input type="checkbox" id="ambig"><label for="ambig">Exclude look-alikes (0 O l 1 I)</label></div>
  </div>
</div>

<div data-panel="words" hidden>
  <div class="row">
    <div class="field"><label for="words">Words</label><input type="number" id="words" value="5" min="3" max="12" step="1"></div>
    <div class="field"><label for="sep">Separator</label>
      <select id="sep"><option value="-">Hyphen</option><option value=".">Full stop</option><option value=" ">Space</option><option value="_">Underscore</option></select>
    </div>
  </div>
  <div class="row tight" style="gap:16px;flex-wrap:wrap">
    <div class="checkline" style="margin:0"><input type="checkbox" id="wcap"><label for="wcap">Capitalise each word</label></div>
    <div class="checkline" style="margin:0"><input type="checkbox" id="wnum" checked><label for="wnum">Append a number</label></div>
  </div>
</div>

<div class="field" style="margin-top:14px"><label for="count">How many to generate</label><input type="number" id="count" value="1" min="1" max="50" step="1"></div>
<div class="actions">
  <button class="btn btn-primary" id="go">Generate</button>
  <button class="btn" id="copy">Copy</button>
  <button class="btn btn-ghost" id="clear">Clear</button>
</div>
<div class="msg" id="msg"></div>
<div class="field" style="margin-top:16px">
  <label for="out">Generated</label>
  <pre class="out" id="out" data-empty="Press Generate." style="font-size:1rem;letter-spacing:.02em" tabindex="0"></pre>
</div>
<div class="stat-grid" id="stats" hidden style="margin-top:14px">
  <div class="stat"><div class="sv" id="s-bits">—</div><div class="sl">Entropy</div></div>
  <div class="stat"><div class="sv" id="s-pool">—</div><div class="sl">Character pool</div></div>
  <div class="stat"><div class="sv" id="s-crack">—</div><div class="sl">Offline attack estimate</div></div>
</div>`,
  init: function () {
    var WORDS = ('able acid actor agent album alert alien alloy amber anchor angle apple arrow atlas audio autumn bacon badge baker balance banjo barrel basin beacon beetle bench berry binder birch bishop bison blade blanket blossom bottle boulder branch brass bridge bronze brush bucket buffer bundle burden cabin cable cactus camera candle canvas canyon carbon cargo carpet castle cattle cedar cellar cement census chalk chamber charcoal cherry chimney cinder circus citrus clamp clever clover cobalt collar comet compass copper coral cotton cougar county cradle crane crater crayon cricket crimson crystal cushion cyclone dagger dancer dapper dazzle debris decade denim desert diamond digital dinner dolphin domain donkey dragon drawer driver dynamo eagle ember empire engine ethics fabric falcon fantasy farmer feather fennel ferry fiber fiddle figure filter finger flame flannel flavor flint florist flower forest fossil foster fountain fragment frost galaxy gallery garden garlic gather gazelle gecko gentle geyser ginger glacier glider glimpse granite gravel grocer guitar gutter gymnast hammer harbor harvest hazel heather helmet herald hermit hollow honey hornet hostel hunter hybrid indigo ingot insect island ivory jacket jaguar jasmine jersey jigsaw jockey jungle juniper kernel kettle kitten knight ladder lagoon lantern lattice lawyer leather ledger legend lemon lentil lever lichen lilac linen lizard lobby locker locust lotus lumber lunar magnet mahogany mammoth manor maple marble marine market marrow mason meadow melody mentor mercury meteor mimic mineral mirror mitten modem module monsoon morning mortar mosaic motive mulberry museum mustard nectar needle nickel noble nomad notion nozzle nutmeg oatmeal object ocean octave onion opal orbit orchard orchid organ osprey otter outlet oxygen oyster pacific paddle palace pantry papaya parcel parlor parrot pasture patio pebble pelican pencil pepper petal pewter phantom phoenix picnic pigeon pillar pilot pioneer pistol piston pixel plank plasma plateau plaza pledge plover plumage pocket pollen poplar poppy porcelain portal potter powder prairie prism prism profile prompt puddle pumpkin puzzle pyramid quarry quartz quiver rabbit radar radish rafter rally ranger rapid raven ravine reason rebel record reef refuge relic remedy ribbon ridge rifle ripple river roster rubber rudder ruler runner rustic saddle salmon sample sandal sapphire satin savory scale scarf scholar scooter scout sculpt seagull season sector sedan sequin serpent shadow shale shelf sheriff shingle shovel shrimp shuttle signal silver siren sketch slate sleigh slipper smoke socket solar soldier sonnet spark sparrow spatula speaker spider spiral spleen spoken sponge spruce squash stable stadium stagger stamp starling statue steam stencil stereo stitch stone stork stove strand stream stucco studio subway suede sugar summit sunset surfer swallow swamp sweater swivel symbol syntax syrup tablet tackle tailor talent tandem tangle tapestry tavern teapot temple tenant tender tennis terrace thicket thimble thistle thorn thread thunder ticket timber tinder tissue toaster tobacco toffee token tomato topaz torch tortoise totem toucan towel tower trace tractor trader trailer transit trapeze travel treaty trellis tribute trigger trolley trophy trout trumpet tulip tundra tunnel turbine turkey turnip turtle tusk twilight umbrella unicorn uniform union upland urban vacuum valley vanilla vapor vault velvet vendor venture verbal vessel veteran vicar victor viking village vinegar violet viper vision vista vocal voyage waffle wagon walnut walrus warden warmth washer wasp weasel weaver wedge welcome whale wharf wheat whisker whisper willow window winter wisdom wizard wolf wonder wooden worker wrench yarrow yellow yonder zebra zenith zephyr zigzag zinc zodiac').split(' ');

    var type = 'chars';
    MT.$$('[data-t]').forEach(function (b) {
      b.addEventListener('click', function () {
        MT.$$('[data-t]').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        type = b.dataset.t;
        MT.$$('[data-panel]').forEach(function (p) { p.hidden = p.dataset.panel !== type; });
        gen();
      });
    });
    MT.on('#len', 'input', function (e) { MT.$('#lenv').textContent = e.target.value; gen(); });

    function randInt(max) {
      // Rejection sampling — modulo alone would bias the distribution.
      var limit = Math.floor(4294967296 / max) * max;
      var a = new Uint32Array(1);
      do { crypto.getRandomValues(a); } while (a[0] >= limit);
      return a[0] % max;
    }
    function pick(arr) { return arr[randInt(arr.length)]; }

    function buildPool() {
      var pool = '';
      var lower = 'abcdefghijklmnopqrstuvwxyz', upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      var digits = '0123456789', symbols = '!@#$%^&*()-_=+[]{};:,.?/';
      if (MT.$('#ambig').checked) {
        lower = lower.replace(/[l]/g, ''); upper = upper.replace(/[OI]/g, '');
        digits = digits.replace(/[01]/g, '');
      }
      if (MT.$('#lower').checked) pool += lower;
      if (MT.$('#upper').checked) pool += upper;
      if (MT.$('#digits').checked) pool += digits;
      if (MT.$('#symbols').checked) pool += symbols;
      return pool;
    }

    function crackTime(bits) {
      // 1e11 guesses/sec — a realistic figure for a well-funded offline attack
      // against a fast hash. A slow KDF like Argon2 is many orders slower.
      var seconds = Math.pow(2, bits - 1) / 1e11;
      var units = [[31557600000, 'billion years'], [31557600, 'million years'], [31557.6, 'thousand years'], [31.5576, 'years'], [0.0864, 'days'], [0.0036, 'hours'], [0.00006, 'minutes']];
      var y = seconds / 31557600;
      if (y > 1e9) return '> 1 billion years';
      if (y > 1e6) return (y / 1e6).toPrecision(2) + ' million years';
      if (y > 1000) return (y / 1000).toPrecision(2) + ' thousand years';
      if (y > 1) return y.toPrecision(2) + ' years';
      if (seconds > 86400) return (seconds / 86400).toPrecision(2) + ' days';
      if (seconds > 3600) return (seconds / 3600).toPrecision(2) + ' hours';
      if (seconds > 60) return (seconds / 60).toPrecision(2) + ' minutes';
      return 'under a minute';
    }

    function gen() {
      var n = Math.min(50, Math.max(1, Math.round(MT.num('#count', 1))));
      var list = [], bits = 0, poolDesc = '';

      if (type === 'chars') {
        var pool = buildPool();
        if (!pool) { MT.msg('#msg', 'Select at least one character set.', 'err'); MT.$('#out').textContent = ''; MT.$('#stats').hidden = true; return; }
        var len = parseInt(MT.$('#len').value, 10);
        for (var i = 0; i < n; i++) {
          var pw = '';
          for (var j = 0; j < len; j++) pw += pool[randInt(pool.length)];
          list.push(pw);
        }
        bits = Math.log2(pool.length) * len;
        poolDesc = pool.length + ' characters';
      } else {
        var count = Math.min(12, Math.max(3, Math.round(MT.num('#words', 5))));
        var sep = MT.$('#sep').value;
        for (var k = 0; k < n; k++) {
          var w = [];
          for (var m = 0; m < count; m++) {
            var word = pick(WORDS);
            if (MT.$('#wcap').checked) word = word.charAt(0).toUpperCase() + word.slice(1);
            w.push(word);
          }
          var phrase = w.join(sep);
          if (MT.$('#wnum').checked) phrase += sep + randInt(100);
          list.push(phrase);
        }
        bits = Math.log2(WORDS.length) * count + (MT.$('#wnum').checked ? Math.log2(100) : 0);
        poolDesc = MT.fmtNum(WORDS.length) + ' words';
      }

      MT.$('#out').textContent = list.join('\n');
      MT.$('#s-bits').textContent = Math.round(bits) + ' bits';
      MT.$('#s-pool').textContent = poolDesc;
      MT.$('#s-crack').textContent = crackTime(bits);
      MT.$('#stats').hidden = false;
      MT.msg('#msg', bits < 60
        ? 'Under 60 bits of entropy. Fine for a low-value account, but increase the length for anything that matters.'
        : bits < 80 ? 'Around ' + Math.round(bits) + ' bits — solid for most accounts.'
        : 'Around ' + Math.round(bits) + ' bits — strong against any realistic offline attack.',
        bits < 60 ? 'warn' : 'ok');
      MT.done({ type: type, bits: Math.round(bits) });
    }

    MT.on('#go', 'click', MT.guard(gen));
    MT.$$('#lower, #upper, #digits, #symbols, #ambig, #words, #sep, #wcap, #wnum, #count').forEach(function (el) {
      el.addEventListener('change', gen);
    });
    MT.on('#copy', 'click', function (e) { MT.copy(MT.$('#out').textContent, e.currentTarget); });
    MT.on('#clear', 'click', function () {
      MT.$('#out').textContent = ''; MT.$('#stats').hidden = true; MT.clearMsg('#msg');
    });
    gen();
  },
  howto: [
    'Choose random characters for maximum strength per character, or a passphrase for something you can actually type.',
    'Set the length. For anything important, aim for at least 16 characters or 5 words.',
    'Press <b>Generate</b>, copy the result, and store it in a password manager rather than a note.'
  ],
  sections: [
    { h: 'Entropy is the only meaningful measure',
      p: `<p>Password strength is measured in bits of entropy — the base-2 logarithm of how many equally likely passwords the generator could have produced. Each additional bit doubles the work an attacker faces.</p>
<table>
<tr><th>Bits</th><th>Verdict</th></tr>
<tr><td>Under 45</td><td>Weak. Crackable by a determined attacker.</td></tr>
<tr><td>60–70</td><td>Adequate for ordinary accounts.</td></tr>
<tr><td>80+</td><td>Strong against any realistic offline attack.</td></tr>
<tr><td>128</td><td>Beyond brute force with any foreseeable technology.</td></tr>
</table>
<p>Entropy depends on the <em>process</em>, not the result. <code>Tr0ub4dor&3</code> looks random but came from a predictable substitution pattern. A password you invented has far less entropy than its length suggests, because human choices cluster.</p>` },
    { h: 'Passphrases and the maths behind them',
      p: `<p>A passphrase of five words drawn randomly from a list of a thousand has 1000⁵ possibilities — about 50 bits. Add a random number and it climbs further. That is comparable to a shorter random string, but vastly easier to type on a phone or read aloud.</p>
<p>The critical word is <em>randomly</em>. A phrase you chose yourself — a song lyric, a quotation, a sentence about your life — has almost no entropy, because attackers have compiled those. Only machine-generated word selection gives you the number above.</p>` },
    { h: 'Practical advice that matters more than length',
      p: `<ul>
<li><b>Never reuse a password.</b> Credential stuffing — trying leaked passwords on other sites — succeeds far more often than cracking does. A unique password per site limits any breach to one account.</li>
<li><b>Use a password manager.</b> It is the only realistic way to have unique strong passwords everywhere. Protect it with a long passphrase you have memorised.</li>
<li><b>Turn on two-factor authentication.</b> It defeats a stolen password entirely. An authenticator app or hardware key beats SMS, which is vulnerable to SIM swapping.</li>
<li><b>Stop rotating passwords on a schedule.</b> Modern guidance from NIST advises against forced periodic changes — they push people towards predictable variations. Change a password when there is reason to think it was exposed.</li>
</ul>` }
  ],
  faq: [
    { q: 'Is it safe to generate a password on a website?', a: 'It depends entirely on where generation happens. Here it runs in your browser via crypto.getRandomValues, with no network request — you can verify this by checking your browser\'s network tab, or by disconnecting and generating offline.' },
    { q: 'How long should a password be?', a: 'At least 16 random characters, or 5 random words, for anything that matters. For a password manager master password, go longer — it protects everything else.' },
    { q: 'Are symbols necessary?', a: 'They add roughly one bit per character over letters and digits alone. Length is the stronger lever: a longer alphanumeric password beats a short one full of symbols, and it will not be rejected by sites with restrictive rules.' },
    { q: 'What does the crack time estimate assume?', a: 'A hundred billion guesses per second — a well-resourced offline attack against a fast hash. Against a properly slow algorithm like Argon2 or bcrypt it would take far longer. It is a rough floor, not a guarantee.' },
    { q: 'Should I write the password down?', a: 'A password manager is better. But a note kept physically secure is genuinely better than reusing a weak password everywhere — the realistic threat to most people is remote, not someone searching their home.' }
  ]
},

/* ------------------------------------------------------------------ */
{
  slug: 'hash-generator',
  name: 'Hash Generator',
  icon: '#⃣',
  category: 'security',
  desc: 'Generate SHA-256, SHA-384 and SHA-512 hashes of text or files.',
  seoTitle: 'Hash Generator — SHA-256, SHA-384 and SHA-512 Online',
  metaDescription: 'Generate SHA-256, SHA-384 and SHA-512 hashes from text or files in your browser. Verify checksums and compare against an expected value.',
  keywords: ['hash generator', 'sha256 generator', 'sha512 hash', 'checksum calculator', 'file hash'],
  popularity: 79,
  related: ['password-generator', 'uuid-generator', 'base64-encoder', 'random-number-generator', 'json-formatter'],
  intro: 'Compute cryptographic hashes of text or a file, and compare them against an expected checksum to verify a download.',
  html: `
<div class="notice privacy"><strong>Computed locally.</strong> Hashing uses the Web Crypto API in your browser. Files are read from disk and never uploaded, so verifying a large download costs no bandwidth.</div>
<div class="field">
  <span class="lbl" id="s-lbl">Input</span>
  <div class="seg" role="group" aria-labelledby="s-lbl">
    <button type="button" data-s="text" aria-pressed="true">Text</button>
    <button type="button" data-s="file" aria-pressed="false">File</button>
  </div>
</div>
<div data-panel="text">
  <div class="field"><label for="in">Text to hash</label><textarea id="in" spellcheck="false" placeholder="hello world"></textarea></div>
</div>
<div data-panel="file" hidden>
  <div class="drop" id="zone">
    <div class="dz-icon" aria-hidden="true">📄</div>
    <div class="dz-main">Drop a file here, or click to choose</div>
    <div class="dz-sub">Any file type · up to 100 MB</div>
    <input type="file" id="file">
  </div>
  <p class="hint" id="fileinfo"></p>
</div>
<div class="field" style="margin-top:14px">
  <span class="lbl">Algorithms</span>
  <div class="row tight" style="gap:16px;flex-wrap:wrap">
    <div class="checkline" style="margin:0"><input type="checkbox" id="a256" checked><label for="a256">SHA-256</label></div>
    <div class="checkline" style="margin:0"><input type="checkbox" id="a384"><label for="a384">SHA-384</label></div>
    <div class="checkline" style="margin:0"><input type="checkbox" id="a512"><label for="a512">SHA-512</label></div>
    <div class="checkline" style="margin:0"><input type="checkbox" id="a1"><label for="a1">SHA-1 (legacy)</label></div>
  </div>
</div>
<div class="field"><label for="expect">Compare against an expected hash — optional</label><input type="text" id="expect" spellcheck="false" placeholder="Paste a published checksum to verify it" style="font-family:var(--mono)"></div>
<div class="actions">
  <button class="btn btn-primary" id="go">Generate hash</button>
  <button class="btn btn-ghost" id="clear">Clear</button>
</div>
<div class="progress" id="prog"><i></i></div>
<div class="msg" id="msg"></div>
<table class="kv" id="out" style="margin-top:16px"></table>`,
  init: function () {
    var mode = 'text', chosen = null;
    MT.$$('[data-s]').forEach(function (b) {
      b.addEventListener('click', function () {
        MT.$$('[data-s]').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        mode = b.dataset.s;
        MT.$$('[data-panel]').forEach(function (p) { p.hidden = p.dataset.panel !== mode; });
        MT.$('#out').innerHTML = '';
        MT.clearMsg('#msg');
      });
    });

    MT.dropzone({
      zone: '#zone', input: '#file', maxSize: 100 * 1024 * 1024,
      onError: function (m) { MT.msg('#msg', m, 'err'); },
      onFiles: function (files) {
        chosen = files[0];
        MT.$('#fileinfo').textContent = 'Selected: ' + chosen.name + ' (' + MT.fmtBytes(chosen.size) + ')';
        MT.clearMsg('#msg');
      }
    });

    function hex(buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) {
        return b.toString(16).padStart(2, '0');
      }).join('');
    }

    function algos() {
      var list = [];
      if (MT.$('#a256').checked) list.push('SHA-256');
      if (MT.$('#a384').checked) list.push('SHA-384');
      if (MT.$('#a512').checked) list.push('SHA-512');
      if (MT.$('#a1').checked) list.push('SHA-1');
      return list;
    }

    MT.on('#go', 'click', MT.guard(function () {
      var list = algos();
      if (!list.length) { MT.msg('#msg', 'Select at least one algorithm.', 'warn'); return; }
      if (!crypto.subtle) { MT.msg('#msg', 'Your browser does not expose the Web Crypto API here. It requires a secure (https) connection.', 'err'); return; }

      var btn = MT.$('#go');
      var getData;
      if (mode === 'text') {
        var t = MT.$('#in').value;
        if (!t) { MT.msg('#msg', 'Enter some text to hash.', 'warn'); return; }
        getData = Promise.resolve(new TextEncoder().encode(t).buffer);
      } else {
        if (!chosen) { MT.msg('#msg', 'Choose a file first.', 'warn'); return; }
        MT.progress('#prog', 20);
        getData = MT.readAs(chosen, 'buffer');
      }

      MT.busy(btn, true, 'Hashing…');
      return getData.then(function (buf) {
        MT.progress('#prog', 60);
        return Promise.all(list.map(function (a) {
          return crypto.subtle.digest(a, buf).then(function (d) { return { a: a, h: hex(d) }; });
        }));
      }).then(function (results) {
        MT.busy(btn, false);
        MT.progress('#prog', null);
        var expect = MT.$('#expect').value.trim().toLowerCase().replace(/\s/g, '');
        var matched = null;
        MT.$('#out').innerHTML = results.map(function (r) {
          var isMatch = expect && expect === r.h;
          if (isMatch) matched = r.a;
          return '<tr><td style="vertical-align:top">' + r.a + '</td>' +
            '<td style="text-align:left;font-family:var(--mono);font-size:.78rem;word-break:break-all;font-weight:400' +
            (isMatch ? ';color:var(--ok)' : '') + '">' + r.h +
            ' <button class="btn btn-sm btn-ghost" data-cp="' + r.h + '">Copy</button></td></tr>';
        }).join('');
        MT.$$('[data-cp]').forEach(function (b) {
          b.addEventListener('click', function () { MT.copy(b.dataset.cp, b); });
        });
        if (expect) {
          MT.msg('#msg', matched
            ? 'Match confirmed — the ' + matched + ' hash is identical to the value you provided.'
            : 'No match. None of the generated hashes equal the expected value, so the data differs from the original.', matched ? 'ok' : 'err');
        } else {
          MT.msg('#msg', MT.plural(results.length, 'hash', 'hashes') + ' generated.', 'ok');
        }
        MT.done({ algos: list.length, verified: !!matched });
      }).catch(function (e) { MT.busy(btn, false); MT.progress('#prog', null); throw e; });
    }));

    MT.on('#clear', 'click', function () {
      MT.$('#in').value = ''; MT.$('#expect').value = '';
      MT.$('#out').innerHTML = ''; chosen = null;
      MT.$('#fileinfo').textContent = ''; MT.clearMsg('#msg');
    });
  },
  howto: [
    'Choose Text or File, then enter your text or pick a file.',
    'Tick the algorithms you need — SHA-256 is the standard choice.',
    'To verify a download, paste the publisher\'s checksum into the compare box before generating.'
  ],
  sections: [
    { h: 'What a hash is for',
      p: `<p>A cryptographic hash turns any input into a fixed-length fingerprint. The same input always produces the same hash; changing a single bit produces a completely different one. Crucially, the process is one-way — you cannot recover the input from the hash.</p>
<p>That gives it two main uses. <b>Integrity checking</b>: hash a downloaded file and compare with the publisher's figure to confirm nothing was corrupted or tampered with in transit. <b>Deduplication and identity</b>: two files with the same SHA-256 are, for all practical purposes, the same file.</p>` },
    { h: 'Which algorithm to use',
      p: `<table>
<tr><th>Algorithm</th><th>Output</th><th>Status</th></tr>
<tr><td>SHA-256</td><td>64 hex characters</td><td>The default. Secure and universally supported.</td></tr>
<tr><td>SHA-384</td><td>96 characters</td><td>Secure. Used where a larger margin is specified.</td></tr>
<tr><td>SHA-512</td><td>128 characters</td><td>Secure, and often faster than SHA-256 on 64-bit hardware.</td></tr>
<tr><td>SHA-1</td><td>40 characters</td><td><b>Broken.</b> Practical collisions demonstrated in 2017. Offered only for reading legacy checksums.</td></tr>
</table>
<p>MD5 is absent deliberately. It has been comprehensively broken for years and should not be used even for non-security checksums, since a stronger option costs nothing.</p>` },
    { h: 'Hashing is not encryption — and not password storage',
      p: `<p>Encryption is reversible with a key; hashing is not reversible at all. If you need to get the data back, you need encryption.</p>
<p>Nor should a plain SHA hash be used to store passwords. Fast hashes are the problem: modern hardware computes billions of SHA-256 operations per second, so a leaked database of SHA-256 password hashes falls quickly to a dictionary attack. Password storage requires a deliberately slow, salted algorithm — Argon2, scrypt or bcrypt — which makes each guess expensive.</p>` }
  ],
  faq: [
    { q: 'Can a hash be reversed?', a: 'No. But a short or common input can be found by guessing — attackers compute hashes of billions of likely values and look for a match. That is why unique salts matter for password storage.' },
    { q: 'How do I verify a downloaded file?', a: 'Switch to File mode, choose the download, paste the checksum published on the official site into the compare box, and generate. A match confirms the file is byte-identical.' },
    { q: 'Is my file uploaded to check it?', a: 'No. The file is read locally and hashed with the Web Crypto API. Nothing crosses the network, which is why hashing a 100 MB file costs no bandwidth.' },
    { q: 'Why is MD5 not offered?', a: 'It is cryptographically broken — collisions can be produced in seconds. Since SHA-256 is available everywhere and just as easy, there is no reason to offer a weaker option.' },
    { q: 'Do the same bytes always give the same hash?', a: 'Yes, on any machine and in any implementation. That determinism is what makes checksums useful for verification.' }
  ]
},

/* ------------------------------------------------------------------ */
{
  slug: 'random-number-generator',
  name: 'Random Number Generator',
  icon: '🎲',
  category: 'security',
  desc: 'Generate random numbers in a range, with or without repeats.',
  seoTitle: 'Random Number Generator — Free Online RNG',
  metaDescription: 'Generate random numbers within any range. Choose how many, allow or prevent duplicates, and use cryptographic randomness for draws and lotteries.',
  keywords: ['random number generator', 'random picker', 'number randomizer', 'lottery number generator', 'dice roller'],
  popularity: 76,
  related: ['password-generator', 'uuid-generator', 'hash-generator', 'text-sorter', 'percentage-calculator'],
  intro: 'Pick numbers from a range using cryptographic randomness. Turn off duplicates for draws, raffles and lottery-style selections.',
  html: `
<div class="row">
  <div class="field"><label for="min">Minimum</label><input type="number" id="min" value="1" step="1"></div>
  <div class="field"><label for="max">Maximum</label><input type="number" id="max" value="100" step="1"></div>
  <div class="field"><label for="count">How many</label><input type="number" id="count" value="1" min="1" max="1000" step="1"></div>
</div>
<div class="row tight" style="gap:16px;flex-wrap:wrap">
  <div class="checkline" style="margin:0"><input type="checkbox" id="unique"><label for="unique">No duplicates</label></div>
  <div class="checkline" style="margin:0"><input type="checkbox" id="sorted"><label for="sorted">Sort the results</label></div>
</div>
<div class="field" style="margin-top:14px">
  <span class="lbl">Presets</span>
  <div class="chips">
    <button class="chip" data-p="1,6,1">Roll a die</button>
    <button class="chip" data-p="1,6,2">Two dice</button>
    <button class="chip" data-p="1,2,1">Coin flip</button>
    <button class="chip" data-p="1,49,6">Lottery 6 of 49</button>
    <button class="chip" data-p="1,100,1">1 to 100</button>
  </div>
</div>
<div class="actions">
  <button class="btn btn-primary" id="go">Generate</button>
  <button class="btn" id="copy">Copy</button>
</div>
<div class="msg" id="msg"></div>
<div class="result-hero" id="hero" style="margin-top:16px"><div class="rv" id="r-main" style="word-break:break-word">—</div><div class="rl" id="r-lab">press generate</div></div>
<div class="field" style="margin-top:14px" id="list-wrap" hidden>
  <label for="out">All values</label>
  <pre class="out" id="out" tabindex="0"></pre>
</div>`,
  init: function () {
    function randInt(min, max) {
      var range = max - min + 1;
      var limit = Math.floor(4294967296 / range) * range;
      var a = new Uint32Array(1);
      do { crypto.getRandomValues(a); } while (a[0] >= limit);
      return min + (a[0] % range);
    }

    MT.$$('[data-p]').forEach(function (c) {
      c.addEventListener('click', function () {
        var p = c.dataset.p.split(',');
        MT.$('#min').value = p[0]; MT.$('#max').value = p[1]; MT.$('#count').value = p[2];
        if (parseInt(p[2], 10) > 1 && c.textContent.indexOf('Lottery') !== -1) {
          MT.$('#unique').checked = true; MT.$('#sorted').checked = true;
        }
        gen();
      });
    });

    function gen() {
      var min = Math.round(MT.num('#min', NaN)), max = Math.round(MT.num('#max', NaN));
      var count = Math.round(MT.num('#count', 1));
      if (!isFinite(min) || !isFinite(max)) { MT.msg('#msg', 'Enter a minimum and a maximum.', 'warn'); return; }
      if (min > max) { MT.msg('#msg', 'The minimum is larger than the maximum. Swap them.', 'err'); return; }
      if (!isFinite(count) || count < 1) { MT.msg('#msg', 'Enter how many numbers you need.', 'warn'); return; }
      if (count > 1000) { MT.msg('#msg', 'The maximum per batch is 1,000.', 'err'); return; }
      var range = max - min + 1;
      if (MT.$('#unique').checked && count > range) {
        MT.msg('#msg', 'You asked for ' + count + ' unique numbers but the range only contains ' + MT.fmtNum(range) + '. Widen the range or allow duplicates.', 'err');
        return;
      }
      MT.clearMsg('#msg');

      var out = [];
      if (MT.$('#unique').checked) {
        if (range <= 100000) {
          // Partial Fisher–Yates over the full range: unbiased and fast.
          var pool = new Array(range);
          for (var i = 0; i < range; i++) pool[i] = min + i;
          for (var k = 0; k < count; k++) {
            var j = randInt(k, range - 1);
            var t = pool[k]; pool[k] = pool[j]; pool[j] = t;
            out.push(pool[k]);
          }
        } else {
          var seen = {};
          while (out.length < count) {
            var v = randInt(min, max);
            if (!seen[v]) { seen[v] = 1; out.push(v); }
          }
        }
      } else {
        for (var n = 0; n < count; n++) out.push(randInt(min, max));
      }
      if (MT.$('#sorted').checked) out.sort(function (a, b) { return a - b; });

      MT.$('#r-main').textContent = out.length <= 12 ? out.join('   ') : out.slice(0, 12).join('   ') + ' …';
      MT.$('#r-lab').textContent = count === 1
        ? 'between ' + MT.fmtNum(min) + ' and ' + MT.fmtNum(max)
        : MT.plural(count, 'number') + ' between ' + MT.fmtNum(min) + ' and ' + MT.fmtNum(max) + (MT.$('#unique').checked ? ', no duplicates' : '');
      if (out.length > 12) {
        MT.$('#out').textContent = out.join('\n');
        MT.$('#list-wrap').hidden = false;
      } else MT.$('#list-wrap').hidden = true;
      window.__last = out;
      MT.done({ count: count });
    }
    MT.on('#go', 'click', MT.guard(gen));
    MT.$$('#min, #max, #count, #unique, #sorted').forEach(function (el) {
      el.addEventListener('change', function () { if (window.__last) gen(); });
    });
    MT.on('#copy', 'click', function (e) {
      if (!window.__last) { MT.toast('Generate first'); return; }
      MT.copy(window.__last.join('\n'), e.currentTarget);
    });
    gen();
  },
  howto: [
    'Set the minimum and maximum, and how many numbers you want.',
    'Switch on "No duplicates" for a draw, raffle or lottery selection.',
    'Press <b>Generate</b>. Results of more than twelve numbers also appear as a copyable list.'
  ],
  sections: [
    { h: 'Where the randomness comes from',
      p: `<p>This tool uses <code>crypto.getRandomValues</code>, the browser's cryptographically secure generator, which draws from entropy collected by your operating system. That is a meaningful upgrade over <code>Math.random</code>, whose output is predictable if an attacker observes enough of it.</p>
<p>For a dice roll it makes no practical difference. For anything with a prize attached, or where someone might benefit from predicting the outcome, it matters.</p>` },
    { h: 'Avoiding modulo bias',
      p: `<p>The obvious way to get a number from 1 to 6 is <code>random % 6 + 1</code>. It is subtly wrong. If the underlying generator produces values 0 to 9, then 0–5 map to each result once but 6–9 wrap around to give 1–4 a second chance. Those outcomes become more likely.</p>
<p>The fix is rejection sampling: discard any raw value that falls in the uneven tail and draw again. This tool does that, so every number in your range is equally likely. Most quick implementations skip it, which is why homemade random pickers often show a measurable skew over thousands of draws.</p>` },
    { h: 'Unique selection done properly',
      p: `<p>Picking unique numbers by drawing repeatedly and discarding duplicates works badly when you want most of a range — selecting 45 unique numbers from 1 to 50 spends most of its time rejecting collisions.</p>
<p>Instead, this tool builds the full range and runs a partial Fisher–Yates shuffle, taking as many values as you asked for. Every possible combination is equally likely, and it runs in constant time per number regardless of how much of the range you want.</p>` }
  ],
  faq: [
    { q: 'Is this random enough for a prize draw?', a: 'The randomness is cryptographically sound and unbiased. Whether it satisfies a regulator is a separate question — formal draws often require an auditable, witnessed process rather than any particular algorithm.' },
    { q: 'Can I generate decimals?', a: 'Not currently — output is whole numbers. For two decimal places, generate in a range a hundred times larger and divide the result by 100.' },
    { q: 'Are the results the same for everyone?', a: 'No. Each visitor draws from their own device\'s entropy source. There is no shared seed and no server involved.' },
    { q: 'Can I get the same sequence again?', a: 'No. There is no seed to set, which is deliberate — a reproducible sequence would undermine the point of a secure generator. If you need reproducibility, use a seeded generator in code.' }
  ]
}

];
