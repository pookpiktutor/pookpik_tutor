const fs = require('fs');
let code = fs.readFileSync('g:/My Drive/0.งานสถาบัน/data_PookPik_Tutor/JavaScript.html', 'utf8');

const targetLogic = `    let rbBranch = '';
    if (cleanRB.includes('สาขา1') || cleanRB.includes('สาขา 1')) rbBranch = 'สาขา1';
    else if (cleanRB.includes('สาขา2') || cleanRB.includes('สาขา 2')) rbBranch = 'สาขา2';
    else if (cleanRB.includes('สาขา3') || cleanRB.includes('สาขา 3')) rbBranch = 'สาขา3';
    else rbBranch = 'สาขา1';`;

const replacementLogic = `    let rbBranch = '';
    if (cleanRB.includes('สาขา1') || cleanRB.includes('สาขา 1') || cleanRB.includes('ออนไลน์1') || cleanRB.includes('ออน1') || cleanRB.includes(' 1')) rbBranch = 'สาขา1';
    else if (cleanRB.includes('สาขา2') || cleanRB.includes('สาขา 2') || cleanRB.includes('ออนไลน์2') || cleanRB.includes('ออน2') || cleanRB.includes(' 2')) rbBranch = 'สาขา2';
    else if (cleanRB.includes('สาขา3') || cleanRB.includes('สาขา 3') || cleanRB.includes('ออนไลน์3') || cleanRB.includes('ออน3') || cleanRB.includes(' 3')) rbBranch = 'สาขา3';
    else rbBranch = 'สาขา1';`;

if (code.includes(targetLogic)) {
  code = code.replace(targetLogic, replacementLogic);
  fs.writeFileSync('g:/My Drive/0.งานสถาบัน/data_PookPik_Tutor/JavaScript.html', code);
  console.log('Fixed online room branch matching logic!');
} else {
  console.log('Target not found for logic.');
}
