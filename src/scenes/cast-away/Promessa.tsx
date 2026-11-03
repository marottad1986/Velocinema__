import React from 'react';
import { camera, eo, eob, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Glow, GlassDrops, NearMotes, StringLights } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { K, PocketWatch } from './Comuni';

// La promessa di Natale: dentro un'auto ferma all'aeroporto, sera di Natale con neve. Oltre il parabrezza bagnato il
// terminal con le luci e l'aereo cargo in pista (fr. 0); sul cruscotto, in grande, l'orologio da tasca del nonno che si
// apre sulla foto (fr. 1) e la scatolina dell'anello col fiocco (fr. 2); poi il biglietto del volo di ritorno «31 DIC»
// e l'aereo che si muove (fr. 3). Sotto: quadro strumenti acceso, volante, radio e bocchette che riempiono il fondo.
// Piani: cielo (0,2) · terminal e luci (0,35) · pista e aereo (0,5) · neve lontana (0,6) · vetro, montanti, specchietto (0,9)
//        · cruscotto con gli oggetti (1,05) · volante e plancia (1,2) · fiocchi vicini (1,6)

const r = rng(2412);
const SNOW = Array.from({ length: 60 }, () => ({ x: r() * 1300 - 110, y: r() * 900, s: 2 + r() * 4, v: 30 + r() * 40, ph: r() * 6 }));
const SNOW_NEAR = Array.from({ length: 10 }, () => ({ x: r() * 1300 - 110, y: r() * 900, s: 9 + r() * 10, v: 90 + r() * 80, ph: r() * 6 }));
const RUNWAY = Array.from({ length: 14 }, (_, i) => i);

export const Promessa: React.FC<SceneProps> = ({ t, dur, palette: P, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const watchAt = griglia(cues[1] + 0.4);
  const giftAt = griglia(cues[2] + 0.2);
  const ticketAt = griglia(cues[3] + 0.3);
  const watch = eo(seg(t, watchAt, watchAt + 1.0)); // l'orologio si apre: dentro la foto
  const gift = eob(seg(t, giftAt, giftAt + 0.6), 2.2); // la scatolina con il fiocco
  const ticket = eo(seg(t, ticketAt, ticketAt + 0.7)); // il biglietto del ritorno
  const plane = seg(t, ticketAt, dur + 2); // l'aereo comincia a muoversi: lui parte
  const wiper = Math.max(0, Math.sin(mod(t - 0.8, 4.2) / 1.1 * Math.PI)) * (mod(t - 0.8, 4.2) < 1.1 ? 1 : 0);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="pm" />
        <Lin id="pm-sky" stops={[[0, '#070F1C'], [0.3, '#122540'], [0.5, '#25405F'], [0.58, '#3A5577']]} />
        <Lin id="pm-ground" stops={[[0, '#2B3E52'], [1, '#121E2B']]} />
        <Lin id="pm-dash" stops={[[0, '#3A322C'], [0.12, '#2A2420'], [0.5, '#1B1714'], [1, '#0C0A09']]} />
        <Lin id="pm-top" stops={[[0, '#4A4038'], [1, '#2A2420']]} />
        <Lin id="pm-glass" stops={[[0, '#FFFFFF', 0.1], [1, '#FFFFFF', 0]]} />
        <Lin id="pm-wheel" stops={[[0, '#3A332E'], [1, '#141110']]} />
        <radialGradient id="pm-dial">
          <stop offset="0" stopColor="#3A2A18" />
          <stop offset="1" stopColor="#120C08" />
        </radialGradient>
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — cielo notturno */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="1400" fill="url(#pm-sky)" />
          <Glow id="pm-city" x={540} y={820} r={700} t={t} color="#F2B36B" amp={0.03} rate={0.6} opacity={0.22} />
        </g>

        {/* PIANO 1 — terminal con luci di Natale e torre di controllo */}
        <g transform={L(0.35)}>
          <path d="M760 790 V560 H800 L820 520 H880 L900 560 H930 V790 Z" fill="#1A2B3F" />
          <rect x="810" y="530" width="80" height="26" fill="#FFE2A0" opacity={0.6 + 0.2 * Math.sin(t * 2)} />
          <Glow id="pm-tower" x={850} y={540} r={90} t={t} color="#FFE2A0" amp={0.08} rate={1.5} opacity={0.5} />
          <circle cx="850" cy="512" r="7" fill="#FF5A4A" opacity={mod(t, 1.4) < 0.4 ? 1 : 0.2} />
          <rect x="-200" y="680" width="980" height="110" fill="#1E3248" />
          {Array.from({ length: 15 }, (_, i) => <rect key={i} x={-180 + i * 64} y="700" width="40" height="40" fill="#F5D38E" opacity={0.35 + 0.35 * ((i * 7) % 3 === 0 ? 1 : 0.5)} />)}
          <StringLights id="pm-xmas" t={t} from={{ x: -200, y: 672 }} to={{ x: 780, y: 672 }} n={16} sag={22} colors={['#F2C14E', '#E4572E', '#7FD1B9', '#F4F1E8']} wire="#0E1A26" r={7} />
        </g>

        {/* PIANO 2 — pista con luci e aereo cargo (senza oblò, portellone merci) */}
        <g transform={L(0.5)}>
          <rect x="-200" y="790" width="1480" height="400" fill="url(#pm-ground)" />
          <path d="M-200 790 H1280" stroke="#3E5670" strokeWidth="4" />
          {RUNWAY.map((i) => (
            <g key={i}>
              <circle cx={-160 + i * 100} cy={850} r="6" fill="#7FD1FF" />
              <Glow id={`pm-rw${i}`} x={-160 + i * 100} y={850} r={30} t={t} color="#7FD1FF" amp={0.2} rate={2} opacity={0.6} />
            </g>
          ))}
          <g transform={`translate(${470 + plane * 200} 812) scale(.95)`}>
            <path d="M190 -40 L246 -130 H284 L266 -40 Z" fill="#AEBBC7" stroke={K} strokeWidth="5" />
            <path d="M-270 -8 Q-290 -40 -236 -48 H230 Q284 -46 300 -22 Q284 2 230 6 H-236 Q-276 4 -270 -8 Z" fill="#C8D2DC" stroke={K} strokeWidth="6" />
            <path d="M-270 -20 Q-252 -36 -226 -40" fill="none" stroke="#25323D" strokeWidth="12" strokeLinecap="round" />
            <rect x="-150" y="-42" width="80" height="42" rx="4" fill="#B7C3CF" stroke={K} strokeWidth="4" />
            <path d="M-40 -14 L-150 60 H-100 L40 -10 Z" fill="#AEBBC7" stroke={K} strokeWidth="5" />
            <circle cx="270" cy="-128" r="6" fill="#FF5A4A" opacity={mod(t, 1) < 0.3 ? 1 : 0.15} />
            <Glow id="pm-nav" x={270} y={-128} r={50} t={t} color="#FF5A4A" amp={0} opacity={mod(t, 1) < 0.3 ? 0.7 : 0} />
            <circle cx="-150" cy="58" r="5" fill="#7CFF8A" />
            <Glow id="pm-land" x={-286} y={-12} r={80} t={t} color="#FFF4D0" amp={0.05} opacity={0.6} />
          </g>
        </g>

        {/* PIANO 3 — neve lontana */}
        <g transform={L(0.6)}>
          {SNOW.map((s, i) => (
            <circle key={i} cx={s.x + Math.sin(t + s.ph) * 14} cy={mod(s.y + t * s.v, 900) - 60} r={s.s} fill="#EAF2F8" opacity=".75" />
          ))}
        </g>

        {/* PIANO 4 — vetro bagnato, tergicristallo, montanti e specchietto con una pallina di Natale */}
        <g transform={L(0.9)}>
          <rect x="-200" y="-200" width="1480" height="1150" fill="url(#pm-glass)" />
          <GlassDrops t={t} x={60} y={300} w={960} h={600} seed={24} n={18} color="#CFE3EE" />
          <g transform={`rotate(${-8 + wiper * 70} 220 960)`}>
            <path d="M220 960 L760 900" stroke={K} strokeWidth="16" strokeLinecap="round" />
            <path d="M260 952 L740 900" stroke="#3A3530" strokeWidth="8" strokeLinecap="round" />
          </g>
          <path d="M-200 -200 H-20 L130 960 H-200 Z" fill="#0A0807" />
          <path d="M1280 -200 H1100 L950 960 H1280 Z" fill="#0A0807" />
          <path d="M-20 -200 L130 960 M1100 -200 L950 960" stroke="#3A2E26" strokeWidth="10" />
          <path d="M760 -200 V100" stroke="#1A1512" strokeWidth="18" />
          <rect x="640" y="90" width="240" height="70" rx="22" fill="#1A1512" stroke={K} strokeWidth="6" />
          <rect x="656" y="102" width="208" height="46" rx="14" fill="#33424E" />
          <path d="M670 112 h80" stroke="#7FA0BC" strokeWidth="5" strokeLinecap="round" opacity=".6" />
          <g transform={`rotate(${Math.sin(t * 1.6) * 8} 760 160)`}>
            <path d="M760 160 V196" stroke="#C9A24A" strokeWidth="3" />
            <circle cx="760" cy="218" r="22" fill="#C8321F" stroke={K} strokeWidth="5" />
            <path d="M748 210 q8 -10 18 -6" fill="none" stroke="#FFB0A0" strokeWidth="4" strokeLinecap="round" />
            <rect x="752" y="192" width="16" height="10" fill="#C9A24A" stroke={K} strokeWidth="3" />
          </g>
        </g>

        {/* PIANO 5 — cruscotto: orologio del nonno, scatolina dell'anello, biglietto del ritorno */}
        <g transform={L(1.05)}>
          <path d="M-200 950 Q540 900 1280 950 V1300 H-200 Z" fill="url(#pm-top)" stroke={K} strokeWidth="8" />
          <path d="M-200 958 Q540 908 1280 958" fill="none" stroke="#8A7462" strokeWidth="5" opacity=".7" />
          <Glow id="pm-warm" x={420} y={1060} r={340} t={t} color="#FFC57A" amp={0.06} rate={1.6} opacity={0.25 + 0.35 * watch} />
          {/* catenella dell'orologio */}
          <path d="M300 1150 Q250 1190 300 1220 Q360 1240 400 1200" fill="none" stroke="#C9A24A" strokeWidth="6" strokeDasharray="10 6" />
          <PocketWatch x={400} y={1060} s={1.55} open={watch} t={t + 3600 * 9} />
          <Glow id="pm-photo" x={270} y={1060} r={170} t={t} color="#FFE0B0" amp={0.05} rate={2} opacity={0.4 * watch} />
          {/* scatolina dell'anello col fiocco (accento) */}
          <g transform={`translate(825 1090) scale(${0.15 + 0.7 * gift})`} opacity={seg(t, giftAt, giftAt + 0.2)}>
            <ellipse cx="0" cy="62" rx="100" ry="14" fill="#000" opacity=".4" />
            <rect x="-78" y="-26" width="156" height="90" rx="12" fill="#7A1E2A" stroke={K} strokeWidth="7" />
            <rect x="-86" y="-58" width="172" height="40" rx="12" fill="#9A2A38" stroke={K} strokeWidth="7" />
            <path d="M-70 -46 h80" stroke="#D86070" strokeWidth="6" strokeLinecap="round" opacity=".7" />
            <path d="M0 -58 V64" stroke={P.accento} strokeWidth="16" />
            <path d="M0 -60 Q-70 -118 -58 -74 Q-46 -50 0 -60 Q70 -118 58 -74 Q46 -50 0 -60" fill={P.accento} stroke={K} strokeWidth="5" />
            <circle cx="0" cy="-60" r="10" fill="#C9431F" stroke={K} strokeWidth="4" />
            <Glow id="pm-gift" x={0} y={-40} r={140} t={t} color="#FFD7B8" amp={0.1} rate={2.4} opacity={0.4} />
            {/* scintilla: dentro c'è l'anello */}
            <path d={`M60 -70 l6 -18 l6 18 l18 6 l-18 6 l-6 18 l-6 -18 l-18 -6 Z`} fill="#FFF6D8" opacity={0.5 + 0.5 * Math.sin(t * 5)} />
          </g>
          {/* biglietto del volo di ritorno */}
          <g transform={`translate(${820 - 30 * (1 - ticket)} ${1215 - 20 * ticket}) rotate(${-4 + 3 * ticket})`} opacity={ticket}>
            <rect x="-120" y="-44" width="240" height="88" rx="8" fill="#F4EFE2" stroke={K} strokeWidth="6" />
            <path d="M60 -44 V44" stroke="#8A7A5C" strokeWidth="3" strokeDasharray="6 6" />
            <text x="-100" y="-10" fontFamily="Figtree, sans-serif" fontWeight="800" fontSize="22" fill="#5A4E40" letterSpacing="2">RITORNO</text>
            <text x="-100" y="30" fontFamily="Figtree, sans-serif" fontWeight="900" fontSize="38" fill={P.accento}>31 DIC</text>
            <path d="M78 -20 h28 M78 0 h20 M78 20 h28" stroke="#8A7A5C" strokeWidth="5" />
          </g>
          {/* agrifoglio */}
          <path d="M140 1200 q30 -40 70 -20 q-10 30 -70 20 Z M180 1190 q40 -10 60 20 q-40 10 -60 -20 Z" fill="#2F6B4A" stroke={K} strokeWidth="4" />
          <circle cx="180" cy="1188" r="9" fill="#C8321F" stroke={K} strokeWidth="3" />
        </g>

        {/* PIANO 6 — plancia: quadro strumenti acceso, volante, radio e bocchette fino al bordo */}
        <g transform={L(1.2)}>
          <path d="M-200 1290 Q540 1250 1280 1290 V2200 H-200 Z" fill="url(#pm-dash)" stroke={K} strokeWidth="8" />
          {/* quadro strumenti */}
          <path d="M40 1430 Q300 1350 560 1430 V1560 H40 Z" fill="#141110" stroke={K} strokeWidth="7" />
          {[[180, 1490], [420, 1490]].map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="82" fill="url(#pm-dial)" stroke="#5A4A3A" strokeWidth="6" />
              {Array.from({ length: 9 }, (_, k) => {
                const a = Math.PI * (0.8 + k * 0.175);
                return <path key={k} d={`M${x + Math.cos(a) * 60} ${y + Math.sin(a) * 60} L${x + Math.cos(a) * 72} ${y + Math.sin(a) * 72}`} stroke="#FFB860" strokeWidth="4" />;
              })}
              <path d={`M${x} ${y} L${x + Math.cos(Math.PI * (0.9 + i * 0.3)) * 58} ${y + Math.sin(Math.PI * (0.9 + i * 0.3)) * 58}`} stroke="#E4572E" strokeWidth="5" strokeLinecap="round" />
              <Glow id={`pm-dg${i}`} x={x} y={y} r={110} t={t} color="#FFB860" amp={0.04} rate={1} opacity={0.35} />
            </g>
          ))}
          {/* volante (solo l'oggetto) */}
          <circle cx="300" cy="1880" r="330" fill="none" stroke={K} strokeWidth="78" />
          <circle cx="300" cy="1880" r="330" fill="none" stroke="url(#pm-wheel)" strokeWidth="62" />
          <path d="M60 1660 Q300 1530 540 1660" fill="none" stroke="#5A504A" strokeWidth="8" strokeLinecap="round" opacity=".7" />
          <path d="M300 1880 L80 1760 M300 1880 L520 1760" stroke={K} strokeWidth="54" strokeLinecap="round" />
          <path d="M300 1880 L80 1760 M300 1880 L520 1760" stroke="#2A2420" strokeWidth="40" strokeLinecap="round" />
          <circle cx="300" cy="1880" r="96" fill="#1E1A17" stroke={K} strokeWidth="8" />
          {/* radio con il display e bocchette */}
          <rect x="680" y="1420" width="300" height="170" rx="14" fill="#141110" stroke={K} strokeWidth="7" />
          <rect x="704" y="1444" width="180" height="56" rx="6" fill="#0E2A22" />
          <text x="716" y="1484" fontFamily="Figtree, sans-serif" fontWeight="800" fontSize="34" fill="#7FE0B0">24.12</text>
          <Glow id="pm-radio" x={794} y={1472} r={90} t={t} color="#7FE0B0" amp={0.05} rate={1} opacity={0.3} />
          {[0, 1, 2].map((i) => <circle key={i} cx={920} cy={1450 + i * 46} r="16" fill="#2A2420" stroke="#5A4A3A" strokeWidth="4" />)}
          {[0, 1, 2, 3].map((i) => <rect key={i} x={704 + i * 44} y="1520" width="34" height="46" rx="6" fill="#2A2420" stroke="#5A4A3A" strokeWidth="3" />)}
          <rect x="680" y="1640" width="300" height="120" rx="16" fill="#141110" stroke={K} strokeWidth="7" />
          {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M700 ${1660 + i * 16} H960`} stroke="#3A322C" strokeWidth="7" />)}
        </g>

        {/* PIANO 7 — fiocchi vicini, grandi e sfumati (solo oltre il vetro) */}
        <g transform={L(1.6)}>
          {SNOW_NEAR.map((s, i) => (
            <circle key={i} cx={s.x + Math.sin(t * 0.8 + s.ph) * 30} cy={mod(s.y + t * s.v, 900)} r={s.s} fill="#F4F8FB" opacity=".3" />
          ))}
          <NearMotes id="pm-near" t={t} color="#FFE2B8" n={5} opacity={0.08} />
        </g>
      </g>
      <Finish id="pm" tint="#3B4C66" tintOpacity={0.12} />
    </svg>
  );
};
