function migrateOldDataToNew() {
  const oldId = '1ljRQexe6VoPtUBaaPvpMPs_CjaflvtKpPoYidH5PwLc';
  const newId = '1QLEJgYWHfDQVwRZg7nTPc0ViTu7mpkBF26Fk6NocQaI';
  
  const oldDb = SpreadsheetApp.openById(oldId);
  const newDb = SpreadsheetApp.openById(newId);
  
  const oldSheets = oldDb.getSheets();
  let migratedCount = 0;
  let logMessages = [];
  
  oldSheets.forEach(oldSheet => {
    const sheetName = oldSheet.getName();
    
    // We only want to migrate actual grade sheets
    // like ป.1/1, ป.1/2, ม.1/1, เดี่ยว ป.1, etc.
    if (!sheetName.match(/^(.+)\/([1-3])$/) && !sheetName.match(/^(อนุบาล|ป\.1|ป\.2|ป\.3|ป\.4|ป\.5|ป\.6|ม\.1|ม\.2|ม\.3|ม\.4|ม\.5|ม\.6)$/)) {
      // It's not a grade sheet, skip
      return;
    }
    
    let newSheet = newDb.getSheetByName(sheetName);
    if (!newSheet) {
      logMessages.push(`⚠️ ข้ามชีต ${sheetName} (ไม่มีชีตนี้ในระบบใหม่)`);
      return;
    }
    
    const lastRow = oldSheet.getLastRow();
    const lastCol = oldSheet.getLastColumn();
    
    if (lastRow < 6 || lastCol < 20) {
      logMessages.push(`⚠️ ข้ามชีต ${sheetName} (ข้อมูลว่างหรือรูปแบบไม่ถูกต้อง)`);
      return; 
    }
    
    // Read the data from row 6 onwards
    const oldData = oldSheet.getRange(6, 1, lastRow - 5, lastCol).getValues();
    
    // We get the new sheet data to avoid duplicates by name (Col B, index 1)
    const newLastRow = newSheet.getLastRow();
    let newExistingNames = [];
    if (newLastRow >= 6) {
       newExistingNames = newSheet.getRange(6, 2, newLastRow - 5, 1).getValues().map(r => r[0].toString().trim());
    }
    
    let rowsToAppend = [];
    
    oldData.forEach(row => {
       const studentName = row[1] ? row[1].toString().trim() : '';
       if (!studentName) return; // Skip empty rows
       
       if (newExistingNames.includes(studentName)) {
         // Already exists in new database, skip
         return;
       }
       
       // Match the columns as closely as possible
       // The new database expects certain columns
       // Assuming identical structure for grade sheets
       rowsToAppend.push(row);
    });
    
    if (rowsToAppend.length > 0) {
       // Append the rows
       const startRow = newSheet.getLastRow() + 1;
       // The new sheet might have more or fewer columns than old sheet
       const targetColCount = newSheet.getLastColumn();
       
       // Adjust row length to match target columns
       const formattedRows = rowsToAppend.map(r => {
          let newRow = [];
          for (let i=0; i<Math.max(r.length, targetColCount); i++) {
            newRow.push(i < r.length ? r[i] : '');
          }
          // Trim to target col count if target has fewer columns
          return newRow.slice(0, Math.max(targetColCount, r.length));
       });
       
       // Pad target columns if needed
       if (formattedRows[0].length > targetColCount) {
           newSheet.insertColumnsAfter(targetColCount, formattedRows[0].length - targetColCount);
       }
       
       newSheet.getRange(startRow, 1, formattedRows.length, formattedRows[0].length).setValues(formattedRows);
       migratedCount += formattedRows.length;
       logMessages.push(`✅ ย้ายข้อมูล ${formattedRows.length} รายการ เข้าชีต ${sheetName}`);
    }
  });
  
  const finalMsg = `🎉 ทำการย้ายข้อมูลสำเร็จทั้งหมด ${migratedCount} รายการ!\n\nรายละเอียด:\n` + logMessages.join('\n');
  Logger.log(finalMsg);
  return finalMsg;
}
