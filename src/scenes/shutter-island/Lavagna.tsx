import React from 'react';
import { camera, eo, eob, lerp, mod, rainPath, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, GlowGradient, Lin } from '../../lib/fx';
import { HAND } from '../../lib/fonts';
import type { SceneProps } from '../../types';

// Il colpo di scena: interno del faro, lavagna dove i nomi vengono scritti a gesso lettera per lettera
// (EDWARD DANIELS → ANDREW LAEDDIS, RACHEL SOLANDO → DOLORES CHANAL); scrivania con lampada.
// Piani: parete curva del faro + finestra con pioggia (0,25) · cavi e mensola (0,45) · lavagna (0,65)
//        · lampada a sospensione che oscilla (0,7) · scrivania e scala a chiocciola (1,15–1,3)
//        · polvere di gesso e pulviscolo davanti alla camera (1,7)

const K = '#0A1316';
const BOARD = { x: 60, y: 548, w: 848, h: 668 }; // cornice esterna; superficie interna = -24 px per lato
const PITCH = 44; // passo fisso delle lettere: serve a sapere dove sta ogni lettera (gesso e anagramma)
const X0 = 176; // centro della prima lettera
const CHALK = '#E8EFEC';

// Tempi agganciati ai sottotitoli (subtitleTimes su 14 s): «Edward Daniels…» 4,88 s, «Rachel Solando…» 7,73 s,
// «sua moglie» 9,82 s, «Teddy non esiste» 10,74 s, «il paziente 67…» 12,35 s.
// Gli stessi tempi sono in LAVAGNA_ROWS di scripts/audio/shutter-island.mjs (gesso, campane) e nel tuono a 10,8 s.
type Row = { s: string; y: number; a: number; b: number; acc?: boolean; src?: number };
const ROWS: Row[] = [
  { s: 'EDWARD DANIELS', y: 682, a: 4.95, b: 5.85 },
  { s: 'ANDREW LAEDDIS', y: 828, a: 6.2, b: 7.5, acc: true, src: 0 },
  { s: 'RACHEL SOLANDO', y: 980, a: 7.8, b: 8.5 },
  { s: 'DOLORES CHANAL', y: 1126, a: 8.9, b: 9.9, acc: true, src: 2 },
];
const letterTime = (row: Row, i: number) => lerp(row.a, row.b, i / (row.s.length - 1));

// Tremolio della mano: ogni lettera ha rotazione e quota leggermente diverse (seme fisso)
const rj = rng(4071);
const JIT = ROWS.map((row) => row.s.split('').map(() => ({ rot: rj() * 7 - 3.5, dy: rj() * 8 - 4, sc: 0.94 + rj() * 0.12 })));

// Anagramma: per ogni lettera del nome nuovo, quale lettera del nome vecchio "consuma"
const MAP = ROWS.map((row) => {
  if (row.src === undefined) return [] as number[];
  const used = new Set<number>();
  const src = ROWS[row.src].s;
  return row.s.split('').map((ch) => {
    if (ch === ' ') return -1;
    for (let k = 0; k < src.length; k++) {
      if (!used.has(k) && src[k] === ch) {
        used.add(k);
        return k;
      }
    }
    return -1;
  });
});

// Polvere di gesso: ogni granello nasce mentre una lettera viene scritta e cade verso la mensola
const rd = rng(1967);
const DUST = ROWS.flatMap((row, ri) =>
  Array.from({ length: 30 }, (_, k) => {
    const i = Math.min(row.s.length - 1, Math.floor((k / 30) * row.s.length));
    return { ri, born: letterTime(row, i) + rd() * 0.08, x: X0 + i * PITCH + rd() * 30 - 15, y: row.y - 20 - rd() * 30, vx: rd() * 40 - 20, s: 1.6 + rd() * 2.6 };
  }),
);
const rm = rng(812);
const MOTES = Array.from({ length: 24 }, () => ({ u: rm(), v: rm(), s: 2 + rm() * 3.5, sp: 0.015 + rm() * 0.03, ph: rm() * 6 }));
const NEAR = Array.from({ length: 6 }, (_, i) => ({ x: rm() * 1080, y: 520 + rm() * 1200, rad: 45 + rm() * 60, ph: i * 1.3 }));
const SMUDGE = Array.from({ length: 7 }, () => ({ x: 140 + rm() * 680, y: 620 + rm() * 520, rx: 80 + rm() * 140, ry: 26 + rm() * 30, rot: rm() * 20 - 10 }));

// corsi di pietra della parete curva (archi che seguono la rotondità della torre)
const courses = (() => {
  let d = '';
  for (let row = 0; row < 14; row++) {
    const y = -60 + row * 100;
    d += `M-200 ${y + 26} Q540 ${y - 22} 1280 ${y + 26} `;
    for (let c = -1; c < 9; c++) {
      const x = c * 160 + (row % 2) * 80;
      const yy = y + 26 - 48 * (1 - ((x - 540) / 740) ** 2);
      d += `M${x} ${yy.toFixed(0)} v100 `;
    }
  }
  return d;
})();

/** Una riga di gesso: lettere che compaiono una alla volta, con un attimo di "gesso fresco" più chiaro. */
const ChalkRow: React.FC<{ row: Row; ri: number; t: number; fill: string; hot: number[] }> = ({ row, ri, t, fill, hot }) => (
  <g>
    {row.s.split('').map((ch, i) => {
      if (ch === ' ') return null;
      const at = letterTime(row, i);
      const p = seg(t, at, at + 0.09);
      if (p <= 0) return null;
      const j = JIT[ri][i];
      const x = X0 + i * PITCH;
      const fresh = 1 - seg(t, at + 0.09, at + 0.6);
      const h = hot[i] ?? 0; // la lettera sorgente dell'anagramma si accende quando viene "usata"
      return (
        <g key={i} transform={`translate(${x} ${row.y + j.dy}) rotate(${j.rot}) scale(${j.sc * (1 + h * 0.18)})`} opacity={p}>
          {/* sbavatura del gesso dietro la lettera */}
          <text x="0" y="0" textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={92} fill="none" stroke={row.acc ? '#FF8A55' : CHALK} strokeWidth="7" opacity={0.12 + fresh * 0.12}>
            {ch}
          </text>
          <text x="0" y="0" textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={92} fill={h > 0.05 ? 'url(#lv-chalkA)' : fill}>
            {ch}
          </text>
        </g>
      );
    })}
  </g>
);

export const Lavagna: React.FC<SceneProps> = ({ t, dur, palette: P }) => {
  const cam = camera(t, dur, 540, 900);
  const L = cam.layer;

  // Cambi di luce (max 2): la lampada si accende con un tremolio all'inizio, un lampo a «Teddy non esiste»
  const power = (0.3 + 0.7 * eo(seg(t, 0.15, 1.1))) * (1 - 0.45 * seg(t, 0.5, 0.54) * (1 - seg(t, 0.6, 0.68)));
  const flash = seg(t, 10.8, 10.86) * (1 - seg(t, 10.96, 11.6));
  // lampada a sospensione che oscilla (pendolo smorzato appena)
  const swing = Math.sin(t * 1.25) * 7;
  const pool = Math.sin(t * 1.25 - 0.25); // la macchia di luce sulla lavagna segue l'oscillazione
  const flick = 0.96 + Math.sin(t * 13) * 0.02 + Math.sin(t * 7.3) * 0.02;

  // Quale lettera sorgente è "accesa" (anagramma) in questo istante
  const hot = ROWS.map(() => [] as number[]);
  ROWS.forEach((row, ri) => {
    if (row.src === undefined) return;
    MAP[ri].forEach((k, i) => {
      if (k < 0) return;
      const at = letterTime(row, i);
      hot[row.src!][k] = seg(t, at - 0.02, at + 0.08) * (1 - seg(t, at + 0.25, at + 0.6));
    });
  });

  // Segni successivi: frecce, sottolineature, barra sul nome falso, «67» cerchiato
  const arrow1 = eo(seg(t, 5.9, 6.2));
  const arrow2 = eo(seg(t, 8.55, 8.85));
  const under = eo(seg(t, 9.95, 10.35));
  const under2 = eo(seg(t, 10.15, 10.5));
  const strike = eo(seg(t, 10.8, 11.25));
  const six = seg(t, 12.45, 12.55);
  const seven = seg(t, 12.65, 12.75);
  const ring = eo(seg(t, 12.8, 13.35));
  const ringPop = eob(seg(t, 13.3, 13.6), 2);

  const W = { x: 940, y: 600, w: 132, h: 420 }; // finestra stretta e ad arco del faro

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="lv" />
        <Lin id="lv-wall" stops={[[0, '#0D1A1D'], [0.3, '#1D3236'], [0.62, '#2A4245'], [1, '#162629']]} />
        <Lin id="lv-curve" x2={1} y2={0} stops={[[0, '#000', 0.55], [0.22, '#000', 0.1], [0.6, '#000', 0], [1, '#000', 0.5]]} />
        <Lin id="lv-night" stops={[[0, '#0A141A'], [0.6, '#1A3540'], [1, '#2A505A']]} />
        <Lin id="lv-board" stops={[[0, '#1C3133'], [0.5, '#22393A'], [1, '#172A2B']]} />
        <Lin id="lv-frame" x2={1} y2={0} stops={[[0, '#3E2B1E'], [0.4, '#6A4C34'], [1, '#8A6646']]} />
        <Lin id="lv-floor" stops={[[0, '#2A2420'], [0.35, '#1C1815'], [1, '#0A0908']]} />
        <Lin id="lv-desk" stops={[[0, '#6E4F37'], [0.18, '#4E3726'], [1, '#1E140D']]} />
        <Lin id="lv-iron" x2={1} y2={0} stops={[[0, '#0E171A'], [0.4, '#33454A'], [1, '#0B1316']]} />
        <Lin id="lv-cone" stops={[[0, '#FFD98A', 0.2], [0.55, '#FFD98A', 0.08], [1, '#FFD98A', 0]]} />
        <Lin id="lv-shade" x2={1} y2={0} stops={[[0, '#1F3A3A'], [0.45, '#3E6A66'], [1, '#18302F']]} />
        <Lin id="lv-brass" x2={1} y2={0} stops={[[0, '#FFE08A'], [0.5, '#C99A3A'], [1, '#6E5220']]} />
        <GlowGradient id="lv-lamp" color="#FFD98A" />
        <GlowGradient id="lv-pool" color="#FFE2A0" core={0.32} mid={0.12} />
        <GlowGradient id="lv-warm" color="#FFC45C" core={0.75} mid={0.25} />
        <GlowGradient id="lv-moon" color="#BFD9DE" core={0.4} mid={0.14} />
        <GlowGradient id="lv-dust" color="#E9F0F2" core={0.9} mid={0.35} />
        <GlowGradient id="lv-puff" color="#E8EFEC" core={0.55} mid={0.2} />
        <GlowGradient id="lv-smudge" color="#8FA6A2" core={0.22} mid={0.09} />
        <GlowGradient id="lv-ring" color="#FF6B2C" core={0.5} mid={0.16} />
        {/* gesso: colore pieno bucherellato con il colore della lavagna (texture fissa) */}
        <pattern id="lv-chalkW" width="22" height="22" patternUnits="userSpaceOnUse">
          <rect width="22" height="22" fill={CHALK} />
          <circle cx="4" cy="5" r="1.6" fill="#22393A" opacity=".55" />
          <circle cx="15" cy="3" r="1.1" fill="#22393A" opacity=".45" />
          <circle cx="11" cy="13" r="1.8" fill="#22393A" opacity=".4" />
          <circle cx="19" cy="17" r="1.2" fill="#22393A" opacity=".55" />
          <circle cx="3" cy="18" r="1" fill="#22393A" opacity=".5" />
        </pattern>
        <pattern id="lv-chalkA" width="22" height="22" patternUnits="userSpaceOnUse">
          <rect width="22" height="22" fill={P.accento} />
          <circle cx="4" cy="5" r="1.6" fill="#22393A" opacity=".5" />
          <circle cx="15" cy="3" r="1.1" fill="#22393A" opacity=".4" />
          <circle cx="11" cy="13" r="1.8" fill="#22393A" opacity=".35" />
          <circle cx="19" cy="17" r="1.2" fill="#22393A" opacity=".5" />
          <circle cx="3" cy="18" r="1" fill="#22393A" opacity=".45" />
        </pattern>
        <clipPath id="lv-winclip">
          <path d={`M${W.x} ${W.y + W.h} V${W.y + 66} a${W.w / 2} 66 0 0 1 ${W.w} 0 V${W.y + W.h} Z`} />
        </clipPath>
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — parete curva del faro con finestra (0,25) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="1470" fill="url(#lv-wall)" />
          <path d={courses} fill="none" stroke="#0B1517" strokeWidth="5" opacity=".5" />
          {/* bordi chiari dei blocchi verso la lampada */}
          <path d="M300 760 Q540 716 780 760 M240 1060 Q540 1012 840 1060" fill="none" stroke="#5E7C7C" strokeWidth="3" opacity=".25" />
          {/* alone della lampada sulla parete */}
          <ellipse cx={600 + pool * 60} cy="560" rx={520} ry={360} fill="url(#lv-pool)" opacity={power * flick} />
          {/* finestra: notte, pioggia su due livelli, lampo */}
          <ellipse cx={W.x + W.w / 2} cy={W.y + W.h / 2} rx="200" ry="300" fill="url(#lv-moon)" opacity={0.6 + flash} />
          <path d={`M${W.x - 16} ${W.y + W.h + 14} V${W.y + 66} a${W.w / 2 + 16} 82 0 0 1 ${W.w + 32} 0 V${W.y + W.h + 14} Z`} fill="#152225" stroke={K} strokeWidth="9" />
          <g clipPath="url(#lv-winclip)">
            <rect x={W.x} y={W.y} width={W.w} height={W.h} fill="url(#lv-night)" />
            <path d={`M${W.x} ${W.y + 330} Q${W.x + 50} ${W.y + 300} ${W.x + 132} ${W.y + 320} V${W.y + W.h} H${W.x} Z`} fill="#10242B" />
            <path d={rainPath(26, 21, 46, 12, 200, 440)} transform={`translate(${W.x - 10} ${W.y - 440 + mod(t * 520, 440)})`} stroke="#8DB6BE" strokeWidth="2.5" opacity=".45" />
            <path d={rainPath(26, 21, 46, 12, 200, 440)} transform={`translate(${W.x - 10} ${W.y + mod(t * 520, 440)})`} stroke="#8DB6BE" strokeWidth="2.5" opacity=".45" />
            <path d={rainPath(10, 33, 80, 22, 200, 440)} transform={`translate(${W.x} ${W.y - 440 + mod(t * 900, 440)})`} stroke="#CFE3E8" strokeWidth="4" opacity=".6" />
            <path d={rainPath(10, 33, 80, 22, 200, 440)} transform={`translate(${W.x} ${W.y + mod(t * 900, 440)})`} stroke="#CFE3E8" strokeWidth="4" opacity=".6" />
            {/* gocce che scorrono sul vetro */}
            {[0, 1, 2, 3].map((k) => {
              const p = mod(t * 0.22 + k * 0.27, 1);
              const x = W.x + 22 + k * 30 + Math.sin(p * 9 + k) * 4;
              return <path key={k} d={`M${x} ${W.y + 70 + p * 330} v-${30 + k * 6}`} stroke="#DDEFF2" strokeWidth="4" strokeLinecap="round" opacity={0.55 * Math.sin(p * Math.PI)} />;
            })}
            <rect x={W.x} y={W.y} width={W.w} height={W.h} fill="#EAF6FA" opacity={flash * 0.85} />
            <path d={`M${W.x + 80} ${W.y + 40} L${W.x + 56} ${W.y + 130} L${W.x + 80} ${W.y + 126} L${W.x + 48} ${W.y + 250}`} fill="none" stroke="#FFFFFF" strokeWidth="6" strokeLinejoin="round" opacity={flash} />
          </g>
          <path d={`M${W.x + W.w / 2} ${W.y} V${W.y + W.h} M${W.x} ${W.y + 220} H${W.x + W.w}`} stroke={K} strokeWidth="10" />
          <path d={`M${W.x - 8} ${W.y + W.h + 6} V${W.y + 70}`} stroke="#A9C3C6" strokeWidth="3" opacity=".5" />
          <rect x={W.x - 34} y={W.y + W.h + 12} width={W.w + 68} height="22" fill="#4F6466" stroke={K} strokeWidth="7" />
          {/* curvatura della torre: bordi più scuri */}
          <rect x="-200" y="-200" width="1480" height="1470" fill="url(#lv-curve)" />
        </g>

        {/* PIANO 1 — pavimento, cavi elettrici e mensola con lanterna e registro (0,45) */}
        <g transform={L(0.45)}>
          <rect x="-200" y="1262" width="1480" height="900" fill="url(#lv-floor)" />
          <path d="M-200 1262 H1280" stroke={K} strokeWidth="9" />
          <g stroke="#0C0A09" strokeWidth="5" opacity=".7">
            <path d="M540 1262 V2100 M300 1262 L-200 2000 M780 1262 L1280 2000 M80 1262 L-800 2000 M1000 1262 L1880 2000 M-200 1380 H1280 M-200 1560 H1280" />
          </g>
          {/* luce della lampada sul pavimento */}
          <ellipse cx={520 + pool * 120} cy="1300" rx="380" ry="46" fill="url(#lv-pool)" opacity={power * 1.4} />
          {/* cavo elettrico lungo la parete con isolatori */}
          <path d="M-200 214 Q200 196 520 206 Q760 214 1280 192 M1010 196 Q1004 400 1000 560" fill="none" stroke="#0E1719" strokeWidth="6" />
          {[150, 760, 1004].map((x, i) => (
            <ellipse key={x} cx={x} cy={i === 2 ? 380 : 206} rx="8" ry="11" fill="#7F9592" stroke={K} strokeWidth="4" />
          ))}
          {/* mensola sotto la finestra */}
          <rect x="924" y="1120" width="200" height="20" fill="url(#lv-frame)" stroke={K} strokeWidth="7" />
          <path d="M940 1140 l20 30 M1100 1140 l-20 30" stroke={K} strokeWidth="7" />
          <g transform="translate(975 1120)">
            <rect x="-22" y="-74" width="44" height="66" rx="8" fill="#2B3D40" stroke={K} strokeWidth="6" />
            <rect x="-14" y="-64" width="28" height="44" rx="5" fill="#557375" opacity=".7" />
            <path d="M-26 -8 H26 M-18 -74 Q0 -100 18 -74" fill="none" stroke={K} strokeWidth="6" />
            <path d="M-10 -60 V-26" stroke="#BFD6D6" strokeWidth="3" opacity=".6" />
          </g>
          <g transform="translate(1050 1120)">
            <rect x="-34" y="-30" width="70" height="30" rx="3" fill="#3C2A1E" stroke={K} strokeWidth="6" />
            <path d="M-30 -20 H32" stroke="#C9B08F" strokeWidth="3" opacity=".6" />
          </g>
          {/* ombra della lavagna sul pavimento */}
          <ellipse cx="480" cy="1272" rx="480" ry="18" fill="#000" opacity=".35" />
        </g>

        {/* PIANO 2 — la lavagna (0,65) */}
        <g transform={L(0.65)}>
          {/* gambe del cavalletto */}
          <path d={`M${BOARD.x + 90} ${BOARD.y + BOARD.h} L${BOARD.x + 60} 1272 M${BOARD.x + BOARD.w - 90} ${BOARD.y + BOARD.h} L${BOARD.x + BOARD.w - 60} 1272`} stroke={K} strokeWidth="18" strokeLinecap="round" />
          <rect x={BOARD.x} y={BOARD.y} width={BOARD.w} height={BOARD.h} rx="12" fill="url(#lv-frame)" stroke={K} strokeWidth="10" />
          <path d={`M${BOARD.x + 8} ${BOARD.y + 8} H${BOARD.x + BOARD.w - 8}`} stroke="#C9A27A" strokeWidth="4" opacity=".6" />
          <rect x={BOARD.x + 24} y={BOARD.y + 24} width={BOARD.w - 48} height={BOARD.h - 48} fill="url(#lv-board)" stroke={K} strokeWidth="6" />
          {/* vecchie cancellature e un vecchio "4" quasi sparito */}
          {SMUDGE.map((s, i) => (
            <ellipse key={i} cx={s.x} cy={s.y} rx={s.rx} ry={s.ry} transform={`rotate(${s.rot} ${s.x} ${s.y})`} fill="url(#lv-smudge)" />
          ))}
          <text x="840" y="640" textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={70} fill={CHALK} opacity=".08">4</text>
          <path d="M120 1180 q60 -14 120 -2 M600 600 q40 10 90 -4" fill="none" stroke={CHALK} strokeWidth="4" opacity=".07" strokeLinecap="round" />
          {/* macchia di luce della lampada che oscilla */}
          <ellipse cx={500 + pool * 150} cy="840" rx="430" ry="340" fill="url(#lv-pool)" opacity={power * flick * 0.9} />

          {/* i nomi, a gesso */}
          {ROWS.map((row, ri) => (
            <ChalkRow key={ri} row={row} ri={ri} t={t} fill={row.acc ? 'url(#lv-chalkA)' : 'url(#lv-chalkW)'} hot={hot[ri]} />
          ))}
          {/* segni dell'anagramma sotto le lettere vecchie usate */}
          {ROWS.map((row, ri) =>
            row.src === undefined
              ? null
              : MAP[ri].map((k, i) => {
                  if (k < 0) return null;
                  const p = seg(t, letterTime(row, i), letterTime(row, i) + 0.12);
                  if (p <= 0) return null;
                  const sx = X0 + k * PITCH;
                  const sy = ROWS[row.src!].y + 18;
                  return <path key={`${ri}-${i}`} d={`M${sx - 12} ${sy} q12 ${6} 24 0`} fill="none" stroke={P.accento} strokeWidth="4" strokeLinecap="round" opacity={p * 0.75} />;
                }),
          )}
          {/* frecce a gesso sul margine sinistro */}
          <g fill="none" stroke={CHALK} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M118 660 Q96 720 116 790" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - arrow1} opacity={arrow1 > 0 ? 0.85 : 0} />
            <path d="M100 770 L116 794 L134 772" opacity={seg(arrow1, 0.85, 1) * 0.85} />
            <path d="M118 958 Q96 1018 116 1088" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - arrow2} opacity={arrow2 > 0 ? 0.85 : 0} />
            <path d="M100 1068 L116 1092 L134 1070" opacity={seg(arrow2, 0.85, 1) * 0.85} />
          </g>
          {/* «sua moglie»: doppia sottolineatura */}
          <g fill="none" stroke={P.accento} strokeWidth="6" strokeLinecap="round">
            <path d="M150 1146 Q450 1160 760 1142" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - under} opacity={under > 0 ? 0.9 : 0} />
            <path d="M190 1162 Q470 1174 730 1158" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - under2} opacity={under2 > 0 ? 0.8 : 0} />
          </g>
          {/* «Teddy non esiste»: il nome falso viene barrato */}
          <path d="M146 668 Q300 652 460 664 T770 656" fill="none" stroke={CHALK} strokeWidth="8" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - strike} opacity={strike > 0 ? 0.9 : 0} />
          {/* «Il paziente 67»: numero cerchiato a destra di ANDREW LAEDDIS, il suo vero nome */}
          <g transform={`translate(830 796) scale(${0.85 * (1 + ringPop * 0.04 - 0.04 * seg(t, 13.6, 13.9))})`}>
            <circle cx="0" cy="0" r={90} fill="url(#lv-ring)" opacity={ring * (0.7 + Math.sin(t * 3) * 0.15)} />
            <text x="-18" y="26" textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={84} fill="url(#lv-chalkA)" opacity={six} transform="rotate(-4)">6</text>
            <text x="20" y="24" textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={84} fill="url(#lv-chalkA)" opacity={seven} transform="rotate(3)">7</text>
            <path d="M8 -56 C-50 -54 -62 40 -6 50 C52 58 66 -30 20 -52 L4 -58" fill="none" stroke={P.accento} strokeWidth="6" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - ring} opacity={ring > 0 ? 0.95 : 0} />
          </g>

          {/* mensola portagessi con gessetti e cancellino */}
          <rect x={BOARD.x - 6} y={BOARD.y + BOARD.h - 8} width={BOARD.w + 12} height="30" rx="4" fill="url(#lv-frame)" stroke={K} strokeWidth="8" />
          <path d={`M${BOARD.x} ${BOARD.y + BOARD.h - 2} H${BOARD.x + BOARD.w}`} stroke="#C9A27A" strokeWidth="3" opacity=".6" />
          <rect x="190" y={BOARD.y + BOARD.h - 30} width="120" height="26" rx="5" fill="#2F2622" stroke={K} strokeWidth="6" />
          <rect x="196" y={BOARD.y + BOARD.h - 30} width="108" height="9" rx="3" fill="#D8D2C6" />
          <rect x="560" y={BOARD.y + BOARD.h - 22} width="56" height="14" rx="6" fill={CHALK} stroke={K} strokeWidth="4" />
          <rect x="640" y={BOARD.y + BOARD.h - 20} width="30" height="12" rx="5" fill={P.accento} stroke={K} strokeWidth="4" />
          {/* polvere accumulata sulla mensola */}
          <ellipse cx="460" cy={BOARD.y + BOARD.h - 8} rx="160" ry="5" fill={CHALK} opacity={0.15 + 0.25 * seg(t, 4.9, 12)} />
        </g>

        {/* polvere di gesso che si stacca mentre la lettera viene scritta (0,65) */}
        <g transform={L(0.65)}>
          {DUST.map((d, i) => {
            const age = t - d.born;
            if (age < 0 || age > 1.6) return null;
            const x = d.x + d.vx * age + Math.sin(age * 5 + i) * 4;
            const y = d.y + 30 * age + 80 * age * age;
            return <circle key={i} cx={x} cy={y} r={d.s} fill={CHALK} opacity={(1 - age / 1.6) * 0.85} />;
          })}
          {ROWS.map((row, ri) => {
            if (t < row.a || t > row.b + 0.8) return null;
            const p = seg(t, row.a, row.b);
            const i = Math.round(p * (row.s.length - 1));
            return <circle key={ri} cx={X0 + i * PITCH + 10} cy={row.y - 30} r={46 + Math.sin(t * 20) * 6} fill="url(#lv-puff)" opacity={(1 - seg(t, row.b, row.b + 0.8)) * 0.7} />;
          })}
          {t > 12.4 && t < 14 && <circle cx="834" cy="772" r={52 + Math.sin(t * 18) * 5} fill="url(#lv-puff)" opacity={(1 - seg(t, 13.35, 14)) * 0.6} />}
        </g>

        {/* PIANO 3 — lampada a sospensione che oscilla, con cono di luce e pulviscolo (0,7) */}
        <g transform={`${L(0.7)} rotate(${swing} 560 -120)`}>
          <path d="M560 -120 V170" stroke={K} strokeWidth="6" />
          <path d="M80 1260 L512 228 H608 L1040 1260 Z" fill="url(#lv-cone)" opacity={power * flick * 0.9} />
          {MOTES.map((m, i) => {
            const v = mod(m.v + t * m.sp, 1);
            const y = lerp(260, 1240, v);
            const half = lerp(60, 480, v);
            const x = 560 + (m.u * 2 - 1) * half + Math.sin(t * 0.7 + m.ph) * 12;
            return <circle key={i} cx={x} cy={y} r={m.s} fill="#FFF1CF" opacity={(0.25 + 0.4 * (0.5 + 0.5 * Math.sin(t * 2 + m.ph))) * Math.sin(v * Math.PI) * power} />;
          })}
          <circle cx="560" cy="226" r={120 + Math.sin(t * 2.2) * 8} fill="url(#lv-lamp)" opacity={0.6 * power * flick} />
          <path d="M500 230 L530 170 H590 L620 230 Z" fill="url(#lv-shade)" stroke={K} strokeWidth="8" strokeLinejoin="round" />
          <path d="M534 176 H586" stroke="#9CC9C2" strokeWidth="3" opacity=".7" />
          <ellipse cx="560" cy="232" rx="58" ry="10" fill="#FFF3C8" opacity={0.5 + 0.5 * power} stroke={K} strokeWidth="5" />
        </g>

        {/* lampo che illumina la stanza */}
        <rect x="-200" y="-200" width="1480" height="2400" fill="#CFE7F0" opacity={flash * 0.14} />

        {/* PIANO 4 — scala a chiocciola a sinistra e scrivania in primo piano (1,15–1,3) */}
        <g transform={L(1.15)}>
          {/* corrimano e colonnine della scala a chiocciola */}
          <path d="M-40 380 Q60 520 40 760 Q20 1000 90 1240 Q130 1400 70 1560" fill="none" stroke="url(#lv-iron)" strokeWidth="22" strokeLinecap="round" />
          <path d="M-40 380 Q60 520 40 760 Q20 1000 90 1240 Q130 1400 70 1560" fill="none" stroke={K} strokeWidth="5" opacity=".7" />
          <path d="M-30 392 Q66 530 46 760" fill="none" stroke="#8FA8AC" strokeWidth="3" opacity=".55" />
          {/* colonnine verticali dal corrimano ai gradini */}
          {[[18, 470], [46, 640], [36, 860], [50, 1060], [96, 1270]].map(([x, y], i) => (
            <path key={i} d={`M${x} ${y} V${y + 150}`} stroke={K} strokeWidth="8" strokeLinecap="round" />
          ))}
          {/* gradini di ferro con bordo illuminato verso la lampada */}
          {[620, 840, 1060, 1270].map((y, i) => (
            <g key={y}>
              <path d={`M-80 ${y + 34} L${70 + (i % 2) * 16} ${y} L${74 + (i % 2) * 16} ${y + 20} L-80 ${y + 58} Z`} fill="#1A2629" stroke={K} strokeWidth="6" strokeLinejoin="round" />
              <path d={`M-70 ${y + 30} L${64 + (i % 2) * 16} ${y + 4}`} stroke="#7F9A9C" strokeWidth="3" opacity=".6" />
            </g>
          ))}
        </g>
        <g transform={L(1.3)}>
          {/* piano della scrivania */}
          <path d="M-100 1612 L1180 1580 V2100 H-100 Z" fill="url(#lv-desk)" stroke={K} strokeWidth="10" strokeLinejoin="round" />
          <path d="M-100 1622 L1180 1590" stroke="#B08A62" strokeWidth="5" opacity=".7" />
          <path d="M-100 1700 L1180 1676 M-100 1800 L1180 1780" stroke="#1A110B" strokeWidth="4" opacity=".5" />
          {/* luce della lampada da tavolo sul piano */}
          <ellipse cx="850" cy="1700" rx={300 + Math.sin(t * 2) * 8} ry="70" fill="url(#lv-warm)" opacity=".5" />
          {/* cartella aperta e fogli */}
          <g transform="rotate(-5 380 1680)">
            <rect x="200" y="1620" width="360" height="190" rx="6" fill="#C9B48A" stroke={K} strokeWidth="8" />
            <rect x="222" y="1606" width="300" height="180" rx="4" fill="#ECE8DD" stroke={K} strokeWidth="6" />
            <path d="M246 1640 H470 M246 1670 H500 M246 1700 H440 M246 1730 H480" stroke="#4A5A5E" strokeWidth="5" opacity=".55" />
            <rect x="420" y="1716" width="80" height="50" fill="none" stroke="#7A8A8E" strokeWidth="4" opacity=".6" />
          </g>
          {/* matita */}
          <path d="M600 1700 L760 1676" stroke="#C9A040" strokeWidth="12" strokeLinecap="round" />
          <path d="M600 1700 L616 1698" stroke={K} strokeWidth="12" strokeLinecap="round" />
          {/* lampada da tavolo: base d'ottone, paralume verde petrolio */}
          <g transform="translate(860 1680)">
            <circle cx="0" cy="-80" r={170 + Math.sin(t * 2.4) * 8} fill="url(#lv-warm)" opacity=".55" />
            <rect x="-9" y="-92" width="18" height="90" fill="url(#lv-brass)" stroke={K} strokeWidth="5" />
            <ellipse cx="0" cy="0" rx="80" ry="18" fill="url(#lv-brass)" stroke={K} strokeWidth="8" />
            <path d="M-50 -8 Q0 -16 40 -10" fill="none" stroke="#FFF1C2" strokeWidth="4" opacity=".7" />
            <path d="M-130 -82 Q0 -170 130 -82 Z" fill="url(#lv-shade)" stroke={K} strokeWidth="9" strokeLinejoin="round" />
            <path d="M-96 -104 Q0 -156 96 -104" fill="none" stroke="#9CC9C2" strokeWidth="4" opacity=".7" />
            <path d="M-120 -82 H120" stroke="#FFE7A0" strokeWidth="6" opacity=".9" />
          </g>
          {/* tazza */}
          <g transform="translate(110 1690)">
            <path d="M-40 -60 H40 L34 0 H-34 Z" fill="#B9C7C6" stroke={K} strokeWidth="7" strokeLinejoin="round" />
            <path d="M40 -46 q26 4 22 26 q-4 14 -26 12" fill="none" stroke={K} strokeWidth="7" />
            <path d="M-28 -52 V-8" stroke="#F1F6F7" strokeWidth="5" opacity=".8" />
            {/* vapore */}
            {[0, 1].map((k) => {
              const p = mod(t * 0.4 + k * 0.5, 1);
              return <path key={k} d={`M${-8 + k * 14} -70 q${14 * Math.sin(p * 6)} -30 0 -60`} transform={`translate(0 ${-p * 60})`} fill="none" stroke="#DCE6E8" strokeWidth="5" strokeLinecap="round" opacity={(1 - p) * 0.45} />;
            })}
          </g>
        </g>

        {/* PIANO 5 — pulviscolo vicino alla camera (1,7) */}
        <g transform={L(1.7)}>
          {NEAR.map((n, i) => (
            <circle key={i} cx={n.x + Math.sin(t * 0.4 + n.ph) * 60} cy={n.y - mod(t * 16 + i * 90, 400) + 200} r={n.rad} fill="url(#lv-dust)" opacity={0.08 + flash * 0.1} />
          ))}
        </g>
      </g>

      <Finish id="lv" tint="#0E3A40" tintOpacity={0.12} />
    </svg>
  );
};
