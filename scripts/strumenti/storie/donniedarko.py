import sys, math; sys.path.insert(0,'/tmp/claude-0/storie/gen'); from base import *
INK='#EDE6FA'; BG='#0C0818'; VIO='#7A5CFF'; AMB='#FFB347'
stars=''.join(f'<circle cx="{(i*89)%840}" cy="{(i*41)%330}" r="{0.8+(i%3)*0.6}" fill="#fff" opacity="{0.3+(i%3)*0.2}"/>' for i in range(110))
win=lambda x,y,on: f'<rect x="{x}" y="{y}" width="46" height="54" fill="{"#ffcf7a" if on else "#1d1830"}" stroke="#000" stroke-width="4"/><line x1="{x+23}" y1="{y}" x2="{x+23}" y2="{y+54}" stroke="#000" stroke-width="3"/>'
debris=''.join(f'<rect x="{430+(i*37)%180}" y="{120+(i*23)%120}" width="{8+i%5*3}" height="{6+i%4*3}" fill="#5a4a3a" stroke="#000" stroke-width="2" transform="rotate({i*31} {430+(i*37)%180} {120+(i*23)%120})"/>' for i in range(14))
svg=f'''<svg width="828" height="688" viewBox="0 0 840 700" role="img" aria-label="Notte viola in un quartiere di villette: una casa a due piani con il tetto sfondato da un enorme motore d'aereo, calcinacci che volano, e in primo piano una sveglia e un foglio con un conto alla rovescia">
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0620"/><stop offset=".8" stop-color="#3a2470"/><stop offset="1" stop-color="#5a3a8a"/></linearGradient>
<linearGradient id="eng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8d8e2"/><stop offset="1" stop-color="#7c7c8e"/></linearGradient>
<radialGradient id="glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="{AMB}" stop-opacity=".5"/><stop offset="1" stop-color="{AMB}" stop-opacity="0"/></radialGradient>
</defs>
<rect width="840" height="700" fill="url(#sky)"/>{stars}
<circle cx="140" cy="110" r="46" fill="#f2ecff"/>
<!-- alberi -->
{''.join(f'<ellipse cx="{x}" cy="{y}" rx="{r}" ry="{r*1.2}" fill="#1a1236" stroke="#000" stroke-width="3"/>' for x,y,r in [(70,430,70),(780,420,80),(720,460,50)])}
<!-- casa -->
<rect x="190" y="300" width="460" height="260" fill="#cfc4b0" stroke="#000" stroke-width="5"/>
{''.join(f'<line x1="190" y1="{310+k*18}" x2="650" y2="{310+k*18}" stroke="#a89c86" stroke-width="2"/>' for k in range(14))}
<path d="M170 304 L420 190 L670 304 Z" fill="#3b2f45" stroke="#000" stroke-width="5"/>
<!-- buco nel tetto -->
<path d="M440 210 L520 236 L560 280 L500 300 L440 284 L420 240 Z" fill="#120c1e" stroke="#000" stroke-width="4"/>
<ellipse cx="490" cy="260" rx="120" ry="90" fill="url(#glow)"/>
{win(230,340,True)}{win(320,340,False)}{win(560,340,True)}{win(230,450,True)}{win(560,450,False)}
<rect x="395" y="450" width="54" height="110" fill="#5a2f22" stroke="#000" stroke-width="4"/><circle cx="438" cy="508" r="4" fill="#ffcf7a"/>
<!-- motore -->
<g transform="translate(500 215) rotate(28)">
<rect x="-62" y="-150" width="124" height="190" rx="40" fill="url(#eng)" stroke="#000" stroke-width="5"/>
<ellipse cx="0" cy="-150" rx="62" ry="22" fill="#2b2b36" stroke="#000" stroke-width="5"/>
{''.join(f'<line x1="0" y1="-150" x2="{55*math.cos(math.radians(a)):.1f}" y2="{-150+19*math.sin(math.radians(a)):.1f}" stroke="#9a9aac" stroke-width="3"/>' for a in range(0,360,30))}
<rect x="-62" y="-60" width="124" height="10" fill="#5c5c70"/>
</g>
{debris}
<rect y="560" width="840" height="140" fill="#1c3a2a"/>
<path d="M380 700 L410 560 L440 560 L470 700 Z" fill="#8c8478"/>
<!-- sveglia e foglio -->
<g transform="translate(150 620)"><circle r="44" fill="#d9372e" stroke="#000" stroke-width="5"/><circle r="34" fill="#f8f2e4" stroke="#000" stroke-width="3"/>
<line x1="0" y1="0" x2="0" y2="-24" stroke="#000" stroke-width="5"/><line x1="0" y1="0" x2="18" y2="6" stroke="#000" stroke-width="4"/>
<circle cx="-30" cy="-40" r="12" fill="#d9372e" stroke="#000" stroke-width="4"/><circle cx="30" cy="-40" r="12" fill="#d9372e" stroke="#000" stroke-width="4"/></g>
<g transform="translate(640 625) rotate(-6)"><rect x="-110" y="-40" width="220" height="80" fill="#f4efe2" stroke="#000" stroke-width="4"/>
<text x="0" y="12" text-anchor="middle" font-family="Special Elite" font-size="34" fill="#2a1d40">28:06:42:12</text></g>
</svg>'''
p=dict(bg=BG, ink=INK, accent=AMB, bgcss=f'background:radial-gradient(ellipse at 50% 40%, #2a1a55 0%, {BG} 65%, #030208 100%);',
 bulbs=[VIO,'#FFE3A6',VIO], glow=0.6,
 frame_css=f'4px solid {VIO}', frame_extra=f'outline:2px solid {AMB}66; outline-offset:12px;',
 badge='💡 SPIEGATO FACILE', badge_bg='#FFC400', badge_ink='#141414', svg=svg, ill_border=f'6px solid {INK}',
 ctx='Virginia, ottobre 1988', ctx_font="'Special Elite'",
 title=['DONNIE DARKO'], title_css=f"font-family:'Bebas Neue';font-size:170px;letter-spacing:8px;color:{INK};text-shadow:6px 6px 0 {VIO};",
 teaser="Un motore d'aereo cade sulla sua camera.<br>Ma nessun aereo ne ha perso uno.",
 date='GIOVEDÌ 19 NOVEMBRE · ORE 17:30', date_col='#FFC400', cred='Un film complicato spiegato facile in 2 minuti · Prima visione')
open('/tmp/claude-0/storie/donniedarko.html','w').write(page(p))
