import sys, math; sys.path.insert(0,'/tmp/claude-0/storie/gen'); from base import *
# Storia di lancio del video lungo «Dark, tutta la serie» (già uscito su YouTube): stessa immagine della miniatura.
INK='#E4E7E1'; BG='#07120F'; YEL='#F2C230'; RED='#D9483A'; BLUE='#5A9AE0'; BRASS='#C9A458'; K='#070A09'
O=(420,320); R=232
def rim(a, r):
    return O[0]+r*math.sin(math.radians(a)), O[1]-r*math.cos(math.radians(a))
ticks=''.join(f'<line x1="{rim(i*6,R-26)[0]:.1f}" y1="{rim(i*6,R-26)[1]:.1f}" x2="{rim(i*6,R-(56 if i%5==0 else 38))[0]:.1f}" y2="{rim(i*6,R-(56 if i%5==0 else 38))[1]:.1f}" stroke="{INK}" stroke-width="{6 if i%5==0 else 2.5}" opacity=".8"/>' for i in range(60))
rain=''.join(f'<line x1="{(i*61)%880-20}" y1="{(i*97)%720-20}" x2="{(i*61)%880-30}" y2="{(i*97)%720+18}" stroke="#a9cfc6" stroke-width="2.5" opacity=".3"/>' for i in range(70))
pines=''.join(f'<path d="M{x-h*0.3:.0f} 640 L{x} {640-h} L{x+h*0.3:.0f} 640 Z" fill="#0b1915"/>' for x,h in [(20,230),(90,180),(150,250),(700,240),(770,190),(830,260),(250,140),(600,150)])
def tower(x, w, h):
    return (f'<path d="M{x-w/2} 640 C{x-w*0.3} {640-h*0.45} {x-w*0.27} {640-h*0.75} {x-w*0.34} {640-h} L{x+w*0.34} {640-h} '
            f'C{x+w*0.27} {640-h*0.75} {x+w*0.3} {640-h*0.45} {x+w/2} 640 Z" fill="url(#tw)" stroke="{K}" stroke-width="4"/>'
            f'<ellipse cx="{x-20}" cy="{640-h-50}" rx="{w*0.5}" ry="40" fill="#cfd8d3" opacity=".22"/><ellipse cx="{x-60}" cy="{640-h-110}" rx="{w*0.7}" ry="55" fill="#cfd8d3" opacity=".14"/>')
# impermeabile giallo (come src/scenes/dark-stagione-1/Winden.tsx), appeso al perno del quadrante
coat=f'''<g transform="translate({O[0]} {O[1]-120}) scale(.62)">
<path d="M0 -10 Q-6 -34 10 -36 Q24 -36 22 -22" fill="none" stroke="{K}" stroke-width="7" stroke-linecap="round"/>
<path d="M-46 30 Q-50 -6 0 -8 Q50 -6 46 30 L96 66 Q110 76 108 100 L118 300 Q118 316 102 316 L92 316 L86 140 L84 360 Q0 376 -84 360 L-86 140 L-92 316 L-102 316 Q-118 316 -118 300 L-108 100 Q-110 76 -96 66 Z" fill="url(#coat)" stroke="{K}" stroke-width="9" stroke-linejoin="round"/>
<path d="M-46 30 Q0 54 46 30" fill="none" stroke="{K}" stroke-width="6"/><path d="M0 50 V356" stroke="{K}" stroke-width="5"/>
{''.join(f'<circle cx="12" cy="{y}" r="6" fill="{K}"/>' for y in (100,170,240,310))}
<path d="M-70 220 h40 M30 220 h40" stroke="{K}" stroke-width="5"/><path d="M-78 90 Q-70 230 -74 350" fill="none" stroke="#FFF2B8" stroke-width="5" opacity=".55"/>
</g>'''
def ring(cx, cy, rx, ry, rot, back):
    c, s = math.cos(math.radians(rot)), math.sin(math.radians(rot))
    x1, y1, x2, y2 = cx-c*rx, cy-s*rx, cx+c*rx, cy+s*rx
    d=f'M{x1:.1f} {y1:.1f} A{rx} {ry} {rot} 0 {1 if back else 0} {x2:.1f} {y2:.1f}'
    if back: return f'<path d="{d}" fill="none" stroke="#7A2A24" stroke-width="10" stroke-linecap="round"/>'
    return f'<path d="{d}" fill="none" stroke="{K}" stroke-width="17" stroke-linecap="round" opacity=".55"/><path d="{d}" fill="none" stroke="{RED}" stroke-width="11" stroke-linecap="round"/>'
RINGS=[(O[0],O[1]-20,170,58,-16),(O[0],O[1]+50,150,50,20)]
crack=f'M{O[0]} {O[1]-R+26} L{O[0]-6} {O[1]-140} L{O[0]+8} {O[1]-80} L{O[0]-5} {O[1]-20} L{O[0]+6} {O[1]+40} L{O[0]-7} {O[1]+100} L{O[0]+4} {O[1]+160} L{O[0]} {O[1]+R-26}'
svg=f'''<svg width="828" height="688" viewBox="0 0 840 700" role="img" aria-label="Un grande orologio da taschino d'ottone sopra il bosco e le torri di una centrale sotto la pioggia: al centro un impermeabile giallo appeso, stretto da due giri di filo rosso; il quadrante è incrinato in due metà, la destra blu">
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05080A"/><stop offset=".55" stop-color="#132219"/><stop offset=".85" stop-color="#24352E"/><stop offset="1" stop-color="#101a16"/></linearGradient>
<linearGradient id="tw" x1="0" x2="1"><stop offset="0" stop-color="#5E6A64"/><stop offset="1" stop-color="#2A3430"/></linearGradient>
<linearGradient id="brass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F0D592"/><stop offset=".45" stop-color="{BRASS}"/><stop offset="1" stop-color="#6E5526"/></linearGradient>
<radialGradient id="face" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#2A3A33"/><stop offset=".7" stop-color="#18221E"/><stop offset="1" stop-color="#0E1512"/></radialGradient>
<linearGradient id="coat" x1="0" x2="1"><stop offset="0" stop-color="#FFE07A"/><stop offset=".45" stop-color="{YEL}"/><stop offset="1" stop-color="#B88A14"/></linearGradient>
<radialGradient id="cg"><stop offset="0" stop-color="{YEL}" stop-opacity=".55"/><stop offset="1" stop-color="{YEL}" stop-opacity="0"/></radialGradient>
<clipPath id="dial"><circle cx="{O[0]}" cy="{O[1]}" r="{R-24}"/></clipPath>
</defs>
<rect width="840" height="700" fill="url(#sky)"/>
{''.join(f'<circle cx="{(i*137)%840}" cy="{(i*71)%300}" r="{1.5+(i%3)}" fill="#DDE6E0" opacity="{.3+.15*(i%3)}"/>' for i in range(30))}
{tower(725,150,300)}{tower(620,110,210)}
<circle cx="725" cy="342" r="6" fill="#FF5A4A"/>
{pines}
<ellipse cx="420" cy="640" rx="560" ry="60" fill="#5E746A" opacity=".25"/>
<circle cx="{O[0]+8}" cy="{O[1]+12}" r="{R+8}" fill="#000" opacity=".45"/>
<circle cx="{O[0]}" cy="{O[1]}" r="{R}" fill="url(#brass)" stroke="{K}" stroke-width="8"/>
<circle cx="{O[0]}" cy="{O[1]}" r="{R-22}" fill="url(#face)" stroke="{K}" stroke-width="5"/>
<g clip-path="url(#dial)"><rect x="{O[0]}" y="{O[1]-R}" width="{R}" height="{2*R}" fill="{BLUE}" opacity=".24"/></g>
{ticks}
<line x1="{O[0]}" y1="{O[1]}" x2="{rim(300,120)[0]:.0f}" y2="{rim(300,120)[1]:.0f}" stroke="{INK}" stroke-width="10" stroke-linecap="round" opacity=".85"/>
<line x1="{O[0]}" y1="{O[1]}" x2="{rim(140,180)[0]:.0f}" y2="{rim(140,180)[1]:.0f}" stroke="{INK}" stroke-width="5" stroke-linecap="round" opacity=".85"/>
<path d="{crack}" fill="none" stroke="#F4FBFF" stroke-width="4" stroke-linejoin="round"/>
<rect x="{O[0]-24}" y="{O[1]-R-34}" width="48" height="30" rx="7" fill="url(#brass)" stroke="{K}" stroke-width="5"/>
<circle cx="{O[0]}" cy="{O[1]-R-60}" r="22" fill="none" stroke="{BRASS}" stroke-width="10"/>
<circle cx="{O[0]}" cy="{O[1]}" r="190" fill="url(#cg)"/>
{''.join(ring(*r, True) for r in RINGS)}
{coat}
{''.join(ring(*r, False) for r in RINGS)}
<path d="M{RINGS[0][0]-math.cos(math.radians(-16))*170+16:.1f} {RINGS[0][1]-math.sin(math.radians(-16))*170-16:.1f} l-20 -6 m20 6 l-6 20" fill="none" stroke="{RED}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="{O[0]}" cy="{O[1]}" r="12" fill="{INK}" stroke="{K}" stroke-width="4"/>
{rain}
</svg>'''
p=dict(bg=BG, ink=INK, accent=YEL, bgcss=f'background:radial-gradient(ellipse at 50% 38%, #12302a 0%, {BG} 62%, #020605 100%);',
 bulbs=[YEL,'#22302d',YEL,'#5FD3C7','#22302d',YEL], glow=0.5,
 frame_css=f'3px double {INK}', frame_extra=f'outline:1px solid {YEL}55; outline-offset:12px;',
 badge='💡 SPIEGATO FACILE', badge_bg='#FFC400', badge_ink='#141414', svg=svg, ill_border=f'6px solid {INK}',
 ctx='Winden · 1953 · 1986 · 2019 · 2052', ctx_font='Oswald',
 title=['DARK'], title_css=f"font-family:Oswald;font-weight:700;font-size:170px;letter-spacing:40px;margin-right:-40px;color:{INK};text-shadow:0 0 30px {YEL}55,0 6px 0 #000;",
 sub='TUTTA LA SERIE',
 teaser='Come si diventa antenati di sé stessi?<br>2 minuti a stagione, più il finale spiegato.',
 date='ORA SU YOUTUBE · LINK IN BIO', date_col='#FFC400', cred='Tutta la serie spiegata facile · Il finale finalmente chiaro')
open('/tmp/claude-0/storie/darkserie.html','w').write(page(p))
