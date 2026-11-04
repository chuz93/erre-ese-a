# RSA demo: the Marine, the Cyberdemon and the Imp

A keyboard-driven, 9-step animated explanation (on-screen text in Spanish) of RSA (key setup, encryption, decryption, why it works) with small numbers: **p = 3, q = 11, n = 33, φ = 20, e = 3, d = 7, m = 4, c = 31**.

The RSA math runs as Rust compiled to WebAssembly (`rsa-engine/`), with a plain-JS copy of the same math as an automatic fallback. The page footer shows which one is running (`motor: wasm` or `motor: js`).

## Keys

| Key | Action |
| --- | --- |
| `→` or `PageDown` | next step |
| `←` or `PageUp` | previous step |
| `Home` / `End` | first / last step |
| `F` | toggle fullscreen |

Nothing autoplays between steps. Holding a key does not skip steps.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # engine, story and layout tests
npm run build        # static site in out/
npm run serve:backup # serves out/ at http://localhost:8080
```

`npm run build:wasm` rebuilds `public/engine.wasm` from `rsa-engine/` (needs Rust with the `wasm32-unknown-unknown` target). The built file is committed, so Vercel does not need Rust.

## Offline backup for the presentation

1. `npm run build`
2. `npm run serve:backup` and open http://localhost:8080 (no internet needed).
3. To rehearse the fallback path, run `node scripts/serve-out.mjs --no-wasm`: the footer should read `motor: js` and everything else should look identical.

Open the site through the local server, not by double-clicking `out/index.html` (the page loads its files from the site root).

## Deploy (Vercel)

1. `npx vercel login`, then `npx vercel --prod` from this folder (or import the repository in the Vercel dashboard). Framework preset: Next.js; the static export is configured in `next.config.mjs`.
2. In the Vercel project, Settings → Domains → add your domain and set the DNS records Vercel shows.

## Technical documentation

See [docs/documentacion-tecnica.md](docs/documentacion-tecnica.md): how it was developed, the architecture, how Rust, WebAssembly and Node.js fit together, and a module-by-module code walkthrough.

## Presentation script

See [docs/guion-presentacion.md](docs/guion-presentacion.md) (Spanish): what to say at each step, the math behind it, likely questions.

## Rehearsal checklist

- [ ] Full run-through with a timer: 8 to 10 minutes for all 9 steps.
- [ ] On the laptop's own screen, then on the classroom projector (or an external monitor) at 1280×720 and 1920×1080. Text readable from the back.
- [ ] Wi-Fi off, using `npm run serve:backup`.
- [ ] `F` fullscreen on and off mid-step; resize the window; the step must not change.
- [ ] Press `→` on step 9 and `←` on step 1: nothing breaks.
- [ ] Hold `→`: only one step per press.

## License

The original code and documentation are released under the [MIT License](LICENSE) (Copyright (c) 2026 elchuz). The MIT license does **not** cover the Doom artwork (sprites, backgrounds and sprite sheets); that remains the property of its owners, as described under Credits and in the `LICENSE` file.

Source code: https://github.com/chuz93/erre-ese-a

## Credits

Sprites ripped by Falcon Delta. Doom, the Marine, the Imp and the Cyberdemon are id Software/Bethesda properties; the sprite sheets are in `assets/sprite-sheets/` and the cropped frames in `public/sprites/` (made by `scripts/extract-sprites.mjs`).

## Changes after the first version

- The old step 4 ("the Imp tries to undo it", with the scale-up dial) was removed on the owner's request because it could confuse more than it showed. The "toy keys are breakable, real ones are not" point now sits inside the Imp's own step (step 6).
- The stage background is a panel from the Doom widescreen graphics sheet (`assets/MS-DOOM-widescreen.png`), extracted to `public/sprites/background.png` by `scripts/extract-sprites.mjs`. Change `BACKGROUND_PANEL` in that script (4 = grey mountains, 9 = grey alien texture) and re-run it to pick another.
- A final slide (step 9, "El Imp nunca lo descifró") was added: the Marine shoots and the Imp plays his death animation, using frames cropped from the supplied sprite sheets. The animation lives in `src/story/finale.ts` and replays every time the slide is entered.
