/**
 * build_and_deploy_clasp.mjs
 * Prepares the files into the "dist" directory and uses clasp CLI to push.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const BASE_DIR = process.cwd();
const DIST_DIR = join(BASE_DIR, 'dist');

// Clear dist directory if it exists, then recreate
if (existsSync(DIST_DIR)) {
  rmSync(DIST_DIR, { recursive: true, force: true });
}
mkdirSync(DIST_DIR, { recursive: true });

console.log('🔄 Preparing files for clasp deployment...');

// 1. Write appsscript.json
const appsscriptJson = {
  "timeZone": "Asia/Bangkok",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "ANYONE_ANONYMOUS"
  }
};
writeFileSync(join(DIST_DIR, 'appsscript.json'), JSON.stringify(appsscriptJson, null, 2), 'utf8');
console.log('  Index: Created appsscript.json');

// 2. Copy Code.txt to dist/Code.js (clasp treats .js in rootDir as .gs)
const codeContent = readFileSync(join(BASE_DIR, 'Code.txt'), 'utf8');
writeFileSync(join(DIST_DIR, 'Code.js'), codeContent, 'utf8');
console.log('  Code: Copied Code.txt -> dist/Code.js');

// 3. Wrap JavaScript.js as dist/JavaScript.html
const jsContent = readFileSync(join(BASE_DIR, 'src', 'JavaScript.js'), 'utf8');
const wrappedJs = `<script>\n${jsContent}\n</script>`;
writeFileSync(join(DIST_DIR, 'JavaScript.html'), wrappedJs, 'utf8');
console.log('  JavaScript: Wrapped src/JavaScript.js -> dist/JavaScript.html');

// 4. Wrap Styles.css as dist/Styles.html
const cssContent = readFileSync(join(BASE_DIR, 'src', 'Styles.css'), 'utf8');
const wrappedCss = `<style>\n${cssContent}\n</style>`;
writeFileSync(join(DIST_DIR, 'Styles.html'), wrappedCss, 'utf8');
console.log('  Styles: Wrapped src/Styles.css -> dist/Styles.html');

// 5. Copy and transform index.html -> dist/Index.html
let indexContent = readFileSync(join(BASE_DIR, 'index.html'), 'utf8');
indexContent = indexContent.replace('<link rel="stylesheet" href="./src/Styles.css">', '<?!= include(\'Styles\'); ?>');
indexContent = indexContent.replace('<script type="module" src="./src/app_entry.js"></script>', '<?!= include(\'JavaScript\'); ?>');
writeFileSync(join(DIST_DIR, 'Index.html'), indexContent, 'utf8');
console.log('  Index: Transformed and copied index.html -> dist/Index.html');

// 6. Run clasp push
try {
  console.log('\n🚀 Running clasp push...');
  const pushOutput = execSync('clasp push', { cwd: BASE_DIR, encoding: 'utf8' });
  console.log(pushOutput);
  console.log('✅ Deployed successfully to Google Apps Script via Clasp!');
} catch (error) {
  console.error('❌ clasp push failed:', error.message);
  if (error.stdout) console.error(error.stdout);
  if (error.stderr) console.error(error.stderr);
  process.exit(1);
}

