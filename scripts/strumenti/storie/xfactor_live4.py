import sys, math; sys.path.insert(0,'/tmp/claude-0/storie/gen'); from base import *
INK='#F6EEF8'; BG='#0B0614'; MAG='#FF3EA5'; GOLD='#FFC53D'; CY='#53E3FF'
TEAMS=['#FF7A66','#A8E063','#E08CFF','#5CC8FF']
def disc(x,y,r,c,rot=0,grey=False):
    body='#2b2b30' if not grey else '#5a5a60'
    lab=c if not grey else '#8a8a90'
    grooves=''.join(f'<circle cx="0" cy="0" r="{r*k/10:.1f}" fill="none" stroke="#ffffff" stroke-opacity=".07" stroke-width="2"/>' for k in range(4,10))
    crack=f'<path d="M{-r*0.1} {-r} L{r*0.08} {-r*0.45} L{-r*0.12} {-r*0.1} L{r*0.15} {r*0.4} L{0} {r}" stroke="#0B0614" stroke-width="5" fill="none"/>' if grey else ''
    return f'<g transform="translate({x} {y}) rotate({rot})"><circle r="{r}" fill="{body}" stroke="#000" stroke-width="4"/>{grooves}<circle r="{r*0.36}" fill="{lab}" stroke="#000" stroke-width="3"/><circle r="{r*0.06}" fill="#0B0614"/><path d="M{-r*0.7} {-r*0.4} A{r*0.8} {r*0.8} 0 0 1 {-r*0.2} {-r*0.78}" stroke="#fff" stroke-opacity=".25" stroke-width="6" fill="none"/>{crack}</g>'
fan=''.join(disc(420+math.sin(math.radians(a))*230, 520-math.cos(math.radians(a))*120, 78, TEAMS[i%4], a) for i,a in enumerate([-70,-35,35,70]))
stars=''.join(f'<path transform="translate({x} {y}) scale({s})" d="M0 -20 L6 -6 L21 -6 L9 3 L13 18 L0 9 L-13 18 L-9 3 L-21 -6 L-6 -6 Z" fill="{GOLD}" stroke="#000" stroke-width="2"/>' for x,y,s in [(120,140,1.2),(720,120,1),(90,620,.8),(770,610,1.1),(640,250,.7),(200,260,.7)])
chalk=''.join(f'<path d="M{(i*97)%820} {(i*61)%700} l{10+i%7} {3-i%5}" stroke="#ffffff" stroke-opacity=".06" stroke-width="2"/>' for i in range(120))
svg=f'''<svg width="828" height="688" viewBox="0 0 840 700" role="img" aria-label="Su una lavagna scura quattro dischi in vinile a ventaglio con le etichette nei colori delle squadre, al centro un disco grigio incrinato, stelle d'oro e un cartello luminoso con la scritta Live 4">
<defs><radialGradient id="bb" cx=".5" cy=".45" r=".7"><stop offset="0" stop-color="#2a1d3d"/><stop offset="1" stop-color="#0f0a19"/></radialGradient></defs>
<rect width="840" height="700" fill="url(#bb)"/>{chalk}
<rect x="250" y="60" width="340" height="150" rx="16" fill="#120a20" stroke="{GOLD}" stroke-width="6"/>
{''.join(f'<circle cx="{268+i*22}" cy="{78}" r="5" fill="{GOLD}"/><circle cx="{268+i*22}" cy="{192}" r="5" fill="{GOLD}"/>' for i in range(15))}
<text x="420" y="168" text-anchor="middle" font-family="Monoton" font-size="78" fill="{GOLD}">LIVE 4</text>
{fan}
{disc(420,470,96,'#888',12,True)}
<rect x="352" y="590" width="136" height="44" rx="8" fill="#FF4A5A" stroke="#000" stroke-width="4" transform="rotate(-4 420 612)"/>
<text x="420" y="622" text-anchor="middle" font-family="Figtree" font-weight="800" font-size="28" fill="#fff" transform="rotate(-4 420 612)">FUORI?</text>
{stars}
</svg>'''
p=dict(bg=BG, ink=INK, accent=CY, bgcss=f'background:radial-gradient(ellipse at 50% 40%, #2a1145 0%, {BG} 65%, #030106 100%);',
 bulbs=[MAG,GOLD,CY,GOLD], glow=0.7,
 frame_css=f'4px solid {MAG}', frame_extra=f'outline:2px solid {CY}88; outline-offset:12px; box-shadow:0 0 30px {MAG}55 inset;',
 badge='💡 SPIEGATO FACILE', badge_bg='#FFC400', badge_ink='#141414', svg=svg, ill_border=f'6px solid {INK}',
 ctx='Milano, autunno 2026',
 title=['X FACTOR 2026'], title_css=f"font-family:Monoton;font-size:104px;letter-spacing:2px;color:{INK};text-shadow:0 0 18px {MAG},0 0 40px {MAG}88;",
 sub="COM'È ANDATO IL LIVE 4",
 teaser='Una serata, tante esibizioni, qualcuno che esce.<br>Tutto chiaro prima del Live 5.',
 date='MERCOLEDÌ 18 NOVEMBRE · ORE 17:30', date_col='#FFC400', cred='Una puntata intera spiegata facile in 2 minuti · Prima visione')
open('/tmp/claude-0/storie/xfactor_live4.html','w').write(page(p))
