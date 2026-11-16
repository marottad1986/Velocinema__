// Carica un file (video mp4 o immagine png/jpg) su PostFast e stampa la chiave da usare in create_posts (mediaItems).
// Uso: node scripts/postfast-carica.mjs <file> [--film <slug>]
//   --film scrive anche postfast/<slug>.json (chiave, tipo, data, commit), usato dal workflow «Video su MEGA».
// Chiave: variabile POSTFAST_API_KEY (GitHub Actions: segreto; cloud: segnaposto «proxy-injected», la mette il proxy,
// e serve NODE_USE_ENV_PROXY=1 perché fetch passi dal proxy).
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { extname, basename } from 'node:path';

const args = process.argv.slice(2);
const file = args[0];
const i = args.indexOf('--film');
const film = i >= 0 ? args[i + 1] : null;
if (!file) { console.error('Uso: node scripts/postfast-carica.mjs <file> [--film <slug>]'); process.exit(1); }
const chiave = process.env.POSTFAST_API_KEY;
if (!chiave) { console.error('Manca POSTFAST_API_KEY'); process.exit(1); }

const tipi = { '.mp4': ['video/mp4', 'VIDEO'], '.png': ['image/png', 'IMAGE'], '.jpg': ['image/jpeg', 'IMAGE'], '.jpeg': ['image/jpeg', 'IMAGE'] };
const t = tipi[extname(file).toLowerCase()];
if (!t) { console.error(`Formato non gestito: ${file}`); process.exit(1); }
const [contentType, type] = t;
const mb = (await stat(file)).size / 1e6;
if (type === 'VIDEO' && mb > 250) { console.error(`Video troppo grande per PostFast (${mb.toFixed(0)} MB, massimo 250)`); process.exit(1); }

const r = await fetch('https://api.postfa.st/file/get-signed-upload-urls', {
  method: 'POST',
  headers: { 'pf-api-key': chiave, 'Content-Type': 'application/json' },
  body: JSON.stringify({ contentType, count: 1 }),
});
if (!r.ok) { console.error(`PostFast ${r.status}: ${await r.text()}`); process.exit(1); }
const [u] = await r.json();
const put = await fetch(u.signedUrl, { method: 'PUT', headers: { 'Content-Type': contentType }, body: await readFile(file) });
if (!put.ok) { console.error(`Caricamento non riuscito ${put.status}: ${await put.text()}`); process.exit(1); }

const esito = { file: basename(file), key: u.key, type, caricato: new Date().toISOString(), commit: process.env.GITHUB_SHA ?? null };
if (film) {
  await mkdir('postfast', { recursive: true });
  await writeFile(`postfast/${film}.json`, JSON.stringify(esito, null, 2) + '\n');
}
console.log(JSON.stringify(esito));
