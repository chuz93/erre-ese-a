export const REF_W = 1920;
export const REF_H = 1080;

/** Scale and centering offsets that fit a 1920x1080 reference stage inside a view, letterboxed. */
export function fitScale(
  viewW: number,
  viewH: number,
  refW: number = REF_W,
  refH: number = REF_H,
): { scale: number; offsetX: number; offsetY: number } {
  const scale = Math.max(0, Math.min(viewW / refW, viewH / refH));
  return {
    scale,
    offsetX: (viewW - refW * scale) / 2,
    offsetY: (viewH - refH * scale) / 2,
  };
}
