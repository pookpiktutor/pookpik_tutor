import sys

sys.stdout.reconfigure(encoding='utf-8')

new_camps_code = '''// --- Helper: Get standard camp price ---
function getCampPrice(campName, grade, campType, dailyCount) {
  campName = String(campName || '');
  grade = String(grade || '');
  let fullCost = 7900;
  let dailyCost = 1700;

  if (campName.includes('เตรียมความพร้อม') || campName.includes('เมษายน')) {
    fullCost = 4400;
    dailyCost = 1700;
  } else if (campName.includes('วางแผนติดspeed') || campName.includes('ตุลาคม') || campName.includes('สานฝันปั้นน้อง')) {
    if (grade.includes('ม.3')) {
      fullCost = 8900;
      dailyCost = 1900;
    } else {
      fullCost = 7900;
      dailyCost = 1700;
    }
  } else {
    if (grade.includes('ม.3')) {
      fullCost = 8900;
      dailyCost = 1900;
    }
  }

  if (campType === 'daily') {
    const count = parseInt(dailyCount) || 1;
    return { full: dailyCost * count, dailyRate: dailyCost, baseFull: fullCost, isDaily: true, count: count };
  } else {
    return { full: fullCost, dailyRate: dailyCost, baseFull: fullCost, isDaily: false, count: 0 };
  }
}

// --- Save / Register student for camp ---
function saveCampStudentData(campData) {
  try {
    const db = getDb();
    let slipUrl = '-';

    if (campData.fileData && campData.fileData.base64) {
      let folder;
      const folderName = 'data_PookPik_Tutor_Slips';
      const props = PropertiesService.getScriptProperties();
      const folderId = props.getProperty('SLIP_FOLDER_ID');
      
      if (folderId) {
        try {
          folder = DriveApp.getFolderById(folderId);
        } catch(e) {
          folder = null;
        }
      }
      if (!folder) {
        const folders = DriveApp.getFoldersByName(folderName);
        if (folders.hasNext()) {
          folder = folders.next();
        } else {
          folder = DriveApp.createFolder(folderName);
        }
        props.setProperty('SLIP_FOLDER_ID', folder.getId());
      }
      const content = Utilities.base64Decode(campData.fileData.base64);
      const blob = Utilities.newBlob(content, campData.fileData.mimeType, 'camp_slip_' + Date.now() + '_' + campData.fileData.fileName);
      const file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      slipUrl = file.getUrl();
    }

    let sheet = db.getSheetByName('ลงทะเบียนค่าย');
    if (!sheet) {
      sheet = db.insertSheet('ลงทะเบียนค่าย');
      sheet.appendRow([
        'Timestamp', 'ชื่อค่าย', 'ปีการศึกษา', 'ระดับชั้น', 'ห้องเรียน', 
        'ชื่อ-นามสกุล', 'ชื่อเล่น', 'เบอร์โทรผู้ปกครอง', 'สถานะ', 'โรงเรียน', 
        'โรคประจำตัว/แพ้อาหาร', 'Size เสื้อ', 'สลิป',
        'ยอดเต็ม', 'ยอดชำระ', 'ค้างชำระ',
        'วันที่งวด 1', 'ยอดเงินงวด 1', 'ช่องทางงวด 1',
        'วันที่งวด 2', 'ยอดเงินงวด 2', 'ช่องทางงวด 2',
        'วันที่งวด 3', 'ยอดเงินงวด 3', 'ช่องทางงวด 3'
      ]);
      sheet.getRange("A1:Y1").setFontWeight("bold").setBackground("#e0e7ff");
      sheet.setFrozenRows(1);
    }

    // Ensure headers exist up to Y (Col 25)
    const headers = sheet.getRange(1, 1, 1, 25).getValues()[0];
    if (!headers[13] || headers[13] !== 'ยอดเต็ม') {
      const headerUpdates = [['ยอดเต็ม', 'ยอดชำระ', 'ค้างชำระ', 
        'วันที่งวด 1', 'ยอดเงินงวด 1', 'ช่องทางงวด 1',
        'วันที่งวด 2', 'ยอดเงินงวด 2', 'ช่องทางงวด 2',
        'วันที่งวด 3', 'ยอดเงินงวด 3', 'ช่องทางงวด 3']];
      sheet.getRange(1, 14, 1, 12).setValues(headerUpdates);
    }
    
    const data = sheet.getDataRange().getValues();
    let rowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(campData.timestamp) ||
         (data[i][1] === (campData.camp_name || '') && data[i][2] === (campData.camp_year || '') && data[i][5] === (campData.std_name || ''))) {
        rowIndex = i + 1;
        break;
      }
    }

    const priceInfo = getCampPrice(campData.camp_name, campData.std_grade, campData.camp_type, campData.daily_count);
    const fullCost = parseFloat(campData.full) || priceInfo.full;
    const paidAmount = parseFloat(campData.paid) || parseFloat(campData.amount_paid) || 0;
    const outstanding = Math.max(0, fullCost - paidAmount);
    const todayStr = new Date().toISOString().split('T')[0];

    const rowData = [
      campData.timestamp || new Date().toLocaleString('th-TH'),
      campData.camp_name || '',
      campData.camp_year || '',
      campData.std_grade || '',
      campData.class_section || '',
      campData.std_name || '',
      campData.std_nickname || '',
      campData.parent_contact || campData.parent_phone || '',
      campData.status || (outstanding <= 0 ? 'ชำระครบแล้ว' : (paidAmount > 0 ? 'มัดจำแล้ว' : 'รอตรวจสอบ')),
      campData.std_school || '',
      campData.medical_condition || '',
      campData.shirt_size || '',
      slipUrl,
      fullCost,
      paidAmount,
      outstanding,
      campData.pay_r1_date || (paidAmount > 0 ? todayStr : ''),
      campData.pay_r1_amount || (paidAmount > 0 ? paidAmount : ''),
      campData.pay_r1_channel || (paidAmount > 0 ? 'โอนเงิน (แนบสลิป)' : ''),
      campData.pay_r2_date || '',
      campData.pay_r2_amount || '',
      campData.pay_r2_channel || '',
      campData.pay_r3_date || '',
      campData.pay_r3_amount || '',
      campData.pay_r3_channel || ''
    ];

    if (rowIndex > -1) {
      if (slipUrl === '-' && data[rowIndex - 1][12]) {
         rowData[12] = data[rowIndex - 1][12];
      }
      sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
    }
    
    return { success: true };
  } catch (e) {
    Logger.log('ERROR in saveCampStudentData: ' + e.message);
    return { success: false, error: e.message };
  }
}

// --- Get Camps Filter Options ---
function getCampsFilterOptions() {
  try {
    const db = getDb();
    const sheet = db.getSheetByName('ลงทะเบียนค่าย');
    if (!sheet) return { campNames: [], academicYears: [] };
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { campNames: [], academicYears: [] };
    
    const campNamesSet = new Set();
    const yearsSet = new Set();
    
    for (let i = 1; i < data.length; i++) {
      const campName = (data[i][1] || '').toString().trim();
      const year = (data[i][2] || '').toString().trim();
      if (campName) campNamesSet.add(campName);
      if (year) yearsSet.add(year);
    }
    
    return {
      campNames: Array.from(campNamesSet).sort(),
      academicYears: Array.from(yearsSet).sort().reverse()
    };
  } catch (e) {
    Logger.log('ERROR in getCampsFilterOptions: ' + e.message);
    return { campNames: [], academicYears: [] };
  }
}

// --- Get Camps Data for Employee Dashboard ---
function getCampsData(academicYear, campName) {
  try {
    const db = getDb();
    const sheet = db.getSheetByName('ลงทะเบียนค่าย');
    if (!sheet) return [];
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];
    
    const results = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const cName = row[1] || '';
      const cGrade = row[3] || '';
      const defaultPrice = getCampPrice(cName, cGrade, 'full', 1);
      
      let full = parseFloat(row[13]);
      if (isNaN(full) || full <= 0) {
        full = defaultPrice.full;
      }
      const paid = parseFloat(row[14]) || 0;
      const outstanding = Math.max(0, full - paid);

      const item = {
        timestamp: row[0],
        camp_name: cName,
        camp_year: row[2],
        std_grade: cGrade,
        class_section: row[4],
        std_name: row[5],
        std_nickname: row[6],
        parent_phone: row[7],
        status: row[8] || (outstanding <= 0 ? 'ชำระครบแล้ว' : (paid > 0 ? 'มัดจำแล้ว' : 'รอตรวจสอบ')),
        std_school: row[9] || '',
        medical_condition: row[10] || '',
        shirt_size: row[11] || '',
        slip_url: row[12] || '',
        full: full,
        paid: paid,
        outstanding: outstanding,
        pay_r1_date: row[16] ? cleanSheetDate(row[16]) : '',
        pay_r1_amount: parseFloat(row[17]) || 0,
        pay_r1_channel: row[18] || '',
        pay_r2_date: row[19] ? cleanSheetDate(row[19]) : '',
        pay_r2_amount: parseFloat(row[20]) || 0,
        pay_r2_channel: row[21] || '',
        pay_r3_date: row[22] ? cleanSheetDate(row[22]) : '',
        pay_r3_amount: parseFloat(row[23]) || 0,
        pay_r3_channel: row[24] || ''
      };
      
      let match = true;
      if (academicYear && academicYear !== 'all' && String(item.camp_year) !== String(academicYear)) {
        match = false;
      }
      if (campName && campName !== 'all' && String(item.camp_name) !== String(campName)) {
        match = false;
      }
      
      if (match) {
        results.push(item);
      }
    }
    
    return results.reverse();
  } catch (e) {
    Logger.log('ERROR in getCampsData: ' + e.message);
    return {error: e.message};
  }
}

// --- Update Camp Status ---
function updateCampStatus(timestamp, newStatus) {
  try {
    const db = getDb();
    const sheet = db.getSheetByName('ลงทะเบียนค่าย');
    if (!sheet) return {success: false, error: 'ไม่พบชีทลงทะเบียนค่าย'};
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return {success: false, error: 'ไม่มีข้อมูลในชีท'};
    
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(timestamp)) {
        sheet.getRange(i + 1, 9).setValue(newStatus);
        return {success: true};
      }
    }
    
    return {success: false, error: 'ไม่พบข้อมูลนักเรียนที่ต้องการอัปเดต'};
  } catch (e) {
    Logger.log('ERROR in updateCampStatus: ' + e.message);
    return {success: false, error: e.message};
  }
}

// --- Delete Camp Student Record Directly ---
function deleteCampStudentByTimestamp(timestamp) {
  try {
    const db = getDb();
    const sheet = db.getSheetByName('ลงทะเบียนค่าย');
    if (!sheet) return {success: false, error: 'ไม่พบชีทลงทะเบียนค่าย'};
    
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(timestamp)) {
        sheet.deleteRow(i + 1);
        return {success: true};
      }
    }
    return {success: false, error: 'ไม่พบรายการที่ต้องการลบ'};
  } catch (e) {
    Logger.log('ERROR in deleteCampStudentByTimestamp: ' + e.message);
    return {success: false, error: e.message};
  }
}

// --- Update Student Camp Data (Edit from Staff Manage Modal) ---
function updateCampStudentData(timestamp, updatedData) {
  try {
    const db = getDb();
    const sheet = db.getSheetByName('ลงทะเบียนค่าย');
    if (!sheet) return {success: false, error: 'ไม่พบชีทลงทะเบียนค่าย'};
    
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(timestamp)) {
        const rIndex = i + 1;
        const full = parseFloat(updatedData.full) || 0;
        const paid = parseFloat(updatedData.paid) || 0;
        const outstanding = Math.max(0, full - paid);

        const rowUpdates = [
          [
            data[i][0], // Timestamp
            updatedData.camp_name || data[i][1],
            updatedData.camp_year || data[i][2],
            updatedData.std_grade || data[i][3],
            updatedData.class_section || data[i][4],
            updatedData.std_name || data[i][5],
            updatedData.std_nickname || data[i][6],
            updatedData.parent_phone || data[i][7],
            updatedData.status || data[i][8],
            updatedData.std_school || data[i][9],
            updatedData.medical_condition || data[i][10],
            updatedData.shirt_size || data[i][11],
            updatedData.slip_url || data[i][12],
            full,
            paid,
            outstanding,
            updatedData.pay_r1_date || '',
            updatedData.pay_r1_amount || '',
            updatedData.pay_r1_channel || '',
            updatedData.pay_r2_date || '',
            updatedData.pay_r2_amount || '',
            updatedData.pay_r2_channel || '',
            updatedData.pay_r3_date || '',
            updatedData.pay_r3_amount || '',
            updatedData.pay_r3_channel || ''
          ]
        ];
        sheet.getRange(rIndex, 1, 1, 25).setValues(rowUpdates);
        return {success: true};
      }
    }
    return {success: false, error: 'ไม่พบรายการนักเรียน'};
  } catch (e) {
    Logger.log('ERROR in updateCampStudentData: ' + e.message);
    return {success: false, error: e.message};
  }
}

// --- Save Camp Payment ---
function saveCampPayment(timestamp, paymentData) {
  try {
    const db = getDb();
    const sheet = db.getSheetByName('ลงทะเบียนค่าย');
    if (!sheet) return {success: false, error: 'ไม่พบชีทลงทะเบียนค่าย'};
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return {success: false, error: 'ไม่มีข้อมูลในชีท'};
    
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(timestamp)) {
        const rIndex = i + 1;
        const rowUpdates = [
          [
            paymentData.full || 0,
            paymentData.paid || 0,
            paymentData.outstanding || 0,
            paymentData.pay_r1_date || '',
            paymentData.pay_r1_amount || '',
            paymentData.pay_r1_channel || '',
            paymentData.pay_r2_date || '',
            paymentData.pay_r2_amount || '',
            paymentData.pay_r2_channel || '',
            paymentData.pay_r3_date || '',
            paymentData.pay_r3_amount || '',
            paymentData.pay_r3_channel || ''
          ]
        ];
        sheet.getRange(rIndex, 14, 1, 12).setValues(rowUpdates);
        
        if (paymentData.status) {
          sheet.getRange(rIndex, 9).setValue(paymentData.status);
        }
        
        return {success: true};
      }
    }
    
    return {success: false, error: 'ไม่พบข้อมูลนักเรียนที่ต้องการอัปเดต'};
  } catch (e) {
    Logger.log('ERROR in saveCampPayment: ' + e.message);
    return {success: false, error: e.message};
  }
}

// --- Search Unpaid Student Payment (Both Regular & Camp) ---
function searchStudentPayment(studentName) {
  const db = getDb();
  let results = {
    regular: [],
    camp: []
  };
  if (!studentName || studentName.trim() === '') return results;
  const searchName = studentName.trim().toLowerCase();

  const statusSheet = db.getSheetByName('StatusDB');
  if (statusSheet) {
    const data = statusSheet.getDataRange().getValues();
    const headers = data[0];
    const idIdx = headers.indexOf('ID');
    const nameIdx = headers.indexOf('ชื่อ-นามสกุล');
    const courseIdx = headers.indexOf('สาขาเรียน');
    const costIdx = headers.indexOf('ค่าเรียน');
    const paidIdx = headers.indexOf('ยอดจ่ายมา');
    const remainIdx = headers.indexOf('คงเหลือ');
    
    if (nameIdx !== -1) {
      for (let i = 1; i < data.length; i++) {
        let row = data[i];
        let name = String(row[nameIdx] || '').trim().toLowerCase();
        if (name.includes(searchName)) {
           let cost = costIdx !== -1 ? (parseFloat(row[costIdx]) || 0) : 0;
           let paid = paidIdx !== -1 ? (parseFloat(row[paidIdx]) || 0) : 0;
           let remaining = remainIdx !== -1 ? (parseFloat(row[remainIdx]) || 0) : (cost - paid);
           results.regular.push({
              id: idIdx !== -1 ? (row[idIdx] || ('R' + i)) : ('R' + i),
              name: String(row[nameIdx] || ''),
              course: courseIdx !== -1 ? String(row[courseIdx] || '-') : '-',
              cost: cost,
              paid: paid,
              remaining: remaining
           });
        }
      }
    }
  }

  const campSheet = db.getSheetByName('ลงทะเบียนค่าย');
  if (campSheet) {
    const data = campSheet.getDataRange().getValues();
    if (data.length > 1) {
      for (let i = 1; i < data.length; i++) {
        let row = data[i];
        let name = String(row[5] || '').trim().toLowerCase(); // Col F = std_name
        if (name.includes(searchName)) {
           let cName = String(row[1] || '');
           let cGrade = String(row[3] || '');
           let defaultPrice = getCampPrice(cName, cGrade, 'full', 1);
           
           let full = parseFloat(row[13]);
           if (isNaN(full) || full <= 0) full = defaultPrice.full;
           let paid = parseFloat(row[14]) || 0;
           let remaining = Math.max(0, full - paid);
           let status = String(row[8] || '');

           results.camp.push({
              timestamp: row[0],
              id: 'C' + i,
              name: String(row[5] || ''),
              nickname: String(row[6] || ''),
              campName: cName,
              year: String(row[2] || ''),
              grade: cGrade,
              room: String(row[4] || ''),
              costFull: full,
              paid: paid,
              remaining: remaining,
              status: status || (remaining <= 0 ? 'ชำระครบแล้ว' : 'ค้างชำระ')
           });
        }
      }
    }
  }

  return results;
}

// --- Submit Payment Slip from Search Screen (Updates existing student record) ---
function confirmSearchPayment(payload) {
  try {
    const db = getDb();
    let slipUrl = '-';

    if (payload.fileData && payload.fileData.base64) {
      let folder;
      const folderName = 'data_PookPik_Tutor_Slips';
      const props = PropertiesService.getScriptProperties();
      const folderId = props.getProperty('SLIP_FOLDER_ID');
      
      if (folderId) {
        try {
          folder = DriveApp.getFolderById(folderId);
        } catch(e) {
          folder = null;
        }
      }
      if (!folder) {
        const folders = DriveApp.getFoldersByName(folderName);
        if (folders.hasNext()) {
          folder = folders.next();
        } else {
          folder = DriveApp.createFolder(folderName);
        }
        props.setProperty('SLIP_FOLDER_ID', folder.getId());
      }
      const content = Utilities.base64Decode(payload.fileData.base64);
      const blob = Utilities.newBlob(content, payload.fileData.mimeType, 'payment_slip_' + Date.now() + '_' + payload.fileData.fileName);
      const file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      slipUrl = file.getUrl();
    }

    if (payload.camp_items && payload.camp_items.length > 0) {
      const campSheet = db.getSheetByName('ลงทะเบียนค่าย');
      if (campSheet) {
        const data = campSheet.getDataRange().getValues();
        payload.camp_items.forEach(item => {
          for (let i = 1; i < data.length; i++) {
            if (String(data[i][0]) === String(item.timestamp) || 
               (data[i][5] === item.name && data[i][1] === item.campName)) {
              const rIndex = i + 1;
              const currentPaid = parseFloat(data[i][14]) || 0;
              const transferAmt = parseFloat(item.amount) || 0;
              const newPaid = currentPaid + transferAmt;
              const fullCost = parseFloat(data[i][13]) || item.costFull || 0;
              const newOutstanding = Math.max(0, fullCost - newPaid);
              const todayStr = new Date().toISOString().split('T')[0];

              campSheet.getRange(rIndex, 15).setValue(newPaid);
              campSheet.getRange(rIndex, 16).setValue(newOutstanding);
              
              if (slipUrl !== '-') {
                campSheet.getRange(rIndex, 13).setValue(slipUrl);
              }
              
              const newStatus = (newOutstanding <= 0) ? 'ชำระครบแล้ว' : 'มัดจำแล้ว';
              campSheet.getRange(rIndex, 9).setValue(newStatus);

              const pay1Amt = parseFloat(data[i][17]) || 0;
              if (pay1Amt === 0) {
                campSheet.getRange(rIndex, 17).setValue(todayStr);
                campSheet.getRange(rIndex, 18).setValue(transferAmt);
                campSheet.getRange(rIndex, 19).setValue('โอนเงิน (สลิป)');
              } else {
                campSheet.getRange(rIndex, 20).setValue(todayStr);
                campSheet.getRange(rIndex, 21).setValue(transferAmt);
                campSheet.getRange(rIndex, 22).setValue('โอนเงิน (สลิป)');
              }
              break;
            }
          }
        });
      }
    }

    let sheet = db.getSheetByName('แจ้งชำระเงิน');
    if (!sheet) {
      sheet = db.insertSheet('แจ้งชำระเงิน');
      sheet.appendRow(['Timestamp', 'ชื่อ-นามสกุล', 'รายการที่เลือก', 'ยอดรวมที่ต้องชำระ', 'ยอดที่โอน', 'ลิงก์สลิป', 'สถานะ']);
      sheet.getRange("A1:G1").setFontWeight("bold").setBackground("#e0e7ff");
      sheet.setFrozenRows(1);
    }
    
    sheet.appendRow([
      payload.timestamp || new Date().toLocaleString('th-TH'),
      payload.std_name || '',
      payload.selected_items || '',
      payload.total_amount || 0,
      payload.transfer_amount || 0,
      slipUrl,
      'รอตรวจสอบ'
    ]);

    return { success: true };
  } catch (e) {
    Logger.log('ERROR in confirmSearchPayment: ' + e.message);
    return { success: false, error: e.message };
  }
}
'''

for target_file in ['src/Code.js', 'Code.js']:
    with open(target_file, 'r', encoding='utf-8') as f:
        content = f.read()

    idx1 = content.find('function saveCampStudentData')
    if idx1 != -1:
        content = content[:idx1] + new_camps_code
    else:
        content += '\n' + new_camps_code

    with open(target_file, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Updated {target_file} successfully!')
