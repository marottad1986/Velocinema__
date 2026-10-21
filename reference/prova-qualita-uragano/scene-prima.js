const { seg, eo, eio, lerp, TextFx } = kit;
const HAT = '<path d="M-110 0 Q0 -20 110 0 Q80 16 0 18 Q-80 16 -110 0 Z" fill="#15202B"/><path d="M-66 -6 L-56 -78 Q0 -100 56 -78 L66 -6 Z" fill="#15202B"/><path d="M-62 -26 H62" stroke="#FF6B2C" stroke-width="14"/>';
kit.scene('prima', {
  init(kit) {
    let rain = '';
    for (let i = 0; i < 30; i++) rain += 'M' + ((i * 97) % 1160 - 40) + ' ' + ((i * 211) % 1500) + ' l-40 120 ';
    kit.stage.append(kit.h('<div class="ground"><svg class="full" viewBox="0 0 1080 1920"><g class="pr-cam">' +
      '<rect width="1080" height="1920" fill="#1C2A36"/>' +
      '<path d="M-140 0 H1220 V360 Q960 300 800 350 Q640 280 480 340 Q300 290 140 350 Q40 320 -140 350 Z" fill="#2C3E50"/>' +
      '<path class="pr-beam" d="M540 592 L1300 360 L1300 830 Z" fill="#FFD25C" opacity=".3"/>' +
      '<path class="pr-rain" d="' + rain + '" stroke="#9CC3CA" stroke-width="6" stroke-linecap="round" opacity=".55"/>' +
      '<path d="M280 1260 Q360 1080 480 1110 Q560 1040 660 1080 Q780 1090 840 1260 Z" fill="#5E7A72" stroke="#15202B" stroke-width="10" stroke-linejoin="round"/>' +
      '<path d="M440 1150 L470 640 H610 L640 1150 Z" fill="#F4F7F8" stroke="#15202B" stroke-width="10" stroke-linejoin="round"/>' +
      '<path d="M458 820 H622 M450 980 H630" stroke="#FF6B2C" stroke-width="40"/>' +
      '<rect x="470" y="540" width="140" height="104" fill="#FFD25C" stroke="#15202B" stroke-width="10"/>' +
      '<path d="M452 540 L540 470 L628 540 Z" fill="#15202B"/><path d="M450 644 H630" stroke="#15202B" stroke-width="14"/>' +
      '<path class="pr-sea" d="M-380 1250 Q-300 1200 -220 1250 T-60 1250 T100 1250 T260 1250 T420 1250 T580 1250 T740 1250 T900 1250 T1060 1250 T1220 1250 T1380 1250 V1920 H-380 Z" fill="#3E7C87"/>' +
      '<path class="pr-w" d="M-380 1360 Q-300 1320 -220 1360 T-60 1360 T100 1360 T260 1360 T420 1360 T580 1360 T740 1360 T900 1360 T1060 1360 T1220 1360 T1380 1360" fill="none" stroke="#7FB3BB" stroke-width="8" stroke-linecap="round"/>' +
      '<path d="M-40 1920 L40 1640 Q220 1540 420 1610 Q560 1560 680 1660 L760 1920 Z" fill="#7C8F86" stroke="#15202B" stroke-width="10" stroke-linejoin="round"/>' +
      '<g transform="translate(330 1620)">' + HAT + '</g><g class="pr-h2">' + HAT + '</g>' +
      '</g></svg>' +
      '<p class="label">PRIMA</p><h2 class="stitle">L’uragano</h2></div>'));
    for (const k of ['cam', 'beam', 'rain', 'sea', 'w', 'h2']) this[k] = kit.stage.querySelector('.pr-' + k);
    this.title = kit.stage.querySelector('.stitle');
    this.beam.style.transformBox = 'view-box';
    this.beam.style.transformOrigin = '540px 592px';
  },
  render(t) {
    TextFx.fadeFromRight(this.title, t, -0.4);
    const z = 1 + 0.05 * eio(seg(t, 0, 8));
    this.cam.setAttribute('transform', 'translate(540 1000) scale(' + z + ') translate(-540 -1000)');
    this.beam.style.transform = 'scaleX(' + Math.cos(t * 1.4) + ')';
    this.rain.setAttribute('transform', 'translate(' + (-((t * 70) % 97)) + ' ' + ((t * 640) % 211) + ')');
    this.sea.setAttribute('transform', 'translate(' + (-((t * 90) % 320)) + ' ' + Math.sin(t * 2.2) * 12 + ')');
    this.w.setAttribute('transform', 'translate(' + (-((t * 120) % 320)) + ' ' + Math.sin(t * 2.2) * 12 + ')');
    const fly = eio(seg(t, 4, 6.5));
    this.h2.setAttribute('transform', 'translate(' + lerp(560, 1250, fly) + ' ' + (lerp(1640, 800, fly) - Math.sin(fly * Math.PI) * 160) + ') rotate(' + fly * 300 + ')');
  },
});