import { describe, expect, test } from "vitest";
import { createJsEngine } from "../engine/js-engine";
import { buildSteps, type Step } from "./steps";

const steps = buildSteps(createJsEngine());
const text = (s: Step) => s.lines.map((l) => l.parts.map((p) => p.text).join("")).join("\n");

describe("buildSteps", () => {
  test("builds exactly 8 steps", () => {
    expect(steps).toHaveLength(8);
    expect(steps.map((s) => s.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  test("step 2 explains what a prime is in plain words", () => {
    expect(steps[1].caption).toContain("primo");
    expect(steps[1].caption).not.toContain("átomo");
  });

  test("step 3 shows n = 33", () => {
    expect(text(steps[2])).toContain("3 × 11 = 33");
  });

  test("step 4 shows phi 20 and public key", () => {
    expect(text(steps[3])).toContain("φ = (3 − 1)(11 − 1) = 20");
    expect(text(steps[3])).toContain("(e, n) = (3, 33)");
  });

  test("step 5 encrypts 4 to 31", () => {
    expect(text(steps[4])).toContain("4^3 mod 33 = 64 mod 33 = 31");
  });

  test("step 7 finds d = 7 and decrypts to 4", () => {
    expect(text(steps[6])).toContain("3 × 7 = 21 = 1 mod 20");
    expect(text(steps[6])).toContain("31^7 mod 33 = 4");
  });

  test("step 8 shows e·d = 1 + 1·phi and the 5-value cycle", () => {
    expect(text(steps[7])).toContain("3 × 7 = 21 = 1 + 1 × 20");
    expect(text(steps[7])).toContain("4, 16, 31, 25, 1");
  });

  test("step 8 asks for the number wheel", () => {
    expect(steps[7].visual).toBe("wheel");
    expect(steps.slice(0, 7).every((s) => s.visual === undefined)).toBe(true);
  });

  test("steps 1 to 4 are toy size", () => {
    for (const s of steps.slice(0, 4)) expect(s.scene.size, `step ${s.id}`).toBe("toy");
  });

  test("step 6 scene is real size and imp is stuck", () => {
    expect(steps[5].scene.size).toBe("real");
    expect(steps[5].scene.imp.mood).toBe("stuck");
  });

  test("step 1 has marine bubble containing 4", () => {
    expect(steps[0].scene.marine.bubble).toContain("4");
  });

  test("step 5 has wire label 31", () => {
    expect(steps[4].scene.wire?.label).toBe("31");
  });

  test("step 6 imp bubble mentions n, e and 31", () => {
    const bubble = steps[5].scene.imp.bubble ?? "";
    expect(bubble).toContain("n = 33");
    expect(bubble).toContain("e = 3");
    expect(bubble).toContain("31");
  });

  test("step 7 demon bubble shows 4", () => {
    expect(steps[6].scene.demon.bubble).toBe("4");
  });

  test("steps 2 and 3 keep p and q secret, and only n goes public in step 3", () => {
    expect(steps[1].scene.secret).toEqual(["p = 3", "q = 11"]);
    expect(steps[1].scene.board ?? []).toEqual([]);
    expect(steps[2].scene.secret).toEqual(["p = 3", "q = 11"]);
    expect(steps[2].scene.board).toEqual(["n = 33"]);
  });

  test("step 4 publishes e and n and keeps phi secret", () => {
    expect(steps[3].scene.board).toEqual(["e = 3", "n = 33"]);
    expect(steps[3].scene.secret).toContain("φ = 20");
  });

  test("step 7 keeps d secret while the board stays public", () => {
    expect(steps[6].scene.secret).toContain("d = 7");
    expect(steps[6].scene.board).toEqual(["e = 3", "n = 33"]);
  });

  test("step 4: the Marine receives the public key (3, 33), sent from the Cyberdemon", () => {
    expect(steps[3].scene.marine.bubble).toContain("(3, 33)");
    expect(steps[3].scene.keyWire?.label).toBe("(3, 33)");
  });

  test("step 5: the Marine encrypts the message 4 with the public key (3, 33)", () => {
    const bubble = steps[4].scene.marine.bubble ?? "";
    expect(bubble).toContain("4");
    expect(bubble).toContain("(3, 33)");
    expect(steps[4].scene.keyWire).toBeUndefined();
  });

  test("every Marine bubble is short enough to stay left of the public board (at most 24 characters)", () => {
    for (const s of steps) expect((s.scene.marine.bubble ?? "").length, `step ${s.id}`).toBeLessThanOrEqual(24);
  });

  test("every caption fits on one line (at most 125 characters)", () => {
    for (const s of steps) expect(s.caption.length, `step ${s.id}`).toBeLessThanOrEqual(125);
  });

  test("step 6 says the Imp would win against the toy n = 33, in the step itself", () => {
    expect(text(steps[5])).toContain("n = 33 de juguete");
    expect(text(steps[5])).toContain("factoriza");
    expect(text(steps[5])).not.toContain("paso 4");
  });

  test("every equation line fits one row of the strip (at most 65 characters)", () => {
    for (const s of steps) {
      s.lines.forEach((l, i) => {
        const len = l.parts.map((p) => p.text).join("").length;
        expect(len, `step ${s.id} line ${i + 1}`).toBeLessThanOrEqual(65);
      });
    }
  });
});
