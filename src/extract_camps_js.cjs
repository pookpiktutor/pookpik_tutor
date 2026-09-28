const fs = require('fs');
const js = fs.readFileSync('JavaScript.js', 'utf8');
const startIndex = js.indexOf('function loadCampsData');
const endIndex = js.indexOf('function ', startIndex + 20);
fs.writeFileSync('loadCampsData.js', js.substring(startIndex, endIndex > -1 ? endIndex : startIndex + 5000));
console.log('Extracted loadCampsData.js');
