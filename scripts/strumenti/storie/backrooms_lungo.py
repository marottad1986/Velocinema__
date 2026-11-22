import sys, math; sys.path.insert(0,'/tmp/claude-0/storie/gen'); from base import *; from backrooms_comune import *
# Storia del video lungo YouTube «Backrooms spiegato: cosa sono e il finale del film».
# Corridoio giallo infinito in prospettiva: carta da parati, moquette bagnata, neon (uno sfarfalla), porta socchiusa illuminata.
W,H=840,700; VX,VY=420,330
def P(x,y,z):  # punto (x,y) della sezione vicina portato alla profondità z (0 vicino, 1 lontanissimo)
    s=1/(1+z*7)
    return (VX+(x-VX)*s, VY+(y-VY)*s)
def pts(*a): return ' '.join(f'{x:.1f},{y:.1f}' for x,y in a)
L,R,T,B=-40,880,-30,760  # sezione vicina (oltre i bordi)
ZEND=1.0
def quad(x0,y0,x1,y1,z0,z1,side):
    if side=='left':  return pts(P(L,y0,z0),P(L,y0,z1),P(L,y1,z1),P(L,y1,z0))
out=[]
# pareti: fasce di carta da parati tra profondità successive, alternando tono
zs=[i*0.05 for i in range(21)]
for i in range(20):
    z0,z1=zs[i],zs[i+1]
    c=['#cdb85a','#c4ae50'][i%2]
    out.append(f'<polygon points="{pts(P(L,T,z0),P(L,T,z1),P(L,B,z1),P(L,B,z0))}" fill="{c}"/>')
    out.append(f'<polygon points="{pts(P(R,T,z0),P(R,T,z1),P(R,B,z1),P(R,B,z0))}" fill="{c}"/>')
    out.append(f'<polygon points="{pts(P(L,T,z0),P(L,T,z1),P(R,T,z1),P(R,T,z0))}" fill="{["#d9cf9a","#d2c78e"][i%2]}"/>')
    out.append(f'<polygon points="{pts(P(L,B,z0),P(L,B,z1),P(R,B,z1),P(R,B,z0))}" fill="{["#8f7a3a","#86723a"][i%2]}"/>')
walls=''.join(out)
# motivo della carta da parati: righe verticali sottili e piccoli rombi
pat=[]
for k in range(80):
    z=k*0.0125
    for X in (L,R):
        a=P(X,T,z); b=P(X,B,z)
        pat.append(f'<line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}" stroke="#a8923e" stroke-width="{max(0.4,2.2/(1+z*7)):.2f}" opacity=".7"/>')
    if k%2==0:
        for X in (L,R):
            for yy in range(40,700,90):
                c=P(X,yy+(k%4)*22,z+0.006); s=6/(1+z*7)
                pat.append(f'<path d="M{c[0]:.1f} {c[1]-s:.1f} l{s*0.5:.1f} {s:.1f} l{-s*0.5:.1f} {s:.1f} l{-s*0.5:.1f} {-s:.1f} z" fill="#9c8636" opacity=".8"/>')
# battiscopa e zoccolatura
for X in (L,R):
    a,b=P(X,690,0),P(X,690,ZEND); c,d=P(X,B,0),P(X,B,ZEND)
    pat.append(f'<polygon points="{pts(a,b,d,c)}" fill="#7d6a30" opacity=".85"/>')
    a,b=P(X,420,0),P(X,420,ZEND)
    pat.append(f'<line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}" stroke="#8a7634" stroke-width="5"/>')
# griglia del controsoffitto
grid=[]
for k in range(1,40):
    z=k*0.025; a,b=P(L,T,z),P(R,T,z)
    grid.append(f'<line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}" stroke="#a49a66" stroke-width="{max(0.5,3/(1+z*7)):.2f}"/>')
for x in range(L,R+1,115):
    a,b=P(x,T,0),P(x,T,ZEND)
    grid.append(f'<line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}" stroke="#a49a66" stroke-width="2"/>')
# neon a soffitto: pannelli tra due righe della griglia; quello a z=0.15 sfarfalla
lights=[]
for z0,flick in [(0.0,False),(0.15,True),(0.3,False),(0.45,False),(0.6,False),(0.75,False),(0.9,False)]:
    for xl in (190,535):
        q=pts(P(xl,T,z0+0.025),P(xl+115,T,z0+0.025),P(xl+115,T,z0+0.075),P(xl,T,z0+0.075))
        if flick and xl==535:
            lights.append(f'<polygon points="{q}" fill="#6f6c48" stroke="#4d4a2e" stroke-width="2"/>')
            c=P(xl+57,T,z0+0.05)
            lights.append(f'<polygon points="{q}" fill="#fffbe0" opacity=".35"/>')
            lights.append(''.join(f'<line x1="{c[0]-30+j*14:.0f}" y1="{c[1]+6:.0f}" x2="{c[0]-34+j*14:.0f}" y2="{c[1]+20+j%2*8:.0f}" stroke="#fffbe0" stroke-width="2" opacity=".6"/>' for j in range(5)))
        else:
            c=P(xl+57,T,z0+0.05); s=1/(1+(z0+0.05)*7)
            lights.append(f'<ellipse cx="{c[0]:.1f}" cy="{c[1]+18*s:.1f}" rx="{150*s:.1f}" ry="{70*s:.1f}" fill="url(#neonglow)"/>')
            lights.append(f'<polygon points="{q}" fill="#fffbe0" stroke="#d8d2a0" stroke-width="2"/>')
            lights.append(f'<polygon points="{q}" fill="none" stroke="#ffffff" stroke-width="1" opacity=".6"/>')
# aperture laterali (vani scuri senza porta) sulle pareti
gaps=[]
for X,z0 in [(L,0.12),(R,0.22),(L,0.4),(R,0.55),(L,0.7)]:
    gaps.append(f'<polygon points="{pts(P(X,180,z0),P(X,180,z0+0.06),P(X,B,z0+0.06),P(X,B,z0))}" fill="#3a3418" stroke="#2a2410" stroke-width="2"/>')
    gaps.append(f'<polygon points="{pts(P(X,180,z0+0.045),P(X,180,z0+0.06),P(X,B,z0+0.06),P(X,B,z0+0.045))}" fill="#594e22"/>')
# fondo: parete con la porta socchiusa illuminata
fa=P(L,T,ZEND); fb=P(R,B,ZEND)
fw,fh=fb[0]-fa[0], fb[1]-fa[1]
dx0=VX-fw*0.12; dw=fw*0.24; dy0=fa[1]+fh*0.32; dh=fh*0.68
door=(f'<rect x="{fa[0]:.1f}" y="{fa[1]:.1f}" width="{fw:.1f}" height="{fh:.1f}" fill="#bfa94e"/>'
 f'<rect x="{dx0:.1f}" y="{dy0:.1f}" width="{dw:.1f}" height="{dh:.1f}" fill="#fffdf0"/>'
 f'<path d="M{dx0+dw*0.38:.1f} {dy0:.1f} L{dx0+dw:.1f} {dy0-dh*0.06:.1f} L{dx0+dw:.1f} {dy0+dh*1.04:.1f} L{dx0+dw*0.38:.1f} {dy0+dh:.1f} Z" fill="#8a7634" stroke="#2a2410" stroke-width="1.5"/>'
 f'<circle cx="{dx0+dw*0.48:.1f}" cy="{dy0+dh*0.55:.1f}" r="1.2" fill="#2a2410"/>')
door_glow=f'<ellipse cx="{VX:.0f}" cy="{dy0+dh*0.5:.0f}" rx="120" ry="90" fill="url(#doorglow)"/>'
# lama di luce dalla porta sulla moquette
spill=f'<polygon points="{pts((dx0,dy0+dh),(dx0+dw*0.38,dy0+dh),(470,700),(330,700))}" fill="url(#spill)"/>'
# moquette bagnata: macchie scure con riflessi dei neon
wet=[]
for (x,z,r) in [(260,0.02,170),(560,0.08,120),(380,0.22,140),(600,0.35,90),(300,0.5,80),(470,0.7,60)]:
    c=P(x,B-10,z); s=1/(1+z*7)
    wet.append(f'<ellipse cx="{c[0]:.1f}" cy="{c[1]:.1f}" rx="{r*s:.1f}" ry="{r*s*0.22:.1f}" fill="#4d4320" opacity=".75"/>')
    wet.append(f'<ellipse cx="{c[0]-r*s*0.2:.1f}" cy="{c[1]-r*s*0.03:.1f}" rx="{r*s*0.35:.1f}" ry="{r*s*0.04:.1f}" fill="#fffbe0" opacity=".35"/>')
# fibra della moquette
fib=''.join(f'<circle cx="{(i*53)%840}" cy="{600+(i*29)%100}" r="1.4" fill="#6b5a28" opacity=".7"/>' for i in range(90))
# macchie d'umidità sulle pareti
damp=''.join(f'<ellipse cx="{x}" cy="{y}" rx="{r}" ry="{r*1.6:.0f}" fill="#6f6a2e" opacity=".28"/>' for x,y,r in [(40,520,40),(800,180,30),(110,140,22),(760,560,36)])
svg=f'''<svg width="828" height="688" viewBox="0 0 840 700" role="img" aria-label="Un corridoio giallo che sembra non finire: carta da parati giallastra a righe, moquette umida con pozze scure, pannelli al neon nel controsoffitto, uno dei quali sfarfalla, e in fondo una porta socchiusa da cui esce una luce bianca">
<defs>
<radialGradient id="neonglow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fffbe0" stop-opacity=".55"/><stop offset="1" stop-color="#fffbe0" stop-opacity="0"/></radialGradient>
<radialGradient id="doorglow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffffff" stop-opacity=".9"/><stop offset="1" stop-color="#fff6c0" stop-opacity="0"/></radialGradient>
<linearGradient id="spill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffbe0" stop-opacity=".7"/><stop offset="1" stop-color="#fffbe0" stop-opacity="0"/></linearGradient>
<linearGradient id="shade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1e2a10" stop-opacity=".55"/><stop offset=".25" stop-color="#1e2a10" stop-opacity="0"/><stop offset=".75" stop-color="#1e2a10" stop-opacity="0"/><stop offset="1" stop-color="#1e2a10" stop-opacity=".55"/></linearGradient>
<radialGradient id="vig" cx=".5" cy=".47" r=".7"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#0d1206" stop-opacity=".7"/></radialGradient>
</defs>
{walls}{''.join(pat)}{damp}{''.join(gaps)}{''.join(grid)}
{door}{door_glow}{''.join(wet)}{fib}{spill}{''.join(lights)}
<rect width="840" height="700" fill="url(#shade)"/>
<rect width="840" height="700" fill="url(#vig)"/>
</svg>'''
p=page_params(badge='▶ NUOVO VIDEO SU YOUTUBE', badge_bg='#FFC400', badge_ink='#141414', svg=svg,
 ctx='Livello 0, il ronzio dei neon',
 sub='COSA SONO E IL FINALE', sub_css="font-family:'Big Shoulders Display';font-weight:800;font-size:40px;letter-spacing:8px;",
 teaser="Un passo sbagliato e restano solo corridoi gialli.<br>Da dove vengono? E come finisce il film?",
 date='SABATO 28 NOVEMBRE · ORE 17:30', cred='Cosa sono e il finale spiegato · Solo su YouTube, link nel profilo')
open('/tmp/claude-0/storie/backrooms_lungo.html','w').write(page(p))
