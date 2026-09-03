
function logToDebugSheet(label, data) {
  try {
    var db = SpreadsheetApp.openById('1QLEJgYWHfDQVwRZg7nTPc0ViTu7mpkBF26Fk6NocQaI');
    var sheet = db.getSheetByName('DebugLog');
    if (!sheet) {
      sheet = db.insertSheet('DebugLog');
    }
    sheet.appendRow([new Date(), label, typeof data === 'object' ? JSON.stringify(data) : data]);
  } catch (e) {
    // ignore
  }
}

