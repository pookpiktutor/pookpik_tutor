# -*- coding: utf-8 -*-
"""
Fix unicode escapes in Code.js - replace \\uXXXX with actual Thai characters
"""

with open('Code.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace unicode escapes with actual Thai characters
import re

def replace_unicode_escapes(text):
    """Replace \\uXXXX patterns with actual characters"""
    def replacer(match):
        return chr(int(match.group(1), 16))
    return re.sub(r'\\u([0-9a-fA-F]{4})', replacer, text)

# Only apply within getStudentsListRaw function
start = code.find('function getStudentsListRaw() {')
end = code.find('\nfunction getAllStudentsFromSubgroupSheets()')

if start != -1 and end != -1:
    func_text = code[start:end]
    fixed_func = replace_unicode_escapes(func_text)
    code = code[:start] + fixed_func + code[end:]
    print(f"[OK] Fixed unicode escapes in getStudentsListRaw (chars {start}-{end})")
else:
    print(f"[FAIL] Could not find function boundaries")

with open('Code.js', 'w', encoding='utf-8') as f:
    f.write(code)
print("[OK] Code.js: Saved")
