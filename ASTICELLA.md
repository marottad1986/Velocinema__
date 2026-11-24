# L'asticella: ogni video più bello del precedente

Regola dell'editore (16 nov 2026, vincolante per ogni produzione): **i video devono migliorare sempre.** Chi guarda la
pagina deve sentire che, andando avanti, la qualità sale: non si resta fermi su una formula che funziona.
`ERRORI.md` è la memoria di cosa non rifare; questo file è la memoria di **cosa abbiamo imparato a fare meglio**.

## Le regole
1. **Mai sotto l'asticella.** Il video nuovo è almeno all'altezza del migliore uscito finora in ogni parte (scene,
   copertina, testo, musica, voce). Prima di iniziare si leggono il registro qui sotto e le ultime 3 righe: le tecniche
   già conquistate sono il punto di partenza, non un extra.
2. **Almeno un passo avanti per produzione.** Ogni video porta almeno **un miglioramento nuovo e visibile** (o udibile)
   rispetto ai precedenti, deciso **prima** di disegnare e scritto nella pull request. Esempi: un tipo di luce o di
   particella mai usato, un movimento di camera nuovo, una transizione dentro la scena, un oggetto con un livello di
   dettaglio mai raggiunto, una copertina più forte in piccolo, un incastro voce–immagine più preciso, uno strumento o un
   colore orchestrale nuovo, un effetto sonoro registrato meglio scelto, un testo con un aggancio iniziale più forte.
   Il passo avanti non deve mai togliere tempo alla cura delle scene né rompere le regole di `CLAUDE.md`.
3. **Confronto prima dell'editore.** Prima di mandare il video all'editore, chi produce mette a confronto la copertina e
   una scena forte del video nuovo con quelle dell'ultimo video dello stesso formato (fotogrammi affiancati) e si chiede:
   «è più bello?». Se no, si rinforza la scena più debole prima di mandarlo. Nel messaggio all'editore una riga dice
   qual è il passo avanti.
4. **Ciò che funziona diventa di tutti.** Una tecnica riuscita si rende riutilizzabile (in `src/lib/elements.tsx`,
   `src/lib/fx.tsx`, negli helper audio) (in autonomia, senza chiedere conferma all'editore; la libreria si può ampliare e modificare: i video già prodotti non si rigenerano mai, `scripts/cambiati.mjs`) e si aggiunge al registro qui sotto, così il video dopo parte già da lì. Se è una
   regola generale, anche in `QUALITA.md` o `BRIEF-SCENA.md`.
5. **Imparare dai dati e dall'editore.** Le osservazioni dell'editore sui video e i dati del team social (`/manager`:
   visualizzazioni, permanenza, commenti) su cosa piace di più diventano righe del registro («la copertina con X ha
   trattenuto di più» → si fa di nuovo e meglio).
6. **I revisori guardano anche avanti.** Oltre a cercare errori, ogni revisore dice nel verdetto se la parte che ha
   controllato è **all'altezza o sotto** il livello del registro, e suggerisce un miglioramento possibile per il video
   dopo (va in `PROPOSTE.md` se riguarda tutti).
7. **Vale anche per i video lunghi e i loro trailer** (editore, 22 nov 2026). Ogni lungo YouTube è più bello del lungo
   precedente e ogni trailer del trailer precedente: si parte dalle righe del registro dei lunghi (e da `YOUTUBE.md` §3–4),
   il passo avanti si decide prima di disegnare e si scrive nella pull request, e il confronto del punto 3 si fa con
   l'ultimo lungo uscito (miniatura 1280×720 anche vista a 320×180, una scena forte e un passaggio tra due scene, in 16:9)
   o con l'ultimo trailer. Il lungo porta almeno un elemento grafico nuovo nella libreria comune e la sua riga qui sotto.
   I revisori (sempre tutti e quattro sui lunghi) dicono nel verdetto se è all'altezza del lungo precedente.

## Registro dei passi avanti
Una riga per produzione, le più recenti in alto: data · contenuto · cosa c'è di nuovo · dove sta il codice da riusare.
La aggiunge chi produce, nello stesso ramo del video, prima dell'unione su main.

- 24 nov 2026 · Zelda, la linea del tempo (Videogiochi spiegati, Spiegato semplice) · **la pergamena miniata che si scrive da sola**: tutto lo schema è un manoscritto medievale chiuso tra due cilindri (primo schema chiaro, di giorno, dopo tanti schemi notturni), la linea del tempo è inchiostro che si scrive con un pennino d'oro acceso in punta, lascia gocce sul foglio e **al bivio si divide da sola in tre rami colorati** che finiscono in tre finestre a sesto acuto miniate (un mondo per ramo: sigillato, sommerso, al crepuscolo); il resto della pagina resta abbozzato a matita finché non arriva il suo capitolo; l'inquadratura finale scopre tutta la pergamena con il calamaio in fondo; nella musica il **motivo che si divide in tre colori** al bivio (tromboni, arpa e glockenspiel, violino solo) e ogni finestra riprende il suo, in un valzer d'arpa a tre quarti · `Pergamena`, `Inchiostro` (tre in parallelo dallo stesso punto = il bivio), `Arco`, `Sigillo`, `curva`, `puntoSu` in `src/lib/pergamena.tsx` (nel catalogo `libreria--interni`). Per il prossimo: alberi genealogici, mappe del tesoro e libri spiegati (Cime tempestose) sulla stessa pergamena.
- 24 nov 2026 · Breaking Bad – stagione 2 · **bianco e nero con un solo colore**: la copertina e l'inizio dell'ultimo capitolo sono disegnati come gli anticipi della stagione, in bianco e nero argentato con il solo rosa dell'orsacchiotto bruciato, e nell'ultimo capitolo il colore torna a poco a poco quando la voce arriva al presente (gli archi si aprono in Sol maggiore nello stesso istante); copertina che è una domanda («perché dal cielo cade un orsacchiotto?») chiusa dal capitolo dello scontro; nella musica un carillon per l'orsacchiotto e un violino solo per Jane · `MonoDefs` e `Mono` in `src/lib/fx.tsx` (filtro leggero, il colore si anima con `amount`; l'oggetto a colori si disegna fuori dal gruppo), orsacchiotto, occhio, piscina e berlina in `src/scenes/breaking-bad-stagione-2/Comuni.tsx`. Per il prossimo: ricordi e anticipi di qualunque film in bianco e nero con l'oggetto chiave a colori.
- 23 nov 2026 · Backrooms spiegato (lungo 16:9, trailer e verticale) · **due viste dello stesso mondo**: la città in sezione come una casa delle bambole (superficie, seminterrato, il Livello 0 a stanze gialle con soffitto e moquette in prospettiva, i livelli della leggenda sotto) e il **corridoio in prospettiva vera** a un punto di fuga che la camera percorre davvero (segmenti dal fondo, carta da parati, moquette bagnata con i riflessi, neon che ronzano e sfarfallano e illuminano il loro tratto, varchi laterali con la stanza accanto, foschia); si passa dall'una all'altra **senza stacchi**, perché il corridoio è disegnato dentro la finestra 16:9 di una stanza (o dello schermo del computer, del televisore, della fessura) che si allarga fino a riempire lo schermo; i neon che si spengono dal fondo verso la camera; tre miniature per «Testa e confronta» generate dal codice; nella musica il colore del «centro commerciale vuoto» (organo d'attesa e marimba lontana sopra il ronzio vero dei neon) · `Corridoio`, `neonAt`, `passi` in `src/lib/liminale.tsx` (nel catalogo `libreria--interni`), finestre in `src/lunghi/backrooms-spiegato/Pov.tsx`, miniature con `node scripts/lunghi/miniature.mjs <slug>` (`miniature` nella scena del lungo). Per il prossimo: la stessa finestra per entrare in un quadro, in uno schermo o in una mappa di qualunque lungo.
- 23 nov 2026 · Donnie Darko spiegato (lungo 16:9) · primo lungo con un mondo unico tutto disegnato apposta: sottotitoli, eventi e musica agganciati ai tempi veri della voce (`voce.frasi` da `ascolta-voce --scrivi-tempi`), scritte e simboli a grandezza fissa sullo schermo e tenuti fuori da titolo, contatore e sottotitoli (`fit()` in `Paese.tsx`), camera senza scatti, cartelli «COLPO DI SCENA», momenti clou con buio e silenzio prima del colpo, tre atti in tonalità diverse. Per il prossimo: `fit()` per gruppi di elementi e controlli automatici delle sovrapposizioni.
- 18 nov 2026 · Ritorno al futuro, la trilogia (video lungo YouTube) · la linea del tempo diventa una **ferrovia vera**:
  traversine e due rotaie parallele anche in curva (maschera larga meno maschera stretta), che si posano da sole, uno
  **scambio con leva e lanterna** che devia il tempo su un binario rosso e lo rimette dritto, e un'onda di luce che corre
  sulle rotaie dal passato al presente; i tre schemi verticali portati nel 16:9 con la loro camera (zoom ridotto, centrati
  sulla stazione) e i lati vivi (anno enorme in contorno, quadrante al neon con le lancette all'indietro); miniatura con
  il quadrante-orologio che contiene la piazza colpita dal fulmine · `Binario`, `Scambio`, `OndaBinario` in
  `src/lib/binari.tsx`, `src/lunghi/ritorno-al-futuro-trilogia/` (Parti.tsx per riusare uno schema verticale nel 16:9).
- 17 nov 2026 · The Conjuring – L'evocazione · il **buio che si esplora**: la scena si disegna tutta illuminata e sopra
  `Buio` la copre di nero tranne dove arriva la luce (il cono di una torcia che cerca e trova, il lume che trema, le
  candele, i flash che aprono la stanza per un istante, l'alba che scioglie il buio); quattro orologi che si fermano
  nello stesso fotogramma accendendosi d'oro, con i pizzicati che tacciono insieme; un motivo da carillon che torna a ogni
  apparizione e si apre in maggiore nel finale; copertina con un carattere nuovo da stampa antica (IM Fell English) ·
  `Buio` in `src/lib/elements.tsx` (nel catalogo `libreria--interni`), `FELL` in `src/lib/fonts.ts`, `Quadrante` e
  `Carillon` in `src/scenes/the-conjuring/Comuni.tsx`.
- 17 nov 2026 · Scissione – stagione 1 (Spiegato semplice) · schema a spaccato verticale con due mondi (fuori/sotto) e la
  camera che scende e risale con l'ascensore; il cerchio del personaggio che si **sdoppia** attraversando la linea della
  scissione e si **riunisce** (Petey); la pianta che si disegna da sola come un progetto; la «lente» sugli schermi (numeri
  che tremano e volano nel cestino); copertina con il corridoio in prospettiva che avanza; neve a due livelli chiusa in un
  riquadro (`Snow`) · `src/scenes/scissione-stagione-1/Piani.tsx` (`Node` con `split`, `Lente`), `Snow` in
  `src/lib/elements.tsx`. Lezioni su musica e voce: timpano forte (`Timpani1_Hit_v4`) sui colpi chiave e il picco del film
  sul colpo di scena; `pausa` che ferma anche gli archi tenuti; frasi degli Spiegato entro 8–9 parole già nella scrittura,
  così la voce non va accelerata oltre il 10%.
- 16 nov 2026 · trailer di Ritorno al futuro (trilogia) · primo trailer di cinema: cartelli sul nero con braam e
  entrata dal nero, montaggio a un'inquadratura per battito, suspense con spia nel buio e immagine che emerge, titolo su
  scie di fuoco · `src/promo/trailer-ritorno-al-futuro/`, regole in `TRAILER.md`.
- 16 nov 2026 · punto di partenza · il livello attuale è quello di `QUALITA.md` (criteri di accettazione), della scena di
  riferimento `reference/prova-qualita-uragano/scene-dopo.js` e delle ultime uscite (Il miglio verde: corridoio comune con
  lampade che scoppiano e sciame che si fa oro; L'Ultima Cena: opera vera animata con annotazioni editoriali in
  `src/lib/annotazioni.tsx`). Da qui in poi ogni produzione aggiunge la sua riga.
