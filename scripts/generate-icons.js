const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [16, 32, 96, 180, 192, 512];

const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="100" fill="#FF69B4"/>
  <g transform="translate(128, 80) scale(4.2)">
    <ellipse cx="30" cy="50" rx="22" ry="28" fill="#FFD700" stroke="black" stroke-width="3"/>
    <circle cx="30" cy="22" r="20" fill="white" stroke="black" stroke-width="3"/>
    <circle cx="23" cy="20" r="5" fill="black"/>
    <circle cx="37" cy="20" r="5" fill="black"/>
    <circle cx="24" cy="18" r="2" fill="white"/>
    <circle cx="38" cy="18" r="2" fill="white"/>
    <ellipse cx="30" cy="32" rx="4" ry="3" fill="black"/>
  </g>
</svg>`;

const iconsDir = path.join(__dirname, '../public/icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

async function generateIcons() {
  for (const size of sizes) {
    const outputPath = path.join(iconsDir, `icon-${size}.png`);

    await sharp(Buffer.from(svgIcon))
      .resize(size, size)
      .png()
      .toFile(outputPath);

    console.log(`Generated: icon-${size}.png`);
  }

  // Also create apple-touch-icon.png (180x180)
  await sharp(Buffer.from(svgIcon))
    .resize(180, 180)
    .png()
    .toFile(path.join(iconsDir, 'apple-touch-icon.png'));

  console.log('Generated: apple-touch-icon.png');
  console.log('Done!');
}

generateIcons().catch(console.error);
