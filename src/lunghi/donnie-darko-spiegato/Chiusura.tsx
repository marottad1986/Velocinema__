import React from 'react';
import { eo, seg } from '../../lib/anim';
import { DISPLAY, SANS } from '../../lib/fonts';
import type { ParteProps } from '../registro';
import { Mondo, STARTS } from './Paese';
import { ENGINE, INK } from './Edifici';

// Chiusura (VIDEO-LUNGO.md): il paese all'alba nella metà sinistra (la casa con il motore nel tetto, il vortice che si
// chiude); sotto, il riquadro «Ti è servito?» con «Metti like», «Iscriviti al canale» e l'invito a commentare.
// La metà destra (x 1000–1824, y 180–880) resta libera per la schermata finale di YouTube.

const Pulsante: React.FC<{ k: number; testo: string; pieno?: boolean; icona: React.ReactNode }> = ({ k, testo, pieno, icona }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 26px', borderRadius: 999,
    background: pieno ? '#D9483A' : 'rgba(238,240,247,0.1)', border: pieno ? 'none' : `3px solid ${INK}`,
    color: INK, fontFamily: SANS, fontWeight: 800, fontSize: 36, opacity: k, transform: `translateY(${(1 - k) * 18}px) scale(${0.92 + 0.08 * k})`,
  }}>
    {icona}
    {testo}
  </div>
);

export const Chiusura: React.FC<ParteProps> = ({ t, cues }) => {
  const box = eo(seg(t, 0.8, 1.5));
  const like = eo(seg(t, cues[1] - 0.2, cues[1] + 0.3));
  const iscr = eo(seg(t, cues[1] + 0.5, cues[1] + 1.0));
  const comm = eo(seg(t, cues[2] - 0.1, cues[2] + 0.5));
  return (
    <>
      <Mondo T={STARTS.chiusura + t} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(6,7,15,0) 0%, rgba(6,7,15,0) 48%, rgba(6,7,15,.78) 56%, rgba(6,7,15,.86) 100%)', opacity: box }} />
      <div style={{ position: 'absolute', left: 96, top: 120, width: 880, opacity: box, transform: `translateY(${(1 - box) * 20}px)`, padding: '22px 28px', borderRadius: 24, background: 'rgba(10,12,26,0.72)' }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 60, color: INK }}>Ti è servito?</div>
        <div style={{ display: 'flex', gap: 20, marginTop: 18 }}>
          <Pulsante k={like} testo="Metti like" icona={<svg width="38" height="38" viewBox="0 0 40 40"><path d="M6 18 H13 V36 H6 Z M15 18 L22 4 Q27 4 26 11 L25 16 H34 Q37 17 36 21 L33 33 Q32 36 28 36 H15 Z" fill={INK} /></svg>} />
          <Pulsante k={iscr} pieno testo="Iscriviti al canale" icona={<svg width="34" height="34" viewBox="0 0 40 40"><path d="M20 4 Q12 4 11 14 V22 L6 30 H34 L29 22 V14 Q28 4 20 4 Z M15 33 Q20 39 25 33 Z" fill={INK} /></svg>} />
        </div>
        <div style={{ marginTop: 22, fontFamily: SANS, fontWeight: 800, fontSize: 38, color: ENGINE, opacity: comm, transform: `translateY(${(1 - comm) * 14}px)` }}>
          Commenta con il film che vorresti spiegato.
        </div>
      </div>
    </>
  );
};
