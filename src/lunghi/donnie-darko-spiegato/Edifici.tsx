import React from 'react';
import { lerp, mod, rng, seg } from '../../lib/anim';
import { SANS } from '../../lib/fonts';
import { Fire, Glow, Smoke, flamePath } from '../../lib/elements';

// Gli edifici del paese di Donnie Darko nel 16:9 (un solo mondo, YOUTUBE.md §4): disegni piatti con contorni scuri,
// ognuno con l'origine al centro della sua base (y = terra). Ogni edificio riceve una tavolozza: quella vera (notte o
// alba) o quella della COPIA (universo tangente), che disegna lo stesso paese in linee azzurre tratteggiate.
// Niente persone: luoghi e oggetti soltanto (CLAUDE.md).

export const INK = '#EEF0F7';
export const DARK = '#0A0C1A';
export const ENGINE = '#F2A03A';
export const TIME = '#F5D04A';
export const RED = '#E8553F';
export const COPY = '#7FA6FF';
export const DIM = '#7C82A8';

export type Tav = {
  ink: string; wall: string; wall2: string; roof: string; roof2: string; win: string; winOff: string; trim: string;
  grass: string; ground: string; tree: string; ghost: boolean;
};
/** Tavolozza del paese vero, da notte (a = 0) ad alba (a = 1). */
export const tavVera = (a: number): Tav => ({
  ink: DARK,
  wall: mix('#3A3F6E', '#8C7E9A', a), wall2: mix('#2E3360', '#6E6688', a), roof: mix('#1E2244', '#4A3E5E', a), roof2: mix('#272B52', '#5A4C6C', a),
  win: mix('#FFD98A', '#FFE7B8', a), winOff: mix('#1A1D38', '#3A3656', a), trim: mix('#C9CDE8', '#EDE2DA', a),
  grass: mix('#1B2A2E', '#3E4A3A', a), ground: mix('#14182C', '#3A3448', a), tree: mix('#0E1122', '#2A2436', a), ghost: false,
});
/** La copia: lo stesso paese in linee azzurre, appena riempito. */
export const tavCopia: Tav = {
  ink: COPY, wall: 'rgba(127,166,255,0.10)', wall2: 'rgba(127,166,255,0.06)', roof: 'rgba(127,166,255,0.14)', roof2: 'rgba(127,166,255,0.08)',
  win: 'rgba(170,200,255,0.55)', winOff: 'rgba(127,166,255,0.12)', trim: COPY, grass: 'rgba(127,166,255,0.06)', ground: 'rgba(127,166,255,0.05)',
  tree: 'rgba(127,166,255,0.18)', ghost: true,
};

/** Mescola due colori #rrggbb. */
export function mix(a: string, b: string, k: number) {
  const p = (h: string, i: number) => parseInt(h.slice(1 + 2 * i, 3 + 2 * i), 16);
  const c = [0, 1, 2].map((i) => Math.round(lerp(p(a, i), p(b, i), Math.max(0, Math.min(1, k)))));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

const SW = 6; // spessore dei contorni

/** Finestra a ghigliottina con riflesso, accesa o spenta; `flick` la fa tremare. */
export const Finestra: React.FC<{ x: number; y: number; w?: number; h?: number; c: Tav; on?: number; flick?: number; T?: number }> = ({ x, y, w = 44, h = 58, c, on = 1, flick = 0, T = 0 }) => {
  const f = on * (1 - flick * (0.5 + 0.5 * Math.sin(T * 13 + x)) * (Math.sin(T * 3.1 + y) > 0.2 ? 1 : 0));
  return (
    <g>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} fill={c.winOff} stroke={c.ink} strokeWidth={4} />
      {f > 0 && <rect x={x - w / 2 + 3} y={y - h / 2 + 3} width={w - 6} height={h - 6} fill={c.win} opacity={f} />}
      <path d={`M${x} ${y - h / 2} V${y + h / 2} M${x - w / 2} ${y} H${x + w / 2}`} stroke={c.ink} strokeWidth={3} />
      {!c.ghost && f > 0 && <path d={`M${x - w / 2 + 7} ${y - h / 2 + 8} l10 0 M${x - w / 2 + 7} ${y - h / 2 + 14} l5 0`} stroke="#FFFFFF" strokeWidth={2.5} opacity={0.5 * f} />}
    </g>
  );
};

/** Albero spoglio d'ottobre (rami ricorsivi, deterministici). */
export const Albero: React.FC<{ x: number; y: number; h: number; c: Tav; seed?: number; T?: number }> = ({ x, y, h, c, seed = 1, T = 0 }) => {
  const r = rng(seed);
  const segs: string[] = [];
  const grow = (x0: number, y0: number, len: number, ang: number, d: number) => {
    const x1 = x0 + Math.cos(ang) * len, y1 = y0 - Math.sin(ang) * len;
    segs.push(`M${x0.toFixed(1)} ${y0.toFixed(1)} L${x1.toFixed(1)} ${y1.toFixed(1)}`);
    if (d <= 0) return;
    const n = 2 + (r() > 0.6 ? 1 : 0);
    for (let i = 0; i < n; i++) grow(x1, y1, len * (0.62 + r() * 0.15), ang + (i - (n - 1) / 2) * (0.5 + r() * 0.3), d - 1);
  };
  grow(0, 0, h * 0.36, Math.PI / 2 + (r() - 0.5) * 0.15, 4);
  const sway = Math.sin(T * 0.8 + seed) * 1.2;
  return (
    <g transform={`translate(${x} ${y}) rotate(${sway})`} fill="none" stroke={c.ghost ? c.ink : c.tree} strokeLinecap="round">
      <path d={segs.slice(0, 1).join(' ')} strokeWidth={h * 0.05} />
      <path d={segs.slice(1, 4).join(' ')} strokeWidth={h * 0.028} />
      <path d={segs.slice(4, 13).join(' ')} strokeWidth={h * 0.016} />
      <path d={segs.slice(13).join(' ')} strokeWidth={h * 0.008} />
    </g>
  );
};

/** Lampione con il cono di luce. */
export const Lampione: React.FC<{ x: number; y: number; c: Tav; T: number; on?: number }> = ({ x, y, c, T, on = 1 }) => (
  <g>
    {!c.ghost && on > 0 && (
      <path d={`M${x + 34} ${y - 228} L${x - 70} ${y} H${x + 150} Z`} fill="#FFE2A0" opacity={0.1 * on * (0.9 + 0.1 * Math.sin(T * 5 + x))} />
    )}
    <path d={`M${x} ${y} V${y - 236} Q${x} ${y - 250} ${x + 16} ${y - 250} H${x + 40}`} fill="none" stroke={c.ghost ? c.ink : '#2A2E48'} strokeWidth={9} strokeLinecap="round" />
    <path d={`M${x} ${y} V${y - 236} Q${x} ${y - 250} ${x + 16} ${y - 250} H${x + 40}`} fill="none" stroke={c.ink} strokeWidth={2} opacity={0.6} />
    <path d={`M${x + 22} ${y - 250} h30 l-6 16 h-18 Z`} fill={c.ghost ? 'none' : '#3A3F60'} stroke={c.ink} strokeWidth={4} />
    {on > 0 && <ellipse cx={x + 37} cy={y - 232} rx={11} ry={5} fill={c.ghost ? c.ink : '#FFF1C4'} opacity={on} />}
    {!c.ghost && on > 0 && <Glow id={`lp${Math.round(x)}`} x={x + 37} y={y - 228} r={70} t={T} color="#FFD98A" amp={0.05} rate={4} opacity={0.5 * on} />}
  </g>
);

// ---------------------------------------------------------------------------------------------------------------- CASA

/** La casa dei Darko: due piani con veranda e garage. La camera di Donnie è in alto a destra (finestra a x 130).
 *  crash: 0 = tetto intero, 1 = motore piantato nel tetto; fall: 0..1 = motore in caduta dall'alto (solo crash = 0);
 *  cut: 0..1 = la camera in sezione (la parete si apre e si vede dentro). */
export const ENG_HIT = [140, -372] as const;
export const Casa: React.FC<{ c: Tav; T: number; crash?: number; cut?: number; lights?: number; nastro?: number; inBed?: number }> = ({ c, T, crash = 0, cut = 0, lights = 1, nastro = 0, inBed = 0 }) => {
  const L = (k: number) => lights * k;
  return (
    <g strokeLinejoin="round">
      {/* garage */}
      <path d="M-420 0 V-190 L-330 -250 L-240 -190 V0 Z" fill={c.wall2} stroke={c.ink} strokeWidth={SW} />
      <rect x="-400" y="-150" width="140" height="150" fill={c.winOff} stroke={c.ink} strokeWidth={5} />
      {[-120, -90, -60, -30].map((y) => <path key={y} d={`M-400 ${y} H-260`} stroke={c.ink} strokeWidth={2.5} opacity={0.6} />)}
      {/* corpo della casa */}
      <rect x="-240" y="-300" width="480" height="300" fill={c.wall} stroke={c.ink} strokeWidth={SW} />
      {Array.from({ length: 11 }, (_, i) => <path key={i} d={`M-236 ${-18 - i * 26} H236`} stroke={c.ink} strokeWidth={2} opacity={c.ghost ? 0.3 : 0.25} />)}
      {/* tetto */}
      <path d="M-280 -300 L0 -470 L280 -300 Z" fill={c.roof} stroke={c.ink} strokeWidth={SW} />
      {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${-250 + i * 18} ${-300 - i * 26} H${250 - i * 18}`} stroke={c.ink} strokeWidth={2} opacity={0.35} />)}
      {/* comignolo */}
      <path d="M-150 -360 V-430 H-104 V-388" fill={c.roof2} stroke={c.ink} strokeWidth={SW} />
      {!c.ghost && <Smoke id="dd16-cam" t={T} x={-127} y={-440} color="#8C93B8" n={6} rise={140} wind={-120} r0={10} r1={46} speed={0.18} opacity={0.35} />}
      {/* abbaino */}
      <path d="M-40 -330 V-392 L0 -420 L40 -392 V-330 Z" fill={c.wall} stroke={c.ink} strokeWidth={5} />
      <Finestra x={0} y={-364} w={36} h={40} c={c} on={L(0.6)} />
      {/* finestre del primo piano */}
      <Finestra x={-160} y={-215} c={c} on={L(0.9)} />
      <Finestra x={-60} y={-215} c={c} on={L(0.25)} />
      <Finestra x={130} y={-215} w={64} h={70} c={c} on={L(1) * (1 - cut)} T={T} />
      {/* piano terra: veranda e porta */}
      <path d="M-240 -110 H240" stroke={c.ink} strokeWidth={5} />
      <path d="M-260 -112 H60 L40 -136 H-240 Z" fill={c.roof2} stroke={c.ink} strokeWidth={5} />
      {[-230, -140, -50, 40].map((x) => <rect key={x} x={x - 6} y={-110} width={12} height={110} fill={c.trim} stroke={c.ink} strokeWidth={3} />)}
      <rect x="-118" y="-96" width="52" height="96" fill={c.roof} stroke={c.ink} strokeWidth={5} />
      <circle cx="-74" cy="-48" r="4" fill={c.trim} />
      <Finestra x={150} y={-60} w={110} h={64} c={c} on={L(0.7)} />
      <Finestra x={-190} y={-60} w={40} h={56} c={c} on={L(0.35)} />
      {/* gradini e vialetto */}
      <path d="M-128 0 h72 v10 h-72 Z M-136 10 h88 v10 h-88 Z" fill={c.trim} stroke={c.ink} strokeWidth={3} />

      {/* la camera in sezione: la parete si apre come una pagina */}
      {cut > 0 && <Camera c={c} T={T} k={cut} crash={crash} inBed={inBed} />}

      {/* il buco nel tetto e il motore */}
      {crash > 0 && (
        <g>
          <path d="M80 -330 L104 -392 L150 -404 L196 -380 L208 -330 L170 -316 L120 -322 Z" fill={DARK} stroke={c.ink} strokeWidth={4} />
          {[[-30, -8, 20], [44, -22, -30], [60, 6, 40], [-50, 14, 70]].map(([dx, dy, rot], i) => (
            <rect key={i} x={ENG_HIT[0] + dx - 12} y={ENG_HIT[1] + 44 + dy} width={26} height={10} fill={c.roof2} stroke={c.ink} strokeWidth={2.5} transform={`rotate(${rot} ${ENG_HIT[0] + dx} ${ENG_HIT[1] + 44 + dy})`} />
          ))}
          <g transform={`translate(${ENG_HIT[0]} ${ENG_HIT[1]}) rotate(-28) scale(1.15)`}>
            <g strokeDasharray="none"><Motore T={T} spin={0.04} glow={c.ghost ? 0.8 : 0} /></g>
          </g>
          {!c.ghost && <Smoke id="dd16-buco" t={T} x={ENG_HIT[0] + 20} y={ENG_HIT[1] - 10} color="#9AA0C0" n={8} rise={260} wind={140} r0={18} r1={90} speed={0.22} opacity={0.55} />}
        </g>
      )}
      {/* il nastro dei vigili del fuoco davanti alla casa */}
      {nastro > 0 && (
        <g opacity={nastro}>
          {[-320, 40, 330].map((x) => <path key={x} d={`M${x} 0 V-60`} stroke="#3A3F60" strokeWidth={8} />)}
          <path d="M-320 -52 Q-140 -38 40 -52 Q190 -38 330 -52" fill="none" stroke="#F5C23A" strokeWidth={9} />
          <path d="M-320 -52 Q-140 -38 40 -52 Q190 -38 330 -52" fill="none" stroke={DARK} strokeWidth={9} strokeDasharray="14 22" />
        </g>
      )}
    </g>
  );
};

/** La camera di Donnie in sezione: il letto, la lampada, le pantofole accanto al letto. */
const Camera: React.FC<{ c: Tav; T: number; k: number; crash: number; inBed: number }> = ({ c, T, k, inBed }) => (
  <g opacity={Math.min(1, k * 1.5)}>
    <rect x="30" y="-298" width="210" height="182" fill={c.ghost ? 'none' : '#2A2140'} stroke={c.ink} strokeWidth={5} />
    {!c.ghost && <Glow id="dd16-lamp" x={60} y={-230} r={120} t={T} color="#FFCF7A" amp={0.04} rate={3} opacity={0.6 * k} />}
    {/* carta da parati */}
    {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M${44 + i * 30} -296 V-120`} stroke={c.ghost ? c.ink : '#3A2E58'} strokeWidth={3} />)}
    {/* lampada */}
    <path d="M52 -168 V-212 M40 -212 h24 l-6 -20 h-12 Z" fill="#E8C27A" stroke={c.ink} strokeWidth={3} />
    {/* letto */}
    <path d="M80 -120 V-176 H96 V-160 H226 V-120 Z" fill="#5A4A3A" stroke={c.ink} strokeWidth={4} />
    <path d="M96 -160 H226 V-146 H96 Z" fill="#C9CDE8" stroke={c.ink} strokeWidth={3} />
    <path d="M110 -150 q40 -18 116 -6 v12 H110 Z" fill="#3F4C86" stroke={c.ink} strokeWidth={3} opacity={0.4 + 0.6 * inBed} />
    <ellipse cx="108" cy="-166" rx="14" ry="8" fill="#EDEFF7" stroke={c.ink} strokeWidth={3} />
    {/* pantofole accanto al letto */}
    <g transform="translate(150 -124) rotate(90) scale(.28)">
      {[-15, 15].map((x) => <path key={x} d={`M${x - 11} -26 Q${x} -34 ${x + 11} -26 L${x + 13} 20 Q${x} 32 ${x - 13} 20 Z`} fill="#3F4C86" stroke={c.ink} strokeWidth={8} />)}
    </g>
  </g>
);

/** Il motore d'aereo (gondola, presa d'aria con le pale, ugello): l'unico oggetto arancione del video. */
export const Motore: React.FC<{ T: number; c?: Tav; spin?: number; glow?: number; s?: number }> = ({ T, c, spin = 1, glow = 0, s = 1 }) => {
  const ghost = c?.ghost;
  const ink = ghost ? COPY : DARK;
  return (
    <g transform={`scale(${s})`} strokeLinejoin="round">
      {glow > 0 && <Glow id="dd16-eng" x={0} y={0} r={190} t={T} color={ENGINE} amp={0.1} rate={3} opacity={0.6 * glow} />}
      <path d="M-62 -40 H50 Q76 -30 82 0 Q76 30 50 40 H-62 Z" fill={ghost ? 'rgba(242,160,58,0.25)' : '#B4682A'} stroke={ink} strokeWidth={7} />
      {!ghost && <path d="M-62 -40 H50 Q76 -30 82 0 H-62 Z" fill={ENGINE} />}
      {!ghost && <path d="M-50 -30 H44" stroke="#FFE0A8" strokeWidth={5} strokeLinecap="round" opacity={0.8} />}
      {[-30, 0, 30].map((x) => <path key={x} d={`M${x} -40 V40`} stroke={ink} strokeWidth={2.5} opacity={0.5} />)}
      <path d="M82 -14 L104 -9 V9 L82 14" fill={ghost ? 'none' : '#5A4A3A'} stroke={ink} strokeWidth={5} />
      <ellipse cx="-62" cy="0" rx="20" ry="44" fill={ghost ? 'none' : '#3A2E28'} stroke={ink} strokeWidth={7} />
      {!ghost && <ellipse cx="-62" cy="0" rx="20" ry="44" fill="none" stroke="#FFD08A" strokeWidth={2.5} opacity={0.7} />}
      <g transform="translate(-62 0) scale(.42 1)">
        {Array.from({ length: 10 }, (_, i) => (
          <path key={i} d="M0 0 L8 -38 L-6 -38 Z" fill={ghost ? 'none' : '#8A8FA8'} stroke={ink} strokeWidth={2} transform={`rotate(${i * 36 + T * 360 * spin})`} />
        ))}
        <circle r="11" fill={ghost ? 'none' : '#D8DCEA'} stroke={ink} strokeWidth={3} />
      </g>
    </g>
  );
};

/** Un aereo di linea generico visto di lato (muso a destra), con le luci di posizione. */
export const Aereo: React.FC<{ T: number; engine?: boolean; s?: number }> = ({ T, engine = true, s = 1 }) => (
  <g transform={`scale(${s})`} strokeLinejoin="round">
    <path d="M-130 -6 Q-120 -16 -80 -16 H100 Q130 -16 140 0 Q130 12 100 12 H-90 Q-120 12 -130 -6 Z" fill="#C8CCDC" stroke={DARK} strokeWidth={5} />
    <path d="M-120 -12 L-150 -54 H-128 L-88 -14 Z" fill="#A8AEC4" stroke={DARK} strokeWidth={4} />
    <path d="M-10 2 L-60 50 H-36 L30 4 Z" fill="#A8AEC4" stroke={DARK} strokeWidth={4} />
    {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-70 + i * 14} y={-9} width={7} height={7} rx={2} fill="#FFE2A0" opacity={0.85} />)}
    <path d="M110 -10 Q122 -8 128 -2 H112 Z" fill="#2A2F5A" />
    {engine && <rect x={-46} y={22} width={40} height={16} rx={7} fill="#8A8FA8" stroke={DARK} strokeWidth={3} />}
    {!engine && <path d="M-44 26 l8 6 l6 -5 l8 6" stroke={DARK} strokeWidth={3} fill="none" />}
    <circle cx={-150} cy={-54} r={5} fill="#FF4040" opacity={Math.sin(T * 6) > 0 ? 1 : 0.2} />
    <circle cx={-58} cy={50} r={4} fill="#40FF80" opacity={0.9} />
  </g>
);

// ---------------------------------------------------------------------------------------------------------------- GOLF

/** Il campo da golf: collinetta erbosa, bunker di sabbia, buca con la bandierina al vento. */
export const Golf: React.FC<{ c: Tav; T: number }> = ({ c, T }) => {
  const wave = (i: number) => Math.sin(T * 3 + i * 0.9) * 6;
  return (
    <g strokeLinejoin="round">
      <path d="M-520 0 Q-300 -90 -40 -70 Q220 -50 420 0 Z" fill={c.ghost ? c.grass : mix(c.grass, '#3E6A4A', 0.35)} stroke={c.ink} strokeWidth={SW} />
      <path d="M-260 -40 Q-200 -64 -120 -52 Q-90 -36 -150 -30 Q-220 -24 -260 -40 Z" fill={c.ghost ? 'none' : '#8A7A5A'} stroke={c.ink} strokeWidth={4} />
      <ellipse cx="120" cy="-56" rx="22" ry="7" fill={DARK} stroke={c.ink} strokeWidth={3} />
      <path d="M118 -58 V-270" stroke={c.ink === DARK ? '#C9CDE8' : c.ink} strokeWidth={6} strokeLinecap="round" />
      <path d={`M120 -270 Q${160} ${-262 + wave(0)} ${200} ${-250 + wave(1)} Q${170} ${-236 + wave(2)} 120 ${-226}`} fill={c.ghost ? 'none' : RED} stroke={c.ink} strokeWidth={4} />
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------------------- STUDIO

/** Lo studio della psicologa: palazzina bassa con una grande vetrata da cui si vedono poltrona, lampada e metronomo. */
export const Studio: React.FC<{ c: Tav; T: number; on?: number }> = ({ c, T, on = 1 }) => {
  const swing = Math.sin(T * Math.PI) * 26; // un'oscillazione per battito (60 bpm)
  return (
    <g strokeLinejoin="round">
      <rect x="-300" y="-300" width="600" height="300" fill={c.wall2} stroke={c.ink} strokeWidth={SW} />
      <path d="M-320 -300 H320 V-330 H-320 Z" fill={c.roof} stroke={c.ink} strokeWidth={SW} />
      {[-200, -100, 100, 200].map((x) => <Finestra key={x} x={x} y={-250} w={50} h={44} c={c} on={on * 0.3} />)}
      {/* la vetrata */}
      <rect x="-220" y="-200" width="440" height="190" fill={c.ghost ? 'none' : '#2A2240'} stroke={c.ink} strokeWidth={6} />
      {!c.ghost && <Glow id="dd16-stu" x={-120} y={-120} r={170} t={T} color="#FFCF7A" amp={0.03} rate={2} opacity={0.5 * on} />}
      {/* poltrona */}
      <path d="M40 -40 V-120 Q40 -140 64 -140 H120 Q144 -140 144 -120 V-40 Z" fill={c.ghost ? 'none' : '#6A3A4A'} stroke={c.ink} strokeWidth={5} />
      <path d="M28 -40 V-90 H56 V-40 M128 -40 V-90 H156 V-40" fill={c.ghost ? 'none' : '#5A2E3E'} stroke={c.ink} strokeWidth={5} />
      {/* lampada a stelo */}
      <path d="M-150 -14 V-150 M-176 -150 h52 l-10 -28 h-32 Z" fill="#E8C27A" stroke={c.ink} strokeWidth={4} />
      {/* tavolino con metronomo e taccuino */}
      <path d="M-80 -14 V-70 M-40 -14 V-70 M-100 -70 H-20" stroke={c.ink} strokeWidth={5} />
      <path d="M-74 -70 L-66 -118 H-54 L-46 -70 Z" fill={c.ghost ? 'none' : '#8A5A3A'} stroke={c.ink} strokeWidth={4} />
      <path d="M-60 -76 L-60 -116" stroke={c.ink === DARK ? '#E8E0C8' : c.ink} strokeWidth={3} transform={`rotate(${swing} -60 -76)`} />
      <rect x="-118" y="-84" width="30" height="14" fill="#E8E0C8" stroke={c.ink} strokeWidth={2} transform="rotate(-8 -103 -77)" />
      {[-110, 0, 110].map((x) => <path key={x} d={`M${x} -200 V-10`} stroke={c.ink} strokeWidth={4} opacity={0.5} />)}
      <rect x="-40" y="-60" width="80" height="0" />
      <text x="0" y="-306" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={22} letterSpacing="4" fill={c.ghost ? c.ink : '#C9CDE8'} opacity={0.8}>STUDIO</text>
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------------------- SCUOLA

/** La scuola: lungo edificio di mattoni con la torre dell'orologio; `flood` 0..1 = l'acqua che sale dentro e fuori. */
export const Scuola: React.FC<{ c: Tav; T: number; flood?: number; lights?: number }> = ({ c, T, flood = 0, lights = 0.3 }) => {
  const brick = c.ghost ? c.wall : mix(c.wall, '#7A3A34', 0.45);
  const lv = flood * 120;
  return (
    <g strokeLinejoin="round">
      <rect x="-520" y="-260" width="1040" height="260" fill={brick} stroke={c.ink} strokeWidth={SW} />
      {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M-516 ${-26 - i * 26} H516`} stroke={c.ink} strokeWidth={1.5} opacity={0.25} />)}
      <path d="M-540 -260 H540 V-290 H-540 Z" fill={c.roof} stroke={c.ink} strokeWidth={SW} />
      {/* torre */}
      <rect x="-90" y="-470" width="180" height="210" fill={brick} stroke={c.ink} strokeWidth={SW} />
      <path d="M-110 -470 L0 -560 L110 -470 Z" fill={c.roof} stroke={c.ink} strokeWidth={SW} />
      <circle cx="0" cy="-390" r="52" fill={c.ghost ? 'none' : '#EDE6CF'} stroke={c.ink} strokeWidth={5} />
      <path d={`M0 -390 V-424 M0 -390 L${Math.sin(T * 0.2) * 26} ${-390 + Math.cos(T * 0.2) * 4}`} stroke={c.ink} strokeWidth={5} strokeLinecap="round" />
      {/* finestre su due piani */}
      {[-430, -330, -230, 230, 330, 430].flatMap((x) => [-190, -80].map((y) => <Finestra key={`${x}${y}`} x={x} y={y} w={60} h={64} c={c} on={lights * (((x + y) / 10) % 3 === 0 ? 1 : 0.4)} />))}
      {/* portone */}
      <path d="M-70 0 V-120 Q0 -170 70 -120 V0 Z" fill={c.roof} stroke={c.ink} strokeWidth={SW} />
      {flood > 0 && !c.ghost && <path d={`M-60 0 Q-20 ${-60 * flood} 0 ${-90 * flood} Q20 ${-60 * flood} 60 0 Z`} fill="#4A8ACB" opacity={0.85} />}
      <path d="M0 0 V-146" stroke={c.ink} strokeWidth={4} />
      <text x="0" y="-218" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={30} letterSpacing="8" fill={c.ghost ? c.ink : '#EDE6CF'}>SCUOLA</text>
      {/* l'acqua: dentro le finestre del piano terra e fuori dal portone, con le onde */}
      {flood > 0 && (
        <g>
          {[-430, -330, -230, 230, 330, 430].map((x) => (
            <rect key={x} x={x - 27} y={-80 + 29 - Math.min(58, flood * 70)} width={54} height={Math.min(58, flood * 70)} fill={c.ghost ? 'rgba(127,166,255,0.3)' : '#3A7AB8'} opacity={0.85} />
          ))}
          <path d={`M-700 ${8} ${Array.from({ length: 32 }, (_, i) => `Q${-678 + i * 44} ${-lv * 0.25 - 8 + Math.sin(T * 2 + i) * 5} ${-656 + i * 44} ${-lv * 0.25}`).join(' ')} V60 H-700 Z`} fill={c.ghost ? 'rgba(127,166,255,0.25)' : '#2E6AA8'} stroke={c.ink} strokeWidth={3} opacity={Math.min(1, flood * 2)} />
          {!c.ghost && Array.from({ length: 8 }, (_, i) => {
            const p = mod(T * 0.6 + i / 8, 1);
            return <circle key={i} cx={-560 + i * 150 + Math.sin(i) * 30} cy={4} r={6 + p * 30} fill="none" stroke="#A8D4FF" strokeWidth={2} opacity={(1 - p) * 0.6 * flood} />;
          })}
        </g>
      )}
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------------------- CINEMA

/** Il cinema del paese: facciata con l'insegna verticale, la pensilina a lampadine e le bacheche vuote. */
export const Cinema: React.FC<{ c: Tav; T: number; on?: number }> = ({ c, T, on = 1 }) => (
  <g strokeLinejoin="round">
    <rect x="-300" y="-380" width="600" height="380" fill={c.ghost ? c.wall : mix(c.wall, '#5A2E4A', 0.4)} stroke={c.ink} strokeWidth={SW} />
    <path d="M-300 -380 L-260 -420 H260 L300 -380 Z" fill={c.roof} stroke={c.ink} strokeWidth={SW} />
    {/* insegna verticale */}
    <rect x="-40" y="-560" width="80" height="250" rx="10" fill={c.ghost ? 'none' : '#2A1630'} stroke={c.ink} strokeWidth={6} />
    {'CINEMA'.split('').map((ch, i) => (
      <text key={i} x="0" y={-516 + i * 38} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={34} fill={c.ghost ? c.ink : '#FF5FA0'} opacity={on * (0.75 + 0.25 * Math.sin(T * 4 + i))}>{ch}</text>
    ))}
    {!c.ghost && <Glow id="dd16-cin" x={0} y={-430} r={200} t={T} color="#FF5FA0" amp={0.08} rate={3} opacity={0.35 * on} />}
    {/* pensilina con le lampadine */}
    <path d="M-280 -230 H280 L250 -170 H-250 Z" fill={c.ghost ? 'none' : '#F2E6C8'} stroke={c.ink} strokeWidth={6} />
    <rect x="-210" y="-222" width="420" height="40" fill={c.ghost ? 'none' : '#1A1420'} />
    {Array.from({ length: 22 }, (_, i) => (
      <circle key={i} cx={-262 + i * 25} cy={-176} r={6} fill={c.ghost ? c.ink : '#FFE08A'} opacity={on * (mod(i - Math.floor(T * 4), 3) === 0 ? 1 : 0.35)} />
    ))}
    {/* bacheche vuote e porte */}
    {[-200, 200].map((x) => <rect key={x} x={x - 50} y={-150} width={100} height={130} fill={c.ghost ? 'none' : '#2A2240'} stroke={c.ink} strokeWidth={5} />)}
    <rect x="-90" y="-150" width="180" height="150" fill={c.winOff} stroke={c.ink} strokeWidth={5} />
    <path d="M0 -150 V0" stroke={c.ink} strokeWidth={4} />
    <rect x="-86" y="-146" width="172" height="142" fill={c.win} opacity={on * 0.35} />
  </g>
);

// ---------------------------------------------------------------------------------------------------------------- CASA DI CUNNINGHAM

/** La grande casa di Cunningham, con prato e colonne; fire 0..1 = l'incendio, burnt 0..1 = le macerie annerite. */
export const CasaCunn: React.FC<{ c: Tav; T: number; fire?: number; burnt?: number }> = ({ c, T, fire = 0, burnt = 0 }) => {
  const w = c.ghost ? c.wall : mix(mix(c.wall, '#C9C0B0', 0.35), '#1A1416', burnt * 0.85);
  return (
    <g strokeLinejoin="round">
      <rect x="-360" y="-320" width="720" height="320" fill={w} stroke={c.ink} strokeWidth={SW} />
      <path d={burnt > 0.5 ? 'M-390 -320 L-260 -410 L-180 -380 L-60 -440 L60 -400 L180 -430 L390 -320 Z' : 'M-390 -320 L0 -500 L390 -320 Z'} fill={mix(c.roof, '#120E10', burnt)} stroke={c.ink} strokeWidth={SW} />
      {[-300, -180, 180, 300].map((x) => <rect key={x} x={x - 10} y={-160} width={20} height={160} fill={mix(c.trim, '#2A2224', burnt)} stroke={c.ink} strokeWidth={3} />)}
      <path d="M-330 -160 H330" stroke={c.ink} strokeWidth={6} />
      {[-260, -120, 120, 260].map((x) => <Finestra key={x} x={x} y={-250} w={60} h={70} c={c} on={(1 - burnt) * 0.7 + fire} />)}
      <rect x="-50" y="-130" width="100" height="130" fill={c.roof} stroke={c.ink} strokeWidth={5} />
      {/* il fuoco */}
      {fire > 0 && !c.ghost && (
        <g opacity={Math.min(1, fire * 1.5)}>
          {[-260, -90, 80, 250].map((x, i) => (
            <Fire key={x} id={`dd16-f${i}`} t={T + i * 0.7} x={x} y={-300 + (i % 2) * 30} scale={(0.9 + 0.5 * fire) * (i % 2 ? 1.1 : 0.9)} />
          ))}
          <Smoke id="dd16-fs" t={T} x={0} y={-460} color="#5A5468" n={12} rise={420} wind={-260} r0={40} r1={180} speed={0.16} opacity={0.6 * fire} />
        </g>
      )}
      {burnt > 0 && !c.ghost && <Smoke id="dd16-bs" t={T} x={-40} y={-380} color="#4A4658" n={6} rise={260} wind={-120} r0={20} r1={90} speed={0.12} opacity={0.35 * burnt * (1 - fire)} />}
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------------------- CASA DI NONNA MORTE

/** La casa isolata di Nonna Morte: vecchia, storta, con la veranda e la cassetta della posta sulla strada. */
export const CasaNonna: React.FC<{ c: Tav; T: number; flick?: number }> = ({ c, T, flick = 0 }) => (
  <g strokeLinejoin="round">
    <path d="M-220 0 V-260 L-200 -266 L0 -420 L210 -256 V0 Z" fill={c.ghost ? c.wall : mix(c.wall, '#4A4A50', 0.5)} stroke={c.ink} strokeWidth={SW} />
    {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M${-210 + i * 42} -8 V-250`} stroke={c.ink} strokeWidth={2} opacity={0.3} />)}
    <path d="M-240 -258 L0 -440 L236 -250" fill="none" stroke={c.ink} strokeWidth={SW + 2} />
    <Finestra x={0} y={-300} w={46} h={60} c={c} on={0.9} flick={flick} T={T} />
    <Finestra x={-120} y={-160} w={50} h={64} c={c} on={0.15} />
    <Finestra x={120} y={-160} w={50} h={64} c={c} on={0.15} />
    <path d="M-240 -86 H240 L220 -106 H-220 Z" fill={c.roof2} stroke={c.ink} strokeWidth={5} />
    {[-220, -80, 80, 220].map((x) => <rect key={x} x={x - 6} y={-86} width={12} height={86} fill={c.trim} stroke={c.ink} strokeWidth={3} />)}
    <rect x="-30" y="-80" width="60" height="80" fill={c.roof} stroke={c.ink} strokeWidth={5} />
    {/* cassetta della posta sulla strada */}
    <g transform="translate(330 0)">
      <path d="M0 0 V-90" stroke={c.ink === DARK ? '#5A4A3A' : c.ink} strokeWidth={8} />
      <path d="M-30 -90 V-118 Q-30 -140 0 -140 Q30 -140 30 -118 V-90 Z" fill={c.ghost ? 'none' : '#7A7E90'} stroke={c.ink} strokeWidth={5} />
      <path d="M30 -116 H46 V-136 H38" fill="none" stroke={c.ghost ? c.ink : RED} strokeWidth={5} />
    </g>
  </g>
);

// ---------------------------------------------------------------------------------------------------------------- COLLINA

/** La collina che guarda il paese, con il guardrail e una staccionata; `fari` 0..1 = un'auto ferma con i fari accesi. */
export const Collina: React.FC<{ c: Tav; T: number; fari?: number }> = ({ c, T, fari = 0 }) => (
  <g strokeLinejoin="round">
    <path d="M-700 0 Q-500 -40 -300 -200 Q-120 -330 120 -340 L520 -344 Q640 -340 700 -300 V0 Z" fill={c.ghost ? c.grass : mix(c.grass, '#2A3A36', 0.3)} stroke={c.ink} strokeWidth={SW} />
    <path d="M-60 -332 H460" stroke={c.ink === DARK ? '#8A8FA8' : c.ink} strokeWidth={6} />
    {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${-50 + i * 62} -332 V-360`} stroke={c.ink === DARK ? '#8A8FA8' : c.ink} strokeWidth={6} />)}
    <path d="M-60 -356 H460" stroke={c.ink === DARK ? '#C9CDE8' : c.ink} strokeWidth={5} />
    {fari > 0 && (
      <g opacity={fari}>
        {/* l'auto vista da dietro-lato, solo sagoma scura e fari */}
        <path d="M260 -346 V-380 Q262 -400 290 -404 L330 -428 H400 L430 -404 Q456 -400 460 -380 V-346 Z" fill="#1A1C30" stroke={c.ink} strokeWidth={4} />
        <circle cx="290" cy="-352" r={13} fill="#1A1C30" stroke={c.ink} strokeWidth={3} />
        <circle cx="430" cy="-352" r={13} fill="#1A1C30" stroke={c.ink} strokeWidth={3} />
        <path d="M456 -386 L900 -470 V-300 Z" fill="#FFF3C4" opacity={0.16} />
        <circle cx="456" cy="-386" r={8} fill="#FFF3C4" />
      </g>
    )}
  </g>
);

/** L'auto dell'ultima notte: solo i fari che arrivano dalla curva (nessuna persona visibile). */
export const Fari: React.FC<{ x: number; y: number; k: number; T: number; ears?: number }> = ({ x, y, k, T, ears = 0 }) => (
  <g transform={`translate(${x} ${y})`} opacity={Math.min(1, k * 3)}>
    <path d={`M0 -40 L${-700 * k - 200} -140 V60 Z`} fill="#FFF3C4" opacity={0.18 + 0.2 * k} />
    <path d="M-30 -10 V-52 Q-26 -78 10 -84 L54 -112 H150 L186 -84 Q214 -78 220 -52 V-10 Z" fill="#1A1C30" stroke={INK} strokeWidth={4} />
    <path d="M62 -104 L80 -80 H140 L150 -104 Z" fill="#2A3060" stroke={INK} strokeWidth={3} />
    <circle cx="20" cy="-14" r={18} fill="#1A1C30" stroke={INK} strokeWidth={3} />
    <circle cx="180" cy="-14" r={18} fill="#1A1C30" stroke={INK} strokeWidth={3} />
    <circle cx="-24" cy="-44" r={12} fill="#FFF8D8" />
    <Glow id="dd16-fari" x={-24} y={-44} r={120} t={T} color="#FFF3C4" amp={0.05} rate={6} opacity={0.7} />
    {ears > 0 && (
      <g transform="translate(110 -112) scale(.7)" opacity={ears}>
        <path d="M-16 6 Q-30 -30 -18 -40 Q-6 -36 -6 2 M16 6 Q30 -30 18 -40 Q6 -36 6 2" fill="#5A5F78" stroke={INK} strokeWidth={4} />
      </g>
    )}
  </g>
);

/** Strada lungo tutto il paese, con marciapiede e linea di mezzeria. */
export const Strada: React.FC<{ x0: number; x1: number; y: number; c: Tav }> = ({ x0, x1, y, c }) => (
  <g>
    <rect x={x0} y={y} width={x1 - x0} height={18} fill={c.ghost ? 'none' : mix(c.ground, '#5A5A70', 0.4)} stroke={c.ink} strokeWidth={4} />
    <rect x={x0} y={y + 18} width={x1 - x0} height={110} fill={c.ghost ? 'none' : mix(c.ground, '#202436', 0.5)} stroke={c.ink} strokeWidth={4} />
    <path d={`M${x0} ${y + 72} H${x1}`} stroke={c.ghost ? c.ink : '#E8D48A'} strokeWidth={5} strokeDasharray="60 50" opacity={0.7} />
  </g>
);

export { flamePath, seg };
