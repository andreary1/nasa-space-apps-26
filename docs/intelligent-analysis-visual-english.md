# Intelligent Analysis — visual e inglês

Alteração implementada na branch de integração existente, preservando todas as
alterações locais anteriores. Sem commit, push, alteração de `.env`, dependências
novas ou configuração Git.

## Escopo desta rodada

| Arquivo | Alteração |
| --- | --- |
| `deliverables/demo/index.html` | Somente seção Intelligent Analysis, seu item de sidebar e os contadores próprios de descobertas/candidatos |
| `deliverables/demo/js/navigation.js` | Nome apresentado da rota `intelligent`; a rota continua `#/intelligent` |
| `deliverables/demo/js/components/intelligentAnalysis.js` | Tradução dos textos fixos/dinâmicos, formatação inglesa e mensagens da validação nativa; mesmos eventos e payload |
| `deliverables/demo/js/services/analysisLanguage.js` (novo) | Traduções determinísticas de mensagens técnicas e rótulos de estados, sem mutar os resultados |
| `deliverables/demo/styles/intelligent.css` | Padrão visual de Comparisons aplicado somente a `#view-intelligent`; estilos dos pins mantidos |
| `deliverables/demo/js/components/worldMap.js` | Somente textos/aria-labels dos pins e contadores pertencentes à análise |
| `scripts/ai_reports/intelligent_analysis.mjs` | Somente instrução para o Gemini responder em inglês |
| `scripts/ai_reports/geological_discovery.mjs` | Somente instrução de idioma da resposta e do rótulo de informação ausente |
| `tests/integration/intelligent-browser.cjs` | Expectativa visual `N/A` em vez de `N/D` |
| `tests/integration/geological-browser.cjs` | Textos ingleses dos pins/histórico e verificação dos detalhes de Wolfe em inglês |
| `tests/integration/intelligent-diagnostics-browser.cjs` | Rótulos ingleses de detalhes e estados, mantendo verificações dos códigos originais da API |
| `tests/integration/intelligent-english.cjs` (novo) | Validação em navegador português, mensagens antigas, erros, 429, estilos e preservação dos dados |
| Este documento (novo) | Resultado e limites desta rodada |

## Referência visual

Foram inspecionados `components.css`, `world-map.css`, `compactComparison.js`,
`siteSelector.js`, a seção Comparisons e suas classes. Nenhum desses componentes
ou estilos compartilhados foi redesenhado.

Reutilizados `.surface`, `.primary-button`, `.field-grid`, `.page-heading`,
`.data-note` e a tipografia/botões secundários compartilhados. O cartão do
formulário e o cabeçalho de resultado usam o mesmo fundo decorado do catálogo de
Comparisons: gradientes radiais lavanda/azul, gradiente linear 115°, raio 26 px,
padding 28 px e sombra `#536da118`. Os demais resultados usam o cartão `.surface`.
Os campos usam o mesmo padding 13×16 px, borda `#c4d0ec` e raio 15 px do seletor
de Comparisons. O botão principal e o histórico selecionado usam o gradiente
125° `#a78aed / #9761e7 / #ab79ef` já existente na seleção do catálogo.

Hover: elevação de 2 px e borda/sombra do catálogo, transições de 250 ms;
botão pressionado retorna à posição inicial. Botões secundários herdam o estilo
compartilhado, sem inventar ações. Foco visível de 3 px na paleta existente,
inclusive em links e summaries. O indicador de atividade só aparece durante
o `aria-busy` real do formulário. O scroll reveal existente foi preservado:
fade/translate de 460 ms, entradas progressivas e cancelamento com reduced
motion. O indicador também respeita `prefers-reduced-motion`.

## Idioma e contratos

Sidebar, tooltip, aria-labels, título, subtítulo, formulário, validações,
processamento, histórico, resultados, fontes, diagnósticos, botões e textos dos
novos pins usam inglês. Números apresentados usam `en-US`, sem alterar os valores.
O download foi renomeado visualmente para `analysis-<id>`, mantendo o conteúdo.

A camada de apresentação converte mensagens técnicas conhecidas recebidas em
português, inclusive no histórico existente. Rótulos como `below_threshold`,
`insufficient_data`, `technical_failure` e `comparison_ready` são exibidos como
“Below Threshold”, “Insufficient Data”, “Technical Error” e “Comparison Available”.
Os códigos originais, nomes de métricas, unidades, IDs, propriedades JSON e
arquivos exportados continuam intactos. Nem o resultado nem o armazenamento
são reescritos pela tradução. Python, cálculos, pesos, normalização, limiares,
fontes científicas, credenciais e modelos não foram modificados.

Os dois prompts só tiveram a instrução de idioma ajustada. A resposta estruturada
Gemini continua usando as chaves existentes (`resumo`, `semelhancas`, etc.).
Pesquisa e validação mantêm as mesmas regras e ferramentas.

## Testes executados

- `intelligent-english.cjs`: formulário e validação em contexto `pt-BR`, rótulos
  científicos, etapas reais representadas por fixture de protocolo, resposta
  HTTP 429, falha técnica, quatro tamanhos (390/768/1366/1920), ausência de overflow
  e erros de runtime. Payload mantém `nome`, `latitude`, `longitude`, `raio_km`,
  `comparar_com` e valores `lua`/`marte`. Export mantém os objetos científicos.
- O mesmo teste compara padding/borda/raio dos campos e o gradiente com os
  elementos reais de Comparisons. Compara também todos os estilos computados de
  cartões, seletor, opção e item de navegação de Comparisons com uma página em
  que o CSS Intelligent Analysis não está carregado: idênticos.
- `geological-browser.cjs`: Wolfe real, texto dos detalhes em inglês, pin de
  descoberta separado, tooltip, teclado, clique, persistência após reload,
  24 localidades oficiais e mobile.
- `intelligent-diagnostics-browser.cjs`: Erg/Barringer reais, score ausente versus
  calculado abaixo do limiar, raio sugerido, JSON/GeoJSON e mobile.
- `intelligent-browser.cjs`: Aratanha real, sessões, etapas, histórico, quatro
  tamanhos e animação/reduced motion. Candidato aprovado somente como fixture
  de teste explicitamente artificial.
- `geological-real.mjs`: quatro localidades reais pela API, resultados abaixo.
- `demo-modules.mjs`: 24 localidades e 200 pares com resultados originais iguais.
- `intelligent-science.mjs`, `geological-discovery.mjs`, `ai-client.mjs`: contratos
  científicos, HTTP 429/cooldown, pesquisa, snapshots, erros e cliente Gemini.
- Dois módulos Python de integração: 13 testes passaram.
- `demo-browser.cjs`, `map-redesign.cjs`, `analysis-visual.cjs`: WebGL/globo,
  navegação, catálogo, filtros, zoom, interação, gráficos e estilos existentes.
- `scripts/verify_html.py`: 162 IDs únicos, 35 módulos, imports/assets/DOM válidos.
- Auditoria antes/depois: HTML fora da funcionalidade inalterado; nos dois arquivos
  Node, somente instruções de idioma; Python, ciência e persistência inalterados.
- `git diff --check`: sem erros.

Logs/capturas ficam fora do Git em `%TEMP%/paf-english-qa/` e nos diretórios de
QA já utilizados. Os testes de apresentação identificam suas fixtures; elas
não são resultados científicos reais.

## Regressão real e Gemini

| Consulta | Resultado preservado |
| --- | --- |
| Wolfe Creek −19,17167 / 127,79556; 3 km; Lua | **0,4606092924727341**, Censorinus, 11/11 métricas; descoberta, sem candidato |
| Barringer 35,0333 / −111,0167; 3 km; Lua | **0,48561747862006044**, Censorinus, 11/11 métricas; descoberta, sem candidato |
| Erg Chebbi 31,1381 / −3,9761; 5 km; Marte | Score `null`, faltam sete métricas específicas; descoberta, sem candidato |
| Serra da Aratanha −3,97 / −38,63; 5 km; ambos | Scores `null`, sem feição comprovada; sem pins |

As quatro consultas completas tiveram 100% de cobertura de DEM. Nenhum score ou
critério de aprovação foi alterado. Houve uma tentativa concorrente que retornou
a falha técnica já existente de leitura/processamento do DEM; a repetição
isolada completou as quatro análises. Não se atribuiu uma causa sem diagnóstico,
nem se alterou processamento científico para contornar a falha.

O Grounding real respondeu HTTP 429/cooldown; a mensagem inglesa e o tratamento
continuam funcionando, sem evidência fabricada. Foi recebida e verificada uma
interpretação real em inglês para Aratanha no teste de navegador. Na rodada
sequencial final das quatro localidades, as interpretações ficaram indisponíveis;
os resultados científicos foram preservados. Não se declara Grounding real
bem-sucedido nesta conta.

## Limites de tradução

Nomes digitados pelo usuário, nomes próprios, identificadores científicos e
títulos originais de publicações são dados e permanecem preservados. Novas
respostas Gemini são solicitadas em inglês. Texto livre de interpretações antigas
já salvo em português mantém o original: não foi apagado, traduzido por chamadas
extras ou regravado. Para receber uma nova interpretação em inglês, execute uma
nova análise. A tradução determinística cobre as mensagens do aplicativo, não
prosa arbitrária de terceiros ou conteúdo inserido pelo usuário.

A API e exports mantêm mensagens/códigos originais quando presentes nos dados;
a tradução é uma camada de interface, conforme o contrato solicitado. A análise
continua exigindo servidor local Node/Python, como antes desta alteração.

Para testar: execute `iniciar-analise-inteligente.bat` na raiz e abra
`http://localhost:8000/#/intelligent`. Não houve commit ou push.
