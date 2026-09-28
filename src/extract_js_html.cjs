const fs = require('fs');
const html = fs.readFileSync('JavaScript.html', 'utf8');
const startIndex = html.indexOf('สรุปจำนวนนักเรียน');
if (startIndex === -1) {
  console.log('Not found');
  process.exit(1);
}

const snippet = html.substring(Math.max(0, startIndex - 1000), startIndex + 3000);
fs.writeFileSync('js_html_snippet.txt', snippet);
console.log('Saved js_html_snippet.txt');
