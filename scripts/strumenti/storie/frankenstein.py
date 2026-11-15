import sys, math; sys.path.insert(0,'/tmp/claude-0/storie/gen'); from base import *
# Frankenstein Junior: castello in Transilvania nella tempesta, laboratorio con il tavolo sollevato verso il lucernario,
# fulmine, bobine elettriche e un candelabro. Niente personaggi.
INK='#ECE8DF'; BG='#0B0D10'; MINT='#8EF0C8'; GREY='#5E6B75'
rain=''.join(f'<line x1="{(i*53)%840}" y1="{(i*37)%420}" x2="{(i*53)%840-10}" y2="{(i*37)%420+30}" stroke="#9fb3c4" stroke-width="2" opacity=".35"/>' for i in range(90))
bolt='M330 0 L300 90 L340 90 L290 210 L360 110 L320 110 L360 0 Z'
coil=lambda x: f'''<g transform="translate({x} 470)"><rect x="-26" y="40" width="52" height="60" fill="#3a3f45" stroke="#000" stroke-width="4"/>
{''.join(f'<ellipse cx="0" cy="{40-k*12}" rx="22" ry="6" fill="#b5793a" stroke="#000" stroke-width="3"/>' for k in range(8))}
<circle cx="0" cy="-62" r="18" fill="#c9ced4" stroke="#000" stroke-width="4"/></g>'''
arc='<path d="M190 408 Q230 380 260 412 Q300 440 330 400 Q370 370 410 410 Q450 440 490 404 Q530 380 560 410 Q600 440 650 408" stroke="'+MINT+'" stroke-width="5" fill="none" filter="url(#gl)"/>'
svg=f'''<svg width="828" height="688" viewBox="0 0 840 700" role="img" aria-label="Laboratorio in pietra di un castello nella tempesta: un fulmine nel lucernario, un tavolo operatorio vuoto sollevato con le catene, due bobine elettriche unite da un arco verde, un candelabro acceso">
<defs><linearGradient id="w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a3138"/><stop offset="1" stop-color="#14181c"/></linearGradient>
<radialGradient id="sk" cx=".5" cy=".3" r=".7"><stop offset="0" stop-color="#cfe9ff"/><stop offset=".4" stop-color="#4b6378"/><stop offset="1" stop-color="#151b22"/></radialGradient>
<radialGradient id="cn" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffd27a" stop-opacity=".7"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>
<filter id="gl"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
<rect width="840" height="700" fill="url(#w)"/>
{''.join(f'<rect x="{(c*120+(60 if r%2 else 0))%900-60}" y="{r*56}" width="118" height="54" fill="none" stroke="#0a0c0e" stroke-width="3"/>' for r in range(13) for c in range(8))}
<!-- lucernario con la tempesta -->
<path d="M250 40 L590 40 L540 230 L300 230 Z" fill="url(#sk)" stroke="#000" stroke-width="6"/>
<g clip-path="none">{rain}</g>
<path d="{bolt}" transform="translate(110 40) scale(.9)" fill="#f5fbff" stroke="#000" stroke-width="3" filter="url(#gl)"/>
<line x1="420" y1="40" x2="420" y2="230" stroke="#000" stroke-width="6"/><line x1="275" y1="135" x2="565" y2="135" stroke="#000" stroke-width="6"/>
<!-- tavolo sollevato con le catene -->
<line x1="320" y1="230" x2="330" y2="330" stroke="#1c1c1c" stroke-width="6" stroke-dasharray="10 6"/><line x1="520" y1="230" x2="510" y2="330" stroke="#1c1c1c" stroke-width="6" stroke-dasharray="10 6"/>
<g transform="translate(420 345) rotate(-6)"><rect x="-150" y="-18" width="300" height="36" rx="6" fill="{GREY}" stroke="#000" stroke-width="5"/>
<rect x="-140" y="-30" width="280" height="14" rx="4" fill="#d9d4c7" stroke="#000" stroke-width="3"/>
{''.join(f'<circle cx="{-120+k*60}" cy="0" r="5" fill="#c9ced4" stroke="#000" stroke-width="2"/>' for k in range(5))}</g>
{arc}{coil(160)}{coil(680)}
<!-- pavimento -->
<rect y="570" width="840" height="130" fill="#1a1d21"/>{''.join(f'<line x1="{k*120-40}" y1="570" x2="{k*160-200}" y2="700" stroke="#0a0c0e" stroke-width="3"/>' for k in range(9))}
<!-- leve e quadro comandi -->
<g transform="translate(330 490)"><rect width="180" height="80" fill="#3a3f45" stroke="#000" stroke-width="4"/>
{''.join(f'<circle cx="{30+k*40}" cy="24" r="10" fill="{MINT if k%2 else "#e05a3a"}" stroke="#000" stroke-width="3"/>' for k in range(4))}
<line x1="90" y1="60" x2="120" y2="20" stroke="#000" stroke-width="8" stroke-linecap="round"/><circle cx="120" cy="20" r="10" fill="#e05a3a" stroke="#000" stroke-width="3"/></g>
<!-- candelabro -->
<g transform="translate(90 640)"><ellipse cx="0" cy="-130" rx="80" ry="60" fill="url(#cn)"/>
<rect x="-6" y="-90" width="12" height="90" fill="#b58a3a" stroke="#000" stroke-width="3"/><path d="M-50 -90 Q0 -60 50 -90" stroke="#b58a3a" stroke-width="10" fill="none"/>
{''.join(f'<rect x="{x-6}" y="-128" width="12" height="36" fill="#f2ecd9" stroke="#000" stroke-width="3"/><path d="M{x} -146 Q{x+8} -136 {x} -128 Q{x-8} -136 {x} -146" fill="#ffcf5a"/>' for x in (-50,0,50))}</g>
</svg>'''
p=dict(bg=BG, ink=INK, accent=MINT, bgcss=f'background:radial-gradient(ellipse at 50% 35%, #26313a 0%, {BG} 65%, #030405 100%);',
 bulbs=[MINT,'#FFE3A6',MINT], glow=0.55,
 frame_css=f'4px solid {INK}', frame_extra=f'outline:2px solid {MINT}66; outline-offset:12px;',
 badge='🎬 FILM IN 2 MINUTI', badge_bg='#FFC400', badge_ink='#141414', svg=svg, ill_border=f'6px solid {INK}',
 ctx='Transilvania, una notte di tempesta', ctx_font="Figtree",
 title=['FRANKENSTEIN', 'JUNIOR'], title_css=f"font-family:'Bungee';font-size:110px;letter-spacing:4px;color:{INK};text-shadow:5px 5px 0 #000, 0 0 16px {MINT}88;",
 teaser="Giura di non essere come il nonno.<br>Poi trova il suo laboratorio.",
 date='MARTEDÌ 17 NOVEMBRE · ORE 17:30', date_col='#FFC400', cred='Un film intero in soli 2 minuti · Prima visione')
open('/tmp/claude-0/storie/frankenstein.html','w').write(page(p))
