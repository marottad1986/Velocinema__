import React from 'react';
import { AbsoluteFill } from 'remotion';
import { SANS } from '../../lib/fonts';
import { Quadro, inquadra, type Chiave, type Opera } from '../../lib/quadro';
import { Anello, Annotazioni, BIANCO, LINEA, Richiamo, Riquadro, type Pt } from '../../lib/annotazioni';
import { seg } from '../../lib/anim';
import type { SceneDef, SceneProps } from '../../types';
import { copertinaQuadro, finaleQuadro, intera } from '../quadri/Locandina';

// La grande onda di Kanagawa (quadri/grande-onda.json): esemplare del Metropolitan Museum (CC0, via Wikimedia
// Commons, miniatura da 3840 px), salvato in public/quadri/grande-onda/originale.jpg.
// Ogni scena: camera con fotogrammi chiave sulle frasi (cues) + annotazioni editoriali (src/lib/annotazioni.tsx).

export const OPERA: Opera = { src: 'quadri/grande-onda/originale.jpg', aspect: 3840 / 2651, velo: 0.75 };
const ACC = '#E7B65C';

// Punti della stampa in frazioni (x da sinistra, y dall'alto), letti sull'immagine.
const P = {
  fuji: { x: 0.629, y: 0.69 },
  ondaPiccola: { x: 0.34, y: 0.63 },
  cresta: { x: 0.43, y: 0.2 },
  artigli: { x: 0.55, y: 0.33 },
  corpoOnda: { x: 0.3, y: 0.5 },
  cartiglio: { x: 0.079, y: 0.207 },
  firma: { x: 0.064, y: 0.29 },
  barcaSinistra: { x: 0.14, y: 0.67 },
  barcaCentro: { x: 0.52, y: 0.88 },
  barcaDestra: { x: 0.85, y: 0.65 },
  rematori: { x: 0.82, y: 0.64 },
};

const camera = (chiavi: Chiave[], t: number) => inquadra(OPERA, chiavi, t);
const add = (p: Pt, dx: number, dy: number): Pt => ({ x: p.x + dx, y: p.y + dy });

// ---------------------------------------------------------------- disegni a linea per i riquadri (≈ 340×200)

const Testo: React.FC<{ x: number; y: number; children: React.ReactNode; size?: number; anchor?: 'start' | 'middle' | 'end'; bold?: boolean; fill?: string }> = ({ x, y, children, size = 24, anchor = 'middle', bold, fill = BIANCO }) => (
  <text x={x} y={y} textAnchor={anchor} fontFamily={SANS} fontWeight={bold ? 800 : 400} fontSize={size} fill={fill} stroke="none">{children}</text>
);

const Nomi = () => (
  <g>
    <text x="110" y="130" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="110" fill={ACC}>30+</text>
    <Testo x={110} y={180}>nomi d'arte</Testo>
    <g {...LINEA}>
      {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M230 ${30 + i * 32} h${90 - (i % 3) * 20}`} strokeWidth={2} opacity={1 - i * 0.15} />)}
    </g>
  </g>
);

const Vedute = () => (
  <g>
    {Array.from({ length: 36 }, (_, i) => {
      const x = (i % 9) * 38, y = Math.floor(i / 9) * 46;
      return (
        <g key={i} transform={`translate(${x} ${y})`}>
          <rect width="32" height="38" fill="none" stroke={BIANCO} strokeWidth="1.5" opacity=".7" />
          <path d="M6 32 L16 14 L26 32" fill="none" stroke={i === 0 ? ACC : BIANCO} strokeWidth="2" />
        </g>
      );
    })}
  </g>
);

const DueSagome = () => (
  <g {...LINEA}>
    <path d="M10 170 Q60 150 85 60 Q110 150 160 170" />
    <path d="M60 110 q12 -8 25 -6 q13 -2 25 6" strokeDasharray="3 6" />
    <path d="M190 170 L265 60 L340 170" />
    <path d="M240 98 l25 -38 l25 38 q-12 -8 -25 0 q-13 -8 -25 0" />
    <Testo x={85} y={205}>l'onda</Testo>
    <Testo x={265} y={205}>il Fuji</Testo>
  </g>
);

const Barca = () => (
  <g {...LINEA}>
    <path d="M10 120 Q170 160 330 110 L320 130 Q170 175 20 140 Z" />
    {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={60 + i * 32} cy={112 + Math.sin(i) * 3} r="9" />)}
    {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${60 + i * 32} 122 l-18 50`} strokeWidth={2} />)}
    <Testo x={170} y={210}>barca veloce, circa 8 rematori</Testo>
  </g>
);

const ricciolo = (cx: number, cy: number, r: number) => `M${cx - r} ${cy} a${r} ${r} 0 1 1 ${r} ${r} a${r * 0.6} ${r * 0.6} 0 1 1 ${-r * 0.4} ${-r * 0.7}`;
const Riccioli = () => (
  <g {...LINEA}>
    <path d={ricciolo(90, 100, 60)} />
    <path d={ricciolo(200, 70, 32)} />
    <path d={ricciolo(260, 120, 20)} />
    <path d={ricciolo(300, 70, 12)} />
    <path d={ricciolo(320, 140, 7)} />
  </g>
);

const Tsunami = () => (
  <g {...LINEA}>
    <path d="M0 80 H150" strokeDasharray="3 8" strokeWidth={2} />
    <path d="M0 80 Q40 74 60 80 T120 80 Q140 60 150 30" />
    <path d="M150 30 V95" strokeWidth={2} />
    <Testo x={75} y={130} size={24} bold>tsunami</Testo>
    <Testo x={75} y={160} size={22}>sale sulla costa</Testo>
    <path d="M190 80 H340" strokeDasharray="3 8" strokeWidth={2} />
    <path d="M190 80 Q240 80 255 20 Q270 -5 300 15 Q280 20 285 45 Q300 80 340 80" stroke={ACC} />
    <Testo x={265} y={130} size={24} bold>tempesta</Testo>
    <Testo x={265} y={160} size={22}>in mare aperto</Testo>
  </g>
);

const DueBlu = () => (
  <g>
    {[['#2E3A6B', 'indaco'], ['#16357A', 'blu di Prussia']].map(([c, n], i) => (
      <g key={n} transform={`translate(${20 + i * 170} 10)`}>
        <rect width="130" height="120" rx="8" fill={c} stroke={BIANCO} strokeWidth="2" opacity={i === 0 ? 0.55 : 1} />
        <Testo x={65} y={160}>{n}</Testo>
      </g>
    ))}
  </g>
);

const Blocchi = () => (
  <g>
    {[0, 1, 2, 3].map((i) => (
      <g key={i} transform={`translate(${30 + i * 26} ${20 + i * 22})`}>
        <rect width="200" height="110" fill="#0A1020" stroke={BIANCO} strokeWidth="2.5" />
        <rect x="14" y="14" width="172" height="82" fill="none" stroke={[BIANCO, '#6E8FC9', '#16357A', ACC][i]} strokeWidth="2" strokeDasharray={i ? '4 6' : undefined} />
      </g>
    ))}
    <Testo x={170} y={215}>un blocco di legno per colore</Testo>
  </g>
);

const Copie = () => (
  <g>
    {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={30 + i * 6} y={40 - i * 6} width="140" height="100" fill="#0A1020" stroke={BIANCO} strokeWidth="2" />)}
    <text x="270" y="110" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="56" fill={ACC}>×1000</text>
    <Testo x={270} y={150}>e più</Testo>
  </g>
);

const Viaggio = () => (
  <g {...LINEA}>
    <path d="M300 60 q10 20 0 40 q-8 20 6 40" strokeWidth={3} />
    <Testo x={300} y={180}>Giappone</Testo>
    <path d="M40 70 q30 -20 50 10 q-10 30 -40 30 Z" strokeWidth={3} />
    <Testo x={60} y={180}>Europa</Testo>
    <path d="M280 90 Q170 -10 100 80" strokeDasharray="6 8" stroke={ACC} />
    <path d="M100 80 l2 -16 M100 80 l14 -6" stroke={ACC} />
  </g>
);

const LaMer = () => (
  <g {...LINEA}>
    <rect x="90" y="0" width="160" height="200" />
    <path d="M110 150 q30 -70 60 -30 q-20 0 -15 20 q30 10 60 -10" />
    <text x="170" y="40" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="26" fill={BIANCO} stroke="none">LA MER</text>
    <Testo x={170} y={70} size={18}>Debussy · 1905</Testo>
  </g>
);

const Cento = () => (
  <g>
    <text x="170" y="140" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="130" fill={ACC}>100</text>
    <Testo x={170} y={190}>anni, secondo Hokusai</Testo>
  </g>
);

// ---------------------------------------------------------------- scene

const ColpoDOcchio: React.FC<SceneProps> = ({ t, cues }) => {
  const chiavi = [{ t: 0, v: { x: 0.78, y: 0.6, h: 0.85 } }, { t: cues[1], v: { x: 0.62, y: 0.64, h: 0.72 } }, { t: 9, v: { x: 0.4, y: 0.45, h: 0.95 } }];
  const { at, px } = camera(chiavi, t);
  return (
    <Quadro opera={OPERA} t={t} chiavi={chiavi}
      sopra={
        <Annotazioni>
          <Richiamo t={t} da={0.6} a={cues[1] - 0.2} to={at(P.rematori)} lab={{ x: 460, y: 1120 }} kicker="Le barche" sub="sotto l'onda" accento={ACC} />
          <Anello t={t} da={cues[1]} a={cues[2] - 0.2} c={at(P.fuji)} r={px(0.07)} />
          <Richiamo t={t} da={cues[1] + 0.3} a={cues[2] - 0.2} to={add(at(P.fuji), 0, px(0.07))} lab={{ x: 420, y: 1130 }} kicker="Il monte Fuji" sub="piccolissimo" accento={ACC} punto={false} />
          <Richiamo t={t} da={cues[2]} to={at(P.artigli)} lab={{ x: 640, y: 1120 }} kicker="L'onda" sub="pronta a ricadere" accento={ACC} />
        </Annotazioni>
      }
    />
  );
};

const Hokusai: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const chiavi = [{ t: 0, v: { x: 0.25, y: 0.32, h: 0.7 } }, { t: cues[2], v: { x: 0.12, y: 0.26, h: 0.42 } }, { t: dur, v: { x: 0.1, y: 0.27, h: 0.36 } }];
  const { at } = camera(chiavi, t);
  return (
    <Quadro opera={OPERA} t={t} chiavi={chiavi}
      sopra={
        <Annotazioni>
          <Richiamo t={t} da={0.6} a={cues[1] - 0.2} to={at(P.cartiglio)} lab={{ x: 560, y: 1100 }} kicker="Il titolo" sub="Trentasei vedute del Fuji" accento={ACC} />
          <Riquadro t={t} da={cues[1]} a={cues[2] - 0.2} at={{ x: 680, y: 1000 }} titolo="Una vita, molti nomi" nota="uno per ogni fase" accento={ACC}>
            <Nomi />
          </Riquadro>
          <Richiamo t={t} da={cues[2]} to={at(P.firma)} lab={{ x: 560, y: 1110 }} kicker="La firma" sub="«già Hokusai, ora Iitsu»" accento={ACC} />
        </Annotazioni>
      }
    />
  );
};

const Serie: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const chiavi = [{ t: 0, v: { x: 0.55, y: 0.55, h: 1.3 } }, { t: cues[2], v: { x: 0.62, y: 0.66, h: 0.75 } }, { t: dur, v: { x: 0.63, y: 0.68, h: 0.62 } }];
  const { at, px } = camera(chiavi, t);
  return (
    <Quadro opera={OPERA} t={t} chiavi={chiavi}
      sopra={
        <Annotazioni>
          <Riquadro t={t} da={0.6} a={cues[2] - 0.3} at={{ x: 540, y: 1060 }} titolo="Trentasei vedute" nota="una montagna, tanti paesaggi" accento={ACC} w={420} h={320}>
            <g transform="translate(10 0)"><Vedute /></g>
          </Riquadro>
          <Anello t={t} da={cues[2]} c={at(P.fuji)} r={px(0.07)} />
          <Richiamo t={t} da={cues[2] + 0.3} to={add(at(P.fuji), px(0.05), px(0.05))} lab={{ x: 720, y: 1120 }} kicker="Il Fuji" sub="schiacciato dall'onda" accento={ACC} punto={false} />
        </Annotazioni>
      }
    />
  );
};

const DueMontagne: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const chiavi = [{ t: 0, v: { x: 0.48, y: 0.64, h: 0.75 } }, { t: dur, v: { x: 0.5, y: 0.66, h: 0.62 } }];
  const { at } = camera(chiavi, t);
  return (
    <Quadro opera={OPERA} t={t} chiavi={chiavi}
      sopra={
        <Annotazioni>
          <Richiamo t={t} da={0.5} a={cues[2] - 0.2} to={at(P.ondaPiccola)} lab={{ x: 140, y: 1010 }} kicker="L'onda piccola" sub="in primo piano" accento={ACC} />
          <Richiamo t={t} da={1.2} a={cues[2] - 0.2} to={add(at(P.fuji), 0, -8)} lab={{ x: 940, y: 1180 }} kicker="Il Fuji" sub="sullo sfondo" accento={ACC} />
          <Riquadro t={t} da={cues[2]} at={{ x: 540, y: 1060 }} titolo="Due sagome" nota="la stessa forma, la stessa neve" accento={ACC}>
            <DueSagome />
          </Riquadro>
        </Annotazioni>
      }
    />
  );
};

const Barche: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const chiavi = [{ t: 0, v: { x: 0.8, y: 0.62, h: 0.62 } }, { t: cues[2], v: { x: 0.56, y: 0.8, h: 0.62 } }, { t: dur, v: { x: 0.4, y: 0.78, h: 0.7 } }];
  const { at } = camera(chiavi, t);
  return (
    <Quadro opera={OPERA} t={t} chiavi={chiavi}
      sopra={
        <Annotazioni>
          <Richiamo t={t} da={0.5} a={cues[1] - 0.2} to={at(P.barcaDestra)} lab={{ x: 380, y: 1120 }} kicker="Oshiokuri-bune" sub="barche per il pesce" accento={ACC} />
          <Riquadro t={t} da={cues[1]} a={cues[2] - 0.2} at={{ x: 540, y: 1040 }} titolo="Verso i mercati di Edo" nota="l'attuale Tokyo" accento={ACC}>
            <Barca />
          </Riquadro>
          <Richiamo t={t} da={cues[2]} to={at(P.barcaCentro)} lab={{ x: 300, y: 1130 }} kicker="I rematori" sub="chini sui remi" accento={ACC} />
        </Annotazioni>
      }
    />
  );
};

const Artigli: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const chiavi = [{ t: 0, v: { x: 0.5, y: 0.3, h: 0.62 } }, { t: dur, v: { x: 0.55, y: 0.31, h: 0.4 } }];
  const { at } = camera(chiavi, t);
  return (
    <Quadro opera={OPERA} t={t} chiavi={chiavi}
      sopra={
        <Annotazioni>
          <Richiamo t={t} da={0.5} a={cues[2] - 0.2} to={at(P.artigli)} lab={{ x: 340, y: 1130 }} kicker="Dita di schiuma" sub="come artigli" accento={ACC} />
          <Riquadro t={t} da={cues[2]} at={{ x: 540, y: 1060 }} titolo="Riccioli nei riccioli" nota="forme dentro forme" accento={ACC}>
            <Riccioli />
          </Riquadro>
        </Annotazioni>
      }
    />
  );
};

const NonTsunami: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const chiavi = [{ t: 0, v: { x: 0.42, y: 0.5, h: 1.15 } }, { t: dur, v: { x: 0.42, y: 0.46, h: 1.0 } }];
  return (
    <Quadro opera={OPERA} t={t} chiavi={chiavi}
      sopra={
        <Annotazioni>
          <Riquadro t={t} da={cues[1]} at={{ x: 540, y: 1060 }} titolo="Due onde diverse" accento={ACC} w={440} h={300}>
            <g transform="translate(20 10)"><Tsunami /></g>
          </Riquadro>
        </Annotazioni>
      }
    />
  );
};

const Blu: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const chiavi = [{ t: 0, v: { x: 0.33, y: 0.48, h: 0.55 } }, { t: dur, v: { x: 0.3, y: 0.45, h: 0.4 } }];
  const { at } = camera(chiavi, t);
  return (
    <Quadro opera={OPERA} t={t} chiavi={chiavi}
      sopra={
        <Annotazioni>
          <Richiamo t={t} da={0.5} a={cues[2] - 0.2} to={at(P.corpoOnda)} lab={{ x: 560, y: 1120 }} kicker="Blu di Prussia" sub="nato a Berlino" accento={ACC} />
          <Riquadro t={t} da={cues[2]} at={{ x: 540, y: 1060 }} titolo="Due blu" nota="più stabile alla luce" accento={ACC}>
            <DueBlu />
          </Riquadro>
        </Annotazioni>
      }
    />
  );
};

const Stampa: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const chiavi = [{ t: 0, v: intera(OPERA, 0.5, 0.5) }, { t: dur, v: { ...intera(OPERA, 0.5, 0.48), h: 2.3 } }];
  return (
    <Quadro opera={OPERA} t={t} chiavi={chiavi}
      sopra={
        <Annotazioni>
          <Riquadro t={t} da={cues[1]} a={cues[2] - 0.2} at={{ x: 540, y: 1100 }} titolo="Xilografia" accento={ACC}>
            <Blocchi />
          </Riquadro>
          <Riquadro t={t} da={cues[2]} at={{ x: 540, y: 1100 }} titolo="Migliaia di copie" nota="vendute a poco prezzo" accento={ACC}>
            <Copie />
          </Riquadro>
        </Annotazioni>
      }
    />
  );
};

const Europa: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const chiavi = [{ t: 0, v: { ...intera(OPERA, 0.5, 0.48), h: 2.3 } }, { t: dur, v: { x: 0.5, y: 0.5, h: 3.4 } }];
  return (
    <Quadro opera={OPERA} t={t} fondo={0.7} chiavi={chiavi}
      sopra={
        <Annotazioni>
          <Riquadro t={t} da={cues[1]} a={cues[2] + 1} at={{ x: 540, y: 1100 }} titolo="Verso l'Europa" nota="dalla metà dell'Ottocento" accento={ACC}>
            <Viaggio />
          </Riquadro>
          <Riquadro t={t} da={cues[2] + 1.2} at={{ x: 540, y: 1100 }} titolo="Debussy" nota="l'onda sulla copertina" accento={ACC}>
            <LaMer />
          </Riquadro>
        </Annotazioni>
      }
    />
  );
};

const Oggi: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const chiavi = [{ t: 0, v: { x: 0.5, y: 0.6, h: 4.5 } }, { t: cues[1], v: { x: 0.5, y: 0.5, h: 3.2 } }, { t: dur, v: intera(OPERA, 0.5, 0.45) }];
  return (
    <Quadro opera={OPERA} t={t} fondo={0.75} chiavi={chiavi}
      sopra={
        <>
          <AbsoluteFill style={{ background: '#0E1A2E', opacity: 0.25 * seg(t, cues[3], dur) }} />
          <Annotazioni>
            <Riquadro t={t} da={cues[1]} a={cues[3] - 0.2} at={{ x: 540, y: 1100 }} titolo="Il traguardo" accento={ACC}>
              <Cento />
            </Riquadro>
          </Annotazioni>
        </>
      }
    />
  );
};

// Scene per id del capitolo (quadri/grande-onda.json).
export const GRANDE_ONDA_SCENES: Record<string, SceneDef> = {
  'colpo-d-occhio': { Component: ColpoDOcchio, title: { top: 400, size: 96 } },
  hokusai: { Component: Hokusai, title: { top: 400, size: 92 } },
  serie: { Component: Serie, title: { top: 400, size: 96 } },
  'due-montagne': { Component: DueMontagne, title: { top: 400, size: 104 } },
  barche: { Component: Barche, title: { top: 400, size: 92 } },
  artigli: { Component: Artigli, title: { top: 400, size: 92 } },
  tsunami: { Component: NonTsunami, title: { top: 400, size: 96 } },
  blu: { Component: Blu, title: { top: 400, size: 88 } },
  stampa: { Component: Stampa, title: { top: 400, size: 96 } },
  europa: { Component: Europa, title: { top: 400, size: 96 } },
  oggi: { Component: Oggi, title: { top: 400, size: 92 } },
};

export const Copertina = copertinaQuadro(OPERA, { x: 0.55, y: 0.32, h: 0.55 }, { x: 0.53, y: 0.33, h: 0.48 });
export const Finale = finaleQuadro(OPERA);
