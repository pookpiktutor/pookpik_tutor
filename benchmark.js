
function runBenchmark() {
  const start = new Date().getTime();
  
  const t1 = new Date().getTime();
  const db = SpreadsheetApp.openById('1yRz-J2iV39OqQo4iT6tK0hP3L4z8S4H4O9t7U4g9q3M');
  const t2 = new Date().getTime();
  
  const classSheet = db.getSheetByName('Data Learn');
  const t3 = new Date().getTime();
  
  const cData = classSheet.getDataRange().getValues();
  const t4 = new Date().getTime();
  
  return {
    openById: t2 - t1,
    getSheetByName: t3 - t2,
    getValues: t4 - t3,
    total: t4 - start,
    rows: cData.length
  };
}
