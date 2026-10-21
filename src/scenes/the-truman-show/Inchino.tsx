import React from 'react';
import { camera, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Dust, Glow, NearMotes, Neon, Wisps } from '../../lib/elements';
import type { SceneProps } from '../../types';

// L'inchino: in un bar della città, i televisori trasmettono la porta nel cielo dipinto, aperta sul buio,
// con l'ultimo gradino vuoto; poi passano uno dopo l'altro alla neve. Tazze fumanti sul bancone.
// Piani: parete del bar (0,25) · insegna e lampada (0,4) · televisori (0,6) · bancone con tazze (0,8)
//        · bordo del bancone (1,0) · sgabelli in primo piano (1,25) · pulviscolo vicino (1,7)

const K = '#142235';
const STEP_AT = 6.03; // «si inchina, ed esce»: la luce sull'ultimo gradino resta senza nessuno
const END_TAG = 7.35; // «Nel mondo, il pubblico applaude»
const STATIC = { left: 8.3, right: 8.8, main: 9.28 }; // «E cerca un altro canale»

/** Il cielo dipinto con la porta aperta sul buio (coordinate 0..490 × 0..390 dello schermo). */
const DoorShot: React.FC<{ t: number; accent: string; spill: number; tag: boolean }> = ({ t, accent, spill, tag }) => (
  <g>
    <rect width="490" height="390" fill="url(#in-sky)" />
    {/* giunture dei pannelli */}
    <g stroke="#4C7EA0" strokeWidth="2" opacity=".45">
      {[70, 140, 210, 280, 350, 420].map((x) => <path key={x} d={`M${x} 0 V330`} />)}
      {[110, 230].map((y) => <path key={y} d={`M0 ${y} H490`} />)}
    </g>
    <path d="M24 70 Q20 52 40 50 Q48 30 70 34 Q86 20 104 36 Q124 34 124 54 Q138 58 132 70 Z" fill="#FFFFFF" opacity=".9" />
    <path d="M360 150 Q356 136 372 134 Q380 118 398 122 Q412 112 426 126 Q442 126 440 140 Q452 144 448 150 Z" fill="#FFFFFF" opacity=".85" />
    {/* mare calmo al piede del muro */}
    <rect y="322" width="490" height="68" fill="#4FA3D1" />
    <rect y="318" width="490" height="6" fill="#6F8FA4" />
    <path d={`M${-20 + (t * 8) % 60} 350 h40 M${100 + (t * 8) % 60} 362 h50 M${260 + (t * 8) % 60} 348 h36 M${380 + (t * 8) % 60} 368 h40`} stroke="#DDF1FA" strokeWidth="3" strokeLinecap="round" />
    {/* la porta aperta sul buio */}
    <Glow id="in-dg" x={245} y={160} r={150} t={t} color={accent} amp={0.04} rate={2} opacity={0.45 + 0.25 * spill} />
    <rect x="205" y="96" width="80" height="122" fill="#03060C" stroke={accent} strokeWidth="5" />
    <rect x="212" y="104" width="66" height="114" fill="url(#in-void)" />
    {/* anta aperta verso l'esterno, dipinta come il cielo */}
    <path d="M205 96 L160 82 L160 236 L205 218 Z" fill="#B7E0F2" stroke={K} strokeWidth="4" strokeLinejoin="round" />
    <circle cx="170" cy="164" r="4" fill={K} />
    <rect x="203" y="66" width="84" height="22" rx="3" fill={K} />
    <text x="245" y="83" textAnchor="middle" fontFamily="Figtree" fontWeight={800} fontSize="16" letterSpacing="2" fill={accent}>USCITA</text>
    {/* ultimo gradino, vuoto, illuminato */}
    <rect x="196" y="218" width="104" height="9" rx="2" fill="#F4EBD8" stroke={K} strokeWidth="3" />
    <path d="M205 226 L298 226" stroke="#FFFFFF" strokeWidth="3" opacity={0.4 + 0.6 * spill} />
    <ellipse cx="248" cy="222" rx="60" ry="8" fill="#FFF4DD" opacity={0.25 + 0.35 * spill} />
    {Array.from({ length: 7 }, (_, i) => (
      <rect key={i} x={300 + i * 20} y={232 + i * 13} width="40" height="8" rx="2" fill="#E7E1D2" stroke={K} strokeWidth="3" />
    ))}
    <path d="M300 214 L446 316" stroke={K} strokeWidth="3" />
    {/* scritta di regia nell'angolo */}
    <rect x="16" y="16" width={tag ? 118 : 76} height="26" rx="4" fill={K} opacity=".75" />
    {tag ? <circle cx="30" cy="29" r="6" fill="#E85A5A" opacity={0.5 + 0.5 * Math.sin(t * 6)} /> : null}
    <text x={tag ? 42 : 54} y="35" textAnchor={tag ? 'start' : 'middle'} fontFamily="Figtree" fontWeight={800} fontSize="14" letterSpacing="1" fill="#F4F1E6">{tag ? 'IN DIRETTA' : 'FINE'}</text>
  </g>
);

/** Neve televisiva: rettangolini grigi rigenerati a ogni fotogramma (seme = numero del fotogramma). */
const Snow: React.FC<{ t: number; w: number; h: number; seed: number; n?: number }> = ({ t, w, h, seed, n = 260 }) => {
  const r = rng(seed * 1000 + Math.floor(t * 30));
  const greys = ['#FFFFFF', '#C9CED4', '#8D949C', '#4D545C', '#1E2329'];
  const bar = ((t * 0.6) % 1) * h;
  return (
    <g>
      <rect width={w} height={h} fill="#6B7279" />
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={r() * w} y={r() * h} width={4 + r() * (w / 12)} height={3 + r() * 4} fill={greys[Math.floor(r() * greys.length)]} opacity={0.9} />
      ))}
      <rect y={bar} width={w} height={h * 0.12} fill="#FFFFFF" opacity=".18" />
    </g>
  );
};

/** Televisore anni '60: mobile, schermo bombato, manopole. Lo schermo è (sx, sy, sw, sh). */
const TV: React.FC<{ x: number; y: number; w: number; h: number; sw: number; sh: number; children: React.ReactNode; clip: string; glow: number; knobs?: boolean }> = ({ x, y, w, h, sw, sh, children, clip, glow, knobs = true }) => {
  const sx = x + 28, sy = y + (h - sh) / 2;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="30" fill="#E9DFC8" stroke={K} strokeWidth="9" />
      <rect x={x + 10} y={y + 10} width={w - 20} height="14" rx="7" fill="#FFFFFF" opacity=".4" />
      <rect x={sx - 10} y={sy - 10} width={sw + 20} height={sh + 20} rx="34" fill="#2A3442" stroke={K} strokeWidth="5" />
      <clipPath id={clip}><rect x={sx} y={sy} width={sw} height={sh} rx="28" /></clipPath>
      <g clipPath={`url(#${clip})`}>
        <g transform={`translate(${sx} ${sy})`}>{children}</g>
        <rect x={sx} y={sy} width={sw} height={sh} fill="url(#in-scan)" />
        <path d={`M${sx} ${sy} H${sx + sw * 0.55} L${sx} ${sy + sh * 0.5} Z`} fill="#FFFFFF" opacity=".12" />
        <rect x={sx} y={sy} width={sw} height={sh} rx="28" fill="none" stroke="#000" strokeWidth="18" opacity=".25" />
        <rect x={sx} y={sy} width={sw} height={sh} fill="#FFFFFF" opacity={glow} />
      </g>
      {knobs && (
        <g>
          <circle cx={x + w - 34} cy={y + h * 0.3} r="16" fill="#C79A6B" stroke={K} strokeWidth="5" />
          <circle cx={x + w - 34} cy={y + h * 0.52} r="12" fill="#C79A6B" stroke={K} strokeWidth="5" />
          <path d={`M${x + w - 50} ${y + h * 0.72} h32 M${x + w - 50} ${y + h * 0.78} h32 M${x + w - 50} ${y + h * 0.84} h32`} stroke={K} strokeWidth="4" strokeLinecap="round" />
        </g>
      )}
      <path d={`M${x + 40} ${y + h} l-14 30 M${x + w - 40} ${y + h} l14 30`} stroke={K} strokeWidth="9" strokeLinecap="round" />
    </g>
  );
};

/** Tazza con piattino, base del piattino in (x, y). */
const Cup: React.FC<{ x: number; y: number; t: number; ph: number; s?: number }> = ({ x, y, t, ph, s = 1 }) => (
  <g>
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="-6" rx="62" ry="12" fill="#F4F1E6" stroke={K} strokeWidth="6" />
      <path d="M-40 -64 H40 Q38 -14 0 -12 Q-38 -14 -40 -64 Z" fill="#F4F1E6" stroke={K} strokeWidth="6" strokeLinejoin="round" />
      <path d="M40 -54 q26 0 22 18 q-4 14 -26 10" fill="none" stroke={K} strokeWidth="6" />
      <path d="M-38 -44 H38" stroke="#4FA3D1" strokeWidth="7" />
      <ellipse cx="0" cy="-64" rx="40" ry="8" fill="#6B4027" stroke={K} strokeWidth="5" />
    </g>
    <Wisps t={t + ph} x={x} y={y - 76 * s} color="#F4F1E6" n={3} h={150 * s} width={5} opacity={0.6} />
  </g>
);

export const Inchino: React.FC<SceneProps> = ({ t, dur, palette: P }) => {
  const cam = camera(t, dur);
  const L = cam.layer;

  const spill = seg(t, STEP_AT, STEP_AT + 0.6) * (1 - seg(t, STEP_AT + 1.4, STEP_AT + 2.4)) + 0.15;
  const tag = t < END_TAG;
  const sn = { l: t >= STATIC.left, r: t >= STATIC.right, m: t >= STATIC.main };
  // lampo bianco breve sullo schermo al cambio di canale (non è un lampo a tutto schermo)
  const zap = (at: number) => seg(t, at, at + 0.04) * (1 - seg(t, at + 0.05, at + 0.3)) * 0.85;
  const flick = sn.m ? 0.75 + 0.25 * Math.sin(t * 37) : 1;
  const screenLight = sn.m ? '#C9D2DB' : '#8FD3F4';

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="in" />
        <Lin id="in-wall" stops={[[0, '#0D1828'], [0.45, '#1A2B42'], [0.8, '#22384F'], [1, '#1A2B3F']]} />
        <Lin id="in-sky" stops={[[0, '#7FC4E6'], [0.55, '#B5E0F2'], [1, '#F6E1C6']]} />
        <Lin id="in-void" stops={[[0, '#000000'], [0.7, '#0A1220'], [1, '#1B2A3E']]} />
        <Lin id="in-wood" stops={[[0, '#E2BF92'], [1, '#B98A5C']]} />
        <Lin id="in-front" stops={[[0, '#8A5A3C'], [0.4, '#6B4430'], [1, '#3A2418']]} />
        <Lin id="in-cone" stops={[[0, '#8FD3F4', 0.28], [1, '#8FD3F4', 0]]} />
        <pattern id="in-scan" width="8" height="6" patternUnits="userSpaceOnUse">
          <rect width="8" height="2" fill="#000" opacity=".14" />
        </pattern>
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — parete del bar con boiserie */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2320" fill="url(#in-wall)" />
          <rect x="-200" y="1000" width="1480" height="200" fill="#2A3F57" />
          <path d="M-200 1000 H1280" stroke="#3E5873" strokeWidth="6" />
          {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-180 + i * 130} y="1024" width="104" height="150" rx="8" fill="none" stroke="#3A536D" strokeWidth="4" />)}
        </g>

        {/* PIANO 1 — insegna al neon e lampada a sospensione */}
        <g transform={L(0.4)}>
          <path d="M940 -20 V150" stroke="#0A1420" strokeWidth="5" />
          <Glow id="in-lamp" x={940} y={210} r={230} t={t} color="#FFE3B0" amp={0.03} rate={1.2} opacity={0.45} />
          <path d="M880 205 Q880 150 940 150 Q1000 150 1000 205 Z" fill="#E9DFC8" stroke={K} strokeWidth="6" />
          <ellipse cx="940" cy="207" rx="26" ry="8" fill="#FFF4D6" />
          <Neon id="in-neon" t={t} x={930} y={560} text="BAR" color="#8FD3F4" font="Bricolage Grotesque" size={78} />
        </g>

        {/* PIANO 2 — i televisori: la porta aperta sul buio, poi la neve */}
        <g transform={L(0.6)}>
          <path d="M520 1080 L170 1150 H920 Z" fill="url(#in-cone)" opacity={flick} />
          <Glow id="in-tvg" x={515} y={820} r={480} t={t} color={screenLight} amp={sn.m ? 0.12 : 0.03} rate={sn.m ? 23 : 1.5} opacity={0.35} />
          {/* antenna */}
          <path d="M640 600 L700 520 M660 600 L780 540" stroke={K} strokeWidth="6" strokeLinecap="round" />
          <circle cx="700" cy="520" r="7" fill={K} />
          <circle cx="780" cy="540" r="7" fill={K} />
          <TV x={220} y={600} w={610} h={470} sw={490} sh={390} clip="in-clipm" glow={zap(STATIC.main)}>
            {sn.m ? <Snow t={t} w={490} h={390} seed={3} /> : <DoorShot t={t} accent={P.accento} spill={spill} tag={tag} />}
          </TV>
          <g transform="translate(-70 740) scale(0.56)">
            <TV x={0} y={0} w={460} h={360} sw={346} sh={276} clip="in-clipl" glow={zap(STATIC.left)} knobs>
              {sn.l ? <Snow t={t} w={346} h={276} seed={5} n={180} /> : <g transform="scale(0.706)"><DoorShot t={t} accent={P.accento} spill={spill} tag={tag} /></g>}
            </TV>
          </g>
          <g transform="translate(870 700) scale(0.56)">
            <TV x={0} y={0} w={460} h={360} sw={346} sh={276} clip="in-clipr" glow={zap(STATIC.right)} knobs>
              {sn.r ? <Snow t={t} w={346} h={276} seed={7} n={180} /> : <g transform="scale(0.706)"><DoorShot t={t} accent={P.accento} spill={spill} tag={tag} /></g>}
            </TV>
          </g>
          <Dust t={t} top={{ y: 1010, x0: 300, x1: 740 }} bottom={{ y: 1150, x0: 180, x1: 900 }} n={22} color="#DDF1FA" seed={44} />
        </g>

        {/* PIANO 3 — bancone con tazze fumanti, zuccheriera e portatovaglioli */}
        <g transform={L(0.8)}>
          <path d="M-200 1110 H1280 V1190 H-200 Z" fill="url(#in-wood)" stroke={K} strokeWidth="8" />
          <path d="M-200 1126 H1280" stroke="#F4DDB8" strokeWidth="4" opacity=".7" />
          <path d="M120 1150 h300 M640 1140 h260" stroke="#FFFFFF" strokeWidth="5" opacity={sn.m ? 0.15 + 0.1 * Math.sin(t * 31) : 0.22} strokeLinecap="round" />
          <Cup x={150} y={1166} t={t} ph={0} />
          <Cup x={350} y={1160} t={t} ph={1.3} s={0.85} />
          <Cup x={810} y={1162} t={t} ph={2.1} s={0.9} />
          {/* zuccheriera */}
          <g transform="translate(560 1160)">
            <path d="M-30 0 L-26 -76 H26 L30 0 Z" fill="#DDF1FA" opacity=".55" stroke={K} strokeWidth="5" />
            <rect x="-28" y="-40" width="56" height="38" fill="#F4F1E6" opacity=".9" />
            <path d="M-22 -76 Q0 -100 22 -76 Z" fill="#B9C6CF" stroke={K} strokeWidth="5" />
            <path d="M0 -94 L10 -112" stroke={K} strokeWidth="5" strokeLinecap="round" />
          </g>
          {/* portatovaglioli */}
          <g transform="translate(980 1162)">
            <path d="M-50 0 V-60 Q0 -84 50 -60 V0 Z" fill="#B9C6CF" stroke={K} strokeWidth="5" />
            <path d="M-40 -56 Q0 -96 40 -56" fill="#F4F1E6" stroke={K} strokeWidth="4" />
          </g>
        </g>

        {/* PIANO 4 — bordo e fronte del bancone */}
        <g transform={L(1.0)}>
          <rect x="-200" y="1188" width="1480" height="40" rx="14" fill="#C9965F" stroke={K} strokeWidth="8" />
          <rect x="-200" y="1226" width="1480" height="800" fill="url(#in-front)" />
          {Array.from({ length: 13 }, (_, i) => <path key={i} d={`M${-160 + i * 110} 1236 V2000`} stroke="#2E1C12" strokeWidth="5" opacity=".5" />)}
          <path d="M-200 1500 H1280" stroke="#D8B48A" strokeWidth="10" opacity=".5" />
        </g>

        {/* PIANO 5 — sgabelli vuoti in primo piano */}
        <g transform={L(1.25)}>
          {[{ x: 120, y: 1700 }, { x: 960, y: 1730 }].map((s, i) => (
            <g key={i}>
              <path d={`M${s.x} ${s.y + 40} V2000`} stroke="#B9C6CF" strokeWidth="26" />
              <path d={`M${s.x} ${s.y + 40} V2000`} stroke={K} strokeWidth="6" opacity=".4" />
              <ellipse cx={s.x} cy={s.y + 40} rx="200" ry="58" fill="#3B5674" stroke={K} strokeWidth="9" />
              <ellipse cx={s.x} cy={s.y} rx="200" ry="58" fill="#4FA3D1" stroke={K} strokeWidth="9" />
              <path d={`M${s.x - 130} ${s.y - 20} Q${s.x} ${s.y - 50} ${s.x + 120} ${s.y - 24}`} fill="none" stroke="#BFE4F5" strokeWidth="8" strokeLinecap="round" opacity=".7" />
            </g>
          ))}
        </g>

        {/* PIANO 6 — pulviscolo vicino alla camera */}
        <g transform={L(1.7)}>
          <NearMotes id="in-near" t={t} color={sn.m ? '#E6EBF0' : '#CFEAF8'} n={7} vx={-20} vy={-8} opacity={0.11} y0={700} />
        </g>
      </g>
      <Finish id="in" tint="#142235" tintOpacity={0.13} />
    </svg>
  );
};

