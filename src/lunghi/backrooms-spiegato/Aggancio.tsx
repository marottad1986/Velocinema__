import React from 'react';
import { eio, seg } from '../../lib/anim';
import { ANTON, SANS } from '../../lib/fonts';
import type { ParteProps } from '../registro';
import { Mondo } from './Mondo';
import { INK, NIGHT, PAPER, RED, YEL } from './Luoghi';

// Aggancio del video lungo (VIDEO-LUNGO.md, YOUTUBE.md §2): il fotogramma 0 è la miniatura YouTube completa.
// Miniatura: il corridoio giallo infinito in prospettiva, i neon, la moquette bagnata, in fondo una porta socchiusa con
// la luce bianca e sul muro a destra «DOVE SEI?» a pennarello; a sinistra «SPIEGATO SEMPLICE», «BACKROOMS» enorme e
// «IL FINALE SPIEGATO». Subito la camera cammina (il motivo per restare); dopo «come si esce?» i neon si spengono dal
// fondo verso di noi, poi la camera esce dalla stanza e mostra tutto il mondo in sezione.

export const Aggancio: React.FC<ParteProps> = ({ t, cues }) => {
  const via = eio(seg(t, cues[1] - 0.4, cues[1] + 0.6));
  return (
    <>
      <Mondo T={t} />
      {via < 1 && (
        <>
          <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
            <defs>
              <linearGradient id="ag-left" x1="0" x2="1">
                <stop offset="0" stopColor={NIGHT} stopOpacity=".88" />
                <stop offset=".55" stopColor={NIGHT} stopOpacity=".5" />
                <stop offset="1" stopColor={NIGHT} stopOpacity="0" />
              </linearGradient>
            </defs>
            <rect width={1080} height={1080} fill="url(#ag-left)" opacity={1 - via} />
          </svg>
          <div style={{ position: 'absolute', left: 96, top: 180, width: 1000, opacity: 1 - via, transform: `translateX(${-via * 80}px)` }}>
            <div style={{ display: 'inline-block', padding: '8px 20px', borderRadius: 10, background: YEL, color: INK, fontFamily: SANS, fontWeight: 900, fontSize: 34, letterSpacing: '0.16em' }}>SPIEGATO SEMPLICE</div>
            <div style={{ marginTop: 14, fontFamily: ANTON, fontSize: 250, lineHeight: 0.95, color: PAPER, letterSpacing: '0.02em', textShadow: `0 10px 0 ${NIGHT}, 0 0 46px rgba(255,236,150,.45)` }}>BACK<br />ROOMS</div>
            <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 18 }}>
              <div style={{ width: 70, height: 8, borderRadius: 4, background: RED }} />
              <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 64, letterSpacing: '0.1em', color: YEL, textShadow: `0 5px 0 ${NIGHT}` }}>IL FINALE SPIEGATO</div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
