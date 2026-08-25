// MEGA TOOLS — Calculators
const DISCLAIMER = '<div class="notice"><strong>Estimate only.</strong> This calculator uses standard published formulas. Banks, lenders, tax authorities and payroll systems apply their own rounding, fees and local rules, so treat the result as a guide rather than a quote.</div>';

export default [

/* ------------------------------------------------------------------ */
{
  slug: 'age-calculator',
  name: 'Age Calculator',
  icon: '🎂',
  category: 'calculators',
  desc: 'Work out an exact age in years, months and days.',
  seoTitle: 'Age Calculator — Calculate Your Exact Age',
  metaDescription: 'Calculate exact age in years, months and days from any date of birth. Includes total days lived, next birthday countdown and leap-year handling.',
  keywords: ['age calculator', 'calculate age', 'how old am i', 'date of birth calculator'],
  popularity: 95, featured: true,
  related: ['date-calculator', 'time-calculator', 'timestamp-converter', 'bmi-calculator', 'time-zone-converter'],
  intro: 'Enter a date of birth to get an exact age using calendar arithmetic — not an approximation based on dividing by 365.25.',
  html: `
<div class="row">
  <div class="field"><label for="dob">Date of birth</label><input type="date" id="dob"></div>
  <div class="field"><label for="on">Age on this date</label><input type="date" id="on"></div>
</div>
<div class="actions">
  <button class="btn btn-primary" id="go">Calculate age</button>
  <button class="btn btn-ghost" id="today">Use today</button>
</div>
<div class="msg" id="msg"></div>
<div id="res" hidden style="margin-top:18px">
  <div class="result-hero"><div class="rv" id="r-main">—</div><div class="rl" id="r-sub">exact age</div></div>
  <div class="stat-grid" style="margin-top:14px">
    <div class="stat"><div class="sv" id="s-months">0</div><div class="sl">Total months</div></div>
    <div class="stat"><div class="sv" id="s-weeks">0</div><div class="sl">Total weeks</div></div>
    <div class="stat"><div class="sv" id="s-days">0</div><div class="sl">Total days</div></div>
    <div class="stat"><div class="sv" id="s-hours">0</div><div class="sl">Total hours</div></div>
  </div>
  <table class="kv" style="margin-top:14px">
    <tr><td>Day of the week born</td><td id="r-dow">—</td></tr>
    <tr><td>Next birthday</td><td id="r-next">—</td></tr>
    <tr><td>Days until then</td><td id="r-until">—</td></tr>
    <tr><td>Leap days lived through</td><td id="r-leap">—</td></tr>
  </table>
</div>`,
  init: function () {
    function iso(d) { return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); }
    MT.$('#on').value = iso(new Date());

    function isLeap(y) { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; }

    function calc() {
      var dobV = MT.$('#dob').value, onV = MT.$('#on').value;
      MT.$('#res').hidden = true;
      if (!dobV) { MT.msg('#msg', 'Enter a date of birth.', 'warn'); return; }
      if (!onV) { MT.msg('#msg', 'Enter the date to calculate the age on.', 'warn'); return; }
      var b = new Date(dobV + 'T00:00:00'), t = new Date(onV + 'T00:00:00');
      if (isNaN(b) || isNaN(t)) { MT.msg('#msg', 'One of those dates could not be read.', 'err'); return; }
      if (t < b) { MT.msg('#msg', 'The end date is before the date of birth. Swap them, or check for a typo in the year.', 'err'); return; }

      var y = t.getFullYear() - b.getFullYear();
      var m = t.getMonth() - b.getMonth();
      var d = t.getDate() - b.getDate();
      if (d < 0) {
        m--;
        d += new Date(t.getFullYear(), t.getMonth(), 0).getDate();
      }
      if (m < 0) { m += 12; y--; }

      var totalDays = Math.round((t - b) / 86400000);
      MT.$('#r-main').textContent = y + (y === 1 ? ' year' : ' years') + ', ' + m + (m === 1 ? ' month' : ' months') + ', ' + d + (d === 1 ? ' day' : ' days');
      MT.$('#r-sub').textContent = 'age on ' + t.toLocaleDateString(undefined, { dateStyle: 'long' });
      MT.$('#s-months').textContent = MT.fmtNum(y * 12 + m);
      MT.$('#s-weeks').textContent = MT.fmtNum(Math.floor(totalDays / 7));
      MT.$('#s-days').textContent = MT.fmtNum(totalDays);
      MT.$('#s-hours').textContent = MT.fmtNum(totalDays * 24);
      MT.$('#r-dow').textContent = b.toLocaleDateString(undefined, { weekday: 'long' });

      var next = new Date(t.getFullYear(), b.getMonth(), b.getDate());
      if (next < t) next = new Date(t.getFullYear() + 1, b.getMonth(), b.getDate());
      MT.$('#r-next').textContent = next.toLocaleDateString(undefined, { dateStyle: 'long' }) + ' (' + next.toLocaleDateString(undefined, { weekday: 'long' }) + ')';
      var until = Math.round((next - t) / 86400000);
      MT.$('#r-until').textContent = until === 0 ? 'Today 🎉' : MT.plural(until, 'day');

      var leaps = 0;
      for (var yy = b.getFullYear(); yy <= t.getFullYear(); yy++) {
        if (!isLeap(yy)) continue;
        var feb29 = new Date(yy, 1, 29);
        if (feb29 >= b && feb29 <= t) leaps++;
      }
      MT.$('#r-leap').textContent = MT.fmtNum(leaps);

      MT.$('#res').hidden = false;
      MT.clearMsg('#msg');
      MT.done();
    }
    MT.on('#go', 'click', MT.guard(calc));
    MT.on('#today', 'click', function () { MT.$('#on').value = iso(new Date()); if (MT.$('#dob').value) calc(); });
    ['#dob', '#on'].forEach(function (s) { MT.on(s, 'change', function () { if (MT.$('#dob').value) calc(); }); });
  },
  howto: [
    'Pick the date of birth.',
    'Leave the second date as today, or change it to work out an age at any other point in time.',
    'Press <b>Calculate age</b> to see the exact years, months and days, plus totals and the next birthday.'
  ],
  sections: [
    { h: 'How exact age is calculated',
      p: `<p>Age is calendar arithmetic, not division. The method here is the same one used on official forms: subtract the years, then the months, then the days, and borrow when a component goes negative.</p>
<p>Borrowing is where implementations differ. If someone born on 31 January is having their age taken on 1 March, the day count borrows from February — which has 28 or 29 days depending on the year. This tool borrows the length of the <em>month before the end date</em>, which is the convention that keeps ages consistent as time passes.</p>
<p>Dividing total days by 365.25 is the shortcut to avoid. It drifts by several days over a lifetime and can report someone as a year older the day before their birthday.</p>` },
    { h: 'Birthdays on 29 February',
      p: `<p>People born on a leap day have a birthday that exists once every four years. Jurisdictions handle it differently — some treat 28 February as the legal birthday in common years, others use 1 March. There is no universal rule.</p>
<p>This tool takes the arithmetic route: it uses the actual date and lets the day component carry the difference. The "next birthday" row shows the nearest real 29 February. If you need a legal answer for a document, check the rule where you live.</p>` }
  ],
  faq: [
    { q: 'Why does it not match the age my government form shows?', a: 'Some official systems count age in completed years only, ignoring months and days. Others use a "reckoning" convention that adds a year at the New Year. The whole-year figure here matches the completed-years method used almost everywhere.' },
    { q: 'Can I calculate age for a past or future date?', a: 'Yes. Change the second date to anything you like — a job start date, a policy renewal, a date decades ahead. The calculation is the same.' },
    { q: 'Does it handle time zones?', a: 'Dates are treated as calendar dates without a time component, which is how birthdays work. Someone born late at night in one zone has the same birthday everywhere.' },
    { q: 'Is my date of birth stored anywhere?', a: 'No. The calculation runs in your browser and nothing is sent, saved or logged.' }
  ]
},

/* ------------------------------------------------------------------ */
{
  slug: 'percentage-calculator',
  name: 'Percentage Calculator',
  icon: '%',
  category: 'calculators',
  desc: 'Five percentage calculations in one place, with the working shown.',
  seoTitle: 'Percentage Calculator — Free Online Percent Calculator',
  metaDescription: 'Calculate percentages online free. Find a percentage of a number, work out what percent one number is of another, or compute percentage increase and decrease.',
  keywords: ['percentage calculator', 'percent calculator', 'percentage increase', 'percentage change', 'what percent of'],
  popularity: 92, featured: true,
  related: ['discount-calculator', 'gst-calculator', 'tip-calculator', 'compound-interest-calculator', 'loan-calculator'],
  intro: 'The five percentage questions people actually ask, each with its formula spelled out so you can check the working.',
  html: `
<div class="field">
  <span class="lbl" id="mo-lbl">What do you want to work out?</span>
  <div class="seg" role="group" aria-labelledby="mo-lbl" style="flex-wrap:wrap">
    <button type="button" data-m="of" aria-pressed="true">X% of Y</button>
    <button type="button" data-m="is" aria-pressed="false">X is what % of Y</button>
    <button type="button" data-m="change" aria-pressed="false">% change</button>
    <button type="button" data-m="add" aria-pressed="false">Add %</button>
    <button type="button" data-m="sub" aria-pressed="false">Subtract %</button>
  </div>
</div>
<div class="row">
  <div class="field"><label for="a" id="la">Percentage</label><input type="number" id="a" step="any" placeholder="15"></div>
  <div class="field"><label for="b" id="lb">Of number</label><input type="number" id="b" step="any" placeholder="200"></div>
</div>
<div class="actions"><button class="btn btn-primary" id="go">Calculate</button><button class="btn btn-ghost" id="clear">Clear</button></div>
<div class="msg" id="msg"></div>
<div id="res" hidden style="margin-top:16px">
  <div class="result-hero"><div class="rv" id="r-val">—</div><div class="rl" id="r-lab">result</div></div>
  <pre class="out" id="r-work" style="margin-top:12px"></pre>
</div>`,
  init: function () {
    var mode = 'of';
    var labels = {
      of:     { a: 'Percentage', b: 'Of number', pa: '15', pb: '200' },
      is:     { a: 'This number', b: 'Is what percent of', pa: '30', pb: '200' },
      change: { a: 'From (original)', b: 'To (new)', pa: '200', pb: '250' },
      add:    { a: 'Starting number', b: 'Add this percent', pa: '200', pb: '15' },
      sub:    { a: 'Starting number', b: 'Subtract this percent', pa: '200', pb: '15' }
    };
    MT.$$('[data-m]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        MT.$$('[data-m]').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        btn.setAttribute('aria-pressed', 'true');
        mode = btn.dataset.m;
        MT.$('#la').textContent = labels[mode].a;
        MT.$('#lb').textContent = labels[mode].b;
        MT.$('#a').placeholder = labels[mode].pa;
        MT.$('#b').placeholder = labels[mode].pb;
        MT.$('#res').hidden = true;
        MT.clearMsg('#msg');
      });
    });

    function calc() {
      var a = MT.num('#a', NaN), b = MT.num('#b', NaN);
      MT.$('#res').hidden = true;
      if (!isFinite(a) || !isFinite(b)) { MT.msg('#msg', 'Enter a number in both boxes.', 'warn'); return; }
      var val, lab, work;
      if (mode === 'of') {
        val = a / 100 * b;
        lab = a + '% of ' + MT.fmtNum(b, 2);
        work = a + '% × ' + b + '\n= (' + a + ' ÷ 100) × ' + b + '\n= ' + (a / 100) + ' × ' + b + '\n= ' + MT.fmtNum(val, 4);
      } else if (mode === 'is') {
        if (b === 0) { MT.msg('#msg', 'You cannot express a number as a percentage of zero.', 'err'); return; }
        val = a / b * 100;
        lab = MT.fmtNum(a, 2) + ' as a percent of ' + MT.fmtNum(b, 2);
        work = '(' + a + ' ÷ ' + b + ') × 100\n= ' + MT.fmtNum(a / b, 6) + ' × 100\n= ' + MT.fmtNum(val, 4) + '%';
      } else if (mode === 'change') {
        if (a === 0) { MT.msg('#msg', 'Percentage change from zero is undefined — any increase from nothing is infinite.', 'err'); return; }
        val = (b - a) / Math.abs(a) * 100;
        lab = (val >= 0 ? 'increase' : 'decrease') + ' from ' + MT.fmtNum(a, 2) + ' to ' + MT.fmtNum(b, 2);
        work = '((' + b + ' − ' + a + ') ÷ |' + a + '|) × 100\n= (' + MT.fmtNum(b - a, 4) + ' ÷ ' + Math.abs(a) + ') × 100\n= ' + MT.fmtNum(val, 4) + '%';
      } else if (mode === 'add') {
        val = a * (1 + b / 100);
        lab = MT.fmtNum(a, 2) + ' plus ' + b + '%';
        work = a + ' × (1 + ' + b + '/100)\n= ' + a + ' × ' + (1 + b / 100) + '\n= ' + MT.fmtNum(val, 4) + '\n\nAmount added: ' + MT.fmtNum(a * b / 100, 4);
      } else {
        val = a * (1 - b / 100);
        lab = MT.fmtNum(a, 2) + ' minus ' + b + '%';
        work = a + ' × (1 − ' + b + '/100)\n= ' + a + ' × ' + (1 - b / 100) + '\n= ' + MT.fmtNum(val, 4) + '\n\nAmount removed: ' + MT.fmtNum(a * b / 100, 4);
      }
      MT.$('#r-val').textContent = mode === 'is' || mode === 'change' ? MT.fmtNum(val, 2) + '%' : MT.fmtNum(val, 2);
      MT.$('#r-lab').textContent = lab;
      MT.$('#r-work').textContent = work;
      MT.$('#res').hidden = false;
      MT.clearMsg('#msg');
      MT.done({ mode: mode });
    }
    MT.on('#go', 'click', MT.guard(calc));
    ['#a', '#b'].forEach(function (s) {
      MT.on(s, 'input', function () { if (!MT.$('#res').hidden) calc(); });
      MT.on(s, 'keydown', function (e) { if (e.key === 'Enter') calc(); });
    });
    MT.on('#clear', 'click', function () {
      MT.$('#a').value = ''; MT.$('#b').value = '';
      MT.$('#res').hidden = true; MT.clearMsg('#msg'); MT.$('#a').focus();
    });
  },
  howto: [
    'Choose the type of calculation from the buttons at the top.',
    'Fill in the two numbers — the labels change to match the mode you picked.',
    'Press <b>Calculate</b>. The working is shown underneath so you can verify it.'
  ],
  sections: [
    { h: 'The five formulas',
      p: `<table>
<tr><th>Question</th><th>Formula</th></tr>
<tr><td>What is X% of Y?</td><td>(X ÷ 100) × Y</td></tr>
<tr><td>X is what percent of Y?</td><td>(X ÷ Y) × 100</td></tr>
<tr><td>Percentage change from A to B</td><td>((B − A) ÷ |A|) × 100</td></tr>
<tr><td>Add X% to Y</td><td>Y × (1 + X ÷ 100)</td></tr>
<tr><td>Subtract X% from Y</td><td>Y × (1 − X ÷ 100)</td></tr>
</table>` },
    { h: 'Percentage points are not percentages',
      p: `<p>If a rate moves from 4% to 6%, that is a rise of two <em>percentage points</em> — but a 50% <em>increase</em>. Both statements are true and they describe the same change. Headlines routinely blur the two, usually in whichever direction sounds more dramatic.</p>
<p>The rule: percentage points measure the arithmetic gap between two percentages; percentage change measures the proportional difference. When the underlying quantity is already a percentage, say which one you mean.</p>` },
    { h: 'Why increases and decreases do not cancel',
      p: `<p>Take 100, add 20%, then subtract 20%. You get 96, not 100. The increase is calculated on 100 and the decrease on 120, so the two operations work on different bases.</p>
<p>To reverse a 20% increase you divide by 1.20, which is a 16.67% decrease. This is why a shop's "50% off, then 20% off" is a 60% discount rather than 70% — and why a stock that falls 50% needs to double to recover.</p>` }
  ],
  faq: [
    { q: 'How do I reverse a percentage increase?', a: 'Divide rather than subtract. If a price of 120 includes a 20% markup, the original is 120 ÷ 1.20 = 100. Subtracting 20% from 120 gives 96, which is wrong.' },
    { q: 'What does a negative percentage change mean?', a: 'The value fell. Change from 250 to 200 is −20%, meaning a decrease of one fifth.' },
    { q: 'Why is percentage change from zero undefined?', a: 'The formula divides by the starting value. Any growth from zero is infinite in proportional terms, so report it as an absolute change instead.' },
    { q: 'How many decimal places does it show?', a: 'Results are displayed to two places, and the working shows up to six so you can see rounding before it happens.' }
  ]
},

/* ------------------------------------------------------------------ */
{
  slug: 'loan-calculator',
  name: 'Loan Calculator',
  icon: '💰',
  category: 'calculators',
  desc: 'Monthly payment, total interest and full amortisation schedule.',
  seoTitle: 'Loan Calculator — Monthly Payment and Interest',
  metaDescription: 'Calculate loan repayments online free. See your monthly payment, total interest, and a full amortisation schedule showing principal and interest each period.',
  keywords: ['loan calculator', 'loan repayment calculator', 'monthly payment calculator', 'amortisation schedule'],
  popularity: 90, featured: true,
  related: ['mortgage-calculator', 'compound-interest-calculator', 'percentage-calculator', 'salary-calculator', 'gst-calculator'],
  intro: 'Enter an amount, a rate and a term to see what a loan actually costs — including a year-by-year breakdown of how much goes to interest.',
  html: DISCLAIMER + `
<div class="row">
  <div class="field"><label for="amt">Loan amount</label><input type="number" id="amt" value="25000" step="any" min="0"></div>
  <div class="field"><label for="rate">Annual interest rate (%)</label><input type="number" id="rate" value="7.5" step="any" min="0"></div>
</div>
<div class="row">
  <div class="field"><label for="years">Term</label><input type="number" id="years" value="5" step="any" min="0"></div>
  <div class="field"><label for="unit">Term unit</label><select id="unit"><option value="y">Years</option><option value="m">Months</option></select></div>
  <div class="field"><label for="freq">Payment frequency</label>
    <select id="freq"><option value="12">Monthly</option><option value="26">Fortnightly</option><option value="52">Weekly</option><option value="4">Quarterly</option></select>
  </div>
</div>
<div class="field"><label for="cur">Currency</label>
  <select id="cur"><option>USD</option><option>EUR</option><option>GBP</option><option>CAD</option><option>AUD</option><option>INR</option><option>JPY</option><option>NZD</option><option>ZAR</option><option>SGD</option></select>
</div>
<div class="actions"><button class="btn btn-primary" id="go">Calculate</button><button class="btn" id="dl">Download schedule (CSV)</button></div>
<div class="msg" id="msg"></div>
<div id="res" hidden style="margin-top:18px">
  <div class="result-hero"><div class="rv" id="r-pay">—</div><div class="rl" id="r-payl">per payment</div></div>
  <div class="stat-grid" style="margin-top:14px">
    <div class="stat"><div class="sv" id="s-total">—</div><div class="sl">Total repaid</div></div>
    <div class="stat"><div class="sv" id="s-int">—</div><div class="sl">Total interest</div></div>
    <div class="stat"><div class="sv" id="s-pct">—</div><div class="sl">Interest as % of loan</div></div>
    <div class="stat"><div class="sv" id="s-n">—</div><div class="sl">Payments</div></div>
  </div>
  <h3>Yearly summary</h3>
  <div style="overflow-x:auto"><table class="kv" id="sched"></table></div>
</div>`,
  init: function () {
    var lastSchedule = null;

    function build() {
      var P = MT.num('#amt', NaN), annual = MT.num('#rate', NaN), term = MT.num('#years', NaN);
      var perYear = parseInt(MT.$('#freq').value, 10);
      var cur = MT.$('#cur').value;
      if (!isFinite(P) || P <= 0) { MT.msg('#msg', 'Enter a loan amount greater than zero.', 'warn'); return null; }
      if (!isFinite(annual) || annual < 0) { MT.msg('#msg', 'Enter an interest rate of zero or more.', 'warn'); return null; }
      if (!isFinite(term) || term <= 0) { MT.msg('#msg', 'Enter a loan term greater than zero.', 'warn'); return null; }
      var months = MT.$('#unit').value === 'y' ? term * 12 : term;
      var n = Math.round(months / 12 * perYear);
      if (n < 1) { MT.msg('#msg', 'That term is too short for the chosen payment frequency.', 'warn'); return null; }
      if (n > 3000) { MT.msg('#msg', 'That works out to more than 3,000 payments. Check the term and frequency.', 'warn'); return null; }

      var i = annual / 100 / perYear;
      var pay = i === 0 ? P / n : P * i / (1 - Math.pow(1 + i, -n));

      var bal = P, rows = [], totalInt = 0;
      for (var k = 1; k <= n; k++) {
        var interest = bal * i;
        var principal = pay - interest;
        if (k === n) { principal = bal; pay = bal + interest; }
        bal = Math.max(0, bal - principal);
        totalInt += interest;
        rows.push({ n: k, payment: principal + interest, interest: interest, principal: principal, balance: bal });
      }
      return { P: P, n: n, perYear: perYear, pay: rows[0].payment, rows: rows, totalInt: totalInt, cur: cur };
    }

    function calc() {
      MT.$('#res').hidden = true;
      var r = build();
      if (!r) return;
      lastSchedule = r;
      MT.clearMsg('#msg');
      var total = r.P + r.totalInt;
      MT.$('#r-pay').textContent = MT.money(r.pay, r.cur);
      MT.$('#r-payl').textContent = ({ 12: 'per month', 26: 'per fortnight', 52: 'per week', 4: 'per quarter' })[r.perYear];
      MT.$('#s-total').textContent = MT.money(total, r.cur);
      MT.$('#s-int').textContent = MT.money(r.totalInt, r.cur);
      MT.$('#s-pct').textContent = MT.pct(r.totalInt / r.P * 100, 1);
      MT.$('#s-n').textContent = MT.fmtNum(r.n);

      var byYear = {}, order = [];
      r.rows.forEach(function (row) {
        var y = Math.ceil(row.n / r.perYear);
        if (!byYear[y]) { byYear[y] = { int: 0, prin: 0, bal: 0 }; order.push(y); }
        byYear[y].int += row.interest;
        byYear[y].prin += row.principal;
        byYear[y].bal = row.balance;
      });
      var head = '<tr><td style="color:var(--ink);font-weight:600">Year</td><td style="text-align:right">Interest</td><td style="text-align:right">Principal</td><td style="text-align:right">Balance</td></tr>';
      MT.$('#sched').innerHTML = head + order.map(function (y) {
        var v = byYear[y];
        return '<tr><td>' + y + '</td><td style="text-align:right">' + MT.money(v.int, r.cur) +
          '</td><td style="text-align:right">' + MT.money(v.prin, r.cur) +
          '</td><td style="text-align:right">' + MT.money(v.bal, r.cur) + '</td></tr>';
      }).join('');
      MT.$('#res').hidden = false;
      MT.done();
    }

    MT.on('#go', 'click', MT.guard(calc));
    MT.$$('#amt, #rate, #years, #unit, #freq, #cur').forEach(function (el) {
      el.addEventListener('change', function () { if (!MT.$('#res').hidden) calc(); });
    });
    MT.on('#dl', 'click', function () {
      if (!lastSchedule) { MT.toast('Calculate first'); return; }
      var csv = 'Payment,Amount,Interest,Principal,Balance\n' + lastSchedule.rows.map(function (r) {
        return [r.n, r.payment.toFixed(2), r.interest.toFixed(2), r.principal.toFixed(2), r.balance.toFixed(2)].join(',');
      }).join('\n');
      MT.download(csv, 'loan-schedule.csv', 'text/csv');
    });
    calc();
  },
  howto: [
    'Enter the amount you are borrowing and the annual interest rate quoted by the lender.',
    'Set the term and how often you will pay. Fortnightly and weekly schedules pay a loan off faster than monthly.',
    'Press <b>Calculate</b>, then download the full schedule as a CSV if you want to model it further.'
  ],
  sections: [
    { h: 'The amortisation formula',
      p: `<p>Every fixed-rate instalment loan uses the same equation:</p>
<pre>Payment = P × i ÷ (1 − (1 + i)⁻ⁿ)</pre>
<p>where <b>P</b> is the amount borrowed, <b>i</b> is the interest rate for one period (annual rate ÷ payments per year) and <b>n</b> is the total number of payments. The result is the constant amount that reduces the balance to exactly zero after n payments.</p>
<p>The payment stays the same but its composition shifts. Early payments are mostly interest because interest is charged on a large outstanding balance; later payments are mostly principal. That is why overpaying early saves far more than overpaying late.</p>` },
    { h: 'What this calculator does not include',
      p: `<p>The figures cover principal and interest only. Real loan agreements often add:</p>
<ul>
<li>Origination, arrangement or documentation fees, sometimes deducted from the amount you receive</li>
<li>Compulsory insurance premiums</li>
<li>Late payment and early repayment charges</li>
<li>Different compounding conventions — some lenders compound daily and charge monthly</li>
</ul>
<p>This is why the APR quoted on an agreement is usually higher than the headline interest rate: APR folds compulsory fees into a single comparable figure. Compare offers on APR, not on the rate.</p>` }
  ],
  faq: [
    { q: 'Why does the last payment differ slightly?', a: 'Rounding each payment to the cent leaves a small residue. The schedule adjusts the final payment to clear the balance exactly, which is what lenders do too.' },
    { q: 'Does paying fortnightly really cost less?', a: 'Yes, for two reasons. Interest accrues on a balance that drops more often, and 26 fortnightly payments equal 13 monthly payments a year rather than 12. Check that your lender applies extra payments to principal.' },
    { q: 'What if my rate is variable?', a: 'Model it at the current rate to get a baseline, then run it again at a rate two or three points higher to see how much headroom you have. A variable loan cannot be projected exactly.' },
    { q: 'Can I model an interest-only loan?', a: 'Not directly. For an interest-only period, the payment is simply the balance times the periodic rate, with no principal reduction — so the balance at the end equals the amount borrowed.' }
  ]
},

/* ------------------------------------------------------------------ */
{
  slug: 'mortgage-calculator',
  name: 'Mortgage Calculator',
  icon: '🏠',
  category: 'calculators',
  desc: 'Full mortgage payment with tax, insurance and deposit.',
  seoTitle: 'Mortgage Calculator — Monthly Payment Estimator',
  metaDescription: 'Estimate your monthly mortgage payment including principal, interest, property tax and insurance. See total interest and the effect of overpaying.',
  keywords: ['mortgage calculator', 'home loan calculator', 'monthly mortgage payment', 'piti calculator'],
  popularity: 91, featured: true,
  related: ['loan-calculator', 'compound-interest-calculator', 'percentage-calculator', 'salary-calculator', 'discount-calculator'],
  intro: 'Work out the full monthly cost of a home, not just the loan portion — plus what a monthly overpayment would save you.',
  html: DISCLAIMER + `
<div class="row">
  <div class="field"><label for="price">Property price</label><input type="number" id="price" value="400000" step="any" min="0"></div>
  <div class="field"><label for="down">Deposit / down payment</label><input type="number" id="down" value="80000" step="any" min="0"></div>
</div>
<div class="row">
  <div class="field"><label for="rate">Interest rate (% per year)</label><input type="number" id="rate" value="6.25" step="any" min="0"></div>
  <div class="field"><label for="years">Term (years)</label><input type="number" id="years" value="30" step="any" min="1"></div>
</div>
<div class="row">
  <div class="field"><label for="tax">Property tax (per year)</label><input type="number" id="tax" value="4000" step="any" min="0"></div>
  <div class="field"><label for="ins">Home insurance (per year)</label><input type="number" id="ins" value="1500" step="any" min="0"></div>
</div>
<div class="row">
  <div class="field"><label for="extra">Extra payment each month</label><input type="number" id="extra" value="0" step="any" min="0"></div>
  <div class="field"><label for="cur">Currency</label>
    <select id="cur"><option>USD</option><option>EUR</option><option>GBP</option><option>CAD</option><option>AUD</option><option>INR</option><option>NZD</option><option>ZAR</option></select>
  </div>
</div>
<div class="actions"><button class="btn btn-primary" id="go">Calculate</button></div>
<div class="msg" id="msg"></div>
<div id="res" hidden style="margin-top:18px">
  <div class="result-hero"><div class="rv" id="r-total">—</div><div class="rl">total monthly payment</div></div>
  <table class="kv" style="margin-top:14px">
    <tr><td>Principal and interest</td><td id="r-pi">—</td></tr>
    <tr><td>Property tax</td><td id="r-tax">—</td></tr>
    <tr><td>Insurance</td><td id="r-ins">—</td></tr>
    <tr><td>Extra payment</td><td id="r-extra">—</td></tr>
  </table>
  <div class="stat-grid" style="margin-top:14px">
    <div class="stat"><div class="sv" id="s-amt">—</div><div class="sl">Amount borrowed</div></div>
    <div class="stat"><div class="sv" id="s-ltv">—</div><div class="sl">Loan to value</div></div>
    <div class="stat"><div class="sv" id="s-int">—</div><div class="sl">Total interest</div></div>
    <div class="stat"><div class="sv" id="s-payoff">—</div><div class="sl">Paid off in</div></div>
  </div>
  <div class="msg msg-ok" id="saving" data-show="false" style="margin-top:14px"></div>
</div>`,
  init: function () {
    function calc() {
      var price = MT.num('#price', NaN), down = MT.num('#down', 0), rate = MT.num('#rate', NaN),
          years = MT.num('#years', NaN), tax = MT.num('#tax', 0), ins = MT.num('#ins', 0),
          extra = MT.num('#extra', 0), cur = MT.$('#cur').value;
      MT.$('#res').hidden = true;
      if (!isFinite(price) || price <= 0) { MT.msg('#msg', 'Enter the property price.', 'warn'); return; }
      if (down < 0 || down >= price) { MT.msg('#msg', 'The deposit must be less than the property price.', 'err'); return; }
      if (!isFinite(rate) || rate < 0) { MT.msg('#msg', 'Enter an interest rate.', 'warn'); return; }
      if (!isFinite(years) || years <= 0) { MT.msg('#msg', 'Enter a term in years.', 'warn'); return; }

      var P = price - down, i = rate / 100 / 12, n = Math.round(years * 12);
      var pi = i === 0 ? P / n : P * i / (1 - Math.pow(1 + i, -n));

      function amortise(payment) {
        var bal = P, interest = 0, k = 0;
        while (bal > 0.005 && k < 12000) {
          var int = bal * i;
          var prin = payment - int;
          if (prin <= 0) return null;
          bal -= prin; interest += int; k++;
        }
        return { months: k, interest: interest };
      }
      var base = amortise(pi);
      var withExtra = extra > 0 ? amortise(pi + extra) : base;
      if (!base) { MT.msg('#msg', 'At that rate the payment never covers the interest. Check the figures.', 'err'); return; }

      var monthlyTax = tax / 12, monthlyIns = ins / 12;
      var total = pi + monthlyTax + monthlyIns + extra;
      MT.$('#r-total').textContent = MT.money(total, cur);
      MT.$('#r-pi').textContent = MT.money(pi, cur);
      MT.$('#r-tax').textContent = MT.money(monthlyTax, cur);
      MT.$('#r-ins').textContent = MT.money(monthlyIns, cur);
      MT.$('#r-extra').textContent = MT.money(extra, cur);
      MT.$('#s-amt').textContent = MT.money(P, cur);
      MT.$('#s-ltv').textContent = MT.pct(P / price * 100, 1);
      MT.$('#s-int').textContent = MT.money(withExtra.interest, cur);
      var mo = withExtra.months;
      MT.$('#s-payoff').textContent = Math.floor(mo / 12) + 'y ' + (mo % 12) + 'm';

      var sv = MT.$('#saving');
      if (extra > 0 && base) {
        var saved = base.interest - withExtra.interest;
        var faster = base.months - withExtra.months;
        sv.textContent = 'Paying ' + MT.money(extra, cur) + ' extra each month saves ' + MT.money(saved, cur) +
          ' in interest and clears the mortgage ' + Math.floor(faster / 12) + ' years ' + (faster % 12) + ' months early.';
        sv.dataset.show = 'true';
      } else sv.dataset.show = 'false';

      if (P / price > 0.8) {
        MT.msg('#msg', 'Your loan-to-value is above 80%. Most lenders require mortgage insurance at this level, which is an extra monthly cost not included above.', 'warn');
      } else MT.clearMsg('#msg');

      MT.$('#res').hidden = false;
      MT.done();
    }
    MT.on('#go', 'click', MT.guard(calc));
    MT.$$('#price, #down, #rate, #years, #tax, #ins, #extra, #cur').forEach(function (el) {
      el.addEventListener('change', function () { if (!MT.$('#res').hidden) calc(); });
    });
    calc();
  },
  howto: [
    'Enter the property price and your deposit. The amount borrowed is the difference.',
    'Add the interest rate, term, and your estimated annual property tax and insurance.',
    'Optionally add a monthly overpayment to see how much interest it saves and how many years it removes.'
  ],
  sections: [
    { h: 'What makes up a mortgage payment',
      p: `<p>A lender quotes principal and interest, but the amount leaving your account each month is usually larger. In the United States the shorthand is PITI:</p>
<ul>
<li><b>Principal</b> — repaying what you borrowed</li>
<li><b>Interest</b> — the cost of borrowing it</li>
<li><b>Taxes</b> — property tax, often collected monthly into an escrow account</li>
<li><b>Insurance</b> — buildings insurance, plus mortgage insurance if your deposit is small</li>
</ul>
<p>Not included here: service charges or HOA fees, ground rent, maintenance, and the closing or completion costs due at purchase. A common planning rule is to budget around 1% of the property value each year for maintenance.</p>` },
    { h: 'Why the deposit matters more than the rate',
      p: `<p>Loan-to-value is the loan divided by the property price. Cross above 80% and most lenders require mortgage insurance — a monthly premium that protects the lender, not you, and can add a meaningful amount to the payment for years.</p>
<p>Loan-to-value also determines which rate tier you are offered. Moving from an 85% to an 80% loan often unlocks a better rate <em>and</em> removes the insurance, so the effective return on the extra deposit is larger than it first appears.</p>` },
    { h: 'The arithmetic of overpaying',
      p: `<p>An extra payment goes entirely to principal, so it removes not just that amount but every future interest charge that balance would have generated. On a 30-year mortgage the effect compounds dramatically — a modest monthly overpayment can remove several years from the term.</p>
<p>Before committing, check two things: whether your agreement has early repayment charges, and whether your lender applies overpayments to principal immediately or holds them against the next scheduled payment. The second makes a real difference.</p>` }
  ],
  faq: [
    { q: 'Is this what a lender will offer me?', a: 'No. It shows the arithmetic of a loan with the figures you enter. An actual offer depends on income, credit history, affordability testing, the valuation and the lender\'s own criteria.' },
    { q: 'Does it include mortgage insurance?', a: 'No, but it warns you when your loan-to-value exceeds 80%, which is the usual threshold. Premiums vary widely by lender and country, so add yours to the insurance field.' },
    { q: 'How much house can I afford?', a: 'A common guideline is that housing costs stay under 28% of gross income and all debt under 36%. These are rules of thumb — lenders in different countries test affordability differently.' },
    { q: 'Should I choose a 15-year or 30-year term?', a: 'A 15-year term has much higher monthly payments but far less total interest. The 30-year gives flexibility: you can overpay to mimic a shorter term while keeping the option to fall back to the lower payment.' }
  ]
},

/* ------------------------------------------------------------------ */
{
  slug: 'salary-calculator',
  name: 'Salary Calculator',
  icon: '💼',
  category: 'calculators',
  desc: 'Convert between hourly, weekly, monthly and annual pay.',
  seoTitle: 'Salary Calculator — Hourly to Annual Pay Converter',
  metaDescription: 'Convert salary between hourly, daily, weekly, monthly and yearly. Account for holiday, unpaid leave and overtime to find your real hourly rate.',
  keywords: ['salary calculator', 'hourly to salary', 'annual salary calculator', 'pay converter', 'hourly rate calculator'],
  popularity: 86,
  related: ['percentage-calculator', 'time-calculator', 'loan-calculator', 'gst-calculator', 'compound-interest-calculator'],
  intro: 'Convert pay between every common period. Adjust hours, holiday and unpaid weeks to see what an offer is really worth per hour.',
  html: `
<div class="notice">This converts gross pay between time periods. It does not calculate income tax or social contributions, which depend on where you live, your allowances and your circumstances.</div>
<div class="row">
  <div class="field"><label for="amt">Amount</label><input type="number" id="amt" value="60000" step="any" min="0"></div>
  <div class="field"><label for="per">Per</label>
    <select id="per"><option value="year">Year</option><option value="month">Month</option><option value="week">Week</option><option value="day">Day</option><option value="hour">Hour</option></select>
  </div>
  <div class="field"><label for="cur">Currency</label>
    <select id="cur"><option>USD</option><option>EUR</option><option>GBP</option><option>CAD</option><option>AUD</option><option>INR</option><option>NZD</option><option>ZAR</option><option>SGD</option></select>
  </div>
</div>
<div class="row">
  <div class="field"><label for="hpd">Hours per day</label><input type="number" id="hpd" value="8" step="any" min="0.5" max="24"></div>
  <div class="field"><label for="dpw">Days per week</label><input type="number" id="dpw" value="5" step="any" min="0.5" max="7"></div>
  <div class="field"><label for="wpy">Paid weeks per year</label><input type="number" id="wpy" value="52" step="any" min="1" max="52"></div>
</div>
<div class="actions"><button class="btn btn-primary" id="go">Convert</button></div>
<div class="msg" id="msg"></div>
<div id="res" hidden style="margin-top:18px">
  <table class="kv">
    <tr><td>Hourly</td><td id="o-hour">—</td></tr>
    <tr><td>Daily</td><td id="o-day">—</td></tr>
    <tr><td>Weekly</td><td id="o-week">—</td></tr>
    <tr><td>Fortnightly</td><td id="o-fort">—</td></tr>
    <tr><td>Monthly</td><td id="o-month">—</td></tr>
    <tr><td>Quarterly</td><td id="o-quarter">—</td></tr>
    <tr><td>Annually</td><td id="o-year">—</td></tr>
  </table>
  <div class="stat-grid" style="margin-top:14px">
    <div class="stat"><div class="sv" id="s-hpy">—</div><div class="sl">Hours per year</div></div>
    <div class="stat"><div class="sv" id="s-hpw">—</div><div class="sl">Hours per week</div></div>
    <div class="stat"><div class="sv" id="s-dpy">—</div><div class="sl">Working days per year</div></div>
  </div>
</div>`,
  init: function () {
    function calc() {
      var amt = MT.num('#amt', NaN), per = MT.$('#per').value, cur = MT.$('#cur').value;
      var hpd = MT.num('#hpd', 8), dpw = MT.num('#dpw', 5), wpy = MT.num('#wpy', 52);
      MT.$('#res').hidden = true;
      if (!isFinite(amt) || amt < 0) { MT.msg('#msg', 'Enter a pay amount.', 'warn'); return; }
      if (hpd <= 0 || dpw <= 0 || wpy <= 0) { MT.msg('#msg', 'Hours, days and weeks must all be greater than zero.', 'err'); return; }
      if (hpd > 24) { MT.msg('#msg', 'There are only 24 hours in a day.', 'err'); return; }
      if (dpw > 7) { MT.msg('#msg', 'There are only 7 days in a week.', 'err'); return; }

      var hoursPerWeek = hpd * dpw;
      var hoursPerYear = hoursPerWeek * wpy;
      var annual;
      if (per === 'year') annual = amt;
      else if (per === 'month') annual = amt * 12;
      else if (per === 'week') annual = amt * wpy;
      else if (per === 'day') annual = amt * dpw * wpy;
      else annual = amt * hoursPerYear;

      MT.$('#o-hour').textContent = MT.money(annual / hoursPerYear, cur);
      MT.$('#o-day').textContent = MT.money(annual / (dpw * wpy), cur);
      MT.$('#o-week').textContent = MT.money(annual / wpy, cur);
      MT.$('#o-fort').textContent = MT.money(annual / 26, cur);
      MT.$('#o-month').textContent = MT.money(annual / 12, cur);
      MT.$('#o-quarter').textContent = MT.money(annual / 4, cur);
      MT.$('#o-year').textContent = MT.money(annual, cur);
      MT.$('#s-hpy').textContent = MT.fmtNum(hoursPerYear, 0);
      MT.$('#s-hpw').textContent = MT.fmtNum(hoursPerWeek, 1);
      MT.$('#s-dpy').textContent = MT.fmtNum(dpw * wpy, 0);
      MT.$('#res').hidden = false;
      MT.clearMsg('#msg');
      MT.done();
    }
    MT.on('#go', 'click', MT.guard(calc));
    MT.$$('#amt, #per, #cur, #hpd, #dpw, #wpy').forEach(function (el) {
      el.addEventListener('change', function () { if (!MT.$('#res').hidden) calc(); });
    });
    calc();
  },
  howto: [
    'Enter your pay and choose the period it covers.',
    'Adjust hours per day, days per week and paid weeks per year to match your contract.',
    'Press <b>Convert</b> to see the equivalent in every other period.'
  ],
  sections: [
    { h: 'Why "paid weeks per year" changes everything',
      p: `<p>A salaried employee is normally paid for all 52 weeks, including holidays. A contractor who takes four weeks off unpaid is paid for 48. Comparing their rates without adjusting for this overstates the contractor's income by about 8%.</p>
<p>The standard full-time year is 2,080 hours — 40 hours × 52 weeks. This is the figure behind most quick conversions, including the familiar shortcut of halving an hourly rate and reading it as thousands per year: $30/hour ≈ $60,000/year.</p>` },
    { h: 'Comparing an offer honestly',
      p: `<p>Two roles with identical salaries can differ substantially in what they actually pay per hour. Before comparing, normalise for:</p>
<ul>
<li><b>Contracted hours.</b> A 37.5-hour week is 6% more per hour than a 40-hour week at the same salary.</li>
<li><b>Unpaid overtime.</b> Salaried roles that routinely run to 50 hours cut the effective rate by a fifth.</li>
<li><b>Paid leave and public holidays.</b> Six weeks off is worth roughly 12% of salary against a role with two.</li>
<li><b>Employer pension contributions</b>, bonuses and benefits, none of which appear in the headline figure.</li>
</ul>` }
  ],
  faq: [
    { q: 'Why is monthly pay not four times weekly?', a: 'A month averages 4.33 weeks. Multiplying weekly pay by four understates annual income by about 8%. This tool divides annual pay by 12 instead, which is exact.' },
    { q: 'Does it calculate take-home pay?', a: 'No. Net pay depends on your tax jurisdiction, allowances, pension contributions and personal circumstances. Use your national tax authority\'s calculator for an accurate net figure.' },
    { q: 'How do I work out an overtime rate?', a: 'Take the hourly figure and multiply by your overtime multiplier — typically 1.5 for time-and-a-half or 2 for double time.' },
    { q: 'What if my hours vary week to week?', a: 'Use your average over a representative few months. For irregular work, enter a realistic annual total in the hours fields rather than a typical good week.' }
  ]
},

/* ------------------------------------------------------------------ */
{
  slug: 'gst-calculator',
  name: 'GST / VAT Calculator',
  icon: '🧾',
  category: 'calculators',
  desc: 'Add or remove sales tax at any rate, with the net split shown.',
  seoTitle: 'GST Calculator — Add or Remove GST and VAT Online',
  metaDescription: 'Calculate GST, VAT or sales tax online free. Add tax to a net price or extract it from a gross price, at any rate, with the full breakdown.',
  keywords: ['gst calculator', 'vat calculator', 'sales tax calculator', 'add gst', 'reverse gst calculator'],
  popularity: 84,
  related: ['percentage-calculator', 'discount-calculator', 'tip-calculator', 'salary-calculator', 'loan-calculator'],
  intro: 'Add tax to a price, or work backwards from a tax-inclusive total to find the net amount. Preset rates cover the most common jurisdictions.',
  html: DISCLAIMER + `
<div class="field">
  <span class="lbl" id="d-lbl">Direction</span>
  <div class="seg" role="group" aria-labelledby="d-lbl">
    <button type="button" data-d="add" aria-pressed="true">Add tax to net price</button>
    <button type="button" data-d="rm" aria-pressed="false">Remove tax from gross price</button>
  </div>
</div>
<div class="row">
  <div class="field"><label for="amt" id="amt-l">Net amount (before tax)</label><input type="number" id="amt" value="100" step="any" min="0"></div>
  <div class="field"><label for="rate">Tax rate (%)</label><input type="number" id="rate" value="10" step="any" min="0" max="100"></div>
</div>
<div class="field">
  <span class="lbl">Common rates</span>
  <div class="chips">
    <button class="chip" data-r="5">5% — GST Canada</button>
    <button class="chip" data-r="10">10% — GST AU/NZ… 15%</button>
    <button class="chip" data-r="18">18% — GST India</button>
    <button class="chip" data-r="20">20% — VAT UK</button>
    <button class="chip" data-r="21">21% — VAT NL/ES</button>
  </div>
</div>
<div class="field"><label for="cur">Currency</label>
  <select id="cur"><option>USD</option><option>EUR</option><option>GBP</option><option>CAD</option><option>AUD</option><option>INR</option><option>NZD</option><option>SGD</option><option>ZAR</option></select>
</div>
<div class="actions"><button class="btn btn-primary" id="go">Calculate</button></div>
<div class="msg" id="msg"></div>
<div id="res" hidden style="margin-top:18px">
  <div class="result-hero"><div class="rv" id="r-main">—</div><div class="rl" id="r-lab">—</div></div>
  <table class="kv" style="margin-top:14px">
    <tr><td>Net (excluding tax)</td><td id="r-net">—</td></tr>
    <tr><td>Tax amount</td><td id="r-tax">—</td></tr>
    <tr><td>Gross (including tax)</td><td id="r-gross">—</td></tr>
  </table>
  <pre class="out" id="r-work" style="margin-top:12px"></pre>
</div>`,
  init: function () {
    var dir = 'add';
    MT.$$('[data-d]').forEach(function (b) {
      b.addEventListener('click', function () {
        MT.$$('[data-d]').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        dir = b.dataset.d;
        MT.$('#amt-l').textContent = dir === 'add' ? 'Net amount (before tax)' : 'Gross amount (including tax)';
        if (!MT.$('#res').hidden) calc();
      });
    });
    MT.$$('[data-r]').forEach(function (c) {
      c.addEventListener('click', function () { MT.$('#rate').value = c.dataset.r; calc(); });
    });

    function calc() {
      var amt = MT.num('#amt', NaN), rate = MT.num('#rate', NaN), cur = MT.$('#cur').value;
      MT.$('#res').hidden = true;
      if (!isFinite(amt) || amt < 0) { MT.msg('#msg', 'Enter an amount.', 'warn'); return; }
      if (!isFinite(rate) || rate < 0) { MT.msg('#msg', 'Enter a tax rate of zero or more.', 'warn'); return; }
      if (rate >= 100) { MT.msg('#msg', 'A rate of 100% or more cannot be removed from a gross price — the net would be zero or negative.', 'err'); return; }
      var net, tax, gross, work;
      if (dir === 'add') {
        net = amt; tax = net * rate / 100; gross = net + tax;
        work = 'Tax   = ' + net + ' × ' + rate + '/100 = ' + MT.fmtNum(tax, 4) + '\nGross = ' + net + ' + ' + MT.fmtNum(tax, 4) + ' = ' + MT.fmtNum(gross, 4);
      } else {
        gross = amt; net = gross / (1 + rate / 100); tax = gross - net;
        work = 'Net   = ' + gross + ' ÷ (1 + ' + rate + '/100) = ' + gross + ' ÷ ' + (1 + rate / 100) + ' = ' + MT.fmtNum(net, 4) +
               '\nTax   = ' + gross + ' − ' + MT.fmtNum(net, 4) + ' = ' + MT.fmtNum(tax, 4);
      }
      MT.$('#r-main').textContent = MT.money(dir === 'add' ? gross : net, cur);
      MT.$('#r-lab').textContent = dir === 'add' ? 'gross price including ' + rate + '% tax' : 'net price excluding ' + rate + '% tax';
      MT.$('#r-net').textContent = MT.money(net, cur);
      MT.$('#r-tax').textContent = MT.money(tax, cur);
      MT.$('#r-gross').textContent = MT.money(gross, cur);
      MT.$('#r-work').textContent = work;
      MT.$('#res').hidden = false;
      MT.clearMsg('#msg');
      MT.done({ dir: dir });
    }
    MT.on('#go', 'click', MT.guard(calc));
    MT.$$('#amt, #rate, #cur').forEach(function (el) {
      el.addEventListener('change', function () { if (!MT.$('#res').hidden) calc(); });
    });
    calc();
  },
  howto: [
    'Choose whether you are adding tax to a net price or extracting it from a tax-inclusive total.',
    'Enter the amount and the rate, or tap one of the common rate chips.',
    'Press <b>Calculate</b> to see the net, tax and gross figures with the working.'
  ],
  sections: [
    { h: 'Adding versus removing tax',
      p: `<p>Adding is straightforward: multiply the net by the rate and add it on. Removing is where mistakes happen, because subtracting the rate from the gross gives the wrong answer.</p>
<p>At 20%, a gross price of 120 has a net of 100 — but 120 minus 20% is 96. The correct operation is division: <b>net = gross ÷ (1 + rate ÷ 100)</b>. The tax fraction shortcut follows from this: at 20% the tax is one sixth of the gross, at 10% it is one eleventh, and at 5% it is one twenty-first.</p>` },
    { h: 'GST, VAT and sales tax are not the same thing',
      p: `<p>GST and VAT work the same way mechanically — tax is charged at each stage of the supply chain, and registered businesses reclaim what they paid on inputs, so the net burden falls on the final consumer. The names are regional: GST in Australia, New Zealand, Canada, India and Singapore; VAT across the UK and EU.</p>
<p>US sales tax is structurally different. It is charged once at the final sale, and the rate is set by state, county and city combined — so a single street can span two rates. Because of this, US prices are almost always displayed before tax, while GST and VAT jurisdictions require consumer prices to be shown tax-inclusive.</p>` },
    { h: 'Rates vary by product',
      p: `<p>Most systems have more than one rate. The UK charges 20% standard, 5% on domestic fuel and 0% on most food and children's clothing. India's GST runs in slabs from 0% to 28% depending on the item. Canada layers a federal GST with provincial taxes that may be combined into a single HST or charged separately.</p>
<p>Enter the rate that applies to your specific goods rather than the headline national rate, and check current rates with the tax authority before relying on a figure for filing.</p>` }
  ],
  faq: [
    { q: 'How do I find the tax inside a price?', a: 'Switch to "Remove tax from gross price" and enter the total. The tool divides by 1 plus the rate to recover the net, then reports the difference as tax.' },
    { q: 'Why is my figure a cent off my invoice?', a: 'Accounting systems differ in where they round — per line item, per tax rate, or on the invoice total. Over many lines these choices diverge by a cent or two. Follow your jurisdiction\'s rounding rule for filings.' },
    { q: 'Can I use this for US sales tax?', a: 'Yes, if you know your combined rate. Because state, county and city rates stack, look up the exact rate for the delivery address rather than using a state average.' },
    { q: 'Does it handle multiple rates on one invoice?', a: 'Not in a single calculation. Group your line items by rate and run each group separately, then add the tax amounts together.' }
  ]
},

/* ------------------------------------------------------------------ */
{
  slug: 'tip-calculator',
  name: 'Tip Calculator',
  icon: '🍽',
  category: 'calculators',
  desc: 'Split a bill and work out the tip, per person.',
  seoTitle: 'Tip Calculator — Split the Bill and Calculate Tip',
  metaDescription: 'Calculate tips and split bills between any number of people. Choose a tip percentage, round the total, and see exactly what each person owes.',
  keywords: ['tip calculator', 'bill splitter', 'gratuity calculator', 'split the bill'],
  popularity: 81,
  related: ['percentage-calculator', 'discount-calculator', 'gst-calculator', 'salary-calculator', 'loan-calculator'],
  intro: 'Enter the bill, choose a tip and split it. Rounding options handle the awkward last cent so nobody underpays.',
  html: `
<div class="row">
  <div class="field"><label for="bill">Bill amount</label><input type="number" id="bill" value="84.50" step="any" min="0"></div>
  <div class="field"><label for="people">Split between</label><input type="number" id="people" value="2" step="1" min="1"></div>
  <div class="field"><label for="cur">Currency</label>
    <select id="cur"><option>USD</option><option>EUR</option><option>GBP</option><option>CAD</option><option>AUD</option><option>INR</option><option>NZD</option></select>
  </div>
</div>
<div class="field">
  <label for="tip">Tip: <span id="tipv">18</span>%</label>
  <input type="range" id="tip" min="0" max="30" step="1" value="18">
  <div class="chips" style="margin-top:8px">
    <button class="chip" data-t="0">No tip</button>
    <button class="chip" data-t="10">10%</button>
    <button class="chip" data-t="15">15%</button>
    <button class="chip" data-t="18">18%</button>
    <button class="chip" data-t="20">20%</button>
    <button class="chip" data-t="25">25%</button>
  </div>
</div>
<div class="field"><label for="round">Rounding</label>
  <select id="round">
    <option value="none">No rounding — exact amounts</option>
    <option value="up">Round each person up to the nearest whole unit</option>
    <option value="total">Round the total up to the nearest whole unit</option>
  </select>
</div>
<div class="msg" id="msg"></div>
<div id="res" style="margin-top:18px">
  <div class="result-hero"><div class="rv" id="r-each">—</div><div class="rl" id="r-eachl">each</div></div>
  <table class="kv" style="margin-top:14px">
    <tr><td>Bill</td><td id="r-bill">—</td></tr>
    <tr><td>Tip</td><td id="r-tip">—</td></tr>
    <tr><td>Total</td><td id="r-total">—</td></tr>
    <tr><td>Tip per person</td><td id="r-tipe">—</td></tr>
  </table>
</div>`,
  init: function () {
    function calc() {
      var bill = MT.num('#bill', NaN), people = Math.round(MT.num('#people', 1)), tip = MT.num('#tip', 0), cur = MT.$('#cur').value;
      MT.$('#tipv').textContent = tip;
      if (!isFinite(bill) || bill < 0) { MT.msg('#msg', 'Enter the bill amount.', 'warn'); return; }
      if (!isFinite(people) || people < 1) { MT.msg('#msg', 'Split between at least one person.', 'warn'); return; }
      MT.clearMsg('#msg');

      var tipAmt = bill * tip / 100;
      var total = bill + tipAmt;
      var each = total / people;
      var mode = MT.$('#round').value;
      var note = '';
      if (mode === 'up') {
        each = Math.ceil(each);
        var newTotal = each * people;
        note = newTotal > total ? 'Rounded up — the group pays ' + MT.money(newTotal - total, cur) + ' more than the exact total.' : '';
        total = newTotal;
        tipAmt = total - bill;
      } else if (mode === 'total') {
        total = Math.ceil(total);
        tipAmt = total - bill;
        each = total / people;
      }
      MT.$('#r-each').textContent = MT.money(each, cur);
      MT.$('#r-eachl').textContent = people === 1 ? 'total to pay' : 'each, between ' + people;
      MT.$('#r-bill').textContent = MT.money(bill, cur);
      MT.$('#r-tip').textContent = MT.money(tipAmt, cur) + (bill > 0 ? '  (' + MT.pct(tipAmt / bill * 100, 1) + ')' : '');
      MT.$('#r-total').textContent = MT.money(total, cur);
      MT.$('#r-tipe').textContent = MT.money(tipAmt / people, cur);
      if (note) MT.msg('#msg', note, 'info');
      MT.done();
    }
    MT.$$('[data-t]').forEach(function (c) {
      c.addEventListener('click', function () { MT.$('#tip').value = c.dataset.t; calc(); });
    });
    MT.$$('#bill, #people, #tip, #round, #cur').forEach(function (el) {
      el.addEventListener('input', calc);
      el.addEventListener('change', calc);
    });
    calc();
  },
  howto: [
    'Enter the bill total and how many people are splitting it.',
    'Drag the slider or tap a preset to set the tip percentage.',
    'Choose a rounding option if you want clean amounts rather than exact cents.'
  ],
  sections: [
    { h: 'Tipping is local, not universal',
      p: `<p>There is no international standard, and applying one country's habit elsewhere ranges from unnecessary to rude.</p>
<ul>
<li><b>United States and Canada</b> — 15–20% is expected at sit-down restaurants, because tipped staff are often paid a lower base wage.</li>
<li><b>United Kingdom and Ireland</b> — around 10%, and often already added as a service charge. Check the bill before adding more.</li>
<li><b>Most of continental Europe</b> — service is usually included; rounding up or leaving 5–10% is a courtesy.</li>
<li><b>Japan, South Korea, China</b> — tipping is not customary and can cause confusion.</li>
<li><b>Australia and New Zealand</b> — not expected, though appreciated for good service.</li>
</ul>` },
    { h: 'Before or after tax?',
      p: `<p>Etiquette guides generally say to tip on the pre-tax subtotal, since tax is not part of the service. In practice most people tip on the total, which at a 10% tax rate makes a 20% tip closer to 22%.</p>
<p>To tip on the subtotal, enter the pre-tax amount as the bill, then add the tax back separately. If the bill already includes a service charge, an additional tip is optional — you are otherwise paying twice for the same thing.</p>` }
  ],
  faq: [
    { q: 'How does rounding split an odd amount?', a: 'Rounding each person up gives clean per-person figures and slightly overpays the total. Rounding the total keeps the group amount clean but can leave uneven cents per person. Both are shown so you can pick.' },
    { q: 'Can I split unevenly?', a: 'Not directly. For an uneven split, calculate the tip on the whole bill, then divide it in proportion to what each person ordered.' },
    { q: 'Should I tip on delivery or takeaway?', a: 'Delivery drivers are commonly tipped in tipping cultures — a fixed amount or around 10%. Counter takeaway usually is not, though tip jars are a small optional courtesy.' },
    { q: 'What is a service charge?', a: 'A percentage the venue adds automatically, common for large groups. It is the tip, already applied. Adding more on top is entirely optional.' }
  ]
},

/* ------------------------------------------------------------------ */
{
  slug: 'discount-calculator',
  name: 'Discount Calculator',
  icon: '🏷',
  category: 'calculators',
  desc: 'Find the sale price, the saving, and stacked discount totals.',
  seoTitle: 'Discount Calculator — Sale Price and Savings',
  metaDescription: 'Calculate discounts and sale prices online free. Work out the final price after one or more discounts, find the original price, or check the real percentage off.',
  keywords: ['discount calculator', 'sale price calculator', 'percent off calculator', 'markdown calculator'],
  popularity: 83,
  related: ['percentage-calculator', 'gst-calculator', 'tip-calculator', 'salary-calculator', 'compound-interest-calculator'],
  intro: 'Work out what you actually pay after a discount — including stacked offers, where the real saving is always less than the two percentages added together.',
  html: `
<div class="field">
  <span class="lbl" id="m-lbl">Calculation</span>
  <div class="seg" role="group" aria-labelledby="m-lbl" style="flex-wrap:wrap">
    <button type="button" data-m="off" aria-pressed="true">Price after discount</button>
    <button type="button" data-m="orig" aria-pressed="false">Original price</button>
    <button type="button" data-m="pct" aria-pressed="false">What % off is this?</button>
  </div>
</div>
<div class="row">
  <div class="field"><label for="a" id="la">Original price</label><input type="number" id="a" value="120" step="any" min="0"></div>
  <div class="field"><label for="b" id="lb">Discount (%)</label><input type="number" id="b" value="25" step="any" min="0"></div>
  <div class="field"><label for="cur">Currency</label>
    <select id="cur"><option>USD</option><option>EUR</option><option>GBP</option><option>CAD</option><option>AUD</option><option>INR</option><option>NZD</option></select>
  </div>
</div>
<div class="field" id="stack-wrap">
  <label for="c">Second discount, applied afterwards (%) — optional</label>
  <input type="number" id="c" value="0" step="any" min="0" max="100">
  <p class="hint">Use this for "extra 10% off sale prices" offers.</p>
</div>
<div class="actions"><button class="btn btn-primary" id="go">Calculate</button></div>
<div class="msg" id="msg"></div>
<div id="res" hidden style="margin-top:18px">
  <div class="result-hero"><div class="rv" id="r-main">—</div><div class="rl" id="r-lab">—</div></div>
  <table class="kv" id="rows" style="margin-top:14px"></table>
</div>`,
  init: function () {
    var mode = 'off';
    var labels = {
      off:  { a: 'Original price', b: 'Discount (%)' },
      orig: { a: 'Sale price you paid', b: 'Discount that was applied (%)' },
      pct:  { a: 'Original price', b: 'Sale price' }
    };
    MT.$$('[data-m]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        MT.$$('[data-m]').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        btn.setAttribute('aria-pressed', 'true');
        mode = btn.dataset.m;
        MT.$('#la').textContent = labels[mode].a;
        MT.$('#lb').textContent = labels[mode].b;
        MT.$('#stack-wrap').hidden = mode !== 'off';
        MT.$('#res').hidden = true;
        MT.clearMsg('#msg');
      });
    });

    function calc() {
      var a = MT.num('#a', NaN), b = MT.num('#b', NaN), c = MT.num('#c', 0), cur = MT.$('#cur').value;
      MT.$('#res').hidden = true;
      if (!isFinite(a) || !isFinite(b)) { MT.msg('#msg', 'Fill in both boxes.', 'warn'); return; }
      var rows = [];
      if (mode === 'off') {
        if (b < 0 || b > 100) { MT.msg('#msg', 'A discount must be between 0 and 100%.', 'err'); return; }
        if (c < 0 || c > 100) { MT.msg('#msg', 'The second discount must be between 0 and 100%.', 'err'); return; }
        var after1 = a * (1 - b / 100);
        var final = after1 * (1 - c / 100);
        var saved = a - final;
        MT.$('#r-main').textContent = MT.money(final, cur);
        MT.$('#r-lab').textContent = 'final price';
        rows.push(['Original price', MT.money(a, cur)]);
        rows.push(['First discount (' + b + '%)', '− ' + MT.money(a - after1, cur)]);
        if (c > 0) {
          rows.push(['Price after first discount', MT.money(after1, cur)]);
          rows.push(['Second discount (' + c + '% of that)', '− ' + MT.money(after1 - final, cur)]);
        }
        rows.push(['You save', MT.money(saved, cur)]);
        rows.push(['Effective discount', MT.pct(a ? saved / a * 100 : 0, 2)]);
        if (c > 0) rows.push(['Stacked ' + b + '% + ' + c + '% equals', MT.pct(100 - (1 - b / 100) * (1 - c / 100) * 100, 2) + ' off, not ' + (b + c) + '%']);
      } else if (mode === 'orig') {
        if (b < 0 || b >= 100) { MT.msg('#msg', 'The discount must be between 0 and 99.99% to work backwards.', 'err'); return; }
        var orig = a / (1 - b / 100);
        MT.$('#r-main').textContent = MT.money(orig, cur);
        MT.$('#r-lab').textContent = 'original price before the discount';
        rows.push(['Sale price paid', MT.money(a, cur)]);
        rows.push(['Discount applied', MT.pct(b, 2)]);
        rows.push(['You saved', MT.money(orig - a, cur)]);
      } else {
        if (a <= 0) { MT.msg('#msg', 'The original price must be greater than zero.', 'err'); return; }
        var pct = (a - b) / a * 100;
        MT.$('#r-main').textContent = MT.pct(pct, 2);
        MT.$('#r-lab').textContent = pct >= 0 ? 'off the original price' : 'increase, not a discount';
        rows.push(['Original price', MT.money(a, cur)]);
        rows.push(['Sale price', MT.money(b, cur)]);
        rows.push(['Difference', MT.money(a - b, cur)]);
      }
      MT.$('#rows').innerHTML = rows.map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>'; }).join('');
      MT.$('#res').hidden = false;
      MT.clearMsg('#msg');
      MT.done({ mode: mode });
    }
    MT.on('#go', 'click', MT.guard(calc));
    MT.$$('#a, #b, #c, #cur').forEach(function (el) {
      el.addEventListener('input', function () { if (!MT.$('#res').hidden) calc(); });
    });
    calc();
  },
  howto: [
    'Pick what you want to work out — the sale price, the original price, or the percentage off.',
    'Enter the two figures. For stacked offers, add the second discount in the optional field.',
    'Press <b>Calculate</b> to see the final price and the true effective discount.'
  ],
  sections: [
    { h: 'Stacked discounts do not add up',
      p: `<p>"40% off, plus an extra 20% off sale prices" is not 60% off. The second discount applies to the already-reduced price, so the calculation is multiplicative:</p>
<pre>100 × 0.60 = 60      (40% off)
 60 × 0.80 = 48      (a further 20% off)
Effective discount = 52%, not 60%</pre>
<p>The gap widens as the discounts grow. Two 50% discounts give 75% off, never 100%. This tool shows the effective figure whenever you enter a second discount.</p>` },
    { h: 'Working backwards from a sale price',
      p: `<p>To recover the original price, divide rather than add the percentage back. A jacket at 90 after 25% off was 90 ÷ 0.75 = 120. Adding 25% to 90 gives 112.50, which is wrong — because the 25% was calculated on 120, not on 90.</p>
<p>This is also how to check an advertised claim. If a shop shows "was 200, now 150", the real discount is (200 − 150) ÷ 200 = 25%.</p>` },
    { h: 'Reading a sale honestly',
      p: `<p>A few things worth checking before deciding a discount is a bargain:</p>
<ul>
<li><b>What the reference price means.</b> "Was" prices sometimes refer to a manufacturer's suggested price the item never sold at.</li>
<li><b>Whether tax comes before or after.</b> Discounts are normally applied to the pre-tax price, so the saving on your receipt looks smaller.</li>
<li><b>Buy-one-get-one offers.</b> BOGO is 50% off across two items, and "buy two get one free" is 33% off across three — only if you wanted all of them.</li>
</ul>` }
  ],
  faq: [
    { q: 'Which order do stacked discounts apply in?', a: 'Mathematically it does not matter — multiplication commutes, so 20% then 30% equals 30% then 20%. It matters only if a coupon has a minimum spend that one order clears and the other does not.' },
    { q: 'Is a discount applied before or after tax?', a: 'Almost always before. Tax is then charged on the reduced price, so you save on the tax as well.' },
    { q: 'How do I compare "25% off" against "£25 off"?', a: 'Convert the fixed amount to a percentage of the price. On a £80 item, £25 off is 31% — better. On a £200 item it is 12.5% — worse. Use the "What % off is this?" mode.' },
    { q: 'What does a negative percentage mean?', a: 'The second price is higher than the first, so it is a price increase rather than a discount. Check whether the two figures were entered the right way round.' }
  ]
},

/* ------------------------------------------------------------------ */
{
  slug: 'bmi-calculator',
  name: 'BMI Calculator',
  icon: '⚖',
  category: 'calculators',
  desc: 'Body mass index in metric or imperial, with category ranges.',
  seoTitle: 'BMI Calculator — Body Mass Index, Metric and Imperial',
  metaDescription: 'Calculate body mass index from height and weight in metric or imperial units. See the WHO category ranges and what BMI can and cannot tell you.',
  keywords: ['bmi calculator', 'body mass index', 'bmi chart', 'calculate bmi'],
  popularity: 87,
  related: ['weight-converter', 'length-converter', 'age-calculator', 'percentage-calculator', 'time-calculator'],
  intro: 'BMI is a quick screening ratio, not a diagnosis. It is calculated here alongside an explanation of where it works and where it does not.',
  html: `
<div class="notice"><strong>General information only.</strong> BMI is a population screening tool. It is not a measure of health, body fat or fitness for any individual, and it is not medical advice. Discuss any health concern with a qualified clinician.</div>
<div class="field">
  <span class="lbl" id="u-lbl">Units</span>
  <div class="seg" role="group" aria-labelledby="u-lbl">
    <button type="button" data-u="metric" aria-pressed="true">Metric (cm / kg)</button>
    <button type="button" data-u="imperial" aria-pressed="false">Imperial (ft, in / lb)</button>
  </div>
</div>
<div id="metric-fields">
  <div class="row">
    <div class="field"><label for="cm">Height (cm)</label><input type="number" id="cm" value="175" step="any" min="50" max="260"></div>
    <div class="field"><label for="kg">Weight (kg)</label><input type="number" id="kg" value="72" step="any" min="10" max="500"></div>
  </div>
</div>
<div id="imperial-fields" hidden>
  <div class="row">
    <div class="field"><label for="ft">Height (feet)</label><input type="number" id="ft" value="5" step="1" min="1" max="8"></div>
    <div class="field"><label for="inch">Height (inches)</label><input type="number" id="inch" value="9" step="any" min="0" max="11.99"></div>
    <div class="field"><label for="lb">Weight (pounds)</label><input type="number" id="lb" value="159" step="any" min="20" max="1100"></div>
  </div>
</div>
<div class="actions"><button class="btn btn-primary" id="go">Calculate BMI</button></div>
<div class="msg" id="msg"></div>
<div id="res" hidden style="margin-top:18px">
  <div class="result-hero"><div class="rv" id="r-bmi">—</div><div class="rl" id="r-cat">—</div></div>
  <table class="kv" style="margin-top:14px">
    <tr><td>Height used</td><td id="r-h">—</td></tr>
    <tr><td>Weight used</td><td id="r-w">—</td></tr>
    <tr><td>Healthy-range weight at this height</td><td id="r-range">—</td></tr>
  </table>
</div>`,
  init: function () {
    var units = 'metric';
    MT.$$('[data-u]').forEach(function (b) {
      b.addEventListener('click', function () {
        MT.$$('[data-u]').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        units = b.dataset.u;
        MT.$('#metric-fields').hidden = units !== 'metric';
        MT.$('#imperial-fields').hidden = units === 'metric';
        MT.$('#res').hidden = true;
      });
    });
    function category(b) {
      if (b < 16) return 'Severe underweight';
      if (b < 18.5) return 'Underweight';
      if (b < 25) return 'Healthy range';
      if (b < 30) return 'Overweight';
      if (b < 35) return 'Obese class I';
      if (b < 40) return 'Obese class II';
      return 'Obese class III';
    }
    function calc() {
      var m, kg;
      MT.$('#res').hidden = true;
      if (units === 'metric') {
        var cm = MT.num('#cm', NaN);
        kg = MT.num('#kg', NaN);
        if (!isFinite(cm) || !isFinite(kg)) { MT.msg('#msg', 'Enter both a height and a weight.', 'warn'); return; }
        if (cm < 50 || cm > 260) { MT.msg('#msg', 'Enter a height between 50 and 260 cm.', 'err'); return; }
        if (kg < 10 || kg > 500) { MT.msg('#msg', 'Enter a weight between 10 and 500 kg.', 'err'); return; }
        m = cm / 100;
        MT.$('#r-h').textContent = MT.fmtNum(cm, 1) + ' cm';
        MT.$('#r-w').textContent = MT.fmtNum(kg, 1) + ' kg';
      } else {
        var ft = MT.num('#ft', NaN), inch = MT.num('#inch', 0), lb = MT.num('#lb', NaN);
        if (!isFinite(ft) || !isFinite(lb)) { MT.msg('#msg', 'Enter both a height and a weight.', 'warn'); return; }
        if (inch < 0 || inch >= 12) { MT.msg('#msg', 'Inches must be between 0 and 11.', 'err'); return; }
        var totalIn = ft * 12 + inch;
        if (totalIn < 20 || totalIn > 102) { MT.msg('#msg', 'That height is outside the supported range.', 'err'); return; }
        if (lb < 20 || lb > 1100) { MT.msg('#msg', 'That weight is outside the supported range.', 'err'); return; }
        m = totalIn * 0.0254;
        kg = lb * 0.45359237;
        MT.$('#r-h').textContent = ft + '′ ' + MT.fmtNum(inch, 1) + '″ (' + MT.fmtNum(m * 100, 1) + ' cm)';
        MT.$('#r-w').textContent = MT.fmtNum(lb, 1) + ' lb (' + MT.fmtNum(kg, 1) + ' kg)';
      }
      var bmi = kg / (m * m);
      MT.$('#r-bmi').textContent = MT.fmtNum(bmi, 1);
      MT.$('#r-cat').textContent = category(bmi) + ' — BMI ' + MT.fmtNum(bmi, 1) + ' kg/m²';
      var lo = 18.5 * m * m, hi = 24.9 * m * m;
      MT.$('#r-range').textContent = units === 'metric'
        ? MT.fmtNum(lo, 1) + ' – ' + MT.fmtNum(hi, 1) + ' kg'
        : MT.fmtNum(lo / 0.45359237, 1) + ' – ' + MT.fmtNum(hi / 0.45359237, 1) + ' lb';
      MT.$('#res').hidden = false;
      MT.clearMsg('#msg');
      MT.done();
    }
    MT.on('#go', 'click', MT.guard(calc));
    MT.$$('#cm, #kg, #ft, #inch, #lb').forEach(function (el) {
      el.addEventListener('change', function () { if (!MT.$('#res').hidden) calc(); });
    });
  },
  howto: [
    'Choose metric or imperial units.',
    'Enter your height and weight.',
    'Press <b>Calculate BMI</b> to see the figure, its category, and the weight range that corresponds to a BMI of 18.5–24.9 at your height.'
  ],
  sections: [
    { h: 'The formula and the categories',
      p: `<p>BMI is weight in kilograms divided by height in metres squared. In imperial units the equivalent is (pounds ÷ inches²) × 703 — the constant just converts units, so both give the same number.</p>
<table>
<tr><th>BMI</th><th>WHO category</th></tr>
<tr><td>Below 18.5</td><td>Underweight</td></tr>
<tr><td>18.5 – 24.9</td><td>Healthy range</td></tr>
<tr><td>25.0 – 29.9</td><td>Overweight</td></tr>
<tr><td>30.0 and above</td><td>Obese (classes I–III)</td></tr>
</table>` },
    { h: 'What BMI cannot tell you',
      p: `<p>BMI was devised in the 1830s to describe populations, not to assess individuals. It uses only two numbers, so it cannot distinguish muscle from fat or know where weight is carried. Several groups are systematically misread:</p>
<ul>
<li><b>Muscular people.</b> Athletes frequently score as overweight or obese with low body fat.</li>
<li><b>Older adults.</b> Muscle loss can keep BMI unchanged while body composition shifts substantially.</li>
<li><b>Different ancestries.</b> Health risks rise at lower BMI thresholds in South and East Asian populations; several countries use adjusted cut-offs.</li>
<li><b>Children and teenagers.</b> Adult categories do not apply — paediatric BMI is read against age and sex percentile charts.</li>
<li><b>Pregnancy.</b> BMI is not meaningful during pregnancy.</li>
</ul>
<p>Waist circumference and waist-to-height ratio capture fat distribution, which correlates better with metabolic risk. A useful rule of thumb is keeping your waist under half your height.</p>` }
  ],
  faq: [
    { q: 'Is BMI accurate for me personally?', a: 'It is a screening ratio, not a measurement of your body. Two people with the same BMI can have very different body composition and health. Treat it as one rough data point among several.' },
    { q: 'Why does my BMI differ from a gym machine\'s reading?', a: 'Body composition scales estimate fat percentage by passing a small current through the body — an entirely different measurement. They are also sensitive to hydration and time of day.' },
    { q: 'Can I use this for a child?', a: 'No. Children\'s BMI must be read against age and sex growth charts, since healthy ranges change throughout development. Ask a paediatrician or use a dedicated paediatric chart.' },
    { q: 'Is any data stored?', a: 'No. The calculation runs in your browser and nothing is transmitted or saved.' }
  ]
},

/* ------------------------------------------------------------------ */
{
  slug: 'time-calculator',
  name: 'Time Calculator',
  icon: '⏳',
  category: 'calculators',
  desc: 'Add, subtract and total durations in hours, minutes and seconds.',
  seoTitle: 'Time Calculator — Add and Subtract Hours and Minutes',
  metaDescription: 'Add or subtract times and durations online. Total a list of hours and minutes, convert to decimal hours for timesheets, and find the gap between two clock times.',
  keywords: ['time calculator', 'add time', 'hours calculator', 'time duration calculator', 'timesheet calculator'],
  popularity: 75,
  related: ['date-calculator', 'timestamp-converter', 'time-zone-converter', 'age-calculator', 'salary-calculator'],
  intro: 'Three time jobs in one place: arithmetic on durations, the gap between two clock times, and totalling a timesheet into decimal hours.',
  html: `
<div class="field">
  <span class="lbl" id="m-lbl">Mode</span>
  <div class="seg" role="group" aria-labelledby="m-lbl" style="flex-wrap:wrap">
    <button type="button" data-m="dur" aria-pressed="true">Add / subtract durations</button>
    <button type="button" data-m="between" aria-pressed="false">Time between two clock times</button>
    <button type="button" data-m="sum" aria-pressed="false">Total a list</button>
  </div>
</div>

<div data-panel="dur">
  <div class="row">
    <div class="field"><label for="h1">Hours</label><input type="number" id="h1" value="2" step="1"></div>
    <div class="field"><label for="m1">Minutes</label><input type="number" id="m1" value="45" step="1"></div>
    <div class="field"><label for="s1">Seconds</label><input type="number" id="s1" value="0" step="1"></div>
  </div>
  <div class="field"><label for="op">Operation</label><select id="op"><option value="+">Add</option><option value="-">Subtract</option></select></div>
  <div class="row">
    <div class="field"><label for="h2">Hours</label><input type="number" id="h2" value="1" step="1"></div>
    <div class="field"><label for="m2">Minutes</label><input type="number" id="m2" value="30" step="1"></div>
    <div class="field"><label for="s2">Seconds</label><input type="number" id="s2" value="0" step="1"></div>
  </div>
</div>

<div data-panel="between" hidden>
  <div class="row">
    <div class="field"><label for="t1">Start time</label><input type="time" id="t1" value="09:00" step="1"></div>
    <div class="field"><label for="t2">End time</label><input type="time" id="t2" value="17:30" step="1"></div>
  </div>
  <div class="checkline"><input type="checkbox" id="overnight"><label for="overnight">End time is on the next day</label></div>
  <div class="field"><label for="brk">Break to subtract (minutes)</label><input type="number" id="brk" value="0" step="1" min="0"></div>
</div>

<div data-panel="sum" hidden>
  <div class="field">
    <label for="list">One duration per line — <code>h:mm</code>, <code>h:mm:ss</code> or decimal hours</label>
    <textarea id="list" spellcheck="false" placeholder="7:45&#10;8:15&#10;6:30&#10;7.5"></textarea>
  </div>
</div>

<div class="actions"><button class="btn btn-primary" id="go">Calculate</button></div>
<div class="msg" id="msg"></div>
<div id="res" hidden style="margin-top:18px">
  <div class="result-hero"><div class="rv" id="r-main">—</div><div class="rl" id="r-lab">—</div></div>
  <table class="kv" style="margin-top:14px">
    <tr><td>Decimal hours</td><td id="r-dec">—</td></tr>
    <tr><td>Total minutes</td><td id="r-min">—</td></tr>
    <tr><td>Total seconds</td><td id="r-sec">—</td></tr>
  </table>
</div>`,
  init: function () {
    var mode = 'dur';
    MT.$$('[data-m]').forEach(function (b) {
      b.addEventListener('click', function () {
        MT.$$('[data-m]').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        mode = b.dataset.m;
        MT.$$('[data-panel]').forEach(function (p) { p.hidden = p.dataset.panel !== mode; });
        MT.$('#res').hidden = true;
        MT.clearMsg('#msg');
      });
    });

    function fmt(totalSec) {
      var neg = totalSec < 0;
      var t = Math.abs(Math.round(totalSec));
      var h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
      return (neg ? '−' : '') + h + 'h ' + String(m).padStart(2, '0') + 'm ' + String(s).padStart(2, '0') + 's';
    }
    function show(sec, label) {
      MT.$('#r-main').textContent = fmt(sec);
      MT.$('#r-lab').textContent = label;
      MT.$('#r-dec').textContent = MT.fmtNum(sec / 3600, 4) + ' h';
      MT.$('#r-min').textContent = MT.fmtNum(sec / 60, 2);
      MT.$('#r-sec').textContent = MT.fmtNum(Math.round(sec), 0);
      MT.$('#res').hidden = false;
      MT.done({ mode: mode });
    }

    function parseLine(line) {
      var t = line.trim();
      if (!t) return null;
      if (/^\d+(\.\d+)?$/.test(t)) return parseFloat(t) * 3600;
      var m = /^(\d+):([0-5]?\d)(?::([0-5]?\d))?$/.exec(t);
      if (!m) return NaN;
      return parseInt(m[1], 10) * 3600 + parseInt(m[2], 10) * 60 + (m[3] ? parseInt(m[3], 10) : 0);
    }

    function calc() {
      MT.$('#res').hidden = true;
      if (mode === 'dur') {
        var a = MT.num('#h1', 0) * 3600 + MT.num('#m1', 0) * 60 + MT.num('#s1', 0);
        var b = MT.num('#h2', 0) * 3600 + MT.num('#m2', 0) * 60 + MT.num('#s2', 0);
        var r = MT.$('#op').value === '+' ? a + b : a - b;
        if (r < 0) MT.msg('#msg', 'The result is negative — the second duration is longer than the first.', 'info');
        else MT.clearMsg('#msg');
        show(r, MT.$('#op').value === '+' ? 'sum of the two durations' : 'difference between the two durations');
      } else if (mode === 'between') {
        var t1 = MT.$('#t1').value, t2 = MT.$('#t2').value;
        if (!t1 || !t2) { MT.msg('#msg', 'Enter both a start and an end time.', 'warn'); return; }
        function toSec(v) { var p = v.split(':').map(Number); return p[0] * 3600 + p[1] * 60 + (p[2] || 0); }
        var s1 = toSec(t1), s2 = toSec(t2);
        var diff = s2 - s1;
        if (MT.$('#overnight').checked || diff < 0) diff += 86400;
        var brk = MT.num('#brk', 0) * 60;
        if (brk > diff) { MT.msg('#msg', 'The break is longer than the period between those times.', 'err'); return; }
        diff -= brk;
        MT.clearMsg('#msg');
        show(diff, 'between ' + t1 + ' and ' + t2 + (brk ? ', less a ' + MT.num('#brk', 0) + ' minute break' : ''));
      } else {
        var lines = MT.$('#list').value.split('\n');
        var total = 0, count = 0, bad = [];
        lines.forEach(function (l, i) {
          var v = parseLine(l);
          if (v === null) return;
          if (isNaN(v)) { bad.push(i + 1); return; }
          total += v; count++;
        });
        if (bad.length) {
          MT.msg('#msg', 'Could not read line' + (bad.length > 1 ? 's ' : ' ') + bad.slice(0, 5).join(', ') + '. Use h:mm, h:mm:ss or a decimal number.', 'err');
          return;
        }
        if (!count) { MT.msg('#msg', 'Enter at least one duration.', 'warn'); return; }
        MT.msg('#msg', 'Totalled ' + MT.plural(count, 'entry', 'entries') + ' — average ' + fmt(total / count) + '.', 'ok');
        show(total, 'total of ' + count + ' entries');
      }
    }
    MT.on('#go', 'click', MT.guard(calc));
    MT.$$('input, select, textarea').forEach(function (el) {
      el.addEventListener('change', function () { if (!MT.$('#res').hidden) calc(); });
    });
  },
  howto: [
    'Pick a mode: duration arithmetic, the gap between two clock times, or totalling a list.',
    'Fill in the fields. In list mode, put one duration per line as <code>7:45</code>, <code>7:45:30</code> or <code>7.75</code>.',
    'Press <b>Calculate</b>. Every result is also shown as decimal hours for payroll and invoicing.'
  ],
  sections: [
    { h: 'Why time arithmetic goes wrong in spreadsheets',
      p: `<p>Time is base 60, not base 10, and this is the source of most timesheet errors. Three hours and 45 minutes is <b>3.75</b> decimal hours, not 3.45. Anyone typing 3.45 into an invoice at an hourly rate underbills themselves by 18 minutes.</p>
<p>The conversion is minutes ÷ 60. Fifteen minutes is 0.25, twenty minutes is 0.333…, and 50 minutes is 0.8333…. Every result here shows both forms so you can copy whichever your system expects.</p>` },
    { h: 'Overnight shifts and negative results',
      p: `<p>A shift from 22:00 to 06:00 produces a negative number if you subtract naïvely, because the end time is a smaller clock value. The fix is adding 24 hours when the end precedes the start — which this tool does automatically, and which the "next day" checkbox forces when a shift is longer than 24 hours.</p>
<p>One caveat: on days when daylight saving starts or ends, a wall-clock day is 23 or 25 hours long. Clock-time arithmetic assumes 24. For payroll spanning a changeover date, check the affected shift by hand.</p>` }
  ],
  faq: [
    { q: 'How do I convert minutes to decimal hours?', a: 'Divide by 60. Ninety minutes is 1.5 hours; 20 minutes is 0.333 hours. Every result here includes the decimal figure to four places.' },
    { q: 'Can I total a week of shifts at once?', a: 'Yes — use "Total a list" and paste one shift per line. Mixed formats work, so 7:45 and 7.75 can appear in the same list.' },
    { q: 'What if a result is negative?', a: 'In duration mode it means the second value is larger, and the result is shown with a minus sign. In clock mode a negative gap is treated as crossing midnight.' },
    { q: 'Does it handle durations longer than 24 hours?', a: 'Yes. Durations are not clock times, so 30h 15m is displayed as-is rather than wrapping around.' }
  ]
},

/* ------------------------------------------------------------------ */
{
  slug: 'date-calculator',
  name: 'Date Calculator',
  icon: '📅',
  category: 'calculators',
  desc: 'Days between dates, or add and subtract days from a date.',
  seoTitle: 'Date Calculator — Days Between Dates and Date Arithmetic',
  metaDescription: 'Calculate the number of days between two dates, or add and subtract days, weeks, months and years. Includes a business-day count that skips weekends.',
  keywords: ['date calculator', 'days between dates', 'add days to date', 'business days calculator', 'date difference'],
  popularity: 82,
  related: ['age-calculator', 'time-calculator', 'timestamp-converter', 'time-zone-converter', 'percentage-calculator'],
  intro: 'Count the days between two dates — including working days only — or project forwards and backwards from a starting date.',
  html: `
<div class="field">
  <span class="lbl" id="m-lbl">Mode</span>
  <div class="seg" role="group" aria-labelledby="m-lbl">
    <button type="button" data-m="between" aria-pressed="true">Days between dates</button>
    <button type="button" data-m="addsub" aria-pressed="false">Add or subtract from a date</button>
  </div>
</div>

<div data-panel="between">
  <div class="row">
    <div class="field"><label for="d1">Start date</label><input type="date" id="d1"></div>
    <div class="field"><label for="d2">End date</label><input type="date" id="d2"></div>
  </div>
  <div class="checkline"><input type="checkbox" id="incl"><label for="incl">Count the end date as a full day</label></div>
</div>

<div data-panel="addsub" hidden>
  <div class="field"><label for="base">Starting date</label><input type="date" id="base"></div>
  <div class="row">
    <div class="field"><label for="op">Direction</label><select id="op"><option value="1">Add</option><option value="-1">Subtract</option></select></div>
    <div class="field"><label for="qty">Amount</label><input type="number" id="qty" value="30" step="1"></div>
    <div class="field"><label for="unit">Unit</label>
      <select id="unit"><option value="d">Days</option><option value="bd">Business days</option><option value="w">Weeks</option><option value="m">Months</option><option value="y">Years</option></select>
    </div>
  </div>
</div>

<div class="actions"><button class="btn btn-primary" id="go">Calculate</button></div>
<div class="msg" id="msg"></div>
<div id="res" hidden style="margin-top:18px">
  <div class="result-hero"><div class="rv" id="r-main">—</div><div class="rl" id="r-lab">—</div></div>
  <table class="kv" id="rows" style="margin-top:14px"></table>
</div>`,
  init: function () {
    var mode = 'between';
    function iso(d) { return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); }
    var today = new Date();
    MT.$('#d1').value = iso(today);
    MT.$('#d2').value = iso(new Date(today.getTime() + 30 * 86400000));
    MT.$('#base').value = iso(today);

    MT.$$('[data-m]').forEach(function (b) {
      b.addEventListener('click', function () {
        MT.$$('[data-m]').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        mode = b.dataset.m;
        MT.$$('[data-panel]').forEach(function (p) { p.hidden = p.dataset.panel !== mode; });
        MT.$('#res').hidden = true;
        MT.clearMsg('#msg');
      });
    });

    function businessDaysBetween(a, b) {
      var count = 0, cur = new Date(a.getTime());
      while (cur < b) {
        var d = cur.getDay();
        if (d !== 0 && d !== 6) count++;
        cur.setDate(cur.getDate() + 1);
      }
      return count;
    }

    function calc() {
      MT.$('#res').hidden = true;
      var rows = [];
      if (mode === 'between') {
        var v1 = MT.$('#d1').value, v2 = MT.$('#d2').value;
        if (!v1 || !v2) { MT.msg('#msg', 'Pick both dates.', 'warn'); return; }
        var a = new Date(v1 + 'T00:00:00'), b = new Date(v2 + 'T00:00:00');
        var swapped = false;
        if (b < a) { var t = a; a = b; b = t; swapped = true; }
        var days = Math.round((b - a) / 86400000);
        if (MT.$('#incl').checked) days += 1;
        MT.$('#r-main').textContent = MT.fmtNum(days) + (days === 1 ? ' day' : ' days');
        MT.$('#r-lab').textContent = 'between ' + a.toLocaleDateString(undefined, { dateStyle: 'medium' }) + ' and ' + b.toLocaleDateString(undefined, { dateStyle: 'medium' });
        var bd = businessDaysBetween(a, b) + (MT.$('#incl').checked && b.getDay() !== 0 && b.getDay() !== 6 ? 1 : 0);
        rows.push(['Weeks', MT.fmtNum(days / 7, 2)]);
        rows.push(['Business days (Mon–Fri)', MT.fmtNum(bd)]);
        rows.push(['Weekend days', MT.fmtNum(days - bd)]);
        rows.push(['Months (approx.)', MT.fmtNum(days / 30.436875, 2)]);
        rows.push(['Years (approx.)', MT.fmtNum(days / 365.2425, 3)]);
        rows.push(['Hours', MT.fmtNum(days * 24)]);
        if (swapped) MT.msg('#msg', 'The end date was earlier than the start date, so they were swapped.', 'info');
        else MT.clearMsg('#msg');
      } else {
        var bv = MT.$('#base').value;
        if (!bv) { MT.msg('#msg', 'Pick a starting date.', 'warn'); return; }
        var qty = Math.round(MT.num('#qty', NaN));
        if (!isFinite(qty)) { MT.msg('#msg', 'Enter an amount.', 'warn'); return; }
        if (Math.abs(qty) > 100000) { MT.msg('#msg', 'That amount is too large. Keep it under 100,000.', 'err'); return; }
        var sign = parseInt(MT.$('#op').value, 10);
        var unit = MT.$('#unit').value;
        var d = new Date(bv + 'T00:00:00');
        var start = new Date(d.getTime());
        if (unit === 'd') d.setDate(d.getDate() + sign * qty);
        else if (unit === 'w') d.setDate(d.getDate() + sign * qty * 7);
        else if (unit === 'm') d.setMonth(d.getMonth() + sign * qty);
        else if (unit === 'y') d.setFullYear(d.getFullYear() + sign * qty);
        else {
          var left = qty;
          while (left > 0) {
            d.setDate(d.getDate() + sign);
            var dw = d.getDay();
            if (dw !== 0 && dw !== 6) left--;
          }
        }
        MT.$('#r-main').textContent = d.toLocaleDateString(undefined, { dateStyle: 'full' });
        MT.$('#r-lab').textContent = (sign > 0 ? qty + ' ' : qty + ' ') + ({ d: 'days', bd: 'business days', w: 'weeks', m: 'months', y: 'years' })[unit] + (sign > 0 ? ' after ' : ' before ') + start.toLocaleDateString(undefined, { dateStyle: 'medium' });
        rows.push(['ISO date', new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)]);
        rows.push(['Day of week', d.toLocaleDateString(undefined, { weekday: 'long' })]);
        rows.push(['Days from start', MT.fmtNum(Math.abs(Math.round((d - start) / 86400000)))]);
        var doy = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);
        rows.push(['Day of the year', doy + ' of ' + (((d.getFullYear() % 4 === 0 && d.getFullYear() % 100 !== 0) || d.getFullYear() % 400 === 0) ? 366 : 365)]);
        MT.clearMsg('#msg');
      }
      MT.$('#rows').innerHTML = rows.map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>'; }).join('');
      MT.$('#res').hidden = false;
      MT.done({ mode: mode });
    }
    MT.on('#go', 'click', MT.guard(calc));
    MT.$$('input, select').forEach(function (el) {
      el.addEventListener('change', function () { if (!MT.$('#res').hidden) calc(); });
    });
    calc();
  },
  howto: [
    'Choose whether you are measuring between two dates or projecting from one.',
    'Fill in the dates, or the amount and unit to add or subtract.',
    'Press <b>Calculate</b>. Business-day counts skip Saturdays and Sundays.'
  ],
  sections: [
    { h: 'Inclusive versus exclusive counting',
      p: `<p>"How many days from Monday to Friday?" has two correct answers. Four, if you count the gaps between days. Five, if you count the days themselves. Neither is wrong — they answer different questions.</p>
<p>The distinction matters in contracts and deadlines. A "30 day notice period" starting on the 1st usually ends on the 31st (exclusive counting), but a "5 working days to respond" usually includes the day you received it. The checkbox here lets you pick, and legal or contractual terms should define which they mean.</p>` },
    { h: 'Months are not a fixed length',
      p: `<p>Adding one month to 31 January is ambiguous — there is no 31 February. JavaScript's date arithmetic, which this tool uses, rolls forward to 2 or 3 March. Some systems clamp to the last day of the month instead, giving 28 or 29 February.</p>
<p>Neither convention is universal, which is why financial and legal documents specify the rule explicitly. If exact month-end behaviour matters, work in days rather than months, or check the result before relying on it.</p>` },
    { h: 'Business days exclude weekends, not holidays',
      p: `<p>The business-day count here skips Saturdays and Sundays only. Public holidays vary by country, region and year — and in some places by industry — so no general-purpose calculator can include them without knowing exactly where you are.</p>
<p>Some countries also have a different working week: Friday and Saturday are the weekend across much of the Middle East. For a legally binding deadline, count against the official calendar that applies.</p>` }
  ],
  faq: [
    { q: 'Does it account for leap years?', a: 'Yes. Day counts use real calendar arithmetic, so 29 February is included whenever it falls within the range.' },
    { q: 'Why is the month figure marked approximate?', a: 'Months vary between 28 and 31 days, so any conversion from days to months uses an average — 30.44 days. For exact month arithmetic, use the add or subtract mode.' },
    { q: 'Can I exclude public holidays?', a: 'Not automatically, since holidays differ by country and change each year. Count the business days here, then subtract the holidays that fall in the range.' },
    { q: 'Does it handle dates before 1970 or far in the future?', a: 'Yes, across a range of roughly ±270,000 years. Very distant dates use the proleptic Gregorian calendar, which differs from the Julian calendar historically in use before 1582.' }
  ]
},

/* ------------------------------------------------------------------ */
{
  slug: 'compound-interest-calculator',
  name: 'Compound Interest Calculator',
  icon: '📈',
  category: 'calculators',
  desc: 'Project savings growth with regular contributions.',
  seoTitle: 'Compound Interest Calculator — Savings Growth Projection',
  metaDescription: 'Calculate compound interest with regular contributions. See year-by-year growth, total interest earned, and how much of the final balance is growth rather than deposits.',
  keywords: ['compound interest calculator', 'savings calculator', 'investment growth calculator', 'compound interest formula'],
  popularity: 85,
  related: ['loan-calculator', 'mortgage-calculator', 'percentage-calculator', 'salary-calculator', 'gst-calculator'],
  intro: 'See what regular saving turns into over time, and how much of the final figure came from your deposits versus compounding.',
  html: DISCLAIMER + `
<div class="row">
  <div class="field"><label for="p">Starting amount</label><input type="number" id="p" value="5000" step="any" min="0"></div>
  <div class="field"><label for="rate">Annual return (%)</label><input type="number" id="rate" value="6" step="any"></div>
  <div class="field"><label for="years">Years</label><input type="number" id="years" value="20" step="any" min="0.1" max="100"></div>
</div>
<div class="row">
  <div class="field"><label for="contrib">Regular contribution</label><input type="number" id="contrib" value="300" step="any" min="0"></div>
  <div class="field"><label for="cfreq">Contribution frequency</label>
    <select id="cfreq"><option value="12">Monthly</option><option value="26">Fortnightly</option><option value="52">Weekly</option><option value="1">Yearly</option><option value="0">None</option></select>
  </div>
  <div class="field"><label for="comp">Compounding</label>
    <select id="comp"><option value="12">Monthly</option><option value="4">Quarterly</option><option value="1">Yearly</option><option value="365">Daily</option></select>
  </div>
</div>
<div class="row">
  <div class="field"><label for="infl">Inflation adjustment (% per year)</label><input type="number" id="infl" value="0" step="any"></div>
  <div class="field"><label for="cur">Currency</label>
    <select id="cur"><option>USD</option><option>EUR</option><option>GBP</option><option>CAD</option><option>AUD</option><option>INR</option><option>NZD</option></select>
  </div>
</div>
<div class="actions"><button class="btn btn-primary" id="go">Project growth</button><button class="btn" id="dl">Download table (CSV)</button></div>
<div class="msg" id="msg"></div>
<div id="res" hidden style="margin-top:18px">
  <div class="result-hero"><div class="rv" id="r-final">—</div><div class="rl" id="r-finall">final balance</div></div>
  <div class="stat-grid" style="margin-top:14px">
    <div class="stat"><div class="sv" id="s-dep">—</div><div class="sl">Total deposited</div></div>
    <div class="stat"><div class="sv" id="s-int">—</div><div class="sl">Interest earned</div></div>
    <div class="stat"><div class="sv" id="s-ratio">—</div><div class="sl">Growth share</div></div>
    <div class="stat"><div class="sv" id="s-real">—</div><div class="sl">In today's money</div></div>
  </div>
  <h3>Year by year</h3>
  <div style="overflow-x:auto"><table class="kv" id="table"></table></div>
</div>`,
  init: function () {
    var last = null;
    function project() {
      var P = MT.num('#p', 0), rate = MT.num('#rate', NaN), years = MT.num('#years', NaN);
      var contrib = MT.num('#contrib', 0), cfreq = parseInt(MT.$('#cfreq').value, 10);
      var comp = parseInt(MT.$('#comp').value, 10), infl = MT.num('#infl', 0), cur = MT.$('#cur').value;
      MT.$('#res').hidden = true;
      if (!isFinite(rate)) { MT.msg('#msg', 'Enter an annual return.', 'warn'); return; }
      if (!isFinite(years) || years <= 0) { MT.msg('#msg', 'Enter a number of years greater than zero.', 'warn'); return; }
      if (years > 100) { MT.msg('#msg', 'Projections beyond 100 years are not meaningful. Keep it under 100.', 'err'); return; }
      if (P < 0 || contrib < 0) { MT.msg('#msg', 'Amounts cannot be negative.', 'err'); return; }

      // Simulate on a daily grid so contribution and compounding frequencies can differ.
      var totalDays = Math.round(years * 365);
      var dailyRate = Math.pow(1 + rate / 100 / comp, comp / 365) - 1;
      var bal = P, deposited = P, rows = [], nextContribDay = 0;
      var contribEveryDays = cfreq ? 365 / cfreq : Infinity;

      for (var d = 1; d <= totalDays; d++) {
        bal *= (1 + dailyRate);
        if (cfreq && d >= nextContribDay + contribEveryDays) {
          bal += contrib;
          deposited += contrib;
          nextContribDay += contribEveryDays;
        }
        if (d % 365 === 0 || d === totalDays) {
          rows.push({ year: Math.round(d / 365 * 10) / 10, bal: bal, dep: deposited, int: bal - deposited });
        }
      }
      var interest = bal - deposited;
      var real = infl ? bal / Math.pow(1 + infl / 100, years) : bal;

      MT.$('#r-final').textContent = MT.money(bal, cur);
      MT.$('#s-dep').textContent = MT.money(deposited, cur);
      MT.$('#s-int').textContent = MT.money(interest, cur);
      MT.$('#s-ratio').textContent = bal > 0 ? MT.pct(interest / bal * 100, 1) : '—';
      MT.$('#s-real').textContent = infl ? MT.money(real, cur) : 'set inflation';
      MT.$('#table').innerHTML = '<tr><td style="color:var(--ink);font-weight:600">Year</td><td style="text-align:right">Deposited</td><td style="text-align:right">Interest</td><td style="text-align:right">Balance</td></tr>' +
        rows.map(function (r) {
          return '<tr><td>' + r.year + '</td><td style="text-align:right">' + MT.money(r.dep, cur) +
            '</td><td style="text-align:right">' + MT.money(r.int, cur) +
            '</td><td style="text-align:right">' + MT.money(r.bal, cur) + '</td></tr>';
        }).join('');
      last = { rows: rows, cur: cur };
      MT.$('#res').hidden = false;
      MT.clearMsg('#msg');
      MT.done();
    }
    MT.on('#go', 'click', MT.guard(project));
    MT.$$('#p, #rate, #years, #contrib, #cfreq, #comp, #infl, #cur').forEach(function (el) {
      el.addEventListener('change', function () { if (!MT.$('#res').hidden) project(); });
    });
    MT.on('#dl', 'click', function () {
      if (!last) { MT.toast('Project first'); return; }
      var csv = 'Year,Deposited,Interest,Balance\n' + last.rows.map(function (r) {
        return [r.year, r.dep.toFixed(2), r.int.toFixed(2), r.bal.toFixed(2)].join(',');
      }).join('\n');
      MT.download(csv, 'compound-interest.csv', 'text/csv');
    });
    project();
  },
  howto: [
    'Enter your starting amount, expected annual return and the number of years.',
    'Add a regular contribution and choose how often you pay it in.',
    'Optionally set an inflation rate to see the result in today\'s purchasing power.'
  ],
  sections: [
    { h: 'The formula',
      p: `<p>For a lump sum with no contributions:</p>
<pre>A = P × (1 + r/n)^(n×t)</pre>
<p>where <b>P</b> is the starting amount, <b>r</b> the annual rate as a decimal, <b>n</b> the number of compounding periods per year and <b>t</b> the years. Adding regular contributions turns this into a future-value-of-an-annuity calculation, which is why this tool simulates the balance day by day — it lets the contribution schedule differ from the compounding schedule, as it usually does in real accounts.</p>
<p>The rule of 72 gives a quick mental check: divide 72 by the rate to get the doubling time. At 6%, money doubles in roughly 12 years.</p>` },
    { h: 'Why compounding frequency matters less than you think',
      p: `<p>On £10,000 at 6% for one year, annual compounding yields £600 and daily compounding yields £618. That £18 gap is the entire benefit of moving from yearly to daily. Beyond daily, the effect is negligible — continuous compounding, the mathematical limit, adds fractions of a penny.</p>
<p>The rate matters enormously more than the frequency. One extra percentage point of return over 30 years dwarfs any compounding schedule. When comparing accounts, look at the effective annual rate (AER or APY), which already folds compounding in.</p>` },
    { h: 'Inflation and the honest number',
      p: `<p>A balance of £500,000 in 30 years is not £500,000 of today's spending power. At 3% inflation it buys roughly what £206,000 buys now. That is not a rounding detail — it is more than half the headline figure.</p>
<p>Setting an inflation rate above shows the real (inflation-adjusted) balance alongside the nominal one. A reasonable approach is to enter a <em>real</em> return directly — historic long-run equity returns are often quoted around 5–7% after inflation — and leave the inflation field at zero.</p>` }
  ],
  faq: [
    { q: 'What return rate should I use?', a: 'That is an investment question, not a maths one. Savings accounts track central bank rates; long-run equity market averages are frequently quoted around 7% nominal before inflation. Any projection is a scenario, not a prediction.' },
    { q: 'Does it account for tax?', a: 'No. Tax on interest, dividends and capital gains varies by country, account type and income. Tax-sheltered accounts change the picture substantially, so model your own situation separately.' },
    { q: 'Why does the year-by-year table not compound smoothly?', a: 'Contributions are added on their own schedule while interest accrues daily, so a year in which a contribution lands early grows slightly more than one where it lands late. That mirrors how real accounts behave.' },
    { q: 'Can I model withdrawals?', a: 'Not directly. Setting a negative return does not simulate drawdown correctly. For retirement withdrawals you need a decumulation model, which is a different calculation.' }
  ]
}

];
