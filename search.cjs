const fs = require('fs');
const html = fs.readFileSync('src/Index.html', 'utf8');
const lines = html.split('\n');
lines.forEach((line, idx) => {
    if (line.includes('รายรับ')) {
        console.log(`Index.html:${idx + 1}: ${line.trim()}`);
    }
});
const js = fs.readFileSync('src/JavaScript.js', 'utf8');
const jsLines = js.split('\n');
jsLines.forEach((line, idx) => {
    if (line.includes('รายรับ')) {
        console.log(`JavaScript.js:${idx + 1}: ${line.trim()}`);
    }
});
