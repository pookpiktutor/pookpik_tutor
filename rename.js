const fs = require('fs');
let code = fs.readFileSync('src/Code.js', 'utf8');

// Replace function definition
code = code.replace(/function getTeachersDB\(/g, 'function getUsersDB(');

// Replace calls
code = code.replace(/getTeachersDB\(/g, 'getUsersDB(');

fs.writeFileSync('src/Code.js', code, 'utf8');
console.log('Renamed in Code.js');

