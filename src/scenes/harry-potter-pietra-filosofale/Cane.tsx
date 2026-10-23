import React from 'react';
import { camera, eio, eo, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Dust, Fire, Glow, NearMotes, Notes } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { K } from './Comuni';

// Il cane a tre teste: stanza di pietra dietro una porta proibita; un enorme cane a tre teste (animale, nel nostro stile)
// che dorme e poi ringhia, con le zampe sopra una botola di legno; un'arpa che suona da sola; la luce di una torcia.
// Piani: parete di pietra (0,25) · torcia (0,4) · cane (0,6) · botola (0,75) · arpa (0,9) · porta in primo piano (1,25) · pulviscolo (1,6)

const Head: React.FC<{ x: number; y: number; s: number; rot: number; snarl: number; eye: number }> = ({ x, y, s, rot, snarl, eye }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} strokeLinejoin="round" strokeLinecap="round">
    <path d="M-60 -40 L-90 -110 L-30 -70 Z M40 -60 L80 -120 L70 -50 Z" fill="#5A4430" stroke={K} strokeWidth="6" />
    <path d="M-80 0 Q-80 -80 0 -80 Q80 -80 90 -10 L170 10 Q190 40 160 60 L40 70 Q-80 70 -80 0 Z" fill="#7A5E40" stroke={K} strokeWidth="8" />
    <path d={`M60 50 L160 56 Q150 ${70 + 20 * snarl} 120 ${74 + 16 * snarl} L50 70 Z`} fill={snarl > 0.1 ? '#5A1A14' : '#6A5038'} stroke={K} strokeWidth="5" />
    {snarl > 0.1 && Array.from({ length: 5 }, (_, i) => <path key={i} d={`M${66 + i * 20} 54 l6 ${10 * snarl} l6 ${-10 * snarl}`} fill="#F4EBD0" stroke={K} strokeWidth="2" />)}
    <ellipse cx="166" cy="20" rx="16" ry="12" fill={K} />
    <ellipse cx="20" cy="-30" rx="14" ry={14 * eye + 1} fill="#F2C14E" stroke={K} strokeWidth="4" />
    {eye > 0.3 && <circle cx="22" cy="-30" r="5" fill={K} />}
    <path d="M-40 -60 Q0 -76 50 -60" stroke="#9A7E5A" strokeWidth="6" fill="none" opacity=".7" />
  </g>
);

export const Cane: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const wake = eio(seg(t, cues[1], cues[1] + 0.8)); // «un enorme cane a tre teste»: si sveglia e ringhia
  const sleep = eio(seg(t, cues[3] - 0.6, cues[3] + 0.6)); // l'arpa suona: torna a dormire
  const awake = wake * (1 - sleep);
  const snarl = awake * (0.6 + 0.4 * Math.abs(Math.sin(t * 6)));
  const breath = Math.sin(t * (1.2 + awake)) * (6 + 6 * awake);
  const trap = eo(seg(t, cues[2], cues[2] + 0.8)); // la botola si illumina: sotto c'è la pietra
  const harp = seg(t, cues[3] - 1, cues[3] - 0.6);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="cn" />
        <Lin id="cn-wall" stops={[[0, '#1E1A26'], [0.5, '#2E2A34'], [1, '#141018']]} />
        <Lin id="cn-floor" stops={[[0, '#3A3236'], [1, '#141014']]} />
        <Lin id="cn-fur" x2={1} y2={0} stops={[[0, '#6A5038'], [0.5, '#8A6E4A'], [1, '#5A4430']]} />
      </defs>
      <g transform={cam.transform}>
        {/* parete di pietra */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#cn-wall)" />
          {Array.from({ length: 60 }, (_, i) => {
            const row = Math.floor(i / 6), col = i % 6;
            return <rect key={i} x={-200 + col * 260 + (row % 2) * 130} y={540 + row * 70} width="250" height="64" rx="8" fill="none" stroke="#3A3440" strokeWidth="4" />;
          })}
        </g>
        {/* torcia alla parete */}
        <g transform={L(0.4)}>
          <path d="M820 780 l40 -20 v40 Z" fill="#3A3030" stroke={K} strokeWidth="5" />
          <Fire id="cn-torch" t={t} x={850} y={760} scale={0.5} outline={K} />
          <Glow id="cn-torchg" x={850} y={720} r={440} t={t} color="#FFA050" amp={0.12} rate={6} opacity={0.55} />
        </g>
        {/* il cane a tre teste: sdraiato come una sfinge, tre colli che partono dalle spalle, zampe intere a terra */}
        <g transform={`${L(0.6)} translate(-90 0)`}>
          <ellipse cx="560" cy="1190" rx="420" ry="44" fill={K} opacity=".4" />
          {/* coda */}
          <path d={`M210 1080 Q120 1040 100 ${940 + Math.sin(t * 3) * 20 * (1 - awake)}`} stroke={K} strokeWidth="30" fill="none" strokeLinecap="round" />
          <path d={`M210 1080 Q120 1040 100 ${940 + Math.sin(t * 3) * 20 * (1 - awake)}`} stroke="#7A5E40" strokeWidth="18" fill="none" strokeLinecap="round" />
          {/* zampa posteriore piegata */}
          <path d="M240 1100 Q200 1180 260 1188 H380 Q400 1170 360 1150" fill="#6A5038" stroke={K} strokeWidth="8" />
          {/* corpo */}
          <path d={`M200 1150 Q170 ${990 - breath} 420 ${960 - breath} Q700 ${940 - breath} 820 ${1000 - breath} Q880 1060 860 1150 Q600 1190 200 1150 Z`} fill="url(#cn-fur)" stroke={K} strokeWidth="9" />
          <path d={`M300 ${1010 - breath} Q480 ${985 - breath} 700 ${1000 - breath}`} stroke="#9A7E5A" strokeWidth="8" fill="none" opacity=".5" />
          {/* zampe anteriori distese in avanti, con le dita appoggiate */}
          {[0, 1].map((k) => (
            <g key={k} transform={`translate(${k * 70} ${k * 8})`}>
              <path d="M760 1110 Q800 1160 870 1170 H990 Q1010 1186 990 1196 H860 Q770 1196 730 1150 Z" fill={k ? '#7A5E40' : '#6A5038'} stroke={K} strokeWidth="8" />
              {[950, 970].map((x) => <path key={x} d={`M${x} 1172 V1194`} stroke={K} strokeWidth="4" />)}
            </g>
          ))}
          {/* tre colli dalle spalle e tre teste */}
          {[
            { nx: 700, ny: 1010, hx: 600, hy: 860 - 40 * awake, s: 0.78, rot: -20 * (1 - awake) - 8, sn: 0.8 },
            { nx: 760, ny: 1000, hx: 760, hy: 800 - 50 * awake, s: 0.86, rot: -12 * (1 - awake), sn: 1 },
            { nx: 820, ny: 1020, hx: 900, hy: 900 - 30 * awake, s: 0.8, rot: 18 * (1 - awake) + 4, sn: 0.9 },
          ].map((h, i) => (
            <g key={i}>
              <path d={`M${h.nx - 50} ${h.ny + 40} Q${(h.nx + h.hx) / 2 - 40} ${(h.ny + h.hy) / 2} ${h.hx - 30} ${h.hy + 20} L${h.hx + 30} ${h.hy + 40} Q${(h.nx + h.hx) / 2 + 40} ${(h.ny + h.hy) / 2 + 20} ${h.nx + 50} ${h.ny + 40} Z`} fill="url(#cn-fur)" stroke={K} strokeWidth="8" />
              <Head x={h.hx} y={h.hy} s={h.s} rot={h.rot} snarl={snarl * h.sn} eye={awake} />
            </g>
          ))}
          {awake < 0.3 && [0, 1, 2].map((k) => <text key={k} x={900 + k * 40} y={760 - k * 40 - ((t * 30) % 40)} fontFamily="Figtree" fontWeight={800} fontSize={30 + k * 8} fill="#B8B4C8" opacity={0.6 * (1 - awake * 3)}>z</text>)}
        </g>
        {/* botola di legno sotto le zampe (accento sulla luce che filtra) */}
        <g transform={L(0.75)}>
          <path d="M-200 1200 H1280 V2200 H-200 Z" fill="url(#cn-floor)" />
          <g transform="translate(560 1290)">
            <path d="M-170 -40 H170 L200 40 H-200 Z" fill="#5A3E24" stroke={K} strokeWidth="8" />
            {[-100, 0, 100].map((x) => <path key={x} d={`M${x} -40 L${x * 1.18} 40`} stroke="#3A2614" strokeWidth="6" />)}
            <circle cx="120" cy="0" r="14" fill="none" stroke="#C9A24A" strokeWidth="6" />
            <path d="M-200 40 H200" stroke={P.accento} strokeWidth="6" opacity={trap} />
            <Glow id="cn-trapg" x={0} y={40} r={260} t={t} color={P.accento} amp={0.1} rate={2} opacity={0.5 * trap} />
          </g>
          {/* lastre del pavimento, paglia e ossa rosicchiate in primo piano */}
          {[1330, 1480, 1680].map((y) => <path key={y} d={`M-200 ${y} H1280`} stroke="#241C20" strokeWidth="5" />)}
          {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M${540 + (i - 3) * 160} 1180 L${540 + (i - 3) * 420} 1940`} stroke="#241C20" strokeWidth="4" />)}
          {Array.from({ length: 22 }, (_, i) => <path key={`p${i}`} d={`M${180 + i * 34} ${1640 + (i % 4) * 20} l${40 + (i % 3) * 10} ${-12 + (i % 5) * 6}`} stroke="#B8944A" strokeWidth="5" strokeLinecap="round" opacity=".8" />)}
          {[[330, 1760, 20], [720, 1820, -14]].map(([x, y, rot], i) => (
            <g key={`b${i}`} transform={`translate(${x} ${y}) rotate(${rot})`}>
              <path d="M-90 -8 H90 V8 H-90 Z" fill="#E8DCC0" stroke={K} strokeWidth="6" />
              {[-1, 1].map((d) => <g key={d}><circle cx={d * 96} cy="-12" r="16" fill="#E8DCC0" stroke={K} strokeWidth="6" /><circle cx={d * 96} cy="12" r="16" fill="#E8DCC0" stroke={K} strokeWidth="6" /></g>)}
            </g>
          ))}
        </g>
        {/* arpa che suona da sola */}
        <g transform={L(0.9)}>
          <g transform="translate(160 1360)">
            <path d="M0 0 Q-20 -200 40 -260 Q120 -300 160 -220 L160 0 Z" fill="none" stroke={K} strokeWidth="18" />
            <path d="M0 0 Q-20 -200 40 -260 Q120 -300 160 -220 L160 0 Z" fill="none" stroke="#C9A24A" strokeWidth="10" />
            {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M${20 + i * 20} ${-30 - i * 4} V${-220 + i * 4 + Math.sin(t * 20 + i) * 3 * harp}`} stroke="#F4E8C8" strokeWidth="3" />)}
            <path d="M-20 0 H180" stroke={K} strokeWidth="14" />
          </g>
          {harp > 0 && <Notes t={t} x={300} y={1120} seed={7} n={6} color={P.accento} outline={K} rise={260} spread={160} size={1.1} />}
        </g>
        {/* stipite della porta proibita in primo piano */}
        <g transform={L(1.25)}>
          <path d="M-200 -200 H120 V1940 H-200 Z" fill="#2A1E14" stroke={K} strokeWidth="10" />
          <path d="M1280 -200 H980 V1940 H1280 Z" fill="#2A1E14" stroke={K} strokeWidth="10" />
          <path d="M-200 -200 H1280 V420 H-200 Z" fill="#1A120C" />
          <path d="M120 420 V1940 M980 420 V1940" stroke="#4A3626" strokeWidth="8" />
        </g>
        <g transform={L(1.6)}>
          <Dust t={t} top={{ y: 640, x0: 860, x1: 1000 }} bottom={{ y: 1300, x0: 300, x1: 900 }} seed={5} n={22} color="#FFC890" />
          <NearMotes id="cn-near" t={t} color="#FFC890" n={5} y0={1300} opacity={0.07} />
        </g>
      </g>
      <Finish id="cn" tint="#1E1A3A" tintOpacity={0.12} />
    </svg>
  );
};
