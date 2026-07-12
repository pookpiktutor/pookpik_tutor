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
    const code = (json.files || []).find(f => f.name === 'Code');
    if (code) {
      // Check for duplicate function declarations
      const yearlyCount = (code.source.match(/function calculateTeacherYearlyPay/g) || []).length;
      const monthlyCount = (code.source.match(/function calculateTeacherMonthlyPay/g) || []).length;
      const tryCount = (code.source.match(/\btry\s*\{/g) || []).length;
      const catchCount = (code.source.match(/\bcatch\s*\(/g) || []).length;
      
      console.log('Code.gs stats:');
      console.log('  calculateTeacherYearlyPay count: ' + yearlyCount);
      console.log('  calculateTeacherMonthlyPay count: ' + monthlyCount);
      console.log('  try count: ' + tryCount);
      console.log('  catch count: ' + catchCount);
      console.log('  chars: ' + code.source.length);
      
      // Check if cleanDataLearnColAGarbage is wired up
      const hasCleanFunc = code.source.includes('cleanDataLearnColAGarbage');
      console.log('  has cleanDataLearnColAGarbage: ' + hasCleanFunc);
    }
  });
});
req.on('error', e => console.error(e));
req.end();
