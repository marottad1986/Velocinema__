import { eio, lerp, seg } from '../../lib/anim';

// Pezzi comuni alle inquadrature disegnate per il trailer di Ritorno al futuro (src/promo/trailer-ritorno-al-futuro/).
// Ogni inquadratura riceve t = secondi dal suo inizio e dur = durata; i colori seguono qualita/ritorno-al-futuro.md:
// notte viola anni '80 con neon ciano e magenta, 1955 in pastelli da cartolina, 1885 in seppia; giallo solo per il tempo.

export type ShotProps = { t: number; dur: number; id: string; ev?: number };

export const K = '#140E2A'; // contorni scuri
export const YEL = '#F5C23A';
export const CYAN = '#5CF0FF';
export const MAG = '#FF4FB0';
export const CREAM = '#F3E6C8';
export const SEPIA = '#3B2A1F';
export const RED = '#E8553F';
export const TINT = '#1A1238';

/** Camera del trailer: spinta lenta ma sensibile anche in pochi secondi (zoom 1 → 1+z, pan di `pan` px). */
export const cam = (t: number, dur: number, { z = 0.08, pan = 50, cx = 540, cy = 900 } = {}) => {
  const p = eio(seg(t, 0, dur));
  const s = 1 + z * p;
  const x = lerp(-pan, pan, p);
  return {
    p,
    transform: `translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`,
    L: (f: number) => `translate(${(-x * f).toFixed(1)} 0)`,
  };
};
