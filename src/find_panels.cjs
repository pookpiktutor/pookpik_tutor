const fs = require('fs');
const html = fs.readFileSync('Index.html', 'utf8');
const regex = /id=\"([a-zA-Z0-9_-]+_panel)\"/g;
let m;
while ((m = regex.exec(html)) !== null) {
  console.log(m[1]);
}
