/* Gemeinsame Funktionen der Lernseiten Physik 9/10 */
(function () {
  'use strict';
  var PREFIX = (window.SITE && window.SITE.prefix) || 'phy';
  var App = {
    /* Lernstand nur im Browser dieses Geräts */
    load: function (key, fallback) {
      try { var v = localStorage.getItem(PREFIX + ':' + key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
    },
    save: function (key, value) { try { localStorage.setItem(PREFIX + ':' + key, JSON.stringify(value)); } catch (e) { } },
    clearAll: function () {
      try { Object.keys(localStorage).forEach(function (k) { if (k.indexOf(PREFIX + ':') === 0) localStorage.removeItem(k); }); } catch (e) { }
    },
    esc: function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); },
    /* E_pot -> E<sub>pot</sub>, CO₂ bleibt */
    fmt: function (s) {
      return App.esc(s)
        .replace(/([A-Za-zη])_([A-Za-z0-9]+)/g, '$1<sub>$2</sub>')
        .replace(/√\{([^{}]*)\}/g, '<span class="rad" role="math" aria-label="Wurzel aus $1"><span class="rad-s">√</span><span class="rad-b">$1</span></span>');
    },
    /* Hervorheben (Webseiten-Standard 9): Energieformen fett in ihrer Farbe, Fachbegriffe fett.
       Nur für Texte, in denen das Wort nicht die Lösung ist (nie in Antwortoptionen, Lücken, Zuordnen-Karten). */
    mark: function (html, nurFormen) {
      var forms = [[/^(chemisch)/i, 'CE'], [/^(elektrisch)/i, 'EE'], [/^(thermisch)/i, 'TE'], [/^lage|^potenziell/i, 'LE'], [/^beweg|^kinetisch/i, 'BE'], [/^spann/i, 'SpE'], [/^strahl/i, 'StE']];
      if (!App._re) {
        var B = ((window.SITE && SITE.begriffe) || []).slice().sort(function (a, b) { return b.length - a.length; })
          .map(function (w) { return w.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&'); });
        /* auch „chemische und thermische Energie“: das erste Adjektiv wird ebenfalls gefärbt */
        App._ref = /\b((?:chemisch|elektrisch|thermisch|potenziell|kinetisch)(?:e|en|er|es)?(?: Energie|(?= und (?:chemisch|elektrisch|thermisch)\w* Energie))|(?:Lage|Bewegungs|Spann|Strahlungs)energie)\b/;
        App._re = new RegExp('(' + App._ref.source.slice(2, -2) + ')' + (B.length ? '|\\b(' + B.join('|') + ')(?:n|s|en|es|e)?\\b' : ''), 'g');
      }
      return html.split(/(<[^>]+>)/).map(function (part, i, all) {
        if (i % 2) return part;
        var inTag = all.slice(0, i).join('').match(/<(sub|b|strong|span class="rad[^"]*")[^>]*>[^<]*$/);
        if (inTag) return part;
        return part.replace(App._re, function (m, f, t) {
          if (f) { var c = 'TE'; forms.some(function (x) { if (x[0].test(f)) { c = x[1]; return true; } }); return '<b class="ef ef-' + c + '">' + f + '</b>'; }
          return nurFormen ? m : '<b class="fbg">' + m + '</b>';
        });
      }).join('');
    },
    fmtM: function (s, nurFormen) { return App.mark(App.fmt(s), nurFormen); },
    /* Zahl deutsch: Komma, Leerzeichen als Tausendertrennung ab 10 000 */
    num: function (x, dec) {
      var s = dec == null ? String(+x.toPrecision(10)) : x.toFixed(dec);
      var parts = s.split('.'), int = parts[0], neg = int[0] === '-';
      if (neg) int = int.slice(1);
      if (int.length > 4) int = int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      return (neg ? '−' : '') + int + (parts[1] ? ',' + parts[1] : '');
    },
    /* Deutsche Zahleneingabe lesen */
    parse: function (raw) {
      var t = String(raw).replace(/[\s  ]/g, '').replace(/[^0-9,.\-]/g, '');
      if (!t) return NaN;
      if (t.indexOf(',') >= 0 && t.indexOf('.') >= 0) t = t.replace(/\./g, '').replace(',', '.');
      else if (t.indexOf(',') >= 0) t = t.replace(',', '.');
      else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, '');
      return parseFloat(t);
    },
    shuffle: function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; },
    icon: function (name) { return (window.ICONS && window.ICONS[name]) || ''; }
  };
  window.App = App;

  /* Linien-Symbole (24er Raster, Strichstärke 2) */
  var S = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
  window.ICONS = {
    glossar: S + '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/><path d="M9 8h6"/></svg>',
    formeln: S + '<path d="M4 6h7"/><path d="M7.5 3v6"/><path d="M13 7l7 0"/><path d="M5 15l4 4"/><path d="M9 15l-4 4"/><path d="M14 16h6"/><path d="M14 19h6"/></svg>',
    formeltrainer: S + '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8"/><path d="M8 12h2"/><path d="M14 12h2"/><path d="M8 16h2"/><path d="M14 16h2"/></svg>',
    fachwort: S + '<rect x="3" y="7" width="13" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-3"/><path d="M7 12h5"/><path d="M7 15h3"/></svg>',
    checkliste: S + '<path d="M9 6h11"/><path d="M9 12h11"/><path d="M9 18h11"/><path d="M4 6l1 1 2-2"/><path d="M4 12l1 1 2-2"/><circle cx="5" cy="18" r="1.2"/></svg>',
    test: S + '<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4"/><path d="M9 13l2 2 4-4"/></svg>',
    zuordnen: S + '<rect x="3" y="4" width="7" height="6" rx="1.5"/><rect x="14" y="14" width="7" height="6" rx="1.5"/><path d="M10 7h3a2 2 0 0 1 2 2v5"/><path d="M13 12l2 2 2-2"/></svg>',
    rechnen: S + '<path d="M5 12h14"/><path d="M12 5v14"/><path d="M5 5l3 3"/><path d="M8 5l-3 3"/><path d="M16 17h4"/></svg>',
    quiz: S + '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.7"/><path d="M12 17h.01"/></svg>',
    schaetzen: S + '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>',
    sim: S + '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/><path d="M6 13c2-5 4-5 6-1s4 4 6-2"/></svg>',
    extern: S + '<path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
    lock: S + '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>'
  };

})();
