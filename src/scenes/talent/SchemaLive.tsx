import React from 'react';
import { eio, eo, eob, lerp, mod, rng, seg } from '../../lib/anim';
import { Glow } from '../../lib/elements';
import { DISPLAY, HAND, SANS } from '../../lib/fonts';
import { Finish, FxDefs } from '../../lib/fx';
import { subtitleTimes } from '../../components/ChapterOverlay';
import type { FilmData, SceneProps } from '../../types';
import { CONCORRENTI, GIUDICI, giudice, type GiudiceId } from './x-factor-2026';

// Il riepilogo di una puntata dei talent come SCHEMA (TALENT.md): un unico diagramma su lavagna scura che si costruisce
// frase dopo frase, come lo Spiegato semplice; la camera va sulla parte di cui parla la voce e alla fine si allarga.
// Vocabolario fisso: disco in vinile con l'etichetta nel colore della squadra = concorrente (nome e canzone scritti
// accanto, la canzone a mano); gettone tondo colorato = giudice; anello rosso = ballottaggio; freccia rossa tratteggiata
// = va al ballottaggio; stella d'oro = applausi in piedi; cartellino pieno = fatto importante della serata; disco grigio
// incrinato = eliminato. Mai persone, microfoni con figure, logo o scenografia vera.
// Il motore è comune; ogni puntata passa i suoi dati (serata, turni, ballottaggio, puntata dopo) e dice in quale
// capitolo e su quale frase entra ogni pezzo (`[idCapitolo, frase, ritardo]`).
// Mondo: larghezza 1080; la camera porta il punto (x, y) al centro (540, 900) con zoom z. Eventi sulla griglia della
// musica (crome a `bpm`), gli stessi istanti dello spartito.

export type Quando = readonly [string, number, number?];
export type Riga = { id: string; canzone: string; artista?: string; quando: Quando; stella?: Quando; tag?: { testo: string; quando: Quando } };
export type Turno = { titolo: string; righe: Riga[]; ultimo: string; quandoUltimo: Quando };
export type DatiPuntata = {
  film: FilmData;
  serata: { tema: string; sotto: string; quandoTema: Quando; quandoNote: Quando; apertura: { testo: string; dischi: string[]; quando: Quando }; ospite: { testo: string; quando: Quando } };
  turni: [Turno, Turno];
  ballottaggio: { a: { id: string; canzone: string }; b: { id: string; canzone: string }; quando: Quando; quandoB: Quando; voti: Record<GiudiceId, string>; quandoVoti: Quando; fuori: string; quandoFuori: Quando };
  prossimo: { titolo: string; sotto: string; quando: Quando; quandoRegola: Quando; quandoBallottaggio: Quando; avviso: string; quandoAvviso: Quando; quandoLargo: Quando; rimasti: string[] };
  /** Inquadrature: [quando, x, y, zoom]. */
  camera: [Quando, number, number, number][];
};

const INK = '#F1EDF7';
const DIM = '#8C86A0';
const DARK = '#0A0812';
const RED = '#FF4A5A';
const ORO = '#FFC53D';
const SPENTO = '#5A5468';

// colonne dei turni e righe
const COL = [40, 560] as const;
export const ROW0 = 1420, ROWH = 128;
export const BAL_Y = 2300;
export const NEXT_Y = 3040;

const pop = (T: number, t0: number) => (T < t0 ? 0 : eob(seg(T, t0, t0 + 0.4), 1.6));
const nome = (id: string) => CONCORRENTI.find((c) => c.id === id)!;
const colore = (id: string) => giudice(nome(id).squadra).colore;

const rr = rng(3305);
const MOTES = Array.from({ length: 34 }, () => ({ x: rr() * 1080, y: rr() * 1920, s: 1.2 + rr() * 2.4, v: 8 + rr() * 20, ph: rr() * 6 }));
const NOTE = Array.from({ length: 9 }, (_, i) => ({ dx: -160 + rr() * 320, ph: rr(), sp: 0.16 + rr() * 0.1, k: i % 2 }));

/** Disco in vinile: solchi, riflesso che gira, etichetta colorata col foro. `fuori` lo spegne e lo incrina. */
export const Disco: React.FC<{ T: number; x: number; y: number; r: number; label: string; gira?: number; fuori?: number; rosso?: number; testo?: string }> = ({ T, x, y, r, label, gira = 0, fuori = 0, rosso = 0, testo }) => {
  const lab = fuori > 0.5 ? SPENTO : label;
  const rot = (T * 140 * gira) % 360;
  return (
    <g transform={`translate(${x} ${y})`}>
      {rosso > 0.01 && <Glow id={`sl-r${Math.round(x)}${Math.round(y)}`} x={0} y={0} r={r * 2.2} t={T} color={RED} amp={0.12} rate={5} opacity={0.6 * rosso} />}
      <circle r={r + 3} fill="#000" opacity=".4" transform="translate(4 6)" />
      <circle r={r} fill={fuori > 0.5 ? '#2A2632' : '#121018'} stroke={rosso > 0.5 ? RED : '#3A3448'} strokeWidth={rosso > 0.5 ? 6 : 3} />
      {[0.86, 0.74, 0.62, 0.5].map((k) => <circle key={k} r={r * k} fill="none" stroke="#2C2838" strokeWidth="2" />)}
      <g transform={`rotate(${rot})`} opacity={fuori > 0.5 ? 0.2 : 1}>
        <path d={`M${-r * 0.82} ${-r * 0.3} A${r * 0.88} ${r * 0.88} 0 0 1 ${-r * 0.3} ${-r * 0.82}`} stroke="#FFFFFF" strokeWidth={r * 0.08} fill="none" opacity=".28" strokeLinecap="round" />
        <path d={`M${r * 0.82} ${r * 0.3} A${r * 0.88} ${r * 0.88} 0 0 1 ${r * 0.3} ${r * 0.82}`} stroke="#FFFFFF" strokeWidth={r * 0.05} fill="none" opacity=".16" strokeLinecap="round" />
        <circle r={r * 0.38} fill={lab} />
        <path d={`M${-r * 0.24} ${-r * 0.06} H${r * 0.24} M${-r * 0.18} ${r * 0.12} H${r * 0.18}`} stroke={DARK} strokeWidth={r * 0.04} opacity=".45" />
      </g>
      <circle r={r * 0.06} fill={DARK} />
      {testo && <text y={r * 0.32} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={r * 0.95} fill={INK} stroke={DARK} strokeWidth={r * 0.1} paintOrder="stroke">{testo}</text>}
      {fuori > 0.01 && (
        <path d={`M${-r * 0.2} ${-r * 0.98} L${-r * 0.02} ${-r * 0.4} L${-r * 0.24} ${r * 0.1} L${r * 0.12} ${r * 0.55} L${-r * 0.05} ${r * 0.98}`} fill="none" stroke={INK} strokeWidth={r * 0.06} strokeLinejoin="round"
          pathLength={1} strokeDasharray={`${eo(fuori)} 1`} />
      )}
    </g>
  );
};

/** Cartellino pieno (fatto importante). */
const Tag: React.FC<{ T: number; t0: number; x: number; y: number; testo: string; bg?: string; fg?: string; size?: number; rot?: number; anchor?: 'middle' | 'start' }> = ({ T, t0, x, y, testo, bg = ORO, fg = DARK, size = 30, rot = 0, anchor = 'middle' }) => {
  if (T < t0) return null;
  const w = testo.length * size * 0.6 + size * 1.1;
  const x0 = anchor === 'middle' ? -w / 2 : 0;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${pop(T, t0)})`}>
      <rect x={x0 + 4} y={-size * 0.95 + 5} width={w} height={size * 1.6} rx={size * 0.35} fill="#000" opacity=".35" />
      <rect x={x0} y={-size * 0.95} width={w} height={size * 1.6} rx={size * 0.35} fill={bg} />
      <text x={x0 + w / 2} y={size * 0.33} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={size} letterSpacing="1.5" fill={fg}>{testo}</text>
    </g>
  );
};

/** Stella d'oro degli applausi in piedi. */
export const Stella: React.FC<{ T: number; t0: number; x: number; y: number; s?: number }> = ({ T, t0, x, y, s = 1 }) => {
  if (T < t0) return null;
  const p = pop(T, t0);
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (i * Math.PI) / 5 - Math.PI / 2, rad = i % 2 ? 15 : 34;
    return `${(Math.cos(a) * rad).toFixed(1)},${(Math.sin(a) * rad).toFixed(1)}`;
  }).join(' ');
  return (
    <g transform={`translate(${x} ${y}) scale(${p * s}) rotate(${Math.sin(T * 2) * 6})`}>
      <Glow id={`sl-st${x}${y}`} x={0} y={0} r={80} t={T} color={ORO} amp={0.15} rate={4} opacity={0.6} />
      <polygon points={pts} fill={ORO} stroke={DARK} strokeWidth="4" strokeLinejoin="round" />
      {[0, 1, 2].map((k) => {
        const u = mod(T * 0.8 + k / 3, 1);
        return <circle key={k} cx={Math.cos(k * 2.1) * (36 + 30 * u)} cy={Math.sin(k * 2.1) * (36 + 30 * u)} r={4 * (1 - u)} fill={ORO} />;
      })}
    </g>
  );
};

/** Gettone del giudice. */
const Gettone: React.FC<{ x: number; y: number; id: GiudiceId; s?: number; o?: number }> = ({ x, y, id, s = 1, o = 1 }) => {
  const g = giudice(id);
  const etichetta = id === 'paola' ? 'Paola Iezzi' : g.corto;
  const size = Math.min(30, 170 / (etichetta.length * 0.58));
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      <rect x="-98" y="-34" width="196" height="68" rx="34" fill={g.colore} stroke={DARK} strokeWidth="5" />
      <text y={size * 0.36} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={size} fill={DARK}>{etichetta}</text>
    </g>
  );
};

/** Freccia scritta a mano che si disegna. */
const Freccia: React.FC<{ T: number; t0: number; a: [number, number]; b: [number, number]; c?: [number, number]; color?: string; dashed?: boolean; w?: number; label?: string; lx?: number; ly?: number }> = ({
  T, t0, a, b, c, color = INK, dashed, w = 6, label, lx = 0, ly = 0,
}) => {
  if (T < t0) return null;
  const p = eo(seg(T, t0, t0 + 0.7));
  const [mx, my] = c ?? [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const d = `M${a[0]} ${a[1]} Q${mx} ${my} ${b[0]} ${b[1]}`;
  const ang = (Math.atan2(b[1] - my, b[0] - mx) * 180) / Math.PI;
  const id = `sl-f${a[0]}-${a[1]}-${b[0]}-${b[1]}`.replace(/\./g, '');
  return (
    <g>
      <mask id={id} maskUnits="userSpaceOnUse" x="-2000" y="-2000" width="6000" height="9000"><path d={d} fill="none" stroke="#fff" strokeWidth={w + 12} pathLength={1} strokeDasharray={`${p} 1`} /></mask>
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeDasharray={dashed ? `${w * 3} ${w * 2.2}` : undefined} strokeDashoffset={dashed ? -T * 50 : 0} strokeLinecap="round" mask={`url(#${id})`} />
      {p > 0.95 && <path d={`M${-w * 3.2} ${-w * 2.2} L0 0 L${-w * 3.2} ${w * 2.2}`} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" transform={`translate(${b[0]} ${b[1]}) rotate(${ang})`} />}
      {label && <text x={(a[0] + 2 * mx + b[0]) / 4 + lx} y={(a[1] + 2 * my + b[1]) / 4 + ly} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize="40" fill={color} stroke={DARK} strokeWidth="7" paintOrder="stroke" opacity={seg(T, t0 + 0.4, t0 + 0.8)}>{label}</text>}
    </g>
  );
};

/** Jukebox a linee chiare (il tema della serata). */
export const Jukebox: React.FC<{ T: number; x: number; y: number; s?: number; on: number }> = ({ T, x, y, s = 1, on }) => {
  const hue = GIUDICI.map((g) => g.colore).concat(ORO);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <Glow id="sl-jg" x={0} y={-260} r={380} t={T} color={ORO} amp={0.06} rate={2.4} opacity={0.15 + 0.4 * on} />
      <path d="M-170 0 V-330 Q-170 -520 0 -530 Q170 -520 170 -330 V0 Z" fill="#1E1428" stroke={INK} strokeWidth="6" />
      {[0, 1, 2].map((k) => (
        <path key={k} d={`M${-150 + k * 22} -12 V-330 Q${-150 + k * 22} ${-500 + k * 22} 0 ${-508 + k * 22} Q${150 - k * 22} ${-500 + k * 22} ${150 - k * 22} -330 V-12`}
          stroke={hue[(k + Math.floor(T * 2.5)) % hue.length]} strokeWidth="8" fill="none" opacity={0.25 + 0.75 * on} />
      ))}
      <path d="M-90 -300 Q-90 -420 0 -426 Q90 -420 90 -300 Z" fill="#0E0A14" stroke={INK} strokeWidth="4" />
      {[-42, 0, 42].map((dx, k) => (
        <g key={k} transform={`translate(${dx} -332) rotate(${(T * 200 * on + k * 40) % 360})`}>
          <circle r="34" fill="#0A0810" stroke="#3A3446" strokeWidth="3" />
          <circle r="22" fill="none" stroke="#2A2632" strokeWidth="2" />
          <circle r="11" fill={hue[k + 1]} />
          <path d="M-30 0 H-14" stroke="#6A6678" strokeWidth="3" />
        </g>
      ))}
      <rect x="-120" y="-280" width="240" height="40" rx="8" fill="#1A1020" stroke={INK} strokeWidth="3" />
      {Array.from({ length: 8 }, (_, i) => <rect key={i} x={-108 + i * 28} y="-270" width="20" height="20" rx="4" fill={on > 0.3 && i === Math.floor(mod(T * 2, 8)) ? ORO : '#4A4458'} />)}
      <rect x="-120" y="-220" width="240" height="190" rx="14" fill="#140C18" stroke={INK} strokeWidth="3" />
      {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M-104 ${-200 + i * 26} H104`} stroke="#3A2E42" strokeWidth="6" />)}
      <path d="M-170 -10 H170" stroke={ORO} strokeWidth="5" opacity={0.4 + 0.6 * on} />
    </g>
  );
};

/** Riga di un turno: disco + nome + canzone scritta a mano. */
const RigaTurno: React.FC<{ T: number; t0: number; x: number; y: number; id: string; canzone: string; artista?: string; gira: number; rosso: number; fuori?: number }> = ({ T, t0, x, y, id, canzone, artista, gira, rosso, fuori = 0 }) => {
  if (T < t0) return null;
  const c = nome(id);
  const p = pop(T, t0);
  return (
    <g opacity={seg(T, t0, t0 + 0.2)}>
      <g transform={`translate(${x + 56} ${y}) scale(${p}) translate(${-x - 56} ${-y})`}>
        <Disco T={T} x={x + 56} y={y} r={50} label={colore(id)} gira={gira} rosso={rosso} fuori={fuori} />
      </g>
      <text x={x + 124} y={y - 14} fontFamily={SANS} fontWeight={800} fontSize="36" fill={fuori > 0.5 ? DIM : INK}>{c.nome}</text>
      <text x={x + 124} y={y + 24} fontFamily={HAND} fontWeight={700} fontSize="34" fill={colore(id)} opacity={seg(T, t0 + 0.25, t0 + 0.6)}>{canzone}</text>
      {artista && <text x={x + 126} y={y + 54} fontFamily={SANS} fontWeight={400} fontSize="22" letterSpacing="1" fill={DIM} opacity={seg(T, t0 + 0.4, t0 + 0.8)}>{artista.toUpperCase()}</text>}
    </g>
  );
};

export const makeSchemaLive = (D: DatiPuntata) => {
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

  const B = D.ballottaggio;
  const P = D.prossimo;
  const S = D.serata;

  const Schema: React.FC<{ T: number; foc: number }> = ({ T, foc }) => {
    const tTema = at(S.quandoTema);
    const jukeOn = eo(seg(T, tTema, tTema + 0.6));
    const tNote = at(S.quandoNote);
    // righe dei turni: quale disco «suona» (gira) finché non entra il successivo
    const tutte = D.turni.flatMap((tu, k) => tu.righe.map((r, i) => ({ ...r, k, i, t0: at(r.quando) })));
    const tA = at(B.quando), tB = at(B.quandoB), tV = at(B.quandoVoti), tF = at(B.quandoFuori);
    const fuoriB = eo(seg(T, tF, tF + 0.6));
    return (
      <g>
        {/* ── LA SERATA ── */}
        <g opacity={seg(T, tTema - 0.3, tTema + 0.2)}>
          <text x="540" y="270" textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize="64" letterSpacing="2" fill={ORO} transform={`translate(540 250) scale(${pop(T, tTema)}) translate(-540 -250)`}>{S.tema}</text>
          <text x="540" y="320" textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize="40" fill={INK} opacity={seg(T, tTema + 0.3, tTema + 0.7)}>{S.sotto}</text>
          <Jukebox T={T} x={540} y={850} s={0.92} on={jukeOn} />
          {/* note e dischi che escono dal jukebox */}
          {T > tNote && NOTE.map((n, i) => {
            const u = mod((T - tNote) * n.sp + n.ph, 1);
            return (
              <g key={i} transform={`translate(${540 + n.dx * u} ${560 - 260 * u})`} opacity={seg(T, tNote, tNote + 0.4) * Math.sin(u * Math.PI)}>
                {n.k ? <Disco T={T} x={0} y={0} r={22} label={GIUDICI[i % 4].colore} gira={1} /> : <text fontFamily={SANS} fontSize="54" fill={INK}>♪</text>}
              </g>
            );
          })}
        </g>
        {/* apertura e ospite */}
        {T > at(S.apertura.quando) && (
          <g>
            <Tag T={T} t0={at(S.apertura.quando)} x={250} y={960} testo="APERTURA" size={28} rot={-3} />
            <text x="250" y="1022" textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize="40" fill={INK} opacity={seg(T, at(S.apertura.quando) + 0.3, at(S.apertura.quando) + 0.7)}>{S.apertura.testo}</text>
            {S.apertura.dischi.map((d, i) => (
              <g key={d} transform={`translate(${130 + i * 120} 1100) scale(${pop(T, at(S.apertura.quando) + 0.25 + i * 0.25)})`}>
                <Disco T={T} x={0} y={0} r={42} label={[ORO, '#C8B8FF', '#FF7A66'][i]} gira={1} />
                <text y="76" textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize="30" fill={DIM}>{d}</text>
              </g>
            ))}
          </g>
        )}
        {T > at(S.ospite.quando) && (
          <g>
            <Tag T={T} t0={at(S.ospite.quando)} x={830} y={960} testo="OSPITE" size={28} rot={3} bg={INK} />
            <text x="830" y="1030" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="44" fill={INK} opacity={seg(T, at(S.ospite.quando) + 0.3, at(S.ospite.quando) + 0.6)}>{S.ospite.testo}</text>
            <g transform={`translate(830 1100) scale(${pop(T, at(S.ospite.quando) + 0.3)})`}><Stella T={T} t0={0} x={0} y={0} s={0.7} /></g>
          </g>
        )}

        {/* ── I DUE TURNI ── */}
        {D.turni.map((tu, k) => {
          const t0 = at(tu.righe[0].quando) - 0.6;
          if (T < t0) return null;
          const x = COL[k];
          const tU = at(tu.quandoUltimo);
          return (
            <g key={k} opacity={1 - 0.8 * Math.max(0, k === 0 ? foc : -foc)}>
              <text x={x + 10} y={ROW0 - 90} fontFamily={DISPLAY} fontWeight={800} fontSize="46" letterSpacing="4" fill={INK} opacity={seg(T, t0, t0 + 0.4)}>{tu.titolo}</text>
              <path d={`M${x + 10} ${ROW0 - 70} H${x + 450}`} stroke={INK} strokeWidth="4" strokeLinecap="round" pathLength={1} strokeDasharray={`${eo(seg(T, t0, t0 + 0.6))} 1`} />
              {tu.righe.map((r, i) => {
                const t1 = at(r.quando);
                const prossima = i + 1 < tu.righe.length ? at(tu.righe[i + 1].quando) : tU;
                const gira = T >= t1 && T < prossima + 0.4 ? 1 : 0.05;
                const ultimo = r.id === tu.ultimo ? eo(seg(T, tU, tU + 0.4)) : 0;
                const y = ROW0 + i * ROWH;
                return (
                  <g key={r.id}>
                    <RigaTurno T={T} t0={t1} x={x} y={y} id={r.id} canzone={r.canzone} artista={r.artista} gira={gira} rosso={ultimo} />
                    {r.stella && <Stella T={T} t0={at(r.stella)} x={x + 18} y={y - 40} s={0.75} />}
                    {r.tag && <Tag T={T} t0={at(r.tag.quando)} x={x + 124} y={y + 82} testo={r.tag.testo} size={22} anchor="start" />}
                  </g>
                );
              })}
              {/* l'ultimo del turno va al ballottaggio */}
              {(() => {
                const i = tu.righe.findIndex((r) => r.id === tu.ultimo);
                const y = ROW0 + i * ROWH;
                const dest: [number, number] = k === 0 ? [180, BAL_Y + 30] : [620, BAL_Y + 30];
                return (
                  <g>
                    {T > tU && <Tag T={T} t0={tU + 0.2} x={x + 56} y={y + 52} testo="ULTIMO" size={20} bg={RED} fg={INK} rot={-6} />}
                    {/* la freccia scende a sinistra dei dischi, fuori dalle scritte */}
                    <Freccia T={T} t0={tU + 0.5} a={[x + 6, y + 20]} b={dest} c={[x - 26, (y + BAL_Y) / 2 + 160]} color={RED} dashed w={5} />
                  </g>
                );
              })()}
            </g>
          );
        })}

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
              const fu = s.id === B.fuori ? fuoriB : 0;
              if (T < t0) return null;
              return (
                <g key={s.id}>
                  <g transform={`translate(${x} ${BAL_Y + 300}) scale(${pop(T, t0)}) translate(${-x} ${-BAL_Y - 300})`}>
                    <Disco T={T} x={x} y={BAL_Y + 300} r={92} label={colore(s.id)} gira={fu > 0.5 ? 0 : T < tV ? 1 : 0.3} rosso={1 - fu} fuori={fu} />
                  </g>
                  <text x={x} y={BAL_Y + 105} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="42" fill={fu > 0.5 ? DIM : INK}>{nome(s.id).nome}</text>
                  <text x={x} y={BAL_Y + 150} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize="34" fill={colore(s.id)} opacity={seg(T, t0 + 0.3, t0 + 0.6)}>{s.canzone}</text>
                  {fu > 0.5 && <Tag T={T} t0={tF + 0.3} x={x} y={BAL_Y + 300} testo="FUORI" size={40} bg={INK} fg={RED} rot={-10} />}
                </g>
              );
            })}
            {/* i quattro giudici votano chi far uscire */}
            {GIUDICI.map((g, i) => {
              const t0 = tV + i * 0.5;
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
          </g>
        )}

        {/* ── LA PUNTATA DOPO ── */}
        {T > at(P.quando) - 0.5 && (() => {
          const t0 = at(P.quando), tR = at(P.quandoRegola), tBa = at(P.quandoBallottaggio), tAv = at(P.quandoAvviso);
          return (
            <g>
              <g opacity={seg(T, t0 - 0.5, t0)}>
                <rect x="70" y={NEXT_Y} width="940" height="790" rx="40" fill="#120E22" opacity=".8" />
                <rect x="70" y={NEXT_Y} width="940" height="790" rx="40" fill="none" stroke={ORO} strokeWidth="6" />
                <text x="540" y={NEXT_Y + 90} textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize="52" fill={ORO}>{P.titolo}</text>
                <text x="540" y={NEXT_Y + 140} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize="40" fill={INK}>{P.sotto}</text>
              </g>
              {/* i dieci rimasti */}
              {P.rimasti.map((id, i) => {
                const x = 160 + (i % 5) * 190, y = NEXT_Y + 230 + Math.floor(i / 5) * 160;
                const ti = at(P.quando) + i * 0.125;
                if (T < ti) return null;
                return (
                  <g key={id}>
                    <g transform={`translate(${x} ${y}) scale(${pop(T, ti)}) translate(${-x} ${-y})`}><Disco T={T} x={x} y={y} r={52} label={colore(id)} gira={0.3} /></g>
                    <text x={x} y={y + 88} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="25" fill={INK}>{nome(id).nome.length > 13 ? nome(id).nome.split(' ')[0] : nome(id).nome}</text>
                  </g>
                );
              })}
              {/* la regola: somma dei voti, i due ultimi fuori, il terzo e il quarto al ballottaggio (dischi senza nome: nessun pronostico) */}
              {T > tR && (
                <g>
                  <Freccia T={T} t0={tR} a={[540, NEXT_Y + 520]} b={[330, NEXT_Y + 600]} color={INK} w={5} label="somma dei voti" lx={-10} ly={-42} />
                  {[0, 1].map((k) => (
                    <g key={k} transform={`translate(${200 + k * 120} ${NEXT_Y + 660}) scale(${pop(T, tR + 0.5 + k * 0.25)})`}>
                      <Disco T={T} x={0} y={0} r={44} label={SPENTO} testo="?" />
                      <path d="M-40 -40 L40 40 M40 -40 L-40 40" stroke={RED} strokeWidth="5" strokeLinecap="round" opacity=".85" />
                    </g>
                  ))}
                  <Tag T={T} t0={tR + 1.0} x={260} y={NEXT_Y + 740} testo="ESCONO SUBITO" size={24} bg={RED} fg={INK} />
                </g>
              )}
              {T > tBa && (
                <g>
                  <circle cx="780" cy={NEXT_Y + 660} r="110" fill="none" stroke={RED} strokeWidth="7" pathLength={1} strokeDasharray={`${eo(seg(T, tBa, tBa + 0.6))} 1`} />
                  {[0, 1].map((k) => (
                    <g key={k} transform={`translate(${725 + k * 110} ${NEXT_Y + 660}) scale(${pop(T, tBa + 0.3 + k * 0.25)})`}>
                      <Disco T={T} x={0} y={0} r={44} label={SPENTO} testo="?" rosso={1} />
                    </g>
                  ))}
                  <Tag T={T} t0={tBa + 0.8} x={780} y={NEXT_Y + 740} testo="BALLOTTAGGIO" size={24} bg={RED} fg={INK} />
                </g>
              )}
              {T > tAv && (
                <g transform={`translate(540 ${NEXT_Y + 880}) rotate(-3) scale(${pop(T, tAv) * 1.15})`}>
                  <Glow id="sl-av" x={0} y={0} r={260} t={T} color={ORO} amp={0.1} rate={5} opacity={0.5} />
                  <Tag T={T} t0={tAv} x={0} y={0} testo={P.avviso} size={56} />
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
            <FxDefs id="sl" />
            <radialGradient id="sl-bg" cx=".5" cy=".46" r=".8">
              <stop offset="0" stopColor="#231A3C" />
              <stop offset=".6" stopColor="#140F24" />
              <stop offset="1" stopColor="#09070F" />
            </radialGradient>
            <linearGradient id="sl-scrim" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#09070F" stopOpacity=".96" />
              <stop offset=".82" stopColor="#09070F" stopOpacity=".88" />
              <stop offset="1" stopColor="#09070F" stopOpacity="0" />
            </linearGradient>
            <pattern id="sl-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0 H0 V40" fill="none" stroke="#2A2240" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="1080" height="1920" fill="url(#sl-bg)" />
          {/* bagliori colorati delle squadre che vagano dietro lo schema */}
          {GIUDICI.map((g, i) => (
            <Glow key={g.id} id={`sl-bg${i}`} x={540 + Math.sin(T * 0.13 + i * 1.7) * 420} y={900 + Math.cos(T * 0.11 + i * 2.1) * 560} r={520} t={T} color={g.colore} amp={0.05} rate={0.7} ph={i} opacity={0.1} />
          ))}
          <g transform={`translate(540 900) scale(${c.z}) translate(${-c.x} ${-c.y})`}>
            <rect x="-4000" y="-4000" width="9080" height="13000" fill="url(#sl-grid)" opacity=".55" />
            <Schema T={T} foc={c.z > 1 ? Math.max(-1, Math.min(1, (c.x - 540) / 200)) : 0} />
          </g>
          <rect width="1080" height="560" fill="url(#sl-scrim)" />
          {MOTES.map((m, i) => (
            <circle key={i} cx={mod(m.x + Math.sin(T * 0.5 + m.ph) * 30, 1080)} cy={mod(m.y - T * m.v, 1920)} r={m.s} fill={INK} opacity={0.08 + 0.06 * Math.sin(T * 2 + m.ph)} />
          ))}
          <Finish id="sl" tint="#2A1E4A" tintOpacity={0.1} />
        </svg>
      );
    };
    return Scene;
  };
};

