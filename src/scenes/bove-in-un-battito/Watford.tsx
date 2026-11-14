import React from 'react';
import { camera, eo, eob, lerp, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Beam, Glow, NearMotes, flashAt } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { Crowd, Drizzle, K, Pitch, Scoreboard, WATFORD } from './Comuni';

// Di nuovo in campo, in Inghilterra: uno stadio inglese inventato, la sera, sotto una pioggerella. Dal bordo campo
// guardiamo la tribuna vicina e piena, con il settore giallo, nero e rosso; seggiolini ribaltabili e sciarpe sulle
// balaustre, nessuno stemma. f1 «firma con il Watford»: il tabellone scrive «WATFORD». f2 «Il 14 febbraio entra in campo
// all'ottantaseiesimo»: il tabellone segna 86', tutta la tribuna si alza in piedi insieme (i seggiolini si ribaltano),
// sciarpe in alto e flash dei telefoni. Nessun calciatore disegnato.
// Piani: tetto e fari (0,2) · tribuna (0,45) · balaustra e cartelloni (0,6) · prato (0,8) · bandierina e pioggia vicina (1,2)

export const Watford: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur, 540, 1050);
  const L = cam.layer;
  const tName = griglia(cues[0] + 3.0);
  const name = eo(seg(t, tName, tName + 0.4));
  const t86 = griglia(cues[1] + 1.6);
  const up = eob(seg(t, t86 + 0.2, t86 + 0.9), 1.4);
  const cheer = seg(t, t86 + 0.4, t86 + 1.2);
  const flash = flashAt(t, [t86 + 0.6]);
  const shirts = [WATFORD.giallo, WATFORD.giallo, WATFORD.nero, WATFORD.rosso, '#F2EEE6', '#1E2A5A', '#2A2A34'];
  const scarves = [[WATFORD.giallo, WATFORD.nero, WATFORD.rosso], [WATFORD.nero, WATFORD.giallo]];

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="wa" />
        <Lin id="wa-sky" stops={[[0, '#0E1220'], [0.6, '#2A3048'], [1, '#4A4A5A']]} />
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — cielo grigio di sera, copertura e fari (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="1200" fill="url(#wa-sky)" />
          <path d="M-200 600 L1280 580 V660 L-200 680 Z" fill="#0A0C14" />
          <path d="M-200 600 L1280 580" stroke="#8A90A8" strokeWidth="4" opacity=".5" />
          {/* travi a traliccio sotto la copertura */}
          {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${-180 + i * 130} 680 l65 -90 l65 90`} stroke="#1E2230" strokeWidth="6" fill="none" />)}
          {Array.from({ length: 8 }, (_, i) => {
            const x = -40 + i * 165, y = 664 - i * 2.5;
            return (
              <g key={i}>
                <Glow id={`wa-l${i}`} x={x} y={y} r={110} t={t} color="#F4F8FF" amp={0.04} rate={2.6} ph={i} opacity={0.8} />
                <rect x={x - 32} y={y - 12} width="64" height="24" rx="5" fill="#F8FBFF" stroke={K} strokeWidth="4" />
              </g>
            );
          })}
        </g>
        {/* PIANO 1 — la tribuna vicina: file di seggiolini e tifosi che si alzano insieme (0,45) */}
        <g transform={L(0.45)}>
          <rect x="-200" y="676" width="1480" height="560" fill="#141420" />
          {/* file di seggiolini: schienali sempre visibili, sedute che si ribaltano quando ci si alza */}
          {Array.from({ length: 9 }, (_, i) => {
            const y = 720 + i * 56 + i * i * 1.2, s = 1 + i * 0.12;
            const n = Math.ceil(1500 / (46 * s));
            return (
              <g key={i}>
                {Array.from({ length: n }, (_, k) => {
                  const x = -200 + k * 46 * s + (i % 2) * 20;
                  const sec = x > 380 && x < 880; // settore ospiti giallo-nero
                  const c = sec ? (k % 5 === 0 ? WATFORD.rosso : WATFORD.giallo) : '#2A3A6A';
                  return (
                    <g key={k}>
                      <rect x={x} y={y + 6 * s} width={34 * s} height={22 * s} rx={4} fill={c} stroke={K} strokeWidth={2 + s} opacity={0.9} />
                      <rect x={x + 2 * s} y={y + lerp(30, 26, up) * s} width={30 * s} height={lerp(8, 18, up) * s} rx={3} fill={c} stroke={K} strokeWidth={2} opacity={0.85} />
                    </g>
                  );
                })}
              </g>
            );
          })}
          <Crowd t={t} y1={712} y0={1170} rows={9} shirts={shirts} scarves={scarves} seed={77} size0={11} size1={22} stand={lerp(0.25, 1, up)} bounce={0.5 * cheer} scarfUp={lerp(0.2, 1, up)} flashes={cheer} backdrop="transparent" />
          {/* sciarpe appese alle balaustre tra un settore e l'altro */}
          {[[120, 940], [560, 1000], [900, 960]].map(([x, y], i) => (
            <g key={i}>
              <rect x={x} y={y} width="160" height="26" fill={WATFORD.giallo} stroke={K} strokeWidth="4" />
              <rect x={x + 30} y={y} width="20" height="26" fill={WATFORD.nero} /><rect x={x + 80} y={y} width="20" height="26" fill={WATFORD.rosso} /><rect x={x + 120} y={y} width="20" height="26" fill={WATFORD.nero} />
            </g>
          ))}
        </g>
        {/* PIANO 2 — balaustra, cartelloni (fasce di colore) e il tabellone a sinistra (0,6) */}
        <g transform={L(0.6)}>
          <rect x="-200" y="1200" width="1480" height="24" fill="#2A2C38" stroke={K} strokeWidth="6" />
          <path d="M-200 1202 H1280" stroke="#C8CCD8" strokeWidth="3" opacity=".5" />
          <rect x="-200" y="1226" width="1480" height="44" fill="#14141C" />
          {Array.from({ length: 8 }, (_, i) => <rect key={i} x={-190 + i * 190} y="1230" width="182" height="36" fill={i % 2 ? WATFORD.nero : '#C8A814'} opacity=".95" />)}
          <g transform={`translate(800 760) scale(${lerp(0.92, 1, eob(seg(t, t86, t86 + 0.4), 2))}) translate(-800 -760)`}>
            <Glow id="wa-sbg" x={800} y={760} r={230} t={t} color="#FFE6A0" amp={0.05} rate={3} opacity={0.3 + 0.4 * cheer} />
            <Scoreboard id="wa-sb" x={650} y={694} w={300} h={130} t={t} on={0.4 + 0.6 * Math.max(name, cheer)}
              lines={t >= t86 ? [{ text: "86'", size: 64 }, { text: '14 FEBBRAIO 2026', size: 20, color: '#F2EEE6' }] : [{ text: 'WATFORD', size: 48, color: WATFORD.giallo }, { text: 'GENNAIO 2026', size: 20, color: '#F2EEE6' }]} />
          </g>
        </g>
        {/* PIANO 3 — il prato bagnato, i fasci dei fari con la pioggerella (0,8) */}
        <g transform={L(0.8)}>
          <Pitch id="wa-p" y0={1270} light="#3A7A3A" dark="#2E6A30" x0={-500} x1={1580} lineOpacity={0.6} />
          <path d="M-200 1300 H1280" stroke="#F4F6EC" strokeWidth="9" opacity=".75" />
          <rect x="-200" y="1272" width="1480" height="200" fill="#B8C8E0" opacity=".08" />
          <Beam id="wa-b1" x={100} y={660} t={t} length={900} spread={420} color="#E8F0FF" angle={70} opacity={0.12} />
          <Beam id="wa-b2" x={980} y={660} t={t} length={900} spread={420} color="#E8F0FF" angle={110} opacity={0.12} />
        </g>
        {/* PIANO 4 — bandierina del calcio d'angolo e pioggia vicina (1,2) */}
        <g transform={L(1.2)}>
          <g transform="translate(990 1800) scale(-1 1)">
            <ellipse cx="0" cy="6" rx="60" ry="12" fill="#000" opacity=".35" />
            <rect x="-6" y="-360" width="12" height="366" fill="#F2F2F6" stroke={K} strokeWidth="4" />
            <path d={`M6 -356 Q${70 + Math.sin(t * 4) * 10} ${-340 + Math.sin(t * 3) * 8} ${120 + Math.sin(t * 4) * 14} -320 L${110 + Math.sin(t * 4) * 12} -270 Q${60 + Math.sin(t * 4 + 1) * 10} -290 6 -290 Z`} fill={WATFORD.giallo} stroke={K} strokeWidth="5" />
          </g>
          <Drizzle t={t} seed={4} n={60} color="#D8E4F4" opacity={0.4} len={34} speed={1100} />
        </g>
        <g transform={L(1.6)}>
          <Drizzle t={t} seed={9} n={30} color="#E8F0FF" opacity={0.25} len={60} speed={1600} />
          <NearMotes id="wa-near" t={t} color="#E8F0FF" n={5} r0={50} r1={130} y0={900} y1={1900} opacity={0.08} />
        </g>
      </g>
      <rect width="1080" height="1920" fill="#FFFFFF" opacity={0.22 * flash} />
      <Finish id="wa" tint="#1E2448" tintOpacity={0.1} />
    </svg>
  );
};
