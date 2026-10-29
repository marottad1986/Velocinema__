// Film da rigenerare dopo un push (usato da .github/workflows/video-mega.yml).
// git diff --name-only A B | node scripts/cambiati.mjs [A B]   → JSON dei film toccati, es. ["shutter-island"]
// node scripts/cambiati.mjs --tutti                      → JSON di tutti i film
// File di un solo film: films/<f>.json (o quadri/<f>.json), src/scenes/<f>/, scripts/audio/<f>.mjs, audio/<f>/.
// src/scenes/quadri/ (copertina e finale comuni ai quadri): tutti i quadri.
// Codice comune (resto di src/, scripts/, motore audio in scripts/audio/, package.json, remotion.config.ts): tutti i film.
// Eccezione: se in scripts/audio/effetti.mjs sono state solo AGGIUNTE voci al CATALOGO (serve A B per leggere il diff),
// si rigenerano solo i film il cui spartito usa le voci nuove: un effetto nuovo vale per il film che lo introduce.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const tutti = ['films', 'quadri']
  .flatMap((d) => (existsSync(d) ? readdirSync(d) : []))
  .filter((f) => f.endsWith('.json'))
  .map((f) => f.slice(0, -5))
  .sort();
const quadri = existsSync('quadri') ? readdirSync('quadri').filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)).sort() : [];
const AUDIO_COMUNE = /^scripts\/audio\/(synth|film|campioni|effetti|sala|wav|vsco-indice)\.mjs$|^scripts\/audio\/vsco\.json$/;
const COMUNI = [/^src\//, /^scripts\/[^/]+\.mjs$/, AUDIO_COMUNE, /^package(-lock)?\.json$/, /^remotion\.config\.ts$/];
const PROPRI = [/^(?:films|quadri)\/([^/]+)\.json$/, /^src\/scenes\/([^/]+)\//, /^scripts\/audio\/([^/]+)\.mjs$/, /^audio\/([^/]+)\//];

const EFFETTI = 'scripts/audio/effetti.mjs';
const [A, B] = process.argv.slice(2).filter((x) => !x.startsWith('--'));

/** Film che usano le voci aggiunte al catalogo, o null se il diff di effetti.mjs non è fatto solo di voci aggiunte. */
const soloVociNuove = () => {
  if (!A || !B) return null;
  const diff = execFileSync('git', ['diff', '-U0', A, B, '--', EFFETTI], { encoding: 'utf8' });
  const righe = diff.split('\n').filter((l) => /^[+-]/.test(l) && !/^(\+\+\+|---) /.test(l));
  const ids = [];
  for (const l of righe) {
    const m = l.match(/^\+  ([a-z0-9_]+): \[.*\],\s*$/);
    if (!m) return null; // righe tolte o modificate, o codice: cambia il motore
    ids.push(m[1]);
  }
  return tutti.filter((f) => {
    const p = `scripts/audio/${f}.mjs`;
    return existsSync(p) && ids.some((id) => readFileSync(p, 'utf8').includes(`'${id}'`));
  });
};

const scelti = (file) => {
  if (file === EFFETTI) return soloVociNuove() ?? tutti;
  if (AUDIO_COMUNE.test(file)) return tutti; // motore audio: campioni, effetti, riverbero
  if (file.startsWith('src/scenes/quadri/')) return quadri; // scene comuni a tutti i quadri
  for (const re of PROPRI) {
    const m = file.match(re);
    if (m) return tutti.includes(m[1]) ? [m[1]] : [];
  }
  if (['scripts/cambiati.mjs', 'scripts/controlli.mjs', 'scripts/genera-voce.mjs'].includes(file)) return []; // non cambiano i video
  return COMUNI.some((re) => re.test(file)) ? tutti : [];
};

let film = tutti;
if (!process.argv.includes('--tutti')) {
  const files = readFileSync(0, 'utf8').split('\n').map((s) => s.trim()).filter(Boolean);
  film = [...new Set(files.flatMap(scelti))].sort();
}
console.log(JSON.stringify(film));
