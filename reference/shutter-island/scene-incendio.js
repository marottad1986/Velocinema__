const { seg, eo, eob, eio, lerp } = kit;
kit.scene('incendio', {
  init(kit) {
    let win = '';
    for (let r = 0; r < 6; r++) for (let c = 0; c < 4; c++) { if (r === 2 && c === 2) continue; win += '<rect x="' + (200 + c * 180) + '" y="' + (640 + r * 150) + '" width="96" height="110" fill="' + ((r + c * 2) % 4 === 1 ? '#FFD25C' : '#22313F') + '" stroke="#15202B" stroke-width="6"/>'; }
    kit.stage.append(kit.h('<div class="ground"><svg class="full" viewBox="0 0 1080 1920"><g class="incendio-cam">' +
      '<rect width="1080" height="1920" fill="#1C2A36"/>' +
      '<circle class="incendio-glow" cx="608" cy="1000" r="200" fill="#FF6B2C" opacity=".3"/>' +
      '<rect x="150" y="580" width="780" height="1340" fill="#8FA19A" stroke="#15202B" stroke-width="10"/>' +
      '<path d="M130 580 H950 V540 H130 Z" fill="#15202B"/>' + win +
      '<rect x="560" y="940" width="96" height="110" fill="#15202B" stroke="#15202B" stroke-width="6"/>' +
      '<path class="incendio-f1" d="" fill="#FFB27F"/><path class="incendio-f2" d="" fill="#FF6B2C"/>' +
      '<path class="incendio-sm" d="M610 880 q-50 -70 0 -140 q50 -70 0 -140 q-50 -70 0 -140" fill="none" stroke="#5E7A72" stroke-width="46" stroke-linecap="round" opacity=".6"/>' +
      '<path d="M0 1700 H1080 V1920 H0 Z" fill="#22313F"/>' +
      '<g class="incendio-box"><rect x="-260" y="-140" width="520" height="280" rx="14" fill="#F4F7F8" stroke="#15202B" stroke-width="10"/>' +
      '<rect x="-230" y="-110" width="460" height="220" rx="8" fill="#FF6B2C" stroke="#15202B" stroke-width="7"/>' +
      '<text x="0" y="-24" text-anchor="middle" style="font-family:var(--display, var(--sans, system-ui, sans-serif));font-size:42px;font-weight:800;fill:#15202B">FIAMMIFERI</text>' +
      '<text x="0" y="56" text-anchor="middle" style="font-family:var(--display, var(--sans, system-ui, sans-serif));font-size:62px;font-weight:800;fill:#F4F7F8">A. LAEDDIS</text>' +
      '<g transform="translate(200 -170) rotate(30)"><rect x="-9" y="0" width="18" height="180" fill="#8A6F55" stroke="#15202B" stroke-width="5"/><ellipse cx="0" cy="-8" rx="18" ry="24" fill="#FF6B2C" stroke="#15202B" stroke-width="5"/></g></g>' +
      '</g></svg></div>'));
    for (const k of ['cam', 'glow', 'f1', 'f2', 'sm', 'box']) this[k] = kit.stage.querySelector('.incendio-' + k);
    this.st = UI.over(kit, 'L’incendio', { top: 380, size: 112 });
  },
  render(t) {
    UI.tick(this.st, t); this.st.F = 1.455; t = t * 1.455;
    UI.push(this.cam, t, 16, 608, 1050, 0.08);
    const g = eio(seg(t, 0.5, 5));
    this.f1.setAttribute('d', UI.flame(608, 1050, lerp(40, 100, g), lerp(80, 320, g), t, 0));
    this.f2.setAttribute('d', UI.flame(608, 1050, lerp(22, 56, g), lerp(40, 190, g), t, 1.6));
    this.glow.setAttribute('r', lerp(120, 380, g) * (1 + Math.sin(t * 4) * 0.03));
    this.sm.setAttribute('transform', 'translate(' + Math.sin(t) * 20 + ' ' + (-((t * 20) % 70)) + ')');
    this.sm.style.opacity = 0.6 * g;
    const bx = eob(seg(t, 8, 8.8), 1.4);
    this.box.setAttribute('transform', 'translate(' + lerp(1500, 560, bx) + ' 1500) rotate(' + lerp(22, -5, bx) + ')');
  },
});