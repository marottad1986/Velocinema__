const { seg, eo, eio, lerp } = kit;
kit.scene('prima', {
  init(kit) {
    let seats = '';
    for (let r = 0; r < 3; r++) for (let i = 0; i < 7; i++) { const x = 60 + i * 150 + (r % 2) * 40; const y = 1540 + r * 130; seats += '<g transform="translate(' + x + ' ' + y + ')"><rect x="-56" y="-90" width="112" height="100" rx="20" fill="#9E2F3A" stroke="#0F0C22" stroke-width="6"/><rect x="-60" y="0" width="120" height="30" rx="8" fill="#7A222C" stroke="#0F0C22" stroke-width="6"/></g>'; }
    kit.stage.append(kit.h('<div class="ground"><svg class="full" viewBox="0 0 1080 1920"><g class="pri-cam">' +
      '<rect width="1080" height="1920" fill="#1A1430"/>' +
      '<rect x="120" y="560" width="840" height="700" fill="#2C2456"/>' +
      '<path class="pri-spot" d="M500 520 L580 520 L760 1300 L320 1300 Z" fill="#FFF2C8" opacity=".22"/>' +
      '<ellipse cx="540" cy="1270" rx="230" ry="40" fill="#FFF2C8" opacity=".3"/>' +
      '<g transform="translate(540 1270)"><ellipse cx="0" cy="-150" rx="60" ry="14" fill="#8C6B52" stroke="#0F0C22" stroke-width="6"/><path d="M-40 -140 L-56 0 M40 -140 L56 0 M-48 -60 H48" stroke="#0F0C22" stroke-width="9"/></g>' +
      '<path class="pri-cl" d="M0 480 H260 Q220 700 250 900 Q210 1100 250 1300 H0 Z" fill="#B5333F" stroke="#0F0C22" stroke-width="8"/>' +
      '<path class="pri-cr" d="M1080 480 H820 Q860 700 830 900 Q870 1100 830 1300 H1080 Z" fill="#B5333F" stroke="#0F0C22" stroke-width="8"/>' +
      '<path d="M60 560 Q120 900 80 1300 M140 560 Q190 900 160 1300 M1020 560 Q960 900 1000 1300 M940 560 Q890 900 920 1300" fill="none" stroke="#8A2430" stroke-width="8"/>' +
      '<path d="M0 480 H1080 V580 Q960 620 840 580 Q720 620 600 580 Q480 620 360 580 Q240 620 120 580 Q60 600 0 580 Z" fill="#9E2F3A" stroke="#0F0C22" stroke-width="8"/>' +
      '<path d="M60 1260 H1020 V1320 H60 Z" fill="#8C6B52" stroke="#0F0C22" stroke-width="8"/>' +
      '<path d="M0 1320 H1080 V1920 H0 Z" fill="#120E22"/>' + seats +
      '<g transform="translate(370 1500) rotate(-10)"><rect x="-50" y="-34" width="100" height="68" fill="#F6F1E9" stroke="#0F0C22" stroke-width="4"/><path d="M-34 -12 H34 M-34 6 H20" stroke="#6B4FA0" stroke-width="5"/></g>' +
      '</g></svg></div>'));
    for (const k of ['cam', 'spot', 'cl', 'cr']) this[k] = kit.stage.querySelector('.pri-' + k);
    this.st = UI.over(kit, 'La prima');
  },
  render(t) {
    UI.tick(this.st, t);
    UI.push(this.cam, t, 11, 540, 1200, 0.06);
    const fl = 0.22 + Math.sin(t * 1.3) * 0.03 - (t > 6 && t < 6.2 ? 0.1 : 0);
    this.spot.setAttribute('opacity', fl);
    this.cl.setAttribute('transform', 'translate(' + Math.sin(t * 0.8) * 5 + ' 0)');
    this.cr.setAttribute('transform', 'translate(' + Math.sin(t * 0.8 + 1) * -5 + ' 0)');
  },
});