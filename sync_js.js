const fs = require('fs');
const js = fs.readFileSync('src/JavaScript.js', 'utf8');
const html = `<script>\n${js}\n</script>`;
fs.writeFileSync('JavaScript.html', html, 'utf8');
console.log('Synced src/JavaScript.js to JavaScript.html successfully!');
