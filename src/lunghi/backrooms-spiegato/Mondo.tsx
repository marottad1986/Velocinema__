import React from 'react';
import { Corridoio } from '../../lib/liminale';
import L from '../../../lunghi/backrooms-spiegato.json';

type Parte = { tipo: string; id: string; durata?: number; capitoli?: { id: string; durata: number }[] };
export const STARTS: Record<string, number> = {};
{
  let acc = 0;
  for (const p of L.parti as Parte[]) for (const c of p.capitoli ?? [{ id: p.id, durata: p.durata! }]) { STARTS[c.id] = acc; acc += c.durata; }
  STARTS.fine = acc;
}
export const Mondo: React.FC<{ T: number }> = ({ T }) => (
  <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
    <Corridoio T={T} z={T * 1.3} x={Math.sin(T * 0.3) * 0.4} />
  </svg>
);
