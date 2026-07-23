const { execSync } = require('child_process');
console.time('clasp run');
try {
  const result = execSync('run_clasp.bat run calculateTeacherYearlyPay -p "[\\"ครูปุ๊กปิ๊ก\\", 2026, \\"test\\"]"', { encoding: 'utf-8' });
  console.log(result);
} catch (e) {
  console.log(e.stdout || e.message);
}
console.timeEnd('clasp run');
