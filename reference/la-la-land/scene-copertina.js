const { seg, eo, eio, lerp, TextFx } = kit;
kit.scene('copertina', {
  init(kit) {
    let lights = '';
    for (let i = 0; i < 70; i++) { const x = (i * 137) % 1080; const y = 1500 + ((i * 53) % 300); lights += '<circle class="cop-l" cx="' + x + '" cy="' + y + '" r="' + (3 + (i % 3)) + '" fill="#F2C14E"/>'; }
    kit.stage.append(kit.h('<div class="ground"><svg class="full" viewBox="0 0 1080 1920"><g class="cop-cam">' +
      '<rect width="1080" height="1920" fill="#1C1838"/><rect y="700" width="1080" height="500" fill="#2C2456"/><rect y="1050" width="1080" height="300" fill="#4A3478"/><rect y="1250" width="1080" height="200" fill="#8A4E8C"/>' +
      UI.stars(60, 7, 0, 760, 1080, 520, 'cop-s') +
      '<circle cx="820" cy="900" r="70" fill="#FFF6D8"/>' +
      '<path d="M0 1430 Q200 1300 420 1360 Q640 1260 860 1340 Q980 1300 1080 1350 V1920 H0 Z" fill="#2C2456"/>' +
      '<path d="M0 1500 H1080 V1920 H0 Z" fill="#1C1838"/>' + lights +
      '<path d="M0 1440 Q300 1380 600 1420 Q820 1450 1080 1410 V1520 H0 Z" fill="#3A2D63"/>' +
      '<circle class="cop-glow" cx="250" cy="1140" r="130" fill="#F2C14E" opacity=".25"/>' +
      '<path d="M250 1450 V1150" stroke="#0F0C22" stroke-width="14"/><path d="M222 1150 H278 L268 1110 H232 Z" fill="#0F0C22"/><circle cx="250" cy="1160" r="16" fill="#FFE08A"/>' +
      '<g><rect x="420" y="1400" width="240" height="20" rx="6" fill="#0F0C22"/><rect x="420" y="1360" width="240" height="14" rx="6" fill="#0F0C22"/><path d="M440 1420 V1460 M640 1420 V1460" stroke="#0F0C22" stroke-width="10"/></g>' +
      '</g></svg>' +
      '<div class="words" style="left:80px;top:300px;width:920px;gap:20px">' +
      '<p class="cop-tag" style="margin:0;font-size:30px;font-weight:800;letter-spacing:.3em;color:var(--accent)">IL FILM IN 2 MINUTI</p>' +
      '<h1 class="line" style="font-size:190px;line-height:.9;letter-spacing:-.02em;color:var(--ground)">La La Land</h1>' +
      '<p class="cop-dir" style="margin:0;font-size:44px;font-weight:800;color:var(--ground)">un film di Damien Chazelle · 2016</p></div>' +
      '</div>'));
    this.cam = kit.stage.querySelector('.cop-cam');
    this.stars = Array.prototype.slice.call(kit.stage.querySelectorAll('.cop-s, .cop-l'));
    this.glow = kit.stage.querySelector('.cop-glow');
    this.tag = kit.stage.querySelector('.cop-tag');
    this.dir = kit.stage.querySelector('.cop-dir');
    this.line = kit.stage.querySelector('.line');
  },
  render(t) {
    UI.push(this.cam, t, 4, 540, 1300, 0.04);
    UI.twinkle(this.stars, t);
    this.glow.setAttribute('opacity', 0.22 + Math.sin(t * 2) * 0.04);
    TextFx.fadeFromRight(this.line, t, -0.6);
    this.tag.style.opacity = eo(seg(t, -0.6, -0.2));
    this.dir.style.opacity = eo(seg(t, -0.3, 0.2));
  },
});