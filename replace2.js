const fs = require('fs');
let code = fs.readFileSync('g:/My Drive/0.งานสถาบัน/data_PookPik_Tutor/JavaScript.html', 'utf8');
let beforeLength = code.length;

// Using regex with \s* to ignore whitespace differences
code = code.replace(/setLoading\(true,\s*'กำลังบันทึกข้อมูลคลาสเรียน\.\.\.'\);/g, "showToast('กำลังบันทึกข้อมูลในพื้นหลัง...', 'info');\n  closeClassLogModal();");

code = code.replace(/setLoading\(true,\s*'กำลังบันทึกคลาสเรียนซ้ำ\.\.\.'\);/g, "showToast('กำลังบันทึกคลาสเรียนซ้ำในพื้นหลัง...', 'info');\n  closeClassLogModal();");

// We also need to remove setLoading(false); and closeClassLogModal(); inside the callbacks if they exist.
// Let's just remove setLoading(false); entirely from the success/failure handlers of saveClassLog.
// Wait, I can just find `setLoading(false);` near `showToast('บันทึกคลาสเรียนใหม่สำเร็จแล้ว!'` and remove it.

code = code.replace(/setLoading\(false\);\s*if \(res && res\.success\)\s*\{\s*showToast\('บันทึกคลาสเรียนใหม่สำเร็จแล้ว!', 'success'\);\s*closeClassLogModal\(\);/g,
  "if (res && res.success) {\n          showToast('บันทึกคลาสเรียนใหม่สำเร็จแล้ว!', 'success');");

code = code.replace(/setLoading\(false\);\s*if \(res && res\.success\)\s*\{\s*showToast\('แก้ไขข้อมูลคลาสเรียนสำเร็จแล้ว!', 'success'\);\s*closeClassLogModal\(\);/g,
  "if (res && res.success) {\n          showToast('แก้ไขข้อมูลคลาสเรียนสำเร็จแล้ว!', 'success');");

code = code.replace(/setLoading\(false\);\s*if \(res && res\.success\)\s*\{\s*showToast\('บันทึกคลาสเรียนซ้ำสำเร็จแล้ว!', 'success'\);\s*closeClassLogModal\(\);/g,
  "if (res && res.success) {\n        showToast('บันทึกคลาสเรียนซ้ำสำเร็จแล้ว!', 'success');");

code = code.replace(/setLoading\(false\);\s*showToast\('เชื่อมต่อล้มเหลว: '/g, "showToast('เชื่อมต่อล้มเหลว: '");

fs.writeFileSync('g:/My Drive/0.งานสถาบัน/data_PookPik_Tutor/JavaScript.html', code);
console.log('Replaced successfully. Length went from ' + beforeLength + ' to ' + code.length);
