const { seg, eo, eio, lerp, TextFx } = kit;
kit.scene('copertina', {
  init(kit) {
    kit.stage.append(kit.h('<div class="ground"><svg class="full" viewBox="0 0 1080 1920"><g class="copertina-cam">' +
      '<rect width="1080" height="1920" fill="#15202B"/><rect y="760" width="1080" height="500" fill="#1C2A36"/>' +
      '<circle cx="760" cy="930" r="150" fill="#E9F0F2"/><circle cx="800" cy="900" r="30" fill="#D5E3E7"/><circle cx="710" cy="970" r="20" fill="#D5E3E7"/>' +
      '<path class="copertina-beam" d="M600 1080 L1300 920 L1300 1240 Z" fill="#FFD25C" opacity=".35"/>' +
      '<path d="M80 1380 Q220 1150 400 1190 Q520 1080 660 1140 Q820 1130 980 1380 Z" fill="#22313F" stroke="#0E151C" stroke-width="8" stroke-linejoin="round"/>' +
      '<path d="M230 1210 V1110 L360 1060 L490 1110 V1210 Z" fill="#2C3E50" stroke="#0E151C" stroke-width="6"/><rect x="345" y="1130" width="30" height="34" fill="#FFD25C"/>' +
      '<path d="M570 1180 L584 1010 H616 L630 1180 Z" fill="#E9F0F2" stroke="#0E151C" stroke-width="7"/><path d="M575 1070 H625 M577 1130 H623" stroke="#FF6B2C" stroke-width="14"/>' +
      '<rect x="580" y="970" width="40" height="42" fill="#FFD25C" stroke="#0E151C" stroke-width="7"/><path d="M572 970 L600 944 L628 970 Z" fill="#0E151C"/>' +
      '<path class="copertina-sea" d="M-260 1370 Q-180 1340 -100 1370 T60 1370 T220 1370 T380 1370 T540 1370 T700 1370 T860 1370 T1020 1370 T1180 1370 T1340 1370 V1920 H-260 Z" fill="#2D5C66"/>' +
      '<path class="copertina-w1" d="M-260 1470 Q-180 1440 -100 1470 T60 1470 T220 1470 T380 1470 T540 1470 T700 1470 T860 1470 T1020 1470 T1180 1470 T1340 1470" fill="none" stroke="#7FB3BB" stroke-width="7" stroke-linecap="round"/>' +
      '<path class="copertina-w2" d="M-260 1620 Q-180 1590 -100 1620 T60 1620 T220 1620 T380 1620 T540 1620 T700 1620 T860 1620 T1020 1620 T1180 1620 T1340 1620" fill="none" stroke="#E9F0F2" stroke-width="9" stroke-linecap="round" opacity=".7"/>' +
      '<g class="copertina-hat" transform="translate(860 1560) rotate(-12)">' + UI.hat(' stroke="#7FB3BB" stroke-width="3"') + '</g>' +
      '</g></svg>' +
      '<div class="words" style="left:80px;top:300px;width:920px;gap:20px">' +
      '<p class="copertina-tag" style="margin:0;font-size:30px;font-weight:800;letter-spacing:.3em;color:var(--accent)">IL FILM IN 2 MINUTI</p>' +
      '<h1 class="line" style="font-size:168px;line-height:.9;letter-spacing:-.02em;color:var(--ground)">Shutter Island</h1>' +
      '<p class="copertina-dir" style="margin:0;font-size:44px;font-weight:800;color:var(--ground)">un film di Martin Scorsese · 2010</p></div>' +
      '</div>'));
    for (const k of ['cam', 'beam', 'sea', 'w1', 'w2', 'hat', 'tag', 'dir']) this[k] = kit.stage.querySelector('.copertina-' + k);
    this.line = kit.stage.querySelector('.line');
    this.beam.style.transformBox = 'view-box';
    this.beam.style.transformOrigin = '600px 1080px';
  },
  render(t) {
    UI.push(this.cam, t, 4, 600, 1200, 0.04);
    TextFx.fadeFromRight(this.line, t, -0.6);
    this.tag.style.opacity = eo(seg(t, -0.6, -0.2));
    this.dir.style.opacity = eo(seg(t, -0.3, 0.2));
    this.beam.style.transform = 'scaleX(' + Math.cos(t * 1.2) + ')';
    this.sea.setAttribute('transform', 'translate(' + (-((t * 60) % 320)) + ' ' + Math.sin(t * 2) * 8 + ')');
    this.w1.setAttribute('transform', 'translate(' + (-((t * 80) % 320)) + ' 0)');
    this.w2.setAttribute('transform', 'translate(' + (-((t * 110) % 320)) + ' ' + Math.sin(t * 2) * 8 + ')');
    this.hat.setAttribute('transform', 'translate(860 ' + (1560 + Math.sin(t * 2) * 10) + ') rotate(' + (-12 + Math.sin(t * 2.2) * 4) + ')');
  },
});