
// Function to copy magic link to clipboard
function copyMagicLink(studentName) {
  if (!studentName) {
     Swal.fire('เกิดข้อผิดพลาด', 'ไม่พบชื่อนักเรียน', 'error');
     return;
  }
  try {
    const encoded = btoa(unescape(encodeURIComponent(studentName)));
    let baseUrl = window.location.href.split('?')[0];
    baseUrl = baseUrl.replace(/index\.html$/, '').replace(/\/$/, '');
    const v = new Date().getTime();
      const link = baseUrl + '/parent_eval.html?ref=' + encodeURIComponent(encoded) + '&v=' + v;
    
    const fallbackCopy = () => {
      Swal.fire({
        icon: 'success',
        title: 'สร้างลิงก์สำเร็จ',
        html: `ลิงก์สำหรับน้อง <b>${studentName}</b>:<br><br><input type="text" id="swal-input1" class="swal2-input" value="${link}" readonly style="width:90%; font-size:14px; text-align:center;">`,
        confirmButtonText: 'ปิด',
        didOpen: () => {
          const input = Swal.getPopup().querySelector('#swal-input1');
          input.select();
          try { document.execCommand('copy'); } catch(e){}
        }
      });
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(link).then(() => {
        Swal.fire({
          icon: 'success',
          title: 'คัดลอกลิงก์สำเร็จ!',
          html: `ลิงก์ของน้อง <b>${studentName}</b> ถูกคัดลอกลงในคลิปบอร์ดแล้ว<br><br><input type="text" class="swal2-input" value="${link}" readonly style="width:90%; font-size:14px; text-align:center; color:#64748b; background:#f8fafc;">`,
          confirmButtonText: 'ตกลง'
        });
      }).catch(err => {
        console.error('Clipboard write failed', err);
        fallbackCopy();
      });
    } else {
      fallbackCopy();
    }
  } catch(e) {
    console.error('Error creating magic link', e);
    Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: 'ไม่สามารถสร้างลิงก์ได้' });
  }
}
