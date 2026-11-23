import React from 'react';
import { clamp01, eio, eo, lerp, seg } from '../../lib/anim';
import { HAND, SANS, TYPEWRITER } from '../../lib/fonts';
import { Glow } from '../../lib/elements';
import { Corridoio, type Proietta } from '../../lib/liminale';
import { INK, L0, NIGHT, PAPER, RED, X, YEL } from './Luoghi';
import { Icona, Tag } from './Segni';
import { E, S, ev, inCap, type Cam } from './Tempi';

// Le vedute in prospettiva vera dentro il mondo (passo avanti del lungo, ASTICELLA.md): ogni segmento ha una FINESTRA
// 16:9 nel mondo in sezione (una stanza del Livello 0, lo schermo del computer, il televisore di Async, la fessura) e la
// camera vola dentro quella finestra fino a riempire lo schermo; dentro c'è il corridoio di src/lib/liminale.tsx che la
// camera percorre. All'uscita la finestra si rimpicciolisce e torna una stanza della sezione: nessuno stacco.

export type Finestra = { x: number; y: number; h: number };
type Seg = { t0: number; t1: number; f: Finestra; vista: (T: number) => React.ReactNode; vhs?: boolean };
const Y0 = (L0.top + L0.bot) / 2;
const fin = (x: number, y: number, h = 250): Finestra => ({ x, y, h });

// ---------------------------------------------------------------------------------------------------------------- oggetti nel corridoio

/** Testo dipinto su un muro del corridoio (lato -1 sinistra, 1 destra), in prospettiva approssimata. */
export const SulMuro: React.FC<{ p: Proietta; side: -1 | 1; z: number; y: number; text: string; size: number; color?: string; font?: string; op?: number }> = ({ p, side, z, y, text, size, color = '#3A2A10', font = HAND, op = 1 }) => {
  const a = p(side * 2.1, y, z), b = p(side * 2.1, y, z + 1.5);
  if (!a || !b) return null;
  // il testo si legge da sinistra a destra: sul muro sinistro dal vicino al lontano, sul destro dal lontano al vicino
  const [u, v] = side < 0 ? [a, b] : [b, a];
  const sk = Math.atan2(v.y - u.y, v.x - u.x) * (180 / Math.PI);
  const s = (((a.s + b.s) / 2) * size) / 400;
  return (
    <text x={u.x} y={u.y} transform={`rotate(${sk} ${u.x} ${u.y})`} textAnchor="start" fontFamily={font} fontWeight={700}
      fontSize={s} fill={color} opacity={0.85 * op} style={{ letterSpacing: s * 0.02 }}>{text}</text>
  );
};

/** La porta socchiusa in fondo al corridoio, con la luce bianca che filtra. */
export const PortaInFondo: React.FC<{ p: Proietta; z: number; T: number; apre?: number }> = ({ p, z, T, apre = 0.25 }) => {
  const tl = p(-2.1, 3, z), br = p(2.1, 0, z);
  const d0 = p(-0.55, 2.2, z), d1 = p(0.55, 0, z);
  if (!tl || !br || !d0 || !d1) return null;
  const dw = d1.x - d0.x;
  return (
    <g>
      <rect x={tl.x} y={tl.y} width={br.x - tl.x} height={br.y - tl.y} fill="#C9B45A" stroke={INK} strokeWidth={2} />
      <Glow id="pov-porta" x={(d0.x + d1.x) / 2} y={(d0.y + d1.y) / 2} r={dw * 2.4} t={T} color="#FFFDF0" amp={0.08} rate={2} opacity={0.7} />
      <rect x={d0.x} y={d0.y} width={dw} height={d1.y - d0.y} fill="#FFFDF2" />
      {/* l'anta socchiusa */}
      <path d={`M${d0.x} ${d0.y} L${d0.x + dw * (1 - apre)} ${d0.y + (d1.y - d0.y) * 0.04} V${d1.y - (d1.y - d0.y) * 0.03} L${d0.x} ${d1.y} Z`} fill="#8E7A30" stroke={INK} strokeWidth={2} />
      <circle cx={d0.x + dw * (1 - apre) * 0.86} cy={(d0.y + d1.y) / 2} r={Math.max(1.5, dw * 0.03)} fill={INK} />
      {/* la luce sulla moquette */}
      <path d={`M${d0.x + dw * (1 - apre)} ${d1.y} L${d1.x} ${d1.y} L${d1.x + dw * 1.2} ${d1.y + dw * 0.9} L${d0.x + dw * (1 - apre) - dw * 0.2} ${d1.y + dw * 0.9} Z`} fill="#FFFDF0" opacity={0.35} />
    </g>
  );
};

/** Un oggetto a terra nel corridoio (la torcia di Naren, il cemento). */
const ATerra: React.FC<{ p: Proietta; x: number; z: number; k: string; s?: number; rot?: number }> = ({ p, x, z, k, s = 1, rot = 0 }) => {
  const a = p(x, 0.15, z);
  if (!a) return null;
  return <g transform={`translate(${a.x} ${a.y}) rotate(${rot}) scale(${(a.s / 300) * s})`}><Icona k={k} /></g>;
};

/** Il cappello da pirata gigante che avanza nel corridoio (sfiora il soffitto), con le impronte della gamba di legno. */
export const PirataPov: React.FC<{ p: Proietta; z: number; T: number; rotto: number }> = ({ p, z, T, rotto }) => {
  const a = p(0.2, 2.72 - rotto * 1.1, z);
  if (!a) return null;
  return (
    <g>
      {/* ombra enorme che si allarga sul soffitto e sui muri: la luce si chiude attorno */}
      <defs>
        <radialGradient id="pov-ombra">
          <stop offset="0" stopColor="#000" stopOpacity=".55" />
          <stop offset=".6" stopColor="#000" stopOpacity=".25" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx={a.x} cy={a.y + a.s * 0.9} rx={a.s * 3.2} ry={a.s * 2.6} fill="url(#pov-ombra)" />
      <g transform={`translate(${a.x} ${a.y}) rotate(${-6 + Math.sin(T * 4) * 5 + rotto * 30}) scale(${a.s / 42})`}>
        <path d="M-70 10 Q-60 -40 -20 -46 Q0 -62 20 -46 Q60 -40 70 10 Q0 -6 -70 10 Z" fill="#1E1A22" stroke={INK} strokeWidth={4} />
        <path d="M-66 4 Q0 -12 66 4" fill="none" stroke="#D8B04A" strokeWidth={4} />
        <circle cy={-24} r={11} fill="#F4F0E4" stroke={INK} strokeWidth={3} />
        <circle cx={-4} cy={-25} r={2.6} fill={INK} /><circle cx={4} cy={-25} r={2.6} fill={INK} />
        <path d="M-14 -12 L14 -4 M14 -12 L-14 -4" stroke="#F4F0E4" strokeWidth={4} strokeLinecap="round" />
      </g>
    </g>
  );
};

/** Impronte rotonde della gamba di legno sulla moquette. */
export const Impronte: React.FC<{ p: Proietta; z0: number; z1: number }> = ({ p, z0, z1 }) => (
  <g>
    {Array.from({ length: 12 }, (_, i) => {
      const zz = z0 + i * 1.4;
      if (zz > z1) return null;
      const a = p(0.5 * (i % 2 ? 1 : -1), 0.01, zz), b = p(0.5 * (i % 2 ? 1 : -1) + 0.18, 0.01, zz + 0.12);
      if (!a || !b) return null;
      return <ellipse key={i} cx={a.x} cy={a.y} rx={Math.abs(b.x - a.x) * 1.4 + 1} ry={Math.max(1, Math.abs(b.y - a.y))} fill="#2A2210" opacity={0.75} />;
    })}
  </g>
);

// ---------------------------------------------------------------------------------------------------------------- vedute

const passo = (T: number, t0: number, v: number, ramp = 0.8) => {
  const t = Math.max(0, T - t0);
  return t < ramp ? (v * t * t) / (2 * ramp) : v * (t - ramp / 2);
};

/** Aggancio (e miniatura): il corridoio giallo infinito con la porta socchiusa in fondo e «DOVE SEI?» sul muro. */
const vistaAggancio = (T: number) => {
  const z = passo(T, 0.2, 1.15);
  const spegni = (i: number) => {
    // dopo «come si esce?» i neon si spengono dal fondo verso la camera
    const t = ev('aggancio', 1, 2.2) + (14 - i) * 0.12;
    return seg(T, t, t + 0.15) * (1 - seg(T, ev('aggancio', 2, -0.6), ev('aggancio', 2, -0.2)));
  };
  return (
    <Corridoio T={T} z={z} x={0.35 + Math.sin(T * 0.4) * 0.12} id="pov-ag" seed={3} spenti={spenti(spegni, z)}
      oggetti={(p) => (
        <g>
          <PortaInFondo p={p} z={22} T={T} apre={0.3 + 0.05 * Math.sin(T * 0.7)} />
          <SulMuro p={p} side={1} z={4.6} y={1.75} text="DOVE SEI?" size={230} color="#7A1A10" font={HAND} />
          {(() => {
            // anello rosso sulla porta socchiusa (la miniatura), poi si spegne
            const c = p(0, 1.1, 22);
            const k = 1 - seg(T, 2.4, 3.2);
            return c && k > 0 ? <circle cx={c.x} cy={c.y} r={c.s * 1.35} fill="none" stroke={RED} strokeWidth={10} strokeDasharray={`${c.s * 0.7} ${c.s * 0.25}`} strokeDashoffset={-T * 40} opacity={k} /> : null;
          })()}
        </g>
      )} />
  );
};
/** Converte una funzione «neon i spento» in coordinate del corridoio (indice dal tratto della camera). */
const spenti = (f: (i: number) => number, z: number) => (i: number) => f(i - Math.floor(z / 3));

/** Lo schermo del computer del forum: la discussione, poi la foto della stanza gialla (che diventa il corridoio). */
const vistaFoto = (T: number) => {
  const foto = seg(T, ev('foto', 2), ev('foto', 2, 0.5));
  const z = 4 + passo(T, ev('foto', 3, 1.2), 0.9);
  return (
    <g>
      <rect width={1920} height={1080} fill="#E8E8E0" />
      <rect width={1920} height={110} fill="#8A9AB8" />
      <text x={70} y={74} fontFamily={SANS} fontWeight={900} fontSize={56} fill="#1A2A4A">/x/ · PARANORMALE</text>
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(70 ${170 + i * 280})`} opacity={seg(T, S('foto') + 0.6 + i * 0.6, S('foto') + 1 + i * 0.6)}>
          <rect width={1780} height={240} rx={8} fill="#F4F4EE" stroke="#B8B8C8" strokeWidth={4} />
          <text x={30} y={58} fontFamily={SANS} fontWeight={800} fontSize={40} fill="#2A7A3A">Anonimo</text>
          <text x={260} y={58} fontFamily={SANS} fontSize={36} fill="#5A5A6A">12/05/19</text>
          {[110, 160, 200].map((y) => <rect key={y} x={30} y={y} width={1200 - y * 2 - i * 90} height={22} rx={6} fill="#C8C8D4" />)}
        </g>
      ))}
      {foto > 0 && (
        <g opacity={foto}>
          <Corridoio T={T} z={z} id="pov-foto" seed={11} />
        </g>
      )}
    </g>
  );
};

/** Il Livello 0: la camera cammina; la scritta sul muro e il numero enorme. */
const vistaLivello0 = (T: number) => {
  const t0 = E('noclip') - 0.8;
  const z = 30 + passo(T, t0, 1.25);
  return (
    <g>
      <Corridoio T={T} z={z} x={-0.3 + Math.sin(T * 0.3) * 0.2} id="pov-l0" seed={21} rotto={inCap(T, 'livello0') ? seg(T, ev('livello0', 1), ev('livello0', 1, 1)) * 0.6 : 0}
        oggetti={(p) => <SulMuro p={p} side={-1} z={36} y={2.1} text="LIVELLO 0" size={190} color="#3A2A10" font={SANS} />} />
      <Tag T={T} t0={ev('livello0', 0, 0.6)} x={1260} y={440} text="600.000.000" size={96} until={ev('livello0', 1, 1)} />
      <Tag T={T} t0={ev('livello0', 0, 1.4)} x={1260} y={580} text="MIGLIA QUADRATE" size={46} bg={PAPER} until={ev('livello0', 1, 1)} />
      {T >= ev('livello0', 0, 3.6) && T < ev('livello0', 1, 1.5) && (
        <g transform="translate(1260 720)" opacity={1 - seg(T, ev('livello0', 1, 1), ev('livello0', 1, 1.5))}>
          <text x={-260} y={22} fontFamily={SANS} fontWeight={900} fontSize={60} fill={PAPER} stroke={NIGHT} strokeWidth={8} paintOrder="stroke">=</text>
          {[0, 1, 2].map((i) => {
            const t = ev('livello0', 0, 3.6 + i * 0.3);
            const k = eo(seg(T, t, t + 0.3));
            return (
              <g key={i} transform={`translate(${-120 + i * 140} 0) scale(${k})`}>
                <circle r={52} fill="#3A7AB8" stroke={INK} strokeWidth={4} />
                <path d="M-30 -20 Q-10 -36 10 -24 Q20 -4 0 6 Q-24 10 -30 -20 Z M14 18 Q30 10 34 24 Q24 40 12 32 Z" fill="#5AA05A" stroke={INK} strokeWidth={2.5} />
              </g>
            );
          })}
        </g>
      )}
      <Tag T={T} t0={ev('livello0', 1, 0.6)} x={600} y={720} text="ODORE DI MOQUETTE UMIDA" size={40} bg={PAPER} until={ev('livello0', 2, 0.4)} />
      <Tag T={T} t0={ev('livello0', 1, 1.6)} x={1300} y={340} text="BZZZZ…" size={52} until={ev('livello0', 2, 0.4)} rot={-4} />
    </g>
  );
};

/** Il televisore di Async: la videocassetta di Naren (righe della VHS, la torcia, la data, il segnale perso). */
const vistaCassetta = (T: number) => {
  const z = 60 + passo(T, S('cassetta'), 0.9);
  const attacco = ev('cassetta', 2, 1.2);
  const neve = seg(T, attacco, attacco + 0.2);
  const torcia = 1 - seg(T, attacco - 0.4, attacco);
  const tw = Math.sin(T * 7) * 30 + Math.sin(T * 13) * 14;
  return (
    <g>
      <Corridoio T={T} z={z} x={Math.sin(T * 1.3) * 0.25} roll={Math.sin(T * 1.1) * 2} id="pov-vhs" seed={1990} luce={0.25} rotto={1}
        oggetti={() => null} />
      <rect width={1920} height={1080} fill="#0A0804" opacity={0.62} />
      {/* il cono della torcia */}
      <g opacity={torcia}>
        <defs>
          <radialGradient id="pov-torcia">
            <stop offset="0" stopColor="#FFF4C8" stopOpacity=".55" />
            <stop offset=".6" stopColor="#FFF4C8" stopOpacity=".15" />
            <stop offset="1" stopColor="#FFF4C8" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx={960 + tw} cy={560 + tw * 0.4} rx={520} ry={420} fill="url(#pov-torcia)" />
      </g>
      {/* righe della VHS e scritte a schermo */}
      {Array.from({ length: 14 }, (_, i) => <rect key={i} x={0} y={((i * 97 + T * 140) % 1080)} width={1920} height={3 + (i % 3)} fill="#FFFFFF" opacity={0.05} />)}
      <rect x={0} y={(T * 220) % 1300 - 120} width={1920} height={60} fill="#FFFFFF" opacity={0.06} />
      <text x={1830} y={130} textAnchor="end" fontFamily={TYPEWRITER} fontSize={70} fill="#F4F4F0" opacity={0.9}>PLAY ▶</text>
      <text x={1830} y={214} textAnchor="end" fontFamily={TYPEWRITER} fontSize={64} fill="#F4F4F0" opacity={0.9}>19 GIU 1990</text>
      {T >= ev('cassetta', 2) && T < attacco && <text x={960} y={300} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={120} fill={PAPER} stroke={NIGHT} strokeWidth={18} paintOrder="stroke" opacity={seg(T, ev('cassetta', 2), ev('cassetta', 2, 0.4))}>«aiuto…»</text>}
      {/* neve e segnale perso */}
      {neve > 0 && (
        <g opacity={neve}>
          <rect width={1920} height={1080} fill="#1A1A1E" />
          {Array.from({ length: 220 }, (_, i) => {
            const r = Math.sin(i * 91.7 + Math.floor(T * 24) * 13.1) * 43758.5;
            const f = r - Math.floor(r);
            return <rect key={i} x={(f * 7919) % 1920} y={(f * 104729) % 1080} width={14 + f * 30} height={4} fill="#E8E8E8" opacity={0.25 + f * 0.5} />;
          })}
          <rect x={560} y={470} width={800} height={140} fill="#1E3A8A" opacity={0.9} />
          <text x={960} y={568} textAnchor="middle" fontFamily={TYPEWRITER} fontSize={76} fill="#F4F4F0">SEGNALE PERSO</text>
        </g>
      )}
    </g>
  );
};

/** Dentro la fessura: le stanze gialle, la torcia di Naren a terra; poi la fuga all'indietro. */
const vistaFessura = (T: number) => {
  const t0 = ev('fessura', 2, -0.2);
  const fuga = ev('fessura', 3);
  const zf = 120 + passo(T, t0, 1.2);
  const z = T < fuga ? zf : 120 + passo(fuga, t0, 1.2) - passo(T, fuga, 4.5, 0.4);
  const spegni = (i: number) => (T < fuga ? 0 : seg(T, fuga + (12 - i) * 0.08, fuga + (12 - i) * 0.08 + 0.1));
  return (
    <g>
      <Corridoio T={T} z={z} x={T < fuga ? 0.2 : Math.sin(T * 9) * 0.25} roll={T < fuga ? 0 : Math.sin(T * 8) * 2.5} id="pov-fes" seed={45} spenti={spenti(spegni, z)} rotto={T < fuga ? 0.3 : 1}
        oggetti={(p) => (
          <g>
            <ATerra p={p} x={0.6} z={127} k="torcia" s={1.3} rot={30} />
            {T >= ev('fessura', 2, 2.2) && <ATerra p={p} x={-0.8} z={129} k="cassetta" s={0.9} rot={-12} />}
          </g>
        )} />
      <Tag T={T} t0={ev('fessura', 2, 2.4)} x={1300} y={420} text="LE COSE DI NAREN" size={46} until={ev('fessura', 3)} />
      {T >= fuga && <rect width={1920} height={1080} fill={RED} opacity={0.12 + 0.08 * Math.sin(T * 20)} />}
      <Tag T={T} t0={fuga + 0.2} x={960} y={300} text="QUALCOSA LO INSEGUE" size={56} bg={RED} fg={PAPER} />
    </g>
  );
};

/** La fuga dal pirata e il colpo del cemento (momento clou): la camera arretra, il cappello avanza. */
const vistaPirata = (T: number) => {
  const t0 = ev('pirata', 3, 0.6);
  const z = 400 - passo(T, t0, 2.6, 0.4); // si arretra
  const dist = lerp(15, 6.5, eio(seg(T, t0, ev('cemento', 0, 0.6))));
  const attacc = ev('cemento', 0, 0.8);
  const rotto = eo(seg(T, attacc + 0.6, attacc + 1.2));
  const lancio = ev('cemento', 1, 0.2);
  const colpo = ev('cemento', 1, 0.8);
  const fermo = T >= colpo ? 1 : 0;
  const zh = z + dist + (fermo ? 0 : 0);
  const gas = seg(T, ev('cemento', 2, 0.4), ev('cemento', 2, 2));
  return (
    <g>
      <Corridoio T={T} z={z} x={Math.sin(T * 6) * 0.18} roll={Math.sin(T * 5) * 2} id="pov-pir" seed={77} rotto={1} luce={T < colpo ? 0.9 : 0.6}
        oggetti={(p) => (
          <g>
            <Impronte p={p} z0={zh - 1} z1={zh + 14} />
            {T < ev('cemento', 2, 1.6) && <PirataPov p={p} z={zh} T={T} rotto={rotto} />}
            {/* l'attaccapanni che vola contro la gamba di legno */}
            {T >= attacc - 0.6 && T < attacc + 1.4 && (() => {
              const q = eio(seg(T, attacc - 0.6, attacc));
              const a = p(lerp(-1, 0.2, q), lerp(0.4, 0.5, q), lerp(z + 1.2, zh - 0.2, q));
              if (!a) return null;
              return (
                <g transform={`translate(${a.x} ${a.y}) rotate(${-70 + q * 160}) scale(${a.s / 220})`}>
                  <path d="M0 -150 V150 M-40 150 H40 M0 -150 L-30 -170 M0 -150 L30 -170 M0 -130 L-26 -146 M0 -130 L26 -146" stroke="#6A4A2A" strokeWidth={14} strokeLinecap="round" />
                </g>
              );
            })()}
            {/* schegge di legno */}
            {T >= attacc && T < attacc + 1.6 && Array.from({ length: 10 }, (_, i) => {
              const tt = T - attacc;
              const a = p(0.2 + Math.cos(i * 2.3) * tt * 1.5, 0.6 + Math.sin(i * 1.7) * tt * 1.2 - tt * tt * 1.5, zh - 0.3);
              return a ? <rect key={i} x={a.x} y={a.y} width={a.s * 0.06} height={a.s * 0.18} fill="#A8784A" stroke={INK} strokeWidth={1.5} transform={`rotate(${i * 40 + tt * 400} ${a.x} ${a.y})`} opacity={1 - seg(tt, 1, 1.6)} /> : null;
            })}
            {/* il pezzo di cemento lanciato */}
            {T >= lancio && T < colpo + 0.1 && (() => {
              const q = eio(seg(T, lancio, colpo));
              const a = p(lerp(0.3, 0.1, q), lerp(1.0, 2.2, q) + Math.sin(q * Math.PI) * 0.6, lerp(z + 0.8, zh, q));
              return a ? <g transform={`translate(${a.x} ${a.y}) rotate(${q * 540}) scale(${a.s / 140})`}><Icona k="cemento" /></g> : null;
            })()}
          </g>
        )} />
      {/* il gas di Async e le torce dei soccorritori */}
      {gas > 0 && (
        <g>
          <rect width={1920} height={1080} fill="#7ACA7A" opacity={0.35 * gas} />
          {[0, 1, 2, 3].map((i) => <ellipse key={i} cx={300 + i * 440 + Math.sin(T + i) * 60} cy={260 + Math.cos(T * 0.8 + i) * 40} rx={420} ry={180} fill="#9ADA9A" opacity={0.25 * gas} />)}
          {[0, 1, 2].map((i) => {
            const k = seg(T, ev('cemento', 2, 1 + i * 0.4), ev('cemento', 2, 1.4 + i * 0.4));
            return <g key={i} opacity={k}><Glow id={`pov-torcia${i}`} x={620 + i * 340 + Math.sin(T * 2 + i) * 40} y={560 + Math.cos(T * 1.6 + i) * 30} r={150} t={T} color="#FFF4C8" amp={0.1} rate={3} opacity={0.8} /></g>;
          })}
        </g>
      )}
      <Tag T={T} t0={attacc + 0.2} x={1340} y={380} text="LA GAMBA DI LEGNO" size={46} until={ev('cemento', 1, 0.2)} />
      {T >= colpo + 0.9 && T < ev('cemento', 2, 0.6) && (
        <g>
          <Tag T={T} t0={colpo + 0.9} x={960} y={330} text="UN PEZZO DI CEMENTO" size={56} until={ev('cemento', 2, 0.2)} />
          <text x={960} y={720} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={96} fill={YEL} stroke={NIGHT} strokeWidth={16} paintOrder="stroke" opacity={seg(T, ev('cemento', 1, 2.4), ev('cemento', 1, 2.8))}>ricordatelo!</text>
        </g>
      )}
      <Tag T={T} t0={ev('cemento', 2, 1.2)} x={960} y={360} text="LA TRAPPOLA DI ASYNC" size={52} bg="#7FC6D8" />
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------------------- segmenti

export const POV_SEGMENTI: Seg[] = [
  { t0: 0, t1: ev('aggancio', 2, -0.4), f: fin(2200, Y0), vista: vistaAggancio },
  { t0: S('foto'), t1: E('foto'), f: fin(X.forum + 90, -150, 72), vista: vistaFoto },
  { t0: E('noclip') - 0.8, t1: ev('livello0', 2, 0.6), f: fin(1200, Y0), vista: vistaLivello0 },
  { t0: S('cassetta'), t1: ev('cassetta', 3), f: fin(X.monitor, 135, 126), vista: vistaCassetta },
  { t0: ev('fessura', 2, -0.2), t1: ev('fessura', 3, 1.0), f: fin(X.fessura, 120, 150), vista: vistaFessura },
  { t0: ev('pirata', 3, 0.6), t1: ev('cemento', 3), f: fin(X.tavola + 700, Y0), vista: vistaPirata },
];

/** Il corridoio disegnato nella finestra della stanza, che si allarga fino a riempire lo schermo. */
export const Pov: React.FC<{ T: number; cam: Cam; pulito?: boolean }> = ({ T, cam }) => {
  const s = POV_SEGMENTI.find((p) => T >= p.t0 - (p.t0 === 0 ? 0 : 0.01) && T < p.t1 + 3.2);
  if (!s) return null;
  // il televisore e lo schermo del computer mostrano la loro veduta anche prima che la camera ci entri
  const rh = s.f.h * cam.z;
  const rw = (rh * 16) / 9;
  if (rw < 30) return null;
  const sx = 960 + (s.f.x - cam.x) * cam.z - rw / 2;
  const sy = 540 + (s.f.y - cam.y) * cam.z - rh / 2;
  const fuori = T >= s.t1 ? clamp01((rh - 120) / 500) : 1;
  if (fuori <= 0) return null;
  const pieno = clamp01((rh - 900) / 180);
  const id = `pov-clip-${Math.round(s.t0 * 10)}`;
  return (
    <g opacity={fuori}>
      <clipPath id={id}><rect x={sx} y={sy} width={rw} height={rh} rx={6 * (1 - pieno)} /></clipPath>
      <g clipPath={`url(#${id})`}>
        <g transform={`translate(${sx} ${sy}) scale(${rw / 1920})`}>{s.vista(T)}</g>
      </g>
      {pieno < 1 && <rect x={sx} y={sy} width={rw} height={rh} rx={6} fill="none" stroke={INK} strokeWidth={4} opacity={1 - pieno} />}
    </g>
  );
};
