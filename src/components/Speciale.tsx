import React from 'react';
import { SANS } from '../lib/fonts';

/** Bollino «SPECIALE …» della copertina (campo `copertina.speciale` del JSON): arancione e nero, accanto all'etichetta. */
export const Speciale: React.FC<{ nome?: string; opacity?: number; scale?: number }> = ({ nome, opacity = 1, scale = 1 }) =>
  nome ? (
    <span style={{ display: 'inline-block', marginLeft: 18, padding: '6px 16px 7px', borderRadius: 999, background: '#F28C1E', color: '#14100C',
      fontFamily: SANS, fontSize: 26, fontWeight: 800, letterSpacing: '0.12em', verticalAlign: 'middle', boxShadow: '0 3px 0 #14100C',
      opacity, transform: `scale(${scale})`, transformOrigin: 'left center' }}>
      SPECIALE {nome.toUpperCase()}
    </span>
  ) : null;
