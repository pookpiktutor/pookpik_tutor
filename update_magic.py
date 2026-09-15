import os
import re

new_js = '''// Function to copy magic link to clipboard
function copyMagicLink(studentName) {
  if (!studentName) {
     Swal.fire('เกิดข้อผิดพลาด', 'ไม่พบชื่อนักเรียน', 'error');
     return;
  }
  try {
    const encoded = btoa(unescape(encodeURIComponent(studentName)));
    let baseUrl = window.location.href.split('?')[0];
    baseUrl = baseUrl.replace(/index\.html$/, '').replace(/\/$/, '');
    const link = baseUrl + '/parent_eval.html?ref=' + encoded;
    
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
}'''

files_to_update = ['src/JavaScript.js', 'index.html', 'public/index.html']
pattern = r'// Function to copy magic link to clipboard.*?Swal\.fire\(\{ icon: \'error\', title: \'เกิดข้อผิดพลาด\', text: \'ไม่สามารถสร้างลิงก์ได้\' \}\);\s*\}'

for f in files_to_update:
    if os.path.exists(f):
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Replace all instances of the old function with the new one
        if re.search(pattern, content, flags=re.DOTALL):
            content = re.sub(pattern, lambda m: new_js, content, flags=re.DOTALL)
            with open(f, 'w', encoding='utf-8') as file:
                file.write(content)
            print(f'Updated {f}')
