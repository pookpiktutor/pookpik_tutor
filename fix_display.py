import io

# Fix 1: Code.js - migrateGradeSheetsFinancials: outstanding should not be negative
with io.open('Code.js', 'r', encoding='utf-8') as f:
    c = f.read()

# Fix: คงเหลือ should be max(0, ...) so it never goes negative
old_sync = "dataValues[r][2] = studentMatch.full - currentDiscount - currentPaid;"
new_sync = "dataValues[r][2] = Math.max(0, studentMatch.full - currentDiscount - currentPaid);"

if old_sync in c:
    c = c.replace(old_sync, new_sync)
    print("[OK] Fixed outstanding to never be negative in migrateGradeSheetsFinancials")
else:
    print("[WARN] Did not find sync outstanding target in Code.js")

with io.open('Code.js', 'w', encoding='utf-8') as f:
    f.write(c)


# Fix 2: JavaScript.js - renderDebtorsTable: no word wrap + smaller font for courses
with io.open('src/JavaScript.js', 'r', encoding='utf-8') as f:
    j = f.read()

# Fix course list font size - reduce by 2 levels (from default to 0.65rem)
old_round = '''const roundList = s.round ? s.round.split(',').map(c => `<div style="margin-bottom:2px;">${c.trim()}</div>`).join('') : '-';

    const courseText = `

      <div style="font-weight:500;">${roundList}</div>

      <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">ชั้น: ${s.grade || '-'} ${s.classSection || ''}</div>

    `;'''

new_round = '''const roundList = s.round ? s.round.split(',').map(c => `<div style="margin-bottom:1px; white-space:nowrap;">${c.trim()}</div>`).join('') : '-';

    const courseText = `

      <div style="font-weight:500; font-size:0.65rem; white-space:nowrap;">${roundList}</div>

      <div style="font-size:0.6rem; color:var(--text-muted); margin-top:2px; white-space:nowrap;">ชั้น: ${s.grade || '-'} ${s.classSection || ''}</div>

    `;'''

if old_round in j:
    j = j.replace(old_round, new_round)
    print("[OK] Fixed course text font size and nowrap")
else:
    print("[WARN] Did not find course text target")

# Fix financial columns - no word wrap
old_cols = '''      <td style="text-align: right; font-weight: 500;">฿${s.full.toLocaleString()}</td>

      <td style="text-align: right; font-weight: 500; color: var(--color-warning);">฿${(s.discount || 0).toLocaleString()}</td>

      <td style="text-align: right; font-weight: 500; color: var(--color-success);">฿${s.paid.toLocaleString()}</td>

      <td style="text-align: right; font-weight: 700; color: var(--color-danger);">฿${s.outstanding.toLocaleString()}</td>

      <td style="white-space: nowrap;"><span class="badge badge-info">${s.classType || 'เดี่ยว'}</span></td>

      <td style="white-space: nowrap;">${formatDateTimeToThaiLong(s.paymentDate) || '-'}</td>'''

new_cols = '''      <td style="text-align: right; font-weight: 500; white-space: nowrap;">฿${s.full.toLocaleString()}</td>

      <td style="text-align: right; font-weight: 500; color: var(--color-warning); white-space: nowrap;">฿${(s.discount || 0).toLocaleString()}</td>

      <td style="text-align: right; font-weight: 500; color: var(--color-success); white-space: nowrap;">฿${s.paid.toLocaleString()}</td>

      <td style="text-align: right; font-weight: 700; color: var(--color-danger); white-space: nowrap;">฿${s.outstanding.toLocaleString()}</td>

      <td style="white-space: nowrap;"><span class="badge badge-info">${s.classType || 'เดี่ยว'}</span></td>

      <td style="white-space: nowrap;">${formatDateTimeToThaiLong(s.paymentDate) || '-'}</td>'''

if old_cols in j:
    j = j.replace(old_cols, new_cols)
    print("[OK] Fixed financial columns nowrap")
else:
    print("[WARN] Did not find financial columns target")

with io.open('src/JavaScript.js', 'w', encoding='utf-8') as f:
    f.write(j)

print("[DONE] All fixes applied")
