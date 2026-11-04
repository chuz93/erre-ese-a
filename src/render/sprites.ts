export type SpriteName = "marine" | "demon" | "imp";
export type SpriteSet = Record<SpriteName, HTMLImageElement>;

// Doom sprites (see README / page footer for credit). Cropped once from the supplied
// sheets by scripts/extract-sprites.mjs into transparent PNGs in public/sprites/.
const FILES: Record<SpriteName, string> = {
  marine: "sprites/marine.png",
  demon: "sprites/cyberdemon.png",
  imp: "sprites/imp.png",
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${src}`));
    img.src = src;
  });
}

export async function loadSprites(): Promise<SpriteSet> {
  const [marine, demon, imp] = await Promise.all([
    loadImage(FILES.marine),
    loadImage(FILES.demon),
    loadImage(FILES.imp),
  ]);
  return { marine, demon, imp };
}

/** Draws a sprite with its feet at (cx, bottomY), scaled to `height`, no smoothing. */
export function drawSprite(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cx: number,
  bottomY: number,
  height: number,
  flip = false,
): void {
  const width = (img.width / img.height) * height;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(cx, bottomY - height);
  if (flip) ctx.scale(-1, 1);
  ctx.drawImage(img, -width / 2, 0, width, height);
  ctx.restore();
}
