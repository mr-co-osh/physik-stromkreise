/* Energieflussdiagramm im Stil der Arbeitsblätter (Standard der Reihe, build/figs.py flow()).
   Kästen = Energiewandler, Pfeile = Energieformen, Pfeilbreite ∝ Energiemenge.
   Alle Pfeile oben bündig: genutzte Ausgänge + abbiegende Pfeile sind zusammen so breit wie der Eingang.
   Nicht genutzte Energie biegt am rechten Rand des Wandlers direkt unter dem Ausgangspfeil nach unten ab.

   Fluss.svg({
     zu:    [[form, wert, name?, anzeige?], ...],                 // Eingänge in den ersten Wandler (gestapelt)
     steps: [{ name: 'Kessel', out: [[form, wert, name?, anzeige?], ...],   // erster Ausgang läuft zum nächsten Wandler
               loss: [[form, wert, name?, anzeige?], ...] }, ...],          // biegen nach unten ab
     unit: '%'
   })
   Ein weiterer Ausgang eines Wandlers in der Mitte der Kette (z. B. Fernwärme) biegt ebenfalls ab, mit Zusatz „genutzt“. */
(function () {
  'use strict';
  var INK = '#1f1f1f';
  var F = {
    CE: ['chemische Energie', '#9B7BC8'], EE: ['elektrische Energie', '#F2C230'], BE: ['Bewegungsenergie', '#3D8BD0'],
    LE: ['Lageenergie', '#4BAA6F'], TE: ['thermische Energie', '#E0605B'], StE: ['Strahlungsenergie', '#F59A3A'],
    SpE: ['Spannenergie', '#9A9A9A']
  };
  var AB = { CE: 'CE', EE: 'EE', BE: 'BE', LE: 'LE', TE: 'TE', StE: 'StE', SpE: 'SpE' };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function light(hex, f) {   /* abbiegende Pfeile etwas heller, wie auf den Blättern */
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    r = Math.round(r + (255 - r) * f); g = Math.round(g + (255 - g) * f); b = Math.round(b + (255 - b) * f);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }
  function num(v) { return (Math.round(v * 10) / 10).toString().replace('.', ','); }
  function split(name) {   /* „thermische Energie (nicht genutzt)“ → mehrere Zeilen */
    return name.replace(' (', '\n(').replace(/^(\S+) (Energie)/, '$1\n$2').split('\n')
      .reduce(function (r, l) { return r.concat(/^[A-ZÄÖÜa-zäöüß]{4,}energie$/.test(l) ? [l.replace(/energie$/, '-'), 'energie'] : [l]); }, []);
  }

  function svg(o) {
    var unit = o.unit || '%', ga = o.ga || 100, bw = o.bw || 108, head = 22, ov = 10, ls = 10, r0 = 12, k;
    var all = [].concat(o.zu, o.steps.reduce(function (a, s) { return a.concat(s.out || [], s.loss || []); }, []));
    var vmax = Math.max.apply(null, [o.zu.reduce(function (t, x) { return t + x[1]; }, 0)].concat(all.map(function (x) { return x[1]; })));
    k = (o.max || 72) / (vmax || 1);
    var W = function (v) { return v > 0 ? Math.max(v * k, 3) : 0; };
    var maxw = vmax * k, T = 88, bh = maxw + 44, by = T - 22, P = [], L = [], x = 8, lowest = by + bh;
    function poly(pts, fill, z) { P.push([z || 2, '<polygon points="' + pts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ') + '" fill="' + fill + '" stroke="' + INK + '" stroke-width="1.6" stroke-linejoin="miter"/>']); }
    function path(d, fill) { P.push([1, '<path d="' + d + '" fill="' + fill + '" stroke="' + INK + '" stroke-width="1.5" stroke-linejoin="round"/>']); }
    var maxX = 0;
    function text(tx, ty, lines, anchor, bold, size) {
      var tw = Math.max.apply(null, lines.map(function (l) { return String(l).length; })) * (size || 13) * (bold ? 0.6 : 0.55);
      maxX = Math.max(maxX, anchor === 'start' ? tx + tw : anchor === 'middle' ? tx + tw / 2 : tx);
      L.push('<text x="' + tx.toFixed(1) + '" y="' + ty.toFixed(1) + '" text-anchor="' + anchor + '" style="font:' + (bold ? 700 : 400) + ' ' + (size || 13) + 'px var(--f-text, sans-serif)" fill="' + INK + '">' +
        lines.map(function (l, i) { return '<tspan x="' + tx.toFixed(1) + '" dy="' + (i ? '1.15em' : 0) + '">' + esc(l) + '</tspan>'; }).join('') + '</text>');
    }
    function val(e) { return e[3] != null ? e[3] : num(e[1]) + ' ' + unit; }
    function arrow(x1, x2, top, w, fill, hov) {
      var h = hov == null ? ov : hov, c = top + w / 2;
      poly([[x1, top], [x2 - head, top], [x2 - head, top - h], [x2, c], [x2 - head, top + w + h], [x2 - head, top + w], [x1, top + w]], fill);
    }
    /* abbiegender Pfeil: beginnt bei (xr, top), Breite w, Innenradius ri, Spitze bei yEnd */
    function bend(xr, top, w, ri, yEnd, fill) {
      var cx = xr + ls, R = ri + w, cy = top + R, xo = cx + R, xi = cx + ri, a = Math.min(16, w / 2 + 8), o2 = Math.min(6, w / 3 + 3), tip = (xo + xi) / 2;
      path('M' + xr + ' ' + top + ' H' + cx + ' A' + R + ' ' + R + ' 0 0 1 ' + xo + ' ' + cy + ' V' + (yEnd - a) + ' H' + (xo + o2) + ' L' + tip + ' ' + yEnd +
        ' L' + (xi - o2) + ' ' + (yEnd - a) + ' H' + xi + ' V' + cy + ' A' + ri + ' ' + ri + ' 0 0 0 ' + cx + ' ' + (top + w) + ' H' + xr + ' Z', fill);
      return { xo: xo, xi: xi, cy: cy };
    }
    /* Eingänge */
    var acc = 0;
    o.zu.forEach(function (e, i) { var w = W(e[1]); arrow(x, x + ga, T + acc, w, F[e[0]][1], o.zu.length > 1 ? 0 : null); acc += w; });
    if (o.zu.length === 1) { var zl = split(o.zu[0][2] || F[o.zu[0][0]][0]).concat([val(o.zu[0])]); text(x + (ga - head) / 2, T - 12 - (zl.length - 1) * 15, zl, 'middle', true); }
    else o.zu.forEach(function (e, i) {   /* zwei Eingänge: oberer beschriftet über dem Pfeil, unterer darunter */
      var l = split(e[2] || F[e[0]][0]).concat([val(e)]), cx = x + (ga - head) / 2;
      if (i === 0) text(cx, T - 12 - (l.length - 1) * 15, l, 'middle', true);
      else { text(cx, T + acc + 20, l, 'middle', true); lowest = Math.max(lowest, T + acc + 20 + (l.length - 1) * 15 + 6); }
    });
    x += ga;
    var tailBase = by + bh + 76, labelsBelow = [];
    o.steps.forEach(function (st, si) {
      var last = si === o.steps.length - 1, outs = (st.out || []).filter(function (e) { return e[1] > 0; });
      P.push([4, '<rect x="' + x + '" y="' + by + '" width="' + bw + '" height="' + bh + '" rx="5" fill="#fff" stroke="' + INK + '" stroke-width="2.4"/>']);
      L.push('<text x="' + (x + bw / 2) + '" y="' + (by + bh / 2) + '" text-anchor="middle" dominant-baseline="middle" style="font:700 14px var(--f-text, sans-serif)" fill="' + INK + '">' +
        st.name.split('\n').map(function (l, i, a) { return '<tspan x="' + (x + bw / 2) + '" dy="' + (i ? '1.15em' : (-(a.length - 1) * 0.575) + 'em') + '">' + esc(l) + '</tspan>'; }).join('') + '</text>');
      var xr = x + bw, y = T;
      /* gerade Ausgänge: im letzten Wandler alle gestapelt, sonst nur der erste */
      var straight = last ? outs : outs.slice(0, 1), bendUsed = last ? [] : outs.slice(1);
      straight.forEach(function (e, i) {
        var w = W(e[1]);
        arrow(xr, xr + ga, y, w, F[e[0]][1], straight.length > 1 ? 0 : null);
        if (straight.length > 1) text(xr + ga + 6, i ? y + w / 2 + 2 : y + w / 2 - 16, [(e[2] || F[e[0]][0]), val(e)], 'start', true, 12.5);
        else { var ol = split(e[2] || F[e[0]][0]).concat([val(e)]); text(xr + (ga - head) / 2, T - 12 - (ol.length - 1) * 15, ol, 'middle', true); }
        y += w;
      });
      /* abbiegende Pfeile: zuerst weitere genutzte Ausgänge, dann nicht genutzte Energie; der unterste hat den kleinsten Radius */
      var bends = bendUsed.map(function (e) { return { e: e, used: true }; }).concat((st.loss || []).filter(function (e) { return e[1] > 0; }).map(function (e) { return { e: e }; }));
      var segs = [], yy = y; bends.forEach(function (b) { var w = W(b.e[1]); segs.push({ b: b, top: yy, w: w }); yy += w; });
      var ri = r0;
      for (var j = segs.length - 1; j >= 0; j--) { segs[j].ri = ri; ri += segs[j].w + 4; }
      segs.forEach(function (g, j) {
        var yEnd = tailBase + (segs.length > 1 ? 0 : 0);
        var res = bend(xr, g.top, g.w, g.ri, yEnd, g.b.used ? F[g.b.e[0]][1] : light(F[g.b.e[0]][1], 0.12));
        var nm = g.b.e[2] || (F[g.b.e[0]][0] + (g.b.used ? ' (genutzt)' : ' (nicht genutzt)'));
        var right = j === 0;   /* äußerster Pfeil: Text rechts, innere: links */
        text(right ? res.xo + 7 : res.xi - 7, yEnd - 34, split(nm).concat([val(g.b.e)]), right ? 'start' : 'end', !!g.b.used, 12);
        lowest = Math.max(lowest, yEnd + 6);
      });
      x = xr + ga;
    });
    var lastSt = o.steps[o.steps.length - 1] || {}, multi = (lastSt.out || []).filter(function (e) { return e[1] > 0; }).length > 1;
    var Wd = Math.max(x + 12, maxX + 8);
    var H = Math.max(lowest, by + bh) + 8;
    P.sort(function (a, b) { return a[0] - b[0]; });
    return '<svg class="fluss" width="' + Wd.toFixed(0) + '" style="width:' + Wd.toFixed(0) + 'px;max-width:100%;height:auto" viewBox="0 0 ' + Wd.toFixed(0) + ' ' + H.toFixed(0) + '" role="img" aria-label="Energieflussdiagramm">' + P.map(function (p) { return p[1]; }).join('') + L.join('') + '</svg>';
  }
  /* Energieumwandlungskette (ohne Werte): kt = [form, 'Langform (Herkunft)', [[Wandler, form, 'Langform (Herkunft)'], ...]]
     Liefert den Inhalt für ein Element mit class="kette" (CSS in style.css). */
  function kette(kt) {
    function ph(f, t) {
      var m = /\(([^)]+)\)/.exec(t || ''), c = F[f][1], a = AB[f], P = ' fill="' + c + '" stroke="#1f1f1f" stroke-width="1.5" stroke-linejoin="round"';
      return '<div class="ka"><svg class="ah" width="92" height="36" viewBox="0 0 92 36" aria-hidden="true"><polygon points="1,1 76,1 91,18 76,35 1,35"' + P + '/><text x="38.5" y="24" text-anchor="middle">' + a + '</text></svg>' +
        '<svg class="av" width="96" height="58" viewBox="0 0 96 58" aria-hidden="true"><polygon points="1,1 95,1 95,38 48,57 1,38"' + P + '/><text x="48" y="27" text-anchor="middle">' + a + '</text></svg>' +
        '<div class="kc"><span class="sr-only">' + a + ': </span>' + esc(F[f][0]) + (m ? '<br>' + esc(m[1]) : '') + '</div></div>';
    }
    /* alle Wandler so breit wie die längste Zeile; Zeilenumbruch im Namen mit \n */
    var ml = Math.max.apply(null, kt[2].map(function (w) { return Math.max.apply(null, w[0].split('\n').map(function (l) { return l.length; })); })), wd = Math.round(ml * 8.4 + 20);
    return ph(kt[0], kt[1]) + kt[2].map(function (w) { return '<div class="kw" style="width:' + wd + 'px">' + w[0].split('\n').map(esc).join('<br>') + '</div>' + ph(w[1], w[2]); }).join('');
  }
  window.Fluss = { svg: svg, kette: kette, F: F, AB: AB };
})();
