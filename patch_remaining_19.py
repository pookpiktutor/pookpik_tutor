import io
import re

with io.open('Code.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace all occurrences of 19, 1, lastCol - 18 with 20, 1, lastCol - 19
code = code.replace("19, 1, lastCol - 18", "20, 1, lastCol - 19")

# Replace all occurrences of 19, 1, courses.length with 20, 1, courses.length
code = code.replace("19, 1, courses.length", "20, 1, courses.length")

# Just to be safe, search for any other hardcoded 19 that might relate to courses.
# Like .getRange(row, 19
code = code.replace(".getRange(row, 19", ".getRange(row, 20")
code = code.replace(".getRange(r, 19", ".getRange(r, 20")
code = code.replace(".getRange(i, 19", ".getRange(i, 20")

# check row index for course header insertions
code = code.replace(".getRange(1, 19", ".getRange(1, 20")
code = code.replace(".getRange(2, 19", ".getRange(2, 20")
code = code.replace(".getRange(3, 19", ".getRange(3, 20")
code = code.replace(".getRange(4, 19", ".getRange(4, 20")

# Wait, the previous patch already replaced some of these in `getGradeSheetData` and `getStudentsListRaw`.
# If they were replaced to 20, they won't match 19, which is good.

with io.open('Code.js', 'w', encoding='utf-8') as f:
    f.write(code)

print("[OK] Patched remaining col 19 to 20 in Code.js")
