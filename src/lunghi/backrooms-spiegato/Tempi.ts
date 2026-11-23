import { seg } from '../../lib/anim';
import { subtitleTimes } from '../../components/ChapterOverlay';
import L from '../../../lunghi/backrooms-spiegato.json';

// Tempi del lungo di Backrooms spiegato: inizio e durata di ogni tratto, istanti delle frasi (tempi veri della voce),
// griglia della musica (75 bpm, croma 0,4 s). Usati dal mondo (Mondo.tsx), dalle vedute (Pov.tsx) e dallo spartito.

export type Cam = { x: number; y: number; z: number };
// ---------------------------------------------------------------------------------------------------------------- tempi

type Voce = { parlato: number; frasi: number[][] };
type Parte = { tipo: string; id: string; durata?: number; sottotitoli?: string[]; voce?: Voce; capitoli?: { id: string; titolo?: string; durata: number; sottotitoli: string[]; voce?: Voce }[] };
export const STARTS: Record<string, number> = {};
export const DUR: Record<string, number> = {};
export const CUES: Record<string, number[]> = {};
export const INIZIO: Record<string, number> = { aggancio: 0.4, chiusura: 0.5 };
export const TITOLI: Record<string, number> = {};
{
  let acc = 0;
  for (const p of L.parti as Parte[]) {
    const items = p.capitoli ?? [{ id: p.id, durata: p.durata!, sottotitoli: p.sottotitoli!, voce: p.voce }];
    for (const c of items) {
      const i0 = INIZIO[c.id] ?? 0;
      STARTS[c.id] = acc;
      DUR[c.id] = c.durata;
      CUES[c.id] = c.voce && c.voce.frasi.length === c.sottotitoli.length
        ? c.voce.frasi.map(([a]) => acc + i0 + a)
        : subtitleTimes(c.sottotitoli, c.durata - i0).map(([a]) => acc + i0 + a);
      if ('titolo' in c && c.titolo) TITOLI[c.id] = (c.titolo as string).length;
      acc += c.durata;
    }
  }
  STARTS.fine = acc;
}
export const CROMA = 60 / (L as { bpm: number }).bpm / 2;
export const g = (s: number) => Math.round(s / CROMA) * CROMA;
/** Istante (sulla croma) della frase i del capitolo id, più d secondi. */
export const ev = (id: string, i: number, d = 0) => g(CUES[id][i] + d);
export const S = (id: string) => STARTS[id];
export const E = (id: string) => STARTS[id] + DUR[id];
export const inCap = (T: number, id: string) => T >= S(id) && T < E(id);
/** Opacità degli elementi di un capitolo: entrano in 0,3 s e svaniscono negli ultimi 0,5 s. */
export const capOp = (T: number, id: string, a = S(id), b = E(id)) => seg(T, a, a + 0.3) * (1 - seg(T, b - 0.1, b + 0.4));
export const capitoloDi = (T: number) => Object.keys(TITOLI).find((id) => T >= STARTS[id] && T < STARTS[id] + DUR[id]);

