import React from 'react';
import { AbsoluteFill } from 'remotion';
import { eo, seg } from '../../lib/anim';
import { SANS, SERIF } from '../../lib/fonts';
import { Alone, LuceRadente, Quadro, Riflettore, inquadra, type Chiave, type Opera } from '../../lib/quadro';
import { Anello, Annotazioni, BIANCO, LINEA, Richiamo, Riquadro, Traccia, type Pt } from '../../lib/annotazioni';
import type { PosterProps, SceneDef, SceneProps } from '../../types';
import { finaleQuadro } from '../quadri/Locandina';

// L'Ultima Cena (quadri/ultima-cena.json): fotografia del dipinto dopo il restauro da Wikimedia Commons
// (pubblico dominio, miniatura ufficiale da 3840 px), salvata in public/quadri/ultima-cena/originale.jpg.
// Ogni scena: camera con fotogrammi chiave sulle frasi (cues) + annotazioni editoriali (src/lib/annotazioni.tsx).
// Gli istanti degli eventi passano da griglia() (72 bpm), come gli effetti in scripts/audio/ultima-cena.mjs.

export const OPERA: Opera = { src: 'quadri/ultima-cena/originale.jpg', aspect: 3840 / 2001, velo: 0.6 };
const ACC = '#E3A949';

// Punti dell'opera in frazioni (x da sinistra, y dall'alto), letti sull'immagine.
const P = {
  gesu: { x: 0.497, y: 0.468 },
  guancia: { x: 0.492, y: 0.478 }, // punto di fuga: la guancia destra di Gesù
  manoGesu: { x: 0.44, y: 0.655 }, // la destra di Gesù (a sinistra per chi guarda), verso il pane
  manoSinistraGesu: { x: 0.555, y: 0.652 },
  pane: { x: 0.405, y: 0.655 },
  manoGiuda: { x: 0.375, y: 0.66 },
  giuda: { x: 0.303, y: 0.52 },
  sacchetto: { x: 0.305, y: 0.632 },
  pietro: { x: 0.326, y: 0.49 },
  coltello: { x: 0.226, y: 0.612 },
  giovanni: { x: 0.364, y: 0.507 },
  tommaso: { x: 0.562, y: 0.497 },
  braccia: { x: 0.612, y: 0.53 },
  filippo: { x: 0.655, y: 0.5 },
  finestra: { x: 0.497, y: 0.43 },
  porta: { x: 0.49, y: 0.86 },
  tovaglia: { x: 0.2, y: 0.72 },
  gruppi: [
    { x0: 0.07, x1: 0.24 },
    { x0: 0.26, x1: 0.42 },
    { x0: 0.545, x1: 0.69 },
    { x0: 0.715, x1: 0.92 },
  ],
  // angoli degli arazzi e del soffitto: le loro linee portano al punto di fuga
  linee: [
    { x: 0.115, y: 0.055 }, { x: 0.205, y: 0.16 }, { x: 0.3, y: 0.0 },
    { x: 0.7, y: 0.0 }, { x: 0.79, y: 0.17 }, { x: 0.865, y: 0.09 },
  ],
};

const camera = (chiavi: Chiave[], t: number) => inquadra(OPERA, chiavi, t);
const add = (p: Pt, dx: number, dy: number): Pt => ({ x: p.x + dx, y: p.y + dy });
/** Vista con l'opera intera, larga quanto il fotogramma. */
const INTERA = (1920 * OPERA.aspect) / 1080;

// ---------------------------------------------------------------- disegni a linea per i riquadri (≈ 340×200)

const Testo: React.FC<{ x: number; y: number; children: React.ReactNode; size?: number; anchor?: 'start' | 'middle' | 'end'; bold?: boolean; fill?: string }> = ({ x, y, children, size = 24, anchor = 'middle', bold, fill = BIANCO }) => (
  <text x={x} y={y} textAnchor={anchor} fontFamily={SANS} fontWeight={bold ? 800 : 400} fontSize={size} fill={fill} stroke="none">{children}</text>
);

/** La sala lunga del refettorio vista in prospettiva: tavoli dei frati e, in fondo, il muro dipinto. */
const Refettorio = ({ p = 1 }: { p?: number }) => (
  <g {...LINEA}>
    <path d="M0 10 L120 60 M340 10 L220 60 M0 200 L120 140 M340 200 L220 140" strokeWidth={2} />
    <rect x="120" y="60" width="100" height="80" />
    {/* il dipinto in fondo, acceso */}
    <rect x="128" y="68" width="84" height="40" fill={ACC} fillOpacity={0.25 + 0.5 * p} stroke={ACC} />
    <path d="M136 98 H204" stroke={ACC} strokeWidth={2} />
    {/* tavoli lungo le pareti */}
    <path d="M30 170 L118 128 M60 186 L124 150" strokeWidth={2} />
    <path d="M310 170 L222 128 M280 186 L216 150" strokeWidth={2} />
  </g>
);

const Misure = () => (
  <g>
    <rect x="40" y="40" width="260" height="136" {...LINEA} />
    <path d="M40 20 H300 M40 14 V26 M300 14 V26" {...LINEA} strokeWidth={2} />
    <path d="M320 40 V176 M314 40 H326 M314 176 H326" {...LINEA} strokeWidth={2} />
    <Testo x={170} y={14} size={26} bold fill={ACC}>8,8 m</Testo>
    <Testo x={334} y={116} size={26} bold fill={ACC} anchor="start">4,6 m</Testo>
    {/* una porta a misura d'uomo, per confronto */}
    <rect x="60" y="126" width="26" height="50" {...LINEA} strokeWidth={2} />
    <Testo x={170} y={118} size={22}>un'intera parete</Testo>
  </g>
);

const Clessidra = ({ t = 0, fill = 0.5 }: { t?: number; fill?: number }) => (
  <g transform="translate(110 0)">
    <path d="M10 10 H110 M10 190 H110" {...LINEA} strokeWidth={5} />
    <path d="M22 10 C22 70 56 84 56 100 C56 116 22 130 22 190 M98 10 C98 70 64 84 64 100 C64 116 98 130 98 190" {...LINEA} />
    {/* sabbia: sopra cala, sotto cresce */}
    <path d={`M${30 + 20 * fill} ${30 + 50 * fill} H${90 - 20 * fill} L60 96 Z`} fill={ACC} fillOpacity=".8" />
    <path d={`M60 104 V${180 - 60 * fill}`} stroke={ACC} strokeWidth="3" strokeDasharray="4 6" strokeDashoffset={-t * 30} />
    <path d={`M28 186 Q60 ${186 - 70 * fill} 92 186 Z`} fill={ACC} fillOpacity=".8" />
  </g>
);

const Volto = () => (
  <g {...LINEA}>
    {/* una cornice ovale vuota: il volto che manca */}
    <ellipse cx="170" cy="96" rx="62" ry="82" />
    <ellipse cx="170" cy="96" rx="76" ry="96" strokeWidth={2} strokeDasharray="6 8" />
    <text x="170" y="122" textAnchor="middle" fontFamily={SERIF} fontSize="96" fill={ACC} stroke="none">?</text>
  </g>
);

const Libro = () => (
  <g {...LINEA}>
    <path d="M170 30 C130 14 70 14 30 30 V180 C70 164 130 164 170 180 Z" />
    <path d="M170 30 C210 14 270 14 310 30 V180 C270 164 210 164 170 180" />
    <path d="M50 60 C80 52 120 52 150 60 M50 86 C80 78 120 78 150 86 M50 112 C80 104 110 104 130 110" strokeWidth={2} opacity={0.6} />
    <path d="M190 60 C220 52 260 52 290 60 M190 86 C220 78 260 78 290 86" strokeWidth={2} opacity={0.6} />
    <Testo x={240} y={140} size={30} bold fill={ACC}>2003</Testo>
  </g>
);

/** Pianta della tavola com'era di solito: Gesù e undici apostoli dietro, Giuda da solo davanti. */
const Pianta = () => (
  <g>
    <rect x="20" y="60" width="300" height="44" rx="6" {...LINEA} />
    {Array.from({ length: 11 }, (_, i) => {
      const x = 40 + (i < 5 ? i : i + 1) * 26;
      return <circle key={i} cx={x} cy={40} r="9" fill="none" stroke={BIANCO} strokeWidth="3" />;
    })}
    <circle cx="170" cy="38" r="12" fill={BIANCO} />
    <circle cx="170" cy="136" r="12" fill={ACC} />
    <Testo x={206} y={144} size={24} anchor="start">Giuda</Testo>
    <Testo x={170} y={196} size={22}>un tondo = una persona a tavola</Testo>
  </g>
);

/** Sezione del muro: affresco (colore dentro l'intonaco bagnato) e pittura a secco (uno strato sopra, che si stacca). */
const Sezione = ({ p }: { p: number }) => (
  <g>
    <g {...LINEA}>
      <rect x="10" y="30" width="140" height="120" />
      <rect x="190" y="30" width="140" height="120" />
    </g>
    {/* affresco: il colore entra nell'intonaco */}
    <rect x="12" y="32" width="136" height="60" fill={ACC} fillOpacity=".35" />
    <path d="M10 92 H150" stroke={BIANCO} strokeWidth="2" strokeDasharray="4 6" />
    {/* a secco: uno strato sottile sopra, che si solleva a scaglie */}
    <path d="M190 30 H330" stroke={BIANCO} strokeWidth="2" />
    {[0, 1, 2, 3, 4].map((i) => {
      const x = 196 + i * 27, up = p * (6 + (i % 2) * 10);
      return <path key={i} d={`M${x} 26 L${x + 22} ${26 - up}`} stroke={ACC} strokeWidth="6" strokeLinecap="round" />;
    })}
    {/* umidità nel muro */}
    {[0, 1, 2].map((i) => <path key={i} d={`M${220 + i * 40} 140 q-6 -14 0 -26 q6 12 0 26`} {...LINEA} strokeWidth={2} opacity={0.6} />)}
    <Testo x={80} y={190}>affresco</Testo>
    <Testo x={260} y={190}>a secco</Testo>
  </g>
);

const Sacchi = () => (
  <g {...LINEA}>
    {/* il muro dipinto protetto da una parete di sacchi di sabbia */}
    <rect x="70" y="10" width="200" height="60" strokeWidth={2} opacity={0.5} />
    {[0, 1, 2, 3, 4].map((r) =>
      [0, 1, 2, 3, 4, 5].map((c) => {
        const x = 40 + c * 46 + (r % 2) * 23, y = 168 - r * 26;
        return x < 300 ? <rect key={`${r}-${c}`} x={x} y={y} width="42" height="24" rx="10" /> : null;
      }),
    )}
    <path d="M300 20 l14 -12 M310 40 l20 -6 M296 4 l4 -14" stroke={ACC} />
  </g>
);

const Restauro = () => (
  <g>
    <path d="M20 100 H320" {...LINEA} />
    {[1978, 1999].map((y, i) => (
      <g key={y}>
        <circle cx={20 + i * 300} cy={100} r="10" fill={ACC} />
        <Testo x={20 + i * 300} y={68} size={36} bold>{y}</Testo>
      </g>
    ))}
    <Testo x={170} y={150} size={30} bold fill={ACC}>21 anni</Testo>
  </g>
);

// ---------------------------------------------------------------- scene

const ColpoDOcchio: React.FC<SceneProps> = ({ t, dur, cues }) => {
  // panoramica sulla tavola (opera intera in altezza), poi al centro
  const chiavi = [{ t: 0, v: { x: 0.24, y: 0.55, h: 1.0 } }, { t: cues[1], v: { x: 0.62, y: 0.55, h: 0.95 } }, { t: dur, v: { x: 0.5, y: 0.52, h: 0.8 } }];
  const { at } = camera(chiavi, t);
  return (
    <Quadro opera={OPERA} t={t} chiavi={chiavi}
      sopra={
        <Annotazioni>
          <Richiamo t={t} da={cues[2] - 0.2} to={add(at(P.gesu), 0, 70)} lab={{ x: 760, y: 1150 }} kicker="Tredici a tavola" sub="Gesù e i dodici" accento={ACC} />
        </Annotazioni>
      }>
      {[0.405, 0.5, 0.6].map((x, i) => <Alone key={x} aspect={OPERA.aspect} t={t} x={x} y={0.43} r={0.05} forza={0.35} periodo={3.2} fase={i * 0.9} />)}
    </Quadro>
  );
};

/** Riquadri sopra l'opera piccola: la sala del refettorio e le misure del muro. */
const Milano: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const chiavi = [{ t: 0, v: { x: 0.44, y: 0.52, h: 0.94 } }, { t: dur, v: { x: 0.56, y: 0.52, h: 0.88 } }];
  const sala = griglia(cues[2]);
  return (
    <Quadro opera={OPERA} t={t} chiavi={chiavi}
      sopra={
        <Annotazioni>
          <Riquadro t={t} da={griglia(cues[0] + 0.6)} a={sala - 0.4} at={{ x: 540, y: 1090 }} titolo="Milano · 1495 circa" nota="Santa Maria delle Grazie" accento={ACC}>
            <g transform="translate(0 6)">
              <path d="M90 180 V100 H250 V180 M70 180 H270" {...LINEA} />
              <path d="M120 100 V70 H220 V100 M140 70 Q170 10 200 70" {...LINEA} />
              <path d="M170 24 V6 M162 14 H178" {...LINEA} strokeWidth={2} />
              {[110, 150, 190, 230].map((x) => <path key={x} d={`M${x} 180 v-34 a10 10 0 0 1 20 0 v34`} {...LINEA} strokeWidth={2} />)}
            </g>
          </Riquadro>
          <Riquadro t={t} da={sala} at={{ x: 540, y: 1090 }} titolo="Il refettorio" nota="la sala dove mangiano i frati" accento={ACC}>
            <Refettorio p={eo(seg(t, sala + 0.6, sala + 1.6))} />
          </Riquadro>
        </Annotazioni>
      }
    />
  );
};

const Lentezza: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  // la tavola con piatti e pane, quasi ferma: il tempo che passa
  const chiavi = [{ t: 0, v: { x: 0.7, y: 0.6, h: 0.5 } }, { t: dur, v: { x: 0.74, y: 0.61, h: 0.44 } }];
  const priore = griglia(cues[1]);
  const volto = griglia(cues[2]);
  return (
    <Quadro opera={OPERA} t={t} chiavi={chiavi}
      sopra={
        <Annotazioni>
          <Riquadro t={t} da={griglia(0.6)} a={priore - 0.4} at={{ x: 540, y: 1060 }} titolo="Ore a guardare" nota="poi, forse, una pennellata" accento={ACC}>
            <Clessidra t={t} fill={seg(t, 0.6, priore)} />
          </Riquadro>
          <Riquadro t={t} da={priore} a={volto - 0.4} at={{ x: 540, y: 1060 }} titolo="Il priore protesta" nota="il capo dei frati vuole il dipinto" accento={ACC}>
            <Clessidra t={t} fill={1} />
          </Riquadro>
          <Riquadro t={t} da={volto} at={{ x: 540, y: 1060 }} titolo="Il volto del traditore" nota="quello del priore?" accento={ACC}>
            <Volto />
          </Riquadro>
        </Annotazioni>
      }
    />
  );
};

const Annuncio: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const frase = griglia(cues[1]);
  const chiavi = [{ t: 0, v: { x: 0.5, y: 0.52, h: 0.9 } }, { t: frase, v: { x: 0.497, y: 0.5, h: 0.62 } }, { t: dur, v: { x: 0.497, y: 0.5, h: 0.5 } }];
  const { at } = camera(chiavi, t);
  return (
    <Quadro opera={OPERA} t={t} chiavi={chiavi}
      sopra={
        <Annotazioni>
          <Richiamo t={t} da={griglia(0.8)} a={frase - 0.3} to={add(at(P.gesu), 0, 40)} lab={{ x: 760, y: 1150 }} kicker="Gesù" sub="al centro della tavola" accento={ACC} />
          <Richiamo t={t} da={frase} to={add(at(P.gesu), -30, 60)} lab={{ x: 300, y: 1150 }} kicker="L'annuncio" sub="«uno di voi mi tradirà»" accento={ACC} />
        </Annotazioni>
      }>
      {/* la finestra dietro la testa si accende sull'annuncio */}
      <Alone aspect={OPERA.aspect} t={t} {...P.finestra} r={0.09} forza={0.25 + 0.35 * eo(seg(t, frase, frase + 0.8))} periodo={3} />
    </Quadro>
  );
};

/** La camera scorre lungo la tavola: ogni gruppo di tre si segna con una parentesi quando entra in vista; poi torna su Gesù, solo al centro. */
const Gruppi: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const g0 = griglia(cues[0] + 0.6);
  const gesti = griglia(cues[1]);
  const solo = griglia(cues[2]);
  const H0 = 0.72, Y = 0.5;
  const chiavi = [
    { t: 0, v: { x: 0.15, y: Y, h: H0 } },
    { t: g0 + 0.7, v: { x: 0.16, y: Y, h: H0 } },
    { t: gesti - 0.2, v: { x: 0.33, y: Y, h: H0 } },
    { t: gesti + 1.4, v: { x: 0.64, y: Y, h: H0 } },
    { t: solo - 0.2, v: { x: 0.8, y: Y, h: H0 } },
    { t: solo + 1.2, v: { x: 0.5, y: Y, h: 0.95 } },
    { t: dur, v: { x: 0.5, y: Y + 0.02, h: 1.0 } },
  ];
  const { at, px } = camera(chiavi, t);
  // istante in cui compare ogni parentesi: il primo a g0, gli altri quando il loro centro arriva verso il centro dello schermo
  const quando = P.gruppi.map((g, i) => {
    if (i === 0) return g0;
    for (let k = 0; k <= 120; k++) {
      const tk = (k / 120) * dur;
      if (inquadra(OPERA, chiavi, tk).at({ x: (g.x0 + g.x1) / 2, y: 0.4 }).x < 720) return tk;
    }
    return dur;
  });
  return (
    <Quadro opera={OPERA} t={t} chiavi={chiavi}
      sopra={
        <Annotazioni>
          {P.gruppi.map((g, i) => {
            const a = at({ x: g.x0, y: 0.4 }), b = at({ x: g.x1, y: 0.4 });
            const p = eo(seg(t, quando[i], quando[i] + 0.5));
            if (p <= 0) return null;
            const h = px(0.025);
            return (
              <g key={i} opacity={p}>
                <path d={`M${a.x} ${a.y + h} V${a.y} H${b.x} V${a.y + h}`} fill="none" stroke="#000" strokeOpacity=".35" strokeWidth="7" />
                <path d={`M${a.x} ${a.y + h} V${a.y} H${b.x} V${a.y + h}`} fill="none" stroke={BIANCO} strokeWidth="3" strokeDasharray="10 8" pathLength={1} />
                <circle cx={(a.x + b.x) / 2} cy={a.y} r={24} fill={ACC} stroke="#000" strokeOpacity=".4" strokeWidth="3" />
                <text x={(a.x + b.x) / 2} y={a.y + 10} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="30" fill="#1C1511">3</text>
              </g>
            );
          })}
          <Richiamo t={t} da={gesti + 0.6} a={solo - 0.3} to={at(P.braccia)} lab={{ x: 300, y: 1150 }} kicker="Braccia e dita" sub="stupore e domande" accento={ACC} />
          <Anello t={t} da={solo + 1.0} c={at(P.gesu)} r={px(0.06)} />
          <Richiamo t={t} da={solo + 1.2} to={add(at(P.gesu), px(0.045), px(0.045))} lab={{ x: 760, y: 1150 }} kicker="Gesù" sub="fermo, da solo" accento={ACC} punto={false} />
        </Annotazioni>
      }
    />
  );
};

const Giuda: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const ombra = griglia(cues[1]);
  const sacco = griglia(cues[2]);
  const chiavi = [{ t: 0, v: { x: 0.33, y: 0.55, h: 0.8 } }, { t: ombra, v: { x: 0.305, y: 0.56, h: 0.64 } }, { t: dur, v: { x: 0.3, y: 0.56, h: 0.58 } }];
  const { at } = camera(chiavi, t);
  return (
    <Quadro opera={OPERA} t={t} chiavi={chiavi}
      sopra={
        <Annotazioni>
          <Riquadro t={t} da={griglia(0.5)} a={ombra - 0.4} at={{ x: 540, y: 1050 }} titolo="Di solito" nota="Giuda da solo, davanti al tavolo" accento={ACC}>
            <Pianta />
          </Riquadro>
          <Richiamo t={t} da={ombra} to={at(P.giuda)} lab={{ x: 160, y: 900 }} kicker="Giuda" sub="tra gli altri, nell'ombra" accento={ACC} />
          <Richiamo t={t} da={sacco} to={at(P.sacchetto)} lab={{ x: 920, y: 1190 }} kicker="Il sacchetto" sub="forse i soldi" accento={ACC} />
        </Annotazioni>
      }>
      <Riflettore aspect={OPERA.aspect} t={t} x={0.305} y={0.578} r={0.085} buio={0.5} da={ombra} />
    </Quadro>
  );
};

const Pane: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const giuda = griglia(cues[1]);
  const segno = griglia(cues[2]);
  const chiavi = [{ t: 0, v: { x: 0.45, y: 0.6, h: 0.5 } }, { t: giuda, v: { x: 0.415, y: 0.6, h: 0.42 } }, { t: dur, v: { x: 0.41, y: 0.6, h: 0.38 } }];
  const { at, px } = camera(chiavi, t);
  const mg = at(P.manoGesu), mj = at(P.manoGiuda), pa = at(P.pane);
  return (
    <Quadro opera={OPERA} t={t} chiavi={chiavi}
      sopra={
        <Annotazioni>
          <Richiamo t={t} da={griglia(0.6)} to={mg} lab={{ x: 920, y: 820 }} kicker="La mano di Gesù" sub="verso il pane" accento={ACC} />
          <Richiamo t={t} da={giuda} to={mj} lab={{ x: 160, y: 720 }} kicker="Giuda" sub="allunga la sua" accento={ACC} />
          <Traccia t={t} da={segno} punti={[add(mj, 0, 40), add(pa, 0, 70), add(mg, 0, 40)]} dur={0.9} />
          <Anello t={t} da={segno + 0.3} c={pa} r={px(0.035)} />
        </Annotazioni>
      }
    />
  );
};

const Giovanni: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const libro = griglia(cues[1]);
  const storici = griglia(cues[2]);
  const chiavi = [{ t: 0, v: { x: 0.4, y: 0.53, h: 0.6 } }, { t: dur, v: { x: 0.37, y: 0.53, h: 0.46 } }];
  const { at, px } = camera(chiavi, t);
  const g = at(P.giovanni), r = px(0.042);
  return (
    <Quadro opera={OPERA} t={t} chiavi={chiavi}
      sopra={
        <Annotazioni>
          <Anello t={t} da={griglia(0.6)} c={g} r={r} />
          <Riquadro t={t} da={libro} a={storici - 0.4} at={{ x: 540, y: 1080 }} titolo="Il codice da Vinci" nota="un romanzo, non un documento" accento={ACC}>
            <Libro />
          </Riquadro>
          <Richiamo t={t} da={storici} to={add(g, r * 0.7, r * 0.7)} lab={{ x: 720, y: 1150 }} kicker="Giovanni" sub="l'apostolo più giovane" accento={ACC} punto={false} />
        </Annotazioni>
      }
    />
  );
};

/** Le linee del soffitto e degli arazzi si tracciano una alla volta e finiscono sul volto di Gesù. */
const Prospettiva: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const chiavi = [{ t: 0, v: { x: 0.5, y: 0.38, h: 0.95 } }, { t: dur, v: { x: 0.5, y: 0.4, h: 0.8 } }];
  const { at } = camera(chiavi, t);
  const l0 = griglia(cues[0] + 1.2);
  const punto = griglia(cues[1] + 0.8);
  const vp = at(P.guancia);
  return (
    <Quadro opera={OPERA} t={t} chiavi={chiavi}
      sopra={
        <Annotazioni>
          {/* le linee entrano sotto la zona del titolo (y ≥ 650) */}
          <defs><clipPath id="uc-sotto-titolo"><rect x="0" y="650" width="1080" height="1270" /></clipPath></defs>
          <g clipPath="url(#uc-sotto-titolo)">
            {P.linee.map((q, i) => (
              <Traccia key={i} t={t} da={l0 + i * (30 / 72)} punti={[at(q), vp]} dur={0.8} />
            ))}
          </g>
          <g opacity={eo(seg(t, punto, punto + 0.4))}>
            <circle cx={vp.x} cy={vp.y} r={14 + 4 * Math.sin(t * 3)} fill={ACC} stroke="#000" strokeOpacity=".4" strokeWidth="3" />
          </g>
          <Richiamo t={t} da={punto + 0.3} to={vp} lab={{ x: 900, y: 1200 }} kicker="Punto di fuga" sub="il volto di Gesù" accento={ACC} punto={false} />
        </Annotazioni>
      }
    />
  );
};

const Tecnica: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const secco = griglia(cues[1]);
  const stacca = griglia(cues[2]);
  const chiavi = [{ t: 0, v: { x: 0.26, y: 0.66, h: 0.4 } }, { t: dur, v: { x: 0.22, y: 0.67, h: 0.3 } }];
  const { at } = camera(chiavi, t);
  return (
    <Quadro opera={OPERA} t={t} chiavi={chiavi}
      sopra={
        <Annotazioni>
          <Riquadro t={t} da={griglia(0.6)} a={stacca - 0.4} at={{ x: 540, y: 1060 }} titolo="Affresco o a secco" nota={t < secco ? 'il colore dentro l\'intonaco' : 'Leonardo: uno strato sopra'} accento={ACC}>
            <Sezione p={eo(seg(t, secco, secco + 1.2))} />
          </Riquadro>
          <Richiamo t={t} da={stacca} to={at({ x: 0.2, y: 0.7 })} lab={{ x: 640, y: 1150 }} kicker="Si stacca" sub="già vent'anni dopo" accento={ACC} />
        </Annotazioni>
      }>
      <LuceRadente aspect={OPERA.aspect} t={t} x={0.22} y={0.67} r={0.12} forza={0.22} da={stacca - 0.4} a={dur - 0.4} />
    </Quadro>
  );
};

const Ferite: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const porta = griglia(0.9);
  const bomba = griglia(cues[1] + 0.9);
  const chiavi = [{ t: 0, v: { x: 0.49, y: 0.66, h: 0.72 } }, { t: bomba, v: { x: 0.49, y: 0.64, h: 0.7 } }, { t: dur, v: { x: 0.5, y: 0.56, h: 0.9 } }];
  const { at } = camera(chiavi, t);
  const arco = [{ x: 0.372, y: 1.0 }, { x: 0.372, y: 0.81 }, { x: 0.49, y: 0.775 }, { x: 0.605, y: 0.81 }, { x: 0.605, y: 1.0 }].map(at);
  // il colpo: un lampo breve e un tremito della camera
  const colpo = seg(t, bomba, bomba + 0.6);
  const lampo = colpo > 0 && colpo < 1 ? 0.5 * (1 - colpo) : 0;
  const tremito = colpo > 0 && colpo < 1 ? Math.sin(t * 70) * 8 * (1 - colpo) : 0;
  return (
    <AbsoluteFill style={{ transform: `translate(${tremito}px, ${tremito * 0.6}px)` }}>
      <Quadro opera={OPERA} t={t} chiavi={chiavi}
        sopra={
          <>
            <AbsoluteFill style={{ background: '#FFF4DC', opacity: lampo }} />
            <Annotazioni>
              <Traccia t={t} da={porta} a={bomba - 0.4} punti={arco} dur={1.2} />
              <Richiamo t={t} da={porta + 0.6} a={bomba - 0.4} to={arco[2]} lab={{ x: 760, y: 760 }} kicker="1652 · la porta" sub="via i piedi di Gesù" accento={ACC} />
              <Riquadro t={t} da={bomba + 0.4} at={{ x: 540, y: 1060 }} titolo="15 agosto 1943" nota="i sacchi di sabbia lo proteggono" accento={ACC}>
                <Sacchi />
              </Riquadro>
            </Annotazioni>
          </>
        }
      />
    </AbsoluteFill>
  );
};

const Oggi: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const chiavi = [{ t: 0, v: { x: 0.5, y: 0.55, h: 0.9 } }, { t: dur * 0.55, v: { x: 0.5, y: 0.55, h: 1.0 } }, { t: dur, v: { x: 0.5, y: 0.52, h: INTERA * 0.92 } }];
  const oggi = griglia(cues[1]);
  return (
    <Quadro opera={OPERA} t={t} fondo={0.7} chiavi={chiavi}
      sopra={
        <Annotazioni>
          <Riquadro t={t} da={griglia(0.6)} a={oggi - 0.4} at={{ x: 540, y: 1150 }} h={300} titolo="Il restauro" nota="finito nel 1999" accento={ACC}>
            <Restauro />
          </Riquadro>
          <Riquadro t={t} da={oggi} at={{ x: 540, y: 1150 }} h={300} titolo="Oggi" nota="su prenotazione, pochi minuti" accento={ACC}>
            <g transform="translate(0 -10) scale(0.9)"><Clessidra t={t} fill={seg(t, oggi, dur)} /></g>
          </Riquadro>
        </Annotazioni>
      }>
      {[0.405, 0.5, 0.6].map((x, i) => <Alone key={x} aspect={OPERA.aspect} t={t} x={x} y={0.43} r={0.05} forza={0.3} periodo={3.2} fase={i * 0.9} />)}
    </Quadro>
  );
};

// Scene per id del capitolo (quadri/ultima-cena.json).
export const ULTIMA_CENA_SCENES: Record<string, SceneDef> = {
  'colpo-d-occhio': { Component: ColpoDOcchio, title: { top: 400, size: 96 } },
  milano: { Component: Milano, title: { top: 400, size: 104 } },
  lentezza: { Component: Lentezza, title: { top: 400, size: 104 } },
  annuncio: { Component: Annuncio, title: { top: 400, size: 104 } },
  gruppi: { Component: Gruppi, title: { top: 400, size: 96 } },
  giuda: { Component: Giuda, title: { top: 400, size: 104 } },
  pane: { Component: Pane, title: { top: 400, size: 96 } },
  giovanni: { Component: Giovanni, title: { top: 400, size: 104 } },
  prospettiva: { Component: Prospettiva, title: { top: 400, size: 88 } },
  tecnica: { Component: Tecnica, title: { top: 400, size: 96 } },
  ferite: { Component: Ferite, title: { top: 400, size: 104 } },
  oggi: { Component: Oggi, title: { top: 400, size: 96 } },
};

// ---------------------------------------------------------------- copertina e finale

const CREMA = '#FFF8E6';

/**
 * Copertina (regola nuova di CLAUDE.md): il fotogramma 0 è già la miniatura completa (immagine, etichetta, titolo,
 * autore), senza la frase di lancio, che entra da 0,4 s in 0,3 s e poi resta.
 */
export const Copertina: React.FC<PosterProps> = ({ t, dur, film }) => {
  const P = film.palette;
  const lancio = eo(seg(t, 0.4, 0.7));
  return (
    <AbsoluteFill>
      <Quadro opera={OPERA} t={t} chiavi={[{ t: 0, v: { x: 0.497, y: 0.43, h: 0.56 } }, { t: dur, v: { x: 0.497, y: 0.44, h: 0.5 } }]}>
        <Alone aspect={OPERA.aspect} t={t} {...P_FIN} r={0.08} forza={0.35} periodo={3} />
      </Quadro>
      <AbsoluteFill style={{ background: 'linear-gradient(rgba(12,8,4,.8), rgba(12,8,4,.15) 40%, rgba(12,8,4,0) 55%, rgba(12,8,4,.15) 66%, rgba(12,8,4,.75))' }} />
      <p style={{ position: 'absolute', top: 290, left: 120, margin: 0, fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: '0.35em', color: P.accento }}>
        QUADRI SPIEGATI
      </p>
      <h1 style={{ position: 'absolute', top: 340, left: 120, margin: 0, fontFamily: SERIF, fontWeight: 400, fontSize: 196, lineHeight: 0.88, color: CREMA,
        textShadow: '0 6px 30px rgba(0,0,0,.6)' }}>
        L'Ultima<br />Cena
      </h1>
      <p style={{ position: 'absolute', top: 340 + 196 * 0.88 * 2 + 30, left: 120, margin: 0, fontFamily: SANS, fontWeight: 800, fontSize: 40, color: CREMA, textShadow: '0 3px 16px rgba(0,0,0,.6)' }}>
        {film.autore} · 1495–1498
      </p>
      {film.copertina.frase_lancio && (
        <p style={{ position: 'absolute', top: 1340, left: 120, width: 780, margin: 0, fontFamily: SERIF, fontStyle: 'italic', fontSize: 64, lineHeight: 1.12, color: CREMA,
          textShadow: '0 4px 20px rgba(0,0,0,.7)', opacity: lancio, transform: `translateY(${(1 - lancio) * 14}px)` }}>
          {film.copertina.frase_lancio.split('. ').map((r, i, a) => <React.Fragment key={i}>{i > 0 && <br />}{r}{i < a.length - 1 ? '.' : ''}</React.Fragment>)}
        </p>
      )}
    </AbsoluteFill>
  );
};
const P_FIN = P.finestra;

export const Finale = finaleQuadro(OPERA);
