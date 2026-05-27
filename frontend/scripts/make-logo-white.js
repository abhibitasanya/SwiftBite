const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicPath = path.join(__dirname, '..', 'public', 'app_logo.png');
const srcPath = path.join(__dirname, '..', 'src', 'app', 'app_logo.png');
const tmpPath = path.join(__dirname, 'app_logo_white_tmp.png');

async function makeWhite(src, dest) {
  try {
    await sharp(src)
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .toFile(dest);
    console.log('WROTE', dest);
  } catch (err) {
    console.error('ERROR processing', src, err);
    process.exit(1);
  }
}

(async () => {
  if (!fs.existsSync(publicPath)) {
    console.error('public/app_logo.png not found at', publicPath);
    process.exit(1);
  }

  // Create a flattened temporary PNG
  await makeWhite(publicPath, tmpPath);

  // Overwrite public and src copies
  fs.copyFileSync(tmpPath, publicPath);
  console.log('Updated', publicPath);

  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(tmpPath, srcPath);
    console.log('Updated', srcPath);
  } else {
    console.warn('src/app/app_logo.png not found; skipping src copy');
  }

  // Remove tmp
  fs.unlinkSync(tmpPath);
  console.log('Done');
})();
