# Área do Investidor B3 — protótipo web (rodada 1)

Protótipo acadêmico do Squad Capital, feito no ciclo prático com a B3. **Todos os dados são simulados.** O site não tem login de verdade, não pede credenciais e não se conecta a nenhum serviço: tudo roda no navegador, com dados fictícios.

**Ver online:** https://bernardovarandas-sudo.github.io/prototipo-area-do-investidor-b3/

## O que dá para clicar

- **Início** (sem login): Ibovespa, busca de ações, "Mais negociados" e ficha do ativo.
- **Acesso:** CPF → senha → verificação em duas etapas, "Primeiro acesso" em 5 etapas e "Esqueci minha senha". Os campos já vêm com dados fictícios e não aceitam digitação (o site nunca recebe CPF ou senha reais). Há atalho para entrar direto.
- **Carteira com todos os tipos de investimento:** ações, FIIs, ETFs, renda fixa (Tesouro, CDB, LCI) e fundos, com filtro por classe. Visão geral com destaques, alocação por classe/produto/instituição e evolução do patrimônio.
- **Investimentos:** Posição com filtro por classe e Garantias preenchidas.
- **Downloads no modelo padrão:** todo "Baixar" gera PDF (cabeçalho da Área do Investidor, dados da conta, tabela, totais, marca d'água de demonstração) ou Excel com a mesma estrutura.
- **Serviços como no portal:** Calculadoras de IR (aba Revar com vínculo simulado + parceiras), Voto a distância (Início, Em aberto, Histórico), CALC de Renda Fixa calculando DI, títulos públicos, debêntures, CRA e CRI.
- **Meu acesso:** dados pessoais, contas de investimento, e-mail principal, segurança e central de notificações.
- **Rodada 5 (ideias dos benchmarks):** preço médio e resultado por ativo; rendimento separado de aportes e resgates; rentabilidade comparada com CDI e Ibovespa; acompanhamento da compra até a carteira (D+2); aviso "o que mudou · antes → agora" com banner temporário; lembrete de data com; alertas de empresas acompanhadas; avisos por tipo e por ativo; ficha com proventos de 12 meses e agenda; projeção de proventos para 12 meses; resumo semanal comparado; retrospectiva do ano; "O que você quer fazer?" no Início com guia do IR; check-in do mês.
- **Assistente de ajuda** (canto inferior direito): responde dúvidas comuns com dados da conta demo e links. Funciona por regras, sem servidor.
- **Comprar:** na ficha de cada ação, "Comprar" mostra que a compra é feita na corretora e leva ao site dela. Ao lado, "Comprar na demo" (só no protótipo) adiciona a ação à carteira fictícia.
- **Minha carteira:** resumo, "O que mudou", composição e ativos, já com as compras da demo.
- **Notícias:** notícias reais de novembro de 2026, resumidas com link para a reportagem, e notícias fictícias. O painel "Impacto na carteira" calcula a relação com a sua carteira na hora.
- **Proventos e Extratos:** mostram os pagamentos e as negociações das compras feitas na demo. Em Proventos › Visão geral, um gráfico de colunas de jan a dez mostra o recebido em cada mês e o que está previsto.
- **Portabilidade:** simulação em 4 etapas, com a solicitação em "Minhas solicitações".
- **Voto a distância:** votação simulada na assembleia da Nova Azul.
- **Serviços, Feedback e páginas institucionais:** consulta e exemplos.
- **Resumo semanal:** em Minha carteira › Visão geral › "Ver resumo semanal", com a variação da semana, até três destaques e atalho para o impacto das notícias. Em Perfil › Preferências dá para ligar "Receber resumo semanal da carteira" (salvo no navegador). A prévia do e-mail fica no menu do perfil e no rodapé.
- **Proventos no calendário:** em Proventos › A receber e no detalhe de cada pagamento, "Adicionar ao meu calendário" baixa um arquivo .ics (dia inteiro, "Conferir provento na B3", sem valores) com link de volta para o pagamento.

## Roteiro para testar o impacto das notícias

Entre com a conta demo e compre na demo uma destas ações. Depois abra Notícias › Minha carteira:

| Comprar | Notícia real ligada | O que aparece |
|---|---|---|
| PETR4 | Petrobras cai mesmo com lucro maior | Relação direta |
| VALE3 | Vale cai com minério em baixa · Vale Day | Relação direta |
| ITUB4 | Itaú lucra R$ 12,6 bi · Copom mantém a Selic | Direta · indireta (setor financeiro) |
| BBAS3 | Lucro do Banco do Brasil cai 66% · Copom | Direta · indireta |
| MGLU3 | Magazine Luiza tem lucro menor, mas ações sobem · Copom | Direta · indireta (varejo) |
| WEGE3 | WEG lucra abaixo do esperado | Relação direta · preço ainda não mudou, então aparece "Possível mudança" |
| DEMO8 | Vale cai com minério em baixa | Indireta (mineração) |

As empresas reais aparecem com **preço simulado**. Os proventos das compras da demo têm valor e data fictícios. "Desfazer compras da demo", na carteira, volta tudo ao início.

## Abrir no computador

Não precisa instalar nada. Baixe a pasta e abra o `index.html` no navegador, ou rode na pasta:

```bash
python3 -m http.server 5173
```

e abra http://localhost:5173.

## Arquivos

| Arquivo | Conteúdo |
|---|---|
| `index.html` | Estrutura da página e ordem dos scripts |
| `css/styles.css` | Cores, tipografia, layout e componentes |
| `js/data.js` | Dados fictícios da demonstração |
| `js/core.js` | Estado, formatação, ícones e gráficos |
| `js/views-*.js` | Telas (início, carteira, notícias, consultas) |
| `js/main.js` | Rotas, menu, painel lateral e teclado |

A sessão demo fica guardada só na aba do navegador. Para recomeçar, use "Sair" no menu do perfil ou feche a aba.
