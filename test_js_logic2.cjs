const fs = require('fs');

const data = JSON.parse(fs.readFileSync('api_dump.json', 'utf8'));
const list = data.evaluations || data;

function cleanNick(str) {
  if (!str) return '';
  return String(str)
    .replace(/^(ด\.ช\.|ด\.ญ\.|เด็กชาย|เด็กหญิง|น้อง|นาย|นางสาว|ดช|ดญ)\s*/g, '')
    .replace(/[\s\-_.\(\)]/g, '')
    .toLowerCase();
}

const cleanedQuery = cleanNick("ณัฐนรี รัศมีแก้ว");
console.log("cleanedQuery:", cleanedQuery);

const matched = list.filter(item => {
  const isPublished = (item.isPublished === true || item.published === true || 
                       String(item.status).toLowerCase() === 'published' || 
                       String(item.status) === 'เผยแพร่แล้ว');
  if (!isPublished) return false;

  const rawStdName = String(item.studentName || item.student_name || item.name || '');
  const rawNick = String(item.nickname || item.nickName || '');
  
  const cleanRawName = cleanNick(rawStdName);
  const cleanRawNick = cleanNick(rawNick);

  if (cleanRawName.includes(cleanedQuery) || cleanedQuery.includes(cleanRawName)) return true;
  if (cleanRawNick && (cleanRawNick.includes(cleanedQuery) || cleanedQuery.includes(cleanRawNick))) return true;

  return false;
});

console.log("Matched evals count:", matched.length);
if (matched.length > 0) {
    console.log("Match found!", matched[0].studentName);
} else {
    console.log("NO MATCHES FOUND");
}
