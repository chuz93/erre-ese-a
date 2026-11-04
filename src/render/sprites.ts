export interface SpriteSet {
  marine: HTMLImageElement;
  demon: HTMLImageElement;
  imp: HTMLImageElement;
  background: HTMLImageElement;
  /** Final slide: the Marine aiming and firing (gun pointing left; draw flipped). */
  marineAim: HTMLImageElement;
  marineFire: HTMLImageElement;
  /** Final slide: the Imp's death animation, first frame to last. */
  impDeath: HTMLImageElement[];
}

// Doom sprites (see README / page footer for credit). Cropped once from the supplied
// sheets by scripts/extract-sprites.mjs into transparent PNGs in public/sprites/.
const IMP_DEATH_FRAMES = 5;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${src}`));
    img.src = src;
  });
}

export async function loadSprites(): Promise<SpriteSet> {
  const [marine, demon, imp, background, marineAim, marineFire, ...impDeath] = await Promise.all([
    loadImage("sprites/marine.png"),
    loadImage("sprites/cyberdemon.png"),
    loadImage("sprites/imp.png"),
    loadImage("sprites/background.png"),
    loadImage("sprites/marine-aim.png"),
    loadImage("sprites/marine-fire.png"),
    ...Array.from({ length: IMP_DEATH_FRAMES }, (_, i) => loadImage(`sprites/imp-death-${i}.png`)),
  ]);
  return { marine, demon, imp, background, marineAim, marineFire, impDeath };
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
