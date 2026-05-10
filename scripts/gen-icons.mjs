import sharp from "sharp";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const svg = readFileSync(join(root, "public", "icon.svg"));

const sizes = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
];

for (const { name, size } of sizes) {
  await sharp(svg).resize(size, size).png().toFile(join(root, "public", name));
  console.log("wrote", name);
}

// Maskable icon: pad with theme bg so the safe area is preserved
await sharp({
  create: {
    width: 512,
    height: 512,
    channels: 4,
    background: "#18181b",
  },
})
  .composite([
    {
      input: await sharp(svg).resize(360, 360).png().toBuffer(),
      gravity: "center",
    },
  ])
  .png()
  .toFile(join(root, "public", "icon-maskable.png"));
console.log("wrote icon-maskable.png");

// Apple touch icon
await sharp(svg).resize(180, 180).png().toFile(join(root, "public", "apple-touch-icon.png"));
console.log("wrote apple-touch-icon.png");

// Favicon
await sharp(svg).resize(32, 32).png().toFile(join(root, "public", "favicon.png"));
