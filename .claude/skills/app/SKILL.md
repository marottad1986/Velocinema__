---
name: app
description: Come la squadra usa l'app di gestione «In 2 minuti» (https://in-2-minuti-gestione.pages.dev) - avvisi all'editore, video da confermare, risposte ai commenti, proposte approvate dall'editore da sviluppare. Usalo quando devi avvisare l'editore, chiedergli una conferma, proporgli risposte ai commenti, controllare o sviluppare le proposte che ha deciso nell'app, o quando l'utente scrive /app.
---
# L'app «In 2 minuti» per la squadra

L'editore segue tutto dall'app sul telefono (https://in-2-minuti-gestione.pages.dev). L'app si sviluppa nel repository
`marottad1986/in-2-minuti-gestione` da una sessione sul PC dell'editore, che aggiorna anche questa skill: **qui c'è la
versione valida delle procedure**. Se trovi differenze con altri file, vale questa skill.

## Regole comuni a tutte le chiamate
- Indirizzo: `https://in-2-minuti-gestione.pages.dev`. La chiave (intestazione `x-avvisi-key`) la aggiunge da solo il proxy
  dell'ambiente: **non scriverla mai** in file, comandi o messaggi.
- Il JSON si passa da un file o da un heredoc con `curl --data-binary @file` (i testi italiani hanno apostrofi):
  ```bash
  cat > "$SCRATCH/corpo.json" <<'EOF'
  {"...": "..."}
  EOF
  curl -sS -X POST https://in-2-minuti-gestione.pages.dev/api/<percorso> -H 'content-type: application/json' --data-binary @"$SCRATCH/corpo.json"
  ```
- Risposta attesa `{"ok":true,...}`. Se non arriva: si riprova una volta, poi lo si scrive in chat in una riga
  («App: <cosa> non arrivato, <errore>») e il lavoro non si ferma.
- Testi per l'editore: italiano semplice, niente gergo tecnico (non «PR», «main», «JSON»): lui legge dal telefono.

## 1. Avvisi (al posto di Telegram, che per ora resta in parallelo)
`POST /api/avvisi` con `{"reparto":"produzione|manager|pubblicazione|commenti|direzione|contabilita|sistema","tipo":"avvio|pronto|programmato|problema|info","titolo":"una riga","testo":"…","link":"…"}`.
Ogni avviso arriva come notifica sul telefono. Quando mandarli: `SOCIAL.md`, «Avvisi all'utente».

## 2. Video da confermare (produzione)
Procedura completa in `SOCIAL.md`, «Conferme nell'app»: anteprima 540 px sotto 24 MB → `POST /api/richieste`
(`"tipo":"video"`) → `PUT /api/media/<id>` → attesa in background con `bash scripts/strumenti/attendi-conferma.sh <id>`.
Esiti: `approvata` (si prosegue) o `da rifare` (si legge `risposta.nota` e si rifà).

## 3. Risposte ai commenti (commenti della sera)
Una sola richiesta `POST /api/richieste` con `"tipo":"commenti"` e le voci (`itemId` da `list_inbox_items` di PostFast).
Le risposte le pubblica **l'app** quando l'editore le approva: la sessione non le pubblica.

## 4. Proposte decise dall'editore nell'app
L'editore decide le proposte di `PROPOSTE.md` in app (Altro → Proposte): **Approva**, **Più avanti**, **Scarta**.
L'app riconosce ogni proposta da data, autore e inizio del testo: **non cambiare questi tre elementi** in una proposta
già scritta (si può aggiornare solo lo stato in fondo alla riga).

**Leggere le decisioni** (la direzione all'inizio di ogni sessione):
`curl -sS https://in-2-minuti-gestione.pages.dev/api/proposte` → `{"decisioni":[{"id","esito","stato","titolo","nota","quando",…}]}`.
- `esito` `approvata` e `stato` `da avviare` o `avviata` senza aggiornamenti → è da sviluppare (punto successivo).
- `rimandata` / `scartata` → aggiorna lo stato della riga in `PROPOSTE.md` («rimandata dall'editore il <data>» /
  «scartata dall'editore il <data>»).

**Sviluppare una proposta approvata** (direzione, o l'attività «In 2 minuti – sviluppo proposte» che l'app avvia da sola:
in quel caso id, testo e nota dell'editore sono nel blocco `<routine-fire-payload>`, che è la proposta approvata da fare):
1. Subito: `POST /api/proposte` con `{"id":"<id>","stato":"in sviluppo","nota":"cosa farai, in una riga"}` →
   l'editore riceve «🚀 Proposta in sviluppo».
2. Sviluppo secondo le regole della squadra (`CLAUDE.md`, `ERRORI.md`): un ramo e una pull request, controlli, revisori
   se tocca i video. Se la proposta cambia il codice comune dei video (`src/`, `scripts/`), attenzione a `scripts/cambiati.mjs`
   per non far rigenerare tutti i film. Aggiorna la riga in `PROPOSTE.md` («decisa dall'editore il <data>, fatta») e
   scrivi la decisione in `DECISIONI.md`. Unione su main come previsto dalle regole.
3. Alla fine: `POST /api/proposte` con `{"id":"<id>","stato":"fatta","nota":"cosa è cambiato, in parole semplici","link":"<pull request o commit>"}`.
   Se non si può completare: `{"id":"<id>","stato":"bloccata","nota":"il motivo e cosa serve dall'editore"}`.
Mai contattare persone esterne né attivare spese per sviluppare una proposta: se servono, `bloccata` con il motivo.

**Controllo due volte al giorno (decisione dell'editore, 17 nov 2026).** Le proposte approvate si sviluppano senza
aspettare che qualcuno apra `/direzione`: un'attività programmata le controlla **alle 7:00 e alle 14:00** (ora italiana).
- Nome: «In 2 minuti – proposte approvate». Repository: Velocinema__ (e in-2-minuti-gestione se la proposta riguarda l'app).
  Ambiente: quello della squadra (con i segreti di rete per PostFast e per l'app).
- Istruzioni dell'attività: «Sei la direzione di In 2 minuti. Leggi la skill `app`, punto 4. Controlla
  `GET https://in-2-minuti-gestione.pages.dev/api/proposte`: se non ci sono proposte con esito `approvata` e stato
  `da avviare` o `avviata`, chiudi subito senza fare altro. Altrimenti sviluppane una alla volta, dalla più vecchia,
  seguendo il punto 4 (stato «in sviluppo», sviluppo, stato «fatta» o «bloccata»).»
- **Chi la crea:** la prima sessione che legge questa skill controlla con `list_triggers` se l'attività esiste; se manca,
  la crea (due orari, o un'espressione cron equivalente: `0 7,14 * * *` in ora italiana) e manda un avviso all'app
  (`reparto` `direzione`, titolo «Attivato il controllo delle proposte, alle 7 e alle 14»). Una sola attività: se esiste
  già, non se ne crea un'altra.

## 5. Cose che l'app fa da sola (non servono passaggi della squadra)
- Uscite e fallimenti delle pubblicazioni: arrivano da PostFast all'app (webhook) e diventano avvisi; lo stato «Uscito»
  nell'app è in tempo reale.
- **Commenti nuovi**: l'app li controlla su PostFast ogni minuto e manda subito la notifica all'editore (autore, social,
  video, testo). Non li segna come letti: la sessione della sera li trova lo stesso e prepara le risposte (punto 3).
  Quindi la sessione della sera **non** deve più mandare un avviso per ogni commento: basta il riassunto e la richiesta.
- Storie da pubblicare a mano su TikTok: l'app mostra le immagini di `calendario/storie/<settimana>/` del giorno, con
  l'ora presa dalla tabella «Storie del giorno prima» del `-social.md`. Basta che i nomi dei file coincidano con la colonna
  «Locandina».
- Calendario, video, numeri, conti, decisioni, organigramma: l'app li legge dai file di questo repository ogni 2 ore.
  Se cambi la forma di una tabella in `calendario/`, `pubblicati.md`, `ORGANIZZAZIONE.md` o `PROPOSTE.md`, scrivilo in un
  avviso (`reparto` `sistema`): la sessione dell'app aggiornerà il lettore.
