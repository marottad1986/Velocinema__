import React from 'react';
import { camera, eio, eo, lerp, seg } from '../../lib/anim';
import { NearMotes } from '../../lib/elements';
import { SANS } from '../../lib/fonts';
import { Finish, FxDefs } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { Americana, Asta, Faro, Foschia, K, Lampada, ORO, Parete, Pavimento, RiflessoAsta, Spia, Cavi, TalentDefs, Telefono, TINTA, Torre } from '../talent/Studio';
import { GIUDICI } from '../talent/x-factor-2026';

// Come funziona una serata dal vivo? Sei aste senza nome in due gruppi (i due turni) sul fondo del palco. Eventi: frase 1
// si accende il primo turno e poi il secondo («TURNO 1», «TURNO 2» sulla parete); frase 2 al centro sale il telefono del
// televoto, le barre crescono e la più corta di ogni turno lampeggia: quelle due aste si colorano di rosso; frase 3 il
// telefono scende e le due aste scivolano avanti sotto due fasci rossi (il ballottaggio); frase 4 le quattro lampade dei
// giudici si accendono: tre puntano la stessa asta, che si spegne.
// Piani: parete di led e americana (0,25) · palco con le aste (0,55) · lampade dei giudici (0,9) · telefono (1,1) · particelle (1,7)

const NEUTRO = '#C8B8FF';
const ROSSO = '#FF4A5A';
const FONDO = [150, 285, 420, 660, 795, 930];
const SCELTE = [1, 4]; // le meno votate di ogni turno
const DAVANTI = [370, 728];
const LX = [150, 285, 795, 930];

export const RegoleLive: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const t1 = griglia(cues[0] + 0.3);
  const turno1 = eo(seg(t, t1, t1 + 0.5));
  const turno2 = eo(seg(t, t1 + 1.5, t1 + 2.0));
  const tTel = griglia(cues[1] + 0.1);
  const tel = eo(seg(t, tTel, tTel + 0.5)) * (1 - eio(seg(t, griglia(cues[2]) - 0.1, griglia(cues[2]) + 0.4)));
  const barre = eo(seg(t, tTel + 0.4, tTel + 1.6));
  const segno = seg(t, tTel + 1.5, tTel + 1.8);
  const tAv = griglia(cues[2] + 0.2);
  const avanti = eio(seg(t, tAv, tAv + 1.0));
  const tVoto = griglia(cues[3] + 0.1);
  const voti = GIUDICI.map((_, i) => eo(seg(t, tVoto + i * 0.25, tVoto + i * 0.25 + 0.35)));
  const spegne = eo(seg(t, tVoto + 1.5, tVoto + 2.0));
  const BAR = [[0.8, 0.45, 0.66], [0.72, 0.4, 0.86]];

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="rl" />
        <TalentDefs id="rl" />
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — parete di led con i due turni e americana */}
        <g transform={L(0.25)}>
          <Parete id="rl" t={t} top={640} bottom={990} colori={['#6A4AC8', '#3A2C8A', '#8A5AE8']} luce={0.5 + 0.5 * Math.max(turno1, turno2)} />
          <Americana id="rl" t={t} y={110} colori={['#FFF2D0', '#C8B8FF']} />
          {[['TURNO 1', 285, turno1], ['TURNO 2', 795, turno2]].map(([s, x, o]) => (
            <text key={s as string} x={x as number} y={712} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="42" letterSpacing="8" fill="#F6F2EA" opacity={0.25 + 0.75 * (o as number)}>
              {s}
            </text>
          ))}
          <Torre id="rl" t={t} x={-10} y={640} colori={[ORO, NEUTRO, '#FFF2D0']} />
          <Torre id="rl" t={t} x={1090} y={640} colori={['#FFF2D0', NEUTRO, ORO]} flip />
        </g>

        {/* PIANO 1 — il palco con le sei aste; le due meno votate scivolano avanti */}
        <g transform={L(0.55)}>
          <Pavimento id="rl" t={t} y={990} bordo={1560} colori={[NEUTRO, '#8A5AE8']} />
          {SCELTE.map((k, j) => (
            <Faro key={j} id={`rl-fr${j}`} t={t} x={DAVANTI[j]} y={1160} da={{ x: j === 0 ? 0 : 1080, y: 690 }} colore={ROSSO} o={avanti * (j === 1 ? 1 - 0.7 * spegne : 1)} largo={240} />
          ))}
          {FONDO.map((x0, k) => {
            const j = SCELTE.indexOf(k);
            const acc = k < 3 ? turno1 : turno2;
            const x = j >= 0 ? lerp(x0, DAVANTI[j], avanti) : x0;
            const y = j >= 0 ? lerp(1040, 1160, avanti) : 1040;
            const sc = j >= 0 ? lerp(0.34, 0.44, avanti) : 0.34;
            const rosso = j >= 0 ? segno : 0;
            const fuori = j === 1 ? spegne : 0;
            const luce = lerp(0.2, 1, acc) * (j < 0 ? 1 - 0.8 * avanti : 1);
            return (
              <g key={k}>
                <RiflessoAsta t={t} x={x} y={y + 4} s={sc} colore={rosso > 0.5 ? ROSSO : NEUTRO} o={luce} />
                <Asta id="rl" t={t} x={x} y={y} s={sc} colore={rosso > 0.5 ? ROSSO : NEUTRO} luce={luce} fuori={fuori} cartellino={false} ph={k} />
              </g>
            );
          })}
          {/* conteggio dei voti dei giudici sulle due aste del ballottaggio */}
          <Foschia id="rl-fo" t={t} y={1120} />
        </g>

        {/* PIANO 2 — le quattro lampade dei giudici sul bordo del palco */}
        <g transform={L(0.9)}>
          <rect x="-200" y="1300" width="1480" height="40" fill="#120E1E" stroke={K} strokeWidth="6" />
          {GIUDICI.map((g, i) => (
            <Lampada key={g.id} id="rl" t={t} x={LX[i]} y={1300} s={0.55} colore={g.colore}
              mira={{ x: DAVANTI[i === 0 ? 0 : 1], y: 880 }} voto={voti[i]} />
          ))}
          {[0, 1].map((j) => {
            const n = j === 0 ? (voti[0] > 0.5 ? 1 : 0) : [1, 2, 3].filter((i) => voti[i] > 0.5).length;
            const o = j === 0 ? voti[0] : voti[1];
            return (
              <g key={j} opacity={o}>
                <rect x={DAVANTI[j] - 95} y={1150} width="190" height="58" rx="29" fill={j === 1 ? ROSSO : '#2A2440'} stroke={K} strokeWidth="5" />
                <text x={DAVANTI[j]} y={1191} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="34" fill="#F6F2EA">
                  {Math.max(1, n)} {Math.max(1, n) === 1 ? 'VOTO' : 'VOTI'}
                </text>
              </g>
            );
          })}
          <Cavi y={1840} />
          <Spia id="rl" x={120} y={1760} s={1.1} colore={NEUTRO} />
          <Spia id="rl" x={960} y={1760} s={1.1} colore={NEUTRO} flip />
        </g>

        {/* PIANO 3 — il telefono del televoto che sale al centro */}
        <g transform={L(1.1)}>
          {tel > 0.01 && (
            <g opacity={tel} transform={`translate(0 ${(1 - tel) * 300})`}>
              <Telefono id="rl" t={t} x={540} y={1010} s={0.52} rot={-4}
                barre={[0, 1, 2, 3, 4, 5].map((k) => ({ v: BAR[k < 3 ? 0 : 1][k % 3] * barre, colore: k < 3 ? '#8A6AE8' : '#B89AFF', segno: SCELTE.includes(k) ? segno : 0 }))} />
            </g>
          )}
        </g>
        <g transform={L(1.7)}>
          <NearMotes id="rl-near" t={t} color="#E8DCFF" n={6} r0={60} r1={140} opacity={0.1} />
        </g>
      </g>
      <Finish id="rl" tint={TINTA} tintOpacity={0.12} />
    </svg>
  );
};
