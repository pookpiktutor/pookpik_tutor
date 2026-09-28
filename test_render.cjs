const fs = require('fs');
const js = fs.readFileSync('src/JavaScript.js', 'utf8');
const start = js.indexOf('function renderCampsTable()');
const end = js.indexOf('function deleteCampStudent(timestamp)');
const renderCampsTableCode = js.substring(start, end);

const data = JSON.parse(fs.readFileSync('camps_test_data.json', 'utf8'));

const context = require('vm').createContext({ 
  document: { 
    getElementById: (id) => ({ innerHTML: '', value: 'all', appendChild: ()=>{} }), 
    querySelectorAll: () => [] 
  }, 
  currentCampsData: data, 
  window: {}, 
  console: console, 
  parseFloat: parseFloat, 
  Object: Object, 
  Array: Array, 
  String: String, 
  Set: Set 
}); 

try { 
  require('vm').runInContext(renderCampsTableCode + '\nrenderCampsTable();', context); 
  console.log('Success! No errors.'); 
} catch(e) { 
  console.error('Crash in renderCampsTable:', e); 
}
