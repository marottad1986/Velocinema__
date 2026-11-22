import sys, math; sys.path.insert(0,'/tmp/claude-0/storie/gen'); from base import *
# Storia del video lungo YouTube «Donnie Darko spiegato: il finale e le regole del tempo».
# Tetto in primo piano sfondato da un motore d'aereo, cielo viola con un vortice, tabellone «28 GIORNI».
INK='#EDE6FA'; BG='#0C0818'; VIO='#7A5CFF'; AMB='#FFB347'; RED='#FF4D5E'
stars=''.join(f'<circle cx="{(i*97)%840}" cy="{(i*53)%300}" r="{0.7+(i%3)*0.6}" fill="#fff" opacity="{0.25+(i%4)*0.15}"/>' for i in range(130))
# vortice nel cielo: archi concentrici sfalsati
vort=''.join(f'<ellipse cx="300" cy="150" rx="{40+k*34}" ry="{14+k*12}" fill="none" stroke="#b9a6ff" stroke-width="{3-k*0.25:.2f}" opacity="{0.55-k*0.06:.2f}" stroke-dasharray="{60+k*20} {30+k*8}" transform="rotate({-12+k*4} 300 150)"/>' for k in range(8))
# tegole: file di semicerchi sulla falda
def shingles():
    out=[]
    for r in range(14):
        y=380+r*28
        x_start=-20+ (r%2)*22
        for c in range(22):
            x=x_start+c*44
            shade=['#3a2c4a','#33263f','#41314f'][(r*3+c)%3]
            out.append(f'<path d="M{x} {y-30} h44 v30 q-22 20 -44 0 z" fill="{shade}" stroke="#000" stroke-width="2.5"/>')
    return '<g transform="skewY(-7.46)">'+''.join(out)+'</g>'
# rami spogli di ottobre
def branch(x,y,a,l,d):
    if d==0: return ''
    x2=x+l*math.cos(math.radians(a)); y2=y-l*math.sin(math.radians(a))
    s=f'<line x1="{x:.1f}" y1="{y:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="#0a0614" stroke-width="{d*2.2:.1f}" stroke-linecap="round"/>'
    return s+branch(x2,y2,a+24,l*0.72,d-1)+branch(x2,y2,a-20,l*0.7,d-1)
tree=branch(40,420,80,120,6)+branch(810,400,100,110,6)
# calcinacci e scintille
def _deb():
    out=[]
    for i in range(24):
        a=math.radians(200+i*15.5); d=150+(i*37)%90
        x=600+d*math.cos(a)*1.25; y=380+d*math.sin(a)*0.9
        out.append(f'<rect x="{x:.0f}" y="{y:.0f}" width="{10+i%5*4}" height="{7+i%4*3}" fill="{["#3a2c4a","#6a5544","#cfc4b0"][i%3]}" stroke="#000" stroke-width="2" transform="rotate({i*37} {x:.0f} {y:.0f})"/>')
    return ''.join(out)
debris=_deb()
sparks=''.join(f'<circle cx="{520+(i*53)%170}" cy="{300+(i*31)%110}" r="{2+i%3}" fill="{AMB}" opacity=".9"/>' for i in range(18))
smoke=''.join(f'<circle cx="{570-k*26}" cy="{260-k*26}" r="{30+k*10}" fill="#9a8cc0" opacity="{0.32-k*0.035:.3f}"/>' for k in range(8))
svg=f'''<svg width="828" height="688" viewBox="0 0 840 700" role="img" aria-label="Di notte, sotto un cielo viola con un vortice di nuvole, un enorme motore d'aereo è conficcato nel tetto di una casa tra tegole divelte, fumo e scintille; in alto un tabellone segna 28 giorni">
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#07041a"/><stop offset=".6" stop-color="#2e1c62"/><stop offset="1" stop-color="#5b3a92"/></linearGradient>
<linearGradient id="eng" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6e6e82"/><stop offset=".45" stop-color="#e6e6ee"/><stop offset="1" stop-color="#5a5a6c"/></linearGradient>
<radialGradient id="hole" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="{AMB}" stop-opacity=".75"/><stop offset="1" stop-color="{AMB}" stop-opacity="0"/></radialGradient>
<radialGradient id="moon" cx=".5" cy=".5" r=".5"><stop offset=".6" stop-color="#f2ecff" stop-opacity=".35"/><stop offset="1" stop-color="#f2ecff" stop-opacity="0"/></radialGradient>
<clipPath id="roof"><path d="M0 700 L0 360 L840 250 L840 700 Z"/></clipPath>
</defs>
<rect width="840" height="700" fill="url(#sky)"/>{stars}
<circle cx="110" cy="90" r="80" fill="url(#moon)"/><circle cx="110" cy="90" r="40" fill="#f2ecff"/><circle cx="96" cy="82" r="7" fill="#d8cfee"/><circle cx="122" cy="102" r="5" fill="#d8cfee"/>
{vort}
<!-- pali della luce -->
<line x1="0" y1="250" x2="840" y2="215" stroke="#0a0614" stroke-width="2"/><line x1="0" y1="262" x2="840" y2="228" stroke="#0a0614" stroke-width="2"/>
{tree}
<!-- tabellone del conto alla rovescia -->
<g transform="translate(640 28) scale(.82)">
<rect x="0" y="0" width="200" height="140" rx="10" fill="#120b22" stroke="{RED}" stroke-width="4"/>
<rect x="14" y="14" width="80" height="78" rx="6" fill="#1e1236" stroke="#000" stroke-width="3"/><rect x="106" y="14" width="80" height="78" rx="6" fill="#1e1236" stroke="#000" stroke-width="3"/>
<line x1="14" y1="53" x2="94" y2="53" stroke="#000" stroke-width="3"/><line x1="106" y1="53" x2="186" y2="53" stroke="#000" stroke-width="3"/>
<text x="54" y="80" text-anchor="middle" font-family="Bebas Neue" font-size="78" fill="{RED}">2</text>
<text x="146" y="80" text-anchor="middle" font-family="Bebas Neue" font-size="78" fill="{RED}">8</text>
<text x="100" y="126" text-anchor="middle" font-family="Bebas Neue" font-size="32" letter-spacing="8" fill="{INK}">GIORNI</text>
<circle cx="100" cy="-6" r="5" fill="#555"/><line x1="100" y1="-40" x2="100" y2="-6" stroke="#333" stroke-width="3"/>
</g>
<!-- falda del tetto -->
<path d="M0 360 L840 250 L840 700 L0 700 Z" fill="#2a1f38"/>
<g clip-path="url(#roof)">{shingles()}</g>
<path d="M0 360 L840 250" stroke="#000" stroke-width="8"/>
<path d="M0 352 L840 242" stroke="#5e4a78" stroke-width="5"/>
<!-- comignolo -->
<rect x="120" y="270" width="70" height="110" fill="#7a3d2e" stroke="#000" stroke-width="5"/>
{''.join(f'<line x1="120" y1="{284+k*16}" x2="190" y2="{284+k*16}" stroke="#4e2418" stroke-width="2"/>' for k in range(6))}
<rect x="112" y="262" width="86" height="14" fill="#5a2c20" stroke="#000" stroke-width="4"/>
{''.join(f'<circle cx="{150+k*9}" cy="{240-k*30}" r="{12+k*5}" fill="#c8bce6" opacity="{0.28-k*0.05:.2f}"/>' for k in range(5))}
<!-- abbaino con la finestra accesa -->
<g transform="translate(220 450)">
<path d="M-10 0 L70 -60 L150 0 Z" fill="#3b2f45" stroke="#000" stroke-width="5"/>
<rect x="0" y="0" width="140" height="120" fill="#cfc4b0" stroke="#000" stroke-width="5"/>
<rect x="24" y="18" width="92" height="84" fill="#ffcf7a" stroke="#000" stroke-width="5"/>
<line x1="70" y1="18" x2="70" y2="102" stroke="#000" stroke-width="4"/><line x1="24" y1="60" x2="116" y2="60" stroke="#000" stroke-width="4"/>
<path d="M28 22 L66 22 L66 40 Q46 30 28 46 Z" fill="#fff0c8" opacity=".7"/>
</g>
<!-- buco e motore -->
<ellipse cx="610" cy="430" rx="170" ry="110" fill="url(#hole)"/>
<path d="M500 380 L560 340 L660 330 L730 372 L720 450 L640 490 L540 470 L490 430 Z" fill="#140c20" stroke="#000" stroke-width="5"/>
<path d="M520 400 L548 360 M690 350 L716 400 M560 470 L530 440" stroke="#d9c79c" stroke-width="5" stroke-linecap="round"/>
<path d="M505 385 L470 372 L486 400 Z M725 380 L760 360 L748 396 Z M640 488 L660 520 L620 505 Z" fill="#6a5544" stroke="#000" stroke-width="3"/>
{smoke}
<g transform="translate(615 330) rotate(-32) scale(1.12)">
<rect x="-78" y="-150" width="156" height="250" rx="46" fill="url(#eng)" stroke="#000" stroke-width="6"/>
{''.join(f'<line x1="-78" y1="{-100+k*44}" x2="78" y2="{-100+k*44}" stroke="#4a4a5c" stroke-width="3"/>' for k in range(5))}
{''.join(f'<circle cx="{x}" cy="{-100+k*44+8}" r="2.5" fill="#3a3a4a"/>' for k in range(4) for x in (-60,-30,0,30,60))}
<rect x="-78" y="20" width="156" height="16" fill="#b02a36" stroke="#000" stroke-width="3"/>
<ellipse cx="0" cy="-150" rx="78" ry="28" fill="#1d1d28" stroke="#000" stroke-width="6"/>
<ellipse cx="0" cy="-150" rx="64" ry="22" fill="#2c2c3a"/>
{''.join(f'<path d="M0 -150 L{60*math.cos(math.radians(a)):.1f} {-150+21*math.sin(math.radians(a)):.1f} L{60*math.cos(math.radians(a+14)):.1f} {-150+21*math.sin(math.radians(a+14)):.1f} Z" fill="#9a9aac" stroke="#000" stroke-width="1.5"/>' for a in range(0,360,30))}
<ellipse cx="0" cy="-150" rx="14" ry="6" fill="#d8d8e2" stroke="#000" stroke-width="3"/>
<path d="M-40 -120 Q-60 -40 -50 60" stroke="#ffffff" stroke-width="6" opacity=".45" fill="none"/>
</g>
{debris}{sparks}
</svg>'''
p=dict(bg=BG, ink=INK, accent=AMB, bgcss=f'background:radial-gradient(ellipse at 50% 40%, #2a1a55 0%, {BG} 65%, #030208 100%);',
 bulbs=[VIO,'#FFE3A6',VIO,RED], glow=0.6,
 frame_css=f'4px solid {VIO}', frame_extra=f'outline:2px solid {AMB}66; outline-offset:12px;',
 badge='▶ NUOVO VIDEO SU YOUTUBE', badge_bg='#FFC400', badge_ink='#141414', svg=svg, ill_border=f'6px solid {INK}',
 ctx='Virginia, ottobre 1988', ctx_font="'Special Elite'",
 title=['DONNIE DARKO'], title_css=f"font-family:'Bebas Neue';font-size:170px;letter-spacing:8px;color:{INK};text-shadow:6px 6px 0 {VIO};",
 sub='IL FINALE E LE REGOLE DEL TEMPO', sub_css='font-size:32px;letter-spacing:4px;',
 teaser="Un motore cade dal cielo e il mondo ha 28 giorni.<br>Tutte le regole del tempo, una alla volta.",
 date='MERCOLEDÌ 25 NOVEMBRE · ORE 17:30', date_col='#FFC400', cred='Spiegato facile · Il finale e le regole del tempo<br>Solo su YouTube, link nel profilo')
open('/tmp/claude-0/storie/donnie_darko_lungo.html','w').write(page(p))
