/* Assistente de ajuda (canto inferior direito). Funciona sem servidor: reconhece a intenção da pergunta por palavras-chave
   e responde com dados da conta demo e links para a tela certa. Não dá recomendação de investimento. */

const chat = { aberto: false, msgs: [] };
const SUGESTOES_CHAT = ['Quero declarar meu IR', 'Ver o que eu recebi', 'Conferir minha compra', 'Quanto tenho na carteira?', 'Quanto rendeu minha carteira?', 'Por que a Vale caiu?', 'Como compro uma ação?'];

const lk = (href, texto) => `<a href="#${href}" data-action="chat-link">${esc(texto)}</a>`;
const exigeLogin = (oque) => `Para ver ${oque}, entre com a conta demo: ${lk('/acesso', 'Entrar')}.`;

function acharAtivoNaPergunta(q) {
  const t = norm(q);
  return ATIVOS.find((a) => t.includes(norm(a.code)) || t.includes(norm(a.name)) || (a.name.split(' ')[0].length > 3 && t.includes(norm(a.name.split(' ')[0]))));
}

const INTENCOES = [
  { k: ['recomenda', 'devo comprar', 'devo vender', 'compensa', 'o que comprar', 'vale a pena', 'qual acao', 'melhor investimento'], r: () => 'Não posso recomendar investimentos. Posso explicar termos, mostrar seus dados e onde encontrar informações. Para recomendação, procure um profissional certificado.' },
  { k: ['declarar', 'declaracao', 'imposto de renda', 'ir 2027', ' irpf'], r: () => `O guia ${lk('/servicos/ir/guia', 'Declarar meu imposto de renda')} mostra o passo a passo: informe da corretora, relatório consolidado, proventos do ano, bens e direitos e a Revar para o imposto mensal.` },
  { k: ['o que recebi', 'o que eu recebi', 'quanto recebi', 'recebi este ano'], r: () => { if (!state.session) return exigeLogin('o que você recebeu'); ui.prov.periodo = '2026'; const t = provRecebidos().filter((p) => p.data.endsWith('/2026')).reduce((s, p) => s + p.valor, 0); return `Em 2026 você recebeu ${state.hide ? 'um valor oculto' : fmt.brl(t)} em proventos. ${lk('/proventos/recebidos', 'Ver recebidos de 2026')}`; } },
  { k: ['minha compra', 'conferir compra', 'conferir minha compra', 'acompanhar compra', 'ordem'], r: () => `Em ${lk('/carteira/compras', 'Acompanhar compras')} você vê cada compra da ordem registrada até a carteira (liquidação em D+2, dois dias úteis).` },
  { k: ['rendeu', 'rentabilidade', 'rendimento', 'cdi', 'comparar'], r: () => { if (!state.session) return exigeLogin('a rentabilidade'); const ag = agregar(serieCarteira()); return `Em 12 meses, sua carteira rendeu cerca de ${fmt.pct(ag.r * 100)} (aproximado, sem contar aportes)${state.hide ? '' : `, ou ${fmt.sbrl(ag.ganho)} entre mercado e proventos`}. Compare com CDI e Ibovespa em ${lk('/carteira', 'Visão geral › Rentabilidade comparada')}.`; } },
  { k: ['preco medio', 'lucro', 'prejuizo', 'resultado'], r: () => `O preço médio e o resultado de cada ativo ficam em ${lk('/carteira', 'Produtos da sua carteira')} e na ficha de cada ativo. Não incluem proventos, taxas e impostos.` },
  { k: ['retrospectiva', 'meu ano', 'resumo do ano'], r: () => `Sua retrospectiva está em ${lk('/carteira/retrospectiva', 'Sua carteira em 2026')}.` },
  { k: ['alerta', 'aviso', 'notificac'], r: () => `Escolha quais avisos receber, por tipo e por ativo, em ${lk('/perfil?secao=config', 'Meu acesso › Configuração de notificações')}. Para acompanhar uma empresa, use “Receber alertas” na ficha dela.` },
  { k: ['data com', 'direito ao dividendo', 'direito ao provento'], r: () => `Data com é o último dia para ter o ativo e receber o provento anunciado. As próximas ficam em ${lk('/proventos', 'Proventos › Próximas datas com')}.` },
  { k: ['oi', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'ajuda'], r: () => 'Oi! Sou o assistente da Área do Investidor. Posso explicar termos, mostrar onde fica cada coisa e resumir sua carteira demo. O que você quer saber?' },
  { k: ['por que', 'porque', 'caiu', 'subiu', 'mudou', 'variou'], precisaAtivo: true, r: (q, a) => {
    const m = (MOTIVOS[a.code] || {}).dia;
    const pct = varPct(a), verbo = pct > 0.005 ? `subiu ${nf2.format(pct)}%` : pct < -0.005 ? `caiu ${nf2.format(-pct)}%` : 'ficou estável';
    return `${esc(a.name)} (${a.code}) ${verbo} desde o último fechamento. ${m ? `Na empresa: ${esc(m[0])} No mercado: ${esc(m[1])}` : 'Não há notícia específica sobre ela no período.'} São possíveis motivos, não uma certeza. ${lk('/ativos/' + a.code, 'Ver ' + a.name)}`;
  } },
  { k: ['quanto tenho', 'valor da carteira', 'meu patrimonio', 'patrimonio', 'saldo', 'minha carteira', 'quanto vale'], r: () => {
    if (!state.session) return exigeLogin('o valor da sua carteira');
    const w = carteira();
    if (w.vazia) return `Sua carteira demo ainda não tem investimentos. ${lk('/mercado', 'Comprar uma ação na demo')}`;
    return `Sua carteira vale ${state.hide ? 'um valor oculto (você ativou “Ocultar valores”)' : fmt.brl(w.atual)} em ${REF.atual}, ${w.delta >= 0 ? 'alta' : 'queda'} de ${state.hide ? '••••' : fmt.sbrl(w.delta)} desde a última visita. ${lk('/carteira', 'Ver carteira')}`;
  } },
  { k: ['provento', 'dividendo', 'jcp', 'juros sobre capital', 'rendimento', 'recebo', 'receber'], r: () => {
    if (!state.session) return `Proventos são valores que a empresa paga a quem tem a ação, como dividendos e juros sobre capital próprio. ${exigeLogin('os seus')}`;
    const p = provAReceber().find((x) => x.dia);
    return p ? `O próximo pagamento previsto é ${p.tipo.toLowerCase()} de ${esc(ativo(p.code).name)} em ${p.data}${state.hide ? '' : `, de ${fmt.brl(p.valor)}`}. ${lk('/proventos/pagamento/' + p.id, 'Ver pagamento')} · ${lk('/proventos', 'Todos os proventos')}`
      : `Você não tem proventos previstos com data. ${lk('/proventos/radar', 'Ver o Radar de anúncios')}`;
  } },
  { k: ['comprar', 'compra', 'vender', 'venda', 'investir em', 'como compro'], r: () => `A B3 não compra nem vende ativos: a ordem é enviada pela sua corretora. Na página de cada ação, o botão “Comprar” mostra as corretoras. No protótipo, “Comprar na demo” simula a compra para você testar. ${lk('/mercado', 'Ir para o mercado')}` },
  { k: ['imposto', 'ir ', 'irpf', 'declaracao', 'informe', 'darf', 'revar'], r: () => `Para o imposto mensal sobre ações, use a calculadora Revar da Receita Federal (${lk('/servicos/ir', 'Calculadoras de IR')}). Para a declaração anual, use o informe de rendimentos da sua corretora; o ${lk('/servicos/relatorios', 'Relatório consolidado')} ajuda a conferir.` },
  { k: ['extrato', 'movimentacao', 'negociacao', 'nota de corretagem'], r: () => `Os extratos ficam em ${lk('/extratos/movimentacao', 'Extratos')}: Movimentação, Negociação, Eventos e Ofertas públicas, com filtro de período e download em PDF ou Excel.` },
  { k: ['portabilidade', 'transferir', 'trocar de corretora', 'mudar de corretora'], r: () => `Para levar investimentos de uma instituição para outra, use ${lk('/portabilidade', 'Portabilidade')}: origem, destino, seleção e revisão. Depois, acompanhe em “Minhas solicitações”.` },
  { k: ['voto', 'assembleia', 'votar'], r: () => `As assembleias dos seus ativos ficam em ${lk('/servicos/voto?aba=aberto', 'Voto a distância › Assembleias em aberto')}. Você pode votar até o prazo e editar o voto.` },
  { k: ['noticia', 'impacto', 'afeta'], r: () => `Em ${lk('/noticias?aba=carteira', 'Notícias › Minha carteira')} aparecem as notícias ligadas aos seus ativos. O botão “Impacto na carteira” explica a notícia e o efeito possível nos seus investimentos.` },
  { k: ['senha', 'login', 'entrar', 'acesso', 'duas etapas', 'codigo'], r: () => `O acesso usa CPF, senha e verificação em duas etapas. Se esqueceu a senha, use “Esqueci minha senha” na tela de acesso. Segurança e aplicativos autorizados ficam em ${lk('/perfil?secao=senha', 'Meu acesso › Segurança')}.` },
  { k: ['email errado', 'mudar email', 'trocar email', 'cadastro', 'endereco', 'telefone', 'nome errado'], r: () => `Dados cadastrais vêm das corretoras: para mudar nome, e-mail ou telefone, fale com cada instituição. Depois, a informação nova aparece em ${lk('/perfil', 'Meu acesso')} automaticamente.` },
  { k: ['nao aparece', 'nao apareceu', 'sumiu', 'liquidacao', 'd+2'], r: () => `Em ações à vista, a liquidação costuma ocorrer em D+2 (dois dias úteis). A posição aparece depois da atualização seguinte. Se o prazo passou, confirme com a corretora.` },
  { k: ['garantia', 'bloquead'], r: () => `Garantias são ativos bloqueados para cobrir operações, como opções ou aluguel de ações. Eles continuam seus. Veja em ${lk('/carteira/investimentos/garantias', 'Investimentos › Garantias')}.` },
  { k: ['cdi', 'selic', 'renda fixa', 'tesouro', 'cdb', 'lci', 'calc'], r: () => `A Selic é a taxa básica de juros (13,75% ao ano) e o CDI acompanha a Selic. Tesouro, CDB e LCI aparecem na sua carteira em Renda fixa. Para calcular o rendimento pelo CDI, use a ${lk('/servicos/calc', 'CALC de Renda Fixa')}.` },
  { k: ['fii', 'fundo imobiliario', 'etf'], r: () => `FIIs são fundos que investem em imóveis e costumam pagar rendimentos mensais; ETFs copiam um índice, como o Ibovespa. Os dois aparecem em ${lk('/carteira', 'Produtos da sua carteira')}.` },
  { k: ['atendente', 'humano', 'falar com', 'atendimento', 'reclamacao'], r: () => `Para falar com uma pessoa, use os canais oficiais de atendimento (${lk('/info/atendimento', 'Atendimento')}).` },
];

function responder(pergunta) {
  const q = ' ' + norm(pergunta) + ' ';
  const a = acharAtivoNaPergunta(pergunta);
  for (const it of INTENCOES) {
    if (it.precisaAtivo && !a) continue;
    if (it.k.some((k) => q.includes(norm(k)))) return it.r(pergunta, a);
  }
  if (a) return `${esc(a.name)} (${a.code}): ${a.classe === 'Ações' ? `preço de ${fmt.brl(a.preco)}, ${varPct(a) >= 0 ? 'alta' : 'queda'} de ${nf2.format(Math.abs(varPct(a)))}% no dia` : `${a.produto}, ${a.indexador || a.tipo}`}. ${lk('/ativos/' + a.code, 'Ver detalhes')}`;
  return 'Não entendi bem. Tente perguntar de outro jeito ou escolha uma das sugestões abaixo.';
}

function renderChat() {
  let root = document.getElementById('chat-root');
  if (!root) { root = document.createElement('div'); root.id = 'chat-root'; document.body.appendChild(root); }
  if (!chat.aberto) {
    root.innerHTML = `<button type="button" class="chat-fab" data-action="chat-abrir" aria-label="Abrir assistente de ajuda">${icon('message', 24)}<span>Ajuda</span></button>`;
    return;
  }
  if (!chat.msgs.length) chat.msgs.push({ de: 'bot', html: 'Oi! Sou o assistente da Área do Investidor. Como posso ajudar?' });
  root.innerHTML = `<section class="chat-box" role="dialog" aria-label="Assistente de ajuda" aria-modal="false">
    <header class="chat-head"><div><strong>Assistente</strong><span class="meta">Respostas automáticas</span></div>
      <button type="button" class="icon-btn" data-action="chat-fechar" aria-label="Fechar assistente">${icon('x', 20)}</button></header>
    <div class="chat-log" role="log" aria-live="polite">${chat.msgs.map((m) => `<p class="chat-msg ${m.de}">${m.html}</p>`).join('')}</div>
    <div class="chat-sug">${SUGESTOES_CHAT.map((s) => `<button type="button" class="chip-btn" data-action="chat-sug" data-q="${esc(s)}">${esc(s)}</button>`).join('')}</div>
    <form class="chat-form" data-form="chat"><label for="chat-in" class="sr-only">Sua pergunta</label>
      <input id="chat-in" class="input" name="q" autocomplete="off" placeholder="Digite sua dúvida" maxlength="200"><button class="btn btn-primary" type="submit" aria-label="Enviar">${icon('arrowRight', 18)}</button></form>
    <p class="chat-aviso">Não digite CPF, senha ou dados pessoais. O assistente não recomenda investimentos.</p>
  </section>`;
  const log = root.querySelector('.chat-log'); log.scrollTop = log.scrollHeight;
}
function perguntar(texto) {
  const t = String(texto || '').trim();
  if (!t) return;
  chat.msgs.push({ de: 'eu', html: esc(t) });
  chat.msgs.push({ de: 'bot', html: responder(t) });
  chat.msgs = chat.msgs.slice(-30);
  renderChat();
  const inp = document.getElementById('chat-in'); if (inp) inp.focus();
}
ACTIONS['chat-abrir'] = () => { chat.aberto = true; renderChat(); document.getElementById('chat-in').focus(); };
ACTIONS['chat-fechar'] = () => { chat.aberto = false; renderChat(); document.querySelector('.chat-fab').focus(); };
ACTIONS['chat-sug'] = (el) => perguntar(el.dataset.q);
ACTIONS['chat-link'] = (el, ev) => { ev.preventDefault(); go(el.getAttribute('href').slice(1)); if (matchMedia('(max-width: 767px)').matches) { chat.aberto = false; renderChat(); } };
SUBMITS.chat = (form) => { const q = form.q.value; form.q.value = ''; perguntar(q); };
document.addEventListener('DOMContentLoaded', renderChat);
if (document.readyState !== 'loading') setTimeout(renderChat, 0);
