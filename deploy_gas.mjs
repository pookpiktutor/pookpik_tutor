/**
 * deploy_gas.mjs - Deploy Code.txt to Google Apps Script and index.html to Google Sheets
 * Usage: node deploy_gas.mjs
 */

import { readFileSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const https = require('https');

// ============ CONFIG ============
const SCRIPT_ID = '1btIyBNvEsl4h7fyRhGkR94NXt2eDJEsL2tuw3CHuuzDDMFQNYiAC6MQZ';
const SPREADSHEET_ID = '1QLEJgYWHfDQVwRZg7nTPc0ViTu7mpkBF26Fk6NocQaI';
const BASE_DIR = process.cwd();
const CODE_FILE = join(BASE_DIR, 'Code.txt');
const INDEX_FILE = join(BASE_DIR, 'index.html');
const JS_FILE = join(BASE_DIR, 'src', 'JavaScript.js');
// ================================

// Read clasp credentials
const claspRcPath = join(homedir(), '.clasprc.json');
if (!existsSync(claspRcPath)) {
  console.error('❌ No .clasprc.json found. Run: clasp login');
  process.exit(1);
}

const claspRc = JSON.parse(readFileSync(claspRcPath, 'utf8'));
const tokenData = claspRc.tokens?.default || claspRc;

// Refresh token using OAuth2
async function refreshAccessToken() {
  const clientId = claspRc.oauth2ClientSettings?.clientId || '1072944905499-vm2v2i5dvn0a0d2o4ca36i1vge8cvdn.apps.googleusercontent.com';
  const clientSecret = claspRc.oauth2ClientSettings?.clientSecret || '-petD6MvLBQs-7KUlNCC_Yl7';
  const refreshToken = tokenData.refresh_token;

  return new Promise((resolve, reject) => {
    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    }).toString();

    const req = https.request({
      hostname: 'oauth2.googleapis.com',
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body)
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) reject(new Error(json.error + ': ' + json.error_description));
          else resolve(json.access_token);
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

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

async function sheetsApiRequest(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'sheets.googleapis.com',
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
  console.log('🔑 Refreshing access token...');
  let token;
  try {
    token = await refreshAccessToken();
    console.log('✅ Got fresh access token');
  } catch (e) {
    console.log('⚠️  Token refresh failed, using existing token:', e.message);
    token = tokenData.access_token;
  }

  // 1. Get current project files
  console.log('\n📥 Fetching current Apps Script project files...');
  const getRes = await apiRequest('GET', `/v1/projects/${SCRIPT_ID}/content`, null, token);
  
  if (getRes.status !== 200) {
    console.error('❌ Failed to get project:', getRes.status, JSON.stringify(getRes.body).slice(0, 200));
    process.exit(1);
  }

  const projectFiles = getRes.body.files || [];
  console.log(`  Found ${projectFiles.length} files: ${projectFiles.map(f => f.name + '(' + f.type + ')').join(', ')}`);

  // 2. Read new Code.txt content
  console.log('\n📖 Reading Code.txt...');
  const newCodeContent = readFileSync(CODE_FILE, 'utf8');
  console.log(`  Code.txt: ${newCodeContent.length} chars, ${newCodeContent.split('\n').length} lines`);

  // 3. Read new JavaScript.js and index.html
  console.log('📖 Reading JavaScript.js...');
  const jsContent = readFileSync(JS_FILE, 'utf8');
  console.log(`  JavaScript.js: ${jsContent.length} chars`);

  // 4. Update the project: replace Code file, keep HTML files
  const updatedFiles = projectFiles.map(f => {
    if (f.name === 'Code' && f.type === 'SERVER_JS') {
      console.log(`  ✏️  Replacing Code.gs (${f.source.length} → ${newCodeContent.length} chars)`);
      return { ...f, source: newCodeContent };
    }
    return f;
  });

  // Check if Code file was found
  const hasCode = updatedFiles.some(f => f.name === 'Code' && f.type === 'SERVER_JS');
  if (!hasCode) {
    console.log('  ➕ Code.gs not found, adding new file');
    updatedFiles.push({ name: 'Code', type: 'SERVER_JS', source: newCodeContent });
  }

  // 5. Deploy to Apps Script
  console.log('\n🚀 Deploying Code.gs to Apps Script...');
  const putRes = await apiRequest('PUT', `/v1/projects/${SCRIPT_ID}/content`, { files: updatedFiles }, token);
  
  if (putRes.status === 200) {
    console.log('✅ Code.gs deployed successfully!');
  } else {
    console.error('❌ Failed to deploy Code.gs:', putRes.status, JSON.stringify(putRes.body).slice(0, 500));
  }

  // 6. Update HTML in Google Sheets (the index.html stored as a string in a cell or sheet)
  // First check if there's an HTML file in the Apps Script project
  const htmlFile = projectFiles.find(f => f.type === 'HTML');
  if (htmlFile) {
    console.log(`\n📄 Found HTML file in project: ${htmlFile.name}`);
    
    // Read the current index.html 
    const indexContent = readFileSync(INDEX_FILE, 'utf8');
    console.log(`  index.html: ${indexContent.length} chars`);

    // Update HTML in project
    const updatedWithHtml = updatedFiles.map(f => {
      if (f.name === htmlFile.name && f.type === 'HTML') {
        console.log(`  ✏️  Replacing ${htmlFile.name}.html`);
        return { ...f, source: indexContent };
      }
      return f;
    });

    const putHtmlRes = await apiRequest('PUT', `/v1/projects/${SCRIPT_ID}/content`, { files: updatedWithHtml }, token);
    if (putHtmlRes.status === 200) {
      console.log('✅ HTML deployed successfully!');
    } else {
      console.error('❌ Failed to deploy HTML:', putHtmlRes.status, JSON.stringify(putHtmlRes.body).slice(0, 300));
    }
  } else {
    console.log('\n⚠️  No HTML file found in Apps Script project (HTML may be served from GitHub Pages)');
  }

  console.log('\n✅ Deploy complete!');
  console.log('📌 Apps Script:', `https://script.google.com/macros/d/${SCRIPT_ID}/edit`);
  console.log('📌 Spreadsheet:', `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}`);
}

main().catch(e => {
  console.error('❌ Fatal error:', e.message);
  process.exit(1);
});
