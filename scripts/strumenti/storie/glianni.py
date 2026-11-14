import sys, math; sys.path.insert(0,'/tmp/claude-0/storie/gen'); from base import *
INK='#FFF2E0'; BG='#1A0D12'; ORA='#FF8A3D'; PNK='#FF4F8B'
birds=''.join(f'<path d="M{x} {y} q8 -8 16 0 q8 -8 16 0" stroke="#3a1a1a" stroke-width="3" fill="none"/>' for x,y in [(520,90),(580,120),(470,140),(640,80)])
svg=f'''<svg width="828" height="688" viewBox="0 0 840 700" role="img" aria-label="Una strada di provincia al tramonto: un bar d'angolo con l'insegna al neon accesa, un jukebox dietro la vetrina, un motorino parcheggiato con il casco sul sellino e le rondini nel cielo arancione">
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a2a6a"/><stop offset=".55" stop-color="#ff7a45"/><stop offset="1" stop-color="#ffc36b"/></linearGradient>
<radialGradient id="neon" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="{PNK}" stop-opacity=".6"/><stop offset="1" stop-color="{PNK}" stop-opacity="0"/></radialGradient>
<linearGradient id="jb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd36b"/><stop offset="1" stop-color="#ff7a45"/></linearGradient>
</defs>
<rect width="840" height="700" fill="url(#sky)"/>
<circle cx="640" cy="330" r="80" fill="#ffe2a0" opacity=".85"/>{birds}
<path d="M520 360 L580 300 L620 340 L700 280 L760 330 L840 300 L840 420 L520 420 Z" fill="#7a3a4a" opacity=".6"/>
<!-- bar -->
<rect x="40" y="170" width="460" height="400" fill="#e9c9a0" stroke="#000" stroke-width="5"/>
<rect x="40" y="170" width="460" height="30" fill="#b2533a" stroke="#000" stroke-width="4"/>
<rect x="80" y="230" width="380" height="80" rx="10" fill="#2a0f1a" stroke="#000" stroke-width="4"/>
<ellipse cx="270" cy="270" rx="240" ry="80" fill="url(#neon)"/>
<text x="270" y="290" text-anchor="middle" font-family="Pacifico" font-size="54" fill="#ffd6e6" stroke="{PNK}" stroke-width="2">Bar Sport</text>
<rect x="80" y="340" width="230" height="200" fill="#5a2a2a" stroke="#000" stroke-width="5"/>
<rect x="92" y="352" width="206" height="176" fill="#ffd9a0" opacity=".85"/>
<g transform="translate(195 380)"><path d="M-55 150 L-55 30 Q-55 -30 0 -30 Q55 -30 55 30 L55 150 Z" fill="url(#jb)" stroke="#000" stroke-width="4"/>
<path d="M-40 140 L-40 34 Q-40 -14 0 -14 Q40 -14 40 34 L40 140 Z" fill="none" stroke="#fff3c8" stroke-width="5"/>
<rect x="-30" y="40" width="60" height="40" rx="6" fill="#2a0f1a"/>{''.join(f'<line x1="-24" y1="{48+i*8}" x2="24" y2="{48+i*8}" stroke="#ffd36b" stroke-width="3"/>' for i in range(4))}</g>
<rect x="340" y="380" width="110" height="190" fill="#5a2a2a" stroke="#000" stroke-width="5"/><circle cx="436" cy="476" r="5" fill="#ffd36b"/>
<path d="M330 330 L470 330 L460 360 L340 360 Z" fill="#2e8a6a" stroke="#000" stroke-width="4"/>
{''.join(f'<rect x="{344+i*24}" y="330" width="12" height="30" fill="#f4efe2"/>' for i in range(5))}
<!-- marciapiede e strada -->
<rect y="570" width="840" height="30" fill="#b9a089" stroke="#000" stroke-width="4"/>
<rect y="600" width="840" height="100" fill="#4a3a44"/>
{''.join(f'<rect x="{i*120+20}" y="645" width="60" height="8" fill="#f4e6c8"/>' for i in range(7))}
<!-- lampione -->
<rect x="508" y="260" width="10" height="312" fill="#2a2a2a" stroke="#000" stroke-width="2"/><path d="M490 260 L536 260 L526 236 L500 236 Z" fill="#2a2a2a"/><ellipse cx="513" cy="264" rx="20" ry="6" fill="#ffe7a0"/>
<!-- motorino -->
<g transform="translate(650 560)">
<circle cx="-70" cy="0" r="30" fill="#222" stroke="#000" stroke-width="5"/><circle cx="-70" cy="0" r="10" fill="#aaa"/>
<circle cx="70" cy="0" r="30" fill="#222" stroke="#000" stroke-width="5"/><circle cx="70" cy="0" r="10" fill="#aaa"/>
<path d="M-90 -20 Q-80 -60 -20 -60 L30 -60 Q50 -60 60 -40 L80 -20 L40 -14 L-60 -14 Z" fill="#d7363a" stroke="#000" stroke-width="5"/>
<rect x="-40" y="-78" width="70" height="18" rx="9" fill="#2a2a2a" stroke="#000" stroke-width="4"/>
<path d="M60 -40 L80 -110 L100 -110" stroke="#444" stroke-width="7" fill="none" stroke-linecap="round"/>
<circle cx="84" cy="-100" r="10" fill="#ffe7a0" stroke="#000" stroke-width="3"/>
<path d="M-30 -78 Q-30 -118 6 -118 Q42 -118 42 -84 L-30 -78 Z" fill="#f4efe2" stroke="#000" stroke-width="4"/><rect x="-8" y="-108" width="40" height="12" rx="5" fill="#3a6fd0"/>
</g>
</svg>'''
p=dict(bg=BG, ink=INK, accent=ORA, bgcss=f'background:radial-gradient(ellipse at 50% 40%, #3a1a2a 0%, {BG} 65%, #050204 100%);',
 bulbs=[PNK,'#FFE3A6',ORA], glow=0.6,
 frame_css=f'4px solid {PNK}', frame_extra=f'outline:2px solid {ORA}77; outline-offset:12px;',
 badge='🎵 CANZONI IN 2 MINUTI', badge_bg='#FFC400', badge_ink='#141414', svg=svg, ill_border=f'6px solid {INK}',
 ctx='883 · 1995',
 title=['Gli anni'], title_css=f"font-family:Pacifico;font-size:150px;color:{INK};text-shadow:0 0 18px {PNK},0 0 40px {PNK}99;padding:0 20px 10px;margin-bottom:30px;line-height:1.25;",
 teaser='Il bar, i motorini, gli amici di sempre.<br>Perché questa canzone fa venire nostalgia a tutti?',
 date='DOMENICA 22 NOVEMBRE · ORE 10:00', date_col='#FFC400', cred='Una canzone spiegata in 2 minuti · Prima visione')
open('/tmp/claude-0/storie/glianni.html','w').write(page(p))
