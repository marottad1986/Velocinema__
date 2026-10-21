const { seg, eo, eio, lerp } = kit;
kit.scene('collina', {
  init(kit) {
    let lights = '';
    for (let i = 0; i < 90; i++) { const x = (i * 113) % 1080; const y = 1250 + ((i * 47) % 160); lights += '<circle class="col-l" cx="' + x + '" cy="' + y + '" r="' + (3 + (i % 3)) + '" fill="#FFE08A"/>'; }
    kit.stage.append(kit.h('<div class="ground"><svg class="full" viewBox="0 0 1080 1920"><g class="col-cam">' +
      '<rect width="1080" height="1920" fill="#2C2456"/><rect y="620" width="1080" height="200" fill="#4A3478"/><rect y="820" width="1080" height="160" fill="#7E4A8E"/><rect y="980" width="1080" height="120" fill="#C0608A"/><rect y="1100" width="1080" height="100" fill="#F08A6C"/>' +
      '<g class="col-stars">' + UI.stars(40, 3, 0, 160, 1080, 640, 'col-s') + '</g>' +
      '<path d="M0 1200 Q160 1120 330 1170 Q520 1090 700 1160 Q880 1110 1080 1180 V1260 H0 Z" fill="#5A3A78"/>' +
      '<path d="M0 1240 H1080 V1430 H0 Z" fill="#2C2456"/>' + lights +
      '<path d="M0 1400 Q300 1340 560 1380 Q820 1420 1080 1360 V1920 H0 Z" fill="#1C1838"/>' +
      '<path d="M380 1920 Q480 1600 620 1420 L700 1420 Q600 1620 560 1920 Z" fill="#3A2D63"/>' +
      '<circle class="col-glow" cx="220" cy="1010" r="150" fill="#F2C14E" opacity="0"/>' +
      '<path d="M220 1560 V1020" stroke="#0F0C22" stroke-width="16"/><path d="M188 1020 H252 L240 970 H200 Z" fill="#0F0C22"/><circle class="col-bulb" cx="220" cy="1032" r="18" fill="#5A4A70"/>' +
      '<path d="M190 1560 H250" stroke="#0F0C22" stroke-width="14"/>' +
      '<g transform="translate(720 1560)"><rect x="-170" y="-60" width="340" height="22" rx="6" fill="#0F0C22"/><rect x="-170" y="-110" width="340" height="16" rx="6" fill="#0F0C22"/><path d="M-150 -38 V20 M150 -38 V20 M-140 -94 V-60 M140 -94 V-60" stroke="#0F0C22" stroke-width="12"/>' +
      '<g transform="translate(-60 -64)"><path d="M-40 0 h70 q16 0 16 -16 v-10 h-46 q-8 -14 -40 -6 z" fill="#F2C14E" stroke="#0F0C22" stroke-width="5"/><path d="M40 2 h70 q16 0 16 -16 v-10 h-46 q-8 -14 -40 -6 z" fill="#F2C14E" stroke="#0F0C22" stroke-width="5"/></g></g>' +
      '</g></svg></div>'));
    this.cam = kit.stage.querySelector('.col-cam');
    this.stars = Array.prototype.slice.call(kit.stage.querySelectorAll('.col-s'));
    this.lights = Array.prototype.slice.call(kit.stage.querySelectorAll('.col-l'));
    this.glow = kit.stage.querySelector('.col-glow');
    this.bulb = kit.stage.querySelector('.col-bulb');
    this.st = UI.over(kit, 'La collina');
  },
  render(t) {
    UI.tick(this.st, t);
    UI.push(this.cam, t, 11, 540, 1300, 0.05);
    const n = eo(seg(t, 0.5, 6));
    this.stars.forEach((s, i) => { s.style.opacity = n * (0.45 + 0.55 * Math.abs(Math.sin(t * (0.8 + (i % 4) * 0.3) + i))) * seg(t, i * 0.12, i * 0.12 + 0.6); });
    UI.twinkle(this.lights, t);
    const on = eo(seg(t, 2, 2.4));
    this.glow.setAttribute('opacity', on * (0.3 + Math.sin(t * 2) * 0.03));
    this.bulb.setAttribute('fill', on > 0.5 ? '#FFE08A' : '#5A4A70');
  },
});