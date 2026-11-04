import { copyFileSync, mkdirSync } from "node:fs";

mkdirSync("public", { recursive: true });
copyFileSync("rsa-engine/target/wasm32-unknown-unknown/release/rsa_engine.wasm", "public/engine.wasm");
console.log("copied rsa_engine.wasm -> public/engine.wasm");
