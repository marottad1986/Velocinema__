# Programmazione delle uscite (team social)

Come si sceglie e si programma cosa pubblicare sulla pagina «In 2 Minuti». Si rilegge ogni domenica, prima di
proporre la settimana.

## Ritmo e orari (vincolante)
- **Ogni giorno alle 17:30** un'uscita principale, a rotazione tra **film**, **serie TV** e **Spiegato semplice**:
  ogni settimana 3 film, 2 serie e 2 Spiegato semplice (si può scambiare un film con una serie se i dati lo chiedono).
- **Sabato e domenica alle 10:00** un'uscita in più: quadri, canzoni, storie vere o storie.
- **Martedì alle 12:30** un'uscita in più: **videogiochi spiegati** (`GIOCHI.md`), dal 17 novembre 2026 (primo episodio
  GTA VI). Orario dai dati Metricool del 15 novembre: TikTok ha picchi alle 10, 12 e 18, Instagram è alto tutto il giorno
  (massimo alle 20); le 12:30 vanno bene su tutti e due e stanno a 5 ore dalle 17:30, senza togliere pubblico all'uscita principale.
- **X Factor (talent spiegati): sempre il mercoledì alle 17:30**, il riepilogo dell'ultimo Live il giorno prima della
  puntata successiva (il giovedì è troppo tardi). Fino alla finale del 3 dicembre: mercoledì 18 (Live 4), 25 (Live 5),
  2 dicembre (Live 6); la finale si riassume il 4 o 5 dicembre.
- 10 uscite a settimana (9 + il videogioco del martedì). Due titoli dello stesso genere (es. due horror) non stanno in giorni vicini.
- Mai ripubblicare un video già uscito sullo stesso canale (elenco in `calendario/pubblicati.md`).

## La domenica alle 15:00
Ogni domenica alle 15:00 (attività programmata che apre da sola una sessione `/manager`) si studia l'andamento, si
programma la settimana che inizia il giorno dopo e si avvia subito la produzione: così i dati sono i più freschi
possibili (fino al sabato; quelli di TikTok arrivano con circa un giorno di ritardo) e la produzione lavora la domenica
per la settimana che viene.
Attività programmata: «In 2 minuti – programmazione della settimana» (`trig_01ErsayWy5XJvQ6RMrpNndyF`), ogni domenica alle
15:05 ora italiana (dopo le 15:00, quando riparte la settimana dei token), apre una sessione nuova con notifica sul telefono.
1. Dati del profilo dal connettore **Metricool** (piano gratuito, brand «In 2 minuti», id `7728942`, fuso Europe/Rome),
   strumento `getAnalyticsDataByMetrics`. Metriche usate:
   - TikTok, per video (`TKPO`): 02 data e ora, 05 descrizione, 07 visualizzazioni, 08 like, 09 commenti, 10 condivisioni;
     andamento (`TKEV`): 07 follower, 08 nuovi follower al giorno.
   - Instagram Reels (`IGRE`): 02 data e ora, 03 testo, 23 visualizzazioni, 10 like, 07 commenti, 21 condivisioni,
     12 salvataggi, 11 copertura, 24 tempo medio di visione (s).
   - YouTube (`YTVP`): con il piano gratuito arrivano solo titoli e date, non i numeri (8 novembre 2026): per YouTube
     l'utente manda i dati di YouTube Studio quando servono.
   - I dati di TikTok arrivano con circa un giorno di ritardo. Se il connettore non risponde, l'utente manda gli screenshot.
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
   - solo i contenuti previsti quel giorno: niente eventi di scadenza della produzione (regola dell'utente, dalla
     settimana 23–29 novembre 2026; le scadenze restano nel file del calendario e nelle sessioni `/produzione`).
5. **Sempre dopo l'approvazione**, si passa il lavoro alla produzione: una sessione `/produzione` per ogni contenuto
   da produrre o da verificare (strumento `create_session`, repository `marottad1986/Velocinema__`), con titolo, giorno
   e ora di uscita, scadenza (video su MEGA entro la sera prima) e l'ordine di avvisare subito l'utente se la data non è
   raggiungibile con la qualità richiesta. Prima si unisce su `main` il calendario, così le sessioni lo trovano.
   Produzioni distanziate (vincolante): al massimo due produzioni al giorno, a 5 ore l'una dall'altra (dalla fine della
   precedente), per restare nei limiti di utilizzo. Le scadenze e l'ordine di avvio si assegnano tenendone conto:
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

## Avvisi all'utente su Telegram (vincolante, manager e produzione)
Gli avvisi arrivano nel gruppo Telegram **in2miniti** via IFTTT: servizio `telegram`, azione `send_message`,
`account_id` `461715660`, campi `chat_id` `"-5515136307"` (il nome del campo è `chat_id`, non `chat`: con un nome
sbagliato l'azione fallisce), `text` e `include_web_page_preview` `"0"`. Dopo l'invio controllare che la risposta sia
`success: true` (in caso di dubbio: `get_activity_feed` con `service_slug` `telegram`). Il testo accetta solo i tag HTML
`b`, `i`, `a`, `br`, `pre`, `code`. Ogni messaggio costa 15 crediti IFTTT: solo gli avvisi qui sotto, niente messaggi di stato intermedi.
Telegram serve solo ad avvisare: l'utente risponde (approvazioni, modifiche) nella chat della sessione, quindi ogni avviso
dice in quale sessione rispondere. Lo stesso contenuto va mandato **anche nella chat della sessione** (SendUserMessage /
SendUserFile), così l'utente lo trova lì quando apre la conversazione.
- **Manager, domenica — proposta pronta**: appena la tabella della settimana è pronta (prima dell'approvazione), un messaggio
  con i dati della settimana in 3–4 righe (follower, video migliore, cosa funziona), le 9 uscite (giorno, ora, titolo, stato)
  e «Rispondi nella sessione del manager per approvare».
- **Manager, domenica — dopo l'approvazione**: un messaggio quando eventi in calendario, sessioni di produzione e materiale
  social sono pronti (elenco delle produzioni avviate, con la scadenza di ciascuna).
- **Produzione — avvio**: appena la sessione di produzione parte (contenuto scelto, ramo creato), un messaggio con titolo,
  formato, data e ora di uscita dal calendario, scadenza prevista e «Rispondi nella sessione di produzione di <titolo>»
  (le domande sul contenuto si fanno lì).
- **Produzione — video pronto**: quando il video finale con la voce è pronto da controllare (controlli verdi e revisori
  APPROVATO), un messaggio con titolo, data di uscita, link alla pull request e cartella MEGA. Nella chat della sessione si
  manda anche il video (`out/<film>-voce.mp4`, o `out/<film>.mp4` se la voce manca) con SendUserFile, così l'utente lo
  guarda subito e dice se va bene. Il video è «pronto» solo dopo la conferma dell'editore; appena conferma, la sessione
  unisce su main da sola senza chiedere altro (`DECISIONI.md`, 15 novembre 2026).
- **Produzione — problema**: se la data di uscita non è raggiungibile con la qualità richiesta, o la sessione è bloccata
  (chiave, connettore, errore), un messaggio subito con il motivo e l'alternativa prevista dal calendario.
Se il connettore IFTTT non è disponibile, si avvisa solo nella chat della sessione (SendUserMessage, e notifica push se c'è).

## Pubblicazione automatica (PostFast)
Dal 16 novembre 2026 i post si programmano con **PostFast** (prova gratuita fino al ~21 novembre, poi piano a pagamento:
lo decide l'editore). Server MCP `postfast` in `.mcp.json` (pacchetto `postfast-mcp@0.15.3`): la chiave è un segreto di
rete dell'ambiente cloud per `api.postfa.st` (intestazione `pf-api-key`, la mette il proxy; nel file c'è solo il segnaposto
`proxy-injected`); in locale si usa la variabile `POSTFAST_API_KEY`. `NODE_USE_ENV_PROXY=1` serve perché Node passi dal proxy:
senza, ogni chiamata risponde «fetch failed». Senza MCP la stessa API si usa con curl su `https://api.postfa.st`
(`/social-media/my-social-accounts`, `/file/get-signed-upload-urls`, `/social-posts`, `/social-inbox/...`).

Profili collegati (`list_accounts`, 16 novembre): TikTok `in.2.minuti` `74dccd93-3694-4f73-8d7e-378ba69c1275`, YouTube
«In 2 minuti» `e19c8b52-a3ad-4858-857d-4157ba3ac8b0`, Facebook `2d7b62df-5e6f-462f-8061-4b0ed59c4ec6`. **Instagram da
collegare** (lo fa l'editore): finché manca, su Instagram pubblica a mano. Prima di programmare, `list_accounts`: mai
programmare su un profilo `DISABLED`.

Quando si programma (vincolante):
- **Solo contenuti approvati e confermati**: la settimana approvata dall'editore e il video «pronto», cioè visto e
  confermato dall'editore (`DECISIONI.md`). Lo fa la sessione di produzione subito dopo la conferma e l'unione su main,
  oppure il manager per i contenuti già pronti. Mai prima.
- Video: `upload_media` con `out/<film>-voce.mp4` (MP4 fino a 250 MB), poi `create_posts` (fino a 15 per chiamata) con
  `scheduledAt` all'ora del calendario in ora italiana (ISO con `+01:00` in inverno), testo dal `calendario/<settimana>-social.md`.
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
- **Il video non si rifà mai per pubblicarlo.** Il workflow «Video su MEGA», dopo il caricamento su MEGA, carica anche
  `<film>-voce.mp4` su PostFast (`scripts/postfast-carica.mjs`) e scrive la chiave in `postfast/<film>.json` sul ramo
  `postfast-media`: la sessione la legge con `git fetch origin postfast-media && git show origin/postfast-media:postfast/<film>.json`
  e la usa in `mediaItems` (`{key, type: "VIDEO", sortOrder: 0}`). Serve il segreto GitHub `POSTFAST_API_KEY`. Se la chiave
  manca (video fatto prima del segreto), si rilancia il workflow per quel film (Actions → «Video su MEGA» → Run workflow).
- Nel cloud gli script Remotion usano il browser locale: `REMOTION_BROWSER=/opt/pw-browsers/chromium` (senza, il download di
  Chrome da remotion.media è bloccato).
- Dopo `create_posts`, `list_posts` con `statuses: SCHEDULED` per controllare; il giorno dopo l'uscita, `statuses: FAILED`:
  un post fallito (`lastError`) si segnala subito su Telegram.
- Avviso Telegram «📤 Programmato»: titolo, data e ora, piattaforme. Va nello stesso messaggio del «video pronto» se
  arriva insieme, per risparmiare crediti IFTTT.

## Commenti della sera (PostFast)
PostFast legge i commenti di TikTok, Facebook e (quando collegato) Instagram, dal collegamento in poi: `get_inbox_unread_count`,
`list_inbox_conversations` (solo non letti), `list_inbox_items`. Ogni sera alle 21:52 un'attività programmata apre una sessione,
prepara un riassunto e le risposte proposte (tono in prima persona plurale, simpatico e costruttivo, niente spoiler senza avviso,
fatti solo verificati, richieste di titoli annotate in «Richieste dai commenti») e le manda in un solo messaggio Telegram.
**Non risponde sui social**: le risposte le pubblica l'editore (o, se lui scrive «ok» nella sessione dei commenti, la
sessione le pubblica con `reply_to_inbox_item`). Mai `set_inbox_item_state` con DELETE senza l'editore. YouTube non ha la
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
| YouTube | Partner Program (base) | 500 iscritti + 3 caricamenti in 90 giorni + 3.000 ore di visione in 12 mesi o 3 milioni di visualizzazioni di Shorts in 90 giorni | dati da YouTube Studio |
| YouTube | Partner Program (pubblicità) | 1.000 iscritti + 4.000 ore in 12 mesi o 10 milioni di visualizzazioni di Shorts in 90 giorni | i video lunghi contano per le ore |
| Instagram | bonus, abbonamenti, regali | su invito o soglie per paese (abbonamenti: 10.000 follower) | – |
| Facebook | monetizzazione dei contenuti | su invito / idoneità nella Meta Business Suite | – |
Cosa conviene (valutato dal manager, deciso dall'editore): i video lunghi di YouTube sono la strada più veloce per le ore di
visione; su TikTok conta superare 1 minuto (già fatto) e la soglia dei 10.000; le collaborazioni (come Mr.goal) portano follower
più dei bonus. Rischi da evitare: musica non nostra nel video (blocca la monetizzazione), immagini o clip dei film,
mancata dichiarazione di contenuto IA dove la piattaforma la chiede. Quando una soglia è vicina (oltre l'80%), avviso su Telegram.

## Diffusione (persone che possono rilanciare il video)
Per ogni uscita, nel `calendario/<settimana>-social.md`, una sezione «Diffusione» quando è fattibile:
- **Chi**: il protagonista se è una persona reale con profilo pubblico (storie vere, sport, talent), regista e autori,
  distributore o piattaforma dove si vede l'opera, museo per i quadri, pagine di fan e community del genere, pagine partner
  (Mr.goal). Solo profili ufficiali verificati.
- **Come**: menzione nella didascalia e tag nel post (li mette la pubblicazione), storia con menzione, collaborazione Instagram
  se c'è un accordo, e un **messaggio privato pronto** da incollare (breve, in prima persona plurale, cosa abbiamo fatto, link,
  nessuna richiesta insistente; offrire di condividerlo, mai chiedere soldi o favori).
- **Chi invia**: i messaggi privati li manda l'editore (sono contatti con persone reali a nome della pagina); la squadra li
  prepara e ricorda il momento giusto (subito dopo l'uscita) con l'avviso Telegram del giorno.
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
| **Sponsorizzabile** | C'è qualcuno che oggi spende per farlo vedere (film al cinema o appena uscito in streaming, nuova stagione, remake o seguito annunciato, gioco in uscita, evento TV)? È questo che porta collaborazioni e soldi (decisione del 16 nov): almeno 4 uscite su 9 a settimana con 2 o 3. |
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
