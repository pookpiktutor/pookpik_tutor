import re
c = open('index.html', 'r', encoding='utf-8').read()

# Add Staff and proper Time to student block
rep_inputs = """
          <div class="form-group">
            <label class="form-label">เวลาชำระเงิน</label>
            <input type="time" id="student_payment_time_${idx}" class="form-input">
          </div>
          <div class="form-group">
            <label class="form-label">ผู้รับเงิน (Staff)</label>
            <input type="text" id="student_staff_${idx}" class="form-input" placeholder="ชื่อพนักงาน">
          </div>
          <div class="form-group">
            <label class="form-label">หมายเหตุการชำระเงิน</label>
            <input type="text" id="student_time_note_${idx}" class="form-input" placeholder="เช่น ชำระสิ้นเดือน">
          </div>
"""
c = re.sub(r'<div class="form-group">\s*<label class="form-label">หมายเหตุการชำระเงิน/เวลา</label>\s*<input type="text" id="student_time_note_\$\{idx\}" class="form-input" placeholder="เช่น ชำระสิ้นเดือน, เรียน 17.00-19.00">\s*</div>', rep_inputs, c)

# Add to saveStudent payload
rep_payload = """      paymentDate: document.getElementById(`student_date_${idx}`).value,
      paymentTime: document.getElementById(`student_payment_time_${idx}`) ? document.getElementById(`student_payment_time_${idx}`).value : '',
      staff: document.getElementById(`student_staff_${idx}`) ? document.getElementById(`student_staff_${idx}`).value.trim() : (state.currentUser ? state.currentUser.username : 'System'),
      paymentTimeNote: document.getElementById(`student_time_note_${idx}`).value.trim(),"""
c = re.sub(r'paymentDate: document\.getElementById\(`student_date_\$\{idx\}`\)\.value,\s*paymentTimeNote: document\.getElementById\(`student_time_note_\$\{idx\}`\)\.value\.trim\(\),', rep_payload, c)

open('index.html', 'w', encoding='utf-8').write(c)
print('Updated student registration block with time and staff inputs')
