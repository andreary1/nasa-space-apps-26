# Demonstração — Análogos Planetários

Na raiz do repositório, execute:

```powershell
py -m http.server 8000
```

Abra **http://localhost:8000/deliverables/demo/**. Não é necessário instalar pacotes, executar build ou iniciar o pipeline. Abra por HTTP; módulos ES não funcionam diretamente por `file://`.

## Escopo deste checkout

O checkout original continha somente `.gitkeep` em `deliverables/demo/`. Não havia `index.html`, outras três seções ou `src/application/pipeline.py`. Esta implementação cria exclusivamente a seção de exploração. Não modifica dados científicos nem o contrato do pipeline.

## Interações

- Arraste o planeta em qualquer direção; a rotação retorna suavemente ao soltar, sem seleção ativa. No toque, o scroll vertical da página continua disponível; o navegador pode cancelar um gesto de rotação para permitir scroll.
- Selecione um pin para centralizar a localidade com interpolação de quaternion, aplicar zoom de 4,5% e revelar os painéis. A seleção permanece parada, e outro pin atualiza a comparação.
- **Esc** ou o botão de fechar ocultam os painéis, removem o destaque, desfazem o zoom e retomam a rotação.
- Use **Tab** para alcançar os pins visíveis e **Enter/Espaço** para selecionar. Com foco na área do globo, as **setas** giram o planeta.
- Os demais ícones da sidebar estão desabilitados. O globo não captura a roda de scroll.
- `prefers-reduced-motion` desliga a rotação automática e torna imediatas as transições de seleção e scores.
- A tabela sempre abre em **Lua**. Os botões Lua/Marte alternam uma única tabela, com fade e ajuste de altura em aproximadamente 330 ms. Crateras têm cinco métricas lunares; dunas têm oito métricas marcianas. Combinações incompatíveis mostram uma mensagem, sem reutilizar valores de outra categoria. Uma nova localidade reinicia Lua, inclusive para dunas.
- A alternância afeta somente a tabela. Os scores e referências existentes do painel direito permanecem independentes e inalterados; nenhuma pontuação nova é calculada.

## Enquadramento

A seção ocupa toda a largura e `100dvh` no desktop, com sidebar na borda esquerda, sem moldura, largura máxima ou sombra externa. O globo fica centralizado na área restante. Abaixo de 1001 px, o conteúdo passa para o fluxo vertical da página e os painéis ficam abaixo do planeta. Não há bloqueio global do scroll nem contêiner de aplicação com rolagem interna. Em desktop com altura menor que 720 px, a seção pode crescer para manter os painéis legíveis, usando o scroll principal.

## Organização

- `index.html`: estrutura semântica, ícones SVG locais, sidebar e painéis inicialmente ocultos e inertes.
- `styles.css`: estilos limitados à demonstração, layouts desktop/mobile e transições.
- `js/app.js`: ciclo único de animação, Pointer Events, seleção, Esc e visibilidade. O loop é suspenso fora da seção e quando a aba é ocultada. Listeners e recursos WebGL são liberados ao sair da página.
- `js/globe.js`: esfera Three.js, luz, normal map, atmosfera, orientação e projeção dos pins. Latitude/longitude viram vetores na esfera; a mesma transformação posiciona os botões acessíveis na tela. Pins no hemisfério posterior são ocultados e removidos da interação/tabulação.
- `js/panels.js`: tabela dinâmica de três colunas, botões de seleção, cancelamento de transições concorrentes, estados incompatíveis, detalhes e animação SVG dos índices durante 900 ms.
- `js/data.js`: **fixtures mockados**, centralizados e sem algoritmo de similaridade. `comparisonFields` define os campos e unidades de cada categoria; `comparisonData` separa valores terrestres e da referência por localidade e corpo. Bordas usam uma descrição, estrutura interna usa uma lista; valores ausentes continuam vazios e são exibidos como “—”. Os fixtures e scores anteriores estão preservados. Futuramente este módulo pode carregar JSON do pipeline; a estrutura de dados ainda não representa um contrato definitivo.

## Dependências e assets offline

Todos os arquivos são servidos localmente, sem CDN, fontes remotas, serviços externos ou chamadas ao backend em tempo de execução:

- **Three.js 0.170.0**, módulo ES em `vendor/three.module.js`. [Código da versão fixada](https://github.com/mrdoob/three.js/tree/r170), [documentação oficial](https://threejs.org/docs/). A licença MIT está em `vendor/THREE-LICENSE.txt`.
- Superfície e mapa de normais em 8K, mais nuvens em 2K, da [Solar System Scope / INOVE](https://www.solarsystemscope.com/textures/), sob CC BY 4.0. Os mapas de normais foram convertidos de TIFF para PNG. Superfície e normais em 2K são usados em telas até 1000 px e GPUs sem suporte a texturas 8K, para reduzir memória. A resolução é escolhida na inicialização. [Créditos, fontes e alterações](assets/ATTRIBUTION.md).
- A máscara de água e os assets originais continuam em `assets/`, provenientes dos [exemplos Three.js r170](https://github.com/mrdoob/three.js/tree/r170/examples/textures/planets). Os materiais clareiam os continentes, preservam relevo por normal map e dão variações suaves aos oceanos. A camada de nuvens tem opacidade de 22%, sem ocultar as localidades; a atmosfera é uma esfera com shader de halo discreto.

O carregamento inicial desktop usa aproximadamente 17 MB em biblioteca/texturas; o mobile carrega mapas menores. Depois de obter o repositório, a demonstração funciona sem conexão com a internet usando o servidor local. Não há novas bibliotecas ou build obrigatório.

## Limites

É necessário um navegador moderno com **WebGL 2**, módulos ES e Pointer Events. Há uma mensagem de falha se a inicialização ou o carregamento das texturas não funcionar; não há globo alternativo em 2D. O desempenho depende da GPU.

Todos os índices, medidas e idades apresentados são demonstrativos, sem validação científica. Campos sem referência lunar exibem “Sem referência” e “—”, sem inventar uma comparação lunar de dunas. Os contadores 24/16/8 são mockados; há seis localidades interativas. A integração com o pipeline e as demais seções não fazem parte desta implementação.

## Verificação automatizada opcional

`tests/integration/planetary-demo.cjs` usa Playwright somente para QA; ele não é dependência da demonstração. Com o servidor HTTP ativo, no Windows com Chrome instalado:

```powershell
$qa = Join-Path $env:TEMP 'paf-browser-qa'
npm install --prefix $qa playwright --no-package-lock --no-audit --no-fund
$env:PLAYWRIGHT_MODULE = Join-Path $qa 'node_modules/playwright'
$env:BROWSER_EXECUTABLE = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
node tests/integration/planetary-demo.cjs
```

Também é possível instalar Playwright no ambiente de testes habitual e omitir `PLAYWRIGHT_MODULE`. Sem `BROWSER_EXECUTABLE`, o teste usa o Chromium instalado pelo Playwright. `DEMO_URL` permite apontar para outra porta/servidor.

A suíte cobre painéis inicialmente ocultos, rotação automática, seleção e parada, scores de Barringer, troca de localidade, dunas sem referência lunar, Esc, botão de fechar, arraste, teclado, movimento reduzido e suspensão/retomada do loop fora da seção. Também verifica as três colunas, as cinco métricas de crateras, as oito métricas de dunas, valores ausentes, trocas rápidas Lua/Marte, reset para Lua, preservação dos scores e Esc durante uma troca. Verifica fullscreen, sidebar na borda, ausência de erros no console, sobreposição entre indicadores e tabela, cortes dos painéis e overflow horizontal em 1920×1080, 1600×900, 1366×768 e 390×844; no mobile também seleciona por toque. Capturas são gravadas na pasta temporária do sistema.
