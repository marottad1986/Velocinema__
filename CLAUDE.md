# Riassunti animati di film in 2 minuti (+ "Spiegato semplice")

Progetto per produrre video verticali (Reel, TikTok, Shorts) che raccontano un film intero in 2 minuti.
Ogni film è descritto da un file in `films/` (titolo, regista, palette, copertina, capitoli, sottotitoli, finale).
Il codice in `reference/` è la versione attuale delle scene, scritta per un altro player: va usato come
riferimento per i disegni e le animazioni, non eseguito così com'è.

Serie parallela con la stessa grafica: **quadri famosi** spiegati in 2 minuti, JSON in `quadri/`.
Regole proprie (solo opere di pubblico dominio, immagine originale animata): vedi `QUADRI.md`.

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
- Nessun personaggio umano del film disegnato, nemmeno stilizzato o reinventato (niente sagome o mani): luoghi e oggetti.
- Animali e dinosauri si possono disegnare, in modo generico e nel nostro stile, senza copiare il loro aspetto nel film.
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
- Testo discorsivo (tutti i formati): si racconta come a voce a un amico. Ogni frase si aggancia alla precedente con
  connettivi espliciti («perché», «infatti», «intanto», «così», «quindi», «ma», «alla fine»), così i collegamenti li fa
  la voce e chi guarda non deve ricostruirli; anche un capitolo si aggancia al precedente. Niente elenchi secchi di fatti
  né frasi telegrafiche; mai frasi che parlano dello schema o del video stesso (es. «Tutto in due minuti», «Ecco lo schema
  completo»). Le righe dei sottotitoli sono pezzi dello stesso discorso. L'ultima frase della storia chiude o lascia una
  domanda chiara (per le serie: da dove riparte la stagione dopo).
- Spiegato facile: parole di tutti i giorni, nessun termine tecnico senza spiegarlo subito, una cosa alla volta.
- Queste regole sul testo valgono per tutti i progetti della serie (film, quadri, canzoni, serie TV spiegate…).
- Se si riscrive il testo di un film già disegnato, tenere lo stesso numero di righe per capitolo e lo stesso
  contenuto in ogni riga: scene e spartito agganciano gli eventi all'indice della riga (`cues`).

## Finale (vincolante, tutti i formati)
- Nell'immagine finale, sotto «Metti like» / «Segui la pagina», l'invito a commentare (mai «Il prossimo … arriva presto»):
  riassunti di film → «Commenta con il film che vorresti.»; Spiegato semplice → «Commenta con la spiegazione che vorresti.»;
  canzoni → «Commenta con la canzone che vorresti.»; quadri → «Commenta con il quadro che vorresti.»
- Mai frasi come «La prossima volta che lo vedi…» (né nel finale né altrove).

## Canzoni spiegate (stesso schema dei film)
- Un JSON in `films/` come per i film (es. `films/bohemian-rhapsody.json`): `regista` = artista, numero di capitoli libero
  (l'etichetta diventa "CAPITOLO N DI M"), campo `fonti` obbligatorio con i link che confermano ogni fatto citato.
- Testi: mai riportare il testo della canzone, nemmeno a pezzi; si racconta con parole proprie. Ammesse solo parole
  singole o nomi (es. «Scaramouche») per spiegarli nella stessa frase.
- Significato: distinguere sempre ciò che l'autore ha detto da ciò che ipotizzano critici e biografi («per molti…»,
  «restano ipotesi»). Se le fonti non concordano su un fatto, non darlo per certo.
- Persone reali: nessun ritratto, sagoma o caricatura dell'artista; niente copertine di dischi, foto o loghi del gruppo.
- Musica: solo originale, senza imitare melodia, accordi o ritmo della canzone (meglio anche in un'altra tonalità).
  Si può richiamare lo stile e la forma: strumenti, sezioni nello stesso ordine, cambi di tempo e di carattere.
  La canzone vera, se si vuole, si aggiunge al momento della pubblicazione dalla libreria musicale con licenza della piattaforma.

## Elementi fissi sopra le immagini (capitoli)
- Barra a capitoli sottile (16 px) sul bordo superiore, un segmento per capitolo proporzionale alla durata,
  riempimento con il colore accento.
- Etichetta a y 262: "CAPITOLO N DI 11 · m:ss / 2:00".
- Titolo del capitolo sovrapposto, nel punto più leggibile dell'immagine (chiaro su scuro o viceversa).
- Sottotitoli in basso (tra y 1270 e 1490), una frase alla volta su fascia scura semitrasparente,
  tempi distribuiti in proporzione alla lunghezza delle frasi.
- Zone coperte dalle app: niente testo nei primi 250 px in alto e negli ultimi 420 px in basso.

## Secondo formato: "Spiegato semplice" (film e serie TV)
Trame complesse spiegate nel modo più semplice possibile, «come a un bambino di 5 anni». Valgono tutte le regole
sopra (formato 2:00, stile, contenuti, voce, musica), con queste aggiunte.
- JSON: `"formato": "spiegato"`, `"tipo": "film"` o `"serie"`; per le serie `"stagione": N` e file
  `films/<serie>-stagione-<N>.json` (serie brevi/concluse: un solo file per tutta la serie, senza `stagione`).
  Il campo `regista` resta (per le serie: ideatori o regista principale).
- Struttura: sigla 1,5 s dentro la copertina da 4 s (nome "Spiegato semplice" + badge FILM o SERIE, uguale per tutti
  gli episodi) + capitoli (112 s) + finale 4 s. Capitoli più lunghi e meno numerosi (8–10, 11–14 s ciascuno).
- Capitoli per concetti, non per scene: ognuno spiega una sola idea (una regola, un luogo, un colpo di scena) e
  il titolo la dice (es. «La regola dei 33 anni»), in ordine di comprensione.
- Scrittura: frasi brevi (max ~12 parole), parole comuni; ogni idea difficile ha un paragone quotidiano
  (es. «come un ascensore con tre piani»). Ritmo un po' più lento: al massimo 3,4 parole/s contando ogni anno
  a quattro cifre come 4 parole, meglio intorno a 3,1.
- Personaggi come oggetti: ogni personaggio ha un oggetto simbolo fisso (`personaggi`: nome, ruolo, oggetto), che
  compare con un cartellino col nome nel capitolo in cui viene presentato (`personaggi` del capitolo) e poi lo
  rappresenta sempre. Mai figure, sagome o volti.
- **Uno schema, non scene**: tutto il video è un unico diagramma che si costruisce frase dopo frase (la camera si sposta
  sulla parte di cui parla la voce e alla fine si allarga sullo schema completo). Lo stile dello schema segue il contenuto
  spiegato (Dark: albero di famiglia che si annoda, con il passaggio della grotta e un quadrante d'orologio sullo sfondo).
  Vocabolario fisso: cerchio con oggetto = personaggio, linea = legame (con scritta a mano), tratteggio giallo = viaggio
  nel tempo, cartellino pieno = colpo di scena, anello rosso = il nodo da capire. Pochi elementi: le scritte che servono
  a un solo capitolo si spengono alla fine del capitolo; titolo piccolo in alto (64 px) perché lo schema intero stia
  tra titolo e sottotitoli. JSON: `"schema": true` (niente linea del tempo né cartellini sopra lo schema).
  Valgono luce, texture, particelle e colore di QUALITA.md; la parallasse a piani è sostituita dai movimenti di camera.
- Capitoli come domande («Come funziona il passaggio?»): ogni capitolo risponde e aggiunge un pezzo allo schema.
- Elemento fisso che si costruisce capitolo dopo capitolo (es. `linea_tempo` con gli anni, l'`anno` del capitolo
  evidenziato), sotto l'etichetta del capitolo e fuori dalle zone coperte dalle app.
- Finale: la voce dice il riassunto «in una frase» (`finale.voce`); per le serie si annuncia la stagione successiva.
- Codice: sigla in `src/components/Sigla.tsx` (la copertina del film riceve `t` già spostato di 1,5 s); linea del tempo
  e cartellini dei personaggi in `src/components/ChapterOverlay.tsx`, attivi quando il JSON ha `linea_tempo` e `personaggi`.
  Episodi: Dark (`films/dark-stagione-1.json`, schema `src/scenes/dark-stagione-1/Albero.tsx`), Inception
  (`films/inception.json`, schema `src/scenes/inception/Piani.tsx`); musica in `scripts/audio/<slug>.mjs`.
- Priorità: serie intricate (Dark, Lost, Westworld, Severance, Twin Peaks, 1899; una stagione per video se lunghe),
  film (Inception, Tenet, Mulholland Drive, Donnie Darko, Primer). Libri solo dopo ~10 episodi.

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
- Colonna sonora originale generata in modo deterministico in Node, suonata con strumenti veri campionati:
  VSCO-2 Community Edition (CC0, Versilian Studios / Ivy Audio; citarli nei crediti), scaricati alla prima esecuzione
  in `campioni/vsco/` (ignorata da git) dal commit fissato in `scripts/audio/vsco.json`; dalla stessa casa e con la stessa
  licenza anche VCSL (`campioni/vcsl/`: pianoforte a coda, timpani, rullante, cassa, charleston, tom, piatti).
  `scripts/audio/campioni.mjs`: `suona(mix, strumento, nota, {...})` e `colpo(...)` per le percussioni;
  `scripts/audio/sala.mjs`: riverbero a convoluzione; `scripts/audio/synth.mjs`: mix, WAV 16 bit 44,1 kHz stereo,
  vecchi strumenti sintetici (da non usare per la musica nuova) ed effetti sonori sintetici.
  Per aggiungere strumenti al catalogo: `scripts/audio/vsco-indice.mjs` (misura l'intonazione reale di ogni campione).
- Spartito per film in `scripts/audio/<film>.mjs` (accordi, livelli per sezione, effetti agganciati ai secondi
  delle scene in `src/scenes/<film>/`); esporta `strumenti` (campioni da scaricare) e `sala` (riverbero).
  Se si cambiano i tempi di un evento in una scena, aggiornare anche lo spartito.
- Un solo tempo (bpm) per film, su una griglia continua: le scene lente vanno a metà passo, quelle concitate a passo
  doppio, e i cambi di sezione cadono sulla battuta più vicina all'inizio del capitolo (mai tempi diversi per capitolo:
  si sente la musica accelerare e rallentare). Shutter Island 90, Interstellar 72, Truman 78, La La Land 120,
  Frankenstein Junior 104; Spiegato semplice: Inception 68 (sogni profondi a metà passo), Dark 66 (2052 a metà passo);
  quadri: Grande onda 88, Notte stellata 92;
  Bohemian Rhapsody 70 (opera e rock a passo doppio, 140).
- Effetti sonori registrati: `scripts/audio/effetti.mjs` (archivio CC0 di Craig Smith, USC / Sunset Editorial, "SSE Library"
  e "Red Library" su archive.org), scaricati in `campioni/effetti/`; `clip(mix, id, { t, da, durata, gain, lp, largo… })`
  suona un tratto del file (da/durata = presa scelta). Per aggiungere un effetto: voce nel `CATALOGO` con il picco del file.
  Lo spartito esporta `effetti` (id da scaricare). I tappeti (pioggia, vento, fuoco) restano sotto la musica, i colpi sopra.
- Tutti i film usano orchestra campionata ed effetti registrati (timpani veri da VCSL in Frankenstein Junior). Restano sintetici solo pochi suoni senza un buon
  equivalente registrato (gesso, spazzole jazz, bip Morse, neon, cambio canale, risucchio). Per tarare i volumi
  confrontare musica ed effetti misurati separatamente; i vecchi strumenti sintetici di synth.mjs non vanno più usati
  per la musica.
- `npm run musica -- <film>` → `out/<film>-musica.wav`. `npm run render` la rigenera e la unisce al video con ffmpeg
  (anche per un solo capitolo, col tratto di musica corrispondente). Film senza spartito: video muto, con avviso.

## Comandi
- Generare il video di un film (con musica): es. `npm run render -- shutter-island` → `out/shutter-island.mp4`.
- Solo la musica: es. `npm run musica -- shutter-island` → `out/shutter-island-musica.wav`.
- Montare la voce: es. `npm run voce -- shutter-island` → `out/shutter-island-voce.mp4`.
- Node e ffmpeg/ffprobe devono essere nel PATH (in PowerShell, se mancano:
  `$env:Path = [Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [Environment]::GetEnvironmentVariable("Path","User")`).
- Creare un nuovo film: scrivere `films/<nome>.json` seguendo lo schema dei due esistenti.
- Archivio su MEGA (`.github/workflows/video-mega.yml`): a ogni push su main GitHub Actions rigenera i film toccati
  (`scripts/cambiati.mjs`; codice comune = tutti) e carica `<film>.mp4` e `<film>-voce.mp4` in `/Velocinema/<film>/`.
  Clip voce lette da `/Velocinema/<film>/voce/` su MEGA (o da `audio/<film>/`). Segreti `MEGA_EMAIL`, `MEGA_PASSWORD`.
  A mano: Actions → "Video su MEGA" → Run workflow.

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
