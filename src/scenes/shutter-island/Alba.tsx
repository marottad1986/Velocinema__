import React from 'react';
import { camera, eio, eo, lerp, mod, rng, seg, wavePath } from '../../lib/anim';
import { Finish, FxDefs, GlowGradient, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';

// All'alba: gradini all'alba, cappello lasciato, impronte che compaiono verso il faro, gabbiani.
// Piani: cielo con sole e raggi (0,2) · nubi basse (0,3) · promontorio col faro (0,4) · mare dorato (0,5)
//        · spiaggia con impronte (0,65) · gabbiani (0,6) · gradini col cappello ed erba in primo piano (1,1–1,3)
//        · luccichii davanti alla camera (1,7)

const K = '#0B1418';
const HORIZON = 1090;

// Impronte: dalla cima dei gradini verso il faro, lungo una curva, sempre più piccole (prospettiva).
// Partono con «o morire da uomo per bene?» (6,17 s) e arrivano al faro durante «E si lascia portare al faro».
const PRINTS_A = 6.3;
const PRINTS_STEP = 0.3;
const N_PRINTS = 14;
const bez = (p: number) => {
  const a = { x: 470, y: 1262 };
  const c = { x: 690, y: 1250 };
  const b = { x: 792, y: 1150 };
  const u = 1 - p;
  return { x: u * u * a.x + 2 * u * p * c.x + p * p * b.x, y: u * u * a.y + 2 * u * p * c.y + p * p * b.y };
};
const PRINTS = Array.from({ length: N_PRINTS }, (_, i) => {
  const p = (i + 0.5) / N_PRINTS;
  const q = bez(p);
  const q2 = bez(Math.min(1, p + 0.02));
  const ang = (Math.atan2(q2.y - q.y, q2.x - q.x) * 180) / Math.PI;
  const s = lerp(1, 0.38, p);
  const side = i % 2 ? 1 : -1;
  const nx = -Math.sin((ang * Math.PI) / 180) * 13 * s * side;
  const ny = Math.cos((ang * Math.PI) / 180) * 13 * s * side;
  return { x: q.x + nx, y: q.y + ny, ang, s, at: PRINTS_A + i * PRINTS_STEP };
});

const r = rng(2010);
const SPURT = PRINTS.map(() => Array.from({ length: 6 }, () => ({ a: -Math.PI * (0.15 + r() * 0.7), v: 40 + r() * 70, s: 2 + r() * 3 })));
const GLINT = Array.from({ length: 26 }, () => ({ x: r() * 1300 - 110, y: HORIZON + 8 + r() * 90, w: 10 + r() * 26, rate: 1.5 + r() * 3, ph: r() * 6 }));
const NEAR = Array.from({ length: 7 }, (_, i) => ({ x: r() * 1080, y: 600 + r() * 1100, rad: 30 + r() * 50, ph: i * 1.1 }));
const GRASS = Array.from({ length: 16 }, (_, i) => ({ x: 700 + i * 26 + r() * 14, h: 120 + r() * 140, lean: r() * 30 - 10, ph: r() * 6 }));

const gull = (flap: number, s = 1) => {
  const a = -18 * flap * s;
  return `M${-36 * s} 0 q${18 * s} ${a} ${36 * s} 0 q${18 * s} ${a} ${36 * s} 0`;
};

/** Cappello da sceriffo lasciato sui gradini (stesso motivo dei capitoli precedenti). */
const Hat: React.FC<{ band: string }> = ({ band }) => (
  <g>
    <ellipse cx="6" cy="10" rx="112" ry="16" fill="#000" opacity=".3" />
    <path d="M-104 0 Q0 -20 104 0 Q76 16 0 18 Q-76 16 -104 0 Z" fill="#141E26" stroke={K} strokeWidth="7" strokeLinejoin="round" />
    <path d="M-62 -6 L-52 -74 Q0 -96 52 -74 L62 -6 Z" fill="#1C2A34" stroke={K} strokeWidth="7" strokeLinejoin="round" />
    <path d="M-60 -26 H60" stroke={band} strokeWidth="13" />
    {/* bordo dorato dal sole (a destra) */}
    <path d="M30 -82 Q50 -76 58 -10" fill="none" stroke="#FFC98A" strokeWidth="5" opacity=".85" />
    <path d="M40 -2 Q80 2 100 0" fill="none" stroke="#FFC98A" strokeWidth="4" opacity=".7" />
    <path d="M-8 -90 Q0 -74 8 -90" fill="none" stroke={K} strokeWidth="5" />
  </g>
);

export const Alba: React.FC<SceneProps> = ({ t, dur, palette: P }) => {
  const cam = camera(t, dur, 560, 1100);
  const L = cam.layer;

  // Il sole sale piano sull'orizzonte; alone che pulsa
  const sun = { x: 590, y: lerp(1110, 1010, eio(seg(t, 0, dur))) };
  const pulse = 0.5 + 0.5 * Math.sin(t * 1.4);
  const reflX = sun.x + cam.pan * (0.5 - 0.2);
  // Il faro (fattore 0,4): lanterna ancora accesa che si spegne con la luce del giorno
  const lamp = 1 - 0.6 * seg(t, 2, dur);
  // Risacca: la schiuma avanza e si ritira
  const surf = Math.sin(t * 0.9);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="al" />
        <Lin id="al-sky" stops={[[0, '#0E2A36'], [0.25, '#245160'], [0.42, '#5A7A80'], [0.58, '#D9987A'], [0.72, '#F7B87E'], [0.84, '#FFDCA0']]} />
        <Lin id="al-sea" stops={[[0, '#A8846A'], [0.12, '#5E7E80'], [0.5, '#3E6C72'], [1, '#22464E']]} />
        <Lin id="al-sand" stops={[[0, '#D9B48A'], [0.3, '#B8936E'], [1, '#6E5440']]} />
        <Lin id="al-rock" x2={1} y2={0} stops={[[0, '#2A3A3C'], [0.55, '#43585A'], [1, '#6E7E78']]} />
        <Lin id="al-tower" x2={1} y2={0} stops={[[0, '#FFE6C8'], [0.5, '#E9E4DC'], [1, '#9FA9AC']]} />
        <Lin id="al-step" x2={1} y2={0} stops={[[0, '#3E4A4A'], [0.6, '#6E7672'], [1, '#A49A86']]} />
        <Lin id="al-stepTop" stops={[[0, '#C9B89A'], [1, '#8A8474']]} />
        <Lin id="al-dune" stops={[[0, '#9C7E5E'], [1, '#3A2C22']]} />
        <GlowGradient id="al-sunglow" color="#FFD9A0" core={0.95} mid={0.4} />
        <GlowGradient id="al-halo" color="#FFB27A" core={0.5} mid={0.18} />
        <GlowGradient id="al-lamp" color="#FFE7A0" />
        <GlowGradient id="al-cloud" color="#E7A784" core={0.85} mid={0.5} />
        <GlowGradient id="al-mist" color="#FFE2C0" core={0.6} mid={0.25} />
        <GlowGradient id="al-glint" color="#FFF1CF" core={0.9} mid={0.35} />
        <radialGradient id="al-ray" gradientUnits="userSpaceOnUse" cx={sun.x} cy={sun.y} r="1100">
          <stop offset="0" stopColor="#FFE7B8" stopOpacity=".5" />
          <stop offset=".5" stopColor="#FFE7B8" stopOpacity=".12" />
          <stop offset="1" stopColor="#FFE7B8" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo dell'alba con sole e raggi (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height={HORIZON + 260} fill="url(#al-sky)" />
          {/* ultime stelle che svaniscono in alto */}
          {[[140, 180], [420, 120], [760, 210], [980, 150], [300, 300], [880, 330]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={2.5 + (i % 2)} fill="#E9F0F2" opacity={(0.25 + 0.3 * Math.sin(t * (1.3 + i * 0.4) + i)) * (1 - seg(t, 0, dur) * 0.8)} />
          ))}
          {/* raggi del sole che ruotano lentamente */}
          <g transform={`rotate(${t * 1.6} ${sun.x} ${sun.y})`} opacity={0.65 + pulse * 0.2}>
            {Array.from({ length: 9 }, (_, i) => {
              const a = ((i / 9) * Math.PI * 2);
              const w = 0.09 + (i % 3) * 0.03;
              const R = 1300;
              return (
                <path key={i} d={`M${sun.x} ${sun.y} L${sun.x + Math.cos(a - w) * R} ${sun.y + Math.sin(a - w) * R} L${sun.x + Math.cos(a + w) * R} ${sun.y + Math.sin(a + w) * R} Z`} fill="url(#al-ray)" />
              );
            })}
          </g>
          <circle cx={sun.x} cy={sun.y} r={520 + pulse * 30} fill="url(#al-halo)" />
          <circle cx={sun.x} cy={sun.y} r={210 + pulse * 14} fill="url(#al-sunglow)" />
          <circle cx={sun.x} cy={sun.y} r="92" fill="#FFE6A8" />
          <circle cx={sun.x} cy={sun.y} r="92" fill="none" stroke="#FFB45C" strokeWidth="6" opacity=".9" />
        </g>

        {/* PIANO 1 — nubi basse illuminate da sotto (0,3) */}
        <g transform={L(0.3, Math.sin(t * 0.2) * 24)}>
          <ellipse cx="180" cy="860" rx="380" ry="34" fill="url(#al-cloud)" opacity=".75" />
          <ellipse cx="860" cy="790" rx="320" ry="28" fill="url(#al-cloud)" opacity=".6" />
          <ellipse cx="480" cy="960" rx="420" ry="22" fill="url(#al-cloud)" opacity=".55" />
          <path d="M-20 872 Q180 846 380 872" fill="none" stroke="#FFD9A8" strokeWidth="4" opacity=".55" strokeLinecap="round" />
          <path d="M700 800 Q860 780 1020 800" fill="none" stroke="#FFD9A8" strokeWidth="4" opacity=".5" strokeLinecap="round" />
        </g>

        {/* PIANO 2 — promontorio con il faro e costa lontana (0,4) */}
        <g transform={L(0.4)}>
          <path d="M-200 1096 L-200 1040 Q-60 1010 60 1036 Q160 1016 260 1046 Q320 1064 360 1096 Z" fill="#4E5E62" opacity=".8" />
          <path d="M640 1096 Q700 1040 770 1022 Q820 990 900 996 Q980 980 1050 1010 Q1140 1030 1280 1060 V1096 Z" fill="url(#al-rock)" stroke={K} strokeWidth="6" strokeLinejoin="round" />
          <path d="M770 1022 Q820 990 900 996" fill="none" stroke="#FFC98A" strokeWidth="4" opacity=".7" />
          {/* faro */}
          <path d="M836 1004 L846 868 H888 L898 1004 Z" fill="url(#al-tower)" stroke={K} strokeWidth="5" strokeLinejoin="round" />
          <path d="M842 930 H892 M839 968 H895" stroke="#B5562F" strokeWidth="12" />
          <path d="M850 872 L842 1000" stroke="#FFF3E0" strokeWidth="3" opacity=".8" />
          <circle cx="867" cy="852" r={60 + pulse * 10} fill="url(#al-lamp)" opacity={0.55 * lamp} />
          <rect x="848" y="836" width="38" height="32" fill="#FFE7A0" stroke={K} strokeWidth="4" />
          <path d="M842 838 L867 816 L892 838 Z" fill={K} />
          <circle cx="867" cy="852" r="6" fill="#FFFFFF" opacity={lamp} />
          {/* casetta del guardiano */}
          <path d="M920 1004 V976 L948 958 L976 976 V1004 Z" fill="#D9CFC0" stroke={K} strokeWidth="4" strokeLinejoin="round" />
          <rect x="940" y="980" width="14" height="16" fill="#3A4448" />
        </g>

        {/* foschia sull'orizzonte (0,45) */}
        <g transform={L(0.45, Math.sin(t * 0.3) * 40)}>
          <ellipse cx="500" cy={HORIZON} rx="900" ry="46" fill="url(#al-mist)" opacity=".5" />
        </g>

        {/* PIANO 3 — mare dorato con il riflesso del sole (0,5) */}
        <g transform={L(0.5)}>
          <rect x="-200" y={HORIZON} width="1480" height="260" fill="url(#al-sea)" />
          <path d={`M-200 ${HORIZON} H1280`} stroke="#FFE0A8" strokeWidth="3" opacity=".7" />
          {/* colonna di luce del sole sull'acqua */}
          {Array.from({ length: 9 }, (_, i) => {
            const w = (150 - i * 12) * (0.55 + 0.45 * Math.sin(t * 3 + i * 1.7));
            return <rect key={i} x={reflX - w / 2 + Math.sin(t * 1.3 + i) * 12} y={HORIZON + 6 + i * 11} width={w} height="5" rx="2.5" fill="#FFF0C8" opacity={0.85 - i * 0.06} />;
          })}
          {GLINT.map((g, i) => (
            <rect key={i} x={g.x} y={g.y} width={g.w} height="3" rx="1.5" fill="#FFD9A0" opacity={0.15 + 0.45 * Math.max(0, Math.sin(t * g.rate + g.ph))} />
          ))}
          <path d={wavePath(HORIZON + 30, 4, 180)} transform={`translate(${-mod(t * 24, 180)} 0)`} fill="none" stroke="#F2C58E" strokeWidth="3" strokeLinecap="round" opacity=".5" />
          <path d={wavePath(HORIZON + 62, 6, 240)} transform={`translate(${-mod(t * 34, 240)} 0)`} fill="none" stroke="#F2C58E" strokeWidth="4" strokeLinecap="round" opacity=".45" />
        </g>

        {/* PIANO 4 — spiaggia con risacca e impronte (0,65) */}
        <g transform={L(0.65)}>
          <path d="M-200 1200 Q300 1166 700 1150 Q960 1140 1280 1128 V2000 H-200 Z" fill="url(#al-sand)" />
          {/* sabbia bagnata e schiuma della risacca */}
          <path d={`M-200 ${1192 + surf * 6} Q300 ${1160 + surf * 6} 700 ${1146 + surf * 5} Q960 ${1136 + surf * 4} 1280 ${1124 + surf * 4} V1100 H-200 Z`} fill="#8E7A62" opacity=".55" />
          <path d={`M-200 ${1186 + surf * 10} Q300 ${1156 + surf * 10} 700 ${1142 + surf * 8} Q960 ${1132 + surf * 7} 1280 ${1120 + surf * 6}`} fill="none" stroke="#FFF4E2" strokeWidth="6" strokeLinecap="round" opacity={0.6 + 0.2 * surf} strokeDasharray="80 26" strokeDashoffset={t * 20} />
          {/* ondulazioni della sabbia e conchiglie */}
          <path d="M60 1300 q60 -8 120 0 M260 1340 q80 -10 160 0 M620 1290 q60 -8 120 0 M820 1330 q70 -8 140 0 M560 1400 q90 -10 180 0" fill="none" stroke="#9C7C5C" strokeWidth="4" strokeLinecap="round" opacity=".6" />
          <path d="M600 1220 q10 -14 20 0 z M980 1200 q8 -12 16 0 z" fill="#F2E2CC" stroke={K} strokeWidth="3" />
          {/* legno portato dal mare */}
          <path d="M880 1236 L1010 1218" stroke="#5A4332" strokeWidth="14" strokeLinecap="round" />
          <path d="M880 1236 L1010 1218" stroke={K} strokeWidth="3" opacity=".5" />
          <path d="M890 1228 L1000 1213" stroke="#C9A884" strokeWidth="3" opacity=".7" />

          {/* le impronte, una dopo l'altra, con un piccolo spruzzo di sabbia */}
          {PRINTS.map((pr, i) => {
            const p = seg(t, pr.at, pr.at + 0.12);
            if (p <= 0) return null;
            const age = t - pr.at;
            return (
              <g key={i}>
                <g transform={`translate(${pr.x} ${pr.y}) rotate(${pr.ang}) scale(${pr.s * lerp(1.15, 1, eo(p))})`} opacity={p}>
                  <ellipse cx="8" cy="0" rx="20" ry="11" fill="#8A6A4E" />
                  <ellipse cx="-20" cy="0" rx="11" ry="9" fill="#8A6A4E" />
                  <path d="M-8 -9 Q10 -14 26 -6" fill="none" stroke="#F2D9B4" strokeWidth="3" opacity=".7" />
                </g>
                {age < 0.7 &&
                  SPURT[i].map((s, k) => {
                    const a = age / 0.7;
                    return (
                      <circle key={k} cx={pr.x + Math.cos(s.a) * s.v * a * pr.s} cy={pr.y + (Math.sin(s.a) * s.v * a + 120 * a * a) * pr.s} r={s.s * pr.s + 0.6} fill="#E9CFA6" opacity={(1 - a) * 0.9} />
                    );
                  })}
              </g>
            );
          })}
        </g>

        {/* gabbiani (0,6) */}
        <g transform={L(0.6)} fill="none" stroke={K} strokeLinecap="round">
          <path d={gull(0.9 + 0.6 * Math.sin(t * 7), 1.25)} transform={`translate(${lerp(120, 860, mod(t / 13, 1))} ${640 + Math.sin(t * 1.8) * 20})`} strokeWidth="7" />
          <path d={gull(0.9 + 0.6 * Math.sin(t * 8 + 1), 1)} transform={`translate(${lerp(-40, 760, mod(t / 11 + 0.25, 1))} ${730 + Math.sin(t * 2.2 + 1) * 16})`} strokeWidth="6" />
          <path d={gull(0.9 + 0.6 * Math.sin(t * 9 + 2), 0.7)} transform={`translate(${lerp(980, 260, mod(t / 15 + 0.5, 1))} ${590 + Math.sin(t * 2.5 + 2) * 12})`} strokeWidth="5" />
          <path d={gull(0.9 + 0.6 * Math.sin(t * 10 + 3), 0.5)} transform={`translate(${lerp(700, 1000, mod(t / 9, 1))} ${880 + Math.sin(t * 3) * 8})`} strokeWidth="4" />
        </g>

        {/* PIANO 5 — gradini di pietra col cappello lasciato (1,1) */}
        <g transform={L(1.1)}>
          {[0, 1, 2, 3, 4].map((k) => {
            const top = 1262 + k * 150;
            const right = 470 + k * 70;
            return (
              <g key={k}>
                {/* alzata */}
                <path d={`M-200 ${top + 26} H${right} L${right + 10} ${top + 176} H-200 Z`} fill="url(#al-step)" stroke={K} strokeWidth="9" strokeLinejoin="round" />
                {/* pedata */}
                <path d={`M-200 ${top} H${right - 14} L${right} ${top + 26} H-200 Z`} fill="url(#al-stepTop)" stroke={K} strokeWidth="8" strokeLinejoin="round" />
                {/* bordo dorato dal sole */}
                <path d={`M-200 ${top + 3} H${right - 16}`} stroke="#FFD9A0" strokeWidth="4" opacity=".75" />
                <path d={`M${right - 4} ${top + 30} L${right + 5} ${top + 168}`} stroke="#FFC98A" strokeWidth="4" opacity=".6" />
                {/* crepe e muschio */}
                <path d={`M${right - 120 - k * 30} ${top + 40} l10 22 l-6 18 l14 24 l-4 30`} fill="none" stroke={K} strokeWidth="4" opacity=".5" />
                <path d={`M-40 ${top + 26} q30 -10 60 0 q20 8 50 0`} fill="none" stroke="#5E7A52" strokeWidth="7" strokeLinecap="round" opacity=".8" />
              </g>
            );
          })}
          {/* il cappello, lasciato sul primo gradino */}
          <g transform={`translate(300 1250) rotate(-4) scale(.9)`}>
            <Hat band={P.accento} />
          </g>
        </g>

        {/* PIANO 6 — duna con erba che ondeggia, a destra (1,3) */}
        <g transform={L(1.3)}>
          <path d="M600 1980 Q700 1660 880 1600 Q1000 1570 1240 1600 V1980 Z" fill="url(#al-dune)" stroke={K} strokeWidth="9" strokeLinejoin="round" />
          <path d="M720 1700 Q800 1630 900 1612" fill="none" stroke="#FFD9A0" strokeWidth="5" opacity=".6" strokeLinecap="round" />
          {GRASS.map((g, i) => {
            const sway = Math.sin(t * 1.6 + g.ph) * 10;
            const baseY = 1640 + Math.abs(g.x - 900) * 0.25;
            return (
              <path key={i} d={`M${g.x} ${baseY} Q${g.x + g.lean * 0.5} ${baseY - g.h * 0.6} ${g.x + g.lean + sway} ${baseY - g.h}`} fill="none" stroke={i % 3 ? '#4E5A3A' : '#8A8A5A'} strokeWidth={i % 2 ? 7 : 5} strokeLinecap="round" />
            );
          })}
          {/* paletto di una vecchia staccionata */}
          <rect x="1000" y="1460" width="34" height="300" fill="#5A4332" stroke={K} strokeWidth="8" />
          <path d="M1026 1468 V1750" stroke="#FFC98A" strokeWidth="4" opacity=".6" />
        </g>

        {/* PIANO 7 — luccichii caldi davanti alla camera (1,7) */}
        <g transform={L(1.7)}>
          {NEAR.map((n, i) => (
            <circle key={i} cx={n.x + Math.sin(t * 0.5 + n.ph) * 50} cy={n.y - mod(t * 12 + i * 80, 300) + 150} r={n.rad} fill="url(#al-glint)" opacity={0.08 + 0.05 * Math.sin(t * 2 + n.ph)} />
          ))}
        </g>
      </g>

      <Finish id="al" tint="#0E3A40" tintOpacity={0.1} />
    </svg>
  );
};
