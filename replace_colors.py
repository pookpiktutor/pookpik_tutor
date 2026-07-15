with open('JavaScript.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re

# Update updateTeacherConfirm
old_update = """function updateTeacherConfirm(rowIndex, cb) {
  const tr = cb.closest('tr');
  if (cb.checked) {
    tr.style.backgroundColor = 'rgba(25, 135, 84, 0.12)';
  } else {
    tr.style.backgroundColor = '';
  }"""

new_update = """function updateTeacherConfirm(rowIndex, cb, isSub) {
  const tr = cb.closest('tr');
  if (cb.checked) {
    tr.style.backgroundColor = 'rgba(25, 135, 84, 0.12)';
  } else {
    tr.style.backgroundColor = isSub ? '#fff9cc' : '';
  }"""

text = text.replace(old_update, new_update)

old_fail = """        // Revert UI
        cb.checked = !cb.checked;
        tr.style.backgroundColor = cb.checked ? 'rgba(25, 135, 84, 0.12)' : '';"""

new_fail = """        // Revert UI
        cb.checked = !cb.checked;
        tr.style.backgroundColor = cb.checked ? 'rgba(25, 135, 84, 0.12)' : (isSub ? '#fff9cc' : '');"""

text = text.replace(old_fail, new_fail)

# Now update renderTeacherMonthlySalary loop
old_loop = """  res.classes.forEach(c => {
    const tr = document.createElement('tr');
    if (c.teacherConfirmed) {
      tr.style.backgroundColor = 'rgba(25, 135, 84, 0.12)';
    }
    let displayRole = c.role;
    if (displayRole && (displayRole.includes('สอนแทน') || displayRole.includes('ครูแทน'))) {
      displayRole = 'ครูแทน';
    }
    
    tr.style.whiteSpace = 'nowrap';
    tr.style.fontSize = '0.70rem';
    
    tr.innerHTML = `
      <td>${formatDateToThai(c.date)}</td>
      <td><div style="font-weight:600;">${c.subject}</div></td>
      <td>${(c.room || '-').replace(/\\s*zoom\\s*\\d*/gi, '').trim() || '-'}</td>
      <td>${formatHoursMinutes(c.hours)}</td>
      <td style="text-align: center;">${c.numKids} คน</td>
      <td><span class="badge ${(c.role.includes('สอนแทน') || c.role.includes('ครูแทน')) ? 'badge-warning' : 'badge-success'}">${displayRole}</span></td>
      <td style="text-align: right;">฿${c.rate.toLocaleString()}</td>
      <td style="text-align: right; font-weight:600; color:var(--color-success);">฿${c.pay.toLocaleString()}</td>
      <td style="text-align: center;">
        <input type="checkbox" ${c.teacherConfirmed ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--color-success);" onchange="updateTeacherConfirm(${c.rowIndex}, this)">
      </td>
    `;
    tbody.appendChild(tr);
  });"""

new_loop = """  res.classes.forEach(c => {
    const tr = document.createElement('tr');
    
    let isSub = false;
    let displayRole = c.role;
    if (displayRole && (displayRole.includes('สอนแทน') || displayRole.includes('ครูแทน'))) {
      displayRole = 'ครูแทน';
      isSub = true;
    }
    
    if (isSub) {
      tr.style.backgroundColor = '#fff9cc';
    }
    if (c.teacherConfirmed) {
      tr.style.backgroundColor = 'rgba(25, 135, 84, 0.12)';
    }
    
    tr.style.whiteSpace = 'nowrap';
    tr.style.fontSize = '0.70rem';
    
    tr.innerHTML = `
      <td>${formatDateToThai(c.date)}</td>
      <td><div style="font-weight:600;">${c.subject}</div></td>
      <td>${(c.room || '-').replace(/\\s*zoom\\s*\\d*/gi, '').trim() || '-'}</td>
      <td>${formatHoursMinutes(c.hours)}</td>
      <td style="text-align: center;">${c.numKids} คน</td>
      <td><span class="badge ${isSub ? 'badge-warning' : 'badge-success'}">${displayRole}</span></td>
      <td style="text-align: right;">฿${c.rate.toLocaleString()}</td>
      <td style="text-align: right; font-weight:600; color:var(--color-success);">฿${c.pay.toLocaleString()}</td>
      <td style="text-align: center;">
        <input type="checkbox" ${c.teacherConfirmed ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--color-success);" onchange="updateTeacherConfirm(${c.rowIndex}, this, ${isSub})">
      </td>
    `;
    tbody.appendChild(tr);
  });"""

text = text.replace(old_loop, new_loop)

with open('JavaScript.html', 'w', encoding='utf-8') as f:
    f.write(text)

print('Success')
