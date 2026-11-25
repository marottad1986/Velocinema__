import type { Capitolo, FilmData, Palette, VoceTempi } from '../types';
import { subtitleTimes } from '../components/ChapterOverlay';
import { SIGLA_DURATA } from '../sigla/Sigla';

// Video lunghi orizzontali (VIDEO-LUNGO.md): tempi delle parti, uguali a scripts/lunghi/tempi.mjs.

export type ParteAggancio = { tipo: 'aggancio' | 'chiusura'; id: string; durata: number; capitolo_youtube: string; sottotitoli: string[]; immagine?: string; voce?: VoceTempi };
export type ParteEpisodio = { tipo: 'episodio'; film: string; nome: string; sottotitolo: string; capitolo_youtube: string; /** riassunto nuovo (senza «In una frase:»), al posto della voce del finale dell'episodio */ riassunto?: string };
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
  /** Sigla «2M Studios» al secondo zero (decisione dell'editore, 25 nov 2026): solo nei lunghi nuovi, quelli già usciti restano come sono. */
  sigla?: boolean;
};

/** Un tratto del video lungo, con i tempi assoluti (s). */
export type Tratto =
  | { tipo: 'sigla'; id: 'sigla'; start: number; dur: number; indice: -1 }
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
  if (L.sigla) {
    out.push({ tipo: 'sigla', id: 'sigla', start: 0, dur: SIGLA_DURATA, indice: -1 });
    t = SIGLA_DURATA;
  }
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

/** Da dove parte la voce in un tratto (come INIZIO_VOCE in scripts/lunghi/tempi.mjs). */
export const INIZIO_VOCE: Record<string, number> = { aggancio: 0.4, chiusura: 0.5, riassunto: 0.3 };

/**
 * Finestre [inizio, fine] di ogni frase di un tratto, dai tempi veri della voce (`voce.frasi` nel JSON, da
 * ascolta-voce --scrivi-tempi): ogni sottotitolo resta finché parte il successivo, l'ultimo fino a 1,2 s dopo la voce.
 * null se il tratto non ha i tempi della voce (lunghi già usciti: restano come prima).
 */
export const tempiVoce = (righe: string[], v: VoceTempi | undefined, inizio: number, dur: number): [number, number][] | null => {
  if (!v || v.frasi.length !== righe.length) return null;
  const a = v.frasi.map(([s]) => inizio + s - 0.05);
  const fine = Math.min(dur - 0.1, inizio + v.frasi[v.frasi.length - 1][1] + 1.2);
  return a.map((s, i) => [Math.max(0, s), i + 1 < a.length ? a[i + 1] : fine]);
};
