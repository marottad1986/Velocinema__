import React from 'react';
import { camera, eio, eo, lerp, seg } from '../../lib/anim';
import { NearMotes } from '../../lib/elements';
import { SANS } from '../../lib/fonts';
import { Finish, FxDefs } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { Americana, Asta, Faro, Foschia, K, ORO, Parete, Pavimento, RiflessoAsta, Spia, TalentDefs, Telefono, TINTA, Torre } from '../talent/Studio';
import { giudice } from '../talent/x-factor-2026';

// Chi rientra in gara? Il ripescaggio del primo Live. Sul fondo la pedana di Gabbani con il posto di Alice spento.
// Eventi: frase 1 sulla parete «RIPESCAGGIO» e i fari dorati; frase 2 entrano dai lati due aste con il pass dorato
// appeso, Teo Bok e Timothée Bonnardel (scartati nelle selezioni); frase 3 sale il telefono del televoto e la barra di
// Teo Bok supera l'altra; frase 4 il telefono scende, l'asta di Timothée si spegne («NON RIENTRA»), il cartellino di Teo
// Bok diventa corallo («SQUADRA GABBANI») e sulla pedana di fondo, al posto di Alice, si accende un'asta col pass.
// Piani: parete e americana (0,25) · pedana di Gabbani (0,4) · palco con le due aste (0,6) · telefono (1,0) · spie (1,2) · particelle (1,7)

const NEUTRO = '#E8DCC0';
const XA = 300, XB = 780, YB = 1165, SB = 0.46;

export const Ripescaggio: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const gb = giudice('gabbani');
  const t0 = griglia(cues[0] + 0.6);
  const scritta = eo(seg(t, t0, t0 + 0.5));
  const t1 = griglia(cues[1] + 0.1);
  const entraA = eio(seg(t, t1, t1 + 1.0));
  const entraB = eio(seg(t, t1 + 0.8, t1 + 1.8));
  const t2 = griglia(cues[2] + 0.2);
  const tel = eo(seg(t, t2, t2 + 0.5)) * (1 - eio(seg(t, griglia(cues[3]) - 0.2, griglia(cues[3]) + 0.3)));
  const corsa = seg(t, t2 + 0.5, t2 + 2.6);
  const vA = lerp(0.05, 0.86, eio(corsa)) + 0.04 * Math.sin(t * 5) * (1 - corsa);
  const vB = lerp(0.05, 0.52, eio(Math.min(1, corsa * 1.3))) + 0.04 * Math.sin(t * 4 + 1) * (1 - corsa);
  const t3 = griglia(cues[3] + 0.3);
  const vince = eo(seg(t, t3, t3 + 0.6));
  const posto = eo(seg(t, t3 + 0.9, t3 + 1.5));

  const xA = lerp(-200, XA, entraA), xB = lerp(1280, XB, entraB);
  const coloreA = vince > 0.5 ? gb.colore : NEUTRO;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="rp" />
        <TalentDefs id="rp" />
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — parete con «RIPESCAGGIO» */}
        <g transform={L(0.25)}>
          <Parete id="rp" t={t} top={640} bottom={1000} colori={[ORO, '#8A5A20', '#6A4AC8']} luce={0.45 + 0.55 * scritta}
            scritta="RIPESCAGGIO" scrittaY={708} scrittaSize={56} scrittaO={scritta} scrittaColore={ORO} />
          <Americana id="rp" t={t} y={110} colori={['#FFF2D0', ORO]} />
          <Torre id="rp" t={t} x={-10} y={640} colori={[ORO, '#FFF2D0', '#C8B8FF']} />
          <Torre id="rp" t={t} x={1090} y={640} colori={['#C8B8FF', '#FFF2D0', ORO]} flip />
        </g>

        {/* PIANO 1 — la pedana di Gabbani sul fondo: Giacomo, il posto di Alice, Scraffs */}
        <g transform={L(0.4)}>
          <Pavimento id="rp" t={t} y={1000} bordo={1570} colori={[ORO, gb.colore]} />
          <path d="M380 1062 L396 1040 H684 L700 1062 Z" fill="#241C3A" stroke={K} strokeWidth="5" />
          <rect x="380" y="1062" width="320" height="34" fill="#120E1E" stroke={K} strokeWidth="5" />
          <rect x="380" y="1062" width="320" height="6" fill={gb.colore} />
          <text x="540" y="1090" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="20" letterSpacing="5" fill={gb.colore}>SQUADRA GABBANI</text>
          <Asta id="rp" t={t} x={440} y={1058} s={0.22} colore={gb.colore} luce={0.9} cartellino={false} ph={1} />
          {/* il posto di Alice: spento, poi l'asta di Teo Bok col pass */}
          <Asta id="rp" t={t} x={540} y={1058} s={0.22} colore={gb.colore} luce={posto} fuori={1 - posto} pass={posto} cartellino={false} ph={2} />
          <Asta id="rp" t={t} x={640} y={1058} s={0.22} colore={gb.colore} luce={0.9} band cartellino={false} ph={3} />
        </g>

        {/* PIANO 2 — le due aste col pass dorato */}
        <g transform={L(0.6)}>
          <Faro id="rp-fa" t={t} x={XA} y={YB} da={{ x: 20, y: 700 }} colore={ORO} o={entraA * (0.6 + 0.4 * vince)} largo={250} />
          <Faro id="rp-fb" t={t} x={XB} y={YB} da={{ x: 1060, y: 700 }} colore={ORO} o={entraB * (1 - 0.8 * vince)} largo={250} />
          <RiflessoAsta t={t} x={xA} y={YB + 4} s={SB} colore={coloreA} o={entraA} />
          <Asta id="rp" t={t} x={xA} y={YB} s={SB} nome="Teo Bok" colore={coloreA} luce={lerp(0.3, 1, entraA)} pass={entraA}
            nota={vince > 0.5 ? 'SQUADRA GABBANI' : 'DALLE SELEZIONI'} w={320} cs={0.82} ph={0} />
          <RiflessoAsta t={t} x={xB} y={YB + 4} s={SB} colore={NEUTRO} o={entraB * (1 - vince)} />
          <Asta id="rp" t={t} x={xB} y={YB} s={SB} nome="Timothée Bonnardel" colore={NEUTRO} luce={lerp(0.3, 1, entraB) * (1 - 0.85 * vince)} pass={entraB * (1 - vince)}
            fuori={vince * 0.8} nota={vince > 0.5 ? 'NON RIENTRA' : 'DALLE SELEZIONI'} w={320} cs={0.82} ph={1} />
          <Foschia id="rp-fo" t={t} y={1140} color="#E8D8B0" />
        </g>

        {/* PIANO 3 — il telefono del televoto tra le due aste */}
        <g transform={L(1.0)}>
          {tel > 0.01 && (
            <g opacity={tel} transform={`translate(0 ${(1 - tel) * 300})`}>
              <Telefono id="rp" t={t} x={540} y={1000} s={0.5} rot={0} titolo="VOTA"
                barre={[{ v: vA, colore: ORO, nome: 'Teo' }, { v: vB, colore: '#B8A890', nome: 'Timothée' }]} />
            </g>
          )}
        </g>
        <g transform={L(1.2)}>
          <Spia id="rp" x={130} y={1780} s={1.1} colore={ORO} />
          <Spia id="rp" x={950} y={1780} s={1.1} colore={ORO} flip />
        </g>
        <g transform={L(1.7)}>
          <NearMotes id="rp-near" t={t} color="#FFE8B0" n={6} r0={60} r1={140} opacity={0.1} />
        </g>
      </g>
      <Finish id="rp" tint={TINTA} tintOpacity={0.12} />
    </svg>
  );
};
