const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicPath = path.join(__dirname, '..', 'public', 'app_logo.png');
const srcPath = path.join(__dirname, '..', 'src', 'app', 'app_logo.png');
const tmpPath = path.join(__dirname, 'app_logo_nogreen_tmp.png');

function dist2(r1,g1,b1,r2,g2,b2){
  const dr=r1-r2, dg=g1-g2, db=b1-b2; return dr*dr+dg*dg+db*db;
}

(async ()=>{
  if(!fs.existsSync(publicPath)){
    console.error('public/app_logo.png missing'); process.exit(1);
  }
  const { data, info } = await sharp(publicPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const out = Buffer.from(data);

    // Determine background color by sampling corners
    function sampleCorner(cx, cy, w, h) {
      const sample = [];
      const sampleSize = 6;
      for (let yy = cy; yy < Math.min(cy + sampleSize, h); yy++) {
        for (let xx = cx; xx < Math.min(cx + sampleSize, w); xx++) {
          const i = (yy * w + xx) * channels;
          sample.push([data[i], data[i+1], data[i+2]]);
        }
      }
      const avg = sample.reduce((acc, v) => { acc[0]+=v[0]; acc[1]+=v[1]; acc[2]+=v[2]; return acc; }, [0,0,0]).map(a=>Math.round(a/sample.length));
      return avg;
    }

    const tl = sampleCorner(0,0,width,height);
    const tr = sampleCorner(Math.max(0,width-6),0,width,height);
    const bl = sampleCorner(0,Math.max(0,height-6),width,height);
    const br = sampleCorner(Math.max(0,width-6),Math.max(0,height-6),width,height);
    // pick the most common-ish corner color
    const corners = [tl,tr,bl,br];
    const bg = corners.reduce((acc, c)=>{ acc[0]+=c[0]; acc[1]+=c[1]; acc[2]+=c[2]; return acc; }, [0,0,0]).map(a=>Math.round(a/4));

    const maxDist2 = 140*140; // threshold squared for matching bg
    const borderThresh = Math.round(Math.min(width,height)*0.18);

    for(let y=0;y<height;y++){
      for(let x=0;x<width;x++){
        const idx = (y*width + x)*channels;
        const r = data[idx];
        const g = data[idx+1];
        const b = data[idx+2];
        // only consider pixels near edges (wider band)
        if(x < borderThresh || x >= width-borderThresh || y < borderThresh || y >= height-borderThresh){
          if(dist2(r,g,b,bg[0],bg[1],bg[2]) <= maxDist2){
            out[idx] = 255; out[idx+1] = 255; out[idx+2] = 255; out[idx+3] = 255;
          }
        }
      }
    }

  await sharp(out, { raw: { width, height, channels } }).png().toFile(tmpPath);
  fs.copyFileSync(tmpPath, publicPath);
  console.log('WROTE', publicPath);
  if(fs.existsSync(srcPath)){
    fs.copyFileSync(tmpPath, srcPath);
    console.log('WROTE', srcPath);
  } else {
    console.warn('src copy not found; skipped');
  }
  fs.unlinkSync(tmpPath);
  console.log('Done');
})();
