const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const id1 = html.indexOf('id="teacher_daily_schedule_panel"');
const id2 = html.indexOf('id="teacher_monthly_salary_panel"');
const id3 = html.indexOf('id="teacher_yearly_summary_banner"');
const id4 = html.indexOf('id="teacher_salary_result_card"');
const id5 = html.indexOf('id="evaluation_form_panel"');

console.log('Daily Schedule:', id1);
console.log('Monthly Salary:', id2);
console.log('Yearly Summary:', id3);
console.log('Result Card:', id4);
console.log('Eval Form:', id5);
