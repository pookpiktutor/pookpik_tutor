const fs = require('fs');
const code = fs.readFileSync('index.html', 'utf8');
const start = code.indexOf('<table class="table');
console.log(code.substring(start, start + 3000));
