import React from 'react';
import { camera, eo, eob, lerp, seg } from '../../lib/anim';
import { Glow, NearMotes } from '../../lib/elements';
import { SANS } from '../../lib/fonts';
import { Finish, FxDefs } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { Americana, Cartellino, Faro, Foschia, K, ORO, Parete, Pavimento, Platea, Sedia, Spia, Cavi, TalentDefs, TINTA, Torre } from '../talent/Studio';
import { GIUDICI } from '../talent/x-factor-2026';

// Come si entra in gara? Il tavolo dei giudici visto dal palco: quattro postazioni con il cartellino del nome, un grande
// pulsante «SÌ» e due palette (verde e rossa); davanti, sul palco, le tre sedie della Last Call. Eventi: frase 1 (audizioni)
// si accendono tre «SÌ» su quattro e la striscia dice «3 SÌ SU 4»; frase 2 (Bootcamp) si alzano tutte e quattro le palette
// verdi, «4 SÌ SU 4»; frase 3 le tre sedie si accendono sotto i fari; frase 4 sulla striscia «12 AI LIVE» in oro.
// Piani: parete e platea dietro il tavolo (0,25) · poltrone dei giudici (0,4) · tavolo (0,55) · palco con le sedie (0,8)
//        · bordo del palco e spie (1,2) · particelle (1,7)

const XS = [195, 425, 655, 885];
const VERDE = '#5AD27A';

const Striscia: React.FC<{ t: number; testo: string; oro?: boolean; o: number }> = ({ t, testo, oro, o }) => (
  <g opacity={o}>
    <text x="540" y="964" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="50" letterSpacing="10" fill={oro ? ORO : VERDE} opacity={0.85 + 0.15 * Math.sin(t * 6)}>
      {testo}
    </text>
  </g>
);

export const Selezioni: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const tA = griglia(cues[0] + 0.6);
  const si = GIUDICI.map((_, i) => (i < 3 ? eo(seg(t, tA + i * 0.25, tA + i * 0.25 + 0.3)) : 0));
  const tB = griglia(cues[1] + 0.5);
  const palette = GIUDICI.map((_, i) => eob(seg(t, tB + i * 0.18, tB + i * 0.18 + 0.4), 1.6));
  const siB = eo(seg(t, tB, tB + 0.3));
  const tC = griglia(cues[2] + 0.6);
  const sedie = [0, 1, 2].map((k) => eo(seg(t, tC + k * 0.5, tC + k * 0.5 + 0.5)));
  const tD = griglia(cues[3] + 0.4);
  const dodici = eo(seg(t, tD, tD + 0.4));
  // la striscia del tavolo: 3 SU 4 → 4 SU 4 → 12 AI LIVE
  const s1 = seg(t, tA + 0.5, tA + 0.8) * (1 - seg(t, tB - 0.2, tB));
  const s2 = seg(t, tB + 0.6, tB + 0.9) * (1 - seg(t, tD - 0.2, tD));

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="sl" />
        <TalentDefs id="sl" />
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — fondo della sala dietro il tavolo: parete di led bassa e platea vuota */}
        <g transform={L(0.25)}>
          <Parete id="sl" t={t} top={600} bottom={760} colori={['#6A4AC8', '#3A2C8A', '#8A5AE8']} luce={0.7} />
          <Americana id="sl" t={t} y={110} colori={['#FFF2D0', '#C8B8FF']} />
          <Platea id="sl" t={t} y={830} file={1} colore="#1E0E24" luce="#7A5AC8" />
        </g>

        {/* PIANO 1 — le quattro poltrone dei giudici dietro il tavolo, viste di fronte */}
        <g transform={L(0.4, 0, 90)}>
          {GIUDICI.map((g, i) => (
            <g key={g.id} transform={`translate(${XS[i]} 800) scale(0.5)`}>
              <Glow id={`sl-pg${i}`} x={0} y={-220} r={260} t={t} color={g.colore} amp={0.05} rate={1.6} ph={i} opacity={0.35 + 0.3 * Math.max(si[i], siB)} />
              <path d="M-150 0 Q-170 -300 -120 -400 Q0 -450 120 -400 Q170 -300 150 0 Z" fill="#1E1630" stroke={K} strokeWidth="10" />
              <path d="M-110 -40 Q-124 -280 -86 -360 Q0 -396 86 -360 Q124 -280 110 -40 Z" fill={g.scuro} opacity=".85" />
              {[-60, 0, 60].map((kx) => <path key={kx} d={`M${kx} -350 V-60`} stroke={K} strokeWidth="5" opacity=".5" />)}
              <path d="M-120 -400 Q0 -450 120 -400" stroke={g.colore} strokeWidth="9" fill="none" strokeLinecap="round" />
            </g>
          ))}
        </g>

        {/* PIANO 2 — il tavolo dei giudici con pulsanti, palette e cartellini */}
        <g transform={L(0.55, 0, 90)}>
          {/* piano del tavolo */}
          <path d="M40 760 H1040 L1070 800 H10 Z" fill="#3A2E52" stroke={K} strokeWidth="8" />
          <path d="M44 764 H1036" stroke={ORO} strokeWidth="3" opacity=".6" />
          {/* fronte del tavolo */}
          <rect x="10" y="800" width="1060" height="200" fill="url(#sl-desk)" stroke={K} strokeWidth="9" />
          <rect x="60" y="912" width="960" height="70" rx="12" fill="#06040C" stroke="#2A2244" strokeWidth="5" />
          {Array.from({ length: 48 }, (_, i) => <circle key={i} cx={80 + i * 19.6} cy={947} r="2.2" fill="#2A2244" />)}
          <Striscia t={t} testo="3 SÌ SU 4" o={s1} />
          <Striscia t={t} testo="4 SÌ SU 4" o={s2} />
          <Striscia t={t} testo="12 AI LIVE" oro o={dodici} />
          {GIUDICI.map((g, i) => {
            const on = Math.max(si[i], siB);
            const pal = palette[i];
            return (
              <g key={g.id}>
                {/* pulsante del sì */}
                <ellipse cx={XS[i] - 30} cy={772} rx="54" ry="15" fill="#120E1A" stroke={K} strokeWidth="5" />
                <ellipse cx={XS[i] - 30} cy={764} rx="46" ry="13" fill={on > 0.5 ? VERDE : '#3A3446'} stroke={K} strokeWidth="5" />
                <text x={XS[i] - 30} y={770} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="20" fill={K}>SÌ</text>
                {on > 0.01 && <Glow id={`sl-si${i}`} x={XS[i] - 30} y={760} r={110} t={t} color={VERDE} amp={0.1} rate={5} opacity={0.7 * on} />}
                {/* palette: verde (sì) che si alza, rossa (no) ferma */}
                <g transform={`translate(${XS[i] + 62} 770)`}>
                  <path d="M16 0 V-70" stroke="#C8B89A" strokeWidth="8" />
                  <circle cx="16" cy="-92" r="26" fill="#E8505B" stroke={K} strokeWidth="6" />
                  <g transform={`translate(-14 ${-lerp(0, 90, pal)}) rotate(${lerp(14, -6, pal)})`}>
                    <path d="M0 0 V-80" stroke="#C8B89A" strokeWidth="8" />
                    <circle cx="0" cy="-104" r="32" fill={VERDE} stroke={K} strokeWidth="6" />
                    <path d="M-12 -104 l9 10 l16 -20" stroke={K} strokeWidth="7" fill="none" strokeLinecap="round" />
                  </g>
                </g>
                <Cartellino x={XS[i]} y={820} nome={g.nome} colore={g.colore} s={0.7} w={300} />
              </g>
            );
          })}
        </g>

        {/* PIANO 3 — il palco davanti al tavolo con le tre sedie della Last Call */}
        <g transform={L(0.8)}>
          <Pavimento id="sl" t={t} y={1100} x0={-300} x1={1380} bordo={1720} colori={GIUDICI.map((g) => g.colore)} />
          {[300, 540, 780].map((x, k) => (
            <g key={k}>
              <Faro id={`sl-f${k}`} t={t} x={x} y={1262} da={{ x: k === 0 ? -20 : k === 1 ? 540 : 1100, y: k === 1 ? 640 : 700 }} colore="#FFF2D0" o={sedie[k]} largo={190} />
              <Sedia id="sl" t={t} x={x} y={1262} s={0.4} luce={sedie[k]} />
            </g>
          ))}
          <Foschia id="sl-fo" t={t} y={1230} o={0.8} />
        </g>

        {/* PIANO 4 — torri di luce ai lati e particelle */}
        <g transform={L(1.2)}>
          <Spia id="sl" x={230} y={1900} s={1.3} colore={ORO} />
          <Spia id="sl" x={860} y={1900} s={1.3} colore={ORO} flip />
          <Cavi y={1800} />
          <Torre id="sl" t={t} x={-30} y={1060} h={700} colori={[ORO, '#C8B8FF', '#FFF2D0']} />
          <Torre id="sl" t={t} x={1110} y={1060} h={700} colori={['#FFF2D0', '#C8B8FF', ORO]} flip />
        </g>
        <g transform={L(1.7)}>
          <NearMotes id="sl-near" t={t} color="#E8DCFF" n={6} r0={60} r1={140} opacity={0.1} />
        </g>
      </g>
      <Finish id="sl" tint={TINTA} tintOpacity={0.12} />
    </svg>
  );
};
