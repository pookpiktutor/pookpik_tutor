import fs from 'fs';

const jsCode = fs.readFileSync('src/JavaScript.js', 'utf8');
const newLogic = fs.readFileSync('temp_camps_logic.js', 'utf8');

const start = jsCode.indexOf('function loadCampsData()');
const end = jsCode.indexOf('function setLoading(', start);

const updatedJs = jsCode.substring(0, start) + newLogic + '\n' + jsCode.substring(end);
fs.writeFileSync('src/JavaScript.js', updatedJs);

console.log('Successfully updated src/JavaScript.js');
