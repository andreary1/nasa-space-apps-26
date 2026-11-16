# Descoberta geológica — implementação e verificação de 15/11/2026

Este documento registra o desenvolvimento na branch de origem. A integração
seletiva e a rodada atual de testes estão no [relatório de integração](integracao-analise-inteligente.md).

O fluxo agora investiga localidades fora das 24 oficiais. Wolfe Creek foi
encontrada em uma fonte científica independente, medida no DEM real e comparada
com a Lua sem cadastro específico no código. **Grounding Google não ficou
operacional nesta conta durante o teste: a API respondeu HTTP 429.** Essa falha
fica explícita e não interrompe as fontes científicas independentes.

## Inspeção e diagnóstico

Os caminhos citados na tarefa continuam válidos. Foram inspecionados worker
Python, extrator de borda, API, diagnósticos, Gemini, DEM, interface, ambos os
mapas, catálogos, documentação e testes. Não havia SDK Gemini instalado nem
manifesto Node com essa dependência. O cliente anterior usava o endpoint
compatível OpenAI para interpretação, sem ferramenta de pesquisa.

`feature_evidence.identify()` contém duas referências geográficas revisadas:
área de estudo de Erg Chebbi e vizinhança de Barringer. Não usa o nome digitado
para classificá-las. O bloqueio específico era
`needs_grid = identification.id == 'barringer'`; o extrator devolvia ainda o
ID fixo `barringer-dem`. Ambos foram generalizados. As referências existentes
permanecem e preservam a regressão anterior.

## Fluxo e separação de responsabilidades

1. API valida as coordenadas e agenda o job na arquitetura existente.
2. `research()` faz, quando habilitada, uma chamada à API oficial Gemini com
   `tools: [{google_search:{}}]`. O resultado citado é apresentado para leitura.
3. O Python consulta fontes geográficas independentes, com URLs fixas e
   identificadores vindos dos próprios catálogos, nunca URLs/comandos da IA.
4. Coordenadas, tipo, unidade, procedência e ambiguidade são verificados.
5. Copernicus/local/OpenTopography obtém o DEM pelo serviço existente.
6. Feições suportadas passam pela delimitação e métricas reais.
7. `compareScience()` usa o mesmo `buildComparison/calculateMatch`; nenhuma
   fórmula, referência, peso ou limiar foi alterado.
8. A interpretação Gemini recebe um snapshot científico sem conteúdo grounded.
9. Mapa e histórico distinguem descoberta de candidato aprovado.

Etapas da API são eventos reais; não há porcentagens de progresso simuladas.
Estados científicos: `discovered`, `source_verified`, `geometry_pending`,
`measured`, `comparison_ready`, `insufficient_evidence`. O resultado traz estado
final e estados alcançados. `comparison_ready` não significa score aprovado.
Falhas de rede/Python/DEM continuam separadas da ausência de evidências.

## Gemini, autenticação, disponibilidade e custos

Implementação via [REST oficial `generateContent`](https://ai.google.dev/api/generate-content),
sem introduzir SDK ou segundo processo. O endpoint de interpretação existente é
preservado. O [modelo Gemini 3.1 Flash-Lite](https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-lite)
documenta suporte a Google Search. Na execução real o modelo de pesquisa foi
`gemini-3.1-flash-lite`; a interpretação disponível de Wolfe Creek também usou
esse modelo. Nenhum modelo de interpretação foi substituído.

- Pesquisa padrão usa o modelo Gemini configurado. `GEMINI_SEARCH_MODEL`
  permite separar a escolha se o modelo atual não suportar grounding.
- Chave somente no header backend `x-goog-api-key`. `GEMINI_SEARCH_API_KEY`
  opcional; reutiliza `AI_API_KEY` apenas quando o provedor é Gemini.
- Falta de chave, modelo incompatível, falta de consultas/citações no retorno,
  erro HTTP ou timeout produzem `unavailable`. Sem pesquisa inferida a partir
  de memória do modelo. Com `ANALYSIS_DISCOVERY_ENABLED=0`, estado `disabled`.
- Até uma chamada Gemini por análise; timeout de 60 s; resposta de até 1 MB;
  sem retry automático. Limite local de doze chamadas por hora por processo.
  HTTP 401/403/429 pausa chamadas por dez minutos. Reiniciar o processo reinicia
  esses controles locais; não são limite de faturamento da conta.
- O prompt solicita até três consultas Google. O número de consultas internas
  é controlado pelo provedor; o código limita chamadas de API, não promete um
  teto de consultas internas. Consulte a cobrança da conta.
- Repetição da mesma entrada na mesma sessão reapresenta o resultado em memória
  por até duas horas; limite de 32 entradas. Não há cache compartilhado entre
  usuários ou banco de resultados grounded para processamento.

A [tabela de preços consultada](https://ai.google.dev/gemini-api/docs/pricing)
indica, para 3.1 Flash-Lite, tokens pagos a US$ 0,25/milhão de entrada de
texto/imagem/vídeo e US$ 1,50/milhão de saída. Grounding não disponível no nível
gratuito; no pago, 5.000 consultas/mês compartilhadas em Gemini 3+, depois
US$ 14/1.000 consultas, sujeito às cotas. Valores podem mudar; confira a página
e o plano da conta. HTTP 429 foi observado, sem presumir a causa exata da cota.

### Termos do grounding e validação independente

Os [termos de Google Search Grounding](https://ai.google.dev/gemini-api/docs/terms#grounding-with-google-search)
restringem coleta automatizada usando links grounded e uso desses resultados
como banco de dados. A aplicação não coleta páginas a partir desses links nem
extrai seus números para alimentar a ciência. O texto é exibido sem modificações,
com citações e sugestões Google; sugestões usam iframe isolado, sem scripts e
sem acesso à origem. Links são apresentados ao usuário, não seguidos pelo worker.

Cada alegação do modelo permanece `discovered`, não `source_verified`.
A ciência consulta fontes independentes e produz campos com `value`, `unit`,
`source`, `url`, `evidence_type`, `verification`; ausências são `null`. Esse
desenho atende à separação entre pesquisa, comprovação e medição sem usar Gemini
como fonte única. Não há verificação universal de toda frase do relatório.

## Fontes independentes e reconhecimento de localidades novas

### Crateras

O [Earth Impact Database hospedado pela NASA ARES](https://ares.jsc.nasa.gov/engagement/activities/resources/rocks-soils-and-surfaces/earth-impact-database.pdf)
é adquirido diretamente por endpoint configurado no código, independentemente do
Google. São 181 registros extraídos do PDF real. Validações: HTTPS/origem NASA,
limite de 2 MB, cabeçalho PDF, até dez páginas, estrutura de tabela, pelo menos
cem registros, hemisférios, intervalos e diâmetro em km convertido para metros.
O cache próprio da fonte dura 24 h e registra SHA-256/página/linha de origem.

O catálogo é histórico, não exaustivo, tem erros possíveis e coordenadas
arredondadas a 0,1°. O backend conserva a célula de arredondamento de ±0,05°,
em vez de declarar precisão inexistente. Só considera células que interceptem
a consulta. Múltiplos registros compatíveis bloqueiam seleção automática.

O nome oficial, tipo e diâmetro publicado orientam uma hipótese de medição.
O centro informado inicia a busca; nunca é tratado como centro confirmado.
O centro medido precisa permanecer na célula geográfica publicada e na ROI
com contexto. Um registro de coordenadas grosseiras, sem contorno validado,
não recebe pin preciso. Associação da borda à identidade histórica continua
experimental e sujeita a revisão, especialmente em regiões com várias depressões.

Não há condição, ID, coordenada ou diâmetro de Wolfe Creek em produção.
O mesmo adaptador pode investigar outros registros do catálogo. Não é um
detector universal de crateras desconhecidas da literatura.

### Dunas

Há um adaptador independente do [feed XML público UNESCO](https://whc.unesco.org/en/list/xml/),
para regiões cujo título oficial explicita dunas, erg ou sand sea. Verifica
coordenadas, identificador, proximidade e unicidade; ponto patrimonial não é
interpretado como máscara de areia. Rejeita entidades XML externas; limite de
8 MB, timeout de 15 s, cache de 24 h e pausa de dez minutos após falha.

**O feed retornou HTTP 403 nesta rede; não foi validada uma descoberta inédita
de dunas por esse adaptador ao vivo.** Seu parsing e rejeições foram testados
com fixtures isoladas. Regiões sem fonte independente suficiente ficam pendentes,
mesmo que o Gemini as mencione. Erg Chebbi mantém a referência geográfica revisada.

O registro `ANALYSIS_FEATURES_FILE` permanece como caminho para ingestão de
polígonos/medições revisados e `ANALYSIS_DEM_PATHS` para DEM de maior resolução.
A extração automática validada de redes de cristas/interdunas não foi implementada.
É necessário obter máscara de areia/ortoimagem, segmentar cristas e depressões,
validar proeminências, espaçamentos/FFT, orientação e contagem na mesma área,
e obter P/ET0 climatológico com fonte/período. Textura Sentinel-2 não é elevação;
climatologia NASA POWER não é fornecida pelo DEM. Essas fontes complementares
não são substituídas por estatísticas gerais do terreno.

## Medição e score

O extrator radial existente foi reutilizado com parâmetros em função do raio e
resolução, não de nomes. Conserva os 72 perfis, ajuste do centro, onze métricas,
contorno GeoJSON e verificações de NoData, parede/piso, dispersão radial,
proeminência e contexto. Continua experimental. Suporta apenas hipóteses de
crateras simples com diâmetro publicado até 4 km, resolução suficiente e borda
preservada. Crateras maiores, complexas, erodidas/soterradas ou contornos falhos
são rejeitados em vez de receber métricas padrão. O limite é de aplicabilidade
do extrator, não uma alteração dos limiares de similaridade.

Quando a semente informada falha em uma região recém-verificada, `locate_crater`
examina até seis depressões topográficas na área de contexto, cada uma sujeita
às mesmas validações radiais e geográficas. Depressão não é classificação de
impacto. Contornos distintos aceitos tornam a associação ambígua; não se escolhe
o contorno com maior score. O caminho inicial bem-sucedido de Barringer permanece
igual. Foram testadas semente deslocada e múltiplas depressões com fixtures
numéricas isoladas, além dos testes reais de localização.

Diâmetro publicado é prior de busca; o valor medido vem dos máximos do DEM.
Resolução de medição considera a fonte nativa, inclusive se a grade é reamostrada.
As estatísticas gerais da ROI não viram dimensões de dunas/crateras.

A comparação usa as onze métricas de crateras ou sete de dunas existentes.
Ausências não viram zero; unidades/escala/extensão/qualidade são verificadas.
As referências planetárias continuam herdadas, sem rastreabilidade individual
completa em `moon.js/mars.js`; os scores não são validação científica independente.

## Mapa, histórico e globo

- Oficiais: catálogo e contadores de 24 pontos intactos.
- Descobertas: camada `map-discoveries-layer`, borda tracejada, tipo/fonte/estado,
  tooltip “Descoberta — comparação pendente”, clique/teclado abre a análise.
  Não exige score aprovado; exige evidência independente e localização adequada.
- Candidatos: camada existente `map-candidates-layer`, somente critérios de
  score/cobertura/qualidade atendidos, com score e referência no tooltip.
- Por feição, o resultado mais recente determina a camada. Identificação estável
  vem do ID científico/fonte, não do UUID de cada job. Pequenas mudanças na
  coordenada solicitada não criam outra entidade do catálogo.
- Até doze resultados científicos com descoberta/candidato são preservados em
  `localStorage`, por até sete dias desde a gravação. Não há segredos ou conteúdo
  Google grounded nesse histórico, nos exports científicos ou no prompt de
  interpretação. Se armazenamento falhar, a aba mantém os resultados em memória.
- Globo 3D: renderer e seleção dependem do catálogo oficial/índices dos painéis.
  Integrar descobertas exigiria ampliar esse contrato. Priorizei o mapa 2D,
  conforme autorizado na tarefa; descobertas novas ainda não aparecem no globo.
  Rotação, zoom e seleção existentes foram preservados e testados.

## Resultados reais

Execução completa via API local, em 15/11/2026, mesmos parâmetros da tarefa.
Todos os DEMs tiveram 100% de cobertura na ROI, com grade de 30 m. Grounding
retornou `unavailable`/HTTP 429; não foi substituído por resultados simulados.

| Localidade | Evidência / medição | Similaridade | Mapa |
| --- | --- | --- | --- |
| Wolfe Creek −19,17167 / 127,79556, 3 km, Lua | Entrada encontrada entre 181 registros NASA; borda medida no DEM, 11/11 métricas | **0,4606092925**, Censorinus, abaixo de 0,80 | Descoberta; sem candidato aprovado |
| Barringer 35,0333 / −111,0167, 3 km, Lua | Referência revisada existente, borda medida | **0,4856174786**, Censorinus, igual à regressão anterior | Descoberta; sem candidato aprovado |
| Erg Chebbi 31,1381 / −3,9761, 5 km, Marte | Região documentada; sete métricas específicas ausentes | `null`, dados insuficientes | Descoberta da região; sem candidato |
| Aratanha −3,97 / −38,63, 5 km, ambos | Relevo real; sem fonte/contorno que comprove duna ou cratera | `null` em ambos | Sem descoberta/candidato |

Wolfe Creek, centro ajustado: −19,17176438 / 127,79528185. Valores medidos:

| Métrica | Valor |
| --- | ---: |
| diameter_m | 906,25 m |
| depth_m | 47,610490 m |
| depth_diameter_ratio | 0,052536 |
| rim_height_m | 18,228163 m |
| rim_height_diameter_ratio | 0,020114 |
| rim_variation_m | 3,424075 m |
| rim_radius_cv | 0,034345 |
| mean_wall_slope | 14,629597° |
| wall_slope_p90 | 27,130268° |
| circularity | 0,941366 |
| rim_coherence | 1,0 |

O diâmetro publicado de 875 m não foi copiado como medição. A região possui
31.428 pixels válidos; relevo geral 54,4855 m, declividade média 0,9016° e RMS
1,1445 m, valores distintos das métricas da feição. Incerteza horizontal de pelo
menos um pixel nativo (~31 m); nenhum valor é apresentado como levantamento
certificado. A interpretação ficou disponível para Wolfe Creek, Erg Chebbi e
Aratanha; ficou indisponível em uma chamada de Barringer, com ciência preservada.

Registros reais: `%TEMP%/paf-geological-qa/`, incluindo capturas, consultas e
`summary.json`, sem texto grounded. Esses dados gerados ficam fora do Git.
Para a rodada da integração na main, consulte o
[relatório de integração](integracao-analise-inteligente.md).

## Arquivos e verificações

Criados:

- `scripts/ai_reports/geological_discovery.mjs`: pesquisa oficial, limites/cache.
- `src/application/geological_discovery.py`: aquisição e validação independentes.
- `deliverables/demo/js/services/analysisSnapshot.js` e `discoveryStore.js`:
  separação/persistência de dados científicos.
- `tests/integration/geological-discovery.mjs`, `test_geological_discovery.py`,
  `geological-real.mjs`, `geological-browser.cjs`.
- Este relatório; o JSON de resultados reais permanece fora do Git.

Modificados:

- `src/application/intelligent_analysis.py`, `feature_evidence.py`:
  descoberta independente, extrator genérico e etapas.
- `scripts/ai_reports/intelligent_analysis.mjs`: integração e estados/pins.
- `deliverables/demo/index.html`, `js/app.js`, `components/intelligentAnalysis.js`,
  `components/worldMap.js`, `styles/intelligent.css`: painel/camadas/persistência.
- `requirements.txt` (`pypdf>=5,<7`, instalado/testado 6.21.4), `.env.example`,
  documentação e teste Python de terreno (descoberta desativada nas fixtures).

Testes: treze testes Python; contratos Node de grounding, segurança de saída,
falta de dados, tipos, unidades, estados, snapshots e deduplicação; quatro
localidades reais pela API; navegador com descoberta real/persistência;
mapa em quatro resoluções; WebGL/globo/sidebar/painéis/mobile; 200 comparações
iguais às originais; verificador HTML/imports/DOM; `git diff --check`.
Grounding bem-sucedido foi testado somente com fixture de protocolo isolada;
ao vivo, apenas indisponibilidade HTTP 429 foi verificada.

## Windows

Na primeira atualização, instale a nova dependência no mesmo ambiente existente:

```powershell
cd "C:\Users\kauan\Desktop\Prose\nasa-space-apps-26"
$env:ANALYSIS_PYTHON = "$env:LOCALAPPDATA\PlanetaryAnalogFinder\venv\Scripts\python.exe"
& $env:ANALYSIS_PYTHON -m pip install -r requirements.txt
.\iniciar-analise-inteligente.bat
```

Abra `http://localhost:8000/#/intelligent`. Sem processos adicionais ou Docker.
Pesquisa é habilitada por padrão, com a chave Gemini existente. Variáveis
opcionais documentadas em `.env.example`: `ANALYSIS_DISCOVERY_ENABLED`,
`GEMINI_SEARCH_MODEL`, `GEMINI_SEARCH_API_KEY`, `ANALYSIS_CATALOG_ENABLED`.
Não alterei `.env` ou credenciais.
Se receber 429, confira cota/faturamento/suporte no Google AI Studio; não há
ativação automática de plano pago. Para usar somente fontes independentes e
medições, configure `ANALYSIS_DISCOVERY_ENABLED=0`. Catálogos independentes
continuam ativos; `ANALYSIS_CATALOG_ENABLED=0` os desabilita separadamente.

Testes reproduzíveis com servidor ativo e Playwright de QA instalado:

```powershell
$env:DEMO_URL = 'http://127.0.0.1:8000/'
node tests/integration/geological-real.mjs
node tests/integration/geological-discovery.mjs
& $env:ANALYSIS_PYTHON -m unittest tests/integration/test_intelligent_analysis.py tests/integration/test_geological_discovery.py
node tests/integration/geological-browser.cjs
```

Não houve commit/push, alteração de credenciais, Git, catálogos científicos,
rasters originais, fórmula/pesos/limiares, layout global ou remoção de arquivos.
