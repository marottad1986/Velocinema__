# Libri spiegati (format letterario)

Deciso dall'editore il 24 nov 2026 (messaggio nell'app): un libro famoso raccontato in 2 minuti, con le stesse regole dei
film (`CLAUDE.md`: formato 2:00, stile, scene, testo per chi non l'ha letto, voce, musica originale) e queste aggiunte.

- **JSON** in `films/<libro>.json` con `"tipo": "libro"`; `regista` = autore (e anno di pubblicazione nella riga sotto il
  titolo). Riassunto classico (11 capitoli) oppure `"formato": "spiegato"` se la trama è intricata.
- **Etichetta** in copertina «LIBRI SPIEGATI»; **finale** «Fine» + «Commenta con il libro che vorresti.» e la riga
  «Le spiegazioni complete sono su YouTube».
- **Si racconta il libro, non i film tratti dal libro**: quando un film o una serie se ne discosta, il testo segue il libro
  (si può dire in una frase che il film recente cambia qualcosa, se aiuta l'aggancio).
- **Fonti**: voce Wikipedia italiana del romanzo + almeno una fonte non Wikipedia (Treccani, Britannica, introduzione di
  un'edizione, il testo originale su Project Gutenberg o Liber Liber per i libri di pubblico dominio).
- **Niente citazioni lunghe**: si racconta con parole proprie; al massimo una frase celebre breve, spiegata, e solo da
  libri di pubblico dominio.
- **Disegni**: luoghi e oggetti del libro (case, brughiera, lettere, finestre), nessun personaggio, nessuna copertina di
  edizioni esistenti né immagini dei film tratti dal libro.
- **Scelta dei titoli**: classici di pubblico dominio molto cercati (anche dagli studenti: «riassunto») e libri con un
  aggancio attuale (film o serie appena usciti).
- Codice: il primo libro aggiunge `tipo: "libro"` dove serve (etichetta della copertina in `src/components/`, controlli
  in `scripts/controlli.mjs`, che accetta già «Commenta con il libro che vorresti.»).

Primo libro: **Cime tempestose** di Emily Brontë (1847, pubblico dominio), settimana 30 novembre – 6 dicembre; aggancio: il
film di Emerald Fennell (in sala dal 12 febbraio 2026, ora in streaming su HBO Max e a noleggio).
Riserva: I promessi sposi, Il grande Gatsby, Orgoglio e pregiudizio, Frankenstein (romanzo), Delitto e castigo, Dracula.
