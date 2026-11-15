import sys, math; sys.path.insert(0,'/tmp/claude-0/storie/gen'); from base import *
# GTA VI (Videogiochi spiegati): tramonto su una città di mare inventata, hotel anni '30 con insegna al neon,
# palme, un fenicottero, un'auto decappottabile ferma sulla strada bagnata e i lampeggianti della polizia in fondo.
# Niente personaggi, niente logo né caratteri del gioco.
INK='#FFF1F6'; BG='#14081E'; PINK='#FF3E9A'; CYAN='#2FE6FF'; SUN='#FFB24A'
def palm(x, y, h, s=1.0):
    tr = f'<path d="M{x} {y} Q{x+18*s} {y-h*0.5} {x+6*s} {y-h}" stroke="#120818" stroke-width="{16*s}" fill="none" stroke-linecap="round"/>'
    tr += ''.join(f'<line x1="{x+14*s-8*s*k*0.3:.0f}" y1="{y-k*h/9:.0f}" x2="{x+14*s+10*s-8*s*k*0.3:.0f}" y2="{y-k*h/9-6:.0f}" stroke="#2a1430" stroke-width="3"/>' for k in range(1,9))
    top = (x+6*s, y-h)
    fr = ''.join(f'<path d="M{top[0]} {top[1]} Q{top[0]+95*s*math.cos(math.radians(a)):.0f} {top[1]+95*s*math.sin(math.radians(a))-40*s:.0f} {top[0]+150*s*math.cos(math.radians(a)):.0f} {top[1]+150*s*math.sin(math.radians(a))+30*s:.0f}" stroke="#120818" stroke-width="{20*s}" fill="none" stroke-linecap="round"/>' for a in (-170,-135,-100,-70,-35,-5,200))
    return tr + fr
sky = '''<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a0f4a"/><stop offset=".45" stop-color="#a1307a"/><stop offset=".72" stop-color="#ff7a59"/><stop offset=".8" stop-color="#ffc05a"/></linearGradient>'''
sunstripes = ''.join(f'<rect x="250" y="{300+k*14}" width="340" height="{3+k*1.6:.1f}" fill="#d9466f"/>' for k in range(6))
waves = ''.join(f'<path d="M0 {420+k*16} Q105 {414+k*16} 210 {420+k*16} T420 {420+k*16} T630 {420+k*16} T840 {420+k*16}" stroke="{"#ffcf8a" if k<2 else "#7a3a8a"}" stroke-width="2" fill="none" opacity="{0.7-k*0.08:.2f}"/>' for k in range(6))
windows = ''.join(f'<rect x="{486+c*44}" y="{218+r*40}" width="26" height="22" fill="{"#ffe39a" if (r*3+c)%4 else "#3b2050"}" stroke="#120818" stroke-width="3"/>' for r in range(5) for c in range(6))
svg=f'''<svg width="828" height="688" viewBox="0 0 840 700" role="img" aria-label="Tramonto rosa su una città di mare inventata: palme, un hotel anni Trenta con l'insegna al neon HOTEL, un fenicottero sull'acqua, un'auto decappottabile ferma sulla strada bagnata e, in fondo, i lampeggianti rossi e blu della polizia">
<defs>{sky}
<radialGradient id="sun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff1b0"/><stop offset="1" stop-color="{SUN}"/></radialGradient>
<linearGradient id="road" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1838"/><stop offset="1" stop-color="#0d0614"/></linearGradient>
<radialGradient id="pr" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ff2b3a" stop-opacity=".9"/><stop offset="1" stop-color="#ff2b3a" stop-opacity="0"/></radialGradient>
<radialGradient id="pb" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#2b7bff" stop-opacity=".9"/><stop offset="1" stop-color="#2b7bff" stop-opacity="0"/></radialGradient>
<filter id="neon"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<rect width="840" height="700" fill="url(#sky)"/>
<circle cx="420" cy="330" r="170" fill="url(#sun)"/>{sunstripes}
<!-- skyline lontano -->
<path d="M0 400 L0 330 L40 330 L40 300 L70 300 L70 345 L110 345 L110 280 L135 270 L160 280 L160 350 L200 350 L200 400 Z" fill="#5a2160" stroke="#120818" stroke-width="3"/>
<path d="M640 400 L640 320 L690 320 L690 290 L720 290 L720 340 L760 340 L760 300 L800 300 L800 400 Z" fill="#5a2160" stroke="#120818" stroke-width="3"/>
<rect y="400" width="840" height="110" fill="#3a1a5a"/>{waves}
<rect x="0" y="404" width="840" height="5" fill="#ffcf8a" opacity=".55"/>
<!-- hotel anni '30 -->
<g>
<rect x="466" y="170" width="290" height="300" fill="#f7d6e4" stroke="#120818" stroke-width="5"/>
<rect x="466" y="170" width="290" height="22" fill="{CYAN}" stroke="#120818" stroke-width="4"/>
<path d="M566 170 L566 110 L656 110 L656 170" fill="#f7d6e4" stroke="#120818" stroke-width="5"/>
<rect x="590" y="78" width="42" height="34" fill="#f7d6e4" stroke="#120818" stroke-width="4"/>
{''.join(f'<line x1="{576+k*14}" y1="118" x2="{576+k*14}" y2="168" stroke="#d79ab6" stroke-width="3"/>' for k in range(6))}
{windows}
<rect x="466" y="420" width="290" height="50" fill="#e9b8cf" stroke="#120818" stroke-width="4"/>
<rect x="588" y="430" width="46" height="40" fill="#3b2050" stroke="#120818" stroke-width="3"/>
<g filter="url(#neon)"><rect x="500" y="122" width="56" height="150" rx="8" fill="#1a0b24" stroke="{PINK}" stroke-width="5"/>
{''.join(f'<text x="528" y="{152+i*26}" text-anchor="middle" font-family="Bungee" font-size="24" fill="{PINK}">{ch}</text>' for i,ch in enumerate("HOTEL"))}</g>
</g>
<!-- fenicottero sull'acqua -->
<g transform="translate(330 470)">
<line x1="0" y1="0" x2="-4" y2="-58" stroke="#120818" stroke-width="5"/><line x1="12" y1="0" x2="8" y2="-40" stroke="#120818" stroke-width="5"/>
<ellipse cx="6" cy="-74" rx="34" ry="20" fill="#ff8fb8" stroke="#120818" stroke-width="4"/>
<path d="M32 -80 Q52 -110 36 -128 Q24 -142 38 -150" stroke="#ff8fb8" stroke-width="10" fill="none" stroke-linecap="round"/>
<path d="M32 -80 Q52 -110 36 -128 Q24 -142 38 -150" stroke="#120818" stroke-width="14" fill="none" stroke-linecap="round" opacity=".0"/>
<circle cx="40" cy="-152" r="10" fill="#ff8fb8" stroke="#120818" stroke-width="3"/><path d="M48 -152 L62 -146 L50 -142 Z" fill="#120818"/>
<path d="M-20 -80 Q-34 -70 -24 -62" stroke="#c94f7c" stroke-width="5" fill="none"/>
<ellipse cx="4" cy="2" rx="40" ry="6" fill="#ffcf8a" opacity=".35"/>
</g>
<!-- strada bagnata -->
<rect y="505" width="840" height="195" fill="url(#road)"/>
<rect y="500" width="840" height="10" fill="#e9b8cf" stroke="#120818" stroke-width="3"/>
{''.join(f'<rect x="{30+k*130}" y="610" width="70" height="8" fill="#ffd36a" opacity=".8"/>' for k in range(7))}
<ellipse cx="760" cy="560" rx="120" ry="40" fill="url(#pr)"/><ellipse cx="820" cy="590" rx="110" ry="40" fill="url(#pb)"/>
<rect x="740" y="520" width="16" height="10" rx="3" fill="#ff2b3a" stroke="#120818" stroke-width="2"/><rect x="760" y="520" width="16" height="10" rx="3" fill="#2b7bff" stroke="#120818" stroke-width="2"/>
<!-- riflessi del neon e del sole sull'asfalto -->
<ellipse cx="528" cy="580" rx="40" ry="70" fill="{PINK}" opacity=".14"/>
<ellipse cx="420" cy="590" rx="60" ry="80" fill="#ffc05a" opacity=".10"/>
<!-- auto decappottabile -->
<g transform="translate(150 560)">
<path d="M0 60 L10 22 L80 16 L120 -8 L210 -8 L250 16 L320 24 L330 60 Z" fill="{CYAN}" stroke="#120818" stroke-width="5"/>
<path d="M124 -6 L150 -36 L160 -36 L140 -6 Z" fill="#bff6ff" stroke="#120818" stroke-width="4" opacity=".9"/>
<rect x="160" y="0" width="70" height="14" rx="5" fill="#3b2050" stroke="#120818" stroke-width="3"/>
<line x1="30" y1="38" x2="300" y2="38" stroke="#18a9c2" stroke-width="4"/>
<rect x="300" y="26" width="26" height="12" rx="4" fill="#ff5a5a" stroke="#120818" stroke-width="3"/>
<circle cx="74" cy="62" r="30" fill="#120818"/><circle cx="74" cy="62" r="14" fill="#c9c3d6"/>
<circle cx="262" cy="62" r="30" fill="#120818"/><circle cx="262" cy="62" r="14" fill="#c9c3d6"/>
<ellipse cx="166" cy="110" rx="170" ry="12" fill="{CYAN}" opacity=".22"/>
</g>
<!-- palme in primo piano -->
{palm(70, 700, 420, 1.0)}{palm(800, 700, 360, 0.85)}
</svg>'''
p=dict(bg=BG, ink=INK, accent=CYAN, bgcss=f'background:radial-gradient(ellipse at 50% 35%, #4a1650 0%, {BG} 65%, #06020a 100%);',
 bulbs=[PINK,'#FFE3A6',CYAN], glow=0.65,
 frame_css=f'4px solid {PINK}', frame_extra=f'outline:2px solid {CYAN}88; outline-offset:12px;',
 badge='🎮 VIDEOGIOCHI SPIEGATI', badge_bg='#FFC400', badge_ink='#141414', svg=svg, ill_border=f'6px solid {INK}',
 ctx='Leonida, una Florida inventata', ctx_font="Figtree",
 title=['GTA VI'], title_css=f"font-family:'Monoton';font-size:190px;letter-spacing:10px;color:{INK};text-shadow:0 0 18px {PINK},6px 6px 0 {PINK};",
 teaser="Una Vice City tutta nuova e una coppia in fuga.<br>Cosa sappiamo davvero prima dell'uscita?",
 date='MARTEDÌ 17 NOVEMBRE · ORE 12:30', date_col='#FFC400', cred='La storia di un videogioco spiegata in 2 minuti · Prima visione')
open('/tmp/claude-0/storie/gta6.html','w').write(page(p))
