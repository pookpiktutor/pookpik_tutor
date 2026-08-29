import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# The UI block that was mistakenly added
adjustment_ui = """            <div id="teacher_salary_adjustments_container" style="margin-bottom: 16px; padding: 12px; background: rgba(255, 255, 255, 0.8); border-radius: 8px; border: 1px solid rgba(0,0,0,0.05); box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-bottom: 8px;">
                <h4 style="font-size: 0.85rem; font-weight: 700; color: var(--text-main); margin: 0;">💵 รายการปรับปรุงเงินเดือน</h4>
                
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

# 1. Remove the mistakenly added UI
if adjustment_ui in content:
    content = content.replace(adjustment_ui, "")

# 2. Add it to the correct location (before the teacher's form-grid-3)
# In teacher view:
# <div class="form-grid-3" style="margin-bottom: 6px; display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px;">

target_str = '<div class="form-grid-3" style="margin-bottom: 6px; display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px;">'

if target_str in content and adjustment_ui not in content:
    content = content.replace(target_str, adjustment_ui + '            ' + target_str)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("index.html fixed")
