/* MEGA TOOLS — tool runtime
   Helpers shared by every tool. Loaded only on /tools/* pages. */
(function () {
  'use strict';
  var MT = window.MT = window.MT || {};

  var root = function () { return document.getElementById('tool-root') || document; };

  MT.$ = function (sel, ctx) { return (ctx || root()).querySelector(sel); };
  MT.$$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || root()).querySelectorAll(sel)); };

  MT.on = function (sel, evt, fn, ctx) {
    var el = typeof sel === 'string' ? MT.$(sel, ctx) : sel;
    if (el) el.addEventListener(evt, fn);
    return el;
  };

  /* ----- messages ----- */
  MT.msg = function (sel, text, kind) {
    var el = typeof sel === 'string' ? MT.$(sel) : sel;
    if (!el) return;
    el.className = 'msg msg-' + (kind || 'err');
    el.textContent = text || '';
    el.dataset.show = text ? 'true' : 'false';
    if (text && kind === 'err') el.setAttribute('role', 'alert');
    else el.removeAttribute('role');
  };
  MT.clearMsg = function (sel) { MT.msg(sel, '', 'err'); };

  /* ----- clipboard ----- */
  MT.copy = function (text, btn) {
    if (text === undefined || text === null || text === '') {
      MT.toast('Nothing to copy yet');
      return Promise.resolve(false);
    }
    var done = function () {
      MT.toast('Copied to clipboard');
      if (btn) {
        var old = btn.textContent;
        btn.textContent = 'Copied';
        setTimeout(function () { btn.textContent = old; }, 1200);
      }
      MT.track('tool_copy', { tool: document.body.getAttribute('data-tool') });
      return true;
    };
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(String(text)).then(done).catch(function () { return fallback(); });
    }
    return Promise.resolve(fallback());

    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = String(text);
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;left:-9999px';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
      if (ok) return done();
      MT.toast('Copy failed — select the text and press Ctrl+C');
      return false;
    }
  };

  /* ----- downloads ----- */
  MT.download = function (data, filename, mime) {
    var blob = data instanceof Blob ? data : new Blob([data], { type: mime || 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    MT.track('tool_download', { tool: document.body.getAttribute('data-tool'), file: filename });
  };

  MT.downloadZipless = function (items) {
    // Sequential downloads with a small gap; browsers block rapid-fire clicks.
    items.forEach(function (it, i) {
      setTimeout(function () { MT.download(it.blob, it.name); }, i * 320);
    });
  };

  /* ----- formatting ----- */
  MT.fmtBytes = function (n, dp) {
    if (!isFinite(n)) return '—';
    if (n < 1024) return n + ' B';
    var u = ['KB', 'MB', 'GB', 'TB'], i = -1, v = n;
    do { v /= 1024; i++; } while (v >= 1024 && i < u.length - 1);
    return v.toFixed(dp === undefined ? (v < 10 ? 2 : 1) : dp) + ' ' + u[i];
  };

  MT.fmtNum = function (n, dp) {
    if (!isFinite(n)) return '—';
    return n.toLocaleString(undefined, {
      minimumFractionDigits: dp === undefined ? 0 : dp,
      maximumFractionDigits: dp === undefined ? 2 : dp
    });
  };

  MT.money = function (n, cur) {
    if (!isFinite(n)) return '—';
    try {
      return n.toLocaleString(undefined, { style: 'currency', currency: cur || 'USD', maximumFractionDigits: 2 });
    } catch (e) {
      return (cur || '') + ' ' + n.toFixed(2);
    }
  };

  MT.pct = function (n, dp) { return MT.fmtNum(n, dp === undefined ? 2 : dp) + '%'; };

  MT.plural = function (n, one, many) { return n + ' ' + (Math.abs(n) === 1 ? one : (many || one + 's')); };

  MT.safeName = function (name, ext) {
    var base = String(name || 'file').replace(/\.[^.]+$/, '').replace(/[^\w.\- ]+/g, '_').slice(0, 80).trim() || 'file';
    return ext ? base + '.' + ext : base;
  };

  MT.num = function (sel, fallback) {
    var el = typeof sel === 'string' ? MT.$(sel) : sel;
    if (!el) return fallback;
    var v = parseFloat(String(el.value).replace(/,/g, ''));
    return isFinite(v) ? v : fallback;
  };

  /* ----- file input / drag & drop ----- */
  MT.MAX_FILE = 100 * 1024 * 1024; // 100 MB hard ceiling for browser-side work

  MT.dropzone = function (opts) {
    var zone = typeof opts.zone === 'string' ? MT.$(opts.zone) : opts.zone;
    var input = typeof opts.input === 'string' ? MT.$(opts.input) : opts.input;
    if (!zone || !input) return;
    var accept = opts.accept || [];          // array of mime prefixes or extensions
    var maxSize = opts.maxSize || 25 * 1024 * 1024;
    var multiple = !!opts.multiple;

    function validate(files) {
      var ok = [], errors = [];
      for (var i = 0; i < files.length; i++) {
        var f = files[i];
        if (accept.length && !matches(f, accept)) {
          errors.push('“' + f.name + '” is not a supported file type.');
          continue;
        }
        if (f.size > maxSize) {
          errors.push('“' + f.name + '” is ' + MT.fmtBytes(f.size) + ' — the limit for this tool is ' + MT.fmtBytes(maxSize) + '.');
          continue;
        }
        if (f.size === 0) { errors.push('“' + f.name + '” is empty.'); continue; }
        ok.push(f);
      }
      return { ok: ok, errors: errors };
    }

    function matches(file, list) {
      var name = file.name.toLowerCase();
      var type = (file.type || '').toLowerCase();
      return list.some(function (a) {
        a = a.toLowerCase();
        if (a.charAt(0) === '.') return name.slice(-a.length) === a;
        if (a.slice(-2) === '/*') return type.indexOf(a.slice(0, -1)) === 0;
        return type === a;
      });
    }

    function handle(files) {
      if (!files || !files.length) return;
      if (!multiple) files = [files[0]];
      var res = validate(files);
      if (res.errors.length && opts.onError) opts.onError(res.errors.join(' '));
      if (res.ok.length) {
        MT.track('tool_input', { tool: document.body.getAttribute('data-tool'), files: res.ok.length });
        opts.onFiles(res.ok);
      }
    }

    zone.addEventListener('click', function () { input.click(); });
    zone.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); }
    });
    zone.setAttribute('tabindex', '0');
    zone.setAttribute('role', 'button');
    input.addEventListener('change', function () { handle(input.files); input.value = ''; });

    ['dragenter', 'dragover'].forEach(function (ev) {
      zone.addEventListener(ev, function (e) { e.preventDefault(); zone.dataset.over = 'true'; });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      zone.addEventListener(ev, function (e) { e.preventDefault(); zone.dataset.over = 'false'; });
    });
    zone.addEventListener('drop', function (e) {
      if (e.dataTransfer && e.dataTransfer.files) handle(e.dataTransfer.files);
    });
  };

  MT.readAs = function (file, how) {
    return new Promise(function (resolve, reject) {
      var fr = new FileReader();
      fr.onload = function () { resolve(fr.result); };
      fr.onerror = function () { reject(new Error('Could not read “' + file.name + '”.')); };
      if (how === 'buffer') fr.readAsArrayBuffer(file);
      else if (how === 'dataURL') fr.readAsDataURL(file);
      else fr.readAsText(file);
    });
  };

  MT.loadImage = function (fileOrUrl) {
    return new Promise(function (resolve, reject) {
      var url = typeof fileOrUrl === 'string' ? fileOrUrl : URL.createObjectURL(fileOrUrl);
      var img = new Image();
      img.onload = function () {
        if (typeof fileOrUrl !== 'string') setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
        resolve(img);
      };
      img.onerror = function () {
        reject(new Error('That image could not be decoded. It may be corrupt or in an unsupported format.'));
      };
      img.src = url;
    });
  };

  MT.canvasToBlob = function (canvas, type, quality) {
    return new Promise(function (resolve, reject) {
      canvas.toBlob(function (b) {
        if (b) resolve(b);
        else reject(new Error('Your browser could not produce a ' + type + ' file.'));
      }, type, quality);
    });
  };

  /* ----- external library loader (per-page, cached) ----- */
  var libs = {};
  MT.lib = function (url) {
    if (libs[url]) return libs[url];
    libs[url] = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = url;
      s.async = true;
      s.onload = function () { resolve(); };
      s.onerror = function () {
        delete libs[url];
        reject(new Error('A required library failed to load. Check your connection and try again.'));
      };
      document.head.appendChild(s);
    });
    return libs[url];
  };

  /* ----- busy state ----- */
  MT.busy = function (btn, on, label) {
    if (!btn) return;
    if (on) {
      btn.dataset.label = btn.dataset.label || btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<span class="spin" aria-hidden="true"></span>' + (label || 'Working…');
    } else {
      btn.disabled = false;
      if (btn.dataset.label) btn.innerHTML = btn.dataset.label;
    }
  };

  MT.progress = function (sel, pct) {
    var el = typeof sel === 'string' ? MT.$(sel) : sel;
    if (!el) return;
    if (pct === null || pct === false) { el.dataset.show = 'false'; return; }
    el.dataset.show = 'true';
    el.querySelector('i').style.width = Math.max(0, Math.min(100, pct)) + '%';
  };

  MT.done = function (extra) {
    MT.track('tool_complete', Object.assign({ tool: document.body.getAttribute('data-tool') }, extra || {}));
  };

  /* ----- error boundary: never show a raw stack to a user ----- */
  MT.guard = function (fn, msgSel) {
    return function () {
      try {
        var r = fn.apply(this, arguments);
        if (r && typeof r.catch === 'function') {
          r.catch(function (err) {
            console.error(err);
            MT.msg(msgSel || '#msg', err && err.message ? err.message : 'Something went wrong. Please try again.', 'err');
          });
        }
        return r;
      } catch (err) {
        console.error(err);
        MT.msg(msgSel || '#msg', err && err.message ? err.message : 'Something went wrong. Please try again.', 'err');
      }
    };
  };
})();
