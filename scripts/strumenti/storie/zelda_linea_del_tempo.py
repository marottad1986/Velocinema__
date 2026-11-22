import sys, math; sys.path.insert(0,'/tmp/claude-0/storie/gen'); from base import *
# Storia «Zelda: la linea del tempo» (Videogiochi spiegati). Illustrazione originale: regno verde, castello sulla collina,
# spada nella pietra sotto un fascio di luce, una linea del tempo luminosa che si divide in tre rami.
# Nessun elemento grafico ufficiale del gioco (niente triforza, stemmi, personaggi).
INK='#F5EFD8'; BG='#0B1A14'; GRN='#3FA34D'; GOLD='#F2C14E'; SKY='#7FD3E6'
B1='#FFD66B'; B2='#7FD3FF'; B3='#FF8A6B'
clouds=''.join(f'<g opacity=".9"><ellipse cx="{x}" cy="{y}" rx="{w}" ry="{w*0.32:.0f}" fill="#fff8e6" stroke="#2b3b3a" stroke-width="3"/><ellipse cx="{x-w*0.35:.0f}" cy="{y-w*0.16:.0f}" rx="{w*0.45:.0f}" ry="{w*0.3:.0f}" fill="#fff8e6"/><ellipse cx="{x+w*0.25:.0f}" cy="{y-w*0.2:.0f}" rx="{w*0.4:.0f}" ry="{w*0.32:.0f}" fill="#fff8e6"/></g>' for x,y,w in [(150,110,90),(700,80,70),(560,170,50)])
birds=''.join(f'<path d="M{x} {y} q8 -8 16 0 q8 -8 16 0" fill="none" stroke="#2b3b3a" stroke-width="3" stroke-linecap="round"/>' for x,y in [(330,90),(370,70),(410,100)])
def tower(x,y,w,h,roof):
    s=f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="#e9e0c8" stroke="#1d2a26" stroke-width="4"/>'
    s+=''.join(f'<line x1="{x}" y1="{y+k*14}" x2="{x+w}" y2="{y+k*14}" stroke="#c9bd9e" stroke-width="2"/>' for k in range(1,int(h/14)))
    s+=f'<path d="M{x-6} {y} L{x+w/2} {y-roof} L{x+w+6} {y} Z" fill="#3a6fb0" stroke="#1d2a26" stroke-width="4"/>'
    s+=f'<line x1="{x+w/2}" y1="{y-roof}" x2="{x+w/2}" y2="{y-roof-26}" stroke="#1d2a26" stroke-width="3"/><path d="M{x+w/2} {y-roof-26} l22 7 l-22 7 z" fill="{B3}" stroke="#1d2a26" stroke-width="2"/>'
    s+=f'<rect x="{x+w/2-6}" y="{y+18}" width="12" height="20" rx="6" fill="#ffd98a" stroke="#1d2a26" stroke-width="2"/>'
    return s
castle=(tower(560,150,40,120,70)+tower(690,160,40,110,64)+
 f'<rect x="590" y="200" width="110" height="80" fill="#e9e0c8" stroke="#1d2a26" stroke-width="4"/>'+
 ''.join(f'<rect x="{590+k*16}" y="190" width="10" height="12" fill="#e9e0c8" stroke="#1d2a26" stroke-width="3"/>' for k in range(7))+
 tower(625,110,40,100,80)+
 f'<path d="M630 280 L630 250 Q645 232 660 250 L660 280 Z" fill="#5a3a22" stroke="#1d2a26" stroke-width="3"/>'+
 f'<rect x="530" y="262" width="230" height="24" fill="#d6caa8" stroke="#1d2a26" stroke-width="4"/>'+
 ''.join(f'<rect x="{530+k*20}" y="254" width="12" height="10" fill="#d6caa8" stroke="#1d2a26" stroke-width="3"/>' for k in range(12)))
trees=''.join(f'<g><rect x="{x-4}" y="{y}" width="8" height="{14*s:.0f}" fill="#5a3a22"/><ellipse cx="{x}" cy="{y-6*s:.0f}" rx="{16*s:.0f}" ry="{20*s:.0f}" fill="{c}" stroke="#123020" stroke-width="3"/></g>' for x,y,s,c in [(40,330,1.2,'#2f7a3c'),(80,340,1,'#3b8c45'),(120,335,1.3,'#2f7a3c'),(800,320,1.1,'#3b8c45'),(770,340,1.3,'#2f7a3c'),(470,300,.8,'#3b8c45'),(500,305,.7,'#2f7a3c'),(240,360,.9,'#2f7a3c')])
flowers=''.join(f'<circle cx="{(i*73)%840}" cy="{560+(i*37)%130}" r="{3+i%3}" fill="{["#fff5b0","#ffb3c7","#b3e5ff"][i%3]}" stroke="#123020" stroke-width="1"/>' for i in range(46))
grass=''.join(f'<path d="M{(i*29)%840} {600+(i*17)%100} l-4 -14 M{(i*29)%840} {600+(i*17)%100} l4 -12" stroke="#1f5e2c" stroke-width="2.5" stroke-linecap="round"/>' for i in range(70))
motes=''.join(f'<circle cx="{390+((i*23)%120)-60}" cy="{60+(i*41)%400}" r="{1.5+i%3}" fill="#fff6c8" opacity="{0.5+(i%3)*0.15}"/>' for i in range(26))
# linea del tempo che si divide in tre rami (parte dalla spada)
def branchpath(d,col,nodes):
    s=f'<path d="{d}" fill="none" stroke="{col}" stroke-width="16" opacity=".25" stroke-linecap="round"/><path d="{d}" fill="none" stroke="{col}" stroke-width="6" stroke-linecap="round" stroke-dasharray="1 0"/>'
    s+=''.join(f'<circle cx="{x}" cy="{y}" r="9" fill="{col}" stroke="#1d2a26" stroke-width="3"/>' for x,y in nodes)
    return s
tl=(f'<path d="M30 560 L330 560" fill="none" stroke="#fff3c4" stroke-width="16" opacity=".25" stroke-linecap="round"/><path d="M30 560 L330 560" fill="none" stroke="#fff3c4" stroke-width="6" stroke-linecap="round"/>'+
 ''.join(f'<circle cx="{x}" cy="560" r="9" fill="#fff3c4" stroke="#1d2a26" stroke-width="3"/>' for x in (80,170,250))+
 branchpath('M330 560 Q420 560 470 500 T620 470 L810 470',B1,[(560,478),(690,470),(800,470)])+
 branchpath('M330 560 Q430 560 520 575 L810 575',B2,[(600,575),(700,575),(800,575)])+
 branchpath('M330 560 Q420 560 470 625 T620 665 L810 665',B3,[(560,655),(690,665),(800,665)])+
 f'<circle cx="330" cy="560" r="16" fill="#fff3c4" stroke="#1d2a26" stroke-width="4"/><circle cx="330" cy="560" r="7" fill="{GOLD}"/>')
svg=f'''<svg width="828" height="688" viewBox="0 0 840 700" role="img" aria-label="Un regno verde all'alba: un castello dai tetti blu su una collina, boschi e un sentiero; in primo piano una spada piantata in un blocco di pietra sotto un fascio di luce, e da lì una linea del tempo luminosa che si divide in tre rami">
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f8fb0"/><stop offset=".6" stop-color="{SKY}"/><stop offset="1" stop-color="#ffe9b0"/></linearGradient>
<linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6c8" stop-opacity=".05"/><stop offset=".7" stop-color="#fff6c8" stop-opacity=".55"/><stop offset="1" stop-color="#fff6c8" stop-opacity=".8"/></linearGradient>
<linearGradient id="hill1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6cc06a"/><stop offset="1" stop-color="#3a8c45"/></linearGradient>
<linearGradient id="hill2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4fa357"/><stop offset="1" stop-color="#1f5e2c"/></linearGradient>
<linearGradient id="blade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b8c6d6"/><stop offset=".5" stop-color="#ffffff"/><stop offset="1" stop-color="#8c9cb0"/></linearGradient>
<radialGradient id="halo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff6c8" stop-opacity=".9"/><stop offset="1" stop-color="#fff6c8" stop-opacity="0"/></radialGradient>
</defs>
<rect width="840" height="700" fill="url(#sky)"/>
{clouds}{birds}
<path d="M0 250 L90 170 L170 230 L260 150 L360 240 L840 240 L840 300 L0 300 Z" fill="#7aa6b8" opacity=".8" stroke="#2b3b3a" stroke-width="3"/>
<path d="M90 170 L112 190 L98 192 L80 180 Z M260 150 L284 172 L268 176 L246 162 Z" fill="#fff"/>
<path d="M0 330 Q200 260 420 300 Q520 220 650 250 Q760 270 840 300 L840 460 L0 460 Z" fill="url(#hill1)" stroke="#1d2a26" stroke-width="4"/>
{castle}
<path d="M650 290 Q600 340 520 360 Q440 380 400 440" fill="none" stroke="#e7d7a8" stroke-width="12" stroke-linecap="round"/>
{trees}
<path d="M0 420 Q220 380 420 410 Q620 440 840 400 L840 700 L0 700 Z" fill="url(#hill2)" stroke="#1d2a26" stroke-width="4"/>
{grass}{flowers}
<!-- fascio di luce -->
<path d="M360 0 L420 0 L460 520 L320 520 Z" fill="url(#beam)"/>
{motes}
<ellipse cx="390" cy="500" rx="120" ry="60" fill="url(#halo)"/>
<!-- linea del tempo a tre rami -->
{tl}
<!-- pietra e spada -->
<path d="M320 540 L336 480 L446 480 L462 540 Z" fill="#9aa3a0" stroke="#1d2a26" stroke-width="5"/>
<path d="M336 480 L446 480 L440 466 L342 466 Z" fill="#c2cac6" stroke="#1d2a26" stroke-width="4"/>
<path d="M346 500 L380 506 M410 520 L440 512 M352 528 L372 532" stroke="#6f7875" stroke-width="3" stroke-linecap="round"/>
<path d="M326 520 q10 -14 24 -4 M432 486 q10 -10 20 2" stroke="#3b8c45" stroke-width="5" fill="none" stroke-linecap="round"/>
<path d="M383 470 L383 330 L391 312 L399 330 L399 470 Z" fill="url(#blade)" stroke="#1d2a26" stroke-width="4"/>
<line x1="391" y1="326" x2="391" y2="468" stroke="#8c9cb0" stroke-width="2"/>
<rect x="356" y="296" width="70" height="14" rx="7" fill="#7a5a32" stroke="#1d2a26" stroke-width="4"/>
<rect x="384" y="236" width="14" height="60" rx="5" fill="#4a3424" stroke="#1d2a26" stroke-width="4"/>
{''.join(f'<line x1="384" y1="{244+k*10}" x2="398" y2="{248+k*10}" stroke="#2c1e14" stroke-width="2"/>' for k in range(5))}
<circle cx="391" cy="228" r="11" fill="{GOLD}" stroke="#1d2a26" stroke-width="4"/>
<path d="M376 340 L378 460" stroke="#ffffff" stroke-width="2" opacity=".6"/>
</svg>'''
p=dict(bg=BG, ink=INK, accent=GOLD, bgcss=f'background:radial-gradient(ellipse at 50% 38%, #1e4a32 0%, {BG} 65%, #030805 100%);',
 bulbs=[GOLD,'#FFF3C4',GRN,B2], glow=0.6,
 frame_css=f'4px double {GOLD}', frame_extra=f'outline:2px solid {GRN}88; outline-offset:12px; border-radius:18px;',
 badge='🎮 VIDEOGIOCHI SPIEGATI', badge_bg='#FFC400', badge_ink='#141414', svg=svg, ill_border=f'6px solid {INK}', ill_radius=14,
 ctx='Un regno, tre destini', ctx_font="'IM Fell English SC'",
 title=['ZELDA'], title_css=f"font-family:Cinzel;font-weight:900;font-size:180px;letter-spacing:22px;color:{INK};text-shadow:5px 5px 0 {GRN},0 0 26px {GOLD}88;",
 sub='LA LINEA DEL TEMPO', sub_css="font-family:Cinzel;font-weight:700;",
 teaser="Tanti giochi, un solo regno che rinasce sempre.<br>Perché la sua storia si divide in tre?",
 date='SABATO 28 NOVEMBRE · ORE 12:30', date_col='#FFC400', cred='La storia di un videogioco spiegata facile in 2 minuti · Prima visione')
open('/tmp/claude-0/storie/zelda_linea_del_tempo.html','w').write(page(p))
