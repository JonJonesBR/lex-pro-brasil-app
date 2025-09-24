# Temporary Assets for Lex Pro Brasil App

This directory contains temporary placeholder assets for your Expo application. These are meant to be used during development until you have final versions of your assets.

## Current Temporary Assets

1. **icon.png** (1024x1024 pixels)
   - Used for the app icon on all platforms
   - Location: `./assets/icon.png`

2. **splash.png** (1242x2436 pixels)
   - Used for the splash screen
   - Location: `./assets/splash.png`

3. **adaptive-icon.png** (108x108 pixels)
   - Used for Android adaptive icons
   - Location: `./assets/adaptive-icon.png`

4. **favicon.png** (48x48 pixels)
   - Used for web favicon
   - Location: `./assets/favicon.png`

## Generating Temporary Assets

If you need to regenerate these temporary assets, you can run:

```bash
node generate-temp-assets.js
```

## Replacing with Final Assets

When you have your final assets ready, simply replace the files in the `assets` directory with the same filenames:

1. Ensure your final icons meet the size requirements
2. Maintain the same filenames to avoid configuration changes
3. Test the app after replacing to ensure proper display

## Asset Requirements

- **icon.png**: Should be 1024x1024 pixels, in PNG format
- **splash.png**: Should be at least 1242x2436 pixels, in PNG format
- **adaptive-icon.png**: Should be 108x108 pixels, in PNG format (foreground only, background color is defined in app.json)
- **favicon.png**: Should be 48x48 pixels, in PNG format

## Note

These temporary assets are simple colored squares with the dimensions displayed as text. They are functional but should be replaced with your actual branding assets for production.