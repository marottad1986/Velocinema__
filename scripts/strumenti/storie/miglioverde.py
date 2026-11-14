import sys, math; sys.path.insert(0,'/tmp/claude-0/storie/gen'); from base import *
INK='#F3EEDC'; BG='#0B140D'; GRN='#4FA35C'; LAMP='#FFD98A'
def bars(x):
    return f'<g>{"".join(f"<rect x=\"{x+i*14}\" y=\"170\" width=\"6\" height=\"360\" fill=\"#4a4a44\" stroke=\"#000\" stroke-width=\"2\"/>" for i in range(7))}<rect x="{x-6}" y="166" width="104" height="12" fill="#3a3a36" stroke="#000" stroke-width="3"/></g>'
lamps=''.join(f'<g transform="translate(420 {60+k*40})"><line x1="0" y1="-60" x2="0" y2="0" stroke="#222" stroke-width="3"/><path d="M-{26-k*4} 0 L{26-k*4} 0 L{14-k*2} -14 L-{14-k*2} -14 Z" fill="#333" stroke="#000" stroke-width="3"/><ellipse cx="0" cy="4" rx="{12-k*2}" ry="5" fill="{LAMP}"/></g>' for k in range(3))
motes=''.join(f'<circle cx="{300+(i*53)%240}" cy="{140+(i*37)%420}" r="{1.5+(i%3)}" fill="#fff6c8" opacity="{0.25+(i%4)*0.12}"/>' for i in range(40))
svg=f'''<svg width="828" height="688" viewBox="0 0 840 700" role="img" aria-label="Il lungo corridoio di un vecchio carcere con il pavimento verde che si allontana in prospettiva, celle con le sbarre ai lati, lampade appese e una luce calda e misteriosa che brilla in fondo">
<defs>
<linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b2a24"/><stop offset="1" stop-color="#4a463a"/></linearGradient>
<linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f6b38"/><stop offset="1" stop-color="#6fc27a"/></linearGradient>
<radialGradient id="glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fffbe0" stop-opacity=".95"/><stop offset=".4" stop-color="#ffe9a0" stop-opacity=".5"/><stop offset="1" stop-color="#ffe9a0" stop-opacity="0"/></radialGradient>
</defs>
<rect width="840" height="700" fill="url(#wall)"/>
<!-- pareti in prospettiva -->
<path d="M0 0 L360 230 L360 430 L0 700 Z" fill="#3c3a30" stroke="#000" stroke-width="4"/>
<path d="M840 0 L480 230 L480 430 L840 700 Z" fill="#35332a" stroke="#000" stroke-width="4"/>
<rect x="360" y="230" width="120" height="200" fill="#1a1912" stroke="#000" stroke-width="4"/>
<!-- pavimento verde -->
<path d="M0 700 L360 430 L480 430 L840 700 Z" fill="url(#floor)" stroke="#000" stroke-width="4"/>
{''.join(f'<line x1="{360+i*20}" y1="430" x2="{i*140}" y2="700" stroke="#1f4a27" stroke-width="2"/>' for i in range(7))}
{''.join(f'<line x1="{360-(y-430)*1.33:.0f}" y1="{y}" x2="{480+(y-430)*1.33:.0f}" y2="{y}" stroke="#1f4a27" stroke-width="2"/>' for y in (450,480,520,580,660))}
<!-- celle -->
<g transform="translate(40 120) scale(.9)">{bars(0)}</g><g transform="translate(200 210) scale(.6)">{bars(0)}</g>
<g transform="translate(712 120) scale(.9)">{bars(0)}</g><g transform="translate(580 210) scale(.6)">{bars(0)}</g>
<!-- luce in fondo -->
<ellipse cx="420" cy="330" rx="160" ry="160" fill="url(#glow)"/>
{lamps}{motes}
</svg>'''
p=dict(bg=BG, ink=INK, accent=GRN, bgcss=f'background:radial-gradient(ellipse at 50% 40%, #1c3220 0%, {BG} 65%, #030604 100%);',
 bulbs=[LAMP,LAMP,GRN], glow=0.55,
 frame_css=f'5px double {GRN}', frame_extra=f'outline:2px solid {LAMP}55; outline-offset:12px;',
 badge='🎬 FILM IN 2 MINUTI', badge_bg='#FFC400', badge_ink='#141414', svg=svg, ill_border=f'6px solid {INK}',
 ctx='Louisiana, 1935', ctx_font="'Playfair Display'",
 title=['IL MIGLIO VERDE'], title_css=f"font-family:'Playfair Display';font-weight:900;font-size:104px;letter-spacing:4px;color:{INK};text-shadow:0 5px 0 #000,0 0 22px {GRN}88;",
 teaser='Nel braccio della morte arriva un gigante gentile.<br>E un dono che nessuno sa spiegare.',
 date='VENERDÌ 20 NOVEMBRE · ORE 17:30', date_col='#FFC400', cred='Un film intero in soli 2 minuti · Prima visione')
open('/tmp/claude-0/storie/miglioverde.html','w').write(page(p))
