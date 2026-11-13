// Video lunghi orizzontali (VIDEO-LUNGO.md): JSON in lunghi/<slug>.json e tempi delle parti, uguali a src/lunghi/tempi.ts.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { loadFilm } from '../audio/film.mjs';

export const lunghi = () => (existsSync('lunghi') ? readdirSync('lunghi').filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)).sort() : []);
export const loadLungo = (slug) => JSON.parse(readFileSync(`lunghi/${slug}.json`, 'utf8'));
/** Episodi (film/serie già fatti) montati nel lungo. */
export const episodiDi = (L) => L.parti.filter((p) => p.tipo === 'episodio').map((p) => p.film);

/**
 * Tratti in ordine, con i tempi assoluti e la clip della voce di ognuno:
 * { tipo, id, start, dur, testo[], voce: { dir, base } | null, film?, parte }
 * tipo: aggancio · carta (copertina dell'episodio) · capitolo-episodio · riassunto (finale dell'episodio) · capitolo · chiusura.
 * Clip nuove in audio/<slug>/ numerate in ordine (00_aggancio, 01_<capitolo>… NN_chiusura); quelle degli episodi restano in
 * audio/<episodio>/ con i loro nomi (00_copertina, 01_<id>…, NN_finale).
 */
export const trattiLungo = (slug, L = loadLungo(slug)) => {
  const out = [];
  let t = 0;
  let n = 0;
  const nuova = (id) => ({ dir: `audio/${slug}`, base: `${String(n++).padStart(2, '0')}_${id}` });
  for (const p of L.parti) {
    if (p.tipo === 'aggancio' || p.tipo === 'chiusura') {
      out.push({ tipo: p.tipo, id: p.id, start: t, dur: p.durata, testo: p.sottotitoli, voce: nuova(p.id), parte: p });
      t += p.durata;
    } else if (p.tipo === 'episodio') {
      const f = loadFilm(p.film);
      const dir = `audio/${p.film}`;
      out.push({ tipo: 'carta', id: `${p.film}--carta`, start: t, dur: f.copertina.durata, testo: f.copertina.voce ? [f.copertina.voce] : [], voce: f.copertina.voce ? { dir, base: '00_copertina' } : null, film: p.film, parte: p });
      t += f.copertina.durata;
      f.capitoli.forEach((c, i) => {
        out.push({ tipo: 'capitolo-episodio', id: `${p.film}--${c.id}`, start: t, dur: c.durata, testo: c.sottotitoli, voce: { dir, base: `${String(i + 1).padStart(2, '0')}_${c.id}` }, film: p.film, parte: p, capitolo: c });
        t += c.durata;
      });
      const nf = String(f.capitoli.length + 1).padStart(2, '0');
      out.push({ tipo: 'riassunto', id: `${p.film}--riassunto`, start: t, dur: f.finale.durata, testo: f.finale.voce ? [f.finale.voce] : [], voce: f.finale.voce ? { dir, base: `${nf}_finale` } : null, film: p.film, parte: p });
      t += f.finale.durata;
    } else {
      for (const c of p.capitoli) {
        out.push({ tipo: 'capitolo', id: c.id, start: t, dur: c.durata, testo: c.sottotitoli, voce: nuova(c.id), parte: p, capitolo: c });
        t += c.durata;
      }
    }
  }
  return out;
};

export const durataLungo = (tr) => tr.reduce((a, x) => Math.max(a, x.start + x.dur), 0);

/** Inizio di ogni parte del JSON (per i capitoli YouTube e per posare la musica degli episodi). */
export const inizioParti = (tr) => {
  const m = new Map();
  for (const x of tr) if (!m.has(x.parte)) m.set(x.parte, x.start);
  return m;
};

/** m:ss (h:mm:ss oltre l'ora), come vuole YouTube nei capitoli della descrizione. */
export const mmss = (s) => {
  const x = Math.floor(s + 1e-6);
  const h = Math.floor(x / 3600), m = Math.floor((x % 3600) / 60), r = x % 60;
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}` : `${m}:${String(r).padStart(2, '0')}`;
};
