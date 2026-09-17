const fs = require('fs');

const data = JSON.parse(fs.readFileSync('api_dump.json', 'utf8'));
const list = data.evaluations || data;

function cleanNick(name) {
  return name ? name.toString().replace(/\s+/g, '').toLowerCase() : '';
}

// this is the base64 from the URL in screenshot 2
const refParam = "4LiB4Lil4Li44Lih4Lii4LmI4Lit4Lii4Lit4Lix4LiH4LiB4Lik4LipIOC4mOC4seC4jeC4jeC5iOC4siDguJnguLTguKcg4LmE4Lit4LiE4Li04Lin";
const decodedBytes = Buffer.from(refParam, 'base64');
const decodedString = decodedBytes.toString('utf8');

console.log("Decoded ref:", decodedString);

const studentName = decodedString; // From JS: studentName = b64DecodeUnicode(ref);
const cleanedQuery = cleanNick(studentName);
console.log("cleanedQuery:", cleanedQuery);

const myEvals = list.filter(item => {
    const isPublished = (item.isPublished === true || item.published === true || 
                            String(item.status).toLowerCase() === 'published' || 
                            String(item.status) === 'เผยแพร่แล้ว');
    if (!isPublished) {
        // console.log("Not published:", item.studentName);
        return false;
    }

    const rawStdName = String(item.studentName || item.student_name || item.name || '');
    const rawNick = String(item.nickname || item.nickName || '');
    
    const cleanRawName = cleanNick(rawStdName);
    const cleanRawNick = cleanNick(rawNick);

    if (cleanRawName.includes(cleanedQuery) || cleanedQuery.includes(cleanRawName)) return true;
    if (cleanRawNick && (cleanRawNick.includes(cleanedQuery) || cleanedQuery.includes(cleanRawNick))) return true;

    return false;
});

console.log("Matched evals count:", myEvals.length);
if (myEvals.length > 0) {
    console.log("Match found!", myEvals[0].studentName);
} else {
    console.log("NO MATCHES FOUND");
}
