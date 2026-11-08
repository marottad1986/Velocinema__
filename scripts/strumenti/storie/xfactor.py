import sys, math; sys.path.insert(0,'/tmp/claude-0/storie/gen'); from base import *
INK='#F6EEF8'; BG='#0B0614'; MAG='#FF3EA5'; GOLD='#FFC400'; CY='#53E3FF'
beams=''.join(f'<path d="M{x} 0 L{x-w} 560 L{x+w} 560 Z" fill="{c}" opacity=".16"/>' for x,w,c in [(120,90,MAG),(300,70,CY),(540,70,CY),(720,90,MAG),(420,120,'#ffffff')])
spots=''.join(f'<g transform="translate({x} 26)"><rect x="-26" y="-14" width="52" height="34" rx="6" fill="#222" stroke="#000" stroke-width="3"/><ellipse cx="0" cy="20" rx="20" ry="7" fill="{c}"/></g>' for x,c in [(120,MAG),(300,CY),(420,'#fff'),(540,CY),(720,MAG)])
def desk(x, c):
    return f'''<g transform="translate({x} 560)">
<rect x="-78" y="-70" width="156" height="70" rx="6" fill="#140c22" stroke="{c}" stroke-width="5"/>
<rect x="-66" y="-58" width="132" height="10" rx="5" fill="{c}" opacity=".85"/>
<path d="M-40 -70 L-40 -140 Q-40 -160 -20 -160 L20 -160 Q40 -160 40 -140 L40 -70" fill="#2a1e3c" stroke="#000" stroke-width="4"/>
<rect x="-22" y="-148" width="44" height="60" rx="10" fill="#3b2c52"/>
<rect x="-6" y="-72" width="12" height="14" fill="#555"/>
</g>'''
svg=f'''<svg width="828" height="688" viewBox="0 0 840 700" role="img" aria-label="Palco illuminato da fari colorati, un microfono sull'asta al centro, quattro postazioni dei giudici vuote e un grande schermo con la scritta Live 4">
<defs>
<radialGradient id="stage" cx=".5" cy=".2" r=".9"><stop offset="0" stop-color="#3a1a5a"/><stop offset="1" stop-color="{BG}"/></radialGradient>
<radialGradient id="floorglow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffffff" stop-opacity=".45"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>
</defs>
<rect width="840" height="700" fill="url(#stage)"/>
<!-- schermo -->
<rect x="250" y="80" width="340" height="190" rx="10" fill="#120a20" stroke="{INK}" stroke-width="6"/>
{''.join(f'<circle cx="{270+i*20}" cy="{100+j*20}" r="3" fill="{MAG}" opacity=".25"/>' for i in range(16) for j in range(8))}
<text x="420" y="205" text-anchor="middle" font-family="Monoton" font-size="86" fill="{GOLD}">LIVE 4</text>
{beams}{spots}
<!-- pedana -->
<ellipse cx="420" cy="590" rx="380" ry="70" fill="#1b1030" stroke="{MAG}" stroke-width="5"/>
<ellipse cx="420" cy="575" rx="300" ry="48" fill="#25163f" stroke="{CY}" stroke-width="3"/>
<ellipse cx="420" cy="560" rx="160" ry="26" fill="url(#floorglow)"/>
{desk(110,MAG)}{desk(260,CY)}{desk(580,CY)}{desk(730,MAG)}
<!-- microfono -->
<g transform="translate(420 0)">
<line x1="0" y1="560" x2="0" y2="360" stroke="#c9c9d6" stroke-width="8"/>
<path d="M-40 565 L40 565 L0 548 Z" fill="#c9c9d6" stroke="#000" stroke-width="3"/>
<line x1="0" y1="372" x2="30" y2="352" stroke="#c9c9d6" stroke-width="7"/>
<rect x="18" y="300" width="34" height="62" rx="16" fill="#2b2b33" stroke="#000" stroke-width="4" transform="rotate(-30 35 331)"/>
<ellipse cx="44" cy="306" rx="20" ry="22" fill="#9a9aa8" stroke="#000" stroke-width="4"/>
{''.join(f'<line x1="{30+i*6}" y1="292" x2="{30+i*6}" y2="320" stroke="#000" stroke-width="2" opacity=".5"/>' for i in range(5))}
</g>
<!-- stelline e coriandoli -->
{''.join(f'<rect x="{(i*71)%820}" y="{280+(i*37)%240}" width="8" height="14" fill="{[MAG,CY,GOLD][i%3]}" transform="rotate({i*23} {(i*71)%820} {280+(i*37)%240})" opacity=".8"/>' for i in range(26))}
</svg>'''
p=dict(bg=BG, ink=INK, accent=CY, bgcss=f'background:radial-gradient(ellipse at 50% 40%, #2a1145 0%, {BG} 65%, #030106 100%);',
 bulbs=[MAG,GOLD,CY,GOLD], glow=0.7,
 frame_css=f'4px solid {MAG}', frame_extra=f'outline:2px solid {CY}88; outline-offset:12px; box-shadow:0 0 30px {MAG}55 inset;',
 badge='💡 SPIEGATO FACILE', badge_bg='#FFC400', badge_ink='#141414', svg=svg, ill_border=f'6px solid {INK}',
 ctx='Milano, autunno 2026',
 title=['X FACTOR 2026'], title_css=f"font-family:Monoton;font-size:104px;letter-spacing:2px;color:{INK};text-shadow:0 0 18px {MAG},0 0 40px {MAG}88;",
 sub='CHI È ANCORA IN GARA',
 teaser='Ti sei perso le prime puntate?<br>Ecco chi è rimasto, prima del Live 4.',
 date='GIOVEDÌ 12 NOVEMBRE · ORE 17:30', date_col='#FFC400', cred='Tutto quello che è successo finora, spiegato facile · Prima visione')
open('/tmp/claude-0/storie/xfactor.html','w').write(page(p))
