const { google } = require('googleapis');
const path = require('path');

const keyPath = path.join(__dirname, 'service-account.json');
const auth = new google.auth.GoogleAuth({
  keyFile: keyPath,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const spreadsheetId = '1QLEJgYWHfDQVwRZg7nTPc0ViTu7mpkBF26Fk6NocQaI';

async function main() {
  const authClient = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: authClient });
  
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'DebugLog!A1:C50',
    });
    
    const rows = res.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found in DebugLog.');
      return;
    }
    
    console.log('DebugLog content:');
    rows.forEach(row => {
      console.log(`${row[0]} | ${row[1]} | ${row[2]}`);
    });
  } catch (err) {
    console.error('Error reading sheet:', err.message);
  }
}

main();
