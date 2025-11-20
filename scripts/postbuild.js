#!/usr/bin/env node

/**
 * Post-build script to fix Next.js build issues
 *
 * This script:
 * 1. Creates prerender-manifest.json from prerender-manifest.js
 * 2. Ensures the build is ready for production deployment
 */

const fs = require('fs');
const path = require('path');

const NEXT_DIR = path.join(__dirname, '..', '.next');
const MANIFEST_JS = path.join(NEXT_DIR, 'prerender-manifest.js');
const MANIFEST_JSON = path.join(NEXT_DIR, 'prerender-manifest.json');

console.log('🔧 Running post-build script...');

try {
  // Check if .next directory exists
  if (!fs.existsSync(NEXT_DIR)) {
    console.error('❌ .next directory not found. Build may have failed.');
    process.exit(1);
  }

  // Check if prerender-manifest.js exists
  if (!fs.existsSync(MANIFEST_JS)) {
    console.warn('⚠️  prerender-manifest.js not found. Creating minimal manifest...');
    const minimalManifest = {
      preview: {
        previewModeId: require('crypto').randomBytes(16).toString('hex'),
        previewModeSigningKey: require('crypto').randomBytes(32).toString('hex'),
        previewModeEncryptionKey: require('crypto').randomBytes(32).toString('hex'),
      }
    };
    fs.writeFileSync(MANIFEST_JSON, JSON.stringify(minimalManifest, null, 2), 'utf8');
    console.log('✅ Created minimal prerender-manifest.json');
    process.exit(0);
  }

  // Read prerender-manifest.js
  const content = fs.readFileSync(MANIFEST_JS, 'utf8');

  // Extract JSON from self.__PRERENDER_MANIFEST="..."
  const match = content.match(/self\.__PRERENDER_MANIFEST=(.+)/);

  if (!match || !match[1]) {
    console.error('❌ Could not extract manifest from prerender-manifest.js');
    process.exit(1);
  }

  const jsonString = match[1];

  // Write to prerender-manifest.json
  fs.writeFileSync(MANIFEST_JSON, jsonString, 'utf8');

  console.log('✅ Successfully created prerender-manifest.json');
  console.log(`📍 Location: ${MANIFEST_JSON}`);

  // Verify the JSON is valid
  try {
    JSON.parse(jsonString);
    console.log('✅ Manifest JSON is valid');
  } catch (e) {
    console.error('❌ Manifest JSON is invalid:', e.message);
    process.exit(1);
  }

  console.log('🎉 Post-build script completed successfully!');
  process.exit(0);

} catch (error) {
  console.error('❌ Post-build script failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}
