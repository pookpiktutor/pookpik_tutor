import re

with open('register.html', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. std_name HTML
text = text.replace(
    '<input type="text" id="std_name" class="form-input" required placeholder="ด.ช. / ด.ญ. / นาย / นางสาว" style="flex: 1;">',
    '<select id="std_prefix" class="form-select" required style="flex: 0 0 auto; width: 100px;"><option value="">คำนำหน้า</option><option value="ด.ช.">ด.ช.</option><option value="ด.ญ.">ด.ญ.</option><option value="นาย">นาย</option><option value="นางสาว">นางสาว</option></select>\n             <input type="text" id="std_name" class="form-input" required placeholder="ชื่อ - นามสกุล" style="flex: 1;">'
)

# 2. camp_std_name HTML
text = text.replace(
    '<input type="text" id="camp_std_name" class="form-input" required placeholder="ด.ช. / ด.ญ. / นาย / นางสาว" style="flex: 1;">',
    '<select id="camp_prefix" class="form-select" required style="flex: 0 0 auto; width: 100px;"><option value="">คำนำหน้า</option><option value="ด.ช.">ด.ช.</option><option value="ด.ญ.">ด.ญ.</option><option value="นาย">นาย</option><option value="นางสาว">นางสาว</option></select>\n           <input type="text" id="camp_std_name" class="form-input" required placeholder="ชื่อ - นามสกุล" style="flex: 1;">'
)

# 3. search_std_name HTML
text = text.replace(
    '<input type="text" id="search_std_name" class="form-input" required placeholder="ด.ช. / ด.ญ. / นาย / นางสาว">',
    '<div style="display: flex; gap: 8px;">\n            <select id="search_prefix" class="form-select" required style="flex: 0 0 auto; width: 100px;"><option value="">คำนำหน้า</option><option value="ด.ช.">ด.ช.</option><option value="ด.ญ.">ด.ญ.</option><option value="นาย">นาย</option><option value="นางสาว">นางสาว</option></select>\n            <input type="text" id="search_std_name" class="form-input" required placeholder="ชื่อ - นามสกุล" style="flex: 1;">\n          </div>'
)

# 4. JS std_name (Registration submit)
text = text.replace(
    "const name = document.getElementById('std_name').value.trim();",
    "const namePrefix = document.getElementById('std_prefix').value;\n      const name = (namePrefix + document.getElementById('std_name').value.trim()).trim();"
)

# 5. JS camp_std_name (Camp submit)
text = text.replace(
    "std_name: document.getElementById('camp_std_name').value,",
    "std_name: (document.getElementById('camp_prefix').value + document.getElementById('camp_std_name').value).trim(),"
)
text = text.replace(
    "name: document.getElementById('camp_std_name').value.trim(),",
    "name: (document.getElementById('camp_prefix').value + document.getElementById('camp_std_name').value).trim(),"
)

# 6. JS search_std_name (Search payment submit)
text = text.replace(
    "std_name: document.getElementById('search_std_name').value,",
    "std_name: (document.getElementById('search_prefix').value + document.getElementById('search_std_name').value).trim(),"
)
text = text.replace(
    "const nameInput = document.getElementById('search_std_name').value.trim();",
    "const nameInput = (document.getElementById('search_prefix').value + document.getElementById('search_std_name').value).trim();"
)

# 7. JS getStudentData (std_name)
text = text.replace(
    "const nameInput = document.getElementById('std_name');\n            const name = nameInput ? nameInput.value.trim() : '';",
    "const prefix = document.getElementById('std_prefix') ? document.getElementById('std_prefix').value : '';\n            const nameInput = document.getElementById('std_name');\n            const name = nameInput ? (prefix + nameInput.value.trim()).trim() : '';"
)

# 8. JS searchStudentRegistrationAndUnpaid (camp_std_name)
text = text.replace(
    "const nameInput = document.getElementById('camp_std_name');\n            const name = nameInput.value.trim();",
    "const prefix = document.getElementById('camp_prefix') ? document.getElementById('camp_prefix').value : '';\n            const nameInput = document.getElementById('camp_std_name');\n            const name = nameInput ? (prefix + nameInput.value.trim()).trim() : '';"
)

with open('register.html', 'w', encoding='utf-8') as f:
    f.write(text)

print('Patched successfully!')
