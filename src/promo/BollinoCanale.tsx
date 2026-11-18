import React from 'react';
import { SANS } from '../lib/fonts';

/** Nome del canale YouTube (lo stesso di «Cerca In 2 Minuti su YouTube» nelle chiusure). */
export const NOME_CANALE = 'In 2 Minuti';

/**
 * Bollino fisso del canale nei trailer (TRAILER.md, «Bollino del canale»; richiesta dell'utente del 18 nov 2026):
 * logo di YouTube + nome del canale, in alto a destra, visibile dal fotogramma 0 (la miniatura) all'ultimo,
 * sopra cartelli, bande nere e lampi. Zona riservata: x 720–960, y 262–322 (sotto i 250 px coperti dalle app,
 * dentro il margine di 120 px di TikTok, sopra la colonna delle icone che parte da y ≈ 800).
 */
export const BollinoCanale: React.FC = () => (
  <div style={{
    position: 'absolute', right: 120, top: 262, height: 60, boxSizing: 'border-box', padding: '0 20px 0 12px',
    display: 'flex', alignItems: 'center', gap: 12, borderRadius: 14, background: 'rgba(10,10,14,0.78)',
    border: '2px solid rgba(255,255,255,0.22)', boxShadow: '0 4px 18px rgba(0,0,0,0.45)', fontFamily: SANS,
  }}>
    {/* logo di YouTube: rettangolo rosso arrotondato con il triangolo bianco */}
    <svg viewBox="0 0 68 48" width="54" height="38" style={{ display: 'block', flex: 'none' }}>
      <path d="M66.5 7.7c-.8-2.9-3-5.2-5.9-6C55.3.3 34 .3 34 .3S12.7.3 7.4 1.7c-2.9.8-5.1 3.1-5.9 6C.1 13 .1 24 .1 24s0 11 1.4 16.3c.8 2.9 3 5.2 5.9 6C12.7 47.7 34 47.7 34 47.7s21.3 0 26.6-1.4c2.9-.8 5.1-3.1 5.9-6C67.9 35 67.9 24 67.9 24s0-11-1.4-16.3z" fill="#FF0000" />
      <path d="M45 24 27 14v20z" fill="#FFF" />
    </svg>
    <span style={{ color: '#FFF', fontSize: 30, fontWeight: 800, letterSpacing: '0.01em', whiteSpace: 'nowrap' }}>{NOME_CANALE}</span>
  </div>
);
