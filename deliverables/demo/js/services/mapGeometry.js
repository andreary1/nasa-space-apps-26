// Plate carrée / WGS84. Both texture and anchors use the complete 360° × 180° extent.
export const WORLD = { x: 0, y: 0, w: 960, h: 480 };
export const REGIONS = {
  mundo: [-180, -90, 180, 90],
  brasil: [-85, -35, -30, 10],
  nordeste: [-48.5, -16, -34, -1.8],
};
export function project(lon, lat) {
  return { x: ((lon + 180) / 360) * 960, y: ((90 - lat) / 180) * 480 };
}
export function unproject(x, y) {
  return { lon: (x / 960) * 360 - 180, lat: 90 - (y / 480) * 180 };
}
export function fitBounds([west, south, east, north]) {
  const a = project(west, north),
    b = project(east, south);
  const w = Math.min(
    960,
    Math.max(b.x - a.x, (b.y - a.y) * 2, 960 / 2048) * 1.3,
  );
  return constrain({
    x: (a.x + b.x - w) / 2,
    y: (a.y + b.y - w / 2) / 2,
    w,
    h: w / 2,
  });
}
export function constrain(view) {
  const w = Math.max(960 / 2048, Math.min(960, view.w));
  return {
    x: Math.max(0, Math.min(960 - w, view.x)),
    y: Math.max(0, Math.min(480 - w / 2, view.y)),
    w,
    h: w / 2,
  };
}
export function clusterPoints(points, unitsPerPixel) {
  const groups = [];
  // Bound the entire group footprint: a chain of nearby sites must not merge continents.
  for (const point of points) {
    const group = groups.find((group) => {
      const members = [...group, point];
      return (
        Math.max(...members.map((p) => p.x)) -
          Math.min(...members.map((p) => p.x)) <
          48 * unitsPerPixel &&
        Math.max(...members.map((p) => p.y)) -
          Math.min(...members.map((p) => p.y)) <
          66 * unitsPerPixel
      );
    });
    if (group) group.push(point);
    else groups.push([point]);
  }
  return groups;
}
