import sys, math; sys.path.insert(0,'/tmp/claude-0/storie/gen'); from base import *
INK='#D9E6E0'; BG='#07130F'; TEAL='#5FD3C7'; AMB='#E8B65A'
def world(mirror):
    rain=''.join(f'<line x1="{(i*53)%420}" y1="{(i*89)%560}" x2="{(i*53)%420-6}" y2="{(i*89)%560+26}" stroke="#a9d6cf" stroke-width="2" opacity=".35"/>' for i in range(46))
    trees=''.join(f'<path d="M{x} 470 L{x+28} {h} L{x+56} 470 Z" fill="#0c2a23" stroke="#000" stroke-width="3"/><rect x="{x+24}" y="470" width="8" height="30" fill="#1b130c"/>' for x,h in [(10,300),(60,250),(330,260),(370,310),(110,330)])
    t=f'transform="translate(840 0) scale(-1 1)"' if mirror else ''
    return f'''<g {t}>
<rect x="0" y="0" width="420" height="700" fill="url(#sky{1 if mirror else 0})"/>
{rain}
<path d="M0 470 Q120 420 240 455 Q330 480 420 450 L420 700 L0 700 Z" fill="#0f241e"/>
{trees}
<!-- roccia della grotta -->
<path d="M150 470 Q160 330 300 300 Q400 290 420 300 L420 520 L150 520 Z" fill="#26332f" stroke="#000" stroke-width="4"/>
<path d="M180 470 Q200 380 290 360 Q370 345 420 352" fill="none" stroke="#3b4a45" stroke-width="6"/>
<path d="M260 520 Q275 410 360 395 Q400 392 420 395 L420 520 Z" fill="#040807"/>
<path d="M300 520 Q312 440 380 428 Q405 425 420 426 L420 520 Z" fill="url(#glow{1 if mirror else 0})"/>
<!-- porta di ferro -->
<rect x="330" y="440" width="90" height="80" fill="#2b3633" stroke="#000" stroke-width="3"/>
<circle cx="372" cy="480" r="14" fill="none" stroke="#5c6b67" stroke-width="5"/>
<path d="M0 520 L420 520 L420 700 L0 700 Z" fill="#0a1914"/>
</g>'''
# lampadine (alcune spente) lungo il sentiero
lights=''.join(f'<circle cx="{x}" cy="{y}" r="9" fill="{TEAL if on else "#2b3b38"}" stroke="#000" stroke-width="2"/>'+(f'<circle cx="{x}" cy="{y}" r="24" fill="{TEAL}" opacity=".18"/>' if on else '') for x,y,on in [(90,590,1),(170,575,0),(250,565,1),(330,560,1),(510,560,0),(590,565,1),(670,575,1),(750,590,0)])
clock=f'''<g transform="translate(420 175)">
<circle r="128" fill="#0c1a16" stroke="{INK}" stroke-width="7"/>
<circle r="112" fill="none" stroke="#ffffff22" stroke-width="2"/>
{''.join(f'<line x1="{100*math.sin(math.radians(a)):.1f}" y1="{-100*math.cos(math.radians(a)):.1f}" x2="{(86 if a%90 else 78)*math.sin(math.radians(a)):.1f}" y2="{-(86 if a%90 else 78)*math.cos(math.radians(a)):.1f}" stroke="{INK}" stroke-width="{6 if a%90==0 else 3}"/>' for a in range(0,360,30))}
<line x1="0" y1="0" x2="0" y2="-80" stroke="{AMB}" stroke-width="8" stroke-linecap="round"/>
<line x1="0" y1="0" x2="58" y2="38" stroke="{TEAL}" stroke-width="6" stroke-linecap="round"/>
<circle r="10" fill="{INK}"/>
<path d="M-150 -40 A150 150 0 0 1 -60 -138" fill="none" stroke="{AMB}" stroke-width="5" stroke-dasharray="10 9"/>
<path d="M150 40 A150 150 0 0 1 60 138" fill="none" stroke="{TEAL}" stroke-width="5" stroke-dasharray="10 9"/>
</g>'''
svg=f'''<svg width="828" height="688" viewBox="0 0 840 700" role="img" aria-label="Due mondi specchiati ai lati di una crepa luminosa: in ognuno l'ingresso di una grotta nel bosco sotto la pioggia; sopra, un grande orologio">
<defs>
<linearGradient id="sky0" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b2b26"/><stop offset="1" stop-color="#0a1a16"/></linearGradient>
<linearGradient id="sky1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b2410"/><stop offset="1" stop-color="#14120a"/></linearGradient>
<radialGradient id="glow0" cx="1" cy=".6" r="1"><stop offset="0" stop-color="{TEAL}" stop-opacity=".55"/><stop offset="1" stop-color="{TEAL}" stop-opacity="0"/></radialGradient>
<radialGradient id="glow1" cx="1" cy=".6" r="1"><stop offset="0" stop-color="{AMB}" stop-opacity=".55"/><stop offset="1" stop-color="{AMB}" stop-opacity="0"/></radialGradient>
<linearGradient id="rift" x1="0" x2="1"><stop offset="0" stop-color="#ffffff" stop-opacity="0"/><stop offset=".5" stop-color="#ffffff" stop-opacity=".95"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
</defs>
{world(False)}{world(True)}
<path d="M420 0 L432 90 L414 180 L430 280 L410 380 L428 470 L414 560 L426 700 L414 700 L402 560 L416 470 L398 380 L418 280 L402 180 L420 90 Z" fill="url(#rift)"/>
{lights}
{clock}
<text x="210" y="660" text-anchor="middle" font-family="Oswald" font-weight="700" font-size="30" letter-spacing="8" fill="{TEAL}">IL NOSTRO MONDO</text>
<text x="630" y="660" text-anchor="middle" font-family="Oswald" font-weight="700" font-size="30" letter-spacing="8" fill="{AMB}">L'ALTRO MONDO</text>
</svg>'''
p=dict(bg=BG, ink=INK, accent=TEAL, bgcss=f'background:radial-gradient(ellipse at 50% 40%, #12302a 0%, {BG} 65%, #020605 100%);',
 bulbs=[TEAL,'#22302d',TEAL,TEAL,'#22302d',AMB], glow=0.5,
 frame_css=f'3px double {INK}', frame_extra=f'outline:1px solid {TEAL}55; outline-offset:12px;',
 badge='💡 SPIEGATO FACILE', badge_bg='#FFC400', badge_ink='#141414', svg=svg, ill_border=f'6px solid {INK}',
 ctx='Winden, 1888 · 1987 · 2020', ctx_font='Oswald',
 title=['DARK'], title_css=f"font-family:Oswald;font-weight:700;font-size:170px;letter-spacing:40px;margin-right:-40px;color:{INK};text-shadow:0 0 30px {TEAL}66,0 6px 0 #000;",
 sub='STAGIONE 3',
 teaser='Ora i mondi sono due e il nodo è più stretto che mai.<br>Esiste un modo per scioglierlo?',
 date='MERCOLEDÌ 11 NOVEMBRE · ORE 17:30', date_col='#FFC400', cred='Una stagione intera spiegata facile in 2 minuti · Prima visione')
open('/tmp/claude-0/storie/dark3.html','w').write(page(p))
