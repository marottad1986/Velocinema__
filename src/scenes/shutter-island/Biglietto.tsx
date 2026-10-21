import React from 'react';
import { camera, eio, eo, eob, lerp, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, GlowGradient, Lin } from '../../lib/fx';
import { HAND } from '../../lib/fonts';
import type { SceneProps } from '../../types';

// Il biglietto: una piastrella del pavimento si solleva e appare un biglietto «La legge del 4 – Chi è il 67?».
// Piani: parete di fondo con piastrelle e grata (0,25) · pavimento in prospettiva con la buca (0,45)
//        · piastrella sollevata, polvere e biglietto (0,6–0,7) · branda e tubo in primo piano (1,25) · pulviscolo vicino (1,7)

const K = '#0A1215';
const WALL_Y = 1000; // attacco parete/pavimento (orizzonte)

// Prospettiva del pavimento: punto (X, altezza H, profondità z) → schermo
const F = 420; // scala orizzontale (piastrella larga 1)
const FH = 1257; // scala delle altezze: piastrelle quadrate (profondità 0,35 sullo schermo come larghezza 1)
const proj = (X: number, H: number, z: number) => ({ x: 540 + (F * X) / z, y: 600 + (1320 - FH * H) / z });
const P2 = (X: number, H: number, z: number) => {
  const p = proj(X, H, z);
  return `${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
};
const Z_ROWS = [1, 1.35, 1.7, 2.05, 2.4, 2.75, 3.1, 3.45];
const HOLE = { x0: -0.5, x1: 0.5, z0: 2.05, z1: 2.4 }; // piastrella mancante
const quad = (x0: number, x1: number, z0: number, z1: number, H = 0) => `M${P2(x0, H, z0)} L${P2(x1, H, z0)} L${P2(x1, H, z1)} L${P2(x0, H, z1)} Z`;

// griglia delle fughe
const grout = (() => {
  let d = '';
  for (const z of Z_ROWS) d += `M${P2(-6, 0, z)} L${P2(6, 0, z)} `;
  for (let X = -5.5; X <= 5.5; X += 1) d += `M${P2(X, 0, 0.6)} L${P2(X, 0, 3.6)} `;
  return d;
})();

const r = rng(4067);
// tonalità leggermente diverse per alcune piastrelle (dettaglio)
const TILES = Array.from({ length: 22 }, () => ({ X: Math.floor(r() * 9) - 4.5, zi: Math.floor(r() * 6), o: 0.06 + r() * 0.1, light: r() > 0.5 }))
  .filter((p) => !(p.X === -0.5 && p.zi === 3));
const DUST = Array.from({ length: 30 }, () => ({ dx: (r() - 0.5) * 180, sp: 0.18 + r() * 0.25, ph: r(), s: 2 + r() * 4, sw: r() * 6 }));
const NEAR = Array.from({ length: 6 }, (_, i) => ({ x: r() * 1080, y: 600 + r() * 1200, rad: 40 + r() * 60, ph: i }));

export const Biglietto: React.FC<SceneProps> = ({ t, dur, palette: P }) => {
  const cam = camera(t, dur, 540, 1060);
  const L = cam.layer;

  // Torcia: cerca sul pavimento, poi si ferma sulla piastrella (che si solleva)
  const settle = eio(seg(t, 0, 1.0));
  const spot = {
    x: lerp(260, 540, settle) + Math.sin(t * 1.3) * 14 * (1 - settle * 0.6),
    y: lerp(1300, 1196, settle) + Math.sin(t * 1.7 + 1) * 8,
  };
  const breathe = 0.5 + 0.5 * Math.sin(t * 2.1);

  // Piastrella: si alza ruotando sul bordo lontano, poi scivola a destra e resta appoggiata
  const lift = eob(seg(t, 0.7, 1.5), 1.2);
  const slide = eio(seg(t, 1.2, 2.1));
  const ang = Math.min(lift, 1.08) * 1.15 * (1 - 0.1 * slide); // rad, rotazione sul bordo lontano
  const tx = slide * 1.0;
  const D = HOLE.z1 - HOLE.z0;
  const TH = 0.02; // spessore
  const tileCorner = (u: number, v: number, n = 0) => {
    // u lungo X (0..1), v dal bordo lontano (0) al bordo vicino (1), n lungo la normale (spessore)
    const zz = HOLE.z1 - v * D * Math.cos(ang) + n * Math.sin(ang);
    const hh = v * D * Math.sin(ang) + n * Math.cos(ang);
    return P2(lerp(HOLE.x0, HOLE.x1, u) + tx, hh, zz);
  };
  const face = (n: number) => `M${tileCorner(0, 0, n)} L${tileCorner(1, 0, n)} L${tileCorner(1, 1, n)} L${tileCorner(0, 1, n)} Z`;
  // finché è quasi piana si vede la faccia smaltata, poi il retro di cemento
  const showTop = ang < 0.4;
  const tileEdge = `M${tileCorner(0, 1, TH)} L${tileCorner(1, 1, TH)} L${tileCorner(1, 1, 0)} L${tileCorner(0, 1, 0)} Z`;

  // Polvere che si solleva con la piastrella
  const dustOn = seg(t, 0.8, 1.3) * (1 - seg(t, 5.5, 8));

  // Biglietto: emerge quando la voce lo legge (2ª frase, ~1,95 s)
  const noteIn = eob(seg(t, 1.8, 2.6), 1.4);
  const noteO = seg(t, 1.8, 2.0);
  const noteY = lerp(1196, 820, noteIn) + Math.sin(t * 1.3) * 6;
  const noteS = lerp(0.18, 1, noteIn) * (1 + Math.sin(t * 1.1) * 0.006);
  const noteRot = lerp(-18, -4, noteIn) + Math.sin(t * 0.9) * 0.8;
  const ink67 = eo(seg(t, 2.4, 3.0));

  const holeC = proj(0, 0, (HOLE.z0 + HOLE.z1) / 2);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="bi" />
        <Lin id="bi-wall" stops={[[0, '#0B1417'], [0.35, '#16252A'], [0.7, '#22353A'], [1, '#1A2A2F']]} />
        <Lin id="bi-tilewall" stops={[[0, '#3E5256'], [1, '#26363A']]} />
        <Lin id="bi-floor" stops={[[0, '#1D292C'], [0.35, '#152024'], [1, '#070D0F']]} />
        <Lin id="bi-hole" stops={[[0, '#030607'], [1, '#121B1E']]} />
        <Lin id="bi-tile" x2={1} y2={0} stops={[[0, '#7E918E'], [0.6, '#A3B4B0'], [1, '#C4D2CE']]} />
        <Lin id="bi-back" x2={1} y2={0} stops={[[0, '#4A5553'], [0.6, '#66726F'], [1, '#7F8B87']]} />
        <Lin id="bi-cone" x2={1} y2={1} stops={[[0, '#FFF1C4', 0], [0.55, '#FFF1C4', 0.14], [1, '#FFF1C4', 0.36]]} />
        <Lin id="bi-paper" stops={[[0, '#F6F0E1'], [1, '#E2D8C1']]} />
        <Lin id="bi-iron" x2={1} y2={0} stops={[[0, '#1A262A'], [0.35, '#3A4C50'], [1, '#0B1316']]} />
        <Lin id="bi-pipe" stops={[[0, '#3D5054'], [0.4, '#7C9497'], [1, '#1B272A']]} />
        <GlowGradient id="bi-spot" color="#FFF1C4" core={0.75} mid={0.3} />
        <GlowGradient id="bi-warm" color="#FFD98A" core={0.6} mid={0.2} />
        <GlowGradient id="bi-dust" color="#E9F0F2" core={0.9} mid={0.35} />
        <GlowGradient id="bi-acc" color={P.accento} core={0.45} mid={0.15} />
        <GlowGradient id="bi-shadow" color="#000000" core={0.6} mid={0.3} />
        <clipPath id="bi-holeclip">
          <path d={quad(HOLE.x0, HOLE.x1, HOLE.z0, HOLE.z1)} />
        </clipPath>
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — parete di fondo: intonaco scuro, zoccolo di piastrelle, grata d'aerazione (0,25) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height={WALL_Y + 220} fill="url(#bi-wall)" />
          <rect x="-200" y="760" width="1480" height={WALL_Y - 760} fill="url(#bi-tilewall)" />
          <path d={Array.from({ length: 4 }, (_, i) => `M-200 ${790 + i * 60} H1280`).join(' ')} stroke="#1A272B" strokeWidth="4" opacity=".8" />
          <path d={Array.from({ length: 17 }, (_, i) => `M${-180 + i * 90} 760 V${WALL_Y}`).join(' ')} stroke="#1A272B" strokeWidth="4" opacity=".8" />
          <path d="M-200 760 H1280" stroke={K} strokeWidth="9" />
          <path d="M-200 768 H1280" stroke="#8FA6A8" strokeWidth="3" opacity=".45" />
          {/* alone della torcia riflesso sulla parete */}
          <ellipse cx={spot.x} cy="900" rx="380" ry="160" fill="url(#bi-warm)" opacity={0.22 + breathe * 0.04} />
          {/* grata d'aerazione */}
          <rect x="760" y="600" width="170" height="110" rx="6" fill="#0E171A" stroke={K} strokeWidth="8" />
          <path d="M770 622 H920 M770 644 H920 M770 666 H920 M770 688 H920" stroke="#3D5054" strokeWidth="6" />
          <path d="M764 604 H926" stroke="#9DB2B4" strokeWidth="3" opacity=".5" />
          {/* segni sul muro e macchia d'umidità */}
          <g stroke="#7E9598" strokeWidth="4" strokeLinecap="round" opacity=".45">
            <path d="M150 640 v40 M166 640 v40 M182 640 v40 M198 640 v40 M140 672 l70 -26" />
          </g>
          <path d="M420 560 q24 110 -8 200 q46 -50 52 -200 z" fill="#0A1214" opacity=".55" />
          <path d="M980 860 l-30 60 l20 40" fill="none" stroke="#141F22" strokeWidth="5" strokeLinecap="round" />
        </g>

        {/* PIANO 1 — pavimento in prospettiva con la buca (0,45) */}
        <g transform={L(0.45)}>
          <rect x="-200" y={WALL_Y} width="1480" height={1920 - WALL_Y + 200} fill="url(#bi-floor)" />
          {TILES.map((p, i) => (
            <path key={i} d={quad(p.X, p.X + 1, Z_ROWS[p.zi], Z_ROWS[p.zi + 1])} fill={p.light ? '#9FB4B2' : '#000'} opacity={p.o} />
          ))}
          <path d={grout} stroke="#0B1315" strokeWidth="5" opacity=".85" />
          <path d={`M-200 ${WALL_Y} H1280`} stroke={K} strokeWidth="9" />
          {/* crepa e tombino */}
          <path d={`M${P2(-2.2, 0, 1.5)} l40 30 l-14 40 l50 36`} fill="none" stroke="#070C0E" strokeWidth="5" strokeLinecap="round" />
          <g transform={`translate(${proj(2.3, 0, 1.25).x} ${proj(2.3, 0, 1.25).y})`}>
            <ellipse cx="0" cy="0" rx="120" ry="34" fill="#070C0E" stroke="#33454A" strokeWidth="7" />
            <path d="M-90 -14 H90 M-104 0 H104 M-90 14 H90" stroke="#2B3B3F" strokeWidth="7" />
          </g>

          {/* luce della torcia sul pavimento */}
          <ellipse cx={spot.x} cy={spot.y} rx={250 + breathe * 10} ry={92 + breathe * 4} fill="url(#bi-spot)" opacity=".7" />

          {/* buca: interno scuro, parete lontana illuminata, terra e calcinacci */}
          <path d={quad(HOLE.x0, HOLE.x1, HOLE.z0, HOLE.z1)} fill="url(#bi-hole)" />
          <g clipPath="url(#bi-holeclip)">
            <path d={`M${P2(HOLE.x0, 0, HOLE.z1)} L${P2(HOLE.x1, 0, HOLE.z1)} L${P2(HOLE.x1, -0.06, HOLE.z1)} L${P2(HOLE.x0, -0.06, HOLE.z1)} Z`} fill="#3C4C4E" />
            <circle cx={holeC.x - 40} cy={holeC.y + 18} r="9" fill="#2A3638" />
            <circle cx={holeC.x + 52} cy={holeC.y + 24} r="6" fill="#2A3638" />
            {/* biglietto piegato ancora nella buca */}
            <path d={`M${holeC.x - 34} ${holeC.y + 6} l60 -10 l10 22 l-62 10 z`} fill="#E2D8C1" stroke={K} strokeWidth="4" opacity={1 - noteO} />
          </g>
          <path d={quad(HOLE.x0, HOLE.x1, HOLE.z0, HOLE.z1)} fill="none" stroke={K} strokeWidth="6" />

          {/* ombra della piastrella sollevata */}
          <ellipse cx={proj(tx, 0, HOLE.z1).x + 30} cy={proj(0, 0, HOLE.z1).y + 6} rx={110 * seg(t, 0.8, 1.4)} ry="22" fill="url(#bi-shadow)" />
        </g>

        {/* cono di luce della torcia, che arriva da fuori campo (0,5) */}
        <g transform={L(0.5)}>
          <path d={`M1320 2050 L1140 1740 L${spot.x + 200} ${spot.y - 40} L${spot.x - 220} ${spot.y + 40} Z`} fill="url(#bi-cone)" opacity={0.7 + breathe * 0.15} />
        </g>

        {/* PIANO 2 — piastrella sollevata e polvere (0,6) */}
        <g transform={L(0.6)}>
          {/* polvere che sale dalla buca e brilla nella luce */}
          {DUST.map((d, i) => {
            const p = mod(t * d.sp + d.ph, 1);
            const x = holeC.x + d.dx * (0.4 + p) + Math.sin(t * 1.2 + d.sw) * 16;
            const y = holeC.y - p * 300;
            return <circle key={i} cx={x} cy={y} r={d.s} fill="#F3EBD2" opacity={dustOn * Math.sin(p * Math.PI) * 0.85} />;
          })}
          {[0, 1, 2].map((k) => {
            const p = seg(t, 0.85 + k * 0.12, 3.2 + k * 0.4);
            return <circle key={k} cx={holeC.x + (k - 1) * 70 + p * 30} cy={holeC.y - 20 - eo(p) * 160} r={50 + p * 110} fill="url(#bi-dust)" opacity={(1 - p) * 0.35 * seg(t, 0.85, 1.0)} />;
          })}
          {/* la piastrella */}
          {showTop ? (
            <>
              <path d={tileEdge} fill="#4F605E" stroke={K} strokeWidth="6" strokeLinejoin="round" />
              <path d={face(TH)} fill="url(#bi-tile)" stroke={K} strokeWidth="7" strokeLinejoin="round" />
              <path d={`M${tileCorner(0.15, 0.3, TH)} L${tileCorner(0.42, 0.55, TH)} L${tileCorner(0.38, 0.8, TH)}`} fill="none" stroke="#5F716E" strokeWidth="4" />
            </>
          ) : (
            <>
              <path d={face(0)} fill="url(#bi-back)" stroke={K} strokeWidth="8" strokeLinejoin="round" />
              {/* malta rimasta attaccata al retro */}
              <path d={`M${tileCorner(0.2, 0.25)} L${tileCorner(0.45, 0.2)} L${tileCorner(0.4, 0.45)} Z M${tileCorner(0.6, 0.6)} L${tileCorner(0.85, 0.55)} L${tileCorner(0.75, 0.85)} Z`} fill="#8C9894" opacity=".7" />
              <path d={`M${tileCorner(0.1, 0.7)} L${tileCorner(0.3, 0.9)}`} stroke="#3E4C4B" strokeWidth="4" />
              <path d={tileEdge} fill="#C4D2CE" stroke={K} strokeWidth="5" strokeLinejoin="round" />
              <path d={`M${tileCorner(0.97, 0.05)} L${tileCorner(0.97, 0.95)}`} stroke="#F2E8C8" strokeWidth="4" opacity=".6" />
            </>
          )}
        </g>

        {/* PIANO 3 — il biglietto che emerge (0,7) */}
        <g transform={L(0.7)} opacity={noteO}>
          <ellipse cx="540" cy={noteY + 250} rx={340 * noteS} ry={44 * noteS} fill="url(#bi-shadow)" opacity=".5" />
          <circle cx="540" cy={noteY} r={420 * noteS} fill="url(#bi-warm)" opacity=".35" />
          <g transform={`translate(540 ${noteY}) rotate(${noteRot}) scale(${noteS})`}>
            <path d="M-310 -190 H300 L310 -170 V190 H-300 L-310 170 Z" fill="url(#bi-paper)" stroke={K} strokeWidth="9" strokeLinejoin="round" />
            {/* pieghe del foglio */}
            <path d="M-310 0 H310 M0 -190 V190" stroke="#C7BCA3" strokeWidth="4" />
            <path d="M-300 -110 H300 M-300 -30 H300 M-300 50 H300 M-300 130 H300" stroke="#C9D8DD" strokeWidth="3" opacity=".8" />
            <path d="M-250 -190 V190" stroke="#E7A7A0" strokeWidth="3" opacity=".7" />
            <path d="M-300 -184 H296" stroke="#FFFFFF" strokeWidth="4" opacity=".8" />
            <path d="M210 150 q30 -6 50 18 q-20 8 -50 -18" fill="#8C7B5E" opacity=".35" />
            <text x="10" y="-52" textAnchor="middle" style={{ fontFamily: HAND, fontSize: 92, fontWeight: 700, fill: '#15202B' }}>La legge del 4</text>
            <text x="10" y="96" textAnchor="middle" style={{ fontFamily: HAND, fontSize: 116, fontWeight: 700, fill: P.accento }} opacity={ink67}>Chi è il 67?</text>
            <path d="M-170 124 Q10 140 190 118" fill="none" stroke={P.accento} strokeWidth="6" strokeLinecap="round" strokeDasharray="380" strokeDashoffset={380 * (1 - seg(t, 3.0, 3.6))} />
          </g>
        </g>

        {/* PIANO 4 — branda a sinistra e tubo a destra in primo piano (1,25) */}
        <g transform={L(1.25)}>
          {/* gamba e telaio della branda con coperta che pende */}
          <path d="M-60 1180 H260" stroke={K} strokeWidth="26" strokeLinecap="round" />
          <path d="M-40 1172 H250" stroke="#7C9497" strokeWidth="4" opacity=".6" />
          <rect x="200" y="1170" width="34" height="900" fill="url(#bi-iron)" stroke={K} strokeWidth="8" />
          <path d="M-200 1060 H180 Q200 1250 150 1460 Q90 1500 30 1450 Q-40 1500 -200 1460 Z" fill="#2E4448" stroke={K} strokeWidth="9" strokeLinejoin="round" />
          <path d="M-200 1078 H170" stroke="#6F8C90" strokeWidth="4" opacity=".7" />
          <path d="M40 1100 Q60 1280 30 1440 M110 1100 Q130 1260 110 1460" fill="none" stroke="#1C2D30" strokeWidth="5" />
          {/* tubo verticale con fascetta */}
          <rect x="980" y="-200" width="70" height="2400" fill="url(#bi-pipe)" stroke={K} strokeWidth="9" />
          <rect x="966" y="880" width="98" height="40" rx="6" fill="#4C6064" stroke={K} strokeWidth="7" />
          <path d="M994 -200 V2200" stroke="#B5CACD" strokeWidth="4" opacity=".5" />
        </g>

        {/* PIANO 5 — pulviscolo vicino alla camera, acceso dalla torcia (1,7) */}
        <g transform={L(1.7)}>
          {NEAR.map((n, i) => (
            <circle key={i} cx={n.x + Math.sin(t * 0.4 + n.ph) * 60} cy={n.y - mod(t * 22 + i * 90, 400) + 200} r={n.rad} fill="url(#bi-dust)" opacity=".1" />
          ))}
        </g>
      </g>

      <Finish id="bi" tint="#0E3A40" tintOpacity={0.12} />
    </svg>
  );
};
