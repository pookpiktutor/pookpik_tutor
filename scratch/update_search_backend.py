import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('src/Code.js', 'r', encoding='utf-8') as f:
    content = f.read()

additional_code = '''
// --- Search student registration & unpaid items ---
function searchStudentRegistrationAndUnpaid(studentName) {
  const db = getDb();
  let result = {
    success: true,
    studentInfo: null,
    unpaidItems: []
  };

  if (!studentName || studentName.trim() === '') return result;
  const searchName = studentName.trim().toLowerCase();

  function normalizeName(str) {
    if (!str) return '';
    return str.toString()
      .replace(/^(เด็กชาย|เด็กหญิง|นาย|นางสาว|ด\.ช\.|ด\.ญ\.|ดช\.|ดญ\.)/gi, '')
      .replace(/\\s+/g, '')
      .trim()
      .toLowerCase();
  }

  const normSearchName = normalizeName(searchName);

  const campSheet = db.getSheetByName('ลงทะเบียนค่าย');
  if (campSheet) {
    const data = campSheet.getDataRange().getValues();
    for (let i = data.length - 1; i >= 1; i--) {
      const row = data[i];
      const stdName = String(row[5] || '').trim();
      const normStdName = normalizeName(stdName);

      if (normStdName.includes(normSearchName) || stdName.toLowerCase().includes(searchName)) {
        if (!result.studentInfo) {
          result.studentInfo = {
            name: stdName,
            nickname: row[6] || '',
            parent_phone: row[7] || '',
            school: row[9] || '',
            medical_condition: row[10] || '',
            shirt_size: row[11] || '',
            grade: row[3] || '',
            room: row[4] || ''
          };
        }

        const cName = String(row[1] || '');
        const cGrade = String(row[3] || '');
        const defaultPrice = getCampPrice(cName, cGrade, 'full', 1);
        let full = parseFloat(row[13]);
        if (isNaN(full) || full <= 0) full = defaultPrice.full;
        let paid = parseFloat(row[14]) || 0;
        let remaining = Math.max(0, full - paid);
        let status = String(row[8] || '');

        if (remaining > 0 || status === 'รอตรวจสอบ' || status === 'มัดจำแล้ว') {
          result.unpaidItems.push({
            type: 'camp',
            timestamp: row[0],
            id: 'C' + i,
            name: stdName,
            nickname: row[6] || '',
            campName: cName,
            year: String(row[2] || ''),
            grade: cGrade,
            room: String(row[4] || ''),
            costFull: full,
            paid: paid,
            remaining: remaining,
            status: status || 'มัดจำแล้ว'
          });
        }
      }
    }
  }

  const statusSheet = db.getSheetByName('StatusDB');
  if (statusSheet) {
    const data = statusSheet.getDataRange().getValues();
    const headers = data[0];
    const idIdx = headers.indexOf('ID');
    const nameIdx = headers.indexOf('ชื่อ-นามสกุล');
    const nickIdx = headers.indexOf('ชื่อเล่น');
    const schoolIdx = headers.indexOf('โรงเรียน');
    const phoneIdx = headers.indexOf('เบอร์ติดต่อ');
    const courseIdx = headers.indexOf('สาขาเรียน');
    const costIdx = headers.indexOf('ค่าเรียน');
    const paidIdx = headers.indexOf('ยอดจ่ายมา');
    const remainIdx = headers.indexOf('คงเหลือ');
    
    if (nameIdx !== -1) {
      for (let i = 1; i < data.length; i++) {
        let row = data[i];
        let stdName = String(row[nameIdx] || '').trim();
        let normStdName = normalizeName(stdName);
        if (normStdName.includes(normSearchName) || stdName.toLowerCase().includes(searchName)) {
           if (!result.studentInfo) {
             result.studentInfo = {
               name: stdName,
               nickname: nickIdx !== -1 ? String(row[nickIdx] || '') : '',
               parent_phone: phoneIdx !== -1 ? String(row[phoneIdx] || '') : '',
               school: schoolIdx !== -1 ? String(row[schoolIdx] || '') : '',
               medical_condition: '',
               shirt_size: '',
               grade: '',
               room: ''
             };
           }

           let cost = costIdx !== -1 ? (parseFloat(row[costIdx]) || 0) : 0;
           let paid = paidIdx !== -1 ? (parseFloat(row[paidIdx]) || 0) : 0;
           let remaining = remainIdx !== -1 ? (parseFloat(row[remainIdx]) || 0) : Math.max(0, cost - paid);
           if (remaining > 0) {
             result.unpaidItems.push({
                type: 'regular',
                id: idIdx !== -1 ? (row[idIdx] || ('R' + i)) : ('R' + i),
                rowIndex: i + 1,
                name: stdName,
                course: courseIdx !== -1 ? String(row[courseIdx] || '-') : '-',
                costFull: cost,
                paid: paid,
                remaining: remaining,
                status: 'ค้างชำระ'
             });
           }
        }
      }
    }
  }

  return result;
}
'''

# Update searchStudentRegistrationAndUnpaid in src/Code.js & Code.js
for target in ['src/Code.js', 'Code.js']:
    with open(target, 'r', encoding='utf-8') as f:
        c = f.read()
    if 'function searchStudentRegistrationAndUnpaid' not in c:
        c += '\n' + additional_code
        with open(target, 'w', encoding='utf-8') as f:
            f.write(c)
        print(f'Added searchStudentRegistrationAndUnpaid to {target}')
