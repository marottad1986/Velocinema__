// Film da rigenerare dopo un push (usato da .github/workflows/video-mega.yml).
// git diff --name-only A B | node scripts/cambiati.mjs [A B]   → JSON dei film toccati, es. ["shutter-island"]
// node scripts/cambiati.mjs --tutti                      → JSON di tutti i film
// File di un solo film: films/<f>.json (o quadri/<f>.json), src/scenes/<f>/, scripts/audio/<f>.mjs, audio/<f>/.
// src/scenes/quadri/ (copertina e finale comuni ai quadri): tutti i quadri.
// REGOLA DELL'EDITORE (17 nov 2026): i video già prodotti non si toccano mai. Il codice comune (libreria src/lib/, componenti,
// scene comuni dei quadri, codice comune dei lunghi e dei promo, motore audio in scripts/audio/, catalogo degli effetti,
// script, package.json, remotion.config.ts) si può aggiungere o modificare liberamente: non rigenera nessun video.
// Si rigenera solo il film i cui file propri cambiano (è lui che si sta producendo o correggendo), e il video lungo che
// contiene un episodio cambiato. In src/films.ts conta solo la riga del film toccato.
// Per rifare tutto (solo su richiesta esplicita dell'editore): node scripts/cambiati.mjs --tutti.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

// Video lunghi orizzontali (VIDEO-LUNGO.md): lunghi/<slug>.json, src/lunghi/<slug>/, scripts/audio/<slug>.mjs, audio/<slug>/;
// il codice comune dei lunghi (src/lunghi/*.ts*, scripts/lunghi/) non rigenera niente. Un lungo si rigenera quando cambia
// un episodio che contiene (il suo JSON elenca gli episodi in «parti»).
const lunghi = existsSync('lunghi') ? readdirSync('lunghi').filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)).sort() : [];
const episodi = (l) => JSON.parse(readFileSync(`lunghi/${l}.json`, 'utf8')).parti.filter((p) => p.tipo === 'episodio').map((p) => p.film);

const tutti = ['films', 'quadri']
  .flatMap((d) => (existsSync(d) ? readdirSync(d) : []))
  .filter((f) => f.endsWith('.json'))
  .map((f) => f.slice(0, -5))
  .sort();
// Short promozionali e trailer (promo/<slug>.json, src/promo/<slug>/, scripts/audio/<slug>.mjs, audio/<slug>/): entry Remotion
// separata; il codice comune dei promo (src/promo/*.ts*, scripts/promo/) non rigenera niente.
const promo = existsSync('promo') ? readdirSync('promo').filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)).sort() : [];
const sceltiPromo = (file) => {
  const m = file.match(/^promo\/([^/]+)\.json$/) ?? file.match(/^src\/promo\/([^/]+)\//) ?? file.match(/^scripts\/audio\/([^/]+)\.mjs$/) ?? file.match(/^audio\/([^/]+)\//);
  if (m && promo.includes(m[1])) return [m[1]];
  if (/^promo\//.test(file) || /^src\/promo\//.test(file)) return [];
  return null;
};
const AUDIO_COMUNE = /^scripts\/audio\/(synth|film|campioni|effetti|sala|wav|vsco-indice)\.mjs$|^scripts\/audio\/vsco\.json$/;
const PROPRI = [/^(?:films|quadri)\/([^/]+)\.json$/, /^src\/scenes\/([^/]+)\//, /^scripts\/audio\/([^/]+)\.mjs$/, /^audio\/([^/]+)\//];

const [A, B] = process.argv.slice(2).filter((x) => !x.startsWith('--'));

const REGISTRO = 'src/films.ts';
/** Film le cui righe del registro sono cambiate (import delle sue scene o del suo JSON, la sua riga): solo quelli. */
const filmDelRegistro = () => {
  if (!A || !B) return [];
  const diff = execFileSync('git', ['diff', '-U0', A, B, '--', REGISTRO], { encoding: 'utf8' });
  const slugs = new Set();
  for (const l of diff.split('\n').filter((x) => /^[+-]/.test(x) && !/^(\+\+\+|---) /.test(x))) {
    const m = l.match(/from '\.\.\/(?:films|quadri)\/([a-z0-9-]+)\.json'/) ?? l.match(/from '\.\/scenes\/([a-z0-9-]+)(?:\/\w+)?'/) ?? l.match(/slug: '([a-z0-9-]+)'/);
    if (m) slugs.add(m[1]);
  }
  return tutti.filter((f) => slugs.has(f));
};

const sceltiLunghi = (file) => {
  let m = file.match(/^lunghi\/([^/]+)\.json$/) ?? file.match(/^src\/lunghi\/([^/]+)\//) ?? file.match(/^scripts\/audio\/([^/]+)\.mjs$/) ?? file.match(/^audio\/([^/]+)\//);
  if (m && lunghi.includes(m[1])) return [m[1]];
  if (/^src\/lunghi\/[^/]+$/.test(file) || /^scripts\/lunghi\//.test(file)) return []; // codice comune: i video già fatti non si toccano
  return null;
};

const scelti = (file) => {
  const l = sceltiLunghi(file);
  if (l) return l;
  if (file === REGISTRO) return filmDelRegistro();
  const p = sceltiPromo(file);
  if (p) return p;
  if (AUDIO_COMUNE.test(file) || file.startsWith('src/scenes/quadri/')) return []; // codice comune: i video già fatti non si toccano
  for (const re of PROPRI) {
    const m = file.match(re);
    if (m) return tutti.includes(m[1]) ? [m[1]] : [];
  }
  return []; // codice comune (src/, scripts/, package.json…): nessun video già fatto si rigenera
};

let film = [...tutti, ...lunghi, ...promo];
if (!process.argv.includes('--tutti')) {
  const files = readFileSync(0, 'utf8').split('\n').map((s) => s.trim()).filter(Boolean);
  const base = new Set(files.flatMap(scelti));
  // un episodio cambiato: anche i lunghi che lo contengono
  for (const l of lunghi) if (episodi(l).some((e) => base.has(e))) base.add(l);
  film = [...base].sort();
}
console.log(JSON.stringify(film));
