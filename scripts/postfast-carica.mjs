// Carica un file (video mp4 o immagine png/jpg) su PostFast e stampa la chiave da usare in create_posts (mediaItems).
// Uso: node scripts/postfast-carica.mjs <file> [--film <slug>]
//   --film scrive anche postfast/<slug>.json (chiave, tipo, data, commit), usato dal workflow «Video su MEGA».
// Chiave: variabile POSTFAST_API_KEY (GitHub Actions: segreto; cloud: segnaposto «proxy-injected», la mette il proxy,
// e serve NODE_USE_ENV_PROXY=1 perché fetch passi dal proxy).
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { extname, basename } from 'node:path';
import { spawnSync } from 'node:child_process';

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
let file2 = file;
const mb = (await stat(file)).size / 1e6;
// PostFast accetta video fino a 250 MB: un lungo da 8 minuti a 1080p ne pesa ~290 (errore del 22 nov, Donnie Darko).
// Sopra 240 MB si ricodifica una copia con il bitrate che serve (video H.264, audio AAC 192k), senza toccare l'originale.
if (type === 'VIDEO' && mb > 240) {
  const durata = Number(spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], { encoding: 'utf8' }).stdout);
  const kbps = Math.floor((225 * 8e3) / durata) - 192;
  file2 = file.replace(/\.mp4$/i, '') + '-postfast.mp4';
  console.error(`Video di ${mb.toFixed(0)} MB: ricodifico a ${kbps} kb/s in ${file2}`);
  const r2 = spawnSync('ffmpeg', ['-y', '-v', 'error', '-i', file, '-c:v', 'libx264', '-preset', 'medium', '-b:v', `${kbps}k`,
    '-maxrate', `${Math.round(kbps * 1.5)}k`, '-bufsize', `${kbps * 2}k`, '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k',
    '-movflags', '+faststart', file2], { stdio: 'inherit' });
  if (r2.status !== 0) { console.error('Ricodifica non riuscita'); process.exit(1); }
  const mb2 = (await stat(file2)).size / 1e6;
  if (mb2 > 250) { console.error(`Video ancora troppo grande per PostFast (${mb2.toFixed(0)} MB, massimo 250)`); process.exit(1); }
}

const r = await fetch('https://api.postfa.st/file/get-signed-upload-urls', {
  method: 'POST',
  headers: { 'pf-api-key': chiave, 'Content-Type': 'application/json' },
  body: JSON.stringify({ contentType, count: 1 }),
});
if (!r.ok) { console.error(`PostFast ${r.status}: ${await r.text()}`); process.exit(1); }
const [u] = await r.json();
const put = await fetch(u.signedUrl, { method: 'PUT', headers: { 'Content-Type': contentType }, body: await readFile(file2) });
if (!put.ok) { console.error(`Caricamento non riuscito ${put.status}: ${await put.text()}`); process.exit(1); }

const esito = { file: basename(file), key: u.key, type, caricato: new Date().toISOString(), commit: process.env.GITHUB_SHA ?? null };
if (film) {
  await mkdir('postfast', { recursive: true });
  await writeFile(`postfast/${film}.json`, JSON.stringify(esito, null, 2) + '\n');
}
console.log(JSON.stringify(esito));
