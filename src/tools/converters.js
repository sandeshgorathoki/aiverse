// MEGA TOOLS — Converters
// Factor-based converters share one implementation: every unit is defined
// relative to a base unit, so conversion is (value × factorFrom) ÷ factorTo.

function unitTool(cfg) {
  return {
    slug: cfg.slug,
    name: cfg.name,
    icon: cfg.icon,
    category: 'converters',
    desc: cfg.desc,
    seoTitle: cfg.seoTitle,
    metaDescription: cfg.metaDescription,
    keywords: cfg.keywords,
    popularity: cfg.popularity,
    featured: cfg.featured,
    related: cfg.related,
    intro: cfg.intro,
    html: `
<div class="row" style="align-items:flex-end">
  <div class="field"><label for="val">Value</label><input type="number" id="val" value="${cfg.defaultValue}" step="any"></div>
  <div class="field"><label for="from">From</label><select id="from">${cfg.options}</select></div>
  <div class="field" style="flex:0 0 auto"><span class="lbl">&nbsp;</span><button class="btn" id="swap" title="Swap units" aria-label="Swap units" style="width:100%">⇅ Swap</button></div>
  <div class="field"><label for="to">To</label><select id="to">${cfg.options}</select></div>
</div>
<div class="msg" id="msg"></div>
<div class="result-hero" style="margin-top:6px"><div class="rv" id="r-val">—</div><div class="rl" id="r-lab">—</div></div>
<pre class="out" id="r-work" style="margin-top:12px"></pre>
<h3>All units</h3>
<table class="kv" id="all"></table>`,
    initCfg: { units: cfg.units, base: cfg.base, from: cfg.from, to: cfg.to, precision: cfg.precision || 6, formula: cfg.formula || null },
    init: function () {
      var CFG = window.__TOOL_CFG;
      var units = CFG.units;
      MT.$('#from').value = CFG.from;
      MT.$('#to').value = CFG.to;

      function conv(v, from, to) {
        if (CFG.formula) return CFG.formula(v, from, to);
        return v * units[from].f / units[to].f;
      }
      function fmt(n) {
        if (!isFinite(n)) return '—';
        var a = Math.abs(n);
        if (a !== 0 && (a < 1e-4 || a >= 1e12)) return n.toExponential(6);
        var dp = a >= 1000 ? 2 : a >= 1 ? 4 : 6;
        return parseFloat(n.toFixed(dp)).toLocaleString(undefined, { maximumFractionDigits: dp });
      }

      function run() {
        var v = MT.num('#val', NaN);
        var from = MT.$('#from').value, to = MT.$('#to').value;
        if (!isFinite(v)) { MT.msg('#msg', 'Enter a number to convert.', 'warn'); return; }
        if (CFG.validate) {
          var err = CFG.validate(v, from);
          if (err) { MT.msg('#msg', err, 'err'); return; }
        }
        MT.clearMsg('#msg');
        var out = conv(v, from, to);
        MT.$('#r-val').textContent = fmt(out) + ' ' + units[to].s;
        MT.$('#r-lab').textContent = fmt(v) + ' ' + units[from].s + ' = ' + fmt(out) + ' ' + units[to].s;
        MT.$('#r-work').textContent = CFG.formula
          ? CFG.work(v, from, to)
          : v + ' ' + units[from].s + ' × ' + units[from].f + ' = ' + (v * units[from].f) + ' ' + units[CFG.base].s +
            '\n' + (v * units[from].f) + ' ÷ ' + units[to].f + ' = ' + out + ' ' + units[to].s;
        MT.$('#all').innerHTML = Object.keys(units).map(function (k) {
          var val = conv(v, from, k);
          return '<tr' + (k === to ? ' style="background:var(--accent-wash)"' : '') + '><td>' + units[k].n +
            '</td><td>' + fmt(val) + ' ' + units[k].s + '</td></tr>';
        }).join('');
        MT.done({ from: from, to: to });
      }
      MT.$$('#val, #from, #to').forEach(function (el) { el.addEventListener('input', run); el.addEventListener('change', run); });
      MT.on('#swap', 'click', function () {
        var f = MT.$('#from').value;
        MT.$('#from').value = MT.$('#to').value;
        MT.$('#to').value = f;
        run();
      });
      run();
    },
    howto: cfg.howto,
    sections: cfg.sections,
    faq: cfg.faq
  };
}

const LENGTH = {
  mm: { n: 'Millimetre', s: 'mm', f: 0.001 },
  cm: { n: 'Centimetre', s: 'cm', f: 0.01 },
  m:  { n: 'Metre', s: 'm', f: 1 },
  km: { n: 'Kilometre', s: 'km', f: 1000 },
  in: { n: 'Inch', s: 'in', f: 0.0254 },
  ft: { n: 'Foot', s: 'ft', f: 0.3048 },
  yd: { n: 'Yard', s: 'yd', f: 0.9144 },
  mi: { n: 'Mile', s: 'mi', f: 1609.344 },
  nmi: { n: 'Nautical mile', s: 'nmi', f: 1852 }
};
const WEIGHT = {
  mg: { n: 'Milligram', s: 'mg', f: 0.000001 },
  g:  { n: 'Gram', s: 'g', f: 0.001 },
  kg: { n: 'Kilogram', s: 'kg', f: 1 },
  t:  { n: 'Metric tonne', s: 't', f: 1000 },
  oz: { n: 'Ounce', s: 'oz', f: 0.028349523125 },
  lb: { n: 'Pound', s: 'lb', f: 0.45359237 },
  st: { n: 'Stone', s: 'st', f: 6.35029318 },
  ton_us: { n: 'US short ton', s: 'short ton', f: 907.18474 },
  ton_uk: { n: 'UK long ton', s: 'long ton', f: 1016.0469088 }
};
const SPEED = {
  ms:  { n: 'Metres per second', s: 'm/s', f: 1 },
  kmh: { n: 'Kilometres per hour', s: 'km/h', f: 0.2777777777777778 },
  mph: { n: 'Miles per hour', s: 'mph', f: 0.44704 },
  fts: { n: 'Feet per second', s: 'ft/s', f: 0.3048 },
  kn:  { n: 'Knot', s: 'kn', f: 0.5144444444444445 },
  mach:{ n: 'Mach (at sea level)', s: 'Mach', f: 340.29 }
};
const DATA = {
  b:   { n: 'Bit', s: 'bit', f: 0.125 },
  B:   { n: 'Byte', s: 'B', f: 1 },
  KB:  { n: 'Kilobyte (1000 B)', s: 'KB', f: 1000 },
  MB:  { n: 'Megabyte (1000 KB)', s: 'MB', f: 1e6 },
  GB:  { n: 'Gigabyte (1000 MB)', s: 'GB', f: 1e9 },
  TB:  { n: 'Terabyte (1000 GB)', s: 'TB', f: 1e12 },
  KiB: { n: 'Kibibyte (1024 B)', s: 'KiB', f: 1024 },
  MiB: { n: 'Mebibyte (1024 KiB)', s: 'MiB', f: 1048576 },
  GiB: { n: 'Gibibyte (1024 MiB)', s: 'GiB', f: 1073741824 },
  TiB: { n: 'Tebibyte (1024 GiB)', s: 'TiB', f: 1099511627776 }
};

function opts(units) {
  return Object.keys(units).map(function (k) {
    return '<option value="' + k + '">' + units[k].n + ' (' + units[k].s + ')</option>';
  }).join('');
}

export default [

unitTool({
  slug: 'length-converter', name: 'Length Converter', icon: '📏',
  desc: 'Convert between metric and imperial length units.',
  seoTitle: 'Length Converter — Metres, Feet, Inches and Miles',
  metaDescription: 'Convert length and distance between millimetres, metres, kilometres, inches, feet, yards, miles and nautical miles. Exact conversion factors, shown as you type.',
  keywords: ['length converter', 'cm to inches', 'metres to feet', 'km to miles', 'distance converter'],
  popularity: 80, featured: true,
  related: ['weight-converter', 'temperature-converter', 'speed-converter', 'data-storage-converter', 'bmi-calculator'],
  intro: 'Convert distance between nine units. Every unit is defined from the international metre, so the factors are exact rather than approximated.',
  units: LENGTH, base: 'm', options: opts(LENGTH), from: 'cm', to: 'in', defaultValue: 100,
  howto: [
    'Type the value you want to convert.',
    'Pick the unit you are converting from and the unit you want.',
    'The result updates as you type, and the table below shows every other unit at once.'
  ],
  sections: [
    { h: 'Exact conversion factors',
      p: `<p>Since 1959 the inch has been defined as exactly 0.0254 metres by international agreement. Every other imperial length follows from it, which makes these conversions exact rather than approximate:</p>
<table>
<tr><th>Unit</th><th>Exactly</th></tr>
<tr><td>1 inch</td><td>25.4 mm</td></tr>
<tr><td>1 foot</td><td>0.3048 m (12 inches)</td></tr>
<tr><td>1 yard</td><td>0.9144 m (3 feet)</td></tr>
<tr><td>1 mile</td><td>1,609.344 m (1,760 yards)</td></tr>
<tr><td>1 nautical mile</td><td>1,852 m</td></tr>
</table>
<p>The nautical mile is the odd one out: it is defined from the Earth rather than from the metre, as one minute of latitude. That is why it is a round number of metres and an awkward number of feet, and why it remains standard in aviation and shipping.</p>` },
    { h: 'Quick mental conversions',
      p: `<ul>
<li><b>cm to inches</b> — divide by 2.5 and add a little. 10 cm ≈ 4 inches.</li>
<li><b>metres to feet</b> — multiply by 3 and add 10%. 10 m ≈ 33 ft.</li>
<li><b>km to miles</b> — multiply by 0.6, or use consecutive Fibonacci numbers: 5 km ≈ 3 miles, 8 km ≈ 5 miles, 13 km ≈ 8 miles.</li>
<li><b>miles to km</b> — multiply by 1.6.</li>
</ul>
<p>The Fibonacci trick works because the ratio between consecutive terms approaches 1.618, and a mile is 1.609 km. It is accurate to within about half a percent.</p>` }
  ],
  faq: [
    { q: 'Why is a nautical mile different from a mile?', a: 'It is defined as one minute of latitude — 1,852 metres — so it maps directly onto navigational charts. A statute mile is a land measure with no relationship to the Earth\'s geometry.' },
    { q: 'Are US and UK measurements the same?', a: 'For length, yes since 1959. Both use the international inch of exactly 25.4 mm. Volume is where they diverge: a US gallon and an imperial gallon are quite different.' },
    { q: 'Why does my result show many decimal places?', a: 'Most conversions between metric and imperial produce non-terminating decimals. Results are rounded for readability and the exact working is shown underneath.' },
    { q: 'What is a survey foot?', a: 'A slightly different US definition used in land surveying, longer than the international foot by about two parts per million. It was officially retired at the end of 2022 but appears in older land records.' }
  ]
}),

unitTool({
  slug: 'weight-converter', name: 'Weight Converter', icon: '⚖',
  desc: 'Convert between kilograms, pounds, ounces, stone and tonnes.',
  seoTitle: 'Weight Converter — kg to lbs, Ounces and Stone',
  metaDescription: 'Convert weight and mass between kilograms, grams, pounds, ounces, stone and tonnes. Exact factors with a full comparison table.',
  keywords: ['weight converter', 'kg to lbs', 'pounds to kg', 'stone to kg', 'mass converter'],
  popularity: 79,
  related: ['length-converter', 'temperature-converter', 'bmi-calculator', 'data-storage-converter', 'speed-converter'],
  intro: 'Convert mass across nine units, including the three different tons that cause the most confusion.',
  units: WEIGHT, base: 'kg', options: opts(WEIGHT), from: 'kg', to: 'lb', defaultValue: 70,
  howto: [
    'Enter the weight you want to convert.',
    'Choose the source and target units.',
    'Read the result, or scan the table for every unit at once.'
  ],
  sections: [
    { h: 'The three tons',
      p: `<p>"Ton" means three different things, differing by up to 10%:</p>
<table>
<tr><th>Name</th><th>Equals</th><th>Used in</th></tr>
<tr><td>Metric tonne</td><td>1,000 kg (2,204.6 lb)</td><td>Most of the world, international trade</td></tr>
<tr><td>US short ton</td><td>2,000 lb (907.18 kg)</td><td>United States</td></tr>
<tr><td>UK long ton</td><td>2,240 lb (1,016.05 kg)</td><td>Historic British use, shipping</td></tr>
</table>
<p>Shipping documents and freight quotes are where this matters most. If a figure is unlabelled, the metric tonne is the safest assumption outside the United States.</p>` },
    { h: 'Mass versus weight',
      p: `<p>Strictly, mass is the amount of matter in an object and weight is the force gravity exerts on it. Mass is measured in kilograms; weight is properly measured in newtons. On the Moon your mass is unchanged but your weight is about one sixth.</p>
<p>Everyday language ignores this, and so does this converter — like every scale you have used, it treats kilograms and pounds as interchangeable measures of the same thing. That is correct anywhere on Earth's surface, where gravity varies by only a fraction of a percent.</p>` }
  ],
  faq: [
    { q: 'How many pounds in a kilogram?', a: 'Exactly 1 kg = 2.2046226218 lb, since the pound is defined as exactly 0.45359237 kg. The familiar 2.2 is accurate enough for most purposes.' },
    { q: 'What is a stone?', a: '14 pounds, or about 6.35 kg. It is still used for body weight in the UK and Ireland, where a weight is usually spoken as "11 stone 4" rather than in pounds alone.' },
    { q: 'Why is an ounce of gold different?', a: 'Precious metals use the troy ounce, about 31.10 g, rather than the avoirdupois ounce of 28.35 g used for everything else. This converter uses the ordinary ounce.' },
    { q: 'Are US and UK pounds the same?', a: 'Yes. Both use the international avoirdupois pound of exactly 0.45359237 kg, agreed in 1959.' }
  ]
}),

{
  slug: 'temperature-converter',
  name: 'Temperature Converter',
  icon: '🌡',
  category: 'converters',
  desc: 'Convert Celsius, Fahrenheit, Kelvin and Rankine.',
  seoTitle: 'Temperature Converter — Celsius, Fahrenheit and Kelvin',
  metaDescription: 'Convert temperature between Celsius, Fahrenheit, Kelvin and Rankine. Shows the formula used and warns about values below absolute zero.',
  keywords: ['temperature converter', 'celsius to fahrenheit', 'fahrenheit to celsius', 'kelvin converter'],
  popularity: 84, featured: true,
  related: ['length-converter', 'weight-converter', 'speed-converter', 'number-base-converter', 'percentage-calculator'],
  intro: 'Temperature scales have different zero points, so they need offsets rather than simple factors. The formula used is shown with every conversion.',
  html: `
<div class="row" style="align-items:flex-end">
  <div class="field"><label for="val">Temperature</label><input type="number" id="val" value="25" step="any"></div>
  <div class="field"><label for="from">From</label><select id="from">
    <option value="C">Celsius (°C)</option><option value="F">Fahrenheit (°F)</option>
    <option value="K">Kelvin (K)</option><option value="R">Rankine (°R)</option></select></div>
  <div class="field" style="flex:0 0 auto"><span class="lbl">&nbsp;</span><button class="btn" id="swap" style="width:100%">⇅ Swap</button></div>
  <div class="field"><label for="to">To</label><select id="to">
    <option value="C">Celsius (°C)</option><option value="F" selected>Fahrenheit (°F)</option>
    <option value="K">Kelvin (K)</option><option value="R">Rankine (°R)</option></select></div>
</div>
<div class="msg" id="msg"></div>
<div class="result-hero" style="margin-top:6px"><div class="rv" id="r-val">—</div><div class="rl" id="r-lab">—</div></div>
<pre class="out" id="r-work" style="margin-top:12px"></pre>
<h3>All scales</h3>
<table class="kv" id="all"></table>
<h3>Reference points</h3>
<table class="kv" id="ref"></table>`,
  init: function () {
    var NAMES = { C: '°C', F: '°F', K: 'K', R: '°R' };
    var FULL = { C: 'Celsius', F: 'Fahrenheit', K: 'Kelvin', R: 'Rankine' };

    function toC(v, from) {
      if (from === 'C') return v;
      if (from === 'F') return (v - 32) * 5 / 9;
      if (from === 'K') return v - 273.15;
      return (v - 491.67) * 5 / 9;
    }
    function fromC(c, to) {
      if (to === 'C') return c;
      if (to === 'F') return c * 9 / 5 + 32;
      if (to === 'K') return c + 273.15;
      return (c + 273.15) * 9 / 5;
    }
    function fmt(n) {
      if (!isFinite(n)) return '—';
      return parseFloat(n.toFixed(4)).toLocaleString(undefined, { maximumFractionDigits: 4 });
    }
    var ABS = { C: -273.15, F: -459.67, K: 0, R: 0 };

    function work(v, from, to) {
      if (from === to) return 'Same scale — no conversion needed.';
      var c = toC(v, from);
      var lines = [];
      if (from !== 'C') {
        if (from === 'F') lines.push('°C = (' + v + ' − 32) × 5/9 = ' + fmt(c));
        else if (from === 'K') lines.push('°C = ' + v + ' − 273.15 = ' + fmt(c));
        else lines.push('°C = (' + v + ' − 491.67) × 5/9 = ' + fmt(c));
      }
      var out = fromC(c, to);
      if (to === 'F') lines.push('°F = ' + fmt(c) + ' × 9/5 + 32 = ' + fmt(out));
      else if (to === 'K') lines.push('K = ' + fmt(c) + ' + 273.15 = ' + fmt(out));
      else if (to === 'R') lines.push('°R = (' + fmt(c) + ' + 273.15) × 9/5 = ' + fmt(out));
      return lines.join('\n');
    }

    function run() {
      var v = MT.num('#val', NaN);
      var from = MT.$('#from').value, to = MT.$('#to').value;
      if (!isFinite(v)) { MT.msg('#msg', 'Enter a temperature.', 'warn'); return; }
      if (v < ABS[from] - 1e-9) {
        MT.msg('#msg', 'That is below absolute zero (' + ABS[from] + ' ' + NAMES[from] + '), which is not physically possible.', 'err');
        return;
      }
      MT.clearMsg('#msg');
      var c = toC(v, from);
      var out = fromC(c, to);
      MT.$('#r-val').textContent = fmt(out) + ' ' + NAMES[to];
      MT.$('#r-lab').textContent = fmt(v) + ' ' + NAMES[from] + ' = ' + fmt(out) + ' ' + NAMES[to];
      MT.$('#r-work').textContent = work(v, from, to);
      MT.$('#all').innerHTML = ['C', 'F', 'K', 'R'].map(function (k) {
        return '<tr' + (k === to ? ' style="background:var(--accent-wash)"' : '') + '><td>' + FULL[k] +
          '</td><td>' + fmt(fromC(c, k)) + ' ' + NAMES[k] + '</td></tr>';
      }).join('');
      var refs = [['Absolute zero', -273.15], ['Water freezes', 0], ['Room temperature', 21], ['Body temperature', 37], ['Water boils (sea level)', 100]];
      MT.$('#ref').innerHTML = refs.map(function (r) {
        return '<tr><td>' + r[0] + '</td><td style="font-weight:500">' + fmt(r[1]) + ' °C · ' + fmt(fromC(r[1], 'F')) + ' °F · ' + fmt(fromC(r[1], 'K')) + ' K</td></tr>';
      }).join('');
      MT.done({ from: from, to: to });
    }
    MT.$$('#val, #from, #to').forEach(function (el) { el.addEventListener('input', run); el.addEventListener('change', run); });
    MT.on('#swap', 'click', function () {
      var f = MT.$('#from').value;
      MT.$('#from').value = MT.$('#to').value;
      MT.$('#to').value = f;
      run();
    });
    run();
  },
  howto: [
    'Enter a temperature and choose the scale it is in.',
    'Pick the scale you want it converted to.',
    'The formula used appears underneath, along with every other scale and a set of reference points.'
  ],
  sections: [
    { h: 'The formulas',
      p: `<table>
<tr><th>Conversion</th><th>Formula</th></tr>
<tr><td>Celsius → Fahrenheit</td><td>(°C × 9/5) + 32</td></tr>
<tr><td>Fahrenheit → Celsius</td><td>(°F − 32) × 5/9</td></tr>
<tr><td>Celsius → Kelvin</td><td>°C + 273.15</td></tr>
<tr><td>Fahrenheit → Rankine</td><td>°F + 459.67</td></tr>
</table>
<p>Temperature is the one common conversion that needs an offset, not just a factor. That is because Celsius and Fahrenheit put their zero points in different places — which is also why you cannot convert a temperature <em>difference</em> the same way. A rise of 10 °C is a rise of 18 °F, not 50 °F.</p>` },
    { h: 'Why −40 is the same in both',
      p: `<p>Setting the two scales equal and solving gives exactly one crossing point: −40 °C = −40 °F. It is a genuinely useful fact in cold climates, where an unlabelled −40 needs no conversion.</p>
<p>A quick mental approximation for everyday temperatures: double the Celsius figure and add 30. For 20 °C that gives 70 °F against a true 68 — close enough for deciding on a jacket. The error grows at the extremes, so use the exact formula for cooking or anything technical.</p>` },
    { h: 'Kelvin and absolute zero',
      p: `<p>Kelvin starts at absolute zero, the point where thermal motion is minimal, and uses the same degree size as Celsius. It takes no degree symbol — 300 K, not 300 °K — and it is the SI base unit for temperature.</p>
<p>Rankine does the same thing with Fahrenheit-sized degrees, starting at −459.67 °F. It survives mainly in US engineering thermodynamics. Because both scales are absolute, a negative value in either is physically impossible, which is why this tool rejects it.</p>` }
  ],
  faq: [
    { q: 'What is 98.6 °F in Celsius?', a: 'Exactly 37 °C. The famous 98.6 is a conversion artefact — the original 19th-century measurement was 37 °C, and converting it produced a figure that looks more precise than the underlying data was.' },
    { q: 'Why does Kelvin have no degree symbol?', a: 'Because it is an absolute scale rather than a relative one. The SI convention is 300 K, written and spoken as "300 kelvin".' },
    { q: 'Can I convert a temperature difference?', a: 'Not with these formulas. For a difference, use the ratio alone: 1 °C of change equals 1.8 °F of change and exactly 1 K of change.' },
    { q: 'Which countries use Fahrenheit?', a: 'The United States and a handful of territories. Almost everywhere else uses Celsius for weather and cooking, with Kelvin reserved for scientific work.' }
  ]
},

unitTool({
  slug: 'speed-converter', name: 'Speed Converter', icon: '🚀',
  desc: 'Convert km/h, mph, m/s, knots and Mach.',
  seoTitle: 'Speed Converter — km/h to mph, Knots and m/s',
  metaDescription: 'Convert speed between kilometres per hour, miles per hour, metres per second, feet per second, knots and Mach. Exact factors with a full table.',
  keywords: ['speed converter', 'kmh to mph', 'mph to kmh', 'knots to mph', 'velocity converter'],
  popularity: 72,
  related: ['length-converter', 'time-calculator', 'weight-converter', 'temperature-converter', 'data-storage-converter'],
  intro: 'Convert speed across six units, from everyday road speeds to knots and Mach.',
  units: SPEED, base: 'ms', options: opts(SPEED), from: 'kmh', to: 'mph', defaultValue: 100,
  howto: [
    'Enter the speed you want to convert.',
    'Select the units to convert from and to.',
    'The table below shows the same speed in every supported unit.'
  ],
  sections: [
    { h: 'Common speed equivalents',
      p: `<table>
<tr><th>km/h</th><th>mph</th><th>m/s</th><th>Context</th></tr>
<tr><td>5</td><td>3.1</td><td>1.4</td><td>Walking pace</td></tr>
<tr><td>30</td><td>18.6</td><td>8.3</td><td>Urban speed limit in much of Europe</td></tr>
<tr><td>50</td><td>31.1</td><td>13.9</td><td>Typical city limit</td></tr>
<tr><td>100</td><td>62.1</td><td>27.8</td><td>Highway cruising</td></tr>
<tr><td>120</td><td>74.6</td><td>33.3</td><td>Motorway limit in many countries</td></tr>
</table>
<p>Two conversions worth memorising: multiply km/h by 0.62 for mph, and divide by 3.6 for m/s.</p>` },
    { h: 'Knots and Mach',
      p: `<p>A knot is one nautical mile per hour — 1.852 km/h exactly. It persists in aviation and shipping because it maps cleanly onto latitude: one knot for one hour covers one minute of latitude on a chart. The name comes from the knotted line sailors once let out behind a ship to measure its speed.</p>
<p>Mach is not a fixed speed. It is a ratio against the local speed of sound, which depends on air temperature and therefore altitude. At sea level in standard conditions sound travels at about 340 m/s; at cruising altitude it is closer to 295 m/s. This converter uses the sea-level value, so treat Mach figures as indicative only.</p>` }
  ],
  faq: [
    { q: 'How do I convert km/h to m/s quickly?', a: 'Divide by 3.6. The factor comes from 1,000 metres per kilometre divided by 3,600 seconds per hour.' },
    { q: 'Is a knot the same as a mile per hour?', a: 'No. A knot is 1.15 mph, because it is based on the nautical mile of 1,852 metres rather than the statute mile of 1,609.' },
    { q: 'Why is Mach marked "at sea level"?', a: 'The speed of sound falls as air gets colder, so Mach 1 is a different speed at 10,000 metres than at ground level. A fixed conversion can only use one reference condition.' },
    { q: 'How do I convert a running pace?', a: 'Pace is time per distance, the inverse of speed. To convert 5 minutes per kilometre, divide 60 by 5 to get 12 km/h, then convert that.' }
  ]
}),

unitTool({
  slug: 'data-storage-converter', name: 'Data Storage Converter', icon: '💾',
  desc: 'Convert bytes, kilobytes, megabytes and their binary equivalents.',
  seoTitle: 'Data Storage Converter — Bytes, MB, GB and GiB',
  metaDescription: 'Convert digital storage between bits, bytes, kilobytes, megabytes, gigabytes and the binary units KiB, MiB and GiB. Explains why your drive looks smaller than advertised.',
  keywords: ['data storage converter', 'mb to gb', 'bytes converter', 'gib vs gb', 'file size converter'],
  popularity: 71,
  related: ['image-compressor', 'base64-encoder', 'number-base-converter', 'length-converter', 'pdf-compressor'],
  intro: 'Convert file and storage sizes, including both the decimal units drive manufacturers use and the binary units your operating system reports.',
  units: DATA, base: 'B', options: opts(DATA), from: 'MB', to: 'GB', defaultValue: 1500,
  howto: [
    'Enter the size you want to convert.',
    'Choose the source and target units — note that KB and KiB are different.',
    'Compare every unit at once in the table below.'
  ],
  sections: [
    { h: 'Why a 1 TB drive shows as 931 GB',
      p: `<p>This is the single most confusing thing in digital storage, and it is not a scam — it is two definitions of the same prefix.</p>
<p>Drive manufacturers use decimal units, where 1 TB = 1,000,000,000,000 bytes. Windows reports storage in binary units but labels them with decimal names, so it divides by 1,024 three times and calls the result "GB". The drive really does contain a trillion bytes; that is 931 gibibytes, which Windows displays as 931 GB.</p>
<p>The discrepancy compounds with size: about 2% at kilobyte scale, 5% at gigabyte, and roughly 10% at terabyte. macOS and Linux switched to true decimal reporting years ago, which is why the same drive can show a different figure on different machines.</p>` },
    { h: 'Decimal and binary units side by side',
      p: `<table>
<tr><th>Decimal</th><th>Bytes</th><th>Binary</th><th>Bytes</th></tr>
<tr><td>1 KB</td><td>1,000</td><td>1 KiB</td><td>1,024</td></tr>
<tr><td>1 MB</td><td>1,000,000</td><td>1 MiB</td><td>1,048,576</td></tr>
<tr><td>1 GB</td><td>10⁹</td><td>1 GiB</td><td>1,073,741,824</td></tr>
<tr><td>1 TB</td><td>10¹²</td><td>1 TiB</td><td>1,099,511,627,776</td></tr>
</table>
<p>The binary prefixes — kibi, mebi, gibi — were standardised by the IEC in 1998 precisely to end this ambiguity. Adoption has been patchy outside Linux and technical documentation.</p>` },
    { h: 'Bits versus bytes',
      p: `<p>A byte is eight bits, and the distinction matters most in networking. Internet speeds are quoted in megabits per second (Mb/s), while download managers show megabytes per second (MB/s). Divide by eight to convert: a 100 Mb/s connection downloads at roughly 12.5 MB/s at best.</p>
<p>The capital letter is the only thing distinguishing them — <b>b</b> is bits, <b>B</b> is bytes — which is why marketing material for broadband so often looks better than the speeds you observe.</p>` }
  ],
  faq: [
    { q: 'Should I use MB or MiB?', a: 'Use MB for storage marketing and network speeds, MiB when you need the exact binary value — memory sizes, block sizes and technical documentation. If precision matters, state which you mean.' },
    { q: 'How long will a download take?', a: 'Divide the file size in megabits by your connection speed in megabits per second. A 1 GB file is 8,000 megabits, so on a 100 Mb/s line that is at least 80 seconds in ideal conditions.' },
    { q: 'Why does my phone show less storage than advertised?', a: 'Two reasons combine: the decimal-versus-binary gap, and the operating system itself occupying several gigabytes before you install anything.' },
    { q: 'Is a kilobit 1,000 or 1,024 bits?', a: 'In networking, always 1,000. Bit-based units have consistently used decimal prefixes, which is one thing this area gets right.' }
  ]
}),

{
  slug: 'time-zone-converter',
  name: 'Time Zone Converter',
  icon: '🌍',
  category: 'converters',
  desc: 'Convert a time between any two time zones.',
  seoTitle: 'Time Zone Converter — Convert Times Between Cities',
  metaDescription: 'Convert a date and time between any two time zones, with daylight saving handled automatically using your browser\'s IANA time zone database.',
  keywords: ['time zone converter', 'timezone converter', 'utc converter', 'world clock', 'convert time between cities'],
  popularity: 81,
  related: ['timestamp-converter', 'time-calculator', 'date-calculator', 'age-calculator', 'speed-converter'],
  intro: 'Pick a moment in one zone and read it in another. Daylight saving is applied for the specific date you choose, not for today.',
  html: `
<div class="row">
  <div class="field"><label for="dt">Date and time</label><input type="datetime-local" id="dt"></div>
  <div class="field"><label for="from">In this zone</label><select id="from"></select></div>
</div>
<div class="row">
  <div class="field"><label for="to">Convert to</label><select id="to"></select></div>
  <div class="field" style="flex:0 0 auto"><span class="lbl">&nbsp;</span><button class="btn" id="swap" style="width:100%">⇅ Swap zones</button></div>
</div>
<div class="actions"><button class="btn btn-primary" id="go">Convert</button><button class="btn" id="now">Use now</button></div>
<div class="msg" id="msg"></div>
<div id="res" hidden style="margin-top:18px">
  <div class="result-hero"><div class="rv" id="r-time">—</div><div class="rl" id="r-zone">—</div></div>
  <table class="kv" style="margin-top:14px">
    <tr><td>Source time</td><td id="r-src">—</td></tr>
    <tr><td>UTC</td><td id="r-utc">—</td></tr>
    <tr><td>Difference</td><td id="r-diff">—</td></tr>
    <tr><td>Day shift</td><td id="r-day">—</td></tr>
  </table>
  <h3>Same moment elsewhere</h3>
  <table class="kv" id="world"></table>
</div>`,
  init: function () {
    var ZONES = ['UTC','America/Los_Angeles','America/Denver','America/Chicago','America/New_York','America/Toronto','America/Edmonton','America/Vancouver','America/Sao_Paulo','America/Mexico_City','Europe/London','Europe/Dublin','Europe/Lisbon','Europe/Paris','Europe/Berlin','Europe/Madrid','Europe/Rome','Europe/Amsterdam','Europe/Stockholm','Europe/Warsaw','Europe/Athens','Europe/Istanbul','Europe/Moscow','Africa/Lagos','Africa/Cairo','Africa/Johannesburg','Africa/Nairobi','Asia/Dubai','Asia/Karachi','Asia/Kolkata','Asia/Dhaka','Asia/Bangkok','Asia/Jakarta','Asia/Singapore','Asia/Hong_Kong','Asia/Shanghai','Asia/Manila','Asia/Seoul','Asia/Tokyo','Australia/Perth','Australia/Brisbane','Australia/Sydney','Australia/Melbourne','Pacific/Auckland','Pacific/Honolulu'];
    var WORLD = ['America/Los_Angeles','America/New_York','Europe/London','Europe/Berlin','Asia/Dubai','Asia/Kolkata','Asia/Shanghai','Asia/Tokyo','Australia/Sydney'];

    var local = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    if (ZONES.indexOf(local) === -1) ZONES.push(local);
    ZONES.sort();

    function label(z) { return z.replace(/_/g, ' ') + (z === local ? '  — your zone' : ''); }
    var optHtml = ZONES.map(function (z) { return '<option value="' + z + '">' + label(z) + '</option>'; }).join('');
    MT.$('#from').innerHTML = optHtml;
    MT.$('#to').innerHTML = optHtml;
    MT.$('#from').value = local;
    MT.$('#to').value = local === 'UTC' ? 'Asia/Tokyo' : 'UTC';

    // Offset (in minutes) of a zone at a given instant
    function zoneOffset(date, zone) {
      var dtf = new Intl.DateTimeFormat('en-US', {
        timeZone: zone, hour12: false,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
      var p = {};
      dtf.formatToParts(date).forEach(function (x) { p[x.type] = x.value; });
      var asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second);
      return (asUTC - Math.floor(date.getTime() / 1000) * 1000) / 60000;
    }
    // Convert a wall-clock time in a zone into a real instant
    function instantFrom(wall, zone) {
      var guess = new Date(wall + 'Z');
      for (var i = 0; i < 3; i++) {
        var off = zoneOffset(guess, zone);
        var next = new Date(new Date(wall + 'Z').getTime() - off * 60000);
        if (Math.abs(next - guess) < 1000) { guess = next; break; }
        guess = next;
      }
      return guess;
    }
    function fmtIn(date, zone) {
      return new Intl.DateTimeFormat(undefined, {
        timeZone: zone, dateStyle: 'full', timeStyle: 'short'
      }).format(date);
    }
    function shortIn(date, zone) {
      return new Intl.DateTimeFormat(undefined, { timeZone: zone, weekday: 'short', hour: 'numeric', minute: '2-digit' }).format(date);
    }
    function abbr(date, zone) {
      var parts = new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'short' }).formatToParts(date);
      var t = parts.filter(function (p) { return p.type === 'timeZoneName'; })[0];
      return t ? t.value : '';
    }

    function nowLocalValue() {
      var d = new Date();
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    }
    MT.$('#dt').value = nowLocalValue();

    function run() {
      var v = MT.$('#dt').value;
      MT.$('#res').hidden = true;
      if (!v) { MT.msg('#msg', 'Pick a date and time.', 'warn'); return; }
      var from = MT.$('#from').value, to = MT.$('#to').value;
      var wall = v.length === 16 ? v + ':00' : v;
      var instant;
      try { instant = instantFrom(wall, from); }
      catch (e) { MT.msg('#msg', 'That time zone is not supported by your browser.', 'err'); return; }
      if (isNaN(instant.getTime())) { MT.msg('#msg', 'That date and time could not be read.', 'err'); return; }

      MT.clearMsg('#msg');
      MT.$('#r-time').textContent = new Intl.DateTimeFormat(undefined, { timeZone: to, hour: 'numeric', minute: '2-digit' }).format(instant);
      MT.$('#r-zone').textContent = fmtIn(instant, to) + ' — ' + to.replace(/_/g, ' ') + ' (' + abbr(instant, to) + ')';
      MT.$('#r-src').textContent = fmtIn(instant, from) + ' (' + abbr(instant, from) + ')';
      MT.$('#r-utc').textContent = fmtIn(instant, 'UTC');

      var offFrom = zoneOffset(instant, from), offTo = zoneOffset(instant, to);
      var diff = (offTo - offFrom) / 60;
      MT.$('#r-diff').textContent = diff === 0 ? 'Same time' :
        (diff > 0 ? '+' : '−') + Math.floor(Math.abs(diff)) + 'h' +
        (Math.abs(diff) % 1 ? ' ' + Math.round((Math.abs(diff) % 1) * 60) + 'm' : '') +
        ' (' + to.split('/').pop().replace(/_/g, ' ') + ' is ' + (diff > 0 ? 'ahead' : 'behind') + ')';

      var dFrom = new Intl.DateTimeFormat('en-CA', { timeZone: from, dateStyle: 'short' }).format(instant);
      var dTo = new Intl.DateTimeFormat('en-CA', { timeZone: to, dateStyle: 'short' }).format(instant);
      MT.$('#r-day').textContent = dFrom === dTo ? 'Same calendar day' : dTo > dFrom ? 'Next day' : 'Previous day';

      MT.$('#world').innerHTML = WORLD.map(function (z) {
        return '<tr' + (z === to ? ' style="background:var(--accent-wash)"' : '') + '><td>' + z.split('/').pop().replace(/_/g, ' ') +
          '</td><td>' + shortIn(instant, z) + '</td></tr>';
      }).join('');
      MT.$('#res').hidden = false;
      MT.done({ from: from, to: to });
    }
    MT.on('#go', 'click', MT.guard(run));
    MT.on('#now', 'click', function () { MT.$('#dt').value = nowLocalValue(); run(); });
    MT.on('#swap', 'click', function () {
      var f = MT.$('#from').value; MT.$('#from').value = MT.$('#to').value; MT.$('#to').value = f; run();
    });
    MT.$$('#dt, #from, #to').forEach(function (el) { el.addEventListener('change', function () { if (!MT.$('#res').hidden) run(); }); });
    run();
  },
  howto: [
    'Pick the date and time, and the zone that time is in.',
    'Choose the zone you want it converted to.',
    'Press <b>Convert</b>. The table at the bottom shows the same moment in nine major cities.'
  ],
  sections: [
    { h: 'Why the date matters as much as the time',
      p: `<p>Time zone offsets are not constant. Most of Europe and North America shift by an hour twice a year, and the changeover dates differ — the US switches in mid-March and early November, the EU on the last Sundays of March and October. For a fortnight each spring, the gap between London and New York is four hours rather than the usual five.</p>
<p>Because of this, converting "3pm next Tuesday" is a different calculation from converting "3pm today". This tool uses your browser's IANA time zone database and applies the rules in force on the specific date you pick, so scheduling across the changeover works correctly.</p>` },
    { h: 'Zone names, not offsets',
      p: `<p>Zones are identified as <code>Region/City</code> — <code>Europe/London</code>, <code>Asia/Kolkata</code> — rather than as offsets like UTC+1. This matters because an offset is only true for part of the year, while a zone name carries the full history of that region's rules.</p>
<p>Abbreviations are worse than offsets. "CST" means US Central Standard Time, China Standard Time and Cuba Standard Time, spanning fourteen hours of difference. If you are writing a meeting invitation, name the city.</p>
<p>Not every zone is a whole number of hours from UTC either: India is UTC+5:30, Nepal UTC+5:45, and parts of Australia UTC+9:30. Any system that stores offsets as whole hours will eventually get these wrong.</p>` }
  ],
  faq: [
    { q: 'Does it handle daylight saving?', a: 'Yes, for the date you enter. It uses the rules that applied on that specific date, which is what makes scheduling across a changeover reliable.' },
    { q: 'Why is my city not listed?', a: 'The list covers the most commonly needed zones plus your own, detected automatically. Pick the nearest city in the same zone — all cities in a zone share identical rules.' },
    { q: 'What is UTC and how does it differ from GMT?', a: 'UTC is the modern atomic time standard that all zones are defined against. GMT is a time zone that happens to equal UTC in winter but shifts to UTC+1 during British Summer Time.' },
    { q: 'How should I schedule an international meeting?', a: 'State the time with the city name, and add the UTC time in brackets. "14:00 London (13:00 UTC)" is unambiguous in a way that "2pm GMT" in July is not.' }
  ]
},

{
  slug: 'number-base-converter',
  name: 'Number Base Converter',
  icon: '01',
  category: 'converters',
  desc: 'Convert between binary, octal, decimal, hex and any base 2–36.',
  seoTitle: 'Number Base Converter — Binary, Hex and Decimal',
  metaDescription: 'Convert numbers between binary, octal, decimal, hexadecimal and any base from 2 to 36. Handles large integers exactly using arbitrary precision.',
  keywords: ['number base converter', 'binary to decimal', 'hex to decimal', 'decimal to binary', 'base converter'],
  popularity: 73,
  related: ['data-storage-converter', 'color-converter', 'base64-encoder', 'uuid-generator', 'timestamp-converter'],
  intro: 'Convert integers between any two bases from 2 to 36. Large values are handled with arbitrary precision, so nothing is silently rounded.',
  html: `
<div class="row" style="align-items:flex-end">
  <div class="field"><label for="val">Number</label><input type="text" id="val" value="255" spellcheck="false" style="font-family:var(--mono)"></div>
  <div class="field" style="flex:0 0 auto;min-width:150px"><label for="from">From base</label><input type="number" id="from" value="10" min="2" max="36" step="1"></div>
  <div class="field" style="flex:0 0 auto"><span class="lbl">&nbsp;</span><button class="btn" id="swap" style="width:100%">⇅ Swap</button></div>
  <div class="field" style="flex:0 0 auto;min-width:150px"><label for="to">To base</label><input type="number" id="to" value="16" min="2" max="36" step="1"></div>
</div>
<div class="field">
  <span class="lbl">Common bases</span>
  <div class="chips">
    <button class="chip" data-b="2">Binary — 2</button>
    <button class="chip" data-b="8">Octal — 8</button>
    <button class="chip" data-b="10">Decimal — 10</button>
    <button class="chip" data-b="16">Hex — 16</button>
    <button class="chip" data-b="36">Base 36</button>
  </div>
  <p class="hint">Sets the target base.</p>
</div>
<div class="msg" id="msg"></div>
<div class="result-hero" style="margin-top:6px"><div class="rv" id="r-val" style="word-break:break-all;font-family:var(--mono)">—</div><div class="rl" id="r-lab">—</div></div>
<div class="actions"><button class="btn" id="copy">Copy result</button></div>
<h3>Common bases</h3>
<table class="kv" id="all"></table>`,
  init: function () {
    var DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz';

    function parseBig(str, base) {
      var neg = str[0] === '-';
      var s = (neg ? str.slice(1) : str).toLowerCase();
      var v = 0n, b = BigInt(base);
      for (var i = 0; i < s.length; i++) {
        var d = DIGITS.indexOf(s[i]);
        if (d === -1 || d >= base) return { err: '“' + s[i] + '” is not a valid digit in base ' + base + '.' };
        v = v * b + BigInt(d);
      }
      return { v: neg ? -v : v };
    }
    function toBase(v, base) {
      if (v === 0n) return '0';
      var neg = v < 0n;
      var n = neg ? -v : v, b = BigInt(base), out = '';
      while (n > 0n) { out = DIGITS[Number(n % b)] + out; n = n / b; }
      return (neg ? '-' : '') + out;
    }

    function run() {
      var raw = MT.$('#val').value.trim().replace(/[\s_,]/g, '');
      var from = Math.round(MT.num('#from', 10)), to = Math.round(MT.num('#to', 16));
      if (!raw) { MT.msg('#msg', 'Enter a number to convert.', 'warn'); return; }
      if (!(from >= 2 && from <= 36) || !(to >= 2 && to <= 36)) {
        MT.msg('#msg', 'Bases must be between 2 and 36.', 'err'); return;
      }
      // tolerate common prefixes
      var s = raw;
      if (from === 16 && /^0x/i.test(s)) s = s.slice(2);
      if (from === 2 && /^0b/i.test(s)) s = s.slice(2);
      if (from === 8 && /^0o/i.test(s)) s = s.slice(2);
      if (/\./.test(s)) { MT.msg('#msg', 'This converter handles whole numbers only. Remove the decimal point.', 'err'); return; }

      var r = parseBig(s, from);
      if (r.err) { MT.msg('#msg', r.err, 'err'); return; }
      MT.clearMsg('#msg');
      var out = toBase(r.v, to);
      MT.$('#r-val').textContent = out.toUpperCase();
      MT.$('#r-lab').textContent = s + ' in base ' + from + ' = ' + out.toUpperCase() + ' in base ' + to;

      var rows = [[2, 'Binary'], [8, 'Octal'], [10, 'Decimal'], [16, 'Hexadecimal'], [36, 'Base 36']];
      MT.$('#all').innerHTML = rows.map(function (b) {
        var v = toBase(r.v, b[0]);
        return '<tr' + (b[0] === to ? ' style="background:var(--accent-wash)"' : '') + '><td>' + b[1] + ' (base ' + b[0] + ')</td>' +
          '<td style="font-family:var(--mono);word-break:break-all;text-align:right">' + v.toUpperCase() + '</td></tr>';
      }).join('') + '<tr><td>Bit length</td><td>' + toBase(r.v < 0n ? -r.v : r.v, 2).replace('-', '').length + '</td></tr>';
      MT.done({ from: from, to: to });
    }
    MT.$$('#val, #from, #to').forEach(function (el) { el.addEventListener('input', run); });
    MT.$$('[data-b]').forEach(function (c) {
      c.addEventListener('click', function () { MT.$('#to').value = c.dataset.b; run(); });
    });
    MT.on('#swap', 'click', function () {
      var f = MT.$('#from').value;
      MT.$('#from').value = MT.$('#to').value;
      MT.$('#to').value = f;
      MT.$('#val').value = MT.$('#r-val').textContent.replace('—', '');
      run();
    });
    MT.on('#copy', 'click', function (e) { MT.copy(MT.$('#r-val').textContent, e.currentTarget); });
    run();
  },
  howto: [
    'Type the number. Prefixes like <code>0x</code> and <code>0b</code> are accepted and stripped automatically.',
    'Set the base it is currently in and the base you want.',
    'The result appears immediately, with the common bases listed underneath.'
  ],
  sections: [
    { h: 'Why computing uses base 2, 8 and 16',
      p: `<p>Hardware is binary: every value is ultimately a pattern of ones and zeros. But binary is unreadable at any length — one byte takes eight characters, and a 32-bit address takes thirty-two.</p>
<p>Hexadecimal solves this because 16 is 2⁴, so each hex digit maps to exactly four bits with no arithmetic required. <code>FF</code> is <code>11111111</code>; <code>A</code> is <code>1010</code>. That clean correspondence is why memory addresses, colour codes and byte dumps are all written in hex. Octal (base 8, three bits per digit) served the same purpose on older machines and survives mainly in Unix file permissions.</p>` },
    { h: 'Reading the digits above 9',
      p: `<p>Bases beyond 10 need extra symbols, and the convention is to continue with letters: A = 10, B = 11, through Z = 35. That upper limit is why base 36 is the maximum here — it uses every digit and every letter exactly once.</p>
<p>Base 36 has a practical use: it produces the shortest identifiers that survive being typed, spoken or put in a URL without special characters. A number that takes 12 decimal digits fits in 8 base-36 characters.</p>` },
    { h: 'Exact conversion of large numbers',
      p: `<p>Converting via a standard floating-point number breaks silently above 2⁵³ − 1. A 64-bit hash or a long identifier converted that way comes back subtly wrong, with no error to warn you.</p>
<p>This tool uses arbitrary-precision integers instead, so a 256-bit hexadecimal value converts to decimal exactly. The trade-off is that fractional values are not supported — base conversion of fractions produces infinitely repeating expansions in most base pairs, so a general-purpose result would have to be rounded anyway.</p>` }
  ],
  faq: [
    { q: 'Why does hex use letters?', a: 'Base 16 needs sixteen distinct digit symbols, and only ten exist. A through F fill the gap, representing 10 to 15.' },
    { q: 'Can it convert decimals or fractions?', a: 'No, whole numbers only. Fractions rarely terminate when converted between bases — 0.1 in decimal is infinitely repeating in binary, which is the root of most floating-point surprises.' },
    { q: 'How large a number can it handle?', a: 'There is no practical limit. Arbitrary-precision arithmetic means a 512-bit value converts exactly, with no rounding or loss.' },
    { q: 'What do the 0x and 0b prefixes mean?', a: 'They are programming conventions marking hexadecimal and binary literals. They are notation rather than part of the number, so they are stripped automatically.' }
  ]
}

];
