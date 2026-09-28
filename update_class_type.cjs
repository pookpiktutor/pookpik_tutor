const fs = require('fs');
let code = fs.readFileSync('Register.html', 'utf8');

const isMainGroupDecl = "const isMainGroup = (classType === 'กลุ่มหลัก' || classType === 'กลุ่มหลักตามตารางคอร์ส');";

if (!code.includes(isMainGroupDecl)) {
  code = code.replace(
    "const branchLearn = document.getElementById('branch_learn').value.trim();", 
    "const branchLearn = document.getElementById('branch_learn').value.trim();\n    " + isMainGroupDecl
  );
}

code = code.replaceAll("classType === 'กลุ่มหลัก'", 'isMainGroup');
fs.writeFileSync('Register.html', code, 'utf8');
console.log('Replaced successfully');
