const { seg, eo, eob, eio, lerp } = kit;
kit.scene('sogno', {
  init(kit) {
    let win = '';
    for (let i = 0; i < 22; i++) win += '<rect class="sog-w" x="' + (190 + (i * 37) % 600) + '" y="' + (820 + (i * 29) % 140) + '" width="10" height="14" fill="#FFE08A"/>';
    kit.stage.append(kit.h('<div class="ground"><svg class="full" viewBox="0 0 1080 1920"><g class="sog-cam">' +
      '<rect width="1080" height="1920" fill="#3A2D63"/><rect y="1260" width="1080" height="660" fill="#5A3A5E"/>' +
      '<rect x="160" y="540" width="660" height="480" rx="10" fill="#1C1838" stroke="#0F0C22" stroke-width="12"/>' +
      '<circle cx="680" cy="640" r="50" fill="#FFF6D8"/>' +
      '<path d="M160 1020 V860 H230 V800 H300 V880 H380 V760 H440 V900 H520 V820 H600 V870 H680 V790 H760 V880 H820 V1020 Z" fill="#2C2456"/>' + win +
      '<path d="M490 540 V1020 M160 780 H820" stroke="#0F0C22" stroke-width="12"/>' +
      '<path d="M140 540 Q190 780 140 1040 L120 1040 V540 Z M840 540 Q790 780 840 1040 L860 1040 V540 Z" fill="#C0608A" stroke="#0F0C22" stroke-width="7"/>' +
      '<path d="M0 1260 H1080" stroke="#0F0C22" stroke-width="8"/>' +
      '<g transform="translate(800 1420)"><rect x="-180" y="-320" width="360" height="360" fill="#2A1C1C" stroke="#0F0C22" stroke-width="8"/><rect x="-180" y="-120" width="360" height="40" fill="#F6F1E9" stroke="#0F0C22" stroke-width="5"/>' +
      '<path d="M-160 -120 V-96 M-120 -120 V-96 M-80 -120 V-96 M-20 -120 V-96 M20 -120 V-96 M80 -120 V-96 M120 -120 V-96" stroke="#0F0C22" stroke-width="10"/>' +
      '<rect x="-90" y="-260" width="180" height="110" fill="#F6F1E9" stroke="#0F0C22" stroke-width="5"/><path d="M-70 -230 H70 M-70 -205 H70 M-70 -180 H70" stroke="#0F0C22" stroke-width="3"/>' +
      '<g transform="translate(80 -340) rotate(8)"><rect x="-80" y="-40" width="160" height="80" fill="#F6F1E9" stroke="#0F0C22" stroke-width="4"/><text x="0" y="14" text-anchor="middle" style="font-family:var(--display, var(--sans, system-ui, sans-serif));font-size:38px;font-weight:800;fill:#6B4FA0">SEB’S</text></g></g>' +
      '<path d="M40 1380 H520 V1420 H40 Z" fill="#8C6B52" stroke="#0F0C22" stroke-width="8"/><path d="M70 1420 V1640 M490 1420 V1640" stroke="#0F0C22" stroke-width="16"/>' +
      '<g transform="translate(260 1380)"><path d="M-120 0 L-100 -90 H100 L120 0 Z" fill="#4FA3C7" stroke="#0F0C22" stroke-width="7" stroke-linejoin="round"/><rect x="-90" y="-60" width="180" height="30" fill="#0F0C22"/>' +
      '<path class="sog-page" d="M-70 -90 V-210 H70 V-90" fill="#F6F1E9" stroke="#0F0C22" stroke-width="5"/></g>' +
      '<g transform="translate(440 1380)"><path d="M-40 0 V-60 M-40 -60 L0 -120" stroke="#0F0C22" stroke-width="8" fill="none"/><path d="M-20 -150 L40 -110 L10 -80 Z" fill="#F2C14E" stroke="#0F0C22" stroke-width="5"/></g>' +
      '<path class="sog-lamp" d="M450 1270 L340 1380 L520 1380 Z" fill="#F2C14E" opacity=".25"/>' +
      '<g class="sog-f1"><rect x="-50" y="-34" width="100" height="68" fill="#F6F1E9" stroke="#0F0C22" stroke-width="4"/></g><g class="sog-f2"><rect x="-50" y="-34" width="100" height="68" fill="#F6F1E9" stroke="#0F0C22" stroke-width="4"/></g>' +
      '</g></svg></div>'));
    for (const k of ['cam', 'page', 'lamp', 'f1', 'f2']) this[k] = kit.stage.querySelector('.sog-' + k);
    this.wins = Array.prototype.slice.call(kit.stage.querySelectorAll('.sog-w'));
    this.st = UI.over(kit, 'I sogni');
  },
  render(t) {
    UI.tick(this.st, t);
    UI.push(this.cam, t, 9, 540, 1200, 0.06);
    UI.twinkle(this.wins, t * 0.6);
    const typing = eo(seg(t, 0.5, 6));
    this.page.setAttribute('transform', 'translate(0 ' + lerp(60, 0, typing) + ')');
    this.f1.setAttribute('transform', 'translate(' + (180 + Math.sin(t * 0.9) * 40) + ' ' + (1720 + Math.sin(t * 1.3) * 10) + ') rotate(' + (-12 + Math.sin(t) * 6) + ')');
    this.f2.setAttribute('transform', 'translate(' + (360 + Math.sin(t * 0.7 + 1) * 30) + ' ' + (1780 + Math.sin(t * 1.1) * 8) + ') rotate(' + (16 + Math.sin(t * 0.8) * 5) + ')');
    this.lamp.setAttribute('opacity', 0.25 + Math.sin(t * 1.5) * 0.02);
  },
});