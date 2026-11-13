// Film da rigenerare dopo un push (usato da .github/workflows/video-mega.yml).
// git diff --name-only A B | node scripts/cambiati.mjs [A B]   → JSON dei film toccati, es. ["shutter-island"]
// node scripts/cambiati.mjs --tutti                      → JSON di tutti i film
// File di un solo film: films/<f>.json (o quadri/<f>.json), src/scenes/<f>/, scripts/audio/<f>.mjs, audio/<f>/.
// src/scenes/quadri/ (copertina e finale comuni ai quadri): tutti i quadri.
// Codice comune (resto di src/, scripts/, motore audio in scripts/audio/, package.json, remotion.config.ts): tutti i film.
// Eccezione: se in scripts/audio/effetti.mjs sono state solo AGGIUNTE voci al CATALOGO (serve A B per leggere il diff),
// si rigenerano solo i film il cui spartito usa le voci nuove: un effetto nuovo vale per il film che lo introduce.
// Eccezione: se in src/films.ts sono state solo AGGIUNTE righe di un film (import del suo JSON, delle sue scene, della
// sua locandina e la riga del registro; al massimo cambia l'elenco dei font importati), si rigenerano solo quei film:
// registrare un film nuovo non cambia gli altri video.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

// Video lunghi orizzontali (VIDEO-LUNGO.md): lunghi/<slug>.json, src/lunghi/<slug>/, scripts/audio/<slug>.mjs, audio/<slug>/;
// codice comune dei lunghi (src/lunghi/*.ts*, scripts/lunghi/): tutti i lunghi. Un lungo si rigenera anche quando cambia
// un episodio che contiene (il suo JSON elenca gli episodi in «parti»). Il codice comune dei verticali (src/, scripts/…)
// rigenera anche i lunghi.
const lunghi = existsSync('lunghi') ? readdirSync('lunghi').filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)).sort() : [];
const episodi = (l) => JSON.parse(readFileSync(`lunghi/${l}.json`, 'utf8')).parti.filter((p) => p.tipo === 'episodio').map((p) => p.film);

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

const REGISTRO = 'src/films.ts';
/** Film aggiunti al registro, o null se il diff di src/films.ts tocca altro (film esistenti, codice). */
const soloFilmAggiunti = () => {
  if (!A || !B) return null;
  const diff = execFileSync('git', ['diff', '-U0', A, B, '--', REGISTRO], { encoding: 'utf8' });
  const righe = diff.split('\n').filter((l) => /^[+-]/.test(l) && !/^(\+\+\+|---) /.test(l));
  const FONT = /^[+-]import \{[A-Z_, ]+\} from '\.\/lib\/fonts';$/;
  const slugs = new Set();
  for (const l of righe) {
    if (FONT.test(l)) continue; // un font in più nell'elenco importato non cambia gli altri film
    if (!l.startsWith('+')) return null; // righe tolte o modificate: cambia il registro dei film esistenti
    const m = l.match(/^\+import \w+ from '\.\.\/(?:films|quadri)\/([a-z0-9-]+)\.json';$/)
      ?? l.match(/^\+import \{[^}]+\} from '\.\/scenes\/([a-z0-9-]+)(?:\/\w+)?';$/)
      ?? l.match(/^\+  \{ slug: '([a-z0-9-]+)',.*\},$/);
    if (!m) return null;
    slugs.add(m[1]);
  }
  return tutti.filter((f) => slugs.has(f));
};

const sceltiLunghi = (file) => {
  let m = file.match(/^lunghi\/([^/]+)\.json$/) ?? file.match(/^src\/lunghi\/([^/]+)\//) ?? file.match(/^scripts\/audio\/([^/]+)\.mjs$/) ?? file.match(/^audio\/([^/]+)\//);
  if (m && lunghi.includes(m[1])) return [m[1]];
  if (/^src\/lunghi\/[^/]+$/.test(file) || /^scripts\/lunghi\//.test(file)) return lunghi;
  return null;
};

const scelti = (file) => {
  const l = sceltiLunghi(file);
  if (l) return l;
  if (file === EFFETTI) return soloVociNuove() ?? tutti;
  if (file === REGISTRO) return soloFilmAggiunti() ?? tutti;
  if (AUDIO_COMUNE.test(file)) return tutti; // motore audio: campioni, effetti, riverbero
  if (file.startsWith('src/scenes/quadri/')) return quadri; // scene comuni a tutti i quadri
  for (const re of PROPRI) {
    const m = file.match(re);
    if (m) return tutti.includes(m[1]) ? [m[1]] : [];
  }
  if (['scripts/cambiati.mjs', 'scripts/controlli.mjs', 'scripts/genera-voce.mjs', 'scripts/pacchetto.mjs', 'scripts/livelli.mjs'].includes(file)) return []; // non cambiano i video
  return COMUNI.some((re) => re.test(file)) ? tutti : [];
};

let film = [...tutti, ...lunghi];
if (!process.argv.includes('--tutti')) {
  const files = readFileSync(0, 'utf8').split('\n').map((s) => s.trim()).filter(Boolean);
  const base = new Set(files.flatMap(scelti));
  // codice comune dei verticali: anche i lunghi; un episodio cambiato: anche i lunghi che lo contengono
  if (tutti.every((f) => base.has(f))) lunghi.forEach((l) => base.add(l));
  for (const l of lunghi) if (episodi(l).some((e) => base.has(e))) base.add(l);
  film = [...base].sort();
}
console.log(JSON.stringify(film));
