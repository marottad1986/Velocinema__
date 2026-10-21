const { seg, eo, eio, lerp } = kit;
kit.scene('ospedale', {
  init(kit) {
    let win = '';
    for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) win += '<rect x="' + (190 + c * 100) + '" y="' + (720 + r * 110) + '" width="54" height="72" fill="' + ((r * 7 + c) % 5 === 2 ? '#FFD25C' : '#22313F') + '" stroke="#15202B" stroke-width="5"/>';
    let posts = '';
    for (let i = 0; i < 13; i++) posts += '<path d="M' + (20 + i * 86) + ' 1240 V1460"/>';
    let wire = 'M0 1240';
    for (let i = 0; i < 54; i++) wire += ' l10 -14 l10 14';
    kit.stage.append(kit.h('<div class="ground"><svg class="full" viewBox="0 0 1080 1920"><g class="ospedale-cam">' +
      '<rect width="1080" height="1920" fill="#22313F"/><rect width="1080" height="560" fill="#1C2A36"/>' +
      '<circle cx="880" cy="560" r="60" fill="#E9F0F2" opacity=".9"/>' +
      '<path d="M140 1240 V680 L540 560 L940 680 V1240 Z" fill="#B9C6C2" stroke="#15202B" stroke-width="10" stroke-linejoin="round"/>' +
      '<path d="M120 690 L540 560 L960 690" fill="none" stroke="#15202B" stroke-width="16" stroke-linejoin="round"/>' + win +
      '<rect x="490" y="1140" width="100" height="100" fill="#8A6F55" stroke="#15202B" stroke-width="6"/>' +
      '<path class="ospedale-spot" d="M150 640 L620 1500 L330 1560 Z" fill="#FFD25C" opacity=".22"/>' +
      '<rect x="100" y="620" width="100" height="640" fill="#7C8F86" stroke="#15202B" stroke-width="9"/>' +
      '<path d="M70 620 H230 L205 560 H95 Z" fill="#15202B"/><rect x="118" y="636" width="64" height="44" fill="#FFD25C" stroke="#15202B" stroke-width="6"/>' +
      '<path d="M0 1240 H1080 V1920 H0 Z" fill="#5E7A72"/><path d="M440 1920 L500 1460 H580 L640 1920 Z" fill="#8FA19A"/>' +
      '<g stroke="#15202B" stroke-width="8">' + posts + '<path d="M0 1270 H1080 M0 1340 H1080 M0 1410 H1080" stroke-width="5"/></g>' +
      '<path d="' + wire + '" fill="none" stroke="#15202B" stroke-width="5" stroke-linejoin="round"/>' +
      '<rect x="360" y="1150" width="34" height="340" fill="#15202B"/><rect x="686" y="1150" width="34" height="340" fill="#15202B"/>' +
      '<rect x="330" y="1090" width="420" height="92" rx="12" fill="#F4F7F8" stroke="#15202B" stroke-width="9"/>' +
      '<text x="540" y="1155" text-anchor="middle" style="font-family:var(--display, var(--sans, system-ui, sans-serif));font-size:52px;font-weight:800;fill:#15202B">ASHECLIFFE</text>' +
      '<g class="ospedale-l" stroke="#15202B" stroke-width="8"><path d="M394 1230 H540 M394 1300 H540 M394 1370 H540 M394 1440 H540 M440 1210 V1470 M490 1210 V1470"/></g>' +
      '<g class="ospedale-r" stroke="#15202B" stroke-width="8"><path d="M540 1230 H686 M540 1300 H686 M540 1370 H686 M540 1440 H686 M590 1210 V1470 M640 1210 V1470"/></g>' +
      '<g transform="translate(860 1560)"><rect x="-40" y="-60" width="80" height="60" fill="#15202B"/><path d="M-50 -60 L0 -100 L50 -60 Z" fill="#15202B"/><circle cx="0" cy="-30" r="10" fill="#FFD25C"/></g>' +
      '</g></svg></div>'));
    for (const k of ['cam', 'spot', 'l', 'r']) this[k] = kit.stage.querySelector('.ospedale-' + k);
    this.spot.style.transformBox = 'view-box';
    this.spot.style.transformOrigin = '150px 640px';
    this.st = UI.over(kit, 'Ashecliffe', { top: 380, size: 112 });
  },
  render(t) {
    UI.tick(this.st, t); this.st.F = 1.556; t = t * 1.556;
    UI.push(this.cam, t, 14, 540, 1300, 0.06);
    const o = eio(seg(t, 2, 4.5));
    this.l.setAttribute('transform', 'translate(' + (-o * 140) + ' 0)');
    this.r.setAttribute('transform', 'translate(' + (o * 140) + ' 0)');
    this.spot.style.transform = 'rotate(' + Math.sin(t * 0.7) * 16 + 'deg)';
  },
});