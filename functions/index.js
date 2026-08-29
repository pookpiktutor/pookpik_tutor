const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const { google } = require('googleapis');
const path = require('path');

// 1. กำหนดสิทธิ์และเชื่อมต่อ Service Account
const KEYFILE_PATH = path.join(__dirname, 'service-account.json');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILE_PATH,
  scopes: SCOPES,
});

// กำหนด ID ของ Google Sheets (นำมาจาก Code.js เดิม)
const SPREADSHEET_ID = '1QLEJgYWHfDQVwRZg7nTPc0ViTu7mpkBF26Fk6NocQaI';

exports.api = onRequest({cors: true}, async (req, res) => {
  try {
    const { functionName, arguments: args } = req.body;
    logger.info(`Received backend request for: ${functionName}`);

    if (!functionName) {
      return res.status(400).json({ success: false, error: "Missing functionName" });
    }

    // 2. เรียกใช้งาน Google Sheets API แทน SpreadsheetApp
    const sheets = google.sheets({ version: 'v4', auth });

    // ตัวอย่าง: ถ้าหน้าเว็บเรียกใช้ฟังก์ชันอ่านข้อมูล
    if (functionName === 'TEST_CONNECTION') {
       const response = await sheets.spreadsheets.get({
           spreadsheetId: SPREADSHEET_ID
       });
       return res.status(200).json({ 
         success: true, 
         message: "เชื่อมต่อ Google Sheets สำเร็จ!",
         title: response.data.properties.title
       });
    }

    // TODO: ทยอยนำฟังก์ชันจาก Code.js มาเขียนใหม่ให้อยู่ในรูปแบบของ Node.js ที่นี่
    // เนื่องจาก Code.js เดิมมีขนาดกว่า 17,000 บรรทัด จึงต้องค่อยๆ แปลงคำสั่ง SpreadsheetApp ให้เป็น google.sheets()
    
    return res.status(200).json({ 
      success: true, 
      message: `ฟังก์ชัน ${functionName} ยังไม่ได้ถูกแปลงเป็นโค้ด Firebase (กำลังอยู่ระหว่างการพัฒนา)` 
    });

  } catch (error) {
    logger.error("API Error", error);
    return res.status(500).json({ success: false, error: error.toString() });
  }
});
