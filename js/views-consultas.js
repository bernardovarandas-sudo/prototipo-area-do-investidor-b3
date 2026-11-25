/* Consultas existentes com um padrão comum: Extratos, Proventos, Portabilidade, Serviços e Feedback. */

const dataNum = (d) => { const [dd, mm, yy] = d.split('/'); return +(yy + mm + dd); };
const PERIODOS_EXTRATO = {
  '30d': { label: 'Últimos 30 dias', faixa: '25 out a 24 nov 2026', de: 20261025, ate: 20261124 },
  '7d': { label: 'Últimos 7 dias', faixa: '18 a 24 nov 2026', de: 20261118, ate: 20261124 },
  '2025': { label: 'Novembro de 2025', faixa: '1 a 30 nov 2025', de: 20251101, ate: 20251130 },
};

/* ---------- Extratos ---------- */
function extratoLinhas(aba) {
  const s = ui.extrato, p = PERIODOS_EXTRATO[s.periodo];
  return (EXTRATOS[aba] || []).filter((r) => {
    const d = dataNum(r.data);
    return d >= p.de && d <= p.ate && (!s.aplicado.inst || r.inst === s.aplicado.inst) && (!s.aplicado.ativo || r.code === s.aplicado.ativo);
  });
}

function extratoTabela(aba, linhas) {
  const ativoCell = (code) => `<div class="asset-cell"><span class="asset-name">${esc(ativo(code).name)}</span><span class="asset-code">${code}</span></div>`;
  const det = (k, colspan, html) => `<tr class="detail-row" data-group="${k}" id="${k}" ${ui.expand[k] ? '' : 'hidden'}><td colspan="${colspan}">${html}</td></tr>`;
  const btn = (k, label) => `<button type="button" class="expand-btn" data-action="expand" data-key="${k}" aria-expanded="${!!ui.expand[k]}" aria-controls="${k}">Detalhes<span class="sr-only"> ${esc(label)}</span>${icon('chevronDown', 14)}</button>`;
  if (aba === 'movimentacao') {
    return `<table><caption class="sr-only">Movimentação</caption><thead><tr><th scope="col">Data</th><th scope="col">Movimentação</th><th scope="col">Ativo</th><th scope="col" class="col-sec">Instituição</th><th scope="col" class="num">Valor</th><th scope="col"><span class="sr-only">Detalhes</span></th></tr></thead><tbody>
      ${linhas.map((r, i) => { const k = 'mov-' + i; return `<tr><td class="nowrap">${r.data}</td><td>${esc(r.mov)}</td><td>${ativoCell(r.code)}</td><td class="col-sec">${r.inst}</td><td class="num">${r.valor != null ? pBrl(r.valor) : '<span class="meta">Não informado</span>'}</td><td class="num">${btn(k, r.mov + ' ' + r.data)}</td></tr>
        ${det(k, 6, `<dl class="dl"><div><dt>Quantidade</dt><dd>${pQtd(r.qtd)}</dd></div><div><dt>Instituição</dt><dd>${r.inst}</dd></div><div><dt>Origem dos dados</dt><dd>Central depositária (demo)</dd></div></dl><p class="meta" style="margin-top:8px">${esc(r.detalhe)}</p>`)}`; }).join('')}</tbody></table>`;
  }
  if (aba === 'negociacao') {
    return `<table><caption class="sr-only">Negociação</caption><thead><tr><th scope="col">Data da negociação</th><th scope="col">Compra/venda</th><th scope="col">Ativo</th><th scope="col" class="col-sec">Instituição</th><th scope="col" class="num">Quantidade</th><th scope="col"><span class="sr-only">Detalhes</span></th></tr></thead><tbody>
      ${linhas.map((r, i) => { const k = 'neg-' + i; return `<tr><td class="nowrap">${r.data}</td><td>${r.lado}</td><td>${ativoCell(r.code)}</td><td class="col-sec">${r.inst}</td><td class="num">${pQtd(r.qtd)}</td><td class="num">${btn(k, r.lado + ' ' + r.data)}</td></tr>
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
          ${temInst ? `<div class="field"><label for="f-inst">Instituição</label><select id="f-inst" name="inst" class="select"><option value="">Todas</option>${['Corretora A', 'Corretora B'].map((i) => `<option ${s.aplicado.inst === i ? 'selected' : ''}>${i}</option>`).join('')}</select></div>` : ''}
          <div class="field"><label for="f-ativo">Ativo</label><select id="f-ativo" name="ativo" class="select"><option value="">Todos</option>${['DEMO1', 'DEMO2', 'DEMO3'].map((c) => `<option value="${c}" ${s.aplicado.ativo === c ? 'selected' : ''}>${ativo(c).name} · ${c}</option>`).join('')}</select></div>
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
  const vazia = !conta().posicoes.length;
  const nomes = { visao: 'Visão geral', recebidos: 'Recebidos', 'a-receber': 'A receber', radar: 'Radar', calendario: 'Calendário' };
  const ativoCell = (code) => `<div class="asset-cell"><a href="#/ativos/${code}">${esc(ativo(code).name)}</a><span class="asset-code">${code}</span></div>`;
  const recMes = PROVENTOS_RECEBIDOS.filter((p) => p.mes === '2026-11').reduce((s, p) => s + p.valor, 0);
  const aRec = PROVENTOS_A_RECEBER.filter((p) => p.valor != null).reduce((s, p) => s + p.valor, 0);
  let body;

  if (vazia && aba !== 'radar') {
    body = emptyState({ title: 'Seus proventos vão aparecer aqui quando você tiver investimentos.', text: 'Proventos são pagamentos feitos a quem tem o ativo.', iconName: 'coins' });
  } else if (aba === 'visao') {
    const prox = PROVENTOS_A_RECEBER;
    body = `<div class="kpis card">
        <div class="kpi"><div class="label">Recebidos no mês</div><div class="value big">${pBrl(recMes)}</div><div class="sub meta">Novembro de 2026</div></div>
        <div class="kpi"><div class="label">A receber</div><div class="value big">${pBrl(aRec)}</div><div class="sub meta">Com data prevista · mais 1 pagamento a confirmar</div></div>
        <div class="kpi"><div class="label">Próximo pagamento</div><div class="value h2">15 dez 2026</div><div class="sub meta">Aurora · Dividendos</div></div>
      </div>
      <section class="card" style="margin-top:24px" aria-labelledby="prox"><h2 class="h2" id="prox">Próximos pagamentos</h2>
        <div class="table-wrap" style="margin-top:8px"><table><caption class="sr-only">Próximos pagamentos</caption>
          <thead><tr><th scope="col">Data prevista</th><th scope="col">Ativo</th><th scope="col" class="col-sec">Tipo</th><th scope="col" class="num">Valor previsto</th></tr></thead>
          <tbody>${prox.map((p) => `<tr><td>${p.data || '<span class="tv tv-flat">Data a confirmar</span>'}</td><td>${ativoCell(p.code)}</td><td class="col-sec">${p.tipo}</td><td class="num">${p.valor != null ? pBrl(p.valor) : '<span class="meta">A confirmar</span>'}</td></tr>`).join('')}</tbody></table></div>
        <div class="card-foot"><a href="#/proventos/recebidos">Ver histórico de recebidos</a><a href="#/proventos/calendario">Ver calendário</a></div>
      </section>`;
  } else if (aba === 'recebidos') {
    const s = ui.prov;
    const per = { '3m': ['Últimos 3 meses', ['2026-09', '2026-10', '2026-11']], nov: ['Novembro de 2026', ['2026-11']], '2025': ['Ano de 2025', []] };
    const linhas = PROVENTOS_RECEBIDOS.filter((p) => per[s.periodo][1].includes(p.mes) && (!s.inst || p.inst === s.inst));
    body = `<div class="query-bar">
        <div class="field"><label for="pr-per">Período</label><select id="pr-per" class="select" data-change="prov-per">${Object.entries(per).map(([k, v]) => `<option value="${k}" ${k === s.periodo ? 'selected' : ''}>${v[0]}</option>`).join('')}</select></div>
        <div class="field"><label for="pr-inst">Instituição</label><select id="pr-inst" class="select" data-change="prov-inst"><option value="">Todas</option>${['Corretora A', 'Corretora B'].map((i) => `<option ${s.inst === i ? 'selected' : ''}>${i}</option>`).join('')}</select></div>
      </div>
      ${linhas.length ? `<div class="card"><div class="table-wrap"><table><caption class="sr-only">Proventos recebidos</caption>
        <thead><tr><th scope="col">Data de pagamento</th><th scope="col">Ativo</th><th scope="col">Tipo</th><th scope="col" class="col-sec">Instituição</th><th scope="col" class="num">Valor recebido</th></tr></thead>
        <tbody>${linhas.map((p) => `<tr><td>${p.data}</td><td>${ativoCell(p.code)}</td><td>${p.tipo}</td><td class="col-sec">${p.inst}</td><td class="num">${pBrl(p.valor)}</td></tr>`).join('')}
        <tr class="total-row"><td colspan="3">Total no recorte · ${per[s.periodo][0]}</td><td class="col-sec"></td><td class="num">${pBrl(linhas.reduce((a, p) => a + p.valor, 0))}</td></tr></tbody></table></div></div>`
      : emptyState({ title: 'Nenhum resultado para esse período', actions: '<button type="button" class="btn btn-outline btn-sm" data-action="focus" data-target="#pr-per">Alterar filtros</button>' })}`;
  } else if (aba === 'a-receber') {
    body = `<p class="muted" style="margin-bottom:12px">Valores previstos não entram no total recebido. A elegibilidade depende de ter o ativo na data de corte.</p>
      <div class="card"><div class="table-wrap"><table><caption class="sr-only">Proventos a receber</caption>
        <thead><tr><th scope="col">Data prevista</th><th scope="col">Ativo</th><th scope="col">Tipo</th><th scope="col" class="col-sec">Instituição</th><th scope="col" class="num">Valor previsto</th></tr></thead>
        <tbody>${PROVENTOS_A_RECEBER.map((p) => `<tr><td>${p.data || '<span class="tv tv-flat">Data a confirmar</span>'}</td><td>${ativoCell(p.code)}</td><td>${p.tipo}</td><td class="col-sec">${p.inst}</td><td class="num">${p.valor != null ? pBrl(p.valor) : '<span class="meta">A confirmar</span>'}</td></tr>`).join('')}</tbody></table></div></div>`;
  } else if (aba === 'radar') {
    body = `<p class="note warn" style="margin-bottom:16px">${icon('info', 18)}<span>A fonte e a cobertura desta aba serão confirmadas antes do uso real.</span></p>
      <div class="card"><div class="table-wrap"><table><caption class="sr-only">Radar de anúncios</caption>
        <thead><tr><th scope="col">Ativo</th><th scope="col">Tipo</th><th scope="col" class="col-sec">Anunciado em</th><th scope="col">Pagamento</th><th scope="col">Para você</th></tr></thead>
        <tbody>${RADAR.map((r) => { const meu = r.paraVoce && !vazia; return `<tr><td>${ativoCell(r.code)}</td><td>${r.tipo}</td><td class="col-sec">${r.anuncio}</td><td>${r.pagamento || 'Data a confirmar'}</td>
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
  if (filtro !== 'previstos') PROVENTOS_RECEBIDOS.forEach((p) => { const [dd, mm, yy] = p.data.split('/'); ev.push({ y: +yy, m: +mm - 1, d: +dd, tipo: 'rec', p }); });
  if (filtro !== 'recebidos') PROVENTOS_A_RECEBER.filter((p) => p.dia).forEach((p) => { const [yy, mm, dd] = p.dia.split('-'); ev.push({ y: +yy, m: +mm - 1, d: +dd, tipo: 'prev', p }); });
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
    ${doMes.length ? `<ul class="calc-list" style="margin-top:8px">${doMes.map((e) => `<li><span>${String(e.d).padStart(2, '0')}/${String(m + 1).padStart(2, '0')} · ${esc(ativo(e.p.code).name)} · ${e.p.tipo} · <strong>${e.tipo === 'rec' ? 'Recebido' : 'Previsto'}</strong></span><span>${pBrl(e.p.valor)}</span></li>`).join('')}</ul>`
      : '<p class="muted" style="margin-top:8px">Nenhum pagamento neste mês.</p>'}
    ${PROVENTOS_A_RECEBER.some((p) => !p.dia) && filtro !== 'recebidos' ? '<p class="meta" style="margin-top:8px">Lumina · Juros sobre capital próprio: data a confirmar, fora do calendário.</p>' : ''}
  </section>`;
}
ACTIONS['cal-nav'] = (el) => { let m = ui.cal.m + +el.dataset.d, y = ui.cal.y; if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } ui.cal.m = m; ui.cal.y = y; rerender(`[data-action="cal-nav"][data-d="${el.dataset.d}"]`); };
ACTIONS['cal-hoje'] = () => { ui.cal.m = 10; ui.cal.y = 2026; rerender('[data-action="cal-hoje"]'); };
ACTIONS['cal-filtro'] = (el) => { ui.cal.filtro = el.dataset.f; rerender(`[data-action="cal-filtro"][data-f="${el.dataset.f}"]`); };

/* ---------- Portabilidade ---------- */
function viewPortabilidade(route) {
  const aba = route.m[1] || 'transferir';
  const c = conta();
  const nomes = { transferir: 'Transferir investimentos', solicitacoes: 'Minhas solicitações' };
  let body;
  if (aba === 'transferir') {
    const insts = [...new Set(c.posicoes.map((p) => p.inst))];
    body = `<ol class="steps" aria-label="Etapas da portabilidade">
        <li><strong>Origem</strong><br>Escolha a instituição onde o investimento está hoje.</li>
        <li><strong>Destino</strong><br>Escolha para onde ele vai.</li>
        <li><strong>Seleção</strong><br>Marque os produtos elegíveis e as quantidades.</li>
        <li><strong>Revisão</strong><br>Confira e confirme. Algumas etapas dependem da instituição.</li></ol>
      <section class="card" style="margin-top:24px" aria-labelledby="eleg"><h2 class="h2" id="eleg">Consulta de elegibilidade</h2>
      ${insts.length ? `<div class="table-wrap" style="margin-top:8px"><table><caption class="sr-only">Elegibilidade por posição</caption>
        <thead><tr><th scope="col">Ativo</th><th scope="col">Instituição de origem</th><th scope="col" class="num">Quantidade</th><th scope="col">Situação</th></tr></thead>
        <tbody>${c.posicoes.map((p) => `<tr><td>${esc(ativo(p.code).name)} · ${p.code}</td><td>${p.inst}</td><td class="num">${pQtd(p.qtd)}</td><td><span class="rel-tag rel-direta">${icon('check', 16)}Elegível</span></td></tr>`).join('')}</tbody></table></div>`
        : `<p class="muted" style="margin-top:8px">Não há instituição com produtos elegíveis na sua conta. Quando houver investimentos, a consulta aparece aqui.</p>`}
      <p class="note neutral" style="margin-top:16px">${icon('info', 18)}<span>A simulação de cada etapa entra na próxima rodada do protótipo. Nenhuma transferência é feita na demonstração.</span></p></section>`;
  } else {
    body = emptyState({ title: 'Você não tem solicitações de portabilidade', text: 'Quando houver, você verá aqui a situação, as instituições, a data da última atualização e o próximo passo.', iconName: 'transfer' });
  }
  return {
    title: 'Portabilidade', nav: 'portabilidade', pageKey: 'portabilidade', crumbs: [['Portabilidade', '/portabilidade'], [nomes[aba]]],
    html: `<div class="page-head"><div><h1 class="h1">Portabilidade</h1><p class="meta lead">Transfira investimentos entre instituições e acompanhe pedidos. Na demo, só consulta.</p></div></div>
      ${tabs(Object.entries(nomes), aba, { label: 'Portabilidade', id: 'porta', hrefFor: (k) => '/portabilidade/' + k })}
      ${body}`,
  };
}

/* ---------- Serviços ---------- */
function viewServicos(route) {
  const aba = route.m[1] || 'ir';
  const nomes = { ir: 'Calculadoras de IR', voto: 'Voto a distância', calc: 'CALC de Renda Fixa', relatorios: 'Relatórios' };
  let body;
  if (aba === 'ir') {
    body = `<p class="muted" style="margin-bottom:16px">Ferramentas parceiras para calcular imposto de renda. Algumas exigem contratação e autorização para compartilhar dados. A demonstração não compartilha dados.</p>
      <div class="grid-12">${[['Parceiro de IR A (exemplo)', 'Ações, FIIs e day trade'], ['Parceiro de IR B (exemplo)', 'Ações e renda fixa'], ['Parceiro de IR C (exemplo)', 'Ações e criptoativos']].map(([n, e]) => `
        <section class="card span-4"><h2 class="h3">${n}</h2><p class="meta" style="margin-top:4px">Escopo: ${e}</p>
          <div class="btn-row"><button type="button" class="btn btn-outline btn-sm" data-action="ext" data-name="${n}">Ir para o site ${icon('external', 16)}<span class="sr-only">(site externo)</span></button></div></section>`).join('')}</div>
      <p class="note" style="margin-top:16px">${icon('file', 18)}<span>Procura um documento? <a href="#/servicos/relatorios">Ver Relatórios</a></span></p>`;
  } else if (aba === 'voto') {
    body = `<p class="note warn" style="margin-bottom:16px">${icon('info', 18)}<span>Consulta demonstrativa: nenhum voto é enviado.</span></p>
      <div class="stack-sm">${ASSEMBLEIAS.map((a, i) => { const k = 'ass-' + i; return `<section class="card">
        <div class="card-head" style="margin:0"><div><h2 class="h3">${esc(a.empresa)}</h2><p class="meta">Assembleia em ${a.data} · Prazo para voto a distância: ${a.prazo}</p></div><span class="rel-tag ${i ? 'rel-sem' : 'rel-direta'}">${a.estado}</span></div>
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
