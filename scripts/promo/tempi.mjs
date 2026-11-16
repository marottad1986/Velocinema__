// Short promozionali verticali (promo/<slug>.json): tempi delle parti e delle frasi, uguali a src/promo/registro.ts.
import { existsSync, readFileSync, readdirSync } from 'node:fs';

/** La frase di lancio entra qui (fotogramma 0 = miniatura senza testo): come INIZIO_LANCIO in src/promo/registro.ts. */
export const INIZIO_LANCIO = 0.4;

export const promo = () => (existsSync('promo') ? readdirSync('promo').filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)) : []);
export const loadPromo = (slug) => JSON.parse(readFileSync(`promo/${slug}.json`, 'utf8'));

/** Come subtitleTimes di src/components/ChapterOverlay.tsx. */
const subtitleTimes = (lines, dur) => {
  const w = lines.map((l) => l.length + 6);
  const total = w.reduce((a, b) => a + b, 0);
  let cur = 0.15;
  return w.map((x) => { const a = cur; cur += (x / total) * (dur - 0.35); return [a, cur]; });
};

/** Parti con inizio (s), durata utile per la voce, frasi (s dall'inizio dello Short) e nome della clip. */
export const partiPromo = (P) => {
  let t = 0;
  return P.parti.map((p, i) => {
    const o = i === 0 ? INIZIO_LANCIO : 0;
    const x = { id: p.id, start: t, dur: p.durata, voceDa: t + o, testo: p.sottotitoli, base: `${String(i).padStart(2, '0')}_${p.id}`,
      frasi: subtitleTimes(p.sottotitoli, p.durata - o).map(([a]) => t + o + a) };
    t += p.durata;
    return x;
  });
};
export const durataPromo = (P) => P.parti.reduce((a, p) => a + p.durata, 0);
