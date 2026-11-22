// Video approvati nell'app «In 2 minuti» ma non ancora uniti su main (errore del 22 nov, Donnie Darko: la sessione di
// produzione aveva smesso di aspettare e l'approvazione arrivata dopo non l'ha vista nessuno).
// Uso: node scripts/strumenti/conferme-in-sospeso.mjs [--giorni 14]
// Legge GET /api/richieste (la chiave la mette il proxy), prende le richieste `video` approvate degli ultimi giorni e, dal
// testo, la riga «Ramo: <ramo>» (obbligatoria nelle richieste nuove, SOCIAL.md «Conferme nell'app»). Per ogni ramo
// controlla se è già contenuto in origin/main. Stampa una riga per ogni richiesta in sospeso ed esce con codice 1 se ce
// n'è almeno una (0 se è tutto unito). Le richieste senza ramo con l'uscita ancora da venire si segnalano «da verificare».
import { execFileSync } from 'node:child_process';

const args = process.argv.slice(2);
const giorni = Number(args[args.indexOf('--giorni') + 1]) || 14;
const BASE = 'https://in-2-minuti-gestione.pages.dev';

const git = (...a) => execFileSync('git', a, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const tenta = (...a) => { try { git(...a); return true; } catch { return false; } };

const res = await fetch(`${BASE}/api/richieste`);
if (!res.ok) { console.error(`App: ${res.status} ${await res.text()}`); process.exit(3); }
const dati = await res.json();
const richieste = (dati.richieste ?? dati).filter((r) => r.tipo === 'video' && r.stato === 'approvata'
  && Date.now() - Date.parse(r.creata) < giorni * 86400e3);

tenta('fetch', '-q', 'origin', 'main');
const ora = new Date().toLocaleString('sv-SE', { timeZone: 'Europe/Rome' }).replace(' ', 'T').slice(0, 16);
let sospese = 0;
for (const r of richieste) {
  const ramo = r.testo?.match(/Ramo:\s*([\w./-]+)/i)?.[1];
  if (!ramo) {
    if (r.uscita && r.uscita > ora) {
      console.log(`DA VERIFICARE ${r.id} «${r.titolo}» (uscita ${r.uscita}): approvata, ramo non indicato nella richiesta`);
      sospese++;
    }
    continue;
  }
  if (!tenta('fetch', '-q', 'origin', ramo)) {
    console.log(`DA VERIFICARE ${r.id} «${r.titolo}» (uscita ${r.uscita}): ramo ${ramo} non trovato su origin`);
    sospese++;
    continue;
  }
  if (tenta('merge-base', '--is-ancestor', 'FETCH_HEAD', 'origin/main')) continue;
  console.log(`DA UNIRE ${r.id} «${r.titolo}» (uscita ${r.uscita}): approvata il ${r.risposta?.quando ?? '?'}, ramo ${ramo} non è su main`);
  sospese++;
}
if (!sospese) console.log(`Nessun video approvato in sospeso (${richieste.length} approvati negli ultimi ${giorni} giorni).`);
process.exit(sospese ? 1 : 0);
