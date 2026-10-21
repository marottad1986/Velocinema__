import React from 'react';
import { AbsoluteFill } from 'remotion';
import { eo, lerp, seg } from '../../lib/anim';
import { HAND, SANS } from '../../lib/fonts';
import { Alone, LuceRadente, OmbraSbarre, Quadro, Riflettore, Vortice, type Opera } from '../../lib/quadro';
import type { SceneDef, SceneProps } from '../../types';
import { copertinaQuadro, finaleQuadro, intera } from '../quadri/Locandina';

// Notte stellata (quadri/notte-stellata.json): scansione Google Art Project da Wikimedia Commons
// (miniatura ufficiale da 3840 px), salvata in public/quadri/notte-stellata/originale.jpg.

export const OPERA: Opera = { src: 'quadri/notte-stellata/originale.jpg', aspect: 3840 / 3041 };
const A = OPERA.aspect;

// Punti dell'opera in frazioni (x da sinistra, y dall'alto), letti sull'immagine.
const P = {
  luna: { x: 0.898, y: 0.178 },
  venere: { x: 0.344, y: 0.513 },
  vortice: { x: 0.48, y: 0.33 },
  vortice2: { x: 0.67, y: 0.48 },
  campanile: { x: 0.564, y: 0.66 },
  villaggio: { x: 0.66, y: 0.84 },
  colline: { x: 0.6, y: 0.64 },
  cipressoBase: { x: 0.25, y: 0.82 },
  cipressoPunta: { x: 0.2, y: 0.08 },
  stelle: [
    { x: 0.234, y: 0.03 }, { x: 0.344, y: 0.04 }, { x: 0.414, y: 0.07 }, { x: 0.61, y: 0.09 }, { x: 0.234, y: 0.17 },
    { x: 0.70, y: 0.23 }, { x: 0.33, y: 0.33 }, { x: 0.13, y: 0.48 }, { x: 0.047, y: 0.45 },
  ],
  finestre: [
    { x: 0.756, y: 0.873 }, { x: 0.785, y: 0.868 }, { x: 0.83, y: 0.907 }, { x: 0.69, y: 0.9 }, { x: 0.648, y: 0.857 }, { x: 0.55, y: 0.87 },
  ],
};

const Stelle: React.FC<{ t: number; forza?: number }> = ({ t, forza = 0.4 }) => (
  <>
    {P.stelle.map((s, i) => <Alone key={i} aspect={A} t={t} {...s} r={0.045} forza={forza} periodo={2 + (i % 3) * 0.5} fase={i * 0.7} />)}
    <Alone aspect={A} t={t} {...P.luna} r={0.11} forza={forza * 1.1} periodo={3.2} />
  </>
);

const ColpoDOcchio: React.FC<SceneProps> = ({ t, dur }) => (
  <Quadro opera={OPERA} t={t} chiavi={[{ t: 0, v: { x: 0.27, y: 0.48, h: 1 } }, { t: dur, v: { x: 0.74, y: 0.45, h: 1 } }]}>
    <Stelle t={t} />
  </Quadro>
);

/** Mappa disegnata (stile dei film) sopra l'opera sfocata: Arles → Saint-Rémy. */
const Arles: React.FC<SceneProps> = ({ t, dur, palette: C, cues }) => {
  const K = '#141414';
  const map = eo(seg(t, 0.2, 1.0));
  const route = seg(t, cues[1] ?? 3, (cues[1] ?? 3) + 2.5);
  const letter = eo(seg(t, cues[2] ?? 5, (cues[2] ?? 5) + 0.8));
  return (
    <Quadro opera={OPERA} t={t} chiavi={[{ t: 0, v: { x: 0.5, y: 0.5, h: 0.6 } }, { t: dur, v: { x: 0.55, y: 0.5, h: 0.5 } }]}
      fondo={0.7}
      sopra={
        <AbsoluteFill style={{ background: 'rgba(0,0,0,.45)' }}>
          <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ opacity: map, transform: `translateY(${lerp(30, 0, map)}px) rotate(-2deg)` }}>
            <g transform="translate(54 130) scale(0.9)">
              <rect x="110" y="560" width="860" height="700" rx="18" fill={C.chiaro} stroke={K} strokeWidth="8" />
            {/* Mare e foce del Rodano, schematici */}
            <path d="M114 1120 Q300 1090 420 1150 Q560 1210 700 1160 Q840 1110 966 1150 V1256 H114 Z" fill="#7FA7C9" stroke={K} strokeWidth="6" />
            <path d="M540 680 Q510 790 470 880 Q430 980 450 1150" fill="none" stroke="#7FA7C9" strokeWidth="18" strokeLinecap="round" />
            <path d="M540 680 Q510 790 470 880 Q430 980 450 1150" fill="none" stroke={K} strokeWidth="4" opacity=".35" />
            {/* Percorso tratteggiato Arles → Saint-Rémy */}
            <path d="M440 940 Q560 860 700 800" fill="none" stroke={C.principale} strokeWidth="9" strokeLinecap="round"
              pathLength={1} style={{ strokeDasharray: `${route} 1` }} />
            <circle cx="440" cy="940" r="20" fill={C.accento} stroke={K} strokeWidth="6" />
            <circle cx="700" cy="800" r="20" fill={route > 0.98 ? C.accento : C.chiaro} stroke={K} strokeWidth="6" />
            <text x="250" y="1010" fontFamily={SANS} fontWeight={800} fontSize="44" fill={K}>Arles</text>
            <text x="620" y="760" fontFamily={SANS} fontWeight={800} fontSize="44" fill={K}>Saint-Rémy</text>
            <text x="150" y="630" fontFamily={SANS} fontWeight={800} fontSize="30" letterSpacing="4" fill={K} opacity=".6">PROVENZA · 1888–1889</text>
            {/* Lettera firmata */}
            <g opacity={letter} transform={`translate(640 ${lerp(1010, 980, letter)}) rotate(6)`}>
              <rect width="300" height="200" rx="6" fill="#FBF6E8" stroke={K} strokeWidth="6" />
              {[0, 1, 2, 3].map((i) => <path key={i} d={`M28 ${40 + i * 30} H${250 - (i % 2) * 50}`} stroke="#9A8E78" strokeWidth="5" strokeLinecap="round" />)}
              <text x="160" y="180" fontFamily={HAND} fontWeight={700} fontSize="44" fill="#2E4F8C">Vincent</text>
            </g>
            </g>
          </svg>
        </AbsoluteFill>
      }
    />
  );
};

const Ospedale: React.FC<SceneProps> = ({ t, dur, cues }) => (
  <Quadro opera={OPERA} t={t} chiavi={[{ t: 0, v: { x: 0.6, y: 0.62, h: 0.9 } }, { t: dur, v: { x: 0.64, y: 0.8, h: 0.45 } }]}>
    {P.finestre.map((f, i) => (
      <Alone key={i} aspect={A} t={t} {...f} r={0.025} forza={0.55} color="255,214,110" periodo={1.8} fase={i} da={(cues[1] ?? 2) + i * 0.6} />
    ))}
  </Quadro>
);

const Finestra: React.FC<SceneProps> = ({ t, dur, cues }) => (
  <Quadro opera={OPERA} t={t} chiavi={[{ t: 0, v: { x: 0.5, y: P.colline.y, h: 0.7 } }, { t: dur, v: { x: 0.68, y: P.colline.y - 0.04, h: 0.62 } }]}
    sopra={<OmbraSbarre t={t} da={(cues[2] ?? 6) - 0.5} a={(cues[2] ?? 6) + 2.5} />}>
    <Stelle t={t} forza={0.3} />
  </Quadro>
);

const Villaggio: React.FC<SceneProps> = ({ t, dur, cues }) => (
  <Quadro opera={OPERA} t={t} chiavi={[{ t: 0, v: { x: 0.62, y: 0.74, h: 0.8 } }, { t: (cues[1] ?? 3) + 0.5, v: { ...P.campanile, h: 0.36 } }, { t: dur, v: { ...P.campanile, h: 0.3 } }]}>
    <Riflettore aspect={A} t={t} x={P.campanile.x} y={P.campanile.y + 0.02} r={0.08} da={cues[1] ?? 3} />
    <Alone aspect={A} t={t} x={P.campanile.x} y={P.campanile.y - 0.03} r={0.05} forza={0.35} da={cues[1] ?? 3} />
  </Quadro>
);

const Cipresso: React.FC<SceneProps> = ({ t, dur, cues }) => (
  <Quadro opera={OPERA} t={t} chiavi={[{ t: 0, v: { ...P.cipressoBase, h: 0.55 } }, { t: dur - 1, v: { ...P.cipressoPunta, y: P.cipressoPunta.y + 0.18, h: 0.5 } }]}>
    <Riflettore aspect={A} t={t} x={P.cipressoPunta.x + 0.01} y={P.cipressoPunta.y + 0.2} r={0.24} buio={0.45} da={cues[2] ?? 6} />
  </Quadro>
);

const Venere: React.FC<SceneProps> = ({ t, dur, cues }) => (
  <Quadro opera={OPERA} t={t} chiavi={[{ t: 0, v: { x: 0.36, y: 0.42, h: 0.85 } }, { t: dur, v: { ...P.venere, h: 0.36 } }]}>
    <Alone aspect={A} t={t} {...P.venere} r={0.12} forza={0.7} periodo={1.6} da={cues[1] ?? 3} />
    <Riflettore aspect={A} t={t} {...P.venere} r={0.13} buio={0.4} da={cues[2] ?? 5} />
  </Quadro>
);

const Vortici: React.FC<SceneProps> = ({ t, dur }) => (
  <Quadro opera={OPERA} t={t} chiavi={[{ t: 0, v: { ...P.vortice, h: 0.9 } }, { t: dur, v: { ...P.vortice, h: 0.5 } }]}>
    <Vortice aspect={A} t={t} {...P.vortice} r={0.16} giri={0.1} forza={0.4} da={0.5} />
    <Vortice aspect={A} t={t} {...P.vortice2} r={0.09} giri={0.12} forza={0.3} da={2} verso={-1} />
  </Quadro>
);

const Tecnica: React.FC<SceneProps> = ({ t, dur }) => (
  <Quadro opera={OPERA} t={t} chiavi={[{ t: 0, v: { ...P.luna, x: P.luna.x - 0.03, h: 0.32 } }, { t: dur, v: { ...P.luna, h: 0.22 } }]}>
    <LuceRadente aspect={A} t={t} {...P.luna} r={0.14} da={0.8} a={dur - 1} />
  </Quadro>
);

const Fallimento: React.FC<SceneProps> = ({ t, dur }) => (
  <Quadro opera={OPERA} t={t} chiavi={[{ t: 0, v: { x: 0.45, y: 0.4, h: 0.5 } }, { t: dur, v: intera(OPERA, 0.5, 0.45) }]}
    sopra={<AbsoluteFill style={{ background: '#0B1530', opacity: 0.25 * seg(t, 1, dur - 2) }} />} />
);

const Oggi: React.FC<SceneProps> = ({ t, dur }) => (
  <Quadro opera={OPERA} t={t} fondo={0.75} chiavi={[{ t: 0, v: intera(OPERA, 0.5, 0.45) }, { t: 0.5, v: { x: 0.5, y: 0.45, h: 4.5 } }, { t: dur, v: { x: 0.5, y: 0.45, h: 2 } }]}>
    <Stelle t={t} forza={0.3} />
  </Quadro>
);

// Scene per id del capitolo (quadri/notte-stellata.json).
export const NOTTE_STELLATA_SCENES: Record<string, SceneDef> = {
  'colpo-d-occhio': { Component: ColpoDOcchio, title: { top: 400, size: 104 } },
  arles: { Component: Arles, title: { top: 400, size: 96 } },
  ospedale: { Component: Ospedale, title: { top: 400, size: 96 } },
  finestra: { Component: Finestra, title: { top: 400, size: 88 } },
  villaggio: { Component: Villaggio, title: { top: 400, size: 96 } },
  cipresso: { Component: Cipresso, title: { top: 400, size: 104, width: 600 } },
  venere: { Component: Venere, title: { top: 400, size: 96 } },
  vortici: { Component: Vortici, title: { top: 400, size: 104 } },
  tecnica: { Component: Tecnica, title: { top: 400, size: 104 } },
  fallimento: { Component: Fallimento, title: { top: 400, size: 96 } },
  oggi: { Component: Oggi, title: { top: 400, size: 104 } },
};

export const Copertina = copertinaQuadro(OPERA, { ...P.luna, x: P.luna.x - 0.2, y: P.luna.y + 0.15, h: 1.2 });
export const Finale = finaleQuadro(OPERA);
