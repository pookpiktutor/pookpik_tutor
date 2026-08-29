import re

with open('g:/My Drive/0.งานสถาบัน/data_PookPik_Tutor/Code.js', 'r', encoding='utf-8') as f:
    content = f.read()

target1 = r"""            let countPriv = 0;
            privData\.forEach\(row => \{
              const name = row\[1\] \? row\[1\]\.toString\(\)\.trim\(\) : '';
              const branchLearn = row\[8\] \? row\[8\]\.toString\(\)\.trim\(\) : '';
              if \(!name\) return;
              // Match branch: สาขา1, สาขา2, สาขา3
              if \(branchLearn === branchObj\.name\) \{
                countPriv\+\+;
              \}
            \}\);
            singleAndSubgroupCount = countPriv;"""

replace1 = """            let countPriv = new Set();
            privData.forEach(row => {
              const name = row[1] ? row[1].toString().trim() : '';
              const branchLearn = row[8] ? row[8].toString().trim() : '';
              const paidStr = row[14] ? row[14].toString().trim().replace(/,/g, '') : '0';
              const paid = parseFloat(paidStr) || 0;
              if (!name) return;
              if (branchLearn === branchObj.name && paid > 0) {
                countPriv.add(name);
              }
            });
            singleAndSubgroupCount = countPriv.size;"""

target2 = r"""            // Count students directly from row 4\+ \(row 1-3 = headers/summary, row 4\+ = students\)
            const grpLastRow = grpSheet\.getLastRow\(\);
            if \(grpLastRow >= 4\) \{
              const startDataRow = 4;
              const numRows = grpLastRow - startDataRow \+ 1;
              const nameData = grpSheet\.getRange\(startDataRow, 2, numRows, 1\)\.getValues\(\); // Col B = ชื่อ
              let countGrp = 0;
              nameData\.forEach\(row => \{
                if \(row\[0\] && row\[0\]\.toString\(\)\.trim\(\)\) countGrp\+\+;
              \}\);
              regularGroupCount = countGrp;
            \}"""

replace2 = """            const grpLastRow = grpSheet.getLastRow();
            if (grpLastRow >= 6) {
              const startDataRow = 6;
              const numRows = grpLastRow - startDataRow + 1;
              const nameData = grpSheet.getRange(startDataRow, 1, numRows, 15).getValues(); 
              let countGrp = new Set();
              nameData.forEach(row => {
                const name = row[1] ? row[1].toString().trim() : '';
                const paidStr = row[13] ? row[13].toString().trim().replace(/,/g, '') : '0';
                const paid = parseFloat(paidStr) || 0;
                if (name && paid > 0) {
                  countGrp.add(name);
                }
              });
              regularGroupCount = countGrp.size;
            }"""

content = re.sub(target1, replace1, content, flags=re.MULTILINE)
content = re.sub(target2, replace2, content, flags=re.MULTILINE)

with open('g:/My Drive/0.งานสถาบัน/data_PookPik_Tutor/Code.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replaced!")
