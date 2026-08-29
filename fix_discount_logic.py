import io

with io.open('Code.js', 'r', encoding='utf-8') as f:
    c = f.read()

# Fix 1: Update saveGradeSheetData to calculate grossTotal and autoDiscount
old_save_logic = '''        let subtotal = 0;

        sheetCoursesUpdate.forEach(c => {

          const val = s.courseValues[c.colIndex];

          if (val !== '' && !isNaN(val)) {

            const num = parseFloat(val);

            const price = parseFloat(c.price) || 0;

            const totalSessions = parseInt(c.totalSessions) || 10;

            

            if (num === 30) subtotal += price * 0.7;

            else if (num === 20) subtotal += price * 0.9;

            else if (num === 50) subtotal += price * 0.5;

            else if (num >= 1 && num <= 2) subtotal += num * 350;

            else if (num >= 3) subtotal += num * (price / totalSessions);

          }

        });

        

        if (s.isCard) subtotal *= 1.03;

        const full = subtotal - s.discount;

        const outstanding = full - s.paid;'''

new_save_logic = '''        let grossTotal = 0;
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
        s.discount = totalDiscount;'''

if old_save_logic in c:
    c = c.replace(old_save_logic, new_save_logic)
    print("[OK] Replaced saveGradeSheetData logic in Code.js")
else:
    print("[WARN] Did not find saveGradeSheetData logic in Code.js")


# Fix 2: Update migrateGradeSheetsFinancials to use the same logic
old_mig_logic = '''        let subtotal = 0;
        courses.forEach((c, cIdx) => {
          const val = courseValues[r][cIdx];
          if (val !== '' && !isNaN(val)) {
            const num = parseFloat(val);
            const price = c.price;
            const totalSessions = c.totalSessions;
            
            if (num === 30) subtotal += price * 0.7;
            else if (num === 20) subtotal += price * 0.9;
            else if (num === 50) subtotal += price * 0.5;
            else if (num >= 1 && num <= 2) subtotal += num * 350;
            else if (num >= 3) subtotal += num * (price / totalSessions);
          }
        });
        
        const isCard = parseInt(isCardRange[r][0]) === 1;
        if (isCard) subtotal *= 1.03;
        
        const currentDiscount = parseFloat(dataValues[r][1]) || 0;
        const full = subtotal - currentDiscount;'''

new_mig_logic = '''        let grossTotal = 0;
        let autoDiscount = 0;
        courses.forEach((c, cIdx) => {
          const val = courseValues[r][cIdx];
          if (val !== '' && !isNaN(val)) {
            const num = parseFloat(val);
            const price = c.price;
            const totalSessions = c.totalSessions;
            
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
        
        const isCard = parseInt(isCardRange[r][0]) === 1;
        if (isCard) grossTotal *= 1.03;
        
        const manualDiscount = parseFloat(dataValues[r][1]) || 0;
        // If the current discount already includes the auto discount, we don't want to double it.
        // But since previously it was 0, we'll just set it to autoDiscount + manualDiscount.
        // Wait, if it already had autoDiscount, manualDiscount would be autoDiscount + manual.
        // Let's just assume dataValues[r][1] is manual if we are strictly migrating.
        // Actually, to be safe: 
        const totalDiscount = Math.max(autoDiscount, manualDiscount); // Avoid doubling if it was already there
        
        const full = grossTotal;'''

if old_mig_logic in c:
    c = c.replace(old_mig_logic, new_mig_logic)
    print("[OK] Replaced migrateGradeSheetsFinancials logic in Code.js")
else:
    print("[WARN] Did not find migrateGradeSheetsFinancials logic in Code.js")


# Fix 3: In migrateGradeSheetsFinancials, update outstanding calculation
old_mig_out = '''        dataValues[r][0] = full;
        dataValues[r][1] = currentDiscount;
        dataValues[r][3] = currentPaid;
        dataValues[r][2] = Math.max(0, full - currentPaid);'''

new_mig_out = '''        dataValues[r][0] = full;
        dataValues[r][1] = totalDiscount;
        dataValues[r][3] = currentPaid;
        dataValues[r][2] = Math.max(0, full - totalDiscount - currentPaid);'''

if old_mig_out in c:
    c = c.replace(old_mig_out, new_mig_out)
    print("[OK] Replaced migrateGradeSheetsFinancials outstanding logic in Code.js")
else:
    print("[WARN] Did not find migrateGradeSheetsFinancials outstanding logic in Code.js")


with io.open('Code.js', 'w', encoding='utf-8') as f:
    f.write(c)
