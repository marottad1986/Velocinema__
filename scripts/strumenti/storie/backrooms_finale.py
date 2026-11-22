import sys, math; sys.path.insert(0,'/tmp/claude-0/storie/gen'); from base import *; from backrooms_comune import *
# Storia dello Short «Backrooms: il finale in 2 minuti». Stessa famiglia grafica del lungo: pianta dei livelli in sezione,
# uno sotto l'altro, collegati da scale e varchi, con un'uscita luminosa in fondo.
lv=[  # (y, altezza, parete, pavimento, nome)
 (40,140,'#cdb85a','#8f7a3a','LIVELLO 0'),
 (200,140,'#8e948c','#5d625a','LIVELLO 1'),
 (360,140,'#7a4a34','#4a2c1e','LIVELLO 2'),
 (520,140,'#3a3d48','#24262e','LIVELLO 3'),
]
X0,X1=70,770
def room(y,h,wall,floor,name,i):
    s=f'<rect x="{X0}" y="{y}" width="{X1-X0}" height="{h}" fill="{wall}" stroke="#14120a" stroke-width="5"/>'
    s+=f'<rect x="{X0}" y="{y+h-18}" width="{X1-X0}" height="18" fill="{floor}" stroke="#14120a" stroke-width="3"/>'
    # tramezzi che dividono il livello in stanze (con varchi)
    for k,x in enumerate((230,420,600)):
        if (k+i)%3==1: s+=f'<rect x="{x}" y="{y}" width="10" height="{h-70}" fill="#14120a" opacity=".85"/>'
        else: s+=f'<rect x="{x}" y="{y}" width="10" height="{h-18}" fill="#14120a" opacity=".85"/><rect x="{x-14}" y="{y+h-80}" width="38" height="62" fill="#14120a" opacity=".55"/>'
    if i==0:  # carta da parati gialla a righe, neon, moquette bagnata
        s+=''.join(f'<line x1="{x}" y1="{y+4}" x2="{x}" y2="{y+h-18}" stroke="#a8923e" stroke-width="2" opacity=".7"/>' for x in range(X0+14,X1,22))
        s+=''.join(f'<rect x="{x}" y="{y+4}" width="60" height="8" fill="#fffbe0" stroke="#d8d2a0" stroke-width="1"/><polygon points="{x-20},{y+12} {x+80},{y+12} {x+100},{y+90} {x-40},{y+90}" fill="#fffbe0" opacity=".12"/>' for x in (120,300,490,660) if x!=490)
        s+=f'<rect x="490" y="{y+4}" width="60" height="8" fill="#6f6c48"/>'
        s+=''.join(f'<ellipse cx="{x}" cy="{y+h-12}" rx="{r}" ry="4" fill="#4d4320" opacity=".9"/>' for x,r in ((160,40),(380,30),(640,50)))
    if i==1:  # parcheggio di cemento: pilastri, pozzanghere, lampade
        s+=''.join(f'<rect x="{x}" y="{y}" width="24" height="{h-18}" fill="#a3a99f" stroke="#14120a" stroke-width="3"/><line x1="{x}" y1="{y+h-50}" x2="{x+24}" y2="{y+h-50}" stroke="#d8c25a" stroke-width="6"/>' for x in (130,330,520,700))
        s+=''.join(f'<ellipse cx="{x}" cy="{y+h-10}" rx="{r}" ry="4" fill="#bcd0d8" opacity=".6"/>' for x,r in ((250,36),(460,28),(620,40)))
        s+=''.join(f'<circle cx="{x}" cy="{y+14}" r="7" fill="#e8f0d8" stroke="#14120a" stroke-width="2"/><circle cx="{x}" cy="{y+14}" r="22" fill="#e8f0d8" opacity=".15"/>' for x in (230,430,610))
    if i==2:  # tubi, vapore, condotti
        for yy,c in ((y+18,'#a8643e'),(y+34,'#8a5032'),(y+50,'#b97a4a')):
            s+=f'<rect x="{X0}" y="{yy}" width="{X1-X0}" height="10" fill="{c}" stroke="#14120a" stroke-width="2"/>'
        s+=''.join(f'<rect x="{x}" y="{y+14}" width="14" height="50" fill="#6e3e28" stroke="#14120a" stroke-width="2"/>' for x in (160,350,540,720))
        s+=''.join(f'<circle cx="{x+k*8}" cy="{y+76-k*6}" r="{6+k*3}" fill="#e8e0d0" opacity="{0.3-k*0.06:.2f}"/>' for x in (290,610) for k in range(4))
        s+=''.join(f'<circle cx="{x}" cy="{y+h-30}" r="5" fill="#ff8a4a"/><circle cx="{x}" cy="{y+h-30}" r="16" fill="#ff8a4a" opacity=".2"/>' for x in (120,470))
    if i==3:  # buio, solo luci d'emergenza e l'uscita
        s+=''.join(f'<rect x="{x}" y="{y+10}" width="16" height="8" fill="#ff4a4a"/><circle cx="{x+8}" cy="{y+14}" r="20" fill="#ff4a4a" opacity=".15"/>' for x in (110,300,480))
    s+=f'<rect x="{X0+10}" y="{y+h-46}" width="120" height="24" fill="#14120a" opacity=".75"/><text x="{X0+70}" y="{y+h-27}" text-anchor="middle" font-family="VT323" font-size="24" fill="{NEON}">{name}</text>'
    return s
rooms=''.join(room(*l,i) for i,l in enumerate(lv))
# scale e varchi tra i livelli
def stair(x,y_top,y_bot,flip=False):
    n=8; dx=(-1 if flip else 1)*12; s=''
    for k in range(n):
        yy=y_top+ (y_bot-y_top)*k/n
        s+=f'<rect x="{x+dx*k:.0f}" y="{yy:.0f}" width="34" height="{(y_bot-y_top)/n+1:.0f}" fill="#d9cf9a" stroke="#14120a" stroke-width="2"/>'
    return s
links=(f'<rect x="640" y="160" width="60" height="44" fill="#14120a"/>'+stair(640,170,322)+
 f'<rect x="260" y="320" width="60" height="44" fill="#14120a"/>'+stair(300,330,482,True)+
 f'<rect x="560" y="480" width="60" height="44" fill="#14120a"/>'+''.join(f'<line x1="574" y1="{486+k*20}" x2="606" y2="{486+k*20}" stroke="#d9cf9a" stroke-width="4"/>' for k in range(8))+
 '<line x1="572" y1="480" x2="572" y2="642" stroke="#d9cf9a" stroke-width="4"/><line x1="608" y1="480" x2="608" y2="642" stroke="#d9cf9a" stroke-width="4"/>')
# uscita luminosa nel livello più basso
ex=(f'<ellipse cx="690" cy="600" rx="150" ry="110" fill="url(#exitglow)"/>'
 f'<rect x="660" y="560" width="62" height="82" fill="#ffffff" stroke="#14120a" stroke-width="4"/>'
 f'<path d="M660 560 L638 568 L638 646 L660 642 Z" fill="#c9c2a0" stroke="#14120a" stroke-width="3"/>'
 f'<polygon points="660,642 722,642 770,660 600,660" fill="#fffbe0" opacity=".55"/>'
 f'<rect x="664" y="538" width="54" height="16" fill="#123a1e" stroke="#14120a" stroke-width="2"/><text x="691" y="551" text-anchor="middle" font-family="VT323" font-size="17" fill="#8dff9a">USCITA</text>'
 + ''.join(f'<line x1="691" y1="600" x2="{691+120*math.cos(math.radians(a)):.0f}" y2="{600+90*math.sin(math.radians(a)):.0f}" stroke="#fffbe0" stroke-width="2" opacity=".25"/>' for a in range(150,390,20)))
# terra e roccia attorno alla sezione
earth=''.join(f'<circle cx="{(i*67)%840}" cy="{(i*43)%700}" r="{2+i%4}" fill="#3a3418" opacity=".7"/>' for i in range(120))
# frecce tratteggiate del percorso
path='<path d="M150 90 C300 110 600 120 660 180 S300 300 290 340 S560 450 590 500 S660 590 690 600" fill="none" stroke="#FFC400" stroke-width="4" stroke-dasharray="10 10" opacity=".9"/>'
svg=f'''<svg width="828" height="688" viewBox="0 0 840 700" role="img" aria-label="Spaccato verticale di quattro livelli uno sotto l'altro: corridoi gialli con neon, un parcheggio di cemento con pozzanghere, una sala piena di tubi e vapore, un piano buio con luci rosse; scale e varchi li collegano e un percorso tratteggiato porta a una porta luminosa con la scritta uscita">
<defs>
<radialGradient id="exitglow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffffff" stop-opacity=".9"/><stop offset="1" stop-color="#fff6c0" stop-opacity="0"/></radialGradient>
<linearGradient id="soil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2610"/><stop offset="1" stop-color="#0c0b05"/></linearGradient>
</defs>
<rect width="840" height="700" fill="url(#soil)"/>{earth}
{rooms}{links}{path}{ex}
<g font-family="VT323" font-size="26" fill="{YEL}"><text x="790" y="120" text-anchor="middle">▼</text><text x="790" y="280" text-anchor="middle">▼</text><text x="790" y="440" text-anchor="middle">▼</text></g>
</svg>'''
p=page_params(badge='💡 SPIEGATO FACILE', badge_bg='#FFC400', badge_ink='#141414', svg=svg,
 ctx='Sotto il Livello 0',
 sub='IL FINALE', sub_css="font-family:'Big Shoulders Display';font-weight:800;font-size:44px;letter-spacing:12px;",
 teaser="Livello dopo livello, sempre più in basso.<br>Esiste davvero una via d'uscita?",
 date='DOMENICA 29 NOVEMBRE · ORE 17:30', cred='Un film intero in soli 2 minuti · Prima visione')
open('/tmp/claude-0/storie/backrooms_finale.html','w').write(page(p))
