/* Rodada 5: preço médio, rendimento × aportes, rentabilidade comparada, compras em andamento, avisos (mudanças, data com,
   alertas, preferências), ficha com proventos e agenda, projeção de proventos, resumo semanal comparado, retrospectiva,
   caminhos por objetivo e check-in do mês. Tudo com dados simulados. */

const isoDeBr = (d) => d.split('/').reverse().join('-');
const MES_ABREV = { jan: '01', fev: '02', mar: '03', abr: '04', mai: '05', jun: '06', jul: '07', ago: '08', set: '09', out: '10', nov: '11', dez: '12' };
const isoDeCurta = (t, ano = 2026) => { const [d, m] = t.split(' '); return `${ano}-${MES_ABREV[m]}-${String(d).padStart(2, '0')}`; };
const brDeIso = (iso) => iso.split('-').reverse().join('/');
const curtaDeIso = (iso) => `${+iso.slice(8, 10)} ${Object.keys(MES_ABREV)[+iso.slice(5, 7) - 1]}`;
const pctTxt = (r) => fmt.pct(r * 100);
const REF_ISO = '2026-11-24';

/* =========================== Item 1 · Preço médio e resultado =========================== */
function pmPos(p) {
  if (p.demo) return p.preco ?? null;
  const m = ehPrincipal() ? PRECO_MEDIO[p.code] : null;
  return m && m[p.inst] != null ? m[p.inst] : null;
}
function resultadoAtivo(code) {
  const a = ativo(code), ps = posicoes().filter((p) => p.code === code);
  const insts = {};
  ps.forEach((p) => {
    const x = insts[p.inst] || (insts[p.inst] = { inst: p.inst, qtd: 0, custo: 0, valor: 0, completo: true });
    const pm = pmPos(p);
    x.qtd += p.qtd; x.valor += p.qtd * a.preco;
    if (pm == null) x.completo = false; else x.custo += p.qtd * pm;
  });
  const lista = Object.values(insts).map((x) => ({ ...x, pm: x.completo ? x.custo / x.qtd : null, resultado: x.completo ? x.valor - x.custo : null, pct: x.completo && x.custo ? (x.valor / x.custo - 1) * 100 : null }));
  const completo = lista.every((x) => x.completo);
  const qtd = lista.reduce((t, x) => t + x.qtd, 0), custo = lista.reduce((t, x) => t + x.custo, 0), valor = lista.reduce((t, x) => t + x.valor, 0);
  return { a, qtd, custo, valor, completo, insts: lista, pm: completo ? custo / qtd : null, resultado: completo ? valor - custo : null, pct: completo && custo ? (valor / custo - 1) * 100 : null };
}
function resultadoTotal(codes) {
  const rs = codes.map(resultadoAtivo).filter((r) => r.completo);
  const custo = rs.reduce((t, r) => t + r.custo, 0), valor = rs.reduce((t, r) => t + r.valor, 0);
  return { custo, valor, resultado: valor - custo, pct: custo ? (valor / custo - 1) * 100 : 0, n: rs.length };
}
const ehRendaFixa = (a) => a.classe === 'Renda fixa';
const rotPM = (a) => (ehRendaFixa(a) ? 'Valor aplicado' : a.classe === 'Fundos' ? 'Cota média' : 'Preço médio');
const rotRes = (a) => (ehRendaFixa(a) || a.classe === 'Fundos' ? 'Rendimento bruto' : 'Resultado');
const pmTxt = (r) => (r.pm == null ? '<span class="meta">Indisponível</span>' : ehRendaFixa(r.a) ? pBrl(r.custo) : precoFmt(r.a, r.pm));
const resTxt = (r) => (r.resultado == null ? '<span class="meta">Indisponível</span>' : `${trendValue(r.resultado, pSbrl(r.resultado))} <span class="meta nowrap">${state.hide ? '' : fmt.pct(r.pct)}</span>`);
const NOTA_PM = 'Preço médio e resultado não incluem proventos, taxas e impostos e podem diferir do cálculo da corretora.';

function ativoRow(g, vp) {
  const v = vp.por[g.a.code], r = resultadoAtivo(g.a.code);
  const multi = g.insts.length > 1, key = 'inst-' + g.a.code, open = !!ui.expand[key];
  const selo = g.demo ? ` · <span class="demo-badge sm">${comprasDemo().some((x) => x.code === g.a.code && (x.etapa || 0) < 2) ? 'A liquidar' : 'Compra na demo'}</span>` : '';
  return `<tr>
    <td><div class="asset-cell"><a href="#/ativos/${g.a.code}?de=carteira">${esc(g.a.name)}</a><span class="asset-code">${g.a.code} · ${multi
      ? `<button type="button" class="expand-btn" data-action="expand" data-key="${key}" aria-expanded="${open}" aria-controls="${key}">${g.insts.length} instituições ${icon('chevronDown', 14)}</button>`
      : g.insts[0].inst}${selo}</span></div></td>
    <td class="num">${pQtd(g.qtd)} <span class="meta">${unid(g.a, g.qtd)}</span></td>
    <td class="num col-sec">${pmTxt(r)}</td>
    <td class="num">${pBrl(g.atual)}</td>
    <td class="num">${resTxt(r)}</td>
    <td class="num">${trendValue(v.delta, pSbrl(v.delta))}</td></tr>
    ${multi ? g.insts.map((i) => { const ri = r.insts.find((x) => x.inst === i.inst) || {}; return `<tr class="sub-row" data-group="${key}" ${open ? '' : 'hidden'}><td>${i.inst}</td><td class="num">${pQtd(i.qtd)}</td>
      <td class="num col-sec">${ri.pm == null ? '—' : ehRendaFixa(g.a) ? pBrl(ri.custo) : precoFmt(g.a, ri.pm)}</td><td class="num">${pBrl(i.atual)}</td>
      <td class="num">${ri.resultado == null ? '—' : trendValue(ri.resultado, pSbrl(ri.resultado))}</td><td class="num">${trendValue(v.insts[i.inst], pSbrl(v.insts[i.inst]))}</td></tr>`; }).join('') : ''}`;
}

function produtosCard(w, vp, comparavel) {
  const filtro = ui.carteiraClasse || 'todos';
  const classes = CLASSES.filter((c) => w.itens.some((g) => g.a.classe === c));
  const mostrar = classes.filter((c) => filtro === 'todos' || c === filtro);
  const codesMostrados = w.itens.filter((g) => mostrar.includes(g.a.classe)).map((g) => g.a.code);
  const tot = resultadoTotal(codesMostrados);
  return `<section class="card" aria-labelledby="ativos">
    <div class="card-head"><h2 class="h2" id="ativos">Produtos da sua carteira</h2><span class="meta">Mudança ${comparavel ? `${REF.anteriorCurta} → ${REF.atualCurta}` : 'em 30 dias'}</span></div>
    <div class="chips-filter" role="group" aria-label="Filtrar por classe">${[['todos', 'Todos'], ...classes.map((c) => [c, CLASSE_CURTA[c]])].map(([k, t]) => `<button type="button" class="chip-btn" data-action="cart-classe" data-k="${esc(k)}" aria-pressed="${filtro === k}">${t}</button>`).join('')}</div>
    <div class="table-wrap"><table class="prod-table"><caption class="sr-only">Produtos da carteira por classe, com preço médio e resultado</caption>
      <thead><tr><th scope="col">Produto</th><th scope="col" class="num">Quantidade</th><th scope="col" class="num col-sec">Preço médio</th><th scope="col" class="num">Valor atual</th><th scope="col" class="num">Resultado</th><th scope="col" class="num">Mudança</th></tr></thead>
      ${mostrar.map((c) => {
        const its = w.itens.filter((g) => g.a.classe === c);
        const total = its.reduce((t, g) => t + g.atual, 0), dl = its.reduce((t, g) => t + vp.por[g.a.code].delta, 0);
        const rc = resultadoTotal(its.map((g) => g.a.code));
        return `<tbody><tr class="class-row"><th scope="rowgroup" colspan="3">${esc(c)} <span class="meta">· ${its.length} ${its.length === 1 ? 'produto' : 'produtos'} · ${nf1.format(w.atual ? (total / w.atual) * 100 : 0)}% da carteira</span></th>
          <td class="num"><strong>${pBrl(total)}</strong></td><td class="num">${rc.n ? trendValue(rc.resultado, pSbrl(rc.resultado)) : '—'}</td><td class="num">${trendValue(dl, pSbrl(dl))}</td></tr>
          ${its.map((g) => ativoRow(g, vp)).join('')}</tbody>`;
      }).join('')}
    </table></div>
    <p class="res-total">Resultado ${filtro === 'todos' ? 'total' : 'da classe'}: <strong>${trendValue(tot.resultado, pSbrl(tot.resultado))}</strong> ${state.hide ? '' : `(${fmt.pct(tot.pct)})`} sobre custo de ${pBrl(tot.custo)}</p>
    <p class="meta">${NOTA_PM} Em renda fixa e fundos, o resultado é o rendimento bruto desde a aplicação.</p>
    <div class="card-foot"><a href="#/carteira/investimentos">Ir para posição</a><a href="#/carteira/investimentos/garantias">Ver garantias</a><a href="#/extratos/negociacao">Ver negociações</a></div>
  </section>`;
}

function naMinhaCarteira(g) {
  const r = resultadoAtivo(g.a.code);
  return `<section class="card" aria-labelledby="nmc">
    <div class="card-head"><h2 class="h2" id="nmc">Na minha carteira</h2><span class="meta">Posição de ${REF.atual}</span></div>
    <div class="kpis kpis-4">
      <div class="kpi"><div class="label">Quantidade</div><div class="value h2">${pQtd(g.qtd)} ${unid(g.a, g.qtd)}</div><div class="sub meta">${g.insts.length} ${g.insts.length > 1 ? 'instituições' : 'instituição'}</div></div>
      <div class="kpi"><div class="label">${rotPM(g.a)}</div><div class="value h2">${pmTxt(r)}</div><div class="sub meta">Custo total ${r.pm == null ? '—' : pBrl(r.custo)}</div></div>
      <div class="kpi"><div class="label">${rotRes(g.a)}</div><div class="value h2">${r.resultado == null ? '—' : trendValue(r.resultado, pSbrl(r.resultado))}</div><div class="sub">${r.resultado == null ? '' : trend(r.pct)}</div></div>
      <div class="kpi"><div class="label">Mudança de 23 a 24 nov</div><div class="value h2">${trendValue(g.delta, pSbrl(g.delta))}</div><div class="sub">${trend(g.pct)}</div></div>
    </div>
    <div class="table-wrap" style="margin-top:16px"><table><caption class="sr-only">Por instituição</caption>
      <thead><tr><th scope="col">Instituição</th><th scope="col" class="num">Quantidade</th><th scope="col" class="num">${rotPM(g.a)}</th><th scope="col" class="num">${rotRes(g.a)}</th><th scope="col" class="num">Mudança no dia</th></tr></thead>
      <tbody>${g.insts.map((i) => { const ri = r.insts.find((x) => x.inst === i.inst) || {}; return `<tr><td>${i.inst}</td><td class="num">${pQtd(i.qtd)}</td>
        <td class="num">${ri.pm == null ? '—' : ehRendaFixa(g.a) ? pBrl(ri.custo) : precoFmt(g.a, ri.pm)}</td><td class="num">${ri.resultado == null ? '—' : `${trendValue(ri.resultado, pSbrl(ri.resultado))}`}</td>
        <td class="num">${trendValue(i.delta, pSbrl(i.delta))}</td></tr>`; }).join('')}</tbody>
    </table></div>
    <p class="meta" style="margin-top:8px">${NOTA_PM} Mudança no dia = quantidade × (preço de 24 nov − preço de 23 nov).${g.demo ? ' Inclui compra feita na demo, considerada desde o fechamento de 23 nov.' : ''}</p>
  </section>`;
}

/* =========================== Item 2 · Rendimento separado de aportes e resgates =========================== */
function serieCarteira() {
  const principal = ehPrincipal(), w = carteira();
  const v30 = principal ? Object.entries(QTD_30D_PRINCIPAL).reduce((t, [c, q]) => t + q * ativo(c).p30, 0) : 0;
  const recebidos = provRecebidos();
  const per = PERIODOS_CARTEIRA.map((p, i) => ({ ...p, ini: i ? PERIODOS_CARTEIRA[i - 1].fim : INICIO_SERIE }));
  per.forEach((p) => {
    p.proventos = recebidos.filter((x) => { const iso = isoDeBr(x.data); return iso > p.ini && iso <= p.fim; }).reduce((t, x) => t + x.valor, 0);
    if (!principal) Object.assign(p, { aportes: 0, resgates: 0, mercado: 0 });
  });
  const ult = per[per.length - 1], pen = per[per.length - 2];
  ult.aportes += comprasDemo().reduce((t, x) => t + x.qtd * ativo(x.code).anterior, 0); // compras da demo contam desde 23 nov
  ult.vIni = v30; ult.vFim = w.atual; pen.vFim = v30;
  ult.mercado = ult.vFim - ult.vIni - ult.aportes + ult.resgates - ult.proventos;
  for (let i = per.length - 2; i >= 0; i--) {
    const p = per[i];
    p.vIni = p.vFim - p.aportes + p.resgates - p.mercado - p.proventos;
    if (i > 0) per[i - 1].vFim = p.vIni;
  }
  per.forEach((p) => { const base = p.vIni + 0.5 * (p.aportes - p.resgates); p.ganho = p.mercado + p.proventos; p.r = base > 0 ? p.ganho / base : 0; });
  return per;
}
function agregar(pers) {
  const soma = (k) => pers.reduce((t, p) => t + p[k], 0);
  return { ini: pers[0].vIni, fim: pers[pers.length - 1].vFim, aportes: soma('aportes'), resgates: soma('resgates'), mercado: soma('mercado'), proventos: soma('proventos'),
    ganho: soma('ganho'), r: pers.reduce((f, p) => f * (1 + p.r), 1) - 1, de: pers[0].ini, ate: pers[pers.length - 1].fim };
}
function evolucaoPontos(w) {
  const per = serieCarteira();
  return [['24 nov/25', per[0].vIni], ...per.map((p) => [p.rotulo === 'até 24 out' ? '24 out' : p.label === 'nov/26' ? '24 nov' : p.label, p.vFim])];
}
function evolucaoCard(w) {
  const modo = ui.evo || 'patrimonio';
  const per = serieCarteira();
  const recorte = ui.evoPer === 'mes' ? per.slice(-1) : per;
  const ag = agregar(recorte);
  const seg = `<div class="seg" role="group" aria-label="Ver">${[['patrimonio', 'Patrimônio'], ['rendimento', 'Rendimento']].map(([k, t]) => `<button type="button" data-action="evo-modo" data-k="${k}" aria-pressed="${modo === k}">${t}</button>`).join('')}</div>`;
  let grafico;
  if (modo === 'patrimonio') {
    const pts = evolucaoPontos(w);
    const W = 640, H = 200, px = 8, py = 14;
    const vals = pts.map((p) => p[1]), max = Math.max(...vals, 1), min = Math.min(...vals.filter((v) => v > 0), max);
    const lo = Math.floor((min * 0.95) / 1000) * 1000, hi = Math.ceil((max * 1.03) / 1000) * 1000, span = hi - lo || 1;
    const xy = pts.map((p, i) => [px + (i * (W - 2 * px)) / (pts.length - 1), py + (1 - (Math.max(p[1], lo) - lo) / span) * (H - 2 * py)]);
    const d = xy.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(' ');
    grafico = `<figure class="ev-chart">
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${state.hide ? 'Evolução do patrimônio, valores ocultos' : `Patrimônio foi de ${fmt.brl(pts[0][1])} para ${fmt.brl(pts[pts.length - 1][1])} em 12 meses`}">
        <path d="${d} L ${xy[xy.length - 1][0].toFixed(1)} ${H} L ${xy[0][0].toFixed(1)} ${H} Z" class="ev-area"/><path d="${d}" class="ev-line" vector-effect="non-scaling-stroke"/></svg>
      <div class="ev-pts">${xy.map((q, i) => `<span class="ev-pt ${i === xy.length - 1 ? 'last' : ''}" style="left:${(q[0] / W) * 100}%;top:${(q[1] / H) * 100}%" tabindex="0" aria-label="${pts[i][0]}: ${state.hide ? 'valor oculto' : fmt.brl(pts[i][1])}"><span class="ev-tip">${pts[i][0]}<br><strong>${pBrl(pts[i][1])}</strong></span></span>`).join('')}</div>
      <div class="ev-x" aria-hidden="true">${pts.map((p, i) => `<span>${i % 2 === 0 || i === pts.length - 1 ? p[0] : ''}</span>`).join('')}</div></figure>`;
  } else {
    const max = Math.max(...per.map((p) => Math.abs(p.ganho)), 1);
    grafico = `<div class="rend-chart" role="group" aria-label="Rendimento por mês, sem contar aportes e resgates">
      ${per.map((p) => { const h = (Math.abs(p.ganho) / max) * 46; return `<div class="rend-col" tabindex="0" aria-label="${p.label}: ${state.hide ? 'valor oculto' : `rendimento ${fmt.sbrl(p.ganho)} (${pctTxt(p.r)})`}">
        <span class="rend-bar ${p.ganho >= 0 ? 'pos' : 'neg'}" style="height:${h.toFixed(1)}%"></span><span class="ev-tip">${p.label}<br><strong>${pSbrl(p.ganho)}</strong> · ${state.hide ? '' : pctTxt(p.r)}</span></div>`; }).join('')}
      <div class="rend-zero" aria-hidden="true"></div></div>
      <div class="ev-x" aria-hidden="true">${per.map((p, i) => `<span>${i % 2 === 0 || i === per.length - 1 ? p.label.replace('/26', '').replace('/25', '/25') : ''}</span>`).join('')}</div>`;
  }
  const linha = (rot, v, sinal) => `<li><span>${rot}</span><span class="num">${sinal === '=' ? `<strong>${pBrl(v)}</strong>` : v === 0 ? pBrl(0) : `${sinal === '−' ? '−' : '+'} ${pBrl(Math.abs(v))}`}</span></li>`;
  const decomp = `<div class="decomp">
      <div class="card-head" style="margin:0"><h3 class="h3">De onde veio a mudança</h3>
        <div class="seg" role="group" aria-label="Período da conta">${[['12m', '12 meses'], ['mes', 'Último mês']].map(([k, t]) => `<button type="button" data-action="evo-per" data-k="${k}" aria-pressed="${(ui.evoPer || '12m') === k}">${t}</button>`).join('')}</div></div>
      <ul class="calc-list decomp-list">
        ${linha(`Patrimônio em ${curtaDeIso(ag.de)}${ag.de.startsWith('2025') ? ' de 2025' : ''}`, ag.ini, '=')}
        ${linha('Aportes (dinheiro novo investido)', ag.aportes, '+')}
        ${linha('Resgates (dinheiro retirado)', ag.resgates, '−')}
        <li><span>Variação de mercado</span><span class="num">${trendValue(ag.mercado, pSbrl(ag.mercado))}</span></li>
        ${linha('Proventos (considerados reinvestidos)', ag.proventos, '+')}
        ${linha(`Patrimônio em ${curtaDeIso(ag.ate)}`, ag.fim, '=')}
      </ul>
      <p class="decomp-r">Rendimento no período: <strong>${trendValue(ag.ganho, pSbrl(ag.ganho))}</strong> · rentabilidade aproximada ${trend(ag.r * 100)}</p>
      <p class="meta">Rendimento = variação de mercado + proventos. A rentabilidade é aproximada: considera os aportes e resgates no meio de cada mês.</p></div>`;
  return `<section class="card" aria-labelledby="ev-t">
    <div class="card-head"><div><h2 class="h2" id="ev-t">Evolução do patrimônio</h2><p class="meta">${modo === 'patrimonio' ? 'Últimos 12 meses · inclui aportes e resgates, não é rentabilidade' : 'Quanto a carteira ganhou ou perdeu por mercado e proventos, sem contar dinheiro novo'}</p></div>${seg}</div>
    ${grafico}${decomp}
    <button type="button" class="btn btn-link btn-sm" style="padding-left:0" data-action="disclose" aria-expanded="false" aria-controls="ev-tab">Ver em tabela</button>
    <div id="ev-tab" hidden><div class="table-wrap"><table><caption class="sr-only">Evolução por mês</caption>
      <thead><tr><th scope="col">Mês</th><th scope="col" class="num">Início</th><th scope="col" class="num">Aportes</th><th scope="col" class="num">Resgates</th><th scope="col" class="num">Mercado</th><th scope="col" class="num">Proventos</th><th scope="col" class="num">Fim</th><th scope="col" class="num">Rentab.</th></tr></thead>
      <tbody>${per.map((p) => `<tr><td>${p.label}${p.rotulo ? ` <span class="meta">(${p.rotulo})</span>` : ''}</td><td class="num">${pBrl(p.vIni)}</td><td class="num">${pBrl(p.aportes)}</td><td class="num">${pBrl(p.resgates)}</td><td class="num">${pSbrl(p.mercado)}</td><td class="num">${pBrl(p.proventos)}</td><td class="num">${pBrl(p.vFim)}</td><td class="num">${state.hide ? '••' : pctTxt(p.r)}</td></tr>`).join('')}</tbody></table></div></div>
  </section>`;
}
ACTIONS['evo-modo'] = (el) => { ui.evo = el.dataset.k; rerender(`[data-action="evo-modo"][data-k="${el.dataset.k}"]`); };
ACTIONS['evo-per'] = (el) => { ui.evoPer = el.dataset.k; rerender(`[data-action="evo-per"][data-k="${el.dataset.k}"]`); };

/* =========================== Item 19 · Rentabilidade comparada com CDI e Ibovespa =========================== */
const RENT_CORES = { carteira: '#2E2ECC', cdi: '#1E9AA6', ibov: '#C98A00' };
const CDI_PCT_RF = { TSELIC29: 100.5, TIPCA35: 112, CDBDEMO: 110, LCIDEMO: 95 };
function seriesRentab(recorte) {
  const per = serieCarteira();
  const n = { '1m': 1, '6m': 6, '12m': 12, ano: 11 }[recorte];
  const ps = per.slice(-n);
  let c = 1, d = 1;
  const ini = ps[0].ini;
  const pts = [{ label: recorte === 'ano' ? '31 dez' : curtaDeIso(ini), carteira: 0, cdi: 0, ibov: 0 }];
  ps.forEach((p) => {
    c *= 1 + p.r; d *= calcularDI(p.ini, p.fim, 100, 1).fator;
    pts.push({ label: p.rotulo === 'até 24 out' ? '24 out' : p.label === 'nov/26' ? '24 nov' : p.label, carteira: (c - 1) * 100, cdi: (d - 1) * 100, ibov: (IBOV_SERIE[p.fim] / IBOV_SERIE[ini] - 1) * 100 });
  });
  return pts;
}
function rentabCard() {
  const rec = ui.rentab || '12m';
  const pts = seriesRentab(rec), fim = pts[pts.length - 1];
  const W = 640, H = 236, pl = 44, pr = 70, py = 14, pb = 28;
  const all = pts.flatMap((p) => [p.carteira, p.cdi, p.ibov]);
  const lo = Math.min(0, Math.floor(Math.min(...all))), hi = Math.ceil(Math.max(...all, 1));
  const x = (i) => pl + (i * (W - pl - pr)) / Math.max(1, pts.length - 1), y = (v) => py + (1 - (v - lo) / (hi - lo || 1)) * (H - py - pb);
  const serie = (k, dash) => `<path d="${pts.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(p[k]).toFixed(1)}`).join(' ')}" fill="none" stroke="${RENT_CORES[k]}" stroke-width="2.5" ${dash ? `stroke-dasharray="${dash}"` : ''} vector-effect="non-scaling-stroke"/>
    ${pts.map((p, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(p[k]).toFixed(1)}" r="4" fill="${RENT_CORES[k]}" stroke="#fff" stroke-width="2"><title>${NOMES_SERIE[k]} · ${p.label}: ${fmt.pct(p[k])}</title></circle>`).join('')}`;
  const ticks = []; const passo = Math.max(1, Math.ceil((hi - lo) / 4)); for (let v = lo; v <= hi; v += passo) ticks.push(v);
  const labelsFim = ['carteira', 'cdi', 'ibov'].map((k) => ({ k, y: y(fim[k]) })).sort((a, b) => a.y - b.y);
  for (let i = 1; i < labelsFim.length; i++) if (labelsFim[i].y - labelsFim[i - 1].y < 14) labelsFim[i].y = labelsFim[i - 1].y + 14;
  const pctCdi = fim.cdi ? (fim.carteira / fim.cdi) * 100 : 0;
  const rf = ehPrincipal() ? Object.entries(CDI_PCT_RF) : [];
  const rfPeso = rf.reduce((t, [c]) => t + temAtivoValor(c), 0);
  const rfCdi = rfPeso ? rf.reduce((t, [c, p]) => t + temAtivoValor(c) * p, 0) / rfPeso : null;
  return `<section class="card" aria-labelledby="rc-t">
    <div class="card-head"><div><h2 class="h2" id="rc-t">Rentabilidade comparada</h2><p class="meta">Rentabilidade acumulada, sem contar aportes e resgates</p></div>
      <div class="seg" role="group" aria-label="Período">${[['1m', '1 mês'], ['6m', '6 meses'], ['12m', '12 meses'], ['ano', 'No ano']].map(([k, t]) => `<button type="button" data-action="rent-per" data-k="${k}" aria-pressed="${rec === k}">${t}</button>`).join('')}</div></div>
    <ul class="legend rent-legend">${['carteira', 'cdi', 'ibov'].map((k) => `<li><span class="rent-sw rent-sw-${k}"></span>${NOMES_SERIE[k]} <strong>${fmt.pct(fim[k])}</strong></li>`).join('')}</ul>
    <figure class="rent-chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Rentabilidade no período: Minha carteira ${fmt.pct(fim.carteira)}, CDI ${fmt.pct(fim.cdi)}, Ibovespa ${fmt.pct(fim.ibov)}">
      ${ticks.map((v) => `<line x1="${pl}" x2="${W - pr}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}" class="${v === 0 ? 'rent-zero' : 'rent-grid'}"/><text x="${pl - 6}" y="${(y(v) + 4).toFixed(1)}" text-anchor="end" class="rent-ax">${v}%</text>`).join('')}
      ${serie('ibov', '2 4')}${serie('cdi', '7 4')}${serie('carteira')}
      ${labelsFim.map((l) => `<text x="${W - pr + 8}" y="${(l.y + 4).toFixed(1)}" class="rent-end" fill="${RENT_CORES[l.k]}">${NOMES_SERIE[l.k].replace('Minha carteira', 'Carteira')}</text>`).join('')}
      ${pts.map((p, i) => (i % Math.ceil(pts.length / 6) === 0 || i === pts.length - 1 ? `<text x="${x(i).toFixed(1)}" y="${H - 6}" text-anchor="middle" class="rent-ax">${p.label}</text>` : '')).join('')}
    </svg></figure>
    <div class="rent-cdi"><p>Minha carteira rendeu <strong>${nf0.format(pctCdi)}% do CDI</strong> no período${rfCdi ? ` · Renda fixa: cerca de <strong>${nf0.format(rfCdi)}% do CDI</strong>, pela taxa de cada título` : ''}.</p></div>
    <p class="meta">Rentabilidade passada não garante resultado futuro. A da carteira é aproximada (veja “De onde veio a mudança”). CDI calculado pela Selic do período; Ibovespa pelos fechamentos.</p>
    <button type="button" class="btn btn-link btn-sm" style="padding-left:0" data-action="disclose" aria-expanded="false" aria-controls="rc-tab">Ver em tabela</button>
    <div id="rc-tab" hidden><div class="table-wrap"><table><caption class="sr-only">Rentabilidade acumulada</caption><thead><tr><th scope="col">Data</th><th scope="col" class="num">Minha carteira</th><th scope="col" class="num">CDI</th><th scope="col" class="num">Ibovespa</th></tr></thead>
      <tbody>${pts.map((p) => `<tr><td>${p.label}</td><td class="num">${fmt.pct(p.carteira)}</td><td class="num">${fmt.pct(p.cdi)}</td><td class="num">${fmt.pct(p.ibov)}</td></tr>`).join('')}</tbody></table></div></div>
  </section>`;
}
const NOMES_SERIE = { carteira: 'Minha carteira', cdi: 'CDI', ibov: 'Ibovespa' };
const temAtivoValor = (code) => posicoes().filter((p) => p.code === code).reduce((t, p) => t + p.qtd * ativo(code).preco, 0);
ACTIONS['rent-per'] = (el) => { ui.rentab = el.dataset.k; rerender(`[data-action="rent-per"][data-k="${el.dataset.k}"]`); };

/* =========================== Item 9 · Acompanhar a compra até aparecer na carteira =========================== */
const ETAPAS_COMPRA = [
  ['Ordem registrada', '24 nov', 'A corretora registrou sua ordem e a compra foi feita na bolsa.'],
  ['Em liquidação', '25 nov · D+1', 'O dinheiro e as ações estão sendo trocados entre as instituições.'],
  ['Liquidada', '26 nov · D+2', 'A troca terminou: as ações passaram a ser suas.'],
  ['Na carteira', '26 nov', 'A posição aparece na Área do Investidor depois da atualização da noite.'],
];
const D2_TXT = 'D+2 quer dizer “dois dias úteis depois da compra”: é o tempo que a bolsa leva para trocar o dinheiro pelas ações. Só então elas passam a ser suas.';
function timelineCompra(x) {
  const e = x.etapa || 0;
  return `<ol class="rastreio" aria-label="Andamento da compra">${ETAPAS_COMPRA.map(([t, d, txt], i) => `<li class="${i < e ? 'feito' : i === e ? 'atual' : ''}" ${i === e ? 'aria-current="step"' : ''}>
    <span class="ras-dot" aria-hidden="true">${i < e || (i === e && e === 3) ? icon('check', 14) : ''}</span><div><strong>${t}</strong> <span class="meta">${d}</span>${i === e ? `<p class="meta">${txt}</p>` : ''}</div></li>`).join('')}</ol>
    ${e < 3 ? `<button type="button" class="btn btn-outline btn-sm" data-action="compra-avancar" data-id="${x.id}">${icon('arrowRight', 16)}Simular próximo dia <span class="demo-badge sm">demo</span></button>` : ''}`;
}
function compraCard(x) {
  const a = ativo(x.code);
  return `<article class="compra-card"><div class="compra-top"><div><strong>${esc(a.name)}</strong> <span class="asset-code">${a.code}</span><p class="meta">${pQtd(x.qtd)} ${unid(a, x.qtd)} · ${esc(x.inst)} · ${fmt.brl(x.preco)} cada</p></div>
    <span class="rel-tag ${(x.etapa || 0) >= 3 ? 'rel-direta' : 'rel-indireta'}">${ETAPAS_COMPRA[x.etapa || 0][0]}</span></div>${timelineCompra(x)}</article>`;
}
function comprasAndamentoHtml() {
  const em = comprasDemo().filter((x) => (x.etapa || 0) < 3);
  if (!em.length) return '';
  return `<section class="card" aria-labelledby="ca-tt"><div class="card-head"><h2 class="h2" id="ca-tt">Compras em andamento</h2><a href="#/carteira/compras">Ver todas</a></div>
    <div class="stack-sm">${em.map(compraCard).join('')}</div><p class="meta" style="margin-top:8px">${D2_TXT}</p></section>`;
}
function viewCompras() {
  const lista = comprasDemo();
  return {
    title: 'Acompanhar compras', nav: 'carteira', crumbs: [['Minha carteira', '/carteira'], ['Acompanhar compras']],
    html: `<a class="back-link" href="#/carteira">${icon('arrowLeft', 16)}Voltar à visão geral</a>
      <div class="page-head"><div><h1 class="h1">Acompanhar compras</h1><p class="meta lead">Da ordem na corretora até a posição aparecer aqui</p></div></div>
      <p class="note" style="margin-bottom:16px">${icon('info', 18)}<span>${D2_TXT} Na Área do Investidor real, compras feitas na corretora aparecem aqui depois da liquidação.</span></p>
      ${lista.length ? `<div class="stack-sm">${lista.slice().reverse().map(compraCard).join('')}</div>`
        : emptyState({ title: 'Nenhuma compra para acompanhar', text: 'Compre uma ação na demo para ver o caminho até a carteira.', iconName: 'cart', actions: '<a class="btn btn-outline btn-sm" href="#/mercado">Escolher uma ação</a>' })}`,
  };
}
ACTIONS['compra-avancar'] = (el) => {
  const x = comprasDemo().find((c) => c.id === el.dataset.id);
  if (!x) return;
  x.etapa = Math.min(3, (x.etapa || 0) + 1); save();
  announce(`${ativo(x.code).name}: ${ETAPAS_COMPRA[x.etapa][0]}`);
  if (panel.open && panel.kind === 'compra') openPanel('compra', panel.id, { fromRoute: true, focus: false });
  rerender(`[data-action="compra-avancar"][data-id="${x.id}"]`);
};

/* =========================== Itens 4, 11, 13, 14 · Avisos =========================== */
const TIPOS_AVISO = [
  ['proventos', 'Proventos', 'Anúncios e pagamentos de dividendos, JCP e rendimentos.', 'proventos', 'Provento previsto: R$ 40,00 de Aurora em 15/12.'],
  ['datacom', 'Data com', 'Lembrete nos dias antes da data com.', 'proventos', 'Amanhã (25 nov) é a data com da Aurora. Você já tem direito.'],
  ['mudancas', 'Mudanças em datas, valores e prazos', 'O que mudou · antes → agora.', null, 'Pagamento: data a confirmar → 18/12/2026.'],
  ['comunicados', 'Comunicados e fatos relevantes', 'Comunicados das empresas da carteira e das que você acompanha.', 'comunicados', 'Atlas Mineração revisa produção de minério para 2027.'],
  ['resultados', 'Resultados', 'Datas de divulgação e teleconferências.', 'resultados', 'Pátria Logística divulga resultado em 28 nov.'],
  ['assembleias', 'Assembleias e voto a distância', 'Quando abrir uma assembleia ou mudar um prazo.', 'assembleias', 'Assembleia da Nova Azul em 2 dez: voto até 30 nov.'],
  ['movimentacoes', 'Movimentações', 'Ordens, liquidações, entradas e saídas.', null, 'Compra de 100 PETR4 liquidada.'],
  ['variacao', 'Variação grande no dia', 'Quando um ativo varia mais que o limite escolhido.', 'variacao', 'Vale caiu 5,43% hoje.'],
  ['resumoSemanal', 'Resumo semanal da carteira', 'Toda segunda, um aviso de que o resumo da semana está pronto.', null, 'Seu resumo da semana de 18 a 24 nov está pronto.'],
  ['lembreteMensal', 'Lembrete mensal para conferir a carteira', 'Uma vez por mês, convite para o check-in. Nunca sugere operar.', null, 'Já conferiu sua carteira este mês?'],
];
const CHAVES_ATIVO = [['proventos', 'Proventos'], ['comunicados', 'Comunicados'], ['resultados', 'Resultados'], ['assembleias', 'Assembleias'], ['variacao', 'Variação']];
const prefsConta = () => (state.session ? state.prefs[state.session.conta] || (state.prefs[state.session.conta] = {}) : {});
function canalLigado(tipo, canal) {
  const p = prefsConta(), a = (p.avisos || {})[tipo];
  if (a && a[canal] != null) return a[canal];
  if (canal === 'email') return tipo === 'resumoSemanal' ? !!p.resumoSemanal : false;
  return true;
}
function porAtivoDe(code) {
  const p = prefsConta(), x = (p.porAtivo || {})[code];
  if (x) return x;
  const on = temAtivo(code) || code === 'DEMO5';
  return Object.fromEntries(CHAVES_ATIVO.map(([k]) => [k, on]));
}
const acompanhaComAlerta = (code) => state.session && state.favoritos.includes(code) && Object.values(porAtivoDe(code)).some(Boolean);
function avisoLigado(n) {
  if (!canalLigado(n.tipo, 'sino')) return false;
  const chave = (TIPOS_AVISO.find((t) => t[0] === n.tipo) || [])[3];
  return !(n.code && chave && !porAtivoDe(n.code)[chave]);
}
function datasComProximas() {
  return RADAR.filter((r) => r.dataCom && r.vps != null).map((r) => ({ ...r, iso: isoDeCurta(r.dataCom) }))
    .filter((r) => r.iso > REF_ISO && r.iso <= '2026-12-01')
    .map((r) => {
      const qtd = posicoes().filter((p) => p.code === r.code).reduce((t, p) => t + p.qtd, 0);
      return { ...r, qtd, tem: qtd > 0 };
    })
    .filter((r) => r.tem || acompanhaComAlerta(r.code))
    .sort((a, b) => a.iso.localeCompare(b.iso));
}
function textoDataCom(r) {
  const quando = r.iso === '2026-11-25' ? `Amanhã (${r.dataCom})` : `Em ${r.dataCom}`;
  const a = ativo(r.code);
  return `${quando} é a data com ${artDe(r.code)}: quem tiver ${a.classe === 'Fundos imobiliários' ? 'as cotas' : 'a ação'} no fim do dia recebe ${fmt.brl(r.vps)} por ${a.classe === 'Fundos imobiliários' ? 'cota' : 'ação'}. `
    + (r.tem ? `Você já tem direito${state.hide ? '' : ` (${fmtQtd(r.qtd)} ${unid(a, r.qtd)} · ${fmt.brl(r.qtd * r.vps)} previstos)`}.` : 'Aviso porque você acompanha esta empresa. Não é recomendação.');
}
function avisosTodos() {
  if (!state.session) return [];
  const lista = NOTIFICACOES.map((n) => ({ ...n }));
  MUDANCAS.filter((m) => temAtivo(m.code)).forEach((m) => lista.unshift({ id: m.id, tipo: 'mudancas', code: m.code, titulo: m.titulo, detalhe: `${m.campo}: ${m.antes} → ${m.agora}`, data: '24 nov, 19h · atualizado', destino: m.destino, acao: m.acao }));
  datasComProximas().forEach((r) => lista.unshift({ id: 'dc-' + r.code, tipo: 'datacom', code: r.code, titulo: `Data com ${artDe(r.code)} em ${r.dataCom}`, detalhe: textoDataCom(r), data: '24 nov, 18h', destino: '/proventos/radar', acao: 'Ver no Radar' }));
  NOTICIAS.filter((n) => n.tipoAlerta && n.ativos.some((c) => state.favoritos.includes(c) && !temAtivo(c))).forEach((n) => lista.unshift({ id: 'al-' + n.id, tipo: n.tipoAlerta, code: n.ativos[0], titulo: `Você acompanha: ${n.titulo}`, data: n.data, destino: `/noticias?aba=todo&painel=${n.id}`, acao: 'Ver notícia' }));
  const lim = prefsConta().limiteVar || 5;
  [...new Set(posicoes().map((p) => p.code))].filter((c) => ativo(c).negociavel && Math.abs(varPct(ativo(c))) >= lim).forEach((c) => lista.unshift({ id: `var-${c}-${lim}`, tipo: 'variacao', code: c, titulo: `${ativo(c).name} ${varPct(ativo(c)) > 0 ? 'subiu' : 'caiu'} ${nf2.format(Math.abs(varPct(ativo(c))))}% hoje`, detalhe: `Passou do limite de ${lim}% que você escolheu.`, data: '24 nov, 18h', destino: `/carteira?porque=${c}`, acao: 'Por que mudou?' }));
  comprasDemo().forEach((x) => lista.unshift({ id: `mov-${x.id}-${x.etapa || 0}`, tipo: 'movimentacoes', titulo: `Compra de ${fmtQtd(x.qtd)} ${x.code}: ${ETAPAS_COMPRA[x.etapa || 0][0].toLowerCase()}`, data: ETAPAS_COMPRA[x.etapa || 0][1], destino: '/carteira/compras', acao: 'Acompanhar' }));
  return lista;
}
const avisosVisiveis = () => avisosTodos().filter(avisoLigado);
function notifItemHtml(n, cls = 'notif') {
  const lida = state.lidas.includes(n.id);
  return `<a class="${cls} ${lida ? '' : 'nao-lida'}" href="#${n.destino}" data-action="notif" data-id="${n.id}">
    <span><strong>${lida ? '' : '<span class="unread" aria-hidden="true"></span>'}${esc(n.titulo)}</strong>${n.detalhe ? `<br><span class="notif-det">${esc(n.detalhe)}</span>` : ''}<br><span class="meta">${n.data} · ${lida ? 'Lido' : 'Não lido'}</span></span>
    <span class="meta notif-acao">${n.acao} ${icon('arrowRight', 14)}</span></a>`;
}
function notificacoesListaHtml() {
  const vs = avisosVisiveis(), ocultos = avisosTodos().length - vs.length;
  return `<div class="card-head" style="margin:0"><h2 class="h2">Notificações</h2><button type="button" class="btn btn-link btn-sm" data-action="notif-todas">Marcar todas como lidas</button></div>
    <div class="stack-sm" style="margin-top:12px">${vs.map((n) => notifItemHtml(n, 'notif-row')).join('') || '<p class="muted">Nenhuma notificação com as suas preferências.</p>'}</div>
    ${ocultos ? `<p class="meta" style="margin-top:8px">${ocultos} ${ocultos === 1 ? 'aviso escondido' : 'avisos escondidos'} pelas suas preferências. <a href="#/perfil?secao=config">Configurar</a></p>` : ''}`;
}
ACTIONS['notif-todas'] = () => { state.lidas = avisosTodos().map((n) => n.id); save(); rerender('#conteudo h2'); };

function configNotificacoesHtml() {
  const p = prefsConta();
  const codes = [...new Set([...posicoes().map((x) => x.code), ...state.favoritos])];
  return `<h2 class="h2">Configuração de notificações</h2><p class="muted" style="margin-top:4px">Escolha o que receber e onde. As preferências ficam salvas neste navegador. O sino mostra só o que estiver ligado.</p>
    <h3 class="label-up">Por tipo de aviso</h3>
    <div class="table-wrap"><table class="conf-table"><caption class="sr-only">Tipos de aviso por canal</caption>
      <thead><tr><th scope="col">Aviso</th><th scope="col" class="num">E-mail</th><th scope="col" class="num">Sino</th><th scope="col"><span class="sr-only">Exemplo</span></th></tr></thead>
      <tbody>${TIPOS_AVISO.map(([k, t, d, , ex]) => `<tr><td><strong>${t}</strong><br><span class="meta">${d}</span>
        ${k === 'variacao' ? `<br><label class="meta">Limite: <select class="select select-sm" data-change="aviso-limite">${[3, 5, 10].map((v) => `<option value="${v}" ${(p.limiteVar || 5) === v ? 'selected' : ''}>${v}% no dia</option>`).join('')}</select></label>` : ''}
        <p class="aviso-ex" id="ex-${k}" hidden>${icon('bell', 14)} Exemplo: “${esc(ex)}”</p></td>
        ${['email', 'sino'].map((c) => `<td class="num"><input type="checkbox" data-change="aviso-canal" data-t="${k}" data-c="${c}" ${canalLigado(k, c) ? 'checked' : ''} aria-label="${t} por ${c === 'email' ? 'e-mail' : 'sino'}"></td>`).join('')}
        <td><button type="button" class="btn btn-link btn-sm" data-action="disclose" aria-expanded="false" aria-controls="ex-${k}">Ver exemplo</button></td></tr>`).join('')}</tbody></table></div>
    <h3 class="label-up">Frequência do e-mail</h3>
    <div class="btn-row" role="radiogroup" aria-label="Frequência do e-mail">${[['hora', 'Na hora'], ['diario', 'Resumo diário'], ['semanal', 'Resumo semanal']].map(([k, t]) => `<label class="radio"><input type="radio" name="freq" value="${k}" data-change="aviso-freq" ${(p.freq || 'hora') === k ? 'checked' : ''}> ${t}</label>`).join('')}</div>
    <h3 class="label-up">Por ativo</h3>
    <p class="meta">Ativos da sua carteira e os que você acompanha nos favoritos.</p>
    <div class="table-wrap"><table class="conf-table"><caption class="sr-only">Avisos por ativo</caption>
      <thead><tr><th scope="col">Ativo</th>${CHAVES_ATIVO.map(([, t]) => `<th scope="col" class="num">${t}</th>`).join('')}</tr></thead>
      <tbody>${codes.map((c) => { const pa = porAtivoDe(c); return `<tr><th scope="row"><a href="#/ativos/${c}">${esc(ativo(c).name)}</a><span class="asset-code">${c} · ${temAtivo(c) ? 'na carteira' : 'favorito'}</span></th>
        ${CHAVES_ATIVO.map(([k, t]) => `<td class="num"><input type="checkbox" data-change="aviso-ativo" data-code="${c}" data-k="${k}" ${pa[k] ? 'checked' : ''} aria-label="${t} de ${esc(ativo(c).name)}"></td>`).join('')}</tr>`; }).join('')}</tbody></table></div>
    <div class="btn-row"><a class="btn btn-outline btn-sm" href="#/demo/resumo-email">${icon('mail', 16)}Prévia do resumo semanal</a><a class="btn btn-outline btn-sm" href="#/demo/checkin-email">${icon('mail', 16)}Prévia do lembrete mensal</a></div>`;
}
const salvarPrefs = (fn) => { const p = prefsConta(); fn(p); save(); };
CHANGES['aviso-canal'] = (el) => { salvarPrefs((p) => { p.avisos = p.avisos || {}; p.avisos[el.dataset.t] = { email: canalLigado(el.dataset.t, 'email'), sino: canalLigado(el.dataset.t, 'sino'), [el.dataset.c]: el.checked }; }); announce('Preferência salva'); renderTopbarSoft(); };
CHANGES['aviso-ativo'] = (el) => { salvarPrefs((p) => { p.porAtivo = p.porAtivo || {}; p.porAtivo[el.dataset.code] = { ...porAtivoDe(el.dataset.code), [el.dataset.k]: el.checked }; }); announce('Preferência salva'); renderTopbarSoft(); };
CHANGES['aviso-limite'] = (el) => { salvarPrefs((p) => { p.limiteVar = +el.value; }); announce(`Limite de variação: ${el.value}%`); renderTopbarSoft(); };
CHANGES['aviso-freq'] = (el) => { salvarPrefs((p) => { p.freq = el.value; }); announce('Frequência salva'); };
const renderTopbarSoft = () => { const r = parseHash(); const hit = matchRoute(r.path); r.m = hit ? hit.m : []; renderTopbar({ crumbs: [['Meu acesso']] }, r); };

/* Item 4: liga/desliga alertas de uma empresa (favoritos e ficha) */
ACTIONS['alerta-toggle'] = (el) => {
  const c = el.dataset.code, on = !Object.values(porAtivoDe(c)).some(Boolean);
  salvarPrefs((p) => { p.porAtivo = p.porAtivo || {}; p.porAtivo[c] = Object.fromEntries(CHAVES_ATIVO.map(([k]) => [k, on])); });
  toast(on ? `Alertas de ${ativo(c).name} ligados.` : `Alertas de ${ativo(c).name} desligados.`);
  rerender(`[data-action="alerta-toggle"][data-code="${c}"]`);
};
CHANGES['alerta-tipo'] = (el) => { salvarPrefs((p) => { p.porAtivo = p.porAtivo || {}; p.porAtivo[el.dataset.code] = { ...porAtivoDe(el.dataset.code), [el.dataset.k]: el.checked }; }); announce('Alerta salvo'); rerender(`[data-change="alerta-tipo"][data-k="${el.dataset.k}"]`); };
function alertaBotao(code, compacto) {
  const on = Object.values(porAtivoDe(code)).some(Boolean);
  return `<button type="button" class="btn ${compacto ? 'btn-link btn-sm' : 'btn-outline'} alerta-btn" data-action="alerta-toggle" data-code="${code}" aria-pressed="${on}">${icon('bell', 16)}${on ? 'Alertas ligados' : 'Receber alertas'}<span class="sr-only"> de ${esc(ativo(code).name)}</span></button>`;
}
function alertasCard(a) {
  if (!state.session) return `<section class="card"><h2 class="h3">Alertas desta empresa</h2><p class="meta" style="margin-top:6px">Entre para receber avisos de comunicados, resultados e proventos.</p><div class="btn-row"><a class="btn btn-outline btn-sm" href="#/acesso?destino=${encodeURIComponent('/ativos/' + a.code)}">${icon('bell', 16)}Receber alertas</a></div></section>`;
  const pa = porAtivoDe(a.code), on = Object.values(pa).some(Boolean);
  return `<section class="card" aria-labelledby="al-${a.code}"><h2 class="h3" id="al-${a.code}">Alertas desta empresa</h2>
    <div class="btn-row">${alertaBotao(a.code)}</div>
    ${on ? `<fieldset class="alerta-tipos"><legend class="meta">Receber:</legend>${[['comunicados', 'Comunicados e fatos relevantes'], ['resultados', 'Resultados'], ['proventos', 'Proventos e data com']].map(([k, t]) => `<label class="check"><input type="checkbox" data-change="alerta-tipo" data-code="${a.code}" data-k="${k}" ${pa[k] ? 'checked' : ''}> ${t}</label>`).join('')}</fieldset>` : ''}
    <p class="meta" style="margin-top:8px">${temAtivo(a.code) ? 'Você tem este ativo.' : state.favoritos.includes(a.code) ? 'Você acompanha esta empresa nos favoritos.' : 'Os alertas valem para ativos da carteira e dos favoritos.'} <a href="#/perfil?secao=config">Todas as preferências</a></p></section>`;
}

/* Item 11: banner temporário com a mudança mais importante */
function bannerHtml() {
  if (!state.session) return '';
  const m = MUDANCAS.find((x) => temAtivo(x.code));
  const disp = store.get('bannerDispensado', []);
  if (!m || disp.includes(m.id)) return '';
  if (!state.bannerAnunciado) { state.bannerAnunciado = true; setTimeout(() => announce(`O que mudou: ${m.titulo}. ${m.campo}: ${m.antes}, agora ${m.agora}.`), 400); }
  return `<div class="mud-banner" role="region" aria-label="Aviso temporário: o que mudou">
    <span class="mud-ic">${icon('refresh', 20)}</span>
    <div class="mud-txt"><p class="mud-t">O que mudou · ${esc(m.titulo)}</p>
      <p>${esc(m.campo)}: <s>${esc(m.antes)}</s> → <strong>${esc(m.agora)}</strong></p><p class="meta">Atualizado em 24 nov · aviso temporário</p></div>
    <div class="mud-acoes"><button type="button" class="btn btn-primary btn-sm" data-action="banner-ver" data-id="${m.id}">Ver detalhe</button><button type="button" class="btn btn-link btn-sm" data-action="banner-dispensar" data-id="${m.id}">Dispensar</button></div></div>`;
}
const dispensarBanner = (id) => store.set('bannerDispensado', [...store.get('bannerDispensado', []), id]);
ACTIONS['banner-dispensar'] = (el) => { dispensarBanner(el.dataset.id); const b = document.querySelector('.mud-banner'); if (b) b.remove(); announce('Aviso dispensado'); const h = $content.querySelector('h1'); if (h) { h.tabIndex = -1; h.focus(); } };
ACTIONS['banner-ver'] = (el) => { const m = MUDANCAS.find((x) => x.id === el.dataset.id); dispensarBanner(m.id); go(m.destino); };

/* .ics genérico (agenda, data com) — mesmo padrão do provento: dia inteiro, sem valores nem quantidades */
function eventoIcs(id) {
  const [tipo, code, i] = id.split('|');
  const a = ativo(code);
  if (tipo === 'dc') { const r = RADAR.find((x) => x.code === code); return { uid: `datacom-${code}`, dia: isoDeCurta(r.dataCom), titulo: `Data com: ${a.name} (${code})`, desc: `Último dia para ter ${a.name} e receber o provento anunciado. Veja na Área do Investidor:`, rota: '/proventos/radar' }; }
  const ev = AGENDA[code][+i]; return { uid: `agenda-${code}-${i}`, dia: ev[0], titulo: `${ev[1]} · ${a.name}`, desc: `Evento da agenda de ${a.name} (${code}). Detalhes na Área do Investidor:`, rota: `/ativos/${code}` };
}
ACTIONS['ics-evento'] = (el) => {
  const e = eventoIcs(el.dataset.id);
  const fim = new Date(e.dia + 'T12:00:00Z'); fim.setUTCDate(fim.getUTCDate() + 1);
  const url = `${location.origin}${location.pathname}#${e.rota}`;
  const linhas = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Prototipo academico//Area do Investidor B3 demo//PT-BR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT',
    `UID:${e.uid}@prototipo-area-do-investidor`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`, `DTSTART;VALUE=DATE:${e.dia.replace(/-/g, '')}`, `DTEND;VALUE=DATE:${fim.toISOString().slice(0, 10).replace(/-/g, '')}`,
    `SUMMARY:${icsTexto(e.titulo)}`, `DESCRIPTION:${icsTexto(`${e.desc} ${url}`)}`, `URL:${url}`, 'TRANSP:TRANSPARENT', 'END:VEVENT', 'END:VCALENDAR'];
  const nome = `${e.uid}-${e.dia}.ics`;
  const href = URL.createObjectURL(new Blob([linhas.map(icsDobrar).join('\r\n') + '\r\n'], { type: 'text/calendar;charset=utf-8' }));
  const link = document.createElement('a'); link.href = href; link.download = nome; document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
  toast(`Arquivo ${nome} baixado. Abra no Google Agenda, no Outlook ou no Calendário da Apple.`);
};

/* Item 13: faixa “Próximas datas com” em Proventos */
function datasComFaixa() {
  const ds = datasComProximas();
  if (!ds.length) return '';
  return `<section class="card datacom-card" aria-labelledby="dcf-t" style="margin-top:16px"><h2 class="h3" id="dcf-t">${icon('calendar', 18)} Próximas datas com</h2>
    <ul class="dc-list">${ds.map((r) => `<li><p>${esc(textoDataCom(r))}</p><button type="button" class="btn btn-link btn-sm" data-action="ics-evento" data-id="dc|${r.code}">${icon('calendar', 14)}Lembrar no meu calendário</button></li>`).join('')}</ul>
    <p class="meta">Data com: quem tiver o ativo no fim desse dia tem direito ao provento. Os avisos seguem as suas preferências de notificação.</p></section>`;
}

/* =========================== Item 3 · Ficha com proventos e agenda =========================== */
function proventosAtivoCard(a) {
  if (!a.negociavel) return '';
  const hist = (PROV_HIST[a.code] || []).filter((h) => isoDeBr(h[1]) > '2025-11-24' || h[4]);
  const pagos12 = hist.filter((h) => !h[4] && isoDeBr(h[1]) <= REF_ISO).reduce((t, h) => t + h[3], 0);
  return `<section class="card" aria-labelledby="pa-${a.code}"><div class="card-head" style="margin-bottom:6px"><h2 class="h3" id="pa-${a.code}">Proventos</h2><a href="#/proventos/radar">Ver no Radar</a></div>
    ${hist.length ? `<p class="meta">DY de 12 meses: <strong>${nf2.format((pagos12 / a.preco) * 100)}%</strong> (${fmt.brl(pagos12)} por ${a.classe === 'Fundos imobiliários' ? 'cota' : 'ação'} ÷ preço atual)</p>
      <div class="table-wrap" style="margin-top:8px"><table class="tbl-compacta"><caption class="sr-only">Proventos dos últimos 12 meses</caption>
        <thead><tr><th scope="col">Data com</th><th scope="col">Pagamento</th><th scope="col">Tipo</th><th scope="col" class="num">Por ação</th></tr></thead>
        <tbody>${hist.slice().reverse().map((h) => `<tr><td>${h[0]}</td><td>${h[1]}${h[4] ? ' <span class="rel-tag rel-insuf sm">Anunciado</span>' : ''}</td><td>${h[2].replace('Juros sobre capital próprio', 'JCP')}</td><td class="num">${fmt.brl(h[3])}</td></tr>`).join('')}</tbody></table></div>`
      : '<p class="muted" style="margin-top:6px">Sem proventos nos últimos 12 meses.</p>'}
    </section>`;
}
function agendaCard(a) {
  const evs = (AGENDA[a.code] || []).map((e, i) => ({ dia: e[0], titulo: e[1], tipo: e[2], id: `ag|${a.code}|${i}` }));
  const r = RADAR.find((x) => x.code === a.code && x.dataCom);
  if (r && isoDeCurta(r.dataCom) > REF_ISO) evs.push({ dia: isoDeCurta(r.dataCom), titulo: `Data com (${fmt.brl(r.vps)} por ação)`, tipo: 'datacom', id: `dc|${a.code}` });
  const futuros = evs.filter((e) => e.dia >= REF_ISO).sort((x, y) => x.dia.localeCompare(y.dia));
  if (!futuros.length && !a.negociavel) return '';
  return `<section class="card" aria-labelledby="ag-${a.code}"><h2 class="h3" id="ag-${a.code}">Agenda</h2>
    ${futuros.length ? `<ul class="agenda">${futuros.map((e) => `<li><span class="ag-data"><strong>${curtaDeIso(e.dia)}</strong>${e.dia.slice(0, 4) === '2027' ? '<br>2027' : ''}</span><div><p>${esc(e.titulo)}</p>
      <button type="button" class="btn btn-link btn-sm" style="padding-left:0" data-action="ics-evento" data-id="${e.id}">${icon('calendar', 14)}Adicionar ao meu calendário</button></div></li>`).join('')}</ul>`
      : '<p class="muted" style="margin-top:6px">Sem eventos marcados.</p>'}
    </section>`;
}

/* =========================== Item 20 · Gráfico de proventos com projeção =========================== */
const MES_CURTO_PROJ = ['Dez', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov'];
function projecaoProventos(aReceber) {
  const meses = MES_CURTO_PROJ.map((nome, i) => ({ nome, i, ym: i === 0 ? '2026-12' : `2027-${String(i).padStart(2, '0')}`, conf: 0, est: 0, itens: [] }));
  const idx = (ym) => meses.findIndex((m) => m.ym === ym);
  const confirmado = new Set();
  aReceber.forEach((p) => { if (!p.dia || p.valor == null) return; const k = idx(p.dia.slice(0, 7)); if (k < 0) return; meses[k].conf += p.valor; confirmado.add(p.code + '|' + p.dia.slice(0, 7)); });
  const qtds = {}; posicoes().forEach((p) => { qtds[p.code] = (qtds[p.code] || 0) + p.qtd; });
  Object.entries(qtds).forEach(([code, q]) => (PROV_HIST[code] || []).forEach((h) => {
    const pag = isoDeBr(h[1]); if (h[4] || pag <= '2025-11-30' || pag > '2026-11-30') return;
    const ym = `${+pag.slice(0, 4) + 1}-${pag.slice(5, 7)}`, k = idx(ym);
    if (k < 0 || confirmado.has(code + '|' + ym)) return;
    meses[k].est += h[3] * q;
  }));
  return meses;
}
function graficoProventos(recebidos, aReceber) {
  const modo = ui.provModo || '2026';
  let meses, atual = -1, proximo = -1, rodape = '';
  if (modo === '2026') {
    meses = MES_CURTO.map((nome, i) => ({ nome, i, rec: 0, prev: 0, est: 0 }));
    recebidos.forEach((p) => { const [, mm, yy] = p.data.split('/'); if (yy === '2026') meses[+mm - 1].rec += p.valor; });
    aReceber.forEach((p) => { if (p.dia && p.valor != null && p.dia.startsWith('2026')) meses[+p.dia.slice(5, 7) - 1].prev += p.valor; });
    atual = 10; proximo = 11;
    const fora = aReceber.filter((p) => p.dia && !p.dia.startsWith('2026')).length;
    if (fora) rodape = `${fora} ${fora === 1 ? 'pagamento previsto' : 'pagamentos previstos'} para 2027 ${fora === 1 ? 'aparece' : 'aparecem'} em “Próximos 12 meses” e na lista abaixo.`;
  } else {
    meses = projecaoProventos(aReceber).map((m) => ({ nome: m.nome, i: m.i, rec: 0, prev: m.conf, est: m.est, ano: m.ym.slice(0, 4) }));
    proximo = 0;
  }
  const totConf = meses.reduce((t, m) => t + m.prev, 0), totEst = meses.reduce((t, m) => t + m.est, 0), totRec = meses.reduce((t, m) => t + m.rec, 0);
  const max = Math.max(...meses.map((m) => m.rec + m.prev + m.est), 1);
  const passo = max <= 100 ? 25 : max <= 200 ? 50 : max <= 500 ? 100 : Math.ceil(max / 500) * 100;
  const topo = Math.ceil((max * 1.3) / passo) * passo;
  const ticks = []; for (let v = 0; v <= topo; v += passo) ticks.push(v);
  const h = (v) => (v / topo) * 100;
  const nomeMes = (m) => (modo === '2026' ? MESES[m.i] : `${['dezembro', 'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro'][m.i]} de ${m.ano}`);
  const desc = (m) => [m.rec ? `recebido ${fmt.brl(m.rec)}` : '', m.prev ? `${modo === '2026' ? 'previsto' : 'confirmado'} ${fmt.brl(m.prev)}` : '', m.est ? `estimado ${fmt.brl(m.est)}` : ''].filter(Boolean).join(', ') || 'sem pagamentos';
  const rot = (m) => (m.i === atual ? 'Este mês' : m.i === proximo ? 'Próximo' : null);
  const legenda = modo === '2026' ? '<li><span class="swatch sw-rec"></span>Recebido</li><li><span class="swatch sw-prev"></span>A receber</li>' : '<li><span class="swatch sw-prev"></span>Confirmado</li><li><span class="swatch sw-est"></span>Estimado</li>';
  return `<section class="card" style="margin-top:24px" aria-labelledby="pg-chart">
    <div class="card-head"><div><h2 class="h2" id="pg-chart">${modo === '2026' ? 'Proventos em 2026' : 'Próximos 12 meses'}</h2>
      <p class="meta">${modo === '2026' ? `Recebido em cada mês e previsto para os próximos · Total recebido no ano: ${pBrl(totRec)}` : `Confirmados ${pBrl(totConf)} + estimados ${pBrl(totEst)} = <strong>${pBrl(totConf + totEst)}</strong> · renda estimada de ~${pBrl((totConf + totEst) / 12)} por mês`}</p></div>
      <div class="pg-ctrl"><div class="seg" role="group" aria-label="Período do gráfico">${[['2026', '2026'], ['12m', 'Próximos 12 meses']].map(([k, t]) => `<button type="button" data-action="prov-modo" data-k="${k}" aria-pressed="${modo === k}">${t}</button>`).join('')}</div>
      <ul class="legend pchart-legend" aria-label="Legenda">${legenda}</ul></div></div>
    ${modo === '2026' ? `<p class="pchart-sum"><span>Este mês (nov): <strong>${pBrl(meses[atual].rec + meses[atual].prev)}</strong></span><span>Próximo mês (dez): <strong>${pBrl(meses[proximo].rec + meses[proximo].prev)}</strong></span></p>` : ''}
    <div class="pchart" role="group" aria-label="Gráfico de colunas: ${modo === '2026' ? 'proventos por mês em 2026' : 'proventos confirmados e estimados nos próximos 12 meses'}. Use Tab para ouvir cada mês.">
      <div class="pchart-y" aria-hidden="true">${ticks.slice().reverse().map((v) => `<span>${state.hide ? '' : 'R$ ' + nf0.format(v)}</span>`).join('')}</div>
      <div class="pchart-plot">
        <div class="pchart-grid" aria-hidden="true">${ticks.map(() => '<span></span>').join('')}</div>
        ${meses.map((m) => { const r = rot(m), tot = m.rec + m.prev + m.est; return `<div class="pcol ${m.i < 2 ? 'tip-l' : m.i > 9 ? 'tip-r' : ''}" tabindex="0" aria-label="${nomeMes(m)}: ${state.hide ? 'valor oculto' : desc(m)}${m.i === atual ? ' (mês atual)' : m.i === proximo ? ' (próximo mês)' : ''}">
          <div class="pstack">
            ${r && tot ? `<span class="plabel" style="bottom:${h(tot)}%" aria-hidden="true"><small>${r}</small>${pBrl(tot)}</span>` : ''}
            ${m.est ? `<span class="pbar est" style="height:${h(m.est)}%"></span>` : ''}
            ${m.prev ? `<span class="pbar prev" style="height:${h(m.prev)}%"></span>` : ''}
            ${m.rec ? `<span class="pbar rec" style="height:${h(m.rec)}%"></span>` : ''}
          </div>
          <span class="ptip" style="bottom:calc(${Math.min(h(tot), 70)}% + 10px)" aria-hidden="true"><strong>${nomeMes(m)[0].toUpperCase() + nomeMes(m).slice(1)}</strong>${m.rec ? `<span><i class="swatch sw-rec"></i>Recebido ${pBrl(m.rec)}</span>` : ''}${m.prev ? `<span><i class="swatch sw-prev"></i>${modo === '2026' ? 'A receber' : 'Confirmado'} ${pBrl(m.prev)}</span>` : ''}${m.est ? `<span><i class="swatch sw-est"></i>Estimado ${pBrl(m.est)}</span>` : ''}${tot ? '' : '<span>Sem pagamentos</span>'}</span>
        </div>`; }).join('')}
      </div>
      <div class="pchart-x" aria-hidden="true">${meses.map((m) => `<span class="${m.i === atual || m.i === proximo ? 'is-on' : ''}">${m.nome}${modo === '12m' && (m.i === 0 || m.i === 1) ? `<br>${m.ano.slice(2)}` : ''}</span>`).join('')}</div>
    </div>
    ${modo === '12m' ? `<p class="note neutral" style="margin-top:8px">${icon('info', 18)}<span><strong>Estimativa, não garantida.</strong> “Estimado” repete os pagamentos que cada ativo fez nos últimos 12 meses, com a sua quantidade atual. Empresas podem mudar, atrasar ou cancelar proventos.</span></p>` : rodape ? `<p class="meta" style="margin-top:8px">${rodape}</p>` : ''}
    <button type="button" class="btn btn-link btn-sm" style="padding-left:0;margin-top:4px" data-action="disclose" aria-expanded="false" aria-controls="pchart-tabela">Ver em tabela</button>
    <div id="pchart-tabela" hidden><div class="table-wrap"><table><caption class="sr-only">Proventos por mês</caption>
      <thead><tr><th scope="col">Mês</th>${modo === '2026' ? '<th scope="col" class="num">Recebido</th><th scope="col" class="num">A receber</th>' : '<th scope="col" class="num">Confirmado</th><th scope="col" class="num">Estimado</th>'}</tr></thead>
      <tbody>${meses.map((m) => `<tr><td>${nomeMes(m)[0].toUpperCase() + nomeMes(m).slice(1)}</td>${modo === '2026' ? `<td class="num">${m.rec ? pBrl(m.rec) : '—'}</td><td class="num">${m.prev ? pBrl(m.prev) : '—'}</td>` : `<td class="num">${m.prev ? pBrl(m.prev) : '—'}</td><td class="num">${m.est ? pBrl(m.est) : '—'}</td>`}</tr>`).join('')}</tbody></table></div></div>
  </section>`;
}
ACTIONS['prov-modo'] = (el) => { ui.provModo = el.dataset.k; rerender(`[data-action="prov-modo"][data-k="${el.dataset.k}"]`); };

/* =========================== Item 15 · Resumo semanal comparado =========================== */
function comparativoSemana(sem) {
  const i = SEMANAS.indexOf(sem), r = resumoSemana(sem), ant = SEMANAS[i + 1] ? resumoSemana(SEMANAS[i + 1]) : null;
  const ib = IBOV_SERIE[sem.fimIso] && IBOV_SERIE[sem.iniIso] ? (IBOV_SERIE[sem.fimIso] / IBOV_SERIE[sem.iniIso] - 1) * 100 : null;
  const cdi = (calcularDI(sem.iniIso, sem.fimIso, 100, 1).fator - 1) * 100;
  const ordem = r.linhas.slice().sort((a, b) => b.pct - a.pct);
  const alta = ordem[0], queda = ordem[ordem.length - 1];
  const provs = provRecebidos().filter((p) => { const iso = isoDeBr(p.data); return iso > sem.iniIso && iso <= sem.fimIso; });
  const semanas = SEMANAS.slice(0, 4).reverse().map((s) => ({ s, pct: resumoSemana(s).pct }));
  const mx = Math.max(...semanas.map((x) => Math.abs(x.pct)), 0.5);
  const comp = ant ? (r.pct > ant.pct ? 'mais que' : r.pct < ant.pct ? 'menos que' : 'igual a') : '';
  return `<div class="sem-comp">
    ${ant ? `<p class="sem-frase">Sua carteira variou <strong>${fmt.pct(r.pct)}</strong> nesta semana, ${comp} os <strong>${fmt.pct(ant.pct)}</strong> da semana passada.</p>` : ''}
    <div class="grid-12" style="margin-top:12px">
      <div class="span-5"><h3 class="h3">Últimas 4 semanas</h3>
        <div class="sem-barras" role="img" aria-label="${semanas.map((x) => `${x.s.curto}: ${fmt.pct(x.pct)}`).join('; ')}">${semanas.map((x) => `<div class="sem-col ${x.s === sem ? 'atual' : ''}"><span class="sem-val">${fmt.pct(x.pct)}</span><span class="sem-bar ${x.pct >= 0 ? 'pos' : 'neg'}" style="height:${(Math.abs(x.pct) / mx) * 70 + 4}%"></span><span class="sem-lbl">${x.s.curto}</span></div>`).join('')}</div></div>
      <div class="span-7"><h3 class="h3">Na semana</h3><dl class="dl sem-dl">
        <div><dt>Minha carteira</dt><dd>${trend(r.pct)}</dd></div>
        ${ib != null ? `<div><dt>Ibovespa</dt><dd>${trend(ib)}</dd></div>` : ''}<div><dt>CDI</dt><dd>${trend(cdi)}</dd></div>
        <div><dt>Maior alta</dt><dd>${alta ? `${esc(alta.a.name)} ${trend(alta.pct)}` : '—'}</dd></div>
        <div><dt>Maior queda</dt><dd>${queda && queda.pct < 0 ? `${esc(queda.a.name)} ${trend(queda.pct)}` : 'Nenhuma queda'}</dd></div>
        <div><dt>Proventos recebidos</dt><dd>${provs.length ? `${pBrl(provs.reduce((t, p) => t + p.valor, 0))} <span class="meta">(${provs.map((p) => ativo(p.code).name).join(', ')})</span>` : 'Nenhum'}</dd></div></dl></div>
    </div></div>`;
}

/* =========================== Item 16 · Retrospectiva do ano =========================== */
function dadosRetro() {
  const per = serieCarteira(), ano = per.slice(1), ag = agregar(ano);
  const recs = provRecebidos().filter((p) => p.data.endsWith('/2026'));
  const porMes = {}; recs.forEach((p) => { const m = +p.data.split('/')[1]; porMes[m] = (porMes[m] || 0) + p.valor; });
  const campeao = Object.entries(porMes).sort((a, b) => b[1] - a[1])[0];
  const negs = [...new Set(posicoes().map((p) => p.code))].map(ativo).filter((a) => a.negociavel && a.p12);
  const varA = negs.map((a) => ({ a, pct: (a.preco / a.p12 - 1) * 100 })).sort((x, y) => y.pct - x.pct);
  const w = carteira();
  const classes = CLASSES.map((c) => { const its = w.itens.filter((g) => g.a.classe === c); const agora = its.reduce((t, g) => t + g.atual, 0), antes = its.reduce((t, g) => t + g.qtd * (g.a.p12 || g.a.preco), 0); return { c, pct: antes ? (agora / antes - 1) * 100 : null }; }).filter((x) => x.pct != null).sort((a, b) => b.pct - a.pct);
  const votos = HIST_ASSEMBLEIAS.filter((h) => h.voto.startsWith('Votou') && h.data.endsWith('2026')).length + Object.keys(ui.votos).length;
  return { ag, provAno: recs.reduce((t, p) => t + p.valor, 0), campeao: campeao ? { mes: MESES[campeao[0] - 1], valor: campeao[1] } : null, alta: varA[0], queda: varA[varA.length - 1], classes, votos, n: recs.length };
}
function viewRetrospectiva() {
  const d = dadosRetro(), sh = ui.retro.compartilhar;
  const R = (v) => (sh ? '' : pBrl(v));
  const cards = [
    ['Sua carteira em 2026', `<p class="retro-big">${icon('sparkles', 28)}</p><p>Um resumo do seu ano até ${REF.atualCurta}, com o que entrou, o que rendeu e o que você recebeu.</p>`],
    ['Patrimônio', sh ? `<p class="retro-big">${trend((d.ag.fim / d.ag.ini - 1) * 100, { size: 'lg' })}</p><p>de crescimento do patrimônio no ano (inclui aportes).</p>` : `<p>De <strong>${R(d.ag.ini)}</strong> em 31 dez 2025</p><p class="retro-big">${R(d.ag.fim)}</p><p>em ${REF.atualCurta}</p>`],
    ['Quanto você investiu', sh ? `<p class="retro-big">${d.ag.aportes > 0 ? 'Todo mês' : '—'}</p><p>Você fez aportes em ${PERIODOS_CARTEIRA.slice(1).filter((p) => p.aportes > 0).length} dos 11 meses.</p>` : `<p class="retro-big">${R(d.ag.aportes - d.ag.resgates)}</p><p>em aportes${d.ag.resgates ? `, já descontados ${R(d.ag.resgates)} de resgates` : ''}.</p>`],
    ['Quanto rendeu', `<p class="retro-big">${trend(d.ag.r * 100, { size: 'lg' })}</p><p>de rentabilidade aproximada${sh ? '' : `, ou ${R(d.ag.ganho)} entre mercado e proventos`}. Não conta o dinheiro novo.</p>`],
    ['Proventos do ano', `<p class="retro-big">${sh ? `${d.n} pagamentos` : R(d.provAno)}</p><p>${d.campeao ? `O mês que mais pagou foi <strong>${d.campeao.mes}</strong>${sh ? '' : ` (${R(d.campeao.valor)})`}.` : ''}</p>`],
    ['Altas e quedas em 12 meses', `<p>Mais subiu: <strong>${d.alta ? esc(d.alta.a.name) : '—'}</strong> ${d.alta ? trend(d.alta.pct) : ''}</p><p style="margin-top:8px">Mais caiu: <strong>${d.queda ? esc(d.queda.a.name) : '—'}</strong> ${d.queda ? trend(d.queda.pct) : ''}</p><p class="meta" style="margin-top:8px">Variação do preço, não o seu resultado.</p>`],
    ['Sua voz nas assembleias', `<p class="retro-big">${d.votos}</p><p>${d.votos === 1 ? 'assembleia em que você votou' : 'assembleias em que você votou'} a distância.</p>`],
    ['Classe que mais cresceu', d.classes.length ? `<p class="retro-big">${esc(d.classes[0].c)}</p><p>${trend(d.classes[0].pct)} em preço nos 12 meses.</p>` : '<p>—</p>'],
    ['Até o próximo ano', `<p>Este é um retrato do passado, não uma previsão. Quer guardar?</p><div class="btn-row"><button type="button" class="btn btn-primary btn-sm" data-action="retro-pdf">${icon('download', 16)}Baixar resumo</button></div>`],
  ];
  const i = Math.min(ui.retro.i, cards.length - 1);
  return {
    title: 'Sua carteira em 2026', nav: 'carteira', crumbs: [['Minha carteira', '/carteira'], ['Retrospectiva 2026']],
    html: `<a class="back-link" href="#/carteira">${icon('arrowLeft', 16)}Voltar à visão geral</a>
      <div class="page-head"><div><h1 class="h1">Sua carteira em 2026</h1><p class="meta lead">Retrospectiva até ${REF.atual}</p></div>
        <label class="toggle-line"><input type="checkbox" data-change="retro-share" ${sh ? 'checked' : ''}> Versão para compartilhar (sem valores em R$)</label></div>
      <section class="retro" role="region" aria-roledescription="carrossel" aria-label="Retrospectiva" tabindex="0">
        <div class="retro-card" aria-live="polite"><p class="retro-n">${i + 1} de ${cards.length}</p><h2 class="h1">${cards[i][0]}</h2><div class="retro-body">${cards[i][1]}</div></div>
        <div class="retro-nav"><button type="button" class="btn btn-outline" data-action="retro-ir" data-d="-1" ${i === 0 ? 'disabled' : ''}>${icon('chevronLeft', 18)}Anterior</button>
          <div class="retro-dots" aria-hidden="true">${cards.map((_, k) => `<span class="${k === i ? 'on' : ''}"></span>`).join('')}</div>
          <button type="button" class="btn btn-primary" data-action="retro-ir" data-d="1" ${i === cards.length - 1 ? 'disabled' : ''}>Próximo${icon('chevronRight', 18)}</button></div>
        <p class="meta" style="text-align:center">Use as setas do teclado para avançar e voltar.</p>
      </section>`,
  };
}
ACTIONS['retro-ir'] = (el) => { ui.retro.i = Math.max(0, ui.retro.i + +el.dataset.d); rerender(`[data-action="retro-ir"][data-d="${el.dataset.d}"]:not([disabled]), .retro`); };
CHANGES['retro-share'] = (el) => { ui.retro.compartilhar = el.checked; rerender('[data-change="retro-share"]'); };
ACTIONS['retro-pdf'] = () => {
  const d = dadosRetro(), sh = ui.retro.compartilhar;
  const linhas = sh ? [['Crescimento do patrimônio', d.ag.fim / d.ag.ini * 100 - 100, 'pct'], ['Rentabilidade aproximada', d.ag.r * 100, 'pct'], ['Pagamentos de proventos', d.n, 'num'], ['Assembleias votadas', d.votos, 'num']]
    : [['Patrimônio em 31 dez 2025', d.ag.ini], ['Patrimônio em 24 nov 2026', d.ag.fim], ['Aportes', d.ag.aportes], ['Resgates', d.ag.resgates], ['Rendimento (mercado + proventos)', d.ag.ganho], ['Proventos recebidos', d.provAno]];
  baixarDocumento({ titulo: 'Sua carteira em 2026', arquivo: `retrospectiva-2026${sh ? '-compartilhar' : ''}`, periodo: 'Retrospectiva de 1 jan a 24 nov 2026',
    colunas: [['Item', 'txt'], ['Valor', 'txt']],
    linhas: linhas.map(([t, v, k]) => [t, k === 'pct' ? fmt.pct(v) : k === 'num' ? String(v) : fmt.brl(v)]).concat([['Mais subiu em 12 meses', d.alta ? `${d.alta.a.name} (${fmt.pct(d.alta.pct)})` : '-'], ['Mais caiu em 12 meses', d.queda ? `${d.queda.a.name} (${fmt.pct(d.queda.pct)})` : '-'], ['Classe que mais cresceu', d.classes[0] ? `${d.classes[0].c} (${fmt.pct(d.classes[0].pct)})` : '-']]),
    notas: ['Retrato do passado, não é previsão. Rentabilidade aproximada, sem contar aportes e resgates.'] }, 'pdf');
};
document.addEventListener('keydown', (ev) => {
  if (!ev.target.closest || !ev.target.closest('.retro')) return;
  if (ev.key === 'ArrowRight' || ev.key === 'ArrowLeft') { ev.preventDefault(); const b = document.querySelector(`[data-action="retro-ir"][data-d="${ev.key === 'ArrowRight' ? 1 : -1}"]`); if (b && !b.disabled) b.click(); }
});
const retroCard = () => `<section class="card retro-cta" aria-labelledby="rt-t"><div class="strip"><div><span class="demo-badge" style="background:var(--brand-sky-soft);border-color:var(--brand-vivid);color:var(--brand-deep)">Novo</span><h2 class="h3" id="rt-t" style="margin-top:6px">Sua retrospectiva de 2026 está pronta</h2><p class="meta">Patrimônio, rendimento, proventos e destaques do ano, em cartões.</p></div>
  <a class="btn btn-primary" href="#/carteira/retrospectiva">${icon('sparkles', 18)}Ver retrospectiva</a></div></section>`;

/* =========================== Item 8 · Caminhos por objetivo =========================== */
const OBJETIVOS = [
  ['ir', 'file', 'Declarar meu imposto de renda'], ['recebi', 'coins', 'Ver o que eu recebi'], ['compra', 'cart', 'Conferir uma compra'],
  ['porta', 'transfer', 'Levar investimentos para outra corretora'], ['voto', 'check', 'Votar em assembleia'], ['extrato', 'download', 'Baixar um extrato'], ['mudou', 'chart', 'Entender por que minha carteira mudou'],
];
const objetivosHtml = () => `<section class="card" aria-labelledby="obj-t" style="margin-top:24px"><h2 class="h2" id="obj-t">O que você quer fazer?</h2>
  <div class="obj-grid">${OBJETIVOS.map(([k, ic, t]) => `<button type="button" class="obj-btn" data-action="objetivo" data-k="${k}">${icon(ic, 22)}<span>${t}</span>${icon('chevronRight', 18)}</button>`).join('')}</div></section>`;
ACTIONS.objetivo = (el) => {
  const k = el.dataset.k;
  if (k === 'ir') go('/servicos/ir/guia');
  else if (k === 'recebi') { ui.prov.periodo = '2026'; ui.prov.inst = ''; go('/proventos/recebidos'); }
  else if (k === 'compra') go('/carteira/compras');
  else if (k === 'porta') go('/portabilidade/transferir');
  else if (k === 'voto') go('/servicos/voto?aba=aberto');
  else if (k === 'extrato') { ui.extrato.baixarAberto = true; ui.extrato.filtroAberto = false; go('/extratos/movimentacao'); }
  else if (k === 'mudou') { ui.periodo = 'visita'; state.focusAfter = '#mudou'; go('/carteira'); setTimeout(() => { const h = document.getElementById('mudou'); if (h) { h.tabIndex = -1; h.scrollIntoView({ block: 'start' }); window.scrollBy(0, -80); h.focus({ preventScroll: true }); } }, 80); }
};
function viewGuiaIR() {
  const g = ui.guiaIR;
  const passos = [
    ['informe', 'Pegue o informe de rendimentos de cada corretora', 'As corretoras publicam o informe até o fim de fevereiro. Ele é o documento oficial para a declaração.', `<p class="meta">Suas instituições: ${(CONTAS_INVEST[state.session.conta] || []).map((c) => esc(c.inst)).join(', ')}.</p>`],
    ['relatorio', 'Baixe o Relatório consolidado do ano', 'Ajuda a conferir posições e proventos de todas as instituições juntas. É consultivo, não substitui o informe.', `<button type="button" class="btn btn-outline btn-sm" data-action="guia-rel">${icon('download', 16)}Baixar relatório anual (PDF)</button>`],
    ['proventos', 'Confira os proventos recebidos no ano', 'Dividendos são isentos; juros sobre capital próprio já vêm com imposto retido; rendimentos de FII são isentos para pessoa física, com regras.', `<button type="button" class="btn btn-outline btn-sm" data-action="guia-prov">${icon('download', 16)}Baixar proventos de 2026 (PDF)</button> <a class="btn btn-link btn-sm" href="#/proventos/recebidos" data-action="objetivo" data-k="recebi">Ver na tela</a>`],
    ['bens', 'Liste seus bens e direitos', 'Use a posição em 31/12 de cada ativo, pelo custo de aquisição (preço médio).', `<button type="button" class="btn btn-outline btn-sm" data-action="pos-baixar" data-fmt="pdf">${icon('download', 16)}Baixar posição (PDF)</button>`],
    ['revar', 'Imposto mensal de renda variável', 'Vendas com lucro podem ter imposto todo mês, pago por DARF. A calculadora Revar, da Receita Federal, faz esse cálculo.', `<a class="btn btn-outline btn-sm" href="#/servicos/ir">Ir para a Revar</a>`],
  ];
  const feitos = passos.filter(([k]) => g[k]).length;
  return {
    title: 'Guia: declarar imposto de renda', nav: 'servicos-ir', crumbs: [['Serviços', '/servicos'], ['Calculadoras de IR', '/servicos/ir'], ['Guia do IR']],
    html: `<a class="back-link" href="#/">${icon('arrowLeft', 16)}Voltar ao Início</a>
      <div class="page-head"><div><h1 class="h1">Declarar meu imposto de renda</h1><p class="meta lead">Passo a passo para a declaração de 2027 (ano-base 2026) · ${feitos} de ${passos.length} feitos</p></div></div>
      <div class="progress" aria-hidden="true"><span style="width:${(feitos / passos.length) * 100}%"></span></div>
      <ol class="guia">${passos.map(([k, t, d, acao], i) => `<li class="${g[k] ? 'feito' : ''}"><label class="check guia-check"><input type="checkbox" data-change="guia-check" data-k="${k}" ${g[k] ? 'checked' : ''}> <span class="sr-only">Marcar como feito: </span></label>
        <div><h2 class="h3">${i + 1}. ${t}</h2><p class="meta" style="margin-top:4px">${d}</p><div class="btn-row" style="margin-top:8px">${acao}</div></div></li>`).join('')}</ol>
      <p class="note neutral" style="margin-top:16px">${icon('info', 18)}<span>Guia de orientação geral. Regras de imposto mudam e cada caso tem detalhes: em dúvida, consulte um contador ou a Receita Federal.</span></p>`,
  };
}
CHANGES['guia-check'] = (el) => { ui.guiaIR[el.dataset.k] = el.checked; rerender(`[data-change="guia-check"][data-k="${el.dataset.k}"]`); };
ACTIONS['guia-rel'] = () => { ui.rel.tipo = 'Anual'; ui.rel.periodo = '2025'; ui.rel.formato = 'PDF'; ACTIONS['rel-baixar'](); };
ACTIONS['guia-prov'] = () => { ui.prov.periodo = '2026'; ui.prov.inst = ''; ACTIONS['prov-baixar']({ dataset: { aba: 'recebidos', fmt: 'pdf' } }); };

/* =========================== Item 17 · Check-in do mês =========================== */
const CHECKIN = [['proventos', 'Conferir proventos recebidos', '/proventos/recebidos'], ['extrato', 'Olhar o extrato', '/extratos/movimentacao'], ['assembleias', 'Ver assembleias abertas', '/servicos/voto?aba=aberto'], ['avisos', 'Revisar avisos', '/perfil?secao=notificacoes']];
const MES_CHECKIN = '2026-11';
function checkinFeitas() { const c = storeLocal.get('checkin', {}); const x = state.session && c[state.session.conta]; return x && x.mes === MES_CHECKIN ? x.feitas : []; }
function marcarCheckin(k) {
  if (!state.session) return;
  const c = storeLocal.get('checkin', {}), f = checkinFeitas();
  if (f.includes(k)) return;
  c[state.session.conta] = { mes: MES_CHECKIN, feitas: [...f, k] }; storeLocal.set('checkin', c);
}
function registrarVisitaCheckin(route) {
  if (!state.session) return;
  if (route.path === '/proventos/recebidos') marcarCheckin('proventos');
  if (route.path.startsWith('/extratos')) marcarCheckin('extrato');
  if (route.path === '/servicos/voto' && route.q.get('aba') === 'aberto') marcarCheckin('assembleias');
  if (route.path === '/perfil' && route.q.get('secao') === 'notificacoes') marcarCheckin('avisos');
}
function checkinCard() {
  const f = checkinFeitas(), n = CHECKIN.filter(([k]) => f.includes(k)).length;
  return `<section class="card checkin" aria-labelledby="ck-t" id="checkin"><div class="card-head"><div><h2 class="h2" id="ck-t">Check-in de novembro</h2><p class="meta">Quatro conferências rápidas, uma vez por mês. Sem pressa.</p></div><span class="ck-n">${n} de ${CHECKIN.length}</span></div>
    <div class="progress" aria-hidden="true"><span style="width:${(n / CHECKIN.length) * 100}%"></span></div>
    <ul class="ck-list">${CHECKIN.map(([k, t, h]) => `<li class="${f.includes(k) ? 'feito' : ''}">${f.includes(k) ? icon('check', 18) : '<span class="ck-vazio" aria-hidden="true"></span>'}<a href="#${h}">${t}</a><span class="sr-only">${f.includes(k) ? ' (feito)' : ' (a fazer)'}</span></li>`).join('')}</ul>
    ${n === CHECKIN.length ? '<p class="meta" style="margin-top:8px">Tudo conferido em novembro. O próximo check-in abre em dezembro.</p>' : ''}</section>`;
}
function viewCheckinEmail() {
  return {
    title: 'Prévia do lembrete mensal por e-mail', crumbs: [['Prévia do lembrete mensal']], nav: null,
    html: `<div class="page-head"><div><h1 class="h1">Prévia do lembrete mensal por e-mail</h1><p class="meta lead">Enviado a quem ativa “Lembrete mensal para conferir a carteira”.</p></div></div>
      <article class="card mail" aria-label="Exemplo de e-mail do lembrete mensal">
        <div class="mail-head"><p><strong>De:</strong> Área do Investidor B3</p><p><strong>Para:</strong> <span class="meta">e-mail do seu cadastro (não exibido)</span></p><p><strong>Assunto:</strong> Já conferiu sua carteira este mês?</p></div>
        ${logo('profundo', 72)}
        <p style="margin-top:16px">Olá,</p>
        <p style="margin-top:8px">Uma vez por mês, vale dar uma olhada rápida: proventos recebidos, extrato, assembleias abertas e avisos. Leva poucos minutos.</p>
        <div class="btn-row" style="margin-top:20px"><a class="btn btn-yellow" href="#/?checkin=1">Fazer meu check-in</a></div>
        <p class="meta" style="margin-top:20px">Este e-mail não mostra valores nem investimentos e nunca sugere comprar ou vender. Para parar, desative em Meu acesso › Configuração de notificações.</p>
      </article>`,
  };
}

/* =========================== Estado e rotas =========================== */
Object.assign(ui, { evo: 'patrimonio', evoPer: '12m', rentab: '12m', provModo: '2026', retro: { i: 0, compartilhar: false }, guiaIR: {} });
const ROTAS_EXTRA = [
  { re: /^\/carteira\/compras$/, view: viewCompras, private: true },
  { re: /^\/carteira\/retrospectiva$/, view: viewRetrospectiva, private: true },
  { re: /^\/servicos\/ir\/guia$/, view: viewGuiaIR, private: true },
  { re: /^\/demo\/checkin-email$/, view: viewCheckinEmail },
];
