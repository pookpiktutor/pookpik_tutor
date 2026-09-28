const fs = require('fs');
const txt = fs.readFileSync('modal_html_history.txt', 'utf16le');
const lines = txt.split('\n');
let idx = lines.findIndex(l => l.includes('id="camp_payment_modal"'));
if(idx !== -1) {
  let endIdx = idx;
  for(let i = idx; i < lines.length; i++) {
    if(lines[i].includes('</div> <!-- End camp_payment_modal -->')) {
      endIdx = i;
      break;
    }
  }
  if (endIdx === idx) endIdx = idx + 100;
  fs.writeFileSync('extracted_modal_html.html', lines.slice(idx-2, endIdx+2).join('\n'), 'utf8');
  console.log('found in utf16le');
} else {
  console.log('not found in utf16le');
}
