# X Factor 2026 (talent spiegati): suggerimenti per le scene

Parte di `QUALITA.md` (regole generali e criteri lì) e di `TALENT.md` (persone reali, vocabolario fisso): qui il look
dello studio e i suggerimenti scena per scena. Vale per il recupero (`x-factor-2026`) e per gli episodi settimanali.

Look da studio televisivo di sera, inventato da noi (mai la scenografia vera né la «X» del logo): parete di led a puntini,
americana con i fari in alto (scura e sottile, dietro l'etichetta), torri di luce ai lati sotto il titolo (i fasci
partono da lì e non attraversano il titolo), pavimento nero lucido con le doghe in prospettiva e il bordo a led nei
colori delle squadre, foschia bassa, pulviscolo nei fasci, spie e cavi in primo piano. Velatura viola notte (#2A1E4A, 12%).
Colori delle squadre: Gabbani #FF7A66, Jake La Furia #A8E063, Paola Iezzi #E08CFF, Irama #5CC8FF; ballottaggio rosso
#FF4A5A; oro #FFC53D solo sull'oggetto chiave (microfono della conduttrice, pass, «12 AI LIVE», «ESCONO IN 3»).
Componenti in `src/scenes/talent/` (`Studio.tsx`, `Squadre.tsx`, `Ballottaggio.tsx`, `Tabellone.tsx`), dati in
`src/scenes/talent/x-factor-2026.ts`.

Cose da controllare a ogni episodio (gli errori già visti):
- nomi lunghi sui cartellini (vanno su due righe da soli) e note sotto il nome corte («DALLE SELEZIONI», «FUORI · LIVE N»);
- gettoni dei voti: al massimo tre in fila sopra un'asta, mai fuori da x 120–960;
- lampade dei giudici ai lati, lontane dai cartellini; la scritta della parete di led è testo pieno su fascia scura
  (dentro la maschera dei led diventa illeggibile);
- titoli lunghi su due righe: oggetti chiave sotto y ≈ 640 (il tabellone ha il titolo a 74 px su una riga).

- Che cos'è X Factor?: palco che si accende, microfono dorato «GIORGIA · CONDUCE», le quattro poltrone di spalle che si accendono col nome, le luci delle squadre verso il palco; platea vuota in primo piano.
- Come si entra in gara?: tre «SÌ» su quattro, le quattro palette verdi, le tre sedie della Last Call sotto i fari, «12 AI LIVE».
- Chi c'è nelle quattro squadre?: camera che scorre di pedana in pedana; le aste si accendono mentre la voce dice i nomi.
- Come funziona una serata dal vivo?: due turni, telefono del televoto, le due aste avanti sotto i fasci rossi, «1 VOTO» / «3 VOTI».
- Ballottaggi (Live 1–3): data sulla parete, nomi, gettoni dei giudici sopra l'asta votata, asta spenta e barrata, pedana di chi esce sul fondo (Live 3 con il jukebox della serata di vecchie canzoni, Live 1 con il microfono dorato).
- Chi rientra in gara?: «RIPESCAGGIO», due aste col pass, corsa delle barre, cartellino di Teo Bok che diventa corallo, il posto di Alice che si riaccende col pass.
- Chi è ancora in gara?: tabellone a quattro squadre, numeri dei rimasti, riga della prossima puntata, bollino «ESCONO IN 3».
