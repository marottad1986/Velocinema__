// Film da rigenerare dopo un push (usato da .github/workflows/video-mega.yml).
// git diff --name-only A B | node scripts/cambiati.mjs   → JSON dei film toccati, es. ["shutter-island"]
// node scripts/cambiati.mjs --tutti                      → JSON di tutti i film
// File di un solo film: films/<f>.json, src/scenes/<f>/, scripts/audio/<f>.mjs, audio/<f>/.
// Codice comune (resto di src/, scripts/, package.json, remotion.config.ts): tutti i film.
import { readdirSync, readFileSync } from 'node:fs';

const tutti = readdirSync('films').filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)).sort();
const COMUNI = [/^src\//, /^scripts\/[^/]+\.mjs$/, /^scripts\/audio\/(synth|film)\.mjs$/, /^package(-lock)?\.json$/, /^remotion\.config\.ts$/];
const PROPRI = [/^films\/([^/]+)\.json$/, /^src\/scenes\/([^/]+)\//, /^scripts\/audio\/([^/]+)\.mjs$/, /^audio\/([^/]+)\//];

const scelti = (file) => {
  for (const re of PROPRI) {
    const m = file.match(re);
    if (m) return tutti.includes(m[1]) ? [m[1]] : [];
  }
  if (file === 'scripts/cambiati.mjs') return [];
  return COMUNI.some((re) => re.test(file)) ? tutti : [];
};

let film = tutti;
if (!process.argv.includes('--tutti')) {
  const files = readFileSync(0, 'utf8').split('\n').map((s) => s.trim()).filter(Boolean);
  film = [...new Set(files.flatMap(scelti))].sort();
}
console.log(JSON.stringify(film));
