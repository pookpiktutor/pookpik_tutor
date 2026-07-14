const fs = require('fs');
let code = fs.readFileSync('g:/My Drive/0.งานสถาบัน/data_PookPik_Tutor/JavaScript.html', 'utf8');
const target = `  if (cleanRN.includes('ออนไลน์') || cleanRN.includes('online')) {
    return cleanRB.includes('ออนไลน์') || cleanRB.includes('online');
  }`;
const replacement = `  if (cleanRN.includes('ออนไลน์') || cleanRN.includes('online')) {
    if (!(cleanRB.includes('ออนไลน์') || cleanRB.includes('online'))) return false;
    
    let rbBranch = '';
    if (cleanRB.includes('สาขา1') || cleanRB.includes('สาขา 1')) rbBranch = 'สาขา1';
    else if (cleanRB.includes('สาขา2') || cleanRB.includes('สาขา 2')) rbBranch = 'สาขา2';
    else if (cleanRB.includes('สาขา3') || cleanRB.includes('สาขา 3')) rbBranch = 'สาขา3';
    else rbBranch = 'สาขา1';
    
    let bBranch = '';
    const normB = cleanB.replace(/\\s+/g, '');
    if (normB.includes('สาขา1')) bBranch = 'สาขา1';
    else if (normB.includes('สาขา2')) bBranch = 'สาขา2';
    else if (normB.includes('สาขา3')) bBranch = 'สาขา3';
    else bBranch = 'สาขา1';
    
    return rbBranch === bBranch;
  }`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('g:/My Drive/0.งานสถาบัน/data_PookPik_Tutor/JavaScript.html', code);
  console.log('Replaced matchRoomAndBranch!');
} else {
  console.log('Target not found.');
}
