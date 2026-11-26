/* Serviços como no portal: Calculadoras de IR (Revar + parceiras), Voto a distância (Início, Em aberto, Histórico),
   CALC de Renda Fixa funcionando na página e Meu acesso. Tudo simulado: nada é enviado a terceiros. */

const faq = (id, itens) => `<div class="faq">${itens.map(([q, r], i) => `<div class="faq-item">
  <button type="button" class="faq-q" data-action="disclose" aria-expanded="false" aria-controls="${id}-${i}">${esc(q)}${icon('plus', 18)}</button>
  <div class="faq-a" id="${id}-${i}" hidden><p>${esc(r)}</p></div></div>`).join('')}</div>`;
const svTabs = (itens, atual, base) => `<div class="tabs" role="tablist" aria-label="Seções" data-tablist="sv-${base.split('/').pop()}">${itens.map(([k, t]) => `<a role="tab" class="tab" data-tab="${k}" href="#${base}?aba=${k}" aria-selected="${k === atual}" tabindex="${k === atual ? 0 : -1}">${esc(t)}</a>`).join('')}</div>`;

/* ---------- Calculadoras de IR ---------- */
const TERMO_REVAR = [
  'Olá, investidor! Para usar a calculadora Revar e saber quanto de imposto de renda incide sobre seus investimentos, nesta primeira fase o cálculo considera operações de renda variável no mercado à vista. Para isso, é preciso compartilhar, com a sua autorização, alguns dados pessoais com a Receita Federal.',
  'O compartilhamento segue a regulamentação da Receita Federal e só acontece com a sua autorização. A B3 envia as informações de operações registradas pelas bolsas, câmaras de compensação e corretoras.',
  'Serão compartilhados: nome, CPF, posições em custódia, negociações, eventos corporativos e proventos dos produtos suportados.',
  'Você pode desvincular a calculadora a qualquer momento em Serviços › Calculadoras de IR ou em Meu acesso › Aplicativos e sites.',
];
function servicoIR(route) {
  const aba = route.q.get('aba') === 'parceiras' ? 'parceiras' : 'revar';
  const R = ui.revar;
  if (aba === 'revar' && R.tela === 'vincular') {
    return `<section class="card revar-vincular" aria-labelledby="rv-t">
      <h2 class="h2" id="rv-t">Vincular calculadora Revar</h2>
      <h3 class="h3" style="margin-top:12px">Autorize o compartilhamento de dados com a calculadora Revar</h3>
      <div class="termo" tabindex="0" aria-label="Termo de autorização">${TERMO_REVAR.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
      <button type="button" class="btn btn-link btn-sm" data-action="revar-termo">${icon('download', 16)}Baixar o termo</button>
      <form class="stack-sm" data-form="revar" style="margin-top:8px">
        <label class="check"><input type="checkbox" name="autorizo" data-change="revar-check"> Autorizo o envio dos meus dados para a calculadora Revar.</label>
        <label class="check"><input type="checkbox" name="ciente" data-change="revar-check"> Li e estou ciente da Política de Privacidade e dos Termos de Uso da B3.</label>
        <div class="btn-row"><button class="btn btn-yellow" type="submit" id="revar-fim" disabled>Finalizar</button><button type="button" class="btn btn-outline" data-action="revar-tela" data-t="inicio">Cancelar</button></div>
      </form></section>`;
  }
  if (aba === 'revar' && R.tela === 'sucesso') {
    return `<section class="card revar-ok" aria-labelledby="rok-t"><h2 class="h1" id="rok-t">${icon('check', 24)} Conta B3 vinculada com sucesso!</h2>
      <ol class="revar-passos">
        <li><strong>Aguarde o dia seguinte para acessar o Revar.</strong> Esse tempo é necessário para a atualização com a Receita Federal.</li>
        <li><strong>No próximo mês, acesse a calculadora Revar</strong> e complete o custo médio dos seus ativos para começar o cálculo. Se for seu primeiro acesso, faça o cadastro.<p class="revar-atencao">Atenção! O cálculo não é feito de forma imediata nem retroativa.</p></li>
        <li><strong>Acompanhe os relatórios no portal da calculadora Revar</strong> para ver os meses em que houve imposto a recolher.</li>
      </ol>
      <div class="btn-row"><button type="button" class="btn btn-yellow" data-action="revar-tela" data-t="inicio">Ir para tela inicial</button></div></section>`;
  }
  const produtos = `<section class="revar-band"><p><strong>Nesta primeira versão, os produtos suportados pela Revar são:</strong></p>
    <ul>${['Ações', 'BDRs', 'ETFs', 'Units', 'FII/Fiagro', 'Cotas de fundos de investimento', 'Recibos, direitos e bônus de subscrição'].map((x) => `<li>${x}</li>`).join('')}</ul></section>`;
  const revar = `
    ${R.vinculado
      ? `<section class="card revar-hero" aria-labelledby="rh-t"><div><h2 class="h1" id="rh-t">${icon('check', 24)} Sua conta B3 já está vinculada!</h2>
          <p style="margin-top:8px"><strong>Aguarde o dia seguinte para acessar o Revar.</strong> Esse tempo é necessário para a atualização com a Receita Federal.</p>
          <div class="btn-row"><button type="button" class="btn btn-outline" disabled>Acessar o Revar ${icon('external', 16)}</button><button type="button" class="btn btn-link btn-sm" data-action="revar-desvincular">Desvincular calculadora</button></div></div></section>`
      : `<section class="card revar-hero" aria-labelledby="rh-t"><div class="revar-arte" aria-hidden="true">${icon('file', 64)}</div><div>
          <h2 class="h1" id="rh-t">Mais facilidade e agilidade nas suas obrigações com o sistema Revar da Receita Federal</h2>
          <p style="margin-top:12px">Acompanhe suas operações na bolsa e calcule o imposto devido. Basta vincular a sua conta B3 à calculadora: a partir daí, as informações das suas operações ficam disponíveis para a Receita Federal, que permite emitir o DARF com um clique. O Revar é acessado pelo e-CAC, o portal de serviços da Receita Federal.</p>
          <div class="btn-row"><button type="button" class="btn btn-yellow" data-action="revar-tela" data-t="vincular">Vincular calculadora Revar</button></div></div></section>`}
    ${produtos}
    <section class="card" aria-labelledby="rc-t"><h2 class="h2" id="rc-t">Entenda como funciona o cálculo</h2>
      <div class="grid-12" style="margin-top:12px">
        <div class="span-8 video-demo" role="img" aria-label="Vídeo ilustrativo: 7 perguntas sobre o Revar">${icon('chevronRight', 40)}<span>Vídeo: 7 perguntas sobre o Revar</span></div>
        <div class="span-4 card darf-card">${icon('file', 28)}<p>Ao contrário da renda fixa, algumas operações de renda variável não têm imposto de renda recolhido na fonte. Saiba quando é preciso recolher o imposto e pagar o DARF.</p>
          <button type="button" class="btn btn-outline btn-sm" data-action="disclose" aria-expanded="false" aria-controls="darf-info">Saiba mais sobre o DARF ${icon('arrowRight', 16)}</button>
          <p id="darf-info" hidden class="meta">O DARF é a guia para pagar o imposto. Em ações, vendas acima de R$ 20 mil no mês com lucro pagam 15%; day trade paga 20%. O pagamento vence no último dia útil do mês seguinte.</p></div>
      </div></section>
    <section class="card" aria-labelledby="re-t"><h2 class="h2" id="re-t">Etapas de autorização e acesso à calculadora da Receita Federal</h2>
      <ol class="etapas-revar">
        <li><span class="et-n">1</span><strong>Na Área do Investidor</strong>, autorize o compartilhamento dos seus dados com a Receita Federal e aceite a Política de Privacidade e os Termos de Uso.</li>
        <li class="atencao"><span class="et-n">!</span><strong>Atenção</strong>: o cálculo não é feito de forma imediata nem retroativa. Veja os próximos passos.</li>
        <li><span class="et-n">2</span><strong>Autorização</strong>: depois do aceite, acesse o portal da calculadora Revar e complete as informações de posição inicial.</li>
        <li><span class="et-n">3</span><strong>Apuração</strong>: no mês seguinte, a Receita Federal analisa seus movimentos do primeiro ao último dia útil do mês.</li>
        <li><span class="et-n">4</span><strong>Fechamento</strong>: depois da análise, é feita a apuração das operações e liberada a emissão do DARF.</li>
      </ol></section>
    <section class="card" aria-labelledby="rf-t"><h2 class="h2" id="rf-t">Tem alguma dúvida?</h2>${faq('faq-revar', [
      ['O que é o Revar?', 'É a calculadora de imposto de renda sobre renda variável da Receita Federal. Ela usa os dados enviados pela B3, com a sua autorização, para apurar o imposto e gerar o DARF.'],
      ['O vínculo tem custo?', 'Não. A vinculação e o uso da calculadora Revar são gratuitos.'],
      ['Quais dados são compartilhados?', 'Nome, CPF, posições, negociações, eventos corporativos e proventos dos produtos suportados.'],
      ['Posso desvincular?', 'Sim, a qualquer momento, nesta página ou em Meu acesso › Aplicativos e sites. O cálculo deixa de receber novas informações.'],
      ['O Revar substitui a declaração anual?', 'Não. Ele ajuda no imposto mensal sobre renda variável. A declaração anual continua sendo feita no programa da Receita.'],
    ])}</section>`;
  const parceiras = `<p class="muted" style="margin-bottom:16px">Ferramentas parceiras para calcular imposto de renda. Algumas exigem contratação e autorização para compartilhar dados.</p>
    <div class="grid-12">${[['Parceiro de IR A', 'Ações, FIIs e day trade', 'Plano pago'], ['Parceiro de IR B', 'Ações e renda fixa', 'Gratuito até 10 operações por mês'], ['Parceiro de IR C', 'Ações e criptoativos', 'Plano pago']].map(([n, e, c]) => `
      <section class="card span-4"><h2 class="h3">${n}</h2><p class="meta" style="margin-top:4px">Escopo: ${e}</p><p class="meta">Condição: ${c}</p>
        <div class="btn-row"><a class="btn btn-outline btn-sm" href="#/saida?para=${encodeURIComponent(n)}&volta=${encodeURIComponent('/servicos/ir?aba=parceiras')}">Ir para o site ${icon('external', 16)}</a></div></section>`).join('')}</div>
    <p class="note" style="margin-top:16px">${icon('file', 18)}<span>Procura um documento? <a href="#/servicos/relatorios">Ver Relatórios</a></span></p>`;
  return svTabs([['revar', 'Revar – Receita Federal'], ['parceiras', 'Calculadoras parceiras']], aba, '/servicos/ir') + (aba === 'revar' ? revar : parceiras);
}
ACTIONS['revar-tela'] = (el) => { ui.revar.tela = el.dataset.t; rerender('#conteudo h2'); window.scrollTo(0, 0); };
CHANGES['revar-check'] = (el) => { const f = el.form; document.getElementById('revar-fim').disabled = !(f.autorizo.checked && f.ciente.checked); };
SUBMITS.revar = () => { ui.revar = { vinculado: true, tela: 'sucesso' }; announce('Conta vinculada à calculadora Revar.'); rerender('#rok-t'); };
ACTIONS['revar-desvincular'] = () => { ui.revar = { vinculado: false, tela: 'inicio' }; toast('Calculadora Revar desvinculada.'); rerender('#rh-t'); };
ACTIONS['revar-termo'] = () => baixarDocumento({
  titulo: 'Termo de autorização · calculadora Revar', arquivo: 'termo-revar', periodo: 'Texto do termo de compartilhamento de dados',
  colunas: [['Item', 'txt'], ['Texto', 'txt']], linhas: TERMO_REVAR.map((t, i) => [String(i + 1), t]),
  notas: [],
}, 'pdf');

/* ---------- Voto a distância ---------- */
ASSEMBLEIAS.forEach((a) => { a.code = a.empresa.split('· ')[1]; a.tipoAtivo = ativo(a.code).classe; a.aberta = a.estado === 'Aberta para consulta'; });
ASSEMBLEIAS.push({ empresa: 'Galpões Logísticos Demo FII · GLPD11', code: 'GLPD11', tipoAtivo: 'Fundos imobiliários', data: '10 dez 2026', prazo: '08 dez 2026', estado: 'Aberta para consulta', aberta: true, tipo: 'AGE',
  pauta: ['Aprovar a 3ª emissão de cotas', 'Aprovar a troca do formador de mercado'], docs: ['Edital de convocação', 'Proposta da administração'] });
const HIST_ASSEMBLEIAS = [
  { empresa: 'Aurora · DEMO1', tipo: 'AGO', data: '28 abr 2026', voto: 'Votou a distância', resultado: 'Contas e dividendos aprovados' },
  { empresa: 'Galpões Logísticos Demo FII · GLPD11', tipo: 'AGO', data: '30 mar 2026', voto: 'Votou a distância', resultado: 'Demonstrações financeiras aprovadas' },
  { empresa: 'Nova Azul · DEMO2', tipo: 'AGO', data: '29 abr 2026', voto: 'Não votou', resultado: 'Contas aprovadas' },
];
function servicoVoto(route) {
  const aba = ['inicio', 'aberto', 'historico'].includes(route.q.get('aba')) ? route.q.get('aba') : 'inicio';
  const V = ui.voto;
  let corpo;
  if (aba === 'inicio') {
    corpo = `<section class="card voto-hero"><h2 class="h1">Voto a distância</h2>
        <p style="margin-top:8px">Vote nas assembleias das suas ações, FIIs, ETFs e fundos listados pela Área do Investidor, sem sair de casa.</p>
        <p class="meta" style="margin-top:8px">Importante: para a assembleia aparecer aqui, o emissor (empresa ou administrador do fundo) precisa registrá-la no sistema de voto a distância da B3. Os outros canais de participação continuam valendo.</p>
        <div class="btn-row"><a class="btn btn-yellow" href="#/servicos/voto?aba=aberto">Ver assembleias em aberto</a></div></section>
      <section class="card"><h2 class="h2">Entre os benefícios desse serviço estão</h2>
        <ul class="beneficios">${[['grid', 'Facilidade para votar nas assembleias'], ['file', 'Votar sem cadastros longos e burocráticos'], ['refresh', 'Editar o voto e consultar as assembleias em que você votou'], ['check', 'Votar num ambiente confiável como a Área do Investidor']].map(([i, t]) => `<li><span class="dest-tile-ic">${icon(i, 20)}</span>${t}</li>`).join('')}</ul></section>
      <section class="card"><h2 class="h2">Como funciona</h2><ol class="steps" style="margin-top:12px">
        <li><strong>Assembleia registrada</strong><br>O emissor cadastra a assembleia e o boletim de voto.</li>
        <li><strong>Consulta</strong><br>Ela aparece em Assembleias em aberto, com pauta e documentos.</li>
        <li><strong>Voto</strong><br>Você escolhe Aprovar, Rejeitar ou Abster-se em cada item, até o prazo.</li>
        <li><strong>Acompanhamento</strong><br>O voto fica em Votadas e, depois da assembleia, no Histórico.</li></ol></section>
      <section class="card"><h2 class="h2">Tem alguma dúvida?</h2>${faq('faq-voto', [
        ['Quem pode votar?', 'Quem tinha o ativo na data de corte definida no edital da assembleia.'],
        ['Até quando posso votar?', 'Até o prazo do voto a distância, que costuma terminar alguns dias antes da assembleia.'],
        ['Posso mudar meu voto?', 'Sim, enquanto o prazo estiver aberto. Depois, o voto fica registrado no Histórico.'],
        ['Meu voto aparece para a empresa?', 'A empresa recebe o mapa de votação consolidado, conforme as regras da assembleia.'],
      ])}</section>`;
  } else if (aba === 'aberto') {
    const lista = ASSEMBLEIAS.map((a, i) => ({ a, i })).filter(({ a, i }) => (V.tipo === 'todos' || a.tipoAtivo === V.tipo) && (V.filtro === 'votadas' ? !!ui.votos[i] : !ui.votos[i]));
    corpo = `<div class="query-bar" style="justify-content:space-between"><h2 class="h2" style="margin:0">Assembleias em aberto</h2>
        <div class="btn-row" style="margin:0;align-items:flex-end"><div class="field"><label for="vt-tipo">Tipo</label><select id="vt-tipo" class="select" data-change="voto-tipo"><option value="todos">Todos</option>${['Ações', 'Fundos imobiliários', 'ETFs', 'Fundos'].map((t) => `<option ${V.tipo === t ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
        <div class="seg" role="group" aria-label="Situação do voto">${[['naovotadas', 'Não votadas'], ['votadas', 'Votadas']].map(([k, t]) => `<button type="button" data-action="voto-filtro" data-k="${k}" aria-pressed="${V.filtro === k}">${t}</button>`).join('')}</div></div></div>
      ${lista.length ? `<div class="stack-sm">${lista.map(({ a, i }) => cardAssembleia(a, i)).join('')}</div>`
        : emptyState({ title: V.filtro === 'votadas' ? 'Você ainda não votou em assembleias abertas' : 'Atualmente, não há assembleias em aberto para esse filtro', text: 'Quando o emissor de um ativo seu cadastrar uma assembleia na B3, ela aparece aqui.', iconName: 'calendar' })}`;
  } else {
    corpo = `<h2 class="h2" style="margin-bottom:12px">Histórico</h2><div class="card"><div class="table-wrap"><table><caption class="sr-only">Histórico de assembleias</caption>
      <thead><tr><th scope="col">Assembleia</th><th scope="col">Tipo</th><th scope="col">Data</th><th scope="col">Seu voto</th><th scope="col" class="col-sec">Resultado</th></tr></thead>
      <tbody>${HIST_ASSEMBLEIAS.map((h) => `<tr><td>${esc(h.empresa)}</td><td>${h.tipo}</td><td>${h.data}</td><td><span class="rel-tag ${h.voto.startsWith('Votou') ? 'rel-direta' : 'rel-sem'}">${h.voto}</span></td><td class="col-sec">${esc(h.resultado)}</td></tr>`).join('')}</tbody></table></div>
      <p class="meta" style="margin-top:8px">AGO: assembleia geral ordinária · AGE: assembleia geral extraordinária.</p></div>`;
  }
  return svTabs([['inicio', 'Início'], ['aberto', 'Assembleias em aberto'], ['historico', 'Histórico']], aba, '/servicos/voto') + corpo;
}
function cardAssembleia(a, i) {
  const k = 'ass-' + i, voto = ui.votos[i], pode = temAtivo(a.code) && a.aberta;
  return `<section class="card">
    <div class="card-head" style="margin:0"><div><h3 class="h3">${esc(a.empresa)}</h3><p class="meta">${a.tipoAtivo} · ${a.tipo || 'AGE'} · Assembleia em ${a.data} · Prazo para voto a distância: ${a.prazo}${a.mudou ? ` <span class="rel-tag rel-insuf sm">${icon('refresh', 12)}Atualizado em ${a.mudou.em} · antes: ${a.mudou.antes}</span>` : ''}</p></div>
      <span class="rel-tag ${voto ? 'rel-direta' : a.aberta ? 'rel-indireta' : 'rel-sem'}">${voto ? 'Voto registrado' : a.aberta ? 'Aberta para voto' : esc(a.estado)}</span></div>
    ${voto
      ? `<ul class="calc-list" style="margin-top:8px">${a.pauta.map((p, j) => `<li><span>${esc(p)}</span><strong>${voto[j]}</strong></li>`).join('')}</ul><div class="btn-row"><button type="button" class="btn btn-link btn-sm" data-action="voto-refazer" data-i="${i}">Editar voto</button></div>`
      : pode
        ? `<form class="stack-sm" style="margin-top:12px" data-form="voto" data-i="${i}">${a.pauta.map((p, j) => `<fieldset class="vote-q"><legend>${esc(p)}</legend><div class="btn-row" style="margin-top:4px">${['Aprovar', 'Rejeitar', 'Abster-se'].map((o) => `<label class="radio"><input type="radio" name="q${j}" value="${o}" required> ${o}</label>`).join('')}</div></fieldset>`).join('')}
           <div><button class="btn btn-primary" type="submit">Enviar voto</button></div></form>`
        : `<p class="muted" style="margin-top:8px">${a.aberta ? `Você não tem ${esc(ativo(a.code).name)} na carteira, então não pode votar nesta assembleia.` : 'O prazo para voto a distância ainda não abriu.'}</p>`}
    <button type="button" class="expand-btn" data-action="disclose" aria-expanded="false" aria-controls="${k}">Ver pauta e documentos ${icon('chevronDown', 14)}</button>
    <div id="${k}" hidden style="margin-top:8px"><h4 class="h3">Pauta</h4><ul style="list-style:disc;padding-left:20px">${a.pauta.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
      <h4 class="h3" style="margin-top:8px">Documentos</h4><ul style="list-style:disc;padding-left:20px">${a.docs.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>
      <p class="meta" style="margin-top:8px">Pode votar quem tinha o ativo na data de corte definida no edital.</p></div></section>`;
}
CHANGES['voto-tipo'] = (el) => { ui.voto.tipo = el.value; rerender('#vt-tipo'); };
ACTIONS['voto-filtro'] = (el) => { ui.voto.filtro = el.dataset.k; rerender(`[data-action="voto-filtro"][data-k="${el.dataset.k}"]`); };

/* ---------- CALC de Renda Fixa (cálculo de demonstração com taxas aproximadas) ---------- */
const FERIADOS = new Set(['2025-01-01', '2025-03-03', '2025-03-04', '2025-04-18', '2025-04-21', '2025-05-01', '2025-06-19', '2025-11-20', '2025-12-25',
  '2026-01-01', '2026-02-16', '2026-02-17', '2026-04-03', '2026-04-21', '2026-05-01', '2026-06-04', '2026-09-07', '2026-10-12', '2026-11-02', '2026-11-20', '2026-12-25']);
// Meta Selic (vigente a partir da data). CDI aproximado = Selic − 0,10 p.p.
const SELIC = [['2024-12-12', 12.25], ['2025-01-30', 13.25], ['2025-03-20', 14.25], ['2025-05-08', 14.75], ['2025-06-19', 15.00],
  ['2026-03-19', 14.75], ['2026-05-07', 14.50], ['2026-06-18', 14.25], ['2026-07-30', 14.00], ['2026-09-17', 13.75]];
const CALC_MIN = '2025-01-02', CALC_MAX = '2026-11-24';
const isoDia = (d) => d.toISOString().slice(0, 10);
const diaUtil = (d) => d.getUTCDay() % 6 !== 0 && !FERIADOS.has(isoDia(d));
const cdiEm = (iso) => { let t = SELIC[0][1]; SELIC.forEach(([de, v]) => { if (iso >= de) t = v; }); return t - 0.10; };
function calcularDI(ini, fim, pct, valor) {
  let fator = 1, du = 0;
  for (let d = new Date(ini + 'T00:00:00Z'); isoDia(d) < fim; d.setUTCDate(d.getUTCDate() + 1)) {
    if (!diaUtil(d)) continue;
    const diario = Math.pow(1 + cdiEm(isoDia(d)) / 100, 1 / 252) - 1;
    fator *= 1 + diario * (pct / 100); du += 1;
  }
  return { du, fator, taxa: (fator - 1) * 100, final: valor * fator };
}
const TITULOS = {
  TSELIC29: { nome: 'Tesouro Selic 2029', taxa: 'Selic + 0,0612% a.a.', vna: 16405.10, duration: 2.27 },
  TIPCA35: { nome: 'Tesouro IPCA+ 2035', taxa: 'IPCA + 6,82% a.a.', vna: 4512.34, duration: 6.94 },
  TPRE29: { nome: 'Tesouro Prefixado 2029', taxa: '13,41% a.a.', vna: 1000.00, duration: 2.61, pu: 702.85 },
};
const CREDITO = {
  debentures: { LUMI26: ['Lumina Energia · 1ª série', 'IPCA + 7,10% a.a.', 1043.27], PATR27: ['Pátria Logística · 2ª série', 'CDI + 1,35% a.a.', 1012.80] },
  cra: { CRADEMO1: ['CRA Ceres Agro · série única', 'CDI + 0,90% a.a.', 1005.44] },
  cri: { CRIDEMO1: ['CRI Galpões Demo · 1ª série', 'IPCA + 6,40% a.a.', 1021.19] },
};
function servicoCalc() {
  const C = ui.calc;
  const nf8 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 8, maximumFractionDigits: 8 });
  const nf4 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  let form, res = '';
  if (C.aba === 'di') {
    form = `<form class="calc-form" data-form="calc-di">
      <div class="field"><label for="cd-ini">Data inicial</label><input id="cd-ini" name="ini" type="date" class="input" min="${CALC_MIN}" max="${CALC_MAX}" value="${C.di.ini}" required></div>
      <div class="field"><label for="cd-fim">Data final</label><input id="cd-fim" name="fim" type="date" class="input" min="${CALC_MIN}" max="${CALC_MAX}" value="${C.di.fim}" required></div>
      <div class="field"><label for="cd-pct">Percentual do DI</label><input id="cd-pct" name="pct" type="number" class="input" min="1" max="300" step="0.01" value="${C.di.pct}" required></div>
      <div class="field"><label for="cd-val">Valor (R$)</label><input id="cd-val" name="valor" type="number" class="input" min="0.01" step="0.01" value="${C.di.valor}" required></div>
      <button class="btn btn-yellow" type="submit">Calcular</button></form>
      <p class="meta" style="margin-top:6px">${icon('info', 14)} Período disponível: ${isoParaBr(CALC_MIN)} até ${isoParaBr(CALC_MAX)}.</p>`;
    if (C.di.res) {
      const r = C.di.res;
      res = `<section class="calc-res" aria-live="polite"><h3 class="h3">Resultado</h3><dl class="dl">
        <div><dt>Dias úteis</dt><dd>${r.du}</dd></div><div><dt>Fator DI acumulado</dt><dd>${nf8.format(r.fator)}</dd></div>
        <div><dt>Taxa no período</dt><dd>${nf4.format(r.taxa)}%</dd></div><div><dt>Valor corrigido</dt><dd>${fmt.brl(r.final)}</dd></div></dl>
        <p class="meta" style="margin-top:8px">${nf2.format(r.pct)}% do DI de ${isoParaBr(r.ini)} a ${isoParaBr(r.fim)} (data final não entra na conta). Taxas DI aproximadas.</p></section>`;
    }
  } else if (C.aba === 'titulos') {
    form = `<form class="calc-form" data-form="calc-tit">
      <div class="field"><label for="ct-tit">Título público</label><select id="ct-tit" name="tit" class="select">${Object.entries(TITULOS).map(([k, t]) => `<option value="${k}" ${C.tit.code === k ? 'selected' : ''}>${t.nome}</option>`).join('')}</select></div>
      <div class="field"><label for="ct-data">Data de referência</label><input id="ct-data" name="data" type="date" class="input" min="2026-01-02" max="${CALC_MAX}" value="${C.tit.data}" required></div>
      <button class="btn btn-yellow" type="submit">Calcular</button></form>`;
    if (C.tit.res) {
      const r = C.tit.res;
      res = `<section class="calc-res" aria-live="polite"><h3 class="h3">${esc(r.nome)} · ${isoParaBr(r.data)}</h3><dl class="dl">
        <div><dt>Preço unitário (PU)</dt><dd>${fmt.brl(r.pu)}</dd></div><div><dt>Taxa</dt><dd>${esc(r.taxa)}</dd></div>
        <div><dt>Valor nominal atualizado (VNA)</dt><dd>${fmt.brl(r.vna)}</dd></div><div><dt>Duration</dt><dd>${nf2.format(r.duration)} anos</dd></div></dl>
        </section>`;
    }
  } else {
    const base = CREDITO[C.aba];
    form = `<p class="note neutral" style="margin-bottom:12px">${icon('info', 18)}<span>No portal, a calculadora de debêntures, CRA e CRI é um serviço segregado, contratado à parte. Códigos disponíveis: ${Object.keys(base).join(', ')}.</span></p>
      <form class="calc-form" data-form="calc-cred">
      <div class="field"><label for="cc-cod">Código do ativo</label><input id="cc-cod" name="cod" class="input" value="${esc(C.cred.cod || Object.keys(base)[0])}" required></div>
      <div class="field"><label for="cc-data">Data de referência</label><input id="cc-data" name="data" type="date" class="input" min="2026-01-02" max="${CALC_MAX}" value="${C.cred.data}" required></div>
      <button class="btn btn-yellow" type="submit">Calcular</button></form>`;
    if (C.cred.res && C.cred.res.aba === C.aba) {
      const r = C.cred.res;
      res = r.erro ? `<p class="note warn calc-res">${icon('alert', 18)}<span>Código “${esc(r.cod)}” não encontrado. Confira o código ou tente ${Object.keys(base).join(', ')}.</span></p>`
        : `<section class="calc-res" aria-live="polite"><h3 class="h3">${esc(r.nome)} · ${esc(r.cod)}</h3><dl class="dl">
          <div><dt>PU par</dt><dd>${fmt.brl(r.pu)}</dd></div><div><dt>Remuneração</dt><dd>${esc(r.taxa)}</dd></div><div><dt>Data</dt><dd>${isoParaBr(r.data)}</dd></div></dl>
          </section>`;
    }
  }
  return `<section class="calc-hero"><h2 class="h1">CALC – Calculadora de Renda Fixa <span class="beta">BETA</span></h2>
      <p style="margin-top:8px">Use a CALC de Renda Fixa da B3 para cálculos de debêntures, títulos públicos, CRA (Certificados de Recebíveis do Agronegócio), CRI (Certificados de Recebíveis Imobiliários) e DI (Depósito Interfinanceiro).</p>
      <p class="meta" style="margin-top:6px">Cobre 90% das debêntures e 100% dos títulos públicos, além dos principais CRAs e CRIs negociados no mercado secundário.</p>
      <div class="chips-filter" role="group" aria-label="Tipo de cálculo" style="margin-top:16px">${[['di', 'DI'], ['titulos', 'Títulos públicos'], ['debentures', 'Debêntures'], ['cra', 'CRA'], ['cri', 'CRI']].map(([k, t]) => `<button type="button" class="chip-btn" data-action="calc-aba" data-k="${k}" aria-pressed="${C.aba === k}">${t}</button>`).join('')}</div>
      ${form}${res}
    </section>
    <section class="calc-dif"><h2 class="h2" style="text-align:center">Diferenciais</h2><div class="dif-grid">${[
      ['Precisão', 'Preparada para o volume de consultas que você precisar, com 8 casas decimais nos cálculos.'],
      ['Calculadora de CDI', 'Calcula o fator acumulado entre duas datas.'],
      ['Desenvolvida pela B3', 'Segurança e eficiência em cada cálculo.'],
      ['Títulos públicos', 'Preços unitários (PU), taxas, valor nominal atualizado (VNA) e duration.'],
      ['Debêntures, CRA e CRI', 'Serviço segregado, contratado à parte, com pacotes conforme o volume de uso.'],
    ].map(([t, d]) => `<div class="card dif-card"><h3 class="h3">${t}</h3><p class="meta" style="margin-top:6px">${d}</p></div>`).join('')}</div></section>
    <section class="card"><h2 class="h2">Tem alguma dúvida?</h2>${faq('faq-calc', [
      ['O que é a CALC B3?', 'É a calculadora de renda fixa da B3, com cálculos de DI, títulos públicos, debêntures, CRA e CRI.'],
      ['O que são a taxa DI e o CDI?', 'A taxa DI é a média das operações de um dia entre bancos. O CDI acompanha essa taxa e serve de referência para muitos investimentos de renda fixa.'],
      ['Quais tipos de cálculo essa calculadora realiza?', 'Fator DI acumulado entre datas, preços e taxas de títulos públicos e, como serviço à parte, de debêntures, CRA e CRI.'],
      ['O que significa o “percentual”?', 'É quanto do DI o investimento rende. Um CDB de 110% do CDI rende 1,1 vez a taxa DI de cada dia útil.'],
      ['A calculadora considera feriados nacionais nos dias úteis?', 'Sim. Sábados, domingos e feriados nacionais não entram na conta.'],
      ['Os valores apresentados são descontados de impostos?', 'Não. Os valores são brutos, antes de impostos e taxas.'],
    ])}</section>`;
}
ACTIONS['calc-aba'] = (el) => { ui.calc.aba = el.dataset.k; rerender(`[data-action="calc-aba"][data-k="${el.dataset.k}"]`); };
SUBMITS['calc-di'] = (form) => {
  const ini = form.ini.value, fim = form.fim.value, pct = +form.pct.value, valor = +form.valor.value;
  if (ini < CALC_MIN || fim > CALC_MAX) { toast(`Escolha datas entre ${isoParaBr(CALC_MIN)} e ${isoParaBr(CALC_MAX)}.`); return; }
  if (ini >= fim) { toast('A data inicial precisa ser antes da data final.'); form.ini.focus(); return; }
  ui.calc.di = { ini, fim, pct, valor, res: { ...calcularDI(ini, fim, pct, valor), ini, fim, pct } };
  rerender('.calc-res h3');
};
SUBMITS['calc-tit'] = (form) => {
  const t = TITULOS[form.tit.value], data = form.data.value;
  const du = calcularDI(data, CALC_MAX, 100, 1).du; // aproxima o PU de datas anteriores descontando o DI
  const pu24 = form.tit.value === 'TPRE29' ? t.pu : ativo(form.tit.value).preco;
  ui.calc.tit = { code: form.tit.value, data, res: { nome: t.nome, data, taxa: t.taxa, duration: t.duration, vna: t.vna, pu: pu24 / Math.pow(1.1365, du / 252) } };
  rerender('.calc-res h3');
};
SUBMITS['calc-cred'] = (form) => {
  const cod = form.cod.value.trim().toUpperCase(), x = CREDITO[ui.calc.aba][cod];
  ui.calc.cred = { cod, data: form.data.value, res: x ? { aba: ui.calc.aba, cod, nome: x[0], taxa: x[1], pu: x[2], data: form.data.value } : { aba: ui.calc.aba, cod, erro: true } };
  rerender(x ? '.calc-res h3' : '#cc-cod');
};

/* ---------- Meu acesso ---------- */
const SECOES_ACESSO = [
  ['dados', 'Dados pessoais'], ['email', 'E-mail principal'],
  ['seguranca', 'Segurança', [['senha', 'Alterar senha'], ['apps', 'Aplicativos e sites'], ['historico', 'Histórico e solicitações'], ['validacao', 'Validação de e-mail'], ['desativar', 'Desativar meu acesso']]],
  ['notificacoes', 'Central de notificações', [['notificacoes', 'Notificações'], ['config', 'Configuração de notificações']]],
];
const CONTAS_INVEST = {
  principal: [
    { inst: 'Corretora A', codigo: '0001', conta: '123456-7', desde: 'mar 2019', email: 'investidor.demo@corretora-a.test', principal: true },
    { inst: 'Corretora B', codigo: '0002', conta: '987654-3', desde: 'ago 2022', email: 'investidor.demo@corretora-b.test' },
  ],
  vazia: [{ inst: 'Corretora A', codigo: '0001', conta: '555123-0', desde: 'nov 2026', email: 'nova.demo@corretora-a.test', principal: true }],
};
function viewPerfil(route) {
  const c = conta(), sec = route.q.get('secao') || 'dados';
  const contas = CONTAS_INVEST[state.session.conta] || [];
  const principalIdx = Math.max(0, contas.findIndex((x) => x.email === ((state.prefs[state.session.conta] || {}).emailPrincipal || contas.find((y) => y.principal)?.email)));
  const nav = `<nav class="acesso-nav" aria-label="Meu acesso">${SECOES_ACESSO.map(([k, t, sub]) => sub
    ? `<div class="acesso-grupo"><p class="acesso-g">${t}</p>${sub.map(([sk, st]) => `<a href="#/perfil?secao=${sk}" class="acesso-link sub" ${sk === sec ? 'aria-current="page"' : ''}>${st}</a>`).join('')}</div>`
    : `<a href="#/perfil?secao=${k}" class="acesso-link" ${k === sec ? 'aria-current="page"' : ''}>${t}</a>`).join('')}</nav>`;
  const importante = `<div class="note neutral" style="margin-top:16px">${icon('info', 18)}<span><strong>Importante!</strong> Para alterar dados cadastrais, como nome e e-mail, fale com cada corretora ou instituição financeira. Não é possível mudar pelos canais da B3. Depois da atualização, a nova informação aparece aqui automaticamente.</span></div>`;
  let corpo;
  if (sec === 'dados') {
    corpo = `<h2 class="h2">Informações pessoais</h2><dl class="dl" style="margin-top:12px"><div><dt>Nome completo</dt><dd>${esc(c.nome)}</dd></div><div><dt>CPF</dt><dd>${c.cpf}</dd></div></dl>
      <h3 class="label-up">Contas de investimento</h3>
      <div class="faq">${contas.map((x, i) => `<div class="faq-item"><button type="button" class="faq-q" data-action="disclose" aria-expanded="false" aria-controls="ct-${i}">${esc(x.inst)} · conta ${x.conta}${icon('plus', 18)}</button>
        <div class="faq-a" id="ct-${i}" hidden><dl class="dl"><div><dt>Instituição</dt><dd>${esc(x.inst)} (código ${x.codigo})</dd></div><div><dt>Conta</dt><dd>${x.conta}</dd></div><div><dt>Cliente desde</dt><dd>${x.desde}</dd></div><div><dt>E-mail nesta instituição</dt><dd>${esc(x.email)}</dd></div><div><dt>Situação</dt><dd>Ativa</dd></div></dl></div></div>`).join('')}</div>${importante}`;
  } else if (sec === 'email') {
    corpo = `<h2 class="h2">E-mail principal</h2><p class="muted" style="margin-top:4px">É para onde a Área do Investidor manda avisos e códigos. Escolha entre os e-mails cadastrados nas suas instituições.</p>
      <fieldset class="metodos" style="margin-top:12px"><legend class="sr-only">E-mail principal</legend>${contas.map((x, i) => `<label class="metodo ${i === principalIdx ? 'is-on' : ''}"><input type="radio" name="emailp" value="${esc(x.email)}" data-change="email-principal" ${i === principalIdx ? 'checked' : ''}><span><strong>${esc(x.email)}</strong><br><span class="meta">Cadastrado na ${esc(x.inst)}</span></span></label>`).join('')}</fieldset>${importante}`;
  } else if (sec === 'senha') {
    corpo = `<h2 class="h2">Alterar senha</h2>
      <div class="stack-sm" style="margin-top:12px;max-width:420px">${campoDemo('as-atual', 'Senha atual', LOGIN_DEMO.senha, { tipo: 'password', dica: 'Preenchida automaticamente.' })}${campoDemo('as-nova', 'Nova senha', 'novasenha', { tipo: 'password', dica: 'Preenchida automaticamente.' })}
      <div class="btn-row"><button type="button" class="btn btn-primary" data-action="senha-alterar">Alterar senha</button></div></div>`;
  } else if (sec === 'apps') {
    const apps = [['App B3 (celular)', 'Acesso à carteira pelo aplicativo', 'Autorizado em 10 jan 2026'], ...(ui.revar.vinculado ? [['Calculadora Revar · Receita Federal', 'Compartilhamento de operações para cálculo de IR', 'Autorizado hoje']] : [])];
    corpo = `<h2 class="h2">Aplicativos e sites</h2><p class="muted" style="margin-top:4px">Serviços que você autorizou a acessar dados da sua conta.</p>
      <ul class="calc-list" style="margin-top:12px">${apps.filter((a) => !ui.appsRevogados.includes(a[0])).map(([n, d, q]) => `<li><span><strong>${esc(n)}</strong><br><span class="meta">${d} · ${q}</span></span><button type="button" class="btn btn-link btn-sm" data-action="app-revogar" data-n="${esc(n)}">Revogar acesso</button></li>`).join('') || '<li class="muted">Nenhum aplicativo autorizado.</li>'}</ul>`;
  } else if (sec === 'historico') {
    corpo = `<h2 class="h2">Histórico e solicitações</h2><div class="table-wrap" style="margin-top:12px"><table><caption class="sr-only">Últimos acessos</caption>
      <thead><tr><th scope="col">Data</th><th scope="col">Evento</th><th scope="col" class="col-sec">Dispositivo</th><th scope="col">Resultado</th></tr></thead>
      <tbody>${[['24/11/2026 18:02', 'Acesso com verificação em duas etapas', 'Navegador · computador', 'Sucesso'], ['22/11/2026 09:15', 'Acesso pelo App B3', 'Celular', 'Sucesso'], ['18/11/2026 21:40', 'Tentativa de acesso com senha incorreta', 'Navegador · computador', 'Bloqueado'], ['03/11/2026 14:10', 'Alteração do e-mail principal', 'Navegador · computador', 'Concluída']].map((r) => `<tr><td class="nowrap">${r[0]}</td><td>${r[1]}</td><td class="col-sec">${r[2]}</td><td><span class="rel-tag ${r[3] === 'Bloqueado' ? 'rel-insuf' : 'rel-direta'}">${r[3]}</span></td></tr>`).join('')}</tbody></table></div>
      <p class="meta" style="margin-top:8px">Não reconhece um acesso? Altere sua senha e fale com o atendimento.</p>
      <p class="note" style="margin-top:16px">${icon('clock', 18)}<span>Por segurança, cada acesso dura no máximo 1 hora.${horaFimSessao() ? ` Este acesso termina às ${horaFimSessao()}; depois disso, é só entrar novamente.` : ''}</span></p>`;
  } else if (sec === 'validacao') {
    corpo = `<h2 class="h2">Validação de e-mail</h2><div class="ok-box" style="margin-top:12px"><p class="imp-level-text">${icon('check', 22)} E-mail validado</p><p class="meta">${esc(contas[principalIdx]?.email || c.email)} · validado em 12/03/2025</p></div>
      <div class="btn-row"><button type="button" class="btn btn-outline" data-action="validacao-reenviar">Reenviar e-mail de validação</button></div>`;
  } else if (sec === 'desativar') {
    corpo = `<h2 class="h2">Desativar meu acesso</h2><p style="margin-top:8px">Ao desativar, você deixa de entrar na Área do Investidor com este CPF até criar um novo acesso. Seus investimentos não mudam: eles continuam nas corretoras.</p>
      <div class="btn-row"><button type="button" class="btn btn-outline" data-action="disclose" aria-expanded="false" aria-controls="desat-conf">Desativar meu acesso</button></div>
      <div id="desat-conf" hidden class="note warn" style="margin-top:8px">${icon('alert', 18)}<span>Para confirmar, use a senha e o código da verificação em duas etapas.</span></div>`;
  } else if (sec === 'notificacoes') {
    corpo = notificacoesListaHtml();
  } else {
    corpo = configNotificacoesHtml();
  }
  return {
    title: 'Meu acesso', nav: null, crumbs: [['Meu acesso']],
    html: `<div class="page-head"><div><h1 class="h1">Meu acesso</h1><p class="meta lead">${esc(c.nome)}</p></div></div>
      <div class="acesso-layout">${nav}<section class="card acesso-corpo">${corpo}</section></div>`,
  };
}
CHANGES['email-principal'] = (el) => { const k = state.session.conta; state.prefs[k] = { ...(state.prefs[k] || {}), emailPrincipal: el.value }; save(); toast('E-mail principal atualizado.'); rerender('[data-change="email-principal"]:checked'); };
ACTIONS['senha-alterar'] = () => toast('Senha alterada.');
ACTIONS['app-revogar'] = (el) => { ui.appsRevogados.push(el.dataset.n); if (el.dataset.n.startsWith('Calculadora Revar')) ui.revar = { vinculado: false, tela: 'inicio' }; toast('Acesso revogado.'); rerender('#conteudo h2'); };
ACTIONS['validacao-reenviar'] = () => toast('E-mail de validação reenviado.');

