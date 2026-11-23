import React from 'react';
import { eio, eo, lerp, seg } from '../../lib/anim';
import { HAND, SANS } from '../../lib/fonts';
import { Glow } from '../../lib/elements';
import { Corridoio } from '../../lib/liminale';
import type { SceneProps } from '../../types';
import { Mondo } from '../../lunghi/backrooms-spiegato/Mondo';
import { E as EL, S as SL, ev as evL } from '../../lunghi/backrooms-spiegato/Tempi';
import { CasaMary, INK, L0, NIGHT, PAPER, RED, X, YEL } from '../../lunghi/backrooms-spiegato/Luoghi';
import { PirataPov, PortaInFondo, SulMuro } from '../../lunghi/backrooms-spiegato/Pov';
import { Anello, Cartello, Icona, Nodo, Tag } from '../../lunghi/backrooms-spiegato/Segni';

// «Backrooms: il finale in 2 minuti» (Spiegato semplice, verticale), ricavato dal video lungo «Backrooms spiegato»:
// lo schema è lo STESSO MONDO del lungo (la città in sezione sopra il Livello 0, src/lunghi/backrooms-spiegato/) visto in
// 9:16, con una camera propria per ogni capitolo, e il corridoio in prospettiva (src/lib/liminale.tsx) quando si è dentro
// le stanze gialle. Personaggi = cerchi con l'oggetto (cartellino del prezzo = Clark, taccuino = Mary, telecamera = Phil,
// cappello = il pirata), cartelli «LA REGOLA» e «TEORIA», anello rosso = il nodo da capire. Titolo piccolo in alto (64 px):
// lo schema sta tra il titolo (y ≈ 380–450) e i sottotitoli (y 1270). Scritte e nodi tra x 120 e 960.

const Y0 = (L0.top + L0.bot) / 2;
type Cam = { x: number; y: number; z: number };
/** Camera da a a b nel tempo [t0, t1] del capitolo. */
const muovi = (t: number, t0: number, t1: number, a: Cam, b: Cam): Cam => {
  const p = eio(seg(t, t0, t1));
  return { x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p), z: Math.exp(lerp(Math.log(a.z), Math.log(b.z), p)) };
};
const V = { w: 1080, h: 1920 };
const Cor: React.FC<{ t: number; z: number; id: string; oggetti?: React.ComponentProps<typeof Corridoio>['oggetti']; rotto?: number; luce?: number; x?: number; children?: React.ReactNode }> = (p) => (
  <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
    <Corridoio T={p.t} z={p.z} w={1080} h={1920} id={p.id} seed={5} oggetti={p.oggetti} rotto={p.rotto} luce={p.luce} x={p.x ?? 0} />
    {p.children}
  </svg>
);
const Sopra: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>{children}</svg>
);
const Mano: React.FC<{ t: number; t0: number; x: number; y: number; text: string; size?: number; color?: string; until?: number }> = ({ t, t0, x, y, text, size = 64, color = YEL, until = 1e9 }) =>
  t < t0 || t > until + 0.5 ? null : (
    <text x={x} y={y} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={size} fill={color} stroke={NIGHT} strokeWidth={size * 0.17} paintOrder="stroke"
      opacity={seg(t, t0, t0 + 0.4) * (1 - seg(t, until, until + 0.5))}>{text}</text>
  );
/** Ombra in alto, dietro il titolo del capitolo (lo schema è chiaro: il titolo resta leggibile). */
const Ombra = () => (
  <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 600, background: 'linear-gradient(180deg, rgba(10,9,4,.85) 0%, rgba(10,9,4,.55) 55%, rgba(10,9,4,0) 100%)' }} />
);

export const makeSchema = (id: string): React.FC<SceneProps> => {
  const Scena: React.FC<SceneProps> = ({ t, cues, griglia }) => {
    const c = (i: number, d = 0) => griglia(cues[i] + d);
    switch (id) {
      // 1. le stanze gialle: la camera cammina; le date
      case 'stanze': return (
        <>
          <Cor t={t} z={t * 1.1} id="bf-st" oggetti={(p) => <><PortaInFondo p={p} z={30} T={t} apre={0.3} /><SulMuro p={p} side={-1} z={8} y={2.0} text="LIVELLO 0" size={220} color="#3A2A10" font={SANS} /></>} />
          <Ombra />
          <Sopra>
            <Tag T={t} t0={c(1, 1.2)} x={540} y={620} text="UNA FOTO · 2019" size={56} until={c(2, -0.2)} />
            <Tag T={t} t0={c(2, 0.6)} x={540} y={620} text="IL FILM · 2026" size={56} bg={RED} fg={PAPER} />
            <Mano t={t} t0={c(2, 1.6)} x={540} y={760} text="di Kane Parsons" size={70} />
          </Sopra>
        </>
      );
      // 2. il negozio di Clark e la fessura nel seminterrato
      case 'fessura': {
        const cam = muovi(t, 0, c(1), { x: X.negozio - 200, y: -200, z: 0.95 }, { x: X.fessura - 120, y: 80, z: 1.5 });
        const giu = eio(seg(t, c(2), c(2, 2.4)));
        return (
          <>
            <Mondo T={evL('fessura', 1, 1) + t} cam={muovi(t, c(2), c(2, 2.4), cam, { x: X.fessura, y: Y0 - 120, z: 1.05 })} w={1080} h={1920} pulito />
            <Ombra />
            <Sopra>
              <Nodo T={t} t0={0.4} x={lerp(380, 600, giu)} y={lerp(700, 1150, giu)} icon="prezzo" name="CLARK" sub="ex architetto" />
              <Tag T={t} t0={c(0, 1.6)} x={540} y={560} text="NEGOZIO DI MOBILI" size={48} until={c(1, 0.4)} />
              <Tag T={t} t0={c(1, 0.8)} x={700} y={560} text="UNA FESSURA" size={52} until={c(2, 0.6)} />
            </Sopra>
          </>
        );
      }
      // 3. la regola: le stanze copiate, la casa che diventa copie sempre più storte, le copie bianche a tavola
      case 'regola': {
        const cam = muovi(t, 0, c(2), { x: X.tavola + 300, y: Y0 - 100, z: 0.9 }, { x: X.tavola + 60, y: Y0 - 20, z: 1.7 });
        return (
          <>
            <Mondo T={SL('regola') + 3 + t} cam={cam} w={1080} h={1920} pulito />
            <Ombra />
            <Sopra>
              <Cartello T={t} t0={c(1, 0.2)} x={540} y={640} head="LA REGOLA" text="COPIANO I RICORDI" />
              <Mano t={t} t0={c(1, 2)} x={540} y={790} text="ma male" size={80} until={c(2, 1)} />
              <Tag T={t} t0={c(2, 1.2)} x={540} y={1180} text="ANCHE LE PERSONE" size={48} bg="#C8C2B0" />
            </Sopra>
          </>
        );
      }
      // 4. il pirata: l'insegna del negozio, la copia gigante del cappello nel Livello 0, Clark ucciso
      case 'pirata': {
        const cam = muovi(t, 0, c(1, 0.4), { x: X.negozio - 400, y: -420, z: 1.6 }, { x: X.tavola + 200, y: Y0 - 40, z: 1.25 });
        return (
          <>
            <Mondo T={evL('pirata', 1, 2.6) + t} cam={cam} w={1080} h={1920} pulito />
            <Ombra />
            <Sopra>
              <Tag T={t} t0={c(0, 1.6)} x={540} y={600} text="LA MASCOTTE" size={52} until={c(1)} />
              <Tag T={t} t0={c(1, 1.2)} x={540} y={600} text="COPIA GIGANTE" size={56} bg="#C8C2B0" />
              <Nodo T={t} t0={c(1, 0.8)} x={360} y={1120} icon="prezzo" name="CLARK" dead={seg(t, c(2, 0.6), c(2, 1.2))} />
              <Nodo T={t} t0={c(1, 1.4)} x={720} y={760} icon="cappello" name="IL PIRATA" ghost={1} />
            </Sopra>
          </>
        );
      }
      // 5. la fuga e il colpo del cemento (momento clou), poi il gas e le torce di Async
      case 'cemento': {
        const colpo = c(1, 0.8);
        const z = 400 - t * 2.6;
        const dist = lerp(22, 11, eio(seg(t, 0, c(1))));
        const lancio = eio(seg(t, c(1, 0.2), colpo));
        const gas = seg(t, c(2, 0.4), c(2, 2));
        const buio = seg(t, colpo - 0.6, colpo + 0.1) * (1 - seg(t, colpo + 0.3, colpo + 1.4));
        const lampo = t >= colpo ? 1 - seg(t, colpo, colpo + 0.35) : 0;
        return (
          <>
            <Cor t={t} z={z} id="bf-cem" rotto={1} x={Math.sin(t * 6) * 0.15}
              oggetti={(p) => (
                <g>
                  {t < c(2, 1.6) && <PirataPov p={p} z={z + dist} T={t} rotto={seg(t, colpo, colpo + 0.6)} />}
                  {t >= c(1, 0.2) && t < colpo + 0.1 && (() => {
                    const a = p(lerp(0.3, 0.1, lancio), lerp(1.0, 2.2, lancio) + Math.sin(lancio * Math.PI) * 0.6, lerp(z + 0.8, z + dist, lancio));
                    return a ? <g transform={`translate(${a.x} ${a.y}) rotate(${lancio * 540}) scale(${a.s / 140})`}><Icona k="cemento" /></g> : null;
                  })()}
                </g>
              )} />
            <Ombra />
            <Sopra>
              {gas > 0 && <rect width={1080} height={1920} fill="#7ACA7A" opacity={0.35 * gas} />}
              {[0, 1, 2].map((i) => <g key={i} opacity={seg(t, c(2, 1 + i * 0.4), c(2, 1.4 + i * 0.4))}><Glow id={`bf-t${i}`} x={300 + i * 240} y={1000} r={140} t={t} color="#FFF4C8" amp={0.1} rate={3} opacity={0.8} /></g>)}
              <Nodo T={t} t0={0.4} x={300} y={1120} icon="taccuino" name="MARY" sub="la psicologa" fade={1 - seg(t, c(1), c(1, 0.4))} />
              <Tag T={t} t0={colpo + 0.9} x={540} y={640} text="UN PEZZO DI CEMENTO" size={50} until={c(2, 0.2)} />
              <Tag T={t} t0={c(2, 1.2)} x={540} y={640} text="ASYNC" size={64} bg="#7FC6D8" />
              <rect width={1080} height={1920} fill="#020203" opacity={0.85 * buio} />
              <rect width={1080} height={1920} fill="#FFF6DA" opacity={0.45 * lampo} />
            </Sopra>
          </>
        );
      }
      // 6. Async: la stanzetta dell'interrogatorio
      case 'async': {
        const cam = muovi(t, 0, c(1), { x: X.async, y: -60, z: 0.9 }, { x: X.stanzetta + 50, y: 170, z: 1.6 });
        return (
          <>
            <Mondo T={SL('phil') + 4 + t} cam={cam} w={1080} h={1920} pulito />
            <Ombra />
            <Sopra>
              <Tag T={t} t0={c(0, 1)} x={540} y={580} text="IN SEGRETO, DA ANNI" size={48} until={c(1)} />
              <Nodo T={t} t0={c(1, 0.4)} x={330} y={1100} icon="telecamera" name="PHIL" sub="scienziato di Async" />
              <Nodo T={t} t0={c(1, 1)} x={750} y={1100} icon="taccuino" name="MARY" />
              <Tag T={t} t0={c(2, 1.6)} x={540} y={640} text="«NON DECIDO IO»" size={58} bg={RED} fg={PAPER} />
            </Sopra>
          </>
        );
      }
      // 7. l'ultima scena: i luoghi copiati, la stanzetta, la copia deforme di Mary
      case 'scena': {
        const cam = muovi(t, 0, c(1, 1), { x: X.copiaNeg, y: Y0, z: 1.5 }, { x: X.copiaStudio, y: Y0, z: 1.5 });
        const cam2 = muovi(t, c(1, 1), c(2, 0.4), cam, { x: X.copiaStanza - 10, y: Y0 + 10, z: 2.3 });
        return (
          <>
            <Mondo T={SL('montaggio') + 6 + t * 0.5} cam={cam2} w={1080} h={1920} pulito />
            <Ombra />
            <Sopra>
              <Tag T={t} t0={c(0, 1)} x={540} y={600} text="I LUOGHI, COPIATI" size={50} bg="#C8C2B0" until={c(2)} />
              <Tag T={t} t0={c(2, 0.2)} x={540} y={600} text="LA STANZETTA" size={52} bg="#C8C2B0" />
              <Nodo T={t} t0={c(2, 1.6)} x={540} y={1020} icon="taccuino" ghost={1} name="COPIA DI MARY" />
              <Anello T={t} x={540} y={1020} r={84} on={seg(t, c(2, 2.4), c(2, 3))} />
            </Sopra>
          </>
        );
      }
      // 8. che fine fa Mary: le due letture
      case 'sorte': {
        const cam = { x: X.anello + 500, y: 250, z: 0.62 };
        return (
          <>
            <Mondo T={SL('sorte') + 6 + t} cam={cam} w={1080} h={1920} pulito />
            <Ombra />
            <Sopra>
              <Cartello T={t} t0={c(0, 0.2)} x={540} y={620} head="DUE TEORIE" text="MARY È SALVA?" color={RED} />
              <Tag T={t} t0={c(1, 0.6)} x={330} y={1150} text="RIMANDATA" size={52} bg={RED} fg={PAPER} />
              <Tag T={t} t0={c(1, 2.6)} x={760} y={1150} text="SALVA" size={52} />
              <Mano t={t} t0={c(2, 0.6)} x={540} y={860} text="le stanze la ricordano" size={70} />
            </Sopra>
          </>
        );
      }
      // 9. il dettaglio: il pezzo di cemento con dentro il ricordo della casa
      case 'dettaglio': {
        const casa = eo(seg(t, c(0, 1), c(0, 2.4)));
        const lancio = eio(seg(t, c(1, 1.6), c(1, 2.4)));
        const hit = c(1, 2.4);
        const cade = eio(seg(t, hit + 0.2, hit + 1.4));
        return (
          <>
            <Mondo T={SL('dettaglio') + 2 + t} cam={{ x: X.tavola + 100, y: Y0 - 20, z: 1.25 }} w={1080} h={1920} pulito />
            <div style={{ position: 'absolute', inset: 0, background: '#0A0904', opacity: 0.45 }} />
            <Ombra />
            <Sopra>
              <Cartello T={t} t0={0.3} x={540} y={600} head="LA NOSTRA LETTURA" text="IL CEMENTO" until={c(1, 1.2)} />
              <g transform={`translate(${760 + Math.sin(t * 40) * 3 * seg(t, c(1), c(1, 0.6)) * (t < hit ? 1 : 0)} ${640 + cade * 420}) rotate(${-6 + cade * 70}) scale(2.4)`} opacity={(1 - 0.6 * cade) * seg(t, c(1), c(1, 0.5))}>
                <Icona k="cappello" />
              </g>
              <Glow id="bf-cem" x={lerp(470, 760, lancio)} y={lerp(950, 650, lancio)} r={280} t={t} color="#F4E9B8" amp={0.06} rate={2} opacity={0.35 * (1 - seg(t, hit, hit + 0.4))} />
              <g transform={`translate(${lerp(470, 760, lancio)} ${lerp(950, 650, lancio)}) rotate(${lancio * 260 - 8}) scale(${lerp(4.6, 1.4, lancio)})`} opacity={1 - seg(t, hit + 0.6, hit + 1.2)}>
                <Icona k="cemento" />
                {casa > 0 && <g transform="scale(0.11) translate(0 140)" opacity={casa}><CasaMary k={1} vera={1} x={0} y={0} color="#FFF4C8" /></g>}
              </g>
              <Tag T={t} t0={c(0, 2.6)} x={540} y={1180} text="IL SUO RICORDO" size={52} until={c(1, 1.6)} />
              {t >= hit && <rect width={1080} height={1920} fill="#FFF6DA" opacity={0.45 * (1 - seg(t, hit, hit + 0.35))} />}
              <Mano t={t} t0={c(2, 0.8)} x={540} y={1060} text="affrontare i ricordi" size={84} />
            </Sopra>
          </>
        );
      }
      default: return null;
    }
  };
  void V; void INK; void EL;
  return Scena;
};
