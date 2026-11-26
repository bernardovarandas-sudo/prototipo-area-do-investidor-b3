/* Consultas existentes com um padrão comum: Extratos, Proventos, Portabilidade, Serviços e Feedback. */

const dataNum = (d) => { const [dd, mm, yy] = d.split('/'); return +(yy + mm + dd); };
const PERIODOS_EXTRATO = {
  '30d': { label: 'Últimos 30 dias', faixa: '25 out a 24 nov 2026', de: 20261025, ate: 20261124 },
  '7d': { label: 'Últimos 7 dias', faixa: '18 a 24 nov 2026', de: 20261118, ate: 20261124 },
  '2025': { label: 'Novembro de 2025', faixa: '1 a 30 nov 2025', de: 20251101, ate: 20251130 },
};

/* ---------- Dados por conta: base da conta principal + compras feitas na demo ---------- */
const ehPrincipal = () => state.session && state.session.conta === 'principal';
function extratoBase(aba) {
  const base = ehPrincipal() ? EXTRATOS[aba] || [] : [];
  const compras = comprasDemo().slice().reverse();
  if (aba === 'movimentacao') return [...compras.map((x) => ({ data: '24/11/2026', mov: 'Compra na demo – liquidação simulada', code: x.code, inst: x.inst, qtd: x.qtd, valor: null, entrada: true, demo: true,
    detalhe: `Compra simulada no protótipo: ${fmt.int(x.qtd)} ações a ${fmt.brl(x.preco)}. Na vida real, a ação entraria aqui depois da liquidação (D+2).` })), ...base];
  if (aba === 'negociacao') return [...compras.map((x) => ({ data: '24/11/2026', lado: 'Compra (demo)', code: x.code, inst: x.inst, qtd: x.qtd, preco: x.preco, liquidacao: '26/11/2026 (simulada)', demo: true })), ...base];
  return base;
}
const fmtDia = (dia) => { const [y, m, d] = dia.split('-'); return `${d}/${m}/${y}`; };
const provRecebidos = () => (ehPrincipal() ? PROVENTOS_RECEBIDOS : []);
function provAReceber() {
  const base = ehPrincipal() ? PROVENTOS_A_RECEBER : [];
  const grupos = {};
  comprasDemo().forEach((x) => {
    const pr = PROV_POR_ACAO[x.code];
    if (!pr) return;
    const k = x.code + '|' + x.inst;
    const g = grupos[k] || (grupos[k] = { id: `demo-${x.code.toLowerCase()}-${x.inst.slice(-1).toLowerCase()}`, data: fmtDia(pr.dia), dia: pr.dia, code: x.code, tipo: pr.tipo, inst: x.inst, valor: 0, demo: true });
    g.valor += x.qtd * pr.vps;
  });
  return [...base, ...Object.values(grupos)].sort((a, b) => (a.dia || '9999').localeCompare(b.dia || '9999'));
}

/* ---------- Extratos ---------- */
function extratoLinhas(aba) {
  const s = ui.extrato, p = PERIODOS_EXTRATO[s.periodo];
  return extratoBase(aba).filter((r) => {
    const d = dataNum(r.data);
    return d >= p.de && d <= p.ate && (!s.aplicado.inst || r.inst === s.aplicado.inst) && (!s.aplicado.ativo || r.code === s.aplicado.ativo);
  });
}

function extratoTabela(aba, linhas) {
  const ativoCell = (code, demo) => `<div class="asset-cell"><span class="asset-name">${esc(ativo(code).name)}</span><span class="asset-code">${code}${demo ? ' · <span class="demo-badge sm">Demo</span>' : ''}</span></div>`;
  const det = (k, colspan, html) => `<tr class="detail-row" data-group="${k}" id="${k}" ${ui.expand[k] ? '' : 'hidden'}><td colspan="${colspan}">${html}</td></tr>`;
  const btn = (k, label) => `<button type="button" class="expand-btn" data-action="expand" data-key="${k}" aria-expanded="${!!ui.expand[k]}" aria-controls="${k}">Detalhes<span class="sr-only"> ${esc(label)}</span>${icon('chevronDown', 14)}</button>`;
  if (aba === 'movimentacao') {
    return `<table><caption class="sr-only">Movimentação</caption><thead><tr><th scope="col">Data</th><th scope="col">Movimentação</th><th scope="col">Ativo</th><th scope="col" class="col-sec">Instituição</th><th scope="col" class="num">Valor</th><th scope="col"><span class="sr-only">Detalhes</span></th></tr></thead><tbody>
      ${linhas.map((r, i) => { const k = 'mov-' + i; return `<tr><td class="nowrap">${r.data}</td><td>${esc(r.mov)}</td><td>${ativoCell(r.code, r.demo)}</td><td class="col-sec">${r.inst}</td><td class="num">${r.valor != null ? pBrl(r.valor) : '<span class="meta">Não informado</span>'}</td><td class="num">${btn(k, r.mov + ' ' + r.data)}</td></tr>
        ${det(k, 6, `<dl class="dl"><div><dt>Quantidade</dt><dd>${pQtd(r.qtd)}</dd></div><div><dt>Instituição</dt><dd>${r.inst}</dd></div><div><dt>Origem dos dados</dt><dd>Central depositária (demo)</dd></div></dl><p class="meta" style="margin-top:8px">${esc(r.detalhe)}</p>`)}`; }).join('')}</tbody></table>`;
  }
  if (aba === 'negociacao') {
    return `<table><caption class="sr-only">Negociação</caption><thead><tr><th scope="col">Data da negociação</th><th scope="col">Compra/venda</th><th scope="col">Ativo</th><th scope="col" class="col-sec">Instituição</th><th scope="col" class="num">Quantidade</th><th scope="col"><span class="sr-only">Detalhes</span></th></tr></thead><tbody>
      ${linhas.map((r, i) => { const k = 'neg-' + i; return `<tr><td class="nowrap">${r.data}</td><td>${r.lado}</td><td>${ativoCell(r.code, r.demo)}</td><td class="col-sec">${r.inst}</td><td class="num">${pQtd(r.qtd)}</td><td class="num">${btn(k, r.lado + ' ' + r.data)}</td></tr>
        ${det(k, 6, `<dl class="dl"><div><dt>Preço</dt><dd>${fmt.brl(r.preco)}</dd></div><div><dt>Valor</dt><dd>${pBrl(r.preco * r.qtd)}</dd></div><div><dt>Data de liquidação</dt><dd>${r.liquidacao}</dd></div></dl><p style="margin-top:8px">${termHelp('liquidacao', 'liquidação')}</p>`)}`; }).join('')}</tbody></table>`;
  }
  return `<table><caption class="sr-only">Eventos</caption><thead><tr><th scope="col">Data</th><th scope="col">Evento</th><th scope="col">Ativo</th><th scope="col" class="col-sec">Situação</th><th scope="col" class="num">Valor</th></tr></thead><tbody>
    ${linhas.map((r) => `<tr><td class="nowrap">${r.data}</td><td>${esc(r.evento)}<br><a class="meta" href="#/proventos">Ver em Proventos</a></td><td>${ativoCell(r.code)}</td><td class="col-sec">${esc(r.situacao)}</td><td class="num">${pBrl(r.valor)}</td></tr>`).join('')}</tbody></table>`;
}

function viewExtratos(route) {
  const aba = route.m[1] || 'movimentacao';
  const s = ui.extrato, p = PERIODOS_EXTRATO[s.periodo];
  const linhas = extratoLinhas(aba);
  const nomes = { movimentacao: 'Movimentação', negociacao: 'Negociação', eventos: 'Eventos', ofertas: 'Ofertas públicas' };
  const chips = [s.aplicado.inst && ['inst', 'Instituição: ' + s.aplicado.inst], s.aplicado.ativo && ['ativo', 'Ativo: ' + ativo(s.aplicado.ativo).name]].filter(Boolean);
  const temInst = aba !== 'eventos' && aba !== 'ofertas';

  let corpo;
  if (!linhas.length) {
    corpo = emptyState({
      title: 'Nenhum resultado para esse período',
      text: aba === 'ofertas' ? 'Na demonstração, esta conta não tem registros de ofertas públicas.' : `Não há registros de ${nomes[aba].toLowerCase()} de ${p.faixa}${chips.length ? ' com os filtros aplicados' : ''}.`,
      actions: '<button type="button" class="btn btn-outline btn-sm" data-action="ext-alterar">Alterar filtros</button>' + (chips.length ? '<button type="button" class="btn btn-link btn-sm" data-action="ext-limpar">Limpar filtros</button>' : ''),
      iconName: 'file',
    });
  } else {
    corpo = `<div class="card"><div class="table-wrap">${extratoTabela(aba, linhas)}</div></div>`;
  }

  return {
    title: 'Extratos · ' + nomes[aba], nav: 'extratos', pageKey: 'extratos', crumbs: [['Extratos', '/extratos'], [nomes[aba]]],
    html: `<div class="page-head"><div><h1 class="h1">Extratos</h1><p class="meta lead">Consulte movimentações, negociações, eventos e ofertas da sua conta</p></div>
        <a class="btn btn-link" href="#/servicos/relatorios">Procura um relatório consolidado?</a></div>
      ${tabs(Object.entries(nomes), aba, { label: 'Tipo de extrato', id: 'extratos', hrefFor: (k) => '/extratos/' + k })}
      <div class="query-bar">
        <div class="field"><label for="ext-periodo">Período</label>
          <select id="ext-periodo" class="select" data-change="ext-periodo">${Object.entries(PERIODOS_EXTRATO).map(([k, v]) => `<option value="${k}" ${k === s.periodo ? 'selected' : ''}>${v.label}</option>`).join('')}</select></div>
        <button type="button" class="btn btn-outline" data-action="ext-filtro" aria-expanded="${s.filtroAberto}" aria-controls="ext-filtros">${icon('filter', 18)}Filtrar</button>
        <button type="button" class="btn btn-outline" data-action="ext-baixar" aria-expanded="${s.baixarAberto}" aria-controls="ext-baixar" ${linhas.length ? '' : 'disabled aria-describedby="sem-baixar"'}>${icon('download', 18)}Baixar</button>
        ${linhas.length ? '' : '<span id="sem-baixar" class="meta">Sem resultados para baixar neste período.</span>'}
      </div>
      <form class="card filter-panel" id="ext-filtros" data-form="ext-filtro" ${s.filtroAberto ? '' : 'hidden'}>
        <h2 class="h3" style="margin-bottom:12px">Filtrar extrato</h2>
        <div class="filter-grid">
          ${temInst ? `<div class="field"><label for="f-inst">Instituição</label><select id="f-inst" name="inst" class="select"><option value="">Todas</option>${INSTITUICOES_DEMO.map((i) => `<option ${s.aplicado.inst === i ? 'selected' : ''}>${i}</option>`).join('')}</select></div>` : ''}
          <div class="field"><label for="f-ativo">Ativo</label><select id="f-ativo" name="ativo" class="select"><option value="">Todos</option>${[...new Set(['movimentacao', 'negociacao', 'eventos'].flatMap((k) => extratoBase(k).map((r) => r.code)))].map((c) => `<option value="${c}" ${s.aplicado.ativo === c ? 'selected' : ''}>${ativo(c).name} · ${c}</option>`).join('')}</select></div>
        </div>
        <div class="btn-row"><button class="btn btn-primary" type="submit">Aplicar filtros</button><button class="btn btn-link" type="button" data-action="ext-limpar">Limpar</button></div>
      </form>
      <div class="card filter-panel" id="ext-baixar" ${s.baixarAberto && linhas.length ? '' : 'hidden'}>
        <h2 class="h3">Baixar extrato</h2>
        <p class="meta" style="margin:4px 0 12px">${nomes[aba]} · ${p.faixa}${chips.length ? ' · com filtros' : ''}</p>
        <fieldset style="border:0;padding:0;margin:0"><legend class="label" style="font-weight:600;color:var(--ink);font-size:14px">Formato</legend>
          <div class="btn-row" style="margin-top:4px">${['PDF', 'Excel'].map((f) => `<label style="display:inline-flex;gap:6px;align-items:center;min-height:44px"><input type="radio" name="fmt" value="${f}" data-change="ext-fmt" ${s.formato === f ? 'checked' : ''}> ${f}</label>`).join('')}</div></fieldset>
        <div class="btn-row"><button type="button" class="btn btn-primary" data-action="ext-download" data-aba="${aba}">Baixar arquivo de exemplo</button></div>
        <p class="meta" style="margin-top:8px">Na demonstração, o arquivo é um .csv fictício, identificado como tal.</p>
      </div>
      ${chips.length ? `<div class="chips">${chips.map(([k, t]) => `<span class="chip">${esc(t)}<button type="button" data-action="ext-chip" data-k="${k}" aria-label="Remover filtro ${esc(t)}">${icon('x', 16)}</button></span>`).join('')}<button type="button" class="btn btn-link btn-sm" data-action="ext-limpar">Limpar filtros</button></div>` : ''}
      <p class="meta" style="margin-bottom:12px">Exibindo de ${p.faixa} · ${linhas.length} ${linhas.length === 1 ? 'registro' : 'registros'}</p>
      ${corpo}`,
  };
}
CHANGES['ext-periodo'] = (el) => { ui.extrato.periodo = el.value; rerender('#ext-periodo'); };
CHANGES['ext-fmt'] = (el) => { ui.extrato.formato = el.value; };
ACTIONS['ext-filtro'] = () => { ui.extrato.filtroAberto = !ui.extrato.filtroAberto; ui.extrato.baixarAberto = false; rerender(ui.extrato.filtroAberto ? '#ext-filtros select' : '[data-action="ext-filtro"]'); };
ACTIONS['ext-alterar'] = () => { ui.extrato.filtroAberto = true; rerender('#ext-periodo'); };
ACTIONS['ext-baixar'] = () => { ui.extrato.baixarAberto = !ui.extrato.baixarAberto; ui.extrato.filtroAberto = false; rerender('[data-action="ext-baixar"]'); };
SUBMITS['ext-filtro'] = (form) => {
  ui.extrato.aplicado = { inst: form.inst ? form.inst.value : '', ativo: form.ativo.value };
  ui.extrato.filtroAberto = false; rerender('[data-action="ext-filtro"]'); announce('Filtros aplicados');
};
ACTIONS['ext-limpar'] = () => { ui.extrato.aplicado = { inst: '', ativo: '' }; rerender('[data-action="ext-filtro"]'); announce('Filtros removidos'); };
ACTIONS['ext-chip'] = (el) => { ui.extrato.aplicado[el.dataset.k] = ''; rerender('[data-action="ext-filtro"]'); announce('Filtro removido'); };
ACTIONS['ext-download'] = (el) => {
  const aba = el.dataset.aba, linhas = extratoLinhas(aba), s = ui.extrato;
  downloadDemo(`extrato-${aba}-demo.csv`, [`Formato escolhido: ${s.formato} · Período: ${PERIODOS_EXTRATO[s.periodo].faixa}`, 'Data;Descrição;Ativo;Instituição;Quantidade;Valor',
    ...linhas.map((r) => [r.data, r.mov || r.lado || r.evento, r.code, r.inst || '', r.qtd || '', r.valor != null ? nf2.format(r.valor) : ''].join(';'))]);
};

/* ---------- Proventos ---------- */
function viewProventos(route) {
  const aba = route.m[1] || 'visao';
  const vazia = !posicoes().length;
  const RECEBIDOS = provRecebidos(), A_RECEBER = provAReceber();
  const nomes = { visao: 'Visão geral', recebidos: 'Recebidos', 'a-receber': 'A receber', radar: 'Radar', calendario: 'Calendário' };
  const ativoCell = (code, demo) => `<div class="asset-cell"><a href="#/ativos/${code}">${esc(ativo(code).name)}</a><span class="asset-code">${code}${demo ? ' · <span class="demo-badge sm">Demo</span>' : ''}</span></div>`;
  const recMes = RECEBIDOS.filter((p) => p.mes === '2026-11').reduce((s, p) => s + p.valor, 0);
  const aRec = A_RECEBER.filter((p) => p.valor != null).reduce((s, p) => s + p.valor, 0);
  let body;

  if (vazia && aba !== 'radar') {
    body = emptyState({ title: 'Seus proventos vão aparecer aqui quando você tiver investimentos.', text: 'Proventos são pagamentos feitos a quem tem o ativo.', iconName: 'coins' });
  } else if (aba === 'visao') {
    const prox = A_RECEBER;
    const p1 = A_RECEBER.find((p) => p.dia), semData = A_RECEBER.filter((p) => !p.dia).length;
    body = `<div class="kpis card">
        <div class="kpi"><div class="label">Recebidos no mês</div><div class="value big">${pBrl(recMes)}</div><div class="sub meta">Novembro de 2026</div></div>
        <div class="kpi"><div class="label">A receber</div><div class="value big">${pBrl(aRec)}</div><div class="sub meta">Com data prevista${semData ? ` · mais ${semData} a confirmar` : ''}</div></div>
        <div class="kpi"><div class="label">Próximo pagamento</div><div class="value h2">${p1 ? p1.data : 'Nenhum previsto'}</div><div class="sub meta">${p1 ? `${esc(ativo(p1.code).name)} · ${p1.tipo}` : 'Compre uma ação na demo para ver um exemplo'}</div></div>
      </div>
      ${comprasDemo().length ? `<p class="note demo-note" style="margin-top:16px">${icon('cart', 18)}<span>Inclui proventos das ações compradas na demo. Valores e datas desses pagamentos são simulados.</span></p>` : ''}`;
    body += `
      <section class="card" style="margin-top:24px" aria-labelledby="prox"><h2 class="h2" id="prox">Próximos pagamentos</h2>
        <div class="table-wrap" style="margin-top:8px"><table><caption class="sr-only">Próximos pagamentos</caption>
          <thead><tr><th scope="col">Data prevista</th><th scope="col">Ativo</th><th scope="col" class="col-sec">Tipo</th><th scope="col" class="num">Valor previsto</th></tr></thead>
          <tbody>${prox.map((p) => `<tr><td>${p.data ? `<a href="#/proventos/pagamento/${p.id}">${p.data}</a>` : `<a href="#/proventos/pagamento/${p.id}" class="tv tv-flat">Data a confirmar</a>`}</td><td>${ativoCell(p.code, p.demo)}</td><td class="col-sec">${p.tipo}</td><td class="num">${p.valor != null ? pBrl(p.valor) : '<span class="meta">A confirmar</span>'}</td></tr>`).join('')}</tbody></table></div>
        <div class="card-foot"><a href="#/proventos/recebidos">Ver histórico de recebidos</a><a href="#/proventos/calendario">Ver calendário</a></div>
      </section>`;
  } else if (aba === 'recebidos') {
    const s = ui.prov;
    const per = { '3m': ['Últimos 3 meses', ['2026-09', '2026-10', '2026-11']], nov: ['Novembro de 2026', ['2026-11']], '2025': ['Ano de 2025', []] };
    const linhas = RECEBIDOS.filter((p) => per[s.periodo][1].includes(p.mes) && (!s.inst || p.inst === s.inst));
    body = `<div class="query-bar">
        <div class="field"><label for="pr-per">Período</label><select id="pr-per" class="select" data-change="prov-per">${Object.entries(per).map(([k, v]) => `<option value="${k}" ${k === s.periodo ? 'selected' : ''}>${v[0]}</option>`).join('')}</select></div>
        <div class="field"><label for="pr-inst">Instituição</label><select id="pr-inst" class="select" data-change="prov-inst"><option value="">Todas</option>${INSTITUICOES_DEMO.map((i) => `<option ${s.inst === i ? 'selected' : ''}>${i}</option>`).join('')}</select></div>
      </div>
      ${linhas.length ? `<div class="card"><div class="table-wrap"><table><caption class="sr-only">Proventos recebidos</caption>
        <thead><tr><th scope="col">Data de pagamento</th><th scope="col">Ativo</th><th scope="col">Tipo</th><th scope="col" class="col-sec">Instituição</th><th scope="col" class="num">Valor recebido</th></tr></thead>
        <tbody>${linhas.map((p) => `<tr><td><a href="#/proventos/pagamento/${p.id}">${p.data}</a></td><td>${ativoCell(p.code)}</td><td>${p.tipo}</td><td class="col-sec">${p.inst}</td><td class="num">${pBrl(p.valor)}</td></tr>`).join('')}
        <tr class="total-row"><td colspan="3">Total no recorte · ${per[s.periodo][0]}</td><td class="col-sec"></td><td class="num">${pBrl(linhas.reduce((a, p) => a + p.valor, 0))}</td></tr></tbody></table></div></div>`
      : emptyState({ title: 'Nenhum resultado para esse período', actions: '<button type="button" class="btn btn-outline btn-sm" data-action="focus" data-target="#pr-per">Alterar filtros</button>' })}`;
  } else if (aba === 'a-receber') {
    body = `<p class="muted" style="margin-bottom:12px">Valores previstos não entram no total recebido. A elegibilidade depende de ter o ativo na data de corte.</p>
      <div class="card"><div class="table-wrap"><table><caption class="sr-only">Proventos a receber</caption>
        <thead><tr><th scope="col">Data prevista</th><th scope="col">Ativo</th><th scope="col" class="col-sec">Tipo</th><th scope="col" class="col-sec">Instituição</th><th scope="col" class="num">Valor previsto</th><th scope="col">Meu calendário</th></tr></thead>
        <tbody>${A_RECEBER.length ? '' : '<tr><td colspan="6" class="muted">Nenhum provento previsto. Compre na demo uma ação que paga proventos, como ITUB4 ou PETR4.</td></tr>'}${A_RECEBER.map((p) => `<tr><td><a href="#/proventos/pagamento/${p.id}">${p.data || 'Data a confirmar'}</a></td><td>${ativoCell(p.code, p.demo)}</td><td class="col-sec">${p.tipo}</td><td class="col-sec">${p.inst}</td><td class="num">${p.valor != null ? pBrl(p.valor) : '<span class="meta">A confirmar</span>'}</td>
          <td>${p.dia ? `<button type="button" class="btn btn-link btn-sm cal-btn" data-action="ics" data-id="${p.id}">${icon('calendar', 16)}Adicionar ao meu calendário<span class="sr-only">: ${esc(ativo(p.code).name)}, ${p.data}</span></button>` : '<span class="tv tv-flat">Data a confirmar</span>'}</td></tr>`).join('')}</tbody></table></div></div>
      <p class="meta" style="margin-top:8px">“Adicionar ao meu calendário” baixa um arquivo .ics com o lembrete “Conferir provento na B3” no dia do pagamento, sem valores nem quantidades. Funciona no Google Agenda, no Outlook e no Calendário da Apple.</p>
      ${A_RECEBER.some((p) => p.demo) ? '<p class="meta" style="margin-top:8px">Linhas marcadas como Demo vêm das compras simuladas, com valor por ação e data fictícios.</p>' : ''}`;
  } else if (aba === 'radar') {
    body = `<p class="note warn" style="margin-bottom:16px">${icon('info', 18)}<span>A fonte e a cobertura desta aba serão confirmadas antes do uso real.</span></p>
      <div class="card"><div class="table-wrap"><table><caption class="sr-only">Radar de anúncios</caption>
        <thead><tr><th scope="col">Ativo</th><th scope="col">Tipo</th><th scope="col" class="col-sec">Anunciado em</th><th scope="col">Pagamento</th><th scope="col">Para você</th></tr></thead>
        <tbody>${RADAR.map((r) => { const meu = temAtivo(r.code); return `<tr><td>${ativoCell(r.code)}</td><td>${r.tipo}</td><td class="col-sec">${r.anuncio}</td><td>${r.pagamento || 'Data a confirmar'}</td>
          <td>${meu ? `<span class="rel-tag rel-direta">${icon('check', 16)}Provento previsto para você</span>` : `<span class="rel-tag rel-sem">${icon('minus', 16)}Anúncio · você não tem este ativo</span>`}</td></tr>`; }).join('')}</tbody></table></div></div>`;
  } else {
    body = calendario();
  }
  return {
    title: 'Proventos · ' + nomes[aba], nav: 'proventos', pageKey: 'proventos', crumbs: [['Proventos', '/proventos'], [nomes[aba]]],
    html: `<div class="page-head"><div><h1 class="h1">Proventos</h1><p class="meta lead">Pagamentos recebidos e previstos · Dados simulados ${termHelp('proventos', 'provento')}</p></div></div>
      ${tabs(Object.entries(nomes), aba, { label: 'Proventos', id: 'proventos', hrefFor: (k) => '/proventos/' + k })}
      ${body}`,
  };
}
CHANGES['prov-per'] = (el) => { ui.prov.periodo = el.value; rerender('#pr-per'); };
CHANGES['prov-inst'] = (el) => { ui.prov.inst = el.value; rerender('#pr-inst'); };
ACTIONS.focus = (el) => { const t = document.querySelector(el.dataset.target); t && t.focus(); };

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
function calendario() {
  const { y, m, filtro } = ui.cal;
  const ev = [];
  if (filtro !== 'previstos') provRecebidos().forEach((p) => { const [dd, mm, yy] = p.data.split('/'); ev.push({ y: +yy, m: +mm - 1, d: +dd, tipo: 'rec', p }); });
  if (filtro !== 'recebidos') provAReceber().filter((p) => p.dia).forEach((p) => { const [yy, mm, dd] = p.dia.split('-'); ev.push({ y: +yy, m: +mm - 1, d: +dd, tipo: 'prev', p }); });
  const doMes = ev.filter((e) => e.y === y && e.m === m).sort((a, b) => a.d - b.d);
  const first = new Date(y, m, 1).getDay(), dias = new Date(y, m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < first; i++) cells.push('<div class="day out" aria-hidden="true"></div>');
  for (let d = 1; d <= dias; d++) {
    const es = doMes.filter((e) => e.d === d);
    const hoje = y === 2026 && m === 10 && d === 24;
    cells.push(`<div class="day ${hoje ? 'today' : ''}" aria-hidden="true">${d}${es.map((e) => `<span class="ev ${e.tipo}">${e.tipo === 'rec' ? 'Recebido' : 'Previsto'}</span>`).join('')}</div>`);
  }
  return `<section class="card" aria-labelledby="cal-t">
    <div class="card-head">
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        <button type="button" class="icon-btn" data-action="cal-nav" data-d="-1" aria-label="Mês anterior">${icon('chevronLeft')}</button>
        <h2 class="h2" id="cal-t" aria-live="polite" style="min-width:150px;text-align:center">${MESES[m][0].toUpperCase() + MESES[m].slice(1)} de ${y}</h2>
        <button type="button" class="icon-btn" data-action="cal-nav" data-d="1" aria-label="Próximo mês">${icon('chevronRight')}</button>
        <button type="button" class="btn btn-outline btn-sm" data-action="cal-hoje">Hoje</button>
      </div>
      <div class="seg" role="group" aria-label="Mostrar">${[['todos', 'Todos'], ['recebidos', 'Recebidos'], ['previstos', 'Previstos']].map(([k, t]) => `<button type="button" data-action="cal-filtro" data-f="${k}" aria-pressed="${filtro === k}">${t}</button>`).join('')}</div>
    </div>
    <div class="cal" aria-hidden="true">${['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d) => `<div class="dow">${d}</div>`).join('')}${cells.join('')}</div>
    <ul class="legend" aria-hidden="true"><li><span class="swatch" style="background:var(--positive-bg);border:1px solid var(--positive-text)"></span>Recebido</li><li><span class="swatch" style="background:var(--warning-bg);border:1px solid var(--warning-text)"></span>Previsto</li><li><span class="swatch" style="border:2px solid var(--brand-vivid)"></span>Hoje na demo (24 nov)</li></ul>
    <h3 class="h3" style="margin-top:20px">Pagamentos em ${MESES[m]} de ${y}</h3>
    ${doMes.length ? `<ul class="calc-list cal-list" style="margin-top:8px">${doMes.map((e) => `<li><a href="#/proventos/pagamento/${e.p.id}?de=calendario"><span>${String(e.d).padStart(2, '0')}/${String(m + 1).padStart(2, '0')} · ${esc(ativo(e.p.code).name)} · ${e.p.tipo}</span>
        <span class="ev-status ${e.tipo}">${e.tipo === 'rec' ? 'Recebido' : 'Previsto'}</span></a><span class="num">${pBrl(e.p.valor)}</span></li>`).join('')}</ul>
      <p class="meta" style="margin-top:6px">Abra um pagamento para ver o detalhe${filtro !== 'recebidos' ? ' e adicionar os previstos ao seu calendário' : ''}.</p>`
      : '<p class="muted" style="margin-top:8px">Nenhum pagamento neste mês.</p>'}
    ${filtro !== 'recebidos' ? provAReceber().filter((p) => !p.dia).map((p) => `<p class="meta" style="margin-top:8px"><a href="#/proventos/pagamento/${p.id}?de=calendario">${esc(ativo(p.code).name)} · ${p.tipo}</a>: Data a confirmar, fora do calendário.</p>`).join('') : ''}
  </section>`;
}
ACTIONS['cal-nav'] = (el) => { let m = ui.cal.m + +el.dataset.d, y = ui.cal.y; if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } ui.cal.m = m; ui.cal.y = y; rerender(`[data-action="cal-nav"][data-d="${el.dataset.d}"]`); };
ACTIONS['cal-hoje'] = () => { ui.cal.m = 10; ui.cal.y = 2026; rerender('[data-action="cal-hoje"]'); };
ACTIONS['cal-filtro'] = (el) => { ui.cal.filtro = el.dataset.f; rerender(`[data-action="cal-filtro"][data-f="${el.dataset.f}"]`); };

/* ---------- Portabilidade (simulação em 4 etapas; nada é transferido) ---------- */
const DESTINOS_PORTA = ['Corretora A', 'Corretora B', 'Corretora C (exemplo)'];
function viewPortabilidade(route) {
  const aba = route.m[1] || 'transferir';
  const nomes = { transferir: 'Transferir investimentos', solicitacoes: 'Minhas solicitações' };
  const w = ui.porta, pos = posicoes();
  const insts = [...new Set(pos.map((p) => p.inst))];
  let body;
  if (aba === 'transferir') {
    const passos = ['Origem', 'Destino', 'Seleção', 'Revisão'];
    const etapas = `<ol class="steps" aria-label="Etapas da portabilidade">${passos.map((t, i) => `<li class="${i + 1 === w.passo ? 'is-current' : i + 1 < w.passo ? 'is-done' : ''}" ${i + 1 === w.passo ? 'aria-current="step"' : ''}><strong>${t}</strong></li>`).join('')}</ol>`;
    let passo;
    if (!insts.length) {
      passo = emptyState({ title: 'Não há investimentos para transferir', text: 'Quando houver posições na sua conta, você escolhe a origem aqui.', iconName: 'transfer', actions: '<a class="btn btn-outline btn-sm" href="#/mercado">Comprar uma ação na demo</a>' });
    } else if (w.passo === 1) {
      passo = `<form class="card stack-sm porta-form" data-form="porta" data-passo="1"><h2 class="h2">De onde sai o investimento?</h2>
        <div class="field"><label for="po-origem">Instituição de origem</label><select id="po-origem" class="select" name="origem" required>${insts.map((i) => `<option ${w.origem === i ? 'selected' : ''}>${i}</option>`).join('')}</select></div>
        <div class="btn-row"><button class="btn btn-primary" type="submit">Continuar</button></div></form>`;
    } else if (w.passo === 2) {
      passo = `<form class="card stack-sm porta-form" data-form="porta" data-passo="2"><h2 class="h2">Para onde vai?</h2><p class="meta">Origem: ${esc(w.origem)}</p>
        <div class="field"><label for="po-destino">Instituição de destino</label><select id="po-destino" class="select" name="destino" required>${DESTINOS_PORTA.filter((d) => d !== w.origem).map((d) => `<option ${w.destino === d ? 'selected' : ''}>${d}</option>`).join('')}</select></div>
        <div class="btn-row"><button class="btn btn-primary" type="submit">Continuar</button><button class="btn btn-outline" type="button" data-action="porta-voltar">Voltar</button></div></form>`;
    } else if (w.passo === 3) {
      const daOrigem = agruparPorCodigo(pos.filter((p) => p.inst === w.origem));
      passo = `<form class="card stack-sm porta-form" data-form="porta" data-passo="3"><h2 class="h2">O que você quer transferir?</h2><p class="meta">${esc(w.origem)} → ${esc(w.destino)}</p>
        <div class="table-wrap"><table><caption class="sr-only">Ativos elegíveis na origem</caption>
          <thead><tr><th scope="col">Transferir</th><th scope="col">Ativo</th><th scope="col" class="num">Disponível</th><th scope="col" class="num">Quantidade</th></tr></thead>
          <tbody>${daOrigem.map((p) => { const v = w.itens[p.code]; return `<tr><td><input type="checkbox" name="sel" value="${p.code}" id="po-${p.code}" ${v ? 'checked' : ''} aria-label="Transferir ${esc(ativo(p.code).name)}"></td>
            <td><label for="po-${p.code}">${esc(ativo(p.code).name)} · ${p.code}</label></td><td class="num">${pQtd(p.qtd)}</td>
            <td class="num"><input class="input qty-input" type="number" name="q-${p.code}" min="1" max="${p.qtd}" value="${v || p.qtd}" aria-label="Quantidade de ${esc(ativo(p.code).name)}"></td></tr>`; }).join('')}</tbody></table></div>
        <div class="btn-row"><button class="btn btn-primary" type="submit">Revisar</button><button class="btn btn-outline" type="button" data-action="porta-voltar">Voltar</button></div></form>`;
    } else {
      passo = `<section class="card stack-sm"><h2 class="h2">Confira antes de enviar</h2>
        <dl class="dl"><div><dt>Origem</dt><dd>${esc(w.origem)}</dd></div><div><dt>Destino</dt><dd>${esc(w.destino)}</dd></div></dl>
        <ul class="calc-list">${Object.entries(w.itens).map(([c, q]) => `<li><span>${esc(ativo(c).name)} · ${c}</span><strong>${pQtd(q)} ações</strong></li>`).join('')}</ul>
        <p class="note neutral">${icon('info', 18)}<span>Simulação: nenhuma transferência é feita. No real, a instituição de origem analisa o pedido e pode levar alguns dias úteis.</span></p>
        <div class="btn-row"><button class="btn btn-primary" type="button" data-action="porta-enviar">Enviar solicitação</button><button class="btn btn-outline" type="button" data-action="porta-voltar">Voltar</button></div></section>`;
    }
    body = etapas + `<div style="margin-top:20px">${passo}</div>`;
  } else {
    body = ui.solicitacoes.length
      ? `<div class="stack-sm">${ui.solicitacoes.map((x) => `<section class="card"><div class="card-head" style="margin:0"><div><h2 class="h3">Protocolo ${x.protocolo}</h2>
          <p class="meta">${esc(x.origem)} → ${esc(x.destino)} · Enviada em ${REF.atualCurta}</p></div><span class="rel-tag rel-indireta">${icon('refresh', 16)}Em análise na origem</span></div>
          <ul class="calc-list" style="margin-top:8px">${Object.entries(x.itens).map(([c, q]) => `<li><span>${esc(ativo(c).name)} · ${c}</span><strong>${pQtd(q)}</strong></li>`).join('')}</ul>
          <p class="meta" style="margin-top:8px">Próximo passo: a instituição de origem confirma o pedido. Simulação, nada foi transferido.</p>
          <div class="btn-row"><button type="button" class="btn btn-link btn-sm" data-action="porta-cancelar" data-p="${x.protocolo}">Cancelar solicitação</button></div></section>`).join('')}</div>`
      : emptyState({ title: 'Você não tem solicitações de portabilidade', text: 'Quando houver, você verá aqui a situação, as instituições, a data da última atualização e o próximo passo.', iconName: 'transfer', actions: '<a class="btn btn-outline btn-sm" href="#/portabilidade/transferir">Simular uma transferência</a>' });
  }
  return {
    title: 'Portabilidade', nav: 'portabilidade', pageKey: 'portabilidade', crumbs: [['Portabilidade', '/portabilidade'], [nomes[aba]]],
    html: `<div class="page-head"><div><h1 class="h1">Portabilidade</h1><p class="meta lead">Transfira investimentos entre instituições e acompanhe pedidos. Na demo, é uma simulação.</p></div></div>
      ${tabs(Object.entries(nomes), aba, { label: 'Portabilidade', id: 'porta', hrefFor: (k) => '/portabilidade/' + k })}
      ${body}`,
  };
}
function agruparPorCodigo(lista) {
  const g = {};
  lista.forEach((p) => { g[p.code] = g[p.code] || { code: p.code, qtd: 0 }; g[p.code].qtd += p.qtd; });
  return Object.values(g);
}
SUBMITS.porta = (form) => {
  const w = ui.porta, passo = +form.dataset.passo;
  if (passo === 1) { w.origem = form.origem.value; w.destino = ''; w.itens = {}; }
  if (passo === 2) w.destino = form.destino.value;
  if (passo === 3) {
    const sel = [...form.querySelectorAll('input[name="sel"]:checked')].map((x) => x.value);
    if (!sel.length) { toast('Marque pelo menos um ativo para transferir.'); return; }
    w.itens = {};
    sel.forEach((c) => { const inp = form['q-' + c]; w.itens[c] = Math.min(+inp.max, Math.max(1, Math.floor(+inp.value || 1))); });
  }
  w.passo = passo + 1;
  rerender('#conteudo .porta-form select, #conteudo .porta-form input, #conteudo h2');
};
ACTIONS['porta-voltar'] = () => { ui.porta.passo = Math.max(1, ui.porta.passo - 1); rerender('#conteudo .porta-form select, #conteudo .porta-form input'); };
ACTIONS['porta-enviar'] = () => {
  const w = ui.porta;
  const protocolo = 'PD-' + String(Date.now()).slice(-6);
  ui.solicitacoes.unshift({ protocolo, origem: w.origem, destino: w.destino, itens: { ...w.itens } });
  ui.porta = { passo: 1, origem: '', destino: '', itens: {} };
  toast(`Solicitação ${protocolo} enviada (simulação).`);
  go('/portabilidade/solicitacoes');
};
ACTIONS['porta-cancelar'] = (el) => {
  ui.solicitacoes = ui.solicitacoes.filter((x) => x.protocolo !== el.dataset.p);
  toast('Solicitação cancelada (simulação).');
  rerender('#conteudo h1');
};

/* ---------- Serviços ---------- */
function viewServicos(route) {
  const aba = route.m[1] || 'ir';
  const nomes = { ir: 'Calculadoras de IR', voto: 'Voto a distância', calc: 'CALC de Renda Fixa', relatorios: 'Relatórios' };
  let body;
  if (aba === 'ir') {
    body = `<p class="muted" style="margin-bottom:16px">Ferramentas parceiras para calcular imposto de renda. Algumas exigem contratação e autorização para compartilhar dados. A demonstração não compartilha dados.</p>
      <div class="grid-12">${[['Parceiro de IR A (exemplo)', 'Ações, FIIs e day trade'], ['Parceiro de IR B (exemplo)', 'Ações e renda fixa'], ['Parceiro de IR C (exemplo)', 'Ações e criptoativos']].map(([n, e]) => `
        <section class="card span-4"><h2 class="h3">${n}</h2><p class="meta" style="margin-top:4px">Escopo: ${e}</p>
          <div class="btn-row"><a class="btn btn-outline btn-sm" href="#/saida?para=${encodeURIComponent(n)}&volta=${encodeURIComponent('/servicos/ir')}">Ir para o site ${icon('external', 16)}</a></div></section>`).join('')}</div>
      <p class="note" style="margin-top:16px">${icon('file', 18)}<span>Procura um documento? <a href="#/servicos/relatorios">Ver Relatórios</a></span></p>`;
  } else if (aba === 'voto') {
    body = `<p class="note warn" style="margin-bottom:16px">${icon('info', 18)}<span>Simulação: o voto fica registrado só nesta demonstração.</span></p>
      <div class="stack-sm">${ASSEMBLEIAS.map((a, i) => { const k = 'ass-' + i; const code = a.empresa.split('· ')[1]; const voto = ui.votos[i]; return `<section class="card">
        <div class="card-head" style="margin:0"><div><h2 class="h3">${esc(a.empresa)}</h2><p class="meta">Assembleia em ${a.data} · Prazo para voto a distância: ${a.prazo}</p></div><span class="rel-tag ${voto ? 'rel-direta' : i ? 'rel-sem' : 'rel-direta'}">${voto ? 'Voto registrado (demo)' : a.estado}</span></div>
        ${i === 0 ? (voto
          ? `<ul class="calc-list" style="margin-top:8px">${a.pauta.map((p, j) => `<li><span>${esc(p)}</span><strong>${voto[j]}</strong></li>`).join('')}</ul><div class="btn-row"><button type="button" class="btn btn-link btn-sm" data-action="voto-refazer" data-i="${i}">Alterar voto</button></div>`
          : temAtivo(code)
            ? `<form class="stack-sm" style="margin-top:12px" data-form="voto" data-i="${i}">${a.pauta.map((p, j) => `<fieldset class="vote-q"><legend>${esc(p)}</legend><div class="btn-row" style="margin-top:4px">${['Aprovar', 'Rejeitar', 'Abster-se'].map((o) => `<label class="radio"><input type="radio" name="q${j}" value="${o}" required> ${o}</label>`).join('')}</div></fieldset>`).join('')}
               <div><button class="btn btn-primary" type="submit">Enviar voto</button></div></form>`
            : `<p class="muted" style="margin-top:8px">Você não tem ações da ${esc(a.empresa.split(' ·')[0])}, então não pode votar nesta assembleia.</p>`) : ''}
        <button type="button" class="expand-btn" data-action="disclose" aria-expanded="false" aria-controls="${k}">Ver pauta e documentos ${icon('chevronDown', 14)}</button>
        <div id="${k}" hidden style="margin-top:8px"><h3 class="h3">Pauta</h3><ul style="list-style:disc;padding-left:20px">${a.pauta.map((p) => `<li>${p}</li>`).join('')}</ul>
          <h3 class="h3" style="margin-top:8px">Documentos</h3><ul style="list-style:disc;padding-left:20px">${a.docs.map((d) => `<li>${d}</li>`).join('')}</ul>
          <p class="meta" style="margin-top:8px">Pode votar quem tinha o ativo na data de corte definida no edital.</p></div></section>`; }).join('')}</div>`;
  } else if (aba === 'calc') {
    body = `<section class="card" style="max-width:720px"><p>A CALC calcula o fator DI entre datas e outros valores de referência de instrumentos de renda fixa.</p>
      <p class="meta" style="margin-top:8px">Ela não projeta o valor da sua carteira.</p>
      <div class="btn-row"><a class="btn btn-primary" href="https://apicalculadorarendafixa.b3.com.br/" target="_blank" rel="noopener">Abrir CALC da B3 ${icon('external', 16)}<span class="sr-only">(abre site da B3 em nova aba)</span></a></div></section>`;
  } else {
    const r = ui.rel;
    const periodos = r.tipo === 'Mensal' ? ['Outubro de 2026', 'Setembro de 2026', 'Agosto de 2026'] : ['2025', '2024'];
    body = `${btnTabs([['consolidado', 'Relatório Consolidado'], ['informes', 'Informes de Empréstimos']], r.aba, { label: 'Tipo de relatório', action: 'rel-aba', id: 'rel' })}
      <div id="rel-panel" role="tabpanel">${r.aba === 'consolidado' ? `<section class="card" style="max-width:720px">
        <div class="query-bar">
          <div class="field"><span class="label" id="rel-tipo-l">Tipo</span><div class="seg" role="group" aria-labelledby="rel-tipo-l">${['Mensal', 'Anual'].map((t) => `<button type="button" data-action="rel-tipo" data-t="${t}" aria-pressed="${r.tipo === t}">${t}</button>`).join('')}</div></div>
          <div class="field"><label for="rel-per">Período</label><select id="rel-per" class="select" data-change="rel-per">${periodos.map((p) => `<option ${r.periodo === p ? 'selected' : ''}>${p}</option>`).join('')}</select></div>
          <div class="field"><label for="rel-fmt">Formato</label><select id="rel-fmt" class="select" data-change="rel-fmt">${['PDF', 'Excel'].map((f) => `<option ${r.formato === f ? 'selected' : ''}>${f}</option>`).join('')}</select></div>
        </div>
        <button type="button" class="btn btn-primary" data-action="rel-baixar">${icon('download', 18)}Baixar relatório</button>
        <p class="note neutral" style="margin-top:16px">${icon('info', 18)}<span>O relatório consolidado é consultivo. Para declarar imposto de renda, use o informe de rendimentos fornecido pela sua instituição.</span></p></section>`
      : `<section class="card" style="max-width:720px"><p class="muted">Informes de empréstimo de ativos, para quem emprestou ou tomou ativos no ano.</p>
        <ul class="calc-list" style="margin-top:12px">${['2025', '2024'].map((y) => `<li><span>Informe de ${y}</span><button type="button" class="btn btn-link btn-sm" data-action="inf-baixar" data-y="${y}">Baixar<span class="sr-only"> informe de ${y}</span></button></li>`).join('')}</ul></section>`}</div>`;
  }
  return {
    title: 'Serviços · ' + nomes[aba], nav: 'servicos-' + aba, pageKey: 'servicos', crumbs: [['Serviços', '/servicos'], [nomes[aba]]],
    html: `<div class="page-head"><div><h1 class="h1">${nomes[aba]}</h1><p class="meta lead">Serviços</p></div></div>
      ${tabs(Object.entries(nomes), aba, { label: 'Serviços', id: 'servicos', hrefFor: (k) => '/servicos/' + k })}
      ${body}`,
  };
}
 SUBMITS.voto = (form) => {
  const i = +form.dataset.i;
  ui.votos[i] = ASSEMBLEIAS[i].pauta.map((_, j) => form['q' + j].value);
  toast('Voto registrado na demonstração. Nada foi enviado.');
  rerender('#conteudo h1');
};
ACTIONS['voto-refazer'] = (el) => { delete ui.votos[+el.dataset.i]; rerender('#conteudo form [type=radio]'); };
ACTIONS['rel-aba'] = (el) => { ui.rel.aba = el.dataset.key; rerender(`[data-tablist="rel"] [data-key="${el.dataset.key}"]`); };
ACTIONS['rel-tipo'] = (el) => { ui.rel.tipo = el.dataset.t; ui.rel.periodo = el.dataset.t === 'Mensal' ? 'Outubro de 2026' : '2025'; rerender(`[data-action="rel-tipo"][data-t="${el.dataset.t}"]`); };
CHANGES['rel-per'] = (el) => { ui.rel.periodo = el.value; };
CHANGES['rel-fmt'] = (el) => { ui.rel.formato = el.value; };
ACTIONS['rel-baixar'] = () => downloadDemo(`relatorio-consolidado-${ui.rel.tipo.toLowerCase()}-demo.csv`, [`Relatório Consolidado ${ui.rel.tipo} · ${ui.rel.periodo} · formato escolhido: ${ui.rel.formato}`, 'Conteúdo fictício para demonstração.']);
ACTIONS['inf-baixar'] = (el) => downloadDemo(`informe-emprestimos-${el.dataset.y}-demo.csv`, [`Informe de Empréstimos ${el.dataset.y}`, 'Sem operações de empréstimo no ano (exemplo).']);

/* ---------- Feedback ---------- */
function viewFeedback() {
  return {
    title: 'Feedback', nav: 'feedback', crumbs: [['Feedback']],
    html: `<div class="page-head"><div><h1 class="h1">Feedback</h1><p class="meta lead">Conte o que funcionou e o que atrapalhou. Na demo, nada é enviado.</p></div></div>
      ${ui.feedbackEnviado
        ? emptyState({ title: 'Obrigado pelo feedback.', text: 'Na demonstração, a mensagem não foi enviada nem guardada.', iconName: 'check', actions: '<button type="button" class="btn btn-outline btn-sm" data-action="fb-novo">Escrever outro</button>' })
        : `<form class="card stack-sm" style="max-width:640px" data-form="feedback">
        <div class="field"><label for="fb-assunto">Assunto</label><select id="fb-assunto" class="select" name="assunto"><option>Notícias</option><option>Minha carteira</option><option>Extratos e proventos</option><option>Outro</option></select></div>
        <div class="field"><label for="fb-texto">Mensagem</label><textarea id="fb-texto" class="textarea" name="texto" required aria-describedby="fb-hint"></textarea><span id="fb-hint" class="meta">Não inclua dados pessoais.</span></div>
        <div><button class="btn btn-primary" type="submit">Enviar feedback</button></div></form>`}`,
  };
}
SUBMITS.feedback = () => { ui.feedbackEnviado = true; rerender('#conteudo .empty'); announce('Feedback registrado na demonstração'); };
ACTIONS['fb-novo'] = () => { ui.feedbackEnviado = false; rerender('#fb-texto'); };
