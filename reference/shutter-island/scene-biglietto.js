const { seg, eo, eob, eio, lerp } = kit;
kit.scene('biglietto', {
  init(kit) {
    let tiles = '';
    for (let r = 0; r < 6; r++) for (let c = 0; c < 5; c++) { if (r === 2 && c === 2) continue; const sh = (r * 5 + c) % 3; tiles += '<rect x="' + (10 + c * 214) + '" y="' + (690 + r * 214) + '" width="200" height="200" rx="10" fill="' + ['#9DAEA8', '#93A49E', '#A7B7B1'][sh] + '" stroke="#15202B" stroke-width="6"/>'; }
    kit.stage.append(kit.h('<div class="ground"><svg class="full" viewBox="0 0 1080 1920"><g class="biglietto-cam">' +
      '<rect width="1080" height="1920" fill="#4E5F5A"/>' +
      '<rect width="1080" height="680" fill="#2C3E50"/><path d="M0 680 H1080" stroke="#15202B" stroke-width="12"/>' +
      '<path d="M0 600 H1080 V680 H0 Z" fill="#22313F"/>' + tiles +
      '<rect x="438" y="1118" width="200" height="200" rx="10" fill="#15202B"/>' +
      '<path d="M460 1300 Q520 1270 600 1296" fill="none" stroke="#33464F" stroke-width="8"/>' +
      '<g class="biglietto-tile"><rect x="0" y="0" width="200" height="200" rx="10" fill="#A7B7B1" stroke="#15202B" stroke-width="6"/><path d="M20 30 L60 60" stroke="#7C8F86" stroke-width="4"/></g>' +
      '<g class="biglietto-note"><rect x="-300" y="-190" width="600" height="380" rx="8" fill="#F4EFE2" stroke="#15202B" stroke-width="8"/>' +
      '<path d="M-300 -120 H300" stroke="#C9D8DD" stroke-width="4"/><path d="M-300 -40 H300 M-300 40 H300 M-300 120 H300" stroke="#C9D8DD" stroke-width="3"/>' +
      '<path d="M-260 -190 L-230 -170 L-200 -190" fill="none" stroke="#15202B" stroke-width="4" opacity=".4"/>' +
      '<text class="chalk" x="0" y="-50" text-anchor="middle" style="font-size:84px;fill:#15202B">La legge del 4</text>' +
      '<text class="chalk" x="0" y="90" text-anchor="middle" style="font-size:110px;fill:#D9541B">Chi è il 67?</text></g>' +
      '</g></svg></div>'));
    for (const k of ['cam', 'tile', 'note']) this[k] = kit.stage.querySelector('.biglietto-' + k);
    this.st = UI.over(kit, 'Il biglietto', { top: 400, size: 112 });
  },
  render(t) {
    UI.tick(this.st, t); this.st.F = 1.556; t = t * 1.556;
    UI.push(this.cam, t, 14, 540, 1150, 0.06);
    const lift = eio(seg(t, 1.5, 3));
    this.tile.setAttribute('transform', 'translate(' + lerp(438, 820, lift) + ' ' + lerp(1118, 1500, lift) + ') rotate(' + lift * 22 + ' 100 100)');
    const p = eob(seg(t, 3, 3.9), 1.4);
    this.note.setAttribute('transform', 'translate(540 ' + lerp(1220, 1060, p) + ') rotate(' + lerp(-16, -4, p) + ') scale(' + (lerp(0.3, 1, p) * (1 + Math.sin(t * 1.4) * 0.006)) + ')');
    this.note.style.opacity = seg(t, 3, 3.2);
  },
});