const fs = require('fs');
const js = fs.readFileSync('src/JavaScript.js', 'utf8');
const start = js.indexOf('var currentStatus = (item.status || "").trim();');
console.log(js.substring(start, start + 800));
