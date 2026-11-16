# Integração seletiva da Análise Inteligente — 15/11/2026

Registro histórico da primeira integração. A versão inglesa preparada sobre a
main mais recente está no [relatório atual](integracao-intelligent-analysis-main.md).

Integração implementada e testada em `integration/analise-inteligente`, sem
commit, push ou Pull Request. A árvore de trabalho contém a main atual mais
a funcionalidade. Revise as alterações antes de publicá-las.

## Base e estratégia

| Item | Estado confirmado |
| --- | --- |
| Branch inicialmente aberta | `main`, limpa e igual a `origin/main` |
| Origem da funcionalidade | `feat/cruzamento-de-dados`, commit `4eb8432` |
| Base usada na integração | `origin/main`: `e292a49a53dd9253014437612cbc79bd55a5656e` |
| Ancestral comum | `2cb9e6e4438529bf7f37308122e313facab629d4` |
| Nova branch | `integration/analise-inteligente`, criada da base acima |
| Remoto | `https://github.com/andreary1/nasa-space-apps-26.git` |

Foram inspecionados status, branches, remotos, histórico, diferenças e arquivos
novos. Executado `git fetch origin`, sem pull. Os commits exclusivos da origem
são `5d7af8c` e `4eb8432`. A main possui onze commits exclusivos, incluindo
traduções, marca GeoEcos, imagens, catálogo decorado, navegação simplificada,
comparação apenas com corpo compatível e configuração Vercel.

Embora os dois commits da origem concentrem a funcionalidade, também modificam
arquivos compartilhados e contêm JSONs gerados localmente. Foi escolhida a
integração manual seletiva: arquivos exclusivos necessários foram transportados;
nos arquivos compartilhados, somente os pontos de conexão foram acrescentados.
Não foi executado merge ou cherry-pick. Os ponteiros de `main` e da branch de
origem foram preservados. Nenhum arquivo preexistente foi removido.

## Arquivos adicionados

| Área | Arquivos |
| --- | --- |
| Interface | `deliverables/demo/js/components/intelligentAnalysis.js`, `deliverables/demo/styles/intelligent.css` |
| Estado e exportação | `deliverables/demo/js/services/analysisSnapshot.js`, `deliverables/demo/js/services/discoveryStore.js` |
| API e pesquisa | `scripts/ai_reports/intelligent_analysis.mjs`, `scripts/ai_reports/analysis_diagnostics.mjs`, `scripts/ai_reports/geological_discovery.mjs` |
| DEM e evidências | `src/application/intelligent_analysis.py`, `src/application/feature_evidence.py`, `src/application/geological_discovery.py` |
| Inicialização | `iniciar-analise-inteligente.bat` |
| Documentação | `docs/analise-inteligente.md`, `docs/descoberta-geologica.md`, `docs/diagnostico-analise-inteligente.md`, este relatório |
| Contratos e API | `tests/integration/intelligent-science.mjs`, `intelligent-api.mjs`, `geological-discovery.mjs` no mesmo diretório |
| Testes reais | `tests/integration/geological-real.mjs`, `intelligent-real-diagnostics.mjs` |
| Navegador | `tests/integration/intelligent-browser.cjs`, `intelligent-diagnostics-browser.cjs`, `geological-browser.cjs` |
| Python | `tests/integration/test_intelligent_analysis.py`, `test_geological_discovery.py` |

Os onze arquivos de execução exclusivos da funcionalidade são iguais à origem
(desconsiderando finais de linha). Os testes novos só receberam adaptações ao
número de destinos e aos textos da main. A documentação distingue os registros
históricos da origem desta rodada e remove links para JSONs gerados excluídos.

## Arquivos compartilhados modificados

| Arquivo | Alteração seletiva |
| --- | --- |
| `deliverables/demo/index.html` | Ícone, botão de navegação, seção da análise, duas camadas e contadores separados no mapa |
| `deliverables/demo/js/app.js` | Importação/inicialização do componente e callbacks de pins para abrir resultados |
| `deliverables/demo/js/navigation.js` | Rota `intelligent`, nome “Análise Inteligente” |
| `deliverables/demo/js/components/worldMap.js` | Renderização separada de descobertas/candidatos e interação com seus pins |
| `deliverables/demo/styles/main.css` | Importação do CSS exclusivo da funcionalidade |
| `scripts/ai_reports/server.mjs` | Importação e despacho de `handleAnalysis`; rotas existentes preservadas |
| `requirements.txt` | Acrescentado `pypdf>=5,<7`; demais dependências mantidas |
| `.env.example` | Variáveis opcionais comentadas, sem credenciais reais |
| `deliverables/demo/README.md` | Links para configuração e explicação da necessidade do servidor local |
| `tests/integration/demo-browser.cjs` | Traduções/formatos atuais, destinos existentes, corpo compatível e serviço de exportação atual |
| `tests/integration/demo-refinement.cjs` | Troca de localidade para testar os dois corpos; espera pelo score animado final |
| `tests/integration/analysis-visual.cjs` | Removida a expectativa da rota `settings`, já removida na main |

São 25 arquivos adicionados e 12 modificados. Os arquivos novos também foram
inspecionados; não dependem de arquivos locais omitidos para carregar os módulos.
Na conferência final, `git diff --check` passou, sem conflitos ou padrões de
credenciais nos arquivos alterados. O diff completo inclui os arquivos novos:
37 arquivos, 25 adições e 12 modificações. Um segundo `git fetch origin`
confirmou a mesma base da main. O servidor de QA na porta 8017 foi encerrado.

## Alterações deliberadamente excluídas e conflitos resolvidos

Não foram transportados `docs/descoberta-geologica-resultados.json` nem
`docs/diagnostico-analise-inteligente-resultados.json`. Capturas, DEMs baixados,
resumos de execução, caches, ambientes virtuais e credenciais ficam fora do Git.
O `.env` não foi copiado, editado ou acrescentado ao Git.

Não foram revertidas traduções, branding, imagens, estilos globais, catálogo
decorado ou navegação da main. A sidebar tem os seis destinos atuais mais
Análise Inteligente: sete destinos. A rota `settings` não foi restaurada.
A comparação compacta continua mostrando somente o corpo compatível.
O serviço de exportação existente foi testado diretamente, pois a main já não
apresenta seu antigo botão. Nenhum botão foi reinserido para satisfazer o teste.

Não houve conflito textual de merge, pois não se fez merge. Os conflitos de
comportamento foram resolvidos adaptando os pontos de entrada e as expectativas
dos testes à main. Antes da integração, três testes de navegador já falhavam:
`demo-browser.cjs` esperava tabela em português, `demo-refinement.cjs` esperava
alternância incompatível e `analysis-visual.cjs` procurava `settings`.
Os ajustes não mudam o comportamento do produto para restaurar essas expectativas.

Fórmulas, pesos, normalização, limiares, dados oficiais, referências e rasters
não foram editados. Também permanecem idênticos a `origin/main`: componentes do
globo e comparação compacta, seleção de localidades, formulários existentes,
clientes Gemini/relatórios, `api/`, `vercel.json` e `.vercelignore`.
Os novos pins só aparecem no mapa 2D, separados dos 24 pontos oficiais.

## Validação executada nesta integração

Servidor real iniciado em `http://127.0.0.1:8017/`, com o Python científico
existente. A porta 8000 não foi interrompida. Testes e capturas não foram
adicionados ao catálogo nem aos arquivos de dados do projeto.

| Teste executado | Resultado |
| --- | --- |
| `demo-modules.mjs` | 24 localidades e 200 pares com scores, WED e cosseno iguais ao algoritmo original; referências, rankings e tabelas preservados |
| `map-geometry.mjs` | Projeção WGS84, regiões e clusters sem perda |
| `context-panel.mjs` | Abas, contexto, campos ausentes e seleção rápida |
| `ai-client.mjs` | Timeout, fallback, autenticação e prazo total |
| `intelligent-science.mjs` | Entradas, métricas/unidades ausentes, incompatibilidade, qualidade, limiares e interpretação estruturada |
| `geological-discovery.mjs` | Grounding oficial com fixture isolada, HTTP 429/cooldown, limites, fontes independentes, snapshots e deduplicação |
| `intelligent-api.mjs` | API local real: health, validação de entradas, sessão e origem |
| Dois módulos Python de integração | 13 testes passaram, incluindo DEM sintético, borda ausente, extrator e catálogos |
| `scripts/verify_html.py` | 162 IDs únicos, 34 módulos; assets, sintaxe, imports, referências DOM e grafo sem ciclos |
| `demo-browser.cjs` | Inicialização, WebGL, sidebar, seleção, filtros, gráficos, cadastro, JSON, teclado e mobile |
| `demo-refinement.cjs` | Tabelas dos dois corpos, quatro tamanhos, score animado, Escape e ausência de erros de console |
| `analysis-visual.cjs` | Conteúdo científico dos 24 locais, estilos fora da seção, cards, gráficos e animações preservados |
| `map-redesign.cjs` | 24 pontos, clusters, filtros, regiões, zoom, drag, teclado e quatro tamanhos |
| `intelligent-browser.cjs` | Aratanha real, validação, etapas, isolamento, histórico, quatro tamanhos; ciclo de candidato com fixture explicitamente artificial |
| `geological-browser.cjs` | Wolfe real, pin de descoberta, hover/click/teclado, persistência após reload, catálogo oficial intacto e mobile |
| `intelligent-diagnostics-browser.cjs` | Erg/Barringer reais, score ausente versus baixo, sugestão de raio, downloads JSON/GeoJSON e mobile |
| `geological-real.mjs` | Quatro localidades reais pela API; detalhes abaixo |
| Auditoria Git/código | Áreas protegidas iguais à main, núcleo da funcionalidade igual à origem, sem caches/rasters/segredos adicionados |
| Smoke das APIs existentes | Importação dos handlers Vercel, health, método inválido em reports; servidor local e URL antiga, assets, reports inválido e 404 preservados |

Não foi feita geração de relatório oficial persistido pela API antiga, para
evitar alterar `ai-reports.json`. Não houve deploy Vercel. Os testes positivos
de candidato aprovado usam exclusivamente fixtures identificadas nos testes.

Logs: `%TEMP%/paf-integration-qa/`. Resumos científicos da rodada real:
`%TEMP%/paf-geological-qa/summary.json`. Capturas e exports também ficam nos
diretórios de QA do Windows. Os testes `intelligent-real-diagnostics.mjs` e a
opção adicional `RUN_REAL_DEM=1` de `intelligent-api.mjs` foram transportados,
mas não executados separadamente nesta rodada; os casos correspondentes foram
cobertos pelos testes reais e de navegador listados acima.

## Resultados científicos reais

Todas as quatro consultas completaram o processamento técnico, com 100% de
pixels válidos no DEM Copernicus GLO-30, grade de 30 m. O cache real existente
foi reutilizado quando disponível; não houve substituição por fixtures.

| Localidade e entrada | Resultado | Pins |
| --- | --- | --- |
| Wolfe Creek −19,17167 / 127,79556; 3 km; Lua | NASA independente, borda medida, 11 métricas; Censorinus, **0,4606092924727341**, abaixo de 0,80 | Descoberta, sem candidato |
| Barringer 35,0333 / −111,0167; 3 km; Lua | Borda medida, 11 métricas; Censorinus, **0,48561747862006044**, igual à regressão anterior, abaixo de 0,80 | Descoberta, sem candidato |
| Erg Chebbi 31,1381 / −3,9761; 5 km; Marte | Campo de dunas documentado; faltam sete métricas específicas; score `null`, `insufficient_data` | Descoberta, sem candidato |
| Serra da Aratanha −3,97 / −38,63; 5 km; ambos | DEM real; sem feição delimitada/comprovada para comparação; score `null` em ambos | Nenhum |

Nenhuma localidade real foi aprovada como análogo. Os dois scores calculados
reproduziram as referências experimentais sem alterar qualquer parâmetro.
Erg Chebbi e Aratanha não foram rejeitados por score baixo: o score não existe.
Cobertura de DEM não foi confundida com cobertura de métricas geomorfológicas.

Nesta rodada, Google Search Grounding respondeu **HTTP 429** na tentativa real;
as seguintes consultas receberam o estado indisponível/cooldown, sem pesquisa
simulada. A interpretação Gemini esteve disponível para Wolfe e Aratanha e
indisponível para Barringer e Erg. Essa disponibilidade externa não mudou os
cálculos. Sucesso do protocolo de grounding foi validado com fixture, não com
uma resposta bem-sucedida do serviço real.

## Limitações preservadas

A nova API requer execução local Node/Python e aceita origem loopback.
O deploy Vercel existente continua com frontend e APIs health/reports; ele não
executa `/api/analyze`. Não foram acrescentados workers ou serviços de produção.
O usuário verá a nova seção no frontend estático, mas deve usar o launcher local
para processar. Não se declara que a análise científica foi implantada na Vercel.

O extrator continua experimental; limites de resolução/contorno e métricas de
dunas ausentes permanecem explícitos. Referências planetárias conservam suas
limitações de procedência. Gemini e fontes externas dependem de cota/rede.
O histórico científico persiste localmente no navegador; conteúdo grounded não
é persistido ou exportado. Jobs em memória do servidor não são um serviço durável.

## Executar e revisar no Windows

As alterações já estão na branch de integração aberta. No PowerShell:

```powershell
cd "C:\Users\kauan\Desktop\Prose\nasa-space-apps-26"
$env:ANALYSIS_PYTHON = "$env:LOCALAPPDATA\PlanetaryAnalogFinder\venv\Scripts\python.exe"
& $env:ANALYSIS_PYTHON -m pip install -r requirements.txt
.\iniciar-analise-inteligente.bat
```

Abra `http://localhost:8000/#/intelligent`. Configure a chave Gemini no ambiente
local já existente caso necessário. Nenhuma chave deve entrar no Git.
Para repetir os contratos e a rodada real com o servidor ativo:

```powershell
$env:DEMO_URL = 'http://127.0.0.1:8000/'
node tests/integration/demo-modules.mjs
node tests/integration/intelligent-science.mjs
node tests/integration/geological-discovery.mjs
& $env:ANALYSIS_PYTHON -m unittest tests/integration/test_intelligent_analysis.py tests/integration/test_geological_discovery.py
node tests/integration/geological-real.mjs
py scripts/verify_html.py
git status
git diff --check
git diff origin/main --stat
git diff origin/main
```

Os testes `.cjs` requerem Playwright e Chrome; neste ambiente foi usado
`$env:PLAYWRIGHT_MODULE = Join-Path $env:TEMP 'paf-browser-qa/node_modules/playwright'`.
Playwright de QA não foi adicionado como dependência de produção.

## Publicação somente após sua revisão

Os arquivos permanecem sem commit. Os novos arquivos estão marcados apenas com
intenção de inclusão (`git add -N`) para aparecerem no diff; nenhum conteúdo foi
preparado para commit. A branch foi criada rastreando `origin/main`; portanto,
use sempre o destino explícito no primeiro push, conforme abaixo.

Após revisar os 37 arquivos e confirmar o escopo, estes são comandos para você
executar, não ações realizadas automaticamente:

```powershell
git add -- .env.example requirements.txt iniciar-analise-inteligente.bat deliverables/demo/README.md deliverables/demo/index.html deliverables/demo/js/app.js deliverables/demo/js/navigation.js deliverables/demo/js/components/worldMap.js deliverables/demo/js/components/intelligentAnalysis.js deliverables/demo/js/services/analysisSnapshot.js deliverables/demo/js/services/discoveryStore.js deliverables/demo/styles/main.css deliverables/demo/styles/intelligent.css scripts/ai_reports/server.mjs scripts/ai_reports/intelligent_analysis.mjs scripts/ai_reports/analysis_diagnostics.mjs scripts/ai_reports/geological_discovery.mjs src/application/intelligent_analysis.py src/application/feature_evidence.py src/application/geological_discovery.py docs/analise-inteligente.md docs/descoberta-geologica.md docs/diagnostico-analise-inteligente.md docs/integracao-analise-inteligente.md tests/integration/demo-browser.cjs tests/integration/demo-refinement.cjs tests/integration/analysis-visual.cjs tests/integration/intelligent-science.mjs tests/integration/intelligent-api.mjs tests/integration/intelligent-browser.cjs tests/integration/intelligent-diagnostics-browser.cjs tests/integration/intelligent-real-diagnostics.mjs tests/integration/geological-discovery.mjs tests/integration/geological-real.mjs tests/integration/geological-browser.cjs tests/integration/test_intelligent_analysis.py tests/integration/test_geological_discovery.py
git diff --cached --check
git diff --cached --stat
git commit -m "feat: integrar analise inteligente preservando a main"
git push -u origin integration/analise-inteligente
```

No GitHub, crie o PR com base `main` e comparação
`integration/analise-inteligente`. Título sugerido: “Integrar Análise Inteligente
com descoberta geológica e processamento local de DEM”. Descreva o comportamento
novo, a preservação das 24 localidades e das telas existentes, os testes desta
rodada, os scores reproduzidos e as limitações de Grounding/Vercel. Não marque
como concluída uma implantação de análise em nuvem que não foi implementada.
