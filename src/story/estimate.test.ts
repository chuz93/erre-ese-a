import { describe, expect, test } from "vitest";
import { digitsAt, estimateCrackTime } from "./estimate";

describe("estimateCrackTime", () => {
  test("66 digits at 1e9 tries/second is about 10^16.5 years", () => {
    expect(estimateCrackTime(66, 1e9).log10Years).toBeCloseTo(16.5, 1);
  });

  test("617 digits reads as a power of ten in years", () => {
    const { label } = estimateCrackTime(617, 1e9);
    expect(label.startsWith("≈ 10^")).toBe(true);
    expect(label.endsWith(" años")).toBe(true);
  });

  test("2 digits reads less than a second", () => {
    expect(estimateCrackTime(2, 1e9).label).toBe("menos de un segundo");
  });

  test("mid-range sizes read in plain years", () => {
    expect(estimateCrackTime(40, 1e9).label).toMatch(/^≈ [\d,.]+ años$/);
  });
});

describe("digitsAt", () => {
  test("holds at toy size (2 digits) while the Imp cracks it", () => {
    expect(digitsAt(0)).toBe(2);
    expect(digitsAt(1999)).toBe(2);
  });

  test("grows to 617 digits and stays there", () => {
    expect(digitsAt(5500)).toBe(617);
    expect(digitsAt(60000)).toBe(617);
  });

  test("never shrinks as time passes", () => {
    let last = 0;
    for (let t = 0; t <= 6000; t += 100) {
      const d = digitsAt(t);
      expect(d).toBeGreaterThanOrEqual(last);
      last = d;
    }
  });
});
