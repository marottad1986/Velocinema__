import React from 'react';
import { camera, eo, eob, lerp, seg } from '../../lib/anim';
import { NearMotes } from '../../lib/elements';
import { Finish, FxDefs } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { Americana, Asta, Cartellino, Faro, Foschia, ORO, Parete, Pavimento, Platea, Poltrona, RiflessoAsta, TalentDefs, Spia, TINTA, Torre } from '../talent/Studio';
import { GIUDICI } from '../talent/x-factor-2026';

// Che cos'è X Factor? Lo studio visto dal fondo: in mezzo, di spalle, il tavolo dei giudici con quattro poltrone vuote;
// oltre il tavolo il palco con il microfono dorato della conduttrice. Eventi: frase 1 si accende il palco (fari, parete
// di led); frase 2 il microfono dorato col cartellino «GIORGIA · CONDUCE»; frase 3 le quattro poltrone si accendono una
// alla volta con il nome sullo schienale; frase 4 da ogni poltrona parte un fascio colorato verso il palco (le squadre).
// Piani: parete di led e americana (0,25) · palco e microfono (0,45) · tavolo e poltrone (0,7) · telecamera e spia (1,2) · particelle (1,7)

const COLORI = GIUDICI.map((g) => g.colore);
const XS = [180, 420, 660, 900];

export const ComeFunziona: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const accende = eo(seg(t, griglia(cues[0] + 0.1), griglia(cues[0] + 0.1) + 0.8));
  const tHost = griglia(cues[1] + 0.3);
  const host = eo(seg(t, tHost, tHost + 0.5));
  const tChairs = cues[2];
  const sedia = GIUDICI.map((_, i) => eob(seg(t, griglia(tChairs + 0.25 + i * 0.75), griglia(tChairs + 0.25 + i * 0.75) + 0.4), 1.4));
  const tTeams = griglia(cues[3] + 0.2);
  const squadre = GIUDICI.map((_, i) => eo(seg(t, tTeams + i * 0.25, tTeams + i * 0.25 + 0.6)));
  const luce = lerp(0.35, 1, accende);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="cf" />
        <TalentDefs id="cf" />
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — parete di led e americana con i fari */}
        <g transform={L(0.25)}>
          <Parete id="cf" t={t} top={650} bottom={990} colori={squadre.some((q) => q > 0) ? COLORI : ['#6A4AC8', '#3A2C8A', '#8A5AE8']} luce={luce} />
          <Americana id="cf" t={t} y={110} colori={['#FFF2D0', '#C8B8FF']} />
          <Torre id="cf" t={t} x={-10} y={620} colori={[ORO, '#C8B8FF', '#FFF2D0']} />
          <Torre id="cf" t={t} x={1090} y={620} colori={['#FFF2D0', '#C8B8FF', ORO]} flip />
        </g>

        {/* PIANO 1 — il palco con il microfono della conduttrice */}
        <g transform={L(0.45)}>
          <Pavimento id="cf" t={t} y={990} bordo={1110} colori={COLORI} />
          {/* scalinata al centro del fondale */}
          <path d="M330 990 L360 950 H720 L750 990 Z" fill="#1C1630" stroke="#07050C" strokeWidth="5" />
          <path d="M360 950 L385 915 H695 L720 950 Z" fill="#241C3C" stroke="#07050C" strokeWidth="5" />
          <path d="M362 952 H718 M387 917 H693" stroke={ORO} strokeWidth="3" opacity={0.3 + 0.5 * luce} />
          <Faro id="cf-f0" t={t} x={540} y={1010} da={{ x: 1060, y: 700 }} colore="#FFF2D0" o={0.25 + 0.75 * accende} largo={240} />
          <Faro id="cf-fh" t={t} x={540} y={1010} da={{ x: 20, y: 700 }} colore={ORO} o={host} largo={200} polvere={false} />
          <RiflessoAsta t={t} x={540} y={1012} s={0.42} colore={ORO} o={host} />
          <Asta id="cf" t={t} x={540} y={1010} s={0.42} colore={ORO} oro luce={0.4 + 0.6 * host} cartellino={false} />
          <Cartellino x={540} y={1024} nome="GIORGIA" colore={ORO} oro nota="CONDUCE" s={0.62} w={260} o={host} />
          {/* fasci delle squadre: dalle poltrone verso il palco */}
          {GIUDICI.map((g, i) => (
            <Faro key={g.id} id={`cf-s${i}`} t={t} x={300 + i * 160} y={1050} da={{ x: XS[i], y: 1180 }} colore={g.colore} o={squadre[i]} largo={170} polvere={false} />
          ))}
          <Spia id="cf" x={300} y={1080} s={0.42} colore={ORO} />
          <Spia id="cf" x={780} y={1080} s={0.42} colore={ORO} flip />
          <Foschia id="cf-fo" t={t} y={1090} o={0.6 + 0.4 * accende} />
        </g>

        {/* PIANO 2 — il tavolo dei giudici e le quattro poltrone di spalle */}
        <g transform={L(0.7)}>
           <rect x="-200" y="1190" width="1480" height="60" rx="10" fill="url(#cf-desk)" stroke="#07050C" strokeWidth="8" />
          <path d="M-200 1194 H1280" stroke={ORO} strokeWidth="4" opacity={0.25 + 0.35 * luce} />
          {GIUDICI.map((g, i) => (
            <g key={g.id}>
              <Poltrona id="cf" t={t} x={XS[i]} y={1335} s={0.52} colore={g.colore} luce={sedia[i]} ph={i} />
              <Cartellino x={XS[i]} y={1165} nome={g.nome} colore={g.colore} s={0.62 + 0.08 * (1 - Math.min(1, sedia[i]))} w={300} o={Math.min(1, sedia[i])} />
            </g>
          ))}
          <rect x="-200" y="1335" width="1480" height="700" fill="#06040A" />
        </g>

        {/* PIANO 3 — telecamera e spia in primo piano */}
        <g transform={L(1.2)}>
          <Platea id="cf" t={t} y={1640} colore="#24102A" luce="#9A7AE8" />
        </g>
        <g transform={L(1.7)}>
          <NearMotes id="cf-near" t={t} color="#E8DCFF" n={6} r0={60} r1={140} opacity={0.1} />
        </g>
      </g>
      <Finish id="cf" tint={TINTA} tintOpacity={0.12} />
    </svg>
  );
};
