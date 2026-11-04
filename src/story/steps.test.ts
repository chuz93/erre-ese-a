import { describe, expect, test } from "vitest";
import { createJsEngine } from "../engine/js-engine";
import { buildSteps, type Step } from "./steps";

const steps = buildSteps(createJsEngine());
const text = (s: Step) => s.lines.map((l) => l.parts.map((p) => p.text).join("")).join("\n");

describe("buildSteps", () => {
  test("builds exactly 9 steps", () => {
    expect(steps).toHaveLength(9);
    expect(steps.map((s) => s.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  test("step 3 shows n = 33", () => {
    expect(text(steps[2])).toContain("3 × 11 = 33");
  });

  test("step 5 shows phi 20 and public key", () => {
    expect(text(steps[4])).toContain("φ = (3 − 1)(11 − 1) = 20");
    expect(text(steps[4])).toContain("(e, n) = (3, 33)");
  });

  test("step 6 encrypts 4 to 31", () => {
    expect(text(steps[5])).toContain("4^3 mod 33 = 64 mod 33 = 31");
  });

  test("step 8 finds d = 7 and decrypts to 4", () => {
    expect(text(steps[7])).toContain("3 × 7 = 21 = 1 mod 20");
    expect(text(steps[7])).toContain("31^7 mod 33 = 4");
  });

  test("step 9 shows e·d = 1 + 1·phi and the 5-value cycle", () => {
    expect(text(steps[8])).toContain("3 × 7 = 21 = 1 + 1 × 20");
    expect(text(steps[8])).toContain("4, 16, 31, 25, 1");
  });

  test("step 4 scene starts toy size", () => {
    expect(steps[3].scene.size).toBe("toy");
  });

  test("step 7 scene is real size and imp is stuck", () => {
    expect(steps[6].scene.size).toBe("real");
    expect(steps[6].scene.imp.mood).toBe("stuck");
  });
});
