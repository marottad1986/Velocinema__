import type { Capitolo, FilmData, Palette } from '../types';
import { subtitleTimes } from '../components/ChapterOverlay';

// Video lunghi orizzontali (VIDEO-LUNGO.md): tempi delle parti, uguali a scripts/lunghi/tempi.mjs.

export type ParteAggancio = { tipo: 'aggancio' | 'chiusura'; id: string; durata: number; capitolo_youtube: string; sottotitoli: string[]; immagine?: string };
export type ParteEpisodio = { tipo: 'episodio'; film: string; nome: string; sottotitolo: string; capitolo_youtube: string };
export type ParteCapitoli = { tipo: 'capitoli'; id: string; nome: string; capitolo_youtube: string; capitoli: Capitolo[] };
export type Parte = ParteAggancio | ParteEpisodio | ParteCapitoli;

export type LungoData = {
  formato: 'lungo';
  titolo: string;
  titolo_youtube: string;
  etichetta: string;
  regista?: string;
  anno: number;
  bpm: number;
  palette: Palette;
  parti: Parte[];
  fonti?: string[];
};

/** Un tratto del video lungo, con i tempi assoluti (s). */
export type Tratto =
  | { tipo: 'aggancio' | 'chiusura'; id: string; start: number; dur: number; parte: ParteAggancio; indice: number }
  | { tipo: 'carta' | 'riassunto'; id: string; start: number; dur: number; parte: ParteEpisodio; film: FilmData; indice: number }
  | { tipo: 'capitolo-episodio'; id: string; start: number; dur: number; parte: ParteEpisodio; film: FilmData; capitolo: Capitolo; n: number; di: number; indice: number }
  | { tipo: 'capitolo'; id: string; start: number; dur: number; parte: ParteCapitoli; capitolo: Capitolo; n: number; di: number; indice: number };

/**
 * Tratti in ordine. Un episodio occupa 4 s di cartello (la sua copertina) + i capitoli + 4 s di riassunto (il suo finale),
 * cioè la stessa durata del video verticale, così la sua musica si posa intera a partire dall'inizio del cartello.
 */
export const tratti = (L: LungoData, episodi: Record<string, FilmData>): Tratto[] => {
  const out: Tratto[] = [];
  let t = 0;
  L.parti.forEach((p, indice) => {
    if (p.tipo === 'aggancio' || p.tipo === 'chiusura') {
      out.push({ tipo: p.tipo, id: p.id, start: t, dur: p.durata, parte: p, indice });
      t += p.durata;
    } else if (p.tipo === 'episodio') {
      const f = episodi[p.film];
      out.push({ tipo: 'carta', id: `${p.film}--carta`, start: t, dur: f.copertina.durata, parte: p, film: f, indice });
      t += f.copertina.durata;
      f.capitoli.forEach((c, i) => {
        out.push({ tipo: 'capitolo-episodio', id: `${p.film}--${c.id}`, start: t, dur: c.durata, parte: p, film: f, capitolo: c, n: i + 1, di: f.capitoli.length, indice });
        t += c.durata;
      });
      out.push({ tipo: 'riassunto', id: `${p.film}--riassunto`, start: t, dur: f.finale.durata, parte: p, film: f, indice });
      t += f.finale.durata;
    } else if (p.tipo === 'capitoli') {
      p.capitoli.forEach((c: Capitolo, i: number) => {
        out.push({ tipo: 'capitolo', id: c.id, start: t, dur: c.durata, parte: p, capitolo: c, n: i + 1, di: p.capitoli.length, indice });
        t += c.durata;
      });
    }
  });
  return out;
};

export const durataTotale = (tr: Tratto[]) => tr.reduce((a, x) => Math.max(a, x.start + x.dur), 0);

/** Inizio (s) di ogni frase di un tratto con testo, come i sottotitoli dei video verticali. */
export const cuesDi = (righe: string[], dur: number) => subtitleTimes(righe, dur).map(([a]) => a);
