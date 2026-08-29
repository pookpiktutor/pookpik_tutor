function testHeader() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("เดี่ยว ป.1");
  const headers = sheet.getRange(11, 1, 1, sheet.getLastColumn()).getValues()[0];
  console.log(headers);
}
