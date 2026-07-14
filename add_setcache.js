const fs = require('fs');
let code = fs.readFileSync('g:/My Drive/0.งานสถาบัน/data_PookPik_Tutor/Code.js', 'utf8');

const missingFuncs = `
function setCacheObject(key, obj, expirationInSeconds) {
  try {
    const cache = CacheService.getScriptCache();
    cache.put(key, JSON.stringify(obj), expirationInSeconds || 21600);
  } catch (e) {
  }
}
`;

if (!code.includes('function setCacheObject(key')) {
  code += '\n' + missingFuncs;
  fs.writeFileSync('g:/My Drive/0.งานสถาบัน/data_PookPik_Tutor/Code.js', code);
  console.log('Appended setCacheObject');
} else {
  console.log('Function already exists');
}
