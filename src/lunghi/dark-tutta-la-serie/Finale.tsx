import React from 'react';
import { eio, eo, lerp, mod, rng, seg } from '../../lib/anim';
import { HAND, SANS, STENCIL } from '../../lib/fonts';
import { FxDefs } from '../../lib/fx';
import { Glow } from '../../lib/elements';
import { subtitleTimes } from '../../components/ChapterOverlay';
import { Letter, PocketWatch, RED, Raincoat, TINT, YELLOW, Yarn } from '../../scenes/dark-stagione-1/Winden';
import { BlueYarn, Bootie, Bridge, Car, Cradle, Dust, Gear, Hourglass, House, Lantern, Link, Node, Tag } from '../../scenes/dark-stagione-3/Mondi';
import lungo from '../../../lunghi/dark-tutta-la-serie.json';
import { Finish16, H, Motes16, TopShade, W } from '../fx16';
import type { ParteProps } from '../registro';

// «Il finale spiegato» e la chiusura: lo schema completo delle tre stagioni in un'unica immagine, orizzontale.
// A sinistra il tronco del mondo d'origine (Tannhaus, l'auto e il ponte del 1971); dove il tronco si divide, la macchina
// del tempo (un ingranaggio che incrina il mondo come un vetro); a destra i due rami: in alto il mondo di Jonas (gesso),
// in basso quello di Martha (blu), ognuno con il suo cerchio del tempo (la grotta, gli anni ogni 33). Più a destra il nodo:
// Jonas e Martha, il loro bambino in mezzo, che va nel passato e diventa l'antenato di tutti e due; in fondo Adam ed Eva
// che tirano il nodo dai due capi. Poi Jonas e Martha tornano lungo il tronco e fermano l'auto prima del ponte: la macchina
// si spegne, i rami si sciolgono in polvere e il tronco prosegue dritto fino alla casa accesa (Hannah, «Jonas?»).
// Vocabolario degli schemi di Dark: cerchio con oggetto = personaggio, linea = legame, tratteggio giallo = viaggio nel tempo,
// cartellino pieno = colpo di scena, anello rosso = il nodo da capire. Coordinate dello schema = schermo 16:9 a z = 1.

const CHALK = '#E8E2D2';
const BLUE = '#5A9AE0';
const WARM = '#F2D9A0';
type P = readonly [number, number];

const Y0 = 540; // il tronco
const F: P = [640, Y0]; // la macchina: qui il mondo si divide
const YJ = 320, YM = 760; // i due rami (Jonas in alto, Martha in basso)
const N = {
  tannhaus: [300, 400], auto: [330, 700], ponte: [420, 700], adam: [1760, 230], eva: [1760, 840],
  cerchioJ: [1060, YJ], cerchioM: [1060, YM], padre: [1200, 205], marthaJ: [1200, 440],
  jonas: [1430, YJ], martha: [1430, YM], bambino: [1580, Y0], casa: [1560, 505], hannah: [1300, 660],
} as const satisfies Record<string, P>;
const RAMO_J = `M${F[0]} ${F[1]} C${F[0] + 90} ${F[1]} ${F[0] + 110} ${YJ} ${F[0] + 210} ${YJ} L1850 ${YJ}`;
const RAMO_M = `M${F[0]} ${F[1]} C${F[0] + 90} ${F[1]} ${F[0] + 110} ${YM} ${F[0] + 210} ${YM} L1850 ${YM}`;
// il nodo: due anelli attorno a Jonas e a Martha che si incrociano sul bambino
const NODO = (k: number) => {
  const [bx, by] = N.bambino;
  const s = (x: number, y: number) => `${bx + (x - bx) * k} ${by + (y - by) * k}`;
  return `M${s(bx, by)} C${s(bx + 150, by - 120)} ${s(1560, YJ - 140)} ${s(1420, YJ - 120)} C${s(1270, YJ - 100)} ${s(1280, YJ + 110)} ${s(bx, by)}`
    + ` C${s(bx + 150, by + 120)} ${s(1560, YM + 140)} ${s(1420, YM + 120)} C${s(1270, YM + 100)} ${s(1280, YM - 110)} ${s(bx, by)}`;
};

// ---------------------------------------------------------------- tempi dal JSON, sulla griglia della musica (66 bpm)

const parte = lungo.parti.find((p) => p.tipo === 'capitoli')! as unknown as { capitoli: { id: string; durata: number; sottotitoli: string[] }[] };
const chiusura = lungo.parti.find((p) => p.tipo === 'chiusura')! as unknown as { durata: number };
const CROMA = 60 / lungo.bpm / 2;
const snap = (T: number) => Math.round(T / CROMA) * CROMA; // la parte inizia su un battito (VIDEO-LUNGO.md)
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
/** Istante (s dall'inizio del finale spiegato) della frase `cue` del capitolo `ch`, più `d`, arrotondato alla croma. */
export const at = (ch: string, cue: number, d = 0) => snap(STARTS[ch] + CUES[ch][cue] + d);
const FINE_CAPITOLI = STARTS.chiusura;
export const DURATA_TUTTO = FINE_CAPITOLI + chiusura.durata;

// ---------------------------------------------------------------- camera

type Shot = { at: number; x: number; y: number; z: number };
const SHOTS: Shot[] = [
  { at: 0, x: 430, y: 560, z: 1.3 },
  { at: at('vetro', 2), x: 560, y: 540, z: 1.15 },
  { at: at('vetro', 3), x: 900, y: 540, z: 0.84 },
  { at: at('cerchi', 1), x: 1040, y: 540, z: 0.98 },
  { at: at('cerchi', 3), x: 1120, y: 360, z: 1.2 },
  { at: at('antenato', 0), x: 1400, y: 540, z: 1.0 },
  { at: at('antenato', 2), x: 1340, y: 540, z: 0.92 },
  { at: at('nemici', 0), x: 1440, y: 535, z: 0.9 },
  { at: at('ponte', 0), x: 520, y: 580, z: 1.12 },
  { at: at('ponte', 3), x: 760, y: 560, z: 0.88 },
  { at: at('resta', 0), x: 960, y: 540, z: 0.8 },
  { at: at('resta', 2), x: 1260, y: 560, z: 1.0 },
  { at: at('resta', 3, 1.2), x: 1000, y: 560, z: 0.84 },
  // chiusura: lo schema rimasto si sposta nella metà sinistra (la destra resta libera per la schermata finale di YouTube)
  { at: FINE_CAPITOLI + 0.4, x: 1690, y: 920, z: 0.54 },
];
const camAt = (T: number) => {
  let o = { x: SHOTS[0].x, y: SHOTS[0].y, z: SHOTS[0].z };
  for (const s of SHOTS.slice(1)) {
    const p = eio(seg(T, s.at - 0.2, s.at + 1.2));
    o = { x: lerp(o.x, s.x, p), y: lerp(o.y, s.y, p), z: lerp(o.z, s.z, p) };
  }
  return { x: o.x + Math.sin(T * 0.3) * 6, y: o.y + Math.cos(T * 0.25) * 4, z: o.z };
};

// ---------------------------------------------------------------- pezzi dello schema

/** Cerchio del tempo di un mondo: anello tratteggiato con gli anni ogni 33, una lancetta che gira, la grotta al centro. */
const Cerchio: React.FC<{ T: number; t0: number; p: P; color: string; fade: number; anni: boolean }> = ({ T, t0, p, color, fade, anni }) => {
  if (T < t0 || fade <= 0.001) return null;
  const k = eo(seg(T, t0, t0 + 0.8));
  const R = 92;
  return (
    <g transform={`translate(${p[0]} ${p[1]})`} opacity={fade}>
      <circle r={R + 30} fill="#0C110F" opacity=".75" />
      <circle r={R} fill="none" stroke={color} strokeWidth="7" strokeDasharray="18 12" strokeDashoffset={-T * 30} pathLength={undefined} opacity={k} />
      {k > 0.95 && <path d={`M0 ${-R} l-16 -12 M0 ${-R} l-16 12`} stroke={color} strokeWidth="7" strokeLinecap="round" transform={`rotate(${mod(T * 40, 360)})`} />}
      <path d={`M0 0 V${-R + 16}`} stroke={color} strokeWidth="5" strokeLinecap="round" opacity={k} transform={`rotate(${T * 90})`} />
      <g transform={`scale(${0.8 * k})`}>
        <path d="M-40 22 Q-34 -22 0 -28 Q34 -22 40 22 Z" fill="#3A443E" stroke={CHALK} strokeWidth="3" />
        <path d="M-14 22 Q-14 -2 0 -6 Q14 -2 14 22 Z" fill="#0A0C0B" />
        <ellipse cx="0" cy="12" rx="9" ry="11" fill="#FFD99A" opacity={0.7 + 0.3 * Math.sin(T * 3)} />
      </g>
      {anni && ['1953', '1986', '2019', '2052'].map((a, i) => {
        const ang = (i * Math.PI) / 2 - Math.PI / 4;
        return (
          <text key={a} x={Math.cos(ang) * (R + 34)} y={Math.sin(ang) * (R + 34) + 8} textAnchor="middle" fontFamily={STENCIL} fontWeight={800} fontSize="24" fill="#9AAAA2"
            opacity={seg(T, t0 + 0.5 + i * 0.15, t0 + 0.8 + i * 0.15)}>{a}</text>
        );
      })}
    </g>
  );
};

/** Crepa nel fondo, come un vetro rotto, attorno alla macchina. */
const r0 = rng(1971);
const CREPE = Array.from({ length: 11 }, (_, i) => {
  const a = (i / 11) * Math.PI * 2 + r0() * 0.4;
  let x = 0, y = 0, d = 'M0 0';
  const n = 4 + Math.floor(r0() * 3);
  for (let k = 0; k < n; k++) {
    const l = 50 + r0() * 90;
    x += Math.cos(a + (r0() - 0.5) * 0.7) * l;
    y += Math.sin(a + (r0() - 0.5) * 0.7) * l * 0.8;
    d += ` L${x.toFixed(0)} ${y.toFixed(0)}`;
  }
  return d;
});

const X: React.FC<{ T: number; t0: number; x: number; y: number; s?: number; fade?: number }> = ({ T, t0, x, y, s = 1, fade = 1 }) =>
  T < t0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s * eo(seg(T, t0, t0 + 0.3))})`} opacity={fade}>
      <path d="M-30 -30 L30 30 M30 -30 L-30 30" stroke="#0C110F" strokeWidth="18" strokeLinecap="round" />
      <path d="M-30 -30 L30 30 M30 -30 L-30 30" stroke={RED} strokeWidth="11" strokeLinecap="round" />
    </g>
  );

const Schema: React.FC<{ T: number }> = ({ T }) => {
  // ---- stati principali
  const divide = eo(seg(T, at('vetro', 3, 0.2), at('vetro', 3, 1.4))); // la macchina spacca il mondo: i rami crescono
  const macchina = seg(T, at('vetro', 2), at('vetro', 2, 0.4)); // la macchina si accende
  const spenta = seg(T, at('ponte', 3), at('ponte', 3, 0.5)); // niente incidente: la macchina non nasce
  const crepa = seg(T, at('vetro', 3, 0.1), at('vetro', 3, 0.5)) * (1 - seg(T, at('ponte', 3, 0.3), at('ponte', 3, 1.4)));
  const svanisce = seg(T, at('resta', 0, 0.2), at('resta', 0, 2.2)); // i due mondi e chi è nato dal nodo
  const via = 1 - svanisce;
  const stretto = eio(seg(T, at('nemici', 2), at('nemici', 2, 1.6))); // Adam ed Eva stringono il nodo
  const vivo = eo(seg(T, at('resta', 1), at('resta', 1, 1.4))); // il tronco va avanti fino alla casa
  // l'auto: arriva al ponte nel 1971 (cade), poi nel finale si ferma prima del ponte
  const corsa = eo(seg(T, at('vetro', 1), at('vetro', 1, 1.2)));
  const frena = eo(seg(T, at('ponte', 2, 0.2), at('ponte', 2, 1.0)));
  const autoX = T < at('ponte', 0) ? lerp(N.auto[0] - 140, N.ponte[0] + 40, corsa) : lerp(N.auto[0] - 200, N.auto[0], frena);
  const incidente = T >= at('vetro', 1, 1.1) && T < at('ponte', 0);
  const focus = (t0: number, t1: number) => seg(T, t0, t0 + 0.3) * (1 - seg(T, t1, t1 + 0.4));
  const off = (t1: number) => 1 - seg(T, t1 - 0.4, t1 + 0.3);
  const endCh = (ch: string) => STARTS[ch] + parte.capitoli.find((c) => c.id === ch)!.durata;

  return (
    <g>
      {/* crepa a vetro rotto attorno alla macchina */}
      {crepa > 0 && (
        <g transform={`translate(${F[0]} ${F[1]})`} opacity={0.55 * crepa}>
          {CREPE.map((d, i) => <path key={i} d={d} fill="none" stroke="#DDEFF4" strokeWidth={i % 3 ? 2 : 4} strokeLinejoin="round" pathLength={1} strokeDasharray={`${eo(seg(T, at('vetro', 3, 0.05 * i), at('vetro', 3, 0.5 + 0.05 * i)))} 1`} />)}
        </g>
      )}

      {/* il tronco: il mondo d'origine */}
      <path d={`M100 ${Y0} H${F[0]}`} stroke={WARM} strokeWidth="10" strokeLinecap="round" opacity={eo(seg(T, 0, 0.8))} />
      {vivo > 0 && <path d={`M${F[0]} ${Y0} H${lerp(F[0], N.casa[0] - 120, vivo)}`} stroke={WARM} strokeWidth="10" strokeLinecap="round" />}
      <text x="110" y={Y0 - 22} fontFamily={STENCIL} fontWeight={800} fontSize="30" letterSpacing="3" fill={WARM} opacity={seg(T, 0.3, 0.8)}>MONDO D'ORIGINE</text>

      {/* i due rami: il mondo di Jonas (gesso) e quello di Martha (blu) */}
      {divide > 0 && (
        <g opacity={via}>
          <path d={RAMO_J} fill="none" stroke={CHALK} strokeWidth="9" strokeLinecap="round" pathLength={1} strokeDasharray={`${divide} 1`} />
          <path d={RAMO_M} fill="none" stroke={BLUE} strokeWidth="9" strokeLinecap="round" pathLength={1} strokeDasharray={`${divide} 1`} />
          <text x={F[0] + 40} y={YJ - 30} fontFamily={STENCIL} fontWeight={800} fontSize="28" letterSpacing="3" fill={CHALK} opacity={seg(T, at('cerchi', 0), at('cerchi', 0, 0.5))}>MONDO DI JONAS</text>
          <text x={F[0] + 40} y={YM + 50} fontFamily={STENCIL} fontWeight={800} fontSize="28" letterSpacing="3" fill={BLUE} opacity={seg(T, at('cerchi', 0, 0.6), at('cerchi', 0, 1.1))}>MONDO DI MARTHA</text>
        </g>
      )}
      <Tag T={T} t0={at('vetro', 3, 0.9)} x={F[0] + 40} y={Y0 - 92} text="due mondi" size={30} rot={-3} until={endCh('vetro') - 0.3} />

      {/* i cerchi del tempo dei due mondi */}
      <Cerchio T={T} t0={at('cerchi', 1, 0.1)} p={N.cerchioJ} color={YELLOW} fade={via} anni />
      <Cerchio T={T} t0={at('cerchi', 1, 0.5)} p={N.cerchioM} color={BLUE} fade={via} anni />
      <Tag T={T} t0={at('cerchi', 2, 0.2)} x={N.cerchioJ[0]} y={Y0 + 4} text="ogni 33 anni, di nuovo" bg={CHALK} size={26} rot={-2} until={endCh('cerchi') - 0.3} />

      {/* Jonas non salva il padre né Martha del suo mondo */}
      <Link T={T} t0={at('cerchi', 3, 0.3)} a={[N.cerchioJ[0] + 80, N.cerchioJ[1] - 50]} b={[N.padre[0] - 46, N.padre[1] + 10]} c={[1110, 220]} color={CHALK} w={4} fade={off(endCh('cerchi'))} />
      <Link T={T} t0={at('cerchi', 3, 0.5)} a={[N.cerchioJ[0] + 80, N.cerchioJ[1] + 50]} b={[N.marthaJ[0] - 46, N.marthaJ[1] - 10]} c={[1110, 440]} color={CHALK} w={4} fade={off(endCh('cerchi'))} />
      <Node T={T} t0={at('cerchi', 3, 0.1)} p={N.padre} name="il padre" side="right" r={42} fade={off(endCh('cerchi'))}><Letter scale={0.2} /></Node>
      <Node T={T} t0={at('cerchi', 3, 0.3)} p={N.marthaJ} name="Martha" sub="del suo mondo" side="right" r={42} fade={off(endCh('cerchi'))}><Yarn r={24} /></Node>
      <X T={T} t0={at('cerchi', 3, 1.0)} x={N.padre[0] + 34} y={N.padre[1] - 30} s={0.55} fade={off(endCh('cerchi'))} />
      <X T={T} t0={at('cerchi', 3, 1.2)} x={N.marthaJ[0] + 34} y={N.marthaJ[1] - 30} s={0.55} fade={off(endCh('cerchi'))} />

      {/* il nodo: Jonas, Martha e il loro bambino */}
      {T >= at('antenato', 0, 0.2) && (
        <g opacity={via}>
          <path d={NODO(lerp(1, 0.84, stretto))} fill={YELLOW} fillOpacity={0.05} stroke={YELLOW} strokeWidth={lerp(6, 9, stretto)} strokeDasharray="18 12" strokeDashoffset={-T * 36}
            pathLength={undefined} opacity={eo(seg(T, at('antenato', 0, 0.2), at('antenato', 0, 1.2)))} />
        </g>
      )}
      <Link T={T} t0={at('antenato', 1, 0.3)} a={[N.jonas[0] + 40, N.jonas[1] + 40]} b={[N.bambino[0] - 30, N.bambino[1] - 40]} color="#E07060" w={5} fade={via} />
      <Link T={T} t0={at('antenato', 1, 0.5)} a={[N.martha[0] + 40, N.martha[1] - 40]} b={[N.bambino[0] - 30, N.bambino[1] + 40]} color="#E07060" w={5} fade={via} />
      {/* il bambino va nel passato (tratteggio giallo verso i cerchi) e diventa l'antenato dei suoi genitori (anello rosso) */}
      <Link T={T} t0={at('antenato', 2, 0.1)} a={[N.bambino[0] - 50, N.bambino[1]]} b={[N.cerchioJ[0] + 100, N.cerchioJ[1] + 40]} c={[1260, Y0 - 10]} color={YELLOW} dashed flow w={7} arrow
        label="nel passato" lx={10} ly={60} size={32} fade={via * off(endCh('antenato'))} />
      <Link T={T} t0={at('antenato', 2, 0.3)} a={[N.bambino[0] - 50, N.bambino[1] + 10]} b={[N.cerchioM[0] + 100, N.cerchioM[1] - 40]} c={[1260, Y0 + 30]} color={YELLOW} dashed flow w={7} arrow fade={via * off(endCh('antenato'))} />
      <Link T={T} t0={at('antenato', 3, 0.1)} a={[N.cerchioJ[0] + 60, N.cerchioJ[1] - 80]} b={[N.jonas[0] - 40, N.jonas[1] - 48]} c={[1240, 140]} color={RED} w={9} arrow label="antenato" ly={-16} size={34} fade={via * off(endCh('antenato'))} />
      <Link T={T} t0={at('antenato', 3, 0.4)} a={[N.cerchioM[0] + 60, N.cerchioM[1] + 80]} b={[N.martha[0] - 40, N.martha[1] + 48]} c={[1240, 940]} color={RED} w={9} arrow fade={via * off(endCh('antenato'))} />
      <Tag T={T} t0={at('antenato', 3, 1.2)} x={N.bambino[0] + 30} y={Y0 + 110} text="antenato di sé stesso" bg={RED} fg="#FFFFFF" size={28} rot={-3} until={endCh('antenato') - 0.3} />

      {/* Adam ed Eva: da vecchi, tirano il nodo dai due capi */}
      <Link T={T} t0={at('nemici', 0, 0.3)} a={[N.jonas[0] + 50, N.jonas[1] - 30]} b={[N.adam[0] - 54, N.adam[1] + 10]} c={[1620, YJ - 40]} color={CHALK} dashed w={5} fade={via} />
      <Link T={T} t0={at('nemici', 0, 0.6)} a={[N.martha[0] + 50, N.martha[1] + 30]} b={[N.eva[0] - 54, N.eva[1] - 10]} c={[1620, YM + 40]} color={BLUE} dashed w={5} fade={via} />
      <Link T={T} t0={at('nemici', 1, 0.2)} a={[N.bambino[0] + 40, N.bambino[1] - 40]} b={[N.adam[0] - 20, N.adam[1] + 56]} c={[1720, 400]} color={RED} w={8} arrow label="distruggerlo" lx={60} ly={10} size={30} fade={via * off(endCh('nemici'))} />
      <Link T={T} t0={at('nemici', 1, 0.8)} a={[N.bambino[0] + 40, N.bambino[1] + 40]} b={[N.eva[0] - 20, N.eva[1] - 56]} c={[1720, 680]} color={BLUE} w={8} arrow label="tenerlo" lx={60} ly={10} size={30} fade={via * off(endCh('nemici'))} />
      <Tag T={T} t0={at('nemici', 2, 1.0)} x={N.bambino[0] + 10} y={Y0 - 120} text="il nodo si stringe" bg={RED} fg="#FFFFFF" size={26} rot={2} until={endCh('nemici') - 0.3} />

      {/* il viaggio fino al 1971: Jonas e Martha tornano lungo i rami e il tronco, fino all'auto */}
      <Link T={T} t0={at('ponte', 2, -0.6)} a={[N.jonas[0] - 50, N.jonas[1] + 10]} b={[N.auto[0] + 40, N.auto[1] - 70]} c={[700, 300]} color={YELLOW} dashed flow w={7} arrow fade={via} />
      <Link T={T} t0={at('ponte', 2, -0.3)} a={[N.martha[0] - 50, N.martha[1] - 10]} b={[N.auto[0] + 70, N.auto[1] - 50]} c={[760, 820]} color={BLUE} dashed flow w={7} arrow fade={via} />
      <Tag T={T} t0={at('ponte', 1, 0.1)} x={N.ponte[0] + 40} y={N.ponte[1] - 150} text="1971" size={34} rot={-3} until={endCh('ponte') - 0.3} />

      {/* il mondo d'origine: Tannhaus, l'auto, il ponte */}
      <Node T={T} t0={at('vetro', 0, 0.6)} p={N.tannhaus} name="Tannhaus" sub="l'orologiaio" side="left" r={56} ringColor={WARM}
        ring={focus(at('vetro', 0, 0.6), at('vetro', 3)) + focus(at('ponte', 3), endCh('ponte'))}>
        <PocketWatch t={T} scale={0.5} reverse />
      </Node>
      {T >= at('vetro', 1, -0.2) && (
        <g opacity={seg(T, at('vetro', 1, -0.2), at('vetro', 1, 0.2))}>
          <g transform={`translate(${N.ponte[0]} ${N.ponte[1]})`}><Bridge /></g>
          <g transform={`translate(${autoX} ${N.auto[1]}) rotate(${incidente ? 18 * eo(seg(T, at('vetro', 1, 1.1), at('vetro', 1, 1.5))) : 0})`}>
            <Car T={T < at('ponte', 0) ? T * (1 - seg(T, at('vetro', 1, 1.1), at('vetro', 1, 1.2))) : at('ponte', 2) + (T - at('ponte', 2)) * (1 - frena)} lights={1} />
          </g>
          <Link T={T} t0={at('vetro', 0, 1.0)} a={[N.tannhaus[0], N.tannhaus[1] + 62]} b={[N.auto[0] - 40, N.auto[1] - 80]} c={[260, 600]} color={WARM} w={4} label="la famiglia del figlio" lx={150} ly={34} size={28} fade={off(endCh('vetro'))} />
        </g>
      )}
      <X T={T} t0={at('vetro', 1, 1.2)} x={N.ponte[0] + 70} y={N.ponte[1] - 40} s={0.8} fade={1 - seg(T, at('ponte', 0) - 0.4, at('ponte', 0))} />
      <Tag T={T} t0={at('vetro', 1, 1.4)} x={N.ponte[0] + 105} y={N.ponte[1] + 112} text="un incidente" bg={RED} fg="#FFFFFF" size={26} rot={-2} until={endCh('vetro') - 0.3} />
      {/* il triangolo di pericolo: l'auto si ferma prima del ponte */}
      {T >= at('ponte', 2, 0.6) && (
        <g transform={`translate(${N.auto[0] + 64} ${N.auto[1] - 4}) scale(${eo(seg(T, at('ponte', 2, 0.6), at('ponte', 2, 0.9)))})`}>
          <path d="M0 -58 L-34 0 H34 Z" fill={YELLOW} stroke="#0C110F" strokeWidth="5" strokeLinejoin="round" />
          <path d="M0 -40 V-18 M0 -10 V-8" stroke="#0C110F" strokeWidth="6" strokeLinecap="round" />
        </g>
      )}
      <Tag T={T} t0={at('ponte', 3, 0.6)} x={F[0] + 170} y={Y0 - 80} text="niente macchina" bg={RED} fg="#FFFFFF" size={26} rot={2} until={endCh('ponte') - 0.3} />

      {/* la macchina del tempo: un ingranaggio che si accende al bivio */}
      {T >= at('vetro', 2, -0.2) && (
        <g transform={`translate(${F[0]} ${F[1]}) scale(${eo(seg(T, at('vetro', 2, -0.2), at('vetro', 2, 0.3))) * (1 - 0.3 * svanisce)})`} opacity={1 - spenta * 0.65}>
          {macchina > 0 && spenta < 1 && <Glow id="fs-mg" x={0} y={0} r={150} t={T} color="#F2D48A" amp={0.12} rate={3.2} opacity={0.6 * macchina * (1 - spenta)} />}
          <Gear T={T} on={macchina * (1 - spenta)} r={40} />
        </g>
      )}
      <X T={T} t0={at('ponte', 3, 0.2)} x={F[0]} y={F[1]} s={1} fade={1 - seg(T, at('resta', 0), at('resta', 0, 1))} />
      <text x={F[0]} y={F[1] + 92} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize="30" fill="#F2D48A" stroke="#0C110F" strokeWidth={7} paintOrder="stroke"
        opacity={seg(T, at('vetro', 2, 0.4), at('vetro', 2, 0.8)) * (1 - svanisce)}>la macchina del tempo</text>

      {/* i nodi dei personaggi del nodo (svaniscono alla fine) */}
      <Node T={T} t0={at('antenato', 0, 0.2)} p={N.jonas} name="Jonas" side="above" r={54} fade={via} ring={focus(at('antenato', 0, 0.2), at('antenato', 1)) + focus(at('ponte', 2, -0.6), at('ponte', 3))}>
        <g transform="translate(0 -40)"><Raincoat id="fs-rc" t={T} scale={0.22} wind={0.3} wet={false} /></g>
      </Node>
      <Node T={T} t0={at('antenato', 1, 0.1)} p={N.martha} name="Martha" sub="dell'altro mondo" side="below" r={54} stroke={BLUE} ringColor={BLUE} fade={via}
        ring={focus(at('antenato', 1, 0.1), at('antenato', 2)) + focus(at('ponte', 2, -0.3), at('ponte', 3))}>
        <BlueYarn r={28} />
      </Node>
      <Node T={T} t0={at('antenato', 1, 0.9)} p={N.bambino} name="il figlio" side="right" r={46} fade={via} ring={focus(at('antenato', 1, 0.9), endCh('antenato') - 0.4)}><Bootie /></Node>
      <Node T={T} t0={at('nemici', 0, 0.1)} p={N.adam} name="Adam" sub="Jonas da vecchio" side="left" r={52} fade={via} ring={focus(at('nemici', 1, 0.2), at('nemici', 2))}><Hourglass T={T} scale={0.55} /></Node>
      <Node T={T} t0={at('nemici', 0, 0.4)} p={N.eva} name="Eva" sub="Martha da vecchia" side="left" r={52} stroke={BLUE} ringColor={BLUE} fade={via} ring={focus(at('nemici', 1, 0.8), at('nemici', 2))}><Lantern T={T} /></Node>

      {/* polvere: svanisce chi è nato dal nodo, poi i due mondi */}
      {([N.jonas, N.martha, N.bambino, N.adam, N.eva, N.cerchioJ, N.cerchioM] as P[]).map((p, i) => (
        <Dust key={i} T={T} t0={at('resta', 0, 0.1 + i * 0.18)} x={p[0]} y={p[1]} color={i === 1 || i === 4 || i === 6 ? '#9CC6F2' : CHALK} n={22} spread={80} seed={i + 3} />
      ))}

      {/* ciò che resta: il tronco va avanti fino alla casa accesa; Hannah e il nome Jonas */}
      {vivo > 0 && (
        <g transform={`translate(${N.casa[0]} ${N.casa[1]}) scale(${0.8 + 0.2 * vivo})`} opacity={vivo}>
          <House T={T} lit={seg(T, at('resta', 1, 0.8), at('resta', 1, 1.2))} />
        </g>
      )}
      <Tag T={T} t0={at('resta', 1, 1.0)} x={N.casa[0]} y={N.casa[1] - 150} text="la vita va avanti" bg={WARM} size={26} rot={-2} until={FINE_CAPITOLI - 0.3} />
      <Link T={T} t0={at('resta', 2, 0.1)} a={[N.hannah[0] + 10, Y0 + 6]} b={[N.hannah[0], N.hannah[1] - 52]} color={WARM} w={5} />
      <Node T={T} t0={at('resta', 2, 0.2)} p={N.hannah} name="Hannah" sub="aspetta un bambino" side="left" r={50} ringColor={WARM} ring={focus(at('resta', 2, 0.2), FINE_CAPITOLI)}><Cradle T={T} /></Node>
      {T >= at('resta', 2, 1.4) && (
        <text x={N.hannah[0] + 90} y={N.hannah[1] + 70} fontFamily={HAND} fontWeight={700} fontSize="64" fill={YELLOW} stroke="#0C110F" strokeWidth={8} paintOrder="stroke"
          transform={`rotate(-6 ${N.hannah[0] + 90} ${N.hannah[1] + 60})`} opacity={seg(T, at('resta', 2, 1.4), at('resta', 2, 1.9))}>Jonas?</text>
      )}
    </g>
  );
};

/** Fondo: quadrante dell'orologio di Tannhaus centrato sul bivio, ingranaggi ai lati. */
const Fondo: React.FC<{ T: number; c: { x: number; y: number; z: number } }> = ({ T, c }) => {
  const hand = (T / 60) * 360;
  // il quadrante segue lo schema con meno parallasse
  const k = 0.5;
  const qx = W / 2 + (F[0] - c.x) * c.z * k, qy = H / 2 + (F[1] - c.y) * c.z * k;
  return (
    <g>
      <g transform={`translate(${qx} ${qy})`} opacity=".08">
        <circle r="470" fill="none" stroke={CHALK} strokeWidth="8" />
        <circle r="440" fill="none" stroke={CHALK} strokeWidth="3" />
        {Array.from({ length: 60 }, (_, i) => <path key={i} d={`M0 -440 V${i % 5 ? -425 : -400}`} stroke={CHALK} strokeWidth={i % 5 ? 3 : 8} transform={`rotate(${i * 6})`} />)}
        <path d="M0 30 V-300" stroke={CHALK} strokeWidth="12" strokeLinecap="round" transform={`rotate(${-hand / 12 + 120})`} />
        <path d="M0 40 V-400" stroke={CHALK} strokeWidth="6" strokeLinecap="round" transform={`rotate(${-hand})`} />
      </g>
    </g>
  );
};

/** Lo schema del finale al tempo T (s dall'inizio del finale spiegato; la chiusura continua da FINE_CAPITOLI). */
export const FinaleSchema: React.FC<{ T: number }> = ({ T }) => {
  const c = camAt(T);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="fs" />
        <radialGradient id="fs-bg" cx=".5" cy=".5" r=".72">
          <stop offset="0" stopColor="#22302B" />
          <stop offset=".6" stopColor="#141B18" />
          <stop offset="1" stopColor="#080B0A" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="url(#fs-bg)" />
      <Fondo T={T} c={c} />
      <g transform={`translate(960 535) scale(${c.z}) translate(${-c.x} ${-c.y})`}>
        <Schema T={T} />
      </g>
      <TopShade id="fs" />
      <Motes16 T={T} color={CHALK} />
      <Finish16 id="fs" tint={TINT} tintOpacity={0.08} />
    </svg>
  );
};

/** Un capitolo del finale spiegato: lo stesso schema, al suo momento. */
export const makeFinale = (id: string): React.FC<ParteProps> => {
  const C: React.FC<ParteProps> = ({ t }) => <FinaleSchema T={STARTS[id] + t} />;
  return C;
};
