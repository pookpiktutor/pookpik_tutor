function exploreSourceDb() {
  const sourceId = '1ljRQexe6VoPtUBaaPvpMPs_CjaflvtKpPoYidH5PwLc';
  const ss = SpreadsheetApp.openById(sourceId);
  const sheets = ss.getSheets();
  const info = sheets.map(s => {
    const name = s.getName();
    const lastRow = s.getLastRow();
    const lastCol = s.getLastColumn();
    let headers = [];
    if (lastRow > 0 && lastCol > 0) {
      headers = s.getRange(1, 1, Math.min(5, lastRow), Math.min(20, lastCol)).getValues();
    }
    return { name, lastRow, lastCol, headers };
  });
  console.log(JSON.stringify(info));
  return JSON.stringify(info);
}
