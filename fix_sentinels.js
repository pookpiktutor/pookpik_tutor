const fs = require('fs');
let text = fs.readFileSync('Code.js', 'utf8');

// The sentinel strings in the spreadsheet cell C that mean "no substitute teacher"
// We need to match them in the code. Let's use a function-based approach instead
// of trying to match specific corrupted strings.

// Replace the complex sentinel checks with a helper function
// Instead of: cellC !== '⚠️ไม่มีครูแทน' && cellC !== '-' && cellC !== '(ไม่มีผู้สอนแทน)'
// Use: !isEmptySub(cellC)

const helperFunc = `
function isEmptySub(val) {
  if (!val || val === '' || val === '-') return true;
  var v = val.toString().trim().toLowerCase();
  if (v === '-' || v === '') return true;
  // Check for sentinel values (ไม่มีครูแทน, ไม่มีผู้สอนแทน)
  if (v.indexOf('\\u0e44\\u0e21\\u0e48\\u0e21\\u0e35') >= 0) return true; // contains 'ไม่มี'
  if (v.indexOf('\\u26a0') >= 0) return true; // contains ⚠️
  return false;
}
`;

// Add the helper right before the first function that uses it
text = text.replace(
  'function calculateTeacherYearlyPay(',
  helperFunc + '\nfunction calculateTeacherYearlyPay('
);

// Now replace all the complex sentinel checks
// Pattern: cellC !== '<corrupted sentinel>' && cellC !== '-' && cellC !== '<corrupted sentinel>'
// With: !isEmptySub(cellC)

// For the matchC condition:
// Original: (cellC.includes(cleanNick) && cellC !== '<sentinel>' && cellC !== '-' && cellC !== '<sentinel>')
// New: (cellC.includes(cleanNick) && !isEmptySub(cellC))
text = text.replace(
  /\(cellC\.includes\(cleanNick\) && cellC !== '[^']*' && cellC !== '-' && cellC !== '[^']*'\)/g,
  '(cellC.includes(cleanNick) && !isEmptySub(cellC))'
);

// For the if conditions:
// Original: if (cellB !== '' && cellC !== '' && cellC !== '<sentinel>' && cellC !== '-' && cellC !== '<sentinel>') {
// New: if (cellB !== '' && cellC !== '' && !isEmptySub(cellC)) {
text = text.replace(
  /cellC !== '' && cellC !== '[^']*' && cellC !== '-' && cellC !== '[^']*'\)/g,
  "cellC !== '' && !isEmptySub(cellC))"
);

// For the else if:
// Original: } else if (cellC !== '' && cellC !== '<sentinel>' && cellC !== '-' && cellC !== '<sentinel>') {
// New: } else if (cellC !== '' && !isEmptySub(cellC)) {
text = text.replace(
  /cellC !== '' && cellC !== '[^']*' && cellC !== '-' && cellC !== '[^']*'\) \{/g,
  "cellC !== '' && !isEmptySub(cellC)) {"
);

fs.writeFileSync('Code.js', text, 'utf8');
console.log('Done. Added isEmptySub helper and simplified sentinel checks.');
