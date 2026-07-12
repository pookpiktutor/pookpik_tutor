/**
 * publish_version.mjs
 * Runs clasp version and clasp deploy.
 */

import { execSync } from 'child_process';

const BASE_DIR = process.cwd();
const DEPLOY_IDS = [
  'AKfycbzsRgxLUZQJBL6TIzaUvVmRr_5VYVkUU0CrukPMJ-Nw5fpo55_4eGOJ6hhrVp4CHDexcQ',
  'AKfycbyYjh5-6frv-AytBYl1EnWB46Vh5_VCkVVRg6XsU4A-KUJoR8nFh46XZ-ffvbtwiZHhhA'
];

try {
  console.log('🔄 Creating new version via clasp...');
  const verOut = execSync('clasp version "Fix: edit modal fallback fetch"', { cwd: BASE_DIR, encoding: 'utf8' });
  console.log(verOut);
  
  const match = verOut.match(/Created version (\d+)/);
  if (match) {
    const ver = match[1];
    DEPLOY_IDS.forEach(id => {
      console.log(`🔄 Updating deployment ${id} to version ${ver}...`);
      const depOut = execSync(`clasp deploy -V ${ver} -d "Fix edit modal + salary calc v${ver}" -i ${id}`, { cwd: BASE_DIR, encoding: 'utf8' });
      console.log(depOut);
    });
    console.log(`✅ All deployments updated successfully to Version ${ver}!`);
  } else {
    console.error('❌ Could not parse version number from output:', verOut);
  }
} catch (error) {
  console.error('❌ Failed to publish version:', error.message);
  if (error.stdout) console.error(error.stdout);
  if (error.stderr) console.error(error.stderr);
  process.exit(1);
}
