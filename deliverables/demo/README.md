# Planetary Analog Finder — exploração e comparação

Execute `python -m http.server 8000` na raiz e abra
http://localhost:8000/deliverables/demo/. Não há instalação, build, CDN ou backend
necessário para a interface. Os módulos ES precisam de HTTP e o globo de WebGL 2.

## Origem visual e funcional

O HTML parte de `origin/novoFrontKauan` (`9cd8b60`), incluindo a composição
`.planetary-section > .dashboard-frame > .dashboard > .sidebar + .explorer`.
A tela inicial é a exploração original: introdução e estatísticas à esquerda,
globo ocupando o fundo, legenda inferior e painéis flutuantes na seleção.
Não contém o HTML de cards da main nem uma camada de overrides de Tailwind.

`styles/kauan.css` permanece como base preservada dessa branch. O refinamento
atual em `styles/refinement.css` remove a moldura externa, ocupa a viewport e
adapta a tabela flutuante. O globo usa mapas de superfície e normais em 8K,
continentes claros, oceanos azuis, nuvens translúcidas e iluminação difusa;
telas até 1000 px ou GPUs sem texturas 8K recebem mapas em 2K. Os ícones,
anéis de similaridade e transições de seleção são preservados. `panels.js` e
o controlador do globo derivam dos componentes dessa branch. A seleção mantém
centralização por quaternion, zoom de 4,5%, pausa de rotação e fechamento por Esc.
Movimento reduzido, toque, teclado, foco e suspensão do loop continuam disponíveis.

A camada científica vem de main `f0ddeec`: **24 localidades terrestres, 9 referências
lunares e 7 marcianas**, seus parâmetros, diagnósticos, pesos, unidades, coordenadas,
normalização por máximo, fator Bagnold 2,82, WED, cosseno ponderado e score híbrido.
Os indicadores agora contam os registros existentes; 16/8 eram números fixos da
interface original e não a quantidade de referências desse catálogo.

## Adaptações necessárias ao design original

- Sete destinos reais na sidebar; o espaçamento do menu acomoda os dois itens
  adicionais. No mobile há um menu recolhível com foco contido, conforme solicitado.
- Os 24 pins substituem os seis locais demonstrativos, preservando as posições do
  catálogo main e os ícones da Kauan. Regiões densas apresentam sobreposição; todas
  as localidades também podem ser escolhidas pelo catálogo e seletor das páginas.
- O painel direito usa o mesmo modelo científico das páginas completas.
  A tabela compacta possui três colunas e botões Lua/Marte. Lua começa selecionada
  a cada nova localidade, com cinco categorias de crateras; Marte tem oito
  categorias de dunas. Combinações incompatíveis exibem mensagem e campos ausentes
  exibem “—”, sem confundir variação numérica de borda com descrição. Os anéis só mostram o corpo com referências compatíveis:
  crateras–Lua ou dunas–Marte; não há índice inventado para combinações ausentes.
- Os filtros do globo aparecem durante a exploração; ficam ocultos enquanto os
  painéis estão abertos para não sobrepor os indicadores. Os filtros completos
  continuam no Mapa Mundial, e seu estado acompanha a navegação.
- Mapa, comparação completa, análise, gráficos, relatórios e cadastro são extensões
  com os mesmos painéis claros, bordas, sombras, fontes e cores da Kauan.

Os scores mockados da Kauan não são usados. Os exemplos pedidos para a tabela
Barringer–Shackleton e Lençóis–dunas marcianas ficam isolados em
`js/data/comparisonDemo.js`, explicitamente identificados como demonstrativos.
Esses exemplos afetam **somente a tabela compacta**, não o catálogo, o contexto,
os scores, rankings, relatórios ou gráficos. O painel informa a referência
ilustrativa e que os valores são independentes dos scores do painel direito.
Para as demais localidades, a tabela usa os dados disponíveis do catálogo.
Informações
como idade, sem dado no catálogo main, aparecem como não informadas. O catálogo,
presets e seus textos foram preservados sem nova validação científica; inclusive
o preset explicitamente ilustrativo de Shackleton. Não há novas medições.

## Navegação e estado

Destinos: Visão geral, Exploração do globo, Mapa mundial, Comparações, Dunas e
crateras, Relatórios e Configurações. URLs `#/globe`, `#/map`, etc. funcionam com
links diretos e voltar/avançar. O antigo endereço `#/dunes` abre a análise.
Não há navegação principal por `scrollIntoView()`.

O catálogo, a comparação completa e os gráficos são compartilhados entre páginas,
sem clones. Trocar de página preserva seleção, filtros, região, formulário, aba
de gráfico e canvas WebGL. O globo redimensiona ao reaparecer. As páginas extensas
usam a rolagem vertical principal, sem scroll de um dashboard embutido. O globo
ocupa `100dvh`, com altura mínima de 720 px para não cortar os painéis. Em telas
menores, os painéis entram no fluxo vertical. A sidebar mantém seus sete destinos
e o menu mobile existente; somente a página atual fica destacada.

Na análise, alternar Dunas/Crateras filtra o catálogo sem mudar a seleção sozinho.
Relatórios permite consultar/copiar JSON e cadastrar; o cadastro abre Comparações.
Configurações informa que tema, unidades e preferências salvas estão indisponíveis.

## Organização

- `index.html`: base estrutural Kauan e extensões semânticas, sem CSS/JS inline.
- `styles/kauan.css`: CSS original; `main.css`: imports; `components.css`,
  `sidebar.css`, `responsive.css`: apenas estilos das extensões e adaptações.
- `js/app.js`, `js/navigation.js`, `js/components/sidebar.js`: integração,
  estado, histórico, montagem de páginas e menu acessível.
- `js/components/globe.js`, `globeController.js`, `panels.js`: experiência Kauan.
- `styles/refinement.css`: enquadramento fullscreen e tabela compacta, sem alterar
  os estilos base de gráficos, formulários ou componentes do mapa.
- `js/components/compactComparison.js`: tabela única dinâmica, unidades de
  apresentação, estados incompatíveis e transições com cancelamento. Fade de
  saída de 110 ms, troca de linhas e fade/ajuste de altura de 220 ms; total de
  aproximadamente 330 ms. Movimento reduzido torna a troca imediata. A aba Lua
  tem fundo cinza e Marte, laranja suave; ambas têm texto branco quando ativas.
- `js/data/comparisonDemo.js`: fixtures exclusivamente visuais, separados dos
  dados originais e do motor de similaridade. Não há novas medições ou algoritmo.
- `js/components/worldMap.js`, `comparison.js`, `metrics.js`, `charts.js`,
  `siteSelector.js`, `siteForm.js`, `toast.js`: componentes funcionais adaptados.
- `js/data/`: catálogos, pesos/rótulos e presets originais.
- `js/services/similarity.js`, `calculations.js`, `comparisonModel.js`,
  `chartData.js`: cálculo, normalização, modelo comum e geometria dos gráficos.
- `js/utils/formatters.js`, `helpers.js`: adaptação aos painéis, formatos e escape.
- `vendor/`, `assets/`: Three.js 0.170.0 e texturas locais da Kauan. Licença MIT em
  `vendor/THREE-LICENSE.txt`; texturas earth_atmos_2048, earth_normal_2048 e
  earth_specular_2048 dos exemplos oficiais Three.js r170.
- As novas texturas são da Solar System Scope / INOVE, sob CC BY 4.0.
  [Créditos, fontes e conversão dos normal maps](assets/ATTRIBUTION.md).
  O carregamento desktop usa aproximadamente 17 MB, com mapas menores no mobile.
  Não há dependências adicionais nem acesso a CDN em tempo de execução.

Foram removidos o antigo `js/tailwind-config.js` e `styles/globe.css`: o CSS Kauan
já contém os estilos completos do globo. Não há dois sistemas de estilos conflitantes.

## Correções de tratamento e limites

Para todos os dados completos, os resultados são iguais aos da main. Duas
correções explícitas foram necessárias:

1. `null`, `undefined`, `NaN` e infinitos não viram zero. Se faltar uma métrica
   ponderada, o índice fica indisponível; não se recalculam pesos para mascarar a
   ausência. Zeros legítimos continuam válidos. Os valores originais permanecem
   intactos no JSON. O cadastro exige as métricas e coordenadas válidas, sem
   preencher campos vazios com defaults arbitrários.
2. Os perfis SVG fixos da main foram substituídos por esquemas paramétricos que
   respondem a diâmetro/profundidade/borda ou altura/comprimento de onda. Continuam
   identificados como **esquemas, não cortes medidos de DEM**. Barras e radar usam
   a normalização e os limites originais; a mudança dos perfis não altera scores.

O rótulo P90 usa `wall_slope_p90`, conforme o contrato, em vez do antigo campo
inexistente. Cadastro é apenas na sessão; exportação copia JSON e oferece prompt
se a área de transferência falhar. Resultados do pipeline não são carregados
automaticamente: o escopo desta integração é a interface e a lógica JS da main.

Os scripts históricos `scripts/build_demo.py` e `scripts/build_world_demo.py`
sobrescrevem o HTML com a interface antiga; não são o build desta versão.

## Validação reproduzível

```powershell
python scripts/verify_html.py
node tests/integration/demo-modules.mjs
$qaDir = Join-Path $env:TEMP 'paf-browser-qa'
npm install --prefix $qaDir playwright --no-package-lock --no-audit --no-fund
$env:PLAYWRIGHT_MODULE = Join-Path $qaDir 'node_modules/playwright'
node tests/integration/demo-browser.cjs
node tests/integration/demo-refinement.cjs
git diff --check
```

O teste de navegador precisa do servidor ativo e do Chrome; `BROWSER_EXECUTABLE`
e `DEMO_URL` permitem alterar os padrões. Playwright é dependência opcional de QA,
instalada fora do repositório. O teste verifica a geometria fullscreen em
1366×768, 1600×900 e 1920×1080, sem depender do antigo enquadramento com moldura.

Verificações executadas:

- Estática: 140 IDs únicos, 27 scripts, sintaxe, imports, assets e grafo sem ciclos.
- Regressão: 24 registros e todos os catálogos intactos; 200 pares com mesmos
  score/WED/cosseno; mesmos rankings, normalização dos gráficos, adaptadores dos
  painéis, ausência de dados e zeros legítimos.
- Chrome: dashboard com largura/altura da viewport e sidebar na borda esquerda,
  sem overflow horizontal em 1366×768, 1600×900 e 1920×1080.
  Capturas em `%TEMP%/paf-design-qa/` para inspeção visual original/integrado,
  seleção e mobile.
- Tabela: três colunas, cinco/oito categorias, fixtures isolados, dados ausentes,
  reset para Lua e alternância sem alterar scores. As oito métricas podem usar
  rolagem apenas dentro da tabela quando a altura disponível exigir.
- `demo-refinement.cjs`: ambos os estados da tabela em 1920×1080, 1600×900,
  1366×768 e 390×844, com capturas na pasta temporária; testes de transição normal,
  cancelamento por troca rápida e Esc. A altura do painel de contexto respeita
  os offsets superior e inferior para manter fichas longas acessíveis.
- Fluxos: painéis e anéis, teclado/arraste/Esc, sete páginas, histórico,
  seleção/canvas/filtros preservados, barras/radar/perfil, cadastro, JSON, menu
  mobile e ausência de overflow nas sete páginas a 390 px.
- `git diff --check` sem erros. Não há comando de build/lint configurado.

O pipeline Python não foi alterado nem reexecutado nesta etapa. Na verificação
anterior, ingestão passou; morfometria, matching e pipeline ficaram impedidos por
ausência de `scipy`/`sklearn` no ambiente. `pytest` também não estava instalado.
Não houve commit ou push.

Limites visuais: requer WebGL 2 e a aparência final depende da GPU. A projeção e
texturas cobrem o planeta inteiro, sem usar a imagem de referência como fundo.
Pins das 24 localidades mantêm as coordenadas e podem se sobrepor em regiões
densas. O fullscreen preserva as sete páginas atuais e suas rotas, em vez de
reconstruir a navegação. Nenhum dado científico ou arquivo raster do pipeline foi
alterado; os novos mapas são apenas assets de visualização.

## Contexto geográfico

O painel lateral oferece as abas Comparação e Sobre o local. A seleção inicial
abre o contexto; trocas de localidade preservam a aba escolhida. Setas, Home e
End permitem navegar pelas abas com teclado.

O catálogo está em `js/data/geographical-context.json`, recuperado da branch
`feat/geographical-context` com as fontes e climatologias existentes. Este é o
arquivo servido pelo novo frontend: edite-o para atualizar as fichas. Não execute
o gerador HTML do frontend antigo sobre esta versão. Campos vazios são ocultos;
novos sítios sem ficha têm um estado explícito de ausência. Falhas de carregamento
permitem nova tentativa. Nenhuma API externa é chamada ao abrir o painel.

Verificação: `node tests/integration/context-panel.mjs` (da raiz do repositório).

## Redesign do Mapa Mundial 2D e catálogo

O mapa usa os mapas equiretangulares locais já existentes, da Solar System Scope /
INOVE, sob CC BY 4.0 ([créditos](assets/ATTRIBUTION.md)). `mapTexture.js` combina
superfície, máscara de água, normais e nuvens em uma imagem gerada em memória,
com oceanos azuis e continentes claros. Não é uma captura da referência: pins,
seleção e navegação são camadas interativas independentes. A textura é carregada
ao abrir a página do mapa e reutilizada durante a sessão, sem dependência externa.

`mapGeometry.js` usa projeção equiretangular / plate carrée com extensão completa
WGS84, incluindo a Antártida. O mesmo sistema transforma textura, coordenadas do
cursor e âncoras dos pins; não há margens artificiais nem coordenadas deslocadas.
Os enquadramentos Brasil / América do Sul e Nordeste preservam os limites usados
para filtrar localidades, com margem visual para os pins. Mundo mostra todos os
registros. Os contadores continuam derivados do catálogo, inclusive após cadastro.

`worldMap.js` mantém sua API e recebe o mesmo estado da aplicação. Grupos com
contagem reúnem pins próximos, sem nomes permanentes. Clique ou Enter aproxima
o grupo até expor localidades individuais. Grupos mistos usam o ícone de camadas;
pins de dunas são verdes e de crateras, lilás. Nenhum registro é removido ou tem
suas coordenadas alteradas. Zoom pelos botões, +/− ou Ctrl + rolagem; arraste e
setas navegam; Home ou o botão de enquadramento restauram a região. A rolagem
normal continua movimentando a página; no toque, o gesto vertical mantém essa
rolagem e o arraste horizontal navega no mapa.

O catálogo continua sendo um único componente compartilhado. Apenas na página
Mapa Mundial, `siteSelector.js` inclui ícones e mantém os elementos dos cartões
durante a seleção, permitindo a transição de 280 ms do gradiente roxo e preservando
o foco. `world-map.css` fica restrito a `#view-map`: outras páginas mantêm o design
anterior. Clique no pin/cartão ou mudança do dropdown chamam o mesmo `selectSite`
em `app.js`, que permanece inalterado. Filtros afetam o mapa e o globo conforme a
regra existente; o catálogo do mapa continua mostrando todas as localidades.
Se um filtro/enquadramento ocultar o local selecionado, a seleção é preservada.
Selecionar pelo catálogo não reposiciona o mapa, mantendo o comportamento anterior.

Verificações executadas nesta etapa, além de `demo-modules.mjs`,
`demo-browser.cjs`, `context-panel.mjs`, `verify_html.py` e `git diff --check`:

```powershell
node tests/integration/map-geometry.mjs
# Com servidor HTTP ativo e PLAYWRIGHT_MODULE configurado como acima:
node tests/integration/map-redesign.cjs
```

O teste geométrico verifica extensão, ida/volta das coordenadas, regiões e
agrupamentos sem perdas ou duplicações. O teste de navegador explora os 24 pins,
confere seleção compartilhada, nomes, filtros, regiões, zoom/arraste/teclado,
coordenadas do cursor e ausência de overflow nas quatro resoluções 1920×1080,
1600×900, 1366×768 e 390×844. Capturas em `%TEMP%/paf-map-qa/`.

Limitações: a textura global fica pixelada em aproximações extremas; é uma
visualização de superfície, sem tiles locais ou DEM detalhado. O primeiro acesso
ao mapa precisa decodificar/processar as texturas. Grupos representam a posição
média dos membros; ao expandi-los, cada pin individual volta à sua âncora exata.
O zoom fica limitado a 2048×. O globo 3D, a sidebar, as fórmulas, os 24 registros,
as referências e os arquivos do pipeline científico não foram modificados.

## Padronização visual de Dunas e Crateras

`styles/analysis.css` aplica somente dentro de `#view-analysis` a paleta e os
valores visuais do catálogo do Mapa Mundial: gradientes branco/lilás/azul-gelo,
bordas claras, cantos de 26/19 px, ícones de 52 px, textos azul-marinho e seleção
com o mesmo gradiente roxo e texto branco. Tabelas, diagnósticos e rankings
recebem o mesmo padrão visual, sem modificar seus textos ou valores.

`siteSelector.js` reutiliza a apresentação dos cartões do mapa na análise,
incluindo SVGs decorativos. O catálogo continua filtrado pela lógica existente:
oito dunas ou dezesseis crateras. Os elementos são preservados ao trocar apenas
a seleção para permitir a transição de 280 ms, sem mudar os eventos existentes.
Hover eleva somente os cartões clicáveis em 2 px durante 250 ms, sem mudar
suas dimensões ou o fluxo da grade. O mapa e seu CSS permanecem inalterados.

`analysisReveal.js`, importado por `app.js`, usa `IntersectionObserver` para
animar apenas os blocos que entram na viewport: fade e deslocamento de 16 px,
460 ms, com atrasos discretos de 50 ms entre cartões. Cada localidade/bloco
anima uma vez por carregamento da página; seleção e rolagem posteriores não
reiniciam o efeito. `MutationObserver` acompanha a montagem dos componentes
compartilhados e os filtros, sem substituir seus handlers. As animações são
canceladas ao sair da seção, receber foco ou ativar movimento reduzido.
Sem suporte à animação/observer, o conteúdo permanece visível por padrão.

Validação desta etapa:

```powershell
node tests/integration/demo-modules.mjs
node tests/integration/context-panel.mjs
python scripts/verify_html.py
# Servidor HTTP ativo e PLAYWRIGHT_MODULE configurado:
node tests/integration/analysis-visual.cjs
git diff --check
```

O teste visual compara textos, métricas, unidades, rankings e estados dos 24
locais com o renderer anterior via `git show HEAD`, verifica os estilos visíveis
das demais páginas, filtros, seleção/dropdown, gráficos, hover e reveal. Cobre
1920×1080, 1600×900, 1366×768 e 390×844, movimento reduzido e ausência de
IntersectionObserver; capturas em `%TEMP%/paf-analysis-qa/`.

Limitação preexistente: com `py -m http.server 8000`, a integração opcional de IA
consulta `/api/health`, que retorna HTTP 404. `demo-browser.cjs` executou seus
fluxos, mas falhou na asserção final de console por esse aviso. O teste visual
exclui especificamente essa resposta preexistente e continua verificando erros
JavaScript e falhas em outros recursos. A integração de IA não foi alterada.
A tabela mantém sua rolagem local em telas estreitas para preservar as métricas.
