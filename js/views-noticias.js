/* Notícias: lista, matéria e painel “Impacto na carteira”. */

/* Relação calculada com a carteira atual, inclusive compras feitas na demo. */
function relacaoNoticia(n) {
  const c = conta();
  if (!c) return { estado: 'insuf', semSessao: true };
  if (n.insuf || (!n.ativos.length && !(n.setoresAfetados || []).length)) return { estado: 'insuf', codes: [] };
  const pos = posicoes();
  if (!pos.length) return { estado: 'sem', vazia: true, codes: [] };
  const meus = [...new Set(pos.map((p) => p.code))];
  const diretos = n.ativos.filter((x) => meus.includes(x));
  if (diretos.length) return { estado: 'direta', codes: diretos };
  const ligados = meus.filter((x) => (n.setoresAfetados || []).includes(ativo(x).setor));
  if (ligados.length) return { estado: 'indireta', codes: ligados };
  return { estado: 'sem', codes: [] };
}
const naCarteira = (n) => ['direta', 'indireta'].includes(relacaoNoticia(n).estado);

function newsHref(params) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => v && q.set(k, v));
  return '/noticias' + (q.toString() ? '?' + q : '');
}

/* Ilustrações próprias (SVG) — as notícias são fictícias, então não há foto real. */
const NEWS_ART = {
  n1: (g) => `<defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0A0349"/><stop offset="1" stop-color="#1818B7"/></linearGradient></defs>
    <rect width="640" height="320" fill="url(#${g})"/>
    <g fill="#36ADB9" opacity=".85"><rect x="70" y="210" width="44" height="70" rx="4"/><rect x="134" y="180" width="44" height="100" rx="4"/><rect x="198" y="150" width="44" height="130" rx="4"/><rect x="262" y="120" width="44" height="160" rx="4"/></g>
    <rect x="326" y="80" width="44" height="200" rx="4" fill="#FFCD00"/>
    <polyline points="92,190 156,160 220,132 284,100 348,58" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M330 60 l18 -4 -4 18" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <g stroke="#fff" stroke-width="4" fill="none" opacity=".9"><rect x="445" y="105" width="110" height="110" rx="12"/><rect x="475" y="135" width="50" height="50" rx="6" fill="#36ADB9" stroke="none"/>
    <path d="M465 105v-22M500 105v-22M535 105v-22M465 215v22M500 215v22M535 215v22M445 125h-22M445 160h-22M445 195h-22M555 125h22M555 160h22M555 195h22"/></g>`,
  n2: (g) => `<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DDE9F6"/><stop offset="1" stop-color="#FFFFFF"/></linearGradient></defs>
    <rect width="640" height="320" fill="url(#${g})"/><circle cx="530" cy="78" r="42" fill="#FFCD00"/>
    <rect y="270" width="640" height="50" fill="#36ADB9" opacity=".25"/>
    <g fill="none" stroke="#0A0349" stroke-width="4" stroke-linejoin="round">
      <path d="M130 280 L170 80 L210 280 M150 180 h40 M140 230 h60 M160 130 h20 M120 110 h100 M140 110 L180 180 L150 230 M200 110 L160 180 L190 230"/>
      <path d="M390 280 L430 100 L470 280 M410 190 h40 M400 240 h60 M380 128 h100 M400 128 L440 190 L410 240 M460 128 L420 190 L450 240"/></g>
    <g fill="none" stroke="#0A0349" stroke-width="2"><path d="M120 110 Q 250 170 380 128"/><path d="M220 110 Q 350 170 480 128"/><path d="M0 140 Q 60 120 120 110"/><path d="M480 128 Q 560 150 640 135"/></g>
    <polygon points="300,40 262,140 296,140 278,215 340,110 304,110 322,40" fill="#1818B7"/>`,
  n3: (g) => `<defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF3C6"/><stop offset="1" stop-color="#FFE05A"/></linearGradient></defs>
    <rect width="640" height="320" fill="url(#${g})"/>
    <rect x="90" y="110" width="300" height="180" fill="#0A0349"/><rect x="130" y="170" width="100" height="120" fill="#DDE9F6"/><rect x="260" y="170" width="100" height="70" fill="#DDE9F6"/>
    <g>${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${80 + i * 53.3} 80 h53.3 v34 a26.6 26.6 0 0 1 -53.3 0 Z" fill="${i % 2 ? '#fff' : '#36ADB9'}"/>`).join('')}</g>
    <rect x="440" y="170" width="70" height="90" rx="6" fill="#1818B7"/><path d="M458 170 v-14 a17 17 0 0 1 34 0 v14" fill="none" stroke="#1818B7" stroke-width="6"/>
    <rect x="500" y="200" width="60" height="70" rx="6" fill="#067684"/><path d="M515 200 v-12 a15 15 0 0 1 30 0 v12" fill="none" stroke="#067684" stroke-width="6"/>`,
  n4: (g) => `<defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#EEF0F4"/><stop offset="1" stop-color="#DDE9F6"/></linearGradient></defs>
    <rect width="640" height="320" fill="url(#${g})"/>
    <circle cx="170" cy="160" r="90" fill="#0A0349"/><path d="M170 160 L170 70 A90 90 0 0 1 255 190 Z" fill="#36ADB9"/><path d="M170 160 L255 190 A90 90 0 0 1 200 245 Z" fill="#FFCD00"/>
    <g fill="none" stroke="#707A90" stroke-width="2" opacity=".5"><path d="M320 260 H600 M320 200 H600 M320 140 H600 M320 80 H600"/></g>
    <polyline points="320,240 370,215 420,225 470,170 520,180 580,110" fill="none" stroke="#1818B7" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    <g fill="#FFCD00" stroke="#6D4A00" stroke-width="3"><ellipse cx="540" cy="275" rx="34" ry="12"/><ellipse cx="540" cy="262" rx="34" ry="12"/><ellipse cx="540" cy="249" rx="34" ry="12"/></g>`,
  n5: (g) => `<defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#DDE9F6"/><stop offset="1" stop-color="#9FD3D9"/></linearGradient></defs>
    <rect width="640" height="320" fill="url(#${g})"/>
    <g fill="#0A0349">${[[150, 120], [230, 95], [310, 95], [390, 120]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="22"/><path d="M${x - 34} ${y + 70} a34 34 0 0 1 68 0 Z"/>`).join('')}</g>
    <ellipse cx="270" cy="215" rx="190" ry="48" fill="#1818B7"/><ellipse cx="270" cy="205" rx="190" ry="48" fill="#36ADB9"/>
    <rect x="470" y="70" width="110" height="150" rx="8" fill="#fff" stroke="#0A0349" stroke-width="4"/>
    <g stroke="#707A90" stroke-width="5" stroke-linecap="round"><path d="M492 105h66M492 130h66M492 155h40"/></g>
    <path d="M495 190 l14 14 28 -30" fill="none" stroke="#12613A" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`,
  n6: (g) => `<defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0A0349"/><stop offset="1" stop-color="#067684"/></linearGradient></defs>
    <rect width="640" height="320" fill="url(#${g})"/><rect y="262" width="640" height="58" fill="#14108D"/>
    <g stroke="#FFCD00" stroke-width="5" stroke-dasharray="30 24"><path d="M0 292 H640"/></g>
    <rect x="70" y="140" width="230" height="100" rx="6" fill="#FFCD00"/><path d="M300 170 h60 l40 40 v30 h-100 Z" fill="#fff"/><rect x="318" y="182" width="36" height="26" rx="3" fill="#36ADB9"/>
    <g fill="#0A0349" stroke="#fff" stroke-width="4"><circle cx="120" cy="250" r="20"/><circle cx="250" cy="250" r="20"/><circle cx="360" cy="250" r="20"/></g>
    <g stroke="#0A0349" stroke-width="3"><rect x="440" y="180" width="150" height="60" fill="#36ADB9"/><rect x="440" y="120" width="150" height="60" fill="#1818B7"/><rect x="460" y="60" width="120" height="60" fill="#FFCD00"/></g>`,
  mineracao: (g) => `<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3E3D3"/><stop offset="1" stop-color="#E7C9A9"/></linearGradient></defs>
    <rect width="640" height="320" fill="url(#${g})"/>
    <path d="M0 260 L120 120 L200 190 L300 80 L420 230 L470 180 L640 260 V320 H0Z" fill="#8A5A3B"/><path d="M0 285 H640 V320 H0Z" fill="#6B4430"/>
    <g fill="#5B3A29"><circle cx="230" cy="250" r="9"/><circle cx="252" cy="262" r="7"/><circle cx="210" cy="266" r="6"/></g>
    <rect x="360" y="205" width="150" height="55" rx="6" fill="#FFCD00"/><path d="M360 205 l-40 -30 h150 l40 30 Z" fill="#E6B800"/><rect x="510" y="220" width="55" height="40" rx="5" fill="#0A0349"/>
    <g fill="#0A0349" stroke="#fff" stroke-width="4"><circle cx="395" cy="268" r="17"/><circle cx="480" cy="268" r="17"/><circle cx="545" cy="268" r="14"/></g>
    <path d="M560 50 v90 M530 112 l30 30 30 -30" fill="none" stroke="#B42318" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>`,
  evento: (g) => `<defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0A0349"/><stop offset="1" stop-color="#1818B7"/></linearGradient></defs>
    <rect width="640" height="320" fill="url(#${g})"/><rect y="250" width="640" height="70" fill="#14108D"/>
    <rect x="90" y="50" width="300" height="170" rx="8" fill="#fff"/><polyline points="120,180 180,150 240,165 300,110 360,90" fill="none" stroke="#36ADB9" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="200" y="220" width="80" height="34" fill="#DDE9F6"/>
    <g fill="#FFCD00">${[120, 200, 280, 360].map((x) => `<circle cx="${x}" cy="285" r="16"/>`).join('')}</g>
    <rect x="450" y="70" width="130" height="140" rx="10" fill="#fff"/><rect x="450" y="70" width="130" height="38" rx="10" fill="#FFCD00"/>
    <text x="515" y="178" text-anchor="middle" font-family="Source Sans 3, Arial, sans-serif" font-size="64" font-weight="700" fill="#0A0349">1</text>
    <text x="515" y="98" text-anchor="middle" font-family="Source Sans 3, Arial, sans-serif" font-size="20" font-weight="700" fill="#0A0349">DEZ</text>`,
  petroleo: (g) => `<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE7A8"/><stop offset=".55" stop-color="#FFC861"/><stop offset=".56" stop-color="#067684"/><stop offset="1" stop-color="#0A0349"/></linearGradient></defs>
    <rect width="640" height="320" fill="url(#${g})"/><circle cx="520" cy="120" r="40" fill="#FFF6D6"/>
    <g fill="#0A0349"><rect x="120" y="150" width="220" height="26"/><rect x="140" y="176" width="16" height="120"/><rect x="300" y="176" width="16" height="120"/><rect x="220" y="176" width="16" height="120"/>
      <path d="M250 150 L275 40 L300 150 Z" fill="none" stroke="#0A0349" stroke-width="8"/><rect x="140" y="110" width="80" height="40"/></g>
    <path d="M330 120 h60" stroke="#0A0349" stroke-width="6"/><path d="M392 108 q16 12 0 24" fill="#FFCD00"/>
    <path d="M470 200 C470 200 430 250 430 272 a40 40 0 0 0 80 0 C510 250 470 200 470 200Z" fill="#14108D" stroke="#fff" stroke-width="4"/>`,
  banco: (g, alta) => `<defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#EEF0F4"/><stop offset="1" stop-color="#DDE9F6"/></linearGradient></defs>
    <rect width="640" height="320" fill="url(#${g})"/>
    <path d="M90 120 L240 50 L390 120 Z" fill="#0A0349"/><rect x="100" y="120" width="280" height="16" fill="#0A0349"/>
    <g fill="#1818B7">${[120, 180, 240, 300, 350].map((x) => `<rect x="${x}" y="140" width="22" height="110"/>`).join('')}</g>
    <rect x="90" y="250" width="300" height="22" fill="#0A0349"/><circle cx="240" cy="95" r="14" fill="#FFCD00"/>
    ${alta
      ? '<path d="M520 260 V90 M480 130 l40 -40 40 40" fill="none" stroke="#12613A" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>'
      : '<path d="M520 90 V260 M480 220 l40 40 40 -40" fill="none" stroke="#B42318" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>'}`,
  'banco-alta': (g) => NEWS_ART.banco(g, true),
  varejo: (g) => NEWS_ART.n3(g),
  juros: (g) => `<defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0A0349"/><stop offset="1" stop-color="#067684"/></linearGradient></defs>
    <rect width="640" height="320" fill="url(#${g})"/>
    <g fill="none" stroke="#fff" stroke-width="2" opacity=".25"><path d="M60 250 H600 M60 190 H600 M60 130 H600 M60 70 H600"/></g>
    <polyline points="60,90 140,110 220,140 300,170 380,190 460,190 600,190" fill="none" stroke="#FFCD00" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="460" cy="190" r="12" fill="#FFCD00"/>
    <g fill="#fff"><circle cx="160" cy="235" r="22"/><circle cx="250" cy="285" r="22"/></g><path d="M265 215 L145 305" stroke="#fff" stroke-width="12" stroke-linecap="round"/>`,
  industria: (g) => `<defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#DDE9F6"/><stop offset="1" stop-color="#9FD3D9"/></linearGradient></defs>
    <rect width="640" height="320" fill="url(#${g})"/>
    <rect x="90" y="110" width="240" height="140" rx="20" fill="#14108D"/><g stroke="#36ADB9" stroke-width="6">${[130, 160, 190, 220, 250, 280].map((x) => `<path d="M${x} 120 V240"/>`).join('')}</g>
    <rect x="330" y="160" width="70" height="40" fill="#0A0349"/><rect x="110" y="250" width="200" height="22" fill="#0A0349"/>
    <g transform="translate(500 140)"><circle r="62" fill="#FFCD00"/><circle r="24" fill="#DDE9F6"/>${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<rect x="-12" y="-82" width="24" height="26" fill="#FFCD00" transform="rotate(${a})"/>`).join('')}</g>
    <g transform="translate(430 250)"><circle r="34" fill="#067684"/><circle r="12" fill="#DDE9F6"/>${[0, 60, 120, 180, 240, 300].map((a) => `<rect x="-8" y="-46" width="16" height="16" fill="#067684" transform="rotate(${a})"/>`).join('')}</g>`,
};
function newsImage(n, sufixo = '') {
  const art = NEWS_ART[n.arte || n.id];
  return `<svg class="news-img" viewBox="0 0 640 320" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(n.imagem || 'Ilustração da notícia')}">${art ? art('g-' + n.id + sufixo) : ''}</svg>`;
}

function newsItem(n, aba, ctx) {
  const painelDest = newsHref({ aba, tipo: ctx.tipo !== 'todos' ? ctx.tipo : '', ativo: ctx.ativo, painel: n.id });
  const rel = relacaoNoticia(n);
  const aberto = !!ui.expand['mais-' + n.id];
  return `<article class="card news-item" data-news="${n.id}" aria-labelledby="t-${n.id}">
    <div class="news-meta">${tipoTag(n.tipo)}<span>${n.data}</span>${aba === 'carteira' ? relTag(rel.estado) : ''}</div>
    <h2 class="h2 news-title" id="t-${n.id}">${esc(n.titulo)}</h2>
    <figure class="news-figure">
      ${newsImage(n)}
      <figcaption class="meta">Fonte: ${esc(n.fonte.replace(/^Fonte demo · /, ''))} · ${n.real ? 'Notícia real, resumida para o protótipo' : 'Notícia fictícia'} · Imagem ilustrativa</figcaption>
    </figure>
    <p class="news-summary">${esc(n.resumo)}</p>
    <div class="news-actions">
      <button type="button" class="btn-more" data-action="news-more" data-id="${n.id}" aria-expanded="${aberto}" aria-controls="mais-${n.id}">
        <span>${aberto ? 'Ver menos' : 'Ver mais'}</span><span class="sr-only">: ${esc(n.titulo)}</span>${icon('chevronRight', 18)}</button>
      ${state.session
        ? `<button type="button" class="btn btn-outline" data-action="open-panel" data-kind="noticia" data-id="${n.id}">${icon('wallet', 18)}Impacto na carteira<span class="sr-only">: ${esc(n.titulo)}</span></button>`
        : `<a class="btn btn-outline" href="#/acesso?destino=${encodeURIComponent(painelDest)}">${icon('wallet', 18)}Impacto na carteira<span class="sr-only">: ${esc(n.titulo)}</span></a>`}
    </div>
    <div class="news-more" id="mais-${n.id}" ${aberto ? '' : 'hidden'}>
      ${n.detalhe.map(([t, p]) => `<h3 class="h3">${esc(t)}</h3><p>${esc(p)}</p>`).join('')}
      <p class="meta">${n.real ? `Resumo escrito para o protótipo a partir de reportagem de ${esc(n.fonte)}. Os preços mostrados no app são simulados.` : 'Texto fictício, escrito para a demonstração do protótipo.'}</p>
      ${fonteLink(n, 'btn btn-link news-site')}
    </div>
  </article>`;
}
/* Notícia real abre o site da reportagem; notícia fictícia abre a matéria completa dentro do protótipo. */
function fonteLink(n, cls, label = 'Ir para o site da notícia') {
  return n.real
    ? `<a class="${cls}" href="${esc(n.url)}" target="_blank" rel="noopener">${label} ${icon('external', 16)}<span class="sr-only">(abre ${esc(n.fonte)} em nova aba)</span></a>`
    : `<a class="${cls}" href="#/noticias/${n.id}">Ler a matéria completa ${icon('arrowRight', 16)}</a>`;
}
ACTIONS['news-more'] = (el) => {
  const id = el.dataset.id, open = el.getAttribute('aria-expanded') !== 'true';
  ui.expand['mais-' + id] = open;
  el.setAttribute('aria-expanded', open);
  el.querySelector('span').textContent = open ? 'Ver menos' : 'Ver mais';
  document.getElementById('mais-' + id).hidden = !open;
};

function viewNoticias(route) {
  const q = route.q;
  const painel = q.get('painel');
  if (painel && !state.session) return { redirect: '/acesso?destino=' + encodeURIComponent(route.full) };

  const temCarteira = state.session && NOTICIAS.some(naCarteira);
  const aba = q.get('aba') || (temCarteira ? 'carteira' : 'todo');
  const tipo = q.get('tipo') || 'todos';
  const ativoF = q.get('ativo') && ativo(q.get('ativo')) ? q.get('ativo').toUpperCase() : '';
  const ctx = { tipo, ativo: ativoF };

  let lista = NOTICIAS.slice();
  if (aba === 'carteira') lista = state.session ? lista.filter(naCarteira) : [];
  if (tipo !== 'todos') lista = lista.filter((n) => n.tipo === tipo);
  if (ativoF) lista = lista.filter((n) => n.ativos.includes(ativoF));
  const filtrando = tipo !== 'todos' || ativoF;

  let corpo;
  if (aba === 'carteira' && !state.session) {
    corpo = emptyState({
      title: 'Entre para ver as notícias ligadas à sua carteira', iconName: 'wallet',
      text: 'Em Minha carteira, aparecem notícias, comunicados e eventos ligados aos seus ativos.',
      actions: `<a class="btn btn-yellow" href="#/acesso?destino=${encodeURIComponent('/noticias?aba=carteira')}">Entrar para ver minha carteira</a><a class="btn btn-outline" href="#${newsHref({ aba: 'todo' })}">Ver todo o mercado</a>`,
    });
  } else if (!lista.length) {
    corpo = filtrando
      ? emptyState({ title: 'Nenhuma notícia para esses filtros', actions: `<a class="btn btn-outline btn-sm" href="#${newsHref({ aba })}">Limpar filtros</a>`, iconName: 'filter' })
      : emptyState({ title: 'Não encontramos notícias ligadas à sua carteira', text: conta() && !posicoes().length ? 'Sua carteira ainda não tem posições. Compre uma ação na demo para testar.' : 'Quando houver notícias sobre seus ativos, elas aparecem aqui.',
          actions: `<a class="btn btn-outline btn-sm" href="#${newsHref({ aba: 'todo' })}">Ver todo o mercado</a>`, iconName: 'news' });
  } else {
    corpo = `<div class="news-list">${lista.map((n) => newsItem(n, aba, ctx)).join('')}</div>`;
  }

  return {
    title: 'Notícias', nav: 'noticias', crumbs: [['Notícias']], pageKey: 'noticias',
    panel: painel && NOTICIAS.find((n) => n.id === painel) ? { kind: 'noticia', id: painel } : null,
    html: `
    <div class="page-head"><div><h1 class="h1">Notícias</h1>
      <p class="meta lead">Notícias, comunicados das empresas e eventos · Dados de demonstração</p></div></div>
    <div class="news-toolbar">
      ${tabs([['todo', 'Todo o mercado'], ['carteira', 'Minha carteira']], aba, { label: 'Recorte das notícias', id: 'noticias', hrefFor: (k) => newsHref({ aba: k, tipo: tipo !== 'todos' ? tipo : '', ativo: ativoF }) })}
      <div class="field"><label for="tipo">Tipo</label>
        <select id="tipo" class="select" data-change="news-tipo" style="min-width:180px">
          ${[['todos', 'Todos'], ['noticia', 'Notícias'], ['comunicado', 'Comunicados'], ['evento', 'Eventos']].map(([k, t]) => `<option value="${k}" ${k === tipo ? 'selected' : ''}>${t}</option>`).join('')}
        </select></div>
    </div>
    ${ativoF ? `<div class="chips"><span class="chip">Ativo: ${esc(ativo(ativoF).name)} · ${ativoF}<button type="button" data-action="go" data-href="${newsHref({ aba, tipo: tipo !== 'todos' ? tipo : '' })}" aria-label="Remover filtro do ativo ${esc(ativo(ativoF).name)}">${icon('x', 16)}</button></span></div>` : ''}
    ${aba === 'todo' && state.session && !temCarteira ? `<p class="note neutral" style="margin-bottom:16px">${icon('info', 18)}<span>Em Minha carteira, você vê só as notícias ligadas aos seus ativos. No momento, nenhuma notícia tem ligação com a sua carteira.</span></p>` : ''}
    ${aba === 'carteira' && state.session && lista.length ? `<p class="meta" style="margin-bottom:12px">${lista.length} ${lista.length === 1 ? 'item ligado' : 'itens ligados'} aos ativos da sua carteira · Posição de ${REF.atual}</p>` : ''}
    ${corpo}`,
  };
}
CHANGES['news-tipo'] = (el) => {
  const r = parseHash();
  const v = el.value;
  if (v === 'todos') r.q.delete('tipo'); else r.q.set('tipo', v);
  r.q.delete('painel');
  state.focusAfter = '#tipo';
  go('/noticias?' + r.q.toString());
};

/* Matéria */
function viewMateria(route) {
  const n = NOTICIAS.find((x) => x.id === route.m[1]);
  if (!n) return viewNotFound();
  const painel = route.q.get('painel');
  if (painel && !state.session) return { redirect: '/acesso?destino=' + encodeURIComponent(route.full) };
  const aba = route.q.get('aba') || '';
  return {
    title: n.titulo, nav: 'noticias', crumbs: [['Notícias', '/noticias'], [n.titulo]],
    panel: painel ? { kind: 'noticia', id: n.id } : null,
    html: `<a class="back-link" href="#${newsHref({ aba })}">${icon('arrowLeft', 16)}Voltar às notícias</a>
    <article class="article">
      <div class="news-meta">${tipoTag(n.tipo)}<span>${n.data}</span></div>
      <h1 class="h1" style="margin-top:8px">${esc(n.titulo)}</h1>
      <p class="meta" style="margin-top:6px">${esc(n.fonte)}</p>
      <div class="btn-row" style="margin:16px 0 24px">
        ${state.session
          ? `<button type="button" class="btn btn-primary" data-action="open-panel" data-kind="noticia" data-id="${n.id}">${icon('wallet', 18)}Impacto na carteira</button>`
          : `<a class="btn btn-primary" href="#/acesso?destino=${encodeURIComponent('/noticias/' + n.id + '?painel=1')}">${icon('wallet', 18)}Impacto na carteira</a>`}
        ${n.real ? fonteLink(n, 'btn btn-outline', 'Abrir reportagem original') : ''}
      </div>
      <figure class="news-figure">${newsImage(n, '-m')}<figcaption class="meta">Fonte: ${esc(n.fonte.replace(/^Fonte demo · /, ''))} · ${n.real ? 'Notícia real, resumida para o protótipo' : 'Notícia fictícia'} · Imagem ilustrativa</figcaption></figure>
      <p class="news-summary">${esc(n.resumo)}</p>
      ${n.detalhe.map(([t, p]) => `<h2 class="h3" style="margin-top:20px">${esc(t)}</h2><p style="margin-top:4px">${esc(p)}</p>`).join('')}
      <p class="meta" style="margin-top:16px">${n.real ? `Resumo escrito para o protótipo a partir de reportagem de ${esc(n.fonte)}. Os preços mostrados no app são simulados.` : 'Texto fictício, escrito para a demonstração do protótipo.'}</p>
      ${n.ativos.length ? `<p style="margin-top:24px" class="meta">Ativos citados: ${n.ativos.map((c) => `<a href="#/ativos/${c}?de=${n.id}">${esc(ativo(c).name)} · ${c}</a>`).join(', ')}</p>` : ''}
    </article>`,
  };
}

/* Painel “Impacto na carteira”: nível (Alto/Médio/Baixo) · por que pode ter impacto · variação no período.
   O nível é uma regra simples e explícita: ligação com a notícia + peso do ativo na carteira. Não é previsão. */
const pctPeso = (p) => nf0.format(p) + '%';
const nomes = (codes) => { const ns = codes.map((c) => ativo(c).name); return ns.length > 1 ? ns.slice(0, -1).join(', ') + ' e ' + ns[ns.length - 1] : ns[0]; };
const SETOR_TXT = { Financeiro: 'setor financeiro', 'Bens industriais': 'setor de bens industriais' };
const setorTxt = (lista) => { const t = [...new Set(lista)].map((x) => SETOR_TXT[x] || 'setor de ' + x.toLowerCase()); return t.length > 1 ? t.slice(0, -1).join(', ') + ' e ' + t[t.length - 1] : t[0]; };
/* Primeiro parágrafo do painel: só a ligação básica entre você e a notícia. */
const artDe = (code) => `${ARTIGO[code] || 'da'} ${ativo(code).name}`;
const listaAcoes = (codes) => { const t = codes.map(artDe); return t.length > 1 ? t.slice(0, -1).join(', ') + ' e ' + t[t.length - 1] : t[0]; };
function porqueImpacto(n, rel, peso) {
  if (rel.vazia) return 'Sua carteira ainda não tem ações.';
  if (rel.estado === 'insuf') return 'A notícia não diz quais empresas estão envolvidas.';
  if (rel.estado === 'direta') {
    const um = rel.codes.length === 1;
    return `Você tem ações ${listaAcoes(rel.codes)}. ${um ? 'Essa ação é' : 'Juntas, elas são'} ${pctPeso(peso)} da sua carteira.`;
  }
  if (rel.estado === 'indireta') {
    const setores = setorTxt(rel.codes.map((c) => ativo(c).setor));
    return `Você tem ações ${listaAcoes(rel.codes)}, que ${rel.codes.length > 1 ? 'são' : 'é'} do ${setores}. A notícia mexe com esse setor.`;
  }
  if (n.ativos.length) return `Você não tem ações ${listaAcoes(n.ativos)}.`;
  return `Você não tem ações do ${setorTxt(n.setoresAfetados || [])}.`;
}

/* Possível mudança: aparece quando a ação ainda não mudou de preço ou quando o evento ainda vai acontecer. */
const POSSIVEL = {
  alta: { label: 'Pode subir', icon: 'arrowUp', cls: 'trend-up' },
  baixa: { label: 'Pode cair', icon: 'arrowDown', cls: 'trend-down' },
  incerta: { label: 'Pode subir ou cair', icon: 'approx', cls: 'trend-flat' },
  neutra: { label: 'Pouca mudança esperada', icon: 'minus', cls: 'trend-flat' },
};
function possivelMudanca(n, quem) {
  if (!n.possivel) return '';
  const [dir, texto] = n.possivel, d = POSSIVEL[dir];
  return `${quem ? `<p class="meta" style="margin-bottom:4px">${quem}</p>` : ''}
    <p><span class="trend ${d.cls} possivel-tag">${icon(d.icon, 14)}${d.label}</span></p>
    <p style="margin-top:6px">${esc(texto)}</p>
    <p class="imp-note">${icon('info', 16)}<span>É uma possibilidade, não uma previsão.</span></p>`;
}

function nivelImpacto(estado, peso) {
  if (estado === 'direta') return peso >= 40 ? { n: 3, label: 'Impacto alto' } : peso >= 10 ? { n: 2, label: 'Impacto médio' } : { n: 1, label: 'Impacto baixo' };
  if (estado === 'indireta') return { n: 1, label: 'Impacto baixo' };
  if (estado === 'sem') return { n: 0, label: 'Sem impacto identificado' };
  return { n: null, label: 'Não dá para medir' };
}
function impactoMedidor(nivel) {
  const barras = [1, 2, 3].map((i) => `<span class="${nivel.n != null && i <= nivel.n ? 'on' : ''}"></span>`).join('');
  return `<div class="imp-level">
      <p class="imp-level-text">${nivel.label}</p>
      <div class="imp-meter ${nivel.n == null ? 'unknown' : ''}" aria-hidden="true">${barras}</div>
      <div class="imp-scale" aria-hidden="true"><span>Baixo</span><span>Médio</span><span>Alto</span></div>
    </div>`;
}
const impBlock = (label, html) => `<section class="imp-block"><h3 class="imp-label">${label}</h3><div class="imp-value">${html}</div></section>`;

function panelNoticia(id) {
  const n = NOTICIAS.find((x) => x.id === id);
  if (!n) return null;
  const rel = relacaoNoticia(n);
  const aba = parseHash().q.get('aba') || 'carteira';
  const fonteBtn = `<a class="btn btn-outline" href="#/noticias/${n.id}${aba ? '?aba=' + aba : ''}">Ver fonte</a>`;

  if (rel.semSessao) {
    return { title: 'Impacto na carteira', body: `<p class="imp-about">Sobre: ${esc(n.titulo)}</p><p>Entre para ver o impacto desta notícia na sua carteira.</p>`,
      foot: `<a class="btn btn-yellow" href="#/acesso?destino=${encodeURIComponent(location.hash.slice(1))}">Entrar para ver minha carteira</a>${fonteBtn}` };
  }

  const w = carteira();
  const grupos = (rel.codes || []).map((c) => w.itens.find((i) => i.a.code === c)).filter(Boolean);
  const peso = grupos.reduce((s, g) => s + g.peso, 0);
  const nivel = nivelImpacto(rel.estado, peso);
  const porque = porqueImpacto(n, rel, peso);
  // Para testar: se a carteira não tem a empresa da notícia, oferece comprar na demo e voltar aqui.
  const simular = n.ativos.length && rel.estado !== 'direta'
    ? `<p class="note demo-note">${icon('cart', 18)}<span>Quer testar? <a href="#/ativos/${n.ativos[0]}?comprar=demo&de=${n.id}&aba=${aba}">Compre ${esc(ativo(n.ativos[0]).name)} na demo</a> e volte aqui para ver o impacto.</span></p>` : '';

  const topo = `<p class="imp-about">Sobre: ${esc(n.titulo)}</p>
    ${impactoMedidor(nivel)}
    <div class="imp-tagline">${relTag(rel.estado)}</div>
    <p class="meta">O nível considera a ligação com a notícia e o peso do ativo na sua carteira. Não é uma previsão.</p>`;

  const explica = (n.aconteceu ? impBlock('O que aconteceu', esc(n.aconteceu)) : '')
    + (n.mexe ? impBlock(rel.estado === 'direta' ? 'Por que isso mexe com a ação' : 'Por que isso pode mexer com o preço', esc(n.mexe)) : '');

  if (!grupos.length) {
    const quem = rel.estado === 'sem' && n.ativos.length ? `Para quem tem ações ${listaAcoes(n.ativos)}. Sua carteira não muda por isso, porque você não tem essa ação.` : '';
    const poss = rel.estado === 'sem' && n.possivel ? impBlock('Possível mudança', possivelMudanca(n, quem)) : '';
    return { title: 'Impacto na carteira', body: topo + impBlock('Por que pode ter impacto', esc(porque)) + explica + poss + simular,
      foot: rel.estado === 'sem' ? `<button type="button" class="btn btn-primary" data-action="close-panel">Voltar às notícias</button>${fonteBtn}` : fonteBtn };
  }

  const delta = grupos.reduce((s, g) => s + g.delta, 0), anterior = grupos.reduce((s, g) => s + g.anterior, 0);
  const pct = anterior ? (delta / anterior) * 100 : 0;
  const g = grupos[0];
  const nomesCarteira = grupos.map((x) => `${esc(x.a.name)} · ${x.a.code}`).join(', ');
  const semMudanca = Math.abs(delta) < 0.005;
  const futuro = n.tipo === 'evento';
  const variacao = semMudanca ? '' : impBlock('Variação no período', `<p class="meta" style="margin-bottom:2px">${nomesCarteira} na sua carteira</p>
      <p class="imp-number">${trendValue(delta, pSbrl(delta))} ${trend(pct)}</p>
      <p class="meta">De ${REF.anteriorCurta} a ${REF.atualCurta}</p>
      <p class="imp-note">${icon('info', 16)}<span>${futuro
        ? 'O evento ainda não aconteceu. Essa variação não tem relação comprovada com ele.'
        : rel.estado === 'direta' ? 'É a variação do preço no período. Não prova que a notícia causou a mudança.'
        : 'Não dá para separar o efeito desta notícia nessa variação.'}</span></p>`);
  const poss = (semMudanca || futuro) && n.possivel
    ? impBlock('Possível mudança', possivelMudanca(n, semMudanca
      ? `${nomesCarteira}: o preço ainda não mudou (${fmt.brl(g.a.preco)} em ${REF.anteriorCurta} e em ${REF.atualCurta}).`
      : 'Depois do evento:'))
    : '';
  return {
    title: 'Impacto na carteira',
    body: topo + impBlock('Por que pode ter impacto', esc(porque)) + explica + variacao + poss + simular
      + `<p class="meta">Posição de ${REF.atual} · Preços simulados</p>`,
    foot: `<a class="btn btn-primary" href="#/ativos/${g.a.code}?de=${n.id}&aba=${aba}">${rel.estado === 'direta' ? 'Ver ativo' : 'Ver ' + esc(g.a.name)}</a>${fonteBtn}`,
  };
}
