const { seg, eo, eio, lerp } = kit;
kit.scene('uragano', {
  init(kit) {
    let rain = '';
    for (let i = 0; i < 30; i++) rain += 'M' + ((i * 97) % 1160 - 40) + ' ' + ((i * 211) % 1500) + ' l-40 120 ';
    kit.stage.append(kit.h('<div class="ground"><svg class="full" viewBox="0 0 1080 1920"><g class="uragano-cam">' +
      '<rect width="1080" height="1920" fill="#1C2A36"/>' +
      '<path class="uragano-c1" d="M-140 0 H1220 V360 Q960 300 800 350 Q640 280 480 340 Q300 290 140 350 Q40 320 -140 350 Z" fill="#2C3E50"/>' +
      '<path class="uragano-c2" d="M-140 0 H1220 V200 Q900 150 700 190 Q500 130 300 190 Q120 150 -140 190 Z" fill="#33495C"/>' +
      '<path class="uragano-beam" d="M540 592 L1300 360 L1300 830 Z" fill="#FFD25C" opacity=".3"/>' +
      '<path class="uragano-rain" d="' + rain + '" stroke="#9CC3CA" stroke-width="6" stroke-linecap="round" opacity=".55"/>' +
      '<path d="M280 1260 Q360 1080 480 1110 Q560 1040 660 1080 Q780 1090 840 1260 Z" fill="#5E7A72" stroke="#15202B" stroke-width="10" stroke-linejoin="round"/>' +
      '<path d="M440 1150 L470 640 H610 L640 1150 Z" fill="#F4F7F8" stroke="#15202B" stroke-width="10" stroke-linejoin="round"/>' +
      '<path d="M458 820 H622 M450 980 H630" stroke="#FF6B2C" stroke-width="40"/>' +
      '<rect x="470" y="540" width="140" height="104" fill="#FFD25C" stroke="#15202B" stroke-width="10"/><path d="M505 540 V644 M575 540 V644" stroke="#15202B" stroke-width="7"/>' +
      '<circle class="uragano-lamp" cx="540" cy="592" r="26" fill="#FFF3C4"/>' +
      '<path d="M452 540 L540 470 L628 540 Z" fill="#15202B"/><path d="M450 644 H630" stroke="#15202B" stroke-width="14"/>' +
      '<rect x="520" y="1080" width="40" height="70" fill="#15202B"/>' +
      '<path class="uragano-sea" d="M-380 1250 Q-300 1200 -220 1250 T-60 1250 T100 1250 T260 1250 T420 1250 T580 1250 T740 1250 T900 1250 T1060 1250 T1220 1250 T1380 1250 V1920 H-380 Z" fill="#3E7C87"/>' +
      '<path class="uragano-sp1" d="M120 1240 Q160 1120 250 1170 Q300 1080 380 1180" fill="none" stroke="#F4F7F8" stroke-width="16" stroke-linecap="round"/>' +
      '<path class="uragano-sp2" d="M720 1230 Q770 1110 850 1160 Q910 1060 980 1190" fill="none" stroke="#F4F7F8" stroke-width="16" stroke-linecap="round"/>' +
      '<path class="uragano-w1" d="M-380 1360 Q-300 1320 -220 1360 T-60 1360 T100 1360 T260 1360 T420 1360 T580 1360 T740 1360 T900 1360 T1060 1360 T1220 1360 T1380 1360" fill="none" stroke="#7FB3BB" stroke-width="8" stroke-linecap="round"/>' +
      '<path class="uragano-w2" d="M-380 1470 Q-300 1430 -220 1470 T-60 1470 T100 1470 T260 1470 T420 1470 T580 1470 T740 1470 T900 1470 T1060 1470 T1220 1470 T1380 1470" fill="none" stroke="#7FB3BB" stroke-width="8" stroke-linecap="round" opacity=".7"/>' +
      '<path d="M-40 1920 L40 1640 Q220 1540 420 1610 Q560 1560 680 1660 L760 1920 Z" fill="#7C8F86" stroke="#15202B" stroke-width="10" stroke-linejoin="round"/>' +
      '<g class="uragano-h1">' + UI.hat() + '</g><g class="uragano-h2">' + UI.hat(' stroke="#9CC3CA" stroke-width="3"') + '</g>' +
      '</g></svg></div>'));
    for (const k of ['cam', 'c1', 'c2', 'beam', 'rain', 'lamp', 'sea', 'sp1', 'sp2', 'w1', 'w2', 'h1', 'h2']) this[k] = kit.stage.querySelector('.uragano-' + k);
    this.beam.style.transformBox = 'view-box';
    this.beam.style.transformOrigin = '540px 592px';
    this.st = UI.over(kit, 'L’uragano', { top: 352, size: 100 });
  },
  render(t) {
    UI.tick(this.st, t); this.st.F = 1.455; t = t * 1.455;
    UI.push(this.cam, t, 16, 540, 1000, 0.05);
    const a = t * 1.0;
    this.beam.style.transform = 'scaleX(' + Math.cos(a) + ')';
    this.lamp.setAttribute('r', 20 + Math.abs(Math.cos(a)) * 12);
    this.rain.setAttribute('transform', 'translate(' + (-((t * 70) % 97)) + ' ' + ((t * 640) % 211) + ')');
    this.c1.setAttribute('transform', 'translate(' + Math.sin(t * 0.4) * 60 + ' 0)');
    this.c2.setAttribute('transform', 'translate(' + Math.sin(t * 0.5 + 1) * -70 + ' 0)');
    const sw = Math.sin(t * 2.2) * 12;
    this.sea.setAttribute('transform', 'translate(' + (-((t * 90) % 320)) + ' ' + sw + ')');
    this.w1.setAttribute('transform', 'translate(' + (-((t * 120) % 320)) + ' ' + sw + ')');
    this.w2.setAttribute('transform', 'translate(' + (-((t * 100) % 320)) + ' ' + sw * 0.7 + ')');
    this.sp1.setAttribute('transform', 'translate(0 ' + (Math.sin(t * 2.2) * 30) + ')');
    this.sp2.setAttribute('transform', 'translate(0 ' + (Math.sin(t * 2.2 + 2) * 30) + ')');
    this.h1.setAttribute('transform', 'translate(330 1620) rotate(' + Math.sin(t * 3) * 2 + ')');
    const fly = eio(seg(t, 9, 11.5));
    const wob = Math.sin(t * 5) * 4 * (1 - seg(t, 8.8, 9));
    this.h2.setAttribute('transform', 'translate(' + lerp(560, 1250, fly) + ' ' + (lerp(1640, 800, fly) - Math.sin(fly * Math.PI) * 160) + ') rotate(' + (wob + fly * 300) + ')');
  },
});