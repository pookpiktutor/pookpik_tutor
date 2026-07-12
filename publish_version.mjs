/**
 * publish_version.mjs
 * Runs clasp version and clasp deploy.
 */

import { execSync } from 'child_process';

const BASE_DIR = process.cwd();
const DEPLOY_ID = 'AKfycbzsRgxLUZQJBL6TIzaUvVmRr_5VYVkUU0CrukPMJ-Nw5fpo55_4eGOJ6hhrVp4CHDexcQ';

try {
  console.log('🔄 Creating new version via clasp...');
  const verOut = execSync('clasp version "Fix: edit modal fallback fetch"', { cwd: BASE_DIR, encoding: 'utf8' });
  console.log(verOut);
  
  const match = verOut.match(/Created version (\d+)/);
  if (match) {
    const ver = match[1];
    console.log(`🔄 Updating deployment ${DEPLOY_ID} to version ${ver}...`);
    const depOut = execSync(`clasp deploy -V ${ver} -d "Fix edit modal + salary calc v${ver}" -i ${DEPLOY_ID}`, { cwd: BASE_DIR, encoding: 'utf8' });
    console.log(depOut);
    console.log(`✅ Deployment updated successfully to Version ${ver}!`);
  } else {
    console.error('❌ Could not parse version number from output:', verOut);
  }
} catch (error) {
  console.error('❌ Failed to publish version:', error.message);
  if (error.stdout) console.error(error.stdout);
  if (error.stderr) console.error(error.stderr);
  process.exit(1);
}
