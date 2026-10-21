window.UI = {
  LEN: 120,
  SUBS: {
    arrivo: ['Boston, 1954.', 'Un traghetto nella nebbia.', 'A bordo, due sceriffi federali.', 'Teddy Daniels, veterano di guerra,', 'con una moglie morta che non dimentica.', 'E Chuck, il collega nuovo.'],
    ospedale: ['Destinazione: Ashecliffe,', 'ospedale per criminali psichiatrici.', 'Guardie, recinzioni, il padiglione C', 'per i più pericolosi.', 'Le pistole si consegnano all’ingresso.', 'Il direttore, il dottor Cawley, sorride.', 'Troppo.'],
    cella: ['Il caso: una fuga impossibile.', 'Rachel Solando.', 'Ha annegato i suoi tre figli.', 'Stanotte è sparita.', 'La cella era chiusa dall’esterno.', 'Le guardie non si sono mosse.', 'E le scarpe?', 'Ancora sotto la branda.', 'Rachel è scalza. Su un’isola.'],
    biglietto: ['Sotto il pavimento, un biglietto.', '«La legge del 4. Chi è il 67?»', 'Ma i pazienti sono 66.', 'Qualcuno manca.', 'I medici tacciono.', 'Cawley nega le cartelle cliniche.'],
    studio: ['Teddy ha emicranie violente.', 'Cawley gli offre pillole e sigarette.', 'Di notte, gli incubi.', 'La guerra. I campi liberati.', 'E sua moglie, Dolores.', 'Gli sussurra: Rachel è ancora qui.'],
    incendio: ['Dolores è morta due anni fa,', 'in un incendio.', 'Teddy è sicuro: l’ha appiccato', 'Andrew Laeddis, il custode del palazzo.', 'Laeddis è rinchiuso qui.', 'Teddy è venuto per lui.', 'E sospetta esperimenti sul cervello.'],
    uragano: ['Poi l’uragano.', 'Salta la corrente, i pazienti escono.', 'Teddy punta al faro:', 'lì, pensa, li operano.', 'Corre con Chuck sulla scogliera.', 'Si separano.', 'Teddy crede di vedere il suo corpo', 'tra gli scogli. Scende.'],
    grotta: ['Niente Chuck.', 'Solo una grotta, e una donna.', 'Dice di essere la vera Rachel.', '«Ti drogano. Pillole, cibo, sigarette.»', '«Vogliono farti diventare un paziente.»', 'E Chuck? «Sei arrivato da solo.»'],
    lavagna: ['Teddy entra nel faro.', 'Nessuna sala operatoria.', 'Solo Cawley, e una lavagna.', 'Edward Daniels:', 'anagramma di Andrew Laeddis.', 'Rachel Solando:', 'anagramma di Dolores Chanal, sua moglie.', 'Teddy non esiste.', 'Il paziente 67 è lui. Da due anni.'],
    verita: ['Chuck è il dottor Sheehan,', 'il suo psichiatra.', 'L’indagine? Una recita.', 'L’ultimo tentativo.', 'Dolores aveva annegato i loro tre figli', 'nel lago dietro casa.', 'Lui l’ha trovata. E le ha sparato.', 'Se non ricorda: lobotomia.'],
    alba: ['All’alba chiama il medico «Chuck».', 'Sembra ricaduto.', 'Arrivano gli infermieri.', 'Lui chiede:', 'meglio vivere da mostro,', 'o morire da uomo per bene?', 'E si avvia verso il faro.', 'Forse ha scelto.']
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
    const head = o.plate
      ? '<h2 class="line stitle chip o-title" style="top:372px;font-size:72px">' + title + '</h2>'
      : '<h2 class="line stitle o-title ' + (o.dark ? 't-dark' : 't-light') + '" style="top:' + Math.max(o.top || 380, 380) + 'px;font-size:' + (o.size || 104) + 'px' + (o.width ? ';width:' + o.width + 'px' : '') + '">' + title + '</h2>';
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
  flame(cx, base, w, h, t, ph) {
    const a = Math.sin(t * 3 + ph) * w * 0.25, b = Math.sin(t * 2.3 + ph * 2) * w * 0.18;
    return 'M' + (cx - w) + ' ' + base + ' Q' + (cx - w - 8) + ' ' + (base - h * .5) + ' ' + (cx - w * .3 + b) + ' ' + (base - h * .7) + ' Q' + (cx - w * .2) + ' ' + (base - h * .45) + ' ' + (cx + a) + ' ' + (base - h) + ' Q' + (cx + w * .5) + ' ' + (base - h * .55) + ' ' + (cx + w * .45 - b) + ' ' + (base - h * .75) + ' Q' + (cx + w + 8) + ' ' + (base - h * .4) + ' ' + (cx + w) + ' ' + base + ' Z';
  },
  hat(fillStroke) {
    return '<path d="M-110 0 Q0 -20 110 0 Q80 16 0 18 Q-80 16 -110 0 Z" fill="#15202B"' + (fillStroke || '') + '/><path d="M-66 -6 L-56 -78 Q0 -100 56 -78 L66 -6 Z" fill="#15202B"' + (fillStroke || '') + '/><path d="M-62 -26 H62" stroke="#FF6B2C" stroke-width="14"/>';
  }
};