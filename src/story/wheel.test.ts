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

  test("captions narrate start, encrypt and decrypt with the real numbers", () => {
    expect(model.captions[0]).toBe("Inicio: m = 4^1 = 4");
    expect(model.captions[1]).toBe("Cifrar: (4^1)^3 = 4^3 = 31");
    expect(model.captions[2]).toBe("Descifrar: (4^3)^7 = 4^21 = 4^(21 mod 5) = 4^1 = 4");
  });
});
