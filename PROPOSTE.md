# Proposte della squadra alla direzione

Ogni reparto e ogni agente (revisori compresi) scrive qui idee, miglioramenti, nuovi colleghi o procedure, risparmi di
token a parità di qualità e lavoro che ci sembra inutile. Una riga per proposta, le più recenti in alto:
data · chi propone · proposta · cosa si guadagna o risparmia · stato (aperta / portata all'editore / decisa → `DECISIONI.md` / scartata).
La direzione le legge all'inizio di ogni sessione, le porta all'editore e, una volta decise, le sposta in `DECISIONI.md`.

## Aperte
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
  «solo elementi AGGIUNTI a elements.tsx = nessun film da rigenerare». · risparmia render e rende la tecnica di tutti · aperta
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
