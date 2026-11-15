// Presentation only: reuse the local, equirectangular Earth maps. No GIS data changes.
let texture;
export function mapTexture() {
  if (texture) return texture;
  texture = createTexture().catch((error) => {
    texture = null;
    throw error;
  });
  return texture;
}

async function createTexture() {
  const width = matchMedia("(max-width: 760px)").matches ? 2048 : 4096;
  const load = (file) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Textura indisponível: ${file}`));
      image.src = `assets/${file}`;
    });
  const [day, normal, water, clouds] = await Promise.all([
    load(`earth-day-${width > 2048 ? "8k" : "2k"}.jpg`),
    load(`earth-normal-${width > 2048 ? "8k" : "2k"}.png`),
    load("earth-water.jpg"),
    load("earth-clouds.jpg"),
  ]);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = width / 2;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const pixels = (image) => {
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  };
  const base = pixels(day),
    normals = pixels(normal).data;
  const mask = pixels(water).data,
    cloud = pixels(clouds).data;
  const smooth = (n) => {
    const t = Math.max(0, Math.min(1, n));
    return t * t * (3 - 2 * t);
  };
  for (let i = 0; i < base.data.length; i += 4) {
    const luminance =
      (base.data[i] * 0.2126 +
        base.data[i + 1] * 0.7152 +
        base.data[i + 2] * 0.0722) /
      255;
    const ocean = smooth((mask[i] / 255 - 0.1) / 0.55);
    const relief = Math.max(
      -32,
      Math.min(32, (normals[i] - 128) * 2.5 - (normals[i + 1] - 128) * 2),
    );
    const land = [
      211 + luminance * 30 + relief,
      221 + luminance * 25 + relief,
      237 + luminance * 15 + relief,
    ];
    const sea = [
      47 + luminance * 65,
      117 + luminance * 68,
      158 + luminance * 58,
    ];
    const haze = (cloud[i] / 255) * 0.14;
    for (let c = 0; c < 3; c++) {
      const surface = land[c] * (1 - ocean) + sea[c] * ocean;
      base.data[i + c] = surface * (1 - haze) + 240 * haze;
    }
  }
  ctx.putImageData(base, 0, 0);
  return canvas.toDataURL("image/jpeg", 0.94);
}
