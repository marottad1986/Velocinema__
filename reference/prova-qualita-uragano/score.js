kit.score(function (S, T) {
  S.tempo(80, { t0: 0 });
  S.program('pad', 'pad', { rev: 0.7, gain: -3 });
  S.program('bass', 'bass', { gain: -4 });
  const prog = [['D3', 'F3', 'A3'], ['A#2', 'D3', 'F3'], ['G2', 'A#2', 'D3'], ['A2', 'C#3', 'E3']];
  const roots = ['D1', 'A#0', 'G1', 'A1'];
  const end = Math.floor(S.toBeat(T.END)) - 2;
  for (let k = 0, bb = 0; bb + 4 <= end; bb += 4, k++) { S.chord('pad', prog[k % 4], { beat: bb, beats: 4, vel: 42 }); S.note('bass', roots[k % 4], { beat: bb, beats: 3.5, vel: 60 }); }
  S.fx('whoosh', T.prima + 4, { dur: 1.6 });
  S.fx('revswell', T.dopo - 1, { dur: 1 });
  S.fx('thud', T.dopo + 3, { vel: 85 });
  S.fx('thud', T.dopo + 7.2, { vel: 70 });
  S.fx('whoosh', T.dopo + 5, { dur: 2 });
  S.master({ gain: -4, fadeOut: 1.5 });
});