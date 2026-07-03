import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getDocs, doc, setDoc, query, limit } from "firebase/firestore";
import { importDataToFirestore } from "./migrator.js";

// Verify Authentication
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
  } else {
    document.getElementById("user-display").innerText = `เข้าใช้งานโดยผู้ใช้: ${user.email}`;
    loadDashboardStats();
  }
});

// Logout action
const btnLogout = document.getElementById("btn-logout");
if (btnLogout) {
  btnLogout.addEventListener("click", () => {
    signOut(auth).then(() => {
      window.location.href = "index.html";
    });
  });
}

// Side-menu actions
const menuMigrate = document.getElementById("menu-migrate");
const migrationSection = document.getElementById("migration-section");
if (menuMigrate && migrationSection) {
  menuMigrate.addEventListener("click", (e) => {
    e.preventDefault();
    migrationSection.style.display = migrationSection.style.display === "none" ? "block" : "none";
  });
}

// Migration Handler
const btnRunMigration = document.getElementById("btn-run-migration");
const migrationInput = document.getElementById("migration-json-input");
const migrationStatus = document.getElementById("migration-status");

if (btnRunMigration && migrationInput && migrationStatus) {
  btnRunMigration.addEventListener("click", async () => {
    const rawJson = migrationInput.value.trim();
    if (!rawJson) {
      migrationStatus.innerText = "กรุณาใส่ข้อมูล JSON";
      migrationStatus.style.color = "red";
      return;
    }

    try {
      migrationStatus.innerText = "กำลังนำเข้าข้อมูล... (โปรดรอสักครู่)";
      migrationStatus.style.color = "orange";
      
      const parsed = JSON.parse(rawJson);
      await importDataToFirestore(parsed);
      
      migrationStatus.innerText = "✓ นำเข้าข้อมูลสำเร็จเรียบร้อยแล้ว!";
      migrationStatus.style.color = "green";
      migrationInput.value = "";
      loadDashboardStats();
    } catch (err) {
      console.error(err);
      migrationStatus.innerText = `เกิดข้อผิดพลาด: ${err.message}`;
      migrationStatus.style.color = "red";
    }
  });
}

// Dashboard statistics loader
async function loadDashboardStats() {
  try {
    const studentsSnap = await getDocs(collection(db, "students"));
    document.getElementById("stat-students").innerText = `${studentsSnap.size} คน`;

    const teachersSnap = await getDocs(collection(db, "teachers"));
    document.getElementById("stat-teachers").innerText = `${teachersSnap.size} ท่าน`;

    const classesSnap = await getDocs(collection(db, "classLogs"));
    document.getElementById("stat-classes").innerText = `${classesSnap.size} คลาส`;

    let totalHours = 0;
    classesSnap.forEach(doc => {
      const data = doc.data();
      const hr = parseFloat(data.hours) || 0;
      totalHours += hr;
    });
    document.getElementById("stat-hours").innerText = `${totalHours.toFixed(1)} ชม.`;
  } catch (e) {
    console.error("Error loading stats:", e);
  }
}

// 4-Set Class Scheduler Form Setup
const classModal = document.getElementById("class-modal");
const btnOpenClass = document.getElementById("btn-open-class-modal");
const btnCloseClass = document.getElementById("btn-close-modal");
const classSetsContainer = document.getElementById("class-sets-container");

if (btnOpenClass && classModal) {
  btnOpenClass.addEventListener("click", () => {
    renderClassSets();
    classModal.style.display = "flex";
  });
}

if (btnCloseClass && classModal) {
  btnCloseClass.addEventListener("click", () => {
    classModal.style.display = "none";
  });
}

// Render the 4 sets inputs
function renderClassSets() {
  if (!classSetsContainer) return;
  classSetsContainer.innerHTML = "";
  
  for (let i = 1; i <= 4; i++) {
    const html = `
      <div style="border-bottom: 2px dashed #edf2f7; padding-bottom: 15px; margin-bottom: 15px;">
        <h4 style="margin-bottom: 10px; color: var(--primary);">คลาสชุดที่ ${i}</h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div class="form-row">
            <label>วิชาเรียน / นักเรียนที่เรียน</label>
            <input type="text" name="subject_${i}" placeholder="เช่น วิชาคณิตศาสตร์ / ด.ช.สมชาย">
          </div>
          <div class="form-row">
            <label>ครูผู้สอนหลัก</label>
            <input type="text" name="teacher_${i}" placeholder="ชื่อครูผู้สอนหลัก">
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-top: 10px;">
          <div class="form-row">
            <label>ครูผู้สอนแทน (ถ้ามี)</label>
            <input type="text" name="sub_teacher_${i}" placeholder="ครูสอนแทน">
          </div>
          <div class="form-row">
            <label>เวลาเริ่มสอน - เวลาเสร็จสิ้น</label>
            <div style="display:flex; gap: 5px;">
              <input type="time" name="start_time_${i}">
              <input type="time" name="end_time_${i}">
            </div>
          </div>
          <div class="form-row">
            <label>วันที่เรียน</label>
            <input type="date" name="date_${i}">
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 10px;">
          <div class="form-row" style="display:flex; align-items:center; gap: 8px; margin-top: 25px;">
            <input type="checkbox" name="recurring_${i}" style="width:auto;">
            <label style="margin-bottom:0;">บันทึกซ้ำรายสัปดาห์ (ทุกวันเดิมของสัปดาห์)</label>
          </div>
          <div class="form-row">
            <label>ชั่วโมงสอน (ชม.)</label>
            <input type="number" step="0.5" name="hours_${i}" placeholder="เช่น 2">
          </div>
        </div>
      </div>
    `;
    classSetsContainer.insertAdjacentHTML("beforeend", html);
  }
}
