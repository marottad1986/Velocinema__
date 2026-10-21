kit.score(function (S, T) {
  S.tempo(112, { t0: 0 });
  S.program('keys', 'ep', { rev: 0.4, gain: -2 });
  S.program('bass', 'bass', { gain: -2 });
  S.program('vib', 'vibes', { rev: 0.5, gain: -5, pan: 0.2 });
  const b = function (x) { return S.toBeat(x); };
  const MAJ = [['F3', 'A3', 'C4', 'E4'], ['E3', 'G3', 'B3', 'D4'], ['D3', 'F3', 'A3', 'C4'], ['C3', 'E3', 'G3', 'B3']];
  const MAJB = [['F1', 'A1', 'C2', 'E2'], ['E1', 'G1', 'B1', 'D2'], ['D1', 'F1', 'A1', 'C2'], ['C1', 'E1', 'G1', 'B1']];
  const MIN = [['A2', 'C3', 'E3', 'G3'], ['D3', 'F3', 'A3', 'C4'], ['E3', 'G3', 'B3', 'D4'], ['A2', 'C3', 'E3', 'G3']];
  const MINB = [['A1', 'C2', 'E2', 'G2'], ['D1', 'F1', 'A1', 'C2'], ['E1', 'G1', 'B1', 'D2'], ['A1', 'C2', 'E2', 'G2']];
  const MEL = [['A4', 'C5', 'E5', 'D5'], ['B4', 'D5', 'G5', 'E5'], ['A4', 'F5', 'E5', 'C5'], ['G4', 'B4', 'E5', 'C5']];
  const sec = function (from, to, ch, bs, level) {
    for (let k = 0, bb = from; bb + 4 <= to; bb += 4, k++) {
      const i = k % 4;
      S.chord('keys', ch[i], { beat: bb, beats: 1.4, vel: 46 + level * 4 }); S.chord('keys', ch[i], { beat: bb + 1.5, beats: 2.4, vel: 40 + level * 4 });
      if (level >= 1) S.pattern('bass', 'x.x.x.x.', { from: bb, repeat: 1, pitch: bs[i], vel: 64 });
      if (level >= 2) S.drums({ kick: 'x.......', sidestick: '....x...', hat: 'x.xxx.xx' }, { from: bb, repeat: 1, vel: 44 + level * 4, swing: 0.6 });
      if (level >= 1 && k % 2 === 0) S.pattern('vib', 'x..x.x..', { from: bb, repeat: 1, pitch: MEL[i], vel: 40 });
    }
  };
  const B = function (id) { return Math.round(b(T[id]) / 4) * 4; };
  sec(0, B('ingorgo'), MAJ, MAJB, 0);
  sec(B('ingorgo'), B('piano'), MAJ, MAJB, 2);
  sec(B('piano'), B('collina'), MAJ, MAJB, 1);
  sec(B('collina'), B('sogno'), MAJ, MAJB, 2);
  sec(B('sogno'), B('band'), MAJ, MAJB, 1);
  sec(B('band'), B('prima'), MAJ, MAJB, 3);
  sec(B('prima'), B('audizione'), MIN, MINB, 0);
  sec(B('audizione'), B('epilogo'), MAJ, MAJB, 1);
  sec(B('epilogo'), Math.floor(b(T.END)) - 4, MIN, MINB, 1);
  for (let i = 0; i < 3; i++) S.fx('pop', T.ingorgo + 4.6 + i * 0.5, { vel: 60, pitch: 5 });
  S.fx('thud', T.caffe + 5, { vel: 75 });
  S.fx('click', T.collina + 2, { vel: 60 });
  S.fx('click', T.jazz + 0.8, { vel: 55 });
  S.fx('whoosh', T.osservatorio + 5, { dur: 1.2 });
  S.fx('ding', T.osservatorio + 5.8, { vel: 50 });
  S.fx('whoosh', T.audizione + 8.6, { dur: 0.8 });
  S.fx('click', T.epilogo + 0.7, { vel: 55 });
  S.chord('keys', ['F3', 'A3', 'C4', 'E4', 'G4'], { t: T.END - 3, dur: 3, vel: 52 });
  S.note('bass', 'F1', { t: T.END - 3, dur: 3, vel: 70 });
  S.run('vib', ['C5', 'E5', 'G5', 'A5'], { t: T.END - 2.8, step: 0.25, vel: 40, cresc: 4 });
  S.master({ gain: -4, fadeOut: 2 });
});