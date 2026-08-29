import re

with open('src/JavaScript.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update net pay and fields in renderTeacherSalaryDetail
# Find: document.getElementById('teacher_salary_net_pay').innerText = 'รายได้สุทธิ: ฿' + (res.totalPay || 0).toLocaleString();
# Replace it to update netPay, and all adjustment fields
replacement = """
  document.getElementById('teacher_salary_net_pay').innerText = 'รายได้สุทธิ: ฿' + (res.netPay !== undefined ? res.netPay : res.totalPay || 0).toLocaleString();
  
  if (document.getElementById('ts_adj_bonus')) {
    document.getElementById('ts_adj_bonus').innerText = '฿' + (res.adjustmentBonus || 0).toLocaleString();
    document.getElementById('ts_adj_deduction').innerText = '฿' + (res.adjustmentDeduction || 0).toLocaleString();
    document.getElementById('ts_adj_insurance').innerText = '฿' + (res.insuranceDeduction || 0).toLocaleString();
    if (res.isNewTeacher) {
      document.getElementById('ts_adj_insurance_progress').innerText = '(สะสม: ' + (res.insuranceRunningTotal || 0).toLocaleString() + ' / 2,000)';
    } else {
      document.getElementById('ts_adj_insurance_progress').innerText = '(ครูเก่า: ไม่หักประกัน)';
    }
  }
"""
content = re.sub(r"document\.getElementById\('teacher_salary_net_pay'\)\.innerText\s*=\s*'รายได้สุทธิ:\s*฿'\s*\+\s*\(res\.totalPay\s*\|\|\s*0\)\.toLocaleString\(\);", replacement.strip(), content)

# 2. Add Modal Logic functions
modal_funcs = """

// ============================================
// Teacher Adjustments (Bonus / Deduction) Logic
// ============================================
function openTeacherAdjustmentModal() {
  const modal = document.getElementById('teacher_adjustment_modal');
  if (modal) {
    modal.style.display = 'flex';
    document.getElementById('adj_modal_amount').value = '';
    document.getElementById('adj_modal_note').value = '';
  }
}

function closeTeacherAdjustmentModal() {
  const modal = document.getElementById('teacher_adjustment_modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function submitTeacherAdjustment() {
  const type = document.getElementById('adj_modal_type').value;
  const amount = parseFloat(document.getElementById('adj_modal_amount').value);
  const note = document.getElementById('adj_modal_note').value;
  
  if (isNaN(amount) || amount <= 0) {
    Swal.fire('ข้อผิดพลาด', 'กรุณาระบุจำนวนเงินให้ถูกต้อง (มากกว่า 0)', 'error');
    return;
  }
  
  const monthPicker = document.getElementById('teacher_salary_month_picker');
  const yearPicker = document.getElementById('teacher_salary_year_picker');
  
  if (!monthPicker || !yearPicker) return;
  
  const selectedMonth = parseInt(monthPicker.value);
  const selectedYear = parseInt(yearPicker.value);
  
  const data = {
    month: selectedMonth,
    year: selectedYear,
    type: type,
    amount: amount,
    note: note
  };
  
  setLoading(true, 'กำลังบันทึกรายการ...');
  google.script.run
    .withSuccessHandler(res => {
      setLoading(false);
      if (res && res.success) {
        closeTeacherAdjustmentModal();
        Swal.fire({
          title: 'สำเร็จ!',
          text: 'บันทึกรายการเรียบร้อยแล้ว ระบบกำลังคำนวณเงินเดือนใหม่',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        // Reload data
        loadTeacherYearlySalary();
      } else {
        Swal.fire('ข้อผิดพลาด', 'ไม่สามารถบันทึกได้: ' + (res ? res.error : 'Unknown Error'), 'error');
      }
    })
    .withFailureHandler(err => {
      setLoading(false);
      Swal.fire('ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการเชื่อมต่อ: ' + err.message, 'error');
    })
    .saveTeacherAdjustment(data, state.username);
}

"""

if 'openTeacherAdjustmentModal' not in content:
    content += modal_funcs

with open('src/JavaScript.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("src/JavaScript.js patched")
