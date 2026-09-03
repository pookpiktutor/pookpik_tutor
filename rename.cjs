const fs = require('fs');
let code = fs.readFileSync('src/Code.js', 'utf8');
code = code.replace(/function getTeachersDB\(/g, 'function getUsersDB(');
code = code.replace(/getTeachersDB\(/g, 'getUsersDB(');
fs.writeFileSync('src/Code.js', code, 'utf8');

let indexHtml = fs.readFileSync('src/index.html', 'utf8');
indexHtml = indexHtml.replace(/getTeachersDB\(/g, 'getUsersDB(');
indexHtml = indexHtml.replace(/'TeachersDB'/g, "'UsersDB'");
fs.writeFileSync('src/index.html', indexHtml, 'utf8');

let jsHtml = fs.readFileSync('src/JavaScript.html', 'utf8');
jsHtml = jsHtml.replace(/getTeachersDB\(/g, 'getUsersDB(');
jsHtml = jsHtml.replace(/'TeachersDB'/g, "'UsersDB'");
fs.writeFileSync('src/JavaScript.html', jsHtml, 'utf8');

console.log('Renamed in Code.js, index.html, JavaScript.html');
