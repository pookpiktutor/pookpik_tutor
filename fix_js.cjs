const fs = require('fs');
let content = fs.readFileSync('src/JavaScript.js', 'utf8');

// Fix renderModalClassesList - guard null for class_modal_today_items and class_modal_today_count
const oldRender = `function renderModalClassesList() {\r\n  const listContainer = document.getElementById('class_modal_today_items');\r\n  const countSpan = document.getElementById('class_modal_today_count');\r\n  \r\n  countSpan.innerText = modalState.classes.length;\r\n  if (modalState.classes.length === 0) {\r\n    listContainer.innerHTML = '<div style=\"text-align: center; color: var(--text-muted); padding: 20px; font-size: 0.85rem;\">ไม่มีคลาสเรียนในวันนี้</div>';\r\n    return;\r\n  }\r\n  \r\n  listContainer.innerHTML = ''`;

const newRender = `function renderModalClassesList() {\r\n  const listContainer = document.getElementById('class_modal_today_items');\r\n  const countSpan = document.getElementById('class_modal_today_count');\r\n  \r\n  if (countSpan) countSpan.innerText = modalState.classes.length;\r\n  if (modalState.classes.length === 0) {\r\n    if (listContainer) listContainer.innerHTML = '<div style=\"text-align: center; color: var(--text-muted); padding: 20px; font-size: 0.85rem;\">ไม่มีคลาสเรียนในวันนี้</div>';\r\n    return;\r\n  }\r\n  \r\n  if (!listContainer) return;\r\n  listContainer.innerHTML = ''`;

if (content.includes(oldRender)) {
  content = content.replace(oldRender, newRender);
  fs.writeFileSync('src/JavaScript.js', content, 'utf8');
  console.log('SUCCESS: renderModalClassesList patched!');
} else {
  console.log('Pattern not found. Trying without CRLF...');
  const idx = content.indexOf('function renderModalClassesList');
  if (idx >= 0) {
    console.log(JSON.stringify(content.substring(idx, idx + 400)));
  }
}
