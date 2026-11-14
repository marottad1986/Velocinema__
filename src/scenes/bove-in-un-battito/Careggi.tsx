import React from 'react';
import { camera, eo, lerp, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Glow, NearMotes, Rain, Reflection } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { GIALLO, K, VIOLA } from './Comuni';

// La notte in ospedale: un grande ospedale inventato (Careggi riconoscibile solo dal contesto), di notte sotto una
// pioggia fine. Davanti al pronto soccorso un'ambulanza con le luci blu, la strada bagnata che riflette; a una cancellata
// una sciarpa viola. f2 «e la mattina dopo… sveglio e lucido»: il cielo passa all'alba e una finestra al terzo piano si
// accende di luce calda (l'accento giallo). Nessuna persona.
// Piani: cielo (0,2) · città lontana (0,35) · ospedale (0,6) · ambulanza e strada (0,85) · cancellata (1,2) · pioggia (1,5)

const r0 = rng(1201);
const WIN = (() => {
  const out: { x: number; y: number; on: number }[] = [];
  for (let f = 0; f < 5; f++) for (let c = 0; c < 9; c++) out.push({ x: 150 + c * 88, y: 790 + f * 72, on: r0() });
  return out;
})();
const KEY = 2 * 9 + 5; // la finestra che si accende all'alba

export const Careggi: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur, 540, 1050);
  const L = cam.layer;
  const tDawn = griglia(cues[1] + 0.2);
  const dawn = eo(seg(t, tDawn, tDawn + 2.2));
  const tWin = griglia(cues[1] + 2.4);
  const win = eo(seg(t, tWin, tWin + 0.6));
  const siren = 0.5 + 0.5 * Math.sin(t * 8);
  const rain = 1 - 0.7 * dawn;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="ca" />
        <Lin id="ca-night" stops={[[0, '#05070E'], [0.5, '#101830'], [1, '#1E2A44']]} />
        <Lin id="ca-dawn" stops={[[0, '#2A3050'], [0.45, '#8A6A8A'], [0.75, '#E8A07A'], [1, '#F6C890']]} />
        <linearGradient id="ca-wall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#3A4258" /><stop offset=".6" stopColor="#2A3044" /><stop offset="1" stopColor="#1A1E2C" /></linearGradient>
        <linearGradient id="ca-side" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#1E2232" /><stop offset="1" stopColor="#12141E" /></linearGradient>
        <Lin id="ca-road" stops={[[0, '#1A1E2A'], [1, '#07080C']]} />
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — cielo: notte che passa all'alba (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="1500" fill="url(#ca-night)" />
          <rect x="-200" y="-200" width="1480" height="1500" fill="url(#ca-dawn)" opacity={dawn} />
          <Glow id="ca-sun" x={860} y={1040} r={520} t={t} color="#FFD8A0" amp={0.03} rate={1} opacity={0.6 * dawn} />
        </g>
        {/* PIANO 1 — colline e città lontane, senza contorni (0,35) */}
        <g transform={L(0.35)}>
          <path d="M-200 1000 Q200 940 520 980 T1280 960 V1200 H-200 Z" fill={dawn > 0.5 ? '#5A4A60' : '#141A2A'} opacity={0.9} />
          {Array.from({ length: 22 }, (_, i) => (
            <rect key={i} x={-150 + i * 64} y={990 + (i % 3) * 14} width="8" height="10" fill="#FFD890" opacity={(0.5 + 0.4 * Math.sin(t + i)) * (1 - dawn)} />
          ))}
        </g>
        {/* PIANO 2 — l'ospedale: facciata a finestre, pronto soccorso illuminato (0,6) */}
        <g transform={L(0.6)}>
          {/* corpo laterale in ombra */}
          <path d="M900 740 L1080 772 V1230 H900 Z" fill="url(#ca-side)" stroke={K} strokeWidth="8" />
          {/* facciata */}
          <rect x="110" y="740" width="790" height="490" fill="url(#ca-wall)" stroke={K} strokeWidth="9" />
          <rect x="110" y="740" width="790" height="490" fill="#E8A07A" opacity={0.18 * dawn} />
          {/* fasce orizzontali tra i piani e frangisole */}
          {[780, 852, 924, 996, 1068, 1140].map((y) => <rect key={y} x="110" y={y - 6} width="790" height="8" fill="#4A5470" opacity=".8" />)}
          {[260, 520, 780].map((x) => <rect key={x} x={x - 6} y="740" width="12" height="400" fill="#1A2030" opacity=".7" />)}
          <path d="M110 740 H900" stroke="#9AA8C8" strokeWidth="5" opacity=".5" />
          {/* lucernario e cornice in alto */}
          <rect x="96" y="720" width="818" height="26" fill="#2A3044" stroke={K} strokeWidth="7" />
          {/* impianti sul tetto */}
          <rect x="180" y="690" width="120" height="32" fill="#232838" stroke={K} strokeWidth="5" />
          <rect x="640" y="696" width="80" height="26" fill="#232838" stroke={K} strokeWidth="5" />
          {WIN.map((w, i) => {
            const lit = i === KEY ? 0.25 + 0.75 * win : w.on > 0.55 ? 0.7 * (1 - 0.6 * dawn) : 0.08;
            const c = i === KEY ? GIALLO : '#BFD8F0';
            return (
              <g key={i}>
                <rect x={w.x} y={w.y} width="56" height="50" fill="#0E1220" stroke={K} strokeWidth="4" />
                <rect x={w.x + 4} y={w.y + 4} width="48" height="42" fill={c} opacity={lit} />
                <path d={`M${w.x + 28} ${w.y} V${w.y + 50}`} stroke={K} strokeWidth="3" />
              </g>
            );
          })}
          <Glow id="ca-key" x={WIN[KEY].x + 28} y={WIN[KEY].y + 25} r={150} t={t} color="#FFE08A" amp={0.06} rate={2} opacity={0.75 * win} />
          {/* pensilina del pronto soccorso con l'insegna rossa e la luce del portone */}
          <path d="M140 1150 H620 L650 1180 H110 Z" fill="#3A4258" stroke={K} strokeWidth="7" />
          <rect x="220" y="1102" width="300" height="46" rx="6" fill="#B8262E" stroke={K} strokeWidth="6" />
          <text x="370" y="1134" textAnchor="middle" fontFamily="sans-serif" fontWeight="800" fontSize="26" fill="#FFFFFF" letterSpacing="2">PRONTO SOCCORSO</text>
          <Glow id="ca-ps" x={370} y={1126} r={200} t={t} color="#FF6A6A" amp={0.05} rate={2} opacity={0.4 * (1 - 0.5 * dawn)} />
          <rect x="270" y="1180" width="200" height="50" fill="#F2F6FF" opacity=".85" stroke={K} strokeWidth="5" />
          <Glow id="ca-door" x={370} y={1210} r={170} t={t} color="#EAF2FF" amp={0.04} rate={2} opacity={0.5} />
          {/* croce sul tetto */}
          <g transform="translate(820 676) scale(0.8)">
            <rect x="-6" y="40" width="12" height="40" fill="#2A3044" />
            <path d="M-14 -40 H14 V-14 H40 V14 H14 V40 H-14 V14 H-40 V-14 H-14 Z" fill="#E8F0FF" stroke={K} strokeWidth="5" strokeLinejoin="round" />
            <Glow id="ca-cr" x={0} y={0} r={90} t={t} color="#CFE0FF" amp={0.05} rate={1.6} opacity={0.5 * (1 - 0.6 * dawn)} />
          </g>
        </g>
        {/* PIANO 3 — la strada bagnata e l'ambulanza davanti al pronto soccorso (0,85) */}
        <g transform={L(0.85)}>
          <rect x="-200" y="1230" width="1480" height="900" fill="url(#ca-road)" />
          <path d="M-200 1300 H1280" stroke="#F2F2F6" strokeWidth="6" strokeDasharray="60 50" opacity=".35" />
          {/* lampioni con l'alone, alberi scuri ai lati dell'ingresso */}
          {[[70, 1240], [1010, 1240]].map(([x, y], i) => (
            <g key={i}>
              <path d={`M${x - 70} ${y} Q${x - 90} ${y - 160} ${x} ${y - 230} Q${x + 90} ${y - 160} ${x + 70} ${y} Z`} fill="#0C1418" stroke={K} strokeWidth="6" />
              <rect x={x - 8} y={y - 40} width="16" height="40" fill="#1A1410" />
            </g>
          ))}
          {[[-20, 1236]].map(([x, y], i) => (
            <g key={`l${i}`}>
              <rect x={x - 6} y={y - 220} width="12" height="220" fill="#2A2E3A" stroke={K} strokeWidth="4" />
              <path d={`M${x} ${y - 220} q30 -10 46 6`} stroke="#2A2E3A" strokeWidth="10" fill="none" />
              <Glow id={`ca-lp${i}`} x={x + 46} y={y - 206} r={110} t={t} color="#FFD8A0" amp={0.05} rate={2} ph={i} opacity={0.7 * (1 - 0.5 * dawn)} />
              <ellipse cx={x + 46} cy={y - 208} rx="16" ry="8" fill="#FFF0C8" stroke={K} strokeWidth="3" />
            </g>
          ))}
          <Reflection t={t} x={370} y={1250} color="#FF8A8A" n={8} w={90} opacity={0.35 * (1 - 0.5 * dawn)} />
          <Reflection t={t} x={WIN[KEY].x + 28} y={1260} color="#FFE08A" n={7} w={50} opacity={0.4 * win} />
          {/* ambulanza ferma, vista di tre quarti */}
          <g transform="translate(720 1236) scale(0.85)">
            <Glow id="ca-sir" x={30} y={-150} r={240} t={t} color="#4A9AFF" amp={0.2} rate={8} opacity={0.7 * siren * (1 - 0.6 * dawn)} />
            <ellipse cx="40" cy="10" rx="230" ry="20" fill="#000" opacity=".5" />
            <path d="M-170 -150 H120 V0 H-170 Z" fill="#F2F2F6" stroke={K} strokeWidth="8" />
            <path d="M120 -110 H190 Q220 -100 226 -60 V0 H120 Z" fill="#E8E8F0" stroke={K} strokeWidth="8" />
            <path d="M130 -100 H186 Q206 -92 210 -64 H130 Z" fill="#5A7A9A" stroke={K} strokeWidth="5" />
            <rect x="-170" y="-80" width="290" height="22" fill="#E04848" />
            <rect x="-150" y="-130" width="70" height="40" fill="#B8C8D8" stroke={K} strokeWidth="5" />
            <g transform="translate(-30 -112)"><rect x="-8" y="-22" width="16" height="44" fill="#E04848" /><rect x="-22" y="-8" width="44" height="16" fill="#E04848" /></g>
            <rect x="-120" y="-172" width="40" height="22" rx="4" fill={siren > 0.5 ? '#8AD0FF' : '#2A4A9A'} stroke={K} strokeWidth="4" />
            <rect x="60" y="-172" width="40" height="22" rx="4" fill={siren > 0.5 ? '#2A4A9A' : '#8AD0FF'} stroke={K} strokeWidth="4" />
            {[-110, 160].map((x) => <g key={x}><circle cx={x} cy="4" r="30" fill="#14141A" stroke={K} strokeWidth="6" /><circle cx={x} cy="4" r="12" fill="#6A6E7A" /></g>)}
            <path d="M-166 -146 H116" stroke="#FFFFFF" strokeWidth="4" opacity=".7" />
          </g>
          <Reflection t={t} x={730} y={1320} color="#6AB0FF" n={8} w={140} opacity={0.4 * siren * (1 - 0.6 * dawn)} />
        </g>
        {/* PIANO 4 — cancellata in primo piano con una sciarpa viola annodata (1,2) */}
        <g transform={L(1.2)}>
          <rect x="-200" y="1560" width="1480" height="16" fill="#1A1C24" stroke={K} strokeWidth="5" />
          <rect x="-200" y="1800" width="1480" height="16" fill="#1A1C24" stroke={K} strokeWidth="5" />
          {Array.from({ length: 22 }, (_, i) => (
            <g key={i}>
              <rect x={-180 + i * 70} y="1500" width="14" height="500" fill="#20222C" stroke={K} strokeWidth="4" />
              <path d={`M${-180 + i * 70} 1500 l7 -24 l7 24`} fill="#20222C" stroke={K} strokeWidth="4" />
            </g>
          ))}
          {/* sciarpe viola annodate alla cancellata: due code con le strisce bianche e la frangia */}
          {[[250, 0], [640, 1], [820, 2]].map(([x, k]) => {
            const sw = Math.sin(t * 1.6 + k) * 6;
            return (
              <g key={k} transform={`translate(${x} 1568)`}>
                <path d={`M-10 6 Q${-24 + sw} 90 ${-30 + sw} 190 L${4 + sw} 196 Q${8 + sw * 0.5} 96 20 8 Z`} fill={VIOLA} stroke={K} strokeWidth="6" strokeLinejoin="round" />
                <path d={`M18 6 Q${44 + sw} 80 ${56 + sw} 160 L${88 + sw} 150 Q${70 + sw * 0.5} 70 40 0 Z`} fill="#5A3A90" stroke={K} strokeWidth="6" strokeLinejoin="round" />
                {[60, 120].map((y) => <path key={y} d={`M${-16 + sw * (y / 190)} ${y} L${16 + sw * (y / 190)} ${y + 2}`} stroke="#F2EEF8" strokeWidth="12" />)}
                {[50, 104].map((y) => <path key={`b${y}`} d={`M${30 + sw * (y / 160)} ${y} L${62 + sw * (y / 160)} ${y - 6}`} stroke="#F2EEF8" strokeWidth="11" />)}
                {Array.from({ length: 5 }, (_, i) => <path key={`f${i}`} d={`M${-28 + sw + i * 7} 192 l0 16`} stroke="#B8A0E8" strokeWidth="3" />)}
                <ellipse cx="10" cy="4" rx="24" ry="14" fill="#4A3270" stroke={K} strokeWidth="5" />
              </g>
            );
          })}
        </g>
        {/* PIANO 5 — pioggia fine che smette all'alba, particelle vicine (1,5) */}
        <g transform={L(1.5)} opacity={rain}>
          <Rain t={t} level="far" seed={3} color="#9AB0D0" opacity={0.35} />
          <Rain t={t} level="near" seed={8} color="#C8D8F0" opacity={0.3} />
        </g>
        <g transform={L(1.7)}>
          <NearMotes id="ca-near" t={t} color={dawn > 0.5 ? '#FFE0C0' : '#B8C8E8'} n={5} r0={50} r1={130} y0={900} y1={1900} opacity={0.08} />
        </g>
      </g>
      <Finish id="ca" tint={dawn > 0.5 ? '#E8913A' : '#142235'} tintOpacity={0.1} />
    </svg>
  );
};
