const { seg, eo, eob, eio, lerp } = kit;
kit.scene('caffe', {
  init(kit) {
    kit.stage.append(kit.h('<div class="ground"><svg class="full" viewBox="0 0 1080 1920"><g class="caf-cam">' +
      '<rect width="1080" height="1920" fill="#CFE4F2"/><rect y="640" width="1080" height="400" fill="#E7D9EE"/>' +
      '<g><path d="M760 900 V700" stroke="#1C1838" stroke-width="10"/><path d="M700 900 L730 720 M820 900 L790 720" stroke="#1C1838" stroke-width="8"/>' +
      '<rect x="670" y="560" width="180" height="150" rx="20" fill="#F6F1E9" stroke="#1C1838" stroke-width="8"/><path d="M660 560 L760 500 L860 560 Z" fill="#6B4FA0" stroke="#1C1838" stroke-width="8" stroke-linejoin="round"/>' +
      '<text x="760" y="650" text-anchor="middle" style="font-family:var(--display, var(--sans, system-ui, sans-serif));font-size:34px;font-weight:800;fill:#1C1838">STUDIOS</text></g>' +
      '<path d="M40 1040 V820 Q210 720 380 820 V1040 Z" fill="#F2E3C4" stroke="#1C1838" stroke-width="8"/><text x="210" y="930" text-anchor="middle" style="font-family:var(--display, var(--sans, system-ui, sans-serif));font-size:44px;font-weight:800;fill:#6B4FA0">TEATRO 7</text>' +
      '<path d="M420 1040 V880 Q600 800 1080 880 V1040 Z" fill="#E8CFA8" stroke="#1C1838" stroke-width="8"/>' +
      '<path d="M0 1040 H1080 V1180 H0 Z" fill="#B8A9C9"/>' +
      '<path d="M60 1180 H1020 L1060 1100 H20 Z" fill="#E86A5A" stroke="#1C1838" stroke-width="8" stroke-linejoin="round"/>' +
      '<path d="M100 1180 L120 1100 M260 1180 L270 1100 M420 1180 L420 1100 M580 1180 L570 1100 M740 1180 L720 1100 M900 1180 L870 1100" stroke="#F6F1E9" stroke-width="20"/>' +
      '<path d="M0 1300 H1080 V1920 H0 Z" fill="#8C6B52"/><path d="M0 1300 H1080 V1350 H0 Z" fill="#A88265" stroke="#1C1838" stroke-width="8"/>' +
      '<g transform="translate(780 1300)"><path d="M-80 0 L-70 -110 H70 L80 0 Z" fill="#F6F1E9" stroke="#1C1838" stroke-width="8" stroke-linejoin="round"/><path d="M70 -86 q46 0 46 30 q0 30 -50 30" fill="none" stroke="#1C1838" stroke-width="8"/>' +
      '<rect x="-70" y="-80" width="140" height="30" fill="#6B4FA0"/><ellipse cx="0" cy="4" rx="120" ry="16" fill="#F6F1E9" stroke="#1C1838" stroke-width="7"/></g>' +
      '<path class="caf-st1" d="M760 1170 q-24 -36 0 -72 q24 -36 0 -72" fill="none" stroke="#F6F1E9" stroke-width="12" stroke-linecap="round"/>' +
      '<path class="caf-st2" d="M800 1170 q-24 -36 0 -72 q24 -36 0 -72" fill="none" stroke="#F6F1E9" stroke-width="10" stroke-linecap="round"/>' +
      '<g transform="translate(300 1310) rotate(-6)"><rect x="-180" y="-150" width="360" height="190" rx="6" fill="#F6F1E9" stroke="#1C1838" stroke-width="7"/>' +
      '<text x="-150" y="-96" style="font-family:var(--display, var(--sans, system-ui, sans-serif));font-size:34px;font-weight:800;fill:#1C1838">PROVINO</text>' +
      '<path d="M-150 -60 H120 M-150 -30 H90 M-150 0 H130" stroke="#1C1838" stroke-width="5" opacity=".35"/>' +
      '<g class="caf-no"><rect x="10" y="-130" width="150" height="80" rx="8" fill="none" stroke="#E86A5A" stroke-width="8"/><text x="85" y="-72" text-anchor="middle" style="font-family:var(--display, var(--sans, system-ui, sans-serif));font-size:52px;font-weight:800;fill:#E86A5A">NO</text></g></g>' +
      '</g></svg></div>'));
    for (const k of ['cam', 'st1', 'st2', 'no']) this[k] = kit.stage.querySelector('.caf-' + k);
    this.st = UI.over(kit, 'I provini', { dark: true });
  },
  render(t) {
    UI.tick(this.st, t);
    UI.push(this.cam, t, 9, 540, 1250, 0.06);
    this.st1.setAttribute('transform', 'translate(' + Math.sin(t * 1.6) * 8 + ' ' + (-((t * 14) % 30)) + ')');
    this.st2.setAttribute('transform', 'translate(' + Math.sin(t * 1.3 + 1) * 8 + ' ' + (-((t * 12) % 30)) + ')');
    const s = eob(seg(t, 5, 5.4), 1.8);
    this.no.style.opacity = seg(t, 5, 5.1);
    this.no.setAttribute('transform', 'translate(85 -90) scale(' + lerp(1.8, 1, s) + ') translate(-85 90)');
  },
});