// Create temporary assets for Expo app
// Based on Expo requirements:
// - icon.png: 1024x1024 pixels
// - splash.png: 1242x2436 pixels (iPhone X dimensions, will be scaled as needed)
// - adaptive-icon.png: 108x108 pixels
// - favicon.png: 48x48 pixels

import { writeFileSync } from 'fs';
import { join } from 'path';

// Create a simple colored square as a placeholder
function createPlaceholderImage(width, height, color, outputPath) {
  // Create a simple SVG placeholder
  const svgContent = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${color}" />
  <text x="50%" y="50%" font-family="Arial" font-size="${Math.min(width, height) / 8}" 
        fill="white" text-anchor="middle" dominant-baseline="middle">
    ${width}x${height}
  </text>
</svg>
  `.trim();
  
  writeFileSync(outputPath, svgContent);
  console.log(`Created temporary asset: ${outputPath}`);
}

// Create assets directory if it doesn't exist
const assetsDir = join(process.cwd(), 'assets');

// Create temporary assets
createPlaceholderImage(1024, 1024, "#4287f5", join(assetsDir, "icon.png"));
createPlaceholderImage(1242, 2436, "#4287f5", join(assetsDir, "splash.png"));
createPlaceholderImage(108, 108, "#4287f5", join(assetsDir, "adaptive-icon.png"));
createPlaceholderImage(48, 48, "#4287f5", join(assetsDir, "favicon.png"));

console.log("Temporary assets created successfully!");
console.log("These are placeholder images. Replace them with your actual assets when ready.");