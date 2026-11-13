import sys, math; sys.path.insert(0,'/tmp/claude-0/storie/gen'); from base import *
# Primo video lungo YouTube: DARK, tutta la serie. Albero di famiglia che si annoda sopra la grotta, quadrante sullo sfondo.
INK='#D9E6E0'; BG='#07130F'; TEAL='#5FD3C7'; AMB='#E8B65A'; RED='#E5484D'
def pol(r,a,cx=420,cy=290): return cx+r*math.sin(math.radians(a)), cy-r*math.cos(math.radians(a))
ticks=''.join('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="#ffffff" stroke-opacity="%s" stroke-width="%d"/>'%(*pol(270,a),*pol(250 if a%30 else 232,a),'.16' if a%30 else '.28',2 if a%30 else 5) for a in range(0,360,6))
rain=''.join(f'<line x1="{(i*67)%840}" y1="{(i*113)%640}" x2="{(i*67)%840-7}" y2="{(i*113)%640+28}" stroke="#a9d6cf" stroke-width="2" opacity=".28"/>' for i in range(60))
nodes=[(190,330,TEAL),(300,170,AMB),(420,95,TEAL),(540,170,TEAL),(650,330,AMB),(300,420,TEAL),(540,420,AMB)]
branches=''.join(f'<path d="M420 560 Q{(420+x)/2} {(560+y)/2+40} {x} {y}" fill="none" stroke="#1d3a33" stroke-width="18" stroke-linecap="round"/><path d="M420 560 Q{(420+x)/2} {(560+y)/2+40} {x} {y}" fill="none" stroke="{INK}" stroke-opacity=".55" stroke-width="4" stroke-linecap="round"/>' for x,y,_ in nodes)
circles=''.join(f'<circle cx="{x}" cy="{y}" r="58" fill="{c}" opacity=".12"/><circle cx="{x}" cy="{y}" r="36" fill="#0c1a16" stroke="{INK}" stroke-width="5"/><circle cx="{x}" cy="{y}" r="13" fill="{c}"/>' for x,y,c in nodes)
# viaggi nel tempo: tratteggio giallo che dalle cime torna alle radici
loops=f'''<path d="M300 170 C120 60 40 520 380 610" fill="none" stroke="#FFC400" stroke-width="6" stroke-dasharray="14 11" stroke-linecap="round"/>
<path d="M540 170 C720 60 800 520 460 610" fill="none" stroke="#FFC400" stroke-width="6" stroke-dasharray="14 11" stroke-linecap="round"/>
<path d="M650 330 C560 500 300 470 300 420" fill="none" stroke="#FFC400" stroke-width="5" stroke-dasharray="12 10" stroke-linecap="round" opacity=".85"/>'''
svg=f'''<svg width="828" height="688" viewBox="0 0 840 700" role="img" aria-label="Un albero di famiglia fatto di cerchi luminosi sopra l'ingresso di una grotta, con linee tratteggiate gialle che dai rami tornano alle radici e un anello rosso sul nodo; sullo sfondo un grande quadrante d'orologio sotto la pioggia">
<defs>
<radialGradient id="sky" cx=".5" cy=".4" r=".8"><stop offset="0" stop-color="#14382f"/><stop offset="1" stop-color="#06110d"/></radialGradient>
<radialGradient id="cave" cx=".5" cy="1" r=".9"><stop offset="0" stop-color="{TEAL}" stop-opacity=".7"/><stop offset="1" stop-color="{TEAL}" stop-opacity="0"/></radialGradient>
</defs>
<rect width="840" height="700" fill="url(#sky)"/>
<circle cx="420" cy="290" r="270" fill="#ffffff" fill-opacity=".025" stroke="#ffffff" stroke-opacity=".22" stroke-width="4"/>
{ticks}
<line x1="420" y1="290" x2="420" y2="100" stroke="#ffffff" stroke-opacity=".18" stroke-width="10" stroke-linecap="round"/>
<line x1="420" y1="290" x2="560" y2="380" stroke="#ffffff" stroke-opacity=".18" stroke-width="8" stroke-linecap="round"/>
{rain}
{''.join(f'<path d="M{x} 640 L{x+30} {h} L{x+60} 640 Z" fill="#0c2a23" stroke="#000" stroke-width="3"/>' for x,h in [(0,470),(50,420),(730,430),(780,480),(100,500),(680,500)])}
<path d="M0 630 Q210 590 420 600 Q630 590 840 630 L840 700 L0 700 Z" fill="#0f241e" stroke="#000" stroke-width="3"/>
<!-- grotta alla base dell'albero -->
<path d="M300 700 Q300 560 420 552 Q540 560 540 700 Z" fill="#26332f" stroke="#000" stroke-width="5"/>
<path d="M345 700 Q345 600 420 594 Q495 600 495 700 Z" fill="#040807"/>
<path d="M345 700 Q345 600 420 594 Q495 600 495 700 Z" fill="url(#cave)"/>
{branches}
{loops}
<circle cx="420" cy="560" r="66" fill="none" stroke="{RED}" stroke-width="8"/>
<circle cx="420" cy="560" r="66" fill="none" stroke="{RED}" stroke-opacity=".3" stroke-width="22"/>
{circles}
</svg>'''
p=dict(bg=BG, ink=INK, accent=TEAL, bgcss=f'background:radial-gradient(ellipse at 50% 40%, #12302a 0%, {BG} 65%, #020605 100%);',
 bulbs=[TEAL,'#22302d',TEAL,TEAL,'#22302d',AMB], glow=0.5,
 frame_css=f'3px double {INK}', frame_extra=f'outline:1px solid {TEAL}55; outline-offset:12px;',
 badge='💡 SPIEGATO FACILE', badge_bg='#FFC400', badge_ink='#141414', svg=svg, ill_border=f'6px solid {INK}',
 ctx='Winden, dal 1888 al 2053', ctx_font='Oswald',
 title=['DARK'], title_css=f"font-family:Oswald;font-weight:700;font-size:170px;letter-spacing:40px;margin-right:-40px;color:{INK};text-shadow:0 0 30px {TEAL}66,0 6px 0 #000;",
 sub='TUTTA LA SERIE',
 teaser='Tre stagioni, due mondi, un solo nodo.<br>Dall\'inizio al finale, finalmente chiaro.',
 date='DOMENICA 22 NOVEMBRE · ORE 18:00', date_col='#FFC400',
 cred='Ogni stagione in 2 minuti, più il finale spiegato · Prima visione', social='Solo su YouTube')
open('/tmp/claude-0/storie/darkserie.html','w').write(page(p))
