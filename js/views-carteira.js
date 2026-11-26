/* Minha carteira: visão geral, investimentos (posição e garantias) e Análises com IA. */

const CORES = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8'];
const cor = (i) => CORES[i % CORES.length];

function viewCarteira(route) {
  const w = carteira();
  const crumbs = [['Minha carteira', '/carteira'], ['Visão geral']];
  const porque = route.q.get('porque');

  if (w.vazia) {
    return {
      title: 'Visão geral da carteira', crumbs, nav: 'carteira',
      html: `<div class="page-head"><div><h1 class="h1">Visão geral da carteira</h1><p class="meta lead">Conta demo vazia · Dados simulados</p></div></div>
      ${emptyState({
        title: 'Seus investimentos vão aparecer aqui quando estiverem disponíveis.', iconName: 'wallet',
        actions: `<button type="button" class="btn btn-outline btn-sm" data-action="disclose" aria-expanded="false" aria-controls="como-comecar">Como começar</button>
                  <button type="button" class="btn btn-outline btn-sm" data-action="disclose" aria-expanded="false" aria-controls="nao-apareceu">Minha compra ainda não apareceu</button>`,
      })}
      <div class="note" id="como-comecar" hidden style="margin-top:12px">${icon('info', 18)}<span>A compra de ações acontece pela sua corretora, não pela Área do Investidor. Depois da compra e da liquidação, a posição passa a aparecer aqui. ${termHelp('liquidacao', 'liquidação')}</span></div>
      <div class="note" id="nao-apareceu" hidden style="margin-top:12px">${icon('info', 18)}<span>Em ações à vista, a liquidação costuma ocorrer em D+2 (dois dias úteis) e a posição aparece depois da atualização seguinte. Não dá para saber daqui o estado da sua ordem: se o prazo passou, confirme com a corretora.</span></div>
      ${demoBuyCta()}
      <p style="margin-top:24px">Enquanto isso, <a href="#/">acompanhe o mercado</a> ou veja <a href="#/noticias?aba=todo">as notícias</a>.</p>`,
    };
  }

  const comparavel = ui.periodo === 'visita';
  const ordenados = w.itens.slice().sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  return {
    title: 'Visão geral da carteira', crumbs, nav: 'carteira',
    panel: porque && ativo(porque) && w.itens.some((i) => i.a.code === porque.toUpperCase()) ? { kind: 'mudanca', id: porque.toUpperCase() } : null,
    html: `
    <div class="page-head"><div><h1 class="h1">Visão geral da carteira</h1><p class="meta lead">Posição de ${REF.atual} · Dados simulados</p></div></div>
    <div class="stack">
      <section class="card" aria-labelledby="resumo">
        <div class="card-head">
          <h2 class="h2" id="resumo">Resumo</h2>
          <div class="seg" role="group" aria-label="Período de comparação">
            <button type="button" data-action="periodo" data-p="visita" aria-pressed="${comparavel}">Desde a última visita</button>
            <button type="button" data-action="periodo" data-p="30d" aria-pressed="${!comparavel}">30 dias</button>
          </div>
        </div>
        <div class="kpis">
          <div class="kpi"><div class="label">Valor atual</div><div class="value big">${pBrl(w.atual)}</div><div class="sub meta">Em ${REF.atual}</div></div>
          <div class="kpi"><div class="label">Mudança no período</div>
            ${comparavel
              ? `<div class="value big">${trendValue(w.delta, pSbrl(w.delta))}</div><div class="sub">${trend(w.pct)} <span class="meta">de ${REF.anteriorCurta} a ${REF.atualCurta}</span></div>`
              : `<div class="value big" style="color:var(--neutral-text)">Indisponível</div><div class="sub meta">Não há posição de 30 dias atrás nesta demonstração.</div>`}
          </div>
          <div class="kpi"><div class="label">Valor anterior</div>
            ${comparavel ? `<div class="value big" style="color:var(--text)">${pBrl(w.anterior)}</div><div class="sub meta">Em ${REF.anterior}, sua última visita</div>`
              : `<div class="value big" style="color:var(--neutral-text)">Indisponível</div><div class="sub meta">Sem referência para o recorte</div>`}
          </div>
        </div>
        ${comparavel ? (comprasDemo().length
          ? `<p class="note demo-note" style="margin-top:16px">${icon('cart', 18)}<span>Inclui ${comprasDemo().length} ${comprasDemo().length === 1 ? 'compra feita' : 'compras feitas'} na demo. Para mostrar o efeito das notícias, a demo considera que essas ações já estavam na carteira no fechamento de ${REF.anteriorCurta}. <button type="button" class="btn btn-link btn-sm" data-action="desfazer-compras">Desfazer compras da demo</button></span></p>`
          : `<p class="note" style="margin-top:16px">${icon('info', 18)}<span>Não houve aportes, resgates ou eventos no período. Toda a mudança veio da variação de preço dos ativos.</span></p>`) : ''}
      </section>

      ${comparavel ? `<section class="card" aria-labelledby="mudou">
        <div class="card-head"><h2 class="h2" id="mudou">O que mudou</h2><span class="meta">Ordenado pela maior mudança em reais</span></div>
        <ul class="change-list">${ordenados.slice(0, 3).map((g) => `<li>
          <div><span class="asset-name">${esc(g.a.name)}</span> <span class="asset-code">${g.a.code}</span>
            <p class="meta">Preço foi de ${fmt.brl(g.a.anterior)} para ${fmt.brl(g.a.preco)} · ${pQtd(g.qtd)} ações</p></div>
          <div class="num">${trendValue(g.delta, pSbrl(g.delta))}<br>${trend(g.pct)}</div>
          <button type="button" class="btn btn-outline btn-sm" data-action="open-panel" data-kind="mudanca" data-id="${g.a.code}">Por que mudou?<span class="sr-only"> ${esc(g.a.name)}</span></button>
        </li>`).join('')}</ul>
        <p class="meta" style="margin-top:8px">Soma: ${pSbrl(w.delta)} = ${ordenados.map((g) => pSbrl(g.delta)).join(' ')}</p>
      </section>` : ''}

      <div class="grid-12">
        <section class="card span-5" aria-labelledby="compo">
          <div class="card-head"><h2 class="h2" id="compo">Composição da carteira</h2><span class="meta">Por ativo</span></div>
          <div class="compo-bar" role="img" aria-label="${w.itens.map((g) => `${g.a.name} ${nf1.format(g.peso)}%`).join(', ')}">
            ${w.itens.map((g, i) => `<span class="${cor(i)}" style="width:${g.peso}%"></span>`).join('')}</div>
          <ul class="legend">${w.itens.map((g, i) => `<li><span class="swatch ${cor(i)}"></span>${esc(g.a.name)} <strong>${nf1.format(g.peso)}%</strong></li>`).join('')}</ul>
          <div class="card-foot"><button type="button" class="btn btn-link btn-sm" data-action="compo-toggle" aria-expanded="${ui.compo.aberto}" aria-controls="compo-det">${ui.compo.aberto ? 'Ocultar composição' : 'Ver composição'}</button></div>
          <div id="compo-det" ${ui.compo.aberto ? '' : 'hidden'}>${compoDetalhe(w)}</div>
        </section>

        <section class="card span-7" aria-labelledby="ativos">
          <div class="card-head"><h2 class="h2" id="ativos">Ativos da carteira</h2><span class="meta">${REF.anteriorCurta} → ${REF.atualCurta}</span></div>
          <div class="table-wrap"><table><caption class="sr-only">Ativos da carteira</caption>
            <thead><tr><th scope="col">Ativo</th><th scope="col" class="num">Quantidade</th><th scope="col" class="num">Valor atual</th><th scope="col" class="num">Mudança</th></tr></thead>
            <tbody>${w.itens.map((g) => ativoRow(g)).join('')}</tbody>
          </table></div>
          <div class="card-foot"><a href="#/carteira/investimentos">Ir para posição</a><a href="#/extratos/movimentacao">Ver movimentações</a></div>
        </section>
      </div>
      ${demoBuyCta()}
    </div>`,
  };
}

/* Atalho só da demo para adicionar ações à carteira e testar notícias, proventos e extratos. */
function demoBuyCta() {
  return `<section class="card demo-card" aria-labelledby="demo-buy">
    <div class="strip"><div><span class="demo-badge">Só no protótipo</span><h2 class="h3" id="demo-buy" style="margin-top:6px">Adicione ações à carteira para testar</h2>
      <p class="meta">Na Área do Investidor real a compra é feita na corretora. Aqui você simula e vê o efeito em Notícias, Proventos e Extratos.</p></div>
      <a class="btn btn-outline" href="#/mercado">${icon('plus', 18)}Escolher ação</a></div>
    <p class="meta" style="margin-top:12px">Sugestões com notícia real: ${SUGESTOES_DEMO.map((c) => `<a href="#/ativos/${c}?comprar=demo">${ativo(c).name} (${c})</a>`).join(' · ')}</p>
  </section>`;
}
const SUGESTOES_DEMO = ['PETR4', 'VALE3', 'ITUB4', 'BBAS3', 'MGLU3', 'WEGE3'];
ACTIONS['desfazer-compras'] = () => {
  state.compras[state.session.conta] = []; save();
  toast('Compras da demo desfeitas. A carteira voltou ao início.');
  rerender('#resumo');
};

function ativoRow(g) {
  const multi = g.insts.length > 1, key = 'inst-' + g.a.code, open = !!ui.expand[key];
  return `<tr>
    <td><div class="asset-cell"><a href="#/ativos/${g.a.code}?de=carteira">${esc(g.a.name)}</a><span class="asset-code">${g.a.code} · ${multi
      ? `<button type="button" class="expand-btn" data-action="expand" data-key="${key}" aria-expanded="${open}" aria-controls="${key}">${g.insts.length} instituições ${icon('chevronDown', 14)}</button>`
      : g.insts[0].inst}${g.demo ? ' · <span class="demo-badge sm">Compra na demo</span>' : ''}</span></div></td>
    <td class="num">${pQtd(g.qtd)}</td><td class="num">${pBrl(g.atual)}</td>
    <td class="num">${trendValue(g.delta, pSbrl(g.delta))}</td></tr>
    ${multi ? g.insts.map((i) => `<tr class="sub-row" data-group="${key}" ${open ? '' : 'hidden'}><td>${i.inst}</td><td class="num">${pQtd(i.qtd)}</td><td class="num">${pBrl(i.atual)}</td><td class="num">${trendValue(i.delta, pSbrl(i.delta))}</td></tr>`).join('') : ''}`;
}

function compoDetalhe(w) {
  const inst = {};
  w.itens.forEach((g) => g.insts.forEach((i) => (inst[i.inst] = (inst[i.inst] || 0) + i.atual)));
  const linhas = {
    classe: [['Ações', w.atual]],
    produto: [['Ações à vista (ON)', w.atual]],
    instituicao: Object.entries(inst),
  }[ui.compo.aba];
  return `<div style="margin-top:12px">
    ${btnTabs([['classe', 'Classe'], ['produto', 'Produto'], ['instituicao', 'Instituição']], ui.compo.aba, { label: 'Recorte da composição', action: 'compo-aba', id: 'compo' })}
    <div id="compo-panel" role="tabpanel"><table><caption class="sr-only">Composição por ${ui.compo.aba}</caption>
      <thead><tr><th scope="col">${{ classe: 'Classe', produto: 'Produto', instituicao: 'Instituição' }[ui.compo.aba]}</th><th scope="col" class="num">Valor</th><th scope="col" class="num">%</th></tr></thead>
      <tbody>${linhas.map(([n, v]) => `<tr><td>${n}</td><td class="num">${pBrl(v)}</td><td class="num">${nf1.format((v / w.atual) * 100)}%</td></tr>`).join('')}</tbody></table></div></div>`;
}

ACTIONS.periodo = (el) => { ui.periodo = el.dataset.p; rerender(`[data-action="periodo"][data-p="${el.dataset.p}"]`); };
ACTIONS['compo-toggle'] = () => { ui.compo.aberto = !ui.compo.aberto; rerender('[data-action="compo-toggle"]'); };
ACTIONS['compo-aba'] = (el) => { ui.compo.aba = el.dataset.key; rerender(`[data-tablist="compo"] [data-key="${el.dataset.key}"]`); };
ACTIONS.expand = (el) => {
  const key = el.dataset.key, open = el.getAttribute('aria-expanded') !== 'true';
  ui.expand[key] = open;
  el.setAttribute('aria-expanded', open);
  document.querySelectorAll(`[data-group="${key}"]`).forEach((r) => (r.hidden = !open));
};
ACTIONS.disclose = (el) => {
  const open = el.getAttribute('aria-expanded') !== 'true';
  el.setAttribute('aria-expanded', open);
  document.getElementById(el.getAttribute('aria-controls')).hidden = !open;
};

/* Painel “Por que mudou?” */
function panelMudanca(code) {
  const w = carteira();
  const g = w && w.itens.find((i) => i.a.code === code);
  if (!g) return null;
  const n = NOTICIAS.find((x) => x.ativos.includes(code) && x.tipo !== 'evento')
    || NOTICIAS.find((x) => (x.setoresAfetados || []).includes(g.a.setor));
  const dp = g.a.preco - g.a.anterior;
  return {
    title: `Por que ${g.a.name} mudou?`,
    body: `
      <div class="pblock observed" aria-labelledby="pm-obs">
        <h3 id="pm-obs">Variação observada</h3>
        <p class="value">${trendValue(g.delta, pSbrl(g.delta))}</p>
        <p class="meta">${trend(g.pct)} de ${REF.anteriorCurta} a ${REF.atualCurta}</p>
      </div>
      <div class="pblock"><h3>Como a conta foi feita</h3>
        <p>${pQtd(g.qtd)} ações × (${fmt.brl(g.a.preco)} − ${fmt.brl(g.a.anterior)}) = ${pSbrl(g.delta)}</p>
        <ul class="calc-list" style="margin-top:8px">${g.insts.map((i) => `<li><span>${i.inst}: ${pQtd(i.qtd)} × ${fmt.sbrl(dp)}</span><strong>${pSbrl(i.delta)}</strong></li>`).join('')}</ul>
      </div>
      <div class="pblock"><h3>O que não entrou na conta</h3>
        <p>${g.demo ? 'Compras feitas na demo entram como se já estivessem na carteira em ' + REF.anteriorCurta + ', para mostrar a variação do preço.' : 'Não houve compras, vendas, aportes, resgates ou eventos neste ativo no período.'} Toda a mudança veio do preço.</p></div>
      ${n ? `<div class="pblock context-block"><h3>Notícia relacionada</h3>
        <p>${tipoTag(n.tipo)} <span class="meta">${n.data}</span></p>
        <p style="margin-top:4px"><a href="#/noticias?aba=carteira&painel=${n.id}">${esc(n.titulo)}</a></p>
        <p class="meta" style="margin-top:4px">A notícia ajuda a entender o contexto, mas não comprova a causa da variação.</p></div>` : ''}
      <p class="meta">Posição de ${REF.atual} · Cotações de ${REF.atual} · Dados simulados</p>`,
    foot: `<a class="btn btn-primary" href="#/ativos/${code}?de=carteira">Ver ativo</a>${n ? `<a class="btn btn-outline" href="#/noticias?aba=carteira&painel=${n.id}">Ver notícia</a>` : ''}`,
  };
}

/* ---------- Investimentos ---------- */
function viewInvestimentos(route) {
  const aba = route.m[1] || 'posicao';
  const c = conta();
  const s = ui.posicao;
  const dataLabel = s.data === '24' ? REF.atual : REF.anterior;
  let body;
  if (aba === 'posicao') {
    const linhas = posicoes().filter((p) => !s.aplicado || p.inst === s.aplicado)
      .map((p) => { const a = ativo(p.code); const preco = s.data === '24' ? a.preco : a.anterior; return { ...p, a, preco, valor: preco * p.qtd }; });
    body = `
      <div class="query-bar">
        <div class="field"><label for="pos-data">Exibindo posição de</label>
          <select id="pos-data" class="select" data-change="pos-data"><option value="24" ${s.data === '24' ? 'selected' : ''}>24 nov 2026, 18h</option><option value="23" ${s.data === '23' ? 'selected' : ''}>23 nov 2026, 18h</option></select></div>
        <button type="button" class="btn btn-outline" data-action="pos-filtro" aria-expanded="${s.filtroAberto}" aria-controls="pos-filtros">${icon('filter', 18)}Filtrar</button>
        <button type="button" class="btn btn-outline" data-action="pos-baixar" ${linhas.length ? '' : 'disabled'}>${icon('download', 18)}Baixar</button>
      </div>
      <form class="card filter-panel" id="pos-filtros" data-form="pos-filtro" ${s.filtroAberto ? '' : 'hidden'}>
        <div class="filter-grid">
          <div class="field"><label for="pos-inst">Instituição</label>
            <select id="pos-inst" name="inst" class="select"><option value="">Todas</option>${['Corretora A', 'Corretora B'].map((i) => `<option ${s.aplicado === i ? 'selected' : ''}>${i}</option>`).join('')}</select></div>
          <div class="field"><label for="pos-prod">Produto</label><select id="pos-prod" class="select"><option>Ações</option></select></div>
        </div>
        <div class="btn-row"><button class="btn btn-primary" type="submit">Aplicar filtros</button><button class="btn btn-link" type="button" data-action="pos-limpar">Limpar</button></div>
      </form>
      ${s.aplicado ? `<div class="chips"><span class="chip">Instituição: ${s.aplicado}<button type="button" data-action="pos-limpar" aria-label="Remover filtro ${s.aplicado}">${icon('x', 16)}</button></span></div>` : ''}
      ${linhas.length ? `<div class="card"><div class="table-wrap"><table><caption class="sr-only">Posição em ${dataLabel}</caption>
        <thead><tr><th scope="col">Ativo</th><th scope="col">Instituição</th><th scope="col" class="num">Quantidade</th><th scope="col" class="num col-sec">Preço de fechamento</th><th scope="col" class="num">Valor</th><th scope="col"><span class="sr-only">Detalhes</span></th></tr></thead>
        <tbody>${linhas.map((l, li) => { const k = `pos-${l.code}-${l.inst.slice(-1)}-${li}`; const open = !!ui.expand[k]; return `<tr>
          <td><div class="asset-cell"><a href="#/ativos/${l.code}?de=carteira">${esc(l.a.name)}</a><span class="asset-code">${l.code}${l.demo ? ' · <span class="demo-badge sm">Compra na demo</span>' : ''}</span></div></td>
          <td>${l.inst}</td><td class="num">${pQtd(l.qtd)}</td><td class="num col-sec">${fmt.brl(l.preco)}</td><td class="num">${pBrl(l.valor)}</td>
          <td class="num"><button type="button" class="expand-btn" data-action="expand" data-key="${k}" aria-expanded="${open}" aria-controls="${k}">Detalhes<span class="sr-only"> de ${esc(l.a.name)} na ${l.inst}</span>${icon('chevronDown', 14)}</button></td></tr>
          <tr class="detail-row" data-group="${k}" id="${k}" ${open ? '' : 'hidden'}><td colspan="6"><dl class="dl">
            <div><dt>Classe</dt><dd>Renda variável · Ações</dd></div><div><dt>Produto</dt><dd>${esc(l.a.tipo)}</dd></div>
            <div><dt>Tipo de preço</dt><dd>Fechamento do pregão</dd></div><div><dt>Data do preço</dt><dd>${dataLabel}</dd></div>
            <div><dt>Código ISIN</dt><dd>${l.a.real ? 'Não exibido na demo' : `BR${l.code}ACNOR0 (fictício)`}</dd></div><div><dt>Situação</dt><dd>Disponível</dd></div>
            <div><dt>Escriturador</dt><dd>Banco Escriturador Demo</dd></div></dl></td></tr>`; }).join('')}</tbody></table></div>
        <p class="meta" style="margin-top:8px">Valor estimado pelo preço de fechamento de cada data. Dados simulados.</p></div>`
      : emptyState({ title: posicoes().length ? 'Nenhum resultado para esse filtro' : 'Não há posições para esta data', actions: s.aplicado ? '<button type="button" class="btn btn-outline btn-sm" data-action="pos-limpar">Limpar filtros</button>' : '' })}`;
  } else {
    body = `<p class="muted" style="margin-bottom:12px">Ativos dados em garantia de operações aparecem aqui, por instituição. ${termHelp('garantias', 'garantia')}</p>
      <div class="query-bar"><div class="field"><label for="gar-data">Data</label><select id="gar-data" class="select"><option>24 nov 2026</option><option>23 nov 2026</option></select></div></div>
      ${emptyState({ title: 'Não há garantias para esta data', text: 'Ter patrimônio na carteira não significa que há garantias registradas.', iconName: 'info' })}`;
  }
  return {
    title: 'Investimentos', nav: 'investimentos', pageKey: 'investimentos',
    crumbs: [['Minha carteira', '/carteira'], ['Investimentos']],
    html: `<div class="page-head"><div><h1 class="h1">Investimentos</h1><p class="meta lead">Consulta por data, instituição e produto ${termHelp('posicao', 'posição')}</p></div></div>
      ${tabs([['posicao', 'Posição'], ['garantias', 'Garantias']], aba, { label: 'Investimentos', id: 'invest', hrefFor: (k) => '/carteira/investimentos/' + k })}
      ${body}`,
  };
}
CHANGES['pos-data'] = (el) => { ui.posicao.data = el.value; rerender('#pos-data'); };
ACTIONS['pos-filtro'] = () => { ui.posicao.filtroAberto = !ui.posicao.filtroAberto; rerender(ui.posicao.filtroAberto ? '#pos-inst' : '[data-action="pos-filtro"]'); };
SUBMITS['pos-filtro'] = (form) => { ui.posicao.aplicado = form.inst.value; ui.posicao.filtroAberto = false; rerender('[data-action="pos-filtro"]'); announce('Filtros aplicados'); };
ACTIONS['pos-limpar'] = () => { ui.posicao.aplicado = ''; rerender('[data-action="pos-filtro"]'); announce('Filtros removidos'); };
ACTIONS['pos-baixar'] = () => {
  const c = conta(), d = ui.posicao.data;
  downloadDemo(`posicao-demo-${d}nov2026.csv`, ['Ativo;Código;Instituição;Quantidade;Preço;Valor',
    ...posicoes().filter((p) => !ui.posicao.aplicado || p.inst === ui.posicao.aplicado).map((p) => { const a = ativo(p.code); const pr = d === '24' ? a.preco : a.anterior; return `${a.name};${a.code};${p.inst};${p.qtd};${nf2.format(pr)};${nf2.format(pr * p.qtd)}`; })]);
};

/* ---------- Análises com IA ---------- */
function viewIA() {
  return {
    title: 'Análises com IA', nav: 'ia', crumbs: [['Minha carteira', '/carteira'], ['Análises com IA']],
    html: `<div class="page-head"><div><h1 class="h1">Análises com IA</h1><p class="meta lead">Ferramenta parceira de análise de empresas</p></div></div>
      <section class="card" style="max-width:720px">
        <p class="note warn">${icon('info', 18)}<span>Acesso demonstrativo. Na Área do Investidor real, este item abre a ferramenta parceira de análise de ações, quando disponível para a conta.</span></p>
        <p style="margin-top:16px">A ferramenta avalia empresas nacionais e internacionais com modelos de inteligência artificial. Ela não substitui recomendação de um profissional.</p>
        <p style="margin-top:12px">Quer saber se uma notícia tem relação com os seus investimentos? Isso fica em <a href="#/noticias">Notícias</a>, no botão “Impacto na carteira”.</p>
        <div class="btn-row"><a class="btn btn-primary" href="#/saida?para=${encodeURIComponent('Ferramenta parceira de análise')}&volta=${encodeURIComponent('/carteira/ia')}">Abrir ferramenta parceira ${icon('external', 16)}</a></div>
      </section>`,
  };
}
