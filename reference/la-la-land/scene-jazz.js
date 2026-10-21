const { seg, eo, eio, lerp } = kit;
kit.scene('jazz', {
  init(kit) {
    let notes = '';
    for (let i = 0; i < 3; i++) notes += '<g class="jaz-n">' + UI.note() + '</g>';
    kit.stage.append(kit.h('<div class="ground"><svg class="full" viewBox="0 0 1080 1920"><g class="jaz-cam">' +
      '<rect width="1080" height="1920" fill="#16132E"/>' +
      '<path d="M0 520 H1080 V1260 H0 Z" fill="#231D48"/><path d="M0 520 Q120 700 0 1260 M1080 520 Q960 700 1080 1260" fill="#5A1F3A"/>' +
      '<g class="jaz-neon"><rect x="300" y="580" width="480" height="200" rx="30" fill="none" stroke="#E86ACB" stroke-width="10"/>' +
      '<text x="540" y="725" text-anchor="middle" style="font-family:var(--display, var(--sans, system-ui, sans-serif));font-size:150px;font-weight:800;fill:none;stroke:#7FE3F0;stroke-width:6px;letter-spacing:12px">JAZZ</text></g>' +
      '<path class="jaz-spot" d="M480 500 L600 500 L860 1400 L220 1400 Z" fill="#F2C14E" opacity=".14"/>' +
      '<path d="M0 1260 H1080 V1420 H0 Z" fill="#3A2D63" stroke="#0F0C22" stroke-width="8"/>' +
      '<g transform="translate(330 1260)"><path d="M0 -40 Q-90 -60 -80 -150 Q-70 -210 -40 -230 Q-80 -280 -50 -350 Q-20 -400 0 -400 Q20 -400 50 -350 Q80 -280 40 -230 Q70 -210 80 -150 Q90 -60 0 -40 Z" fill="#A0522D" stroke="#0F0C22" stroke-width="7"/>' +
      '<path d="M-14 -300 Q-30 -280 -14 -260 M14 -300 Q30 -280 14 -260" fill="none" stroke="#0F0C22" stroke-width="5"/><path d="M0 -400 V-560" stroke="#0F0C22" stroke-width="16"/><path d="M-6 -560 H6 V-600 H-6 Z" fill="#0F0C22"/><path d="M0 -40 V0" stroke="#0F0C22" stroke-width="8"/></g>' +
      '<g transform="translate(720 1260)"><path d="M0 0 V-170 M-40 0 L0 -40 L40 0" stroke="#0F0C22" stroke-width="8" fill="none"/>' +
      '<path d="M-20 -400 Q-30 -440 0 -450 L10 -440 Q-10 -430 -4 -400 L10 -200 Q20 -150 60 -150 Q90 -150 96 -190 L110 -220 L130 -214 L118 -170 Q100 -110 50 -110 Q-10 -110 -16 -190 Z" fill="#F2C14E" stroke="#0F0C22" stroke-width="6" stroke-linejoin="round"/>' +
      '<circle cx="0" cy="-330" r="6" fill="#0F0C22"/><circle cx="4" cy="-290" r="6" fill="#0F0C22"/><circle cx="8" cy="-250" r="6" fill="#0F0C22"/></g>' +
      '<g transform="translate(900 1260)"><ellipse cx="0" cy="-90" rx="80" ry="80" fill="#E86A5A" stroke="#0F0C22" stroke-width="7"/><ellipse cx="0" cy="-90" rx="50" ry="50" fill="#F6F1E9"/><path d="M-90 -220 H-20 M-55 -220 V-170" stroke="#F2C14E" stroke-width="8"/></g>' +
      '<path d="M0 1420 H1080 V1920 H0 Z" fill="#120E26"/>' +
      '<g transform="translate(160 1600)"><ellipse cx="0" cy="0" rx="120" ry="22" fill="#2C2456"/><path d="M0 20 V140" stroke="#2C2456" stroke-width="14"/><rect x="-8" y="-50" width="16" height="40" fill="#F6F1E9"/><circle cx="0" cy="-60" r="8" fill="#F2C14E"/></g>' +
      notes + '</g></svg></div>'));
    for (const k of ['cam', 'neon', 'spot']) this[k] = kit.stage.querySelector('.jaz-' + k);
    this.notes = Array.prototype.slice.call(kit.stage.querySelectorAll('.jaz-n'));
    this.st = UI.over(kit, 'Il jazz club');
  },
  render(t) {
    UI.tick(this.st, t);
    UI.push(this.cam, t, 9, 540, 1100, 0.06);
    const flick = (t > 1 && t < 1.15) || (t > 1.4 && t < 1.5) ? 0.25 : 1;
    this.neon.style.opacity = t < 0.8 ? 0.25 : flick;
    this.spot.setAttribute('opacity', 0.14 + Math.sin(t * 1.4) * 0.02);
    this.notes.forEach((n, i) => { const p = ((t + i * 1.2) % 3.6) / 3.6; n.setAttribute('transform', 'translate(' + (720 + i * 60 + Math.sin(p * 6 + i) * 30) + ' ' + (900 - p * 360) + ') scale(' + (0.8 + i * 0.1) + ')'); n.style.opacity = Math.sin(p * Math.PI); });
  },
});