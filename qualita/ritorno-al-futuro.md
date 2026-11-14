# Ritorno al futuro (Spiegato semplice, schema): suggerimenti per le scene

Parte di `QUALITA.md` (regole generali e criteri di accettazione lì): qui solo il look del film e i suggerimenti scena per scena.

Lo schema delle linee del tempo (`src/scenes/ritorno-al-futuro/Linee.tsx`) è disegnato su carta da progetto blu, come i
progetti di un inventore: linee chiare, griglia fine e griglia larga, velatura blu notte (#142848, opacità 10%).
Il tempo scende dall'alto in basso lungo la linea degli anni a sinistra: tre stazioni del 1955 (la strada con la casa di
Lorraine e l'albero, il ballo della scuola a fondo marino, la piazza con il tribunale e la torre dell'orologio), il salto
«+30 anni», due stazioni del 1985 (il parcheggio del centro commerciale con i due pini, casa McFly) e il 2015 solo
tratteggiato con un punto di domanda finché Doc non ne arriva. Ogni stazione ha il disegno in alto (540 px) e sotto la
fila dei personaggi (cerchi con l'oggetto, nome e ruolo sotto il cerchio): così i nomi non coprono i disegni.
- Vocabolario fisso: tratteggio giallo spesso (#F5C23A) = viaggio nel tempo, e solo quello; anello rosso = il nodo da
  capire (Lorraine che si innamora di Marty; i figli nel 2015); cartellino pieno = colpo di scena; rosa = Lorraine e i legami d'amore.
- Oggetti: skateboard (Marty), occhialoni (Doc), furgone (i terroristi), quaderno che diventa libro (George), giubbotto
  di pelle (Biff), fiocco (Lorraine), biglietto col cuore (Jennifer).
- L'auto del tempo è una coupé squadrata generica con tre bobine gialle sul retro: mai l'auto del film, né scie di fuoco.
- La foto di famiglia ha tre cerchi (fratello, sorella, Marty): sbiadiscono uno alla volta (capitolo 5) e tornano (capitolo 7).
- Un solo lampo nello schema (il fulmine sulla torre, capitolo 8); nella copertina due colpi (0 s e 2,5 s).
- Copertina: torre dell'orologio colpita dal fulmine, grande quadrante con le lancette all'indietro, auto con le scie
  gialle; titolo in Righteous già completo al fotogramma 0 (è la miniatura).
- Gli eventi usano `at()` arrotondato alla croma della musica (72 bpm), gli stessi istanti dello spartito.
- Lo schema (`Schema`, con `at`, `SHOTS`, `camAt`) si riusa nel video lungo della trilogia con una camera 16:9 propria;
  le parti II e III aggiungono stazioni (1885, 2015) senza cambiare il vocabolario.
