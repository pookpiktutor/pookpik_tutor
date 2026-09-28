function getDBEnrollmentsHeaders() {
  const db = getDb();
  const sheet = db.getSheetByName('DB_Enrollments');
  if (!sheet) return 'No DB_Enrollments sheet found';
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  return JSON.stringify(headers);
}
