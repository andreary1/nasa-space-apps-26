# planetary-analog-finder

Encontra locais da Terra que se parecem com feições de outros corpos: **dunas de Marte** e **crateras da Lua**.
Cada sítio terrestre vira uma lista de atributos de forma (altura, comprimento de onda, diâmetro, profundidade...),
que é comparada com tabelas de referência planetárias. O resultado é um ranking com score, cobertura de dados
e avisos sobre tudo o que faltou ou é suspeito. Projeto do NASA Space Apps Challenge 2026.

## Como funciona

```
DEM do sítio ──► atributos ──► comparação ──► relatório JSON + log ──► demo HTML
(OpenTopography)  (raster ou     (Marte: dunas   (matching_report_v2)    (index.html)
                   catálogo)      Lua: crateras)
```

1. **Ingestão** (`src/ingestion/earth/`): baixa o DEM Copernicus 30 m de qualquer ponto pela API do OpenTopography
   e cadastra o local no `sitios.json`.
2. **Processamento** (`src/processing/`): para cada sítio obtém os atributos do matching.
   - Com raster, **calcula** os atributos do relevo (11 de crateras, 6 de dunas).
   - Sem raster, usa os valores do catálogo (`sitios.json` / `sites.json`).
   - **Nada é preenchido com zero ou valor padrão.** Atributo ausente fica `None`, com a origem registrada
     (`raster`, `catalogo`, `derivado` ou `ausente`) e um aviso `INDISPONÍVEL` no log e no relatório.
3. **Matching** (`src/matching/`): distância euclidiana ponderada + cosseno entre o sítio e cada referência.
   - Só os atributos presentes dos dois lados entram; os pesos são renormalizados.
   - Abaixo de 60% de cobertura do peso total, o par não recebe score (e isso é reportado).
   - Escalonamento de Bagnold para dunas de Marte (comprimentos ÷ β, densidade × β²) e diferença angular
     circular para o azimute das cristas.
4. **Relatório** (`data/processed/comparisons/`): ranking, atributos usados, avisos e notas metodológicas.
5. **Demo** (`deliverables/demo/index.html`): página estática que **exibe** o relatório; não calcula nada.

### Quais sítios entram na comparação com crateras

Só os que têm cratera detectada. Sítios classificados como `no_crater` são **excluídos com o motivo** (evita um falso
análogo no ranking). Anel parcial (`partial_ring`) entra com confiança baixa e aviso. Quando o raster medido aqui e o
catálogo divergem, vale a classificação mais conservadora.

## Instalação

```bash
pip install -r requirements.txt
```

Dependências: `rasterio`, `numpy`, `scipy`, `scikit-learn`, `requests`.

## Uso

Os comandos rodam a partir da raiz do projeto.

### 1. Baixar um local novo (só com as coordenadas)

Precisa de uma chave gratuita do OpenTopography (portal.opentopography.org, em *MyOpenTopo*):

```powershell
$env:OPENTOPOGRAPHY_API_KEY = "sua_chave"
```

```bash
python -m src.ingestion.earth.opentopography -19.1719 127.7956
python -m src.ingestion.earth.opentopography 35.0275 -111.0228 --id barringer --diametro-km 1.186
python -m src.ingestion.earth.opentopography -2.6 -43.0 --tipo dunas --id lencois --lado-km 10
python -m src.ingestion.earth.opentopography --todos      # sítios do sitios.json que ainda não têm raster
```

| Opção | O que faz | Padrão |
|---|---|---|
| `--tipo` | `dunas`, `cratera`, `afloramento` ou `vulcanico` | `cratera` |
| `--id`, `--nome` | identificação do sítio | gerada das coordenadas |
| `--lado-km` | lado da área baixada (1 a 400 km) | 10 (ou 3× o diâmetro) |
| `--diametro-km` | diâmetro da cratera | — |

Sul e oeste são negativos. O raster vai para `data/earth/dunes/` ou `data/earth/craters/` como `<id>_dem.tif`, e o local
só é cadastrado no `sitios.json` se o download for válido. Os metadados ficam em
`data/earth/manifesto_opentopography.json`.

### 2. Rodar o pipeline

```bash
python -m src.application.pipeline --filename matching_report_v2.json
```

| Opção | O que faz |
|---|---|
| `--output` | pasta do relatório (padrão `data/processed/comparisons`) |
| `--filename` | nome do relatório (padrão `matching_report.json`) |
| `--log` | arquivo de log (padrão: `<filename>.log` ao lado do relatório; `none` desativa) |
| `--no-scaling` | desliga o escalonamento de Bagnold |

Gera o relatório JSON (`metadata`, `data_audit`, `earth_features`, `results`, `data_quality`, `global_ranking`) e o log.

### 3. Gerar o demo

```bash
python scripts/build_world_demo.py                      # usa o matching_report_v2.json
python scripts/build_world_demo.py caminho/relatorio.json
```

Abra `deliverables/demo/index.html` no navegador (precisa de internet só para fontes e Tailwind). Sítios sem resultado
aparecem com o motivo: excluídos, sem score ou não processados. Para ver um local novo, rode os passos 1 a 3.

Para os sítios que só existiam no demo, há um atalho que baixa, roda o pipeline e recria o HTML:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\processar_sitios_novos.ps1
```

> `scripts/build_demo.py` é a versão antiga (só Nordeste) e grava no mesmo `index.html`. Não use junto com o novo.

## Organização

| Pasta | Conteúdo |
|---|---|
| `src/ingestion/earth/` | `opentopography.py` (download de DEM por coordenada), `ingest_srtm.py` (recorte do tile SRTM) |
| `src/processing/` | processadores de dunas e crateras, morfometria e leitura de raster |
| `src/matching/` | motor de matching, matchers de dunas e crateras, ranking e relatório |
| `src/application/` | `pipeline.py`, o fluxo completo |
| `src/shared/` | constantes: referências de Marte e da Lua, pesos, regras de comparação |
| `scripts/` | build do demo, script de sítios novos, extração de métricas de Marte e Lua |
| `data/earth/` | DEMs terrestres, catálogos `sites.json` e `sitios.json` |
| `data/mars/dunes/`, `data/moon/craters/` | DEMs de Marte (HiRISE) e da Lua; **não** entram no pipeline |
| `data/processed/comparisons/` | relatórios e logs |
| `docs/` | contrato de dados, pesquisa |
| `tests/` | testes |
| `deliverables/` | demo e entregas |

### Catálogos de sítios

- `sitios.json` (raiz): catálogo em português que o pipeline e o downloader leem. Manda em caso de conflito.
- `data/earth/sites.json`: versão em inglês, com 6 crateras de impacto a mais; completa o que faltar no outro.
  O downloader não o atualiza.

## Atributos

**Dunas** (7, contrato em `docs/methodology/data-contract.md`): altura média, altura P90, comprimento de onda,
azimute da crista, densidade de cristas, espaçamento médio e índice de aridez.

**Crateras** (11): diâmetro, profundidade, razão d/D, altura da borda, razão borda/D, variação da borda, CV do raio da
borda, declividade média e P90 da parede, circularidade e coerência da borda.

O índice de aridez (P/ET0) **não é calculável de um DEM**: vem do catálogo (NASA POWER) e, se faltar, fica indisponível.

## Testes

Cada arquivo roda sozinho (não exige `pytest`):

```bash
python tests/matching/test_missing_data_and_scaling.py
python tests/processing/test_provenance_and_metrics.py
python tests/processing/test_raster_discovery.py
python tests/ingestion/test_opentopography.py
python tests/integration/test_pipeline_e2e.py
python tests/integration/test_demo_build.py
```

Os testes de download simulam a API; nenhum precisa de chave. O e2e regrava `matching_report_test.json`.

## Limitações conhecidas

- **Dunas medidas de raster** usam um método novo, validado só com DEM sintético. A densidade de cristas calculada
  não é comparável com a do catálogo, e a janela de busca limita o comprimento de onda (o White Sands saiu suspeito).
- **Valores de origem `catalogo`** foram calculados fora deste repositório (o script gerador não está nele).
- **Escalonamento de Bagnold:** com β = 4,82 as dunas marcianas ficam muito menores que as terrestres, o que domina o
  ranking de dunas. O contrato cita β ≈ 2,82, mas a fórmula dele com as constantes do projeto dá ≈ 4,82.
- **Crateras:** a normalização das declividades pela gravidade lunar não está implementada (o contrato não define a
  fórmula). A profundidade medida de crateras com lago (como Pingualuit) usa a superfície da água.
- **Crateras muito grandes ou soterradas** (Vredefort, Chicxulub) ficam fora: a janela máxima é de 400 km.
- **Marte e Lua** usam tabelas de referência fixas; os rasters das pastas `data/mars` e `data/moon` ainda não alimentam o pipeline.
- Referências de Marte usam `aridity_index = 0.0` por convenção.
- O perfil topográfico do demo é um esquema ilustrativo: só os rótulos usam valores reais.
