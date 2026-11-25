# Passaggio di consegne: brand 2M Studios e sigla (25 nov 2026)

Da incollare a una nuova sessione: «Leggi `brand/2m-studios/PASSAGGIO.md` sul ramo `claude/quirky-volta-ajyqfo` e continua da lì.»

## Dove siamo
Ramo `claude/quirky-volta-ajyqfo` (già pushato, nessuna pull request). Tutto il materiale è in `brand/2m-studios/`
(pacchetto dell'editore, `LEGGIMI.md` con le decisioni, banner, anteprime della sigla in `sigla/`).

## Decisioni dell'editore (già prese, non riaprirle)
- Logo 2M Studios invariato, **sempre con «STUDIOS»**; colori nero `#0B0B0C`, giallo `#FFC24B`, panna `#F4EBDD`; Inter Tight.
- Il nome del canale **resta «In 2 minuti»**.
- Banner YouTube con una frase generica, senza settore né durata: fatto, `banner_youtube_con_frase_2560x1440.png`,
  «Le grandi storie, spiegate semplice.» (alternative proposte: «Tutto più chiaro, una storia alla volta.»,
  «Capire non è mai stato così semplice.»). In attesa del suo parere.
- Sigla iniziale nei **video lunghi e nei trailer**, «come il logo di uno studio prima di un film» (messaggio nell'app
  `msg-8204410764909-6a9756b8`, stato «preso in carico»).

## Fatto
- `src/sigla/Sigla.tsx` (+ `forme.ts` con i tracciati del logo, `Root.tsx`, `index.ts`): sigla di 3,5 s a 120 bpm.
  Composizioni `sigla-2m-studios` (1920×1080) e `sigla-2m-studios-verticale` (1080×1920).
  Tempi (`SIGLA`): fessura di luce 0–0,5 · il 2 sale 0,5 · M gialla 1,0 · la M panna si stacca 1,25 · STUDIOS + lampo 1,5 ·
  dissolvenza al nero 2,75–3,25. `SiglaScena` riceve `T, W, H` e si può montare dentro un lungo o un trailer.
- `scripts/audio/sigla-2m-studios.mjs`: jingle originale in Re maggiore (timpani e tromboni sul 2, corni sulla M, arpa,
  accordo pieno con piatto e glockenspiel). `suonaSigla(mix, t0)` dentro uno spartito (aggiungere `strumentiSigla` agli
  strumenti); da solo `node scripts/audio/sigla-2m-studios.mjs` → `out/sigla-2m-studios-musica.wav`.
- Render di prova: `REMOTION_BROWSER=/opt/pw-browsers/chromium npx remotion render src/sigla/index.ts sigla-2m-studios out/x.mp4`
  (nel cloud serve `REMOTION_BROWSER`), poi ffmpeg per unire il wav. Anteprime inviate all'editore in chat.

## Da fare
1. **Aspettare la risposta dell'editore su dove va la sigla.** Ha scritto «va bene alla fine dei video»: ambiguo (sigla alla
   fine? oppure il logo nel finale dei video?). Proposta fatta: nei lunghi dopo l'aggancio (15–25 s), nei trailer subito
   prima del titolo finale, perché `YOUTUBE.md` §2 vieta sigla e logo nel fotogramma 0. Se la vuole al secondo zero,
   aggiornare `YOUTUBE.md` §2, `TRAILER.md` e `VIDEO-LUNGO.md` di conseguenza.
2. Dopo la conferma: inserire la sigla in `src/lunghi/` (tratto nuovo in `tempi.ts`, con il campo nel JSON in `lunghi/`, solo
   per i lunghi nuovi) e in `src/promo/Promo.tsx` (campo opzionale nel JSON in `promo/`, così i trailer già fatti non
   cambiano); chiamare `suonaSigla` negli spartiti e far tacere la musica del video intorno alla sigla. Aggiungere un
   controllo in `scripts/controlli.mjs` se serve; documentare in `VIDEO-LUNGO.md`/`TRAILER.md` e una riga in `DECISIONI.md`.
3. Se l'editore intendeva il **logo nel finale** dei video verticali: campo opzionale nel JSON (i video già fatti restano
   come sono), logo piccolo nel riquadro del finale di `src/components/Film.tsx`, mai al posto del titolo.
4. A conferma ricevuta: messaggio dell'app su «fatto» (`POST /api/messaggi/msg-8204410764909-6a9756b8`), poi pull request
   (revisori musica e immagini per la sigla, regole del 16:9).

## Note
- `npx tsc --noEmit` ha già due errori vecchi in `src/promo/trailer-ritorno-al-futuro/Foto.tsx`, non legati alla sigla.
- I campioni si scaricano da soli in `campioni/` alla prima esecuzione dello spartito.
