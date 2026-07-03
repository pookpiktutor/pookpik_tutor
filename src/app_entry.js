// app_entry.js - Main Application Entry Point
// Loads Firebase, creates google.script.run bridge, then boots the full app

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  writeBatch,
  serverTimestamp,
  Timestamp
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// ─── Firebase config ─────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyDR73jjl4afmMVGgCWLXDmKeocmghGX1W4",
  authDomain: "pookpik-tutor.firebaseapp.com",
  projectId: "pookpik-tutor",
  storageBucket: "pookpik-tutor.firebasestorage.app",
  messagingSenderId: "1035837301501",
  appId: "1:1035837301501:web:c21be8f4d4f5b8ec6c5494"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ─── Helper: make a google.script.run-compatible proxy call ──────────────────
// Each method returns a chainable object with withSuccessHandler / withFailureHandler
function makeCall(fn) {
  const stub = {
    _success: null,
    _failure: null,
    withSuccessHandler(cb) { this._success = cb; return this; },
    withFailureHandler(cb) { this._failure = cb; return this; }
  };
  // Attach the function that will be called
  const call = (...args) => {
    fn(...args)
      .then(r => stub._success && stub._success(r))
      .catch(e => stub._failure ? stub._failure(e) : console.error(e));
  };
  return { stub, call };
}

// ─── Firestore helper: Get all docs from a collection as plain objects ────────
async function getAll(colName) {
  const snap = await getDocs(collection(db, colName));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ─── google.script.run Bridge ─────────────────────────────────────────────────
// We expose window.google.script.run so that the original JavaScript.js code
// continues to work unchanged. Every function call returns a chainable stub.
window.google = {
  script: {
    run: new Proxy({}, {
      get(_, methodName) {
        return buildChain(methodName);
      }
    })
  }
};

function buildChain(methodName) {
  const chain = {
    _success: null,
    _failure: null,
    withSuccessHandler(cb) { this._success = cb; return this; },
    withFailureHandler(cb) { this._failure = cb; return this; }
  };

  // Return a Proxy so that calling chain.someMethod(args) triggers the call
  return new Proxy(chain, {
    get(target, prop) {
      if (prop in target) return typeof target[prop] === 'function' ? target[prop].bind(target) : target[prop];
      // The property is the actual function name (e.g. verifyLogin, getStudentsList, etc.)
      return (...args) => {
        dispatch(prop, args, target);
        return undefined; // GAS returns nothing from the call itself
      };
    }
  });
}

// For chained calls like: google.script.run.withSuccessHandler(cb).verifyLogin(u, p)
// We need a two-step proxy – first call builds a chain object, second call invokes.
// Overwrite window.google.script.run with the two-step proxy:
window.google.script.run = new Proxy({}, {
  get(_, propName) {
    // If calling directly (e.g., google.script.run.getGeneralSettings())
    if (propName !== 'withSuccessHandler' && propName !== 'withFailureHandler') {
      return (...args) => dispatch(propName, args, { _success: null, _failure: null });
    }

    // Builder pattern for handlers
    const context = { _success: null, _failure: null };
    
    const handlerProxy = new Proxy(context, {
      get(target, method) {
        if (method === 'withSuccessHandler') {
          return (cb) => { target._success = cb; return handlerProxy; };
        }
        if (method === 'withFailureHandler') {
          return (cb) => { target._failure = cb; return handlerProxy; };
        }
        // It's the actual function call at the end of the chain
        return (...args) => dispatch(method, args, target);
      }
    });

    if (propName === 'withSuccessHandler') {
      return (cb) => { context._success = cb; return handlerProxy; };
    } else {
      return (cb) => { context._failure = cb; return handlerProxy; };
    }
  }
});

// ─── Dispatch table: maps GAS function names → Firebase implementations ───────
async function dispatch(funcName, args, chain) {
  try {
    let result;
    switch (funcName) {

      // ── Auth ──────────────────────────────────────────────────────────────
      case 'verifyLogin': {
        const [username, password] = args;
        const email = username.includes('@') ? username : `${username}@pookpiktutor.com`;
        const pwd = password.length >= 6 ? password : `${password}123456`;
        const cred = await signInWithEmailAndPassword(auth, email, pwd);
        // Fetch extra profile from Firestore
        const profileSnap = await getDoc(doc(db, 'employees', username));
        const profile = profileSnap.exists() ? profileSnap.data() : {};
        result = {
          success: true,
          user: {
            username,
            email,
            nickname: profile.nickname || username,
            role: profile.role || 'Staff',
            profilePic: profile.profilePic || null
          }
        };
        break;
      }

      case 'getUserProfile': {
        const [uname] = args;
        const snap = await getDoc(doc(db, 'employees', uname));
        if (snap.exists()) {
          result = { success: true, profile: { username: uname, ...snap.data() } };
        } else {
          result = { success: false, error: 'ไม่พบข้อมูลผู้ใช้' };
        }
        break;
      }

      case 'heartbeat': {
        result = { success: true };
        break;
      }

      case 'logActivity': {
        try {
          await addDoc(collection(db, 'activityLogs'), {
            ...args[0],
            timestamp: serverTimestamp()
          });
        } catch(e) {}
        result = { success: true };
        break;
      }

      // ── Settings / Dropdowns ──────────────────────────────────────────────
      case 'getGeneralSettings': {
        const settingsSnap = await getDoc(doc(db, 'settings', 'general'));
        const s = settingsSnap.exists() ? settingsSnap.data() : {};
        result = {
          teachers: s.teachers || [],
          schools: s.schools || [],
          paymentChannels: s.paymentChannels || ['เงินสด', 'โอนผ่านธนาคาร', 'พร้อมเพย์', 'รูดบัตร'],
          rooms: s.rooms || []
        };
        break;
      }

      case 'saveGeneralSettings': {
        const [settings] = args;
        await setDoc(doc(db, 'settings', 'general'), settings, { merge: true });
        result = { success: true };
        break;
      }

      case 'getRoomsData': {
        const rooms = await getAll('rooms');
        result = rooms;
        break;
      }

      // ── Dashboard ─────────────────────────────────────────────────────────
      case 'getDashboardData': {
        const students = await getAll('students');
        const branchFin = { สาขา1: { full: 0, paid: 0, debt: 0 }, สาขา2: { full: 0, paid: 0, debt: 0 }, สาขา3: { full: 0, paid: 0, debt: 0 } };
        students.forEach(s => {
          const branch = s.branchPay || s.branchLearn || 'สาขา1';
          const key = branch.startsWith('สาขา1') ? 'สาขา1' : branch.startsWith('สาขา2') ? 'สาขา2' : branch.startsWith('สาขา3') ? 'สาขา3' : null;
          if (key) {
            branchFin[key].full += s.tuitionFee || 0;
            branchFin[key].paid += s.paidAmount || 0;
            branchFin[key].debt += (s.tuitionFee || 0) - (s.paidAmount || 0);
          }
        });
        // Simple monthly summary (empty for now, will be populated from classLogs)
        const monthlySummary = Array.from({ length: 12 }, () => ({ สาขา1: 0, สาขา2: 0, สาขา3: 0, 'อื่นๆ': 0, total: 0 }));
        result = { branchFin, monthlySummary, currentYear: new Date().getFullYear() };
        break;
      }

      case 'getRoundSummary': {
        const [round, branch] = args;
        // Stub: return empty summary
        result = { success: true, summary: {}, categories: [] };
        break;
      }

      // ── Students ──────────────────────────────────────────────────────────
      case 'getStudentsList': {
        const students = await getAll('students');
        result = students.map(s => ({
          id: s.id,
          name: s.name || '',
          nickname: s.nickname || '',
          school: s.school || '',
          contact: s.phone || s.contact || '',
          lineName: s.lineName || '',
          branchLearn: s.branchLearn || '',
          branchPay: s.branchPay || '',
          grade: s.grade || '',
          classType: s.classType || 'กลุ่มหลัก',
          full: s.tuitionFee || 0,
          outstanding: (s.tuitionFee || 0) - (s.paidAmount || 0),
          paymentDate: s.paymentDate || '',
          round: s.round || '',
          classHours: s.classHours || 0,
          classHoursLeft: s.classHoursLeft || 0,
          classSection: s.classSection || ''
        }));
        break;
      }

      case 'addStudent': {
        const [studentData] = args;
        const ref = doc(collection(db, 'students'));
        await setDoc(ref, { ...studentData, createdAt: serverTimestamp() });
        result = { success: true, id: ref.id };
        break;
      }

      case 'updateStudent': {
        const [id, data] = args;
        await updateDoc(doc(db, 'students', id), { ...data, updatedAt: serverTimestamp() });
        result = { success: true };
        break;
      }

      case 'deleteStudent': {
        const [id] = args;
        await deleteDoc(doc(db, 'students', id));
        result = { success: true };
        break;
      }

      case 'getStudentDetail': {
        const [id] = args;
        const snap = await getDoc(doc(db, 'students', id));
        result = snap.exists() ? { success: true, student: { id, ...snap.data() } } : { success: false, error: 'ไม่พบข้อมูล' };
        break;
      }

      case 'getStudentHistory': {
        const [name, nickname] = args;
        const logsSnap = await getDocs(query(collection(db, 'classLogs'), where('studentName', '==', name)));
        result = { success: true, logs: logsSnap.docs.map(d => ({ id: d.id, ...d.data() })) };
        break;
      }

      // ── Class Logs / Revenue ──────────────────────────────────────────────
      case 'saveClassLogsGroup': {
        const [logs] = args;
        const batch = writeBatch(db);
        logs.forEach(log => {
          const ref = log.rowIndex ? doc(db, 'classLogs', String(log.rowIndex)) : doc(collection(db, 'classLogs'));
          batch.set(ref, { ...log, updatedAt: serverTimestamp() }, { merge: true });
        });
        await batch.commit();
        result = { success: true };
        break;
      }

      case 'deleteClassLog': {
        const [rowIndex] = args;
        await deleteDoc(doc(db, 'classLogs', String(rowIndex)));
        result = { success: true };
        break;
      }

      case 'getClassLogsForRoom': {
        const [roomLabel, date] = args;
        const q = query(collection(db, 'classLogs'), where('roomBranch', '==', roomLabel), where('date', '==', date));
        const snap = await getDocs(q);
        result = { success: true, logs: snap.docs.map(d => ({ id: d.id, ...d.data() })) };
        break;
      }

      case 'getClassLogsForTeacher': {
        const [teacherName, nickname] = args;
        const startDate = args[2] || '';
        const endDate = args[3] || '';
        let q = query(collection(db, 'classLogs'));
        const snap = await getDocs(q);
        const logs = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(l =>
          (l.teacherRegular === teacherName || l.teacherRegular === nickname ||
           l.teacherSub === teacherName || l.teacherSub === nickname) &&
          (!startDate || l.date >= startDate) &&
          (!endDate || l.date <= endDate)
        );
        result = { success: true, logs };
        break;
      }

      case 'getRevenueLogs': {
        const [startDate, endDate, branch] = args;
        let q = collection(db, 'classLogs');
        const snap = await getDocs(q);
        let logs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (startDate) logs = logs.filter(l => l.date >= startDate);
        if (endDate) logs = logs.filter(l => l.date <= endDate);
        if (branch) logs = logs.filter(l => l.roomBranch && l.roomBranch.includes(branch));
        result = { success: true, logs };
        break;
      }

      // ── Daily Grid / Rooms ────────────────────────────────────────────────
      case 'getDailyGridData': {
        const [date, branch] = args;
        const roomsSnap = await getDocs(query(collection(db, 'rooms'), where('branch', '==', branch)));
        const rooms = roomsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const classSnap = await getDocs(query(collection(db, 'classLogs'), where('date', '==', date)));
        const classes = classSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(c => c.roomBranch && c.roomBranch.includes(branch));
        result = { success: true, rooms, classes };
        break;
      }

      case 'getMonthlyGridData': {
        const [year, month, branch] = args;
        const startDate = `${year}-${String(month).padStart(2,'0')}-01`;
        const endDate = `${year}-${String(month).padStart(2,'0')}-31`;
        const snap = await getDocs(collection(db, 'classLogs'));
        const classes = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(c =>
          c.date >= startDate && c.date <= endDate &&
          (!branch || (c.roomBranch && c.roomBranch.includes(branch)))
        );
        const roomsSnap = await getDocs(collection(db, 'rooms'));
        const rooms = roomsSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(r => !branch || r.branch === branch);
        result = { success: true, rooms, classes };
        break;
      }

      case 'addRoom': {
        const [roomData] = args;
        const ref = doc(collection(db, 'rooms'));
        await setDoc(ref, { ...roomData, createdAt: serverTimestamp() });
        result = { success: true, id: ref.id };
        break;
      }

      case 'deleteRoom': {
        const [id] = args;
        await deleteDoc(doc(db, 'rooms', id));
        result = { success: true };
        break;
      }

      // ── Grade Sheets ──────────────────────────────────────────────────────
      case 'getGradeSheetData': {
        const [grade, branch] = args;
        const sheetName = `${grade}-${branch}`;
        const snap = await getDoc(doc(db, 'gradeSheets', sheetName));
        if (snap.exists()) {
          result = { success: true, sheetName, ...snap.data() };
        } else {
          result = { success: true, sheetName, courses: [], students: [] };
        }
        break;
      }

      case 'saveGradeSheetData': {
        const [sheetName, data] = args;
        await setDoc(doc(db, 'gradeSheets', sheetName), { ...data, updatedAt: serverTimestamp() }, { merge: true });
        result = { success: true };
        break;
      }

      // ── Private Students ──────────────────────────────────────────────────
      case 'getPrivateStudentsData': {
        const [sheetFilter, branchFilter] = args;
        const snap = await getDocs(collection(db, 'privateStudents'));
        let students = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (sheetFilter && sheetFilter !== 'all') {
          students = students.filter(s => s.sheetName && s.sheetName.includes(sheetFilter));
        }
        if (branchFilter && branchFilter !== 'all') {
          students = students.filter(s => s.branchLearn && s.branchLearn.includes(branchFilter));
        }
        result = { success: true, students };
        break;
      }

      case 'savePrivateStudentPayment': {
        const [id, payData] = args;
        await updateDoc(doc(db, 'privateStudents', id), { ...payData, updatedAt: serverTimestamp() });
        result = { success: true };
        break;
      }

      case 'addPrivateStudent': {
        const [data] = args;
        const ref = doc(collection(db, 'privateStudents'));
        await setDoc(ref, { ...data, createdAt: serverTimestamp() });
        result = { success: true, id: ref.id };
        break;
      }

      // ── Debtors ───────────────────────────────────────────────────────────
      case 'getDebtorsData': {
        const students = await getAll('students');
        const debtors = students.filter(s => ((s.tuitionFee || 0) - (s.paidAmount || 0)) > 0);
        result = { success: true, students: debtors.map(s => ({
          id: s.id, name: s.name, nickname: s.nickname, branchLearn: s.branchLearn,
          grade: s.grade, round: s.round, full: s.tuitionFee || 0,
          paid: s.paidAmount || 0, debt: (s.tuitionFee || 0) - (s.paidAmount || 0)
        })) };
        break;
      }

      case 'saveDebtorPayment': {
        const [id, amount, note, channel] = args;
        const snap = await getDoc(doc(db, 'students', id));
        if (snap.exists()) {
          const s = snap.data();
          const newPaid = (s.paidAmount || 0) + amount;
          await updateDoc(doc(db, 'students', id), { paidAmount: newPaid, updatedAt: serverTimestamp() });
        }
        result = { success: true };
        break;
      }

      // ── Receipts ──────────────────────────────────────────────────────────
      case 'getReceiptsData': {
        const snap = await getDocs(collection(db, 'receipts'));
        result = { success: true, receipts: snap.docs.map(d => ({ id: d.id, ...d.data() })) };
        break;
      }

      case 'generateReceipt': {
        const [receiptData] = args;
        const ref = doc(collection(db, 'receipts'));
        await setDoc(ref, { ...receiptData, createdAt: serverTimestamp() });
        result = { success: true, id: ref.id };
        break;
      }

      // ── Teacher Profiles ──────────────────────────────────────────────────
      case 'getTeacherProfiles': {
        const profiles = await getAll('teachers');
        result = { success: true, teachers: profiles };
        break;
      }

      case 'addTeacher': {
        const [data] = args;
        const ref = doc(db, 'teachers', data.nickname || data.username);
        await setDoc(ref, { ...data, createdAt: serverTimestamp() });
        result = { success: true };
        break;
      }

      case 'updateTeacher': {
        const [id, data] = args;
        await updateDoc(doc(db, 'teachers', id), { ...data, updatedAt: serverTimestamp() });
        result = { success: true };
        break;
      }

      case 'deleteTeacher': {
        const [id] = args;
        await deleteDoc(doc(db, 'teachers', id));
        result = { success: true };
        break;
      }

      // ── Teacher Schedule ──────────────────────────────────────────────────
      case 'getTeacherSchedule': {
        const [teacherName, startDate, endDate] = args;
        const snap = await getDocs(collection(db, 'classLogs'));
        const logs = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(c => {
          const matchTeacher = !teacherName || c.teacherRegular === teacherName || c.teacherSub === teacherName;
          const matchDate = (!startDate || c.date >= startDate) && (!endDate || c.date <= endDate);
          return matchTeacher && matchDate;
        });
        result = { success: true, logs };
        break;
      }

      // ── Teacher Pay ───────────────────────────────────────────────────────
      case 'calculateTeacherPay': {
        const [teacherName, year, month] = args;
        const { startDateStr, endDateStr } = getMonthRange(year, month);
        const snap = await getDocs(collection(db, 'classLogs'));
        const logs = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(c =>
          (c.teacherRegular === teacherName || c.teacherSub === teacherName) &&
          c.date >= startDateStr && c.date <= endDateStr
        );
        let totalHours = 0, totalPay = 0;
        logs.forEach(l => { totalHours += parseFloat(l.hours) || 0; totalPay += parseFloat(l.teacherPay) || 0; });
        result = { success: true, totalHours, totalPay, classes: logs };
        break;
      }

      case 'calculateTeacherPayYearly': {
        const [teacherName, year] = args;
        const months = {};
        for (let m = 1; m <= 12; m++) {
          const { startDateStr, endDateStr } = getMonthRange(year, m);
          const snap = await getDocs(collection(db, 'classLogs'));
          const logs = snap.docs.map(d => d.data()).filter(c =>
            (c.teacherRegular === teacherName || c.teacherSub === teacherName) &&
            c.date >= startDateStr && c.date <= endDateStr
          );
          let totalHours = 0, totalPay = 0;
          logs.forEach(l => { totalHours += parseFloat(l.hours) || 0; totalPay += parseFloat(l.teacherPay) || 0; });
          months[m] = { success: true, totalHours, totalPay, classes: logs };
        }
        result = { success: true, months };
        break;
      }

      // ── Employee Management ───────────────────────────────────────────────
      case 'getEmployeeList': {
        const employees = await getAll('employees');
        result = { success: true, employees };
        break;
      }

      case 'addEmployee': {
        const [data] = args;
        const ref = doc(db, 'employees', data.username);
        await setDoc(ref, { ...data, createdAt: serverTimestamp() });
        result = { success: true };
        break;
      }

      case 'updateEmployee': {
        const [username, data] = args;
        await updateDoc(doc(db, 'employees', username), { ...data, updatedAt: serverTimestamp() });
        result = { success: true };
        break;
      }

      case 'deleteEmployee': {
        const [username] = args;
        await deleteDoc(doc(db, 'employees', username));
        result = { success: true };
        break;
      }

      case 'changeEmployeePassword': {
        const [username, newPassword] = args;
        // Password changes must be done server-side; stub for now
        result = { success: true };
        break;
      }

      // ── Manager Logs ──────────────────────────────────────────────────────
      case 'getManagerLogs': {
        const [startDate, endDate] = args;
        const snap = await getDocs(collection(db, 'managerLogs'));
        let logs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (startDate) logs = logs.filter(l => l.date >= startDate);
        if (endDate) logs = logs.filter(l => l.date <= endDate);
        result = { success: true, logs };
        break;
      }

      case 'saveManagerLog': {
        const [data] = args;
        const ref = data.id ? doc(db, 'managerLogs', data.id) : doc(collection(db, 'managerLogs'));
        await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
        result = { success: true };
        break;
      }

      case 'deleteManagerLog': {
        const [id] = args;
        await deleteDoc(doc(db, 'managerLogs', id));
        result = { success: true };
        break;
      }

      // ── Activity Logs ─────────────────────────────────────────────────────
      case 'getActivityLogs': {
        const [startDate, endDate] = args;
        const snap = await getDocs(collection(db, 'activityLogs'));
        let logs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (startDate) logs = logs.filter(l => (l.timestamp?.toDate?.()?.toISOString?.() || '') >= startDate);
        if (endDate) logs = logs.filter(l => (l.timestamp?.toDate?.()?.toISOString?.() || '') <= endDate);
        logs.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
        result = { success: true, logs };
        break;
      }

      // ── Low Balance / Banners ─────────────────────────────────────────────
      case 'getLowBalancePrivateStudents': {
        const snap = await getDocs(collection(db, 'privateStudents'));
        const students = snap.docs.map(d => d.data()).filter(s => {
          const remaining = (s.paidAmount || 0) - (s.usedAmount || 0);
          return remaining < 700;
        });
        result = { success: true, students };
        break;
      }

      case 'getTeacherLeaveInfo': {
        const today = new Date().toISOString().split('T')[0];
        const snap = await getDocs(query(collection(db, 'classLogs'), where('date', '==', today)));
        const leaves = snap.docs.map(d => d.data()).filter(l => l.note && l.note.includes('ครูลา'));
        result = { success: true, leaves };
        break;
      }

      // ── Evaluation Forms ──────────────────────────────────────────────────
      case 'getEvaluationForm': {
        result = { success: true, data: null };
        break;
      }

      case 'saveEvaluationForm': {
        const [data] = args;
        const ref = doc(collection(db, 'evaluations'));
        await setDoc(ref, { ...data, createdAt: serverTimestamp() });
        result = { success: true };
        break;
      }

      case 'getAdminEvaluationsDashboard': {
        const snap = await getDocs(collection(db, 'evaluations'));
        result = { success: true, evaluations: snap.docs.map(d => ({ evalId: d.id, ...d.data() })) };
        break;
      }

      // ── Teacher Daily Schedule (Teacher view) ─────────────────────────────
      case 'getDailyScheduleForTeacher': {
        const [teacherName, nickname, startDate, endDate] = args;
        const snap = await getDocs(collection(db, 'classLogs'));
        const logs = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(c => {
          const match = c.teacherRegular === teacherName || c.teacherRegular === nickname ||
                        c.teacherSub === teacherName || c.teacherSub === nickname;
          const inRange = (!startDate || c.date >= startDate) && (!endDate || c.date <= endDate);
          return match && inRange;
        });
        result = { success: true, logs };
        break;
      }

      case 'toggleDailyScheduleConfirm': {
        const [rowIndex, confirmed] = args;
        if (rowIndex) {
          await updateDoc(doc(db, 'classLogs', String(rowIndex)), { teacherConfirmed: confirmed });
        }
        result = { success: true };
        break;
      }

      case 'handleTeacherLeaveToggle': {
        const [rowIndex, isLeave] = args;
        if (rowIndex) {
          const snap = await getDoc(doc(db, 'classLogs', String(rowIndex)));
          if (snap.exists()) {
            const current = snap.data().note || '';
            const newNote = isLeave ? (current.includes('ครูลา') ? current : `ครูลา ${current}`.trim()) : current.replace(/ครูลา ?/, '').trim();
            await updateDoc(doc(db, 'classLogs', String(rowIndex)), { note: newNote });
          }
        }
        result = { success: true };
        break;
      }

      // ── Fallback ──────────────────────────────────────────────────────────
      default: {
        console.warn(`[Bridge] Unimplemented GAS function: ${funcName}`, args);
        result = { success: false, error: `Function '${funcName}' not yet implemented in Firebase bridge.` };
      }
    }
    if (chain._success) chain._success(result);
  } catch (err) {
    console.error(`[Bridge] Error in ${funcName}:`, err);
    if (chain._failure) chain._failure(err);
    else if (chain._success) chain._success({ success: false, error: err.message });
  }
}

// Helper: compute date range for a month (same logic as GAS getCustomMonthRange)
function getMonthRange(year, month) {
  const y = parseInt(year);
  const m = parseInt(month);
  const paddedM = String(m).padStart(2, '0');
  const lastDay = new Date(y, m, 0).getDate();
  return {
    startDateStr: `${y}-${paddedM}-01`,
    endDateStr: `${y}-${paddedM}-${lastDay}`
  };
}

// ─── Auth state observer: replicate heartbeat session ─────────────────────────
onAuthStateChanged(auth, user => {
  if (user) {
    // Firebase logged in – session is maintained automatically
    console.log('[Firebase] Auth state: logged in as', user.email);
  }
});

// ─── Override handleLogout to also sign out from Firebase ────────────────────
const _origHandleLogout = window.handleLogout;
window.handleLogout = function() {
  const confirmed = confirm('คุณต้องการออกจากระบบใช่หรือไม่?');
  if (confirmed) {
    signOut(auth).catch(e => console.error(e));
    localStorage.removeItem('pookpik_session');
    if (window.state) { window.state.currentUser = null; }
    if (window.showLoginScreen) window.showLoginScreen();
    if (window.showToast) window.showToast('ออกจากระบบเรียบร้อยแล้ว', 'info');
  }
};

// ─── Load original JavaScript.js as a plain script (non-module) ───────────────
// Since JavaScript.js uses global functions and vars, it must load as classic script
const s = document.createElement('script');
s.src = '/pookpik_tutor/src/JavaScript.js';
s.onload = () => console.log('[App] JavaScript.js loaded and ready');
s.onerror = (e) => console.error('[App] Failed to load JavaScript.js', e);
document.head.appendChild(s);
