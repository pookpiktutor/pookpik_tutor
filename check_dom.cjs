const fs = require('fs');
const index = fs.readFileSync('index.html', 'utf8');
const file = fs.readFileSync('src/JavaScript.js', 'utf8');

console.log('Checking all document.getElementById statements that access style in JavaScript.js...');
const lines = file.split('\n');
lines.forEach((l, i) => {
  if (l.includes('document.getElementById') && l.includes('.style')) {
    const m = l.match(/document\.getElementById\(['"\x22]([^'"\x22]+)['"\x22]\)/);
    if (m) {
      const id = m[1];
      const exists = index.includes(`id="${id}"`) || index.includes(`id='${id}'`) || index.includes(`id=${id}`);
      if (!exists) {
        console.log((i + 1) + ': ' + l.trim() + ' -> ID "' + id + '" DOES NOT EXIST IN index.html!');
      }
    }
  }
});
