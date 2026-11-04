# RSA Demo for Intrusion Detection Class: Design

Date: 2026-11-03. Needed by Friday night (2026-11-06), about three working days.

## Intent and the why

The owner is a student in an Intrusion Detection course. On Friday night they present to the class and professor, using their laptop and the classroom's built-in projector. They have about **10 minutes**. They could use slides, but want something built instead.

Last week the class studied RSA and it did not land. Some students never understood the first part (what `p` and `q` are and why they are primes), and others did not get the deeper part (why decrypting actually undoes encrypting). Even the professor got tangled up.

**Success is one sentence from the audience: "I understand RSA now."**

Flashy visuals exist only to serve that. Where flash and clarity conflict, clarity wins.

The course is about intrusion, so the framing is the **attacker's view**. A marine (sender) sends a secret number to a Cyberdemon (receiver) while an imp (intruder) listens on the wire. The audience watches the imp see everything public and fail to read the message.

## Goals

- Teach RSA with small numbers a person can verify by hand, from key setup to encryption to decryption to why it works.
- Fix both confusion points: **where `p`, `q` and `n` come from** (including a one-line "what is prime"), and **why `m^(e·d)` returns `m`**.
- The presenter steps through with the keyboard (`→` / `←`) at their own pace. Nothing autoplays. Presenter-remote keys (PageUp/PageDown) should also work.
- Readable from the back of a classroom: large type, high contrast, no tiny labels.
- Publicly deployed (Vercel, owner's own domain) so anyone can open it afterwards.
- Reliable live. It must not break in front of the class.
- The owner follows along while it is built. Code and structure should be understandable enough that they can explain "the RSA engine runs as WebAssembly" honestly.

## Non-goals

- Not a real cryptography library. No padding, no big-number support, no production security claims.
- Not a playable game. No shooter, no RPG, no scoring. The Doom-style characters are a cast, not mechanics.
- Not a general RSA calculator for arbitrary input (optional extra only if time remains; see "Left to the builder").
- Not covering attacks on RSA beyond the factoring idea.
- No accounts, backend, database or analytics.

## Anti-goals (a failure even if it technically works)

- The audience enjoys the animation but still can't say how `d` is found or why decrypt works.
- Math text too small to read from the back of the room.
- Animation that runs ahead of the presenter, or that cannot be skipped back.
- Depends on classroom internet to run (see Constraints).
- Sprites shown without the credit line (see Constraints, Characters).

## Constraints

- **Time:** about three working days. Scope must fit.
- **Presenter's slot:** ~10 minutes, so about 9 steps at roughly one minute each.
- **Small primes only**, chosen for hand-checkability (owner's explicit request).
- **Characters (updated 2026-11-03 by the owner):** the owner supplied the classic Doom sprite sheets `Marine.png`, `Imp.png` and `Cyber Demon.png` (in the project root, ripped by "Falcon Delta", whose sheets ask for credit) and asked that they be used for the graphics. The builder crops front-facing frames from the sheets and removes the solid key-color background (magenta on Marine and Imp, cyan on the Cyberdemon). The page shows a small credit line ("Sprites ripped by Falcon Delta; Doom is a trademark of id Software/Bethesda"). Names on screen are "Marine", "Cyberdemon", "Imp". This replaces the earlier "original pixel art, no ripped sprites" decision; the earlier concern was about publishing id/Bethesda assets on a public domain, which is now the owner's accepted call.
- **Layout A (decided):** characters large on a stage across the top, a 3-to-1 strip below holding the current equation, and a step-progress bar with the arrow-key hint at the bottom. Mockup: `scratchpad/mock/index.html` (outside the repo; the layout is described fully here).
- **Stack (decided by owner, with builder's refinement):**
  - Next.js, exported as a static site, deployed on Vercel to the owner's domain.
  - RSA math engine written in Rust, compiled to WebAssembly.
  - Canvas (or SVG) for the characters and animation.
  - A plain-JS implementation of the same math as a fallback, so the demo cannot die from a WASM load failure.
- **Machine:** the owner's Windows 11 laptop currently has no Node.js, npm, Rust or wasm toolchain. The builder will need to install these (via winget or similar), with the owner's go-ahead at that point.
- **Offline safety:** the presenter may have no internet or a restricted network. The built site should also be runnable locally (a production build or a static folder) as a backup.
- **Language (updated 2026-11-03 by the owner):** all on-screen text is Spanish, because the class is taught in Spanish. Code, comments and the README stay in English.

## The story: 9 steps

Fixed numbers for the demo: **p = 3, q = 11, n = 33, φ(n) = 20, e = 3, d = 7, message m = 4, ciphertext c = 31.** All verified by hand: 3×7 = 21 ≡ 1 (mod 20); 4³ = 64 ≡ 31 (mod 33); 31⁷ ≡ 4 (mod 33).

1. **Cast.** The marine wants to send the Cyberdemon the number 4. The imp listens on the wire.
2. **Two secret primes.** The Cyberdemon picks p = 3 and q = 11. A short on-screen definition of "prime" appears here, since this is where the class got lost. It also says *why* primes: they are the "atoms" every number is built from, and each number breaks into primes in exactly one way, which is what makes "multiply two primes" a lock that only the maker can open. *(My call; see "Calls made while writing this".)*
3. **Multiply to n = 33.** The easy direction. n becomes public; p and q stay secret.
4. **The imp tries to undo it.** On the toy number he wins instantly (33 = 3 × 11), and the screen says plainly that **toy keys are breakable**. Then a dial scales n up to "real size" (hundreds of digits) and the imp's timer runs to an absurd length. This is the "easy forward, hard backward" moment. The real-size timer is a clearly labeled **estimate** (for example "trial division at N operations per second would take about X years"), not a live computation; only the toy n is factored for real. *(The scale-up visual is the builder's design, but it must land as the point of the step.)*
5. **Public key.** The Cyberdemon computes φ = (3−1)(11−1) = 20 and picks e = 3 (sharing no factor with 20). He publishes (e, n) = (3, 33). φ stays secret. A one-line note says the formula (p−1)(q−1) works because p and q are prime.
6. **Encrypt.** The marine computes 4³ mod 33 = 31 and sends it.
7. **The imp intercepts 31.** He knows n, e and 31 but not φ, so he cannot find d. This only holds at **real size**: the screen carries a visible "toy size / real size" label and flips to real size here, then notes that with the toy n = 33 the imp would simply factor it as in step 4 and win. The equations keep using the toy numbers so the audience can follow them.
8. **Decrypt.** The Cyberdemon finds d = 7 because 3 × 7 = 21 ≡ 1 (mod 20), then computes 31⁷ mod 33 = 4.
9. **Why it works.** e·d = 21 = 1 + 1·φ, so (m^e)^d = m · (m^φ)^1 ≡ m (mod n), by Euler's theorem. Suggested visual: a "number wheel" of the powers of 4 mod 33 (4, 16, 31, 25, 1, repeating, a cycle of length 5). Encrypting moves exponent 1 to 3 (landing on 31) and decrypting moves 3 to 21 ≡ 1 (mod 5), landing back on 4. The builder may choose another visual if it explains the idea better.

Each step shows its equation in the lower strip with the live numbers highlighted, and advances on a single key press.

## Calls made while writing this (mine, not the owner's; please check them)

- **Toy versus real size.** The imp breaks the toy keys (step 4) and fails against real-size keys (step 7). The slide for step 7 makes the switch explicit with a label so the story is honest rather than contradictory.
- **The real-size timer is an estimate, not a computation.** It is labeled as such on screen. No big-number support is built.
- **"Why primes" gets a short on-screen explanation in step 2** (unique factorization, the "atoms" idea), and step 5 notes that φ = (p−1)(q−1) works because p and q are prime. Nothing longer than that.
- **Language:** English at first, switched to Spanish by the owner (see Constraints).
- **Stack refinement:** static export of Next.js, Rust compiled to WebAssembly, plus a JS fallback of the same math.

## Decided by the owner

- Audience is the class and professor; one live demo; ~10 minutes; presenter-driven stepping.
- Next.js on Vercel with their own domain; WebAssembly for the engine; Doom-style cast with the imp as intruder.
- Small primes; layout A; the 9-step story above.
- The owner will not write the code and wants to follow along.

## Left to the builder

- Exact visual design, palette, animation timing and transitions, and pixel-art style.
- How to realise step 4's scale-up and step 9's wheel.
- Project structure, repository layout, test approach, and how the WASM/JS fallback is switched.
- Whether to add an optional "free play" screen letting the audience try other small primes after the main story (only if it does not threaten the Friday deadline).
- Hosting details (Vercel project setup, domain DNS). The owner will supply domain access when needed.

## Changes requested by the owner after the first build (2026-11-03)

- **Step 4 removed** ("The Imp tries to undo it", including the scale-up dial and the crack-time estimate). The story is now **8 steps**; the old steps 5 to 9 became 4 to 8. The "toy keys are breakable, real keys are not" point stays inside the Imp's step (now step 6), which says the Imp would factor the toy n = 33.
- **Step 2 wording:** the "primes are the atoms of numbers" sentence was replaced by a plain definition: a prime is only divisible by 1 and itself, and every number is made by multiplying primes in one way.
- **Stage background:** the Doom widescreen graphics panel with the grey mountains (darkened for readability) replaces the plain gradient.
- **Not redeployed:** the owner asked not to redeploy; the live site still shows the previous version until they say so.
- **The Marine receives the public key (step 4):** the Marine now has a speech bubble ("Recibo (e, n) = (3, 33)") and a key packet 🔑 travels from the Cyberdemon to the Marine; in step 5 the Marine's bubble reads "Cifro 4 con (3, 33)".
