const { seg, eo, eob, eio, lerp } = kit;
kit.scene('verita', {
  init(kit) {
    kit.stage.append(kit.h('<div class="ground"><svg class="full" viewBox="0 0 1080 1920"><g class="verita-cam">' +
      '<rect width="1080" height="1920" fill="#C9D8DD"/><rect y="1180" width="1080" height="740" fill="#8A6F55"/>' +
      '<path d="M0 1180 H1080" stroke="#15202B" stroke-width="10"/>' +
      '<rect x="90" y="560" width="300" height="220" rx="8" fill="#F4F7F8" stroke="#15202B" stroke-width="8"/><path d="M120 600 H360 M120 640 H320 M120 680 H340" stroke="#15202B" stroke-width="5" opacity=".3"/>' +
      '<path d="M840 460 V1160 M760 1160 H920" stroke="#15202B" stroke-width="22" stroke-linecap="round"/>' +
      '<path d="M840 500 L770 540 M840 500 L910 540" stroke="#15202B" stroke-width="14" stroke-linecap="round"/>' +
      '<g class="verita-coat"><path d="M840 520 L730 590 L715 1020 H965 L950 590 Z" fill="#F4F7F8" stroke="#15202B" stroke-width="10" stroke-linejoin="round"/>' +
      '<path d="M840 520 V1020 M800 545 L840 660 L880 545" fill="none" stroke="#15202B" stroke-width="7" stroke-linejoin="round"/>' +
      '<rect x="870" y="700" width="50" height="12" fill="#FF6B2C"/><circle cx="820" cy="760" r="7" fill="#15202B"/><circle cx="820" cy="860" r="7" fill="#15202B"/></g>' +
      '<g class="verita-hat">' + UI.hat() + '</g>' +
      '<path d="M40 1260 H1040 V1340 H40 Z" fill="#6E5844" stroke="#15202B" stroke-width="10"/>' +
      '<g transform="rotate(-4 480 1500)"><rect x="120" y="1320" width="760" height="420" rx="14" fill="#FF6B2C" stroke="#15202B" stroke-width="10"/>' +
      '<rect x="150" y="1344" width="700" height="372" fill="#F4F7F8" stroke="#15202B" stroke-width="7"/>' +
      '<text x="190" y="1420" style="font-family:var(--display, var(--sans, system-ui, sans-serif));font-size:40px;font-weight:800;fill:#15202B">PAZIENTE N. 67</text>' +
      '<text x="190" y="1484" style="font-family:var(--display, var(--sans, system-ui, sans-serif));font-size:54px;font-weight:800;fill:#D9541B">ANDREW LAEDDIS</text>' +
      '<path d="M190 1530 H520 M190 1572 H490 M190 1614 H540 M190 1656 H450" stroke="#15202B" stroke-width="6" opacity=".35"/>' +
      '<g transform="translate(600 1520) rotate(6)"><rect width="200" height="170" fill="#F4F7F8" stroke="#15202B" stroke-width="6"/><rect x="14" y="14" width="172" height="120" fill="#3E7C87"/>' +
      '<path d="M14 96 H186 V134 H14 Z" fill="#5E7A72"/><path d="M60 96 V66 L90 44 L120 66 V96 Z" fill="#F4F7F8" stroke="#15202B" stroke-width="4"/><path d="M20 112 Q100 104 180 112" stroke="#9CC3CA" stroke-width="4" fill="none"/></g>' +
      '<g class="verita-stamp"><rect x="-170" y="-44" width="340" height="80" rx="8" fill="none" stroke="#D9541B" stroke-width="8"/>' +
      '<text x="0" y="14" text-anchor="middle" style="font-family:var(--display, var(--sans, system-ui, sans-serif));font-size:42px;font-weight:800;fill:#D9541B">ULTIMA PROVA</text></g></g>' +
      '</g></svg></div>'));
    for (const k of ['cam', 'coat', 'hat', 'stamp']) this[k] = kit.stage.querySelector('.verita-' + k);
    this.st = UI.over(kit, 'La verità', { top: 390, size: 112, dark: true });
  },
  render(t) {
    UI.tick(this.st, t); this.st.F = 1.538; t = t * 1.538;
    UI.push(this.cam, t, 20, 540, 1200, 0.05);
    const fall = eio(seg(t, 2.5, 3.7));
    this.hat.setAttribute('transform', 'translate(' + lerp(840, 960, fall) + ' ' + (lerp(500, 1170, fall) - Math.sin(fall * Math.PI) * 60) + ') rotate(' + fall * 170 + ')');
    const c = eob(seg(t, 3.5, 4.2), 1.5);
    this.coat.style.opacity = seg(t, 3.5, 3.7);
    this.coat.setAttribute('transform', 'translate(0 ' + lerp(-40, 0, c) + ') rotate(' + Math.sin(t * 1.3) * 1 + ' 840 520)');
    const s = eob(seg(t, 14, 14.4), 1.8);
    this.stamp.style.opacity = seg(t, 14, 14.1);
    this.stamp.setAttribute('transform', 'translate(560 1690) rotate(-10) scale(' + lerp(1.6, 1, s) + ')');
  },
});