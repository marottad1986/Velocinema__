const { seg, eo, eob, eio, lerp } = kit;
kit.scene('audizione', {
  init(kit) {
    kit.stage.append(kit.h('<div class="ground"><svg class="full" viewBox="0 0 1080 1920"><g class="aud-cam">' +
      '<rect width="1080" height="1920" fill="#D8D2E4"/><rect y="1240" width="1080" height="680" fill="#A89CBF"/><path d="M0 1240 H1080" stroke="#1C1838" stroke-width="8"/>' +
      '<rect x="640" y="560" width="300" height="420" fill="#C4BCD6" stroke="#1C1838" stroke-width="8"/><circle cx="668" cy="780" r="10" fill="#1C1838"/>' +
      '<path class="aud-spot" d="M340 520 L460 520 L640 1500 L160 1500 Z" fill="#FFF6D8" opacity=".45"/>' +
      '<ellipse cx="400" cy="1440" rx="230" ry="44" fill="#FFF6D8" opacity=".5"/>' +
      '<path d="M340 1470 L460 1410 M340 1410 L460 1470" stroke="#F2C14E" stroke-width="14" stroke-linecap="round"/>' +
      '<g transform="translate(400 1400)"><ellipse cx="0" cy="-180" rx="70" ry="16" fill="#1C1838"/><path d="M-50 -170 L-66 0 M50 -170 L66 0 M-56 -70 H56" stroke="#1C1838" stroke-width="10"/></g>' +
      '<g transform="translate(820 1560)"><path d="M-230 0 H230 V30 H-230 Z" fill="#8C6B52" stroke="#1C1838" stroke-width="7"/><path d="M-200 30 L-230 260 M200 30 L230 260" stroke="#1C1838" stroke-width="12"/>' +
      '<g transform="translate(-90 -20) rotate(-6)"><rect x="-90" y="-60" width="180" height="120" fill="#F6F1E9" stroke="#1C1838" stroke-width="5"/><path d="M-70 -30 H70 M-70 -6 H50 M-70 18 H60" stroke="#1C1838" stroke-width="4" opacity=".4"/></g>' +
      '<rect x="80" y="-34" width="70" height="30" rx="6" fill="#1C1838"/></g>' +
      '<g class="aud-card"><rect x="-170" y="-120" width="340" height="240" rx="6" fill="#F6F1E9" stroke="#1C1838" stroke-width="7"/><rect x="-150" y="-100" width="300" height="160" fill="#F2C9A8"/>' +
      '<path d="M0 -90 L-40 50 M0 -90 L40 50 M-26 0 H26 M-36 30 H36" stroke="#1C1838" stroke-width="7" fill="none"/><path d="M-60 50 Q0 20 60 50" stroke="#1C1838" stroke-width="6" fill="none"/>' +
      '<text x="0" y="100" text-anchor="middle" style="font-family:var(--display, var(--sans, system-ui, sans-serif));font-size:32px;font-weight:800;fill:#6B4FA0">PARIGI</text></g>' +
      '</g></svg></div>'));
    for (const k of ['cam', 'spot', 'card']) this[k] = kit.stage.querySelector('.aud-' + k);
    this.st = UI.over(kit, 'Il provino', { dark: true });
  },
  render(t) {
    UI.tick(this.st, t);
    UI.push(this.cam, t, 13, 400, 1300, 0.07);
    this.spot.setAttribute('opacity', 0.45 + Math.sin(t * 1.2) * 0.04);
    const c = eob(seg(t, 8.6, 9.4), 1.4);
    this.card.style.opacity = seg(t, 8.6, 8.8);
    this.card.setAttribute('transform', 'translate(' + lerp(1300, 790, c) + ' ' + lerp(700, 820, c) + ') rotate(' + lerp(30, 6, c) + ')');
  },
});