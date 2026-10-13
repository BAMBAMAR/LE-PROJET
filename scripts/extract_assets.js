const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const srcPath = 'C:/Users/HP/.gemini/antigravity-ide/brain/8523804f-b992-4a99-9ce7-dba197b0babf/.user_uploaded/media_1791882679912.jpg';
  const imgBase64 = fs.readFileSync(srcPath).toString('base64');
  const outDir = path.join(__dirname, '../assets/branding/studio_decryptage');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <body style="margin:0; background:#000;">
        <canvas id="cv" width="1024" height="1024"></canvas>
      </body>
    </html>
  `);

  const results = await page.evaluate(async (b64) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const cv = document.getElementById('cv');
        const ctx = cv.getContext('2d');
        ctx.drawImage(img, 0, 0, 1024, 1024);

        function cropFeathered(x, y, w, h, featherWidth = 30) {
          const c = document.createElement('canvas');
          c.width = w;
          c.height = h;
          const cx = c.getContext('2d');
          cx.drawImage(cv, x, y, w, h, 0, 0, w, h);

          cx.globalCompositeOperation = 'destination-out';
          const grad = cx.createLinearGradient(0, 0, featherWidth, 0);
          grad.addColorStop(0, 'rgba(0,0,0,1)');
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          cx.fillStyle = grad;
          cx.fillRect(0, 0, featherWidth, h);

          return c.toDataURL('image/png');
        }

        function cropClean(x, y, w, h) {
          const c = document.createElement('canvas');
          c.width = w;
          c.height = h;
          const cx = c.getContext('2d');
          cx.drawImage(cv, x, y, w, h, 0, 0, w, h);
          return c.toDataURL('image/png');
        }

        resolve({
          // Strictly monument silhouette on the right (x=832 avoiding all text)
          heroMonument: cropFeathered(832, 76, 165, 118, 30),
          // Row 1 photos (y starts below top badges at y=354)
          vignetteTribune: cropFeathered(380, 355, 120, 95, 25),
          vignetteEchos: cropFeathered(845, 352, 150, 98, 25),
          // Row 2 photos (y starts below top badges at y=506)
          vignetteAs: cropFeathered(360, 506, 140, 92, 25),
          vignetteSourceA: cropFeathered(845, 506, 150, 92, 25),
          // Classical judicial columns
          watermarkJustice: cropClean(895, 680, 85, 85),
          // Confidential folders
          watermarkFolders: cropFeathered(785, 802, 200, 85, 30)
        });
      };
      img.src = 'data:image/jpeg;base64,' + b64;
    });
  }, imgBase64);

  for (const [key, dataUrl] of Object.entries(results)) {
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
    const outPath = path.join(outDir, `${key}.png`);
    fs.writeFileSync(outPath, Buffer.from(base64Data, 'base64'));
    console.log(`Saved pure asset ${key}.png (${fs.statSync(outPath).size} bytes)`);
  }

  await browser.close();
  console.log('Pure asset extraction complete!');
}

main().catch(console.error);
