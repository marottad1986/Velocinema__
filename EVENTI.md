# Accadde oggi (anniversari ed eventi)

Deciso dall'editore il 25 nov 2026 (proposta approvata nell'app, nata dal suo messaggio del 24 nov): video su eventi della
storia, della cronaca, della scienza e della cultura generale, pubblicati **nel giorno del loro anniversario** (o della
ricorrenza). Poco adatti alle collaborazioni, ma utili alla crescita di YouTube: chi cerca la ricorrenza quel giorno trova
il video. Stesse regole dei film (`CLAUDE.md`: formato 2:00, stile, scene, testo per chi non sa nulla, voce, musica
originale), con queste aggiunte.

## Formato
- **JSON** in `films/<evento>.json` con `"tipo": "evento"`; il campo `regista` porta la data e il luogo dell'evento
  (es. «12 dicembre 1901 · Terranova»), mostrati nella riga sotto il titolo. Racconto classico (11 capitoli) oppure
  `"formato": "spiegato"` se l'evento si capisce solo con uno schema (una scoperta scientifica, un meccanismo).
- **Etichetta** in copertina «ACCADDE OGGI»; nella copertina anche gli anni che si compiono (es. «125 ANNI FA»).
  **Finale** «Fine» + «Commenta con la storia che vorresti.» e la riga «Le spiegazioni complete sono su YouTube».
- **Uscita il giorno dell'anniversario** alle 17:30 (o nell'uscita del giorno più vicina, mai dopo): nel titolo e nella
  didascalia la data e gli anni («125 anni fa, il 12 dicembre 1901…»). Si scrive sempre la data, mai «oggi» o «ieri» nel
  testo della voce: il video resta online.
- **Prova**: come ogni format nuovo, 2 uscite verticali (pubblicate anche come Short), poi la classifica dei format della
  domenica (`DECISIONI.md`, 24 nov) decide se continuare. Un **video lungo** d'anniversario si fa solo se il format entra
  tra i primi tre, oppure per una ricorrenza grande preparata con almeno 3 settimane di anticipo (es. i 50 anni delle
  sonde Voyager, agosto–settembre 2027).

## Persone reali e fatti (vincolante)
- **Nessuna persona disegnata** (come nei film e in `TALENT.md`): niente ritratti, sagome, mani, caricature, folle.
  Si raccontano luoghi, oggetti e strumenti (l'antenna, il telegrafo, la nave, la lettera, la mappa); le persone sono
  presentate a voce con il loro ruolo («Guglielmo Marconi, un inventore italiano di 27 anni»).
- **Niente foto d'archivio, filmati, prime pagine di giornali o loghi**: tutto disegnato da noi, nel nostro stile.
- **Fatti su due fonti**, di cui almeno una non Wikipedia (Treccani, Britannica, siti di musei, enti scientifici,
  archivi di giornali, il sito ufficiale dell'ente o del premio). Date, numeri e nomi si confermano anche contro la
  data dell'anniversario. Se le fonti non concordano su un fatto, non si dà per certo («secondo alcuni…»).
- **Si distingue ciò che è certo da ciò che è ipotesi** (misteri, cause discusse, «leggende» nate dopo).
- **Tragedie e cronaca con rispetto**: niente vittime disegnate né dettagli crudi, tono sobrio, nessun effetto
  spettacolare sul dolore. La cronaca recente (meno di 20 anni) solo se non ci sono processi in corso né persone private
  coinvolte. Niente politica di parte né giudizi su persone viventi.
- **Preferire scoperte, invenzioni, imprese e misteri**: YouTube paga meno (o niente) i video su guerre, attentati e
  disastri; quelli si scelgono solo se la ricorrenza è molto sentita, e mai come prima prova.
- Scienza «spiegata facile»: ogni idea tecnica con un paragone di tutti i giorni (come nello Spiegato semplice).

## Scelta e calendario (manager)
Ogni domenica il manager cerca le ricorrenze delle 3 settimane successive (anni tondi: 25, 50, 75, 100, 125…; più gli
anniversari sempre cercati, come lo sbarco sulla Luna), le cita con la fonte nel calendario e ne propone al massimo una a
settimana, nei limiti di produzione (2 produzioni intere al giorno). Criteri: ricerche attese in Italia, legame con
l'Italia, video adatto alla pubblicità di YouTube, immagini forti da disegnare.

Candidati per la prova (date da riconfermare sulle fonti quando si scrive il testo):
- **12 dicembre 2026** (sabato) · 125 anni dal primo segnale radio di Marconi attraverso l'Atlantico (dalla Cornovaglia
  a Terranova). Scienza, Italia, immagini forti (antenne, aquilone, mare in tempesta). **Prima prova consigliata.**
- **3 dicembre 2026** (giovedì) · 100 anni dalla scomparsa di Agatha Christie per 11 giorni: un mistero vero (solo se
  la settimana 30 nov – 6 dic ha ancora un posto: è vicina).
- **10 dicembre 2026** (giovedì) · 125 anni dei primi premi Nobel: perché un inventore della dinamite li ha creati.
  **Seconda prova consigliata** se il 3 dicembre non entra.
- Più avanti: 28 dicembre (terremoto di Messina del 1908, con sobrietà), 2027: 70 anni dello Sputnik (4 ottobre),
  50 anni delle Voyager (agosto e settembre, possibile lungo).

## Codice
Il primo episodio aggiunge `tipo: "evento"` dove serve (etichetta della copertina nella sua locandina, riga con data e
luogo); `scripts/controlli.mjs` accetta già «Commenta con la storia che vorresti.» e per `"tipo": "evento"` rende
obbligatorio il campo `fonti`.
