# Integração seletiva do pipeline Felipe

## Escopo e referências Git

Checkout inicial: `main` em `05a0028`, árvore limpa. Após `git fetch origin`,
Felipe aponta para `2438034`, com os commits exclusivos `f1b8643`, `f25f56c` e
`2438034`. `origin/main` avançou para `73934e9`: a informação de **3 commits à
frente e 8 atrás da main remota** continua correta. Em relação ao checkout
efetivamente integrado, são 3 à frente e 5 atrás. Não foi feito pull, merge,
cherry-pick, commit ou push.

Foram aplicados apenas os hunks de processamento, matching, ingestão, pipeline,
constantes, dependências e testes pertinentes. Sete GeoTIFFs e suas entradas de
catálogo/manifesto vieram da branch, sem novo download científico. Os hashes dos
artefatos, commit de origem, caminho original e caminho relativo atual ficam no
manifesto. Nenhum arquivo de `deliverables/demo/` foi modificado.

## Comparação de comportamentos

| Elemento | Checkout inicial | Felipe | Integração implementada |
|---|---|---|---|
| Similaridade | WED + cosseno, vetores com zeros artificiais | pares finitos, pesos renormalizados, cobertura ≥60% | regras de Felipe + pesos efetivos no resultado, validação de configuração e vetores, proteção contra cobertura zero |
| Ausências | atributos ausentes e alguns zeros legítimos substituídos por defaults | `None` nos atributos, `NaN` interno, origem/avisos | sem imputação; booleanos/NaN/inf/valores fisicamente inválidos não entram; JSON estrito com `null` |
| Normalização | MinMax ajustado em referências não escalonadas | ajuste em Terra + referências escalonadas | Felipe, com novo ajuste por execução para não reutilizar universo antigo; colunas ausentes não pontuam |
| Bagnold | expressão existente dá 4,820752, mas nomes canônicos não acionavam as escalas | comprimentos ÷β, densidade ×β² | aplicação aos campos corretos; constantes preservadas, razões inválidas recusadas, `--no-scaling` mantido; hipótese explicitamente não calibrada |
| Dunas | `wavelength_m`/diagnósticos não correspondiam aos sete nomes ponderados | sete campos canônicos, métricas de DEM e azimute circular | alinhamento e aliases legados; densidade experimental não substitui cristas de catálogo; categorias continuam fora do vetor |
| Crateras | defaults como diâmetro 3000 m, profundidade 200 m, borda proporcional; sem exclusão por classe | 11 métricas medidas, raios/círculo, classes conservadoras | Felipe; `no_crater` excluído, `partial_ring` baixa confiança; falha/NoData não vira prova de ausência de cratera |
| Raster | associação por nome perdia underscores; resolução em graus/metres podia ser invertida | id pelo sufixo `_dem`, prioridade GeoTIFF, correção por latitude | Felipe + CRS/unidades projetadas reais, rejeição de CRS desconhecido, sem preenchimento de pixels por média; NPY exige resolução explícita no processador |
| Pipeline/relatório | auditoria/features/results/ranking, sem qualidade detalhada | `data_quality`, exclusões, cobertura, proveniência, log | schema aditivo, catálogos complementares por atributo, conflitos/fontes preservados, manifesto até o relatório, versão 1.1.0 |

## Fórmulas e alterações numéricas

Os pesos originais de dunas e crateras não foram alterados. Para um par, `J`
contém atributos válidos em ambos os lados; com pesos globais normalizados:

```
cobertura = soma(w_i para i em J)
se cobertura < 0,60, ou não houver peso disponível: sem score
peso_efetivo_i = w_i / cobertura
WED = sqrt(soma(peso_efetivo_i * diferença_i²))
k = 3 / sqrt(número TOTAL de atributos do contrato)
S = 0,60 * exp(-k * WED) + 0,40 * cosseno
```

O cosseno mantém a ponderação por multiplicação dos vetores pelos pesos,
como no motor Python inicial. Usa apenas os atributos lineares disponíveis.
Quando só há atributos circulares, o cosseno é indefinido (`null`), e o score
usa apenas `exp(-k*WED)`, como em Felipe. Vetores lineares nulos mantêm o
tratamento legado de cosseno zero, não uma alegação de semelhança perfeita.

Para azimutes de cristas, o período é 180°, não 360°:

```
d = abs(azimute_terra - azimute_referência) % 180
diferença_angular = min(d, 180 - d) / 90
```

Assim, 170° e 5° estão a 15°, não 165°. Esse atributo entra na WED e fica fora
do cosseno linear. A geometria lunar é preservada; não foi inventada uma fórmula
de correção de declividade pela gravidade.

### β: expressão preservada, não um número escolhido

Com as constantes já existentes:

```
g_ratio = 3,721 / 9,807
rho_ratio = 0,020 / 1,225
β = sqrt(g_ratio) / sqrt(rho_ratio) = 4,820752041935113
```

O valor 2,82 do contrato antigo não resulta dessa expressão e dessas constantes.
Não se alteraram gravidades/densidades para forçar esse resultado. A correção
ativa a regra de Felipe para `mean_height`, `height_p90`, `wavelength` e
`mean_spacing` (÷β), e para densidade areal comprovadamente compatível (×β²).
Azimute, aridez, razões e declividades não são escalonados.

Trata-se de uma **hipótese operacional herdada**, não de uma lei universal de
dimensões de dunas validada nesta integração. A literatura primária discute
escalas de arrasto/saturação e dependência do tamanho de grão, não valida
automaticamente este fator simplificado: [Claudin e Andreotti, 2006,
doi:10.1016/j.epsl.2006.09.004](https://www.phys.ens.fr/~foldingslidingstretchinglab/papers/A28_EPSL.pdf).
Mantém-se `--no-scaling` para análise de sensibilidade. O relatório registra
β, fórmula, razões físicas, flag de ativação e fator aplicado a cada atributo.

### Exemplo reproduzido com entrada idêntica

Vetor de Jericoacoara: `[6, 10.7, 297, 173, 3.99, 392, 0.468]`, referências
Python de Marte. Comparação direta dos motores, sem passar pelo bug antigo de
extração do vetor terrestre:

| Motor | Melhor referência | Score | WED | Cosseno | Cobertura |
|---|---|---:|---:|---:|---:|
| Python main `05a0028` | Proctor | 0,595224 | 0,558418 | 0,691714 | 1,00 aparente |
| Integrado, escalonamento ligado | Kaiser | 0,559203 | 0,639291 | 0,671440 | 0,90 |
| Integrado, `--no-scaling` | Proctor | 0,624704 | 0,484438 | 0,695731 | 0,90 |

As diferenças vêm da ativação do escalonamento nos nomes corretos, do ajuste do
MinMax nas referências transformadas, do azimute circular e da retirada da
aridez convencional. Não decorrem de mudanças nos coeficientes 0,60/0,40 ou nos
pesos do contrato. Um teste independente executa o motor antigo e confirma
igualdade até 12 casas para entradas lineares completas, sem escalonamento.

## Catálogos, definições e proveniência

`sitios.json` é prioritário; `data/earth/sites.json` complementa campos ausentes
recursivamente. A prioridade também vale entre aliases PT/EN. Zeros válidos não
são sobrescritos. Coordenadas conflitantes não são trocadas. Valores alternativos,
registros brutos, unidades e fontes são preservados em `_catalog_sources`,
`_catalog_conflicts` e `_catalog_field_sources`, dentro de `extra`.

Cada atributo carrega `raster:...`, `catalogo:campo@arquivo`, `derivado:fórmula`
ou `ausente`, além de avisos. `earth_features` conserva dados, proveniência e
metadados de aquisição. `data_audit.ingestion` incorpora o manifesto. Pares sem
score e motivos de exclusão ficam em `data_quality`; nada desaparece apenas
porque não entrou no ranking.

Os sete campos numéricos são altura média/P90, comprimento de onda, azimute de
crista, densidade de cristas, espaçamento e aridez. `tipo_duna` e
`padrao_distribuicao` continuam categóricos/passthrough, sem codificação numérica
inventada. `altura_p90` é uma medida independente: não é inferida da média.

`densidade_dunas` só é mapeada quando a unidade da fonte declara cristas/km²,
ou há definição explícita compatível. O nome canônico `dune_density` segue esse
contrato. A contagem de regiões de resíduo positivo do DEM, embora produzida pelo
experimento de Felipe, não foi considerada equivalente: fica em
`extra.raster_metrics` e não substitui uma densidade de catálogo válida.

P/ET0 terrestre vem de climatologia externa/catalogada; não sai de DEM. O zero
marciano permanece no catálogo bruto, identificado como convenção em
`feature_provenance` e `non_comparable_features`, mas vira ausência no vetor
de comparação. A cobertura máxima habitual de dunas, portanto, é 90%.

Riachão tem `dunes_detected=true` no catálogo secundário, mas também um aviso
explícito de provável falso positivo. O pipeline preserva o registro e o exclui
do ranking de dunas com o motivo em `data_quality.dunes_excluded`.

## DEM e ingestão

São preferidos GeoTIFF/TIFF a HGT e NPY para o mesmo id, sem truncar underscores.
NoData permanece inválido: métricas que precisam da malha completa ficam
indisponíveis, em vez de preencher pixels com média. Uma falha de extração não é
classificada automaticamente como `no_crater`. Catálogos disponíveis podem
complementar atributos, com sua origem explícita.

Para CRS geográfico, usa-se a aproximação local por latitude; para CRS projetado,
o fator de unidade do CRS (incluindo pés) converte para metros. CRS desconhecido
é recusado. Declividade usa passos x/y distintos; curvatura usa derivadas segundas
divididas pelos quadrados dos passos corretos. O helper de resolução mantém um
fallback explicitamente avisado por compatibilidade, mas os processadores não
assumem 30 m para NPY: é preciso passar `res_fallback_m` explicitamente.

O downloader COP30 usa coordenadas WGS84, valida a resposta GeoTIFF, CRS,
dimensões, pixels válidos e cobertura da coordenada solicitada antes de persistir.
Só cadastra um local novo após download validado. Recusa janela que cruza o
antimeridiano/polo e diâmetros inválidos; não deixa `.tmp` em caso de falha de
validação. Erros HTTP não expõem a chave. O contrato de API foi conferido na
[documentação oficial OpenTopography](https://opentopography.org/developers).
Os testes simulam a API: não houve consumo de chave ou novas requisições DEM.

## Arquivos e decisões seletivas

Modificados: `requirements.txt`, `sitios.json`, `src/shared/constants.py`,
`src/application/pipeline.py`, `src/matching/{engine.py,dunes/dune_matcher.py,
craters/crater_matcher.py,ranking/ranker.py}`, `src/processing/{dunes/dune_processor.py,
craters/crater_processor.py,shared/raster_io.py,shared/morphometrics.py}`, README,
contrato e teste E2E. O E2E gerou seu relatório durante a validação; seu fixture
versionado original foi reposto ao final, sem descartar alterações do usuário.
O resultado novo preservado para revisão é `matching_report_v2.json` e seu log.

Novos: `src/ingestion/earth/opentopography.py`, `src/processing/shared/catalog.py`,
`src/shared/data_quality.py`, testes de ingestão/matching/processamento e
`tests/integration/test_scientific_integration.py`; sete GeoTIFFs terrestres,
manifesto e relatório/log `matching_report_v2`. Funções centrais adaptadas:
`fit`, `match_one`, `match_many`, `_apply_physical_scaling`, `to_array`, `_build`,
`load_catalogs`, `catalog_metric`, `resolution_m`, `crater_morphometrics`,
`dune_morphometrics`, `build_data_quality`, `baixar_dem`, `generate_report`.

Deliberadamente não importados: HTML/demo Felipe, `scripts/demo_pipeline.js`,
builders visuais, verificador HTML antigo, runner PowerShell que recria o demo,
relatórios/cache/bytecode da branch e alterações remotas da interface posteriores
ao checkout. `test_demo_build.py` não foi importado nem executado: valida um
gerador que sobrescreve o frontend protegido. Os serviços e dados JS atuais
permanecem exatamente como estavam; não passaram a consumir o relatório Python.

## Validação e reprodução

Ambiente isolado de verificação: Python 3.12.16, NumPy 2.5.4, SciPy 1.18.1,
scikit-learn 1.9.1, rasterio 1.5.2, requests 2.34.2 e pytest 9.2.0, fora do repo.
O Python global 3.15 não foi alterado. Use um Python compatível e instale
`requirements.txt` e `pytest` para repetir:

```powershell
python -m pytest tests/matching tests/processing tests/ingestion tests/integration/test_scientific_integration.py tests/integration/test_pipeline_e2e.py -q
python -m src.application.pipeline --filename matching_report_v2.json
python -m src.application.pipeline --output <pasta-temporaria> --filename no_scaling.json --no-scaling --log none
python scripts/verify_html.py
node tests/integration/demo-modules.mjs
git diff --check
```

O teste E2E antigo retorna objetos e causa quatro avisos do pytest; isso não
representa falha de cálculo. Seu runner standalone foi corrigido para sair com
código não zero se uma etapa falhar. Foram verificados também os GeoTIFFs reais
importados (hash, pixels e coordenadas) e a cratera de Barringer; demais tolerâncias
morfológicas continuam testes sintéticos, não validação geológica ampla.

Resultado final executado: **48 testes Python passaram**, além do runner E2E
standalone, pipeline padrão e `--no-scaling` (todos com exit code 0). O relatório
padrão contém 8 sítios de dunas e 7 de crateras; melhor par global Barringer–Bessel,
score 0,8711. O relatório foi validado como JSON estrito e os sete rasters
importados têm proveniência de ingestão na auditoria. O verificador HTML e os
testes JS existentes passaram (200 comparações legadas). **Os 37 arquivos de
`deliverables/demo/` têm os mesmos hashes SHA-256 de antes da tarefa.**

## Limitações restantes

- Não há calibração científica que resolva universalmente a escala de Bagnold.
  Scores e rankings são relativos ao conjunto MinMax e não probabilidades.
- A densidade experimental de cristas/regiões não foi equiparada por hipótese.
  Métricas do catálogo externo não são reproduzíveis sem seus geradores.
- COP30 é DSM de 30 m; vegetação, construções, água em crateras e feições menores
  que a resolução afetam resultados. Profundidade de Pingualuit refere-se à
  superfície do lago, não à batimetria.
- Recusa conservadora de pixels ausentes pode reduzir cobertura; não há módulo
  validado de interpolação/máscara espectral nesta integração.
- Não se implementou correção de declividade pela gravidade lunar sem fórmula.
  Os DEMs de Marte/Lua ainda não substituem automaticamente suas tabelas fixas.
- O frontend foi congelado por exigência desta tarefa, inclusive sua lógica JS.
  O relatório científico é produzido pelo backend; ligar esse relatório à UI
  exigiria uma integração de dados separada, sem confundir os dois métodos.

## Invent?rio final de arquivos

| Estado | Arquivo |
|---|---|
| Modificado | `README.md` |
| Modificado | `docs/methodology/data-contract.md` |
| Modificado | `requirements.txt` |
| Modificado | `sitios.json` |
| Modificado | `src/application/pipeline.py` |
| Modificado | `src/matching/craters/crater_matcher.py` |
| Modificado | `src/matching/dunes/dune_matcher.py` |
| Modificado | `src/matching/engine.py` |
| Modificado | `src/matching/ranking/ranker.py` |
| Modificado | `src/processing/craters/crater_processor.py` |
| Modificado | `src/processing/dunes/dune_processor.py` |
| Modificado | `src/processing/shared/morphometrics.py` |
| Modificado | `src/processing/shared/raster_io.py` |
| Modificado | `src/shared/constants.py` |
| Modificado | `tests/integration/test_pipeline_e2e.py` |
| Criado | `data/earth/craters/barringer_dem.tif` |
| Criado | `data/earth/craters/lonar_dem.tif` |
| Criado | `data/earth/craters/pingualuit_dem.tif` |
| Criado | `data/earth/dunes/erg_chebbi_dem.tif` |
| Criado | `data/earth/dunes/rub_al_khali_dem.tif` |
| Criado | `data/earth/dunes/sossusvlei_dem.tif` |
| Criado | `data/earth/dunes/white_sands_dem.tif` |
| Criado | `data/earth/manifesto_opentopography.json` |
| Criado | `data/processed/comparisons/matching_report_v2.json` |
| Criado | `data/processed/comparisons/matching_report_v2.log` |
| Criado | `docs/methodology/pipeline-integration-felipe.md` |
| Criado | `src/ingestion/earth/opentopography.py` |
| Criado | `src/processing/shared/catalog.py` |
| Criado | `src/shared/data_quality.py` |
| Criado | `tests/ingestion/test_opentopography.py` |
| Criado | `tests/integration/test_scientific_integration.py` |
| Criado | `tests/matching/test_missing_data_and_scaling.py` |
| Criado | `tests/processing/test_provenance_and_metrics.py` |
| Criado | `tests/processing/test_raster_discovery.py` |
