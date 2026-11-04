import { readFileSync } from "node:fs";
import { PNG } from "pngjs";

/** Loads a PNG and returns { png, isKey(x, y) } using the top-left pixel as the key color. */
export function loadSheet(path) {
  const png = PNG.sync.read(readFileSync(path));
  const { width, data } = png;
  const key = [data[0], data[1], data[2]];
  const isKey = (x, y) => {
    const i = (y * width + x) * 4;
    return data[i] === key[0] && data[i + 1] === key[1] && data[i + 2] === key[2];
  };
  return { png, isKey, key };
}

/** Finds sprite frames as connected blobs (merging pieces closer than `gap` px). Sorted top-to-bottom, left-to-right by row band. */
export function findFrames({ png, isKey }, { gap = 3, minW = 14, minH = 22 } = {}) {
  const { width, height } = png;
  const seen = new Uint8Array(width * height);
  const boxes = [];
  for (let y0 = 0; y0 < height; y0++) {
    for (let x0 = 0; x0 < width; x0++) {
      if (seen[y0 * width + x0] || isKey(x0, y0)) continue;
      let [minX, maxX, minY, maxY] = [x0, x0, y0, y0];
      const stack = [[x0, y0]];
      seen[y0 * width + x0] = 1;
      while (stack.length) {
        const [x, y] = stack.pop();
        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
        for (let dy = -gap; dy <= gap; dy++) {
          for (let dx = -gap; dx <= gap; dx++) {
            const nx = x + dx, ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
            const idx = ny * width + nx;
            if (seen[idx] || isKey(nx, ny)) continue;
            seen[idx] = 1;
            stack.push([nx, ny]);
          }
        }
      }
      const w = maxX - minX + 1, h = maxY - minY + 1;
      if (w >= minW && h >= minH) boxes.push({ x: minX, y: minY, w, h });
    }
  }
  boxes.sort((a, b) => (Math.abs(a.y - b.y) > 20 ? a.y - b.y : a.x - b.x));
  return boxes;
}

/** Crops a box into a new PNG with the key color made transparent. */
export function cropTransparent({ png, isKey }, box) {
  const out = new PNG({ width: box.w, height: box.h });
  for (let y = 0; y < box.h; y++) {
    for (let x = 0; x < box.w; x++) {
      const sx = box.x + x, sy = box.y + y;
      const si = (sy * png.width + sx) * 4, di = (y * box.w + x) * 4;
      if (isKey(sx, sy)) { out.data[di + 3] = 0; continue; }
      out.data[di] = png.data[si]; out.data[di + 1] = png.data[si + 1];
      out.data[di + 2] = png.data[si + 2]; out.data[di + 3] = 255;
    }
  }
  return out;
}
