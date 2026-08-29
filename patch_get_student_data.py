import io

with io.open('Code.js', 'r', encoding='utf-8') as f:
    code = f.read()

target = """    if (!row) {

      return { success: false, error: 'ไม่พบข้อมูลนักเรียนชื่อนี้ในฐานข้อมูล' };

    }"""

replacement = """    if (!row) {
      // Fallback: search in all grade sheets if not found in StatusDB
      const allStudents = getStudentsListRaw();
      const s = allStudents.find(st => st.id === id || st.name === searchTerm || st.name === id);
      if (s) {
        const result = {
          id: s.id,
          StudentName: s.name,
          Nickname: s.nickname,
          School: s.school,
          Contact: s.contact,
          LineName: s.lineName,
          LineID: s.lineId,
          ClassType: s.classType,
          Grade: s.grade,
          BranchLearn: s.branchLearn,
          BranchPay: s.branchPay,
          PaymentChannel: s.paymentChannel,
          Course: s.round,
          PaidAmount: s.paid,
          FullAmount: s.full,
          Outstanding: s.outstanding,
          TimeNote: '',
          ExtraNote: '',
          Hours: '',
          HoursLeft: ''
        };
        return { success: true, data: result };
      }
      return { success: false, error: 'ไม่พบข้อมูลนักเรียนชื่อนี้ในฐานข้อมูล' };
    }"""

if target in code:
    code = code.replace(target, replacement)
    with io.open('Code.js', 'w', encoding='utf-8') as f:
        f.write(code)
    print("Patched getStudentData fallback successfully.")
else:
    print("Could not find target in Code.js")
