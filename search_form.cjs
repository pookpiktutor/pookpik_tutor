const fs = require('fs');
const code = fs.readFileSync('Register.html', 'utf8');
const start = code.indexOf('<form');
console.log(code.substring(start, start + 3500).replace(/src="data:image.*?"/, 'src="[BASE64]"'));
