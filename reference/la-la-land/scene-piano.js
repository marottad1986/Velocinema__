const { seg, eo, eio, lerp } = kit;
kit.scene('piano', {
  init(kit) {
    let bulbs = '';
    const bc = ['#F2C14E', '#E86A5A', '#7BC47F', '#4FA3C7'];
    for (let i = 0; i < 16; i++) { const x = 30 + i * 68; const y = 580 + Math.sin(i / 15 * Math.PI) * 70; bulbs += '<circle class="pia-b" cx="' + x + '" cy="' + y + '" r="13" fill="' + bc[i % 4] + '"/>'; }
    let notes = '';
    for (let i = 0; i < 4; i++) notes += '<g class="pia-n">' + UI.note() + '</g>';
    kit.stage.append(kit.h('<div class="ground"><svg class="full" viewBox="0 0 1080 1920"><g class="pia-cam">' +
      '<rect width="1080" height="1920" fill="#3A1F2E"/><rect y="1300" width="1080" height="620" fill="#5A2E36"/>' +
      '<path d="M0 1300 H1080" stroke="#1C1838" stroke-width="8"/>' +
      '<path d="M30 580 Q540 720 1050 580" fill="none" stroke="#1C1838" stroke-width="5"/>' + bulbs +
      '<g transform="translate(180 820)"><circle r="70" fill="none" stroke="#3F7A4A" stroke-width="30"/><path d="M-20 60 l20 30 l20 -30" fill="#E86A5A"/></g>' +
      '<path class="pia-spot" d="M480 600 L800 600 L1000 1500 L280 1500 Z" fill="#F2C14E" opacity=".16"/>' +
      '<g transform="translate(560 1300)">' +
      '<path d="M-300 -160 Q-300 -260 -150 -260 L160 -260 Q300 -260 300 -120 Q300 -60 250 -40 L-300 -40 Z" fill="#120C18" stroke="#F2C14E" stroke-width="4"/>' +
      '<path d="M-250 -260 L120 -480 L140 -460 L-180 -260 Z" fill="#120C18" stroke="#F2C14E" stroke-width="4"/>' +
      '<rect x="-300" y="-60" width="340" height="40" fill="#F6F1E9" stroke="#120C18" stroke-width="5"/>' +
      '<path d="M-280 -60 V-36 M-250 -60 V-36 M-220 -60 V-36 M-170 -60 V-36 M-140 -60 V-36 M-90 -60 V-36 M-60 -60 V-36 M-30 -60 V-36 M10 -60 V-36" stroke="#120C18" stroke-width="10"/>' +
      '<path d="M-270 -40 V120 M230 -40 V120 M-10 -40 V100" stroke="#120C18" stroke-width="20" stroke-linecap="round"/>' +
      '<rect x="-360" y="30" width="150" height="40" rx="8" fill="#120C18"/></g>' +
      '<g transform="translate(900 1500)"><ellipse cx="0" cy="-120" rx="130" ry="24" fill="#F6F1E9" stroke="#1C1838" stroke-width="6"/><path d="M0 -100 V40" stroke="#1C1838" stroke-width="14"/><rect x="-8" y="-180" width="16" height="50" fill="#F6F1E9"/><path class="pia-flame" d="M0 -200 q-10 14 0 22 q10 -8 0 -22" fill="#F2C14E"/></g>' +
      '<g transform="translate(130 1560)"><ellipse cx="0" cy="-120" rx="110" ry="22" fill="#F6F1E9" stroke="#1C1838" stroke-width="6"/><path d="M0 -100 V40" stroke="#1C1838" stroke-width="14"/></g>' +
      notes + '</g></svg></div>'));
    this.cam = kit.stage.querySelector('.pia-cam');
    this.bulbs = Array.prototype.slice.call(kit.stage.querySelectorAll('.pia-b'));
    this.notes = Array.prototype.slice.call(kit.stage.querySelectorAll('.pia-n'));
    this.spot = kit.stage.querySelector('.pia-spot');
    this.flame = kit.stage.querySelector('.pia-flame');
    this.st = UI.over(kit, 'Il pianoforte');
  },
  render(t) {
    UI.tick(this.st, t);
    UI.push(this.cam, t, 11, 560, 1150, 0.07);
    UI.twinkle(this.bulbs, t);
    this.notes.forEach((n, i) => { const p = ((t + i * 0.9) % 3.6) / 3.6; n.setAttribute('transform', 'translate(' + (480 + i * 70 + Math.sin(p * 6 + i) * 30) + ' ' + (1150 - p * 420) + ') scale(' + (0.8 + i * 0.1) + ')'); n.style.opacity = Math.sin(p * Math.PI); });
    this.spot.setAttribute('opacity', 0.16 + Math.sin(t * 1.5) * 0.02);
    this.flame.setAttribute('transform', 'translate(0 -178) scale(1 ' + (1 + Math.sin(t * 9) * 0.12) + ') translate(0 178)');
  },
});