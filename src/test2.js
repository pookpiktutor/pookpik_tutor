
function testGetDataLearnHeaders() {
  const sheet = getDb().getSheetByName('Data Learn');
  const headers = sheet.getRange(11, 1, 1, 30).getValues()[0];
  Logger.log(JSON.stringify(headers));
}

