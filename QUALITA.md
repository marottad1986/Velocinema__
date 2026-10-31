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
  - Gli anni (883): tramonto caldo di provincia (#E8913A, opacità 10%), blu sera nelle scene di notte (#1E2448).
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

### Frankenstein Junior
Look da horror anni '30 in bianco e nero argentato: grigi freddi, luci calde e tenui (candele, lanterne, torce), un solo colore deciso, il verde-acqua elettrico, su fulmini, scariche e oggetti chiave. Mai la Creatura né i personaggi: le gag si raccontano con gli oggetti.
- Frankenstin: polvere di gesso mentre compare la scritta, pulviscolo nei fasci delle finestre alte, ritratto che si gira verso il muro, sigillo verde-acqua sulla lettera.
- Lupo ululà: luna piena con alone, nebbia su tre livelli, lanterna che oscilla, la «gobba» del fieno che cambia lato, fili di paglia al sobbalzo, archi dell'ululato.
- Frau Blücher: pioggia su due livelli, torce con alone, lampi con i cavalli che si impennano nella stalla, note dal violino nella finestrella, pipistrelli.
- Si può fare!: libreria che ruota con luce verde-acqua dalla scala, candela che si consuma, finestra che passa dalla notte all'alba, pagine che girano.
- Abby Normal: fascio di luna con pulviscolo, pioggia e patibolo oltre la finestra, barattolo che cade e cocci che rimbalzano, etichetta ABNORMAL che si accende.
- È vivo!: archi elettrici ridisegnati a scatti, scintille, pioggia nel lucernario, quadranti con lancette che vibrano, cinghie che si tendono e saltano.
- L'eremita: braci del camino, vapore della zuppa, note del violino, tazza in frantumi, fiammifero che brucia mentre il sigaro resta spento.
- Lo spettacolo: lampadine dell'insegna che si alternano, fasci dei riflettori con pulviscolo, tip tap a tempo, esplosione con scintille verde-acqua, catene che cadono.
- Elizabeth: imposte che si spalancano nel temporale, tende al vento, nuvola di cipria, catene a terra, note verde-acqua che volano fuori dalla finestra.
- L'assedio: torce in fila con braci, nebbia bassa, scarica dal parafulmine, torce che si spengono una a una con un filo di fumo.
- Lieto fine: unica scena chiara, raggi del sole, coriandoli, festoni, vapore che disegna un cuore, brillio delle fedi.

### Interstellar
Look da fantascienza intima: blu profondo nello spazio, polvere color sabbia sulla Terra; l'oro (#E8B04A) solo su buco nero, orologio, codice nella polvere e oggetti chiave. Elementi comuni in `src/scenes/interstellar/Spazio.tsx` (buco nero, astronave ad anello, Saturno, mais). Mai astronauti né volti: i video da casa sono macchie di luce.
- La Terra muore: muro di polvere che avanza, raffica di foglie, mais che si secca, luce della veranda.
- Il fantasma: libri che cadono, polvere che entra dalla finestra e si posa in strisce, cifre d'oro.
- La base segreta: fari con pulviscolo, scintille di saldatura, schermo con Saturno e il varco che appare.
- La partenza: porta che sbatte, orologio che brilla, scia del razzo con fumo e stanza che vibra.
- Il varco: anelli di stelle deformate, galassia dentro la sfera, frammenti di ghiaccio, stelle che si allungano.
- Il pianeta delle onde: onda che si alza, due quadranti (qui / Terra), velo d'acqua, spruzzi, navetta che riparte.
- 23 anni di messaggi: contatore degli anni, icone che compaiono, schermo che si spegne nel rumore, vapore della tazza.
- Il pianeta di ghiaccio: neve nel vento, nuvole congelate, faro che diventa rosso, crepa, esplosione in orbita.
- La verità di Brand: rotazione che rallenta, frammenti, lavagna con l'equazione barrata.
- Dentro il buco nero: disco dorato, navetta che cade, tunnel di librerie con fili di luce, libro che cade.
- Il messaggio: Morse dorato in sincronia con la lancetta, stazione spaziale con case, due orologi, navetta verso Amelia.

### Cast Away
Look da isola tropicale luminosa (sabbia, laguna turchese, palme) contro una Memphis fredda e notturna; l'accento rosso-arancio
(#E4572E) solo sull'oggetto chiave della scena (lancetta, gommone, pacco con le ali, impronta su Wilson, fuoristrada).
Elementi comuni in `src/scenes/cast-away/Comuni.tsx` (pallone, pacco con le ali, palma, zattera, orologio da tasca).
Mai Chuck né Kelly: si raccontano con gli oggetti; nessun marchio (corriere anonimo, pallone senza logo).
- Ogni minuto conta: nastri trasportatori in movimento, lancetta che scatta, neve alle finestre, pulviscolo nei fasci dei neon.
- La promessa di Natale: neve su due livelli, luci di Natale, gocce sul parabrezza, orologio che si apre, luci di posizione dell'aereo.
- L'aereo precipita: due lampi, pioggia su due livelli, motore in fiamme con fumo, colonna d'acqua all'impatto, gommone che si gonfia.
- L'isola deserta: raggi dell'alba, onda alta che si frange sulla barriera, risacca sulla spiaggia, gabbiani.
- I pacchi: pacco che arriva con la marea, oggetti che escono a uno a uno, alone sul pacco con le ali.
- Il fuoco e Wilson: fumo dei tentativi, impronta che compare, fiamma con braci, cielo che passa dal tramonto alle stelle.
- Quattro anni dopo: tacche che si moltiplicano, fumo dei pesci, braci, pulviscolo nel fascio dell'apertura.
- La vela: pannello portato dalla marea, vela issata, bandierina che gira col vento, spruzzi sulla barriera.
- Perso in mare: pallone che si allontana, corda lasciata, riflessi di sole, nave all'orizzonte con fumo.
- Il ritorno: pioggia su due livelli, gocce dalla veranda, pozzanghere con cerchi, porta che si chiude, fari che si accendono.
- Il bivio: polvere dietro il furgone, ali sul portellone che si illuminano, erba secca al vento, raggi del tramonto.

### Jurassic Park
Look da avventura nella giungla: verdi profondi, nebbia, pioggia notturna, luci di sicurezza verdi e rosse; l'ambra
(#F2A23A) solo sull'oggetto chiave (goccia d'ambra, cartello della recinzione, provette, leva, striscione).
Elementi comuni in `src/scenes/jurassic-park/Comuni.tsx` (jeep, recinzione elettrica, felci, alberi, ambra, elicottero, uovo).
Persone mai. I dinosauri si disegnano generici, da manuale di paleontologia (raptor piumati e piccoli, colori non del film),
nel momento chiave; per il resto si raccontano con le tracce (acqua che trema, impronte, cavi spezzati, gusci). Niente logo del film.
- Dinosauri di nuovo vivi: luce sotto l'ambra con pulviscolo, DNA che gira sugli schermi, isola alla finestra.
- Gli esperti: pale dell'elicottero, erba piegata dal vento, cascata con nebbia, gabbiani.
- Il laboratorio: lampade calde sulle uova, uovo che si crepa e si apre, braccio meccanico, cartellini «F».
- La visita: jeep sul binario, cielo che si scurisce, un lampo, foglie strappate dal vento.
- Il sabotaggio: zone della mappa che diventano rosse, allarme, bomboletta con le provette, pioggia sui vetri.
- Il T-rex: cerchi nel bicchiere a ogni passo, vista che trema, cavi che si spezzano, jeep che si rovescia, torcia.
- La notte nella giungla: fari che si spengono, bomboletta che scivola nel fango, pioggia che cala, stelle.
- Le uova schiuse: raggi tra gli alberi, nebbia, impronte piccole che compaiono, rana che salta.
- Senza corrente: cancello delle gabbie che si apre, leva, lampade che si riaccendono in fila, scintille.
- Raptor in cucina: maniglia che si abbassa, mestoli che oscillano, pentola che cade, spia della porta che diventa rossa.
- La fuga: atrio che trema, striscione che crolla, alba, elicottero che parte, uccelli sul mare.

### Harry Potter e la pietra filosofale
Look da libro di fiabe: notti blu-viola con candele e finestre calde, pietra e legno, l'oro (#E8B04A) solo sull'oggetto
chiave (sigillo della lettera, cartello 9 ¾, lanterne, pallina d'oro, cornice dello specchio). Elementi comuni in
`src/scenes/harry-potter-pietra-filosofale/Comuni.tsx` (gufo, lettera, castello, candela fluttuante, scopa, pallina d'oro,
cornice dello specchio). Persone mai (nemmeno nello specchio: solo luce calda); animali sì (gufi, cane a tre teste).
Niente logo con il fulmine, stemmi delle case o carattere del film; titolo in Cinzel.
- Il ragazzo nel sottoscala: lampadina che oscilla, ragno che scende, pulviscolo, cornice vuota.
- Le lettere: lettere che escono a fiotti dal camino, gufi che compaiono alla finestra, lettera strappata.
- Sei un mago: porta che cade, lampi, fuoco che divampa, onde sullo scoglio, pioggia.
- Il binario nove e tre quarti: muro che si increspa come acqua, carrello che ci entra, treno a vapore che appare.
- Il castello: finestre che si accendono, barchette con le lanterne, riflessi sul lago, gufo in volo.
- Il cappello parlante: candele che fluttuano, cielo stellato con stella cadente, cappello che parla, coriandoli.
- Il Quidditch: scopa che si alza e sfreccia con la scia, pallina d'oro che zigzaga, stendardi al vento.
- Il cane a tre teste: il cane si sveglia e ringhia, la botola si illumina, l'arpa suona e lo riaddormenta.
- Lo specchio: neve alla finestra, lo specchio si riempie di luce calda, un drappo lo copre.
- La botola: liane, chiavi con le ali, scacchiera gigante, il cavallo che crolla in frantumi.
- La pietra filosofale: fuoco magico viola, buio che avanza, luce che protegge, la pietra che si sbriciola.
### Shining
Look da racconto d'inverno che diventa incubo: fuori notte e neve blu-grigie (velatura fredda #1A2A3A), dentro
l'albergo luci calde e false (velatura rossa #3A1A14); il rosso dell'accento (#C8202E) solo sull'oggetto chiave (la
scritta, la porta della 237, le impronte grandi, la data della foto). Elementi comuni in `src/scenes/shining/Comuni.tsx`
(albergo, labirinto visto dall'alto, motivo del tappeto inventato, macchina da scrivere, triciclo, porta numerata).
Persone mai: niente gemelle, volti dietro la porta o figure nella foto (solo oggetti, luci e impronte). Niente tappeto,
locandina o carattere del film; titolo in Special Elite.
- Il custode d'inverno: l'auto gialla sale i tornanti, l'albergo in fondo, il cielo si scurisce sulla strage.
- Il dono di Danny: specchio dell'armadio con visioni che scorrono, luccicanza come bagliore, triciclo.
- La stanza 237: corridoio in prospettiva, la porta 237 che lampeggia, cornici che si inclinano.
- Chiusi dalla neve: tormenta, fili del telefono che si spezzano, finestra della radio, faro del mezzo per la neve.
- Le due bambine: triciclo che frena, scarpine, luce fredda, palla che rotola.
- Il bar dei fantasmi: lampadari che si accendono uno dopo l'altro, bicchiere che si riempie da solo, tutto vira al rosso.
- La stessa frase: macchina da scrivere, pile di fogli identici che volano e cadono.
- La porta che si apre da sola: chiavistello che scorre, porta che si socchiude, radio che va in pezzi.
- La parola nello specchio: scritta al contrario sulla porta, dritta nello specchio, lama dell'ascia con schegge.
- Il labirinto: fari che si spengono, impronte piccole che entrano e tornano indietro, impronte grandi che le inseguono.
- La foto del 1921: labirinto sepolto all'alba, tracce che se ne vanno, la foto datata che si avvicina e si illumina.

### Titanic
Look da manifesto d'epoca: notti blu profonde con le luci calde della nave, il tramonto rosa e arancio sulla prua, il
fondale verde-nero del relitto; l'azzurro zaffiro dell'accento (#4FB0E8) solo sul diamante e su ciò che lo riguarda
(biglietti, invito, scialuppe, filo del telefono). Elementi comuni in `src/scenes/titanic/Comuni.tsx` (nave a quattro
fumaioli, iceberg, diamante a cuore inventato, scialuppa, porta intagliata). Persone mai: Rose, Jack e Cal si raccontano
con oggetti (scialle, album da disegno, cappotto, manette, porta). Niente locandina, prua con le braccia aperte o logo del
film; titolo in Playfair Display.
- Il tesoro nel relitto: fari del sottomarino nel buio, neve marina, la cassaforte che si apre e il foglio che brilla.
- La ragazza del disegno: televisore con il disegno, telefono che squilla, vapore del tè, alba dalla finestra.
- Due biglietti, due mondi: la nave al molo con fumo e bandierine, bauli di lusso, i biglietti vinti che saltano su.
- La notte sulla poppa: scia dell'elica, stelle, lo scialle che torna sul ponte, l'invito a cena.
- La festa in terza classe: dallo scalone dorato alla sala con lanterne che dondolano, boccali, note e coriandoli.
- Il disegno: la prua al tramonto con vento e gabbiani, l'album con il cuore che si disegna, la cassaforte che si chiude.
- L'iceberg: l'iceberg che cresce dal buio, campana, ghiaccio che cade, la scena che trema, le poche scialuppe.
- Ammanettato sotto coperta: il diamante nella tasca del cappotto, l'acqua che sale, l'ascia e la catena che si spezza.
- Il salto dalla scialuppa: la fiancata inclinata, la scialuppa col cappotto, i razzi, la lanterna sul ponte.
- La nave si spezza: la poppa che si alza, la rottura, il mare gelato, la porta che si rovescia, la brina, i rottami.
- Il Cuore dell'Oceano: dall'alba dei soccorsi alla notte di oggi, il diamante che affonda, la porta lontana.

### Joker
Look da città sporca anni Ottanta: mattoni anneriti, verde malato e senape, luci gialle dei lampioni e verdi dei neon,
il rosso dell'accento (#D2382E) solo sugli oggetti del clown e sui momenti chiave (cartello, completo, «JOKER» in
sovrimpressione, impronte). Elementi comuni in `src/scenes/joker/Comuni.tsx` (palazzi con scale antincendio, sacchi della
spazzatura, parrucca, scarpa, completo rosso, pistola, televisore). Persone mai, né il volto truccato: Arthur si racconta
con i suoi oggetti; la violenza è suggerita da lampi, luci che si spengono, oggetti a terra (mai armi puntate né corpi).
Niente locandina, figura sulle scale o logo del film; titolo in Anton.
Una sola immagine per capitolo, con un oggetto protagonista grande tra y 520 e 1260 e gli eventi delle tre frasi dentro
la stessa immagine (mai dissolvenze tra luoghi diversi). Oggetti con materiali (gradienti luce/ombra, bordi illuminati):
`JokerDefs` in `Comuni.tsx`. Attenzione: un gradiente su una linea perfettamente verticale o orizzontale non si vede
(riquadro di larghezza zero): per pali e barre usare `rect`.
- Un clown a Gotham: la vetrina «TV · RADIO» con il televisore che passa dal disturbo al palco col microfono, taxi e topo, cartello «SALDI!», sacchi e vapore.
- La risata che non si ferma: interno dell'autobus, il cartoncino della malattia sul sedile, luci a scatti, frenata e cartoncino strappato con l'impronta.
- La pistola sbagliata: corridoio di pediatria con disegni e palloncini, la pistola che cade dalla borsa del clown, il timbro «LICENZIATO».
- La notte in metropolitana: vagone con valigetta e cravatta, i tre neon che scoppiano (niente lampi), la stazione con «SIAMO TUTTI CLOWN».
- La lettera della madre: soggiorno con poltrona, lampada e TV «WAYNE SINDACO», la villa che si accende, la lettera aperta con la riga rossa.
- La verità sulla madre: archivio con schedario e lampada che oscilla, la cartella FLECK vista dall'alto, timbro «ADOZIONE», referto medico.
- Da solo: stanza d'ospedale con la finestra sulla casa della vicina (luce calda che si spegne), monitor a tempo con la musica che si appiattisce.
- L'invito in TV: studio visto dal pubblico, lampadine dell'insegna, schermo con il palco e «JOKER», applausometro, biglietto d'invito.
- Il ballo sulla scalinata: scalinata dal basso tra due muri, la porta che sbatte, il completo sulla ringhiera, impronte rosse a tempo, luci della polizia.
- In diretta: la vetrina dei sei televisori del primo capitolo sotto la pioggia, «JOKER», un solo lampo allo sparo, «COLLEGAMENTO INTERROTTO».
- Gotham brucia: auto della polizia rovesciata davanti al cinema, vetrina che si incrina, perle che rotolano, tutto svanisce nel grigio del manicomio
  e resta la maschera.

### Dark, stagione 1 (Spiegato semplice, schema)
L'albero che si annoda (`src/scenes/dark-stagione-1/Albero.tsx`): fondo scuro verde-grigio, un quadrante d'orologio
appena visibile che gira, due famiglie in colonna (Kahnwald, Nielsen), anni dall'alto in basso, il passaggio della
grotta come colonna gialla tratteggiata a sinistra. Personaggi = cerchi con l'oggetto (mai figure).
- Ogni nodo compare con un rimbalzo quando la voce lo nomina; il nodo di cui si parla ha l'anello giallo con alone.
- Il colpo di scena: filo giallo «torna nel 1986» da Mikkel a Michael e anello rosso Michael → Jonas → Martha → Mikkel.
- Le scritte di un solo capitolo si spengono a fine capitolo; alla fine resta l'albero completo e leggibile.
- Pulviscolo, grana e vignettatura come le altre scene.

### Inception (Spiegato semplice, schema)
La torre dei sogni come cianografia (`src/scenes/inception/Piani.tsx`): carta blu con griglia, linee bianche, accento
arancione. Piani dall'alto in basso: realtà (aereo), sogno 1 città, sogno 2 albergo, sogno 3 fortezza, limbo; a destra un
orologio per piano con la durata. Personaggi = cerchi con l'oggetto (trottola, valigetta, girandola, cassaforte, fede).
- L'idea è un seme arancione che scende di piano in piano e germoglia in Fischer.
- I calci sono frecce arancioni che risalgono; il limbo e Mal sono in rosso.
- La trottola grande nella realtà gira, accelera quando la voce ne parla e alla fine vacilla.
- Velo scuro dietro il titolo: nelle inquadrature strette la torre può passare sotto il titolo.
### Bohemian Rhapsody
Look da teatro d'opera e da anni '70: bordeaux, velluto rosso, legno, luci calde; l'oro (#E9B949) solo sugli oggetti
chiave (gong, spartiti, maschera, contatore, classifica). Elementi comuni in `src/scenes/bohemian-rhapsody/Comune.tsx`
(pianoforte verticale e a coda, gong). Mai i membri del gruppo, nemmeno in sagoma: si raccontano strumenti e luoghi.
- Una canzone impossibile: lampada che si scalda, note dal pianoforte, metronomo, tre spartiti (ballata, opera, rock), fogli che volano.
- Un coro fatto in tre: tre microfoni che si accendono, cursori e lancette, contatore che arriva a 180, nastro che diventa trasparente.
- Prima parte: la confessione: pioggia sul vetro, candela, lettera che si accende, porta che si apre sul corridoio, chitarra che si illumina.
- Seconda parte: il processo: due fasci alternati (i due cori), maschera e cannocchiale che si accendono, botola rossa con fumo, due fulmini.
- Terza parte: la ribellione: fasci colorati nel fumo, piatti che vibrano, poi faro sul pianoforte e gong con anelli dorati.
- Che cosa vuol dire?: punto interrogativo tracciato sullo specchio, giacca che oscilla, cassetto che si chiude, lampadine che si spengono.
- Troppo lunga per la radio: ON AIR al neon, orologio che corre, 14 tacche sulla bacheca, telefono che lampeggia, barra d'oro in classifica.
- Una seconda vita: lampioni che scorrono, cassetta che gira, pupazzetto che scuote la testa, finestre della città che si accendono.

### Gli anni (883)
Provincia italiana tra anni Ottanta e Novanta: mattoni, tramonti arancioni, neon, motorini. L'arancione (#F2A23A) solo
sugli oggetti chiave (mangianastri, cartolina, classifica, calendario, salvadanaio, cartello, torta del 14, disco,
insegna). Elementi comuni in `src/scenes/gli-anni/Comune.tsx` (motorino, mangianastri, jukebox). Mai Pezzali, Repetto
o altre persone, nemmeno in sagoma; niente copertine dei dischi né il logo degli 883.
- Due amici di Pavia: ponte coperto al tramonto, riflessi sul Ticino, mangianastri con le note, rondini, finestre che si accendono.
- L'ultima canzone insieme: lampadina che oscilla, aereo nella finestrella, registratore in REC, foglio con una sola firma, sedia che si allontana.
- Nostalgia a venticinque anni: vetrina accesa, classifica che sale al primo posto, candeline del 25, orologio all'indietro, insegna riflessa.
- Il ritorno al bar: fascio dalla porta, vapore della macchina del caffè, polvere che si posa, calendario 1985 → 1995, jukebox che si accende.
- Quando eravamo ragazzi: faro del motorino, televisione con soli colori, salvadanaio con poche monete, lucciole, stelle.
- Gli amici cresciuti: riso sull'auto degli sposi, lancette che corrono, lampione tremolante sul motorino solo, cartello con due frecce.
- Nostalgia all'età sbagliata: clessidra che si gira, torte del 14 e del 17, foto che sbiadiscono, alba e aeroplanino di carta.
- Una canzone di tutti: luci dei telefoni come stelle (nessuna persona), fiori sul palco, disco generico, insegna del bar alla fine.
