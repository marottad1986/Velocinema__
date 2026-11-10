# Guida qualità immagini (vincolante per ogni scena)

Riferimento visivo: `reference/prova-qualita-uragano/scene-dopo.js` (versione "dopo").
Ogni scena deve raggiungere almeno quel livello. Confronta sempre con `scene-prima.js` per capire la differenza.

## 1. Profondità e parallasse
- Ogni scena ha da 4 a 6 piani: cielo/sfondo, sfondo lontano, piano medio (soggetto), primo piano, particelle davanti alla camera.
- La camera fa un lento movimento laterale (circa ±40 px in tutta la scena) più un leggero zoom (da 1,04 a 1,09).
- I piani si spostano con fattori diversi: sfondo 0,2–0,3; lontano 0,4–0,5; medio 0,6–0,7; primo piano 1,0–1,3; particelle vicine 1,4–2,0.
- Il primo piano può uscire dai bordi: deve incorniciare la scena, non stare al centro.

## 2. Luce
- Cieli e pareti con gradiente verticale (3–4 tappe), mai colori piatti su grandi superfici.
- Ogni fonte di luce (lampade, finestre, faro, fuoco, neon, schermi) ha un alone fatto con gradiente radiale che pulsa leggermente.
- Volumi illuminati di lato: gradiente orizzontale su edifici e oggetti grandi (lato luce chiaro, lato ombra 30–40% più scuro).
- Fasci di luce con gradiente lineare che sfuma a zero. Lampi o cambi di luce al massimo due per scena, mai più di 3 lampi al secondo.
- Bordi illuminati: una linea chiara sottile sul lato rivolto alla luce per staccare le forme dallo sfondo.

## 3. Texture
- Grana leggera fissa su tutto il fotogramma (trama di puntini chiari e scuri, opacità totale 5–8%). Non animarla fotogramma per fotogramma.
- Vignettatura con gradiente radiale scuro ai bordi (opacità massima 50–60%).
- Facoltativo: leggera trama carta sugli sfondi chiari.

## 4. Dettaglio
- Almeno 3 elementi secondari per scena oltre al soggetto (oggetti, crepe, riflessi, finestre accese, piante, insegne).
- Spessore dei contorni coerente: 8–10 px per gli oggetti principali, 4–6 px per i dettagli, nessun contorno sugli elementi lontani o atmosferici.
- Prospettiva coerente tra un capitolo e l'altro: orizzonte tra y 1000 e 1300.
- Riflessi bagnati, lucidi o metallici dove ha senso (scogli bagnati, pavimenti, strumenti).

## 5. Particelle (almeno un tipo per scena)
- Esterni: pioggia su due livelli (lontana sottile e lenta, vicina spessa e veloce), spruzzi, foglie, polvere nel vento, gabbiani.
- Interni: pulviscolo nei fasci di luce, fumo, vapore, note musicali, scintille.
- Notte: stelle che brillano a ritmi diversi, luci della città, lucciole.
- Particelle vicine alla camera più grandi, semitrasparenti e veloci (sfumate con gradiente radiale, non con sfocatura).

## 6. Colore
- Velatura di colore su tutto il fotogramma per dare l'atmosfera del film (opacità 10–15%):
  - Shutter Island: fredda, verde petrolio (#0E3A40).
  - La La Land: calda nelle scene di giorno (#F2C14E), viola-indaco di notte (#2C2456).
  - The Truman Show: azzurro pastello da set televisivo di giorno (#8FD3F4, opacità 10%), blu notte nelle scene di tempesta e di notte (#142235).
  - Cast Away: calda tropicale di giorno sull'isola (#F2B85A, opacità 10%), blu oceano di notte e in tempesta (#0E2A3A),
    blu-grigio invernale a Memphis (#3B4C66).
  - Jurassic Park: verde giungla (#1E4A30, opacità 10%), verde quasi nero di notte e in tempesta (#0F1F17).
  - Harry Potter e la pietra filosofale: blu-viola notturno (#1E1A3A, opacità 12%), caldo dorato di giorno (#E8B04A, 8%).
  - Dark (Spiegato semplice): verde-grigio freddo da bosco bagnato (#2F4A40, opacità 12%); nel 2052 seppia di cenere (#5A4E3C). Unico colore deciso il giallo dell'impermeabile (#F2C230) sugli oggetti chiave.
  - Bohemian Rhapsody: bordeaux da teatro (#3A1028, opacità 12%).
  - Tenet (Spiegato semplice): blu acciaio da dossier (#1E2A3A, opacità 10%); rosso (#E8553F) per il tempo che va avanti, blu (#4FB0EE) per quello invertito.
  - Gli anni (883): tramonto caldo di provincia (#E8913A, opacità 10%), blu sera nelle scene di notte (#1E2448).
  - Stranger Things (stagione 1): blu notte di provincia (#142036, opacità 12%); unico colore caldo il giallo delle lampadine
    e delle lucine (#F5B83D), luce fredda azzurra del Sottosopra (#7FB8D8).
  - Breaking Bad (stagione 1): ocra caldo del deserto di giorno (#D8A040, opacità 10%), blu notte di periferia (#142235), bruno negli interni chiusi (#4A3A1E), rosso nei tramonti di pericolo (#8A3A2A); unico colore deciso il giallo-oro (#F0B53A) sui cristalli e sugli oggetti chiave.
  - Il sesto senso: fredda azzurro-grigia di Filadelfia (#22303E di notte, #3A4450 di giorno, opacità 12–14%); unico colore deciso il rosso (#D0342C) sugli oggetti toccati dall'aldilà.
  - X Factor 2026 (talent spiegati): viola notte da studio televisivo (#2A1E4A, opacità 12%); colori delle squadre sulle luci, oro solo sull'oggetto chiave.
  - Frankenstein Junior: bianco e nero argentato, omaggio al film (#5E6B75, opacità 12%); unico colore deciso il verde-acqua elettrico (#8EF0C8) su fulmini, scariche e oggetti chiave.
  - Hunger Games: grigio-blu di carbone nel Distretto 12 (#2A3038, opacità 12%), oro caldo a Capitol City (#C89A3A, 8%), verde bosco nell'arena (#1E3A2A, 10%; quasi nero di notte #0F1A12); unico colore deciso l'arancione-brace (#F08A2A) sulla freccia, le fiamme e gli oggetti chiave.
- Gli accenti (arancione o giallo) solo sugli elementi narrativi chiave, per guidare l'occhio.

## 7. Prestazioni (anteprima fluida)
- Niente sfocature SVG grandi (feGaussianBlur) né filtri ricalcolati a ogni fotogramma.
- Aloni, nebbia e particelle sfocate si fanno con gradienti radiali.
- Niente modalità di fusione su tutto il fotogramma: usare semplici velature semitrasparenti.

## 8. Criteri di accettazione per ogni scena
- [ ] 4–6 piani con parallasse visibile
- [ ] luce con gradienti e almeno un alone
- [ ] grana fissa e vignettatura
- [ ] almeno 3 dettagli secondari
- [ ] almeno un tipo di particelle in movimento
- [ ] velatura di colore del film
- [ ] nessun personaggio del film
- [ ] anteprima fluida e titolo/sottotitoli leggibili

## 9. Suggerimenti scena per scena

Un file per film in `qualita/<film>.md` (look del film, elementi comuni, suggerimenti per ogni scena): per un film si
leggono solo questo file e quello del film. Un film nuovo aggiunge il suo file qui sotto.

- Shutter Island: `qualita/shutter-island.md`
- La La Land: `qualita/la-la-land.md`
- The Truman Show: `qualita/the-truman-show.md`
- Frankenstein Junior: `qualita/frankenstein-junior.md`
- Interstellar: `qualita/interstellar.md`
- Cast Away: `qualita/cast-away.md`
- Jurassic Park: `qualita/jurassic-park.md`
- Harry Potter e la pietra filosofale: `qualita/harry-potter-pietra-filosofale.md`
- Shining: `qualita/shining.md`
- Titanic: `qualita/titanic.md`
- Joker: `qualita/joker.md`
- Breaking Bad, stagione 1: `qualita/breaking-bad-stagione-1.md`
- The Others: `qualita/the-others.md`
- Stranger Things, stagione 1: `qualita/stranger-things-stagione-1.md`
- Il sesto senso: `qualita/il-sesto-senso.md`
- Dark, stagione 1 (Spiegato semplice, schema): `qualita/dark-stagione-1.md`
- Inception (Spiegato semplice, schema): `qualita/inception.md`
- Tenet (Spiegato semplice, schema): `qualita/tenet.md`
- Bohemian Rhapsody: `qualita/bohemian-rhapsody.md`
- Gli anni (883): `qualita/gli-anni.md`
- X Factor 2026 (talent spiegati, studio e ballottaggi riusabili): `qualita/x-factor-2026.md`
- Hunger Games: `qualita/hunger-games.md`
