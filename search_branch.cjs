const fs = require('fs');
const code = fs.readFileSync('Register.html', 'utf8');
const start = code.indexOf('id="branch_learn"');
console.log(code.substring(start - 500, start + 1000).replace(/src="data:image.*?"/, 'src="[BASE64]"'));
