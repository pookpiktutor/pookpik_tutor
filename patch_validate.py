import re

def patch_js(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update validateDatalistInput
    old_validate = """// Validate if input matches an option in its datalist
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
}"""
    
    new_validate = """// Validate if input matches an option in its datalist
function validateDatalistInput(input) {
  if (!input || !input.value) return;
  
  const listId = input.getAttribute('list');
  if (!listId) return;
  
  const datalist = document.getElementById(listId);
  if (!datalist) return;
  
  const options = Array.from(datalist.options).map(opt => opt.value);
  
  // If the typed value is not exactly one of the options
  if (!options.includes(input.value)) {
    // Apply strict validation only for private classes (contains 'เดี่ยว')
    if (input.value.includes('เดี่ยว')) {
      showToast('ชื่อคอร์สเด็กเดี่ยว กรุณาเลือกจากรายการที่มีอยู่เท่านั้น ห้ามพิมพ์ข้อความต่อท้าย', 'warning');
      input.value = ''; // Clear the invalid input
      input.focus();
    }
  }
}"""
    if old_validate in content:
        content = content.replace(old_validate, new_validate)
    else:
        print("old_validate not found!")

    # 2. Add validation in saveClassLog
    # Find `if (!subject) continue; // skip empty tabs`
    
    target = """      if (!subject) continue; // skip empty tabs"""
    
    replacement = """      if (!subject) continue; // skip empty tabs
      
      const listId = g('class_subject').getAttribute('list');
      if (listId) {
        const datalist = document.getElementById(listId);
        if (datalist) {
          const options = Array.from(datalist.options).map(opt => opt.value);
          if (subject.includes('เดี่ยว') && !options.includes(subject)) {
             showToast(`คลาส ${i+1}: ชื่อคอร์สเด็กเดี่ยว ห้ามพิมพ์ข้อความต่อท้าย (กรุณาเลือกจากรายการเท่านั้น)`, 'error');
             return; // Stop saving
          }
        }
      }"""
    
    if target in content:
        content = content.replace(target, replacement)
    else:
        print("saveClassLog target not found!")
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

patch_js('src/JavaScript.js')
print("Done")
