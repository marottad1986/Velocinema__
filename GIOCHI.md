# Videogiochi spiegati

Stessi video verticali dei film (formato 2:00, copertina 4 s + capitoli 112 s + finale 4 s, sovrimpressioni, musica e voce:
vedi `CLAUDE.md`), dedicati alla storia di un videogioco. Un JSON in `films/` con `"tipo": "videogioco"`; `regista` = studio
o autore principale (es. «Rockstar Games»). Valgono tutte le regole di `CLAUDE.md`; qui ci sono quelle in più.
Uscita fissa: **martedì alle 12:30** (in più rispetto alle 17:30; dati Metricool in `SOCIAL.md`). Primo episodio: GTA VI,
martedì 17 novembre 2026, due giorni prima dell'uscita del gioco (19 novembre).

## Due forme
- **La storia di un gioco raccontata come un film** (11 capitoli, una scena per capitolo; es. The Last of Us,
  Red Dead Redemption 2): `"tipo": "videogioco"`.
- **Spiegato semplice** per le storie intricate o fatte a pezzi (es. Elden Ring, Five Nights at Freddy's, Hollow Knight):
  `"tipo": "videogioco"`, `"formato": "spiegato"`, `"schema": true`, con tutte le regole dello Spiegato semplice
  (8–10 capitoli come domande, personaggi come oggetti, un unico schema che si costruisce).
- Etichetta in copertina: «VIDEOGIOCHI SPIEGATI» (non «IL FILM IN 2 MINUTI»). Finale: «Commenta con il gioco che vorresti.»

## Cosa si disegna (vincolante)
- Come per i film: **nessun personaggio umano** del gioco, nemmeno stilizzato; i protagonisti sono oggetti fissi con il
  cartellino del nome. Creature e mostri: mai la sagoma intera né i tratti riconoscibili (regola delle serie).
- Niente immagini, filmati, schermate, mappe ufficiali, copertine, loghi del gioco o dello studio, interfacce (barre della
  vita, minimappa, mirini): luoghi e oggetti ridisegnati nel nostro stile. Il titolo del gioco si scrive nel nostro carattere.
- Niente oggetti-personaggio riconoscibili (es. una maschera o un pupazzo simbolo del gioco) disegnati uguali: si usano
  oggetti generici.
- **Giochi violenti** (GTA, horror): niente armi in primo piano né scene di violenza; i fatti si raccontano con le
  conseguenze e gli oggetti (luci della polizia, sirene, giornali, borse di soldi, strade bagnate).

## Musica (vincolante)
- Solo originale e strumentale con strumenti campionati, mai temi, sigle, brani delle radio del gioco o imitazioni.
  Si può richiamare il genere (synth anni '80, western, orchestra cupa) senza melodie riconoscibili. Un solo bpm per gioco.

## Fatti verificati (vincolante)
- Campo `fonti` obbligatorio (`controlli.mjs` lo tratta come errore): prima la voce Wikipedia italiana del gioco («Trama»),
  poi quella inglese, poi il sito ufficiale e le testate di settore.
- **Gioco non ancora uscito** (es. GTA VI): si racconta solo ciò che lo studio ha annunciato o mostrato ufficialmente
  (trailer, sito, store), detto come annuncio («nei trailer», «secondo Rockstar»); le voci di corridoio e le fughe di notizie
  non si dicono. Il JSON porta `"aggiornato": "prima dell'uscita del <data>"` e il testo non usa «domani» o «stasera»
  (il video resta online): si dice la data.
- Niente prezzi, voti delle recensioni o confronti di vendite se non servono alla storia (cambiano e invecchiano).

## Testo
Le regole di `CLAUDE.md` per chi non conosce l'opera: chi guarda può non aver mai giocato. Si spiega in una frase cos'è il
gioco (genere, dove e quando è ambientato) la prima volta; ogni personaggio con il suo ruolo; niente gergo da giocatori
(«open world», «DLC», «boss») senza spiegarlo subito.

## Materiale social
- Prima riga della didascalia: «🎮 Videogiochi spiegati: Titolo» + emoji; badge della storia: 🎮 VIDEOGIOCHI SPIEGATI.
- Hashtag TikTok: #in2minuti #TitoloSenzaSpazi #videogiochi #gaming + 1 di genere o studio + #perte.
- Titolo YouTube: «Titolo in 2 minuti 🎮 Storia e finale spiegati» (gioco uscito) o «Titolo in 2 minuti 🎮 Cosa sappiamo
  prima dell'uscita» (non uscito).

## Prossimi titoli (da riordinare con i dati e i commenti)
Five Nights at Freddy's (Spiegato), The Last of Us, Elden Ring (Spiegato), Red Dead Redemption 2, Hollow Knight (Spiegato),
Death Stranding.
