import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync('src/Code.js', 'utf8');

// Replace in getGradeSheetData
content = content.replace(
  /gradesToFetch\.forEach\(g => \{\s*suffixes\.forEach\(suffix => \{\s*const sheetName = `\$\{g\}\/\$\{suffix\}`;/g,
  "gradesToFetch.forEach(g => {\n        const sheetName = `${g}`;"
);

content = content.replace(
  /const branchName = `สาขา\$\{suffix\}`;/g,
  "const branchName = branch || '';"
);

// We need to remove one closing brace for the suffixes loop. It's located right after `});` near line 7160
content = content.replace(
  /      \}\s*\}\);\s*\}\);\s*return \{/g,
  "      }\n\n    });\n\n    return {"
);

// Replace in addNewCoursesBatch
content = content.replace(
  /let suffix = '1';\s*if \(branch\.includes\('สาขา2'\)\) suffix = '2';\s*else if \(branch\.includes\('สาขา3'\)\) suffix = '3';\s*const sheetName = `\$\{grade\}\/\$\{suffix\}`;/g,
  "const sheetName = `${grade}`;"
);

writeFileSync('src/Code.js', content, 'utf8');
console.log('done');
