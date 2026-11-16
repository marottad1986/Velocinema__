import sys, math; sys.path.insert(0,'/tmp/claude-0/storie/gen'); from base import *
INK='#F3EBD8'; BG='#0E1A2E'; BLUE='#1F3A68'; GOLD='#E7B65C'; PAPER='#EFE3C6'

# artigli di schiuma lungo la cresta dell'onda
def claws(cx, cy, r, a0, a1, n, size):
    out = []
    for i in range(n):
        a = math.radians(a0 + (a1 - a0) * i / (n - 1))
        x, y = cx + r * math.cos(a), cy + r * math.sin(a)
        ang = math.degrees(a) + 90
        out.append(f'<g transform="translate({x:.1f} {y:.1f}) rotate({ang:.1f})">'
                   f'<path d="M0 0 C {size*.3} {-size*.5} {size*.9} {-size*.6} {size*1.1} {-size*.2} '
                   f'C {size*.8} {-size*.35} {size*.5} {-size*.2} {size*.55} {size*.15} '
                   f'C {size*.35} {-size*.05} {size*.15} {size*.05} 0 {size*.25} Z" fill="{PAPER}" stroke="#0b1424" stroke-width="2.5"/></g>')
    return ''.join(out)

spray = ''.join(f'<circle cx="{180+(i*53)%420}" cy="{60+(i*37)%160}" r="{2+(i%4)}" fill="{PAPER}" opacity="{0.55+(i%3)*0.15}"/>' for i in range(70))
boat = lambda x, y, rot: (f'<g transform="translate({x} {y}) rotate({rot})">'
    f'<path d="M-120 0 Q0 26 120 -6 L110 14 Q0 40 -112 18 Z" fill="#d9c9a3" stroke="#0b1424" stroke-width="4"/>'
    f'<path d="M-112 8 Q0 32 114 2" fill="none" stroke="#8a6d3f" stroke-width="3"/>'
    + ''.join(f'<line x1="{-80+k*32}" y1="4" x2="{-96+k*32}" y2="40" stroke="#5a4325" stroke-width="4" stroke-linecap="round"/>' for k in range(6))
    + '</g>')
svg = f'''<svg width="828" height="688" viewBox="0 0 840 700" role="img" aria-label="Un'onda enorme con la cresta di schiuma ad artigli si piega sopra tre barche strette; sotto, lontano, il piccolo monte Fuji innevato su un cielo color carta">
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8c79f"/><stop offset=".7" stop-color="{PAPER}"/><stop offset="1" stop-color="#e9dcbc"/></linearGradient>
<linearGradient id="wave" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2c5590"/><stop offset=".55" stop-color="{BLUE}"/><stop offset="1" stop-color="#0f213f"/></linearGradient>
<linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b4f86"/><stop offset="1" stop-color="#132848"/></linearGradient>
<pattern id="paper" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="none"/><circle cx="1" cy="2" r=".7" fill="#00000012"/><circle cx="4" cy="5" r=".6" fill="#ffffff22"/></pattern>
</defs>
<rect width="840" height="700" fill="url(#sky)"/>
<!-- nuvole basse -->
<path d="M0 250 Q120 220 260 240 T520 236 T840 244 L840 270 L0 270 Z" fill="#cdb98e" opacity=".55"/>
<!-- monte Fuji lontano -->
<g transform="translate(560 452)">
 <path d="M-120 0 L-26 -112 Q0 -126 26 -112 L120 0 Z" fill="#3e5f8f" stroke="#0b1424" stroke-width="3"/>
 <path d="M-26 -112 Q0 -126 26 -112 L48 -84 L30 -90 L18 -76 L4 -92 L-10 -78 L-24 -92 L-48 -84 Z" fill="#fbf6ea" stroke="#0b1424" stroke-width="2.5"/>
</g>
<!-- mare in fondo -->
<path d="M0 450 Q100 430 200 448 T420 446 T640 450 T840 444 L840 700 L0 700 Z" fill="url(#sea)" stroke="#0b1424" stroke-width="3"/>
<!-- onda piccola a forma di montagna -->
<path d="M430 520 Q500 440 560 470 Q600 488 640 520 Z" fill="url(#wave)" stroke="#0b1424" stroke-width="4"/>
<path d="M490 470 Q520 452 556 468 L540 478 L524 470 L510 482 L498 472 Z" fill="{PAPER}" stroke="#0b1424" stroke-width="2"/>
<!-- grande onda -->
<path d="M-20 700 L-20 560 Q20 420 120 300 Q230 160 400 120 Q520 96 600 150 Q650 186 640 240 Q620 210 580 206 Q520 204 500 260 Q480 320 400 380 Q320 450 260 560 Q230 620 240 700 Z" fill="url(#wave)" stroke="#0b1424" stroke-width="5"/>
<!-- linee d'acqua dentro l'onda -->
{''.join(f'<path d="M{20+i*28} 690 Q{60+i*30} {520-i*30} {170+i*36} {380-i*28}" fill="none" stroke="#9fc0e6" stroke-width="3" opacity=".55"/>' for i in range(7))}
<!-- schiuma della cresta -->
<path d="M120 300 Q230 160 400 120 Q520 96 600 150 Q650 186 640 240 Q620 196 572 186 Q470 170 400 196 Q300 230 200 330 Z" fill="{PAPER}" stroke="#0b1424" stroke-width="4"/>
{claws(560, 280, 110, -150, 20, 13, 30)}
{claws(470, 330, 180, -165, -110, 7, 26)}
{spray}
<!-- barche -->
{boat(330, 610, -12)}
{boat(640, 590, 8)}
<g opacity=".95">{boat(150, 520, -24)}</g>
<!-- spruzzi in primo piano -->
<path d="M0 640 Q90 600 180 640 Q260 676 360 640 Q460 600 560 644 Q660 684 760 640 Q810 620 840 630 L840 700 L0 700 Z" fill="#132848" stroke="#0b1424" stroke-width="4"/>
{''.join(f'<path d="M{40+i*96} 650 q16 -26 34 -6 q-12 -6 -20 10 z" fill="{PAPER}" stroke="#0b1424" stroke-width="2"/>' for i in range(9))}
<!-- sigillo con le cifre dell'anno -->
<g transform="translate(70 70)"><rect x="-30" y="-30" width="60" height="96" fill="#b3261e" stroke="#0b1424" stroke-width="3"/><text x="0" y="0" text-anchor="middle" font-family="Zen Old Mincho" font-weight="700" font-size="22" fill="{PAPER}">18</text><text x="0" y="34" text-anchor="middle" font-family="Zen Old Mincho" font-weight="700" font-size="22" fill="{PAPER}">31</text></g>
<rect width="840" height="700" fill="url(#paper)"/>
</svg>'''
p=dict(bg=BG, ink=INK, accent=GOLD, bgcss=f'background:radial-gradient(ellipse at 50% 35%, #22406e 0%, {BG} 62%, #060c17 100%);',
 bulbs=['#F7E6B8','#9FC0E6',GOLD], glow=0.5,
 frame_css=f'6px double {GOLD}', frame_extra=f'outline:2px solid {GOLD}66; outline-offset:12px;',
 badge='🎨 ARTE IN 2 MINUTI', badge_bg='#FFC400', badge_ink='#141414', svg=svg, ill_border=f'8px solid {PAPER}',
 ctx='Giappone, 1831 circa', ctx_font="'Zen Old Mincho'",
 title=['LA GRANDE ONDA', 'DI KANAGAWA'], title_css=f"font-family:'Shippori Mincho B1';font-weight:800;font-size:96px;letter-spacing:2px;color:{INK};text-shadow:0 5px 0 #000,0 0 22px #9FC0E655;",
 teaser="Un'onda gigantesca, tre barche e un monte lontano.<br>Perché è l'immagine giapponese più famosa?",
 date='DOMENICA 15 NOVEMBRE · ORE 10:00', date_col='#FFC400', cred='Un capolavoro spiegato in 2 minuti · Prima visione')
open('/tmp/claude-0/storie/grandeonda.html','w').write(page(p))
