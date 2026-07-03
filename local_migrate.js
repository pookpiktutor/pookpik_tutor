/**
 * PookPik Tutor - Google Sheets to Firebase Firestore Local Migrator Script
 * 
 * วิธีรันสคริปต์นี้:
 * 1. ตรวจสอบให้แน่ใจว่าไฟล์ pookpik_export_data.json ที่ได้จาก Google Sheets อยู่ในเครื่องคอมพิวเตอร์ของคุณ
 * 2. คัดลอกเนื้อหาทั้งหมดในไฟล์ pookpik_export_data.json นำมาบันทึกเซฟทับใส่ในไฟล์ C:\Projects\pookpik_tutor\pookpik_export_data.json
 * 3. รันคำสั่งต่อไปนี้ใน Terminal เพื่อย้ายข้อมูลเข้า Firestore ทันทีโดยไม่ต้องเปิดเว็บบราวเซอร์:
 *    node local_migrate.js
 */

import { readFileSync } from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, writeBatch, collection } from 'firebase/firestore';

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
const db = getFirestore(app);

async function runLocalMigration() {
  console.log("Reading data file pookpik_export_data.json...");
  let raw;
  try {
    raw = readFileSync('./pookpik_export_data.json', 'utf8');
  } catch (e) {
    console.error("❌ ไม่พบไฟล์ pookpik_export_data.json ในโฟลเดอร์ C:\\Projects\\pookpik_tutor\\");
    console.log("👉 กรุณาดาวน์โหลดไฟล์ export จาก Google Drive และนำมาวางเซฟไว้ที่นี่แล้วลองรันใหม่อีกครั้งครับ");
    process.exit(1);
  }

  const jsonData = JSON.parse(raw);
  console.log("✓ File read successfully. Starting migration database...");

  // 1. Migrate Teachers
  if (jsonData.teachers && jsonData.teachers.length > 0) {
    const batch = writeBatch(db);
    const colRef = collection(db, "teachers");
    jsonData.teachers.forEach((t) => {
      const docRef = doc(colRef, t.TeacherID || t.Nickname);
      batch.set(docRef, {
        nickname: t.Nickname || "",
        fullName: t.FullName || "",
        school: t.School || "",
        phone: t.Phone || "",
        subjects: t.Subjects || "",
        bank: t.Bank || "",
        accountNumber: t.AccountNumber || "",
        compensation: t.Compensation || ""
      });
    });
    await batch.commit();
    console.log("⚡ Teachers migrated successfully.");
  }

  // 2. Migrate Rooms
  if (jsonData.rooms && jsonData.rooms.length > 0) {
    const batch = writeBatch(db);
    const colRef = collection(db, "rooms");
    jsonData.rooms.forEach((r, idx) => {
      const docRef = doc(colRef, `room_${idx}`);
      batch.set(docRef, {
        branch: r.Branch || "",
        roomName: r.RoomName || "",
        ipad: r.IPAD || "",
        zoom: r.Zoom || ""
      });
    });
    await batch.commit();
    console.log("⚡ Rooms migrated successfully.");
  }

  // 3. Migrate Students
  if (jsonData.students && jsonData.students.length > 0) {
    const batch = writeBatch(db);
    const colRef = collection(db, "students");
    jsonData.students.forEach((s) => {
      const docRef = doc(colRef, s.ID || s["ชื่อ-นามสกุล"]);
      batch.set(docRef, {
        id: s.ID || "",
        name: s["ชื่อ-นามสกุล"] || "",
        nickname: s["ชื่อเล่น"] || "",
        school: s["โรงเรียน"] || "",
        phone: s["เบอร์ติดต่อ"] || "",
        branchLearn: s["สาขาเรียน"] || "",
        branchPay: s["สาขาที่เก็บเงิน"] || "",
        paymentMemo: s["หมายเหตุเวลาจ่ายเงิน"] || "",
        extraMemo: s["หมายเหตุเพิ่มเติม"] || "",
        paidAmount: parseFloat(s["ยอดจ่ายมา"]) || 0,
        tuitionFee: parseFloat(s["ค่าเรียน"]) || 0,
        balance: parseFloat(s["คงเหลือ"]) || 0,
        paymentDate: s["วันที่ชำระเงิน"] || "",
        paymentChannel: s["ช่องทางชำระเงิน"] || "",
        receiver: s["ผู้รับเงิน"] || "",
        roundLearn: s["รอบการเรียน"] || "",
        grade: s["ระดับชั้น"] || "",
        subroom: s["ห้องเรียนย่อย"] || "",
        lineProfile: s["ชื่อไลน์โปรไฟล์"] || "",
        lineId: s["ID LINE"] || "",
        carriedOverFee: parseFloat(s["ค่าเรียนยกมา"]) || 0,
        studyHours: parseFloat(s["ชั่วโมงเรียน"]) || 0,
        remainingHours: parseFloat(s["ชั่วโมงคงเหลือ"]) || 0,
        classType: s["ประเภทคลาส"] || "",
        checked: s["ตรวจสอบ"] || ""
      });
    });
    await batch.commit();
    console.log("⚡ Students migrated successfully.");
  }

  // 4. Migrate Class Logs
  if (jsonData.classLogs && jsonData.classLogs.length > 0) {
    let batch = writeBatch(db);
    const colRef = collection(db, "classLogs");
    let count = 0;

    for (const log of jsonData.classLogs) {
      const docRef = doc(colRef);
      batch.set(docRef, {
        subject: log["วิชา"] || "",
        mainTeacher: log["ครูประจำ"] || "",
        subTeacher: log["ครูแทน"] || "",
        startTime: log["เวลาเริ่ม"] || "",
        endTime: log["เวลาจบ"] || "",
        memo: log["หมายเหตุ"] || "",
        presentCount: parseInt(log["สด"]) || 0,
        onlineCount: parseInt(log["ออน"]) || 0,
        leaveCount: parseInt(log["ลา"]) || 0,
        absentCount: parseInt(log["ขาด"]) || 0,
        makeUpCount: parseInt(log["ชด"]) || 0,
        extraCount: parseInt(log["แสน"]) || 0,
        hours: parseFloat(log["ชม."]) || 0,
        date: log["วันที่"] || "",
        roomBranchInfo: log["ห้อง/สาขา/iPad"] || ""
      });

      count++;
      if (count % 400 === 0) {
        await batch.commit();
        batch = writeBatch(db);
      }
    }
    if (count % 400 !== 0) {
      await batch.commit();
    }
    console.log(`⚡ Class logs (${count} rows) migrated successfully.`);
  }

  console.log("🎉 SUCCESS: All database records have been migrated to Cloud Firestore!");
  process.exit(0);
}

runLocalMigration();
