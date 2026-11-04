# RSA Demo: technical documentation

How the project was developed, how it works, how Rust, WebAssembly and Node.js fit together, and what every file does.

- **Live:** https://rsa.elchuz.com/ (also https://erresa.vercel.app/)
- **What it is:** a keyboard-driven, 8-step animated explanation of RSA, with on-screen text in Spanish, built for a 10-minute class demo in an Intrusion Detection course. Three Doom characters play the roles: the **Marine** (sender), the **Cyberdemon** (receiver) and the **Imp** (the intruder listening on the wire).
- **Presenter's script (Spanish):** [guion-presentacion.md](guion-presentacion.md). This document is about the software; the script is about what to say.

## Contents

1. [The demo in one page](#1-the-demo-in-one-page)
2. [How it was developed](#2-how-it-was-developed)
3. [Architecture](#3-architecture)
4. [Rust, WebAssembly and Node.js: how they fit together](#4-rust-webassembly-and-nodejs-how-they-fit-together)
5. [Project structure](#5-project-structure)
6. [Code walkthrough, module by module](#6-code-walkthrough-module-by-module)
7. [How the pieces connect at run time](#7-how-the-pieces-connect-at-run-time)
8. [Testing](#8-testing)
9. [Build, run and deploy](#9-build-run-and-deploy)
10. [Design decisions and trade-offs](#10-design-decisions-and-trade-offs)
11. [Known limitations](#11-known-limitations)
12. [How to change things](#12-how-to-change-things)
13. [Glossary](#13-glossary)
14. [Credits](#14-credits)

---

## 1. The demo in one page

### The numbers

The demo uses one fixed example with tiny numbers, so every step can be checked by hand:

| Name | Value | Meaning |
| --- | --- | --- |
| `p`, `q` | 3, 11 | two secret primes, chosen by the Cyberdemon |
| `n` | 33 | `p × q`, public |
| `φ(n)` | 20 | `(p − 1)(q − 1)`, secret |
| `e` | 3 | public exponent; shares no factor with 20 |
| `d` | 7 | private exponent; `e × d = 21 = 1 + 20` |
| `m` | 4 | the message |
| `c` | 31 | the ciphertext: `4³ mod 33 = 64 mod 33 = 31` |

The **public key** is `(e, n) = (3, 33)`. The **private key** is `d = 7`.
Decrypting gives `31⁷ mod 33 = 4`, the original message.

### The eight steps

| # | Title (on screen, in Spanish) | What it shows |
| --- | --- | --- |
| 1 | El mensaje | The Marine wants to send `4`; the Imp listens. |
| 2 | Dos primos secretos | The Cyberdemon picks `p = 3`, `q = 11` (secret panel). |
| 3 | Multiplicar: la dirección fácil | `n = 3 × 11 = 33` becomes public. |
| 4 | Construir la clave pública | `φ = 20`, `e = 3`; the public key travels to the Marine. |
| 5 | Cifrar | `c = 4³ mod 33 = 31`; the ciphertext travels to the Cyberdemon. |
| 6 | El Imp intercepta | The Imp sees `n`, `e`, `c` but cannot get `d` (real size). |
| 7 | Descifrar con la clave privada | `d = 7`; `31⁷ mod 33 = 4`. |
| 8 | Por qué funciona | A wheel of the 5 values `1, 4, 16, 31, 25`; `e × d = 1 + 1 × φ`. |

The presenter moves with `→` / `←` (or `PageDown` / `PageUp`); `Home` and `End` jump to the ends, `F` toggles fullscreen, and a click on the left third of the screen goes back while a click elsewhere goes forward. Nothing advances by itself between steps.

---

## 2. How it was developed

The whole project was built in one working session on **2026-11-03**, with Claude Code (Anthropic's coding assistant) doing the implementation while the owner made the product decisions. The process had five phases.

### 2.1 Brainstorming and design

The owner asked for something "beyond slides" to explain RSA to a class that had struggled with it, specifically with where `p` and `q` come from and with why decrypting works. A game (shooter or RPG) was considered and set aside, because game mechanics would compete with the math and are risky to run live. What was kept was the spirit: a Doom-style cast, with the audience in the attacker's seat.

Decisions reached through questions:

- Audience: the class and the professor; slot of about 10 minutes; the presenter drives the pace by key press.
- Stack: Next.js on Vercel with the owner's domain; the RSA engine in Rust compiled to WebAssembly; canvas for the animation.
- Layout "A" (chosen from two mockups): characters large on top, one strip with the current equation underneath, a step bar at the bottom.
- Small primes only, so everything can be checked by hand.

The result was a written design document ([superpowers/specs/2026-11-03-rsa-demo-design.md](superpowers/specs/2026-11-03-rsa-demo-design.md)). Before anyone built from it, an independent reviewer read it as if they had to build it. It caught a real contradiction: step 4 showed the Imp factoring `n = 33` instantly, while step 7 said he could not break it. That was resolved by making the toy-versus-real distinction explicit on screen.

### 2.2 Planning

A nine-task implementation plan was written ([superpowers/plans/2026-11-03-rsa-demo.md](superpowers/plans/2026-11-03-rsa-demo.md)): toolchain and scaffold; the JS engine; the Rust/WebAssembly engine and loader; the story script and navigation; the stage and sprites; per-step staging; the scale-up dial; the number wheel; and the backup server, deploy and rehearsal. Each task listed exact file names, signatures and the tests that prove it.

### 2.3 Implementation with test-first development

Every task followed the same cycle: write a test, watch it fail, write the minimal code, watch it pass, commit. Where code could be tested (math, story content, navigation, layout) the tests came first; where it could not (canvas drawing), the result was checked in a real browser.

Decisions the plan did not anticipate, with the reason:

| Decision | Why |
| --- | --- |
| The Rust crate has **no dependencies and no `wasm-bindgen`**; it exports plain `extern "C"` functions. | The PC has no Microsoft C++ linker, so `wasm-pack`, `wasm-bindgen` (which builds proc-macros natively) and native `cargo test` could not run. A dependency-free crate only needs the built-in WebAssembly linker. |
| `public/engine.wasm` is **committed** to git, and `npm run build` does not run Rust. | Vercel's build machine has no Rust. |
| Rust is tested **through the real `.wasm`**, with shared test vectors in Vitest. | No native `cargo test` was possible (see above). This actually tests what ships. |
| The sprite sheets are cropped **once** by a script into transparent PNGs. | More robust live than scanning sheets in the browser; same visual result. |
| The backup is a **local server** (`npm run serve:backup`), not `file://`. | A Next.js static export references its files from the site root, so double-clicking `out/index.html` cannot work. |
| The step staging is expressed as plain data (`SceneState`) and drawn by one function. | Keeps story content testable without a browser. |

### 2.4 Review

After the nine tasks, a separate reviewer read the whole branch with fresh context and found no critical bugs but six important issues, plus one minor finding that was promoted to important because the spec required it. All seven were fixed, with tests where testable:

1. Two-line captions on steps 2 and 5 were partly hidden behind the stage (fixed by shortening them; a test now enforces one-line captions).
2. The step that shows the Imp failing did not say he would win against the toy number (now it does, in that step).
3. The moving ciphertext packet covered the Imp's speech bubble (now drawn behind the bubbles).
4. The canvas was scaled with nearest-neighbour smoothing, making text jagged on low-resolution projectors (rule removed).
5. The wheel's explanation text was too small (enlarged).
6. The public link could not be used without a keyboard (click zones added).
7. The spec requires step "toy keys are breakable" to be said plainly (added).

Smaller findings were deferred (see [Known limitations](#11-known-limitations)).

### 2.5 Iteration requested by the owner

After the first version, the owner asked for: all text in Spanish (the class is taught in Spanish); the supplied Doom sprite sheets as graphics (with credit); a Doom background; a clearer step 2 wording; removing the old step 4 ("the Imp tries to undo it", with a scale-up dial) because it could confuse; a speech bubble and a key packet so it is clear the Marine receives the public key; and a simpler last-step wheel. A Spanish presentation script was added, and the site was deployed on Vercel under `rsa.elchuz.com`.

### 2.6 Commit history

| Commit | What it did |
| --- | --- |
| `4717d26` | Scaffold: Next.js static export, Vitest |
| `a66ceee` | `RsaEngine` interface, shared test vectors, JS engine |
| `7dcac1e` | Rust/WebAssembly engine, adapter, `loadEngine` with fallback |
| `3af414a` | Story script (`buildSteps`) and key navigation |
| `d13c3b8` | Page shell, canvas stage, sprites, equation strip, progress bar |
| `e0ae332` | Staging: public board, secret panel, wire packets |
| `d4b017b` | Scale-up dial and crack-time estimate (later removed) |
| `92b6613` | Number wheel |
| `d6d7d7b` | README, backup server, rehearsal checklist |
| `a75c36c` | Review fixes |
| `85acdb1` | All on-screen text in Spanish |
| `14d76b3` | Step 4 removed, clearer step 2, Doom background |
| `bf57edd` | Marine receives the public key (bubble and packet) |
| `b1f2bf6` | Simpler wheel; Spanish presentation script |

---

## 3. Architecture

### 3.1 Layers

```
 ┌─────────────────────────────────────────────────────────────────────┐
 │  Browser                                                            │
 │                                                                     │
 │  UI layer        app/page.tsx ── components/ (Stage, EquationStrip, │
 │  (React)                          ProgressBar, PowerWheel)          │
 │                      │                        │                     │
 │  Drawing layer       │                 render/ (scene.ts, sprites.ts, │
 │  (Canvas 2D)         │                         layout.ts)           │
 │                      ▼                                              │
 │  Story layer     story/ (steps.ts, navigation.ts, wheel.ts)         │
 │  (pure TypeScript, no browser APIs, fully unit-tested)              │
 │                      │  asks the engine for every number            │
 │                      ▼                                              │
 │  Engine layer    engine/  RsaEngine interface                       │
 │                      │                                              │
 │          ┌───────────┴────────────┐                                 │
 │          ▼                        ▼                                 │
 │   wasm-engine.ts            js-engine.ts   (fallback)               │
 │          │                                                          │
 │          ▼                                                          │
 │   engine.wasm  ◄── compiled from rsa-engine/src/lib.rs (Rust)       │
 └─────────────────────────────────────────────────────────────────────┘
```

**The key idea:** nothing above the engine layer knows whether the math is done by Rust compiled to WebAssembly or by plain JavaScript. Both implement the same `RsaEngine` interface and are tested against the same vector file. The story layer calls the interface to compute every number shown on screen (`φ`, `d`, `c`, the cycle of powers), so the numbers on screen are *computed*, never typed in.

### 3.2 Data flow

```
 DEMO = { p: 3, q: 11, e: 3, m: 4 }
        │
        ▼
 buildSteps(engine, DEMO)  ──►  Step[8]   each Step = title + caption
        │                                  + equation lines + SceneState
        │                                  (+ optional "wheel" visual)
        ▼
 page.tsx keeps `index` (current step); key press → nextIndex(index, key, 8)
        │
        ├─► header: title and caption
        ├─► Stage (canvas): drawScene(ctx, step.scene, time, sprites) every frame
        ├─► EquationStrip: step.lines (HTML, colour-coded by tone)
        ├─► PowerWheel (only when step.visual === "wheel")
        └─► ProgressBar: dots and "Paso i / 8"
```

### 3.3 Technology

| Piece | Used for |
| --- | --- |
| **Rust** (stable toolchain, target `wasm32-unknown-unknown`) | the RSA math engine, compiled to WebAssembly |
| **WebAssembly** | runs that compiled engine inside the browser, in the page itself |
| **Node.js** (+ npm) | development and build tooling only (see section 4.4); not the production runtime |
| **Next.js** (App Router, `output: "export"`) | builds the page into a folder of static files |
| **React** | the page and its small components |
| **TypeScript** | all front-end code |
| **HTML Canvas 2D** | drawing the stage (background, characters, bubbles, packets) |
| **SVG** | the number wheel |
| **Vitest** | unit tests, run under Node |
| **pngjs** | one-off script that crops the sprite sheets |
| **Vercel** | hosting the static output; custom domain `rsa.elchuz.com` |

Versions are the caret ranges in `package.json` (Next.js 16, React 19, Vitest 5, TypeScript, pngjs 7). The toolchain installed for the project was Node.js 26, npm 11 and Rust 1.99.

---

## 4. Rust, WebAssembly and Node.js: how they fit together

### 4.1 What each one is, in this project

- **Rust** is the language in which the RSA engine is *written* (`rsa-engine/src/lib.rs`).
- **WebAssembly (WASM)** is the *compiled form*: a compact binary (`engine.wasm`, 18,570 bytes) that browsers and Node.js can run at near-native speed in a sandbox. Rust does not run in the browser; its compiled output does.
- **Node.js** is *not* where the demo runs in production. The demo runs entirely in the visitor's browser. Node.js is the *toolbox used to build, test and serve* the project (section 4.4).

### 4.2 The Rust side

`rsa-engine/Cargo.toml` defines a library crate with the following key settings:

```toml
[lib]
crate-type = ["cdylib"]      # a dynamic library: for WASM this means a standalone module

[dependencies]               # intentionally empty

[profile.release]
opt-level = "s"              # optimise for size
lto = true                   # link-time optimisation
panic = "abort"              # no unwinding machinery in the binary
```

`rsa-engine/src/lib.rs` exports plain functions:

```rust
#[no_mangle]
pub extern "C" fn mod_pow(base: u32, exp: u32, modulus: u32) -> u32 { ... }
```

- `extern "C"` gives the function a simple, stable calling convention.
- `#[no_mangle]` keeps the function's name exactly as written (otherwise Rust renames it), so it can be found by name from JavaScript.
- Because it is a public C-ABI function in a `cdylib`, the compiler exports it from the WebAssembly module. The module's export list (read from the real file) is:
  `memory, cycle_ptr, decrypt, mod_pow, gcd, is_prime, mod_inverse, phi, power_cycle, smallest_factor, encrypt`. It has **no imports**, so JavaScript passes an empty import object.

The exported functions:

| Rust export | What it computes | Notes |
| --- | --- | --- |
| `is_prime(n)` | 1 if prime, else 0 | trial division |
| `gcd(a, b)` | greatest common divisor | Euclid |
| `phi(p, q)` | `(p−1)(q−1)` | `u32::MAX` unless `p`, `q` are distinct primes |
| `smallest_factor(n)` | smallest factor greater than 1 | `n` itself if prime |
| `mod_pow(base, exp, modulus)` | `base^exp mod modulus` | square-and-multiply; `u64` intermediates |
| `mod_inverse(a, modulus)` | `a⁻¹ mod modulus` | extended Euclid; `u32::MAX` if none |
| `encrypt(m, e, n)` | `m^e mod n` | `u32::MAX` unless `0 ≤ m < n` |
| `decrypt(c, d, n)` | `c^d mod n` | `u32::MAX` unless `0 ≤ c < n` |
| `power_cycle(base, modulus)` | the list `1, base, base², …` until it returns to 1 | writes into a buffer; returns its length |
| `cycle_ptr()` | where that buffer lives in memory | used to read the list |

**Overflow safety.** Every public number is `u32`, but multiplications use `u64` (`result * b % m`), so products of two 32-bit values never overflow. `u32::MAX` is reserved as the "none / error" value.

### 4.3 The WebAssembly boundary: three things to understand

WebAssembly functions can only take and return numbers (32- and 64-bit integers and floats). Three consequences shape the code in `src/engine/wasm-engine.ts`:

**1. Unsigned numbers arrive as signed.** A Rust `u32` is returned as a WebAssembly `i32`, which JavaScript reads as a *signed* number. The "none" value `0xFFFFFFFF` therefore arrives as `-1`. The adapter converts every result back with `x >>> 0` (JavaScript's unsigned reinterpretation) and then compares against `0xFFFFFFFF`:

```ts
const NONE = 0xffffffff;
const u32 = (x: number) => x >>> 0;
```

A "none" result becomes `null` for `modInverse` and a thrown `RangeError` for the other functions, so the rest of the app never sees a magic number.

**2. Lists cannot be returned; they are shared through memory.** WebAssembly has a block of *linear memory* (a big array of bytes) that both Rust and JavaScript can read. `power_cycle` writes its result into a static buffer inside that memory and returns only the *length*; `cycle_ptr()` returns the buffer's *address*. JavaScript then reads it:

```ts
const len = u32(x.power_cycle(base, modulus));
return Array.from(new Uint32Array(x.memory.buffer, x.cycle_ptr(), len));
```

`Array.from(...)` makes a *copy*, because a view over `memory.buffer` can become invalid if the module's memory ever grows. The buffer is a `static mut` array of 1,024 values; access is wrapped in `unsafe` with a comment explaining why it is sound (WebAssembly here is single-threaded, and JavaScript only reads the buffer after the call returns).

**3. Loading and instantiating.** The module is fetched as bytes and instantiated:

```ts
const { instance } = await WebAssembly.instantiate(bytes, {});
```

`src/engine/index.ts` fetches `engine.wasm` with `fetch`, reads it as an `ArrayBuffer` and passes the bytes to `createWasmEngine`. It deliberately does **not** use `instantiateStreaming`, which requires the server to send the correct `application/wasm` MIME type; going through bytes works regardless of the server's headers.

### 4.4 Where Node.js comes in

Node.js appears in four roles, and in none of them does it run the demo for the audience:

| Role | Files / commands |
| --- | --- |
| **Package manager** (npm) | installs Next.js, React, Vitest, TypeScript, pngjs |
| **Build tool for the site** | `next build` compiles the TypeScript/React app into the static folder `out/` |
| **Test runner** | Vitest runs under Node. Node ships its own WebAssembly engine (V8's), so `wasm-engine.test.ts` loads `public/engine.wasm` from disk with `fs.readFileSync` and runs the *same* vectors the browser run would. |
| **Small scripts** | `scripts/copy-wasm.mjs`, `scripts/extract-sprites.mjs` (+ `sprite-lib.mjs`), `scripts/serve-out.mjs` (the offline backup server) |

So: *Rust produces the WASM, Node builds and tests everything around it, and the browser runs it.* Node never executes Rust, and the browser never runs Node.

### 4.5 The full pipeline

```
 rsa-engine/src/lib.rs                (Rust source you edit)
        │  cargo build --target wasm32-unknown-unknown --release
        ▼
 rsa-engine/target/wasm32-unknown-unknown/release/rsa_engine.wasm
        │  node scripts/copy-wasm.mjs
        ▼
 public/engine.wasm                    (committed to git)
        │  next build  (copies public/ into the output)
        ▼
 out/engine.wasm                       (static site folder)
        │  Vercel serves it from its CDN
        ▼
 browser: fetch("engine.wasm") → WebAssembly.instantiate → RsaEngine
```

The two commands that matter are bundled as `npm run build:wasm` (Rust → `public/engine.wasm`) and `npm run build` (static site). They are separate on purpose: Vercel runs only `next build`, and since `public/engine.wasm` is committed, Vercel needs no Rust installed.

### 4.6 The JavaScript fallback and the shared vectors

`src/engine/js-engine.ts` implements the same math in plain TypeScript (using `BigInt` inside `modPow` to avoid precision loss). If the WebAssembly module cannot load for any reason (blocked, offline, wrong server setup, a browser without WebAssembly), `loadEngine` quietly returns the JS engine and the demo looks identical; the footer shows `motor: js` instead of `motor: wasm`.

To guarantee both engines agree, they are tested against one shared file, `shared/engine-vectors.json`: 19 cases such as `{"fn":"modPow","args":[4,3,33],"expect":31}` and `{"fn":"encrypt","args":[33,3,33],"throws":true}`. The JS engine test and the WASM engine test loop over the same file.

---

## 5. Project structure

```
erresa/
├── rsa-engine/                  Rust crate (the RSA math)
│   ├── Cargo.toml
│   └── src/lib.rs
├── shared/
│   └── engine-vectors.json      test cases shared by both engines
├── src/
│   ├── app/                     the page (Next.js App Router)
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/              small UI pieces
│   │   ├── Stage.tsx
│   │   ├── EquationStrip.tsx
│   │   ├── ProgressBar.tsx
│   │   └── PowerWheel.tsx
│   ├── engine/                  RSA engine abstraction
│   │   ├── types.ts
│   │   ├── js-engine.ts
│   │   ├── wasm-engine.ts
│   │   └── index.ts
│   ├── render/                  drawing code
│   │   ├── layout.ts
│   │   ├── scene.ts
│   │   └── sprites.ts
│   └── story/                   what the demo says (pure logic)
│       ├── steps.ts
│       ├── navigation.ts
│       └── wheel.ts
├── public/                      served as-is at the site root
│   ├── engine.wasm
│   └── sprites/  marine.png, imp.png, cyberdemon.png, background.png
├── scripts/                     Node helper scripts
│   ├── copy-wasm.mjs
│   ├── extract-sprites.mjs
│   ├── sprite-lib.mjs
│   └── serve-out.mjs
├── assets/                      source art (not served)
│   ├── sprite-sheets/  marine-sheet.png, imp-sheet.png, cyberdemon-sheet.png
│   └── MS-DOOM-widescreen.png
├── docs/                        this document, the script, spec and plan
├── next.config.mjs  tsconfig.json  vitest.config.ts  package.json
└── README.md
```

Each `*.test.ts` file sits next to the code it tests. Generated or local-only folders (`node_modules/`, `.next/`, `out/`, `rsa-engine/target/`, `.vercel/`, `.claude/`, `.superpowers/`) are git-ignored.

---

## 6. Code walkthrough, module by module

### 6.1 `src/engine/`: the RSA engine

**`types.ts`** defines the interface everything else depends on:

```ts
export interface RsaEngine {
  readonly kind: "wasm" | "js";
  isPrime(n: number): boolean;
  gcd(a: number, b: number): number;
  phi(p: number, q: number): number;            // throws RangeError unless p, q distinct primes
  smallestFactor(n: number): number;
  modPow(base: number, exp: number, modulus: number): number;
  modInverse(a: number, modulus: number): number | null;   // null if gcd(a, modulus) ≠ 1
  encrypt(m: number, e: number, n: number): number;        // throws unless 0 ≤ m < n
  decrypt(c: number, d: number, n: number): number;        // throws unless 0 ≤ c < n
  powerCycle(base: number, modulus: number): number[];     // [1, base, base², …] until back to 1
}
```

**`js-engine.ts`** exports `createJsEngine(): RsaEngine`. `modPow` is square-and-multiply with `BigInt`; `modInverse` is extended Euclid; `powerCycle` multiplies until the value returns to 1 (with a cap).

**`wasm-engine.ts`** exports `createWasmEngine(bytes): Promise<RsaEngine>`. It instantiates the module, then wraps each Rust export, converting signed results with `>>> 0` and turning the "none" value into `null` or a `RangeError` (details in section 4.3).

**`index.ts`** exports `loadEngine()` and re-exports the `RsaEngine` type:

```ts
export async function loadEngine(opts?: { loadWasm?: () => Promise<RsaEngine> }): Promise<RsaEngine>
```

It runs the loader against a 3-second timeout with `Promise.race`. On success it returns the WASM engine; on **any** failure (rejection, bad response, timeout, no WebAssembly) it returns `createJsEngine()`. It never rejects and always clears its timer. The `loadWasm` option exists so tests can inject failures.

### 6.2 `src/story/`: what the demo says

This folder is pure TypeScript with no browser APIs, so it is fully unit-testable.

**`steps.ts`**

- `DEMO = { p: 3, q: 11, e: 3, m: 4 }`: the only four inputs; everything else is derived.
- Types: `Tone` (`"public" | "secret" | "result" | "plain"`, which decides the colour of an equation fragment), `EquationLine` (a list of `{ text, tone }` parts), `SceneState` and `Step`.
- `SceneState` is the data that fully describes what the stage shows in a step:

  | Field | Meaning |
  | --- | --- |
  | `marine.bubble`, `demon.bubble`, `imp.bubble` | speech bubbles |
  | `imp.mood` | `listening`, `cracking`, `winning` or `stuck` (an emoji above the Imp; `cracking` and `winning` are unused after step 4 was removed) |
  | `wire` | ciphertext packet travelling Marine → Cyberdemon |
  | `keyWire` | public-key packet travelling Cyberdemon → Marine |
  | `board` | values on the PÚBLICO panel |
  | `secret` | values on the SECRETO panel |
  | `size` | `"toy"` or `"real"` (the corner badge) |

- `Step` is `{ id, title, caption, lines, scene, visual? }`; `visual: "wheel"` asks the page to draw the number wheel.
- `buildSteps(engine, demo = DEMO): Step[]` returns the 8 steps. It first asks the engine for `phi`, `d = modInverse(e, φ)`, `c = encrypt(m, e, n)`, `back = decrypt(c, d, n)`, `k = (e·d − 1)/φ` and the power cycle, then assembles the steps from those values. Throws `RangeError` if `e` has no inverse.

**`navigation.ts`**

- `nextIndex(current, key, total)`: `ArrowRight`/`PageDown` +1, `ArrowLeft`/`PageUp` −1, `Home` → 0, `End` → last; always clamped to `[0, total − 1]` and never negative, even with `total = 0`; any other key leaves the index unchanged.
- `isNavKey(key)`: true for exactly those six keys (the page uses it to call `preventDefault`).
- `tapKey(clientX, viewWidth)`: left third → `"ArrowLeft"`, anywhere else → `"ArrowRight"`.

**`wheel.ts`**

- `wheelModel(engine, demo): WheelModel` returns `{ base, values, path, captions }`: `values` is the cycle of powers (`[1, 4, 16, 31, 25]`), `path` is the marker's position at start, after encrypting and after decrypting (`[1, 3, 1]`, computed as `1`, `e mod len`, `e·d mod len`), and `captions` are three short sentences ("Inicio: m = 4", "Cifrar (elevar a e = 3): 4 → 31", "Descifrar (elevar a d = 7): 31 → 4").

### 6.3 `src/render/`: drawing

**`layout.ts`**: `fitScale(viewW, viewH, refW = 1920, refH = 1080)` returns `{ scale, offsetX, offsetY }` that fits a 1920×1080 design box inside any window, centred, with letterboxing. A zero-size window gives scale 0 (no `NaN`). Constants `REF_W`, `REF_H`.

**`sprites.ts`**: `loadSprites()` loads the four images (`marine`, `demon`, `imp`, `background`) from `sprites/*.png` and resolves to a `SpriteSet`. `drawSprite(ctx, img, cx, bottomY, height, flip?)` draws a character with its feet at a point, scaled to a height, with image smoothing off so the pixel art stays sharp.

**`scene.ts`**: `drawScene(ctx, scene, timeMs, sprites)` paints one complete frame of the stage (1920×560 logical pixels):

1. The background image, scaled to cover the stage, darkened with a translucent overlay (and a darker floor band) so text stays readable.
2. The three characters with a gentle bobbing motion (a sine of the elapsed time; the Imp fidgets faster), and their name labels.
3. The dashed "wire" between the Marine and the Cyberdemon.
4. The PÚBLICO and SECRETO panels (when the scene has `board` / `secret`).
5. Moving packets along the wire: the ciphertext (`🔒 31`) left to right, the public key (`🔑 (3, 33)`) right to left. Position is `time % 3000 ms`, so they loop.
6. Speech bubbles (drawn after the packets so a packet never hides a bubble), the Imp's mood emoji and the TAMAÑO JUGUETE / TAMAÑO REAL badge.

It has no state of its own: the same scene and time always produce the same picture. Helper functions `roundRect`, `bubble`, `wireChip`, `label` and `panel` do the repeated drawing.

### 6.4 `src/components/`

| Component | Responsibility |
| --- | --- |
| **`Stage.tsx`** | Client component hosting a `<canvas width=1920 height=560>`. A `requestAnimationFrame` loop calls `drawScene` every frame, reading the current scene from a ref so that changing step does not restart the loop. Cancels the loop on unmount. |
| **`EquationStrip.tsx`** | Renders a step's `lines` as HTML, one `<span>` per part with a class from its `tone` (green public, red secret, yellow result). Keyed by step id so lines re-fade-in on every step; each line has a staggered `animation-delay`. |
| **`ProgressBar.tsx`** | One dot per step (done / current / pending), "Paso i / 8" and the key hint. |
| **`PowerWheel.tsx`** | SVG wheel: the cycle values placed on a circle, a yellow marker ring that moves between `path` positions on timers (at 0, 1.6 s and 3.8 s, with a CSS transition on `cx`/`cy`), and the three captions highlighted in turn. Clears its timers on unmount. |

### 6.5 `src/app/`: the page

**`layout.tsx`** sets `lang="es"`, the page title and imports `globals.css`.

**`page.tsx`** is the conductor (a client component, `"use client"`). It holds the state (`engine`, `sprites`, `error`, `index`, window size `view`) and:

1. On mount, calls `loadEngine()` and `loadSprites()` in parallel. Until both are ready it shows "Cargando…".
2. Listens for `resize` and stores the window size.
3. Builds the steps with `useMemo(() => buildSteps(engine))` once the engine exists.
4. Listens for `keydown`: `F` toggles fullscreen; navigation keys call `preventDefault` (so `PageDown` does not scroll) and then `setIndex(nextIndex(...))`, **ignoring auto-repeat** (`e.repeat`) so holding a key never skips steps. Clicking the viewport does the same through `tapKey`.
5. Renders everything inside a `.deck` element laid out at 1920×1080 and scaled with `transform: translate(...) scale(...)` from `fitScale`. This is why text wraps identically at every resolution.

**`globals.css`** places everything in the 1920×1080 design space: header (top 0, height 150), stage canvas (top 160, height 560), equation strip (top 730, height 250), progress bar (top 1000), credit footer (top 1054), and the wheel panel (top 160, over the stage centre). It also defines the colour variables, the tone classes and the fade-in animation.

### 6.6 `scripts/`

| Script | Purpose |
| --- | --- |
| `copy-wasm.mjs` | Copies the Rust build output to `public/engine.wasm`. |
| `sprite-lib.mjs` | Helpers for sprite sheets: `loadSheet` (reads a PNG; the pixel at (0,0) is the background "key" colour), `findFrames` (finds each sprite as a connected blob of non-key pixels), `cropTransparent` (cuts a frame and makes the key colour transparent). |
| `extract-sprites.mjs` | Uses the helpers to cut one front-facing frame per character into `public/sprites/*.png`, plus one 560×200 panel of the widescreen sheet as `background.png`. Run once; the results are committed. |
| `serve-out.mjs` | Tiny static server for `out/` with correct MIME types (including `application/wasm`); `PORT` environment variable; `--no-wasm` makes `engine.wasm` return 404 to rehearse the fallback. |

---

## 7. How the pieces connect at run time

### 7.1 Page load

```
 visitor opens https://rsa.elchuz.com/
        │
        ▼
 static HTML + JS (from out/)  →  React starts, page.tsx mounts, shows "Cargando…"
        │
        ├─► loadEngine():   fetch("engine.wasm") ─► WebAssembly.instantiate ─► wasm engine
        │                    └─ on ANY failure or after 3 s ─► JS engine instead
        └─► loadSprites():  4 images from sprites/
        │
        ▼ when both are ready
 buildSteps(engine) → 8 Steps → render step 1
```

### 7.2 A key press

```
 → pressed
   └─ page.tsx keydown handler
        ├─ ignore if auto-repeat
        ├─ preventDefault
        └─ setIndex(nextIndex(index, "ArrowRight", 8))
              └─ React re-renders with steps[index]:
                    • header text changes
                    • Stage receives the new scene → next animation frame draws it
                    • EquationStrip remounts (keyed by step id) → lines fade in
                    • PowerWheel mounts only if step.visual === "wheel"
                    • ProgressBar updates
```

### 7.3 Where each number on screen comes from

Every value shown is computed by the engine inside `buildSteps`, for example for step 5:

```
 c = engine.encrypt(4, 3, 33)        →  31    (Rust: encrypt → mod_pow)
 line:   `c = 4^3 mod 33 = 64 mod 33 = 31`
 scene:  wire: { label: "31" }       →  the 🔒 31 packet on the stage
```

If the Rust code and the on-screen text ever disagreed, the tests (section 8) would fail.

---

## 8. Testing

Run with `npm test` (Vitest, under Node). There are **46 tests in 7 files**, all passing.

| File | Tests | What it pins |
| --- | --- | --- |
| `engine/js-engine.test.ts` | 2 | the JS engine satisfies every shared vector; its `kind` is `"js"` |
| `engine/wasm-engine.test.ts` | 2 | the **committed `engine.wasm`** satisfies every shared vector; `kind` is `"wasm"` |
| `engine/load-engine.test.ts` | 3 | the fallback: WASM result when it loads; JS when it rejects; JS when it never answers within 3 s (fake timers) |
| `story/steps.test.ts` | 23 | step count (8); the exact equations and numbers of each step; scene state per step (bubbles, packets, panels, toy/real size); every caption ≤ 125 characters and every equation line ≤ 65 so nothing wraps or is hidden |
| `story/navigation.test.ts` | 8 | forward/back, `PageDown`/`PageUp`, clamping at both ends, never a negative index, `Home`/`End`, unknown keys, `isNavKey`, `tapKey` |
| `story/wheel.test.ts` | 4 | the cycle `[1, 4, 16, 31, 25]`, the path `[1, 3, 1]`, the captions, and no exponent chains |
| `render/layout.test.ts` | 4 | `fitScale` at 1920×1080, 1280×720, 1024×768 (letterboxed) and 0×0 |

**What the tests do not cover:** canvas drawing and animation. Those were verified by eye in a real browser. Fullscreen and a real projector were not tested.

The vector file also checks the edge cases: `m ≥ n`, an `e` with no inverse (`modInverse [2, 20]` returns null), `p` or `q` not prime, `p = q`, and `modulus = 1`.

---

## 9. Build, run and deploy

Run everything from the project folder. Open a **new terminal** after installing Node.js so `npm` is on the PATH.

| Goal | Command |
| --- | --- |
| Install dependencies | `npm install` |
| Develop with hot reload | `npm run dev` → http://localhost:3000 |
| Run the tests | `npm test` |
| Build the static site | `npm run build` → folder `out/` |
| Serve the built site (offline backup) | `npm run serve:backup` → http://localhost:8080 |
| Rehearse the JS fallback | `node scripts/serve-out.mjs --no-wasm` (footer should read `motor: js`) |
| Rebuild the Rust engine | `npm run build:wasm` (needs Rust with the `wasm32-unknown-unknown` target) |
| Re-cut sprites or background | `node scripts/extract-sprites.mjs` |
| Deploy | `npx vercel --prod` (logged in to Vercel; project `erresa`) |

**Static export.** `next.config.mjs` sets `output: "export"`, so `next build` produces plain HTML, JS and assets in `out/`; there is no server code. Opening `out/index.html` by double-click does not work, because the page requests its files from the site root; use `serve:backup`.

**Hosting and domain.** Vercel serves `out/`. The custom domain `rsa.elchuz.com` is a subdomain of the owner's personal domain: in Vercel the domain is added to the `erresa` project, and at the DNS provider a `CNAME` record named `rsa` points to the target Vercel shows for that project. The existing records for the main domain are not touched.

**Offline backup for the presentation.** `npm run build` then `npm run serve:backup` gives an identical copy that needs no internet.

---

## 10. Design decisions and trade-offs

| Decision | Alternative considered | Why this one |
| --- | --- | --- |
| Animated explainer driven by keys | A real game (shooter/RPG) | Mechanics would compete with the math and risk failing live; the goal is "I understand RSA". |
| Small fixed numbers | Free input of any primes | Checkable by hand in front of an audience; no big-number math needed. |
| Numbers computed by the engine, not typed | Hard-coded text | One source of truth; tests catch any disagreement. |
| Rust → WebAssembly engine **and** a JS fallback | Only one | WASM is the real "compiled engine" the owner wanted to learn; the fallback means a load problem cannot kill a live demo. |
| Plain `extern "C"` exports, no `wasm-bindgen` | `wasm-bindgen` / `wasm-pack` | Not buildable on this PC (no C++ linker); also a smaller, more transparent boundary. |
| `engine.wasm` committed | Build Rust on Vercel | Vercel has no Rust; committing the 18 KB binary keeps deploys trivial. |
| Fetch bytes + `WebAssembly.instantiate` | `instantiateStreaming` | Independent of the server's MIME type. |
| Fixed 1920×1080 design box scaled with CSS | Responsive layout | Identical look and text wrapping on any projector. |
| Canvas for the stage, HTML for equations, SVG for the wheel | Everything in canvas | Text in HTML stays sharp and selectable; canvas suits sprites and motion. |
| Story logic separate from drawing | Logic inside components | Pure TypeScript can be unit-tested without a browser. |
| Doom sprites, cropped once, with a credit line | Original art | The owner's explicit choice; the public-hosting copyright risk is the owner's accepted call. |
| Honest toy-versus-real labelling | Pretending 33 is secure | The Imp *would* factor 33; the screen says so and explains real keys are far larger. |

---

## 11. Known limitations

These were found in the final review and deliberately deferred; none affects the demo's fixed numbers.

- **Engine inputs outside the demo are not fully validated.** The WASM adapter passes values straight to 32-bit parameters, so numbers above 2³², fractions or negatives are silently converted (the JS engine rejects some of them). `powerCycle` stops at 1,024 entries in WASM and may differ from JS for bases that share a factor with the modulus.
- **A WASM file that loads but misbehaves is not self-checked.** The fallback covers *load* failures; a stale or mismatched `engine.wasm` would throw inside `buildSteps` instead of falling back. The committed file is byte-identical to the Rust build.
- **Fullscreen:** a rejected fullscreen request is not caught, and `Ctrl+F` also toggles fullscreen.
- **Notation:** equations use `=` where mathematicians write `≡` for congruence.
- **Canvas panel titles are small** (20 px design size).
- **The offline backup server** does not guard against a malformed `%` sequence in a URL.
- **Step 8** hides the Imp behind the wheel panel (a deliberate layout choice).
- **Not tested on a real projector, or in fullscreen.**
- **RSA caveat:** this is a teaching toy: no padding, tiny keys, `e = 3`. Real RSA uses 2048-bit or larger keys, padding such as OAEP, and commonly `e = 65537`.

---

## 12. How to change things

**Change the example numbers.** Edit `DEMO` in `src/story/steps.ts`. Texts update automatically, but several tests pin the current values (`33`, `20`, `31`, `7`, …) and must be updated, and the caption and line-length tests still apply. `p` and `q` must be distinct primes and `e` must share no factor with `(p − 1)(q − 1)`.

**Change wording.** Edit titles, captions and lines in `buildSteps`. Keep captions ≤ 125 characters and equation lines ≤ 65 characters (tests enforce it).

**Add or remove a step.** Add or remove an object in the array returned by `buildSteps`, renumber `id`s, and update the step-count and per-step tests. The progress bar adapts to the length.

**Change what the stage shows in a step.** Edit that step's `scene` (bubbles, `wire`, `keyWire`, `board`, `secret`, `size`). To add a new kind of element, add a field to `SceneState` and draw it in `drawScene`.

**Change the background.** In `scripts/extract-sprites.mjs` set `BACKGROUND_PANEL` (4 = grey mountains, 9 = grey alien texture) and run `node scripts/extract-sprites.mjs`.

**Change a character's frame.** Change the `frame` index for that sheet in `scripts/extract-sprites.mjs` and re-run it.

**Change the Rust engine.** Edit `rsa-engine/src/lib.rs`, add or update vectors in `shared/engine-vectors.json`, update `src/engine/js-engine.ts` to match, then run `npm run build:wasm` and `npm test`. Commit the new `public/engine.wasm`.

**Redeploy.** `npm run build` (to check), then `npx vercel --prod`.

---

## 13. Glossary

| Term | Meaning |
| --- | --- |
| **RSA** | An asymmetric cipher: one key encrypts and a different one decrypts. |
| **Prime** | A number divisible only by 1 and itself. |
| **Factoring** | Splitting a number into its primes; easy for 33, believed infeasible for a 617-digit `n`. |
| **mod** | The remainder after division: `64 mod 33 = 31`. |
| **φ (phi)** | Euler's totient: how many numbers from 1 to `n` share no factor with `n`. For `n = p·q` it is `(p − 1)(q − 1)`. |
| **Modular inverse** | The `d` with `e·d ≡ 1 (mod φ)`; here `3 × 7 = 21 ≡ 1 (mod 20)`. |
| **Public key / private key** | `(e, n)` is shared with everyone; `d` stays secret. |
| **WebAssembly (WASM)** | A portable binary format that browsers and Node.js run at near-native speed. |
| **`cdylib`** | A Rust crate type that builds a standalone dynamic library; for WASM, a standalone module. |
| **Linear memory** | The byte array a WASM module owns, shared with JavaScript for passing lists. |
| **C ABI (`extern "C"`)** | A simple calling convention that other languages can use to call Rust functions. |
| **Static export** | Building a site into plain files with no server code. |
| **MITM (man in the middle)** | An attacker who sits on the wire and could substitute the public key; why certificates exist. |

---

## 14. Credits

- **Sprites and backgrounds:** classic Doom graphics from sprite sheets supplied by the owner. The character sheets were ripped by "Falcon Delta" (who asks for credit); the widescreen graphics sheet carries the note "Rip by RandomAccess29, No Credit Needed". Doom, the Marine, the Imp and the Cyberdemon are properties of id Software / Bethesda. The page footer carries the credit line.
- **Built with:** Next.js, React, TypeScript, Vitest, pngjs, Rust, and hosted on Vercel.
- **Development assistance:** Claude Code (Anthropic).
