// Dati comuni agli script audio: JSON del film, inizi dei capitoli, ffmpeg.
import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

export const loadFilm = (slug) => {
  const path = `films/${slug}.json`;
  if (!existsSync(path)) throw new Error(`Non trovo ${path}`);
  return JSON.parse(readFileSync(path, 'utf8'));
};

/**
 * Tempi del film in secondi, come in src/components/Film.tsx: copertina da 0, poi i capitoli in ordine.
 * T[id] = inizio del capitolo, T.finale = inizio del finale, T.END = durata totale.
 * segments = [{ n, id, start, dur, testo[] }] con n = 0 per la copertina e 1… per i capitoli.
 */
export const timeline = (film) => {
  const T = { copertina: 0 };
  const segments = [{ n: 0, id: 'copertina', start: 0, dur: film.copertina.durata, testo: film.copertina.voce ? [film.copertina.voce] : [] }];
  let acc = film.copertina.durata;
  film.capitoli.forEach((c, i) => {
    T[c.id] = acc;
    segments.push({ n: i + 1, id: c.id, start: acc, dur: c.durata, testo: c.sottotitoli });
    acc += c.durata;
  });
  T.finale = acc;
  T.END = acc + film.finale.durata;
  segments.push({ n: film.capitoli.length + 1, id: 'finale', start: acc, dur: film.finale.durata, testo: film.finale.voce ? [film.finale.voce] : [] });
  return { T, segments };
};

/** Esegue ffmpeg/ffprobe; in caso di errore mostra l'output ed esce. */
export const run = (cmd, args, { quiet = false } = {}) => {
  const res = spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (res.error) throw new Error(`${cmd} non trovato: è nel PATH? (${res.error.message})`);
  if (res.status !== 0) {
    if (!quiet) console.error(res.stderr);
    throw new Error(`${cmd} è terminato con codice ${res.status}`);
  }
  return res.stdout;
};

/** Durata in secondi di un file audio/video. */
export const duration = (file) => Number(run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).trim());

/** true se il file ha almeno una traccia audio. */
export const hasAudio = (file) => run('ffprobe', ['-v', 'error', '-select_streams', 'a', '-show_entries', 'stream=index', '-of', 'csv=p=0', file]).trim() !== '';
