import sys, base64; sys.path.insert(0,'/tmp/claude-0/storie/gen'); from base import *
# Storia del video lungo «Ritorno al futuro, la trilogia» (YouTube): l'illustrazione è la miniatura del video (quadrante
# al neon con la piazza e il fulmine, skyline di Hill Valley, l'auto del tempo sul binario), ritagliata.
INK='#F4EEE2'; BG='#0C0820'; NEON='#5CF0FF'; PINK='#FF4FB0'; YEL='#F5C23A'
img=base64.b64encode(open('/tmp/claude-0/storie/raf_ill.png','rb').read()).decode()
svg=f'<svg width="828" height="688" viewBox="0 0 828 688" role="img" aria-label="Quadrante al neon con la torre dell\'orologio colpita dal fulmine, lo skyline notturno e un\'auto argentata sul binario del tempo"><image href="data:image/png;base64,{img}" width="828" height="688"/></svg>'
p=dict(bg=BG, ink=INK, accent=NEON, bgcss=f'background:radial-gradient(ellipse at 50% 38%, #3A2470 0%, #1C1240 55%, {BG} 100%);',
 bulbs=[PINK,NEON,YEL,'#2A1F5E',PINK,NEON], glow=0.55,
 frame_css=f'3px double {INK}', frame_extra=f'outline:1px solid {PINK}66; outline-offset:12px;',
 badge='▶ NUOVO VIDEO SU YOUTUBE', badge_bg=YEL, badge_ink='#141414', svg=svg, ill_border=f'6px solid {PINK}',
 ctx='1885 · 1955 · 1985 · 2015', ctx_font='Figtree',
 title=['RITORNO AL FUTURO'], title_css=f"font-family:Righteous;font-size:118px;line-height:1;letter-spacing:2px;color:{INK};text-shadow:0 6px 0 #000,0 0 30px {PINK}AA;",
 sub='LA TRILOGIA',
 teaser='Tre film, quattro epoche e un passato che si può cambiare.<br>Più i paradossi spiegati.',
 date='VENERDÌ 20 NOVEMBRE · ORE 21:00', date_col=YEL, cred='Spiegato facile · 2 minuti a film · Solo su YouTube, link nel profilo')
open('/tmp/claude-0/storie/raf_trilogia.html','w').write(page(p))
