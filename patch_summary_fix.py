import re

def patch_js(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Part 2: Restore missing tags and replace bottom summary section
    # Let's find where I inserted the new div
    start_str = "const grandTotal = totalMainLiveOnline + totalPrivateLiveOnline;"
    end_str = "</div>\n\n    </div>\n\n  `;"
    
    start_idx = content.find(start_str)
    end_idx = content.find(end_str, start_idx)
    
    if start_idx != -1 and end_idx != -1:
        replacement = """const grandTotal = totalMainLiveOnline + totalPrivateLiveOnline;
  const totalUnique = allMainUniqueNames.length + totalPrivateLiveOnline;

  html += `
        </tbody>
      </table>
    </div>
    
    <div style="margin-top: 12px; display: flex; flex-wrap: wrap; gap: 10px;">
      <div style="flex: 1; min-width: 200px; background: rgba(0, 132, 255, 0.05); border-radius: 8px; padding: 10px; border: 1px solid rgba(0, 132, 255, 0.1);">
        <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; margin-bottom: 5px;">ยอดรวมนักเรียนที่มาเรียนสดและออนไลน์</div>
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 600; border-bottom: 1px dashed rgba(0,0,0,0.1); padding-bottom: 4px;">
            <span style="color: #00838f;">1. ยอดรวมกลุ่มหลัก</span>
            <span style="color: #00838f;">${totalMainLiveOnline} คน</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 600; border-bottom: 1px dashed rgba(0,0,0,0.1); padding-bottom: 4px;">
            <span style="color: #ef6c00;">2. ยอดรวมเดี่ยว-กลุ่มย่อย</span>
            <span style="color: #ef6c00;">${totalPrivateLiveOnline} คน</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 800; border-bottom: 1px dashed rgba(0,0,0,0.1); padding-bottom: 4px;">
            <span style="color: #2e7d32;">3. รวมทั้งหมด</span>
            <span style="color: #2e7d32;">${grandTotal} คน</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700;">
            <span style="color: #6a1b9a;">4. รวมแบบไม่ซ้ำชื่อ</span>
            <span style="color: #6a1b9a;">${totalUnique} คน</span>
          </div>
        </div>
      """
        content = content[:start_idx] + replacement + content[end_idx:]
        print("Patched Part 2 Fix")
    else:
        print("Target 2 not found!")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

patch_js('src/JavaScript.js')
