# Speciale: Edoardo Bove – «In un battito» (collaborazione con Mr.goal)

Brief per la sessione `/produzione`, preparato dal manager il 13 novembre 2026 partendo dal canovaccio dell'utente.
È la **prima «storia vera»** (persona reale, non un film di finzione) e la **prima collaborazione** con un'altra pagina.

## Uscita
- Documentario «In un battito» di Giovanni Troilo, 01 Distribution, evento al cinema **16, 17 e 18 novembre 2026**
  (presentato alla Festa del Cinema di Roma il 18 ottobre). Una fonte (Metropolitan Magazine) dice 17–19: riconfermare
  sul sito di 01 Distribution prima del render.
- **Proposta: domenica 15 novembre, 17:30**, in contemporanea su «In 2 minuti» e su Mr.goal (il giorno prima della prima
  sera in sala: tre giorni di tempo per decidere di andarci). Hunger Games, che era in calendario domenica, slitta a
  lunedì 16 o martedì 17 (è già pronto, e il film nuovo esce il 19). Alternativa: lunedì 16 alle 17:30.
- Produzione: sabato 14 dalla mattina (la produzione precedente è finita venerdì 13 alle 22:32), video su MEGA entro
  sabato sera, così domenica mattina c'è tempo per mandarlo a Mr.goal.

## Collaborazione visibile (copertina e inizio video)
- **Fotogramma 0 (miniatura)**: sopra il titolo l'etichetta «LA STORIA IN 2 MINUTI» e, accanto, un bollino doppio
  come quello degli speciali (`src/components/Speciale.tsx`), con i due nomi alla pari: **«IN 2 MINUTI × MR.GOAL»**.
  Nuovo campo `copertina.collab: "Mr.goal"` (così togliendolo il video torna normale); se Mr.goal manda il suo logo
  (PNG trasparente), il bollino diventa: cronometro «2'» di In 2 minuti × logo di Mr.goal. Tutto tra x 120 e 960.
- Sotto il titolo «EDOARDO BOVE»: «dal documentario In un battito · di Giovanni Troilo · 2026».
- Primi secondi: il bollino resta per tutta la copertina; la voce parte con l'aggancio (non si nomina la collaborazione
  a voce, così l'aggancio resta forte).
- **Finale**: «Ti è piaciuto?» / «Metti like» / «Segui le due pagine» con i due nomi (@in.2.minuti e il nome di
  Mr.goal) / «Commenta: lo vedrai al cinema?» (eccezione alla formula «Commenta con…» solo per questo speciale:
  aggiungerla a `controlli.mjs` legata al campo `collab`).
- Pubblicazione: su Instagram un **post Collab** (invito a Mr.goal come collaboratore: un solo post sui due profili,
  visualizzazioni e like sommati); su TikTok ogni pagina pubblica il proprio video alla stessa ora, con la menzione
  dell'altra nella didascalia.

## Regole (persone reali: come `TALENT.md`, più queste)
- **Nessuna persona disegnata**: niente Bove, compagni, medici o pubblico, nemmeno sagome. Il malore non si disegna:
  solo stadio, orologio fermo al 17', soccorsi visti da lontano (ambulanza, luci). Tono sobrio, mai musica drammatica
  sul minuto 17: lì la musica tace.
- Niente stemmi, loghi, sponsor o maglie copiate: colori delle squadre sì (giallorosso, viola, giallo-nero-rosso del
  Watford), stemmi no. Stadio Franchi e Careggi inventati nel nostro stile, riconoscibili solo dal contesto.
- Niente foto, clip o audio del documentario né d'agenzia; niente locandina ufficiale del documentario.
- **Una parola sola per il 1 dicembre: «malore»** (la usano tutte le fonti e la stampa del documentario; «arresto
  cardiaco» è più preciso ma le fonti non lo usano allo stesso modo). Non si dice dove è stato usato il defibrillatore.
- Non citare Edoardo Leo né altri crediti non confermati.
- Fatti con fonte nel campo `fonti` (sotto); se un fatto non si conferma, la frase si toglie.

## Correzioni al canovaccio
1. **Capitolo 8, regola italiana (da riscrivere)**: le fonti dicono che in Italia non è il dispositivo in sé a escludere
   dalle gare, ma la malattia che l'ha reso necessario (per Bove una cicatrice nel cuore; a Padova uno sciatore con
   defibrillatore ha avuto l'idoneità). Proposta: «In Italia, con il suo problema al cuore, i medici sportivi non
   possono dargli il via libera per le partite. / Così, come il danese Christian Eriksen, può giocare solo all'estero.»
   La task force di giugno 2026 non l'ho trovata confermata: si dice solo se la produzione trova la fonte, altrimenti
   la frase si toglie (il canovaccio lo prevede).
2. **Eriksen**: va presentato («il danese Christian Eriksen, che nel 2021 ha avuto un malore in campo») per chi non lo conosce.
3. **Tribune «fatte di sagome» (capitolo 7)**: vietate. Al loro posto i **seggiolini delle tribune che si alzano tutti
   insieme** (si ribaltano come quando ci si alza in piedi), sciarpe giallo-nere sulle balaustre, flash che si accendono.
4. **Durate**: copertina 4 + capitoli 112 + finale 4 (il canovaccio fa 111 + 5). Proposta: capitoli 8, 12, 11, 11, 9, 10,
   13, 13, 16, 9 (il capitolo 9 sul documentario prende il secondo in più).
5. **Ritmo e testo**: il canovaccio è a ~2 parole/s, sotto il nostro 2,8: si possono aggiungere i connettivi
   («così», «ma», «infatti») che il testo discorsivo richiede, restando sotto le 2,8 parole/s e tenendo i fatti uguali.
   Le date vanno scritte come si leggono («il primo dicembre 2024»).
6. **Ultima frase del capitolo 10 e finale** fanno la stessa domanda: nel capitolo 10 meglio chiudere su cosa si vede
   in sala («Più di un anno della sua vita, dal buio al campo.»), e lasciare la domanda al finale.
7. Etichetta dei capitoli: «CAPITOLO N DI 10».

## Fatti confermati (per il campo `fonti`)
- Documentario, regia di Troilo, 01 Distribution, sala 16–18 novembre, Festa di Roma 18 ottobre:
  https://www.voto10.it/cinema/in-un-battito-edoardo-bove-documentario-cinema/ ,
  https://www.dimensionesuonoroma.it/news/eventi-lifestyle/in-un-battito-la-rinascita-di-edoardo-bove-arriva-al-cinema-il-documentario-in-sala-il-16-17-e-18-novembre/
- Defibrillatore sottocutaneo impiantato il 10 dicembre 2024 a Careggi: https://www.corrieredellosport.it/news/notizia-ultima-ora/2024/12/10-136329799/bove_impiantato_defibrillatore_attesa_per_esito_esami
- Dimesso il 13 dicembre, 12 giorni dopo: https://www.agi.it/sport/news/2024-12-13/bove-dimesso-ospedale-29153153/amp/
- Ospite all'ultima serata di Sanremo, 15 febbraio 2025: https://www.agi.it/spettacolo/news/2025-02-15/festival-sanremo-edoardo-bove-ospite-30035175/
- Risoluzione con la Roma (17 gennaio 2026) e firma col Watford (21 gennaio): https://www.lapresse.it/calcio/2026/01/21/watford-ufficiale-lingaggio-di-edoardo-bove/ ,
  https://www.tuttomercatoweb.com/serie-a/bove-saluta-la-roma-un-legame-che-va-oltre-un-semplice-contratto-ci-vediamo-in-campo-2191282
- Rientro il 14 febbraio 2026 all'86' di Preston-Watford (2-2), pubblico in piedi; gol il 17 marzo al Wrexham (3-1, al 94'),
  506 giorni dopo l'ultimo (27 ottobre 2024): https://www.ilfattoquotidiano.it/2026/03/18/bove-gol-watford-malore-fiorentina-inter/8328042/ ,
  https://www.ansalatina.com/americalatina/noticia/deportes/2026/03/18/bove-volvio-al-gol_5e90837f-370a-4f07-9057-cc087cebae0b.html
- Regola italiana (la malattia, non il dispositivo): https://www.fiorentinanews.com/news/203033579014/in-italia-il-primo-via-libera-a-un-atleta-con-defibrillatore-sottocutaneo-professor-corrado-dopo-il-caso-bove-ci-si-e-fatti-un-idea-sbagliata-della-normativa
- Da confermare in produzione (voce Wikipedia italiana «Edoardo Bove»): vivaio della Roma dal 2012, esordio in Serie A il
  9 maggio 2021, Conference League 2021/22, prestito alla Fiorentina ad agosto 2024, gol nel 5-1 alla Roma del 27 ottobre
  2024, «in poco più di dieci minuti a Careggi», «il giorno dopo sveglio e vigile», task force di giugno 2026.

## Da chiedere all'utente / a Mr.goal
- Nome esatto della pagina e account (TikTok e Instagram) di Mr.goal; logo in PNG se lo vogliono nel bollino.
- Ora di uscita concordata (proposta: domenica 15 alle 17:30).
- Se c'è un accordo pagato con il distributore, la didascalia porta l'indicazione di contenuto sponsorizzato.
