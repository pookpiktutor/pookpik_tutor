// Comprehensive fix for Code.js encoding and role logic
// This script:
// 1. Adds isEmptySub() helper function
// 2. Replaces corrupted role string assignments with ASCII identifiers
// 3. Replaces corrupted sentinel string comparisons with isEmptySub()
// 4. Fixes corrupted ครูลา check in role === comparison

const fs = require('fs');
let lines = fs.readFileSync('Code.js', 'utf8').split('\n');
let changes = 0;

// ========= PHASE 1: Add isEmptySub helper before calculateTeacherYearlyPay =========
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('function calculateTeacherYearlyPay(')) {
    const helper = [
      'function isEmptySub(val) {',
      '  if (!val || val === "" || val === "-" || val.toString().trim() === "" || val.toString().trim() === "-") return true;',
      '  var v = val.toString().trim();',
      '  if (v.indexOf("\\u0e44\\u0e21\\u0e48\\u0e21\\u0e35") >= 0) return true;',
      '  if (v.indexOf("\\u26a0") >= 0) return true;',
      '  if (v.indexOf("\\u0e04\\u0e23\\u0e39\\u0e41\\u0e17\\u0e19") >= 0) return true;',
      '  return false;',
      '}',
      ''
    ];
    lines.splice(i, 0, ...helper);
    changes++;
    console.log('Added isEmptySub helper at line ' + (i+1));
    break;
  }
}

// ========= PHASE 2: Fix role assignments and sentinel checks line by line =========
for (let i = 0; i < lines.length; i++) {
  const trimmed = lines[i].trim();
  
  // Fix: role = '<corrupted ครูแทน>';  -->  role = 'sub';
  // Fix: role = '<corrupted ครูประจำ>';  -->  role = 'regular';
  if (/^\s*role = '[^']+';/.test(lines[i])) {
    const roleVal = lines[i].match(/role = '([^']+)'/);
    if (roleVal && roleVal[1].length > 3 && /[^\x00-\x7F]/.test(roleVal[1])) {
      // Contains non-ASCII - it's a corrupted Thai string
      // Check if it contains characters from ประจำ (regular) or แทน (sub)
      const indent = lines[i].match(/^(\s*)/)[1];
      if (roleVal[1].includes('\u0e1b\u0e23\u0e30') || roleVal[1].includes('\u00e0\u00b8\u009b\u00e0\u00b8\u00a3\u00e0\u00b8\u00b0')) {
        lines[i] = indent + "role = 'regular';\r";
        changes++;
        console.log('Fixed role=regular at line ' + (i+1));
      } else {
        lines[i] = indent + "role = 'sub';\r";
        changes++;
        console.log('Fixed role=sub at line ' + (i+1));
      }
    }
  }
  
  // Fix: role === '<corrupted ครูประจำ>'  -->  role === 'regular'
  if (lines[i].includes("role === '") && /role === '[^\x00-\x7F]/.test(lines[i])) {
    lines[i] = lines[i].replace(/role === '[^']+'/g, "role === 'regular'");
    changes++;
    console.log('Fixed role comparison at line ' + (i+1));
  }
  
  // Fix sentinel checks: cellC !== '<corrupted>' && cellC !== '-' && cellC !== '<corrupted>'
  // Pattern: cellC !== '<non-ASCII>' && cellC !== '-' && cellC !== '<non-ASCII>'
  // Replace with: !isEmptySub(cellC)
  if (lines[i].includes("cellC !== '") && /cellC !== '[^\x00-\x7F][^']*'/.test(lines[i])) {
    const indent = lines[i].match(/^(\s*)/)[1];
    
    if (lines[i].includes('cellB !== ') && lines[i].includes('cellC !== ')) {
      // This is: if (cellB !== '' && cellC !== '' && cellC !== '<sentinel>' && ...)
      lines[i] = indent + "if (cellB !== '' && cellC !== '' && !isEmptySub(cellC)) {\r";
      changes++;
      console.log('Fixed if(cellB+cellC) sentinel at line ' + (i+1));
    } else if (lines[i].includes('} else if (cellC !== ')) {
      // This is: } else if (cellC !== '' && cellC !== '<sentinel>' && ...)
      lines[i] = indent + "} else if (cellC !== '' && !isEmptySub(cellC)) {\r";
      changes++;
      console.log('Fixed else-if(cellC) sentinel at line ' + (i+1));
    } else if (lines[i].includes('cellC.includes(cleanNick)')) {
      // This is the matchC condition
      lines[i] = indent + "(cellC.includes(cleanNick) && !isEmptySub(cellC)));\r";
      changes++;
      console.log('Fixed matchC sentinel at line ' + (i+1));
    }
  }
  
  // Fix: teacherSub !== '' && teacherSub !== '<corrupted>' && ...
  if (lines[i].includes("teacherSub !== '") && /teacherSub !== '[^\x00-\x7F][^']*'/.test(lines[i])) {
    const indent = lines[i].match(/^(\s*)/)[1];
    lines[i] = indent + "if (!isEmptySub(teacherSub)) {\r";
    changes++;
    console.log('Fixed teacherSub sentinel at line ' + (i+1));
  }
  
  // Fix: .includes('<corrupted ครูลา>') --> .includes('\u0e04\u0e23\u0e39\u0e25\u0e32')
  if (lines[i].includes(".includes('") && /\.includes\('[^\x00-\x7F][^']*'\)/.test(lines[i]) 
      && lines[i].includes('role') && lines[i].includes('note')) {
    lines[i] = lines[i].replace(/\.includes\('[^']+'\)/, ".includes('\\u0e04\\u0e23\\u0e39\\u0e25\\u0e32')");
    changes++;
    console.log('Fixed ครูลา includes at line ' + (i+1));
  }
}

fs.writeFileSync('Code.js', lines.join('\n'), 'utf8');
console.log('\nTotal changes: ' + changes);
