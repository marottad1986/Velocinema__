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
- Campioni deboli dentro un gruppo (Conjuring: `gong_scrape_2` ~11 dB sotto `gong_scrape_3`, come `Timpani1_Hit_v2`) → `colpo()` normalizza sul più forte del gruppo: per gli eventi chiave usare il campione forte e misurare il picco nel WAV. Teste dei file di tuono Red Library con blocchi o silenzi di montaggio → guardare l'inviluppo dei primi secondi prima di scegliere `da`.
- Prese degli effetti che partono su un silenzio (`metallo_colpi` muto fino a 0,55 s, `fiammata` a 0,25 s: Donnie Darko, Ritorno al futuro trilogia) → prima di usare un effetto nuovo guardare l'inviluppo dei primi 0,6 s e partire dall'attacco (`da`).
- Effetti tarati sul picco del `CATALOGO` quando il picco del file non è il suono usato (`tuono_forte`: picco nei primi 0,6 s, il tuono vero ~12 dB sotto) → misurare l'RMS della presa scelta prima di decidere il gain.
- Tratti che iniziano a metà battuta (capitoli da 15 o 17,5 s a 72 bpm): archi tenuti che cambiano accordo da `from` mentre spiccato e pizzicati seguono le battute assolute → seconde minori; gli accordi seguono sempre la battuta assoluta.
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
- Produzione successiva avviata nella stessa sessione con `send_later` (Il miglio verde dopo Donnie Darko, 16 nov) → ogni produzione in una sessione nuova: per la catena si crea subito la sessione della produzione successiva con il repository allegato e la si sveglia all'ora giusta (vedi sotto), mai un promemoria nella sessione che ha appena finito.
- Sessione aperta da un'attività programmata «sessione nuova a ogni avvio» (`create_new_session_on_fire`) senza repository né `add_repo`: push rifiutato (403), lavoro di Conjuring recuperato a mano con un git bundle passato dall'app (17 nov) → **mai più `create_new_session_on_fire`** per lavori che scrivono su GitHub. Si crea prima la sessione con `create_session` (`source_url` https://github.com/marottad1986/Velocinema__, titolo, senza prompt o con un prompt di sola attesa) e poi l'attività con `create_trigger` e `persistent_session_id` di quella sessione (una produzione = una sessione). Le attività **ricorrenti** invece non vanno su una sessione fissa (rilegge tutta la storia a ogni risveglio: troppi token): restano «sessione nuova a ogni avvio» con il repository allegato nell'attività, che solo l'editore può aggiungere dalle attività programmate di claude.ai (Modifica → repository). Se si crea un'attività ricorrente nuova che scrive su GitHub, chiedere all'editore di allegarle il repository prima di accenderla.
- Storie e video confermati ma non programmati (19 nov): L'Ultima Cena e Scissione programmate solo come video, senza le storie
  del giorno prima; Conjuring confermato il 17 ma mai programmato (la sessione aveva il push rifiutato e il lavoro è stato
  recuperato a mano, senza la programmazione), con il calendario che scriveva comunque «pronto/programmato». Trovato dai
  commenti della sera due giorni prima → video e storie si programmano insieme subito dopo la conferma, si verifica con
  `list_posts` prima di scrivere «programmato», e una sessione che non riesce a finire lo segnala subito nell'app
  (`SOCIAL.md`, «Pubblicazione automatica»).
- Avviso fallito per un campo sbagliato → usare sempre i campi di `SOCIAL.md` e controllare la risposta (`{"ok":true}` per l'app; Telegram dismesso il 17 nov).
- Idee di format nuovi arrivate dall'editore (X Factor, videogiochi) → il manager propone ogni domenica almeno un esperimento (`SOCIAL.md` «Idee nuove»).
- Video rifatto in una sessione solo per pubblicarlo (16 nov, Titanic): MEGA non è raggiungibile dalle sessioni → il workflow carica il video su PostFast e registra la chiave nel ramo `postfast-media`.
- Render nel cloud fallito per il download di Chrome (remotion.media bloccato) → `REMOTION_BROWSER=/opt/pw-browsers/chromium`.
- Uno script nuovo in `scripts/` faceva rigenerare TUTTI i film su GitHub Actions (16 nov, fermato a mano) → risolto il 17 nov: il codice comune non rigenera più nessun video già prodotto (`scripts/cambiati.mjs`); provare comunque con `git diff --name-only A B | node scripts/cambiati.mjs A B` prima di unire.
- Profilo Instagram personale collegato a PostFast al posto della pagina (16 nov) → prima di programmare, `list_accounts` e controllo di `platformUsername`.
