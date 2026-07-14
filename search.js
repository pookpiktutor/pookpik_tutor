const fs = require('fs');
const code = fs.readFileSync('g:/My Drive/0.งานสถาบัน/data_PookPik_Tutor/Index.html', 'utf8');
const lines = code.split('\n');
let inside = false;
let count = 0;
for(let i=0; i<lines.length; i++) {
  if (lines[i].includes('id="evaluation_form_panel"')) inside = true;
  if (inside && count < 60) {
    console.log(i + ': ' + lines[i]);
    count++;
  }
}
