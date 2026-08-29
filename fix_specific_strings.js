const fs = require('fs');

let text = fs.readFileSync('Code.js', 'utf8');

const replacements = {
  '⚠️à¹„à¸¡à¹ˆà¸¡à¸µà¸„à¸£à¸¹à¹à¸—à¸™': '⚠️ไม่มีครูแทน',
  'à¹„à¸¡à¹ˆà¸¡à¸µà¸œà¸¹à¹‰à¸ªà¸­à¸™à¹à¸—à¸™': 'ไม่มีผู้สอนแทน',
  'รยว.': 'รยว.',
  'ครูลา': 'ครูลา',
  'ครูประจำ': 'ครูประจำ',
  'à¸„à¸£à¸¹à¹à¸—à¸™': 'ครูแทน',
  'วิชา': 'วิชา',
  'เวลาเริ่ม': 'เวลาเริ่ม',
  'เวลาจบ': 'เวลาจบ'
};

for (const [bad, good] of Object.entries(replacements)) {
  // Use replaceAll by splitting and joining
  text = text.split(bad).join(good);
}

fs.writeFileSync('Code.js', text, 'utf8');
console.log('Fixed specific strings.');
