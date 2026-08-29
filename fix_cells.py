# -*- coding: utf-8 -*-
"""Fix the cell rendering loop to use hourlyColumns instead of sortedStartTimes"""

with open('src/JavaScript.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Normalize line endings for search
# Find by partial unique strings
import re

# 1. Replace "if (sortedStartTimes.length === 0)" block with hourlyColumns loop
old_pattern = r'if \(sortedStartTimes\.length === 0\) \{\s*tableHTML \+= `<td[^`]+ไม่มีชั่วโมงเรียน[^`]+`;\s*\} else \{\s*sortedStartTimes\.forEach\(time => \{\s*const classesAtTime = roomClasses\.filter\(c => c\.timeStart === time\);'

new_text = """// Render fixed hourly columns
    hourlyColumns.forEach(time => {
      const columnHour = parseInt(time.split('.')[0], 10);
      const classesInHour = roomClasses.filter(c => {
        if (!c.timeStart) return false;
        const startHour = parseInt(String(c.timeStart).replace(':', '.').split('.')[0], 10);
        return startHour === columnHour;
      });
      const classesAtTime = classesInHour;"""

match = re.search(old_pattern, content, re.DOTALL)
if match:
    content = content[:match.start()] + new_text + content[match.end():]
    print("Replaced cell loop header OK")
else:
    print("ERROR: Could not find old cell loop header with regex")
    exit(1)

# 2. Remove the extra closing brace "}" for the else block
# Find pattern: tableHTML += `</td>`;\n        });\n     }\n
old_end_pattern = r"(tableHTML \+= `</td>`;\s*\}\);\s*)\}"
match2 = re.search(old_end_pattern, content[content.index('hourlyColumns.forEach'):])
if match2:
    offset = content.index('hourlyColumns.forEach')
    start = offset + match2.start()
    end = offset + match2.end()
    content = content[:start] + match2.group(1) + content[end:]
    print("Removed extra closing brace OK")
else:
    print("WARNING: Could not find extra closing brace (may already be correct)")

with open('src/JavaScript.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done!")
