# -*- coding: utf-8 -*-
import sys

with open('src/JavaScript.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove isOrange from attendance check
content = content.replace(
    '(parseInt(c.isOrange) || 0) > 0;',
    'false; // isOrange removed'
)

# 2. Remove isOrange attendance display (both occurrences)
import re
content = re.sub(
    r'if \(c\.isOrange > 0\) attendances\.push\(`แสด: \$\{c\.isOrange\}`\);',
    '// isOrange display removed',
    content
)

# 3. Remove isOrange from condition check
content = content.replace(
    'if (c.isPresentLive > 0 || c.isPresentOnline > 0 || c.isOrange > 0) {',
    'if (c.isPresentLive > 0 || c.isPresentOnline > 0) {'
)

# 4. Remove isOrange input setting
content = content.replace(
    "if (g('class_kids_orange')) g('class_kids_orange').value = data.isOrange || 0;",
    "// isOrange input removed"
)

# 5. Remove isOrange from edit form
content = content.replace(
    "document.getElementById('class_kids_orange').value = log.isOrange || 0;",
    "// isOrange edit form removed"
)

# 6. Remove isOrange from save data
content = content.replace(
    "isOrange: parseInt(g('class_kids_orange')?.value) || 0",
    "// isOrange removed from save"
)

with open('src/JavaScript.js', 'w', encoding='utf-8') as f:
    f.write(content)

# Verify
remaining = content.count('isOrange')
print(f'Frontend isOrange references cleaned. Remaining mentions: {remaining}')
