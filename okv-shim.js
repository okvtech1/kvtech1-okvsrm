/* OKV static pages: connects the Apps Script templates to the Code.gs backend.
   1. google.script.run is replaced by a version that POSTs {rpc:1, fn, args} to the Apps Script web app.
   2. The web app address is pasted once on the page and kept in this browser (localStorage).
   3. Links that point at Apps Script pages (?page=pricing and so on) are changed to the matching static file. */
(function () {
  var KEY = 'okv_api_url';
  var FILES = { home: 'index.html', pricing: 'pricing.html', demo: 'demo.html', admin: 'admin.html', paid: 'paid.html',
                privacy: 'privacy.html', terms: 'terms.html', cookies: 'cookies.html', refund: 'refund.html', eula: 'eula.html' };

  function getUrl() { try { return localStorage.getItem(KEY) || ''; } catch (e) { return ''; } }
  function setUrl(u) { try { localStorage.setItem(KEY, u); } catch (e) { } }

  function callRpc(fn, args) {
    var url = getUrl();
    if (!url) return Promise.reject(new Error('This page is not connected to the server yet. Paste the web app address at the top of the page.'));
    return fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                        body: JSON.stringify({ rpc: 1, fn: fn, args: args || [] }) })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j || !j.ok) throw new Error((j && j.error) || 'The server did not answer. Check the web app address.');
        return j.result;
      });
  }

  function makeRun(ok, bad) {
    var base = {
      withSuccessHandler: function (f) { return makeRun(f, bad); },
      withFailureHandler: function (f) { return makeRun(ok, f); }
    };
    return new Proxy(base, {
      get: function (t, prop) {
        if (prop in t) return t[prop];
        return function () {
          var args = [].slice.call(arguments);
          callRpc(String(prop), args).then(function (r) { if (ok) ok(r); },
                                           function (e) { if (bad) bad(e); else console.error(e); });
        };
      }
    });
  }
  window.google = window.google || {};
  window.google.script = { run: makeRun(null, null) };

  function fixLinks() {
    var as = document.querySelectorAll('a[href]');
    for (var i = 0; i < as.length; i++) {
      var h = as[i].getAttribute('href') || '';
      var m = /^\?page=([a-z]+)(.*)$/.exec(h);
      if (m && FILES[m[1]]) as[i].setAttribute('href', FILES[m[1]] + m[2]);
    }
  }

  function banner() {
    var box = document.createElement('div');
    box.id = 'okv-connect';
    box.setAttribute('style', 'position:fixed;left:0;right:0;top:0;z-index:99999;background:#16213e;color:#fff;font:14px/1.4 system-ui,sans-serif;padding:10px 14px;display:flex;flex-wrap:wrap;gap:8px;align-items:center');
    box.innerHTML = '<span style="flex:1 1 320px">Connect this page to the server: paste the Apps Script web app address (it ends in /exec).</span>' +
      '<input id="okv-url" type="url" placeholder="https://script.google.com/macros/s/.../exec" style="flex:2 1 300px;padding:6px;border-radius:6px;border:0;color:#101828">' +
      '<button id="okv-save" type="button" style="padding:6px 14px;border-radius:6px;border:0;background:#e2b44f;color:#16213e;font-weight:700;cursor:pointer">Connect</button>' +
      '<span id="okv-msg" style="flex-basis:100%;color:#f3e3a6"></span>';
    document.body.appendChild(box);
    document.getElementById('okv-save').onclick = function () {
      var v = document.getElementById('okv-url').value.trim();
      if (!/^https:\/\/script\.google\.com\/macros\/s\/[^\/]+\/exec$/.test(v)) {
        document.getElementById('okv-msg').textContent = 'That does not look like an Apps Script web app address. It starts with https://script.google.com/macros/s/ and ends in /exec.';
        return;
      }
      setUrl(v);
      location.reload();
    };
  }

  document.addEventListener('DOMContentLoaded', function () {
    fixLinks();
    if (!getUrl()) banner();
  });
})();
