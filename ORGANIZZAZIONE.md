# Organizzazione di «In 2 minuti»

Chi fa cosa, come passa il lavoro da un reparto all'altro e cosa manca per l'automazione completa.
Obiettivo dell'editore (l'utente): **solo supervisionare**. Approva la settimana una volta, guarda i video quando vuole,
legge gli avvisi nell'app «In 2 minuti». Tutto il resto lo fa la squadra da sola.

## Organigramma

```
                         EDITORE (l'utente)
              approva la settimana · può fermare tutto
                               │
                     DIREZIONE  (/direzione)
        consigliere personale · decide le priorità · scrive
        le «Decisioni» e le diffonde a tutta la squadra
                               │
  ┌──────────────┬─────────────┼───────────────┬──────────────────┐
  │              │             │               │                  │
SOCIAL MEDIA   PRODUZIONE   PUBBLICAZIONE   COMMUNITY E        CONTABILITÀ
MANAGER        (/produzione) (dentro il     DIFFUSIONE         (/contabilita)
(/manager)     una sessione  manager)       (dentro il         conti, costi,
dati, idee di  per video     post su        manager)           entrate, soglie
format, titoli,  │           Metricool,     commenti, risposte di spesa
settimana,       │           storie, orari  nell'app,    
monetizzazione   │                          persone da coinvolgere
                 │
     REVISORI (subagenti): testi · immagini · musica · voce
```

| Reparto | Comando / dove vive | Responsabilità | Decide da solo | Chiede all'editore |
|---|---|---|---|---|
| **Direzione** | `/direzione`, `DECISIONI.md` | Consiglio strategico, priorità del mese, nuovi format (decide quali provare), risolve i conflitti tra reparti, diffonde le decisioni | Ordine delle priorità, cosa si prova come esperimento piccolo | Cambi di rotta, spese nuove, collaborazioni |
| **Social media manager** | `/manager`, `SOCIAL.md` | Dati Metricool, scelta titoli, settimana, **proposte di format nuovi** (es. X Factor, GTA sono idee che deve trovare lui), monetizzazione e requisiti dei profili | Bozza della settimana, alternative, testi dei post | **Approvazione della settimana** (l'unico «sì» obbligatorio) |
| **Produzione** | `/produzione`, `CLAUDE.md`, `BRIEF-SCENA.md` | Un video per sessione, dalla scena alla voce, revisori, PR | Tutto il contenuto, nelle regole | Solo se la data salta o manca una chiave |
| **Pubblicazione** | manager, `SOCIAL.md` «Pubblicazione automatica» | Programma i post su Metricool (TikTok, Instagram, Facebook, YouTube) e le storie | Orari già approvati | Niente (segue la settimana approvata) |
| **Community e diffusione** | manager, `SOCIAL.md` «Commenti» e «Diffusione» | Commenti → risposte proposte nell'app; per ogni video chi può rilanciarlo (protagonista, regista, distributore, pagine di fan) e messaggio pronto | Bozze di risposte e messaggi | **Ogni messaggio a persone esterne** lo invia l'editore (o lo approva) |
| **Contabilità** | `/contabilita`, `contabilita/` | Registro costi ed entrate, abbonamenti, crediti (ElevenLabs, IFTTT), rendiconto mensile, avvisi di spesa | Registrazioni, avvisi | Nuove spese, cambi di piano |
| **Revisori** | `.claude/agents/` | Controllo indipendente di testi, immagini, musica, voce | Verdetti | – |

Memoria comune della squadra (si legge all'inizio di ogni sessione del proprio reparto, così non si ragiona da capo):
`CLAUDE.md` (regole), `ERRORI.md` (errori già fatti e controlli che li evitano), `ASTICELLA.md` (livello raggiunto e passi avanti), `DECISIONI.md` (decisioni della direzione),
`SOCIAL.md` (programmazione), `contabilita/conti.md` (conti).

## Il ciclo della settimana (obiettivo)

| Quando | Chi | Cosa | Stato oggi |
|---|---|---|---|
| Dom 15:05 | Manager (attività programmata) | Dati Metricool e PostFast → proposta della settimana → app | ✅ attiva (`trig_01ErsayWy5XJvQ6RMrpNndyF`, riaccesa il 17 nov; prossima dom 22) |
| Dom, dopo il «sì» | Editore | **Approva in chat** (unico intervento obbligatorio) | ✅ |
| Dom, dopo il «sì» | Manager | Calendario Google, materiale social, post e storie dei contenuti pronti su PostFast, coda delle produzioni | ✅ |
| Tutta la settimana | Produzione | Un video alla volta, max 2 al giorno a 5 ore | ⚠️ funziona ma a catena di promemoria: si rompe facilmente (vedi punto 3 sotto) |
| A video unito su main | GitHub Actions | Render e caricamento su MEGA | ✅ |
| Dopo la conferma del video | Pubblicazione | Post e storie programmati su PostFast | ✅ dal 16 nov (TikTok, YouTube, Facebook; Instagram da collegare) |
| Ogni sera 21:52 | Community | Commenti (casella di PostFast) → riassunto nell'app e risposte in una richiesta «commenti»: le pubblica l'app quando l'editore approva | ✅ dal 16 nov (richieste dal 17 nov) |
| Ogni uscita | Diffusione | Messaggio pronto per protagonista / regista / pagine | ❌ nuovo (punto 5) |
| 1° del mese | Contabilità + direzione | Rendiconto, soglie di monetizzazione, priorità del mese | ❌ nuovo (punto 6) |

## Cosa manca per l'automazione completa (in ordine di importanza)

### 1. Pubblicazione automatica — il pezzo più grosso
**Stato (16 nov 2026): attiva con PostFast** — server MCP in `.mcp.json`, chiave salvata nell'ambiente, procedura in
`SOCIAL.md` «Pubblicazione automatica». Manca solo Instagram (da collegare). Prima: (da circa 10–12 €/mese, API e server MCP su tutti i piani, caricamento
del video con URL firmato: niente link pubblico, il workflow può caricare l'mp4 dopo il render). Collegamento il 16 novembre.
In alternativa resta Metricool a pagamento. Il piano gratuito
pubblica al massimo 20 post al mese (quelli oltre restano in coda e non escono); a noi ne servono circa 43 al mese solo
contando ogni uscita una volta, di più se ogni social conta a parte, più le storie. Intanto si prepara tutto il resto
(link pubblico ai video, testi già nel formato di Metricool), così all'attivazione basta accendere.
Il connettore **Metricool** sa già programmare i post con pubblicazione automatica (`createScheduledPost`, `autoPublish: true`)
su tutti e quattro i profili collegati al brand «In 2 minuti»: Instagram `in.2.minuti`, TikTok `in.2.minuti`, Facebook e YouTube.
Accetta anche le storie Instagram (PNG) e la copertina del video. **Manca solo un link pubblico al file mp4**: MEGA non dà un
link diretto al file, Metricool accetta URL pubblici, Google Drive (se collegato a Metricool) o Dropbox.
- **Cosa devi fare tu:** (a) in Metricool → Impostazioni, collegare **Google Drive** (o Dropbox); (b) creare una cartella
  «In2minuti-pubblicazione» condivisa; (c) darci un modo per caricare lì i video dal workflow GitHub (un account di servizio
  Google come segreto di GitHub, ti guidiamo passo passo) — in alternativa, se il repository è pubblico o accetti un secondo
  repository pubblico solo per i video, il workflow li mette in una *release* GitHub con link diretto, senza nessun account nuovo.
  (d) Verificare che il **piano gratuito di Metricool** basti: ha un limite di post programmati al mese; con 10 uscite a settimana
  × 4 social + storie probabilmente serve il piano a pagamento (la contabilità lo valuta).
  (e) Instagram e TikTok devono essere **account professionali/business** perché la pubblicazione automatica funzioni.
- **Cosa facciamo noi dopo:** il workflow carica anche nella cartella pubblica; il manager, dopo l'approvazione e a video
  pronto, programma ogni post (testo da `<settimana>-social.md`, copertina = fotogramma 0) e la storia del giorno prima;
  l'avviso «📤 programmato» nell'app. Il primo mese con `autoPublish: false` (ti arriva la notifica
  sull'app Metricool e tocchi «pubblica»), poi automatico.
- **Deciso (15 nov): sì, sempre.** Dichiarazione di contenuto IA (`isAigc` TikTok, `isAiGeneratedContent` YouTube, `isAiGenerated` Instagram).
  Voce sintetica e disegni generati: la direzione consiglia di dichiararlo sempre (le piattaforme lo chiedono per la voce IA
  e senza dichiarazione si rischia la monetizzazione).

### 2. Commenti → risposte proposte nell'app
**Risolto il 16 nov con PostFast**: la sua casella legge i commenti di TikTok, Facebook e Instagram (non YouTube). Il testo qui
sotto resta come alternativa.
Metricool dà solo il **numero** dei commenti, non il testo. Per leggere il testo:
- **Instagram e Facebook:** API Graph di Meta (gratuita) con un token di lunga durata della pagina. **Tu:** crei un'app su
  developers.facebook.com (5 minuti, ti guidiamo) e salvi il token come segreto per `graph.facebook.com` quando la sessione
  te lo chiede. Poi l'attività delle 22:00 legge i commenti nuovi, prepara le risposte e le manda nell'app.
- **TikTok:** l'API dei commenti non è aperta agli account normali. Restano gli screenshot (o la casella messaggi di
  Metricool, che però è nei piani a pagamento e non nel connettore).
- **YouTube:** API YouTube Data con chiave Google (gratuita), stesso metodo.
- Le risposte **le pubblichi tu** (regola attuale): rispondere a nome della pagina resta un'azione da editore.
  Più avanti, se vuoi, per le risposte semplici («grazie!», «lo segniamo») si può automatizzare su Instagram.
- La vecchia attività `In 2 minuti – commenti della sera` (`trig_01BoDkG95aQQMp58DqMiAmKu`, Metricool + Telegram) resta spenta:
  la sostituisce dal 16 nov `In 2 minuti – commenti della sera (PostFast)` (`trig_01Vw6J7ybyzKhievG4hvbsgX`, ogni sera 21:52).

### 3. Coda delle produzioni stabile
Oggi ogni produzione programma la successiva con un promemoria: se una sessione si ferma (limite, errore) la catena si
rompe e serve il tuo intervento (è successo il 9, l'11 e il 15 novembre). **Soluzione (la facciamo noi):** un file unico
`calendario/coda.md` (ordine, stato, sessione, scadenza) e **un'attività programmata ogni 2 ore** «Regista della coda» che
legge il file, controlla le sessioni (`get_session`), rispetta max 2 al giorno e 5 ore, fa ripartire quelle ferme e avvia la
successiva. Niente più catene di promemoria.
- **Tu:** niente, solo un sì.

### 4. Unione su main (deciso il 15 nov)
Il video finale ti arriva in chat; **è «pronto» solo quando lo confermi**. Dopo la tua conferma la sessione unisce su main
da sola, senza chiederti altro.

### 5. Diffusione (persone che possono rilanciare)
Per ogni uscita il manager scrive nel `-social.md` una sezione «Diffusione»: chi può essere interessato (protagonista,
regista, attori solo se hanno profili pubblici, distributore o piattaforma dove si vede, pagine di fan, la squadra per lo
sport, il museo per i quadri), i tag da mettere nella didascalia e un **messaggio privato pronto da incollare**. Le menzioni
nei post le mette in automatico la pubblicazione; i messaggi privati li mandi tu (dal tuo telefono, a nome della pagina):
è un contatto con persone reali e deve partire da te. Regole in `SOCIAL.md` «Diffusione».

### 6. Contabilità e monetizzazione
- **Tu:** mandare alla contabilità, una volta, i costi attuali (piano Claude, piano ElevenLabs, IFTTT, MEGA, Metricool,
  dominio o altro) e le date di rinnovo; poi a ogni entrata (bonus, collaborazioni) uno screenshot.
- Noi: `contabilita/conti.md` aggiornato, rendiconto il 1° del mese, avviso se una spesa supera la soglia che decidi.
- Il manager controlla ogni domenica le soglie di monetizzazione (`SOCIAL.md` «Monetizzazione»).

## Riepilogo: le tue azioni una tantum
1. Metricool: collegare Google Drive (o dire sì al repository pubblico per i video) e verificare il piano.
2. Instagram e TikTok in modalità account professionale (se non lo sono già).
3. App Meta per i commenti (token), chiave YouTube Data.
4. Costi attuali alla contabilità.
5. Soglia di spesa oltre cui ti chiediamo (decise il 15 nov: unione dopo la tua conferma del video, dichiarazione IA sempre).
Dopo questo, il tuo lavoro settimanale è: **un «sì» la domenica** e leggere gli avvisi nell'app.
