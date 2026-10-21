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
  - Frankenstein Junior: bianco e nero argentato, omaggio al film (#5E6B75, opacità 12%); unico colore deciso il verde-acqua elettrico (#8EF0C8) su fulmini, scariche e oggetti chiave.
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

### Shutter Island
- Arrivo: nebbia su tre livelli, gabbiani, scie d'acqua dietro il traghetto, luna con alone, fumo del comignolo.
- Ashecliffe: faro di ricerca della torretta con fascio che spazza la nebbia, pioggia leggera, finestre che si accendono una a una.
- La cella vuota: pulviscolo nel fascio della finestra, lampo che proietta l'ombra delle sbarre sul pavimento, gocce dal soffitto.
- Il biglietto: luce di torcia che si muove sul pavimento, polvere che si solleva con la piastrella.
- Lo studio: pioggia che scorre sui vetri, fumo della pipa con volute, riflesso del disco che gira, luce calda della lampada.
- L'incendio: scintille e braci che salgono, fumo su due livelli, bagliore arancione che pulsa sulla facciata.
- L'uragano: usare la versione "dopo" come base.
- La grotta: braci del fuoco, ombre tremolanti sulle pareti, pioggia oltre l'apertura.
- Il colpo di scena: polvere di gesso mentre le lettere vengono scritte, luce della lampada che oscilla, pioggia sulla finestra del faro.
- La verità: luce fredda da finestra, pulviscolo, foto del lago con piccolo movimento d'acqua.
- All'alba: raggi del sole, gabbiani, onde dorate, impronte che compaiono con piccoli spruzzi di sabbia.

### La La Land
- L'ingorgo: miraggio di calore sull'asfalto, riflessi sui parabrezza, palme che ondeggiano, raggi del sole.
- I provini: vapore del caffè, luce del mattino sul set, cartellone degli studi con piccole lampadine.
- Il pianoforte: luci di Natale che brillano a ritmi diversi, note che salgono, riflesso sul coperchio del piano.
- La collina: stelle che compaiono una alla volta, luci della città che brillano, lucciole, alone del lampione.
- Il jazz club: neon con alone colorato, fumo nel fascio del faro, riflesso sul sassofono.
- L'osservatorio: stelle su due livelli che ruotano a velocità diverse, nebulosa con gradiente, stella cadente.
- I sogni: luci della città alla finestra, fogli che volano, alone della lampada.
- La band: fasci colorati con fumo di scena, coriandoli, pubblico in controluce.
- La prima: pulviscolo nel faro, sipario che ondeggia, poltrone con riflessi di velluto.
- Il provino: pulviscolo nella luce, ombra dello sgabello lunga, cartolina con leggera rotazione 3D.
- Cinque anni dopo: neon che si accende con alone, pioggia sottile, pozzanghere che riflettono l'insegna, note.

### The Truman Show
Look da set televisivo: colori pastello troppo perfetti, ombre morbide, e qua e là un dettaglio "da studio" che tradisce la finzione (giunture del cielo, riflettori, telecamere nascoste con la spia rossa).
- Seahaven: villette identiche, staccionate, prati, irrigatori che spruzzano, uccellini, cielo con nuvole troppo regolari, telecamera nascosta in una casetta per uccelli con spia rossa che lampeggia.
- Il riflettore: polvere e frammenti di vetro che si sollevano, fumo leggero dal riflettore caduto, alone residuo della lampada, foglie che rotolano.
- La pioggia: pioggia su due livelli dentro un cerchio solo, schizzi sulla sabbia, sole tutto intorno con raggi, gabbiani, onde leggere.
- La radio: luci del cruscotto con alone, lancetta che vibra, onde sonore stilizzate dall'altoparlante, riflessi della strada sul parabrezza.
- Il padre: onde in tempesta, fulmini (massimo due), schiuma, pioggia, berretto che galleggia, riflesso freddo sull'acqua.
- Sylvia: stelle che brillano, onde notturne, braci che si spengono, lucciole o luci lontane della città, faro lontano.
- Le Figi: luce calda della vetrina con riflessi sul vetro, palme stilizzate sul manifesto che ondeggiano, insegna lampeggiante, pulviscolo.
- La fuga: fiamme e braci, fumo su due livelli, lampeggianti arancioni delle transenne, fari con fasci di luce.
- La barca: onde su tre livelli, spruzzi, pioggia vicina, fulmini, griglia dei riflettori che si accende nel cielo.
- Il muro: luce dell'alba, foschia bassa, riflessi sull'acqua calma, gabbiani dipinti sul muro immobili e gabbiani veri che volano, crepa nel cielo dipinto.
- L'inchino: luce dalla porta aperta, pulviscolo, cielo dipinto con giunture, schermi tv con effetto neve, vapore delle tazze nel bar.
