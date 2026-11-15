# Texturas da Terra

Superfície (8K e 2K), mapa de normais (8K e 2K) e nuvens (2K): **Solar System Scope / INOVE**, [Solar Textures](https://www.solarsystemscope.com/textures/), sob [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

- `earth-day-8k.jpg` e `earth-day-2k.jpg`: mapas `8k_earth_daymap.jpg` e `2k_earth_daymap.jpg`, sem alteração nos arquivos.
- `earth-normal-8k.png` e `earth-normal-2k.png`: mapas `8k_earth_normal_map.tif` e `2k_earth_normal_map.tif`, convertidos de TIFF para PNG RGB para compatibilidade com navegadores, preservando os canais de normais.
- `earth-clouds.jpg`: `2k_earth_clouds.jpg`, usado como alpha map com 22% de opacidade.

O material Three.js adapta a paleta para continentes claros e oceanos azuis, realça visualmente o relevo e aplica iluminação difusa. Esses ajustes são de visualização e não geram medidas científicas.

A máscara `earth-water.jpg` e as texturas anteriores `earth-day.jpg`/`earth-normal.jpg` permanecem preservadas, originárias dos [exemplos Three.js r170](https://github.com/mrdoob/three.js/tree/r170/examples/textures/planets). A licença da biblioteca permanece em `../vendor/THREE-LICENSE.txt`.
