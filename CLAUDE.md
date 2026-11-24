# Riassunti animati di film in 2 minuti (+ "Spiegato semplice")

> 🎯 **MISSIONE DELLA SQUADRA: far crescere il canale YouTube** (editore, 19 nov 2026). È l'unica fonte di guadagno che può
> rendere sostenibile il progetto: ogni sessione, ogni reparto e ogni decisione serve prima di tutto ai video lunghi
> (`YOUTUBE.md`). Traguardo al 31 dicembre 2026: 1.000 iscritti o un lungo oltre 10.000 visualizzazioni. Ogni mattina alle
> 9 l'attività «In 2 minuti – missione YouTube» ricorda a tutti la missione, i numeri e la priorità del giorno.

Progetto per produrre video verticali (Reel, TikTok, Shorts) che raccontano un film intero in 2 minuti.
Ogni film è descritto da un file in `films/` (titolo, regista, palette, copertina, capitoli, sottotitoli, finale).
Il codice in `reference/` è la versione attuale delle scene, scritta per un altro player: va usato come
riferimento per i disegni e le animazioni, non eseguito così com'è.

Serie parallela con la stessa grafica: **quadri famosi** spiegati in 2 minuti, JSON in `quadri/`.
Regole proprie (solo opere di pubblico dominio, immagine originale animata): vedi `QUADRI.md`.

Serie **talent spiegati** (sospesa dal 18 nov 2026): programmi TV in corso con persone reali (X Factor 2026, un episodio a settimana), JSON in `films/`
con `"tipo": "talent"`. Regole proprie (nessuna persona disegnata, niente canzoni cantate né imitazioni, niente logo,
fatti della gara verificati su fonti, vocabolario visivo fisso): vedi `TALENT.md`.

Serie **videogiochi spiegati**: la storia di un videogioco (come un film, o Spiegato semplice per le storie intricate),
JSON in `films/` con `"tipo": "videogioco"`, uscita fissa il sabato alle 12:30 (fino al 17 nov il martedì). Regole proprie (niente immagini, loghi o
interfacce del gioco, giochi non ancora usciti solo con fatti annunciati ufficialmente): vedi `GIOCHI.md`.

**YouTube è la piattaforma su cui si punta tutto** (unica che paga le visualizzazioni in Italia): strategia, confezione,
ritmo e grafica dei lunghi in `YOUTUBE.md` (vincolante, prima di `VIDEO-LUNGO.md`).
Video **lunghi orizzontali** per YouTube (1920×1080, almeno 8 minuti, più episodi montati in un solo racconto, es. Dark tutta la serie):
JSON in `lunghi/`, composizione separata in `src/lunghi/`, regole proprie (struttura, miniatura, zone sicure 16:9,
griglia musicale tra un episodio e l'altro, capitoli YouTube): vedi `VIDEO-LUNGO.md`.
**Trailer verticali** dei video lunghi (trailer di cinema, non riassunti; immagini disegnate apposta, cartelli, suspense,
titolo alla fine): JSON in `promo/`, regole in `TRAILER.md`.

Programmazione delle uscite (team social: 17:30 ogni giorno, mercoledì e sabato un video lungo YouTube con il suo trailer, sabato 12:30 videogiochi; scelta dei titoli; ogni domenica alle 15:00
la settimana che inizia il giorno dopo, con i dati di Metricool e PostFast, e avvio della produzione; post e storie programmati con PostFast; eventi nel calendario principale di Google Calendar): vedi `SOCIAL.md` e `calendario/`.
Comandi per aprire una sessione: `/manager` (team social media manager), `/produzione` (un video per sessione), `/direzione`
(consigliere dell'editore, diffonde le decisioni) e `/contabilita` (conti); come la squadra usa l'app di gestione dell'editore (avvisi, conferme, commenti, proposte): skill
`app` (`/app`). Organigramma e tabella di marcia verso
l'automazione: `ORGANIZZAZIONE.md`; decisioni valide per tutti: `DECISIONI.md`; errori da non ripetere: `ERRORI.md`.
**Obiettivo del progetto: guadagnare** (collaborazioni e sponsorizzazioni sulle uscite attuali, vedi `DECISIONI.md`).
Ogni sessione e ogni agente, revisori compresi, può proporre miglioramenti, risparmi o nuovi colleghi e segnalare lavoro
inutile: una riga in `PROPOSTE.md` (la direzione la porta all'editore).

## Messaggi dell'editore (vincolante, ogni sessione, dal 18 nov 2026)
L'editore scrive alla squadra dall'app «In 2 minuti» (idee, suggerimenti per le uscite, richieste). **Ogni sessione, di
qualsiasi reparto e anche le attività programmate, appena parte** controlla
`curl -sS "https://in-2-minuti-gestione.pages.dev/api/messaggi?stato=inviato"` (la chiave la mette il proxy).
Per ogni messaggio rivolto al proprio reparto, a `tutti`, oppure a nessuno che se ne stia occupando (in dubbio: lo prende
la sessione corrente) risponde **subito** `POST /api/messaggi/<id>` con `{"stato":"preso in carico","risposta":"chi se ne
occupa, cosa farà e quando"}`, poi **lo lavora subito** (o lo passa subito al reparto giusto) e a lavoro finito
`{"stato":"fatto",…}` o `{"stato":"non fattibile",…}`. **Si rimanda solo se l'editore lo scrive nel testo** (es. «la
prossima settimana», «quando c'è tempo»), e in quel caso la risposta dice quando. Quando l'editore invia un messaggio, l'app
fa partire da sola una sessione (attività «In 2 minuti – proposte approvate», trigger API) con il messaggio nel blocco
`<routine-fire-payload>`: quella sessione lo lavora subito. Procedura completa: skill `app`, punto 6. Un messaggio non deve
mai restare senza risposta.

## Formato (vincolante)
- 1080×1920, 30 o 60 fps, durata esatta 2:00 (120 s).
- Struttura: copertina 4 s + capitoli (112 s in tutto) + finale 4 s.
- **La copertina è anche la miniatura del post e l'aggancio dei primi secondi** (vincolante): il primo fotogramma del video
  è già la copertina completa (titolo leggibile, immagine forte, nessuna dissolvenza dal nero né sigla prima), così sui
  social la miniatura è giusta senza sceglierla a mano. Va curata quanto la scena migliore del film: soggetto chiaro anche
  in piccolo, titolo grande nella zona sicura, contrasto forte. Nei primi 2–3 secondi deve esserci un motivo per
  restare (domanda o promessa nella frase di lancio della voce, un movimento che incuriosisce). Il revisore delle
  immagini controlla il fotogramma 0 e i primi 3 secondi come una scena a sé.
  Nel fotogramma 0 (la miniatura) non c'è la fascia della frase di lancio né altri sottotitoli: solo immagine, etichetta,
  titolo e riga del regista. La frase di lancio entra subito dopo (da ~0,4 s, entrata breve di ~0,3 s) e poi resta.
  Vale per le copertine nuove e per quelle in produzione non ancora disegnate; le copertine già fatte restano come sono.
- Lingua: italiano.

## Le regole più importanti (vincolanti, tutti i contenuti: film, Spiegato semplice, canzoni, quadri, serie)
- **La qualità del video dipende soprattutto da quanto sono curate le scene.** Grafica e dettagli delle immagini
  sono fondamentali: ogni scena va disegnata con la cura dei primi film (Shutter Island, Interstellar, Truman,
  La La Land, Frankenstein Junior), mai di fretta né a gruppi. Prima di ogni film rileggere `BRIEF-SCENA.md`,
  `QUALITA.md` (più `qualita/<film>.md` del film) e la scena di riferimento; una scena alla volta, controllata sui fotogrammi prima di passare alla
  successiva; una sola immagine per capitolo, non più immagini in dissolvenza (nei video verticali; i lunghi 16:9 sono un mondo unico in cui la camera viaggia, `QUALITA.md` §10); oggetti ricchi di dettaglio, non
  schematici. Se un revisore trova problemi di fondo (inquadratura vuota, oggetto illeggibile), si ripensa la scena,
  non si rattoppa. Meglio un film in più giorni che un film meno curato.
- **Evolversi: ogni video più bello del precedente** (regola dell'editore, 16 nov 2026). Mai sotto il livello già
  raggiunto, almeno un passo avanti nuovo per produzione (scene, copertina, testo, musica o voce), confronto con l'ultimo
  video prima di mandarlo all'editore, e ciò che si impara va nel registro di `ASTICELLA.md` (letto all'inizio di ogni
  produzione) e, se riusabile, nella libreria comune. Vale per tutti i formati, **anche per i video lunghi YouTube e i loro
  trailer** (editore, 22 nov 2026): ogni lungo più bello del lungo precedente (`ASTICELLA.md`, punto 7).
- **I testi si scrivono sempre immaginando che lo spettatore non conosca la trama**: chi guarda non ha visto il film
  (o non conosce la canzone, il quadro, la serie) e deve capire tutto solo da quello che sente (regole sotto).

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
- Fatti verificati: ogni fatto della trama citato va confermato su fonti (prima la voce Wikipedia italiana del film, sezione
  «Trama», poi quella inglese o le pagine degli episodi) e il JSON porta il campo `fonti`, una voce per fonte nel formato
  «<fatti confermati>: <url>». `controlli.mjs` lo segnala se manca (errore per le canzoni, `"tipo": "canzone"`).
- Titoli dei capitoli chiari anche fuori contesto.
- Testo discorsivo (tutti i formati): si racconta come a voce a un amico. Ogni frase si aggancia alla precedente con
  connettivi espliciti («perché», «infatti», «intanto», «così», «quindi», «ma», «alla fine»), così i collegamenti li fa
  la voce e chi guarda non deve ricostruirli; anche un capitolo si aggancia al precedente. Niente elenchi secchi di fatti
  né frasi telegrafiche; mai frasi che parlano dello schema o del video stesso (es. «Tutto in due minuti», «Ecco lo schema
  completo»; l'etichetta «IL FILM IN 2 MINUTI» sopra il titolo resta, ma solo nelle copertine dei riassunti di film;
  i riassunti di serie usano «STAGIONE N IN 2 MINUTI»; canzoni, quadri e talent
  usano il nome della serie, «CANZONI SPIEGATE», «QUADRI SPIEGATI», «TALENT SPIEGATI» e «VIDEOGIOCHI SPIEGATI»). Le righe dei sottotitoli sono pezzi dello stesso discorso. L'ultima frase della storia chiude o lascia una
  domanda chiara (per le serie: da dove riparte la stagione dopo).
- Spiegato facile: parole di tutti i giorni, nessun termine tecnico senza spiegarlo subito, una cosa alla volta.
- Queste regole sul testo valgono per tutti i progetti della serie (film, quadri, canzoni, serie TV spiegate…).
- Se si riscrive il testo di un film già disegnato, tenere lo stesso numero di righe per capitolo e lo stesso
  contenuto in ogni riga: scene e spartito agganciano gli eventi all'indice della riga (`cues`).

## Finale (vincolante, tutti i formati)
- Nell'immagine finale, sotto «Metti like» / «Segui la pagina», l'invito a commentare (mai «Il prossimo … arriva presto»):
  riassunti di film → «Commenta con il film che vorresti.»; riassunti di serie (es. Breaking Bad, una stagione per video:
  etichetta «STAGIONE N IN 2 MINUTI», finale «Fine della stagione N») → «Commenta con la serie che vorresti.»; Spiegato semplice → «Commenta con la spiegazione che vorresti.»;
  canzoni → «Commenta con la canzone che vorresti.»; quadri → «Commenta con il quadro che vorresti.»;
  talent spiegati (`TALENT.md`) → «Commenta con chi vorresti in finale.»; videogiochi (`GIOCHI.md`) → «Commenta con il gioco che vorresti.»
- **Invito al canale YouTube** (editore, 20 nov 2026; video verticali nuovi, quelli già fatti restano come sono): nel
  finale, sotto «Commenta con…», una riga piccola solo scritta «Le spiegazioni complete sono su YouTube»: niente logo di
  YouTube, niente voce (TikTok e Instagram mostrano meno i video che portano su altre app, soprattutto con il logo).
  Nelle didascalie la riga ▶️ di `calendario/modelli-social.md`.
- Mai frasi come «La prossima volta che lo vedi…» (né nel finale né altrove).

## Canzoni spiegate (stesso schema dei film)
- Un JSON in `films/` come per i film (es. `films/bohemian-rhapsody.json`) con `"tipo": "canzone"`: `regista` = artista, numero di capitoli libero
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
- Zone coperte dalle app: niente testo nei primi 250 px in alto e negli ultimi 420 px in basso, e nessuna fascia di testo
  nella colonna delle icone a destra (like, commenti, condivisioni: ultimi 180 px, da y ≈ 800 in giù).
- Zona sicura ai lati: TikTok riempie gli schermi più lunghi del 9:16 e taglia fino a ~100 px per lato (Instagram no). Tutti
  i testi fissi stanno tra x 120 e 960: etichetta e titolo del capitolo da x 120, sottotitoli e frase di lancio tra x 120 e 900
  (`maxWidth: 780`), testate e riquadro del finale da x 120 larghi 840. I titoli grandi delle locandine (h1) entrano sempre in
  840 px: se il testo è più largo, `PosterView` in `src/components/Film.tsx` riduce il carattere da solo (misura su canvas).
  Nelle scene gli oggetti chiave stanno lontani dai bordi (lo sfondo ai lati può essere tagliato).

## Riassunti di serie TV (stesso formato dei film)
- Una stagione per video, raccontata come un film: JSON `films/<serie>-stagione-<N>.json` con `"tipo": "serie"` e
  `"stagione": N`, 11 capitoli, etichetta in copertina «STAGIONE N IN 2 MINUTI», finale «Fine della stagione N» con
  «Commenta con la serie che vorresti.». L'ultima frase lascia la domanda da cui riparte la stagione dopo.
- Creature e mostri della serie: mai la sagoma intera né i tratti che li rendono riconoscibili (es. la testa a petali
  del mostro di Stranger Things); si mostrano con tracce e parti generiche nel nostro stile (pareti che si gonfiano,
  bava, cenere, un artiglio non umano che sfonda una membrana).
- Episodi: Breaking Bad stagione 1 (`films/breaking-bad-stagione-1.json`), Stranger Things stagione 1
  (`films/stranger-things-stagione-1.json`).

## Secondo formato: "Spiegato semplice" (film e serie TV)
Trame complesse spiegate nel modo più semplice possibile, «come a un bambino di 5 anni». Valgono tutte le regole
sopra (formato 2:00, stile, contenuti, voce, musica), con queste aggiunte.
- JSON: `"formato": "spiegato"`, `"tipo": "film"` o `"serie"`; per le serie `"stagione": N` e file
  `films/<serie>-stagione-<N>.json` (serie brevi/concluse: un solo file per tutta la serie, senza `stagione`).
  Il campo `regista` resta (per le serie: ideatori o regista principale).
- Struttura: sigla 1,5 s dentro la copertina da 4 s (nome "Spiegato semplice" + badge FILM o SERIE, uguale per tutti
  gli episodi) + capitoli (112 s) + finale 4 s. Dagli episodi nuovi (da Dark stagione 2) niente sigla: `"sigla": false` nel
  JSON, la copertina parte subito e porta «SPIEGATO SEMPLICE · SERIE» (o FILM) in alto; il formato si riconosce dalla playlist. Capitoli più lunghi e meno numerosi (8–10, 11–14 s ciascuno).
- Capitoli per concetti, non per scene: ognuno spiega una sola idea (una regola, un luogo, un colpo di scena) e
  il titolo la dice (es. «La regola dei 33 anni»), in ordine di comprensione.
- Scrittura: frasi brevi (max ~12 parole), parole comuni; ogni idea difficile ha un paragone quotidiano
  (es. «come un ascensore con tre piani»). Ritmo un po' più lento: al massimo 3,4 parole/s contando ogni anno
  a quattro cifre come 4 parole, meglio intorno a 2,9 (obiettivo dei testi nuovi dal 24 nov 2026).
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
- Finale: la voce dice il riassunto in una sola frase (`finale.voce`), senza annunciarlo: mai «In una frase:» davanti
  (decisione dell'editore, 17 nov 2026; i video già usciti restano come sono); per le serie si annuncia la stagione successiva.
- Codice: sigla in `src/components/Sigla.tsx` (la copertina del film riceve `t` già spostato di 1,5 s); linea del tempo
  e cartellini dei personaggi in `src/components/ChapterOverlay.tsx`, attivi quando il JSON ha `linea_tempo` e `personaggi`.
  Episodi: Dark (`films/dark-stagione-1.json`, schema `src/scenes/dark-stagione-1/Albero.tsx`; stagione 2 in
  `films/dark-stagione-2.json`, schema `src/scenes/dark-stagione-2/Nodo.tsx`), Inception
  (`films/inception.json`, schema `src/scenes/inception/Piani.tsx`), Ritorno al futuro parte I
  (`films/ritorno-al-futuro.json`, schema delle linee del tempo `src/scenes/ritorno-al-futuro/Linee.tsx`, da riusare nel lungo della trilogia), parte II (`films/ritorno-al-futuro-parte-2.json`, `src/scenes/ritorno-al-futuro-parte-2/Linee2.tsx`, che importa i pezzi della parte I); Donnie Darko (`films/donnie-darko.json`, schema della copia del mondo `src/scenes/donnie-darko/Copia.tsx`); Scissione stagione 1 (`films/scissione-stagione-1.json`, schema del piano diviso `src/scenes/scissione-stagione-1/Piani.tsx`); musica in `scripts/audio/<slug>.mjs`.
- Priorità: serie intricate (Dark, Lost, Westworld, Severance, Twin Peaks, 1899; una stagione per video se lunghe),
  film (Inception, Tenet, Mulholland Drive, Donnie Darko, Primer). Libri solo dopo ~10 episodi.

## Voce
- I sottotitoli coincidono con il testo voce. Ritmo di riferimento: circa 2,8 parole al secondo
  (circa 28–30 parole per un capitolo da 10–11 s): le voci espressive non reggono ritmi più alti.
- Voce generata con ElevenLabs (modello `eleven_v4`, voce «Brando Vox – Stylish Social Media Voice»), con un piano a pagamento
  per l'uso commerciale: le clip del piano gratuito servono solo per le prove e non vanno pubblicate.
  Testo da incollare senza indicazioni di tono tra parentesi (rallentano la lettura).
  Brando è una voce professionale clonata, addestrata solo su alcuni modelli (`eleven_v4`, `eleven_multilingual_v2`…):
  con un modello su cui non è addestrata (es. `eleven_v3`) la voce cambia. Nel sito i file scaricati finiscono con il modello (`_v4`).
- Clip generate una per capitolo in `audio/<film>/`, nominate `00_copertina`, `01_<id>`, `02_<id>`…
- `node scripts/genera-voce.mjs <film>` genera le clip direttamente con l'API di ElevenLabs, una per
  parte, dal testo del JSON e con voce, modello e impostazioni di `scripts/audio/voce.json` (il `voice_id` si cerca per nome
  la prima volta e si salva lì). Un capitolo denso può avere nel JSON `"voce_velocita": 1.08` (0,7–1,2, meglio non oltre
  1,10): quella clip si genera già più veloce invece di essere accelerata dopo con atempo, che si sente di più
  (`ascolta-voce.mjs` lo suggerisce oltre +8%). Salta le clip già presenti; `--capitolo <id>` (anche `copertina`/`finale`) ne rifà una,
  `--rifai` tutte, `--prova` mostra testi e crediti senza chiamare l'API; `--voci [nome]` e `--modelli` per la configurazione.
  Accanto alle clip scrive `audio/<film>/impronte.json` (impronta del testo e velocità di ogni clip, da tenere nel ramo):
  `ascolta-voce.mjs` segnala le clip rimaste indietro rispetto al JSON e ritrascrive da solo le clip rigenerate.
  Chiave con permessi Text to Speech e Voices: read: in locale in `ELEVENLABS_API_KEY`; nell'ambiente cloud come segreto di rete
  per `api.elevenlabs.io` con intestazione `xi-api-key` (la aggiunge il proxy, lo script non la vede).
- In alternativa una registrazione unica con tutti i capitoli di seguito, separati da una pausa lunga:
  `npm run dividi -- <film> <file>` allinea il testo del JSON alle pause della registrazione, frase per frase, taglia dove inizia ogni capitolo e scrive
  le clip in `audio/<film>/` (`--cartella <dir>` per le prove), mostrando il ritmo di ogni parte per controllare i tagli.
  Un capitolo da rifare si rigenera da solo e si salva col suo nome al posto della clip tagliata.
- Montaggio: ogni clip parte all'inizio del suo capitolo; se sfora, accorciare le pause e accelerare al massimo del 25%
  mantenendo il tono, altrimenti segnalare la frase da accorciare. Musica abbassata sotto la voce.
- `npm run voce -- <film>` → `out/<film>-voce.mp4` (richiede `out/<film>.mp4` già renderizzato con la musica).
  Gli inizi dei capitoli vengono dal JSON (copertina + durate); clip in wav/mp3/m4a/flac/ogg, facoltativa `NN_finale`.
  Toglie il silenzio iniziale e finale di ogni clip (copie ripulite in `out/voce-tmp/`); se la clip sfora, porta le pause
  tra le frasi a 0,25 s e poi accelera con atempo. Lascia 0,1 s prima del capitolo successivo; oltre il +25% non monta
  nulla, esce con errore e indica quante parole togliere e la frase più lunga del capitolo.
  Ducking: `sidechaincompress` della voce sulla musica, in due bande divise a 150 Hz (sopra come sempre, sotto i 150 Hz
  leggero, così timpani e colpi gravi si sentono anche sotto la voce).
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
  si sente la musica accelerare e rallentare). Lo stesso bpm va nel JSON (`"bpm": 72`): le scene ricevono `griglia(s, div)`,
  che arrotonda un istante del capitolo al battito (div 2 = crome), e gli eventi si scrivono già a tempo, es.
  `seg(t, griglia(cues[2] + 0.4), …)`; `controlli.mjs` verifica che il bpm del JSON sia quello dello spartito. Shutter Island 90, Interstellar 72, Truman 78, La La Land 120,
  Frankenstein Junior 104, Cast Away 72, Jurassic Park 70, Harry Potter 96, Shining 66, Titanic 72 (10 s = 3 battute), Joker 96, The Others 72, Il sesto senso 72 (10 s = 3 battute), Breaking Bad stagione 1 96 (10 s = 4 battute); Il miglio verde 72 (10 s = 3 battute; la sedia elettrica e lo sparo in Re minore); The Conjuring 72 (Re minore, gli orologi a crome di pizzicato; l'alba dell'esorcismo in Re maggiore); storia vera Edoardo Bove 72 (il timpano fa da cuore); Spiegato semplice: Inception 68 (sogni profondi a metà passo), Tenet 80 (12 s = 4 battute; la tenaglia a passo doppio), Dark 66 (2052 e 2053 a metà passo, anche la stagione 2); Ritorno al futuro 72 (10 s = 12 battiti, come il video lungo della trilogia; la corsa al fulmine a passo doppio); Donnie Darko 60 (un battito per secondo del contatore dei 28 giorni; il vortice a passo doppio); Scissione stagione 1 72 (pizzicati a crome come un orologio d'ufficio; il piano dei colleghi a passo doppio);
  videogiochi: GTA VI 100 (Spiegato semplice con la mappa di Leonida; il Criminal Profile a passo doppio);
  quadri: Grande onda 88, Notte stellata 92, L'Ultima Cena 72 (Sol minore, si apre in Si bemolle nel restauro);
  Bohemian Rhapsody 70 (opera e rock a passo doppio, 140), Gli anni 600/7 ≈ 85,7 (14 s = 5 battute).
- Effetti sonori registrati: `scripts/audio/effetti.mjs` (archivio CC0 di Craig Smith, USC / Sunset Editorial, "SSE Library"
  e "Red Library" su archive.org), scaricati in `campioni/effetti/`; `clip(mix, id, { t, da, durata, gain, lp, largo… })`
  suona un tratto del file (da/durata = presa scelta). Per aggiungere un effetto: voce nel `CATALOGO` con il picco del file.
  Lo spartito esporta `effetti` (id da scaricare). I tappeti (pioggia, vento, fuoco) restano sotto la musica, i colpi sopra.
  Un effetto nuovo si aggiunge al catalogo e si usa solo nel film che si sta producendo (le voci esistenti non si modificano):
  così il workflow rigenera solo quel film. Se può servire ad altri film, proporre a quali; si applica solo dopo il via libera.
- Tutti i film usano orchestra campionata ed effetti registrati (timpani veri da VCSL in Frankenstein Junior). Restano sintetici solo pochi suoni senza un buon
  equivalente registrato (gesso, spazzole jazz, bip Morse, neon, cambio canale, risucchio). Per tarare i volumi
  confrontare musica ed effetti misurati separatamente; i vecchi strumenti sintetici di synth.mjs non vanno più usati
  per la musica.
- Prima del revisore musica, controllo da fare da sé: ogni evento visibile importante ha il suo suono (e viceversa);
  dopo un colpo forte la musica tace almeno un battito (negli spartiti nuovi `taci(mix, da, a)` di `campioni.mjs` zittisce
  anche archi tenuti e bordoni; `node scripts/livelli.mjs` segnala colpi «coperti» e «musica non tace»); negli spartiti
  nuovi anche `compensa(mix)` (stesso file), che abbassa i campioni di spiccato, pizzicato e staccato molto più forti dei
  vicini (elenco: `node scripts/audio/campioni.mjs --anomalie`); i tappeti stanno sotto la musica; nessun avviso «ATTENZIONE
  effetto … presa oltre la fine» né «… parte su … s di silenzio» da `npm run musica` (li stampa `clip()` quando
  `da`+`durata` supera il file o quando la presa parte su più di 0,1 s di silenzio: il suono arriverebbe in ritardo); il cambio
  di carattere (es. il maggiore del finale) cade con l'evento visivo, non sulla battuta prima.
- `node scripts/livelli.mjs <film> [--finestre]`: livelli per capitolo di mix, sola musica e soli effetti (con la stessa
  normalizzazione), buchi e tratti in cui gli effetti coprono la musica: da usare per tarare i volumi.
- `npm run musica -- <film>` → `out/<film>-musica.wav`. `npm run render` la rigenera e la unisce al video con ffmpeg
  (anche per un solo capitolo, col tratto di musica corrispondente). Film senza spartito: video muto, con avviso.

## Comandi
- Generare il video di un film (con musica): es. `npm run render -- shutter-island` → `out/shutter-island.mp4`.
- Solo la musica: es. `npm run musica -- shutter-island` → `out/shutter-island-musica.wav`.
- Montare la voce: es. `npm run voce -- shutter-island` → `out/shutter-island-voce.mp4`.
- Node e ffmpeg/ffprobe devono essere nel PATH (in PowerShell, se mancano:
  `$env:Path = [Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [Environment]::GetEnvironmentVariable("Path","User")`).
- Creare un nuovo film: scrivere `films/<nome>.json` seguendo lo schema dei due esistenti.
- Speciali (Halloween, Natale…): `"speciale": "Halloween"` nella `copertina` del JSON mette il bollino «SPECIALE HALLOWEEN»
  accanto all'etichetta (`src/components/Speciale.tsx`); niente nella voce né nel disegno, così togliendo il campo il video torna normale.
- Archivio su MEGA (`.github/workflows/video-mega.yml`): a ogni push su main GitHub Actions rigenera i film toccati
  (`scripts/cambiati.mjs`: solo i film i cui file propri cambiano, più il video lungo che contiene un episodio cambiato; i video già prodotti non si toccano mai, nemmeno quando si modifica codice comune che usano: libreria, componenti, motore audio, catalogo degli effetti, script) e carica `<film>-voce.mp4` in `/Velocinema/<film>/` (`<film>.mp4` senza voce solo se le clip voce non ci sono).
  Clip voce lette da `/Velocinema/<film>/voce/` su MEGA (o da `audio/<film>/`). Segreti `MEGA_EMAIL`, `MEGA_PASSWORD`.
  A mano: Actions → "Video su MEGA" → Run workflow.

## Metodo di lavoro e controllo qualità (vincolante)
- Si parte sempre da `main`: una conversazione e un ramo per film (o per modifica), una pull request per film.
  Tra un film e l'altro si comprime la conversazione (o se ne apre una nuova): il contesto dei film già fatti non serve.
  Niente rami paralleli di lunga durata: a lavoro finito si unisce su main.
- **Produzioni distanziate (vincolante):** contano solo le **produzioni intere** (un contenuto nuovo: testo, scene, musica, voce); al massimo due al giorno, e la seconda parte 5 ore dopo l'**avvio** della precedente, per restare nei limiti di utilizzo. I **lavori piccoli** non contano e non fanno aspettare nessuno: aggiungere o rifare la voce, correzioni dopo i revisori o l'editore, finire la mattina una produzione rimasta aperta dal giorno prima, unione su main e programmazione dei post. La produzione prevista dal calendario parte alla sua ora anche se un'altra sessione sta ancora finendo (le due possono girare insieme). Se l'ora non è ancora arrivata, la sessione fissa un promemoria (`send_later`) e riparte da sola a quell'ora.
- `node scripts/controlli.mjs [<film>...]` (`scripts/controlli.mjs`): regole verificabili in automatico (durata 2:00, ritmo della
  voce, frasi vietate, finale con «Commenta con…», scene registrate, musica con strumenti campionati e senza note()
  sintetiche, strumenti ed effetti dichiarati, agganci a capitoli e frasi esistenti, un solo tempo). Gira anche nel
  workflow MEGA prima del render: con un errore il video di quel film non viene fatto. Una regola nuova che si può
  verificare in automatico va aggiunta anche lì, così vale per tutti i film già fatti.
- Prima della pull request di un film nuovo o modificato, i quattro revisori in `.claude/agents/` (subagenti):
  `revisore-testi` (legge da spettatore che non ha visto il film), `revisore-immagini` (fotogrammi di prova contro
  QUALITA.md), `revisore-musica` (sincronia, livelli, strumenti veri), `revisore-voce` (pronuncia, cadenza e volume delle clip ElevenLabs,
  misurati con `node scripts/strumenti/ascolta-voce.mjs <film>`). Si chiamano solo quelli della parte toccata.
  Prima di chiamarli: `node scripts/pacchetto.mjs <film> [--musica]` prepara in `out/revisione/<film>/` i fotogrammi
  affiancati di ogni capitolo nei momenti degli eventi, `tempi.md` (istanti delle frasi) e `livelli.txt`; nel messaggio al
  revisore si indica il pacchetto e, per ogni scena, gli eventi agganciati a ogni frase. Il revisore parte da lì e fa
  altri fotogrammi o misure solo se ha un dubbio. Prima ancora, il controllo da sé di BRIEF-SCENA §5 e di «Musica».
  La pull request riporta i verdetti; si unisce solo con controlli verdi e revisori APPROVATO (o con i punti aperti
  spiegati nella pull request).
- **Immagini viste prima dall'utente (vincolante):** prima di chiamare `revisore-immagini`, il video con la voce
  (`out/<film>-voce.mp4`) si manda all'utente nella chat della sessione (SendUserFile) e si aspetta la sua risposta. Se lo
  approva, il revisore delle immagini non si chiama e la pull request riporta «Immagini: approvate dall'utente»; se chiede
  modifiche, si applicano e si rimanda il video. Il revisore delle immagini si chiama solo se l'utente lo chiede. **Eccezione: video lunghi e loro trailer** (editore, 22 nov 2026):
  sempre tutti e quattro i revisori, immagini compresi, con le regole del 16:9 (`QUALITA.md` §10).
- **Video pronto da confermare nell'app (vincolante, dal 17 nov 2026):** quando il video con la voce è pronto (controlli
  verdi, revisori APPROVATO), la conferma dell'editore passa dall'app «In 2 minuti»: anteprima leggera a 540 px (sotto 24 MB),
  richiesta `POST /api/richieste` di tipo `video`, `PUT /api/media/<id>` con l'anteprima, poi attesa in background con
  `bash scripts/strumenti/attendi-conferma.sh <id>` (controlla ogni 2 minuti; se resta aperta, `send_later` fra 60 minuti e di nuovo: l'attesa non scade mai; rete di sicurezza `scripts/strumenti/conferme-in-sospeso.mjs`). `approvata` → unione su main e programmazione;
  `da rifare` → si legge `risposta.nota`, si corregge e si rifà la richiesta. Vale anche la conferma scritta in chat (la
  prima che arriva). La chiave la mette il proxy, mai scriverla. Procedura completa in `SOCIAL.md`, «Conferme nell'app».
  Anche le risposte ai commenti della sera passano da una richiesta `commenti` e le pubblica l'app, non la sessione.
- Secondo passaggio dei revisori: solo se dopo il primo si è modificato qualcosa, e solo sulle parti modificate (le scene
  ridisegnate o ritoccate, le righe di testo cambiate, i tratti di musica ed effetti toccati), non su tutto il film: ciò
  che non è cambiato resta approvato dal primo passaggio. Nel messaggio al revisore elencare con precisione cosa è cambiato
  (pacchetto con `--capitoli` solo delle scene modificate).

## Struttura del codice (Remotion, 30 fps)
- **Per disegnare scene (anche di un film nuovo) seguire `BRIEF-SCENA.md`**: metodo, scheletro, errori da evitare, verifica.
- `src/lib/elements.tsx`: libreria di elementi animati riutilizzabili (ogni tecnica riuscita ci va in autonomia, senza chiedere conferma; aggiungere o modificare elementi non rigenera i video già prodotti) (pioggia, nebbia, fumo, fuoco, aloni, fasci, mare, stelle, note, neon…); catalogo visivo nelle composizioni `libreria--esterni` e `libreria--interni` (`src/lib/Catalogo.tsx`).
- Le scene ricevono `cues` (secondo d'inizio di ogni frase dei sottotitoli) per sincronizzare gli eventi con la voce.
- `src/films.ts`: registro dei film (JSON + scene disegnate). Le scene mancanti compaiono come segnaposto.
- `src/scenes/<film>/<Scena>.tsx`: una scena per capitolo; `index.ts` mappa id capitolo → componente + posizione titolo.
- `src/components/ChapterOverlay.tsx`: barra, etichetta, titolo, sottotitoli. `src/lib/anim.ts`: camera/parallasse e utilità del tempo. `src/lib/fx.tsx`: grana, vignettatura, velatura, gradienti.
- Le props delle composizioni devono essere JSON (si passa lo slug del film, non l'oggetto).
- Comandi: `node scripts/pacchetto.mjs <film> [--capitoli a,b] [--musica]` (materiale per i revisori), `npm run studio` (anteprima, senza musica), `npm run render -- <film> [capitolo]`, `npm run prova -- <film> <capitolo> [secondi...]` (PNG in `out/prova/`), `npm run musica -- <film>`, `npm run dividi -- <film> <file>`, `node scripts/genera-voce.mjs <film>`, `node scripts/strumenti/ascolta-voce.mjs <film> [--capitoli a,b]` (pronuncia e cadenza della voce, report in `out/revisione/<film>/voce.md`), `npm run voce -- <film>`.
- Audio: `scripts/musica.mjs`, `scripts/voce.mjs`, `scripts/genera-voce.mjs`, `scripts/audio/` (sintetizzatore, spartiti, tempi dal JSON e helper ffmpeg in `film.mjs`).

## Tecnologia suggerita
Remotion (React) per comporre e renderizzare i video, ffmpeg per audio e montaggio voce.
Se si sceglie un'altra soluzione, mantenere il principio: ogni fotogramma è funzione del tempo
(rendering deterministico).
