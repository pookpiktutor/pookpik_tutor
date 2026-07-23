import re

def patch_html(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix the incorrectly escaped quotes
    content = content.replace(r'onblur=\"validateDatalistInput(this)\"', 'onblur="validateDatalistInput(this)"')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

def patch_js(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add validateDatalistInput function to JavaScript.js if not exists
    if 'function validateDatalistInput' not in content:
        func_code = """
// Validate if input matches an option in its datalist
function validateDatalistInput(input) {
  if (!input || !input.value) return;
  
  const listId = input.getAttribute('list');
  if (!listId) return;
  
  const datalist = document.getElementById(listId);
  if (!datalist) return;
  
  const options = Array.from(datalist.options).map(opt => opt.value);
  
  // If the typed value is not exactly one of the options
  if (!options.includes(input.value)) {
    showToast('กรุณาเลือกวิชา/คลาสเรียนจากรายการที่มีอยู่เท่านั้น', 'warning');
    input.value = ''; // Clear the invalid input
    input.focus();
  }
}
"""
        # Append to the end of the file
        content += "\n" + func_code
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

patch_html('index.html')
patch_js('src/JavaScript.js')
print("Done")
