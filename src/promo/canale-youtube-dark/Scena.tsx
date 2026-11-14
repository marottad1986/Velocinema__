import React from 'react';
import { eio, eo, eob, lerp, mod, seg } from '../../lib/anim';
import { HAND, SANS, STENCIL } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Fog, Glow, Rain, Stars } from '../../lib/elements';
import { BRASS, Cards, K, Letter, Pines, PocketWatch, Raincoat, TINT, Tower, YELLOW, Yarn } from '../../scenes/dark-stagione-1/Winden';
import type { ScenaPromoProps } from '../registro';

// Short promozionale del canale YouTube (promo/canale-youtube-dark.json): una sola immagine verticale alta, percorsa
// dalla camera che segue la voce.
// Fotogramma 0 = miniatura: bollino «NUOVO SU YOUTUBE», «DARK» enorme, «TUTTA LA SERIE / E IL FINALE», gli ideatori;
// sotto, il quadrante d'ottone sopra il bosco e le torri, con l'impermeabile giallo appeso e annodato da un filo rosso.
// Poi la camera scende lungo il filo rosso, che attraversa le tappe del video lungo (vocabolario di Spiegato semplice:
// cerchio con oggetto, cartellino pieno = colpo di scena, anello rosso = il nodo): la grotta, la famiglia annodata, i due
// mondi, il finale spiegato; il filo entra nel pulsante play di un lettore video generico (senza logo) con la miniatura
// del video lungo; sotto, «Metti like» e «Iscriviti al canale», che si preme, e la campanella che suona.
// Piani: cielo e quadrante sullo sfondo (0,3) · torri e bosco (0,6) · scena (1) · abeti e pioggia vicini (fissi, escono)
// Nessuna figura umana: l'impermeabile è appeso, i personaggi sono oggetti.

const CHALK = '#E8E2D2';
const BLUE = '#5A9AE0';
const RED = '#D9483A';
const W = 1080;
const CROMA = 60 / 66 / 2;
const g = (s: number) => Math.round(s / CROMA) * CROMA;
const pop = (t: number, t0: number) => (t < t0 ? 0 : eob(seg(t, t0, t0 + 0.45), 1.7));

// ---- posizioni nel mondo (x 0–1080, y 0–3800)
const O = [540, 1190] as const; // quadrante
const R = 240;
const TAG = 1575; // cartellino «sul nostro canale YouTube»
const S1 = [300, 1840] as const;
const S2 = [780, 2130] as const;
const S3 = [300, 2420] as const;
const FIN = [560, 2715] as const;
const SCR = { x: 120, y: 2880, w: 840, h: 472 }; // lettore video
const PLAY = [555, SCR.y + SCR.h / 2 - 20] as const;
const BTN = 3410;

/** Giri di filo attorno all'impermeabile (come nella miniatura del video lungo). */
const ANELLI = [{ x: 0, y: -40, rx: 190, ry: 64, rot: -16 }, { x: 0, y: 46, rx: 168, ry: 56, rot: 20 }];
const arco = (a: (typeof ANELLI)[number], dietro: boolean) => {
  const c = Math.cos((a.rot * Math.PI) / 180), s = Math.sin((a.rot * Math.PI) / 180);
  const p = (k: number) => [a.x + c * a.rx * k, a.y + s * a.rx * k];
  const [x1, y1] = p(-1), [x2, y2] = p(1);
  return `M${x1} ${y1} A${a.rx} ${a.ry} ${a.rot} 0 ${dietro ? 1 : 0} ${x2} ${y2}`;
};

/** Il filo rosso, a tratti: ognuno si disegna quando la voce ci arriva. */
const FILO = [
  `M${O[0] + 150} ${O[1] + 40} C${O[0] + 260} ${O[1] + 160} ${O[0] + 120} ${TAG - 120} ${O[0]} ${TAG - 52}`,
  `M${O[0]} ${TAG + 52} C${O[0]} ${TAG + 150} ${S1[0] + 40} ${S1[1] - 190} ${S1[0]} ${S1[1] - 104}`,
  `M${S1[0]} ${S1[1] + 104} C${S1[0] + 20} ${S1[1] + 210} ${S2[0] - 40} ${S2[1] - 220} ${S2[0]} ${S2[1] - 104}`,
  `M${S2[0]} ${S2[1] + 104} C${S2[0] - 20} ${S2[1] + 210} ${S3[0] + 40} ${S3[1] - 220} ${S3[0]} ${S3[1] - 104}`,
  `M${S3[0]} ${S3[1] + 104} C${S3[0] + 10} ${S3[1] + 200} ${FIN[0] - 60} ${FIN[1] - 160} ${FIN[0]} ${FIN[1] - 62}`,
  `M${FIN[0]} ${FIN[1] + 62} C${FIN[0]} ${FIN[1] + 160} ${PLAY[0]} ${PLAY[1] - 230} ${PLAY[0]} ${PLAY[1] - 74}`,
];

const Filo: React.FC<{ d: string; k: number; t: number }> = ({ d, k, t }) => (k <= 0 ? null : (
  <g>
    <path d={d} fill="none" stroke={K} strokeWidth="17" strokeLinecap="round" opacity=".5" pathLength={1} strokeDasharray={`${k} 1`} />
    <path d={d} fill="none" stroke={RED} strokeWidth="10" strokeLinecap="round" pathLength={1} strokeDasharray={`${k} 1`} />
    {k >= 1 && <path d={d} fill="none" stroke="#FFB4A4" strokeWidth="3.5" strokeLinecap="round" pathLength={1} strokeDasharray="0.06 0.94" strokeDashoffset={-mod(t * 0.5, 1)} opacity=".8" />}
  </g>
));

/** Cerchio-tappa con il suo oggetto (stesso vocabolario degli schemi di Spiegato semplice). */
const Tappa: React.FC<{ id: string; t: number; t0: number; x: number; y: number; r?: number; children: React.ReactNode; ring?: string }> = ({ id, t, t0, x, y, r = 104, children, ring = CHALK }) => {
  const p = pop(t, t0);
  if (p <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${p})`}>
      <circle r={r + 8} fill="#000" opacity=".35" transform="translate(5 9)" />
      <circle r={r} fill="#22302B" stroke={ring} strokeWidth="6" />
      <clipPath id={`${id}-c`}><circle r={r - 6} /></clipPath>
      <g clipPath={`url(#${id}-c)`}>{children}</g>
      <circle r={r - 6} fill="none" stroke="#000" strokeWidth="10" opacity=".22" />
    </g>
  );
};

/** Cartellino «STAGIONE N» e scritta a mano accanto a una tappa. */
const Etichetta: React.FC<{ t: number; t0: number; x: number; y: number; n: string; mano: string; dx: number }> = ({ t, t0, x, y, n, mano, dx }) => {
  const k = eo(seg(t, t0 + 0.25, t0 + 0.6));
  if (k <= 0) return null;
  const anchor = dx > 0 ? 'start' : 'end';
  const bx = dx > 0 ? x + dx : x + dx - 232;
  return (
    <g opacity={k} transform={`translate(${(1 - k) * 20 * Math.sign(dx)} 0)`}>
      <g transform={`rotate(${dx > 0 ? -3 : 3} ${bx + 116} ${y - 30})`}>
        <rect x={bx} y={y - 66} width="232" height="62" rx="12" fill={CHALK} />
        <text x={bx + 116} y={y - 22} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="34" letterSpacing="2" fill="#0B0F0E">{n}</text>
      </g>
      <text x={dx > 0 ? x + dx + 4 : x + dx - 4} y={y + 52} textAnchor={anchor} fontFamily={HAND} fontWeight={700} fontSize="50" fill={YELLOW}>{mano}</text>
    </g>
  );
};

export const Scena: React.FC<ScenaPromoProps> = ({ T, tempi, cue }) => {
  const t = T;
  const fine = tempi.fine;
  // ---- eventi, sulla croma di 66 bpm come gli at() dello spartito
  const c = (n: number) => cue('canale', n);
  const h = (n: number) => cue('chiusura', n);
  const esce = eio(seg(t, c(0) - 0.15, c(0) + 0.9)); // la scritta della miniatura esce
  const eTag = g(c(1) + 0.2);
  const eS1 = g(c(2) + 0.35); // «grotta»
  const eS2 = g(c(2) + 3.1); // «famiglia annodata»
  const eS3 = g(c(2) + 4.55); // «due mondi»
  const eFin = g(c(3) + 1.1); // «capitolo nuovo sul finale»
  const eScr = g(tempi.inizio.chiusura + 0.1);
  const eLike = g(h(0) + 1.0);
  const eIscr = g(h(0) + 2.4); // «iscriviti al canale»: il pulsante si preme
  const eBell = g(h(1) + 0.6); // «non perdi»
  const eComm = g(h(2) + 0.2);

  // ---- camera: punto del mondo (cy) portato all'altezza F dello schermo, con zoom z
  type Key = [number, number, number, number]; // [t, cy, F, z]
  const keys: Key[] = [
    [0, 960, 960, 1],
    [c(0) - 0.15, 960, 960, 1.015],
    [c(0) + 1.4, O[1] + 10, 700, 1.1],
    [eTag - 0.5, O[1] + 40, 700, 1.1],
    [eTag + 0.9, TAG, 760, 1],
    [eS1 - 0.6, TAG + 120, 760, 1],
    [eS1 + 0.6, 1960, 760, 1],
    [eS3 + 0.8, 2300, 760, 1],
    [eFin - 0.4, 2380, 760, 1],
    [eFin + 1.0, 2560, 760, 1],
    [eScr - 0.4, 2600, 760, 1],
    [eScr + 1.6, 3330, 860, 1],
    [fine, 3345, 860, 1],
  ];
  let ki = 0;
  while (ki < keys.length - 2 && t > keys[ki + 1][0]) ki++;
  const [ta, ya, fa, za] = keys[ki], [tb, yb, fb, zb] = keys[ki + 1];
  const p = eio(seg(t, ta, tb));
  const cy = lerp(ya, yb, p), F = lerp(fa, fb, p), z = lerp(za, zb, p);
  // oscillazione lenta; si ferma nella chiusura, così pulsanti e scritte restano dentro x 120–960
  const sway = Math.sin(t * 0.35) * 5 * (1 - seg(t, eScr, eScr + 1.6));
  const cam = (f: number) => `translate(${540 + sway * f} ${F}) scale(${1 + (z - 1) * f}) translate(-540 ${-(960 + (cy - 960) * f)})`;
  const giu = seg(cy, 1250, 1700); // quanto la camera è scesa sotto il bosco

  // lancette all'indietro (più veloci sulla domanda), scintilla sull'anello
  const back = -(t * 40 + 220 * eio(seg(t, g(0.6), g(0.6) + 1.8)));
  const sc = mod(t * 0.45, 1);

  // filo: un tratto per frase
  const kf = [
    eo(seg(t, eTag - 0.6, eTag)),
    eo(seg(t, eS1 - 0.7, eS1)),
    eo(seg(t, eS2 - 0.7, eS2)),
    eo(seg(t, eS3 - 0.7, eS3)),
    eo(seg(t, eFin - 0.8, eFin)),
    eo(seg(t, eScr - 0.2, eScr + 0.9)),
  ];

  // chiusura: lettore che si accende, barra che avanza, pulsanti
  const scr = eo(seg(t, eScr + 0.5, eScr + 1.2));
  const prog = mod(Math.max(0, t - eScr - 1) * 0.08, 1);
  const like = pop(t, eLike);
  const premuto = t >= eIscr;
  const press = 1 - 0.08 * Math.sin(Math.PI * seg(t, eIscr, eIscr + 0.22));
  const bell = t >= eBell ? Math.sin((t - eBell) * 18) * 22 * Math.exp(-(t - eBell) * 2.2) : 0;
  const onde = t >= eBell ? seg(t, eBell, eBell + 1.2) : 0;
  const comm = eo(seg(t, eComm, eComm + 0.4));
  const cerca = seg(t, eScr + 1.6, eScr + 2.6); // «In 2 Minuti» si scrive nella barra quando la camera è ferma
  const testoCerca = 'In 2 Minuti'.slice(0, Math.round(cerca * 11));

  return (
    <>
      <svg viewBox={`0 0 ${W} 1920`} width={W} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <FxDefs id="pc" />
          <Lin id="pc-sky" stops={[[0, '#05080A'], [0.16, '#0E1915'], [0.3, '#22332C'], [0.42, '#131D19'], [0.55, '#0F1714'], [1, '#0B110F']]} />
          <Lin id="pc-tower" x2={1} y2={0} stops={[[0, '#5E6A64'], [1, '#2A3430']]} />
          <Lin id="pc-ground" stops={[[0, '#141E1A', 1], [0.25, '#121A17', 1], [1, '#0F1714', 0]]} />
          <radialGradient id="pc-face" cx=".45" cy=".4" r=".7">
            <stop offset="0" stopColor="#2A3A33" />
            <stop offset=".7" stopColor="#18221E" />
            <stop offset="1" stopColor="#0E1512" />
          </radialGradient>
          <linearGradient id="pc-brass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F0D592" />
            <stop offset=".45" stopColor={BRASS} />
            <stop offset="1" stopColor="#6E5526" />
          </linearGradient>
          <radialGradient id="pc-mouth">
            <stop offset="0" stopColor="#FFF4D0" />
            <stop offset=".4" stopColor="#E8B860" />
            <stop offset="1" stopColor="#120E08" />
          </radialGradient>
          <linearGradient id="pc-scr" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#0A100E" />
            <stop offset=".6" stopColor="#1A2A24" />
            <stop offset="1" stopColor="#2C3F37" />
          </linearGradient>
          <radialGradient id="pc-top" cx=".5" cy="0" r="1">
            <stop offset="0" stopColor="#040605" stopOpacity=".85" />
            <stop offset=".6" stopColor="#040605" stopOpacity=".5" />
            <stop offset="1" stopColor="#040605" stopOpacity="0" />
          </radialGradient>
          <clipPath id="pc-dial"><circle r={R - 22} /></clipPath>
          <clipPath id="pc-scrclip"><rect x={SCR.x} y={SCR.y} width={SCR.w} height={SCR.h} rx="22" /></clipPath>
        </defs>

        {/* sfondo: cielo che diventa lavagna; il grande quadrante tenue dietro lo schema (vocabolario di Dark) */}
        <g transform={cam(0.3)}>
          <rect x="-400" y="-300" width={W + 800} height="4600" fill="url(#pc-sky)" />
          <Stars t={t} seed={19} n={46} x={-100} y={-60} w={W + 200} h={1100} color="#DDE6E0" size={0.8} />
        </g>
        <g transform={cam(0.55)} opacity={0.55 * giu}>
          <g transform={`translate(540 2500) rotate(${-t * 3})`}>
            <circle r="760" fill="none" stroke={CHALK} strokeWidth="5" opacity=".14" />
            <circle r="700" fill="none" stroke={CHALK} strokeWidth="2" opacity=".1" />
            {Array.from({ length: 60 }, (_, i) => (
              <path key={i} d={`M0 -752 V${i % 5 ? -728 : -690}`} stroke={CHALK} strokeWidth={i % 5 ? 3 : 8} opacity=".16" transform={`rotate(${i * 6})`} />
            ))}
          </g>
        </g>
        {/* torri della centrale e bosco di Winden, ai lati e dietro il quadrante */}
        <g transform={cam(0.65)}>
          <g transform="translate(150 1520)"><Tower id="pc-t1" t={t} w={210} h={420} fill="url(#pc-tower)" outline={K} sw={6} steamOpacity={0.5} /></g>
          <g transform="translate(950 1530)"><Tower id="pc-t2" t={t + 2} w={170} h={320} fill="url(#pc-tower)" outline={K} sw={5} steamOpacity={0.4} /></g>
          <circle cx="150" cy="1105" r="8" fill="#FF5A4A" opacity={Math.sin(t * 3) > 0 ? 1 : 0.3} />
          <Pines t={t} y={1480} n={16} h={230} seed={23} color="#0E1613" sway={2} x0={-200} x1={W + 200} />
          <Fog id="pc-f1" t={t} y={1460} x={540} rx={900} ry={80} color="#5E746A" opacity={0.3} speed={0.25} />
          <path d={`M-400 1470 Q540 1440 ${W + 400} 1470 V2300 H-400 Z`} fill="url(#pc-ground)" />
        </g>

        <g transform={cam(1)}>
          {/* ---- il quadrante d'ottone con l'impermeabile annodato */}
          <g transform={`translate(${O[0]} ${O[1]})`}>
            <Glow id="pc-qg" x={0} y={0} r={R * 1.6} t={t} color="#8FB8A0" amp={0.05} rate={1.4} opacity={0.2} />
            <circle r={R + 8} fill="#000" opacity=".4" transform="translate(8 14)" />
            <rect x="-28" y={-R - 40} width="56" height="40" rx="9" fill="url(#pc-brass)" stroke={K} strokeWidth="7" />
            <circle r={R} fill="url(#pc-brass)" stroke={K} strokeWidth="9" />
            <circle r={R - 22} fill="url(#pc-face)" stroke={K} strokeWidth="5" />
            <g clipPath="url(#pc-dial)">
              <circle r={R - 40} fill="none" stroke={CHALK} strokeWidth="2" opacity=".2" />
            </g>
            {Array.from({ length: 60 }, (_, i) => (
              <path key={i} d={`M0 ${-(R - 30)} V${-(R - (i % 5 ? 40 : 60))}`} stroke={CHALK} strokeWidth={i % 5 ? 2.5 : 7} opacity=".75" transform={`rotate(${i * 6})`} />
            ))}
            <path d="M0 22 V-130" stroke={CHALK} strokeWidth="10" strokeLinecap="round" opacity=".85" transform={`rotate(${back / 12 + 300})`} />
            <path d="M0 26 V-185" stroke={CHALK} strokeWidth="5" strokeLinecap="round" opacity=".85" transform={`rotate(${back})`} />
            <circle r="15" fill={CHALK} stroke={K} strokeWidth="4" />
            <path d="M-140 -120 Q-80 -185 -8 -200" fill="none" stroke="#FFFFFF" strokeWidth="8" opacity=".18" strokeLinecap="round" />
            {/* impermeabile e i due giri di filo: la metà alta passa dietro, la bassa davanti */}
            <Glow id="pc-cg" x={0} y={-10} r={210} t={t} color={YELLOW} amp={0.08} rate={2.2} opacity={0.38} />
            {ANELLI.map((a, i) => <path key={`b${i}`} d={arco(a, true)} fill="none" stroke="#7A2A24" strokeWidth="10" strokeLinecap="round" />)}
            <g transform="translate(0 -142)"><Raincoat id="pc-rc" t={t} scale={0.6} wind={0.7} /></g>
            {ANELLI.map((a, i) => (
              <g key={`f${i}`}>
                <path d={arco(a, false)} fill="none" stroke={K} strokeWidth="17" strokeLinecap="round" opacity=".55" />
                <path d={arco(a, false)} fill="none" stroke={RED} strokeWidth="11" strokeLinecap="round" />
                <path d={arco(a, false)} fill="none" stroke="#FFB4A4" strokeWidth="3.5" strokeLinecap="round" pathLength={1} strokeDasharray="0.12 0.88" strokeDashoffset={-mod(sc + i * 0.5, 1)} opacity=".85" />
              </g>
            ))}
          </g>

          {/* ---- il filo rosso che scende */}
          {FILO.map((d, i) => <Filo key={i} d={d} k={kf[i]} t={t} />)}

          {/* ---- cartellino «sul nostro canale YouTube · un video lungo» */}
          {t >= eTag && (
            <g transform={`translate(${O[0]} ${TAG}) rotate(-2) scale(${pop(t, eTag)})`}>
              <rect x="-330" y="-58" width="660" height="116" rx="22" fill="#000" opacity=".35" transform="translate(5 8)" />
              <rect x="-330" y="-58" width="660" height="116" rx="22" fill={RED} stroke={K} strokeWidth="6" />
              {/* piccolo schermo con la sua base (icona generica, non il logo della piattaforma) */}
              <g transform="translate(-262 -4)">
                <rect x="-44" y="-30" width="88" height="56" rx="6" fill="none" stroke={CHALK} strokeWidth="6" />
                <rect x="-34" y="-20" width="68" height="36" rx="2" fill={CHALK} opacity=".25" />
                <path d="M-18 40 H18 M0 26 V40" stroke={CHALK} strokeWidth="6" strokeLinecap="round" />
              </g>
              <text x="-196" y="-6" fontFamily={SANS} fontWeight={900} fontSize="40" fill={CHALK}>SUL NOSTRO CANALE</text>
              <text x="-196" y="38" fontFamily={SANS} fontWeight={800} fontSize="32" letterSpacing="1" fill="#FFE0D8">un video lungo · tutta la serie</text>
            </g>
          )}

          {/* ---- stagione 1: la grotta che porta indietro di 33 anni */}
          <Tappa id="pc-s1" t={t} t0={eS1} x={S1[0]} y={S1[1]}>
            <rect x="-110" y="-110" width="220" height="220" fill="#16201C" />
            <Pines t={t} y={-10} n={6} h={90} seed={5} color="#0E1613" x0={-120} x1={120} />
            <path d="M-100 110 Q-80 -10 -20 -40 Q0 -50 20 -40 Q80 -10 100 110 Z" fill="#34403A" stroke={K} strokeWidth="6" />
            <path d="M-34 110 Q-34 10 0 4 Q34 10 34 110 Z" fill="url(#pc-mouth)" stroke={K} strokeWidth="5" />
            <Glow id="pc-s1g" x={0} y={60} r={90} t={t} color="#FFD27A" amp={0.15} rate={3} opacity={0.6} />
          </Tappa>
          <Etichetta t={t} t0={eS1} x={S1[0]} y={S1[1]} n="STAGIONE 1" mano="la grotta: −33 anni" dx={130} />

          {/* ---- stagione 2: la famiglia annodata (lettera, carte, gomitolo legati dal filo) */}
          <Tappa id="pc-s2" t={t} t0={eS2} x={S2[0]} y={S2[1]}>
            <rect x="-110" y="-110" width="220" height="220" fill="#1E2A25" />
            <path d="M-46 -38 C10 -60 40 0 30 40 M-46 -38 C-60 20 -20 60 30 40" fill="none" stroke={RED} strokeWidth="5" />
            <g transform="translate(-44 -40) rotate(-12)"><Letter scale={0.22} /></g>
            <g transform="translate(40 -26) rotate(10)"><Cards fan={0.5} scale={0.34} /></g>
            <g transform="translate(-6 50)"><Yarn r={24} /></g>
          </Tappa>
          <Etichetta t={t} t0={eS2} x={S2[0]} y={S2[1]} n="STAGIONE 2" mano="la famiglia annodata" dx={-130} />

          {/* ---- stagione 3: i due mondi (il cerchio diviso, l'impermeabile allo specchio) */}
          <Tappa id="pc-s3" t={t} t0={eS3} x={S3[0]} y={S3[1]} ring={CHALK}>
            <rect x="-110" y="-110" width="110" height="220" fill="#22302B" />
            <rect x="0" y="-110" width="110" height="220" fill="#1C3148" />
            <g transform="translate(-46 -58)"><Raincoat id="pc-s3a" t={t} scale={0.26} wind={0.6} wet={false} /></g>
            <g transform="translate(46 -58) scale(-1 1)" opacity=".85"><Raincoat id="pc-s3b" t={t + 1} scale={0.26} wind={0.6} wet={false} /></g>
            <rect x="0" y="-110" width="110" height="220" fill={BLUE} opacity=".16" />
            <path d="M0 -110 L-6 -60 L7 -20 L-5 20 L6 60 L0 110" fill="none" stroke="#F4FBFF" strokeWidth="4" strokeLinejoin="round" />
          </Tappa>
          <Etichetta t={t} t0={eS3} x={S3[0]} y={S3[1]} n="STAGIONE 3" mano="i due mondi" dx={130} />

          {/* ---- il finale spiegato: cartellino pieno (colpo di scena) e anello rosso attorno all'orologio di Tannhaus */}
          {t >= eFin && (
            <g transform={`translate(${FIN[0]} ${FIN[1]}) rotate(-2) scale(${pop(t, eFin)})`}>
              <rect x="-300" y="-62" width="600" height="124" rx="18" fill="#000" opacity=".35" transform="translate(6 9)" />
              <rect x="-300" y="-62" width="600" height="124" rx="18" fill={YELLOW} stroke={K} strokeWidth="6" />
              <text x="-150" y="-4" fontFamily={SANS} fontWeight={900} fontSize="48" fill="#0B0F0E">IL FINALE</text>
              <text x="-150" y="42" fontFamily={SANS} fontWeight={900} fontSize="48" fill="#0B0F0E">SPIEGATO</text>
              <g transform="translate(-228 0)">
                <PocketWatch t={t} scale={0.5} reverse />
                <circle r={62 + 4 * Math.sin(t * 4)} fill="none" stroke={RED} strokeWidth="7" opacity={0.9} />
              </g>
              <text x="300" y="-84" textAnchor="end" fontFamily={HAND} fontWeight={700} fontSize="46" fill={CHALK} transform="rotate(4 300 -84)">capitolo nuovo!</text>
            </g>
          )}

          {/* ---- il lettore video con la miniatura del video lungo (generico: nessun logo) */}
          {t >= eScr - 0.3 && (
            <g opacity={seg(t, eScr - 0.3, eScr + 0.2)}>
              <rect x={SCR.x - 14} y={SCR.y - 14} width={SCR.w + 28} height={SCR.h + 28} rx="32" fill="#000" opacity=".4" transform="translate(8 12)" />
              <rect x={SCR.x - 14} y={SCR.y - 14} width={SCR.w + 28} height={SCR.h + 28} rx="32" fill="#141A18" stroke={K} strokeWidth="8" />
              <g clipPath="url(#pc-scrclip)">
                <rect x={SCR.x} y={SCR.y} width={SCR.w} height={SCR.h} fill="url(#pc-scr)" />
                <g opacity={scr}>
                  <Stars t={t} seed={4} n={16} x={SCR.x} y={SCR.y} w={SCR.w} h={200} color="#DDE6E0" size={0.6} />
                  <Pines t={t} y={SCR.y + SCR.h} n={12} h={110} seed={8} color="#0B120F" x0={SCR.x - 40} x1={SCR.x + SCR.w + 40} />
                  {/* miniatura del lungo: DARK a sinistra, il quadrante annodato a destra */}
                  <text x={SCR.x + 34} y={SCR.y + 170} fontFamily={STENCIL} fontWeight={800} fontSize="132" fill="#EEF1EC">DARK</text>
                  <text x={SCR.x + 38} y={SCR.y + 222} fontFamily={SANS} fontWeight={900} fontSize="32" fill="#EEF1EC">TUTTA LA SERIE</text>
                  <text x={SCR.x + 38} y={SCR.y + 260} fontFamily={SANS} fontWeight={900} fontSize="32" fill={YELLOW}>E IL FINALE</text>
                  <g transform={`translate(${SCR.x + 680} ${SCR.y + 196})`}>
                    <circle r="120" fill="url(#pc-brass)" stroke={K} strokeWidth="6" />
                    <circle r="106" fill="url(#pc-face)" stroke={K} strokeWidth="4" />
                    {Array.from({ length: 12 }, (_, i) => <path key={i} d="M0 -98 V-86" stroke={CHALK} strokeWidth={i % 3 ? 3 : 6} opacity=".7" transform={`rotate(${i * 30})`} />)}
                    <g transform="translate(0 -70)"><Raincoat id="pc-mini" t={t} scale={0.3} wind={0.5} wet={false} /></g>
                    <ellipse rx="96" ry="30" fill="none" stroke={RED} strokeWidth="6" transform="rotate(-14)" />
                  </g>
                </g>
                {/* barra di avanzamento divisa nelle quattro tappe */}
                <rect x={SCR.x} y={SCR.y + SCR.h - 70} width={SCR.w} height="70" fill="#050807" opacity=".7" />
                {[0, 1, 2, 3].map((i) => {
                  const x0 = SCR.x + 30 + i * 198, w = 190;
                  const f = Math.max(0, Math.min(1, prog * 4 - i));
                  return (
                    <g key={i}>
                      <rect x={x0} y={SCR.y + SCR.h - 26} width={w} height="10" rx="5" fill="#FFFFFF" opacity=".28" />
                      <rect x={x0} y={SCR.y + SCR.h - 26} width={w * f * scr} height="10" rx="5" fill={RED} />
                      <text x={x0} y={SCR.y + SCR.h - 38} fontFamily={SANS} fontWeight={800} fontSize="20" fill={CHALK} opacity={0.8 * scr}>{['STAGIONE 1', 'STAGIONE 2', 'STAGIONE 3', 'IL FINALE'][i]}</text>
                    </g>
                  );
                })}
              </g>
              {/* il pulsante play al centro, dove entra il filo rosso */}
              <g transform={`translate(${PLAY[0]} ${PLAY[1]}) scale(${1 + 0.05 * Math.sin(t * 5) * scr})`}>
                <Glow id="pc-pg" x={0} y={0} r={140} t={t} color={RED} amp={0.1} rate={2.5} opacity={0.4 * scr} />
                <circle r="62" fill="#0B0F0E" opacity=".55" />
                <circle r="62" fill="none" stroke={CHALK} strokeWidth="7" />
                <path d="M-18 -30 L32 0 L-18 30 Z" fill={CHALK} />
              </g>
            </g>
          )}

          {/* ---- pulsanti: metti like, iscriviti (si preme), campanella che suona */}
          {like > 0 && (
            <g transform={`translate(260 ${BTN + 48}) scale(${like})`}>
              <rect x="-140" y="-48" width="280" height="96" rx="48" fill="#1E2824" stroke={CHALK} strokeWidth="5" />
              <path transform="translate(-84 2)" d="M0 14 C-22 -2 -24 -22 -12 -26 C-4 -29 0 -22 0 -18 C0 -22 4 -29 12 -26 C24 -22 22 -2 0 14 Z" fill={RED} stroke={K} strokeWidth="3" />
              <text x="-46" y="13" fontFamily={SANS} fontWeight={800} fontSize="36" fill={CHALK}>Metti like</text>
            </g>
          )}
          {like > 0 && (
            <g transform={`translate(660 ${BTN + 48}) scale(${pop(t, eLike + CROMA) * press})`}>
              <rect x="-230" y="-48" width="460" height="96" rx="48" fill={premuto ? '#3A4440' : RED} stroke={K} strokeWidth="5" />
              <g transform={`translate(-178 -2) rotate(${bell})`}>
                <path d="M0 -26 Q-16 -26 -17 -8 V4 L-25 16 H25 L17 4 V-8 Q16 -26 0 -26 Z M-8 21 Q0 31 8 21 Z" fill={CHALK} />
              </g>
              {onde > 0 && [0, 1].map((k) => (
                <path key={k} d={`M${-206 - k * 12} -20 Q${-214 - k * 12} -2 ${-206 - k * 12} 16 M${-152 + k * 10} -20 Q${-144 + k * 10} -2 ${-152 + k * 10} 16`} fill="none" stroke={CHALK} strokeWidth="4" strokeLinecap="round" opacity={(1 - onde) * 0.9} />
              ))}
              <text x="-96" y="13" fontFamily={SANS} fontWeight={900} fontSize="36" fill={CHALK}>{premuto ? 'Iscritto ✓' : 'Iscriviti al canale'}</text>
            </g>
          )}
          {/* barra di ricerca: «In 2 Minuti» si scrive mentre la voce lo dice */}
          {t >= eScr + 1.2 && (
            <g transform={`translate(120 ${BTN + 130})`} opacity={seg(t, eScr + 1.2, eScr + 1.5)}>
              <rect width="780" height="84" rx="42" fill={CHALK} />
              <circle cx="46" cy="40" r="16" fill="none" stroke="#0B0F0E" strokeWidth="6" />
              <path d="M58 52 L72 66" stroke="#0B0F0E" strokeWidth="7" strokeLinecap="round" />
              <text x="96" y="55" fontFamily={SANS} fontWeight={800} fontSize="40" fill="#0B0F0E">{testoCerca}{cerca < 1 && Math.sin(t * 12) > 0 ? '|' : ''}</text>
              <text x="756" y="55" textAnchor="end" fontFamily={SANS} fontWeight={800} fontSize="30" fill="#5B625E">su YouTube</text>
            </g>
          )}
          {comm > 0 && (
            <text x="140" y={BTN + 290} fontFamily={SANS} fontWeight={800} fontSize="44" fill={YELLOW} opacity={comm} transform={`translate(0 ${(1 - comm) * 14})`}>
              Commenta con la serie che vorresti.
            </text>
          )}
        </g>

        {/* primo piano: abeti scuri agli angoli e nebbia bassa; quando la camera scende si abbassano ma restano come bordo
            del fotogramma (una fila bassa di abeti e la nebbia sotto i sottotitoli), così la metà bassa non resta vuota */}
        <g transform={`translate(0 ${giu * 150})`}>
          <Fog id="pc-f2" t={t} y={1700} x={540} rx={900} ry={140} color="#4E645A" opacity={0.35} speed={0.2} ph={1} />
          <Pines t={t} y={1960} n={3} h={520} seed={57} color="#070B09" sway={3} x0={-200} x1={230} />
          <Pines t={t} y={1980} n={3} h={540} seed={61} color="#070B09" sway={3} x0={880} x1={1300} />
        </g>
        <g opacity={giu} transform={`translate(0 ${(1 - giu) * 200})`}>
          <Fog id="pc-f3" t={t} y={1640} x={540} rx={1000} ry={160} color="#4E645A" opacity={0.28} speed={0.18} ph={2} />
          <Pines t={t} y={1990} n={11} h={300} seed={83} color="#080C0A" sway={2} x0={-120} x1={1200} />
          <Glow id="pc-fg" x={540} y={1880} r={420} t={t} color="#FFD27A" amp={0.1} rate={2.4} opacity={0.12} />
        </g>
        <Rain t={t} level="far" seed={7} x={-200} w={W + 400} h={2400} opacity={0.24 - 0.12 * giu} />
        <Rain t={t} level="near" seed={9} x={-200} w={W + 400} h={2400} opacity={0.32 - 0.18 * giu} />
        {/* velo scuro in alto dietro la scritta della miniatura, che esce con lei */}
        <rect width={W} height="1000" fill="url(#pc-top)" opacity={1 - esce} />
        <Finish id="pc" tint={TINT} tintOpacity={0.08} />
      </svg>

      {/* scritta della miniatura: bollino, etichetta, DARK, sottotitolo, ideatori */}
      <div style={{ position: 'absolute', left: 120, top: 266, width: 840, opacity: 1 - esce, transform: `translateY(${-80 * esce}px)` }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '8px 20px 8px 14px', borderRadius: 999, background: RED, color: CHALK, fontFamily: SANS, fontWeight: 900, fontSize: 30, letterSpacing: '0.08em' }}>
          <span style={{ display: 'inline-block', width: 0, height: 0, borderTop: '11px solid transparent', borderBottom: '11px solid transparent', borderLeft: `18px solid ${CHALK}`, marginLeft: 6 }} />
          NUOVO SU YOUTUBE
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 28, letterSpacing: '0.2em', color: YELLOW, marginTop: 16 }}>SPIEGATO SEMPLICE · TUTTA LA SERIE</div>
        <div style={{ fontFamily: STENCIL, fontWeight: 800, fontSize: 300, lineHeight: 0.86, letterSpacing: '0.04em', color: '#EEF1EC', textShadow: '0 10px 0 #040605', marginTop: 8 }}>DARK</div>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 76, lineHeight: 1.0, color: '#EEF1EC', marginTop: 18, textShadow: '0 6px 0 #040605' }}>TUTTA LA SERIE</div>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 76, lineHeight: 1.0, color: YELLOW, marginTop: 4, textShadow: '0 6px 0 #040605' }}>E IL FINALE</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 28, color: CHALK, opacity: 0.85, marginTop: 14, textShadow: '0 3px 0 #040605' }}>la serie di Baran bo Odar e Jantje Friese</div>
      </div>
    </>
  );
};
