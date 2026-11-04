import { describe, expect, test } from "vitest";
import { createJsEngine } from "../engine/js-engine";
import { DEMO } from "./steps";
import { wheelModel } from "./wheel";

const model = wheelModel(createJsEngine(), DEMO);

describe("wheelModel", () => {
  test("the cycle of powers of 4 mod 33 has five values", () => {
    expect(model.values).toEqual([1, 4, 16, 31, 25]);
  });

  test("encrypt moves exponent 1 to 3 and decrypt brings it back to 1", () => {
    expect(model.path).toEqual([1, 3, 1]);
  });

  test("captions narrate start, encrypt and decrypt as plain jumps between values", () => {
    expect(model.captions[0]).toBe("Inicio: m = 4");
    expect(model.captions[1]).toBe("Cifrar (elevar a e = 3): 4 → 31");
    expect(model.captions[2]).toBe("Descifrar (elevar a d = 7): 31 → 4");
  });

  test("captions carry no exponent chains (nothing like 4^21)", () => {
    for (const caption of model.captions) expect(caption).not.toContain("^");
  });
});
