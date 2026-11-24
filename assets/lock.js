/* Schloss für Simulationen + Zurück-Leiste (Physik 9/10, Webseiten-Standard Abschnitt 6)
   Einbinden in eine Simulation (Inhalt und Layout der Simulation bleiben unverändert):
     <script>window.SIM_ID = 'achterbahn';</script>
     <script src="../data/codes.js"></script>
     <script src="../assets/lock.js"></script>
   Freischaltung gilt bis zum Schließen des Browsers (sessionStorage). */
(function () {
  'use strict';
  var CFG = window.LOCKS || {};
  var SIM = CFG.sims && CFG.sims[window.SIM_ID];
  var PREFIX = CFG.prefix || 'phy';

  function hash(str, seed) { // cyrb53
    var h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (var i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
  }
  window.__lockHash = hash;

  /* Deutsche Zahleneingabe lesen: "274 680", "274.680", "274680 J", "4,05 €", "274,7 kJ" */
  function parseNum(raw) {
    var t = String(raw).replace(/[\s  ]/g, '').replace(/[^0-9,.\-]/g, '');
    if (!t) return NaN;
    if (t.indexOf(',') >= 0 && t.indexOf('.') >= 0) t = t.replace(/\./g, '').replace(',', '.');
    else if (t.indexOf(',') >= 0) t = t.replace(',', '.');
    else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, '');
    return parseFloat(t);
  }
  function keyFor(id, sig, x) { return id + '|' + sig + '|' + String(Number(x.toPrecision(sig))); }
  window.__lockKey = keyFor;

  function check(sim, id, raw) {
    var x = parseNum(raw);
    if (!isFinite(x) || x <= 0) return false;
    var set = {}; sim.h.forEach(function (v) { set[v] = 1; });
    var cands = [x, x * 1000, x / 1000];
    for (var c = 0; c < cands.length; c++)
      for (var s = sim.minSig; s <= 6; s++)
        if (set[hash(keyFor(id, s, cands[c]), 7)]) return true;
    return false;
  }
  window.__lockCheck = function (id, raw) { return check(CFG.sims[id], id, raw) || isMaster(raw); };
  function isMaster(raw) {
    return CFG.master && hash('master|' + String(raw).toLowerCase().replace(/[\s\-_.]+/g, ''), 7) === CFG.master;
  }
  function store(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; } }

  var css = [
    '.lk-bar{position:sticky;top:0;z-index:2147483000;display:flex;align-items:center;gap:12px;',
    'padding:8px max(16px,env(safe-area-inset-right,0px)) 8px max(16px,env(safe-area-inset-left,0px));',
    'background:#0E3B5C;color:#F5F8FB;font:600 15px/1.2 Carlito,Calibri,"Segoe UI",system-ui,sans-serif;border-bottom:3px solid #2E9A5C}',
    '.lk-bar a{color:#F5F8FB;text-decoration:none;padding:6px 10px;border-radius:8px}',
    '.lk-bar a:hover,.lk-bar a:focus-visible{background:#1F6FB2;outline:none}',
    '.lk-bar span{margin-left:auto;color:#9CC3E6;font-weight:400}',
    '.lk-bar a.on{background:#F5F8FB;color:#0E3B5C}',
    '@media (max-width:640px){.lk-bar{flex-wrap:wrap}.lk-bar span{display:none}}',
    '.lk-wall{position:fixed;inset:0;z-index:2147483001;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:8px;',
    'padding:clamp(24px,8vh,72px) max(16px,env(safe-area-inset-right,0px)) 24px max(16px,env(safe-area-inset-left,0px));background:#0E3B5C;',
    'font:16px/1.45 Carlito,Calibri,"Segoe UI",system-ui,sans-serif;color:#0E3B5C;overflow:auto}',
    '.lk-wall .stdfuss{width:100%;max-width:520px;margin:0;padding:12px 4px 0!important;border-top:1px solid rgba(255,255,255,.25);color:#E2EEF8!important}',
    '.lk-wall .stdfuss *{color:#E2EEF8!important}.lk-wall .stdfuss a,.lk-wall .stdfuss .stdfuss-row button{color:#fff!important}',
    '.lk-card{width:100%;max-width:520px;background:#F5F8FB;border-radius:16px;padding:28px;display:flex;flex-direction:column;gap:14px;border-top:8px solid #2E9A5C}',
    '.lk-eye{font-size:13px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#1F6FB2}',
    '.lk-card,.lk-card *{font-family:Carlito,Calibri,"Segoe UI",system-ui,sans-serif;text-transform:none;letter-spacing:normal;box-sizing:border-box}',
    '.lk-card h1{margin:0;font-size:28px;line-height:1.15;color:#0E3B5C;font-weight:700}',
    '.lk-card p{margin:0}',
    '.lk-card .lk-eye{letter-spacing:.12em;text-transform:uppercase}',
    '.lk-task{background:#E2EEF8;border:1px solid #1F6FB2;border-radius:10px;padding:12px 14px;color:#0E3B5C}',
    '.lk-row{display:flex;gap:10px;flex-wrap:wrap}',
    '.lk-row input{flex:1 1 180px;min-width:0;font:600 22px Carlito,Calibri,system-ui,sans-serif;padding:10px 12px;border:2px solid #1F6FB2;border-radius:10px;color:#0E3B5C;background:#fff}',
    '.lk-row input:focus{outline:3px solid #9CC3E6;outline-offset:1px}',
    '.lk-row button{font:700 18px Carlito,Calibri,system-ui,sans-serif;padding:10px 20px;border:0;border-radius:10px;background:#1F6FB2;color:#fff;cursor:pointer;min-height:48px}',
    '.lk-row button:hover{background:#0E3B5C}',
    '.lk-msg{min-height:1.4em;margin:0;font-weight:600}',
    '.lk-msg.bad{color:#A33A2B}.lk-msg.ok{color:#1F7346}',
    '.lk-tip{background:#E3F2E8;border-left:0;border-radius:10px;padding:10px 14px;color:#14402B}',
    '.lk-small{font-size:14px;color:#4A5D6B;margin:0}',
    '.lk-small a{color:#1F6FB2}'
  ].join('');
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  function bar() {
    var b = document.createElement('div'); b.className = 'lk-bar';
    var tabs = SIM && SIM.tabs ? SIM.tabs.map(function (t) { return '<a href="' + t[1] + '"' + (t[2] ? ' class="on" aria-current="page"' : '') + '>' + t[0] + '</a>'; }).join('') : '';
    b.innerHTML = '<a href="' + (CFG.home || '../') + '">← ' + (CFG.homeLabel || 'Übersicht') + '</a>' + tabs + '<span>' + (SIM ? SIM.name : '') + '</span>';   /* Datenschutz steht im Seitenfuß */
    document.body.insertBefore(b, document.body.firstChild);
  }

  function wall() {
    var w = document.createElement('div'); w.className = 'lk-wall'; w.setAttribute('role', 'dialog'); w.setAttribute('aria-modal', 'true');
    w.innerHTML =
      '<form class="lk-card" novalidate>' +
      '<div class="lk-eye">Gesperrt · ' + SIM.ds + '</div>' +
      '<h1>' + SIM.name + '</h1>' +
      '<p style="margin:0">Schalte die Simulation mit deinem Ergebnis frei.</p>' +
      '<div class="lk-task">' + SIM.task + '</div>' +
      '<label for="lk-in" class="lk-small">Freischalt-Code (nur die Zahl, ohne Einheit)</label>' +
      '<div class="lk-row"><input id="lk-in" inputmode="decimal" autocomplete="off" placeholder="z. B. 1234,5"><button type="submit">Freischalten</button></div>' +
      '<p class="lk-msg" aria-live="polite"></p>' +
      '<div class="lk-tip" hidden></div>' +
      '<p class="lk-small"><a href="' + (CFG.home || '../') + '">← zurück zur Übersicht</a></p>' +
      '</form>';
    document.body.appendChild(w);
    var fuss = document.querySelector('.stdfuss');   /* Datenschutz, Impressum, Schriftlizenzen auch vor dem Freischalten erreichbar */
    if (fuss) w.appendChild(fuss);
    var f = w.querySelector('form'), inp = w.querySelector('#lk-in'), msg = w.querySelector('.lk-msg'), tip = w.querySelector('.lk-tip');
    var tries = 0;
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var v = inp.value;
      if (!v.trim()) { msg.className = 'lk-msg bad'; msg.textContent = 'Gib zuerst dein Ergebnis ein.'; return; }
      if (isMaster(v)) { store(PREFIX + ':unlock:*', '1'); open(); return; }
      if (check(SIM, window.SIM_ID, v)) { store(PREFIX + ':unlock:' + window.SIM_ID, '1'); msg.className = 'lk-msg ok'; msg.textContent = 'Richtig! Die Simulation ist freigeschaltet.'; setTimeout(open, 700); return; }
      tries++;
      msg.className = 'lk-msg bad';
      msg.textContent = SIM.hints[Math.min(tries - 1, SIM.hints.length - 1)];
      if (tries >= 3) { tip.hidden = false; tip.innerHTML = '<strong>Tipp zum Rechenweg:</strong> ' + SIM.tip; }
      inp.select();
    });
    function open() { if (fuss) document.body.appendChild(fuss); w.remove(); document.documentElement.style.overflow = ''; }
    document.documentElement.style.overflow = 'hidden';
    setTimeout(function () { try { inp.focus(); } catch (e) {} }, 50);
  }

  function init() {
    bar();
    if (!SIM || !SIM.locked) return;
    if (store(PREFIX + ':unlock:' + window.SIM_ID) === '1' || store(PREFIX + ':unlock:*') === '1') return;
    wall();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
