/* MEGA TOOLS — site shell
   Loaded on every page. Small on purpose: no framework, no dependencies. */
(function () {
  'use strict';

  var LS = {
    theme: 'mt:theme',
    favs: 'mt:favs',
    recent: 'mt:recent'
  };

  function read(key, fallback) {
    try {
      var v = localStorage.getItem(key);
      return v === null ? fallback : JSON.parse(v);
    } catch (e) { return fallback; }
  }
  function write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }

  /* ---------------- Analytics abstraction ----------------
     Swap the sink below for GA4 / Plausible / Umami without touching call sites.
     No personal data is collected — event names and tool slugs only. */
  var analytics = {
    queue: [],
    sink: null,
    track: function (event, props) {
      var payload = { event: event, props: props || {}, ts: Date.now() };
      if (this.sink) { try { this.sink(payload); } catch (e) {} }
      else { this.queue.push(payload); if (this.queue.length > 100) this.queue.shift(); }
      if (window.__MT_DEBUG) console.debug('[analytics]', payload.event, payload.props);
    },
    use: function (fn) {
      this.sink = fn;
      var q = this.queue.slice(); this.queue = [];
      q.forEach(function (p) { try { fn(p); } catch (e) {} });
    }
  };

  /* ---------------- Theme ---------------- */
  var theme = {
    get: function () { return read(LS.theme, 'system'); },
    prefersDark: function () {
      // Not universal — some embedded webviews omit matchMedia entirely.
      if (typeof window.matchMedia !== 'function') return false;
      try { return window.matchMedia('(prefers-color-scheme: dark)').matches; }
      catch (e) { return false; }
    },
    apply: function (pref) {
      var mode = pref;
      if (pref === 'system') mode = this.prefersDark() ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', mode);
      document.documentElement.setAttribute('data-theme-pref', pref);
      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', mode === 'dark' ? '#0f1215' : '#ffffff');
    },
    set: function (pref) { write(LS.theme, pref); this.apply(pref); },
    cycle: function () {
      var order = ['light', 'dark', 'system'];
      var next = order[(order.indexOf(this.get()) + 1) % order.length];
      this.set(next);
      MT.toast('Theme: ' + next);
      analytics.track('theme_change', { pref: next });
      return next;
    },
    init: function () {
      this.apply(this.get());
      if (typeof window.matchMedia !== 'function') return;
      try {
        var mq = window.matchMedia('(prefers-color-scheme: dark)');
        var onChange = function () { if (theme.get() === 'system') theme.apply('system'); };
        if (mq.addEventListener) mq.addEventListener('change', onChange);
        else if (mq.addListener) mq.addListener(onChange);
      } catch (e) { /* system-theme following is optional */ }
    }
  };

  /* ---------------- Favourites & recents ---------------- */
  var favs = {
    all: function () { var a = read(LS.favs, []); return Array.isArray(a) ? a : []; },
    has: function (slug) { return this.all().indexOf(slug) !== -1; },
    toggle: function (slug) {
      var a = this.all(), i = a.indexOf(slug), on;
      if (i === -1) { a.unshift(slug); on = true; } else { a.splice(i, 1); on = false; }
      write(LS.favs, a.slice(0, 60));
      analytics.track(on ? 'favorite_add' : 'favorite_remove', { tool: slug });
      return on;
    }
  };

  var recents = {
    all: function () { var a = read(LS.recent, []); return Array.isArray(a) ? a : []; },
    push: function (slug) {
      var a = this.all().filter(function (s) { return s !== slug; });
      a.unshift(slug);
      write(LS.recent, a.slice(0, 12));
    }
  };

  /* ---------------- Search index (lazy) ---------------- */
  var index = { data: null, loading: null };

  function loadIndex() {
    if (index.data) return Promise.resolve(index.data);
    if (index.loading) return index.loading;
    index.loading = fetch('/search-index.json', { cache: 'force-cache' })
      .then(function (r) { if (!r.ok) throw new Error('index'); return r.json(); })
      .then(function (j) { index.data = j; return j; })
      .catch(function () { index.data = []; return []; });
    return index.loading;
  }

  function score(tool, q) {
    var name = tool.n.toLowerCase();
    var slug = tool.s.toLowerCase();
    if (name === q || slug === q) return 1000;
    if (name.indexOf(q) === 0 || slug.indexOf(q) === 0) return 800;
    if (name.indexOf(q) !== -1) return 600;
    if (slug.indexOf(q) !== -1) return 500;
    var kw = (tool.k || '').toLowerCase();
    if (kw.indexOf(q) !== -1) return 350;
    if ((tool.d || '').toLowerCase().indexOf(q) !== -1) return 200;
    if ((tool.c || '').toLowerCase().indexOf(q) !== -1) return 150;
    // loose: all characters of the query appear in order (typo tolerance)
    var i = 0;
    for (var j = 0; j < name.length && i < q.length; j++) if (name[j] === q[i]) i++;
    return i === q.length ? 60 : 0;
  }

  function search(list, query, limit) {
    var q = String(query || '').trim().toLowerCase();
    if (!q) return [];
    var terms = q.split(/\s+/);
    return list
      .map(function (t) {
        var total = 0;
        for (var i = 0; i < terms.length; i++) {
          var s = score(t, terms[i]);
          if (!s) return null;
          total += s;
        }
        return { t: t, score: total + (t.p || 0) / 10 };
      })
      .filter(Boolean)
      .sort(function (a, b) { return b.score - a.score; })
      .slice(0, limit || 8)
      .map(function (r) { return r.t; });
  }

  /* ---------------- Search box wiring ---------------- */
  function wireSearch(input) {
    if (!input || input.dataset.wired) return;
    input.dataset.wired = '1';

    var pop = document.createElement('div');
    pop.className = 'search-pop';
    pop.setAttribute('role', 'listbox');
    pop.id = input.id + '-results';
    input.parentNode.appendChild(pop);
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-expanded', 'false');
    input.setAttribute('aria-controls', pop.id);
    input.setAttribute('aria-autocomplete', 'list');

    var cursor = -1, results = [], timer = null;

    function close() {
      pop.dataset.open = 'false';
      input.setAttribute('aria-expanded', 'false');
      cursor = -1;
    }
    function render() {
      if (!results.length) {
        pop.innerHTML = '<div class="sr-empty">No tools match that. Try “pdf”, “json” or “resize”.</div>';
      } else {
        pop.innerHTML = results.map(function (t, i) {
          return '<a href="/tools/' + t.s + '" role="option" id="' + pop.id + '-o' + i + '"' +
            (i === cursor ? ' aria-selected="true"' : '') + '>' +
            '<div class="sr-name">' + escapeHtml(t.n) + '</div>' +
            '<div class="sr-cat">' + escapeHtml(t.c) + '</div></a>';
        }).join('');
      }
      pop.dataset.open = 'true';
      input.setAttribute('aria-expanded', 'true');
    }
    function run() {
      var q = input.value;
      if (!q.trim()) { close(); return; }
      loadIndex().then(function (list) {
        results = search(list, q, 8);
        cursor = -1;
        render();
        clearTimeout(timer);
        timer = setTimeout(function () {
          if (q.trim().length > 1) analytics.track('search_query', { q: q.trim().toLowerCase(), hits: results.length });
        }, 900);
      });
    }

    input.addEventListener('focus', loadIndex);
    input.addEventListener('input', run);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { close(); input.blur(); return; }
      if (!results.length || pop.dataset.open !== 'true') return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        cursor += e.key === 'ArrowDown' ? 1 : -1;
        if (cursor < 0) cursor = results.length - 1;
        if (cursor >= results.length) cursor = 0;
        render();
        input.setAttribute('aria-activedescendant', pop.id + '-o' + cursor);
      } else if (e.key === 'Enter') {
        var pick = results[cursor === -1 ? 0 : cursor];
        if (pick) { e.preventDefault(); window.location.href = '/tools/' + pick.s; }
      }
    });
    document.addEventListener('click', function (e) {
      if (!input.parentNode.contains(e.target)) close();
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------------- Toast ---------------- */
  var toastEl = null, toastTimer = null;
  function toast(text) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = text;
    toastEl.dataset.show = 'true';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.dataset.show = 'false'; }, 1900);
  }

  /* ---------------- Public API ---------------- */
  var MT = window.MT = window.MT || {};
  MT.theme = theme;
  MT.favs = favs;
  MT.recents = recents;
  MT.analytics = analytics;
  MT.track = function (e, p) { analytics.track(e, p); };
  MT.toast = toast;
  MT.escapeHtml = escapeHtml;
  MT.loadIndex = loadIndex;
  MT.searchTools = search;

  /* ---------------- Boot ---------------- */
  // Nothing in the shell is essential to a tool working, so a failure here must
  // never prevent the rest of the page from wiring up.
  try { theme.init(); } catch (e) { console.warn('Theme init skipped:', e); }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-search-input]').forEach(wireSearch);

    var tbtn = document.querySelector('[data-theme-toggle]');
    if (tbtn) tbtn.addEventListener('click', function () { theme.cycle(); });

    // "/" focuses search, like a real utility app
    document.addEventListener('keydown', function (e) {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      var t = e.target.tagName;
      if (t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT' || e.target.isContentEditable) return;
      var box = document.querySelector('[data-search-input]');
      if (box) { e.preventDefault(); box.focus(); box.select(); }
    });

    // Favourite toggle on tool pages
    var fb = document.querySelector('[data-fav]');
    if (fb) {
      var slug = fb.getAttribute('data-fav');
      var sync = function () {
        var on = favs.has(slug);
        fb.setAttribute('aria-pressed', on ? 'true' : 'false');
        fb.setAttribute('aria-label', on ? 'Remove from favourites' : 'Save to favourites');
        fb.setAttribute('title', on ? 'Remove from favourites' : 'Save to favourites');
      };
      sync();
      fb.addEventListener('click', function () {
        var on = favs.toggle(slug);
        sync();
        toast(on ? 'Saved to favourites' : 'Removed from favourites');
      });
    }

    // Record the visit + page view
    var page = document.body.getAttribute('data-page');
    var toolSlug = document.body.getAttribute('data-tool');
    analytics.track('page_view', { page: page, tool: toolSlug || undefined });
    if (toolSlug) {
      recents.push(toolSlug);
      analytics.track('tool_view', { tool: toolSlug });
    }

    // Personal shelves: recents + favourites, rendered from the index
    var shelves = document.querySelectorAll('[data-shelf]');
    if (shelves.length) {
      var wanted = { recent: recents.all(), favourite: favs.all() };
      var need = wanted.recent.concat(wanted.favourite);
      if (need.length) {
        loadIndex().then(function (list) {
          var by = {};
          list.forEach(function (t) { by[t.s] = t; });
          shelves.forEach(function (el) {
            var kind = el.getAttribute('data-shelf');
            var slugs = (wanted[kind] || []).filter(function (s) { return by[s] && s !== toolSlug; }).slice(0, 6);
            if (!slugs.length) return;
            el.querySelector('[data-shelf-body]').innerHTML = slugs.map(function (s) {
              var t = by[s];
              return '<a class="tool-tile" href="/tools/' + t.s + '">' +
                '<div class="tt-top"><span class="tt-ico" aria-hidden="true">' + escapeHtml(t.i || '\u2699') + '</span>' +
                '<span class="tt-name">' + escapeHtml(t.n) + '</span></div>' +
                '<p class="tt-desc">' + escapeHtml(t.d) + '</p></a>';
            }).join('');
            el.hidden = false;
          });
        });
      }
    }
  });
})();
