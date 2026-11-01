# Joker: suggerimenti per le scene

Parte di `QUALITA.md` (regole generali e criteri di accettazione lì): qui solo il look del film e i suggerimenti scena per scena.

Look da città sporca anni Ottanta: mattoni anneriti, verde malato e senape, luci gialle dei lampioni e verdi dei neon,
il rosso dell'accento (#D2382E) solo sugli oggetti del clown e sui momenti chiave (cartello, completo, «JOKER» in
sovrimpressione, impronte). Elementi comuni in `src/scenes/joker/Comuni.tsx` (palazzi con scale antincendio, sacchi della
spazzatura, scarpa, completo rosso, pistola, televisore; niente parrucca: è il completo rosso a dire «Joker»). Persone mai, né il volto truccato: Arthur si racconta
con i suoi oggetti; la violenza è suggerita da lampi, luci che si spengono, oggetti a terra (mai armi puntate né corpi).
Niente locandina, figura sulle scale o logo del film; titolo in Anton.
Una sola immagine per capitolo, con un oggetto protagonista grande tra y 520 e 1260 e gli eventi delle tre frasi dentro
la stessa immagine (mai dissolvenze tra luoghi diversi). Oggetti con materiali (gradienti luce/ombra, bordi illuminati):
`JokerDefs` in `Comuni.tsx`. Attenzione: un gradiente su una linea perfettamente verticale o orizzontale non si vede
(riquadro di larghezza zero): per pali e barre usare `rect`.
- Un clown a Gotham: la vetrina «TV · RADIO» con il televisore che passa dal disturbo al palco col microfono, taxi e topo, cartello «SALDI!», sacchi e vapore.
- La risata che non si ferma: interno dell'autobus, il cartoncino della malattia sul sedile, luci a scatti, frenata e cartoncino strappato con l'impronta.
- La pistola sbagliata: corridoio di pediatria con disegni e palloncini, la pistola che cade dalla borsa del clown, il timbro «LICENZIATO».
- La notte in metropolitana: vagone con valigetta e cravatta, i tre neon che scoppiano (niente lampi), la stazione con «SIAMO TUTTI CLOWN».
- La lettera della madre: soggiorno con poltrona, lampada e TV «WAYNE SINDACO», la villa che si accende, la lettera aperta con la riga rossa.
- La verità sulla madre: archivio con schedario e lampada che oscilla, la cartella FLECK vista dall'alto, timbro «ADOZIONE», referto medico.
- Da solo: stanza d'ospedale con la finestra sulla casa della vicina (luce calda che si spegne), monitor a tempo con la musica che si appiattisce.
- L'invito in TV: studio visto dal pubblico, lampadine dell'insegna, schermo con il palco e «JOKER», applausometro, biglietto d'invito.
- Il ballo sulla scalinata: scalinata dal basso tra due muri, la porta che sbatte, il completo sulla ringhiera, impronte rosse a tempo, luci della polizia.
- In diretta: la vetrina dei sei televisori del primo capitolo sotto la pioggia, «JOKER», un solo lampo allo sparo, «COLLEGAMENTO INTERROTTO».
- Gotham brucia: auto della polizia rovesciata davanti al cinema, vetrina che si incrina, perle che rotolano, tutto svanisce nel grigio del manicomio
  e resta la maschera.
