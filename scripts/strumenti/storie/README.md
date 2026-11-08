# Locandine delle storie teaser

Generatori delle locandine (PNG 1080×1920) secondo il modello in `calendario/modelli-social.md`.
`base.py` contiene la struttura comune (logo con cronometro, badge, riquadro dell'illustrazione, titolo che si riduce da
solo entro 840 px, data, crediti, cornice di lampadine). Ogni altro `.py` è una locandina: palette, caratteri e
illustrazione SVG propri.

Uso (i percorsi sono in `/tmp/claude-0/storie/`):
1. scaricare i caratteri Google Fonts in `/tmp/claude-0/storie/fonts/` e scrivere `fonts.css` con i `@font-face` locali;
2. `python3 <locandina>.py` scrive l'HTML, poi `node render.js <file.html> <titolo>_locandina.png`
   (stampa la posizione di ogni elemento per controllare i margini);
3. aprire il PNG e controllare: nessun testo fuori dai margini o sovrapposto, badge, data e orario giusti, social presenti.
