import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Ensure assets directory exists
const assetsDir = path.join(process.cwd(), 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Function to create a simple PNG image with text
async function createPngImage(width, height, filename, text) {
  try {
    // Create a blue background image
    const buffer = await sharp({
      create: {
        width: width,
        height: height,
        channels: 4,
        background: { r: 66, g: 135, b: 245, alpha: 1 } // Blue color
      }
    })
    .png()
    .toBuffer();
    
    // Save the image
    const outputPath = path.join(assetsDir, filename);
    await sharp(buffer).toFile(outputPath);
    
    console.log(`Created ${filename} with dimensions ${width}x${height}`);
  } catch (error) {
    console.error(`Error creating ${filename}:`, error);
  }
}

// Create all required assets
async function createAllAssets() {
  console.log('Creating temporary assets...');
  
  // Create icon.png (1024x1024)
  await createPngImage(1024, 1024, 'icon.png', '1024x1024');
  
  // Create splash.png (1242x2436)
  await createPngImage(1242, 2436, 'splash.png', '1242x2436');
  
  // Create adaptive-icon.png (108x108)
  await createPngImage(108, 108, 'adaptive-icon.png', '108x108');
  
  // Create favicon.png (48x48)
  await createPngImage(48, 48, 'favicon.png', '48x48');
  
  console.log('All temporary assets created successfully!');
}

// Run the asset creation
createAllAssets().catch(console.error);