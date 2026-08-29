const fs = require('fs');
let code = fs.readFileSync('g:/My Drive/0.งานสถาบัน/data_PookPik_Tutor/JavaScript.html', 'utf8');

const target1 = `white-space: normal; word-break: break-word; overflow-wrap: anywhere;`;
const replacement1 = `white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`;

if (code.includes(target1)) {
  code = code.replace(target1, replacement1);
  fs.writeFileSync('g:/My Drive/0.งานสถาบัน/data_PookPik_Tutor/JavaScript.html', code);
  console.log('Reverted white-space normal to nowrap!');
} else {
  console.log('Target not found for white-space.');
}
