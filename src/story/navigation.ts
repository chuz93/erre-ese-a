/** Maps a key press to the next step index, clamped to [0, total - 1]. */
export function nextIndex(current: number, key: string, total: number): number {
  const last = total - 1;
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
