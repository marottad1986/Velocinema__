import React from 'react';
import { camera, eo, lerp, mod, rng, seg } from '../../lib/anim';
import { Glow, NearMotes, Reflection } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { BBDefs } from '../breaking-bad-stagione-1/Comuni';
import { BB2Defs, K, ORO, Ombra } from './Comuni';

// La finta perdita di memoria: il corridoio di un supermercato di notte, in prospettiva verso le porte a vetri. Persone
// mai: Walter è il mucchio di vestiti lasciati sul pavimento lucido (camicia, pantaloni, scarpe, calzini). Eventi: prima
// frase le file di neon si accendono una dopo l'altra verso il fondo; seconda frase dall'alto cade la camicia sul mucchio
// e le scarpe si rovesciano (si è spogliato lì); terza frase dalle porte in fondo entrano le luci rosse e bianche
// dell'ambulanza e sul mucchio si posa il braccialetto dell'ospedale con il nome: la moglie, per ora, gli crede.
// Piani: fondo con le porte a vetri e il parcheggio (0,25) · neon e scaffali lontani (0,45) · scaffali vicini e carrello
//        (0,7) · pavimento lucido, vestiti e braccialetto (1,15) · particelle vicine (1,6)

const r = rng(2204);
const VX = 540, VY = 880; // punto di fuga
const BOX_COLORS = ['#C83A2A', '#F2B53A', '#3A7AB8', '#5AA05A', '#E8E2D0', '#8A3A8A', '#E87A3A'];
const SHELF = Array.from({ length: 5 }, (_, row) => Array.from({ length: 14 }, (_, k) => ({ c: BOX_COLORS[Math.floor(r() * 7)], h: 0.6 + r() * 0.4, w: 0.7 + r() * 0.3, row, k })));

/** Punto sulla parete degli scaffali: lato (-1 sinistra, 1 destra), profondità d (0 vicino, 1 lontano), quota h (0 pavimento, 1 cima). */
const P = (side: number, d: number, h: number) => {
  const x0 = side < 0 ? -260 : 1340, y0 = 1700, top0 = 500;
  const k = 1 - d * 0.82;
  const x = VX + (x0 - VX) * k;
  const yb = VY + (y0 - VY) * k, yt = VY + (top0 - VY) * k;
  return [x, lerp(yb, yt, h)] as const;
};

const Scaffale: React.FC<{ side: number }> = ({ side }) => {
  const quad = (d0: number, d1: number, h0: number, h1: number) => {
    const a = P(side, d0, h0), b = P(side, d1, h0), c = P(side, d1, h1), e = P(side, d0, h1);
    return `M${a[0]} ${a[1]} L${b[0]} ${b[1]} L${c[0]} ${c[1]} L${e[0]} ${e[1]} Z`;
  };
  return (
    <g strokeLinejoin="round">
      <path d={quad(0, 1, 0, 1)} fill="#3A4448" stroke={K} strokeWidth="8" />
      {SHELF.map((row, ri) => row.map((b) => {
        const d0 = b.k / 14, d1 = d0 + (1 / 14) * b.w;
        const h0 = 0.08 + ri * 0.18, h1 = h0 + 0.15 * b.h;
        return <path key={`${ri}-${b.k}`} d={quad(d0, d1, h0, h1)} fill={b.c} stroke={K} strokeWidth={Math.max(2, 5 * (1 - d0 * 0.8))} />;
      }))}
      {[0, 1, 2, 3, 4, 5].map((ri) => {
        const a = P(side, 0, 0.07 + ri * 0.18), b = P(side, 1, 0.07 + ri * 0.18);
        return <path key={ri} d={`M${a[0]} ${a[1]} L${b[0]} ${b[1]}`} stroke="#B8C0C4" strokeWidth="9" />;
      })}
      {/* cartellini dei prezzi */}
      {Array.from({ length: 8 }, (_, k) => {
        const a = P(side, k / 9, 0.07 + (k % 4) * 0.18);
        return <rect key={k} x={a[0] - 12} y={a[1] - 6} width="24" height="12" fill="#F2E83A" stroke={K} strokeWidth="2" />;
      })}
    </g>
  );
};

export const Fuga: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur, 540, 1100);
  const L = cam.layer;
  const tLights = griglia(cues[0] + 0.2);
  const tShirt = griglia(cues[1] + 0.9);
  const tAmb = griglia(cues[2] + 0.1);
  const amb = seg(t, tAmb, tAmb + 0.5);
  const band = eo(seg(t, tAmb + 0.6, tAmb + 1.3));
  const shirt = seg(t, tShirt - 0.7, tShirt);
  const tip = eo(seg(t, tShirt, tShirt + 0.3));
  const red = amb * (Math.sin(t * 12) > 0 ? 1 : 0.25);
  const white = amb * (Math.sin(t * 12) > 0 ? 0.25 : 1);
  const light = (k: number) => (t < tLights + k * 0.12 ? 0.15 : 1) * (0.94 + 0.06 * Math.sin(t * 40 + k * 3));

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="fg" />
        <BBDefs id="fg" />
        <BB2Defs id="fg" />
        <Lin id="fg-ceil" stops={[[0, '#0A0E10'], [0.7, '#1E2A2E'], [1, '#3A4A4E']]} />
        <Lin id="fg-floor" stops={[[0, '#8AA0A4'], [0.3, '#5A6E72'], [1, '#1A2426']]} />
        <Lin id="fg-night" stops={[[0, '#0A1224'], [1, '#1E2A44']]} />
        <Lin id="fg-shirt" stops={[[0, '#F2F2EC'], [1, '#C8C8C0']]} />
        <Lin id="fg-pants" stops={[[0, '#C8B890'], [1, '#8A7A58']]} />
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — soffitto scuro (calmo dietro il titolo), porte a vetri in fondo con il parcheggio e l'ambulanza (0,25) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="1200" fill="url(#fg-ceil)" />
          <rect x="430" y="760" width="220" height="200" fill="url(#fg-night)" stroke={K} strokeWidth="6" />
          <path d="M540 760 V960" stroke={K} strokeWidth="5" />
          <rect x="430" y="760" width="220" height="200" fill="#FF2A2A" opacity={0.9 * red} />
          <rect x="430" y="760" width="220" height="200" fill="#FFFFFF" opacity={0.5 * white} />
          <Glow id="fg-amb" x={540} y={880} r={520} t={t} color="#FF2A2A" amp={0.1} rate={12} opacity={0.85 * red} />
          <Glow id="fg-ambw" x={540} y={880} r={300} t={t} color="#FFFFFF" amp={0.1} rate={12} opacity={0.45 * white} />
          {/* insegna USCITA */}
          <rect x="490" y="720" width="100" height="30" rx="4" fill="#3AE87A" opacity=".85" stroke={K} strokeWidth="3" />
        </g>

        {/* PIANO 1 — file di neon sul soffitto, che si accendono verso il fondo (0,45) */}
        <g transform={L(0.45)}>
          {Array.from({ length: 7 }, (_, k) => {
            const d = 0.15 + k * 0.12, kk = 1 - d * 0.82;
            const y = VY + (690 - VY) * kk, w = 300 * kk;
            if (y < 650) return null;
            return (
              <g key={k}>
                <Glow id={`fg-n${k}`} x={540} y={y + 4} r={w * 1.3} t={t} color="#E8F6F2" amp={0.02} rate={20} opacity={0.35 * light(k)} />
                <rect x={540 - w / 2} y={y - 5 * kk} width={w} height={14 * kk} rx="4" fill="#F2FFFA" opacity={light(k)} stroke={K} strokeWidth="2" />
              </g>
            );
          })}
        </g>

        {/* PIANO 2 — scaffali ai lati in prospettiva, carrello abbandonato (0,7) */}
        <g transform={L(0.7)}>
          <path d={`M-260 1700 L${VX - 140} ${VY + 120} H${VX + 140} L1340 1700 Z`} fill="url(#fg-floor)" />
          {Array.from({ length: 8 }, (_, k) => {
            const kk = 1 - (k / 8) * 0.82, y = VY + (1700 - VY) * kk;
            return <path key={k} d={`M${VX - 800 * kk} ${y} H${VX + 800 * kk}`} stroke="#3A4A4E" strokeWidth={3 * kk + 1} opacity=".6" />;
          })}
          <Scaffale side={-1} />
          <Scaffale side={1} />
          {/* riflessi dei neon sul pavimento lucido */}
          <Reflection t={t} x={540} y={1060} color="#E8F6F2" n={8} w={60} gap={30} opacity={0.35 * light(0)} />
          {amb > 0 && <Reflection t={t} x={540} y={980} color="#FF4A4A" n={9} w={90} gap={30} opacity={0.8 * red} />}
          <g transform="translate(360 1200) scale(0.78)">
            <Ombra id="fg" x={20} y={40} rx={300} ry={30} />
            {/* pantaloni beige piegati male */}
            <path d="M-240 20 Q-200 -40 -60 -30 L120 -40 Q160 -20 130 20 L-20 30 L60 70 Q40 100 -10 80 L-150 50 Q-230 60 -240 20 Z" fill="url(#fg-pants)" stroke={K} strokeWidth="8" />
            <path d="M-60 -30 L-40 20 M-150 50 L-120 10" stroke="#6A5A3E" strokeWidth="4" />
            {/* calzini */}
            <path d="M150 50 q30 -20 60 0 q10 20 -14 26 q-30 6 -46 -26 Z" fill="#E8E8E0" stroke={K} strokeWidth="5" />
            <path d="M-260 70 q30 -20 60 0 q10 20 -14 26 q-30 6 -46 -26 Z" fill="#E8E8E0" stroke={K} strokeWidth="5" />
            {/* scarpe marroni (una si rovescia) */}
            <g transform={`translate(240 -20) rotate(${lerp(0, 70, tip)})`}>
              <path d="M-60 0 Q-60 -40 -20 -40 H30 Q70 -30 70 0 Z" fill="#5A3420" stroke={K} strokeWidth="6" />
              <path d="M-60 0 H70" stroke="#2A1810" strokeWidth="8" />
            </g>
            <g transform="translate(320 30)">
              <path d="M-60 0 Q-60 -40 -20 -40 H30 Q70 -30 70 0 Z" fill="#5A3420" stroke={K} strokeWidth="6" />
              <path d="M-60 0 H70" stroke="#2A1810" strokeWidth="8" />
            </g>
            {/* la camicia che cade sul mucchio */}
            {shirt > 0 && (
              <g transform={`translate(${lerp(-40, -60, shirt)} ${lerp(-520, -40, shirt * shirt)}) rotate(${lerp(-30, 6, shirt)})`}>
                <path d="M-130 -30 L-60 -60 H60 L130 -30 L110 20 L70 0 V60 H-70 V0 L-110 20 Z" fill="url(#fg-shirt)" stroke={K} strokeWidth="7" />
                <path d="M-20 -60 L0 -30 L20 -60 M0 -30 V56" stroke="#9A9A92" strokeWidth="4" fill="none" />
                {[-10, 10, 30].map((by) => <circle key={by} cx="0" cy={by} r="4" fill="#9A9A92" />)}
              </g>
            )}
            {/* braccialetto dell'ospedale */}
            {band > 0 && (
              <g transform={`translate(-30 ${lerp(-200, -46, band)}) scale(${band})`} opacity={band}>
                <ellipse cx="0" cy="0" rx="120" ry="34" fill="none" stroke="#F2F2F0" strokeWidth="22" />
                <ellipse cx="0" cy="0" rx="120" ry="34" fill="none" stroke={K} strokeWidth="3" />
                <rect x="-70" y="16" width="140" height="34" rx="6" fill="#FFFFFF" stroke={K} strokeWidth="4" />
                <text x="0" y="40" textAnchor="middle" fontFamily="sans-serif" fontWeight="800" fontSize="20" fill="#1A2A3A">W. WHITE</text>
                <rect x="-70" y="16" width="14" height="34" fill={ORO} />
              </g>
            )}
          </g>
          {amb > 0 && <path d={`M-260 1700 L${VX - 140} ${VY + 120} H${VX + 140} L1340 1700 Z`} fill="#FF2A2A" opacity={0.22 * red} />}
          {/* carrello */}
          <g transform="translate(800 1130) scale(0.75)">
            <Ombra id="fg" x={0} y={6} rx={170} ry={18} />
            <path d="M-140 -260 L140 -260 L110 -90 H-100 Z" fill="none" stroke="#C8D0D4" strokeWidth="9" />
            {Array.from({ length: 7 }, (_, k) => <path key={k} d={`M${-130 + k * 42} -258 L${-96 + k * 34} -92`} stroke="#A8B0B4" strokeWidth="4" />)}
            {Array.from({ length: 4 }, (_, k) => <path key={k} d={`M${-136 + k * 4} ${-220 + k * 40} H${134 - k * 6}`} stroke="#A8B0B4" strokeWidth="4" />)}
            <path d="M140 -260 L190 -320 H230" stroke="#C8D0D4" strokeWidth="10" fill="none" />
            <path d="M190 -320 H240" stroke="#C83A2A" strokeWidth="14" strokeLinecap="round" />
            <path d="M-100 -90 L-110 -20 M110 -90 L120 -20 M-110 -20 H120" stroke="#C8D0D4" strokeWidth="8" />
            {[-110, 120].map((wx) => <circle key={wx} cx={wx} cy="-6" r="16" fill="#2A2A2A" stroke={K} strokeWidth="4" />)}
            {/* due scatole nel carrello */}
            <rect x="-90" y="-310" width="80" height="70" fill="#F2B53A" stroke={K} strokeWidth="5" transform="rotate(-8 -50 -275)" />
            <rect x="0" y="-300" width="70" height="56" fill="#3A7AB8" stroke={K} strokeWidth="5" />
          </g>
        </g>

        {/* PIANO 3 — pavimento vicino con il mucchio di vestiti e il braccialetto (1,15) */}
        <g transform={L(1.15)}>
          <path d="M-200 1500 H1280 V2200 H-200 Z" fill="url(#fg-floor)" opacity=".9" />
          <path d="M-200 1500 H1280" stroke="#9AB0B4" strokeWidth="4" opacity=".6" />
          {/* scatole cadute dallo scaffale in primo piano a sinistra */}
          <g transform="translate(90 1800) rotate(14)">
            <rect x="-90" y="-120" width="180" height="120" fill="#F2B53A" stroke={K} strokeWidth="9" />
            <rect x="-60" y="-90" width="120" height="40" fill="#C83A2A" stroke={K} strokeWidth="4" />
          </g>
          <g transform="translate(230 1900) rotate(-20)"><rect x="-70" y="-90" width="140" height="90" fill="#3A7AB8" stroke={K} strokeWidth="8" /></g>
          {/* cestino rovesciato in primo piano a destra */}
          <g transform="translate(1000 1860) rotate(-12)">
            <path d="M-110 0 L-90 -200 H90 L110 0 Z" fill="#C83A2A" stroke={K} strokeWidth="9" />
            {Array.from({ length: 5 }, (_, k) => <path key={k} d={`M${-80 + k * 40} -186 V-20`} stroke="#8A1A12" strokeWidth="6" />)}
            <path d="M-100 -210 H100" stroke="#E8E8E0" strokeWidth="14" strokeLinecap="round" />
          </g>
        </g>

        {/* PIANO 4 — particelle vicine sotto i neon (1,6) */}
        <g transform={L(1.6)}>
          {Array.from({ length: 12 }, (_, i) => {
            const y = mod(i * 173 + t * 14, 1100) + 650;
            return <circle key={i} cx={mod(i * 211, 1080)} cy={y} r={2 + (i % 3)} fill="#E8F6F2" opacity=".35" />;
          })}
          <NearMotes id="fg-near" t={t} color="#E8F6F2" n={6} r0={70} r1={150} opacity={0.1} />
        </g>
      </g>
      <Finish id="fg" tint="#142235" tintOpacity={0.12} />
    </svg>
  );
};
