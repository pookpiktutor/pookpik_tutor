const fs = require('fs');
let code = fs.readFileSync('g:/My Drive/0.งานสถาบัน/data_PookPik_Tutor/JavaScript.html', 'utf8');

const regexTable = /branchList\.forEach\(branchName => \{\s*\/\/ Render a beautiful header row for this branch\s*const headerTr = document\.createElement\('tr'\);\s*headerTr\.style\.background = 'linear-gradient\(90deg, rgba\(0, 132, 255, 0\.08\), rgba\(255, 255, 255, 0\)\)';\s*headerTr\.style\.fontWeight = '700';\s*headerTr\.style\.color = '#0066cc';\s*let branchDisplayName = branchName;\s*if \(branchName === 'สาขา1'\) branchDisplayName = 'สาขา 1 แยกPMY';\s*else if \(branchName === 'สาขา2'\) branchDisplayName = 'สาขา 2 ข้างโรงเรียนระยองวิทยาคม';\s*else if \(branchName === 'สาขา3'\) branchDisplayName = 'สาขา 3 ตรงข้ามโรงเรียนอัสสัมชัญ เซนต์โยเซฟ';\s*headerTr\.innerHTML = `\s*<td colspan="11" style="text-align: left; padding: 10px 15px; font-size: 0\.88rem; border-left: 4px solid #0084ff; background-color: rgba\(0, 132, 255, 0\.04\);">\s*📍 \$\{branchDisplayName\}\s*<\/td>\s*`;\s*tbody\.appendChild\(headerTr\);/g;

const replacementTable = `branchList.forEach(branchName => {
    // Calculate totals for this branch
    let bSingleAndSubgroup = 0;
    let bRegularGroup = 0;
    
    groups[branchName].forEach(catObj => {
      const catName = catObj.grade + '|' + catObj.branch;
      const row = summary[catName];
      if (row) {
        bSingleAndSubgroup += row.singleAndSubgroupCount || 0;
        bRegularGroup += row.regularGroupCount || 0;
      }
    });
    
    let bTotal = bSingleAndSubgroup + bRegularGroup;

    // Render a beautiful header row for this branch
    const headerTr = document.createElement('tr');
    headerTr.style.background = 'linear-gradient(90deg, rgba(0, 132, 255, 0.08), rgba(255, 255, 255, 0))';
    headerTr.style.fontWeight = '700';
    headerTr.style.color = '#0066cc';
    
    let branchDisplayName = branchName;
    if (branchName === 'สาขา1') branchDisplayName = 'สาขา 1 แยกPMY';
    else if (branchName === 'สาขา2') branchDisplayName = 'สาขา 2 ข้างโรงเรียนระยองวิทยาคม';
    else if (branchName === 'สาขา3') branchDisplayName = 'สาขา 3 ตรงข้ามโรงเรียนอัสสัมชัญ เซนต์โยเซฟ';
    
    headerTr.innerHTML = \`
      <td colspan="11" style="text-align: left; padding: 10px 15px; font-size: 0.88rem; border-left: 4px solid #0084ff; background-color: rgba(0, 132, 255, 0.04);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
          <div>📍 \${branchDisplayName}</div>
          <div style="font-size: 0.8rem; font-weight: normal; color: var(--text-main); display: flex; gap: 15px; background: rgba(255,255,255,0.7); padding: 4px 10px; border-radius: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
            <span>เด็กเดี่ยว/ย่อย: <strong style="color:#0066cc">\${bSingleAndSubgroup}</strong> คน</span>
            <span>เด็กรอบหลัก: <strong style="color:#16a34a">\${bRegularGroup}</strong> คน</span>
            <span>รวมทั้งหมด: <strong style="color:#eab308">\${bTotal}</strong> คน</span>
          </div>
        </div>
      </td>
    \`;
    tbody.appendChild(headerTr);`;

if (regexTable.test(code)) {
  code = code.replace(regexTable, replacementTable);
  fs.writeFileSync('g:/My Drive/0.งานสถาบัน/data_PookPik_Tutor/JavaScript.html', code);
  console.log('Replaced table header with branch totals!');
} else {
  console.log('Table target not found.');
}
