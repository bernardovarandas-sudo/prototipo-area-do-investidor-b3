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

const ATIVOS = [
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
