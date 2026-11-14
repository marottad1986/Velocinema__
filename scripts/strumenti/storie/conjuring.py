import sys, math; sys.path.insert(0,'/tmp/claude-0/storie/gen'); from base import *
INK='#EDE7DA'; BG='#0B0D0E'; RUST='#8E2B1E'; FOG='#C9D2D6'
stars=''.join(f'<circle cx="{(i*91)%840}" cy="{(i*43)%260}" r="{0.8+(i%3)*0.5}" fill="#fff" opacity="{0.25+(i%3)*0.15}"/>' for i in range(70))
win=lambda x,y,on: f'<rect x="{x}" y="{y}" width="40" height="56" fill="{"#e9b85a" if on else "#14181a"}" stroke="#000" stroke-width="4"/><line x1="{x}" y1="{y+28}" x2="{x+40}" y2="{y+28}" stroke="#000" stroke-width="3"/><line x1="{x+20}" y1="{y}" x2="{x+20}" y2="{y+56}" stroke="#000" stroke-width="3"/>'
fog=''.join(f'<ellipse cx="{(i*157)%840}" cy="{520+(i*13)%60}" rx="{140+(i%3)*40}" ry="22" fill="{FOG}" opacity=".16"/>' for i in range(10))
def hand(a,l,w): return f'<line x1="0" y1="0" x2="{l*math.sin(math.radians(a)):.1f}" y2="{-l*math.cos(math.radians(a)):.1f}" stroke="#1a1a1a" stroke-width="{w}" stroke-linecap="round"/>'
svg=f'''<svg width="828" height="688" viewBox="0 0 840 700" role="img" aria-label="Di notte una vecchia fattoria di legno nella nebbia, con un grande albero spoglio accanto e una sola finestra accesa; in primo piano un orologio da parete fermo alle tre e sette">
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05080a"/><stop offset="1" stop-color="#2a3438"/></linearGradient>
<radialGradient id="moon" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#f4f1e6" stop-opacity=".5"/><stop offset="1" stop-color="#f4f1e6" stop-opacity="0"/></radialGradient>
</defs>
<rect width="840" height="700" fill="url(#sky)"/>{stars}
<circle cx="640" cy="120" r="120" fill="url(#moon)"/><circle cx="640" cy="120" r="44" fill="#ece8da"/>
<!-- albero spoglio -->
<g stroke="#0e0e0e" stroke-linecap="round" fill="none">
<path d="M150 560 L160 380 L150 250" stroke-width="30"/>
<path d="M156 380 L80 300 L40 290 M158 330 L240 250 L300 240 M152 290 L110 200 L120 140 M150 250 L190 170 L230 150 M240 250 L250 200 M80 300 L60 250" stroke-width="12"/>
</g>
<!-- casa -->
<rect x="320" y="300" width="380" height="240" fill="#5c5a52" stroke="#000" stroke-width="5"/>
{''.join(f'<line x1="320" y1="{312+k*16}" x2="700" y2="{312+k*16}" stroke="#4a4842" stroke-width="2"/>' for k in range(14))}
<path d="M300 304 L510 180 L720 304 Z" fill="#2a2a28" stroke="#000" stroke-width="5"/>
<rect x="600" y="196" width="34" height="70" fill="#3a3a36" stroke="#000" stroke-width="4"/>
{win(360,340,False)}{win(450,340,False)}{win(560,340,True)}{win(630,340,False)}{win(360,440,False)}{win(630,440,False)}
<rect x="480" y="430" width="60" height="110" fill="#2a1d14" stroke="#000" stroke-width="4"/>
<path d="M300 540 L720 540 L740 560 L280 560 Z" fill="#3a3832" stroke="#000" stroke-width="4"/>
<rect y="550" width="840" height="150" fill="#1d2420"/>
{fog}
<!-- orologio -->
<g transform="translate(160 600)">
<rect x="-72" y="-72" width="144" height="144" rx="14" fill="#5a3a22" stroke="#000" stroke-width="5"/>
<circle r="56" fill="#efe6cf" stroke="#000" stroke-width="4"/>
{''.join(f'<line x1="{48*math.sin(math.radians(a)):.1f}" y1="{-48*math.cos(math.radians(a)):.1f}" x2="{54*math.sin(math.radians(a)):.1f}" y2="{-54*math.cos(math.radians(a)):.1f}" stroke="#000" stroke-width="3"/>' for a in range(0,360,30))}
{hand(93.5,30,7)}{hand(42,44,4)}
<circle r="5" fill="#000"/>
<path d="M30 -46 L44 -20 L36 -16" stroke="#2a2a2a" stroke-width="2" fill="none"/>
</g>
</svg>'''
p=dict(bg=BG, ink=INK, accent=FOG, bgcss=f'background:radial-gradient(ellipse at 50% 40%, #1d2528 0%, {BG} 65%, #020303 100%);',
 bulbs=['#F2D9A0','#F2D9A0',RUST], glow=0.45,
 frame_css=f'5px double {INK}99', frame_extra=f'outline:2px solid {RUST}88; outline-offset:12px;',
 badge='🎬 FILM IN 2 MINUTI', badge_bg='#FFC400', badge_ink='#141414', svg=svg, ill_border=f'6px solid {INK}',
 ctx='Rhode Island, 1971', ctx_font="'IM Fell English SC'",
 title=['CONJURING'], sub="L'EVOCAZIONE", title_css=f"font-family:'IM Fell English SC';font-size:150px;letter-spacing:6px;color:{INK};text-shadow:0 6px 0 #000,0 0 26px {RUST}aa;",
 teaser='Una vecchia fattoria, una famiglia appena arrivata.<br>E ogni notte gli orologi si fermano alla stessa ora.',
 date='DOMENICA 22 NOVEMBRE · ORE 17:30', date_col='#FFC400', cred='Un film intero in soli 2 minuti · Prima visione')
open('/tmp/claude-0/storie/conjuring.html','w').write(page(p))
