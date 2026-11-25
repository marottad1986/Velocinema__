import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { clamp01, eio, eo, eob, lerp, mod, rng, seg } from '../lib/anim';
import { DUE, EMME, GIALLO, NERO, PANNA, STUDIOS, VIEWBOX } from './forme';

/**
 * Sigla «2M Studios» dei video lunghi e dei trailer (editore, 25 nov 2026): come il logo di uno studio prima di un film.
 * 3,5 s a 120 bpm (un battito = 0,5 s), istanti uguali a scripts/audio/sigla-2m-studios.mjs:
 *  0,0–0,5  nero, una fessura di luce gialla si apre al centro (rullo di timpani che cresce)
 *  0,5      sale il 2 giallo (colpo di timpani, ottoni gravi in Re)
 *  1,0      accanto al 2 si accende la M gialla (corni sulla quinta, La)
 *  1,25     la M panna si stacca dal clone giallo e scivola di lato, come un fotogramma doppiato (arpa che sale)
 *  1,5      «STUDIOS» si scrive dal basso, un lampo di luce attraversa il logo (accordo pieno di Re maggiore, piatto)
 *  1,5–2,75 il logo resta, la camera si avvicina appena; 2,75–3,25 dissolvenza al nero
 * Il logo non si deforma e non cambia colori (scheda del brand): si muove soltanto, intero o per pezzi.
 */
export const SIGLA_DURATA = 3.5;
export const SIGLA = { fessura: 0, due: 0.5, clone: 1.0, stacco: 1.25, tutti: 1.5, buio: 2.75, fine: 3.25 };

const r = rng(2042);
const POLVERE = Array.from({ length: 40 }, () => ({ x: r(), y: r(), s: 0.8 + r() * 2.2, v: 0.004 + r() * 0.012, ph: r() * 6 }));
const GRANA = Array.from({ length: 260 }, () => ({ x: r() * 200, y: r() * 200, o: 0.05 + r() * 0.12, l: r() > 0.5 }));

export const SiglaScena: React.FC<{ T: number; W: number; H: number }> = ({ T, W, H }) => {
  const S = SIGLA;
  const verticale = H > W;
  // larghezza del logo: 840 px nel 16:9 (meno della metà dello schermo, «spazio libero intorno»), 760 nel 9:16
  const larg = verticale ? 760 : 840;
  const k = larg / VIEWBOX.w;
  const cx = W / 2;
  const cy = H / 2;
  const fuori = 1 - seg(T, S.buio, S.fine);
  // camera: lento avvicinamento per tutta la sigla
  const zoom = lerp(0.97, 1.035, eio(seg(T, 0.3, S.fine)));

  // fessura di luce (fascio anamorfico) che si apre e poi resta come riflesso dietro il logo
  const apre = eo(seg(T, 0.05, S.due));
  const lampo = Math.exp(-Math.max(0, T - S.tutti) * 2.2) * (T >= S.tutti ? 1 : 0);
  const fasciaO = (0.55 * apre * (1 - seg(T, S.due, S.due + 0.6)) + 0.18 + 0.5 * lampo) * clamp01(T / 0.05);

  // pezzi del logo
  const pDue = eob(seg(T, S.due, S.due + 0.38), 1.2);
  const pClone = eo(seg(T, S.clone, S.clone + 0.3));
  const pStacco = eio(seg(T, S.stacco, S.stacco + 0.3));
  const pScritta = seg(T, S.tutti, S.tutti + 0.38);
  // lampo che attraversa il logo in diagonale
  const scia = lerp(-0.25, 1.25, eio(seg(T, S.tutti + 0.05, S.tutti + 0.75)));
  const sciaO = seg(T, S.tutti, S.tutti + 0.1) * (1 - seg(T, S.tutti + 0.6, S.tutti + 0.8));
  const bagliore = 0.35 * Math.exp(-Math.max(0, T - S.tutti) * 3) * (T >= S.tutti ? 1 : 0);

  const id = verticale ? 'sv' : 'so';
  return (
    <AbsoluteFill style={{ background: NERO, overflow: 'hidden' }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id={`${id}-alone`} cx=".5" cy=".5" r=".5">
            <stop offset="0" stopColor={GIALLO} stopOpacity=".22" />
            <stop offset=".45" stopColor={GIALLO} stopOpacity=".06" />
            <stop offset="1" stopColor={GIALLO} stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${id}-fascia`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={GIALLO} stopOpacity="0" />
            <stop offset=".5" stopColor="#FFE7B0" stopOpacity="1" />
            <stop offset="1" stopColor={GIALLO} stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${id}-fasciaV`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity="0" />
            <stop offset=".5" stopColor="#FFF" stopOpacity="1" />
            <stop offset="1" stopColor="#000" stopOpacity="0" />
          </linearGradient>
          <mask id={`${id}-fm`}><rect x="0" y={cy - 60} width={W} height="120" fill={`url(#${id}-fasciaV)`} /></mask>
          <radialGradient id={`${id}-vig`} cx=".5" cy=".5" r=".72">
            <stop offset=".5" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity=".7" />
          </radialGradient>
          <pattern id={`${id}-grana`} width="200" height="200" patternUnits="userSpaceOnUse"
            patternTransform={`translate(${mod(Math.floor(T * 24) * 73, 200)} ${mod(Math.floor(T * 24) * 41, 200)})`}>
            {GRANA.map((g, i) => <rect key={i} x={g.x} y={g.y} width="2" height="2" fill={g.l ? '#FFF' : '#000'} opacity={g.o} />)}
          </pattern>
          {/* lampo: banda chiara obliqua che scorre sopra le sole forme del logo */}
          <linearGradient id={`${id}-scia`} gradientUnits="userSpaceOnUse" x1={lerp(-60, 340, scia) - 40} y1="0" x2={lerp(-60, 340, scia) + 40} y2="40">
            <stop offset="0" stopColor="#FFF" stopOpacity="0" />
            <stop offset=".5" stopColor="#FFF" stopOpacity=".75" />
            <stop offset="1" stopColor="#FFF" stopOpacity="0" />
          </linearGradient>
          {/* il 2 sale da sotto una linea invisibile (la base del logo) */}
          <clipPath id={`${id}-base`}><rect x={VIEWBOX.x - 20} y={VIEWBOX.y - 40} width={VIEWBOX.w + 40} height={150 + 40 - VIEWBOX.y} /></clipPath>
          {/* «STUDIOS» si scrive dal basso verso l'alto (lungo la riga ruotata) */}
          <clipPath id={`${id}-scritta`}><rect x={-4} y={-40} width={lerp(0, 150, pScritta)} height={80} /></clipPath>
          <clipPath id={`${id}-clone`}><rect x={136} y={-12} width={lerp(0, 128, pClone)} height={164} /></clipPath>
          <mask id={`${id}-forme`}>
            <g fill="#FFF">
              <path d={DUE} /><polygon points={EMME} /><polygon points={EMME} transform="translate(14 0)" />
            </g>
          </mask>
        </defs>

        {/* alone caldo dietro il logo, la polvere nel fascio del proiettore */}
        <ellipse cx={cx} cy={cy} rx={W * 0.55} ry={H * 0.5} fill={`url(#${id}-alone)`} opacity={(0.25 + 0.75 * seg(T, S.due, S.tutti) + bagliore) * fuori} />
        <g opacity={fuori * seg(T, 0.2, 1.2)}>
          {POLVERE.map((p, i) => (
            <circle key={i} cx={mod(p.x * W + Math.sin(T * 0.7 + p.ph) * 14, W)} cy={mod(p.y * H - T * p.v * H, H)} r={p.s * (verticale ? 1.2 : 1)}
              fill={PANNA} opacity={0.1 + 0.08 * Math.sin(T * 3 + p.ph)} />
          ))}
        </g>
        {/* fessura di luce orizzontale */}
        <g mask={`url(#${id}-fm)`} opacity={fasciaO * fuori}>
          <rect x={cx - (W / 2) * apre} y={cy - lerp(1, 26, apre)} width={W * apre} height={lerp(2, 52, apre)} fill={`url(#${id}-fascia)`} />
        </g>
        <rect x={cx - (W / 2) * apre} y={cy - 1.5} width={W * apre} height="3" fill={`url(#${id}-fascia)`} opacity={(0.9 * (1 - seg(T, S.due, S.due + 0.4)) + 0.35 * lampo) * fuori} />

        {/* il logo */}
        <g opacity={fuori} transform={`translate(${cx} ${cy}) scale(${zoom * k}) translate(${-(VIEWBOX.x + VIEWBOX.w / 2)} ${-(VIEWBOX.y + VIEWBOX.h / 2)})`}>
          <g clipPath={`url(#${id}-base)`}>
            <path d={DUE} fill={GIALLO} transform={`translate(0 ${lerp(165, 0, pDue)})`} />
          </g>
          <g clipPath={`url(#${id}-clone)`}>
            <polygon points={EMME} fill={GIALLO} />
            {/* la M panna esce dal clone: parte sovrapposta e scivola di 14 a destra */}
            <polygon points={EMME} fill={PANNA} transform={`translate(${lerp(0, 14, pStacco)} 0)`} opacity={T >= S.stacco ? 1 : 0} />
          </g>
          <g clipPath={`url(#${id}-scritta)`} transform="translate(288 140) rotate(-90)">
            <path d={STUDIOS} fill={PANNA} transform={`translate(0 ${lerp(-6, 0, eo(pScritta))})`} />
          </g>
          {/* lampo e bagliore solo dentro le forme */}
          <g mask={`url(#${id}-forme)`}>
            <rect x={VIEWBOX.x} y={VIEWBOX.y} width={VIEWBOX.w} height={VIEWBOX.h} fill={`url(#${id}-scia)`} opacity={sciaO} />
            <rect x={VIEWBOX.x} y={VIEWBOX.y} width={VIEWBOX.w} height={VIEWBOX.h} fill="#FFF" opacity={bagliore * 0.5} />
          </g>
        </g>

        <rect width={W} height={H} fill={`url(#${id}-vig)`} />
        <rect width={W} height={H} fill={`url(#${id}-grana)`} opacity=".35" />
      </svg>
    </AbsoluteFill>
  );
};

/** Composizione: la sigla a tutto schermo (16:9 per i lunghi, 9:16 per i trailer). */
export const Sigla: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  return <SiglaScena T={frame / fps} W={width} H={height} />;
};
