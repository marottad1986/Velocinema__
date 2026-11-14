import React from 'react';
import { camera, eo, lerp, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Beam, Glow, NearMotes } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { Ball, Crowd, K, Pitch, Scoreboard, VIOLA } from './Comuni';

// Il minuto 17: lo stesso stadio di Firenze, di notte, visto dall'alto della tribuna. Tutto pieno, ma fermo: il campo è
// vuoto, il pallone immobile a centrocampo, sul tabellone l'orologio corre fino a 17' e lì si ferma. f2 «Bove ha un malore…
// la partita viene sospesa»: i fari calano di un tono, l'orologio fermo lampeggia piano, i tifosi abbassano le sciarpe e,
// lontano, entra a bordo campo un'ambulanza con le luci blu. Il malore non si disegna; la musica tace.
// Piani: tetto e fari (0,2) · tribuna di fronte (0,4) · campo (0,6) · ambulanza lontana (0,6) · tribuna in primo piano (1,2) · particelle (1,6)

export const Minuto17: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur, 540, 1050);
  const L = cam.layer;
  // l'orologio corre da 16:40 a 17:00 nei primi secondi e poi resta fermo
  const tStop = griglia(cues[1] - 0.6);
  const clock = Math.min(17 * 60, 16 * 60 + 40 + (t / Math.max(0.1, tStop)) * 20);
  const mm = Math.floor(clock / 60), ss = Math.floor(clock % 60);
  const stopped = t >= tStop;
  const tSusp = griglia(cues[1] + 1.2);
  const dim = eo(seg(t, tSusp, tSusp + 1.2));
  const blink = stopped ? 0.75 + 0.25 * Math.cos((t - tStop) * 2.4) : 1; // solo cifre e scritta: la cornice resta
  const amb = eo(seg(t, tSusp + 0.3, dur - 0.5)); // l'ambulanza avanza piano lungo il bordo campo
  const siren = 0.5 + 0.5 * Math.sin(t * 9);
  const shirts = [VIOLA, '#4A3270', '#2A2A34', '#F2EEE6', '#1E2A5A', VIOLA];
  const scarves = [[VIOLA, '#F2EEF8']];

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="mi" />
        <Lin id="mi-sky" stops={[[0, '#06060E'], [0.7, '#141226'], [1, '#262040']]} />
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — cielo di notte e bordo del tetto con i fari (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="1200" fill="url(#mi-sky)" />
          <path d="M-200 640 Q540 676 1280 640 V706 H-200 Z" fill="#08080E" />
          {Array.from({ length: 9 }, (_, i) => {
            const x = -80 + i * 155, y = 700 + Math.sin((i / 8) * Math.PI) * 16;
            return (
              <g key={i}>
                <Glow id={`mi-l${i}`} x={x} y={y} r={100} t={t} color="#FFF6DC" amp={0.03} rate={2} ph={i} opacity={0.8 * (1 - 0.45 * dim)} />
                <rect x={x - 28} y={y - 11} width="56" height="22" rx="5" fill={dim > 0.5 ? '#C8C4B4' : '#FFFBEA'} stroke={K} strokeWidth="4" />
              </g>
            );
          })}
        </g>
        {/* PIANO 1 — tribuna di fronte, piena e immobile, con il tabellone dell'orologio (0,4) */}
        <g transform={L(0.4)}>
          <rect x="-200" y="706" width="1480" height="300" fill="#14121C" />
          <Crowd t={t} y1={740} y0={975} rows={11} shirts={shirts} scarves={scarves} seed={51} size0={7} size1={12} scarfUp={0.5 * (1 - dim)} backdrop="#14121C" dim={0.35 * dim} />
          {/* tabellone grande al centro: l'orologio */}
          <g>
            <Glow id="mi-sbg" x={540} y={800} r={240} t={t} color="#FFE6A0" amp={0.03} rate={2} opacity={0.55} />
            <Scoreboard id="mi-sb" x={390} y={730} w={300} h={150} t={t} on={blink}
              lines={[{ text: `${mm}:${String(ss).padStart(2, '0')}`, size: 64 }, { text: t >= tSusp ? 'PARTITA SOSPESA' : '1° TEMPO', size: 22, color: stopped && dim > 0.3 ? '#FFFFFF' : '#E8D8FF' }]} />
          </g>
          <rect x="-200" y="1000" width="1480" height="28" fill="#1E1A2A" />
          {Array.from({ length: 8 }, (_, i) => <rect key={i} x={-190 + i * 190} y="1003" width="180" height="22" fill={i % 2 ? '#3A2A5A' : '#26203A'} />)}
        </g>
        {/* PIANO 2 — il campo vuoto, il pallone fermo a centrocampo, i fasci dei fari (0,6) */}
        <g transform={L(0.6)}>
          <Pitch id="mi-p" y0={1030} light="#3A8236" dark="#2E6E2E" x0={-120} x1={1200} lineOpacity={0.75} />
          <Beam id="mi-b1" x={140} y={700} t={t} length={680} spread={360} color="#FFF6DC" angle={68} opacity={0.14 * (1 - 0.6 * dim)} />
          <Beam id="mi-b2" x={940} y={700} t={t} length={680} spread={360} color="#FFF6DC" angle={112} opacity={0.14 * (1 - 0.6 * dim)} />
          <Ball x={540} y={1232} r={22} rot={10} />
          <Glow id="mi-bg" x={540} y={1232} r={110} t={t} color="#FFF6DC" amp={0.03} rate={1.5} opacity={0.35} />
          {/* l'ambulanza lontana sulla pista a bordo campo, a sinistra: piccola, luci blu */}
          <g transform={`translate(${lerp(-40, 330, amb)} 1056) scale(1.6)`} opacity={seg(t, tSusp + 0.2, tSusp + 0.8)}>
            <Glow id="mi-sir" x={8} y={-40} r={110} t={t} color="#5AA8FF" amp={0.2} rate={9} opacity={0.9 * siren} />
            <rect x="-30" y="-36" width="78" height="34" rx="5" fill="#F2F2F6" stroke={K} strokeWidth="4" />
            <rect x="34" y="-28" width="22" height="26" rx="3" fill="#F2F2F6" stroke={K} strokeWidth="4" />
            <rect x="-30" y="-20" width="78" height="6" fill="#E04848" />
            <rect x="38" y="-24" width="12" height="9" fill="#5A7A9A" />
            <rect x="0" y="-44" width="14" height="8" rx="2" fill={siren > 0.5 ? '#7AC8FF' : '#2A4A8A'} />
            <circle cx="-12" cy="0" r="7" fill="#1A1A22" /><circle cx="36" cy="0" r="7" fill="#1A1A22" />
          </g>
        </g>
        {/* PIANO 3 — la tribuna in primo piano, dall'alto: teste dei tifosi di spalle (1,2) */}
        <g transform={L(1.2)}>
          <rect x="-200" y="1420" width="1480" height="700" fill="#0C0A14" />
          <rect x="-200" y="1400" width="1480" height="24" fill="#24202E" stroke={K} strokeWidth="6" />
          <Crowd t={t} y1={1470} y0={1860} rows={4} shirts={shirts} scarves={scarves} seed={63} size0={30} size1={46} backdrop="#0C0A14" back dim={0.25 + 0.2 * dim} />
        </g>
        <g transform={L(1.6)}>
          <NearMotes id="mi-near" t={t} color="#D8D8F0" n={5} r0={50} r1={130} y0={900} y1={1900} opacity={0.08} />
        </g>
      </g>
      <rect width="1080" height="1920" fill="#05060C" opacity={0.18 * dim} />
      <Finish id="mi" tint="#1A1830" tintOpacity={0.14} />
    </svg>
  );
};
