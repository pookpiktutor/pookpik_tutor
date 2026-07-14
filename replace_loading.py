import re

with open('g:/My Drive/0.งานสถาบัน/data_PookPik_Tutor/JavaScript.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace saveClassLog
target_save = r"""  setLoading\(true, 'กำลังบันทึกข้อมูลคลาสเรียน\.\.\.'\);
  const user = getLogUser\(\);

  if \(modalState\.editingIndex !== -1\) \{
    // Edit mode
    logData\.rowIndex = modalState\.editingIndex;
    google\.script\.run
      \.withSuccessHandler\(res => \{
        setLoading\(false\);
        if \(res && res\.success\) \{
          showToast\('แก้ไขข้อมูลคลาสเรียนสำเร็จแล้ว!', 'success'\);
          closeClassLogModal\(\);"""

replace_save = """  showToast('กำลังบันทึกข้อมูล...', 'info');
  const user = getLogUser();
  closeClassLogModal();

  if (modalState.editingIndex !== -1) {
    // Edit mode
    logData.rowIndex = modalState.editingIndex;
    google.script.run
      .withSuccessHandler(res => {
        if (res && res.success) {
          showToast('แก้ไขข้อมูลคลาสเรียนสำเร็จแล้ว!', 'success');"""

target_save_err = r"""        \} else \{
          showToast\('บันทึกล้มเหลว: ' \+ res\.error, 'error'\);
        \}
      \}\)
      \.withFailureHandler\(err => \{
        setLoading\(false\);
        showToast\('เชื่อมต่อล้มเหลว: ' \+ err\.message, 'error'\);
      \}\)"""

replace_save_err = """        } else {
          showToast('บันทึกล้มเหลว: ' + res.error, 'error');
        }
      })
      .withFailureHandler(err => {
        showToast('เชื่อมต่อล้มเหลว: ' + err.message, 'error');
      })"""

target_add = r"""  \} else \{
    // Add mode
    google\.script\.run
      \.withSuccessHandler\(res => \{
        setLoading\(false\);
        if \(res && res\.success\) \{
          showToast\('บันทึกคลาสเรียนใหม่สำเร็จแล้ว!', 'success'\);
          closeClassLogModal\(\);"""

replace_add = """  } else {
    // Add mode
    google.script.run
      .withSuccessHandler(res => {
        if (res && res.success) {
          showToast('บันทึกคลาสเรียนใหม่สำเร็จแล้ว!', 'success');"""


target_recurring = r"""function saveRecurringClassDirectly\(logData\) \{
  setLoading\(true, 'กำลังบันทึกคลาสเรียนซ้ำ\.\.\.'\);
  const user = getLogUser\(\);
  const startDateStr = document\.getElementById\('class_date'\)\.value;
  const endDateStr = document\.getElementById\('class_recurring_end_date'\)\.value;
  
  if \(!startDateStr || !endDateStr\) \{
    showToast\('กรุณาระบุวันที่เริ่มต้นและสิ้นสุดของคอร์ส', 'error'\);
    setLoading\(false\);
    return;
  \}"""

replace_recurring = """function saveRecurringClassDirectly(logData) {
  const startDateStr = document.getElementById('class_date').value;
  const endDateStr = document.getElementById('class_recurring_end_date').value;
  
  if (!startDateStr || !endDateStr) {
    showToast('กรุณาระบุวันที่เริ่มต้นและสิ้นสุดของคอร์ส', 'error');
    return;
  }
  
  showToast('กำลังบันทึกคลาสเรียนซ้ำ...', 'info');
  closeClassLogModal();
  const user = getLogUser();"""


target_recurring_success = r"""  google\.script\.run
    \.withSuccessHandler\(res => \{
      setLoading\(false\);
      if \(res && res\.success\) \{
        showToast\('บันทึกคลาสเรียนซ้ำสำเร็จแล้ว!', 'success'\);
        closeClassLogModal\(\);"""

replace_recurring_success = """  google.script.run
    .withSuccessHandler(res => {
      if (res && res.success) {
        showToast('บันทึกคลาสเรียนซ้ำสำเร็จแล้ว!', 'success');"""


content = re.sub(target_save, replace_save, content, flags=re.MULTILINE)
content = re.sub(target_save_err, replace_save_err, content, flags=re.MULTILINE)
content = re.sub(target_add, replace_add, content, flags=re.MULTILINE)
content = re.sub(target_recurring, replace_recurring, content, flags=re.MULTILINE)
content = re.sub(target_recurring_success, replace_recurring_success, content, flags=re.MULTILINE)

with open('g:/My Drive/0.งานสถาบัน/data_PookPik_Tutor/JavaScript.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replaced loading toasts!")
