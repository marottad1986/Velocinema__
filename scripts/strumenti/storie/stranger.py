import sys, math; sys.path.insert(0,'/tmp/claude-0/storie/gen'); from base import *
INK='#F2E6D0'; BG='#0A0D1A'; RED='#D7263D'; CRE='#F2E6D0'
stars=''.join(f'<circle cx="{(i*97)%840}" cy="{(i*53)%260}" r="{1+(i%3)*0.7}" fill="#fff" opacity=".6"/>' for i in range(60))
trees=''.join(f'<path d="M{x} {480} L{x+w/2} {h} L{x+w} 480 Z" fill="#06100c" stroke="#000" stroke-width="2"/>' for x,w,h in [(-20,120,190),(70,110,230),(160,130,170),(560,120,200),(650,140,160),(760,110,220),(250,90,250),(480,100,240)])
bulbs_line=''.join(f'<circle cx="{40+i*40}" cy="{110+18*math.sin(i*0.7)}" r="8" fill="{["#ff5b5b","#ffd34d","#4dd2ff","#7dff6a"][i%4]}" stroke="#000" stroke-width="2"/><circle cx="{40+i*40}" cy="{110+18*math.sin(i*0.7)}" r="20" fill="{["#ff5b5b","#ffd34d","#4dd2ff","#7dff6a"][i%4]}" opacity=".25"/>' for i in range(20))
def bike(x,y,rot,col):
    return f'''<g transform="translate({x} {y}) rotate({rot})"><circle cx="-55" cy="0" r="36" fill="none" stroke="#111" stroke-width="7"/><circle cx="55" cy="0" r="36" fill="none" stroke="#111" stroke-width="7"/>
<circle cx="-55" cy="0" r="36" fill="none" stroke="#666" stroke-width="2"/><circle cx="55" cy="0" r="36" fill="none" stroke="#666" stroke-width="2"/>
<path d="M-55 0 L-10 -50 L40 -50 L55 0 M-10 -50 L5 0 L40 -50 M5 0 L-55 0" fill="none" stroke="{col}" stroke-width="8" stroke-linejoin="round"/>
<path d="M40 -50 L48 -72 M36 -74 L62 -70" stroke="#ccc" stroke-width="6" stroke-linecap="round"/><path d="M-18 -56 L4 -56" stroke="#222" stroke-width="10" stroke-linecap="round"/></g>'''
svg=f'''<svg width="828" height="688" viewBox="0 0 840 700" role="img" aria-label="Un bosco di notte con tre biciclette lasciate a terra, una torcia accesa nell'erba, una fila di lucine colorate e una luce rossa che filtra da una crepa nel terreno">
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1230"/><stop offset="1" stop-color="#1b1f3a"/></linearGradient>
<radialGradient id="redglow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="{RED}" stop-opacity=".75"/><stop offset="1" stop-color="{RED}" stop-opacity="0"/></radialGradient>
<linearGradient id="beam" x1="0" x2="1"><stop offset="0" stop-color="#fff6c8" stop-opacity=".75"/><stop offset="1" stop-color="#fff6c8" stop-opacity="0"/></linearGradient>
</defs>
<rect width="840" height="700" fill="url(#sky)"/>
{stars}
<circle cx="680" cy="150" r="44" fill="#e9e4cf" opacity=".9"/>
<!-- filo di lucine -->
<path d="M0 100 {' '.join(f'L{40+i*40} {110+18*math.sin(i*0.7):.1f}' for i in range(20))} L840 110" fill="none" stroke="#111" stroke-width="3"/>
{bulbs_line}
{trees}
<rect x="0" y="470" width="840" height="230" fill="#0d1a12"/>
<!-- crepa rossa -->
<ellipse cx="420" cy="560" rx="260" ry="70" fill="url(#redglow)"/>
<path d="M240 560 L300 548 L330 566 L380 540 L420 560 L470 538 L520 566 L560 548 L610 562" fill="none" stroke="#ff8a8a" stroke-width="6" stroke-linejoin="round"/>
<path d="M240 560 L300 548 L330 566 L380 540 L420 560 L470 538 L520 566 L560 548 L610 562 L600 572 L560 560 L520 578 L470 552 L420 574 L380 554 L330 580 L300 562 L250 572 Z" fill="#2a0408"/>
{''.join(f'<circle cx="{300+i*28}" cy="{520-(i*37)%90}" r="{2+(i%3)}" fill="#ffd0d0" opacity=".7"/>' for i in range(12))}
<!-- biciclette -->
{bike(150,630,-8,'#c9302c')}{bike(690,628,10,'#2f6fd6')}{bike(420,665,3,'#e0b83a')}
<!-- torcia -->
<g transform="translate(250 520) rotate(-12)"><path d="M0 0 L300 -60 L300 60 Z" fill="url(#beam)"/><rect x="-60" y="-12" width="60" height="24" rx="6" fill="#333" stroke="#000" stroke-width="3"/><rect x="-6" y="-17" width="14" height="34" rx="4" fill="#777" stroke="#000" stroke-width="3"/></g>
<!-- walkie-talkie -->
<g transform="translate(560 600) rotate(12)"><rect x="-18" y="-40" width="36" height="70" rx="6" fill="#222" stroke="#000" stroke-width="3"/><rect x="-10" y="-30" width="20" height="18" fill="#3c6" opacity=".6"/><rect x="8" y="-80" width="6" height="42" fill="#222"/></g>
</svg>'''
p=dict(bg=BG, ink=INK, accent=RED, bgcss=f'background:radial-gradient(ellipse at 50% 40%, #1a1d3a 0%, {BG} 65%, #02030a 100%);',
 bulbs=['#ff5b5b','#ffd34d','#4dd2ff','#7dff6a'], glow=0.6,
 frame_css=f'3px solid {CRE}', frame_extra=f'outline:2px solid {RED}88; outline-offset:12px;',
 badge='💡 SPIEGATO FACILE', badge_bg='#FFC400', badge_ink='#141414', svg=svg, ill_border=f'6px solid {CRE}',
 ctx='Hawkins, Indiana, 1983', ctx_font="'Special Elite'",
 title=['STRANGER THINGS'], title_css=f"font-family:'Special Elite';font-size:104px;letter-spacing:2px;color:{CRE};text-shadow:0 0 16px {RED}aa,0 4px 0 #000;",
 sub='STAGIONE 1',
 teaser='Un ragazzino sparisce nel nulla in una piccola città.<br>E nel bosco compare una bambina con strani poteri.',
 date='SABATO 14 NOVEMBRE · ORE 17:30', date_col='#FFC400', cred='Una stagione intera spiegata facile in 2 minuti · Prima visione')
open('/tmp/claude-0/storie/stranger.html','w').write(page(p))
