import re

with open('src/JavaScript.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace block in loadStudentDB (revenue logs)
pattern_load_student = r'''  if \(!isSilent\) \{\s*setLoading\(true, 'กำลังดึงรายการรายรับ\.\.\.'\);\s*\}\s*google\.script\.run\s*\.withSuccessHandler\(data => \{\s*if \(!isSilent\) setLoading\(false\);\s*if \(Array\.isArray\(data\)\) \{\s*state\.students = data;\s*renderRevenueLogs\(\);\s*\} else \{\s*if \(!isSilent\) showToast\('ไม่สามารถดึงข้อมูลรายรับได้: ' \+ \(data \? data\.error : 'unknown'\), 'error'\);\s*\}\s*\}\)\s*\.withFailureHandler\(err => \{\s*if \(!isSilent\) setLoading\(false\);\s*if \(!isSilent\) showToast\('ดึงข้อมูลล้มเหลว: ' \+ err\.message, 'error'\);\s*\}\)\s*\.getStudentsList\(getLogUser\(\)\);'''
replacement_load_student = "  fetchCachedStudents(isSilent, data => { renderRevenueLogs(); });"
content = re.sub(pattern_load_student, replacement_load_student, content)

# Replace block in loadDebtors
pattern_load_debtors = r'''  if \(!isSilent\) \{\s*setLoading\(true, 'กำลังโหลดข้อมูลยอดค้างชำระ\.\.\.'\);\s*\}\s*google\.script\.run\s*\.withSuccessHandler\(data => \{\s*if \(!isSilent\) setLoading\(false\);\s*if \(Array\.isArray\(data\)\) \{\s*state\.students = data;\s*renderDebtorsList\(\);\s*\} else \{\s*if \(!isSilent\) showToast\('ไม่สามารถดึงข้อมูลยอดค้างชำระได้', 'error'\);\s*\}\s*\}\)\s*\.withFailureHandler\(err => \{\s*if \(!isSilent\) setLoading\(false\);\s*if \(!isSilent\) showToast\('เชื่อมต่อล้มเหลว: ' \+ err\.message, 'error'\);\s*\}\)\s*\.getStudentsList\(getLogUser\(\)\);'''
replacement_load_debtors = "  fetchCachedStudents(isSilent, data => { renderDebtorsList(); });"
content = re.sub(pattern_load_debtors, replacement_load_debtors, content)

# Replace block in loadReceipts
pattern_load_receipts = r'''  if \(!isSilent\) \{\s*setLoading\(true, 'กำลังโหลดข้อมูลประวัติการชำระเงิน\.\.\.'\);\s*\}\s*google\.script\.run\s*\.withSuccessHandler\(data => \{\s*if \(!isSilent\) setLoading\(false\);\s*if \(Array\.isArray\(data\)\) \{\s*state\.students = data;\s*renderReceiptsList\(\);\s*\} else \{\s*if \(!isSilent\) showToast\('ไม่สามารถดึงข้อมูลประวัติการชำระเงินได้', 'error'\);\s*\}\s*\}\)\s*\.withFailureHandler\(err => \{\s*if \(!isSilent\) setLoading\(false\);\s*if \(!isSilent\) showToast\('เชื่อมต่อล้มเหลว: ' \+ err\.message, 'error'\);\s*\}\)\s*\.getStudentsList\(getLogUser\(\)\);'''
replacement_load_receipts = "  fetchCachedStudents(isSilent, data => { renderReceiptsList(); });"
content = re.sub(pattern_load_receipts, replacement_load_receipts, content)

# Replace block in refreshStudentDB
pattern_refresh = r'''  if \(!isSilent\) \{\s*setLoading\(true, 'กำลังโหลดข้อมูลทะเบียนนักเรียน\.\.\.'\);\s*\}\s*google\.script\.run\s*\.withSuccessHandler\(data => \{\s*if \(!isSilent\) setLoading\(false\);\s*if \(Array\.isArray\(data\)\) \{\s*state\.students = data;\s*renderStudentDB\(\);\s*\} else \{\s*if \(!isSilent\) showToast\('ไม่สามารถดึงข้อมูลทะเบียนนักเรียนได้', 'error'\);\s*\}\s*\}\)\s*\.withFailureHandler\(err => \{\s*if \(!isSilent\) setLoading\(false\);\s*if \(!isSilent\) showToast\('ดึงข้อมูลล้มเหลว: ' \+ err\.message, 'error'\);\s*\}\)\s*\.getStudentsList\(getLogUser\(\)\);'''
replacement_refresh = """  // Force fetch by clearing cache if it's an explicit refresh
  if (!isSilent) state.students = [];
  fetchCachedStudents(isSilent, data => { renderStudentDB(); });"""
content = re.sub(pattern_refresh, replacement_refresh, content)

# Replace block in handleLogin
pattern_login = r'''        google\.script\.run\s*\.withSuccessHandler\(data => \{\s*if \(Array\.isArray\(data\)\) \{\s*state\.students = data;\s*console\.log\('Students data pre-loaded'\);\s*\}\s*\}\)\s*\.withFailureHandler\(err => console\.warn\('Failed to pre-load students', err\)\)\s*\.getStudentsList\(getLogUser\(\)\);'''
replacement_login = "        fetchCachedStudents(true, data => { console.log('Students data pre-loaded'); }, err => { console.warn('Failed to pre-load students', err); });"
content = re.sub(pattern_login, replacement_login, content)

with open('src/JavaScript.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacements done.")
