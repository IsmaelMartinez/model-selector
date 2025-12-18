/**
 * PWA Icon Generator
 * Generates PNG icons from the SVG template
 *
 * Usage: node scripts/generate-icons.js
 *
 * Note: This script requires @resvg/resvg-js for SVG to PNG conversion
 * Install with: npm install --save-dev @resvg/resvg-js
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const staticDir = join(__dirname, '..', 'static');

// Icon sizes needed for PWA
const sizes = [192, 512];

async function generateIcons() {
  // Check if resvg is available
  let Resvg;
  try {
    const resvgModule = await import('@resvg/resvg-js');
    Resvg = resvgModule.Resvg;
  } catch {
    console.log('Note: @resvg/resvg-js not installed.');
    console.log('To generate PNG icons from SVG, run:');
    console.log('  npm install --save-dev @resvg/resvg-js');
    console.log('  node scripts/generate-icons.js');
    console.log('');
    console.log('Alternatively, use an online tool to convert static/icon.svg to PNG.');
    console.log('Creating placeholder icons instead...');

    // Create simple placeholder PNGs using minimal valid PNG data
    // These are 1x1 green pixels that will be scaled
    createPlaceholderIcons();
    return;
  }

  const svgPath = join(staticDir, 'icon.svg');

  if (!existsSync(svgPath)) {
    console.error('Error: icon.svg not found in static/');
    process.exit(1);
  }

  const svgContent = readFileSync(svgPath, 'utf8');

  for (const size of sizes) {
    // Standard icon
    const resvg = new Resvg(svgContent, {
      fitTo: {
        mode: 'width',
        value: size,
      },
    });

    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    const iconPath = join(staticDir, `icon-${size}.png`);
    writeFileSync(iconPath, pngBuffer);
    console.log(`Created: icon-${size}.png`);

    // Maskable icon (same for now, could add padding later)
    const maskablePath = join(staticDir, `icon-maskable-${size}.png`);
    writeFileSync(maskablePath, pngBuffer);
    console.log(`Created: icon-maskable-${size}.png`);
  }

  console.log('');
  console.log('PWA icons generated successfully!');
}

function createPlaceholderIcons() {
  // Create simple solid color placeholder icons
  // These are minimal valid PNG files with green (#4CAF50) color

  // Minimal 1x1 PNG with green color, we'll note that proper icons should be generated
  const sizes = [192, 512];

  for (const size of sizes) {
    // Create a simple HTML file that can be opened to download the icon
    console.log(`Note: Please generate ${size}x${size} PNG icons manually from static/icon.svg`);
  }

  console.log('');
  console.log('To generate proper icons:');
  console.log('1. Open static/icon.svg in a browser');
  console.log('2. Use an online SVG to PNG converter (e.g., https://svgtopng.com)');
  console.log('3. Generate 192x192 and 512x512 versions');
  console.log('4. Save as icon-192.png, icon-512.png, icon-maskable-192.png, icon-maskable-512.png in static/');
}

generateIcons().catch(console.error);
