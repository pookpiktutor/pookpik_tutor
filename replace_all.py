import re

with open('src/JavaScript.js', 'r', encoding='utf-8') as f:
    content = f.read()

def replace_block(pattern, repl, text):
    new_text, count = re.subn(pattern, repl, text)
    if count > 0:
        print(f"Replaced {count} instances.")
    return new_text

# 1. searchGlobalBackend
p1 = r'google\.script\.run\s*\.withSuccessHandler\([^)]+\)\s*\{\s*setLoading\(false\);\s*if\s*\(Array\.isArray\(data\)\)\s*\{\s*state\.students\s*=\s*data;\s*let\s*match\s*=\s*data\.find[^;]+;\s*if\s*\(match\)\s*\{\s*openEditModal\(match\.id,\s*match\);\s*\}\s*else\s*\{\s*showToast\([^\)]+\);\s*\}\s*\}\s*\}\)\s*\.withFailureHandler\([^\)]+\)\s*\{\s*setLoading\(false\);\s*showToast\([^\)]+\);\s*\}\)\s*\.getStudentsList\(getLogUser\(\)\);'
# Actually regex with \s* is brittle. I'll just write a custom replacer that finds .getStudentsList(getLogUser()); and goes backwards to find google.script.run

def replace_getStudentsList(content):
    idx = 0
    count = 0
    while True:
        idx = content.find('.getStudentsList(getLogUser());', idx)
        if idx == -1:
            break
        
        # Go backwards to find google.script.run
        start = content.rfind('google.script.run', 0, idx)
        if start == -1:
            idx += 1
            continue
            
        block = content[start:idx + len('.getStudentsList(getLogUser());')]
        
        # Determine which function it is by context
        if 'openEditModal' in block and 'match' in block:
            new_block = """fetchCachedStudents(false, data => {
      let match = data.find(reg => reg.name.trim() === studentName.trim() && reg.grade === selectedGrade && reg.branch === selectedBranch);
      if (match) openEditModal(match.id, match);
      else showToast('ไม่พบข้อมูลนักเรียน', 'warning');
    });"""
        elif 'renderDebtorsList' in block:
            new_block = "fetchCachedStudents(isSilent, data => { renderDebtorsList(); });"
        elif 'renderReceiptsList' in block:
            new_block = "fetchCachedStudents(isSilent, data => { renderReceiptsList(); });"
        else:
            new_block = block
            
        if new_block != block:
            content = content[:start] + new_block + content[idx + len('.getStudentsList(getLogUser());'):]
            idx = start + len(new_block)
            count += 1
        else:
            idx += len('.getStudentsList(getLogUser());')
            
    print(f"Replaced {count} dynamic blocks.")
    return content

new_content = replace_getStudentsList(content)

with open('src/JavaScript.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

