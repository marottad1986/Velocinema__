# Passaggio di consegne: brand 2M Studios e sigla (aggiornato il 25 nov 2026, sera)

Da incollare a una nuova sessione: «Leggi `brand/2m-studios/PASSAGGIO.md` sul ramo `claude/quirky-volta-ajyqfo` e continua da lì.»

## Dove siamo
Ramo `claude/quirky-volta-ajyqfo` (pushato, nessuna pull request). Materiale in `brand/2m-studios/` (decisioni in `LEGGIMI.md`).

## Decisioni dell'editore (già prese, non riaprirle)
- Logo 2M Studios invariato, sempre con «STUDIOS»; nero `#0B0B0C`, giallo `#FFC24B`, panna `#F4EBDD`; Inter Tight. Nome del canale: «In 2 minuti».
- Banner YouTube con frase: fatto (`banner_youtube_con_frase_2560x1440.png`).
- **Grafica della sigla: «Zoom»** (scelta tra quattro prove): fatta in `src/sigla/Sigla.tsx`, anteprime `sigla/sigla-2m-studios.mp4`
  e `sigla/sigla-2m-studios-verticale.mp4` (con la musica). Le prove scartate in `sigla/prove/`.
- **Musica della sigla: per ora l'originale** (`scripts/audio/sigla-2m-studios.mjs`, `suonaSigla(mix, t0)`). L'editore ci ripensa:
  le prove di suono sono in `suono/` (vedi `LEGGIMI.md` per le indicazioni raccolte). Se cambia, tenere gli stessi istanti
  (`SIGLA`: 0,5 il 2 · 1,0 la M · 1,25 lo stacco · 1,5 STUDIOS) o aggiornare anche `Sigla.tsx`.

## Fatto (25 nov 2026)
- **Posizione decisa dall'editore**: sigla al secondo zero solo nei video lunghi di YouTube (`"sigla": true`), logo alla
  fine dei trailer (`"sigla_finale": true`). Codice in `src/lunghi/` (tratto `sigla` in `tempi.ts`), `src/promo/`,
  `scripts/lunghi/render.mjs`, `scripts/promo/render.mjs` (jingle da `scriviSigla()`), `scripts/controlli.mjs`.
  Regole in `YOUTUBE.md` §2, `VIDEO-LUNGO.md`, `TRAILER.md` punto 8, `DECISIONI.md`. Esempi in `sigla/prove/esempio-*.mp4`.

## Da fare
1. Pull request del ramo verso main (revisori musica e immagini per la sigla, regole del 16:9), poi unione.
2. Messaggio dell'app su «fatto» (`POST /api/messaggi/msg-8204410764909-6a9756b8`) da una sessione della squadra (serve la
   chiave dell'app, che c'è solo nell'ambiente cloud).
3. Il primo lungo nuovo e il primo trailer nuovo si fanno con la sigla accesa.
## Note
- `npx tsc --noEmit` ha due errori vecchi in `src/promo/trailer-ritorno-al-futuro/Foto.tsx`, non legati alla sigla.
- Mai script nuovi in `scripts/` senza aggiungerli a «non cambiano i video» di `scripts/cambiati.mjs` (ERRORI.md): per questo
  le prove di suono stanno in `brand/2m-studios/suono/`.
