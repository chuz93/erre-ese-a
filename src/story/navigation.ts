/** Maps a key press to the next step index, clamped to [0, total - 1]. */
export function nextIndex(current: number, key: string, total: number): number {
  const last = Math.max(total - 1, 0);
  switch (key) {
    case "ArrowRight":
    case "PageDown":
      return Math.min(current + 1, last);
    case "ArrowLeft":
    case "PageUp":
      return Math.max(current - 1, 0);
    case "Home":
      return 0;
    case "End":
      return last;
    default:
      return current;
  }
}

const NAV_KEYS = new Set(["ArrowRight", "ArrowLeft", "PageDown", "PageUp", "Home", "End"]);

/** True for the keys that move between steps (the page prevents their default scrolling). */
export function isNavKey(key: string): boolean {
  return NAV_KEYS.has(key);
}

/** The key a tap/click at `clientX` stands for: left third goes back, the rest goes forward. */
export function tapKey(clientX: number, viewWidth: number): "ArrowLeft" | "ArrowRight" {
  return clientX < viewWidth / 3 ? "ArrowLeft" : "ArrowRight";
}
