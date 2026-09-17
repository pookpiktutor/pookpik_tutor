import os
import re

new_func = '''
function cleanEmptyRowsAndSyncPrivateSheets() {
  const db = getDb();
  const allSheets = db.getSheets();
  
  let cleanedSheetsCount = 0;
  let removedRowsCount = 0;
  
  for (let i = 0; i < allSheets.length; i++) {
    const sheet = allSheets[i];
    const sheetName = sheet.getName();
    
    // Check if it's a private or subgroup sheet
    if (sheetName.startsWith('เดี่ยว') || sheetName.startsWith('ย่อย') || sheetName.startsWith('กลุ่ม') || sheetName.includes('VIP')) {
      const lastRow = sheet.getLastRow();
      const startRow = 2; // We are assuming header is row 1
      
      if (lastRow >= startRow) {
        const lastCol = sheet.getLastColumn();
        const targetCol = Math.max(lastCol, 36); 
        
        const dataRange = sheet.getRange(startRow, 1, lastRow - (startRow - 1), targetCol);
        const data = dataRange.getValues();
        
        const cleanData = [];
        
        for (let j = 0; j < data.length; j++) {
          const rawName = data[j][1] ? data[j][1].toString().trim() : ''; // Column B is Student Name (index 1)
          if (rawName && rawName !== 'ชื่อ-นามสกุล' && not rawName.includes('ชื่อ-สกุล') && rawName !== 'ชื่อ') {
            cleanData.push(data[j]);
          }
        }
        
        const rowsRemoved = data.length - cleanData.length;
        if (rowsRemoved > 0 || True) { 
          removedRowsCount += rowsRemoved;
          
          // Clear the old data range
          dataRange.clearContent();
          
          // Write back clean data
          if (cleanData.length > 0) {
            sheet.getRange(startRow, 1, cleanData.length, targetCol).setValues(cleanData);
          }
        }
      }
      cleanedSheetsCount++;
    }
  }
  
  // After cleaning, sync to StatusDB (batch process first 100 sheets)
  const syncResult = syncMissingStudentsToStatusDB(0, 100);
  
  Browser.msgBox('ทำความสะอาดสำเร็จ', 'ทำความสะอาดชีตจำนวน ' + cleanedSheetsCount + ' ชีต, ลบแถวว่างทิ้งไป ' + removedRowsCount + ' แถว\\n\\nสถานะการซิงค์:\\n' + syncResult.message, Browser.Buttons.OK);
}
'''

# fix 'not' to '!'
new_func = new_func.replace('not rawName', '!rawName').replace('True', 'true')

files_to_patch = ['Code.js', 'src/Code.js']

for filepath in files_to_patch:
    if not os.path.exists(filepath):
        continue
        
    with open(filepath, 'r', encoding='utf-8') as f:
        code = f.read()
        
    if 'cleanEmptyRowsAndSyncPrivateSheets' not in code:
        code += '\n' + new_func
        
        # Add to menu
        old_menu = ".addItem('🔄 แปลงข้อมูลนักเรียน (กลุ่มหลัก/เด็กเดี่ยว/กลุ่มย่อย) เข้าสู่ StatusDB', 'syncMissingStudentsToStatusDB')"
        new_menu = old_menu + "\\n      .addItem('🧹 ลบแถวว่างชีตเดี่ยว/กลุ่มย่อย + ซิงค์เข้า StatusDB', 'cleanEmptyRowsAndSyncPrivateSheets')"
        code = code.replace(old_menu, new_menu)
                            
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(code)
    print(f'Patched {filepath}')
