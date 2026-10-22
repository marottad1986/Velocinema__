import React from 'react';
import { AbsoluteFill } from 'remotion';
import { eo, seg } from '../../lib/anim';
import { SANS } from '../../lib/fonts';
import { LuceRadente, OmbraSbarre, Quadro, inquadra, type Chiave, type Opera } from '../../lib/quadro';
import { Anello, Annotazioni, BIANCO, LINEA, Richiamo, Riquadro, Spirale, type Pt } from '../../lib/annotazioni';
import type { SceneDef, SceneProps } from '../../types';
import { copertinaQuadro, finaleQuadro, intera } from '../quadri/Locandina';

// Notte stellata (quadri/notte-stellata.json): scansione Google Art Project da Wikimedia Commons
// (miniatura ufficiale da 3840 px), salvata in public/quadri/notte-stellata/originale.jpg.
// Ogni scena: camera con fotogrammi chiave sulle frasi (cues) + annotazioni editoriali (src/lib/annotazioni.tsx).

export const OPERA: Opera = { src: 'quadri/notte-stellata/originale.jpg', aspect: 3840 / 3041 };
const ACC = '#F2C94C';

// Punti dell'opera in frazioni (x da sinistra, y dall'alto), letti sull'immagine.
const P = {
  luna: { x: 0.898, y: 0.178 },
  venere: { x: 0.344, y: 0.513 },
  vortice: { x: 0.48, y: 0.33 },
  vortice2: { x: 0.67, y: 0.48 },
  campanile: { x: 0.564, y: 0.65 },
  villaggio: { x: 0.68, y: 0.85 },
  colline: { x: 0.62, y: 0.6 },
  cipresso: [{ x: 0.27, y: 0.95 }, { x: 0.245, y: 0.62 }, { x: 0.215, y: 0.32 }, { x: 0.195, y: 0.07 }],
  stelle: [{ x: 0.234, y: 0.17 }, { x: 0.7, y: 0.23 }],
};

const camera = (chiavi: Chiave[], t: number) => inquadra(OPERA, chiavi, t);
const add = (p: Pt, dx: number, dy: number): Pt => ({ x: p.x + dx, y: p.y + dy });

// ---------------------------------------------------------------- disegni a linea per i riquadri (≈ 340×200)

const Testo: React.FC<{ x: number; y: number; children: React.ReactNode; size?: number; anchor?: 'start' | 'middle' | 'end'; bold?: boolean }> = ({ x, y, children, size = 24, anchor = 'middle', bold }) => (
  <text x={x} y={y} textAnchor={anchor} fontFamily={SANS} fontWeight={bold ? 800 : 400} fontSize={size} fill={BIANCO} stroke="none">{children}</text>
);

const Clinica = () => (
  <g {...LINEA}>
    <path d="M30 80 L170 30 L310 80" />
    <path d="M45 80 V200 H295 V80" />
    {[75, 150, 225].map((x) => (
      <g key={x}>
        <path d={`M${x} 160 V120 a20 20 0 0 1 40 0 V160 Z`} />
        <path d={`M${x + 13} 104 V160 M${x + 27} 104 V160`} strokeWidth={2} />
      </g>
    ))}
    <path d="M150 200 v-22 a20 20 0 0 1 40 0 v22" />
  </g>
);

const Tele = () => (
  <g>
    {[0, 1, 2].map((i) => <rect key={i} x={30 + i * 22} y={60 - i * 18} width="120" height="90" {...LINEA} transform={`rotate(${-4 + i * 4} ${90 + i * 22} ${105 - i * 18})`} />)}
    <text x="250" y="130" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="96" fill={ACC}>150</text>
    <Testo x={250} y={170}>quadri</Testo>
  </g>
);

const Notte = () => (
  <g {...LINEA}>
    <rect x="30" y="20" width="150" height="160" />
    <path d="M80 20 V180 M130 20 V180" strokeWidth={2} />
    <path d="M118 60 a26 26 0 1 0 18 46 a21 21 0 1 1 -18 -46 Z" />
    <path d="M230 60 h70 M230 100 h70 M230 140 h40" strokeWidth={2} opacity={0.6} />
    <path d="M220 40 L310 170 M310 40 L220 170" stroke={ACC} />
  </g>
);

const Memoria = () => (
  <g {...LINEA}>
    <circle cx="70" cy="90" r="34" />
    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
      const a = (i * Math.PI) / 4;
      return <path key={i} d={`M${70 + 44 * Math.cos(a)} ${90 + 44 * Math.sin(a)} L${70 + 56 * Math.cos(a)} ${90 + 56 * Math.sin(a)}`} />;
    })}
    <path d="M150 90 h50 l-12 -10 M200 90 l-12 10" />
    <rect x="220" y="30" width="100" height="120" />
    <path d="M232 120 q20 -40 40 -10 t36 -30" strokeWidth={2} />
    <Testo x={70} y={190}>di giorno</Testo>
    <Testo x={270} y={190}>sulla tela</Testo>
  </g>
);

const Chiese = () => (
  <g {...LINEA}>
    <path d="M85 10 L108 110 H62 Z M62 110 h46 v70 h-46 Z M62 130 L32 148 V180 H62" />
    <path d="M80 140 h12 v20 h-12 Z" />
    <path d="M220 100 h80 v80 h-80 Z M235 100 V62 h50 V100 M252 100 v-20 a8 8 0 0 1 16 0 v20" />
    <path d="M165 20 V190" strokeDasharray="4 10" strokeWidth={2} />
    <Testo x={75} y={215}>a punta</Testo>
    <Testo x={262} y={215}>a vela</Testo>
  </g>
);

const Provenza = () => (
  <g {...LINEA}>
    <path d="M0 180 H340" />
    <path d="M30 180 V120 H220 V180" strokeWidth={2} opacity={0.7} />
    {[80, 150, 270].map((x, i) => <path key={x} d={`M${x} 180 q-26 -40 -10 -90 q4 -40 10 -70 q8 30 10 70 q16 50 -10 90`} strokeWidth={i === 2 ? 3 : 2.5} />)}
    <path d="M200 120 v-26 M188 104 h24" strokeWidth={2} />
  </g>
);

const Lettera = () => (
  <g {...LINEA}>
    <rect x="30" y="20" width="280" height="150" />
    <path d="M30 20 L170 110 L310 20" />
    <Testo x={170} y={210} size={24}>«la stella del mattino, grandissima»</Testo>
  </g>
);

const Pianeti = () => (
  <g {...LINEA}>
    <circle cx="60" cy="100" r="30" />
    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
      const a = (i * Math.PI) / 4;
      return <path key={i} d={`M${60 + 40 * Math.cos(a)} ${100 + 40 * Math.sin(a)} L${60 + 50 * Math.cos(a)} ${100 + 50 * Math.sin(a)}`} />;
    })}
    <path d="M60 10 A90 90 0 0 1 60 190" strokeDasharray="3 9" strokeWidth={2} />
    <circle cx="140" cy="68" r="11" fill={BIANCO} />
    <circle cx="275" cy="100" r="20" />
    <Testo x={60} y={175}>Sole</Testo>
    <Testo x={150} y={45}>Venere</Testo>
    <Testo x={275} y={150}>Terra</Testo>
  </g>
);

const spirale = (cx: number, cy: number, r: number, giri = 2.2) => {
  let d = '';
  for (let i = 0; i <= 60; i++) {
    const u = i / 60, a = u * giri * Math.PI * 2, rr = r * (1 - u * 0.85);
    d += `${i ? 'L' : 'M'}${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a) * 0.8).toFixed(1)} `;
  }
  return d;
};
const Turbolenza = () => (
  <g {...LINEA}>
    <path d="M0 20 Q85 -10 170 20 T340 20 M0 190 Q85 220 170 190 T340 190" strokeWidth={2} />
    <path d={spirale(110, 105, 70)} />
    <path d={spirale(225, 95, 42)} />
    <path d={spirale(285, 150, 20, 1.6)} />
    <path d={spirale(50, 160, 18, 1.6)} />
  </g>
);

const Impasto = () => (
  <g {...LINEA}>
    <path d="M0 160 H340" />
    <path d="M10 160 q20 -70 40 0 q15 -50 35 0 q25 -90 45 0 q15 -40 30 0 q20 -80 45 0 q15 -55 35 0 q20 -70 40 0 q10 -30 30 0" />
    <path d="M40 40 L110 90 M80 30 L140 75" stroke={ACC} />
    <Testo x={170} y={200}>sezione della pittura</Testo>
  </g>
);

const Colori = () => (
  <g>
    {[['#2A3FA0', 'oltremare'], ['#2F6FD1', 'cobalto'], ['#F4C430', 'giallo']].map(([c, n], i) => (
      <g key={n} transform={`translate(${20 + i * 110} 10)`}>
        <rect width="80" height="130" rx="8" fill={c} stroke={BIANCO} strokeWidth="2" />
        <Testo x={40} y={175}>{n}</Testo>
      </g>
    ))}
  </g>
);

const Museo = () => (
  <g {...LINEA}>
    <rect x="30" y="60" width="280" height="130" />
    {[0, 1, 2, 3].map((i) => <rect key={i} x={50 + i * 66} y="80" width="44" height="44" strokeWidth={2} />)}
    <rect x="140" y="140" width="60" height="50" />
    <text x="170" y="40" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="34" letterSpacing="8" fill={BIANCO} stroke="none">MoMA</text>
  </g>
);

// ---------------------------------------------------------------- scene

const ColpoDOcchio: React.FC<SceneProps> = ({ t, cues }) => {
  const chiavi = [{ t: 0, v: { x: 0.3, y: 0.5, h: 1 } }, { t: cues[1], v: { x: 0.48, y: 0.44, h: 0.85 } }, { t: 9, v: { x: 0.72, y: 0.45, h: 0.95 } }];
  const { at, px } = camera(chiavi, t);
  return (
    <Quadro opera={OPERA} t={t} chiavi={chiavi}
      sopra={
        <Annotazioni>
          <Richiamo t={t} da={0.6} a={cues[1] - 0.2} to={at(P.cipresso[1])} lab={{ x: 520, y: 1100 }} kicker="Il cipresso" sub="in primo piano" accento={ACC} />
          <Spirale t={t} da={cues[1]} a={cues[2] + 1.2} c={at(P.vortice)} r={px(0.09)} />
          <Richiamo t={t} da={cues[2]} to={add(at(P.luna), -px(0.05), px(0.04))} lab={{ x: 700, y: 1100 }} kicker="La luna" sub="e undici stelle" accento={ACC} />
        </Annotazioni>
      }
    />
  );
};

/** Mappa a linea bianca in un riquadro scuro sopra l'opera sfocata: Arles, poi la strada per Saint-Rémy. */
const Arles: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const map = eo(seg(t, 0.2, 0.9));
  const route = eo(seg(t, dur - 1.8, dur - 0.5));
  const anno = eo(seg(t, cues[1], cues[1] + 0.6));
  const A = { x: 440, y: 1000 }, S = { x: 730, y: 850 };
  return (
    <Quadro opera={OPERA} t={t} fondo={0.75} chiavi={[{ t: 0, v: { x: 0.5, y: 0.5, h: 0.6 } }, { t: dur, v: { x: 0.56, y: 0.5, h: 0.48 } }]}
      sopra={
        <AbsoluteFill style={{ background: 'rgba(0,0,0,.4)' }}>
          <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ opacity: map, transform: `translateY(${(1 - map) * 24}px)` }}>
            <rect x="130" y="660" width="820" height="560" rx="24" fill="#0A1020" fillOpacity=".86" stroke={BIANCO} strokeOpacity=".25" strokeWidth="2" />
            <text x="170" y="720" fontFamily={SANS} fontWeight={800} fontSize="26" letterSpacing="5" fill={ACC}>SUD DELLA FRANCIA</text>
            <path d="M134 1120 Q300 1090 420 1140 Q560 1190 700 1140 Q840 1100 946 1130" fill="none" stroke={BIANCO} strokeWidth="3" />
            <text x="760" y="1185" fontFamily={SANS} fontSize="26" fill={BIANCO} opacity=".6">Mediterraneo</text>
            <path d="M520 664 Q490 800 460 900 Q430 1000 445 1130" fill="none" stroke={BIANCO} strokeWidth="3" strokeDasharray="2 10" strokeLinecap="round" />
            <text x="530" y="780" fontFamily={SANS} fontSize="26" fill={BIANCO} opacity=".6">Rodano</text>
            <path d={`M${A.x} ${A.y} Q600 880 ${S.x} ${S.y}`} fill="none" stroke={ACC} strokeWidth="4" pathLength={1} strokeDasharray={`${route} 1`} />
            <circle cx={A.x} cy={A.y} r="12" fill={ACC} />
            <text x={A.x - 30} y={A.y + 10} textAnchor="end" fontFamily={SANS} fontWeight={800} fontSize="44" fill={BIANCO}>Arles</text>
            <g opacity={0.4 + 0.6 * route}>
              <circle cx={S.x} cy={S.y} r="10" fill={route > 0.98 ? ACC : 'none'} stroke={ACC} strokeWidth="3" />
              <text x={S.x + 24} y={S.y + 10} fontFamily={SANS} fontWeight={800} fontSize="36" fill={BIANCO}>Saint-Rémy</text>
            </g>
            <g opacity={anno}>
              <rect x="170" y="760" width="150" height="56" rx="28" fill={ACC} />
              <text x="245" y="798" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="32" fill="#0B1530">1888</text>
            </g>
          </svg>
        </AbsoluteFill>
      }
    />
  );
};

const Ospedale: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const chiavi = [{ t: 0, v: { x: 0.6, y: 0.62, h: 0.9 } }, { t: cues[1], v: { x: 0.66, y: 0.76, h: 0.6 } }, { t: dur, v: { x: 0.62, y: 0.8, h: 0.5 } }];
  return (
    <Quadro opera={OPERA} t={t} chiavi={chiavi}
      sopra={
        <Annotazioni>
          <Riquadro t={t} da={cues[1] - 0.3} a={cues[2] - 0.3} at={{ x: 540, y: 960 }} titolo="Saint-Paul-de-Mausole" nota="la clinica di Saint-Rémy, dal maggio 1889" accento={ACC} w={560}>
            <g transform="translate(80 0)"><Clinica /></g>
          </Riquadro>
          <Riquadro t={t} da={cues[2]} at={{ x: 540, y: 960 }} titolo="In un anno" nota="circa 150 quadri a Saint-Rémy" accento={ACC} w={460}>
            <g transform="translate(20 0)"><Tele /></g>
          </Riquadro>
        </Annotazioni>
      }
    />
  );
};

const Finestra: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const chiavi = [{ t: 0, v: { x: 0.5, y: 0.62, h: 0.72 } }, { t: dur, v: { x: 0.66, y: 0.58, h: 0.6 } }];
  const { at } = camera(chiavi, t);
  return (
    <Quadro opera={OPERA} t={t} chiavi={chiavi}
      sopra={
        <>
          <OmbraSbarre t={t} da={0.2} a={cues[1] - 0.2} forza={0.5} />
          <Annotazioni>
            <Richiamo t={t} da={1.2} a={cues[1] - 0.2} to={at(P.colline)} lab={{ x: 300, y: 1130 }} kicker="Le Alpilles" sub="le colline di Saint-Rémy" accento={ACC} />
            <Riquadro t={t} da={cues[1] + 0.2} a={cues[2] - 0.2} at={{ x: 700, y: 980 }} titolo="Di notte" nota="niente luce per dipingere" accento={ACC}>
              <Notte />
            </Riquadro>
            <Riquadro t={t} da={cues[2]} at={{ x: 540, y: 980 }} titolo="A memoria" nota="quello che ha visto la notte" accento={ACC}>
              <Memoria />
            </Riquadro>
          </Annotazioni>
        </>
      }
    />
  );
};

const Villaggio: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const chiavi = [{ t: 0, v: { x: 0.64, y: 0.76, h: 0.75 } }, { t: cues[1], v: { x: 0.6, y: 0.71, h: 0.5 } }, { t: dur, v: { x: 0.58, y: 0.7, h: 0.42 } }];
  const { at, px } = camera(chiavi, t);
  return (
    <Quadro opera={OPERA} t={t} chiavi={chiavi}
      sopra={
        <Annotazioni>
          <Richiamo t={t} da={0.5} a={cues[1] - 0.2} to={at(P.villaggio)} lab={{ x: 380, y: 1150 }} kicker="Il paese" sub="aggiunto a memoria" accento={ACC} />
          <Richiamo t={t} da={cues[1] + 0.2} a={cues[2] - 0.8} to={at(P.campanile)} lab={add(at(P.campanile), 150, px(0.1))} kicker="Il campanile" sub="a punta, come in Olanda" accento={ACC} />
          <Riquadro t={t} da={cues[2] - 0.6} at={{ x: 300, y: 1060 }} titolo="Olanda · Provenza" accento={ACC} h={320}>
            <Chiese />
          </Riquadro>
        </Annotazioni>
      }
    />
  );
};

const Cipresso: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const chiavi = [{ t: 0, v: { x: 0.3, y: 0.78, h: 0.62 } }, { t: cues[1], v: { x: 0.28, y: 0.52, h: 0.72 } }, { t: dur, v: { x: 0.26, y: 0.32, h: 0.6 } }];
  const { at } = camera(chiavi, t);
  return (
    <Quadro opera={OPERA} t={t} chiavi={chiavi}
      sopra={
        <Annotazioni>
          <Richiamo t={t} da={0.6} a={cues[1] - 0.2} to={add(at(P.cipresso[1]), 20, 0)} lab={{ x: 560, y: 1120 }} kicker="Cipresso" sub="alto come una fiamma" accento={ACC} />
          <Richiamo t={t} da={cues[1]} a={cues[2] - 0.2} to={at({ x: 0.235, y: 0.45 })} lab={{ x: 600, y: 1120 }} kicker="Fino alle stelle" sub="unisce la terra e il cielo" accento={ACC} />
          <Riquadro t={t} da={cues[2]} at={{ x: 720, y: 1000 }} titolo="In Provenza" nota="l'albero dei cimiteri" accento={ACC}>
            <Provenza />
          </Riquadro>
        </Annotazioni>
      }
    />
  );
};

const Venere: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const chiavi = [{ t: 0, v: { x: 0.38, y: 0.46, h: 0.85 } }, { t: cues[1], v: { x: 0.37, y: 0.5, h: 0.6 } }, { t: dur, v: { x: 0.36, y: 0.5, h: 0.52 } }];
  const { at, px } = camera(chiavi, t);
  const ve = at(P.venere), r = px(0.08);
  return (
    <Quadro opera={OPERA} t={t} chiavi={chiavi}
      sopra={
        <Annotazioni>
          <Anello t={t} da={0.5} c={ve} r={r} />
          <Richiamo t={t} da={0.8} to={add(ve, r * 0.71, -r * 0.71)} lab={add(ve, r * 0.71 + 110, -r * 0.71 - 110)} kicker="Venere" sub="un pianeta" accento={ACC} punto={false} />
          <Riquadro t={t} da={cues[1]} a={cues[2] - 0.2} at={{ x: 720, y: 1060 }} titolo="Lettera a Theo · 1889" accento={ACC}>
            <Lettera />
          </Riquadro>
          <Riquadro t={t} da={cues[2]} at={{ x: 720, y: 1060 }} titolo="Sole · Venere · Terra" nota="visibile prima dell'alba" accento={ACC}>
            <Pianeti />
          </Riquadro>
        </Annotazioni>
      }
    />
  );
};

const Vortici: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const chiavi = [{ t: 0, v: { x: 0.5, y: 0.44, h: 0.9 } }, { t: cues[2], v: { x: 0.54, y: 0.42, h: 0.75 } }, { t: dur, v: { x: 0.52, y: 0.4, h: 0.68 } }];
  const { at, px } = camera(chiavi, t);
  const v1 = at(P.vortice), v2 = at(P.vortice2);
  return (
    <Quadro opera={OPERA} t={t} chiavi={chiavi}
      sopra={
        <Annotazioni>
          <Spirale t={t} da={0.4} c={v1} r={px(0.085)} />
          <Spirale t={t} da={0.9} c={v2} r={px(0.055)} verso={-1} />
          <Richiamo t={t} da={1.4} a={cues[3] - 0.2} to={add(v1, -px(0.085), 30)} lab={{ x: 220, y: 1120 }} kicker="Due spirali" sub="il cielo si avvolge" accento={ACC} />
          <Riquadro t={t} da={cues[3]} at={{ x: 720, y: 1060 }} titolo="Turbolenza" nota="vortici dentro vortici" accento={ACC}>
            <Turbolenza />
          </Riquadro>
        </Annotazioni>
      }
    />
  );
};

const Tecnica: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const chiavi = [{ t: 0, v: { x: P.luna.x - 0.05, y: P.luna.y + 0.03, h: 0.36 } }, { t: dur, v: { ...P.luna, h: 0.24 } }];
  const { at } = camera(chiavi, t);
  return (
    <Quadro opera={OPERA} t={t} chiavi={chiavi}
      sopra={
        <Annotazioni>
          <Richiamo t={t} da={0.6} a={cues[1] - 0.2} to={add(at(P.luna), -60, 60)} lab={{ x: 260, y: 1130 }} kicker="Impasto" sub="colore spesso, in rilievo" accento={ACC} />
          <Riquadro t={t} da={cues[1]} a={cues[2] - 0.2} at={{ x: 330, y: 1040 }} titolo="Impasto" accento={ACC} h={300}>
            <Impasto />
          </Riquadro>
          <Riquadro t={t} da={cues[2]} at={{ x: 330, y: 1040 }} titolo="La tavolozza" accento={ACC} h={300}>
            <Colori />
          </Riquadro>
        </Annotazioni>
      }>
      <LuceRadente aspect={OPERA.aspect} t={t} {...P.luna} r={0.14} da={0.6} a={dur - 1} />
    </Quadro>
  );
};

const Fallimento: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const chiavi = [{ t: 0, v: { x: 0.45, y: 0.4, h: 0.55 } }, { t: dur, v: intera(OPERA, 0.5, 0.45) }];
  const { at, px } = camera(chiavi, t);
  const fuori = cues[2] - 0.3;
  return (
    <Quadro opera={OPERA} t={t} chiavi={chiavi}
      sopra={
        <>
          <AbsoluteFill style={{ background: '#0B1530', opacity: 0.3 * seg(t, cues[2], cues[3]) }} />
          <Annotazioni>
            {[P.venere, ...P.stelle].map((s, i) => <Anello key={i} t={t} da={cues[1] + i * 0.25} a={fuori} c={at(s)} r={px(0.07)} />)}
            <Richiamo t={t} da={cues[1] + 0.8} a={fuori} to={add(at(P.venere), px(0.05), px(0.05))} lab={{ x: 560, y: 1130 }} kicker="Troppo grandi" sub="secondo Van Gogh" accento={ACC} punto={false} />
          </Annotazioni>
        </>
      }
    />
  );
};

const Oggi: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const chiavi = [{ t: 0, v: { x: 0.5, y: 0.6, h: 4.5 } }, { t: cues[2], v: { x: 0.5, y: 0.5, h: 3 } }, { t: dur, v: { x: 0.5, y: 0.45, h: 2 } }];
  return (
    <Quadro opera={OPERA} t={t} fondo={0.75} chiavi={chiavi}
      sopra={
        <Annotazioni>
          <Riquadro t={t} da={0.4} a={cues[2] - 0.2} at={{ x: 540, y: 1080 }} titolo="Museum of Modern Art" nota="New York, dal 1941" accento={ACC}>
            <Museo />
          </Riquadro>
        </Annotazioni>
      }
    />
  );
};

// Scene per id del capitolo (quadri/notte-stellata.json).
export const NOTTE_STELLATA_SCENES: Record<string, SceneDef> = {
  'colpo-d-occhio': { Component: ColpoDOcchio, title: { top: 400, size: 96 } },
  arles: { Component: Arles, title: { top: 400, size: 104 } },
  ospedale: { Component: Ospedale, title: { top: 400, size: 92 } },
  finestra: { Component: Finestra, title: { top: 400, size: 92 } },
  villaggio: { Component: Villaggio, title: { top: 400, size: 104 } },
  cipresso: { Component: Cipresso, title: { top: 400, size: 104 } },
  venere: { Component: Venere, title: { top: 400, size: 104 } },
  vortici: { Component: Vortici, title: { top: 400, size: 104 } },
  tecnica: { Component: Tecnica, title: { top: 400, size: 104 } },
  fallimento: { Component: Fallimento, title: { top: 400, size: 104 } },
  oggi: { Component: Oggi, title: { top: 400, size: 104 } },
};

export const Copertina = copertinaQuadro(OPERA, { x: 0.6, y: 0.33, h: 0.62 }, { x: 0.58, y: 0.34, h: 0.55 });
export const Finale = finaleQuadro(OPERA);
