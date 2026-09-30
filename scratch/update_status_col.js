import fs from 'fs';

// 1. Update src/Index.html
const indexPath = 'src/Index.html';
let indexContent = fs.readFileSync(indexPath, 'utf8');

const targetHeader = `<th style="width: 90px; color:#dc2626;">ค้างชำระ</th>\r\n                    <th style="width: 80px;">จัดการ</th>`;
const replacementHeader = `<th style="width: 90px; color:#dc2626;">ค้างชำระ</th>\r\n                    <th style="width: 100px;">สถานะ</th>\r\n                    <th style="width: 80px;">จัดการ</th>`;

if (indexContent.includes(targetHeader)) {
  indexContent = indexContent.replace(targetHeader, replacementHeader);
  fs.writeFileSync(indexPath, indexContent, 'utf8');
  console.log('Successfully updated src/Index.html header');
} else {
  console.log('targetHeader not found in src/Index.html');
}

// 2. Update src/JavaScript.js
const jsPath = 'src/JavaScript.js';
let jsContent = fs.readFileSync(jsPath, 'utf8');

// Replace colspan='14' with colspan='16'
jsContent = jsContent.replace(/<td colspan='14' style='font-weight:700;/g, "<td colspan='16' style='font-weight:700;");
jsContent = jsContent.replace(/<td colspan='14' style='font-weight:600;/g, "<td colspan='16' style='font-weight:600;");
jsContent = jsContent.replace(/<td colspan="15" class="text-center text-muted"/g, '<td colspan="16" class="text-center text-muted"');

// Insert status badge logic before Manage Button
const targetJs = `        // Manage Button (ปุ่มจัดการ)\r\n        html += "<td><button class='btn btn-sm btn-warning' style='font-size:0.75rem; padding: 3px 8px; font-weight:600;' onclick=\\"showCampPaymentModal('"` ;

const replacementJs = `        // Status Column (ดึงสถานะมาแสดงเป็น Badge สวยงาม ไม่แสดงปุ่มกดยืนยัน)
        var stText = (item.status || "").trim();
        if (!stText) {
          stText = (outst <= 0 && paid > 0) ? "ชำระครบแล้ว" : (paid > 0 ? "ชำระมัดจำแล้ว" : "รอชำระ");
        }
        var stBadgeStyle = "background-color: #f1f5f9; color: #475569; border: 1px solid #cbd5e1;";
        if (stText.includes("ชำระครบ") || stText.includes("ครบ")) {
          stBadgeStyle = "background-color: #dcfce7; color: #15803d; border: 1px solid #86efac; font-weight: 600;";
        } else if (stText.includes("มัดจำ") || stText.includes("ชำระมัดจำ")) {
          stBadgeStyle = "background-color: #fef3c7; color: #b45309; border: 1px solid #fde68a; font-weight: 600;";
        } else if (stText.includes("ยืนยัน") || stText.includes("ผ่าน")) {
          stBadgeStyle = "background-color: #e0e7ff; color: #4338ca; border: 1px solid #c7d2fe; font-weight: 600;";
        } else if (stText.includes("ยกเลิก") || stText.includes("ค้าง")) {
          stBadgeStyle = "background-color: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; font-weight: 600;";
        }
        html += "<td style='text-align:center;'><span class='badge' style='font-size:0.75rem; padding: 4px 8px; border-radius: 6px; display: inline-block; white-space: nowrap; " + stBadgeStyle + "'>" + stText + "</span></td>";\r\n\r\n        // Manage Button (ปุ่มจัดการ)\r\n        html += "<td><button class='btn btn-sm btn-warning' style='font-size:0.75rem; padding: 3px 8px; font-weight:600;' onclick=\\"showCampPaymentModal('"` ;

if (jsContent.includes(targetJs)) {
  jsContent = jsContent.replace(targetJs, replacementJs);
  fs.writeFileSync(jsPath, jsContent, 'utf8');
  console.log('Successfully updated src/JavaScript.js status column');
} else {
  console.log('targetJs pattern not found in src/JavaScript.js');
}
