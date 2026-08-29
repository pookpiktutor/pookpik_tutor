const fs = require('fs');
let code = fs.readFileSync('g:/My Drive/0.งานสถาบัน/data_PookPik_Tutor/Code.js', 'utf8');

const target = `    const classInfoList = classes.map(c => ({ subject: c.subject, dayOfWeek: thaiDay, timeStart: c.timeStart }));
    const enrollments = getCourseEnrollmentCounts(courseNames, classInfoList);`;

const replacement = `    const classInfoList = classes.map(c => ({ subject: c.subject, dayOfWeek: thaiDay, timeStart: c.timeStart }));
    
    // CACHE getCourseEnrollmentCounts to significantly speed up loadDailyGrid
    let safeDateStr = 'all';
    if (dateStr) { safeDateStr = dateStr.replace(/[^0-9a-zA-Z]/g, ''); }
    const enrollCacheKey = 'enrollments_date_' + safeDateStr;
    let enrollments = getCacheObject(enrollCacheKey);
    if (!enrollments) {
      enrollments = getCourseEnrollmentCounts(courseNames, classInfoList);
      setCacheObject(enrollCacheKey, enrollments, 1800); // cache for 30 minutes
    }`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('g:/My Drive/0.งานสถาบัน/data_PookPik_Tutor/Code.js', code);
  console.log('Replaced and added caching for enrollments!');
} else {
  console.log('Target not found.');
}
