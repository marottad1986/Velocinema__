# Guida qualità immagini (vincolante per ogni scena)

Riferimento visivo: `reference/prova-qualita-uragano/scene-dopo.js` (versione "dopo").

> I numeri delle sezioni 1–8 sono del verticale 9:16 (1080×1920). Per i **video lunghi 16:9** valgono le sezioni 2, 3, 5,
> 6 e 7 così come sono e il dettaglio della 4; camera, piani, zone e criteri sono quelli della **sezione 10**.
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

## 2b. Tavola di stile della casa (vincolante dal 25 nov 2026, decisione dell'editore)
Serve a far riconoscere un video di «In 2 minuti» a colpo d'occhio. Esempio: `src/prove/disegnatore/RapimentoNuovo.tsx`
(«Rapiti nel deserto» ridisegnato, confronto approvato dall'editore). Ogni scena ne usa almeno quattro.
- **Contorni**: 8–10 px colore scuro del film sugli oggetti principali, 4–6 px sui dettagli, nessuno sui piani lontani.
- **Filo di luce**: sul lato rivolto alla fonte di luce una linea chiara di 2–4 px (bordi di tetti, pali, sassi, lenti):
  stacca le forme dallo sfondo anche in controluce.
- **Luce che ha una direzione**: si decide dov'è la fonte (sole basso, finestra, lampione) e tutto la rispetta. Il
  controluce (sole dietro il soggetto, facce verso la camera in ombra calda) è la scelta preferita per gli esterni.
- **Ombre portate lunghe**, colorate (viola-bruno o blu notte, opacità ~0,45), mai nere, coerenti con la fonte.
- **Prospettiva aerea**: più lontano = più chiaro, più freddo o più viola, senza contorni.
- **Un punto di fuga dichiarato** (strada, binari, corridoio, fila di pali o lampioni) che porta l'occhio al soggetto.
- **Materiali che si riconoscono**: intonaco crepato con i mattoni sotto, legno con le venature, lamiera ondulata, vetro
  che riflette il cielo, metallo con il riflesso.
- **Firme ricorrenti**: la finestra accesa con la luce che cade sul terreno; la polvere (o il pulviscolo) che brilla nella
  luce; il cielo riflesso in un vetro o in una lente; il primo piano che entra dal bordo (piante, pali, tende); l'accento
  del film solo sull'oggetto chiave.

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
  - Breaking Bad (stagione 2): come la stagione 1; gli anticipi (copertina, inizio dell'ultimo capitolo) in bianco e nero argentato (`Mono`) con un solo colore, il rosa dell'orsacchiotto (#EE8FB4).
  - Il sesto senso: fredda azzurro-grigia di Filadelfia (#22303E di notte, #3A4450 di giorno, opacità 12–14%); unico colore deciso il rosso (#D0342C) sugli oggetti toccati dall'aldilà.
  - Edoardo Bove – «In un battito» (storia vera): notte viola-blu negli stadi (#1A1830–#2C2456, 10–14%), calda all'alba (#E8913A, 8%); unico colore deciso il giallo (#F5C518) sulla linea del battito.
  - X Factor 2026 (talent spiegati): viola notte da studio televisivo (#2A1E4A, opacità 12%); colori delle squadre sulle luci, oro solo sull'oggetto chiave.
  - Frankenstein Junior: bianco e nero argentato, omaggio al film (#5E6B75, opacità 12%); unico colore deciso il verde-acqua elettrico (#8EF0C8) su fulmini, scariche e oggetti chiave.
  - GTA VI (Videogiochi spiegati): viola da tramonto anni '80 (#2A1450, opacità 8–10%); rosa neon (#FF4FA3) e azzurro (#3FE3F2) per luci e costa, giallo (#FFC93C) solo sugli oggetti chiave, rosso (#FF3B55) per il colpo e il complotto.
  - Hunger Games: grigio-blu di carbone nel Distretto 12 (#2A3038, opacità 12%), oro caldo a Capitol City (#C89A3A, 8%), verde bosco nell'arena (#1E3A2A, 10%; quasi nero di notte #0F1A12); unico colore deciso l'arancione-brace (#F08A2A) sulla freccia, le fiamme e gli oggetti chiave.
  - Il miglio verde: verde e buio caldo della prigione anni '30 (#1E3A28, opacità 12%), seppia nel ricordo (#5A3A1E), blu notte nella pioggia (#142030); unico colore deciso l'oro (#F2C14E) sul dono di John e sugli oggetti chiave.
  - Donnie Darko (Spiegato semplice): blu notte d'ottobre (#161A3A, opacità 12%); unico colore acceso l'arancione del motore (#F2A03A), giallo (#F5D04A) solo per il viaggio nel tempo, azzurro (#7FA6FF) per la copia del mondo.
  - Scissione (Spiegato semplice, stagione 1): verde petrolio da piano interrato (#0E2A30, opacità 12%); notte d'inverno sopra con le finestre calde (#F2C48A), unico colore acceso il verde-acqua del chip e degli interni (#5FE3C2), rosso (#E8553F) solo per il nodo.
  - The Conjuring (L'evocazione): notte blu-grigia del New England (#1A2230, opacità 10–14%), caldo autunnale al tramonto e all'alba (#C8925A, 8–9%); unico colore deciso l'oro (#F2B84B) su orologi fermi alle 3:07, carillon e lumi. Il buio copre la scena tranne dove arriva la luce (`Buio`).
  - Zelda, la linea del tempo (Videogiochi spiegati, Spiegato semplice): pergamena miniata calda (#8A6A30, opacità 8%); oro (#F2C230) solo su triangoli, pennino e bivio; rosso, azzurro e ambra per i tre rami.
  - Ritorno al futuro (Spiegato semplice): notte viola anni '80 (#1A1238, opacità 10%) con stazioni del 1955 come cartoline crema a inchiostro seppia e del 1985 al neon (ciano e magenta); giallo (#F5C23A) solo per le scie del viaggio nel tempo, rosso per l'anello del nodo e i pericoli.
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

## 10. Video lunghi orizzontali 16:9 (1920×1080, vincolante dal 22 nov 2026)
Vale con `YOUTUBE.md` («Grafica dei lunghi»). Cosa cambia rispetto al verticale:
- **Niente «una sola immagine per capitolo»**: il lungo è un mondo unico in cui la camera viaggia. Qualcosa cambia sullo
  schermo ogni 3–5 s (camera, oggetto che entra, scritta, luce), una scena nuova (un luogo o un'inquadratura diversa
  del mondo) ogni 20–30 s, nessuna immagine ferma oltre 5 s. Passaggi senza stacchi al nero né dissolvenze incrociate:
  la camera vola da un luogo all'altro o l'oggetto di una scena diventa quello della dopo.
- **Camera**: non il ±40 px / zoom 1,04–1,09 del verticale, ma movimenti dichiarati per inquadratura (carrellata,
  avvicinamento, volo tra due luoghi) con accelerazione e frenata morbide; nei momenti clou più veloce. Mai un salto di
  inquadratura senza movimento o senza un colpo di musica che lo giustifichi.
- **Piani**: 4–6 in profondità anche qui, con parallasse visibile in ogni movimento; primo piano scuro che tocca i bordi
  sinistro o destro (non sempre il fondo), composizione sui terzi, soggetto mai al centro esatto per più di un'inquadratura.
- **Orizzonte** tra y 560 e 760 (terzo inferiore), coerente tra un luogo e l'altro dello stesso mondo.
- **Zone**: testi e oggetti chiave tra x 96 e 1824 e tra y 54 e 1026. Etichetta (x 96, y 56) e titolo dell'atto
  (y 116–180) in alto a sinistra: dietro, una zona calma. Sottotitoli centrati con la base a y 1000, larghi al massimo
  1400 px (x 260–1660, y 800–1000): gli oggetti chiave stanno sopra y 780 o ai lati di quella fascia. Negli ultimi 20 s
  la metà destra (x 1000–1824, y 180–880) resta libera per la schermata finale di YouTube.
- **Scritte animate**: 2–3 parole grandi (almeno 90 px) a tempo con la voce, dentro la zona sicura e mai sopra i
  sottotitoli; cartellini fissi «LA REGOLA», «COLPO DI SCENA», «TEORIA» sempre uguali in tutto il lungo.
- **Momenti clou**: almeno tre, costruiti come un piccolo trailer (camera veloce, luce che cambia, un attimo di buio o
  di silenzio prima della rivelazione).
- **Miniatura** (1280×720): un solo oggetto enorme, al massimo 3–4 parole grandissime, leggibile a 160×90 e a 320×180;
  stessa grafica per tutti i lunghi; tre versioni per «Testa e confronta».
- **Contorni** come nel verticale (8–10 px oggetti principali, 4–6 dettagli): la larghezza dell'immagine è quasi la stessa.

Criteri di accettazione per ogni atto di un lungo:
- [ ] «dove siamo» nel mondo sempre chiaro (il luogo si riconosce, la camera ci arriva volando)
- [ ] cambio visibile ogni 3–5 s, scena nuova ogni 20–30 s, nessuna immagine ferma oltre 5 s
- [ ] 4–6 piani con parallasse in ogni movimento, primo piano ai bordi
- [ ] luce con gradienti e aloni, grana, vignettatura, velatura, particelle (come il verticale)
- [ ] l'immagine mostra ciò di cui parla la voce in quel momento (le scritte entrano con la parola)
- [ ] nessun testo o oggetto chiave fuori zona o sotto i sottotitoli; metà destra libera negli ultimi 20 s
- [ ] nessun personaggio umano; anteprima fluida

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
- Breaking Bad, stagione 2: `qualita/breaking-bad-stagione-2.md`
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
- Edoardo Bove – «In un battito» (storia vera, stadi a tutto schermo): `qualita/bove-in-un-battito.md`
- Ritorno al futuro (Spiegato semplice, schema delle linee del tempo): `qualita/ritorno-al-futuro.md`
- GTA VI (Videogiochi spiegati, schema: mappa di Leonida): `qualita/gta-vi.md`
- Donnie Darko (Spiegato semplice, schema: la copia del mondo): `qualita/donnie-darko.md`
- Il miglio verde: `qualita/il-miglio-verde.md`
- L'Ultima Cena (quadro): `qualita/ultima-cena.md`
- Scissione, stagione 1 (Spiegato semplice, schema: il piano diviso): `qualita/scissione-stagione-1.md`
- The Conjuring (L'evocazione): `qualita/the-conjuring.md`
- Zelda, la linea del tempo (Videogiochi spiegati, schema: pergamena miniata): `qualita/zelda-linea-del-tempo.md`
