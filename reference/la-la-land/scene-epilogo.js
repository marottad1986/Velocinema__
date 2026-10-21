const { seg, eo, eio, lerp } = kit;
kit.scene('epilogo', {
  init(kit) {
    let bricks = '';
    for (let r = 0; r < 14; r++) { bricks += 'M0 ' + (520 + r * 60) + ' H1080 '; for (let c = 0; c < 9; c++) { const x = c * 130 + (r % 2) * 65; bricks += 'M' + x + ' ' + (520 + r * 60) + ' V' + (580 + r * 60) + ' '; } }
    let notes = '';
    for (let i = 0; i < 3; i++) notes += '<g class="epi-n">' + UI.note() + '</g>';
    kit.stage.append(kit.h('<div class="ground"><svg class="full" viewBox="0 0 1080 1920"><g class="epi-cam">' +
      '<rect width="1080" height="1920" fill="#120E26"/>' +
      '<rect y="520" width="1080" height="840" fill="#5A2E36"/><path d="' + bricks + '" stroke="#3E1E26" stroke-width="5"/>' +
      '<g class="epi-neon"><rect x="240" y="600" width="600" height="220" rx="24" fill="#120E26" opacity=".6"/><rect x="240" y="600" width="600" height="220" rx="24" fill="none" stroke="#F2C14E" stroke-width="8"/>' +
      '<text x="500" y="760" text-anchor="middle" style="font-family:var(--display, var(--sans, system-ui, sans-serif));font-size:140px;font-weight:800;fill:none;stroke:#7FE3F0;stroke-width:6px">SEB’S</text>' +
      '<g transform="translate(760 760)"><path d="M0 0 v-90 l50 -14 v86" fill="none" stroke="#E86ACB" stroke-width="8" stroke-linecap="round"/><ellipse cx="-12" cy="2" rx="18" ry="13" fill="none" stroke="#E86ACB" stroke-width="7"/><ellipse cx="38" cy="-14" rx="18" ry="13" fill="none" stroke="#E86ACB" stroke-width="7"/></g></g>' +
      '<rect x="100" y="920" width="360" height="300" rx="10" fill="#F2C14E" opacity=".9" stroke="#0F0C22" stroke-width="10"/>' +
      '<g transform="translate(280 1220)"><path d="M-120 -60 Q-120 -120 -40 -120 H60 Q120 -120 120 -50 V-40 H-120 Z" fill="#0F0C22"/><path d="M-80 -120 L40 -210 L50 -200 L-40 -120 Z" fill="#0F0C22"/></g>' +
      '<path d="M280 920 V1220 M100 1070 H460" stroke="#0F0C22" stroke-width="8"/>' +
      '<rect x="600" y="960" width="240" height="400" fill="#FFE08A" stroke="#0F0C22" stroke-width="10"/><path d="M600 960 L540 1000 V1400 L600 1360 Z" fill="#3E1E26" stroke="#0F0C22" stroke-width="8"/>' +
      '<path class="epi-glow" d="M600 1360 H840 L1000 1700 H460 Z" fill="#FFE08A" opacity=".22"/>' +
      '<path d="M0 1360 H1080 V1920 H0 Z" fill="#1C1838"/><path d="M0 1360 H1080" stroke="#0F0C22" stroke-width="10"/>' +
      '<path class="epi-pud" d="M120 1700 Q300 1660 520 1700 Q300 1740 120 1700 Z" fill="#7FE3F0" opacity=".25"/>' +
      '<path d="M880 1360 V880" stroke="#0F0C22" stroke-width="14"/><circle cx="880" cy="870" r="20" fill="#FFE08A"/>' +
      notes + '</g></svg></div>'));
    for (const k of ['cam', 'neon', 'glow', 'pud']) this[k] = kit.stage.querySelector('.epi-' + k);
    this.notes = Array.prototype.slice.call(kit.stage.querySelectorAll('.epi-n'));
    this.st = UI.over(kit, 'Cinque anni dopo', { size: 96 });
  },
  render(t) {
    UI.tick(this.st, t);
    UI.push(this.cam, t, 12, 640, 1200, 0.07);
    const on = t < 0.7 ? 0.2 : ((t > 0.9 && t < 1.05) ? 0.3 : 1);
    this.neon.style.opacity = on;
    this.glow.setAttribute('opacity', 0.22 + Math.sin(t * 1.4) * 0.03);
    this.pud.setAttribute('opacity', 0.2 + Math.sin(t * 2) * 0.05);
    this.notes.forEach((n, i) => { const p = ((t + i * 1.3) % 4) / 4; n.setAttribute('transform', 'translate(' + (700 + Math.sin(p * 6 + i) * 40 + i * 30) + ' ' + (1250 - p * 380) + ') scale(' + (0.9 + i * 0.1) + ')'); n.style.opacity = Math.sin(p * Math.PI); });
  },
});