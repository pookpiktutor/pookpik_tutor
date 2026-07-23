import re

def patch_js(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Part 1: Replace the table rendering logic for cell display
    # Find the tooltip line
    start_str = "const tooltip = `นร.ลงทะเบียน:${s.enrolled}"
    # Find the end of the `if (hasData)` block
    end_str = "</td>\n\n        `;\n\n      } else {"
    
    start_idx = content.find(start_str)
    end_idx = content.find(end_str, start_idx)
    
    if start_idx != -1 and end_idx != -1:
        replacement = """const displayEnrolled = cat === 'main' ? s.studentNames.length : totalAttended;
        const tooltip = `นร.ลงทะเบียน:${displayEnrolled} สด:${s.live} ออนไลน์:${s.online} ลา:${s.leave} ขาด:${s.absent} ชดเชย:${s.makeup} รวมมาเรียน:${totalAttended}`;

        html += `
          <td style="padding: 4px 3px; border-right: 1px solid var(--border-color); vertical-align: middle;" title="${tooltip}">
            <div style="display: flex; flex-wrap: wrap; gap: 2px; justify-content: center; align-items: center;">
              ${displayEnrolled > 0 ? `<span style="background:#e0f7fa; color:#00838f; padding:1px 4px; border-radius:3px; font-weight:800; font-size:0.6rem;">นร.${displayEnrolled}</span>` : ''}
              ${s.live > 0 ? `<span style="background:#e8f5e9; color:#2e7d32; padding:1px 4px; border-radius:3px; font-weight:700; font-size:0.6rem;">สด ${s.live}</span>` : ''}
              ${s.online > 0 ? `<span style="background:#e3f2fd; color:#1565c0; padding:1px 4px; border-radius:3px; font-weight:700; font-size:0.6rem;">ออน ${s.online}</span>` : ''}
              ${s.leave > 0 ? `<span style="background:#fff3e0; color:#ef6c00; padding:1px 4px; border-radius:3px; font-weight:700; font-size:0.6rem;">ลา ${s.leave}</span>` : ''}
              ${s.absent > 0 ? `<span style="background:#ffebee; color:#c62828; padding:1px 4px; border-radius:3px; font-weight:700; font-size:0.6rem;">ขาด ${s.absent}</span>` : ''}
              ${s.makeup > 0 ? `<span style="background:#f3e5f5; color:#6a1b9a; padding:1px 4px; border-radius:3px; font-weight:700; font-size:0.6rem;">ชด ${s.makeup}</span>` : ''}
              ${totalAttended > 0 ? `<span style="font-weight:800; color:#0f172a; font-size:0.62rem; border-left:1px solid #e2e8f0; padding-left:3px; margin-left:1px;">⭐${totalAttended}</span>` : ''}
            </div>
          """
        content = content[:start_idx] + replacement + content[end_idx:]
        print("Patched Part 1")
    else:
        print("Target 1 not found!")

    # Part 2: Replace bottom summary section
    start_str_2 = "const grandTotal = totalMainLiveOnline + totalPrivateLiveOnline;"
    end_str_2 = "</div>\n\n    </div>\n\n  `;"
    
    start_idx_2 = content.find(start_str_2)
    end_idx_2 = content.find(end_str_2, start_idx_2)
    
    if start_idx_2 != -1 and end_idx_2 != -1:
        replacement_2 = """const grandTotal = totalMainLiveOnline + totalPrivateLiveOnline;
  const totalUnique = allMainUniqueNames.length + totalPrivateLiveOnline;

  html += `
    <div style="background: #f8fafc; border-top: 1px solid var(--border-color); padding: 10px 14px; border-radius: 0 0 8px 8px; font-size: 0.72rem; color: #475569;">
      <div style="font-weight: 700; color: #64748b; margin-bottom: 6px;">ยอดรวมนักเรียนที่มาเรียนสดและออนไลน์</div>
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <div style="padding: 4px 0;">1. ยอดรวมกลุ่มหลัก <span style="float: right; font-weight: 700; color: #0284c7;">${totalMainLiveOnline} คน</span></div>
        <div style="padding: 4px 0;">2. ยอดรวมเดี่ยว-กลุ่มย่อย <span style="float: right; font-weight: 700; color: #ea580c;">${totalPrivateLiveOnline} คน</span></div>
        <div style="padding: 4px 0; border-top: 1px dashed #cbd5e1; margin-top: 4px;">3. รวมทั้งหมด <span style="float: right; font-weight: 800; color: #16a34a;">${grandTotal} คน</span></div>
        <div style="padding: 4px 0; margin-top: 4px;">4. รวมแบบไม่ซ้ำชื่อ <span style="float: right; font-weight: 800; color: #7c3aed;">${totalUnique} คน</span></div>
      """
        content = content[:start_idx_2] + replacement_2 + content[end_idx_2:]
        print("Patched Part 2")
    else:
        print("Target 2 not found!")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

patch_js('src/JavaScript.js')
