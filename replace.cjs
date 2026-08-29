const fs = require('fs');

let code = fs.readFileSync('src/JavaScript.js', 'utf8');

// Replace renderDailyGrid
const dailyStart = code.indexOf('function renderDailyGrid() {');
const dailyEnd = code.indexOf('\nfunction quickAddClassLog(');
if (dailyStart === -1 || dailyEnd === -1) {
    console.error("Could not find boundaries for renderDailyGrid");
    process.exit(1);
}
const newDailyGrid = fs.readFileSync('new_renderDailyGrid.js', 'utf8');

code = code.substring(0, dailyStart) + newDailyGrid + code.substring(dailyEnd);

// Replace renderTeacherScheduleGrid
const teacherStart = code.indexOf('function renderTeacherScheduleGrid(teacher) {');
const teacherEnd = code.indexOf('\nfunction loadTeacherProfiles() {');
if (teacherStart === -1 || teacherEnd === -1) {
    console.error("Could not find boundaries for renderTeacherScheduleGrid");
    process.exit(1);
}
const newTeacherGrid = fs.readFileSync('new_renderTeacherGrid.js', 'utf8');

code = code.substring(0, teacherStart) + newTeacherGrid + code.substring(teacherEnd);

fs.writeFileSync('src/JavaScript.js', code);
console.log("Successfully replaced both rendering functions.");
