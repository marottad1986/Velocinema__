const { seg, eo, eio, lerp } = kit;
kit.scene('arrivo', {
  init(kit) {
    kit.stage.append(kit.h('<div class="ground"><svg class="full" viewBox="0 0 1080 1920"><g class="arrivo-cam">' +
      '<rect width="1080" height="1920" fill="#33525E"/><rect width="1080" height="420" fill="#2A4450"/><rect y="420" width="1080" height="300" fill="#3B5D69"/>' +
      '<circle cx="820" cy="300" r="90" fill="#E9F0F2"/><circle cx="850" cy="280" r="20" fill="#D5E3E7"/><circle cx="790" cy="330" r="14" fill="#D5E3E7"/>' +
      '<path class="arrivo-fog1" d="M-140 520 Q200 470 440 520 T920 520 T1300 510 V590 Q900 560 600 595 T-140 590 Z" fill="#E9F0F2" opacity=".18"/>' +
      '<path d="M170 980 Q300 760 470 800 Q600 680 760 760 Q900 740 1000 980 Z" fill="#5E7A72" stroke="#15202B" stroke-width="8" stroke-linejoin="round"/>' +
      '<path d="M330 820 V700 L480 650 L630 700 V820 Z" fill="#B9C6C2" stroke="#15202B" stroke-width="8" stroke-linejoin="round"/>' +
      '<path d="M330 700 L480 650 L630 700 L480 620 Z" fill="#7C8F86" stroke="#15202B" stroke-width="6" stroke-linejoin="round"/>' +
      '<g fill="#2C3E50" stroke="#15202B" stroke-width="4"><rect x="355" y="720" width="30" height="38"/><rect x="405" y="720" width="30" height="38"/><rect x="525" y="720" width="30" height="38"/><rect x="575" y="720" width="30" height="38"/></g>' +
      '<rect x="455" y="720" width="50" height="38" fill="#FFD25C" stroke="#15202B" stroke-width="4"/><rect x="465" y="770" width="30" height="50" fill="#8A6F55" stroke="#15202B" stroke-width="4"/>' +
      '<path class="arrivo-beam" d="M805 538 L1300 450 L1300 630 Z" fill="#FFD25C" opacity=".35"/>' +
      '<path d="M770 790 L784 560 H826 L840 790 Z" fill="#F4F7F8" stroke="#15202B" stroke-width="8" stroke-linejoin="round"/><path d="M776 640 H834 M778 710 H832" stroke="#FF6B2C" stroke-width="18"/>' +
      '<rect x="780" y="514" width="50" height="48" fill="#FFD25C" stroke="#15202B" stroke-width="8"/><path d="M772 514 L805 482 L838 514 Z" fill="#15202B"/>' +
      '<path class="arrivo-fog2" d="M-140 860 Q200 820 440 860 T920 860 T1300 850 V940 Q900 900 600 945 T-140 930 Z" fill="#E9F0F2" opacity=".22"/>' +
      '<path class="arrivo-sea" d="M-260 970 Q-160 945 -60 970 T140 970 T340 970 T540 970 T740 970 T940 970 T1140 970 T1340 970 V1920 H-260 Z" fill="#3E7C87"/>' +
      '<path class="arrivo-w1" d="M-260 1080 Q-160 1055 -60 1080 T140 1080 T340 1080 T540 1080 T740 1080 T940 1080 T1140 1080 T1340 1080" fill="none" stroke="#7FB3BB" stroke-width="6" stroke-linecap="round"/>' +
      '<path class="arrivo-w2" d="M-260 1200 Q-160 1172 -60 1200 T140 1200 T340 1200 T540 1200 T740 1200 T940 1200 T1140 1200 T1340 1200" fill="none" stroke="#7FB3BB" stroke-width="6" stroke-linecap="round" opacity=".7"/>' +
      '<g class="arrivo-boat"><g class="arrivo-smoke"><path d="M150 -420 q50 -60 120 -40 q50 -60 130 -20" fill="none" stroke="#B9C6C2" stroke-width="40" stroke-linecap="round"/><path d="M230 -480 q50 -40 110 -20" fill="none" stroke="#D5E3E7" stroke-width="26" stroke-linecap="round" opacity=".8"/></g>' +
      '<rect x="110" y="-410" width="80" height="150" fill="#15202B"/><rect x="110" y="-370" width="80" height="26" fill="#FF6B2C"/>' +
      '<rect x="-250" y="-280" width="480" height="180" rx="16" fill="#F4F7F8" stroke="#15202B" stroke-width="10"/>' +
      '<rect x="-210" y="-240" width="80" height="74" rx="6" fill="#FFD25C" stroke="#15202B" stroke-width="8"/><rect x="-100" y="-240" width="80" height="74" rx="6" fill="#FFD25C" stroke="#15202B" stroke-width="8"/><rect x="10" y="-240" width="80" height="74" rx="6" fill="#FFD25C" stroke="#15202B" stroke-width="8"/><rect x="120" y="-240" width="80" height="74" rx="6" fill="#2C3E50" stroke="#15202B" stroke-width="8"/>' +
      '<path d="M-260 -290 H240" stroke="#15202B" stroke-width="10"/><path d="M-240 -330 V-290 M-120 -330 V-290 M0 -330 V-290 M120 -330 V-290 M-250 -330 H140" fill="none" stroke="#15202B" stroke-width="7"/>' +
      '<path d="M-500 -100 H520 L420 90 H-400 Z" fill="#FF6B2C" stroke="#15202B" stroke-width="10" stroke-linejoin="round"/><path d="M-450 -40 H460" stroke="#F4F7F8" stroke-width="12"/>' +
      '<circle cx="-330" cy="20" r="28" fill="#F4F7F8" stroke="#15202B" stroke-width="8"/><circle cx="330" cy="20" r="28" fill="#F4F7F8" stroke="#15202B" stroke-width="8"/></g>' +
      '<path class="arrivo-sea2" d="M-260 1560 Q-160 1520 -60 1560 T140 1560 T340 1560 T540 1560 T740 1560 T940 1560 T1140 1560 T1340 1560 V1920 H-260 Z" fill="#336A73"/>' +
      '<path class="arrivo-w3" d="M-260 1640 Q-160 1610 -60 1640 T140 1640 T340 1640 T540 1640 T740 1640 T940 1640 T1140 1640 T1340 1640" fill="none" stroke="#E9F0F2" stroke-width="10" stroke-linecap="round"/>' +
      '<path class="arrivo-g1" d="M0 0 q24 -22 48 0 q24 -22 48 0" fill="none" stroke="#15202B" stroke-width="7" stroke-linecap="round"/>' +
      '<path class="arrivo-g2" d="M0 0 q18 -16 36 0 q18 -16 36 0" fill="none" stroke="#15202B" stroke-width="6" stroke-linecap="round"/>' +
      '</g></svg></div>'));
    for (const k of ['cam', 'fog1', 'fog2', 'beam', 'sea', 'sea2', 'w1', 'w2', 'w3', 'boat', 'smoke', 'g1', 'g2']) this[k] = kit.stage.querySelector('.arrivo-' + k);
    this.st = UI.over(kit, 'L’arrivo', { top: 400, size: 112 });
    this.beam.style.transformBox = 'view-box';
    this.beam.style.transformOrigin = '805px 538px';
  },
  render(t) {
    UI.tick(this.st, t); this.st.F = 1.778; t = t * 1.778;
    UI.push(this.cam, t, 16, 540, 1100, 0.06);
    this.beam.style.transform = 'scaleX(' + Math.cos(t * 0.9) + ')';
    this.fog1.setAttribute('transform', 'translate(' + Math.sin(t * 0.3) * 80 + ' 0)');
    this.fog2.setAttribute('transform', 'translate(' + Math.sin(t * 0.35 + 2) * -90 + ' 0)');
    this.sea.setAttribute('transform', 'translate(' + (-((t * 40) % 400)) + ' ' + Math.sin(t * 1.6) * 6 + ')');
    this.w1.setAttribute('transform', 'translate(' + (-((t * 60) % 400)) + ' 0)');
    this.w2.setAttribute('transform', 'translate(' + (-((t * 50) % 400)) + ' 0)');
    this.sea2.setAttribute('transform', 'translate(' + (-((t * 90) % 400)) + ' ' + Math.sin(t * 1.6 + 1) * 10 + ')');
    this.w3.setAttribute('transform', 'translate(' + (-((t * 110) % 400)) + ' ' + Math.sin(t * 1.6 + 1) * 10 + ')');
    this.boat.setAttribute('transform', 'translate(' + lerp(470, 620, eio(seg(t, 0, 16))) + ' ' + (1430 + Math.sin(t * 1.7) * 12) + ') rotate(' + Math.sin(t * 1.7 + 0.7) * 2.5 + ')');
    this.smoke.setAttribute('transform', 'translate(' + (-((t * 24) % 40)) + ' ' + (-((t * 10) % 20)) + ')');
    this.g1.setAttribute('transform', 'translate(' + lerp(60, 700, (t % 16) / 16) + ' ' + (560 + Math.sin(t * 2) * 20) + ')');
    this.g2.setAttribute('transform', 'translate(' + lerp(-80, 560, (t % 16) / 16) + ' ' + (620 + Math.sin(t * 2.4 + 1) * 16) + ')');
  },
});