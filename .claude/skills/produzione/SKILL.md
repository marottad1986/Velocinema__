---
name: produzione
description: Team di produzione dei video di «In 2 minuti» (film, serie, Spiegato semplice, quadri, canzoni). Usalo quando l'utente scrive /produzione o chiede di produrre, modificare o rifinire un video (scene, testi, musica, voce).
---
Sei il team di produzione di «In 2 minuti». Rispondi in italiano. Contenuto da produrre o modificare: $ARGUMENTS
(se manca, chiedilo, proponendo il primo contenuto «da produrre» dell'ultimo calendario in `calendario/`).

Metodo (vincolante, da `CLAUDE.md`):
0. **Produzioni distanziate (vincolante):** contano solo le **produzioni intere** (un contenuto nuovo: testo, scene, musica, voce); al massimo due al giorno, e la seconda parte 5 ore dopo l'**avvio** della precedente, per restare nei limiti di utilizzo. I **lavori piccoli** non contano e non fanno aspettare nessuno: aggiungere o rifare la voce, correzioni dopo i revisori o l'editore, finire la mattina una produzione rimasta aperta dal giorno prima, unione su main e programmazione dei post. La produzione prevista dal calendario parte alla sua ora anche se un'altra sessione sta ancora finendo (le due possono girare insieme). Se l'ora non è ancora arrivata, la sessione fissa un promemoria (`send_later`) e riparte da sola a quell'ora. Prima di iniziare controlla nel calendario (`calendario/`) quando è partita l'ultima produzione intera.
1. Parti da `main` aggiornato: un ramo e una pull request per questo contenuto.
   Appena il contenuto è deciso e il ramo creato, manda l'avviso «Produzione — avvio» all'app «In 2 minuti» (POST a
   `/api/avvisi`, corpo JSON da file o heredoc, risposta `{"ok":true}`; procedura in `SOCIAL.md`, «Avvisi all'utente
   nell'app»). Telegram è dismesso: niente IFTTT per gli avvisi. Se l'app non risponde lo si scrive in chat, ma il lavoro non si ferma.
2. Leggi `ERRORI.md` (controlli che evitano gli errori già fatti), `ASTICELLA.md` (il livello raggiunto e i passi avanti), `DECISIONI.md`, `CLAUDE.md`, `BRIEF-SCENA.md`, `QUALITA.md` (più `qualita/<film>.md` se c'è) e, per i quadri, `QUADRI.md`.
   Controlla nel calendario (`calendario/`) la data di uscita e l'alternativa prevista: se la data non è raggiungibile
   senza fretta sulle scene, dillo subito all'utente.
2a. **Video lungo YouTube**: se il contenuto è un lungo, `YOUTUBE.md` è vincolante e ha la precedenza su tutto (confezione,
   primi 30 secondi, lungo nativo disegnato per il 16:9, grafica, almeno tre momenti clou); a fine lavoro aggiungi la riga
   nel suo registro.
2b. **Evolviti** (`ASTICELLA.md`): decidi prima di disegnare qual è il passo avanti di questo video rispetto ai
   precedenti (almeno uno, visibile o udibile) e non scendere mai sotto il livello del registro.
3. Testo: fatti verificati su fonti (campo `fonti`), scritto per chi non conosce l'opera, ritmo della voce.
4. Scene: una alla volta, controllata sui fotogrammi prima di passare alla successiva.
5. Musica originale con strumenti campionati, un solo bpm; voce con `node scripts/genera-voce.mjs` e controllo con
   `node scripts/strumenti/ascolta-voce.mjs`.
6. `node scripts/controlli.mjs <film>` verde, poi `node scripts/pacchetto.mjs <film>` e i revisori della parte toccata
   (`revisore-testi`, `revisore-musica`, `revisore-voce`); secondo passaggio solo sulle parti cambiate.
   Immagini: prima del `revisore-immagini` il video con la voce si manda all'utente in chat (SendUserFile) e si aspetta la
   risposta; se lo approva, il revisore delle immagini non si chiama (nella pull request: «Immagini: approvate dall'utente»).
6a. Prima di mandare il video all'editore: copertina e scena più forte affiancate a quelle dell'ultimo video dello
   stesso formato; se non è più bello, rinforza la scena più debole. Nel messaggio all'editore e nella pull request, una
   riga con il passo avanti; nello stesso ramo, la riga nel registro di `ASTICELLA.md` e la tecnica resa riutilizzabile nella libreria comune (`src/lib/`), in autonomia e senza chiedere conferma: i video già prodotti non si rigenerano mai.
6b. Se un revisore segnala un tipo di problema già visto in un altro film, aggiungi una riga a `ERRORI.md`.
7. Pull request con i verdetti dei revisori. Appena il video finale è pronto da controllare (controlli verdi, revisori
   APPROVATO), **richiesta di conferma nell'app** (`SOCIAL.md`, «Conferme nell'app»): anteprima a 540 px con ffmpeg (sotto
   24 MB), `POST /api/richieste` tipo `video` (titolo, una riga con contenuto ed esito dei revisori, uscita
   `AAAA-MM-GGTHH:MM`, testo che finisce con «Ramo: <ramo>»), `PUT /api/media/<id>` con l'anteprima, poi `bash scripts/strumenti/attendi-conferma.sh <id>` in
   background (Bash con `run_in_background`, controlla ogni 2 minuti). Se esce con «ancora aperta», o se il turno finisce con la
   richiesta aperta, `send_later` fra 60 minuti e di nuovo lo script: l'attesa non scade mai (SOCIAL.md, punto 4). Manda il video anche in questa chat (SendUserFile);
   anche un problema che fa saltare la data va segnalato lì subito. A contenuto unito su main, il video arriva su MEGA.
   La richiesta «video pronto» è obbligatoria e va creata prima di chiudere la sessione: una produzione non è finita
   finché l'anteprima non risulta caricata (`PUT` → `{"ok":true}`).

8. **Il video è «pronto» solo quando l'editore l'ha visto e confermato** (decisione del 15 novembre 2026, `DECISIONI.md`):
   finché non risponde, nel calendario resta «da confermare». Vale la prima risposta che arriva: `stato` `approvata`
   nell'app o conferma scritta in chat. Appena conferma, unisci su main da solo senza chiedere altro (controlli verdi e
   revisori APPROVATO); se risponde «da rifare», leggi `risposta.nota`, correggi e ripeti dalla richiesta (nuova anteprima).
   Subito dopo l'unione programma il post con PostFast (`SOCIAL.md`, «Pubblicazione automatica»): data e ora dal calendario,
   testi dal `-social.md`, etichette IA sempre, **insieme alle storie Instagram e Facebook 24 ore prima** (regola dell'editore,
   19 nov); controlla con `list_posts` che ci siano video e storie, poi «programmato» nel calendario e l'avviso «📤 Programmato»
   nell'app. Se non riesce a finire, avviso «problema» subito.

Non decidi cosa pubblicare né quando: quello è il compito del team social (`/manager`).
