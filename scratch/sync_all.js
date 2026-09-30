import fs from 'fs';

const v = Date.now();
let index = fs.readFileSync('src/Index.html', 'utf8');
index = index.replace(/JavaScript\.js\?v=[^"']*/g, 'JavaScript.js?v=' + v);
fs.writeFileSync('src/Index.html', index, 'utf8');

['Code.js', 'Index.html', 'JavaScript.js'].forEach(f => {
  if (fs.existsSync('src/' + f)) {
    fs.copyFileSync('src/' + f, f);
    console.log('Copied src/' + f + ' to ' + f);
  }
});
