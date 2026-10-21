import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { camera } from './anim';
import { DISPLAY, SANS } from './fonts';
import { Finish, FxDefs, Lin } from './fx';
import {
  Beam, Clouds, Confetti, Drips, Dust, Embers, Fire, Fireflies, flashAt, Flyers, Fog, GlassDrops, Glow, Gulls, Lightning,
  Moon, NearMotes, Neon, Notes, Rain, Reflection, ShootingStar, Smoke, Stars, StringLights, SunRays, WaveBand, WaveLines, Wisps,
} from './elements';

// Catalogo della libreria di elementi (src/lib/elements.tsx): due pagine di prova, non fanno parte dei film.
// npx remotion still src/index.ts libreria--esterni out/prova/libreria-esterni.png --frame=60

const Tag: React.FC<{ x: number; y: number; children: string }> = ({ x, y, children }) => (
  <text x={x} y={y} fontFamily={SANS} fontWeight={800} fontSize="24" fill="#FFFFFF" stroke="#000" strokeWidth="5" paintOrder="stroke">{children}</text>
);

const Esterni: React.FC<{ t: number }> = ({ t }) => {
  const cam = camera(t, 4);
  const L = cam.layer;
  const flash = flashAt(t, [1.5]);
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920">
      <defs>
        <FxDefs id="ce" />
        <Lin id="ce-sky" stops={[[0, '#081118'], [0.4, '#16303B'], [0.58, '#2B5560'], [0.62, '#1E3D46']]} />
        <Lin id="ce-sea" stops={[[0, '#2C6670'], [1, '#08171C']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#ce-sky)" />
          <rect x="-200" y="-200" width="1480" height="2400" fill="#CFE7F0" opacity={flash * 0.3} />
          <Stars t={t} n={35} h={650} />
          <Moon id="ce-moon" x={850} y={420} t={t} />
          <ShootingStar id="ce-shoot" t={t} at={0.4} from={{ x: 100, y: 200 }} to={{ x: 600, y: 420 }} />
          <Lightning x={300} y={150} h={500} flash={flash} />
        </g>
        <g transform={L(0.3)}><Clouds id="ce-cl" t={t} color="#22404B" y={180} /></g>
        <g transform={L(0.5)}>
          <Beam id="ce-beam" x={760} y={900} t={t} length={1300} spread={260} color="#FFE7A0" spin={0.9} />
          <path d="M600 1180 L700 900 H820 L920 1180 Z" fill="#DCE5E8" stroke="#0B1418" strokeWidth="8" />
          <Glow id="ce-lamp" x={760} y={900} r={110} t={t} color="#FFD98A" amp={0.2} rate={1.8} />
          <Fog id="ce-fog1" t={t} y={1150} opacity={0.3} />
        </g>
        <g transform={L(0.65)}>
          <rect x="-200" y="1178" width="1480" height="900" fill="url(#ce-sea)" />
          <Reflection t={t} x={850} y={1195} color="#E9F0F2" />
          <WaveLines t={t} ys={[1240, 1320, 1420]} color="#5E9AA3" />
          <Smoke id="ce-smoke" t={t} x={250} y={1100} />
        </g>
        <g transform={L(0.6)}><Gulls t={t} y={620} /></g>
        <g transform={L(1.0)}><WaveBand t={t} y={1620} fill="#0F2A33" foam="#9CC3CA" /></g>
        <g transform={L(0.5)}><Rain t={t} level="far" /></g>
        <g transform={L(1.4)}><Rain t={t} level="near" /></g>
        <g transform={L(1.7)}><NearMotes id="ce-near" t={t} /></g>
      </g>
      <Finish id="ce" tint="#0E3A40" />
      <Tag x={40} y={60}>Stars · Moon · ShootingStar · Lightning+flashAt · Clouds</Tag>
      <Tag x={40} y={100}>Beam(spin) · Glow · Fog · Reflection · WaveLines · Smoke</Tag>
      <Tag x={40} y={140}>Gulls · WaveBand · Rain far/near · NearMotes</Tag>
    </svg>
  );
};

const Interni: React.FC<{ t: number }> = ({ t }) => {
  const cam = camera(t, 4);
  const L = cam.layer;
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920">
      <defs>
        <FxDefs id="ci" />
        <Lin id="ci-wall" stops={[[0, '#1B1530'], [0.5, '#2C2456'], [1, '#15102A']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#ci-wall)" />
          <SunRays id="ci-rays" x={900} y={1100} t={t} opacity={0.35} />
          <Neon id="ci-neon" t={t} x={540} y={420} text="JAZZ" color="#FF5EA8" font={DISPLAY} size={150} onAt={0.6} />
          <StringLights id="ci-sl" t={t} from={{ x: -40, y: 520 }} to={{ x: 1120, y: 540 }} n={14} />
          <rect x="80" y="640" width="300" height="360" fill="#0E1A2A" stroke="#0B0818" strokeWidth="10" />
          <GlassDrops t={t} x={80} y={640} w={300} h={360} />
          <Fireflies id="ci-ff" t={t} x={600} y={650} w={420} h={300} />
        </g>
        <g transform={L(0.45)}>
          <Beam id="ci-spot" x={700} y={600} t={t} length={800} spread={420} color="#FFF1CC" angle={110} sweep={12} opacity={0.5} />
          <Dust t={t} top={{ y: 620, x0: 660, x1: 740 }} bottom={{ y: 1350, x0: 300, x1: 760 }} />
          <Drips t={t} x={960} y0={600} y1={1240} />
        </g>
        <g transform={L(0.65)}>
          <rect x="-200" y="1250" width="1480" height="900" fill="#120C22" />
          <Fire id="ci-fire" t={t} x={260} y={1250} />
          <Embers t={t} x={260} y={1180} h={500} />
          <Glow id="ci-lamp" x={760} y={1150} r={160} t={t} color="#F2C14E" />
          <circle cx="760" cy="1150" r="26" fill="#FFF3C8" stroke="#0B0818" strokeWidth="6" />
          <Wisps t={t} x={560} y={1240} />
          <Notes t={t} x={760} y={1150} />
        </g>
        <g transform={L(1.2)}><Flyers t={t} y0={400} y1={1500} /></g>
        <g transform={L(1.5)}><Confetti t={t} n={30} /></g>
      </g>
      <Finish id="ci" tint="#2C2456" />
      <Tag x={40} y={60}>SunRays · Neon(onAt) · StringLights · GlassDrops · Fireflies</Tag>
      <Tag x={40} y={100}>Beam(sweep) · Dust · Drips · Fire · Embers · Glow · Wisps · Notes</Tag>
      <Tag x={40} y={140}>Flyers · Confetti</Tag>
    </svg>
  );
};

export const Catalogo: React.FC<{ page: 'esterni' | 'interni' }> = ({ page }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return <AbsoluteFill style={{ background: '#000' }}>{page === 'esterni' ? <Esterni t={t} /> : <Interni t={t} />}</AbsoluteFill>;
};
