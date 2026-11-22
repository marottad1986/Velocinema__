import sys, random; sys.path.insert(0,'/tmp/claude-0/storie/gen'); from base import *
# Storie dei tre episodi verticali di Ritorno al futuro (Spiegato facile), settimana 23-29 novembre 2026.
INK='#F4EEE2'; BG='#0C0820'; NEON='#5CF0FF'; PINK='#FF4FB0'; YEL='#F5C23A'
random.seed(7)
def stars(n=70,h=420):
    return ''.join(f'<circle cx="{random.uniform(0,828):.0f}" cy="{random.uniform(0,h):.0f}" r="{random.choice([1,1.5,2,2.5])}" fill="#fff" opacity="{random.uniform(.3,.9):.2f}"/>' for _ in range(n))
def scie(y0,col=YEL):
    return f'<g fill="none" stroke="{col}" stroke-width="7" stroke-dasharray="26 18" stroke-linecap="round"><path d="M80 {y0} C 260 {y0-120}, 520 {y0-40}, 760 {y0-210}"/><path d="M80 {y0+40} C 300 {y0-60}, 560 {y0+10}, 770 {y0-150}" opacity=".7"/></g>'
grid=''.join(f'<line x1="{x}" y1="0" x2="{x}" y2="688" stroke="#5CF0FF" stroke-opacity=".06"/>' for x in range(0,828,36))+''.join(f'<line x1="0" y1="{y}" x2="828" y2="{y}" stroke="#5CF0FF" stroke-opacity=".06"/>' for y in range(0,688,36))

def ill1():
    win=''.join(f'<rect x="{x}" y="{y}" width="22" height="30" rx="3" fill="{random.choice([YEL,"#FFE7A0","#2A1F5E","#2A1F5E"])}" stroke="#000" stroke-width="3"/>' for x in (120,170,600,650,700) for y in (470,520))
    return f'''<svg width="828" height="688" viewBox="0 0 828 688"><defs><radialGradient id="sk" cx=".5" cy=".2" r=".9"><stop offset="0" stop-color="#4A2C8A"/><stop offset=".6" stop-color="#1C1240"/><stop offset="1" stop-color="#0C0820"/></radialGradient>
<radialGradient id="fl" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="{NEON}" stop-opacity="0"/></radialGradient></defs>
<rect width="828" height="688" fill="url(#sk)"/>{grid}{stars()}
<circle cx="470" cy="120" r="150" fill="url(#fl)" opacity=".55"/>
<path d="M470 0 L440 70 L478 78 L430 170 L470 176 L452 232" fill="none" stroke="#fff" stroke-width="9" stroke-linejoin="round"/>
<path d="M470 0 L440 70 L478 78 L430 170 L470 176 L452 232" fill="none" stroke="{NEON}" stroke-width="20" stroke-opacity=".35" stroke-linejoin="round"/>
<g stroke="#000" stroke-width="4">
<rect x="90" y="440" width="140" height="190" fill="#3A2A6E"/><rect x="570" y="440" width="180" height="190" fill="#3A2A6E"/>
<polygon points="90,440 160,400 230,440" fill="#2A1F5E"/>{win}
<rect x="300" y="330" width="230" height="300" fill="#4B3A86"/>
<rect x="340" y="240" width="150" height="100" fill="#5A4898"/><polygon points="330,240 415,175 500,240" fill="#2A1F5E"/>
<circle cx="415" cy="292" r="40" fill="#FFF3C4"/>
<line x1="415" y1="292" x2="415" y2="262" stroke-width="5"/><line x1="415" y1="292" x2="436" y2="300" stroke-width="5"/>
<rect x="330" y="400" width="40" height="60" fill="{YEL}"/><rect x="395" y="400" width="40" height="60" fill="{YEL}"/><rect x="460" y="400" width="40" height="60" fill="{YEL}"/>
<rect x="380" y="520" width="70" height="110" fill="#1A1238"/>
</g>
<rect x="0" y="628" width="828" height="60" fill="#140E2E" stroke="#000" stroke-width="4"/>
<path d="M452 232 C 470 400, 600 520, 828 600" fill="none" stroke="{NEON}" stroke-width="4" stroke-dasharray="6 8"/>
{scie(640)}
<g transform="translate(600,500) rotate(-8)"><rect width="170" height="120" fill="#F3E6C8" stroke="#000" stroke-width="4"/><rect x="12" y="12" width="146" height="80" fill="#C9B48A" opacity=".55"/><rect x="12" y="12" width="146" height="80" fill="none" stroke="#7A6A50" stroke-width="2"/><text x="85" y="110" text-anchor="middle" font-family="Figtree" font-weight="800" font-size="14" fill="#7A6A50">1955</text></g>
</svg>'''

def ill2():
    rows=''.join(f'<line x1="{x0}" y1="{y}" x2="{x0+150}" y2="{y}" stroke="#7A6A50" stroke-width="4" stroke-linecap="round" opacity=".8"/>' for x0 in (250,430) for y in range(420,600,22))
    return f'''<svg width="828" height="688" viewBox="0 0 828 688"><defs><radialGradient id="sk2" cx=".5" cy=".3" r=".9"><stop offset="0" stop-color="#3A2470"/><stop offset="1" stop-color="#0C0820"/></radialGradient>
<radialGradient id="bk" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="{YEL}" stop-opacity=".8"/><stop offset="1" stop-color="{YEL}" stop-opacity="0"/></radialGradient></defs>
<rect width="828" height="688" fill="url(#sk2)"/>{grid}{stars(50,250)}
<g stroke="#000" stroke-width="4">
<rect x="40" y="160" width="120" height="200" fill="#4B3A86"/><polygon points="40,160 100,110 160,160" fill="#2A1F5E"/><circle cx="100" cy="200" r="26" fill="#FFF3C4"/>
<rect x="175" y="230" width="150" height="130" fill="#3A2A6E"/>
<rect x="500" y="120" width="140" height="240" fill="#3A0E2E"/><rect x="650" y="200" width="140" height="160" fill="#2A0A22"/>
</g>
<text x="570" y="190" text-anchor="middle" font-family="Monoton" font-size="34" fill="#FF3B6B" stroke="#FF3B6B" stroke-width="1">CASINO</text>
<rect x="515" y="150" width="110" height="60" fill="none" stroke="#FF3B6B" stroke-width="3" opacity=".8"/>
{''.join(f'<rect x="{x}" y="{y}" width="18" height="24" fill="#FF3B6B" opacity=".7"/>' for x in (520,560,600,665,705,745) for y in (240,290))}
<line x1="414" y1="100" x2="414" y2="370" stroke="{NEON}" stroke-width="4" stroke-dasharray="10 10"/>
<circle cx="414" cy="520" r="300" fill="url(#bk)"/>
<g stroke="#000" stroke-width="5"><path d="M230 400 L414 380 L598 400 L598 640 L414 620 L230 640 Z" fill="#F3E6C8"/>
<line x1="414" y1="380" x2="414" y2="620"/><path d="M220 404 L230 400 L230 640 L220 646 Z" fill="#8A2A2A"/></g>
{rows}
<text x="322" y="410" text-anchor="middle" font-family="Oswald" font-weight="700" font-size="22" fill="#8A2A2A">1950–2000</text>
{scie(380)}
</svg>'''

def ill3():
    return f'''<svg width="828" height="688" viewBox="0 0 828 688"><defs><linearGradient id="sk3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2A1A50"/><stop offset=".55" stop-color="#7A3A4A"/><stop offset="1" stop-color="#D98A4A"/></linearGradient></defs>
<rect width="828" height="688" fill="url(#sk3)"/>{stars(40,200)}
<circle cx="640" cy="300" r="70" fill="#F5C23A" opacity=".85"/>
<path d="M0 360 L120 300 L230 340 L330 280 L330 688 L0 688 Z" fill="#5A2E3A" stroke="#000" stroke-width="4"/>
<path d="M560 300 L680 340 L828 290 L828 688 L560 688 Z" fill="#5A2E3A" stroke="#000" stroke-width="4"/>
<rect x="330" y="420" width="230" height="268" fill="#1A0E1E"/>
<g stroke="#000" stroke-width="4"><rect x="0" y="380" width="470" height="18" fill="#8A5A3A"/>
{''.join(f'<line x1="{x}" y1="398" x2="{x+30}" y2="470" stroke="#6A4028" stroke-width="8"/><line x1="{x+30}" y1="398" x2="{x}" y2="470" stroke="#6A4028" stroke-width="8"/>' for x in (350,400))}
<path d="M470 380 L500 372 L488 398 L470 398 Z" fill="#8A5A3A"/></g>
<g stroke="#000" stroke-width="4" transform="translate(70,270)">
<rect x="0" y="40" width="200" height="70" rx="10" fill="#2E2A3A"/><rect x="150" y="0" width="70" height="110" fill="#3E3A4E"/>
<rect x="30" y="10" width="34" height="34" fill="#2E2A3A"/><path d="M20 10 L74 10 L64 -10 L30 -10 Z" fill="#2E2A3A"/>
<circle cx="40" cy="112" r="22" fill="#B23A3A"/><circle cx="110" cy="112" r="22" fill="#B23A3A"/><circle cx="185" cy="104" r="30" fill="#B23A3A"/>
<rect x="160" y="14" width="40" height="26" fill="{YEL}"/></g>
<g fill="#E9E2D6" opacity=".75"><circle cx="117" cy="230" r="22"/><circle cx="140" cy="190" r="30"/><circle cx="180" cy="150" r="38"/><circle cx="230" cy="110" r="44"/></g>
{scie(370)}
<g stroke="#000" stroke-width="5"><path d="M600 688 L600 520 Q660 460 720 520 L720 688 Z" fill="#9A9488"/></g>
<path d="M630 560 L690 560 M660 530 L660 610" stroke="#5A564E" stroke-width="8" stroke-linecap="round"/>
<text x="660" y="650" text-anchor="middle" font-family="IM Fell English SC" font-size="28" fill="#3A362E">1885</text>
</svg>'''

V=[('ritorno_al_futuro_parte_1', ill1(), 'Hill Valley · 1985 → 1955', 'PARTE I', 'Un viaggio nel passato che può cancellarti…<br>e una foto che comincia a sbiadire.', 'LUNEDÌ 23 NOVEMBRE · ORE 17:30'),
   ('ritorno_al_futuro_parte_2', ill2(), 'Hill Valley · 2015 → 1985 → 1955', 'PARTE II', 'Un libro del futuro finisce nelle mani sbagliate…<br>e il presente non è più lo stesso.', 'MARTEDÌ 24 NOVEMBRE · ORE 17:30'),
   ('ritorno_al_futuro_parte_3', ill3(), 'Hill Valley · 1955 → 1885', 'PARTE III', 'Una lapide nel vecchio West…<br>con sopra il nome di un amico.', 'VENERDÌ 27 NOVEMBRE · ORE 17:30')]
for slug, svg, ctx, sub, teaser, date in V:
    p=dict(bg=BG, ink=INK, accent=NEON, bgcss=f'background:radial-gradient(ellipse at 50% 38%, #3A2470 0%, #1C1240 55%, {BG} 100%);',
     bulbs=[PINK,NEON,YEL,'#2A1F5E',PINK,NEON], glow=0.55, frame_css=f'3px double {INK}', frame_extra=f'outline:1px solid {PINK}66; outline-offset:12px;',
     badge='💡 SPIEGATO FACILE', badge_bg=YEL, badge_ink='#141414', svg=svg, ill_border=f'6px solid {PINK}', ill_h=688,
     ctx=ctx, title=['RITORNO AL FUTURO'], title_css=f"font-family:Righteous;font-size:118px;line-height:1;letter-spacing:2px;color:{INK};text-shadow:0 6px 0 #000,0 0 30px {PINK}AA;",
     sub=sub, teaser=teaser, date=date, date_col=YEL, cred='Un film intero spiegato facile in 2 minuti · Prima visione')
    open(f'/tmp/claude-0/storie/{slug}.html','w').write(page(p))
