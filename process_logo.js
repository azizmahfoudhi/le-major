const Jimp = require('jimp');

async function processLogo(inputPath, outputDark, outputLight) {
  try {
    const image = await Jimp.read(inputPath);
    
    // Create dark version (black on transparent)
    const darkImg = image.clone();
    darkImg.scan(0, 0, darkImg.bitmap.width, darkImg.bitmap.height, function(x, y, idx) {
      const red = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];
      
      // If pixel is white-ish, make it transparent
      if (red > 200 && green > 200 && blue > 200) {
        this.bitmap.data[idx + 3] = 0; // Alpha
      } else {
        // Force non-white to be Navy 900 (#0F1D35) for better integration
        this.bitmap.data[idx + 0] = 15;
        this.bitmap.data[idx + 1] = 29;
        this.bitmap.data[idx + 2] = 53;
        this.bitmap.data[idx + 3] = 255;
      }
    });
    await darkImg.writeAsync(outputDark);
    
    // Create light version (white on transparent)
    if (outputLight) {
      const lightImg = image.clone();
      lightImg.scan(0, 0, lightImg.bitmap.width, lightImg.bitmap.height, function(x, y, idx) {
        const red = this.bitmap.data[idx + 0];
        const green = this.bitmap.data[idx + 1];
        const blue = this.bitmap.data[idx + 2];
        
        if (red > 200 && green > 200 && blue > 200) {
          this.bitmap.data[idx + 3] = 0; // Alpha
        } else {
          // Force non-white to be white
          this.bitmap.data[idx + 0] = 255;
          this.bitmap.data[idx + 1] = 255;
          this.bitmap.data[idx + 2] = 255;
          this.bitmap.data[idx + 3] = 255;
        }
      });
      await lightImg.writeAsync(outputLight);
    }
    
    console.log(`Processed ${inputPath}`);
  } catch (err) {
    console.error(err);
  }
}

async function main() {
  await processLogo('C:\\Users\\alfre\\.gemini\\antigravity\\brain\\cf3d49a9-5ea2-490a-ba1e-e2c22c225d90\\logo_minimalist_geometric_1786644255481.jpg', 'public/logo-dark.png', 'public/logo-light.png');
  await processLogo('C:\\Users\\alfre\\.gemini\\antigravity\\brain\\cf3d49a9-5ea2-490a-ba1e-e2c22c225d90\\favicon_minimalist_geometric_1786647314962.jpg', 'src/app/icon.png', null);
}

main();
