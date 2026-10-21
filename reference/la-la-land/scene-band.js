const { seg, eo, eio, lerp } = kit;
kit.scene('band', {
  init(kit) {
    const bc = ['#E86ACB', '#7FE3F0', '#F2C14E', '#E86A5A'];
    let beams = '';
    for (let i = 0; i < 4; i++) beams += '<path class="ban-b" d="M' + (200 + i * 230) + ' 540 L' + (60 + i * 230) + ' 1400 L' + (340 + i * 230) + ' 1400 Z" fill="' + bc[i] + '" opacity=".28"/>';
    let crowd = '';
    for (let i = 0; i < 12; i++) { const x = 20 + i * 92; crowd += '<g class="ban-c" transform="translate(' + x + ' 1700)"><circle cx="0" cy="-90" r="40" fill="#0F0C22"/><path d="M-60 60 Q-60 -40 0 -44 Q60 -40 60 60 Z" fill="#0F0C22"/>' + (i % 3 === 1 ? '<path d="M30 -40 L60 -170" stroke="#0F0C22" stroke-width="22" stroke-linecap="round"/>' : '') + '</g>'; }
    kit.stage.append(kit.h('<div class="ground"><svg class="full" viewBox="0 0 1080 1920"><g class="ban-cam">' +
      '<rect width="1080" height="1920" fill="#120E26"/>' +
      '<path d="M0 500 H1080 V540 H0 Z" fill="#3A2D63" stroke="#0F0C22" stroke-width="6"/><path d="M0 500 L40 540 L80 500 L120 540 L160 500 L200 540 L240 500 L280 540 L320 500 L360 540 L400 500 L440 540 L480 500 L520 540 L560 500 L600 540 L640 500 L680 540 L720 500 L760 540 L800 500 L840 540 L880 500 L920 540 L960 500 L1000 540 L1040 500 L1080 540" fill="none" stroke="#0F0C22" stroke-width="4"/>' +
      beams +
      '<rect x="40" y="980" width="160" height="300" rx="10" fill="#231D48" stroke="#0F0C22" stroke-width="7"/><circle cx="120" cy="1060" r="44" fill="#0F0C22"/><circle cx="120" cy="1190" r="56" fill="#0F0C22"/>' +
      '<rect x="880" y="980" width="160" height="300" rx="10" fill="#231D48" stroke="#0F0C22" stroke-width="7"/><circle cx="960" cy="1060" r="44" fill="#0F0C22"/><circle cx="960" cy="1190" r="56" fill="#0F0C22"/>' +
      '<path d="M0 1280 H1080 V1380 H0 Z" fill="#3A2D63" stroke="#0F0C22" stroke-width="8"/>' +
      '<g transform="translate(560 1110)"><rect x="-130" y="-60" width="260" height="120" rx="10" fill="#5A3A78" stroke="#0F0C22" stroke-width="7"/><circle cx="-80" cy="0" r="40" fill="#E86A5A" stroke="#0F0C22" stroke-width="6"/><circle cx="60" cy="-20" r="34" fill="#F2C14E" stroke="#0F0C22" stroke-width="6"/></g>' +
      '<g transform="translate(330 1280)"><path d="M-60 0 L0 -100 L60 0 M-40 -40 H40" stroke="#0F0C22" stroke-width="10" fill="none"/><rect x="-150" y="-140" width="300" height="44" rx="6" fill="#F6F1E9" stroke="#0F0C22" stroke-width="6"/><path d="M-130 -140 V-114 M-100 -140 V-114 M-60 -140 V-114 M-30 -140 V-114 M10 -140 V-114 M40 -140 V-114 M80 -140 V-114 M110 -140 V-114" stroke="#0F0C22" stroke-width="9"/></g>' +
      '<g transform="translate(780 1280)"><path d="M-50 0 L0 -90 L50 0 M-34 -36 H34" stroke="#0F0C22" stroke-width="10" fill="none"/><rect x="-130" y="-130" width="260" height="40" rx="6" fill="#E86ACB" stroke="#0F0C22" stroke-width="6"/></g>' +
      '<path d="M0 1380 H1080 V1920 H0 Z" fill="#1A1538"/>' + crowd +
      '</g></svg></div>'));
    this.cam = kit.stage.querySelector('.ban-cam');
    this.beams = Array.prototype.slice.call(kit.stage.querySelectorAll('.ban-b'));
    this.crowd = Array.prototype.slice.call(kit.stage.querySelectorAll('.ban-c'));
    this.beams.forEach((b, i) => { b.style.transformBox = 'view-box'; b.style.transformOrigin = (200 + i * 230) + 'px 540px'; });
    this.st = UI.over(kit, 'La band');
  },
  render(t) {
    UI.tick(this.st, t);
    UI.push(this.cam, t, 11, 540, 1200, 0.05);
    this.beams.forEach((b, i) => { b.style.transform = 'rotate(' + Math.sin(t * 1.1 + i * 1.3) * 18 + 'deg)'; });
    this.crowd.forEach((c, i) => { const x = 20 + i * 92; c.setAttribute('transform', 'translate(' + x + ' ' + (1700 - Math.abs(Math.sin(t * 3.4 + i * 0.7)) * 16) + ')'); });
  },
});