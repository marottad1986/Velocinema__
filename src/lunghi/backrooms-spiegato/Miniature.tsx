import React from 'react';
import { ANTON, HAND, SANS } from '../../lib/fonts';
import { Corridoio } from '../../lib/liminale';
import { Mondo, S } from './Mondo';
import { NIGHT, PAPER, RED, X, YEL } from './Luoghi';
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

export const MiniaturaC: React.FC = () => {
  const T = S('uscita') + 1.8; // i livelli della leggenda visibili, la fessura accesa
  return (
    <div style={{ position: 'absolute', inset: 0, background: NIGHT }}>
      <Mondo T={T} cam={{ x: X.fessura + 520, y: 520, z: 0.52 }} pulito />
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        {/* anello rosso sulla fessura (l'uscita) */}
        {(() => {
          const cx = 960 + (X.fessura - (X.fessura + 520)) * 0.52, cy = 540 + (120 - 520) * 0.52;
          return (
            <g>
              <circle cx={cx} cy={cy} r={120} fill="none" stroke={RED} strokeWidth={18} strokeDasharray="60 22" />
              <circle cx={cx} cy={cy} r={142} fill="none" stroke={RED} strokeWidth={5} opacity={0.6} />
              <text x={cx + 150} y={cy - 80} fontFamily={HAND} fontWeight={700} fontSize={90} fill={YEL} stroke={NIGHT} strokeWidth={14} paintOrder="stroke">l'uscita?</text>
            </g>
          );
        })()}
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 460, background: `linear-gradient(0deg, ${NIGHT}F2 0%, ${NIGHT}B0 60%, ${NIGHT}00 100%)` }} />
      <Titolo righe={['COME SI ESCE?']} x={96} y={760} size={230} color={YEL} />
      <div style={{ position: 'absolute', right: 96, top: 70, padding: '8px 20px', borderRadius: 10, background: PAPER, color: NIGHT, fontFamily: SANS, fontWeight: 900, fontSize: 40, letterSpacing: '0.12em' }}>BACKROOMS</div>
    </div>
  );
};
