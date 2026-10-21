const { seg, eo, eob, eio, lerp } = kit;
kit.scene('cella', {
  init(kit) {
    let br = '';
    for (let r = 1; r <= 10; r++) br += 'M0 ' + (r * 120) + ' H1080 ';
    for (let r = 0; r < 10; r++) for (let c = 0; c < 3; c++) { const x = 180 + c * 360 + (r % 2) * 180; br += 'M' + x + ' ' + (r * 120) + ' V' + (r * 120 + 120) + ' '; }
    kit.stage.append(kit.h('<div class="ground"><svg class="full" viewBox="0 0 1080 1920"><g class="cella-cam">' +
      '<rect width="1080" height="1920" fill="#A9B8B4"/><path d="' + br + '" stroke="#93A39E" stroke-width="6"/>' +
      '<path class="cella-shaft" d="M370 630 L650 630 L980 1500 L80 1500 Z" fill="#E9F0F2" opacity=".18"/>' +
      '<rect x="370" y="300" width="300" height="330" rx="10" fill="#22313F" stroke="#15202B" stroke-width="10"/>' +
      '<path d="M370 470 Q450 430 520 460 Q600 420 670 470 V630 H370 Z" fill="#2C3E50"/>' +
      '<rect class="cella-flash" x="370" y="300" width="300" height="330" fill="#E9F0F2" opacity="0"/>' +
      '<path class="cella-bolt" d="M540 320 L505 420 L548 414 L512 520" fill="none" stroke="#FFD25C" stroke-width="10" stroke-linejoin="round" stroke-linecap="round" opacity="0"/>' +
      '<path d="M440 300 V630 M520 300 V630 M600 300 V630 M370 460 H670" stroke="#15202B" stroke-width="16"/>' +
      '<rect x="350" y="620" width="340" height="24" fill="#7C8F86" stroke="#15202B" stroke-width="8"/>' +
      '<path d="M0 1240 H1080 V1920 H0 Z" fill="#7C8F86"/><path d="M0 1240 H1080" stroke="#15202B" stroke-width="10"/>' +
      '<path d="M180 1240 L60 1920 M540 1240 V1920 M900 1240 L1020 1920 M0 1420 H1080 M0 1660 H1080" stroke="#6C7F77" stroke-width="6"/>' +
      '<rect x="60" y="1000" width="540" height="80" rx="18" fill="#F4F7F8" stroke="#15202B" stroke-width="10"/>' +
      '<rect x="60" y="1070" width="540" height="40" fill="#5E7A72" stroke="#15202B" stroke-width="9"/>' +
      '<rect x="90" y="960" width="170" height="64" rx="26" fill="#F4F7F8" stroke="#15202B" stroke-width="9"/>' +
      '<path d="M90 1110 V1320 M570 1110 V1300" stroke="#15202B" stroke-width="18" stroke-linecap="round"/>' +
      '<g class="cella-shoes"><path d="M200 1290 h120 q34 0 34 -32 v-8 h-96 q-14 -26 -58 -18 z" fill="#FF6B2C" stroke="#15202B" stroke-width="8" stroke-linejoin="round"/>' +
      '<path d="M380 1304 h120 q34 0 34 -32 v-8 h-96 q-14 -26 -58 -18 z" fill="#FF6B2C" stroke="#15202B" stroke-width="8" stroke-linejoin="round"/></g>' +
      '<rect x="720" y="560" width="300" height="690" rx="8" fill="#8A6F55" stroke="#15202B" stroke-width="10"/>' +
      '<rect x="780" y="620" width="180" height="110" rx="6" fill="#22313F" stroke="#15202B" stroke-width="8"/><path d="M825 620 V730 M870 620 V730 M915 620 V730" stroke="#15202B" stroke-width="9"/>' +
      '<circle cx="760" cy="760" r="10" fill="#15202B"/><circle cx="760" cy="1060" r="10" fill="#15202B"/>' +
      '<g class="cella-lock"><path d="M752 930 v-46 a32 32 0 0 1 64 0 v46" fill="none" stroke="#15202B" stroke-width="12"/>' +
      '<rect x="736" y="920" width="96" height="84" rx="14" fill="#FFD25C" stroke="#15202B" stroke-width="9"/><circle cx="784" cy="955" r="10" fill="#15202B"/><path d="M784 960 V980" stroke="#15202B" stroke-width="8"/></g>' +
      '<g transform="translate(860 1380)"><path d="M-60 -90 H60 L48 0 H-48 Z" fill="#B9C6C2" stroke="#15202B" stroke-width="8" stroke-linejoin="round"/><path d="M-60 -90 Q0 -150 60 -90" fill="none" stroke="#15202B" stroke-width="6"/></g>' +
      '</g></svg></div>'));
    for (const k of ['cam', 'shaft', 'flash', 'bolt', 'shoes', 'lock']) this[k] = kit.stage.querySelector('.cella-' + k);
    this.st = UI.over(kit, 'La cella vuota', { top: 700, size: 104, dark: true, width: 600 });
  },
  render(t) {
    UI.tick(this.st, t); this.st.F = 1.455; t = t * 1.455;
    UI.push(this.cam, t, 16, 400, 1200, 0.07);
    const f = seg(t, 3, 3.1) * (1 - seg(t, 3.4, 3.9)) + 0.6 * seg(t, 11, 11.1) * (1 - seg(t, 11.3, 11.8));
    this.flash.setAttribute('opacity', f * 0.8);
    this.bolt.setAttribute('opacity', f);
    this.shaft.setAttribute('opacity', 0.18 + f * 0.25);
    this.lock.setAttribute('transform', 'rotate(' + Math.sin(t * 9) * 6 * (1 - eo(seg(t, 0.5, 1.8))) * seg(t, 0.3, 0.5) + ' 784 890)');
    const s = eob(seg(t, 9, 9.5), 1.7);
    this.shoes.setAttribute('transform', 'translate(370 1280) scale(' + (lerp(0.94, 1, s) * (1 + Math.sin(t * 3) * 0.008)) + ') translate(-370 -1280)');
  },
});