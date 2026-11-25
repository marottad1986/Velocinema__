# Nuovo branding: 2M Studios

Ciao team,

questo pacchetto contiene il **nuovo branding del canale**: questo sarà il nostro nuovo logo. L'obiettivo è un'identità più professionale e riconoscibile, adatta a un progetto più ampio dei soli riassunti, da usare in futuro anche per i gadget.

## Il logo

Nasce da «In 2 minuti»: il **2** è giallo e la **M** è doppiata, con un clone giallo attaccato al 2 come richiamo al numero. «STUDIOS» corre in verticale accanto alla M.

## Contenuto del pacchetto

- `scheda_brand.png`: logo, colori, carattere e regole d'uso
- `foto_profilo_1080x1080.png`: per YouTube, Instagram, TikTok, Facebook
- `banner_youtube_2560x1440.png`
- `copertina_facebook_1640x624.png`
- `logo_colori_per_sfondi_scuri` e `logo_colori_per_sfondi_chiari` (PNG trasparente e SVG)
- `logo_bianco` e `logo_nero` (PNG trasparente e SVG), per ricami e stampe a un colore

## Colori e carattere

- Nero `#0B0B0C` (sfondo)
- Giallo `#FFC24B` (il 2 e la M clone, accenti)
- Panna `#F4EBDD` (la M e i testi)
- Carattere: **Inter Tight** (Extra Bold per logo e titoli)

Regole: non deformare il logo, non cambiarne i colori, lasciare sempre spazio libero intorno.

## Cosa vi chiedo

1. **Cosa ne pensate del logo e dei colori?** Ogni consiglio è benvenuto, anche su come usarlo nelle copertine dei video e nei post.

2. **Come gestiamo il nome?** Le strade che vedo:
   - tenere **«In 2 minuti»**, perché è già riconoscibile e ricercabile sui social;
   - passare a **«2M Studios»** (oppure «I2M Studios»), coerente con il nuovo logo e meno legato ai soli contenuti brevi;
   - una **via di mezzo**: nuovo nome con «ex In 2 minuti» in bio per qualche mese.

   Da tenere presente: esiste già una TV marocana che si chiama **2M**. Il nome non è identico, ma è nello stesso settore. Se avete altre proposte di nome, sono ben accette.

Aspetto i vostri pareri prima di aggiornare i profili.

Grazie,
Dado

---

## Decisioni dell'editore (25 nov 2026)
- Il logo resta com'è, sempre con «STUDIOS». Il nome del canale resta «In 2 minuti».
- Banner YouTube con una frase generica (né settore né durata): `banner_youtube_con_frase_2560x1440.png`,
  «Le grandi storie, spiegate semplice.» (Inter Tight Extra Bold, dentro la zona sicura 1546×423).
- Sigla «2M Studios» per i video lunghi e i trailer, come il logo di uno studio prima di un film: animazione in
  `src/sigla/Sigla.tsx` (composizioni `sigla-2m-studios` 16:9 e `sigla-2m-studios-verticale` 9:16, 3,5 s,
  `npx remotion studio src/sigla/index.ts`), jingle originale in `scripts/audio/sigla-2m-studios.mjs`
  (`suonaSigla(mix, t0)` dentro uno spartito, o da solo `node scripts/audio/sigla-2m-studios.mjs`). Anteprime in `sigla/`.
  Dove metterla nei lunghi e nei trailer: da confermare con l'editore prima di inserirla.
