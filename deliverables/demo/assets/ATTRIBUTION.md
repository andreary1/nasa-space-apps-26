# Earth rendering assets

## Solar System Scope / INOVE

Source: [Solar System Scope — Solar Textures](https://www.solarsystemscope.com/textures/).
License: [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/).
Credit: Solar System Scope, developed by INOVE.

- `earth-day-8k.jpg`: `8k_earth_daymap.jpg`, unmodified source image.
- `earth-day-2k.jpg`: `2k_earth_daymap.jpg`, unmodified source image.
- `earth-normal-8k.png`: `8k_earth_normal_map.tif`, converted from TIFF to RGB PNG for browser compatibility; normal channels preserved.
- `earth-normal-2k.png`: `2k_earth_normal_map.tif`, same format conversion.
- `earth-clouds.jpg`: `2k_earth_clouds.jpg`, unmodified source image, used as a low-opacity alpha map.

The renderer recolors the day map to pale blue/gray land and soft blue oceans, adjusts normal strength and lighting, and renders the cloud map translucently. The maps remain equirectangular and show the complete planet. These are visualization assets, not scientific input data or measurements.

## Existing Three.js example assets

`earth-water.jpg` (active water/specular mask), `earth-day.jpg` and `earth-normal.jpg` (retained original demo assets) were sourced from the [Three.js r170 planetary texture examples](https://github.com/mrdoob/three.js/tree/r170/examples/textures/planets). The original Three.js license remains in `../vendor/THREE-LICENSE.txt`.
