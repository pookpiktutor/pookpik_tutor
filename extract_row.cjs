const fs = require('fs');
const code = fs.readFileSync('index.html', 'utf8');
const start = code.indexOf('html += "<td style=\'" + outstColor + "\'>" + outst.toLocaleString() + "</td>";');
console.log(code.substring(start, start + 1000));
