import React from 'react';
import { camera, eo, lerp, seg } from '../../lib/anim';
import { Dust, Glow, NearMotes, Wisps } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { ConjDefs, GOLD, K, Ombra, TINT_NOTTE } from './Comuni';

// I cacciatori di demoni: lo studio dei Warren di sera, con la lampada da scrivania verde. Su «Carolyn chiama Ed e
// Lorraine Warren» il telefono a disco squilla e la cornetta salta sulla forcella; su «lui studia i demoni, lei è una
// sensitiva» si accendono i due oggetti che li raccontano: il grosso libro sui demoni con il crocifisso (Ed) e la
// candela con il ciondolo (Lorraine); su «sente subito uno spirito maligno» la fiamma della candela si piega e diventa
// azzurra, e sulla fotografia della fattoria appoggiata alla lampada una macchia nera si allarga intorno alla casa. Dietro,
// gli scaffali con gli oggetti maledetti dei casi passati. Nessuna persona.
// Piani: parete e scaffali (0,3) · oggetti sugli scaffali (0,45) · scrivania e oggetti (0,75) · sedia e libri a terra (1,2) · fumo e polvere (1,6)

export const Warren: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const tRing = griglia(cues[0] + 0.3);
  const ringing = t > tRing && t < tRing + 3.2 && ((t - tRing) % 1.6) < 0.9;
  const hop = ringing ? Math.abs(Math.sin(t * 60)) * 8 : 0;
  const tSym = griglia(cues[1] + 0.3);
  const ed = eo(seg(t, tSym, tSym + 0.5));
  const lor = eo(seg(t, tSym + 60 / 72 * 2, tSym + 60 / 72 * 2 + 0.5));
  const tEvil = griglia(cues[2] + 0.6);
  const evil = eo(seg(t, tEvil, tEvil + 1.6));
  const bend = lerp(0, 28, evil);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="wa" />
        <ConjDefs id="wa" />
        <Lin id="wa-wall" stops={[[0, '#2A2420'], [0.5, '#3E342A'], [1, '#1E1A16']]} x2={1} y2={0} />
        <Lin id="wa-desk" stops={[[0, '#6A4428'], [1, '#2E1E12']]} />
        <Lin id="wa-shade" stops={[[0, '#2E6A4A'], [0.5, '#4E9A6A'], [1, '#1E4A32']]} x2={1} y2={0} />
        <radialGradient id="wa-stain"><stop offset="0" stopColor="#000" stopOpacity=".95" /><stop offset=".7" stopColor="#000" stopOpacity=".7" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
        <radialGradient id="wa-blue" cx=".5" cy=".7" r=".6"><stop offset="0" stopColor="#E8F4FF" /><stop offset=".5" stopColor="#7FB0E8" /><stop offset="1" stopColor="#3A5AC8" /></radialGradient>
      </defs>
      <g transform={cam.transform}>
        {/* parete con gli scaffali degli oggetti maledetti */}
        <g transform={L(0.3)}>
          <rect x="-300" y="-200" width="1700" height="1500" fill="url(#wa-wall)" />
          {[755, 955].map((y) => (
            <g key={y}>
              <rect x="-200" y={y} width="1500" height="22" fill="url(#wa-wood)" stroke={K} strokeWidth="6" />
              <path d={`M-200 ${y + 22} H1300`} stroke="#000" strokeWidth="12" opacity=".35" />
            </g>
          ))}
        </g>
        <g transform={`${L(0.45)} translate(0 115)`}>
          {/* ripiano alto: libri, una lanterna, un vaso sigillato, una campanella, uno specchio velato */}
          {[[-20, 560, 34, '#5A2A22'], [18, 570, 30, '#2A3A5A'], [52, 552, 36, '#3A4A2A'], [92, 566, 28, '#6A5A3A']].map(([x, y, w, c], i) => (
            <rect key={i} x={x as number} y={y as number} width={w as number} height={640 - (y as number)} fill={c as string} stroke={K} strokeWidth="5" />
          ))}
          <g transform="translate(250 640)">
            <path d="M-36 0 V-70 H36 V0 Z" fill="#2A2A2A" stroke={K} strokeWidth="6" />
            <path d="M-26 -10 V-60 H26 V-10 Z" fill="#C89A5A" opacity=".35" />
            <path d="M-30 -70 Q0 -100 30 -70 M0 -100 V-116" stroke={K} strokeWidth="6" fill="none" />
          </g>
          <g transform="translate(420 640)">
            <path d="M-40 0 Q-50 -60 -30 -90 H30 Q50 -60 40 0 Z" fill="#7A8A6A" stroke={K} strokeWidth="6" />
            <path d="M-34 -90 H34 V-104 H-34 Z" fill="#8A2A22" stroke={K} strokeWidth="5" />
            <path d="M-20 -60 Q0 -40 20 -60" stroke="#C8D0B0" strokeWidth="4" fill="none" opacity=".5" />
          </g>
          <g transform="translate(870 640)">
            <rect x="-70" y="-140" width="140" height="140" rx="10" fill="#5A3E24" stroke={K} strokeWidth="6" />
            <rect x="-54" y="-124" width="108" height="108" rx="6" fill="#8A9AA8" />
            <path d="M-60 -130 Q0 -90 60 -130 V-10 H-60 Z" fill="#1E1A16" opacity=".85" />
          </g>
          {/* ripiano basso: la teca di vetro con una sedia a dondolo vuota, una campanella, un rosario appeso */}
          <g transform="translate(250 840)">
            <rect x="-90" y="-170" width="180" height="170" fill="#140E0A" stroke={K} strokeWidth="7" />
            <path d="M-50 -10 V-90 H10 V-10 M-50 -60 H10 M-60 -6 Q-20 10 20 -6" stroke="#8A6A4A" strokeWidth="6" fill="none" />
            <rect x="-90" y="-170" width="180" height="170" fill="url(#wa-glass)" />
            <path d="M0 -170 V0" stroke={K} strokeWidth="5" />
          </g>
          <g transform="translate(640 840)">
            <path d="M-30 0 Q-30 -50 0 -56 Q30 -50 30 0 Z" fill="url(#wa-brass)" stroke={K} strokeWidth="5" />
            <path d="M0 -56 V-74" stroke={K} strokeWidth="6" />
            <circle cx="0" cy="4" r="7" fill="#8A6A2A" stroke={K} strokeWidth="3" />
          </g>
          <path d="M1000 660 Q980 740 1010 800" stroke="#C8B890" strokeWidth="4" strokeDasharray="2 8" strokeLinecap="round" fill="none" />
          <path d="M1010 800 V840 M996 818 H1024" stroke="#C8B890" strokeWidth="5" />
        </g>
        {/* la scrivania */}
        <g transform={L(0.75)}>
          <path d="M-200 1060 H1300 V1300 H-200 Z" fill="url(#wa-desk)" stroke={K} strokeWidth="10" />
          <path d="M-200 1062 H1300" stroke="#C89A5A" strokeWidth="5" opacity=".5" />
          {/* lampada verde da scrivania */}
          <g transform="translate(560 1060)">
            <Ombra id="wa" x={0} y={0} rx={120} ry={14} />
            <path d="M-40 0 Q-40 -16 0 -18 Q40 -16 40 0 Z" fill="url(#wa-brass)" stroke={K} strokeWidth="5" />
            <path d="M0 -18 V-150" stroke="url(#wa-brass)" strokeWidth="10" />
            <path d="M-120 -150 Q-118 -200 0 -206 Q118 -200 120 -150 Z" fill="url(#wa-shade)" stroke={K} strokeWidth="7" />
            <path d="M-120 -150 H120" stroke="#FFE8B0" strokeWidth="8" />
          </g>
          <Glow id="wa-lamp" x={560} y={1000} r={480} t={t} color="#FFD890" amp={0.03} rate={2} opacity={0.5} />
          {/* la fotografia della fattoria appoggiata alla lampada, con la macchia nera che si allarga */}
          <g transform="translate(560 1050) rotate(-4)">
            <rect x="-90" y="-150" width="180" height="150" fill="#F2EEE2" stroke={K} strokeWidth="5" />
            <rect x="-76" y="-138" width="152" height="108" fill="#8A9AA8" />
            <path d="M-76 -60 H76 V-30 H-76 Z" fill="#5A6A4A" />
            <path d="M-40 -60 V-100 L-6 -126 L28 -100 V-60 Z" fill="#D8D2C2" stroke={K} strokeWidth="3" />
            <path d="M44 -60 V-120 M44 -110 L60 -126 M44 -100 L30 -116" stroke="#2A2420" strokeWidth="4" />
            {evil > 0 && <ellipse cx="-6" cy="-90" rx={lerp(0, 90, evil)} ry={lerp(0, 66, evil)} fill="url(#wa-stain)" opacity={0.85 * evil} />}
          </g>
          {/* il telefono a disco che squilla */}
          <g transform={`translate(230 1110)`}>
            <Ombra id="wa" x={0} y={0} rx={120} ry={14} />
            <path d="M-100 0 Q-96 -70 -60 -80 H60 Q96 -70 100 0 Z" fill="#1A1A1E" stroke={K} strokeWidth="7" />
            <circle cx="0" cy="-36" r="34" fill="#E8E2D2" stroke={K} strokeWidth="5" />
            {Array.from({ length: 10 }, (_, i) => {
              const a = (i / 10) * Math.PI * 1.6 + 0.6;
              return <circle key={i} cx={Math.cos(a) * 22} cy={-36 + Math.sin(a) * 22} r="5" fill="#1A1A1E" />;
            })}
            <g transform={`translate(0 ${-92 - hop}) rotate(${ringing ? Math.sin(t * 50) * 3 : 0})`}>
              <path d="M-110 0 Q-110 -30 -80 -30 H80 Q110 -30 110 0 Q90 10 70 -4 H-70 Q-90 10 -110 0 Z" fill="#1A1A1E" stroke={K} strokeWidth="7" />
              <path d="M-80 -24 H80" stroke="#6A6A72" strokeWidth="4" opacity=".6" />
            </g>
            {ringing && [0, 1, 2].map((i) => (
              <path key={i} d={`M${-130 - i * 18} ${-120 + i * 6} q-14 30 0 60 M${130 + i * 18} ${-120 + i * 6} q14 30 0 60`} stroke={GOLD} strokeWidth="5" fill="none" opacity={0.8 - i * 0.2} strokeLinecap="round" />
            ))}
          </g>
          {/* Ed: il grosso libro sui demoni con il crocifisso */}
          <g transform="translate(830 1150)">
            <Ombra id="wa" x={0} y={0} rx={150} ry={16} />
            <path d="M-130 0 L-110 -60 H120 L130 0 Z" fill="#4A1E1A" stroke={K} strokeWidth="7" />
            <path d="M-118 -12 H118" stroke="#E8E0C8" strokeWidth="10" />
            <path d="M-110 -60 Q0 -76 120 -60" stroke="#E8E0C8" strokeWidth="6" fill="none" />
            <g transform="translate(10 -96)">
              {ed > 0 && <Glow id="wa-ed" x={0} y={-10} r={160} t={t} color={GOLD} amp={0.08} rate={3} opacity={0.6 * ed} />}
              <path d="M-12 -60 H12 V-20 H44 V4 H12 V64 H-12 V4 H-44 V-20 H-12 Z" fill={ed > 0.5 ? GOLD : '#8A6A3A'} stroke={K} strokeWidth="5" transform="scale(.8)" />
            </g>
          </g>
          {/* Lorraine: la candela con il ciondolo, la cui fiamma si piega e diventa azzurra */}
          <g transform="translate(400 1110)">
            <Ombra id="wa" x={0} y={0} rx={60} ry={10} />
            <path d="M-40 0 Q-40 -12 0 -14 Q40 -12 40 0 Z" fill="url(#wa-brass)" stroke={K} strokeWidth="4" />
            <rect x="-14" y="-110" width="28" height="98" fill="#F2EAD4" stroke={K} strokeWidth="4" />
            <path d="M0 -110 V-118" stroke={K} strokeWidth="3" />
            <g transform={`translate(0 -118) rotate(${bend})`}>
              <path d={`M-9 0 Q-9 -24 ${Math.sin(t * 8) * 2} ${-40 - 4 * Math.sin(t * 13)} Q9 -24 9 0 Q0 5 -9 0 Z`} fill={evil > 0.5 ? 'url(#wa-blue)' : 'url(#wa-flame)'} />
            </g>
            <Glow id="wa-cand" x={0} y={-140} r={110 + 40 * lor} t={t} color={evil > 0.5 ? '#7FB0E8' : GOLD} amp={0.1} rate={9} opacity={0.4 + 0.3 * lor} />
            {/* il ciondolo con la catenina */}
            <path d="M30 -4 Q60 -30 90 -4" stroke="#C8A060" strokeWidth="3" fill="none" />
            <circle cx="90" cy="-2" r="10" fill={lor > 0.5 ? GOLD : '#8A6A3A'} stroke={K} strokeWidth="3" />
          </g>
          {evil > 0 && <Wisps t={t} x={400} y={1000} n={2} h={200} color="#4A5A6A" opacity={0.5 * evil} />}
        </g>
        {/* primo piano: lo schienale della poltrona di pelle e una pila di cartelline dei casi */}
        <g transform={L(1.2)}>
          <path d="M-200 1300 H1300 V2200 H-200 Z" fill="#140E0A" />
          <path d="M-220 1220 Q-100 1160 60 1210 Q90 1400 60 1800 H-220 Z" fill="#5A2A1E" stroke={K} strokeWidth="10" />
          {[1260, 1360, 1460].map((y) => <circle key={y} cx="0" cy={y} r="7" fill="#2A120C" />)}
          <g transform="translate(920 1350)">
            {[0, 1, 2, 3].map((i) => (
              <g key={i} transform={`translate(${(i % 2) * 14 - 6} ${-i * 34}) rotate(${(i % 2 ? 3 : -2)})`}>
                <rect x="-150" y="-30" width="300" height="34" fill={i % 2 ? '#C8A878' : '#B89868'} stroke={K} strokeWidth="5" />
                <rect x="60" y="-40" width="60" height="14" fill={i % 2 ? '#C8A878' : '#B89868'} stroke={K} strokeWidth="4" />
              </g>
            ))}
          </g>
        </g>
        <g transform={L(1.6)}>
          <Dust t={t} top={{ y: 900, x0: 460, x1: 660 }} bottom={{ y: 1300, x0: 300, x1: 820 }} seed={68} n={22} color="#FFE6B0" boost={0.1} />
          <NearMotes id="wa-near" t={t} color="#FFE6B0" n={5} y0={1100} opacity={0.06} />
        </g>
      </g>
      <Finish id="wa" tint={TINT_NOTTE} tintOpacity={0.1} />
    </svg>
  );
};
