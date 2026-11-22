import React from 'react';
import { eio, seg } from '../../lib/anim';
import { ANTON, SANS } from '../../lib/fonts';
import type { ParteProps } from '../registro';
import { Mondo } from './Paese';
import { DARK, ENGINE, INK, RED } from './Edifici';

// Aggancio del video lungo (VIDEO-LUNGO.md, YOUTUBE.md §2): il fotogramma 0 è la miniatura YouTube completa.
// Miniatura: a destra la casa dei Darko di notte con il motore d'aereo arancione che sta per sfondare il tetto (scia di
// fuoco), il contatore rosso «28 GIORNI» sopra il tetto; a sinistra «SPIEGATO SEMPLICE», «DONNIE / DARKO» enorme e
// «IL FINALE SPIEGATO». Dopo 1,5 s il motore colpisce (lampo, polvere, la camera trema): il motivo per restare.
// Poi la scritta si fa da parte e il mondo (Paese.tsx) prosegue con la domanda, le tre promesse e il gesto finale.

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
                <stop offset="0" stopColor="#06070F" stopOpacity=".92" />
                <stop offset=".55" stopColor="#06070F" stopOpacity=".55" />
                <stop offset="1" stopColor="#06070F" stopOpacity="0" />
              </linearGradient>
            </defs>
            <rect width={1150} height={1080} fill="url(#ag-left)" opacity={1 - via} />
          </svg>
          <div style={{ position: 'absolute', left: 96, top: 170, width: 1000, opacity: 1 - via, transform: `translateX(${-via * 80}px)` }}>
            <div style={{ display: 'inline-block', padding: '8px 20px', borderRadius: 10, background: ENGINE, color: DARK, fontFamily: SANS, fontWeight: 900, fontSize: 34, letterSpacing: '0.16em' }}>SPIEGATO SEMPLICE</div>
            <div style={{ marginTop: 14, fontFamily: ANTON, fontSize: 236, lineHeight: 0.95, color: INK, letterSpacing: '0.02em', textShadow: `0 10px 0 ${DARK}, 0 0 40px rgba(127,166,255,.45)` }}>DONNIE<br />DARKO</div>
            <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 18 }}>
              <div style={{ width: 70, height: 8, borderRadius: 4, background: RED }} />
              <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 64, letterSpacing: '0.12em', color: ENGINE, textShadow: `0 5px 0 ${DARK}` }}>IL FINALE SPIEGATO</div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
