import sys, math; sys.path.insert(0,'/tmp/claude-0/storie/gen'); from base import *
INK='#F3E9D8'; BG='#1A0B08'; RED='#B3261E'; ORA='#E07A2F'; SNOW='#EEF3F7'
flakes=''.join(f'<circle cx="{(i*83)%840}" cy="{(i*47)%700}" r="{1.5+(i%4)*0.9}" fill="{SNOW}" opacity="{0.4+(i%3)*0.2}"/>' for i in range(160))
win=lambda x,y,on: f'<rect x="{x}" y="{y}" width="22" height="30" fill="{"#ffcf73" if on else "#2a1d18"}" stroke="#000" stroke-width="2"/>'
hotel_w=''.join(win(230+i*36, 250+j*52, (i*7+j*3)%5!=0) for i in range(11) for j in range(3))
import random
random.seed(7)
N=8; C=75
# labirinto vero (DFS) su griglia 8x8, visto dall'alto e schiacciato in prospettiva
walls=set()
for i in range(N):
    for j in range(N):
        walls.add(('h',i,j)); walls.add(('v',i,j))
seen=set(); st=[(0,0)]; seen.add((0,0))
while st:
    x,y=st[-1]; nb=[(x+dx,y+dy) for dx,dy in((1,0),(-1,0),(0,1),(0,-1)) if 0<=x+dx<N and 0<=y+dy<N and (x+dx,y+dy) not in seen]
    if not nb: st.pop(); continue
    nx,ny=random.choice(nb)
    if nx!=x: walls.discard(('v',max(x,nx),y))
    else: walls.discard(('h',x,max(y,ny)))
    seen.add((nx,ny)); st.append((nx,ny))
segs=[]
for k,i,j in walls:
    if k=='h' and j>0: segs.append((i*C,j*C,(i+1)*C,j*C))
    if k=='v' and i>0: segs.append((i*C,j*C,i*C,(j+1)*C))
segs+= [(0,0,N*C,0),(0,N*C,N*C,N*C),(0,0,0,N*C),(N*C,0,N*C,N*C)]
hedge=''.join(f'<line x1="{a}" y1="{b}" x2="{c}" y2="{d}" stroke="#1f3a26" stroke-width="30" stroke-linecap="square"/>' for a,b,c,d in segs)
cap=''.join(f'<line x1="{a}" y1="{b-6}" x2="{c}" y2="{d-6}" stroke="#f4f8fb" stroke-width="12" stroke-linecap="round"/>' for a,b,c,d in segs)
maze=f'<g transform="translate(420 610) scale(1.05 0.26) translate({-N*C/2} {-N*C/2})"><rect x="-20" y="-20" width="{N*C+40}" height="{N*C+40}" fill="#cfd9e1"/>{hedge}{cap}</g>'
pines=''.join(f'<g transform="translate({x} {y}) scale({sc})"><path d="M0 -90 L32 -30 L18 -30 L42 10 L-42 10 L-18 -30 L-32 -30 Z" fill="#163020" stroke="#000" stroke-width="3"/><path d="M0 -90 L14 -64 L-14 -64 Z M-10 -30 L10 -30 L18 -16 L-18 -16 Z" fill="#fff"/><rect x="-5" y="10" width="10" height="14" fill="#2a1a10"/></g>' for x,y,sc in [(60,500,1.1),(120,490,0.8),(780,500,1.1),(720,488,0.85),(30,470,0.7),(810,470,0.7)])
gaps=''
svg=f'''<svg width="828" height="688" viewBox="0 0 840 700" role="img" aria-label="Un grande albergo isolato tra montagne innevate durante una tormenta, con un labirinto di siepi coperto di neve davanti">
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d1420"/><stop offset=".7" stop-color="#2a3446"/><stop offset="1" stop-color="#55606f"/></linearGradient>
<radialGradient id="warm" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffcf73" stop-opacity=".35"/><stop offset="1" stop-color="#ffcf73" stop-opacity="0"/></radialGradient>
</defs>
<rect width="840" height="700" fill="url(#sky)"/>
<path d="M0 330 L120 150 L200 260 L320 90 L430 240 L520 130 L640 280 L740 160 L840 300 L840 520 L0 520 Z" fill="#c8d3dc" stroke="#000" stroke-width="4"/>
<path d="M120 150 L150 200 L135 205 L160 240 L105 175 Z M320 90 L355 150 L335 150 L370 200 L300 125 Z M520 130 L548 180 L530 178 L555 215 L505 158 Z M740 160 L768 210 L750 208 L775 245 L725 185 Z" fill="#ffffff"/>
<path d="M0 420 L840 420 L840 520 L0 520 Z" fill="#b7c3cd"/><path d="M395 420 L445 420 L520 520 L320 520 Z" fill="#e6edf2"/>
<!-- albergo -->
<ellipse cx="420" cy="330" rx="320" ry="140" fill="url(#warm)"/>
<rect x="210" y="230" width="420" height="190" fill="#5a3226" stroke="#000" stroke-width="5"/>
<path d="M190 232 L420 160 L650 232 Z" fill="#2e1712" stroke="#000" stroke-width="5"/>
<path d="M200 232 L420 172 L640 232" fill="none" stroke="{SNOW}" stroke-width="8" stroke-linecap="round"/>
<rect x="130" y="290" width="90" height="130" fill="#4a281e" stroke="#000" stroke-width="5"/>
<rect x="620" y="290" width="90" height="130" fill="#4a281e" stroke="#000" stroke-width="5"/>
{''.join(win(145+i*26,310+j*46,(i+j)%3!=0) for i in range(3) for j in range(2))}
{''.join(win(635+i*26,310+j*46,(i+j)%2==0) for i in range(3) for j in range(2))}
{hotel_w}
<rect x="395" y="372" width="50" height="48" fill="#ffcf73" stroke="#000" stroke-width="4"/>
<rect x="380" y="362" width="80" height="12" fill="#2e1712" stroke="#000" stroke-width="3"/>
<!-- neve a terra e labirinto -->
<path d="M0 520 L840 520 L840 700 L0 700 Z" fill="#dfe7ed"/>
{maze}
<path d="M0 520 Q210 505 420 520 Q630 535 840 515" fill="none" stroke="#ffffff" stroke-width="10"/>{pines}
{flakes}
<g stroke="#ffffff" stroke-width="2" opacity=".5">{''.join(f'<line x1="{(i*131)%840}" y1="{(i*71)%700}" x2="{(i*131)%840+40}" y2="{(i*71)%700+14}"/>' for i in range(30))}</g>
</svg>'''
p=dict(bg=BG, ink=INK, accent=ORA, bgcss=f'background:radial-gradient(ellipse at 50% 40%, #3b160f 0%, {BG} 65%, #070302 100%);',
 bulbs=['#FFD58A','#FFD58A',RED], glow=0.55,
 frame_css=f'4px solid {ORA}', frame_extra=f'outline:2px solid {INK}66; outline-offset:12px;',
 badge='🎬 FILM IN 2 MINUTI', badge_bg='#FFC400', badge_ink='#141414', svg=svg, ill_border=f'6px solid {INK}',
 ctx='Montagne del Colorado', ctx_font="'Playfair Display'",
 title=['SHINING'], title_css=f"font-family:'Playfair Display';font-weight:900;font-size:150px;letter-spacing:12px;margin-right:-12px;color:{INK};text-shadow:6px 6px 0 {RED};",
 teaser='Tutto l\'inverno da soli, isolati dalla neve.<br>Ma l\'albergo non è vuoto come sembra.',
 date='VENERDÌ 13 NOVEMBRE · ORE 17:30', date_col='#FFC400', cred='Un film intero in soli 2 minuti · Prima visione')
open('/tmp/claude-0/storie/shining.html','w').write(page(p))
