import sys, math; sys.path.insert(0,'/tmp/claude-0/storie/gen'); from base import *
INK='#F4EFE3'; BG='#06101F'; GOLD='#D9B36A'; ICE='#DDF1FA'
stars=''.join(f'<circle cx="{(i*97)%840}" cy="{(i*53)%300}" r="{0.8+(i%4)*0.6}" fill="#fff" opacity="{0.35+(i%3)*0.2}"/>' for i in range(140))
port=lambda x,y: f'<circle cx="{x}" cy="{y}" r="4" fill="#ffd98a"/>'
ports=''.join(port(150+i*17,385) for i in range(28))+''.join(port(170+i*17,405) for i in range(25))
decks=''.join(f'<rect x="{230+i*18}" y="338" width="10" height="12" fill="#ffe2a0" opacity="{0.6+(i%3)*0.15}"/>' for i in range(22))
funnel=lambda x: f'<g transform="translate({x} 0)"><path d="M0 330 L8 240 L48 240 L56 330 Z" fill="#d27a2c" stroke="#000" stroke-width="4"/><path d="M8 240 L48 240 L46 262 L10 262 Z" fill="#141414" stroke="#000" stroke-width="3"/></g>'
smoke=''.join(f'<circle cx="{x+20+k*24}" cy="{228-k*22}" r="{16+k*6}" fill="#4b5568" opacity="{0.45-k*0.09}"/>' for x in (240,320,400) for k in range(4))
refl=''.join(f'<rect x="{150+i*17}" y="{455+(i%4)*14}" width="8" height="3" fill="#ffd98a" opacity=".45"/>' for i in range(28))
waves=''.join(f'<path d="M{(i*59)%840} {470+(i*29)%230} q12 -6 24 0" stroke="#7fa6c9" stroke-width="2" fill="none" opacity=".5"/>' for i in range(60))
svg=f'''<svg width="828" height="688" viewBox="0 0 840 700" role="img" aria-label="Di notte, su un oceano calmo sotto le stelle, un grande transatlantico con quattro fumaioli tutto illuminato e, davanti, la punta bianca di un iceberg">
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#030812"/><stop offset=".75" stop-color="#0f2342"/><stop offset="1" stop-color="#1d3a5f"/></linearGradient>
<linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1b33"/><stop offset="1" stop-color="#02060d"/></linearGradient>
<linearGradient id="ice" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="{ICE}"/><stop offset="1" stop-color="#8fb9cf"/></linearGradient>
</defs>
<rect width="840" height="700" fill="url(#sky)"/>{stars}
<rect y="440" width="840" height="260" fill="url(#sea)"/>{waves}
{smoke}
<!-- nave -->
<g>{funnel(230)}{funnel(310)}{funnel(390)}{funnel(470)}
<line x1="170" y1="250" x2="170" y2="350" stroke="#ccc" stroke-width="3"/><line x1="600" y1="250" x2="600" y2="350" stroke="#ccc" stroke-width="3"/>
<line x1="170" y1="252" x2="600" y2="252" stroke="#999" stroke-width="1.5"/>
<rect x="200" y="330" width="380" height="24" fill="#f1ece0" stroke="#000" stroke-width="4"/>{decks}
<path d="M110 354 L650 354 L620 440 L150 440 Z" fill="#111" stroke="#000" stroke-width="5"/>
<path d="M118 372 L642 372" stroke="#f1ece0" stroke-width="6"/>
<path d="M150 430 L620 430 L620 440 L150 440 Z" fill="#8a1f1f"/>
{ports}</g>
{refl}
<!-- iceberg -->
<path d="M560 700 L600 520 L640 470 L668 500 L700 440 L742 520 L780 560 L820 700 Z" fill="url(#ice)" stroke="#000" stroke-width="5"/>
<path d="M640 470 L655 560 L620 700 M700 440 L710 540 L690 700" stroke="#9cc4d8" stroke-width="4" fill="none"/>
<path d="M550 560 Q690 545 830 562" stroke="#cfe6f2" stroke-width="3" fill="none" opacity=".7"/>
</svg>'''
p=dict(bg=BG, ink=INK, accent=GOLD, bgcss=f'background:radial-gradient(ellipse at 50% 40%, #12284a 0%, {BG} 65%, #010409 100%);',
 bulbs=['#FFE3A6','#FFE3A6',GOLD], glow=0.55,
 frame_css=f'5px double {GOLD}', frame_extra=f'outline:2px solid {GOLD}66; outline-offset:12px;',
 badge='🎬 FILM IN 2 MINUTI', badge_bg='#FFC400', badge_ink='#141414', svg=svg, ill_border=f'6px solid {GOLD}',
 ctx='Oceano Atlantico, aprile 1912', ctx_font="'Playfair Display'",
 title=['TITANIC'], title_css=f"font-family:'Playfair Display';font-weight:900;font-size:150px;letter-spacing:14px;margin-right:-14px;color:{INK};text-shadow:0 6px 0 #000,0 0 26px {GOLD}55;",
 teaser='Una nave che tutti dicono inaffondabile.<br>E un amore nato nel viaggio sbagliato.',
 date='LUNEDÌ 16 NOVEMBRE · ORE 17:30', date_col='#FFC400', cred='Un film intero in soli 2 minuti · Prima visione')
open('/tmp/claude-0/storie/titanic.html','w').write(page(p))
