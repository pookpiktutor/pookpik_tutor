import re

with open('src/JavaScript.js', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'''  if \(!isSilent\) \{\s*setLoading\(true, 'กำลังดึงตารางสอนคุณครู ' \+ teacher \+ '\.\.\.'\);\s*\}\s*google\.script\.run\s*\.withSuccessHandler\(data => \{'''

replacement = """  if (!isSilent) {
    setLoading(true, 'กำลังดึงตารางสอนคุณครู ' + teacher + '...');
  }
  
  if (state.allClassLogsCache && !isSilent && window._forceTeacherGridRefresh !== true) {
    const data = state.allClassLogsCache;
    setTimeout(() => {
      setLoading(false);
      state.classLogs = data;
      state.teacherClasses = data.filter(c => 
        (c.teacherRegular && c.teacherRegular.toLowerCase().includes(teacher.toLowerCase().trim())) ||
        (c.teacherSub && c.teacherSub.toLowerCase().includes(teacher.toLowerCase().trim()))
      );
      renderTeacherScheduleGrid(teacher);
    }, 10);
    return;
  }
  window._forceTeacherGridRefresh = false;

  google.script.run
    .withSuccessHandler(data => {
      if (Array.isArray(data)) {
        state.allClassLogsCache = data;
      }"""

content = re.sub(pattern, replacement, content)

with open('src/JavaScript.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("loadTeacherSchedule cache implemented.")
