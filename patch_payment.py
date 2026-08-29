import re

def patch_js(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    target = 'value="card" onchange="calculateBlockOutstanding(${idx})"> บัตรเครดิต'
            
    replacement = 'value="card" onchange="calculateBlockOutstanding(${idx})"> บัตรเครดิต\n\n            </label>\n\n            <label class="radio-label" style="display: flex; align-items: center; gap: 8px; cursor: pointer;">\n\n              <input type="radio" name="pay_mode_${idx}" id="pay_mode_unpaid_${idx}" value="unpaid" onchange="calculateBlockOutstanding(${idx})"> ยังไม่ชำระ'
            
    if target in content:
        content = content.replace(target, replacement)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Patched {filepath}")
    else:
        print(f"Target not found in {filepath}!")

patch_js('src/JavaScript.js')
