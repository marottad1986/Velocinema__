# Trailer verticali (regole dell'editore, 16 novembre 2026)

Regole per i trailer verticali dei video lunghi di YouTube (e per altri trailer di «In 2 minuti»), fissate dall'editore
lavorando al primo, quello della trilogia di Ritorno al futuro (`promo/trailer-ritorno-al-futuro.json`, scene in
`src/promo/trailer-ritorno-al-futuro/`, musica in `scripts/audio/trailer-ritorno-al-futuro.mjs`): è il **trailer di
riferimento**, da guardare prima di farne uno nuovo. Valgono anche tutte le regole di `CLAUDE.md` (contenuti, niente
persone, musica originale, voce), di `QUALITA.md` e di `ASTICELLA.md`; pubblicazione in `VIDEO-LUNGO.md` e `SOCIAL.md`.

## Cosa è un trailer (e cosa non è)
- **Un trailer di cinema, non un riassunto.** La prima prova (voce che racconta i tre film uno dopo l'altro sopra le
  locandine) è stata bocciata: «nei trailer non si racconta così». Il trailer promette, crea attesa e non risolve nulla:
  niente finale, niente spiegazioni complete.
- **Immagini disegnate apposta.** I ritagli delle locandine degli episodi non bastano («a questo punto disegnerei delle
  immagini apposite»): ogni inquadratura è un disegno nuovo, curato come una scena (`BRIEF-SCENA.md`, `QUALITA.md`), con un
  evento agganciato alla voce. Le locandine si possono usare solo per la miniatura e la chiusura.

## Struttura (sul modello dei trailer veri)
1. **Miniatura (fotogramma 0, ~3 s):** la locandina con il titolo, il bollino «NUOVO SU YOUTUBE» e la frase di lancio, come
   per ogni video (`CLAUDE.md`, «La copertina è anche la miniatura»). Poi un lampo e il nero.
2. **Cold open:** bande nere da cinema, un cartello di luogo e anno sul nero, poche inquadrature lente con un suono solo
   (es. un ticchettio); la voce presenta il mondo e i personaggi con il loro ruolo.
3. **Atti che salgono:** ogni salto (di tempo, di luogo, di posta in gioco) si apre con un **cartello sul nero** (riga piccola
   + parola o anno grande al neon) e un **colpo di ottoni bassi**; a ogni atto la musica è più piena.
4. **Montaggio veloce:** un'inquadratura per battito, crescendo di rullante e archi.
5. **Stacco e suspense:** la musica si spegne di colpo. Il nero da solo **non** si capisce come suspense: nel buio ci vuole
   un segnale (una spia che pulsa a tempo con un ticchettio secco e un battito basso), poi l'immagine **emerge piano dal
   buio** (luci che si accendono una alla volta) mentre la voce dice la battuta più forte, con un crescendo che porta al colpo.
6. **Titolo alla fine:** colpo forte (piatto, timpani, ottoni pieni, tuono) e titolo grande su un'immagine nuova e
   spettacolare, non sulla locandina.
7. **Chiusura:** «ORA SU YOUTUBE», lettore video generico (senza logo) con la miniatura del lungo, «Metti like», «Iscriviti
   al canale» e «Commenta con … che vorresti.» (vedi `CLAUDE.md`, «Finale»).

## Bollino YouTube sempre presente (editore, 25 nov 2026)
- Dalla fine della miniatura fino alla chiusura resta in alto a sinistra (y 262, x da 120) il bollino **«▶ GUARDALO SU
  YOUTUBE»**: pillola scura con un play generico in un cerchio rosso, mai il logo di YouTube (regola del 20 nov: TikTok e
  Instagram mostrano meno i video con il logo di un'altra app). Si accende con `"bollino_youtube": true` nel JSON del
  trailer (`src/promo/Promo.tsx`, `BollinoYouTube`): obbligatorio nei trailer nuovi; quelli già fatti restano come sono.
  Le inquadrature non mettono scritte o oggetti chiave in quell'angolo.

## Ritmo e dettagli (dalle correzioni dell'editore)
- **Cartelli:** restano a schermo circa 2 s (5 crome a 72 bpm), poi sfumano nel nero e la scena entra dal nero (~0,35 s)
  con una frusciata: un taglio secco subito dopo il cartello «sembra troppo attaccato».
- **Pulsanti della chiusura:** «Iscriviti al canale» resta ben visibile circa 3 s prima di essere premuto e diventare
  «Iscritto ✓» (premuto troppo presto non si legge).
- **Movimenti continui:** niente animazioni a ciclo che tornano indietro di scatto (es. un treno che avanza e riparte):
  ciò che avanza, avanza per tutta l'inquadratura.
- Gli eventi (cartelli, colpi, tagli) cadono sulla griglia della musica; la voce parla solo nella sua finestra (campo
  `voce` della parte nel JSON: il resto della parte è musica o silenzio).
- Durata: entro 60 s (`controlli.mjs`); il primo è di 51 s.

## Testo e voce
- Frasi brevi da trailer, ma chi non conosce la storia deve capire chi sono i personaggi (ruolo alla prima volta) e qual è
  la posta in gioco. Nessuna conclusione: l'ultima battuta prima del titolo è una promessa o una sfida.
- Si può parlare del canale nella chiusura (deroga già usata negli Short promozionali); mai la durata totale del lungo.

## Tecnica
- JSON in `promo/<slug>.json` (`"formato": "promo"`), scena in `src/promo/<slug>/` (registrata in `src/promo/registro.ts`),
  spartito in `scripts/audio/<slug>.mjs`, voce con `node scripts/genera-voce.mjs <slug>`, video con
  `node scripts/promo/render.mjs <slug>`.
- Da riusare: `src/promo/trailer-ritorno-al-futuro/Scena.tsx` (elenco di inquadrature e cartelli, bande nere, entrata dal
  nero, spia nel buio, lampi, titolo, chiusura) e `comune.tsx` (camera e colori); nello spartito le funzioni `braam`, `stacco`
  e il ticchettio che accelera.
- **Musica dei trailer nuovi** (dal 24 nov 2026): si parte da `scripts/audio/trailer-comune.mjs` (`trailer(mix, { bpm,
  accordi })`): colpo del cartello (`braam`) e `cartelli` in salita misurabile (+1,5 dB a cartello), `frusciate` d'entrata
  dal nero, `archi` e `spiccato` con gli accordi contati dall'inizio della sezione, `corsa`, `buio` (spia e crescendo nel
  buio, con il vuoto prima del colpo) e `titolo`. Già con `compensa(mix)`. Gli spartiti dei trailer già fatti restano come sono.
- **Mondo del lungo in modalità «pulito»**: nei mondi nuovi tutto il mondo va dentro `<SenzaTesto attivo={pulito}>`
  (`src/lib/pulito.tsx`), che nasconde ogni testo anche se un `{!pulito && …}` è stato dimenticato; le insegne del
  paesaggio che devono restare portano `data-insegna`.

## Revisione
- Le immagini le approva l'editore guardando il video (come per tutti i video). Per il primo trailer l'editore ha deciso
  di unire senza i revisori di testi, musica e voce; per i prossimi si decide caso per caso.
