import re

with open('Code.js', 'r', encoding='utf-8') as f:
    text = f.read()

target = """function verifyLogin(username, password) {
  // initAllDatabases(); // Removed redundant call for speed
  const db = getDb();
  const cleanUsername = username ? username.toString().trim() : '';
  const cleanUsernameLower = cleanUsername.toLowerCase();
  
  const cleanPassword = password ? password.toString().trim() : '';
  if (!cleanUsername || !cleanPassword) {
    return { success: false, error: 'กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน' };
  }
  
    const sheet = db.getSheetByName('UsersDB');
  if (!sheet) {
    return { success: false, error: 'ไม่พบตารางฐานข้อมูลผู้ใช้งาน UsersDB' };
  }
  let rows = sheet.getDataRange().getValues();
  
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] && rows[i][1]) {
      const dbUsername = rows[i][0].toString().trim().toLowerCase();
      const dbPassword = rows[i][1].toString().trim();
      
      if (dbUsername === cleanUsernameLower && dbPassword === cleanPassword) {
        let role = rows[i][2] ? rows[i][2].toString().trim() : 'Staff';
        const nickname = rows[i][3] ? rows[i][3].toString().trim() : '';
        const profilePic = rows[i][6] ? rows[i][6].toString().trim() : '';
        
        // ถ้าชื่อ user (username หรือ nickname) ตรงกับฐานข้อมูล TeachersDB คอลัมน์ A หรือมีคำว่า "ครู" ให้จำกัดสิทธิ์เป็นครูผู้สอนทันที
        if (isTeacherUser(dbUsername, nickname)) {
          role = 'Teacher';
        }
        
        logActivity(rows[i][0].toString().trim(), 'เข้าสู่ระบบ', 'เจ้าหน้าที่เข้าใช้ระบบสำเร็จ' + (role === 'Teacher' ? ' (จำกัดสิทธิ์ครูผู้สอน)' : ''));
        return { success: true, user: { username: dbUsername, role: role, nickname: nickname, profilePic: profilePic } };
      }
    }
  }

  return { success: false, error: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง' };
}"""

replacement = """function verifyLogin(username, password) {
  const db = getDb();
  const cleanUsername = username ? username.toString().trim() : '';
  const cleanUsernameLower = cleanUsername.toLowerCase();
  
  const cleanPassword = password ? password.toString().trim() : '';
  if (!cleanUsername || !cleanPassword) {
    return { success: false, error: 'กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน' };
  }
  
  const sheet = db.getSheetByName('UsersDB');
  if (!sheet) {
    return { success: false, error: 'ไม่พบตารางฐานข้อมูลผู้ใช้งาน UsersDB' };
  }
  const rows = sheet.getDataRange().getValues();
  
  for (let i = 1; i < rows.length; i++) {
    let dbUsername = rows[i][0] !== undefined && rows[i][0] !== null ? rows[i][0].toString().trim() : '';
    let dbPassword = rows[i][1] !== undefined && rows[i][1] !== null ? rows[i][1].toString().trim() : '';
    let role = rows[i][2] !== undefined && rows[i][2] !== null && rows[i][2].toString().trim() !== '' ? rows[i][2].toString().trim() : 'Student';
    let nickname = rows[i][3] !== undefined && rows[i][3] !== null ? rows[i][3].toString().trim() : '';
    let profilePic = rows[i][4] !== undefined && rows[i][4] !== null ? rows[i][4].toString().trim() : '';

    if (dbUsername.toLowerCase() === cleanUsernameLower && dbPassword === cleanPassword) {
      if (isTeacherUser(dbUsername, nickname)) {
        role = 'Teacher';
      }
      logActivity(dbUsername, 'เข้าสู่ระบบ', 'ผู้ใช้งานเข้าสู่ระบบสำเร็จ' + (role === 'Teacher' ? ' (จำกัดสิทธิ์ครูผู้สอน)' : ''));
      return { 
        success: true, 
        user: { 
          username: dbUsername, 
          role: role,
          nickname: nickname,
          profilePic: profilePic
        } 
      };
    }
  }

  return { success: false, error: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง' };
}"""

# Need to do regex because there might be slight whitespace differences
pattern = re.compile(r"function verifyLogin\(username, password\) \{[\s\S]*?return \{ success: false, error: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง' \};\s*\}")
text = pattern.sub(replacement, text)

with open('Code.js', 'w', encoding='utf-8') as f:
    f.write(text)
print("Restored verifyLogin")
