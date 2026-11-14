import sys, math; sys.path.insert(0,'/tmp/claude-0/storie/gen'); from base import *
INK='#F4E7D2'; BG='#140A06'; EMB='#F07A28'; BRZ='#C98A3A'
embers=''.join(f'<circle cx="{(i*79)%840}" cy="{(i*43)%640}" r="{1.5+(i%3)}" fill="{["#ffb347","#ff7a2a","#ffd27a"][i%3]}" opacity=".85"/>' for i in range(70))
trees=''.join(f'<path d="M{x} 470 L{x+w/2} {h} L{x+w} 470 Z" fill="#132017" stroke="#000" stroke-width="3"/>' for x,w,h in [(-30,140,180),(80,120,220),(180,110,260),(560,120,240),(660,130,200),(760,120,240)])
pods=''.join(f'<g transform="translate({420+300*math.cos(math.radians(a)):.0f} {560+70*math.sin(math.radians(a)):.0f})"><ellipse rx="26" ry="9" fill="#8d97a3" stroke="#000" stroke-width="3"/><rect x="-14" y="-8" width="28" height="8" fill="#b7c0ca"/></g>' for a in range(0,360,30))
svg=f'''<svg width="828" height="688" viewBox="0 0 840 700" role="img" aria-label="Un'arena nel bosco al tramonto: al centro un grande corno di metallo pieno di zaini e provviste, intorno un cerchio di pedane di partenza, scintille nel cielo e un arco appoggiato a terra">
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a0d07"/><stop offset=".6" stop-color="#7a2a10"/><stop offset="1" stop-color="#d0632a"/></linearGradient>
<linearGradient id="metal" x1="0" x2="1"><stop offset="0" stop-color="#e9d7a6"/><stop offset=".5" stop-color="{BRZ}"/><stop offset="1" stop-color="#6b4317"/></linearGradient>
<radialGradient id="sun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffd27a"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>
</defs>
<rect width="840" height="700" fill="url(#sky)"/>
<circle cx="420" cy="430" r="200" fill="url(#sun)" opacity=".7"/>
{trees}
<path d="M0 470 L840 470 L840 700 L0 700 Z" fill="#3a2514"/>
<ellipse cx="420" cy="560" rx="360" ry="96" fill="#5a3a1f" stroke="#000" stroke-width="4"/>
{pods}
<!-- corno -->
<g transform="translate(450 520)">
<path d="M-150 -112 Q40 -150 170 -175 Q215 -180 225 -150 Q232 -120 200 -110 Q190 -132 172 -128 Q120 -60 -150 30 Z" fill="url(#metal)" stroke="#000" stroke-width="5" stroke-linejoin="round"/>
{''.join(f'<path d="M{-110+i*55} {-118-i*9} Q{-90+i*50} {-40-i*12} {-110+i*58} {16-i*22}" fill="none" stroke="#00000055" stroke-width="5"/>' for i in range(5))}
<ellipse cx="-150" cy="-41" rx="46" ry="72" fill="#c9a060" stroke="#000" stroke-width="5"/>
<ellipse cx="-146" cy="-41" rx="34" ry="58" fill="#1c1208" stroke="#000" stroke-width="3"/>
<rect x="-235" y="-6" width="52" height="40" rx="8" fill="#4a5a3a" stroke="#000" stroke-width="3"/>
<rect x="-226" y="4" width="34" height="8" fill="#2f3a25"/>
<rect x="-178" y="10" width="40" height="28" rx="4" fill="#7a4a2a" stroke="#000" stroke-width="3"/>
<circle cx="-118" cy="30" r="12" fill="#c43b2b" stroke="#000" stroke-width="3"/>
<path d="M-260 34 L-210 34 L-218 14 Z" fill="#b8bec6" stroke="#000" stroke-width="2"/>
<rect x="-290" y="22" width="30" height="14" rx="3" fill="#d9c7a0" stroke="#000" stroke-width="2"/>
</g>
<!-- arco -->
<g transform="translate(640 655) rotate(8) scale(0.85)"><path d="M-110 0 Q0 -90 110 0" fill="none" stroke="#5a3418" stroke-width="12" stroke-linecap="round"/><line x1="-110" y1="0" x2="110" y2="0" stroke="#e8e0cc" stroke-width="3"/>
<line x1="-60" y1="-20" x2="120" y2="-50" stroke="#2b2b2b" stroke-width="5"/><path d="M120 -50 L104 -58 L108 -44 Z" fill="#999" stroke="#000" stroke-width="2"/></g>
{embers}
</svg>'''
p=dict(bg=BG, ink=INK, accent=EMB, bgcss=f'background:radial-gradient(ellipse at 50% 40%, #3a160a 0%, {BG} 65%, #050201 100%);',
 bulbs=['#FFB347','#FF6A1A','#FFE0A0'], glow=0.65,
 frame_css=f'4px solid {BRZ}', frame_extra=f'outline:2px solid {EMB}66; outline-offset:12px;',
 badge='🎬 FILM IN 2 MINUTI', badge_bg='#FFC400', badge_ink='#141414', svg=svg, ill_border=f'6px solid {BRZ}',
 ctx='Panem, in un futuro lontano', ctx_font="Cinzel",
 title=['HUNGER GAMES'], title_css=f"font-family:Cinzel;font-weight:900;font-size:120px;letter-spacing:4px;color:{INK};text-shadow:0 5px 0 #000,0 0 26px {EMB}88;",
 teaser='Ogni anno ragazzi e ragazze entrano in un\'arena<br>da cui può uscire vivo uno solo.',
 date='DOMENICA 15 NOVEMBRE · ORE 10:00', date_col='#FFC400', cred='Un film intero in soli 2 minuti · Prima visione')
open('/tmp/claude-0/storie/hunger.html','w').write(page(p))
