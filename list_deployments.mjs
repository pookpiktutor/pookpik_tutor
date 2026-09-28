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
  const token = await refreshAccessToken();
  const res = await apiRequest('GET', `/v1/projects/${SCRIPT_ID}/deployments`, null, token);
  console.log(JSON.stringify(res.body, null, 2));
}

main().catch(console.error);
