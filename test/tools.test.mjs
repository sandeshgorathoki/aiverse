// MEGA TOOLS — tool test harness
//
// Each case boots a real DOM, injects the tool's actual HTML, runs its actual
// init() with the shared runtime, drives the UI, and asserts on rendered output.
// This is the difference between "the page renders" and "the tool works".

import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TOOLS, BY_SLUG } from '../src/registry.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const RUNTIME = readFileSync(path.join(ROOT, '..', 'src', 'assets', 'tool-runtime.js'), 'utf8');

let passed = 0, failed = 0;
const failures = [];

function assert(cond, label, detail) {
  if (cond) { passed++; return true; }
  failed++;
  failures.push({ label, detail });
  return false;
}

/* Boot a tool in a jsdom window and hand back the page + helpers. */
function boot(slug) {
  const tool = BY_SLUG[slug];
  if (!tool) throw new Error('No such tool: ' + slug);

  const dom = new JSDOM(
    `<!DOCTYPE html><html><body data-tool="${slug}">
       <div id="tool-root">${tool.html}</div>
     </body></html>`,
    { runScripts: 'outside-only', url: 'https://example.com/tools/' + slug, pretendToBeVisual: true }
  );
  const w = dom.window;

  // Minimal stand-ins for browser APIs the runtime touches.
  w.MT = {
    toast() {}, track() {}, escapeHtml(s) {
      return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }
  };
  if (!w.crypto?.getRandomValues) {
    Object.defineProperty(w, 'crypto', {
      configurable: true,
      value: {
        getRandomValues(arr) {
          for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 4294967296);
          return arr;
        }
      }
    });
  }
  w.TextEncoder = w.TextEncoder || TextEncoder;
  w.TextDecoder = w.TextDecoder || TextDecoder;
  w.Blob = w.Blob || class { constructor(p) { this.size = Buffer.byteLength(String(p[0] ?? '')); } };
  w.URL.createObjectURL = () => 'blob:test';
  w.URL.revokeObjectURL = () => {};

  w.eval(RUNTIME);
  if (tool.initCfg) w.__TOOL_CFG = JSON.parse(JSON.stringify(tool.initCfg));

  // The tool's own init, exactly as the build serialises it into the page.
  w.eval('(' + tool.init.toString() + ')();');

  const $ = sel => w.document.querySelector(sel);
  return {
    w, $,
    set(sel, val) {
      const el = $(sel);
      if (!el) throw new Error('Missing element ' + sel + ' in ' + slug);
      if (el.type === 'checkbox') el.checked = val;
      else el.value = val;
      el.dispatchEvent(new w.Event('input', { bubbles: true }));
      el.dispatchEvent(new w.Event('change', { bubbles: true }));
    },
    click(sel) {
      const el = $(sel);
      if (!el) throw new Error('Missing element ' + sel + ' in ' + slug);
      el.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    },
    text: sel => ($(sel)?.textContent ?? '').trim(),
    msg: () => ($('#msg')?.textContent ?? '').trim()
  };
}

function test(slug, label, fn) {
  try {
    const p = boot(slug);
    fn(p, (cond, what, detail) => assert(cond, `${slug} — ${what}`, detail));
  } catch (e) {
    failed++;
    failures.push({ label: `${slug} — ${label}`, detail: e.message + '\n' + (e.stack || '').split('\n')[1] });
  }
}

/* ================================================================== */
/* Developer tools                                                    */
/* ================================================================== */

test('json-formatter', 'formats and validates', (p, ok) => {
  p.set('#in', '{"b":2,"a":[1,2,{"c":3}]}');
  p.click('#go');
  const out = p.text('#out');
  ok(out.includes('"a"') && out.includes('\n'), 'indents valid JSON', out.slice(0, 60));
  ok(p.msg().includes('Valid'), 'reports valid', p.msg());
  ok(p.text('#s-depth') !== '0', 'computes depth', p.text('#s-depth'));

  // sorting
  p.set('#sortkeys', true);
  p.click('#go');
  ok(p.text('#out').indexOf('"a"') < p.text('#out').indexOf('"b"'), 'sorts keys');

  // error location
  p.set('#sortkeys', false);
  p.set('#in', '{\n "a": 1,\n "b": 2,\n}');
  p.click('#go');
  ok(/line \d+, column \d+/.test(p.msg()), 'reports line and column on trailing comma', p.msg());
  ok(p.text('#out') === '', 'clears output on error');

  // empty
  p.set('#in', '   ');
  p.click('#go');
  ok(p.msg().toLowerCase().includes('paste'), 'prompts on empty input', p.msg());
});

test('json-validator', 'accepts and rejects', (p, ok) => {
  p.set('#in', '[1,2,3]');
  p.click('#go');
  ok(p.msg().startsWith('Valid'), 'accepts an array', p.msg());
  ok(p.text('#s-type') === 'array', 'identifies root type', p.text('#s-type'));

  p.set('#in', "{'a':1}");
  p.click('#go');
  ok(p.msg().startsWith('Invalid'), 'rejects single quotes', p.msg());
  ok(p.text('#ctx').includes('^'), 'renders a caret pointing at the error', p.text('#ctx'));
});

test('json-minifier', 'strips whitespace', (p, ok) => {
  p.set('#in', '{\n  "a": 1,\n  "b": [1, 2]\n}');
  p.click('#go');
  ok(p.text('#out') === '{"a":1,"b":[1,2]}', 'produces compact JSON', p.text('#out'));
  ok(p.text('#s-saved').endsWith('%'), 'reports a saving', p.text('#s-saved'));
});

test('base64-encoder', 'round-trips unicode', (p, ok) => {
  p.set('#in', 'Hello, world');
  p.click('#go');
  ok(p.text('#out') === 'SGVsbG8sIHdvcmxk', 'encodes ASCII correctly', p.text('#out'));

  p.set('#in', 'こんにちは');
  p.click('#go');
  const b64 = p.text('#out');
  ok(Buffer.from(b64, 'base64').toString('utf8') === 'こんにちは', 'encodes multi-byte UTF-8', b64);

  p.set('#in', 'a?b>c');
  p.set('#urlsafe', true);
  p.click('#go');
  ok(!/[+/=]/.test(p.text('#out')), 'url-safe alphabet has no +, / or =', p.text('#out'));
});

test('base64-decoder', 'decodes and rejects', (p, ok) => {
  p.set('#in', 'SGVsbG8sIHdvcmxk');
  p.click('#go');
  ok(p.text('#out') === 'Hello, world', 'decodes ASCII', p.text('#out'));

  p.set('#in', 'SGVsbG8s\n  IHdvcmxk');
  p.click('#go');
  ok(p.text('#out') === 'Hello, world', 'ignores whitespace', p.text('#out'));

  p.set('#in', '!!!not base64!!!');
  p.click('#go');
  ok(p.msg().toLowerCase().includes('not valid base64'), 'rejects invalid alphabet', p.msg());
});

test('uuid-generator', 'generates valid v4', (p, ok) => {
  p.set('#count', '20');
  p.click('#go');
  const list = p.text('#out').split('\n');
  ok(list.length === 20, 'generates the requested count', String(list.length));
  const re = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
  ok(list.every(u => re.test(u)), 'all match the v4 format', list[0]);
  ok(new Set(list).size === 20, 'all are distinct');

  p.set('#fmt', 'nohyphen');
  ok(!p.text('#out').split('\n')[0].includes('-'), 'no-hyphen format applies');

  p.set('#count', '9999');
  p.click('#go');
  ok(p.text('#out').split('\n').length === 500, 'caps the batch at 500');
});

test('url-encoder', 'encodes per mode', (p, ok) => {
  p.set('#in', 'a b&c=d');
  p.click('#go');
  ok(p.text('#out') === 'a%20b%26c%3Dd', 'component mode escapes & and =', p.text('#out'));

  p.click('[data-mode="uri"]');
  ok(p.text('#out') === 'a%20b&c=d', 'uri mode preserves & and =', p.text('#out'));

  p.click('[data-mode="form"]');
  ok(p.text('#out') === 'a+b%26c%3Dd', 'form mode uses + for space', p.text('#out'));
});

test('url-decoder', 'decodes and splits params', (p, ok) => {
  p.set('#in', 'https://example.com/s?q=salt%20%26%20pepper&page=2');
  p.click('#go');
  ok(p.text('#out').includes('salt & pepper'), 'decodes escapes', p.text('#out'));
  ok(p.$('#params-wrap').hidden === false, 'shows the query parameter table');
  ok(p.text('#params').includes('page'), 'lists parameter names');

  p.set('#in', '100% cotton');
  p.click('#go');
  ok(p.msg().toLowerCase().includes('percent-encoding'), 'rejects a bare percent sign', p.msg());
});

test('html-formatter', 'indents and detects imbalance', (p, ok) => {
  p.set('#in', '<div class="c"><h2>T</h2><p>B</p></div>');
  p.click('#go');
  const out = p.text('#out');
  ok(out.split('\n').length >= 5, 'expands onto multiple lines', out);
  ok(/\n\s+<h2>/.test(out), 'indents children', out);
  ok(p.msg().includes('balanced'), 'reports balanced tags', p.msg());

  p.set('#in', '<div><span>x</div>');
  p.click('#go');
  ok(/open|matching/.test(p.msg()), 'warns about unbalanced tags', p.msg());

  p.set('#in', '<p>a</p>\n<p>b</p>');
  p.click('#min');
  ok(!p.text('#out').includes('\n'), 'minify collapses to one line', p.text('#out'));
});

test('css-formatter', 'formats and minifies', (p, ok) => {
  p.set('#in', '.a{color:red;padding:4px}@media(max-width:600px){.a{color:blue}}');
  p.click('#go');
  const out = p.text('#out');
  ok(out.includes('color: red;'), 'spaces declarations', out);
  ok(/@media[^\n]*\{\n\s+\.a/.test(out), 'indents inside at-rules', out);

  p.set('#in', '.a {\n  color: red;\n  padding: 0.5em;\n}\n');
  p.click('#min');
  ok(p.text('#out') === '.a{color:red;padding:.5em}', 'minifies and shortens leading zero', p.text('#out'));

  // semicolon inside a string must not split the declaration
  p.set('#in', '.a{content:"x;y";color:red}');
  p.click('#go');
  ok(p.text('#out').includes('"x;y"'), 'preserves semicolons inside strings', p.text('#out'));
});

test('javascript-formatter', 'reindents safely', (p, ok) => {
  p.set('#in', 'function f(a){if(a){return 1}return 2}');
  p.click('#go');
  const out = p.text('#out');
  ok(out.split('\n').length >= 5, 'splits statements onto lines', out);
  ok(/\n\s+if/.test(out), 'indents the body', out);
  ok(p.msg().includes('Formatted'), 'reports success', p.msg());

  // a string containing braces must survive untouched
  p.set('#in', 'var s = "a{b}c"; var t = 1;');
  p.click('#go');
  ok(p.text('#out').includes('"a{b}c"'), 'does not reformat inside strings', p.text('#out'));

  // regex literal, not division
  p.set('#in', 'var r = /a{2}/g; var x = 1;');
  p.click('#go');
  ok(p.text('#out').includes('/a{2}/g'), 'recognises a regex literal', p.text('#out'));

  p.set('#in', 'function f(){');
  p.click('#go');
  ok(p.msg().toLowerCase().includes('brace'), 'warns on unbalanced braces', p.msg());
});

test('regex-tester', 'matches and reports groups', (p, ok) => {
  p.set('#pat', '(\\w+)@(\\w+)\\.com');
  p.set('#flags', 'g');
  p.set('#in', 'ada@example.com and grace@navy.com');
  ok(p.msg().includes('2 matches'), 'finds both matches', p.msg());
  ok(p.text('#groups').includes('group 1'), 'lists capture groups', p.text('#groups').slice(0, 80));
  ok(p.$('#hl').innerHTML.includes('<mark'), 'highlights matches');

  p.set('#pat', '(unclosed');
  ok(p.msg().toLowerCase().includes('invalid pattern'), 'reports an invalid pattern', p.msg());

  p.set('#pat', 'zzz');
  ok(p.msg().includes('No matches'), 'reports no matches', p.msg());
});

test('timestamp-converter', 'converts both directions', (p, ok) => {
  p.set('#ts', '1735689600');
  p.click('#go1');
  ok(p.text('#r-iso').startsWith('2025-01-01'), 'reads seconds correctly', p.text('#r-iso'));
  ok(p.text('#msg1').includes('seconds'), 'detects the unit', p.text('#msg1'));

  p.set('#ts', '1735689600000');
  p.click('#go1');
  ok(p.text('#r-iso').startsWith('2025-01-01'), 'auto-detects milliseconds', p.text('#r-iso'));

  p.set('#ts', 'not-a-number');
  p.click('#go1');
  ok(p.text('#msg1').toLowerCase().includes('must be a number'), 'rejects non-numeric input', p.text('#msg1'));

  p.set('#dt', '2025-01-01T00:00:00');
  p.set('#zone', 'utc');
  p.click('#go2');
  ok(p.text('#r2-s') === '1735689600', 'converts a UTC date back to seconds', p.text('#r2-s'));
});

test('color-converter', 'converts formats and contrast', (p, ok) => {
  p.set('#in', '#ff0000');
  ok(p.text('#o-rgb') === 'rgb(255, 0, 0)', 'hex to rgb', p.text('#o-rgb'));
  ok(p.text('#o-hsl').startsWith('hsl(0, 100%, 50%)'), 'hex to hsl', p.text('#o-hsl'));

  p.set('#in', 'rgb(26 79 214)');
  ok(p.text('#o-hex') === '#1a4fd6', 'rgb to hex', p.text('#o-hex'));

  p.set('#in', '#fff');
  ok(p.text('#o-hex') === '#ffffff', 'expands 3-digit hex', p.text('#o-hex'));
  ok(p.text('#o-cb').includes('21.00:1'), 'white on black is 21:1', p.text('#o-cb'));

  p.set('#in', 'not a colour');
  ok(p.msg().toLowerCase().includes('could not be read'), 'rejects nonsense', p.msg());
});

/* ================================================================== */
/* Calculators                                                        */
/* ================================================================== */

test('age-calculator', 'computes exact age', (p, ok) => {
  p.set('#dob', '1990-06-15');
  p.set('#on', '2025-06-14');
  p.click('#go');
  ok(p.text('#r-main').startsWith('34 years'), 'day before birthday is still 34', p.text('#r-main'));

  p.set('#on', '2025-06-15');
  p.click('#go');
  ok(p.text('#r-main') === '35 years, 0 months, 0 days', 'exact birthday is 35', p.text('#r-main'));

  p.set('#on', '1980-01-01');
  p.click('#go');
  ok(p.msg().toLowerCase().includes('before'), 'rejects an end date before birth', p.msg());

  // leap day counting
  p.set('#dob', '2020-01-01');
  p.set('#on', '2020-12-31');
  p.click('#go');
  ok(p.text('#r-leap') === '1', 'counts the 2020 leap day', p.text('#r-leap'));
});

test('percentage-calculator', 'all five modes', (p, ok) => {
  p.set('#a', '15'); p.set('#b', '200');
  p.click('#go');
  ok(p.text('#r-val') === '30.00', '15% of 200 = 30', p.text('#r-val'));

  p.click('[data-m="is"]');
  p.set('#a', '30'); p.set('#b', '200');
  p.click('#go');
  ok(p.text('#r-val') === '15.00%', '30 is 15% of 200', p.text('#r-val'));

  p.click('[data-m="change"]');
  p.set('#a', '200'); p.set('#b', '250');
  p.click('#go');
  ok(p.text('#r-val') === '25.00%', '200 to 250 is +25%', p.text('#r-val'));

  p.set('#a', '0'); p.set('#b', '10');
  p.click('#go');
  ok(p.msg().toLowerCase().includes('undefined'), 'change from zero is rejected', p.msg());

  p.click('[data-m="sub"]');
  p.set('#a', '200'); p.set('#b', '15');
  p.click('#go');
  ok(p.text('#r-val') === '170.00', '200 minus 15% = 170', p.text('#r-val'));
});

test('loan-calculator', 'amortisation is correct', (p, ok) => {
  p.set('#amt', '25000'); p.set('#rate', '7.5');
  p.set('#years', '5'); p.set('#unit', 'y'); p.set('#freq', '12');
  p.click('#go');
  // Known value: 25000 at 7.5%/yr over 60 months = 500.94/month
  const pay = p.text('#r-pay').replace(/[^\d.]/g, '');
  ok(Math.abs(parseFloat(pay) - 500.94) < 0.5, 'monthly payment matches the standard formula', pay);
  ok(p.text('#sched').includes('Year'), 'renders a yearly schedule');

  // zero interest degenerate case
  p.set('#rate', '0');
  p.click('#go');
  const pay0 = parseFloat(p.text('#r-pay').replace(/[^\d.]/g, ''));
  ok(Math.abs(pay0 - 25000 / 60) < 0.5, 'zero interest divides evenly', String(pay0));

  p.set('#amt', '0');
  p.click('#go');
  ok(p.msg().toLowerCase().includes('greater than zero'), 'rejects a zero loan', p.msg());
});

test('mortgage-calculator', 'PITI and overpayment', (p, ok) => {
  p.set('#price', '400000'); p.set('#down', '80000');
  p.set('#rate', '6'); p.set('#years', '30');
  p.set('#tax', '0'); p.set('#ins', '0'); p.set('#extra', '0');
  p.click('#go');
  // 320000 at 6% over 30y = 1918.56
  const pi = parseFloat(p.text('#r-pi').replace(/[^\d.]/g, ''));
  ok(Math.abs(pi - 1918.56) < 1, 'principal and interest matches', String(pi));
  ok(p.text('#s-ltv').startsWith('80'), 'loan-to-value is 80%', p.text('#s-ltv'));

  p.set('#extra', '200');
  p.click('#go');
  ok(p.$('#saving').dataset.show === 'true', 'shows the overpayment saving');
  ok(p.text('#s-payoff') !== '30y 0m', 'overpaying shortens the term', p.text('#s-payoff'));

  p.set('#down', '500000');
  p.click('#go');
  ok(p.msg().toLowerCase().includes('less than'), 'rejects a deposit above the price', p.msg());
});

test('salary-calculator', 'converts between periods', (p, ok) => {
  p.set('#amt', '52000'); p.set('#per', 'year');
  p.set('#hpd', '8'); p.set('#dpw', '5'); p.set('#wpy', '52');
  p.click('#go');
  ok(Math.abs(parseFloat(p.text('#o-week').replace(/[^\d.]/g, '')) - 1000) < 0.01, '52000/year is 1000/week', p.text('#o-week'));
  ok(p.text('#s-hpy') === '2,080', 'standard full-time year is 2080 hours', p.text('#s-hpy'));
  const hourly = parseFloat(p.text('#o-hour').replace(/[^\d.]/g, ''));
  ok(Math.abs(hourly - 25) < 0.01, 'hourly rate is 25', String(hourly));

  p.set('#hpd', '0');
  p.click('#go');
  ok(p.msg().toLowerCase().includes('greater than zero'), 'rejects zero hours', p.msg());
});

test('gst-calculator', 'adds and removes tax', (p, ok) => {
  p.set('#amt', '100'); p.set('#rate', '10');
  p.click('#go');
  ok(p.text('#r-gross').replace(/[^\d.]/g, '') === '110.00', 'adds 10% to 100', p.text('#r-gross'));

  p.click('[data-d="rm"]');
  p.set('#amt', '110'); p.set('#rate', '10');
  p.click('#go');
  ok(p.text('#r-net').replace(/[^\d.]/g, '') === '100.00', 'removes tax by division not subtraction', p.text('#r-net'));

  p.set('#rate', '120');
  p.click('#go');
  ok(p.msg().includes('100%'), 'rejects a rate of 100% or more', p.msg());
});

test('tip-calculator', 'splits correctly', (p, ok) => {
  p.set('#bill', '100'); p.set('#people', '4'); p.set('#tip', '20');
  p.set('#round', 'none');
  ok(p.text('#r-each').replace(/[^\d.]/g, '') === '30.00', '100 + 20% split 4 ways is 30 each', p.text('#r-each'));
  ok(p.text('#r-total').replace(/[^\d.]/g, '') === '120.00', 'total is 120', p.text('#r-total'));

  p.set('#bill', '100.10'); p.set('#people', '3'); p.set('#tip', '0');
  p.set('#round', 'up');
  ok(p.text('#r-each').replace(/[^\d.]/g, '') === '34.00', 'rounds each person up', p.text('#r-each'));
});

test('discount-calculator', 'stacks multiplicatively', (p, ok) => {
  p.set('#a', '120'); p.set('#b', '25'); p.set('#c', '0');
  p.click('#go');
  ok(p.text('#r-main').replace(/[^\d.]/g, '') === '90.00', '25% off 120 is 90', p.text('#r-main'));

  p.set('#a', '100'); p.set('#b', '40'); p.set('#c', '20');
  p.click('#go');
  ok(p.text('#r-main').replace(/[^\d.]/g, '') === '48.00', '40% then 20% gives 48, not 40', p.text('#r-main'));
  ok(p.text('#rows').includes('52'), 'reports the true effective discount of 52%', p.text('#rows').slice(-80));

  p.click('[data-m="orig"]');
  p.set('#a', '90'); p.set('#b', '25');
  p.click('#go');
  ok(p.text('#r-main').replace(/[^\d.]/g, '') === '120.00', 'recovers the original price by division', p.text('#r-main'));
});

test('bmi-calculator', 'metric and imperial agree', (p, ok) => {
  p.set('#cm', '180'); p.set('#kg', '81');
  p.click('#go');
  ok(p.text('#r-bmi') === '25.0', '81kg at 180cm is BMI 25', p.text('#r-bmi'));
  ok(p.text('#r-cat').includes('Overweight'), 'categorises 25 as overweight', p.text('#r-cat'));

  p.click('[data-u="imperial"]');
  p.set('#ft', '5'); p.set('#inch', '9'); p.set('#lb', '160');
  p.click('#go');
  const bmi = parseFloat(p.text('#r-bmi'));
  ok(Math.abs(bmi - 23.6) < 0.2, 'imperial conversion matches (23.6)', p.text('#r-bmi'));

  p.set('#inch', '15');
  p.click('#go');
  ok(p.msg().includes('0 and 11'), 'rejects inches outside 0-11', p.msg());
});

test('time-calculator', 'durations, gaps and totals', (p, ok) => {
  p.set('#h1', '2'); p.set('#m1', '45'); p.set('#s1', '0');
  p.set('#op', '+');
  p.set('#h2', '1'); p.set('#m2', '30'); p.set('#s2', '0');
  p.click('#go');
  ok(p.text('#r-main') === '4h 15m 00s', '2:45 + 1:30 = 4:15', p.text('#r-main'));
  ok(p.text('#r-dec').startsWith('4.25'), 'decimal hours are 4.25', p.text('#r-dec'));

  p.click('[data-m="between"]');
  p.set('#t1', '22:00'); p.set('#t2', '06:00');
  p.click('#go');
  ok(p.text('#r-main') === '8h 00m 00s', 'overnight shift is 8 hours', p.text('#r-main'));

  p.click('[data-m="sum"]');
  p.set('#list', '7:45\n8:15\n7.5');
  p.click('#go');
  ok(p.text('#r-main') === '23h 30m 00s', 'mixed formats total correctly', p.text('#r-main'));

  p.set('#list', '7:45\nnonsense');
  p.click('#go');
  ok(p.msg().toLowerCase().includes('could not read line'), 'reports the bad line', p.msg());
});

test('date-calculator', 'differences and arithmetic', (p, ok) => {
  p.set('#d1', '2025-01-01'); p.set('#d2', '2025-01-31');
  p.set('#incl', false);
  p.click('#go');
  ok(p.text('#r-main').startsWith('30 days'), 'Jan 1 to Jan 31 is 30 days exclusive', p.text('#r-main'));

  p.set('#incl', true);
  p.click('#go');
  ok(p.text('#r-main').startsWith('31 days'), 'inclusive counting adds one', p.text('#r-main'));

  // leap year
  p.set('#incl', false);
  p.set('#d1', '2024-01-01'); p.set('#d2', '2025-01-01');
  p.click('#go');
  ok(p.text('#r-main').startsWith('366'), '2024 is a leap year with 366 days', p.text('#r-main'));

  p.click('[data-m="addsub"]');
  p.set('#base', '2025-01-01'); p.set('#op', '1');
  p.set('#qty', '30'); p.set('#unit', 'd');
  p.click('#go');
  ok(p.text('#rows').includes('2025-01-31'), '30 days after Jan 1 is Jan 31', p.text('#rows').slice(0, 90));

  p.set('#unit', 'bd'); p.set('#qty', '5');
  p.click('#go');
  ok(p.text('#rows').includes('2025-01-08'), '5 business days from Wed Jan 1 is Wed Jan 8', p.text('#rows').slice(0, 90));
});

test('compound-interest-calculator', 'projects growth', (p, ok) => {
  p.set('#p', '10000'); p.set('#rate', '7');
  p.set('#years', '10'); p.set('#contrib', '0');
  p.set('#cfreq', '0'); p.set('#comp', '1'); p.set('#infl', '0');
  p.click('#go');
  // 10000 * 1.07^10 = 19671.51
  const final = parseFloat(p.text('#r-final').replace(/[^\d.]/g, ''));
  ok(Math.abs(final - 19671) < 60, 'lump sum compounds to ~19,671', String(final));

  p.set('#contrib', '100'); p.set('#cfreq', '12');
  p.click('#go');
  const withC = parseFloat(p.text('#r-final').replace(/[^\d.]/g, ''));
  ok(withC > final, 'contributions increase the total', String(withC));
  ok(p.text('#s-dep').replace(/[^\d.]/g, '') === '22000.00', 'total deposited is 10000 + 120*100', p.text('#s-dep'));

  p.set('#years', '200');
  p.click('#go');
  ok(p.msg().includes('100 years'), 'rejects absurd horizons', p.msg());
});

/* ================================================================== */
/* Text tools                                                         */
/* ================================================================== */

test('word-counter', 'counts accurately', (p, ok) => {
  p.set('#in', 'Hello world. This is a test!\n\nSecond paragraph here.');
  ok(p.text('#s-words') === '9', 'counts 9 words', p.text('#s-words'));
  ok(p.text('#s-sent') === '3', 'counts 3 sentences', p.text('#s-sent'));
  ok(p.text('#s-para') === '2', 'counts 2 paragraphs', p.text('#s-para'));

  p.set('#in', 'a b');
  ok(p.text('#s-chars') === '3', 'counts characters including spaces', p.text('#s-chars'));
  ok(p.text('#s-nospace') === '2', 'counts characters excluding spaces', p.text('#s-nospace'));

  p.set('#in', '👍 emoji');
  ok(p.text('#s-chars') === '7', 'emoji counts as one character', p.text('#s-chars'));

  p.set('#in', 'one two three');
  p.set('#target', '10');
  ok(p.text('#prog').includes('7 words to go'), 'target progress is reported', p.text('#prog'));
});

test('character-counter', 'limit tracking and trim', (p, ok) => {
  p.set('#limit', '10');
  p.set('#in', '12345');
  ok(p.text('#meter').includes('5 characters remaining'), 'counts down to the limit', p.text('#meter'));

  p.set('#in', '123456789012');
  ok(p.text('#meter').includes('2 characters over'), 'reports overage', p.text('#meter'));
  ok(p.$('#meter').className.includes('msg-err'), 'flags overage as an error');

  p.click('#trim');
  ok(p.$('#in').value.length === 10, 'trims to the limit exactly', p.$('#in').value);
});

test('case-converter', 'all eight cases', (p, ok) => {
  p.set('#in', 'hello world example');
  const cases = {
    upper: 'HELLO WORLD EXAMPLE',
    lower: 'hello world example',
    camel: 'helloWorldExample',
    pascal: 'HelloWorldExample',
    snake: 'hello_world_example',
    kebab: 'hello-world-example',
    constant: 'HELLO_WORLD_EXAMPLE'
  };
  for (const [k, want] of Object.entries(cases)) {
    p.click(`[data-c="${k}"]`);
    ok(p.text('#out') === want, `${k} produces "${want}"`, p.text('#out'));
  }
  p.click('[data-c="title"]');
  ok(p.text('#out') === 'Hello World Example', 'title case capitalises each word', p.text('#out'));

  // minor words stay lowercase
  p.set('#in', 'the lord of the rings');
  p.click('[data-c="title"]');
  ok(p.text('#out') === 'The Lord of the Rings', 'title case lowercases minor words', p.text('#out'));

  // recognises existing case boundaries
  p.set('#in', 'userAccountId');
  p.click('[data-c="snake"]');
  ok(p.text('#out') === 'user_account_id', 'splits camelCase correctly', p.text('#out'));

  p.set('#in', 'hello. world here');
  p.click('[data-c="sentence"]');
  ok(p.text('#out') === 'Hello. World here', 'sentence case capitalises after a full stop', p.text('#out'));
});

test('remove-duplicate-lines', 'dedupes with options', (p, ok) => {
  p.set('#in', 'apple\nbanana\nApple\nbanana ');
  p.set('#ci', true); p.set('#trim', true);
  p.click('#go');
  ok(p.text('#out') === 'apple\nbanana', 'case-insensitive dedupe keeps 2', p.text('#out'));
  ok(p.text('#s-removed') === '2', 'reports 2 removed', p.text('#s-removed'));

  p.set('#ci', false);
  p.click('#go');
  ok(p.text('#out').split('\n').length === 3, 'case-sensitive keeps Apple separately', p.text('#out'));

  p.set('#ci', true);
  p.set('#mode', 'dupes');
  p.click('#go');
  ok(p.text('#out').split('\n').length === 2, 'duplicates-only mode lists both repeated values', p.text('#out'));
});

test('text-sorter', 'natural ordering', (p, ok) => {
  p.set('#in', 'item10\nitem9\nitem1');
  p.set('#how', 'alpha');
  p.click('#go');
  ok(p.text('#out') === 'item1\nitem9\nitem10', 'sorts numerically within text', p.text('#out'));

  p.set('#in', 'Zebra\napple\nMango');
  p.click('#go');
  ok(p.text('#out') === 'apple\nMango\nZebra', 'case-insensitive alphabetical', p.text('#out'));

  p.set('#in', 'bbb\na\ncc');
  p.set('#how', 'len');
  p.click('#go');
  ok(p.text('#out') === 'a\ncc\nbbb', 'sorts by length', p.text('#out'));

  p.set('#in', 'a\nb\nc');
  p.set('#how', 'shuffle');
  p.click('#go');
  ok(p.text('#out').split('\n').sort().join('') === 'abc', 'shuffle preserves all items');
});

test('text-reverser', 'reverses safely', (p, ok) => {
  p.set('#in', 'hello');
  p.click('[data-r="chars"]');
  ok(p.text('#out') === 'olleh', 'reverses characters', p.text('#out'));

  p.set('#in', 'one two three');
  p.click('[data-r="words"]');
  ok(p.text('#out') === 'three two one', 'reverses word order', p.text('#out'));

  p.set('#in', 'a👍b');
  p.click('[data-r="chars"]');
  ok(p.text('#out') === 'b👍a', 'emoji survives reversal', p.text('#out'));

  p.set('#in', 'A man, a plan, a canal: Panama');
  p.click('#pal');
  ok(p.msg().includes('is a palindrome'), 'detects a palindrome', p.msg());

  p.set('#in', 'not one');
  p.click('#pal');
  ok(p.msg().includes('Not a palindrome'), 'rejects a non-palindrome', p.msg());
});

test('slug-generator', 'transliterates and cleans', (p, ok) => {
  p.set('#in', '10 Réasons Why Café Culture Is Thriving!');
  p.click('#go');
  ok(p.text('#out') === '10-reasons-why-cafe-culture-is-thriving', 'strips accents and punctuation', p.text('#out'));

  p.set('#in', 'Beer & Wine');
  p.click('#go');
  ok(p.text('#out') === 'beer-and-wine', 'converts ampersand to "and"', p.text('#out'));

  p.set('#in', 'Straße Zürich');
  p.click('#go');
  ok(p.text('#out') === 'strasse-zurich', 'handles ß and umlauts', p.text('#out'));

  p.set('#in', 'A\nB');
  p.click('#go');
  ok(p.text('#out') === 'a\nb', 'batch converts each line', p.text('#out'));

  p.set('#in', '日本語');
  p.click('#go');
  ok(p.msg().toLowerCase().includes('empty slug'), 'warns when nothing survives transliteration', p.msg());
});

test('lorem-ipsum-generator', 'generates to spec', (p, ok) => {
  p.set('#unit', 'para'); p.set('#count', '3'); p.set('#classic', true);
  p.click('#go');
  const out = p.text('#out');
  ok(out.split('\n\n').length === 3, 'produces 3 paragraphs', String(out.split('\n\n').length));
  ok(out.startsWith('Lorem ipsum dolor sit amet'), 'starts with the classic opening', out.slice(0, 30));

  p.set('#unit', 'word'); p.set('#count', '25');
  p.click('#go');
  ok(p.text('#out').trim().split(/\s+/).length === 25, 'exact word count mode is exact', p.text('#out'));

  p.set('#unit', 'para'); p.set('#html', true);
  p.click('#go');
  ok(p.text('#out').startsWith('<p>'), 'wraps in HTML when asked', p.text('#out').slice(0, 20));
});

test('diff-checker', 'finds real differences', (p, ok) => {
  p.set('#a', 'one\ntwo\nthree');
  p.set('#b', 'one\n2\nthree\nfour');
  p.click('#go');
  ok(p.text('#s-add') === '2', 'reports 2 added lines', p.text('#s-add'));
  ok(p.text('#s-del') === '1', 'reports 1 removed line', p.text('#s-del'));
  ok(p.text('#s-same') === '2', 'reports 2 unchanged lines', p.text('#s-same'));

  p.set('#a', 'same'); p.set('#b', 'same');
  p.click('#go');
  ok(p.msg().includes('identical'), 'detects identical input', p.msg());

  p.set('#a', '  spaced  '); p.set('#b', 'spaced');
  p.set('#trim', true);
  p.click('#go');
  ok(p.msg().includes('identical'), 'ignores whitespace when asked', p.msg());
});

/* ================================================================== */
/* Converters                                                         */
/* ================================================================== */

test('length-converter', 'exact factors', (p, ok) => {
  p.set('#val', '1'); p.set('#from', 'in'); p.set('#to', 'mm');
  ok(p.text('#r-val').startsWith('25.4'), '1 inch is exactly 25.4mm', p.text('#r-val'));

  p.set('#val', '1'); p.set('#from', 'mi'); p.set('#to', 'km');
  ok(p.text('#r-val').startsWith('1.6093'), '1 mile is 1.609344 km', p.text('#r-val'));

  p.set('#val', '100'); p.set('#from', 'cm'); p.set('#to', 'm');
  ok(p.text('#r-val').startsWith('1 '), '100cm is 1m', p.text('#r-val'));
});

test('weight-converter', 'exact factors', (p, ok) => {
  p.set('#val', '1'); p.set('#from', 'kg'); p.set('#to', 'lb');
  ok(p.text('#r-val').startsWith('2.2046'), '1kg is 2.2046 lb', p.text('#r-val'));

  p.set('#val', '1'); p.set('#from', 'st'); p.set('#to', 'lb');
  ok(p.text('#r-val').startsWith('14'), '1 stone is 14 lb', p.text('#r-val'));

  p.set('#val', '1'); p.set('#from', 'ton_us'); p.set('#to', 'lb');
  ok(p.text('#r-val').replace(/,/g, '').startsWith('2000'), 'a US short ton is 2000 lb', p.text('#r-val'));
});

test('temperature-converter', 'offsets applied correctly', (p, ok) => {
  p.set('#val', '100'); p.set('#from', 'C'); p.set('#to', 'F');
  ok(p.text('#r-val').startsWith('212'), '100C is 212F', p.text('#r-val'));

  p.set('#val', '-40'); p.set('#from', 'C'); p.set('#to', 'F');
  ok(p.text('#r-val').startsWith('-40'), '-40 is the same in both scales', p.text('#r-val'));

  p.set('#val', '0'); p.set('#from', 'C'); p.set('#to', 'K');
  ok(p.text('#r-val').startsWith('273.15'), '0C is 273.15K', p.text('#r-val'));

  p.set('#val', '-500'); p.set('#from', 'C'); p.set('#to', 'F');
  ok(p.msg().toLowerCase().includes('absolute zero'), 'rejects below absolute zero', p.msg());
});

test('speed-converter', 'exact factors', (p, ok) => {
  p.set('#val', '100'); p.set('#from', 'kmh'); p.set('#to', 'mph');
  ok(p.text('#r-val').startsWith('62.13'), '100 km/h is 62.14 mph', p.text('#r-val'));

  p.set('#val', '36'); p.set('#from', 'kmh'); p.set('#to', 'ms');
  ok(p.text('#r-val').startsWith('10'), '36 km/h is 10 m/s', p.text('#r-val'));
});

test('data-storage-converter', 'decimal vs binary', (p, ok) => {
  p.set('#val', '1'); p.set('#from', 'TB'); p.set('#to', 'GiB');
  ok(p.text('#r-val').startsWith('931'), '1 TB is 931 GiB — the missing-space effect', p.text('#r-val'));

  p.set('#val', '1'); p.set('#from', 'B'); p.set('#to', 'b');
  ok(p.text('#r-val').startsWith('8'), '1 byte is 8 bits', p.text('#r-val'));

  p.set('#val', '1'); p.set('#from', 'MiB'); p.set('#to', 'B');
  ok(p.text('#r-val').replace(/,/g, '').startsWith('1048576'), '1 MiB is 1048576 bytes', p.text('#r-val'));
});

test('number-base-converter', 'arbitrary precision', (p, ok) => {
  p.set('#val', '255'); p.set('#from', '10'); p.set('#to', '16');
  ok(p.text('#r-val') === 'FF', '255 decimal is FF hex', p.text('#r-val'));

  p.set('#val', '11111111'); p.set('#from', '2'); p.set('#to', '10');
  ok(p.text('#r-val') === '255', 'binary 11111111 is 255', p.text('#r-val'));

  // beyond Number.MAX_SAFE_INTEGER — must stay exact
  p.set('#val', 'FFFFFFFFFFFFFFFF'); p.set('#from', '16'); p.set('#to', '10');
  ok(p.text('#r-val') === '18446744073709551615', '64-bit value converts exactly', p.text('#r-val'));

  p.set('#val', '9'); p.set('#from', '2'); p.set('#to', '10');
  ok(p.msg().includes('not a valid digit'), 'rejects an out-of-range digit', p.msg());
});

/* ================================================================== */
/* Security & generators                                              */
/* ================================================================== */

test('password-generator', 'entropy and character sets', (p, ok) => {
  p.set('#len', '24');
  p.set('#lower', true); p.set('#upper', true);
  p.set('#digits', true); p.set('#symbols', true);
  p.set('#count', '5');
  p.click('#go');
  const list = p.text('#out').split('\n');
  ok(list.length === 5, 'generates 5 passwords', String(list.length));
  ok(list.every(x => x.length === 24), 'all are 24 characters', String(list[0]?.length));
  ok(new Set(list).size === 5, 'all are distinct');
  ok(parseInt(p.text('#s-bits'), 10) > 130, 'reports high entropy', p.text('#s-bits'));

  p.set('#upper', false); p.set('#digits', false); p.set('#symbols', false);
  p.click('#go');
  ok(/^[a-z]+$/.test(p.text('#out').split('\n')[0]), 'respects the lowercase-only pool', p.text('#out').split('\n')[0]);

  p.set('#lower', false);
  p.click('#go');
  ok(p.msg().toLowerCase().includes('at least one character set'), 'rejects an empty pool', p.msg());

  p.click('[data-t="words"]');
  p.set('#words', '5'); p.set('#sep', '-'); p.set('#wnum', false);
  p.click('#go');
  ok(p.text('#out').split('\n')[0].split('-').length === 5, 'passphrase has 5 words', p.text('#out').split('\n')[0]);
});

test('random-number-generator', 'range and uniqueness', (p, ok) => {
  p.set('#min', '1'); p.set('#max', '6'); p.set('#count', '200');
  p.set('#unique', false);
  p.click('#go');
  const vals = p.w.__last;
  ok(vals.length === 200, 'generates 200 values', String(vals.length));
  ok(vals.every(v => v >= 1 && v <= 6), 'all fall inside the range');
  ok(new Set(vals).size === 6, 'all six faces appear across 200 rolls', String(new Set(vals).size));

  p.set('#count', '49'); p.set('#max', '49'); p.set('#unique', true);
  p.click('#go');
  ok(new Set(p.w.__last).size === 49, 'unique mode returns the full range with no repeats');

  p.set('#count', '50');
  p.click('#go');
  ok(p.msg().toLowerCase().includes('only contains'), 'rejects more unique values than the range holds', p.msg());

  p.set('#min', '100'); p.set('#max', '1'); p.set('#count', '1');
  p.click('#go');
  ok(p.msg().toLowerCase().includes('larger than the maximum'), 'rejects an inverted range', p.msg());
});

/* ================================================================== */
/* Registry-wide structural checks                                    */
/* ================================================================== */

console.log('\n  Structural checks');
{
  const slugs = new Set(TOOLS.map(t => t.slug));
  assert(TOOLS.length >= 60, `registry has at least 60 tools (has ${TOOLS.length})`);

  let linkErrors = 0, orphans = 0;
  const inbound = Object.fromEntries(TOOLS.map(t => [t.slug, 0]));
  for (const t of TOOLS) {
    for (const r of t.related || []) {
      if (!slugs.has(r)) linkErrors++;
      else inbound[r]++;
    }
  }
  assert(linkErrors === 0, 'every related-tool link resolves', String(linkErrors) + ' broken');
  for (const t of TOOLS) if (inbound[t.slug] === 0) orphans++;
  assert(orphans === 0, 'every tool is linked to from at least one other tool',
    TOOLS.filter(t => inbound[t.slug] === 0).map(t => t.slug).join(', '));

  const dupTitles = new Set();
  let dupes = 0;
  for (const t of TOOLS) {
    if (dupTitles.has(t.seoTitle)) dupes++;
    dupTitles.add(t.seoTitle);
  }
  assert(dupes === 0, 'every SEO title is unique');

  const dupDesc = new Set();
  let dd = 0;
  for (const t of TOOLS) {
    if (dupDesc.has(t.metaDescription)) dd++;
    dupDesc.add(t.metaDescription);
  }
  assert(dd === 0, 'every meta description is unique');

  // Guard against the failure mode the brief calls out: thin, templated pages.
  let identicalFaq = 0;
  const faqSeen = new Set();
  for (const t of TOOLS) {
    for (const f of t.faq) {
      const key = f.q.toLowerCase().trim();
      if (faqSeen.has(key)) identicalFaq++;
      faqSeen.add(key);
    }
  }
  assert(identicalFaq <= 6, `FAQs are tool-specific, not templated (${identicalFaq} repeated questions across ${TOOLS.length} tools)`);

  // No tool should claim local processing it does not do.
  let fakeClaims = 0;
  for (const t of TOOLS) {
    const html = String(t.html);
    if (/never leave your device|stay on your device/i.test(html)) {
      const src = String(t.init);
      if (/fetch\s*\(|XMLHttpRequest/.test(src)) fakeClaims++;
    }
  }
  assert(fakeClaims === 0, 'no tool claims local processing while making network calls');
}

/* ================================================================== */

console.log('\n  ' + '─'.repeat(60));
if (failures.length) {
  console.log('\n  FAILURES\n');
  for (const f of failures) {
    console.log('   ✗ ' + f.label);
    if (f.detail) console.log('     ' + String(f.detail).split('\n')[0].slice(0, 150));
  }
}
console.log(`\n  ${passed} passed, ${failed} failed\n`);
process.exit(failed ? 1 : 0);
