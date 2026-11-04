import { createJsEngine } from "./js-engine";
import type { RsaEngine } from "./types";
import { createWasmEngine } from "./wasm-engine";

export type { RsaEngine } from "./types";

const WASM_TIMEOUT_MS = 3000;

async function fetchWasmEngine(): Promise<RsaEngine> {
  const response = await fetch("engine.wasm");
  if (!response.ok) throw new Error(`engine.wasm: ${response.status}`);
  return createWasmEngine(await response.arrayBuffer());
}

/** Resolves the WebAssembly engine, or the JS engine on any failure. Never rejects. */
export async function loadEngine(opts: { loadWasm?: () => Promise<RsaEngine> } = {}): Promise<RsaEngine> {
  const loadWasm = opts.loadWasm ?? fetchWasmEngine;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("wasm load timed out")), WASM_TIMEOUT_MS);
  });
  try {
    return await Promise.race([loadWasm(), timeout]);
  } catch {
    return createJsEngine();
  } finally {
    clearTimeout(timer);
  }
}
