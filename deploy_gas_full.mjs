/**
 * deploy_gas_full.mjs - Deploy ALL files to Google Apps Script
 * Deploys: Code.txt → Code.gs, JavaScript.js → JavaScript.html, Styles.css → Styles.html
 */

import { readFileSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const https = require('https');

const SCRIPT_ID = '1btIyBNvEsl4h7fyRhGkR94NXt2eDJEsL2tuw3CHuuzDDMFQNYiAC6MQZ';
const BASE_DIR = process.cwd();

const claspRcPath = join(homedir(), '.clasprc.json');
const claspRc = JSON.parse(readFileSync(claspRcPath, 'utf8'));
const tokenData = claspRc.tokens?.default || claspRc;

async function apiRequest(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'script.googleapis.com',
      path: path,
      method: method,
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {})
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch (e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

async function main() {
  const token = tokenData.access_token;
  console.log('🔑 Using existing access token');

  // 1. Get current project files
  console.log('\n📥 Fetching current Apps Script project files...');
  const getRes = await apiRequest('GET', `/v1/projects/${SCRIPT_ID}/content`, null, token);
  
  if (getRes.status !== 200) {
    console.error('❌ Failed to get project:', getRes.status, JSON.stringify(getRes.body).slice(0, 400));
    process.exit(1);
  }

  const projectFiles = getRes.body.files || [];
  console.log(`  Found ${projectFiles.length} files:`);
  projectFiles.forEach(f => console.log(`    - ${f.name} (${f.type})`));

  // 2. Read all local files
  const codeContent = readFileSync(join(BASE_DIR, 'Code.txt'), 'utf8');
  const jsContent = readFileSync(join(BASE_DIR, 'src', 'JavaScript.js'), 'utf8');
  const cssContent = readFileSync(join(BASE_DIR, 'src', 'Styles.css'), 'utf8');
  const indexContent = readFileSync(join(BASE_DIR, 'index.html'), 'utf8');
  
  console.log(`\n📖 Local files:`);
  console.log(`  Code.txt: ${codeContent.length} chars, ${codeContent.split('\n').length} lines`);
  console.log(`  JavaScript.js: ${jsContent.length} chars`);
  console.log(`  Styles.css: ${cssContent.length} chars`);
  console.log(`  index.html: ${indexContent.length} chars`);

  // 3. Update each file
  const updatedFiles = projectFiles.map(f => {
    if (f.name === 'Code' && f.type === 'SERVER_JS') {
      console.log(`\n  ✏️  Updating Code.gs (${f.source.length} → ${codeContent.length} chars)`);
      return { ...f, source: codeContent };
    }
    if (f.name === 'JavaScript' && f.type === 'HTML') {
      // Wrap JS in <script> tags for GAS HTML file
      const wrappedJs = `<script>\n${jsContent}\n</script>`;
      console.log(`\n  ✏️  Updating JavaScript.html (${f.source.length} → ${wrappedJs.length} chars)`);
      return { ...f, source: wrappedJs };
    }
    if (f.name === 'Styles' && f.type === 'HTML') {
      const wrappedCss = `<style>\n${cssContent}\n</style>`;
      console.log(`\n  ✏️  Updating Styles.html (${f.source.length} → ${wrappedCss.length} chars)`);
      return { ...f, source: wrappedCss };
    }
    if (f.name === 'Index' && f.type === 'HTML') {
      console.log(`\n  ✏️  Updating Index.html (${f.source.length} → ${indexContent.length} chars)`);
      return { ...f, source: indexContent };
    }
    return f;
  });

  // 4. Deploy
  console.log('\n🚀 Deploying to Apps Script...');
  const putRes = await apiRequest('PUT', `/v1/projects/${SCRIPT_ID}/content`, { files: updatedFiles }, token);
  
  if (putRes.status === 200) {
    console.log('✅ ALL files deployed successfully!');
    console.log('\n📌 Apps Script Editor:', `https://script.google.com/macros/d/${SCRIPT_ID}/edit`);
    console.log('⚠️  Remember to: Deploy → Manage Deployments → Edit → New Version → Deploy');
  } else {
    console.error('❌ Deploy failed:', putRes.status);
    const errMsg = JSON.stringify(putRes.body).slice(0, 500);
    console.error(errMsg);
  }
}

main().catch(e => {
  console.error('❌ Fatal:', e.message);
  process.exit(1);
});
