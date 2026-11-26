/* Telas públicas: Início, Acompanhar mercado, ficha do ativo, acesso e prévia de aviso. */

/* Estado de interface que não precisa ir para o endereço */
const ui = {
  market: { inicio: { lista: 'destaques', busca: '' }, mercado: { lista: 'destaques', busca: '' } },
  ibovPer: '1D',
  fichaPer: '1D',
  periodo: 'visita',
  compo: { aberto: false, aba: 'classe' },
  expand: {},
  posicao: { data: '24', filtroAberto: false, inst: '', aplicado: '' },
  extrato: { periodo: '30d', filtroAberto: false, baixarAberto: false, inst: '', ativo: '', aplicado: { inst: '', ativo: '' }, formato: 'PDF' },
  prov: { periodo: '3m', inst: '' },
  cal: { y: 2026, m: 10, filtro: 'todos' },
  rel: { aba: 'consolidado', tipo: 'Mensal', periodo: 'Outubro de 2026', formato: 'PDF' },
  feedbackEnviado: false,
  compraOk: null,
  compraQtd: 100,
  porta: { passo: 1, origem: '', destino: '', itens: {} },
  solicitacoes: [],
  votos: {},
};

/* Registro de ações delegadas (preenchido por cada arquivo de telas) */
const ACTIONS = {}, INPUTS = {}, CHANGES = {}, SUBMITS = {};

/* ---------- Componentes de mercado ---------- */
function btnTabs(items, current, { label, action, id }) {
  return `<div class="tabs" role="tablist" aria-label="${esc(label)}" data-tablist="${id}">
    ${items.map(([key, text]) => `<button type="button" role="tab" class="tab" data-tab="${key}" data-action="${action}" data-key="${key}" aria-selected="${key === current}" aria-controls="${id}-panel" tabindex="${key === current ? 0 : -1}">${esc(text)}</button>`).join('')}
  </div>`;
}

function ibovChart(key) {
  const per = ui.ibovPer, vals = ibovSeries(per);
  const min = Math.min(...vals), max = Math.max(...vals);
  return lineChart({
    values: vals, positive: vals[vals.length - 1] >= vals[0],
    title: `Gráfico do Ibovespa, período ${per}`,
    summary: `De ${fmt.int(vals[0])} pontos (${PERIODOS[per].from}) a ${fmt.int(IBOV.pontos)} pontos ${PERIODOS[per].label}. Mínima de ${fmt.int(min)} e máxima de ${fmt.int(max)} pontos.`,
  });
}

function ibovCard(key) {
  return `<section class="card" aria-labelledby="ibov-${key}">
    <div class="card-head">
      <div><h2 class="h2" id="ibov-${key}">Ibovespa</h2><p class="meta">Principal índice de ações da B3</p></div>
      <span class="meta nowrap">${REF.atual} · ${REF.pregao}</span>
    </div>
    <div class="quote-top"><span class="big">${fmt.pts(IBOV.pontos)}</span>${trend(ibovPct(), { size: 'lg' })}</div>
    <p class="meta">Variação em relação ao fechamento anterior, de ${fmt.pts(IBOV.anterior)}.</p>
    <div id="ibov-chart-${key}">${ibovChart(key)}</div>
    <div class="chart-controls">
      <div class="seg" role="group" aria-label="Período do gráfico">
        ${['1D', '1M', '1A'].map((p) => `<button type="button" data-action="ibov-per" data-per="${p}" data-key="${key}" aria-pressed="${ui.ibovPer === p}"><span aria-hidden="true">${p}</span><span class="sr-only">${{ '1D': '1 dia', '1M': '1 mês', '1A': '1 ano' }[p]}</span></button>`).join('')}
      </div>
      ${key === 'inicio' ? `<a href="#/mercado" class="btn btn-link">Ver mercado completo ${icon('arrowRight', 16)}</a>` : ''}
    </div>
  </section>`;
}
ACTIONS['ibov-per'] = (el) => {
  ui.ibovPer = el.dataset.per;
  const key = el.dataset.key;
  document.getElementById('ibov-chart-' + key).innerHTML = ibovChart(key);
  el.parentNode.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', b === el));
};

function marketList(key) {
  const s = ui.market[key];
  let list = ATIVOS.slice();
  if (s.lista === 'altas') list = list.filter((a) => varPct(a) > 0).sort((a, b) => varPct(b) - varPct(a));
  if (s.lista === 'baixas') list = list.filter((a) => varPct(a) < 0).sort((a, b) => varPct(a) - varPct(b));
  const q = norm(s.busca);
  if (q) list = list.filter((a) => norm(a.name).includes(q) || norm(a.code).includes(q));
  return list;
}

function marketBody(key) {
  const s = ui.market[key], list = marketList(key);
  if (!list.length) {
    const actions = (s.busca ? `<button type="button" class="btn btn-outline btn-sm" data-action="clear-search" data-key="${key}">Limpar busca</button>` : '') +
      (s.lista !== 'destaques' ? `<button type="button" class="btn btn-link btn-sm" data-action="market-tab" data-key="destaques" data-market="${key}">Ver Destaques</button>` : '');
    return emptyState({
      title: s.busca ? 'Nenhum ativo encontrado' : 'Nenhum ativo nesta lista',
      text: s.busca ? `Não há ativo com “${esc(s.busca)}” ${s.lista === 'destaques' ? 'na lista' : 'em ' + (s.lista === 'altas' ? 'Altas' : 'Baixas')}. Busque pelo nome ou pelo código, como PETR4 ou DEMO1.` : 'Não há ativos neste recorte na referência atual.',
      actions, iconName: 'search',
    });
  }
  return `<div class="table-wrap"><table>
    <caption class="sr-only">Ações — ${{ destaques: 'Destaques', altas: 'Maiores altas', baixas: 'Maiores baixas' }[s.lista]}, cotação de ${REF.atual}</caption>
    <thead><tr><th scope="col">Ativo</th><th scope="col" class="num">Preço</th><th scope="col" class="num">Variação no dia</th></tr></thead>
    <tbody>${list.map((a) => `<tr class="row-click" data-href="/ativos/${a.code}">
      <td><div class="asset-cell"><a href="#/ativos/${a.code}">${esc(a.name)}<span class="sr-only">, ${a.code}, abrir ficha</span></a><span class="asset-code" aria-hidden="true">${a.code}</span></div></td>
      <td class="num">${fmt.brl(a.preco)}</td>
      <td class="num">${trend(varPct(a))}</td></tr>`).join('')}</tbody>
  </table></div>`;
}

function marketCard(key, { title = 'Principais ações', headingId } = {}) {
  const s = ui.market[key];
  return `<section class="card" aria-labelledby="${headingId || 'mk-' + key}">
    <div class="card-head"><h2 class="h2" id="${headingId || 'mk-' + key}">${title}</h2><span class="meta">${REF.atualCurta}</span></div>
    ${btnTabs([['destaques', 'Destaques'], ['altas', 'Altas'], ['baixas', 'Baixas']], s.lista, { label: 'Lista de ações', action: 'market-tab', id: 'mt-' + key })}
    <div id="mt-${key}-panel" role="tabpanel" data-market-body="${key}">${marketBody(key)}</div>
  </section>`;
}

function searchBox(key, id) {
  const s = ui.market[key];
  return `<div class="search" role="search">
    <label for="${id}" class="sr-only">Buscar por nome ou código</label>
    ${icon('search', 20)}
    <input id="${id}" class="input" type="search" placeholder="Buscar por nome ou código" autocomplete="off" value="${esc(s.busca)}" data-input="market-search" data-key="${key}" aria-describedby="${id}-hint">
    <span id="${id}-hint" class="sr-only">Os resultados filtram a tabela de ações. Pressione Enter para abrir a ficha quando houver um único resultado.</span>
  </div>`;
}

function refreshMarket(key) {
  const body = document.querySelector(`[data-market-body="${key}"]`);
  if (body) body.innerHTML = marketBody(key);
}
INPUTS['market-search'] = (el) => {
  const key = el.dataset.key;
  ui.market[key].busca = el.value;
  refreshMarket(key);
  clearTimeout(INPUTS.t);
  INPUTS.t = setTimeout(() => {
    const n = marketList(key).length;
    announce(n ? `${n} ${n === 1 ? 'ativo encontrado' : 'ativos encontrados'}` : 'Nenhum ativo encontrado');
  }, 500);
};
ACTIONS['clear-search'] = (el) => {
  const key = el.dataset.key;
  ui.market[key].busca = '';
  const input = document.querySelector(`[data-input="market-search"][data-key="${key}"]`);
  if (input) { input.value = ''; input.focus(); }
  refreshMarket(key);
};
ACTIONS['market-tab'] = (el) => {
  const key = el.dataset.market || el.closest('[data-tablist]').dataset.tablist.replace('mt-', '');
  const lista = el.dataset.key;
  ui.market[key].lista = lista;
  const tl = document.querySelector(`[data-tablist="mt-${key}"]`);
  tl.querySelectorAll('[role=tab]').forEach((t) => {
    const on = t.dataset.key === lista;
    t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1;
  });
  refreshMarket(key);
  if (el.dataset.market) tl.querySelector(`[data-key="${lista}"]`).focus();
};

/* ---------- Início ---------- */
function viewInicio() {
  const c = conta();
  return {
    title: 'Início', crumbs: [], nav: 'inicio',
    html: `
    <div class="page-head">
      <div><h1 class="h1">Acompanhe o mercado</h1>
      <p class="meta lead">Dados de demonstração · ${REF.atual} · ${REF.pregao}</p></div>
      ${searchBox('inicio', 'busca-inicio')}
    </div>
    <div class="grid-12">
      <div class="span-7">${ibovCard('inicio')}</div>
      <div class="span-5">${marketCard('inicio')}</div>
    </div>
    ${c ? homeCarteira() : ''}
    <section class="card" style="margin-top:24px" aria-labelledby="mais">
      <h2 class="h3" id="mais">Mais da Área do Investidor</h2>
      <ul class="legend" style="margin-top:8px">
        <li><a class="btn btn-link btn-sm" href="#/info/sobre">Sobre a Área do Investidor</a></li>
        <li><a class="btn btn-link btn-sm" href="#/info/boletim">Boletim de mercado</a></li>
        <li><a class="btn btn-link btn-sm" href="#/info/faq">Perguntas frequentes</a></li>
        <li><a class="btn btn-link btn-sm" href="https://borainvestir.b3.com.br/" target="_blank" rel="noopener">Cursos e Bora Investir ${icon('external', 14)}<span class="sr-only">(abre site da B3 em nova aba)</span></a></li>
      </ul>
    </section>`,
  };
}

function homeCarteira() {
  const w = carteira();
  if (w.vazia) {
    return `<section class="card" style="margin-top:24px" aria-labelledby="hc">
      <div class="strip"><div><h2 class="h2" id="hc">Minha carteira</h2>
      <p class="muted">Seus investimentos vão aparecer aqui quando estiverem disponíveis.</p></div>
      <a class="btn btn-primary" href="#/carteira">Ver carteira</a></div></section>`;
  }
  const rec = provRecebidos().filter((p) => p.mes === '2026-11').reduce((s, p) => s + p.valor, 0);
  const prox = provAReceber().filter((p) => p.valor != null && p.dia).sort((a, b) => a.dia.localeCompare(b.dia))[0];
  const notaNoticia = NOTICIAS.find((n) => relacaoNoticia(n).estado === 'direta' && n.tipo !== 'evento');
  return `
  <section class="card" style="margin-top:24px" aria-labelledby="hc">
    <div class="strip">
      <div>
        <h2 class="h2" id="hc">Minha carteira</h2>
        <p class="meta">Posição de ${REF.atual}</p>
      </div>
      <div><span class="label meta">Valor atual</span><div class="big">${pBrl(w.atual)}</div></div>
      <div><span class="label meta">Desde a última visita (${REF.anteriorCurta})</span>
        <div style="margin-top:4px">${trendValue(w.delta, pSbrl(w.delta))} ${trend(w.pct)}</div></div>
      <a class="btn btn-primary" href="#/carteira">Ver carteira</a>
    </div>
    ${notaNoticia ? `<p class="note" style="margin-top:16px">${icon('bell', 18)}<span>${esc(notaNoticia.titulo)}. <a href="#/noticias?aba=carteira&painel=${notaNoticia.id}">Entender o impacto na carteira</a></span></p>` : ''}
  </section>
  <div class="grid-12" style="margin-top:24px">
    <section class="card span-4" aria-labelledby="hp"><h2 class="h3" id="hp">Proventos recebidos</h2>
      <p class="big" style="font-size:24px;line-height:30px;margin-top:8px">${pBrl(rec)}</p><p class="meta">Em novembro de 2026${prox ? ` · Próximo: ${pBrl(prox.valor)} em ${prox.data}` : ''}</p>
      <div class="card-foot"><a href="#/proventos">Ver proventos</a></div></section>
    <section class="card span-4" aria-labelledby="he"><h2 class="h3" id="he">Evolução patrimonial</h2>
      <p style="margin-top:8px">${pBrl(w.anterior)} <span class="meta">em 23 nov</span></p>
      <p>${pBrl(w.atual)} <span class="meta">em 24 nov</span></p>
      <p class="meta">Mais datas aparecem quando houver posições anteriores.</p>
      <div class="card-foot"><a href="#/carteira">Ver carteira</a></div></section>
    <section class="card span-4" aria-labelledby="hm"><h2 class="h3" id="hm">Últimas movimentações</h2>
      <ul class="stack-sm" style="margin-top:8px;gap:6px">${extratoBase('movimentacao').slice(0, 2).map((m) => `<li><strong>${ativo(m.code).name}</strong> · ${esc(m.mov)}<br><span class="meta">${m.data} · ${m.inst}</span></li>`).join('')}</ul>
      <div class="card-foot"><a href="#/extratos/movimentacao">Ver extrato</a></div></section>
  </div>`;
}

/* ---------- Acompanhar mercado ---------- */
function viewMercado(route) {
  const aba = route.m[1] || 'visao';
  let body = '';
  if (aba === 'visao') {
    body = `<div class="query-bar">${searchBox('mercado', 'busca-mercado')}</div>
      <div class="grid-12">
        <div class="span-7">${ibovCard('mercado')}</div>
        <div class="span-5">${marketCard('mercado', { title: 'Ações' })}</div>
      </div>
      <p class="note" style="margin-top:24px">${icon('news', 18)}<span>Notícias, comunicados e eventos das empresas ficam em <a href="#/noticias">Notícias</a>.</span></p>`;
  } else if (aba === 'favoritos') {
    if (!state.session) {
      body = emptyState({ title: 'Entre para salvar favoritos', text: 'Favoritos guardam as cotações que você quer acompanhar. Favorito não significa que você tem o ativo.',
        actions: `<a class="btn btn-yellow" href="#/acesso?destino=${encodeURIComponent('/mercado/favoritos')}">Entrar para ver minha carteira</a>`, iconName: 'star' });
    } else {
      const favs = state.favoritos.map(ativo).filter(Boolean);
      const outros = ATIVOS.filter((a) => !state.favoritos.includes(a.code));
      body = `<p class="muted" style="margin-bottom:16px">Acompanhe cotações que você escolheu. Favorito não significa que você tem o ativo.</p>
      <form class="query-bar" data-form="add-fav">
        <div class="field"><label for="add-fav">Adicionar ativo</label>
          <select id="add-fav" class="select" name="code">${outros.map((a) => `<option value="${a.code}">${esc(a.name)} · ${a.code}</option>`).join('')}</select></div>
        <button class="btn btn-primary" type="submit" ${outros.length ? '' : 'disabled'}>Adicionar</button>
      </form>
      ${favs.length ? `<div class="card"><div class="table-wrap"><table><caption class="sr-only">Favoritos</caption>
        <thead><tr><th scope="col">Ativo</th><th scope="col" class="num">Preço</th><th scope="col" class="num">Variação no dia</th><th scope="col"><span class="sr-only">Ações</span></th></tr></thead>
        <tbody>${favs.map((a) => `<tr><td><div class="asset-cell"><a href="#/ativos/${a.code}">${esc(a.name)}</a><span class="asset-code">${a.code}</span></div></td>
          <td class="num">${fmt.brl(a.preco)}</td><td class="num">${trend(varPct(a))}</td>
          <td class="num"><button type="button" class="btn btn-link btn-sm" data-action="fav-remove" data-code="${a.code}">Remover<span class="sr-only"> ${esc(a.name)} dos favoritos</span></button></td></tr>`).join('')}</tbody></table></div>
          <p class="meta" style="margin-top:8px">Cotações de ${REF.atual}.</p></div>`
        : emptyState({ title: 'Você ainda não tem favoritos', text: 'Use “Adicionar ativo” acima ou o botão Favoritar na ficha de um ativo.', iconName: 'star' })}`;
    }
  } else {
    body = `<section class="card" aria-labelledby="heat"><div class="card-head"><h2 class="h2" id="heat">Mapa de calor</h2><span class="meta">Variação no dia · ${REF.atualCurta}</span></div>
      <div class="heat">${ATIVOS.slice().sort((a, b) => varPct(b) - varPct(a)).map((a) => `<a href="#/ativos/${a.code}" class="${varPct(a) >= 0 ? 'h-up' : 'h-down'}"><strong>${a.code}</strong><br><span class="meta" style="color:var(--text)">${esc(a.name)}</span><br>${trend(varPct(a))}</a>`).join('')}</div></section>
      <p class="note neutral" style="margin-top:16px">${icon('info', 18)}<span>Gráfico avançado e indicadores técnicos entram na próxima rodada do protótipo.</span></p>`;
  }
  return {
    title: 'Acompanhar mercado', nav: 'mercado', pageKey: 'mercado',
    crumbs: state.session ? [['Minha carteira', '/carteira'], ['Acompanhar mercado']] : [['Acompanhar mercado']],
    html: `<div class="page-head"><div><h1 class="h1">Acompanhar mercado</h1><p class="meta lead">Dados de demonstração · ${REF.atual} · ${REF.pregao}</p></div></div>
      ${tabs([['visao', 'Visão geral'], ['favoritos', 'Favoritos'], ['avancada', 'Análise avançada']], aba, { label: 'Seções de mercado', id: 'mercado', hrefFor: (k) => (k === 'visao' ? '/mercado' : '/mercado/' + k) })}
      ${body}`,
  };
}
SUBMITS['add-fav'] = (form) => {
  const code = form.code.value;
  if (code && !state.favoritos.includes(code)) state.favoritos.push(code);
  save(); toast(`${ativo(code).name} adicionado aos favoritos`);
  rerender('#add-fav');
};
ACTIONS['fav-remove'] = (el) => {
  state.favoritos = state.favoritos.filter((c) => c !== el.dataset.code);
  save(); toast(`${ativo(el.dataset.code).name} removido dos favoritos`);
  rerender('#add-fav');
};

/* ---------- Ficha do ativo ---------- */
function fichaChart(a) {
  const per = ui.fichaPer, vals = ativoSeries(a, per);
  return lineChart({
    values: vals, positive: vals[vals.length - 1] >= vals[0], title: `Gráfico de ${a.name}, período ${per}`,
    summary: `De ${fmt.brl(vals[0])} (${PERIODOS[per].from}) a ${fmt.brl(a.preco)} ${PERIODOS[per].label}. Mínima de ${fmt.brl(Math.min(...vals))} e máxima de ${fmt.brl(Math.max(...vals))}.`,
  });
}
ACTIONS['ficha-per'] = (el) => {
  ui.fichaPer = el.dataset.per;
  document.getElementById('ficha-chart').innerHTML = fichaChart(ativo(el.dataset.code));
  el.parentNode.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', b === el));
};

function viewFicha(route) {
  const a = ativo(route.m[1]);
  if (!a) return viewNotFound();
  const de = route.q.get('de');
  const n = de && NOTICIAS.find((x) => x.id === de);
  let back = `<a class="back-link" href="#/mercado">${icon('arrowLeft', 16)}Voltar ao mercado</a>`;
  if (n) back = `<a class="back-link" href="#/noticias?aba=${esc(route.q.get('aba') || 'carteira')}&painel=${n.id}">${icon('arrowLeft', 16)}Voltar à notícia</a>`;
  else if (de === 'carteira') back = `<a class="back-link" href="#/carteira">${icon('arrowLeft', 16)}Voltar à carteira</a>`;
  else if (de === 'inicio') back = `<a class="back-link" href="#/">${icon('arrowLeft', 16)}Voltar ao Início</a>`;

  const w = carteira();
  const g = w && w.itens.find((i) => i.a.code === a.code);
  const fav = state.favoritos.includes(a.code);
  const relacionadas = NOTICIAS.filter((x) => x.ativos.includes(a.code));
  const d1 = ativoSeries(a, '1D');

  return {
    title: `${a.name} (${a.code})`, nav: 'mercado',
    panel: route.q.get('comprar') === 'demo' && state.session ? { kind: 'compra', id: a.code } : route.q.get('comprar') === 'corretora' ? { kind: 'corretora', id: a.code } : null,
    crumbs: [['Acompanhar mercado', '/mercado'], [`${a.name} · ${a.code}`]],
    html: `${back}
    <div class="page-head">
      <div>
        <h1 class="h1">${esc(a.name)} <span class="asset-code" style="font-size:18px">${a.code}</span></h1>
        <p class="meta lead">${esc(a.setor)} · ${esc(a.tipo)} · ${a.real ? 'Empresa real · preço simulado' : 'Empresa fictícia'}</p>
      </div>
      <div class="btn-row" style="margin:0">
        <button type="button" class="btn btn-yellow" data-action="open-panel" data-kind="corretora" data-id="${a.code}">${icon('cart', 18)}Comprar</button>
        ${state.session
          ? `<button type="button" class="btn btn-outline btn-demo" data-action="open-panel" data-kind="compra" data-id="${a.code}">${icon('plus', 18)}Comprar na demo</button>`
          : `<a class="btn btn-outline btn-demo" href="#/acesso?destino=${encodeURIComponent('/ativos/' + a.code + '?comprar=demo')}">${icon('plus', 18)}Comprar na demo</a>`}
        ${state.session
          ? `<button type="button" class="btn btn-outline" data-action="fav-toggle" data-code="${a.code}" aria-pressed="${fav}">${icon('star', 18)}${fav ? 'Nos favoritos' : 'Favoritar'}</button>`
          : `<a class="btn btn-outline" href="#/acesso?destino=${encodeURIComponent('/ativos/' + a.code)}">${icon('star', 18)}Favoritar</a>`}
        <a class="btn btn-outline" href="#/noticias?aba=todo&ativo=${a.code}">${icon('news', 18)}Ver notícias deste ativo</a>
      </div>
    </div>
    <div class="grid-12">
      <div class="span-8 stack">
        <section class="card" aria-labelledby="cot">
          <h2 class="sr-only" id="cot">Cotação</h2>
          <div class="quote-top"><span class="big">${fmt.brl(a.preco)}</span>${trend(varPct(a), { size: 'lg' })}</div>
          <p class="meta">Cotação de ${REF.atual} · ${REF.pregao} · Fechamento anterior ${fmt.brl(a.anterior)}</p>
          <div id="ficha-chart">${fichaChart(a)}</div>
          <div class="seg" role="group" aria-label="Período do gráfico">
            ${['1D', '1M', '1A'].map((p) => `<button type="button" data-action="ficha-per" data-per="${p}" data-code="${a.code}" aria-pressed="${ui.fichaPer === p}"><span aria-hidden="true">${p}</span><span class="sr-only">${{ '1D': '1 dia', '1M': '1 mês', '1A': '1 ano' }[p]}</span></button>`).join('')}
          </div>
        </section>
        ${g ? naMinhaCarteira(g) : ''}
      </div>
      <div class="span-4 stack">
        <section class="card" aria-labelledby="info"><h2 class="h3" id="info">Informações do dia</h2>
          <dl class="dl" style="margin-top:12px;grid-template-columns:1fr 1fr">
            <div><dt>Abertura</dt><dd>${fmt.brl(d1[0])}</dd></div>
            <div><dt>Fechamento anterior</dt><dd>${fmt.brl(a.anterior)}</dd></div>
            <div><dt>Mínima</dt><dd>${fmt.brl(Math.min(...d1))}</dd></div>
            <div><dt>Máxima</dt><dd>${fmt.brl(Math.max(...d1))}</dd></div>
          </dl>
          <p class="meta" style="margin-top:12px">Outras medidas e eventos ficam em Análise avançada.</p>
        </section>
        <section class="card" aria-labelledby="nr"><h2 class="h3" id="nr">Notícias deste ativo</h2>
          ${relacionadas.length ? `<ul class="stack-sm" style="margin-top:12px">${relacionadas.map((x) => `<li>${tipoTag(x.tipo)} <span class="meta">${x.data}</span><br><a href="#/noticias/${x.id}">${esc(x.titulo)}</a></li>`).join('')}</ul>`
            : '<p class="muted" style="margin-top:8px">Nenhuma notícia recente para este ativo.</p>'}
        </section>
      </div>
    </div>`,
  };
}

function naMinhaCarteira(g) {
  return `<section class="card" aria-labelledby="nmc">
    <div class="card-head"><h2 class="h2" id="nmc">Na minha carteira</h2><span class="meta">Posição de ${REF.atual}</span></div>
    <div class="kpis">
      <div class="kpi"><div class="label">Quantidade</div><div class="value h2">${pQtd(g.qtd)} ações</div><div class="sub meta">${g.insts.length} ${g.insts.length > 1 ? 'instituições' : 'instituição'}</div></div>
      <div class="kpi"><div class="label">Valor atual</div><div class="value h2">${pBrl(g.atual)}</div></div>
      <div class="kpi"><div class="label">Mudança de 23 a 24 nov</div><div class="value h2">${trendValue(g.delta, pSbrl(g.delta))}</div><div class="sub">${trend(g.pct)}</div></div>
    </div>
    <div class="table-wrap" style="margin-top:16px"><table><caption class="sr-only">Contribuição por instituição</caption>
      <thead><tr><th scope="col">Instituição</th><th scope="col" class="num">Quantidade</th><th scope="col" class="num col-sec">Conta</th><th scope="col" class="num">Contribuição</th></tr></thead>
      <tbody>${g.insts.map((i) => `<tr><td>${i.inst}</td><td class="num">${pQtd(i.qtd)}</td><td class="num col-sec meta">${pQtd(i.qtd)} × ${fmt.sbrl(g.a.preco - g.a.anterior)}</td><td class="num">${trendValue(i.delta, pSbrl(i.delta))}</td></tr>`).join('')}</tbody>
    </table></div>
    <p class="meta" style="margin-top:8px">Contribuição de preço = quantidade × (preço de 24 nov − preço de 23 nov). ${g.demo ? 'Inclui compra feita na demo, considerada desde o fechamento de 23 nov.' : 'Não houve compras, vendas ou eventos no período.'}</p>
  </section>`;
}
ACTIONS['fav-toggle'] = (el) => {
  const code = el.dataset.code;
  const on = state.favoritos.includes(code);
  state.favoritos = on ? state.favoritos.filter((c) => c !== code) : [...state.favoritos, code];
  save();
  el.setAttribute('aria-pressed', !on);
  el.innerHTML = icon('star', 18) + (on ? 'Favoritar' : 'Nos favoritos');
  announce(on ? 'Removido dos favoritos' : 'Adicionado aos favoritos');
};

/* ---------- Comprar: na corretora (como no site real) e só na demo ---------- */
function panelCorretora(code) {
  const a = ativo(code);
  if (!a) return null;
  return {
    title: `Comprar ${a.name}`,
    body: `<p class="imp-about">${esc(a.name)} · ${a.code} · ${fmt.brl(a.preco)}</p>
      <p class="note">${icon('info', 18)}<span>A B3 não vende ações. A compra é feita pela sua corretora: você escolhe a corretora, envia a ordem e, depois da liquidação, a ação aparece aqui na Área do Investidor.</span></p>
      <section class="imp-block"><h3 class="imp-label">Continuar na sua corretora</h3>
        <ul class="broker-list">${CORRETORAS.map(([nome, url]) => `<li><a href="${url}" target="_blank" rel="noopener"><span>${esc(nome)}</span>${icon('external', 16)}<span class="sr-only">(abre o site da corretora em nova aba)</span></a></li>`).join('')}</ul>
        <p class="meta" style="margin-top:6px">Lista ilustrativa, em ordem alfabética. Não é recomendação. Na versão real, a lista viria das corretoras em que você tem conta.</p></section>
      <section class="imp-block demo-block"><h3 class="imp-label"><span class="demo-badge">Só no protótipo</span></h3>
        <p>Para testar, você pode simular a compra aqui mesmo e ver a ação na carteira, nas notícias e nos proventos.</p></section>`,
    foot: state.session
      ? `<button type="button" class="btn btn-outline btn-demo" data-action="open-panel" data-kind="compra" data-id="${a.code}">${icon('plus', 18)}Comprar na demo</button>`
      : `<a class="btn btn-outline btn-demo" href="#/acesso?destino=${encodeURIComponent('/ativos/' + a.code + '?comprar=demo')}">${icon('plus', 18)}Comprar na demo</a>`,
  };
}

function panelCompra(code) {
  const a = ativo(code);
  if (!a || !state.session) return null;
  const r = parseHash();
  const de = r.q.get('de'), aba = r.q.get('aba') || 'carteira';
  const nDe = de && NOTICIAS.find((x) => x.id === de);
  if (ui.compraOk && ui.compraOk.code === a.code) {
    const ok = ui.compraOk;
    const noticia = nDe || NOTICIAS.find((n) => n.ativos.includes(a.code));
    const prov = PROV_POR_ACAO[a.code];
    return {
      title: 'Compra adicionada',
      body: `<div class="imp-level ok-box"><p class="imp-level-text">${icon('check', 22)} ${pQtd(ok.qtd)} ações de ${esc(a.name)}</p>
          <p class="meta">${esc(ok.inst)} · ${fmt.brl(a.preco)} por ação · Total ${pBrl(ok.qtd * a.preco)}</p></div>
        <p>A ação já aparece na sua carteira demo. Veja onde ela muda as coisas:</p>
        <ul class="broker-list">
          <li><a href="#/carteira"><span>Visão geral da carteira</span>${icon('arrowRight', 16)}</a></li>
          ${noticia ? `<li><a href="#/noticias?aba=carteira&painel=${noticia.id}"><span>Impacto da notícia: ${esc(noticia.titulo)}</span>${icon('arrowRight', 16)}</a></li>` : ''}
          <li><a href="#/proventos/a-receber"><span>${prov ? 'Proventos a receber' : 'Proventos (sem pagamento previsto para esta ação)'}</span>${icon('arrowRight', 16)}</a></li>
          <li><a href="#/extratos/negociacao"><span>Extrato de negociação</span>${icon('arrowRight', 16)}</a></li>
        </ul>
        <p class="meta">Compra simulada: nenhuma ordem foi enviada e nenhum valor foi cobrado.</p>`,
      foot: nDe ? `<a class="btn btn-primary" href="#/noticias?aba=${esc(aba)}&painel=${nDe.id}">Voltar à notícia</a><button type="button" class="btn btn-outline" data-action="close-panel">Continuar no ativo</button>`
        : `<a class="btn btn-primary" href="#/carteira">Ver carteira</a><button type="button" class="btn btn-outline" data-action="close-panel">Continuar no ativo</button>`,
    };
  }
  const qtd = ui.compraQtd || 100;
  return {
    title: `Comprar ${a.name} na demo`,
    body: `<p class="note demo-note">${icon('info', 18)}<span><strong>Só no protótipo.</strong> No site real este botão não existe: a compra é feita na corretora. Aqui ela serve para testar a carteira, as notícias e os proventos.</span></p>
      <form class="stack-sm" id="form-compra" data-form="compra-demo" data-code="${a.code}">
        <div class="field"><label for="compra-qtd">Quantidade de ações</label>
          <input id="compra-qtd" class="input" name="qtd" type="number" inputmode="numeric" min="1" max="100000" step="1" value="${qtd}" required data-input="compra-qtd" data-preco="${a.preco}"></div>
        <div class="field"><label for="compra-inst">Corretora</label>
          <select id="compra-inst" class="select" name="inst">${INSTITUICOES_DEMO.map((i) => `<option>${i}</option>`).join('')}</select></div>
        <dl class="dl buy-sum">
          <div><dt>Preço por ação</dt><dd>${fmt.brl(a.preco)}</dd></div>
          <div><dt>Total</dt><dd id="compra-total">${fmt.brl(qtd * a.preco)}</dd></div>
        </dl>
        <p class="meta">Preço simulado de ${REF.atual}. A demo considera a ação na carteira desde ${REF.anteriorCurta}, para mostrar a variação e o impacto das notícias.</p>
      </form>`,
    foot: `<button type="submit" form="form-compra" class="btn btn-primary">${icon('plus', 18)}Adicionar à carteira</button><button type="button" class="btn btn-outline" data-action="close-panel">Cancelar</button>`,
  };
}
INPUTS['compra-qtd'] = (el) => {
  const q = Math.max(0, Math.floor(+el.value || 0));
  ui.compraQtd = q || 100;
  const t = document.getElementById('compra-total');
  if (t) t.textContent = fmt.brl(q * +el.dataset.preco);
};
SUBMITS['compra-demo'] = (form) => {
  const qtd = Math.floor(+form.qtd.value);
  if (!(qtd >= 1 && qtd <= 100000)) { form.qtd.focus(); toast('Informe uma quantidade entre 1 e 100.000.'); return; }
  const code = form.dataset.code, inst = form.inst.value;
  registrarCompra(code, qtd, inst);
  ui.compraOk = { code, qtd, inst };
  announce(`${qtd} ações de ${ativo(code).name} adicionadas à carteira demo`);
  rerender('#panel-title');
};

/* ---------- Acesso de demonstração ---------- */
function destinoLabel(dest) {
  if (!dest) return null;
  const [p, qs] = dest.split('?');
  const q = new URLSearchParams(qs || '');
  const nid = q.get('painel') && (p.split('/')[2] || q.get('painel'));
  const n = NOTICIAS.find((x) => x.id === nid);
  if (n) return `a notícia “${n.titulo}”, com a análise da sua carteira aberta`;
  const m = p.match(/^\/noticias\/(\w+)/);
  if (m && NOTICIAS.find((x) => x.id === m[1])) return `a notícia “${NOTICIAS.find((x) => x.id === m[1]).titulo}”`;
  const sm = p === '/carteira/resumo' && SEMANAS.find((x) => x.id === q.get('semana'));
  if (p === '/carteira/resumo') return `o Resumo semanal (${(sm || SEMANAS[0]).titulo.toLowerCase()})`;
  if (p.startsWith('/proventos/pagamento/')) return 'o detalhe do pagamento de provento';
  if (p === '/perfil') return 'Perfil e preferências';
  const map = { '/carteira': 'Visão geral da carteira', '/carteira/investimentos': 'Investimentos', '/noticias': 'Notícias', '/extratos': 'Extratos', '/proventos': 'Proventos', '/portabilidade': 'Portabilidade', '/servicos': 'Serviços', '/mercado/favoritos': 'Favoritos', '/feedback': 'Feedback' };
  const key = Object.keys(map).sort((a, b) => b.length - a.length).find((k) => p.startsWith(k));
  if (key) return map[key];
  const am = p.match(/^\/ativos\/(\w+)/);
  if (am && ativo(am[1])) return q.get('comprar') === 'demo' ? `a compra de ${ativo(am[1]).name} na demo` : `a ficha de ${ativo(am[1]).name}`;
  return null;
}

function viewAcesso(route) {
  const destino = safeDest(route.q.get('destino'));
  const label = destinoLabel(destino);
  const c = conta();
  return {
    title: 'Entre para ver sua carteira', crumbs: [['Acesso']], nav: null, noCta: true,
    html: `<div class="access"><section class="card access-card" aria-labelledby="acc">
      ${logo('profundo', 96)}
      <p class="proto-tag" style="display:inline-block;margin:20px 0 12px">Protótipo acadêmico · Dados simulados</p>
      ${c ? `<h1 class="h1" id="acc">Você já entrou</h1>
        <p style="margin-top:8px">Você está com a conta ${esc(c.nome)}.</p>
        <div class="btn-row"><a class="btn btn-primary" href="#${destino || '/carteira'}">Continuar</a></div>`
      : `<h1 class="h1" id="acc">Entre para ver sua carteira</h1>
      <p style="margin-top:8px">Esta é uma demonstração. Você entra com uma conta fictícia, já preenchida, sem senha, código ou CPF.</p>
      ${label ? `<p class="note" style="margin-top:16px">${icon('arrowRight', 18)}<span>Depois de entrar, você volta para ${esc(label)}.</span></p>` : ''}
      <div class="btn-row" style="margin-top:20px">
        <button type="button" class="btn btn-yellow" data-action="demo-login" data-conta="principal" data-destino="${esc(destino || '')}">Entrar com conta demo</button>
        <button type="button" class="btn btn-outline" data-action="back">Voltar</button>
      </div>
      <p class="meta" style="margin-top:16px">Dados fictícios. Conta: ${esc(CONTAS.principal.nome)} · CPF ${CONTAS.principal.cpf} · ${esc(CONTAS.principal.email)} (somente leitura).</p>
      <div class="card-foot" style="justify-content:flex-start">
        <span class="meta">Outro cenário:</span>
        <button type="button" class="btn btn-link btn-sm" data-action="demo-login" data-conta="vazia" data-destino="${esc(destino || '')}">Entrar com conta vazia (primeiro investimento)</button>
      </div>`}
    </section></div>`,
  };
}
ACTIONS['demo-login'] = (el) => {
  state.session = { conta: el.dataset.conta };
  state.lidas = [];
  save();
  announce('Você entrou com a conta demo. Dados fictícios.');
  go(safeDest(el.dataset.destino) || '/carteira');
};
ACTIONS.back = () => { if (history.length > 1) history.back(); else go('/'); };

/* ---------- Prévia de aviso por e-mail ---------- */
function viewAviso() {
  return {
    title: 'Prévia de aviso por e-mail', crumbs: [['Prévia de aviso']], nav: null,
    html: `<div class="page-head"><div><h1 class="h1">Prévia de aviso por e-mail</h1>
      <p class="meta lead">Demonstração de um convite externo. Nenhum e-mail é enviado.</p></div></div>
      <article class="card mail" aria-label="Exemplo de e-mail">
        <div class="mail-head">
          <p><strong>De:</strong> Área do Investidor B3 (demonstração)</p>
          <p><strong>Assunto:</strong> Uma novidade sobre seus investimentos</p>
        </div>
        ${logo('profundo', 72)}
        <p style="margin-top:16px">Olá,</p>
        <p style="margin-top:8px">Há uma novidade relacionada a um investimento que aparece na sua carteira. Entre na Área do Investidor para ver a notícia e entender o que mudou.</p>
        <div class="btn-row" style="margin-top:20px"><a class="btn btn-yellow" href="#/noticias?aba=carteira&painel=n1">Ver na Área do Investidor</a></div>
        <p class="meta" style="margin-top:20px">O aviso não mostra posições, quantidades ou valores. Você vê os detalhes depois de entrar.</p>
      </article>`,
  };
}

/* ---------- Páginas institucionais (conteúdo de exemplo) ---------- */
const INFO = {
  sobre: ['Sobre a Área do Investidor', [
    ['O que é', 'A Área do Investidor reúne, num só lugar, os investimentos que estão registrados no seu CPF na B3: ações, fundos, títulos e outros produtos, de todas as corretoras e bancos.'],
    ['O que dá para fazer', 'Consultar posição, extratos, proventos e relatórios, transferir investimentos entre instituições (portabilidade) e votar a distância em assembleias.'],
    ['O que não dá para fazer', 'Comprar ou vender. Ordens de compra e venda são enviadas pela sua corretora.'],
  ]],
  boletim: ['Boletim de mercado', [
    ['Resumo do pregão de 24 nov (demo)', 'O Ibovespa fechou em 130.000 pontos na demonstração, alta de 0,80%. Entre as ações da lista, a Vale caiu com o minério de ferro em baixa.'],
    ['Destaques da semana', 'Petrobras e Banco do Brasil seguem pressionadas depois dos balanços. Veja as reportagens em Notícias.'],
    ['Aviso', 'Boletim de exemplo, escrito para o protótipo. Índices e preços são simulados.'],
  ]],
  faq: ['Perguntas frequentes', [
    ['Comprei uma ação. Quando ela aparece aqui?', 'Depois da liquidação, que em ações à vista costuma ser em D+2 (dois dias úteis), e da atualização seguinte.'],
    ['Por que o valor da carteira é estimado?', 'Ele usa o preço de fechamento de cada ativo na data. O valor de venda real pode ser diferente.'],
    ['O que é provento?', 'É um valor que a empresa paga a quem tem a ação, como dividendos e juros sobre capital próprio.'],
    ['A Área do Investidor recomenda investimentos?', 'Não. Ela mostra informações. Decisões de investimento são suas, com apoio de profissionais se quiser.'],
  ]],
  atendimento: ['Atendimento', [
    ['Canais', 'Na versão real, esta página traz os canais oficiais de atendimento ao investidor.'],
    ['No protótipo', 'Nenhuma mensagem é enviada. Para comentar o protótipo, use a página Feedback depois de entrar.'],
  ]],
  condicoes: ['Condições de uso', [
    ['Protótipo acadêmico', 'Este site é um protótipo feito por estudantes. Ele não é o site oficial da B3 e não tem relação com contas reais.'],
    ['Dados', 'Todos os valores de carteira, preços e proventos são simulados. As notícias marcadas como reais foram resumidas a partir de reportagens, com link para a fonte.'],
    ['Privacidade', 'O protótipo não coleta dados pessoais. O que você faz aqui fica guardado só nesta aba do navegador.'],
  ]],
  acessibilidade: ['Acessibilidade', [
    ['Como navegar', 'Todas as telas funcionam pelo teclado. Use Tab para avançar, Shift+Tab para voltar e Esc para fechar painéis.'],
    ['Leitores de tela', 'Variações trazem palavra e sinal, além da cor. Valores ocultos são anunciados como "Valor oculto".'],
  ]],
};
function viewInfo(route) {
  const it = INFO[route.m[1]];
  if (!it) return viewNotFound();
  return {
    title: it[0], crumbs: [[it[0]]], nav: null,
    html: `<a class="back-link" href="#/">${icon('arrowLeft', 16)}Voltar ao Início</a>
      <div class="page-head"><div><h1 class="h1">${esc(it[0])}</h1><p class="meta lead">Conteúdo de exemplo do protótipo</p></div></div>
      <article class="card article" style="max-width:760px">${it[1].map(([t, p]) => `<h2 class="h3" style="margin-top:16px">${esc(t)}</h2><p style="margin-top:4px">${esc(p)}</p>`).join('')}</article>`,
  };
}

/* Saída para parceiro fictício: na versão real, o botão abriria o site do parceiro. */
function viewSaida(route) {
  const para = route.q.get('para') || 'site parceiro';
  const volta = safeDest(route.q.get('volta')) || '/';
  return {
    title: 'Saindo da Área do Investidor', crumbs: [['Site externo']], nav: null,
    html: `<div class="access"><section class="card access-card" aria-labelledby="saida">
      ${icon('external', 32)}
      <h1 class="h1" id="saida" style="margin-top:12px">Você está saindo da Área do Investidor</h1>
      <p style="margin-top:8px">Na versão real, este botão abre o site de <strong>${esc(para)}</strong> em uma nova aba. Os dados que você compartilhar lá seguem as regras desse parceiro.</p>
      <p class="meta" style="margin-top:8px">No protótipo, o parceiro é fictício, então a navegação para aqui.</p>
      <div class="btn-row" style="margin-top:20px"><a class="btn btn-primary" href="#${volta}">Voltar</a></div>
    </section></div>`,
  };
}

function viewNotFound() {
  return {
    title: 'Página não encontrada', crumbs: [['Página não encontrada']], nav: null,
    html: `<h1 class="h1" style="margin-bottom:16px">Página não encontrada</h1>
      ${emptyState({ title: 'Este endereço não existe no protótipo.', actions: '<a class="btn btn-primary" href="#/">Ir para o Início</a>' })}`,
  };
}
