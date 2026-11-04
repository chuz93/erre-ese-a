import { describe, expect, test } from "vitest";
import { fitScale } from "./layout";

describe("fitScale", () => {
  test("1920x1080 is the reference size: scale 1, no offset", () => {
    expect(fitScale(1920, 1080)).toEqual({ scale: 1, offsetX: 0, offsetY: 0 });
  });

  test("1280x720 scales down by 2/3 with no letterbox", () => {
    const r = fitScale(1280, 720);
    expect(r.scale).toBeCloseTo(2 / 3, 4);
    expect(r.offsetX).toBeCloseTo(0, 4);
    expect(r.offsetY).toBeCloseTo(0, 4);
  });

  test("1024x768 (4:3) is letterboxed vertically", () => {
    const r = fitScale(1024, 768);
    expect(r.scale).toBeCloseTo(0.5333, 3);
    expect(r.offsetX).toBeCloseTo(0, 4);
    expect(r.offsetY).toBeCloseTo(96, 3);
  });

  test("a zero-size window gives scale 0 without NaN", () => {
    expect(fitScale(0, 0)).toEqual({ scale: 0, offsetX: 0, offsetY: 0 });
  });
});
