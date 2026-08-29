import re

with open('src/JavaScript.js', 'r', encoding='utf-8') as f:
    content = f.read()

helper = """
// --- Cache Helpers for Performance ---
function fetchCachedStudents(isSilent, successCallback, failureCallback) {
  if (state.students && state.students.length > 0) {
    if (!isSilent) setLoading(false);
    if (successCallback) successCallback(state.students);
    return;
  }
  if (!isSilent) setLoading(true, 'กำลังดึงข้อมูลนักเรียน...');
  google.script.run
    .withSuccessHandler(data => {
      if (!isSilent) setLoading(false);
      if (Array.isArray(data)) {
        state.students = data;
        if (successCallback) successCallback(data);
      } else {
        if (!isSilent) showToast('ไม่สามารถดึงข้อมูลได้', 'error');
        if (failureCallback) failureCallback(new Error('Invalid data format'));
      }
    })
    .withFailureHandler(err => {
      if (!isSilent) setLoading(false);
      if (!isSilent) showToast('ดึงข้อมูลล้มเหลว: ' + err.message, 'error');
      if (failureCallback) failureCallback(err);
    })
    .getStudentsList(getLogUser());
}
"""

# Insert helper near the top of the file, after `const state = { ... };` if possible, or just at the end of the state declaration block.
state_end = content.find('// 1. Core Functions & Setup')
if state_end != -1:
    content = content[:state_end] + helper + "\n" + content[state_end:]
else:
    # Append near the top
    content = content.replace('"use strict";', '"use strict";\n' + helper)

with open('src/JavaScript.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Helper inserted.")
