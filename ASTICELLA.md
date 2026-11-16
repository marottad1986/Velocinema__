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
   `src/lib/fx.tsx`, negli helper audio) e si aggiunge al registro qui sotto, così il video dopo parte già da lì. Se è una
   regola generale, anche in `QUALITA.md` o `BRIEF-SCENA.md`.
5. **Imparare dai dati e dall'editore.** Le osservazioni dell'editore sui video e i dati del team social (`/manager`:
   visualizzazioni, permanenza, commenti) su cosa piace di più diventano righe del registro («la copertina con X ha
   trattenuto di più» → si fa di nuovo e meglio).
6. **I revisori guardano anche avanti.** Oltre a cercare errori, ogni revisore dice nel verdetto se la parte che ha
   controllato è **all'altezza o sotto** il livello del registro, e suggerisce un miglioramento possibile per il video
   dopo (va in `PROPOSTE.md` se riguarda tutti).

## Registro dei passi avanti
Una riga per produzione, le più recenti in alto: data · contenuto · cosa c'è di nuovo · dove sta il codice da riusare.
La aggiunge chi produce, nello stesso ramo del video, prima dell'unione su main.

- 16 nov 2026 · trailer di Ritorno al futuro (trilogia) · primo trailer di cinema: cartelli sul nero con braam e
  entrata dal nero, montaggio a un'inquadratura per battito, suspense con spia nel buio e immagine che emerge, titolo su
  scie di fuoco · `src/promo/trailer-ritorno-al-futuro/`, regole in `TRAILER.md`.
- 16 nov 2026 · punto di partenza · il livello attuale è quello di `QUALITA.md` (criteri di accettazione), della scena di
  riferimento `reference/prova-qualita-uragano/scene-dopo.js` e delle ultime uscite (Il miglio verde: corridoio comune con
  lampade che scoppiano e sciame che si fa oro; L'Ultima Cena: opera vera animata con annotazioni editoriali in
  `src/lib/annotazioni.tsx`). Da qui in poi ogni produzione aggiunge la sua riga.
