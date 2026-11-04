// One-off asset step: crops the front-facing idle frame out of each Doom sprite sheet
// (assets/sprite-sheets/*) and writes a transparent PNG to public/sprites/.
// Frame numbers are indexes into findFrames() output (top-to-bottom, left-to-right).
import { writeFileSync } from "node:fs";
import { PNG } from "pngjs";
import { cropTransparent, findFrames, loadSheet } from "./sprite-lib.mjs";

const SPRITES = [
  { sheet: "assets/sprite-sheets/marine-sheet.png", frame: 0, out: "public/sprites/marine.png" },
  { sheet: "assets/sprite-sheets/imp-sheet.png", frame: 0, out: "public/sprites/imp.png" },
  { sheet: "assets/sprite-sheets/cyberdemon-sheet.png", frame: 0, out: "public/sprites/cyberdemon.png" },
];

for (const { sheet, frame, out } of SPRITES) {
  const loaded = loadSheet(sheet);
  const box = findFrames(loaded)[frame];
  writeFileSync(out, PNG.sync.write(cropTransparent(loaded, box)));
  console.log(`${out}: ${box.w}x${box.h} from ${sheet} frame ${frame}`);
}

// Stage background: one 560x200 panel (index 4 = the grey mountains; index 9 = the grey alien texture)
// from the widescreen graphics sheet. Panels are separated by 3px borders, so search with gap 1.
const BACKGROUND_PANEL = 4;
const wide = loadSheet("assets/MS-DOOM-widescreen.png");
const panel = findFrames(wide, { gap: 1, minW: 300, minH: 150 })[BACKGROUND_PANEL];
writeFileSync("public/sprites/background.png", PNG.sync.write(cropTransparent(wide, panel)));
console.log(`public/sprites/background.png: ${panel.w}x${panel.h} from widescreen sheet panel ${BACKGROUND_PANEL}`);
