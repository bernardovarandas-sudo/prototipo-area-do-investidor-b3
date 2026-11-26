/* Dados fictícios da demonstração — PRD §6.
   Um único conjunto alimenta Início, ficha, carteira, notícias e consultas. */

const REF = {
  atual: '24 nov 2026, 18h',
  anterior: '23 nov 2026, 18h',
  atualCurta: '24 nov, 18h',
  anteriorCurta: '23 nov, 18h',
  pregao: 'Pregão encerrado',
};

const IBOV = {
  nome: 'Ibovespa',
  pontos: 130000,
  anterior: 128968,
  // pontos iniciais de cada recorte do gráfico
  inicio: { '1D': 128968, '1M': 126400, '1A': 118300 },
};

/* Empresas reais (real: true) com preço simulado, para ilustrar as notícias reais. A VALE3 usa o fechamento noticiado em 24 nov. */
const ATIVOS = [
  { code: 'PETR4', name: 'Petrobras', setor: 'Petróleo e gás', tipo: 'Ação preferencial (PN)', preco: 41.20, anterior: 41.62, real: true },
  { code: 'VALE3', name: 'Vale', setor: 'Mineração', tipo: 'Ação ordinária (ON)', preco: 55.24, anterior: 58.41, real: true },
  { code: 'ITUB4', name: 'Itaú Unibanco', setor: 'Financeiro', tipo: 'Ação preferencial (PN)', preco: 38.90, anterior: 38.55, real: true },
  { code: 'BBAS3', name: 'Banco do Brasil', setor: 'Financeiro', tipo: 'Ação ordinária (ON)', preco: 19.85, anterior: 20.20, real: true },
  { code: 'MGLU3', name: 'Magazine Luiza', setor: 'Varejo', tipo: 'Ação ordinária (ON)', preco: 6.70, anterior: 6.58, real: true },
  { code: 'WEGE3', name: 'WEG', setor: 'Bens industriais', tipo: 'Ação ordinária (ON)', preco: 44.10, anterior: 44.35, real: true },
  { code: 'DEMO1', name: 'Aurora', setor: 'Tecnologia', tipo: 'Ação ordinária (ON)', preco: 24.00, anterior: 23.75 },
  { code: 'DEMO2', name: 'Nova Azul', setor: 'Saneamento', tipo: 'Ação ordinária (ON)', preco: 30.00, anterior: 29.75 },
  { code: 'DEMO3', name: 'Lumina', setor: 'Energia elétrica', tipo: 'Ação ordinária (ON)', preco: 45.00, anterior: 45.25 },
  { code: 'DEMO4', name: 'Horizonte Varejo', setor: 'Varejo', tipo: 'Ação ordinária (ON)', preco: 12.40, anterior: 12.75 },
  { code: 'DEMO5', name: 'Pátria Logística', setor: 'Logística', tipo: 'Ação ordinária (ON)', preco: 18.90, anterior: 18.50 },
  { code: 'DEMO6', name: 'Vértice Bancos', setor: 'Financeiro', tipo: 'Ação preferencial (PN)', preco: 33.10, anterior: 33.40 },
  { code: 'DEMO7', name: 'Ceres Agro', setor: 'Agronegócio', tipo: 'Ação ordinária (ON)', preco: 9.85, anterior: 9.70 },
  { code: 'DEMO8', name: 'Atlas Mineração', setor: 'Mineração', tipo: 'Ação ordinária (ON)', preco: 61.20, anterior: 62.00 },
];

/* Conta principal: quantidades iguais em 23 e 24 nov, sem aportes ou retiradas. */
const POSICOES_PRINCIPAL = [
  { code: 'DEMO1', inst: 'Corretora A', qtd: 700 },
  { code: 'DEMO1', inst: 'Corretora B', qtd: 300 },
  { code: 'DEMO2', inst: 'Corretora B', qtd: 400 },
  { code: 'DEMO3', inst: 'Corretora A', qtd: 200 },
];

const CONTAS = {
  principal: { nome: 'Investidor Demo', cpf: '***.456.789-**', email: 'investidor.demo@exemplo.test', posicoes: POSICOES_PRINCIPAL },
  vazia: { nome: 'Investidora Nova (demo)', cpf: '***.321.654-**', email: 'nova.demo@exemplo.test', posicoes: [] },
};

/* Notícias: textos revisados e ligações fixas (PRD §4.3). */
const NOTICIAS = [
  {
    id: 'n1', tipo: 'comunicado', data: '24 nov, 08h', fonte: 'Fonte demo · Relações com Investidores Aurora',
    titulo: 'Aurora divulga resultado do 3º trimestre',
    contexto: 'Lucro 12% maior que no mesmo trimestre do ano anterior.',
    ativos: ['DEMO1'], setores: ['Tecnologia'],
    corpo: [
      'A Aurora (DEMO1) divulgou nesta segunda-feira o resultado do terceiro trimestre. O lucro ficou 12% acima do registrado no mesmo trimestre do ano anterior.',
      'Segundo o comunicado, a receita cresceu com a ampliação de contratos de serviços. A empresa manteve a projeção de investimentos para o próximo ano.',
      'Este texto é fictício e foi escrito para a demonstração do protótipo.',
    ],
    relacao: {
      estado: 'direta',
      porque: 'É um comunicado da Aurora, empresa cujas ações aparecem na sua carteira.',
      ligacao: 'Você tem ações da Aurora em duas corretoras.',
      aconteceu: 'A empresa divulgou lucro 12% maior que no mesmo trimestre do ano anterior. Esse resultado pode ter influenciado o preço.',
    },
  },
  {
    id: 'n2', tipo: 'noticia', data: '24 nov, 10h', fonte: 'Fonte demo · Agência de notícias fictícia',
    titulo: 'Mudança em estudo para o setor de energia',
    contexto: 'Proposta regulatória ainda em consulta pública.',
    ativos: [], setores: ['Energia elétrica'],
    corpo: [
      'O órgão regulador do setor elétrico abriu consulta sobre uma mudança nas regras de remuneração das distribuidoras. A proposta ainda está em estudo e não tem data para entrar em vigor.',
      'Analistas ouvidos pela agência afirmam que o efeito sobre as empresas depende do texto final.',
      'Este texto é fictício e foi escrito para a demonstração do protótipo.',
    ],
    relacao: {
      estado: 'indireta',
      porque: 'A notícia trata do setor de energia, e um ativo da sua carteira atua nesse setor.',
      ligacao: 'A Lumina, que aparece na sua carteira, atua no setor de energia elétrica.',
      aconteceu: 'A notícia trata de uma mudança em estudo no setor de energia. Ainda não dá para estimar o efeito no seu investimento.',
      ativosLigados: ['DEMO3'],
    },
  },
  {
    id: 'n3', tipo: 'comunicado', data: '24 nov, 07h', fonte: 'Fonte demo · Relações com Investidores Horizonte',
    titulo: 'Horizonte Varejo apresenta resultado do trimestre',
    contexto: 'Vendas nas mesmas lojas ficaram estáveis.',
    ativos: ['DEMO4'], setores: ['Varejo'],
    corpo: [
      'A Horizonte Varejo (DEMO4) informou vendas estáveis nas mesmas lojas e margem menor no trimestre.',
      'Este texto é fictício e foi escrito para a demonstração do protótipo.',
    ],
    relacao: {
      estado: 'sem',
      porque: 'Ela apareceu porque está em Todo o mercado. Verificamos os ativos da sua carteira.',
      ligacao: 'A empresa citada não aparece entre os ativos que constam na sua carteira. Não identificamos relação direta com esta notícia.',
    },
  },
  {
    id: 'n4', tipo: 'noticia', data: '23 nov, 17h', fonte: 'Fonte demo · Boletim de mercado fictício',
    titulo: 'Fundos ampliam participação em renda variável',
    contexto: 'Levantamento não identifica empresas ou fundos específicos.',
    ativos: [], setores: [],
    corpo: [
      'Um levantamento sobre fundos de investimento indica aumento da parcela aplicada em ações ao longo do mês. O texto não cita gestores, fundos ou empresas.',
      'Este texto é fictício e foi escrito para a demonstração do protótipo.',
    ],
    relacao: {
      estado: 'insuf',
      porque: 'A notícia está em Todo o mercado.',
      ligacao: 'A fonte não identifica claramente os investimentos ligados a esta notícia. Ainda não dá para avaliar a relação com sua carteira.',
    },
  },
  {
    id: 'n5', tipo: 'evento', data: '2 dez, 10h', fonte: 'Fonte demo · Edital de convocação',
    titulo: 'Assembleia da Nova Azul vota proposta de dividendos',
    contexto: 'Assembleia geral extraordinária em 2 dez 2026.',
    ativos: ['DEMO2'], setores: ['Saneamento'],
    corpo: [
      'A Nova Azul (DEMO2) convocou assembleia geral extraordinária para 2 dez 2026. A pauta inclui proposta de distribuição de dividendos.',
      'O voto a distância pode ser consultado em Serviços. Este texto é fictício e foi escrito para a demonstração do protótipo.',
    ],
    relacao: {
      estado: 'direta',
      porque: 'É um evento da Nova Azul, empresa cujas ações aparecem na sua carteira.',
      ligacao: 'Você tem ações da Nova Azul na Corretora B.',
      aconteceu: 'A assembleia ainda vai acontecer. A variação acima mostra o preço no período e não tem relação comprovada com esta convocação.',
    },
  },
  {
    id: 'n6', tipo: 'evento', data: '28 nov, 18h', fonte: 'Fonte demo · Calendário de resultados',
    titulo: 'Pátria Logística divulga resultado em 28 nov',
    contexto: 'Teleconferência marcada para o dia seguinte.',
    ativos: ['DEMO5'], setores: ['Logística'],
    corpo: [
      'A Pátria Logística (DEMO5) informou a data de divulgação do resultado trimestral.',
      'Este texto é fictício e foi escrito para a demonstração do protótipo.',
    ],
    relacao: {
      estado: 'sem',
      porque: 'Ela apareceu porque está em Todo o mercado. Verificamos os ativos da sua carteira.',
      ligacao: 'A empresa citada não aparece entre os ativos que constam na sua carteira. Não identificamos relação direta com esta notícia.',
    },
  },
];

const TIPOS_NOTICIA = {
  noticia: 'Notícia',
  comunicado: 'Comunicado da empresa',
  evento: 'Evento',
};

/* Proventos — recorte separado do cálculo de variação. */
const PROVENTOS_RECEBIDOS = [
  { data: '05/11/2026', mes: '2026-11', code: 'DEMO2', tipo: 'Juros sobre capital próprio', inst: 'Corretora B', valor: 80.00 },
  { data: '14/10/2026', mes: '2026-10', code: 'DEMO1', tipo: 'Dividendos', inst: 'Corretora A', valor: 63.00 },
  { data: '14/10/2026', mes: '2026-10', code: 'DEMO1', tipo: 'Dividendos', inst: 'Corretora B', valor: 27.00 },
  { data: '22/09/2026', mes: '2026-09', code: 'DEMO3', tipo: 'Dividendos', inst: 'Corretora A', valor: 36.00 },
];
const PROVENTOS_A_RECEBER = [
  { data: '15/12/2026', dia: '2026-12-15', code: 'DEMO1', tipo: 'Dividendos', inst: 'Corretoras A e B', valor: 40.00 },
  { data: null, dia: null, code: 'DEMO3', tipo: 'Juros sobre capital próprio', inst: 'Corretora A', valor: null },
];
const RADAR = [
  { code: 'DEMO1', tipo: 'Dividendos', anuncio: '20 nov', pagamento: '15 dez', paraVoce: true },
  { code: 'DEMO3', tipo: 'Juros sobre capital próprio', anuncio: '18 nov', pagamento: null, paraVoce: true },
  { code: 'DEMO6', tipo: 'Dividendos', anuncio: '21 nov', pagamento: '10 dez', paraVoce: false },
  { code: 'DEMO8', tipo: 'Juros sobre capital próprio', anuncio: '19 nov', pagamento: '18 dez', paraVoce: false },
];

/* Extratos — exemplos por aba. */
const EXTRATOS = {
  movimentacao: [
    { data: '18/11/2026', mov: 'Transferência – liquidação', code: 'DEMO1', inst: 'Corretora A', qtd: 200, valor: null, entrada: true,
      detalhe: 'Entrada das ações compradas em 14/11, após a liquidação. “Transferência – liquidação” indica que a ação passou a constar na sua posição.' },
    { data: '06/11/2026', mov: 'Transferência – liquidação', code: 'DEMO3', inst: 'Corretora A', qtd: 50, valor: null, entrada: true,
      detalhe: 'Entrada das ações compradas em 04/11, após a liquidação.' },
    { data: '05/11/2026', mov: 'Juros sobre capital próprio', code: 'DEMO2', inst: 'Corretora B', qtd: 400, valor: 80.00, entrada: true,
      detalhe: 'Crédito de provento. A quantidade é a base usada para o cálculo. Veja também em Proventos.' },
  ],
  negociacao: [
    { data: '14/11/2026', lado: 'Compra', code: 'DEMO1', inst: 'Corretora A', qtd: 200, preco: 23.10, liquidacao: '18/11/2026' },
    { data: '04/11/2026', lado: 'Compra', code: 'DEMO3', inst: 'Corretora A', qtd: 50, preco: 44.80, liquidacao: '06/11/2026' },
  ],
  eventos: [
    { data: '05/11/2026', evento: 'Juros sobre capital próprio', code: 'DEMO2', situacao: 'Pago', valor: 80.00 },
    { data: '20/11/2026', evento: 'Dividendos (anúncio)', code: 'DEMO1', situacao: 'Previsto para 15/12/2026', valor: 40.00 },
  ],
  ofertas: [],
};

const NOTIFICACOES = [
  { id: 'a1', titulo: 'Aurora divulgou resultado do trimestre', data: '24 nov, 08h', destino: '/noticias?aba=carteira&painel=n1', acao: 'Entender o que mudou' },
  { id: 'a2', titulo: 'Assembleia da Nova Azul em 2 dez', data: '22 nov, 09h', destino: '/servicos/voto', acao: 'Ver assembleia' },
  { id: 'a3', titulo: 'Provento previsto para 15 dez', data: '20 nov, 14h', destino: '/proventos/a-receber', acao: 'Ver proventos' },
];

const ASSEMBLEIAS = [
  { empresa: 'Nova Azul · DEMO2', data: '2 dez 2026', prazo: '28 nov 2026', estado: 'Aberta para consulta',
    pauta: ['Proposta de distribuição de dividendos', 'Eleição de membro do conselho fiscal'],
    docs: ['Edital de convocação (exemplo)', 'Manual da assembleia (exemplo)'] },
  { empresa: 'Aurora · DEMO1', data: '18 dez 2026', prazo: '11 dez 2026', estado: 'Prazo ainda não aberto',
    pauta: ['Aprovação do plano de remuneração'], docs: ['Edital de convocação (exemplo)'] },
];

const TERMOS = {
  posicao: 'Posição é o que você tem em cada investimento numa data: quantidade e valor estimado, em cada instituição.',
  garantias: 'Garantias são ativos bloqueados para cobrir operações, como empréstimo de ações ou derivativos. Elas continuam sendo seus.',
  proventos: 'Proventos são valores que a empresa distribui a quem tem as ações, como dividendos e juros sobre capital próprio.',
  liquidacao: 'Liquidação é quando a compra ou a venda se conclui: o dinheiro e o ativo trocam de mãos. Em ações à vista, isso costuma ocorrer em D+2 (dois dias úteis).',
};

/* Texto das notícias em camadas: resumo no card, aprofundamento em “Ver mais”. Conteúdo fictício. */
const NOTICIAS_TEXTO = {
  n1: {
    imagem: 'Ilustração: gráfico de barras em alta ao lado de um chip de computador',
    resumo: 'A Aurora informou lucro 12% maior que no mesmo trimestre do ano anterior. A receita cresceu com novos contratos de serviços, e a empresa manteve o plano de investimentos para 2027.',
    detalhe: [
      ['O que foi divulgado', 'No terceiro trimestre, a Aurora teve lucro líquido 12% acima do registrado um ano antes. A receita subiu 8%, puxada por contratos de serviços de tecnologia para empresas. As despesas cresceram em ritmo menor que a receita.'],
      ['Por que isso importa', 'O lucro é uma das informações que investidores usam para avaliar uma empresa. Um resultado acima do esperado costuma atrair compradores, mas o preço da ação também depende de juros, do humor do mercado e de outras notícias.'],
      ['Próximos passos', 'A empresa fará uma teleconferência com analistas em 25 nov. O comunicado completo fica no site de relações com investidores.'],
    ],
  },
  n2: {
    imagem: 'Ilustração: torres de transmissão de energia com um raio e o sol ao fundo',
    resumo: 'O órgão regulador abriu consulta pública sobre mudanças na forma como as distribuidoras de energia são remuneradas. A proposta ainda está em estudo e não tem data para valer.',
    detalhe: [
      ['O que está em discussão', 'A proposta revisa a regra que define quanto as distribuidoras podem cobrar pelo uso da rede. A ideia é atualizar o cálculo de custos e investimentos considerados na tarifa.'],
      ['Quem pode ser afetado', 'Empresas do setor elétrico, principalmente distribuidoras. O efeito sobre cada uma depende do texto final e de como cada empresa opera hoje.'],
      ['Próximos passos', 'A consulta pública fica aberta até 15 jan 2027. Depois disso, o órgão analisa as contribuições e publica a versão final, sem prazo definido.'],
    ],
  },
  n3: {
    imagem: 'Ilustração: fachada de loja com toldo listrado e sacolas de compras',
    resumo: 'A Horizonte Varejo informou vendas estáveis nas lojas abertas há mais de um ano e margem menor no trimestre, por causa de promoções e do custo de frete.',
    detalhe: [
      ['O que foi divulgado', 'As vendas nas mesmas lojas ficaram praticamente iguais às de um ano antes. A margem caiu porque a empresa fez mais promoções e pagou mais caro pelo transporte de mercadorias.'],
      ['O que a empresa disse', 'A Horizonte afirmou que vai rever a rede de distribuição para reduzir custos em 2027.'],
    ],
  },
  n4: {
    imagem: 'Ilustração: gráfico de pizza e linha de tendência com moedas',
    resumo: 'Um levantamento sobre fundos de investimento indica que a parcela aplicada em ações cresceu ao longo do mês. O texto não cita gestores, fundos ou empresas.',
    detalhe: [
      ['O que o levantamento mostra', 'A fatia do patrimônio dos fundos aplicada em ações subiu no mês, segundo o boletim. Os números são agregados e não identificam fundos específicos.'],
      ['Limites da informação', 'Sem saber quais fundos ou empresas estão envolvidos, não dá para relacionar a notícia a um investimento específico.'],
    ],
  },
  n5: {
    imagem: 'Ilustração: pessoas em volta de uma mesa de reunião e um documento',
    resumo: 'A Nova Azul convocou assembleia para 2 dez 2026. A pauta inclui proposta de distribuição de dividendos e eleição para o conselho fiscal.',
    detalhe: [
      ['O que será votado', 'Os acionistas vão decidir sobre a distribuição de dividendos e eleger um membro do conselho fiscal. O edital traz os valores propostos e as regras de participação.'],
      ['Como participar', 'Quem tinha ações na data de corte pode votar presencialmente ou pelo voto a distância, até 28 nov. A consulta fica em Serviços › Voto a distância.'],
    ],
  },
  n6: {
    imagem: 'Ilustração: caminhão de carga ao lado de contêineres empilhados',
    resumo: 'A Pátria Logística vai divulgar o resultado do trimestre em 28 nov, após o fechamento do pregão. A teleconferência com analistas será no dia seguinte.',
    detalhe: [
      ['O que esperar', 'A empresa divulga receita, custos e lucro do trimestre. Na teleconferência, a diretoria comenta os números e responde perguntas de analistas.'],
      ['Onde acompanhar', 'O material fica no site de relações com investidores da empresa no dia da divulgação.'],
    ],
  },
};
NOTICIAS.forEach((n) => Object.assign(n, NOTICIAS_TEXTO[n.id]));

/* Como cada notícia fictícia se liga à carteira. A relação é calculada na hora, com a carteira atual (inclusive compras feitas na demo):
   ativos citados na carteira → direta; ativo da carteira num setor afetado → indireta; nada identificável → dados insuficientes. */
Object.assign(NOTICIAS.find((n) => n.id === 'n1'), { efeito: 'Resultados acima do esperado costumam influenciar o preço, mas outros fatores também contam.' });
Object.assign(NOTICIAS.find((n) => n.id === 'n2'), { setoresAfetados: ['Energia elétrica'], efeitoSetor: 'A mudança ainda está em estudo, então o efeito esperado é pequeno e incerto.' });
Object.assign(NOTICIAS.find((n) => n.id === 'n3'), { efeito: 'Vendas estáveis e margem menor costumam pesar no preço.' });
Object.assign(NOTICIAS.find((n) => n.id === 'n4'), { insuf: true });
Object.assign(NOTICIAS.find((n) => n.id === 'n5'), { efeito: 'Se os dividendos forem aprovados, você pode receber um pagamento. A assembleia, por si só, não muda o valor das suas ações.' });
Object.assign(NOTICIAS.find((n) => n.id === 'n6'), { efeito: 'O resultado ainda não saiu. A data de divulgação, por si só, não muda o valor das ações.' });

/* Notícias reais, resumidas com nossas palavras a partir das reportagens (links em url). Preços no protótipo são simulados. */
const NOTICIAS_REAIS = [
  {
    id: 'r2', tipo: 'noticia', data: '24 nov, 18h', fonte: 'Mix Vale', url: 'https://www.mixvale.com.br/2026/11/24/vale-vale3-cai-543-com-minerio-de-ferro-em-baixa-e-fecha-a-r-5524/',
    titulo: 'Vale cai mais de 5% com minério de ferro em baixa', arte: 'mineracao',
    ativos: ['VALE3'], setores: ['Mineração'], setoresAfetados: ['Mineração'],
    imagem: 'Ilustração: montanha de minério, caminhão de mineração e seta para baixo',
    resumo: 'As ações da Vale fecharam 24 nov em queda de cerca de 5,4%, a R$ 55,24, com o minério de ferro em baixa e a China comprando menos. Foi o décimo pregão seguido de queda.',
    detalhe: [
      ['O que aconteceu', 'VALE3 recuou pelo décimo pregão seguido, a maior sequência de quedas em mais de 15 anos, segundo a cobertura. Desde 9 nov, a ação perdeu cerca de 16%.'],
      ['Por que', 'O minério de ferro, principal produto da Vale, está no menor preço em mais de um ano. A empresa também teve lucro bem menor no 3º trimestre.'],
      ['Quem mais pode sentir', 'Outras empresas de mineração costumam ser afetadas pelo preço do minério.'],
    ],
    efeito: 'O preço do minério é um dos principais fatores para o resultado da Vale.',
    efeitoSetor: 'O minério em baixa costuma pesar sobre empresas de mineração, mas cada uma é afetada de um jeito.',
  },
  {
    id: 'r3', tipo: 'evento', data: '1 dez', fonte: 'Acionista', url: 'https://acionista.com.br/vale-vale3-anuncia-vale-day-2026-em-nova-york-em-1o-de-dezembro/',
    titulo: 'Vale fará encontro anual com investidores em 1º de dezembro', arte: 'evento',
    ativos: ['VALE3'], setores: ['Mineração'],
    imagem: 'Ilustração: palco com tela de apresentação e calendário',
    resumo: 'A Vale informou, em comunicado de 24 nov, que vai realizar o Vale Day 2026, reunião anual com o mercado, em 1º de dezembro, em Nova York.',
    detalhe: [
      ['O que é o Vale Day', 'Encontro em que a diretoria apresenta estratégia, metas e projeções para analistas e investidores.'],
      ['Como acompanhar', 'Segundo o comunicado, a transmissão e os detalhes ficam no site de relações com investidores da Vale a partir de 30 nov.'],
    ],
    efeito: 'O evento, por si só, não muda o valor das suas ações, mas as projeções apresentadas podem influenciar o preço.',
  },
  {
    id: 'r1', tipo: 'noticia', data: '11 nov', fonte: 'InfoMoney', url: 'https://www.infomoney.com.br/mercados/petrobras-petr3-petr4-desempenho-acoes-resultados-3t26-proventos-novas-projecoes/',
    titulo: 'Petrobras cai na bolsa mesmo com lucro maior no 3º trimestre', arte: 'petroleo',
    ativos: ['PETR4'], setores: ['Petróleo e gás'],
    imagem: 'Ilustração: plataforma de petróleo no mar e gota de óleo',
    resumo: 'A Petrobras lucrou R$ 39,7 bilhões no 3º trimestre, 21,5% a mais que um ano antes. Mesmo assim, as ações caíram depois do balanço: os dividendos vieram menores e os investimentos previstos, maiores do que o mercado esperava.',
    detalhe: [
      ['O que foi divulgado', 'Lucro de R$ 39,7 bilhões no trimestre, alta de 21,5% na comparação anual. A empresa também anunciou a remuneração aos acionistas e revisou as projeções de investimento.'],
      ['Como o mercado reagiu', 'No pregão seguinte, PETR4 caiu cerca de 3% e PETR3, cerca de 2%. Segundo a reportagem, investidores esperavam dividendos maiores e gastos menores.'],
      ['Contexto do mês', 'Com o petróleo em baixa, a Petrobras acumulou forte queda em novembro, segundo levantamentos citados pela imprensa.'],
    ],
    efeito: 'Resultado, dividendos e plano de investimentos são informações que costumam mexer no preço da ação.',
  },
  {
    id: 'r6', tipo: 'noticia', data: '11 nov', fonte: 'InfoMoney', url: 'https://www.infomoney.com.br/mercados/banco-do-brasil-bbas3-resultados-terceiro-trimestre-2026/',
    titulo: 'Lucro do Banco do Brasil cai 66% e banco reduz dividendos', arte: 'banco',
    ativos: ['BBAS3'], setores: ['Financeiro'],
    imagem: 'Ilustração: fachada de banco com colunas e seta para baixo',
    resumo: 'O Banco do Brasil lucrou cerca de R$ 1,3 bilhão no 3º trimestre, 66,5% menos que um ano antes e bem abaixo do esperado. O banco também reduziu a parte do lucro paga em dividendos, e as ações caíram forte no pregão seguinte.',
    detalhe: [
      ['O que pesou', 'A inadimplência no crédito ao agronegócio subiu, e o banco precisou reservar mais dinheiro para possíveis perdas.'],
      ['Dividendos', 'O pagamento caiu para o mínimo de 25% do lucro, e anúncios intermediários previstos foram cancelados.'],
      ['Projeção', 'A estimativa de lucro para 2026 foi cortada para R$ 9 a 11 bilhões.'],
    ],
    efeito: 'Lucro bem abaixo do esperado e dividendos menores costumam pesar no preço.',
  },
  {
    id: 'r7', tipo: 'noticia', data: '10 nov', fonte: 'InfoMoney', url: 'https://www.infomoney.com.br/mercados/resultados-magazine-luiza-mglu3-terceiro-trimestre-2026/',
    titulo: 'Magazine Luiza tem lucro menor, mas ações sobem', arte: 'varejo',
    ativos: ['MGLU3'], setores: ['Varejo'],
    imagem: 'Ilustração: fachada de loja com sacolas de compras',
    resumo: 'O Magazine Luiza teve lucro ajustado de R$ 14 milhões no 3º trimestre, 34% menos que um ano antes. As vendas das lojas físicas cresceram cerca de 10%, e as ações subiram mais de 11% no dia seguinte ao balanço.',
    detalhe: [
      ['Os números', 'Receita líquida de cerca de R$ 8,9 bilhões. Pelo critério contábil, houve prejuízo de R$ 10,7 milhões. O e-commerce recuou perto de 10%.'],
      ['Por que as ações subiram', 'Investidores reagiram bem ao crescimento das lojas físicas e a sinais de melhora nas vendas de outubro, segundo a cobertura.'],
    ],
    efeito: 'O preço reagiu mais à melhora das vendas do que ao lucro menor.',
  },
  {
    id: 'r5', tipo: 'noticia', data: '4 nov', fonte: 'Suno Notícias', url: 'https://www.suno.com.br/noticias/copom-mantem-selic-1375-novembro-2026-go/',
    titulo: 'Copom mantém a Selic em 13,75% ao ano', arte: 'juros',
    ativos: [], setores: ['Financeiro', 'Varejo'], setoresAfetados: ['Financeiro', 'Varejo'],
    imagem: 'Ilustração: símbolo de porcentagem e gráfico de juros estável',
    resumo: 'O Banco Central manteve a taxa básica de juros em 13,75% ao ano e interrompeu a sequência de cortes. Parte do mercado esperava um novo corte.',
    detalhe: [
      ['O que foi decidido', 'Decisão unânime de manter a Selic. O Banco Central também elevou a projeção de inflação de 2026, de 5,2% para 5,6%.'],
      ['Por que importa para a bolsa', 'Juros altos por mais tempo encarecem o crédito e podem frear o consumo. Isso costuma afetar bancos e varejistas, entre outros setores.'],
    ],
    efeitoSetor: 'Juros altos por mais tempo mexem com crédito e consumo, mas o efeito em cada empresa é difícil de medir.',
  },
  {
    id: 'r4', tipo: 'noticia', data: '3 nov', fonte: 'Suno Notícias', url: 'https://www.suno.com.br/noticias/itau-itub4-lucro-3t26-carteira-credito-go/',
    titulo: 'Itaú lucra R$ 12,6 bilhões no 3º trimestre', arte: 'banco-alta',
    ativos: ['ITUB4'], setores: ['Financeiro'],
    imagem: 'Ilustração: fachada de banco com colunas e seta para cima',
    resumo: 'O Itaú Unibanco teve lucro recorrente de R$ 12,6 bilhões no 3º trimestre, cerca de 6% acima do mesmo período de 2025. O número ficou em linha com o que analistas esperavam.',
    detalhe: [
      ['Destaques', 'Rentabilidade (ROE) de 23,6% no trimestre e inadimplência estável em 2,0%. A margem financeira cresceu cerca de 8% em um ano.'],
      ['O que observar', 'Um resultado em linha com o esperado tende a mexer menos no preço do que uma surpresa, para cima ou para baixo.'],
    ],
    efeito: 'Resultados em linha com o esperado costumam ter efeito menor no preço.',
  },
  {
    id: 'r8', tipo: 'noticia', data: '21 out', fonte: 'InfoMoney', url: 'https://www.infomoney.com.br/mercados/weg-wege3-resultados-terceiro-trimestre-2026/',
    titulo: 'WEG lucra R$ 1,67 bilhão, abaixo do esperado', arte: 'industria',
    ativos: ['WEGE3'], setores: ['Bens industriais'],
    imagem: 'Ilustração: motor elétrico e engrenagens',
    resumo: 'A WEG teve lucro de R$ 1,67 bilhão no 3º trimestre, alta de 0,9% em um ano, mas abaixo da projeção de analistas. As vendas no exterior chegaram a 62,5% da receita, um recorde.',
    detalhe: [
      ['Os números', 'Receita de cerca de R$ 10,9 bilhões, alta de 5,7%. A margem caiu um pouco, pressionada por custos, câmbio e tarifas internacionais.'],
      ['Dólar e receita', 'Como boa parte das vendas é no exterior, o real mais forte reduziu o valor dessas vendas quando convertidas para reais.'],
    ],
    efeito: 'Lucro abaixo do esperado costuma pesar no preço no curto prazo.',
  },
].map((n) => ({ ...n, real: true }));

/* Ordem de exibição: mais recentes primeiro, misturando reais e fictícias. */
(() => {
  const ordem = ['r2', 'n1', 'n2', 'n3', 'r3', 'n4', 'n5', 'n6', 'r1', 'r6', 'r7', 'r5', 'r4', 'r8'];
  const todas = [...NOTICIAS, ...NOTICIAS_REAIS];
  NOTICIAS.length = 0;
  ordem.forEach((id) => NOTICIAS.push(todas.find((n) => n.id === id)));
})();

/* Proventos simulados por ação, usados para as compras feitas na demo (valor por ação e data são fictícios). */
const PROV_POR_ACAO = {
  DEMO1: { tipo: 'Dividendos', dia: '2026-12-15', vps: 0.04 },
  DEMO6: { tipo: 'Dividendos', dia: '2026-12-10', vps: 0.50 },
  DEMO8: { tipo: 'Juros sobre capital próprio', dia: '2026-12-18', vps: 0.70 },
  ITUB4: { tipo: 'Juros sobre capital próprio', dia: '2026-12-01', vps: 0.02 },
  PETR4: { tipo: 'Dividendos', dia: '2027-02-19', vps: 0.45 },
  VALE3: { tipo: 'Juros sobre capital próprio', dia: '2027-03-12', vps: 0.80 },
  WEGE3: { tipo: 'Juros sobre capital próprio', dia: '2027-03-11', vps: 0.13 },
};
RADAR.push(
  { code: 'ITUB4', tipo: 'Juros sobre capital próprio', anuncio: '3 nov', pagamento: '1 dez' },
  { code: 'PETR4', tipo: 'Dividendos', anuncio: '10 nov', pagamento: '19 fev 2027' },
  { code: 'WEGE3', tipo: 'Juros sobre capital próprio', anuncio: '21 out', pagamento: '11 mar 2027' },
);

/* Corretoras para o botão “Comprar” (a compra real é feita na corretora, não na B3). Ordem alfabética, sem recomendação. */
const CORRETORAS = [
  ['BTG Pactual', 'https://www.btgpactual.com/'],
  ['Clear', 'https://www.clear.com.br/'],
  ['Inter', 'https://inter.co/'],
  ['Rico', 'https://www.rico.com.vc/'],
  ['XP Investimentos', 'https://www.xpi.com.br/'],
];
const INSTITUICOES_DEMO = ['Corretora A', 'Corretora B'];
