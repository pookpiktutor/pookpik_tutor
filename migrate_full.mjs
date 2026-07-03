/**
 * PookPik Tutor - Full Firebase Migration Script
 * รันด้วย: node migrate_full.mjs
 * ย้ายข้อมูลทั้งหมด: users, teachers, rooms, students, classLogs, privateStudents
 */

import { readFileSync } from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, writeBatch, collection, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDR73jjl4afmMVGgCWLXDmKeocmghGX1W4",
  authDomain: "pookpik-tutor.firebaseapp.com",
  projectId: "pookpik-tutor",
  storageBucket: "pookpik-tutor.firebasestorage.app",
  messagingSenderId: "1035837301501",
  appId: "1:1035837301501:web:c21be8f4d4f5b8ec6c5494"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function safeParse(v) {
  if (v === null || v === undefined || v === '') return 0;
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}

function safeStr(v) {
  if (v === null || v === undefined) return '';
  // Clean up bad date strings that come from empty Google Sheets cells
  const s = String(v).trim();
  if (s.startsWith('1899-12-30') || s.startsWith('1899-12-29')) return '';
  return s;
}

// Extract time string from GAS date string e.g. "1899-12-30T10:17:56.000Z" → "10:17"
function extractTime(v) {
  if (!v) return '';
  const s = String(v);
  const m = s.match(/T(\d{2}):(\d{2})/);
  if (m) {
    const h = parseInt(m[1]);
    const min = m[2];
    return `${h}:${min}`;
  }
  return safeStr(v);
}

// Commit a batch and start a new one every 450 writes (Firestore limit = 500)
async function commitBatch(batch) {
  await batch.commit();
  return writeBatch(db);
}

// ─── Main Migration ───────────────────────────────────────────────────────────
async function runMigration() {
  console.log('\n====================================================');
  console.log('  PookPik Tutor — Firebase Migration Starting...');
  console.log('====================================================\n');

  const raw = readFileSync('./pookpik_export_data.json', 'utf8');
  const data = JSON.parse(raw);

  const collectionCounts = {};
  Object.keys(data).forEach(k => {
    collectionCounts[k] = Array.isArray(data[k]) ? data[k].length : 0;
  });
  console.log('📦 Data found in export file:');
  Object.entries(collectionCounts).forEach(([k, v]) => console.log(`   ${k}: ${v} records`));
  console.log('');

  // ──────────────────────────────────────────────────────────────────────────
  // 1. EMPLOYEES (from users sheet)
  // ──────────────────────────────────────────────────────────────────────────
  if (data.users && data.users.length > 0) {
    process.stdout.write(`⏳ Migrating ${data.users.length} employees/users...`);
    let batch = writeBatch(db);
    let count = 0;
    for (const u of data.users) {
      if (!u.Username) continue;
      const docId = safeStr(u.Username).replace(/\//g, '_').replace(/\s+/g, '_') || `user_${count}`;
      const ref = doc(db, 'employees', docId);
      // Only store password hash/text if no profilePic (to save space)
      const profilePic = u.ProfilePic && u.ProfilePic.length > 0 ? u.ProfilePic : '';
      batch.set(ref, {
        username: safeStr(u.Username),
        password: safeStr(String(u.Password || '')),
        role: safeStr(u.Role),
        nickname: safeStr(u.Nickname),
        fullName: safeStr(u.FullName),
        phone: safeStr(String(u.Phone || '')),
        profilePic: profilePic
      }, { merge: true });
      count++;
      if (count % 450 === 0) { batch = await commitBatch(batch); }
    }
    await batch.commit();
    console.log(` ✅ Done (${count} records)`);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 2. TEACHERS
  // ──────────────────────────────────────────────────────────────────────────
  if (data.teachers && data.teachers.length > 0) {
    process.stdout.write(`⏳ Migrating ${data.teachers.length} teachers...`);
    let batch = writeBatch(db);
    let count = 0;
    for (const t of data.teachers) {
      if (!t.Nickname && !t.TeacherID) continue;
      const docId = safeStr(t.TeacherID || t.Nickname).replace(/\//g, '_').replace(/\s+/g, '_') || `teacher_${count}`;
      const ref = doc(db, 'teachers', docId);
      batch.set(ref, {
        teacherID: safeStr(t.TeacherID),
        nickname: safeStr(t.Nickname),
        fullName: safeStr(t.FullName),
        school: safeStr(t.School),
        phone: safeStr(String(t.Phone || '')),
        subjects: safeStr(t.Subjects),
        bank: safeStr(t.Bank),
        accountNumber: safeStr(String(t.AccountNumber || '')),
        compensation: safeStr(String(t.Compensation || ''))
      }, { merge: true });
      count++;
      if (count % 450 === 0) { batch = await commitBatch(batch); }
    }
    await batch.commit();
    console.log(` ✅ Done (${count} records)`);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 3. ROOMS
  // ──────────────────────────────────────────────────────────────────────────
  if (data.rooms && data.rooms.length > 0) {
    process.stdout.write(`⏳ Migrating ${data.rooms.length} rooms...`);
    let batch = writeBatch(db);
    let count = 0;
    for (const r of data.rooms) {
      if (!r.RoomName) continue;
      const docId = safeStr(`${r.Branch}_${r.RoomName}`).replace(/\//g, '_').replace(/\s+/g, '_') || `room_${count}`;
      const ref = doc(db, 'rooms', docId);
      batch.set(ref, {
        branch: safeStr(r.Branch),
        roomName: safeStr(r.RoomName),
        ipad: safeStr(r.IPAD),
        zoom: safeStr(r.Zoom)
      }, { merge: true });
      count++;
      if (count % 450 === 0) { batch = await commitBatch(batch); }
    }
    await batch.commit();
    console.log(` ✅ Done (${count} records)`);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 4. STUDENTS (กลุ่มหลัก)
  // ──────────────────────────────────────────────────────────────────────────
  if (data.students && data.students.length > 0) {
    process.stdout.write(`⏳ Migrating ${data.students.length} students...`);
    let batch = writeBatch(db);
    let count = 0;
    for (const s of data.students) {
      const rawId = safeStr(s.ID || s['ชื่อ-นามสกุล'] || '');
      if (!rawId) continue;
      const docId = rawId.replace(/\//g, '_').replace(/\s+/g, '_').substring(0, 500) || `student_${count}`;
      const ref = doc(db, 'students', docId);
      
      // Parse payment date properly
      let paymentDate = '';
      if (s['วันที่ชำระเงิน']) {
        const pd = String(s['วันที่ชำระเงิน']);
        if (!pd.startsWith('1899')) {
          const dateMatch = pd.match(/^(\d{4}-\d{2}-\d{2})/);
          if (dateMatch) paymentDate = dateMatch[1];
        }
      }

      batch.set(ref, {
        id: rawId,
        name: safeStr(s['ชื่อ-นามสกุล']),
        nickname: safeStr(s['ชื่อเล่น']),
        school: safeStr(s['โรงเรียน']),
        phone: safeStr(s['เบอร์ติดต่อ']),
        branchLearn: safeStr(s['สาขาเรียน']),
        branchPay: safeStr(s['สาขาที่เก็บเงิน']),
        paymentMemo: safeStr(s['หมายเหตุเวลาจ่ายเงิน']).startsWith('1899') ? '' : safeStr(s['หมายเหตุเวลาจ่ายเงิน']),
        extraMemo: safeStr(s['หมายเหตุเพิ่มเติม']),
        paidAmount: safeParse(s['ยอดจ่ายมา']),
        tuitionFee: safeParse(s['ค่าเรียน']),
        balance: safeParse(s['คงเหลือ']),
        paymentDate: paymentDate,
        paymentChannel: safeStr(s['ช่องทางชำระเงิน']),
        receiver: safeStr(s['ผู้รับเงิน']),
        round: safeStr(s['รอบการเรียน']),
        grade: safeStr(s['ระดับชั้น']),
        classSection: safeStr(s['ห้องเรียนย่อย']),
        lineName: safeStr(s['ชื่อไลน์โปรไฟล์']),
        lineId: safeStr(s['ID LINE']),
        carriedOverFee: safeParse(s['ค่าเรียนยกมา']),
        classHours: safeParse(s['ชั่วโมงเรียน']),
        classHoursLeft: safeParse(s['ชั่วโมงคงเหลือ']),
        classType: safeStr(s['ประเภทคลาส'])
      }, { merge: true });
      count++;
      if (count % 450 === 0) {
        batch = await commitBatch(batch);
        process.stdout.write(` [${count}]`);
      }
    }
    await batch.commit();
    console.log(` ✅ Done (${count} records)`);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 5. CLASS LOGS (บันทึกคลาสเรียน)
  // ──────────────────────────────────────────────────────────────────────────
  if (data.classLogs && data.classLogs.length > 0) {
    process.stdout.write(`⏳ Migrating ${data.classLogs.length} class logs...`);
    let batch = writeBatch(db);
    let count = 0;
    for (const log of data.classLogs) {
      const ref = doc(collection(db, 'classLogs'));

      // Parse roomBranch: "ห้อง 24 สาขา2 IPAD 019 Zoom 019"
      const roomBranch = safeStr(log['ห้อง/สาขา/iPad']);
      let branch = '';
      const branchMatch = roomBranch.match(/สาขา\d+/);
      if (branchMatch) branch = branchMatch[0];

      // Parse hours: comes as "1899-12-29T19:17:56.000Z" for 2 hours, etc.
      let hours = 0;
      const hoursRaw = log['ชม.'];
      if (hoursRaw) {
        const hs = String(hoursRaw);
        if (hs.startsWith('1899-12-29')) {
          // Hours stored as time since midnight: e.g. 19:17 means 19h17m since epoch
          // epoch for google sheets time is 1899-12-30, so 1899-12-29T19:17 = -0.3 days
          // Actually the value IS the fractional day: e.g. 2h = T02:00
          const hm = hs.match(/T(\d{2}):(\d{2})/);
          if (hm) {
            hours = parseInt(hm[1]) + parseInt(hm[2]) / 60;
            // If 1899-12-29, it means negative — but hours should still be read as the time value
            // Google Sheets stores time durations: 2h = 0.0833... = shown as 02:00:00
            // 1899-12-29 means it wrapped backward — read the hour portion
            hours = parseInt(hm[1]) + parseInt(hm[2]) / 60;
          }
        } else if (hs.startsWith('1899-12-30')) {
          const hm = hs.match(/T(\d{2}):(\d{2})/);
          if (hm) hours = parseInt(hm[1]) + parseInt(hm[2]) / 60;
        } else {
          hours = safeParse(hoursRaw);
        }
      }
      // Round to nearest 0.5
      hours = Math.round(hours * 2) / 2;

      batch.set(ref, {
        subject: safeStr(log['วิชา']),
        teacherRegular: safeStr(log['ครูประจำ']),
        teacherSub: safeStr(log['ครูแทน']),
        startTime: extractTime(log['เวลาเริ่ม']),
        endTime: extractTime(log['เวลาจบ']),
        note: safeStr(log['หมายเหตุ']),
        presentCount: safeParse(log['สด']),
        onlineCount: safeParse(log['ออน']),
        leaveCount: safeParse(log['ลา']),
        absentCount: safeParse(log['ขาด']),
        makeUpCount: safeParse(log['ชด']),
        extraCount: safeParse(log['แสด']),
        hours: hours,
        date: safeStr(log['วันที่']),
        roomBranch: roomBranch,
        branch: branch,
        studentCount: safeParse(log['จำนวนเด็ก'])
      });
      count++;
      if (count % 450 === 0) {
        batch = await commitBatch(batch);
        process.stdout.write(` [${count}]`);
      }
    }
    await batch.commit();
    console.log(` ✅ Done (${count} records)`);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 6. PRIVATE STUDENTS (เดี่ยว/ย่อย) — if present in JSON
  // ──────────────────────────────────────────────────────────────────────────
  if (data.privateStudents && data.privateStudents.length > 0) {
    process.stdout.write(`⏳ Migrating ${data.privateStudents.length} private students...`);
    let batch = writeBatch(db);
    let count = 0;
    for (const s of data.privateStudents) {
      const rawId = safeStr(s.ID || s['ชื่อ-นามสกุล'] || '');
      const docId = rawId.replace(/\//g, '_').replace(/\s+/g, '_').substring(0, 500) || `private_${count}`;
      const ref = doc(db, 'privateStudents', docId);
      batch.set(ref, {
        id: rawId,
        name: safeStr(s['ชื่อ-นามสกุล']),
        nickname: safeStr(s['ชื่อเล่น']),
        school: safeStr(s['โรงเรียน']),
        phone: safeStr(s['เบอร์ติดต่อ']),
        branchLearn: safeStr(s['สาขาเรียน']),
        sheetName: safeStr(s['ประเภทคลาส'] || s['sheetName'] || ''),
        paidAmount: safeParse(s['ยอดจ่ายมา']),
        tuitionFee: safeParse(s['ค่าเรียน']),
        carriedOverFee: safeParse(s['ค่าเรียนยกมา']),
        classHours: safeParse(s['ชั่วโมงเรียน']),
        classHoursLeft: safeParse(s['ชั่วโมงคงเหลือ']),
        paymentDate: safeStr(s['วันที่ชำระเงิน']).startsWith('1899') ? '' : safeStr(s['วันที่ชำระเงิน']),
        receiver: safeStr(s['ผู้รับเงิน']),
        note: safeStr(s['หมายเหตุเพิ่มเติม']),
        classType: safeStr(s['ประเภทคลาส'])
      }, { merge: true });
      count++;
      if (count % 450 === 0) { batch = await commitBatch(batch); }
    }
    await batch.commit();
    console.log(` ✅ Done (${count} records)`);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 7. SETTINGS — Save general settings / payment channels / schools
  // ──────────────────────────────────────────────────────────────────────────
  process.stdout.write('⏳ Saving general settings...');
  const settingsRef = doc(db, 'settings', 'general');
  await setDoc(settingsRef, {
    paymentChannels: ['เงินสด', 'โอนผ่านธนาคาร', 'พร้อมเพย์', 'รูดบัตร'],
    branches: ['สาขา1', 'สาขา2', 'สาขา3'],
    grades: ['อนุบาล','ป.1','ป.2','ป.3','ป.4','ป.5','ป.6','ม.1','ม.2','ม.3','ม.4','ม.5','ม.6'],
    classTypes: ['กลุ่มหลัก','เดี่ยว','ย่อย 2-3','ย่อย 4-5','ย่อย 6-10'],
    currentRound: 'M1/69',
    rounds: ['Summer69','M1/69','F1/69','Oct69','M2/69','F2/69']
  }, { merge: true });
  console.log(' ✅ Done');

  console.log('\n====================================================');
  console.log('  🎉 MIGRATION COMPLETE! All data is now in Firestore.');
  console.log('====================================================\n');
  console.log('📋 Summary:');
  console.log(`   employees: ${(data.users||[]).length}`);
  console.log(`   teachers:  ${(data.teachers||[]).length}`);
  console.log(`   rooms:     ${(data.rooms||[]).length}`);
  console.log(`   students:  ${(data.students||[]).length}`);
  console.log(`   classLogs: ${(data.classLogs||[]).length}`);
  console.log(`   private:   ${(data.privateStudents||[]).length}`);
  process.exit(0);
}

runMigration().catch(err => {
  console.error('\n❌ Migration failed:', err);
  process.exit(1);
});
