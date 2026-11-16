# Intelligent Analysis na main — integração para revisão

Preparada em `integration/intelligent-analysis`, baseada na `origin/main`
atualizada. A implementação inglesa foi transportada sem alterações de execução.
A main local, a branch de origem e o remoto não foram modificados.
Nenhum commit, push, Pull Request ou merge foi realizado nesta tarefa.

## Inspeção e preservação

| Item | Estado confirmado |
| --- | --- |
| Branch inicialmente aberta | `integration/analise-inteligente`, árvore limpa |
| Commit fornecido com a funcionalidade em inglês | `3c923ea388259675d1c87a43715f8c83b9b3cc10` |
| Main local | `e292a49a53dd9253014437612cbc79bd55a5656e`, preservada |
| Origin/main após fetch | `8ffd84e75c044f62ccf958908304db667b3b345c` |
| Commit novo da equipe | `8ffd84e`, atualização do README raiz |
| Branch criada nesta tarefa | `integration/intelligent-analysis` |
| Base da nova branch | `8ffd84e75c044f62ccf958908304db667b3b345c` |
| Alterações locais iniciais / arquivos não rastreados | Nenhum |

Foram executados status, branches, remotos, histórico, diff e fetch. A branch
de origem tinha um commit exclusivo, `3c923ea`; a main remota tinha um commit
exclusivo, `8ffd84e`. A antiga `feat/cruzamento-de-dados` permanece intacta,
mas não foi usada para substituir a versão inglesa já revisada.

Não houve pull, reset, clean, merge completo ou mudança de configuração Git.
O `.env` não foi copiado, editado, exibido ou incluído no patch.

## Integração seletiva

O commit de origem já isolava a funcionalidade em 40 caminhos. Foi aplicado o
patch desses caminhos a partir do pai do commit, após `git apply --check`.
Não foi copiada a árvore inteira da branch de origem. Isso evita trazer a
versão antiga de `README.md`, que aparece como diferença entre as duas branches.
O README raiz da equipe foi verificado e permanece idêntico à nova main.

A aplicação foi feita sem criar commit e sem preparar conteúdo para commit.
Os arquivos novos estão marcados somente com intenção de inclusão (`git add -N`)
para que também apareçam no diff completo. Os 40 caminhos transportados foram
comparados com o commit de origem: iguais, desconsiderando finais de linha.
Depois foi acrescentado este relatório e um aviso de histórico no relatório
anterior; o código de execução permanece igual à origem.

Não houve conflitos textuais ou de arquitetura nesta rodada. Os pontos de
conexão seletivos já adaptados à main foram preservados: import/inicialização
no app, uma rota adicional, seção/ícone na sidebar, camadas próprias no mapa,
importação do CSS e despacho da API no servidor existente.

## Arquivos envolvidos

São **41 arquivos em relação à origin/main: 29 adicionados e 12 modificados**.

| Grupo | Caminhos |
| --- | --- |
| Interface específica | `deliverables/demo/js/components/intelligentAnalysis.js`, `deliverables/demo/styles/intelligent.css` |
| Apresentação e persistência | `deliverables/demo/js/services/analysisLanguage.js`, `analysisSnapshot.js`, `discoveryStore.js` |
| Backend Node | `scripts/ai_reports/intelligent_analysis.mjs`, `analysis_diagnostics.mjs`, `geological_discovery.mjs` |
| Python | `src/application/intelligent_analysis.py`, `feature_evidence.py`, `geological_discovery.py` |
| Configuração/execução | `.env.example`, `requirements.txt`, `iniciar-analise-inteligente.bat`, `deliverables/demo/README.md` |
| Pontos compartilhados | `deliverables/demo/index.html`, `js/app.js`, `js/navigation.js`, `js/components/worldMap.js`, `styles/main.css` |
| Documentação | `docs/analise-inteligente.md`, `descoberta-geologica.md`, `diagnostico-analise-inteligente.md`, `integracao-analise-inteligente.md`, `intelligent-analysis-visual-english.md`, este relatório |
| Testes da main adaptados | `tests/integration/demo-browser.cjs`, `demo-refinement.cjs`, `analysis-visual.cjs` |
| Contratos novos | `tests/integration/intelligent-science.mjs`, `intelligent-api.mjs`, `geological-discovery.mjs` |
| Testes reais novos | `tests/integration/geological-real.mjs`, `intelligent-real-diagnostics.mjs` |
| Navegador novo | `tests/integration/intelligent-browser.cjs`, `intelligent-diagnostics-browser.cjs`, `intelligent-english.cjs`, `geological-browser.cjs` |
| Python novo | `tests/integration/test_intelligent_analysis.py`, `test_geological_discovery.py` |

Nomes abreviados na tabela continuam no diretório indicado no primeiro caminho
do grupo. O inventário completo também pode ser visto com `git diff --name-status origin/main`.

Os três testes antigos foram adaptados às traduções e à navegação que já existem
na main: não se restaurou a rota settings nem a escolha de corpo incompatível.
Nenhum comportamento do produto foi revertido para satisfazer testes antigos.

## O que permanece preservado

Foram verificados contra `origin/main`, sem diferenças: README raiz atualizado,
catálogos e dados científicos, rasters existentes, fórmulas e modelo de comparação,
componentes do globo 3D, comparação compacta, seleção de localidades, formulário
existente, clientes e armazenamento de relatórios Gemini, diretório `api/`,
`vercel.json` e `.vercelignore`. Comparisons conserva seus estilos e conteúdo.

A sidebar preserva seus seis destinos existentes e acrescenta Intelligent
Analysis. O formulário mantém suas propriedades JSON e valores internos
`lua`/`marte`; a apresentação usa inglês. Gradientes, hover, cartões, campos,
scroll reveal e reduced motion são os da versão de origem.

Os 24 pontos oficiais, seus contadores, filtros, regiões, zoom, hover e cliques
continuam existentes. Discovery e Approved Candidate usam camadas separadas no
mapa 2D. Não foram adicionados pins ou recursos novos ao globo 3D.

Não foram incluídos segredos, DEMs baixados, JSONs de resultados reais, capturas,
caches, ambientes virtuais ou arquivos temporários. Os resultados gerados por
QA permanecem fora do repositório.

A auditoria final confirmou 29 adições e 12 modificações, sem marcadores de
conflito, padrões de credenciais ou conteúdo preparado para commit.
`git diff --check` passou. Um novo `git fetch origin` ao final confirmou que
`origin/main` continua em `8ffd84e`; os ponteiros da main local e da origem
continuam preservados. O servidor de QA na porta 8021 foi encerrado.

## Testes desta rodada

O servidor local foi iniciado com Node e o Python científico existente, na porta
8021 para QA. A porta normal 8000 não foi interrompida. Não foram instaladas
dependências novas no ambiente: `pip check` confirmou consistência.

| Verificação executada | Resultado |
| --- | --- |
| `demo-modules.mjs` | 24 localidades; 200 pares com scores, WED, cosseno e rankings preservados |
| `map-geometry.mjs` | WGS84, regiões e clusters sem perda |
| `context-panel.mjs` | Contexto, abas, campos ausentes e seleção rápida |
| `ai-client.mjs` | Timeout, fallback, autenticação e prazo total |
| `intelligent-science.mjs` | Contratos, métricas/unidades, qualidade, incompatibilidade e limiares |
| `geological-discovery.mjs` | Grounding/429/cooldown, limites, fontes independentes, snapshots e deduplicação; fixtures identificadas |
| Dois módulos Python | 13 testes passaram |
| `scripts/verify_html.py` | 162 IDs únicos, 35 módulos; sintaxe, imports, assets, DOM e grafo válidos |
| `intelligent-api.mjs` | Servidor real: health, entradas, sessão e origem |
| `geological-real.mjs` | Quatro localidades reais, DEM e fontes independentes; resultados abaixo |
| `demo-browser.cjs` | WebGL, sidebar, sete destinos, seleção, filtros, gráficos, cadastro, exportação e mobile |
| `demo-refinement.cjs` | Tabelas dos dois corpos, scores animados, Escape e quatro resoluções |
| `map-redesign.cjs` | 24 pontos, clusters, cards, regiões, zoom, drag, teclado e mobile |
| `analysis-visual.cjs` | Conteúdo científico dos 24 locais, estilo fora da seção, gráficos, cards e animações |
| `intelligent-english.cjs` | Inglês inclusive com navegador pt-BR, validação, erros/429, dados/export preservados e quatro tamanhos; estilos de Comparisons idênticos com/sem CSS da análise |
| `geological-browser.cjs` | Wolfe real, detalhes em inglês, discovery pin, hover/clique/teclado e persistência após reload |
| `intelligent-diagnostics-browser.cjs` | Erg/Barringer reais, score ausente versus baixo, raio sugerido, JSON/GeoJSON e mobile |
| `intelligent-browser.cjs` | Aratanha real, formulário, etapas, sessão, histórico, animações e reduced motion; ciclo de candidato com fixture artificial explícita |
| Smoke das APIs existentes | Handlers Vercel health/reports, URL antiga, assets, health e validação de reports preservados; nenhum relatório oficial gravado |

O sucesso de fixtures não é tratado como prova de acesso externo. O ciclo de
candidato aprovado só usa fixture porque nenhum local real desta rodada passou
no limiar. Não foi executada implantação Vercel, nem geração de relatório oficial
persistido pela API antiga. Os scripts adicionais `intelligent-real-diagnostics.mjs`
e `RUN_REAL_DEM=1` não foram executados separadamente; seus cenários foram cobertos
pelas consultas reais e pelos testes de navegador indicados acima.

Logs desta rodada: `%TEMP%/paf-final-integration-qa/`. Resumos científicos reais:
`%TEMP%/paf-geological-qa/summary.json`. Capturas/exportações ficam nos diretórios
de QA existentes, fora do Git.

## Resultados reais

As quatro consultas concluíram o processamento técnico com 100% de pixels válidos
na ROI, usando Copernicus GLO-30 e a grade existente de 30 m. Dados reais de cache
foram reutilizados quando disponíveis; não foram substituídos por fixtures.

| Localidade | Resultado | Pins |
| --- | --- | --- |
| Wolfe Creek −19,17167 / 127,79556; 3 km; Lua | Censorinus, 11/11 métricas; **0,4606092924727341**, abaixo de 0,80 | Discovery; sem candidato |
| Barringer 35,0333 / −111,0167; 3 km; Lua | Censorinus, 11/11 métricas; **0,48561747862006044**, abaixo de 0,80 | Discovery; sem candidato |
| Erg Chebbi 31,1381 / −3,9761; 5 km; Marte | Score `null`; sete métricas específicas ainda ausentes | Discovery; sem candidato |
| Serra da Aratanha −3,97 / −38,63; 5 km; ambos | Scores `null`; sem feição comprovada para comparação | Nenhum |

Nenhum valor foi ajustado para forçar a regressão. Os dois scores numéricos
reproduzem as referências anteriores. DEM válido não foi confundido com
disponibilidade de métricas da feição.

Na rodada real da API, Gemini gerou interpretação para Wolfe e Aratanha; ficou
indisponível para Barringer e Erg. Google Search Grounding respondeu HTTP 429,
seguido do cooldown existente. Ciência e fontes independentes continuaram
funcionando. Não se declara pesquisa grounded bem-sucedida nesta conta.

## Limites e riscos preservados

A análise requer o servidor local Node/Python e origem loopback. As APIs
Vercel health/reports e o frontend existente foram preservados, mas o deploy
Vercel não executa `/api/analyze`. Não foram criados serviços de produção.

A ciência continua experimental, com as mesmas restrições de DEM, contorno,
referências planetárias e métricas de dunas ausentes. Serviços externos dependem
de rede/cota. O histórico persiste no navegador e os jobs do servidor ficam em
memória, como antes. Conteúdo grounded não integra o histórico/export científico.

Mensagens do aplicativo são apresentadas em inglês. Nomes próprios, entradas
do usuário e interpretações antigas já salvas mantêm seu conteúdo original;
uma nova análise solicita interpretação em inglês. Não se alterou a persistência
para reescrever textos históricos.

## Executar localmente

```powershell
cd "C:\Users\kauan\Desktop\Prose\nasa-space-apps-26"
$env:ANALYSIS_PYTHON = "$env:LOCALAPPDATA\PlanetaryAnalogFinder\venv\Scripts\python.exe"
& $env:ANALYSIS_PYTHON -m pip install -r requirements.txt
.\iniciar-analise-inteligente.bat
```

Abra `http://localhost:8000/#/intelligent`. O launcher foi inspecionado; o servidor
Node equivalente foi efetivamente iniciado para os testes, sem abrir janela de
navegador interativa. Não se modificou `.env` para executar QA.

## Revisão e autorização

```powershell
git status
git diff --check
git diff --stat origin/main
git diff --name-status origin/main
git diff origin/main
```

A branch está preparada localmente para revisão. Como não há autorização para
commit, ela ainda não contém um commit novo nem existe PR remoto. Commit, push,
abertura do PR e atualização da main ficam pendentes de sua autorização.
Quando autorizados, confirmar novamente `origin/main` antes de publicar; se ela
tiver avançado, integrar os novos trechos com segurança e repetir os testes
relevantes. O destino do PR será `main`, vindo de `integration/intelligent-analysis`.
Não usar push forçado. O primeiro push deve informar a branch explicitamente,
pois a branch local foi criada rastreando `origin/main`.
