import os

filepath = 'g:/My Drive/0.งานสถาบัน/data_PookPik_Tutor/parent_eval.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace getRatingBadge with getGradeIndex
old_badge_func = """    function getRatingBadge(val, color) {
      // Determine level from text or val
      let stars = 3;
      let badgeColor = color;
      
      if (val.includes('ดีมาก') || val.includes('ยอดเยี่ยม') || val.includes('สม่ำเสมอ')) {
        stars = 5;
      } else if (val.includes('ดี') || val.includes('เรียบร้อย') || val.includes('ปานกลาง')) {
        stars = 4;
      } else if (val.includes('ควรปรับปรุง') || val.includes('ไม่สม่ำเสมอ') || val.includes('พอใช้')) {
        stars = 2;
        badgeColor = '#ef4444';
      }
      
      let starsHtml = '';
      for (let i = 0; i < 5; i++) {
        if (i < stars) {
          starsHtml += `<i class="fa-solid fa-star" style="font-size: 12px; color: ${badgeColor};"></i>`;
        } else {
          starsHtml += `<i class="fa-regular fa-star" style="font-size: 12px; color: #cbd5e1;"></i>`;
        }
      }

      return `
        <div style="color: ${badgeColor};">${val}</div>
        <div style="margin-top: 6px; display: flex; gap: 4px; justify-content: center;">${starsHtml}</div>
      `;
    }"""

new_badge_func = """    function getGradeIndex(val) {
      if (!val) return 0;
      if (val.includes('ยอดเยี่ยม') || val.includes('เกียรตินิยม')) return 6;
      if (val.includes('ดีมาก') || val.includes('สม่ำเสมอ')) return 5;
      if (val.includes('ดี') || val.includes('เรียบร้อย') || val.includes('ปานกลาง')) return 4;
      if (val.includes('พอใช้')) return 3;
      if (val.includes('ควรปรับปรุง') || val.includes('ไม่สม่ำเสมอ')) return 2;
      return 1;
    }"""

content = content.replace(old_badge_func, new_badge_func)

# Replace table structure
old_table = """              <div style="overflow-x: auto; margin-bottom: 25px; border-radius: 12px; box-shadow: var(--shadow-sm); border: 1px solid #e2e8f0;">
                <table style="width: 100%; border-collapse: collapse; background: white; text-align: left;">
                  <thead>
                    <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                      <th style="padding: 14px 16px; font-size: 14px; color: #475569; font-weight: 700; width: 50%;">ประเด็นการประเมิน</th>
                      <th style="padding: 14px 16px; text-align: center; font-size: 14px; color: #475569; font-weight: 700;">ผลการประเมิน</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${ratings.map((r, idx) => `
                      <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.2s; background: ${idx % 2 === 0 ? 'white' : '#fcfcfc'};">
                        <td style="padding: 14px 16px; font-size: 14px; color: #334155; font-weight: 600;">
                          <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 32px; height: 32px; border-radius: 8px; background: ${r.color}15; display: flex; align-items: center; justify-content: center;">
                              <i class="fa-solid ${r.icon}" style="color: ${r.color}; font-size: 14px;"></i>
                            </div>
                            ${r.title}
                          </div>
                        </td>
                        <td style="padding: 14px 16px; text-align: center;">
                          ${getRatingBadge(r.val, r.color)}
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>"""

new_table = """              <div style="overflow-x: auto; margin-bottom: 25px; border-radius: 12px; box-shadow: var(--shadow-sm); border: 1px solid #e2e8f0;">
                <table style="width: 100%; border-collapse: collapse; background: white; text-align: left; min-width: 700px;">
                  <thead>
                    <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                      <th style="padding: 14px 16px; font-size: 14px; color: #475569; font-weight: 700; min-width: 250px;">ประเด็น</th>
                      <th style="padding: 14px 8px; text-align: center; font-size: 13px; color: #475569; font-weight: 700; border-left: 1px solid #e2e8f0;">ไม่ผ่าน<br><span style="font-size: 11px; font-weight: 500; color: #64748b;">น้อยกว่า 50%</span></th>
                      <th style="padding: 14px 8px; text-align: center; font-size: 13px; color: #475569; font-weight: 700; border-left: 1px solid #e2e8f0;">เกรด 1<br><span style="font-size: 11px; font-weight: 500; color: #64748b;">50% - 59%</span></th>
                      <th style="padding: 14px 8px; text-align: center; font-size: 13px; color: #475569; font-weight: 700; border-left: 1px solid #e2e8f0;">เกรด 2<br><span style="font-size: 11px; font-weight: 500; color: #64748b;">60% - 69%</span></th>
                      <th style="padding: 14px 8px; text-align: center; font-size: 13px; color: #475569; font-weight: 700; border-left: 1px solid #e2e8f0;">เกรด 3<br><span style="font-size: 11px; font-weight: 500; color: #64748b;">70% - 79%</span></th>
                      <th style="padding: 14px 8px; text-align: center; font-size: 13px; color: #475569; font-weight: 700; border-left: 1px solid #e2e8f0;">เกรด 4<br><span style="font-size: 11px; font-weight: 500; color: #64748b;">80% - 89%</span></th>
                      <th style="padding: 14px 8px; text-align: center; font-size: 13px; color: #475569; font-weight: 700; border-left: 1px solid #e2e8f0;">เกียรตินิยม<br><span style="font-size: 11px; font-weight: 500; color: #64748b;">90% - 100%</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    ${ratings.map((r, idx) => {
                      const gIdx = getGradeIndex(r.val);
                      return `
                      <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.2s; background: ${idx % 2 === 0 ? 'white' : '#fcfcfc'};">
                        <td style="padding: 14px 16px; font-size: 13px; color: #334155; font-weight: 600;">
                          ${idx + 1}. ${r.title}
                        </td>
                        <td style="padding: 14px; text-align: center; border-left: 1px solid #e2e8f0;">
                          ${gIdx === 1 ? '<i class="fa-solid fa-check" style="color: #ef4444; font-size: 18px;"></i>' : ''}
                        </td>
                        <td style="padding: 14px; text-align: center; border-left: 1px solid #e2e8f0;">
                          ${gIdx === 2 ? '<i class="fa-solid fa-check" style="color: #f97316; font-size: 18px;"></i>' : ''}
                        </td>
                        <td style="padding: 14px; text-align: center; border-left: 1px solid #e2e8f0;">
                          ${gIdx === 3 ? '<i class="fa-solid fa-check" style="color: #eab308; font-size: 18px;"></i>' : ''}
                        </td>
                        <td style="padding: 14px; text-align: center; border-left: 1px solid #e2e8f0;">
                          ${gIdx === 4 ? '<i class="fa-solid fa-check" style="color: #3b82f6; font-size: 18px;"></i>' : ''}
                        </td>
                        <td style="padding: 14px; text-align: center; border-left: 1px solid #e2e8f0;">
                          ${gIdx === 5 ? '<i class="fa-solid fa-check" style="color: #10b981; font-size: 18px;"></i>' : ''}
                        </td>
                        <td style="padding: 14px; text-align: center; border-left: 1px solid #e2e8f0;">
                          ${gIdx === 6 ? '<i class="fa-solid fa-check" style="color: #8b5cf6; font-size: 18px;"></i>' : ''}
                        </td>
                      </tr>
                      `}).join('')}
                  </tbody>
                </table>
              </div>"""

content = content.replace(old_table, new_table)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated successfully!")
