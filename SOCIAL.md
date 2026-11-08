# Programmazione delle uscite (team social)

Come si sceglie e si programma cosa pubblicare sulla pagina «In 2 Minuti». Si rilegge ogni lunedì, prima di
proporre la settimana.

## Ritmo e orari (vincolante)
- **Ogni giorno alle 17:30** un'uscita principale, a rotazione tra **film**, **serie TV** e **Spiegato semplice**:
  ogni settimana 3 film, 2 serie e 2 Spiegato semplice (si può scambiare un film con una serie se i dati lo chiedono).
- **Sabato e domenica alle 10:00** un'uscita in più: quadri, canzoni, storie vere o storie.
- 9 uscite a settimana. Due titoli dello stesso genere (es. due horror) non stanno in giorni vicini.
- Mai ripubblicare un video già uscito sullo stesso canale (elenco in `calendario/pubblicati.md`).

## Il lunedì
1. Dati del profilo dal connettore **Metricool** (piano gratuito, brand «In 2 minuti», id `7728942`, fuso Europe/Rome),
   strumento `getAnalyticsDataByMetrics`. Metriche usate:
   - TikTok, per video (`TKPO`): 02 data e ora, 05 descrizione, 07 visualizzazioni, 08 like, 09 commenti, 10 condivisioni;
     andamento (`TKEV`): 07 follower, 08 nuovi follower al giorno.
   - Instagram Reels (`IGRE`): 02 data e ora, 03 testo, 23 visualizzazioni, 10 like, 07 commenti, 21 condivisioni,
     12 salvataggi, 11 copertura, 24 tempo medio di visione (s).
   - YouTube (`YTVP`): con il piano gratuito arrivano solo titoli e date, non i numeri (8 novembre 2026): per YouTube
     l'utente manda i dati di YouTube Studio quando servono.
   - I dati di TikTok arrivano con circa un giorno di ritardo. Se il connettore non risponde, l'utente manda gli screenshot.
2. Si aggiorna `calendario/pubblicati.md` e si legge cosa sta funzionando (generi, formati, giorni).
3. Si propone la **settimana successiva** (lunedì–domenica) in `calendario/<aaaa-mm-gg>.md`, con un'alternativa
   pronta per ogni contenuto da produrre e l'ordine in cui produrre.
4. Dopo l'approvazione si scrivono gli eventi nel **calendario principale** di Google Calendar (id `marottahs@gmail.com`, fuso Europe/Rome, via IFTTT con l'azione «Create a detailed event»; mai prima
   dell'approvazione):
   - uscita: «🎬 Film · Titolo», «📺 Serie · …», «💡 Spiegato · …», «🎨 Quadro · …», «🎵 Canzone · …», «📖 Storia · …»;
     descrizione con aggancio, stato (pronto / da produrre) e alternativa;
   - scadenze di produzione: «⏳ Titolo: pronto entro oggi», due giorni prima dell'uscita.
5. **Subito dopo l'approvazione** (sempre, senza aspettare che venga chiesto) si prepara il materiale social di ogni
   uscita della settimana in `calendario/<aaaa-mm-gg>-social.md`, così è pronto in anticipo:
   - **testi di pubblicazione** di ogni video (didascalia TikTok, titolo e descrizione YouTube), un blocco pronto per
     WhatsApp secondo il modello in `calendario/modelli-social.md`, con il prossimo video preso dal calendario;
   - **storia del giorno prima**: una locandina PNG per ogni uscita, secondo il modello in `calendario/modelli-social.md`
     (consegnata con titolo, format, data, orario e un suggerimento per la musica).
   Titoli, descrizioni e storie seguono i modelli di `calendario/modelli-social.md`.
   Valgono le regole sui testi di CLAUDE.md: fatti verificati, niente frasi come «La prossima volta che lo vedi…».
   Didascalia e titolo vanno anche nella descrizione dell'evento su Google Calendar, per averli sul telefono.

## Come si sceglie un titolo (la parte più importante)
Gli eventi della settimana (anniversari, uscite al cinema e in streaming, festività, eventi TV) danno 2–3 titoli.
**Tutti gli altri si scelgono per quanto sono appetibili**: devono portare visualizzazioni, like e follower.
Punteggio da 0 a 3 per ogni voce:

| Criterio | Domanda |
|---|---|
| **Mistero** | C'è un colpo di scena, un finale da capire o una regola da spiegare? (è ciò che rende di più sul profilo) |
| **Fama** | Lo conoscono anche quelli che non l'hanno visto? Il titolo da solo fa fermare lo scorrimento? |
| **Discussione** | Se ne parla ancora: finale discusso, teorie, «non l'ho capito», scene citate in rete? |
| **Momento** | È disponibile adesso su una piattaforma, è in classifica, sta per uscire un seguito o una nuova stagione? |
| **Puntate** | Porta a un seguito (stagione successiva, saga)? Chi lo vede torna per il prossimo. |
| **Disegnabile** | Luoghi e oggetti forti, senza bisogno di personaggi (regola vincolante: con 0 il titolo è scartato). |

Si scelgono i titoli con il punteggio più alto, poi si bilanciano tipo e genere sulla settimana.
- Il titolo più forte della settimana va nel giorno con più visualizzazioni (dai dati del profilo).
- Dopo un video che va molto bene, entro 3–4 giorni esce qualcosa di simile (il seguito, lo stesso regista, lo stesso genere).
- Il video migliore del momento si fissa in alto sul profilo.

## Fonti per le analisi
- Classifiche: Top 10 Netflix Italia (www.netflix.com/tudum/top10/italy), JustWatch Italia (popolari e dove vederli),
  box office Cinetel; FlixPatrol blocca i programmi (403), si usa la ricerca web.
- Tendenze: Google Trends Italia, TikTok Creative Center (hashtag e brani di tendenza in Italia).
- Uscite e calendari: MyMovies, FilmTV, ComingSoon, Sorrisi; trame e date su Wikipedia.

## Cosa dicono i dati (aggiornare ogni lunedì)
- 8 novembre 2026 (Metricool, TikTok + Instagram): **Spiegato semplice è il formato più forte** (Dark stagione 1:
  59.360 TikTok + 70.658 Instagram, 922 condivisioni su Instagram; Inception: 56.289 su Instagram in un giorno e mezzo;
  Dark stagione 2: 12.403 + 49.029). Seguono i film con colpo di scena (Interstellar, Truman, Shutter Island, The Others).
  Deboli: Cast Away (1.550 + 2.378), Jurassic Park, La La Land, Harry Potter e il primo quadro (Notte stellata,
  566 + 774, sabato alle 10:00). Le condivisioni, che portano follower, sono soprattutto sugli Spiegato.
- 5 novembre 2026: i più visti hanno mistero o una trama da capire (Dark stagione 1 in Spiegato semplice 52.838,
  Interstellar 48.317, Truman Show 36.277, Shutter Island 30.437); rendono poco i film d'atmosfera o d'avventura
  senza mistero (La La Land 2.473, Jurassic Park 1.235). Un commento: «finale inaspettato».

## Riserva di titoli (da riordinare con i dati)
- **Film con colpo di scena:** Il sesto senso, Fight Club, The Prestige, Seven, I soliti sospetti, Memento, Matrix,
  Parasite, Scappa – Get Out, Il silenzio degli innocenti, Psyco.
- **Spiegato semplice:** Dark stagione 3, Tenet, Donnie Darko, Mulholland Drive, Arrival, Primer, Lost, Severance, Westworld, 1899.
- **Serie (una stagione per video):** Breaking Bad 2–5, Stranger Things, Squid Game, La casa di carta, Lupin.
- **Weekend:** quadri (pubblico dominio, vedi `QUADRI.md`), canzoni famosissime, storie vere (formato da definire:
  servono regole proprie su persone reali, fonti e tono prima della prima uscita).
