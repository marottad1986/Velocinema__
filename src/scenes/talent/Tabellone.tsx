import React from 'react';
import { camera, eo, eob, seg } from '../../lib/anim';
import { Glow, NearMotes } from '../../lib/elements';
import { SANS } from '../../lib/fonts';
import { Finish, FxDefs } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { Americana, Asta, Foschia, K, ORO, Parete, Pavimento, SPENTO, Spia, Cavi, TalentDefs, TINTA, Torre } from './Studio';
import { CONCORRENTI, GIUDICI, stato } from './x-factor-2026';

// «Chi è ancora in gara?» (riusabile in ogni episodio, TALENT.md): il tabellone luminoso appeso sopra il palco, diviso
// nelle quattro squadre, con i nomi accesi (in gara), spenti e barrati (fuori, con il Live) e il segno del pass per i
// ripescati; sotto, il palco con le aste rimaste accese. Eventi: frase 1 il tabellone si accende riga per riga; frase 2
// compare il numero dei rimasti di ogni squadra, una dopo l'altra; frase 3 nella riga in basso la prossima puntata
// (`prossimo`); frase 4 il bollino d'oro (`avviso`, es. «ESCONO IN 3») e tutte le luci dei rimasti pulsano insieme.
// Piani: parete e americana (0,25) · palco con le aste (0,45) · tabellone (0,7) · spie (1,2) · particelle (1,7)

const BX = 110, BY = 630, BW = 860, BH = 560;

export const makeTabellone = (opz: { dopoLive: number; prossimo: string; avviso: string; id?: string }) => {
  const { dopoLive, prossimo, avviso, id = 'tb' } = opz;
  const blocchi = GIUDICI.map((g) => ({
    g,
    nomi: CONCORRENTI.filter((c) => c.squadra === g.id && stato(c, dopoLive) !== 'assente'),
  }));
  const rimasti = CONCORRENTI.filter((c) => stato(c, dopoLive) === 'gara');

  const Scena: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
    const cam = camera(t, dur);
    const L = cam.layer;
    const t0 = griglia(cues[0] + 0.1);
    const riga = (k: number) => eo(seg(t, t0 + k * 0.12, t0 + k * 0.12 + 0.3));
    const t1 = griglia(cues[1] + 0.2);
    const conta = GIUDICI.map((_, i) => eob(seg(t, t1 + i * 0.6, t1 + i * 0.6 + 0.35), 2));
    const t2 = griglia(cues[2] + 0.2);
    const piede = eo(seg(t, t2, t2 + 0.5));
    const t3 = griglia(cues[3] + 0.5);
    const oro = eob(seg(t, t3, t3 + 0.45), 1.8);
    const pulsa = seg(t, t3, t3 + 0.3) * (0.5 + 0.5 * Math.sin(t * 9));
    const acceso = eo(seg(t, t0, t0 + 0.4));

    return (
      <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <FxDefs id={id} />
          <TalentDefs id={id} />
          <linearGradient id={`${id}-board`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1A1430" />
            <stop offset="1" stopColor="#0A0814" />
          </linearGradient>
        </defs>
        <g transform={cam.transform}>
          {/* PIANO 0 — parete, americana, torri */}
          <g transform={L(0.25)}>
            <Parete id={id} t={t} top={640} bottom={1060} colori={GIUDICI.map((g) => g.colore)} luce={0.5} />
            <Americana id={id} t={t} y={110} colori={['#FFF2D0', '#C8B8FF']} />
            <Torre id={id} t={t} x={-10} y={700} colori={[ORO, '#C8B8FF', '#FFF2D0']} />
            <Torre id={id} t={t} x={1090} y={700} colori={['#FFF2D0', '#C8B8FF', ORO]} flip />
          </g>
          {/* PIANO 1 — il palco con le aste rimaste */}
          <g transform={L(0.45)}>
            <Pavimento id={id} t={t} y={1060} bordo={1560} colori={GIUDICI.map((g) => g.colore)} />
            {rimasti.map((c, k) => {
              const g = GIUDICI.find((x) => x.id === c.squadra)!;
              const x = 120 + (k * 840) / Math.max(1, rimasti.length - 1);
              return <Asta key={c.id} id={id} t={t} x={x} y={1290} s={0.2} colore={g.colore} luce={0.6 + 0.4 * acceso} cartellino={false} band={c.band} pass={c.entra ? 1 : 0} ph={k} />;
            })}
            <Foschia id={`${id}-fo`} t={t} y={1270} />
          </g>

          {/* PIANO 2 — il tabellone appeso */}
          <g transform={L(0.7)}>
            {[BX + 120, BX + BW - 120].map((x) => <path key={x} d={`M${x} 0 V${BY}`} stroke="#2A2638" strokeWidth="6" />)}
            <Glow id={`${id}-bg`} x={540} y={BY + BH / 2} r={620} t={t} color="#8A6AE8" amp={0.04} rate={1.2} opacity={0.25 + 0.25 * acceso} />
            <rect x={BX - 14} y={BY - 14} width={BW + 28} height={BH + 28} rx="26" fill="#0A0812" stroke={K} strokeWidth="10" />
            <rect x={BX} y={BY} width={BW} height={BH} rx="16" fill={`url(#${id}-board)`} />
            {blocchi.map(({ g, nomi }, i) => {
              const bx = BX + 20 + (i % 2) * (BW / 2), by = BY + 20 + Math.floor(i / 2) * 250;
              const bw = BW / 2 - 40;
              const n = nomi.filter((c) => stato(c, dopoLive) === 'gara').length;
              return (
                <g key={g.id}>
                  <rect x={bx} y={by} width={bw} height="50" rx="10" fill={g.colore} opacity={0.2 + 0.8 * riga(i)} />
                  <text x={bx + 16} y={by + 36} fontFamily={SANS} fontWeight={800} fontSize="28" letterSpacing="3" fill={K} opacity={riga(i)}>
                    {g.corto.toUpperCase() === 'JAKE' ? 'JAKE LA FURIA' : g.nome.toUpperCase().replace('FRANCESCO ', '')}
                  </text>
                  {/* numero dei rimasti */}
                  <g transform={`translate(${bx + bw - 34} ${by + 25}) scale(${conta[i]})`} opacity={Math.min(1, conta[i])}>
                    <circle r="34" fill={K} stroke={g.colore} strokeWidth="5" />
                    <text y="13" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="38" fill={g.colore}>{n}</text>
                  </g>
                  {nomi.map((c, k) => {
                    const fu = stato(c, dopoLive) === 'fuori';
                    const o = riga(i * 4 + k + 1);
                    const ry = by + 92 + k * 46;
                    const w = c.nome.length * (fu ? 14.2 : 17);
                    return (
                      <g key={c.id} opacity={o}>
                        <circle cx={bx + 18} cy={ry - 11} r="10" fill={fu ? SPENTO : g.colore} opacity={fu ? 0.7 : 0.75 + 0.25 * pulsa} />
                        {!fu && <circle cx={bx + 18} cy={ry - 11} r={16 + 6 * pulsa} fill={g.colore} opacity={0.25} />}
                        <text x={bx + 40} y={ry} fontFamily={SANS} fontWeight={800} fontSize={fu ? 26 : 32} fill={fu ? '#6A6676' : '#F6F2EA'}>{c.nome}</text>
                        {fu && <path d={`M${bx + 36} ${ry - 11} h${w}`} stroke="#E8505B" strokeWidth="4" />}
                        {fu && <text x={bx + 46 + w} y={ry - 2} fontFamily={SANS} fontWeight={800} fontSize="18" letterSpacing="2" fill="#E8505B">LIVE {c.fuori}</text>}
                        {c.entra && !fu && (
                          <g transform={`translate(${bx + 52 + w} ${ry - 26})`}>
                            <rect width="70" height="28" rx="6" fill={ORO} stroke={K} strokeWidth="3" />
                            <text x="35" y="21" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="17" fill={K}>PASS</text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </g>
              );
            })}
            {/* riga in basso: la prossima puntata */}
            <rect x={BX + 20} y={BY + BH - 78} width={BW - 40} height="60" rx="12" fill="#06040C" stroke="#2A2244" strokeWidth="4" />
            <text x={BX + 50} y={BY + BH - 36} textAnchor="start" fontFamily={SANS} fontWeight={800} fontSize="32" letterSpacing="5" fill="#F6F2EA" opacity={piede}>{prossimo}</text>
            {/* bollino d'oro */}
            {oro > 0.01 && (
              <g transform={`translate(${BX + BW - 170} ${BY + BH - 48}) rotate(-4) scale(${0.72 * oro})`}>
                <Glow id={`${id}-og`} x={0} y={0} r={190} t={t} color={ORO} amp={0.1} rate={5} opacity={0.6} />
                <rect x="-185" y="-46" width="370" height="92" rx="46" fill={ORO} stroke={K} strokeWidth="7" />
                <text y="16" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="44" letterSpacing="3" fill={K}>{avviso}</text>
              </g>
            )}
          </g>
          <g transform={L(1.2)}>
            <Cavi y={1840} />
            <Spia id={id} x={130} y={1780} s={1.1} colore={ORO} />
            <Spia id={id} x={950} y={1780} s={1.1} colore={ORO} flip />
          </g>
          <g transform={L(1.7)}>
            <NearMotes id={`${id}-near`} t={t} color="#E8DCFF" n={6} r0={60} r1={140} opacity={0.1} />
          </g>
        </g>
        <Finish id={id} tint={TINTA} tintOpacity={0.12} />
      </svg>
    );
  };
  return Scena;
};
