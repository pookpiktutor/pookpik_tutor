#!/usr/bin/env python3
"""Redesign the evaluation table in parent_eval.html to be visually stunning.
Replace the plain table with a beautiful card-based layout with gradient headers,
animated stars, progress bars, and modern glassmorphism design.
"""

filepath = 'g:/My Drive/0.งานสถาบัน/data_PookPik_Tutor/parent_eval.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace the entire table section (from the h4 title to closing </div> of table wrapper)
old_table_section = """              <h4 style="font-size: 16px; font-weight: 700; color: #334155; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                <i class="fa-solid fa-chart-pie" style="color: var(--primary-color);"></i> สรุปผลการประเมินรายพฤติกรรม
              </h4>

              <div style="overflow-x: auto; margin-bottom: 25px; border-radius: 12px; box-shadow: var(--shadow-sm); border: 1px solid #e2e8f0;">
                <table style="width: 100%; border-collapse: collapse; background: white; text-align: left; min-width: 700px;">
                  <thead>
                    <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                      <th style="padding: 10px 12px; font-size: 13px; color: #475569; font-weight: 700; min-width: 220px;">ประเด็น</th>
                      <th style="padding: 8px 4px; text-align: center; font-size: 11.5px; color: #475569; font-weight: 700; border-left: 1px solid #e2e8f0;">ไม่ผ่าน<br><span style="font-size: 11px; font-weight: 500; color: #64748b;">น้อยกว่า 50%</span></th>
                      <th style="padding: 8px 4px; text-align: center; font-size: 11.5px; color: #475569; font-weight: 700; border-left: 1px solid #e2e8f0;">เกรด 1<br><span style="font-size: 11px; font-weight: 500; color: #64748b;">50% - 59%</span></th>
                      <th style="padding: 8px 4px; text-align: center; font-size: 11.5px; color: #475569; font-weight: 700; border-left: 1px solid #e2e8f0;">เกรด 2<br><span style="font-size: 11px; font-weight: 500; color: #64748b;">60% - 69%</span></th>
                      <th style="padding: 8px 4px; text-align: center; font-size: 11.5px; color: #475569; font-weight: 700; border-left: 1px solid #e2e8f0;">เกรด 3<br><span style="font-size: 11px; font-weight: 500; color: #64748b;">70% - 79%</span></th>
                      <th style="padding: 8px 4px; text-align: center; font-size: 11.5px; color: #475569; font-weight: 700; border-left: 1px solid #e2e8f0;">เกรด 4<br><span style="font-size: 11px; font-weight: 500; color: #64748b;">80% - 89%</span></th>
                      <th style="padding: 8px 4px; text-align: center; font-size: 11.5px; color: #475569; font-weight: 700; border-left: 1px solid #e2e8f0;">เกียรตินิยม<br><span style="font-size: 11px; font-weight: 500; color: #64748b;">90% - 100%</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    ${ratings.map((r, idx) => {
                      const gIdx = getGradeIndex(r.val);
                      return `
                      <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.2s; background: ${idx % 2 === 0 ? 'white' : '#fafbfc'};">
                        <td style="padding: 8px 12px; font-size: 12.5px; color: #334155; font-weight: 600; line-height: 1.3;">
                          ${idx + 1}. ${r.title}
                        </td>
                        <td style="padding: 6px 4px; text-align: center; border-left: 1px solid #e2e8f0;">
                          ${gIdx === 1 ? '<i class="fa-solid fa-star" style="color: #ef4444; font-size: 16px; filter: drop-shadow(0 1px 2px rgba(239,68,68,0.3));"></i>' : ''}
                        </td>
                        <td style="padding: 6px 4px; text-align: center; border-left: 1px solid #e2e8f0;">
                          ${gIdx === 2 ? '<i class="fa-solid fa-star" style="color: #f97316; font-size: 16px; filter: drop-shadow(0 1px 2px rgba(249,115,22,0.3));"></i>' : ''}
                        </td>
                        <td style="padding: 6px 4px; text-align: center; border-left: 1px solid #e2e8f0;">
                          ${gIdx === 3 ? '<i class="fa-solid fa-star" style="color: #eab308; font-size: 16px; filter: drop-shadow(0 1px 2px rgba(234,179,8,0.3));"></i>' : ''}
                        </td>
                        <td style="padding: 6px 4px; text-align: center; border-left: 1px solid #e2e8f0;">
                          ${gIdx === 4 ? '<i class="fa-solid fa-star" style="color: #3b82f6; font-size: 16px; filter: drop-shadow(0 1px 2px rgba(59,130,246,0.3));"></i>' : ''}
                        </td>
                        <td style="padding: 6px 4px; text-align: center; border-left: 1px solid #e2e8f0;">
                          ${gIdx === 5 ? '<i class="fa-solid fa-star" style="color: #10b981; font-size: 16px; filter: drop-shadow(0 1px 2px rgba(16,185,129,0.3));"></i>' : ''}
                        </td>
                        <td style="padding: 6px 4px; text-align: center; border-left: 1px solid #e2e8f0;">
                          ${gIdx === 6 ? '<i class="fa-solid fa-star" style="color: #8b5cf6; font-size: 16px; filter: drop-shadow(0 1px 2px rgba(139,92,253,0.3));"></i>' : ''}
                        </td>
                      </tr>
                      `}).join('')}
                  </tbody>
                </table>
              </div>"""

new_table_section = """              <h4 style="font-size: 16px; font-weight: 700; color: #334155; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                <i class="fa-solid fa-chart-pie" style="color: var(--primary-color);"></i> สรุปผลการประเมินรายพฤติกรรม
              </h4>

              <!-- Grade Legend -->
              <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; justify-content: center;">
                <span style="display: inline-flex; align-items: center; gap: 4px; background: rgba(239,68,68,0.08); color: #dc2626; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; border: 1px solid rgba(239,68,68,0.15);"><i class="fa-solid fa-star" style="font-size: 10px;"></i> ไม่ผ่าน</span>
                <span style="display: inline-flex; align-items: center; gap: 4px; background: rgba(249,115,22,0.08); color: #ea580c; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; border: 1px solid rgba(249,115,22,0.15);"><i class="fa-solid fa-star" style="font-size: 10px;"></i> เกรด 1</span>
                <span style="display: inline-flex; align-items: center; gap: 4px; background: rgba(234,179,8,0.08); color: #ca8a04; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; border: 1px solid rgba(234,179,8,0.15);"><i class="fa-solid fa-star" style="font-size: 10px;"></i> เกรด 2</span>
                <span style="display: inline-flex; align-items: center; gap: 4px; background: rgba(59,130,246,0.08); color: #2563eb; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; border: 1px solid rgba(59,130,246,0.15);"><i class="fa-solid fa-star" style="font-size: 10px;"></i> เกรด 3</span>
                <span style="display: inline-flex; align-items: center; gap: 4px; background: rgba(16,185,129,0.08); color: #059669; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; border: 1px solid rgba(16,185,129,0.15);"><i class="fa-solid fa-star" style="font-size: 10px;"></i> เกรด 4</span>
                <span style="display: inline-flex; align-items: center; gap: 4px; background: rgba(139,92,253,0.08); color: #7c3aed; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; border: 1px solid rgba(139,92,253,0.15);"><i class="fa-solid fa-star" style="font-size: 10px;"></i> เกียรตินิยม</span>
              </div>

              <!-- Ratings Cards -->
              <div style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 25px;">
                ${ratings.map((r, idx) => {
                  const gIdx = getGradeIndex(r.val);
                  const gradeColors = {
                    1: { bg: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.2)', star: '#ef4444', glow: 'rgba(239,68,68,0.25)', label: 'ไม่ผ่าน', barW: '16%' },
                    2: { bg: 'rgba(249,115,22,0.06)', border: 'rgba(249,115,22,0.2)', star: '#f97316', glow: 'rgba(249,115,22,0.25)', label: 'เกรด 1', barW: '33%' },
                    3: { bg: 'rgba(234,179,8,0.06)', border: 'rgba(234,179,8,0.2)', star: '#eab308', glow: 'rgba(234,179,8,0.25)', label: 'เกรด 2', barW: '50%' },
                    4: { bg: 'rgba(59,130,246,0.06)', border: 'rgba(59,130,246,0.2)', star: '#3b82f6', glow: 'rgba(59,130,246,0.25)', label: 'เกรด 3', barW: '66%' },
                    5: { bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.2)', star: '#10b981', glow: 'rgba(16,185,129,0.25)', label: 'เกรด 4', barW: '83%' },
                    6: { bg: 'rgba(139,92,253,0.06)', border: 'rgba(139,92,253,0.2)', star: '#8b5cf6', glow: 'rgba(139,92,253,0.25)', label: 'เกียรตินิยม', barW: '100%' }
                  };
                  const g = gradeColors[gIdx] || { bg: '#f8fafc', border: '#e2e8f0', star: '#94a3b8', glow: 'transparent', label: '-', barW: '0%' };
                  const starCount = gIdx || 0;
                  let starsHtml = '';
                  for (let s = 0; s < 6; s++) {
                    if (s < starCount) {
                      starsHtml += '<i class="fa-solid fa-star" style="color: ' + g.star + '; font-size: 13px; filter: drop-shadow(0 1px 3px ' + g.glow + '); transition: transform 0.2s;"></i>';
                    } else {
                      starsHtml += '<i class="fa-regular fa-star" style="color: #e2e8f0; font-size: 13px;"></i>';
                    }
                  }
                  return `
                <div style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: ${g.bg}; border: 1px solid ${g.border}; border-radius: 12px; transition: all 0.25s ease; cursor: default;"
                     onmouseover="this.style.transform='translateX(4px)'; this.style.boxShadow='0 4px 15px ${g.glow}';"
                     onmouseout="this.style.transform=''; this.style.boxShadow='';">
                  <!-- Number Badge -->
                  <div style="min-width: 28px; height: 28px; border-radius: 50%; background: ${gIdx >= 5 ? 'linear-gradient(135deg, ' + g.star + ', ' + g.star + 'cc)' : g.border}; color: ${gIdx >= 5 ? 'white' : '#475569'}; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0;">
                    ${idx + 1}
                  </div>
                  <!-- Title & Progress -->
                  <div style="flex: 1; min-width: 0;">
                    <div style="font-size: 12.5px; color: #334155; font-weight: 600; line-height: 1.35; margin-bottom: 4px; word-wrap: break-word;">${r.title}</div>
                    <div style="height: 4px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                      <div style="height: 100%; width: ${g.barW}; background: linear-gradient(90deg, ${g.star}88, ${g.star}); border-radius: 4px; transition: width 0.6s ease;"></div>
                    </div>
                  </div>
                  <!-- Stars & Grade Badge -->
                  <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; flex-shrink: 0;">
                    <div style="display: flex; gap: 2px;">${starsHtml}</div>
                    <span style="font-size: 10px; font-weight: 700; color: ${g.star}; background: ${g.bg}; padding: 1px 8px; border-radius: 10px; border: 1px solid ${g.border}; white-space: nowrap;">${g.label}</span>
                  </div>
                </div>`;
                }).join('')}
              </div>"""

if old_table_section in content:
    content = content.replace(old_table_section, new_table_section, 1)
    print("SUCCESS: Table redesigned with beautiful card layout!")
else:
    print("ERROR: Could not find old table section to replace")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
