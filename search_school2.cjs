const fs = require('fs');
const code = fs.readFileSync('Register.html', 'utf8');
const start = code.indexOf('id="std_school"');
console.log(code.substring(start - 200, start + 3000));
