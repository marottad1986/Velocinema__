# Decisioni della direzione

Registro delle decisioni prese dall'editore con la direzione. Ogni reparto lo legge all'inizio della sessione: una
decisione qui vale per tutti finché non viene tolta. Le più recenti in alto. Formato: data · decisione · chi la applica.

- 25 nov 2026 · **Sigla «2M Studios» solo all'inizio dei lunghi YouTube** (editore: «all'inizio solo nel video lungo di
  youtube»; poi «non la devi mettere alla fine del trailer. fallo solo sui video lunghi»). Versione «Zoom»
  (`src/sigla/Sigla.tsx`, 3,5 s) con il jingle orchestrale originale. Lunghi nuovi: `"sigla": true` nel JSON, sigla al
  secondo zero e aggancio subito dopo (cambia `YOUTUBE.md` §2, che vietava sigla e logo all'inizio). **Mai nei trailer**
  né negli altri formati (video verticali, Short promozionali). I lunghi già fatti restano come sono. · produzione, revisori
- 24 nov 2026 · **Più spazio ai format che fanno crescere YouTube** (editore, app: «mi affido a voi»). Ogni domenica il
  manager classifica i format (lunghi per tipo, Spiegato semplice, film, serie, videogiochi, libri…) per iscritti e
  visualizzazioni YouTube portati; un format nuovo si prova almeno 2 volte, poi se è tra i primi tre gli si dà un'uscita in
  più a settimana (al posto del format ultimo in classifica), sempre nei limiti di produzione e di token. La decisione e i
  numeri vanno nel calendario della settimana («Perché»). · manager, direzione

- 24 nov 2026 · **Disponibilità a collaborare tra i criteri di scelta** (editore, app). Per ogni titolo candidato il
  manager cerca, solo su fonti pubbliche, quanto il protagonista, l'autore, il produttore o il distributore risponde e
  rilancia (interazioni con creator e fan, collaborazioni già fatte, condivisioni di contenuti di altri) e lo annota (alta,
  media, bassa) nel calendario: a parità di punteggio vince il titolo con disponibilità più alta. Nessun contatto parte
  dalla squadra: i messaggi li prepara la squadra e li manda l'editore (`SOCIAL.md`, «Diffusione»). · manager

- 24 nov 2026 · **Follower interessanti per collaborazioni** (editore, app). Ogni domenica il manager guarda i nuovi
  follower e chi commenta (PostFast, casella e commenti) e segnala all'editore, nell'avviso della settimana, i profili
  pubblici di giornalisti, scrittori, attori di cinema e teatro, cantanti, musicisti e creator, con un'idea di
  collaborazione per ciascuno (es. un giornalista per un format di attualità, uno scrittore per il format dei libri) e un
  messaggio pronto. Solo profili pubblici; nessun contatto senza il via dell'editore, che li manda lui. · manager

- 24 nov 2026 · **Fonti dei testi non solo Wikipedia** (verifica chiesta dall'editore). Finora i riassunti verticali
  usavano quasi solo Wikipedia italiana e inglese (i lunghi e i talent anche giornali e siti di cinema). Da oggi ogni testo
  nuovo ha nel campo `fonti` **almeno una fonte che non sia Wikipedia** (schede di MyMovies, ComingSoon, FilmTV, Treccani,
  Britannica, il testo originale per i libri, interviste o siti ufficiali), e ogni fatto discusso o colpo di scena si
  conferma su due fonti. Il manager, ogni domenica, cerca sul web gli eventi della settimana (uscite in sala e in
  streaming, anniversari, ricorrenze, eventi TV) e li cita con la fonte nel calendario. · produzione, revisore-testi, manager

- 24 nov 2026 · **Nasce il format dei libri: «Libri spiegati»** (editore, app). Il primo è **Cime tempestose** di Emily
  Brontë, all'inizio della settimana 30 novembre – 6 dicembre; regole in `LIBRI.md`. · manager, produzione

- 24 nov 2026 · **I contenuti già usciti non si rifanno** (editore, in chat). Quando l'editore segnala un errore (o
  arriva dai commenti) su un video già pubblicato, prima si controlla se è già uscito: se sì, non si corregge, non si
  rigenera e non si ripubblica nulla (spreco di tempo e di token). Si scrive solo la lezione in `ERRORI.md` e, se serve,
  la regola o il controllo che evitano l'errore nei video successivi. Si correggono solo i contenuti non ancora usciti. ·
  tutti i reparti

- 24 nov 2026 · **La squadra è autonoma; l'editore solo per le criticità** (editore, in chat). Se tutto va come da
  calendario si applicano le solite regole: produzioni intere, 5 ore tra un avvio e l'altro, storie 24 ore prima. Se
  qualcosa cambia (ritardi, crediti o token finiti, errori, sessioni ferme), la squadra si riorganizza da sola: sposta
  produzioni, usa contenuti già pronti, riprova. Le produzioni si pianificano sui token residui, con una previsione di
  consumo per le uscite successive. L'editore si interpella **solo** per una criticità che non si riesce a risolvere,
  sicuramente quando un'uscita non può essere pubblicata in tempo, e con anticipo (avviso «problema» nell'app con la
  soluzione proposta). Per ora l'editore controlla ancora il video e lo conferma prima della pubblicazione (richiesta
  nell'app); a breve vorrà togliere anche questo passaggio: quando lo deciderà, la pubblicazione sarà automatica dopo i
  controlli e i revisori, e gli errori saranno responsabilità della squadra. Rete di sicurezza: il guardiano delle 9
  (`SOCIAL.md`). · tutti i reparti

- 24 nov 2026 · **Pezzi comuni dei trailer** (proposta dei revisori musica e immagini approvata dall'editore il 23 nov). La
  musica dei trailer nuovi parte da `scripts/audio/trailer-comune.mjs` (cartelli in salita di 1,5 dB, frusciate, archi
  contati dall'inizio della sezione, buio con crescendo, titolo); i mondi dei lunghi nuovi avvolgono tutto in
  `<SenzaTesto attivo={pulito}>` (`src/lib/pulito.tsx`), così il trailer non mostra mai scritte del lungo. I trailer già
  fatti non cambiano. · produzione

- 24 nov 2026 · **Controllo automatico dei lunghi** (proposta dei revisori immagini e musica approvata dall'editore il
  23 nov). `scripts/lunghi/pacchetto.mjs` misura nel browser i testi visibili a ogni frase (`src/lunghi/MisuraTesti.tsx`)
  e scrive in `testi.md` le scritte e i cartelli che si coprono tra loro o coprono titolo e sottotitoli; `livelli.mjs`
  segnala i colpi forti senza il vuoto di almeno 8 dB nel secondo prima. Prima del revisore immagini `testi.md` va
  vuotato (o ogni riga spiegata). · produzione, revisori immagini e musica

- 24 nov 2026 · **Campioni anomali compensati** (proposta del revisore musica approvata dall'editore il 23 nov). Gli
  spartiti nuovi chiamano `compensa(mix)` all'inizio (`scripts/audio/campioni.mjs`): i campioni di spiccato, pizzicato e
  staccato più di 4 dB sopra i vicini dello stesso strato vengono abbassati alla loro mediana (es. la ripetizione delle
  viole spiccato che in Donnie Darko spiegato faceva il picco del film). Niente più correzioni a mano nota per nota; gli
  spartiti già fatti non cambiano. · produzione, revisore-musica

- 24 nov 2026 · **Ogni lungo esce come Prima di YouTube** (proposta del manager approvata dall'editore il 22 nov). Il lungo
  si carica privato con PostFast 24 ore prima; l'editore lo imposta come Prima in YouTube Studio all'ora dell'uscita
  (avviso con i passi nell'app); se a 1 ora dall'uscita la conferma non c'è, si ricarica pubblico come sempre. Niente LIVE
  preregistrate su TikTok; diretta 24/7 su YouTube solo dopo i 1.000 iscritti. Procedura in `SOCIAL.md`. · manager,
  pubblicazione, editore

- 24 nov 2026 · **Livelli della musica anche per i lunghi** (proposta della produzione approvata dall'editore il 22 nov).
  `node scripts/livelli.mjs <lungo>` misura lo spartito delle parti nuove tratto per tratto (buchi, effetti sopra la
  musica, colpi coperti; i ticchettii ripetuti si riassumono in una riga) e `scripts/lunghi/pacchetto.mjs --musica` lo
  aggiunge a `livelli.txt`. · produzione, revisore-musica

- 24 nov 2026 · **Effetti che partono sul silenzio** (proposta dei revisori di Ritorno al futuro approvata dall'editore il
  22 nov). `clip()` avvisa quando una presa parte su più di 0,1 s di silenzio del file e indica il «da» giusto; l'avviso
  conta come quello delle prese oltre la fine: nessuno dei due deve restare in `npm run musica` di un film nuovo. ·
  produzione, revisore-musica

- 24 nov 2026 · **Trascrizioni e clip sempre allineate** (proposte del revisore voce approvate dall'editore il 22 e 23 nov).
  `genera-voce.mjs` scrive `audio/<film>/impronte.json` (testo e velocità di ogni clip): va committato con il film.
  `ascolta-voce.mjs` ritrascrive da solo una clip cambiata e segnala in cima al report le clip da rigenerare perché il
  testo del JSON è cambiato dopo. Per i nomi stranieri la `pronuncia` si decide prima della prima generazione. ·
  produzione, revisore-voce

- 24 nov 2026 · **Dati per vendere** (proposta della direzione approvata dall'editore il 22 nov). Ogni domenica il manager
  scrive in `collaborazioni/numeri.md` le cifre che chiedono gli sponsor: visualizzazioni medie e mediana per video negli
  ultimi 30 giorni, tasso di condivisione e salvataggio, follower per piattaforma; una volta al mese il pubblico per età,
  genere e città dagli screenshot dei pannelli che manda l'editore. Prima riga domenica 29 novembre; il media kit prende i
  numeri da lì. · manager, direzione

- 24 nov 2026 · **Velocità della voce per capitolo** (proposta del revisore voce approvata dall'editore il 22 nov). Un
  capitolo denso può avere `"voce_velocita"` nel JSON (es. 1.08, da 0,7 a 1,2, meglio non oltre 1,10): `genera-voce.mjs`
  genera quella clip già più veloce invece di farla accelerare dopo da `npm run voce`; `ascolta-voce.mjs` suggerisce il
  valore quando l'accelerazione supera l'8%. Obiettivo dei testi nuovi degli Spiegato semplice: circa 2,9 parole/s (il
  massimo resta 3,4). · produzione, revisore-voce, revisore-testi

- 24 nov 2026 · **Colpi coperti visibili subito** (proposta del revisore musica approvata dall'editore il 22 nov). Negli
  spartiti nuovi il silenzio dopo un colpo forte si scrive con `taci(mix, da, a)` (`scripts/audio/campioni.mjs`, all'inizio
  dello spartito): tacciono tutte le note, anche archi tenuti e bordoni, restano colpi ed effetti. `node scripts/livelli.mjs`
  elenca ogni colpo ed effetto breve con il picco contro la sola musica e segnala «coperto» e «musica non tace». Gli
  spartiti già fatti non cambiano. · produzione, revisore-musica

- 25 nov 2026 · **Bollino «GUARDALO SU YOUTUBE» sempre presente nei trailer e nelle storie dei lunghi** (editore, messaggio
  del 24 nov). Dalla fine della miniatura alla chiusura, in alto a sinistra: play generico in un cerchio rosso e la scritta,
  mai il logo di YouTube (resta la regola del 20 nov). `"bollino_youtube": true` nel JSON dei trailer nuovi; regole in
  `TRAILER.md` e `SOCIAL.md`. I trailer già fatti restano come sono. · produzione, manager

- 25 nov 2026 · **Le pronunce del JSON non danno più falsi allarmi sulla voce** (proposta del revisore voce approvata
  dall'editore il 24 nov). `ascolta-voce.mjs` conta come uguale una parola sentita scritta come l'originale di una voce
  `pronuncia` (es. «Hyrule» per «Àirul», «1986» per «millenovecentottantasei»), così i confini tra le frasi restano
  giusti e spariscono i falsi «veloce», «trascinata» e «pausa lunga». Le pronunce restano da ascoltare a orecchio: il
  report non le elenca più come «sentito diverso». · produzione, revisore-voce

- 24 nov 2026 · **Ritmo della voce misurato come si sente nel video** (proposta del revisore voce approvata dall'editore il
  22 nov). `node scripts/strumenti/ascolta-voce.mjs` dà le parole al secondo di ogni clip e di ogni frase anche «nel
  video», cioè dopo le pause accorciate e l'accelerazione di `npm run voce`, e segnala «veloce nel video» oltre 3,4: i
  limiti di ritmo si controllano su quel valore. · produzione, revisore-voce

- 22 nov 2026 · **«Ogni video più bello del precedente» vale anche per i lunghi** (editore). La regola del 16 nov resta
  valida per tutti i formati e si applica in modo esplicito ai video lunghi YouTube e ai loro trailer: ogni lungo parte
  dal livello del lungo precedente, porta almeno un passo avanti deciso prima di disegnare (e un elemento nuovo nella
  libreria comune), si confronta in 16:9 con l'ultimo lungo uscito prima di andare all'editore e scrive la sua riga in
  `ASTICELLA.md` (punto 7). · produzione, revisori, direzione
- 22 nov 2026 · **Revisori sempre attivi sui lunghi**: ogni video lungo YouTube e il suo trailer passano da tutti e quattro i
  revisori (testi, immagini, musica, voce) con le regole del 16:9 (`QUALITA.md` §10 e sezione «Video lunghi» delle istruzioni
  dei revisori), anche quando l'editore ha già visto il video. · produzione
- 20 nov 2026 · **Ogni video invita al canale YouTube** (idea dell'editore dall'app). Video verticali nuovi: nel finale,
  sotto «Commenta con…», la riga scritta «Le spiegazioni complete sono su YouTube» (senza logo né voce, per non perdere
  copertura su TikTok e Instagram; i video già fatti non si rifanno). Didascalie: riga ▶️ prima degli hashtag
  (`calendario/modelli-social.md`). Link al canale YouTube nella bio di TikTok e Instagram: lo mette l'editore.
  · produzione, manager
- 19 nov 2026 · **Programmare appena il video è pronto** (editore, dopo le storie di L'Ultima Cena, Scissione e Conjuring e
  il video di Conjuring trovati non programmati dai commenti della sera). Appena l'editore conferma un video, la stessa
  sessione programma subito su PostFast il video sulle quattro piattaforme e le storie Instagram e Facebook 24 ore prima,
  controlla con `list_posts` e solo dopo scrive «programmato» nel calendario. Procedura in `SOCIAL.md`, «Pubblicazione
  automatica». · produzione, manager
- 19 nov 2026 · **Missione: far crescere il canale YouTube** (editore). In cima a `CLAUDE.md`; ogni mattina alle 9 l'attività
  «In 2 minuti – missione YouTube» (`trig_01SHBRf9LxqHXtBDrDhyFJ3z`, sessione nuova a ogni avvio) manda all'app e alle
  sessioni di produzione attive la missione, gli iscritti con il ritmo necessario, lo stato dei due prossimi lunghi
  (avviso «problema» se uno è in ritardo) e la priorità del giorno.
- 19 nov 2026 · **I lunghi si scelgono sui titoli più cercati su YouTube** (editore). Nessuna produzione parte prima
  della programmazione di domenica 22 novembre, che parte dall'analisi in `calendario/analisi-youtube-2026-11-19.md`
  (suggerimenti di ricerca di YouTube in Italia). La scaletta proposta il 18 sera (Donnie Darko, Interstellar, Lost, Dune)
  **non è approvata**: l'avvio di Donnie Darko del 19 nov è stato annullato. Da quell'analisi: Backrooms e Lost in testa.
  Il manager ripete la stessa analisi ogni domenica prima di proporre i lunghi. L'urlo di Munch in riserva. · direzione,
  manager, produzione

- 19 nov 2026 · **Si punta tutto su YouTube** (decisione dell'editore del 18 nov sera): in Italia è l'unica piattaforma
  che paga le visualizzazioni; sponsorizzazioni e collaborazioni vengono dopo. I lunghi sono il prodotto principale e
  hanno la precedenza su tutto, con un impegno grafico molto più alto. Regole in `YOUTUBE.md`: confezione decisa prima di
  produrre (argomento cercato, titolo, tre miniature per la prova A/B), primi 30 secondi, **lungo nativo** (un racconto
  continuo disegnato per il 16:9, non Short incollati), grafica (mondo unico, inquadrature in profondità, qualcosa che
  cambia ogni 3–5 s, scena nuova ogni 20–30 s, passaggi senza nero, almeno tre momenti clou), spinta dopo l'uscita e
  registro dei dati di ogni lungo. Gli Short delle 17:30 si ricavano il più possibile dai lunghi. · tutti

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
