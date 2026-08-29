import io

with io.open('src/JavaScript.js', 'r', encoding='utf-8') as f:
    c = f.read()

target1 = '<td><div style="font-size:0.85rem; color:var(--text-muted); text-align:center;">฿${s.discount.toLocaleString()}</div></td>'
rep1 = '<td><div style="text-align:center;"><input type="number" value="${s.discount}" class="form-input grid-cell-input" style="width:70px; text-align:center; padding:2px;" onchange="handleGridDiscountChange(${stdIdx}, this.value)"></div></td>'

if target1 in c:
    c = c.replace(target1, rep1)
    print("[OK] Replaced discount HTML")
else:
    print("[WARN] Did not find target1")

target2 = "function handleGridCellValueChange(stdIdx, colIndex, val) {"
rep2 = """function handleGridDiscountChange(stdIdx, val) {
  if (!state.displayedStudents || !state.displayedStudents[stdIdx]) return;
  const s = state.displayedStudents[stdIdx];
  const newVal = parseFloat(val) || 0;
  s.discount = newVal;
  s.outstanding = Math.max(0, s.full - s.discount - s.paid);
  
  const outEl = document.getElementById(`grid_student_outstanding_${stdIdx}`);
  if (outEl) {
    outEl.textContent = `฿${s.outstanding.toLocaleString()}`;
    outEl.style.color = s.outstanding > 0 ? '#ef4444' : '#466352';
  }
  
  // enable save button
  document.getElementById('save_grade_sheet_btn').disabled = false;
}

function handleGridCellValueChange(stdIdx, colIndex, val) {"""

if target2 in c:
    c = c.replace(target2, rep2)
    print("[OK] Added handleGridDiscountChange")
else:
    print("[WARN] Did not find target2")

with io.open('src/JavaScript.js', 'w', encoding='utf-8') as f:
    f.write(c)
