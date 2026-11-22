# Proposte della squadra alla direzione

Ogni reparto e ogni agente (revisori compresi) scrive qui idee, miglioramenti, nuovi colleghi o procedure, risparmi di
token a parità di qualità e lavoro che ci sembra inutile. Una riga per proposta, le più recenti in alto:
data · chi propone · proposta · cosa si guadagna o risparmia · stato (aperta / portata all'editore / decisa → `DECISIONI.md` / scartata).
La direzione le legge all'inizio di ogni sessione, le porta all'editore e, una volta decise, le sposta in `DECISIONI.md`.
**L'editore le decide nell'app** «In 2 minuti» (Altro → Proposte: Approva, Più avanti, Scarta): se approva, lo sviluppo
parte da solo; procedura nella skill `app` (punto 4). L'app riconosce ogni proposta da data, autore e inizio del testo:
in una proposta già scritta **non cambiare questi tre elementi**, aggiorna solo lo stato in fondo alla riga.

## Aperte
- 17 nov 2026 · revisore-musica (Scissione) · **Colpi che si sentono anche sotto la voce**: il ducking di `scripts/voce.mjs`
  (sidechaincompress, comune a tutti) schiaccia i timpani chiave che cadono mentre la voce parla; proposta: ducking più
  leggero sotto i 150 Hz, oppure i colpi chiave nelle pause della voce; e misurare l'emergere dei colpi sul video con la
  voce, non solo sul wav della musica. Cambia il codice comune: serve il via libera. · colpi di scena più forti · decisa dall'editore il 17 nov 2026, fatta (ducking a due bande in `scripts/voce.mjs`; la misura sul video con la voce resta da fare)
- 17 nov 2026 · revisore-voce (Scissione) · **Ritmo delle frasi dopo il montaggio**: `ascolta-voce.mjs` calcoli le
  parole al secondo di ogni frase come suonerà nel video (pause a 0,25 s e accelerazione applicata), non solo sulla clip
  grezza: una frase a 3,5 grezza diventa 3,8 nel video senza avviso. · meno clip rifatte · aperta
- 17 nov 2026 · revisore-musica (Scissione) · **Colpi coperti visibili subito**: `pausa` degli spartiti che silenzi
  anche archi tenuti e bordone (così «tace un battito» è automatico), e in `scripts/livelli.mjs` una riga per ogni `clip` e
  `timp` con il picco del suono contro la musica nello stesso istante. · meno secondi passaggi del revisore · aperta
- 17 nov 2026 · revisore-voce (Scissione) · **Velocità della voce per capitolo**: permettere nel JSON una `speed` per
  capitolo (oggi `voce_impostazioni` vale per tutto il contenuto, `scripts/genera-voce.mjs`), così un capitolo denso si
  genera già a 1,08–1,10 invece di essere accelerato dopo con atempo, che si sente di più; e un obiettivo di 2,9 parole/s
  nei testi degli Spiegato semplice. · voce più naturale nei capitoli densi · aperta
- 17 nov 2026 · produzione (Scissione) · **`Snow` nella libreria comune**: la neve a due livelli chiusa in un riquadro
  (`src/scenes/scissione-stagione-1/Piani.tsx`) serve anche a Shining, Frozen, Natale; non l'ho messa in
  `src/lib/elements.tsx` perché toccare il codice comune rigenera tutti i film su MEGA. Proposta: spostarla insieme al
  prossimo cambio di codice comune già previsto (stesso giro di render), o aggiungere a `scripts/cambiati.mjs` l'eccezione
  «solo elementi AGGIUNTI a elements.tsx = nessun film da rigenerare». · risparmia render e rende la tecnica di tutti · **fatta il 17 nov** su richiesta dell'editore (eccezione in `scripts/cambiati.mjs`, `Snow` in `src/lib/elements.tsx`)
- 16 nov 2026 · direzione · **Media kit** di «In 2 minuti» (una pagina: chi siamo, numeri per piattaforma, pubblico, formati,
  esempi, cosa offriamo a un distributore o a una piattaforma: video dedicato all'uscita, Spiegato semplice prima della nuova
  stagione, storia con link). Senza un media kit non si chiede una collaborazione in modo serio. · prerequisito per vendere ·
  approvata il 16 nov, da preparare con i numeri di fine mese (il manager li aggiorna ogni mese)
- 16 nov 2026 · direzione · **Listino e contatti dei distributori**: elenco degli uffici stampa e marketing di distributori
  italiani e piattaforme (cinema, streaming, videogiochi) con il prossimo titolo di ciascuno nel nostro calendario; per ogni
  uscita «sponsorizzabile» un messaggio pronto *prima* dell'uscita (dopo è tardi per pagarla). L'invio resta all'editore. ·
  trasforma le uscite attuali in trattative · **decisa il 16 nov** (con cautela: 3 titoli a settimana, primi contatti in `collaborazioni/2026-11-16.md`)
- 16 nov 2026 · direzione · **Dati per vendere**: il manager aggiunge alla domenica le metriche che chiedono gli sponsor
  (visualizzazioni medie per video negli ultimi 30 giorni, tasso di condivisione, pubblico per età e città dai pannelli
  delle app). · rende il media kit credibile · aperta
- 17 nov 2026 · revisore-voce (The Conjuring) · **Trascrizioni e clip sempre allineate**: `ascolta-voce.mjs` tiene in cache
  le trascrizioni anche quando una clip viene rigenerata (in The Conjuring il revisore ha letto trascrizioni vecchie e ha
  segnalato tre clip «sbagliate» che erano giuste). `genera-voce.mjs` salva accanto a ogni clip un'impronta del testo
  usato; `ascolta-voce.mjs` rifà la trascrizione se la clip è più nuova della cache e segnala le clip vecchie rispetto al
  JSON, così si evitano falsi allarmi e crediti sprecati. Per i nomi stranieri si decide la `pronuncia` prima della prima
  generazione. · meno passaggi a vuoto dei revisori · aperta
- 18 nov 2026 · produzione (dai revisori di Ritorno al futuro, trilogia): `clip()` avvisi quando una presa parte su più di 0,1 s di silenzio, come già fa per le prese oltre la fine; `ascolta-voce.mjs` rifaccia la trascrizione quando la clip è più recente della cache (dopo una rigenerazione il report mostrava la clip vecchia).
- 18 nov 2026 · produzione (dal revisore musica): `scripts/livelli.mjs` anche per i video lunghi e `livelli.txt` nel pacchetto dei lunghi, così vuoti tra le sezioni e picchi si vedono senza misure a mano.
- 19 nov 2026 · direzione (idea dell'editore): **«In 2 minuti Kids»**, video lunghi per bambini su un **canale YouTube
  separato** (mai sul canale principale: i video «per bambini» perdono annunci personalizzati, commenti, schermate finali e
  notifiche, e mescolati ai thriller e agli horror confondono l'algoritmo). Due formati con ricerca già misurata il 19 nov:
  fiabe di pubblico dominio («la storia di Babbo Natale», «di Pinocchio», «di Cappuccetto Rosso» sono i primi tre
  suggerimenti di «la storia di») e «spiegato ai bambini» (universo, vulcani, terremoti, animali). Partenza consigliata a
  gennaio 2027, dopo il traguardo YouTube del 31 dicembre, con un episodio pilota; regole proprie da scrivere prima (fiabe
  con animali e oggetti, voce più calda, nessuna raccolta di dati dei bambini). · un secondo canale che cresce con le
  visualizzazioni ripetute dei bambini · aperta
- 22 nov 2026 · **Prima di YouTube per ogni lungo** (manager, da una domanda dell'editore sulle live automatiche): pubblicare i lunghi come Premiere (conto alla rovescia e chat dal vivo all'ora fissa, nessuno presente); niente LIVE preregistrate su TikTok (vietate); diretta 24/7 in loop solo dopo i 1.000 iscritti. · direzione → editore
