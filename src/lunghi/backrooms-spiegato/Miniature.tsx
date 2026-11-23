import React from 'react';
import { ANTON, SANS } from '../../lib/fonts';
import { Corridoio } from '../../lib/liminale';
import { NIGHT, PAPER, RED, YEL } from './Luoghi';
import { SulMuro } from './Pov';

// Le altre due miniature per «Testa e confronta» di YouTube Studio (YOUTUBE.md §1; la prima è il fotogramma 0 del lungo):
// B) il neon che sfarfalla sopra la moquette bagnata, una freccia rossa sulla scritta a pennarello, «LIVELLO 0»;
// C) i livelli in sezione uno sotto l'altro, anello rosso sull'uscita (la fessura), «COME SI ESCE?».
// Un solo oggetto enorme, al massimo 3–4 parole grandissime, contrasto forte, leggibili a 160×90.

const Titolo: React.FC<{ righe: string[]; x: number; y: number; size: number; color?: string }> = ({ righe, x, y, size, color = PAPER }) => (
  <div style={{ position: 'absolute', left: x, top: y, fontFamily: ANTON, fontSize: size, lineHeight: 0.95, color, textShadow: `0 10px 0 ${NIGHT}, 0 0 40px rgba(0,0,0,.6)` }}>
    {righe.map((r) => <div key={r}>{r}</div>)}
  </div>
);

export const MiniaturaB: React.FC = () => (
  <div style={{ position: 'absolute', inset: 0, background: NIGHT }}>
    <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      <Corridoio T={1.234} z={2.2} x={0.9} id="minib" seed={21} rotto={1} spenti={(i) => (i % 3 === 1 ? 0.85 : 0)}
        oggetti={(p) => <SulMuro p={p} side={1} z={4.2} y={1.55} text="aiuto" size={300} color="#7A1A10" />} />
      {/* freccia rossa sulla scritta */}
      <path d="M1180 210 Q1330 120 1440 300" fill="none" stroke={RED} strokeWidth={22} strokeLinecap="round" />
      <path d="M1400 250 L1450 320 L1470 236" fill="none" stroke={RED} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1100, height: 1080, background: `linear-gradient(90deg, ${NIGHT}EE 0%, ${NIGHT}AA 55%, ${NIGHT}00 100%)` }} />
    <div style={{ position: 'absolute', left: 96, top: 130, display: 'inline-block', padding: '8px 20px', borderRadius: 10, background: YEL, color: NIGHT, fontFamily: SANS, fontWeight: 900, fontSize: 34, letterSpacing: '0.16em' }}>BACKROOMS</div>
    <Titolo righe={['LIVELLO', '0']} x={90} y={200} size={330} />
  </div>
);

export const MiniaturaC: React.FC = () => (
  // un solo oggetto enorme: la fessura luminosa nel muro di mattoni del seminterrato, con l'anello rosso
  <div style={{ position: 'absolute', inset: 0, background: '#1E1810' }}>
    <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      <rect width={1920} height={1080} fill="#2E2418" />
      {Array.from({ length: 14 }, (_, r) => Array.from({ length: 12 }, (_, c) => (
        <rect key={`${r}-${c}`} x={-80 + c * 180 + (r % 2) * 90} y={r * 80} width={170} height={70} rx={4} fill="#4A3826" stroke="#1E160C" strokeWidth={6} />
      )))}
      <radialGradient id="mc-luce"><stop offset="0" stopColor="#FFF4B8" stopOpacity=".75" /><stop offset=".5" stopColor="#FFE58A" stopOpacity=".25" /><stop offset="1" stopColor="#FFE58A" stopOpacity="0" /></radialGradient>
      <ellipse cx={1330} cy={500} rx={420} ry={520} fill="url(#mc-luce)" />
      <path d="M1330 80 Q1270 300 1305 500 Q1380 700 1330 930 Q1375 700 1350 500 Q1395 300 1330 80 Z" fill="#FFFDF0" stroke="#F2D06A" strokeWidth={8} />
      <circle cx={1330} cy={505} r={330} fill="none" stroke={RED} strokeWidth={26} strokeDasharray="150 46" />
      <circle cx={1330} cy={505} r={364} fill="none" stroke={RED} strokeWidth={7} opacity={0.6} />
    </svg>
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1000, height: 1080, background: `linear-gradient(90deg, ${NIGHT}F0 0%, ${NIGHT}B0 60%, ${NIGHT}00 100%)` }} />
    <div style={{ position: 'absolute', left: 96, top: 150, display: 'inline-block', padding: '8px 20px', borderRadius: 10, background: YEL, color: NIGHT, fontFamily: SANS, fontWeight: 900, fontSize: 34, letterSpacing: '0.16em' }}>BACKROOMS</div>
    <Titolo righe={['COME', 'SI ESCE?']} x={90} y={220} size={260} color={PAPER} />
  </div>
);
