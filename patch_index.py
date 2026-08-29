import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

adjustment_ui = """
            <div id="teacher_salary_adjustments_container" style="margin-bottom: 16px; padding: 12px; background: rgba(255, 255, 255, 0.8); border-radius: 8px; border: 1px solid rgba(0,0,0,0.05); box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-bottom: 8px;">
                <h4 style="font-size: 0.85rem; font-weight: 700; color: var(--text-main); margin: 0;">💵 รายการปรับปรุงเงินเดือน</h4>
                <button class="btn btn-primary btn-sm" style="font-size: 0.7rem; padding: 2px 8px;" onclick="openTeacherAdjustmentModal()">+ เพิ่มรายการหัก/เพิ่มเงิน</button>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.75rem;">
                <div style="display: flex; justify-content: space-between; color: var(--color-success); font-weight: 600;">
                  <span>เพิ่มเงินพิเศษ:</span>
                  <span id="ts_adj_bonus">฿0</span>
                </div>
                <div style="display: flex; justify-content: space-between; color: var(--color-danger); font-weight: 600;">
                  <span>หักเงินอื่นๆ:</span>
                  <span id="ts_adj_deduction">฿0</span>
                </div>
                <div style="display: flex; justify-content: space-between; color: #d97706; font-weight: 600; grid-column: span 2;">
                  <span>หักเงินประกัน (10%):</span>
                  <div>
                    <span id="ts_adj_insurance">฿0</span>
                    <span style="font-size: 0.65rem; color: #6b7280; font-weight: 400; margin-left: 4px;" id="ts_adj_insurance_progress">(สะสม: 0 / 2000)</span>
                  </div>
                </div>
              </div>
            </div>
"""

# Insert adjustment_ui before `<div class="form-grid-3"`
if 'class="form-grid-3"' in content and adjustment_ui not in content:
    content = content.replace('<div class="form-grid-3"', adjustment_ui + '\n            <div class="form-grid-3"', 1)


modal_ui = """
  <!-- Teacher Adjustment Modal -->
  <div id="teacher_adjustment_modal" class="modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); z-index: 2000; justify-content: center; align-items: center;">
    <div class="modal-content" style="background-color: #fff; padding: 20px; border-radius: 12px; width: 90%; max-width: 400px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
      <h3 style="margin-top: 0; margin-bottom: 16px; font-size: 1rem; color: var(--color-primary); border-bottom: 2px solid var(--border-color); padding-bottom: 8px;">➕ เพิ่มรายการหัก/เพิ่มเงิน</h3>
      
      <div style="margin-bottom: 12px;">
        <label class="form-label">ประเภทรายการ:</label>
        <select id="adj_modal_type" class="form-select">
          <option value="เพิ่มเงิน">เพิ่มเงินพิเศษ</option>
          <option value="หักเงิน">หักเงินอื่นๆ</option>
        </select>
      </div>
      
      <div style="margin-bottom: 12px;">
        <label class="form-label">จำนวนเงิน (บาท):</label>
        <input type="number" id="adj_modal_amount" class="form-input" min="1" placeholder="0">
      </div>
      
      <div style="margin-bottom: 16px;">
        <label class="form-label">หมายเหตุ/เหตุผล:</label>
        <input type="text" id="adj_modal_note" class="form-input" placeholder="เช่น โบนัสพิเศษ, หักค่าอุปกรณ์">
      </div>
      
      <div style="display: flex; justify-content: flex-end; gap: 8px;">
        <button class="btn btn-secondary" onclick="closeTeacherAdjustmentModal()">ยกเลิก</button>
        <button class="btn btn-primary" onclick="submitTeacherAdjustment()">บันทึกรายการ</button>
      </div>
    </div>
  </div>
"""

# Insert modal at the end before </body>
if 'teacher_adjustment_modal' not in content:
    content = content.replace('</body>', modal_ui + '\n</body>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("index.html patched")
