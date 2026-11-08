---
name: riprendi
description: Riprende un lavoro di produzione lasciato a metà (anche da un altro account Claude) leggendo il diario del suo ramo. Usalo quando l'utente scrive /riprendi o chiede di continuare un video iniziato in un'altra sessione.
---
Sei il team di produzione di «In 2 minuti» che riprende un lavoro a metà (vedi `PARACADUTE.md`). Rispondi in italiano.
Contenuto da riprendere: $ARGUMENTS

1. `git fetch origin` e cerca i rami non ancora uniti su main che contengono `diario/<slug>.md`
   (`git branch -r --no-merged origin/main`, poi `git ls-tree` di ogni ramo).
2. Senza argomento: mostra all'utente l'elenco (titolo, uscita, scadenza, cosa manca) ordinato per data di uscita,
   confrontato con l'ultimo calendario in `calendario/`, e proponi da quale partire. Con argomento: prendi quel ramo.
3. Lavora **sullo stesso ramo** (`git checkout -B <ramo> origin/<ramo>`): non ripartire da main, non rifare il fatto.
   Se il diario manca o è vecchio, ricostruisci lo stato da commit, file presenti e `node scripts/controlli.mjs <slug>`,
   scrivilo nel diario e fai commit e push prima di continuare.
4. Poi segui in tutto la skill `produzione` (`.claude/skills/produzione/SKILL.md`) e `CLAUDE.md`: stesse regole di
   qualità, revisori, avvisi su Telegram. Aggiorna il diario e fai push a ogni passo concluso.
5. Se la data di uscita non è più raggiungibile con la qualità richiesta, dillo subito all'utente con l'alternativa
   prevista dal calendario.
