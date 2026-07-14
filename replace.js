const fs = require('fs');
let code = fs.readFileSync('g:/My Drive/0.งานสถาบัน/data_PookPik_Tutor/JavaScript.html', 'utf8');
let beforeLength = code.length;

// Replacing inside saveClassLog
code = code.replace(
`  setLoading(true, 'กำลังบันทึกข้อมูลคลาสเรียน...');
  const user = getLogUser();

  if (modalState.editingIndex !== -1) {
    // Edit mode
    logData.rowIndex = modalState.editingIndex;
    google.script.run
      .withSuccessHandler(res => {
        setLoading(false);
        if (res && res.success) {
          showToast('แก้ไขข้อมูลคลาสเรียนสำเร็จแล้ว!', 'success');
          closeClassLogModal();`,

`  showToast('กำลังบันทึกข้อมูลในพื้นหลัง...', 'info');
  const user = getLogUser();
  closeClassLogModal();

  if (modalState.editingIndex !== -1) {
    // Edit mode
    logData.rowIndex = modalState.editingIndex;
    google.script.run
      .withSuccessHandler(res => {
        if (res && res.success) {
          showToast('แก้ไขข้อมูลคลาสเรียนสำเร็จแล้ว!', 'success');`
);

code = code.replace(
`        } else {
          showToast('บันทึกล้มเหลว: ' + res.error, 'error');
        }
      })
      .withFailureHandler(err => {
        setLoading(false);
        showToast('เชื่อมต่อล้มเหลว: ' + err.message, 'error');
      })`,

`        } else {
          showToast('บันทึกล้มเหลว: ' + res.error, 'error');
        }
      })
      .withFailureHandler(err => {
        showToast('เชื่อมต่อล้มเหลว: ' + err.message, 'error');
      })`
);

code = code.replace(
`  } else {
    // Add mode
    google.script.run
      .withSuccessHandler(res => {
        setLoading(false);
        if (res && res.success) {
          showToast('บันทึกคลาสเรียนใหม่สำเร็จแล้ว!', 'success');
          closeClassLogModal();`,

`  } else {
    // Add mode
    google.script.run
      .withSuccessHandler(res => {
        if (res && res.success) {
          showToast('บันทึกคลาสเรียนใหม่สำเร็จแล้ว!', 'success');`
);


code = code.replace(
`function saveRecurringClassDirectly(logData) {
  setLoading(true, 'กำลังบันทึกคลาสเรียนซ้ำ...');
  const user = getLogUser();`,

`function saveRecurringClassDirectly(logData) {
  showToast('กำลังบันทึกคลาสเรียนซ้ำในพื้นหลัง...', 'info');
  closeClassLogModal();
  const user = getLogUser();`
);

code = code.replace(
`  google.script.run
    .withSuccessHandler(res => {
      setLoading(false);
      if (res && res.success) {
        showToast('บันทึกคลาสเรียนซ้ำสำเร็จแล้ว!', 'success');
        closeClassLogModal();`,

`  google.script.run
    .withSuccessHandler(res => {
      if (res && res.success) {
        showToast('บันทึกคลาสเรียนซ้ำสำเร็จแล้ว!', 'success');`
);

fs.writeFileSync('g:/My Drive/0.งานสถาบัน/data_PookPik_Tutor/JavaScript.html', code);
console.log('Replaced successfully. Length went from ' + beforeLength + ' to ' + code.length);
