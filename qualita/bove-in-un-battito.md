# Edoardo Bove – «In un battito» (storia vera, speciale con Mr.goal)

## Look
- Stadi a tutto schermo, «full immersion» (richiesta dell'utente, 14 novembre 2026): niente paesaggi, si sta dentro lo
  stadio (tunnel, curva dietro la porta, tribuna, bordo campo). Tribune piene di tifosi generici nel nostro stile (teste e
  spalle, nessun volto riconoscibile), sciarpe nei colori delle squadre, flash dei telefoni.
- Nessuna figura intera di calciatore: provata e scartata dall'utente («orribile»). Gli eventi si raccontano con oggetti:
  pallone, rete che si gonfia, tabellone, seggiolini, sciarpe, timbro, certificato. Bove non è mai riconoscibile.
- Il malore non si disegna: al minuto 17 stadio fermo, orologio, ambulanza lontana, musica che tace.
- Velatura: notte viola-blu negli stadi (#1A1830–#2C2456, 10–14%), calda all'alba (#E8913A, 8–10%), blu notte in ospedale (#142235).
- Accento: giallo #F5C518 solo sulla linea del battito e sugli oggetti chiave (maxischermo, tabellone, cartellino ESTERO).
- Colori delle squadre senza stemmi: Roma #8E1F2E/#F0B43A, Fiorentina #6A48A8, Watford #F5D21E/#16161A/#C8262E.

## Elementi comuni (`src/scenes/bove-in-un-battito/Comuni.tsx`)
`Crowd` (folla, anche di spalle con `back`), `Stand`, `Pitch`, `FloodTower`, `Ball`, `Scoreboard`, `HeartLine` + `heartPath`
(linea del battito), `Drizzle`, `UmbrellaPine`. Bollino della collaborazione `Collab` in `Locandina.tsx`.
