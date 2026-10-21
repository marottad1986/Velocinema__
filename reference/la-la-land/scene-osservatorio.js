const { seg, eo, eio, lerp } = kit;
kit.scene('osservatorio', {
  init(kit) {
    let rows = '';
    for (let r = 0; r < 3; r++) { let p = 'M-40 ' + (1500 + r * 120); for (let i = 0; i < 12; i++) p += ' q45 -50 90 0'; rows += '<path d="' + p + ' V1920 H-40 Z" fill="' + ['#2C2456', '#231D48', '#1A1538'][r] + '"/>'; }
    kit.stage.append(kit.h('<div class="ground"><svg class="full" viewBox="0 0 1080 1920"><g class="obs-cam">' +
      '<rect width="1080" height="1920" fill="#0E0B24"/>' +
      '<g class="obs-sky">' + UI.stars(110, 11, -400, -200, 1880, 1880, 'obs-s') +
      '<path d="M300 500 L380 560 L470 530 L540 600 L620 580 M700 760 L780 700 L860 740 L900 820" fill="none" stroke="#8A7BC0" stroke-width="3" opacity=".7"/>' +
      '<circle cx="760" cy="420" r="60" fill="#C0608A" opacity=".5"/><circle cx="260" cy="900" r="40" fill="#4FA3C7" opacity=".5"/></g>' +
      '<path class="obs-shoot" d="M0 0 L-180 90" stroke="#FFF6D8" stroke-width="6" stroke-linecap="round"/>' +
      '<path d="M-20 1340 Q540 1180 1100 1340 V1920 H-20 Z" fill="#2C2456"/>' +
      '<g transform="translate(540 1400)"><path d="M-30 0 L-50 200 H50 L30 0 Z" fill="#3A2D63" stroke="#0F0C22" stroke-width="6"/>' +
      '<g class="obs-proj"><path d="M-190 -30 H190" stroke="#6B4FA0" stroke-width="30" stroke-linecap="round"/><circle cx="-190" cy="-30" r="80" fill="#6B4FA0" stroke="#0F0C22" stroke-width="7"/><circle cx="190" cy="-30" r="80" fill="#6B4FA0" stroke="#0F0C22" stroke-width="7"/>' +
      '<circle cx="-220" cy="-60" r="10" fill="#F2C14E"/><circle cx="-170" cy="-80" r="10" fill="#F2C14E"/><circle cx="-150" cy="-20" r="10" fill="#F2C14E"/><circle cx="220" cy="-60" r="10" fill="#F2C14E"/><circle cx="170" cy="-80" r="10" fill="#F2C14E"/><circle cx="150" cy="-20" r="10" fill="#F2C14E"/></g></g>' +
      rows + '</g></svg></div>'));
    for (const k of ['cam', 'sky', 'shoot', 'proj']) this[k] = kit.stage.querySelector('.obs-' + k);
    this.stars = Array.prototype.slice.call(kit.stage.querySelectorAll('.obs-s'));
    this.st = UI.over(kit, 'L’osservatorio');
  },
  render(t) {
    UI.tick(this.st, t);
    UI.push(this.cam, t, 11, 540, 1000, 0.05);
    this.sky.setAttribute('transform', 'rotate(' + t * 2.4 + ' 540 900)');
    UI.twinkle(this.stars, t);
    const p = seg(t, 5, 6.2);
    this.shoot.setAttribute('transform', 'translate(' + lerp(980, 380, p) + ' ' + lerp(520, 820, p) + ')');
    this.shoot.style.opacity = Math.sin(p * Math.PI);
    this.proj.setAttribute('transform', 'rotate(' + Math.sin(t * 0.5) * 6 + ' 0 -30)');
  },
});