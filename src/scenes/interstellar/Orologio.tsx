import React from 'react';
import { camera, eio, eo, eob, lerp, mod, rng, seg } from '../../lib/anim';
import { DISPLAY } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Dust, Glow, NearMotes, Stars } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { GOLD, Saturn } from './Spazio';

// Il messaggio: primo piano dell'orologio sulla libreria di Murph, la lancetta dei secondi che scatta in codice Morse
// (punti e linee dorati che si accendono); poi si apre lo sguardo su una gigantesca stazione spaziale cilindrica vicino
// a Saturno, con case e campi all'interno; in fondo una navetta parte verso un pianeta lontano. Nessuna persona.
// Eventi: la lancetta batte il Morse (da cue 0) · i dati arrivano: righe di cifre (cue 1) · si apre la stazione spaziale
//         (cue 2) · due orologi: lui giovane, lei anziana (cue 3) · la navetta parte verso il pianeta di Amelia (cue 4).
// Piani: stelle e Saturno (0,2) · stazione spaziale (0,45) · orologio e libreria (0,7) · cornice e particelle (1,2–1,8)

const K = '#0A0F18';
const r = rng(31);
// codice Morse da battere: 1 = linea, 0 = punto
const MORSE = [0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1];
const HOUSES = Array.from({ length: 16 }, (_, i) => ({ a: (i / 16) * Math.PI * 2, c: ['#E8E2D6', '#C9A86A', '#9AB48A'][i % 3] }));

export const Orologio: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  // battito Morse: un segno ogni terzo di tempo (72 bpm), da mezzo tempo dopo l'inizio, come i bip dello spartito
  const beat = Math.floor(seg(t, 5 / 12, 5 / 12 + MORSE.length * (5 / 18)) * MORSE.length * 0.999);
  const tickA = beat * 24 + (mod((t - 5 / 12) * 3.6, 1) < 0.3 ? 6 : 0);
  const data = eo(seg(t, cues[1] + 0.2, cues[1] + 1.0));
  const station = eio(seg(t, cues[2] - 0.2, cues[2] + 0.4)); // dissolvenza breve: niente doppia immagine
  const ages = eob(seg(t, cues[3], cues[3] + 0.6));
  const depart = eio(seg(t, cues[4] + 0.2, dur));
  const wx = 540, wy = lerp(900, 1180, station), ws = lerp(1, 0.5, station);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="or" />
        <Lin id="or-space" stops={[[0, '#03050C'], [0.5, '#0C1426'], [1, '#05080E']]} />
        <Lin id="or-room" stops={[[0, '#2A2018'], [0.5, '#4A3828'], [1, '#2A2018']]} />
        <Lin id="or-hull" x2={1} y2={0} stops={[[0, '#5A6878'], [0.5, '#C9D3DB'], [1, '#4A5868']]} />
        <Lin id="or-inside" stops={[[0, '#9AB48A'], [0.5, '#C9B888'], [1, '#7A9A6A']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — stelle e Saturno (si vedono quando si apre lo sguardo) (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2320" fill="url(#or-space)" />
          <Stars t={t} seed={41} n={80} y={-100} h={2000} color="#DCE8F2" size={0.8} />
          <g opacity={station}>
            <Saturn id="or-sat" x={900} y={640} r={70} outline={K} />
            {/* pianeta di Amelia, lontano */}
            <circle cx="160" cy="640" r="16" fill="#C98A5A" stroke="#F2DDB0" strokeWidth="3" />
            <Glow id="or-pl" x={160} y={640} r={70} t={t} color="#E8B04A" amp={0.1} rate={2} opacity={0.5 * (0.4 + depart)} />
          </g>
        </g>

        {/* PIANO 1 — stazione spaziale cilindrica con case e campi all'interno (0,45) */}
        <g transform={L(0.45)} opacity={station}>
          <g transform={`translate(540 ${lerp(1100, 900, station)}) scale(${lerp(0.5, 0.72, station)})`}>
            <ellipse cx="0" cy="0" rx="380" ry="300" fill="url(#or-inside)" stroke={K} strokeWidth="8" />
            <ellipse cx="0" cy="0" rx="300" ry="230" fill="#5A7A9A" opacity=".6" />
            <Glow id="or-sun" x={0} y={0} r={160} t={t} color="#FFF4D6" amp={0.05} rate={1} opacity={0.7} />
            <circle r="24" fill="#FFF4D6" />
            {HOUSES.map((h, i) => {
              const x = Math.cos(h.a + t * 0.05) * 330, y = Math.sin(h.a + t * 0.05) * 260;
              const rot = (h.a + t * 0.05) * (180 / Math.PI) + 90;
              return <g key={i} transform={`translate(${x} ${y}) rotate(${rot})`}><rect x="-14" y="-14" width="28" height="22" fill={h.c} stroke={K} strokeWidth="3" /><path d="M-18 -14 L0 -28 L18 -14 Z" fill="#7A5A3E" stroke={K} strokeWidth="3" /></g>;
            })}
            <ellipse cx="0" cy="0" rx="380" ry="300" fill="none" stroke="url(#or-hull)" strokeWidth="40" />
            <ellipse cx="0" cy="0" rx="380" ry="300" fill="none" stroke={K} strokeWidth="6" />
            {[0, 1, 2, 3].map((k) => <path key={k} d="M0 -320 V-280" stroke="#3A4654" strokeWidth="14" transform={`rotate(${k * 90})`} />)}
          </g>
          {/* navetta che parte verso il pianeta di Amelia */}
          {depart > 0 && (
            <g>
            <path d={`M800 1000 L${lerp(800, 180, depart)} ${lerp(1000, 650, depart)}`} stroke="#8EB8D8" strokeWidth="6" strokeLinecap="round" opacity={0.5 * (1 - seg(depart, 0.8, 1))} />
            <g transform={`translate(${lerp(800, 180, depart)} ${lerp(1000, 650, depart)}) scale(${lerp(0.6, 0.24, depart)}) rotate(-35)`}>
              <path d="M-110 16 L-80 -26 H60 L118 8 L108 26 H-100 Z" fill="#EEF2F4" stroke={K} strokeWidth="8" strokeLinejoin="round" />
              <Glow id="or-eng" x={-130} y={10} r={90} t={t} color="#8EB8D8" amp={0.3} rate={15} opacity={0.9} />
            </g>
            </g>
          )}
        </g>

        {/* PIANO 2 — l'orologio sulla mensola della libreria, il Morse e i due orologi (0,7) */}
        <g transform={L(0.7)}>
          <g opacity={1 - station}>
            <rect x="-200" y="-200" width="1480" height="2400" fill="url(#or-room)" />
            <path d="M-200 1080 H1280" stroke="#2A1E14" strokeWidth="30" />
            {Array.from({ length: 14 }, (_, i) => <rect key={i} x={-160 + i * 90} y={1080 - 140 - (i % 3) * 16} width="70" height={140 + (i % 3) * 16} rx="5" fill={['#7A5A3E', '#4E5A6A', '#8A6A4A', '#5A4A3A'][i % 4]} stroke={K} strokeWidth="5" opacity={Math.abs(i - 6.5) < 2 ? 0 : 1} />)}
          </g>
          {/* orologio grande */}
          <g transform={`translate(${wx} ${wy}) scale(${ws})`} opacity={1 - seg(station, 0.5, 1)}>
            <Glow id="or-wg" x={0} y={0} r={300} t={t} color={GOLD} amp={0.12} rate={4} opacity={0.4 + 0.3 * (1 - station)} />
            <path d="M-260 -40 H-150 M150 -40 H260 M-260 40 H-150 M150 40 H260" stroke="#3A2C20" strokeWidth="50" strokeLinecap="round" />
            <circle r="160" fill="#EEE8DC" stroke={K} strokeWidth="12" />
            <circle r="160" fill="none" stroke={GOLD} strokeWidth="10" />
            {Array.from({ length: 12 }, (_, i) => <path key={i} d="M0 -142 V-122" stroke={K} strokeWidth="7" transform={`rotate(${i * 30})`} />)}
            <path d="M0 0 V-90" stroke={K} strokeWidth="12" strokeLinecap="round" transform="rotate(50)" />
            <path d="M0 0 V-64" stroke={K} strokeWidth="12" strokeLinecap="round" transform="rotate(210)" />
            <path d="M0 16 V-130" stroke={GOLD} strokeWidth="6" strokeLinecap="round" transform={`rotate(${tickA})`} />
            <circle r="12" fill={K} />
          </g>
          {/* punti e linee del Morse */}
          <g opacity={1 - station}>
            {MORSE.map((m, i) => (
              <rect key={i} x={160 + i * 64 - (m ? 22 : 9)} y="660" width={m ? 44 : 18} height="18" rx="9" fill={GOLD} opacity={i < beat ? 1 : 0.15} />
            ))}
            <text x="540" y="626" textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize="30" fill={GOLD} letterSpacing="4" opacity={data}>DATI RICEVUTI</text>
          </g>
          {/* due orologi: lui giovane, lei anziana */}
          <g opacity={ages * (1 - depart * 0.6)}>
            {[['COOPER', 124, 220], ['MURPH', 1040 / 2 + 300, 760]].map(([who, x, a], i) => (
              <g key={i} transform={`translate(${i ? 860 : 220} 1150) scale(${ages * 0.9})`}>
                <circle r="56" fill="#0E1622" fillOpacity=".8" stroke={i ? '#DCE8F2' : GOLD} strokeWidth="6" />
                <path d="M0 4 V-40" stroke={i ? '#DCE8F2' : GOLD} strokeWidth="6" strokeLinecap="round" transform={`rotate(${(a as number) + t * (i ? 600 : 12)})`} />
                <text y="-74" textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize="26" fill="#DCE8F2" letterSpacing="2">{who}</text>
                <text y="96" textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize="22" fill={i ? '#9AA8B4' : GOLD}>{i ? 'ANZIANA' : 'GIOVANE'}</text>
              </g>
            ))}
          </g>
        </g>

        {/* PRIMO PIANO — dorsi dei libri della mensola, poi il bordo dell'oblò della stazione (1,2) */}
        <g transform={L(1.2)}>
          <g opacity={1 - station}>
            <path d="M-200 1600 H1280 V2200 H-200 Z" fill="#2A1E14" stroke={K} strokeWidth="8" />
            {Array.from({ length: 11 }, (_, i) => <rect key={i} x={-180 + i * 120} y={1480 - (i % 3) * 30} width="96" height={460 + (i % 3) * 30} rx="6" fill={['#6A4A32', '#3E4A5A', '#7A5A3A', '#4A3A2A'][i % 4]} stroke={K} strokeWidth="6" />)}
            {Array.from({ length: 11 }, (_, i) => <path key={i} d={`M${-160 + i * 120} ${1540 - (i % 3) * 30} H${-104 + i * 120}`} stroke={GOLD} strokeWidth="4" opacity=".6" />)}
          </g>
          <g opacity={station}>
            <path d="M-200 2200 V1640 Q540 1440 1280 1640 V2200 Z" fill="url(#or-hull)" stroke={K} strokeWidth="10" />
            <path d="M-200 1700 Q540 1510 1280 1700" fill="none" stroke="#EEF2F4" strokeWidth="4" opacity=".6" />
            {[-60, 220, 540, 860, 1140].map((x, i) => <circle key={i} cx={x} cy={1720 - 90 * Math.cos(((x - 540) / 900) * Math.PI / 2)} r="10" fill="#3A4858" stroke={K} strokeWidth="4" />)}
          </g>
        </g>

        {/* PIANO 3 — pulviscolo dorato e particelle vicine (1,5–1,8) */}
        <g transform={L(1.5)}>
          <Dust t={t} top={{ y: 600, x0: 200, x1: 880 }} bottom={{ y: 1300, x0: 100, x1: 980 }} n={30} color="#F3DDA8" />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="or-near" t={t + r()} color="#F3DDA8" n={6} vx={-20} vy={-8} opacity={0.15} />
        </g>
      </g>

      <Finish id="or" tint="#3E6A8A" tintOpacity={0.08} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): Morse da 0,4 a cue1 + 0,6 · DATI RICEVUTI cue1 + 0,2 · stazione spaziale cue2 − 0,2 → +0,4
// · due orologi cue3 · navetta verso il pianeta di Amelia da cue4 + 0,2.
