import React from 'react';
import { eio, eo, eob, lerp, mod, rng, seg } from '../../lib/anim';
import { Embers, Glow } from '../../lib/elements';
import { DISPLAY, HAND, SANS } from '../../lib/fonts';
import { Finish, FxDefs } from '../../lib/fx';
import { subtitleTimes } from '../../components/ChapterOverlay';
import type { FilmData, SceneProps } from '../../types';
import { Disco, Freccia, Gettone, Stella, Tag } from '../talent/SchemaLive';
import { CONCORRENTI, GIUDICI, giudice, type GiudiceId } from '../talent/x-factor-2026';

// X Factor 2026, Live 4 «Hell Factor» (12 novembre 2026): il riepilogo come SCHEMA (TALENT.md), con il vocabolario fisso
// di src/scenes/talent/SchemaLive.tsx (disco = concorrente, gettone = giudice, anello rosso = ballottaggio, stella,
// cartellino pieno, disco grigio incrinato = eliminato). La serata ha una forma diversa dalle altre (due turni da dieci,
// voti sommati, due uscite dirette, ballottaggio finito due a due e deciso dal Tilt), quindi lo schema è proprio di
// questa puntata e riusa solo i pezzi del motore comune. Il tema della serata è una GIOSTRA (il primo turno) con i
// dischi al posto dei cavalli, sotto la scritta HELL FACTOR con le braci.
// Mondo largo 1080: in alto la serata (y 150–1150), sotto le due colonne dei turni (y 1330–2640), poi il riquadro dei
// quattro meno votati, il ballottaggio, il Tilt e la puntata dopo. La camera porta (x, y) al centro (540, 900) con zoom z.
// Ogni evento è [capitolo, frase, ritardo] sulla griglia delle crome a 120 bpm: gli stessi istanti dello spartito
// scripts/audio/x-factor-2026-live-4.mjs.

export type Quando = readonly [string, number, number?];
type Riga = { id: string; canzone: string; artista: string; quando: Quando };

const INK = '#F1EDF7';
const DIM = '#8C86A0';
const DARK = '#0A0812';
const RED = '#FF4A5A';
const ORO = '#FFC53D';
const BRACE = '#FF7A2C';

const COL = [40, 560] as const;
export const ROW0 = 1420, ROWH = 128;
export const MENO_Y = 2780; // i quattro meno votati
export const BAL_Y = 3380; // ballottaggio
export const TILT_Y = 4080; // il Tilt
export const NEXT_Y = 4560; // la puntata dopo

const pop = (T: number, t0: number) => (T < t0 ? 0 : eob(seg(T, t0, t0 + 0.4), 1.6));
const nome = (id: string) => CONCORRENTI.find((c) => c.id === id)!;
const colore = (id: string) => giudice(nome(id).squadra).colore;
/** Carattere della canzone scritta a mano: entra in `w` unità di mondo (Caveat ≈ 0,44 em per lettera). */
const fit = (s: string, w = 400, max = 34) => Math.min(max, w / (s.length * 0.44));

const rr = rng(4412);
const MOTES = Array.from({ length: 34 }, () => ({ x: rr() * 1080, y: rr() * 1920, s: 1.2 + rr() * 2.4, v: 8 + rr() * 20, ph: rr() * 6 }));

/** Dati della puntata (index.ts). */
export type DatiLive4 = {
  film: FilmData;
  serata: { quandoTema: Quando; quandoTre: Quando; ospite: { testo: string; quando: Quando }; quandoGiostra: Quando; quandoTurno: Quando };
  giostra: Riga[];
  turno2: Riga[];
  quandoTurno2: Quando;
  meno: { subito: [string, string]; ballottaggio: [string, string]; quandoSomma: Quando; quandoSubito: Quando; quandoBal: Quando };
  ballottaggio: { a: { id: string; canzone: string; artista: string }; b: { id: string; canzone: string; artista: string }; quando: Quando; quandoB: Quando;
    voti: Record<GiudiceId, string>; quandoVoti: [Quando, Quando]; quandoPari: Quando };
  tilt: { quando: Quando; quandoSalvi: Quando; salvi: string; fuori: string; quandoFuori: Quando };
  prossimo: { titolo: string; sotto: string; quando: Quando; gruppi: [GiudiceId, string[]][]; usciti: string[]; quandoSolo: Quando; solo: GiudiceId; bollino: string; quandoBollino: Quando };
  camera: [Quando, number, number, number][];
};

/** La giostra a linee chiare: tetto a spicchi nei colori delle squadre, lampadine, palo, pedana; i dischi girano
 *  intorno al palo al posto dei cavalli (salgono e scendono, davanti più grandi). `on` la accende, `n` dischi. */
export const Giostra: React.FC<{ T: number; x: number; y: number; s?: number; on: number; dischi: string[]; fuori?: string[] }> = ({ T, x, y, s = 1, on, dischi, fuori = [] }) => {
  const hue = GIUDICI.map((g) => g.colore);
  const rot = T * 0.55 * on; // giri lenti, solo da accesa
  const R = 250, r = 62; // ellisse della pedana
  const posti = dischi.map((id, i) => {
    const a = rot + (i / dischi.length) * Math.PI * 2;
    const z = Math.sin(a); // 1 = davanti
    return { id, i, a, z, px: Math.cos(a) * R, py: 40 + z * r, bob: Math.sin(T * 2.2 * on + i * 1.3) * 26 };
  });
  const disco = (p: (typeof posti)[number]) => {
    const k = 0.72 + 0.28 * (p.z + 1) / 2;
    const top = -250 + 30 * (1 - k);
    return (
      <g key={p.id} opacity={0.55 + 0.45 * (p.z + 1) / 2}>
        <path d={`M${p.px} ${top} V${p.py}`} stroke={ORO} strokeWidth={6 * k} opacity=".85" />
        <path d={`M${p.px} ${top} V${p.py}`} stroke="#FFF3C4" strokeWidth={2 * k} opacity=".6" strokeDasharray="6 10" strokeDashoffset={-T * 30} />
        <Disco T={T} x={p.px} y={-110 + p.bob} r={56 * k} label={colore(p.id)} gira={on} fuori={fuori.includes(p.id) ? 1 : 0} />
      </g>
    );
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <Glow id="l4-gg" x={0} y={-120} r={460} t={T} color={ORO} amp={0.06} rate={2.4} opacity={0.12 + 0.3 * on} />
      {/* pedana: due ellissi con il bordo a strisce */}
      <ellipse cx="0" cy="70" rx={R + 40} ry={r + 22} fill="#160F22" stroke={INK} strokeWidth="5" />
      <ellipse cx="0" cy="40" rx={R + 40} ry={r + 22} fill="#1E1530" stroke={INK} strokeWidth="5" />
      {Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI;
        const px = Math.cos(a) * (R + 40), py = 40 + Math.sin(a) * (r + 22);
        return <path key={i} d={`M${px} ${py} V${py + 30}`} stroke={hue[i % 4]} strokeWidth="5" opacity={0.3 + 0.5 * on} />;
      })}
      {/* dischi dietro il palo */}
      {posti.filter((p) => p.z < 0).sort((a, b) => a.z - b.z).map(disco)}
      {/* palo centrale a spirale */}
      <rect x="-16" y="-270" width="32" height="310" rx="8" fill="#2A1E3C" stroke={INK} strokeWidth="4" />
      {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M-16 ${-250 + i * 44 + mod(T * 40 * on, 44)} L16 ${-232 + i * 44 + mod(T * 40 * on, 44)}`} stroke={ORO} strokeWidth="5" opacity=".7" />)}
      {/* tetto a spicchi */}
      {Array.from({ length: 8 }, (_, i) => {
        const x0 = -R - 50 + i * ((2 * R + 100) / 8), x1 = x0 + (2 * R + 100) / 8;
        return <path key={i} d={`M0 -430 L${x0} -270 Q${(x0 + x1) / 2} -236 ${x1} -270 Z`} fill={i % 2 ? '#241838' : hue[(i / 2) % 4 | 0]} opacity={i % 2 ? 1 : 0.35 + 0.5 * on} stroke={INK} strokeWidth="4" strokeLinejoin="round" />;
      })}
      {/* lampadine sulla gronda che si accendono a rincorsa */}
      {Array.from({ length: 17 }, (_, i) => {
        const bx = -R - 50 + i * ((2 * R + 100) / 16);
        const acc = on > 0.3 && mod(Math.floor(T * 6) - i, 4) === 0;
        return <circle key={i} cx={bx} cy={-262 + (i % 2 ? 10 : 0)} r="8" fill={acc ? '#FFF3C4' : '#5A4E3A'} stroke={DARK} strokeWidth="2" />;
      })}
      {/* puntale con la bandierina */}
      <path d="M0 -430 V-500" stroke={INK} strokeWidth="5" />
      <path d={`M0 -500 L${54 + Math.sin(T * 3) * 6} ${-486 + Math.sin(T * 3) * 3} L0 -470 Z`} fill={RED} stroke={DARK} strokeWidth="3" />
      <circle cx="0" cy="-430" r="12" fill={ORO} stroke={DARK} strokeWidth="3" />
      {/* dischi davanti al palo */}
      {posti.filter((p) => p.z >= 0).sort((a, b) => a.z - b.z).map(disco)}
    </g>
  );
};

/** Riga di un turno: disco + nome + canzone scritta a mano (si stringe se lunga) + artista. */
const RigaTurno: React.FC<{ T: number; t0: number; x: number; y: number; r: Riga; gira: number; rosso: number; fuori: number }> = ({ T, t0, x, y, r, gira, rosso, fuori }) => {
  if (T < t0) return null;
  const p = pop(T, t0);
  const c = colore(r.id);
  return (
    <g opacity={seg(T, t0, t0 + 0.2)}>
      <g transform={`translate(${x + 56} ${y}) scale(${p}) translate(${-x - 56} ${-y})`}>
        <Disco T={T} x={x + 56} y={y} r={50} label={c} gira={gira} rosso={rosso} fuori={fuori} />
      </g>
      <text x={x + 124} y={y - 14} fontFamily={SANS} fontWeight={800} fontSize="36" fill={fuori > 0.5 ? DIM : INK}>{nome(r.id).nome}</text>
      <text x={x + 124} y={y + 24} fontFamily={HAND} fontWeight={700} fontSize={fit(r.canzone)} fill={fuori > 0.5 ? DIM : c} opacity={seg(T, t0 + 0.25, t0 + 0.6)}>{r.canzone}</text>
      <text x={x + 126} y={y + 54} fontFamily={SANS} fontWeight={400} fontSize="22" letterSpacing="1" fill={DIM} opacity={seg(T, t0 + 0.4, t0 + 0.8)}>{r.artista.toUpperCase()}</text>
    </g>
  );
};

/** Telefono a linee chiare (il televoto del Tilt), con le onde del voto che partono. */
const Telefono: React.FC<{ T: number; x: number; y: number; on: number }> = ({ T, x, y, on }) => (
  <g transform={`translate(${x} ${y})`}>
    <Glow id="l4-tel" x={0} y={0} r={200} t={T} color={ORO} amp={0.1} rate={4} opacity={0.35 * on} />
    {[0, 1, 2].map((k) => {
      const u = mod(T * 0.9 + k / 3, 1);
      return (
        <g key={k} opacity={on * (1 - u)}>
          <path d={`M${-80 - 60 * u} ${-40 - 30 * u} Q${-110 - 70 * u} 0 ${-80 - 60 * u} ${40 + 30 * u}`} fill="none" stroke={ORO} strokeWidth="5" strokeLinecap="round" />
          <path d={`M${80 + 60 * u} ${-40 - 30 * u} Q${110 + 70 * u} 0 ${80 + 60 * u} ${40 + 30 * u}`} fill="none" stroke={ORO} strokeWidth="5" strokeLinecap="round" />
        </g>
      );
    })}
    <rect x="-56" y="-100" width="112" height="200" rx="20" fill="#18122A" stroke={INK} strokeWidth="5" />
    <rect x="-42" y="-76" width="84" height="132" rx="8" fill="#0E0A18" stroke="#3A3448" strokeWidth="3" />
    {/* sullo schermo le barre del voto che salgono a turno (nessun numero: non si conoscono le percentuali) */}
    {[0, 1, 2, 3].map((k) => {
      const h = 20 + 70 * Math.abs(Math.sin(T * 3 + k * 1.3)) * on;
      return <rect key={k} x={-32 + k * 17} y={46 - h} width="12" height={h} rx="3" fill={k % 2 ? ORO : INK} opacity=".85" />;
    })}
    <circle cx="0" cy="78" r="9" fill="none" stroke={INK} strokeWidth="3" />
    <path d="M-14 -88 H14" stroke={INK} strokeWidth="4" strokeLinecap="round" />
  </g>
);

export const makeSchemaLive4 = (D: DatiLive4) => {
  const bpm = D.film.bpm ?? 120;
  const T0 = D.film.copertina.durata;
  const STARTS: Record<string, number> = {};
  const CUES: Record<string, number[]> = {};
  let acc = T0;
  for (const c of D.film.capitoli) {
    STARTS[c.id] = acc;
    CUES[c.id] = subtitleTimes(c.sottotitoli, c.durata).map(([a]) => a);
    acc += c.durata;
  }
  const passo = 60 / bpm / 2;
  const G = (s: number) => T0 + Math.round((s - T0) / passo) * passo;
  const at = ([id, n, d = 0]: Quando) => G(STARTS[id] + CUES[id][n] + d);

  const shots = D.camera.map(([q, x, y, z]) => ({ at: at(q), x, y, z }));
  const camAt = (T: number) => {
    let o = { x: shots[0].x, y: shots[0].y, z: shots[0].z };
    for (const s of shots.slice(1)) {
      const p = eio(seg(T, s.at - 0.25, s.at + 1.0));
      o = { x: lerp(o.x, s.x, p), y: lerp(o.y, s.y, p), z: Math.exp(lerp(Math.log(o.z), Math.log(s.z), p)) };
    }
    return { x: o.x + Math.sin(T * 0.3) * 6, y: o.y + Math.cos(T * 0.25) * 5, z: o.z * (1 + 0.01 * Math.sin(T * 0.2)) };
  };

  const S = D.serata, M = D.meno, B = D.ballottaggio, TL = D.tilt, P = D.prossimo;
  const dieci = D.giostra.map((r) => r.id);

  const Schema: React.FC<{ T: number; foc: number }> = ({ T, foc }) => {
    const tTema = at(S.quandoTema), tTre = at(S.quandoTre), tGi = at(S.quandoGiostra), tTu = at(S.quandoTurno);
    const tSom = at(M.quandoSomma), tSub = at(M.quandoSubito), tBal = at(M.quandoBal);
    const tA = at(B.quando), tB = at(B.quandoB), tV1 = at(B.quandoVoti[0]), tV2 = at(B.quandoVoti[1]), tPari = at(B.quandoPari);
    const tTilt = at(TL.quando), tSalvi = at(TL.quandoSalvi), tFuori = at(TL.quandoFuori);
    const giostraOn = eo(seg(T, tGi, tGi + 0.8));
    // chi è fuori, e da quando: le due uscite dirette al riquadro dei meno votati, Alìa al Tilt
    const fuoriDa = (id: string) => (M.subito.includes(id) ? tSub + 0.4 : id === TL.fuori ? tFuori : Infinity);
    const fu = (id: string) => eo(seg(T, fuoriDa(id), fuoriDa(id) + 0.6));
    const inBal = (id: string) => (M.ballottaggio.includes(id) ? eo(seg(T, tBal, tBal + 0.4)) * (1 - fu(id)) : 0);

    return (
      <g>
        {/* ── LA SERATA ── */}
        <g opacity={seg(T, tTema - 0.3, tTema + 0.2)}>
          <Embers t={T} x={540} y={420} w={760} h={360} n={46} seed={12} hot="#FFD36A" warm={BRACE} drift={60} />
          <Glow id="l4-hell" x={540} y={250} r={420} t={T} color={BRACE} amp={0.1} rate={3} opacity={0.28} />
          <text x="540" y="282" textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize="88" letterSpacing="4" fill={ORO} stroke={DARK} strokeWidth="6" paintOrder="stroke"
            transform={`translate(540 250) scale(${pop(T, tTema)}) translate(-540 -250)`}>HELL FACTOR</text>
          <Tag T={T} t0={tTre} x={540} y={372} testo="3 FUORI IN UNA SERA" size={34} bg={RED} fg={INK} rot={-2} />
          <Giostra T={T} x={540} y={900} s={0.95} on={giostraOn} dischi={dieci} fuori={dieci.filter((id) => fu(id) > 0.5)} />
        </g>
        {/* ospite e regola del primo turno */}
        {T > at(S.ospite.quando) && (
          <g>
            <Tag T={T} t0={at(S.ospite.quando)} x={800} y={1080} testo="OSPITE" size={28} rot={3} bg={INK} />
            <text x="800" y="1148" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="40" fill={INK} opacity={seg(T, at(S.ospite.quando) + 0.3, at(S.ospite.quando) + 0.6)}>{S.ospite.testo}</text>
            <g transform={`translate(970 1040) scale(${pop(T, at(S.ospite.quando) + 0.3)})`}><Stella T={T} t0={0} x={0} y={0} s={0.6} /></g>
          </g>
        )}
        {T > tTu && (
          <g>
            <Tag T={T} t0={tTu} x={250} y={1080} testo="TURNO 1 · LA GIOSTRA" size={26} rot={-3} />
            <text x="250" y="1146" textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize="40" fill={INK} opacity={seg(T, tTu + 0.3, tTu + 0.7)}>un brano già cantato</text>
          </g>
        )}

        {/* ── LE DUE COLONNE ── */}
        {[D.giostra, D.turno2].map((righe, k) => {
          // la colonna del turno 2 si apre con la frase che lo presenta, prima del primo disco
          const t0 = k === 1 ? at(D.quandoTurno2) : at(righe[0].quando) - 0.6;
          if (T < t0) return null;
          const x = COL[k];
          const tFine = k === 0 ? at(D.turno2[0].quando) : tSom;
          return (
            <g key={k} opacity={1 - 0.8 * Math.max(0, k === 0 ? foc : -foc)}>
              <text x={x + 10} y={ROW0 - 96} fontFamily={DISPLAY} fontWeight={800} fontSize="46" letterSpacing="4" fill={INK} opacity={seg(T, t0, t0 + 0.4)}>{k === 0 ? 'LA GIOSTRA' : 'TURNO 2'}</text>
              <text x={x + 12} y={ROW0 - 52} fontFamily={HAND} fontWeight={700} fontSize="34" fill={ORO} opacity={seg(T, t0 + 0.3, t0 + 0.7)}>{k === 0 ? 'brani già cantati' : 'scelti dai giudici'}</text>
              {righe.map((r, i) => {
                const t1 = at(r.quando);
                const prossima = i + 1 < righe.length ? at(righe[i + 1].quando) : tFine;
                const gira = T >= t1 && T < prossima + 0.4 ? 1 : 0.05;
                return <RigaTurno key={r.id} T={T} t0={t1} x={x} y={ROW0 + i * ROWH} r={r} gira={gira} rosso={inBal(r.id)} fuori={fu(r.id)} />;
              })}
            </g>
          );
        })}
        {/* la somma dei voti dei due turni */}
        {T > tSom && (
          <g transform={`translate(475 1338) scale(${pop(T, tSom)})`}>
            <Glow id="l4-somma" x={0} y={0} r={160} t={T} color={ORO} amp={0.1} rate={4} opacity={0.45} />
            <circle r="50" fill={ORO} stroke={DARK} strokeWidth="6" />
            <path d="M-26 0 H26 M0 -26 V26" stroke={DARK} strokeWidth="11" strokeLinecap="round" />
          </g>
        )}
        {T > tSom && <Tag T={T} t0={tSom + 0.3} x={475} y={1236} testo="SOMMA DEI VOTI" size={30} rot={-2} />}

        {/* ── I QUATTRO MENO VOTATI ── */}
        {T > tSom + 0.2 && (() => {
          const box = seg(T, tSom + 0.2, tSom + 0.8);
          return (
            <g>
              <g opacity={box}>
                <rect x="70" y={MENO_Y} width="940" height="540" rx="40" fill="#160E20" opacity=".8" />
                <rect x="70" y={MENO_Y} width="940" height="540" rx="40" fill="none" stroke={INK} strokeWidth="5" strokeDasharray="18 12" />
                <text x="540" y={MENO_Y + 82} textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize="50" fill={INK}>I 4 MENO VOTATI</text>
              </g>
              {/* i quattro restano segnati anche nelle colonne: grigi i due fuori, rossi i due al ballottaggio */}
              {/* le due uscite dirette */}
              {M.subito.map((id, j) => {
                const x = [230, 390][j], y = MENO_Y + 260, t0 = tSub + j * 0.25;
                if (T < t0) return null;
                return (
                  <g key={id}>
                    <g transform={`translate(${x} ${y}) scale(${pop(T, t0)}) translate(${-x} ${-y})`}><Disco T={T} x={x} y={y} r={66} label={colore(id)} fuori={fu(id)} /></g>
                    <text x={x} y={y + 112} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="34" fill={fu(id) > 0.5 ? DIM : INK}>{nome(id).nome}</text>
                  </g>
                );
              })}
              {T > tSub + 0.6 && <Tag T={T} t0={tSub + 0.6} x={310} y={MENO_Y + 474} testo="FUORI SUBITO" size={32} bg={INK} fg={RED} rot={-4} />}
              {/* gli altri due al ballottaggio */}
              {T > tBal && <circle cx="770" cy={MENO_Y + 270} r="175" fill="none" stroke={RED} strokeWidth="7" pathLength={1} strokeDasharray={`${eo(seg(T, tBal, tBal + 0.6))} 1`} />}
              {M.ballottaggio.map((id, j) => {
                const x = [705, 835][j], y = MENO_Y + 250, t0 = tBal + 0.2 + j * 0.25;
                if (T < t0) return null;
                return (
                  <g key={id}>
                    <g transform={`translate(${x} ${y}) scale(${pop(T, t0)}) translate(${-x} ${-y})`}><Disco T={T} x={x} y={y} r={62} label={colore(id)} rosso={inBal(id)} fuori={fu(id)} /></g>
                    <text x={x} y={y + 104} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="30" fill={INK}>{nome(id).nome}</text>
                  </g>
                );
              })}
              {T > tBal + 0.8 && <Tag T={T} t0={tBal + 0.8} x={770} y={MENO_Y + 482} testo="BALLOTTAGGIO" size={30} bg={RED} fg={INK} rot={3} />}
            </g>
          );
        })()}

        {/* ── IL BALLOTTAGGIO ── */}
        {T > tA - 0.5 && (
          <g>
            <g opacity={seg(T, tA - 0.5, tA)}>
              <rect x="70" y={BAL_Y} width="940" height="640" rx="40" fill="#1A0E18" opacity=".7" />
              <rect x="70" y={BAL_Y} width="940" height="640" rx="40" fill="none" stroke={RED} strokeWidth="7" pathLength={1} strokeDasharray={`${eo(seg(T, tA - 0.5, tA + 0.5))} 1`} />
              <Tag T={T} t0={tA - 0.3} x={540} y={BAL_Y} testo="BALLOTTAGGIO" size={34} bg={RED} fg={INK} />
            </g>
            {[B.a, B.b].map((s, j) => {
              const t0 = j === 0 ? tA : tB;
              const x = j === 0 ? 300 : 780;
              const f = fu(s.id);
              const salvo = s.id === TL.salvi ? eo(seg(T, tSalvi, tSalvi + 0.5)) : 0;
              if (T < t0) return null;
              return (
                <g key={s.id}>
                  {salvo > 0.01 && <Glow id={`l4-salvo${j}`} x={x} y={BAL_Y + 300} r={240} t={T} color={ORO} amp={0.1} rate={4} opacity={0.55 * salvo} />}
                  <g transform={`translate(${x} ${BAL_Y + 300}) scale(${pop(T, t0)}) translate(${-x} ${-BAL_Y - 300})`}>
                    <Disco T={T} x={x} y={BAL_Y + 300} r={92} label={colore(s.id)} gira={f > 0.5 ? 0 : 1} rosso={(1 - f) * (1 - salvo)} fuori={f} />
                  </g>
                  <text x={x} y={BAL_Y + 98} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="42" fill={f > 0.5 ? DIM : INK}>{nome(s.id).nome}</text>
                  <text x={x} y={BAL_Y + 144} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={fit(s.canzone, 400, 38)} fill={colore(s.id)} opacity={seg(T, t0 + 0.3, t0 + 0.6)}>{s.canzone}</text>
                  <text x={x} y={BAL_Y + 178} textAnchor="middle" fontFamily={SANS} fontWeight={400} fontSize="22" letterSpacing="1" fill={DIM} opacity={seg(T, t0 + 0.4, t0 + 0.8)}>{s.artista.toUpperCase()}</text>
                  {f > 0.5 && <Tag T={T} t0={tFuori + 0.3} x={x} y={BAL_Y + 300} testo="FUORI" size={40} bg={INK} fg={RED} rot={-10} />}
                  {salvo > 0.5 && <Tag T={T} t0={tSalvi + 0.3} x={x} y={BAL_Y + 300} testo="SALVI" size={40} bg={ORO} fg={DARK} rot={8} />}
                </g>
              );
            })}
            {/* i quattro giudici: prima Gabbani e Jake, poi Paola e Irama */}
            {GIUDICI.map((g, i) => {
              const t0 = (i < 2 ? tV1 : tV2) + (i % 2) * 0.5;
              if (T < t0) return null;
              const gx = 175 + i * 243, gy = BAL_Y + 560;
              const target = B.voti[g.id] === B.a.id ? 300 : 780;
              return (
                <g key={g.id}>
                  <Freccia T={T} t0={t0 + 0.15} a={[gx, gy - 40]} b={[target + (i - 1.5) * 22, BAL_Y + 404]} c={[(gx + target) / 2, gy - 60]} color={g.colore} w={5} />
                  <g transform={`translate(${gx} ${gy}) scale(${pop(T, t0)}) translate(${-gx} ${-gy})`}><Gettone x={gx} y={gy} id={g.id} s={0.95} /></g>
                </g>
              );
            })}
            {T > tPari && (
              <g transform={`translate(540 ${BAL_Y + 300}) rotate(-4) scale(${pop(T, tPari) * 1.1})`}>
                <Glow id="l4-pari" x={0} y={0} r={170} t={T} color={ORO} amp={0.1} rate={5} opacity={0.5} />
                <Tag T={T} t0={tPari} x={0} y={0} testo="2 A 2" size={52} />
              </g>
            )}
          </g>
        )}

        {/* ── IL TILT ── */}
        {T > tTilt - 0.4 && (
          <g>
            <g opacity={seg(T, tTilt - 0.4, tTilt + 0.1)}>
              <rect x="70" y={TILT_Y} width="940" height="380" rx="40" fill="#120E22" opacity=".8" />
              <rect x="70" y={TILT_Y} width="940" height="380" rx="40" fill="none" stroke={ORO} strokeWidth="6" />
            </g>
            <g transform={`translate(330 ${TILT_Y + 120}) rotate(-3) scale(${pop(T, tTilt)})`}><Tag T={T} t0={tTilt} x={0} y={0} testo="TILT" size={64} /></g>
            <text x="330" y={TILT_Y + 260} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize="46" fill={INK} opacity={seg(T, tTilt + 0.3, tTilt + 0.7)}>televoto lampo:</text>
            <text x="330" y={TILT_Y + 316} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize="46" fill={INK} opacity={seg(T, tTilt + 0.5, tTilt + 0.9)}>decide il pubblico</text>
            <Telefono T={T} x={760} y={TILT_Y + 190} on={eo(seg(T, tTilt + 0.2, tTilt + 0.8))} />
            {/* dal telefono al disco salvato, passando a destra dei giudici */}
            <Freccia T={T} t0={tSalvi} a={[850, TILT_Y + 110]} b={[870, BAL_Y + 360]} c={[1080, TILT_Y - 300]} color={ORO} w={7} />
          </g>
        )}

        {/* ── LA PUNTATA DOPO ── */}
        {T > at(P.quando) - 0.5 && (() => {
          const t0 = at(P.quando), tSo = at(P.quandoSolo), tBo = at(P.quandoBollino);
          const pos: [number, number][] = [[300, NEXT_Y + 240], [780, NEXT_Y + 240], [300, NEXT_Y + 520], [780, NEXT_Y + 520]];
          return (
            <g>
              <g opacity={seg(T, t0 - 0.5, t0)}>
                <rect x="70" y={NEXT_Y} width="940" height="1000" rx="40" fill="#120E22" opacity=".8" />
                <rect x="70" y={NEXT_Y} width="940" height="1000" rx="40" fill="none" stroke={ORO} strokeWidth="6" />
                <text x="540" y={NEXT_Y + 90} textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize="52" fill={ORO}>{P.titolo}</text>
                <text x="540" y={NEXT_Y + 140} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize="40" fill={INK}>{P.sotto}</text>
              </g>
              {P.gruppi.map(([gid, ids], gi) => {
                const [cx, cy] = pos[gi];
                const tg = t0 + gi * 0.25;
                if (T < tg) return null;
                const solo = gid === P.solo ? eo(seg(T, tSo, tSo + 0.5)) : 0;
                return (
                  <g key={gid}>
                    {solo > 0.01 && <Glow id="l4-solo" x={cx} y={cy + 60} r={250} t={T} color={ORO} amp={0.12} rate={4} opacity={0.5 * solo} />}
                    {solo > 0.01 && <rect x={cx - 210} y={cy - 70} width="420" height="290" rx="30" fill="none" stroke={ORO} strokeWidth={5 * solo} />}
                    <g transform={`translate(${cx} ${cy - 20}) scale(${pop(T, tg)}) translate(${-cx} ${-cy + 20})`}><Gettone x={cx} y={cy - 20} id={gid} s={0.85} /></g>
                    {ids.map((id, j) => {
                      const x = cx + (ids.length === 1 ? 0 : j === 0 ? -95 : 95), y = cy + 95, tj = tg + 0.2 + j * 0.15;
                      if (T < tj) return null;
                      const corto = nome(id).nome.length > 12 ? nome(id).nome.split(' ')[0] : nome(id).nome;
                      return (
                        <g key={id}>
                          <g transform={`translate(${x} ${y}) scale(${pop(T, tj)}) translate(${-x} ${-y})`}><Disco T={T} x={x} y={y} r={56} label={colore(id)} gira={0.4} /></g>
                          <text x={x} y={y + 94} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="28" fill={INK} opacity={seg(T, tj + 0.1, tj + 0.3)}>{corto}</text>
                        </g>
                      );
                    })}
                  </g>
                );
              })}
              {/* i tre usciti al Live 4, grigi in fila */}
              {T > t0 + 1.2 && (
                <g opacity={seg(T, t0 + 1.2, t0 + 1.6)}>
                  <text x="540" y={NEXT_Y + 760} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize="38" fill={DIM}>fuori al Live 4</text>
                  {P.usciti.map((id, j) => (
                    <g key={id}>
                      <Disco T={T} x={360 + j * 180} y={NEXT_Y + 830} r={42} label={colore(id)} fuori={1} />
                      <text x={360 + j * 180} y={NEXT_Y + 898} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="24" fill={DIM}>{nome(id).nome}</text>
                    </g>
                  ))}
                </g>
              )}
              {T > tBo && (
                <g transform={`translate(540 ${NEXT_Y + 1000}) rotate(-3) scale(${pop(T, tBo) * 1.1})`}>
                  <Glow id="l4-bo" x={0} y={0} r={260} t={T} color={ORO} amp={0.1} rate={5} opacity={0.5} />
                  <Tag T={T} t0={tBo} x={0} y={0} testo={P.bollino} size={50} />
                </g>
              )}
            </g>
          );
        })()}
      </g>
    );
  };

  return (chapterId: string): React.FC<SceneProps> => {
    const Scene: React.FC<SceneProps> = ({ t }) => {
      const T = STARTS[chapterId] + t;
      const c = camAt(T);
      return (
        <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <FxDefs id="l4" />
            <radialGradient id="l4-bg" cx=".5" cy=".46" r=".8">
              <stop offset="0" stopColor="#231A3C" />
              <stop offset=".6" stopColor="#140F24" />
              <stop offset="1" stopColor="#09070F" />
            </radialGradient>
            <linearGradient id="l4-scrim" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#09070F" stopOpacity=".96" />
              <stop offset=".82" stopColor="#09070F" stopOpacity=".88" />
              <stop offset="1" stopColor="#09070F" stopOpacity="0" />
            </linearGradient>
            <pattern id="l4-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0 H0 V40" fill="none" stroke="#2A2240" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="1080" height="1920" fill="url(#l4-bg)" />
          {GIUDICI.map((g, i) => (
            <Glow key={g.id} id={`l4-bg${i}`} x={540 + Math.sin(T * 0.13 + i * 1.7) * 420} y={900 + Math.cos(T * 0.11 + i * 2.1) * 560} r={520} t={T} color={g.colore} amp={0.05} rate={0.7} ph={i} opacity={0.1} />
          ))}
          <g transform={`translate(540 900) scale(${c.z}) translate(${-c.x} ${-c.y})`}>
            <rect x="-5000" y="-5000" width="11080" height="16000" fill="url(#l4-grid)" opacity=".55" />
            <Schema T={T} foc={c.z > 1 ? Math.max(-1, Math.min(1, (c.x - 540) / 200)) : 0} />
          </g>
          <rect width="1080" height="560" fill="url(#l4-scrim)" />
          {MOTES.map((m, i) => (
            <circle key={i} cx={mod(m.x + Math.sin(T * 0.5 + m.ph) * 30, 1080)} cy={mod(m.y - T * m.v, 1920)} r={m.s} fill={INK} opacity={0.08 + 0.06 * Math.sin(T * 2 + m.ph)} />
          ))}
          <Finish id="l4" tint="#2A1E4A" tintOpacity={0.1} />
        </svg>
      );
    };
    return Scene;
  };
};
