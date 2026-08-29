import io

with io.open('Code.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Update getStudentsListRaw to use the Student ID from column S (index 18)
old_id = """      const rawDiscount = parseFloat(row[11]) || 0;

      const rawPaid = parseFloat(row[13]) || 0;

      const calcOutstanding = calcFull - rawDiscount - rawPaid;

      

      const id = 'DB_' + studentIdCounter++;"""

new_id = """      const rawDiscount = parseFloat(row[11]) || 0;

      const rawPaid = parseFloat(row[13]) || 0;

      const calcOutstanding = calcFull - rawDiscount - rawPaid;

      

      const sheetStudentId = row[18] ? row[18].toString().trim() : '';
      const id = sheetStudentId || ('DB_' + studentIdCounter++);"""

if old_id in code:
    code = code.replace(old_id, new_id)
    print("[OK] Updated getStudentsListRaw to use real ID from sheet")
else:
    print("[WARN] getStudentsListRaw ID assignment not found")

with io.open('Code.js', 'w', encoding='utf-8') as f:
    f.write(code)

