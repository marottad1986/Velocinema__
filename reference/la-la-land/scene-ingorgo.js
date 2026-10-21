const { seg, eo, eio, lerp } = kit;
function car(x, y, s, col) {
  return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><path d="M-100 0 V-40 Q-96 -56 -70 -60 L-44 -96 Q-38 -104 -26 -104 H40 Q52 -104 60 -94 L84 -60 Q100 -56 100 -40 V0 Z" fill="' + col + '" stroke="#1C1838" stroke-width="6" stroke-linejoin="round"/>' +
    '<path d="M-36 -62 L-20 -90 H8 V-62 Z M18 -62 V-90 H40 L64 -62 Z" fill="#BFE1F0" stroke="#1C1838" stroke-width="4"/>' +
    '<circle cx="-56" cy="0" r="20" fill="#1C1838"/><circle cx="56" cy="0" r="20" fill="#1C1838"/><circle cx="-56" cy="0" r="8" fill="#C9C2D8"/><circle cx="56" cy="0" r="8" fill="#C9C2D8"/></g>';
}
function palm(x, y, h) {
  return '<path d="M' + x + ' ' + y + ' Q' + (x + 16) + ' ' + (y - h / 2) + ' ' + (x + 6) + ' ' + (y - h) + '" fill="none" stroke="#3A2D63" stroke-width="12" stroke-linecap="round"/>' +
    '<path d="M' + (x + 6) + ' ' + (y - h) + ' q-60 -10 -100 30 M' + (x + 6) + ' ' + (y - h) + ' q60 -10 100 30 M' + (x + 6) + ' ' + (y - h) + ' q-40 -40 -80 -30 M' + (x + 6) + ' ' + (y - h) + ' q40 -40 80 -30" fill="none" stroke="#3A2D63" stroke-width="14" stroke-linecap="round"/>';
}
kit.scene('ingorgo', {
  init(kit) {
    const cols = ['#F2C14E', '#E86A5A', '#6B4FA0', '#4FA3C7', '#F6F1E9', '#7BC47F'];
    let row1 = '', row2 = '';
    for (let i = 0; i < 7; i++) row1 += car(-60 + i * 200, 1150, 0.8, cols[i % 6]);
    for (let i = 0; i < 5; i++) row2 += car(40 + i * 280, 1500, 1.2, cols[(i + 3) % 6]);
    kit.stage.append(kit.h('<div class="ground"><svg class="full" viewBox="0 0 1080 1920"><g class="ing-cam">' +
      '<rect width="1080" height="1920" fill="#FFD9A0"/><rect y="700" width="1080" height="400" fill="#FFC98A"/>' +
      '<g class="ing-sun"><circle cx="800" cy="700" r="120" fill="#F2C14E"/><path d="M800 520 V480 M800 880 V920 M620 700 H580 M980 700 H1020 M672 572 L644 544 M928 828 L956 856 M928 572 L956 544 M672 828 L644 856" stroke="#F2C14E" stroke-width="12" stroke-linecap="round"/></g>' +
      '<path d="M0 980 Q200 940 380 970 Q600 900 800 960 Q960 930 1080 960 V1100 H0 Z" fill="#C7A3C9"/>' +
      palm(120, 1080, 300) + palm(980, 1080, 340) + palm(860, 1080, 240) +
      '<path d="M-20 1080 H1100 V1180 H-20 Z" fill="#8D8AA0" stroke="#1C1838" stroke-width="8"/>' +
      '<path d="M0 1130 H1080" stroke="#F6F1E9" stroke-width="6" stroke-dasharray="40 30"/>' +
      '<g class="ing-r1">' + row1 + '</g>' +
      '<path d="M-20 1180 H1100 V1230 H-20 Z" fill="#6E6A86" stroke="#1C1838" stroke-width="8"/>' +
      '<path d="M100 1230 V1420 M520 1230 V1420 M940 1230 V1420" stroke="#6E6A86" stroke-width="60"/>' +
      '<path d="M-20 1420 H1100 V1920 H-20 Z" fill="#A6A2B8"/><path d="M0 1560 H1080" stroke="#F6F1E9" stroke-width="8" stroke-dasharray="60 40"/>' +
      '<g class="ing-r2">' + row2 + '</g>' +
      '<g class="ing-beep" transform="translate(400 1360)"><path d="M0 0 q30 -30 0 -60 M30 10 q50 -40 0 -80 M60 20 q70 -60 0 -110" fill="none" stroke="#E86A5A" stroke-width="9" stroke-linecap="round"/></g>' +
      '<path class="ing-haze" d="M0 1430 q60 -16 120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0" fill="none" stroke="#FFF2D8" stroke-width="5" opacity=".6"/>' +
      '</g></svg></div>'));
    for (const k of ['cam', 'sun', 'r1', 'r2', 'beep', 'haze']) this[k] = kit.stage.querySelector('.ing-' + k);
    this.st = UI.over(kit, 'L’ingorgo', { dark: true });
  },
  render(t) {
    UI.tick(this.st, t);
    UI.push(this.cam, t, 9, 540, 1300, 0.05);
    this.sun.setAttribute('transform', 'rotate(' + t * 6 + ' 800 700)');
    this.r1.setAttribute('transform', 'translate(' + (Math.floor(t / 2) * 6 + eio(seg(t % 2, 1.4, 2)) * 6) + ' 0)');
    this.r2.setAttribute('transform', 'translate(' + (Math.sin(t * 0.7) * 6) + ' 0)');
    const b = (t > 4.6 && t < 6.6) ? eo(seg((t - 4.6) % 0.5, 0, 0.4)) : 0;
    this.beep.style.opacity = b;
    this.beep.setAttribute('transform', 'translate(400 1360) scale(' + (0.8 + b * 0.3) + ')');
    this.haze.setAttribute('transform', 'translate(' + (-((t * 40) % 240)) + ' ' + Math.sin(t * 3) * 3 + ')');
  },
});