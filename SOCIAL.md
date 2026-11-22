# Programmazione delle uscite (team social)

Come si sceglie e si programma cosa pubblicare sulla pagina «In 2 Minuti». Si rilegge ogni domenica, prima di
proporre la settimana.

## Ritmo e orari (vincolante)
- Settimana tipo (decisione dell'editore del 18 nov 2026, dalla settimana del 23 novembre; obiettivo YouTube sotto):
  **ogni giorno alle 17:30** un'uscita; **mercoledì e sabato** l'uscita delle 17:30 è un **video lungo YouTube** (16:9,
  `VIDEO-LUNGO.md`) con il suo **trailer verticale** alla stessa ora su tutti i social; gli altri cinque giorni un video da
  2 minuti dei formati che rendono: **Spiegato semplice**, **serie a puntate**, **film con mistero o colpo di scena**.
  Gli episodi verticali di un lungo escono come Short nei giorni dopo il lungo (mai prima): così due lunghi alimentano
  gran parte della settimana senza produzioni in più.
- **Tolti**: X Factor (talent spiegati, dati deboli; l'ultimo è il Live 4 del 18 nov) e le uscite doppie delle **10:00 di
  sabato e domenica** (quadri, canzoni, storie vere). Le uscite già prodotte e programmate fino a domenica 22 restano.
- **Sabato alle 12:30** l'uscita in più dei **videogiochi spiegati** (`GIOCHI.md`; spostata dal martedì il 18 nov, dalla
  settimana del 23 novembre), o del formato che la sostituirà; il sabato alle 17:30 resta il video lungo. Il videogioco è
  sotto esame: domenica 29 novembre il manager confronta i numeri di GTA VI con le uscite delle 17:30 e, se è sotto la media,
  propone all'editore un formato sostitutivo per lo stesso posto (sabato 12:30).
- Totale: 7 uscite a settimana (2 lunghi con trailer + 5 video da 2 minuti) più il videogioco del sabato alle 12:30. Nessun giorno
  di pausa per ora: la regolarità quotidiana delle 17:30 è ciò che fa crescere TikTok e Instagram. Se la produzione non
  regge, il primo giorno da togliere è quello con la media più bassa nelle ultime due settimane (lo indica il manager
  con i dati della domenica), mai il mercoledì o il sabato.
  Due titoli dello stesso genere (es. due horror) non stanno in giorni vicini.
- Mai ripubblicare un video già uscito sullo stesso canale (elenco in `calendario/pubblicati.md`).

## Obiettivo YouTube fino al 31 dicembre 2026 (vincolante, decisione dell'editore del 18 nov)
Se il canale YouTube non cresce sul serio entro fine anno l'editore chiude il progetto. Traguardo: al 31 dicembre
**almeno 1.000 iscritti** (118 il 18 nov) **oppure un video lungo oltre le 10.000 visualizzazioni**.
- **Due video lunghi a settimana, mercoledì e sabato alle 17:30** (16:9, `VIDEO-LUNGO.md`; il secondo deciso dall'editore il
  18 nov sera), ognuno con il suo trailer verticale alla stessa ora: ogni domenica il calendario li mette per primi e avvia
  le loro produzioni (produzioni intere, contano nel limite di due al giorno). Per reggere il ritmo si alterna un lungo
  tutto nuovo con uno montato da episodi già fatti (es. Inception + Tenet).
  Scelta del titolo: Spiegato semplice o trame da capire (viaggio nel tempo, mistero, serie a puntate), che sono quelle che
  rendono; meglio contenuti non ancora usciti come Short.
- Titolo, descrizione e capitoli dei lunghi pensati per la ricerca su YouTube («… spiegazione», «finale spiegato»,
  «paradossi spiegati»), con la miniatura curata come una copertina.
- A ogni uscita il manager manda all'editore (avviso nell'app) l'elenco degli Short da collegare al lungo con il «video
  correlato» in YouTube Studio (PostFast non lo fa).
- Instagram spinge YouTube: storia con il link al lungo il giorno dell'uscita.
- Ogni domenica: iscritti YouTube (`get_follower_history`) e visualizzazioni dei lunghi nell'avviso della settimana, con la
  distanza dal traguardo; domenica 13 dicembre, se gli iscritti sono sotto 400, avviso di tipo «problema» anche alla direzione.

## La domenica alle 15:00
Ogni domenica alle 15:00 (attività programmata che apre da sola una sessione `/manager`) si studia l'andamento, si
programma la settimana che inizia il giorno dopo e si avvia subito la produzione: così i dati sono i più freschi
possibili (fino al sabato; con PostFast anche TikTok arriva senza ritardo) e la produzione lavora la domenica
per la settimana che viene.
Attività programmata: «In 2 minuti – programmazione della settimana» (`trig_01ErsayWy5XJvQ6RMrpNndyF`), ogni domenica alle
15:05 ora italiana (dopo le 15:00, quando riparte la settimana dei token), apre una sessione nuova con il repository allegato
(configurato nell'attività stessa) e con i connettori Metricool e IFTTT, con notifica sul telefono. Non va ricreata con
`create_trigger`: le attività create così aprono sessioni senza repository (`ERRORI.md`, Conjuring 17 nov).
Le produzioni avviate dal manager seguono la stessa regola: prima `create_session` con il repository, poi l'attività
`create_trigger` con `persistent_session_id` all'ora di avvio.
1. Dati del profilo dal connettore **Metricool** (piano gratuito, brand «In 2 minuti», id `7728942`, fuso Europe/Rome),
   strumento `getAnalyticsDataByMetrics`. Metriche usate:
   - TikTok, per video (`TKPO`): 02 data e ora, 05 descrizione, 07 visualizzazioni, 08 like, 09 commenti, 10 condivisioni;
     andamento (`TKEV`): 07 follower, 08 nuovi follower al giorno.
   - Instagram Reels (`IGRE`): 02 data e ora, 03 testo, 23 visualizzazioni, 10 like, 07 commenti, 21 condivisioni,
     12 salvataggi, 11 copertura, 24 tempo medio di visione (s).
   - YouTube (`YTVP`): con il piano gratuito arrivano solo titoli e date, non i numeri (8 novembre 2026): per YouTube
     l'utente manda i dati di YouTube Studio quando servono.
   - I dati di TikTok arrivano con circa un giorno di ritardo. Se il connettore non risponde, l'utente manda gli screenshot.
   - **Anche PostFast** (dal 16 novembre 2026, sezione «Pubblicazione automatica»): `get_post_analytics` per i post
     programmati con PostFast (TikTok senza il ritardo di Metricool, Facebook, YouTube, Instagram) e `get_follower_history`
     per i follower. Copre solo i post usciti da PostFast (dal 16–17 novembre in poi): per quelli precedenti e per le
     metriche che PostFast non dà resta Metricool. Se le due fonti danno numeri diversi per lo stesso post, vale il più
     recente e si scrive la fonte.
   - Controllo dei post falliti della settimana: `list_posts` con `statuses: FAILED`; quelli falliti vanno nell'avviso
     della domenica con il motivo (`lastError`).
2. Si aggiorna `calendario/pubblicati.md` e si legge cosa sta funzionando (generi, formati, giorni).
3. Si propone la **settimana che inizia il giorno dopo** (lunedì–domenica) in `calendario/<aaaa-mm-gg>.md`, con
   un'alternativa pronta per ogni contenuto da produrre e l'ordine in cui produrre. Lunedì e martedì sono i giorni più
   stretti: lì vanno i contenuti già pronti o quelli che la produzione può finire la domenica stessa; i contenuti nuovi
   più lunghi vanno da mercoledì in poi. Nella tabella c'è anche l'elenco «Produzioni da avviare» per la settimana
   dopo, così i titoli più impegnativi partono in anticipo.
4. Dopo l'approvazione si scrivono gli eventi nel **calendario principale** di Google Calendar (id `marottahs@gmail.com`, fuso Europe/Rome, via IFTTT con l'azione «Create a detailed event»; mai prima
   dell'approvazione):
   - uscita: «🎬 Film · Titolo», «📺 Serie · …», «💡 Spiegato · …», «🎨 Quadro · …», «🎵 Canzone · …», «📖 Storia · …»;
     descrizione con aggancio, stato (pronto / da produrre) e alternativa;
   - solo la lista delle uscite: niente eventi di scadenza della produzione («pronto entro oggi») né eventi
     promemoria, e nessun avviso aggiunto agli eventi (regola dell'utente, 16 novembre 2026: il calendario lo guarda
     l'editore quando gli serve). Le scadenze restano nel file del calendario e nelle sessioni `/produzione`.
5. **Sempre dopo l'approvazione**, si passa il lavoro alla produzione: una sessione `/produzione` per ogni contenuto
   da produrre o da verificare (strumento `create_session`, repository `marottad1986/Velocinema__`), con titolo, giorno
   e ora di uscita, scadenza (video su MEGA entro la sera prima) e l'ordine di avvisare subito l'utente se la data non è
   raggiungibile con la qualità richiesta. Prima si unisce su `main` il calendario, così le sessioni lo trovano.
   Produzioni distanziate (vincolante): al massimo due produzioni intere al giorno, a 5 ore l'una dall'altra (dall'avvio
   della precedente), per restare nei limiti di utilizzo; i lavori piccoli (solo voce, correzioni, finire una produzione
   del giorno prima) non contano e non spostano l'avvio di quella prevista (`CLAUDE.md`). Le scadenze e l'ordine di avvio si assegnano tenendone conto:
   le sessioni partono a scaglioni, ognuna con l'ora d'inizio prevista.
6. **Subito dopo l'approvazione** (sempre, senza aspettare che venga chiesto) si prepara il materiale social di ogni
   uscita della settimana in `calendario/<aaaa-mm-gg>-social.md`, così è pronto in anticipo:
   - **testi di pubblicazione** di ogni video (didascalia TikTok, titolo e descrizione YouTube), un blocco pronto per
     WhatsApp secondo il modello in `calendario/modelli-social.md`, con il prossimo video preso dal calendario;
   - **storia del giorno prima**: una locandina PNG per ogni uscita, secondo il modello in `calendario/modelli-social.md`
     (consegnata con titolo, format, data, orario e un suggerimento per la musica).
   Titoli, descrizioni e storie seguono i modelli di `calendario/modelli-social.md`.
   Valgono le regole sui testi di CLAUDE.md: fatti verificati, niente frasi come «La prossima volta che lo vedi…».
   Didascalia e titolo vanno anche nella descrizione dell'evento su Google Calendar, per averli sul telefono.
7. **Subito dopo il materiale social**, per i contenuti già pronti e confermati dall'editore, si programmano su
   **PostFast** i post (all'ora del calendario) e le storie (24 ore prima), secondo «Pubblicazione automatica»; i
   contenuti ancora da produrre li programma la sessione di produzione dopo la conferma. Le storie di TikTok restano a
   mano: la locandina si manda all'editore pronta, con l'ora. Poi l'avviso «📤 Programmato» nell'app.

## Avvisi all'utente nell'app «In 2 minuti» (vincolante, tutti i reparti)
Gli avvisi arrivano nell'app «In 2 minuti», che manda le notifiche sul telefono. **Telegram è dismesso** (decisione del
17 novembre 2026): niente più messaggi Telegram né IFTTT per gli avvisi. **Conferme dei video e risposte ai commenti
passano dalle «richieste» dell'app** (sezione «Conferme nell'app» qui sotto, decisione del 17 novembre 2026); per tutto il
resto l'utente risponde (approvazioni, modifiche) nella chat della sessione, quindi ogni avviso dice in quale sessione rispondere. Lo stesso
contenuto va mandato **anche nella chat della sessione** (SendUserMessage / SendUserFile), così l'utente lo trova lì quando
apre la conversazione. Solo gli avvisi qui sotto, niente messaggi di stato intermedi.
- **Manager, domenica — proposta pronta**: appena la tabella della settimana è pronta (prima dell'approvazione), un avviso
  con i dati della settimana in 3–4 righe (follower, video migliore, cosa funziona), le uscite della settimana (giorno, ora, titolo, stato)
  e «Rispondi nella sessione del manager per approvare».
- **Manager, domenica — dopo l'approvazione**: un avviso quando eventi in calendario, sessioni di produzione e materiale
  social sono pronti (elenco delle produzioni avviate, con la scadenza di ciascuna).
- **Produzione — avvio**: appena la sessione di produzione parte (contenuto scelto, ramo creato), un avviso con titolo,
  formato, data e ora di uscita dal calendario, scadenza prevista e «Rispondi nella sessione di produzione di <titolo>»
  (le domande sul contenuto si fanno lì).
- **Produzione — video pronto**: quando il video finale con la voce è pronto da controllare (controlli verdi e revisori
  APPROVATO), non un avviso ma una **richiesta video** nell'app con l'anteprima (sezione «Conferme nell'app»): l'editore
  riceve la notifica, guarda il video e risponde «Approvata» o «Da rifare» con una nota. Nella chat della sessione si
  manda anche il video (`out/<film>-voce.mp4`, o `out/<film>.mp4` se la voce manca) con SendUserFile, con il link alla pull
  request. Il video è «pronto» solo dopo la conferma dell'editore (nell'app o scritta in chat: vale la prima che arriva);
  appena conferma, la sessione unisce su main da sola senza chiedere altro (`DECISIONI.md`, 15 novembre 2026).
- **Produzione — problema**: se la data di uscita non è raggiungibile con la qualità richiesta, o la sessione è bloccata
  (chiave, connettore, errore), un avviso subito con il motivo e l'alternativa prevista dal calendario.
- Anche commenti della sera (riassunto; le risposte proposte vanno in una richiesta «commenti»), contabilità e direzione mandano i loro avvisi all'app.

**Come si manda**: una POST a `https://in-2-minuti-gestione.pages.dev/api/avvisi`, intestazione
`content-type: application/json`, corpo JSON:
```json
{"reparto": "produzione|manager|pubblicazione|commenti|direzione|contabilita|sistema",
 "tipo": "avvio|pronto|programmato|problema|info",
 "titolo": "una riga", "testo": "il testo completo dell'avviso", "link": "link facoltativo (PR, video, calendario)"}
```
- La chiave (intestazione `x-avvisi-key`) la aggiunge da solo il proxy dell'ambiente: **non va scritta in nessun file né comando**.
- Il JSON si passa da un file o da un heredoc (i testi italiani hanno apostrofi che rompono le virgolette della shell):
  ```bash
  cat > "$SCRATCH/avviso.json" <<'EOF'
  {"reparto": "produzione", "tipo": "pronto", "titolo": "Titanic pronto", "testo": "…", "link": "https://github.com/…"}
  EOF
  curl -sS -X POST https://in-2-minuti-gestione.pages.dev/api/avvisi \
    -H 'content-type: application/json' --data-binary @"$SCRATCH/avviso.json"
  ```
  (`$SCRATCH` = la cartella temporanea della sessione.) Nel campo `testo` solo testo semplice, a capo con `\n`.
- Risposta attesa: `{"ok":true,...}`. Se non arriva, si riprova una volta; se fallisce ancora, lo si scrive nella chat
  della sessione (una riga: «App: avviso non arrivato, <errore>») ma il lavoro non si ferma. Corrispondenze: «Produzione —
  avvio» → `avvio`, «video pronto» → `pronto`, «📤 Programmato» → `programmato`, «problema» e post falliti → `problema`,
  il resto (manager, commenti, conti) → `info`.

## Conferme nell'app «In 2 minuti» (vincolante, dal 17 novembre 2026)
Le conferme dei video e le risposte ai commenti passano dall'app: la sessione crea una **richiesta**, l'editore risponde
nell'app («Approvata» o «Da rifare» con una nota). API su `https://in-2-minuti-gestione.pages.dev`, stessa chiave degli
avvisi (`x-avvisi-key`, la mette il proxy: **mai scriverla** in file o comandi). JSON sempre da file o heredoc, inviato con
`curl --data-binary @file`.

**Video pronto da confermare** (produzione, quando il video con la voce è pronto: controlli verdi, revisori APPROVATO):
1. Anteprima leggera, sotto 24 MB:
   ```bash
   ffmpeg -i out/<film>-voce.mp4 -vf scale=540:-2 -c:v libx264 -preset veryfast -b:v 600k -c:a aac -b:a 96k \
     -movflags +faststart "$SCRATCH/<film>-anteprima.mp4"
   ```
   (se supera 24 MB, abbassare `-b:v`).
2. `POST /api/richieste` con `{"tipo":"video","titolo":"<titolo>","testo":"<una riga: cosa contiene, esito dei revisori> Ramo: <ramo della sessione>","uscita":"AAAA-MM-GGTHH:MM"}`
   (ora italiana dal calendario) → risposta `{"ok":true,"id":"rq-…"}`. La riga finale «Ramo: <ramo>» è obbligatoria: serve a
   `scripts/strumenti/conferme-in-sospeso.mjs` per trovare i video approvati rimasti fuori da main.
3. `PUT /api/media/<id>` con il file come corpo: `curl -sS -X PUT https://in-2-minuti-gestione.pages.dev/api/media/<id> -H 'content-type: video/mp4' --data-binary @"$SCRATCH/<film>-anteprima.mp4"`
   → `{"ok":true,"mb":…}`; da qui l'editore riceve la notifica.
4. Attesa in background, mai a mano: `bash scripts/strumenti/attendi-conferma.sh <id>` (Bash con `run_in_background`;
   controlla `GET /api/richieste/<id>` ogni 2 minuti ed esce quando `stato` non è più `aperta`, stampando la richiesta).
   - `approvata` → si prosegue: unione su main, programmazione con PostFast, avviso «📤 Programmato».
   - `da rifare` → si legge `risposta.nota`, si corregge, si rifà il video e si riparte dal punto 1 (nuova richiesta).
   - Vale anche la conferma scritta dall'editore nella chat della sessione: vale la prima che arriva (se arriva prima in
     chat, si ferma il ciclo in background).
   - **L'attesa non scade mai** (errore del 22 nov, Donnie Darko: lo script si fermava dopo 2 ore, la sessione ha smesso
     di aspettare e l'approvazione arrivata alle 21:00 non l'ha vista nessuno, lungo e trailer non programmati). Lo script
     esce da solo dopo 100 minuti con «STATO: ancora aperta»: in quel caso, e comunque **prima di chiudere ogni turno con
     una richiesta ancora aperta**, la sessione fissa un `send_later` fra 60 minuti («ricontrolla la richiesta <id>: se
     approvata unisci e programma, se aperta fissa un altro send_later») e rilancia lo script. Il `send_later` sopravvive
     al riavvio del contenitore, lo script no. Mai chiudere chiedendo solo «scrivimi in chat»: si ripete finché l'editore
     risponde (di notte, dalle 23 alle 7, il controllo si sposta alle 7:30).
   - Rete di sicurezza: `node scripts/strumenti/conferme-in-sospeso.mjs` elenca i video approvati nell'app ma con il ramo non
     ancora su main. Lo lanciano ogni sera l'attività dei commenti e ogni mattina quella della missione YouTube; per ogni
     «DA UNIRE» chi lo trova unisce il ramo su main (l'editore ha già confermato) e programma come al punto `approvata`.

**Commenti della sera** (attività delle 21:52): per i commenti a cui proporre una risposta si crea **una sola** richiesta:
`POST /api/richieste` con `{"tipo":"commenti","titolo":"Commenti della sera del <data>","voci":[{"itemId":"<da list_inbox_items di PostFast>","piattaforma":"TIKTOK|INSTAGRAM|FACEBOOK","video":"<titolo>","autore":"@…","commento":"…","risposta":"…"}]}`.
Le risposte **non si pubblicano più dalla sessione**: le pubblica l'app quando l'editore le approva. Il riassunto della
sera resta un avviso nell'app come prima.

Se l'API non risponde: si riprova una volta, poi lo si scrive in chat (una riga) e si manda il video in chat come prima;
la conferma scritta in chat resta valida.

## Pubblicazione automatica (PostFast)
Dal 16 novembre 2026 i post si programmano con **PostFast** (prova gratuita fino al ~21 novembre, poi piano a pagamento:
lo decide l'editore). Server MCP `postfast` in `.mcp.json` (pacchetto `postfast-mcp@0.15.3`): la chiave è un segreto di
rete dell'ambiente cloud per `api.postfa.st` (intestazione `pf-api-key`, la mette il proxy; nel file c'è solo il segnaposto
`proxy-injected`); in locale si usa la variabile `POSTFAST_API_KEY`. `NODE_USE_ENV_PROXY=1` serve perché Node passi dal proxy:
senza, ogni chiamata risponde «fetch failed». Senza MCP la stessa API si usa con curl su `https://api.postfa.st`
(`/social-media/my-social-accounts`, `/file/get-signed-upload-urls`, `/social-posts`, `/social-inbox/...`).

Profili collegati (`list_accounts`, 16 novembre): TikTok `in.2.minuti` `74dccd93-3694-4f73-8d7e-378ba69c1275`, YouTube
«In 2 minuti» `e19c8b52-a3ad-4858-857d-4157ba3ac8b0`, Facebook `2d7b62df-5e6f-462f-8061-4b0ed59c4ec6`, Instagram `in.2.minuti`
`9074b244-c662-4083-8cda-c289051bf757` (collegato il 16 novembre). Controllare sempre che `platformUsername` sia
`in.2.minuti`: il 16 novembre era stato collegato per errore un profilo personale. Prima di programmare, `list_accounts`: mai
programmare su un profilo `DISABLED`.

Quando si programma (vincolante):
- **Mai programmare un contenuto già uscito** (`calendario/pubblicati.md`), anche se ha una chiave in `postfast-media`: le
  chiavi registrate dal workflow (anche per prova) non sono un via libera alla pubblicazione.
- **Solo contenuti approvati e confermati**: la settimana approvata dall'editore e il video «pronto», cioè visto e
  confermato dall'editore (`DECISIONI.md`). Lo fa la sessione di produzione subito dopo la conferma e l'unione su main,
  oppure il manager per i contenuti già pronti. Mai prima.
- **Si programma appena il video è pronto, tutto insieme (regola dell'editore, 19 nov 2026):** nella stessa sessione, subito
  dopo la conferma, si programmano il video su TikTok, Instagram, Facebook e YouTube **e** le storie Instagram e Facebook
  24 ore prima (locandina in `calendario/storie/<settimana>/`; se manca, si fa subito). Poi `list_posts` per controllare
  che ci siano tutti e sei i post all'ora giusta, e solo allora il calendario scrive «programmato su PostFast (video e
  storie)». Se la sessione non riesce a finire (push rifiutato, errore, limiti), lo scrive subito in un avviso «problema»
  nell'app: un video confermato non resta mai senza programmazione.
- Video: `upload_media` con `out/<film>-voce.mp4` (MP4 fino a 250 MB), poi `create_posts` (fino a 15 per chiamata) con
  `scheduledAt` all'ora del calendario in ora italiana (ISO con `+01:00` in inverno), testo dal `calendario/<settimana>-social.md`.
- `controls` vale per tutti i post della stessa chiamata: i video in una chiamata, le storie in un'altra. Instagram accetta al
  massimo 5 hashtag: se la didascalia di TikTok ne ha di più, togliere l'ultimo (di solito `#perte`).
- Controlli fissi per ogni video (dichiarazione IA sempre, decisione del 15 novembre):
  - TikTok: `tiktokIsAigc: true`; menzioni e hashtag nella didascalia.
  - YouTube: `youtubeIsShort: true`, `youtubeTitle` (titolo YouTube del `-social.md`, max 100 caratteri),
    `youtubeContainsSyntheticMedia: true`, `youtubeMadeForKids: false`, `youtubeLanguage: "it"`; il testo è la descrizione.
  - Facebook: `facebookContentType: "REEL"`.
  - Instagram (quando collegato): `instagramPublishType: "REEL"`, `instagramIsAiGenerated: true`, `instagramCollaborators`
    per le collaborazioni (es. Mr.goal).
  - Le etichette IA si mettono solo alla creazione: dopo non si possono più aggiungere.
- Storie: **sempre esattamente 24 ore prima dell'uscita del video** (regola dell'editore, 16 novembre 2026: video alle 17:30
  → storia alle 17:30 del giorno prima; video alle 12:30 → storia alle 12:30). Locandina PNG da `calendario/storie/<settimana>/`
  caricata con `node scripts/postfast-carica.mjs <png>`, poi `instagramPublishType: "STORY"` e `facebookContentType: "STORY"`.
  Si programmano insieme al materiale social, subito dopo l'approvazione della settimana.
- **Video lungo di YouTube (regola dell'editore, 16 novembre 2026):** il trailer verticale del video lungo esce **in contemporanea**
  alla pubblicazione del lungo su YouTube, alla stessa ora, su tutti i social (TikTok, Instagram Reel, Facebook Reel, YouTube
  Shorts); la storia esce 24 ore prima, come per ogni altro video. Si programmano insieme con PostFast (il lungo con
  `youtubeIsShort: false`, `youtubeContainsSyntheticMedia: true`, titolo, descrizione e capitoli da `out/<film>-capitoli.txt`;
  il trailer con i controlli dei video verticali e il link al lungo nella didascalia o nel primo commento).
- **Trailer e Short promozionali** (`promo/<slug>.json`) passano dallo stesso workflow: unito su main, «Video su MEGA» li
  rigenera (`node scripts/promo/render.mjs`), li carica su MEGA e su PostFast e registra la chiave come per i film.
- **Storie su TikTok: a mano.** L'API di TikTok (e quindi PostFast) non pubblica storie: la locandina la carica l'editore
  dall'app, all'ora della storia; la squadra gliela ricorda e gliela manda pronta. Non si pubblica la locandina come post
  normale nel profilo TikTok (riempirebbe la griglia di immagini ferme).
- Le storie di Facebook risultano PUBLISHED con `platformPostId` vuoto anche quando escono (verificato dall'editore il
  16 novembre): non vanno riprogrammate per questo.
- **Il video non si rifà mai per pubblicarlo.** Il workflow «Video su MEGA», dopo il caricamento su MEGA, carica anche
  `<film>-voce.mp4` su PostFast (`scripts/postfast-carica.mjs`) e scrive la chiave in `postfast/<film>.json` sul ramo
  `postfast-media`: la sessione la legge con `git fetch origin postfast-media && git show origin/postfast-media:postfast/<film>.json`
  e la usa in `mediaItems` (`{key, type: "VIDEO", sortOrder: 0}`). Serve il segreto GitHub `POSTFAST_API_KEY`. Se la chiave
  manca (video fatto prima del segreto), si rilancia il workflow per quel film (Actions → «Video su MEGA» → Run workflow).
- Nel cloud gli script Remotion usano il browser locale: `REMOTION_BROWSER=/opt/pw-browsers/chromium` (senza, il download di
  Chrome da remotion.media è bloccato).
- Dopo `create_posts`, `list_posts` con `statuses: SCHEDULED` per controllare; il giorno dopo l'uscita, `statuses: FAILED`:
  un post fallito (`lastError`) si segnala subito nell'app. Il controllo lo fa ogni sera l'attività dei commenti delle
  21:52 (post delle ultime 48 ore) e la domenica il manager per tutta la settimana.
- Avviso «📤 Programmato» nell'app: titolo, data e ora, piattaforme.

## Commenti della sera (PostFast)
PostFast legge i commenti di TikTok, Facebook e (quando collegato) Instagram, dal collegamento in poi: `get_inbox_unread_count`,
`list_inbox_conversations` (solo non letti), `list_inbox_items`. Ogni sera alle 21:52 un'attività programmata apre una sessione,
prepara un riassunto e le risposte proposte (tono in prima persona plurale, simpatico e costruttivo, niente spoiler senza avviso,
fatti solo verificati, richieste di titoli annotate in «Richieste dai commenti»): il riassunto va in un avviso nell'app,
le risposte proposte in **una richiesta «commenti»** (sezione «Conferme nell'app», con l'`itemId` di ogni commento).
**Non risponde sui social**: le risposte le pubblica l'app quando l'editore le approva; la sessione non usa più
`reply_to_inbox_item` (decisione del 17 novembre 2026). Mai `set_inbox_item_state` con DELETE senza l'editore. YouTube non ha la
casella dei commenti in PostFast.

## Idee nuove (compito del manager, ogni domenica)
I format nuovi devono nascere dal manager, non dall'editore (decisione del 15 novembre 2026). Nella proposta della
domenica c'è sempre una riga «Esperimento della settimana»: un format o un titolo fuori dalla rotazione, agganciato a un
evento verificato (un programma TV in corso, un lancio, un anniversario, una tendenza di Google Trends o TikTok Creative
Center), con il punteggio della tabella qui sotto e il motivo. Si prova una volta, si legge il risultato la domenica dopo e
si decide se tenerlo (come X Factor e i videogiochi). Gli esperimenti non devono rendere i contenuti tutti uguali: si cerca
un tipo di pubblico nuovo, non una copia di ciò che è già andato bene.

## Monetizzazione (il manager controlla ogni domenica, la direzione il 1° del mese)
Requisiti noti a fine 2025, **da riconfermare con una ricerca sulle pagine ufficiali il 1° di ogni mese** (cambiano spesso);
se sono cambiati, si aggiorna questa tabella.
| Piattaforma | Programma | Requisiti | Noi (data) |
|---|---|---|---|
| TikTok | Creator Rewards | 18+, 10.000 follower, 100.000 visualizzazioni negli ultimi 30 giorni, video di almeno 1 minuto, contenuti originali | 2.992 follower (12 nov); video da 2:00 ✓ |
| YouTube | Partner Program (base) | 500 iscritti + 3 caricamenti in 90 giorni + 3.000 ore di visione in 12 mesi o 3 milioni di visualizzazioni di Shorts in 90 giorni | 127 iscritti, 0 ore idonee, 4,4 mila viste di Short idonee in 90 giorni (YouTube Studio, dati al 13 nov 2026: i due lunghi del 14 e 18 nov non sono ancora contati) |
| YouTube | Partner Program (pubblicità) | 1.000 iscritti + 4.000 ore in 12 mesi o 10 milioni di visualizzazioni di Shorts in 90 giorni | i video lunghi contano per le ore |
| Instagram | bonus, abbonamenti, regali | su invito o soglie per paese (abbonamenti: 10.000 follower) | – |
| Facebook | monetizzazione dei contenuti | su invito / idoneità nella Meta Business Suite | – |
Cosa conviene (valutato dal manager, deciso dall'editore): i video lunghi di YouTube sono la strada più veloce per le ore di
visione; su TikTok conta superare 1 minuto (già fatto) e la soglia dei 10.000; le collaborazioni (come Mr.goal) portano follower
più dei bonus. Rischi da evitare: musica non nostra nel video (blocca la monetizzazione), immagini o clip dei film,
mancata dichiarazione di contenuto IA dove la piattaforma la chiede. Quando una soglia è vicina (oltre l'80%), avviso nell'app.

## Diffusione (persone che possono rilanciare il video)
Per ogni uscita, nel `calendario/<settimana>-social.md`, una sezione «Diffusione» quando è fattibile:
- **Chi**: il protagonista se è una persona reale con profilo pubblico (storie vere, sport, talent), regista e autori,
  distributore o piattaforma dove si vede l'opera, museo per i quadri, pagine di fan e community del genere, pagine partner
  (Mr.goal). Solo profili ufficiali verificati.
- **Come**: menzione nella didascalia e tag nel post (li mette la pubblicazione), storia con menzione, collaborazione Instagram
  se c'è un accordo, e un **messaggio privato pronto** da incollare (breve, in prima persona plurale, cosa abbiamo fatto, link,
  nessuna richiesta insistente; offrire di condividerlo, mai chiedere soldi o favori).
- **Chi invia**: i messaggi privati li manda l'editore (sono contatti con persone reali a nome della pagina); la squadra li
  prepara e ricorda il momento giusto (subito dopo l'uscita) con l'avviso del giorno nell'app.
- Si annota la risposta in `calendario/pubblicati.md` (colonna Note), così si sa chi rilancia e chi no.

## Come si sceglie un titolo (la parte più importante)
Gli eventi della settimana (anniversari, uscite al cinema e in streaming, festività, eventi TV) danno 2–3 titoli.
**Tutti gli altri si scelgono per quanto sono appetibili**: devono portare visualizzazioni, like e follower.
Punteggio da 0 a 3 per ogni voce:

| Criterio | Domanda |
|---|---|
| **Mistero** | C'è un colpo di scena, un finale da capire o una regola da spiegare? (è ciò che rende di più sul profilo) |
| **Fama** | Lo conoscono anche quelli che non l'hanno visto? Il titolo da solo fa fermare lo scorrimento? |
| **Discussione** | Se ne parla ancora: finale discusso, teorie, «non l'ho capito», scene citate in rete? |
| **Momento** | È disponibile adesso su una piattaforma, è in classifica, sta per uscire un seguito o una nuova stagione? |
| **Puntate** | Porta a un seguito (stagione successiva, saga)? Chi lo vede torna per il prossimo. |
| **Sponsorizzabile** | C'è qualcuno che oggi spende per farlo vedere (film al cinema o appena uscito in streaming, nuova stagione, remake o seguito annunciato, gioco in uscita, evento TV)? È questo che porta collaborazioni e soldi (decisione del 16 nov): 3 uscite a settimana con 2 o 3, ognuna con contatti e messaggi pronti in `collaborazioni/`. |
| **Disegnabile** | Luoghi e oggetti forti, senza bisogno di personaggi (regola vincolante: con 0 il titolo è scartato). |

Si scelgono i titoli con il punteggio più alto, poi si bilanciano tipo e genere sulla settimana.
- Il titolo più forte della settimana va nel giorno con più visualizzazioni (dai dati del profilo).
- Dopo un video che va molto bene, entro 3–4 giorni esce qualcosa di simile (il seguito, lo stesso regista, lo stesso genere).
- Il video migliore del momento si fissa in alto sul profilo.

## Fonti per le analisi
- Classifiche: Top 10 Netflix Italia (www.netflix.com/tudum/top10/italy), JustWatch Italia (popolari e dove vederli),
  box office Cinetel; FlixPatrol blocca i programmi (403), si usa la ricerca web.
- Tendenze: Google Trends Italia, TikTok Creative Center (hashtag e brani di tendenza in Italia).
- Uscite e calendari: MyMovies, FilmTV, ComingSoon, Sorrisi; trame e date su Wikipedia.

## Cosa dicono i dati (aggiornare ogni domenica)
- **Regola dell'editore (22 nov 2026): nelle analisi conta prima YouTube.** Ogni domenica la classifica parte dalle
  visualizzazioni YouTube di ogni video (lunghi e Short), poi TikTok e Instagram; un titolo che rende su YouTube vale più
  di uno che rende solo su TikTok, perché YouTube è la fonte di sostenibilità.
- 22 novembre 2026 (PostFast): **YouTube 154 iscritti, +68 in sei giorni** (~11 al giorno: per 1.000 al 31 dicembre ne
  servono ~22 al giorno). Su YouTube gli Short migliori sono i titoli famosissimi o «culturali» che si cercano per nome:
  Titanic 1.214, GTA VI 1.202, Il miglio verde 1.163, **L'Ultima Cena 1.158** (quasi nulla su TikTok e Instagram), mentre
  **Donnie Darko** esplode altrove (154.852 Instagram con 1.036 condivisioni, 49.229 TikTok) e su YouTube fa 106. Il lungo
  di Ritorno al futuro: 311 visualizzazioni in 4 giorni, durata media 2:55 (35,5%, sotto l'obiettivo del 40%). X Factor
  chiude debole (247 YouTube). Nessun post fallito. Lettura: i lunghi devono stare su titoli cercati per nome (Backrooms,
  Lost, Interstellar) e gli Short da portare su YouTube sono quelli famosi, non solo quelli che vanno bene su Instagram.
- 14 novembre 2026 (Metricool): **Instagram ora porta più di TikTok sugli Spiegato** (Inception 221.124 e 1.334 condivisioni,
  Tenet 71.802, Dark 3 66.594, contro 8–17 mila su TikTok). Breaking Bad stagione 1 sorprende su Instagram (48.414): le serie
  a puntate reggono. Film con colpo di scena nella media (Il sesto senso 8.905 + 6.593). **X Factor debole** (1.043 + 1.504):
  si tiene il mercoledì ma si ricontrolla dopo il Live 4. Follower TikTok 2.992 (+903 in sei giorni).
- 8 novembre 2026 (Metricool, TikTok + Instagram): **Spiegato semplice è il formato più forte** (Dark stagione 1:
  59.360 TikTok + 70.658 Instagram, 922 condivisioni su Instagram; Inception: 56.289 su Instagram in un giorno e mezzo;
  Dark stagione 2: 12.403 + 49.029). Seguono i film con colpo di scena (Interstellar, Truman, Shutter Island, The Others).
  Deboli: Cast Away (1.550 + 2.378), Jurassic Park, La La Land, Harry Potter e il primo quadro (Notte stellata,
  566 + 774, sabato alle 10:00). Le condivisioni, che portano follower, sono soprattutto sugli Spiegato.
- 5 novembre 2026: i più visti hanno mistero o una trama da capire (Dark stagione 1 in Spiegato semplice 52.838,
  Interstellar 48.317, Truman Show 36.277, Shutter Island 30.437); rendono poco i film d'atmosfera o d'avventura
  senza mistero (La La Land 2.473, Jurassic Park 1.235). Un commento: «finale inaspettato».

## Richieste dai commenti (da usare nella programmazione della domenica)
13 novembre 2026, per la settimana 16–22 novembre. Punteggio di questa pagina (mistero, fama, discussione, momento,
puntate, disegnabile; massimo 18):
| Titolo | Formato consigliato | Punti | Note |
|---|---|---|---|
| Donnie Darko | Spiegato semplice | 12 | Trama da capire, il formato che rende di più: il più forte della lista. |
| Conjuring – L'evocazione | Film | 12 | Horror famoso con una saga dietro (seguiti); non accanto a Shining o Doctor Sleep. |
| Doctor Sleep | Film | 11 | Seguito di Shining (uscito venerdì 13): se Shining va bene, esce entro 3–4 giorni. |
| Il miglio verde | Film | 11 | Mistero sul dono di John Coffey e finale che si ricorda; la sedia elettrica si racconta con il corridoio verde, senza mostrarla in uso. |
| Oppenheimer | Film | 10 | Nolan (Interstellar è andato forte); Los Alamos e il test nel deserto molto disegnabili. |
| Le pagine della nostra vita | Film | 9 | Colpo di scena su chi racconta; i film romantici finora rendono poco (La La Land). |
| Dunkirk | Spiegato semplice | 9 | Si spiegherebbe la regola dei tre tempi (una settimana, un giorno, un'ora); poco mistero. |
**Nuove richieste dai commenti 15–17 novembre** (da valutare con il punteggio la domenica): **Hereditary** e **Noi, i ragazzi
dello zoo di Berlino** (TikTok, commenti di Hunger Games, 15 nov); **The Imitation Game** (TikTok, commenti di Titanic, 16 nov;
chiesto anche Salvate il soldato Ryan, poi cancellato dall'autore); **Lo squalo** (TikTok, commenti di Titanic, 16 nov);
**Doctor Sleep** citato di nuovo nei commenti di Shining (17 nov), già in lista.
**18 novembre:** **Lost, stagione per stagione** (Instagram, commenti del post di Dark sul canale YouTube, 17 nov sera): già
nelle priorità dello Spiegato semplice (CLAUDE.md); nei commenti di Shining due persone chiedono della foto finale (teoria della
reincarnazione di Jack): spunto per uno Spiegato o per **Doctor Sleep**, già in lista.
**20–22 novembre** (commenti della sera del 22): **Vanilla Sky** e **I soliti sospetti** (TikTok, commenti di Donnie Darko,
20 nov: «spiegato così»); **The Butterfly Effect** (TikTok, Donnie Darko, 22 nov); **Il Signore degli Anelli** e **Saw**
(TikTok, Il miglio verde, 20 nov); **Nascosto nel buio** (TikTok, The Others, 21 nov; chiesto anche Shutter Island, già fatto);
**Scissione – stagione 2** (Instagram, 22 nov, «in previsione della terza»; su TikTok una persona chiede delle nuove stagioni);
canzoni **Henna** di Lucio Dalla e **Un'estate al mare** di Giuni Russo (Instagram, commenti di Gli anni, 22 nov).
**Quadro confermato per la settimana 23–29 novembre: L'urlo di Munch** (chiesto nei commenti di Notte stellata; deciso
dall'utente il 14 novembre, insieme a L'Ultima Cena per sabato 21). Va nel weekend alle 10:00.
Evento della settimana da non perdere: **Edoardo Bove – «In un battito»** (documentario in sala 16–18 novembre),
speciale in collaborazione con Mr.goal, brief in `calendario/bove-in-un-battito.md` (uscita confermata domenica 15 alle 17:30,
prodotto sabato 14; domenica Hunger Games passa alle 10:00, La Gioconda slitta a un altro weekend).

## Riserva di titoli (da riordinare con i dati)
- **Film con colpo di scena:** Il sesto senso, Fight Club, The Prestige, Seven, I soliti sospetti, Memento, Matrix,
  Parasite, Scappa – Get Out, Il silenzio degli innocenti, Psyco.
- **Spiegato semplice:** Dark stagione 3, Tenet, Donnie Darko, Mulholland Drive, Arrival, Primer, Lost, Severance, Westworld, 1899.
- **Serie (una stagione per video):** Breaking Bad 2–5, Stranger Things, Squid Game, La casa di carta, Lupin.
- **Weekend:** quadri (pubblico dominio, vedi `QUADRI.md`), canzoni famosissime, storie vere (formato da definire:
  servono regole proprie su persone reali, fonti e tono prima della prima uscita).
