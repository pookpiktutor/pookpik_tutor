import os

code_js_path = 'g:/My Drive/0.งานสถาบัน/data_PookPik_Tutor/Code.js'

with open(code_js_path, 'r', encoding='utf-8') as f:
    content = f.read()

if "function deleteMultipleEvaluations" not in content:
    new_func = """
function deleteMultipleEvaluations(evalIds, logUser) {
  try {
    const sheet = connectToSheet('Evaluations');
    const data = sheet.getDataRange().getValues();
    
    // We iterate backwards to safely delete rows
    let deletedCount = 0;
    for (let i = data.length - 1; i > 0; i--) {
      const rowEvalId = data[i][0];
      if (evalIds.includes(rowEvalId)) {
        sheet.deleteRow(i + 1);
        deletedCount++;
      }
    }
    
    logActivity('System', 'ลบใบประเมิน (หลายรายการ)', `Deleted ${deletedCount} evaluations by ${logUser}`);
    return { success: true, deletedCount: deletedCount };
  } catch (err) {
    Logger.log("Error in deleteMultipleEvaluations: " + err.message);
    return { success: false, error: err.message };
  }
}
"""
    with open(code_js_path, 'a', encoding='utf-8') as f:
        f.write("\n" + new_func)
    print("SUCCESS: deleteMultipleEvaluations function appended to Code.js")
else:
    print("Function already exists.")
