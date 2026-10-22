# Riassunti animati di film in 2 minuti

Progetto per produrre video verticali (Reel, TikTok, Shorts) che raccontano un film intero in 2 minuti.
Ogni film è descritto da un file in `films/` (titolo, regista, palette, copertina, capitoli, sottotitoli, finale).
Il codice in `reference/` è la versione attuale delle scene, scritta per un altro player: va usato come
riferimento per i disegni e le animazioni, non eseguito così com'è.

## Formato (vincolante)
- 1080×1920, 30 o 60 fps, durata esatta 2:00 (120 s).
- Struttura: copertina 4 s + capitoli (112 s in tutto) + finale 4 s.
- Lingua: italiano.

## Stile grafico
- Illustrazioni piatte con contorni scuri, a tutto schermo, una sola immagine animata per capitolo
  (lento avvicinamento di camera + piccole animazioni: onde, pioggia, fiamme, luci, fumo, note).
- Palette per film nel suo JSON (chiaro, principale, scuro, accento).
- Font: Bricolage Grotesque (titoli), Figtree (interfaccia e sottotitoli); in copertina/finale si può usare
  un font titolo specifico per il film (es. Anton per Shutter Island).
- Qualità delle immagini: seguire OBBLIGATORIAMENTE `QUALITA.md` (parallasse, luce, texture, dettaglio,
  particelle, colore, prestazioni, criteri di accettazione e suggerimenti scena per scena).
  Riferimento visivo: `reference/prova-qualita-uragano/scene-dopo.js`.

## Regole sui contenuti (vincolanti)
- Nessun personaggio del film disegnato, nemmeno stilizzato o reinventato: solo luoghi e oggetti.
- Copertine e finali in stile locandina ma originali: mai riprodurre le locandine ufficiali.
- Musica solo originale e strumentale; mai brani o temi dei film.
- Nessuna clip, immagine o audio preso dai film.

## Testo per chi non ha visto il film (vincolante)
- Il racconto deve essere comprensibile a chi non conosce il film: ogni personaggio viene presentato con il suo ruolo
  la prima volta che compare (es. «Aigor, il servo»).
- Ogni capitolo spiega perché succede quello che succede, e il capitolo dopo deve seguire logicamente.
- Niente battute, citazioni o soprannomi che capisce solo chi ha visto il film; se si usa una gag famosa, va spiegata
  nella stessa frase.
- Il finale deve dire chiaramente come va a finire, compresi i colpi di scena.
- Titoli dei capitoli chiari anche fuori contesto.
- Testo discorsivo: si racconta come a voce a un amico; ogni frase si aggancia alla precedente con connettivi
  espliciti («perché», «infatti», «intanto», «così», «quindi», «ma», «alla fine») e un capitolo si aggancia al
  precedente. Niente elenchi secchi di fatti né frasi telegrafiche; mai frasi che parlano dello schema o del video
  stesso (es. «Tutto in due minuti»). Le righe dei sottotitoli sono pezzi dello stesso discorso.
  L'ultima frase chiude o lascia una domanda chiara.
- Spiegato facile: parole di tutti i giorni, nessun termine tecnico senza spiegarlo subito, una cosa alla volta.
- Queste regole sul testo valgono per tutti i progetti della serie (film, quadri, canzoni, serie TV spiegate…).
- Se si riscrive il testo di un film già disegnato, tenere lo stesso numero di righe per capitolo e lo stesso
  contenuto in ogni riga: scene e spartito agganciano gli eventi all'indice della riga (`cues`).

## Finale (vincolante)
- Nell'immagine finale, sotto «Metti like» / «Segui la pagina», l'invito a commentare (mai «Il prossimo … arriva presto»):
  «Commenta con il film / la spiegazione / la canzone / il quadro che vorresti.» (secondo il formato).
  Per questo progetto: «Commenta con il film che vorresti.»

## Elementi fissi sopra le immagini (capitoli)
- Barra a capitoli sottile (16 px) sul bordo superiore, un segmento per capitolo proporzionale alla durata,
  riempimento con il colore accento.
- Etichetta a y 262: "CAPITOLO N DI 11 · m:ss / 2:00".
- Titolo del capitolo sovrapposto, nel punto più leggibile dell'immagine (chiaro su scuro o viceversa).
- Sottotitoli in basso (tra y 1270 e 1490), una frase alla volta su fascia scura semitrasparente,
  tempi distribuiti in proporzione alla lunghezza delle frasi.
- Zone coperte dalle app: niente testo nei primi 250 px in alto e negli ultimi 420 px in basso.

## Voce
- I sottotitoli coincidono con il testo voce. Ritmo di riferimento: circa 3,4 parole al secondo.
- Clip registrate una per capitolo in `audio/<film>/`, nominate `00_copertina`, `01_<id>`, `02_<id>`…
- Montaggio: ogni clip parte all'inizio del suo capitolo; se sfora, accelerare al massimo del 15%
  mantenendo il tono, altrimenti segnalare la frase da accorciare. Musica abbassata sotto la voce.
- Voce registrata da un attore (niente voce sintetica).
- `npm run voce -- <film>` → `out/<film>-voce.mp4` (richiede `out/<film>.mp4` già renderizzato con la musica).
  Gli inizi dei capitoli vengono dal JSON (copertina + durate); clip in wav/mp3/m4a/flac/ogg, facoltativa `NN_finale`.
  Lascia 0,1 s prima del capitolo successivo; oltre il +15% (atempo) non monta nulla, esce con errore e indica
  quante parole togliere e la frase più lunga del capitolo. Ducking: `sidechaincompress` della voce sulla musica.
  Opzioni per le prove: `--cartella <dir>` (clip), `--video <file>`, `--uscita <file>`.

## Musica
- Colonna sonora originale generata in modo deterministico da un piccolo sintetizzatore in Node
  (`scripts/audio/synth.mjs`: strumenti, effetti sonori, riverbero, WAV 16 bit 44,1 kHz stereo, nessun campione esterno).
- Spartito per film in `scripts/audio/<film>.mjs` (accordi, livelli per sezione, effetti agganciati ai secondi
  delle scene in `src/scenes/<film>/`). Se si cambiano i tempi di un evento in una scena, aggiornare anche lo spartito.
- `npm run musica -- <film>` → `out/<film>-musica.wav`. `npm run render` la rigenera e la unisce al video con ffmpeg
  (anche per un solo capitolo, col tratto di musica corrispondente). Film senza spartito: video muto, con avviso.

## Comandi
- Generare il video di un film (con musica): es. `npm run render -- shutter-island` → `out/shutter-island.mp4`.
- Solo la musica: es. `npm run musica -- shutter-island` → `out/shutter-island-musica.wav`.
- Montare la voce: es. `npm run voce -- shutter-island` → `out/shutter-island-voce.mp4`.
- Node e ffmpeg/ffprobe devono essere nel PATH (in PowerShell, se mancano:
  `$env:Path = [Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [Environment]::GetEnvironmentVariable("Path","User")`).
- Creare un nuovo film: scrivere `films/<nome>.json` seguendo lo schema dei due esistenti.

## Struttura del codice (Remotion, 30 fps)
- **Per disegnare scene (anche di un film nuovo) seguire `BRIEF-SCENA.md`**: metodo, scheletro, errori da evitare, verifica.
- `src/lib/elements.tsx`: libreria di elementi animati riutilizzabili (pioggia, nebbia, fumo, fuoco, aloni, fasci, mare, stelle, note, neon…); catalogo visivo nelle composizioni `libreria--esterni` e `libreria--interni` (`src/lib/Catalogo.tsx`).
- Le scene ricevono `cues` (secondo d'inizio di ogni frase dei sottotitoli) per sincronizzare gli eventi con la voce.
- `src/films.ts`: registro dei film (JSON + scene disegnate). Le scene mancanti compaiono come segnaposto.
- `src/scenes/<film>/<Scena>.tsx`: una scena per capitolo; `index.ts` mappa id capitolo → componente + posizione titolo.
- `src/components/ChapterOverlay.tsx`: barra, etichetta, titolo, sottotitoli. `src/lib/anim.ts`: camera/parallasse e utilità del tempo. `src/lib/fx.tsx`: grana, vignettatura, velatura, gradienti.
- Le props delle composizioni devono essere JSON (si passa lo slug del film, non l'oggetto).
- Comandi: `npm run studio` (anteprima, senza musica), `npm run render -- <film> [capitolo]`, `npm run prova -- <film> <capitolo> [secondi...]` (PNG in `out/prova/`), `npm run musica -- <film>`, `npm run voce -- <film>`.
- Audio: `scripts/musica.mjs`, `scripts/voce.mjs`, `scripts/audio/` (sintetizzatore, spartiti, tempi dal JSON e helper ffmpeg in `film.mjs`).

## Tecnologia suggerita
Remotion (React) per comporre e renderizzare i video, ffmpeg per audio e montaggio voce.
Se si sceglie un'altra soluzione, mantenere il principio: ogni fotogramma è funzione del tempo
(rendering deterministico).
