/** Timeline of the final slide: the Marine shoots and the Imp dies. Times are ms since the slide appeared. */
export const FINALE = {
  shootStartMs: 900,
  shootEndMs: 2700,
  /** How long each aim/fire frame of the Marine lasts. */
  fireFlickerMs: 120,
  /** When the Imp starts falling, and how long each of his death frames lasts. */
  deathStartMs: 1500,
  deathFrameMs: 240,
} as const;

export interface FinaleFrame {
  marine: "idle" | "aim" | "fire";
  imp: "alive" | "dying" | "dead";
  /** Index of the Imp's death frame; meaningful when `imp` is "dying" or "dead". */
  deathIndex: number;
}

/** What the final slide shows `elapsedMs` after it appeared, given how many death frames the Imp has. */
export function finaleAt(elapsedMs: number, deathFrames: number): FinaleFrame {
  let marine: FinaleFrame["marine"] = "idle";
  if (elapsedMs >= FINALE.shootStartMs && elapsedMs < FINALE.shootEndMs) {
    const tick = Math.floor((elapsedMs - FINALE.shootStartMs) / FINALE.fireFlickerMs);
    marine = tick % 2 === 0 ? "fire" : "aim";
  }

  let imp: FinaleFrame["imp"] = "alive";
  let deathIndex = 0;
  if (elapsedMs >= FINALE.deathStartMs) {
    const index = Math.floor((elapsedMs - FINALE.deathStartMs) / FINALE.deathFrameMs);
    const last = Math.max(deathFrames - 1, 0);
    deathIndex = Math.min(index, last);
    imp = index >= last ? "dead" : "dying";
  }

  return { marine, imp, deathIndex };
}
