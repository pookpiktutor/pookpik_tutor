const fs = require('fs');
const html = fs.readFileSync('Index.html', 'utf8');
const startIndex = html.indexOf('id="camps_panel"');
if (startIndex === -1) {
  console.log('Not found');
  process.exit(1);
}
const endString = '<!-- 5. DEBTORS PANEL -->';
const endIndex = html.indexOf(endString, startIndex);

const snippet = html.substring(startIndex - 30, endIndex > -1 ? endIndex : startIndex + 5000);
fs.writeFileSync('camps_panel.html', snippet);
console.log('Saved camps_panel.html');
