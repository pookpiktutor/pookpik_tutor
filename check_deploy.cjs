const https = require('https');
const fs = require('fs');
const os = require('os');
const path = require('path');

const rc = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.clasprc.json'), 'utf8'));
const token = rc.tokens.default.access_token;
const SCRIPT_ID = '1btIyBNvEsl4h7fyRhGkR94NXt2eDJEsL2tuw3CHuuzDDMFQNYiAC6MQZ';

const req = https.request({
  hostname: 'script.googleapis.com',
  path: '/v1/projects/' + SCRIPT_ID + '/content',
  method: 'GET',
  headers: { 'Authorization': 'Bearer ' + token }
}, res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const json = JSON.parse(data);
    const files = json.files || [];
    
    files.forEach(f => {
      console.log('=== ' + f.name + ' (' + f.type + ') ' + f.source.length + ' chars ===');
      if (f.name === 'JavaScript') {
        const hasEdit = f.source.includes('showEditClassLogModal');
        const vMatch = f.source.match(/\/\/ Version ([\d.]+)/);
        console.log('  version: ' + (vMatch ? vMatch[1] : 'unknown'));
        console.log('  has showEditClassLogModal: ' + hasEdit);
        // Check B/C column logic
        const hasBCLogic = f.source.includes('teacherRegular') && f.source.includes('teacherSub');
        console.log('  has B/C column logic: ' + hasBCLogic);
      }
      if (f.name === 'Index') {
        const hasInclude = f.source.includes('include(');
        console.log('  has include(): ' + hasInclude);
        const incMatches = f.source.match(/include\(['"](.*?)['"]/g);
        console.log('  includes: ' + JSON.stringify(incMatches));
      }
    });
  });
});
req.on('error', e => console.error(e));
req.end();
