import React from 'react';
import { clamp01, eio, eo, lerp, seg } from '../../lib/anim';
import { NearMotes } from '../../lib/elements';
import { SANS } from '../../lib/fonts';
import { Finish, FxDefs } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { Americana, Asta, Cavi, Faro, Foschia, K, ORO, Parete, Pavimento, RiflessoAsta, Spia, TalentDefs, TINTA, Torre } from './Studio';
import { CONCORRENTI, GIUDICI, LIVE, stato } from './x-factor-2026';

// Le quattro squadre sul palco largo (riusabile in ogni episodio, TALENT.md): quattro pedane, una per giudice, con le
// aste dei concorrenti nello stato «dopo il Live n» (accese = in gara, spente e barrate = fuori). La camera scorre da una
// squadra all'altra sulla frase che la nomina (frase i → squadra i) e alla fine si allarga sul palco intero.
// Le aste della squadra si accendono una alla volta mentre la voce dice i nomi.
// Piani: parete di led (0,35) · palco, pedane e aste (1) · spie e cavi in primo piano (1,3) · particelle (1,7)

const PASSO = 1000; // distanza tra le pedane nel mondo
const SP = 300; // distanza tra le aste della stessa pedana

export const makeSquadre = (opz: { dopoLive: number; id?: string; allarga?: number }) => {
  const { dopoLive, id = 'sq', allarga = 0 } = opz;
  const squadre = GIUDICI.map((g) => ({ g, aste: CONCORRENTI.filter((c) => c.squadra === g.id && stato(c, dopoLive) !== 'assente') }));
  const larg = (GIUDICI.length - 1) * PASSO;

  const Scena: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
    // camera: centro sulla squadra della frase, poi si allarga
    const tappe = cues.map((c) => griglia(c) - 0.25);
    let cx = 0;
    for (let i = 0; i < GIUDICI.length; i++) cx = i === 0 ? 0 : lerp(cx, i * PASSO, eio(seg(t, tappe[i] - 0.15, tappe[i] + 0.55)));
    const tFine = dur - allarga - 0.2;
    const out = allarga > 0 ? eio(seg(t, tFine, tFine + allarga * 0.8)) : 0;
    cx = lerp(cx, larg / 2, out);
    const zoom = lerp(1.0 + 0.04 * seg(t, 0, dur), 0.3, out);
    const drift = Math.sin(t * 0.4) * 14;
    const X = (f: number) => `translate(${(540 - (cx + drift) * f).toFixed(1)} 0)`;
    const cam = `translate(540 1000) scale(${zoom}) translate(-540 -1000)`;
    const accesa = (i: number, k: number) => eo(seg(t, griglia(cues[i] + 0.9 + k * 0.95), griglia(cues[i] + 0.9 + k * 0.95) + 0.35));
    const squadraOn = (i: number) => eo(seg(t, tappe[i], tappe[i] + 0.6));
    const colori = GIUDICI.map((g) => g.colore);

    return (
      <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <FxDefs id={id} />
          <TalentDefs id={id} />
        </defs>
        <g transform={cam}>
          {/* PIANO 0 — parete di led lunga quanto il palco (si muove più piano) */}
          <g transform={X(0.35)}>
            <Parete id={id} t={t} x0={-1600} x1={larg + 1600} top={640} bottom={1010} colori={colori} luce={0.9} />
            <Americana id={id} t={t} y={110} x0={-2400} x1={larg + 2400} colori={['#FFF2D0', '#C8B8FF']} />
          </g>
          {/* PIANO 1 — palco, pedane, aste */}
          <g transform={X(1)}>
            <Pavimento id={id} t={t} y={1010} x0={-1600} x1={larg + 1600} bordo={1560} colori={colori} />
            {squadre.map(({ g, aste }, i) => {
              const px = i * PASSO;
              const on = squadraOn(i);
              return (
                <g key={g.id}>
                  {/* pedana con il nome della squadra sul fronte */}
                  <path d={`M${px - 470} 1150 L${px - 440} 1110 H${px + 440} L${px + 470} 1150 Z`} fill="#241C3A" stroke={K} strokeWidth="7" />
                  <rect x={px - 470} y="1150" width="940" height="140" fill="#120E1E" stroke={K} strokeWidth="7" />
                  {[-1, 1].map((sx) => <path key={sx} d={`M${px + sx * 455} 1166 V1278`} stroke="#2A2240" strokeWidth="5" />)}
                  <rect x={px - 470} y="1150" width="940" height="10" fill={g.colore} opacity={0.35 + 0.65 * on} />
                  <text x={px} y="1272" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="34" letterSpacing="8" fill={g.colore} opacity={0.5 + 0.5 * on}>
                    SQUADRA {g.corto.toUpperCase()}
                  </text>
                  <Faro id={`${id}-fs${i}`} t={t} x={px} y={1120} da={{ x: px - 520, y: 660 }} colore={g.colore} o={0.25 + 0.6 * on} largo={420} />
                  {aste.map((c, k) => {
                    const x = px + (k - (aste.length - 1) / 2) * SP;
                    const fuori = stato(c, dopoLive) === 'fuori';
                    const luce = fuori ? 0 : lerp(0.18, 1, accesa(i, k));
                    return (
                      <g key={c.id}>
                        <RiflessoAsta t={t} x={x} y={1118} s={0.56} colore={g.colore} o={luce} />
                        <Asta id={id} t={t} x={x} y={1112} s={0.56} nome={c.nome} colore={g.colore} luce={luce} fuori={fuori ? 1 : 0}
                          nota={fuori ? `FUORI · LIVE ${c.fuori}` : c.entra ? 'RIPESCATO' : undefined} band={c.band} pass={c.entra && !fuori ? 1 : 0} ph={k + i} w={310} />
                      </g>
                    );
                  })}
                </g>
              );
            })}
            <Foschia id={`${id}-fo`} t={t} x={cx} y={1130} o={0.9} />
          </g>
          {/* PIANO 2 — spie e cavi in primo piano */}
          <g transform={X(1.3)}>
            {Array.from({ length: 6 }, (_, k) => (
              <Spia key={k} id={id} x={-400 + k * 900} y={1880} s={1.2} colore={colori[k % 4]} flip={k % 2 === 1} />
            ))}
            <g transform={`translate(${cx * 1.3 - 540} 0)`}><Cavi y={1760} /></g>
            <Torre id={id} t={t} x={-560} y={1000} h={800} colori={[ORO, '#C8B8FF', '#FFF2D0']} />
            <Torre id={id} t={t} x={larg * 1.3 + 560} y={1000} h={800} colori={['#FFF2D0', '#C8B8FF', ORO]} flip />
          </g>
          <g>
            <NearMotes id={`${id}-near`} t={t} color="#E8DCFF" n={6} r0={60} r1={140} opacity={0.1 * (1 - clamp01(out))} />
          </g>
        </g>
        <Finish id={id} tint={TINTA} tintOpacity={0.12} />
      </svg>
    );
  };
  return Scena;
};

export { LIVE };
