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
  const per = comparavel ? 'visita' : '30d';
  const vp = variacaoPeriodo(per);
  const rotulo = PERIODO_TXT[per].faixa;
  const ordenados = w.itens.slice().sort((a, b) => Math.abs(vp.por[b.a.code].delta) - Math.abs(vp.por[a.a.code].delta));
  const valor30 = ehPrincipal() ? Object.entries(QTD_30D_PRINCIPAL).reduce((t, [c, q]) => t + q * ativo(c).p30, 0) : 0;
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
          <div class="kpi"><div class="label">${comparavel ? 'Mudança no período' : 'Mudança de preço em 30 dias'}</div>
            <div class="value big">${trendValue(vp.delta, pSbrl(vp.delta))}</div><div class="sub">${trend(vp.pct)} <span class="meta">${rotulo}</span></div>
          </div>
          <div class="kpi"><div class="label">${comparavel ? 'Valor anterior' : 'Valor em 24 out'}</div>
            ${comparavel ? `<div class="value big" style="color:var(--text)">${pBrl(w.anterior)}</div><div class="sub meta">Em ${REF.anterior}, sua última visita</div>`
              : valor30 ? `<div class="value big" style="color:var(--text)">${pBrl(valor30)}</div><div class="sub meta">Com as quantidades daquela data</div>`
              : `<div class="value big" style="color:var(--neutral-text)">Sem posição</div><div class="sub meta">A carteira ainda não tinha ações em 24 out</div>`}
          </div>
        </div>
        <p class="note resumo-note" style="margin-top:16px">${icon('calendar', 18)}<span>O resumo da ${SEMANAS[0].titulo.toLowerCase()} está pronto. <a href="#/carteira/resumo?semana=${SEMANAS[0].id}">Ver resumo semanal</a> · Por e-mail: ${prefResumo() ? 'ativado' : '<a href="#/perfil?secao=config">ativar nas notificações</a>'}</span></p>
        ${comparavel ? (comprasDemo().length
          ? `<p class="note demo-note" style="margin-top:16px">${icon('cart', 18)}<span>Inclui ${comprasDemo().length} ${comprasDemo().length === 1 ? 'compra feita' : 'compras feitas'} na demo. Para mostrar o efeito das notícias, a demo considera que essas ações já estavam na carteira no fechamento de ${REF.anteriorCurta}. <button type="button" class="btn btn-link btn-sm" data-action="desfazer-compras">Desfazer compras da demo</button></span></p>`
          : `<p class="note" style="margin-top:16px">${icon('info', 18)}<span>Não houve aportes, resgates ou eventos no período. Toda a mudança veio da variação de preço dos ativos.</span></p>`)
        : `<p class="note" style="margin-top:16px">${icon('info', 18)}<span>A mudança considera só o preço, com a quantidade de hoje.${ehPrincipal() ? ` No período entraram ${ENTRADAS_30D.map((e) => `${pQtd(e.qtd)} ações de ${esc(ativo(e.code).name)} (${e.data})`).join(' e ')}, por isso o valor de 24 out somado à mudança não dá o valor atual.` : ''}${comprasDemo().length ? ' Compras feitas na demo contam desde 23 nov.' : ''}</span></p>`}
      </section>

      <section class="card" aria-labelledby="mudou">
        <div class="card-head"><h2 class="h2" id="mudou">O que mudou</h2><span class="meta">${comparavel ? 'Desde a última visita' : 'Últimos 30 dias'} · maior mudança em reais primeiro</span></div>
        <ul class="change-list">${ordenados.slice(0, 3).map((g) => { const v = vp.por[g.a.code]; return `<li>
          <div><span class="asset-name">${esc(g.a.name)}</span> <span class="asset-code">${g.a.code}</span>
            <p class="meta">Preço foi de ${precoFmt(g.a, comparavel || g.demo && !v.temBase ? g.a.anterior : g.a.p30)} para ${precoFmt(g.a, g.a.preco)} · ${pQtd(g.qtd)} ${unid(g.a, g.qtd)}</p></div>
          <div class="num">${trendValue(v.delta, pSbrl(v.delta))}<br>${trend(v.pct)}</div>
          <button type="button" class="btn btn-outline btn-sm" data-action="open-panel" data-kind="mudanca" data-id="${g.a.code}">Por que mudou?<span class="sr-only"> ${esc(g.a.name)}</span></button>
        </li>`; }).join('')}</ul>
        <p class="meta" style="margin-top:8px">Soma: ${pSbrl(vp.delta)} = ${ordenados.map((g) => pSbrl(vp.por[g.a.code].delta)).join(' ')}</p>
      </section>

      ${destaquesCarteira(w)}
      ${alocacaoCard(w)}
      ${evolucaoCard(w)}
      ${produtosCard(w, vp, comparavel)}
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

/* ---------- Visão geral: destaques, alocação, evolução e produtos (como no portal, mais enxuto) ---------- */
const ALOC_CORES = ['#2E2ECC', '#1E9AA6', '#C98A00', '#D9485F', '#7A5AF8', '#707A90', '#0A0349', '#36ADB9'];
function grupos(w, chave) {
  const g = {};
  w.itens.forEach((it) => {
    if (chave === 'instituicao') {
      it.insts.forEach((i) => { const x = g[i.inst] || (g[i.inst] = { nome: i.inst, valor: 0, n: 0 }); x.valor += i.atual; x.n += 1; });
    } else {
      const k = chave === 'classe' ? it.a.classe : it.a.produto;
      const x = g[k] || (g[k] = { nome: k, valor: 0, n: 0 }); x.valor += it.atual; x.n += 1;
    }
  });
  const lista = Object.values(g).sort((a, b) => b.valor - a.valor);
  lista.forEach((x) => (x.pct = w.atual ? (x.valor / w.atual) * 100 : 0));
  return lista;
}
const proventos90 = () => provRecebidos().filter((p) => p.data.split('/').reverse().join('') >= '20260826').reduce((t, p) => t + p.valor, 0);

function destaquesCarteira(w) {
  const inst = grupos(w, 'instituicao')[0], cls = grupos(w, 'classe')[0];
  const tile = (icone, rotulo, nome, pct) => `<div class="dest-tile"><span class="dest-tile-ic">${icon(icone, 20)}</span><div style="flex:1;min-width:0">
      <p class="meta">${rotulo}</p><p class="dest-tile-v">${esc(nome)} <strong>${nf1.format(pct)}%</strong></p>
      <div class="dest-tile-bar" aria-hidden="true"><span style="width:${pct}%"></span></div></div></div>`;
  return `<section class="card" aria-labelledby="dc-t"><div class="card-head"><h2 class="h2" id="dc-t">Destaques da minha carteira</h2></div>
    <div class="dest-tiles">
      ${tile('grid', 'Maior instituição', inst.nome, inst.pct)}
      ${tile('chart', 'Maior classe', cls.nome, cls.pct)}
      <div class="dest-tile"><span class="dest-tile-ic">${icon('file', 20)}</span><div><p class="meta">Produtos na carteira</p><p class="dest-tile-v"><strong>${w.itens.length}</strong> em ${grupos(w, 'classe').length} classes</p></div></div>
      <div class="dest-tile"><span class="dest-tile-ic">${icon('coins', 20)}</span><div><p class="meta">Proventos nos últimos 90 dias</p><p class="dest-tile-v"><strong>${pBrl(proventos90())}</strong></p></div></div>
    </div></section>`;
}

function alocacaoCard(w) {
  const aba = ['classe', 'produto', 'instituicao'].includes(ui.compo.aba) ? ui.compo.aba : 'classe';
  const lista = grupos(w, aba);
  const nomeAba = { classe: 'classe', produto: 'produto', instituicao: 'instituição' }[aba];
  return `<section class="card" aria-labelledby="al-t">
    <div class="card-head"><h2 class="h2" id="al-t">Alocação do meu patrimônio</h2>
      <div class="seg" role="group" aria-label="Ver alocação por">${[['classe', 'Classe'], ['produto', 'Produto'], ['instituicao', 'Instituição']].map(([k, t]) => `<button type="button" data-action="aloc-aba" data-k="${k}" aria-pressed="${aba === k}">${t}</button>`).join('')}</div></div>
    <div class="aloc-bar" role="img" aria-label="Alocação por ${nomeAba}: ${lista.map((x) => `${x.nome} ${nf1.format(x.pct)}%`).join(', ')}">${lista.map((x, i) => `<span style="width:${x.pct}%;background:${ALOC_CORES[i % ALOC_CORES.length]}"></span>`).join('')}</div>
    <ul class="aloc-list">${lista.map((x, i) => `<li><span class="swatch" style="background:${ALOC_CORES[i % ALOC_CORES.length]}"></span>
      <span class="aloc-nome">${esc(x.nome)}<span class="meta"> · ${x.n} ${x.n === 1 ? 'produto' : 'produtos'}</span></span>
      <span class="aloc-pct">${nf1.format(x.pct)}%</span><span class="aloc-val">${pBrl(x.valor)}</span></li>`).join('')}</ul>
  </section>`;
}
ACTIONS['aloc-aba'] = (el) => { ui.compo.aba = el.dataset.k; rerender(`[data-action="aloc-aba"][data-k="${el.dataset.k}"]`); };

function evolucaoPontos(w) {
  const v30 = ehPrincipal() ? Object.entries(QTD_30D_PRINCIPAL).reduce((t, [c, q]) => t + q * ativo(c).p30, 0) : 0;
  const base = ehPrincipal() ? EVOLUCAO.map(([m, v]) => [m, v]) : EVOLUCAO.map(([m]) => [m, 0]);
  return [...base, ['24 out', v30], ['24 nov', w.atual]];
}
function evolucaoCard(w) {
  const pts = evolucaoPontos(w);
  const W = 640, H = 200, px = 8, py = 14;
  const vals = pts.map((p) => p[1]), max = Math.max(...vals), min = Math.min(...vals.filter((v) => v > 0), max);
  const lo = Math.floor((min * 0.95) / 1000) * 1000, hi = Math.ceil((max * 1.03) / 1000) * 1000, span = hi - lo || 1;
  const xy = pts.map((p, i) => [px + (i * (W - 2 * px)) / (pts.length - 1), py + (1 - (Math.max(p[1], lo) - lo) / span) * (H - 2 * py)]);
  const d = xy.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(' ');
  const area = `${d} L ${xy[xy.length - 1][0].toFixed(1)} ${H} L ${xy[0][0].toFixed(1)} ${H} Z`;
  const ini = pts[0][1], fim = pts[pts.length - 1][1];
  return `<section class="card" aria-labelledby="ev-t">
    <div class="card-head"><div><h2 class="h2" id="ev-t">Evolução do patrimônio</h2><p class="meta">Últimos 12 meses · inclui aportes e resgates, não é rentabilidade</p></div>
      <p class="ev-resumo">${pBrl(ini)} → <strong>${pBrl(fim)}</strong></p></div>
    <figure class="ev-chart">
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${state.hide ? 'Gráfico da evolução do patrimônio, valores ocultos' : `Patrimônio foi de ${fmt.brl(ini)} em ${pts[0][0]} para ${fmt.brl(fim)} em 24 nov`}">
        <path d="${area}" class="ev-area"/><path d="${d}" class="ev-line" vector-effect="non-scaling-stroke"/>
      </svg>
      <div class="ev-pts">${xy.map((q, i) => `<span class="ev-pt ${i === xy.length - 1 ? 'last' : ''}" style="left:${(q[0] / W) * 100}%;top:${(q[1] / H) * 100}%" tabindex="0" aria-label="${pts[i][0]}: ${state.hide ? 'valor oculto' : fmt.brl(pts[i][1])}"><span class="ev-tip">${pts[i][0]}<br><strong>${pBrl(pts[i][1])}</strong></span></span>`).join('')}</div>
      <div class="ev-x" aria-hidden="true">${pts.map((p, i) => `<span>${i % 2 === 0 || i === pts.length - 1 ? p[0] : ''}</span>`).join('')}</div>
    </figure>
    <button type="button" class="btn btn-link btn-sm" style="padding-left:0" data-action="disclose" aria-expanded="false" aria-controls="ev-tab">Ver em tabela</button>
    <div id="ev-tab" hidden><div class="table-wrap"><table><caption class="sr-only">Evolução do patrimônio</caption><thead><tr><th scope="col">Data</th><th scope="col" class="num">Patrimônio</th></tr></thead>
      <tbody>${pts.map((p) => `<tr><td>${p[0]}</td><td class="num">${pBrl(p[1])}</td></tr>`).join('')}</tbody></table></div></div>
  </section>`;
}

function produtosCard(w, vp, comparavel) {
  const filtro = ui.carteiraClasse || 'todos';
  const classes = CLASSES.filter((c) => w.itens.some((g) => g.a.classe === c));
  const mostrar = classes.filter((c) => filtro === 'todos' || c === filtro);
  return `<section class="card" aria-labelledby="ativos">
    <div class="card-head"><h2 class="h2" id="ativos">Produtos da sua carteira</h2><span class="meta">Mudança ${comparavel ? `${REF.anteriorCurta} → ${REF.atualCurta}` : 'em 30 dias'}</span></div>
    <div class="chips-filter" role="group" aria-label="Filtrar por classe">${[['todos', 'Todos'], ...classes.map((c) => [c, CLASSE_CURTA[c]])].map(([k, t]) => `<button type="button" class="chip-btn" data-action="cart-classe" data-k="${esc(k)}" aria-pressed="${filtro === k}">${t}</button>`).join('')}</div>
    <div class="table-wrap"><table class="prod-table"><caption class="sr-only">Produtos da carteira por classe</caption>
      <thead><tr><th scope="col">Produto</th><th scope="col" class="num">Quantidade</th><th scope="col" class="num">Valor atual</th><th scope="col" class="num">Mudança</th></tr></thead>
      ${mostrar.map((c) => {
        const its = w.itens.filter((g) => g.a.classe === c);
        const tot = its.reduce((t, g) => t + g.atual, 0), dl = its.reduce((t, g) => t + vp.por[g.a.code].delta, 0);
        return `<tbody><tr class="class-row"><th scope="rowgroup" colspan="2">${esc(c)} <span class="meta">· ${its.length} ${its.length === 1 ? 'produto' : 'produtos'} · ${nf1.format(w.atual ? (tot / w.atual) * 100 : 0)}% da carteira</span></th>
          <td class="num"><strong>${pBrl(tot)}</strong></td><td class="num">${trendValue(dl, pSbrl(dl))}</td></tr>
          ${its.map((g) => ativoRow(g, vp)).join('')}</tbody>`;
      }).join('')}
    </table></div>
    <div class="card-foot"><a href="#/carteira/investimentos">Ir para posição</a><a href="#/carteira/investimentos/garantias">Ver garantias</a><a href="#/extratos/movimentacao">Ver movimentações</a></div>
  </section>`;
}
ACTIONS['cart-classe'] = (el) => { ui.carteiraClasse = el.dataset.k; rerender(`[data-action="cart-classe"][data-k="${el.dataset.k}"]`); };

/* Variação por período: desde a última visita (23 → 24 nov) ou 30 dias (24 out → 24 nov, quantidade de hoje).
   Compras feitas na demo contam desde 23 nov nos dois recortes. */
const PERIODO_TXT = {
  visita: { faixa: `de ${REF.anteriorCurta} a ${REF.atualCurta}`, quando: 'desde a sua última visita', de: 20261123, ibov: () => ibovPct() },
  '30d': { faixa: 'de 24 out, 18h a 24 nov, 18h', quando: 'nos últimos 30 dias', de: 20261024, ibov: () => (IBOV.pontos / IBOV.inicio['1M'] - 1) * 100 },
};
function variacaoPeriodo(per) {
  const por = {};
  posicoes().forEach((p) => {
    const a = ativo(p.code), ini = per === '30d' && !p.demo ? a.p30 : a.anterior;
    const x = por[p.code] || (por[p.code] = { delta: 0, base: 0, insts: {}, temBase: false });
    const d = p.qtd * (a.preco - ini);
    x.delta += d; x.base += p.qtd * ini; x.insts[p.inst] = (x.insts[p.inst] || 0) + d; x.temBase = x.temBase || !p.demo;
  });
  Object.values(por).forEach((x) => (x.pct = x.base ? (x.delta / x.base) * 100 : 0));
  const delta = Object.values(por).reduce((t, x) => t + x.delta, 0), base = Object.values(por).reduce((t, x) => t + x.base, 0);
  return { por, delta, pct: base ? (delta / base) * 100 : 0 };
}

function ativoRow(g, vp) {
  const v = vp.por[g.a.code];
  const multi = g.insts.length > 1, key = 'inst-' + g.a.code, open = !!ui.expand[key];
  return `<tr>
    <td><div class="asset-cell"><a href="#/ativos/${g.a.code}?de=carteira">${esc(g.a.name)}</a><span class="asset-code">${g.a.code} · ${multi
      ? `<button type="button" class="expand-btn" data-action="expand" data-key="${key}" aria-expanded="${open}" aria-controls="${key}">${g.insts.length} instituições ${icon('chevronDown', 14)}</button>`
      : g.insts[0].inst}${g.demo ? ' · <span class="demo-badge sm">Compra na demo</span>' : ''}</span></div></td>
    <td class="num">${pQtd(g.qtd)} <span class="meta">${unid(g.a, g.qtd)}</span></td><td class="num">${pBrl(g.atual)}</td>
    <td class="num">${trendValue(v.delta, pSbrl(v.delta))}</td></tr>
    ${multi ? g.insts.map((i) => `<tr class="sub-row" data-group="${key}" ${open ? '' : 'hidden'}><td>${i.inst}</td><td class="num">${pQtd(i.qtd)}</td><td class="num">${pBrl(i.atual)}</td><td class="num">${trendValue(v.insts[i.inst], pSbrl(v.insts[i.inst]))}</td></tr>`).join('') : ''}`;
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

/* Painel “Por que mudou?”: texto direto com possíveis motivos (empresa e mercado) para o período escolhido. */
function noticiaDoPeriodo(a, per) {
  const de = PERIODO_TXT[per].de;
  const ok = (n) => n.tipo === 'evento' || dataNoticia(n) >= de;
  return NOTICIAS.find((n) => n.ativos.includes(a.code) && n.tipo !== 'evento' && ok(n))
    || NOTICIAS.find((n) => n.ativos.includes(a.code) && ok(n))
    || NOTICIAS.find((n) => (n.setoresAfetados || []).includes(a.setor) && dataNoticia(n) >= de);
}
function panelMudanca(code) {
  const w = carteira();
  const g = w && w.itens.find((i) => i.a.code === code);
  if (!g) return null;
  const per = ui.periodo === '30d' ? '30d' : 'visita', P = PERIODO_TXT[per];
  const v = variacaoPeriodo(per).por[code], a = g.a;
  const ini = per === '30d' ? a.p30 : a.anterior, pctAcao = (a.preco / ini - 1) * 100;
  const verbo = pctAcao > 0.005 ? `subiu ${nf2.format(pctAcao)}%` : pctAcao < -0.005 ? `caiu ${nf2.format(-pctAcao)}%` : 'ficou estável';
  const ib = P.ibov(), ibTxt = `${ib >= 0 ? 'subiu' : 'caiu'} ${nf2.format(Math.abs(ib))}%`;
  const m = (MOTIVOS[code] || {})[per === '30d' ? 'mes' : 'dia']
    || [`Não encontramos notícia da ${a.name} ${P.quando}.`, `A ação acompanhou o movimento do setor de ${a.setor.toLowerCase()} e da bolsa, que ${ibTxt} no período.`];
  const n = noticiaDoPeriodo(a, per);
  const params = `aba=carteira&painel=${n ? n.id : ''}`;
  return {
    title: `Por que ${a.name} mudou?`,
    body: `
      <div class="pblock observed" aria-labelledby="pm-obs">
        <h3 id="pm-obs">Variação na sua carteira · ${per === '30d' ? 'últimos 30 dias' : 'desde a última visita'}</h3>
        <p class="value">${trendValue(v.delta, pSbrl(v.delta))}</p>
        <p class="meta">${trend(v.pct)} ${P.faixa}</p>
      </div>
      <div class="pblock motivos"><h3>Possíveis motivos</h3>
        <p class="motivo-lead">${esc(a.name)} ${verbo} ${P.quando}, de ${fmt.brl(ini)} para ${fmt.brl(a.preco)}.</p>
        <p><strong>Na empresa:</strong> ${esc(m[0])}</p>
        <p><strong>No mercado:</strong> ${esc(m[1])}</p>
        ${g.demo && per === '30d' && !v.temBase ? `<p class="meta">Na sua carteira, a compra feita na demo conta desde ${REF.anteriorCurta}, por isso o valor acima é menor que a variação da ação.</p>` : ''}
      </div>
      ${n ? `<div class="pblock context-block"><h3>Notícia relacionada</h3>
        <p>${tipoTag(n.tipo)} <span class="meta">${n.data}</span></p>
        <p style="margin-top:4px"><a href="#/noticias?${params}">${esc(n.titulo)}</a></p></div>` : ''}
      <p class="meta">São possíveis motivos, não uma certeza: o preço também depende de muitos outros fatores. Preços simulados.</p>`,
    foot: `<a class="btn btn-primary" href="#/ativos/${code}?de=carteira">Ver ativo</a>${n ? `<a class="btn btn-outline" href="#/noticias?${params}">Ver impacto da notícia</a>` : ''}`,
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
    const linhas = linhasPosicao();
    body = `
      <div class="query-bar">
        <div class="field"><label for="pos-data">Exibindo posição de</label>
          <select id="pos-data" class="select" data-change="pos-data"><option value="24" ${s.data === '24' ? 'selected' : ''}>24 nov 2026, 18h</option><option value="23" ${s.data === '23' ? 'selected' : ''}>23 nov 2026, 18h</option></select></div>
        <button type="button" class="btn btn-outline" data-action="pos-filtro" aria-expanded="${s.filtroAberto}" aria-controls="pos-filtros">${icon('filter', 18)}Filtrar</button>
        <button type="button" class="btn btn-outline" data-action="pos-baixar" data-fmt="pdf" ${linhas.length ? '' : 'disabled'}>${icon('download', 18)}Baixar PDF</button>
        <button type="button" class="btn btn-outline" data-action="pos-baixar" data-fmt="xlsx" ${linhas.length ? '' : 'disabled'}>${icon('download', 18)}Baixar Excel</button>
      </div>
      <form class="card filter-panel" id="pos-filtros" data-form="pos-filtro" ${s.filtroAberto ? '' : 'hidden'}>
        <div class="filter-grid">
          <div class="field"><label for="pos-inst">Instituição</label>
            <select id="pos-inst" name="inst" class="select"><option value="">Todas</option>${INSTITUICOES_DEMO.map((i) => `<option ${s.aplicado === i ? 'selected' : ''}>${i}</option>`).join('')}</select></div>
          <div class="field"><label for="pos-prod">Classe</label><select id="pos-prod" name="classe" class="select"><option value="">Todas</option>${CLASSES.map((c) => `<option ${s.classe === c ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
        </div>
        <div class="btn-row"><button class="btn btn-primary" type="submit">Aplicar filtros</button><button class="btn btn-link" type="button" data-action="pos-limpar">Limpar</button></div>
      </form>
      ${s.aplicado || s.classe ? `<div class="chips">${s.aplicado ? `<span class="chip">Instituição: ${s.aplicado}</span>` : ''}${s.classe ? `<span class="chip">Classe: ${s.classe}</span>` : ''}<button type="button" class="btn btn-link btn-sm" data-action="pos-limpar">Limpar filtros</button></div>` : ''}
      ${linhas.length ? `<div class="card"><div class="table-wrap"><table><caption class="sr-only">Posição em ${dataLabel}</caption>
        <thead><tr><th scope="col">Ativo</th><th scope="col">Instituição</th><th scope="col" class="num">Quantidade</th><th scope="col" class="num col-sec">Preço de fechamento</th><th scope="col" class="num">Valor</th><th scope="col"><span class="sr-only">Detalhes</span></th></tr></thead>
        <tbody>${linhas.map((l, li) => { const k = `pos-${l.code}-${l.inst.slice(-1)}-${li}`; const open = !!ui.expand[k]; return `<tr>
          <td><div class="asset-cell"><a href="#/ativos/${l.code}?de=carteira">${esc(l.a.name)}</a><span class="asset-code">${l.code}${l.demo ? ' · <span class="demo-badge sm">Compra na demo</span>' : ''}</span></div></td>
          <td>${l.inst}</td><td class="num">${pQtd(l.qtd)} <span class="meta">${unid(l.a, l.qtd)}</span></td><td class="num col-sec">${precoFmt(l.a, l.preco)}</td><td class="num">${pBrl(l.valor)}</td>
          <td class="num"><button type="button" class="expand-btn" data-action="expand" data-key="${k}" aria-expanded="${open}" aria-controls="${k}">Detalhes<span class="sr-only"> de ${esc(l.a.name)} na ${l.inst}</span>${icon('chevronDown', 14)}</button></td></tr>
          <tr class="detail-row" data-group="${k}" id="${k}" ${open ? '' : 'hidden'}><td colspan="6"><dl class="dl">
            <div><dt>Classe</dt><dd>${esc(l.a.classe)}</dd></div><div><dt>Produto</dt><dd>${esc(l.a.produto)} · ${esc(l.a.tipo)}</dd></div>
            <div><dt>Tipo de preço</dt><dd>${l.a.negociavel ? 'Fechamento do pregão' : l.a.classe === 'Fundos' ? 'Valor da cota' : 'Preço unitário (PU)'}</dd></div><div><dt>Data do preço</dt><dd>${dataLabel}</dd></div>
            ${l.a.vencimento ? `<div><dt>Vencimento</dt><dd>${l.a.vencimento}</dd></div><div><dt>Rentabilidade</dt><dd>${esc(l.a.indexador)}</dd></div>` : ''}
            <div><dt>Código ISIN</dt><dd>${l.a.real ? 'Não exibido na demo' : `BR${l.code.slice(0, 6)}00X0 (fictício)`}</dd></div>
            <div><dt>Situação</dt><dd>${l.garantia ? `${fmtQtd(l.garantia)} em garantia · ${fmtQtd(l.qtd - l.garantia)} disponíveis` : 'Disponível'}</dd></div>
            <div><dt>${l.a.classe === 'Ações' || l.a.negociavel ? 'Escriturador' : 'Custodiante'}</dt><dd>Banco Escriturador Demo</dd></div></dl></td></tr>`; }).join('')}</tbody></table></div>
        <p class="meta" style="margin-top:8px">Valor estimado pelo preço de fechamento de cada data. Dados simulados.</p></div>`
      : emptyState({ title: posicoes().length ? 'Nenhum resultado para esse filtro' : 'Não há posições para esta data', actions: s.aplicado || s.classe ? '<button type="button" class="btn btn-outline btn-sm" data-action="pos-limpar">Limpar filtros</button>' : '' })}`;
  } else {
    const gs = linhasGarantia();
    const total = gs.reduce((t, g) => t + g.valor, 0);
    body = `<p class="muted" style="margin-bottom:12px">Ativos dados em garantia de operações aparecem aqui, por instituição. Eles continuam seus, mas não podem ser vendidos enquanto estiverem bloqueados. ${termHelp('garantias', 'garantia')}</p>
      <div class="query-bar"><div class="field"><label for="gar-data">Exibindo garantias de</label><select id="gar-data" class="select" data-change="pos-data"><option value="24" ${s.data === '24' ? 'selected' : ''}>24 nov 2026, 18h</option><option value="23" ${s.data === '23' ? 'selected' : ''}>23 nov 2026, 18h</option></select></div>
        <button type="button" class="btn btn-outline" data-action="gar-baixar" data-fmt="pdf" ${gs.length ? '' : 'disabled'}>${icon('download', 18)}Baixar PDF</button>
        <button type="button" class="btn btn-outline" data-action="gar-baixar" data-fmt="xlsx" ${gs.length ? '' : 'disabled'}>${icon('download', 18)}Baixar Excel</button></div>
      ${gs.length ? `<div class="card"><div class="table-wrap"><table><caption class="sr-only">Garantias em ${dataLabel}</caption>
        <thead><tr><th scope="col">Ativo</th><th scope="col">Instituição</th><th scope="col" class="num">Quantidade</th><th scope="col" class="num">Valor</th><th scope="col" class="col-sec">Finalidade</th><th scope="col" class="col-sec">Desde</th></tr></thead>
        <tbody>${gs.map((g) => `<tr><td><div class="asset-cell"><a href="#/ativos/${g.code}?de=carteira">${esc(g.a.name)}</a><span class="asset-code">${g.code}</span></div></td><td>${g.inst}</td>
          <td class="num">${pQtd(g.qtd)} <span class="meta">${unid(g.a, g.qtd)}</span></td><td class="num">${pBrl(g.valor)}</td><td class="col-sec">${esc(g.finalidade)}</td><td class="col-sec">${g.desde}</td></tr>`).join('')}
          <tr class="total-row"><td colspan="3">Total em garantia</td><td class="num">${pBrl(total)}</td><td class="col-sec" colspan="2"></td></tr></tbody></table></div>
        <p class="meta" style="margin-top:8px">Valor pelo preço de ${dataLabel}. Para liberar uma garantia, encerre ou ajuste a operação na corretora. Dados simulados.</p></div>`
      : emptyState({ title: 'Não há garantias para esta data', text: 'Ter patrimônio na carteira não significa que há garantias registradas.', iconName: 'info' })}`;
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
SUBMITS['pos-filtro'] = (form) => { ui.posicao.aplicado = form.inst.value; ui.posicao.classe = form.classe.value; ui.posicao.filtroAberto = false; rerender('[data-action="pos-filtro"]'); announce('Filtros aplicados'); };
ACTIONS['pos-limpar'] = () => { ui.posicao.aplicado = ''; ui.posicao.classe = ''; rerender('[data-action="pos-filtro"]'); announce('Filtros removidos'); };

/* Linhas de posição e de garantias, usadas na tela e nos arquivos para baixar. */
function linhasPosicao() {
  const s = ui.posicao;
  return posicoes().filter((p) => (!s.aplicado || p.inst === s.aplicado) && (!s.classe || ativo(p.code).classe === s.classe))
    .map((p) => {
      const a = ativo(p.code), preco = s.data === '24' ? a.preco : a.anterior;
      const g = !p.demo && ehPrincipal() ? GARANTIAS.find((x) => x.code === p.code && x.inst === p.inst) : null;
      return { ...p, a, preco, valor: preco * p.qtd, garantia: g ? g.qtd : 0 };
    })
    .sort((x, y) => CLASSES.indexOf(x.a.classe) - CLASSES.indexOf(y.a.classe));
}
function linhasGarantia() {
  if (!ehPrincipal()) return [];
  return GARANTIAS.map((g) => { const a = ativo(g.code); return { ...g, a, valor: g.qtd * (ui.posicao.data === '24' ? a.preco : a.anterior) }; });
}
ACTIONS['pos-baixar'] = (el) => {
  const d = ui.posicao.data === '24' ? REF.atual : REF.anterior, ls = linhasPosicao();
  baixarDocumento({
    titulo: 'Posição de investimentos', arquivo: `posicao-${ui.posicao.data}nov2026`, periodo: `Posição de ${d}`,
    filtros: [ui.posicao.aplicado && 'Instituição: ' + ui.posicao.aplicado, ui.posicao.classe && 'Classe: ' + ui.posicao.classe].filter(Boolean).join(' · '),
    colunas: [['Produto', 'txt'], ['Código', 'txt'], ['Classe', 'txt'], ['Instituição', 'txt'], ['Quantidade', 'qtd'], ['Preço', 'brl'], ['Valor', 'brl']],
    linhas: ls.map((l) => [l.a.name, l.code, l.a.classe, l.inst, l.qtd, l.preco, l.valor]),
    total: ['Total', '', '', '', '', '', ls.reduce((t, l) => t + l.valor, 0)],
    notas: ['Valor estimado pelo preço de fechamento (ações, FIIs e ETFs), preço unitário (renda fixa) ou valor da cota (fundos) da data.'],
  }, el.dataset.fmt);
};
ACTIONS['gar-baixar'] = (el) => {
  const gs = linhasGarantia(), d = ui.posicao.data === '24' ? REF.atual : REF.anterior;
  baixarDocumento({
    titulo: 'Garantias', arquivo: `garantias-${ui.posicao.data}nov2026`, periodo: `Garantias em ${d}`,
    colunas: [['Ativo', 'txt'], ['Código', 'txt'], ['Instituição', 'txt'], ['Quantidade', 'qtd'], ['Valor', 'brl'], ['Finalidade', 'txt'], ['Desde', 'txt']],
    linhas: gs.map((g) => [g.a.name, g.code, g.inst, g.qtd, g.valor, g.finalidade, g.desde]),
    total: ['Total em garantia', '', '', '', gs.reduce((t, g) => t + g.valor, 0), '', ''],
    notas: ['Ativos em garantia continuam sendo seus, mas ficam bloqueados enquanto a operação estiver aberta.'],
  }, el.dataset.fmt);
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
