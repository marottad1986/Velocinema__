import sys, math; sys.path.insert(0,'/tmp/claude-0/storie/gen'); from base import *
INK='#F7EBD3'; BG='#1C0A26'; GOLD='#E8B44A'; PUR='#6A2C91'; RED='#9E1B32'
curt=lambda x,flip: ''.join(f'<path d="M{x+(i*26 if not flip else -i*26)} 0 Q{x+(i*26+14 if not flip else -i*26-14)} 300 {x+(i*26+ (40 if not flip else -40) if i>4 else (i*26 if not flip else -i*26))} 600" stroke="#5c0f1f" stroke-width="18" fill="none"/>' for i in range(8))
boxes=''.join(f'<g transform="translate({x} {y})"><path d="M-46 0 L46 0 L40 46 L-40 46 Z" fill="#4a1d63" stroke="{GOLD}" stroke-width="4"/><path d="M-46 0 Q0 -36 46 0" fill="#2a0f39" stroke="{GOLD}" stroke-width="4"/><circle cx="0" cy="-12" r="6" fill="#ffd27a"/></g>' for x,y in [(160,150),(160,250),(680,150),(680,250)])
notes=''.join(f'<g transform="translate({x} {y}) rotate({r})" fill="{GOLD}"><ellipse cx="0" cy="0" rx="12" ry="9"/><rect x="10" y="-44" width="4" height="44"/><path d="M14 -44 Q30 -36 26 -20" stroke="{GOLD}" stroke-width="4" fill="none"/></g>' for x,y,r in [(300,120,-10),(360,90,8),(520,110,-6),(470,70,12),(580,160,-12),(260,190,10)])
svg=f'''<svg width="828" height="688" viewBox="0 0 840 700" role="img" aria-label="Un teatro dell'opera con sipario rosso e palchi dorati; sul palco un pianoforte a coda, un gong e una chitarra elettrica appoggiata, con note musicali e un fulmine">
<defs>
<radialGradient id="spot" cx=".5" cy=".55" r=".55"><stop offset="0" stop-color="#ffe2a0" stop-opacity=".55"/><stop offset="1" stop-color="#ffe2a0" stop-opacity="0"/></radialGradient>
<linearGradient id="curt" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#8e1a2f"/><stop offset="1" stop-color="#5c0f1f"/></linearGradient>
</defs>
<rect width="840" height="700" fill="#14061c"/>
<rect x="0" y="0" width="840" height="600" fill="url(#spot)"/>
{boxes}
<!-- sipario -->
<path d="M0 0 L200 0 Q170 300 230 600 L0 600 Z" fill="url(#curt)" stroke="#000" stroke-width="4"/>
<path d="M840 0 L640 0 Q670 300 610 600 L840 600 Z" fill="url(#curt)" stroke="#000" stroke-width="4"/>
{''.join(f'<path d="M{20+i*36} 0 Q{10+i*36} 300 {30+i*40} 600" stroke="#00000044" stroke-width="5" fill="none"/>' for i in range(5))}
{''.join(f'<path d="M{820-i*36} 0 Q{830-i*36} 300 {810-i*40} 600" stroke="#00000044" stroke-width="5" fill="none"/>' for i in range(5))}
<path d="M0 0 L840 0 L840 50 Q630 90 420 60 Q210 90 0 50 Z" fill="#7a1428" stroke="{GOLD}" stroke-width="5"/>
{''.join(f'<circle cx="{40+i*80}" cy="{62 if i%2 else 72}" r="8" fill="{GOLD}"/>' for i in range(11))}
<!-- fulmine -->
<path d="M430 120 L400 200 L430 200 L395 290 L470 180 L438 180 L465 120 Z" fill="#ffe27a" stroke="#000" stroke-width="4"/>
{notes}
<!-- palco -->
<path d="M0 600 L840 600 L840 700 L0 700 Z" fill="#3a1f12"/>
<path d="M60 520 L780 520 L840 600 L0 600 Z" fill="#6b3d22" stroke="#000" stroke-width="4"/>
{''.join(f'<line x1="{60+i*90}" y1="520" x2="{i*105}" y2="600" stroke="#00000044" stroke-width="3"/>' for i in range(9))}
<!-- gong -->
<g transform="translate(240 410)"><rect x="-86" y="-110" width="10" height="210" fill="#2a1a0e" stroke="#000" stroke-width="3"/><rect x="76" y="-110" width="10" height="210" fill="#2a1a0e" stroke="#000" stroke-width="3"/><rect x="-92" y="-118" width="184" height="14" fill="#2a1a0e" stroke="#000" stroke-width="3"/>
<circle cx="0" cy="-10" r="70" fill="#c9952f" stroke="#000" stroke-width="4"/><circle cx="0" cy="-10" r="50" fill="none" stroke="#a87920" stroke-width="5"/><circle cx="0" cy="-10" r="18" fill="#e3b54d"/></g>
<!-- pianoforte a coda -->
<g transform="translate(520 430)">
<path d="M-120 0 L120 0 Q200 0 200 -60 Q200 -110 130 -110 L-10 -110 Q-60 -110 -90 -70 L-120 -40 Z" fill="#111" stroke="#000" stroke-width="4"/>
<path d="M-110 -40 L60 -190 L74 -178 L-90 -30 Z" fill="#1d1d1d" stroke="#000" stroke-width="3"/>
<rect x="-130" y="0" width="200" height="20" fill="#f2efe6" stroke="#000" stroke-width="3"/>
{''.join(f'<rect x="{-122+i*14}" y="0" width="8" height="12" fill="#111"/>' for i in range(14) if i%7 not in (2,6))}
<rect x="-118" y="20" width="10" height="70" fill="#111"/><rect x="150" y="-20" width="10" height="110" fill="#111"/><rect x="40" y="20" width="10" height="70" fill="#111"/>
</g>
<!-- chitarra elettrica -->
<g transform="translate(700 470) rotate(-18)"><path d="M-30 30 Q-60 0 -40 -30 Q-20 -50 0 -30 Q20 -50 40 -30 Q60 0 30 30 Q0 50 -30 30 Z" fill="{RED}" stroke="#000" stroke-width="4"/><rect x="-5" y="-170" width="10" height="150" fill="#8a5a2b" stroke="#000" stroke-width="3"/><rect x="-10" y="-195" width="20" height="30" rx="4" fill="#222" stroke="#000" stroke-width="3"/><rect x="-18" y="-6" width="36" height="8" fill="#ddd"/></g>
</svg>'''
p=dict(bg=BG, ink=INK, accent=GOLD, bgcss=f'background:radial-gradient(ellipse at 50% 40%, #3a1250 0%, {BG} 65%, #07020a 100%);',
 bulbs=[GOLD,'#FFF1C9',GOLD,'#D86AFF'], glow=0.6,
 frame_css=f'5px double {GOLD}', frame_extra=f'outline:2px solid {GOLD}66; outline-offset:12px;',
 badge='🎵 CANZONI IN 2 MINUTI', badge_bg='#FFC400', badge_ink='#141414', svg=svg, ill_border=f'6px solid {GOLD}',
 ctx='Londra, 1975', ctx_font="'Playfair Display'",
 title=['BOHEMIAN','RHAPSODY'], title_css=f"font-family:'Abril Fatface';font-size:104px;letter-spacing:4px;color:{INK};text-shadow:0 5px 0 {PUR};",
 teaser='Sei minuti, niente ritornello e un pezzo d\'opera.<br>Com\'è nata la canzone più strana del rock?',
 date='SABATO 14 NOVEMBRE · ORE 10:00', date_col='#FFC400', cred='Una canzone leggendaria spiegata in 2 minuti · Prima visione')
open('/tmp/claude-0/storie/bohemian.html','w').write(page(p))
