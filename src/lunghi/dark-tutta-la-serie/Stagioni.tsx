import React from 'react';
import { eio, eo, lerp, mod, seg } from '../../lib/anim';
import { HAND, SANS, STENCIL } from '../../lib/fonts';
import { FxDefs } from '../../lib/fx';
import { TINT, YELLOW } from '../../scenes/dark-stagione-1/Winden';
import * as S1 from '../../scenes/dark-stagione-1/Albero';
import * as S2 from '../../scenes/dark-stagione-2/Nodo';
import * as S3 from '../../scenes/dark-stagione-3/Mondi';
import { Finish16, H, Motes16, TopShade, W } from '../fx16';

// Le tre stagioni di Dark (schemi di src/scenes/dark-stagione-N/) riadattate al 16:9 (VIDEO-LUNGO.md).
// Lo schema è lo stesso componente del video verticale, con lo stesso tempo T (secondi dall'inizio del video verticale:
// 0–4 copertina, 4–116 capitoli, 116–120 finale); cambiano camera, sfondo e testi fissi.
// Camera 16:9: il punto (x, y) dello schema va al centro della zona dello schema (960, 535), ingrandito di z.
// La zona dello schema sta tra y 190 (sotto il titolo) e 880 (sopra i sottotitoli): alta 690 px, quindi
// a z = 1 si vedono 690 px di schema in altezza e 1920 in larghezza; i primi piani vanno più vicini del verticale.

const CHALK = '#E8E2D2';
const CX = 960, CY = 535;

type Shot = { at: number; x: number; y: number; z: number };
const camera = (shots: Shot[], T: number) => {
  let o = { x: shots[0].x, y: shots[0].y, z: shots[0].z };
  for (const s of shots.slice(1)) {
    const p = eio(seg(T, s.at - 0.2, s.at + 1.0));
    o = { x: lerp(o.x, s.x, p), y: lerp(o.y, s.y, p), z: lerp(o.z, s.z, p) };
  }
  return { x: o.x + Math.sin(T * 0.3) * 6, y: o.y + Math.cos(T * 0.25) * 4, z: o.z };
};

// ---------------------------------------------------------------- inquadrature (stesse frasi del verticale)

const a1 = S1.at;
const SHOTS1: Shot[] = [
  { at: 0, x: 560, y: 850, z: 0.84 },
  { at: a1('winden', 0), x: 600, y: 900, z: 0.92 },
  { at: a1('winden', 1), x: 820, y: 960, z: 1.4 },
  { at: a1('winden', 2), x: 470, y: 900, z: 1.3 },
  { at: a1('mikkel', 0), x: 760, y: 960, z: 1.3 },
  { at: a1('mikkel', 1), x: 600, y: 960, z: 1.2 },
  { at: a1('mikkel', 2), x: 440, y: 1000, z: 1.1 },
  { at: a1('trentatre', 0), x: 520, y: 770, z: 1.12 },
  { at: a1('trentatre', 2), x: 540, y: 745, z: 1.12 },
  { at: a1('michael', 0), x: 580, y: 800, z: 1.05 },
  { at: a1('michael', 1), x: 520, y: 770, z: 1.3 },
  { at: a1('michael', 2), x: 520, y: 860, z: 1.2 },
  { at: a1('michael', 4), x: 560, y: 840, z: 0.9 },
  { at: a1('noah', 0), x: 760, y: 760, z: 1.15 },
  { at: a1('noah', 3), x: 760, y: 800, z: 1.1 },
  { at: a1('straniero', 0), x: 520, y: 1040, z: 1.15 },
  { at: a1('straniero', 2), x: 440, y: 1020, z: 1.05 },
  { at: a1('straniero', 3), x: 520, y: 980, z: 0.98 },
  { at: a1('scelta', 0), x: 540, y: 860, z: 0.9 },
  { at: a1('scelta', 3), x: 560, y: 850, z: 0.84 },
  { at: a1('inizio', 0), x: 420, y: 1040, z: 1.1 },
  { at: a1('inizio', 1), x: 400, y: 840, z: 0.95 },
  { at: a1('inizio', 3), x: 560, y: 850, z: 0.84 },
  { at: a1('fine', 0), x: 660, y: 880, z: 1.0 },
  { at: a1('fine', 1), x: 640, y: 1060, z: 1.15 },
  { at: a1('fine', 3, 0.3), x: 560, y: 850, z: 0.82 },
];

const a2 = S2.at;
const SHOTS2: Shot[] = [
  { at: 0, x: 560, y: 870, z: 0.8 },
  { at: a2('futuro', 0), x: 520, y: 1020, z: 1.4 },
  { at: a2('padre', 0), x: 420, y: 920, z: 1.1 },
  { at: a2('setta', 0), x: 620, y: 650, z: 1.25 },
  { at: a2('adam', 0), x: 480, y: 865, z: 0.92 },
  { at: a2('charlotte', 0), x: 780, y: 920, z: 0.95 },
  { at: a2('piano', 0), x: 560, y: 870, z: 0.8 },
  { at: a2('martha', 0), x: 540, y: 840, z: 0.92 },
  { at: a2('fine', 0), x: 580, y: 960, z: 0.92 },
  { at: a2('mondo', 0), x: 600, y: 940, z: 1.1 },
  { at: a2('mondo', 3, 0.3), x: 560, y: 870, z: 0.8 },
];

const a3 = S3.at;
const SHOTS3: Shot[] = [
  { at: 0, x: 540, y: 990, z: 0.74 },
  { at: a3('altromondo', 0), x: 540, y: 800, z: 1.05 },
  { at: a3('eva', 0), x: 540, y: 760, z: 1.0 },
  { at: a3('bambino', 0), x: 540, y: 820, z: 1.15 },
  { at: a3('sfera', 0), x: 560, y: 790, z: 1.05 },
  { at: a3('claudia', 0), x: 540, y: 900, z: 0.95 },
  { at: a3('origine', 0), x: 560, y: 1150, z: 1.0 },
  { at: a3('ponte', 0), x: 550, y: 1110, z: 0.98 },
  { at: a3('svanire', 0), x: 540, y: 990, z: 0.74 },
  { at: a3('fine', 0), x: 560, y: 960, z: 0.85 },
  { at: a3('fine', 2, 0.4), x: 560, y: 940, z: 0.9 },
];

// ---------------------------------------------------------------- sfondi (a tutto 16:9)

const BG: React.FC<{ id: string }> = ({ id }) => (
  <>
    <defs>
      <radialGradient id={`${id}-bg`} cx=".5" cy=".5" r=".72">
        <stop offset="0" stopColor="#22302B" />
        <stop offset=".6" stopColor="#141B18" />
        <stop offset="1" stopColor="#080B0A" />
      </radialGradient>
    </defs>
    <rect width={W} height={H} fill={`url(#${id}-bg)`} />
  </>
);

/** Stagione 1: quadrante d'orologio che gira lento dietro l'albero. */
const Quadrante: React.FC<{ T: number }> = ({ T }) => (
  <g transform={`translate(${CX} ${CY + 10}) rotate(${T * 3})`} opacity=".12">
    <circle r="500" fill="none" stroke={CHALK} strokeWidth="3" />
    <circle r="462" fill="none" stroke={CHALK} strokeWidth="1.5" strokeDasharray="2 16" />
    {Array.from({ length: 12 }, (_, i) => <path key={i} d="M0 -500 V-470" stroke={CHALK} strokeWidth={i % 3 ? 3 : 7} transform={`rotate(${i * 30})`} />)}
    {/* ingranaggi ai lati, che in orizzontale riempiono lo spazio senza attirare l'occhio */}
  </g>
);
const Ingranaggio: React.FC<{ x: number; y: number; r: number; T: number; v: number; o?: number }> = ({ x, y, r, T, v, o = 0.07 }) => {
  const n = Math.round(r / 9);
  return (
    <g transform={`translate(${x} ${y}) rotate(${T * v})`} opacity={o}>
      <circle r={r} fill="none" stroke={CHALK} strokeWidth="4" />
      <circle r={r * 0.32} fill="none" stroke={CHALK} strokeWidth="4" />
      {Array.from({ length: n }, (_, i) => <rect key={i} x={-7} y={-r - 16} width="14" height="18" fill={CHALK} transform={`rotate(${(i * 360) / n})`} />)}
      {[0, 60, 120].map((a) => <path key={a} d={`M${-r * 0.32} 0 H${-r + 4} M${r * 0.32} 0 H${r - 4}`} stroke={CHALK} strokeWidth="3" transform={`rotate(${a})`} />)}
    </g>
  );
};
/** Stagione 2: clessidra che si capovolge ogni 20 s. */
const Clessidra: React.FC<{ T: number }> = ({ T }) => (
  <g transform={`translate(${CX} ${CY + 10}) rotate(${180 * Math.floor(T / 20) + 180 * eio(seg(mod(T, 20), 18, 20))}) scale(.86)`} opacity=".08">
    <path d="M-300 -480 H300 M-300 480 H300" stroke={CHALK} strokeWidth="10" />
    <path d="M-240 -460 Q-240 -80 -30 0 Q-240 80 -240 460 H240 Q240 80 30 0 Q240 -80 240 -460 Z" fill="none" stroke={CHALK} strokeWidth="5" />
  </g>
);
/** Stagione 3: quadrante dell'orologio di Tannhaus con le lancette. */
const Tannhaus: React.FC<{ T: number }> = ({ T }) => {
  const hand = (T / 60) * 360;
  return (
    <g transform={`translate(${CX} ${CY + 10})`} opacity=".08">
      <circle r="480" fill="none" stroke={CHALK} strokeWidth="8" />
      <circle r="450" fill="none" stroke={CHALK} strokeWidth="3" />
      {Array.from({ length: 60 }, (_, i) => <path key={i} d={`M0 -450 V${i % 5 ? -435 : -410}`} stroke={CHALK} strokeWidth={i % 5 ? 3 : 8} transform={`rotate(${i * 6})`} />)}
      <path d="M0 30 V-300" stroke={CHALK} strokeWidth="12" strokeLinecap="round" transform={`rotate(${hand / 12 + 200})`} />
      <path d="M0 40 V-400" stroke={CHALK} strokeWidth="6" strokeLinecap="round" transform={`rotate(${hand})`} />
      <circle r="16" fill={CHALK} />
    </g>
  );
};

const STAGIONI = {
  'dark-stagione-1': { n: 1, id: 'l1', shots: SHOTS1, Inner: S1.Tree, Back: Quadrante },
  'dark-stagione-2': { n: 2, id: 'l2', shots: SHOTS2, Inner: S2.Schema, Back: Clessidra },
  'dark-stagione-3': { n: 3, id: 'l3', shots: SHOTS3, Inner: S3.Schema, Back: Tannhaus },
} as const;
export type Stagione = keyof typeof STAGIONI;

/**
 * Una stagione intera nel 16:9: T = secondi dall'inizio del video verticale (0–120).
 * Nei primi 4 s il cartello col nome della stagione, negli ultimi 4 s il riassunto «in una frase» sopra lo schema completo.
 */
export const StagioneView: React.FC<{ film: Stagione; T: number; nome: string; sottotitolo: string; riassunto: string }> = ({ film, T, nome, sottotitolo, riassunto }) => {
  const S = STAGIONI[film];
  const c = camera(S.shots, T);
  const carta = 1 - eio(seg(T, 3.3, 4.1)); // il cartello lascia il posto allo schema
  const fine = eio(seg(T, 116.1, 116.8)); // il riassunto entra sopra lo schema completo
  const { Inner, Back } = S;
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <defs><FxDefs id={S.id} /></defs>
        <BG id={S.id} />
        <Ingranaggio x={140} y={900} r={210} T={T} v={4} />
        <Ingranaggio x={1790} y={170} r={170} T={T} v={-5} />
        <Ingranaggio x={1720} y={980} r={110} T={T} v={7} o={0.05} />
        <Back T={T} />
        <g transform={`translate(${CX} ${CY}) scale(${c.z}) translate(${-c.x} ${-c.y})`} opacity={1 - 0.55 * fine}>
          <Inner T={T} />
        </g>
        <TopShade id={S.id} />
        <Motes16 T={T} color={CHALK} />
        {/* cartello e riassunto: velo scuro al centro, così il testo grande si legge sopra qualsiasi parte dello schema */}
        {(carta > 0 || fine > 0) && (
          <g opacity={Math.max(carta, fine * 0.85)}>
            <defs>
              <radialGradient id={`${S.id}-velo`} cx=".5" cy=".5" r=".6">
                <stop offset="0" stopColor="#060908" stopOpacity=".88" />
                <stop offset=".7" stopColor="#060908" stopOpacity=".6" />
                <stop offset="1" stopColor="#060908" stopOpacity=".2" />
              </radialGradient>
            </defs>
            <rect width={W} height={H} fill={`url(#${S.id}-velo)`} />
          </g>
        )}
        <Finish16 id={S.id} tint={TINT} tintOpacity={0.08} />
      </svg>
      {carta > 0 && <Cartello T={T} k={carta} nome={nome} sottotitolo={sottotitolo} />}
      {fine > 0 && <Riassunto T={T - 116} k={fine} testo={riassunto} />}
    </>
  );
};

/** Cartello d'apertura della stagione: «STAGIONE N» enorme e il tema in una riga. */
const Cartello: React.FC<{ T: number; k: number; nome: string; sottotitolo: string }> = ({ T, k, nome, sottotitolo }) => {
  const a = eo(seg(T, 0.05, 0.6));
  const b = eo(seg(T, 0.4, 0.9));
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: k }}>
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: '0.32em', color: '#A8B4AC', opacity: a, marginBottom: 10 }}>DARK · SPIEGATO SEMPLICE</div>
      <div style={{ fontFamily: STENCIL, fontWeight: 800, fontSize: 230, lineHeight: 0.95, letterSpacing: '0.06em', color: '#E4E7E1', opacity: a, transform: `scale(${0.94 + 0.06 * a})`, textShadow: '0 8px 0 #050706' }}>{nome}</div>
      <div style={{ marginTop: 18, fontFamily: SANS, fontWeight: 800, fontSize: 44, letterSpacing: '0.34em', color: '#E4E7E1', opacity: a }}>IN 2 MINUTI</div>
      <div style={{ marginTop: 22, fontFamily: HAND, fontWeight: 700, fontSize: 64, color: YELLOW, opacity: b, transform: `translateY(${(1 - b) * 14}px)` }}>{sottotitolo}</div>
      <div style={{ marginTop: 22, width: 420 * b, height: 6, borderRadius: 3, background: YELLOW, opacity: 0.85 }} />
    </div>
  );
};

/** Riassunto della stagione in una frase (la voce del finale dell'episodio), sopra lo schema completo. */
const Riassunto: React.FC<{ T: number; k: number; testo: string }> = ({ T, k, testo }) => {
  const [testa, ...resto] = testo.split(':');
  const corpo = resto.join(':').trim();
  const b = eo(seg(T, 0.35, 0.9));
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: k }}>
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 34, letterSpacing: '0.3em', color: YELLOW }}>{(corpo ? testa : 'IN UNA FRASE').toUpperCase()}</div>
      <div style={{
        marginTop: 26, maxWidth: 1380, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 70, lineHeight: 1.15,
        color: '#E4E7E1', opacity: b, transform: `translateY(${(1 - b) * 16}px)`, textShadow: '0 5px 0 #050706', textWrap: 'balance',
      }}>{corpo ? corpo.charAt(0).toUpperCase() + corpo.slice(1) : testa}</div>
    </div>
  );
};
