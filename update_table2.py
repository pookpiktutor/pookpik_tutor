import os
import re

filepath = 'g:/My Drive/0.งานสถาบัน/data_PookPik_Tutor/parent_eval.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# We need to replace the <div class="ratings-grid"> block.
# Let's find it with regex
pattern = re.compile(r'<div class="ratings-grid">.*?</div>', re.DOTALL)

new_block = """<div style="overflow-x: auto; margin-bottom: 25px; border-radius: 12px; box-shadow: var(--shadow-sm); border: 1px solid #e2e8f0;">
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

if pattern.search(content):
    content = pattern.sub(new_block, content, count=1)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully replaced ratings-grid with table!")
else:
    print("Could not find ratings-grid!")
