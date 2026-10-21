const { seg, eo, eio, lerp } = kit;
kit.scene('alba', {
  init(kit) {
    let prints = '';
    for (let i = 0; i < 10; i++) { const p = i / 9; const x = lerp(520, 820, p) + (i % 2 ? 16 : -16); const y = lerp(1500, 1120, p); const s = lerp(1, 0.4, p); prints += '<ellipse class="alba-p" cx="' + x + '" cy="' + y + '" rx="' + 18 * s + '" ry="' + 30 * s + '" fill="#7C8F86"/>'; }
    kit.stage.append(kit.h('<div class="ground"><svg class="full" viewBox="0 0 1080 1920"><g class="alba-cam">' +
      '<rect width="1080" height="1920" fill="#FFC9A3"/><rect width="1080" height="560" fill="#FFD9BC"/>' +
      '<circle class="alba-sun" cx="540" cy="1000" r="160" fill="#FFD25C" stroke="#15202B" stroke-width="8"/>' +
      '<path d="M0 1000 H1080 V1110 H0 Z" fill="#3E7C87"/>' +
      '<path class="alba-w" d="M-200 1040 Q-100 1024 0 1040 T200 1040 T400 1040 T600 1040 T800 1040 T1000 1040 T1200 1040 T1400 1040" fill="none" stroke="#FFD9BC" stroke-width="6" stroke-linecap="round" opacity=".7"/>' +
      '<path d="M800 1110 L816 820 H858 L874 1110 Z" fill="#F4F7F8" stroke="#15202B" stroke-width="8" stroke-linejoin="round"/><path d="M806 920 H868 M802 1010 H872" stroke="#FF6B2C" stroke-width="18"/>' +
      '<rect x="814" y="780" width="46" height="42" fill="#FFD25C" stroke="#15202B" stroke-width="7"/><path d="M806 780 L837 750 L868 780 Z" fill="#15202B"/>' +
      '<path d="M0 1110 Q540 1070 1080 1110 V1920 H0 Z" fill="#A9B8B4" stroke="#15202B" stroke-width="10"/>' + prints +
      '<path d="M0 1920 V1640 H300 V1540 H520 V1920 Z" fill="#8FA19A" stroke="#15202B" stroke-width="10" stroke-linejoin="round"/>' +
      '<path d="M0 1720 H300 M300 1620 H520" stroke="#15202B" stroke-width="6" opacity=".4"/>' +
      '<g transform="translate(400 1540) rotate(-8)">' + UI.hat() + '</g>' +
      '<path class="alba-g1" d="M0 0 q24 -22 48 0 q24 -22 48 0" fill="none" stroke="#15202B" stroke-width="7" stroke-linecap="round"/>' +
      '<path class="alba-g2" d="M0 0 q18 -16 36 0 q18 -16 36 0" fill="none" stroke="#15202B" stroke-width="6" stroke-linecap="round"/>' +
      '</g></svg></div>'));
    for (const k of ['cam', 'sun', 'w', 'g1', 'g2']) this[k] = kit.stage.querySelector('.alba-' + k);
    this.prints = Array.prototype.slice.call(kit.stage.querySelectorAll('.alba-p'));
    this.st = UI.over(kit, 'All’alba', { top: 390, size: 112, dark: true });
  },
  render(t) {
    UI.tick(this.st, t); this.st.F = 1.636; t = t * 1.636;
    UI.push(this.cam, t, 18, 700, 1200, 0.06);
    this.sun.setAttribute('cy', lerp(1060, 900, eio(seg(t, 0, 18))));
    this.w.setAttribute('transform', 'translate(' + (-((t * 30) % 400)) + ' 0)');
    this.g1.setAttribute('transform', 'translate(' + lerp(120, 900, t / 18) + ' ' + (640 + Math.sin(t * 2) * 20) + ')');
    this.g2.setAttribute('transform', 'translate(' + lerp(-40, 760, t / 18) + ' ' + (720 + Math.sin(t * 2.4 + 1) * 16) + ')');
    this.prints.forEach(function (p, i) { p.style.opacity = eo(seg(t, 4 + i * 0.6, 4.3 + i * 0.6)); });
  },
});