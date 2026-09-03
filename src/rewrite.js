
    const mainSheets = [
      'อนุบาล/1','ป.1/1','ป.2/1','ป.3/1','ป.4/1','ป.5/1','ป.6/1','ม.1/1','ม.2/1','ม.3/1','ม.4/1','ม.5/1','ม.6/1',
      'อนุบาล/2','ป.1/2','ป.2/2','ป.3/2','ป.4/2','ป.5/2','ป.6/2','ม.1/2','ม.2/2','ม.3/2','ม.4/2','ม.5/2','ม.6/2',
      'อนุบาล/3','ป.1/3','ป.2/3','ป.3/3','ป.4/3','ป.5/3','ป.6/3','ม.1/3','ม.2/3','ม.3/3','ม.4/3','ม.5/3','ม.6/3'
    ];
    
    const privateSheets = [
      'เดี่ยว อนุบาล','เดี่ยว ป.1','เดี่ยว ป.2','เดี่ยว ป.3','เดี่ยว ป.4','เดี่ยว ป.5','เดี่ยว ป.6','เดี่ยว ม.1','เดี่ยว ม.2','เดี่ยว ม.3','เดี่ยว ม.4','เดี่ยว ม.5','เดี่ยว ม.6',
      'ย่อย 2-3','ย่อย 4-5','ย่อย 6-10'
    ];

    // Main Sheets (Horizontal matching)
    for (let sheetName of mainSheets) {
      const sheet = db.getSheetByName(sheetName);
      if (!sheet) continue;
      
      const data = sheet.getDataRange().getValues();
      if (data.length < 4) continue;
      
      const courseRow = data[0]; // Row 1 (Index 0)
      const dayTimeRow = data[2]; // Row 3 (Index 2)
      
      let branch = '';
      if (sheetName.includes('/1')) branch = 'สาขา 1';
      else if (sheetName.includes('/2')) branch = 'สาขา 2';
      else if (sheetName.includes('/3')) branch = 'สาขา 3';
      
      for (let key of courseKeys) {
        const cInfo = teacherCoursesMap[key];
        const targetCourseName = cInfo.courseName.toLowerCase().trim();
        const targetDayTime = cInfo.dayTimeStr ? cInfo.dayTimeStr.toLowerCase().trim() : '';
        
        for (let c = 4; c < courseRow.length; c++) {
          const cellCourse = (courseRow[c] || '').toString().toLowerCase().trim();
          const cellDayTime = (dayTimeRow[c] || '').toString().toLowerCase().trim();
          
          let isMatch = matchCourseName(targetCourseName, cellCourse);
          if (isMatch && targetDayTime) {
            if (cellDayTime && !cellDayTime.includes(targetDayTime) && !targetDayTime.includes(cellDayTime) && !cellCourse.includes(targetDayTime)) {
               isMatch = false;
            }
          }
          
          if (isMatch) {
               // Start from row 6 (index 5)
               for (let r = 5; r < data.length; r++) {
                  const val = data[r][c];
                  if (val !== '' && val !== null && !isNaN(val) && parseFloat(val) > 0) {
                     let idCol = 1, fnameCol = 1, nickCol = 2;
                     const sId = (data[r][idCol] || '').toString().trim();
                     const sFname = (data[r][fnameCol] || '').toString().trim();
                     const sLname = '';
                     let sNick = (data[r][nickCol] || '').toString().trim();
                     if (sNick.includes('GMT+') || sNick.match(/Sun|Mon|Tue|Wed|Thu|Fri|Sat.*202\d/)) sNick = '';
                     
                     const existing = cInfo.students.find(s => s.studentId === sId && sId !== '');
                     if (!existing) {
                       cInfo.students.push({
                         studentId: sId,
                         nickname: sNick,
                         name: (sFname + ' ' + sLname).trim(),
                         firstname: sFname,
                         lastname: sLname,
                         grade: sheetName.split('/')[0],
                         branch: branch
                       });
                     }
                  }
               }
             }
          }
        }
      }

    // Private/Subgroup Sheets (Vertical matching)
    for (let sheetName of privateSheets) {
      const sheet = db.getSheetByName(sheetName);
      if (!sheet) continue;
      
      const data = sheet.getDataRange().getValues();
      if (data.length < 12) continue; // Header at row 11, data starts row 12
      
      for (let key of courseKeys) {
        const cInfo = teacherCoursesMap[key];
        const targetCourseName = cInfo.courseName.toLowerCase().trim();
        const targetDayTime = cInfo.dayTimeStr ? cInfo.dayTimeStr.toLowerCase().trim() : '';
        
        for (let r = 11; r < data.length; r++) {
          const colK = (data[r][10] || '').toString().toLowerCase().trim(); // Column K = index 10 = รอบเรียน
          if (!colK) continue;
          
          let isMatch = matchCourseName(targetCourseName, colK);
          if (isMatch && targetDayTime) {
             if (!colK.includes(targetDayTime)) {
                // For private sheets, the day/time might be in Col K as well
                isMatch = false;
             }
          }
          
          if (isMatch) {
             const sId = (data[r][1] || '').toString().trim(); // Column B
             const sNick = (data[r][2] || '').toString().trim(); // Column C
             const sFname = sId;
             const sLname = '';
             const grade = (data[r][5] || '').toString().trim(); // Column F = ระดับชั้น
             const branch = (data[r][8] || '').toString().trim(); // Column I = สาขา
             
             const existing = cInfo.students.find(s => s.studentId === sId && sId !== '');
             if (!existing && sId) {
                cInfo.students.push({
                   studentId: sId,
                   nickname: sNick,
                   name: (sFname + ' ' + sLname).trim(),
                   firstname: sFname,
                   lastname: sLname,
                   grade: grade || sheetName,
                   branch: branch
                });
             }
          }
        }
      }
    }

