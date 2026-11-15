# Análise Inteligente de Localidades

A evolução com pesquisa Gemini/Google, descoberta independente de localidades
novas, duas camadas de pins e persistência científica está documentada em
[Descoberta geológica — implementação e testes reais](descoberta-geologica.md).
Esse documento atualiza os limites e o comportamento de histórico descritos abaixo.

Arquivos criados:

- `src/application/intelligent_analysis.py`: aquisição, cache, reprojeção e métricas.
- `scripts/ai_reports/intelligent_analysis.mjs`: jobs/API, comparações, critérios e interpretação.
- `deliverables/demo/js/components/intelligentAnalysis.js` e `styles/intelligent.css`: interface e animações.
- `iniciar-analise-inteligente.bat`: inicialização Windows.
- Este documento e os testes `test_intelligent_analysis.py`, `intelligent-science.mjs`,
  `intelligent-api.mjs`, `intelligent-browser.cjs` em `tests/integration`.

Arquivos modificados:

- `.env.example`, `deliverables/demo/README.md`: configuração e execução.
- `deliverables/demo/index.html`, `js/navigation.js`, `js/app.js`, `styles/main.css`:
  seção, ícone/rota e conexão dos componentes.
- `deliverables/demo/js/components/worldMap.js`: camada separada de candidatos;
  o renderer dos pins oficiais e o catálogo permanecem existentes.
- `scripts/ai_reports/server.mjs`: duas linhas para conectar a API ao servidor atual.
- `tests/integration/demo-browser.cjs`: foco no último item da sidebar agora com
  oito destinos e espera pelo redimensionamento efetivo da viewport no teste.

Nova rota `#/intelligent`, integrada ao roteador/sidebar existentes. O servidor
Node já usado pelos relatórios de IA serve a interface e a API na mesma origem;
ele inicia um worker Python para ler DEMs e calcular o relevo. Não há FastAPI,
Docker, banco de dados ou etapa de build. A pesquisa Gemini oficial compartilha
a configuração de credenciais, conforme a documentação de descoberta geológica.

## Executar no Windows

Requer Node.js 20+ (o cliente de IA usa `fetch` e `AbortSignal.any`) e Python
compatível com as dependências de `requirements.txt`. As bibliotecas científicas
já estavam declaradas: Rasterio, NumPy, SciPy e scikit-learn. Nenhuma dependência
de produção nova foi adicionada.

Na raiz, usando PowerShell:

```powershell
$scienceEnv = Join-Path $env:LOCALAPPDATA 'PlanetaryAnalogFinder/venv'
py -m venv $scienceEnv
& "$scienceEnv/Scripts/python.exe" -m pip install -r requirements.txt
$env:ANALYSIS_PYTHON = "$scienceEnv/Scripts/python.exe"
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
notepad .env
.\iniciar-analise-inteligente.bat
```

Abra `http://localhost:8000/#/intelligent`. O endereço antigo
`http://localhost:8000/deliverables/demo/#/intelligent` também funciona. O launcher
reutiliza `scripts/ai_reports/server.mjs`; `node scripts/ai_reports/server.mjs`
é o comando equivalente sem abrir o navegador. Feche um servidor que já ocupe a
porta antes de iniciar outro. Ctrl+C encerra o servidor.

O comando `py -m http.server 8000` continua servindo o frontend existente. Ele
**não executa a API**; o formulário informa como abrir o servidor correto.
Não é necessário manter dois servidores: o Node existente serve ambos. Não há
CORS permissivo: a API de análise aceita somente Host/origem loopback na porta
configurada. A chave nunca é enviada ao navegador nem ao worker do DEM em URLs
de resposta.

## Configuração

Variáveis opcionais documentadas em `.env.example`:

| Variável | Uso |
|---|---|
| `ANALYSIS_PYTHON` | Caminho do Python com as dependências; padrão `py` |
| `ANALYSIS_DEM_PROVIDER` | `copernicus-public` (padrão), `local` ou `opentopography` |
| `ANALYSIS_DEM_PATHS` | DEMs GeoTIFF/HGT locais, separados por `;` no Windows |
| `ANALYSIS_CACHE_DIR` | Padrão `%LOCALAPPDATA%/PlanetaryAnalogFinder/dem` |
| `ANALYSIS_RESOLUTION_M` | Grade métrica de processamento, 10–100 m; padrão 30 m |
| `OPENTOPOGRAPHY_API_KEY` | Necessária somente para a opção OpenTopography |
| `ANALYSIS_FEATURES_FILE` | Registro local de feições revisadas e medições em unidades canônicas |
| `ANALYSIS_MIN_SCORE` | Limiar **experimental**, padrão 0,8 |
| `ANALYSIS_MIN_COVERAGE` | Cobertura mínima **experimental**, padrão 0,8 |
| `AI_PROVIDER`, `AI_MODEL`, `AI_API_KEY` | A mesma configuração de IA existente; Gemini é o padrão |

Sem chave de IA, o processamento científico funciona e a interpretação aparece
como indisponível. As chaves reais e o `.gitignore` não foram alterados.

## Fontes e obtenção real

Primeiro são examinados os DEMs locais configurados ou os DEMs terrestres
conhecidos em `data/earth/dem/srtm` e `data/earth/craters`. Imagens ASTER VNIR
multiespectrais não são tratadas como elevação. Um DEM local só é escolhido se
sua extensão georreferenciada cobrir a região inteira. O operador deve conferir
que seus valores representam elevação em metros e registrar sua procedência.

Sem cobertura local, o padrão usa os COGs oficiais **Copernicus GLO-30 Public**,
distribuídos por Sinergise no AWS Open Data. A consulta normalmente lê apenas os
blocos que intersectam a região, via HTTP Range, e armazena um recorte
georreferenciado no cache. Se esse acesso falhar, tenta um download limitado do
mesmo tile real e recorta localmente. Tiles indisponíveis e falhas de rede não
viram elevação zero. O download é limitado a 120 MB por tile; o worker tem limite
total de cinco minutos. São até duas análises simultâneas no servidor, uma por
sessão, raio de 2–10 km e até quatro milhões de pixels processados.

Fontes primárias, cobertura, versão e licença:

- [Registro oficial do conjunto](https://registry.opendata.aws/copernicus-dem/).
- [Organização dos tiles e licença](https://copernicus-dem-30m.s3.amazonaws.com/readme.html).
- [OpenTopography API](https://opentopography.org/developers), alternativa COP30
  autenticada no backend.
- [Reprojeção com Rasterio](https://rasterio.readthedocs.io/en/stable/topics/reproject.html).

Copernicus é **DSM**, não terreno nu: inclui vegetação/edificações e possui
limitações de cobertura. O produto público é da versão de 2021 e usa alturas
ortométricas EGM2008. Não é lidar, nem observação atual da data da consulta.
DEMs locais podem ter outro datum vertical, informado pelo responsável pelos
dados. Nenhuma correção vertical entre produtos é presumida.

O cache considera coordenadas, raio/extensão, fonte, resolução de processamento,
versão do método e identidade/mtime/tamanho dos rasters. Não grava resultados
em GeoTIFFs ou JSONs científicos existentes. Os dados novos ficam no cache
separado, fora do repositório por padrão.

## Métricas gerais e limites

O worker seleciona UTM local (ou CRS polar apropriado), transforma a área de
interesse, reprojeta por interpolação bilinear e aplica uma máscara circular com
o raio informado. Regiões que cruzem antimeridiano/polo de forma ambígua são
rejeitadas com mensagem, sem alterar as coordenadas fornecidas.

- Elevação mínima, máxima, média e relevo máximo−mínimo: pixels válidos no disco.
- Declividade: `atan(hypot(dz/dx, dz/dy))` em graus; diferenças centrais NumPy na
  grade métrica, com diferenças unilaterais nas bordas. Gradientes contaminados
  por NoData são excluídos.
- Distribuição: contagens reais nos intervalos 0–5, 5–15, 15–30, 30–45 e 45–90°.
- Rugosidade RMS: raiz da média quadrática do resíduo entre elevação e média
  local 7×7, ponderada pela presença de pixels válidos.
- Cobertura: pixels válidos / pixels da máscara circular. Cobertura abaixo de
  80% bloqueia candidato. Menos de cem pixels válidos interrompem a análise.

NoData não é preenchido com zero/média. Zeros medidos continuam válidos.
Reamostrar em uma grade menor **não aumenta a resolução real da fonte**.
Rugosidade e declividade dependem da escala; bordas e reamostragem podem alterar
estatísticas. Não são extraídos diâmetro/profundidade de crateras nem dimensões
de dunas a partir da ROI arbitrária, de uma depressão, do nome ou do alvo escolhido.
O módulo morfométrico antigo preenche lacunas e extrai proxies espectrais; não é
chamado indiscriminadamente para classificar novas regiões. O pipeline existente
permanece inalterado.

## Evidência necessária para comparação específica

Por padrão, regiões novas possuem somente relevo geral. Os catálogos planetários
atuais não oferecem um contrato equivalente de relevo geral; portanto não há
score exploratório inventado. A mensagem é: **Comparação indisponível — métricas
insuficientes ou feição incompatível.**

Scores específicos podem ser habilitados pelo extrator automático de borda de
Barringer (`feature_evidence.measure_crater`, 72 perfis, validações de geometria,
resolução e cobertura), ou por um registro **administrado no backend**
em `ANALYSIS_FEATURES_FILE`, com feição revisada, fonte, método, resolução de
medição, polígono WGS84 e todas as medições exigidas pelo algoritmo. O cliente
não pode enviar ou aprovar medições. O centro deve estar no polígono e o polígono
inteiro dentro da ROI. Ambiguidade entre feições impede a análise. O operador é
responsável pela validade da evidência e delimitação; o flag `reviewed` não é uma
certificação automática. Não há feições pré-aprovadas ou métricas mockadas.
Erg Chebbi pode ser reconhecido por coordenadas dentro da área de estudo publicada,
mas ainda exige delimitação/medições de cristas e climatologia para produzir score.
Veja o [diagnóstico e testes reais atualizados](diagnostico-analise-inteligente.md).

Estrutura do registro (exemplo deliberadamente **não aprovado e sem valores**):

```json
{
  "features": [{
    "id": "id-da-feicao-medida",
    "kind": "crater",
    "reviewed": false,
    "source": "Referência verificável do levantamento e delimitação",
    "method": "Método documentado de medição",
    "measurement_resolution_m": null,
    "geometry": {"type": "Polygon", "coordinates": []},
    "measurements": {
      "diameter_m": {"value": null, "unit": "m", "source": "Levantamento"}
    }
  }]
}
```

O polígono precisa de anel fechado, sem furos. Campos canônicos e pesos vêm de
`js/data/constants.js`: onze métricas de crateras ou sete de dunas. Unidades:
`m` para dimensões, `deg` para declividade/azimute, `crests/km2` para densidade e
`1` para razões/índices. Toda medição precisa de `source`. Ausência ou unidade
incorreta resulta em `null`, nunca zero. Resolução declarada deve permitir ao
menos dez pixels no diâmetro ou quatro no comprimento de onda.
O diâmetro deve ser coerente com a extensão métrica do polígono e o comprimento
de onda deve caber na feição. Essas verificações não certificam a delimitação.

A API importa **o mesmo `buildComparison`/`calculateMatch` do frontend**, sem
duplicar ou modificar as fórmulas: normalização par a par pelo máximo, WED,
cosseno ponderado, `0,60 exp(−2,2 WED) + 0,40 cos` e Bagnold 2,82 nas dimensões
de dunas já definidas. O motor Python tem outro contrato/normalização; misturá-los
produziria resultados distintos. As referências existentes são reutilizadas;
fontes explicitamente mockadas/ilustrativas não aprovam candidato. A comparação
continua exigindo todas as métricas ponderadas, mesmo que o limiar experimental
de cobertura esteja em 80%; pesos não são renormalizados para esconder lacunas.

## IA e pins candidatos

`intelligent_analysis.mjs` usa `providerConfig`/`callModel` do cliente existente.
A IA recebe apenas o resultado já calculado e instruções para não inventar
feições/medições ou preencher lacunas. O contrato JSON contém resumo, semelhanças,
diferenças, limitações, conclusão e ids de fontes permitidos. Campos adicionais,
fontes desconhecidas e números no texto são rejeitados: valores e scores ficam
nas tabelas determinísticas. Texto é exibido com escape. Uma resposta validada
estruturalmente ainda requer revisão humana; não é evidência científica.

A IA não escreve scores nem decide elegibilidade. Falha, timeout ou ausência de
credencial preserva integralmente as métricas e comparações. Na implementação
inicial não havia chave; no teste de navegador de 15/11/2026 a interpretação
ao vivo ficou disponível. O diagnóstico científico direto também foi executado
sem chamar IA para isolar extração, comparação e aprovação.

Candidato exige score/cobertura acima dos limiares, compatibilidade, resolução e
qualidade DEM. É experimental, sem interpretação de habitabilidade/aptidão.
Pins ficam em camada/estado separados, com borda tracejada, hover e clique para
reabrir o resultado. Não entram no `SITES_DATA`, nas contagens oficiais ou no
globo 3D. Zoom, arraste, regiões e filtros são preservados. O globo não foi
modificado para reduzir o risco de regressão.

Histórico e candidatos permanecem na aba durante a sessão/navegação. Recarregar
a página limpa esse estado visual. O backend guarda até sessenta jobs em memória
por duas horas; reiniciá-lo os remove. Não há persistência científica automática.

## API e etapas reais

- `POST /api/analyze`: valida o JSON e retorna `202 {id}`; exige
  `X-Analysis-Session` (UUID gerado pelo frontend).
- `GET /api/analyze/{id}`: somente a mesma sessão consulta status, etapas e
  resultado. Identificador de outra sessão retorna 404.
- Rotas anteriores `/api/health` e `/api/reports` continuam existentes.

Entrada: `nome`, `latitude`, `longitude`, `raio_km`, `comparar_com: ["lua","marte"]`.
Campos extras não autorizam métricas/feições. Entradas inválidas retornam 400;
limites de concorrência retornam 429. Solicitações idênticas em processamento
reutilizam o job. Falhas científicas têm `status: "error"`, mensagem e etapas;
não devolvem relatórios simulados. stdout do worker usa eventos JSON e stderr
de bibliotecas não é enviado ao navegador (pode conter URLs com credenciais).

O frontend consulta etapas realmente emitidas: obtenção, reprojeção/métricas,
evidência, comparação, interpretação e conclusão. O intervalo de polling não
simula conclusão ou porcentagem. Resultados anteriores ficam disponíveis após
falhas. A UI oferece movimento reduzido e reveal com conteúdo visível por padrão.

## Verificação

```powershell
& "$scienceEnv/Scripts/python.exe" -m unittest discover -s tests/integration -p test_intelligent_analysis.py -v
node tests/integration/intelligent-science.mjs
node tests/integration/intelligent-real-diagnostics.mjs
node tests/integration/demo-modules.mjs
node tests/integration/context-panel.mjs
node tests/integration/ai-client.mjs
node tests/integration/intelligent-api.mjs
py scripts/verify_html.py
# Com o servidor Node ativo e Playwright de QA configurado:
node tests/integration/intelligent-browser.cjs
node tests/integration/demo-browser.cjs
git diff --check
```

O caso real Serra da Aratanha (−3,97, −38,63, raio 5 km) obteve dois tiles
Copernicus e 87.270 pixels válidos na grade de 30 m / EPSG:32724, com cobertura
100%. Medições desta consulta: mínimo 39,2207 m, máximo 775,1245 m, média
236,9434 m, relevo 735,9038 m, declividade média 12,7047°, P90 28,5432° e
rugosidade RMS 5,6012 m. São estatísticas da ROI/DSM e método, não medições
certificadas do maciço inteiro. Sem feição revisada: scores nulos, resultado
inconclusivo e nenhum candidato aprovado. IA indisponível por falta da chave.

O resultado acima registra a versão inicial. O extrator atual mediu Barringer
em DEM real, centro 35,0275 / −111,0228, raio 2 km: 13.966 pixels válidos e score
lunar 0,485040 (abaixo de 0,80), sem pin. Para repetir esse teste externo adicional:

```powershell
$env:RUN_REAL_DEM = '1'
node tests/integration/intelligent-api.mjs
```

Testes de pins aprovados usam fixtures **artificiais exclusivamente nos testes**,
claramente identificadas; nunca são adicionadas aos dados reais. Barringer agora
tem score calculado a partir do DEM e contorno medido, sem copiar valores do
catálogo nem forçar aprovação. O catálogo herdado não fornece rastreabilidade
individual suficiente para promover automaticamente suas métricas a medições
revisadas. Consulte o diagnóstico atualizado para as três localidades e para o
caso em que o centro arredondado de Barringer exige maior raio de contexto.

Capturas e relatório do teste de navegador ficam em `%TEMP%/paf-intelligent-qa/`.
Não houve alteração em rasters, catálogos, relatórios científicos, fórmulas,
`.env`, credenciais ou configurações do Git.
