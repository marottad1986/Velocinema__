#!/usr/bin/env node
// Ricerche su YouTube in Italia: quali film e serie la gente cerca di più, e quanta concorrenza c'è.
// Uso: node scripts/strumenti/ricerche-youtube.mjs [--candidati 25] [--solo-suggerimenti] [--titoli "lost,backrooms"]
//
// 1. Suggerimenti di ricerca di YouTube (autocompletamento, Italia): YouTube li ordina per quanto vengono cercati.
//    Si interrogano frasi come «spiegazione finale», «riassunto»… con ogni lettera e si dà a ogni titolo un punteggio
//    (più punti a chi compare più in alto e in più frasi). Gratis, nessuna chiave.
// 2. Se c'è la chiave della YouTube Data API v3 (nell'ambiente cloud la mette il proxy nell'intestazione X-Goog-Api-Key
//    per www.googleapis.com; in locale nella variabile YOUTUBE_API_KEY), per i titoli migliori si cercano i video
//    «<titolo> spiegazione» in italiano e si misurano le visualizzazioni: domanda (quante viste fanno i primi video) e
//    concorrenza (quanti video recenti e quanto sono grandi). Costo: circa 101 unità per titolo su 10.000 al giorno gratis.
// Report in out/ricerche/<data>.md. Le decisioni (titoli disegnabili senza persone ecc.) restano al manager.
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const opz = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const N = Number(opz('--candidati', 25));
const soloSuggerimenti = args.includes('--solo-suggerimenti');
const titoliExtra = (opz('--titoli', '') || '').split(',').map((s) => s.trim()).filter(Boolean);

const attendi = (ms) => new Promise((r) => setTimeout(r, ms));
function curl(url, headers = []) {
  const h = headers.flatMap((x) => ['-H', x]);
  const r = spawnSync('curl', ['-sS', '-m', '20', ...h, '-w', '\n%{http_code}', url], { encoding: 'utf8' });
  const out = r.stdout || '';
  const i = out.lastIndexOf('\n');
  return { codice: Number(out.slice(i + 1)), corpo: out.slice(0, i) };
}

// ---------- 1. suggerimenti ----------
const PREFISSI = ['spiegazione finale', 'spiegazione', 'finale spiegato', 'spiegato', 'riassunto', 'tutta la serie', 'teorie'];
const LETTERE = ['', ...'abcdefghijklmnopqrstuvwz'];
// parole che non sono titoli (materie di scuola, sport, ecc.): restano fuori dal punteggio
const NON_TITOLI = /\b(guerra mondiale|logaritm|ai bambini|facile|semplice|in breve|per tutti|gen z|male|bene|capitolo|promessi sposi|iliade|eneide|odissea$|kant|hegel|platone|nietzsche|filosofia|matematica|f1|serie a|serie b|garlasco|ita$|trailer)\b/i;

function suggerisci(q) {
  const u = 'https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&hl=it&gl=IT&q=' + encodeURIComponent(q);
  const r = curl(u);
  if (r.codice !== 200) return null;
  try { return JSON.parse(r.corpo)[1]; } catch { return null; }
}

const punti = new Map(); // titolo -> {punti, frasi:Set}
let ok = 0, fallite = 0;
for (const p of PREFISSI) {
  for (const l of LETTERE) {
    const q = `${p} ${l}`.trim();
    const lista = suggerisci(q);
    if (!lista) { fallite++; continue; }
    ok++;
    lista.forEach((s, pos) => {
      if (!s.startsWith(p)) return;
      let t = s.slice(p.length).replace(/^\s*(film|serie tv|serie)\s+/, '').replace(/^(di|del|della|dei|degli|delle)\s+/, '').trim();
      if (!t || t.length < 3 || NON_TITOLI.test(t)) return;
      const v = punti.get(t) || { punti: 0, frasi: new Set() };
      v.punti += 10 - pos + (l === '' ? 10 : 0); // in cima alla frase senza lettera vale di più
      v.frasi.add(p);
      punti.set(t, v);
    });
    await attendi(500);
  }
}
if (!ok) { console.error('Suggerimenti di YouTube non raggiungibili (serve suggestqueries.google.com nella rete).'); process.exit(1); }
// unisce varianti (es. «lost» e «lost serie tv»): il titolo più corto contenuto all'inizio di un altro prende i punti
const titoli = [...punti.keys()].sort((a, b) => a.length - b.length);
for (const corto of titoli) {
  for (const lungo of titoli) {
    if (lungo !== corto && punti.has(lungo) && punti.has(corto) && lungo.startsWith(corto + ' ') && corto.length >= 4) {
      const a = punti.get(corto), b = punti.get(lungo);
      a.punti += b.punti; b.frasi.forEach((f) => a.frasi.add(f)); punti.delete(lungo);
    }
  }
}
const classifica = [...punti.entries()]
  .map(([t, v]) => ({ titolo: t, punti: v.punti, frasi: [...v.frasi] }))
  .sort((a, b) => b.punti - a.punti);
for (const t of titoliExtra) if (!classifica.some((c) => c.titolo === t)) classifica.push({ titolo: t, punti: 0, frasi: ['(aggiunto a mano)'] });

// ---------- 2. YouTube Data API ----------
const chiave = process.env.YOUTUBE_API_KEY;
const intest = chiave ? [`X-Goog-Api-Key: ${chiave}`] : ['X-Goog-Api-Key: proxy-injected'];
function api(percorso) {
  const r = curl('https://www.googleapis.com/youtube/v3/' + percorso, intest);
  if (r.codice !== 200) return { errore: `${r.codice} ${r.corpo.slice(0, 160).replace(/\s+/g, ' ')}` };
  return JSON.parse(r.corpo);
}
const unAnnoFa = new Date(Date.now() - 365 * 864e5).toISOString();
let apiAttiva = !soloSuggerimenti, avvisoApi = '';
const scelti = [...classifica.slice(0, N), ...classifica.slice(N).filter((c) => c.punti === 0)];
for (const c of scelti) {
  if (!apiAttiva) break;
  const q = encodeURIComponent(`${c.titolo} spiegazione`);
  const s = api(`search?part=snippet&type=video&maxResults=10&regionCode=IT&relevanceLanguage=it&q=${q}`);
  if (s.errore) { apiAttiva = false; avvisoApi = s.errore; break; }
  const ids = s.items.map((i) => i.id.videoId).filter(Boolean);
  if (!ids.length) continue;
  const v = api(`videos?part=statistics,snippet,contentDetails&id=${ids.join(',')}`);
  if (v.errore) { apiAttiva = false; avvisoApi = v.errore; break; }
  const viste = v.items.map((i) => Number(i.statistics.viewCount || 0)).sort((a, b) => b - a);
  const recenti = v.items.filter((i) => i.snippet.publishedAt > unAnnoFa);
  c.vistePrimo = viste[0] || 0;
  c.vistaMediana = viste[Math.floor(viste.length / 2)] || 0;
  c.recenti = recenti.length;
  c.vistaRecenti = Math.max(0, ...recenti.map((i) => Number(i.statistics.viewCount || 0)));
  c.esempio = v.items.sort((a, b) => Number(b.statistics.viewCount) - Number(a.statistics.viewCount))[0]?.snippet.title;
  await attendi(200);
}

// ---------- report ----------
const oggi = new Date().toISOString().slice(0, 10);
const fmt = (n) => (n == null ? '–' : n >= 1e6 ? (n / 1e6).toFixed(1) + ' M' : n >= 1e3 ? Math.round(n / 1e3) + ' k' : String(n));
let md = `# Ricerche su YouTube in Italia · ${oggi}\n\n`;
md += `Suggerimenti letti: ${ok} ricerche (${fallite} non riuscite). Punti = posizione nei suggerimenti di YouTube, sommata su tutte le frasi.\n`;
md += apiAttiva || soloSuggerimenti ? '' : `YouTube Data API non usata: ${avvisoApi || 'nessuna chiave'} (serve la chiave per www.googleapis.com).\n`;
md += '\n| # | Titolo | Punti | Frasi | Viste del 1° video «spiegazione» | Mediana dei primi 10 | Video dell\'ultimo anno (max viste) |\n|---|---|---|---|---|---|---|\n';
scelti.forEach((c, i) => {
  md += `| ${i + 1} | ${c.titolo} | ${c.punti} | ${c.frasi.join(', ')} | ${fmt(c.vistePrimo)} | ${fmt(c.vistaMediana)} | ${c.recenti == null ? '–' : `${c.recenti} (${fmt(c.vistaRecenti)})`} |\n`;
});
md += '\nLettura: tanti punti = tanta ricerca; mediana alta = la gente guarda questi video; pochi video recenti o piccoli = spazio libero per noi.\n';
md += 'Escludere a mano ciò che non si può disegnare (protagonisti umani o supereroi riconoscibili: regole di CLAUDE.md).\n';
const dir = path.join('out', 'ricerche');
mkdirSync(dir, { recursive: true });
const file = path.join(dir, `${oggi}.md`);
writeFileSync(file, md);
console.log(md);
console.log(`Report: ${file}`);
