import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(scriptDir, "..");
const root = path.join(frontendRoot, "public");
const sourceLogo = path.resolve(frontendRoot, "..", "app_logo.png");

async function renderPngFromLogo(outputPath, width, height = width, options = {}) {
  await sharp(await readFile(sourceLogo))
    .resize(width, height, {
      fit: options.fit ?? "contain",
      background: options.background ?? { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(outputPath);
}

async function main() {
  await renderPngFromLogo(path.join(root, "favicon-16x16.png"), 16);
  await renderPngFromLogo(path.join(root, "favicon-32x32.png"), 32);
  await renderPngFromLogo(path.join(root, "apple-touch-icon.png"), 180);
  await renderPngFromLogo(path.join(root, "icon-192.png"), 192);
  await renderPngFromLogo(path.join(root, "icon-512.png"), 512);
  await renderPngFromLogo(path.join(root, "maskable-icon.png"), 512);

  const ogCanvas = sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 4,
      background: { r: 244, g: 234, b: 208, alpha: 1 },
    },
  });

  const ogLogo = await sharp(await readFile(sourceLogo))
    .resize(540, 540, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  await ogCanvas.composite([{ input: ogLogo, left: 330, top: 45 }]).png().toFile(path.join(root, "og-image.png"));

  const faviconIco = await pngToIco([path.join(root, "favicon-32x32.png"), path.join(root, "favicon-16x16.png")]);
  await writeFile(path.join(root, "favicon.ico"), faviconIco);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
