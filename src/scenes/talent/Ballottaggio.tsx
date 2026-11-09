import React from 'react';
import { camera, eo, lerp, mod, seg } from '../../lib/anim';
import { Glow, NearMotes } from '../../lib/elements';
import { SANS } from '../../lib/fonts';
import { Finish, FxDefs } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { Americana, Asta, Faro, Foschia, Gettone, K, Lampada, ORO, Parete, Pavimento, RiflessoAsta, Spia, Cavi, TalentDefs, TINTA, Torre } from './Studio';
import { CONCORRENTI, concorrente, GIUDICI, giudice, LIVE, type GiudiceId } from './x-factor-2026';

// Il ballottaggio di un Live (riusabile in ogni episodio, TALENT.md): le due aste meno votate sotto due fasci rossi, con
// il cartellino del nome nel colore della squadra; sul fondo, piccola, la pedana della squadra di chi esce (le sue aste
// accese) o un oggetto della serata (il jukebox delle serate di vecchie canzoni, il microfono dorato della conduttrice).
// Eventi agganciati alle frasi: frase 1 la data del Live sulla parete e i due fasci rossi; frase 2 si accendono le due
// aste con i nomi; frase 3 le lampade dei giudici si accendono una alla volta, puntano l'asta che vogliono far uscire e
// sopra quell'asta compare il gettone col nome del giudice; frase 4 l'asta eliminata si spegne («FUORI · LIVE n») e sulla
// pedana di fondo restano accese le aste rimaste.
// Piani: parete e americana (0,25) · pedana di fondo / jukebox (0,4) · palco e aste (0,6) · lampade dei giudici (0,9)
//        · spie in primo piano (1,2) · particelle (1,7)

const ROSSO = '#FF4A5A';
const XA = 350, XB = 730, YB = 1165, SB = 0.46;
const LX: Record<GiudiceId, number> = { gabbani: 100, jake: 180, paola: 900, irama: 980 };

/** Jukebox delle serate a tema: arco con i tubi di luce, la vetrina con i dischi che girano, la griglia dell'altoparlante. */
const Jukebox: React.FC<{ id: string; t: number; x: number; y: number; s?: number; on: number }> = ({ id, t, x, y, s = 1, on }) => {
  const hue = ['#FF7A66', ORO, '#A8E063', '#5CC8FF', '#E08CFF'];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <Glow id={`${id}-jg`} x={0} y={-260} r={360} t={t} color={ORO} amp={0.06} rate={2.4} opacity={0.2 + 0.5 * on} />
      <ellipse cx="0" cy="6" rx="190" ry="26" fill="#000" opacity=".6" />
      <path d="M-170 0 V-330 Q-170 -520 0 -530 Q170 -520 170 -330 V0 Z" fill="#3A1E2A" stroke={K} strokeWidth="10" />
      {/* tubi di luce lungo l'arco */}
      {[0, 1, 2].map((k) => (
        <path key={k} d={`M${-150 + k * 22} -10 V-330 Q${-150 + k * 22} ${-500 + k * 22} 0 ${-508 + k * 22} Q${150 - k * 22} ${-500 + k * 22} ${150 - k * 22} -330 V-10`}
          stroke={hue[(k + Math.floor(t * 2.5)) % hue.length]} strokeWidth="9" fill="none" opacity={0.3 + 0.7 * on} />
      ))}
      {/* vetrina con i dischi */}
      <path d="M-90 -300 Q-90 -420 0 -426 Q90 -420 90 -300 Z" fill="#120A18" stroke={K} strokeWidth="7" />
      {[-40, 0, 40].map((dx, k) => (
        <g key={k} transform={`translate(${dx} -330) rotate(${(t * 200 * on + k * 40) % 360})`}>
          <circle r="34" fill="#0A0810" stroke="#3A3446" strokeWidth="3" />
          <circle r="22" fill="none" stroke="#2A2632" strokeWidth="2" />
          <circle r="10" fill={hue[k + 1]} />
          <path d="M-30 0 H-12" stroke="#5A5668" strokeWidth="3" />
        </g>
      ))}
      <path d="M-80 -404 Q0 -416 40 -404" stroke="#FFFFFF" strokeWidth="5" opacity=".25" />
      {/* tastiera e griglia */}
      <rect x="-120" y="-280" width="240" height="40" rx="8" fill="#24141C" stroke={K} strokeWidth="5" />
      {Array.from({ length: 8 }, (_, i) => <rect key={i} x={-108 + i * 28} y="-270" width="20" height="20" rx="4" fill={i === Math.floor(mod(t * 1.5, 8)) ? ORO : '#C8B8A8'} />)}
      <rect x="-120" y="-220" width="240" height="190" rx="14" fill="#1A0E14" stroke={K} strokeWidth="6" />
      {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M-104 ${-200 + i * 26} H104`} stroke="#3A2630" strokeWidth="6" />)}
      <path d="M-170 -10 H170" stroke={ORO} strokeWidth="6" opacity={0.5 + 0.5 * on} />
    </g>
  );
};

export const makeBallottaggio = (opz: { live: number; id?: string; fondo?: 'squadra' | 'conduttrice' | 'jukebox'; jukebox?: boolean }) => {
  const { live, id = 'bl', fondo = 'squadra', jukebox } = opz;
  const L0 = LIVE[live];
  const [a, b] = L0.ballottaggio.map(concorrente);
  const out = concorrente(L0.fuori);
  const ordine = GIUDICI.map((g) => g.id);
  // squadra di chi esce: le altre aste (in gara prima di questo Live) sulla pedana di fondo
  const compagni = CONCORRENTI.filter((c) => c.squadra === out.squadra && c.id !== out.id && !c.escluso && (c.entra === undefined || c.entra <= live) && (c.fuori === undefined || c.fuori > live));
  const gs = giudice(out.squadra);

  const Scena: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
    const cam = camera(t, dur);
    const L = cam.layer;
    const tD = griglia(cues[0] + 0.2);
    const data = eo(seg(t, tD, tD + 0.5));
    const rossi = eo(seg(t, tD + 0.6, tD + 1.2));
    const tN = griglia(cues[1] + 0.1);
    const accA = eo(seg(t, tN, tN + 0.4));
    const accB = eo(seg(t, tN + 1.0, tN + 1.4));
    const tV = griglia(cues[2] + 0.3);
    const voti = ordine.map((_, i) => eo(seg(t, tV + i * 0.5, tV + i * 0.5 + 0.35)));
    const tF = griglia(cues[3] + 0.2);
    const spegne = eo(seg(t, tF, tF + 0.6));
    const restano = eo(seg(t, tF + 0.8, tF + 1.4));
    const xOf = (c: typeof a) => (c.id === a.id ? XA : XB);
    // gettoni: in fila sopra l'asta votata
    const perAsta: Record<string, GiudiceId[]> = { [a.id]: [], [b.id]: [] };
    ordine.forEach((g) => perAsta[L0.voti[g]].push(g));

    return (
      <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <FxDefs id={id} />
          <TalentDefs id={id} />
        </defs>
        <g transform={cam.transform}>
          {/* PIANO 0 — parete con la data del Live */}
          <g transform={L(0.25)}>
            <Parete id={id} t={t} top={640} bottom={1000} colori={[ROSSO, '#6A2A6A', '#3A2C8A']} luce={0.55 + 0.45 * rossi}
              scritta={`LIVE ${live} · ${L0.data}`} scrittaY={706} scrittaSize={50} scrittaO={data} scrittaColore="#F6F2EA" />
            <Americana id={id} t={t} y={110} colori={['#FFF2D0', ROSSO]} />
            <Torre id={id} t={t} x={-10} y={640} colori={[ROSSO, '#C8B8FF', ORO]} />
            <Torre id={id} t={t} x={1090} y={640} colori={[ORO, '#C8B8FF', ROSSO]} flip />
          </g>

          {/* PIANO 1 — sul fondo: la pedana della squadra di chi esce, il jukebox o il microfono dorato */}
          <g transform={L(0.4)}>
            <Pavimento id={id} t={t} y={1000} bordo={1570} colori={[ROSSO, gs.colore]} />
            {fondo === 'squadra' && (
              <g>
                <path d={`M380 1062 L396 1040 H684 L700 1062 Z`} fill="#241C3A" stroke={K} strokeWidth="5" />
                <rect x={380} y="1062" width={320} height="34" fill="#120E1E" stroke={K} strokeWidth="5" />
                <rect x={380} y="1062" width={320} height="6" fill={gs.colore} opacity={0.4 + 0.6 * restano} />
                <text x={540} y="1090" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="20" letterSpacing="5" fill={gs.colore} opacity={0.5 + 0.5 * restano}>
                  SQUADRA {gs.corto.toUpperCase()}
                </text>
                {[...compagni, out].map((c, k, arr) => {
                  const x = 540 + (k - (arr.length - 1) / 2) * 100;
                  const isOut = c.id === out.id;
                  return (
                    <Asta key={c.id} id={id} t={t} x={x} y={1058} s={0.22} colore={gs.colore} luce={isOut ? 0.6 * (1 - spegne) : lerp(0.35, 1, restano)}
                      fuori={isOut ? spegne : 0} cartellino={false} band={c.band} ph={k} />
                  );
                })}
              </g>
            )}
            {fondo === 'conduttrice' && <Asta id={id} t={t} x={540} y={1050} s={0.26} colore={ORO} oro cartellino={false} luce={0.8} />}
            {jukebox && <Jukebox id={id} t={t} x={880} y={1058} s={0.46} on={data} />}
          </g>

          {/* PIANO 2 — le due aste del ballottaggio sotto i fasci rossi */}
          <g transform={L(0.6)}>
            {[a, b].map((c, j) => {
              const x = j === 0 ? XA : XB;
              const g = giudice(c.squadra);
              const isOut = c.id === out.id;
              const acc = j === 0 ? accA : accB;
              const fu = isOut ? spegne : 0;
              return (
                <g key={c.id}>
                  <Faro id={`${id}-fr${j}`} t={t} x={x} y={YB} da={{ x: j === 0 ? 20 : 1060, y: 700 }} colore={ROSSO} o={rossi * (1 - 0.75 * fu)} largo={250} />
                  <RiflessoAsta t={t} x={x} y={YB + 4} s={SB} colore={g.colore} o={acc * (1 - fu)} />
                  <Asta id={id} t={t} x={x} y={YB} s={SB} nome={c.nome} colore={g.colore} luce={lerp(0.25, 1, acc)} fuori={fu}
                    nota={fu > 0.5 ? `FUORI · LIVE ${live}` : `SQUADRA ${g.corto.toUpperCase()}`} band={c.band} ph={j} w={300} cs={0.82} />
                </g>
              );
            })}
            {/* gettoni dei voti sopra le aste */}
            {[a, b].map((c) =>
              perAsta[c.id].map((gid, k, arr) => {
                const g = giudice(gid);
                const i = ordine.indexOf(gid);
                const passo = 124, meta = ((arr.length - 1) * passo) / 2 + 62;
                const cx = Math.min(930 - meta, Math.max(150 + meta, xOf(c)));
                return <Gettone key={gid} x={cx + (k - (arr.length - 1) / 2) * passo} y={772} nome={g.corto} colore={g.colore} o={voti[i]} s={0.72} />;
              }),
            )}
            <Foschia id={`${id}-fo`} t={t} y={1140} />
          </g>

          {/* PIANO 3 — le lampade dei giudici sul bordo del palco */}
          <g transform={L(0.9)}>
            <rect x="-200" y="1300" width="1480" height="40" fill="#120E1E" stroke={K} strokeWidth="6" />
            {ordine.map((gid, i) => (
              <Lampada key={gid} id={id} t={t} x={LX[gid]} y={1300} s={0.55} colore={giudice(gid).colore}
                mira={{ x: xOf(concorrente(L0.voti[gid])), y: 860 }} voto={voti[i]} />
            ))}
          </g>
          <g transform={L(1.2)}>
            <Cavi y={1840} />
            <Spia id={id} x={130} y={1780} s={1.1} colore={ROSSO} />
            <Spia id={id} x={950} y={1780} s={1.1} colore={ROSSO} flip />
          </g>
          <g transform={L(1.7)}>
            <NearMotes id={`${id}-near`} t={t} color="#FFD8E0" n={6} r0={60} r1={140} opacity={0.1} />
          </g>
        </g>
        <Finish id={id} tint={TINTA} tintOpacity={0.12} />
      </svg>
    );
  };
  return Scena;
};
