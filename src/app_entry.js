// app_entry.js - Main Application Entry Point
// Loads Firebase, creates google.script.run bridge, then boots the full app

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
// Firebase Auth (kept for signOut only)
import { 
  getAuth, 
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
        console.log('[Login] Attempting:', username);

        if (!username || !password) {
          result = { success: false, error: 'กรุณากรอก Username และรหัสผ่าน' };
          break;
        }
        const cleanUser = username.toString().trim().toLowerCase();
        const cleanPass = password.toString().trim();

        // ── Fetch employee via Firestore REST API (no auth required, bypasses Security Rules) ──
        const PID = 'pookpik-tutor';
        const APIKEY = 'AIzaSyDR73jjl4afmMVGgCWLXDmKeocmghGX1W4';

        function parseRestDoc(fields) {
          const out = {};
          for (const [k, v] of Object.entries(fields)) {
            out[k] = v.stringValue !== undefined ? v.stringValue
                   : v.integerValue !== undefined ? v.integerValue
                   : v.doubleValue !== undefined ? v.doubleValue
                   : v.booleanValue !== undefined ? v.booleanValue : '';
          }
          return out;
        }

        async function restGetEmployee(docId) {
          try {
            const url = `https://firestore.googleapis.com/v1/projects/${PID}/databases/(default)/documents/employees/${encodeURIComponent(docId)}?key=${APIKEY}`;
            const r = await fetch(url);
            if (!r.ok) return null;
            const j = await r.json();
            return j.fields ? parseRestDoc(j.fields) : null;
          } catch(e) { return null; }
        }

        async function restQueryEmployee(usernameVal) {
          try {
            const url = `https://firestore.googleapis.com/v1/projects/${PID}/databases/(default)/documents:runQuery?key=${APIKEY}`;
            const body = { structuredQuery: { from: [{ collectionId: 'employees' }], where: { fieldFilter: { field: { fieldPath: 'username' }, op: 'EQUAL', value: { stringValue: usernameVal } } }, limit: 1 } };
            const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            if (!r.ok) return null;
            const j = await r.json();
            return (j[0]?.document?.fields) ? parseRestDoc(j[0].document.fields) : null;
          } catch(e) { return null; }
        }

        let profile = null;

        // Try REST by doc ID (lowercase)
        profile = await restGetEmployee(cleanUser);
        console.log('[Login] REST by cleanUser:', profile ? 'FOUND' : 'not found');

        // Try REST by original-case username
        if (!profile) {
          profile = await restGetEmployee(username.toString().trim());
          console.log('[Login] REST by original username:', profile ? 'FOUND' : 'not found');
        }

        // Try REST query by username field
        if (!profile) {
          profile = await restQueryEmployee(cleanUser);
          console.log('[Login] REST query by username field:', profile ? 'FOUND' : 'not found');
        }

        // SDK fallback (works if Firestore rules allow reads)
        if (!profile) {
          try {
            let s = await getDoc(doc(db, 'employees', cleanUser));
            if (!s.exists()) s = await getDoc(doc(db, 'employees', username.toString().trim()));
            if (s.exists()) { profile = s.data(); console.log('[Login] SDK fallback: FOUND'); }
          } catch(e) { console.warn('[Login] SDK fallback error:', e.message); }
        }

        if (!profile) {
          console.warn('[Login] User not found:', username);
          result = { success: false, error: 'ไม่พบชื่อผู้ใช้ในระบบ (username: ' + username + ')' };
          break;
        }

        const storedPass = (profile.password || '').toString().trim();
        console.log('[Login] Password stored length:', storedPass.length, '| input length:', cleanPass.length);

        if (storedPass !== cleanPass) {
          result = { success: false, error: 'รหัสผ่านไม่ถูกต้อง' };
          break;
        }

        // Log activity (non-blocking)
        addDoc(collection(db, 'activityLogs'), {
          user: profile.username || username,
          action: 'เข้าสู่ระบบ',
          details: 'เข้าสู่ระบบสำเร็จ',
          timestamp: serverTimestamp()
        }).catch(() => {});

        result = {
          success: true,
          user: {
            username: profile.username || username,
            nickname: profile.nickname || profile.username || username,
            fullName: profile.fullName || '',
            role: profile.role || 'Staff',
            profilePic: profile.profilePic || null,
            phone: profile.phone || '',
            bank: profile.bank || '',
            accountNumber: profile.accountNumber || ''
          }
        };
        console.log('[Login] SUCCESS:', result.user.username, '| Role:', result.user.role);
        break;
      }


      case 'getUserProfile': {
        const [uname] = args;
        if (!uname) {
          result = { success: false, error: 'Missing username' };
          break;
        }
        const cleanUser = uname.toString().trim().toLowerCase();
        
        // ── Fetch profile via Firestore REST API (no auth required, bypasses Security Rules) ──
        const PID = 'pookpik-tutor';
        const APIKEY = 'AIzaSyDR73jjl4afmMVGgCWLXDmKeocmghGX1W4';
        
        function parseRestDoc(fields) {
          const out = {};
          for (const [k, v] of Object.entries(fields)) {
            out[k] = v.stringValue !== undefined ? v.stringValue
                   : v.integerValue !== undefined ? v.integerValue
                   : v.doubleValue !== undefined ? v.doubleValue
                   : v.booleanValue !== undefined ? v.booleanValue : '';
          }
          return out;
        }

        async function restGetEmployee(docId) {
          try {
            const url = `https://firestore.googleapis.com/v1/projects/${PID}/databases/(default)/documents/employees/${encodeURIComponent(docId)}?key=${APIKEY}`;
            const r = await fetch(url);
            if (!r.ok) return null;
            const j = await r.json();
            return j.fields ? parseRestDoc(j.fields) : null;
          } catch(e) { return null; }
        }

        let profile = await restGetEmployee(cleanUser);
        if (!profile) {
          profile = await restGetEmployee(uname.toString().trim());
        }

        // SDK Fallback
        if (!profile) {
          try {
            let snap = await getDoc(doc(db, 'employees', cleanUser));
            if (!snap.exists()) snap = await getDoc(doc(db, 'employees', uname.toString().trim()));
            if (snap.exists()) profile = snap.data();
          } catch(e) { console.warn('[getUserProfile] SDK error:', e.message); }
        }

        if (profile) {
          result = { success: true, profile: { username: profile.username || uname, ...profile } };
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
        const [year, month, dayOfWeek, logUser] = args;
        
        try {
          // Fetch rooms
          const roomsSnap = await getDocs(collection(db, 'rooms'));
          const rooms = roomsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

          // Find all dates in the given month that match dayOfWeek
          const datesInMonth = [];
          const daysInMonth = new Date(year, month, 0).getDate(); // month is 1-based
          
          for (let d = 1; d <= daysInMonth; d++) {
            const dt = new Date(year, month - 1, d);
            if (dt.getDay() === dayOfWeek) {
              const dateStr = String(d).padStart(2, '0') + '/' + String(month).padStart(2, '0') + '/' + year;
              datesInMonth.push({
                day: d,
                dateStr: dateStr,
                weekNum: datesInMonth.length + 1
              });
            }
          }

          // Build a set of target date strings for quick lookup
          const targetDateSet = {};
          datesInMonth.forEach(item => {
            targetDateSet[item.dateStr] = item.weekNum;
          });

          // Fetch class logs
          const classSnap = await getDocs(collection(db, 'classLogs'));
          const rawClasses = classSnap.docs.map(d => ({ id: d.id, ...d.data() }));

          // Group classes by week number
          const weeklyClasses = {};
          datesInMonth.forEach(item => {
            weeklyClasses[item.weekNum] = [];
          });

          rawClasses.forEach(c => {
            if (!c.date) return;
            const weekNum = targetDateSet[c.date];
            if (!weekNum) return; // not a matching date

            weeklyClasses[weekNum].push({
              subject: c.subject || '',
              teacherRegular: c.teacherRegular || '',
              teacherSub: c.teacherSub || '',
              timeStart: c.timeStart || '',
              timeEnd: c.timeEnd || '',
              note: c.note || '',
              isPresentLive: c.isPresentLive || 0,
              isPresentOnline: c.isPresentOnline || 0,
              isLeave: c.isLeave || 0,
              isAbsent: c.isAbsent || 0,
              isMakeup: c.isMakeup || 0,
              hours: c.hours || '',
              date: c.date,
              roomBranch: c.roomBranch || '',
              teacherConfirmed: c.teacherConfirmed || 0,
              id: c.id
            });
          });

          // Get enrollments count (mock for now, return initialized counts as 0 or fetched if needed)
          const enrollments = {};
          datesInMonth.forEach(item => {
            (weeklyClasses[item.weekNum] || []).forEach(c => {
              if (c.subject) {
                enrollments[c.subject] = 0; // initialize or count from students collection if required
              }
            });
          });

          // Also count from students collection
          try {
            const stdSnap = await getDocs(collection(db, 'students'));
            const students = stdSnap.docs.map(d => d.data());
            students.forEach(s => {
              // Standard registration course matching (if course is in gradesheet)
              // Here we just map if the student is registered or active
            });
          } catch (e) {
            console.warn('Enrollment calculation warning:', e);
          }

          result = {
            success: true,
            rooms: rooms,
            enrollments: enrollments,
            weeks: datesInMonth.map(item => ({
              weekNum: item.weekNum,
              dateStr: item.dateStr,
              day: item.day,
              classes: weeklyClasses[item.weekNum] || []
            }))
          };
        } catch (err) {
          result = { success: false, error: err.message };
        }
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

      // ── Presence / Heartbeat ─────────────────────────────────────────────
      case 'pingActiveUser': {
        const [pingUsername] = args;
        // Store/update presence in Firestore
        if (pingUsername) {
          const presenceRef = doc(db, 'presence', pingUsername);
          await setDoc(presenceRef, { username: pingUsername, lastSeen: serverTimestamp() }, { merge: true });
          // Return list of users active within last 45 seconds
          const presenceSnap = await getDocs(collection(db, 'presence'));
          const cutoff = Date.now() - 45000;
          const activeUsers = [];
          presenceSnap.docs.forEach(d => {
            const data = d.data();
            const ts = data.lastSeen && data.lastSeen.toMillis ? data.lastSeen.toMillis() : 0;
            if (ts > cutoff) activeUsers.push(d.id);
          });
          result = activeUsers;
        } else {
          result = [];
        }
        break;
      }

      // ── Grade Sheets / Courses ────────────────────────────────────────────
      case 'getAllCoursesFromGradeSheets': {
        // Return all unique course names from gradeSheets collection
        const gsSnap = await getDocs(collection(db, 'gradeSheets'));
        const courseSet = new Set();
        gsSnap.docs.forEach(d => {
          const data = d.data();
          if (Array.isArray(data.courses)) {
            data.courses.forEach(c => {
              if (c && c.name) courseSet.add(c.name);
            });
          }
        });
        result = [...courseSet].sort();
        break;
      }

      // ── Student Registration (CRUD) ───────────────────────────────────────
      case 'addStudentRegistration': {
        const [studentData, logUser] = args;
        const newId = `std_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        await setDoc(doc(db, 'students', newId), {
          ...studentData,
          id: newId,
          createdAt: serverTimestamp()
        });
        try {
          await addDoc(collection(db, 'activityLogs'), {
            user: logUser || 'System',
            action: 'เพิ่มนักเรียนใหม่',
            details: `นักเรียน: ${studentData.name || ''}`,
            timestamp: serverTimestamp()
          });
        } catch(e) {}
        result = { success: true, id: newId };
        break;
      }

      case 'updateStudentRegistration': {
        const [stdUpdateData, updLogUser] = args;
        const stdId = stdUpdateData.id;
        if (!stdId) { result = { success: false, error: 'Missing student ID' }; break; }
        await setDoc(doc(db, 'students', stdId), { ...stdUpdateData }, { merge: true });
        try {
          await addDoc(collection(db, 'activityLogs'), {
            user: updLogUser || 'System',
            action: 'แก้ไขข้อมูลนักเรียน',
            details: `นักเรียน: ${stdUpdateData.name || stdId}`,
            timestamp: serverTimestamp()
          });
        } catch(e) {}
        result = { success: true };
        break;
      }

      case 'deleteStudentRegistration': {
        const [delStdId, delStdLogUser] = args;
        if (!delStdId) { result = { success: false, error: 'Missing student ID' }; break; }
        await deleteDoc(doc(db, 'students', delStdId));
        try {
          await addDoc(collection(db, 'activityLogs'), {
            user: delStdLogUser || 'System',
            action: 'ลบข้อมูลนักเรียน',
            details: `ID: ${delStdId}`,
            timestamp: serverTimestamp()
          });
        } catch(e) {}
        result = { success: true };
        break;
      }

      case 'deleteCourseColumn': {
        const [grade, branch, sheetName, colIndex, courseName, colLogUser] = args;
        // In Firebase, course columns are managed inside gradeSheets documents
        const gsDocId = `${grade}_${branch || '1'}`;
        const gsRef = doc(db, 'gradeSheets', gsDocId);
        const gsSnap2 = await getDoc(gsRef);
        if (gsSnap2.exists()) {
          const data = gsSnap2.data();
          const courses = Array.isArray(data.courses) ? data.courses.filter(c => c.name !== courseName) : [];
          await updateDoc(gsRef, { courses });
        }
        try {
          await addDoc(collection(db, 'activityLogs'), {
            user: colLogUser || 'System',
            action: 'ลบคอลัมน์คอร์สเรียน',
            details: `ชีต: ${sheetName}, คอร์ส: ${courseName}`,
            timestamp: serverTimestamp()
          });
        } catch(e) {}
        result = { success: true };
        break;
      }

      // ── Revenue / Class Log Updates ───────────────────────────────────────
      case 'updateRevenues': {
        const [revUpdates, revLogUser] = args;
        if (!Array.isArray(revUpdates)) { result = { success: false, error: 'Invalid updates array' }; break; }
        const batch = writeBatch(db);
        for (const up of revUpdates) {
          if (up.id) {
            const ref = doc(db, 'students', up.id);
            const updateData = {};
            if (up.paymentChannel !== undefined) updateData.paymentChannel = up.paymentChannel;
            if (up.isChecked !== undefined) updateData.isChecked = up.isChecked ? 1 : 0;
            batch.update(ref, updateData);
          }
        }
        await batch.commit();
        try {
          await addDoc(collection(db, 'activityLogs'), {
            user: revLogUser || 'System',
            action: 'บันทึกสถานะการชำระเงินรายรับ',
            details: `อัปเดต ${revUpdates.length} รายการ`,
            timestamp: serverTimestamp()
          });
        } catch(e) {}
        result = { success: true };
        break;
      }

      case 'getClassLogs': {
        const [filterDate, clLogUser] = args;
        const clSnap = await getDocs(collection(db, 'classLogs'));
        let logs = clSnap.docs.map(d => ({ ...d.data(), id: d.id }));
        if (filterDate) {
          logs = logs.filter(log => {
            if (!log.date) return false;
            const d = log.date.toString().substring(0, 10);
            const f = filterDate.toString().substring(0, 10);
            return d === f;
          });
        }
        logs.sort((a, b) => {
          const da = a.date || '';
          const db2 = b.date || '';
          if (da !== db2) return db2.localeCompare(da);
          return (a.timeStart || '').localeCompare(b.timeStart || '');
        });
        result = logs;
        break;
      }

      // ── Teachers DB ───────────────────────────────────────────────────────
      case 'getTeachersDB': {
        const teachers = await getAll('teachers');
        result = teachers.map(t => ({
          nickname: t.nickname || t.name || '',
          fullName: t.fullName || '',
          school: t.school || '',
          phone: t.phone || '',
          subjects: t.subjects || '',
          bank: t.bank || '',
          accountNumber: t.accountNumber || '',
          compensation: t.compensation || 150,
          teacherId: t.teacherId || t.id || ''
        }));
        break;
      }

      case 'saveTeacherProfile': {
        const [teacherData, tpLogUser] = args;
        const tId = teacherData.teacherId || teacherData.id || `teacher_${Date.now()}`;
        await setDoc(doc(db, 'teachers', tId), { ...teacherData, teacherId: tId }, { merge: true });
        try {
          await addDoc(collection(db, 'activityLogs'), {
            user: tpLogUser || 'System',
            action: 'บันทึกข้อมูลครู',
            details: `ครู: ${teacherData.nickname || tId}`,
            timestamp: serverTimestamp()
          });
        } catch(e) {}
        result = { success: true };
        break;
      }

      // ── Employee / User Management ────────────────────────────────────────
      case 'getUsersDB': {
        const emps = await getAll('employees');
        // Return as array of arrays like original GAS [[username, password, role, nickname, ...]]
        result = emps.map(e => [
          e.username || e.id || '',
          e.password || '',
          e.role || 'Staff',
          e.nickname || '',
          e.fullName || '',
          e.phone || '',
          e.profilePic || ''
        ]);
        break;
      }

      case 'changeEmployeePasswordByAdmin': {
        const [empUsername, newPass, adminLogUser] = args;
        const empRef = doc(db, 'employees', empUsername);
        await updateDoc(empRef, { password: newPass });
        try {
          await addDoc(collection(db, 'activityLogs'), {
            user: adminLogUser || 'System',
            action: 'แก้ไขรหัสผ่านพนักงาน',
            details: `ผู้ใช้: ${empUsername}`,
            timestamp: serverTimestamp()
          });
        } catch(e) {}
        result = { success: true };
        break;
      }

      case 'changeUserPasswordOwn': {
        const [ownUsername, currentPass, ownNewPass] = args;
        const ownRef = doc(db, 'employees', ownUsername);
        const ownSnap = await getDoc(ownRef);
        if (!ownSnap.exists()) {
          result = { success: false, error: 'ไม่พบข้อมูลผู้ใช้งาน' };
          break;
        }
        const ownData = ownSnap.data();
        if (ownData.password !== currentPass) {
          result = { success: false, error: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' };
          break;
        }
        await updateDoc(ownRef, { password: ownNewPass });
        result = { success: true };
        break;
      }

      // ── Manager Logs ──────────────────────────────────────────────────────
      case 'addManagerLog': {
        const [managerLog, managerLogUser] = args;
        const logType = managerLog.type || 'checkin';
        
        if (logType === 'checkout') {
          // Find existing doc for same manager + date and update it
          const mgSnap = await getDocs(query(
            collection(db, 'managerLogs'),
            where('managerName', '==', managerLog.managerName),
            where('date', '==', managerLog.date)
          ));
          if (!mgSnap.empty) {
            const existingDoc = mgSnap.docs[0];
            await updateDoc(doc(db, 'managerLogs', existingDoc.id), {
              otOut: managerLog.otOut || '',
              workOut: managerLog.workOut || '',
              updatedAt: serverTimestamp()
            });
          } else {
            await addDoc(collection(db, 'managerLogs'), {
              ...managerLog,
              timestamp: serverTimestamp()
            });
          }
        } else {
          await addDoc(collection(db, 'managerLogs'), {
            ...managerLog,
            timestamp: serverTimestamp()
          });
        }
        try {
          await addDoc(collection(db, 'activityLogs'), {
            user: managerLogUser || 'System',
            action: logType === 'checkout' ? 'บันทึกเวลาออกงาน' : 'บันทึกเวลาเข้างาน',
            details: `ผู้จัดการ: ${managerLog.managerName || ''}`,
            timestamp: serverTimestamp()
          });
        } catch(e) {}
        result = { success: true };
        break;
      }

      // ── Student History ───────────────────────────────────────────────────
      case 'getStudentHistoryData': {
        const [histName, histNickname, histLogUser] = args;
        const allStudents = await getAll('students');
        const courses = allStudents.filter(s => {
          return s.name === histName || (histNickname && s.nickname === histNickname);
        }).map(s => ({
          id: s.id,
          name: s.name || '',
          nickname: s.nickname || '',
          courseName: s.round || s.grade || '',
          carriedForward: s.carriedForwardFee || 0,
          full: s.tuitionFee || 0,
          paid: s.paidAmount || 0,
          outstanding: (s.tuitionFee || 0) - (s.paidAmount || 0),
          paymentDate: s.paymentDate || '',
          paymentChannel: s.paymentChannel || '',
          staff: s.staff || '',
          hours: s.classHours || '',
          hoursLeft: s.classHoursLeft || '',
          classType: s.classType || ''
        }));

        // Get matching class logs
        const clSnap2 = await getDocs(collection(db, 'classLogs'));
        const classes = [];
        clSnap2.docs.forEach(d => {
          const data = d.data();
          const subject = data.subject || '';
          const nameMatch = (histNickname && subject.includes(histNickname)) || (histName && subject.includes(histName));
          if (nameMatch) {
            classes.push({
              subject: data.subject || '',
              teacherRegular: data.teacherRegular || '',
              teacherSub: data.teacherSub || '',
              timeStart: data.timeStart || '',
              timeEnd: data.timeEnd || '',
              note: data.note || '',
              isPresentLive: data.isPresentLive || 0,
              isPresentOnline: data.isPresentOnline || 0,
              isLeave: data.isLeave || 0,
              isAbsent: data.isAbsent || 0,
              isMakeup: data.isMakeup || 0,
              hours: data.hours || '',
              date: data.date || '',
              roomBranch: data.roomBranch || ''
            });
          }
        });
        classes.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        result = { success: true, courses, classes };
        break;
      }

      case 'getMultipleStudentsCourses': {
        const [mainGroupStudents] = args;
        if (!Array.isArray(mainGroupStudents) || mainGroupStudents.length === 0) {
          result = {};
          break;
        }
        // Build map from gradeSheets — student ID to enrolled course names
        const resultMap = {};
        const gsSnap3 = await getDocs(collection(db, 'gradeSheets'));
        const gradeSheetData = {};
        gsSnap3.docs.forEach(d => {
          gradeSheetData[d.id] = d.data();
        });

        mainGroupStudents.forEach(s => {
          if (!s.id) return;
          const classType = s.classType || '';
          if (classType.includes('เดี่ยว') || classType.includes('ย่อย')) {
            resultMap[s.id] = [];
            return;
          }
          let suffix = '1';
          const branchLearn = s.branchLearn || '';
          if (branchLearn.includes('สาขา2') || branchLearn.includes('2')) suffix = '2';
          else if (branchLearn.includes('สาขา3') || branchLearn.includes('3')) suffix = '3';

          const gsKey = `${s.grade}_${suffix}`;
          const gsData = gradeSheetData[gsKey];
          if (gsData && Array.isArray(gsData.students)) {
            const stdEntry = gsData.students.find(st => st.name === s.name);
            if (stdEntry && Array.isArray(stdEntry.courses)) {
              resultMap[s.id] = stdEntry.courses.map(c => typeof c === 'string' ? c : (c.name || ''));
            } else {
              resultMap[s.id] = [];
            }
          } else {
            resultMap[s.id] = [];
          }
        });
        result = resultMap;
        break;
      }

      // ── Evaluation Update ─────────────────────────────────────────────────
      case 'updateEvaluation': {
        const [evalData, evalLogUser] = args;
        const evalId = evalData.evalId;
        if (!evalId) { result = { success: false, error: 'Missing evalId' }; break; }
        const evalRef = doc(db, 'evaluations', evalId);
        await updateDoc(evalRef, {
          date: evalData.date,
          teacher: evalData.teacher,
          strengths: evalData.strengths,
          improvements: evalData.improvements,
          recommendations: evalData.comments || evalData.recommendations || '',
          scores: evalData.scores || (evalData.score ? { overall: evalData.score } : {}),
          updatedAt: serverTimestamp()
        });
        try {
          await addDoc(collection(db, 'activityLogs'), {
            user: evalLogUser || 'System',
            action: 'อัปเดตใบประเมินนักเรียน',
            details: `ID: ${evalId}`,
            timestamp: serverTimestamp()
          });
        } catch(e) {}
        result = { success: true };
        break;
      }

      // ── Room Settings Update ──────────────────────────────────────────────
      case 'updateRoomSettings': {
        const [roomBranch, roomName, ipad, zoom, roomLogUser] = args;
        const rooms2 = await getAll('rooms');
        const existing2 = rooms2.find(r => r.branch === roomBranch && r.roomName === roomName);
        if (existing2) {
          await updateDoc(doc(db, 'rooms', existing2.id), { ipad: ipad || '', zoom: zoom || '' });
        } else {
          await addDoc(collection(db, 'rooms'), { branch: roomBranch, roomName, ipad: ipad || '', zoom: zoom || '' });
        }
        try {
          await addDoc(collection(db, 'activityLogs'), {
            user: roomLogUser || 'System',
            action: 'ตั้งค่าห้องเรียน',
            details: `ห้อง: ${roomName} (iPad: ${ipad}, Zoom: ${zoom})`,
            timestamp: serverTimestamp()
          });
        } catch(e) {}
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
