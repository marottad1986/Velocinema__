import React from 'react';
import { eio, eo, eob, lerp, seg } from '../../lib/anim';
import { HAND, RIGHTEOUS, SANS } from '../../lib/fonts';
import { FxDefs } from '../../lib/fx';
import { Fire, Glow, Smoke, flashAt } from '../../lib/elements';
import { Binario, OndaBinario, Scambio } from '../../lib/binari';
import { subtitleTimes } from '../../components/ChapterOverlay';
import {
  ArtCasa, ArtFuturo, ArtPiazza, Bow, DARK, Goggles, INK, Jacket, Link, Node, Note, Notebook, P15, P55, P85, Photo, RED, Skate,
  Tag, TimeCar, Travel, YEL, setUi,
} from '../../scenes/ritorno-al-futuro/Linee';
import { Almanac } from '../../scenes/ritorno-al-futuro-parte-2/Linee2';
import { Loco } from '../../scenes/ritorno-al-futuro-parte-3/Linee3';
import lungo from '../../../lunghi/ritorno-al-futuro-trilogia.json';
import { Finish16, H, Motes16, TopShade, W } from '../fx16';
import type { ParteProps } from '../registro';

// «I paradossi spiegati» e la chiusura: tutta la trilogia in un solo schema orizzontale, il «binario del tempo».
// Il tempo corre da sinistra a destra su una ferrovia vera (traversine e rotaie, src/lib/binari.tsx) con quattro stazioni,
// ognuna con la sua cartolina nello stile degli episodi: 1885 seppia (la locomotiva nel deserto), 1955 crema (la piazza con
// la torre dell'orologio), 1985 al neon (casa McFly), 2015 abbozzo grigio. Sotto il binario la fila dei personaggi
// (cerchio con l'oggetto, come negli episodi). Dopo il 1955 c'è uno scambio: nella Parte 2 la leva scatta e il tempo
// prende un binario rosso che scende al 1985 alternativo (il casinò); quando l'almanacco brucia il binario rosso si spegne
// e la leva torna dritta. In fondo, dopo il 2015, il binario si apre a ventaglio in tante strade possibili.
// Vocabolario degli schemi: cerchio con oggetto = personaggio, linea = legame con scritta a mano, tratteggio giallo =
// viaggio nel tempo, cartellino pieno = colpo di scena, anello rosso = il nodo da capire. Coordinate = mondo; la camera porta
// (x, y) al centro dello schermo (960, 540) con zoom z. Eventi sulla croma della musica (72 bpm), come lo spartito.

type P = readonly [number, number];
const TY = 640; // il binario
const ROW = 790; // la fila dei personaggi
const X = { y1885: 300, y1955: 1200, y1985: 2100, y2015: 3000 } as const;
const SW = 1560; // lo scambio
const ALT = { x: 2300, y: 1250 }; // il binario rosso e la stazione del 1985 alternativo
const FAN = 3420; // dove il binario si apre a ventaglio

const MAIN = `M-500 ${TY} H${FAN}`;
const RAMO = `M${SW} ${TY} C${SW + 200} ${TY} ${SW + 160} ${ALT.y} ${SW + 420} ${ALT.y} H${ALT.x + 560}`;
const VENTAGLIO = [-330, -160, 0, 160, 330].map((dy, i) => ({ i, d: `M${FAN - 40} ${TY} C${FAN + 160} ${TY} ${FAN + 200} ${TY + dy} ${FAN + 420} ${TY + dy} H${FAN + 900}`, dy }));

// ---------------------------------------------------------------- tempi dal JSON, sulla griglia della musica

const parte = lungo.parti.find((p) => p.tipo === 'capitoli')! as unknown as { capitoli: { id: string; durata: number; sottotitoli: string[] }[] };
const CROMA = 60 / lungo.bpm / 2;
export const STARTS: Record<string, number> = {};
const CUES: Record<string, number[]> = {};
{
  let acc = 0;
  for (const c of parte.capitoli) {
    STARTS[c.id] = acc;
    CUES[c.id] = subtitleTimes(c.sottotitoli, c.durata).map(([a]) => a);
    acc += c.durata;
  }
  STARTS.chiusura = acc;
}
const snap = (T: number) => Math.round(T / CROMA) * CROMA;
/** Istante (dall'inizio dei paradossi) della frase `cue` del capitolo più `d`, sulla croma. */
export const at = (ch: string, cue: number, d = 0) => snap(STARTS[ch] + CUES[ch][cue] + d);
const end = (ch: string) => STARTS[ch] + parte.capitoli.find((c) => c.id === ch)!.durata;
/** Le scritte di un capitolo si spengono alla sua fine. */
const off = (T: number, ch: string) => 1 - seg(T, end(ch) - 0.5, end(ch) + 0.2);

// ---------------------------------------------------------------- camera

type Shot = { at: number; x: number; y: number; z: number };
const WIDE = { x: 2150, y: 660, z: 0.4 };
const SHOTS: Shot[] = [
  { at: 0, x: 1650, y: 600, z: 0.74 },
  { at: at('regola', 1), x: 1650, y: 565, z: 0.92 },
  { at: at('regola', 2), x: 1240, y: 565, z: 1.0 },
  { at: at('regola', 3), x: 2100, y: 565, z: 1.0 },
  { at: at('binario', 0), x: 2900, y: 600, z: 1.0 },
  { at: at('binario', 1), x: 2100, y: 470, z: 0.66 },
  { at: at('binario', 2), x: 1560, y: 700, z: 1.0 },
  { at: at('binario', 3), x: 2120, y: 960, z: 0.86 },
  { at: at('riparare', 0), x: 1850, y: 880, z: 0.74 },
  { at: at('riparare', 1), x: 1560, y: 660, z: 1.0 },
  { at: at('riparare', 2), x: 1300, y: 620, z: 1.0 },
  { at: at('riparare', 3, 0.6), x: 1750, y: 640, z: 0.72 },
  { at: at('doppioni', 0), x: 1220, y: 620, z: 1.05 },
  { at: at('doppioni', 2), x: 1220, y: 640, z: 1.1 },
  { at: at('doppioni', 3), x: 3000, y: 630, z: 1.05 },
  { at: at('lettera', 0), x: 1220, y: 630, z: 1.05 },
  { at: at('lettera', 3), x: 2100, y: 620, z: 1.0 },
  { at: at('scritto', 0), x: 2120, y: 620, z: 1.0 },
  { at: at('scritto', 2), x: 3000, y: 600, z: 1.0 },
  { at: at('scritto', 3), x: 3720, y: 560, z: 0.72 },
  { at: at('scritto', 3, 2.0), ...WIDE },
];
const camAt = (T: number) => {
  let o = { x: SHOTS[0].x, y: SHOTS[0].y, z: SHOTS[0].z };
  for (const s of SHOTS.slice(1)) {
    const p = eio(seg(T, s.at - 0.2, s.at + 1.1));
    o = { x: lerp(o.x, s.x, p), y: lerp(o.y, s.y, p), z: Math.exp(lerp(Math.log(o.z), Math.log(s.z), p)) };
  }
  return { x: o.x + Math.sin(T * 0.3) * 6, y: o.y + Math.cos(T * 0.25) * 5, z: o.z * (1 + 0.012 * Math.sin(T * 0.2)) };
};

// ---------------------------------------------------------------- disegni

/** Cartolina di una stazione: cornice, carta, anno e nome; dentro il disegno (coordinate dell'episodio, x 100–980, y 0–540). */
const Cartolina: React.FC<{ x: number; y?: number; paper: string; ink: string; year: string; name: string; on?: number; children: React.ReactNode; id: string; glow?: string; tilt?: number }> = ({ x, y = 236, paper, ink, year, name, on = 1, children, id, glow, tilt = 0 }) => (
  <g transform={`rotate(${tilt} ${x} ${y + 180})`} opacity={on}>
    {glow && <rect x={x - 318} y={y - 18} width={636} height={400} rx="26" fill={glow} opacity=".12" />}
    <rect x={x - 294} y={y + 8} width={600} height={364} rx="10" fill="#000" opacity=".35" />
    <rect x={x - 300} y={y} width={600} height={364} rx="10" fill={paper} stroke={ink} strokeWidth="4" />
    <clipPath id={`${id}-cl`}><rect x={x - 296} y={y + 4} width={592} height={356} rx="8" /></clipPath>
    <g clipPath={`url(#${id}-cl)`}>
      <g transform={`translate(${x - 324} ${y + 16}) scale(0.6)`}>{children}</g>
    </g>
    <text x={x - 282} y={y + 34} fontFamily={SANS} fontWeight={900} fontSize="22" letterSpacing="3" fill={ink} stroke={paper} strokeWidth="5" paintOrder="stroke">{year} · {name}</text>
  </g>
);

/** 1885: il deserto del West con la locomotiva, le mesas e il serbatoio d'acqua di legno. */
const Art1885: React.FC<{ T: number }> = ({ T }) => {
  const ink = '#4A2E1A';
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <circle cx="820" cy="120" r="54" fill="#F0C060" stroke={ink} strokeWidth="5" />
      <path d="M100 360 L180 230 H330 L380 300 L470 300 L520 220 H640 L700 360 Z" fill="#C89A68" stroke={ink} strokeWidth="5" />
      <path d="M640 360 L720 260 H860 L940 360 Z" fill="#B88A5A" stroke={ink} strokeWidth="5" />
      <path d="M100 360 H980 V540 H100 Z" fill="#D6BC88" />
      {/* serbatoio d'acqua */}
      <path d="M170 450 L190 300 M250 450 L230 300 M180 380 H240" stroke={ink} strokeWidth="6" />
      <path d="M160 300 V230 Q210 210 260 230 V300 Z" fill="#8A6A48" stroke={ink} strokeWidth="6" />
      <path d="M160 260 H260" stroke={ink} strokeWidth="3" />
      {/* binario e locomotiva */}
      <path d="M100 470 H980" stroke={ink} strokeWidth="6" />
      {Array.from({ length: 22 }, (_, i) => <path key={i} d={`M${110 + i * 40} 462 v16`} stroke="#8A6A48" strokeWidth="7" />)}
      <g transform="translate(600 420) scale(1.05)"><Loco T={T} glow={0.6} /></g>
      <Smoke id="pp-loco" t={T} x={470} y={290} color="#E8DCC4" n={7} rise={180} wind={-160} r0={18} r1={60} opacity={0.6} />
    </g>
  );
};

/** 1985 alternativo: il casinò al neon rosso, le monete, il cielo sporco. */
const ArtCasino: React.FC<{ T: number; lit: number }> = ({ T, lit }) => {
  const neon = '#FF5050';
  const blink = 0.7 + 0.3 * Math.sin(T * 7);
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <rect x="100" y="0" width="880" height="540" fill="#1C0810" />
      {[[150, 230, 90], [260, 170, 70], [800, 200, 80], [890, 150, 70]].map(([x, h, w], i) => (
        <rect key={i} x={x} y={470 - h} width={w} height={h} fill="#2E0E18" stroke={neon} strokeWidth="3" opacity=".7" />
      ))}
      <rect x="380" y="200" width="320" height="270" rx="14" fill="#3E1420" stroke={neon} strokeWidth="6" />
      <path d="M380 200 Q540 110 700 200" fill="#3E1420" stroke={neon} strokeWidth="6" />
      <Glow id="pp-cas" x={540} y={150} r={190} t={T} color={neon} amp={0.12} rate={3} opacity={0.5 * lit} />
      <rect x="410" y="110" width="260" height="62" rx="10" fill="#120408" stroke={neon} strokeWidth="5" />
      <text x="540" y="156" textAnchor="middle" fontFamily={RIGHTEOUS} fontSize="44" letterSpacing="6" fill={neon} opacity={lit * blink}>CASINÒ</text>
      {[[420, 250], [500, 250], [580, 250], [660, 250], [420, 330], [660, 330]].map(([x, y], i) => (
        <rect key={i} x={x - 18} y={y - 18} width="36" height="40" rx="4" fill="#FFC23A" opacity={(0.25 + 0.5 * Math.sin(T * 3 + i)) * lit} />
      ))}
      <rect x="510" y="380" width="60" height="90" fill="#120408" stroke={neon} strokeWidth="4" />
      {[0, 1, 2, 3, 4].map((i) => {
        const y = 470 - ((T * 90 + i * 70) % 260);
        return <circle key={i} cx={320 + i * 110} cy={y} r="12" fill="#FFC23A" stroke="#7A4A00" strokeWidth="3" opacity={lit * seg(y, 210, 260) * (1 - seg(y, 440, 470))} />;
      })}
      <path d="M100 470 H980" stroke={neon} strokeWidth="5" />
    </g>
  );
};

/** La lettera di Marty: una busta; `rip` > 0 la strappa in quattro pezzi, `tape` > 0 il nastro che la rimette insieme. */
const Lettera: React.FC<{ rip: number; tape?: number }> = ({ rip, tape = 0 }) => {
  const q = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
  return (
    <g strokeLinejoin="round">
      {q.map(([sx, sy], i) => (
        <g key={i} transform={`translate(${sx * 26 * rip} ${sy * 20 * rip}) rotate(${sx * sy * 14 * rip})`}>
          <clipPath id={`pp-let${i}`}><rect x={sx < 0 ? -50 : 0} y={sy < 0 ? -34 : 0} width="50" height="34" /></clipPath>
          <g clipPath={`url(#pp-let${i})`}>
            <rect x="-46" y="-30" width="92" height="60" rx="4" fill="#F4EEDC" stroke={DARK} strokeWidth="4" />
            <path d="M-46 -30 L0 6 L46 -30" fill="none" stroke={DARK} strokeWidth="3.5" />
            <path d="M-30 14 H-4 M-30 22 H8" stroke="#5E7898" strokeWidth="3" />
          </g>
        </g>
      ))}
      {tape > 0 && (
        <g opacity={tape}>
          <rect x="-8" y="-36" width="16" height="72" fill="#F2E6A0" opacity=".85" transform="rotate(8)" />
          <rect x="-50" y="-7" width="100" height="14" fill="#F2E6A0" opacity=".85" transform="rotate(-6)" />
        </g>
      )}
    </g>
  );
};

/** Giubbotto antiproiettile: uno scudo imbottito davanti a Doc, con la scintilla del colpo fermato. */
const Giubbotto: React.FC<{ k: number; hit: number; T: number }> = ({ k, hit, T }) => (
  <g opacity={k} transform={`scale(${eob(k, 1.5)})`} strokeLinejoin="round">
    <path d="M-40 -42 L-18 -50 Q0 -36 18 -50 L40 -42 L44 40 Q0 54 -44 40 Z" fill="#3E4A3A" stroke={INK} strokeWidth="5" />
    {[-24, -6, 12, 30].map((y) => <path key={y} d={`M-38 ${y} Q0 ${y + 8} 38 ${y}`} fill="none" stroke="#5E6E58" strokeWidth="3" />)}
    {hit > 0 && hit < 1 && (
      <g transform="translate(6 2)" opacity={1 - hit}>
        {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M0 0 L${Math.cos(i * 0.8) * 40 * (0.4 + hit)} ${Math.sin(i * 0.8) * 40 * (0.4 + hit)}`} stroke="#FFE08A" strokeWidth="5" strokeLinecap="round" />)}
        <circle r={10 + Math.sin(T * 50) * 2} fill="#FFF6D0" />
      </g>
    )}
  </g>
);

/** Il foglio dal futuro con la scritta «LICENZIATO», che si cancella lettera dopo lettera (`gone` 0–1). */
const Foglio: React.FC<{ gone: number }> = ({ gone }) => {
  const word = 'LICENZIATO';
  return (
    <g transform="rotate(-5)" strokeLinejoin="round">
      <rect x="-104" y="-66" width="216" height="140" fill="#000" opacity=".35" transform="translate(6 8)" />
      <rect x="-108" y="-70" width="216" height="140" fill="#F2F4F8" stroke={DARK} strokeWidth="4" />
      {[-44, -30].map((y) => <path key={y} d={`M-86 ${y} H70`} stroke="#9AA6B8" strokeWidth="5" />)}
      {word.split('').map((ch, i) => (
        <text key={i} x={-84 + i * 17.5} y="14" fontFamily={SANS} fontWeight={900} fontSize="28" fill={RED} opacity={1 - seg(gone, i / word.length, (i + 1.6) / word.length)}>{ch}</text>
      ))}
      {[30, 46].map((y) => <path key={y} d={`M-86 ${y} H40`} stroke="#9AA6B8" strokeWidth="5" />)}
    </g>
  );
};

// ---------------------------------------------------------------- lo schema

export const Schema: React.FC<{ T: number; chiusura?: boolean }> = ({ T, chiusura = false }) => {
  // ---- regola: la spinta a George nel 1955, l'onda lungo il binario fino al 1985, la foto che sbiadisce
  const onda = seg(T, at('regola', 1, 0.1), at('regola', 1, 2.1));
  const fadeBro = seg(T, at('regola', 3, 0.1), at('regola', 3, 1.2));
  const fadeSis = seg(T, at('regola', 3, 0.7), at('regola', 3, 1.8));
  const fotoBack = seg(T, end('regola') - 0.3, end('regola') + 0.6);
  // ---- binario: l'almanacco dal 2015 al 1955, lo scambio che scatta, il binario rosso, il 1985 alternativo
  const viaggioAlm = eio(seg(T, at('binario', 1, 0.3), at('binario', 1, 1.9)));
  const swOn = seg(T, at('binario', 2, 0.1), at('binario', 2, 0.35));
  const ramo = eo(seg(T, at('binario', 2, 0.4), at('binario', 2, 2.0)));
  const altOn = seg(T, at('binario', 3, 0), at('binario', 3, 0.5));
  // ---- riparare: il ritorno allo scambio, l'anello rosso, l'almanacco che brucia, il binario rosso che si spegne
  const burnT = at('riparare', 3, 0.1);
  const burn = seg(T, burnT + 0.3, burnT + 1.8);
  const swOff = seg(T, burnT + 1.0, burnT + 1.25);
  const ramoGone = seg(T, burnT + 1.1, burnT + 2.3);
  const dev = Math.min(swOn, 1 - swOff);
  // ---- doppioni
  const sviene = eio(seg(T, at('doppioni', 3, 1.6), at('doppioni', 3, 2.3)));
  // ---- lettera
  const letX = eio(seg(T, at('lettera', 1, 0.3), at('lettera', 1, 1.1)));
  const rip = eob(seg(T, at('lettera', 2, 0.1), at('lettera', 2, 0.5)), 1.4);
  const volo = eio(seg(T, at('lettera', 3, -0.3), at('lettera', 3, 0.6)));
  const ricompone = eo(seg(T, at('lettera', 3, 0.7), at('lettera', 3, 1.2)));
  const vest = seg(T, at('lettera', 3, 1.8), at('lettera', 3, 2.2));
  const shotT = at('lettera', 3, 2.6);
  const hit = seg(T, shotT, shotT + 0.6);
  // ---- scritto
  const gara = seg(T, at('scritto', 0, 0.9), at('scritto', 0, 1.2));
  const cancella = seg(T, at('scritto', 2, 0.6), at('scritto', 2, 2.4));
  const fan = eo(seg(T, at('scritto', 3, 0.1), at('scritto', 3, 1.6)));
  const oro = seg(T, at('scritto', 3, 1.1), at('scritto', 3, 1.9));
  const scritta = seg(T, at('scritto', 3, 1.4), at('scritto', 3, 2.0));
  const fin = chiusura ? 1 : 0;

  const inCh = (ch: string) => T >= STARTS[ch] - 0.2 && T < end(ch) + 0.2;
  const nm = (ch: string) => (inCh(ch) ? off(T, ch) : 0);

  // percorso dell'almanacco: dal 2015 su in arco fino al giovane Biff del 1955
  const almP: P = [lerp(X.y2015 - 60, X.y1955 + 120, viaggioAlm), ROW - 90 - Math.sin(Math.PI * viaggioAlm) * 700];
  const viaggioA = `M${X.y2015 - 60} ${ROW - 90} C${X.y2015 - 300} ${ROW - 900} ${X.y1955 + 360} ${ROW - 900} ${X.y1955 + 120} ${ROW - 90}`;
  const ritorno = `M${ALT.x - 310} ${ALT.y - 200} C${ALT.x - 560} ${ALT.y - 220} ${SW + 80} ${TY + 330} ${SW - 10} ${TY + 90}`;

  return (
    <g>
      {/* ---- il ventaglio dei futuri possibili (dietro al binario) */}
      {VENTAGLIO.map((v) => (
        <Binario key={v.i} id={`pp-fan${v.i}`} d={v.d} p={Math.max(fan, fin)} t={T} rail={v.dy === 0 && oro > 0 ? YEL : '#B9B0D8'} sleeper="#4A3A6A" opacity={v.dy === 0 ? 1 : 0.75} lit={v.dy === 0 ? oro : 0} glow={YEL} />
      ))}
      {/* ---- il binario rosso (deviato) */}
      <Binario id="pp-ramo" d={RAMO} p={ramo} t={T} rail="#FF6A5A" sleeper="#5A2030" opacity={1 - 0.85 * ramoGone} lit={altOn * (1 - ramoGone)} glow="#FF3030" />
      {/* ---- il binario del tempo */}
      <Binario id="pp-main" d={MAIN} t={T} rail={INK} sleeper="#7A5E8E" lit={onda > 0 && onda < 1 ? 0.6 : 0} glow={YEL} />
      <OndaBinario x0={X.y1955 + 60} x1={X.y1985 - 60} y={TY} p={onda * 1.15} color={YEL} t={T} />
      <Scambio x={SW} y={TY + 70} dev={dev} t={T} />

      {/* ---- le stazioni */}
      <Cartolina id="pp-c1" x={X.y1885} paper="#EADCB8" ink="#4A2E1A" year="1885" name="IL WEST"><Art1885 T={T} /></Cartolina>
      <Cartolina id="pp-c2" x={X.y1955} paper={P55.paper} ink={P55.ink} year="1955" name="LA PIAZZA DELL'OROLOGIO"><ArtPiazza c={P55} T={T} storm={0.3} minutes={600} /></Cartolina>
      <Cartolina id="pp-c3" x={X.y1985} paper={P85.paper} ink={P85.ink} year="1985" name="CASA McFLY">
        <ArtCasa c={P85} T={T} bubbles={0} book={1} />
      </Cartolina>
      <Cartolina id="pp-c4" x={X.y2015} paper="#1E2636" ink={P15.ink} year="2015" name="IL FUTURO"><ArtFuturo c={P15} T={T} lit={1} /></Cartolina>
      <Cartolina id="pp-c5" x={ALT.x} y={ALT.y - 380} paper="#1C0810" ink="#FF5050" year="1985" name="ALTERNATIVO · IL CASINÒ DI BIFF" on={altOn * (1 - ramoGone)} glow="#FF3030" tilt={-1.5}>
        <ArtCasino T={T} lit={altOn} />
      </Cartolina>
      {/* cartelli degli anni sul binario */}
      {([['1885', X.y1885], ['1955', X.y1955], ['1985', X.y1985], ['2015', X.y2015]] as const).map(([y, x]) => (
        <g key={y} transform={`translate(${x} ${TY})`}>
          <rect x="-62" y="-26" width="124" height="52" rx="12" fill={DARK} stroke={YEL} strokeWidth="4" />
          <text y="13" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="34" fill={YEL}>{y}</text>
        </g>
      ))}

      {/* ---- 1. regola: George salvato, Lorraine, l'onda, la foto */}
      {inCh('regola') && (
        <g opacity={off(T, 'regola')}>
          <Node card={false} T={T} t0={at('regola', 2, 0.1)} p={[X.y1955 - 210, ROW]} name="George" sub="il padre"><Notebook /></Node>
          <Node card={false} T={T} t0={at('regola', 2, 0)} p={[X.y1955, ROW]} name="Marty"><Skate T={T} /></Node>
          <Node card={false} T={T} t0={at('regola', 2, 0.9)} p={[X.y1955 + 210, ROW]} name="Lorraine" sub="la mamma"><Bow /></Node>
          <Link card={false} T={T} t0={at('regola', 2, 0.4)} a={[X.y1955 - 66, ROW - 30]} b={[X.y1955 - 144, ROW - 30]} c={[X.y1955 - 105, ROW - 100]} label="lo salva" ly={-30} arrow />
          <Link card={false} T={T} t0={at('regola', 2, 1.3)} a={[X.y1955 + 144, ROW - 30]} b={[X.y1955 + 66, ROW - 30]} c={[X.y1955 + 105, ROW - 100]} color={RED} label="s'innamora di lui" ly={-30} arrow />
          <Tag T={T} t0={at('regola', 1, 0.4)} x={(X.y1955 + X.y1985) / 2} y={TY + 95} text="il cambiamento arriva fino al presente" size={30} until={at('regola', 2, -0.4)} />
          <g transform={`translate(${X.y1985 + 190} ${TY - 250}) scale(${0.95 * eob(seg(T, at('regola', 3, -0.4), at('regola', 3, 0.1)), 1.5)})`}>
            <Photo T={T} fadeBro={fadeBro * (1 - fotoBack)} fadeSis={fadeSis * (1 - fotoBack)} fadeMe={0} />
          </g>
          <Tag T={T} t0={at('regola', 3, 1.3)} x={X.y1985 + 190} y={TY - 70} text="i fratelli spariscono!" bg={RED} fg="#FFFFFF" size={32} rot={-3} />
        </g>
      )}

      {/* ---- 2. binario: il vecchio Biff, l'almanacco, lo scambio, il 1985 alternativo */}
      {inCh('binario') && (
        <g opacity={off(T, 'binario')}>
          <Node card={false} T={T} t0={at('binario', 0, 0.5)} p={[X.y2015, ROW]} name="Biff" sub="da vecchio"><Jacket /></Node>
          <Node card={false} T={T} t0={at('binario', 1, 1.6)} p={[X.y1955 + 120, ROW]} name="Biff" sub="da ragazzo"><Jacket /></Node>
          <Travel T={T} t0={at('binario', 1, 0.3)} d={viaggioA} dur={1.6} id="pp-tr1" label="a sé stesso ragazzo" lx={(X.y1955 + X.y2015) / 2} ly={ROW - 760} />
          {T > at('binario', 1, 0) && <g transform={`translate(${almP[0]} ${almP[1]}) scale(${0.7 * pop2(T, at('binario', 1, 0))})`}><Almanac T={T} /></g>}
          <Tag T={T} t0={at('binario', 2, 0.6)} x={SW + 60} y={TY - 150} text="lo scambio: il tempo devia" size={30} />
          <Tag T={T} t0={at('binario', 3, 0.3)} x={ALT.x + 330} y={ALT.y - 410} text="Biff ricchissimo comanda tutto" bg={RED} fg="#FFFFFF" size={32} rot={-3} />
        </g>
      )}
      {/* l'almanacco resta in mano al giovane Biff fino al fuoco */}
      {T >= at('binario', 2) && T < burnT + 2.4 && (
        <g transform={`translate(${X.y1955 + 120} ${ROW - 120}) scale(${0.55 + 0.3 * seg(T, at('riparare', 2), at('riparare', 2, 0.6))})`}>
          <Almanac T={T} burn={burn} glow={0.6} />
          {burn > 0 && burn < 1 && <Fire id="pp-fuoco" t={T} x={0} y={70} scale={1.2 * (1 - 0.5 * burn)} />}
          {burn > 0.2 && <Smoke id="pp-fumo" t={T} x={0} y={-60} color="#8A8098" n={6} rise={200} wind={60} r0={16} r1={60} opacity={0.6 * (1 - seg(T, burnT + 2, burnT + 2.4))} />}
        </g>
      )}

      {/* ---- 3. riparare: il ritorno allo scambio, l'anello rosso «12 novembre 1955», il fuoco */}
      {inCh('riparare') && (
        <g opacity={off(T, 'riparare')}>
          <Travel T={T} t0={at('riparare', 0, 0.2)} d={ritorno} dur={1.5} id="pp-tr2" label="si torna indietro" lx={ALT.x - 600} ly={ALT.y - 330} labelUntil={at('riparare', 1, 0.2)} />
          {T > at('riparare', 1, 0.2) && (
            <g transform={`translate(${SW} ${TY + 20})`}>
              <ellipse rx={210 * eob(seg(T, at('riparare', 1, 0.2), at('riparare', 1, 0.7)), 1.5)} ry={120 * eob(seg(T, at('riparare', 1, 0.2), at('riparare', 1, 0.7)), 1.5)} fill="none" stroke={RED} strokeWidth="9" />
              <text y={185} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize="50" fill={RED} stroke={DARK} strokeWidth="7" paintOrder="stroke" opacity={seg(T, at('riparare', 1, 0.6), at('riparare', 1, 1.0))}>qui il binario si divide</text>
            </g>
          )}
          <Tag T={T} t0={at('riparare', 2, 0.3)} x={SW + 70} y={TY - 150} text="12 NOVEMBRE 1955" size={34} />
          <Node card={false} T={T} t0={at('riparare', 2, 0.6)} p={[X.y1955 - 140, ROW]} name="Marty" sub="secondo viaggio"><Skate T={T} /></Node>
          <Node card={false} T={T} t0={at('riparare', 2, 0.1)} p={[X.y1955 + 120, ROW]} name="Biff" sub="da ragazzo"><Jacket /></Node>
          <Tag T={T} t0={burnT + 0.5} x={X.y1955 + 120} y={ROW + 140} text="bruciato!" bg={RED} fg="#FFFFFF" size={32} rot={-3} />
          <Tag T={T} t0={burnT + 1.6} x={X.y1985} y={TY + 140} text="il 1985 torna quello di prima" size={30} />
        </g>
      )}

      {/* ---- 4. doppioni: due Marty nel 1955; due Jennifer nel 2015 */}
      {inCh('doppioni') && (
        <g opacity={off(T, 'doppioni')}>
          <Node card={false} T={T} t0={at('doppioni', 0, 0.3)} p={[X.y1955 - 150, ROW]} name="Marty" sub="primo viaggio" ring={seg(T, at('doppioni', 2), at('doppioni', 2, 0.3))}><Skate T={T} /></Node>
          <Node card={false} T={T} t0={at('doppioni', 1, 0)} p={[X.y1955 + 150, ROW]} name="Marty" sub="secondo viaggio" color={YEL}><Skate T={T} /></Node>
          <Link card={false} T={T} t0={at('doppioni', 1, 0.6)} a={[X.y1955 + 85, ROW]} b={[X.y1955 - 85, ROW]} c={[X.y1955, ROW - 90]} dashed label="non farsi vedere" ly={-40} cross={seg(T, at('doppioni', 1, 1.2), at('doppioni', 1, 1.5))} />
          <Tag T={T} t0={at('doppioni', 2, 0.5)} x={X.y1955 - 120} y={TY - 90} text="non rovinare il primo viaggio" size={28} />
          <Node card={false} T={T} t0={at('doppioni', 3, 0.3)} p={[X.y2015 - 130, ROW]} name="Jennifer" sub="da grande"><Note /></Node>
          {T >= at('doppioni', 3, 0.6) && (
            <g transform={`translate(${X.y2015 + 130} ${ROW + 18 * sviene}) rotate(${80 * sviene} 0 58)`}>
              <Node card={false} T={T} t0={at('doppioni', 3, 0.6)} p={[0, 0]} name={sviene > 0.3 ? '' : 'Jennifer'} sub={sviene > 0.3 ? undefined : 'ragazza'}><Note /></Node>
            </g>
          )}
          <Link card={false} T={T} t0={at('doppioni', 3, 1.0)} a={[X.y2015 - 65, ROW - 20]} b={[X.y2015 + 65, ROW - 20]} c={[X.y2015, ROW - 80]} label="s'incontrano" ly={-40} />
          <Tag T={T} t0={at('doppioni', 3, 2.2)} x={X.y2015 + 150} y={TY - 90} text="sviene!" bg={RED} fg="#FFFFFF" size={36} rot={-4} />
        </g>
      )}

      {/* ---- 5. lettera: la busta, lo strappo, i pezzi che vanno al 1985, il nastro, il giubbotto */}
      {inCh('lettera') && (
        <g opacity={off(T, 'lettera')}>
          <Node card={false} T={T} t0={at('lettera', 0, 0.3)} p={[X.y1955 - 150, ROW]} name="Marty"><Skate T={T} /></Node>
          <Node card={false} T={T} t0={at('lettera', 0, 0.6)} p={[X.y1955 + 150, ROW]} name="Doc" sub="nel 1955"><Goggles /></Node>
          <Node card={false} T={T} t0={at('lettera', 3, 0.2)} p={[X.y1985, ROW]} name="Doc" sub="nel 1985" hit={hit}><Goggles /></Node>
          {T >= at('lettera', 1, 0) && (() => {
            const x0 = lerp(X.y1955 - 150, X.y1955 + 150, letX);
            const x = lerp(x0, X.y1985 + 10, volo);
            const y = lerp(ROW - 120 - Math.sin(Math.PI * letX) * 60, ROW - 120, volo) - Math.sin(Math.PI * volo) * 220;
            return <g transform={`translate(${x} ${y}) scale(1.3)`}><Lettera rip={rip * (1 - ricompone)} tape={ricompone} /></g>;
          })()}
          <Tag T={T} t0={at('lettera', 1, 0.8)} x={X.y1955} y={ROW - 230} text="«ti spareranno»" size={30} until={at('lettera', 2, 0.1)} />
          <Tag T={T} t0={at('lettera', 2, 0.4)} x={X.y1955} y={ROW - 230} text="strappata" bg={RED} fg="#FFFFFF" size={30} rot={-3} />
          {T >= at('lettera', 3, 1.8) && <g transform={`translate(${X.y1985 + 4} ${ROW + 4}) scale(1.35)`}><Giubbotto k={vest} hit={hit} T={T} /></g>}
          {hit > 0 && hit < 1 && <circle cx={X.y1985 + 400} cy={ROW - 10} r={30 * (1 - hit)} fill="#FFE08A" opacity={1 - hit} />}
          <Tag T={T} t0={shotT + 0.4} x={X.y1985 + 170} y={TY - 90} text="salvo!" size={36} rot={3} />
        </g>
      )}

      {/* ---- 6. scritto: la gara rifiutata, il foglio che si cancella, il ventaglio, «il futuro non è ancora scritto» */}
      {inCh('scritto') && (
        <g opacity={off(T, 'scritto')}>
          <Node card={false} T={T} t0={at('scritto', 0, 0.2)} p={[X.y1985 - 120, ROW]} name="Marty" sub="dice no"><Skate T={T} /></Node>
          {T >= at('scritto', 0, 0.5) && (
            <g transform={`translate(${X.y1985 + 150} ${ROW - 6}) scale(${0.62 * eob(seg(T, at('scritto', 0, 0.5), at('scritto', 0, 0.9)), 1.4)})`}>
              <TimeCar T={T} glow={0} />
              <path d="M-90 -80 L90 60 M90 -80 L-90 60" stroke={RED} strokeWidth={16 * gara} strokeLinecap="round" />
            </g>
          )}
          <Tag T={T} t0={at('scritto', 1, 0.3)} x={X.y1985 + 150} y={ROW + 130} text="niente incidente" size={30} />
          <g transform={`translate(${X.y2015} ${ROW - 30}) scale(${1.1 * eob(seg(T, at('scritto', 2, -0.2), at('scritto', 2, 0.2)), 1.4)})`}><Foglio gone={cancella} /></g>
          <Tag T={T} t0={at('scritto', 2, 2.4)} x={X.y2015} y={ROW + 110} text="licenziamento cancellato" size={28} />
        </g>
      )}
      {(T >= at('scritto', 3, 1.4) || fin > 0) && (
        <text x={FAN + 400} y={TY - 420} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize="92" fill={YEL} stroke={DARK} strokeWidth="10" paintOrder="stroke" opacity={Math.max(scritta, fin)}>
          il futuro non è ancora scritto
        </text>
      )}
      {(oro > 0 || fin > 0) && <Glow id="pp-oro" x={FAN + 700} y={TY} r={260} t={T} color={YEL} amp={0.1} rate={2} opacity={0.45 * Math.max(oro, fin)} />}
    </g>
  );
};

/** Pop con rimbalzo (come pop() degli episodi). */
const pop2 = (T: number, t0: number) => eob(seg(T, t0, t0 + 0.45), 1.7);

// ---------------------------------------------------------------- la scena (paradossi e chiusura)

export const Mondo: React.FC<{ T: number; cam?: { x: number; y: number; z: number }; chiusura?: boolean }> = ({ T, cam, chiusura }) => {
  const c = cam ?? camAt(T);
  setUi(1);
  const flash = flashAt(T, [at('lettera', 3, 2.6)], [0.4]);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="pp" />
        <radialGradient id="pp-bg" cx=".5" cy=".5" r=".75">
          <stop offset="0" stopColor="#2E1E5C" />
          <stop offset=".6" stopColor="#1C1240" />
          <stop offset="1" stopColor="#0C0820" />
        </radialGradient>
        <pattern id="pp-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0 H0 V40" fill="none" stroke="#33255E" strokeWidth="1" /></pattern>
        <pattern id="pp-grid2" width="200" height="200" patternUnits="userSpaceOnUse"><path d="M200 0 H0 V200" fill="none" stroke="#5A2E78" strokeWidth="2" /></pattern>
      </defs>
      <rect width={W} height={H} fill="url(#pp-bg)" />
      <g transform={`translate(960 540) scale(${c.z}) translate(${-c.x} ${-c.y})`}>
        <rect x="-3000" y="-3000" width="10000" height="8000" fill="url(#pp-grid)" opacity=".55" />
        <rect x="-3000" y="-3000" width="10000" height="8000" fill="url(#pp-grid2)" opacity=".5" />
        <Schema T={T} chiusura={chiusura} />
      </g>
      <g opacity={chiusura ? 0.25 : 1}><TopShade id="pp" color="#0C0820" h={230} /></g>
      <Motes16 T={T} color={INK} />
      {flash > 0 && <rect width={W} height={H} fill="#FFF3D0" opacity={0.3 * flash} />}
      <Finish16 id="pp" tint="#1A1238" tintOpacity={0.1} />
    </svg>
  );
};

export const makeParadosso = (id: string): React.FC<ParteProps> => {
  const C: React.FC<ParteProps> = ({ t }) => <Mondo T={STARTS[id] + t} />;
  return C;
};

