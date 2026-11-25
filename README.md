# Área do Investidor B3 — protótipo web (rodada 1)

Protótipo acadêmico do Squad Capital, feito no ciclo prático com a B3. **Todos os dados são simulados.** O site não tem login de verdade, não pede credenciais e não se conecta a nenhum serviço: tudo roda no navegador, com dados fictícios.

**Ver online:** https://bernardovarandas-sudo.github.io/prototipo-area-do-investidor-b3/

## O que dá para clicar

- **Início** (sem login): Ibovespa, busca de ações e ficha do ativo.
- **Acesso demo:** um clique entra na conta fictícia.
- **Minha carteira:** resumo, "O que mudou", composição e ativos.
- **Notícias:** abas "Todo o mercado" e "Minha carteira", "Ver mais" e o painel "Impacto na carteira".
- **Extratos, Proventos, Portabilidade, Serviços e Feedback:** telas de consulta.

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
