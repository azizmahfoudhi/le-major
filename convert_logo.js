const sharp = require('sharp');
const path = require('path');

const BRAIN = 'C:\\Users\\alfre\\.gemini\\antigravity\\brain\\cf3d49a9-5ea2-490a-ba1e-e2c22c225d90';

async function removeWhiteBackground(inputPath, outputPath) {
  console.log(`Processing: ${inputPath} → ${outputPath}`);

  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = new Uint8ClampedArray(data);

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    // If pixel is close to white → make transparent
    if (r > 220 && g > 220 && b > 220) {
      pixels[i + 3] = 0;
    }
  }

  await sharp(Buffer.from(pixels), {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toFile(outputPath);

  console.log(`✓ Done: ${outputPath}`);
}

async function main() {
  // Horizontal logo (for navbars)
  await removeWhiteBackground(
    path.join(BRAIN, 'logo_minimalist_geometric_1786644255481.jpg'),
    'public/logo.png'
  );

  // Square icon (for favicon / collapsed sidebar)
  await removeWhiteBackground(
    path.join(BRAIN, 'favicon_minimalist_geometric_1786647314962.jpg'),
    'src/app/icon.png'
  );

  console.log('\nAll logos converted to transparent PNG!');
}

main().catch(console.error);
