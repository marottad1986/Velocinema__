const { seg, eo, eio, lerp } = kit;
kit.scene('grotta', {
  init(kit) {
    kit.stage.append(kit.h('<div class="ground"><svg class="full" viewBox="0 0 1080 1920"><g class="grotta-cam">' +
      '<rect width="1080" height="1920" fill="#22313F"/>' +
      '<path d="M300 1100 Q300 700 540 620 Q780 700 780 1100 Z" fill="#33495C"/>' +
      '<path class="grotta-rain" d="M380 700 l-20 60 M470 660 l-20 60 M560 680 l-20 60 M650 720 l-20 60 M420 820 l-20 60 M600 840 l-20 60 M700 880 l-20 60 M500 900 l-20 60" stroke="#9CC3CA" stroke-width="5" stroke-linecap="round" opacity=".6"/>' +
      '<path d="M300 1000 Q420 960 540 990 Q660 960 780 1000 V1100 H300 Z" fill="#3E7C87"/>' +
      '<circle class="grotta-glow" cx="540" cy="1440" r="420" fill="#FF6B2C" opacity=".22"/>' +
      '<path d="M0 0 H1080 V1920 H0 Z M180 1920 Q140 1200 300 900 Q420 560 540 560 Q660 560 780 900 Q940 1200 900 1920 Z" fill="#4E5F5A" fill-rule="evenodd" stroke="#15202B" stroke-width="10"/>' +
      '<path d="M60 300 Q140 380 110 520 M960 420 Q900 520 940 640 M80 900 Q150 980 110 1100 M990 1100 Q930 1180 970 1300" fill="none" stroke="#15202B" stroke-width="8" opacity=".5"/>' +
      '<path d="M180 1920 Q340 1560 540 1580 Q740 1560 900 1920 Z" fill="#5E7A72" stroke="#15202B" stroke-width="10"/>' +
      '<path d="M440 1520 L640 1470 M450 1470 L640 1530" stroke="#6E5844" stroke-width="28" stroke-linecap="round"/>' +
      '<path class="grotta-f1" d="" fill="#FFB27F"/><path class="grotta-f2" d="" fill="#FF6B2C"/>' +
      '<path d="M230 1640 Q280 1540 420 1560 L450 1640 Z" fill="#FF6B2C" stroke="#15202B" stroke-width="8" stroke-linejoin="round"/><path d="M260 1610 L420 1596" stroke="#F4F7F8" stroke-width="6"/>' +
      '<g transform="translate(760 1620)"><path d="M-40 0 V-70 H40 V0 Z" fill="#B9C6C2" stroke="#15202B" stroke-width="8"/><path d="M40 -54 q30 0 30 24 q0 24 -30 24" fill="none" stroke="#15202B" stroke-width="7"/></g>' +
      '<g transform="translate(680 1690)"><rect x="-60" y="-20" width="120" height="20" rx="4" fill="#F4EFE2" stroke="#15202B" stroke-width="5"/><rect x="-56" y="-38" width="110" height="18" rx="4" fill="#3E7C87" stroke="#15202B" stroke-width="5"/></g>' +
      '</g></svg></div>'));
    for (const k of ['cam', 'rain', 'glow', 'f1', 'f2']) this[k] = kit.stage.querySelector('.grotta-' + k);
    this.st = UI.over(kit, 'La grotta', { top: 380, size: 112 });
  },
  render(t) {
    UI.tick(this.st, t); this.st.F = 1.556; t = t * 1.556;
    UI.push(this.cam, t, 14, 540, 1450, 0.07);
    this.f1.setAttribute('d', UI.flame(540, 1500, 70, 200 + Math.sin(t * 4.3) * 16, t, 0));
    this.f2.setAttribute('d', UI.flame(540, 1500, 40, 120 + Math.sin(t * 5) * 10, t, 1.7));
    this.glow.setAttribute('r', 420 * (1 + Math.sin(t * 4) * 0.03));
    this.rain.setAttribute('transform', 'translate(' + (-((t * 40) % 20)) + ' ' + ((t * 360) % 60) + ')');
  },
});