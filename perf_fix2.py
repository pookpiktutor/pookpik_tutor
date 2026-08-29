import re

with open('Code.js', 'r', encoding='utf-8') as f:
    content = f.read()

# The slow pattern: for (let m = 1; m <= 12; m++) { ... classLogs.forEach(c => { ... parseDateString(c.date) ... } }
# We want to PRE-BUCKET classLogs by month in ONE pass, then just iterate buckets

# The optimization: pre-compute month buckets BEFORE the loop
# Insert this after the classLogs / teachersList fetch and teacherProfile lookup

old_monthly = '''    const monthlyResults = {};

    for (let m = 1; m <= 12; m++) {

      const range = getRangeForMonth(m);

      const matchedClasses = [];

      let totalHours = 0;

      let totalPay = 0;

      let totalClasses = 0;

      

      classLogs.forEach(c => {

        const cDate = parseDateString(c.date);

        if (cDate < range.start || cDate > range.end) return;'''

new_monthly = '''    // Pre-bucket classLogs by month in a SINGLE PASS for performance
    const monthBuckets = {}; // m -> []
    for (let m = 1; m <= 12; m++) monthBuckets[m] = [];

    classLogs.forEach(c => {
      const cDate = parseDateString(c.date);
      for (let m = 1; m <= 12; m++) {
        const range = getRangeForMonth(m);
        if (cDate >= range.start && cDate <= range.end) {
          monthBuckets[m].push(c);
          break; // Each class log belongs to exactly one month
        }
      }
    });

    const monthlyResults = {};

    for (let m = 1; m <= 12; m++) {

      const range = getRangeForMonth(m);

      const matchedClasses = [];

      let totalHours = 0;

      let totalPay = 0;

      let totalClasses = 0;

      

      monthBuckets[m].forEach(c => {

        const cDate = parseDateString(c.date);

        if (cDate < range.start || cDate > range.end) return;'''

if old_monthly in content:
    content = content.replace(old_monthly, new_monthly)
    print('Fix 3: Optimized month bucketing in calculateTeacherYearlyPay')
else:
    print('WARN: Fix 3 pattern not found - trying alternate match...')
    # Try to find the pattern differently
    if 'for (let m = 1; m <= 12; m++) {' in content and 'classLogs.forEach(c =>' in content:
        print('Both pieces exist, but combined pattern not matched due to whitespace differences')

with open('Code.js', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done')
