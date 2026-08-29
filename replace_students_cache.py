import re

with open('src/JavaScript.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. handleLogin (around 2378-2390)
p1 = r'google\.script\.run\s*\.withSuccessHandler\(students => \{\s*if \(Array\.isArray\(students\)\) \{\s*state\.students = students;\s*\}\s*\}\)\s*\.getStudentsList\(getLogUser\(\)\);'
content = re.sub(p1, "fetchCachedStudents(true);", content)

# 2. refreshStudentDB (around 5358)
p2 = r'google\.script\.run\s*\.withSuccessHandler\(data => \{\s*if \(!isSilent\) setLoading\(false\);\s*if \(Array\.isArray\(data\)\) \{\s*state\.students = data;\s*renderStudentDB\(\);\s*\} else \{\s*if \(!isSilent\) showToast\(' + r"'ไม่สามารถดึงข้อมูลทะเบียนนักเรียนได้', 'error'\);\s*\}\s*\}\)\s*\.withFailureHandler\(err => \{\s*if \(!isSilent\) setLoading\(false\);\s*if \(!isSilent\) showToast\('ดึงข้อมูลล้มเหลว: ' \+ err\.message, 'error'\);\s*\}\)\s*\.getStudentsList\(getLogUser\(\)\);"
r2 = "state.students = []; // Force refresh\n    fetchCachedStudents(isSilent, () => renderStudentDB());"
content = re.sub(p2, r2, content)

# 3. searchGlobalBackend (around 6650)
p3 = r'google\.script\.run\s*\.withSuccessHandler\(data => \{\s*setLoading\(false\);\s*if \(Array\.isArray\(data\)\) \{\s*state\.students = data;\s*let match = data\.find\(reg =>\s*reg\.name\.trim\(\) === studentName\.trim\(\) &&\s*reg\.grade === selectedGrade &&\s*reg\.branch === selectedBranch\s*\);\s*if \(match\) \{\s*openEditModal\(match\.id, match\);\s*\} else \{\s*showToast\(' + r"'ไม่พบข้อมูลนักเรียน', 'warning'\);\s*\}\s*\}\s*\}\)\s*\.withFailureHandler\(err => \{\s*setLoading\(false\);\s*showToast\('ค้นหาล้มเหลว: ' \+ err\.message, 'error'\);\s*\}\)\s*\.getStudentsList\(getLogUser\(\)\);"
r3 = r"""fetchCachedStudents(false, data => {
        let match = data.find(reg => 
          reg.name.trim() === studentName.trim() && 
          reg.grade === selectedGrade && 
          reg.branch === selectedBranch
        );
        if (match) {
          openEditModal(match.id, match);
        } else {
          showToast('ไม่พบข้อมูลนักเรียน', 'warning');
        }
      });"""
content = re.sub(p3, r3, content)

# 4. loadDebtors (around 15260)
p4 = r'google\.script\.run\s*\.withSuccessHandler\(data => \{\s*if \(!isSilent\) setLoading\(false\);\s*if \(Array\.isArray\(data\)\) \{\s*state\.students = data;\s*renderDebtorsList\(\);\s*\} else \{\s*if \(!isSilent\) showToast\(' + r"'ไม่สามารถดึงข้อมูลยอดค้างชำระได้', 'error'\);\s*\}\s*\}\)\s*\.withFailureHandler\(err => \{\s*if \(!isSilent\) setLoading\(false\);\s*if \(!isSilent\) showToast\('เชื่อมต่อล้มเหลว: ' \+ err\.message, 'error'\);\s*\}\)\s*\.getStudentsList\(getLogUser\(\)\);"
r4 = "fetchCachedStudents(isSilent, () => renderDebtorsList());"
content = re.sub(p4, r4, content)

# 5. loadReceipts (around 15992)
p5 = r'google\.script\.run\s*\.withSuccessHandler\(data => \{\s*if \(!isSilent\) setLoading\(false\);\s*if \(Array\.isArray\(data\)\) \{\s*state\.students = data;\s*renderReceiptsList\(\);\s*\} else \{\s*if \(!isSilent\) showToast\(' + r"'ไม่สามารถดึงข้อมูลประวัติการชำระเงินได้', 'error'\);\s*\}\s*\}\)\s*\.withFailureHandler\(err => \{\s*if \(!isSilent\) setLoading\(false\);\s*if \(!isSilent\) showToast\('เชื่อมต่อล้มเหลว: ' \+ err\.message, 'error'\);\s*\}\)\s*\.getStudentsList\(getLogUser\(\)\);"
r5 = "fetchCachedStudents(isSilent, () => renderReceiptsList());"
content = re.sub(p5, r5, content)

with open('src/JavaScript.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done python regex replacements")
