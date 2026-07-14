
// Version 53.9.3: เธเธฃเธฑเธเธฃเธนเธเนเธเธเธซเธเนเธฒเธฅเนเธญเธเธญเธดเธเนเธซเธกเน เธเธทเนเธเธซเธฅเธฑเธเธชเธตเน€เธเธตเธขเธงเน€เธเนเธกเธเธฒเธชเน€เธ—เธฅ เธเธทเนเธญเนเธฃเธเน€เธฃเธตเธขเธเธ•เธฑเธงเนเธซเธเนเธชเธตเธชเธฑเธเธชเธ”เนเธช
// Global State
let state = {
  settings: { teachers: [], schools: [], paymentChannels: [] },
  students: [],
  classLogs: [],
  managerLogs: [],
  rooms: [],
  selectedStudent: null,
  selectedClassLog: null,
  activeBranchFilter: 'เธชเธฒเธเธฒ1',
  selectedTeacher: '',
  dashboardChart1: null,
  dashboardChart2: null,
  
  // Login Session
  currentUser: null,
  
  // Grade Sheet Grid Editor
  gradeSheetData: {
    sheetName: '',
    courses: [],
    students: []
  },
  gradeSheetFilterRound: 'ALL',
  
  // Private students
  privateStudents: [],
  selectedPrivateStudent: null
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  // Check Login Session first
  checkSession();
});

// ----------------------------------------------------
// Authentication & Sessions
// ----------------------------------------------------
function checkSession() {
  const session = localStorage.getItem('pookpik_session');
  if (session) {
    try {
      state.currentUser = JSON.parse(session);
      document.getElementById('login_overlay').style.display = 'none';
      document.getElementById('app_shell').style.display = 'flex';
      
      // Update displayed name
      if (document.getElementById('current_user_display')) document.getElementById('current_user_display').innerText= state.currentUser.username;
      if (document.getElementById('current_role_display')) document.getElementById('current_role_display').innerText= state.currentUser.role;
      if (document.getElementById('avatar_letters')) document.getElementById('avatar_letters').innerText= state.currentUser.username.substring(0, 2).toUpperCase();
      
      // Bootstrap App Data
      bootApp();
    } catch (e) {
      localStorage.removeItem('pookpik_session');
      showLoginScreen();
    }
  } else {
    showLoginScreen();
  }
}

function showLoginScreen() {
  document.getElementById('login_overlay').style.display = 'flex';
  document.getElementById('app_shell').style.display = 'none';
}

function handleLogin(e) {
  e.preventDefault();
  const user = document.getElementById('login_username').value.trim();
  const pass = document.getElementById('login_password').value;
  
  setLoading(true, 'เธเธณเธฅเธฑเธเน€เธเนเธฒเธชเธนเนเธฃเธฐเธเธ...');
  google.script.run
    .withSuccessHandler(res => {
      setLoading(false);
      if (res && res.success) {
        localStorage.setItem('pookpik_session', JSON.stringify(res.user));
        showToast('เน€เธเนเธฒเธชเธนเนเธฃเธฐเธเธเน€เธชเธฃเนเธเธชเธดเนเธ!', 'success');
        checkSession();
      } else {
        showToast('เธฅเนเธญเธเธญเธดเธเธฅเนเธกเน€เธซเธฅเธง: ' + res.error, 'error');
      }
    })
    .withFailureHandler(err => {
      setLoading(false);
      showToast('เธเธฒเธฃเน€เธเธทเนเธญเธกเธ•เนเธญเธเธดเธ”เธเธฅเธฒเธ”: ' + err.message, 'error');
    })
    .verifyLogin(user, pass);
}

function handleLogout() {
  if (confirm('เธเธธเธ“เธ•เนเธญเธเธเธฒเธฃเธญเธญเธเธเธฒเธเธฃเธฐเธเธเนเธเนเธซเธฃเธทเธญเนเธกเน?')) {
    localStorage.removeItem('pookpik_session');
    state.currentUser = null;
    showLoginScreen();
    showToast('เธญเธญเธเธเธฒเธเธฃเธฐเธเธเน€เธฃเธตเธขเธเธฃเนเธญเธขเนเธฅเนเธง', 'info');
  }
}

function getLogUser() {
  return state.currentUser ? state.currentUser.username : 'System';
}

// Bootstrap Application data after login
function bootApp() {
  setLoading(true, 'เธเธณเธฅเธฑเธเนเธซเธฅเธ”เธเนเธญเธกเธนเธฅเธเธทเนเธเธเธฒเธ...');
  
  // Load initial configurations
  google.script.run
    .withSuccessHandler(settings => {
      if (settings && !settings.error) {
        state.settings = settings;
        populateDropdowns();
        
        // Update diagnostic badge
        if (settings.dbSummary) {
          if (document.getElementById('db_diagnostic_badge')) document.getElementById('db_diagnostic_badge').innerHTML= `
            <div><b>เธเธฒเธเธเนเธญเธกเธนเธฅ:</b> ${settings.dbSummary.name}</div>
            <div><b>ID:</b> ${settings.dbSummary.id.substring(0, 12)}...</div>
            <div><b>เนเธเนเธเธเธฒเธ:</b> ${settings.dbSummary.sheets ? settings.dbSummary.sheets.length : 0} เธเธตเธ•</div>
            <div><b>เธฃเธฒเธขเธเธฒเธฃเธเธฑเธเน€เธฃเธตเธขเธ:</b> ${settings.dbSummary.statusRows - 1} เธฃเธฒเธขเธเธฒเธฃ</div>
          `;
        }
      } else {
        showToast('เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เนเธซเธฅเธ”เธเนเธญเธกเธนเธฅเธเธฒเธฃเธ•เธฑเนเธเธเนเธฒเนเธ”เน: ' + (settings ? settings.error : 'unknown'), 'error');
        if (document.getElementById('db_diagnostic_badge')) document.getElementById('db_diagnostic_badge').innerText= 'DB: เนเธซเธฅเธ”เธฅเนเธกเน€เธซเธฅเธง';
      }
      switchPanel('dashboard');
    })
    .withFailureHandler(err => {
      showToast('เน€เธเธทเนเธญเธกเธ•เนเธญเธเธฒเธเธเนเธญเธกเธนเธฅเธฅเนเธกเน€เธซเธฅเธง: ' + err.message, 'error');
      switchPanel('dashboard');
    })
    .getGeneralSettings();
    
  // Navigation Event Listeners
  document.querySelectorAll('.nav-item').forEach(item => {
    // Remove old listeners and clone to prevent duplicate triggers
    const newItem = item.cloneNode(true);
    item.parentNode.replaceChild(newItem, item);
    
    newItem.addEventListener('click', (e) => {
      const panelName = newItem.getAttribute('data-panel');
      switchPanel(panelName);
    });
  });
  
  // Daily Grid Branch Tab listeners
  document.querySelectorAll('.branch-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.branch-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.activeBranchFilter = tab.getAttribute('data-branch');
      renderDailyGrid();
    });
  });
  
  // Set default dates
  const todayStr = getTodayString();
  if (document.getElementById('log_filter_date')) document.getElementById('log_filter_date').value= todayStr;
  if (document.getElementById('daily_grid_filter_date')) document.getElementById('daily_grid_filter_date').value= todayStr;
  if (document.getElementById('class_date')) document.getElementById('class_date').value= todayStr;
  if (document.getElementById('student_pay_date')) document.getElementById('student_pay_date').value= todayStr;
  if (document.getElementById('manager_date')) document.getElementById('manager_date').value= todayStr;
  if (document.getElementById('teacher_schedule_date')) {
    if (document.getElementById('teacher_schedule_date')) document.getElementById('teacher_schedule_date').value= todayStr;
  }
  
  // Set display strings for dates
  setTimeout(() => {
    if (document.getElementById('daily_grid_date_display')) {
      if (document.getElementById('daily_grid_date_display')) document.getElementById('daily_grid_date_display').innerText= formatDateToThaiShort(todayStr);
    }
    if (document.getElementById('class_log_date_display')) {
      if (document.getElementById('class_log_date_display')) document.getElementById('class_log_date_display').innerText= formatDateToThaiShort(todayStr);
    }
    if (document.getElementById('teacher_schedule_date_display')) {
      if (document.getElementById('teacher_schedule_date_display')) document.getElementById('teacher_schedule_date_display').innerText= formatDateToThaiShort(todayStr);
    }
  }, 100);

  // Background silent auto-refresh every 30 seconds
  setInterval(() => {
    const activeItem = document.querySelector('.nav-item.active');
    if (!activeItem) return;
    const activePanel = activeItem.getAttribute('data-panel');
    if (activePanel === 'daily_grid') {
      loadDailyGrid(true);
    } else if (activePanel === 'class_logs') {
      loadClassLogs(true);
    } else if (activePanel === 'teacher_schedule') {
      loadTeacherSchedule(true);
    }
  }, 30000);

  // Initialize teacher calendar state to current month
  state.teacherCalendarMonth = new Date().getMonth();
  selectTeacherScheduleMonth(state.teacherCalendarMonth);
  
  // Set default calculation dates (current month billing)
  const d = new Date();
  const currentYear = d.getFullYear();
  const currentMonth = d.getMonth() + 1;
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
  
  if (document.getElementById('calc_start_date')) document.getElementById('calc_start_date').value= `${prevYear}-${prevMonth < 10 ? '0' + prevMonth : prevMonth}-29`;
  if (document.getElementById('calc_end_date')) document.getElementById('calc_end_date').value= `${currentYear}-${currentMonth < 10 ? '0' + currentMonth : currentMonth}-28`;
}

// ----------------------------------------------------
// Helper Functions
// ----------------------------------------------------
function getTodayString() {
  const d = new Date();
  let day = d.getDate();
  let month = d.getMonth() + 1;
  const year = d.getFullYear();
  if (day < 10) day = '0' + day;
  if (month < 10) month = '0' + month;
  return `${year}-${month}-${day}`;
}

function formatDateToThai(dateStr) {
  return formatDateTimeToThaiLong(dateStr);
}

function formatPhone(phone) {
  if (!phone) return '';
  let str = phone.toString().trim();
  let digits = str.replace(/\D/g, '');
  if (digits.length === 10) {
    return digits.slice(0, 3) + '-' + digits.slice(3, 6) + '-' + digits.slice(6);
  }
  if (digits.length === 9) {
    return digits.slice(0, 2) + '-' + digits.slice(2, 5) + '-' + digits.slice(5);
  }
  return str;
}

function formatDateTimeToThaiLong(dateStr) {
  if (!dateStr) return '';
  let dateObj = null;
  let hasTime = false;
  let hh = '00', mm = '00', ss = '00';
  
  if (dateStr instanceof Date) {
    dateObj = dateStr;
    hasTime = true;
  } else {
    let str = dateStr.toString().trim();
    // 1. Extract time if present
    const timeMatch = str.match(/(\d{1,2}):(\d{1,2}):(\d{1,2})/);
    if (timeMatch) {
      hh = timeMatch[1].padStart(2, '0');
      mm = timeMatch[2].padStart(2, '0');
      ss = timeMatch[3].padStart(2, '0');
      hasTime = true;
      str = str.replace(/(\d{1,2}):(\d{1,2}):(\d{1,2})/, '').trim();
    } else {
      const timeMatchHM = str.match(/(\d{1,2}):(\d{1,2})/);
      if (timeMatchHM) {
        hh = timeMatchHM[1].padStart(2, '0');
        mm = timeMatchHM[2].padStart(2, '0');
        ss = '00';
        hasTime = true;
        str = str.replace(/(\d{1,2}):(\d{1,2})/, '').trim();
      }
    }
    
    // Remove ISO time part trailing info
    str = str.replace(/T.*/, '').trim();
    
    // 2. Parse date part
    if (str.includes('/')) {
      const parts = str.split('/');
      if (parts.length === 3) {
        let d = parseInt(parts[0], 10);
        let m = parseInt(parts[1], 10) - 1;
        let y = parseInt(parts[2], 10);
        if (y > 2400) y -= 543;
        dateObj = new Date(y, m, d);
      }
    } else if (str.includes('-')) {
      const parts = str.split('-');
      if (parts.length === 3) {
        let y = parseInt(parts[0], 10);
        let m = parseInt(parts[1], 10) - 1;
        let d = parseInt(parts[2], 10);
        if (y > 2400) y -= 543;
        dateObj = new Date(y, m, d);
      }
    } else {
      const parsed = Date.parse(str);
      if (!isNaN(parsed)) {
        dateObj = new Date(parsed);
      }
    }
  }
  
  if (!dateObj || isNaN(dateObj.getTime())) return dateStr;
  
  if (hasTime && hh === '00' && mm === '00' && ss === '00') {
    hh = String(dateObj.getHours()).padStart(2, '0');
    mm = String(dateObj.getMinutes()).padStart(2, '0');
    ss = String(dateObj.getSeconds()).padStart(2, '0');
  }
  
  const thDays = ['เธงเธฑเธเธญเธฒเธ—เธดเธ•เธขเน', 'เธงเธฑเธเธเธฑเธเธ—เธฃเน', 'เธงเธฑเธเธญเธฑเธเธเธฒเธฃ', 'เธงเธฑเธเธเธธเธ', 'เธงเธฑเธเธเธคเธซเธฑเธชเธเธ”เธต', 'เธงเธฑเธเธจเธธเธเธฃเน', 'เธงเธฑเธเน€เธชเธฒเธฃเน'];
  const thMonths = ['เธก.เธ.', 'เธ.เธ.', 'เธกเธต.เธ.', 'เน€เธก.เธข.', 'เธ.เธ.', 'เธกเธด.เธข.', 'เธ.เธ.', 'เธช.เธ.', 'เธ.เธข.', 'เธ•.เธ.', 'เธ.เธข.', 'เธ.เธ.'];
  
  const dayName = thDays[dateObj.getDay()];
  const day = dateObj.getDate();
  const monthName = thMonths[dateObj.getMonth()];
  const yearBE = dateObj.getFullYear() + 543;
  
  if (hh === '00' && mm === '00' && ss === '00') {
    return `${dayName} ${day} ${monthName} ${yearBE}`;
  }
  return `${hh}:${mm}:${ss} ${dayName} ${day} ${monthName} ${yearBE}`;
}

function parseSheetDurationToThai(val) {
  if (val === '' || val === null || val === undefined) return '0 เธเธก. 0 เธเธฒเธ—เธต';
  let str = val.toString().trim();
  
  if (str.includes('เธเธก.') && str.includes('เธเธฒเธ—เธต')) {
    return str;
  }
  
  let hh = 0, mm = 0;
  let isNegative = false;
  if (str.startsWith('-')) {
    isNegative = true;
    str = str.slice(1).trim();
  }
  
  if (str.includes('1899') || str.includes('1900') || str.includes('GMT') || str.includes('UTC')) {
    const match = str.match(/(\d{2}):(\d{2})/);
    if (match) {
      hh = parseInt(match[1], 10);
      mm = parseInt(match[2], 10);
    }
  } else if (str.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/)) {
    const timePart = str.split('T')[1];
    const parts = timePart.split(':');
    hh = parseInt(parts[0], 10);
    mm = parseInt(parts[1], 10);
  } else if (str.includes(':')) {
    const parts = str.split(':');
    hh = parseInt(parts[0], 10) || 0;
    mm = parseInt(parts[1], 10) || 0;
  } else {
    const num = parseFloat(str);
    if (!isNaN(num)) {
      hh = Math.floor(num);
      mm = Math.round((num % 1) * 60);
    }
  }
  
  return (isNegative ? '-' : '') + `${hh} เธเธก. ${mm} เธเธฒเธ—เธต`;
}

function parseSheetDurationToHHMM(val) {
  if (val === '' || val === null || val === undefined) return '00:00';
  let str = val.toString().trim();
  
  if (str.includes('1899') || str.includes('1900') || str.includes('GMT') || str.includes('UTC')) {
    const match = str.match(/(\d{2}):(\d{2})/);
    if (match) {
      return `${match[1]}:${match[2]}`;
    }
  }
  if (str.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/)) {
    const timePart = str.split('T')[1];
    const parts = timePart.split(':');
    return `${parts[0]}:${parts[1]}`;
  }
  if (str.includes(':')) {
    const parts = str.split(':');
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
  }
  const num = parseFloat(str);
  if (!isNaN(num)) {
    const hh = Math.floor(num);
    const mm = Math.round((num % 1) * 60);
    return `${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}`;
  }
  return '00:00';
}

function convertDateToSheet(dateVal) {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

function convertDateFromSheet(dateVal) {
  if (!dateVal) return '';
  const datePart = dateVal.split(' ')[0];
  const parts = datePart.split('/');
  if (parts.length === 3) {
    let day = parts[0];
    let month = parts[1];
    const year = parts[2];
    if (day.length < 2) day = '0' + day;
    if (month.length < 2) month = '0' + month;
    return `${year}-${month}-${day}`;
  }
  return '';
}

function convertTimeFromSheet(dateVal) {
  if (!dateVal) return '';
  const parts = dateVal.split(' ');
  if (parts.length >= 2) {
    const timeStr = parts[1];
    if (timeStr.includes(':')) {
      return timeStr;
    }
  }
  return '';
}

function getCurrentTimeHHMM() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function calculateHoursFromPayment() {
  const courseName = document.getElementById('p_course_name').value || '';
  const paid = parseFloat(document.getElementById('p_paid').value) || 0;
  
  let rate = 250;
  if (courseName.toLowerCase().includes('ex')) rate = 312.5;
  
  const totalHrs = paid / rate;
  const hh = Math.floor(totalHrs);
  const mm = Math.round((totalHrs % 1) * 60);
  
  if (document.getElementById('p_hours')) document.getElementById('p_hours').value= `${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}`;
}

function setLoading(show, text = 'เธเธณเธฅเธฑเธเนเธซเธฅเธ”เธเนเธญเธกเธนเธฅ...') {
  const overlay = document.getElementById('loader_overlay');
  const loaderText = document.getElementById('loader_text');
  if (show) {
    loaderText.innerText = text;
    overlay.classList.add('active');
  } else {
    overlay.classList.remove('active');
  }
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast_container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = 'โน๏ธ';
  if (type === 'success') icon = 'โ…';
  if (type === 'error') icon = 'โ';
  if (type === 'warning') icon = 'โ ๏ธ';
  
  toast.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div class="toast-message">${message}</div>
  `;
  
  container.appendChild(toast);
  setTimeout(() => toast.classList.add('active'), 50);
  
  setTimeout(() => {
    toast.classList.remove('active');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Dropdown population
function populateDropdowns() {
  const teachers = state.settings.teachers;
  const schools = state.settings.schools;
  const channels = state.settings.paymentChannels;
  
  populateSelect('class_teacher_reg', teachers);
  populateSelect('class_teacher_sub', ['(เนเธกเนเธกเธตเธเธฃเธนเนเธ—เธ)', ...teachers]);
  populateSelect('teacher_schedule_select', ['(เน€เธฅเธทเธญเธเธเธทเนเธญเธเธฃเธน)', ...teachers]);
  populateDatalist('student_school_list', schools);
  populateSelect('student_pay_channel', channels);
  populateSelect('p_payment_channel', channels);
  populateSelect('manager_name', ['เธเธเธ.เธเนเธญเธก', 'เธเธเธ.เธเธดเนเธ', 'เธเธเธ.เธเธฑเธ', 'เธเธเธ.เน€เธเธทเนเธญเธ']);
  populateSelect('calc_teacher_select', ['(เน€เธฅเธทเธญเธเธเธฃเธนเน€เธเธทเนเธญเธเธณเธเธงเธ“)', ...teachers]);
  
  // Auto-populate course list in the class log subject autocomplete datalist
  google.script.run
    .withSuccessHandler(courses => {
      if (Array.isArray(courses)) {
        populateDatalist('class_subject_list', courses);
      }
    })
    .getAllCoursesFromGradeSheets();
    
  populateTeacherDatalists();
}

function populateTeacherDatalists() {
  const rayongSchools = [
    'เธงเนเธฒเธเธเธฒเธ',
    'เธเธเธฑเธเธเธฒเธเธเธฃเธดเธฉเธฑเธ—',
    'เนเธฃเธเน€เธฃเธตเธขเธเธฃเธฐเธขเธญเธเธงเธดเธ—เธขเธฒเธเธก',
    'เนเธฃเธเน€เธฃเธตเธขเธเธงเธฑเธ”เธเนเธฒเธเธฃเธฐเธ”เธนเน',
    'เนเธฃเธเน€เธฃเธตเธขเธเธกเธฑเธเธขเธกเธ•เธฒเธเธชเธดเธเธฃเธฐเธขเธญเธ',
    'เนเธฃเธเน€เธฃเธตเธขเธเธญเธฑเธชเธชเธฑเธกเธเธฑเธเธฃเธฐเธขเธญเธ',
    'เนเธฃเธเน€เธฃเธตเธขเธเน€เธเธเธ•เนเนเธขเน€เธเธเธฃเธฐเธขเธญเธ',
    'เนเธฃเธเน€เธฃเธตเธขเธเธฃเธฐเธขเธญเธเธงเธดเธ—เธขเธฒเธเธก เธเธฒเธเธเนเธณ',
    'เนเธฃเธเน€เธฃเธตเธขเธเนเธเธฅเธ "เธงเธดเธ—เธขเธชเธ–เธฒเธงเธฃ"',
    'เนเธฃเธเน€เธฃเธตเธขเธเธเนเธฒเธเธเธฒเธเธเธฒเธเธเธเธเธธเธฅเธงเธดเธ—เธขเธฒ',
    'เนเธฃเธเน€เธฃเธตเธขเธเธกเธฒเธเธ•เธฒเธเธธเธ”เธเธฑเธเธเธดเธ—เธขเธฒเธเธฒเธฃ',
    'เนเธฃเธเน€เธฃเธตเธขเธเธญเธเธธเธเธฒเธฅเธฃเธฐเธขเธญเธ',
    'เนเธฃเธเน€เธฃเธตเธขเธเธเธธเธกเธธเธ—เธกเธฒเธช',
    'เนเธฃเธเน€เธฃเธตเธขเธเธชเธธเธเธ—เธฃเธ เธนเนเธเธดเธ—เธขเธฒ',
    'เนเธฃเธเน€เธฃเธตเธขเธเน€เธเธฅเธดเธกเธเธฃเธฐเน€เธเธตเธขเธฃเธ•เธดเธชเธกเน€เธ”เนเธเธเธฃเธฐเธจเธฃเธตเธเธเธฃเธดเธเธ—เธฃเน เธฃเธฐเธขเธญเธ',
    'เนเธฃเธเน€เธฃเธตเธขเธเธงเธดเธเธนเธฅเธงเธดเธ—เธขเธฒ',
    'เนเธฃเธเน€เธฃเธตเธขเธเธเธฅเธงเธเนเธ”เธเธเธดเธ—เธขเธฒเธเธก',
    'เนเธฃเธเน€เธฃเธตเธขเธเธงเธฑเธเธเธฑเธเธ—เธฃเนเธงเธดเธ—เธขเธฒ',
    'เนเธฃเธเน€เธฃเธตเธขเธเน€เธเธฒเธเธฐเน€เธกเธฒเธงเธดเธ—เธขเธฒ',
    'เนเธฃเธเน€เธฃเธตเธขเธเน€เธเธฃเธฑเธเธฉเธกเธฒเธ•เธฒเธงเธดเธ—เธขเธฒ',
    'เนเธฃเธเน€เธฃเธตเธขเธเธเธดเธเธกเธชเธฃเนเธฒเธเธ•เธเน€เธญเธเธเธฑเธเธซเธงเธฑเธ”เธฃเธฐเธขเธญเธ 1',
    'เนเธฃเธเน€เธฃเธตเธขเธเธเธฃเธฐเธเธฒเธฃเธฒเธฉเธเธฃเนเธญเธธเธเธ–เธฑเธกเธ เน'
  ];
  
  const thaiBanks = [
    'เธเธเธฒเธเธฒเธฃเธเธชเธดเธเธฃเนเธ—เธข',
    'เธเธเธฒเธเธฒเธฃเนเธ—เธขเธเธฒเธ“เธดเธเธขเน',
    'เธเธเธฒเธเธฒเธฃเธเธฃเธธเธเน€เธ—เธ',
    'เธเธเธฒเธเธฒเธฃเธเธฃเธธเธเนเธ—เธข',
    'เธเธเธฒเธเธฒเธฃเธ—เธซเธฒเธฃเนเธ—เธขเธเธเธเธฒเธ• (ttb)',
    'เธเธเธฒเธเธฒเธฃเธเธฃเธธเธเธจเธฃเธตเธญเธขเธธเธเธขเธฒ',
    'เธเธเธฒเธเธฒเธฃเธญเธญเธกเธชเธดเธ',
    'เธเธเธฒเธเธฒเธฃเน€เธเธทเนเธญเธเธฒเธฃเน€เธเธฉเธ•เธฃเนเธฅเธฐเธชเธซเธเธฃเธ“เนเธเธฒเธฃเน€เธเธฉเธ•เธฃ (เธ.เธ.เธช.)',
    'เธเธเธฒเธเธฒเธฃเธญเธฒเธเธฒเธฃเธชเธเน€เธเธฃเธฒเธฐเธซเน (เธเธญเธช.)',
    'เธเธเธฒเธเธฒเธฃเธขเธนเนเธญเธเธต',
    'เธเธเธฒเธเธฒเธฃเน€เธเธตเธขเธฃเธ•เธดเธเธฒเธเธดเธเธ เธฑเธ—เธฃ',
    'เธเธเธฒเธเธฒเธฃเธเธตเนเธญเน€เธญเนเธกเธเธตเนเธ—เธข',
    'เธเธเธฒเธเธฒเธฃเธ—เธดเธชเนเธเน',
    'เธเธเธฒเธเธฒเธฃเนเธฅเธเธ”เน เนเธญเธเธ”เน เน€เธฎเนเธฒเธชเน',
    'เธเธเธฒเธเธฒเธฃเธญเธดเธชเธฅเธฒเธกเนเธซเนเธเธเธฃเธฐเน€เธ—เธจเนเธ—เธข'
  ];
  
  populateDatalist('t_school_list', rayongSchools);
  populateDatalist('t_bank_list', thaiBanks);
}

function populateDatalist(elemId, list) {
  const dl = document.getElementById(elemId);
  if (!dl) return;
  dl.innerHTML = '';
  list.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item;
    dl.appendChild(opt);
  });
}

function populateSelect(elemId, list) {
  const select = document.getElementById(elemId);
  if (!select) return;
  
  const curVal = select.value;
  select.innerHTML = '';
  
  list.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item === '(เนเธกเนเธกเธตเธเธฃเธนเนเธ—เธ)' || item === '(เน€เธฅเธทเธญเธเธเธทเนเธญเธเธฃเธน)' || item === '(เน€เธฅเธทเธญเธเธเธฃเธนเน€เธเธทเนเธญเธเธณเธเธงเธ“)' ? '' : item;
    opt.innerText = item;
    select.appendChild(opt);
  });
  
  if (curVal && list.includes(curVal)) {
    select.value = curVal;
  }
}

// ----------------------------------------------------
// Navigation / Views Switching
// ----------------------------------------------------
function switchPanel(panelName) {
  // Update sidebar active link
  document.querySelectorAll('.nav-item').forEach(item => {
    if (item.getAttribute('data-panel') === panelName) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
  
  // Update panels visibility
  document.querySelectorAll('.view-panel').forEach(panel => {
    if (panel.id === `${panelName}_panel`) {
      panel.classList.add('active');
    } else {
      panel.classList.remove('active');
    }
  });
  
  // Set navbar title based on view
  const titles = {
    'dashboard': 'เนเธ”เธเธเธญเธฃเนเธ”เธชเธฃเธธเธเธเธฅเธเธเธดเธเธฑเธ•เธดเธเธฒเธ',
    'students': 'เธฅเธเธ—เธฐเน€เธเธตเธขเธเน€เธ”เนเธเนเธซเธกเนเน€เธเนเธฒเธฃเธฐเธเธ',
    'grade_sheets': 'เธ•เธฒเธฃเธฒเธเธเธฑเธ”เธเธฒเธฃเธเธญเธฃเนเธชเน€เธฃเธตเธขเธเนเธขเธเธซเนเธญเธ',
    'daily_grid': 'เธ•เธฒเธฃเธฒเธเน€เธฃเธตเธขเธเธฃเธฒเธขเธซเนเธญเธเน€เธฃเธตเธขเธเธฃเธฒเธขเธงเธฑเธ',
    'private_students': 'เน€เธ”เนเธเน€เธฃเธตเธขเธเน€เธ”เธตเนเธขเธง & เธเธฅเธธเนเธกเธขเนเธญเธข',
    'class_logs': 'เธเธฑเธเธ—เธถเธเธเธฑเนเธงเนเธกเธเธชเธญเธเธเธฅเธฒเธชเธฃเธฒเธขเธงเธฑเธ',
    'teacher_schedule': 'เธ•เธฒเธฃเธฒเธเธชเธญเธเธชเนเธงเธเธ•เธฑเธงเธเธธเธ“เธเธฃเธน',
    'teacher_profiles': 'เธเธฃเธฐเธงเธฑเธ•เธดเธญเธฒเธเธฒเธฃเธขเนเธเธนเนเธชเธญเธ & เธเธณเธเธงเธ“เธเนเธฒเนเธฃเธ',
    'manager_logs': 'เธฅเธเน€เธงเธฅเธฒเธ—เธณเธเธฒเธเธเธนเนเธเธฑเธ”เธเธฒเธฃเธชเธฒเธเธฒ',
    'activity_logs': 'เธฃเธฒเธขเธเธฒเธเธเธฒเธฃเธ—เธณเธเธธเธฃเธเธฃเธฃเธกเธเธญเธเธฃเธฐเธเธ (Audit Trail)',
    'debtors': 'เธ•เธฃเธงเธเธชเธญเธเนเธฅเธฐเธเธฑเธเธ—เธถเธเธเนเธฒเธเธเธณเธฃเธฐเน€เธเธดเธเธเนเธฒเน€เธฃเธตเธขเธ',
    'print_receipts': 'เธญเธญเธเนเธเน€เธชเธฃเนเธเธฃเธฑเธเน€เธเธดเธเธเนเธฒเน€เธฃเธตเธขเธ'
  };
  if (document.getElementById('page_title')) document.getElementById('page_title').innerText= titles[panelName] || 'เธฃเธฐเธเธเธ”เธนเนเธฅเนเธฃเธเน€เธฃเธตเธขเธเธเธงเธ”เธงเธดเธเธฒ';
  
  // Load panel specific data
  if (panelName === 'dashboard') {
    loadDashboard();
    loadRoundSummary();
  } else if (panelName === 'students') {
    loadStudents();
  } else if (panelName === 'grade_sheets') {
    // Reset grade sheet display
    if (document.getElementById('grade_sheet_grid_table')) document.getElementById('grade_sheet_grid_table').innerHTML= `<tr><td style="padding: 40px; text-align: center; color: var(--text-muted);">เธเธฃเธธเธ“เธฒเน€เธฅเธทเธญเธเธ•เธฒเธฃเธฒเธเธฃเธฐเธ”เธฑเธเธเธฑเนเธเธ”เนเธฒเธเธเธ</td></tr>`;
    document.getElementById('save_grade_sheet_btn').disabled = true;
  } else if (panelName === 'daily_grid') {
    loadDailyGrid();
  } else if (panelName === 'private_students') {
    loadPrivateStudents();
  } else if (panelName === 'class_logs') {
    loadClassLogs();
  } else if (panelName === 'teacher_profiles') {
    loadTeacherProfiles();
  } else if (panelName === 'manager_logs') {
    loadManagerLogs();
  } else if (panelName === 'activity_logs') {
    loadActivityLogs();
  } else if (panelName === 'debtors') {
    loadDebtors();
  } else if (panelName === 'print_receipts') {
    loadReceipts();
  }
}

// ----------------------------------------------------
// 1. Dashboard & Dynamic Summary Aggregations
// ----------------------------------------------------
function loadDashboard() {
  setLoading(true, 'เธเธณเธฅเธฑเธเธ”เธถเธเธชเธ–เธดเธ•เธดเธเธณเธเธงเธเน€เธเธดเธเธชเธฐเธชเธก...');
  google.script.run
    .withSuccessHandler(data => {
      setLoading(false);
      if (data && !data.error) {
        renderDashboardData(data);
      } else {
        showToast('เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เนเธซเธฅเธ”เธเนเธญเธกเธนเธฅเธซเธเนเธฒเธซเธฅเธฑเธเนเธ”เน: ' + (data ? data.error : 'unknown'), 'error');
      }
    })
    .withFailureHandler(err => {
      setLoading(false);
      showToast('เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เธ”เธถเธเธเนเธญเธกเธนเธฅเนเธ”เธเธเธญเธฃเนเธ”เนเธ”เน: ' + err.message, 'error');
    })
    .getDashboardData();
}

function renderDashboardData(data) {
  if (document.getElementById('dash_total_income')) document.getElementById('dash_total_income').innerText= 'เธฟ' + data.totalIncome.toLocaleString();
  if (document.getElementById('dash_total_paid')) document.getElementById('dash_total_paid').innerText= 'เธฟ' + data.totalPaid.toLocaleString();
  
  const outstandingEl = document.getElementById('dash_total_outstanding');
  outstandingEl.innerText = 'เธฟ' + data.totalOutstanding.toLocaleString();
  outstandingEl.style.color = data.totalOutstanding > 0 ? '#ef4444' : 'var(--text-main)';
  
  if (document.getElementById('dash_total_classes')) document.getElementById('dash_total_classes').innerText= data.totalClasses.toLocaleString() + ' เธเธฅเธฒเธช';
  if (document.getElementById('dash_total_hours')) document.getElementById('dash_total_hours').innerText= data.totalHours.toLocaleString() + ' เธเธก.';
  
  // Branches chart
  const ctx1 = document.getElementById('chart_branches').getContext('2d');
  if (state.dashboardChart1) state.dashboardChart1.destroy();
  
  const branches = Object.keys(data.branchFin);
  const paidData = branches.map(b => data.branchFin[b].paid);
  const debtData = branches.map(b => data.branchFin[b].debt);
  
  state.dashboardChart1 = new Chart(ctx1, {
    type: 'bar',
    data: {
      labels: branches,
      datasets: [
        { label: 'เธเธณเธฃเธฐเน€เธเธดเธเนเธฅเนเธง', data: paidData, backgroundColor: '#466352', borderRadius: 8 },
        { label: 'เธเนเธฒเธเธเธณเธฃเธฐ', data: debtData, backgroundColor: '#ef4444', borderRadius: 8 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#5a6e7f' } } },
      scales: {
        x: { grid: { color: 'rgba(63, 84, 73, 0.18)' }, ticks: { color: '#5a6e7f' } },
        y: { grid: { color: 'rgba(63, 84, 73, 0.18)' }, ticks: { color: '#5a6e7f' } }
      }
    }
  });
  
  // Rounds chart
  const ctx2 = document.getElementById('chart_rounds').getContext('2d');
  if (state.dashboardChart2) state.dashboardChart2.destroy();
  
  const rounds = Object.keys(data.roundFin).slice(0, 7);
  const roundSums = rounds.map(r => data.roundFin[r].full);
  
  state.dashboardChart2 = new Chart(ctx2, {
    type: 'doughnut',
    data: {
      labels: rounds,
      datasets: [{
        data: roundSums,
        backgroundColor: ['#ff9ebb', '#c095e7', '#7fa391', '#ffd166', '#ff8282', '#8ac8ff', '#a19098'],
        borderWidth: 2,
        borderColor: '#edf0ee'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'right', labels: { color: '#5a6e7f' } } }
    }
  });
}

function loadRoundSummary() {
  const round = document.getElementById('summary_round_filter').value;
  const branch = document.getElementById('summary_branch_filter').value;
  
  setLoading(true, 'เธเธณเธฅเธฑเธเธเธฃเธฐเธกเธงเธฅเธเธฅเธชเธฃเธธเธเธเนเธญเธกเธนเธฅเธ•เธฒเธกเธฃเธญเธ ' + round + '...');
  google.script.run
    .withSuccessHandler(res => {
      setLoading(false);
      if (res && res.success) {
        renderRoundSummaryTable(res.summary, res.categories);
      } else {
        showToast('เธเธฒเธฃเธเธฃเธฐเธกเธงเธฅเธเธฅเธฅเนเธกเน€เธซเธฅเธง: ' + res.error, 'error');
      }
    })
    .withFailureHandler(err => {
      setLoading(false);
      showToast('เธเธฒเธฃเธ•เธดเธ”เธ•เนเธญเธฅเนเธกเน€เธซเธฅเธง: ' + err.message, 'error');
    })
    .getRoundSummary(round, branch);
}

function renderRoundSummaryTable(summary, categories) {
  const tbody = document.getElementById('summary_table_tbody');
  const tfoot = document.getElementById('summary_table_tfoot');
  tbody.innerHTML = '';
  
  let totalPaidKids = 0;
  let totalOutstandingKids = 0;
  let totalSingleKids = 0;
  let totalGroupKids = 0;
  let totalAttendedKids = 0;
  let totalRegularGroup = 0;
  let sumFull = 0;
  let sumPaid = 0;
  let sumOutstanding = 0;
  
  categories.forEach(catName => {
    const row = summary[catName];
    if (!row) return;
    
    // Sum totals
    totalPaidKids += row.paidKids;
    totalOutstandingKids += row.outstandingKids;
    totalSingleKids += row.singleKids;
    totalGroupKids += row.groupKids;
    totalAttendedKids += row.attendedKids;
    totalRegularGroup += row.regularGroupKids;
    sumFull += row.totalFull;
    sumPaid += row.totalPaid;
    sumOutstanding += row.totalOutstanding;
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight: 500;">${catName}</td>
      <td style="text-align: center;">${row.paidKids || '-'}</td>
      <td style="text-align: center; color:${row.outstandingKids > 0 ? '#ef4444' : 'inherit'};">${row.outstandingKids || '-'}</td>
      <td style="text-align: center;">${row.singleKids || '-'}</td>
      <td style="text-align: center;">${row.groupKids || '-'}</td>
      <td style="text-align: center;">${row.attendedKids || '-'}</td>
      <td style="text-align: center;">${row.regularGroupKids || '-'}</td>
      <td style="text-align: right; font-weight:600;">${row.totalFull > 0 ? 'เธฟ' + row.totalFull.toLocaleString() : '-'}</td>
      <td style="text-align: right; font-weight:600; color:#466352;">${row.totalPaid > 0 ? 'เธฟ' + row.totalPaid.toLocaleString() : '-'}</td>
      <td style="text-align: right; font-weight:600; color:${row.totalOutstanding > 0 ? '#ef4444' : 'inherit'};">${row.totalOutstanding > 0 ? 'เธฟ' + row.totalOutstanding.toLocaleString() : '-'}</td>
      <td style="font-size:0.75rem; max-width: 250px; overflow:hidden; text-overflow:ellipsis;" title="${row.notes.join(', ')}">${row.notes.length > 0 ? row.notes.slice(0, 2).join(', ') + '...' : '-'}</td>
    `;
    tbody.appendChild(tr);
  });
  
  tfoot.innerHTML = `
    <td>เธขเธญเธ”เธฃเธงเธกเธ—เธฑเนเธเธซเธกเธ”</td>
    <td style="text-align: center;">${totalPaidKids}</td>
    <td style="text-align: center;">${totalOutstandingKids}</td>
    <td style="text-align: center;">${totalSingleKids}</td>
    <td style="text-align: center;">${totalGroupKids}</td>
    <td style="text-align: center;">${totalAttendedKids}</td>
    <td style="text-align: center;">${totalRegularGroup}</td>
    <td style="text-align: right;">เธฟ${sumFull.toLocaleString()}</td>
    <td style="text-align: right; color:#466352;">เธฟ${sumPaid.toLocaleString()}</td>
    <td style="text-align: right; color:#ef4444;">เธฟ${sumOutstanding.toLocaleString()}</td>
    <td>-</td>
  `;
}

// ----------------------------------------------------
// 2. Student Registrations & Dropdown Loaders
// ----------------------------------------------------
function loadStudents() {
  setLoading(true, 'เธเธณเธฅเธฑเธเธ”เธถเธเธฃเธฒเธขเธเธทเนเธญเธเธฑเธเน€เธฃเธตเธขเธ...');
  google.script.run
    .withSuccessHandler(data => {
      setLoading(false);
      if (Array.isArray(data)) {
        state.students = data;
        renderStudentsTable();
      } else {
        showToast('เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เนเธซเธฅเธ”เธเนเธญเธกเธนเธฅเธฃเธฒเธขเธเธทเนเธญเธเธฑเธเน€เธฃเธตเธขเธเนเธ”เน: ' + (data ? data.error : 'unknown'), 'error');
      }
    })
    .withFailureHandler(err => {
      setLoading(false);
      showToast('เธ”เธถเธเธเนเธญเธกเธนเธฅเธฃเธฒเธขเธเธทเนเธญเธฅเนเธกเน€เธซเธฅเธง: ' + err.message, 'error');
    })
    .getStudentsList();
}

function renderStudentsTable() {
  const query = document.getElementById('student_search').value.toLowerCase().trim();
  const branchFilter = document.getElementById('student_branch_filter').value;
  const tbody = document.getElementById('students_tbody');
  tbody.innerHTML = '';
  
  const filtered = state.students.filter(s => {
    const matchQuery = s.name.toLowerCase().includes(query) || 
                       s.nickname.toLowerCase().includes(query) || 
                       s.contact.toLowerCase().includes(query) ||
                       s.lineName.toLowerCase().includes(query);
                       
    const matchBranch = !branchFilter || s.branchLearn.includes(branchFilter);
    return matchQuery && matchBranch;
  });
  
  filtered.forEach(s => {
    const tr = document.createElement('tr');
    const statusBadge = s.outstanding <= 0 ? 
      '<span class="badge badge-success">เธเธณเธฃเธฐเธเธฃเธเนเธฅเนเธง</span>' : 
      `<span class="badge badge-danger">เธเนเธฒเธ เธฟ${s.outstanding.toLocaleString()}</span>`;
      
    tr.innerHTML = `
      <td>
        <div style="font-weight: 600; color: var(--color-primary-hover); cursor: pointer;" onclick="showStudentHistoryModal('${s.name}', '${s.nickname}')">๐‘ค ${s.name}</div>
        <div style="font-size: 0.8rem; color: var(--text-muted);">${s.classType} ${s.grade || ''} | Line: ${s.lineName || '-'}</div>
      </td>
      <td>${s.nickname}</td>
      <td>${s.school || '-'} ${s.classSection ? `(${s.classSection})` : ''}</td>
      <td>
        <div style="font-size: 0.85rem;">${formatPhone(s.contact) || '-'}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">${s.branchLearn || '-'}</div>
      </td>
      <td>
        <div style="font-weight: 600;">เธฟ${s.full.toLocaleString()}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">เธเธฑเนเธงเนเธกเธ: ${s.classHours || '0'} (เน€เธซเธฅเธทเธญ: ${s.classHoursLeft || '0'})</div>
      </td>
      <td>${statusBadge}</td>
      <td>${formatDateTimeToThaiLong(s.paymentDate) || '-'}</td>
      <td>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-secondary btn-icon" onclick="showEditStudentModal('${s.id}')" title="เนเธเนเนเธ">โ๏ธ</button>
          <button class="btn btn-danger btn-icon" onclick="deleteStudent('${s.id}')" title="เธฅเธ">๐—‘๏ธ</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
  
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 40px;">เนเธกเนเธเธเธฃเธฒเธขเธเธทเนเธญเธเธฑเธเน€เธฃเธตเธขเธ</td></tr>`;
  }
}

// Helper: Check if classType represents a main group course (either legacy name or selected grade option)
function isMainGroup(classType) {
  if (!classType) return false;
  return classType.includes('เธเธฅเธธเนเธกเธซเธฅเธฑเธ') || ['เธญเธเธธเธเธฒเธฅ','เธ.1','เธ.2','เธ.3','เธ.4','เธ.5','เธ.6','เธก.1','เธก.2','เธก.3','เธก.4','เธก.5','เธก.6'].includes(classType);
}

// Helper: Update combined round string from round components
function updateCombinedRound() {
  const classType = document.getElementById('student_class_type').value;
  let finalRound = '';
  if (isMainGroup(classType)) {
    const base = document.getElementById('round_select').value;
    const year = document.getElementById('round_year').value.trim();
    finalRound = base + year;
    if (document.getElementById('student_round')) document.getElementById('student_round').value= finalRound;
  } else {
    finalRound = document.getElementById('student_round_text').value.trim();
    if (document.getElementById('student_round')) document.getElementById('student_round').value= finalRound;
    
    // Recalculate price dynamically when typing
    const grade = document.getElementById('student_grade').value;
    if (classType === 'เน€เธ”เธตเนเธขเธง') {
      const isEx = finalRound.toLowerCase().indexOf('ex') !== -1;
      let price = 2000;
      if (['เธก.4', 'เธก.5', 'เธก.6'].includes(grade) || isEx) {
        price = 2500;
      }
      if (document.getElementById('student_full')) document.getElementById('student_full').value= price;
      if (document.getElementById('calculated_fee_display')) document.getElementById('calculated_fee_display').innerText= price.toLocaleString();
      if (!state.selectedStudent) {
        if (document.getElementById('student_paid')) document.getElementById('student_paid').value= price;
      }
    }
  }
}

// Recalculate fees for Main Group classes with 3rd (30%) and 4th+ (50%) discounts
function calculateMainGroupFee() {
  const classType = document.getElementById('student_class_type').value;
  if (!isMainGroup(classType)) return;
  
  const selectedCheckboxes = document.querySelectorAll('.course-checkbox:checked');
  const fullCourses = [];
  let partialTotal = 0;
  
  selectedCheckboxes.forEach(cb => {
    const price = parseFloat(cb.getAttribute('data-price')) || 0;
    const totalSessions = parseInt(cb.getAttribute('data-total-sessions')) || 10;
    
    // Find the sessions input next to this checkbox
    const row = cb.closest('.course-item-row');
    let userSessions = totalSessions;
    if (row) {
      const input = row.querySelector('.course-sessions-input');
      if (input) {
        userSessions = parseInt(input.value) || totalSessions;
      }
    }
    
    if (userSessions < totalSessions) {
      // Partial course: prorated price, no ranking discount
      partialTotal += price * (userSessions / totalSessions);
    } else {
      // Full course: eligible for multi-course discount
      fullCourses.push(price);
    }
  });
  
  // Sort full courses descending by price to apply discounts correctly
  fullCourses.sort((a, b) => b - a);
  let fullTotal = 0;
  fullCourses.forEach((price, idx) => {
    if (idx === 0 || idx === 1) {
      fullTotal += price;
    } else if (idx === 2) {
      fullTotal += price * 0.7;
    } else {
      fullTotal += price * 0.5;
    }
  });
  
  let total = partialTotal + fullTotal;
  
  // Check if "เธฃเธนเธ”เธเธฑเธ•เธฃ" payment mode is checked
  const payModeCard = document.getElementById('pay_mode_card');
  if (payModeCard && payModeCard.checked) {
    total *= 1.03;
  }
  
  const roundedTotal = Math.round(total);
  if (document.getElementById('calculated_fee_display')) document.getElementById('calculated_fee_display').innerText= roundedTotal.toLocaleString();
  if (document.getElementById('student_full')) document.getElementById('student_full').value= roundedTotal;
  if (!state.selectedStudent) {
    if (document.getElementById('student_paid')) document.getElementById('student_paid').value= roundedTotal;
  }
}

// Dynamic course checkboxes loader when grade or branch changes for main group
function handleGradeBranchChange() {
  const classTypeSelect = document.getElementById('student_class_type');
  const classType = classTypeSelect.value;
  
  let grade = document.getElementById('student_grade').value;
  if (classType === 'เธเธฅเธธเนเธกเธซเธฅเธฑเธ') {
    grade = document.getElementById('student_course_grade').value;
    if (document.getElementById('student_grade')) document.getElementById('student_grade').value= grade; // Sync back to personal grade
  }
  
  if (classType !== 'เธเธฅเธธเนเธกเธซเธฅเธฑเธ') {
    if (classType === 'เน€เธ”เธตเนเธขเธง') {
      const courseName = document.getElementById('student_round_text').value.toLowerCase().trim();
      const isEx = courseName.endsWith('ex') || courseName.includes('ex');
      let price = 2000;
      if (['เธก.4', 'เธก.5', 'เธก.6'].includes(grade) || isEx) {
        price = 2500;
      }
      if (document.getElementById('student_full')) document.getElementById('student_full').value= price;
      if (document.getElementById('calculated_fee_display')) document.getElementById('calculated_fee_display').innerText= price.toLocaleString();
      if (!state.selectedStudent) {
        if (document.getElementById('student_paid')) document.getElementById('student_paid').value= price;
      }
    }
    return;
  }
  
  const branch = document.getElementById('student_branch_learn').value;
  
  const container = document.getElementById('course_checkboxes_container');
  container.innerHTML = '<span style="color:var(--text-muted); font-size:0.85rem;">เธเธณเธฅเธฑเธเธเนเธเธซเธฒเธงเธดเธเธฒเน€เธฃเธตเธขเธ...</span>';
  
  google.script.run
    .withSuccessHandler(courses => {
      if (Array.isArray(courses) && courses.length > 0) {
        let html = '';
        courses.forEach(c => {
          html += `
            <div class="course-item-row" style="display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 6px; background: #fff; border-radius: 6px; border: 1px solid rgba(74, 93, 85, 0.2);">
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; flex: 1; margin: 0;">
                <input type="checkbox" class="course-checkbox" value="${c.courseName}" data-price="${c.price}" data-total-sessions="${c.totalSessions || 10}" onchange="calculateMainGroupFee(); toggleSessionInput(this)">
                <span style="font-size: 0.85rem; font-weight: 500; color: var(--text-main);">${c.courseName} ${c.dayTime ? '(' + c.dayTime + ')' : ''} (เธฟ${c.price})</span>
              </label>
              <div class="session-input-wrapper" style="display: flex; align-items: center; gap: 4px;">
                <input type="number" class="course-sessions-input" style="width: 50px; padding: 2px 4px; font-size: 0.8rem; border: 1px solid var(--border-color); border-radius: 4px; text-align: center;" 
                       min="1" max="100" value="${c.totalSessions || 10}" data-total="${c.totalSessions || 10}" 
                       disabled oninput="calculateMainGroupFee()" onchange="calculateMainGroupFee()">
                <span style="font-size: 0.75rem; color: var(--text-muted);">เธเธฃเธฑเนเธ</span>
              </div>
            </div>
          `;
        });
        container.innerHTML = html;
        
        if (state.selectedStudent) {
          loadStudentRegisteredCourses(state.selectedStudent.name, grade, branch);
        } else {
          calculateMainGroupFee();
        }
      } else {
        container.innerHTML = '<span style="color:var(--text-muted); font-size:0.85rem;">เนเธกเนเธเธเธฃเธฒเธขเธงเธดเธเธฒเน€เธฃเธตเธขเธเนเธเธชเน€เธเธฃเธ”เธเธตเธ•เธเธฑเนเธเธเธตเน</span>';
        if (document.getElementById('calculated_fee_display')) document.getElementById('calculated_fee_display').innerText= '0';
        if (document.getElementById('student_full')) document.getElementById('student_full').value= '0';
      }
    })
    .getGradeCourses(grade, branch);
}

function toggleSessionInput(cb) {
  const row = cb.closest('.course-item-row');
  if (!row) return;
  const input = row.querySelector('.course-sessions-input');
  if (input) {
    input.disabled = !cb.checked;
    if (!cb.checked) {
      input.value = input.getAttribute('data-total');
    }
  }
}

// Asynchronously load the student's checked courses from the grade sheet row
function loadStudentRegisteredCourses(studentName, grade, branch) {
  google.script.run
    .withSuccessHandler(res => {
      if (res && res.success && Array.isArray(res.students)) {
        const stdRow = res.students.find(s => s.name === studentName);
        
        // Restore payment mode radio buttons
        if (stdRow) {
          if (stdRow.isCard === 1) {
            if (document.getElementById('pay_mode_card')) document.getElementById('pay_mode_card').checked= true;
          } else if (state.selectedStudent && (state.selectedStudent.paymentChannel === 'เน€เธเธดเธเธชเธ”' || state.selectedStudent.paymentChannel === 'เธชเธ”')) {
            if (document.getElementById('pay_mode_cash')) document.getElementById('pay_mode_cash').checked= true;
          } else {
            if (document.getElementById('pay_mode_transfer')) document.getElementById('pay_mode_transfer').checked= true;
          }
        }
        
        if (stdRow && stdRow.courseValues) {
          document.querySelectorAll('.course-checkbox').forEach(cb => {
            cb.checked = false;
            toggleSessionInput(cb);
          });
          for (const colIndex in stdRow.courseValues) {
            const val = stdRow.courseValues[colIndex];
            if (val !== '' && val !== null && val !== undefined) {
              const course = res.courses.find(c => c.colIndex == colIndex);
              if (course) {
                const cb = document.querySelector(`.course-checkbox[value="${course.courseName}"]`);
                if (cb) {
                  cb.checked = true;
                  toggleSessionInput(cb);
                  
                  // Find sessions input next to checkbox
                  const row = cb.closest('.course-item-row');
                  if (row) {
                    const input = row.querySelector('.course-sessions-input');
                    if (input) {
                      const num = parseFloat(val);
                      if (num === 30 || num === 50) {
                        input.value = course.totalSessions;
                      } else {
                        input.value = num;
                      }
                    }
                  }
                }
              }
            }
          }
          calculateMainGroupFee();
        }
      }
    })
    .getGradeSheetData(grade, branch);
}

// Triggered when Class Type changes: set layout or autofill prices & hours
function handleClassTypeChange() {
  const classType = document.getElementById('student_class_type').value;
  const grade = document.getElementById('student_grade').value;
  
  if (classType === 'เธเธฅเธธเนเธกเธซเธฅเธฑเธ') {
    document.getElementById('course_grade_group').style.display = 'block';
    document.getElementById('subgroup_size_group').style.display = 'none';
    
    document.getElementById('course_text_container').style.display = 'none';
    document.getElementById('course_group_container').style.display = 'flex';
    document.getElementById('course_checkboxes_wrapper').style.display = 'grid';
    
    handleGradeBranchChange();
  } else {
    document.getElementById('course_text_container').style.display = 'block';
    document.getElementById('course_group_container').style.display = 'none';
    document.getElementById('course_checkboxes_wrapper').style.display = 'none';
    
    let price = 2000;
    let hours = '08:00';
    
    if (classType === 'เน€เธ”เธตเนเธขเธง') {
      document.getElementById('course_grade_group').style.display = 'none';
      document.getElementById('subgroup_size_group').style.display = 'none';
      
      const courseName = document.getElementById('student_round_text').value.toLowerCase().trim();
      const isEx = courseName.endsWith('ex') || courseName.includes('ex');
      if (['เธก.4', 'เธก.5', 'เธก.6'].includes(grade) || isEx) {
        price = 2500;
      } else {
        price = 2000;
      }
      hours = '08:00';
    } else if (classType === 'เธเธฅเธธเนเธกเธขเนเธญเธข') {
      document.getElementById('course_grade_group').style.display = 'none';
      document.getElementById('subgroup_size_group').style.display = 'block';
      
      const subSize = document.getElementById('student_subgroup_size').value;
      if (subSize.includes('2-3')) {
        price = 3000;
        hours = '16:00';
      } else if (subSize.includes('4-5')) {
        price = 2500;
        hours = '16:00';
      } else if (subSize.includes('6-10')) {
        price = 2000;
        hours = '16:00';
      }
    }
    
    if (document.getElementById('student_full')) document.getElementById('student_full').value= price;
    if (document.getElementById('student_hours')) document.getElementById('student_hours').value= hours;
    if (document.getElementById('student_hours_left')) document.getElementById('student_hours_left').value= hours;
    if (document.getElementById('calculated_fee_display')) document.getElementById('calculated_fee_display').innerText= price.toLocaleString();
    
    if (!state.selectedStudent) {
      if (document.getElementById('student_paid')) document.getElementById('student_paid').value= price;
    }
    
    updateCombinedRound();
  }
}

function showAddStudentModal() {
  state.selectedStudent = null;
  if (document.getElementById('student_modal_title')) document.getElementById('student_modal_title').innerText= 'เธฅเธเธ—เธฐเน€เธเธตเธขเธเน€เธฃเธตเธขเธ (เนเธเธเธฅเธฐเน€เธญเธตเธขเธ”)';
  document.getElementById('student_form').reset();
  if (document.getElementById('pay_mode_transfer')) document.getElementById('pay_mode_transfer').checked= true;
  
  if (document.getElementById('student_pay_date')) document.getElementById('student_pay_date').value= getTodayString();
  if (document.getElementById('student_id')) document.getElementById('student_id').value= '';
  if (document.getElementById('student_carried_forward')) document.getElementById('student_carried_forward').value= '0';
  
  // Set default classType to เธเธฅเธธเนเธกเธซเธฅเธฑเธ
  if (document.getElementById('student_class_type')) document.getElementById('student_class_type').value= 'เธเธฅเธธเนเธกเธซเธฅเธฑเธ';
  if (document.getElementById('student_course_grade')) document.getElementById('student_course_grade').value= 'เธ.1';
  if (document.getElementById('round_select')) document.getElementById('round_select').value= 'MIDTERM 1';
  if (document.getElementById('round_year')) document.getElementById('round_year').value= '/2569';
  
  handleClassTypeChange();
  
  document.getElementById('student_modal').classList.add('active');
}

function showEditStudentModal(id) {
  const student = state.students.find(s => s.id === id);
  if (!student) return;
  
  state.selectedStudent = student;
  if (document.getElementById('student_modal_title')) document.getElementById('student_modal_title').innerText= 'เนเธเนเนเธเธเธฒเธฃเธฅเธเธ—เธฐเน€เธเธตเธขเธเน€เธฃเธตเธขเธ';
  document.getElementById('student_form').reset();
  
  if (document.getElementById('student_id')) document.getElementById('student_id').value= student.id;
  if (document.getElementById('student_name')) document.getElementById('student_name').value= student.name;
  if (document.getElementById('student_nickname')) document.getElementById('student_nickname').value= student.nickname;
  if (document.getElementById('student_school')) document.getElementById('student_school').value= student.school;
  if (document.getElementById('student_contact')) document.getElementById('student_contact').value= formatPhone(student.contact);
  if (document.getElementById('student_branch_learn')) document.getElementById('student_branch_learn').value= student.branchLearn;
  if (document.getElementById('student_branch_pay')) document.getElementById('student_branch_pay').value= student.branchPay;
  if (document.getElementById('student_full')) document.getElementById('student_full').value= student.full;
  if (document.getElementById('student_paid')) document.getElementById('student_paid').value= student.paid;
  if (document.getElementById('student_pay_date')) document.getElementById('student_pay_date').value= convertDateFromSheet(student.paymentDate) || getTodayString();
  if (document.getElementById('student_pay_channel')) document.getElementById('student_pay_channel').value= student.paymentChannel;
  if (document.getElementById('student_staff')) document.getElementById('student_staff').value= student.staff;
  if (document.getElementById('student_time_note')) document.getElementById('student_time_note').value= student.paymentTimeNote;
  if (document.getElementById('student_extra_note')) document.getElementById('student_extra_note').value= student.extraNote;
  
  // Restore payment mode radio buttons
  if (student.paymentChannel === 'เน€เธเธดเธเธชเธ”' || student.paymentChannel === 'เธชเธ”') {
    if (document.getElementById('pay_mode_cash')) document.getElementById('pay_mode_cash').checked= true;
  } else {
    if (document.getElementById('pay_mode_transfer')) document.getElementById('pay_mode_transfer').checked= true;
  }
  
  // Advanced fields
  if (document.getElementById('student_grade')) document.getElementById('student_grade').value= student.grade;
  if (document.getElementById('student_class_section')) document.getElementById('student_class_section').value= student.classSection;
  if (document.getElementById('student_line_name')) document.getElementById('student_line_name').value= student.lineName;
  if (document.getElementById('student_line_id')) document.getElementById('student_line_id').value= student.lineId;
  if (document.getElementById('student_carried_forward')) document.getElementById('student_carried_forward').value= student.carriedForwardFee;
  if (document.getElementById('student_hours')) document.getElementById('student_hours').value= student.classHours;
  if (document.getElementById('student_hours_left')) document.getElementById('student_hours_left').value= student.classHoursLeft;
  
  // Map legacy classType values to UI classType dropdown
  let uiClassType = 'เธเธฅเธธเนเธกเธซเธฅเธฑเธ';
  const dbClassType = student.classType || '';
  const grade = student.grade || 'เธ.1';
  
  if (dbClassType.includes('เน€เธ”เธตเนเธขเธง')) {
    uiClassType = 'เน€เธ”เธตเนเธขเธง';
    if (document.getElementById('student_class_type')) document.getElementById('student_class_type').value= 'เน€เธ”เธตเนเธขเธง';
  } else if (dbClassType.includes('เธขเนเธญเธข') || dbClassType.includes('เธเธฅเธธเนเธกเธขเนเธญเธข')) {
    uiClassType = 'เธเธฅเธธเนเธกเธขเนเธญเธข';
    if (document.getElementById('student_class_type')) document.getElementById('student_class_type').value= 'เธเธฅเธธเนเธกเธขเนเธญเธข';
    
    let subSize = 'เธเธฅเธธเนเธกเธขเนเธญเธข 2-3 เธเธ';
    if (dbClassType.includes('4-5')) subSize = 'เธเธฅเธธเนเธกเธขเนเธญเธข 4-5 เธเธ';
    else if (dbClassType.includes('6-10')) subSize = 'เธเธฅเธธเนเธกเธขเนเธญเธข 6-10 เธเธ';
    if (document.getElementById('student_subgroup_size')) document.getElementById('student_subgroup_size').value= subSize;
  } else {
    uiClassType = 'เธเธฅเธธเนเธกเธซเธฅเธฑเธ';
    if (document.getElementById('student_class_type')) document.getElementById('student_class_type').value= 'เธเธฅเธธเนเธกเธซเธฅเธฑเธ';
    if (document.getElementById('student_course_grade')) document.getElementById('student_course_grade').value= grade;
  }
  
  // Set UI course/round fields
  if (uiClassType === 'เธเธฅเธธเนเธกเธซเธฅเธฑเธ') {
    let baseRound = 'MIDTERM 1';
    let yearSuffix = '/2569';
    const dbRound = student.round || '';
    const roundsList = ['MIDTERM 1', 'MIDTERM 2', 'FINAL 1', 'FINAL 2', 'เธเธดเธ”เน€เธ—เธญเธก เธ•.เธ.', 'Summer'];
    let matched = false;
    for (const r of roundsList) {
      if (dbRound.startsWith(r)) {
        baseRound = r;
        yearSuffix = dbRound.substring(r.length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      baseRound = 'MIDTERM 1';
      yearSuffix = dbRound ? ' ' + dbRound : '/2569';
    }
    if (document.getElementById('round_select')) document.getElementById('round_select').value= baseRound;
    if (document.getElementById('round_year')) document.getElementById('round_year').value= yearSuffix;
    
    document.getElementById('course_text_container').style.display = 'none';
    document.getElementById('course_group_container').style.display = 'flex';
    document.getElementById('course_checkboxes_wrapper').style.display = 'grid';
    
    handleGradeBranchChange();
  } else {
    if (document.getElementById('student_round_text')) document.getElementById('student_round_text').value= student.round || '';
    
    document.getElementById('course_text_container').style.display = 'block';
    document.getElementById('course_group_container').style.display = 'none';
    document.getElementById('course_checkboxes_wrapper').style.display = 'none';
  }
  
  if (document.getElementById('calculated_fee_display')) document.getElementById('calculated_fee_display').innerText= student.full.toLocaleString();
  if (document.getElementById('student_round')) document.getElementById('student_round').value= student.round;
  
  document.getElementById('student_modal').classList.add('active');
}

function closeStudentModal() {
  document.getElementById('student_modal').classList.remove('active');
}

function saveStudent(e) {
  e.preventDefault();
  updateCombinedRound();
  const studentId = document.getElementById('student_id').value;
  
  const studentData = {
    id: studentId,
    name: document.getElementById('student_name').value.trim(),
    nickname: document.getElementById('student_nickname').value.trim(),
    school: document.getElementById('student_school').value,
    contact: document.getElementById('student_contact').value.trim(),
    branchLearn: document.getElementById('student_branch_learn').value,
    branchPay: document.getElementById('student_branch_pay').value,
    full: parseFloat(document.getElementById('student_full').value) || 0,
    paid: parseFloat(document.getElementById('student_paid').value) || 0,
    paymentDate: convertDateToSheet(document.getElementById('student_pay_date').value),
    paymentChannel: document.getElementById('student_pay_channel').value,
    staff: document.getElementById('student_staff').value.trim(),
    round: document.getElementById('student_round').value,
    paymentTimeNote: document.getElementById('student_time_note').value.trim(),
    extraNote: document.getElementById('student_extra_note').value.trim(),
    
    // Advanced fields
    grade: document.getElementById('student_grade').value,
    classSection: document.getElementById('student_class_section').value.trim(),
    lineName: document.getElementById('student_line_name').value.trim(),
    lineId: document.getElementById('student_line_id').value.trim(),
    carriedForwardFee: parseFloat(document.getElementById('student_carried_forward').value) || 0,
    classHours: document.getElementById('student_hours').value.trim(),
    classHoursLeft: document.getElementById('student_hours_left').value.trim(),
    classType: (function() {
      const type = document.getElementById('student_class_type').value;
      if (type === 'เธเธฅเธธเนเธกเธขเนเธญเธข') return document.getElementById('student_subgroup_size').value;
      return type;
    })(),
    isCard: document.getElementById('pay_mode_card').checked,
    selectedCourses: Array.from(document.querySelectorAll('.course-checkbox:checked')).map(cb => {
      const row = cb.closest('.course-item-row');
      const input = row ? row.querySelector('.course-sessions-input') : null;
      const totalSessions = parseInt(cb.getAttribute('data-total-sessions')) || 10;
      const sessions = input ? (parseInt(input.value) || totalSessions) : totalSessions;
      return {
        courseName: cb.value,
        sessions: sessions
      };
    })
  };
  
  setLoading(true, 'เธเธณเธฅเธฑเธเธฅเธเธเนเธญเธกเธนเธฅเธฅเธเธ—เธฐเน€เธเธตเธขเธเน€เธฃเธตเธขเธเธเธฃเนเธญเธกเธฃเธฐเธเธเธเธฑเธเธ—เธถเธ Audit Log...');
  const user = getLogUser();
  
  if (studentId) {
    google.script.run
      .withSuccessHandler(res => {
        setLoading(false);
        if (res && res.success) {
          showToast('เนเธเนเนเธเธเนเธญเธกเธนเธฅเนเธฅเธฐเน€เธเธทเนเธญเธกเนเธขเธเธเธตเธ—เนเธขเธเธเธฑเนเธเน€เธฃเธตเธขเธเน€เธชเธฃเนเธเธชเธดเนเธ!', 'success');
          closeStudentModal();
          loadStudents();
        } else {
          showToast('เธเธฑเธเธ—เธถเธเธเธดเธ”เธเธฅเธฒเธ”: ' + res.error, 'error');
        }
      })
      .withFailureHandler(err => {
        setLoading(false);
        showToast('เธเธฒเธฃเน€เธเธทเนเธญเธกเธ•เนเธญเธเธดเธ”เธเธฅเธฒเธ”: ' + err.message, 'error');
      })
      .updateStudentRegistration(studentData, user);
  } else {
    google.script.run
      .withSuccessHandler(res => {
        setLoading(false);
        if (res && res.success) {
          showToast('เธฅเธเธ—เธฐเน€เธเธตเธขเธเนเธฅเธฐเธชเนเธเธเนเธญเธกเธนเธฅเน€เธเธทเนเธญเธกเธฃเธฐเธเธเธเธตเธ•เธงเธดเธเธฒเธเธฅเธธเนเธกเธซเธฅเธฑเธเธชเธณเน€เธฃเนเธ!', 'success');
          closeStudentModal();
          loadStudents();
        } else {
          showToast('เธฅเธเธ—เธฐเน€เธเธตเธขเธเน€เธฃเธตเธขเธเธเธดเธ”เธเธฅเธฒเธ”: ' + res.error, 'error');
        }
      })
      .withFailureHandler(err => {
        setLoading(false);
        showToast('เธเธฒเธฃเน€เธเธทเนเธญเธกเธ•เนเธญเธเธดเธ”เธเธฅเธฒเธ”: ' + err.message, 'error');
      })
      .addStudentRegistration(studentData, user);
  }
}

function deleteStudent(id) {
  if (confirm('เธขเธทเธเธขเธฑเธเธฅเธเธเธฒเธฃเธฅเธเธ—เธฐเน€เธเธตเธขเธเธเธตเน? เธเนเธญเธกเธนเธฅเนเธเธเธตเธ•เธฃเธฐเธ”เธฑเธเธเธฑเนเธเธเธฐเนเธกเนเธ–เธนเธเธฅเธเน€เธเธทเนเธญเธเนเธญเธเธเธฑเธเธเธฃเธฐเธงเธฑเธ•เธดเธชเธนเธเธซเธฒเธข เนเธ•เนเธเนเธญเธกเธนเธฅเธเธฒเธฃเธเธณเธฃเธฐเน€เธเธดเธเนเธ StatusDB เธเธฐเธฅเธเธ–เธฒเธงเธฃ')) {
    setLoading(true, 'เธเธณเธฅเธฑเธเธ”เธณเน€เธเธดเธเธเธฒเธฃเธฅเธเธเนเธญเธกเธนเธฅ...');
    const user = state.currentUser ? state.currentUser.username : 'Unknown';
    google.script.run
      .withSuccessHandler(res => {
        setLoading(false);
        if (res && res.success) {
          showToast('เธฅเธเธฃเธฒเธขเธเธฒเธฃเธชเธณเน€เธฃเนเธเนเธฅเนเธง', 'success');
          loadStudents();
        } else {
          showToast('เธเธฒเธฃเธฅเธเธฅเนเธกเน€เธซเธฅเธง: ' + res.error, 'error');
        }
      })
      .withFailureHandler(err => {
        setLoading(false);
        showToast('เธเธฒเธฃเน€เธเธทเนเธญเธกเธ•เนเธญเธฅเนเธกเน€เธซเธฅเธง: ' + err.message, 'error');
      })
      .deleteStudentRegistration(id, user);
  }
}

// ----------------------------------------------------
// 3. Grade Sheet Editor Grid Logic (เธเธฑเธ”เธเธฒเธฃเธเธญเธฃเนเธชเน€เธฃเธตเธขเธเนเธขเธเธซเนเธญเธ)
// ----------------------------------------------------
function getCourseRound(courseName) {
  if (!courseName) return 'None';
  const match = courseName.match(/(MIDTERM\s*1|MIDTERM\s*2|FINAL\s*1|FINAL\s*2|เธเธดเธ”เน€เธ—เธญเธก\s*เธ•\.เธ\.|Summer)(?:\/\d+)?/i);
  return match ? match[0] : 'None';
}

function updateRoundFilterDropdown() {
  const filterSelect = document.getElementById('grade_sheet_round_filter');
  if (!filterSelect) return;
  
  const curVal = filterSelect.value;
  filterSelect.innerHTML = '';
  
  // 1. Add ALL option
  const optAll = document.createElement('option');
  optAll.value = 'ALL';
  optAll.innerText = '-- เนเธชเธ”เธเธ—เธฑเนเธเธซเธกเธ” --';
  filterSelect.appendChild(optAll);
  
  // 2. Add static base round options
  const staticRounds = ['MIDTERM 1', 'MIDTERM 2', 'FINAL 1', 'FINAL 2', 'เธเธดเธ”เน€เธ—เธญเธก เธ•.เธ.', 'Summer'];
  staticRounds.forEach(r => {
    const opt = document.createElement('option');
    opt.value = r;
    opt.innerText = r;
    filterSelect.appendChild(opt);
  });
  
  // 3. Find unique year-specific rounds actually present in the sheet
  const courses = state.gradeSheetData.courses;
  const yearSpecificRounds = new Set();
  courses.forEach(c => {
    const round = getCourseRound(c.courseName);
    if (round && round !== 'None' && round.includes('/')) {
      yearSpecificRounds.add(round);
    }
  });
  
  // Add year-specific rounds
  yearSpecificRounds.forEach(r => {
    const opt = document.createElement('option');
    opt.value = r;
    opt.innerText = r;
    filterSelect.appendChild(opt);
  });
  
  // 4. Add unspecified option if there are courses with no round
  let hasNone = false;
  courses.forEach(c => {
    if (getCourseRound(c.courseName) === 'None') {
      hasNone = true;
    }
  });
  
  if (hasNone) {
    const optNone = document.createElement('option');
    optNone.value = 'เนเธกเนเธฃเธฐเธเธธเธฃเธญเธเน€เธฃเธตเธขเธ';
    optNone.innerText = 'เนเธกเนเธฃเธฐเธเธธเธฃเธญเธเน€เธฃเธตเธขเธ';
    filterSelect.appendChild(optNone);
  }
  
  // Restore previously selected filter value if still valid
  const allAvailableValues = ['ALL', ...staticRounds, ...yearSpecificRounds, 'เนเธกเนเธฃเธฐเธเธธเธฃเธญเธเน€เธฃเธตเธขเธ'];
  if (allAvailableValues.includes(curVal)) {
    filterSelect.value = curVal;
    state.gradeSheetFilterRound = curVal;
  } else {
    filterSelect.value = 'ALL';
    state.gradeSheetFilterRound = 'ALL';
  }
}

function filterGradeSheetGrid() {
  const filterSelect = document.getElementById('grade_sheet_round_filter');
  if (filterSelect) {
    state.gradeSheetFilterRound = filterSelect.value;
    renderGradeSheetTable();
  }
}

function loadGradeSheetGrid() {
  const grade = document.getElementById('grade_sheet_grade_select').value;
  const branch = document.getElementById('grade_sheet_branch_select').value;
  
  setLoading(true, 'เธเธณเธฅเธฑเธเนเธซเธฅเธ”เธชเน€เธเธฃเธ”เธเธตเธ•เธเธฑเธ”เธซเนเธญเธเน€เธฃเธตเธขเธ ' + grade + ' เธเธญเธ ' + branch + '...');
  google.script.run
    .withSuccessHandler(res => {
      setLoading(false);
      if (res && res.success) {
        state.gradeSheetData = res;
        updateRoundFilterDropdown();
        renderGradeSheetTable();
      } else {
        showToast('เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เนเธซเธฅเธ”เธงเธดเธเธฒเนเธฅเธฐเนเธเธฃเธเธชเธฃเนเธฒเธเธเธญเธฃเนเธชเธเธญเธเธซเนเธญเธเธเธตเนเนเธ”เน: ' + (res ? res.error : 'unknown'), 'error');
      }
    })
    .withFailureHandler(err => {
      setLoading(false);
      showToast('เธเธฒเธฃเน€เธเธทเนเธญเธกเธ•เนเธญเธเธญเธเธชเธ–เธฒเธเธ—เธตเนเธฅเนเธกเน€เธซเธฅเธง: ' + err.message, 'error');
    })
    .getGradeSheetData(grade, branch);
}

function renderGradeSheetTable() {
  const table = document.getElementById('grade_sheet_grid_table');
  table.innerHTML = '';
  
  const courses = state.gradeSheetData.courses || [];
  const students = state.gradeSheetData.students || [];
  
  const filterRound = state.gradeSheetFilterRound || 'ALL';
  const selectedBranch = document.getElementById('grade_sheet_branch_select').value;
  
  const displayedCourses = courses.filter(c => {
    if (filterRound === 'ALL') {
      return c.branch === selectedBranch;
    } else {
      if (filterRound === 'เนเธกเนเธฃเธฐเธเธธเธฃเธญเธเน€เธฃเธตเธขเธ') {
        return getCourseRound(c.courseName) === 'None';
      }
      return c.courseName.toUpperCase().includes(filterRound.toUpperCase());
    }
  });

  const displayedStudents = students.filter(s => {
    if (filterRound === 'ALL') {
      return s.branch === selectedBranch;
    } else {
      return true; // show all students across all branches when round filter is active
    }
  });
  
  state.displayedCourses = displayedCourses;
  state.displayedStudents = displayedStudents;
  
  if (displayedCourses.length === 0 && displayedStudents.length === 0) {
    table.innerHTML = `<tr><td style="padding: 40px; text-align: center; color: var(--text-muted);">เนเธกเนเธเธเธเธฃเธฐเธงเธฑเธ•เธดเธเธญเธฃเนเธชเนเธฅเธฐเน€เธ”เนเธเธเธญเธเธซเนเธญเธเธเธตเน เธเธฃเธธเธ“เธฒเน€เธเธดเนเธกเธเธญเธฃเนเธชเธงเธดเธเธฒเนเธซเธกเนเน€เธเธทเนเธญเน€เธฃเธดเนเธกเธ•เนเธ</td></tr>`;
    document.getElementById('save_grade_sheet_btn').disabled = true;
    return;
  }
  
  // Build Header Row 1 (Course Names) & Row 2 (Prices) & Row 3 (Day details)
  let theadHTML = `
    <tr style="background: rgba(15,23,42,0.03);">
      <th rowspan="2" style="min-width: 180px; vertical-align: middle;">เธเธทเนเธญ-เธเธฒเธกเธชเธเธธเธฅเธเธฑเธเน€เธฃเธตเธขเธ</th>
      <th rowspan="2" style="min-width: 80px; vertical-align: middle;">เธเธทเนเธญเน€เธฅเนเธ</th>
      <th rowspan="2" style="min-width: 80px; vertical-align: middle;">เธชเนเธงเธเธฅเธ”</th>
      <th rowspan="2" style="min-width: 80px; vertical-align: middle;">เธเนเธฒเธขเธกเธฒ</th>
      <th rowspan="2" style="min-width: 60px; vertical-align: middle; text-align:center;">เธฃเธนเธ”เธเธฑเธ•เธฃ</th>
      <th rowspan="2" style="min-width: 90px; vertical-align: middle; text-align:right;">เธขเธญเธ”เธฃเธงเธก</th>
      <th rowspan="2" style="min-width: 90px; vertical-align: middle; text-align:right;">เธเธเน€เธซเธฅเธทเธญ</th>
  `;
  
  displayedCourses.forEach(c => {
    // Calculate registered students for this column from displayedStudents
    const registeredCount = displayedStudents.filter(s => {
      if (s.sheetName === c.sheetName) {
        const val = s.courseValues[c.colIndex];
        return val !== undefined && val !== null && val !== '' && parseFloat(val) > 0;
      }
      return false;
    }).length;

    theadHTML += `
      <th style="text-align: center; min-width: 110px;">
        <div style="display:flex; align-items:center; justify-content:center; gap:4px; margin-bottom:4px;">
          <input type="text" value="${c.courseName}" class="form-input grid-header-input" style="width:110px; display:inline-block; font-weight:600; font-size:0.75rem; text-align:center; padding:2px;" onchange="handleCourseHeaderNameChange(${c.colIndex}, '${c.sheetName}', this)">
          <button class="btn btn-sm btn-icon" style="padding: 2px 6px; background: #fee2e2; color: #ef4444; border: 1px solid #fca5a5; border-radius: 4px; cursor: pointer;" title="เธฅเธเธงเธดเธเธฒเธเธตเน" onclick="handleDeleteCourse(${c.colIndex}, '${c.sheetName}', '${c.courseName}')">
            ๐—‘๏ธ
          </button>
        </div>
        <div style="font-size:0.75rem; color:#f59e0b; font-weight:600; margin-top:2px;">
          [${c.branch === 'เธชเธฒเธเธฒ1' ? 'เธชเธฒเธเธฒ 1' : c.branch === 'เธชเธฒเธเธฒ2' ? 'เธชเธฒเธเธฒ 2' : 'เธชเธฒเธเธฒ 3'}]
        </div>
        <div style="font-size:0.75rem; color:var(--color-primary); margin-top:2px; font-weight:600;">
          เธเธฃ. เธฅเธเธ—เธฐเน€เธเธตเธขเธ: ${registeredCount} เธเธ
        </div>
        <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">
          เธงเธฑเธ/เน€เธงเธฅเธฒ: <input type="text" value="${c.dayTime || ''}" class="form-input grid-header-input" style="width:100px; display:inline-block; padding:2px;" onchange="handleCourseHeaderDayTimeChange(${c.colIndex}, '${c.sheetName}', this)">
        </div>
        <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">
          เธฃเธฒเธเธฒ: เธฟ<input type="number" value="${c.price}" class="form-input grid-header-input" style="width:70px; display:inline-block; padding:2px;" onchange="handleCourseHeaderPriceChange(${c.colIndex}, '${c.sheetName}', this)">
        </div>
        <div style="font-size:0.7rem; color:var(--text-muted); margin-top:2px;">
          เธเธฃเธฑเนเธ: <input type="number" value="${c.totalSessions}" class="form-input grid-header-input" style="width:40px; display:inline-block; padding:2px;" onchange="handleCourseHeaderSessionsChange(${c.colIndex}, '${c.sheetName}', this)">
        </div>
      </th>
    `;
  });
  
  theadHTML += `</tr>`;
  
  table.innerHTML = `<thead>${theadHTML}</thead><tbody id="grade_grid_tbody"></tbody>`;
  
  // Render student rows
  const tbody = document.getElementById('grade_grid_tbody');
  
  displayedStudents.forEach((s, stdIdx) => {
    const tr = document.createElement('tr');
    
    const isCardChecked = s.isCard ? 'checked' : '';
    
    let rowHTML = `
      <td>
        <input type="text" value="${s.name}" class="form-input grid-cell-input" style="font-weight:600;" onchange="handleStudentFieldChange(${stdIdx}, 'name', this.value)">
        <div style="font-size:0.75rem; color:var(--color-primary); margin-top:2px; font-weight:600;">
          [${s.branch === 'เธชเธฒเธเธฒ1' ? 'เธชเธฒเธเธฒ 1' : s.branch === 'เธชเธฒเธเธฒ2' ? 'เธชเธฒเธเธฒ 2' : 'เธชเธฒเธเธฒ 3'}]
        </div>
      </td>
      <td><input type="text" value="${s.nickname}" class="form-input grid-cell-input" onchange="handleStudentFieldChange(${stdIdx}, 'nickname', this.value)"></td>
      <td><input type="number" value="${s.discount}" class="form-input grid-cell-input" style="width:70px;" onchange="handleStudentFieldChange(${stdIdx}, 'discount', parseFloat(this.value) || 0)"></td>
      <td><input type="number" value="${s.paid}" class="form-input grid-cell-input" style="width:70px;" onchange="handleStudentFieldChange(${stdIdx}, 'paid', parseFloat(this.value) || 0)"></td>
      <td style="text-align:center;"><input type="checkbox" ${isCardChecked} onchange="handleStudentFieldChange(${stdIdx}, 'isCard', this.checked ? 1 : 0)"></td>
      <td style="text-align:right; font-weight:700;" id="grid_student_full_${stdIdx}">เธฟ${s.full.toLocaleString()}</td>
      <td style="text-align:right; font-weight:700; color:${s.outstanding > 0 ? '#ef4444' : '#466352'};" id="grid_student_outstanding_${stdIdx}">เธฟ${s.outstanding.toLocaleString()}</td>
    `;
    
    displayedCourses.forEach(c => {
      if (s.sheetName === c.sheetName) {
        const val = s.courseValues[c.colIndex];
        rowHTML += `
          <td style="text-align: center;">
            <input type="number" value="${val !== undefined && val !== null ? val : ''}" class="form-input grid-cell-input" style="width:70px; text-align:center;" placeholder="เธเธฃเธฑเนเธ/เธฅเธ”%" onchange="handleGridCellValueChange(${stdIdx}, ${c.colIndex}, this.value)">
          </td>
        `;
      } else {
        rowHTML += `
          <td style="text-align: center; color: var(--text-muted); background: rgba(0,0,0,0.02); font-weight: bold;">
            -
          </td>
        `;
      }
    });
    
    tr.innerHTML = rowHTML;
    tbody.appendChild(tr);
  });
  
  document.getElementById('save_grade_sheet_btn').disabled = false;
}
function handleCourseHeaderNameChange(colIndex, sheetName, input) {
  const val = input.value.trim();
  if (!val) {
    showToast('เธเธทเนเธญเธเธญเธฃเนเธชเน€เธฃเธตเธขเธเนเธกเนเธชเธฒเธกเธฒเธฃเธ–เน€เธงเนเธเธงเนเธฒเธเนเธ”เน', 'error');
    input.value = input.defaultValue || '';
    return;
  }
  const course = state.displayedCourses.find(c => c.colIndex === colIndex && c.sheetName === sheetName);
  if (course) {
    course.courseName = val;
  }
}

function handleDeleteCourse(colIndex, sheetName, courseName) {
  const grade = document.getElementById('grade_sheet_grade_select').value;
  const branch = document.getElementById('grade_sheet_branch_select').value;
  
  if (confirm(`โ ๏ธ เธขเธทเธเธขเธฑเธเธเธฒเธฃเธฅเธเธงเธดเธเธฒ "${courseName}"?\n\nเธเธฒเธฃเธฅเธเธเธญเธฅเธฑเธกเธเนเธงเธดเธเธฒเธเธตเนเธเธฐเธ—เธณเนเธซเนเธเนเธญเธกเธนเธฅเธเธฃเธฑเนเธเน€เธฃเธตเธขเธเนเธฅเธฐเธขเธญเธ”เธเธณเธฃเธฐเน€เธเธดเธเธเธญเธเน€เธ”เนเธเธ—เธตเนเธเธฑเธเธ—เธถเธเนเธงเนเนเธเธงเธดเธเธฒเธเธตเนเธซเธฒเธขเนเธ เนเธฅเธฐเนเธกเนเธชเธฒเธกเธฒเธฃเธ–เน€เธฃเธตเธขเธเธเธทเธเนเธ”เน!`)) {
    setLoading(true, 'เธเธณเธฅเธฑเธเธฅเธเธเธญเธฅเธฑเธกเธเนเธงเธดเธเธฒเน€เธฃเธตเธขเธเธญเธญเธเธเธฒเธเธชเน€เธเธฃเธ”เธเธตเธ•...');
    const user = getLogUser();
    
    google.script.run
      .withSuccessHandler(res => {
        setLoading(false);
        if (res && res.success) {
          showToast(`เธฅเธเธงเธดเธเธฒ "${courseName}" เน€เธฃเธตเธขเธเธฃเนเธญเธขเนเธฅเนเธง`, 'success');
          loadGradeSheetGrid(); // reload table
        } else {
          showToast('เธฅเธเนเธกเนเธชเธณเน€เธฃเนเธ: ' + res.error, 'error');
        }
      })
      .withFailureHandler(err => {
        setLoading(false);
        showToast('เธเธฒเธฃเน€เธเธทเนเธญเธกเธ•เนเธญเธฅเนเธกเน€เธซเธฅเธง: ' + err.message, 'error');
      })
      .deleteCourseColumn(grade, branch, sheetName, colIndex, courseName, user);
  }
}

function handleCourseHeaderDayTimeChange(colIndex, sheetName, input) {
  const val = input.value.trim();
  const course = state.displayedCourses.find(c => c.colIndex === colIndex && c.sheetName === sheetName);
  if (course) {
    course.dayTime = val;
  }
}

function handleCourseHeaderPriceChange(colIndex, sheetName, input) {
  const val = parseFloat(input.value) || 0;
  const course = state.displayedCourses.find(c => c.colIndex === colIndex && c.sheetName === sheetName);
  if (course) {
    course.price = val;
    recalculateGridTotals();
  }
}

function handleCourseHeaderSessionsChange(colIndex, sheetName, input) {
  const val = parseInt(input.value) || 10;
  const course = state.displayedCourses.find(c => c.colIndex === colIndex && c.sheetName === sheetName);
  if (course) {
    course.totalSessions = val;
    recalculateGridTotals();
  }
}

function handleStudentFieldChange(stdIdx, field, val) {
  const std = state.displayedStudents[stdIdx];
  if (std) {
    std[field] = val;
    recalculateGridTotals();
  }
}

function handleGridCellValueChange(stdIdx, colIndex, val) {
  const std = state.displayedStudents[stdIdx];
  if (std) {
    std.courseValues[colIndex] = val !== '' ? parseFloat(val) : '';
    recalculateGridTotals();
  }
}

function recalculateGridTotals() {
  const courses = state.displayedCourses || [];
  const students = state.displayedStudents || [];
  
  students.forEach((s, idx) => {
    let subtotal = 0;
    courses.forEach(c => {
      if (s.sheetName === c.sheetName) {
        const val = s.courseValues[c.colIndex];
        if (val !== '' && val !== undefined && !isNaN(val)) {
          const num = parseFloat(val);
          const price = parseFloat(c.price) || 0;
          const totalSessions = parseInt(c.totalSessions) || 10;
          
          if (num === 30) {
            subtotal += price * 0.7;
          } else if (num === 20) {
            subtotal += price * 0.9;
          } else if (num === 50) {
            subtotal += price * 0.5;
          } else if (num >= 1 && num <= 2) {
            subtotal += num * 350;
          } else if (num >= 3) {
            subtotal += num * (price / totalSessions);
          }
        }
      }
    });
    
    if (s.isCard) {
      subtotal *= 1.03;
    }
    
    const full = subtotal - s.discount;
    const outstanding = full - s.paid;
    
    s.full = Math.round(full * 100) / 100;
    s.outstanding = Math.round(outstanding * 100) / 100;
    
    const fullEl = document.getElementById(`grid_student_full_${idx}`);
    if (fullEl) fullEl.innerText = 'เธฟ' + s.full.toLocaleString();
    const outEl = document.getElementById(`grid_student_outstanding_${idx}`);
    if (outEl) {
      outEl.innerText = 'เธฟ' + s.outstanding.toLocaleString();
      outEl.style.color = s.outstanding > 0 ? '#ef4444' : '#466352';
    }
  });
}

function saveGradeSheetGrid() {
  const grade = document.getElementById('grade_sheet_grade_select').value;
  const branch = document.getElementById('grade_sheet_branch_select').value;
  
  setLoading(true, 'เธเธณเธฅเธฑเธเธเธฑเธเธ—เธถเธเธเนเธฒเน€เธฃเธตเธขเธ เธเธญเธฃเนเธช เนเธฅเธฐเธเธฅเธเธฒเธฃเธเธฑเธ”เธเธฑเนเธเน€เธฃเธตเธขเธเธฅเธเธเธตเธ•เธชเน€เธเธฃเธ”เธเธตเธ•...');
  const user = getLogUser();
  
  google.script.run
    .withSuccessHandler(res => {
      setLoading(false);
      if (res && res.success) {
        showToast('เธเธฑเธเธ—เธถเธเธเธฒเธฃเธเธฑเธ”เธซเนเธญเธเนเธฅเธฐเธเธณเธเธงเธ“เน€เธเธดเธเธเธญเธฃเนเธชเธเธฅเธธเนเธกเธซเธฅเธฑเธเน€เธฃเธตเธขเธเธฃเนเธญเธข!', 'success');
        loadGradeSheetGrid();
      } else {
        showToast('เธเธฒเธฃเธเธฑเธเธ—เธถเธเธเธฑเธ”เธเนเธญเธ: ' + res.error, 'error');
      }
    })
    .withFailureHandler(err => {
      setLoading(false);
      showToast('เธเธฒเธฃเน€เธเธทเนเธญเธกเธ•เนเธญเธเธดเธ”เธเธฅเธฒเธ”: ' + err.message, 'error');
    })
    .saveGradeSheetData(grade, branch, state.displayedCourses, state.displayedStudents, user);
}

function showAddCourseColumnModal() {
  const grade = document.getElementById('grade_sheet_grade_select').value;
  const branch = document.getElementById('grade_sheet_branch_select').value;
  
  document.getElementById('add_course_form').reset();
  if (document.getElementById('add_course_branch_select')) document.getElementById('add_course_branch_select').value= branch;
  if (document.getElementById('add_course_grade_select')) document.getElementById('add_course_grade_select').value= grade === 'เธญเธเธธเธเธฒเธฅ' ? 'เธ.1' : grade;
  
  // Set default BE year
  if (document.getElementById('new_course_year')) document.getElementById('new_course_year').value= new Date().getFullYear() + 543;
  
  document.getElementById('add_course_modal').classList.add('active');
}

function closeAddCourseModal() {
  document.getElementById('add_course_modal').classList.remove('active');
}

function handleAddCourseColumn(e) {
  e.preventDefault();
  const grade = document.getElementById('add_course_grade_select').value;
  const branch = document.getElementById('add_course_branch_select').value;
  let courseName = document.getElementById('new_course_name').value.trim();
  
  const round = document.getElementById('new_course_round').value;
  const year = document.getElementById('new_course_year').value.trim();
  if (round) {
    if (year) {
      courseName = `${courseName} ${round}/${year}`;
    } else {
      courseName = `${courseName} ${round}`;
    }
  }
  
  const price = parseFloat(document.getElementById('new_course_price').value) || 2500;
  const dayTime = document.getElementById('new_course_day_time').value;
  const sessions = parseInt(document.getElementById('new_course_sessions').value) || 10;
  
  setLoading(true, 'เธเธณเธฅเธฑเธเนเธ—เธฃเธเธซเธฑเธงเธเธญเธฅเธฑเธกเธเนเธเธญเธฃเนเธชเธฃเธฒเธขเธงเธดเธเธฒเนเธซเธกเนเธฅเธเธชเน€เธเธฃเธ”เธเธตเธ•...');
  const user = getLogUser();
  
  google.script.run
    .withSuccessHandler(res => {
      setLoading(false);
      if (res && res.success) {
        showToast('เน€เธเธดเนเธกเธงเธดเธเธฒเธฅเธเธชเน€เธเธฃเธ”เธเธตเธ•เธขเนเธญเธขเธชเธณเน€เธฃเนเธ!', 'success');
        closeAddCourseModal();
        
        // Reset filter round to show all so the new course is visible
        state.gradeSheetFilterRound = 'ALL';
        const filterSelect = document.getElementById('grade_sheet_round_filter');
        if (filterSelect) filterSelect.value = 'ALL';
        
        loadGradeSheetGrid(); // refresh grid
      } else {
        showToast('เน€เธเธดเนเธกเนเธกเนเธชเธณเน€เธฃเนเธ: ' + res.error, 'error');
      }
    })
    .withFailureHandler(err => {
      setLoading(false);
      showToast('เธเธฒเธฃเธ•เธดเธ”เธ•เนเธญเธเธดเธ”เธเธฅเธฒเธ”: ' + err.message, 'error');
    })
    .addNewCourseColumn(grade, branch, courseName, price, dayTime, sessions, user);
}

// ----------------------------------------------------
// 4. Private Students Editor Logic (เน€เธ”เธตเนเธขเธง / เธเธฅเธธเนเธกเธขเนเธญเธข)
// ----------------------------------------------------
function loadPrivateStudents() {
  const sheetName = document.getElementById('private_sheet_select').value;
  
  setLoading(true, 'เธเธณเธฅเธฑเธเธ”เธถเธเธชเธกเธธเธ”เธเธฃเธฐเธงเธฑเธ•เธดเน€เธ”เนเธเน€เธฃเธตเธขเธเน€เธ”เธตเนเธขเธงเธเธฅเธธเนเธกเธขเนเธญเธข ' + sheetName + '...');
  google.script.run
    .withSuccessHandler(res => {
      setLoading(false);
      if (res && res.success) {
        state.privateStudents = res.students;
        renderPrivateStudentsTable(res.sheetName);
      } else {
        showToast('เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เธ”เธถเธเธเนเธญเธกเธนเธฅเน€เธ”เนเธเน€เธฃเธตเธขเธเน€เธ”เธตเนเธขเธงเนเธ”เน: ' + (res ? res.error : 'unknown'), 'error');
      }
    })
    .withFailureHandler(err => {
      setLoading(false);
      showToast('เน€เธเธทเนเธญเธกเธ•เนเธญเธเธฒเธเธเนเธญเธกเธนเธฅเธเธตเธ•เธฅเนเธกเน€เธซเธฅเธง: ' + err.message, 'error');
    })
    .getPrivateSheetData(sheetName);
}

function renderPrivateStudentsTable(sheetName) {
  const tbody = document.getElementById('private_students_tbody');
  tbody.innerHTML = '';
  
  state.privateStudents.forEach(s => {
    const tr = document.createElement('tr');
    
    // Balance
    let balanceText = '';
    if (s.outstanding < 0) {
      balanceText = `<span style="color:#ef4444; font-weight:600;">เธเนเธฒเธ เธฟ${Math.abs(s.outstanding).toLocaleString()}</span>`;
    } else {
      balanceText = `<span style="color:#466352; font-weight:600;">เธเธเน€เธซเธฅเธทเธญ เธฟ${s.outstanding.toLocaleString()}</span>`;
    }
    
    tr.innerHTML = `
      <td>
        <div style="font-weight:600; color: var(--color-primary-hover); cursor: pointer;" onclick="showStudentHistoryModal('${s.name}', '${s.nickname}')">๐‘ค ${s.name}</div>
        <div style="font-size:0.75rem; color:var(--text-muted);">${s.branchPay} | Line: ${s.lineName || '-'}</div>
      </td>
      <td>${s.nickname}</td>
      <td>
        <div style="font-weight:500; font-size:0.85rem;">${s.courseName}</div>
        <div style="font-size:0.75rem; color:var(--text-muted);">${s.note || '-'}</div>
      </td>
      <td style="text-align:right;">เธฟ${s.carriedForward.toLocaleString()}</td>
      <td style="text-align:right;">เธฟ${s.full.toLocaleString()}</td>
      <td style="text-align:right; color:#466352; font-weight:600;">เธฟ${s.paid.toLocaleString()}</td>
      <td style="text-align:right;">${balanceText}</td>
      <td><span style="font-weight:600; color:var(--color-primary-hover);">${parseSheetDurationToThai(s.hours)}</span></td>
      <td><span style="font-weight:600;">${parseSheetDurationToThai(s.hoursLeft)}</span></td>
      <td style="font-size:0.75rem;">
        <div>${formatDateTimeToThaiLong(s.paymentDate) || '-'}</div>
        <div style="color:var(--text-muted);">${s.staff || '-'}</div>
      </td>
      <td>
        <button class="btn btn-primary btn-icon" onclick="showPrivatePaymentModal('${s.name}', '${s.courseName}')" title="เธฅเธเธขเธญเธ”เน€เธเธดเธเธเธณเธฃเธฐ">๐ช</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  
  if (state.privateStudents.length === 0) {
    tbody.innerHTML = `<tr><td colspan="11" style="text-align: center; color: var(--text-muted); padding: 40px;">เนเธกเนเธเธเธเธฃเธฐเธงเธฑเธ•เธดเน€เธ”เนเธเน€เธฃเธตเธขเธเน€เธ”เธตเนเธขเธงเนเธเธชเธกเธธเธ”เน€เธฅเนเธกเธเธตเน</td></tr>`;
  }
}

function showPrivatePaymentModal(name, courseName) {
  const std = state.privateStudents.find(s => s.name === name && s.courseName === courseName);
  if (!std) return;
  
  state.selectedPrivateStudent = std;
  
  if (document.getElementById('p_student_name')) document.getElementById('p_student_name').value= std.name;
  if (document.getElementById('p_course_name')) document.getElementById('p_course_name').value= std.courseName;
  if (document.getElementById('p_student_display_name')) document.getElementById('p_student_display_name').innerText= 'เธเธฑเธเน€เธฃเธตเธขเธ: ' + std.name + ' (' + std.nickname + ')';
  if (document.getElementById('p_course_display_name')) document.getElementById('p_course_display_name').innerText= 'เธเธญเธฃเนเธช: ' + std.courseName;
  
  if (document.getElementById('p_carried_forward')) document.getElementById('p_carried_forward').value= std.carriedForward;
  if (document.getElementById('p_hours')) document.getElementById('p_hours').value= parseSheetDurationToHHMM(std.hours) || '08:00';
  if (document.getElementById('p_paid')) document.getElementById('p_paid').value= std.paid;
  if (document.getElementById('p_payment_date')) document.getElementById('p_payment_date').value= convertDateFromSheet(std.paymentDate) || getTodayString();
  if (document.getElementById('p_payment_time')) document.getElementById('p_payment_time').value= convertTimeFromSheet(std.paymentDate) || getCurrentTimeHHMM();
  if (document.getElementById('p_payment_channel')) document.getElementById('p_payment_channel').value= std.paymentChannel;
  if (document.getElementById('p_staff')) document.getElementById('p_staff').value= std.staff || '';
  
  document.getElementById('private_payment_modal').classList.add('active');
}

function closePrivatePaymentModal() {
  document.getElementById('private_payment_modal').classList.remove('active');
}

function savePrivateStudentPayment(e) {
  e.preventDefault();
  const sheetName = state.selectedPrivateStudent ? state.selectedPrivateStudent.sheetName : document.getElementById('private_sheet_select').value;
  const name = document.getElementById('p_student_name').value;
  const courseName = document.getElementById('p_course_name').value;
  
  const dateVal = document.getElementById('p_payment_date').value;
  const timeVal = document.getElementById('p_payment_time').value || '00:00';
  let paymentDateStr = '';
  if (dateVal) {
    const d = new Date(dateVal);
    paymentDateStr = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${timeVal} เธ.`;
  }
  
  const paymentData = {
    carriedForward: parseFloat(document.getElementById('p_carried_forward').value) || 0,
    hours: document.getElementById('p_hours').value.trim(),
    paid: parseFloat(document.getElementById('p_paid').value) || 0,
    paymentDate: paymentDateStr,
    paymentChannel: document.getElementById('p_payment_channel').value,
    staff: document.getElementById('p_staff').value.trim()
  };
  
  // Calculate remaining learning hours left dynamically
  let rate = 250;
  if (courseName.toLowerCase().includes('ex')) rate = 312.5;
  
  let minutes = 0;
  if (paymentData.hours.includes(':')) {
    const parts = paymentData.hours.split(':');
    minutes = (parseInt(parts[0]) * 60) + parseInt(parts[1]);
  }
  
  const full = (minutes * rate) / 60;
  const outstanding = (paymentData.paid + paymentData.carriedForward) - full;
  const totalHrs = outstanding / rate;
  
  const formattedHrs = Math.floor(Math.abs(totalHrs)) + ' เธเธก. ' + Math.round(Math.abs(totalHrs) % 1 * 60) + ' เธเธฒเธ—เธต';
  paymentData.hoursLeft = (outstanding < 0 ? '-' : '') + formattedHrs;
  
  setLoading(true, 'เธเธณเธฅเธฑเธเธเธฑเธเธ—เธถเธเธขเธญเธ”เน€เธเธดเธเน€เธเนเธฒเธเธตเธ•เธขเนเธญเธขเน€เธ”เนเธเน€เธ”เธตเนเธขเธงเนเธฅเธฐเธเธฒเธเธเนเธญเธกเธนเธฅเธเธฅเธฒเธ...');
  const user = getLogUser();
  
  google.script.run
    .withSuccessHandler(res => {
      setLoading(false);
      if (res && res.success) {
        showToast('เธเธฑเธเธ—เธถเธเน€เธเธดเธเธฅเธเธเธตเธ•เธเธฃเธฐเธงเธฑเธ•เธดเธ•เธฒเธฃเธฒเธเน€เธ”เนเธเธชเธณเน€เธฃเนเธ!', 'success');
        closePrivatePaymentModal();
        loadPrivateStudents(); // reload list
      } else {
        showToast('เธเธฒเธฃเธเธฑเธเธ—เธถเธเธขเธญเธ”เธเธฑเธ”เธเนเธญเธ: ' + res.error, 'error');
      }
    })
    .withFailureHandler(err => {
      setLoading(false);
      showToast('เธเธฒเธฃเน€เธเธทเนเธญเธกเธ•เนเธญเธเธดเธ”เธเธฅเธฒเธ”: ' + err.message, 'error');
    })
    .savePrivateStudentPayment(sheetName, name, courseName, paymentData, user);
}

// ----------------------------------------------------
// 5. Daily Timetable Grid (already updated earlier)
// ----------------------------------------------------
function loadDailyGrid(silent = false) {
  const dateInput = document.getElementById('daily_grid_filter_date').value;
  if (document.getElementById('daily_grid_date_display')) {
    if (document.getElementById('daily_grid_date_display')) document.getElementById('daily_grid_date_display').innerText= formatDateToThaiShort(dateInput);
  }
  const sheetDate = convertDateToSheet(dateInput);
  
  if (!silent) setLoading(true, 'เธเธณเธฅเธฑเธเธ”เธถเธเธ•เธฒเธฃเธฒเธเธชเธญเธเธฃเธฒเธขเธซเนเธญเธเน€เธฃเธตเธขเธเธเธฃเธฐเธเธณเธงเธฑเธเธ—เธตเน ' + formatDateToThai(sheetDate) + '...');
  google.script.run
    .withSuccessHandler(data => {
      if (!silent) setLoading(false);
      if (data && !data.error) {
        state.rooms = data.rooms;
        state.classLogs = data.classes;
        renderDailyGrid();
      } else {
        if (!silent) showToast('เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เธ”เธถเธเธ•เธฒเธฃเธฒเธเธซเนเธญเธเน€เธฃเธตเธขเธเนเธ”เน: ' + (data ? data.error : 'unknown'), 'error');
      }
    })
    .withFailureHandler(err => {
      if (!silent) {
        setLoading(false);
        showToast('เน€เธเธทเนเธญเธกเธ•เนเธญเธฅเนเธกเน€เธซเธฅเธง: ' + err.message, 'error');
      }
    })
    .getDailyGridData(sheetDate);
}

function renderDailyGrid() {
  const container = document.getElementById('rooms_grid_container');
  container.innerHTML = '';
  
  const currentBranch = state.activeBranchFilter;
  const filteredRooms = state.rooms.filter(r => {
    if (currentBranch === 'เธญเธญเธเนเธฅเธเน') {
      return r.roomName.toLowerCase().includes('เธญเธญเธเนเธฅเธเน');
    } else {
      return r.branch === currentBranch && !r.roomName.toLowerCase().includes('เธญเธญเธเนเธฅเธเน');
    }
  });
  
  filteredRooms.forEach(room => {
    const card = document.createElement('div');
    card.className = 'room-card';
    
    const roomClasses = state.classLogs.filter(log => {
      const roomMatch = log.roomBranch.toLowerCase().includes(room.roomName.toLowerCase().trim());
      const branchMatch = log.roomBranch.toLowerCase().includes(room.branch.toLowerCase().trim()) || 
                          (room.roomName.toLowerCase().includes('เธญเธญเธเนเธฅเธเน') && log.roomBranch.toLowerCase().includes('เธญเธญเธเนเธฅเธเน'));
      return roomMatch && branchMatch;
    });
    
    let detailsStr = '';
    if (room.ipad) detailsStr += `<span>๐“ฑ ${room.ipad}</span>`;
    if (room.zoom) detailsStr += `<span>๐’ป ${room.zoom}</span>`;
    
    let classesHTML = '';
    if (roomClasses.length > 0) {
      roomClasses.sort((a,b) => a.timeStart.localeCompare(b.timeStart));
      roomClasses.forEach(c => {
        let statusClass = '';
        if (c.isPresentLive > 0 || c.isPresentOnline > 0 || c.isOrange > 0) {
          statusClass = ''; // default active
        } else if (c.isMakeup > 0) {
          statusClass = 'status-makeup';
        } else if (c.isLeave > 0) {
          statusClass = 'status-leave';
        } else if (c.isAbsent > 0) {
          statusClass = 'status-absent';
        }
        
        const attendances = [];
        if (c.isPresentLive > 0) attendances.push(`เธชเธ”: ${c.isPresentLive}`);
        if (c.isPresentOnline > 0) attendances.push(`เธญเธญเธ: ${c.isPresentOnline}`);
        if (c.isLeave > 0) attendances.push(`เธฅเธฒ: ${c.isLeave}`);
        if (c.isMakeup > 0) attendances.push(`เธเธ”: ${c.isMakeup}`);
        if (c.isAbsent > 0) attendances.push(`เธเธฒเธ”: ${c.isAbsent}`);
        if (c.isOrange > 0) attendances.push(`เนเธชเธ”: ${c.isOrange}`);
        
        const attendanceSummary = attendances.length > 0 
          ? `<span class="scheduled-students" style="font-size:0.75rem; color:var(--color-primary-hover); font-weight:500; display:block; margin-top:2px;">๐‘ฅ ${attendances.join('  ')}</span>`
          : '';
        
        classesHTML += `
          <div class="scheduled-item ${statusClass}" onclick="showEditClassLogModal(${c.rowIndex})">
            <span class="scheduled-time">โฐ ${c.timeStart} - ${c.timeEnd}</span>
            <span class="scheduled-subject">${c.subject}</span>
            ${attendanceSummary}
            <span class="scheduled-teacher" style="margin-top:2px;">เธเธฃเธน: ${c.teacherRegular} ${c.teacherSub ? `(เนเธ—เธ: ${c.teacherSub})` : ''}</span>
          </div>
        `;
      });
    } else {
      classesHTML = `<div class="room-empty-text">เนเธกเนเธกเธตเธเธฑเนเธงเนเธกเธเน€เธฃเธตเธขเธ</div>`;
    }
    
    const fullRoomLabel = `${room.roomName} ${room.branch} ${room.ipad ? room.ipad : ''} ${room.zoom ? room.zoom : ''}`.replace(/\s+/g, ' ').trim();
    
    card.innerHTML = `
      <div>
        <div class="room-header">
          <div class="room-title-area">
            <div class="room-name-title">${room.roomName}</div>
            <div class="room-settings-info">${detailsStr}</div>
          </div>
          <div style="display: flex; gap: 4px;">
            <button class="room-edit-btn" onclick="showEditRoomModal('${room.branch}', '${room.roomName}', '${room.ipad}', '${room.zoom}')" title="เนเธเนเนเธ IPAD/Zoom">โ๏ธ</button>
            <button class="room-edit-btn" onclick="deleteRoomFrontend('${room.branch}', '${room.roomName}')" title="เธฅเธเธซเนเธญเธเน€เธฃเธตเธขเธ" style="color: var(--color-danger); transition: transform 0.2s;" onmouseover="this.style.color='#f44336'; this.style.transform='scale(1.15)'" onmouseout="this.style.color='var(--color-danger)'; this.style.transform='scale(1)'">๐—‘๏ธ</button>
          </div>
        </div>
        <div class="room-classes">
          ${classesHTML}
        </div>
      </div>
      <button class="room-empty-btn" onclick="quickAddClassLog('${fullRoomLabel}')" style="margin-top:10px;">
        <span>โ•</span> เน€เธเธดเนเธกเธเธฅเธฒเธชเน€เธฃเธตเธขเธ
      </button>
    `;
    container.appendChild(card);
  });
  
  if (filteredRooms.length === 0) {
    container.innerHTML = `<div style="grid-column: span 3; text-align: center; color: var(--text-muted); padding: 40px;">เนเธกเนเธกเธตเธเนเธญเธกเธนเธฅเธซเนเธญเธเน€เธฃเธตเธขเธเนเธเธชเธฒเธเธฒเธเธตเน</div>`;
  }
}

function quickAddClassLog(roomLabel) {
  showAddClassLogModal();
  if (document.getElementById('class_room')) document.getElementById('class_room').value= roomLabel;
}

function showAddRoomModal() {
  if (document.getElementById('room_modal_title')) document.getElementById('room_modal_title').innerText= 'เน€เธเธดเนเธกเธซเนเธญเธเน€เธฃเธตเธขเธเนเธซเธกเน';
  document.getElementById('room_add_fields').style.display = 'block';
  
  // Pre-select current active branch tab filter (or default to เธชเธฒเธเธฒ1)
  const currentBranch = state.activeBranchFilter || 'เธชเธฒเธเธฒ1';
  if (document.getElementById('room_add_branch')) document.getElementById('room_add_branch').value= currentBranch;
  if (document.getElementById('room_add_name')) document.getElementById('room_add_name').value= '';
  if (document.getElementById('room_edit_ipad')) document.getElementById('room_edit_ipad').value= '';
  if (document.getElementById('room_edit_zoom')) document.getElementById('room_edit_zoom').value= '';
  
  if (document.getElementById('room_edit_branch')) document.getElementById('room_edit_branch').value= '';
  if (document.getElementById('room_edit_name')) document.getElementById('room_edit_name').value= '';
  
  document.getElementById('room_modal').classList.add('active');
}

function showEditRoomModal(branch, roomName, ipad, zoom) {
  if (document.getElementById('room_modal_title')) document.getElementById('room_modal_title').innerText= 'เธ•เธฑเนเธเธเนเธฒเธซเนเธญเธเน€เธฃเธตเธขเธ (IPAD & Zoom)';
  document.getElementById('room_add_fields').style.display = 'none';
  
  if (document.getElementById('room_edit_branch')) document.getElementById('room_edit_branch').value= branch;
  if (document.getElementById('room_edit_name')) document.getElementById('room_edit_name').value= roomName;
  if (document.getElementById('room_edit_ipad')) document.getElementById('room_edit_ipad').value= ipad;
  if (document.getElementById('room_edit_zoom')) document.getElementById('room_edit_zoom').value= zoom;
  document.getElementById('room_modal').classList.add('active');
}

function closeRoomModal() {
  document.getElementById('room_modal').classList.remove('active');
}

function saveRoomSettings(e) {
  e.preventDefault();
  
  const addFieldsDiv = document.getElementById('room_add_fields');
  const isAddMode = addFieldsDiv.style.display !== 'none';
  
  let branch, roomName;
  if (isAddMode) {
    branch = document.getElementById('room_add_branch').value;
    roomName = document.getElementById('room_add_name').value.trim();
    if (!roomName) {
      showToast('เธเธฃเธธเธ“เธฒเธเธฃเธญเธเธเธทเนเธญเธซเนเธญเธเน€เธฃเธตเธขเธ', 'error');
      return;
    }
  } else {
    branch = document.getElementById('room_edit_branch').value;
    roomName = document.getElementById('room_edit_name').value;
  }
  
  const ipad = document.getElementById('room_edit_ipad').value.trim();
  const zoom = document.getElementById('room_edit_zoom').value.trim();
  
  setLoading(true, 'เธเธณเธฅเธฑเธเธเธฑเธเธ—เธถเธเธ•เธฑเนเธเธเนเธฒเธซเนเธญเธเน€เธฃเธตเธขเธ...');
  const user = getLogUser();
  
  google.script.run
    .withSuccessHandler(res => {
      setLoading(false);
      if (res && res.success) {
        showToast('เธเธฑเธเธ—เธถเธเธเธฒเธฃเธ•เธฑเนเธเธเนเธฒเธซเนเธญเธเธชเธณเน€เธฃเนเธ!', 'success');
        closeRoomModal();
        loadDailyGrid(); 
      } else {
        showToast('เธเธฑเธเธ—เธถเธเธเธดเธ”เธเธฅเธฒเธ”: ' + res.error, 'error');
      }
    })
    .withFailureHandler(err => {
      setLoading(false);
      showToast('เน€เธเธทเนเธญเธกเธ•เนเธญเธเธดเธ”เธเธฅเธฒเธ”: ' + err.message, 'error');
    })
    .updateRoomSettings(branch, roomName, ipad, zoom, user);
}

function deleteRoomFrontend(branch, roomName) {
  if (confirm(`เธเธธเธ“เนเธเนเนเธเธซเธฃเธทเธญเนเธกเนเธ—เธตเนเธเธฐเธฅเธเธซเนเธญเธเน€เธฃเธตเธขเธ "${roomName}" เธเธญเธ "${branch}" ?\n(เธเนเธญเธกเธนเธฅเธเธฒเธเน€เธฃเธตเธขเธเธเธฐเนเธกเนเธซเธฒเธขเนเธ เนเธ•เนเธซเนเธญเธเน€เธฃเธตเธขเธเธเธตเนเธเธฐเธ–เธนเธเธฅเธเธญเธญเธเธเธฒเธเธ•เธฒเธฃเธฒเธเน€เธฃเธตเธขเธเธฃเธฒเธขเธซเนเธญเธ)`)) {
    setLoading(true, 'เธเธณเธฅเธฑเธเธฅเธเธซเนเธญเธเน€เธฃเธตเธขเธ...');
    const user = getLogUser();
    
    google.script.run
      .withSuccessHandler(res => {
        setLoading(false);
        if (res && res.success) {
          showToast('เธฅเธเธซเนเธญเธเน€เธฃเธตเธขเธเธชเธณเน€เธฃเนเธ!', 'success');
          loadDailyGrid();
        } else {
          showToast('เธฅเธเธซเนเธญเธเน€เธฃเธตเธขเธเธฅเนเธกเน€เธซเธฅเธง: ' + res.error, 'error');
        }
      })
      .withFailureHandler(err => {
        setLoading(false);
        showToast('เน€เธเธทเนเธญเธกเธ•เนเธญเธเธดเธ”เธเธฅเธฒเธ”: ' + err.message, 'error');
      })
      .deleteRoom(branch, roomName, user);
  }
}

// ----------------------------------------------------
// 6. Class Logs Panel (เธเธฑเธเธ—เธถเธเธเธฑเนเธงเนเธกเธเธชเธญเธ)
// ----------------------------------------------------
function loadClassLogs(silent = false) {
  const filterDateInput = document.getElementById('log_filter_date').value;
  if (document.getElementById('class_log_date_display')) {
    if (document.getElementById('class_log_date_display')) document.getElementById('class_log_date_display').innerText= formatDateToThaiShort(filterDateInput);
  }
  const sheetDate = convertDateToSheet(filterDateInput);
  
  if (!silent) setLoading(true, 'เธเธณเธฅเธฑเธเธ”เธถเธเธเธฅเธฒเธชเน€เธฃเธตเธขเธเธเธฃเธฐเธเธณเธงเธฑเธเธ—เธตเน ' + formatDateToThai(sheetDate) + '...');
  google.script.run
    .withSuccessHandler(data => {
      if (!silent) setLoading(false);
      if (Array.isArray(data)) {
        state.classLogs = data;
        renderClassLogsTable();
      } else {
        if (!silent) showToast('เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เธ”เธถเธเธเนเธญเธกเธนเธฅเธเธฅเธฒเธชเน€เธฃเธตเธขเธเนเธ”เน: ' + (data ? data.error : 'unknown'), 'error');
      }
    })
    .withFailureHandler(err => {
      if (!silent) {
        setLoading(false);
        showToast('เธ”เธถเธเธเนเธญเธกเธนเธฅเธฅเนเธกเน€เธซเธฅเธง: ' + err.message, 'error');
      }
    })
    .getClassLogs(sheetDate);
}

function renderClassLogsTable() {
  const tbody = document.getElementById('class_logs_tbody');
  tbody.innerHTML = '';
  
  if (!state.classLogs || state.classLogs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 40px;">เนเธกเนเธกเธตเธเนเธญเธกเธนเธฅเธเธฒเธฃเน€เธฃเธตเธขเธเนเธเธงเธฑเธเธ—เธตเนเธเธณเธซเธเธ”</td></tr>`;
    return;
  }
  
  // Helper to parse branch name
  function getBranchFromRoomBranch(roomBranch) {
    const clean = (roomBranch || '').toLowerCase();
    if (clean.includes('เธชเธฒเธเธฒ 1') || clean.includes('เธชเธฒเธเธฒ1')) return { code: 1, label: 'เธชเธฒเธเธฒ 1' };
    if (clean.includes('เธชเธฒเธเธฒ 2') || clean.includes('เธชเธฒเธเธฒ2')) return { code: 2, label: 'เธชเธฒเธเธฒ 2' };
    if (clean.includes('เธชเธฒเธเธฒ 3') || clean.includes('เธชเธฒเธเธฒ3')) return { code: 3, label: 'เธชเธฒเธเธฒ 3' };
    if (clean.includes('เธญเธญเธเนเธฅเธเน') || clean.includes('online')) return { code: 4, label: 'เธญเธญเธเนเธฅเธเน' };
    return { code: 99, label: 'เธญเธทเนเธเน' };
  }
  
  // Sort state.classLogs by branch, room, and start time
  const sortedLogs = [...state.classLogs].sort((a, b) => {
    const bA = getBranchFromRoomBranch(a.roomBranch);
    const bB = getBranchFromRoomBranch(b.roomBranch);
    if (bA.code !== bB.code) return bA.code - bB.code;
    
    // Sort by room name
    const rA = (a.roomBranch || '').trim();
    const rB = (b.roomBranch || '').trim();
    const rComp = rA.localeCompare(rB);
    if (rComp !== 0) return rComp;
    
    // Sort by start time
    return (a.timeStart || '').localeCompare(b.timeStart || '');
  });
  
  let currentGroupCode = null;
  
  sortedLogs.forEach(log => {
    const branchInfo = getBranchFromRoomBranch(log.roomBranch);
    
    // If branch group changes, render a section header row
    if (branchInfo.code !== currentGroupCode) {
      currentGroupCode = branchInfo.code;
      const headerTr = document.createElement('tr');
      headerTr.style.backgroundColor = 'rgba(74, 222, 128, 0.08)'; // Subtle premium green tint
      headerTr.style.fontWeight = 'bold';
      headerTr.innerHTML = `
        <td colspan="6" style="padding: 10px 16px; font-size: 0.9rem; color: var(--color-primary-hover);">
          ๐ข ${branchInfo.label}
        </td>
      `;
      tbody.appendChild(headerTr);
    }
    
    const tr = document.createElement('tr');
    
    let statusText = '';
    const badges = [];
    if (log.isPresentLive > 0) badges.push(`<span class="badge badge-success">เธชเธ”: ${log.isPresentLive}</span>`);
    if (log.isPresentOnline > 0) badges.push(`<span class="badge badge-info">เธญเธญเธ: ${log.isPresentOnline}</span>`);
    if (log.isLeave > 0) badges.push(`<span class="badge badge-warning">เธฅเธฒ: ${log.isLeave}</span>`);
    if (log.isAbsent > 0) badges.push(`<span class="badge badge-danger">เธเธฒเธ”: ${log.isAbsent}</span>`);
    if (log.isMakeup > 0) badges.push(`<span class="badge" style="background-color: #c095e7; color: white;">เธเธ”: ${log.isMakeup}</span>`);
    if (log.isOrange > 0) badges.push(`<span class="badge" style="background-color: #f97316; color: white;">เนเธชเธ”: ${log.isOrange}</span>`);
    
    if (badges.length > 0) {
      statusText = `<div style="display:flex; flex-wrap:wrap; gap:4px;">${badges.join('')}</div>`;
    } else {
      statusText = '<span class="badge">เนเธกเนเนเธ”เนเน€เธเนเธเธญเธดเธ</span>';
    }
    
    tr.innerHTML = `
      <td>
        <div style="font-weight:600;">${log.subject}</div>
        <div style="font-size:0.75rem; color:var(--text-muted);">${log.roomBranch || '-'}</div>
      </td>
      <td>
        <div>${log.teacherRegular}</div>
        ${log.teacherSub ? `<div style="font-size:0.75rem; color:var(--text-muted);">เนเธ—เธ: ${log.teacherSub}</div>` : ''}
      </td>
      <td>${log.timeStart} - ${log.timeEnd} (${log.hours} เธเธก.)</td>
      <td>${statusText}</td>
      <td>${log.note || '-'}</td>
      <td>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-secondary btn-icon" onclick="showEditClassLogModal(${log.rowIndex})" title="เนเธเนเนเธ">โ๏ธ</button>
          <button class="btn btn-danger btn-icon" onclick="deleteClassLog(${log.rowIndex})" title="เธฅเธ">๐—‘๏ธ</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function showAddClassLogModal() {
  state.selectedClassLog = null;
  if (document.getElementById('class_modal_title')) document.getElementById('class_modal_title').innerText= 'เธเธฑเธเธ—เธถเธเธเธฑเนเธงเนเธกเธเธชเธญเธเธเธฅเธฒเธชเนเธซเธกเน';
  document.getElementById('class_form').reset();
  
  // Reset attendance numbers
  if (document.getElementById('class_kids_live')) document.getElementById('class_kids_live').value= 0;
  if (document.getElementById('class_kids_online')) document.getElementById('class_kids_online').value= 0;
  if (document.getElementById('class_kids_leave')) document.getElementById('class_kids_leave').value= 0;
  if (document.getElementById('class_kids_absent')) document.getElementById('class_kids_absent').value= 0;
  if (document.getElementById('class_kids_makeup')) document.getElementById('class_kids_makeup').value= 0;
  if (document.getElementById('class_kids_orange')) document.getElementById('class_kids_orange').value= 0;
  if (document.getElementById('class_kids_sum')) document.getElementById('class_kids_sum').value= 0;
  
  if (document.getElementById('class_date')) document.getElementById('class_date').value= document.getElementById('log_filter_date').value;
  if (document.getElementById('class_row_index')) document.getElementById('class_row_index').value= '';
  
  // Reset and show recurring option
  if (document.getElementById('class_is_recurring')) document.getElementById('class_is_recurring').checked= false;
  document.getElementById('class_recurring_wrapper').style.display = 'block';
  document.getElementById('class_recurring_end_container').style.display = 'none';
  
  document.getElementById('class_modal').classList.add('active');
}

function showEditClassLogModal(rowIndex) {
  const log = state.classLogs.find(l => l.rowIndex === rowIndex);
  if (!log) return;
  
  state.selectedClassLog = log;
  if (document.getElementById('class_modal_title')) document.getElementById('class_modal_title').innerText= 'เนเธเนเนเธเธเธฑเธเธ—เธถเธเธเธฑเนเธงเนเธกเธเธชเธญเธ';
  
  if (document.getElementById('class_row_index')) document.getElementById('class_row_index').value= log.rowIndex;
  if (document.getElementById('class_subject')) document.getElementById('class_subject').value= log.subject;
  if (document.getElementById('class_teacher_reg')) document.getElementById('class_teacher_reg').value= log.teacherRegular;
  if (document.getElementById('class_teacher_sub')) document.getElementById('class_teacher_sub').value= log.teacherSub || '';
  if (document.getElementById('class_time_start')) document.getElementById('class_time_start').value= log.timeStart;
  if (document.getElementById('class_time_end')) document.getElementById('class_time_end').value= log.timeEnd;
  if (document.getElementById('class_hours')) document.getElementById('class_hours').value= log.hours;
  if (document.getElementById('class_date')) document.getElementById('class_date').value= convertDateFromSheet(log.date);
  if (document.getElementById('class_room')) document.getElementById('class_room').value= log.roomBranch;
  if (document.getElementById('class_note')) document.getElementById('class_note').value= log.note;
  
  if (document.getElementById('class_kids_live')) document.getElementById('class_kids_live').value= log.isPresentLive || 0;
  if (document.getElementById('class_kids_online')) document.getElementById('class_kids_online').value= log.isPresentOnline || 0;
  if (document.getElementById('class_kids_leave')) document.getElementById('class_kids_leave').value= log.isLeave || 0;
  if (document.getElementById('class_kids_absent')) document.getElementById('class_kids_absent').value= log.isAbsent || 0;
  if (document.getElementById('class_kids_makeup')) document.getElementById('class_kids_makeup').value= log.isMakeup || 0;
  if (document.getElementById('class_kids_orange')) document.getElementById('class_kids_orange').value= log.isOrange || 0;
  
  updateClassKidsSum();
  
  // Hide recurring option during editing
  if (document.getElementById('class_is_recurring')) document.getElementById('class_is_recurring').checked= false;
  document.getElementById('class_recurring_wrapper').style.display = 'none';
  document.getElementById('class_recurring_end_container').style.display = 'none';
  
  document.getElementById('class_modal').classList.add('active');
}

function closeClassLogModal() {
  document.getElementById('class_modal').classList.remove('active');
  if (document.getElementById('class_is_recurring')) document.getElementById('class_is_recurring').checked= false;
  document.getElementById('class_recurring_end_container').style.display = 'none';
}

function updateClassKidsSum() {
  const live = parseInt(document.getElementById('class_kids_live').value) || 0;
  const online = parseInt(document.getElementById('class_kids_online').value) || 0;
  const leave = parseInt(document.getElementById('class_kids_leave').value) || 0;
  if (document.getElementById('class_kids_sum')) document.getElementById('class_kids_sum').value= live + online + leave;
}

function calculateClassHours() {
  const start = document.getElementById('class_time_start').value;
  const end = document.getElementById('class_time_end').value;
  if (!start || !end) return;
  
  const sParts = start.split(':');
  const eParts = end.split(':');
  
  const sMin = parseInt(sParts[0]) * 60 + parseInt(sParts[1]);
  const eMin = parseInt(eParts[0]) * 60 + parseInt(eParts[1]);
  
  if (eMin > sMin) {
    const diffMin = eMin - sMin;
    const hr = Math.floor(diffMin / 60);
    const min = diffMin % 60;
    const formatted = `${hr}:${min < 10 ? '0' + min : min}`;
    if (document.getElementById('class_hours')) document.getElementById('class_hours').value= formatted;
  }
}

function saveClassLog(e) {
  e.preventDefault();
  const rowIndex = document.getElementById('class_row_index').value;
  
  const logData = {
    subject: document.getElementById('class_subject').value.trim(),
    teacherRegular: document.getElementById('class_teacher_reg').value,
    teacherSub: document.getElementById('class_teacher_sub').value,
    timeStart: document.getElementById('class_time_start').value,
    timeEnd: document.getElementById('class_time_end').value,
    hours: document.getElementById('class_hours').value.trim(),
    date: convertDateToSheet(document.getElementById('class_date').value),
    roomBranch: document.getElementById('class_room').value.trim(),
    note: document.getElementById('class_note').value.trim(),
    
    isPresentLive: parseInt(document.getElementById('class_kids_live').value) || 0,
    isPresentOnline: parseInt(document.getElementById('class_kids_online').value) || 0,
    isLeave: parseInt(document.getElementById('class_kids_leave').value) || 0,
    isAbsent: parseInt(document.getElementById('class_kids_absent').value) || 0,
    isMakeup: parseInt(document.getElementById('class_kids_makeup').value) || 0,
    isOrange: parseInt(document.getElementById('class_kids_orange').value) || 0
  };
  
  setLoading(true, 'เธเธณเธฅเธฑเธเธเธฑเธเธ—เธถเธเธเธฑเนเธงเนเธกเธเธชเธญเธ...');
  const user = getLogUser();
  
  if (rowIndex) {
    google.script.run
      .withSuccessHandler(res => {
        setLoading(false);
        if (res && res.success) {
          showToast('เธญเธฑเธเน€เธ”เธ•เธเธฑเนเธงเนเธกเธเธชเธญเธเธชเธณเน€เธฃเนเธเนเธฅเนเธง!', 'success');
          closeClassLogModal();
          
          const activePanel = document.querySelector('.nav-item.active').getAttribute('data-panel');
          if (activePanel === 'daily_grid') loadDailyGrid();
          else loadClassLogs();
        } else {
          showToast('เธญเธฑเธเน€เธ”เธ•เนเธกเนเธชเธณเน€เธฃเนเธ: ' + res.error, 'error');
        }
      })
      .withFailureHandler(err => {
        setLoading(false);
        showToast('เน€เธเธทเนเธญเธกเธ•เนเธญเธเธดเธ”เธเธฅเธฒเธ”: ' + err.message, 'error');
      })
      .updateClassLog(parseInt(rowIndex), logData, user);
  } else {
    // Check if recurring option is selected
    const isRecurring = document.getElementById('class_is_recurring').checked;
    if (isRecurring) {
      const startDateStr = document.getElementById('class_date').value;
      const endDateStr = document.getElementById('class_recurring_end_date').value;
      
      if (!startDateStr || !endDateStr) {
        showToast('เธเธฃเธธเธ“เธฒเธฃเธฐเธเธธเธงเธฑเธเธ—เธตเนเน€เธฃเธดเนเธกเธ•เนเธเนเธฅเธฐเธชเธดเนเธเธชเธธเธ”เธเธญเธเธเธญเธฃเนเธช', 'error');
        setLoading(false);
        return;
      }
      
      const startParts = startDateStr.split('-');
      const endParts = endDateStr.split('-');
      
      const startDate = new Date(parseInt(startParts[0], 10), parseInt(startParts[1], 10) - 1, parseInt(startParts[2], 10));
      const endDate = new Date(parseInt(endParts[0], 10), parseInt(endParts[1], 10) - 1, parseInt(endParts[2], 10));
      
      if (endDate < startDate) {
        showToast('เธงเธฑเธเธ—เธตเนเธชเธดเนเธเธชเธธเธ”เธ•เนเธญเธเนเธกเนเธเนเธญเธขเธเธงเนเธฒเธงเธฑเธเธ—เธตเนเน€เธฃเธดเนเธกเธ•เนเธ', 'error');
        setLoading(false);
        return;
      }
      
      const logs = [];
      const targetDay = startDate.getDay();
      
      const current = new Date(startDate);
      while (current <= endDate) {
        if (current.getDay() === targetDay) {
          const logDateStr = `${current.getDate()}/${current.getMonth() + 1}/${current.getFullYear()}`;
          logs.push(Object.assign({}, logData, { date: logDateStr }));
        }
        current.setDate(current.getDate() + 1);
      }
      
      if (logs.length === 0) {
        showToast('เนเธกเนเธเธเธงเธฑเธเธ—เธตเนเธ•เธฃเธเธเธฑเธเธงเธฑเธเนเธเธชเธฑเธเธ”เธฒเธซเนเธ—เธตเนเน€เธฅเธทเธญเธเนเธเธเนเธงเธเน€เธงเธฅเธฒเธ”เธฑเธเธเธฅเนเธฒเธง', 'error');
        setLoading(false);
        return;
      }
      
      google.script.run
        .withSuccessHandler(res => {
          setLoading(false);
          if (res && res.success) {
            showToast('เธเธฑเธเธ—เธถเธเธเธฅเธฒเธชเน€เธฃเธตเธขเธเธเนเธณเธชเธณเน€เธฃเนเธเธเธณเธเธงเธ ' + logs.length + ' เธเธฒเธ!', 'success');
            closeClassLogModal();
            const activePanel = document.querySelector('.nav-item.active').getAttribute('data-panel');
            if (activePanel === 'daily_grid') loadDailyGrid();
            else loadClassLogs();
          } else {
            showToast('เธเธฑเธเธ—เธถเธเนเธกเนเธชเธณเน€เธฃเนเธ: ' + res.error, 'error');
          }
        })
        .withFailureHandler(err => {
          setLoading(false);
          showToast('เน€เธเธทเนเธญเธกเธ•เนเธญเธเธดเธ”เธเธฅเธฒเธ”: ' + err.message, 'error');
        })
        .addMultipleClassLogs(logs, user);
    } else {
      google.script.run
        .withSuccessHandler(res => {
          setLoading(false);
          if (res && res.success) {
            showToast('เธเธฑเธเธ—เธถเธเธเธฅเธฒเธชเน€เธฃเธตเธขเธเธชเธณเน€เธฃเนเธเนเธฅเนเธง!', 'success');
            closeClassLogModal();
            
            const activePanel = document.querySelector('.nav-item.active').getAttribute('data-panel');
            if (activePanel === 'daily_grid') loadDailyGrid();
            else loadClassLogs();
          } else {
            showToast('เธเธฑเธเธ—เธถเธเนเธกเนเธชเธณเน€เธฃเนเธ: ' + res.error, 'error');
          }
        })
        .withFailureHandler(err => {
          setLoading(false);
          showToast('เน€เธเธทเนเธญเธกเธ•เนเธญเธเธดเธ”เธเธฅเธฒเธ”: ' + err.message, 'error');
        })
        .addClassLog(logData, user);
    }
  }
}

function deleteClassLog(rowIndex) {
  if (confirm('เธเธธเธ“เธ•เนเธญเธเธเธฒเธฃเธฅเธเธเธฑเธเธ—เธถเธเธเธฑเนเธงเนเธกเธเธชเธญเธเธเธฅเธฒเธชเธเธตเนเนเธเนเธซเธฃเธทเธญเนเธกเน?')) {
    setLoading(true, 'เธเธณเธฅเธฑเธเธฅเธเธเธฑเธเธ—เธถเธเธเธฑเนเธงเนเธกเธเธชเธญเธ...');
    const user = getLogUser();
    google.script.run
      .withSuccessHandler(res => {
        setLoading(false);
        if (res && res.success) {
          showToast('เธฅเธเธฃเธฒเธขเธเธฒเธฃเธชเธณเน€เธฃเนเธเนเธฅเนเธง', 'success');
          const activePanel = document.querySelector('.nav-item.active').getAttribute('data-panel');
          if (activePanel === 'daily_grid') loadDailyGrid();
          else loadClassLogs();
        } else {
          showToast('เธฅเธเธฃเธฒเธขเธเธฒเธฃเนเธกเนเธชเธณเน€เธฃเนเธ: ' + res.error, 'error');
        }
      })
      .withFailureHandler(err => {
        setLoading(false);
        showToast('เน€เธเธทเนเธญเธกเธ•เนเธญเธฅเนเธกเน€เธซเธฅเธง: ' + err.message, 'error');
      })
      .deleteClassLog(rowIndex, user);
  }
}

function loadTeacherSchedule() {
  const teacher = document.getElementById('teacher_schedule_select').value;
  const container = document.getElementById('teacher_calendar_container');
  
  if (!teacher) {
    container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 40px;">เธเธฃเธธเธ“เธฒเน€เธฅเธทเธญเธเธเธทเนเธญเธเธธเธ“เธเธฃเธนเธเธนเนเธชเธญเธเธ”เนเธฒเธเธเธ</div>`;
    return;
  }
  
  setLoading(true, 'เธเธณเธฅเธฑเธเธเนเธเธซเธฒเธ•เธฒเธฃเธฒเธเน€เธฃเธตเธขเธเธเธญเธ ' + teacher + '...');
  google.script.run
    .withSuccessHandler(data => {
      setLoading(false);
      if (Array.isArray(data)) {
        state.teacherClasses = data.filter(c => 
          c.teacherRegular.toLowerCase().includes(teacher.toLowerCase().trim()) ||
          (c.teacherSub && c.teacherSub.toLowerCase().includes(teacher.toLowerCase().trim()))
        );
        
        renderTeacherScheduleCalendar();
      } else {
        showToast('เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เธ”เธถเธเธเนเธญเธกเธนเธฅเธ•เธฒเธฃเธฒเธเน€เธฃเธตเธขเธเธเธฃเธนเนเธ”เน: ' + (data ? data.error : 'unknown'), 'error');
      }
    })
    .withFailureHandler(err => {
      setLoading(false);
      showToast('เน€เธเธทเนเธญเธกเธ•เนเธญเธเธดเธ”เธเธฅเธฒเธ”: ' + err.message, 'error');
    })
    .getClassLogs(''); 
}

function renderTeacherScheduleCalendar() {
  const container = document.getElementById('teacher_calendar_container');
  container.innerHTML = '';
  
  const teacher = document.getElementById('teacher_schedule_select').value;
  if (!teacher) {
    container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 40px;">เธเธฃเธธเธ“เธฒเน€เธฅเธทเธญเธเธเธทเนเธญเธเธธเธ“เธเธฃเธนเธเธนเนเธชเธญเธเธ”เนเธฒเธเธเธ</div>`;
    return;
  }
  
  const year = parseInt(document.getElementById('teacher_schedule_year').value, 10) || new Date().getFullYear();
  const month = state.teacherCalendarMonth; 
  
  if (!state.teacherClasses) {
    container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 40px;">เนเธกเนเธเธเธเนเธญเธกเธนเธฅเธเธฒเธเน€เธฃเธตเธขเธ</div>`;
    return;
  }
  
  const calendarGrid = document.createElement('div');
  calendarGrid.className = 'calendar-grid';
  
  const dayNames = ['เธญเธฒ.', 'เธ.', 'เธญ.', 'เธ.', 'เธเธค.', 'เธจ.', 'เธช.'];
  dayNames.forEach(dn => {
    const cell = document.createElement('div');
    cell.className = 'calendar-header-cell';
    cell.innerText = dn;
    if (dn === 'เธญเธฒ.') cell.style.color = '#ef9a9a';
    else if (dn === 'เธช.') cell.style.color = '#85b4d7';
    calendarGrid.appendChild(cell);
  });
  
  const firstDay = new Date(year, month, 1);
  const startDayOfWeek = firstDay.getDay(); 
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthDays - i;
    const cell = document.createElement('div');
    cell.className = 'calendar-day-cell other-month';
    cell.innerHTML = `<span class="calendar-day-number">${dayNum}</span>`;
    calendarGrid.appendChild(cell);
  }
  
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDate = today.getDate();
  
  for (let d = 1; d <= daysInMonth; d++) {
    const cell = document.createElement('div');
    cell.className = 'calendar-day-cell';
    if (isCurrentMonth && d === todayDate) {
      cell.classList.add('today');
    }
    
    const numSpan = document.createElement('span');
    numSpan.className = 'calendar-day-number';
    numSpan.innerText = d;
    cell.appendChild(numSpan);
    
    const targetDateStr = `${d}/${month + 1}/${year}`;
    const dayClasses = state.teacherClasses.filter(c => {
      const cClean = c.date ? c.date.trim() : '';
      return cClean === targetDateStr;
    });
    
    dayClasses.sort((a, b) => a.timeStart.localeCompare(b.timeStart));
    
    const eventsContainer = document.createElement('div');
    eventsContainer.className = 'calendar-events';
    
    dayClasses.forEach(c => {
      const item = document.createElement('div');
      item.className = 'calendar-event-item';
      
      const branchClean = c.roomBranch ? c.roomBranch.toLowerCase() : '';
      if (branchClean.indexOf('เธชเธฒเธเธฒ 1') !== -1 || branchClean.indexOf('เธชเธฒเธเธฒ1') !== -1) {
        item.classList.add('branch-1');
      } else if (branchClean.indexOf('เธชเธฒเธเธฒ 2') !== -1 || branchClean.indexOf('เธชเธฒเธเธฒ2') !== -1) {
        item.classList.add('branch-2');
      } else if (branchClean.indexOf('เธชเธฒเธเธฒ 3') !== -1 || branchClean.indexOf('เธชเธฒเธเธฒ3') !== -1) {
        item.classList.add('branch-3');
      } else if (branchClean.indexOf('เธญเธญเธเนเธฅเธเน') !== -1 || branchClean.indexOf('online') !== -1) {
        item.classList.add('branch-online');
      }
      
      if (c.isLeave > 0) {
        item.classList.add('status-leave');
      } else if (c.isAbsent > 0) {
        item.classList.add('status-absent');
      }
      
      const isSub = c.teacherSub && c.teacherSub.toLowerCase().includes(teacher.toLowerCase().trim());
      const roleIcon = isSub ? '๐” ' : ''; 
      
      item.innerText = `${roleIcon}${c.timeStart} ${c.subject}`;
      item.title = `${c.subject}\nเน€เธงเธฅเธฒ: ${c.timeStart} - ${c.timeEnd}\nเธซเนเธญเธ: ${c.roomBranch || '-'}\nเธเธฃเธนเธซเธฅเธฑเธ: ${c.teacherRegular}${c.teacherSub ? '\nเธเธฃเธนเนเธ—เธ: '+c.teacherSub : ''}\nเธซเธกเธฒเธขเน€เธซเธ•เธธ: ${c.note || '-'}`;
      
      eventsContainer.appendChild(item);
    });
    
    cell.appendChild(eventsContainer);
    calendarGrid.appendChild(cell);
  }
  
  const totalCells = startDayOfWeek + daysInMonth;
  const nextMonthCells = (7 - (totalCells % 7)) % 7;
  for (let i = 1; i <= nextMonthCells; i++) {
    const cell = document.createElement('div');
    cell.className = 'calendar-day-cell other-month';
    cell.innerHTML = `<span class="calendar-day-number">${i}</span>`;
    calendarGrid.appendChild(cell);
  }
  
  container.appendChild(calendarGrid);
}

function selectTeacherScheduleMonth(month) {
  state.teacherCalendarMonth = month;
  
  const tabs = document.querySelectorAll('#teacher_schedule_panel .month-tab');
  tabs.forEach(tab => {
    const m = parseInt(tab.getAttribute('data-month'), 10);
    if (m === month) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
  
  renderTeacherScheduleCalendar();
}

// ----------------------------------------------------
// 8. Teacher Profile Log & salary calculator
// ----------------------------------------------------
function loadTeacherProfiles() {
  setLoading(true, 'เธเธณเธฅเธฑเธเนเธซเธฅเธ”เธเนเธญเธกเธนเธฅเธเธธเธ“เธเธฃเธนเธ—เธฑเนเธเธซเธกเธ”...');
  google.script.run
    .withSuccessHandler(data => {
      setLoading(false);
      if (Array.isArray(data)) {
        renderTeacherProfilesTable(data);
      } else {
        showToast('เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เธ”เธถเธเธเธฃเธฐเธงเธฑเธ•เธดเธญเธฒเธเธฒเธฃเธขเนเนเธ”เน: ' + (data ? data.error : 'unknown'), 'error');
      }
    })
    .withFailureHandler(err => {
      setLoading(false);
      showToast('เธเธฒเธฃเน€เธเธทเนเธญเธกเธ•เนเธญเธฅเนเธกเน€เธซเธฅเธง: ' + err.message, 'error');
    })
    .getTeachersDB();
}

function renderTeacherProfilesTable(teachers) {
  const tbody = document.getElementById('teacher_profiles_tbody');
  tbody.innerHTML = '';
  
  teachers.forEach(t => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight:600;">${t.nickname}</td>
      <td>${t.fullName || '-'}</td>
      <td>${t.school || '-'}</td>
      <td>${formatPhone(t.phone) || '-'}</td>
      <td>${t.subjects || '-'}</td>
      <td>${t.bank || '-'}</td>
      <td>${t.accountNumber || '-'}</td>
      <td>${t.accountType || 'เธเธฑเธเธเธตเธ—เธฑเนเธงเนเธ'}</td>
      <td>${t.compensation || '150'}</td>
      <td>
        <button class="btn btn-secondary btn-icon" onclick="showEditTeacherModal('${t.nickname}', '${t.fullName}', '${t.school}', '${formatPhone(t.phone)}', '${t.subjects}', '${t.bank}', '${t.accountNumber}', '${t.compensation || '150'}', '${t.accountType || 'เธเธฑเธเธเธตเธ—เธฑเนเธงเนเธ'}')">โ๏ธ</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  
  if (teachers.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 40px;">เนเธกเนเธเธเธเธฃเธฐเธงเธฑเธ•เธดเธญเธฒเธเธฒเธฃเธขเนเนเธเธฃเธฐเธเธ</td></tr>`;
  }
}

function switchTeacherSubTab(tabName) {
  document.getElementById('tab_t_profiles').classList.remove('active');
  document.getElementById('tab_t_calc').classList.remove('active');
  document.getElementById('teacher_subpanel_profiles').style.display = 'none';
  document.getElementById('teacher_subpanel_calc').style.display = 'none';
  
  if (tabName === 'profiles') {
    document.getElementById('tab_t_profiles').classList.add('active');
    document.getElementById('teacher_subpanel_profiles').style.display = 'block';
    loadTeacherProfiles();
  } else {
    document.getElementById('tab_t_calc').classList.add('active');
    document.getElementById('teacher_subpanel_calc').style.display = 'block';
  }
}

function showAddTeacherModal() {
  document.getElementById('teacher_form').reset();
  if (document.getElementById('teacher_modal_title')) document.getElementById('teacher_modal_title').innerText= 'เน€เธเธดเนเธกเธเธฃเธฐเธงเธฑเธ•เธดเธเธธเธ“เธเธฃเธนเนเธซเธกเน';
  document.getElementById('t_nickname').readOnly = false;
  document.getElementById('teacher_modal').classList.add('active');
}

function showEditTeacherModal(nickname, fullName, school, phone, subjects, bank, accountNumber, compensation, accountType) {
  document.getElementById('teacher_form').reset();
  if (document.getElementById('teacher_modal_title')) document.getElementById('teacher_modal_title').innerText= 'เนเธเนเนเธเธเธฃเธฐเธงเธฑเธ•เธดเธเธธเธ“เธเธฃเธน';
  if (document.getElementById('t_nickname')) document.getElementById('t_nickname').value= nickname;
  document.getElementById('t_nickname').readOnly = true; // Nickname is primary key
  if (document.getElementById('t_fullname')) document.getElementById('t_fullname').value= fullName !== '-' ? fullName : '';
  if (document.getElementById('t_school')) document.getElementById('t_school').value= school !== '-' ? school : '';
  if (document.getElementById('t_phone')) document.getElementById('t_phone').value= phone !== '-' ? phone : '';
  if (document.getElementById('t_subjects')) document.getElementById('t_subjects').value= subjects !== '-' ? subjects : '';
  if (document.getElementById('t_bank')) document.getElementById('t_bank').value= bank !== '-' ? bank : '';
  if (document.getElementById('t_account_number')) document.getElementById('t_account_number').value= accountNumber !== '-' ? accountNumber : '';
  if (document.getElementById('t_compensation')) document.getElementById('t_compensation').value= compensation !== '-' ? compensation : '150';
  if (document.getElementById('t_account_type')) document.getElementById('t_account_type').value= accountType !== '-' ? accountType : 'เธเธฑเธเธเธตเธ—เธฑเนเธงเนเธ';
  
  document.getElementById('teacher_modal').classList.add('active');
}

function closeTeacherModal() {
  document.getElementById('teacher_modal').classList.remove('active');
}

function saveTeacherProfile(e) {
  e.preventDefault();
  const teacherData = {
    nickname: document.getElementById('t_nickname').value.trim(),
    fullName: document.getElementById('t_fullname').value.trim(),
    school: document.getElementById('t_school').value.trim(),
    phone: document.getElementById('t_phone').value.trim(),
    subjects: document.getElementById('t_subjects').value.trim(),
    bank: document.getElementById('t_bank').value.trim(),
    accountNumber: document.getElementById('t_account_number').value.trim(),
    compensation: document.getElementById('t_compensation').value.trim(),
    accountType: document.getElementById('t_account_type').value
  };
  
  setLoading(true, 'เธเธณเธฅเธฑเธเธเธฑเธ”เน€เธเนเธเธเธฃเธฐเธงเธฑเธ•เธดเธญเธฒเธเธฒเธฃเธขเน...');
  const user = getLogUser();
  
  google.script.run
    .withSuccessHandler(res => {
      setLoading(false);
      if (res && res.success) {
        showToast('เธเธฑเธเธ—เธถเธเธเธฃเธฐเธงเธฑเธ•เธดเธเธธเธ“เธเธฃเธนเธชเธณเน€เธฃเนเธ!', 'success');
        closeTeacherModal();
        loadTeacherProfiles();
      } else {
        showToast('เธเธฒเธฃเธเธฑเธเธ—เธถเธเธเธฑเธ”เธเนเธญเธ: ' + res.error, 'error');
      }
    })
    .withFailureHandler(err => {
      setLoading(false);
      showToast('เธเธฒเธฃเน€เธเธทเนเธญเธกเธ•เนเธญเธฅเนเธกเน€เธซเธฅเธง: ' + err.message, 'error');
    })
    .saveTeacherProfile(teacherData, user);
}

function runTeacherPayCalculation() {
  const teacher = document.getElementById('calc_teacher_select').value;
  const start = document.getElementById('calc_start_date').value;
  const end = document.getElementById('calc_end_date').value;
  
  if (!teacher) {
    showToast('เธเธฃเธธเธ“เธฒเธฃเธฐเธเธธเธเธทเนเธญเธเธฃเธนเน€เธเธทเนเธญเธเธฃเธฐเธกเธงเธฅเธเธฅ', 'warning');
    return;
  }
  if (!start || !end) {
    showToast('เธเธฃเธธเธ“เธฒเธฃเธฐเธเธธเธเนเธงเธเธงเธฑเธเธ—เธตเนเน€เธฃเธดเนเธกเธ•เนเธเนเธฅเธฐเธชเธดเนเธเธชเธธเธ”เธเธฒเธฃเธเธฃเธฐเธกเธงเธฅเธเธฅ', 'warning');
    return;
  }
  
  setLoading(true, 'เธเธณเธฅเธฑเธเธเธฃเธฐเธกเธงเธฅเธเธฅเธเธฑเนเธงเนเธกเธเธชเธญเธเนเธฅเธฐเธ•เธฒเธฃเธฒเธเธเธณเธเธงเธ“เน€เธเธดเธเธเนเธฒเนเธฃเธเธ•เธฒเธกเธชเธนเธ•เธฃเธเธญเธเธเธธเธ“เธเธฃเธน...');
  google.script.run
    .withSuccessHandler(res => {
      setLoading(false);
      if (res && res.success) {
        renderTeacherPayResult(res);
      } else {
        showToast('เธเธฃเธฐเธกเธงเธฅเธเธฅเธเธฒเธฃเธเนเธฒเธขเธเนเธฒเธชเธญเธเธฅเนเธกเน€เธซเธฅเธง: ' + res.error, 'error');
      }
    })
    .withFailureHandler(err => {
      setLoading(false);
      showToast('เธเธฒเธฃเธ•เธดเธ”เธ•เนเธญเธเธดเธ”เธเธฅเธฒเธ”: ' + err.message, 'error');
    })
    .calculateTeacherMonthlyPay(teacher, start, end);
}

function renderTeacherPayResult(res) {
  document.getElementById('calc_result_card').style.display = 'block';
  if (document.getElementById('calc_result_title')) document.getElementById('calc_result_title').innerText= 'เธชเธฃเธธเธเธเธฒเธเธชเธญเธเธเธฃเธฐเธเธณเธเธงเธ”เธเธญเธ ' + res.teacher;
  if (document.getElementById('calc_result_total_pay')) document.getElementById('calc_result_total_pay').innerText= 'เธฃเธฒเธขเนเธ”เนเธชเธธเธ—เธเธด: เธฟ' + res.totalPay.toLocaleString();
  if (document.getElementById('calc_result_total_hours')) document.getElementById('calc_result_total_hours').innerText= res.totalHours.toLocaleString() + ' เธเธก.';
  if (document.getElementById('calc_result_total_classes')) document.getElementById('calc_result_total_classes').innerText= res.classes.length.toLocaleString() + ' เธเธฅเธฒเธช';
  
  const tbody = document.getElementById('calc_details_tbody');
  tbody.innerHTML = '';
  
  res.classes.forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${formatDateToThai(c.date)}</td>
      <td><div style="font-weight:600;">${c.subject}</div></td>
      <td>${c.room || '-'}</td>
      <td>${c.hours} เธเธก.</td>
      <td style="text-align: center;">${c.numKids} เธเธ</td>
      <td style="text-align: right;">เธฟ${c.rate.toLocaleString()}</td>
      <td style="text-align: right; font-weight:600; color:var(--color-success);">เธฟ${c.pay.toLocaleString()}</td>
      <td style="font-size:0.75rem; color:var(--text-muted);">${c.role}</td>
    `;
    tbody.appendChild(tr);
  });
  
  if (res.classes.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 40px;">เนเธกเนเธเธเธฃเธฒเธขเธเธฒเธฃเธชเธญเธเธเธญเธเธเธธเธ“เธเธฃเธนเนเธเธเนเธงเธเน€เธงเธฅเธฒเธ—เธตเนเธฃเธฐเธเธธ</td></tr>`;
  }
}

// ----------------------------------------------------
// 9. Manager Work Hour Logs (เน€เธงเธฅเธฒเธเธนเนเธเธฑเธ”เธเธฒเธฃ)
// ----------------------------------------------------
function loadManagerLogs() {
  setLoading(true, 'เธเธณเธฅเธฑเธเธ”เธถเธเธเธฃเธฐเธงเธฑเธ•เธดเธเธฒเธฃเน€เธเนเธฒเธเธฒเธเธเธญเธเธเธนเนเธเธฑเธ”เธเธฒเธฃ...');
  google.script.run
    .withSuccessHandler(data => {
      setLoading(false);
      if (Array.isArray(data)) {
        state.managerLogs = data;
        renderManagerLogsTable();
      } else {
        showToast('เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เนเธซเธฅเธ”เธเนเธญเธกเธนเธฅเธเธนเนเธเธฑเธ”เธเธฒเธฃเนเธ”เน: ' + (data ? data.error : 'unknown'), 'error');
      }
    })
    .withFailureHandler(err => {
      setLoading(false);
      showToast('เธ”เธถเธเธเนเธญเธกเธนเธฅเธเธดเธ”เธเธฅเธฒเธ”: ' + err.message, 'error');
    })
    .getManagerOTLogs();
}

function renderManagerLogsTable() {
  const tbody = document.getElementById('manager_logs_tbody');
  tbody.innerHTML = '';
  const displayLogs = state.managerLogs.slice(-30).reverse();
  
  displayLogs.forEach(log => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${formatDateToThai(log.date)}</td>
      <td><div style="font-weight:600;">${log.managerName}</div></td>
      <td>${log.workIn || '-'} - ${log.workOut || '-'} (${log.workHours || '0'} เธเธก.)</td>
      <td>${log.otIn || '-'} - ${log.otOut || '-'} (${log.otHours || '0'} เธเธก.)</td>
      <td>${log.otDetail || '-'}</td>
      <td>${log.isPresent ? '<span class="badge badge-success">เธกเธฒเธเธเธดเธเธฑเธ•เธดเธเธฒเธ</span>' : '<span class="badge badge-danger">เธซเธขเธธเธ”เธเธฒเธ</span>'}</td>
    `;
    tbody.appendChild(tr);
  });
  
  if (displayLogs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 40px;">เนเธกเนเธกเธตเธเธฃเธฐเธงเธฑเธ•เธดเธเธฒเธฃเธเธฑเธเธ—เธถเธเน€เธงเธฅเธฒเธเธญเธเธเธนเนเธเธฑเธ”เธเธฒเธฃ</td></tr>`;
  }
}

function showAddManagerLogModal() {
  document.getElementById('manager_form').reset();
  if (document.getElementById('manager_date')) document.getElementById('manager_date').value= getTodayString();
  document.getElementById('manager_modal').classList.add('active');
}

function closeManagerLogModal() {
  document.getElementById('manager_modal').classList.remove('active');
}

function saveManagerLog(e) {
  e.preventDefault();
  
  const logData = {
    managerName: document.getElementById('manager_name').value,
    workIn: document.getElementById('manager_work_in').value,
    workOut: document.getElementById('manager_work_out').value,
    otIn: document.getElementById('manager_ot_in').value,
    otOut: document.getElementById('manager_ot_out').value,
    otDetail: document.getElementById('manager_ot_detail').value.trim(),
    isPresent: document.getElementById('manager_status_present').checked,
    isAbsent: document.getElementById('manager_status_absent').checked,
    date: convertDateToSheet(document.getElementById('manager_date').value),
    workHours: '',
    otHours: ''
  };
  
  if (logData.workIn && logData.workOut) {
    const sParts = logData.workIn.split(':');
    const eParts = logData.workOut.split(':');
    const diff = (parseInt(eParts[0]) * 60 + parseInt(eParts[1])) - (parseInt(sParts[0]) * 60 + parseInt(sParts[1]));
    if (diff > 0) logData.workHours = `${Math.floor(diff/60)}:${diff%60 < 10 ? '0'+(diff%60) : diff%60}`;
  }
  
  if (logData.otIn && logData.otOut) {
    const sParts = logData.otIn.split(':');
    const eParts = logData.otOut.split(':');
    const diff = (parseInt(eParts[0]) * 60 + parseInt(eParts[1])) - (parseInt(sParts[0]) * 60 + parseInt(sParts[1]));
    if (diff > 0) logData.otHours = `${Math.floor(diff/60)}:${diff%60 < 10 ? '0'+(diff%60) : diff%60}`;
  }
  
  setLoading(true, 'เธเธณเธฅเธฑเธเธเธฑเธเธ—เธถเธเน€เธงเธฅเธฒเน€เธเนเธฒเธเธฒเธ...');
  const user = getLogUser();
  
  google.script.run
    .withSuccessHandler(res => {
      setLoading(false);
      if (res && res.success) {
        showToast('เธเธฑเธเธ—เธถเธเน€เธงเธฅเธฒเธฅเธเธเธทเนเธญเน€เธชเธฃเนเธเธชเธกเธเธนเธฃเธ“เน!', 'success');
        closeManagerLogModal();
        loadManagerLogs();
      } else {
        showToast('เธเธฑเธเธ—เธถเธเธฅเนเธกเน€เธซเธฅเธง: ' + res.error, 'error');
      }
    })
    .withFailureHandler(err => {
      setLoading(false);
      showToast('เน€เธเธทเนเธญเธกเธ•เนเธญเธเธดเธ”เธเธฅเธฒเธ”: ' + err.message, 'error');
    })
    .addManagerLog(logData, user);
}

// ----------------------------------------------------
// 10. Audit Log Panel logic (เธฃเธฒเธขเธเธฒเธเธเธฒเธฃเนเธเนเธฃเธฐเธเธ)
// ----------------------------------------------------
function loadActivityLogs() {
  setLoading(true, 'เธเธณเธฅเธฑเธเธ”เธถเธเธฃเธฒเธขเธเธฒเธเธเธฃเธฐเธงเธฑเธ•เธดเธเธฒเธฃเน€เธเนเธฒเนเธเนเธเธฒเธเธฃเธฐเธเธ...');
  google.script.run
    .withSuccessHandler(data => {
      setLoading(false);
      if (Array.isArray(data)) {
        renderActivityLogsTable(data);
      } else {
        showToast('เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เธ”เธถเธเธฃเธฒเธขเธเธฒเธ Audit Log เนเธ”เน: ' + (data ? data.error : 'unknown'), 'error');
      }
    })
    .withFailureHandler(err => {
      setLoading(false);
      showToast('เน€เธเธทเนเธญเธกเธ•เนเธญเธ”เธถเธเธเนเธญเธกเธนเธฅเธฅเนเธกเน€เธซเธฅเธง: ' + err.message, 'error');
    })
    .getActivityLogs();
}

function renderActivityLogsTable(logs) {
  const tbody = document.getElementById('activity_logs_tbody');
  tbody.innerHTML = '';
  
  logs.forEach(log => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="color:var(--text-muted);">${formatDateTimeToThaiLong(log.timestamp)}</td>
      <td><span class="badge badge-info">${log.user}</span></td>
      <td style="font-weight:600;">${log.action}</td>
      <td>${log.details}</td>
    `;
    tbody.appendChild(tr);
  });
  
  if (logs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 40px;">เนเธกเนเธกเธตเธเนเธญเธกเธนเธฅเธเธฃเธฐเธงเธฑเธ•เธดเธเธฒเธฃเธ—เธณเธเธธเธฃเธเธฃเธฃเธกเนเธเธฃเธฐเธเธ</td></tr>`;
  }
}

// ----------------------------------------------------
// Version 53.8 New UI Helper Functions
// ----------------------------------------------------

function formatDateToThaiShort(dateStr) {
  return formatDateTimeToThaiLong(dateStr);
}

function toggleRecurringDate() {
  const isRecurring = document.getElementById('class_is_recurring').checked;
  const container = document.getElementById('class_recurring_end_container');
  container.style.display = isRecurring ? 'block' : 'none';
  if (isRecurring) {
    const today = new Date();
    today.setMonth(today.getMonth() + 1);
    let day = today.getDate();
    let month = today.getMonth() + 1;
    const year = today.getFullYear();
    if (day < 10) day = '0' + day;
    if (month < 10) month = '0' + month;
    if (document.getElementById('class_recurring_end_date')) document.getElementById('class_recurring_end_date').value= `${year}-${month}-${day}`;
  }
}

function loadDebtors() {
  setLoading(true, 'เธเธณเธฅเธฑเธเธ”เธถเธเธฃเธฒเธขเธเธทเนเธญเธเธฑเธเน€เธฃเธตเธขเธเธเนเธฒเธเธเธณเธฃเธฐ...');
  google.script.run
    .withSuccessHandler(students => {
      setLoading(false);
      if (Array.isArray(students)) {
        state.students = students;
        renderDebtorsTable();
      } else {
        showToast('เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เธ”เธถเธเธเนเธญเธกเธนเธฅเธฃเธฒเธขเธเธทเนเธญเนเธ”เน: ' + (students ? students.error : 'unknown'), 'error');
      }
    })
    .withFailureHandler(err => {
      setLoading(false);
      showToast('เน€เธเธทเนเธญเธกเธ•เนเธญเธเธดเธ”เธเธฅเธฒเธ”: ' + err.message, 'error');
    })
    .getStudentsList();
}

function renderDebtorsTable() {
  const tbody = document.getElementById('debtors_tbody');
  tbody.innerHTML = '';
  
  const debtors = state.students.filter(s => s.outstanding > 0);
  
  if (debtors.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 40px;">๐ เนเธกเนเธกเธตเธเธฑเธเน€เธฃเธตเธขเธเธเนเธฒเธเธเธณเธฃเธฐเน€เธเธดเธเธเนเธฒเน€เธฃเธตเธขเธเนเธเธฃเธฐเธเธ</td></tr>`;
    return;
  }
  
  debtors.forEach(s => {
    const tr = document.createElement('tr');
    
    const nameText = `
      <div style="font-weight:600; color:var(--text-main); cursor:pointer;" onclick="showStudentHistoryModal('${s.name}', '${s.nickname}')">
        ๐‘ค ${s.name} (${s.nickname})
      </div>
      <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">
        เธชเธฒเธเธฒเน€เธฃเธตเธขเธ: ${s.branchLearn || '-'} | เนเธฅเธเน: ${s.lineName || '-'}
      </div>
    `;
    
    const courseText = `
      <div style="font-weight:500;">${s.round || '-'}</div>
      <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">เธเธฑเนเธ: ${s.grade || '-'} ${s.classSection || ''}</div>
    `;
    
    tr.innerHTML = `
      <td>${nameText}</td>
      <td>${courseText}</td>
      <td style="text-align: right; font-weight: 500;">เธฟ${s.full.toLocaleString()}</td>
      <td style="text-align: right; font-weight: 500; color: var(--color-success);">เธฟ${s.paid.toLocaleString()}</td>
      <td style="text-align: right; font-weight: 700; color: var(--color-danger);">เธฟ${s.outstanding.toLocaleString()}</td>
      <td><span class="badge badge-info">${s.classType || 'เน€เธ”เธตเนเธขเธง'}</span></td>
      <td>${formatDateTimeToThaiLong(s.paymentDate) || '-'}</td>
      <td>
        <button class="btn btn-primary btn-icon" onclick="showDebtorPaymentModal('${s.id}', '${s.name}', '${s.round}', ${s.outstanding})" title="เธเธฑเธเธ—เธถเธเธเธณเธฃเธฐเน€เธเธดเธ">
          ๐ช เธเนเธฒเธขเน€เธเธดเธ
        </button>
      </td>
    `;
    
    tbody.appendChild(tr);
  });
}

function showDebtorPaymentModal(id, name, courseName, balance) {
  if (document.getElementById('dp_student_id')) document.getElementById('dp_student_id').value= id;
  if (document.getElementById('dp_student_display_name')) document.getElementById('dp_student_display_name').innerText= `เธเธฑเธเน€เธฃเธตเธขเธ: ${name}`;
  if (document.getElementById('dp_course_display_name')) document.getElementById('dp_course_display_name').innerText= `เธเธญเธฃเนเธช: ${courseName}`;
  if (document.getElementById('dp_balance_display')) document.getElementById('dp_balance_display').innerText= `เธขเธญเธ”เธเนเธฒเธเธเนเธฒเธขเน€เธ”เธดเธก: เธฟ${balance.toLocaleString()}`;
  if (document.getElementById('dp_paid')) document.getElementById('dp_paid').value= balance;
  if (document.getElementById('dp_payment_date')) document.getElementById('dp_payment_date').value= getTodayString();
  if (document.getElementById('dp_staff')) document.getElementById('dp_staff').value= getLogUser() || '';
  
  const channelSelect = document.getElementById('dp_payment_channel');
  channelSelect.innerHTML = '';
  
  const regChannelSelect = document.getElementById('student_pay_channel');
  if (regChannelSelect) {
    channelSelect.innerHTML = regChannelSelect.innerHTML;
  } else {
    const channels = ['เธเธชเธดเธเธฃ เธเธฑเธเธเธตเธเธฃเธดเธฉเธฑเธ—', 'เน€เธเธดเธเธชเธ”', 'เนเธญเธเน€เธเธดเธเธเธฑเธเธเธตเธญเธทเนเธ'];
    channels.forEach(ch => {
      const opt = document.createElement('option');
      opt.value = ch;
      opt.innerText = ch;
      channelSelect.appendChild(opt);
    });
  }
  
  document.getElementById('debtor_payment_modal').classList.add('active');
}

function closeDebtorPaymentModal() {
  document.getElementById('debtor_payment_modal').classList.remove('active');
}

function saveDebtorPayment(e) {
  e.preventDefault();
  const id = document.getElementById('dp_student_id').value;
  const paid = parseFloat(document.getElementById('dp_paid').value) || 0;
  const dateVal = document.getElementById('dp_payment_date').value;
  const paymentDate = convertDateToSheet(dateVal);
  const paymentChannel = document.getElementById('dp_payment_channel').value;
  const staff = document.getElementById('dp_staff').value.trim();
  
  if (paid <= 0) {
    showToast('เธเธฃเธธเธ“เธฒเธฃเธฐเธเธธเธเธณเธเธงเธเน€เธเธดเธเธ—เธตเนเธเธณเธฃเธฐเธ—เธตเนเธ–เธนเธเธ•เนเธญเธ', 'error');
    return;
  }
  
  const paymentData = {
    paid: paid,
    paymentDate: paymentDate,
    paymentChannel: paymentChannel,
    staff: staff
  };
  
  setLoading(true, 'เธเธณเธฅเธฑเธเธเธฑเธเธ—เธถเธเธเธฒเธฃเธเธณเธฃเธฐเน€เธเธดเธ...');
  const user = getLogUser();
  google.script.run
    .withSuccessHandler(res => {
      setLoading(false);
      if (res && res.success) {
        showToast('เธเธฑเธเธ—เธถเธเธเธฒเธฃเธเธณเธฃเธฐเน€เธเธดเธเธเนเธฒเธเธเนเธฒเธขเธชเธณเน€เธฃเนเธเนเธฅเนเธง!', 'success');
        closeDebtorPaymentModal();
        loadDebtors();
        loadStudents();
      } else {
        showToast('เธเธฑเธเธ—เธถเธเนเธกเนเธชเธณเน€เธฃเนเธ: ' + (res ? res.error : 'unknown'), 'error');
      }
    })
    .withFailureHandler(err => {
      setLoading(false);
      showToast('เน€เธเธทเนเธญเธกเธ•เนเธญเธเธดเธ”เธเธฅเธฒเธ”: ' + err.message, 'error');
    })
    .updateStudentPaymentDetails(id, paymentData, user);
}

function showStudentHistoryModal(name, nickname) {
  if (!name) return;
  if (document.getElementById('history_student_info')) document.getElementById('history_student_info').innerHTML= `<strong>เธเธณเธฅเธฑเธเนเธซเธฅเธ”เธเธฃเธฐเธงเธฑเธ•เธดเธเธญเธ:</strong> ${name} ${nickname ? '('+nickname+')' : ''}...`;
  if (document.getElementById('history_courses_tbody')) document.getElementById('history_courses_tbody').innerHTML= `<tr><td colspan="8" style="text-align: center;">เธเธณเธฅเธฑเธเนเธซเธฅเธ”เธเนเธญเธกเธนเธฅเธเธญเธฃเนเธช...</td></tr>`;
  if (document.getElementById('history_lessons_tbody')) document.getElementById('history_lessons_tbody').innerHTML= `<tr><td colspan="6" style="text-align: center;">เธเธณเธฅเธฑเธเนเธซเธฅเธ”เธเธฃเธฐเธงเธฑเธ•เธดเน€เธเนเธฒเน€เธฃเธตเธขเธ...</td></tr>`;
  
  document.getElementById('student_history_modal').classList.add('active');
  
  google.script.run
    .withSuccessHandler(res => {
      if (res && res.success) {
        renderStudentHistory(name, nickname, res.courses, res.classes);
      } else {
        if (document.getElementById('history_student_info')) document.getElementById('history_student_info').innerText= 'เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เธ”เธถเธเธเนเธญเธกเธนเธฅเธเธฃเธฐเธงเธฑเธ•เธดเนเธ”เน: ' + (res ? res.error : 'unknown');
      }
    })
    .withFailureHandler(err => {
      if (document.getElementById('history_student_info')) document.getElementById('history_student_info').innerText= 'เน€เธเธทเนเธญเธกเธ•เนเธญเธฅเนเธกเน€เธซเธฅเธง: ' + err.message;
    })
    .getStudentHistoryData(name, nickname);
}

function renderStudentHistory(name, nickname, courses, classes) {
  const infoPanel = document.getElementById('history_student_info');
  infoPanel.innerHTML = `
    <div style="font-weight: 700; font-size: 1.1rem; color: var(--color-primary-hover);">๐‘ค ${name} ${nickname ? '(' + nickname + ')' : ''}</div>
    <div style="margin-top: 6px; display: flex; gap: 15px; flex-wrap: wrap;">
      <span><strong>เธเธญเธฃเนเธชเธ—เธฑเนเธเธซเธกเธ”:</strong> ${courses.length} เธเธญเธฃเนเธช</span>
      <span><strong>เน€เธเนเธฒเน€เธฃเธตเธขเธเธ—เธฑเนเธเธซเธกเธ”:</strong> ${classes.length} เธเธฅเธฒเธช</span>
    </div>
  `;
  
  const coursesTbody = document.getElementById('history_courses_tbody');
  coursesTbody.innerHTML = '';
  
  if (courses.length === 0) {
    coursesTbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">เนเธกเนเธเธเธเธฃเธฐเธงเธฑเธ•เธดเธเธญเธฃเนเธชเน€เธฃเธตเธขเธ</td></tr>`;
  } else {
    courses.forEach(c => {
      const tr = document.createElement('tr');
      
      const totalHours = c.classType.indexOf('เธขเนเธญเธข') !== -1 ? 16 : 8;
      const ratePerHour = c.full / totalHours;
      const minsLeft = parseHoursLeftToMinutes(c.hoursLeft);
      const remainingValue = (minsLeft / 60) * ratePerHour;
      
      const isLowValue = remainingValue < 500;
      if (isLowValue) {
        tr.style.backgroundColor = '#ffebee';
      }
      
      tr.innerHTML = `
        <td style="font-weight: 600;">${c.courseName || '-'}</td>
        <td><span class="badge badge-info">${c.classType || 'เน€เธ”เธตเนเธขเธง'}</span></td>
        <td style="text-align: right;">เธฟ${c.full.toLocaleString()}</td>
        <td style="text-align: right; color: var(--color-success);">เธฟ${c.paid.toLocaleString()}</td>
        <td style="text-align: right; color: var(--color-danger); font-weight: 600;">เธฟ${c.outstanding.toLocaleString()}</td>
        <td style="text-align: center;">${c.hours || '-'}</td>
        <td style="text-align: center; font-weight: 600; ${minsLeft <= 0 ? 'color: var(--color-danger);' : ''}">${c.hoursLeft || '-'}</td>
        <td>${formatDateTimeToThaiLong(c.paymentDate) || '-'}</td>
      `;
      coursesTbody.appendChild(tr);
    });
  }
  
  const lessonsTbody = document.getElementById('history_lessons_tbody');
  lessonsTbody.innerHTML = '';
  
  if (classes.length === 0) {
    lessonsTbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">เนเธกเนเธเธเธเธฃเธฐเธงเธฑเธ•เธดเธเธฒเธฃเน€เธเนเธฒเน€เธฃเธตเธขเธ</td></tr>`;
  } else {
    classes.forEach(c => {
      const tr = document.createElement('tr');
      
      let statusText = '';
      if (c.isPresentLive > 0) statusText += `<span class="badge badge-success" style="margin-right:2px;">เธชเธ” (${c.isPresentLive})</span>`;
      if (c.isPresentOnline > 0) statusText += `<span class="badge badge-info" style="margin-right:2px;">เธญเธญเธ (${c.isPresentOnline})</span>`;
      if (c.isLeave > 0) statusText += `<span class="badge badge-warning" style="margin-right:2px;">เธฅเธฒ (${c.isLeave})</span>`;
      if (c.isAbsent > 0) statusText += `<span class="badge badge-danger" style="margin-right:2px;">เธเธฒเธ” (${c.isAbsent})</span>`;
      if (c.isMakeup > 0) statusText += `<span class="badge" style="background-color: #c095e7; color: white; margin-right:2px;">เธเธ” (${c.isMakeup})</span>`;
      
      const teacherText = c.teacherSub ? `${c.teacherRegular} <span style="font-size:0.75rem; color:var(--text-muted);">(เธชเธญเธเนเธ—เธ: ${c.teacherSub})</span>` : c.teacherRegular;
      
      tr.innerHTML = `
        <td>${formatDateTimeToThaiLong(c.date) || '-'}</td>
        <td>${c.timeStart} - ${c.timeEnd} (${c.hours} เธเธก.)</td>
        <td>
          <div style="font-weight: 600;">${c.subject}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${c.roomBranch || '-'}</div>
        </td>
        <td>${teacherText}</td>
        <td>${statusText || '-'}</td>
        <td style="font-size: 0.8rem; color: var(--text-muted);">${c.note || '-'}</td>
      `;
      lessonsTbody.appendChild(tr);
    });
  }
}

function closeStudentHistoryModal() {
  document.getElementById('student_history_modal').classList.remove('active');
}

function parseHoursLeftToMinutes(str) {
  if (!str) return 0;
  const isNeg = str.indexOf('-') !== -1;
  const matches = str.match(/(\d+)\s*เธเธก\.\s*(\d+)\s*เธเธฒเธ—เธต/);
  if (!matches) {
    const num = parseFloat(str);
    if (isNaN(num)) return 0;
    return num * 60;
  }
  const hrs = parseInt(matches[1], 10) || 0;
  const mins = parseInt(matches[2], 10) || 0;
  const total = hrs * 60 + mins;
  return isNeg ? -total : total;
}

// ----------------------------------------------------
// Print Receipts Logic
// ----------------------------------------------------
function loadReceipts() {
  setLoading(true, 'เธเธณเธฅเธฑเธเธ”เธถเธเธฃเธฒเธขเธเธทเนเธญเธเธฑเธเน€เธฃเธตเธขเธ...');
  google.script.run
    .withSuccessHandler(data => {
      setLoading(false);
      if (Array.isArray(data)) {
        state.students = data;
        renderReceiptsTable();
      } else {
        showToast('เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เนเธซเธฅเธ”เธเนเธญเธกเธนเธฅเธฃเธฒเธขเธเธทเนเธญเน€เธเธทเนเธญเธญเธญเธเนเธเน€เธชเธฃเนเธเนเธ”เน: ' + (data ? data.error : 'unknown'), 'error');
      }
    })
    .withFailureHandler(err => {
      setLoading(false);
      showToast('เธ”เธถเธเธเนเธญเธกเธนเธฅเธฃเธฒเธขเธเธทเนเธญเธฅเนเธกเน€เธซเธฅเธง: ' + err.message, 'error');
    })
    .getStudentsList();
}

function renderReceiptsTable() {
  const query = document.getElementById('receipt_search').value.toLowerCase().trim();
  const tbody = document.getElementById('receipts_tbody');
  tbody.innerHTML = '';
  
  if (!state.students || state.students.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 40px;">เนเธกเนเธเธเธเนเธญเธกเธนเธฅเธเธฑเธเน€เธฃเธตเธขเธ</td></tr>';
    return;
  }
  
  const filtered = state.students.filter(s => {
    return s.name.toLowerCase().includes(query) || 
           s.nickname.toLowerCase().includes(query) || 
           (s.classType && s.classType.toLowerCase().includes(query)) ||
           (s.grade && s.grade.toLowerCase().includes(query));
  });
  
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 40px;">เนเธกเนเธเธเธเธฅเธฅเธฑเธเธเนเธเธฒเธฃเธเนเธเธซเธฒ</td></tr>';
    return;
  }
  
  filtered.forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div style="font-weight: 600; color: var(--color-primary-hover); cursor: pointer;" onclick="showStudentHistoryModal('${s.name}', '${s.nickname}')">๐‘ค ${s.name} (${s.nickname})</div>
        <div style="font-size: 0.8rem; color: var(--text-muted);">เธชเธฒเธเธฒเน€เธฃเธตเธขเธ: ${s.branchLearn || '-'} | Line: ${s.lineName || '-'}</div>
      </td>
      <td>
        <div>${s.classType || ''} ${s.grade || ''}</div>
        <div style="font-size: 0.8rem; color: var(--text-muted);">${s.classHours ? `เธเธณเธเธงเธ ${s.classHours} เธเธก.` : ''}</div>
      </td>
      <td style="text-align: right; font-weight: 600;">เธฟ${(s.full || 0).toLocaleString()}</td>
      <td style="text-align: right; font-weight: 600; color: var(--color-success);">เธฟ${(s.paid || 0).toLocaleString()}</td>
      <td style="text-align: right; font-weight: 600; color: ${s.outstanding > 0 ? 'var(--color-danger)' : 'var(--text-muted)'};">เธฟ${(s.outstanding || 0).toLocaleString()}</td>
      <td>
        <div>${formatDateTimeToThaiLong(s.paymentDate) || '-'}</div>
        <div style="font-size: 0.8rem; color: var(--text-muted);">${s.paymentChannel || ''}</div>
      </td>
      <td>
        <button class="btn btn-primary" onclick="showPrintReceiptModal('${s.id}')" style="padding: 6px 12px; font-size: 0.85rem;">๐“ เธญเธญเธเนเธเน€เธชเธฃเนเธ</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function cleanSubjectName(roundStr) {
  if (!roundStr) return '';
  let str = roundStr.toString().trim();
  
  // 1. Remove parenthesized text like (xxxx) or ( xxxx )
  // Also remove nickname before parentheses if it exists, like เธชเธเธฒเธข(เธ•เธฃเธตเน€เธเธเธฃ ) or เนเธเนเธกเธธเธ (เธเธธเธเธชเธดเธ•เธฒ)
  str = str.replace(/^[^\(]+\([^\)]*\)\s*/, '');
  
  // 2. Identify grade
  let grade = '';
  const gradeMatch = str.match(/(เธก\.[1-6]|เธ\.[1-6]|เธญเธเธธเธเธฒเธฅ|M[1-6]|P[1-6])/i);
  if (gradeMatch) {
    grade = gradeMatch[0];
    if (grade.toUpperCase().startsWith('M')) {
      grade = 'เธก.' + grade.substring(1);
    } else if (grade.toUpperCase().startsWith('P')) {
      grade = 'เธ.' + grade.substring(1);
    }
  }
  
  // 3. Identify subject
  let subject = '';
  const subjects = ['เธเธ“เธดเธ•', 'เธงเธดเธ—เธขเน', 'เธญเธฑเธเธเธคเธฉ', 'เนเธ—เธข', 'เธชเธฑเธเธเธก', 'เธเธดเธชเธดเธเธชเน', 'เน€เธเธกเธต', 'เธเธตเธงเธฐ', 'เธ”เธฒเธฃเธฒเธจเธฒเธชเธ•เธฃเน', 'เธจเธดเธฅเธเธฐ', 'เธเธญเธก'];
  for (const sub of subjects) {
    if (str.includes(sub)) {
      subject = sub;
      break;
    }
  }
  
  // 4. If both subject and grade are found, format as "subject grade" (e.g., "เธเธ“เธดเธ• เธก.2")
  if (subject && grade) {
    return `${subject} ${grade}`;
  }
  
  // 5. Fallback: If no subject is found but we have grade, return cleaned roundStr
  let cleaned = roundStr.replace(/^[^\(]+\([^\)]*\)\s*/, '');
  cleaned = cleaned.replace(/เน€เธ”เธตเนเธขเธง/g, '').replace(/\s+/g, ' ').trim();
  return cleaned;
}

function showPrintReceiptModal(studentId) {
  const s = state.students.find(x => x.id === studentId);
  if (!s) {
    showToast('เนเธกเนเธเธเธเนเธญเธกเธนเธฅเธเธฑเธเน€เธฃเธตเธขเธเธฃเธฒเธขเธเธตเน', 'error');
    return;
  }
  
  setLoading(true, 'เธเธณเธฅเธฑเธเธ”เธถเธเธเนเธญเธกเธนเธฅเธงเธดเธเธฒเน€เธฃเธตเธขเธเธญเธขเนเธฒเธเธฅเธฐเน€เธญเธตเธขเธ”เธเธญเธเธเธฑเธเน€เธฃเธตเธขเธ...');
  
  google.script.run
    .withSuccessHandler(courses => {
      setLoading(false);
      
      // Set customer info
      if (document.getElementById('pr_customer')) document.getElementById('pr_customer').value= s.name + (s.nickname ? ' (' + s.nickname + ')' : '');
      if (document.getElementById('pr_phone')) document.getElementById('pr_phone').value= formatPhone(s.contact) || '';
      
      // Generate date in Thai Buddhist year (local year is 2026 -> 2569)
      if (document.getElementById('pr_date')) document.getElementById('pr_date').value= formatDateTimeToThaiLong(new Date());
      
      // Generate receipt number e.g., 69-0012
      const yearBE = new Date().getFullYear() + 543;
      const shortYear = yearBE.toString().slice(-2);
      const studentIndex = state.students.indexOf(s) + 1;
      if (document.getElementById('pr_number')) document.getElementById('pr_number').value= `${shortYear}-${String(studentIndex).padStart(4, '0')}`;
      
      // Default Tax ID
      if (document.getElementById('pr_tax_id')) document.getElementById('pr_tax_id').value= '0215562010486';
      if (document.getElementById('pr_address')) document.getElementById('pr_address').value= 'เธญ.เน€เธกเธทเธญเธ เธ.เธฃเธฐเธขเธญเธ 21000';
      
      // Clear all 10 description and amount inputs
      for (let i = 1; i <= 10; i++) {
        document.getElementById(`pr_desc_${i}`).value = '';
        document.getElementById(`pr_amount_${i}`).value = '';
      }
      
      // Populate courses from server results
      if (Array.isArray(courses) && courses.length > 0) {
        courses.forEach((c, idx) => {
          if (idx < 10) {
            const itemNum = idx + 1;
            const typeLabel = c.classType.includes('เธเธฅเธธเนเธกเธซเธฅเธฑเธ') || c.classType.includes('เธซเธฅเธฑเธ') ? 'เธซเธฅเธฑเธ' : c.classType;
            const dayTimeStr = c.dayTime ? `(${c.dayTime}) ` : '';
            const descStr = `${typeLabel} ${c.courseName} ${dayTimeStr}(เธฟ${c.price})`;
            
            document.getElementById(`pr_desc_${itemNum}`).value = descStr;
            document.getElementById(`pr_amount_${itemNum}`).value = c.price;
          }
        });
      } else {
        // Fallback to basic registration info if no detailed courses found
        const matches = state.students.filter(x => x.name === s.name && x.nickname === s.nickname);
        matches.forEach((m, idx) => {
          if (idx < 10) {
            const itemNum = idx + 1;
            document.getElementById(`pr_desc_${itemNum}`).value = cleanSubjectName(m.round) || m.classSection || '';
            document.getElementById(`pr_amount_${itemNum}`).value = m.paid > 0 ? m.paid : (m.full || 0);
          }
        });
      }
      
      // Notes: default to empty
      if (document.getElementById('pr_note_1')) document.getElementById('pr_note_1').value= '';
      if (document.getElementById('pr_note_2')) document.getElementById('pr_note_2').value= '';
      if (document.getElementById('pr_note_3')) document.getElementById('pr_note_3').value= '';
      
      // Payment channel
      const payChannel = s.paymentChannel || '';
      if (payChannel.toLowerCase().includes('เธชเธ”')) {
        if (document.getElementById('pr_payment_method')) document.getElementById('pr_payment_method').value= 'เน€เธเธดเธเธชเธ”';
      } else {
        if (document.getElementById('pr_payment_method')) document.getElementById('pr_payment_method').value= 'เน€เธเธดเธเนเธญเธ';
      }
      
      if (document.getElementById('pr_staff')) document.getElementById('pr_staff').value= s.staff || getLogUser() || '';
      
      // Auto-select branch based on s.branchLearn
      let studentBranch = '1';
      if (s.branchLearn && s.branchLearn.indexOf('2') !== -1) {
        studentBranch = '2';
      } else if (s.branchLearn && s.branchLearn.indexOf('3') !== -1) {
        studentBranch = '3';
      }
      if (document.getElementById('pr_branch_select')) document.getElementById('pr_branch_select').value= studentBranch;
      
      // Load branch details (address/phone)
      handleReceiptBranchChange();
      
      // Open modal
      document.getElementById('print_receipt_modal').classList.add('active');
    })
    .withFailureHandler(err => {
      setLoading(false);
      showToast('เธ”เธถเธเธเนเธญเธกเธนเธฅเธงเธดเธเธฒเน€เธฃเธตเธขเธเธฅเนเธกเน€เธซเธฅเธง: ' + err.message, 'error');
    })
    .getStudentDetailedCourses(s.name, s.nickname, s.grade, s.branchLearn, s.classType || 'เธเธฅเธธเนเธกเธซเธฅเธฑเธ');
}

function handleReceiptBranchChange() {
  updateReceiptPreview();
}

function closePrintReceiptModal() {
  document.getElementById('print_receipt_modal').classList.remove('active');
}

function updateReceiptPreview() {
  const prNum = document.getElementById('pr_number').value;
  const prDate = document.getElementById('pr_date').value;
  const prBranchSelect = document.getElementById('pr_branch_select').value;
  const prCustomer = document.getElementById('pr_customer').value;
  const prAddress = document.getElementById('pr_address').value;
  const prPhone = document.getElementById('pr_phone').value;
  const prTaxId = document.getElementById('pr_tax_id').value;

  const prNote1 = document.getElementById('pr_note_1').value;
  const prNote2 = document.getElementById('pr_note_2').value;
  const prNote3 = document.getElementById('pr_note_3').value;

  const prPaymentMethod = document.getElementById('pr_payment_method').value;
  const prStaff = document.getElementById('pr_staff').value;

  const logo1Base64 = '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';
  const logo2Base64 = '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';

  let itemsHtml = '';
  let totalAmount = 0;
  let rowCount = 0;

  for (let i = 1; i <= 10; i++) {
    const desc = document.getElementById(`pr_desc_${i}`).value.trim();
    const amt = parseFloat(document.getElementById(`pr_amount_${i}`).value) || 0;
    totalAmount += amt;
    if (desc || amt > 0) {
      rowCount++;
      itemsHtml += `
        <tr>
          <td style="text-align: center; padding: 4px !important;">${rowCount}</td>
          <td style="padding: 4px !important;">${desc || '-'}</td>
          <td style="text-align: right; font-weight: 600; padding: 4px !important;">${amt > 0 ? amt.toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '-'}</td>
        </tr>
      `;
    }
  }

  const minRows = 5;
  while (rowCount < minRows) {
    rowCount++;
    itemsHtml += `
      <tr>
        <td style="text-align: center; color: #ccc; padding: 4px !important;">${rowCount}</td>
        <td style="padding: 4px !important; color: #ccc;">-</td>
        <td style="text-align: right; color: #ccc; padding: 4px !important;">-</td>
      </tr>
    `;
  }

  const totalText = thaiBahtText(totalAmount);

  let branchAddressThai = '';
  let branchAddressEng = '';

  if (prBranchSelect === '1') {
    branchAddressThai = 'เธชเธณเธเธฑเธเธเธฒเธเนเธซเธเน : 103/20 เธเธญเธขเนเธชเธเธเธฑเธเธ—เธฃเน 5 เธ–เธเธเนเธชเธเธเธฑเธเธ—เธฃเน เธ•.เน€เธเธดเธเธเธฃเธฐ เธญ.เน€เธกเธทเธญเธ เธ.เธฃเธฐเธขเธญเธ 21000 เนเธ—เธฃ. 097-210-7050 , 065-518-1855';
    branchAddressEng = 'Head Office : 103/20 Soi Saengchan 5, Saengchan Road, Nernpra, Muang, Rayong 21000 Tel. 097-210-7050 , 065-518-1855';
  } else if (prBranchSelect === '2') {
    branchAddressThai = 'เธชเธฒเธเธฒ 2 : 2/17 เธ–เธเธเธงเธธเธ’เธดเธชเธฒเธฃ เธ•.เธ—เนเธฒเธเธฃเธฐเธ”เธนเน เธญ.เน€เธกเธทเธญเธ เธ.เธฃเธฐเธขเธญเธ 21000 เนเธ—เธฃ. 083-834-6067, 081-863-1311';
    branchAddressEng = 'Branch 2 : 2/17 Wuttisan Road, Tha Pradu, Muang, Rayong 21000 Tel. 083-834-6067, 081-863-1311';
  } else if (prBranchSelect === '3') {
    branchAddressThai = 'เธชเธฒเธเธฒ 3 : 13/7 เธก. 3 เธ–เธเธเธชเธธเธเธธเธกเธงเธดเธ— เธ•.เน€เธเธดเธเธเธฃเธฐ เธญ.เน€เธกเธทเธญเธ เธ.เธฃเธฐเธขเธญเธ 21000 เนเธ—เธฃ. 095-806-7979, 083-834-6067';
    branchAddressEng = 'Branch 3 : 13/7 Moo 3, Sukhumvit Road, Nernpra, Muang, Rayong 21000 Tel. 095-806-7979, 083-834-6067';
  }

  const cashChecked = prPaymentMethod === 'เน€เธเธดเธเธชเธ”' ? 'โ‘' : 'โ';
  const transferChecked = prPaymentMethod === 'เน€เธเธดเธเนเธญเธ' ? 'โ‘' : 'โ';

  const previewContainer = document.getElementById('receipt_preview_card');
  previewContainer.innerHTML = `
    <div class="receipt-paper-print" style="position: relative; width: 100%; box-sizing: border-box;">
      <table class="receipt-header-table" style="width:100%; border-collapse:collapse; margin-bottom:15px;">
        <tr>
          <td style="text-align: left; vertical-align: top; width: 68%;">
            <div style="font-size: 1.35rem; font-weight: 800; color: #1e3a8a; font-family: 'Sarabun', sans-serif; line-height: 1.2;">เนเธฃเธเน€เธฃเธตเธขเธเธเธงเธ”เธงเธดเธเธฒเธเนเธฒเธเธเธฃเธนเธเธธเนเธเธเธดเนเธ</div>
            <div style="font-size: 0.95rem; font-weight: bold; color: #000000; margin-top: 3px; font-family: 'Sarabun', sans-serif;">เธเธฃเธดเธฉเธฑเธ— เธเธดเธเธเธเธฑเธเธเธฒ เธเธณเธเธฑเธ”</div>
            <div style="font-size: 0.85rem; font-weight: bold; color: #000000; font-family: 'Sarabun', sans-serif; letter-spacing: 0.5px;">PICHAYAPUNYA CO.,LTD.</div>
            <div style="font-size: 0.72rem; color: #000000; margin-top: 5px; line-height: 1.35; font-family: 'Sarabun', sans-serif;">
              ${branchAddressThai}<br>
              ${branchAddressEng}<br>
              เน€เธฅเธเธเธฃเธฐเธเธณเธ•เธฑเธงเธเธนเนเน€เธชเธตเธขเธ เธฒเธฉเธตเธญเธฒเธเธฃ / Tax ID : ${prTaxId}
            </div>
          </td>
          <td style="width: 140px; text-align: right; vertical-align: middle; white-space: nowrap;">
            <div style="display: flex; justify-content: flex-end; align-items: center; gap: 10px;">
            <img src="data:image/jpeg;base64,${logo1Base64}" style="height: 65px; display: block;" />
            <img src="data:image/jpeg;base64,${logo2Base64}" style="height: 65px; display: block;" />
          </div>
          </td>
        </tr>
      </table>

      <div class="receipt-title" style="text-align:center; font-size:1.3rem; font-weight:bold; margin-bottom:12px; text-decoration:underline;">เนเธเน€เธชเธฃเนเธเธฃเธฑเธเน€เธเธดเธ / RECEIPT</div>

      <div class="receipt-info-grid">
        <div>
          <div class="receipt-info-item">
            <span class="receipt-info-label">เธเธนเนเธฃเธฑเธเธเธฃเธดเธเธฒเธฃ:</span>
            <span class="receipt-info-value" style="font-weight: 600;">${prCustomer}</span>
          </div>
          <div class="receipt-info-item" style="margin-top: 4px;">
            <span class="receipt-info-label">เธ—เธตเนเธญเธขเธนเน:</span>
            <span class="receipt-info-value">${prAddress}</span>
          </div>
          <div class="receipt-info-item" style="margin-top: 4px;">
            <span class="receipt-info-label">เน€เธเธญเธฃเนเนเธ—เธฃ:</span>
            <span class="receipt-info-value">${formatPhone(prPhone) || '-'}</span>
          </div>
        </div>
        <div>
          <div class="receipt-info-item">
            <span class="receipt-info-label">เน€เธฅเธเธ—เธตเนเนเธเน€เธชเธฃเนเธ:</span>
            <span class="receipt-info-value" style="font-weight: 600;">${prNum}</span>
          </div>
          <div class="receipt-info-item" style="margin-top: 4px;">
            <span class="receipt-info-label">เธงเธฑเธเธ—เธตเนเธเธณเธฃเธฐ:</span>
            <span class="receipt-info-value">${prDate}</span>
          </div>
          <div class="receipt-info-item" style="margin-top: 4px;">
            <span class="receipt-info-label">เธงเธดเธเธตเธเธฒเธฃเธเธณเธฃเธฐ:</span>
            <span class="receipt-info-value" style="font-weight: 600;">
              ${cashChecked} เน€เธเธดเธเธชเธ” &nbsp;&nbsp;&nbsp;&nbsp; ${transferChecked} เน€เธเธดเธเนเธญเธ
            </span>
          </div>
        </div>
      </div>

      <table class="receipt-table-print">
        <thead>
          <tr>
            <th style="width: 8%;">เธฅเธณเธ”เธฑเธ</th>
            <th style="width: 67%;">เธฃเธฒเธขเธเธฒเธฃเธเธณเธฃเธฐเน€เธเธดเธ / Description</th>
            <th style="width: 25%; text-align: right;">เธเธณเธเธงเธเน€เธเธดเธ (เธเธฒเธ—) / Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
          <tr style="background-color: #fafafa; font-weight: bold;">
            <td colspan="2" style="text-align: right;">เธเธณเธเธงเธเน€เธเธดเธเธฃเธงเธกเธ—เธฑเนเธเธชเธดเนเธ (Total Net)</td>
            <td style="text-align: right; font-size: 1.05rem; font-weight: 700; color: #1e3a8a;">
              เธฟ${totalAmount.toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </td>
          </tr>
          <tr style="background-color: #f2f2f2;">
            <td colspan="3" style="padding: 8px !important; font-weight: 600; color: #374151;">
              เธ•เธฑเธงเธญเธฑเธเธฉเธฃ: &nbsp;&nbsp; (${totalText})
            </td>
          </tr>
        </tbody>
      </table>

      <div style="display: flex; justify-content: space-between; gap: 20px; margin-top: 15px;">
        <div style="flex: 1; border: 1px dashed #ccc; padding: 10px; border-radius: 4px; background: #fafafa; min-height: 80px; box-sizing: border-box;">
          <div style="font-weight: bold; font-size: 0.75rem; color: #555; margin-bottom: 4px;">เธซเธกเธฒเธขเน€เธซเธ•เธธ / Notes:</div>
          <div style="font-size: 0.75rem; color: #111; line-height: 1.4;">
            ${prNote1 ? 'โ€ข ' + prNote1 + '<br>' : ''}
            ${prNote2 ? 'โ€ข ' + prNote2 + '<br>' : ''}
            ${prNote3 ? 'โ€ข ' + prNote3 + '<br>' : ''}
          </div>
        </div>
        
        <div style="width: 240px; display: flex; flex-direction: column; gap: 15px; box-sizing: border-box;">
          <div class="receipt-signature-box" style="width: 100%;">
            <div class="receipt-signature-line" style="margin-top: 20px;"></div>
            <div style="font-size: 0.72rem; color: #555;">เธเธนเนเธฃเธฑเธเน€เธเธดเธ / Cashier (เธเธธเธ“ ${prStaff})</div>
          </div>
          <div class="receipt-signature-box" style="width: 100%;">
            <div class="receipt-signature-line" style="margin-top: 20px;"></div>
            <div style="font-size: 0.72rem; color: #555;">เธเธนเนเธกเธตเธญเธณเธเธฒเธเธฅเธเธเธฒเธก / Authorized Signatory</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function printReceipt() {
  const previewHtml = document.getElementById('receipt_preview_card').innerHTML;
  const printArea = document.getElementById('print_dedicated_area');
  printArea.innerHTML = previewHtml;
  window.print();
}

function thaiBahtText(num) {
  if (num === null || num === undefined || isNaN(num)) return '';
  num = parseFloat(num);
  if (num === 0) return 'เธจเธนเธเธขเนเธเธฒเธ—เธ–เนเธงเธ';

  const numStr = num.toFixed(2);
  const parts = numStr.split('.');
  const bahtStr = parts[0];
  const satangStr = parts[1];

  let text = '';

  function convertSection(section) {
    const digits = ['', 'เธซเธเธถเนเธ', 'เธชเธญเธ', 'เธชเธฒเธก', 'เธชเธตเน', 'เธซเนเธฒ', 'เธซเธ', 'เน€เธเนเธ”', 'เนเธเธ”', 'เน€เธเนเธฒ'];
    const positions = ['', 'เธชเธดเธ', 'เธฃเนเธญเธข', 'เธเธฑเธ', 'เธซเธกเธทเนเธ', 'เนเธชเธ', 'เธฅเนเธฒเธ'];
    let secText = '';
    const len = section.length;
    for (let i = 0; i < len; i++) {
      const digit = parseInt(section[i]);
      const pos = len - 1 - i;
      if (digit !== 0) {
        if (pos === 1 && digit === 1) {
          secText += 'เธชเธดเธ';
        } else if (pos === 1 && digit === 2) {
          secText += 'เธขเธตเนเธชเธดเธ';
        } else if (pos === 0 && digit === 1 && len > 1) {
          secText += 'เน€เธญเนเธ”';
        } else {
          secText += digits[digit] + positions[pos];
        }
      }
    }
    return secText;
  }

  let bahtVal = parseInt(bahtStr);
  if (bahtVal > 0) {
    let tempBaht = bahtStr;
    let sections = [];
    while (tempBaht.length > 0) {
      if (tempBaht.length > 6) {
        sections.unshift(tempBaht.slice(-6));
        tempBaht = tempBaht.slice(0, -6);
      } else {
        sections.unshift(tempBaht);
        tempBaht = '';
      }
    }
    
    for (let i = 0; i < sections.length; i++) {
      const secText = convertSection(sections[i]);
      if (secText !== '') {
        text += secText;
        if (i < sections.length - 1) {
          text += 'เธฅเนเธฒเธ';
        }
      }
    }
    text += 'เธเธฒเธ—';
  }

  let satangVal = parseInt(satangStr);
  if (satangVal > 0) {
    text += convertSection(satangVal.toString()) + 'เธชเธ•เธฒเธเธเน';
  } else {
    text += 'เธ–เนเธงเธ';
  }

  return text;
}

