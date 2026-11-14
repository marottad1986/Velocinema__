import type React from 'react';
import type { Palette } from '../types';
import { subtitleTimes } from '../components/ChapterOverlay';
import canaleDark from '../../promo/canale-youtube-dark.json';
import { Scena as CanaleDark } from './canale-youtube-dark/Scena';

// Short promozionali verticali (1080×1920) che portano al canale YouTube: JSON in promo/<slug>.json, scena in src/promo/<slug>/.
// Una sola immagine per tutto lo Short, con la camera che segue la voce; sottotitoli come nei video verticali.

export type PartePromo = { id: string; durata: number; immagine: string; sottotitoli: string[] };
export type PromoData = { formato: 'promo'; titolo: string; regista?: string; anno: number; bpm: number; lungo?: string; palette: Palette; parti: PartePromo[]; fonti?: string[] };

/** La frase di lancio entra da qui: il fotogramma 0 è la miniatura senza testo (CLAUDE.md). */
export const INIZIO_LANCIO = 0.4;

export type TempiPromo = { inizio: Record<string, number>; frasi: Record<string, [number, number][]>; fine: number };

/** Inizio di ogni parte e istanti (s dall'inizio dello Short) di ogni frase, come scripts/promo/tempi.mjs. */
export const tempiPromo = (d: PromoData): TempiPromo => {
  const inizio: Record<string, number> = {};
  const frasi: Record<string, [number, number][]> = {};
  let t = 0;
  d.parti.forEach((p, i) => {
    inizio[p.id] = t;
    const o = i === 0 ? INIZIO_LANCIO : 0;
    frasi[p.id] = subtitleTimes(p.sottotitoli, p.durata - o).map(([a, b]) => [t + o + a, t + o + b]);
    t += p.durata;
  });
  return { inizio, frasi, fine: t };
};

/** Scena: T = secondi dall'inizio dello Short; cue(id, n) = inizio della frase n della parte id. */
export type ScenaPromoProps = { T: number; tempi: TempiPromo; cue: (id: string, n: number) => number };
export type PromoDef = { slug: string; data: PromoData; Scena: React.FC<ScenaPromoProps> };

export const PROMO: PromoDef[] = [{ slug: 'canale-youtube-dark', data: canaleDark as PromoData, Scena: CanaleDark }];

export const getPromo = (slug: string) => {
  const p = PROMO.find((x) => x.slug === slug);
  if (!p) throw new Error(`Promo "${slug}" non registrato in src/promo/registro.ts`);
  return p;
};
