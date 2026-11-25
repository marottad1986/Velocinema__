import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { eio, eo, eob, lerp, seg } from '../lib/anim';
import { DUE, EMME, GIALLO, NERO, PANNA, STUDIOS, VIEWBOX } from './forme';

/**
 * Sigla «2M Studios» dei video lunghi YouTube, mai nei trailer (editore, 25 nov 2026). Versione «Zoom», scelta dall'editore tra
 * quattro prove: la camera parte dentro il 2 giallo (schermo pieno di giallo) e si allarga a tempo con il jingle fino al
 * logo intero. Piatta e pulita: niente bagliori né grana, taglio rapido in fondo invece della lunga dissolvenza.
 * 3,5 s a 120 bpm, istanti uguali a scripts/audio/sigla-2m-studios.mjs:
 *  0,0–0,4  schermo giallo che si accende (dentro il tratto del 2)
 *  0,4–1,5  un solo movimento continuo di camera (in scala logaritmica, rallenta senza mai fermarsi): esce dal 2
 *           (colpo di timpani a 0,5) e si allarga fino al logo intero
 *  1,05     entra la M gialla da destra, già piena di colore (corni a 1,0)
 *  1,25     la M panna si stacca dal clone giallo con un piccolo rimbalzo, in dissolvenza di 4 fotogrammi (arpa)
 *  1,5      logo intero, «STUDIOS» sale (accordo pieno)
 *  3,25–3,45 taglio rapido al nero
 * Il logo non si deforma e non cambia colori (scheda del brand): si muove soltanto, intero o per pezzi.
 */
export const SIGLA_DURATA = 3.5;
export const SIGLA = { fessura: 0, due: 0.5, clone: 1.0, stacco: 1.25, tutti: 1.5 };

export const SiglaScena: React.FC<{ T: number; W: number; H: number }> = ({ T, W, H }) => {
  const S = SIGLA;
  // larghezza del logo finale: 760 px (meno della metà dello schermo nel 16:9, «spazio libero intorno»; 70% nel 9:16)
  const larg = 760;
  // punto dentro il tratto obliquo del 2 (coordinate del logo), dove parte lo zoom
  const px = 64;
  const py = 112;
  // un'unica curva dal pieno di giallo al logo intero: scala interpolata nel logaritmo (velocità percepita costante),
  // uscita veloce e frenata dolce fino a fermarsi solo sull'accordo di 1,5 (nessuna sosta in mezzo)
  const u = seg(T, S.due - 0.1, S.tutti);
  const f = 1 - (1 - u) ** 2;
  const scala = Math.exp(lerp(Math.log(26), 0, f));
  // il centro va dal tratto del 2 al centro del logo seguendo lo zoom (peso sul logaritmo già percorso)
  const g = eio(seg(f, 0, 0.9));
  const cxL = lerp(px, VIEWBOX.x + VIEWBOX.w / 2, g);
  const cyL = lerp(py, VIEWBOX.y + VIEWBOX.h / 2, g);
  const k = (larg / VIEWBOX.w) * scala;
  const entra = eo(seg(T, 0, 0.35));
  const pClone = eo(seg(T, S.clone + 0.05, S.clone + 0.3));
  const pPanna = eo(seg(T, S.stacco, S.stacco + 0.13));
  const pStacco = eob(seg(T, S.stacco, S.stacco + 0.3), 1.8);
  const pScritta = seg(T, S.tutti, S.tutti + 0.35);
  const taglio = 1 - seg(T, SIGLA_DURATA - 0.25, SIGLA_DURATA - 0.05);
  const id = H > W ? 'sv' : 'so';
  return (
    <AbsoluteFill style={{ background: NERO, overflow: 'hidden' }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0, opacity: taglio }}>
        <defs>
          {/* «STUDIOS» si scrive dal basso verso l'alto (lungo la riga ruotata) */}
          <clipPath id={`${id}-scritta`}><rect x={-4} y={-40} width={lerp(0, 150, pScritta)} height={80} /></clipPath>
        </defs>
        <g transform={`translate(${W / 2} ${H / 2}) scale(${k}) translate(${-cxL} ${-cyL})`}>
          <path d={DUE} fill={GIALLO} opacity={entra} />
          <g opacity={T >= S.clone + 0.05 ? 1 : 0} transform={`translate(${lerp(30, 0, pClone)} 0)`}>
            <polygon points={EMME} fill={GIALLO} />
            {/* la M panna esce dal clone: parte sovrapposta e scivola di 14 a destra */}
            <polygon points={EMME} fill={PANNA} opacity={pPanna} transform={`translate(${lerp(0, 14, pStacco)} 0)`} />
          </g>
          <g clipPath={`url(#${id}-scritta)`} transform="translate(288 140) rotate(-90)">
            <path d={STUDIOS} fill={PANNA} transform={`translate(0 ${lerp(-6, 0, eo(pScritta))})`} />
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/** Composizione: la sigla a tutto schermo (16:9 per i lunghi; il 9:16 resta solo come anteprima, la sigla non va nei trailer). */
export const Sigla: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  return <SiglaScena T={frame / fps} W={width} H={height} />;
};
