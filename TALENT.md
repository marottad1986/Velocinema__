# Talent spiegati (programmi TV con persone reali)

Stessi video verticali dei film (formato 2:00, copertina 4 s + capitoli 112 s + finale 4 s, sovrimpressioni, musica e voce:
vedi `CLAUDE.md`), dedicati a un programma TV in corso con concorrenti e giudici veri (primo caso: X Factor 2026).
Un JSON in `films/` con `"tipo": "talent"`. Valgono tutte le regole di `CLAUDE.md`; qui ci sono quelle in più, che
nascono dal fatto che **si parla di persone vere, in una gara ancora aperta**.

## Persone reali (vincolante)
- **Nessuna persona disegnata**: niente ritratti, sagome, mani, caricature, ombre di persone, pubblico in sala.
  Concorrenti, giudici e conduttrice sono **oggetti fissi** del vocabolario (sotto), con il cartellino del nome.
- Niente foto, fermi immagine, clip, audio o grafiche del programma; niente **logo** (né la «X» stilizzata né la
  scenografia vera: il palco è inventato da noi). Il nome del programma si scrive nel nostro carattere.
- Niente marchi degli sponsor (il «pass» si chiama pass, senza il nome dello sponsor).
- **Rispetto**: si raccontano i fatti della gara (chi è andato al ballottaggio, chi ha votato chi, chi è uscito), mai
  giudizi sulle persone o sulle esibizioni («ha steccato», «inconsistente»), mai pagelle, quote delle scommesse,
  pettegolezzi o vita privata. Un'opinione della critica si cita solo se serve e come opinione («per molti critici…»).
- Si usano i nomi con cui il programma presenta i concorrenti (nome d'arte, es. «Lenanie»); il nome all'anagrafe
  non serve.

## Musica e canzoni (vincolante)
- **Mai canzoni cantate né imitazioni**: niente cover, niente melodie o ritornelli delle canzoni cantate in gara,
  niente sigla o jingle del programma, nessuna voce che imita un concorrente o un giudice.
- Musica originale e strumentale con strumenti campionati (come per i film), nel carattere di un varietà del giovedì
  sera; un solo bpm per il programma (X Factor 2026: 120), così gli episodi della stagione suonano come una serie.
- I titoli delle canzoni si nominano solo se servono a capire (es. il tema della serata), mai i testi.

## Fatti verificati (vincolante)
- Ogni fatto ha una fonte nel campo `fonti` (prima la voce Wikipedia italiana dell'edizione, tabella delle
  eliminazioni e «Dettaglio delle puntate»; poi le testate che riportano il voto dei giudici). Se due fonti non
  concordano (es. su chi ha votato chi), vale la tabella di Wikipedia controllata con una seconda fonte; se resta il
  dubbio, il fatto non si dice.
- La gara è in corso: il JSON porta `"aggiornato": "dopo il Live N del <data>"` e il testo dice solo ciò che è già
  successo. Le cose annunciate (es. «tre eliminazioni al Live 4») si dicono come annunci, con la data della puntata
  («giovedì 12 novembre»), mai «stasera» o «domani» (il video resta online dopo).
- Niente pronostici su chi vincerà.

## Testo
Valgono le regole di `CLAUDE.md` e il passo dello Spiegato semplice: frasi brevi (al massimo ~12 parole), parole di
tutti i giorni, al massimo 3,4 parole al secondo (meglio intorno a 3,1), capitoli come domande (8–10 capitoli da
10–14 s). In più:
- chi guarda può non aver mai visto il programma: la prima volta si spiega cos'è (gara tra cantanti e band, chi
  la presenta, i giudici che guidano una squadra) e ogni parola del programma si spiega al primo uso
  («ballottaggio, cioè…», «pass», «manche» → meglio «turno»);
- ogni concorrente si nomina la prima volta con la sua squadra («Lenanie, della squadra di Irama»);
- ogni eliminazione dice perché: chi era al ballottaggio, come hanno votato i giudici, con quanti voti;
- l'ultima frase dice cosa succede alla puntata dopo (una domanda aperta, non un pronostico);
- pronuncia dei nomi stranieri nel campo `pronuncia` (es. «Jake» → «Gèik», «Live» → «Làiv»).

## Vocabolario visivo fisso (lo stesso in tutti gli episodi)
Componenti in `src/scenes/talent/` (studio, oggetti e tabellone), dati della gara in `src/scenes/talent/<programma>.ts`.
- **Il palco**: uno studio inventato da noi, di sera, pavimento nero lucido con i riflessi, parete di led sullo sfondo,
  americane con i fari, foschia e pulviscolo nei fasci. Velatura viola notte (#2A1E4A, 12%).
- **Concorrente = asta col microfono** con il cartellino del nome alla base, nel colore della squadra; le band hanno
  in più un amplificatore accanto all'asta. Acceso = in gara; **spento** (asta grigia, cartellino barrato «FUORI ·
  LIVE N») = eliminato; **pass dorato appeso** = ripescato.
- **Giudice = poltrona vuota** (vista di spalle) o **lampada del tavolo dei giudici** con il cartellino del nome, nel
  colore della sua squadra. Il voto al ballottaggio = la lampada che punta l'asta da eliminare.
- **Conduttrice = microfono dorato** al centro del palco.
- **Televoto = telefono** con le barre che crescono; **ballottaggio = due aste sotto i fasci rossi**.
- **Tabellone** luminoso sopra il palco con le squadre e i nomi: la scena di «Chi è ancora in gara?».
- Colori delle squadre (X Factor 2026): Gabbani corallo #FF7A66, Jake La Furia verde lime #A8E063,
  Paola Iezzi lilla #E08CFF, Irama azzurro #5CC8FF. L'oro dell'accento (#FFC53D) solo sull'oggetto chiave della
  frase (microfono della conduttrice, pass, «ESCONO IN 3»).
- Una sola immagine per capitolo; valgono parallasse, luce, texture, particelle e criteri di `QUALITA.md`
  (suggerimenti in `qualita/x-factor-2026.md`).

## Copertina e finale
- Copertina (è anche la miniatura): al fotogramma 0 già completa, senza dissolvenze (la fascia della frase di lancio
  no: entra da ~0,4 s, come da `CLAUDE.md`): la fila delle aste accese nei
  colori delle squadre con quelle spente, titolo grande «X FACTOR 2026» (nostro carattere), sopra «TALENT SPIEGATI»,
  sotto il sottotitolo della puntata («Chi è ancora in gara», «Com'è andato il Live 4»…). L'aggancio dei primi 2–3 s
  è nella voce (domanda) e nei fasci che cercano le aste.
- Finale: il palco con le aste rimaste, riquadro «Ti è servito?» con «Metti like» / «Segui la pagina» e
  **«Commenta con chi vorresti in finale.»** (dopo la finale: «Commenta con il programma che vorresti.»).

## Episodi della stagione (per farli in fretta senza perdere qualità)
- **Recupero** (`films/x-factor-2026.json`): cos'è, selezioni, squadre, regole dei Live, Live 1–3, chi resta.
- **Un episodio a settimana** dopo ogni Live: `films/x-factor-2026-live-<N>.json`, scene in
  `src/scenes/x-factor-2026-live-<N>/index.ts`. Schema dei capitoli, da adattare a ciò che è successo:
  1. «Dove eravamo rimasti?» (chi era in gara: tabellone, 10–11 s);
  2. «Cosa cambiava al Live N?» (regola nuova o tema della serata);
  3–6. un capitolo per ogni turno e per ogni ballottaggio (scene `Ballottaggio` e `Pedana` con i dati della serata);
  7. «Chi è ancora in gara?» (tabellone aggiornato) e cosa succede al Live dopo.
- Cosa si rifà ogni settimana: testo e fonti, i dati della serata in `src/scenes/talent/<programma>.ts` (stato di
  ogni concorrente dopo il Live N: `in gara`, `fuori` con il Live, `ripescato`), al massimo una scena nuova per una
  novità della serata (un tema, un ospite si racconta con un oggetto), la voce e lo spartito (stessa base, eventi ai
  nuovi istanti). Le scene riusate si controllano comunque sui fotogrammi: nomi lunghi, quante aste per pedana.
- Tempi: si parte la mattina dopo il Live (venerdì), testo e fonti il venerdì, scene e voce entro il lunedì, revisori e
  pull request entro il martedì dell'uscita.
- I dati di una puntata si scrivono solo dopo la puntata, dalle fonti: mai in anticipo.
