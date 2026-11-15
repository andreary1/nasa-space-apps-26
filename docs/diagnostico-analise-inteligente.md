# Diagnóstico da Análise Inteligente — 15/11/2026

A falha principal estava entre `terrain()` e `compareScience()`: o primeiro
calculava sete estatísticas gerais da ROI, enquanto o segundo exigia onze
métricas de cratera ou sete de dunas, vinculadas a uma feição revisada. Sem
`ANALYSIS_FEATURES_FILE`, `reviewed_feature()` retornava `None`. A condição de
compatibilidade impedia chamar `buildComparison()`. A mensagem genérica ocultava
esse bloqueio. Não era falha de download, nem score baixo, nem erro de normalização.

Ter 100% de pixels válidos no DEM não significa ter 100% das métricas do score.
`relief_m` não é profundidade de cratera nem altura de duna; `slope_mean_deg` da
ROI não é `mean_wall_slope`. Não fiz conversões desse tipo.

## Correções e funções responsáveis

| Arquivo / função | Comportamento |
| --- | --- |
| `src/application/intelligent_analysis.py`: `terrain`, `analyze` | Preserva extração real e NoData. Emite etapas de sucesso separadas, registra resolução nativa aproximada em metros e disponibiliza grade métrica ao extrator de feição. Cache de métricas versionado; arquivos originais preservados. |
| `src/application/feature_evidence.py`: `identify` | Reconhece a área de estudo de Erg Chebbi e a vizinhança documentada de Barringer por coordenadas e fontes primárias. Nomes e corpo escolhido não classificam feições. Caixa de estudo não é máscara de areia. |
| `feature_evidence.py`: `measure_crater` | Delimita a borda de Barringer no DEM por 72 máximos radiais e ajuste do centro. Calcula métricas e devolve polígono, perfis, resolução, método e limitações. Falhas de contorno não recebem valores padrão. |
| `scripts/ai_reports/intelligent_analysis.mjs`: `compareScience` | Aceita métricas revisadas ou medidas pelo extrator validado. Valida unidade, fonte, escala e extensão. Chama o algoritmo existente somente com todas as métricas. Registra ranking, validações e resultados por corpo. |
| `scripts/ai_reports/analysis_diagnostics.mjs`: `catalogAudit`, `comparisonDiagnosis` | Audita proximidade das 24 localidades sem copiar valores/scores e separa falta de dados, incompatibilidade, score baixo e qualidade insuficiente. Expõe referências carregadas e linhas de normalização. |
| `intelligent_analysis.mjs`: `handleAnalysis` | Acrescenta motivos reais às etapas da API. Falhas técnicas têm `status:error` e `diagnosis.outcome:technical_failure`, sem resultado científico simulado. |
| `deliverables/demo/js/components/intelligentAnalysis.js` | Exibe “Detalhes técnicos da análise”, fontes e motivos; exporta JSON completo e GeoJSON de contorno; prepara nova consulta com raio sugerido quando faltar entorno. Pins usam centro medido, quando disponível. |

O registro revisado existente continua disponível para feições novas. O frontend
não pode enviar valores de medições ou aprovar sua própria evidência. A nova
medição automática é experimental, não se declara revisão humana concluída.

## Extração de Barringer

A localização arredondada e o diâmetro publicado de 1.186 m vêm do
[Lunar and Planetary Institute](https://www.lpi.usra.edu/science/kring/epo_web/impact_cratering/World_Craters_web/northamericacraters/Barringer.html).
O ponto inicial do catálogo local apenas inicia a busca; o centro é ajustado
ao relevo real. O diâmetro publicado é prior de busca, nunca valor copiado para o score.

- Busca de máximos em 72 direções, entre 0,65 e 1,35 do raio de referência;
  interpolação bilinear e passo de meio pixel não aumentam a resolução declarada.
- Ajuste de centro por mínimos quadrados, até quatro iterações; diâmetro medido
  pela média dos raios observados. O anel de 72 vértices permanece disponível.
- Profundidade: mediana da borda menos P5 do interior a menos de 0,6 R.
- Altura da borda: mediana das diferenças entre borda e entorno por direção,
  amostrado de 1,5 a 2 R. Variação: desvio padrão das elevações dos 72 pontos.
- Parede: declividade média/P90 no anel 0,6–0,95 R; circularidade do contorno
  observado; CV dos raios e fração das bordas elevadas sobre piso e entorno.
- Bloqueios próprios da extração: NoData, resolução insuficiente, ajuste instável,
  máximos encostando na janela, dispersão radial excessiva, borda sem proeminência,
  piso/parede insuficientes ou contexto fora da ROI. Esses testes validam a
  medição, não alteram os limiares de aprovação.

A incerteza horizontal é de pelo menos um pixel nativo (~31 m); não foi estimada
uma distribuição de incerteza vertical. DSM, reamostragem, amostragem e contorno
afetam os valores, especialmente circularidade e variação de borda. Não é um
levantamento certificado. Existe levantamento LiDAR específico
[NCALM/OpenTopography](https://catalog.data.gov/dataset/meteor-crater-az), com
CRS EPSG:26912. Um GeoTIFF de elevação em metros, obtido desse levantamento,
pode ser utilizado por `ANALYSIS_DEM_PATHS`; definir grade de 10 m sobre Copernicus
não cria um DEM de 10 m. Nenhum download LiDAR autenticado foi simulado.

## Catálogos e normalização

`sites.js` contém 24 localidades, coordenadas, tipo, métricas e narrativas, mas
não informa, por métrica, fonte, método, resolução e área de amostragem. O contexto
geográfico também identifica informações pendentes de revisão. A proximidade
encontra Erg Chebbi (~1,48 km do ponto cadastrado) e Barringer (~0,85 km), mas
nunca promove automaticamente esses números a medições verificadas. Tolerâncias
de **busca**, não de equivalência científica: 2 km para dunas e 1,2 km para crateras.
Não há cópia de score ou de métrica para a ROI consultada.

As referências carregadas são exatamente os arrays existentes:

- Lua (9): Shackleton, Cabeus, Copernicus, Tycho, De Gerlache, Censorinus, Bessel,
  Alfraganus e Aristarchus.
- Marte (7): Namib, Bagnold, Nili Patera, Proctor, Olympia Undae, Kaiser e Hellespontus.

Todos possuem os campos numéricos esperados; isso não equivale à validação da
procedência de cada número. `moon.js` e `mars.js` não têm fontes individuais
completas. Existem manifestos de rasters em `data/moon/craters/fontes.json` e
`data/mars/dunes/fontes.json`, mas não comprovação de derivação de cada valor
desses arrays. A análise informa essa limitação. Ela carrega os arrays, não
reprocessa rasters planetários em cada consulta. Scores continuam experimentais.

`buildComparison → calculateMatch → scaledTarget / normalizePair` foi preservado:
normalização pelo máximo do par, WED, cosseno ponderado, combinação
`0,6 exp(−2,2 WED) + 0,4 cosseno`, pesos e fator Bagnold 2,82 existentes.
Ausências não viram zero nem causam redistribuição de pesos.

## Resultados reais

Executados em 15/11/2026 com Copernicus GLO-30 público, grade de 30 m, mesmas
coordenadas solicitadas. Todos tiveram processamento técnico bem-sucedido e
100% de cobertura de pixels válidos. Cache real reaproveitado quando disponível;
não houve substituição por fixtures. A consulta adicional de 3 km adquiriu novos
recortes reais. Os registros completos e resumo reproduzível ficam em
`%TEMP%/paf-diagnostic-qa/`; uma cópia do resumo está em
[diagnostico-analise-inteligente-resultados.json](diagnostico-analise-inteligente-resultados.json).

| Consulta | Lua | Marte | Aprovação |
| --- | --- | --- | --- |
| Aratanha −3,97 / −38,63, 5 km | Score ausente: sem feição delimitada | Score ausente: sem feição delimitada | Sem pin; dados específicos insuficientes. Não é declaração de inexistência de feições. |
| Erg Chebbi 31,1381 / −3,9761, 5 km | Incompatibilidade: campo eólico × catálogo de crateras | Score ausente: faltam as sete métricas verificadas de dunas | Sem pin; não foi rejeitado por score baixo. |
| Barringer 35,0333 / −111,0167, 2 km | Score ausente: entorno necessário exige raio de aproximadamente 2,069 km a partir desse centro | Incompatibilidade: cratera × catálogo de dunas | Sem pin; consulta insuficiente para o contexto do método. A UI sugere 2,5 km. |
| Mesma Barringer, teste adicional de 3 km | Score **0,4856174786**, melhor referência Censorinus, 11/11 métricas | Incompatibilidade: cratera × dunas | Sem pin: score abaixo de **0,80**, com cobertura de métricas e DEM de 100%. |

O teste adicional da API em 35,0275 / −111,0228, raio 2 km, também mediu a borda:
score **0,4850400981**, abaixo de 0,80. Centros diferentes mudam a fase da grade
e a amostragem; não se deve interpretar casas decimais como precisão científica.

Estatísticas gerais da ROI, na ordem mínimo / máximo / média / relevo (m),
declividade média / P90 (°), rugosidade RMS (m):

| Consulta | Elevação mínima | Máxima | Média | Relevo | Declividade média | P90 | RMS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Aratanha, 5 km | 39,221 | 775,125 | 236,943 | 735,904 | 12,705 | 28,543 | 5,601 |
| Erg Chebbi, 5 km | 697,513 | 902,394 | 738,119 | 204,881 | 4,285 | 10,428 | 2,519 |
| Barringer, 2 km, centro solicitado | 1562,401 | 1745,822 | 1675,975 | 183,421 | 3,793 | 7,852 | 3,103 |
| Barringer, 3 km | 1562,334 | 1742,491 | 1675,449 | 180,157 | 2,220 | 3,261 | 2,056 |

As onze métricas de **feição** efetivamente medidas em Barringer, consulta de 3 km:

| Campo | Valor |
| --- | ---: |
| diameter_m | 1218,400 m |
| depth_m | 164,084 m |
| depth_diameter_ratio | 0,134671 |
| rim_height_m | 36,838 m |
| rim_height_diameter_ratio | 0,030235 |
| rim_variation_m | 6,601 m |
| rim_radius_cv | 0,044907 |
| mean_wall_slope | 29,978° |
| wall_slope_p90 | 40,024° |
| circularity | 0,917416 |
| rim_coherence | 1,000000 |

Centro ajustado: 35,0273748 / −111,0227358. Melhor comparação: Censorinus,
WED 0,5999033, cosseno ponderado 0,8132555. A comparação penaliza também
dimensões absolutas: 1,218 km terrestre versus 4,139 km da referência. Score baixo
nesse algoritmo não invalida a classificação geológica de cratera de impacto.

## Por que Erg Chebbi ainda não tem score e como obter os dados

O reconhecimento espacial utiliza a área de estudo publicada por
[Herzog et al., EGU 2019](https://meetingorganizer.copernicus.org/EGU2019/EGU2019-6950.pdf).
É evidência de um campo de dunas estrela na região, não um contorno de cada duna.

Faltam `mean_height`, `height_p90`, `wavelength`, `crest_azimuth`, `dune_density`,
`mean_spacing` e `aridity_index`, com área/método/fontes compatíveis. Nenhuma das
sete estatísticas gerais do DEM é equivalente a esses campos. Sem elas, a
normalização não é executada, os sete alvos são registrados como carregados,
e nenhum score é retornado. Os limiares nem chegam a ser avaliados.

GLO-30 pode resolver parte das megadunas; a resolução, isoladamente, não é prova
de insuficiência para toda métrica. O bloqueio atual é a **ausência de uma máscara
validada de areia e segmentação de cristas/interdunas**, além de climatologia.
Uma FFT sobre toda a ROI poderia medir planícies/afloramentos ou braços de dunas
estrela em vez de espaçamento entre dunas. Um azimute único também pode ser
inadequado para esse sistema multidirecional. Por isso não chamei proxies gerais
de dimensões de dunas.

Fluxo viável: obter DEM/ortoimagem com resolução e cobertura adequadas, delimitar
área de areia e cristas com revisão, medir proeminência e espaçamentos nessa mesma
área, registrar definição de orientação/contagem e obter P/ET0 climatológico.
Os estudos [EGU 2019](https://meetingorganizer.copernicus.org/EGU2019/EGU2019-6950.pdf)
e [Structure and chronology of a star dune, Scientific Reports 2024](https://doi.org/10.1038/s41598-024-53485-3)
fornecem caminhos para métodos/dados de levantamento. Não foi encontrado/verificado
um endpoint público de DEM de alta resolução que possa ser automaticamente
baixado para toda esta ROI; não declaro que os dados estejam disponíveis assim.

O caminho de ingestão já funciona: `ANALYSIS_DEM_PATHS` para DEM em metros e
`ANALYSIS_FEATURES_FILE` para polígono/medições/fonte/método/resolução revisados,
conforme [documentação](analise-inteligente.md). Uma feição medida pode ser
subconjunto da ROI, mas não recebe métricas publicadas para uma região diferente.
Não foi implementada segmentação automática validada de dunas estrela; essa
limitação continua explícita, em vez de fabricar um resultado conclusivo.

## Estados verificáveis e testes

- `insufficient_data`: score `null`, métricas ou delimitação ausentes; informa quais.
- `incompatible_geomorphology`: feição documentada não corresponde ao tipo do catálogo.
- `invalid_geometry`: escala/resolução/extensão não suportam as medições.
- `below_threshold`: score numérico calculado, abaixo de 0,80.
- `insufficient_quality`: score calculado, mas cobertura/qualidade insuficiente.
- `approved`: candidato experimental atende aos critérios existentes.
- `technical_failure`: falha de Python, rede, leitura ou processamento; API `status:error`.

Verificações executadas: oito testes Python (incluem cratera analítica e DEM
plano sem borda), contrato científico Node (ausências, unidades, escala,
incompatibilidade, normalização e score baixo), API real, três localidades reais
mais consulta adicional de contexto, testes de navegador, regressão do mapa e
do cálculo de 200 pares originais. Fixtures positivas de aprovação ficam
exclusivamente nos testes. Nenhuma localidade real desta rodada recebeu pin.

```powershell
$env:ANALYSIS_PYTHON = "$env:LOCALAPPDATA\PlanetaryAnalogFinder\venv\Scripts\python.exe"
node tests/integration/intelligent-real-diagnostics.mjs
& $env:ANALYSIS_PYTHON -m unittest tests/integration/test_intelligent_analysis.py
node tests/integration/intelligent-science.mjs
```

Reinicie o servidor após atualizar os arquivos. Para reproduzir score sem o
bloqueio do centro arredondado, use Barringer 35,0333 / −111,0167 com raio de
3 km ou 35,0275 / −111,0228 com raio de 2 km. Abra “Detalhes técnicos da análise”.
O score deve existir e continuar abaixo do limiar; isso é um resultado calculado,
não uma falha técnica.

Não foram alterados globo 3D, estilos/identidade visual, rasters, 24 localidades,
referências planetárias, fórmulas, pesos, limiares, `.env` ou credenciais.
Não houve commit/push. Nenhuma dependência foi adicionada.
