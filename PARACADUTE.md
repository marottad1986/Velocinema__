# Paracadute: continuare con un altro account Claude

Se i token dell'account principale finiscono a metà settimana, il lavoro continua con un secondo account Claude.
Le conoscenze non vanno «passate» a mano: stanno tutte nel repository (`CLAUDE.md`, `SOCIAL.md`, `BRIEF-SCENA.md`,
`QUALITA.md`, `QUADRI.md`, `qualita/`, `calendario/`, i comandi `/manager`, `/produzione`, `/riprendi` e i quattro
revisori in `.claude/`). Ogni sessione nuova, su qualunque account, le legge da sola. Fuori dal repository restano
solo **accessi** (da preparare una volta) e **lavoro a metà** (salvato nei rami con il diario, sotto).

## 1. Preparare il secondo account (una volta sola, prima che serva)
Da fare con calma, non il giorno dell'emergenza. Spuntare ogni voce.
- [ ] **GitHub**: in claude.ai/code collegare lo stesso account GitHub (`marottad1986`) e installare/abilitare l'app
      Claude sul repository `marottad1986/Velocinema__`. Provare ad aprire una sessione sul repository.
- [ ] **Ambiente cloud**: creare un ambiente (es. «velocinema») con rete limitata più i registri di pacchetti
      (npm), e l'host `archive.org` e `github.com` se le sessioni devono scaricare campioni ed effetti
      (nell'account principale: stesse impostazioni dell'ambiente attuale, da copiare guardandole in Settings).
- [ ] **Voce ElevenLabs**: nell'ambiente, segreto di rete per l'host `api.elevenlabs.io`, intestazione `xi-api-key`,
      valore = chiave ElevenLabs (permessi Text to Speech e Voices: read). La voce Brando sta sull'account ElevenLabs,
      non su Claude: la chiave è la stessa e `scripts/audio/voce.json` ha già il `voice_id`.
- [ ] **Connettori** (claude.ai → Impostazioni → Connettori), solo se il secondo account deve fare anche il manager:
      Metricool (brand «In 2 minuti», id `7728942`), IFTTT (Google Calendar `marottahs@gmail.com` e Telegram, gruppo
      in2miniti), ElevenLabs se si usa dal connettore. Si collegano agli stessi account esterni di sempre.
- [ ] **MEGA**: niente da fare, i segreti `MEGA_EMAIL` e `MEGA_PASSWORD` stanno su GitHub Actions, non su Claude.
- [ ] **Prova**: aprire una sessione sul repository e scrivere
      `node scripts/genera-voce.mjs <film> --prova` e `node scripts/controlli.mjs`: se girano, l'account è pronto.

Cosa **non** si sposta: le attività programmate (la domenica alle 15:05) e le sessioni aperte restano sull'account
principale. Il secondo account serve per finire la settimana; la domenica, quando i token ripartono, si torna al principale.

## 2. Durante la settimana: il diario (vincolante, tutte le sessioni di produzione)
Perché un altro account possa riprendere, ogni sessione `/produzione` tiene `diario/<slug>.md` sul suo ramo e fa
commit e push **a ogni passo concluso** (testo approvato, ogni scena controllata, musica, voce, revisori), non solo alla
fine. Il diario è corto e sempre aggiornato:

```
# <Titolo> (<slug>) — uscita <giorno> <data> <ora>
Ramo: claude/<...>   ·   Scadenza: video su MEGA entro <data> sera   ·   Alternativa: <titolo>
## Fatto
- testo (fonti verificate, revisore-testi APPROVATO il …)
- scene: 01_arrivo ✓, 02_… ✓
## Da fare (in ordine)
- scena 05_…: idea già decisa: …
## Decisioni prese con l'utente
- …
## Problemi aperti
- …
```

Senza commit e push il lavoro fatto in una sessione cloud si perde quando il contenitore viene chiuso.

## 3. Il giorno che serve: riprendere
Nel secondo account, nuova sessione sul repository, e scrivere:

- `/riprendi` → elenca i rami con un diario non ancora uniti su main e propone cosa riprendere per primo
  (in base alle date del calendario);
- `/riprendi <slug>` → riprende quel contenuto dal punto scritto nel diario, sullo stesso ramo;
- `/produzione <titolo>` → per un contenuto mai iniziato (si parte da main come sempre);
- `/manager` → solo se serve il lavoro del team social (servono i connettori del punto 1).

Se una sessione dell'account principale si è fermata a metà senza aggiornare il diario, `/riprendi` ricostruisce lo
stato dal ramo (commit, file presenti, `node scripts/controlli.mjs <slug>`) e lo scrive nel diario prima di continuare.
