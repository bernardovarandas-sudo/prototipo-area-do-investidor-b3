/* Estado, formatação, ícones e componentes compartilhados. */

/* ---------- Estado persistido na sessão do navegador ---------- */
const store = {
  get(key, fallback) {
    try { const v = sessionStorage.getItem('b3demo.' + key); return v == null ? fallback : JSON.parse(v); }
    catch (e) { return fallback; }
  },
  set(key, value) {
    try { sessionStorage.setItem('b3demo.' + key, JSON.stringify(value)); } catch (e) { /* sem armazenamento: segue em memória */ }
  },
};

const state = {
  session: store.get('session', null),        // { conta: 'principal' | 'vazia' }
  hide: store.get('hide', false),             // ocultar valores pessoais
  favoritos: store.get('favoritos', ['DEMO1', 'DEMO5']),
  lidas: store.get('lidas', []),
  compras: store.get('compras', {}),         // compras feitas na demo, por conta: { principal: [...], vazia: [...] }
  navOpen: {},                                // grupos abertos pelo usuário
  focusAfter: null,
  lastPath: null,
};

function save() {
  store.set('session', state.session);
  store.set('hide', state.hide);
  store.set('favoritos', state.favoritos);
  store.set('lidas', state.lidas);
  store.set('compras', state.compras);
}

const conta = () => (state.session ? CONTAS[state.session.conta] : null);

/* Compras feitas só na demo (o site real não tem este botão). Elas entram na carteira como se já estivessem lá
   no fechamento anterior, para a variação do período e o impacto das notícias aparecerem. */
const comprasDemo = () => (state.session ? state.compras[state.session.conta] || [] : []);
function posicoes() {
  const c = conta();
  if (!c) return [];
  return [...c.posicoes, ...comprasDemo().map((x) => ({ code: x.code, inst: x.inst, qtd: x.qtd, demo: true }))];
}
const temAtivo = (code) => posicoes().some((p) => p.code === code);
function registrarCompra(code, qtd, inst) {
  const a = ativo(code);
  const lista = state.compras[state.session.conta] || (state.compras[state.session.conta] = []);
  lista.push({ id: Date.now().toString(36), code: a.code, qtd, inst, preco: a.preco });
  save();
}

/* ---------- Formatação pt-BR ---------- */
const MINUS = '−';
const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const nf1 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });

const fmt = {
  brl: (n) => 'R$ ' + nf2.format(n),
  sbrl: (n) => (n > 0 ? '+' : n < 0 ? MINUS : '') + 'R$ ' + nf2.format(Math.abs(n)),
  pct: (n) => (n > 0 ? '+' : n < 0 ? MINUS : '') + nf2.format(Math.abs(n)) + '%',
  int: (n) => nf0.format(n),
  pts: (n) => nf0.format(n) + ' pts',
};

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/* Valor pessoal: mascarado quando “Ocultar valores” está ativo, sem expor a cifra. */
function pv(text) {
  return state.hide ? '<span class="masked" role="img" aria-label="Valor oculto">••••••</span>' : text;
}
const pBrl = (n) => pv(fmt.brl(n));
const pSbrl = (n) => pv(fmt.sbrl(n));
const pQtd = (n) => pv(fmt.int(n));

/* Variação com sinal, seta e palavra — nunca só cor. */
function trend(pct, { label = null, size = '' } = {}) {
  const dir = pct > 0 ? 'up' : pct < 0 ? 'down' : 'flat';
  const word = dir === 'up' ? 'Alta' : dir === 'down' ? 'Baixa' : 'Estável';
  const ic = dir === 'up' ? 'arrowUp' : dir === 'down' ? 'arrowDown' : 'minus';
  return `<span class="trend trend-${dir} ${size}">${icon(ic, 14)}<span class="sr-only">${word}: </span>${label ?? fmt.pct(pct)}</span>`;
}
function trendValue(n, html) {
  const dir = n > 0 ? 'up' : n < 0 ? 'down' : 'flat';
  return `<span class="tv tv-${dir}">${html}</span>`;
}

/* ---------- Dados derivados ---------- */
const ativo = (code) => ATIVOS.find((a) => a.code === code.toUpperCase());
const varPct = (a) => (a.preco / a.anterior - 1) * 100;
const ibovPct = () => (IBOV.pontos / IBOV.anterior - 1) * 100;

function carteira() {
  const c = conta();
  if (!c) return null;
  const grupos = {};
  posicoes().forEach((p) => {
    const a = ativo(p.code);
    const g = grupos[p.code] || (grupos[p.code] = { a, qtd: 0, atual: 0, anterior: 0, insts: [] });
    const atual = p.qtd * a.preco, anterior = p.qtd * a.anterior;
    g.qtd += p.qtd; g.atual += atual; g.anterior += anterior;
    const ja = g.insts.find((i) => i.inst === p.inst);
    if (ja) { ja.qtd += p.qtd; ja.atual += atual; ja.anterior += anterior; ja.delta = ja.atual - ja.anterior; ja.demo = ja.demo || !!p.demo; }
    else g.insts.push({ inst: p.inst, qtd: p.qtd, atual, anterior, delta: atual - anterior, demo: !!p.demo });
    g.demo = g.demo || !!p.demo;
  });
  const itens = Object.values(grupos).map((g) => ({ ...g, delta: g.atual - g.anterior, pct: (g.atual / g.anterior - 1) * 100 }));
  const atual = itens.reduce((s, g) => s + g.atual, 0);
  const anterior = itens.reduce((s, g) => s + g.anterior, 0);
  itens.forEach((g) => (g.peso = atual ? (g.atual / atual) * 100 : 0));
  return { itens, atual, anterior, delta: atual - anterior, pct: anterior ? (atual / anterior - 1) * 100 : 0, vazia: itens.length === 0 };
}

/* ---------- Ícones lineares (família única, 24×24, traço 1.75) ---------- */
const ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
  wallet: '<path d="M3 7a2 2 0 0 1 2-2h13v4"/><path d="M3 7v11a2 2 0 0 0 2 2h15V9H5a2 2 0 0 1-2-2Z"/><circle cx="16" cy="14.5" r="1.2"/>',
  news: '<path d="M4 5h13v14a2 2 0 0 0 2 2H6a2 2 0 0 1-2-2Z"/><path d="M17 9h3v10a2 2 0 0 1-2 2"/><path d="M7.5 9h6M7.5 12.5h6M7.5 16h4"/>',
  file: '<path d="M14 3H6v18h12V7Z"/><path d="M14 3v4h4"/><path d="M9 12h6M9 15.5h6"/>',
  coins: '<ellipse cx="9" cy="7" rx="6" ry="3"/><path d="M3 7v4c0 1.7 2.7 3 6 3s6-1.3 6-3V7"/><path d="M9 14v3c0 1.7 2.7 3 6 3s6-1.3 6-3v-4c0-1.6-2.4-2.9-5.5-3"/>',
  transfer: '<path d="M4 8h15l-4-4"/><path d="M20 16H5l4 4"/>',
  grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
  message: '<path d="M4 5h16v11H9l-5 4Z"/>',
  chart: '<path d="M3 20h18"/><path d="m4 16 5-5 4 3 7-8"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
  bell: '<path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15Z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff: '<path d="M4 4l16 16"/><path d="M9.9 5.8A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-2.9 3.7M6.4 7.4C3.9 9.1 2.5 12 2.5 12S6 18.5 12 18.5a9.3 9.3 0 0 0 4.3-1"/><path d="M10 10a3 3 0 0 0 4 4"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  chevronRight: '<path d="m9 6 6 6-6 6"/>',
  chevronLeft: '<path d="m15 6-6 6 6 6"/>',
  arrowLeft: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  arrowUp: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  arrowDown: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  minus: '<path d="M5 12h14"/>',
  external: '<path d="M14 4h6v6"/><path d="M20 4 11 13"/><path d="M18 14v6H4V6h6"/>',
  star: '<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9Z"/>',
  filter: '<path d="M4 5h16l-6 7.5V19l-4 1.5v-8Z"/>',
  download: '<path d="M12 4v11M7 10.5l5 5 5-5"/><path d="M4 19.5h16"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.3a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.2-2.4 3.8"/><path d="M12 17.2v.1"/>',
  alert: '<path d="M12 3.5 2.5 20h19Z"/><path d="M12 10v4.5M12 17.3v.1"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  sparkles: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4"/><path d="m6.5 6.5 2 2M15.5 15.5l2 2M17.5 6.5l-2 2M8.5 15.5l-2 2"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.6v.1"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  refresh: '<path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 4v5h-5"/>',
  approx: '<path d="M5 10c2-2 4-2 7 0s5 2 7 0M5 15c2-2 4-2 7 0s5 2 7 0"/>',
  logout: '<path d="M15 4h4v16h-4"/><path d="M10 8l-4 4 4 4M6 12h10"/>',
  cart: '<path d="M3 4h2.5l2.2 11h10.6L20.5 7H7"/><circle cx="9.5" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  mail: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>',
};
function icon(name, size = 20, cls = '') {
  return `<svg class="ic ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name] || ''}</svg>`;
}

/* ---------- Logotipo oficial com retorno textual se o arquivo não existir ---------- */
function logo(variant, width) {
  const file = { negativo: 'LOGO_B3-NEGATIVO-CROP.png', profundo: 'LOGO_B3-PROFUNDO-CROP.png' }[variant];
  return `<span class="logo logo-${variant}" style="--logo-w:${width}px"><img src="docs/b3/assets/${file}" alt="B3" width="${width}" onerror="this.parentNode.classList.add('logo-missing')"><span class="logo-text" aria-hidden="true">[B3]</span></span>`;
}

/* ---------- Componentes de marcação ---------- */
function tabs(items, current, { label, hrefFor, id = 'tabs' }) {
  return `<div class="tabs" role="tablist" aria-label="${esc(label)}" data-tablist="${id}">
    ${items.map(([key, text]) => `<a role="tab" href="#${hrefFor(key)}" data-tab="${key}" aria-selected="${key === current}" tabindex="${key === current ? 0 : -1}" class="tab">${esc(text)}</a>`).join('')}
  </div>`;
}

function emptyState({ title, text = '', actions = '', iconName = 'info', tone = '' }) {
  return `<div class="empty ${tone}" role="status">${icon(iconName, 24)}<div><p class="empty-title">${title}</p>${text ? `<p class="muted">${text}</p>` : ''}${actions ? `<div class="btn-row">${actions}</div>` : ''}</div></div>`;
}

function termHelp(key, label) {
  const id = 'termo-' + key + '-' + Math.random().toString(36).slice(2, 7);
  return `<span class="term"><button type="button" class="btn-term" aria-expanded="false" aria-controls="${id}" data-action="term">${icon('help', 16)}O que é ${esc(label)}?</button><span class="term-text" id="${id}" hidden>${esc(TERMOS[key])}</span></span>`;
}

const RELACAO = {
  direta: { label: 'Tem relação direta', icon: 'link', cls: 'rel-direta' },
  indireta: { label: 'Pode ter relação indireta', icon: 'approx', cls: 'rel-indireta' },
  sem: { label: 'Sem relação direta identificada', icon: 'minus', cls: 'rel-sem' },
  insuf: { label: 'Dados insuficientes', icon: 'help', cls: 'rel-insuf' },
};
const relTag = (estado) => `<span class="rel-tag ${RELACAO[estado].cls}">${icon(RELACAO[estado].icon, 16)}${RELACAO[estado].label}</span>`;
const tipoTag = (tipo) => `<span class="type-tag type-${tipo}">${TIPOS_NOTICIA[tipo]}</span>`;

/* ---------- Gráfico de linha simples (SVG), com resumo em texto ---------- */
function rng(seed) {
  let t = seed >>> 0;
  return () => { t += 0x6d2b79f5; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; };
}
function series(start, end, n, seed, vol) {
  const r = rng(seed); const pts = [0];
  for (let i = 1; i < n; i++) pts.push(pts[i - 1] + (r() - 0.5) * vol);
  const last = pts[n - 1];
  // caminho aleatório (vol em unidades absolutas) ancorado no início e no fim reais
  return pts.map((p, i) => start + (end - start) * (i / (n - 1)) + (p - (last * i) / (n - 1)));
}
function seedOf(s) { let h = 7; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; }
function ibovSeries(per) {
  return series(IBOV.inicio[per], IBOV.pontos, PERIODOS[per].n, seedOf('IBOV' + per), IBOV.pontos * 0.004);
}
function ativoSeries(a, per) {
  const start = per === '1D' ? a.anterior : per === '1M' ? a.preco * (1 - varPct(a) / 100 * 2.6) : a.preco * (0.82 + (seedOf(a.code) % 30) / 100);
  return series(start, a.preco, PERIODOS[per].n, seedOf(a.code + per), a.preco * 0.012);
}
const PERIODOS = { '1D': { n: 33, label: 'no dia', from: 'abertura (10h)' }, '1M': { n: 22, label: 'em 1 mês', from: '24 out' }, '1A': { n: 52, label: 'em 1 ano', from: 'nov 2025' } };

function lineChart({ values, title, summary, positive = true, height = 160 }) {
  const w = 600, h = height, pad = 8;
  const min = Math.min(...values), max = Math.max(...values), span = max - min || 1;
  const xy = values.map((v, i) => [pad + (i * (w - 2 * pad)) / (values.length - 1), pad + (1 - (v - min) / span) * (h - 2 * pad)]);
  const d = xy.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = d + ` L ${xy[xy.length - 1][0].toFixed(1)} ${h} L ${xy[0][0].toFixed(1)} ${h} Z`;
  const base = xy[0][1];
  return `<figure class="chart">
    <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-label="${esc(title + '. ' + summary)}">
      <line x1="0" x2="${w}" y1="${base.toFixed(1)}" y2="${base.toFixed(1)}" class="chart-base"/>
      <path d="${area}" class="chart-area ${positive ? 'pos' : 'neg'}"/>
      <path d="${d}" class="chart-line" vector-effect="non-scaling-stroke"/>
    </svg>
    <figcaption class="meta">${esc(summary)}</figcaption>
  </figure>`;
}

/* ---------- Anúncios para leitores de tela (uma vez, sem interromper) ---------- */
function announce(msg) {
  const el = document.getElementById('live');
  el.textContent = '';
  setTimeout(() => (el.textContent = msg), 60);
}
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg; el.hidden = false;
  clearTimeout(toast.t); toast.t = setTimeout(() => (el.hidden = true), 3800);
  announce(msg);
}

/* ---------- Arquivo de exemplo identificado como fictício ---------- */
function downloadDemo(nome, linhas) {
  const conteudo = ['ARQUIVO DE DEMONSTRAÇÃO · Protótipo acadêmico · Dados simulados', ...linhas].join('\n');
  const url = URL.createObjectURL(new Blob(['﻿' + conteudo], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = nome; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast('Arquivo de exemplo gerado: ' + nome);
}
