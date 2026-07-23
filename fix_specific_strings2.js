const fs = require('fs');

let text = fs.readFileSync('Code.js', 'utf8');

// Use regex to match the corrupted strings even with weird characters before them
text = text.replace(/à¹„à¸¡à¹ˆà¸¡à¸µà¸„à¸£à¸¹à¹à¸—à¸™/g, 'ไม่มีครูแทน');
text = text.replace(/à¹„à¸¡à¹ˆà¸¡à¸µà¸œà¸¹à¹‰à¸ªà¸­à¸™à¹à¸—à¸™/g, 'ไม่มีผู้สอนแทน');
text = text.replace(/รยว\./g, 'รยว.');
text = text.replace(/ครูลา/g, 'ครูลา');
text = text.replace(/ครูประจำ/g, 'ครูประจำ');
text = text.replace(/à¸„à¸£à¸¹à¹à¸—à¸™/g, 'ครูแทน');
text = text.replace(/วิชา/g, 'วิชา');
text = text.replace(/เวลาเริ่ม/g, 'เวลาเริ่ม');
text = text.replace(/เวลาจบ/g, 'เวลาจบ');

// Handle the weird emoji artifact
text = text.replace(/⚠️/g, '⚠️');
text = text.replace(/⚠️ï¸/g, '⚠️');

fs.writeFileSync('Code.js', text, 'utf8');
console.log('Fixed using regex.');
