# Quadri famosi in 2 minuti

Stessi video verticali dei film (stesso formato, struttura, sovrimpressioni, musica e voce: vedi `CLAUDE.md`),
ma dedicati a un quadro famoso. Ogni quadro è descritto da un file in `quadri/` con lo stesso schema dei film.

## Opere ammesse (vincolante)
- Solo opere di **pubblico dominio**: autore morto da più di 70 anni (oggi: morto prima del 1956).
- Si usa la **riproduzione fotografica fedele dell'originale** (opera piana): in UE non crea nuovi diritti
  (direttiva 2019/790, art. 14). Restano esclusi: foto con cornice o in sala, sculture e opere in 3D,
  immagini dichiarate con licenza non libera dal museo.
- Fonti: scansioni dei musei in pubblico dominio / CC0 (Rijksmuseum, Met, National Gallery of Art, Art Institute
  of Chicago, Paris Musées…), Google Arts & Culture via Wikimedia Commons (modello «PD-Art»).
- Per ogni immagine annotare nel JSON (`opera.fonte`) l'URL della fonte e la licenza; i file stanno in
  `public/quadri/<slug>/` (originale ad alta risoluzione + eventuali piani ritagliati).
- Esclusi finché sono protetti: Picasso, Magritte, Dalí, Hopper, Matisse, Frida Kahlo, Mondrian, Kandinsky…

## Preparare l'immagine
1. Scaricare la scansione più grande dalla fonte indicata nel JSON (`opera.fonte.url`).
2. Ridurla a ~8000 px di lato lungo (oltre, Chromium rallenta o non la carica) e salvarla come
   `public/quadri/<slug>/originale.jpg`:
   `ffmpeg -i scansione.jpg -vf "scale='min(8000,iw)':-2" -q:v 2 public/quadri/<slug>/originale.jpg`
3. Controllare che `aspect` in `src/scenes/<slug>/index.tsx` sia larghezza/altezza dell'immagine
   e verificare i punti dei dettagli con `npm run prova` (sono stime finché non si vede l'immagine vera).
Finché l'immagine manca, le scene mostrano l'avviso «[immagine mancante]» con il percorso atteso.

## Codice
- `src/lib/quadro.tsx`: `<Quadro>` (opera inquadrata con fotogrammi chiave della camera, fondo sfocato,
  sfumature per titolo e sottotitoli) ed effetti: `Alone`, `Riflettore`, `LuceRadente`, `Vortice` (nello spazio
  dell'opera, coordinate in frazioni 0–1) e `OmbraSbarre` (nello spazio dello schermo).
- `src/lib/annotazioni.tsx`: `Richiamo`, `Anello`, `Spirale`, `Traccia`, `Riquadro` dentro `<Annotazioni>` (spazio dello
  schermo); `proietta` (in `quadro.tsx`) porta un punto dell'opera sullo schermo per agganciarli.
- `src/scenes/quadri/Locandina.tsx`: copertina e finale comuni a tutti i quadri.
- `src/scenes/<slug>/index.tsx`: punti dell'opera e una scena per capitolo; registrare il quadro in `src/films.ts`.
- Gli script (`render`, `prova`, `musica`, `voce`) cercano il JSON in `films/` e poi in `quadri/`.

## Tono e annotazioni (vincolante)
- Per un pubblico ampio ma adulto: frasi chiare, nessun gergo, una curiosità per capitolo; niente toni infantili
  (niente cuori, faccine, esclamazioni a raffica). Musica elegante e luminosa; raccolta, non triste, nei momenti difficili.
- I dettagli si indicano in **stile editoriale** (`src/lib/annotazioni.tsx`), non con luci: punto + linea sottile +
  etichetta (occhiello in maiuscoletto nel colore accento e una riga descrittiva), anelli e spirali tratteggiati,
  **riquadri scuri** con piccoli disegni a linea bianca che spiegano (confronti, schemi, mappe, oggetti).
  Ogni annotazione entra con la frase che ne parla e non copre titolo né sottotitoli.
- Copertina: dettaglio dell'opera a tutto schermo, titolo grande in serif (Instrument Serif), autore e anno,
  frase di lancio in corsivo. Finale con titolo in serif e la frase «la prossima volta che lo vedi…».
- Niente persone disegnate.

## Cosa si può fare sull'immagine
- Movimenti di camera lenti (avvicinamento, panoramica) per inquadrare un dettaglio alla volta nel formato
  verticale; parallasse leggera ritagliando l'opera in piani (cielo / sfondo / primo piano).
- Animazioni discrete **sopra** il quadro, coerenti con ciò che è dipinto (luci che tremolano, vortici che
  scorrono, acqua, foschia), che non cambino il significato dell'opera; a fine capitolo il quadro deve tornare
  riconoscibile così com'è.
- Evidenziare un dettaglio (richiamo, anello, scurimento del resto) quando la voce lo nomina.
- Non ridipingere, non aggiungere persone o oggetti che non ci sono, non alterare i colori in modo da falsare l'opera
  (salvo un breve confronto dichiarato, es. «così erano i colori prima che sbiadissero»).
- Le figure umane presenti nel quadro si mostrano: fanno parte dell'opera. Gli elementi disegnati da noi
  (es. una mappa, una lettera) seguono lo stile grafico dei film e restano senza persone.

## Struttura dei capitoli (indicativa, 11 capitoli, 112 s)
1. Il quadro a colpo d'occhio (titolo, autore, anno, dove si trova).
2–4. Chi era il pittore in quel momento e perché lo dipinse.
5–8. I dettagli, uno per capitolo, ognuno con il suo perché.
9. La tecnica (materiali, pennellate, colori).
10. Cosa ne pensava l'autore / come fu accolto.
11. Che fine ha fatto: furti, restauri, dove si trova oggi.

Finale: il quadro intero, «la prossima volta che lo vedi, guarda…» + invito a seguire la pagina.

## Regole sul testo
Valgono quelle dei film (comprensibile a chi non conosce l'opera, persone presentate col loro ruolo, ogni capitolo
spiega il perché). In più:
- solo fatti verificabili; le ipotesi degli storici dell'arte si dicono come ipotesi («secondo alcuni…»);
- citazioni dalle lettere o dai documenti solo se brevi e tradotte, con chi le ha scritte.

## Schema del JSON
Uguale a `films/*.json`, con queste differenze:
- `autore` al posto di `regista`; `anno` = anno dell'opera;
- `opera`: `{ "tecnica", "misure", "museo", "fonte": { "url", "licenza" } }`;
- nei capitoli `scena` descrive **l'inquadratura** (quale parte del quadro, movimento di camera, animazioni sopra).

## Prime opere candidate (tutte libere)
- Van Gogh, *Notte stellata* (1889) — bozza in `quadri/notte-stellata.json`
- Hokusai, *La grande onda di Kanagawa* (1831 ca.)
- Vermeer, *Ragazza con l'orecchino di perla* (1665 ca.)
- Leonardo, *La Gioconda* (1503–1519)
- Caravaggio, *Vocazione di san Matteo* (1600)
- Botticelli, *Nascita di Venere* (1485 ca.)
- Bosch, *Il giardino delle delizie* (1500 ca.)
- Bruegel il Vecchio, *Torre di Babele* (1563)
- Géricault, *La zattera della Medusa* (1819)
- Munch, *L'urlo* (1893)
- Klimt, *Il bacio* (1908)
- Monet, *Impressione, levar del sole* (1872)
