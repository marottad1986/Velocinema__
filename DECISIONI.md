# Decisioni della direzione

Registro delle decisioni prese dall'editore con la direzione. Ogni reparto lo legge all'inizio della sessione: una
decisione qui vale per tutti finché non viene tolta. Le più recenti in alto. Formato: data · decisione · chi la applica.

- 18 nov 2026 (sera) · **Due video lunghi a settimana e meno uscite deboli** (dalla settimana del 23 novembre).
  Mercoledì e sabato alle 17:30 un video lungo YouTube con il suo trailer verticale alla stessa ora; gli altri cinque giorni
  alle 17:30 solo i formati che rendono (Spiegato semplice, serie a puntate, film con mistero). **Tolti X Factor** (talent
  sospeso, ultimo il Live 4) **e le uscite delle 10:00 di sabato e domenica** (quadri, canzoni, storie vere); restano le uscite
  già programmate fino a domenica 22. Videogiochi spostati al **sabato alle 12:30** (o il formato che li sostituirà; il sabato 17:30 resta il lungo), sotto esame il 29 novembre. Gli episodi verticali di
  un lungo escono come Short dopo il lungo. Nessun giorno di pausa per ora; se la produzione non regge si toglie il giorno
  con la media più bassa (mai mercoledì o sabato). Regole in `SOCIAL.md`, «Ritmo e orari». · manager, produzione, direzione

- 18 nov 2026 · **YouTube deve crescere entro il 31 dicembre, altrimenti l'editore chiude il progetto.** Traguardo accettato
  dall'editore: al 31 dicembre 2026 **almeno 1.000 iscritti** al canale YouTube (oggi 118) **oppure un video lungo oltre le
  10.000 visualizzazioni**. Controlli intermedi nella programmazione della domenica (iscritti e visualizzazioni dei lunghi
  da PostFast) e avviso nell'app a ogni domenica; domenica 13 dicembre se gli iscritti sono sotto 400 la direzione lo dice
  subito all'editore. Leve decise:
  1. **Un video lungo YouTube a settimana** (richiesta dell'editore), dalla settimana del 23 novembre: Spiegato semplice o
     racconto di più episodi (`VIDEO-LUNGO.md`), con il suo trailer verticale nello stesso giorno. È una produzione intera e
     va nel calendario della domenica come prima scelta della settimana; se non c'è un lungo pronto, la settimana non
     parte senza averne avviato uno.
  2. Titoli e descrizioni dei lunghi scritti per la ricerca su YouTube (le parole che la gente cerca: «spiegazione»,
     «finale spiegato», «paradossi spiegati»), non solo per il feed.
  3. Ogni Short dello stesso titolo porta al lungo: l'editore imposta in YouTube Studio il «video correlato» (PostFast non
     lo fa); il manager gli manda l'elenco Short → lungo a ogni uscita.
  4. Instagram (il profilo più grande) spinge YouTube: una storia con il link per ogni lungo.
  Gli Short sono già tutti su YouTube: nessun recupero dell'archivio. · direzione, manager, produzione

- 17 nov 2026 · **Colpi che si sentono anche sotto la voce** (proposta approvata nell'app). Il montaggio della voce
  (`scripts/voce.mjs`) abbassa la musica in due bande divise a 150 Hz: sopra, dove sta la voce, come prima (circa 12–15 dB);
  sotto, dove stanno timpani, cassa e colpi gravi, solo di circa 3–4 dB. Senza voce la musica resta identica. Vale per i
  video montati da oggi; quelli già prodotti non si rigenerano. Chi scrive lo spartito può lasciare i colpi gravi anche
  sotto una frase; i colpi acuti chiave restano meglio nelle pause della voce. · produzione, revisore-musica
- 17 nov 2026 · **Proposte decise nell'app e procedure dell'app in un solo posto.** L'editore approva, rimanda o scarta le
  proposte di `PROPOSTE.md` dall'app «In 2 minuti»; una proposta approvata parte da sola (attività «In 2 minuti – sviluppo
  proposte») o alla prima sessione `/direzione`, che controlla `GET /api/proposte`. Le procedure con l'app (avvisi, video da
  confermare, commenti, proposte) sono raccolte nella skill `app`, che aggiorna la sessione dell'app sul PC dell'editore
  (autorizzata dall'editore a modificare solo le istruzioni che riguardano l'app). · direzione, tutti
- 17 nov 2026 · **Conferme dei video e risposte ai commenti passano dall'app «In 2 minuti».** Video pronto: anteprima a
  540 px, richiesta `video` con `POST /api/richieste` e `PUT /api/media/<id>`, attesa in background con
  `scripts/strumenti/attendi-conferma.sh` (ogni 2 minuti); «approvata» → unione e programmazione, «da rifare» → si legge
  la nota, si corregge e si rifà la richiesta; vale anche la conferma in chat, la prima che arriva. Commenti della sera:
  una richiesta `commenti` con l'`itemId` di PostFast per ogni risposta; le risposte le pubblica l'app all'approvazione,
  non più la sessione. Chiave messa dal proxy, mai scritta. Procedura in `SOCIAL.md`, «Conferme nell'app». · produzione,
  commenti della sera

- 17 nov 2026 · **Ogni decisione nuova o cambiata si porta ovunque.** Quando si prende una decisione, se ne cambia una o
  arriva uno strumento nuovo (es. PostFast), chi la registra controlla e aggiorna nello stesso momento tutto ciò che ne
  dipende: i file delle regole (`CLAUDE.md`, `SOCIAL.md`, `ORGANIZZAZIONE.md`, skill dei reparti) **e le istruzioni delle
  attività programmate** (programmazione della domenica, commenti della sera, dati per l'app, produzioni programmate),
  che non leggono da sole le novità scritte dopo la loro creazione. (Il 17 nov la programmazione della domenica non
  usava ancora PostFast perché creata prima.) · tutti, direzione

- 17 nov 2026 · **I video già prodotti non si toccano mai** (vale per sempre: anche ogni video futuro, una volta prodotto,
  non si rigenera più per modifiche comuni). Modificare il codice comune (libreria `src/lib/`, componenti,
  motore audio, catalogo degli effetti, script), anche una funzione già usata, non rigenera nessun video già fatto: si
  rigenera solo il film i cui file cambiano (`scripts/cambiati.mjs`; tutto solo con `--tutti`, su richiesta dell'editore).
  Le tecniche riuscite vanno nella libreria comune **in autonomia**, senza chiedere conferma, nello stesso ramo del video.
  Attenzione: un film vecchio corretto più avanti si rigenera con la libreria di quel momento; se si cambia il
  comportamento di un elemento usato, si controlla quel film prima di unirlo. · produzione, tutti

- 17 nov 2026 · **Niente «In una frase:» nel finale.** La voce del finale dice il riassunto direttamente, senza annunciarlo
  con «In una frase:» (non piace all'editore). Vale per tutti i video nuovi, Spiegato semplice e lunghi compresi; i video
  già pronti o usciti restano come sono. · produzione

- 17 nov 2026 · **Telegram dismesso: gli avvisi arrivano solo nell'app «In 2 minuti»** (con le notifiche sul telefono)
  e nella chat della sessione. Niente più messaggi Telegram né IFTTT per gli avvisi; IFTTT resta solo per gli eventi di
  Google Calendar. Procedura in `SOCIAL.md`, «Avvisi all'utente nell'app». Sostituisce la decisione del 16 novembre. · tutti

- 17 nov 2026 · **Le 5 ore valgono solo tra produzioni intere, dall'avvio.** Solo voce, correzioni o la coda di una
  produzione del giorno prima non contano e non fanno slittare la produzione prevista, che parte alla sua ora anche se
  un'altra sessione sta ancora finendo. Al massimo due produzioni intere al giorno, la seconda 5 ore dopo l'avvio della
  prima. (Il 17 mattina Scissione non era partita perché c'era da finire solo la voce di Gli anni.) · produzione, manager

- 16 nov 2026 · **Evolversi: ogni video più bello del precedente.** Non si resta statici: chi guarda deve sentire che la
  qualità sale. Ogni produzione parte dal livello già raggiunto (mai sotto), porta almeno un passo avanti visibile o
  udibile deciso prima di disegnare, si confronta con l'ultimo video prima di andare all'editore e scrive cosa ha imparato
  nel registro di `ASTICELLA.md`. · produzione, revisori, direzione
- 16 nov 2026 · **Regole dei trailer.** I trailer verticali dei video lunghi si fanno come trailer di cinema (cold open,
  cartelli sul nero, montaggio che accelera, suspense nel buio, titolo alla fine) con immagini disegnate apposta, non come
  riassunti sulle locandine. Regole e trailer di riferimento (Ritorno al futuro) in `TRAILER.md`. · produzione
- 16 nov 2026 · **Avvisi anche nell'app «In 2 minuti».** Ogni avviso Telegram della squadra si manda, in contemporanea,
  anche all'app (POST a `https://in-2-minuti-gestione.pages.dev/api/avvisi`, JSON con reparto, tipo, titolo, testo, link;
  la chiave la mette il proxy, mai nei file). Telegram per ora resta com'è. Se l'app non risponde lo si dice nell'avviso
  Telegram e il lavoro continua. Procedura in `SOCIAL.md`, «Avvisi». · tutti
- 16 nov 2026 · **L'obiettivo è guadagnare.** Si lavora per ricavi: follower, like e commenti servono, ma i soldi arrivano da
  collaborazioni e sponsorizzazioni, che si ottengono su **uscite attuali** (film al cinema o appena in streaming, nuove
  stagioni, remake, seguiti, serie tratte da film, giochi in uscita, eventi TV). Un titolo vecchio vale per i follower e
  rende anche in soldi solo se ha un aggancio a una novità (seguito, remake, serie, arrivo su una piattaforma). Si parte con
  cautela (l'editore, 16 nov: prima bisogna crescere): **3 uscite a settimana «sponsorizzabili»** (criterio nuovo in `SOCIAL.md`); per ognuna si individuano i diretti
  interessati e si preparano messaggi e mail in `collaborazioni/` (le invia l'editore); si guarda come vanno prima di
  aumentare. · manager, direzione, produzione
- 16 nov 2026 · **Tutti hanno voce in capitolo.** Ogni reparto e ogni agente (revisori compresi) può proporre idee,
  miglioramenti, nuovi colleghi o procedure, risparmi di token a parità di qualità, e segnalare lavoro inutile: si scrive in
  `PROPOSTE.md`. La direzione le porta all'editore, che decide. · tutti
- 16 nov 2026 · **Su MEGA solo il video con la voce.** La versione senza voce (`<film>.mp4`) non si archivia più quando c'è
  `<film>-voce.mp4` (e la vecchia copia senza voce viene tolta da MEGA al passaggio successivo del workflow). Senza voce si
  carica la versione muta come prima, perché è l'unica. Segnalato dall'editore. · workflow, produzione
- 16 nov 2026 · Video lungo: il trailer verticale esce in contemporanea al lungo su tutti i social; la storia 24 ore prima.
  Storie di tutti i video: esattamente 24 ore prima dell'uscita. · manager, pubblicazione
- 16 nov 2026 · PostFast collegato (TikTok, YouTube, Facebook; Instagram in arrivo): si programmano i post dopo la conferma
  del video; i commenti della sera arrivano dalla casella di PostFast. Procedura in `SOCIAL.md`. · produzione, manager
- 15 nov 2026 · **Video lungo di Ritorno al futuro (la trilogia) rimandato:** non esce più mercoledì 18. Si produce dopo
  tutti i video della settimana 16–22 (dopo Conjuring) e si pubblica quando decide l'editore. I tre episodi verticali
  (Parti 1, 2 e 3, già pronti) restano fermi fino al lungo. Intanto le produzioni seguono le regole solite. · produzione, manager
- 15 nov 2026 · Per la pubblicazione automatica si prova **PostFast** al posto di Metricool a pagamento (più economico,
  caricamento diretto del video senza link pubblico). Collegamento e prova il 16 novembre; la prova gratuita scade intorno al 21. · manager, contabilità
- 15 nov 2026 · **Video pronto = visto dall'editore.** A fine produzione (controlli verdi, revisori APPROVATO) la sessione
  manda il video all'editore in chat (e l'avviso nell'app). Solo quando l'editore lo conferma il video è «pronto»: da quel
  momento la sessione unisce su main da sola, senza chiedere altro. · produzione
- 15 nov 2026 · Contenuto IA dichiarato sempre nei post (TikTok `isAigc`, YouTube `isAiGeneratedContent`, Instagram
  `isAiGenerated`) e, finché si pubblica a mano, con l'etichetta IA dell'app. · manager, pubblicazione
- 15 nov 2026 · Metricool a pagamento: si attiva (lo fa l'editore); poi parte la pubblicazione automatica. · contabilità, manager
- 15 nov 2026 · Pubblicazione automatica rimandata: il piano gratuito di Metricool (20 post pubblicati al mese) non basta.
  Parte quando l'editore attiva il piano a pagamento; fino ad allora pubblica l'editore con i testi del `-social.md`. · manager, contabilità
- 15 nov 2026 · Nasce l'organizzazione in reparti (`ORGANIZZAZIONE.md`): direzione, manager, produzione, pubblicazione,
  community e diffusione, contabilità, revisori. Obiettivo: l'editore approva la settimana e supervisiona. · tutti
- 15 nov 2026 · Le idee di format nuovi devono venire dal manager (non dall'editore): ogni domenica almeno una proposta. · manager
- 15 nov 2026 · Per ogni uscita si prevede la diffusione verso persone interessate (protagonista, regista, pagine). · manager
- 15 nov 2026 · Si conservano le procedure tecniche ricorrenti (non i contenuti) per non riscoprirle: `ERRORI.md`, `SOCIAL.md`. · tutti
