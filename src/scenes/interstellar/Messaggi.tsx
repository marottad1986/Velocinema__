import React from 'react';
import { camera, eo, eob, lerp, mod, rng, seg } from '../../lib/anim';
import { DISPLAY } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Dust, Glow, NearMotes, Stars, Wisps } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { BlackHole, GOLD } from './Spazio';

// 23 anni di messaggi: cabina dell'astronave in penombra. Su uno schermo scorrono i video da casa (solo luci sfocate,
// nessun volto) con il contatore degli anni; ogni notizia compare come un'icona. Fuori dall'oblò il buco nero.
// Nessuna persona.
// Eventi: il contatore corre (dall'inizio) · icone di Tom: casa, anelli, una candela (cue 1) · icona di Murph scienziata:
//         lavagna con formula (cue 2) · lo schermo si spegne nel rumore (cue 3).
// Piani: parete della cabina e oblò con il buco nero (0,25) · schermo (0,55) · console con tazza e cuffie (0,85)
//        · bordo del sedile e cavi in primo piano (1,2) · pulviscolo e particelle (1,5–1,8)

const K = '#06090E';
const r = rng(23);
const BLOBS = Array.from({ length: 6 }, () => ({ x: r() * 360 - 180, y: r() * 200 - 100, s: 50 + r() * 70, c: ['#E8C894', '#8EB8D8', '#C9846A', '#9AB48A'][Math.floor(r() * 4)], ph: r() * 6 }));

const Icon: React.FC<{ kind: 'house' | 'rings' | 'candle' | 'board'; x: number; y: number; s: number }> = ({ kind, x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke="#EEF2F4" strokeWidth="5" fill="none" strokeLinejoin="round" strokeLinecap="round">
    {kind === 'house' && <path d="M-30 20 V-6 L0 -30 L30 -6 V20 Z M-8 20 V2 H8 V20" />}
    {kind === 'rings' && <><circle cx="-10" cy="4" r="16" /><circle cx="12" cy="4" r="16" /></>}
    {kind === 'candle' && <><path d="M-10 26 V-8 H10 V26 Z" /><path d="M0 -14 q-8 -10 0 -22 q8 12 0 22" fill={GOLD} stroke={GOLD} /></>}
    {kind === 'board' && <><rect x="-34" y="-24" width="68" height="46" /><path d="M-26 -12 q6 -10 12 0 t12 0" /><path d="M-26 6 h14 M-19 -1 v14 M-4 6 h8 M10 6 q6 -12 12 0" /><circle cx="22" cy="-12" r="4" fill={GOLD} stroke={GOLD} /></>}
  </g>
);

export const Messaggi: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const years = Math.min(23, Math.floor(seg(t, 0.2, cues[3]) * 23 + 0.0001));
  const tom = (i: number) => eob(seg(t, cues[1] + i * 0.5, cues[1] + 0.4 + i * 0.5));
  const murph = eob(seg(t, cues[2] + 0.2, cues[2] + 0.7));
  const off = seg(t, cues[3] + 0.4, cues[3] + 1.4);
  const noise = off > 0 && off < 1;
  const sx = 420, sy = 860;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="me" />
        <Lin id="me-wall" stops={[[0, '#0A0E14'], [0.4, '#1A222C'], [0.75, '#26303C'], [1, '#141A22']]} />
        <Lin id="me-panel" x2={1} y2={0} stops={[[0, '#2A3440'], [0.5, '#3A4654'], [1, '#222A34']]} />
        <Lin id="me-screen" stops={[[0, '#0E1622'], [1, '#18222E']]} />
        <Lin id="me-console" stops={[[0, '#3A4654'], [0.3, '#2A3440'], [1, '#10161E']]} />
        <Lin id="me-front" stops={[[0, '#1A222C'], [1, '#05080C']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — parete della cabina e oblò con il buco nero (0,25) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2320" fill="url(#me-wall)" />
          {Array.from({ length: 6 }, (_, i) => <rect key={i} x={-160 + i * 240} y="520" width="220" height="560" rx="16" fill="none" stroke="#0A0E14" strokeWidth="8" />)}
          <g>
            <circle cx="850" cy="740" r="150" fill="#02040A" />
            <clipPath id="me-port"><circle cx="850" cy="740" r="146" /></clipPath>
            <g clipPath="url(#me-port)">
              <Stars t={t} seed={6} n={20} x={700} y={590} w={300} h={300} color="#DCE8F2" />
              <BlackHole id="me-bh" x={860} y={750} r={34} t={t} tilt={-10} glow={0.9} />
            </g>
            <circle cx="850" cy="740" r="150" fill="none" stroke="url(#me-panel)" strokeWidth="30" />
            <circle cx="850" cy="740" r="150" fill="none" stroke={K} strokeWidth="6" />
            {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={850 + Math.cos((i / 8) * Math.PI * 2) * 166} cy={740 + Math.sin((i / 8) * Math.PI * 2) * 166} r="6" fill="#5A6878" />)}
          </g>
        </g>

        {/* PIANO 1 — schermo con i video da casa (0,55) */}
        <g transform={L(0.55)}>
          <rect x={sx - 250} y={sy - 180} width="500" height="360" rx="14" fill="url(#me-screen)" stroke="url(#me-panel)" strokeWidth="20" />
          <rect x={sx - 250} y={sy - 180} width="500" height="360" rx="14" fill="none" stroke={K} strokeWidth="5" />
          <clipPath id="me-scr"><rect x={sx - 236} y={sy - 166} width="472" height="332" rx="6" /></clipPath>
          <g clipPath="url(#me-scr)">
            <g opacity={1 - off}>
              {/* immagini sfocate: solo macchie di luce e colore */}
              {BLOBS.map((b, i) => (
                <circle key={i} cx={sx + b.x + Math.sin(t * 0.7 + b.ph) * 30} cy={sy + b.y + Math.cos(t * 0.5 + b.ph) * 20} r={b.s} fill={b.c} opacity={0.18 + 0.12 * Math.sin(t * 2 + b.ph)} />
              ))}
              {/* icone delle notizie */}
              <Icon kind="house" x={sx - 120} y={sy - 30} s={tom(0)} />
              <Icon kind="rings" x={sx - 20} y={sy - 30} s={tom(1)} />
              <Icon kind="candle" x={sx + 80} y={sy - 30} s={tom(2)} />
              <Icon kind="board" x={sx} y={sy + 60} s={murph * 1.3} />
            </g>
            {/* scanline e rumore quando si spegne */}
            {Array.from({ length: 18 }, (_, i) => <path key={i} d={`M${sx - 240} ${sy - 160 + i * 19} H${sx + 240}`} stroke="#DCE8F2" strokeWidth="1.5" opacity=".08" />)}
            {noise && Array.from({ length: 60 }, (_, i) => {
              const rr = rng(Math.floor(t * 20) * 97 + i);
              return <rect key={i} x={sx - 236 + rr() * 470} y={sy - 166 + rr() * 330} width={4 + rr() * 30} height="3" fill="#DCE8F2" opacity={0.5 * (1 - off)} />;
            })}
          </g>
          {/* contatore degli anni */}
          <rect x={sx - 140} y={sy + 196} width="280" height="64" rx="10" fill="#0A0E14" stroke="#3A4654" strokeWidth="6" />
          <text x={sx} y={sy + 240} textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize="34" fill={GOLD} letterSpacing="2">ANNI: {String(years).padStart(2, '0')}</text>
          <Glow id="me-sg" x={sx} y={sy} r={360} t={t} color="#8EB8D8" amp={0.08} rate={3} opacity={0.35 * (1 - off * 0.8)} />
        </g>

        {/* PIANO 2 — console con tazza fumante e cuffie (0,85) */}
        <g transform={L(0.85)}>
          <path d="M-200 1160 H1280 L1280 1300 H-200 Z" fill="url(#me-console)" stroke={K} strokeWidth="9" />
          <path d="M-200 1168 H1280" stroke="#6E7E8E" strokeWidth="4" />
          {Array.from({ length: 14 }, (_, i) => <rect key={i} x={-120 + i * 90} y="1200" width="40" height="18" rx="4" fill={i % 4 === 1 ? GOLD : '#4E5E6E'} opacity={i % 4 === 1 ? 0.6 + 0.4 * Math.sin(t * 3 + i) : 1} />)}
          <g transform="translate(820 1160)">
            <path d="M-36 0 V-80 H36 V0 Z" fill="#DCE4EA" stroke={K} strokeWidth="7" />
            <path d="M36 -60 q28 0 28 22 q0 20 -28 20" fill="none" stroke={K} strokeWidth="7" />
            <rect x="-36" y="-56" width="72" height="16" fill="#3E6A8A" />
          </g>
          <Wisps t={t} x={820} y={1070} color="#DCE8F2" n={3} h={160} width={5} opacity={0.5} />
          <g transform="translate(160 1160)">
            <path d="M-60 0 Q-60 -110 0 -110 Q60 -110 60 0" fill="none" stroke="#1A222C" strokeWidth="16" />
            <rect x="-80" y="-30" width="40" height="56" rx="14" fill="#2A3440" stroke={K} strokeWidth="6" />
            <rect x="40" y="-30" width="40" height="56" rx="14" fill="#2A3440" stroke={K} strokeWidth="6" />
          </g>
        </g>

        {/* PIANO 3 — schienale del sedile e cavi in primo piano (1,2) */}
        <g transform={L(1.2)}>
          <path d="M-200 1500 Q300 1440 700 1520 Q1000 1580 1280 1500 V2200 H-200 Z" fill="url(#me-front)" stroke={K} strokeWidth="9" />
          <path d="M300 2000 V1560 Q300 1500 360 1500 H700 Q760 1500 760 1560 V2000" fill="#1E2630" stroke={K} strokeWidth="10" />
          <path d="M340 1540 H720" stroke="#4E5E6E" strokeWidth="6" />
          <path d="M-200 1600 Q100 1560 200 1700 Q260 1800 -200 1880" fill="none" stroke="#141C24" strokeWidth="26" />
        </g>

        {/* PIANO 4 — pulviscolo nella luce dello schermo, particelle (1,5–1,8) */}
        <g transform={L(1.5)}>
          <Dust t={t} top={{ y: 700, x0: 200, x1: 640 }} bottom={{ y: 1300, x0: 100, x1: 800 }} n={22} color="#DCE8F2" />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="me-near" t={t + mod(0, 1)} color="#DCE8F2" n={6} vx={-15} vy={-6} opacity={0.06} />
        </g>
      </g>

      <Finish id="me" tint="#3E6A8A" tintOpacity={0.1} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): contatore da 0,2 a cue3 · icone di Tom da cue1 (0,5 s l'una) · icona di Murph cue2 + 0,2
// · schermo che si spegne cue3 + 0,4.
