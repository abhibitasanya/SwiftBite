const sharp = require('sharp');
const pngToIco = require('png-to-ico');
const fs = require('fs');
const path = require('path');

const publicPng = path.join(__dirname, '..', 'public', 'app_logo.png');
const srcPng = path.join(__dirname, '..', 'src', 'app', 'app_logo.png');
const outIcoPublic = path.join(__dirname, '..', 'public', 'favicon.ico');
const outIcoSrc = path.join(__dirname, '..', 'src', 'app', 'favicon.ico');
const tmpSquare = path.join(__dirname, 'app_logo_sq.png');

async function makeIco(srcPngPath) {
  // resize to 256x256 square with white background if needed
  await sharp(srcPngPath)
    .resize(256, 256, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(tmpSquare);

  const buf = await pngToIco(tmpSquare);
  fs.writeFileSync(outIcoPublic, buf);
  console.log('Wrote', outIcoPublic);
  // copy to src/app if exists
  try {
    fs.mkdirSync(path.dirname(outIcoSrc), { recursive: true });
    fs.writeFileSync(outIcoSrc, buf);
    console.log('Wrote', outIcoSrc);
  } catch (e) {
    console.warn('Could not write src ICO:', e.message);
  }

  fs.unlinkSync(tmpSquare);
}

(async () => {
  const src = fs.existsSync(publicPng) ? publicPng : fs.existsSync(srcPng) ? srcPng : null;
  if (!src) {
    console.error('No app_logo.png found in public or src/app');
    process.exit(1);
  }
  try {
    await makeIco(src);
    console.log('favicon generation complete');
  } catch (err) {
    console.error('Failed to generate favicon:', err);
    process.exit(1);
  }
})();
