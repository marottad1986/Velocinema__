# Come usare questo pacchetto in Claude Code

1. Decomprimi lo zip in una cartella, ad esempio `Documenti/riassunti-film`.
2. Apri la cartella in Claude Code.
3. Primo messaggio da inviare:

   Leggi CLAUDE.md, QUALITA.md, la cartella films/ e il codice in reference/. Configura il progetto
   (Remotion + ffmpeg). Poi ricostruisci il video di Shutter Island secondo films/shutter-island.json,
   applicando a ogni scena tutti i punti di QUALITA.md e verificando i criteri di accettazione.
   Prima fammi vedere due scene di prova (L'arrivo e La cella vuota), poi genera l'MP4 completo.

4. Se mancano Node.js o ffmpeg, Claude Code ti guida all'installazione.
5. Voce: metti le clip in `audio/shutter-island/` (00_copertina, 01_arrivo, …) e chiedi di montarla.
6. Nuovo film: chiedi di creare `films/<nome>.json` sullo stesso schema e di generarne il video.

Nota: verifica le condizioni di licenza di Remotion se l'attività cresce o coinvolge più persone.
