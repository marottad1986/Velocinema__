// node scripts/controlli.mjs [<film>...] → controlla le regole vincolanti di CLAUDE.md su JSON, scene e spartiti.
// Senza argomenti controlla tutti i film (films/) e i quadri (quadri/). Esce con errore se trova un ERRORE;
// gli AVVISI vanno letti ma non bloccano. Usato anche da .github/workflows/video-mega.yml prima del render.
import { existsSync, readdirSync, readFileSync } from 'node:fs';

// Ritmo della voce (CLAUDE.md, «Voce»): circa 2,8 parole/s per la voce ElevenLabs; avviso oltre circa 3,1 (3,12: 28 parole in 9 s passano); errore oltre 3,5
// (la clip andrebbe accelerata più del 25% e il montaggio voce si fermerebbe). Nel formato "spiegato" 3,4 è un massimo (errore).
const RIF_WPS = 2.8, AVVISO_WPS = 3.12, MAX_WPS = RIF_WPS * 1.25, MAX_SPIEGATO = 3.4;
const VIETATE = [
  [/due minuti/i, 'frase che parla del video stesso'],
  [/la prossima volta che lo vedi/i, 'frase vietata nel finale e altrove'],
  [/il prossimo .{0,20}arriva presto/i, 'invito vietato: usare «Commenta con…»'],
];

const tutti = ['films', 'quadri']
  .flatMap((d) => (existsSync(d) ? readdirSync(d).filter((f) => f.endsWith('.json')).map((f) => [f.slice(0, -5), `${d}/${f}`]) : []));
const scelti = process.argv.slice(2);
const lista = scelti.length ? tutti.filter(([s]) => scelti.includes(s)) : tutti;
for (const s of scelti) if (!tutti.some(([x]) => x === s)) { console.error(`Film sconosciuto: ${s}`); process.exit(1); }

/** Parole lette dalla voce; nel formato "spiegato" un anno a quattro cifre conta come 4 parole. */
const parole = (testo, spiegato) =>
  testo.split(/\s+/).filter(Boolean).reduce((n, w) => n + (spiegato && /^\d{4}\D*$/.test(w) ? 4 : 1), 0);

let errori = 0;
for (const [slug, path] of lista) {
  const E = [], A = [];
  const j = JSON.parse(readFileSync(path, 'utf8'));
  const spiegato = j.formato === 'spiegato';
  const canzone = j.tipo === 'canzone';

  // ---- formato: copertina 4 s + capitoli 112 s + finale 4 s = 2:00
  const somma = j.capitoli.reduce((a, c) => a + c.durata, 0);
  if (j.copertina.durata !== 4) E.push(`copertina di ${j.copertina.durata} s (deve essere 4)`);
  if (j.finale.durata !== 4) E.push(`finale di ${j.finale.durata} s (deve essere 4)`);
  if (somma !== 112) E.push(`capitoli per ${somma} s in tutto (devono essere 112)`);

  // ---- testo: ritmo della voce, righe vuote, frasi vietate, titoli
  for (const c of j.capitoli) {
    if (!c.titolo?.trim()) E.push(`capitolo ${c.id}: manca il titolo`);
    if (!c.sottotitoli?.length || c.sottotitoli.some((r) => !r.trim())) E.push(`capitolo ${c.id}: sottotitoli vuoti`);
    const w = c.sottotitoli.reduce((n, r) => n + parole(r, spiegato), 0);
    const wps = w / c.durata;
    const max = spiegato ? MAX_SPIEGATO : MAX_WPS;
    const msg = `capitolo ${c.id}: ${w} parole in ${c.durata} s = ${wps.toFixed(2)} parole/s: togliere ${Math.ceil(w - RIF_WPS * c.durata)} parole`;
    if (wps > max + 1e-9) E.push(msg);
    else if (wps > AVVISO_WPS + 1e-9) A.push(msg);
  }
  for (const [nome, v, dur] of [['copertina', j.copertina.voce, j.copertina.durata], ['finale', j.finale.voce, j.finale.durata]]) {
    if (v && parole(v, spiegato) / dur > AVVISO_WPS + 1e-9) A.push(`voce della ${nome}: ${parole(v, spiegato)} parole in ${dur} s (circa ${Math.floor(RIF_WPS * dur)} al massimo)`);
  }
  const testi = [j.copertina.voce, j.finale.voce, ...j.capitoli.flatMap((c) => [c.titolo, ...c.sottotitoli])].filter(Boolean);
  for (const [re, perche] of VIETATE) for (const t of testi) if (re.test(t)) E.push(`«${t}»: ${perche}`);

  // ---- fonti: ogni fatto citato confermato da un link («<fatti>: <url>»); obbligatorie per le canzoni, avviso per film e serie
  if (!path.startsWith('quadri/')) {
    const fonti = Array.isArray(j.fonti) ? j.fonti : [];
    if (!fonti.length) (canzone ? E : A).push('manca il campo «fonti» con i link che confermano i fatti citati');
    for (const f of fonti) if (!/https?:\/\/\S+/.test(f)) E.push(`fonte senza link: «${f.slice(0, 60)}…»`);
  }

  // ---- scene: una per capitolo (salvo gli schemi "spiegato", un unico diagramma) e invito a commentare nel finale
  const dirScene = existsSync(`src/scenes/${slug}`) ? `src/scenes/${slug}` : null;
  const reg = readFileSync('src/films.ts', 'utf8');
  if (!new RegExp(`slug: '${slug}'`).test(reg)) E.push('non registrato in src/films.ts');
  if (dirScene && existsSync(`${dirScene}/index.ts`) && !j.schema) {
    const idx = readFileSync(`${dirScene}/index.ts`, 'utf8');
    for (const c of j.capitoli) if (!new RegExp(`['"]?${c.id}['"]?\\s*:`).test(idx)) A.push(`capitolo ${c.id}: nessuna scena in ${dirScene}/index.ts (compare il segnaposto)`);
  }
  const locandine = [dirScene && `${dirScene}/Locandina.tsx`, dirScene && `${dirScene}/Finale.tsx`, path.startsWith('quadri/') && 'src/scenes/quadri/Locandina.tsx'].filter((p) => p && existsSync(p));
  if (!locandine.some((p) => /Commenta con (il film|la serie|la spiegazione|la canzone|il quadro) che vorresti\./.test(readFileSync(p, 'utf8')))) E.push('finale senza «Commenta con … che vorresti.»');
  // etichetta «… IN 2 MINUTI» sopra il titolo: ammessa solo nei riassunti di film (canzoni, quadri, Spiegato semplice usano il nome della serie)
  const soloFilm = !path.startsWith('quadri/') && !spiegato && !canzone;
  if (!soloFilm) for (const p of locandine) if (/IN 2 MINUTI/i.test(readFileSync(p, 'utf8'))) E.push(`${p}: «… IN 2 MINUTI» ammesso solo nelle copertine dei film (usare il nome della serie)`);

  // ---- musica: spartito con strumenti campionati, niente strumenti sintetici, risorse dichiarate, agganci validi
  const sp = `scripts/audio/${slug}.mjs`;
  if (!existsSync(sp)) E.push(`manca lo spartito ${sp} (video muto)`);
  else {
    const src = readFileSync(sp, 'utf8');
    const lista = (nome) => (src.match(new RegExp(`export const ${nome} = \\[([^\\]]*)\\]`)) ?? [, ''])[1].match(/'[^']+'/g)?.map((x) => x.slice(1, -1)) ?? [];
    const strumenti = lista('strumenti'), effetti = lista('effetti');
    if (!strumenti.length) E.push('lo spartito non usa strumenti campionati (export strumenti vuoto o assente)');
    // bpm nel JSON (griglia delle scene) = tempo dello spartito
    const bpmSp = Number((src.match(/^const BPM = ([\d.]+)/m) ?? [])[1]);
    if (j.bpm && bpmSp && Math.abs(j.bpm - bpmSp) > 1e-6) E.push(`bpm ${j.bpm} nel JSON ma ${bpmSp} nello spartito: scene e musica fuori griglia`);
    const daSynth = (src.match(/import \{([^}]*)\} from '\.\/synth\.mjs'/) ?? [, ''])[1];
    // import solo relativi: un percorso assoluto della macchina locale fa fallire musica e render in GitHub Actions
    for (const m of src.matchAll(/^import .* from '([^']+)'/gm)) if (!m[1].startsWith('./')) E.push(`import «${m[1]}»: negli spartiti solo percorsi relativi ('./…')`);
    if (/\bnote\b/.test(daSynth)) E.push('lo spartito importa note() da synth.mjs: strumenti sintetici vietati per la musica');
    for (const m of src.matchAll(/\b(?:suona|colpo)\(mix, '([a-z_]+)'/g)) if (!strumenti.includes(m[1])) E.push(`strumento «${m[1]}» usato ma non dichiarato in strumenti (in CI non verrebbe scaricato)`);
    for (const m of src.matchAll(/\bclip\(mix, '([a-z_]+)'/g)) if (!effetti.includes(m[1])) E.push(`effetto «${m[1]}» usato ma non dichiarato in effetti (in CI non verrebbe scaricato)`);
    const ids = new Set(['copertina', 'finale', 'END', ...j.capitoli.map((c) => c.id)]);
    const righe = Object.fromEntries(j.capitoli.map((c) => [c.id, c.sottotitoli.length]));
    for (const m of src.matchAll(/\bT\.([a-zA-Z_]\w*)/g)) if (!ids.has(m[1])) E.push(`T.${m[1]}: capitolo inesistente`);
    for (const m of src.matchAll(/\b(?:cue|C|at)\(\s*'([a-z0-9-]+)'\s*,\s*(\d+(?:\.\d+)?)\s*\)/g)) {
      if (!ids.has(m[1])) E.push(`${m[0]}: capitolo inesistente`);
      else if (!m[0].startsWith('at(') && righe[m[1]] !== undefined && +m[2] >= righe[m[1]]) E.push(`${m[0]}: il capitolo ha solo ${righe[m[1]]} frasi`);
    }
    const bpm = new Set([...src.matchAll(/\bbpm:\s*(\d+)/g)].map((m) => m[1]));
    if (bpm.size > 1) A.push(`tempi diversi nello spartito (${[...bpm].join(', ')} bpm): la regola è un solo tempo per film`);
    // figure ripetute (arpeggi, campanelli, sbuffi…) con un passo fisso in secondi formano un secondo tempo fuori griglia
    const passi = [...src.matchAll(/for \(let t = [^;]*;[^;]*; t \+= (\d+(?:\.\d+)?)[,)]/g)].map((m) => m[1]).filter((x) => +x >= 0.15); // sotto 0,15 s: rulli e tremoli
    if (/const (BPM|BEAT)\b/.test(src) && passi.length) A.push(`figure ripetute con passo fisso (${[...new Set(passi)].join(', ')} s): usare BEAT o sue frazioni`);
  }

  errori += E.length;
  const stato = E.length ? 'ERRORE' : A.length ? 'avvisi' : 'ok';
  console.log(`${slug.padEnd(32)} ${stato}`);
  E.forEach((x) => console.log(`   ✗ ${x}`));
  A.forEach((x) => console.log(`   ! ${x}`));
}
if (errori) {
  console.error(`\n${errori} errori: correggere prima di pubblicare.`);
  process.exit(1);
}
