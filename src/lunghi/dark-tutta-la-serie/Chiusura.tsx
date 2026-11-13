import React from 'react';
import { eo, seg } from '../../lib/anim';
import { DISPLAY, SANS } from '../../lib/fonts';
import { YELLOW } from '../../scenes/dark-stagione-1/Winden';
import type { ParteProps } from '../registro';
import { FinaleSchema, STARTS } from './Finale';

// Chiusura del video lungo (VIDEO-LUNGO.md): lo schema che resta (il mondo d'origine con la casa accesa) scivola nella
// metà sinistra; sotto, il riquadro «Ti è servito?» con «Metti like», «Iscriviti al canale» e l'invito a commentare.
// La metà destra (x 1000–1824, y 180–880) resta libera per la schermata finale di YouTube.

const CHALK = '#E4E7E1';

const Pulsante: React.FC<{ k: number; testo: string; pieno?: boolean; icona: React.ReactNode }> = ({ k, testo, pieno, icona }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 26px', borderRadius: 999,
    background: pieno ? '#D9483A' : 'rgba(228,231,225,0.1)', border: pieno ? 'none' : `3px solid ${CHALK}`,
    color: CHALK, fontFamily: SANS, fontWeight: 800, fontSize: 36, opacity: k, transform: `translateY(${(1 - k) * 18}px) scale(${0.92 + 0.08 * k})`,
  }}>
    {icona}
    {testo}
  </div>
);

export const Chiusura: React.FC<ParteProps> = ({ t, cues }) => {
  const box = eo(seg(t, 0.6, 1.3));
  const like = eo(seg(t, cues[1] - 0.2, cues[1] + 0.3));
  const iscr = eo(seg(t, cues[1] + 0.5, cues[1] + 1.0));
  const comm = eo(seg(t, cues[2] - 0.1, cues[2] + 0.5));
  return (
    <>
      <FinaleSchema T={STARTS.chiusura + t} />
      <div style={{ position: 'absolute', left: 96, top: 520, width: 860, opacity: box, transform: `translateY(${(1 - box) * 20}px)` }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 64, color: CHALK, textShadow: '0 4px 0 #0A0E0D' }}>Ti è servito?</div>
        <div style={{ display: 'flex', gap: 20, marginTop: 22 }}>
          <Pulsante k={like} testo="Metti like" icona={
            <svg width="38" height="38" viewBox="0 0 40 40"><path d="M6 18 H13 V36 H6 Z M15 18 L22 4 Q27 4 26 11 L25 16 H34 Q37 17 36 21 L33 33 Q32 36 28 36 H15 Z" fill={CHALK} /></svg>
          } />
          <Pulsante k={iscr} pieno testo="Iscriviti al canale" icona={
            <svg width="34" height="34" viewBox="0 0 40 40"><path d="M20 4 Q12 4 11 14 V22 L6 30 H34 L29 22 V14 Q28 4 20 4 Z M15 33 Q20 39 25 33 Z" fill={CHALK} /></svg>
          } />
        </div>
        <div style={{ marginTop: 28, fontFamily: SANS, fontWeight: 800, fontSize: 40, color: YELLOW, opacity: comm, transform: `translateY(${(1 - comm) * 14}px)`, textShadow: '0 3px 0 #0A0E0D' }}>
          Commenta con la serie che vorresti spiegata.
        </div>
      </div>
    </>
  );
};
