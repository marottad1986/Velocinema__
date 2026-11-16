# Ritorno al futuro (Spiegato semplice, schema): suggerimenti per le scene

Parte di `QUALITA.md` (regole generali e criteri di accettazione lì): qui solo il look del film e i suggerimenti scena per scena.

Lo schema delle linee del tempo (`src/scenes/ritorno-al-futuro/Linee.tsx`) ha un look proprio, fatto delle due epoche del
film (non la carta da progetto blu di Inception): il fondo è una notte anni '80 viola con griglia magenta; le stazioni
del 1955 sono cartoline stampate (carta crema #F3E6C8, inchiostro seppia #3B2A1F, pastelli anni '50: verde menta, rosa,
celeste), quelle del 1985 sono notti al neon (fondo viola scuro, linee ciano #5CF0FF, luci magenta #FF4FB0), il 2015 è
solo un abbozzo grigio tratteggiato. Velatura viola notte (#1A1238, opacità 10%). Le stazioni lontane dall'inquadratura
restano più scure. Il tempo scende dall'alto in basso lungo la linea degli anni a sinistra: tre stazioni del 1955 (la
strada con la casa di Lorraine e l'albero, il ballo della scuola a fondo marino, la piazza con il tribunale e la torre
dell'orologio), il salto «+30 anni», due stazioni del 1985 (il parcheggio del centro commerciale con i due pini, casa
McFly) e il 2015 con un punto di domanda finché Doc non ne arriva. Ogni stazione ha il disegno in alto (540 px) e sotto
la fila dei personaggi (cerchi con l'oggetto, nome e ruolo sotto il cerchio; sulle cartoline del 1955 scritti a inchiostro).
- Vocabolario fisso: tratteggio giallo spesso (#F5C23A) = viaggio nel tempo, e solo quello; anello rosso = il nodo da
  capire (Lorraine che si innamora di Marty; i figli nel 2015); cartellino pieno = colpo di scena; rosa = Lorraine e i legami d'amore.
- Oggetti: skateboard (Marty), occhialoni (Doc), furgone (i terroristi), quaderno che diventa libro (George), giubbotto
  di pelle (Biff), fiocco (Lorraine), biglietto col cuore (Jennifer).
- L'auto del tempo è una coupé squadrata generica con tre bobine gialle sul retro: mai l'auto del film, né scie di fuoco.
  Eccezione decisa dall'editore il 16 novembre 2026: le scie di fuoco sulla strada sono ammesse nel trailer della trilogia
  (`src/promo/trailer-ritorno-al-futuro/Scie.tsx`), disegnate nel nostro stile (lingue di fuoco a tre colori con contorno scuro).
- La foto di famiglia ha tre cerchi (fratello, sorella, Marty): sbiadiscono uno alla volta (capitolo 5) e tornano (capitolo 7).
- Un solo lampo nello schema (il fulmine sulla torre, capitolo 8); nella copertina due colpi (0 s e 2,5 s).
- Copertina: le due epoche insieme: tribunale e torre stampati come una cartolina anni '50, colpiti dal fulmine, dentro
  una notte al neon anni '80 (cielo viola-magenta, quadrante ciano con le lancette all'indietro, strada a griglia magenta),
  auto con le scie gialle; titolo in Righteous già completo al fotogramma 0 (è la miniatura).
- Gli eventi usano `at()` arrotondato alla croma della musica (72 bpm), gli stessi istanti dello spartito.
- Lo schema (`Schema`, con `at`, `SHOTS`, `camAt`) si riusa nel video lungo della trilogia con una camera 16:9 propria;
  le parti II e III aggiungono stazioni (1885, 2015) senza cambiare il vocabolario.

## Parte 2 (`src/scenes/ritorno-al-futuro-parte-2/Linee2.tsx`)
Stesso schema e stessi pezzi della Parte 1 (importati da `Linee.tsx`, mai copiati). Stazioni dall'alto: 1885 (paese di
legno, fotografia seppia, tratteggiato finché Doc non ci finisce), 1955 piazza (la cartolina della Parte 1), 1985 casa McFly
(neon ciano), 1985 alternativo (neon rosso su bordeaux, il casinò di Biff al posto della torre, un bidone che brucia),
2015 (dépliant color menta, auto che volano sulle corsie del cielo, il negozio di oggetti d'epoca).
- Il 1985 alternativo è un ramo: dalla linea degli anni, sotto il 1955, si stacca un binario rosso tratteggiato che porta
  alla sua stazione; quando l'almanacco brucia, binario e stazione si spengono.
- L'almanacco (copertina blu e oro, «1950 · 2000») è l'oggetto chiave: dalla vetrina al cestino, al vecchio Biff, al Biff
  del 1955, a Marty, al fuoco.
- Copertina: l'almanacco che fluttua davanti a Hill Valley divisa da una crepa gialla (a sinistra la torre in cartolina,
  a destra il casinò al neon rosso), cartellino «PARTE 2».
