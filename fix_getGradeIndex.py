import re

filepath = 'g:/My Drive/0.งานสถาบัน/data_PookPik_Tutor/parent_eval.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Define the getGradeIndex function to add after cleanNick function
getGradeIndex_func = """
    function getGradeIndex(val) {
      if (!val) return 0;
      const v = String(val).trim().toLowerCase();
      if (v.includes('เกียรตินิยม') || v.includes('honors') || v.includes('ยอดเยี่ยม')) return 6;
      if (v.includes('เกรด 4') || v === '4' || v.includes('grade 4') || v.includes('ดีมาก')) return 5;
      if (v.includes('เกรด 3') || v === '3' || v.includes('grade 3') || v.includes('ดี')) return 4;
      if (v.includes('เกรด 2') || v === '2' || v.includes('grade 2') || v.includes('พอใช้') || v.includes('ปานกลาง')) return 3;
      if (v.includes('เกรด 1') || v === '1' || v.includes('grade 1') || v.includes('ควรปรับปรุง')) return 2;
      if (v.includes('ไม่ผ่าน') || v.includes('fail') || v === '0' || v.includes('ตก')) return 1;
      return 0;
    }
"""

# Insert after the cleanNick function closing brace
# Find the specific anchor: the closing of cleanNick function
anchor = "        .toLowerCase();\n    }\n"
if anchor in content:
    content = content.replace(anchor, anchor + getGradeIndex_func, 1)
    print("SUCCESS: getGradeIndex function inserted after cleanNick")
else:
    # Try alternate anchor with \r\n
    anchor2 = "        .toLowerCase();\r\n    }\r\n"
    if anchor2 in content:
        content = content.replace(anchor2, anchor2 + getGradeIndex_func, 1)
        print("SUCCESS: getGradeIndex function inserted (CRLF)")
    else:
        print("ERROR: Could not find anchor to insert getGradeIndex")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
