import sys, math; sys.path.insert(0,'/tmp/claude-0/storie/gen'); from base import *
INK='#EEF4F4'; BG='#0A1416'; TEAL='#2FB3A6'; BLU='#4C7CF0'
cells=''.join(f'<text x="{40+(i%9)*22}" y="{36+(i//9)*26}" font-family="Figtree" font-weight="800" font-size="18" fill="#9ff2d6" opacity="{0.4+((i*7)%5)*0.12}">{(i*37)%10}</text>' for i in range(54))
svg=f'''<svg width="828" height="688" viewBox="0 0 840 700" role="img" aria-label="Un lungo corridoio bianco senza finestre con il pavimento verde, in fondo una porta d'ascensore; in primo piano una scrivania con un vecchio computer dallo schermo pieno di numeri e un badge aziendale con due metà di colori diversi">
<defs>
<linearGradient id="w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f7f6"/><stop offset="1" stop-color="#d4dcda"/></linearGradient>
<linearGradient id="fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f6f5e"/><stop offset="1" stop-color="#5fae8f"/></linearGradient>
<linearGradient id="scr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c3a3a"/><stop offset="1" stop-color="#062222"/></linearGradient>
</defs>
<rect width="840" height="700" fill="#e8eeec"/>
<path d="M0 0 L340 200 L340 380 L0 520 Z" fill="url(#w)" stroke="#000" stroke-width="4"/>
<path d="M840 0 L500 200 L500 380 L840 520 Z" fill="#dfe6e4" stroke="#000" stroke-width="4"/>
<path d="M0 0 L840 0 L500 200 L340 200 Z" fill="#ffffff" stroke="#000" stroke-width="4"/>
{''.join(f'<rect x="{390-i*0}" y="{30+i*45}" width="60" height="8" fill="#fffbe6" opacity="{0.9-i*0.2}"/>' for i in range(4))}
<rect x="340" y="200" width="160" height="180" fill="#cfd7d5" stroke="#000" stroke-width="4"/>
<rect x="372" y="236" width="96" height="144" fill="#9aa6a4" stroke="#000" stroke-width="4"/><line x1="420" y1="236" x2="420" y2="380" stroke="#000" stroke-width="3"/>
<circle cx="490" cy="300" r="5" fill="#ffb300"/>
<path d="M0 520 L340 380 L500 380 L840 520 L840 700 L0 700 Z" fill="url(#fl)" stroke="#000" stroke-width="4"/>
{''.join(f'<line x1="{340+i*32}" y1="380" x2="{i*168}" y2="700" stroke="#1f4f43" stroke-width="2"/>' for i in range(6))}
<!-- scrivania -->
<path d="M150 560 L690 560 L740 640 L100 640 Z" fill="#e9e3d2" stroke="#000" stroke-width="5"/>
<rect x="100" y="640" width="640" height="24" fill="#c9c1ac" stroke="#000" stroke-width="4"/>
<g transform="translate(300 420)">
<rect x="0" y="0" width="240" height="150" rx="16" fill="#e6e2d4" stroke="#000" stroke-width="5"/>
<rect x="18" y="16" width="204" height="112" rx="8" fill="url(#scr)" stroke="#000" stroke-width="3"/>
<g transform="translate(8 8) scale(.92)">{cells}</g>
<rect x="90" y="150" width="60" height="16" fill="#cfcabb" stroke="#000" stroke-width="3"/>
</g>
<rect x="250" y="590" width="300" height="34" rx="6" fill="#d8d3c4" stroke="#000" stroke-width="3"/>
<!-- badge diviso -->
<g transform="translate(640 590) rotate(-10)">
<rect x="-50" y="-34" width="50" height="68" rx="6" fill="{TEAL}" stroke="#000" stroke-width="4"/>
<rect x="0" y="-34" width="50" height="68" rx="6" fill="{BLU}" stroke="#000" stroke-width="4"/>
<rect x="-14" y="-44" width="28" height="12" rx="4" fill="#ddd" stroke="#000" stroke-width="3"/>
<line x1="0" y1="-34" x2="0" y2="34" stroke="#fff" stroke-width="3" stroke-dasharray="6 5"/>
</g>
</svg>'''
p=dict(bg=BG, ink=INK, accent=TEAL, bgcss=f'background:radial-gradient(ellipse at 50% 40%, #12302f 0%, {BG} 65%, #020505 100%);',
 bulbs=['#EAFBF7','#EAFBF7',TEAL], glow=0.5,
 frame_css=f'4px solid {TEAL}', frame_extra=f'outline:2px solid {BLU}66; outline-offset:12px;',
 badge='💡 SPIEGATO FACILE', badge_bg='#FFC400', badge_ink='#141414', svg=svg, ill_border=f'6px solid {INK}',
 ctx='Un ufficio senza finestre',
 title=['SCISSIONE'], title_css=f"font-family:Oswald;font-weight:700;font-size:150px;letter-spacing:14px;margin-right:-14px;color:{INK};text-shadow:6px 6px 0 {TEAL};",
 sub='STAGIONE 1',
 teaser='Al lavoro non ricordi la tua vita.<br>Fuori non ricordi il tuo lavoro.',
 date='SABATO 21 NOVEMBRE · ORE 17:30', date_col='#FFC400', cred='Una stagione intera spiegata facile in 2 minuti · Prima visione')
open('/tmp/claude-0/storie/scissione.html','w').write(page(p))
