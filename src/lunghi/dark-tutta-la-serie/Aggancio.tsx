import React from 'react';
import { eio, eo, eob, lerp, mod, seg } from '../../lib/anim';
import { HAND, SANS, STENCIL } from '../../lib/fonts';
import { FxDefs, Lin } from '../../lib/fx';
import { Fog, Glow, Rain, Stars } from '../../lib/elements';
import { BRASS, Cards, K, Letter, Pines, RED, Raincoat, TINT, Tower, YELLOW, Yarn } from '../../scenes/dark-stagione-1/Winden';
import { Finish16, H, W } from '../fx16';
import type { ParteProps } from '../registro';

// Aggancio del video lungo (VIDEO-LUNGO.md): il fotogramma 0 è la miniatura YouTube completa.
// Miniatura: a sinistra «DARK» enorme e «TUTTA LA SERIE / E IL FINALE»; a destra un grande quadrante d'orologio sopra il
// bosco di Winden e le torri della centrale, con l'impermeabile giallo (Jonas) appeso al centro e un filo rosso che gli
// gira attorno e torna su sé stesso: un ragazzo antenato di sé stesso. Pioggia, lancette che girano all'indietro.
// Poi (dalla 2ª frase) la scritta esce a sinistra e la camera entra nel quadrante, dove la domanda si costruisce:
// la grotta e i 33 anni lungo il bordo, la famiglia annodata (lettera, carte, gomitolo), il quadrante che si divide in due
// mondi uguali, e il filo giallo che porta a «Winden, 2019» (l'inizio della stagione 1).
// Piani: cielo (0,2) · torri e bosco (0,45) · quadrante (0,7) · impermeabile e fili (0,7) · pioggia vicina (1,5)

const CHALK = '#E8E2D2';
const BLUE = '#5A9AE0';
const O = [1320, 500] as const; // centro del quadrante
const R = 345;
/** punto sul bordo del quadrante, angolo in gradi da ore 12 in senso orario */
const rim = (deg: number, r = R): [number, number] => [Math.sin((deg * Math.PI) / 180) * r, -Math.cos((deg * Math.PI) / 180) * r];
/** Giri di filo attorno all'impermeabile: ellissi inclinate (centro, raggi, rotazione in gradi). */
const ANELLI = [{ x: 0, y: -40, rx: 250, ry: 86, rot: -16 }, { x: 0, y: 70, rx: 220, ry: 74, rot: 20 }];
/** Metà di un anello: quella dietro (in alto) o quella davanti (in basso). */
const arco = (a: (typeof ANELLI)[number], dietro: boolean) => {
  const c = Math.cos((a.rot * Math.PI) / 180), s = Math.sin((a.rot * Math.PI) / 180);
  const p = (k: number) => [a.x + c * a.rx * k, a.y + s * a.rx * k];
  const [x1, y1] = p(-1), [x2, y2] = p(1);
  return `M${x1} ${y1} A${a.rx} ${a.ry} ${a.rot} 0 ${dietro ? 1 : 0} ${x2} ${y2}`;
};
/** Dove finisce davanti il primo anello (a destra): lì la punta di freccia. */
const punta = (() => {
  const a = ANELLI[0], c = Math.cos((a.rot * Math.PI) / 180), s = Math.sin((a.rot * Math.PI) / 180);
  return [a.x - c * a.rx + 2, a.y - s * a.rx] as const;
})();
/** La famiglia (fuori dal quadrante a destra) e il punto dell'impermeabile a cui arriva il filo di ognuno. */
const FAMIGLIA = [
  { nome: 'padre', x: 470, y: -200, ax: 70, ay: -120 },
  { nome: 'bambino', x: 505, y: 30, ax: 90, ay: 10 },
  { nome: 'ragazza', x: 470, y: 260, ax: 70, ay: 130 },
];
const pop = (t: number, t0: number) => eob(seg(t, t0, t0 + 0.45), 1.7);

/** Cerchio-personaggio piccolo (stesso vocabolario degli schemi). */
const Nodo: React.FC<{ t: number; t0: number; x: number; y: number; r?: number; nome: string; ring?: string; children: React.ReactNode }> = ({ t, t0, x, y, r = 44, nome, ring = CHALK, children }) => {
  if (t < t0) return null;
  return (
    <g transform={`translate(${x} ${y})`} opacity={seg(t, t0, t0 + 0.15)}>
      <g transform={`scale(${pop(t, t0)})`}>
        <circle r={r + 5} fill="#000" opacity=".35" transform="translate(3 5)" />
        <circle r={r} fill="#22302B" stroke={ring} strokeWidth="4" />
        <clipPath id={`ag-c${x}${y}`}><circle r={r - 4} /></clipPath>
        <g clipPath={`url(#ag-c${x}${y})`}>{children}</g>
      </g>
      <text y={r + 30} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="24" fill={CHALK} stroke="#0C110F" strokeWidth="6" paintOrder="stroke" opacity={seg(t, t0 + 0.2, t0 + 0.5)}>{nome}</text>
    </g>
  );
};

export const Aggancio: React.FC<ParteProps> = ({ t, dur, cues }) => {
  // ---- tempi: la miniatura resta intera fino alla 2ª frase, poi la camera entra nel quadrante
  const esce = eio(seg(t, cues[1] - 0.3, cues[1] + 0.9)); // la scritta esce, la camera si avvicina
  const grotta = cues[2] + 0.2;
  const famiglia = cues[3] + 0.1;
  const mondi = eio(seg(t, cues[4] + 0.1, cues[4] + 1.1));
  const filo = eo(seg(t, cues[5] + 0.4, cues[5] + 2.2));
  const buio = seg(t, dur - 0.9, dur); // dissolvenza verso il cartello della stagione 1

  // camera: da tutta la miniatura (z 1) al quadrante (z 1.18, centrato sotto il titolo vuoto)
  // (il quadrante resta intero: in orizzontale grotta e famiglia stanno ai suoi lati, fuori dal bordo)
  const z = lerp(1, 1.03, esce) + 0.006 * t;
  const cx = lerp(W / 2, O[0], esce) + Math.sin(t * 0.3) * 6;
  const cy = lerp(H / 2, O[1] + 40, esce);
  const cam = `translate(${W / 2} ${H / 2 - 5}) scale(${z}) translate(${-cx} ${-cy})`;
  const L = (f: number) => `translate(${((cx - W / 2) * (1 - f)).toFixed(1)} ${((cy - H / 2) * (1 - f) * 0.4).toFixed(1)})`;

  // lancette che girano all'indietro (il tempo che torna), più veloci quando la voce dice «tutto torna»
  const back = -(t * 40 + 260 * eio(seg(t, cues[1] + 0.3, cues[1] + 2.2)));
  // anello rosso attorno all'impermeabile: già chiuso nella miniatura, una scintilla lo percorre
  const sc = mod(t * 0.45, 1);

  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <FxDefs id="ag" />
          <Lin id="ag-sky" stops={[[0, '#05080A'], [0.5, '#122019'], [0.78, '#24352E'], [1, '#121B17']]} />
          <Lin id="ag-tower" x2={1} y2={0} stops={[[0, '#5E6A64'], [1, '#2A3430']]} />
          <radialGradient id="ag-face" cx=".45" cy=".4" r=".7">
            <stop offset="0" stopColor="#2A3A33" />
            <stop offset=".7" stopColor="#18221E" />
            <stop offset="1" stopColor="#0E1512" />
          </radialGradient>
          <linearGradient id="ag-brass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F0D592" />
            <stop offset=".45" stopColor={BRASS} />
            <stop offset="1" stopColor="#6E5526" />
          </linearGradient>
          <clipPath id="ag-dial"><circle r={R - 26} /></clipPath>
          <radialGradient id="ag-left" cx="0" cy=".5" r="1.1">
            <stop offset="0" stopColor="#060908" stopOpacity=".9" />
            <stop offset=".55" stopColor="#060908" stopOpacity=".55" />
            <stop offset="1" stopColor="#060908" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g transform={cam}>
          {/* cielo e stelle */}
          <g transform={L(0.2)}>
            <rect x="-300" y="-200" width={W + 600} height={H + 400} fill="url(#ag-sky)" />
            <Stars t={t} seed={19} n={46} x={-100} y={-60} w={W + 200} h={560} color="#DDE6E0" size={0.8} />
          </g>
          {/* torri della centrale e bosco di Winden: le torri a destra del quadrante, più alte del bosco */}
          <g transform={L(0.45)} opacity={1 - 0.55 * esce}>
            <g transform="translate(1790 900)"><Tower id="ag-t1" t={t} w={250} h={470} fill="url(#ag-tower)" outline={K} sw={6} steamOpacity={0.5} /></g>
            <g transform="translate(1585 915)"><Tower id="ag-t2" t={t + 2} w={170} h={330} fill="url(#ag-tower)" outline={K} sw={5} steamOpacity={0.4} /></g>
            <circle cx="1790" cy="436" r="8" fill="#FF5A4A" opacity={Math.sin(t * 3) > 0 ? 1 : 0.3} />
            <Pines t={t} y={960} n={30} h={210} seed={23} color="#0E1613" sway={2} x0={-300} x1={W + 300} />
            <Fog id="ag-f1" t={t} y={940} x={1100} rx={1300} ry={90} color="#5E746A" opacity={0.3} speed={0.25} />
          </g>
          {/* il quadrante */}
          <g transform={`${L(0.7)} translate(${O[0]} ${O[1]})`}>
            <Glow id="ag-qg" x={0} y={0} r={R * 1.5} t={t} color="#8FB8A0" amp={0.05} rate={1.4} opacity={0.18} />
            <circle r={R + 10} fill="#000" opacity=".4" transform="translate(8 14)" />
            <circle r={R} fill="url(#ag-brass)" stroke={K} strokeWidth="10" />
            <circle r={R - 26} fill="url(#ag-face)" stroke={K} strokeWidth="6" />
            <g clipPath="url(#ag-dial)">
              {/* metà destra: l'altro mondo, blu, che si apre allo specchio */}
              <rect x={0} y={-R} width={R} height={2 * R} fill={BLUE} opacity={0.22 * mondi} />
              <g opacity={0.5 * mondi} transform="scale(-1 1)">
                <g transform="translate(0 -150)"><Raincoat id="ag-rcb" t={t + 1} scale={0.5} wind={0.6} wet={false} /></g>
              </g>
              <rect x={0} y={-R} width={R} height={2 * R} fill="#0E1512" opacity={0.45 * mondi} />
            </g>
            {Array.from({ length: 60 }, (_, i) => (
              <path key={i} d={`M0 ${-(R - 34)} V${-(R - (i % 5 ? 46 : 70))}`} stroke={CHALK} strokeWidth={i % 5 ? 3 : 8} opacity=".75" transform={`rotate(${i * 6})`} />
            ))}
            {/* lancette all'indietro */}
            <path d="M0 26 V-190" stroke={CHALK} strokeWidth="12" strokeLinecap="round" opacity=".85" transform={`rotate(${back / 12 + 300})`} />
            <path d="M0 30 V-262" stroke={CHALK} strokeWidth="6" strokeLinecap="round" opacity=".85" transform={`rotate(${back})`} />
            {/* la crepa dei due mondi */}
            {mondi > 0 && (
              <path d={`M0 ${-R + 4} L-8 -200 L10 -120 L-6 -30 L8 60 L-10 150 L6 230 L0 ${R - 4}`} fill="none" stroke="#F4FBFF" strokeWidth="5" strokeLinejoin="round"
                pathLength={1} strokeDasharray={`${mondi} 1`} />
            )}
            <circle r="18" fill={CHALK} stroke={K} strokeWidth="5" />
            <path d="M-200 -170 Q-120 -260 -10 -280" fill="none" stroke="#FFFFFF" strokeWidth="9" opacity=".18" strokeLinecap="round" />
            {/* corona e anello in cima, come un orologio da taschino */}
            <rect x="-34" y={-R - 52} width="68" height="44" rx="10" fill="url(#ag-brass)" stroke={K} strokeWidth="8" />
            <circle cy={-R - 92} r="34" fill="none" stroke={BRASS} strokeWidth="14" />
            <circle cy={-R - 92} r="34" fill="none" stroke={K} strokeWidth="4" opacity=".6" />

            {/* la grotta e i 33 anni, fuori dal bordo a sinistra: un filo giallo tratteggiato che risale all'indietro */}
            {t >= grotta && (
              <g>
                <path d="M-500 150 C-470 40 -470 -90 -410 -190" fill="none" stroke={YELLOW} strokeWidth="9" strokeLinecap="round"
                  strokeDasharray="20 14" strokeDashoffset={t * 40} opacity={eo(seg(t, grotta + 0.2, grotta + 0.8))} />
                <g transform="translate(-410 -190) rotate(-58)" opacity={seg(t, grotta + 0.7, grotta + 0.9)}>
                  <path d="M-20 -16 L4 0 L-20 16" fill="none" stroke={YELLOW} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
                </g>
                <g transform={`translate(-540 210) scale(${1.5 * pop(t, grotta)})`}>
                  <Glow id="ag-gg" x={0} y={8} r={60} t={t} color="#FFD27A" amp={0.15} rate={3} opacity={0.6} />
                  <path d="M-46 26 Q-40 -26 0 -32 Q40 -26 46 26 Z" fill="#3A443E" stroke={CHALK} strokeWidth="4" />
                  <path d="M-16 26 Q-16 -4 0 -8 Q16 -4 16 26 Z" fill="#0A0C0B" />
                  <ellipse cx="0" cy="14" rx="11" ry="13" fill="#FFD99A" opacity={0.7 + 0.3 * Math.sin(t * 3)} />
                </g>
                <text x="-540" y="300" textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize="40" fill={YELLOW} opacity={seg(t, grotta + 0.3, grotta + 0.6)}>la grotta</text>
                <g transform={`translate(-610 -40) rotate(-6) scale(${pop(t, grotta + 0.5)})`}>
                  <rect x="-96" y="-30" width="192" height="52" rx="12" fill={YELLOW} />
                  <text y="9" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="32" fill="#0B0F0E">−33 anni</text>
                </g>
              </g>
            )}
          </g>

          {/* l'impermeabile al centro, appeso al perno del quadrante, e due giri di filo rosso che lo annodano:
              la metà alta dei giri passa dietro, la metà bassa davanti (il filo lo stringe davvero) */}
          <g transform={`${L(0.72)} translate(${O[0]} ${O[1]})`}>
            <Glow id="ag-cg" x={0} y={-10} r={280} t={t} color={YELLOW} amp={0.08} rate={2.2} opacity={0.38} />
            {ANELLI.map((a, i) => <path key={`b${i}`} d={arco(a, true)} fill="none" stroke="#7A2A24" strokeWidth="12" strokeLinecap="round" />)}
            <g transform="translate(0 -190)"><Raincoat id="ag-rc" t={t} scale={0.8} wind={0.7} /></g>
            {ANELLI.map((a, i) => (
              <g key={`f${i}`}>
                <path d={arco(a, false)} fill="none" stroke={K} strokeWidth="20" strokeLinecap="round" opacity=".55" />
                <path d={arco(a, false)} fill="none" stroke="#D9483A" strokeWidth="13" strokeLinecap="round" />
                <path d={arco(a, false)} fill="none" stroke="#FFB4A4" strokeWidth="4" strokeLinecap="round" pathLength={1} strokeDasharray="0.12 0.88" strokeDashoffset={-mod(sc + i * 0.5, 1)} opacity=".85" />
              </g>
            ))}
            {/* punta di freccia: il filo torna al punto da cui è partito */}
            <g transform={`translate(${punta[0]} ${punta[1]}) rotate(${ANELLI[0].rot - 8})`}>
              <path d="M-22 -18 L4 0 L-22 18" fill="none" stroke={K} strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" opacity=".55" />
              <path d="M-22 -18 L4 0 L-22 18" fill="none" stroke="#D9483A" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </g>

          {/* la famiglia che si annoda, fuori dal bordo a destra: padre, bambino, ragazza; fili rossi fino all'impermeabile */}
          <g transform={`${L(0.72)} translate(${O[0]} ${O[1]})`} opacity={1 - 0.45 * mondi}>
            {FAMIGLIA.map((f, i) => {
              const t0 = famiglia + i * 0.3;
              return t >= t0 ? (
                <path key={f.nome} d={`M${f.x - 50} ${f.y} C${f.x - 160} ${f.y} ${f.ax + 120} ${f.ay} ${f.ax} ${f.ay}`} fill="none" stroke="#D9483A" strokeWidth="6"
                  pathLength={1} strokeDasharray={`${eo(seg(t, t0 + 0.3, t0 + 0.9))} 1`} />
              ) : null;
            })}
            {t >= famiglia + 1.2 && (
              <path d="M490 -150 C580 -100 600 -20 545 20 C600 90 580 200 490 220" fill="none" stroke="#D9483A" strokeWidth="5" strokeDasharray="10 9" opacity={seg(t, famiglia + 1.2, famiglia + 1.6)} />
            )}
            <Nodo t={t} t0={famiglia} x={470} y={-200} r={52} nome="il padre"><Letter scale={0.24} /></Nodo>
            <Nodo t={t} t0={famiglia + 0.3} x={505} y={30} r={52} nome="il bambino"><Cards fan={0.4} scale={0.38} /></Nodo>
            <Nodo t={t} t0={famiglia + 0.6} x={470} y={260} r={52} nome="la ragazza"><Yarn r={28} /></Nodo>
          </g>

          {/* «Winden, 2019»: il filo giallo esce dal quadrante in basso a sinistra, dove comincia la storia */}
          {filo > 0 && (
            <g transform={`${L(0.72)} translate(${O[0]} ${O[1]})`}>
              <path d="M-40 175 C-70 280 -120 340 -170 352" fill="none" stroke={YELLOW} strokeWidth="9"
                strokeDasharray="20 14" strokeDashoffset={-t * 40} strokeLinecap="round" opacity={filo} />
              <g transform={`translate(-300 352) rotate(-3) scale(${pop(t, cues[5] + 1.6)})`} opacity={seg(t, cues[5] + 1.6, cues[5] + 1.8)}>
                <rect x="-140" y="-38" width="280" height="64" rx="12" fill={CHALK} />
                <text y="10" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="36" fill="#0B0F0E">Winden, 2019</text>
              </g>
            </g>
          )}
          {/* «due mondi»: scritte a mano sopra le due metà */}
          {mondi > 0 && (
            <g transform={`${L(0.72)} translate(${O[0]} ${O[1]})`} opacity={mondi}>
              <text x={-170} y={-R + 120} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize="40" fill={CHALK} transform="rotate(-8 -170 -210)">un mondo</text>
              <text x={170} y={-R + 120} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize="40" fill="#9CC6F2" transform="rotate(8 170 -210)">l'altro</text>
            </g>
          )}
        </g>

        {/* primo piano: abeti scuri che incorniciano gli angoli in basso, nebbia bassa */}
        <g transform={`translate(${-(cx - W / 2) * 0.3} 0)`}>
          <Fog id="ag-f2" t={t} y={1050} x={960} rx={1400} ry={120} color="#4E645A" opacity={0.35} speed={0.2} ph={1} />
          <Pines t={t} y={1130} n={5} h={420} seed={57} color="#070B09" sway={3} x0={-260} x1={420} />
          <Pines t={t} y={1140} n={3} h={440} seed={61} color="#070B09" sway={3} x0={1900} x1={2200} />
        </g>
        <Rain t={t} level="far" seed={7} x={-200} w={W + 400} h={H + 600} opacity={0.22} />
        <Rain t={t} level="near" seed={9} x={-200} w={W + 400} h={H + 600} opacity={0.32} />
        {/* velo scuro a sinistra dietro la scritta, che esce con lei */}
        <rect width={1100} height={H} fill="url(#ag-left)" opacity={1 - esce} />
        <Finish16 id="ag" tint={TINT} tintOpacity={0.08} />
        <rect width={W} height={H} fill="#000" opacity={buio} />
      </svg>

      {/* scritta della miniatura: etichetta, DARK, sottotitolo; esce a sinistra quando la camera entra nel quadrante */}
      <div style={{ position: 'absolute', left: 96, top: 150, opacity: 1 - esce, transform: `translateX(${-120 * esce}px)` }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 32, letterSpacing: '0.24em', color: YELLOW, marginLeft: 8 }}>SPIEGATO SEMPLICE</div>
        <div style={{ fontFamily: STENCIL, fontWeight: 800, fontSize: 380, lineHeight: 0.86, letterSpacing: '0.04em', color: '#EEF1EC', textShadow: '0 10px 0 #040605', marginTop: 6 }}>DARK</div>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 84, lineHeight: 1.0, color: '#EEF1EC', marginTop: 26, textShadow: '0 6px 0 #040605' }}>TUTTA LA SERIE</div>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 84, lineHeight: 1.0, color: YELLOW, marginTop: 6, textShadow: '0 6px 0 #040605' }}>E IL FINALE</div>
      </div>
    </>
  );
};
