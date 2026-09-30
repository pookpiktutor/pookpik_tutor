import { readFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const https = require('https');

const SCRIPT_ID = '1btIyBNvEsl4h7fyRhGkR94NXt2eDJEsL2tuw3CHuuzDDMFQNYiAC6MQZ';
const DEPLOYMENT_ID = 'AKfycby6AJihwQhNODIuy9aMm4I-W9ow1kygpF10GA945oB2J9BhGai_fehpUV2dKJdoNKhyZg';

const claspRcPath = join(homedir(), '.clasprc.json');
const claspRc = JSON.parse(readFileSync(claspRcPath, 'utf8'));
const tokenData = claspRc.tokens?.default || claspRc;

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
        try {
          resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null });
        } catch (e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

async function main() {
  console.log('1. Refreshing token...');
  const token = await refreshAccessToken();
  console.log('Token refreshed.');

  console.log('2. Uploading content...');
  const reqBody = {
    files: [
      {
        name: 'appsscript',
        type: 'JSON',
        source: readFileSync('appsscript.json', 'utf8')
      },
      {
        name: 'Code',
        type: 'SERVER_JS',
        source: readFileSync('src/Code.js', 'utf8')
      },
      {
        name: 'Index',
        type: 'HTML',
        source: readFileSync('src/Index.html', 'utf8')
      },
      {
        name: 'JavaScript',
        type: 'HTML',
        source: readFileSync('src/JavaScript.html', 'utf8')
      }
    ]
  };
  
  const uploadRes = await apiRequest('PUT', `/v1/projects/${SCRIPT_ID}/content`, reqBody, token);
  if (uploadRes.status !== 200) {
    throw new Error('Upload failed: ' + JSON.stringify(uploadRes.body));
  }
  console.log('Content uploaded successfully.');

  console.log('3. Creating new version...');
  const versionRes = await apiRequest('POST', `/v1/projects/${SCRIPT_ID}/versions`, { description: "Auto Deploy via REST API" }, token);
  if (versionRes.status !== 200) {
    throw new Error('Create version failed: ' + JSON.stringify(versionRes.body));
  }
  const versionNumber = versionRes.body.versionNumber;
  console.log('Created Version Number:', versionNumber);

  console.log(`4. Updating deployment ${DEPLOYMENT_ID} to version ${versionNumber}...`);
  const deployRes = await apiRequest('PUT', `/v1/projects/${SCRIPT_ID}/deployments/${DEPLOYMENT_ID}`, {
    deploymentConfig: {
      versionNumber: versionNumber,
      manifestFileName: 'appsscript',
      description: "Auto Deploy via REST API"
    }
  }, token);
  
  if (deployRes.status !== 200) {
    throw new Error('Update deployment failed: ' + JSON.stringify(deployRes.body));
  }
  
  console.log('Deployment updated successfully! API is now live.');
}

main().catch(console.error);
