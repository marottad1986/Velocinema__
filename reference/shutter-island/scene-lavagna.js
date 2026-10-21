const { seg, eo, eio, lerp } = kit;
const LV = [
  { s: 'EDWARD DANIELS', y: 600, c: '#EEF3F2', a: 1.5 },
  { s: 'ANDREW LAEDDIS', y: 780, c: '#FFB27F', a: 5.5 },
  { s: 'RACHEL SOLANDO', y: 970, c: '#EEF3F2', a: 11 },
  { s: 'DOLORES CHANAL', y: 1150, c: '#FFD25C', a: 15 }
];
kit.scene('lavagna', {
  init(kit) {
    let txt = '';
    LV.forEach(function (r, i) { txt += '<text class="chalk lavagna-r' + i + '" x="540" y="' + r.y + '" text-anchor="middle" style="font-size:82px;fill:' + r.c + '">' + r.s + '</text>'; });
    kit.stage.append(kit.h('<div class="ground"><svg class="full" viewBox="0 0 1080 1920"><g class="lavagna-cam">' +
      '<rect width="1080" height="1920" fill="#8FA19A"/>' +
      '<path d="M0 140 Q540 110 1080 140 M0 280 Q540 250 1080 280 M0 420 Q540 390 1080 420 M0 560 Q540 530 1080 560 M0 700 Q540 670 1080 700 M0 840 Q540 810 1080 840 M0 980 Q540 950 1080 980 M0 1120 Q540 1090 1080 1120 M0 1260 Q540 1230 1080 1260" fill="none" stroke="#7C8F86" stroke-width="6"/>' +
      '<path d="M60 0 V1300 M60 200 L160 260 M60 420 L160 480 M60 640 L160 700 M60 860 L160 920 M60 1080 L160 1140" stroke="#15202B" stroke-width="12" stroke-linecap="round"/>' +
      '<path d="M0 1300 H1080 V1920 H0 Z" fill="#6E5844"/><path d="M0 1300 H1080" stroke="#15202B" stroke-width="10"/><path d="M0 1460 H1080 M0 1640 H1080 M0 1820 H1080" stroke="#5C4938" stroke-width="6"/>' +
      '<path d="M300 1240 L250 1560 M780 1240 L830 1560" stroke="#15202B" stroke-width="18" stroke-linecap="round"/>' +
      '<rect x="180" y="470" width="720" height="790" rx="14" fill="#8A6F55" stroke="#15202B" stroke-width="12"/>' +
      '<rect x="212" y="502" width="656" height="726" fill="#24343F"/>' + txt +
      '<path class="lavagna-a1" d="M540 632 V700 M520 682 L540 704 L560 682" fill="none" stroke="#EEF3F2" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path class="lavagna-a2" d="M540 1002 V1070 M520 1052 L540 1074 L560 1052" fill="none" stroke="#EEF3F2" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path class="lavagna-u1" d="M300 800 Q540 830 790 796" fill="none" stroke="#FFB27F" stroke-width="7" stroke-linecap="round" pathLength="1" stroke-dasharray="1"/>' +
      '<path class="lavagna-u2" d="M290 1170 Q540 1200 800 1166" fill="none" stroke="#FFD25C" stroke-width="7" stroke-linecap="round" pathLength="1" stroke-dasharray="1"/>' +
      '<rect x="190" y="1250" width="700" height="26" fill="#8A6F55" stroke="#15202B" stroke-width="8"/>' +
      '<path d="M560 1540 H1080 V1620 H560 Z" fill="#5C4938" stroke="#15202B" stroke-width="10"/><path d="M600 1620 V1920 M1040 1620 V1920" stroke="#15202B" stroke-width="20"/>' +
      '<path d="M940 1540 L940 1420 L860 1360" fill="none" stroke="#15202B" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M800 1330 L900 1310 L890 1400 Z" fill="#FF6B2C" stroke="#15202B" stroke-width="8" stroke-linejoin="round"/>' +
      '<path class="lavagna-lamp" d="M830 1395 L680 1540 L980 1540 Z" fill="#FFD25C" opacity=".3"/>' +
      '<rect x="620" y="1500" width="200" height="40" rx="4" fill="#F4F7F8" stroke="#15202B" stroke-width="6" transform="rotate(-4 720 1520)"/>' +
      '<rect x="120" y="1500" width="300" height="40" rx="10" fill="#8A6F55" stroke="#15202B" stroke-width="9"/><rect x="130" y="1300" width="40" height="210" fill="#8A6F55" stroke="#15202B" stroke-width="9"/>' +
      '<path d="M140 1540 V1820 M400 1540 V1820" stroke="#15202B" stroke-width="18" stroke-linecap="round"/>' +
      '</g></svg></div>'));
    this.cam = kit.stage.querySelector('.lavagna-cam');
    this.rows = LV.map(function (r, i) {
      const el = kit.stage.querySelector('.lavagna-r' + i);
      const s = el.textContent; el.textContent = '';
      const spans = s.split('').map(function (ch) { const sp = document.createElementNS('http://www.w3.org/2000/svg', 'tspan'); sp.textContent = ch; el.appendChild(sp); return sp; });
      return { spans: spans, a: r.a };
    });
    for (const k of ['a1', 'a2', 'u1', 'u2', 'lamp']) this[k] = kit.stage.querySelector('.lavagna-' + k);
    this.st = UI.over(kit, 'Il colpo di scena', { plate: true });
  },
  render(t) {
    UI.tick(this.st, t); this.st.F = 1.571; t = t * 1.571;
    UI.push(this.cam, t, 22, 540, 860, 0.06);
    this.rows.forEach(function (r) { r.spans.forEach(function (sp, i) { sp.style.opacity = seg(t, r.a + i * 0.1, r.a + i * 0.1 + 0.12); }); });
    this.a1.style.opacity = eo(seg(t, 4, 4.5));
    this.a2.style.opacity = eo(seg(t, 13.5, 14));
    this.u1.style.strokeDashoffset = 1 - eo(seg(t, 7.3, 8));
    this.u2.style.strokeDashoffset = 1 - eo(seg(t, 16.8, 17.5));
    this.lamp.setAttribute('opacity', 0.3 + Math.sin(t * 1.3) * 0.03);
  },
});