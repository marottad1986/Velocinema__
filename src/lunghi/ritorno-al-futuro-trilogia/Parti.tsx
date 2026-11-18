import React from 'react';
import { eio, eo, seg } from '../../lib/anim';
import { HAND, RIGHTEOUS, SANS } from '../../lib/fonts';
import { FxDefs } from '../../lib/fx';
import * as P1 from '../../scenes/ritorno-al-futuro/Linee';
import * as P2 from '../../scenes/ritorno-al-futuro-parte-2/Linee2';
import * as P3 from '../../scenes/ritorno-al-futuro-parte-3/Linee3';
import { Finish16, H, Motes16, TopShade, W } from '../fx16';

// Le tre Parti di Ritorno al futuro (schemi di src/scenes/ritorno-al-futuro*/) riadattate al 16:9 (VIDEO-LUNGO.md).
// Lo schema è lo stesso componente del video verticale, con lo stesso tempo T (secondi dall'inizio del video verticale:
// 0–4 copertina, 4–116 capitoli, 116–120 finale), quindi gli eventi restano sulla stessa griglia della musica.
// Camera 16:9: segue la camera del verticale (stesse inquadrature, approvate), con lo zoom ridotto di K perché la zona
// dello schema in orizzontale (y 190–880, alta 690 px) è più bassa di quella verticale (tra titolo e sottotitoli, ~800 px):
// così ogni stazione entra intera in altezza. Il centro del verticale (540, 900 sullo schermo, con la zona utile centrata a
// 860) va al centro della zona 16:9 (960, 535).
// Ai lati, dove il verticale non ha disegno, la carta da progetto continua (la griglia è nel mondo) e due elementi calmi
// tengono vivo il fotogramma senza rubare l'occhio: l'anno della stazione inquadrata, enorme e in solo contorno, sul
// bordo sinistro (cambia in dissolvenza quando la camera passa a un'altra epoca), e un quadrante d'orologio al neon sul
// bordo destro, con le lancette che corrono all'indietro quando la camera viaggia nel tempo.

const CX = 960, CY = 450;
const K = 0.84;
const INK = '#F4EEE2';
const YEL = '#F5C23A';
const NEON = '#5CF0FF';
const PINK = '#FF4FB0';

type Band = { y0: number; year: string };
type Parte = {
  id: string;
  camAt: (T: number) => { x: number; y: number; z: number };
  setUi: (z: number) => void;
  Schema: React.FC<{ T: number; cam?: { y: number; z: number } }>;
  bands: Band[];
};
const PARTI: Record<string, Parte> = {
  'ritorno-al-futuro': { id: 'l1', camAt: P1.camAt, setUi: P1.setUi, Schema: P1.Schema, bands: Object.values(P1.BAND) },
  'ritorno-al-futuro-parte-2': { id: 'l2', camAt: P2.camAt, setUi: P1.setUi, Schema: P2.Schema, bands: Object.values(P2.BAND) },
  'ritorno-al-futuro-parte-3': { id: 'l3', camAt: P3.camAt, setUi: P1.setUi, Schema: P3.Schema, bands: Object.values(P3.BAND) },
};
export type ParteFilm = keyof typeof PARTI;

/** Camera 16:9 ricavata da quella del verticale. */
const cam16 = (c: { x: number; y: number; z: number }) => {
  const z = c.z * K;
  // in orizzontale la stazione (larga 1080) entra quasi sempre intera: la camera resta centrata sullo schema e si sposta
  // di lato solo quanto serve quando l'inquadratura è più stretta della stazione (primi piani molto vicini)
  const lib = Math.max(0, (1180 - 1920 / z) / 2);
  return { x: 540 + Math.max(-lib, Math.min(lib, c.x - 540)), y: c.y - 40 / c.z, z };
};

/** L'anno della stazione più vicina al centro della camera (e quanto ci è vicina, per la dissolvenza). */
const annoDi = (bands: Band[], y: number) => {
  const d = bands.map((b) => ({ year: b.year, d: Math.abs(y - (b.y0 + 400)) }));
  d.sort((a, b) => a.d - b.d);
  return d[0];
};

/** Anno enorme in solo contorno, sul bordo sinistro. */
const AnnoLaterale: React.FC<{ year: string; k: number }> = ({ year, k }) => (
  <text x={0} y={0} transform="translate(250 560) rotate(-90)" textAnchor="middle" fontFamily={RIGHTEOUS} fontSize="270" letterSpacing="12"
    fill="none" stroke={NEON} strokeWidth="3" opacity={0.16 * k}>{year}</text>
);

/** Quadrante al neon sul bordo destro: le lancette corrono all'indietro quando la camera viaggia (zoom basso). */
const Quadrante: React.FC<{ T: number; viaggio: number }> = ({ T, viaggio }) => {
  const giro = -T * 6 - viaggio * 720;
  return (
    <g transform="translate(1690 560)" opacity=".2">
      <circle r="190" fill="none" stroke={PINK} strokeWidth="5" />
      <circle r="168" fill="none" stroke={PINK} strokeWidth="2" strokeDasharray="2 14" />
      {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M0 -190 V${i % 3 ? -172 : -150}`} stroke={NEON} strokeWidth={i % 3 ? 3 : 7} transform={`rotate(${i * 30})`} />)}
      <path d="M0 18 V-110" stroke={NEON} strokeWidth="9" strokeLinecap="round" transform={`rotate(${giro / 12})`} />
      <path d="M0 22 V-150" stroke={YEL} strokeWidth="5" strokeLinecap="round" transform={`rotate(${giro})`} />
      <circle r="10" fill={YEL} />
    </g>
  );
};

/**
 * Una Parte intera nel 16:9: T = secondi dall'inizio del video verticale (0–120).
 * Nei primi 4 s il cartello col nome della Parte, negli ultimi 4 s il riassunto sopra lo schema completo.
 */
export const ParteView: React.FC<{ film: ParteFilm; T: number; nome: string; sottotitolo: string; riassunto: string }> = ({ film, T, nome, sottotitolo, riassunto }) => {
  const S = PARTI[film];
  const cv = S.camAt(T);
  S.setUi(cv.z);
  const c = cam16(cv);
  const carta = 1 - eio(seg(T, 3.3, 4.1));
  const fine = eio(seg(T, 116.1, 116.8));
  // anno a sinistra: in dissolvenza tra una stazione e l'altra; spento quando la camera è larga (più epoche insieme)
  const a = annoDi(S.bands, cv.y);
  const largo = seg(cv.z, 0.75, 0.55);
  const kAnno = (1 - seg(a.d, 260, 420)) * (1 - largo);
  const { Schema } = S;
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <FxDefs id={S.id} />
          <radialGradient id={`${S.id}-bg`} cx=".5" cy=".5" r=".75">
            <stop offset="0" stopColor="#2E1E5C" />
            <stop offset=".6" stopColor="#1C1240" />
            <stop offset="1" stopColor="#0C0820" />
          </radialGradient>
          <pattern id={`${S.id}-grid`} width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0 H0 V40" fill="none" stroke="#33255E" strokeWidth="1" /></pattern>
          <pattern id={`${S.id}-grid2`} width="200" height="200" patternUnits="userSpaceOnUse"><path d="M200 0 H0 V200" fill="none" stroke="#5A2E78" strokeWidth="2" /></pattern>
        </defs>
        <rect width={W} height={H} fill={`url(#${S.id}-bg)`} />
        <g transform={`translate(${CX} ${CY}) scale(${c.z}) translate(${-c.x} ${-c.y})`}>
          <rect x="-6000" y="-4000" width="13080" height="16000" fill={`url(#${S.id}-grid)`} opacity=".55" />
          <rect x="-6000" y="-4000" width="13080" height="16000" fill={`url(#${S.id}-grid2)`} opacity=".5" />
        </g>
        <AnnoLaterale year={a.year} k={kAnno} />
        <Quadrante T={T} viaggio={largo} />
        <g transform={`translate(${CX} ${CY}) scale(${c.z}) translate(${-c.x} ${-c.y})`} opacity={1 - 0.55 * fine}>
          <Schema T={T} cam={cv} />
        </g>
        <TopShade id={S.id} color="#0C0820" h={230} />
        <Motes16 T={T} color={INK} />
        {(carta > 0 || fine > 0) && (
          <g opacity={Math.max(carta, fine * 0.88)}>
            <defs>
              <radialGradient id={`${S.id}-velo`} cx=".5" cy=".5" r=".62">
                <stop offset="0" stopColor="#0C0820" stopOpacity=".9" />
                <stop offset=".7" stopColor="#0C0820" stopOpacity=".66" />
                <stop offset="1" stopColor="#0C0820" stopOpacity=".25" />
              </radialGradient>
            </defs>
            <rect width={W} height={H} fill={`url(#${S.id}-velo)`} />
          </g>
        )}
        <Finish16 id={S.id} tint="#1A1238" tintOpacity={0.1} />
      </svg>
      {carta > 0 && <Cartello T={T} k={carta} nome={nome} sottotitolo={sottotitolo} />}
      {fine > 0 && <Riassunto T={T - 116} k={fine} nome={nome} testo={riassunto} />}
    </>
  );
};

/** Cartello d'apertura della Parte: «PARTE N» al neon, come il cartellino delle copertine verticali. */
const Cartello: React.FC<{ T: number; k: number; nome: string; sottotitolo: string }> = ({ T, k, nome, sottotitolo }) => {
  const a = eo(seg(T, 0.05, 0.6));
  const b = eo(seg(T, 0.4, 0.9));
  const ronzio = 0.92 + 0.08 * Math.sin(T * 37) * (1 - seg(T, 0, 0.5)); // il neon che si accende
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: k }}>
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: '0.32em', color: '#B8A8E8', opacity: a, marginBottom: 14 }}>RITORNO AL FUTURO · SPIEGATO SEMPLICE</div>
      <div style={{
        fontFamily: RIGHTEOUS, fontSize: 210, lineHeight: 1, letterSpacing: '0.08em', color: INK, opacity: a * ronzio,
        transform: `scale(${0.94 + 0.06 * a})`, textShadow: `0 8px 0 #0C0820, 0 0 34px rgba(255,79,176,.75), 0 0 80px rgba(92,240,255,.4)`,
      }}>{nome}</div>
      <div style={{ marginTop: 14, fontFamily: SANS, fontWeight: 800, fontSize: 44, letterSpacing: '0.34em', color: INK, opacity: a }}>IN 2 MINUTI</div>
      <div style={{ marginTop: 22, fontFamily: HAND, fontWeight: 700, fontSize: 66, color: YEL, opacity: b, transform: `translateY(${(1 - b) * 14}px)` }}>{sottotitolo}</div>
      <svg width="520" height="16" style={{ marginTop: 18, opacity: b }}>
        <path d={`M8 8 H${8 + 504 * b}`} stroke={YEL} strokeWidth="6" strokeDasharray="22 14" strokeDashoffset={-T * 60} strokeLinecap="round" />
      </svg>
    </div>
  );
};

/** Riassunto della Parte (una frase), sopra lo schema completo. */
const Riassunto: React.FC<{ T: number; k: number; nome: string; testo: string }> = ({ T, k, nome, testo }) => {
  const b = eo(seg(T, 0.35, 0.9));
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: k }}>
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 34, letterSpacing: '0.3em', color: YEL }}>FINE DELLA {nome}</div>
      <div style={{
        marginTop: 26, maxWidth: 1380, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 72, lineHeight: 1.15,
        color: INK, opacity: b, transform: `translateY(${(1 - b) * 16}px)`, textShadow: '0 5px 0 #0C0820', textWrap: 'balance',
      }}>{testo}</div>
    </div>
  );
};

