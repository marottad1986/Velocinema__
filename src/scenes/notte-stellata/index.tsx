import React from 'react';
import { AbsoluteFill } from 'remotion';
import { eo, eob, seg } from '../../lib/anim';
import { HAND, SANS } from '../../lib/fonts';
import { LuceRadente, OmbraSbarre, Quadro, proietta, vistaAt, type Chiave, type Opera } from '../../lib/quadro';
import { CARTA, CHALK, Cerchio, Cuore, Freccia, FrecciaGiro, GIALLO, INK, Percorso, Scheda, Schizzi, Scintilla, Scritta, type Pt } from '../../lib/schizzi';
import type { SceneDef, SceneProps } from '../../types';
import { copertinaQuadro, finaleQuadro, intera } from '../quadri/Locandina';

// Notte stellata (quadri/notte-stellata.json): scansione Google Art Project da Wikimedia Commons
// (miniatura ufficiale da 3840 px), salvata in public/quadri/notte-stellata/originale.jpg.
// Ogni scena: camera con fotogrammi chiave sulle frasi (cues) + schizzi a mano che spiegano i dettagli.

export const OPERA: Opera = { src: 'quadri/notte-stellata/originale.jpg', aspect: 3840 / 3041 };

// Punti dell'opera in frazioni (x da sinistra, y dall'alto), letti sull'immagine.
const P = {
  luna: { x: 0.898, y: 0.178 },
  venere: { x: 0.344, y: 0.513 },
  vortice: { x: 0.48, y: 0.33 },
  vortice2: { x: 0.67, y: 0.48 },
  campanile: { x: 0.564, y: 0.66 },
  villaggio: { x: 0.66, y: 0.84 },
  colline: { x: 0.62, y: 0.6 },
  cipresso: [{ x: 0.27, y: 0.95 }, { x: 0.245, y: 0.62 }, { x: 0.215, y: 0.32 }, { x: 0.195, y: 0.07 }],
  stelle: [{ x: 0.234, y: 0.17 }, { x: 0.7, y: 0.23 }, { x: 0.33, y: 0.33 }, { x: 0.61, y: 0.09 }, { x: 0.13, y: 0.48 }],
};

/** Vista e proiezione dei punti dell'opera sullo schermo al tempo t. */
const camera = (chiavi: Chiave[], t: number) => {
  const v = vistaAt(chiavi, t);
  const s = 1920 / (v.h * 1000);
  return { at: (p: Pt) => proietta(OPERA, v, p), px: (frazione: number) => frazione * 1000 * s };
};

const add = (p: Pt, dx: number, dy: number): Pt => ({ x: p.x + dx, y: p.y + dy });

// ---------------------------------------------------------------- disegni delle schede (coordinate locali)

const L = { stroke: INK, strokeWidth: 5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
const Etichetta: React.FC<{ x: number; y: number; children: React.ReactNode; size?: number }> = ({ x, y, children, size = 44 }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={size} fill={INK}>{children}</text>
);

/** Clinica di Saint-Rémy: edificio con finestre ad arco e sbarre. */
const Clinica = () => (
  <g>
    <path d="M40 120 L190 50 L340 120 Z" fill="#E59B6B" {...L} />
    <rect x="60" y="118" width="260" height="120" fill="#F2D8A7" {...L} />
    {[95, 170, 245].map((x) => (
      <g key={x}>
        <path d={`M${x} 200 V160 a20 20 0 0 1 40 0 V200 Z`} fill="#3E5C99" {...L} />
        {[x + 13, x + 27].map((bx) => <path key={bx} d={`M${bx} 146 V200`} {...L} strokeWidth={3} />)}
      </g>
    ))}
    <path d="M150 238 v-28 a16 16 0 0 1 32 0 v28" fill="#8A5A3C" {...L} />
    <Etichetta x={190} y={286}>Saint-Rémy</Etichetta>
  </g>
);

/** Pila di tele: «×150». */
const Tele = () => (
  <g>
    {[0, 1, 2, 3].map((i) => (
      <g key={i} transform={`translate(${40 + i * 14} ${150 - i * 30}) rotate(${-4 + i * 3})`}>
        <rect width="170" height="110" fill={['#F3C969', '#7FA7C9', '#9BC48A', '#E59B6B'][i]} {...L} />
        <path d="M14 80 Q50 40 85 70 T156 50" fill="none" {...L} strokeWidth={4} />
      </g>
    ))}
    <text x="250" y="150" textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize="86" fill="#D9342B">×150</text>
    <Etichetta x={160} y={262}>in un anno!</Etichetta>
  </g>
);

/** Notte nella stanza: luna alla finestra e pennello sbarrato. */
const NienteLuce = () => (
  <g>
    <rect x="30" y="30" width="150" height="150" fill="#1E2E5C" {...L} />
    <path d="M118 70 a32 32 0 1 0 22 56 a26 26 0 1 1 -22 -56 Z" fill={GIALLO} {...L} strokeWidth={4} />
    {[68, 105, 142].map((x) => <path key={x} d={`M${x} 30 V180`} {...L} />)}
    <g transform="translate(260 105) rotate(35)">
      <rect x="-12" y="-70" width="24" height="90" rx="6" fill="#C98B4E" {...L} />
      <path d="M-14 20 h28 l-4 34 q-10 14 -20 0 Z" fill="#3E5C99" {...L} />
    </g>
    <path d="M200 40 L320 170 M320 40 L200 170" stroke="#D9342B" strokeWidth={10} strokeLinecap="round" />
    <Etichetta x={175} y={238}>di notte: buio</Etichetta>
  </g>
);

/** Nuvoletta del pensiero con un piccolo cielo stellato: «a memoria». */
const Ricordo = () => (
  <g>
    <path d="M70 150 q-50 -10 -30 -60 q0 -50 60 -50 q30 -40 90 -15 q60 -20 90 30 q50 15 25 70 q10 50 -60 45 q-40 30 -95 5 q-50 20 -80 -25 Z" fill="#E9F0FF" {...L} />
    <path d="M110 120 q20 -50 60 -30 q30 15 20 -15" fill="none" stroke="#3E5C99" strokeWidth={6} strokeLinecap="round" />
    {[[90, 80], [230, 75], [250, 140]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="11" fill={GIALLO} {...L} strokeWidth={3} />)}
    <circle cx="70" cy="215" r="14" fill="#E9F0FF" {...L} />
    <circle cx="45" cy="250" r="8" fill="#E9F0FF" {...L} />
    <Etichetta x={210} y={250}>a memoria!</Etichetta>
  </g>
);

/** Chiese a confronto: campanile a punta (Olanda) e a vela (Provenza). */
const Chiese = () => (
  <g>
    <path d="M95 40 L120 140 H70 Z" fill="#7FA7C9" {...L} />
    <rect x="70" y="140" width="50" height="60" fill="#E8E2D0" {...L} />
    <path d="M40 200 V160 L70 140 V200 Z" fill="#E8E2D0" {...L} />
    <Etichetta x={95} y={250}>Olanda</Etichetta>
    <path d="M60 268 l14 14 l30 -30" fill="none" stroke="#2E9E5B" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M230 120 h70 v80 h-70 Z" fill="#F2D8A7" {...L} />
    <path d="M245 120 V88 h40 V120" fill="#F2D8A7" {...L} />
    <path d="M258 120 v-18 a7 7 0 0 1 14 0 v18" fill={INK} />
    <Etichetta x={265} y={250}>Provenza</Etichetta>
    <path d="M160 70 V220" stroke={INK} strokeWidth={3} strokeDasharray="8 10" />
  </g>
);

/** Fiamma = cipresso. */
const Fiamma = () => (
  <g>
    <path d="M90 230 q-60 -50 -20 -120 q10 30 30 30 q-20 -60 30 -110 q0 50 30 70 q40 50 -10 130 Z" fill="#FF9F3F" {...L} />
    <path d="M100 225 q-25 -30 0 -70 q20 30 15 70 Z" fill={GIALLO} {...L} strokeWidth={4} />
    <text x="190" y="150" textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize="70" fill={INK}>=</text>
    <path d="M280 235 q-55 -40 -30 -110 q-5 -50 25 -105 q30 55 25 105 q25 70 -20 110 Z" fill="#2F4A3A" {...L} />
    <Etichetta x={170} y={278}>fiamma = cipresso</Etichetta>
  </g>
);

/** Sole, Venere e Terra: Venere si vede all'alba vicino al Sole. */
const Pianeti = () => (
  <g>
    <circle cx="70" cy="120" r="40" fill={GIALLO} {...L} />
    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
      const a = (i * Math.PI) / 4;
      return <path key={i} d={`M${70 + 50 * Math.cos(a)} ${120 + 50 * Math.sin(a)} L${70 + 64 * Math.cos(a)} ${120 + 64 * Math.sin(a)}`} {...L} />;
    })}
    <path d="M70 30 A90 90 0 0 1 70 210" fill="none" stroke={INK} strokeWidth={3} strokeDasharray="8 8" />
    <circle cx="160" cy="120" r="18" fill="#F3E3A0" {...L} />
    <circle cx="300" cy="120" r="30" fill="#5B9BD5" {...L} />
    <path d="M285 108 q10 -6 18 2 q6 10 -6 16 M300 135 q8 -4 12 4" fill="none" stroke="#2E9E5B" strokeWidth={5} strokeLinecap="round" />
    <Etichetta x={70} y={250} size={36}>Sole</Etichetta>
    <Etichetta x={165} y={180} size={36}>Venere</Etichetta>
    <Etichetta x={300} y={190} size={36}>Terra</Etichetta>
    <Etichetta x={190} y={290} size={40}>all'alba, enorme!</Etichetta>
  </g>
);

/** Tazza vista dall'alto con il latte che gira. */
const Tazza = () => (
  <g>
    <ellipse cx="160" cy="135" rx="120" ry="105" fill="#FFFFFF" {...L} />
    <path d="M272 120 q60 0 50 40 q-8 30 -50 20" fill="none" {...L} strokeWidth={10} />
    <ellipse cx="160" cy="135" rx="92" ry="80" fill="#8A5A3C" {...L} />
    <path d="M160 135 m0 -8 a10 10 0 1 1 -12 14 a24 24 0 1 1 34 -30 a40 40 0 1 1 -62 46 a56 56 0 0 1 40 -86" fill="none" stroke="#F6E6CC" strokeWidth={9} strokeLinecap="round" />
    <Etichetta x={160} y={278}>latte nel caffè</Etichetta>
  </g>
);

/** Sezione della pittura: creste di colore in rilievo. */
const Rilievo = () => (
  <g>
    <path d="M20 190 H320" {...L} />
    <path d="M20 190 q20 -70 40 0 q15 -50 35 0 q25 -90 45 0 q15 -40 30 0 q20 -80 45 0 q15 -55 35 0 q20 -70 40 0 q10 -30 30 0" fill="#3E5C99" {...L} />
    <path d="M140 190 q25 -90 45 0" fill={GIALLO} {...L} />
    <path d="M60 60 L120 110 M100 50 L140 95" stroke="#D9342B" strokeWidth={6} strokeLinecap="round" />
    <Etichetta x={170} y={250}>in rilievo, quasi 3D!</Etichetta>
  </g>
);

/** Tubetti di colore: blu oltremare, blu cobalto, giallo. */
const Tubetti = () => (
  <g>
    {[['#2A3FA0', 'oltremare'], ['#2F6FD1', 'cobalto'], [GIALLO, 'giallo']].map(([c, n], i) => (
      <g key={n} transform={`translate(${40 + i * 100} 40) rotate(${-8 + i * 8} 40 90)`}>
        <path d="M10 20 h60 l-6 140 h-48 Z" fill="#E8E8E8" {...L} />
        <rect x="16" y="50" width="48" height="70" fill={c} {...L} strokeWidth={4} />
        <rect x="28" y="160" width="24" height="22" fill="#666" {...L} strokeWidth={4} />
        <path d="M40 182 q-14 24 6 30 q16 -4 -6 -30" fill={c} {...L} strokeWidth={4} />
      </g>
    ))}
    <Etichetta x={170} y={278} size={40}>blu, blu e giallo</Etichetta>
  </g>
);

/** Museo (MoMA, New York). */
const Museo = () => (
  <g>
    <rect x="40" y="70" width="280" height="150" fill="#E8E2D0" {...L} />
    {[0, 1, 2, 3].map((i) => <rect key={i} x={60 + i * 66} y="90" width="44" height="50" fill="#9CC3E6" {...L} strokeWidth={4} />)}
    <rect x="150" y="160" width="60" height="60" fill="#3E5C99" {...L} />
    <rect x="70" y="40" width="220" height="40" fill={INK} />
    <text x="180" y="70" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="30" fill={CARTA} letterSpacing="6">MoMA</text>
    <Etichetta x={180} y={272}>New York</Etichetta>
  </g>
);

// ---------------------------------------------------------------- scene

const ColpoDOcchio: React.FC<SceneProps> = ({ t, cues }) => {
  const chiavi = [{ t: 0, v: { x: 0.3, y: 0.48, h: 1 } }, { t: cues[1], v: { x: 0.48, y: 0.42, h: 0.82 } }, { t: 9, v: { x: 0.7, y: 0.45, h: 0.95 } }];
  const { at, px } = camera(chiavi, t);
  const vo = at(P.vortice);
  return (
    <Quadro opera={OPERA} t={t} chiavi={chiavi}
      sopra={
        <Schizzi>
          <FrecciaGiro t={t} da={0.7} a={cues[2] - 0.3} c={vo} r={px(0.1)} />
          <Scritta t={t} da={1.3} a={cues[2] - 0.3} at={add(vo, 60, px(0.1) + 80)} testo="gira!" size={96} color={GIALLO} />
          {P.stelle.map((s, i) => <Scintilla key={i} t={t} da={cues[2] + i * 0.25} at={at(s)} seed={i} />)}
          <Scritta t={t} da={cues[2] + 0.6} at={{ x: 540, y: 1150 }} testo="segreti in arrivo…" size={70} rot={-3} />
        </Schizzi>
      }
    />
  );
};

/** Mappa disegnata sopra l'opera sfocata: Arles, il sole, poi la tempesta; in fondo la strada per Saint-Rémy. */
const Arles: React.FC<SceneProps> = ({ t, dur, palette: C, cues }) => {
  const map = eob(seg(t, 0.15, 0.7), 1.6);
  const sole = eob(seg(t, cues[1], cues[1] + 0.5), 1.8) * (1 - seg(t, cues[2] - 0.2, cues[2] + 0.2));
  const nube = eob(seg(t, cues[2], cues[2] + 0.5), 1.8);
  const lampo = nube > 0.9 && Math.floor((t - cues[2]) * 3) % 3 === 0;
  const route = eo(seg(t, dur - 1.6, dur - 0.4));
  const A = { x: 450, y: 1000 }, S = { x: 740, y: 840 };
  return (
    <Quadro opera={OPERA} t={t} fondo={0.7} chiavi={[{ t: 0, v: { x: 0.5, y: 0.5, h: 0.6 } }, { t: dur, v: { x: 0.56, y: 0.5, h: 0.48 } }]}
      sopra={
        <AbsoluteFill style={{ background: 'rgba(0,0,0,.35)' }}>
          <svg width="1080" height="1920" viewBox="0 0 1080 1920">
            <g transform={`translate(540 940) rotate(-2) scale(${map}) translate(-540 -940)`} opacity={Math.min(1, map * 3)}>
              <rect x="150" y="660" width="780" height="580" rx="18" fill={C.chiaro} stroke={INK} strokeWidth="8" />
              <path d="M154 1130 Q300 1100 420 1150 Q560 1200 700 1150 Q840 1110 926 1140 V1236 H154 Z" fill="#7FA7C9" stroke={INK} strokeWidth="6" />
              <path d="M520 664 Q490 800 460 900 Q430 1000 445 1140" fill="none" stroke="#7FA7C9" strokeWidth="18" strokeLinecap="round" />
              <text x="190" y="720" fontFamily={SANS} fontWeight={800} fontSize="28" letterSpacing="4" fill={INK} opacity=".6">SUD DELLA FRANCIA · 1888</text>
              {/* Vincent, pittore olandese: bandierina dei Paesi Bassi */}
              <g transform="translate(700 700) rotate(4)">
                <path d="M0 0 V70" stroke={INK} strokeWidth="5" />
                {['#C8102E', '#FFFFFF', '#21468B'].map((c, i) => <rect key={c} x="0" y={i * 14} width="60" height="14" fill={c} stroke={INK} strokeWidth="3" />)}
              </g>
              <text x="780" y="740" fontFamily={HAND} fontWeight={700} fontSize="40" fill={INK}>Vincent</text>
              <path d={`M${A.x} ${A.y} Q600 880 ${S.x} ${S.y}`} fill="none" stroke={C.principale} strokeWidth="9" strokeLinecap="round" pathLength={1} strokeDasharray={`${route} 1`} />
              <circle cx={A.x} cy={A.y} r="20" fill={C.accento} stroke={INK} strokeWidth="6" />
              <text x={A.x - 210} y={A.y + 16} fontFamily={SANS} fontWeight={800} fontSize="46" fill={INK}>Arles</text>
              <g opacity={route > 0 ? 1 : 0.35}>
                <circle cx={S.x} cy={S.y} r="16" fill={route > 0.98 ? C.accento : C.chiaro} stroke={INK} strokeWidth="6" />
                <text x={S.x - 70} y={S.y - 34} fontFamily={SANS} fontWeight={800} fontSize="38" fill={INK}>Saint-Rémy</text>
              </g>
              {/* il sole del sud */}
              <g transform={`translate(330 880) scale(${sole}) rotate(${t * 30})`}>
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <path key={i} d="M0 -62 V-86" stroke={INK} strokeWidth="8" strokeLinecap="round" transform={`rotate(${i * 45})`} />)}
                <circle r="48" fill={GIALLO} stroke={INK} strokeWidth="6" />
              </g>
              {/* le crisi: nuvola con il lampo */}
              <g transform={`translate(330 870) scale(${nube})`}>
                <path d="M-90 30 q-40 -5 -25 -45 q5 -45 55 -40 q20 -40 70 -25 q45 -10 55 35 q45 10 25 55 Z" fill="#8C93A8" stroke={INK} strokeWidth="6" strokeLinejoin="round" />
                <path d="M-10 35 l-20 45 h25 l-15 45 l45 -60 h-25 l15 -30 Z" fill={lampo ? '#FFF6B0' : GIALLO} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
              </g>
            </g>
          </svg>
        </AbsoluteFill>
      }
    />
  );
};

const Ospedale: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const chiavi = [{ t: 0, v: { x: 0.6, y: 0.62, h: 0.9 } }, { t: cues[1], v: { x: 0.66, y: 0.78, h: 0.55 } }, { t: dur, v: { x: 0.62, y: 0.82, h: 0.45 } }];
  return (
    <Quadro opera={OPERA} t={t} chiavi={chiavi}
      sopra={
        <Schizzi>
          <Cuore t={t} da={0.9} at={{ x: 820, y: 760 }} r={46} />
          <Scritta t={t} da={1.1} at={{ x: 720, y: 690 }} testo="coraggio!" size={84} color={GIALLO} rot={-6} />
          <Scheda t={t} da={cues[1]} a={dur - 0.4} at={{ x: 320, y: 930 }} w={380} h={310} rot={-5}><Clinica /></Scheda>
          <Scheda t={t} da={cues[2]} at={{ x: 760, y: 1040 }} w={330} h={290} rot={6} seed={12}><Tele /></Scheda>
        </Schizzi>
      }
    />
  );
};

const Finestra: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const chiavi = [{ t: 0, v: { x: 0.5, y: 0.62, h: 0.72 } }, { t: dur, v: { x: 0.68, y: 0.58, h: 0.6 } }];
  const { at } = camera(chiavi, t);
  const co = at(P.colline);
  return (
    <Quadro opera={OPERA} t={t} chiavi={chiavi}
      sopra={
        <>
          <OmbraSbarre t={t} da={0.2} a={cues[1] - 0.2} forza={0.55} />
          <Schizzi>
            <Freccia t={t} da={1.4} a={cues[2] - 0.3} from={{ x: 260, y: 1130 }} to={co} curva={-90} />
            <Scritta t={t} da={1.7} a={cues[2] - 0.3} at={{ x: 230, y: 1190 }} testo="colline" size={70} />
            <Scheda t={t} da={cues[1]} a={cues[2] - 0.2} at={{ x: 720, y: 980 }} w={350} h={270} rot={5}><NienteLuce /></Scheda>
            <Scheda t={t} da={cues[2]} at={{ x: 560, y: 960 }} w={330} h={280} rot={-4} seed={14}><Ricordo /></Scheda>
          </Schizzi>
        </>
      }
    />
  );
};

const Villaggio: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const chiavi = [{ t: 0, v: { x: 0.62, y: 0.76, h: 0.8 } }, { t: cues[1], v: { x: 0.6, y: 0.72, h: 0.5 } }, { t: dur, v: { x: 0.57, y: 0.69, h: 0.36 } }];
  const { at, px } = camera(chiavi, t);
  const punta = at({ x: P.campanile.x, y: P.campanile.y - 0.01 });
  return (
    <Quadro opera={OPERA} t={t} chiavi={chiavi}
      sopra={
        <Schizzi>
          <Cerchio t={t} da={0.5} a={cues[1] - 0.2} c={at(P.villaggio)} rx={px(0.2)} ry={px(0.08)} />
          <Scritta t={t} da={0.9} a={cues[1] - 0.2} at={add(at(P.villaggio), 0, -px(0.15))} testo="inventato!" size={92} color={GIALLO} />
          <Freccia t={t} da={cues[1] + 0.3} from={add(punta, 280, 150)} to={punta} curva={-70} gap={24} />
          <Scritta t={t} da={cues[1] + 0.6} at={add(punta, 300, 210)} testo="a punta!" size={76} />
          <Scheda t={t} da={cues[1] + 1.2} a={cues[2] - 0.2} at={{ x: 290, y: 1050 }} w={360} h={300} rot={-4}><Chiese /></Scheda>
          <Cuore t={t} da={cues[2] + 0.2} at={add(punta, -170, 40)} r={44} />
          <Scritta t={t} da={cues[2] + 0.4} at={add(punta, -190, 130)} testo="casa" size={80} color="#FF9AB0" />
        </Schizzi>
      }
    />
  );
};

const Cipresso: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const chiavi = [{ t: 0, v: { x: 0.28, y: 0.78, h: 0.62 } }, { t: cues[1], v: { x: 0.26, y: 0.52, h: 0.7 } }, { t: dur, v: { x: 0.24, y: 0.3, h: 0.55 } }];
  const { at } = camera(chiavi, t);
  const mid = at(P.cipresso[1]);
  return (
    <Quadro opera={OPERA} t={t} chiavi={chiavi}
      sopra={
        <Schizzi>
          <Freccia t={t} da={0.6} a={cues[1] - 0.2} from={add(mid, 380, 120)} to={add(mid, 40, 0)} curva={-80} />
          <Scritta t={t} da={0.9} a={cues[1] - 0.2} at={add(mid, 400, 190)} testo="cipresso" size={84} />
          <Percorso t={t} da={cues[1] + 0.2} a={cues[2] - 0.2} punti={P.cipresso.map((q) => add(at(q), 90, 0))} dur={1.6} color={CHALK} />
          <Scritta t={t} da={cues[1] + 1.4} a={cues[2] - 0.2} at={{ x: 760, y: 760 }} testo="fino alle stelle!" size={72} color={GIALLO} />
          <Scheda t={t} da={cues[2]} at={{ x: 740, y: 1020 }} w={340} h={300} rot={5}><Fiamma /></Scheda>
        </Schizzi>
      }
    />
  );
};

const Venere: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const chiavi = [{ t: 0, v: { x: 0.38, y: 0.46, h: 0.85 } }, { t: cues[1], v: { x: 0.35, y: 0.5, h: 0.52 } }, { t: dur, v: { x: 0.33, y: 0.48, h: 0.46 } }];
  const { at, px } = camera(chiavi, t);
  const ve = at(P.venere);
  const r = px(0.085);
  return (
    <Quadro opera={OPERA} t={t} chiavi={chiavi}
      sopra={
        <Schizzi>
          <Cerchio t={t} da={0.6} c={ve} rx={r} />
          <Scritta t={t} da={1.0} a={cues[1] - 0.1} at={add(ve, r + 60, -r)} testo="?" size={140} color={GIALLO} rot={10} />
          <Scritta t={t} da={cues[1]} at={add(ve, 0, -r - 70)} testo="pianeta Venere!" size={80} color={GIALLO} />
          <Scheda t={t} da={cues[2]} at={{ x: 790, y: 1080 }} w={370} h={310} rot={4}><Pianeti /></Scheda>
        </Schizzi>
      }
    />
  );
};

const Vortici: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const chiavi = [{ t: 0, v: { ...P.vortice, y: 0.44, h: 0.9 } }, { t: cues[2], v: { x: 0.56, y: 0.42, h: 0.7 } }, { t: dur, v: { x: 0.5, y: 0.38, h: 0.62 } }];
  const { at, px } = camera(chiavi, t);
  const v1 = at(P.vortice), v2 = at(P.vortice2);
  return (
    <Quadro opera={OPERA} t={t} chiavi={chiavi}
      sopra={
        <Schizzi>
          <FrecciaGiro t={t} da={0.5} c={v1} r={px(0.1)} />
          <Scritta t={t} da={cues[1]} a={cues[3] - 0.2} at={add(v1, 0, px(0.1) + 80)} testo="movimento!" size={86} color={GIALLO} rot={-6} />
          <FrecciaGiro t={t} da={cues[2]} c={v2} r={px(0.09)} verso={-1} ang0={200} giro={300} color={GIALLO} seed={8} />
          <Scheda t={t} da={cues[3]} at={{ x: 300, y: 1050 }} w={330} h={300} rot={-5}><Tazza /></Scheda>
        </Schizzi>
      }
    />
  );
};

const Tecnica: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const chiavi = [{ t: 0, v: { x: P.luna.x - 0.05, y: P.luna.y + 0.03, h: 0.36 } }, { t: dur, v: { ...P.luna, h: 0.24 } }];
  const { at } = camera(chiavi, t);
  const lu = at(P.luna);
  return (
    <Quadro opera={OPERA} t={t} chiavi={chiavi}
      sopra={
        <Schizzi>
          <Freccia t={t} da={0.6} a={cues[1] - 0.2} from={{ x: 230, y: 1150 }} to={add(lu, -60, 60)} curva={80} />
          <Scritta t={t} da={0.9} a={cues[1] - 0.2} at={{ x: 230, y: 1205 }} testo="spesso!" size={84} color={GIALLO} />
          <Scheda t={t} da={cues[1]} a={cues[2] - 0.2} at={{ x: 330, y: 1040 }} w={340} h={290} rot={-4}><Rilievo /></Scheda>
          <Scheda t={t} da={cues[2]} at={{ x: 330, y: 1040 }} w={340} h={300} rot={5} seed={15}><Tubetti /></Scheda>
        </Schizzi>
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
          <Schizzi>
            <Scritta t={t} da={0.5} a={fuori} at={{ x: 540, y: 1180 }} testo="non gli piaceva?!" size={86} color={GIALLO} />
            {[P.venere, P.stelle[0], P.stelle[1]].map((s, i) => (
              <Cerchio key={i} t={t} da={cues[1] + i * 0.3} a={fuori} c={at(s)} rx={px(0.07)} seed={20 + i} color={CHALK} />
            ))}
            <Scritta t={t} da={cues[1] + 1} a={fuori} at={{ x: 540, y: 760 }} testo="troppo grandi?" size={80} />
          </Schizzi>
        </>
      }
    />
  );
};

const Oggi: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const chiavi = [{ t: 0, v: { x: 0.5, y: 0.6, h: 4.5 } }, { t: cues[2], v: { x: 0.5, y: 0.5, h: 3 } }, { t: dur, v: { x: 0.5, y: 0.45, h: 2 } }];
  const { at } = camera(chiavi, t);
  return (
    <Quadro opera={OPERA} t={t} fondo={0.75} chiavi={chiavi}
      sopra={
        <Schizzi>
          <Scheda t={t} da={0.4} a={cues[2] - 0.2} at={{ x: 540, y: 1080 }} w={360} h={300} rot={-3}><Museo /></Scheda>
          {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy], i) => (
            <Scintilla key={i} t={t} da={cues[2] + i * 0.2} at={add(at({ x: 0.5, y: 0.5 }), sx * 300, sy * 230)} seed={i + 3} r={30} />
          ))}
          {[[-280, -60], [300, -120], [-180, 200], [240, 180], [0, -260]].map(([dx, dy], i) => (
            <Cuore key={i} t={t} da={cues[3] + i * 0.18} at={add(at({ x: 0.5, y: 0.5 }), dx, dy)} r={36} />
          ))}
          <Scritta t={t} da={cues[3] + 0.3} at={{ x: 540, y: 1180 }} testo="★ una star! ★" size={90} color={GIALLO} />
        </Schizzi>
      }
    />
  );
};

// Scene per id del capitolo (quadri/notte-stellata.json).
export const NOTTE_STELLATA_SCENES: Record<string, SceneDef> = {
  'colpo-d-occhio': { Component: ColpoDOcchio, title: { top: 400, size: 104 } },
  arles: { Component: Arles, title: { top: 400, size: 104 } },
  ospedale: { Component: Ospedale, title: { top: 400, size: 104 } },
  finestra: { Component: Finestra, title: { top: 400, size: 92 } },
  villaggio: { Component: Villaggio, title: { top: 400, size: 104 } },
  cipresso: { Component: Cipresso, title: { top: 400, size: 104 } },
  venere: { Component: Venere, title: { top: 400, size: 104 } },
  vortici: { Component: Vortici, title: { top: 400, size: 104 } },
  tecnica: { Component: Tecnica, title: { top: 400, size: 104 } },
  fallimento: { Component: Fallimento, title: { top: 400, size: 104 } },
  oggi: { Component: Oggi, title: { top: 400, size: 104 } },
};

export const Copertina = copertinaQuadro(OPERA, { x: P.luna.x - 0.25, y: 0.5, h: 0.95 });
export const Finale = finaleQuadro(OPERA);
