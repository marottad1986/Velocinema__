import sys, math; sys.path.insert(0,'/tmp/claude-0/storie/gen'); from base import *
INK='#F5ECD7'; BG='#17120C'; GOLD='#C9A24A'; TERRA='#9C5B3A'
# prospettiva centrata sul punto di fuga (420, 250)
VX,VY=420,250
def to_v(x,y,t): return x+(VX-x)*t, y+(VY-y)*t
ceil=''.join(f'<line x1="{x}" y1="0" x2="{VX+(x-VX)*0.42:.0f}" y2="{VY-VY*0.42:.0f}" stroke="#3a2a1a" stroke-width="3"/>' for x in range(0,841,105))
tapes=''.join(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{c}" stroke="#000" stroke-width="3"/>' for x,y,w,h,c in [(40,170,90,230,'#2f4a3a'),(710,170,90,230,'#2f4a3a'),(110,190,60,190,'#3a5a46'),(670,190,60,190,'#3a5a46')])
bread=''.join(f'<ellipse cx="{x}" cy="{y}" rx="16" ry="10" fill="#d9a35b" stroke="#000" stroke-width="3"/><path d="M{x-8} {y-2} q8 -6 16 0" stroke="#8a5a2b" stroke-width="2" fill="none"/>' for x,y in [(160,452),(270,448),(390,446),(520,448),(640,450),(720,454)])
cups=''.join(f'<g transform="translate({x} {y})"><path d="M-9 -24 L9 -24 L6 -4 L-6 -4 Z" fill="#e8f2f4aa" stroke="#000" stroke-width="2.5"/><rect x="-6" y="-14" width="12" height="9" fill="#7a1f2a"/><line x1="0" y1="-4" x2="0" y2="6" stroke="#000" stroke-width="2.5"/><line x1="-7" y1="6" x2="7" y2="6" stroke="#000" stroke-width="2.5"/></g>' for x,y in [(205,452),(330,446),(450,444),(580,448),(690,452)])
plates=''.join(f'<ellipse cx="{x}" cy="{y}" rx="22" ry="7" fill="#f4efe2" stroke="#000" stroke-width="2.5"/>' for x,y in [(110,470),(240,466),(360,462),(480,462),(600,466),(730,470)])
svg=f'''<svg width="828" height="688" viewBox="0 0 840 700" role="img" aria-label="Un refettorio antico visto in prospettiva: soffitto a cassettoni, arazzi alle pareti, tre finestre in fondo aperte su un paesaggio al tramonto e una lunga tavola apparecchiata con tovaglia bianca, pani, piatti e bicchieri di vino, senza nessuno seduto">
<defs>
<linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a4430"/><stop offset="1" stop-color="#7a5e42"/></linearGradient>
<linearGradient id="land" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe0e6"/><stop offset=".6" stop-color="#f2d9a8"/><stop offset="1" stop-color="#8aa07a"/></linearGradient>
<radialGradient id="light" cx=".5" cy=".35" r=".6"><stop offset="0" stop-color="#fff1c4" stop-opacity=".35"/><stop offset="1" stop-color="#fff1c4" stop-opacity="0"/></radialGradient>
</defs>
<rect width="840" height="700" fill="url(#wall)"/>
<path d="M0 0 L840 0 L{VX+420*0.42:.0f} {VY-VY*0.42:.0f} L{VX-420*0.42:.0f} {VY-VY*0.42:.0f} Z" fill="#4a3624" stroke="#000" stroke-width="4"/>{ceil}
<path d="M0 0 L{VX-420*0.42:.0f} {VY-VY*0.42:.0f} L{VX-420*0.42:.0f} 400 L0 520 Z" fill="#6a5038" stroke="#000" stroke-width="4"/>
<path d="M840 0 L{VX+420*0.42:.0f} {VY-VY*0.42:.0f} L{VX+420*0.42:.0f} 400 L840 520 Z" fill="#5e4632" stroke="#000" stroke-width="4"/>
{tapes}
<rect x="{VX-420*0.42:.0f}" y="{VY-VY*0.42:.0f}" width="{840*0.42:.0f}" height="{400-(VY-VY*0.42):.0f}" fill="#8a6c4c" stroke="#000" stroke-width="4"/>
<!-- tre finestre -->
<rect x="300" y="190" width="76" height="120" fill="url(#land)" stroke="#000" stroke-width="4"/>
<rect x="382" y="176" width="76" height="134" fill="url(#land)" stroke="#000" stroke-width="5"/>
<path d="M382 176 Q420 140 458 176" fill="none" stroke="#000" stroke-width="5"/>
<rect x="464" y="190" width="76" height="120" fill="url(#land)" stroke="#000" stroke-width="4"/>
{''.join(f'<path d="M{x} 290 q18 -22 36 0" fill="#6f8a64" opacity=".8"/>' for x in (304,386,420,468,500))}
<rect width="840" height="700" fill="url(#light)"/>
<!-- tavola -->
<rect x="60" y="440" width="720" height="40" fill="#f4efe2" stroke="#000" stroke-width="5"/>
<path d="M60 480 L780 480 L780 600 L60 600 Z" fill="#ece5d2" stroke="#000" stroke-width="5"/>
{''.join(f'<path d="M{80+i*60} 480 L{80+i*60} 600" stroke="#cfc6ae" stroke-width="3"/>' for i in range(12))}
{''.join(f'<path d="M60 {500+k*30} L780 {500+k*30}" stroke="#9db6c9" stroke-width="3" opacity=".6"/>' for k in range(3))}
{plates}{bread}{cups}
<rect x="0" y="600" width="840" height="100" fill="#3a2a1c"/>
{''.join(f'<path d="M{i*105} 700 L{VX+(i*105-VX)*0.6:.0f} 600" stroke="#2a1d12" stroke-width="3"/>' for i in range(9))}
</svg>'''
p=dict(bg=BG, ink=INK, accent=GOLD, bgcss=f'background:radial-gradient(ellipse at 50% 40%, #3a2a18 0%, {BG} 65%, #070503 100%);',
 bulbs=['#FFE9B0','#FFE9B0',GOLD], glow=0.5,
 frame_css=f'6px double {GOLD}', frame_extra=f'outline:2px solid {GOLD}66; outline-offset:12px;',
 badge='🎨 ARTE IN 2 MINUTI', badge_bg='#FFC400', badge_ink='#141414', svg=svg, ill_border=f'8px solid {GOLD}',
 ctx='Milano, 1494–1498', ctx_font="Cinzel",
 title=["L'ULTIMA CENA"], title_css=f"font-family:'Cinzel Decorative';font-weight:900;font-size:90px;letter-spacing:2px;color:{INK};text-shadow:0 5px 0 #000,0 0 22px {GOLD}55;",
 teaser='Tredici posti e un annuncio che sconvolge tutti.<br>Su un muro che si rovina da cinquecento anni.',
 date='SABATO 21 NOVEMBRE · ORE 10:00', date_col='#FFC400', cred='Un capolavoro spiegato in 2 minuti · Prima visione')
open('/tmp/claude-0/storie/ultimacena.html','w').write(page(p))
