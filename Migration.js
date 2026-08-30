function migrateTeachersToUsers() {
  const db = SpreadsheetApp.getActiveSpreadsheet();
  const usersSheet = db.getSheetByName('UsersDB');
  const teachersSheet = db.getSheetByName('TeachersDB');
  
  if (!usersSheet || !teachersSheet) {
    Logger.log("Error: UsersDB or TeachersDB not found.");
    return;
  }
  
  // New headers for UsersDB
  const newHeaders = ['Username', 'Password', 'Role', 'Nickname', 'FullName', 'Phone', 'ProfilePic', 'School', 'Subjects', 'Bank', 'AccountNumber', 'Compensation', 'AccountType'];
  
  // Set new headers
  usersSheet.getRange(1, 1, 1, newHeaders.length).setValues([newHeaders]);
  usersSheet.getRange(1, 1, 1, newHeaders.length).setFontWeight("bold").setBackground("#f3f4f6");
  
  const uRows = usersSheet.getDataRange().getValues();
  const tRows = teachersSheet.getDataRange().getValues();
  
  let matchCount = 0;
  
  for (let i = 1; i < uRows.length; i++) {
    const role = uRows[i][2] ? uRows[i][2].toString().trim() : '';
    if (role === 'Teacher') {
      const username = uRows[i][0] ? uRows[i][0].toString().trim().toLowerCase() : '';
      const nickname = uRows[i][3] ? uRows[i][3].toString().replace(/^ครู/, '').trim().toLowerCase() : '';
      
      let foundTeacher = null;
      for (let j = 1; j < tRows.length; j++) {
        const tNick = tRows[j][0] ? tRows[j][0].toString().replace(/^ครู/, '').trim().toLowerCase() : '';
        const tId = tRows[j][8] ? tRows[j][8].toString().trim().toLowerCase() : '';
        
        if ((tId && tId === username) || (nickname && tNick === nickname)) {
          foundTeacher = tRows[j];
          break;
        }
      }
      
      if (foundTeacher) {
        // 'Nickname' (0), 'FullName' (1), 'School' (2), 'Phone' (3), 'Subjects' (4), 'Bank' (5), 'AccountNumber' (6), 'Compensation' (7), 'TeacherID' (8), 'AccountType' (9)
        // Map to: School (8), Subjects (9), Bank (10), AccountNumber (11), Compensation (12), AccountType (13)
        const updates = [
          foundTeacher[2] || '', // School
          foundTeacher[4] || '', // Subjects
          foundTeacher[5] || '', // Bank
          foundTeacher[6] || '', // AccountNumber
          foundTeacher[7] || '', // Compensation
          foundTeacher[9] || 'บัญชีทั่วไป' // AccountType
        ];
        
        usersSheet.getRange(i + 1, 8, 1, 6).setValues([updates]);
        matchCount++;
      }
    }
  }
  
  Logger.log("Migration complete. Successfully migrated " + matchCount + " teachers.");
}
