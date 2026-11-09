import sys, math; sys.path.insert(0,'/tmp/claude-0/storie/gen'); from base import *
INK='#E9EEF2'; NIGHT='#0E1620'; RED='#C8102E'
snow=''.join(f'<circle cx="{(i*97)%840}" cy="{(i*61)%300}" r="{1.5+(i%3)}" fill="#cfe3f5" opacity=".55"/>' for i in range(40))
svg=f'''<svg width="828" height="688" viewBox="0 0 840 700" role="img" aria-label="Cameretta di notte con una tenda di lenzuola illuminata da una torcia, il fiato che si condensa nel freddo e una porta rossa socchiusa">
<defs>
<linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b2a3a"/><stop offset="1" stop-color="#0d151f"/></linearGradient>
<radialGradient id="tent" cx=".5" cy=".6" r=".6"><stop offset="0" stop-color="#fff2c8"/><stop offset=".55" stop-color="#e9c77a"/><stop offset="1" stop-color="#7a6038"/></radialGradient>
<radialGradient id="lamp" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffe9a8" stop-opacity=".55"/><stop offset="1" stop-color="#ffe9a8" stop-opacity="0"/></radialGradient>
<linearGradient id="win" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b2236"/><stop offset="1" stop-color="#1d3b55"/></linearGradient>
</defs>
<rect width="840" height="700" fill="url(#wall)"/>
<!-- carta da parati a righe -->
{''.join(f'<rect x="{x}" y="0" width="14" height="520" fill="#ffffff07"/>' for x in range(0,840,56))}
<!-- finestra con la neve -->
<rect x="70" y="70" width="230" height="270" fill="url(#win)" stroke="{INK}" stroke-width="6"/>
<g clip-path="inset(0)"><svg x="73" y="73" width="224" height="264" viewBox="0 0 224 264">{snow}<circle cx="170" cy="60" r="26" fill="#dfe9f2" opacity=".85"/></svg></g>
<line x1="185" y1="70" x2="185" y2="340" stroke="{INK}" stroke-width="5"/><line x1="70" y1="205" x2="300" y2="205" stroke="{INK}" stroke-width="5"/>
<path d="M60 60 Q90 200 70 350 L40 350 L40 60 Z" fill="#3b4f63" stroke="#000" stroke-width="3"/>
<path d="M310 60 Q280 200 300 350 L330 350 L330 60 Z" fill="#3b4f63" stroke="#000" stroke-width="3"/>
<rect x="40" y="48" width="290" height="14" rx="6" fill="#59442c" stroke="#000" stroke-width="3"/>
<!-- porta rossa socchiusa -->
<rect x="620" y="110" width="170" height="410" fill="#0a0f15" stroke="{INK}" stroke-width="6"/>
<path d="M626 116 L740 140 L740 500 L626 514 Z" fill="{RED}" stroke="#000" stroke-width="4"/>
<path d="M640 150 L725 165 L725 300 L640 290 Z" fill="none" stroke="#00000055" stroke-width="4"/>
<path d="M640 330 L725 335 L725 470 L640 480 Z" fill="none" stroke="#00000055" stroke-width="4"/>
<circle cx="728" cy="330" r="9" fill="#d9b25a" stroke="#000" stroke-width="3"/>
<path d="M741 140 L788 116 L788 516 L741 500 Z" fill="#ffd98a" opacity=".18"/>
<!-- pavimento -->
<rect x="0" y="520" width="840" height="180" fill="#2a2018"/>
{''.join(f'<line x1="0" y1="{y}" x2="840" y2="{y}" stroke="#00000055" stroke-width="3"/>' for y in (560,610,665))}
<!-- tenda di lenzuola con la torcia -->
<ellipse cx="400" cy="600" rx="260" ry="40" fill="url(#lamp)"/>
<path d="M210 600 L330 360 L470 360 L600 600 Z" fill="url(#tent)" stroke="{INK}" stroke-width="5" stroke-linejoin="round"/>
<path d="M330 360 Q345 470 300 600" stroke="#9b7f50" stroke-width="3" fill="none"/>
<path d="M470 360 Q455 470 500 600" stroke="#9b7f50" stroke-width="3" fill="none"/>
<path d="M330 360 Q400 380 470 360" stroke="#9b7f50" stroke-width="3" fill="none"/>
<rect x="318" y="350" width="10" height="250" fill="#6b4a2a" stroke="#000" stroke-width="2"/>
<rect x="472" y="350" width="10" height="250" fill="#6b4a2a" stroke="#000" stroke-width="2"/>
<!-- motivi del lenzuolo -->
{''.join(f'<circle cx="{x}" cy="{y}" r="6" fill="#c9a25f" opacity=".7"/>' for x,y in [(300,520),(360,450),(420,540),(470,470),(520,560),(380,580),(440,410),(260,575)])}
<!-- torcia dentro: fascio -->
<path d="M400 560 L345 430 L455 430 Z" fill="#fff8dc" opacity=".55"/>
<!-- fiato che si condensa (freddo) -->
<g fill="none" stroke="#dfeaf3" stroke-width="5" stroke-linecap="round" opacity=".85">
<path d="M520 430 q22 -14 40 0 q18 14 36 0"/><path d="M540 395 q20 -12 36 0 q16 12 32 0"/><path d="M560 360 q16 -10 30 0 q14 10 28 0"/>
</g>
<!-- termometro: freddo -->
<g transform="translate(120 400)"><rect x="-12" y="0" width="24" height="120" rx="12" fill="#ffffff22" stroke="{INK}" stroke-width="4"/><circle cx="0" cy="130" r="20" fill="#7fc4ff" stroke="{INK}" stroke-width="4"/><rect x="-5" y="90" width="10" height="40" fill="#7fc4ff"/></g>
<text x="120" y="585" text-anchor="middle" font-family="Figtree" font-weight="800" font-size="22" fill="#9fd2ff">2 °C</text>
</svg>'''
p=dict(bg=NIGHT, ink=INK, accent='#9FB3C6', bgcss=f'background:radial-gradient(ellipse at 50% 35%, #1d2c3b 0%, {NIGHT} 65%, #05090e 100%);',
 bulbs=['#F3F1EA','#F3F1EA',RED], glow=0.35, bulb_r=8,
 frame_css=f'2px solid #9FB3C6', frame_extra='outline:1px solid #9FB3C655; outline-offset:12px;',
 badge='🎬 FILM IN 2 MINUTI', badge_bg='#FFC400', badge_ink='#141414', svg=svg, ill_border=f'6px solid {INK}',
 ctx='Filadelfia, 1999', ctx_font="Cinzel",
 title=['IL SESTO SENSO'], title_css=f"font-family:Cinzel;font-weight:900;font-size:118px;letter-spacing:6px;color:{INK};text-shadow:0 0 18px #9fd2ff55,0 5px 0 #000;",
 teaser='Un bambino ha un segreto che non dice a nessuno.<br>Solo uno psicologo prova ad ascoltarlo.',
 date='MARTEDÌ 10 NOVEMBRE · ORE 17:30', date_col='#FFC400', cred='Un film intero in soli 2 minuti · Prima visione')
open('/tmp/claude-0/storie/sestosenso.html','w').write(page(p))
