import sys, math; sys.path.insert(0,'/tmp/claude-0/storie/gen'); from base import *
INK='#F2EEE6'; BG='#0A0B12'; PUR='#4A3478'; YEL='#F5C518'; GRASS='#1f6b3a'
# linea del battito
ecg='M0 170 L250 170 L275 170 L290 140 L305 170 L330 170 L345 60 L362 250 L378 130 L392 170 L560 170 L575 150 L590 170 L840 170'
towers=''.join(f'''<g transform="translate({x} 0)"><rect x="-6" y="120" width="12" height="230" fill="#2b2d3a" stroke="#000" stroke-width="3"/>
<rect x="-46" y="80" width="92" height="50" rx="4" fill="#1d1f2b" stroke="#000" stroke-width="3"/>
{''.join(f'<circle cx="{-34+i*17}" cy="{94+j*20}" r="6" fill="#fff7d6"/>' for i in range(5) for j in range(2))}
<path d="M-46 130 L{-260 if x<420 else 120} 640 L{-60 if x<420 else 320} 640 Z" fill="#fff7d6" opacity=".10"/></g>''' for x in (110,730))
crowd=''.join(f'<rect x="{i*14}" y="{345+(i*7)%9}" width="10" height="8" rx="2" fill="#2a2440" opacity=".9"/>' for i in range(60))
svg=f'''<svg width="828" height="688" viewBox="0 0 840 700" role="img" aria-label="Uno stadio vuoto di notte: il prato illuminato dai fari, un pallone fermo sul dischetto di centrocampo, una linea gialla del battito cardiaco nel cielo e un tabellone con l'orologio fermo al minuto 17">
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#07070f"/><stop offset="1" stop-color="#2a1d4a"/></linearGradient>
<linearGradient id="pitch" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c5a33"/><stop offset="1" stop-color="#2b8a4c"/></linearGradient>
<filter id="glow"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<rect width="840" height="700" fill="url(#sky)"/>
{''.join(f'<circle cx="{(i*97)%840}" cy="{(i*41)%160}" r="1.6" fill="#fff" opacity=".5"/>' for i in range(40))}
<path d="{ecg}" fill="none" stroke="{YEL}" stroke-width="7" stroke-linejoin="round" filter="url(#glow)"/>
<!-- tribune -->
<path d="M0 300 Q420 250 840 300 L840 380 L0 380 Z" fill="#191626" stroke="#000" stroke-width="3"/>
{crowd}
{towers}
<!-- tabellone -->
<g transform="translate(420 300)"><rect x="-80" y="-56" width="160" height="66" rx="6" fill="#111" stroke="{INK}" stroke-width="4"/>
<text x="0" y="-8" text-anchor="middle" font-family="Big Shoulders Display" font-weight="900" font-size="50" fill="{YEL}" letter-spacing="3">17'</text></g>
<!-- campo in prospettiva -->
<path d="M140 380 L700 380 L840 700 L0 700 Z" fill="url(#pitch)"/>
{''.join(f'<path d="M{140+i*80} 380 L{700-(6-i)*80+(i-0)*0} 380" stroke="none"/>' for i in range(1))}
{''.join(f'<path d="M{140+i*56:.0f} 380 L{0+i*84:.0f} 700 L{84+i*84:.0f} 700 L{196+i*56:.0f} 380 Z" fill="#ffffff" opacity=".05"/>' for i in range(0,10,2))}
<path d="M140 380 L700 380 L840 700 L0 700 Z" fill="none" stroke="#e9f5ec" stroke-width="5"/>
<line x1="70" y1="540" x2="770" y2="540" stroke="#e9f5ec" stroke-width="5"/>
<ellipse cx="420" cy="540" rx="150" ry="46" fill="none" stroke="#e9f5ec" stroke-width="5"/>
<ellipse cx="420" cy="540" rx="6" ry="3" fill="#e9f5ec"/>
<!-- pallone -->
<g transform="translate(420 520)"><ellipse cx="0" cy="22" rx="28" ry="7" fill="#000" opacity=".35"/>
<circle r="24" fill="#f7f7f2" stroke="#000" stroke-width="4"/>
<path d="M0 -9 L9 -3 L6 8 L-6 8 L-9 -3 Z" fill="#111"/>
<path d="M0 -9 L0 -23 M9 -3 L22 -8 M6 8 L14 19 M-6 8 L-14 19 M-9 -3 L-22 -8" stroke="#111" stroke-width="3"/></g>
<!-- bordo del campo -->
<rect x="0" y="380" width="840" height="10" fill="#0f2a1a"/>
</svg>'''
p=dict(bg=BG, ink=INK, accent=YEL, bgcss=f'background:radial-gradient(ellipse at 50% 40%, #241a3f 0%, {BG} 65%, #030307 100%);',
 bulbs=[YEL,'#FFF7D6',YEL,'#9B7BE0'], glow=0.55,
 frame_css=f'4px solid {PUR}', frame_extra=f'outline:2px solid {YEL}77; outline-offset:12px;',
 collab='file:///home/user/Velocinema__/public/collab/mrgoal-scritta.png',
 badge='⚽ LA STORIA IN 2 MINUTI', badge_bg='#FFC400', badge_ink='#141414', svg=svg, ill_border=f'6px solid {INK}',
 ctx='Firenze, 1 dicembre 2024', ctx_font="Oswald",
 title=['EDOARDO BOVE'], title_css=f"font-family:'Bebas Neue';font-size:150px;letter-spacing:6px;color:{INK};text-shadow:0 6px 0 {PUR},0 0 26px {YEL}44;",
 sub='DAL DOCUMENTARIO «IN UN BATTITO»', sub_css='font-size:28px;letter-spacing:5px;white-space:nowrap;',
 teaser='Un malore in campo a 22 anni.<br>Come ha fatto a tornare a giocare?',
 date='DOMENICA 15 NOVEMBRE · ORE 17:00', date_col='#FFC400', cred='Una storia vera in soli 2 minuti · Prima visione')
open('/tmp/claude-0/storie/bove.html','w').write(page(p))
