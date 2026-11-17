# Errori già fatti (da non ripetere)

Memoria della squadra: ogni errore trovato da un revisore o dall'editore che **si ripete** finisce qui come controllo da
fare prima, così non si paga un secondo passaggio. Si legge all'inizio di ogni produzione e prima di chiamare i revisori.
Regola: quando un revisore segnala lo stesso tipo di problema in due film diversi, chi produce aggiunge una riga qui (e, se
si può verificare in automatico, una regola in `scripts/controlli.mjs`). Righe brevi: problema → controllo.

## Immagini (dai verdetti di revisore-immagini, ott–nov 2026)
- Sagome o figure umane rientrate di nascosto (tribune, grotta, finestre, ombre) → cercare ogni forma che sembri una persona prima del pacchetto.
- Testi, cartellini, nodi o oggetti chiave fuori zona sicura (x 120–960, niente nei primi 250 px e negli ultimi 420) → fotogramma con la griglia delle zone su ogni scena.
- Scritte sovrapposte al titolo o ai sottotitoli, o che restano accese oltre il loro capitolo → controllare l'ultimo secondo di ogni capitolo.
- Inquadrature vuote o primo piano mancante → ogni scena ha primo piano (erba, siepi, cavi, oggetti) + piano medio + fondo.
- Oggetti chiave illeggibili in piccolo (tabellone, orologio, disco) → guardare il fotogramma a 1/4 di dimensione.
- Copertina: frase di lancio presente nel fotogramma 0 o entrata lenta → fotogramma 0 pulito, frase da 0,4 s in 0,3 s.
- Evento visivo sfasato rispetto alla frase che lo nomina → ogni evento agganciato a `cues[i]`, verificato su `tempi.md`.

## Musica (revisore-musica, quasi ogni film)
- Eventi fuori griglia (copertina compresa) → ogni istante passa da `griglia()`, anche in copertina.
- Nessun silenzio dopo un colpo forte → almeno un battito di pausa dopo sparo, tuono, eliminazione.
- Prese degli effetti sbagliate o oltre la fine del file → zero avvisi «ATTENZIONE effetto» da `npm run musica`.
- Tappeti (pioggia, vento) sopra la musica → `node scripts/livelli.mjs <film> --finestre` prima del revisore.
- Cambio di carattere (maggiore, crescendo) sulla battuta prima dell'evento → sull'evento visivo.
- Buchi tra le sezioni → nessun tratto muto non voluto nei passaggi di capitolo.
- Motivi che ricordano temi noti → motivo nuovo, controllato a orecchio contro i temi famosi del genere.
- Colpi chiave deboli (Donnie Darko, Scissione): `Timpani1_Hit_v2` è il colpo pianissimo di VCSL, alzare il gain non basta → per i colpi forti `Timpani1_Hit_v4` (gain 0,5–0,9) e controllare che il culmine sia il picco del film; `pausa` deve fermare anche gli archi tenuti.

## Testi (revisore-testi)
- Personaggi o persone non presentati al primo nome (Eriksen, Undici, Barb) → ogni nome ha il suo ruolo nella stessa frase.
- Parole che capisce solo chi conosce l'opera o il programma (Bootcamp, ballottaggio, Jukebox Night) → spiegate subito.
- Fatti non confermati (punteggi, date, crediti) → ogni numero ha la sua voce in `fonti`; se non c'è, la frase si toglie.
- Pronomi e soggetti ambigui tra due frasi → rileggere ogni riga da sola.

## Voce (revisore-voce)
- Righe troppo lunghe per la cadenza → stare sotto 2,8 parole/s (3,1 per Spiegato) prima di generare, non dopo.
- Date scritte in cifre lette male → scriverle come si dicono («il primo dicembre 2024»).

## Organizzazione (editore)
- Programmazione della domenica saltata o fatta a mano (15 nov) → l'attività programmata si spegne solo con un promemoria che la riaccende.
- Catena delle produzioni rotta da una sessione ferma (9, 11, 15 nov) → «Regista della coda» (vedi `ORGANIZZAZIONE.md`).
- Contenuto in calendario senza voce il giorno prima (La grande onda, 14 nov) → la voce è parte del «pronto»: senza `-voce.mp4` su MEGA il contenuto non è pronto.
- Produzione successiva avviata nella stessa sessione con `send_later` (Il miglio verde dopo Donnie Darko, 16 nov) → ogni produzione in una sessione nuova: per la catena si usa un'attività programmata che apre una sessione nuova (`create_trigger` con `create_new_session_on_fire`), mai un promemoria nella sessione che ha appena finito.
- Avviso fallito per un campo sbagliato → usare sempre i campi di `SOCIAL.md` e controllare la risposta (`{"ok":true}` per l'app; Telegram dismesso il 17 nov).
- Idee di format nuovi arrivate dall'editore (X Factor, videogiochi) → il manager propone ogni domenica almeno un esperimento (`SOCIAL.md` «Idee nuove»).
- Video rifatto in una sessione solo per pubblicarlo (16 nov, Titanic): MEGA non è raggiungibile dalle sessioni → il workflow carica il video su PostFast e registra la chiave nel ramo `postfast-media`.
- Render nel cloud fallito per il download di Chrome (remotion.media bloccato) → `REMOTION_BROWSER=/opt/pw-browsers/chromium`.
- Uno script nuovo in `scripts/` faceva rigenerare TUTTI i film su GitHub Actions (16 nov, fermato a mano) → risolto il 17 nov: il codice comune non rigenera più nessun video già prodotto (`scripts/cambiati.mjs`); provare comunque con `git diff --name-only A B | node scripts/cambiati.mjs A B` prima di unire.
- Profilo Instagram personale collegato a PostFast al posto della pagina (16 nov) → prima di programmare, `list_accounts` e controllo di `platformUsername`.
