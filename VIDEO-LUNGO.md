# Video lunghi orizzontali (YouTube)

> **Dal 19 novembre 2026 vale prima `YOUTUBE.md`** (decisione dell'editore: si punta tutto su YouTube). I lunghi nuovi
> sono racconti continui disegnati per il 16:9, non episodi incollati: niente etichetta «m:ss / 2:00», niente cartelli
> e riassunti tra un episodio e l'altro, titolo costruito sulle ricerche. Le regole qui sotto restano per le parti tecniche
> (formato, zone sicure, audio, capitoli, comandi) e per i due lunghi già usciti.

Formato per i video lunghi del canale YouTube: più episodi già fatti (di solito le stagioni di uno Spiegato semplice)
montati in un solo racconto orizzontale, con un aggancio, i raccordi e un capitolo nuovo. Valgono tutte le regole di
`CLAUDE.md` (contenuti, testo per chi non conosce l'opera, fatti verificati, stile, musica originale campionata, voce,
revisori prima della pull request: per i lunghi e i loro trailer sempre tutti e quattro, immagini compresi, decisione
dell'editore del 22 nov 2026; regola «ogni video più bello del precedente» di `ASTICELLA.md`, punto 7: ogni lungo supera il
lungo precedente); qui solo ciò che cambia. Primo video: `lunghi/dark-tutta-la-serie.json`.

## Formato (vincolante)
- **1920×1080, 30 fps**, **durata di almeno 8 minuti** (480 s; di solito 8–10 minuti): se le parti riusate non bastano, si allungano le parti nuove (il capitolo nuovo, mai riempitivi). `controlli.mjs` dà errore sotto gli 8:00. Lingua: italiano.
- I video verticali restano come sono: il lungo è una composizione separata (`src/lunghi/`, entry `src/lunghi/index.ts`),
  con un suo JSON in `lunghi/<slug>.json`. Le scene degli episodi si riusano importandole, mai copiandole; se serve
  modificarle per il 16:9, il video verticale deve restare identico fotogramma per fotogramma.
- **Struttura** (parti in ordine nel JSON, `parti`):
  1. `aggancio` (15–25 s): copertina 16:9 al fotogramma 0 e una domanda forte nella voce;
  2. per ogni episodio riusato, `episodio`: cartello del titolo (4 s, con la voce e la musica della copertina dell'episodio),
     i capitoli dell'episodio (112 s) e il riassunto finale (4 s, voce e musica del finale dell'episodio; dal 17 nov 2026 senza «In una frase:» davanti);
  3. `capitoli`: le parti nuove (es. «Il finale spiegato»), stesse regole di scrittura del formato dell'episodio;
  4. `chiusura` (15–20 s): riassunto in una frase, «Iscriviti al canale», invito a commentare.
- **Copertina = miniatura YouTube** (regola della copertina di `CLAUDE.md`, vincolante): il fotogramma 0 è già una
  miniatura completa (la prima delle tre di «Testa e confronta»; le altre due si disegnano apposta, `YOUTUBE.md` §1), senza sottotitoli; soggetto e titolo leggibili anche a 320×180 (la miniatura nei risultati di ricerca
  e sul telefono): titolo enorme (almeno 200 px di altezza delle lettere), al massimo 6–7 parole in tutto, contrasto forte,
  un solo soggetto. La frase della voce entra da ~0,4 s. Niente logo, locandine ufficiali, volti.
  Il fotogramma 0 si esporta anche come PNG 1280×720 da caricare come miniatura (`node scripts/lunghi/render.mjs <slug> --miniatura`).
- **Mai la durata totale** (né nel titolo YouTube, né in copertina, né nel video): il marchio è «In 2 minuti», quindi il
  lungo si presenta come «tutta la serie, 2 minuti a stagione, più il finale spiegato» (es. titolo «DARK spiegato facile:
  tutta la serie, 2 minuti a stagione 🌀 Più il finale spiegato»). Ogni episodio resta riconoscibile: il suo cartello dice
  «STAGIONE N · IN 2 MINUTI»; aggancio, raccordi e parti nuove restano brevi, così il racconto mantiene la promessa.
- Etichetta della copertina: il nome del formato (es. «SPIEGATO SEMPLICE»), senza durate.

## Elementi fissi (16:9)
- Qualità delle immagini: `QUALITA.md` §10 (camera, piani, zone, criteri di accettazione del 16:9).
- Zona sicura: testi tra x 96 e 1824 e tra y 54 e 1026 (5% per lato, televisori e anteprime). YouTube copre il fondo
  con la barra del lettore quando si mette in pausa: sottotitoli con la base a y ≤ 1000.
- Etichetta in alto a sinistra (x 96, y 56): nei lunghi nativi (da Donnie Darko) il nome dell'atto, senza numeri di
  capitolo né tempi (`YOUTUBE.md` §3); solo nei due lunghi a episodi già usciti (Dark, Ritorno al futuro)
  «STAGIONE N · CAPITOLO M DI K · m:ss / 2:00». Mai il tempo o la durata del video lungo.
  Niente barra a capitoli (YouTube mostra i capitoli nella sua barra).
- Titolo del capitolo sotto l'etichetta (y 112, 60 px), a sinistra; sfondo calmo dietro.
- Sottotitoli in basso al centro, una frase alla volta, larghezza massima 1400 px, 46 px, base a y 1000.
- Schema dei capitoli tra y 190 e 880: gli schemi verticali si riadattano con una **camera propria per il 16:9** (più
  vicina sulla parte di cui parla la voce, perché l'orizzontale mostra già tutta l'altezza dello schema) e lo sfondo
  ridisegnato a tutto 16:9 (niente bande, niente sfondo verticale tagliato).
- Chiusura: gli ultimi 20 s lasciano libera la metà destra (x 1000–1824, y 180–880) per la schermata finale di YouTube
  (pulsante Iscriviti e video consigliato), che si aggiunge in YouTube Studio.

## Capitoli YouTube
- Il JSON dà i nomi; i tempi li calcola `node scripts/lunghi/render.mjs <slug> --capitoli` e li scrive in
  `out/<slug>-capitoli.txt` (primo a 0:00, almeno 3 capitoli, ognuno di almeno 10 s: regole di YouTube), da incollare nella descrizione.

## Audio
- **Un solo bpm su una griglia continua** anche tra un episodio e l'altro: ogni episodio entra a un istante che cade sul
  battito (a 66 bpm 11 battiti = 10 s, quindi a multipli di 10 s), e la sua musica si riusa così com'è (il WAV
  dell'episodio, copertina e finale compresi, posato all'istante giusto). Le parti nuove hanno uno spartito proprio
  (`scripts/audio/<slug>.mjs`, stessi strumenti campionati) che suona solo nei loro tratti.
- Voce: le clip approvate degli episodi (`audio/<episodio>/`) si riusano; quelle nuove (aggancio, capitoli nuovi,
  chiusura) in `audio/<slug>/` con lo stesso modello e la stessa voce (`node scripts/genera-voce.mjs <slug>` riconosce
  i lunghi). Montaggio, pause e accelerazione come in `npm run voce` (massimo +25%), ducking della musica sotto la voce.

## Comandi
- `node scripts/lunghi/render.mjs <slug>` → `out/<slug>.mp4` (con musica) e, se ci sono tutte le clip, `out/<slug>-voce.mp4`;
  opzioni `--parte <id>` (una parte sola, per le prove), `--miniatura`, `--capitoli`, `--solo-audio`.
- `node scripts/lunghi/prova.mjs <slug> <secondi...>` → PNG in `out/prova/` (secondi del video lungo).
- `node scripts/lunghi/pacchetto.mjs <slug> [--parti a,b]` → fotogrammi per il revisore delle immagini in `out/revisione/<slug>/`,
  più `testi.md` (scritte e cartelli sovrapposti, misurati nel browser a ogni frase; da vuotare prima del revisore) e, con
  `--musica`, `livelli.txt` (colpi coperti e «niente vuoto prima» dei colpi forti).
- Anteprima: `npx remotion studio src/lunghi/index.ts`.
- `node scripts/controlli.mjs <slug>` controlla anche i lunghi (griglia degli episodi, ritmo della voce, fonti, chiusura).
- Archivio su MEGA: il workflow rigenera il lungo quando cambia il suo JSON, `src/lunghi/`, il suo spartito o le sue clip,
  o un episodio che contiene; carica `<slug>.mp4` e `<slug>-voce.mp4` in `/Velocinema/<slug>/`.

## Pubblicazione
- **Due video lunghi a settimana, mercoledì e sabato alle 17:30** (decisione dell'editore del 18 nov 2026, obiettivo YouTube al 31 dicembre: `SOCIAL.md`,
  «Obiettivo YouTube»), con titolo e descrizione scritti per la ricerca su YouTube.
- Regola dell'editore (16 novembre 2026): il trailer verticale del video lungo esce **in contemporanea**
  alla pubblicazione del lungo su YouTube, alla stessa ora, su tutti i social (TikTok, Instagram Reel, Facebook Reel, YouTube
  Shorts); la storia esce 24 ore prima, come per ogni altro video. Si programmano insieme con PostFast (il lungo con
  `youtubeIsShort: false`, `youtubeContainsSyntheticMedia: true`, titolo, descrizione e capitoli da `out/<film>-capitoli.txt`;
  il trailer con i controlli dei video verticali e il link al lungo nella didascalia o nel primo commento).
  Procedura completa in `SOCIAL.md`, «Pubblicazione automatica».
- Come si fa il trailer (struttura, ritmo, immagini disegnate apposta): `TRAILER.md`.
