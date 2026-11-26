/* Estrutura comum: rotas, navegação, cabeçalho, painel lateral e eventos. */

const $content = document.getElementById('conteudo');
const $sidebar = document.getElementById('sidebar');
const $topbar = document.getElementById('topbar');
const $footer = document.getElementById('footer');
const $panelRoot = document.getElementById('panel-root');

/* ---------- Rotas (design §1 · caminhos sugeridos) ---------- */
const ROUTES = [
  { re: /^\/$/, view: viewInicio },
  { re: /^\/mercado(?:\/(favoritos|avancada))?$/, view: viewMercado },
  { re: /^\/ativos\/([A-Za-z0-9]+)$/, view: viewFicha },
  { re: /^\/acesso$/, view: viewAcesso },
  { re: /^\/demo\/aviso$/, view: viewAviso },
  { re: /^\/noticias$/, view: viewNoticias },
  { re: /^\/noticias\/([a-z0-9]+)$/, view: viewMateria },
  { re: /^\/carteira$/, view: viewCarteira, private: true },
  { re: /^\/carteira\/investimentos(?:\/(posicao|garantias))?$/, view: viewInvestimentos, private: true },
  { re: /^\/carteira\/ia$/, view: viewIA, private: true },
  { re: /^\/carteira\/resumo$/, view: viewResumo, private: true },
  { re: /^\/perfil$/, view: viewPerfil, private: true },
  { re: /^\/demo\/resumo-email$/, view: viewResumoEmail },
  { re: /^\/proventos\/pagamento\/([a-z0-9-]+)$/, view: viewProvento, private: true },
  { re: /^\/extratos(?:\/(movimentacao|negociacao|eventos|ofertas))?$/, view: viewExtratos, private: true },
  { re: /^\/proventos(?:\/(visao|recebidos|a-receber|radar|calendario))?$/, view: viewProventos, private: true },
  { re: /^\/portabilidade(?:\/(transferir|solicitacoes))?$/, view: viewPortabilidade, private: true },
  { re: /^\/servicos(?:\/(ir|voto|calc|relatorios))?$/, view: viewServicos, private: true },
  { re: /^\/feedback$/, view: viewFeedback, private: true },
  { re: /^\/info\/([a-z]+)$/, view: viewInfo },
  { re: /^\/saida$/, view: viewSaida },
];

function parseHash() {
  let full = location.hash.slice(1);
  try { full = decodeURI(full); } catch (e) { /* endereço malformado: usa como veio */ }
  full = full || '/';
  const i = full.indexOf('?');
  const path = i < 0 ? full : full.slice(0, i);
  return { full, path: path || '/', q: new URLSearchParams(i < 0 ? '' : full.slice(i + 1)) };
}
const matchRoute = (path) => { for (const r of ROUTES) { const m = path.match(r.re); if (m) return { def: r, m }; } return null; };

/* Só destinos internos válidos passam pela tela de acesso. */
function safeDest(d) {
  if (!d || typeof d !== 'string' || d[0] !== '/' || d.startsWith('//') || /[\\:\s]/.test(d)) return null;
  const path = d.split('?')[0];
  if (path === '/acesso') return null;
  return matchRoute(path) ? d : null;
}

function go(path) {
  const target = '#' + path;
  if (location.hash === target) render(); else location.hash = target;
}
function rerender(focusSelector) { state.focusAfter = focusSelector || null; render({ keepScroll: true }); }

/* ---------- Renderização ---------- */
let firstRender = true;
function render(opts = {}) {
  const route = parseHash();
  const hit = matchRoute(route.path);
  if (hit && hit.def.private && !state.session) {
    location.replace('#/acesso?destino=' + encodeURIComponent(route.full));
    return;
  }
  route.m = hit ? hit.m : [];
  const v = hit ? hit.def.view(route) : viewNotFound();
  if (v.redirect) { location.replace('#' + v.redirect); return; }

  const pageKey = v.pageKey || route.path;
  const pageChanged = state.lastPage !== pageKey;
  state.lastPage = pageKey;
  closeDrawer(false);
  closePops();
  if (pageChanged && isCompact()) state.navOpen = {};

  renderSidebar(v.nav);
  renderTopbar(v, route);
  renderFooter();
  $content.innerHTML = v.html;
  document.title = `${v.title} · Área do Investidor B3 (protótipo)`;

  if (v.panel) openPanel(v.panel.kind, v.panel.id, { fromRoute: true, focus: pageChanged || firstRender });
  else if (panel.open) closePanel({ silent: true });

  if (state.focusAfter) {
    const el = document.querySelector(state.focusAfter);
    state.focusAfter = null;
    if (el) el.focus({ preventScroll: opts.keepScroll });
  } else if (pageChanged && !firstRender) {
    window.scrollTo(0, 0);
    const h = $content.querySelector('h1');
    if (h && !(v.panel && panel.open)) { h.tabIndex = -1; h.focus({ preventScroll: true }); }
  }
  firstRender = false;
}

/* ---------- Barra lateral ---------- */
const isCompact = () => matchMedia('(min-width: 768px) and (max-width: 1199px)').matches;
const isMobile = () => matchMedia('(max-width: 767px)').matches;

function navModel() {
  if (!state.session) {
    return [
      { key: 'inicio', label: 'Início', icon: 'home', href: '/' },
      { key: 'mercado', label: 'Acompanhar mercado', icon: 'chart', href: '/mercado' },
      { key: 'noticias', label: 'Notícias', icon: 'news', href: '/noticias', badge: 'Novo' },
    ];
  }
  return [
    { key: 'inicio', label: 'Início', icon: 'home', href: '/' },
    { group: 'carteira', label: 'Minha carteira', icon: 'wallet', children: [
      { key: 'carteira', label: 'Visão geral da carteira', href: '/carteira' },
      { key: 'investimentos', label: 'Investimentos', href: '/carteira/investimentos' },
      { key: 'mercado', label: 'Acompanhar mercado', href: '/mercado' },
      { key: 'ia', label: 'Análises com IA', href: '/carteira/ia' },
    ] },
    { key: 'noticias', label: 'Notícias', icon: 'news', href: '/noticias', badge: 'Novo' },
    { key: 'extratos', label: 'Extratos', icon: 'file', href: '/extratos' },
    { key: 'proventos', label: 'Proventos', icon: 'coins', href: '/proventos' },
    { key: 'portabilidade', label: 'Portabilidade', icon: 'transfer', href: '/portabilidade' },
    { group: 'servicos', label: 'Serviços', icon: 'grid', children: [
      { key: 'servicos-ir', label: 'Calculadoras de IR', href: '/servicos/ir' },
      { key: 'servicos-voto', label: 'Voto a distância', href: '/servicos/voto' },
      { key: 'servicos-calc', label: 'CALC de Renda Fixa', href: '/servicos/calc' },
      { key: 'servicos-relatorios', label: 'Relatórios', href: '/servicos/relatorios' },
    ] },
  ];
}

function renderSidebar(current) {
  const link = (it, sub) => `<a class="nav-item" href="#${it.href}" ${it.key === current ? 'aria-current="page"' : ''} ${sub ? '' : `title="${esc(it.label)}"`}>
      ${it.icon ? icon(it.icon, 22) : ''}<span class="nav-label">${esc(it.label)}</span>${it.badge ? `<span class="badge-new">${it.badge}</span>` : ''}</a>`;
  const items = navModel().map((it) => {
    if (!it.group) return link(it);
    const hasCurrent = it.children.some((c) => c.key === current);
    const open = state.navOpen[it.group] ?? (hasCurrent && !isCompact());
    return `<div class="nav-group"><button type="button" class="nav-group-btn ${hasCurrent ? 'has-current' : ''}" data-action="toggle-group" data-group="${it.group}" aria-expanded="${open}" aria-controls="sub-${it.group}" title="${esc(it.label)}">
        ${icon(it.icon, 22)}<span class="nav-label">${esc(it.label)}</span>${icon('chevronDown', 16, 'chev')}${hasCurrent ? '<span class="sr-only">(seção atual)</span>' : ''}</button>
      <div class="subnav" id="sub-${it.group}" ${open ? '' : 'hidden'}>${it.children.map((c) => link(c, true)).join('')}</div></div>`;
  }).join('');
  $sidebar.innerHTML = `
    <a class="sidebar-logo" href="#/" aria-label="B3 — Início da Área do Investidor">${logo('negativo', 40)}</a>
    <nav class="nav" aria-label="Principal">${items}</nav>
    ${state.session ? `<div class="nav-bottom">${link({ key: 'feedback', label: 'Feedback', icon: 'message', href: '/feedback' })}</div>` : ''}`;
}

/* ---------- Cabeçalho ---------- */
function renderTopbar(v, route) {
  const crumbs = [['Início', '/'], ...(v.crumbs || [])];
  const unread = NOTIFICACOES.filter((n) => !state.lidas.includes(n.id)).length;
  const c = conta();
  $topbar.innerHTML = `
    <div class="topbar-left">
      <button type="button" class="icon-btn menu-btn" data-action="open-drawer" aria-label="Abrir menu" aria-expanded="false" aria-controls="sidebar">${icon('menu', 24)}</button>
      <span class="app-name">Área do Investidor</span>
      <nav class="crumbs" aria-label="Caminho"><ol>${crumbs.map(([l, h], i) => i === crumbs.length - 1
        ? `<li><span aria-current="page">${esc(l)}</span></li>` : `<li>${h ? `<a href="#${h}">${esc(l)}</a>` : esc(l)}</li>`).join('')}</ol></nav>
    </div>
    <div class="topbar-right">
      <span class="proto-tag">Protótipo acadêmico · Dados simulados</span>
      ${c ? `
        <div class="pop-wrap">
          <button type="button" class="icon-btn" data-action="toggle-pop" data-pop="pop-bell" aria-expanded="false" aria-controls="pop-bell" aria-label="Avisos${unread ? `, ${unread} não ${unread === 1 ? 'lido' : 'lidos'}` : ''}">${icon('bell', 22)}${unread ? `<span class="count" aria-hidden="true">${unread}</span>` : ''}</button>
          <div class="popover" id="pop-bell" hidden><h2>Avisos</h2>
            ${NOTIFICACOES.map((n) => { const lida = state.lidas.includes(n.id); return `<a class="notif" href="#${n.destino}" data-action="notif" data-id="${n.id}">
              <strong>${lida ? '' : '<span class="unread" aria-hidden="true"></span>'}${esc(n.titulo)}</strong>
              <span class="meta">${n.data} · ${lida ? 'Lido' : 'Não lido'} · </span><span class="meta" style="color:var(--brand-vivid);font-weight:600">${n.acao}</span></a>`; }).join('')}
          </div>
        </div>
        <button type="button" class="icon-btn" data-action="toggle-hide" aria-pressed="${state.hide}">${icon(state.hide ? 'eyeOff' : 'eye', 22)}<span class="btn-text">Ocultar valores</span></button>
        <div class="pop-wrap">
          <button type="button" class="icon-btn" data-action="toggle-pop" data-pop="pop-user" aria-expanded="false" aria-controls="pop-user" aria-label="Perfil: ${esc(c.nome)}">${icon('user', 22)}</button>
          <div class="popover" id="pop-user" hidden style="width:280px">
            <h2>${esc(c.nome)}</h2>
            <p class="meta" style="padding:0 8px 8px">CPF ${c.cpf} · ${esc(c.email)}<br>Conta fictícia, somente leitura.</p>
            <a class="menu-item" href="#/perfil">${icon('user', 18)}Perfil e preferências</a>
            <a class="menu-item" href="#/demo/resumo-email">${icon('mail', 18)}Prévia do resumo semanal</a>
            <a class="menu-item" href="#/demo/aviso">${icon('mail', 18)}Prévia de aviso por e-mail</a>
            <button type="button" class="menu-item" data-action="logout">${icon('logout', 18)}Sair</button>
          </div>
        </div>`
      : v.noCta ? '' : `<a class="btn btn-yellow" href="#/acesso?destino=${encodeURIComponent('/carteira')}"><span class="hide-sm">Entrar para ver minha carteira</span><span class="show-sm">Entrar</span></a>`}
    </div>`;
}

function renderFooter() {
  $footer.innerHTML = `<ul>
    <li><a href="#/info/atendimento">Atendimento</a></li>
    <li><a href="#/info/condicoes">Condições de uso</a></li>
    <li><a href="https://borainvestir.b3.com.br/" target="_blank" rel="noopener">Educação ${icon('external', 12)}<span class="sr-only">(abre site da B3 em nova aba)</span></a></li>
    <li><a href="#/info/acessibilidade">Acessibilidade</a></li>
    <li><a href="#/demo/aviso">Prévia de aviso por e-mail (demo)</a></li>
    <li><a href="#/demo/resumo-email">Prévia do resumo semanal (demo)</a></li>
    <li>Protótipo acadêmico · Squad Capital · Dados simulados, sem relação com contas reais</li>
  </ul>`;
}

/* ---------- Painel lateral ---------- */
const panel = { open: false, kind: null, id: null, modal: false };
const PANEL_PARAM = { noticia: 'painel', mudanca: 'porque', compra: 'comprar', corretora: 'comprar' };
const PANEL_BUILD = { noticia: panelNoticia, mudanca: panelMudanca, compra: panelCompra, corretora: panelCorretora };

function setParam(key, value) {
  const r = parseHash();
  if (value == null) r.q.delete(key); else r.q.set(key, value);
  const qs = r.q.toString();
  history.replaceState(null, '', '#' + r.path + (qs ? '?' + qs : ''));
}

function openPanel(kind, id, { fromRoute = false, focus = true, trigger = null } = {}) {
  const data = PANEL_BUILD[kind](id);
  if (!data) return;
  const r = parseHash();
  // matéria usa painel=1; lista usa o ID da notícia
  const valor = kind === 'compra' ? 'demo' : kind === 'corretora' ? 'corretora' : /^\/noticias\/\w+/.test(r.path) ? '1' : id;
  if (!fromRoute) setParam(PANEL_PARAM[kind], valor);
  const docked = kind === 'noticia' && matchMedia('(min-width: 1200px)').matches;
  Object.assign(panel, { open: true, kind, id, modal: !docked });
  panel.trigger = `[data-action="open-panel"][data-kind="${kind}"][data-id="${id}"]`;

  document.body.classList.toggle('with-panel', docked);
  $panelRoot.innerHTML = `${docked ? '' : '<div class="panel-backdrop" data-action="close-panel"></div>'}
    <aside class="side-panel ${docked ? 'docked' : ''}" ${docked ? 'role="complementary"' : 'role="dialog" aria-modal="true"'} aria-labelledby="panel-title" id="side-panel">
      <div class="panel-head"><h2 class="h2" id="panel-title" tabindex="-1">${esc(data.title)}</h2>
        <button type="button" class="icon-btn" data-action="close-panel" aria-label="Fechar painel">${icon('x', 22)}</button></div>
      <div class="panel-body">${data.body}</div>
      ${data.foot ? `<div class="panel-foot">${data.foot}</div>` : ''}
    </aside>`;
  document.querySelectorAll('[data-news]').forEach((el) => el.classList.toggle('is-active', kind === 'noticia' && el.dataset.news === id));
  if (!docked) document.body.style.overflow = 'hidden';
  if (focus) document.getElementById('panel-title').focus();
  if (!fromRoute) announce('Painel aberto: ' + data.title);
}

function closePanel({ silent = false } = {}) {
  if (!panel.open) return;
  const kind = panel.kind;
  panel.open = false;
  if (kind === 'compra') ui.compraOk = null;
  $panelRoot.innerHTML = '';
  document.body.classList.remove('with-panel');
  document.body.style.overflow = '';
  document.querySelectorAll('[data-news].is-active').forEach((el) => el.classList.remove('is-active'));
  if (silent) return;
  setParam(PANEL_PARAM[kind], null);
  const t = panel.trigger && document.querySelector(panel.trigger);
  if (t) t.focus(); else { const h = $content.querySelector('h1'); if (h) { h.tabIndex = -1; h.focus(); } }
}

/* ---------- Gaveta (celular) e popovers ---------- */
function openDrawer() {
  document.body.classList.add('drawer-open');
  document.getElementById('drawer-backdrop').hidden = false;
  const b = $topbar.querySelector('.menu-btn'); if (b) b.setAttribute('aria-expanded', 'true');
  const first = $sidebar.querySelector('a, button'); if (first) first.focus();
}
function closeDrawer(focusBtn = true) {
  if (!document.body.classList.contains('drawer-open')) return;
  document.body.classList.remove('drawer-open');
  document.getElementById('drawer-backdrop').hidden = true;
  const b = $topbar.querySelector('.menu-btn');
  if (b) { b.setAttribute('aria-expanded', 'false'); if (focusBtn) b.focus(); }
}
function closePops(except) {
  document.querySelectorAll('.popover').forEach((p) => {
    if (p.id === except) return;
    p.hidden = true;
    const b = document.querySelector(`[aria-controls="${p.id}"]`); if (b) b.setAttribute('aria-expanded', 'false');
  });
}

/* ---------- Ações do shell ---------- */
Object.assign(ACTIONS, {
  skip: (el, ev) => { ev.preventDefault(); $content.focus(); },
  'toggle-group': (el) => {
    const g = el.dataset.group, open = el.getAttribute('aria-expanded') !== 'true';
    if (isCompact()) state.navOpen = {};
    state.navOpen[g] = open;
    el.setAttribute('aria-expanded', open);
    document.querySelectorAll('.subnav').forEach((s) => { if (s.id !== 'sub-' + g && isCompact()) { s.hidden = true; const b = document.querySelector(`[aria-controls="${s.id}"]`); b && b.setAttribute('aria-expanded', 'false'); } });
    document.getElementById('sub-' + g).hidden = !open;
    if (open && isCompact()) document.querySelector(`#sub-${g} a`).focus();
  },
  'open-drawer': () => openDrawer(),
  'close-drawer': () => closeDrawer(),
  'toggle-hide': () => {
    state.hide = !state.hide; save();
    announce(state.hide ? 'Valores pessoais ocultos' : 'Valores pessoais visíveis');
    rerender('[data-action="toggle-hide"]');
  },
  'toggle-pop': (el) => {
    const id = el.dataset.pop, pop = document.getElementById(id), open = pop.hidden;
    closePops(id);
    pop.hidden = !open; el.setAttribute('aria-expanded', open);
    if (open) { const f = pop.querySelector('a, button'); f && f.focus(); }
  },
  notif: (el) => { if (!state.lidas.includes(el.dataset.id)) { state.lidas.push(el.dataset.id); save(); } },
  logout: () => {
    if (state.session) state.compras[state.session.conta] = [];
    state.session = null; state.hide = false; save();
    Object.assign(ui, { solicitacoes: [], votos: {}, compraOk: null }); ui.porta = { passo: 1, origem: '', destino: '', itens: {} };
    Object.assign(ui, { periodo: 'visita', feedbackEnviado: false }); ui.expand = {};
    announce('Você saiu. Dados pessoais removidos da tela.');
    go('/');
  },
  'open-panel': (el) => { if (el.dataset.kind === 'compra') ui.compraOk = null; openPanel(el.dataset.kind, el.dataset.id, { trigger: el }); },
  'close-panel': () => closePanel(),
  term: (el) => {
    const open = el.getAttribute('aria-expanded') !== 'true';
    el.setAttribute('aria-expanded', open);
    document.getElementById(el.getAttribute('aria-controls')).hidden = !open;
  },
  go: (el) => go(el.dataset.href),
  ext: (el) => toast(`“${el.dataset.name}” leva a um destino externo, que não faz parte do protótipo.`),
});

/* ---------- Delegação de eventos ---------- */
document.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-action]');
  if (el && ACTIONS[el.dataset.action]) {
    if (el.tagName === 'BUTTON' || el.dataset.action === 'skip') ev.preventDefault();
    ACTIONS[el.dataset.action](el, ev);
    return;
  }
  // Linha clicável: o link da célula continua sendo o alvo acessível
  const row = ev.target.closest('tr[data-href]');
  if (row && !ev.target.closest('a, button')) { go(row.dataset.href); return; }
  // Fechar popovers e submenu compacto ao clicar fora
  if (!ev.target.closest('.pop-wrap')) closePops();
  if (isCompact() && !ev.target.closest('.nav-group')) {
    document.querySelectorAll('.subnav').forEach((s) => (s.hidden = true));
    document.querySelectorAll('.nav-group-btn').forEach((b) => b.setAttribute('aria-expanded', 'false'));
    state.navOpen = {};
  }
});
// Abas-link: manter o foco na aba depois da troca de tela
document.addEventListener('click', (ev) => {
  const t = ev.target.closest('a[role="tab"]');
  if (t) state.focusAfter = `[data-tablist="${t.closest('[data-tablist]').dataset.tablist}"] [data-tab="${t.dataset.tab}"]`;
}, true);

document.addEventListener('input', (ev) => { const n = ev.target.dataset && ev.target.dataset.input; if (n && INPUTS[n]) INPUTS[n](ev.target, ev); });
document.addEventListener('change', (ev) => { const n = ev.target.dataset && ev.target.dataset.change; if (n && CHANGES[n]) CHANGES[n](ev.target, ev); });
document.addEventListener('submit', (ev) => { const n = ev.target.dataset.form; if (n && SUBMITS[n]) { ev.preventDefault(); SUBMITS[n](ev.target, ev); } });

document.addEventListener('keydown', (ev) => {
  // Setas nas abas
  const tab = ev.target.closest && ev.target.closest('[role="tab"]');
  if (tab && ['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(ev.key)) {
    const list = [...tab.closest('[role="tablist"]').querySelectorAll('[role="tab"]')];
    let i = list.indexOf(tab);
    i = ev.key === 'Home' ? 0 : ev.key === 'End' ? list.length - 1 : (i + (ev.key === 'ArrowRight' ? 1 : -1) + list.length) % list.length;
    ev.preventDefault();
    list[i].focus(); list[i].click();
    return;
  }
  // Enter na busca abre a ficha quando há um único resultado
  if (ev.key === 'Enter' && ev.target.dataset && ev.target.dataset.input === 'market-search') {
    const res = marketList(ev.target.dataset.key);
    if (res.length === 1) { ev.preventDefault(); go('/ativos/' + res[0].code + '?de=' + (ev.target.dataset.key === 'inicio' ? 'inicio' : '')); }
    return;
  }
  if (ev.key === 'Escape') {
    if (document.querySelector('.popover:not([hidden])')) { const open = document.querySelector('.popover:not([hidden])'); closePops(); const b = document.querySelector(`[aria-controls="${open.id}"]`); b && b.focus(); return; }
    if (panel.open) { closePanel(); return; }
    if (document.body.classList.contains('drawer-open')) { closeDrawer(); return; }
    if (isCompact() && document.querySelector('.subnav:not([hidden])')) {
      const s = document.querySelector('.subnav:not([hidden])'); s.hidden = true;
      const b = document.querySelector(`[aria-controls="${s.id}"]`); b.setAttribute('aria-expanded', 'false'); b.focus(); state.navOpen = {};
    }
  }
  // Foco preso no painel modal e na gaveta
  if (ev.key === 'Tab') {
    const box = panel.open && panel.modal ? document.getElementById('side-panel') : document.body.classList.contains('drawer-open') ? $sidebar : null;
    if (!box) return;
    const f = [...box.querySelectorAll('a[href], button:not([disabled]), [tabindex="0"], select, input')].filter((x) => x.offsetParent !== null);
    if (!f.length) return;
    if (ev.shiftKey && document.activeElement === f[0]) { ev.preventDefault(); f[f.length - 1].focus(); }
    else if (!ev.shiftKey && document.activeElement === f[f.length - 1]) { ev.preventDefault(); f[0].focus(); }
  }
});

let lastW = innerWidth;
addEventListener('resize', () => {
  if ((lastW >= 1200) !== (innerWidth >= 1200) || (lastW >= 768) !== (innerWidth >= 768)) { state.navOpen = {}; render({ keepScroll: true }); }
  lastW = innerWidth;
});
addEventListener('hashchange', () => render());
render();
