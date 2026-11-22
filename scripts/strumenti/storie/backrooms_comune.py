# Palette e cornice comuni alle due locandine di Backrooms (lungo YouTube e Short del finale).
INK='#F4EBC2'; BG='#141206'; YEL='#D8C25A'; OCRA='#B8952E'; VERDE='#3C4A2A'; NEON='#F6F2C8'
def page_params(**kw):
    p=dict(bg=BG, ink=INK, accent=YEL, bgcss=f'background:radial-gradient(ellipse at 50% 40%, #3a3412 0%, {BG} 65%, #050402 100%);',
     bulbs=[NEON,NEON,'#8f8a5a',NEON,NEON,NEON,'#5a5636'], glow=0.7, bulb_r=8,
     frame_css=f'4px solid {OCRA}', frame_extra=f'outline:2px solid {NEON}55; outline-offset:12px;',
     ill_border=f'6px solid {INK}', ctx_font="'VT323'", ctx_col=YEL,
     title=['BACKROOMS'], title_css=f"font-family:'Big Shoulders Display';font-weight:900;font-size:150px;letter-spacing:14px;color:{INK};text-shadow:0 0 22px {NEON}99,6px 6px 0 {VERDE};",
     date_col='#FFC400')
    p.update(kw); return p
