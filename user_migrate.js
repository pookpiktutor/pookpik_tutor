import { readFileSync } from 'fs';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDR73jjl4afmMVGgCWLXDmKeocmghGX1W4",
  authDomain: "pookpik-tutor.firebaseapp.com",
  projectId: "pookpik-tutor",
  storageBucket: "pookpik-tutor.firebasestorage.app",
  messagingSenderId: "1035837301501",
  appId: "1:1035837301501:web:c21be8f4d4f5b8ec6c5494",
  measurementId: "G-GLYLNRGZZ4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function migrateUsers() {
  console.log("Reading database file for Users migration...");
  let raw;
  try {
    raw = readFileSync('./pookpik_export_data.json', 'utf8');
  } catch (e) {
    console.error("❌ ไม่พบไฟล์ pookpik_export_data.json ในโฟลเดอร์ C:\\Projects\\pookpik_tutor\\");
    process.exit(1);
  }

  const jsonData = JSON.parse(raw);
  if (!jsonData.users || jsonData.users.length === 0) {
    console.log("❌ ไม่พบข้อมูลรายชื่อในตาราง UsersDB");
    process.exit(1);
  }

  console.log(`Found ${jsonData.users.length} users. Creating Firebase Auth accounts...`);

  for (const user of jsonData.users) {
    const username = user.Username || user.username;
    const password = user.Password || user.password;
    
    if (!username || !password) continue;
    
    // แปลงชื่อผู้ใช้เดิมให้เป็นรูปแบบอีเมลเพื่อให้เข้าระบบ Firebase ได้
    // เช่น admin -> admin@pookpiktutor.com หรือครูแทน ->แทน@pookpiktutor.com
    const email = username.includes("@") ? username : `${username}@pookpiktutor.com`;
    
    // ตั้งค่ารหัสผ่านขั้นต่ำ 6 หลักของ Firebase (หากรหัสผ่านเดิมสั้นเกินไปให้ต่อท้ายด้วย 123456)
    const cleanPassword = password.length >= 6 ? password : `${password}123456`;

    try {
      await createUserWithEmailAndPassword(auth, email, cleanPassword);
      console.log(`✓ บัญชีสร้างสำเร็จ: Email: ${email} | Password: ${cleanPassword}`);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`- บัญชีนี้มีอยู่ในระบบแล้ว: ${email}`);
      } else {
        console.error(`❌ เกิดข้อผิดพลาดสำหรับผู้ใช้ ${username}:`, error.message);
      }
    }
  }

  console.log("🎉 SUCCESS: ย้ายบัญชีรายชื่อเดิมเข้าสู่ระบบออนไลน์เรียบร้อยแล้ว!");
  process.exit(0);
}

migrateUsers();
