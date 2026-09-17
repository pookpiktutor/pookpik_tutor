#!/usr/bin/env python3
"""Add deleteEvaluation function to Code.js"""

filepath = 'g:/My Drive/0.งานสถาบัน/data_PookPik_Tutor/Code.js'

function_code = """

function deleteEvaluation(evalId, logUser) {
  try {
    const db = getDb();
    const sheet = db.getSheetByName('EvaluationsDB');
    if (!sheet) {
      return { success: false, error: 'ไม่พบฐานข้อมูล EvaluationsDB' };
    }
    
    const rows = sheet.getDataRange().getValues();
    let rowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      const rowId = rows[i][0] ? String(rows[i][0]).trim() : '';
      const fallbackId = 'EVAL-' + String(i).padStart(4, '0');
      if (rowId === String(evalId).trim() || fallbackId === String(evalId).trim()) {
        rowIndex = i + 1;
        break;
      }
    }
    
    if (rowIndex === -1) {
      return { success: false, error: 'ไม่พบ ID ใบประเมินในระบบ' };
    }
    
    const studentName = rows[rowIndex - 1][2] || 'ไม่ทราบชื่อ';
    sheet.deleteRow(rowIndex);
    
    SpreadsheetApp.flush();
    clearAllEvaluationCaches();
    
    logActivity(logUser, 'ลบใบประเมิน', `ลบใบประเมินนักเรียน: ${studentName}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}
"""

with open(filepath, 'a', encoding='utf-8') as f:
    f.write(function_code)

print("SUCCESS: deleteEvaluation function appended to Code.js")
