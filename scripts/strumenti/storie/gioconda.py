import sys, math; sys.path.insert(0,'/tmp/claude-0/storie/gen'); from base import *
INK='#F5ECD7'; BG='#1E1610'; GOLD='#C9A24A'; WALL='#7A2E2A'
orn=''.join(f'<circle cx="{x}" cy="{y}" r="7" fill="#e4c46e" stroke="#000" stroke-width="2"/>' for x,y in [(290,150),(550,150),(290,520),(550,520),(420,140),(420,530),(280,335),(560,335)])
svg=f'''<svg width="828" height="688" viewBox="0 0 840 700" role="img" aria-label="Una sala di museo con le pareti rosse: al centro una cornice dorata vuota con quattro chiodi, una targhetta con un punto di domanda, i cordoni rossi davanti e la luce di un faretto">
<defs>
<linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5e211e"/><stop offset="1" stop-color="{WALL}"/></linearGradient>
<radialGradient id="spot" cx=".5" cy=".42" r=".5"><stop offset="0" stop-color="#fff1c4" stop-opacity=".55"/><stop offset="1" stop-color="#fff1c4" stop-opacity="0"/></radialGradient>
<linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f2d58a"/><stop offset=".5" stop-color="{GOLD}"/><stop offset="1" stop-color="#8a6a26"/></linearGradient>
</defs>
<rect width="840" height="700" fill="url(#wall)"/>
{''.join(f'<rect x="{x}" y="0" width="2" height="560" fill="#00000022"/>' for x in range(0,840,42))}
<rect width="840" height="560" fill="url(#spot)"/>
<!-- cornice vuota -->
<rect x="270" y="130" width="300" height="410" fill="url(#gold)" stroke="#000" stroke-width="5"/>
<rect x="296" y="156" width="248" height="358" fill="#3a1714" stroke="#5a3b12" stroke-width="6"/>
<rect x="306" y="166" width="228" height="338" fill="#4a1d19"/>
<!-- segno più chiaro dove c'era il quadro -->
<rect x="318" y="180" width="204" height="310" fill="#6b2a25" stroke="#7d342e" stroke-width="3" stroke-dasharray="10 8"/>
{orn}
<!-- quattro chiodi -->
{''.join(f'<circle cx="{x}" cy="{y}" r="6" fill="#999" stroke="#000" stroke-width="2"/>' for x,y in [(330,196),(510,196),(330,474),(510,474)])}
<!-- faretto -->
<g transform="translate(420 40)"><rect x="-70" y="-10" width="140" height="16" rx="8" fill="#222" stroke="#000" stroke-width="3"/><path d="M-40 6 L40 6 L30 34 L-30 34 Z" fill="#333" stroke="#000" stroke-width="3"/></g>
<!-- targhetta -->
<rect x="600" y="440" width="90" height="54" rx="4" fill="#efe6cf" stroke="#000" stroke-width="3"/>
<text x="645" y="480" text-anchor="middle" font-family="Cinzel" font-weight="900" font-size="32" fill="#3a2a10">?</text>
<!-- pavimento -->
<rect x="0" y="610" width="840" height="90" fill="#3b2a1d"/>
{''.join(f'<path d="M{i*120-60} 700 L{i*120} 610" stroke="#00000044" stroke-width="3"/>' for i in range(9))}
<!-- colonnine e cordone -->
{''.join(f'<g transform="translate({x} 600)"><rect x="-8" y="-70" width="16" height="78" fill="url(#gold)" stroke="#000" stroke-width="3"/><circle cx="0" cy="-74" r="12" fill="url(#gold)" stroke="#000" stroke-width="3"/><ellipse cx="0" cy="10" rx="28" ry="8" fill="url(#gold)" stroke="#000" stroke-width="3"/></g>' for x in (150,690))}
<path d="M150 530 Q420 610 690 530" fill="none" stroke="#9e1b32" stroke-width="14" stroke-linecap="round"/>
<!-- data del furto -->
<text x="120" y="120" font-family="Cinzel" font-weight="700" font-size="26" fill="#f5ecd7" opacity=".85">21 · VIII · 1911</text>
</svg>'''
p=dict(bg=BG, ink=INK, accent=GOLD, bgcss=f'background:radial-gradient(ellipse at 50% 40%, #3a2618 0%, {BG} 65%, #080503 100%);',
 bulbs=['#FFE9B0','#FFE9B0',GOLD], glow=0.5,
 frame_css=f'6px double {GOLD}', frame_extra=f'outline:2px solid {GOLD}66; outline-offset:12px;',
 badge='🎨 ARTE IN 2 MINUTI', badge_bg='#FFC400', badge_ink='#141414', svg=svg, ill_border=f'8px solid {GOLD}',
 ctx='Parigi, Museo del Louvre', ctx_font="Cinzel",
 title=['LA GIOCONDA'], title_css=f"font-family:'Cinzel Decorative';font-weight:900;font-size:94px;letter-spacing:2px;color:{INK};text-shadow:0 5px 0 #000,0 0 22px {GOLD}55;",
 teaser='È il quadro più famoso del mondo.<br>Eppure un giorno del 1911 sparì dal Louvre.',
 date='SABATO 21 NOVEMBRE · ORE 10:00', date_col='#FFC400', cred='Un capolavoro spiegato in 2 minuti · Prima visione')
open('/tmp/claude-0/storie/gioconda.html','w').write(page(p))
