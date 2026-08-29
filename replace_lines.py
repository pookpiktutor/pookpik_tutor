with open('src/JavaScript.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = False

# Mapping of search strings to replacements
replacements = {
    "กำลังโหลดข้อมูลทะเบียนนักเรียน": "  // Force fetch by clearing cache if it's an explicit refresh\n  if (!isSilent) state.students = [];\n  fetchCachedStudents(isSilent, data => { renderStudentDB(); });\n",
    "กำลังโหลดข้อมูลยอดค้างชำระ": "  fetchCachedStudents(isSilent, data => { renderDebtorsList(); });\n",
    "กำลังโหลดข้อมูลประวัติการชำระเงิน": "  fetchCachedStudents(isSilent, data => { renderReceiptsList(); });\n",
}

for i in range(len(lines)):
    if skip:
        if "getStudentsList(getLogUser());" in lines[i]:
            skip = False
        continue
    
    match_found = False
    for search_term, replacement in replacements.items():
        if search_term in lines[i] and "setLoading" in lines[i]:
            # Found a block to replace
            new_lines.append(replacement)
            skip = True
            match_found = True
            break
            
    if "let match = data.find" in lines[i] and "searchGlobalBackend" in "".join(lines[max(0, i-50):i]):
        # The searchGlobalBackend block is trickier to replace line-by-line this way.
        pass
        
    if not match_found and not skip:
        new_lines.append(lines[i])

with open('src/JavaScript.js', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Line-by-line replacement done.")
