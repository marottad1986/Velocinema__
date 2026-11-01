import React from 'react';
import { camera, eio, eo, lerp, mod, rng, seg } from '../../lib/anim';
import { Dust, Glow, Gulls, NearMotes, SunRays, WaveLines } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { SANS } from '../../lib/fonts';
import type { SceneProps } from '../../types';
import { Amber, Helicopter, JPDefs, K, RaptorHead, TRex } from './Comuni';

// La fuga: l'atrio del centro visitatori, con le grandi vetrate sul mare, lo scheletro da museo e lo striscione
// «QUANDO I DINOSAURI DOMINAVANO LA TERRA» (oggetto chiave). Dinosauri generici, nel nostro stile.
// Eventi: prima frase due raptor piumati nell'atrio; seconda frase entra il T-rex e ruggisce, l'atrio trema; terza frase
// lo striscione si stacca e cade (cue 2 → + 1,2, il telo dello spartito); quarta frase all'alba l'elicottero parte nelle
// vetrate; quinta frase il bastone di Hammond col pomo d'ambra resta appoggiato e si spegne (rinuncia al parco); sesta
// frase sul mare volano gli uccelli, i discendenti dei dinosauri.
// Piani: alba e mare oltre le vetrate (0,2) · elicottero e uccelli (0,3) · vetrate (0,45) · scheletro (0,6) · dinosauri (0,7)
//        · striscione (0,85) · bastone e ossa a terra (1,1) · polvere (1,5–1,8)

const r = rng(77);
const DEBRIS = Array.from({ length: 16 }, () => ({ x: 120 + r() * 840, v: 200 + r() * 400, s: 8 + r() * 14, ph: r() }));

export const Fuga: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const raptors = eo(seg(t, cues[0] + 0.2, cues[0] + 1)) * (1 - eo(seg(t, cues[1] + 0.6, cues[2])));
  const rex = eio(seg(t, cues[1] - 0.3, cues[1] + 0.8)) * (1 - eio(seg(t, cues[3] + 0.5, cues[4] + 0.5)));
  const roar = seg(t, cues[2] + 0.9, cues[2] + 1.2) * (1 - seg(t, cues[2] + 2.2, cues[2] + 2.6)) + seg(t, cues[1] + 0.5, cues[1] + 0.8) * (1 - seg(t, cues[1] + 1.4, cues[1] + 1.8));
  const shake = t > cues[1] && t < cues[2] + 1 ? Math.sin(t * 30) * 2 * (1 - seg(t, cues[2], cues[2] + 1)) : 0;
  const fall = eio(seg(t, cues[2], cues[2] + 1.2));
  const heli = eio(seg(t, cues[3], dur));
  const dawn = eo(seg(t, cues[3], dur));
  const cane = eo(seg(t, cues[4], cues[4] + 0.8));
  const birds = seg(t, cues[5], cues[5] + 1);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="fg" />
        <JPDefs id="fg" />
        <Lin id="fg-sky" stops={[[0, '#2A3A50'], [0.5, '#8A7A8A'], [0.8, '#F2B47A'], [1, '#F8D8A0']]} />
        <Lin id="fg-sea" stops={[[0, '#6A7A8A'], [1, '#2A3A4A']]} />
        <Lin id="fg-wall" stops={[[0, '#2A2A22'], [0.5, '#4A4636'], [1, '#5A5442']]} />
        <Lin id="fg-floor" stops={[[0, '#8A7A5A'], [1, '#3A3020']]} />
        <Lin id="fg-banner" stops={[[0, '#F2E6C8'], [1, '#C8B890']]} />
        <Lin id="fg-bone" x2={1} y2={0} stops={[[0, '#E8DCC0'], [0.5, '#F8F0DC'], [1, '#B8AC90']]} />
      </defs>

      <g transform={cam.transform}>
        <g transform={`translate(${shake} 0)`}>
          {/* PIANO 0 — alba e mare oltre le vetrate (0,2) */}
          <g transform={L(0.2)}>
            <rect x="-200" y="-200" width="1480" height="2400" fill="url(#fg-sky)" />
            <rect x="-200" y="-200" width="1480" height="2400" fill="#F8C890" opacity={0.25 * dawn} />
            <SunRays id="fg-rays" x={540} y={1010} t={t} color="#FFE8C0" n={10} length={900} opacity={0.15 + 0.25 * dawn} />
            <circle cx="540" cy="1010" r={50 + 20 * dawn} fill="#FFE0A0" />
            <rect x="-200" y="1010" width="1480" height="200" fill="url(#fg-sea)" />
            <WaveLines t={t} ys={[1030, 1060, 1090]} color="#F2C890" amp={4} w={120} speed={0.4} width={3} opacity={0.5} />
          </g>
          {/* PIANO 1 — l'elicottero che parte, gli uccelli sul mare (0,3) */}
          <g transform={L(0.3)}>
            <g opacity={seg(t, cues[3], cues[3] + 0.3)}><Helicopter x={lerp(400, 1000, heli)} y={lerp(760, 660, heli)} s={lerp(0.6, 0.35, heli)} t={t} tilt={-8} color="#E9E2CF" /></g>
            <g opacity={birds}><Gulls t={t} seed={9} n={6} y={760} h={200} color="#2A2A30" size={1.1} period={5} /></g>
          </g>

          {/* PIANO 2 — parete e grandi vetrate (0,45) */}
          <g transform={L(0.45)}>
            <path d="M-200 -200 H1280 V1260 H-200 Z M-60 600 V1120 H1140 V600 Z" fill="url(#fg-wall)" fillRule="evenodd" />
            {[-60, 240, 540, 840, 1140].map((x) => <rect key={x} x={x - 12} y="590" width="24" height="540" fill="#3A3426" stroke={K} strokeWidth="5" />)}
            <rect x="-80" y="586" width="1240" height="20" fill="#3A3426" stroke={K} strokeWidth="5" />
            <path d="M-40 620 L100 1100 M10 620 L150 1100" stroke="#FFFFFF" strokeWidth="10" opacity=".06" />
          </g>

          {/* PIANO 3 — lo scheletro da museo (0,6) */}
          <g transform={L(0.6)}>
            <g transform="translate(140 1150)" stroke={K} strokeWidth="5" fill="url(#fg-bone)">
              <path d="M0 0 V-80 M-20 0 H20" stroke="#3A3426" strokeWidth="10" />
              <path d="M-140 -260 Q-40 -330 100 -310" fill="none" stroke="url(#fg-bone)" strokeWidth="20" />
              {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M${-110 + i * 30} ${-290 + i * -2} q8 60 -6 110`} fill="none" stroke="url(#fg-bone)" strokeWidth="12" />)}
              <path d="M90 -320 Q130 -380 230 -360 Q290 -346 300 -310 L296 -290 H110 Z" />
              <path d="M120 -286 H290 Q270 -250 150 -256 Z" />
              <circle cx="168" cy="-330" r="16" fill="#3A3426" />
              <path d="M228 -350 q20 10 30 30" fill="none" stroke="#3A3426" strokeWidth="6" />
              {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M${130 + i * 22} -290 l8 14 l8 -14`} fill="#F8F0DC" strokeWidth="3" />)}
              <path d="M-140 -260 Q-260 -240 -320 -200" fill="none" stroke="url(#fg-bone)" strokeWidth="14" />
              <path d="M-40 -240 L-60 -100 L-30 0 M40 -250 L60 -110 L40 0" fill="none" stroke="url(#fg-bone)" strokeWidth="16" />
            </g>
          </g>

          {/* PIANO 4 — i raptor e il T-rex che entra e ruggisce (0,7) */}
          <g transform={L(0.7)}>
            <path d="M-200 1150 H1280 V2200 H-200 Z" fill="url(#fg-floor)" />
            {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${-200 + i * 180} 1160 L${-400 + i * 230} 2200`} stroke="#5A4A30" strokeWidth="4" opacity=".5" />)}
            <g opacity={raptors}>
              <RaptorHead x={180} y={1030} s={0.8} t={t} open={0.3} />
              <RaptorHead x={420} y={1060} s={0.7} t={t + 1} open={0.5} />
            </g>
            <g opacity={rex}>
              <TRex id="fg" x={lerp(1500, 880, rex)} y={1330} s={0.85} t={t} jaw={roar} flip />
            </g>
          </g>

          {/* PIANO 5 — lo striscione che si stacca e cade (0,85) */}
          <g transform={L(0.85)}>
            <g transform={`translate(0 ${900 * fall * fall}) rotate(${fall * 7} 540 660)`}>
              <path d={`M80 ${640 + 20 * fall} Q540 ${690 + 30 * fall} 1000 ${640 - 10 * fall} V${780 + 40 * fall} Q540 ${830 + 30 * fall} 80 ${780} Z`} fill="url(#fg-banner)" stroke={K} strokeWidth="7" />
              <text x="540" y={724 + 30 * fall} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="34" fill="#5A3A1E" transform={`rotate(${fall * 2} 540 720)`}>QUANDO I DINOSAURI</text>
              <text x="540" y={768 + 30 * fall} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="34" fill="#5A3A1E" transform={`rotate(${fall * 2} 540 760)`}>DOMINAVANO LA TERRA</text>
              {fall < 0.2 && [80, 1000].map((x) => <path key={x} d={`M${x} 640 L${x} 600`} stroke={K} strokeWidth="5" />)}
            </g>
            {fall > 0 && fall < 1 && DEBRIS.map((d, i) => { const p = mod(seg(t, cues[2], cues[2] + 1.6) + d.ph * 0.2, 1); return <rect key={i} x={d.x} y={600 + d.v * p * 2} width={d.s} height={d.s} fill="#C9BFA4" opacity={1 - p} />; })}
          </g>

          {/* PIANO 6 — il bastone di Hammond col pomo d'ambra, ossa a terra (1,1) */}
          <g transform={L(1.1)}>
            <g transform="translate(960 1250) rotate(-12)" opacity={seg(t, cues[4] - 0.2, cues[4] + 0.4)}>
              <ellipse cx="10" cy="4" rx="60" ry="10" fill="#000" opacity=".35" />
              <path d="M0 0 V-340" stroke={K} strokeWidth="28" strokeLinecap="round" />
              <path d="M0 0 V-340" stroke="#B88A5A" strokeWidth="18" strokeLinecap="round" />
              <path d="M-4 -20 V-320" stroke="#E8C898" strokeWidth="5" opacity=".7" />
              <Amber id="fg" x={0} y={-370} s={0.42} accent={P.accento} />
              <Glow id="fg-cane" x={0} y={-370} r={120} t={t} color="#FFB040" amp={0.08} rate={2} opacity={0.6 * (1 - cane * 0.7)} />
            </g>
            {[[180, 1700, 30], [620, 1780, -20], [380, 1900, 60]].map(([x, y, a], i) => (
              <g key={i} transform={`translate(${x} ${y}) rotate(${a})`}>
                <path d="M-80 0 H80" stroke={K} strokeWidth="30" strokeLinecap="round" />
                <path d="M-80 0 H80" stroke="url(#fg-bone)" strokeWidth="20" strokeLinecap="round" />
                {[-90, 90].map((dx) => <g key={dx}><circle cx={dx} cy="-12" r="18" fill="url(#fg-bone)" stroke={K} strokeWidth="5" /><circle cx={dx} cy="12" r="18" fill="url(#fg-bone)" stroke={K} strokeWidth="5" /></g>)}
              </g>
            ))}
          </g>
        </g>

        {/* PIANO 7 — polvere che scende dal soffitto e nei raggi dell'alba (1,5–1,8) */}
        <g transform={L(1.5)}>
          <Dust t={t} top={{ y: 620, x0: 300, x1: 780 }} bottom={{ y: 1140, x0: 160, x1: 920 }} seed={11} n={26} color="#FFE8C0" boost={fall > 0 && fall < 1 ? 1 : 0} />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="fg-near" t={t} color="#FFE8C0" n={6} opacity={0.08} />
        </g>
      </g>
      <Finish id="fg" tint="#1E4A30" tintOpacity={0.08} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): raptor cue0 + 0,2 · T-rex cue1 − 0,3, ruggiti cue1 + 0,5 e cue2 + 0,9 · striscione cue2 → + 1,2 · elicottero cue3 · bastone cue4 · uccelli cue5.
