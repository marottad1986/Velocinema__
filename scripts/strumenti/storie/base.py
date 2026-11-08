import math, json, sys, os
FONTS = open('/tmp/claude-0/storie/fonts/fonts.css').read().replace("src: url(", "src: url(file:///tmp/claude-0/storie/fonts/")

def stopwatch(col, ink):
    # cronometro con 2'
    return f'''<svg width="120" height="132" viewBox="0 0 120 132" aria-hidden="true">
<rect x="50" y="2" width="20" height="14" rx="4" fill="{col}"/>
<rect x="44" y="12" width="32" height="8" rx="4" fill="{col}"/>
<rect x="92" y="22" width="16" height="10" rx="3" fill="{col}" transform="rotate(40 100 27)"/>
<circle cx="60" cy="76" r="52" fill="{col}"/>
<circle cx="60" cy="76" r="42" fill="{ink}"/>
<g stroke="{col}" stroke-width="3" stroke-linecap="round">{''.join(f'<line x1="{60+36*math.sin(math.radians(a)):.1f}" y1="{76-36*math.cos(math.radians(a)):.1f}" x2="{60+40*math.sin(math.radians(a)):.1f}" y2="{76-40*math.cos(math.radians(a)):.1f}"/>' for a in range(0,360,30))}</g>
<text x="62" y="96" text-anchor="middle" font-family="Lilita One" font-size="56" fill="{col}">2'</text>
</svg>'''

def bulbs(W, H, inset, step, colors, glow, r=9):
    pts = []
    x0, y0, x1, y1 = inset, inset, W - inset, H - inset
    n = int((x1 - x0) / step); sx = (x1 - x0) / n
    m = int((y1 - y0) / step); sy = (y1 - y0) / m
    pts += [(x0 + i * sx, y0) for i in range(n)]
    pts += [(x1, y0 + j * sy) for j in range(m)]
    pts += [(x1 - i * sx, y1) for i in range(n)]
    pts += [(x0, y1 - j * sy) for j in range(m)]
    out = []
    for k, (x, y) in enumerate(pts):
        c = colors[k % len(colors)]
        out.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r*2.6:.1f}" fill="url(#glow{k%len(colors)})"/><circle cx="{x:.1f}" cy="{y:.1f}" r="{r}" fill="{c}" stroke="#00000055" stroke-width="2"/><circle cx="{x-r*0.3:.1f}" cy="{y-r*0.35:.1f}" r="{r*0.32:.1f}" fill="#ffffffcc"/>')
    defs = ''.join(f'<radialGradient id="glow{i}"><stop offset="0" stop-color="{c}" stop-opacity="{glow}"/><stop offset="1" stop-color="{c}" stop-opacity="0"/></radialGradient>' for i, c in enumerate(colors))
    return f'<svg class="bulbs" width="{W}" height="{H}" viewBox="0 0 {W} {H}" aria-hidden="true"><defs>{defs}</defs>{"".join(out)}</svg>'

def page(p):
    W, H = 1080, 1920
    lo = p.get('logo', '#FFC400')
    return f'''<!doctype html><html><head><meta charset="utf-8"><style>
{FONTS}
*{{box-sizing:border-box}} body{{margin:0;width:{W}px;height:{H}px;overflow:hidden;background:{p['bg']};}}
.poster{{position:relative;width:{W}px;height:{H}px;overflow:hidden;font-family:Figtree;color:{p['ink']};}}
.bg{{position:absolute;inset:0;{p.get('bgcss','')}}}
.bulbs{{position:absolute;left:0;top:0}}
.frame{{position:absolute;inset:{p.get('frame_inset',70)}px;border:{p.get('frame_css','4px solid '+p['ink'])};{p.get('frame_extra','')}}}
.col{{position:absolute;left:120px;width:840px;top:{p.get('top',225)}px;display:flex;flex-direction:column;align-items:center;}}
.logo{{display:flex;align-items:center;gap:18px}}
.logo .w{{font-family:'Lilita One';font-size:64px;line-height:1;color:{lo};letter-spacing:1px}}
.presenta{{font-family:Figtree;font-weight:800;font-size:22px;letter-spacing:12px;color:{lo};margin-top:6px;opacity:.95}}
.badge{{margin-top:22px;padding:10px 26px;border-radius:999px;background:{p['badge_bg']};color:{p['badge_ink']};font-weight:800;font-size:28px;letter-spacing:3px;border:{p.get('badge_border','none')}}}
.ill{{margin-top:26px;width:840px;height:{p.get('ill_h',700)}px;position:relative;overflow:hidden;border:{p.get('ill_border','6px solid '+p['ink'])};border-radius:{p.get('ill_radius',8)}px;{p.get('ill_extra','')}}}
.ill svg{{display:block}}
.ctx{{margin-top:26px;font-family:{p.get('ctx_font','Figtree')};font-weight:600;font-size:30px;letter-spacing:4px;color:{p.get('ctx_col',p['accent'])}}}
.title{{margin-top:6px;white-space:nowrap;line-height:1;text-align:center;{p['title_css']}}}
.title2{{white-space:nowrap;line-height:1;text-align:center;{p['title_css']}}}
.sub{{margin-top:8px;font-weight:800;font-size:36px;letter-spacing:10px;color:{p['accent']}}}
.teaser{{margin-top:18px;font-size:34px;line-height:1.3;text-align:center;font-style:italic;font-weight:600;max-width:820px}}
.date{{white-space:nowrap;margin-top:22px;font-family:{p.get('date_font','Figtree')};font-weight:800;font-size:40px;letter-spacing:2px;color:{p['date_col']};padding:10px 24px;border-top:3px solid {p['date_col']};border-bottom:3px solid {p['date_col']}}}
.cred{{margin-top:18px;font-size:23px;line-height:1.45;text-align:center;opacity:.85;letter-spacing:.5px}}
</style></head><body><div class="poster">
<div class="bg"></div>
{bulbs(W,H,p.get('bulb_inset',44),p.get('bulb_step',58),p['bulbs'],p.get('glow',0.55),p.get('bulb_r',9))}
<div class="frame"></div>
<div class="col">
 <div class="logo">{stopwatch(lo, p.get('logo_ink', p['bg']))}<div><div class="w">IN 2 MINUTI</div><div class="presenta">PRESENTA</div></div></div>
 <div class="badge">{p['badge']}</div>
 <div class="ill">{p['svg']}</div>
 <div class="ctx">— {p['ctx']} —</div>
 {''.join(f'<div class="{"title" if i==0 else "title2"}">{t}</div>' for i,t in enumerate(p['title']))}
 {f'<div class="sub">{p["sub"]}</div>' if p.get('sub') else ''}
 <div class="teaser">{p['teaser']}</div>
 <div class="date">{p['date']}</div>
 <div class="cred">{p['cred']}<br>Su TikTok · Instagram · Facebook · YouTube</div>
</div></div>
<script>
document.fonts.ready.then(()=>{{for(const el of document.querySelectorAll('.title,.title2,.date')){{let s=parseFloat(getComputedStyle(el).fontSize);while(el.scrollWidth>840&&s>20){{s-=2;el.style.fontSize=s+'px'}}}}
 const col=document.querySelector('.col');const b=col.getBoundingClientRect().bottom;document.body.dataset.bottom=b;document.body.dataset.ready=1;}});
</script></body></html>'''
