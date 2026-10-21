const { seg, eo, eio, lerp } = kit;
kit.scene('studio', {
  init(kit) {
    let books = '';
    const cols = ['#FF6B2C', '#3E7C87', '#F4F7F8', '#FFD25C', '#8A6F55', '#2C3E50'];
    for (let s = 0; s < 4; s++) for (let i = 0; i < 6; i++) { const h = 110 + ((i * 37 + s * 13) % 50); books += '<rect x="' + (60 + i * 38) + '" y="' + (640 + s * 190 + (170 - h)) + '" width="34" height="' + h + '" fill="' + cols[(i + s) % 6] + '" stroke="#15202B" stroke-width="4"/>'; }
    let rain = '';
    for (let i = 0; i < 16; i++) rain += 'M' + (440 + (i * 53) % 480) + ' ' + (560 + (i * 97) % 380) + ' l-16 46 ';
    kit.stage.append(kit.h('<div class="ground"><svg class="full" viewBox="0 0 1080 1920"><g class="studio-cam">' +
      '<rect width="1080" height="1920" fill="#6F8A85"/><rect width="1080" height="520" fill="#5E7A72"/>' +
      '<rect x="40" y="600" width="270" height="800" fill="#8A6F55" stroke="#15202B" stroke-width="10"/>' + books +
      '<path d="M40 810 H310 M40 1000 H310 M40 1190 H310" stroke="#15202B" stroke-width="10"/>' +
      '<rect x="420" y="540" width="520" height="420" rx="10" fill="#22313F" stroke="#15202B" stroke-width="12"/>' +
      '<path d="M420 760 Q560 710 680 750 Q820 700 940 760 V960 H420 Z" fill="#2C3E50"/>' +
      '<path class="studio-rain" d="' + rain + '" stroke="#9CC3CA" stroke-width="5" stroke-linecap="round" opacity=".6"/>' +
      '<path d="M680 540 V960 M420 750 H940" stroke="#15202B" stroke-width="12"/>' +
      '<path d="M400 540 Q440 760 400 980 L380 980 L380 540 Z M960 540 Q920 760 960 980 L980 980 L980 540 Z" fill="#FF6B2C" stroke="#15202B" stroke-width="8" stroke-linejoin="round"/>' +
      '<path d="M0 1400 H1080 V1920 H0 Z" fill="#5C4938"/>' +
      '<path d="M100 1300 H1000 V1400 H100 Z" fill="#8A6F55" stroke="#15202B" stroke-width="10"/><path d="M140 1400 V1700 M960 1400 V1700" stroke="#15202B" stroke-width="22"/>' +
      '<rect x="560" y="1200" width="380" height="100" rx="12" fill="#15202B"/>' +
      '<g class="studio-disc"><ellipse cx="720" cy="1206" rx="140" ry="32" fill="#15202B" stroke="#3E7C87" stroke-width="4"/><ellipse cx="720" cy="1206" rx="38" ry="9" fill="#FF6B2C"/></g>' +
      '<path class="studio-glint" d="M640 1200 Q675 1192 710 1196" fill="none" stroke="#E9F0F2" stroke-width="5" stroke-linecap="round" opacity=".6"/>' +
      '<path d="M910 1170 L815 1204" stroke="#15202B" stroke-width="9"/><circle cx="910" cy="1170" r="16" fill="#F4F7F8" stroke="#15202B" stroke-width="6"/>' +
      '<path class="studio-note" d="M640 1100 v-60 l36 -10 v56 M640 1100 a12 10 0 1 1 -1 0 M676 1088 a12 10 0 1 1 -1 0" fill="none" stroke="#15202B" stroke-width="7"/>' +
      '<g><rect x="200" y="1170" width="100" height="130" rx="14" fill="#F4F7F8" stroke="#15202B" stroke-width="8"/><rect x="192" y="1140" width="116" height="40" rx="8" fill="#FF6B2C" stroke="#15202B" stroke-width="7"/><rect x="216" y="1210" width="68" height="44" rx="4" fill="#3E7C87"/></g>' +
      '<g class="studio-p1"><rect x="-30" y="-13" width="60" height="26" rx="13" fill="#FF6B2C" stroke="#15202B" stroke-width="6"/></g>' +
      '<g class="studio-p2"><rect x="-30" y="-13" width="60" height="26" rx="13" fill="#F4F7F8" stroke="#15202B" stroke-width="6"/></g>' +
      '<g><path d="M400 1290 q-8 -48 36 -48 h14 v24 h-24 q-5 12 -5 24 z" fill="#8A6F55" stroke="#15202B" stroke-width="7"/><path d="M450 1260 H520" stroke="#15202B" stroke-width="10"/>' +
      '<path class="studio-smoke" d="M430 1230 q-24 -36 0 -72 q24 -36 0 -72" fill="none" stroke="#B9C6C2" stroke-width="14" stroke-linecap="round" opacity=".7"/></g>' +
      '</g></svg></div>'));
    for (const k of ['cam', 'rain', 'glint', 'note', 'p1', 'p2', 'smoke']) this[k] = kit.stage.querySelector('.studio-' + k);
    this.st = UI.over(kit, 'Lo studio del direttore', { plate: true });
  },
  render(t) {
    UI.tick(this.st, t); this.st.F = 1.556; t = t * 1.556;
    UI.push(this.cam, t, 14, 540, 1200, 0.06);
    this.rain.setAttribute('transform', 'translate(' + (-((t * 22) % 16)) + ' ' + ((t * 180) % 46) + ')');
    this.glint.setAttribute('transform', 'translate(' + Math.sin(t * 6) * 34 + ' 0)');
    const n = (t % 2.6) / 2.6;
    this.note.setAttribute('transform', 'translate(' + n * 40 + ' ' + (-n * 140) + ')');
    this.note.style.opacity = Math.sin(n * Math.PI);
    const p = eo(seg(t, 2, 2.8));
    this.p1.setAttribute('transform', 'translate(' + lerp(250, 360, p) + ' ' + (lerp(1170, 1288, p) - Math.sin(p * Math.PI) * 70) + ') rotate(' + p * 160 + ')');
    const q = eo(seg(t, 2.3, 3.1));
    this.p2.setAttribute('transform', 'translate(' + lerp(250, 330, q) + ' ' + (lerp(1170, 1288, q) - Math.sin(q * Math.PI) * 50) + ') rotate(' + q * -120 + ')');
    this.p1.style.opacity = seg(t, 2, 2.1);
    this.p2.style.opacity = seg(t, 2.3, 2.4);
    this.smoke.setAttribute('transform', 'translate(' + Math.sin(t * 1.5) * 10 + ' ' + (-((t * 10) % 24)) + ')');
  },
});