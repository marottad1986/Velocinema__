import React from 'react';
import { camera, eo, lerp, mod, rng, seg } from '../../lib/anim';
import { Beam, Dust, Glow, NearMotes, Smoke } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { BBDefs, Cristalli } from '../breaking-bad-stagione-1/Comuni';
import { BB2Defs, K, ORO, Ombra } from './Comuni';

// Il ladro e il bancomat: il soggiorno sporco della casa dei due tossici. Persone mai: gli spacciatori sono tre telefoni
// che si accendono sul tavolino accanto alle bustine, Jesse è la porta che si spalanca, la coppia è il bancomat rubato
// in piedi contro il muro. Eventi: prima frase sul tavolino si accendono uno dopo l'altro tre telefoni (i tre amici) accanto
// alle bustine di cristalli; seconda frase la porta a destra si spalanca e la luce del giorno entra nella stanza; terza
// frase il bancomat si inclina e crolla a terra dietro il divano con un nuvolone di polvere e lo schermo che si spegne.
// Piani: parete con carta strappata e finestra con le tapparelle (0,25) · bancomat, televisore e porta (0,5)
//        · tavolino con bustine e telefoni (0,72) · divano sfondato in primo piano (1,2) · polvere vicina (1,6)

const r = rng(2205);
const STAINS = Array.from({ length: 10 }, () => ({ x: r() * 1100, y: 640 + r() * 480, rx: 30 + r() * 70, ry: 20 + r() * 40 }));
const LITTER = Array.from({ length: 14 }, () => ({ x: r() * 1300 - 100, y: 1230 + r() * 240, a: r() * 180, k: Math.floor(r() * 3) }));

export const Bancomat: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const B = 60 / 96;
  const tPhones = griglia(cues[0] + 1.0);
  const tDoor = griglia(cues[1] + 1.2);
  const tFall = griglia(cues[2] + 1.5);
  const door = eo(seg(t, tDoor, tDoor + 0.35));
  const wobble = t > tFall - 1.2 && t < tFall - 0.4 ? Math.sin(t * 30) * 2 * seg(t, tFall - 1.2, tFall - 0.6) : 0;
  const fall = seg(t, tFall - 0.4, tFall);
  const ang = wobble - 86 * fall * fall;
  const fallen = t >= tFall;
  const screen = fallen ? 0 : 1;
  const phone = (k: number) => seg(t, tPhones + k * B, tPhones + k * B + 0.15);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="bm" />
        <BBDefs id="bm" />
        <BB2Defs id="bm" />
        <Lin id="bm-wall" stops={[[0, '#1E2418'], [0.4, '#4A5434'], [0.75, '#6A7048'], [1, '#3A3A24']]} />
        <Lin id="bm-floor" stops={[[0, '#5A4A34'], [0.5, '#3A2E1E'], [1, '#14100A']]} />
        <Lin id="bm-atm" x2={1} y2={0} stops={[[0, '#9AA4AC'], [0.4, '#C8D0D6'], [1, '#5A646C']]} />
        <Lin id="bm-blue" stops={[[0, '#2A5A9A'], [1, '#14305A']]} />
        <Lin id="bm-couch" stops={[[0, '#7A5A6A'], [0.5, '#5A3E4E'], [1, '#2A1A22']]} />
        <Lin id="bm-day" stops={[[0, '#FFF2D0'], [1, '#F2C880']]} />
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — parete sporca con carta strappata, finestra con le tapparelle rotte, lampadina nuda (0,25) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="1500" fill="url(#bm-wall)" />
          {STAINS.map((s, i) => <ellipse key={i} cx={s.x} cy={s.y} rx={s.rx} ry={s.ry} fill="#2A2A1A" opacity=".25" />)}
          <path d="M120 760 L180 720 L230 780 L200 860 L130 840 Z" fill="#8A8A5A" opacity=".5" />
          <g transform="translate(250 640)">
            <rect x="-110" y="0" width="220" height="200" fill="#C8D8E0" stroke={K} strokeWidth="8" />
            {Array.from({ length: 11 }, (_, k) => <path key={k} d={`M-104 ${10 + k * 17} L${104 - (k === 4 || k === 7 ? 80 : 0)} ${10 + k * 17 + (k === 7 ? 18 : 0)}`} stroke="#8A8270" strokeWidth="10" />)}
            <Glow id="bm-win" x={0} y={100} r={220} t={t} color="#FFF2D0" amp={0.02} rate={0.5} opacity={0.35} />
          </g>
          {/* lampadina nuda che oscilla */}
          <g transform={`rotate(${Math.sin(t * 1.4) * 3} 880 -100)`}>
            <path d="M880 -100 V700" stroke="#1A1A14" strokeWidth="4" />
            <rect x="868" y="690" width="24" height="20" fill="#5A5A4A" />
            <ellipse cx="880" cy="736" rx="24" ry="30" fill="#FFF2B0" stroke={K} strokeWidth="4" />
            <Glow id="bm-bulb" x={880} y={736} r={360} t={t} color="#FFE8A0" amp={0.06} rate={6} opacity={0.6} />
          </g>
          <path d="M-200 1160 H1280" stroke="#1A1A10" strokeWidth="22" />
        </g>

        {/* PIANO 1 — il bancomat rubato, il televisore sui cartoni, la porta che si spalanca (0,5) */}
        <g transform={L(0.5)}>
          <rect x="-200" y="1160" width="1480" height="900" fill="url(#bm-floor)" />
          {/* porta a destra e luce del giorno */}
          <g transform="translate(1010 1170)">
            <rect x="-120" y="-460" width="200" height="460" fill="url(#bm-day)" opacity={door} />
            <rect x="-120" y="-460" width="200" height="460" fill="none" stroke={K} strokeWidth="10" />
            <g transform={`translate(-120 0) scale(${1 - door * 0.75} 1) translate(120 0)`}>
              <rect x="-120" y="-460" width="200" height="460" fill="#6A4A30" stroke={K} strokeWidth="8" />
              <rect x="-96" y="-430" width="150" height="160" fill="#5A3E28" stroke={K} strokeWidth="4" />
              <rect x="-96" y="-240" width="150" height="200" fill="#5A3E28" stroke={K} strokeWidth="4" />
              <circle cx="56" cy="-230" r="10" fill="#C8A060" stroke={K} strokeWidth="3" />
            </g>
          </g>
          {door > 0 && <Beam id="bm-sun" x={950} y={830} angle={150} length={900} spread={420} t={t} color="#FFE8B0" opacity={0.3 * door} />}
          {/* televisore sui cartoni */}
          <g transform="translate(740 1180)">
            <rect x="-120" y="-110" width="240" height="110" fill="#B89060" stroke={K} strokeWidth="6" />
            <path d="M-120 -60 H120 M-30 -110 V0" stroke="#8A6A40" strokeWidth="4" />
            <rect x="-120" y="-330" width="240" height="220" rx="18" fill="#2A2A2A" stroke={K} strokeWidth="8" />
            <rect x="-100" y="-312" width="200" height="164" rx="22" fill="#5AC8E8" stroke={K} strokeWidth="5" />
            {/* cartone animato: un sole che salta su colline */}
            <path d="M-96 -190 Q-40 -240 10 -190 Q60 -230 96 -196 V-152 H-96 Z" fill="#6AD06A" />
            <circle cx={-40 + Math.sin(t * 4) * 50} cy={-250 + Math.abs(Math.sin(t * 6)) * -24} r="20" fill="#FFE04A" stroke={K} strokeWidth="3" />
            <Glow id="bm-tv" x={0} y={-230} r={260} t={t} color="#7AD8F0" amp={0.1} rate={8} opacity={0.35} />
          </g>
          {/* il bancomat: si inclina e crolla a terra (perno sullo spigolo davanti in basso) */}
          <g transform={`translate(330 1200) rotate(${ang}) scale(0.8) translate(150 0)`}>
            {!fallen && <Ombra id="bm" x={0} y={4} rx={180} ry={20} />}
            <rect x="-150" y="-600" width="300" height="600" rx="16" fill="url(#bm-atm)" stroke={K} strokeWidth="10" />
            <rect x="-150" y="-600" width="300" height="80" rx="16" fill="url(#bm-blue)" stroke={K} strokeWidth="8" />
            <text x="0" y="-548" textAnchor="middle" fontFamily="sans-serif" fontWeight="900" fontSize="34" fill="#FFFFFF" letterSpacing="3">BANCOMAT</text>
            <rect x="-110" y="-490" width="220" height="150" rx="10" fill="#14202A" stroke={K} strokeWidth="7" />
            <rect x="-96" y="-476" width="192" height="122" rx="6" fill="#3AA0D8" opacity={screen * (0.8 + 0.15 * Math.sin(t * 5))} />
            {screen > 0 && <text x="0" y="-408" textAnchor="middle" fontFamily="sans-serif" fontWeight="800" fontSize="19" fill="#FFFFFF">INSERISCI LA CARTA</text>}
            <path d="M-90 -470 L-20 -360" stroke="#FFFFFF" strokeWidth="5" opacity=".3" />
            {/* tastiera */}
            {Array.from({ length: 12 }, (_, k) => <rect key={k} x={-80 + (k % 3) * 44} y={-310 + Math.floor(k / 3) * 34} width="36" height="26" rx="4" fill="#E8ECEE" stroke={K} strokeWidth="3" />)}
            <rect x="60" y="-310" width="40" height="26" rx="4" fill="#3AA05A" stroke={K} strokeWidth="3" />
            <rect x="60" y="-276" width="40" height="26" rx="4" fill="#E8C83A" stroke={K} strokeWidth="3" />
            <rect x="60" y="-242" width="40" height="26" rx="4" fill="#D83A2A" stroke={K} strokeWidth="3" />
            {/* fessure carta e banconote, ammaccature e segni del piede di porco */}
            <rect x="-90" y="-150" width="180" height="20" rx="6" fill="#1A1A1A" stroke={K} strokeWidth="4" />
            <rect x="-60" y="-110" width="120" height="14" rx="6" fill="#1A1A1A" />
            <path d="M110 -200 L130 -160 L104 -120 M-130 -80 l30 20" stroke="#3A4248" strokeWidth="6" fill="none" />
            <path d="M-150 -40 H150" stroke="#3A4248" strokeWidth="6" />
            <path d="M-136 -580 V-30" stroke="#FFFFFF" strokeWidth="6" opacity=".35" />
          </g>
          {fallen && <Smoke id="bm-dust" t={t - tFall} x={180} y={1220} color="#C8B898" n={8} rise={220} wind={60} r0={60} r1={200} speed={0.7} opacity={0.85 * (1 - seg(t, tFall + 0.4, tFall + 2.4))} />}
          {LITTER.map((l, i) => (
            l.k === 0 ? <rect key={i} x={l.x} y={l.y} width="40" height="28" fill="#E8E2D0" stroke={K} strokeWidth="3" transform={`rotate(${l.a} ${l.x} ${l.y})`} opacity=".8" />
              : l.k === 1 ? <circle key={i} cx={l.x} cy={l.y} r="14" fill="#C83A2A" stroke={K} strokeWidth="3" />
                : <rect key={i} x={l.x} y={l.y} width="18" height="44" rx="6" fill="#5A8A4A" stroke={K} strokeWidth="3" transform={`rotate(${l.a} ${l.x} ${l.y})`} />
          ))}
        </g>

        {/* PIANO 2 — tavolino con le bustine di cristalli e i tre telefoni dei tre amici (0,72) */}
        <g transform={L(0.72)}>
          <g transform="translate(560 1330)">
            <Ombra id="bm" x={0} y={6} rx={330} ry={26} />
            <rect x="-300" y="-70" width="600" height="40" rx="6" fill="#8A6A44" stroke={K} strokeWidth="8" />
            <path d="M-270 -30 V0 M270 -30 V0" stroke="#5A3E24" strokeWidth="16" />
            <path d="M-280 -60 H280" stroke="#B88A58" strokeWidth="5" />
            {/* bustine */}
            {[-200, -120].map((bx, i) => (
              <g key={i} transform={`translate(${bx} -70) rotate(${i ? 10 : -6})`}>
                <path d="M-44 0 V-70 H44 V0 Z" fill="#E8F2F4" fillOpacity=".5" stroke={K} strokeWidth="5" />
                <path d="M-44 -60 H44" stroke="#C83A2A" strokeWidth="5" />
                <Cristalli id="bm" x={0} y={-4} t={t} s={0.42} n={9} seed={3 + i} glint={0.6} />
              </g>
            ))}
            {/* tre telefoni a conchiglia che si accendono */}
            {[0, 1, 2].map((k) => (
              <g key={k} transform={`translate(${20 + k * 90} -76) rotate(${-10 + k * 8})`}>
                <rect x="-26" y="-60" width="52" height="64" rx="8" fill="#2A2E34" stroke={K} strokeWidth="5" />
                <rect x="-18" y="-52" width="36" height="34" rx="4" fill={phone(k) > 0 ? '#9AF0C0' : '#1A2420'} />
                {phone(k) > 0 && <Glow id={`bm-ph${k}`} x={0} y={-36} r={90} t={t} color={ORO} amp={0.15} rate={9} opacity={0.6 * phone(k)} />}
                {Array.from({ length: 6 }, (_, j) => <circle key={j} cx={-12 + (j % 3) * 12} cy={-8 + Math.floor(j / 3) * 8} r="3" fill="#8A8E94" />)}
              </g>
            ))}
            {/* posacenere e cartone della pizza */}
            <ellipse cx="250" cy="-80" rx="40" ry="12" fill="#5A5A5A" stroke={K} strokeWidth="4" />
            <path d="M230 -86 l30 -6" stroke="#E8E2D0" strokeWidth="5" />
          </g>
        </g>

        {/* PIANO 3 — il divano sfondato in primo piano (1,2) */}
        <g transform={L(1.2)}>
          <path d="M-200 1560 Q-180 1500 -100 1500 H900 Q1000 1500 1020 1580 L1040 2100 H-200 Z" fill="url(#bm-couch)" stroke={K} strokeWidth="10" />
          <path d="M-100 1520 Q400 1490 900 1520" stroke="#9A7A8A" strokeWidth="8" fill="none" />
          <path d="M380 1520 V2000" stroke="#2A1A22" strokeWidth="6" />
          {/* strappo con l'imbottitura e una molla */}
          <path d="M120 1620 Q180 1590 240 1630 Q220 1680 150 1670 Z" fill="#F2E8D0" stroke={K} strokeWidth="5" />
          <path d="M180 1640 q10 -14 20 0 q10 14 20 0 q10 -14 20 0" stroke="#8A8E94" strokeWidth="5" fill="none" />
          <path d="M1020 1580 Q1120 1540 1200 1600 V2100 H1040 Z" fill="#4A3240" stroke={K} strokeWidth="10" />
          <path d="M600 1700 q40 -20 90 0" stroke="#3A2230" strokeWidth="6" fill="none" />
        </g>

        {/* PIANO 4 — polvere nel fascio e particelle vicine (1,6) */}
        <g transform={L(1.6)}>
          <Dust t={t} top={{ y: 720, x0: 820, x1: 940 }} bottom={{ y: 1300, x0: 500, x1: 1000 }} seed={25} n={22} color="#FFF0C8" boost={door} />
          <NearMotes id="bm-near" t={t} color="#F2E0B0" n={6} r0={70} r1={150} opacity={0.12} />
          {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={mod(i * 151 + t * 20, 1080)} cy={mod(i * 211 - t * 30, 900) + 700} r="3" fill="#E8E0C0" opacity=".4" />)}
        </g>
      </g>
      <Finish id="bm" tint="#4A3A1E" tintOpacity={0.12} />
    </svg>
  );
};
