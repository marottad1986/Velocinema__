window.UI = {
  LEN: 120,
  SUBS: {
    ingorgo: ['Los Angeles.', 'Un ingorgo infinito in autostrada.', 'Mia sogna di fare l’attrice.', 'Sebastian sogna un locale jazz tutto suo.', 'Lui le suona il clacson. Lei lo manda a quel paese.', 'Primo incontro: un disastro.'],
    caffe: ['Mia serve caffè negli studi cinematografici.', 'Fa un provino dopo l’altro.', 'La interrompono, la ignorano.', 'Ogni sera torna a casa con un no.'],
    piano: ['Una notte sente un pianoforte da un ristorante.', 'È Sebastian.', 'Doveva suonare canzoni di Natale.', 'Invece suona il suo jazz.', 'Il proprietario lo licenzia.', 'Mia vuole fargli i complimenti.', 'Lui la scansa e se ne va.'],
    collina: ['Si rincontrano a una festa:', 'lui suona in una cover band anni ’80.', 'Al tramonto, su una collina sopra la città,', 'giurano di non piacersi.', 'E intanto ballano il tip tap.'],
    jazz: ['Sebastian la porta in un jazz club.', 'Le spiega perché il jazz va salvato.', 'Lei molla il fidanzato a metà cena', 'e lo raggiunge al cinema.'],
    osservatorio: ['La pellicola si brucia.', 'Allora corrono all’osservatorio.', 'Nel planetario, tra le stelle,', 'ballano sospesi nel vuoto.', 'È il primo bacio.', 'E l’inizio della loro storia.'],
    sogno: ['Vanno a vivere insieme.', 'Lui la convince a scrivere uno spettacolo tutto suo.', 'Lei lo spinge ad aprire il suo locale.'],
    band: ['Ma servono soldi.', 'Sebastian entra nella band di un vecchio amico.', 'Musica che non ama, ma che paga.', 'Successo, tour, mesi lontano.', 'I due si vedono sempre meno.'],
    prima: ['A cena litigano.', 'Poi arriva la sera dello spettacolo di Mia.', 'Sala quasi vuota.', 'Sebastian non c’è: è bloccato al lavoro.', 'Mia è distrutta. Lascia Los Angeles.'],
    audizione: ['Una direttrice di casting ha visto lo spettacolo.', 'Sebastian va a riprendere Mia in Nevada', 'e la convince a fare il provino.', 'Lei canta dei sognatori, come sua zia.', 'Ottiene la parte: si gira a Parigi.', 'Si promettono di amarsi sempre. E si separano.'],
    epilogo: ['Cinque anni dopo.', 'Mia è una star, sposata con un altro.', 'Una sera entra per caso nel locale di Sebastian.', 'Lui suona la loro canzone.', 'Immaginano la vita che avrebbero potuto avere.', 'Poi, solo un sorriso.']
  },
  over(kit, title, o) {
    o = o || {};
    const all = kit.json('scenes.json').scenes;
    let acc = 0, idx = 0;
    const sc = [], starts = [];
    all.forEach(function (s) { if (s.id !== 'copertina') { if (Math.abs(acc - kit.start) < 0.01) idx = sc.length; sc.push(s); starts.push(acc); } acc += s.dur; });
    const me = sc[idx];
    const lines = UI.SUBS[me.id] || [];
    const total = lines.reduce(function (n, l) { return n + l.length + 6; }, 0);
    let cur = 0.15;
    const span = me.dur - 0.35;
    const times = lines.map(function (l) { const a = cur; cur += (l.length + 6) / total * span; return [a, cur]; });
    const segs = sc.map(function (s) { return '<div class="seg" style="flex:' + s.dur + ' 1 0"><div class="seg-fill"></div></div>'; }).join('');
    const bar = '<div class="segs">' + segs + '</div><div class="chap"><span>CAPITOLO ' + (idx + 1) + ' DI ' + sc.length + '</span><span class="chap-dot"></span><span class="o-time">0:00 / 2:00</span></div>';
    const head = '<h2 class="line stitle o-title ' + (o.dark ? 't-dark' : 't-light') + '" style="top:' + (o.top || 380) + 'px;font-size:' + (o.size || 104) + 'px">' + title + '</h2>';
    const subs = '<div class="subs">' + lines.map(function (l) { return '<p class="sub">' + l + '</p>'; }).join('') + '</div>';
    const root = kit.h('<div style="position:absolute;inset:0">' + bar + head + subs + '</div>');
    kit.stage.append(root);
    return { kit: kit, starts: starts, durs: sc.map(function (s) { return s.dur; }), times: times, subEls: Array.prototype.slice.call(root.querySelectorAll('.sub')), time: root.querySelector('.o-time'), fills: Array.prototype.slice.call(root.querySelectorAll('.seg-fill')), title: root.querySelector('.o-title') };
  },
  tick(st, t) {
    const kit = st.kit;
    const T = Math.max(0, kit.start + t);
    const s = Math.floor(T);
    st.time.textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0') + ' / 2:00';
    st.fills.forEach(function (f, i) { f.style.width = (kit.clamp01((T - st.starts[i]) / st.durs[i]) * 100) + '%'; });
    kit.TextFx.fadeFromRight(st.title, t, 0.1, { stagger: 0.08, dur: 0.4, dx: 30 });
    st.subEls.forEach(function (e, i) {
      const a = st.times[i][0], b = st.times[i][1];
      const p = kit.seg(t, a, a + 0.12), q = kit.seg(t, b - 0.08, b);
      e.style.opacity = p * (1 - q);
      e.style.transform = 'translateY(' + (1 - p) * 10 + 'px)';
    });
  },
  push(el, t, dur, cx, cy, amt) {
    const z = 1 + (amt || 0.06) * kit.eio(kit.seg(t, 0, dur));
    el.setAttribute('transform', 'translate(' + cx + ' ' + cy + ') scale(' + z + ') translate(' + (-cx) + ' ' + (-cy) + ')');
  },
  stars(n, seed, x0, y0, w, h, cls) {
    let s = '', r = seed;
    for (let i = 0; i < n; i++) { r = (r * 9301 + 49297) % 233280; const x = x0 + (r / 233280) * w; r = (r * 9301 + 49297) % 233280; const y = y0 + (r / 233280) * h; const rad = 2 + (i % 3) * 1.5; s += '<circle class="' + cls + '" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + rad + '" fill="#FFF6D8"/>'; }
    return s;
  },
  twinkle(els, t) { els.forEach(function (e, i) { e.style.opacity = 0.45 + 0.55 * Math.abs(Math.sin(t * (0.8 + (i % 5) * 0.3) + i)); }); },
  note() { return '<path d="M0 0 v-60 l40 -12 v58" fill="none" stroke="#F2C14E" stroke-width="7" stroke-linecap="round"/><ellipse cx="-10" cy="2" rx="14" ry="10" fill="#F2C14E"/><ellipse cx="30" cy="-10" rx="14" ry="10" fill="#F2C14E"/>'; }
};