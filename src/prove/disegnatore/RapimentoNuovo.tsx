import React from 'react';
import { camera, eio, eo, lerp, mod, rng, seg } from '../../lib/anim';
import { Glow, NearMotes, SunRays } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { BBDefs, Cristalli } from '../../scenes/breaking-bad-stagione-1/Comuni';
import { Auto, BB2Defs, K } from '../../scenes/breaking-bad-stagione-2/Comuni';

// PROVA del metodo «disegnatore» (proposta approvata dall'editore il 25 nov 2026): la stessa scena di
// Breaking Bad stagione 2, capitolo 1 «Rapiti nel deserto», ridisegnata partendo dal fotogramma chiave fermo
// (8,5 s: l'auto è arrivata, la finestra si è accesa) e con la tavola di stile della casa. Non entra nel video.
//
// Tavola di stile applicata (da portare in QUALITA.md se l'editore approva la prova):
//  1. Controluce: il sole è DIETRO il soggetto, basso sull'orizzonte; le facce verso la camera sono in ombra
//     calda, i bordi verso il sole hanno il «filo di luce» (linea chiara 3–4 px, #FFC88A).
//  2. Ombre lunghe portate verso la camera, viola-bruno semitrasparente (#2A1226, 0,45), mai nere.
//  3. Prospettiva aerea: ogni piano lontano è più chiaro, più viola e senza contorni; i contorni (9 px oggetti
//     principali, 5 px dettagli) solo dal piano medio in avanti.
//  4. Un punto di fuga dichiarato (la strada e i pali vanno verso il sole): l'occhio entra nella scena.
//  5. Materiali che si riconoscono: intonaco crepato con i mattoni sotto, lamiera ondulata, legno con le venature,
//     vetro che riflette il cielo.
//  6. Firme ricorrenti: la finestra accesa con la luce che cade sul terreno, la polvere che brilla nel controluce,
//     il riflesso del cielo nelle lenti, l'oro solo sull'oggetto chiave.

const r = rng(2201);
const VP = { x: 700, y: 1084 }; // punto di fuga, sotto il sole
const POLES = [
  { x: 1012, y: 1238, h: 330 },
  { x: 884, y: 1166, h: 178 },
  { x: 804, y: 1126, h: 98 },
  { x: 752, y: 1104, h: 54 },
  { x: 724, y: 1093, h: 28 },
];
const STONES = Array.from({ length: 34 }, () => ({ x: r() * 1300 - 110, y: 1540 + r() * 400, rx: 8 + r() * 24, ry: 5 + r() * 10 }));
const PEBBLES = Array.from({ length: 70 }, () => ({ x: r() * 1300 - 110, y: 1300 + r() * 640, s: 2 + r() * 4 }));
const BRICKS = [
  [118, 1132], [134, 1146], [380, 1060], [396, 1074], [364, 1074], [210, 1214], [226, 1228],
] as const;

const RIM = '#FFC88A';
const SHADOW = '#2A1226';

export const RapimentoNuovo: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const tIn = griglia(cues[0] + 0.2);
  const tCops = griglia(cues[1] + 0.3);
  const tStop = griglia(cues[2] + 1.0);
  const drive = eio(seg(t, tIn, tStop));
  const carX = lerp(1320, 640, drive);
  const moving = t > tIn && t < tStop;
  const cops = seg(t, tCops, tCops + 0.4) * (1 - seg(t, tCops + 3.2, tCops + 4));
  const lightsOn = t < tStop + 0.2 ? 1 : 1 - seg(t, tStop + 0.2, tStop + 0.5);
  const win = eo(seg(t, tStop + 0.5, tStop + 0.9));
  const dust = t > tIn ? 1 - 0.55 * seg(t, tStop + 0.6, tStop + 3) : 0;
  const blade = t * 1.6 * 57.3;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="rn" />
        <BBDefs id="rn" />
        <BB2Defs id="rn" />
        <Lin id="rn-sky" stops={[[0, '#140D28'], [0.42, '#3A1E4A'], [0.6, '#7A2E52'], [0.74, '#C24A4C'], [0.84, '#EE8446'], [0.93, '#FFC878']]} />
        <Lin id="rn-ground" stops={[[0, '#E89A60'], [0.06, '#B8683E'], [0.2, '#7A3C2E'], [0.5, '#4A2226'], [1, '#22101A']]} />
        <Lin id="rn-road" stops={[[0, '#FFD08A'], [0.25, '#C8845A'], [1, '#7A4436']]} />
        <Lin id="rn-front" stops={[[0, '#9A5446'], [0.6, '#74403A'], [1, '#5A2E30']]} />
        <Lin id="rn-side" x2={1} y2={0} stops={[[0, '#D88A5A'], [0.7, '#F2AE70'], [1, '#FFD08A']]} />
        <Lin id="rn-lens" stops={[[0, '#3A1E4A'], [0.45, '#C8504A'], [0.75, '#F2A050'], [1, '#FFE0A0']]} />
        <Lin id="rn-tin" x2={1} y2={0} stops={[[0, '#6A5A5A'], [0.5, '#9A8A84'], [1, '#C8A888']]} />
        <Lin id="rn-pad" x2={1} y2={0} stops={[[0, '#2E4A2E'], [0.6, '#4A6A3A'], [1, '#8AA058']]} />
        <Lin id="rn-spill" stops={[[0, '#FFC870', 0.55], [1, '#FFC870', 0]]} />
        <radialGradient id="rn-glare" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#FFE2A0" stopOpacity=".85" />
          <stop offset=".5" stopColor="#FFB060" stopOpacity=".3" />
          <stop offset="1" stopColor="#FFB060" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — cielo del tramonto, il sole basso dietro la scena, nuvole a strati illuminate da sotto (0,22) */}
        <g transform={L(0.22)}>
          <rect x="-200" y="-200" width="1480" height="1400" fill="url(#rn-sky)" />
          <SunRays id="rn-rays" x={VP.x} y={1040} t={t} color="#FFD8A0" n={11} length={900} width={90} from={-78} to={78} opacity={0.32} />
          <Glow id="rn-sunh" x={VP.x} y={1040} r={640} t={t} color="#FFB060" amp={0.025} rate={0.6} opacity={0.75} />
          <circle cx={VP.x} cy={1040} r="92" fill="#FFE6A8" />
          <circle cx={VP.x} cy={1040} r="70" fill="#FFF4D2" />
          {/* nuvole a lente: pancia accesa d'arancio, dorso viola; nessuna sopra y 700 (zona del titolo) */}
          {[
            { x: 860, y: 900, w: 300, h: 22 },
            { x: 560, y: 948, w: 230, h: 15 },
            { x: 1010, y: 980, w: 200, h: 13 },
            { x: 380, y: 1000, w: 160, h: 10 },
            { x: 820, y: 820, w: 220, h: 16 },
          ].map((c, i) => {
            const x = c.x + Math.sin(t * 0.1 + i) * 10;
            return (
              <g key={i}>
                <path d={`M${x - c.w} ${c.y} Q${x - c.w * 0.4} ${c.y - c.h * 2.2} ${x + c.w * 0.2} ${c.y - c.h} Q${x + c.w * 0.7} ${c.y - c.h * 1.6} ${x + c.w} ${c.y} Z`} fill="#6A2C52" opacity=".85" />
                <path d={`M${x - c.w * 0.9} ${c.y} Q${x} ${c.y + c.h * 0.7} ${x + c.w * 0.95} ${c.y}`} stroke="#FFB070" strokeWidth={c.h * 0.35} fill="none" strokeLinecap="round" opacity=".9" />
              </g>
            );
          })}
        </g>

        {/* PIANO 1 — mesa lontane in prospettiva aerea (più lontano = più chiaro e viola, senza contorni) (0,32) */}
        <g transform={L(0.32)}>
          <path d="M-200 1084 V1046 L-60 1040 L40 1026 H210 L250 1048 L420 1052 L470 1084 Z" fill="#B0607A" opacity=".8" />
          <path d="M860 1084 L900 1040 L940 1030 H1100 L1140 1050 H1280 V1084 Z" fill="#B0607A" opacity=".8" />
          <path d="M-200 1084 V1060 L-90 1054 L-40 1000 H150 L190 1064 L330 1068 L360 1084 Z" fill="#8A4258" />
          <path d="M-40 1000 H150" stroke="#FFB27A" strokeWidth="3" opacity=".8" />
          <path d="M790 1084 L830 1008 L860 990 H1040 L1060 1010 L1090 1062 L1280 1066 V1084 Z" fill="#7A3448" />
          <path d="M830 1008 L860 990 H1040" stroke="#FFB27A" strokeWidth="4" opacity=".85" />
          {[880, 930, 990].map((x) => <path key={x} d={`M${x} 994 L${x - 8} 1080`} stroke="#5E2638" strokeWidth="3" opacity=".6" />)}
          {/* luci della polizia all'orizzonte (seconda frase) */}
          {cops > 0 && [0, 1, 2].map((k) => {
            const on = Math.sin(t * 14 + k * 2) > 0;
            return (
              <g key={k}>
                <Glow id={`rn-cop${k}`} x={560 + k * 46} y={1080} r={90} t={t} color={on ? '#FF3A3A' : '#3A7AFF'} amp={0.1} rate={10} opacity={0.9 * cops} />
                <circle cx={560 + k * 46} cy={1080} r="6" fill={on ? '#FFB0B0' : '#B0C8FF'} opacity={cops} />
              </g>
            );
          })}
        </g>

        {/* PIANO 2 — la piana: terreno acceso dal riverbero, strada verso il sole, pali che si rimpiccioliscono (0,45) */}
        <g transform={L(0.45)}>
          <rect x="-200" y="1082" width="1480" height="900" fill="url(#rn-ground)" />
          <ellipse cx={VP.x} cy="1096" rx="520" ry="34" fill="url(#rn-glare)" />
          {/* strada sterrata: dal punto di fuga verso la camera, esce a destra */}
          <path d={`M${VP.x - 3} ${VP.y} L${VP.x + 3} ${VP.y} Q900 1176 1290 1250 L1290 1500 Q800 1240 ${VP.x - 3} ${VP.y} Z`} fill="url(#rn-road)" />
          <path d={`M${VP.x} ${VP.y} Q860 1200 1290 1380`} stroke="#E8A870" strokeWidth="5" fill="none" opacity=".5" strokeDasharray="30 22" />
          <path d={`M${VP.x - 1} ${VP.y} Q820 1214 1290 1452 M${VP.x + 1} ${VP.y} Q880 1186 1290 1300`} stroke="#5A2C2C" strokeWidth="4" fill="none" opacity=".55" />
          {/* cespugli lontani, piccoli e senza contorno */}
          {[[180, 1100, 18], [300, 1108, 14], [560, 1102, 12], [960, 1112, 16], [1060, 1130, 22], [120, 1140, 26]].map(([x, y, s], i) => (
            <g key={i}>
              <ellipse cx={x} cy={y} rx={s} ry={s * 0.5} fill="#5A4A36" />
              <path d={`M${x - s * 0.8} ${y - s * 0.2} Q${x} ${y - s * 0.9} ${x + s * 0.8} ${y - s * 0.2}`} stroke="#E8A070" strokeWidth="2" fill="none" opacity=".7" />
            </g>
          ))}
          {/* pali della luce in prospettiva, con il filo di luce verso il sole e i fili che brillano */}
          {POLES.map((p, i) => {
            const w = Math.max(2, p.h / 34);
            const arm = p.h * 0.2;
            return (
              <g key={i}>
                <path d={`M${p.x} ${p.y} L${p.x - p.h * 0.5} ${p.y + p.h * 0.06}`} stroke={SHADOW} strokeWidth={w * 1.4} opacity=".35" />
                <path d={`M${p.x} ${p.y} V${p.y - p.h}`} stroke="#2A1620" strokeWidth={w * 1.3} />
                <path d={`M${p.x - w * 0.5} ${p.y} V${p.y - p.h}`} stroke={RIM} strokeWidth={Math.max(1, w * 0.35)} opacity=".8" />
                <path d={`M${p.x - arm} ${p.y - p.h * 0.92} H${p.x + arm}`} stroke="#2A1620" strokeWidth={w} />
                {i < 2 && <circle cx={p.x - arm * 0.7} cy={p.y - p.h * 0.92 - w} r={w * 0.9} fill="#C8D8E0" stroke="#2A1620" strokeWidth={w * 0.4} />}
              </g>
            );
          })}
          {[-1, 1].map((side) => (
            <path key={side} d={POLES.map((p, i) => {
              const x = p.x + side * p.h * 0.2, y = p.y - p.h * 0.92;
              if (i === 0) return `M${x} ${y}`;
              const q = POLES[i - 1];
              const qx = q.x + side * q.h * 0.2, qy = q.y - q.h * 0.92;
              return `Q${(x + qx) / 2} ${Math.max(y, qy) + 6 + q.h * 0.05} ${x} ${y}`;
            }).join(' ') + ` L${POLES[0].x + side * 140 + 260} ${POLES[0].y - POLES[0].h * 0.92 + 40}`} stroke="#FFC88A" strokeWidth="2" fill="none" opacity=".75" />
          ))}
          {/* saguaro lontano in controluce */}
          <g transform="translate(948 1176)">
            <path d="M-16 0 V-150 Q-16 -170 0 -170 Q16 -170 16 -150 V0 Z M16 -80 H40 Q50 -80 50 -90 V-120 Q50 -132 60 -132 Q70 -132 70 -120 V-80 Q70 -60 50 -60 H16 Z M-16 -60 H-34 Q-50 -60 -50 -76 V-104 Q-50 -114 -40 -114 Q-30 -114 -30 -104 V-80 H-16 Z" fill="#3A3424" stroke="#2A1620" strokeWidth="4" />
            <path d="M14 -150 V-4 M68 -122 V-84" stroke={RIM} strokeWidth="3" opacity=".8" />
            <path d="M0 0 L-90 18" stroke={SHADOW} strokeWidth="14" opacity=".35" strokeLinecap="round" />
          </g>
        </g>

        {/* PIANO 3 — la casupola in tre quarti, il mulino, la cisterna (0,6) */}
        <g transform={L(0.6)}>
          {/* ombra lunga della casa verso la camera, a sinistra */}
          <path d="M90 1252 L560 1228 L470 1300 L-40 1350 Z" fill={SHADOW} opacity=".45" />
          {/* mulino a vento dietro la casa */}
          <g transform="translate(500 1040)">
            <path d="M-34 0 L-5 -180 M34 0 L5 -180 M-26 -60 L26 -60 M-16 -120 L16 -120" stroke="#2A1620" strokeWidth="7" />
            <path d="M30 0 L4 -178" stroke={RIM} strokeWidth="2" opacity=".8" />
            <g transform={`translate(0 -190) rotate(${blade % 360})`}>
              {Array.from({ length: 14 }, (_, k) => <path key={k} d="M0 0 L-8 -66 L8 -66 Z" transform={`rotate(${k * (360 / 14)})`} fill="#4A3A3E" stroke="#2A1620" strokeWidth="2.5" />)}
              <circle r="62" fill="none" stroke="#2A1620" strokeWidth="4" />
              <circle r="62" fill="none" stroke={RIM} strokeWidth="1.5" opacity=".6" strokeDasharray="40 60" />
              <circle r="9" fill="#2A1620" />
            </g>
            <path d="M8 -190 L70 -184 L70 -206 Z" fill="#4A2A2E" stroke="#2A1620" strokeWidth="3" />
          </g>
          {/* cisterna sui pali, a sinistra */}
          <g transform="translate(64 1240)">
            <path d="M-34 0 V-190 M34 0 V-190 M-34 -95 L34 -190 M34 -95 L-34 -190" stroke="#3A2226" strokeWidth="7" />
            <rect x="-54" y="-286" width="108" height="96" rx="12" fill="#6A5C60" stroke={K} strokeWidth="7" />
            <path d="M-54 -258 H54 M-54 -220 H54" stroke="#4A3E44" strokeWidth="4" />
            <path d="M52 -280 V-196" stroke={RIM} strokeWidth="4" opacity=".85" />
            <path d="M-20 -190 V-150 Q-20 -140 -10 -140" stroke="#3A2226" strokeWidth="5" fill="none" />
          </g>
          {/* fianco della casa, verso il sole: acceso */}
          <path d="M430 1024 L566 1046 V1230 L430 1252 Z" fill="url(#rn-side)" stroke={K} strokeWidth="9" strokeLinejoin="round" />
          <path d="M470 1070 l18 26 l-6 20 l14 18 M520 1150 l-10 22 l8 16" stroke="#9A5A3A" strokeWidth="3" fill="none" />
          <rect x="478" y="1110" width="44" height="52" fill="#3A1E22" stroke={K} strokeWidth="5" transform="skewY(9)" />
          {/* facciata in ombra, verso la camera */}
          <path d="M84 1018 Q80 1006 94 1004 H426 Q438 1006 432 1024 V1252 H84 Z" fill="url(#rn-front)" stroke={K} strokeWidth="9" strokeLinejoin="round" />
          {/* intonaco caduto con i mattoni sotto, crepe */}
          <path d="M104 1124 Q120 1112 152 1120 Q160 1140 146 1160 Q118 1166 106 1150 Z M352 1052 Q372 1044 408 1052 Q412 1076 396 1086 Q362 1088 352 1072 Z M196 1206 Q214 1198 240 1206 Q242 1228 228 1236 Q204 1238 196 1222 Z" fill="#5A2E2E" />
          {BRICKS.map(([x, y], i) => <rect key={i} x={x} y={y} width="22" height="11" rx="2" fill="#8A4A3A" stroke="#3A1A1E" strokeWidth="2" />)}
          <path d="M280 1030 l-10 30 l12 18 l-8 26 M118 1050 l22 18 l-4 22 M400 1170 l-16 20 l6 24" stroke="#4A2228" strokeWidth="3" fill="none" />
          {/* vigas: travi tonde che sporgono, ognuna con la sua ombra e il filo di luce */}
          {Array.from({ length: 6 }, (_, k) => {
            const x = 112 + k * 60;
            return (
              <g key={k}>
                <path d={`M${x + 4} ${1036} q-14 16 -30 22`} stroke={SHADOW} strokeWidth="9" opacity=".4" strokeLinecap="round" />
                <circle cx={x} cy={1030} r="11" fill="#5A3424" stroke={K} strokeWidth="4" />
                <path d={`M${x + 4} ${1020} a11 11 0 0 1 6 8`} stroke={RIM} strokeWidth="3" fill="none" />
              </g>
            );
          })}
          {/* filo di luce sul bordo del tetto e sullo spigolo verso il sole */}
          <path d="M96 1006 H426 L566 1046" stroke={RIM} strokeWidth="4" fill="none" />
          <path d="M432 1028 V1250" stroke={RIM} strokeWidth="3" opacity=".7" />
          {/* parabola e antenna */}
          <path d="M380 1004 V940 M362 958 H398 M368 976 H392" stroke="#2A1620" strokeWidth="5" />
          <path d="M392 940 V1002" stroke={RIM} strokeWidth="2" />
          <ellipse cx="190" cy="986" rx="32" ry="20" fill="#7A6A70" stroke={K} strokeWidth="5" transform="rotate(-24 190 986)" />
          <path d="M206 970 a32 20 -24 0 1 18 12" stroke={RIM} strokeWidth="3" fill="none" transform="rotate(-24 190 986)" />
          <path d="M190 1006 V1004 L176 1004" stroke="#2A1620" strokeWidth="5" />
          {/* finestra accesa: tenda tirata a metà, la luce cade sul terreno davanti */}
          <path d="M140 1252 H270 L330 1340 H90 Z" fill="url(#rn-spill)" opacity={win} />
          <rect x="142" y="1086" width="122" height="98" fill="#1C1014" stroke={K} strokeWidth="7" />
          <rect x="146" y="1090" width="114" height="90" fill="#FFC870" opacity={win * (0.88 + 0.08 * Math.sin(t * 5))} />
          <path d="M150 1090 Q170 1130 156 1180 H146 V1090 Z M256 1090 Q236 1110 250 1180 H260 V1090 Z" fill="#C85A3A" opacity={0.3 + 0.6 * win} />
          <path d="M203 1088 V1182 M144 1135 H262" stroke={K} strokeWidth="5" />
          <rect x="132" y="1184" width="142" height="12" fill="#5A3424" stroke={K} strokeWidth="4" />
          <Glow id="rn-win" x={203} y={1135} r={210} t={t} color="#FFC870" amp={0.04} rate={4} opacity={0.55 * win} />
          {/* porta con la zanzariera socchiusa */}
          <rect x="300" y="1094" width="86" height="158" fill="#24141A" stroke={K} strokeWidth="7" />
          <path d="M300 1094 L270 1100 V1246 L300 1252 Z" fill="#4A3A40" fillOpacity=".7" stroke={K} strokeWidth="5" />
          <path d="M276 1110 V1236 M284 1108 V1240 M292 1106 V1244" stroke="#6A5A60" strokeWidth="1.5" />
          <circle cx="378" cy="1176" r="5" fill="#C8A060" />
          {/* portico: pali di legno con venature e tettoia di lamiera ondulata */}
          <path d="M262 1090 L452 1080 L456 1100 L258 1112 Z" fill="url(#rn-tin)" stroke={K} strokeWidth="6" strokeLinejoin="round" />
          {Array.from({ length: 9 }, (_, k) => <path key={k} d={`M${272 + k * 21} ${1090 - k * 0.5} L${270 + k * 21} ${1110 - k * 0.6}`} stroke="#4A3A3A" strokeWidth="2.5" />)}
          <path d="M262 1090 L452 1080" stroke={RIM} strokeWidth="3" />
          {[272, 440].map((x) => (
            <g key={x}>
              <rect x={x - 8} y="1104" width="16" height="148" fill="#5A3A2A" stroke={K} strokeWidth="5" />
              <path d={`M${x - 2} 1112 q4 30 0 60 q-4 30 2 70`} stroke="#3A2218" strokeWidth="2" fill="none" />
              <path d={`M${x + 6} 1106 V1250`} stroke={RIM} strokeWidth="2" opacity=".75" />
            </g>
          ))}
          {/* barile e sedia vecchia sotto il portico */}
          <g transform="translate(410 1252)">
            <path d="M-22 0 V-54 Q-22 -60 -16 -60 H16 Q22 -60 22 -54 V0 Z" fill="#6A3A2E" stroke={K} strokeWidth="5" />
            <path d="M-22 -18 H22 M-22 -42 H22" stroke="#3A2222" strokeWidth="3" />
            <path d="M20 -56 V-4" stroke={RIM} strokeWidth="2.5" />
          </g>
          <path d="M100 1252 V1196 H150 V1252 M100 1222 H150 M104 1196 V1150 H146 V1196" stroke="#3A2222" strokeWidth="5" fill="none" />
        </g>

        {/* PIANO 4 — l'auto di Tuco ferma davanti alla casa, la polvere che brilla in controluce (0,7) */}
        <g transform={L(0.7)}>
          {dust > 0 && [0, 1, 2, 3, 4].map((k) => (
            <Glow key={k} id={`rn-dust${k}`} x={carX + 120 + k * 70 + Math.sin(t * 0.7 + k) * 14} y={1206 - k * 16 - (moving ? 0 : seg(t, tStop, tStop + 4) * 30)} r={110 + k * 26} t={t}
              color={k < 2 ? '#FFD8A0' : '#E8A070'} amp={0.06} rate={0.8} ph={k} opacity={0.42 * dust} />
          ))}
          <path d={`M${carX - 150} 1262 L${carX + 150} 1262 L${carX + 40} 1320 L${carX - 300} 1330 Z`} fill={SHADOW} opacity=".5" />
          <Auto id="rn" x={carX} y={1262} s={0.4} t={t} lights={lightsOn} spin={moving ? -t * 900 : 0} flip />
          {/* filo di luce sul tetto e sul cofano dell'auto, dal sole dietro */}
          <path d={`M${carX - 52} ${1262 - 127} H${carX + 36} L${carX + 84} ${1262 - 84} L${carX + 140} ${1262 - 76}`} stroke={RIM} strokeWidth="3.5" fill="none" strokeLinecap="round" />
        </g>

        {/* PIANO 5 — primo piano: ghiaia con ombre lunghe, occhiali che riflettono il tramonto, busta di cristalli, fichi d'India e paletto (1,15) */}
        <g transform={L(1.15)}>
          <path d="M-200 1480 Q300 1440 1280 1500 V2200 H-200 Z" fill="#2E1620" />
          <path d="M-200 1480 Q300 1440 1280 1500" stroke="#7A4036" strokeWidth="6" fill="none" />
          {PEBBLES.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={p.s} fill={i % 3 ? '#6A3A36' : '#9A5E48'} opacity=".8" />)}
          {STONES.map((s, i) => (
            <g key={i}>
              <path d={`M${s.x} ${s.y + s.ry * 0.4} L${s.x - s.rx * 2.6} ${s.y + s.ry * 1.6}`} stroke={SHADOW} strokeWidth={s.ry * 1.4} strokeLinecap="round" opacity=".45" />
              <ellipse cx={s.x} cy={s.y} rx={s.rx} ry={s.ry} fill={i % 3 ? '#5A322E' : '#7A4A3A'} stroke={K} strokeWidth="3" />
              <path d={`M${s.x - s.rx * 0.6} ${s.y - s.ry * 0.7} Q${s.x + s.rx * 0.2} ${s.y - s.ry * 1.1} ${s.x + s.rx * 0.9} ${s.y - s.ry * 0.3}`} stroke={RIM} strokeWidth="2.5" fill="none" opacity=".8" />
            </g>
          ))}
          {/* solchi delle gomme che vanno verso la strada */}
          <path d="M520 1940 Q620 1700 900 1520 M600 1950 Q700 1720 960 1530" stroke="#1E0E16" strokeWidth="10" fill="none" opacity=".55" />
          {/* occhiali da vista di Walter: le lenti riflettono il cielo, una è incrinata */}
          <g transform="translate(330 1668) rotate(-10)">
            <path d="M-120 18 L-340 70 L-300 92 L110 30 Z" fill={SHADOW} opacity=".45" />
            <rect x="-112" y="-36" width="94" height="64" rx="22" fill="url(#rn-lens)" stroke={K} strokeWidth="9" />
            <rect x="18" y="-36" width="94" height="64" rx="22" fill="url(#rn-lens)" stroke={K} strokeWidth="9" />
            <circle cx="-58" cy="6" r="9" fill="#FFF4D2" opacity=".9" />
            <circle cx="72" cy="6" r="9" fill="#FFF4D2" opacity=".9" />
            <path d="M-100 -20 L-80 -4 M30 -22 L44 -10" stroke="#FFFFFF" strokeWidth="5" opacity=".55" strokeLinecap="round" />
            <path d="M36 -30 L54 -10 L48 4 L64 20 M54 -10 L78 -16 L92 0" stroke="#FFFFFF" strokeWidth="3" fill="none" />
            <path d="M-18 -16 Q0 -30 18 -16" stroke={K} strokeWidth="7" fill="none" />
            <path d="M-112 -22 L-176 -44 M112 -22 L176 -36" stroke={K} strokeWidth="7" strokeLinecap="round" />
            <path d="M-110 -34 Q-66 -44 -24 -34 M20 -34 Q64 -44 108 -34" stroke={RIM} strokeWidth="3" fill="none" />
          </g>
          {/* bustina strappata: l'oro solo sui cristalli che escono sulla ghiaia */}
          <g transform="translate(780 1716) rotate(-8)">
            <path d="M-110 10 L-330 60 L-280 82 L120 20 Z" fill={SHADOW} opacity=".45" />
            <path d="M-120 4 L-110 -150 Q-108 -164 -94 -164 H86 Q100 -164 102 -150 L114 -20 L80 -6 L96 10 Z" fill="#E8F2F4" fillOpacity=".3" stroke={K} strokeWidth="6" strokeLinejoin="round" />
            <path d="M-110 -136 H100" stroke="#C83A2A" strokeWidth="8" />
            <path d="M-110 -150 H100" stroke={K} strokeWidth="3" />
            <path d="M-108 -160 H96 L104 -40" stroke={RIM} strokeWidth="3" fill="none" />
            <path d="M-96 -120 L-80 -30" stroke="#FFFFFF" strokeWidth="6" opacity=".5" />
            <Cristalli id="rn" x={-10} y={-10} t={t} s={0.75} n={14} seed={4} glint={0.4 + 0.6 * seg(t, tIn, tIn + 0.6)} />
            <Cristalli id="rn" x={150} y={14} t={t} s={0.45} n={7} seed={8} glint={0.6} />
          </g>
          {/* paletto con il filo spinato che incornicia a destra */}
          <path d="M1012 1990 V1430" stroke="#2A1418" strokeWidth="22" />
          <path d="M1004 1430 V1990" stroke={RIM} strokeWidth="4" opacity=".6" />
          {Array.from({ length: 6 }, (_, k) => <path key={k} d={`M1004 ${1460 + k * 80} q8 4 0 10`} stroke="#4A2A2A" strokeWidth="2" fill="none" />)}
          <path d="M1290 1500 Q1150 1484 1012 1488 Q880 1494 740 1530" stroke="#1E1418" strokeWidth="4" fill="none" />
          <path d="M1290 1497 Q1150 1481 1012 1485" stroke={RIM} strokeWidth="1.5" fill="none" opacity=".7" />
          {[790, 860, 930, 1080, 1170].map((x) => <path key={x} d={`M${x - 8} ${1510 - (x > 1012 ? 18 : 0) - (x - 790) * 0.06} l16 -10 m-16 0 l16 10`} stroke="#1E1418" strokeWidth="3" />)}
          {/* fichi d'India che escono dal bordo sinistro: pale con spine e filo di luce */}
          <g transform="translate(40 1940)">
            {[
              { x: 0, y: -80, rx: 110, ry: 150, rot: -10 },
              { x: 120, y: -230, rx: 80, ry: 110, rot: 25 },
              { x: -40, y: -300, rx: 70, ry: 100, rot: -30 },
              { x: 60, y: -380, rx: 52, ry: 72, rot: 10 },
            ].map((p, i) => (
              <g key={i} transform={`translate(${p.x} ${p.y}) rotate(${p.rot})`}>
                <ellipse rx={p.rx} ry={p.ry} fill="url(#rn-pad)" stroke={K} strokeWidth="8" />
                <path d={`M${p.rx * 0.2} ${-p.ry * 0.95} A${p.rx} ${p.ry} 0 0 1 ${p.rx * 0.98} ${p.ry * 0.1}`} stroke={RIM} strokeWidth="4" fill="none" />
                {Array.from({ length: 7 }, (_, k) => {
                  const a = k * 0.9 + i, d = 0.55;
                  const sx = Math.cos(a) * p.rx * d, sy = Math.sin(a) * p.ry * d;
                  return <g key={k}><circle cx={sx} cy={sy} r="4" fill="#2A3A22" /><path d={`M${sx} ${sy} l8 -10 M${sx} ${sy} l-9 -7`} stroke="#F2E4C4" strokeWidth="2" /></g>;
                })}
              </g>
            ))}
            <g transform="translate(70 -462)">
              <path d="M-12 8 Q-18 -16 0 -26 Q18 -16 12 8 Z" fill="#D8405A" stroke={K} strokeWidth="5" />
              <path d="M2 -22 Q12 -14 10 4" stroke="#FFB0B8" strokeWidth="3" fill="none" />
            </g>
          </g>
        </g>

        {/* PIANO 6 — polvere vicina che brilla nel controluce (1,6) */}
        <g transform={L(1.6)}>
          {Array.from({ length: 22 }, (_, i) => {
            const x = mod(i * 97 - t * (40 + i * 3), 1480) - 200;
            const y = 880 + ((i * 131) % 520);
            const near = Math.max(0, 1 - Math.abs(x - VP.x) / 600);
            return <circle key={i} cx={x} cy={y} r={2 + (i % 3)} fill="#FFE2B0" opacity={0.25 + 0.6 * near} />;
          })}
          <NearMotes id="rn-near" t={t} color="#FFC890" n={6} r0={70} r1={160} opacity={0.12} vx={-30} y0={900} y1={1800} />
        </g>
      </g>
      <Finish id="rn" tint="#8A3A2A" tintOpacity={0.1} />
    </svg>
  );
};
