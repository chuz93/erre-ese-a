import { describe, expect, test } from "vitest";
import { FINALE, finaleAt } from "./finale";

const DEATH_FRAMES = 5;

describe("finaleAt", () => {
  test("at the start the Marine is idle and the Imp is alive", () => {
    const f = finaleAt(0, DEATH_FRAMES);
    expect(f.marine).toBe("idle");
    expect(f.imp).toBe("alive");
    expect("tracer" in f).toBe(false);
  });

  test("the Marine starts firing at shootStartMs", () => {
    expect(finaleAt(FINALE.shootStartMs + 1, DEATH_FRAMES).marine).toBe("fire");
  });

  test("the Marine alternates between aiming and firing while shooting", () => {
    const first = finaleAt(FINALE.shootStartMs + 1, DEATH_FRAMES).marine;
    const second = finaleAt(FINALE.shootStartMs + FINALE.fireFlickerMs + 1, DEATH_FRAMES).marine;
    expect(first).toBe("fire");
    expect(second).toBe("aim");
  });

  test("the Imp is still alive until the first death frame starts", () => {
    expect(finaleAt(FINALE.deathStartMs - 1, DEATH_FRAMES).imp).toBe("alive");
  });

  test("the Imp starts dying on frame 0", () => {
    const f = finaleAt(FINALE.deathStartMs + 1, DEATH_FRAMES);
    expect(f.imp).toBe("dying");
    expect(f.deathIndex).toBe(0);
  });

  test("the Imp ends dead on the last death frame and stays there", () => {
    for (const t of [FINALE.deathStartMs + 10_000, 60_000]) {
      const f = finaleAt(t, DEATH_FRAMES);
      expect(f.imp).toBe("dead");
      expect(f.deathIndex).toBe(DEATH_FRAMES - 1);
    }
  });

  test("the Marine stops shooting after shootEndMs", () => {
    expect(finaleAt(FINALE.shootEndMs + 1, DEATH_FRAMES).marine).toBe("idle");
  });

  test("the death animation never goes backwards or past its last frame", () => {
    let last = 0;
    for (let t = 0; t <= 6000; t += 50) {
      const f = finaleAt(t, DEATH_FRAMES);
      if (f.imp === "alive") continue;
      expect(f.deathIndex).toBeGreaterThanOrEqual(last);
      expect(f.deathIndex).toBeLessThanOrEqual(DEATH_FRAMES - 1);
      last = f.deathIndex;
    }
  });

  test("the Marine fires before the Imp starts to fall", () => {
    expect(FINALE.shootStartMs).toBeLessThan(FINALE.deathStartMs);
  });
});
