const fs = require('fs');
let js = fs.readFileSync('JavaScript.js', 'utf8');

js = js.replace(/onclick='alert\("ฟังก์ชันจัดการเงิน \(อยู่ระหว่างพัฒนา\)"\)'/g, "onclick=\\"alert('ฟังก์ชันจัดการเงิน (อยู่ระหว่างพัฒนา)')\\"");
js = js.replace(/onclick='alert\("ฟังก์ชันลบ \(อยู่ระหว่างพัฒนา\)"\)'/g, "onclick=\\"alert('ฟังก์ชันลบ (อยู่ระหว่างพัฒนา)')\\"");

fs.writeFileSync('JavaScript.js', js);
console.log('Fixed syntax error');
