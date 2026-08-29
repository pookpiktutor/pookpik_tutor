import io

with io.open('Code.js', 'r', encoding='utf-8') as f:
    code = f.read()

old = "      const id = 'DB_' + studentIdCounter++;"
new = """      const sheetStudentId = row[18] ? row[18].toString().trim() : '';
      const id = sheetStudentId || ('DB_' + studentIdCounter++);"""

if old in code:
    code = code.replace(old, new)
    print("[OK] Replaced in Code.js")
else:
    print("[WARN] Not found in Code.js")
    
with io.open('Code.js', 'w', encoding='utf-8') as f:
    f.write(code)
