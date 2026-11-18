import React from 'react';
import { eio, eo, seg } from '../../lib/anim';
import { DISPLAY, SANS } from '../../lib/fonts';
import type { ParteProps } from '../registro';
import { Mondo, STARTS } from './Paradossi';

// Chiusura del video lungo (VIDEO-LUNGO.md): la camera scivola sul ventaglio dei futuri possibili, con la strada d'oro e
// «il futuro non è ancora scritto», nella metà sinistra; sotto, il riquadro «Ti è servito?» con «Metti like»,
// «Iscriviti al canale» e l'invito a commentare. La metà destra (x 1000–1824, y 180–880) resta libera per la schermata
// finale di YouTube.

const CHALK = '#F4EEE2';
const YEL = '#F5C23A';

const Pulsante: React.FC<{ k: number; testo: string; pieno?: boolean; icona: React.ReactNode }> = ({ k, testo, pieno, icona }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 26px', borderRadius: 999,
    background: pieno ? '#D9483A' : 'rgba(244,238,226,0.1)', border: pieno ? 'none' : `3px solid ${CHALK}`,
    color: CHALK, fontFamily: SANS, fontWeight: 800, fontSize: 36, opacity: k, transform: `translateY(${(1 - k) * 18}px) scale(${0.92 + 0.08 * k})`,
  }}>
    {icona}
    {testo}
  </div>
);

export const Chiusura: React.FC<ParteProps> = ({ t, cues }) => {
  // dalla vista larga della fine dei paradossi al ventaglio nella metà sinistra
  const k = eio(seg(t, 0, 1.6));
  const z = 0.4 + (0.5 - 0.4) * k;
  const cam = { x: 2150 + (4330 - 2150) * k + Math.sin(t * 0.3) * 5, y: 660 + (850 - 660) * k, z: z * (1 + 0.01 * Math.sin(t * 0.2)) };
  const box = eo(seg(t, 0.8, 1.5));
  const like = eo(seg(t, cues[1] - 0.2, cues[1] + 0.3));
  const iscr = eo(seg(t, cues[1] + 0.5, cues[1] + 1.0));
  const comm = eo(seg(t, cues[2] - 0.1, cues[2] + 0.5));
  return (
    <>
      <Mondo T={STARTS.chiusura + t} cam={cam} chiusura />
      <div style={{ position: 'absolute', left: 96, top: 610, width: 860, opacity: box, transform: `translateY(${(1 - box) * 20}px)` }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 64, color: CHALK, textShadow: '0 4px 0 #0C0820' }}>Ti è servito?</div>
        <div style={{ display: 'flex', gap: 20, marginTop: 22 }}>
          <Pulsante k={like} testo="Metti like" icona={
            <svg width="38" height="38" viewBox="0 0 40 40"><path d="M6 18 H13 V36 H6 Z M15 18 L22 4 Q27 4 26 11 L25 16 H34 Q37 17 36 21 L33 33 Q32 36 28 36 H15 Z" fill={CHALK} /></svg>
          } />
          <Pulsante k={iscr} pieno testo="Iscriviti al canale" icona={
            <svg width="34" height="34" viewBox="0 0 40 40"><path d="M20 4 Q12 4 11 14 V22 L6 30 H34 L29 22 V14 Q28 4 20 4 Z M15 33 Q20 39 25 33 Z" fill={CHALK} /></svg>
          } />
        </div>
        <div style={{ marginTop: 28, fontFamily: SANS, fontWeight: 800, fontSize: 40, color: YEL, opacity: comm, transform: `translateY(${(1 - comm) * 14}px)`, textShadow: '0 3px 0 #0C0820' }}>
          Commenta con il film che vorresti spiegato.
        </div>
      </div>
    </>
  );
};
