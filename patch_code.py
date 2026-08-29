import re

with open('Code_old.js', 'r', encoding='utf-16') as f:
    old_code = f.read()

# Extract the function
start_idx = old_code.find('function syncMissingStudentsToStatusDB() {')
end_idx = old_code.find('function debugHeaders() {')
if start_idx != -1 and end_idx != -1:
    sync_func = old_code[start_idx:end_idx]
else:
    print("Could not find function bounds")
    exit(1)

with open('Code.js', 'r', encoding='utf-8') as f:
    current_code = f.read()

# Add to menu
menu_str = ".addItem('🔄 ซิงค์ข้อมูลย้อนหลังทั้งหมด (แก้ปัญหาข้อมูล 0)', 'syncMissingStudentsToStatusDB')"
if menu_str not in current_code:
    current_code = current_code.replace(".addItem('🌐 เปิดระบบเว็บไซต์ดูแลโรงเรียน', 'openWebAppUrl')",
                                        menu_str + "\n      .addItem('🌐 เปิดระบบเว็บไซต์ดูแลโรงเรียน', 'openWebAppUrl')")

# Append function to end of file if not present
if 'function syncMissingStudentsToStatusDB()' not in current_code:
    current_code += "\n\n" + sync_func

with open('Code.js', 'w', encoding='utf-8') as f:
    f.write(current_code)

print("Code.js patched successfully.")
