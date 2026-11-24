# Zelda, la linea del tempo (Videogiochi spiegati, Spiegato semplice): suggerimenti per le scene

Parte di `QUALITA.md` (regole generali e criteri di accettazione lì): qui solo il look e i suggerimenti scena per scena.

**Seconda versione** (24 nov, dopo il «da rifare» dell'editore: «qualità grafica scarsa e povera»). La prima versione era
una pergamena chiara con miniature piccole incorniciate: troppo vuoto, oggetti piccoli, look piatto. La seconda è un
**mondo unico a tutto schermo** (`src/scenes/zelda-linea-del-tempo/Mondo.tsx`) che la camera attraversa, percorso da un
filo d'oro (la linea del tempo). Ogni luogo è una scena 1080×1920 con 5–6 piani in parallasse rispetto alla camera:
- ORIGINI (`Origine.tsx`): cielo d'oro con il sole e i raggi, l'isola nel cielo con la torre e la cascata, la tempesta del
  demone (vortice nero, bagliore rosso, fulmini) risucchiata nella spada sullo sperone di roccia sopra il mare di nuvole.
- HYRULE (`Hyrule.tsx`): castello grande in pietra a corsi con torri a cono blu e stendardi, borgo con i comignoli, fiume
  con i riflessi e il ponte, tempio con i battenti e la spada, prato fiorito con l'erba alta ai bordi; rosso con fuochi e
  braci nella conquista, caldo all'alba della vittoria. La Triforza: tre triangoli separati che scendono con i raggi.
- VALLE DEL BIVIO (`Bivio.tsx`, larga sopra i tre mondi): orizzonte diviso in tre colori, campi a scacchi, villaggi e
  mulini, il cerchio di pietre dove il filo si divide in tre fiumi di luce.
- TRE MONDI (`Rami.tsx`): sigillato (cremisi, luna di sangue, castello nero, colonna di fiamma viola, sigillo dei sette
  saggi), sommerso (il mare sale e copre il castello, che resta visibile sott'acqua; isole e barca a vela), crepuscolo
  (sole enorme dietro il castello controluce, varco d'ombra con il bordo d'oro).
- MOLTO DOPO (`Dopo.tsx`): terre selvagge all'ora d'oro, vulcano, rovine, nebbia a strati.
Alla fine la camera si allontana e mostra tutto il mondo come uno schema intero, nel buio stellato.
- Personaggi = cerchi con l'oggetto: spada generica (Link), corona (Zelda), nube di tempesta (Mortipher), fiamma viola (Ganondorf).
- Titolo chiaro su velatura scura in alto. Cartigli in Cinzel con i titoli dei giochi, solo nel loro capitolo.
- Copertina: testata verde con ZELDA in Cinzel, sotto lo stesso Hyrule del video con i tre triangoli nel cielo e il filo
  che arriva al bivio e si apre in tre fiumi di luce.
