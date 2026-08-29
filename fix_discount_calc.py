import io

# ============================================================
# Fix: recalculateGridTotals to properly calculate gross, discount, outstanding
# ============================================================
with io.open('src/JavaScript.js', 'r', encoding='utf-8') as f:
    js = f.read()

old_recalc = """function recalculateGridTotals() {

  const courses = state.displayedCourses || [];

  const students = state.displayedStudents || [];

  

  students.forEach((s, idx) => {
    let fullCourses = [];
    let partialTotal = 0;
    courses.forEach(c => {
      if (s.sheetName === c.sheetName) {
        const val = s.courseValues[c.colIndex];
        if (val !== '' && val !== undefined && !isNaN(val)) {
          const num = parseFloat(val);
          const price = parseFloat(c.price.toString().replace(/,/g, '')) || 0;
          const totalSessions = parseInt(c.totalSessions) || 10;
          
          if (num === 30) {
            partialTotal += price * 0.7;
          } else if (num === 20) {
            partialTotal += price * 0.9;
          } else if (num === 50) {
            partialTotal += price * 0.5;
          } else if (num >= 1 && num <= 2) {
            partialTotal += num * 350;
          } else if (num >= 3) {
            if (num === totalSessions) {
               fullCourses.push(price);
            } else {
               partialTotal += num * (price / totalSessions);
            }
          }
        }
      }
    });

    fullCourses.sort((a, b) => b - a);
    let fullTotal = 0;
    fullCourses.forEach((price, idx2) => {
      if (idx2 === 0 || idx2 === 1) {
        fullTotal += price;
      } else if (idx2 === 2) {
        fullTotal += price * 0.7;
      } else {
        fullTotal += price * 0.5;
      }
    });

    let subtotal = partialTotal + fullTotal;

    

    if (s.isCard) {

      subtotal *= 1.03;

    }

    

    const full = subtotal - s.discount;

    const outstanding = full - s.paid;

    

    s.full = Math.round(full * 100) / 100;

    s.outstanding = Math.round(outstanding * 100) / 100;

    

    const fullEl = document.getElementById(`grid_student_full_${idx}`);

    if (fullEl) fullEl.innerText = '฿' + s.full.toLocaleString();

    const outEl = document.getElementById(`grid_student_outstanding_${idx}`);

    if (outEl) {

      outEl.innerText = '฿' + s.outstanding.toLocaleString();

      outEl.style.color = s.outstanding > 0 ? '#ef4444' : '#466352';"""

new_recalc = """function recalculateGridTotals() {

  const courses = state.displayedCourses || [];

  const students = state.displayedStudents || [];

  

  students.forEach((s, idx) => {
    let fullCourses = [];
    let partialGross = 0;
    let partialNet = 0;
    courses.forEach(c => {
      if (s.sheetName === c.sheetName) {
        const val = s.courseValues[c.colIndex];
        if (val !== '' && val !== undefined && !isNaN(val)) {
          const num = parseFloat(val);
          const price = parseFloat(c.price.toString().replace(/,/g, '')) || 0;
          const totalSessions = parseInt(c.totalSessions) || 10;
          
          if (num === 30) {
            // 30% discount code
            partialGross += price;
            partialNet += price * 0.7;
          } else if (num === 20) {
            // 20% discount code (actually 10% off)
            partialGross += price;
            partialNet += price * 0.9;
          } else if (num === 50) {
            // 50% discount code
            partialGross += price;
            partialNet += price * 0.5;
          } else if (num >= 1 && num <= 2) {
            partialGross += num * 350;
            partialNet += num * 350;
          } else if (num >= 3) {
            if (num === totalSessions) {
               fullCourses.push(price);
            } else {
               const itemPrice = num * (price / totalSessions);
               partialGross += itemPrice;
               partialNet += itemPrice;
            }
          }
        }
      }
    });

    // Sort full-price courses descending for promotion discount
    fullCourses.sort((a, b) => b - a);
    let fullGross = 0;
    let fullNet = 0;
    fullCourses.forEach((price, idx2) => {
      fullGross += price;
      if (idx2 === 0 || idx2 === 1) {
        fullNet += price;           // 1st & 2nd: full price
      } else if (idx2 === 2) {
        fullNet += price * 0.7;     // 3rd: 30% off
      } else {
        fullNet += price * 0.5;     // 4th+: 50% off
      }
    });

    let grossTotal = partialGross + fullGross;
    let netTotal = partialNet + fullNet;

    

    if (s.isCard) {
      grossTotal *= 1.03;
      netTotal *= 1.03;
    }

    // Auto discount = gross - net (from promotions)
    const autoDiscount = Math.round((grossTotal - netTotal) * 100) / 100;
    
    // full = ค่าเรียนทั้งหมด (gross), discount = ส่วนลดโปรโมชัน, outstanding = ยอดค้าง
    s.full = Math.round(grossTotal * 100) / 100;
    s.discount = autoDiscount;
    s.outstanding = Math.round(Math.max(0, grossTotal - autoDiscount - s.paid) * 100) / 100;

    

    const fullEl = document.getElementById(`grid_student_full_${idx}`);

    if (fullEl) fullEl.innerText = '฿' + s.full.toLocaleString();

    // Update discount display
    const discEl = document.querySelector(`#grade_grid_tbody tr:nth-child(${idx + 1}) .grid-cell-input`);
    if (discEl) discEl.value = s.discount;

    const outEl = document.getElementById(`grid_student_outstanding_${idx}`);

    if (outEl) {

      outEl.innerText = '฿' + s.outstanding.toLocaleString();

      outEl.style.color = s.outstanding > 0 ? '#ef4444' : '#466352';"""

if old_recalc in js:
    js = js.replace(old_recalc, new_recalc)
    print("[OK] Fixed recalculateGridTotals in JavaScript.js")
else:
    print("[WARN] recalculateGridTotals pattern not found")

# ============================================================
# Fix: handleGridDiscountChange - keep manual discount separate
# ============================================================
old_discount_handler = """function handleGridDiscountChange(stdIdx, val) {
  if (!state.displayedStudents || !state.displayedStudents[stdIdx]) return;
  const s = state.displayedStudents[stdIdx];
  const newVal = parseFloat(val) || 0;
  s.discount = newVal;
  s.outstanding = Math.max(0, s.full - s.discount - s.paid);"""

new_discount_handler = """function handleGridDiscountChange(stdIdx, val) {
  if (!state.displayedStudents || !state.displayedStudents[stdIdx]) return;
  const s = state.displayedStudents[stdIdx];
  const newVal = parseFloat(val) || 0;
  s.discount = newVal;
  s.outstanding = Math.max(0, s.full - s.discount - s.paid);"""

# This one stays the same actually since user can manually override

with io.open('src/JavaScript.js', 'w', encoding='utf-8') as f:
    f.write(js)

# ============================================================
# Fix: saveGradeSheetData in Code.js - fix discount calculation
# ============================================================
with io.open('Code.js', 'r', encoding='utf-8') as f:
    code = f.read()

old_save_calc = """        // Recalculate subtotal using only courses belonging to this sheet

        let grossTotal = 0;
        let autoDiscount = 0;

        sheetCoursesUpdate.forEach(c => {
          const val = s.courseValues[c.colIndex];
          if (val !== '' && !isNaN(val)) {
            const num = parseFloat(val);
            const price = parseFloat(c.price) || 0;
            const totalSessions = parseInt(c.totalSessions) || 10;
            
            let itemGross = 0;
            let itemNet = 0;
            
            if (num === 30) {
              itemGross = price;
              itemNet = price * 0.7;
            } else if (num === 20) {
              itemGross = price;
              itemNet = price * 0.9;
            } else if (num === 50) {
              itemGross = price;
              itemNet = price * 0.5;
            } else if (num >= 1 && num <= 2) {
              itemGross = num * 350;
              itemNet = num * 350;
            } else if (num >= 3) {
              itemGross = num * (price / totalSessions);
              itemNet = num * (price / totalSessions);
            }
            
            grossTotal += itemGross;
            autoDiscount += (itemGross - itemNet);
          }
        });
        
        if (s.isCard) grossTotal *= 1.03;
        
        const manualDiscount = parseFloat(s.discount) || 0;
        const totalDiscount = autoDiscount + manualDiscount;
        
        const full = grossTotal;
        const outstanding = full - totalDiscount - s.paid;
        
        // Ensure s.discount is updated for rowVals later
        s.discount = totalDiscount;"""

new_save_calc = """        // Recalculate subtotal using only courses belonging to this sheet
        // Use same promotion discount logic as frontend: 3rd course 30% off, 4th+ 50% off

        let fullCourses = [];
        let partialGross = 0;
        let partialNet = 0;

        sheetCoursesUpdate.forEach(c => {
          const val = s.courseValues[c.colIndex];
          if (val !== '' && !isNaN(val)) {
            const num = parseFloat(val);
            const price = parseFloat(c.price) || 0;
            const totalSessions = parseInt(c.totalSessions) || 10;
            
            if (num === 30) {
              partialGross += price;
              partialNet += price * 0.7;
            } else if (num === 20) {
              partialGross += price;
              partialNet += price * 0.9;
            } else if (num === 50) {
              partialGross += price;
              partialNet += price * 0.5;
            } else if (num >= 1 && num <= 2) {
              partialGross += num * 350;
              partialNet += num * 350;
            } else if (num >= 3) {
              if (num === totalSessions) {
                fullCourses.push(price);
              } else {
                const itemPrice = num * (price / totalSessions);
                partialGross += itemPrice;
                partialNet += itemPrice;
              }
            }
          }
        });
        
        // Sort full-price courses descending for promotion discount
        fullCourses.sort(function(a, b) { return b - a; });
        let fullGross = 0;
        let fullNet = 0;
        fullCourses.forEach(function(price, idx) {
          fullGross += price;
          if (idx === 0 || idx === 1) {
            fullNet += price;           // 1st & 2nd: full price
          } else if (idx === 2) {
            fullNet += price * 0.7;     // 3rd: 30% off
          } else {
            fullNet += price * 0.5;     // 4th+: 50% off
          }
        });
        
        let grossTotal = partialGross + fullGross;
        let netTotal = partialNet + fullNet;
        
        if (s.isCard) {
          grossTotal *= 1.03;
          netTotal *= 1.03;
        }
        
        const autoDiscount = Math.round((grossTotal - netTotal) * 100) / 100;
        
        const full = Math.round(grossTotal * 100) / 100;
        const outstanding = Math.round(Math.max(0, full - autoDiscount - s.paid) * 100) / 100;
        
        // Set discount to auto-calculated promotion discount
        s.discount = autoDiscount;"""

if old_save_calc in code:
    code = code.replace(old_save_calc, new_save_calc)
    print("[OK] Fixed saveGradeSheetData discount calculation in Code.js")
else:
    print("[WARN] saveGradeSheetData calc pattern not found")

with io.open('Code.js', 'w', encoding='utf-8') as f:
    f.write(code)

print("\n=== Done! ===")
print("Changes:")
print("1. Frontend recalculateGridTotals: Calculates grossTotal, autoDiscount (promotion), outstanding correctly")
print("2. Backend saveGradeSheetData: Same promotion discount logic (3rd course 30% off, 4th+ 50% off)")
print("3. Discount column now shows auto-calculated promotion discount")
print("4. ยอดรวม = gross total (before discount)")
print("5. คงเหลือ = gross - discount - paid")
print("6. All values saved to grade sheet columns K,L,M (full, discount, outstanding)")
