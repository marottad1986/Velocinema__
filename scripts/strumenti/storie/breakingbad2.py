import sys, math; sys.path.insert(0,'/tmp/claude-0/storie/gen'); from base import *
INK='#F6F0DC'; BG='#0E1A0E'; GRN='#3E8E3A'; YEL='#F2C230'; SAND='#D9A35B'
sun=f'<circle cx="640" cy="170" r="70" fill="#FFD25A"/><circle cx="640" cy="170" r="110" fill="#FFD25A" opacity=".18"/>'
cacti=''.join(f'<g transform="translate({x} {y}) scale({s})"><rect x="-10" y="-90" width="20" height="90" rx="10" fill="#3c6e3a" stroke="#000" stroke-width="3"/><path d="M-10 -50 L-28 -50 L-28 -74" fill="none" stroke="#3c6e3a" stroke-width="14" stroke-linecap="round"/><path d="M10 -36 L26 -36 L26 -62" fill="none" stroke="#3c6e3a" stroke-width="14" stroke-linecap="round"/></g>' for x,y,s in [(90,560,1.2),(160,520,.7)])
rocks=''.join(f'<ellipse cx="{x}" cy="{y}" rx="{r}" ry="{r*0.45}" fill="#8a5a33" stroke="#000" stroke-width="3"/>' for x,y,r in [(560,600,30),(250,640,22),(700,640,18)])
svg=f'''<svg width="828" height="688" viewBox="0 0 840 700" role="img" aria-label="Il deserto al tramonto: un vecchio camper con la porta aperta e una nuvola di vapore, mesa rosse sullo sfondo, cactus e in primo piano un'ampolla da laboratorio con un liquido azzurro">
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f6d7a"/><stop offset=".55" stop-color="#e59a4a"/><stop offset="1" stop-color="#f6c66b"/></linearGradient>
<linearGradient id="gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{SAND}"/><stop offset="1" stop-color="#9c6a35"/></linearGradient>
<linearGradient id="blu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fe8ff"/><stop offset="1" stop-color="#2aa7d6"/></linearGradient>
</defs>
<rect width="840" height="700" fill="url(#sky)"/>{sun}
<path d="M0 420 L60 420 L80 330 L250 330 L270 420 L480 420 L500 360 L620 360 L640 420 L840 420 L840 470 L0 470 Z" fill="#b5532c" stroke="#000" stroke-width="4"/>
<path d="M80 330 L250 330 L245 352 L85 352 Z M500 360 L620 360 L616 376 L504 376 Z" fill="#d97a42"/>
<rect y="460" width="840" height="240" fill="url(#gr)"/>
<path d="M300 700 L390 470 L430 470 L560 700 Z" fill="#c48a4a" opacity=".6"/>
{cacti}{rocks}
<!-- camper -->
<g transform="translate(250 380)">
<rect x="0" y="0" width="300" height="130" rx="14" fill="#efe6cc" stroke="#000" stroke-width="5"/>
<rect x="0" y="62" width="300" height="20" fill="#4f8f9a"/>
<path d="M300 40 L360 60 L360 130 L300 130 Z" fill="#efe6cc" stroke="#000" stroke-width="5"/>
<path d="M306 50 L352 64 L352 88 L306 88 Z" fill="#3a5568" stroke="#000" stroke-width="3"/>
<rect x="24" y="16" width="60" height="38" rx="4" fill="#3a5568" stroke="#000" stroke-width="3"/>
<rect x="210" y="16" width="60" height="38" rx="4" fill="#3a5568" stroke="#000" stroke-width="3"/>
<rect x="120" y="22" width="60" height="108" fill="#2a1d14" stroke="#000" stroke-width="4"/>
<path d="M120 22 L90 34 L90 136 L120 130 Z" fill="#d8cdb0" stroke="#000" stroke-width="4"/>
<circle cx="70" cy="138" r="24" fill="#222" stroke="#000" stroke-width="4"/><circle cx="70" cy="138" r="9" fill="#999"/>
<circle cx="290" cy="138" r="24" fill="#222" stroke="#000" stroke-width="4"/><circle cx="290" cy="138" r="9" fill="#999"/>
<rect x="40" y="-14" width="34" height="16" fill="#777" stroke="#000" stroke-width="3"/>
</g>
{''.join(f'<circle cx="{306+k*10}" cy="{350-k*36}" r="{18+k*8}" fill="#ffffff" opacity="{0.55-k*0.1}"/>' for k in range(5))}
<!-- ampolla -->
<g transform="translate(700 470)">
<path d="M-18 -110 L18 -110 L18 -60 L70 40 Q74 58 56 60 L-56 60 Q-74 58 -70 40 L-18 -60 Z" fill="#ffffff44" stroke="#000" stroke-width="5"/>
<path d="M-44 0 L44 0 L66 42 Q68 52 56 54 L-56 54 Q-68 52 -66 42 Z" fill="url(#blu)"/>
{''.join(f'<circle cx="{-20+i*14}" cy="{30-(i%3)*12}" r="{3+i%3}" fill="#e8fbff"/>' for i in range(4))}
<rect x="-24" y="-122" width="48" height="14" rx="4" fill="#ddd" stroke="#000" stroke-width="3"/>
</g>
</svg>'''
p=dict(bg=BG, ink=INK, accent=YEL, bgcss=f'background:radial-gradient(ellipse at 50% 40%, #1f3a1b 0%, {BG} 65%, #040804 100%);',
 bulbs=[YEL,YEL,GRN], glow=0.55,
 frame_css=f'4px solid {GRN}', frame_extra=f'outline:2px solid {YEL}66; outline-offset:12px;',
 badge='💡 SPIEGATO FACILE', badge_bg='#FFC400', badge_ink='#141414', svg=svg, ill_border=f'6px solid {INK}',
 ctx='Albuquerque, Nuovo Messico', ctx_font="'Big Shoulders Display'",
 title=['BREAKING BAD'], title_css=f"font-family:'Big Shoulders Display';font-weight:900;font-size:130px;letter-spacing:6px;color:{INK};text-shadow:5px 5px 0 {GRN};",
 sub='STAGIONE 2',
 teaser='Ora è un criminale vero.<br>Ma ogni dollaro in più è una bugia in più a casa.',
 date='MARTEDÌ 17 NOVEMBRE · ORE 17:30', date_col='#FFC400', cred='Una stagione intera spiegata facile in 2 minuti · Prima visione')
open('/tmp/claude-0/storie/breakingbad2.html','w').write(page(p))
