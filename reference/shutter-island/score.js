kit.score(function (S, T) {
  S.tempo(90, { t0: 0 });
  S.program('pad', 'pad', { rev: 0.6, gain: -2 });
  S.program('bass', 'bass', { gain: -2 });
  S.program('pl', 'pluck', { gain: -4, pan: 0.2 });
  S.program('bell', 'vibes', { gain: -6, rev: 0.5, pan: -0.2 });
  const b = function (x) { return S.toBeat(x); };
  const prog = [['D3', 'F3', 'A3'], ['A#2', 'D3', 'F3'], ['G2', 'A#2', 'D3'], ['A2', 'C#3', 'E3']];
  const roots = ['D2', 'A#1', 'G1', 'A1'];
  const arp = [['A4', 'D5', 'F5', 'D5'], ['F4', 'A#4', 'D5', 'A#4'], ['D4', 'G4', 'A#4', 'G4'], ['E4', 'A4', 'C#5', 'A4']];
  const sec = function (from, to, level) {
    for (let k = 0, bb = from; bb + 4 <= to; bb += 4, k++) {
      const i = k % 4;
      S.chord('pad', prog[i], { beat: bb, beats: 4, vel: 40 + level * 4 });
      if (level >= 1) S.pattern('pl', 'x.x.x.x.', { from: bb, repeat: 1, pitch: arp[i], vel: 40 });
      if (level >= 2) { S.pattern('bass', 'x..x..x.', { from: bb, repeat: 1, pitch: [roots[i]], vel: 66 }); S.drums({ kick: 'x.......', sidestick: '....x...', shaker: 'oxoxoxox' }, { from: bb, repeat: 1, vel: 46 }); }
      if (level >= 3) S.pattern('pl', '.x.x.x.x', { from: bb, repeat: 1, pitch: arp[(i + 2) % 4], vel: 34 });
    }
  };
  const B = function (id) { return Math.round(b(T[id]) / 4) * 4; };
  sec(0, B('ospedale'), 0);
  sec(B('ospedale'), B('incendio'), 1);
  sec(B('incendio'), B('lavagna'), 2);
  sec(B('lavagna'), B('verita'), 3);
  sec(B('verita'), B('alba'), 1);
  sec(B('alba'), Math.floor(b(T.END)) - 4, 0);
  S.note('bell', 'D5', { t: 0.2, dur: 3, vel: 40 });
  const F = { ospedale: 1.556, cella: 1.455, biglietto: 1.556, studio: 1.556, incendio: 1.455, uragano: 1.455, lavagna: 1.571, verita: 1.538 };
  const at = function (id, s) { return T[id] + s / F[id]; };
  S.fx('click', at('ospedale', 2), { vel: 60 });
  S.fx('thud', at('cella', 3), { vel: 60 });
  S.fx('thud', at('cella', 11), { vel: 45 });
  S.fx('pop', at('biglietto', 3), { vel: 55 });
  S.fx('pop', at('studio', 2), { vel: 45 });
  S.fx('pop', at('studio', 2.3), { vel: 45, pitch: 3 });
  S.fx('whoosh', at('incendio', 8), { dur: 0.8 });
  S.fx('whoosh', at('uragano', 9), { dur: 1.6 });
  S.fx('revswell', at('lavagna', 5.5) - 1.2, { dur: 1.2 });
  S.fx('ding', at('lavagna', 7.3), { vel: 65 });
  S.fx('revswell', at('lavagna', 16.8) - 1.2, { dur: 1.2 });
  S.fx('ding', at('lavagna', 16.8), { vel: 65 });
  S.fx('thud', at('verita', 14), { vel: 80 });
  S.run('bell', ['D5', 'F5', 'A5', 'D6'], { t: T.END - 3.5, step: 0.3, vel: 40, cresc: 4 });
  S.chord('pad', ['D3', 'F3', 'A3', 'D4'], { t: T.END - 4, dur: 4, vel: 50 });
  S.master({ gain: -4, fadeOut: 2 });
});