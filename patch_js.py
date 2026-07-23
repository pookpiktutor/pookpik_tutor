import re

def patch_js(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Decrease font size in daily summary
    # 0.68rem -> 0.65rem (header)
    content = content.replace("font-size: 0.68rem;", "font-size: 0.65rem;")
    # 0.65rem -> 0.62rem
    content = content.replace("font-size: 0.65rem;", "font-size: 0.62rem;")
    # 0.7rem -> 0.65rem
    content = content.replace("font-size: 0.7rem;", "font-size: 0.65rem;")
    # 0.6rem -> 0.55rem
    content = content.replace("font-size:0.6rem;", "font-size:0.55rem;")
    content = content.replace("font-size: 0.6rem;", "font-size: 0.55rem;")

    # 2. Add recalculateGridTotals() at the end of renderGradeSheetTable
    start_str = "document.getElementById('save_grade_sheet_btn').disabled = false;"
    idx = content.find(start_str)
    if idx != -1:
        content = content[:idx] + start_str + "\n\n  recalculateGridTotals();" + content[idx + len(start_str):]
        print("Added recalculateGridTotals")
    else:
        print("Could not find save_grade_sheet_btn disabled = false")

    # 3. Add ช่องทางชำระ and ผู้รับชำระ to table headers
    header_old = """      <th rowspan="2" style="min-width: 90px; vertical-align: middle; text-align:right;">ยอดรวม</th>\n\n      <th rowspan="2" style="min-width: 90px; vertical-align: middle; text-align:right;">คงเหลือ</th>"""
    header_new = """      <th rowspan="2" style="min-width: 90px; vertical-align: middle; text-align:right;">ยอดรวม</th>\n\n      <th rowspan="2" style="min-width: 90px; vertical-align: middle; text-align:right;">คงเหลือ</th>\n\n      <th rowspan="2" style="min-width: 100px; vertical-align: middle; text-align:center;">ช่องทางชำระ</th>\n\n      <th rowspan="2" style="min-width: 80px; vertical-align: middle; text-align:center;">ผู้รับชำระ</th>"""
    content = content.replace(header_old, header_new)

    # 4. Add the columns to the data row
    row_old = """      <td style="text-align:right; font-weight:700; font-size:0.9rem;" id="grid_student_full_${stdIdx}">฿${s.full.toLocaleString()}</td>\n\n      <td style="text-align:right; font-weight:700; font-size:0.9rem; color:${s.outstanding > 0 ? '#ef4444' : '#466352'};" id="grid_student_outstanding_${stdIdx}">฿${s.outstanding.toLocaleString()}</td>"""
    row_new = """      <td style="text-align:right; font-weight:700; font-size:0.9rem;" id="grid_student_full_${stdIdx}">฿${s.full.toLocaleString()}</td>\n\n      <td style="text-align:right; font-weight:700; font-size:0.9rem; color:${s.outstanding > 0 ? '#ef4444' : '#466352'};" id="grid_student_outstanding_${stdIdx}">฿${s.outstanding.toLocaleString()}</td>\n\n      <td style="text-align:center; font-size:0.8rem; color:var(--text-main);">\n\n        <select class="form-input grid-cell-input" style="width:100px; padding:2px;" onchange="handleStudentFieldChange(${stdIdx}, 'paymentChannel', this.value)">\n\n          <option value="กสิกร บัญชีบริษัท(สแกน)" ${s.paymentChannel === 'กสิกร บัญชีบริษัท(สแกน)' ? 'selected' : ''}>กสิกร บัญชีบริษัท(สแกน)</option>\n\n          <option value="เงินสด" ${s.paymentChannel === 'เงินสด' ? 'selected' : ''}>เงินสด</option>\n\n          <option value="บัตรเครดิต" ${s.paymentChannel === 'บัตรเครดิต' ? 'selected' : ''}>บัตรเครดิต</option>\n\n          <option value="โอนเข้าบัญชีส่วนตัว" ${s.paymentChannel === 'โอนเข้าบัญชีส่วนตัว' ? 'selected' : ''}>โอนเข้าบัญชีส่วนตัว</option>\n\n        </select>\n\n      </td>\n\n      <td style="text-align:center; font-size:0.8rem; color:var(--text-main);">\n\n        <input type="text" class="form-input grid-cell-input" style="width:70px; text-align:center;" placeholder="ผู้รับเงิน" value="${s.staff || ''}" onchange="handleStudentFieldChange(${stdIdx}, 'staff', this.value)">\n\n      </td>"""
    content = content.replace(row_old, row_new)

    # 5. Make system status background transparent
    status_old = """    statusEl.style.background = '#0f172a';\n\n    statusEl.style.color = '#fff';"""
    status_new = """    statusEl.style.background = 'transparent';\n\n    statusEl.style.color = '#0f172a';\n\n    statusEl.style.border = '1px dashed #cbd5e1';"""
    content = content.replace(status_old, status_new)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched JavaScript.js successfully")

patch_js('src/JavaScript.js')
