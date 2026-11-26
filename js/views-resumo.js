/* Resumo semanal (carteira + e-mail opcional), perfil com Preferências e proventos no calendário pessoal (.ics). */

/* ---------- Prévia do e-mail (não pede endereço e não envia nada) ---------- */
function viewResumoEmail(route) {
  const sem = SEMANAS.find((x) => x.id === route.q.get('semana')) || SEMANAS[0];
  return {
    title: 'Prévia do resumo semanal por e-mail', crumbs: [['Prévia do resumo por e-mail']], nav: null,
    html: `<div class="page-head"><div><h1 class="h1">Prévia do resumo semanal por e-mail</h1>
      <p class="meta lead">Demonstração do convite enviado a quem ativa a preferência. Nenhum e-mail é enviado.</p></div></div>
      <article class="card mail" aria-label="Exemplo de e-mail do resumo semanal">
        <div class="mail-head">
          <p><strong>De:</strong> Área do Investidor B3 (demonstração)</p>
          <p><strong>Para:</strong> <span class="meta">e-mail do seu cadastro (não exibido na prévia)</span></p>
          <p><strong>Assunto:</strong> Veja o que mudou na sua carteira esta semana</p>
        </div>
        ${logo('profundo', 72)}
        <p style="margin-top:16px">Olá,</p>
        <p style="margin-top:8px">O resumo da ${sem.titulo.toLowerCase()} está pronto. Veja quanto sua carteira variou, os destaques da semana e as notícias ligadas aos seus investimentos.</p>
        <div class="btn-row" style="margin-top:20px"><a class="btn btn-yellow" href="#/carteira/resumo?semana=${sem.id}">Ver meu resumo na B3</a></div>
        <p class="meta" style="margin-top:20px">Por segurança, este e-mail não mostra valores, quantidades nem nomes dos seus investimentos. Você vê os detalhes depois de entrar.</p>
        <p class="meta" style="margin-top:8px">Você recebe este e-mail porque ativou “Receber resumo semanal da carteira” em Meu acesso › Configuração de notificações. Para parar, desative a opção lá.</p>
      </article>
      <p class="note neutral" style="margin-top:16px;max-width:600px">${icon('info', 18)}<span>Prévia demonstrativa: não pedimos endereço de e-mail e nenhuma mensagem é disparada.</span></p>`,
  };
}

/* ---------- Resumo semanal ---------- */
function resumoSemana(sem) {
  const linhas = [];
  Object.entries(sem.qtd).forEach(([code, qtd]) => {
    if (!ehPrincipal()) return;
    const a = ativo(code), ini = sem.precoIni[code], fim = sem.precoFim ? sem.precoFim[code] : a.preco;
    linhas.push({ a, qtd, ini, fim, delta: qtd * (fim - ini), base: qtd * ini, demo: false });
  });
  if (sem.compras) {
    const g = {};
    comprasDemo().forEach((x) => { g[x.code] = (g[x.code] || 0) + x.qtd; });
    Object.entries(g).forEach(([code, qtd]) => {
      const a = ativo(code);
      linhas.push({ a, qtd, ini: a.anterior, fim: a.preco, delta: qtd * (a.preco - a.anterior), base: qtd * a.anterior, demo: true });
    });
  }
  const delta = linhas.reduce((s, l) => s + l.delta, 0), base = linhas.reduce((s, l) => s + l.base, 0);
  const valorFim = linhas.reduce((s, l) => s + l.qtd * l.fim, 0);
  linhas.forEach((l) => (l.pct = (l.fim / l.ini - 1) * 100));
  return { linhas, delta, pct: base ? (delta / base) * 100 : 0, valorFim };
}

/* Só notícias publicadas dentro da semana; eventos futuros (assembleia, divulgação) entram no resumo da semana atual. */
const MES_NUM = { out: 10, nov: 11, dez: 12 };
const dataNoticia = (n) => { const [d, m] = n.data.split(',')[0].split(' '); return 2026 * 10000 + MES_NUM[m] * 100 + +d; };
function noticiaDoAtivo(code, sem) {
  const naSemana = (n) => n.ativos.includes(code) && (n.tipo === 'evento' ? sem === SEMANAS[0] && dataNoticia(n) > sem.ate : dataNoticia(n) >= sem.de && dataNoticia(n) <= sem.ate);
  return NOTICIAS.find((n) => naSemana(n) && n.tipo !== 'evento') || NOTICIAS.find(naSemana);
}

/* Destaques simples: nome da ação e valorização da semana, com cor e letra grande. */
function destaquesSemana(sem, r) {
  const movers = r.linhas.slice().sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  const evs = ehPrincipal() ? sem.eventos : [];
  const lista = movers.slice(0, Math.max(0, 3 - Math.min(evs.length, 1))).map((l) => {
    const n = noticiaDoAtivo(l.a.code, sem);
    const dir = l.pct > 0.005 ? 'up' : l.pct < -0.005 ? 'down' : 'flat';
    return `<li class="dest-row">
      <div class="dest-main"><p class="dest-nome">${esc(l.a.name)} <span class="asset-code">${l.a.code}</span></p>
        ${n ? `<a class="dest-link" href="#/noticias?aba=carteira&painel=${n.id}">Ver como afeta minha carteira<span class="sr-only">: ${esc(n.titulo)}</span></a>` : ''}
        ${l.demo ? '<p class="meta">Compra feita na demo, conta desde 23 nov</p>' : ''}</div>
      <div class="dest-val"><span class="dest-pct dest-${dir}">${icon(dir === 'up' ? 'arrowUp' : dir === 'down' ? 'arrowDown' : 'minus', 20)}<span class="sr-only">${dir === 'up' ? 'Alta' : dir === 'down' ? 'Baixa' : 'Estável'}: </span>${fmt.pct(l.pct)}</span>
        <span class="dest-brl dest-${dir}">${pSbrl(l.delta)} na carteira</span></div>
    </li>`;
  });
  evs.slice(0, 1).forEach((e) => {
    const p = acharProvento(e.provId);
    lista.push(`<li class="dest-row">
      <div class="dest-main"><p class="dest-nome">${esc(ativo(e.code).name)} <span class="asset-code">${e.code}</span></p>
        <p class="meta">Anunciou dividendos em ${e.data}</p>
        <a class="dest-link" href="#/proventos/pagamento/${e.provId}">Ver pagamento</a></div>
      <div class="dest-val"><span class="dest-pct dest-prov">${icon('coins', 20)}${p && p.valor != null ? pBrl(p.valor) : 'Provento'}</span>
        <span class="dest-brl">previsto para ${p && p.data ? p.data : 'data a confirmar'}</span></div>
    </li>`);
  });
  return lista.slice(0, 3);
}

function viewResumo(route) {
  const sem = SEMANAS.find((x) => x.id === route.q.get('semana')) || SEMANAS[0];
  const r = resumoSemana(sem);
  const on = prefResumo();
  const seletor = `<div class="seg" role="group" aria-label="Semana do resumo">${SEMANAS.map((x) => `<button type="button" data-action="go" data-href="/carteira/resumo?semana=${x.id}" aria-pressed="${x.id === sem.id}">${x.curto}</button>`).join('')}</div>`;
  let corpo;
  if (!r.linhas.length) {
    corpo = emptyState({ title: 'Sem investimentos nesta semana', text: 'O resumo aparece quando houver posições na carteira.', iconName: 'calendar',
      actions: '<a class="btn btn-outline btn-sm" href="#/mercado">Comprar uma ação na demo</a>' });
  } else {
    const ds = destaquesSemana(sem, r);
    const ent = ehPrincipal() ? sem.entradas : [];
    corpo = `<section class="card" aria-labelledby="rs-var">
        <div class="card-head"><h2 class="h2" id="rs-var">Variação da carteira</h2><span class="meta">${sem.ini} → ${sem.fim}</span></div>
        <div class="kpis">
          <div class="kpi"><div class="label">Variação de preço na semana</div><div class="value big">${trendValue(r.delta, pSbrl(r.delta))}</div><div class="sub">${trend(r.pct)}</div></div>
          <div class="kpi"><div class="label">Valor em ${sem.fimData}</div><div class="value big" style="color:var(--text)">${pBrl(r.valorFim)}</div><div class="sub meta">Pelo preço de fechamento</div></div>
          <div class="kpi"><div class="label">Período</div><div class="value h2">${sem.curto}</div><div class="sub meta">Fechamento de ${sem.ini} a ${sem.fim}</div></div>
        </div>
        ${ent.length ? `<p class="note neutral" style="margin-top:16px">${icon('info', 18)}<span>${ent.map((e) => `Entrou na carteira: ${pQtd(e.qtd)} ações de ${esc(ativo(e.code).name)} na ${e.inst} (${e.origem}).`).join(' ')} Entradas não contam como variação de preço.</span></p>` : ''}
        ${sem.compras && comprasDemo().length ? `<p class="note demo-note" style="margin-top:12px">${icon('cart', 18)}<span>Inclui compras feitas na demo, consideradas desde ${REF.anteriorCurta}.</span></p>` : ''}
      </section>
      <section class="card" aria-labelledby="rs-dest">
        <div class="card-head"><h2 class="h2" id="rs-dest">Destaques da semana</h2><span class="meta">Valorização de ${sem.ini} a ${sem.fim}</span></div>
        <ul class="destaques">${ds.join('')}</ul>
        <p class="meta" style="margin-top:8px">As notícias ajudam a entender o contexto, mas não comprovam a causa das variações.</p>
      </section>`;
  }
  return {
    title: 'Resumo semanal', nav: 'carteira', pageKey: 'resumo',
    crumbs: [['Minha carteira', '/carteira'], ['Resumo semanal']],
    html: `<a class="back-link" href="#/carteira">${icon('arrowLeft', 16)}Voltar à visão geral</a>
      <div class="page-head"><div><h1 class="h1">Resumo semanal</h1><p class="meta lead">${sem.titulo} · Dados simulados</p></div>${seletor}</div>
      <div class="stack">${corpo}
        <section class="card strip-card" aria-labelledby="rs-email"><div class="strip">
          <div><h2 class="h3" id="rs-email">Resumo por e-mail</h2><p class="meta">${on ? 'Ativado: você recebe um aviso toda segunda (simulado).' : 'Desativado. Ative para receber um aviso quando o resumo ficar pronto.'}</p></div>
          <div class="btn-row" style="margin:0"><a class="btn btn-outline btn-sm" href="#/perfil?secao=config">${on ? 'Alterar nas notificações' : 'Ativar nas notificações'}</a><a class="btn btn-link btn-sm" href="#/demo/resumo-email?semana=${sem.id}">Ver prévia do e-mail</a></div>
        </div></section>
      </div>`,
  };
}

/* ---------- Detalhe de um pagamento de provento ---------- */
function acharProvento(id) {
  const rec = provRecebidos().find((p) => p.id === id);
  if (rec) return { ...rec, status: 'recebido' };
  const prev = provAReceber().find((p) => p.id === id);
  return prev ? { ...prev, status: 'previsto' } : null;
}

function viewProvento(route) {
  const p = acharProvento(route.m[1]);
  const deCal = route.q.get('de') === 'calendario';
  const back = deCal ? `<a class="back-link" href="#/proventos/calendario">${icon('arrowLeft', 16)}Voltar ao calendário</a>`
    : `<a class="back-link" href="#/proventos/${p && p.status === 'recebido' ? 'recebidos' : 'a-receber'}">${icon('arrowLeft', 16)}Voltar a Proventos</a>`;
  if (!p) {
    return {
      title: 'Pagamento não encontrado', nav: 'proventos', pageKey: 'provento', crumbs: [['Proventos', '/proventos'], ['Pagamento']],
      html: `${back}<h1 class="h1" style="margin:8px 0 16px">Pagamento não encontrado</h1>
        ${emptyState({ title: 'Este pagamento não aparece nesta conta.', text: 'Se ele veio de uma compra feita na demo, a compra pode ter sido desfeita ou feita em outro navegador.', actions: '<a class="btn btn-primary btn-sm" href="#/proventos/a-receber">Ver proventos a receber</a>' })}`,
    };
  }
  const a = ativo(p.code), prev = p.status === 'previsto';
  const tag = prev
    ? `<span class="rel-tag rel-insuf">${icon('calendar', 16)}Pagamento previsto · ainda não pago</span>`
    : `<span class="rel-tag rel-direta">${icon('check', 16)}Valor recebido</span>`;
  const cal = prev
    ? (p.dia
      ? `<div class="btn-row"><button type="button" class="btn btn-primary" data-action="ics" data-id="${p.id}">${icon('calendar', 18)}Adicionar ao meu calendário</button></div>
         <p class="meta" style="margin-top:8px">Baixa um arquivo .ics para importar no Google Agenda, no Outlook ou no Calendário da Apple. O evento é de dia inteiro e não leva valores nem quantidades.</p>`
      : `<p class="note neutral" style="margin-top:12px">${icon('info', 18)}<span>Data a confirmar. O botão de calendário aparece quando a empresa confirmar a data de pagamento.</span></p>`)
    : '';
  const mesCal = p.dia ? p.dia.slice(0, 7) : p.data ? p.data.split('/').reverse().join('-').slice(0, 7) : null;
  return {
    title: `${p.tipo} · ${a.name}`, nav: 'proventos', pageKey: 'provento', crumbs: [['Proventos', '/proventos'], [prev ? 'Pagamento previsto' : 'Pagamento recebido']],
    html: `${back}
      <div class="page-head"><div><p style="margin-bottom:6px">${tag}</p><h1 class="h1">${esc(p.tipo)} · ${esc(a.name)} <span class="asset-code" style="font-size:18px">${a.code}</span></h1>
        <p class="meta lead">${esc(p.inst)}${p.demo ? ' · compra feita na demo · valor e data simulados' : ' · Dados simulados'}</p></div></div>
      <section class="card" style="max-width:760px" aria-labelledby="pg-det"><h2 class="sr-only" id="pg-det">Detalhes do pagamento</h2>
        <div class="kpis">
          <div class="kpi"><div class="label">${prev ? 'Valor previsto' : 'Valor recebido'}</div><div class="value big">${p.valor != null ? pBrl(p.valor) : '<span style="color:var(--neutral-text)">A confirmar</span>'}</div></div>
          <div class="kpi"><div class="label">${prev ? 'Data prevista de pagamento' : 'Pago em'}</div><div class="value h2">${p.data || 'Data a confirmar'}</div></div>
          <div class="kpi"><div class="label">Situação</div><div class="value h2">${prev ? 'Previsto' : 'Recebido'}</div><div class="sub meta">${prev ? 'Não entra no total recebido' : 'Já entra no total recebido'}</div></div>
        </div>
        <p class="note ${prev ? 'warn' : ''}" style="margin-top:16px">${icon('info', 18)}<span>${prev
          ? 'Este valor ainda não foi pago. Ele pode mudar até a data de pagamento e depende de você ter o ativo na data de corte.'
          : 'Este valor já foi creditado na sua conta na instituição. Ele aparece em Recebidos e no extrato de Eventos.'}</span></p>
        ${cal}
        <div class="card-foot">${mesCal ? `<button type="button" class="btn btn-link btn-sm" data-action="cal-ir" data-mes="${mesCal}">Ver no calendário</button>` : ''}<a href="#/proventos/${prev ? 'a-receber' : 'recebidos'}">${prev ? 'Todos a receber' : 'Todos os recebidos'}</a><a href="#/ativos/${a.code}">Ver ${esc(a.name)}</a></div>
      </section>`,
  };
}
ACTIONS['cal-ir'] = (el) => { const [y, m] = el.dataset.mes.split('-'); ui.cal = { ...ui.cal, y: +y, m: +m - 1, filtro: 'todos' }; go('/proventos/calendario'); };

/* ---------- Arquivo .ics (RFC 5545): evento de dia inteiro, sem valores nem quantidades ---------- */
const icsTexto = (s) => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
function icsDobrar(linha) {
  // linhas de até 75 bytes; continuação começa com espaço
  const enc = new TextEncoder(); const partes = []; let atual = ''; let bytes = 0;
  for (const ch of linha) {
    const b = enc.encode(ch).length;
    if (bytes + b > (partes.length ? 74 : 75)) { partes.push(atual); atual = ''; bytes = 0; }
    atual += ch; bytes += b;
  }
  partes.push(atual);
  return partes.join('\r\n ');
}
function linkPagamento(id) { return `${location.origin}${location.pathname}#/proventos/pagamento/${id}`; }
function gerarIcs(p) {
  const a = ativo(p.code);
  const ini = p.dia.replace(/-/g, '');
  const d = new Date(p.dia + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + 1);
  const fim = d.toISOString().slice(0, 10).replace(/-/g, '');
  const agora = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const url = linkPagamento(p.id);
  const linhas = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Prototipo academico//Area do Investidor B3 demo//PT-BR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${p.id}@prototipo-area-do-investidor`,
    `DTSTAMP:${agora}`,
    `DTSTART;VALUE=DATE:${ini}`,
    `DTEND;VALUE=DATE:${fim}`,
    'SUMMARY:Conferir provento na B3',
    `DESCRIPTION:${icsTexto(`Pagamento previsto de ${p.tipo.toLowerCase()} de ${a.name} (${a.code}). Veja o detalhe na Área do Investidor: ${url}\nProtótipo acadêmico · Dados simulados.`)}`,
    `URL:${url}`,
    'TRANSP:TRANSPARENT',
    'END:VEVENT', 'END:VCALENDAR',
  ];
  return linhas.map(icsDobrar).join('\r\n') + '\r\n';
}
ACTIONS.ics = (el) => {
  const p = acharProvento(el.dataset.id);
  if (!p || p.status !== 'previsto' || !p.dia) { toast('Data a confirmar: ainda não dá para adicionar ao calendário.'); return; }
  const nome = `provento-${p.code.toLowerCase()}-${p.dia}.ics`;
  const url = URL.createObjectURL(new Blob([gerarIcs(p)], { type: 'text/calendar;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = nome; document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast(`Arquivo ${nome} baixado. Abra no Google Agenda, no Outlook ou no Calendário da Apple.`);
};
