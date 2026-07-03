import { db } from "./firebase.js";
import { collection, doc, writeBatch } from "firebase/firestore";

/**
 * ฟังก์ชันสำหรับนำเข้าข้อมูล JSON จาก Google Sheets เข้าสู่ Firestore
 * @param {Object} jsonData - ข้อมูล JSON ที่ได้จากการ Export
 */
export async function importDataToFirestore(jsonData) {
  console.log("Starting data migration to Firestore...");
  
  // 1. นำเข้าข้อมูลครูผู้สอน (teachers)
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
    console.log("Teachers imported successfully.");
  }

  // 2. นำเข้าข้อมูลห้องเรียน (rooms)
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
    console.log("Rooms imported successfully.");
  }

  // 3. นำเข้าข้อมูลประวัตินักเรียน (students)
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
        paidAmount: s["ยอดจ่ายมา"] || 0,
        tuitionFee: s["ค่าเรียน"] || 0,
        balance: s["คงเหลือ"] || 0,
        paymentDate: s["วันที่ชำระเงิน"] || "",
        paymentChannel: s["ช่องทางชำระเงิน"] || "",
        receiver: s["ผู้รับเงิน"] || "",
        roundLearn: s["รอบการเรียน"] || "",
        grade: s["ระดับชั้น"] || "",
        subroom: s["ห้องเรียนย่อย"] || "",
        lineProfile: s["ชื่อไลน์โปรไฟล์"] || "",
        lineId: s["ID LINE"] || "",
        carriedOverFee: s["ค่าเรียนยกมา"] || 0,
        studyHours: s["ชั่วโมงเรียน"] || 0,
        remainingHours: s["ชั่วโมงคงเหลือ"] || 0,
        classType: s["ประเภทคลาส"] || "",
        checked: s["ตรวจสอบ"] || ""
      });
    });
    await batch.commit();
    console.log("Students imported successfully.");
  }

  // 4. นำเข้าข้อมูลประวัติคลาสเรียน (classLogs)
  if (jsonData.classLogs && jsonData.classLogs.length > 0) {
    // แบ่งบันทึกเป็นหลายๆ Batch เนื่องจาก Firestore จำกัด 500 operations ต่อ 1 Batch
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
        presentCount: log["สด"] || 0,
        onlineCount: log["ออน"] || 0,
        leaveCount: log["ลา"] || 0,
        absentCount: log["ขาด"] || 0,
        makeUpCount: log["ชด"] || 0,
        extraCount: log["แสด"] || 0,
        hours: log["ชม."] || 0,
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
    console.log(`Class logs (${count} rows) imported successfully.`);
  }

  console.log("Migration complete!");
}
