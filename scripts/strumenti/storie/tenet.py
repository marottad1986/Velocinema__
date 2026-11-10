import sys, math; sys.path.insert(0,'/tmp/claude-0/storie/gen'); from base import *
R, B, N, INK = '#E8463A', '#3EA6FF', '#0A1430', '#F1EDE3'
def hourglass(cx, cy, s, col, up):
    # clessidra: sabbia che scende (rosso) o sale (blu)
    w, h = 90*s, 150*s
    sand_top = f'<path d="M{cx-w*0.38} {cy-h*0.30} L{cx+w*0.38} {cy-h*0.30} L{cx} {cy-h*0.02} Z" fill="{col}" opacity=".9"/>' if not up else f'<path d="M{cx-w*0.42} {cy-h*0.40} L{cx+w*0.42} {cy-h*0.40} L{cx+w*0.30} {cy-h*0.28} L{cx-w*0.30} {cy-h*0.28} Z" fill="{col}" opacity=".9"/>'
    sand_bot = f'<path d="M{cx-w*0.42} {cy+h*0.40} L{cx+w*0.42} {cy+h*0.40} L{cx+w*0.30} {cy+h*0.28} L{cx-w*0.30} {cy+h*0.28} Z" fill="{col}" opacity=".9"/>' if not up else f'<path d="M{cx-w*0.38} {cy+h*0.30} L{cx+w*0.38} {cy+h*0.30} L{cx} {cy+h*0.02} Z" fill="{col}" opacity=".9"/>'
    grains = ''.join(f'<circle cx="{cx+(i%2)*2-1}" cy="{cy+(-1 if up else 1)*(8+i*9)*s}" r="{2.2*s}" fill="{col}"/>' for i in range(5))
    return f'''<g>
<rect x="{cx-w*0.6}" y="{cy-h*0.56}" width="{w*1.2}" height="{h*0.08}" rx="6" fill="#2a2f45" stroke="#000" stroke-width="3"/>
<rect x="{cx-w*0.6}" y="{cy+h*0.48}" width="{w*1.2}" height="{h*0.08}" rx="6" fill="#2a2f45" stroke="#000" stroke-width="3"/>
<path d="M{cx-w*0.5} {cy-h*0.48} C{cx-w*0.5} {cy-h*0.1} {cx-w*0.08} {cy-h*0.08} {cx-w*0.06} {cy} C{cx-w*0.08} {cy+h*0.08} {cx-w*0.5} {cy+h*0.1} {cx-w*0.5} {cy+h*0.48} L{cx+w*0.5} {cy+h*0.48} C{cx+w*0.5} {cy+h*0.1} {cx+w*0.08} {cy+h*0.08} {cx+w*0.06} {cy} C{cx+w*0.08} {cy-h*0.08} {cx+w*0.5} {cy-h*0.1} {cx+w*0.5} {cy-h*0.48} Z" fill="#ffffff14" stroke="{INK}" stroke-width="4"/>
{sand_top}{sand_bot}{grains}
<path d="M{cx-w*0.36} {cy-h*0.42} C{cx-w*0.36} {cy-h*0.2} {cx-w*0.2} {cy-h*0.15} {cx-w*0.12} {cy-h*0.1}" stroke="#ffffff55" stroke-width="5" fill="none" stroke-linecap="round"/>
<rect x="{cx-w*0.62}" y="{cy-h*0.48}" width="{w*0.07}" height="{h*0.96}" fill="#2a2f45" stroke="#000" stroke-width="2"/>
<rect x="{cx+w*0.55}" y="{cy-h*0.48}" width="{w*0.07}" height="{h*0.96}" fill="#2a2f45" stroke="#000" stroke-width="2"/>
</g>'''
def crack(cx, cy, r, col):
    out=[f'<circle cx="{cx}" cy="{cy}" r="7" fill="#05080f" stroke="{col}" stroke-width="2"/>']
    for k in range(9):
        a=math.radians(k*40+13); L=r*(0.6+0.4*((k*37)%10)/10)
        mx,my=cx+math.cos(a)*L*0.5+math.sin(a)*6, cy+math.sin(a)*L*0.5-math.cos(a)*6
        out.append(f'<path d="M{cx} {cy} L{mx:.1f} {my:.1f} L{cx+math.cos(a)*L:.1f} {cy+math.sin(a)*L:.1f}" stroke="{col}" stroke-width="2" fill="none" opacity=".8"/>')
    out.append(f'<circle cx="{cx}" cy="{cy}" r="{r*0.45}" fill="none" stroke="{col}" stroke-width="1.5" opacity=".5"/>')
    return ''.join(out)
grid=''.join(f'<line x1="{420+(i-10)*60}" y1="700" x2="{420+(i-10)*14}" y2="470" stroke="#ffffff22" stroke-width="2"/>' for i in range(21))
grid+=''.join(f'<line x1="0" y1="{470+d}" x2="840" y2="{470+d}" stroke="#ffffff1c" stroke-width="2"/>' for d in [12,30,55,90,135,200])
# tornello (porta girevole) al centro
tx, ty = 420, 330
door = f'''
<ellipse cx="{tx}" cy="{ty+190}" rx="210" ry="44" fill="#00000066"/>
<path d="M{tx-190} {ty-170} L{tx-190} {ty+170} A190 40 0 0 0 {tx} {ty+210} L{tx} {ty-130} A190 40 0 0 1 {tx-190} {ty-170} Z" fill="{R}" opacity=".22"/>
<path d="M{tx+190} {ty-170} L{tx+190} {ty+170} A190 40 0 0 1 {tx} {ty+210} L{tx} {ty-130} A190 40 0 0 0 {tx+190} {ty-170} Z" fill="{B}" opacity=".22"/>
<ellipse cx="{tx}" cy="{ty-170}" rx="190" ry="40" fill="#151c33" stroke="{INK}" stroke-width="5"/>
<ellipse cx="{tx}" cy="{ty-170}" rx="150" ry="28" fill="none" stroke="#ffffff30" stroke-width="3"/>
<path d="M{tx-190} {ty+170} A190 40 0 0 0 {tx+190} {ty+170}" fill="none" stroke="{INK}" stroke-width="5"/>
<line x1="{tx-190}" y1="{ty-170}" x2="{tx-190}" y2="{ty+170}" stroke="{INK}" stroke-width="5"/>
<line x1="{tx+190}" y1="{ty-170}" x2="{tx+190}" y2="{ty+170}" stroke="{INK}" stroke-width="5"/>
<line x1="{tx}" y1="{ty-130}" x2="{tx}" y2="{ty+210}" stroke="{INK}" stroke-width="7"/>
<line x1="{tx-110}" y1="{ty-160}" x2="{tx-110}" y2="{ty+200}" stroke="{INK}" stroke-width="3" opacity=".7"/>
<line x1="{tx+110}" y1="{ty-160}" x2="{tx+110}" y2="{ty+200}" stroke="{INK}" stroke-width="3" opacity=".7"/>
<rect x="{tx-30}" y="{ty-205}" width="60" height="22" rx="4" fill="#2a2f45" stroke="#000" stroke-width="3"/>
<circle cx="{tx}" cy="{ty-194}" r="6" fill="{INK}"/>
<path d="M{tx-150} {ty+60} C{tx-120} {ty+110} {tx-60} {ty+130} {tx-10} {ty+132}" fill="none" stroke="{R}" stroke-width="8" stroke-linecap="round"/>
<path d="M{tx-22} {ty+120} L{tx-2} {ty+132} L{tx-22} {ty+146}" fill="none" stroke="{R}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M{tx+150} {ty-40} C{tx+120} {ty+10} {tx+60} {ty+30} {tx+10} {ty+32}" fill="none" stroke="{B}" stroke-width="8" stroke-linecap="round"/>
<path d="M{tx+22} {ty+20} L{tx+2} {ty+32} L{tx+22} {ty+46}" fill="none" stroke="{B}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
'''
# proiettile che torna indietro (scia blu) verso il foro nel vetro
bullet = f'''
<path d="M612 150 Q690 140 770 128" stroke="{B}" stroke-width="5" stroke-dasharray="4 10" fill="none" stroke-linecap="round" opacity=".9"/>
<g transform="translate(770 126) rotate(-8)"><path d="M0 -9 L26 -9 Q40 0 26 9 L0 9 Z" fill="#c9a24a" stroke="#000" stroke-width="3"/><rect x="-14" y="-9" width="16" height="18" fill="#9b7a32" stroke="#000" stroke-width="3"/></g>
'''
svg = f'''<svg width="828" height="688" viewBox="0 0 840 700" role="img" aria-label="Porta girevole metà rossa e metà blu tra due clessidre, una con la sabbia che scende e una con la sabbia che sale">
<defs>
<linearGradient id="sky" x1="0" x2="1"><stop offset="0" stop-color="#3a0f16"/><stop offset=".5" stop-color="{N}"/><stop offset="1" stop-color="#0b2a4a"/></linearGradient>
<radialGradient id="halo" cx=".5" cy=".45" r=".6"><stop offset="0" stop-color="#ffffff" stop-opacity=".18"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>
</defs>
<rect width="840" height="700" fill="url(#sky)"/>
<rect width="840" height="700" fill="url(#halo)"/>
<g opacity=".55">
<rect x="30" y="40" width="250" height="300" fill="#ffffff08" stroke="#ffffff40" stroke-width="3"/>
<rect x="560" y="40" width="250" height="300" fill="#ffffff08" stroke="#ffffff40" stroke-width="3"/>
</g>
{crack(150,170,90,R)}{crack(612,150,90,B)}
{bullet}
{grid}
{door}
{hourglass(110, 520, 1.15, R, False)}
{hourglass(730, 520, 1.15, B, True)}
<text x="110" y="660" text-anchor="middle" font-family="Big Shoulders Display" font-weight="900" font-size="30" fill="{R}" letter-spacing="4">AVANTI</text>
<text x="730" y="660" text-anchor="middle" font-family="Big Shoulders Display" font-weight="900" font-size="30" fill="{B}" letter-spacing="4">INDIETRO</text>
</svg>'''
p = dict(
 bg=N, ink=INK, accent='#C9D6F0', bgcss=f'background:radial-gradient(ellipse at 50% 40%, #16224a 0%, {N} 60%, #050a1a 100%);',
 bulbs=[R, '#FFD9A0', B, '#FFD9A0'], glow=0.6,
 frame_css=f'3px solid {INK}', frame_extra=f'outline:2px solid {INK}55; outline-offset:12px;',
 badge='💡 SPIEGATO FACILE', badge_bg='#FFC400', badge_ink='#141414',
 svg=svg, ill_border=f'6px solid {INK}',
 ctx='Kiev · Mumbai · Tallinn · Oslo',
 title=['<span style="color:#E8463A">TE</span>N<span style="color:#3EA6FF">ET</span>'],
 title_css=f"font-family:'Big Shoulders Display';font-weight:900;font-size:210px;letter-spacing:34px;margin-right:-34px;color:{INK};text-shadow:0 6px 0 #000;",
 teaser='Armi che tornano indietro nel tempo<br>e un mondo da salvare prima che sia troppo tardi.',
 date='LUNEDÌ 9 NOVEMBRE · ORE 17:30', date_col='#FFC400',
 cred='Un film intero spiegato facile in 2 minuti · Prima visione',
)
open('/tmp/claude-0/storie/tenet.html','w').write(page(p))
