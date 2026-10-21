# Brief unico per disegnare una scena

Questo file basta per disegnare una scena (capitolo, copertina o finale) di qualsiasi film.
Le regole vincolanti restano in `CLAUDE.md` (formato, contenuti, testi) e `QUALITA.md` (qualità e suggerimenti
per scena): qui c'è il metodo per applicarle senza rileggere tutto il progetto.

## 1. Cosa leggere (e solo questo)
1. `films/<film>.json`: il capitolo (titolo, durata, `scena`, `sottotitoli`) e la palette.
2. `QUALITA.md` §8 (criteri) e §9 (suggerimenti per la tua scena) e la velatura del film in §6.
3. `src/lib/elements.tsx`: gli elementi pronti (elenco al §3). **Usali invece di ridisegnarli.**
4. Una sola scena d'esempio, la più simile alla tua (vedi §6). Non leggere le altre.

## 2. Scheletro di una scena

```tsx
import React from 'react';
import { camera, eo, eob, lerp, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Glow, Rain, Dust, NearMotes, flashAt } from '../../lib/elements';
import type { SceneProps } from '../../types';

// <Titolo>: <descrizione della scena dal JSON>.
// Piani: sfondo (0,2–0,3) · lontano (0,4–0,5) · soggetto (0,6–0,7) · primo piano (1,0–1,3) · particelle (1,4–2,0)

const K = '#0B1418'; // colore dei contorni
const r = rng(1234); // seme fisso: niente Math.random

export const NomeScena: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);        // pan ±40 px e zoom 1,04 → 1,09 già conformi a QUALITA §1
  const L = cam.layer;               // L(f) = traslazione del piano con fattore di parallasse f
  const evento = eob(seg(t, cues[2], cues[2] + 0.5)); // evento sincronizzato con la 3ª frase della voce
  const flash = flashAt(t, [3.0]);   // al massimo 2 lampi

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="xx" />
        <Lin id="xx-sky" stops={[[0, '#081118'], [0.4, '#16303B'], [0.6, '#2B5560'], [1, '#1A3640']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.25)}>{/* cielo/parete con gradiente a 3–4 tappe, luci di sfondo */}</g>
        <g transform={L(0.45)}>{/* sfondo lontano, senza contorni */}</g>
        <g transform={L(0.65)}>{/* soggetto: contorni 8–10 px, dettagli 4–6 px, accento solo sull'oggetto chiave */}</g>
        <g transform={L(1.2)}>{/* primo piano che esce dai bordi e incornicia */}</g>
        <g transform={L(1.7)}><NearMotes id="xx-near" t={t} /></g>
      </g>
      <Finish id="xx" tint="#0E3A40" /> {/* velatura del film (QUALITA §6) + vignettatura + grana fissa */}
    </svg>
  );
};
```

- Il file va in `src/scenes/<film>/<NomeScena>.tsx` e si registra in `src/scenes/<film>/index.ts`
  con la posizione del titolo: `id: { Component: NomeScena, title: { top: 392, size: 108 } }`
  (`dark: true` se il titolo deve essere scuro su fondo chiaro, `width` per andare a capo).
- Prefisso degli id dei gradienti: due lettere uniche per scena (`xx-…`), così non si scontrano nel video completo.
- `cues[i]` = secondo in cui compare la frase `i` dei sottotitoli: usalo per far coincidere gli eventi con la voce.
- Copertina e finale ricevono `PosterProps` (`t`, `dur`, `film`) e scrivono i propri testi:
  vedi `src/scenes/shutter-island/Copertina.tsx` e `Finale.tsx`; si collegano in `src/films.ts` (`cover`, `ending`).

## 3. Elementi pronti (`src/lib/elements.tsx`)
Tutti funzione di `t`, con seme e `id` per i gradienti. Catalogo visivo: composizioni `libreria--esterni` e `libreria--interni`.

| Gruppo | Elementi |
|---|---|
| Luce | `Glow` (alone che pulsa), `Beam` (fascio: fisso, `sweep` oscillante, `spin` da faro), `SunRays`, `flashAt` + `Lightning` |
| Cielo | `Stars` (anche `appear` una alla volta), `Moon`, `Clouds`, `ShootingStar`, `Gulls` |
| Acqua | `wave()`, `WaveBand` (fascia piena con schiuma), `WaveLines`, `Reflection` (riflessi sotto una luce), `Rain` far/near, `Drips` (goccia + increspatura), `GlassDrops` (gocce sul vetro) |
| Aria | `Fog`, `Smoke` (sbuffi), `Wisps` (volute di pipa/tazza), `Dust` (pulviscolo in un fascio), `NearMotes` (particelle vicine alla camera) |
| Fuoco | `Fire` (tre strati + alone), `flamePath`, `Embers` |
| Festa / musica | `Notes`, `StringLights` (luci di Natale, lampadine), `Neon` (insegna che si accende), `Fireflies`, `Confetti`, `Flyers` (fogli, foglie) |

Se ti serve un elemento che manca e che potrà servire ad altri film, aggiungilo a `elements.tsx` (stesse regole:
funzione pura di `t`, seme, `id`, niente filtri) e mettilo nel catalogo. Il resto si disegna nella scena.

## 4. Errori già fatti (da non ripetere)
- **Testi coperti.** Etichetta a y 262, titolo a y ≈380–500 a sinistra, sottotitoli a y 1270–1490 centrati.
  Gli oggetti chiave della scena stanno **tra y 520 e 1260**. Ricorda che lo zoom della camera (fino a 1,09
  attorno a y 1000) sposta verso l'alto ciò che sta sopra: lascia ~40 px di margine sotto il titolo.
- **Sfondo dietro il titolo troppo chiaro o troppo pieno.** Dietro il titolo serve una zona calma (cielo, parete);
  niente catene, crepe, fasci intensi o insegne che lo attraversano.
- **Accento ovunque.** L'arancione (o l'accento del film) va solo sull'oggetto narrativo chiave.
- **Elementi poco visibili.** Fumo, scia, gabbiani troppo tenui o piccoli: se non si vedono in un fotogramma
  ridotto, non esistono. Fumo con opacità ≥ 0,6, gabbiani con battito d'ali ampio.
- **Primo piano che non incornicia.** Il primo piano deve toccare i bordi (pontile, sbarre, rocce, tende),
  non stare al centro.
- **Metà bassa vuota.** Gli ultimi 420 px sono coperti dalle app ma devono avere comunque primo piano e particelle.
- **Fasce e riflessi che sembrano pali.** Un riflesso verticale va fatto a trattini tremolanti (`Reflection`).
- **Lampi.** Massimo due per scena, mai più di 3 al secondo: usa sempre `flashAt`.
- **Personaggi.** Mai, nemmeno sagome o mani: si raccontano luoghi e oggetti (cappello, scarpe, biglietto, tazza).
- **Props non JSON.** Le composizioni ricevono solo lo slug: non passare componenti o funzioni come props.

## 5. Verifica (due fotogrammi bastano)
In PowerShell (Node/ffmpeg non sono nel PATH di Bash):
```
$env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')
npx tsc --noEmit
node scripts/prova.mjs <film> <id> <secondo-evento> <secondo-tranquillo>
```
- Guarda i PNG in `out/prova/` con lo strumento di lettura immagini: uno nel momento dell'evento principale
  (lampo, oggetto che entra, scritta), uno in un momento tranquillo con un sottotitolo lungo a schermo.
- Controlla i criteri di QUALITA §8 e la lista del §4. Correggi e riguarda **solo** se qualcosa non va:
  di solito basta un giro di correzioni.
- Video del capitolo con musica: `npm run render -- <film> <id>`.

## 6. Scene d'esempio (Shutter Island)
Leggi la più vicina alla tua, una sola:
- esterno notturno con acqua: `Arrivo.tsx` · tempesta e faro: `Uragano.tsx` · alba: `Alba.tsx`
- interno con finestra e luce fredda: `Cella.tsx`, `Verita.tsx` · interno caldo con lampada: `Studio.tsx`
- fuoco: `Grotta.tsx`, `Incendio.tsx` · scritte animate (gesso, biglietti): `Lavagna.tsx`, `Biglietto.tsx`
- cancello, recinzioni, riflettore: `Ospedale.tsx` · locandina: `Copertina.tsx`, `Finale.tsx`

(Queste scene sono state scritte prima della libreria: dentro trovi ancora versioni locali di pioggia, fuoco
e alone. Nelle scene nuove usa gli elementi di `elements.tsx`.)

## 7. Nuovo film: passi in ordine
1. `films/<film>.json` sullo schema degli esistenti (durate: capitoli 112 s in tutto; copertina 4 + finale 4).
2. In `src/films.ts`: importa il JSON e aggiungi `{ slug, data, scenes: {} }`. Da qui il film si renderizza già
   con i segnaposto.
3. Una scena per capitolo seguendo questo brief, poi copertina e finale (`cover`, `ending`, `posterFont`).
4. Spartito della musica in `scripts/audio/<film>.mjs` (vedi `CLAUDE.md` §Musica), con gli effetti agganciati
   agli istanti degli eventi delle scene.
5. `npm run render -- <film>` → `out/<film>.mp4`; poi la voce con `npm run voce -- <film>`.

Per lavorare in parallelo con più agenti: un agente ogni 3 scene, ciascuno con questo file e il proprio elenco
di id; ognuno aggiunge solo le proprie righe a `index.ts` (modifiche piccole, mai riscrivere il file).
