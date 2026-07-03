import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from "firebase/auth";
import { 
  collection, doc, getDocs, getDoc, setDoc, updateDoc, 
  query, where, deleteDoc, writeBatch 
} from "firebase/firestore";

// Initialize local memory state replica of Google Apps Script environment
window.state = {
  classAbsences: {},
  settings: { teachers: [], schools: [], paymentChannels: [] },
  students: [],
  classLogs: [],
  managerLogs: [],
  rooms: [],
  selectedStudent: null,
  selectedClassLog: null,
  activeBranchFilter: 'สาขา1',
  selectedTeacher: '',
  currentUser: null,
  gradeSheetData: {
    sheetName: '',
    courses: [],
    students: []
  },
  gradeSheetFilterRound: 'ALL',
  privateStudents: [],
  selectedPrivateStudent: null
};

// Auto-Login / Auth State Bridge
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // Replicate currentUser settings
    window.state.currentUser = {
      username: user.email.split("@")[0],
      email: user.email,
      role: user.email.includes("admin") ? "Administrator" : "Staff"
    };
    
    // Bootstrap Local Dashboard
    console.log("Logged in:", user.email);
    document.getElementById("login_overlay").style.display = "none";
    document.getElementById("app_shell").style.display = "flex";
    
    // Call original bootstrap logic
    if (typeof window.bootApp === "function") {
      window.bootApp();
    }
  } else {
    document.getElementById("login_overlay").style.display = "flex";
    document.getElementById("app_shell").style.display = "none";
  }
});

// Replicate GAS google.script.run bridge calling Firestore instead
window.google = {
  script: {
    run: {
      withSuccessHandler: function (successCallback) {
        this._success = successCallback;
        return this;
      },
      withFailureHandler: function (failureCallback) {
        this._failure = failureCallback;
        return this;
      },
      // Replicate login request
      loginUser: async function (username, password) {
        try {
          const email = username.includes("@") ? username : `${username}@pookpiktutor.com`;
          const cleanPassword = password.length >= 6 ? password : `${password}123456`;
          const userCredential = await signInWithEmailAndPassword(auth, email, cleanPassword);
          
          if (this._success) {
            this._success({
              success: true,
              user: {
                username: username,
                email: email,
                role: username.includes("admin") ? "Administrator" : "Staff"
              }
            });
          }
        } catch (error) {
          if (this._success) this._success({ success: false, error: error.message });
        }
      },
      verifyLogin: async function (username, password) {
        try {
          const email = username.includes("@") ? username : `${username}@pookpiktutor.com`;
          const cleanPassword = password.length >= 6 ? password : `${password}123456`;
          const userCredential = await signInWithEmailAndPassword(auth, email, cleanPassword);
          
          if (this._success) {
            this._success({
              success: true,
              user: {
                username: username,
                email: email,
                role: username.includes("admin") ? "Administrator" : "Staff"
              }
            });
          }
        } catch (error) {
          if (this._success) this._success({ success: false, error: error.message });
        }
      },
      // Replicate bootstrap database loading
      getInitialData: async function () {
        try {
          const result = {
            students: [],
            teachers: [],
            rooms: [],
            classLogs: []
          };
          
          // Load Students
          const stuSnap = await getDocs(collection(db, "students"));
          stuSnap.forEach(d => {
            const data = d.data();
            result.students.push({
              id: d.id,
              name: data.name,
              nickname: data.nickname,
              school: data.school,
              phone: data.phone,
              branchLearn: data.branchLearn,
              branchPay: data.branchPay,
              tuitionFee: data.tuitionFee,
              paidAmount: data.paidAmount,
              balance: data.balance,
              remainingHours: data.remainingHours,
              grade: data.grade
            });
          });

          // Load Teachers
          const teaSnap = await getDocs(collection(db, "teachers"));
          teaSnap.forEach(d => {
            const data = d.data();
            result.teachers.push({
              nickname: data.nickname,
              fullName: data.fullName,
              phone: data.phone
            });
          });

          // Load Rooms
          const roomSnap = await getDocs(collection(db, "rooms"));
          roomSnap.forEach(d => {
            const data = d.data();
            result.rooms.push({
              branch: data.branch,
              roomName: data.roomName
            });
          });

          if (this._success) this._success(result);
        } catch (e) {
          if (this._failure) this._failure(e);
        }
      },
      // Mock other APIs dynamically
      saveClassLogsGroup: async function (logs) {
        console.log("Mock saveClassLogsGroup:", logs);
        if (this._success) this._success({ success: true });
      }
    }
  }
};
