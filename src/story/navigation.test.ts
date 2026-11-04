import { describe, expect, test } from "vitest";
import { isNavKey, nextIndex, tapKey } from "./navigation";

describe("nextIndex", () => {
  test("ArrowRight moves forward and ArrowLeft moves back", () => {
    expect(nextIndex(3, "ArrowRight", 9)).toBe(4);
    expect(nextIndex(3, "ArrowLeft", 9)).toBe(2);
  });

  test("PageDown and PageUp behave like the arrows", () => {
    expect(nextIndex(3, "PageDown", 9)).toBe(nextIndex(3, "ArrowRight", 9));
    expect(nextIndex(3, "PageUp", 9)).toBe(nextIndex(3, "ArrowLeft", 9));
  });

  test("clamps at the first and last step", () => {
    expect(nextIndex(0, "ArrowLeft", 9)).toBe(0);
    expect(nextIndex(8, "ArrowRight", 9)).toBe(8);
  });

  test("never returns a negative index, even with no steps yet", () => {
    expect(nextIndex(0, "ArrowRight", 0)).toBe(0);
    expect(nextIndex(0, "End", 0)).toBe(0);
  });

  test("Home and End jump to the ends", () => {
    expect(nextIndex(4, "Home", 9)).toBe(0);
    expect(nextIndex(4, "End", 9)).toBe(8);
  });

  test("other keys leave the step unchanged", () => {
    expect(nextIndex(4, "a", 9)).toBe(4);
    expect(nextIndex(4, "Enter", 9)).toBe(4);
  });
});

describe("isNavKey", () => {
  test("recognises exactly the navigation keys", () => {
    for (const key of ["ArrowRight", "ArrowLeft", "PageDown", "PageUp", "Home", "End"]) {
      expect(isNavKey(key), key).toBe(true);
    }
    for (const key of ["f", "Enter", " ", "a"]) expect(isNavKey(key), key).toBe(false);
  });
});

describe("tapKey", () => {
  test("a tap on the left third goes back, anywhere else goes forward", () => {
    expect(tapKey(100, 1000)).toBe("ArrowLeft");
    expect(tapKey(333, 1000)).toBe("ArrowLeft");
    expect(tapKey(334, 1000)).toBe("ArrowRight");
    expect(tapKey(900, 1000)).toBe("ArrowRight");
  });
});
