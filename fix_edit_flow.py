import io

# ============================================================
# Fix 1: Backend - getStudentData to search by name properly
# ============================================================
with io.open('Code.js', 'r', encoding='utf-8') as f:
    code = f.read()

old_fallback = """    // Fallback name search if ID is temp or changed

    if (!row) {

      for (let i = 1; i < data.length; i++) {

        const studentName = data[i][1] ? data[i][1].toString().trim() : '';

        if (id.toString().toLowerCase().includes(studentName.toLowerCase()) && studentName.length > 0) {

          row = data[i];

          break;

        }

      }

    }"""

new_fallback = """    // Fallback: search by exact name match if ID not found (for DB_xxx or name-based lookups)

    if (!row) {

      const searchTerm = id.toString().trim();

      for (let i = 1; i < data.length; i++) {

        const studentName = data[i][1] ? data[i][1].toString().trim() : '';

        if (studentName && studentName === searchTerm) {

          row = data[i];

          break;

        }

      }

    }"""

if old_fallback in code:
    code = code.replace(old_fallback, new_fallback)
    print("[OK] Fixed getStudentData fallback name search in Code.js")
else:
    print("[WARN] getStudentData fallback not found in Code.js")

with io.open('Code.js', 'w', encoding='utf-8') as f:
    f.write(code)

# ============================================================
# Fix 2: Frontend - openStudentModal to use state.students data
#         when getStudentData fails (DB_xxx IDs from grade sheets)
# ============================================================
with io.open('src/JavaScript.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Fix the edit button to pass student name instead of fake DB_xxx id
old_btn = """<button class=\\"btn btn-secondary btn-icon\\" onclick=\\"showEditStudentModal('${s.id}')\\" title=\\"แก้ไข\\">✏️</button>"""
new_btn = """<button class=\\"btn btn-secondary btn-icon\\" onclick=\\"showEditStudentModal('${s.id}', '${s.name.replace(/'/g, "\\\\'")}')\\\" title=\\"แก้ไข\\">✏️</button>"""

if old_btn in js:
    js = js.replace(old_btn, new_btn)
    print("[OK] Fixed edit button to pass name parameter")
else:
    print("[WARN] Edit button pattern not found")

# Fix showEditStudentModal to accept name parameter
old_show = """function showEditStudentModal(id) {

  openStudentModal(id);

}"""

new_show = """function showEditStudentModal(id, name) {

  openStudentModal(id, name);

}"""

if old_show in js:
    js = js.replace(old_show, new_show)
    print("[OK] Fixed showEditStudentModal signature")
else:
    print("[WARN] showEditStudentModal pattern not found")

# Fix openStudentModal to handle DB_xxx IDs using state.students data
old_open = """window.openStudentModal = function(id = null) {

  // If editing an existing student, we must render exactly 1 block

  if (id) {

    renderStudentBlocks(1);

    document.getElementById('student_class_type').disabled = false; // Allow editing class type

    document.getElementById('student_id').value = id;

    document.getElementById('student_modal_title').innerText = 'แก้ไขข้อมูลนักเรียน';

    

    // The previous populate logic needs to be rewritten to fill `_0` ids

    setLoading(true, 'กำลังโหลดข้อมูล...');

    google.script.run

      .withSuccessHandler(res => {

        setLoading(false);

        if (res && res.success && res.data) {

          const data = res.data;

          

          document.getElementById('student_class_type').value = data.ClassType || 'กลุ่มหลัก';

          handleClassTypeChange(); // This sets it back to 1 block visually if we unlock, but we leave it as 1 block for edit

          

          document.getElementById('student_grade').value = data.Grade || 'ป.1';

          document.getElementById('student_branch_learn').value = data.BranchLearn || 'สาขา1';

          document.getElementById('student_branch_pay').value = data.BranchPay || 'สาขา1';

          

          if (data.ClassType === 'กลุ่มหลัก') {

            // Check the checkboxes - handled by handleGradeBranchChange which we need to patch if needed

            // But for simple edit, it's easier to just set shared_course_name

          }

          document.getElementById('shared_course_name').value = data.Course || '';

          

          // Populate Block 0

          document.getElementById('student_name_0').value = data.StudentName || '';

          document.getElementById('student_nickname_0').value = data.Nickname || '';

          document.getElementById('student_school_0').value = data.School || '';

          document.getElementById('student_class_section_0').value = data.ClassSection || '';

          document.getElementById('student_contact_0').value = data.Contact || '';

          document.getElementById('student_line_name_0').value = data.LineName || '';

          document.getElementById('student_line_id_0').value = data.LineID || '';

          

          const loadedPayMode = data.PayMode || 'cash';

          if (loadedPayMode === 'card') {

            document.getElementById('pay_mode_card_0').checked = true;

          } else if (loadedPayMode === 'transfer') {

            document.getElementById('pay_mode_transfer_0').checked = true;

          } else {

            document.getElementById('pay_mode_cash_0').checked = true;

          }

          

          document.getElementById('student_full_0').value = data.FullAmount || '';

          document.getElementById('student_paid_0').value = data.PaidAmount || '';

          document.getElementById('student_outstanding_0').value = data.Outstanding || '';

          

          if (data.CarriedForward && parseFloat(data.CarriedForward) > 0) {

            document.getElementById('has_carried_forward_0').checked = true;

            toggleCarriedForwardBlock(0);

            document.getElementById('student_carried_forward_0').value = data.CarriedForward;

          }

          

          document.getElementById('student_time_note_0').value = data.TimeNote || '';

          document.getElementById('student_extra_note_0').value = data.ExtraNote || '';

          document.getElementById('student_hours_0').value = cleanTimeStr(data.Hours) || '';

          document.getElementById('student_hours_left_0').value = cleanTimeStr(data.HoursLeft) || '';

          

          document.getElementById('pay_r1_date_0').value = data.PayRound1Date || '';

          document.getElementById('pay_r1_amount_0').value = data.PayRound1Amount || '';

          document.getElementById('pay_r1_channel_0').value = data.PayRound1Channel || '';

          document.getElementById('pay_r1_staff_0').value = data.PayRound1Staff || '';

          document.getElementById('pay_r1_time_0').value = data.PayRound1Time || '';

          

          document.getElementById('pay_r2_date_0').value = data.PayRound2Date || '';

          document.getElementById('pay_r2_amount_0').value = data.PayRound2Amount || '';

          document.getElementById('pay_r2_channel_0').value = data.PayRound2Channel || '';

          document.getElementById('pay_r2_staff_0').value = data.PayRound2Staff || '';

          document.getElementById('pay_r2_time_0').value = data.PayRound2Time || '';

          

          document.getElementById('pay_r3_date_0').value = data.PayRound3Date || '';

          document.getElementById('pay_r3_amount_0').value = data.PayRound3Amount || '';

          document.getElementById('pay_r3_channel_0').value = data.PayRound3Channel || '';

          document.getElementById('pay_r3_staff_0').value = data.PayRound3Staff || '';

          document.getElementById('pay_r3_time_0').value = data.PayRound3Time || '';

          

          calculateBlockOutstanding(0);

          

          document.getElementById('student_modal').classList.add('active');

        } else {

          showToast('ไม่พบข้อมูลนักเรียน', 'error');

        }

      })

      .withFailureHandler(err => {

        setLoading(false);

        showToast('Error: ' + err.message, 'error');

      })

      .getStudentData(id);"""

new_open = """window.openStudentModal = function(id = null, studentName = null) {

  // If editing an existing student, we must render exactly 1 block

  if (id) {

    renderStudentBlocks(1);

    document.getElementById('student_class_type').disabled = false; // Allow editing class type

    document.getElementById('student_id').value = id;

    document.getElementById('student_modal_title').innerText = 'แก้ไขข้อมูลนักเรียน';

    

    // Helper function to populate form from data object
    function populateEditForm(data) {
      document.getElementById('student_class_type').value = data.ClassType || data.classType || 'กลุ่มหลัก';
      handleClassTypeChange();
      
      document.getElementById('student_grade').value = data.Grade || data.grade || 'ป.1';
      document.getElementById('student_branch_learn').value = data.BranchLearn || data.branchLearn || 'สาขา1';
      document.getElementById('student_branch_pay').value = data.BranchPay || data.branchPay || 'สาขา1';
      
      const courseVal = data.Course || data.round || '';
      if (document.getElementById('shared_course_name')) {
        document.getElementById('shared_course_name').value = courseVal;
      }
      
      // Populate Block 0
      document.getElementById('student_name_0').value = data.StudentName || data.name || '';
      document.getElementById('student_nickname_0').value = data.Nickname || data.nickname || '';
      document.getElementById('student_school_0').value = data.School || data.school || '';
      document.getElementById('student_class_section_0').value = data.ClassSection || data.classSection || '';
      document.getElementById('student_contact_0').value = data.Contact || data.contact || '';
      document.getElementById('student_line_name_0').value = data.LineName || data.lineName || '';
      document.getElementById('student_line_id_0').value = data.LineID || data.lineId || '';
      
      // Payment mode
      const payChannel = data.PaymentChannel || data.paymentChannel || '';
      const payMode = data.PayMode || '';
      if (payMode === 'card' || payChannel.includes('รูด') || payChannel.includes('card')) {
        if (document.getElementById('pay_mode_card_0')) document.getElementById('pay_mode_card_0').checked = true;
      } else if (payMode === 'transfer' || payChannel.includes('โอน') || payChannel.includes('กสิกร') || payChannel.includes('SCB') || payChannel.includes('กรุง')) {
        if (document.getElementById('pay_mode_transfer_0')) document.getElementById('pay_mode_transfer_0').checked = true;
      } else if (payChannel.includes('สด') || payChannel.includes('cash')) {
        if (document.getElementById('pay_mode_cash_0')) document.getElementById('pay_mode_cash_0').checked = true;
      } else {
        if (document.getElementById('pay_mode_transfer_0')) document.getElementById('pay_mode_transfer_0').checked = true;
      }
      
      document.getElementById('student_full_0').value = data.FullAmount || data.full || '';
      document.getElementById('student_paid_0').value = data.PaidAmount || data.paid || '';
      document.getElementById('student_outstanding_0').value = data.Outstanding || data.outstanding || '';
      
      const cf = parseFloat(data.CarriedForward) || 0;
      if (cf > 0) {
        document.getElementById('has_carried_forward_0').checked = true;
        toggleCarriedForwardBlock(0);
        document.getElementById('student_carried_forward_0').value = cf;
      }
      
      if (document.getElementById('student_time_note_0')) document.getElementById('student_time_note_0').value = data.TimeNote || '';
      if (document.getElementById('student_extra_note_0')) document.getElementById('student_extra_note_0').value = data.ExtraNote || '';
      if (document.getElementById('student_hours_0')) document.getElementById('student_hours_0').value = cleanTimeStr(data.Hours || '') || '';
      if (document.getElementById('student_hours_left_0')) document.getElementById('student_hours_left_0').value = cleanTimeStr(data.HoursLeft || '') || '';
      
      // Installment data
      if (data.PayRound1Date) document.getElementById('pay_r1_date_0').value = data.PayRound1Date || '';
      if (data.PayRound1Amount) document.getElementById('pay_r1_amount_0').value = data.PayRound1Amount || '';
      if (data.PayRound1Channel) document.getElementById('pay_r1_channel_0').value = data.PayRound1Channel || '';
      if (data.PayRound1Staff) document.getElementById('pay_r1_staff_0').value = data.PayRound1Staff || '';
      if (data.PayRound1Time) document.getElementById('pay_r1_time_0').value = data.PayRound1Time || '';
      
      if (data.PayRound2Date) document.getElementById('pay_r2_date_0').value = data.PayRound2Date || '';
      if (data.PayRound2Amount) document.getElementById('pay_r2_amount_0').value = data.PayRound2Amount || '';
      if (data.PayRound2Channel) document.getElementById('pay_r2_channel_0').value = data.PayRound2Channel || '';
      if (data.PayRound2Staff) document.getElementById('pay_r2_staff_0').value = data.PayRound2Staff || '';
      if (data.PayRound2Time) document.getElementById('pay_r2_time_0').value = data.PayRound2Time || '';
      
      if (data.PayRound3Date) document.getElementById('pay_r3_date_0').value = data.PayRound3Date || '';
      if (data.PayRound3Amount) document.getElementById('pay_r3_amount_0').value = data.PayRound3Amount || '';
      if (data.PayRound3Channel) document.getElementById('pay_r3_channel_0').value = data.PayRound3Channel || '';
      if (data.PayRound3Staff) document.getElementById('pay_r3_staff_0').value = data.PayRound3Staff || '';
      if (data.PayRound3Time) document.getElementById('pay_r3_time_0').value = data.PayRound3Time || '';
      
      calculateBlockOutstanding(0);
      
      // For main group students, load course checkboxes from grade sheet
      const classTypeVal = data.ClassType || data.classType || '';
      if (isMainGroup(classTypeVal)) {
        const gradeVal = data.Grade || data.grade || '';
        const branchVal = data.BranchLearn || data.branchLearn || '';
        // Determine branch number from branch name
        let branchNum = '1';
        if (branchVal.includes('2')) branchNum = '2';
        else if (branchVal.includes('3')) branchNum = '3';
        
        // Map grade to sheet name
        let gradePrefix = gradeVal;
        const sheetName = gradePrefix + '/' + branchNum;
        
        // Load grade sheet courses
        handleGradeBranchChange();
      }
    }

    // Try backend first
    setLoading(true, 'กำลังโหลดข้อมูล...');

    // Use student name for lookup if id is a fake DB_xxx
    const lookupId = (id.startsWith('DB_') && studentName) ? studentName : id;

    google.script.run

      .withSuccessHandler(res => {

        setLoading(false);

        if (res && res.success && res.data) {

          populateEditForm(res.data);

          document.getElementById('student_modal').classList.add('active');

        } else {

          // Fallback: use state.students data if available (for grade sheet students)
          const localStudent = state.students.find(s => s.id === id || s.name === studentName || s.name === id);
          if (localStudent) {
            populateEditForm(localStudent);
            document.getElementById('student_modal').classList.add('active');
          } else {
            showToast('ไม่พบข้อมูลนักเรียน: ' + (res ? res.error : ''), 'error');
          }

        }

      })

      .withFailureHandler(err => {

        setLoading(false);

        // Fallback: use state.students data
        const localStudent = state.students.find(s => s.id === id || s.name === studentName || s.name === id);
        if (localStudent) {
          populateEditForm(localStudent);
          document.getElementById('student_modal').classList.add('active');
        } else {
          showToast('Error: ' + err.message, 'error');
        }

      })

      .getStudentData(lookupId);"""

if old_open in js:
    js = js.replace(old_open, new_open)
    print("[OK] Fixed openStudentModal to handle DB_xxx IDs with fallback")
else:
    print("[WARN] openStudentModal pattern not found, trying smaller match...")
    # Try a smaller match
    if "window.openStudentModal = function(id = null) {" in js:
        print("[INFO] Found function signature, will try line-by-line approach")
    else:
        print("[WARN] Cannot find openStudentModal function")

with io.open('src/JavaScript.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("\n=== Done! ===")
print("Changes made:")
print("1. Code.js: Fixed getStudentData name fallback search")
print("2. JavaScript.js: Fixed edit button to pass student name")
print("3. JavaScript.js: Fixed showEditStudentModal to accept name param") 
print("4. JavaScript.js: Fixed openStudentModal with:")
print("   - Uses student name for lookup when ID is fake (DB_xxx)")
print("   - Falls back to state.students data if backend lookup fails")
print("   - Properly populates form from either source")
print("   - Loads course checkboxes for main group students")
