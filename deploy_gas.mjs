/**
 * deploy_gas.mjs - Deploy Code.txt to Google Apps Script and update Web App deployment
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
const DEPLOYMENT_ID = 'AKfycbyYjh5-6frv-AytBYl1EnWB46Vh5_VCkVVRg6XsU4A-KUJoR8nFh46XZ-ffvbtwiZHhhA';
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
  const clientId = claspRc.oauth2ClientSettings?.clientId || claspRc.tokens?.default?.client_id || '1072944905499-vm2v2i5dvn0a0d2o4ca36i1vge8cvbn0.apps.googleusercontent.com';
  const clientSecret = claspRc.oauth2ClientSettings?.clientSecret || claspRc.tokens?.default?.client_secret || 'v6V3fKV_zWU7iw1DrpO1rknX';
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

async function apiRequestSingle(method, path, body, token) {
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

async function apiRequest(method, path, body, token, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const res = await apiRequestSingle(method, path, body, token);
    if (res.status === 200) return res;
    console.warn(`  ⚠️  API request ${method} ${path} returned status ${res.status}. Attempt ${i + 1}/${retries}...`);
    await new Promise(r => setTimeout(r, 1500 * (i + 1)));
  }
  return await apiRequestSingle(method, path, body, token);
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

  // 3. Read new index.html if exists
  const indexContent = readFileSync(INDEX_FILE, 'utf8');

  // 4. Update project files
  const updatedFiles = projectFiles.map(f => {
    if (f.name === 'Code' && f.type === 'SERVER_JS') {
      console.log(`  ✏️  Replacing Code.gs (${f.source.length} → ${newCodeContent.length} chars)`);
      return { ...f, source: newCodeContent };
    }
    if (f.type === 'HTML') {
      console.log(`  ✏️  Replacing HTML file ${f.name}`);
      return { ...f, source: indexContent };
    }
    return f;
  });

  // 5. Save updated content to Apps Script
  console.log('\n🚀 Deploying Code.gs to Apps Script...');
  const putRes = await apiRequest('PUT', `/v1/projects/${SCRIPT_ID}/content`, { files: updatedFiles }, token);
  
  if (putRes.status !== 200) {
    console.error('❌ Failed to deploy Code.gs:', putRes.status, JSON.stringify(putRes.body).slice(0, 500));
    process.exit(1);
  }

  console.log('✅ Project content updated successfully!');

  // 6. Create new version & update Web App deployment
  console.log('\n🏷️  Creating new version in Apps Script...');
  const verRes = await apiRequest('POST', `/v1/projects/${SCRIPT_ID}/versions`, {
    description: `Auto-version ${new Date().toISOString()}`
  }, token);

  if (verRes.status === 200 && verRes.body.versionNumber) {
    const newVersion = verRes.body.versionNumber;
    console.log(`✅ Created Version ${newVersion}`);

    console.log(`\n🚀 Updating Web App deployment ${DEPLOYMENT_ID} to Version ${newVersion}...`);
    const depRes = await apiRequest('PUT', `/v1/projects/${SCRIPT_ID}/deployments/${DEPLOYMENT_ID}`, {
      deploymentConfig: {
        scriptId: SCRIPT_ID,
        versionNumber: newVersion,
        manifestFileName: 'appsscript',
        description: `Deployed version ${newVersion}`
      }
    }, token);

    if (depRes.status === 200) {
      console.log(`🎉 Web App deployment successfully updated to Version ${newVersion}!`);
    } else {
      console.error('⚠️  Failed to update Web App deployment:', depRes.status, JSON.stringify(depRes.body).slice(0, 300));
    }
  } else {
    console.error('⚠️  Failed to create version:', verRes.status, JSON.stringify(verRes.body).slice(0, 300));
  }

  console.log('\n✅ Deploy complete!');
  console.log('📌 Apps Script:', `https://script.google.com/macros/d/${SCRIPT_ID}/edit`);
  console.log('📌 Spreadsheet:', `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}`);
}

main().catch(e => {
  console.error('❌ Fatal error:', e.message);
  process.exit(1);
});
