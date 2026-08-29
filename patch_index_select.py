import io

with io.open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

old_select = """                  <select id="summary_round_filter" class="form-select" style="min-width: 280px;">
                    <option value="Summer69">Summer 2569</option>
                    <option value="M1/69" selected>Midterm 1/69</option>
                    <option value="F1/69">Final 1/69</option>
                    <option value="Oct69">ปิดเทอม ตุลาคม 2569</option>
                    <option value="M2/69">Midterm 2/69</option>
                    <option value="F2/69">Final 2/69</option>
                  </select>"""
new_select = """                  <select id="summary_round_filter" class="form-select" style="min-width: 280px;">
                    <option value="">กำลังโหลดรอบเรียน...</option>
                  </select>"""

if old_select in html:
    html = html.replace(old_select, new_select)
    print("[OK] Replaced select in index.html")
else:
    print("[WARN] Select not found in index.html")

with io.open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
