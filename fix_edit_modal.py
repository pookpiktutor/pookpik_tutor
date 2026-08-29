import io

with io.open('src/JavaScript.js', 'r', encoding='utf-8') as f:
    c = f.read()

old_code = '''  if (match) {

    showEditStudentModal(match.id);

  } else {'''

new_code = '''  if (match) {

    // Pass the name instead of the ID because the ID might be a fake 'DB_xxx' ID from Grade Sheets.
    // getStudentData in backend has a fallback to search by name if ID is not found.
    showEditStudentModal(match.name);

  } else {'''

if old_code in c:
    c = c.replace(old_code, new_code)
    print("[OK] Replaced in src/JavaScript.js")
else:
    print("[WARN] Target not found in src/JavaScript.js")

with io.open('src/JavaScript.js', 'w', encoding='utf-8') as f:
    f.write(c)
