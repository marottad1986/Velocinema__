import React from 'react';
import { camera, eo, lerp, rng, seg } from '../../lib/anim';
import { Dust, Glow, NearMotes } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { HAND } from '../../lib/fonts';
import type { SceneProps } from '../../types';
import { BBDefs, K, Ombra, ORO } from './Comuni';

// Il prigioniero in cantina: la cantina della casa di Jesse, una sola lampadina che oscilla. Il prigioniero (Krazy-8)
// non si vede mai: restano il tubo, il lucchetto da bici e la catena. Eventi: prima frase la lampadina si accende
// oscillando e illumina il lucchetto chiuso sul tubo; seconda frase la chiave del lucchetto si avvicina (Walter sta per
// liberarlo), poi a terra i cocci del piatto si accendono e compare il contorno del pezzo che manca; terza frase sul
// quaderno con le due colonne la parola «UCCIDERLO» si sottolinea di rosso, la catena si tende e ricade, la luce trema.
// Piani: muro di blocchi (0,25) · scaffali, caldaia, travi (0,45) · tubo con lucchetto e catena (0,65)
//        · cassa con quaderno, piatto rotto, panino e bottiglia (0,85) · scala e scatoloni in primo piano (1,2) · polvere (1,5–1,8)

const r = rng(7707);
const CANS = Array.from({ length: 7 }, (_, i) => ({ x: 560 + i * 72 + r() * 10, h: 50 + r() * 40, c: ['#8A3A2A', '#3A5A6A', '#C8A040', '#5A6A3A'][i % 4] }));

export const Cantina: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const on = eo(seg(t, griglia(cues[0] + 0.1), griglia(cues[0] + 0.1) + 0.3));
  const swing = Math.sin(t * 1.6) * 10 * (0.5 + 0.5 * on);
  const key = eo(seg(t, griglia(cues[1] + 0.1), griglia(cues[1] + 0.1) + 1.0));
  const shard = eo(seg(t, griglia(cues[1] + 1.4), griglia(cues[1] + 1.4) + 0.6));
  const kill = seg(t, griglia(cues[2] + 0.1), griglia(cues[2] + 0.1) + 0.8);
  const tTaut = griglia(cues[2] + 0.6);
  const taut = seg(t, tTaut, tTaut + 0.2) * (1 - seg(t, tTaut + 0.5, tTaut + 0.9));
  const flick = t > tTaut && t < tTaut + 0.6 ? (Math.sin(t * 40) > 0.3 ? 0.35 : 1) : 1;
  const dim = 1 - 0.45 * eo(seg(t, tTaut + 0.6, dur));
  const light = (0.25 + 0.75 * on) * flick * dim;
  const bx = 640 + swing * 3.2, by = 760;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="cn" />
        <BBDefs id="cn" />
        <Lin id="cn-wall" stops={[[0, '#14140F'], [0.4, '#2E2C22'], [0.7, '#3A3628'], [1, '#1A1812']]} />
        <Lin id="cn-floor" stops={[[0, '#3A362A'], [0.5, '#22201A'], [1, '#0E0E0A']]} />
        <Lin id="cn-pipe" x2={1} y2={0} stops={[[0, '#4A5054'], [0.35, '#B8C0C2'], [0.6, '#7A8286'], [1, '#2E3236']]} />
        <Lin id="cn-crate" x2={1} y2={0} stops={[[0, '#8A6438'], [0.5, '#A87C48'], [1, '#5A3E22']]} />
        <radialGradient id="cn-pool"><stop offset="0" stopColor="#FFD890" stopOpacity=".5" /><stop offset="1" stopColor="#FFD890" stopOpacity="0" /></radialGradient>
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — muro di blocchi di cemento (0,25) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#cn-wall)" />
          {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M-200 ${680 + i * 56} H1280`} stroke="#0A0A06" strokeWidth="3" opacity=".4" />)}
          {Array.from({ length: 12 }, (_, i) => Array.from({ length: 8 }, (_, k) => (
            <path key={`${i}-${k}`} d={`M${-160 + k * 190 + (i % 2) * 95} ${680 + i * 56} v56`} stroke="#0A0A06" strokeWidth="3" opacity=".35" />
          )))}
          <path d="M120 760 Q140 840 110 900 Q90 960 120 1040" stroke="#0A0A06" strokeWidth="4" fill="none" opacity=".5" />
          <Glow id="cn-wallg" x={bx} y={900} r={620} t={t} color="#FFC878" amp={0} opacity={0.45 * light} />
          {/* finestrella a bocca di lupo con la notte */}
          <rect x="140" y="700" width="180" height="70" fill="#141E2A" stroke={K} strokeWidth="6" />
          <path d="M230 700 V770" stroke={K} strokeWidth="4" />
        </g>

        {/* PIANO 1 — travi del soffitto, scaffale con barattoli di vernice, caldaia (0,45) */}
        <g transform={L(0.45)}>
          <rect x="-200" y="560" width="1480" height="110" fill="#1A140C" />
          {Array.from({ length: 7 }, (_, i) => (
            <g key={i}>
              <rect x={-160 + i * 210} y="560" width="60" height="120" fill="#4A3420" stroke={K} strokeWidth="5" />
              <path d={`M${-154 + i * 210} 566 V676`} stroke="#8A6438" strokeWidth="4" opacity=".5" />
            </g>
          ))}
          {/* scaffale */}
          <rect x="540" y="1040" width="520" height="16" fill="#5A4028" stroke={K} strokeWidth="5" />
          <rect x="540" y="900" width="520" height="16" fill="#5A4028" stroke={K} strokeWidth="5" />
          {CANS.map((c, i) => (
            <g key={i}>
              <rect x={c.x} y={1040 - c.h} width="54" height={c.h} fill={c.c} stroke={K} strokeWidth="4" />
              <rect x={c.x} y={1040 - c.h} width="54" height="10" fill="#9AA0A4" stroke={K} strokeWidth="3" />
            </g>
          ))}
          <rect x="580" y="830" width="120" height="70" fill="#A88A5A" stroke={K} strokeWidth="4" />
          <rect x="760" y="850" width="90" height="50" fill="#6A7A5A" stroke={K} strokeWidth="4" />
          {/* caldaia */}
          <g transform="translate(100 1200)">
            <path d="M-80 0 V-360 Q-80 -390 0 -390 Q80 -390 80 -360 V0 Z" fill="#7A7E78" stroke={K} strokeWidth="7" />
            <path d="M-60 -370 V-20" stroke="#B8BEB6" strokeWidth="6" opacity=".5" />
            <rect x="-30" y="-120" width="60" height="40" fill="#2A2A26" stroke={K} strokeWidth="4" />
            <circle cx="0" cy="-100" r="6" fill="#E8722A" opacity={0.6 + 0.4 * Math.sin(t * 3)} />
            <path d="M0 -390 V-480" stroke="url(#cn-pipe)" strokeWidth="26" />
          </g>
        </g>

        {/* PIANO 2 — il tubo con il lucchetto da bici e la catena (0,65) */}
        <g transform={L(0.65)}>
          <path d="M-200 1210 H1280 V2200 H-200 Z" fill="url(#cn-floor)" />
          <ellipse cx={bx * 0.9 + 40} cy="1260" rx="480" ry="110" fill="url(#cn-pool)" opacity={light} />
          {/* tubo verticale */}
          <rect x="350" y="600" width="44" height="620" fill="url(#cn-pipe)" stroke={K} strokeWidth="7" />
          {[720, 1120].map((y) => <rect key={y} x="340" y={y} width="64" height="26" rx="4" fill="url(#cn-pipe)" stroke={K} strokeWidth="5" />)}
          <path d="M394 760 H560" stroke="url(#cn-pipe)" strokeWidth="30" />
          <path d="M394 760 H560" stroke={K} strokeWidth="4" opacity=".5" />
          <Ombra id="cn" x={372} y={1216} rx={80} ry={10} />
          {/* lucchetto a U attorno al tubo */}
          <g transform="translate(372 960)">
            <path d="M-50 0 V-60 A50 50 0 0 1 50 -60 V0" stroke="url(#cn-metal)" strokeWidth="18" fill="none" />
            <path d="M-50 0 V-60 A50 50 0 0 1 50 -60 V0" stroke={K} strokeWidth="4" fill="none" opacity=".6" />
            <rect x="-70" y="-4" width="140" height="40" rx="10" fill="#1E1E1E" stroke={K} strokeWidth="6" />
            <circle cx="40" cy="16" r="8" fill="#5A5E60" stroke={K} strokeWidth="3" />
            <Glow id="cn-lock" x={0} y={0} r={110} t={t} color="#FFE0A0" amp={0.05} rate={3} opacity={0.4 * light} />
          </g>
          {/* catena che scende a terra (si tende e ricade) */}
          <path d={`M372 990 Q${lerp(380, 520, taut)} ${lerp(1180, 1060, taut)} ${lerp(470, 640, taut)} ${lerp(1200, 1120, taut)} L${lerp(620, 700, taut)} ${lerp(1206, 1150, taut)}`} stroke="#8A8E90" strokeWidth="12" fill="none" strokeDasharray="16 6" />
          <path d={`M372 990 Q${lerp(380, 520, taut)} ${lerp(1180, 1060, taut)} ${lerp(470, 640, taut)} ${lerp(1200, 1120, taut)} L${lerp(620, 700, taut)} ${lerp(1206, 1150, taut)}`} stroke={K} strokeWidth="3" fill="none" opacity=".6" />
          {/* chiave del lucchetto che si avvicina */}
          <g transform={`translate(${lerp(500, 430, key)} ${lerp(1080, 990, key)}) rotate(${lerp(30, 0, key)})`} opacity={key}>
            <circle cx="30" cy="0" r="16" fill="none" stroke="url(#cn-metal)" strokeWidth="8" />
            <path d="M14 0 H-30 V10 H-22 V4 H-14 V10 H-8 V0" fill="url(#cn-metal)" stroke={K} strokeWidth="3" />
          </g>
        </g>

        {/* PIANO 3 — lampadina che oscilla (0,7) */}
        <g transform={L(0.7)}>
          <path d={`M640 640 L${bx} ${by - 40}`} stroke="#1A1A1A" strokeWidth="5" />
          <rect x={bx - 14} y={by - 44} width="28" height="26" fill="url(#cn-metal)" stroke={K} strokeWidth="4" />
          <Glow id="cn-bulb" x={bx} y={by} r={360} t={t} color="#FFD890" amp={0.04} rate={11} opacity={0.75 * light} />
          <circle cx={bx} cy={by} r="24" fill={light > 0.4 ? '#FFF6D8' : '#8A8270'} stroke={K} strokeWidth="4" />
        </g>

        {/* PIANO 4 — cassa con il quaderno, piatto rotto con il pezzo mancante, panino, bottiglia (0,85) */}
        <g transform={L(0.85)}>
          {/* cassa con il quaderno delle due colonne */}
          <g transform="translate(660 1240)">
            <Ombra id="cn" x={0} y={0} rx={200} ry={20} />
            <rect x="-170" y="-170" width="340" height="170" fill="url(#cn-crate)" stroke={K} strokeWidth="8" />
            {[-120, -60].map((y) => <path key={y} d={`M-166 ${y} H166`} stroke="#4A3018" strokeWidth="4" />)}
            <g transform="translate(-10 -170) skewX(-14)">
              <rect x="-130" y="-120" width="270" height="116" fill="url(#cn-paper)" stroke={K} strokeWidth="5" />
              <path d="M5 -116 V-8" stroke="#8A8A9A" strokeWidth="3" />
              {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M-124 ${-88 + i * 18} H134`} stroke="#AFC4E0" strokeWidth="2" />)}
              <text x="-122" y="-96" fontFamily={HAND} fontSize="27" fill="#1E2A5A">LIBERARLO</text>
              <text x="10" y="-96" fontFamily={HAND} fontSize="27" fill="#1E2A5A">UCCIDERLO</text>
              {[0, 1, 2, 3].map((i) => <path key={i} d={`M-116 ${-74 + i * 18} h${70 + (i % 2) * 30}`} stroke="#3A4A7A" strokeWidth="3" />)}
              <path d="M20 -74 h90" stroke="#3A4A7A" strokeWidth="3" />
              <path d="M14 -90 h110" stroke="#D8322A" strokeWidth="5" strokeDasharray="110" strokeDashoffset={110 * (1 - kill)} />
            </g>
            {/* bottiglia di birra */}
            <g transform="translate(195 0)">
              <path d="M-14 0 V-60 Q-14 -76 -6 -84 V-110 H6 V-84 Q14 -76 14 -60 V0 Z" fill="#6A4A1E" stroke={K} strokeWidth="5" />
              <path d="M-8 -64 V-10" stroke="#E8C080" strokeWidth="4" opacity=".6" />
            </g>
          </g>
          {/* piatto rotto a terra con il pezzo che manca */}
          <g transform="translate(600 1250) scale(1.35)">
            <Ombra id="cn" x={0} y={6} rx={170} ry={18} />
            <Glow id="cn-sh" x={0} y={-10} r={180} t={t} color={ORO} amp={0.08} rate={4} opacity={0.5 * shard} />
            <path d="M-120 -6 A120 34 0 0 1 -10 -40 L10 -6 Z" fill="#F2EEE4" stroke={K} strokeWidth="5" />
            <path d="M10 -6 L-10 -40 A120 34 0 0 1 110 -20 Z" fill="#E8E2D4" stroke={K} strokeWidth="5" transform="translate(16 4)" />
            <path d="M-130 4 A120 34 0 0 0 30 26 L10 -2 Z" fill="#DDD6C6" stroke={K} strokeWidth="5" transform="translate(-6 6)" />
            <path d="M-96 -12 A90 22 0 0 1 -14 -34" stroke="#3F7A55" strokeWidth="4" fill="none" />
            {/* contorno del pezzo che manca */}
            <path d="M44 22 L120 -10 A120 34 0 0 1 60 30 Z" fill="none" stroke={ORO} strokeWidth="5" strokeDasharray="10 8" opacity={shard} />
            {/* panino e mollica */}
            <g transform="translate(-170 4)">
              <path d="M-50 0 Q-50 -36 0 -40 Q50 -36 50 0 Z" fill="#D8A860" stroke={K} strokeWidth="5" />
              <path d="M-48 -6 H48" stroke="#7AA048" strokeWidth="6" />
            </g>
          </g>
        </g>

        {/* PIANO 5 — scala di legno e scatoloni che incorniciano (1,2) */}
        <g transform={L(1.2)}>
          <g>
            <path d="M-200 900 L240 1960 H60 L-200 1340 Z" fill="#3A2A18" stroke={K} strokeWidth="10" />
            {Array.from({ length: 6 }, (_, i) => (
              <g key={i}>
                <path d={`M${-200 + i * 70} ${1000 + i * 160} H${-40 + i * 70}`} stroke="#6A4C2C" strokeWidth="26" />
                <path d={`M${-200 + i * 70} ${990 + i * 160} H${-40 + i * 70}`} stroke="#A07848" strokeWidth="4" opacity=".7" />
              </g>
            ))}
          </g>
          <g transform="translate(960 1940)">
            <rect x="-180" y="-260" width="360" height="260" fill="#8A6A40" stroke={K} strokeWidth="10" />
            <path d="M-180 -220 H180" stroke="#5A4228" strokeWidth="6" />
            <rect x="-60" y="-190" width="120" height="50" fill="#D8CCA8" stroke={K} strokeWidth="4" />
          </g>
        </g>

        {/* PIANO 6 — polvere nella luce della lampadina (1,5–1,8) */}
        <g transform={L(1.5)} opacity={light}>
          <Dust t={t} top={{ y: by + 20, x0: bx - 30, x1: bx + 30 }} bottom={{ y: 1300, x0: bx - 380, x1: bx + 300 }} n={30} color="#FFE8B8" seed={17} />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="cn-near" t={t} color="#E8D8B0" n={6} r0={60} r1={150} opacity={0.1} />
        </g>
      </g>
      <rect width="1080" height="1920" fill="#000" opacity={0.35 * (1 - light)} />
      <Finish id="cn" tint="#2A2414" tintOpacity={0.12} />
    </svg>
  );
};
