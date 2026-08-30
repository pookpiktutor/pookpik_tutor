
// --- BACKGROUND TASK QUEUE MANAGER ---

window._bgTaskQueue = [];

window._isBgTaskRunning = false;

window._nextTaskTitle = '';

window._nextTaskSilent = false;



window._currentLoadingStatus = '';

function updateTaskWidget() {
  const widget = document.getElementById('task_queue_widget');
  if (!widget) return;

  const now = Date.now();
  window._bgTaskQueue = window._bgTaskQueue.filter(t => {
     if (t.status === 'success' || t.status === 'error') {
        return now - t.endTime < 5000;
     }
     return true;
  });

  const visibleTasks = window._bgTaskQueue.filter(t => !t.isSilent);
  
  const displayTask = visibleTasks.find(t => t.status === 'running')
                      || visibleTasks.find(t => t.status === 'queued')
                      || visibleTasks[0];
                      
  let currentActionText = 'เธเธฃเนเธญเธกเนเธเนเธเธฒเธ';
  let icon = '<i class="fas fa-check-circle" style="color: #10b981; margin-right: 6px;"></i>';
  let badgeHTML = '<div style="background: rgba(16, 185, 129, 0.15); color: #10b981; padding: 2px 8px; border-radius: 12px; font-size: 0.65rem;">เธเธฃเนเธญเธกเนเธเนเธเธฒเธ</div>';
  
  if (window._currentLoadingStatus) {
      currentActionText = window._currentLoadingStatus;
      icon = '<i class="fas fa-circle-notch fa-spin" style="color:#3b82f6; margin-right: 6px;"></i>';
      badgeHTML = `<div style="background: rgba(59, 130, 246, 0.15); color: #3b82f6; padding: 2px 8px; border-radius: 12px; font-size: 0.65rem;">เธเธณเธฅเธฑเธเธ—เธณเธเธฒเธ</div>`;
  } else if (displayTask) {
      currentActionText = displayTask.title;
      icon = '<i class="fas fa-circle-notch fa-spin" style="color:#3b82f6; margin-right: 6px;"></i>';
      if (displayTask.status === 'success') {
          icon = '<i class="fas fa-check-circle" style="color: #10b981; margin-right: 6px;"></i>';
          badgeHTML = `<div style="background: rgba(16, 185, 129, 0.15); color: #10b981; padding: 2px 8px; border-radius: 12px; font-size: 0.65rem;">เธชเธณเน€เธฃเนเธ</div>`;
      } else if (displayTask.status === 'error') {
          icon = '<i class="fas fa-times-circle" style="color: #ef4444; margin-right: 6px;"></i>';
          badgeHTML = `<div style="background: rgba(239, 68, 68, 0.15); color: #ef4444; padding: 2px 8px; border-radius: 12px; font-size: 0.65rem;">เธเธดเธ”เธเธฅเธฒเธ”</div>`;
      } else {
          badgeHTML = `<div style="background: rgba(59, 130, 246, 0.15); color: #3b82f6; padding: 2px 8px; border-radius: 12px; font-size: 0.65rem;">เธเธณเธฅเธฑเธเธ—เธณเน€เธเธทเนเธญเธเธซเธฅเธฑเธ</div>`;
      }
  }

  if (currentActionText === 'เธเธฃเนเธญเธกเนเธเนเธเธฒเธ') {
      widget.style.display = 'none';
  } else {
      widget.style.display = 'flex';
  }
  widget.innerHTML = `
    <div style="position: fixed; bottom: 20px; right: 20px; z-index: 9999; background: #fff; padding: 8px 16px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); display: flex; align-items: center; gap: 8px; font-size: 0.8rem; font-weight: 500; border: 1px solid #e2e8f0; max-width: 300px;">
      ${icon}
      <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${currentActionText}</span>
    </div>
  `;
}



function processBgTaskQueue() {

  updateTaskWidget();

  if (window._isBgTaskRunning) return;



  const nextTask = window._bgTaskQueue.find(t => t.status === 'queued');

  if (!nextTask) return;



  window._isBgTaskRunning = true;

  nextTask.status = 'running';

  updateTaskWidget();



  const completeTask = (status, resultOrError) => {

    nextTask.status = status;

    nextTask.endTime = Date.now();

    window._isBgTaskRunning = false;

    updateTaskWidget();

    

    if (status === 'success' && nextTask.successHandler) {

      nextTask.successHandler(resultOrError);

    } else if (status === 'error' && nextTask.failureHandler) {

      nextTask.failureHandler(resultOrError);

    }

    

    setTimeout(processBgTaskQueue, 100);

  };



  if (window._originalGSR) {

     const runner = nextTask.successHandler ? window._originalGSR.withSuccessHandler(res => completeTask('success', res)) : window._originalGSR;

     const finalRunner = nextTask.failureHandler ? runner.withFailureHandler(err => completeTask('error', err)) : runner;

     finalRunner[nextTask.funcName](...nextTask.args);

  } else {

     const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbyYjh5-6frv-AytBYl1EnWB46Vh5_VCkVVRg6XsU4A-KUJoR8nFh46XZ-ffvbtwiZHhhA/exec';

     fetch(GAS_API_URL, {

        redirect: 'follow',

        method: 'POST',

        body: JSON.stringify({ functionName: nextTask.funcName, arguments: nextTask.args }),

        headers: { 'Content-Type': 'text/plain;charset=utf-8' }

     })

     .then(response => response.json())

     .then(result => {

        if (result && result.error) {

           completeTask('error', new Error(result.error));

        } else {

           completeTask('success', result);

        }

     })

     .catch(err => {

        completeTask('error', err);

     });

  }

}



if (typeof google !== 'undefined' && google.script && google.script.run) {

   window._originalGSR = google.script.run;

} else {

   window.google = window.google || {};

   window.google.script = window.google.script || {};

}



window.google.script.run = new Proxy({}, {

  get: function(target, prop) {

    if (prop === 'withSuccessHandler') {

      return function(handler) {

        target._successHandler = handler;

        return window.google.script.run;

      };

    }

    if (prop === 'withFailureHandler') {

      return function(handler) {

        target._failureHandler = handler;

        return window.google.script.run;

      };

    }

    return function(...args) {

      const successHandler = target._successHandler;

      const failureHandler = target._failureHandler;

      target._successHandler = undefined;

      target._failureHandler = undefined;

      

      const title = window._nextTaskTitle || 'เธเธฃเธฐเธกเธงเธฅเธเธฅเธเนเธญเธกเธนเธฅ...';

      window._nextTaskTitle = ''; 

      

      const isSilent = window._nextTaskSilent || false;

      window._nextTaskSilent = false;



      const isMutation = /^(save|add|update|delete|submit|clear|toggle|confirm|migrate|fix|init|ensure|change)/i.test(prop);



      if (!isMutation) {

        // Execute immediately (Bypass Queue for read operations)

        if (window._originalGSR) {

          const runner = successHandler ? window._originalGSR.withSuccessHandler(successHandler) : window._originalGSR;

          const finalRunner = failureHandler ? runner.withFailureHandler(failureHandler) : runner;

          finalRunner[prop](...args);

        } else {

          const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbyYjh5-6frv-AytBYl1EnWB46Vh5_VCkVVRg6XsU4A-KUJoR8nFh46XZ-ffvbtwiZHhhA/exec';

          fetch(GAS_API_URL, {

            redirect: 'follow',

            method: 'POST',

            body: JSON.stringify({ functionName: prop, arguments: args }),

            headers: { 'Content-Type': 'text/plain;charset=utf-8' }

          })

          .then(response => response.json())

          .then(result => {

            if (result && result.error) {

              if (failureHandler) failureHandler(new Error(result.error));

            } else {

              if (successHandler) successHandler(result);

            }

          })

          .catch(err => {

            if (failureHandler) failureHandler(err);

          });

        }

        return; // Don't push to queue

      }



      window._bgTaskQueue.push({

        id: Date.now() + Math.random(),

        title: title,

        funcName: prop,

        args: args,

        successHandler: successHandler,

        failureHandler: failureHandler,

        status: 'queued',

        isSilent: isSilent

      });



      processBgTaskQueue();

    };

  }

});

// --- END BACKGROUND TASK QUEUE MANAGER ---



function safeSetValue(id, val) {

    const el = document.getElementById(id);

    if (el) el.value = val;

}

function safeSetText(id, val) {

    const el = document.getElementById(id);

    if (el) el.innerText = val;

}

// Version 64.0.0: เธเธฃเธฑเธเธ•เธฒเธฃเธฒเธเธเธฅเธฒเธชเน€เธฃเธตเธขเธ เธเธฒเธฃเธ•เธฑเธ”เธเธทเนเธญเธเธญเธฃเนเธช เธเนเธญเธเธเธฑเธเธเธญเธฃเนเธชเธฅเนเธเธเธญเธ เนเธฅเธฐเธญเธฑเธเน€เธ”เธ•เธเนเธญเธเธ—เธฒเธเธเธณเธฃเธฐเน€เธเธดเธ

// Global State

let modalState = {

  roomLabel: '',

  date: '',

  classes: [],       // Array of local class logs

  deletedRows: [],   // Row indexes marked for deletion

  newLogs: [],       // Local additions

  updatedLogs: [],   // Local updates: { rowIndex, log }

  editingIndex: -1,  // Index in modalState.classes currently being edited

  editingIndexes: [-1, -1, -1, -1] // Row indexes for each of the 4 tabs in class modal

};



let state = {

  classAbsences: (() => { try { return JSON.parse(localStorage.getItem('classAbsences')) || {}; } catch(e) { return {}; } })(),

  settings: { teachers: [], schools: [], paymentChannels: [] },

  students: [],

  classLogs: [],
  dailyGridCache: {},
  allClassLogsCache: null,

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







// ----------------------------------------------------

// Authentication & Sessions

// ----------------------------------------------------

// Idle/Activity Timer for Auto-Logout (1 hour = 3600000ms)

let idleTimer = null;

const IDLE_LIMIT = 3600000; // 1 hour



function resetIdleTimer() {

  if (idleTimer) clearTimeout(idleTimer);

  idleTimer = setTimeout(() => {

    if (state.currentUser) {

      if (state.heartbeatInterval) {

        clearInterval(state.heartbeatInterval);

        state.heartbeatInterval = null;

      }

      sessionStorage.removeItem('pookpik_session');

      state.currentUser = null;

      showLoginScreen();

      showToast('เธญเธญเธเธเธฒเธเธฃเธฐเธเธเธญเธฑเธ•เนเธเธกเธฑเธ•เธดเน€เธเธทเนเธญเธเธเธฒเธเนเธกเนเธกเธตเธเธฒเธฃเน€เธเธฅเธทเนเธญเธเนเธซเธงเน€เธเธดเธ 1 เธเธฑเนเธงเนเธกเธ', 'warning');

    }

  }, IDLE_LIMIT);

}



function initIdleTimer() {

  window.addEventListener('mousemove', resetIdleTimer);

  window.addEventListener('keydown', resetIdleTimer);

  window.addEventListener('click', resetIdleTimer);

  window.addEventListener('scroll', resetIdleTimer);

  window.addEventListener('touchstart', resetIdleTimer); // Mobile support

  resetIdleTimer();

}



function checkSession() {

  // Check URL parameters first (like LINE OA)

  const urlParams = new URLSearchParams(window.location.search);

  const urlUser = urlParams.get("logUser");

  if (urlUser) {

    sessionStorage.setItem('pookpik_session', JSON.stringify({

      username: urlUser,

      role: urlUser.toLowerCase().includes('admin') ? 'Administrator' : (urlUser.toLowerCase().includes('staff') ? 'Staff' : 'Teacher')

    }));

  }



  const session = sessionStorage.getItem('pookpik_session');
  if (session && session !== 'undefined' && session !== 'null') {
    try {

      state.currentUser = JSON.parse(session);

      // Hide login overlay immediately to prevent locking the screen on load

      if(document.getElementById('login_overlay')) document.getElementById('login_overlay').style.display = 'none';

      

      const isTeacher = (state.currentUser.role === 'Teacher' || state.currentUser.role === 'เธเธฃเธน');

      

      if (isTeacher) {

        if(document.getElementById('app_shell')) document.getElementById('app_shell').style.display = 'none';

        if(document.getElementById('teacher_app_shell')) document.getElementById('teacher_app_shell').style.display = 'flex';

        

        // Fetch full profile info to display correct details in the sidebar

        google.script.run

          .withSuccessHandler(res => {

            if (res && res.success && res.profile) {

              const p = res.profile;

              // Separate Username and Nickname: Show "Nick (Username)" or just Nick

              const displayName = p.nickname ? `${p.nickname} (${p.username})` : p.username;

              document.getElementById('teacher_user_display').innerText = displayName;

              

              // Load extra details

              document.getElementById('teacher_sidebar_username').innerText = p.username || '-';
              document.getElementById('teacher_sidebar_fullname').innerText = p.fullName || '-';
              document.getElementById('teacher_sidebar_nickname').innerText = p.nickname || '-';
              document.getElementById('teacher_sidebar_phone').innerText = formatPhone(p.phone) || '-';
              document.getElementById('teacher_sidebar_school').innerText = p.school || '-';
              document.getElementById('teacher_sidebar_subjects').innerText = p.subjects || '-';
              document.getElementById('teacher_sidebar_account_type').innerText = p.accountType || '-';
              document.getElementById('teacher_sidebar_bank').innerText = p.bank || '-';
              document.getElementById('teacher_sidebar_account').innerText = p.accountNumber || '-';

            }

          })

          .getUserProfile(state.currentUser.username);

        

        const displayName = state.currentUser.nickname || state.currentUser.username;

        document.getElementById('teacher_user_display').innerText = displayName;

        

        const mobNameEl = document.getElementById('teacher_mobile_name');

        if (mobNameEl) {

          mobNameEl.innerText = state.currentUser.nickname || state.currentUser.username || 'เธเธธเธ“เธเธฃเธน';

        }

        

        const avatarLettersEl = document.getElementById('teacher_avatar_letters');

        if (state.currentUser.profilePic && state.currentUser.profilePic !== '-') {

          if (avatarLettersEl) avatarLettersEl.innerHTML = `<img src="${state.currentUser.profilePic}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;

          if (avatarLettersEl) avatarLettersEl.style.background = 'transparent';

        } else {

          if (avatarLettersEl) avatarLettersEl.innerText = displayName.substring(0, 2).toUpperCase();

          if (avatarLettersEl) avatarLettersEl.style.background = 'var(--color-brown)';

        }

        

        // Load default dates for teacher filter

        initTeacherFilterDates();

        loadTeacherDailySchedule();

      } else {

        if(document.getElementById('teacher_app_shell')) document.getElementById('teacher_app_shell').style.display = 'none';

        if(document.getElementById('app_shell')) document.getElementById('app_shell').style.display = 'flex';

        

        // Update displayed name

        const displayName = String(state.currentUser.nickname || state.currentUser.username || '');

        document.getElementById('current_user_display').innerText = displayName;

        document.getElementById('current_role_display').innerText = state.currentUser.role;

        

        const avatarLettersEl = document.getElementById('avatar_letters');

        if (state.currentUser.profilePic && state.currentUser.profilePic !== '-') {

          if (avatarLettersEl) avatarLettersEl.innerHTML = `<img src="${state.currentUser.profilePic}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;

          if (avatarLettersEl) avatarLettersEl.style.background = 'transparent';

        } else {

          if (avatarLettersEl) avatarLettersEl.innerText = displayName.substring(0, 2).toUpperCase();

          if (avatarLettersEl) avatarLettersEl.style.background = 'var(--color-brown)';

        }

        

        // Bootstrap App Data

        bootApp();

      }

      startHeartbeat();

      initIdleTimer();

    } catch (e) {

      console.error('System Error in checkSession:', e);

      if (e instanceof SyntaxError) {

        sessionStorage.removeItem('pookpik_session');

        showLoginScreen();

      } else {

        if (window.showToast) {

          showToast('เธซเธเนเธฒเธเธญเธกเธตเธเธฑเธเธซเธฒเธเธฒเธเธชเนเธงเธ: ' + e.message, 'warning');

        }

        if (state.currentUser) {

          if (state.currentUser.role === 'Teacher' || state.currentUser.role === 'เธเธฃเธน') {

            if (typeof loadTeacherDailySchedule === 'function') loadTeacherDailySchedule();

          } else {

            if (typeof bootApp === 'function') bootApp();

          }

        }

      }

    }

  } else {

    showLoginScreen();

  }

}



function showLoginScreen() {

  if(document.getElementById('login_overlay')) document.getElementById('login_overlay').style.display = 'flex';

  if(document.getElementById('app_shell')) document.getElementById('app_shell').style.display = 'none';

  if(document.getElementById('teacher_app_shell')) document.getElementById('teacher_app_shell').style.display = 'none';

}



function handleLogin(e) {

  if (e && e.preventDefault) e.preventDefault();

  const user = document.getElementById('login_username').value.trim();

  const pass = document.getElementById('login_password').value;

  

  if (!pass) {

    showToast('เธเธฃเธธเธ“เธฒเธเธฃเธญเธเธฃเธซเธฑเธชเธเนเธฒเธ', 'error');

    return;

  }

  

  setLoading(true, 'เธเธณเธฅเธฑเธเน€เธเนเธฒเธชเธนเนเธฃเธฐเธเธ...');

  google.script.run

    .withSuccessHandler(res => {

      setLoading(false);

      if (res && res.success) {

        sessionStorage.setItem('pookpik_session', JSON.stringify(res.user));

        if(document.getElementById('login_overlay')) document.getElementById('login_overlay').style.display = 'none';

        document.getElementById('mobile_menu_btn')?.addEventListener('click', function() {

    const sidebar = document.getElementById('sidebar');

    if (sidebar.style.transform === 'translateX(0px)') {

      sidebar.style.transform = 'translateX(-100%)';

    } else {

      sidebar.style.transform = 'translateX(0px)';

    }

  });

  

  // Call updateTaskWidget on load to show "ready" state if desired

  updateTaskWidget();

  

  // Custom form bindings

  function setupCharCounting() {

    const inputs = document.querySelectorAll('input[maxlength], textarea[maxlength]');

    inputs.forEach(input => {

      function updateCount() {

      }

    });

  }

  showToast('เน€เธเนเธฒเธชเธนเนเธฃเธฐเธเธเธชเธณเน€เธฃเนเธ!', 'success');

        checkSession();

      } else {

        showToast(res.error || 'เธเธทเนเธญเธเธนเนเนเธเนเธเธฒเธเธซเธฃเธทเธญเธฃเธซเธฑเธชเธเนเธฒเธเนเธกเนเธ–เธนเธเธ•เนเธญเธ', 'error');

      }

    })

    .withFailureHandler(err => {

      setLoading(false);

      showToast('เน€เธเธดเธ”เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”เนเธเธเธฒเธฃเน€เธเธทเนเธญเธกเธ•เนเธญ: ' + err.message, 'error');

    })

    .verifyLogin(user, pass);

}





  // Setup character counting for evaluation forms

  function setupCharCounting() {

    const inputs = document.querySelectorAll('.eval-strength-item, .eval-improvement-item, .eval-recommendation-item');

    inputs.forEach(input => {

      // Find if we already added a count span

      let countSpan = input.nextElementSibling;

      if (!countSpan || !countSpan.classList.contains('char-count-display')) {

         countSpan = document.createElement('span');

         countSpan.classList.add('char-count-display');

         countSpan.style.fontSize = '0.75rem';

         countSpan.style.color = '#888';

         countSpan.style.minWidth = '45px';

         countSpan.style.textAlign = 'right';

         

         // Insert after input

         if (input.parentNode) {

             input.parentNode.insertBefore(countSpan, input.nextSibling);

         }

      }

      

      function updateCount() {

         const count = input.value.length;

         countSpan.innerText = count + '/60';

         if (count > 0 && count < 60 && input.placeholder.includes('60')) {

             countSpan.style.color = 'red';

         } else {

             countSpan.style.color = '#888';

         }

      }

      

      input.addEventListener('input', updateCount);

      updateCount(); // Init

    });

  }

  setupCharCounting();



function handleLogout() {

  if (confirm('เธเธธเธ“เธ•เนเธญเธเธเธฒเธฃเธญเธญเธเธเธฒเธเธฃเธฐเธเธเนเธเนเธซเธฃเธทเธญเนเธกเน?')) {

    if (state.heartbeatInterval) {

      clearInterval(state.heartbeatInterval);

      state.heartbeatInterval = null;

    }

    sessionStorage.removeItem('pookpik_session');

    state.currentUser = null;

    showLoginScreen();

    showToast('เธญเธญเธเธเธฒเธเธฃเธฐเธเธเน€เธฃเธตเธขเธเธฃเนเธญเธขเนเธฅเนเธง', 'info');

  }

}



// ----------------------------------------------------

// Teacher Panel Controller

// ----------------------------------------------------

function initTeacherFilterDates() {

  const today = new Date();

  const year = today.getFullYear();

  const month = today.getMonth() + 1;

  const lastDay = new Date(year, month, 0).getDate(); // Get last day of current month

  

  const startStr = `${year}-${month < 10 ? '0' + month : month}-01`;

  const endStr = `${year}-${month < 10 ? '0' + month : month}-${lastDay < 10 ? '0' + lastDay : lastDay}`;

  

  document.getElementById('teacher_filter_start_date').value = startStr;

  document.getElementById('teacher_filter_end_date').value = endStr;

  

  // Populate year picker

  const yearPicker = document.getElementById('teacher_salary_year_picker');

  if (yearPicker) {

    yearPicker.innerHTML = '';

    // Show current year +/- 2 years

    for (let y = 2026; y <= 2032; y++) {

      const opt = document.createElement('option');

      opt.value = y;

      opt.text = `เธเธต เธ.เธจ. ${y + 543} (เธ.เธจ. ${y})`;

      if (y === year) opt.selected = true;

      yearPicker.appendChild(opt);

    }

  }



  // Populate month picker

  const monthPicker = document.getElementById('teacher_salary_month_picker');

  if (monthPicker) {

    monthPicker.innerHTML = '';

    const monthNames = [

      'เธกเธเธฃเธฒเธเธก', 'เธเธธเธกเธ เธฒเธเธฑเธเธเน', 'เธกเธตเธเธฒเธเธก', 'เน€เธกเธฉเธฒเธขเธ',

      'เธเธคเธฉเธ เธฒเธเธก', 'เธกเธดเธ–เธธเธเธฒเธขเธ', 'เธเธฃเธเธเธฒเธเธก', 'เธชเธดเธเธซเธฒเธเธก',

      'เธเธฑเธเธขเธฒเธขเธ', 'เธ•เธธเธฅเธฒเธเธก', 'เธเธคเธจเธเธดเธเธฒเธขเธ', 'เธเธฑเธเธงเธฒเธเธก'

    ];

    monthNames.forEach((name, idx) => {

      const opt = document.createElement('option');

      opt.value = idx + 1;

      opt.text = name;

      if (idx + 1 === month) opt.selected = true;

      monthPicker.appendChild(opt);

    });

  }

}



function switchTeacherPanel(panelId) {

  // Hide ALL teacher panels explicitly with display: none (most reliable)

  if(document.getElementById('teacher_daily_schedule_panel')) {

    document.getElementById('teacher_daily_schedule_panel').style.display = 'none';

    document.getElementById('teacher_daily_schedule_panel').classList.remove('active');

  }

  if(document.getElementById('teacher_monthly_salary_panel')) {

    document.getElementById('teacher_monthly_salary_panel').style.display = 'none';

    document.getElementById('teacher_monthly_salary_panel').classList.remove('active');

  }

  if (document.getElementById('evaluation_form_panel')) {

    document.getElementById('evaluation_form_panel').style.display = 'none';

    document.getElementById('evaluation_form_panel').classList.remove('active');

  }

  

  // Remove active from all matching nav elements (desktop sidebar & mobile bottom nav)

  document.querySelectorAll(`[data-teacher-panel]`).forEach(item => {

    item.classList.remove('active');

  });

  

  // Show target panel with display: flex (correct layout, not 'block' which breaks flexbox)

  const targetPanel = document.getElementById(panelId + '_panel');

  if (targetPanel) {

    targetPanel.style.display = 'flex';

    targetPanel.classList.add('active');

  }

  

  // Add active to all elements with matching panelId

  document.querySelectorAll(`[data-teacher-panel="${panelId}"]`).forEach(item => {

    item.classList.add('active');

  });

  

  const titleEl = document.getElementById('teacher_panel_title');

  const mobTitleEl = document.getElementById('teacher_mobile_panel_title');

  let panelTitleText = '';

  

  if (panelId === 'teacher_daily_schedule') {

    panelTitleText = '๐“… เธ•เธฒเธฃเธฒเธเธชเธญเธเธฃเธฒเธขเธงเธฑเธ';

    if (titleEl) titleEl.innerHTML = panelTitleText;

    if (mobTitleEl) mobTitleEl.innerHTML = panelTitleText;

    loadTeacherDailySchedule();

  } else if (panelId === 'teacher_monthly_salary') {

    panelTitleText = '๐’ต เธฃเธฒเธขเธเธฒเธฃเน€เธเธดเธเน€เธ”เธทเธญเธเธเธญเธเธเธฑเธ';

    if (titleEl) titleEl.innerHTML = panelTitleText;

    if (mobTitleEl) mobTitleEl.innerHTML = panelTitleText;

    loadTeacherYearlySalary();

  } else if (panelId === 'evaluation_form') {

    panelTitleText = '๐“ เนเธเธเธฃเธฐเน€เธกเธดเธเธเธฅเธเธฒเธฃเน€เธฃเธตเธขเธ';

    if (titleEl) titleEl.innerHTML = panelTitleText;

    if (mobTitleEl) mobTitleEl.innerHTML = panelTitleText;

    initEvaluationForm();

  }

  

  // Update mobile profile name

  if (state.currentUser) {

    const mobNameEl = document.getElementById('teacher_mobile_name');

    if (mobNameEl) {

      mobNameEl.textContent = state.currentUser.nickname || state.currentUser.username || 'เธเธธเธ“เธเธฃเธน';

    }

  }

}



function loadTeacherDailySchedule() {

  if (!state.currentUser) return;

  const teacherName = state.currentUser.name;

  const nickname = state.currentUser.nickname;

  

  const startVal = document.getElementById('teacher_filter_start_date').value;

  const endVal = document.getElementById('teacher_filter_end_date').value;

  

  if (!startVal || !endVal) {

    showToast('เธเธฃเธธเธ“เธฒเธฃเธฐเธเธธเธเนเธงเธเธงเธฑเธเธ—เธตเนเนเธซเนเธเธฃเธเธ–เนเธงเธ', 'warning');

    return;

  }

  

  setLoading(true, 'เธเธณเธฅเธฑเธเนเธซเธฅเธ”เธ•เธฒเธฃเธฒเธเธชเธญเธ...');

  

  google.script.run

    .withSuccessHandler(logs => {

      setLoading(false);

      const container = document.getElementById('teacher_schedule_container');

      container.innerHTML = '';

      

      if (!logs || logs.error) {

        container.innerHTML = `<div style="text-align: center; color: var(--color-error); padding: 40px; width: 100%;">เน€เธเธดเธ”เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”: ${logs ? logs.error : 'เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เธ”เธถเธเธเนเธญเธกเธนเธฅเนเธ”เน'}</div>`;

        return;

      }

      

      const start = new Date(startVal + 'T00:00:00');

      const end = new Date(endVal + 'T23:59:59');

      

      const filtered = logs.filter(c => {

        if (!c.date) return false;

        const parts = c.date.split('/');

        if (parts.length !== 3) return false;

        let y = parseInt(parts[2]);

        if (y > 2400) y -= 543; // เนเธเธฅเธ เธ.เธจ. โ’ เธ.เธจ.

        const cDate = new Date(y, parseInt(parts[1]) - 1, parseInt(parts[0]));

        return cDate >= start && cDate <= end;

      });

      

      filtered.sort((a, b) => {

        const partsA = a.date.split('/');

        const partsB = b.date.split('/');

        const dateA = new Date(parseInt(partsA[2]), parseInt(partsA[1]) - 1, parseInt(partsA[0]));

        const dateB = new Date(parseInt(partsB[2]), parseInt(partsB[1]) - 1, parseInt(partsB[0]));

        if (dateA.getTime() !== dateB.getTime()) {

          return dateA - dateB; // Ascending order: earliest date first

        }

        return a.timeStart.localeCompare(b.timeStart);

      });

      

      if (filtered.length === 0) {

        container.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 40px; width: 100%;">เนเธกเนเธกเธตเธเนเธญเธกเธนเธฅเธ•เธฒเธฃเธฒเธเน€เธฃเธตเธขเธเนเธเธเนเธงเธเน€เธงเธฅเธฒเธ—เธตเนเน€เธฅเธทเธญเธ</div>';

        return;

      }

      

      // Group filtered logs by date
      const groupedByDate = {};
      filtered.forEach(c => {
        if (!groupedByDate[c.date]) groupedByDate[c.date] = { dateStr: c.date, classes: [] };
        groupedByDate[c.date].classes.push(c);
      });

      const sortedDates = Object.values(groupedByDate).sort((a, b) => {
        const partsA = a.dateStr.split('/');
        const partsB = b.dateStr.split('/');
        const dateA = new Date(parseInt(partsA[2]), parseInt(partsA[1]) - 1, parseInt(partsA[0]));
        const dateB = new Date(parseInt(partsB[2]), parseInt(partsB[1]) - 1, parseInt(partsB[0]));
        return dateA - dateB;
      });

      function parseTimeToHours(t) {
        if (!t) return null;
        var s = String(t).replace(':', '.').replace(/\s/g, '');
        var parts = s.split('.');
        var h = parseInt(parts[0], 10) || 0;
        var m = parseInt(parts[1], 10) || 0;
        return h + m / 60;
      }

      var HOUR_START = 8;
      var HOUR_END = 22;
      var TOTAL_HOURS = HOUR_END - HOUR_START;
      var COL_WIDTH = 190;
      var TIMELINE_WIDTH = TOTAL_HOURS * COL_WIDTH;
      var ROW_HEADER_WIDTH = 130;
      var CARD_ROW_HEIGHT = 160;

      var headerCols = '';
      for (var h = HOUR_START; h <= HOUR_END; h++) {
        var label = String(h).padStart(2, '0') + '.00';
        headerCols += '<div style="position:absolute; left:' + ((h - HOUR_START) * COL_WIDTH) + 'px; width:' + COL_WIDTH + 'px; text-align:center; font-weight:700; font-size:0.72rem; color:var(--text-main); padding:8px 0; box-sizing:border-box; border-right:1px dashed #e2e8f0; height: 100%; z-index: 0;">' + label + '</div>';
      }

      var html = '<div style="width:100%; height:75vh; overflow:auto; border:1px solid var(--border-color); border-radius:8px; background:#fff; box-shadow:0 2px 4px rgba(0,0,0,0.02); margin-top: 15px;">';

      html += '<div style="position:sticky; top:0; z-index:30; display:flex; min-width:' + (ROW_HEADER_WIDTH + TIMELINE_WIDTH) + 'px; background:#f8fafc; border-bottom:2px solid var(--border-color); box-shadow: 0 2px 4px rgba(0,0,0,0.05);">';
      html += '<div style="position:sticky; left:0; z-index:40; min-width:' + ROW_HEADER_WIDTH + 'px; width:' + ROW_HEADER_WIDTH + 'px; padding:8px 10px; font-weight:700; font-size:0.75rem; color:var(--text-main); border-right:2px solid var(--border-color); background:#f8fafc; display:flex; align-items:center;">เธงเธฑเธเธ—เธตเนเน€เธฃเธตเธขเธ</div>';
      html += '<div style="position:relative; width:' + TIMELINE_WIDTH + 'px; height:36px;">' + headerCols + '</div>';
      html += '</div>';

      sortedDates.forEach(dateGroup => {
        var cards = [];
        dateGroup.classes.forEach(c => {
          var sh = parseTimeToHours(c.timeStart);
          var eh = parseTimeToHours(c.timeEnd);
          if (sh === null) return;
          if (eh === null || eh <= sh) eh = sh + 1;
          cards.push({ c: c, sh: sh, eh: eh });
        });
        cards.sort((a, b) => a.sh - b.sh || a.eh - b.eh);

        var rows = [];
        cards.forEach(card => {
          var placed = false;
          for (var r = 0; r < rows.length; r++) {
            var conflict = false;
            for (var k = 0; k < rows[r].length; k++) {
              if (card.sh < rows[r][k].eh && card.eh > rows[r][k].sh) {
                conflict = true;
                break;
              }
            }
            if (!conflict) {
              rows[r].push(card);
              card.row = r;
              placed = true;
              break;
            }
          }
          if (!placed) {
            card.row = rows.length;
            rows.push([card]);
          }
        });

        var maxRows = rows.length || 1;
        var rowHeight = maxRows * CARD_ROW_HEIGHT + 20;

        html += '<div style="display:flex; min-width:' + (ROW_HEADER_WIDTH + TIMELINE_WIDTH) + 'px; border-bottom:2px solid var(--border-color);">';

        var thDateStr = typeof formatDateTimeToThaiLong === 'function' ? formatDateTimeToThaiLong(dateGroup.dateStr) : dateGroup.dateStr;
        html += '<div style="position:sticky; left:0; z-index:20; min-width:' + ROW_HEADER_WIDTH + 'px; width:' + ROW_HEADER_WIDTH + 'px; padding:10px 8px; border-right:2px solid var(--border-color); background:#fff; box-shadow:2px 0 5px -2px rgba(0,0,0,0.05); display:flex; flex-direction:column; align-items:center; justify-content:center;">';
        html += '<div style="font-size:0.8rem; font-weight:700; color:var(--color-primary-hover); text-align:center; line-height:1.4;">' + thDateStr + '</div>';
        html += '<div style="font-size:0.65rem; color:var(--text-muted); margin-top:5px; background:rgba(0,0,0,0.04); padding:3px 8px; border-radius:12px; font-weight: 600;">' + cards.length + ' เธเธฅเธฒเธช</div>';
        html += '</div>';

        html += '<div style="position:relative; width:' + TIMELINE_WIDTH + 'px; min-height:' + rowHeight + 'px; background: #fafafa;">';

        for (var gh = HOUR_START; gh <= HOUR_END; gh++) {
          html += '<div style="position:absolute; left:' + ((gh - HOUR_START) * COL_WIDTH) + 'px; top:0; bottom:0; width:1px; background:' + (gh === HOUR_END ? 'transparent' : '#e2e8f0') + '; z-index: 1;"></div>';
        }

        cards.forEach(cardObj => {
          var c = cardObj.c;
          var startPx = (cardObj.sh - HOUR_START) * COL_WIDTH;
          var widthPx = (cardObj.eh - cardObj.sh) * COL_WIDTH;
          var topPx = cardObj.row * CARD_ROW_HEIGHT + 10;
          
          if (startPx < 0) {
             widthPx += startPx;
             startPx = 0;
          }
          if (startPx + widthPx > TIMELINE_WIDTH) {
             widthPx = TIMELINE_WIDTH - startPx;
          }

          const isReg = (c.teacherRegular || '').toLowerCase().trim() === (nickname || '').toLowerCase().trim() || (c.teacherRegular || '').toLowerCase().trim() === (teacherName || '').toLowerCase().trim();
          const roleClass = isReg ? 'regular' : 'sub';
          const roleLabel = isReg ? 'เธเธฃเธนเธเธฃเธฐเธเธณ' : 'เธชเธญเธเนเธ—เธ';

          const leaveCount = parseInt(c.leaveCount) || parseInt(c.isLeave) || 0;
          const totalKids = (parseInt(c.isPresentLive) || 0) + (parseInt(c.isPresentOnline) || 0) + (parseInt(c.isMakeup) || 0);

          const attendances = [];
          attendances.push(`เธชเธ”: ${c.isPresentLive || 0}`);
          attendances.push(`เธญเธญเธ: ${c.isPresentOnline || 0}`);
          attendances.push(`เธฅเธฒ: ${c.isLeave || 0}`);
          attendances.push(`เธเธฒเธ”: ${c.isAbsent || 0}`);
          attendances.push(`เธเธ”: ${c.isMakeup || 0}`);
          const attendanceSummaryHtml = attendances.length > 0 ? `<div style="font-size: 0.72rem; margin-top: 4px; color: var(--color-primary-hover); font-weight: 500;">๐‘ฅ ${attendances.join(' ')}</div>` : '';

          let displayBranch = (c.roomBranch || c.roomBranchInfo || '').toString().trim();
          displayBranch = displayBranch.replace(/Zoom\s*\S*/i, '').replace(/\s+/g, ' ').trim();

          let noteHtml = '';
          const noteText = (c.note || c.memo || '').toString().trim();
          if (noteText !== '' && noteText !== '-') {
            noteHtml = `<div class="teacher-card-note" style="font-size: 0.7rem; padding: 4px 6px; margin: 4px 0; background: rgba(0,0,0,0.03); border-radius: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">๐“ ${noteText}</div>`;
          }

          const isTeacherLeave = noteText.includes('เธเธฃเธนเธฅเธฒ');
          const subjectLower = (c.subject || '').toLowerCase();
          const isPrivateOrSubGroup = subjectLower.includes('เน€เธ”เธตเนเธขเธง') || subjectLower.includes('เธขเนเธญเธข');
          const hasStudentLeave = leaveCount > 0 && isPrivateOrSubGroup;

          var bg = '#fff';
          var border = 'var(--border-color)';
          var timeBg = '#3b82f6';
          if (hasStudentLeave) {
             bg = 'rgb(254, 226, 226)';
             border = '#ef4444';
             timeBg = '#ef4444';
          } else if (c.teacherConfirmed) {
             bg = 'rgba(25, 135, 84, 0.08)';
             border = '#198754';
             timeBg = '#15803d';
          } else if (isTeacherLeave) {
             bg = 'rgb(254, 226, 226)';
             border = '#ef4444';
             timeBg = '#ef4444';
          }

          html += `<div style="position:absolute; left:${startPx}px; top:${topPx}px; width:${widthPx}px; height:${CARD_ROW_HEIGHT - 10}px; padding:6px 10px; box-sizing:border-box; background:${bg}; border:1.5px solid ${border}; border-radius:8px; box-shadow:0 2px 4px rgba(0,0,0,0.08); overflow:hidden; z-index: 10; display:flex; flex-direction:column; justify-content:space-between; transition: transform 0.15s ease;">
            <div>
              <div style="padding-bottom: 4px; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 4px;">
                <span style="font-size: 0.7rem; padding: 2px 8px; font-weight: 700; color: #fff; background: ${timeBg}; border-radius: 12px; white-space: nowrap;">โฐ ${cleanTimeStr(c.timeStart)} - ${cleanTimeStr(c.timeEnd)}</span>
                <span class="teacher-card-badge ${roleClass}" style="font-size: 0.65rem; padding: 1px 6px;">${roleLabel}</span>
              </div>
              <div style="font-size: 0.8rem; font-weight: 700; margin: 2px 0; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${c.subject}">${c.subject}</div>
              <div style="display: flex; flex-direction: column; gap: 2px;">
                 ${attendanceSummaryHtml}
                 <div style="font-size: 0.7rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"><span style="font-weight:600; color:var(--text-muted);">๐“ เธชเธฒเธเธฒ/เธซเนเธญเธ:</span> ${displayBranch}</div>
                 <div style="font-size: 0.7rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"><span style="font-weight:600; color:var(--text-muted);">๐‘จโ€๐ซ เธเธฃเธนเธเธฃเธฐเธเธณ:</span> ${c.teacherRegular || '-'}</div>
                 ${c.teacherSub ? `<div style="font-size: 0.7rem; color: var(--color-danger); font-weight:600;">๐” เธเธฃเธนเนเธ—เธ: ${c.teacherSub}</div>` : ''}
              </div>
            </div>
            <div>
              ${noteHtml}
              <div style="border-top: 1px dashed rgba(0,0,0,0.15); margin-top: 4px; padding-top: 4px; display: flex; align-items: center; justify-content: space-between; gap: 4px;">
                ${isReg ? `
                <label style="display: flex; align-items: center; gap: 4px; font-size: 0.7rem; cursor: pointer; font-weight: 700; color: var(--color-danger); margin:0;">
                  <input type="checkbox" class="teacher-kru-leave-chk" data-row="${c.rowIndex}" ${noteText.includes('เธเธฃเธนเธฅเธฒ') ? 'checked' : ''} onchange="handleTeacherLeaveToggle(${c.rowIndex}, this)" style="width: 14px; height: 14px; cursor: pointer; accent-color: var(--color-danger); margin:0;">
                  เธเธฃเธนเธฅเธฒ
                </label>
                ` : `<div></div>`}
                <label style="display: flex; align-items: center; gap: 4px; font-size: 0.7rem; cursor: pointer; font-weight: 700; color: var(--color-success); margin:0;">
                  <input type="checkbox" class="teacher-daily-confirm-chk" data-row="${c.rowIndex}" ${c.teacherConfirmed ? 'checked' : ''} onchange="toggleDailyScheduleConfirm(${c.rowIndex}, this)" style="width: 14px; height: 14px; cursor: pointer; accent-color: var(--color-success); margin:0;">
                  เธขเธทเธเธขเธฑเธ
                </label>
              </div>
            </div>
          </div>`;
        });
        
        html += '</div></div>';
      });

      html += '</div>';
      container.innerHTML = html;
    })

    .withFailureHandler(err => {

      setLoading(false);

      showToast('เน€เธเธดเธ”เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”เนเธเธเธฒเธฃเน€เธเธทเนเธญเธกเธ•เนเธญ: ' + err.message, 'error');

    })

    .verifyLogin(user, pass);

}





  // Setup character counting for evaluation forms

  function setupCharCounting() {

    const inputs = document.querySelectorAll('.eval-strength-item, .eval-improvement-item, .eval-recommendation-item');

    inputs.forEach(input => {

      // Find if we already added a count span

      let countSpan = input.nextElementSibling;

      if (!countSpan || !countSpan.classList.contains('char-count-display')) {

         countSpan = document.createElement('span');

         countSpan.classList.add('char-count-display');

         countSpan.style.fontSize = '0.75rem';

         countSpan.style.color = '#888';

         countSpan.style.minWidth = '45px';

         countSpan.style.textAlign = 'right';

         

         // Insert after input

         if (input.parentNode) {

             input.parentNode.insertBefore(countSpan, input.nextSibling);

         }

      }

      

      function updateCount() {

         const count = input.value.length;

         countSpan.innerText = count + '/60';

         if (count > 0 && count < 60 && input.placeholder.includes('60')) {

             countSpan.style.color = 'red';

         } else {

             countSpan.style.color = '#888';

         }

      }

      

      input.addEventListener('input', updateCount);

      updateCount(); // Init

    });

  }

  setupCharCounting();



function handleLogout() {

  if (confirm('เธเธธเธ“เธ•เนเธญเธเธเธฒเธฃเธญเธญเธเธเธฒเธเธฃเธฐเธเธเนเธเนเธซเธฃเธทเธญเนเธกเน?')) {

    if (state.heartbeatInterval) {

      clearInterval(state.heartbeatInterval);

      state.heartbeatInterval = null;

    }

    sessionStorage.removeItem('pookpik_session');

    state.currentUser = null;

    showLoginScreen();

    showToast('เธญเธญเธเธเธฒเธเธฃเธฐเธเธเน€เธฃเธตเธขเธเธฃเนเธญเธขเนเธฅเนเธง', 'info');

  }

}



// ----------------------------------------------------

// Teacher Panel Controller

// ----------------------------------------------------

function initTeacherFilterDates() {

  const today = new Date();

  const year = today.getFullYear();

  const month = today.getMonth() + 1;

  const lastDay = new Date(year, month, 0).getDate(); // Get last day of current month

  

  const startStr = `${year}-${month < 10 ? '0' + month : month}-01`;

  const endStr = `${year}-${month < 10 ? '0' + month : month}-${lastDay < 10 ? '0' + lastDay : lastDay}`;

  

  document.getElementById('teacher_filter_start_date').value = startStr;

  document.getElementById('teacher_filter_end_date').value = endStr;

  

  // Populate year picker

  const yearPicker = document.getElementById('teacher_salary_year_picker');

  if (yearPicker) {

    yearPicker.innerHTML = '';

    // Show current year +/- 2 years

    for (let y = 2026; y <= 2032; y++) {

      const opt = document.createElement('option');

      opt.value = y;

      opt.text = `เธเธต เธ.เธจ. ${y + 543} (เธ.เธจ. ${y})`;

      if (y === year) opt.selected = true;

      yearPicker.appendChild(opt);

    }

  }



  // Populate month picker

  const monthPicker = document.getElementById('teacher_salary_month_picker');

  if (monthPicker) {

    monthPicker.innerHTML = '';

    const monthNames = [

      'เธกเธเธฃเธฒเธเธก', 'เธเธธเธกเธ เธฒเธเธฑเธเธเน', 'เธกเธตเธเธฒเธเธก', 'เน€เธกเธฉเธฒเธขเธ',

      'เธเธคเธฉเธ เธฒเธเธก', 'เธกเธดเธ–เธธเธเธฒเธขเธ', 'เธเธฃเธเธเธฒเธเธก', 'เธชเธดเธเธซเธฒเธเธก',

      'เธเธฑเธเธขเธฒเธขเธ', 'เธ•เธธเธฅเธฒเธเธก', 'เธเธคเธจเธเธดเธเธฒเธขเธ', 'เธเธฑเธเธงเธฒเธเธก'

    ];

    monthNames.forEach((name, idx) => {

      const opt = document.createElement('option');

      opt.value = idx + 1;

      opt.text = name;

      if (idx + 1 === month) opt.selected = true;

      monthPicker.appendChild(opt);

    });

  }

}



function switchTeacherPanel(panelId) {

  // Hide ALL teacher panels explicitly with display: none (most reliable)

  if(document.getElementById('teacher_daily_schedule_panel')) {

    document.getElementById('teacher_daily_schedule_panel').style.display = 'none';

    document.getElementById('teacher_daily_schedule_panel').classList.remove('active');

  }

  if(document.getElementById('teacher_monthly_salary_panel')) {

    document.getElementById('teacher_monthly_salary_panel').style.display = 'none';

    document.getElementById('teacher_monthly_salary_panel').classList.remove('active');

  }

  if (document.getElementById('evaluation_form_panel')) {

    document.getElementById('evaluation_form_panel').style.display = 'none';

    document.getElementById('evaluation_form_panel').classList.remove('active');

  }

  

  // Remove active from all matching nav elements (desktop sidebar & mobile bottom nav)

  document.querySelectorAll(`[data-teacher-panel]`).forEach(item => {

    item.classList.remove('active');

  });

  

  // Show target panel with display: flex (correct layout, not 'block' which breaks flexbox)

  const targetPanel = document.getElementById(panelId + '_panel');

  if (targetPanel) {

    targetPanel.style.display = 'flex';

    targetPanel.classList.add('active');

  }

  

  // Add active to all elements with matching panelId

  document.querySelectorAll(`[data-teacher-panel="${panelId}"]`).forEach(item => {

    item.classList.add('active');

  });

  

  const titleEl = document.getElementById('teacher_panel_title');

  const mobTitleEl = document.getElementById('teacher_mobile_panel_title');

  let panelTitleText = '';

  

  if (panelId === 'teacher_daily_schedule') {

    panelTitleText = '๐“… เธ•เธฒเธฃเธฒเธเธชเธญเธเธฃเธฒเธขเธงเธฑเธ';

    if (titleEl) titleEl.innerHTML = panelTitleText;

    if (mobTitleEl) mobTitleEl.innerHTML = panelTitleText;

    loadTeacherDailySchedule();

  } else if (panelId === 'teacher_monthly_salary') {

    panelTitleText = '๐’ต เธฃเธฒเธขเธเธฒเธฃเน€เธเธดเธเน€เธ”เธทเธญเธเธเธญเธเธเธฑเธ';

    if (titleEl) titleEl.innerHTML = panelTitleText;

    if (mobTitleEl) mobTitleEl.innerHTML = panelTitleText;

    loadTeacherYearlySalary();

  } else if (panelId === 'evaluation_form') {

    panelTitleText = '๐“ เนเธเธเธฃเธฐเน€เธกเธดเธเธเธฅเธเธฒเธฃเน€เธฃเธตเธขเธ';

    if (titleEl) titleEl.innerHTML = panelTitleText;

    if (mobTitleEl) mobTitleEl.innerHTML = panelTitleText;

    initEvaluationForm();

  }

  

  // Update mobile profile name

  if (state.currentUser) {

    const mobNameEl = document.getElementById('teacher_mobile_name');

    if (mobNameEl) {

      mobNameEl.textContent = state.currentUser.nickname || state.currentUser.username || 'เธเธธเธ“เธเธฃเธน';

    }

  }

}



function loadTeacherDailySchedule() {

  if (!state.currentUser) return;

  const teacherName = state.currentUser.name;

  const nickname = state.currentUser.nickname;

  

  const startVal = document.getElementById('teacher_filter_start_date').value;

  const endVal = document.getElementById('teacher_filter_end_date').value;

  

  if (!startVal || !endVal) {

    showToast('เธเธฃเธธเธ“เธฒเธฃเธฐเธเธธเธเนเธงเธเธงเธฑเธเธ—เธตเนเนเธซเนเธเธฃเธเธ–เนเธงเธ', 'warning');

    return;

  }

  

  setLoading(true, 'เธเธณเธฅเธฑเธเนเธซเธฅเธ”เธ•เธฒเธฃเธฒเธเธชเธญเธ...');

  

  google.script.run

    .withSuccessHandler(logs => {

      setLoading(false);

      const container = document.getElementById('teacher_schedule_container');

      container.innerHTML = '';

      

      if (!logs || logs.error) {

        container.innerHTML = `<div style="text-align: center; color: var(--color-error); padding: 40px; width: 100%;">เน€เธเธดเธ”เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”: ${logs ? logs.error : 'เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เธ”เธถเธเธเนเธญเธกเธนเธฅเนเธ”เน'}</div>`;

        return;

      }

      

      const start = new Date(startVal + 'T00:00:00');

      const end = new Date(endVal + 'T23:59:59');

      

      const filtered = logs.filter(c => {

        if (!c.date) return false;

        const parts = c.date.split('/');

        if (parts.length !== 3) return false;

        let y = parseInt(parts[2]);

        if (y > 2400) y -= 543; // เนเธเธฅเธ เธ.เธจ. โ’ เธ.เธจ.

        const cDate = new Date(y, parseInt(parts[1]) - 1, parseInt(parts[0]));

        return cDate >= start && cDate <= end;

      });

      

      filtered.sort((a, b) => {

        const partsA = a.date.split('/');

        const partsB = b.date.split('/');

        const dateA = new Date(parseInt(partsA[2]), parseInt(partsA[1]) - 1, parseInt(partsA[0]));

        const dateB = new Date(parseInt(partsB[2]), parseInt(partsB[1]) - 1, parseInt(partsB[0]));

        if (dateA.getTime() !== dateB.getTime()) {

          return dateA - dateB; // Ascending order: earliest date first

        }

        return a.timeStart.localeCompare(b.timeStart);

      });

      

      if (filtered.length === 0) {

        container.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 40px; width: 100%;">เนเธกเนเธกเธตเธเนเธญเธกเธนเธฅเธ•เธฒเธฃเธฒเธเน€เธฃเธตเธขเธเนเธเธเนเธงเธเน€เธงเธฅเธฒเธ—เธตเนเน€เธฅเธทเธญเธ</div>';

        return;

      }

      

      // Group filtered logs by date

      const groupedByDate = {};

      filtered.forEach(c => {

        if (!groupedByDate[c.date]) {

          groupedByDate[c.date] = [];

        }

        groupedByDate[c.date].push(c);

      });

      

      // Get dates in sorted order (earliest first, since we sorted filtered in ascending order)

      const sortedDates = Object.keys(groupedByDate).sort((a, b) => {

        const partsA = a.split('/');

        const partsB = b.split('/');

        const dateA = new Date(parseInt(partsA[2]), parseInt(partsA[1]) - 1, parseInt(partsA[0]));

        const dateB = new Date(parseInt(partsB[2]), parseInt(partsB[1]) - 1, parseInt(partsB[0]));

        return dateA - dateB;

      });

      

      sortedDates.forEach(dateStr => {

        const dateHeader = document.createElement('div');

        dateHeader.className = 'teacher-date-header';

        dateHeader.style.cssText = 'grid-column: 1 / -1; margin-top: 16px; margin-bottom: 8px; font-weight: 700; font-size: 0.95rem; color: var(--color-primary-hover); border-bottom: 2px solid var(--color-primary); padding-bottom: 4px; display: flex; align-items: center; gap: 6px;';

        dateHeader.innerHTML = `๐“… เธงเธฑเธเธ—เธตเนเน€เธฃเธตเธขเธ: ${dateStr}`;

        container.appendChild(dateHeader);

        

        // Wrapper for 3 columns horizontal row

        const rowWrapper = document.createElement('div');

        rowWrapper.className = 'teacher-day-row-wrapper';

        rowWrapper.style.cssText = 'grid-column: 1 / -1; display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; width: 100%;';

        container.appendChild(rowWrapper);

        

        // Show all classes for this day

        const dayClasses = groupedByDate[dateStr];

        

        dayClasses.forEach(c => {

          const isReg = (c.teacherRegular || '').toLowerCase().trim() === (nickname || '').toLowerCase().trim() || (c.teacherRegular || '').toLowerCase().trim() === (teacherName || '').toLowerCase().trim();

          const roleClass = isReg ? 'regular' : 'sub';

          const roleLabel = isReg ? 'เธเธฃเธนเธเธฃเธฐเธเธณ' : 'เธชเธญเธเนเธ—เธ';

          

          // เธฃเธญเธเธฃเธฑเธ field เธเธฒเธ getClassLogsForTeacher (isLeave) เนเธฅเธฐ getTeacherRoomSchedule (leaveCount)

          const leaveCount = parseInt(c.leaveCount) || parseInt(c.isLeave) || 0;

          const totalKids = (parseInt(c.isPresentLive) || 0) + (parseInt(c.isPresentOnline) || 0) + (parseInt(c.isMakeup) || 0);
          
          const attendances = [];
          attendances.push(`เธชเธ”: ${c.isPresentLive || 0}`);
          attendances.push(`เธญเธญเธ: ${c.isPresentOnline || 0}`);
          attendances.push(`เธฅเธฒ: ${c.isLeave || 0}`);
          attendances.push(`เธเธฒเธ”: ${c.isAbsent || 0}`);
          attendances.push(`เธเธ”: ${c.isMakeup || 0}`);
          const attendanceSummaryHtml = attendances.length > 0 
            ? `<div style="font-size: 0.72rem; margin-top: 4px; color: var(--color-primary-hover); font-weight: 500;">๐‘ฅ ${attendances.join(' ')}</div>` 
            : '';


          

          // Clean roomBranch: strip Zoom details

          let displayBranch = (c.roomBranch || c.roomBranchInfo || '').toString().trim();

          // Remove Zoom 001, Zoom 002, etc. (case insensitive)

          displayBranch = displayBranch.replace(/Zoom\s*\S*/i, '').replace(/\s+/g, ' ').trim();

          

          const card = document.createElement('div');

          card.className = 'teacher-card';

          

          let noteHtml = '';

          const noteText = (c.note || c.memo || '').toString().trim();

          if (noteText !== '' && noteText !== '-') {

            noteHtml = `<div class="teacher-card-note" style="font-size: 0.72rem; padding: 6px 10px;">๐“ <b>เธซเธกเธฒเธขเน€เธซเธ•เธธ:</b> ${noteText}</div>`;

          }

          

          const isTeacherLeave = noteText.includes('เธเธฃเธนเธฅเธฒ');

          // เธ•เธฃเธงเธเธชเธญเธเธงเนเธฒเน€เธเนเธเธเธฅเธฒเธชเน€เธ”เธตเนเธขเธง/เธเธฅเธธเนเธกเธขเนเธญเธข เธซเธฃเธทเธญเธเธฅเธธเนเธกเธซเธฅเธฑเธ
          const subjectLower = (c.subject || '').toLowerCase();
          const isPrivateOrSubGroup = subjectLower.includes('เน€เธ”เธตเนเธขเธง') || subjectLower.includes('เธขเนเธญเธข');
          const hasStudentLeave = leaveCount > 0 && isPrivateOrSubGroup;

          

          if (hasStudentLeave) {

            card.style.backgroundColor = 'rgb(254, 226, 226)';

            card.style.borderColor = 'rgba(239, 68, 68, 0.5)';

            card.style.borderWidth = '2px';

          } else if (c.teacherConfirmed) {

            card.style.backgroundColor = 'rgba(25, 135, 84, 0.08)';

            card.style.borderColor = 'rgba(25, 135, 84, 0.3)';

          } else if (isTeacherLeave) {

            card.style.backgroundColor = 'rgb(254, 226, 226)';

            card.style.borderColor = 'rgba(239, 68, 68, 0.35)';

          }



          card.innerHTML = `

            <div class="teacher-card-header" style="padding-bottom: 8px; display: flex; justify-content: space-between; align-items: flex-start;">

              <span class="teacher-card-time" style="font-size: 0.78rem; padding: 3px 10px; font-weight: 700; color: #fff; background: ${hasStudentLeave ? '#ef4444' : (c.teacherConfirmed ? '#15803d' : '#3b82f6')}; border-radius: 20px;">โฐ ${cleanTimeStr(c.timeStart)} - ${cleanTimeStr(c.timeEnd)}</span>

              <div style="display: flex; gap: 4px;">
                <span class="teacher-card-badge ${roleClass}" style="font-size: 0.65rem; padding: 2px 6px;">${roleLabel}</span>
              </div>

            </div>

            <div class="teacher-card-subject" style="font-size: 0.85rem; font-weight: 700; margin: 2px 0; color: var(--text-main);">${c.subject}</div>

            <div class="teacher-card-meta" style="gap: 4px; font-size: 0.74rem;">
              ${attendanceSummaryHtml}

              <div class="teacher-card-meta-item" style="font-size: 0.74rem;">

                <span class="label" style="min-width: 65px; font-size: 0.72rem;">๐“ เธชเธฒเธเธฒ/เธซเนเธญเธเน€เธฃเธตเธขเธ:</span>

                <span class="value" style="font-weight: 600;">${displayBranch}</span>

              </div>

              <div class="teacher-card-meta-item" style="font-size: 0.74rem;">
                <span class="label" style="min-width: 65px; font-size: 0.72rem;">๐‘จโ€๐ซ เธเธฃเธนเธเธฃเธฐเธเธณ:</span>
                <span class="value">${c.teacherRegular || '-'}</span>
              </div>

              ${c.teacherSub ? `<div class="teacher-card-meta-item" style="font-size: 0.74rem;">
                <span class="label" style="min-width: 65px; font-size: 0.72rem;">๐” เธเธฃเธนเนเธ—เธ:</span>
                <span class="value" style="color: var(--color-danger);">${c.teacherSub}</span>
              </div>` : ''}

              <div class="teacher-card-meta-item" style="gap: 8px; flex-wrap: wrap; margin-top: 2px;">

                <span class="teacher-card-badge hours" style="font-size: 0.7rem; padding: 2px 8px;">โณ ${formatHoursMinutes(c.hours)}</span>

                <span class="teacher-card-badge students" style="font-size: 0.7rem; padding: 2px 8px;">๐‘ฅ เธเธฑเธเน€เธฃเธตเธขเธ ${totalKids} เธเธ</span>

                ${hasStudentLeave ? `<span class="teacher-card-badge" style="font-size: 0.7rem; padding: 2px 8px; background: #ef4444; color: #fff; font-weight: bold; margin-left: 4px;">๐จ เธเนเธญเธเธฅเธฒ ${leaveCount} เธเธ</span>` : ''}

              </div>

            </div>

            ${noteHtml}

            <div style="border-top: 1px dashed rgba(0,0,0,0.1); margin-top: 6px; padding-top: 6px; display: flex; align-items: center; justify-content: space-between; gap: 6px;">

              ${isReg ? `
              <label style="display: flex; align-items: center; gap: 5px; font-size: 0.74rem; cursor: pointer; font-weight: 600; color: var(--color-danger);">

                <input type="checkbox" class="teacher-kru-leave-chk" data-row="${c.rowIndex}" ${noteText.includes('เธเธฃเธนเธฅเธฒ') ? 'checked' : ''} onchange="handleTeacherLeaveToggle(${c.rowIndex}, this)" style="width: 16px; height: 16px; cursor: pointer; accent-color: var(--color-danger);">

                ๐‘จ๐ซ เธเธฃเธนเธฅเธฒ

              </label>
              ` : `<div></div>`}

              <label style="display: flex; align-items: center; gap: 5px; font-size: 0.74rem; cursor: pointer; font-weight: 600; color: var(--color-success);">

                <input type="checkbox" class="teacher-daily-confirm-chk" data-row="${c.rowIndex}" ${c.teacherConfirmed ? 'checked' : ''} onchange="toggleDailyScheduleConfirm(${c.rowIndex}, this)" style="width: 16px; height: 16px; cursor: pointer; accent-color: var(--color-success);">

                โ… เธขเธทเธเธขเธฑเธเธ•เธฃเธงเธเธชเธญเธ

              </label>

            </div>

          `;

          rowWrapper.appendChild(card);

        });

      });

    })

    .withFailureHandler(err => {

      setLoading(false);

      const container = document.getElementById('teacher_schedule_container');

      if (container) container.innerHTML = `<div style="text-align:center;color:var(--color-error);padding:40px">เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เนเธซเธฅเธ”เธ•เธฒเธฃเธฒเธเธชเธญเธเนเธ”เน: ${err ? err.message : 'เน€เธเธดเธ”เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”'}</div>`;

      showToast('เธ”เธถเธเธเนเธญเธกเธนเธฅเธ•เธฒเธฃเธฒเธเธชเธญเธเธฅเนเธกเน€เธซเธฅเธง: ' + (err ? err.message : 'เน€เธเธดเธ”เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”'), 'error');

    })

    .getClassLogsForTeacher(state.currentUser.username, nickname);

}



function getCustomMonthRange(year, month) {

  let startStr, endStr;

  const yStr = year.toString();

  const prevYStr = (year - 1).toString();

  

  // Helper to check if a year is leap year

  const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);

  

  switch (month) {

    case 1:  // เธก.เธ.

      startStr = `${prevYStr}-12-29`;

      endStr = `${yStr}-01-28`;

      break;

    case 2:  // เธ.เธ.

      startStr = `${yStr}-01-29`;

      endStr = `${yStr}-02-28`;

      break;

    case 3:  // เธกเธต.เธ.

      startStr = isLeap ? `${yStr}-02-29` : `${yStr}-03-01`;

      endStr = `${yStr}-03-28`;

      break;

    case 4:  // เน€เธก.เธข.

      startStr = `${yStr}-03-29`;

      endStr = `${yStr}-04-28`;

      break;

    case 5:  // เธ.เธ.

      startStr = `${yStr}-04-29`;

      endStr = `${yStr}-05-28`;

      break;

    case 6:  // เธกเธด.เธข.

      startStr = `${yStr}-05-29`;

      endStr = `${yStr}-06-28`;

      break;

    case 7:  // เธ.เธ.

      startStr = `${yStr}-06-29`;

      endStr = `${yStr}-07-28`;

      break;

    case 8:  // เธช.เธ.

      startStr = `${yStr}-07-29`;

      endStr = `${yStr}-08-28`;

      break;

    case 9:  // เธ.เธข.

      startStr = `${yStr}-08-29`;

      endStr = `${yStr}-09-28`;

      break;

    case 10: // เธ•.เธ.

      startStr = `${yStr}-09-29`;

      endStr = `${yStr}-10-28`;

      break;

    case 11: // เธ.เธข.

      startStr = `${yStr}-10-29`;

      endStr = `${yStr}-11-28`;

      break;

    case 12: // เธ.เธ.

      startStr = `${yStr}-11-29`;

      endStr = `${yStr}-12-28`;

      break;

    default:

      startStr = `${yStr}-${month < 10 ? '0' + month : month}-01`;

      const lastDay = new Date(year, month, 0).getDate();

      endStr = `${yStr}-${month < 10 ? '0' + month : month}-${lastDay}`;

  }

  return { startDateStr: startStr, endDateStr: endStr };

}



function loadTeacherYearlySalary() {

  if (!state.currentUser) return;

  const teacherNick = state.currentUser.nickname || state.currentUser.username;

  const yearPicker = document.getElementById('teacher_salary_year_picker');

  if (!yearPicker) return;

  const selectedYear = parseInt(yearPicker.value);

  

  // Read current month from picker

  const monthPicker = document.getElementById('teacher_salary_month_picker');

  const selectedMonth = monthPicker ? parseInt(monthPicker.value) : 1;

  

  setLoading(true, 'เธเธณเธฅเธฑเธเธเธณเธเธงเธ“เธฃเธฒเธขเนเธ”เนเธ—เธฑเนเธเธซเธกเธ” 12 เน€เธ”เธทเธญเธ...');

  

  // Hide tabs and details card until loaded

  const tabsContainer = document.getElementById('teacher_salary_tabs_container');

  if (tabsContainer) tabsContainer.style.display = 'none';

  const resultCard = document.getElementById('teacher_salary_result_card');

  if (resultCard) resultCard.style.display = 'none';

  

  // Reset yearly values

  const totalPayEl = document.getElementById('yearly_salary_total_pay');

  if (totalPayEl) totalPayEl.innerText = 'เธฟ0';

  const totalHoursEl = document.getElementById('yearly_salary_total_hours');

  if (totalHoursEl) totalHoursEl.innerText = '0 เธเธก.';

  const totalClassesEl = document.getElementById('yearly_salary_total_classes');

  if (totalClassesEl) totalClassesEl.innerText = '0 เธเธฅเธฒเธช';

  

  google.script.run

    .withSuccessHandler(res => {

      setLoading(false);

      if (!res || !res.success || !res.months) {

        showToast('เน€เธเธดเธ”เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”เนเธเธเธฒเธฃเธเธณเธเธงเธ“เน€เธเธดเธเน€เธ”เธทเธญเธ: ' + (res ? res.error : 'เนเธกเนเธเธเธเนเธญเธกเธนเธฅ'), 'error');

        return;

      }

      

      // Save globally in state

      state.yearlySalaryData = res;

      

      // Calculate sums across all 12 months

      let yearlyPay = 0;

      let yearlyHours = 0;

      let yearlyClasses = 0;

      

      for (let m = 1; m <= 12; m++) {

        const monthRes = res.months[m];

        if (monthRes && monthRes.success) {

          yearlyPay += monthRes.totalPay || 0;

          yearlyHours += monthRes.totalHours || 0;

          yearlyClasses += monthRes.totalClasses || 0;

        }

      }

      

      // Update yearly banner displays

      if (totalPayEl) totalPayEl.innerText = 'เธฟ' + Math.round(yearlyPay).toLocaleString();

      if (totalHoursEl) totalHoursEl.innerText = (Math.round(yearlyHours * 100) / 100).toLocaleString() + ' เธเธก.';

      if (totalClassesEl) totalClassesEl.innerText = yearlyClasses.toLocaleString() + ' เธเธฅเธฒเธช';

      

      // Show Month Tabs container

      if (tabsContainer) tabsContainer.style.display = 'flex';

      

      // Set selected month active

      switchMonthTab(selectedMonth);

    })

    .withFailureHandler(err => {

      setLoading(false);

      console.error("Yearly calculation failed:", err);

      showToast('เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เน€เธเธทเนเธญเธกเธ•เนเธญเน€เธเธดเธฃเนเธเน€เธงเธญเธฃเนเนเธ”เน: ' + err.message, 'error');

    })

    .calculateTeacherYearlyPay(state.currentUser.username, selectedYear, getLogUser());

}



function handleMonthPickerChange() {

  const monthPicker = document.getElementById('teacher_salary_month_picker');

  if (!monthPicker) return;

  const selectedMonth = parseInt(monthPicker.value);

  

  if (state.yearlySalaryData && state.yearlySalaryData.months) {

    switchMonthTab(selectedMonth);

  } else {

    loadTeacherYearlySalary();

  }

}



function switchMonthTab(m) {

  if (!state.yearlySalaryData || !state.yearlySalaryData.months) return;

  

  // Set active class on buttons

  const buttons = document.querySelectorAll('.month-tab-btn');

  buttons.forEach(btn => btn.classList.remove('active'));

  

  const activeBtn = document.getElementById('month_tab_' + m);

  if (activeBtn) activeBtn.classList.add('active');

  

  // Update month picker dropdown to match

  const monthPicker = document.getElementById('teacher_salary_month_picker');

  if (monthPicker) {

    monthPicker.value = m;

  }

  

  const monthRes = state.yearlySalaryData.months[m];

  if (monthRes) {

    const monthNames = [

      'เธกเธเธฃเธฒเธเธก', 'เธเธธเธกเธ เธฒเธเธฑเธเธเน', 'เธกเธตเธเธฒเธเธก', 'เน€เธกเธฉเธฒเธขเธ',

      'เธเธคเธฉเธ เธฒเธเธก', 'เธกเธดเธ–เธธเธเธฒเธขเธ', 'เธเธฃเธเธเธฒเธเธก', 'เธชเธดเธเธซเธฒเธเธก',

      'เธเธฑเธเธขเธฒเธขเธ', 'เธ•เธธเธฅเธฒเธเธก', 'เธเธคเธจเธเธดเธเธฒเธขเธ', 'เธเธฑเธเธงเธฒเธเธก'

    ];

    monthRes.monthName = monthNames[m - 1];

    renderTeacherSalaryDetail(monthRes);

  }

}



function renderTeacherSalaryDetail(res) {

  const resultCard = document.getElementById('teacher_salary_result_card');

  if (!resultCard) return;

  

  resultCard.style.display = 'block';

  

  // Format Thai Date or Short representation

  const formatIsoDateToThai = (isoDateStr) => {

    if (!isoDateStr) return '';

    // isoDateStr is yyyy-mm-dd or dd/mm/yyyy

    if (isoDateStr.includes('/')) return formatDateToThai(isoDateStr);

    const parts = isoDateStr.split('-');

    if (parts.length === 3) {

      return formatDateToThai(`${parts[2]}/${parts[1]}/${parts[0]}`);

    }

    return isoDateStr;

  };

  

  const dateRangeStr = (res.startDate && res.endDate) ? ` (${formatIsoDateToThai(res.startDate)} - ${formatIsoDateToThai(res.endDate)})` : '';

  const titleText = res.monthName ? `๐“ เธชเธฃเธธเธเธฃเธฒเธขเธฃเธฑเธเธเนเธฒเธชเธญเธเธเธฃเธฐเธเธณเน€เธ”เธทเธญเธ ${res.monthName}${dateRangeStr}` : '๐“ เธชเธฃเธธเธเธฃเธฒเธขเธฃเธฑเธเธเนเธฒเธชเธญเธเธเธฃเธฐเธเธณเน€เธ”เธทเธญเธ';

  document.getElementById('teacher_salary_result_title').innerText = titleText;

  

  let sumMinutes = 0;

  res.classes.forEach(c => {

      // if (c.numKids > 0) {
      sumMinutes += parseHoursLeftToMinutes(c.hours);

      // }
  });

  const sumHoursPart = Math.floor(sumMinutes / 60);

  const sumMinPart = sumMinutes % 60;

  const formattedSumHours = `${sumHoursPart} เธเธก. ${sumMinPart} เธเธฒเธ—เธต`;



  document.getElementById('teacher_salary_net_pay').innerText = 'เธฃเธฒเธขเนเธ”เนเธชเธธเธ—เธเธด: เธฟ' + (res.netPay !== undefined ? res.netPay : res.totalPay || 0).toLocaleString();
  
  if (document.getElementById('ts_adj_bonus')) {
    document.getElementById('ts_adj_bonus').innerText = 'เธฟ' + (res.adjustmentBonus || 0).toLocaleString();
    document.getElementById('ts_adj_deduction').innerText = 'เธฟ' + (res.adjustmentDeduction || 0).toLocaleString();
    document.getElementById('ts_adj_insurance').innerText = 'เธฟ' + (res.insuranceDeduction || 0).toLocaleString();
    document.getElementById('ts_adj_insurance_progress').innerText = '(เธชเธฐเธชเธก: ' + (res.insuranceRunningTotal || 0).toLocaleString() + ' / 2,000)';
  }

  document.getElementById('teacher_salary_total_hours').innerText = formattedSumHours;

  document.getElementById('teacher_salary_total_classes').innerText = (res.totalClasses || 0).toLocaleString() + ' เธเธฅเธฒเธช';

  

  const tbody = document.getElementById('teacher_salary_classes_tbody');

  tbody.innerHTML = '';

  

  res.classes.forEach(c => {

    const tr = document.createElement('tr');

    

    let isSub = false;

    let displayRole = c.role || 'เธเธฃเธนเธเธฃเธฐเธเธณ';

    if (displayRole === 'sub' || displayRole.includes('เธชเธญเธเนเธ—เธ') || displayRole.includes('เธเธฃเธนเนเธ—เธ')) {

      displayRole = 'เธเธฃเธนเนเธ—เธ';

      isSub = true;

    } else {

      displayRole = 'เธเธฃเธนเธเธฃเธฐเธเธณ';

    }

    

    if (isSub) {

      tr.style.backgroundColor = '#fff9cc';

    }

    if (c.teacherConfirmed) {

      tr.style.backgroundColor = 'rgba(25, 135, 84, 0.12)';

    }

    

    tr.style.whiteSpace = 'nowrap';

    tr.style.fontSize = '0.70rem';

    

    tr.innerHTML = `

      <td>${formatDateToThai(c.date)}</td>

      <td><div style="font-weight:600;">${c.subject}</div></td>

      <td>${(c.room || '-').replace(/\s*zoom\s*\d*/gi, '').trim() || '-'}</td>

      <td>${formatHoursMinutes(c.hours)}</td>

      <td style="text-align: center;">${c.numKids} เธเธ<br><span style="font-size: 0.6rem; color: #6c757d;">(เธชเธ”:${c.isPresentLive || 0}, เธญเธญเธ:${c.isPresentOnline || 0}, เธเธ”:${c.isMakeup || 0})</span></td>

      <td><span class="badge ${isSub ? 'badge-warning' : 'badge-info'}" style="font-size: 0.65rem; padding: 4px 8px; font-weight: 600; border-radius: 6px;">${displayRole}</span></td>

      <td style="text-align: right;">เธฟ${c.rate.toLocaleString()}</td>

      <td style="text-align: right; font-weight:600; color:var(--color-success);">เธฟ${c.pay.toLocaleString()}</td>

      <td style="text-align: center;">

        <input type="checkbox" ${c.teacherConfirmed ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--color-success);" onchange="updateTeacherConfirm(${c.rowIndex}, this, ${isSub})">

      </td>

    `;

    tbody.appendChild(tr);

  });

  

  if (res.classes.length === 0) {

    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 40px;">เนเธกเนเธเธเธฃเธฒเธขเธเธฒเธฃเธชเธญเธเธเธญเธเธเธธเธ“เธเธฃเธนเนเธเธเนเธงเธเน€เธงเธฅเธฒเธ—เธตเนเธฃเธฐเธเธธ</td></tr>`;

  }

  

  // Smooth scroll to top of panel so toolbar is visible

  const panel = document.getElementById('teacher_monthly_salary_panel');

  if (panel) {

    panel.scrollTo({ top: 0, behavior: 'smooth' });

  }

}



function updateTeacherConfirm(rowIndex, cb, isSub) {

  const tr = cb.closest('tr');

  if (cb.checked) {

    tr.style.backgroundColor = 'rgba(25, 135, 84, 0.12)';

  } else {

    tr.style.backgroundColor = isSub ? '#fff9cc' : '';

  }

  

  google.script.run

    .withSuccessHandler(res => {

      if (res && res.success) {

        showToast('เธเธฑเธเธ—เธถเธเธเธฒเธฃเธขเธทเธเธขเธฑเธเธ•เธฃเธงเธเธชเธญเธเธชเธณเน€เธฃเนเธเนเธฅเนเธง!', 'success');

      } else {

        showToast('เน€เธเธดเธ”เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”เนเธเธเธฒเธฃเธเธฑเธเธ—เธถเธเธเธฒเธฃเธขเธทเธเธขเธฑเธ: ' + (res ? res.error : 'unknown'), 'error');

        // Revert UI

        cb.checked = !cb.checked;

        tr.style.backgroundColor = cb.checked ? 'rgba(25, 135, 84, 0.12)' : (isSub ? '#fff9cc' : '');

      }

    })

    .withFailureHandler(err => {

      showToast('เธเธฒเธฃเน€เธเธทเนเธญเธกเธ•เนเธญเธฅเนเธกเน€เธซเธฅเธง: ' + err.message, 'error');

      // Revert UI

      cb.checked = !cb.checked;

      tr.style.backgroundColor = cb.checked ? 'rgba(25, 135, 84, 0.12)' : '';

    })

    .toggleTeacherConfirmInSheet(rowIndex, cb.checked);

}



function toggleDailyScheduleConfirm(rowIndex, cb) {

  const card = cb.closest('.teacher-card');

  if (cb.checked) {

    card.style.backgroundColor = 'rgba(25, 135, 84, 0.08)';

    card.style.borderColor = 'rgba(25, 135, 84, 0.3)';

  } else {

    card.style.backgroundColor = '';

    card.style.borderColor = '';

  }

  

  google.script.run

    .withSuccessHandler(res => {

      if (res && res.success) {

        showToast('เธเธฑเธเธ—เธถเธเธเธฒเธฃเธขเธทเธเธขเธฑเธเธ•เธฃเธงเธเธชเธญเธเธเธฅเธฒเธชเธชเธณเน€เธฃเนเธ!', 'success');

      } else {

        showToast('เธเธฒเธฃเธเธฑเธเธ—เธถเธเธขเธทเธเธขเธฑเธเธเธดเธ”เธเธฅเธฒเธ”: ' + (res ? res.error : 'unknown'), 'error');

        cb.checked = !cb.checked;

        if (cb.checked) {

          card.style.backgroundColor = 'rgba(25, 135, 84, 0.08)';

          card.style.borderColor = 'rgba(25, 135, 84, 0.3)';

        } else {

          card.style.backgroundColor = '';

          card.style.borderColor = '';

        }

      }

    })

    .withFailureHandler(err => {

      showToast('เน€เธเธทเนเธญเธกเธ•เนเธญเนเธกเนเธชเธณเน€เธฃเนเธ: ' + err.message, 'error');

      cb.checked = !cb.checked;

      if (cb.checked) {

        card.style.backgroundColor = 'rgba(25, 135, 84, 0.08)';

        card.style.borderColor = 'rgba(25, 135, 84, 0.3)';

      } else {

        card.style.backgroundColor = '';

        card.style.borderColor = '';

      }

    })

    .toggleTeacherConfirmInSheet(rowIndex, cb.checked);

}



function toggleDailyGridConfirm(rowIndex, isChecked) {

  setLoading(true, 'เธเธณเธฅเธฑเธเธเธฑเธเธ—เธถเธเธชเธ–เธฒเธเธฐเธเธฒเธฃเธขเธทเธเธขเธฑเธ...');

  google.script.run

    .withSuccessHandler(res => {

      setLoading(false);

      if (res && res.success) {

        showToast('เธญเธฑเธเน€เธ”เธ•เธเธฒเธฃเธขเธทเธเธขเธฑเธเธเธฒเธฃเธชเธญเธเธชเธณเน€เธฃเนเธ!', 'success');

        // Update local classLogs state

        const log = (state.classLogs || []).find(l => l.rowIndex === rowIndex);

        if (log) {

          log.teacherConfirmed = isChecked ? 1 : 0;

        }

        renderDailyGrid();

      } else {

        showToast('เธเธฒเธฃเธเธฑเธเธ—เธถเธเธขเธทเธเธขเธฑเธเธเธดเธ”เธเธฅเธฒเธ”: ' + (res ? res.error : 'unknown'), 'error');

        renderDailyGrid();

      }

    })

    .withFailureHandler(err => {

      setLoading(false);

      showToast('เน€เธเธทเนเธญเธกเธ•เนเธญเนเธกเนเธชเธณเน€เธฃเนเธ: ' + err.message, 'error');

      renderDailyGrid();

    })

    .toggleTeacherConfirmInSheet(rowIndex, isChecked);

}



function getLogUser() {

  return state.currentUser ? state.currentUser.username : 'System';

}



function startHeartbeat() {

  if (state.heartbeatInterval) clearInterval(state.heartbeatInterval);

  runUserHeartbeat(); // run immediately

  state.heartbeatInterval = setInterval(runUserHeartbeat, 60000); // every 60s

}



function runUserHeartbeat() {

  const user = getLogUser();

  if (!user || user === 'System') return;

  

  window._nextTaskSilent = true;

  google.script.run

    .withSuccessHandler(activeUsers => {

      if (Array.isArray(activeUsers)) {

        updateOnlineUsers(activeUsers);

      }

    })

    .pingActiveUser(user);

}



function updateOnlineUsers(userList) {

  const countSpan = document.getElementById('online_count');

  const listDiv = document.getElementById('online_users_list');

  if (!countSpan || !listDiv) return;

  

  countSpan.innerText = userList.length;

  listDiv.innerHTML = '';

  

  if (userList.length === 0) {

    listDiv.innerHTML = '<span style="color: var(--text-muted); font-size: 0.68rem;">เนเธกเนเธกเธตเธเธนเนเนเธเนเธญเธทเนเธเธญเธญเธเนเธฅเธเน</span>';

    return;

  }

  

  userList.forEach(user => {

    const badge = document.createElement('span');

    badge.className = 'online-badge';

    badge.style.display = 'inline-flex';

    badge.style.alignItems = 'center';

    badge.style.padding = '2px 6px';

    badge.style.background = 'rgba(0, 132, 255, 0.1)';

    badge.style.border = '1px solid rgba(0, 132, 255, 0.2)';

    badge.style.borderRadius = '4px';

    badge.style.color = '#0084ff';

    badge.style.fontWeight = '500';

    badge.style.fontSize = '0.65rem';

    badge.innerText = user;

    listDiv.appendChild(badge);

  });

}



// Bootstrap Application data after login

function bootApp() {

  setLoading(true, 'เธเธณเธฅเธฑเธเนเธซเธฅเธ”เธเนเธญเธกเธนเธฅเธเธทเนเธเธเธฒเธ...');

  

  // Load initial configurations

  google.script.run

    .withSuccessHandler(settings => {

      setLoading(false);

      let initialPanel = 'daily_grid';

      if (settings && !settings.error) {

        state.settings = settings;

        state.rooms = settings.rooms || [];

        populateDropdowns();

        populateRoomsDatalist();

        

        // Load student list for unique attendance calculations

        window._nextTaskSilent = true;

        fetchCachedStudents(true);

        

        // Apply Access Control based on user role

        applyRoleAccessControl();

        

        if (state.currentUser && (state.currentUser.role === 'Teacher' || state.currentUser.role === 'เธเธฃเธน')) {

          initialPanel = 'teacher_schedule';

        }

      } else {

        showToast('เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เนเธซเธฅเธ”เธเนเธญเธกเธนเธฅเธเธฒเธฃเธ•เธฑเนเธเธเนเธฒเนเธ”เน: ' + (settings ? settings.error : 'unknown'), 'error');

      }

      switchPanel(initialPanel);

      

      // Run global checks silently on boot

      window._nextTaskSilent = true;

      checkLowBalanceStudents();

      window._nextTaskSilent = true;

      checkTeacherLeaves();

      updateTaskWidget();

    })

    .withFailureHandler(err => {

      setLoading(false);

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

  document.querySelectorAll('.branch-tab[data-branch]').forEach(tab => {

    tab.addEventListener('click', () => {

      document.querySelectorAll('.branch-tab[data-branch]').forEach(t => t.classList.remove('active'));

      tab.classList.add('active');

      state.activeBranchFilter = tab.getAttribute('data-branch');

      if (monthlyViewState.mode === 'monthly' && monthlyViewState.monthlyData) {

        renderMonthlyGrid(monthlyViewState.monthlyData);

      } else {

        renderDailyGrid();

      }

    });

  });

  

  // Set default dates

  const todayStr = getTodayString();

  

  // Calculate current month's first and last day

  const initTodayDate = new Date();

  const initCurrentYear = initTodayDate.getFullYear();

  const initCurrentMonth = initTodayDate.getMonth() + 1; // 1-indexed

  const firstDayStr = `${initCurrentYear}-${String(initCurrentMonth).padStart(2, '0')}-01`;

  const lastDayVal = new Date(initCurrentYear, initCurrentMonth, 0).getDate();

  const lastDayStr = `${initCurrentYear}-${String(initCurrentMonth).padStart(2, '0')}-${String(lastDayVal).padStart(2, '0')}`;

  

  if (document.getElementById('log_start_date')) {

    document.getElementById('log_start_date').value = firstDayStr;

  }

  if (document.getElementById('log_end_date')) {

    document.getElementById('log_end_date').value = lastDayStr;

  }

  

  if (document.getElementById('daily_grid_filter_date')) document.getElementById('daily_grid_filter_date').value = todayStr;

  if (document.getElementById('class_date')) document.getElementById('class_date').value = todayStr;

  if (document.getElementById('student_pay_date')) document.getElementById('student_pay_date').value = todayStr;

  if (document.getElementById('checkin_date')) document.getElementById('checkin_date').value = todayStr;

  if (document.getElementById('checkout_date')) document.getElementById('checkout_date').value = todayStr;

  

  if (document.getElementById('teacher_schedule_date')) {

    document.getElementById('teacher_schedule_date').value = todayStr;

  }

  

  // Set display strings for dates

  setTimeout(() => {

    if (document.getElementById('daily_grid_date_display')) {

      document.getElementById('daily_grid_date_display').innerText = formatDateToThaiShort(todayStr);

    }

    if (document.getElementById('class_log_date_display')) {

      document.getElementById('class_log_date_display').innerText = `${formatDateToThaiShort(firstDayStr)} - ${formatDateToThaiShort(lastDayStr)}`;

    }

    if (document.getElementById('teacher_schedule_date_display')) {

      document.getElementById('teacher_schedule_date_display').innerText = formatDateToThaiShort(todayStr);

    }

  }, 100);



  // Set default calculation dates (current month billing)

  const d = new Date();

  const currentYear = d.getFullYear();

  const currentMonth = d.getMonth() + 1;

  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;

  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  

  if (document.getElementById('calc_start_date')) {

    document.getElementById('calc_start_date').value = `${prevYear}-${prevMonth < 10 ? '0' + prevMonth : prevMonth}-29`;

  }

  if (document.getElementById('calc_end_date')) {

    document.getElementById('calc_end_date').value = `${currentYear}-${currentMonth < 10 ? '0' + currentMonth : currentMonth}-28`;

  }



  // Start background auto-refresh interval for critical dynamic data panels

  setInterval(() => {

    const activeEl = document.querySelector('.nav-item.active');

    if (!activeEl) return;

    const panelName = activeEl.getAttribute('data-panel');

    if (panelName === 'daily_grid') {

      window._nextTaskSilent = true;

      loadDailyGrid(true); // Silent reload

    } else if (panelName === 'teacher_schedule') {

      window._nextTaskSilent = true;

      loadTeacherSchedule(true); // Silent reload

    }

    

    // Also periodically check global banners (silently)

    window._nextTaskSilent = true;

    checkLowBalanceStudents();

    window._nextTaskSilent = true;

    checkTeacherLeaves();

  }, 60000); // refresh every 60 seconds (1 minute)

}



function applyRoleAccessControl() {

  const role = state.currentUser ? (state.currentUser.role || '').toString().trim() : '';

  const isTeacher = (role === 'Teacher' || role === 'เธเธฃเธน');

  

  // Hide/Show sidebar menus

  document.querySelectorAll('.nav-item').forEach(item => {

    const panel = item.getAttribute('data-panel');

    if (isTeacher) {

      if (panel === 'teacher_schedule' || panel === 'teacher_payroll' || panel === 'evaluation_form') {

        item.style.display = 'flex';

        // Update text of teacher_payroll link

        if (panel === 'teacher_payroll') {

          item.innerHTML = `<span>๐’ต</span> เธ•เธฒเธฃเธฒเธเธชเธญเธเนเธฅเธฐเธฃเธฒเธขเธฅเธฐเน€เธญเธตเธขเธ”เน€เธเธดเธเน€เธ”เธทเธญเธเธเธญเธเธเธฑเธ`;

        }

      } else {

        item.style.display = 'none';

      }

    } else {

      // Admin/Owner can see all panels

      item.style.display = 'flex';

      // Restore default text

      if (panel === 'teacher_payroll') {

        item.innerHTML = `<span>๐’ต</span> เธเนเธฒเธชเธญเธเธเธฃเธนเธฃเธฒเธขเน€เธ”เธทเธญเธ`;

      }

    }

  });

  

  // Hide action buttons in Daily Grid

  const addBtn = document.getElementById('btn_add_class_log');

  const importBtn = document.getElementById('btn_import_class_log');

  if (addBtn) addBtn.style.display = isTeacher ? 'none' : 'inline-flex';

  if (importBtn) importBtn.style.display = isTeacher ? 'none' : 'inline-flex';

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



function formatPhoneAsYouType(inputElement) {

  let val = inputElement.value.replace(/\D/g, '');

  if (val.length > 10) val = val.slice(0, 10);

  

  let formatted = '';

  if (val.length > 0) {

    if (val.length <= 3) {

      formatted = val;

    } else if (val.length <= 6) {

      formatted = val.slice(0, 3) + '-' + val.slice(3);

    } else {

      formatted = val.slice(0, 3) + '-' + val.slice(3, 6) + '-' + val.slice(6);

    }

  }

  inputElement.value = formatted;

}



function cleanTimeForInput(timeStr) {

  if (!timeStr) return '';

  let str = timeStr.toString().replace(/เธ\./gi, '').trim();

  str = str.replace(/\./g, ':');

  let match = str.match(/^(\d{1,2}):(\d{2})$/);

  if (match) {

    let hr = match[1].padStart(2, '0');

    let min = match[2];

    return `${hr}:${min}`;

  }

  match = str.match(/^(\d{1,2})(\d{2})$/);

  if (match) {

    let hr = match[1].padStart(2, '0');

    let min = match[2];

    return `${hr}:${min}`;

  }

  return '';

}



function stripGarbageDate(str) {

  if (!str) return '';

  let s = str.toString();

  return s.replace(/(?:[A-Za-z]{3}\s+[A-Za-z]{3}\s+\d+\s+(?:1899|1900)[^\)]*\)?\s*-?\s*)+/gi, '').trim();

}



function formatDateTimeToThaiLong(dateStr) {

  if (!dateStr) return '';

  const dateStrLower = dateStr.toString().toLowerCase();

  if (dateStrLower.includes('1899') || dateStrLower.includes('1900') || dateStrLower.includes('เน€เธงเธฅเธฒเธญเธดเธเนเธ”เธเธตเธ')) {

    return '';

  }

  let dateObj = null;

  let hasTime = false;

  let hh = '00', mm = '00', ss = '00';

  

  if (dateStr instanceof Date) {

    if (dateStr.getFullYear() <= 1900) return '';

    dateObj = dateStr;

    hasTime = true;

  } else {

    let str = dateStr.toString().trim();

    

    // Clean up GMT and any text in parentheses following it

    str = str.replace(/\s*GMT[+-]\d+.*$/i, '').trim();

    str = str.replace(/\s*GMT.*$/i, '').trim();

    str = str.replace(/([+-]\d{2}:?\d{2}|Z)$/i, '').trim();

    

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

    

    // Remove ISO time part trailing info (only if it's at the end of the string)

    str = str.replace(/T$/, '').trim();

    

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

  

  if (!dateObj || isNaN(dateObj.getTime()) || dateObj.getFullYear() <= 1900) return '';

  

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



function formatSubjectName(subject) {

  if (!subject) return '';

  let str = subject.toString();

  // Strip out long date strings like "Sat Dec 30 1899 18:00:00 GMT+0642 (Indochina Time)"

  const dateRegex = /\b(?:Sun|Mon|Tue|Wed|Thu|Fri|Sat)\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}\s+\d{4}\s+\d{2}:\d{2}:\d{2}[^-\n]*/gi;

  str = str.replace(dateRegex, '');

  

  // Clean dangling dashes and extra spaces

  str = str.replace(/\s*-\s*(?=-|$)/g, '');

  str = str.replace(/^-|-$|^\s+|\s+$/g, '');

  str = str.replace(/\s{2,}/g, ' ').trim();



  const regex = /\b(midterm|final|test|mock|summer|oct|เธฃเธญเธ|เน€เธ—เธญเธก|เธชเธญเธ)|\b[mf][1-2]\/\d+|\b\d+\/\d{2,4}/i;

  const match = str.match(regex);

  if (match) {

    const splitIndex = match.index;

    const part1 = str.substring(0, splitIndex).trim();

    const part2 = str.substring(splitIndex).trim();

    if (part1 && part2) {

      return `${part1}<br><span class="subject-term-part" style="font-weight: 500; font-size: 0.62rem; color: var(--text-muted); display: block; margin-top: 1px;">${part2}</span>`;

    }

  }

  return str;

}



function countUniqueAttendingStudents(classes) {

  if (!classes || classes.length === 0) return 0;

  if (!state.students || !Array.isArray(state.students) || state.students.length === 0) return 0;

  

  const attendingStudents = new Set();

  

  const attendedClasses = classes.filter(c => {

    if (!c) return false;

    return (parseInt(c.isPresentLive) || 0) > 0 || 

           (parseInt(c.isPresentOnline) || 0) > 0 || 

           (parseInt(c.isMakeup) || 0) > 0 ||

           false; // isOrange removed

  });

  

  if (attendedClasses.length === 0) return 0;

  

  state.students.forEach(s => {

    if (!s || !s.name) return;

    const name = s.name.toString().trim();

    const nickname = s.nickname ? s.nickname.toString().trim() : '';

    

    const matched = attendedClasses.some(c => {

      if (!c) return false;

      const subj = (c.subject || '').toString().trim();

      const note = (c.note || '').toString().trim();

      

      const nameMatch = (nickname && (subj.indexOf(nickname) !== -1 || note.indexOf(nickname) !== -1)) ||

                        (name && (subj.indexOf(name) !== -1 || note.indexOf(name) !== -1));

      return nameMatch;

    });

    

    if (matched) {

      attendingStudents.add(name);

    }

  });

  

  return attendingStudents.size;

}



function cleanTimeStr(timeStr) {

  if (!timeStr) return '';

  let str = timeStr.toString().trim();

  if (str.includes('GMT') || str.includes('เน€เธงเธฅเธฒ') || str.includes('1899') || str.includes('1900') || str.length > 15) {

    try {

      let cleanStr = str.replace(/\s*GMT[+-]\d+.*$/i, '').trim();

      cleanStr = cleanStr.replace(/\s*GMT.*$/i, '').trim();

      cleanStr = cleanStr.replace(/([+-]\d{2}:?\d{2}|Z)$/i, '').trim();

      const parsed = Date.parse(cleanStr);

      if (!isNaN(parsed)) {

        const d = new Date(parsed);

        const hh = String(d.getHours()).padStart(2, '0');

        const mm = String(d.getMinutes()).padStart(2, '0');

        return `${hh}:${mm}`;

      }

    } catch (e) {

      // ignore

    }

  }

  const match = str.match(/(\d{1,2})[:.](\d{2})/);

  if (match) {

    return `${match[1].padStart(2, '0')}:${match[2]}`;

  }

  return str;

}



function matchRoomAndBranch(roomBranch, roomName, branchName) {

  if (!roomBranch) return false;

  const cleanRB = roomBranch.toLowerCase().trim();

  const cleanRN = roomName.toLowerCase().trim();

  const cleanB = branchName.toLowerCase().trim();

  

  if (cleanRN.includes('เธญเธญเธเนเธฅเธเน') || cleanRN.includes('online')) {

    const isOnlineRoom = cleanRB.includes('เธญเธญเธเนเธฅเธเน') || cleanRB.includes('online');

    if (!isOnlineRoom) return false;

    const normRB = cleanRB.replace(/\s+/g, '');

    const normB = cleanB.replace(/\s+/g, '');

    return normRB.includes(normB);

  }

  

  const escapedRN = cleanRN.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

  const roomRegex = new RegExp('(?:^|\\s)' + escapedRN + '(?!\\d|/)', 'i');

  if (!roomRegex.test(cleanRB)) {

    return false;

  }

  

  const normRB = cleanRB.replace(/\s+/g, '');

  const normB = cleanB.replace(/\s+/g, '');

  return normRB.includes(normB);

}



function populateRoomsDatalist() {

  if (!Array.isArray(state.rooms)) return;

  

  const sortedRooms = [...state.rooms].sort((a, b) => {

    const bComp = (a.branch || '').localeCompare(b.branch || '');

    if (bComp !== 0) return bComp;

    return (a.roomName || '').localeCompare(b.roomName || '');

  });

  

  const roomLabels = sortedRooms.map(room => {

    return `${room.roomName || ''} ${room.branch || ''} ${room.ipad ? room.ipad : ''} ${room.zoom ? room.zoom : ''}`.replace(/\s+/g, ' ').trim();

  });

  

  populateDatalist('rooms_datalist', roomLabels);

}



function getTodayDateTimeString() {

  const now = new Date();

  const year = now.getFullYear();

  const month = String(now.getMonth() + 1).padStart(2, '0');

  const day = String(now.getDate()).padStart(2, '0');

  const hours = String(now.getHours()).padStart(2, '0');

  const minutes = String(now.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;

}



function convertDateTimeFromSheet(dateVal) {

  if (!dateVal) return getTodayDateTimeString();

  let str = dateVal.toString().trim();

  str = str.replace(/\s*เธ\.\s*$/, '').trim();

  

  let datePart = '';

  let timePart = '12:00';

  

  const spaceParts = str.split(/\s+/);

  if (spaceParts.length >= 2) {

    datePart = spaceParts[0];

    timePart = spaceParts[1];

  } else {

    datePart = str;

  }

  

  const dateParts = datePart.split('/');

  if (dateParts.length === 3) {

    let day = dateParts[0].padStart(2, '0');

    let month = dateParts[1].padStart(2, '0');

    let year = dateParts[2];

    

    const timeParts = timePart.split(':');

    let hh = '12';

    let mm = '00';

    if (timeParts.length >= 2) {

      hh = timeParts[0].padStart(2, '0');

      mm = timeParts[1].padStart(2, '0');

    }

    

    return `${year}-${month}-${day}T${hh}:${mm}`;

  }

  return getTodayDateTimeString();

}



function convertDateTimeToSheet(dateTimeVal) {

  if (!dateTimeVal) return '';

  const d = new Date(dateTimeVal);

  if (isNaN(d.getTime())) return dateTimeVal;

  

  const day = d.getDate();

  const month = d.getMonth() + 1;

  const year = d.getFullYear();

  const hours = String(d.getHours()).padStart(2, '0');

  const minutes = String(d.getMinutes()).padStart(2, '0');

  

  return `${day}/${month}/${year} ${hours}:${minutes} เธ.`;

}

function getPrivateStudentRate(sheetName, courseName) {

  let rate = 250;

  if (!sheetName) return rate;

  if (sheetName.indexOf('เน€เธ”เธตเนเธขเธง') !== -1) {

    const isEx = courseName.toLowerCase().includes('ex');

    const gradesHigh = ['เธก.4', 'เธก.5', 'เธก.6'];

    let isHighGrade = false;

    gradesHigh.forEach(g => {

      if (sheetName.indexOf(g) !== -1) isHighGrade = true;

    });

    if (isHighGrade || isEx) {

      rate = 312.5;

    } else {

      rate = 250;

    }

  } else { // เธเธฅเธธเนเธกเธขเนเธญเธข

    if (sheetName.indexOf('2-3') !== -1) rate = 187.5;

    else if (sheetName.indexOf('4-5') !== -1) rate = 156.25;

    else if (sheetName.indexOf('6-10') !== -1) rate = 125;

  }

  return rate;

}



function checkLowBalanceStudents() {

  window._nextTaskSilent = true;

  google.script.run

    .withSuccessHandler(res => {

      const banner = document.getElementById('low_balance_warning_banner');

      const textEl = document.getElementById('low_balance_warning_text');

      

      if (res && res.success && res.students && res.students.length > 0) {

        const studentLinks = res.students.map(s => {

          const formattedMoney = Math.round(s.remainingMoney);

          const escapedName = s.name.replace(/'/g, "\'");

          const escapedCourse = s.courseName.replace(/'/g, "\'");

          const escapedSheet = s.sheetName.replace(/'/g, "\'");

          return `<span style="display: block; width: 100%; box-sizing: border-box; border: 1px solid #fecaca; background: #fff5f5; border-radius: 4px; padding: 2px 4px; font-size: 0.68rem; cursor: pointer; transition: all 0.2s; text-align: center; line-height: 1.3;" 

            title="เธเธฅเธดเธเน€เธเธทเนเธญเธฅเธเธขเธญเธ”เธเธณเธฃเธฐเน€เธเธดเธเธเธญเธ ${s.name} - ${s.courseName}"

            onmouseover="this.style.background='#fee2e2'; this.style.borderColor='#f87171'; this.style.transform='scale(1.02)';"

            onmouseout="this.style.background='#fff5f5'; this.style.borderColor='#fecaca'; this.style.transform='scale(1)';"

            onclick="navigateToPrivateStudentPayment('${escapedName}', '${escapedCourse}', '${escapedSheet}')">

            <strong>${s.name} ${s.courseName}</strong> เธขเธญเธ”เธเธณเธฃเธฐเธชเธฐเธชเธก <span style="color:#ef4444; font-weight:600;">เธฟ${formattedMoney.toLocaleString()}</span>

          </span>`;

        });

        const toggleId = 'low_balance_toggle_content';

        const isCollapsed = document.getElementById(toggleId) ? document.getElementById(toggleId).style.display === 'none' : false;

        textEl.innerHTML = `<div style="margin-bottom: 4px; display: flex; align-items: center; gap: 6px; cursor: pointer; user-select: none;" onclick="const el=document.getElementById('${toggleId}'); el.style.display = el.style.display==='none' ? 'grid' : 'none'; this.querySelector('.toggle-icon').textContent = el.style.display==='none' ? 'โ–ถ' : 'โ–ผ';">

          <span class="toggle-icon" style="font-size: 0.7rem;">โ–ผ</span>

          <strong style="font-size: 0.75rem;">เธเธญเธฃเนเธชเน€เธฃเธตเธขเธเธเธณเธฃเธฐเธชเธฐเธชเธกเธ•เนเธณเธเธงเนเธฒ 700 เธเธฒเธ—: (${res.students.length} เธฃเธฒเธขเธเธฒเธฃ)</strong>

        </div>

        <div id="${toggleId}" style="display: ${isCollapsed ? 'none' : 'grid'}; grid-template-columns: repeat(5, 1fr); gap: 3px;">${studentLinks.join('')}</div>`;

        banner.style.display = 'flex';

      } else {

        banner.style.display = 'none';

      }

    })

    .withFailureHandler(err => {

      console.error('Failed to check low balance private students: ', err);

    })

    .getLowBalancePrivateStudents(getLogUser());

  checkTeacherLeaves();

}



function checkTeacherLeaves() {

  window._nextTaskSilent = true;

  google.script.run

    .withSuccessHandler(res => {

      const banner = document.getElementById('teacher_leave_warning_banner');

      const textEl = document.getElementById('teacher_leave_warning_text');

      

      if (res && res.success && res.leaves && res.leaves.length > 0) {

        const leaveLinks = res.leaves.map(l => {

          const isToday = l.isToday;

          const dateBadge = isToday 

            ? `<span style="background:#f59e0b; color:#fff; padding:0 4px; border-radius:3px; font-size:0.6rem; font-weight:700; margin-right:3px;">๐“ เธงเธฑเธเธเธตเน</span>`

            : `<span style="background:#e5e7eb; color:#6b7280; padding:0 4px; border-radius:3px; font-size:0.6rem;">${l.date || ''}</span>`;

          const borderColor = isToday ? '#f59e0b' : '#fbd58d';

          const bgColor = isToday ? '#fef3c7' : '#fffbeb';

          const safeRoom = (l.room || '').replace(/'/g, "\\'");

          return `<span onclick="showEditClassLogModal(${l.rowIndex})" class="leave-card-clickable" style="display: block; width: 100%; box-sizing: border-box; border: 1px solid ${borderColor}; background: ${bgColor}; border-radius: 4px; padding: 4px; font-size: 0.68rem; text-align: center; line-height: 1.4; cursor: pointer; transition: all 0.2s;">

            ${dateBadge}๐‘จโ€๐ซ <strong>เธเธฃเธน ${l.teacher} เธฅเธฒ</strong> โ€” ${formatSubjectName(l.subject)} (${cleanTimeStr(l.timeStart)}-${cleanTimeStr(l.timeEnd)})${l.teacherSub ? ` เธเธฃเธนเนเธ—เธ: ${l.teacherSub}` : ' โ ๏ธเนเธกเนเธกเธตเธเธฃเธนเนเธ—เธ'}

          </span>`;

        });

        const todayCount = res.leaves.filter(l => l.isToday).length;

        const totalCount = res.leaves.length;

        const toggleId = 'teacher_leave_toggle_content';

        const isCollapsed = document.getElementById(toggleId) ? document.getElementById(toggleId).style.display === 'none' : false;

        textEl.innerHTML = `<div style="margin-bottom: 4px; display: flex; align-items: center; gap: 6px; cursor: pointer; user-select: none;" onclick="const el=document.getElementById('${toggleId}'); el.style.display = el.style.display==='none' ? 'grid' : 'none'; this.querySelector('.toggle-icon').textContent = el.style.display==='none' ? 'โ–ถ' : 'โ–ผ';">

          <span class="toggle-icon" style="font-size: 0.7rem;">โ–ผ</span>

          <strong style="font-size: 0.75rem; color: #92400e;">เธเธฃเธฐเธงเธฑเธ•เธดเนเธเนเธเธฅเธฒเธเธญเธเธเธธเธ“เธเธฃเธน: ${totalCount} เธฃเธฒเธขเธเธฒเธฃ${todayCount > 0 ? ` (เธงเธฑเธเธเธตเน ${todayCount} เธฃเธฒเธขเธเธฒเธฃ)` : ''}</strong>

        </div>

        <div id="${toggleId}" style="display: ${isCollapsed ? 'none' : 'grid'}; grid-template-columns: repeat(5, 1fr); gap: 3px;">${leaveLinks.join('')}</div>`;

        banner.style.display = 'flex';

      } else {

        banner.style.display = 'none';

      }

    })

    .withFailureHandler(err => {

      console.error('Failed to check teacher leaves: ', err);

    })

    .getTeacherLeaveToday(getLogUser());

}



function navigateToPrivateStudentPayment(studentName, courseName, sheetName) {

  state.pendingPrivateStudentPayment = { name: studentName, courseName: courseName };

  

  // เธเนเธญเธเธเธฑเธเธเธฒเธฃเนเธซเธฅเธ”เธเนเธญเธกเธนเธฅเธเนเธญเธเธเนเธณเธเธฒเธ switchPanel

  state.navigatingToPayment = true;

  switchPanel('private_students');

  state.navigatingToPayment = false;

  

  const selectEl = document.getElementById('private_sheet_select');

  if (selectEl) {

    selectEl.value = sheetName;

  }

  loadPrivateStudents();

}



function formatHoursMinutes(val) {

  if (val === undefined || val === null) return '0 เธเธก. 0 เธเธฒเธ—เธต';

  let str = val.toString().trim();

  if (!str || str === '0') return '0 เธเธก. 0 เธเธฒเธ—เธต';

  if (str.includes('เธเธก.') && str.includes('เธเธฒเธ—เธต')) {

    return str;

  }

  

  if (str.includes('GMT') || str.includes('เน€เธงเธฅเธฒ') || str.includes('1899') || str.includes('1900') || str.length > 15) {

    try {

      let cleanStr = str.replace(/\s*GMT[+-]\d+.*$/i, '').trim();

      cleanStr = cleanStr.replace(/\s*GMT.*$/i, '').trim();

      cleanStr = cleanStr.replace(/([+-]\d{2}:?\d{2}|Z)$/i, '').trim();

      const parsed = Date.parse(cleanStr);

      if (!isNaN(parsed)) {

        const d = new Date(parsed);

        const hh = String(d.getHours()).padStart(2, '0');

        const mm = String(d.getMinutes()).padStart(2, '0');

        str = `${hh}:${mm}`;

      }

    } catch (e) {

      // ignore

    }

  }

  

  let isNegative = str.startsWith('-');

  if (isNegative) {

    str = str.substring(1).trim();

  }

  

  let hours = 0;

  let minutes = 0;

  

  if (str.includes(':')) {

    const parts = str.split(':');

    hours = parseInt(parts[0], 10) || 0;

    minutes = parseInt(parts[1], 10) || 0;

  } else {

    const num = parseFloat(str);

    if (!isNaN(num)) {

      hours = Math.floor(num);

      minutes = Math.round((num - hours) * 60);

    } else {

      return val;

    }

  }

  return (isNegative ? '-' : '') + `${hours} เธเธก. ${minutes} เธเธฒเธ—เธต`;

}



function convertDateToSheet(dateVal) {

  if (!dateVal) return '';

  const d = new Date(dateVal);

  const dd = String(d.getDate()).padStart(2, '0');

  const mm = String(d.getMonth() + 1).padStart(2, '0');

  const yyyy = d.getFullYear();

  return `${dd}/${mm}/${yyyy}`;

}



function convertDateFromSheet(dateVal) {

  if (!dateVal) return '';

  if (dateVal instanceof Date) {

    const y = dateVal.getFullYear();

    const m = String(dateVal.getMonth() + 1).padStart(2, '0');

    const d = String(dateVal.getDate()).padStart(2, '0');

    return `${y > 2400 ? y - 543 : y}-${m}-${d}`;

  }

  const parts = dateVal.toString().split('/');

  if (parts.length === 3) {

    let day = parts[0].trim();

    let month = parts[1].trim();

    let year = parseInt(parts[2].trim(), 10);

    if (isNaN(year)) return '';

    if (year > 2400) year -= 543; // Convert BE to CE

    if (day.length < 2) day = '0' + day;

    if (month.length < 2) month = '0' + month;

    return `${year}-${month}-${day}`;

  }

  return '';

}



function setLoading(show, text = 'เธเธณเธฅเธฑเธเนเธซเธฅเธ”เธเนเธญเธกเธนเธฅ...') {

  if (show) {

    window._nextTaskTitle = text;

  }

  

  const overlay = document.getElementById('loader_overlay');

  if (overlay) {

    overlay.classList.remove('active'); // Ensure full-screen loader is always hidden

  }



  const inlineLoader = document.getElementById('inline_loading_indicator');

  const inlineText = document.getElementById('inline_loading_text');



  // Update global status bar
  const statusBar = document.getElementById('global_status_bar');
  const statusDot = document.getElementById('global_status_dot');
  const statusText = document.getElementById('global_status_text');

  if (show) {

    if (inlineLoader) {

      inlineLoader.style.display = 'flex';

    }

    if (inlineText) {

      inlineText.innerText = text;

    }

    // Update status bar to loading state
    if (statusBar) {
      statusBar.style.background = 'rgba(59, 130, 246, 0.9)';
    }
    if (statusDot) {
      statusDot.style.background = '#fbbf24';
      statusDot.style.animation = 'pulse 1s infinite';
    }
    if (statusText) {
      statusText.textContent = 'โณ ' + text;
    }

  } else {

    if (inlineLoader) {

      inlineLoader.style.display = 'none';

    }

    // Update status bar to idle state
    if (statusBar) {
      statusBar.style.background = 'rgba(15, 23, 42, 0.85)';
    }
    if (statusDot) {
      statusDot.style.background = '#22c55e';
      statusDot.style.animation = 'none';
    }
    if (statusText) {
      statusText.textContent = 'โ… เธเธฃเนเธญเธกเนเธเนเธเธฒเธ';
    }

  }

}





function showToast(message, type = 'info') {

  const container = document.getElementById('toast_container');

  while (container.children.length >= 3) {

    container.removeChild(container.firstChild);

  }

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

  

  for (let i = 0; i < 4; i++) {

    populateSelect('class_teacher_reg_' + i, teachers);

    populateSelect('class_teacher_sub_' + i, ['(เนเธกเนเธกเธตเธเธฃเธนเนเธ—เธ)', ...teachers]);

  }

  

  populateSelect('teacher_schedule_select', ['(เน€เธฅเธทเธญเธเธเธทเนเธญเธเธฃเธน)', ...teachers]);

  populateDatalist('student_school_list', schools);

  populateSelect('student_pay_channel', channels);

  populateSelect('p_payment_channel', channels);

  populateSelect('manager_name', ['เธเธเธ.เธเนเธญเธก', 'เธเธเธ.เธเธดเนเธ', 'เธเธเธ.เธเธฑเธ', 'เธเธเธ.เน€เธเธทเนเธญเธ']);

  populateSelect('calc_teacher_select', ['(เน€เธฅเธทเธญเธเธเธฃเธนเน€เธเธทเนเธญเธเธณเธเธงเธ“)', ...teachers]);



  // Populate staff payroll year picker

  const staffYearPicker = document.getElementById('calc_year_picker');

  const staffSummaryYear = document.getElementById('staff_summary_year');

  if (staffYearPicker || staffSummaryYear) {

    const today = new Date();

    const currentYear = today.getFullYear();

    const optionsHtml = [];

    for (let y = 2026; y <= 2032; y++) {

      const selected = y === currentYear ? ' selected' : '';

      optionsHtml.push(`<option value="${y}"${selected}>เธเธต เธ.เธจ. ${y + 543} (เธ.เธจ. ${y})</option>`);

    }

    const htmlString = optionsHtml.join('');

    if (staffYearPicker) staffYearPicker.innerHTML = htmlString;

    if (staffSummaryYear) staffSummaryYear.innerHTML = htmlString;

  }



  // Populate staff payroll month picker

  const staffMonthPicker = document.getElementById('calc_month_picker');

  const staffSummaryMonth = document.getElementById('staff_summary_month');

  if (staffMonthPicker || staffSummaryMonth) {

    const monthNames = [

      'เธกเธเธฃเธฒเธเธก', 'เธเธธเธกเธ เธฒเธเธฑเธเธเน', 'เธกเธตเธเธฒเธเธก', 'เน€เธกเธฉเธฒเธขเธ',

      'เธเธคเธฉเธ เธฒเธเธก', 'เธกเธดเธ–เธธเธเธฒเธขเธ', 'เธเธฃเธเธเธฒเธเธก', 'เธชเธดเธเธซเธฒเธเธก',

      'เธเธฑเธเธขเธฒเธขเธ', 'เธ•เธธเธฅเธฒเธเธก', 'เธเธคเธจเธเธดเธเธฒเธขเธ', 'เธเธฑเธเธงเธฒเธเธก'

    ];

    const currentMonth = new Date().getMonth() + 1;

    const optionsHtml = monthNames.map((name, idx) => {

      const selected = (idx + 1 === currentMonth) ? ' selected' : '';

      return `<option value="${idx + 1}"${selected}>${name}</option>`;

    }).join('');

    if (staffMonthPicker) staffMonthPicker.innerHTML = optionsHtml;

    if (staffSummaryMonth) staffSummaryMonth.innerHTML = optionsHtml;

  }

  

  // Make teacher select elements searchable

  for (let i = 0; i < 4; i++) {

    makeSelectSearchable('class_teacher_reg_' + i);

    makeSelectSearchable('class_teacher_sub_' + i);

  }

  makeSelectSearchable('teacher_schedule_select');

  makeSelectSearchable('calc_teacher_select');

  

  // Auto-populate course list in the class log subject autocomplete datalist

  refreshClassSubjectDatalist();

    

  populateTeacherDatalists();

}



function refreshClassSubjectDatalist() {

  google.script.run

    .withSuccessHandler(courses => {

      if (Array.isArray(courses)) {

        populateDatalist('class_subject_list', courses);

        for (let i = 0; i < 4; i++) {

          populateDatalist('class_subject_list_' + i, courses);

        }

      }

    })

    .getAllCoursesFromGradeSheets();

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



// Make standard select dropdowns searchable by typing

function makeSelectSearchable(selectId) {

  const select = document.getElementById(selectId);

  if (!select) return;

  

  // Skip if already initialized

  if (select.parentNode.classList.contains('searchable-select-container')) {

    const container = select.parentNode;

    const input = container.querySelector('.searchable-select-input');

    if (input) {

      const selectedOption = select.options[select.selectedIndex];

      input.value = selectedOption ? selectedOption.text : '';

    }

    return;

  }

  

  // Create wrapper container

  const container = document.createElement('div');

  container.className = 'searchable-select-container';

  container.style.width = select.style.width || '100%';

  if (select.style.minWidth) container.style.minWidth = select.style.minWidth;

  

  select.parentNode.insertBefore(container, select);

  container.appendChild(select);

  select.style.display = 'none'; // hide original select

  

  // Create search input

  const input = document.createElement('input');

  input.type = 'text';

  input.className = 'form-control searchable-select-input';

  

  let placeholderText = 'เธเธดเธกเธเนเน€เธเธทเนเธญเธเนเธเธซเธฒเธเธทเนเธญเธเธฃเธน...';

  if (selectId === 'class_teacher_sub') placeholderText = 'เธเธดเธกเธเนเธเธทเนเธญเธเธฃเธนเนเธ—เธ...';

  else if (selectId === 'teacher_schedule_select') placeholderText = 'เธเธดเธกเธเนเธเธทเนเธญเธเธฃเธนเน€เธเธทเนเธญเธ”เธนเธ•เธฒเธฃเธฒเธ...';

  else if (selectId === 'calc_teacher_select') placeholderText = 'เธเธดเธกเธเนเธเธทเนเธญเธเธฃเธนเน€เธเธทเนเธญเธเธณเธเธงเธ“เน€เธเธดเธ...';

  

  input.placeholder = placeholderText;

  

  const updateInputValue = () => {

    const selectedOption = select.options[select.selectedIndex];

    input.value = selectedOption ? selectedOption.text : '';

  };

  updateInputValue();

  

  container.appendChild(input);

  

  // Create dropdown container

  const dropdown = document.createElement('div');

  dropdown.className = 'searchable-select-dropdown';

  dropdown.style.display = 'none';

  container.appendChild(dropdown);

  

  let activeIndex = -1;

  

  // Rebuild items in dropdown based on input query

  const rebuildDropdown = () => {

    dropdown.innerHTML = '';

    const query = input.value.trim().toLowerCase();

    let hasResults = false;

    

    Array.from(select.options).forEach((opt, idx) => {

      const text = opt.text;

      const isMatch = !query || text.toLowerCase().includes(query);

      if (!isMatch) return;

      

      hasResults = true;

      const item = document.createElement('div');

      item.className = 'searchable-select-item';

      if (select.selectedIndex === idx) {

        item.classList.add('selected');

      }

      item.textContent = text;

      

      item.addEventListener('click', (e) => {

        e.stopPropagation();

        select.selectedIndex = idx;

        

        // Dispatch change event so original event listener runs

        const event = new Event('change', { bubbles: true });

        select.dispatchEvent(event);

        

        updateInputValue();

        dropdown.style.display = 'none';

      });

      

      dropdown.appendChild(item);

    });

    

    if (!hasResults) {

      const noResults = document.createElement('div');

      noResults.className = 'searchable-select-item no-results';

      noResults.textContent = 'เนเธกเนเธเธเธฃเธฒเธขเธเธทเนเธญเธเธฃเธน';

      dropdown.appendChild(noResults);

    }

    

    activeIndex = -1;

  };

  

  const highlightItem = (items) => {

    items.forEach((item, idx) => {

      if (idx === activeIndex) {

        item.classList.add('selected');

        item.scrollIntoView({ block: 'nearest' });

      } else {

        item.classList.remove('selected');

      }

    });

  };

  

  // Toggle dropdown on focus

  input.addEventListener('focus', () => {

    document.querySelectorAll('.searchable-select-dropdown').forEach(d => {

      if (d !== dropdown) d.style.display = 'none';

    });

    dropdown.style.display = 'block';

    rebuildDropdown();

    input.select();

  });

  

  input.addEventListener('input', () => {

    rebuildDropdown();

  });

  

  // Keyboard navigation

  input.addEventListener('keydown', (e) => {

    const items = dropdown.querySelectorAll('.searchable-select-item:not(.no-results)');

    if (dropdown.style.display === 'none') {

      if (e.key === 'ArrowDown' || e.key === 'Enter') {

        dropdown.style.display = 'block';

        rebuildDropdown();

        e.preventDefault();

      }

      return;

    }

    

    if (e.key === 'ArrowDown') {

      e.preventDefault();

      if (items.length > 0) {

        activeIndex = (activeIndex + 1) % items.length;

        highlightItem(items);

      }

    } else if (e.key === 'ArrowUp') {

      e.preventDefault();

      if (items.length > 0) {

        activeIndex = (activeIndex - 1 + items.length) % items.length;

        highlightItem(items);

      }

    } else if (e.key === 'Enter') {

      e.preventDefault();

      if (activeIndex >= 0 && activeIndex < items.length) {

        items[activeIndex].click();

      } else if (items.length > 0) {

        items[0].click();

      }

    } else if (e.key === 'Escape') {

      dropdown.style.display = 'none';

      updateInputValue();

    }

  });

  

  // Hide dropdown on click outside

  document.addEventListener('click', (e) => {

    if (!container.contains(e.target)) {

      dropdown.style.display = 'none';

      updateInputValue();

    }

  });

  

  // Rebuild dropdown items when options change dynamically

  const observer = new MutationObserver(() => {

    updateInputValue();

    if (dropdown.style.display === 'block') {

      rebuildDropdown();

    }

  });

  observer.observe(select, { childList: true, subtree: true, characterData: true });

  

  // Override select value property to intercept programmatic sets and update input

  const originalValProp = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');

  Object.defineProperty(select, 'value', {

    get: function() {

      return originalValProp.get.call(this);

    },

    set: function(val) {

      originalValProp.set.call(this, val);

      updateInputValue();

    }

  });

  

  const originalIdxProp = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'selectedIndex');

  Object.defineProperty(select, 'selectedIndex', {

    get: function() {

      return originalIdxProp.get.call(this);

    },

    set: function(idx) {

      originalIdxProp.set.call(this, idx);

      updateInputValue();

    }

  });

}



// ----------------------------------------------------

// Navigation / Views Switching

// ----------------------------------------------------

function switchPanel(panelName) {

  // Check access control first

  const role = state.currentUser ? (state.currentUser.role || '').toString().trim() : '';

  const isTeacher = (role === 'Teacher' || role === 'เธเธฃเธน');

  if (isTeacher && panelName !== 'teacher_schedule' && panelName !== 'teacher_payroll' && panelName !== 'evaluation_form') {

    panelName = 'teacher_schedule';

  }



  // Restore parent scrolling when leaving daily_grid
  var contentBody = document.querySelector('.content-body');
  if (contentBody) contentBody.style.overflow = '';
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';

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

    'students': 'เธ—เธฐเน€เธเธตเธขเธเธเธฑเธเน€เธฃเธตเธขเธ',

    'grade_sheets': 'เธเธญเธฃเนเธชเน€เธฃเธตเธขเธ',

    'daily_grid': 'เธ•เธฒเธฃเธฒเธเน€เธฃเธตเธขเธเธฃเธฒเธขเธซเนเธญเธเน€เธฃเธตเธขเธเธฃเธฒเธขเธงเธฑเธ',

    'private_students': 'เน€เธ”เนเธเน€เธฃเธตเธขเธเน€เธ”เธตเนเธขเธง & เธเธฅเธธเนเธกเธขเนเธญเธข',

    'class_logs': 'เธเธฑเธเธ—เธถเธเธฃเธฒเธขเธฃเธฑเธ เธฃเธฒเธขเน€เธ”เธทเธญเธ',

    'teacher_schedule': 'เธ•เธฒเธฃเธฒเธเธชเธญเธเธชเนเธงเธเธ•เธฑเธงเธเธธเธ“เธเธฃเธน',

    'teacher_payroll': state.currentUser && (state.currentUser.role === 'Teacher' || state.currentUser.role === 'เธเธฃเธน') ? 'เธ•เธฒเธฃเธฒเธเธชเธญเธเนเธฅเธฐเธฃเธฒเธขเธฅเธฐเน€เธญเธตเธขเธ”เน€เธเธดเธเน€เธ”เธทเธญเธเธเธญเธเธเธฑเธ' : 'เธเนเธฒเธชเธญเธเธเธฃเธนเธฃเธฒเธขเน€เธ”เธทเธญเธ',

    'teacher_profiles': 'เธเธฑเธ”เธเธฒเธฃเธเธฃเธฐเธงเธฑเธ•เธดเธเธธเธ“เธเธฃเธน',

    'employee_management': 'เธเธฑเธ”เธเธฒเธฃเธเธเธฑเธเธเธฒเธเนเธเธฃเธฐเธเธ',

    'manager_logs': 'เธฅเธเน€เธงเธฅเธฒเธ—เธณเธเธฒเธเธเธนเนเธเธฑเธ”เธเธฒเธฃเธชเธฒเธเธฒ',

    'activity_logs': 'เธฃเธฒเธขเธเธฒเธเธเธฒเธฃเธ—เธณเธเธธเธฃเธเธฃเธฃเธกเธเธญเธเธฃเธฐเธเธ (Audit Trail)',

    'debtors': 'เธ•เธฃเธงเธเธชเธญเธเนเธฅเธฐเธเธฑเธเธ—เธถเธเธเนเธฒเธเธเธณเธฃเธฐเน€เธเธดเธเธเนเธฒเน€เธฃเธตเธขเธ',

    'print_receipts': 'เธญเธญเธเนเธเน€เธชเธฃเนเธเธฃเธฑเธเน€เธเธดเธเธเนเธฒเน€เธฃเธตเธขเธ',

    'evaluation_form': 'เนเธเธเธฃเธฐเน€เธกเธดเธเธเธฅเธเธฒเธฃเน€เธฃเธตเธขเธเธเธฑเธเน€เธฃเธตเธขเธ',

    'admin_evaluation_form': 'เธฃเธฒเธขเธเธฒเธฃเธเธฃเธฐเน€เธกเธดเธเธเธฅเธเธฒเธฃเน€เธฃเธตเธขเธ (เน€เธเนเธฒเธซเธเนเธฒเธ—เธตเน)',

    'staff_salary_summary': 'เธชเธฃเธธเธเธฃเธฒเธขเนเธ”เนเธเธฃเธนเธ—เธฑเนเธเธซเธกเธ”'

  };

  document.getElementById('page_title').innerText = titles[panelName] || 'เธฃเธฐเธเธเธ”เธนเนเธฅเนเธฃเธเน€เธฃเธตเธขเธเธเธงเธ”เธงเธดเธเธฒ';

  

  // Subtitles are now embedded directly in each panel's toolbar

  

  // Load panel specific data

  if (panelName === 'dashboard') {

    loadDashboard();

    loadRoundSummary();

  } else if (panelName === 'students') {

    loadStudents();

  } else if (panelName === 'grade_sheets') {

    // Reset grade sheet display

    document.getElementById('grade_sheet_grid_table').innerHTML = `<tr><td style="padding: 40px; text-align: center; color: var(--text-muted);">เธเธฃเธธเธ“เธฒเน€เธฅเธทเธญเธเธ•เธฒเธฃเธฒเธเธฃเธฐเธ”เธฑเธเธเธฑเนเธเธ”เนเธฒเธเธเธ</td></tr>`;

    document.getElementById('save_grade_sheet_btn').disabled = true;

  } else if (panelName === 'daily_grid') {

    loadDailyGrid();

  } else if (panelName === 'private_students') {

    if (!state.navigatingToPayment) {

      loadPrivateStudents();

    }

  } else if (panelName === 'class_logs') {

    switchRevenueSubTab('list');

    loadRevenueLogs();

  } else if (panelName === 'teacher_profiles') {

    loadTeacherProfiles();

  } else if (panelName === 'teacher_payroll') {

    if(document.getElementById('calc_result_card')) document.getElementById('calc_result_card').style.display = 'none';

    const staffBanner = document.getElementById('staff_yearly_summary_banner');

    if (staffBanner) staffBanner.style.display = 'none';

    const role = state.currentUser ? (state.currentUser.role || 'Staff').toString().trim() : 'Staff';

    if (role === 'Teacher' || role === 'เธเธฃเธน') {

      setTimeout(() => {

        runTeacherPayCalculation();

      }, 100);

    }

  } else if (panelName === 'manager_logs') {

    loadManagerLogs();

  } else if (panelName === 'activity_logs') {

    loadActivityLogs();

  } else if (panelName === 'debtors') {

    loadDebtors();

  } else if (panelName === 'print_receipts') {

    loadReceipts();

  } else if (panelName === 'teacher_schedule') {

    loadTeacherSchedule(true);

  } else if (panelName === 'employee_management') {

    loadEmployeeList();

  } else if (panelName === 'evaluation_form') {

    initEvaluationForm();

  } else if (panelName === 'admin_evaluation_form') {

    loadAdminEvaluationsDashboard();

  } else if (panelName === 'staff_salary_summary') {

    loadStaffSalarySummary();

  }

}



// ----------------------------------------------------

// 1. Dashboard & Dynamic Summary Aggregations

// ----------------------------------------------------

function loadDashboard(isSilent = false) {
  if (!isSilent) setLoading(true, 'เธเธณเธฅเธฑเธเธ”เธถเธเธชเธ–เธดเธ•เธดเธเธณเธเธงเธเน€เธเธดเธเธชเธฐเธชเธก...');
  const yearSelect = document.getElementById('dashboardYearSelect');
  const selectedYear = yearSelect ? yearSelect.value : null;

  google.script.run
    .withSuccessHandler(data => {
      if (!isSilent) setLoading(false);
      if (data && !data.error) {
        renderDashboardData(data);
        if (typeof loadDailyGrid === 'function') {
          loadDailyGrid(true);
        }
      } else if (!isSilent) {
        showToast('เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เนเธซเธฅเธ”เธเนเธญเธกเธนเธฅเธซเธเนเธฒเธซเธฅเธฑเธเนเธ”เน: ' + (data ? data.error : 'unknown'), 'error');
      }
    })
    .withFailureHandler(err => {
      if (!isSilent) {
        setLoading(false);
        showToast('เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เธ”เธถเธเธเนเธญเธกเธนเธฅเนเธ”เธเธเธญเธฃเนเธ”เนเธ”เน: ' + err.message, 'error');
      }
    })
    .getDashboardData(null, selectedYear);
}

function renderDashboardData(data) {
  const fin1 = data.branchFin['เธชเธฒเธเธฒ1'] || { full: 0, paid: 0, debt: 0 };
  const fin2 = data.branchFin['เธชเธฒเธเธฒ2'] || { full: 0, paid: 0, debt: 0 };
  const fin3 = data.branchFin['เธชเธฒเธเธฒ3'] || { full: 0, paid: 0, debt: 0 };

  document.getElementById('dash_s1_full').innerText = 'เธฟ' + fin1.full.toLocaleString();
  document.getElementById('dash_s1_paid').innerText = 'เธฟ' + fin1.paid.toLocaleString();
  document.getElementById('dash_s1_debt').innerText = 'เธฟ' + fin1.debt.toLocaleString();
  
  document.getElementById('dash_s2_full').innerText = 'เธฟ' + fin2.full.toLocaleString();
  document.getElementById('dash_s2_paid').innerText = 'เธฟ' + fin2.paid.toLocaleString();
  document.getElementById('dash_s2_debt').innerText = 'เธฟ' + fin2.debt.toLocaleString();
  
  document.getElementById('dash_s3_full').innerText = 'เธฟ' + fin3.full.toLocaleString();
  document.getElementById('dash_s3_paid').innerText = 'เธฟ' + fin3.paid.toLocaleString();
  document.getElementById('dash_s3_debt').innerText = 'เธฟ' + fin3.debt.toLocaleString();

  const monthsTH = [
    'เธกเธเธฃเธฒเธเธก', 'เธเธธเธกเธ เธฒเธเธฑเธเธเน', 'เธกเธตเธเธฒเธเธก', 'เน€เธกเธฉเธฒเธขเธ', 'เธเธคเธฉเธ เธฒเธเธก', 'เธกเธดเธ–เธธเธเธฒเธขเธ',
    'เธเธฃเธเธเธฒเธเธก', 'เธชเธดเธเธซเธฒเธเธก', 'เธเธฑเธเธขเธฒเธขเธ', 'เธ•เธธเธฅเธฒเธเธก', 'เธเธคเธจเธเธดเธเธฒเธขเธ', 'เธเธฑเธเธงเธฒเธเธก'
  ];
  
  const monthlyTbody = document.getElementById('dash_monthly_tbody');
  const monthlyTfoot = document.getElementById('dash_monthly_tfoot');
  
  if (monthlyTbody && data.monthlySummary) {
    let tbodyHtml = '';
    let totalS1 = 0;
    let totalS2 = 0;
    let totalS3 = 0;
    let totalOthers = 0;
    let grandTotal = 0;
    
    data.monthlySummary.forEach((monthData, idx) => {
      const s1 = monthData['เธชเธฒเธเธฒ1'] || 0;
      const s2 = monthData['เธชเธฒเธเธฒ2'] || 0;
      const s3 = monthData['เธชเธฒเธเธฒ3'] || 0;
      const others = monthData['เธญเธทเนเธเน'] || 0;
      const total = monthData['total'] || 0;
      
      totalS1 += s1;
      totalS2 += s2;
      totalS3 += s3;
      totalOthers += others;
      grandTotal += total;
      
      tbodyHtml += `
        <tr>
          <td style="font-weight: 500;">${monthsTH[idx]}</td>
          <td style="text-align: right;">เธฟ${s1.toLocaleString()}</td>
          <td style="text-align: right;">เธฟ${s2.toLocaleString()}</td>
          <td style="text-align: right;">เธฟ${s3.toLocaleString()}</td>
          <td style="text-align: right;">เธฟ${others.toLocaleString()}</td>
          <td style="text-align: right; font-weight: 600; background: rgba(15,23,42,0.01);">เธฟ${total.toLocaleString()}</td>
        </tr>
      `;
    });
    
    monthlyTbody.innerHTML = tbodyHtml;
    
    if (monthlyTfoot) {
      monthlyTfoot.innerHTML = `
        <td>เธฃเธงเธกเธ—เธฑเนเธเธซเธกเธ”</td>
        <td style="text-align: right;">เธฟ${totalS1.toLocaleString()}</td>
        <td style="text-align: right;">เธฟ${totalS2.toLocaleString()}</td>
        <td style="text-align: right;">เธฟ${totalS3.toLocaleString()}</td>
        <td style="text-align: right;">เธฟ${totalOthers.toLocaleString()}</td>
        <td style="text-align: right; font-weight: 700; background: rgba(15,23,42,0.02);">เธฟ${grandTotal.toLocaleString()}</td>
      `;
    }
  }

  // 1. Courses > 5 students (Paid)
  const courseContainer = document.getElementById('dash_course_over_5_container');
  if (courseContainer) {
    if (data.coursesOver5 && data.coursesOver5.length > 0) {
      let html = `<ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px;">`;
      data.coursesOver5.forEach(c => {
        html += `<li style="display: flex; justify-content: space-between; padding: 8px 12px; background: rgba(0,0,0,0.02); border-radius: 6px; border: 1px solid var(--border-color);">
                   <span style="font-weight: 600; color: var(--color-primary);">\${c.course}</span>
                   <span style="font-weight: bold; background: var(--color-primary); color: #fff; padding: 2px 8px; border-radius: 12px; font-size: 0.8em;">\${c.count} เธเธ</span>
                 </li>`;
      });
      html += `</ul>`;
      courseContainer.innerHTML = html;
    } else {
      courseContainer.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding: 20px;">เนเธกเนเธกเธตเธเธญเธฃเนเธชเธ—เธตเนเน€เธเนเธฒเน€เธเธทเนเธญเธเนเธ</div>`;
    }
  }

  // 2. Main Group Stats
  const mainGroupContainer = document.getElementById('dash_main_group_container');
  if (mainGroupContainer) {
    if (data.mainGroupStats && Object.keys(data.mainGroupStats).length > 0) {
      let html = `<div style="display: flex; flex-direction: column; gap: 16px;">`;
      for (const [round, branchData] of Object.entries(data.mainGroupStats)) {
        html += `<div style="border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden;">
                   <div style="background: var(--color-primary); color: #fff; padding: 8px 12px; font-weight: 600;">เธฃเธญเธ: \${round}</div>
                   <div style="padding: 12px; display: flex; flex-direction: column; gap: 12px; background: #fff;">`;
        for (const [branch, gradeData] of Object.entries(branchData)) {
          html += `<div>
                     <div style="font-weight: 600; color: var(--text-main); margin-bottom: 6px; border-bottom: 1px dashed var(--border-color); padding-bottom: 4px;">๐ข \${branch}</div>
                     <div style="display: flex; flex-wrap: wrap; gap: 8px;">`;
          for (const [grade, count] of Object.entries(gradeData)) {
            html += `<span style="background: rgba(0,0,0,0.04); padding: 4px 10px; border-radius: 16px; font-size: 0.85em;">\${grade}: <b>\${count}</b></span>`;
          }
          html += `  </div>
                   </div>`;
        }
        html += `  </div>
                 </div>`;
      }
      html += `</div>`;
      mainGroupContainer.innerHTML = html;
    } else {
      mainGroupContainer.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding: 20px;">เนเธกเนเธกเธตเธเนเธญเธกเธนเธฅเน€เธ”เนเธเธเธฅเธธเนเธกเธซเธฅเธฑเธ</div>`;
    }
  }

  // 3. Private Group Stats
  const privateGroupContainer = document.getElementById('dash_private_group_container');
  if (privateGroupContainer) {
    if (data.privateGroupStats && Object.keys(data.privateGroupStats).length > 0) {
      let html = `<table class="custom-table" style="width: 100%;">
                    <thead>
                      <tr><th style="text-align:left;">เน€เธ”เธทเธญเธเธ—เธตเนเธเธณเธฃเธฐเน€เธเธดเธ</th><th style="text-align:right;">เธเธณเธเธงเธเธเธฑเธเน€เธฃเธตเธขเธ</th></tr>
                    </thead>
                    <tbody>`;
      for (let m = 1; m <= 12; m++) {
        if (data.privateGroupStats[m]) {
          html += `<tr>
                     <td>\${monthsTH[m-1]}</td>
                     <td style="text-align:right; font-weight: bold; color: var(--color-primary);">\${data.privateGroupStats[m]} เธเธ</td>
                   </tr>`;
        }
      }
      html += `</tbody></table>`;
      privateGroupContainer.innerHTML = html;
    } else {
      privateGroupContainer.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding: 20px;">เนเธกเนเธกเธตเธเนเธญเธกเธนเธฅเน€เธ”เนเธเน€เธ”เธตเนเธขเธง/เธขเนเธญเธข</div>`;
    }
  }
}





let lastSummaryData = null;

let lastCategoriesData = null;



function changeSummaryBranch() {

  if (lastSummaryData && lastCategoriesData) {

    renderRoundSummaryTable(lastSummaryData, lastCategoriesData);

  }

}



function loadRoundSummary(isSilent = false) {

  const round = document.getElementById('summary_round_filter').value;

  const branch = ''; // เธ”เธถเธเธเนเธญเธกเธนเธฅเธ—เธฑเนเธเธซเธกเธ”เธเธฒเธเธเธฒเธเธเนเธญเธกเธนเธฅ เนเธกเนเนเธขเธเธชเธฒเธเธฒ

  

  if (!isSilent) setLoading(true, 'เธเธณเธฅเธฑเธเธเธฃเธฐเธกเธงเธฅเธเธฅเธชเธฃเธธเธเธเนเธญเธกเธนเธฅเธ•เธฒเธกเธฃเธญเธ ' + round + '...');

  google.script.run

    .withSuccessHandler(res => {

      if (!isSilent) setLoading(false);

      if (res && res.success) {

        lastSummaryData = res.summary;

        lastCategoriesData = res.categories;

        renderRoundSummaryTable(res.summary, res.categories);

      } else if (!isSilent) {

        showToast('เธเธฒเธฃเธเธฃเธฐเธกเธงเธฅเธเธฅเธฅเนเธกเน€เธซเธฅเธง: ' + res.error, 'error');

      }

    })

    .withFailureHandler(err => {

      if (!isSilent) {

        setLoading(false);

        showToast('เธเธฒเธฃเธ•เธดเธ”เธ•เนเธญเธฅเนเธกเน€เธซเธฅเธง: ' + err.message, 'error');

      }

    })

    .getRoundSummary(round, branch);

}



function renderRoundSummaryTable(summary, categories) {

  const tbody = document.getElementById('summary_table_tbody');

  const tfoot = document.getElementById('summary_table_tfoot');

  tbody.innerHTML = '';

  

  const selectedBranch = document.getElementById('summary_branch_filter') ? document.getElementById('summary_branch_filter').value : '';

  

  let totalSinglePaid = 0;

  let totalSingleDebt = 0;

  let totalSingleAndSubgroup = 0;

  let totalRegularGroup = 0;

  let sumGroupFull = 0;

  let sumGroupPaid = 0;

  let sumGroupDebt = 0;

  let totalOverFive = 0;

  

  // Group categories by branch

  const groups = {};

  categories.forEach(catObj => {

    // If a specific branch is selected, only keep matches

    if (selectedBranch && catObj.branch !== selectedBranch) return;

    

    if (!groups[catObj.branch]) {

      groups[catObj.branch] = [];

    }

    groups[catObj.branch].push(catObj);

  });

  

  const branchList = Object.keys(groups).sort();

  

  if (branchList.length === 0) {

    tbody.innerHTML = '<tr><td colspan="11" style="text-align: center; padding: 30px; color: var(--text-muted); font-size: 0.9rem;">เนเธกเนเธเธเธเนเธญเธกเธนเธฅเธ•เธฒเธกเธชเธฒเธเธฒเธ—เธตเนเน€เธฅเธทเธญเธ</td></tr>';

    tfoot.innerHTML = '';

    return;

  }

  

  branchList.forEach(branchName => {

    // Render a beautiful header row for this branch

    const headerTr = document.createElement('tr');

    headerTr.style.background = 'linear-gradient(90deg, rgba(0, 132, 255, 0.08), rgba(255, 255, 255, 0))';

    headerTr.style.fontWeight = '700';

    headerTr.style.color = '#0066cc';

    

    let branchDisplayName = branchName;

    if (branchName === 'เธชเธฒเธเธฒ1') branchDisplayName = 'เธชเธฒเธเธฒ 1 เนเธขเธPMY';

    else if (branchName === 'เธชเธฒเธเธฒ2') branchDisplayName = 'เธชเธฒเธเธฒ 2 เธเนเธฒเธเนเธฃเธเน€เธฃเธตเธขเธเธฃเธฐเธขเธญเธเธงเธดเธ—เธขเธฒเธเธก';

    else if (branchName === 'เธชเธฒเธเธฒ3') branchDisplayName = 'เธชเธฒเธเธฒ 3 เธ•เธฃเธเธเนเธฒเธกเนเธฃเธเน€เธฃเธตเธขเธเธญเธฑเธชเธชเธฑเธกเธเธฑเธ เน€เธเธเธ•เนเนเธขเน€เธเธ';

    

    headerTr.innerHTML = `

      <td colspan="10" style="text-align: left; padding: 10px 15px; font-size: 0.88rem; border-left: 4px solid #0084ff; background-color: rgba(0, 132, 255, 0.04);">
        ๐“ ${branchDisplayName}
      </td>
    `;

    tbody.appendChild(headerTr);

    

    // Render matching rows

    groups[branchName].forEach(catObj => {

      const catName = catObj.grade + '|' + catObj.branch;

      const row = summary[catName];

      if (!row) return;

      

      // Sum totals

      totalSinglePaid += row.singlePaidAmount || 0;

      totalSingleDebt += row.singleDebtAmount || 0;

      totalSingleAndSubgroup += row.singleAndSubgroupCount || 0;

      totalRegularGroup += row.regularGroupCount || 0;

      sumGroupFull += row.groupFullAmount || 0;

      sumGroupPaid += row.groupPaidAmount || 0;

      sumGroupDebt += row.groupDebtAmount || 0;

      totalOverFive += row.overFiveCount || 0;

      

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight: 600; padding-left: 25px;">${catObj.grade}</td>
        <td style="font-weight: 500; color: #64748b;">${catObj.branch}</td>
        <td style="text-align: right; font-weight:600; color:#16a34a;">${row.singlePaidAmount > 0 ? 'เธฟ' + row.singlePaidAmount.toLocaleString() : '-'}</td>
        <td style="text-align: right; font-weight:600; color:${row.singleDebtAmount > 0 ? '#ef4444' : 'inherit'};">${row.singleDebtAmount > 0 ? 'เธฟ' + row.singleDebtAmount.toLocaleString() : '-'}</td>
        <td style="text-align: center;">${row.singleAndSubgroupCount || '-'}</td>
        <td style="text-align: right; font-weight:600; color: #64748b;">${row.groupFullAmount > 0 ? 'เธฟ' + row.groupFullAmount.toLocaleString() : '-'}</td>
        <td style="text-align: right; font-weight:600; color:#16a34a;">${row.groupPaidAmount > 0 ? 'เธฟ' + row.groupPaidAmount.toLocaleString() : '-'}</td>
        <td style="text-align: right; font-weight:600; color:${row.groupDebtAmount > 0 ? '#ef4444' : 'inherit'};">${row.groupDebtAmount > 0 ? 'เธฟ' + row.groupDebtAmount.toLocaleString() : '-'}</td>
        <td style="text-align: center;">${row.regularGroupCount || '-'}</td>
        <td style="text-align: center; font-weight: 600; color: #1e3a8a;">${row.overFiveCount || '-'}</td>
      `;
      tbody.appendChild(tr);

    });

  });

  

  tfoot.innerHTML = `

    <td colspan="2" style="font-weight: 700;">เธขเธญเธ”เธฃเธงเธกเธ—เธฑเนเธเธซเธกเธ”${selectedBranch ? ' (' + selectedBranch + ')' : ''}</td>
    <td style="text-align: right; color:#16a34a; font-weight:700;">เธฟ${totalSinglePaid.toLocaleString()}</td>
    <td style="text-align: right; color:#ef4444; font-weight:700;">เธฟ${totalSingleDebt.toLocaleString()}</td>
    <td style="text-align: center; font-weight:700;">${totalSingleAndSubgroup}</td>
    <td style="text-align: right; font-weight:700;">เธฟ${sumGroupFull.toLocaleString()}</td>
    <td style="text-align: right; color:#16a34a; font-weight:700;">เธฟ${sumGroupPaid.toLocaleString()}</td>
    <td style="text-align: right; color:#ef4444; font-weight:700;">เธฟ${sumGroupDebt.toLocaleString()}</td>
    <td style="text-align: center; font-weight:700;">${totalRegularGroup}</td>
    <td style="text-align: center; color: #1e3a8a; font-weight:700;">${totalOverFive}</td>
  `;

}



// ----------------------------------------------------

// 2. Student Registrations & Dropdown Loaders

// ----------------------------------------------------

function loadStudents(isSilent = false) {
  fetchCachedStudents(isSilent, data => {
    renderStudentsTable();
  });
}



function setStudentBranchFilter(branch, btn) {

  const parent = btn.parentElement;

  parent.querySelectorAll('.branch-tab').forEach(b => b.classList.remove('active'));

  btn.classList.add('active');

  document.getElementById('student_branch_filter').value = branch;

  renderStudentsTable();

}



function setStudentGradeFilter(grade, btn) {

  const parent = btn.parentElement;

  parent.querySelectorAll('.branch-tab').forEach(b => b.classList.remove('active'));

  btn.classList.add('active');

  document.getElementById('student_grade_filter').value = grade;

  renderStudentsTable();

}



function renderStudentsTable() {

  const query = document.getElementById('student_search').value.toLowerCase().trim();

  const branchFilter = document.getElementById('student_branch_filter').value;

  const gradeFilter = document.getElementById('student_grade_filter') ? document.getElementById('student_grade_filter').value : '';

  const tbody = document.getElementById('students_tbody');

  tbody.innerHTML = '';

  

  const filtered = state.students.filter(s => {

    const matchQuery = !query || s.name.toLowerCase().includes(query) || 

                       s.nickname.toLowerCase().includes(query) || 

                       s.contact.toLowerCase().includes(query) ||

                       s.lineName.toLowerCase().includes(query);

                       

    const matchBranch = !branchFilter || (s.branchLearn && s.branchLearn.includes(branchFilter));

    const matchGrade = !gradeFilter || (s.grade && s.grade.includes(gradeFilter)) || (s.classType && s.classType.includes(gradeFilter));

    return matchQuery && matchBranch && matchGrade;

  });

  

  filtered.forEach(s => {

    const tr = document.createElement('tr');

    const statusBadge = s.outstanding <= 0 ? 

      '<span class="badge badge-success">เธเธณเธฃเธฐเธเธฃเธเนเธฅเนเธง</span>' : 

      `<span class="badge badge-danger">เธเนเธฒเธ เธฟ${s.outstanding.toLocaleString()}</span>`;

      

    let hoursDisplay = '';

    const classType = s.classType || 'เน€เธ”เธตเนเธขเธง';

    const courseName = s.round ? s.round.split(', ').map(c => c.trim()).join('<br>') : '-';

    if (classType === 'เน€เธ”เธตเนเธขเธง' || classType.includes('เธขเนเธญเธข')) {

      const h = formatHoursMinutes(s.classHours);

      const hl = formatHoursMinutes(s.classHoursLeft);

      hoursDisplay = `<div style="font-size: 0.68rem; color: var(--color-primary-hover); font-weight: 500; white-space: nowrap;">๐“ ${courseName}</div>`;

      hoursDisplay += `<div style="font-size: 0.62rem; color: var(--text-muted); white-space: nowrap;">โฑ ${h} (เน€เธซเธฅเธทเธญ: ${hl})</div>`;

    } else {

      hoursDisplay = `<div style="font-size: 0.68rem; color: var(--color-primary-hover); font-weight: 500; white-space: nowrap;">๐“ ${courseName}</div>`;

    }

      

    tr.innerHTML = `

      <td>

        <div style="font-weight: 600; color: var(--color-primary-hover); cursor: pointer; white-space: nowrap;" onclick="showStudentHistoryModal('${s.name}', '${s.nickname}')">๐ง’ ${s.name}</div>

        <div style="font-size: 0.7rem; color: var(--text-muted); white-space: nowrap;">${s.classType} ${s.grade || ''} | Line: ${s.lineName || '-'}</div>

      </td>

      <td>${s.nickname}</td>

      <td style="white-space: nowrap;">${s.school || '-'} ${s.classSection ? `(${s.classSection})` : ''}</td>

      <td>

        <div style="font-size: 0.78rem; font-weight: 600; color: var(--text-main); white-space: nowrap;">${s.branchLearn || '-'}</div>

        <div style="font-size: 0.68rem; color: var(--text-muted); white-space: nowrap;">${formatPhone(s.contact) || '-'}</div>

      </td>

      <td>

        <div style="font-weight: 600; white-space: nowrap;">เธฟ${s.full.toLocaleString()}</div>

        ${hoursDisplay}

      </td>

      <td>${statusBadge}</td>

      <td style="white-space: nowrap;">${formatDateTimeToThaiLong(s.paymentDate) || '-'}</td>

      <td>

        <div style="display: flex; gap: 6px;">

          <button class="btn btn-secondary btn-icon" onclick="showEditStudentModal('${s.id}', '${(s.name || '').replace(/'/g, "\\'")}')" title="เนเธเนเนเธ">โ๏ธ</button>

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

  const cleanVal = classType.toString().trim();

  return cleanVal.includes('เธซเธฅเธฑเธ') || cleanVal.includes('ัก') || ['เธญเธเธธเธเธฒเธฅ','เธ.1','เธ.2','เธ.3','เธ.4','เธ.5','เธ.6','เธก.1','เธก.2','เธก.3','เธก.4','เธก.5','เธก.6'].some(g => cleanVal.includes(g));

}



// Helper: Update combined round string from round components

function updateCombinedRound() {

  const classType = document.getElementById('student_class_type').value;

  let finalRound = '';

  if (isMainGroup(classType)) {

    const base = document.getElementById('round_select').value;

    const year = document.getElementById('round_year').value.trim();

    finalRound = base + year;

    document.getElementById('student_round').value = finalRound;

  } else {

    const courseInput = document.querySelector('.subgroup-course-input');

    finalRound = courseInput ? courseInput.value.trim() : '';

    document.getElementById('student_round').value = finalRound;

    

    // Recalculate price dynamically

    calculateMainGroupFee();

  }

}



// Recalculate fees for Main Group classes with 3rd (30%) and 4th+ (50%) discounts

function calculateMainGroupFee() {

  const classType = document.getElementById('student_class_type').value;

  let total = 0;

  

  if (isMainGroup(classType)) {

    const selectedCheckboxes = document.querySelectorAll('.course-checkbox:checked');

    const fullCourses = [];

    let partialTotal = 0;

    

    selectedCheckboxes.forEach(cb => {

      const price = parseFloat(cb.getAttribute('data-price')) || 0;

      const totalSessions = parseInt(cb.getAttribute('data-total-sessions')) || 10;

      

      const row = cb.closest('.course-item-row');

      let userSessions = totalSessions;

      if (row) {

        const input = row.querySelector('.course-sessions-input');

        if (input) {

          userSessions = parseInt(input.value) || totalSessions;

        }

      }

      

      if (userSessions !== totalSessions) {

        partialTotal += price * (userSessions / totalSessions);

      } else {

        fullCourses.push(price);

      }

    });

    

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

    

    total = partialTotal + fullTotal;

  } else {

    // Single (เน€เธ”เธตเนเธขเธง) or Small Group (เธเธฅเธธเนเธกเธขเนเธญเธข)

    let price = 2000;

    const grade = document.getElementById('student_grade').value;

    

    if (classType === 'เน€เธ”เธตเนเธขเธง') {

      const roundText = document.getElementById('student_round_text').value.toLowerCase().trim();

      const isEx = roundText.endsWith('ex') || roundText.includes('ex');

      if (['เธก.4', 'เธก.5', 'เธก.6'].includes(grade) || isEx) {

        price = 2500;

      } else {

        price = 2000;

      }

    } else if (classType === 'เธเธฅเธธเนเธกเธขเนเธญเธข') {

      const subSize = document.getElementById('student_subgroup_size').value;

      if (subSize.includes('2-3')) {

        price = 3000;

      } else if (subSize.includes('4-5')) {

        price = 2500;

      } else if (subSize.includes('6-10')) {

        price = 2000;

      }

    }

    total = price;

  }

  

  // Check if "เธฃเธนเธ”เธเธฑเธ•เธฃ" payment mode is checked

  const payModeCard = document.getElementById('pay_mode_card_0') || document.getElementById('pay_mode_card');

  if (payModeCard && payModeCard.checked) {

    total *= 1.03;

  }

  

  // Check if Unpaid ("เธขเธฑเธเนเธกเนเธเธณเธฃเธฐ") payment mode is checked

  const payModeUnpaid = document.getElementById('pay_mode_unpaid_0') || document.getElementById('pay_mode_unpaid');

  if (payModeUnpaid && payModeUnpaid.checked) {

    for (let r = 1; r <= 3; r++) {

      const el = document.getElementById(`pay_r${r}_amount_0`) || document.getElementById(`pay_r${r}_amount`);

      if (el) el.value = '';

    }

  }

  

  const roundedTotal = Math.round(total);

  const feeDisplay = document.getElementById('calculated_fee_display');

  if (feeDisplay) feeDisplay.innerText = roundedTotal.toLocaleString();

  const fullEl = document.getElementById('student_full_0') || document.getElementById('student_full');

  if (fullEl) fullEl.value = roundedTotal;

  

  // Auto-fill installment 1 if it is a new student

  if (!state.selectedStudent) {

    const r1El = document.getElementById('pay_r1_amount_0') || document.getElementById('pay_r1_amount');

    if (r1El) {

      if (payModeUnpaid && payModeUnpaid.checked) {

        r1El.value = '';

      } else {

        r1El.value = roundedTotal;

      }

    }

  }

  

  calculateInstallmentTotal();

}



// Dynamic course checkboxes loader when grade or branch changes for main group

function handleGradeBranchChange() {

  const classTypeSelect = document.getElementById('student_class_type');

  if (!classTypeSelect) return;

  const classType = classTypeSelect.value;

  

  const gradeEl = document.getElementById('student_grade');

  if (!gradeEl) return;

  let grade = gradeEl.value;

  

  const courseGradeEl = document.getElementById('student_course_grade');

  if (classType !== 'เธเธฅเธธเนเธกเธซเธฅเธฑเธ' && courseGradeEl) {

    grade = courseGradeEl.value;

    gradeEl.value = grade; // Sync back

  }

  

  if (classType !== 'เธเธฅเธธเนเธกเธซเธฅเธฑเธ') {

    if (classType === 'เน€เธ”เธตเนเธขเธง') {

      const courseNameEl = document.getElementById('student_round_text');

      const courseName = courseNameEl ? courseNameEl.value.toLowerCase().trim() : '';

      const isEx = courseName.endsWith('ex') || courseName.includes('ex');

      let price = 2000;

      if (['เธก.4', 'เธก.5', 'เธก.6'].includes(grade) || isEx) {

        price = 2500;

      }

      

      const fullEl = document.getElementById('student_full_0');

      if (fullEl) fullEl.value = price;

      

      const displayEl = document.getElementById('calculated_fee_display');

      if (displayEl) displayEl.innerText = price.toLocaleString();

      

      const paidEl = document.getElementById('student_paid_0');

      if (paidEl && !state.selectedStudent) {

        paidEl.value = price;

      }

    }

    return;

  }

  

  const branchEl = document.getElementById('student_branch_learn');

  if (!branchEl) return;

  const branch = branchEl.value;

  

  const container = document.getElementById('course_checkboxes_container');

  if (container) {

    container.innerHTML = '<span style="color:var(--text-muted); font-size:0.85rem;">เธเธณเธฅเธฑเธเนเธซเธฅเธ”เธงเธดเธเธฒเน€เธฃเธตเธขเธ...</span>';

  }

  

  google.script.run

    .withSuccessHandler(courses => {

      if (!container) return;

      if (Array.isArray(courses) && courses.length > 0) {

        // Extract unique rounds
        const roundSet = new Set();
        const roundRegex = /(MIDTERM|FINAL|SUMMER|เธ•เธธเธฅเธฒเธเธก|เธ•เธธเธฅเธฒ|เธกเธตเธเธฒเธเธก|เธกเธตเธเธฒ|เน€เธ—เธญเธก)\s*[a-zA-Z0-9\/]+/i;

        let html = '';
        courses.forEach(c => {
          let roundMatch = (c.courseName || '').match(roundRegex);
          let roundValue = roundMatch ? roundMatch[0].trim() : 'เธญเธทเนเธเน';
          roundSet.add(roundValue);

          html += `
            <div class="course-item-row" data-round="${roundValue}" style="display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 6px; background: #fff; border-radius: 6px; border: 1px solid rgba(74, 93, 85, 0.2);">
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; flex: 1; margin: 0;">
                <input type="checkbox" class="course-checkbox" value="${c.courseName}" data-price="${c.price}" data-total-sessions="${c.totalSessions || 10}" onchange="calculateMainGroupFee(); toggleSessionInput(this)">
                <span style="font-size: 0.85rem; font-weight: 500; color: var(--text-main);">${c.courseName} ${c.dayTime ? '(' + c.dayTime + ')' : ''} (เธฟ${c.price})</span>
              </label>
              <div class="session-input-wrapper" style="display: flex; align-items: center; gap: 4px;">
                <input type="number" class="course-sessions-input" style="width: 50px; padding: 2px 4px; font-size: 0.8rem; border: 1px solid var(--border-color); border-radius: 4px; text-align: center;" 
                       min="1" max="100" value="${c.totalSessions || 10}" data-total="${c.totalSessions || 10}" 
                       oninput="autoCheckCourse(this); calculateMainGroupFee()" onchange="calculateMainGroupFee()">
                <span style="font-size: 0.75rem; color: var(--text-muted);">เธเธฃเธฑเนเธ</span>
              </div>
            </div>
          `;
        });
        
        // Update round dropdown
        const roundSelect = document.getElementById('course_round_filter');
        const roundGroup = document.getElementById('course_round_filter_group');
        if (roundSelect && roundGroup) {
          let optionsHtml = '<option value="">เนเธชเธ”เธเธ—เธฑเนเธเธซเธกเธ” (All)</option>';
          const sortedRounds = Array.from(roundSet).sort();
          sortedRounds.forEach(r => {
            optionsHtml += `<option value="${r}">${r}</option>`;
          });
          roundSelect.innerHTML = optionsHtml;
          roundGroup.style.display = roundSet.size > 1 ? 'block' : 'none'; // Only show if more than one round (or "เธญเธทเนเธเน" and another)
        }

        container.innerHTML = html;

        

        if (state.selectedStudent) {
          const selectedList = state.selectedStudent.selectedCourses || [];
          
          // Clear all checkboxes first
          document.querySelectorAll('.course-checkbox').forEach(cb => {
            cb.checked = false;
            toggleSessionInput(cb);
          });
          
          // Check the ones returned
          selectedList.forEach(item => {
            let courseName = item.courseName || item;
            let sessions = item.sessions || 10;
            
            document.querySelectorAll('.course-checkbox').forEach(cb => {
              if (cb.value === courseName) {
                cb.checked = true;
                const sessionInput = cb.closest('.course-item-row').querySelector('.course-sessions-input');
                if (sessionInput) {
                  sessionInput.value = sessions;
                }
                toggleSessionInput(cb);
              }
            });
          });
          
          const pChannel = state.selectedStudent.paymentChannel || '';
          const cardRadio = document.getElementById('pay_mode_card_0');
          const cashRadio = document.getElementById('pay_mode_cash_0');
          const transferRadio = document.getElementById('pay_mode_transfer_0');
          
          if (state.selectedStudent.isCard) {
            if (cardRadio) cardRadio.checked = true;
          } else if (pChannel === 'เน€เธเธดเธเธชเธ”' || pChannel === 'เธชเธ”') {
            if (cashRadio) cashRadio.checked = true;
          } else {
            if (transferRadio) transferRadio.checked = true;
          }
          
          calculateMainGroupFee();
        } else {
          calculateMainGroupFee();
        }

      } else {

        container.innerHTML = '<span style="color:var(--text-muted); font-size:0.85rem;">เนเธกเนเธเธเธเนเธญเธกเธนเธฅเธงเธดเธเธฒเน€เธฃเธตเธขเธเนเธเธฃเธฐเธ”เธฑเธเธเธฑเนเธเธเธตเน</span>';

        const displayEl = document.getElementById('calculated_fee_display');

        if (displayEl) displayEl.innerText = '0';

        const fullEl = document.getElementById('student_full_0');

        if (fullEl) fullEl.value = '0';

      }

    })

    .getGradeCourses(grade, branch, getLogUser());

}



function toggleSessionInput(cb) {

  const row = cb.closest('.course-item-row');

  if (!row) return;

  const input = row.querySelector('.course-sessions-input');

  if (input) {

    if (!cb.checked) {

      input.value = input.getAttribute('data-total');

    }

  }

}


function filterCoursesByRound() {
  const roundFilter = document.getElementById('course_round_filter').value;
  const courseRows = document.querySelectorAll('.course-item-row');
  
  courseRows.forEach(row => {
    const rowRound = row.getAttribute('data-round');
    if (!roundFilter || rowRound === roundFilter) {
      row.style.display = 'flex';
    } else {
      row.style.display = 'none';
      // Also uncheck the hidden ones to prevent accidental registration
      const cb = row.querySelector('.course-checkbox');
      if (cb && cb.checked) {
        cb.checked = false;
        toggleSessionInput(cb);
      }
    }
  });
  calculateMainGroupFee();
}

function autoCheckCourse(input) {


  const cb = input.closest('.course-item-row').querySelector('.course-checkbox');

  if (cb && !cb.checked) {

    cb.checked = true;

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

            if(document.getElementById('pay_mode_card')) document.getElementById('pay_mode_card').checked = true;

          } else if (state.selectedStudent && (state.selectedStudent.paymentChannel === 'เน€เธเธดเธเธชเธ”' || state.selectedStudent.paymentChannel === 'เธชเธ”')) {

            if(document.getElementById('pay_mode_cash')) document.getElementById('pay_mode_cash').checked = true;

          } else {

            if(document.getElementById('pay_mode_transfer')) document.getElementById('pay_mode_transfer').checked = true;

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

    .getGradeSheetData(grade, branch, getLogUser());

}



// Triggered when Class Type changes: set layout or autofill prices & hours

function clearSubgroupCourses() {

  const container = document.getElementById('subgroup_courses_list');

  container.innerHTML = `

    <div class="subgroup-course-item" style="display: flex; gap: 8px; align-items: center; width: 100%;">

      <input type="text" id="student_round_text" class="form-input subgroup-course-input" placeholder="เธ•เธฑเธงเธญเธขเนเธฒเธ: เธ“เธ”เธฒ(เธฅเธดเธเธฅเธ”เธฒ) เธญ.2 เน€เธ”เธตเนเธขเธงเธเธ“เธดเธ• 1" style="flex: 1;" oninput="updateCombinedRound()">

    </div>

  `;

  if(document.getElementById('add_course_input_btn')) document.getElementById('add_course_input_btn').style.display = 'block';

}



function addSubgroupCourseRow(value = '') {

  const container = document.getElementById('subgroup_courses_list');

  const div = document.createElement('div');

  div.className = 'subgroup-course-item';

  div.style.display = 'flex';

  div.style.gap = '8px';

  div.style.alignItems = 'center';

  div.style.width = '100%';

  

  div.innerHTML = `

    <input type="text" class="form-input subgroup-course-input" placeholder="เธ•เธฑเธงเธญเธขเนเธฒเธ: เธ“เธ”เธฒ(เธฅเธดเธเธฅเธ”เธฒ) เธญ.2 เน€เธ”เธตเนเธขเธงเธเธ“เธดเธ• 1" style="flex: 1;" value="${value}" oninput="updateCombinedRound()">

    <button type="button" class="btn btn-danger" onclick="this.parentElement.remove(); updateCombinedRound();" style="padding: 4px 8px; font-size: 0.72rem; height: auto;">เธฅเธ</button>

  `;

  container.appendChild(div);

  updateCombinedRound();

}



function handleClassTypeChange() {

  window.handleClassTypeChange();

}



function closeAllModals() {

  document.querySelectorAll('.modal-backdrop').forEach(modal => {

    modal.classList.remove('active');

  });

  // Also close modal-overlay modals (e.g. add_employee_modal)

  document.querySelectorAll('.modal-overlay').forEach(modal => {

    modal.style.display = 'none';

  });

}



function showAddStudentModal() {

  openStudentModal();

}



function showEditStudentModal(id, name) {

  openStudentModal(id, name);

}



function closeStudentModal() {

  document.getElementById('student_modal').classList.remove('active');

}



function saveStudent(e) {

  window.saveStudent(e);

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

function syncAllFinancials() {
  const btn = document.getElementById('btn_sync_all_financials');
  if (!confirm('เธ•เนเธญเธเธเธฒเธฃเธเธดเธเธเนเธเนเธญเธกเธนเธฅเธเธฒเธฃเน€เธเธดเธเธ—เธฑเนเธเธซเธกเธ”เธเธฒเธ StatusDB เธฅเธเธ•เธฒเธฃเธฒเธเธเธฅเธธเนเธกเธซเธฅเธฑเธเธซเธฃเธทเธญเนเธกเน? เธเธฒเธฃเธ”เธณเน€เธเธดเธเธเธฒเธฃเธเธตเนเธญเธฒเธเนเธเนเน€เธงเธฅเธฒเธชเธฑเธเธเธฃเธนเน')) return;
  
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '๐” เธเธณเธฅเธฑเธเธเธดเธเธเน...';
  }
  setLoading(true, 'เธเธณเธฅเธฑเธเธเธดเธเธเนเธเนเธญเธกเธนเธฅเธเธฒเธฃเน€เธเธดเธเธ—เธฑเนเธเธซเธกเธ”...');
  
  google.script.run
    .withSuccessHandler(res => {
      setLoading(false);
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '๐” เธเธดเธเธเนเธขเธญเธ”เน€เธเธดเธเธ—เธฑเนเธเธซเธกเธ”';
      }
      showToast('เธเธดเธเธเนเธเนเธญเธกเธนเธฅเธชเธณเน€เธฃเนเธ: ' + res, 'success');
      loadGradeSheetGrid(true); // reload current view silently
    })
    .withFailureHandler(err => {
      setLoading(false);
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '๐” เธเธดเธเธเนเธขเธญเธ”เน€เธเธดเธเธ—เธฑเนเธเธซเธกเธ”';
      }
      showToast('เน€เธเธดเธ”เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”เนเธเธเธฒเธฃเธเธดเธเธเนเธเนเธญเธกเธนเธฅ: ' + err.message, 'error');
    })
    .migrateGradeSheetsFinancials();
}



function loadGradeSheetGrid(isSilent = false) {

  const grade = document.getElementById('grade_sheet_grade_select').value;

  const branch = document.getElementById('grade_sheet_branch_select').value;

  

  if (!isSilent) setLoading(true, 'เธเธณเธฅเธฑเธเนเธซเธฅเธ”เธชเน€เธเธฃเธ”เธเธตเธ•เธเธฑเธ”เธซเนเธญเธเน€เธฃเธตเธขเธ ' + grade + ' เธเธญเธ ' + branch + '...');

  google.script.run

    .withSuccessHandler(res => {

      if (!isSilent) setLoading(false);

      if (res && res.success) {

        state.gradeSheetData = res;

        updateRoundFilterDropdown();

        renderGradeSheetTable();

      } else if (!isSilent) {

        showToast('เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เนเธซเธฅเธ”เธงเธดเธเธฒเนเธฅเธฐเนเธเธฃเธเธชเธฃเนเธฒเธเธเธญเธฃเนเธชเธเธญเธเธซเนเธญเธเธเธตเนเนเธ”เน: ' + (res ? res.error : 'unknown'), 'error');

      }

    })

    .withFailureHandler(err => {

      if (!isSilent) {

        setLoading(false);

        showToast('เธเธฒเธฃเน€เธเธทเนเธญเธกเธ•เนเธญเธเธญเธเธชเธ–เธฒเธเธ—เธตเนเธฅเนเธกเน€เธซเธฅเธง: ' + err.message, 'error');

      }

    })

    .getGradeSheetData(grade, branch, getLogUser());

}
function searchGlobalBackend() {
  const input = document.getElementById('grade_sheet_search');
  if (!input) return;
  const term = input.value.trim();
  if (!term) {
    showToast('เธเธฃเธธเธ“เธฒเธเธดเธกเธเนเธเธทเนเธญเธซเธฃเธทเธญเธเธทเนเธญเน€เธฅเนเธเธ—เธตเนเธ•เนเธญเธเธเธฒเธฃเธเนเธเธซเธฒ', 'warning');
    return;
  }
  
  // Set grade and branch to "all" automatically for global search
  const gradeSelect = document.getElementById('grade_sheet_grade_select');
  const branchSelect = document.getElementById('grade_sheet_branch_select');
  if (gradeSelect) gradeSelect.value = 'all';
  if (branchSelect) branchSelect.value = 'all';
  
  setLoading(true, 'เธเธณเธฅเธฑเธเธเนเธเธซเธฒเธเธฑเธเน€เธฃเธตเธขเธเธ—เธฑเนเธงเธ—เธฑเนเธเธฃเธฐเธเธ...');
  google.script.run
    .withSuccessHandler(res => {
      setLoading(false);
      if (res && res.success) {
        state.gradeSheetData = res;
        updateRoundFilterDropdown();
        renderGradeSheetTable();
      } else {
        showToast('เธเนเธเธซเธฒเธฅเนเธกเน€เธซเธฅเธง: ' + (res ? res.error : 'unknown'), 'error');
      }
    })
    .withFailureHandler(err => {
      setLoading(false);
      showToast('เธเธฒเธฃเน€เธเธทเนเธญเธกเธ•เนเธญเธเธญเธเธชเธ–เธฒเธเธ—เธตเนเธฅเนเธกเน€เธซเธฅเธง: ' + err.message, 'error');
    })
    .getGradeSheetData('all', 'all', getLogUser(), term);
}


function editStudentFromGradeSheet(studentName) {
  fetchCachedStudents(false, data => {
    openEditModalByName(studentName);
  });
}



function openEditModalByName(studentName) {

  const selectedBranch = document.getElementById('grade_sheet_branch_select').value;

  const selectedGrade = document.getElementById('grade_sheet_grade_select').value;

  
  // Search in state.students (from getStudentsList)
  let match = state.students.find(reg => 

    reg.name.trim() === studentName.trim() && 

    reg.grade === selectedGrade && 

    reg.branchLearn === selectedBranch

  );

  

  if (!match) {

    match = state.students.find(reg => 

      reg.name.trim() === studentName.trim() && 

      reg.grade === selectedGrade

    );

  }

  

  if (!match) {

    match = state.students.find(reg => reg.name.trim() === studentName.trim());

  }

  

  if (!match) {

    const cleanTarget = studentName.replace(/\s+/g, '');

    match = state.students.find(reg => reg.name.replace(/\s+/g, '') === cleanTarget);

  }

  // Fallback: search in state.gradeSheetData.students if available
  if (!match && state.gradeSheetData && state.gradeSheetData.students) {
    const gsMatch = state.gradeSheetData.students.find(s => s.name && s.name.trim() === studentName.trim());
    if (gsMatch) {
      match = {
        id: gsMatch.studentId || gsMatch.name,
        name: gsMatch.name,
        grade: gsMatch.grade,
        branchLearn: gsMatch.branch || gsMatch.branchLearn || '',
        branchPay: gsMatch.branchPay || '',
        classType: 'เธเธฅเธธเนเธกเธซเธฅเธฑเธ'
      };
    }
  }

  

  if (match) {

    // Pass both id and name for proper lookup
    showEditStudentModal(match.id || match.name, match.name);

  } else {

    // Even if no local match, try backend directly with the name
    showEditStudentModal(studentName, studentName);

  }

}



function renderGradeSheetTable() {

  const table = document.getElementById('grade_sheet_grid_table');

  table.innerHTML = '';

  

  const courses = state.gradeSheetData.courses || [];

  const students = state.gradeSheetData.students || [];

  

  const filterRound = state.gradeSheetFilterRound || 'ALL';

  const selectedBranch = document.getElementById('grade_sheet_branch_select').value;

  

  const displayedCourses = courses.filter(c => {
    if (selectedBranch !== 'all' && c.branch !== selectedBranch) return false;
    
    if (filterRound === 'ALL') {
      return true;
    } else {
      if (filterRound === 'เนเธกเนเธฃเธฐเธเธธเธฃเธญเธเน€เธฃเธตเธขเธ') {
        return getCourseRound(c.courseName) === 'None';
      }
      return c.courseName.toUpperCase().includes(filterRound.toUpperCase());
    }
  });

  const displayedStudents = students.filter(s => {
    return selectedBranch === 'all' || s.branch === selectedBranch;
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

        <div style="font-weight:600; color: var(--text-main); font-size: 0.9rem;">${s.name}</div>

        <div style="font-size:0.75rem; color:var(--color-primary); margin-top:2px; font-weight:600;">

          [${s.branch === 'เธชเธฒเธเธฒ1' ? 'เธชเธฒเธเธฒ 1' : s.branch === 'เธชเธฒเธเธฒ2' ? 'เธชเธฒเธเธฒ 2' : 'เธชเธฒเธเธฒ 3'}]

        </div>

        <div style="margin-top: 4px;">

          <a href="#" onclick="editStudentFromGradeSheet('${s.studentId || s.name}'); return false;" style="font-size: 0.72rem; color: var(--color-primary); text-decoration: underline; font-weight: 600;">โ๏ธ เนเธเนเนเธเธเธฒเธฃเธฅเธเธ—เธฐเน€เธเธตเธขเธเน€เธฃเธตเธขเธ</a>

        </div>

      </td>

      <td><div style="font-size:0.85rem; color:var(--text-main); font-weight:500; text-align:center;">${s.nickname || '-'}</div></td>

      <td><div style="text-align:center;"><input type="number" value="${s.discount}" class="form-input grid-cell-input" style="width:70px; text-align:center; padding:2px;" onchange="handleGridDiscountChange(${stdIdx}, this.value)"></div></td>

      <td><div style="font-size:0.85rem; color:var(--text-main); font-weight:600; text-align:center;">เธฟ${s.paid.toLocaleString()}</div></td>

      <td style="text-align:center; font-size:0.85rem; color:var(--text-muted);">${s.isCard ? 'เธฃเธนเธ”เธเธฑเธ•เธฃ (3%)' : '-'}</td>

      <td style="text-align:right; font-weight:700; font-size:0.9rem;" id="grid_student_full_${stdIdx}">เธฟ${s.full.toLocaleString()}</td>

      <td style="text-align:right; font-weight:700; font-size:0.9rem; color:${s.outstanding > 0 ? '#ef4444' : '#466352'};" id="grid_student_outstanding_${stdIdx}">เธฟ${s.outstanding.toLocaleString()}</td>

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
  recalculateGridTotals();
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
  const rawVal = input.value.toString().replace(/,/g, '');
  const val = parseFloat(rawVal) || 0;
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



function handleGridDiscountChange(stdIdx, val) {
  if (!state.displayedStudents || !state.displayedStudents[stdIdx]) return;
  const s = state.displayedStudents[stdIdx];
  const newVal = parseFloat(val) || 0;
  s.discount = newVal;
  s.outstanding = Math.max(0, s.full - s.discount - s.paid);
  
  const outEl = document.getElementById(`grid_student_outstanding_${stdIdx}`);
  if (outEl) {
    outEl.textContent = `เธฟ${s.outstanding.toLocaleString()}`;
    outEl.style.color = s.outstanding > 0 ? '#ef4444' : '#466352';
  }
  
  // enable save button
  document.getElementById('save_grade_sheet_btn').disabled = false;
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
    let fullCourses = [];
    let partialGross = 0;
    let partialNet = 0;
    courses.forEach(c => {
      if (s.sheetName === c.sheetName) {
        const val = s.courseValues[c.colIndex];
        if (val !== '' && val !== undefined && !isNaN(val)) {
          const num = parseFloat(val);
          const price = parseFloat(c.price.toString().replace(/,/g, '')) || 0;
          const totalSessions = parseInt(c.totalSessions) || 10;
          
          if (num === 30) {
            // 30% discount code
            partialGross += price;
            partialNet += price * 0.7;
          } else if (num === 20) {
            // 20% discount code (actually 10% off)
            partialGross += price;
            partialNet += price * 0.9;
          } else if (num === 50) {
            // 50% discount code
            partialGross += price;
            partialNet += price * 0.5;
          } else if (num >= 1 && num <= 2) {
            partialGross += num * 350;
            partialNet += num * 350;
          } else if (num >= 3) {
            if (num === totalSessions) {
               fullCourses.push(price);
            } else {
               const itemPrice = num * (price / totalSessions);
               partialGross += itemPrice;
               partialNet += itemPrice;
            }
          }
        }
      }
    });

    // Sort full-price courses descending for promotion discount
    fullCourses.sort((a, b) => b - a);
    let fullGross = 0;
    let fullNet = 0;
    fullCourses.forEach((price, idx2) => {
      fullGross += price;
      if (idx2 === 0 || idx2 === 1) {
        fullNet += price;           // 1st & 2nd: full price
      } else if (idx2 === 2) {
        fullNet += price * 0.7;     // 3rd: 30% off
      } else {
        fullNet += price * 0.5;     // 4th+: 50% off
      }
    });

    let grossTotal = partialGross + fullGross;
    let netTotal = partialNet + fullNet;

    

    if (s.isCard) {
      grossTotal *= 1.03;
      netTotal *= 1.03;
    }

    // Auto discount = gross - net (from promotions)
    const autoDiscount = Math.round((grossTotal - netTotal) * 100) / 100;
    
    // full = เธเนเธฒเน€เธฃเธตเธขเธเธ—เธฑเนเธเธซเธกเธ” (gross), discount = เธชเนเธงเธเธฅเธ”เนเธเธฃเนเธกเธเธฑเธ, outstanding = เธขเธญเธ”เธเนเธฒเธ
    s.full = Math.round(grossTotal * 100) / 100;
    s.discount = autoDiscount;
    s.outstanding = Math.round(Math.max(0, grossTotal - autoDiscount - s.paid) * 100) / 100;

    

    const fullEl = document.getElementById(`grid_student_full_${idx}`);

    if (fullEl) fullEl.innerText = 'เธฟ' + s.full.toLocaleString();

    // Update discount display
    const discEl = document.querySelector(`#grade_grid_tbody tr:nth-child(${idx + 1}) .grid-cell-input`);
    if (discEl) discEl.value = s.discount;

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



function initAddCourseRows() {

  const tbody = document.getElementById('add_course_rows_tbody');

  if (!tbody) return;

  tbody.innerHTML = '';

  

  const dayTimeSelectHtml = document.getElementById('new_course_day_time').innerHTML;

  

  for (let i = 1; i <= 15; i++) {

    const tr = document.createElement('tr');

    tr.innerHTML = `

      <td style="padding: 6px; text-align: center; font-weight: 600; color: var(--text-muted);">${i}</td>

      <td style="padding: 6px;">

        <input type="text" class="form-input course-name-input" list="main_courses_list" placeholder="เธเธดเธกเธเนเธเธทเนเธญเธเธญเธฃเนเธช..." style="width: 100%; font-size: 0.82rem; padding: 6px 10px;">

      </td>

      <td style="padding: 6px;">

        <select class="form-select course-daytime-select" style="width: 100%; font-size: 0.82rem; padding: 6px 10px;">

          ${dayTimeSelectHtml}

        </select>

      </td>

      <td style="padding: 6px;">

        <input type="number" class="form-input course-price-input" placeholder="2500" value="2500" style="width: 100%; font-size: 0.82rem; padding: 6px 10px;">

      </td>

      <td style="padding: 6px; text-align: center;">

        <input type="number" class="form-input course-sessions-input" placeholder="10" value="10" style="width: 100%; font-size: 0.82rem; padding: 6px 10px; text-align: center;">

      </td>

    `;

    tbody.appendChild(tr);

  }

}



function showAddCourseColumnModal() {

  try {

    const gradeSelect = document.getElementById('grade_sheet_grade_select');

    const branchSelect = document.getElementById('grade_sheet_branch_select');

    

    const grade = gradeSelect ? gradeSelect.value : 'เธก.1';

    const branch = branchSelect ? branchSelect.value : 'เธชเธฒเธเธฒ1';

    

    const form = document.getElementById('add_course_form');

    if (form) form.reset();

    

    initAddCourseRows();

    

    const addBranch = document.getElementById('add_course_branch_select');

    if (addBranch) addBranch.value = branch;

    

    const addGrade = document.getElementById('add_course_grade_select');

    if (addGrade) addGrade.value = (grade === 'เธญเธเธธเธเธฒเธฅ' || !grade) ? 'เธ.1' : grade;

    

    const yearInput = document.getElementById('new_course_year');

    if (yearInput) yearInput.value = new Date().getFullYear() + 543;

    

    const modal = document.getElementById('add_course_modal');

    if (modal) {

      modal.classList.add('active');

    } else {

      console.error('Modal element add_course_modal not found');

    }

  } catch (err) {

    console.error('Error in showAddCourseColumnModal:', err);

  }

}



function closeAddCourseModal() {

  document.getElementById('add_course_modal').classList.remove('active');

}



function handleAddCourseColumn(e) {

  e.preventDefault();

  const grade = document.getElementById('add_course_grade_select').value;

  const branch = document.getElementById('add_course_branch_select').value;

  

  const round = document.getElementById('new_course_round').value;

  const year = document.getElementById('new_course_year').value.trim();

  

  const tbody = document.getElementById('add_course_rows_tbody');

  if (!tbody) return;

  

  const trs = tbody.querySelectorAll('tr');

  const courseList = [];

  

  trs.forEach(tr => {

    const nameInput = tr.querySelector('.course-name-input');

    const courseNameVal = nameInput ? nameInput.value.trim() : '';

    if (!courseNameVal) return; // skip empty rows

    

    const daytime = tr.querySelector('.course-daytime-select').value;

    const price = parseFloat(tr.querySelector('.course-price-input').value) || 2500;

    const sessions = parseInt(tr.querySelector('.course-sessions-input').value) || 10;

    

    // Construct full courseName with round/year

    let finalCourseName = courseNameVal;

    if (round) {

      if (year) {

        finalCourseName = `${courseNameVal} ${round}/${year}`;

      } else {

        finalCourseName = `${courseNameVal} ${round}`;

      }

    }

    

    courseList.push({

      courseName: finalCourseName,

      price: price,

      dayTime: daytime,

      sessions: sessions

    });

  });

  

  if (courseList.length === 0) {

    showToast('เธเธฃเธธเธ“เธฒเธฃเธฐเธเธธเธเธทเนเธญเธเธญเธฃเนเธชเธญเธขเนเธฒเธเธเนเธญเธข 1 เธเธญเธฃเนเธช', 'warning');

    return;

  }

  

  setLoading(true, 'เธเธณเธฅเธฑเธเนเธ—เธฃเธเธซเธฑเธงเธเธญเธฅเธฑเธกเธเนเธเธญเธฃเนเธชเธฃเธฒเธขเธงเธดเธเธฒเนเธซเธกเน ' + courseList.length + ' เธฃเธฒเธขเธเธฒเธฃเธฅเธเธชเน€เธเธฃเธ”เธเธตเธ•...');

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

    .addNewCoursesBatch(grade, branch, courseList, user);

}



// ----------------------------------------------------

// 4. Private Students Editor Logic (เน€เธ”เธตเนเธขเธง / เธเธฅเธธเนเธกเธขเนเธญเธข)

// ----------------------------------------------------

function loadPrivateStudents(isSilent = false) {

  const sheetName = document.getElementById('private_sheet_select').value;

  

  if (!isSilent) setLoading(true, 'เธเธณเธฅเธฑเธเธ”เธถเธเธชเธกเธธเธ”เธเธฃเธฐเธงเธฑเธ•เธดเน€เธ”เนเธเน€เธฃเธตเธขเธเน€เธ”เธตเนเธขเธงเธเธฅเธธเนเธกเธขเนเธญเธข ' + sheetName + '...');

  google.script.run

    .withSuccessHandler(res => {

      if (!isSilent) setLoading(false);

      if (res && res.success) {

        state.privateStudents = res.students;

        renderPrivateStudentsTable(res.sheetName);

        if (state.pendingPrivateStudentPayment) {

          const target = state.pendingPrivateStudentPayment;

          state.pendingPrivateStudentPayment = null;

          let idx = state.privateStudents.findIndex(s => s.name.trim() === target.name.trim() && s.courseName.trim() === target.courseName.trim());

          if (idx === -1) {

            idx = state.privateStudents.findIndex(s => s.name.trim() === target.name.trim());

          }

          if (idx !== -1) {

            showPrivatePaymentModal(idx);

          }

        }

      } else if (!isSilent) {

        showToast('เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เธ”เธถเธเธเนเธญเธกเธนเธฅเน€เธ”เนเธเน€เธฃเธตเธขเธเน€เธ”เธตเนเธขเธงเนเธ”เน: ' + (res ? res.error : 'unknown'), 'error');

      }

    })

    .withFailureHandler(err => {

      if (!isSilent) {

        setLoading(false);

        showToast('เน€เธเธทเนเธญเธกเธ•เนเธญเธเธฒเธเธเนเธญเธกเธนเธฅเธเธตเธ•เธฅเนเธกเน€เธซเธฅเธง: ' + err.message, 'error');

      }

    })

    .getPrivateSheetData(sheetName);

}



function renderPrivateStudentsTable(sheetName) {

  const tbody = document.getElementById('private_students_tbody');

  tbody.innerHTML = '';

  

  const branchFilter = document.getElementById('private_branch_select') ? document.getElementById('private_branch_select').value : 'all';

  

  const filteredStudents = state.privateStudents.filter(s => {

    if (branchFilter === 'all') return true;

    

    // Normalizing branch values (e.g. "เธชเธฒเธเธฒ2" vs "เธชเธฒเธเธฒ 2")

    const sBranch = (s.branchLearn || s.branchPay || '').replace(/\s+/g, '');

    const filterVal = branchFilter.replace(/\s+/g, '');

    

    return sBranch.indexOf(filterVal) !== -1 || filterVal.indexOf(sBranch) !== -1;

  });

  

  filteredStudents.forEach((s, idx) => {

    // Find the original index in state.privateStudents to pass to showPrivatePaymentModal correctly

    const originalIdx = state.privateStudents.indexOf(s);

    const tr = document.createElement('tr');

    

    // Balance: Positive outstanding means debt (เธเนเธฒเธ), negative outstanding means credit/overpaid

    let balanceText = '';

    if (s.outstanding > 0) {

      balanceText = `<span style="color:#ef4444; font-weight:600;">เธเนเธฒเธ เธฟ${Math.round(s.outstanding).toLocaleString()}</span>`;

    } else {

      balanceText = `<span style="color:#466352; font-weight:600;">เธฟ${Math.round(Math.abs(s.outstanding)).toLocaleString()}</span>`;

    }

    

    tr.innerHTML = `

      <td>

        <div style="font-weight:600; color: var(--color-primary-hover); cursor: pointer; white-space:nowrap;" onclick="showStudentHistoryModal('${s.name}', '${s.nickname}')">๐ง’ ${s.name}</div>

        <div style="font-size:0.68rem; color:var(--text-muted); white-space:nowrap;">${s.branchPay} | Line: ${s.lineName || '-'}</div>

      </td>

      <td>${s.nickname}</td>

      <td>

        <div style="font-weight:500; font-size:0.75rem; color: var(--color-primary-hover); cursor: pointer; white-space:nowrap;" onclick="showStudentHistoryModal('${s.name}', '${s.nickname}')">๐“ ${s.courseName}</div>

        <div style="font-size:0.68rem; color:var(--text-muted); white-space:nowrap;">${(s.note && !s.note.includes('1899') && !s.note.includes('1900') && !s.note.includes('เน€เธงเธฅเธฒเธญเธดเธเนเธ”เธเธตเธ')) ? s.note : '-'}</div>

      </td>

      <td style="text-align:right; white-space:nowrap;">เธฟ${s.carriedForward.toLocaleString()}</td>

      <td style="text-align:right; white-space:nowrap;">เธฟ${s.full.toLocaleString()}</td>

      <td style="text-align:right; color:#466352; font-weight:600; white-space:nowrap;">เธฟ${s.paid.toLocaleString()}</td>

      <td style="text-align:right; white-space:nowrap;">${balanceText}</td>

      <td style="white-space:nowrap;"><span style="font-weight:600; color:var(--color-primary-hover);">${formatHoursMinutes(s.hours)}</span></td>

      <td style="white-space:nowrap;"><span style="font-weight:600;">${formatHoursMinutes(s.hoursLeft)}</span></td>

      <td style="font-size:0.68rem; white-space:nowrap;">

        <div>${formatDateTimeToThaiLong(s.paymentDate) || '-'}</div>

        <div style="color:var(--text-muted);">${s.staff || '-'}</div>

      </td>

      <td style="white-space:nowrap;">

        <div style="display: flex; gap: 4px; justify-content: center;">

          <button class="btn btn-primary btn-icon" onclick="showPrivatePaymentModal(${originalIdx})" title="เธฅเธเธขเธญเธ”เน€เธเธดเธเธเธณเธฃเธฐ">๐ช</button>

          <button class="btn btn-secondary btn-icon" onclick="editPrivateStudent(${originalIdx})" title="เนเธเนเนเธเธเนเธญเธกเธนเธฅเธเธฑเธเน€เธฃเธตเธขเธ">โ๏ธ</button>

        </div>

      </td>

    `;

    tbody.appendChild(tr);

  });

  

  if (filteredStudents.length === 0) {

    tbody.innerHTML = `<tr><td colspan="11" style="text-align: center; color: var(--text-muted); padding: 40px;">เนเธกเนเธเธเธเธฃเธฐเธงเธฑเธ•เธดเน€เธ”เนเธเน€เธฃเธตเธขเธเน€เธ”เธตเนเธขเธงเนเธเธเธฅเธธเนเธกเธซเธฃเธทเธญเธชเธฒเธเธฒเธเธตเน</td></tr>`;

  }

}



function editPrivateStudent(idx) {

  const std = state.privateStudents[idx];

  if (!std) return;

  editStudentFromGradeSheet(std.studentId || std.name);

}



function showPrivatePaymentModal(idx) {

  const std = state.privateStudents[idx];

  if (!std) return;

  

  state.selectedPrivateStudent = std;

  

  document.getElementById('p_student_name').value = std.name;

  document.getElementById('p_course_name').value = std.courseName;

  document.getElementById('p_student_display_name').innerText = 'เธเธฑเธเน€เธฃเธตเธขเธ: ' + std.name + ' (' + std.nickname + ')';

  document.getElementById('p_course_display_name').innerText = 'เธเธญเธฃเนเธช: ' + std.courseName;

  

  document.getElementById('p_carried_forward').value = std.carriedForward;

  document.getElementById('p_hours').value = std.hours || '08:00';

  document.getElementById('p_paid').value = std.paid;

  document.getElementById('p_payment_date').value = convertDateTimeFromSheet(std.paymentDate);

  

  const regChannelSelect = document.getElementById('pay_r1_channel');

  const pChannel = document.getElementById('p_payment_channel');

  if (regChannelSelect && pChannel) {

    pChannel.innerHTML = regChannelSelect.innerHTML;

  }

  

  document.getElementById('p_payment_channel').value = std.paymentChannel;

  document.getElementById('p_staff').value = std.staff || '';

  

  document.getElementById('private_payment_modal').classList.add('active');

}



function closePrivatePaymentModal() {

  document.getElementById('private_payment_modal').classList.remove('active');

}



function savePrivateStudentPayment(e) {

  e.preventDefault();

  const selectVal = document.getElementById('private_sheet_select').value;

  const sheetName = (selectVal === 'all' && state.selectedPrivateStudent) ? state.selectedPrivateStudent.sheetName : selectVal;

  const name = document.getElementById('p_student_name').value;

  const courseName = document.getElementById('p_course_name').value;

  

  const paymentData = {

    carriedForward: parseFloat(document.getElementById('p_carried_forward').value) || 0,

    hours: document.getElementById('p_hours').value.trim(),

    paid: parseFloat(document.getElementById('p_paid').value) || 0,

    paymentDate: convertDateTimeToSheet(document.getElementById('p_payment_date').value),

    paymentChannel: document.getElementById('p_payment_channel').value,

    staff: document.getElementById('p_staff').value.trim()

  };

  

  // Calculate remaining learning hours left dynamically

  const rate = getPrivateStudentRate(sheetName, courseName);

  

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

        checkLowBalanceStudents(); // update warning banner

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



function autoCalculateHoursFromPaid() {

  const paidVal = parseFloat(document.getElementById('p_paid').value) || 0;

  const courseName = document.getElementById('p_course_name').value || '';

  

  let rate = 250;

  if (courseName.toLowerCase().includes('ex')) rate = 312.5;

  

  const hoursDecimal = paidVal / rate;

  const hrs = Math.floor(hoursDecimal);

  const mins = Math.round((hoursDecimal - hrs) * 60);

  

  // Format as hh:mm

  const hrsStr = String(hrs).padStart(2, '0');

  const minsStr = String(mins).padStart(2, '0');

  

  document.getElementById('p_hours').value = `${hrsStr}:${minsStr}`;

}





// ----------------------------------------------------

// 5. Daily Timetable Grid + Monthly View

// ----------------------------------------------------



// Monthly View State

let monthlyViewState = {

  mode: 'daily', // 'daily' or 'monthly'

  selectedYear: new Date().getFullYear(),

  selectedMonth: new Date().getMonth() + 1, // 1-based

  selectedDow: new Date().getDay(), // 0=Sun, 1=Mon ... 6=Sat

  monthlyData: null

};





const thaiDayNames = ['เธญเธฒเธ—เธดเธ•เธขเน', 'เธเธฑเธเธ—เธฃเน', 'เธญเธฑเธเธเธฒเธฃ', 'เธเธธเธ', 'เธเธคเธซเธฑเธชเธเธ”เธต', 'เธจเธธเธเธฃเน', 'เน€เธชเธฒเธฃเน'];

const thaiMonthNames = ['', 'เธกเธเธฃเธฒเธเธก', 'เธเธธเธกเธ เธฒเธเธฑเธเธเน', 'เธกเธตเธเธฒเธเธก', 'เน€เธกเธฉเธฒเธขเธ', 'เธเธคเธฉเธ เธฒเธเธก', 'เธกเธดเธ–เธธเธเธฒเธขเธ', 'เธเธฃเธเธเธฒเธเธก', 'เธชเธดเธเธซเธฒเธเธก', 'เธเธฑเธเธขเธฒเธขเธ', 'เธ•เธธเธฅเธฒเธเธก', 'เธเธคเธจเธเธดเธเธฒเธขเธ', 'เธเธฑเธเธงเธฒเธเธก'];



function switchDailyGridView(mode) {

  monthlyViewState.mode = mode;

  

  const btnDaily = document.getElementById('btn_view_daily');

  const btnMonthly = document.getElementById('btn_view_monthly');

  const dailyControls = document.getElementById('daily_view_controls');

  const monthlyControls = document.getElementById('monthly_view_controls');

  const dowTabs = document.getElementById('day_of_week_tabs');

  const dailyContainer = document.getElementById('daily_view_container');

  const monthlyContainer = document.getElementById('monthly_view_container');

  

  if (mode === 'daily') {

    btnDaily.className = 'btn btn-primary';

    btnDaily.style.cssText = 'font-size: 0.82rem; padding: 6px 14px;';

    btnMonthly.className = 'btn';

    btnMonthly.style.cssText = 'font-size: 0.82rem; padding: 6px 14px; background: rgba(0,132,255,0.08); color: var(--color-primary); border: 1px solid rgba(0,132,255,0.2);';

    

    dailyControls.style.display = 'flex';

    monthlyControls.style.display = 'none';

    dowTabs.style.display = 'block';

    dailyContainer.style.display = 'block';

    monthlyContainer.style.display = 'none';

    

    loadDailyGrid();

  } else {

    btnMonthly.className = 'btn btn-primary';

    btnMonthly.style.cssText = 'font-size: 0.82rem; padding: 6px 14px;';

    btnDaily.className = 'btn';

    btnDaily.style.cssText = 'font-size: 0.82rem; padding: 6px 14px; background: rgba(0,132,255,0.08); color: var(--color-primary); border: 1px solid rgba(0,132,255,0.2);';

    

    dailyControls.style.display = 'none';

    monthlyControls.style.display = 'flex';

    dowTabs.style.display = 'block';

    dailyContainer.style.display = 'none';

    monthlyContainer.style.display = 'block';

    

    updateMonthDisplay();

    updateDowTabsActive();

    loadMonthlyGrid();

  }

}



function updateMonthDisplay() {

  const thaiYear = monthlyViewState.selectedYear + 543;

  document.getElementById('monthly_grid_month_display').innerText = 

    thaiMonthNames[monthlyViewState.selectedMonth] + ' ' + thaiYear;

}



function updateDowTabsActive() {

  document.querySelectorAll('#day_of_week_tabs .branch-tab').forEach(btn => {

    const dow = parseInt(btn.getAttribute('data-dow'));

    if (dow === monthlyViewState.selectedDow) {

      btn.classList.add('active');

    } else {

      btn.classList.remove('active');

    }

  });

}



function selectDayOfWeek(dow) {

  monthlyViewState.selectedDow = dow;

  updateDowTabsActive();

  if (monthlyViewState.mode === 'daily') {

    // In daily view: change the date to the corresponding day of the same week

    const dateInput = document.getElementById('daily_grid_filter_date');

    if (dateInput && dateInput.value) {

      const currentDate = new Date(dateInput.value);

      const currentDow = currentDate.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat

      const diff = dow - currentDow;

      const targetDate = new Date(currentDate);

      targetDate.setDate(currentDate.getDate() + diff);

      const y = targetDate.getFullYear();

      const m = String(targetDate.getMonth() + 1).padStart(2, '0');

      const d = String(targetDate.getDate()).padStart(2, '0');

      dateInput.value = `${y}-${m}-${d}`;

      loadDailyGrid();

    }

  } else {

    loadMonthlyGrid();

  }

}



function changeMonth(delta) {

  monthlyViewState.selectedMonth += delta;

  if (monthlyViewState.selectedMonth > 12) {

    monthlyViewState.selectedMonth = 1;

    monthlyViewState.selectedYear++;

  } else if (monthlyViewState.selectedMonth < 1) {

    monthlyViewState.selectedMonth = 12;

    monthlyViewState.selectedYear--;

  }

  updateMonthDisplay();

  loadMonthlyGrid();

}



function loadMonthlyGrid(isSilent = false) {

  if (!isSilent) {

    setLoading(true, 'เธเธณเธฅเธฑเธเธ”เธถเธเธ•เธฒเธฃเธฒเธเน€เธฃเธตเธขเธเธฃเธฒเธขเน€เธ”เธทเธญเธ เธงเธฑเธ' + thaiDayNames[monthlyViewState.selectedDow] + '...');

  }

  

  google.script.run

    .withSuccessHandler(data => {

      if (!isSilent) setLoading(false);

      if (data && data.success) {

        monthlyViewState.monthlyData = data;

        state.enrollments = data.enrollments || {};

        state.classLogs = [];

        if (data.weeks) {

          data.weeks.forEach(w => {

            if (w.classes) {

              state.classLogs.push(...w.classes);

            }

          });

        }

        renderMonthlyGrid(data);

      } else {

        showToast('เธ”เธถเธเธเนเธญเธกเธนเธฅเธฃเธฒเธขเน€เธ”เธทเธญเธเธฅเนเธกเน€เธซเธฅเธง: ' + (data ? data.error : 'unknown'), 'error');

      }

    })

    .withFailureHandler(err => {

      if (!isSilent) setLoading(false);

      showToast('เน€เธเธทเนเธญเธกเธ•เนเธญเธฅเนเธกเน€เธซเธฅเธง: ' + err.message, 'error');

    })

    .getMonthlyGridData(monthlyViewState.selectedYear, monthlyViewState.selectedMonth, monthlyViewState.selectedDow, getLogUser());

}



function renderMonthlyGrid(data) {

  const container = document.getElementById('monthly_grid_content');

  const branchFilter = (state.activeBranchFilter || 'เธชเธฒเธเธฒ1').replace(/\s+/g, '');

  const filteredRooms = (data.rooms || []).filter(room => {

    const roomBranchClean = (room.branch || '').replace(/\s+/g, '');

    return roomBranchClean === branchFilter;

  });

  

  const thaiYear = monthlyViewState.selectedYear + 543;

  const dowName = thaiDayNames[monthlyViewState.selectedDow];

  const thaiMonthShort = thaiMonthNames[monthlyViewState.selectedMonth].substring(0, 3) + '.';

  

  // Prepare week date labels: e.g., "เธเธฑเธเธ—เธฃเนเธ—เธตเน 1 เธกเธด.เธข."

  const weekLabels = data.weeks.map(w => {

    const parts = w.dateStr.split('/'); // DD/MM/YYYY

    const dayNum = parseInt(parts[0]);

    const label = `${dowName}เธ—เธตเน ${dayNum} ${thaiMonthShort}`;

    return { ...w, label, dayNum };

  });

  

  let html = `

    <div style="background: linear-gradient(135deg, rgba(0,132,255,0.06) 0%, rgba(16,185,129,0.06) 100%); border-radius: 12px; padding: 12px 16px; border: 1px dashed rgba(0,132,255,0.25); margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between; min-width: 0; overflow: hidden;">

      <h3 style="margin: 0; font-size: 1rem; color: var(--color-primary-hover); font-weight: 700;">

        ๐“ เธ•เธฒเธฃเธฒเธเน€เธฃเธตเธขเธเธงเธฑเธ${dowName} เธฃเธฒเธขเน€เธ”เธทเธญเธ โ€” ${thaiMonthNames[monthlyViewState.selectedMonth]} ${thaiYear} (${branchFilter})

      </h3>

      <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 500;">เธเธเธ—เธฑเนเธเธซเธกเธ” ${weekLabels.length} เธชเธฑเธเธ”เธฒเธซเน</div>

    </div>

  `;

  

  if (weekLabels.length === 0) {

    html += '<div style="text-align: center; color: var(--text-muted); padding: 40px;">เนเธกเนเธกเธตเธงเธฑเธ' + dowName + 'เนเธเน€เธ”เธทเธญเธเธเธตเน</div>';

    container.innerHTML = html;

    return;

  }

  

  // === MONTHLY ATTENDANCE SUMMARY TABLE ===

  const timeSlots = [

    { label: '08.00', start: '08:00' },

    { label: '09.00', start: '09:00' },

    { label: '10.00', start: '10:00' },

    { label: '11.00', start: '11:00' },

    { label: '12.00', start: '12:00' },

    { label: '13.00', start: '13:00' },

    { label: '14.00', start: '14:00' },

    { label: '15.00', start: '15:00' },

    { label: '16.00', start: '16:00' },

    { label: '17.00', start: '17:00' },

    { label: '18.00', start: '18:00' },

    { label: '19.00', start: '19:00' },

    { label: '20.00', start: '20:00' }

  ];

  

  html += `

    <div style="margin-bottom: 16px; background: #fff; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); border: 1px solid var(--border-color); padding: 12px;">

      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">

        <h4 style="margin: 0; font-size: 0.9rem; color: var(--color-primary-hover); font-weight: 700;">๐ซ เธชเธฃเธธเธเธเธณเธเธงเธเธเธฑเธเน€เธฃเธตเธขเธเนเธขเธเธฃเธฒเธขเธชเธฑเธเธ”เธฒเธซเน (เธงเธฑเธ${dowName}) - ${branchFilter}</h4>

        <div style="font-size: 0.6rem; color: var(--text-muted); display: flex; gap: 6px;">

          <span>๐ขเธชเธ”</span><span>๐”ตเธญเธญเธ</span><span>๐กเธฅเธฒ</span><span>๐”ดเธเธฒเธ”</span><span>๐ฃเธเธ”</span><span>โญเธฃเธงเธก</span>

        </div>

      </div>

      <div style="overflow-x: auto; border-radius: 8px; border: 1px solid var(--border-color);">

        <table style="width: 100%; table-layout: fixed; border-collapse: collapse; font-size: 0.65rem; text-align: center; background: #fff;">

          <thead>

            <tr style="background: rgba(0,132,255,0.05); border-bottom: 1px solid var(--border-color);">

              <th style="padding: 6px 8px; text-align: left; font-weight: 700; border-right: 1px solid var(--border-color); color: var(--color-primary-hover); white-space: nowrap; width: 110px;">เธเนเธงเธเน€เธงเธฅเธฒ</th>

  `;

  

  weekLabels.forEach(w => {

    html += `<th style="padding: 6px 4px; font-weight: 700; border-right: 1px solid var(--border-color); white-space: nowrap; color: var(--text-main);">${w.label}</th>`;

  });

  

  html += `</tr></thead><tbody>`;

  

  // Compute stats per week per time slot

  timeSlots.forEach(slot => {

    html += `<tr style="border-bottom: 1px solid var(--border-color); transition: background 0.15s;" onmouseover="this.style.background='rgba(0,132,255,0.02)'" onmouseout="this.style.background='none'">

      <td style="padding: 6px 8px; text-align: left; font-weight: 700; border-right: 1px solid var(--border-color); white-space: nowrap; color: var(--text-main);">${slot.label}</td>`;

    

    weekLabels.forEach(w => {

      const weekClasses = (w.classes || []).filter(c => {

        const rb = (c.roomBranch || '').replace(/\s+/g, '');

        return rb.includes(branchFilter);

      });

      

      let live = 0, online = 0, leave = 0, absent = 0, makeup = 0, enrolled = 0;

      weekClasses.forEach(c => {

        const startClean = cleanTimeStr(c.timeStart);

        const mappedStart = startClean ? startClean.substring(0, 2) + ':00' : '';

        if (mappedStart === slot.start) {

          live += parseInt(c.isPresentLive) || 0;

          online += parseInt(c.isPresentOnline) || 0;

          leave += parseInt(c.isLeave) || 0;

          absent += parseInt(c.isAbsent) || 0;

          makeup += parseInt(c.isMakeup) || 0;

          

          const courseName = c.subject;

          const enrollData = (state.enrollments && state.enrollments[courseName]);

          const enrolledCount = Array.isArray(enrollData) ? enrollData.length : (parseInt(enrollData) || 0);

          enrolled += enrolledCount;

        }

      });

      

      const total = live + online + leave;

      if (total > 0 || absent > 0 || makeup > 0 || enrolled > 0) {

        html += `<td style="padding: 4px 3px; border-right: 1px solid var(--border-color); vertical-align: middle;" title="${w.label} ${slot.label}\nเธเธฃ.: ${enrolled}\nเธชเธ”: ${live} | เธญเธญเธ: ${online} | เธฅเธฒ: ${leave} | เธเธฒเธ”: ${absent} | เธเธ”: ${makeup} | เธฃเธงเธก: ${total}">

          <div style="display: flex; flex-wrap: wrap; gap: 2px; justify-content: center; align-items: center;">

            <span style="background:#e0f7fa; color:#00838f; padding:1px 4px; border-radius:3px; font-weight:800; font-size:0.6rem;">เธเธฃ.${enrolled}</span>

            ${live > 0 ? `<span style="background:#e8f5e9; color:#2e7d32; padding:1px 4px; border-radius:3px; font-weight:700; font-size:0.6rem;">เธชเธ” ${live}</span>` : ''}

            ${online > 0 ? `<span style="background:#e3f2fd; color:#1565c0; padding:1px 4px; border-radius:3px; font-weight:700; font-size:0.6rem;">เธญเธญเธ ${online}</span>` : ''}

            ${leave > 0 ? `<span style="background:#fff3e0; color:#ef6c00; padding:1px 4px; border-radius:3px; font-weight:700; font-size:0.6rem;">เธฅเธฒ ${leave}</span>` : ''}

            ${absent > 0 ? `<span style="background:#ffebee; color:#c62828; padding:1px 4px; border-radius:3px; font-weight:700; font-size:0.6rem;">เธเธฒเธ” ${absent}</span>` : ''}

            ${makeup > 0 ? `<span style="background:#f3e5f5; color:#6a1b9a; padding:1px 4px; border-radius:3px; font-weight:700; font-size:0.6rem;">เธเธ” ${makeup}</span>` : ''}

            <span style="font-weight:800; color:#0f172a; font-size:0.62rem; border-left:1px solid #e2e8f0; padding-left:3px; margin-left:1px;">โญ${total}</span>

          </div>

        </td>`;

      } else {

        html += `<td style="padding: 4px; color: #e2e8f0; border-right: 1px solid var(--border-color); font-size: 0.6rem;">-</td>`;

      }

    });

    

    html += `</tr>`;

  });

  

  // Add bottom row: total enrolled per week (sum across all courses for this branch/filter)

  html += `

    <tr style="border-top: 2px solid var(--border-color); background: rgba(0,131,143,0.04); font-weight: 700;">

      <td style="padding: 8px; text-align: left; font-weight: 800; border-right: 1px solid var(--border-color); color: #00838f; white-space: nowrap; font-size: 0.75rem;">เธฃเธงเธก เธเธฃ. เธ—เธตเนเธฅเธเธ—เธฐเน€เธเธตเธขเธ</td>

  `;

  

  weekLabels.forEach(w => {

    const weekClasses = (w.classes || []).filter(c => {

      const rb = (c.roomBranch || '').replace(/\s+/g, '');

      return rb.includes(branchFilter);

    });

    // Sum enrolled for each unique course this week

    const seenCourses = new Set();

    let totalEnrolledWeek = 0;

    weekClasses.forEach(c => {

      if (c.subject && !seenCourses.has(c.subject)) {

        seenCourses.add(c.subject);

        const enrollData = (state.enrollments && state.enrollments[c.subject]);

        const enrolledCount = Array.isArray(enrollData) ? enrollData.length : (parseInt(enrollData) || 0);

        totalEnrolledWeek += enrolledCount;

      }

    });

    html += `<td style="padding: 8px 4px; border-right: 1px solid var(--border-color); font-weight: 800; font-size: 0.72rem; color: #00838f;">๐“ ${totalEnrolledWeek} เธเธฃ.</td>`;

  });

  

  html += `

    </tr>

    </tbody>

    </table>

    </div>

    </div>`;

  

  // === ROOM-BASED WEEKLY VIEW ===

  filteredRooms.forEach(room => {

    // Collect classes for this room across all weeks

    const roomWeekData = weekLabels.map(w => {

      const classes = (w.classes || []).filter(c => matchRoomAndBranch(c.roomBranch, room.roomName, room.branch));

      classes.sort((a, b) => (a.timeStart || '').localeCompare(b.timeStart || ''));

      return { ...w, roomClasses: classes };

    });

    

    const totalClasses = roomWeekData.reduce((sum, w) => sum + w.roomClasses.length, 0);

    

    html += `

      <div style="margin-bottom: 16px; background: #fff; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); border: 1px solid var(--border-color); overflow: hidden;">

        <div style="background: linear-gradient(to right, rgba(0,132,255,0.06), rgba(0,132,255,0.01)); padding: 10px 16px; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between;">

          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">

            <span onclick="showEditRoomModal('${room.branch}', '${room.roomName}', '${room.ipad || ''}', '${room.zoom || ''}')" style="font-weight: 700; font-size: 1rem; color: var(--color-primary-hover); cursor: pointer; display: flex; align-items: center; gap: 4px;" title="เนเธเนเนเธเธเธฒเธฃเธ•เธฑเนเธเธเนเธฒเธซเนเธญเธเน€เธฃเธตเธขเธ">

              ๐ซ ${room.roomName} โ๏ธ

            </span>

            ${room.ipad ? `<span style="background: rgba(3, 105, 161, 0.08); color: #0369a1; padding: 1px 6px; border-radius: 4px; font-size: 0.72rem; font-weight: 600; cursor: pointer;" onclick="showEditRoomModal('${room.branch}', '${room.roomName}', '${room.ipad || ''}', '${room.zoom || ''}')">๐“ฑ iPad: ${room.ipad}</span>` : ''}

            ${room.zoom ? `<span style="background: rgba(0, 96, 100, 0.08); color: #006064; padding: 1px 6px; border-radius: 4px; font-size: 0.72rem; font-weight: 600; cursor: pointer;" onclick="showEditRoomModal('${room.branch}', '${room.roomName}', '${room.ipad || ''}', '${room.zoom || ''}')">๐ฅ Zoom: ${room.zoom}</span>` : ''}

          </div>

          <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 500;">เธเธฅเธฒเธชเธ—เธฑเนเธเธซเธกเธ”เนเธเน€เธ”เธทเธญเธเธเธตเน: ${totalClasses} เธเธฅเธฒเธช</div>

        </div>

        <div style="padding: 12px 14px; display: flex; flex-direction: column; gap: 12px;">

    `;

    

    roomWeekData.forEach(w => {

      const parts = w.dateStr.split('/');

      const fullThaiDateLabel = `${dowName}เธ—เธตเน ${parseInt(parts[0])} ${thaiMonthNames[parseInt(parts[1])]} ${parseInt(parts[2]) + 543}`;

      

      html += `

        <div style="border: 1px solid rgba(0,132,255,0.08); border-radius: 8px; padding: 10px; background: #fafcff;">

          <div style="font-weight: 700; font-size: 0.8rem; color: var(--text-main); margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px dashed rgba(0,132,255,0.15); padding-bottom: 6px;">

            <span style="color: var(--color-primary-hover);">๐“… ${fullThaiDateLabel}</span>

            <div style="display: flex; align-items: center; gap: 8px;">

              <button onclick="quickAddClassLogMonthly('${room.roomName} (${room.branch})', '${w.dateStr}')" style="border: none; background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 2px 8px; border-radius: 4px; font-size: 0.68rem; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 2px; transition: all 0.2s;" onmouseover="this.style.background='#10b981'; this.style.color='#fff';" onmouseout="this.style.background='rgba(16, 185, 129, 0.1)'; this.style.color='#10b981';">

                โ• เน€เธเธดเนเธกเธเธฅเธฒเธช

              </button>

              <span class="badge ${w.roomClasses.length > 0 ? 'badge-primary' : 'badge-secondary'}" style="font-size: 0.68rem; padding: 2px 8px;">

                ${w.roomClasses.length > 0 ? w.roomClasses.length + ' เธเธฅเธฒเธช' : 'เธซเนเธญเธเธงเนเธฒเธ'}

              </span>

            </div>

          </div>

      `;

      

      if (w.roomClasses.length === 0) {

        html += '<div style="text-align: center; color: #cbd5e1; padding: 10px; font-style: italic; font-size: 0.75rem;">เนเธกเนเธกเธตเธฃเธฒเธขเธเธฒเธฃเธชเธญเธเนเธเธงเธฑเธเธเธตเน</div>';

      } else {

        html += '<div style="display: flex; flex-wrap: wrap; gap: 8px;">';

        

        w.roomClasses.forEach(c => {

          const isTeacherConfirmed = c.teacherConfirmed > 0;

          const isStudentLeaveChecked = (state.classAbsences && state.classAbsences[c.rowIndex]?.studentLeave) || (c.isLeave > 0);

        const isTeacherLeaveChecked = (state.classAbsences && state.classAbsences[c.rowIndex]?.teacherLeave) || (c.note && String(c.note).includes('เธเธฃเธนเธฅเธฒ'));

          

          if (isStudentLeaveChecked) {

            c.isPresentLive = 0;

            c.isPresentOnline = 0;

            c.isMakeup = 0;

            if ((c.isLeave || 0) === 0) c.isLeave = 1;

          }

          

          const attendances = [];

          attendances.push(`เธชเธ”: ${c.isPresentLive || 0}`);

          attendances.push(`เธญเธญเธ: ${c.isPresentOnline || 0}`);

          attendances.push(`เธฅเธฒ: ${c.isLeave || 0}`);

          attendances.push(`เธเธ”: ${c.isMakeup || 0}`);

          attendances.push(`เธเธฒเธ”: ${c.isAbsent || 0}`);

          // isOrange display removed

          

          const attendanceSummary = attendances.length > 0 

            ? `<span class="scheduled-students" style="font-size:0.75rem; color:var(--color-primary-hover); font-weight:500; display:block; margin-top:2px;">๐‘ฅ ${attendances.join('  ')}</span>`

            : '';

          

          const ipadMatch = (c.roomBranch || '').match(/IPAD\s*\S*/i);

          const ipadText = ipadMatch ? `๐“ฑ ${ipadMatch[0].toUpperCase()}` : '';

          

          let cardBgStyle = '';

          let cardBorderStyle = '';

          if (isTeacherConfirmed) {

            cardBgStyle = 'background-color: rgba(25, 135, 84, 0.12) !important;';

            cardBorderStyle = 'border: 1.5px solid rgba(25, 135, 84, 0.4) !important;';

          } else if (isStudentLeaveChecked) {

            cardBgStyle = 'background-color: rgb(254, 226, 226) !important;';

            cardBorderStyle = 'border-color: rgba(239, 68, 68, 0.35) !important;';

          } else if (isTeacherLeaveChecked) {

            cardBgStyle = 'background-color: rgb(255, 237, 213) !important;';

            cardBorderStyle = 'border-color: rgba(249, 115, 22, 0.45) !important;';

          } else {

            cardBgStyle = 'background-color: rgba(138, 200, 255, 0.1) !important;';

            cardBorderStyle = 'border-color: rgba(138, 200, 255, 0.3) !important;';

          }

          

          html += `

            <div class="scheduled-item" onclick="showEditClassLogModal(${c.rowIndex})" style="position: relative; padding: 8px 30px 8px 12px; min-width:180px; flex: 1 1 200px; max-width: 280px; font-size:0.78rem; cursor:pointer; transition:all 0.2s; border-radius: 8px; border: 1px solid; ${cardBgStyle} ${cardBorderStyle}" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='var(--shadow-sm)'" onmouseout="this.style.transform='none'; this.style.boxShadow='none'">

              <div style="font-weight:700; color:var(--color-primary-hover); font-size:0.75rem; display: flex; justify-content: space-between; align-items: center; gap: 4px;">

                <span>โฐ ${cleanTimeStr(c.timeStart)}-${cleanTimeStr(c.timeEnd)}</span>

                <div style="display: flex; gap: 2px;">

                  ${isTeacherConfirmed ? `<span style="background:#15803d; color:#fff; font-size:0.6rem; padding:1px 4px; border-radius:3px; font-weight:bold;">เธขเธทเธเธขเธฑเธ</span>` : ''}

                  ${isTeacherLeaveChecked ? `<span style="background:var(--color-danger); color:#fff; font-size:0.6rem; padding:1px 4px; border-radius:3px; font-weight:bold;">เธเธฃเธนเธฅเธฒ</span>` : ''}

                </div>

              </div>

              ${ipadText ? `<div class="scheduled-ipad" style="font-size: 0.72rem; font-weight: 600; color: #4b6355; margin-top: 2px;">${ipadText}</div>` : ''}

              <div style="font-weight:700; color:var(--text-main); margin:3px 0 1px 0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${c.subject.replace(/\s*\([^)]*เธชเธฑเธเธ”เธฒเธซเน[^)]*\)/g, '')}</div>

              <div style="font-size:0.7rem; color:var(--text-muted); display:flex; justify-content:space-between; flex-direction: column; gap: 1px;">

                <span>เธเธฃเธนเธเธฃเธฐเธเธณ: ${c.teacherRegular}${c.teacherSub ? ' (เนเธ—เธ:' + c.teacherSub + ')' : ''}</span>

                ${isTeacherConfirmed ? `<span style="color:#15803d; font-weight:bold;">โ… เธเธฃเธนเธขเธทเธเธขเธฑเธเนเธฅเนเธง</span>` : ''}

              </div>

              ${attendanceSummary}

              

              <!-- Absences Checkboxes in monthly room view -->

              <div style="display: flex; gap: 12px; align-items: center; margin-top: 4px; border-top: 1px dashed rgba(0,0,0,0.08); padding-top: 4px;" onclick="event.stopPropagation();">

                <label style="display: flex; align-items: center; gap: 4px; font-size: 0.72rem; cursor: pointer; font-weight: 600; color: var(--color-danger);">

                  <input type="checkbox" class="student-leave-chk" data-row="${c.rowIndex}" ${isStudentLeaveChecked ? 'checked' : ''} onchange="toggleClassAbsence(${c.rowIndex}, 'studentLeave', this)"> ๐’ เธเนเธญเธเธฅเธฒ

                </label>

                <label style="display: flex; align-items: center; gap: 4px; font-size: 0.72rem; cursor: pointer; font-weight: 600; color: var(--color-danger);">

                  <input type="checkbox" class="teacher-leave-chk" data-row="${c.rowIndex}" ${isTeacherLeaveChecked ? 'checked' : ''} onchange="toggleClassAbsence(${c.rowIndex}, 'teacherLeave', this)"> ๐‘จโ€๐ซ เธเธฃเธนเธฅเธฒ

                </label>

              </div>

              

              <button type="button" class="btn-delete-class" onclick="event.stopPropagation(); deleteClassLog(${c.rowIndex})" style="position: absolute; top: 8px; right: 8px; border: none; background: rgba(239, 68, 68, 0.1); color: #ef4444; cursor: pointer; font-size: 0.8rem; padding: 2px 6px; border-radius: 4px; display: flex; align-items: center; justify-content: center; transition: all 0.2s;" onmouseover="this.style.background='#ef4444'; this.style.color='#ffffff';" onmouseout="this.style.background='rgba(239, 68, 68, 0.1)'; this.style.color='#ef4444';" title="เธฅเธเธเธฅเธฒเธชเน€เธฃเธตเธขเธ">๐—‘๏ธ</button>

            </div>

          `;

        });

        

        html += '</div>';

      }

      

      html += '</div>';

    });

    

    html += `

        </div>

      </div>

    `;

  });

  

  if (filteredRooms.length === 0) {

    html += '<div style="text-align: center; color: var(--text-muted); padding: 30px;">เนเธกเนเธกเธตเธซเนเธญเธเน€เธฃเธตเธขเธเนเธเธชเธฒเธเธฒเธเธตเน</div>';

  }

  

  container.innerHTML = html;

}



function loadDailyGrid(isSilent = false) {

  const dateInput = document.getElementById('daily_grid_filter_date').value;

  const sheetDate = convertDateToSheet(dateInput);

  

  if (document.getElementById('daily_grid_date_display')) {

    document.getElementById('daily_grid_date_display').innerText = formatDateToThaiShort(dateInput);

  }

  // Update day-of-week tabs to match the selected date

  if (dateInput) {

    const selectedDate = new Date(dateInput);

    if (!isNaN(selectedDate.getTime())) {

      monthlyViewState.selectedDow = selectedDate.getDay();

      updateDowTabsActive();

    }

  }

  

  if (!isSilent) {
    setLoading(true, 'เธเธณเธฅเธฑเธเธ”เธถเธเธ•เธฒเธฃเธฒเธเธชเธญเธเธฃเธฒเธขเธซเนเธญเธเน€เธฃเธตเธขเธเธเธฃเธฐเธเธณเธงเธฑเธเธ—เธตเน ' + formatDateToThai(sheetDate) + '...');
  }
  
  if (state.dailyGridCache[sheetDate] && !isSilent && window._forceDailyGridRefresh !== true) {
    // Use cached data
    const data = state.dailyGridCache[sheetDate];
    setTimeout(() => {
      setLoading(false);
      state.rooms = data.rooms;
      state.classLogs = data.classes;
      state.enrollments = data.enrollments || {};
      renderDailyGrid();
      populateRoomsDatalist();
    }, 10);
    return;
  }
  window._forceDailyGridRefresh = false;

  google.script.run
    .withSuccessHandler(data => {
      if (data && !data.error) {
        state.dailyGridCache[sheetDate] = data; // Save to cache
      }

      if (!isSilent) setLoading(false);

      if (data && !data.error) {

        state.rooms = data.rooms;

        state.classLogs = data.classes;

        state.enrollments = data.enrollments || {};

        // DEBUG: log summary
        console.log('[DailyGrid] rooms:', (data.rooms||[]).length, 'classLogs:', (data.classes||[]).length, 'date:', sheetDate);
        if (data.classes && data.classes.length > 0) {
          console.log('[DailyGrid] sample log[0]:', JSON.stringify(data.classes[0]));
          const roomBranches = [...new Set((data.classes||[]).map(c=>c.roomBranch))];
          console.log('[DailyGrid] unique roomBranches:', roomBranches);
        }
        if (data.rooms && data.rooms.length > 0) {
          console.log('[DailyGrid] sample room[0]:', JSON.stringify(data.rooms[0]));
        }
        window._lastDailyGridDebug = data.debug || null;

        renderDailyGrid();

        populateRoomsDatalist();

      } else if (!isSilent) {

        showToast('เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เธ”เธถเธเธ•เธฒเธฃเธฒเธเธซเนเธญเธเน€เธฃเธตเธขเธเนเธ”เน: ' + (data ? data.error : 'unknown'), 'error');

      }

    })

    .withFailureHandler(err => {

      if (!isSilent) setLoading(false);

      if (!isSilent) showToast('เน€เธเธทเนเธญเธกเธ•เนเธญเธฅเนเธกเน€เธซเธฅเธง: ' + err.message, 'error');

    })

    .getDailyGridData(sheetDate, getLogUser());

}



function renderDailyAttendanceSummary() {

  const container = document.getElementById('daily_attendance_summary_container');

  let dashboardContainer = document.getElementById('dashboard_daily_attendance_summary_container');

  if (!dashboardContainer) {

    const dashGrid = document.querySelector('#dashboard_panel .grid-cols-3');

    if (dashGrid) {

      dashboardContainer = document.createElement('div');

      dashboardContainer.id = 'dashboard_daily_attendance_summary_container';

      dashboardContainer.style.cssText = 'grid-column: 1 / -1; margin-bottom: 20px; background: #fff; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); border: 1px solid var(--border-color); overflow-x: auto; padding: 15px;';

      dashGrid.insertBefore(dashboardContainer, dashGrid.firstChild);

    }

  }

  if (!container && !dashboardContainer) return;

  

  const branchFilter = (state.activeBranchFilter || 'เธชเธฒเธเธฒ1').replace(/\s+/g, '');

  const filteredLogs = (state.classLogs || []).filter(log => {

    const logBranchClean = (log.roomBranch || '').replace(/\s+/g, '');

    return logBranchClean.includes(branchFilter);

  });

  

  if (filteredLogs.length === 0) {

    const emptyHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 0.9rem; padding: 20px;">เนเธกเนเธกเธตเธเนเธญเธกเธนเธฅเธเธฅเธฒเธชเน€เธฃเธตเธขเธเนเธเธชเธฒเธเธฒเธเธตเนเธชเธณเธซเธฃเธฑเธเธงเธฑเธเธเธตเน</div>`;

    if (container) container.innerHTML = emptyHTML;

    if (dashboardContainer) dashboardContainer.innerHTML = emptyHTML;

    return;

  }

  

  const timeSlots = [

    { label: '08.00', start: '08:00' },

    { label: '09.00', start: '09:00' },

    { label: '10.00', start: '10:00' },

    { label: '11.00', start: '11:00' },

    { label: '12.00', start: '12:00' },

    { label: '13.00', start: '13:00' },

    { label: '14.00', start: '14:00' },

    { label: '15.00', start: '15:00' },

    { label: '16.00', start: '16:00' },

    { label: '17.00', start: '17:00' },

    { label: '18.00', start: '18:00' },

    { label: '19.00', start: '19:00' },

    { label: '20.00', start: '20:00' }

  ];

  

  const categories = ['main', 'private'];

  const stats = { 'main': {}, 'private': {} };

  

  categories.forEach(cat => {

    timeSlots.forEach(slot => {

      stats[cat][slot.label] = { live: 0, online: 0, leave: 0, absent: 0, makeup: 0, enrolled: 0, studentNames: [] };

    });

  });

  

  const isMainGroup = (subject) => {

    if (!subject) return false;

    const cleanVal = subject.toString().trim();

    return cleanVal.includes('เธซเธฅเธฑเธ') || cleanVal.includes('ัก') || ['เธญเธเธธเธเธฒเธฅ','เธ.1','เธ.2','เธ.3','เธ.4','เธ.5','เธ.6','เธก.1','เธก.2','เธก.3','เธก.4','เธก.5','เธก.6'].some(g => cleanVal.includes(g));

  };

  

  filteredLogs.forEach(log => {

    const startClean = cleanTimeStr(log.timeStart);

    const mappedStart = startClean ? startClean.substring(0, 2) + ':00' : '';

    const subject = log.subject || '';

    const cat = isMainGroup(subject) ? 'main' : 'private';

    

    timeSlots.forEach(slot => {

      if (mappedStart === slot.start) {

        stats[cat][slot.label].live += parseInt(log.isPresentLive) || 0;

        stats[cat][slot.label].online += parseInt(log.isPresentOnline) || 0;

        stats[cat][slot.label].leave += parseInt(log.isLeave) || 0;

        stats[cat][slot.label].absent += parseInt(log.isAbsent) || 0;

        stats[cat][slot.label].makeup += parseInt(log.isMakeup) || 0;

        

        const courseName = subject;

        const enrolledStudents = (state.enrollments && state.enrollments[courseName]) || [];

        if (Array.isArray(enrolledStudents)) {

          stats[cat][slot.label].enrolled += enrolledStudents.length;

          enrolledStudents.forEach(name => {

            if (stats[cat][slot.label].studentNames.indexOf(name) === -1) {

              stats[cat][slot.label].studentNames.push(name);

            }

          });

        }

      }

    });

  });

  

  let html = `

    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">

      <h3 style="margin: 0; font-size: 0.95rem; color: var(--color-primary-hover); font-weight: 700; display: flex; align-items: center; gap: 8px;">

        ๐ซ เธชเธฃเธธเธเธเธณเธเธงเธเธเธฑเธเน€เธฃเธตเธขเธเนเธขเธเธเนเธงเธเน€เธงเธฅเธฒ

      </h3>

      <div style="font-size: 0.65rem; color: var(--text-muted); display: flex; gap: 8px; flex-wrap: wrap;">

        <span><span>๐ฆเธเธฃ.</span><span>๐ขเธชเธ”</span><span>๐”ตเธญเธญเธ</span><span>๐กเธฅเธฒ</span><span>๐”ดเธเธฒเธ”</span><span>๐ฃเธเธ”</span><span>โญเธฃเธงเธก</span></span>

      </div>

    </div>

    

    <div style="overflow-x: auto; border-radius: 8px; border: 1px solid var(--border-color);">

      <table style="width: 100%; border-collapse: collapse; font-size: 0.68rem; text-align: center; background: #fff;">

        <thead>

          <tr style="background: rgba(0,132,255,0.05); border-bottom: 1px solid var(--border-color);">

            <th style="padding: 6px 10px; text-align: left; font-weight: 700; border-right: 1px solid var(--border-color); color: var(--color-primary-hover); white-space: nowrap; font-size: 0.68rem;">เธฃเธนเธเนเธเธเธเธฅเธธเนเธกเน€เธฃเธตเธขเธ</th>

  `;

  

  timeSlots.forEach(slot => {

    html += `<th style="padding: 6px 4px; font-weight: 600; min-width: 70px; border-right: 1px solid var(--border-color); color: var(--text-main); white-space: nowrap; font-size: 0.65rem;">${slot.label}</th>`;

  });

  

  html += `

          </tr>

        </thead>

        <tbody>

  `;

  

  let totalMainLiveOnline = 0;

  let totalPrivateLiveOnline = 0;

  let allMainUniqueNames = [];

  

  // Pre-calculate unique student names (main + private, including subgroup)

  filteredLogs.forEach(log => {

    const subject = log.subject || '';

    const enrolledStudents = (state.enrollments && state.enrollments[subject]) || [];

    if (Array.isArray(enrolledStudents)) {

      enrolledStudents.forEach(name => {

        if (allMainUniqueNames.indexOf(name) === -1) {

          allMainUniqueNames.push(name);

        }

      });

    }

  });



  categories.forEach(cat => {

    const catLabel = cat === 'main' ? 'เนเธเธเธเธฅเธธเนเธกเธซเธฅเธฑเธ' : 'เนเธเธเน€เธ”เธตเนเธขเธงเนเธฅเธฐเธเธฅเธธเนเธกเธขเนเธญเธข';

    html += `

      <tr style="border-bottom: 1px solid var(--border-color);" onmouseover="this.style.backgroundColor='rgba(0,132,255,0.02)'" onmouseout="this.style.backgroundColor=''">

        <td style="padding: 5px 10px; text-align: left; font-weight: 700; color: var(--color-primary-hover); border-right: 1px solid var(--border-color); white-space: nowrap; font-size: 0.7rem;">${catLabel}</td>

    `;

    

    timeSlots.forEach(slot => {

      const s = stats[cat][slot.label];

      const totalAttended = s.live + s.online;

      

      if (cat === 'main') {

        totalMainLiveOnline += totalAttended;

      } else {

        totalPrivateLiveOnline += totalAttended;

      }

      

      const hasData = (s.live > 0 || s.online > 0 || s.leave > 0 || s.absent > 0 || s.makeup > 0 || s.enrolled > 0);

      

      if (hasData) {

        const displayEnrolled = cat === 'main' ? s.studentNames.length : totalAttended;
        const tooltip = `เธเธฃ.เธฅเธเธ—เธฐเน€เธเธตเธขเธ:${displayEnrolled} เธชเธ”:${s.live} เธญเธญเธเนเธฅเธเน:${s.online} เธฅเธฒ:${s.leave} เธเธฒเธ”:${s.absent} เธเธ”เน€เธเธข:${s.makeup} เธฃเธงเธกเธกเธฒเน€เธฃเธตเธขเธ:${totalAttended}`;

        html += `
          <td style="padding: 4px 3px; border-right: 1px solid var(--border-color); vertical-align: middle;" title="${tooltip}">
            <div style="display: flex; flex-wrap: wrap; gap: 2px; justify-content: center; align-items: center;">
              ${displayEnrolled > 0 ? `<span style="background:#e0f7fa; color:#00838f; padding:1px 4px; border-radius:3px; font-weight:800; font-size:0.6rem;">เธเธฃ.${displayEnrolled}</span>` : ''}
              ${s.live > 0 ? `<span style="background:#e8f5e9; color:#2e7d32; padding:1px 4px; border-radius:3px; font-weight:700; font-size:0.6rem;">เธชเธ” ${s.live}</span>` : ''}
              ${s.online > 0 ? `<span style="background:#e3f2fd; color:#1565c0; padding:1px 4px; border-radius:3px; font-weight:700; font-size:0.6rem;">เธญเธญเธ ${s.online}</span>` : ''}
              ${s.leave > 0 ? `<span style="background:#fff3e0; color:#ef6c00; padding:1px 4px; border-radius:3px; font-weight:700; font-size:0.6rem;">เธฅเธฒ ${s.leave}</span>` : ''}
              ${s.absent > 0 ? `<span style="background:#ffebee; color:#c62828; padding:1px 4px; border-radius:3px; font-weight:700; font-size:0.6rem;">เธเธฒเธ” ${s.absent}</span>` : ''}
              ${s.makeup > 0 ? `<span style="background:#f3e5f5; color:#6a1b9a; padding:1px 4px; border-radius:3px; font-weight:700; font-size:0.6rem;">เธเธ” ${s.makeup}</span>` : ''}
              ${totalAttended > 0 ? `<span style="font-weight:800; color:#0f172a; font-size:0.62rem; border-left:1px solid #e2e8f0; padding-left:3px; margin-left:1px;">โญ${totalAttended}</span>` : ''}
            </div>
          </td>

        `;

      } else {

        html += `<td style="padding: 4px; color: #e2e8f0; border-right: 1px solid var(--border-color); font-size: 0.6rem;">-</td>`;

      }

    });

    

    html += `</tr>`;

  });

  

  const grandTotal = totalMainLiveOnline + totalPrivateLiveOnline;
  const totalUnique = allMainUniqueNames.length + totalPrivateLiveOnline;

  html += `
        </tbody>
      </table>
    </div>
    
    <div style="margin-top: 12px; display: flex; flex-wrap: wrap; gap: 10px;">
      <div style="flex: 1; min-width: 200px; background: rgba(0, 132, 255, 0.05); border-radius: 8px; padding: 10px; border: 1px solid rgba(0, 132, 255, 0.1);">
        <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; margin-bottom: 5px;">เธขเธญเธ”เธฃเธงเธกเธเธฑเธเน€เธฃเธตเธขเธเธ—เธตเนเธกเธฒเน€เธฃเธตเธขเธเธชเธ”เนเธฅเธฐเธญเธญเธเนเธฅเธเน</div>
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 600; border-bottom: 1px dashed rgba(0,0,0,0.1); padding-bottom: 4px;">
            <span style="color: #00838f;">1. เธขเธญเธ”เธฃเธงเธกเธเธฅเธธเนเธกเธซเธฅเธฑเธ</span>
            <span style="color: #00838f;">${totalMainLiveOnline} เธเธ</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 600; border-bottom: 1px dashed rgba(0,0,0,0.1); padding-bottom: 4px;">
            <span style="color: #ef6c00;">2. เธขเธญเธ”เธฃเธงเธกเน€เธ”เธตเนเธขเธง-เธเธฅเธธเนเธกเธขเนเธญเธข</span>
            <span style="color: #ef6c00;">${totalPrivateLiveOnline} เธเธ</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 800; border-bottom: 1px dashed rgba(0,0,0,0.1); padding-bottom: 4px;">
            <span style="color: #2e7d32;">3. เธฃเธงเธกเธ—เธฑเนเธเธซเธกเธ”</span>
            <span style="color: #2e7d32;">${grandTotal} เธเธ</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700;">
            <span style="color: #6a1b9a;">4. เธฃเธงเธกเนเธเธเนเธกเนเธเนเธณเธเธทเนเธญ</span>
            <span style="color: #6a1b9a;">${totalUnique} เธเธ</span>
          </div>
        </div>
      </div>

    </div>

  `;

  if (container) container.innerHTML = html;
  if (dashboardContainer) dashboardContainer.innerHTML = html;
}



function renderDailyGrid() {
  const container = document.getElementById('rooms_grid_container');
  if (!container) return;
  container.innerHTML = '';
  container.style.display = 'block';



  renderDailyAttendanceSummary();
  
  const branchFilter = (state.activeBranchFilter || 'เธชเธฒเธเธฒ1').replace(/\s+/g, '');
  const filteredRooms = (state.rooms || []).filter(room => {
    const roomBranchClean = (room.branch || '').replace(/\s+/g, '');
    return roomBranchClean.includes(branchFilter);
  });
  
  if (filteredRooms.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.className = 'empty-state-message';
    emptyMsg.textContent = 'เนเธกเนเธเธเธเนเธญเธกเธนเธฅเธซเนเธญเธเธชเธณเธซเธฃเธฑเธเธชเธฒเธเธฒ: ' + branchFilter;
    emptyMsg.style.padding = '20px';
    emptyMsg.style.textAlign = 'center';
    emptyMsg.style.color = 'var(--text-muted)';
    container.appendChild(emptyMsg);
    return;
  }

  // Timeline constants
  const HOUR_START = 8;
  const HOUR_END = 22;
  const TOTAL_HOURS = HOUR_END - HOUR_START; // 14
  const COL_WIDTH = 180; // px per hour (reduced 20%)
  const TIMELINE_WIDTH = TOTAL_HOURS * COL_WIDTH;
  const ROOM_COL_WIDTH = 160;
  const CARD_ROW_HEIGHT = 120; // reduced 20% from ~150

  // Helper: parse time string to decimal hours
  function parseTimeToHours(t) {
    if (!t) return null;
    var s = String(t).replace(':', '.').replace(/\s/g, '');
    var parts = s.split('.');
    var h = parseInt(parts[0], 10) || 0;
    var m = parseInt(parts[1], 10) || 0;
    return h + m / 60;
  }

  // Build header
  var headerCols = '';
  for (var h = HOUR_START; h <= HOUR_END; h++) {
    var label = String(h).padStart(2, '0') + '.00';
    headerCols += '<div style="position:absolute; left:' + ((h - HOUR_START) * COL_WIDTH) + 'px; width:' + COL_WIDTH + 'px; text-align:center; font-weight:700; font-size:0.72rem; color:var(--text-main); padding:8px 0; box-sizing:border-box; border-right:1px dashed #e2e8f0;">' + label + '</div>';
  }

  var html = '<div style="width:100%; height:65vh; overflow:auto; border:1px solid var(--border-color); border-radius:8px; background:#fff; box-shadow:0 2px 4px rgba(0,0,0,0.02);">';
  html += '<div style="display:flex; min-width:' + (ROOM_COL_WIDTH + TIMELINE_WIDTH) + 'px;">';
  
  // Sticky header
  html += '<div style="position:sticky; top:0; z-index:20; display:flex; width:100%; background:#f8fafc; border-bottom:2px solid var(--border-color);">';
  html += '<div style="position:sticky; left:0; z-index:30; min-width:' + ROOM_COL_WIDTH + 'px; width:' + ROOM_COL_WIDTH + 'px; padding:8px 10px; font-weight:700; font-size:0.72rem; color:var(--text-main); border-right:2px solid var(--border-color); background:#f8fafc; display:flex; align-items:center;">เธซเนเธญเธเน€เธฃเธตเธขเธ / เธญเธธเธเธเธฃเธ“เน</div>';
  html += '<div style="position:relative; width:' + TIMELINE_WIDTH + 'px; height:36px;">' + headerCols + '</div>';
  html += '</div></div>';

  // Rows
  filteredRooms.forEach(function(room) {
    var roomClasses = (state.classLogs || []).filter(function(log) {
      return matchRoomAndBranch(log.roomBranch, room.roomName, room.branch);
    });

    // Parse times and compute positions
    var cards = [];
    roomClasses.forEach(function(c) {
      var sh = parseTimeToHours(c.timeStart);
      var eh = parseTimeToHours(c.timeEnd);
      if (sh === null) return;
      if (eh === null || eh <= sh) eh = sh + 1;
      cards.push({ c: c, sh: sh, eh: eh });
    });
    cards.sort(function(a, b) { return a.sh - b.sh || a.eh - b.eh; });

    // Compute row (vertical stacking for overlaps)
    var rows = [];
    cards.forEach(function(card) {
      var placed = false;
      for (var r = 0; r < rows.length; r++) {
        var conflict = false;
        for (var k = 0; k < rows[r].length; k++) {
          if (card.sh < rows[r][k].eh && card.eh > rows[r][k].sh) {
            conflict = true;
            break;
          }
        }
        if (!conflict) {
          rows[r].push(card);
          card.row = r;
          placed = true;
          break;
        }
      }
      if (!placed) {
        card.row = rows.length;
        rows.push([card]);
      }
    });

    var maxRows = rows.length || 1;
    var rowHeight = maxRows * CARD_ROW_HEIGHT + 10;

    // Room details
    var detailsArr = [];
    if (room.ipad) detailsArr.push('๐“ฑ ' + room.ipad);
    if (room.zoom) detailsArr.push('๐’ป ' + room.zoom);
    var detailsStr = detailsArr.length > 0 ? detailsArr.map(function(d){ return '<div style="font-size:0.65rem; color:var(--text-muted);">' + d + '</div>'; }).join('') : '';
    var fullRoomLabel = (room.roomName + ' ' + room.branch + ' ' + (room.ipad||'') + ' ' + (room.zoom||'')).replace(/\s+/g, ' ').trim();

    html += '<div style="display:flex; min-width:' + (ROOM_COL_WIDTH + TIMELINE_WIDTH) + 'px; border-bottom:1px solid var(--border-color);">';
    
    // Room info (sticky left)
    html += '<div style="position:sticky; left:0; z-index:10; min-width:' + ROOM_COL_WIDTH + 'px; width:' + ROOM_COL_WIDTH + 'px; padding:8px 10px; border-right:2px solid var(--border-color); background:#fff; box-shadow:2px 0 5px -2px rgba(0,0,0,0.05); vertical-align:top;">';
    html += '<div style="font-size:0.8rem; font-weight:700; color:var(--color-primary-hover); margin-bottom:2px;">' + room.roomName + '</div>';
    html += '<div style="font-size:0.68rem; color:var(--text-muted); margin-bottom:2px;">' + (room.branch||'') + '</div>';
    html += detailsStr;
    html += '<div style="display:flex; gap:4px; margin-top:4px;">';
    html += '<button onclick="showEditRoomModal(\'' + room.branch + '\', \'' + room.roomName + '\', \'' + (room.ipad||'') + '\', \'' + (room.zoom||'') + '\')" style="font-size:0.62rem; padding:2px 4px; border:1px solid var(--border-color); border-radius:3px; background:#f8fafc; cursor:pointer;" title="เนเธเนเนเธ">โ๏ธ เนเธเนเนเธ</button>';
    html += '<button onclick="deleteRoomFrontend(\'' + room.branch + '\', \'' + room.roomName + '\')" style="font-size:0.62rem; padding:2px 4px; border:1px solid var(--border-color); border-radius:3px; background:#fff5f5; color:var(--color-danger); cursor:pointer;" title="เธฅเธ">๐—‘๏ธ เธฅเธ</button>';
    html += '</div>';
    html += '<button onclick="quickAddClassLog(\'' + fullRoomLabel + '\')" style="margin-top:6px; width:100%; display:flex; align-items:center; justify-content:center; gap:3px; padding:4px; font-size:0.65rem; border-radius:var(--radius-sm); border:1px dashed var(--color-primary); background:rgba(70,99,82,0.03); color:var(--color-primary); font-weight:600; cursor:pointer;">โ• เน€เธเธดเนเธกเธเธฅเธฒเธช</button>';
    html += '</div>';

    // Timeline area
    html += '<div style="position:relative; width:' + TIMELINE_WIDTH + 'px; min-height:' + rowHeight + 'px;">';
    
    // Vertical grid lines
    for (var gh = HOUR_START; gh <= HOUR_END; gh++) {
      html += '<div style="position:absolute; left:' + ((gh - HOUR_START) * COL_WIDTH) + 'px; top:0; bottom:0; width:1px; background:' + (gh === HOUR_END ? 'transparent' : '#f0f0f0') + ';"></div>';
    }

    // Cards
    cards.forEach(function(card) {
      var c = card.c;
      var leftPx = (card.sh - HOUR_START) * COL_WIDTH + 2;
      var widthPx = (card.eh - card.sh) * COL_WIDTH - 4;
      var topPx = card.row * CARD_ROW_HEIGHT + 4;

      // Status / color logic
      var isTeacherConfirmed = c.teacherConfirmed > 0;
      var isStudentLeaveChecked = (state.classAbsences && state.classAbsences[c.rowIndex] && state.classAbsences[c.rowIndex].studentLeave) || (c.isLeave > 0);
      var isTeacherLeaveChecked = (state.classAbsences && state.classAbsences[c.rowIndex] && state.classAbsences[c.rowIndex].teacherLeave) || (c.note && String(c.note).includes('เธเธฃเธนเธฅเธฒ'));

      var cardBg = 'background:#fff;';
      var cardBorder = 'border:1px solid var(--border-color);';
      if (isTeacherConfirmed) {
        cardBg = 'background:rgba(25,135,84,0.08);';
        cardBorder = 'border:1.5px solid rgba(25,135,84,0.4);';
      } else if (isStudentLeaveChecked) {
        cardBg = 'background:rgb(254,226,226);';
        cardBorder = 'border:1px solid rgba(239,68,68,0.35);';
      } else if (isTeacherLeaveChecked) {
        cardBg = 'background:rgb(254,243,199);';
        cardBorder = 'border:1px solid rgba(245,158,11,0.45);';
      } else {
        var subjStr = String(c.subject || '');
        var isPrivate = subjStr.includes('เน€เธ”เธตเนเธขเธง') || subjStr.includes('เธขเนเธญเธข');
        if (!isPrivate) {
          cardBg = 'background:rgba(56,189,248,0.08);';
          cardBorder = 'border:1.5px solid rgba(56,189,248,0.4);';
        }
      }

      // Attendance
      var attArr = [];
      attArr.push('เธชเธ”:' + (c.isPresentLive||0));
      attArr.push('เธญเธญเธ:' + (c.isPresentOnline||0));
      attArr.push('เธฅเธฒ:' + (c.isLeave||0));
      attArr.push('เธเธ”:' + (c.isMakeup||0));
      attArr.push('เธเธฒเธ”:' + (c.isAbsent||0));

      // Confirm button
      var confirmBtn = isTeacherConfirmed
        ? '<button type="button" onclick="toggleDailyGridConfirm(' + c.rowIndex + ',false)" style="font-size:0.58rem; padding:1px 5px; background:#15803d; color:white; font-weight:700; border-radius:10px; border:none; cursor:pointer;">โ“ เธขเธทเธเธขเธฑเธ</button>'
        : '<button type="button" onclick="toggleDailyGridConfirm(' + c.rowIndex + ',true)" style="font-size:0.58rem; padding:1px 5px; background:#e2e8f0; color:#475569; font-weight:700; border-radius:10px; border:none; cursor:pointer;">เธฃเธญเธขเธทเธเธขเธฑเธ</button>';

      var confirmedBadge = isTeacherConfirmed ? '<div style="font-weight:bold; color:#2e7d32; font-size:0.58rem;">โ… เธขเธทเธเธขเธฑเธเนเธฅเนเธง</div>' : '';

      // Room/device text
      var displayRoomText = c.roomBranch || '-';
      var displayDeviceText = '';
      var deviceMatch = displayRoomText.match(/(?:ipad|zoom).*/i);
      if (deviceMatch) {
        displayDeviceText = deviceMatch[0];
        displayRoomText = displayRoomText.replace(deviceMatch[0], '').trim();
      }

      html += '<div id="scheduled_item_' + c.rowIndex + '" style="position:absolute; left:' + leftPx + 'px; top:' + topPx + 'px; width:' + widthPx + 'px; height:' + (CARD_ROW_HEIGHT - 8) + 'px; ' + cardBg + ' ' + cardBorder + ' border-radius:6px; padding:4px 6px; font-size:0.62rem; box-sizing:border-box; display:flex; flex-direction:column; justify-content:space-between; overflow:hidden; box-shadow:0 1px 2px rgba(0,0,0,0.04); cursor:default;">';
      
      // Top: subject + time
      html += '<div>';
      html += '<div style="font-weight:700; font-size:0.68rem; color:var(--text-main); line-height:1.2; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="' + (c.subject||'').replace(/"/g,'&quot;') + '">' + formatSubjectName(c.subject) + '</div>';
      html += '<span style="font-size:0.6rem; font-weight:bold; color:var(--color-primary-hover); background:rgba(0,132,255,0.06); padding:0px 5px; border-radius:10px; display:inline-block; margin-top:1px;">' + cleanTimeStr(c.timeStart) + ' - ' + cleanTimeStr(c.timeEnd) + '</span>';
      html += '</div>';
      
      // Middle: details
      html += '<div style="font-size:0.58rem; color:var(--text-muted); line-height:1.25; border-top:1px dashed var(--border-color); padding-top:2px; margin-top:2px; overflow:hidden;">';
      html += '<div style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">๐ข ' + displayRoomText + '</div>';
      if (displayDeviceText) html += '<div style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:var(--color-primary-hover);">๐’ป ' + displayDeviceText + '</div>';
      html += '<div style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"><b>เธเธฃเธนเธเธฃเธฐเธเธณ:</b> ' + (c.teacherRegular||'-') + '</div>';
      html += '<div style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"><b>เธเธฃเธนเนเธ—เธ:</b> ' + (c.teacherSub ? '<b>' + c.teacherSub + '</b>' : '-') + '</div>';
      html += confirmedBadge;
      html += '<div style="color:var(--color-primary-hover); font-size:0.55rem;">๐‘ฅ ' + attArr.join(' ') + '</div>';
      html += '</div>';
      
      // Bottom: combined row - checkboxes + confirm + edit/delete
      html += '<div style="display:flex; justify-content:space-between; align-items:center; border-top:1px dashed rgba(0,0,0,0.06); padding-top:2px; margin-top:2px; gap:2px;" onclick="event.stopPropagation();">';
      html += '<div style="display:flex; gap:4px; align-items:center; flex-shrink:0;">';
      html += '<label style="display:flex; align-items:center; gap:1px; font-size:0.55rem; color:var(--color-danger); font-weight:bold; cursor:pointer; white-space:nowrap;"><input type="checkbox" class="student-leave-chk" data-row="' + c.rowIndex + '" ' + (isStudentLeaveChecked ? 'checked' : '') + ' onchange="toggleClassAbsence(' + c.rowIndex + ',\'studentLeave\',this)" style="transform:scale(0.75); margin:0;"> เธเนเธญเธเธฅเธฒ</label>';
      html += '<label style="display:flex; align-items:center; gap:1px; font-size:0.55rem; color:var(--color-danger); font-weight:bold; cursor:pointer; white-space:nowrap;"><input type="checkbox" class="teacher-leave-chk" data-row="' + c.rowIndex + '" ' + (isTeacherLeaveChecked ? 'checked' : '') + ' onchange="toggleClassAbsence(' + c.rowIndex + ',\'teacherLeave\',this)" style="transform:scale(0.75); margin:0;"> เธเธฃเธนเธฅเธฒ</label>';
      html += '</div>';
      html += '<div style="display:flex; gap:2px; align-items:center; flex-shrink:0;">';
      html += confirmBtn;
      html += '<button type="button" onclick="showEditClassLogModal(' + c.rowIndex + ')" style="padding:1px 3px; font-size:0.58rem; border:1px solid var(--border-color); background:#f8fafc; border-radius:3px; cursor:pointer; height:auto;" title="เนเธเนเนเธ">โ๏ธ</button>';
      html += '<button type="button" onclick="deleteClassLog(' + c.rowIndex + ')" style="padding:1px 3px; font-size:0.58rem; border:1px solid #fecaca; background:#fef2f2; color:var(--color-danger); border-radius:3px; cursor:pointer; height:auto;" title="เธฅเธ">๐—‘๏ธ</button>';
      html += '</div>';
      html += '</div>';
      
      html += '</div>'; // end card
    });

    html += '</div>'; // end timeline area
    html += '</div>'; // end row
  });

  html += '</div>'; // end outer
  container.innerHTML = html;
  
  if (state.pendingScrollRowIndex) {
    var targetRowIndex = state.pendingScrollRowIndex;
    state.pendingScrollRowIndex = null;
    setTimeout(function() {
      highlightScheduledItem(targetRowIndex);
    }, 400);
  }
}



function quickAddClassLog(roomLabel) {

  showAddClassLogModal();

  document.getElementById('class_room').value = roomLabel;

}



function quickAddClassLogMonthly(roomLabel, dateStr) {

  showAddClassLogModal();

  document.getElementById('class_room').value = roomLabel;

  if (dateStr) {

    const parts = dateStr.split('/');

    if (parts.length === 3) {

      const formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;

      document.getElementById('class_date').value = formattedDate;

    }

  }

}



function showAddRoomModal() {

  closeAllModals();

  document.getElementById('room_modal_title').innerText = 'เน€เธเธดเนเธกเธซเนเธญเธเน€เธฃเธตเธขเธเนเธซเธกเน';

  if(document.getElementById('room_add_fields')) document.getElementById('room_add_fields').style.display = 'block';

  

  // Pre-select current active branch tab filter (or default to เธชเธฒเธเธฒ1)

  const currentBranch = state.activeBranchFilter || 'เธชเธฒเธเธฒ1';

  document.getElementById('room_add_branch').value = currentBranch;

  document.getElementById('room_add_name').value = '';

  document.getElementById('room_edit_ipad').value = '';

  document.getElementById('room_edit_zoom').value = '';

  

  document.getElementById('room_edit_branch').value = '';

  document.getElementById('room_edit_name').value = '';

  

  document.getElementById('room_modal').classList.add('active');

}





window.createClassTab = function(i) {

  if (document.getElementById('class_tab_' + i)) return;



  const btnContainer = document.querySelector('#class_tabs_container').previousElementSibling;

  const newBtn = document.createElement('button');

  newBtn.type = 'button';

  newBtn.className = 'btn class-tab-btn';

  newBtn.id = 'class_tab_btn_' + i;

  newBtn.setAttribute('onclick', `switchClassTab(${i})`);

  newBtn.style.cssText = 'padding: 6px 16px; font-size: 0.82rem; border-radius: 8px 8px 0 0;';

  newBtn.innerHTML = `๐“ เธเธฅเธฒเธช ${i + 1}`;

  

  const copyBtn = document.getElementById('copy_from_class1_btn');

  if (copyBtn) {

    btnContainer.insertBefore(newBtn, copyBtn);

  } else {

    btnContainer.appendChild(newBtn);

  }



  const tab0 = document.getElementById('class_tab_0');

  const newTab = tab0.cloneNode(true);

  newTab.id = 'class_tab_' + i;

  newTab.style.display = 'none';



  newTab.querySelectorAll('[id]').forEach(el => {

    if (el.id.endsWith('_0')) el.id = el.id.replace('_0', '_' + i);

  });



  newTab.querySelectorAll('[list]').forEach(el => {

    if (el.getAttribute('list').endsWith('_0')) {

      el.setAttribute('list', el.getAttribute('list').replace('_0', '_' + i));

    }

  });



  newTab.querySelectorAll('[onchange]').forEach(el => {

    const val = el.getAttribute('onchange');

    if (val.includes('(0)')) el.setAttribute('onchange', val.replace('(0)', `(${i})`));

  });

  

  newTab.querySelectorAll('[oninput]').forEach(el => {

    const val = el.getAttribute('oninput');

    if (val.includes('(0)')) el.setAttribute('oninput', val.replace('(0)', `(${i})`));

  });



  newTab.querySelectorAll('input, select').forEach(input => {

    if (input.type === 'checkbox' || input.type === 'radio') input.checked = false;

    else if (input.type === 'number') input.value = 0;

    else input.value = '';

  });



  newTab.querySelectorAll('select.form-select').forEach(select => {

    const parent = select.parentNode;

    if (parent && parent.classList.contains('searchable-select-container')) {

      parent.parentNode.insertBefore(select, parent);

      parent.remove();

      select.style.display = '';

    }

  });



  document.getElementById('class_tabs_container').appendChild(newTab);



  if (typeof makeSelectSearchable === 'function') {

    makeSelectSearchable('class_teacher_reg_' + i);

    makeSelectSearchable('class_teacher_sub_' + i);

  }

};


function showEditClassLogModal(rowIndex) {

  const role = state.currentUser ? (state.currentUser.role || '').toString().trim() : '';

  const isTeacher = (role === 'Teacher' || role === 'เธเธฃเธน');

  if (isTeacher) {

    showToast('เธเธธเธ“เนเธกเนเธกเธตเธชเธดเธ—เธเธดเนเนเธเธเธฒเธฃเนเธเนเนเธเธเธฅเธฒเธชเน€เธฃเธตเธขเธ', 'error');

    return;

  }

  

  let targetLog = (state.classLogs || []).find(l => String(l.rowIndex) === String(rowIndex));

  if (!targetLog && state.dailyGridData && Array.isArray(state.dailyGridData.classes)) {

    targetLog = state.dailyGridData.classes.find(l => String(l.rowIndex) === String(rowIndex));

  }



  function populateModalWithLogs(classes) {

    clearClassForm();

    document.getElementById('class_modal_title').innerText = 'เนเธเนเนเธเธเธฅเธฒเธชเน€เธฃเธตเธขเธ';

    document.getElementById('class_submit_btn').innerText = 'โ“ เธญเธฑเธเน€เธ”เธ•เธเธฅเธฒเธชเน€เธฃเธตเธขเธ';

    if(document.getElementById('class_submit_btn')) document.getElementById('class_submit_btn').style.background = '#3b82f6';

    

    // Sort classes by time

    classes.sort((a,b) => (a.timeStart || '').localeCompare(b.timeStart || ''));

    

    classes.forEach((data, i) => {

      if (i > 3) {

        if (typeof window.createClassTab === 'function') window.createClassTab(i);

      }

      modalState.editingIndexes[i] = data.rowIndex;

      

      const g = id => document.getElementById(id + '_' + i);

      if (g('class_subject')) g('class_subject').value = data.subject || '';

      if (g('class_teacher_reg')) g('class_teacher_reg').value = data.teacherRegular || '';

      if (g('class_teacher_sub')) g('class_teacher_sub').value = data.teacherSub || '';

      if (g('class_time_start')) g('class_time_start').value = cleanTimeStr(data.timeStart);

      if (g('class_time_end')) g('class_time_end').value = cleanTimeStr(data.timeEnd);

      if (g('class_hours')) g('class_hours').value = cleanTimeStr(data.hours);

      if (g('class_date')) g('class_date').value = convertDateFromSheet(data.date);

      if (g('class_note')) g('class_note').value = data.note || '';

      if (g('class_kids_live')) g('class_kids_live').value = data.isPresentLive || 0;

      if (g('class_kids_online')) g('class_kids_online').value = data.isPresentOnline || 0;

      if (g('class_kids_leave')) g('class_kids_leave').value = data.isLeave || 0;

      if (g('class_kids_absent')) g('class_kids_absent').value = data.isAbsent || 0;

      if (g('class_kids_makeup')) g('class_kids_makeup').value = data.isMakeup || 0;

      // isOrange input removed

      updateClassKidsSum(i);

      

      if (i === 0) {

        document.getElementById('class_room').value = data.roomBranch || '';

      }

    });



    // Auto switch to the tab of the clicked class

    const clickedIdx = classes.findIndex(c => String(c.rowIndex) === String(rowIndex));

    switchClassTab(clickedIdx >= 0 ? clickedIdx : 0);

    

    document.getElementById('class_modal').classList.add('active');

  }



  if (targetLog) {

    const allLogs = state.classLogs || (state.dailyGridData ? state.dailyGridData.classes : []) || [];

    const cleanStr = s => (s || '').toString().trim().toLowerCase().replace(/\s+/g, '');

    const targetRoomClean = cleanStr(targetLog.roomBranch);

    const roomClasses = allLogs.filter(l => cleanStr(l.roomBranch) === targetRoomClean && l.date === targetLog.date);

    populateModalWithLogs(roomClasses.length > 0 ? roomClasses : [targetLog]);

  } else {

    // Fetch fallback from server

    setLoading(true, 'เธเธณเธฅเธฑเธเธ”เธถเธเธเนเธญเธกเธนเธฅเธเธฅเธฒเธชเน€เธฃเธตเธขเธเธเธฒเธเน€เธเธดเธฃเนเธเน€เธงเธญเธฃเน...');

    google.script.run

      .withSuccessHandler(res => {

        setLoading(false);

        if (res && res.success && res.data) {

          populateModalWithLogs([res.data]);

        } else {

          showToast('เนเธกเนเธเธเธเนเธญเธกเธนเธฅเธเธฅเธฒเธชเน€เธฃเธตเธขเธ: ' + (res ? res.error : 'unknown'), 'error');

        }

      })

      .withFailureHandler(err => {

        setLoading(false);

        showToast('เน€เธเธทเนเธญเธกเธ•เนเธญเธฅเนเธกเน€เธซเธฅเธง: ' + err.message, 'error');

      })

      .getClassLogByRow(rowIndex);

  }

}



function showEditRoomModal(branch, roomName, ipad, zoom) {

  closeAllModals();

  document.getElementById('room_modal_title').innerText = 'เธ•เธฑเนเธเธเนเธฒเธซเนเธญเธเน€เธฃเธตเธขเธ (IPAD & Zoom)';

  if(document.getElementById('room_add_fields')) document.getElementById('room_add_fields').style.display = 'none';

  

  document.getElementById('room_edit_branch').value = branch;

  document.getElementById('room_edit_name').value = roomName;

  document.getElementById('room_edit_ipad').value = ipad;

  document.getElementById('room_edit_zoom').value = zoom;

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

function isSameDate(sheetDateStr, inputDateStr) {

  if (!sheetDateStr || !inputDateStr) return false;

  const cleanSheet = sheetDateStr.toString().trim();

  const cleanInput = inputDateStr.toString().trim();

  

  const sheetParts = cleanSheet.split('/');

  const inputParts = cleanInput.split('-');

  

  if (sheetParts.length === 3 && inputParts.length === 3) {

    const sDay = parseInt(sheetParts[0], 10);

    const sMonth = parseInt(sheetParts[1], 10);

    const sYear = parseInt(sheetParts[2], 10);

    

    const iYear = parseInt(inputParts[0], 10);

    const iMonth = parseInt(inputParts[1], 10);

    const iDay = parseInt(inputParts[2], 10);

    

    return sDay === iDay && sMonth === iMonth && sYear === iYear;

  }

  return false;

}



function isDateWithinRange(sheetDateStr, startDateStr, endDateStr) {

  if (!sheetDateStr || !startDateStr || !endDateStr) return false;

  

  const sheetParts = sheetDateStr.toString().trim().split('/');

  if (sheetParts.length !== 3) return false;

  

  const sDay = parseInt(sheetParts[0], 10);

  const sMonth = parseInt(sheetParts[1], 10);

  const sYear = parseInt(sheetParts[2], 10);

  const sheetDateObj = new Date(sYear, sMonth - 1, sDay);

  

  const startParts = startDateStr.split('-');

  const endParts = endDateStr.split('-');

  if (startParts.length !== 3 || endParts.length !== 3) return false;

  

  const startYear = parseInt(startParts[0], 10);

  const startMonth = parseInt(startParts[1], 10);

  const startDay = parseInt(startParts[2], 10);

  const startDateObj = new Date(startYear, startMonth - 1, startDay);

  

  const endYear = parseInt(endParts[0], 10);

  const endMonth = parseInt(endParts[1], 10);

  const endDay = parseInt(endParts[2], 10);

  const endDateObj = new Date(endYear, endMonth - 1, endDay);

  

  sheetDateObj.setHours(0,0,0,0);

  startDateObj.setHours(0,0,0,0);

  endDateObj.setHours(0,0,0,0);

  

  return sheetDateObj >= startDateObj && sheetDateObj <= endDateObj;

}



function loadRevenueLogs(isSilent = false) {

  const startDate = document.getElementById('log_start_date').value;

  const endDate = document.getElementById('log_end_date').value;

  

  // Update date display label

  const displaySpan = document.getElementById('class_log_date_display');

  if (displaySpan) {

    displaySpan.innerText = `${formatDateToThaiShort(startDate)} - ${formatDateToThaiShort(endDate)}`;

  }

  

  fetchCachedStudents(isSilent, data => { renderRevenueLogs(); });

}



function renderRevenueLogs() {

  const tbody = document.getElementById('revenue_logs_tbody');

  if (!tbody) return;

  tbody.innerHTML = '';

  

  const startDate = document.getElementById('log_start_date').value;

  const endDate = document.getElementById('log_end_date').value;

  if (!startDate || !endDate) {

    tbody.innerHTML = `<tr><td colspan="11" style="text-align: center; color: var(--text-muted); padding: 40px;">เธเธฃเธธเธ“เธฒเน€เธฅเธทเธญเธเธเนเธงเธเธงเธฑเธเธ—เธตเน</td></tr>`;

    return;

  }

  

  const filteredStudents = state.students.filter(s => isDateWithinRange(s.paymentDate, startDate, endDate));

  

  if (filteredStudents.length === 0) {

    tbody.innerHTML = `<tr><td colspan="11" style="text-align: center; color: var(--text-muted); padding: 40px;">เนเธกเนเธกเธตเธเนเธญเธกเธนเธฅเธฃเธฒเธขเธฃเธฑเธเนเธเธเนเธงเธเธงเธฑเธเธ—เธตเนเน€เธฅเธทเธญเธ</td></tr>`;

    return;

  }

  

  const channels = state.settings.paymentChannels || [];

  

  filteredStudents.forEach(s => {

    const tr = document.createElement('tr');

    

    let optionsHtml = '';

    channels.forEach(ch => {

      const selected = ch === s.paymentChannel ? 'selected' : '';

      optionsHtml += `<option value="${ch}" ${selected}>${ch}</option>`;

    });

    

    const channelSelect = `

      <select class="form-select table-select pr-channel-select" data-id="${s.id}" style="padding: 2px 4px; font-size: 0.75rem; width: 100px; max-width: 100px; height: 24px;">

        ${optionsHtml}

      </select>

    `;

    

    const checkedCheckbox = `

      <input type="checkbox" class="pr-check-checkbox" data-id="${s.id}" ${s.isChecked ? 'checked' : ''} onchange="this.closest('tr').classList.toggle('checked-row', this.checked)" style="width: 18px; height: 18px; cursor: pointer;">

    `;

    

    tr.innerHTML = `

      <td style="white-space:nowrap;"><div style="font-weight:600;">${s.name}${s.nickname ? ` (${s.nickname})` : ''}</div></td>

      <td style="white-space:nowrap; text-align: center; width: 1%;">${s.grade || '-'}</td>

      <td style="white-space:nowrap; width: 1%;">${s.round || '-'}</td>

      <td style="white-space:nowrap; text-align: right; width: 1%;">${(s.full || 0).toLocaleString()}</td>

      <td style="white-space:nowrap; text-align: right; color: var(--color-success); font-weight: 600; width: 1%;">${(s.paid || 0).toLocaleString()}</td>

      <td style="white-space:nowrap; width: 1%;">${s.paymentDate || '-'}</td>

      <td style="white-space:nowrap; width: 1%;">${cleanTimeStr(s.paymentTimeNote) || '-'}</td>

      <td style="white-space:nowrap; width: 1%;">${channelSelect}</td>

      <td style="white-space:nowrap; width: 1%;">${s.staff || '-'}</td>

      <td style="white-space:nowrap; width: 1%;">${s.extraNote || '-'}</td>

      <td style="text-align: center; white-space:nowrap; width: 1%;">${checkedCheckbox}</td>

    `;

    if (s.isChecked) {

      tr.classList.add('checked-row');

    }

    tbody.appendChild(tr);

  });

  

  // Trigger summary calculation

  renderRevenueSummary();

}



function saveRevenueLogs() {

  const rows = document.querySelectorAll('#revenue_logs_tbody tr');

  if (rows.length === 0) {

    showToast('เนเธกเนเธกเธตเธเนเธญเธกเธนเธฅเธเธฒเธฃเน€เธเธดเธเนเธซเนเธเธฑเธเธ—เธถเธเนเธเธงเธฑเธเธเธตเน', 'info');

    return;

  }

  

  const updates = [];

  rows.forEach(tr => {

    const channelSelect = tr.querySelector('.pr-channel-select');

    const checkCheckbox = tr.querySelector('.pr-check-checkbox');

    

    if (channelSelect && checkCheckbox) {

      const studentId = channelSelect.getAttribute('data-id');

      const paymentChannel = channelSelect.value;

      const isChecked = checkCheckbox.checked;

      

      updates.push({

        id: studentId,

        paymentChannel: paymentChannel,

        isChecked: isChecked

      });

    }

  });

  

  setLoading(true, 'เธเธณเธฅเธฑเธเธเธฑเธเธ—เธถเธเธชเธ–เธฒเธเธฐเธเธฒเธฃเน€เธเธดเธเนเธฅเธฐเธเธฒเธฃเธเธณเธฃเธฐเน€เธเธดเธ...');

  const user = getLogUser();

  

  google.script.run

    .withSuccessHandler(res => {

      setLoading(false);

      if (res && res.success) {

        showToast('เธเธฑเธเธ—เธถเธเธเธฒเธฃเธ•เธฃเธงเธเธชเธญเธเนเธฅเธฐเธชเธ–เธฒเธเธฐเธเธฒเธฃเธเธณเธฃเธฐเน€เธเธดเธเธชเธณเน€เธฃเนเธ!', 'success');

        loadRevenueLogs(true);

      } else {

        showToast('เธเธฑเธเธ—เธถเธเธเธดเธ”เธเธฅเธฒเธ”: ' + res.error, 'error');

      }

    })

    .withFailureHandler(err => {

      setLoading(false);

      showToast('เน€เธเธทเนเธญเธกเธ•เนเธญเธฅเนเธกเน€เธซเธฅเธง: ' + err.message, 'error');

    })

    .updateRevenues(updates, user);

}



function loadModalClasses(callback) {

  const dateVal = document.getElementById('class_date').value;

  const roomVal = document.getElementById('class_room').value;

  

  const listContainer = document.getElementById('class_modal_today_items');

  const countSpan = document.getElementById('class_modal_today_count');

  

  if (!dateVal || !roomVal) {

    if (listContainer) listContainer.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 20px; font-size: 0.85rem;">เธเธฃเธธเธ“เธฒเน€เธฅเธทเธญเธเธงเธฑเธเธ—เธตเนเน€เธฃเธตเธขเธเนเธฅเธฐเธซเนเธญเธเน€เธฃเธตเธขเธ</div>';

    if (countSpan) countSpan.innerText = '0';

    return;

  }

  

  modalState.classes = [];

  modalState.deletedRows = [];

  modalState.newLogs = [];

  modalState.updatedLogs = [];

  modalState.editingIndex = -1;

  clearClassForm();

  

  const sheetDate = convertDateToSheet(dateVal);

  

  // Try loading from local state.classLogs to make it instant!

  const activeDate = document.getElementById('daily_grid_filter_date') ? document.getElementById('daily_grid_filter_date').value : '';

  if (dateVal === activeDate && state.classLogs && state.classLogs.length > 0) {

    const matched = state.classLogs.filter(log => {

      const roomA = (log.roomBranch || '').replace(/\s+/g, '').toLowerCase();

      const roomB = roomVal.replace(/\s+/g, '').toLowerCase();

      return roomA === roomB && log.date === sheetDate;

    });

    modalState.classes = JSON.parse(JSON.stringify(matched));

    renderModalClassesList();

    if (callback) callback();

    return;

  }

  

  listContainer.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 20px; font-size: 0.85rem;">เธเธณเธฅเธฑเธเนเธซเธฅเธ”เธเธฅเธฒเธชเน€เธฃเธตเธขเธ...</div>';

  

  google.script.run

    .withSuccessHandler(data => {

      if (Array.isArray(data)) {

        const matched = data.filter(log => {

          const roomA = (log.roomBranch || '').replace(/\s+/g, '').toLowerCase();

          const roomB = roomVal.replace(/\s+/g, '').toLowerCase();

          return roomA === roomB;

        });

        modalState.classes = JSON.parse(JSON.stringify(matched));

        renderModalClassesList();

        if (callback) callback();

      } else {

        listContainer.innerHTML = '<div style="text-align: center; color: var(--color-danger); padding: 20px; font-size: 0.85rem;">เธ”เธถเธเธเนเธญเธกเธนเธฅเธฅเนเธกเน€เธซเธฅเธง</div>';

      }

    })

    .getClassLogs(sheetDate, getLogUser());

}



function showAddClassLogModal() {

  const role = state.currentUser ? (state.currentUser.role || '').toString().trim() : '';

  const isTeacher = (role === 'Teacher' || role === 'เธเธฃเธน');

  if (isTeacher) {

    showToast('เธเธธเธ“เนเธกเนเธกเธตเธชเธดเธ—เธเธดเนเนเธเธเธฒเธฃเน€เธเธดเนเธกเธเธฅเธฒเธชเน€เธฃเธตเธขเธ', 'error');

    return;

  }

  refreshClassSubjectDatalist();

  clearClassForm();

  

  // Preset date into all 4 tabs

  const activePanel = document.querySelector('.nav-item.active').getAttribute('data-panel');

  let presetDate = getTodayString();

  if (activePanel === 'daily_grid') {

    const dgDate = document.getElementById('daily_grid_filter_date');

    if (dgDate) presetDate = dgDate.value;

  } else {

    const logStartEl = document.getElementById('log_start_date');

    if (logStartEl) presetDate = logStartEl.value;

  }

  const numTabs = document.querySelectorAll('.class-tab-content').length || 4;

  for (let i = 0; i < numTabs; i++) {

    const dateEl = document.getElementById('class_date_' + i);

    if (dateEl) dateEl.value = presetDate;

  }

  

  document.getElementById('class_modal_title').innerText = 'เธเธฑเธเธ—เธถเธเธเธฑเนเธงเนเธกเธเธชเธญเธเธเธฅเธฒเธชเนเธซเธกเน';

  document.getElementById('class_submit_btn').innerText = '๐’พ เธเธฑเธเธ—เธถเธเธเนเธญเธกเธนเธฅเธเธฅเธฒเธชเน€เธฃเธตเธขเธ';

  if(document.getElementById('class_submit_btn')) document.getElementById('class_submit_btn').style.background = '#10b981';

  document.getElementById('class_modal').classList.add('active');

}



function closeClassLogModal() {

  document.getElementById('class_modal').classList.remove('active');

  for (let i = 0; i < 4; i++) {

    const rec = document.getElementById('class_is_recurring_' + i);

    if (rec) rec.checked = false;

    const rc = document.getElementById('class_recurring_end_container_' + i);

    if (rc) rc.style.display = 'none';

  }

  modalState.editingIndex = -1;

}



function renderModalClassesList() {

  const listContainer = document.getElementById('class_modal_today_items');

  const countSpan = document.getElementById('class_modal_today_count');

  

  if (countSpan) countSpan.innerText = modalState.classes.length;

  if (modalState.classes.length === 0) {

    if (listContainer) listContainer.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 20px; font-size: 0.85rem;">เนเธกเนเธกเธตเธเธฅเธฒเธชเน€เธฃเธตเธขเธเนเธเธงเธฑเธเธเธตเน</div>';

    return;

  }

  

  if (!listContainer) return;

  listContainer.innerHTML = '';

  

  const sorted = [...modalState.classes].sort((a, b) => (a.timeStart || '').localeCompare(b.timeStart || ''));

  

  sorted.forEach(log => {

    const originalIndex = modalState.classes.indexOf(log);

    const item = document.createElement('div');

    item.className = 'today-class-item';

    

    const isTeacherConfirmed = log.teacherConfirmed > 0;

    const isStudentLeaveChecked = log.isLeave > 0;

    const isTeacherLeaveChecked = log.note && String(log.note).includes('เธเธฃเธนเธฅเธฒ');

    

    let cardBgStyle = '#ffffff';

    let cardBorderStyle = '1px solid var(--border-color)';

    if (isTeacherConfirmed) {

      cardBgStyle = 'rgba(25, 135, 84, 0.12)';

      cardBorderStyle = '1.5px solid rgba(25, 135, 84, 0.4)';

    } else if (isStudentLeaveChecked) {

      cardBgStyle = 'rgb(254, 226, 226)';

      cardBorderStyle = '1px solid rgba(239, 68, 68, 0.35)';

    } else if (isTeacherLeaveChecked) {

      cardBgStyle = 'rgb(255, 237, 213)';

      cardBorderStyle = '1px solid rgba(249, 115, 22, 0.45)';

    }

    

    let statusLabel = '';

    if (!log.rowIndex) {

      statusLabel = '<span style="background: #10b981; color: white; font-size: 0.6rem; padding: 2px 4px; border-radius: 3px; font-weight: 700; margin-left: 6px;">เน€เธเธดเนเธกเนเธซเธกเน</span>';

    } else {

      const isUpdated = modalState.updatedLogs.some(x => x.rowIndex === log.rowIndex);

      if (isUpdated) {

        statusLabel = '<span style="background: #3b82f6; color: white; font-size: 0.6rem; padding: 2px 4px; border-radius: 3px; font-weight: 700; margin-left: 6px;">เนเธเนเนเธเธเธฑเนเธงเธเธฃเธฒเธง</span>';

      }

    }

    

    item.style.backgroundColor = cardBgStyle;

    item.style.border = cardBorderStyle;

    item.style.borderRadius = 'var(--radius-md)';

    item.style.padding = '10px';

    item.style.boxShadow = 'var(--shadow-sm)';

    item.style.display = 'flex';

    item.style.flexDirection = 'column';

    item.style.gap = '6px';

    

    let badges = [];

    if (isTeacherConfirmed) badges.push(`<span class="badge" style="font-size: 0.65rem; padding: 2px 4px; background-color: #15803d; color: white; font-weight: 700;">โ“ เธขเธทเธเธขเธฑเธ</span>`);

    if (log.isPresentLive > 0) badges.push(`<span class="badge badge-success" style="font-size: 0.65rem; padding: 2px 4px;">เธชเธ”: ${log.isPresentLive}</span>`);

    if (log.isPresentOnline > 0) badges.push(`<span class="badge badge-info" style="font-size: 0.65rem; padding: 2px 4px;">เธญเธญเธ: ${log.isPresentOnline}</span>`);

    if (log.isLeave > 0) badges.push(`<span class="badge badge-warning" style="font-size: 0.65rem; padding: 2px 4px;">เธฅเธฒ: ${log.isLeave}</span>`);

    if (log.isAbsent > 0) badges.push(`<span class="badge badge-danger" style="font-size: 0.65rem; padding: 2px 4px;">เธเธฒเธ”: ${log.isAbsent}</span>`);

    if (log.isMakeup > 0) badges.push(`<span class="badge" style="font-size: 0.65rem; padding: 2px 4px; background-color: #c095e7; color: white;">เธเธ”: ${log.isMakeup}</span>`);

    

    const badgesHTML = badges.length > 0 ? `<div style="display:flex; gap:4px; flex-wrap:wrap;">${badges.join('')}</div>` : '<span style="font-size:0.7rem; color:var(--text-muted);">เนเธกเนเธกเธตเน€เธเนเธเธญเธดเธ</span>';

    

    item.innerHTML = `

      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">

        <div style="font-weight: 700; font-size: 0.85rem; color: var(--text-main); line-height: 1.3;">

          ${log.subject} ${statusLabel}

        </div>

        <div style="font-size: 0.72rem; font-weight: bold; color: var(--color-primary-hover); white-space: nowrap; background: rgba(0, 132, 255, 0.1); padding: 2px 6px; border-radius: var(--radius-sm);">

          ${cleanTimeStr(log.timeStart)} - ${cleanTimeStr(log.timeEnd)}

        </div>

      </div>

      <div style="font-size: 0.65rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 2px; border-top: 1px dashed var(--border-color); padding-top: 4px; margin-top: 2px;">

        <div>๐ข เธซเนเธญเธ/เธชเธฒเธเธฒ: ${log.roomBranch || '-'}</div>

        <div>๐‘จโ€๐ซ เธเธฃเธนเธเธฃเธฐเธเธณ: ${log.teacherRegular}<br>๐” เธเธฃเธนเนเธ—เธ: ${log.teacherSub ? log.teacherSub : '-'}</div>

        ${log.note ? `<div style="font-style: italic; color: #64748b; margin-top: 2px;">๐“ เธซเธกเธฒเธขเน€เธซเธ•เธธ: ${log.note}</div>` : ''}

      </div>

      <div style="display: flex; gap: 12px; align-items: center; margin-top: 4px; border-top: 1px dashed rgba(0,0,0,0.08); padding-top: 4px;" onclick="event.stopPropagation();">

        <label style="display: flex; align-items: center; gap: 4px; font-size: 0.72rem; cursor: pointer; font-weight: 600; color: var(--color-danger);">

          <input type="checkbox" class="student-leave-chk" ${isStudentLeaveChecked ? 'checked' : ''} onchange="toggleLocalLeave(${originalIndex}, 'leave', this)"> ๐’ เธเนเธญเธเธฅเธฒ

        </label>

        <label style="display: flex; align-items: center; gap: 4px; font-size: 0.72rem; cursor: pointer; font-weight: 600; color: var(--color-danger);">

          <input type="checkbox" class="teacher-leave-chk" ${isTeacherLeaveChecked ? 'checked' : ''} onchange="toggleLocalLeave(${originalIndex}, 'teacher', this)"> ๐‘จโ€๐ซ เธเธฃเธนเธฅเธฒ

        </label>

      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px solid var(--border-color); padding-top: 6px;">

        ${badgesHTML}

        <div style="display: flex; gap: 4px;">

          <button type="button" class="btn btn-secondary btn-icon" onclick="editLocalClass(${originalIndex})" style="padding: 2px 6px; font-size: 0.7rem; height: auto;" title="เนเธเนเนเธ">โ๏ธ</button>

          <button type="button" class="btn btn-danger btn-icon" onclick="deleteLocalClass(${originalIndex})" style="padding: 2px 6px; font-size: 0.7rem; height: auto;" title="เธฅเธ">๐—‘๏ธ</button>

        </div>

      </div>

    `;

    listContainer.appendChild(item);

  });

}



function toggleLocalLeave(index, type, checkbox) {

  const log = modalState.classes[index];

  if (!log) return;

  

  if (type === 'leave') {

    log.isLeave = checkbox.checked ? 1 : 0;

    if (checkbox.checked) {

      log.isPresentLive = 0;

      log.isPresentOnline = 0;

    }

  } else if (type === 'teacher') {

    if (checkbox.checked) {

      if (!log.note.includes('เธเธฃเธนเธฅเธฒ')) {

        log.note = (log.note + ' เธเธฃเธนเธฅเธฒ').trim();

      }

    } else {

      log.note = log.note.replace('เธเธฃเธนเธฅเธฒ', '').trim();

    }

  }

  

  if (log.rowIndex) {

    const existingIdx = modalState.updatedLogs.findIndex(x => x.rowIndex === log.rowIndex);

    if (existingIdx !== -1) {

      modalState.updatedLogs[existingIdx].log = log;

    } else {

      modalState.updatedLogs.push({ rowIndex: log.rowIndex, log: log });

    }

  }

  

  renderModalClassesList();

  if (modalState.editingIndex === index) {

    editLocalClass(index);

  }

}



function editLocalClass(index) {

  const log = modalState.classes[index];

  if (!log) return;

  

  modalState.editingIndex = index;

  document.getElementById('class_modal_title').innerText = 'เนเธเนเนเธเธเธฅเธฒเธชเน€เธฃเธตเธขเธ (เธเธฑเนเธงเธเธฃเธฒเธง)';

  document.getElementById('class_submit_btn').innerText = 'โ“ เธญเธฑเธเน€เธ”เธ•เธเธฅเธฒเธชเนเธเธฃเธฒเธขเธเธฒเธฃ';

  if(document.getElementById('class_submit_btn')) document.getElementById('class_submit_btn').style.background = '#3b82f6';

  

  document.getElementById('class_row_index').value = log.rowIndex || '';

  document.getElementById('class_subject').value = log.subject;

  document.getElementById('class_teacher_reg').value = log.teacherRegular;

  document.getElementById('class_teacher_sub').value = log.teacherSub || '';

  document.getElementById('class_time_start').value = cleanTimeStr(log.timeStart);

  document.getElementById('class_time_end').value = cleanTimeStr(log.timeEnd);

  document.getElementById('class_hours').value = cleanTimeStr(log.hours);

  document.getElementById('class_date').value = convertDateFromSheet(log.date);

  document.getElementById('class_room').value = log.roomBranch;

  document.getElementById('class_note').value = log.note;

  

  document.getElementById('class_kids_live').value = log.isPresentLive || 0;

  document.getElementById('class_kids_online').value = log.isPresentOnline || 0;

  document.getElementById('class_kids_leave').value = log.isLeave || 0;

  document.getElementById('class_kids_absent').value = log.isAbsent || 0;

  document.getElementById('class_kids_makeup').value = log.isMakeup || 0;

  // isOrange edit form removed

  

  updateClassKidsSum();

  

  document.getElementById('class_is_recurring').checked = false;

  if(document.getElementById('class_recurring_wrapper')) document.getElementById('class_recurring_wrapper').style.display = 'none';

  if(document.getElementById('class_recurring_end_container')) document.getElementById('class_recurring_end_container').style.display = 'none';

}



function deleteLocalClass(index) {

  const log = modalState.classes[index];

  if (!log) return;

  

  if (confirm(`เธเธธเธ“เธ•เนเธญเธเธเธฒเธฃเธฅเธเธเธฅเธฒเธช "${log.subject}" เนเธเนเธซเธฃเธทเธญเนเธกเน?`)) {

    if (log.rowIndex) {

      modalState.deletedRows.push(log.rowIndex);

      modalState.updatedLogs = modalState.updatedLogs.filter(x => x.rowIndex !== log.rowIndex);

    } else {

      modalState.newLogs = modalState.newLogs.filter(x => x !== log);

    }

    

    modalState.classes.splice(index, 1);

    

    if (modalState.editingIndex === index) {

      clearClassForm();

    } else if (modalState.editingIndex > index) {

      modalState.editingIndex--;

    }

    

    renderModalClassesList();

    showToast('เธฅเธเธเธฅเธฒเธชเน€เธฃเธตเธขเธเธญเธญเธเธเธฒเธเธฃเธฒเธขเธเธฒเธฃเธเธฑเนเธงเธเธฃเธฒเธงเนเธฅเนเธง', 'success');

  }

}



function clearClassForm() {

  modalState.editingIndex = -1;

  const numTabs = document.querySelectorAll('.class-tab-content').length || 4;

  modalState.editingIndexes = Array(numTabs).fill(-1);

  document.getElementById('class_modal_title').innerText = 'เธเธฑเธเธ—เธถเธเธเธฑเนเธงเนเธกเธเธชเธญเธเธเธฅเธฒเธชเนเธซเธกเน';

  document.getElementById('class_submit_btn').innerText = '๐’พ เธเธฑเธเธ—เธถเธเธเนเธญเธกเธนเธฅเธเธฅเธฒเธชเน€เธฃเธตเธขเธ';

  if(document.getElementById('class_submit_btn')) document.getElementById('class_submit_btn').style.background = '#10b981';

  document.getElementById('class_row_index').value = '';



  // Reset all tab inputs

  for (let i = 0; i < numTabs; i++) {

    const get = id => document.getElementById(id + '_' + i);

    if (get('class_subject')) get('class_subject').value = '';

    if (get('class_teacher_reg')) get('class_teacher_reg').value = '';

    if (get('class_teacher_sub')) get('class_teacher_sub').value = '';

    if (get('class_time_start')) get('class_time_start').value = '';

    if (get('class_time_end')) get('class_time_end').value = '';

    if (get('class_hours')) get('class_hours').value = '';

    if (get('class_note')) get('class_note').value = '';

    if (get('class_kids_live')) get('class_kids_live').value = 0;

    if (get('class_kids_online')) get('class_kids_online').value = 0;

    if (get('class_kids_leave')) get('class_kids_leave').value = 0;

    if (get('class_kids_absent')) get('class_kids_absent').value = 0;

    if (get('class_kids_makeup')) get('class_kids_makeup').value = 0;

    if (get('class_kids_orange')) get('class_kids_orange').value = 0;

    if (get('class_kids_sum')) get('class_kids_sum').value = 0;

    if (get('class_is_recurring')) get('class_is_recurring').checked = false;

    const rc = get('class_recurring_end_container');

    if (rc) rc.style.display = 'none';

  }



  // Switch back to tab 0

  switchClassTab(0);

}



function switchClassTab(idx) {

  const numTabs = document.querySelectorAll('.class-tab-content').length || 4;

  for (let i = 0; i < numTabs; i++) {

    const tab = document.getElementById('class_tab_' + i);

    const btn = document.getElementById('class_tab_btn_' + i);

    if (tab) tab.style.display = (i === idx) ? 'block' : 'none';

    if (btn) {

      btn.classList.toggle('active', i === idx);

      btn.style.fontWeight = (i === idx) ? '700' : '500';

    }

  }

}



function calculateClassHours(idx) {

  const get = id => document.getElementById(id + '_' + idx);

  const startEl = get('class_time_start');

  const endEl   = get('class_time_end');

  const hoursEl = get('class_hours');

  if (!startEl || !endEl || !hoursEl) return;

  const start = startEl.value;

  const end   = endEl.value;

  if (!start || !end) return;

  const [sh, sm] = start.split(':').map(Number);

  const [eh, em] = end.split(':').map(Number);

  let diff = (eh * 60 + em) - (sh * 60 + sm);

  if (diff < 0) diff += 24 * 60;

  const hh = Math.floor(diff / 60);

  const mm = diff % 60;

  hoursEl.value = hh + ':' + String(mm).padStart(2, '0');

}



function updateClassKidsSum(idx) {

  const get = id => parseInt(document.getElementById(id + '_' + idx)?.value) || 0;

  const sum = get('class_kids_live') + get('class_kids_online') + get('class_kids_leave');

  const sumEl = document.getElementById('class_kids_sum_' + idx);

  if (sumEl) sumEl.value = sum;

}



function copyClassLogFromFirst() {

  const fields = ['class_teacher_reg', 'class_time_start', 'class_time_end', 'class_hours', 'class_date', 'class_note'];

  const numTabs = document.querySelectorAll('.class-tab-content').length || 4;

  for (let i = 1; i < numTabs; i++) {

    fields.forEach(f => {

      const src = document.getElementById(f + '_0');

      const dst = document.getElementById(f + '_' + i);

      if (src && dst) dst.value = src.value;

    });

    const recSrc = document.getElementById('class_is_recurring_0');

    const recDst = document.getElementById('class_is_recurring_' + i);

    if (recSrc && recDst) recDst.checked = recSrc.checked;

    const kidsFields = ['class_kids_live', 'class_kids_online', 'class_kids_leave', 'class_kids_absent', 'class_kids_makeup'];

    kidsFields.forEach(f => {

      const src = document.getElementById(f + '_0');

      const dst = document.getElementById(f + '_' + i);

      if (src && dst) dst.value = src.value;

    });

    updateClassKidsSum(i);

  }

  showToast('เธเธฑเธ”เธฅเธญเธเธเนเธญเธกเธนเธฅเธเธฒเธเธเธฅเธฒเธช 1 เนเธเธขเธฑเธเธเธฅเธฒเธช 2-4 เนเธฅเนเธง', 'success');

}



function toggleClassAbsence(rowIndex, type, checkbox) {

  if (!state.classAbsences) {

    state.classAbsences = {};

  }

  if (!state.classAbsences[rowIndex]) {

    state.classAbsences[rowIndex] = { studentLeave: false, teacherLeave: false };

  }

  state.classAbsences[rowIndex][type] = checkbox.checked;

  

  // Save to localStorage

  localStorage.setItem('classAbsences', JSON.stringify(state.classAbsences));

  

  const item = checkbox.closest('.scheduled-item') || checkbox.closest('.today-class-item');

  if (item) {

    const hasStudentLeave = state.classAbsences[rowIndex].studentLeave;

    const hasTeacherLeave = state.classAbsences[rowIndex].teacherLeave;

    if (hasStudentLeave) {

      item.style.backgroundColor = 'rgb(254, 226, 226)';

      item.style.borderColor = 'rgba(239, 68, 68, 0.35)';

    } else if (hasTeacherLeave) {

      item.style.backgroundColor = 'rgb(255, 237, 213)';

      item.style.borderColor = 'rgba(249, 115, 22, 0.45)';

    } else {

      item.style.backgroundColor = '';

      item.style.borderColor = '';

    }

  }

  

  if (type === 'studentLeave') {

    const log = (state.classLogs || []).find(l => l.rowIndex === rowIndex);

    if (log) {

      if (checkbox.checked) {

        log.isPresentLive = 0;

        log.isPresentOnline = 0;

        log.isMakeup = 0;

        log.isLeave = 1;

      } else {

        log.isLeave = 0;

        if ((log.isPresentLive || 0) === 0 && (log.isPresentOnline || 0) === 0) {

          log.isPresentLive = 1;

        }

      }

    }

    

    // Immediately update input values in the edit modal if it's currently open for this class log!

    const modalRowIndex = document.getElementById('class_row_index').value;

    if (modalRowIndex && parseInt(modalRowIndex) === rowIndex) {

      if (checkbox.checked) {

        document.getElementById('class_kids_live').value = 0;

        document.getElementById('class_kids_online').value = 0;

        document.getElementById('class_kids_makeup').value = 0;

        document.getElementById('class_kids_leave').value = 1;

      } else {

        document.getElementById('class_kids_leave').value = 0;

        if (parseInt(document.getElementById('class_kids_live').value || 0) === 0 &&

            parseInt(document.getElementById('class_kids_online').value || 0) === 0) {

          document.getElementById('class_kids_live').value = 1;

        }

      }

      updateClassKidsSum();

    }

    

    const user = getLogUser();

    google.script.run

      .withSuccessHandler(res => {

        if (res && res.success) {

          showToast('เธญเธฑเธเน€เธ”เธ•เธชเธ–เธฒเธเธฐเธเธฒเธฃเธฅเธฒเนเธฅเธฐเธชเธ–เธดเธ•เธดเธเธฑเธเน€เธฃเธตเธขเธเธชเธณเน€เธฃเนเธ!', 'success');

          if (log) {

            log.isPresentLive = res.isPresentLive;

            log.isPresentOnline = res.isPresentOnline;

            log.isLeave = res.isLeave;

          }

          // Sync modal input values again

          if (modalRowIndex && parseInt(modalRowIndex) === rowIndex) {

            document.getElementById('class_kids_live').value = res.isPresentLive;

            document.getElementById('class_kids_online').value = res.isPresentOnline;

            document.getElementById('class_kids_leave').value = res.isLeave;

            updateClassKidsSum();

          }

          if (monthlyViewState.mode === 'monthly' && monthlyViewState.monthlyData) {

            renderMonthlyGrid(monthlyViewState.monthlyData);

          } else {

            renderDailyGrid();

          }

          checkLowBalanceStudents();

        } else {

          showToast('เธญเธฑเธเน€เธ”เธ•เธเธ Google Sheet เธฅเนเธกเน€เธซเธฅเธง: ' + res.error, 'error');

        }

      })

      .withFailureHandler(err => {

        showToast('เน€เธเธทเนเธญเธกเธ•เนเธญเธเธดเธ”เธเธฅเธฒเธ”: ' + err.message, 'error');

      })

      .updateClassAbsenceAndAttendance(rowIndex, type, checkbox.checked, user);

  } else if (type === 'teacherLeave') {

    // Also save teacher leave to sheet note!

    google.script.run

      .withSuccessHandler(res => {

        if (res && res.success) {

          showToast('เธเธฑเธเธ—เธถเธเธชเธ–เธฒเธเธฐเธเธฃเธนเธฅเธฒเธชเธณเน€เธฃเนเธ!', 'success');

          // Update local classLogs note if available

          const log = (state.classLogs || []).find(l => l.rowIndex === rowIndex);

          if (log) {

            if (checkbox.checked) {

              if (!log.note || !log.note.includes('เธเธฃเธนเธฅเธฒ')) {

                log.note = (log.note ? log.note + ' ' : '') + 'เธเธฃเธนเธฅเธฒ';

              }

            } else {

              if (log.note) {

                log.note = log.note.replace(/เธเธฃเธนเธฅเธฒ/g, '').trim();

              }

            }

          }

          if (monthlyViewState.mode === 'monthly' && monthlyViewState.monthlyData) {

            renderMonthlyGrid(monthlyViewState.monthlyData);

          } else {

            renderDailyGrid();

          }

        } else {

          showToast('เธเธฑเธเธ—เธถเธเธเธฃเธนเธฅเธฒเธเธ Google Sheet เธฅเนเธกเน€เธซเธฅเธง: ' + (res ? res.error : 'unknown'), 'error');

          checkbox.checked = !checkbox.checked;

          if (item) {

            const hasStudentLeave = state.classAbsences[rowIndex].studentLeave;

            if (hasStudentLeave) {

              item.style.backgroundColor = 'rgb(254, 226, 226)';

              item.style.borderColor = 'rgba(239, 68, 68, 0.35)';

            } else if (checkbox.checked) {

              item.style.backgroundColor = 'rgb(254, 243, 199)';

              item.style.borderColor = 'rgba(245, 158, 11, 0.45)';

            } else {

              item.style.backgroundColor = '';

              item.style.borderColor = '';

            }

          }

        }

      })

      .withFailureHandler(err => {

        showToast('เน€เธเธทเนเธญเธกเธ•เนเธญเธเธดเธ”เธเธฅเธฒเธ”: ' + err.message, 'error');

        checkbox.checked = !checkbox.checked;

        // revert visual status

      })

      .toggleClassAbsentInSheet(rowIndex, 'kru', checkbox.checked);

  } else {

    if (monthlyViewState.mode === 'monthly' && monthlyViewState.monthlyData) {

      renderMonthlyGrid(monthlyViewState.monthlyData);

    } else {

      renderDailyGrid();

    }

  }

}



function handleTeacherLeaveToggle(rowIndex, checkbox) {

  const card = checkbox.closest('.teacher-card');

  if (checkbox.checked) {

    card.style.backgroundColor = 'rgb(254, 226, 226)';

    card.style.borderColor = 'rgba(239, 68, 68, 0.35)';

  } else {

    card.style.backgroundColor = '';

    card.style.borderColor = '';

  }

  

  google.script.run

    .withSuccessHandler(res => {

      if (res && res.success) {

        showToast('เธเธฑเธเธ—เธถเธเธชเธ–เธฒเธเธฐเธเธฃเธนเธฅเธฒเธชเธณเน€เธฃเนเธ!', 'success');

      } else {

        showToast('เธเธฑเธเธ—เธถเธเธเธดเธ”เธเธฅเธฒเธ”: ' + (res ? res.error : 'unknown'), 'error');

        checkbox.checked = !checkbox.checked;

        card.style.backgroundColor = checkbox.checked ? 'rgb(254, 226, 226)' : '';

        card.style.borderColor = checkbox.checked ? 'rgba(239, 68, 68, 0.35)' : '';

      }

    })

    .withFailureHandler(err => {

      showToast('เน€เธเธทเนเธญเธกเธ•เนเธญเธฅเนเธกเน€เธซเธฅเธง: ' + err.message, 'error');

      checkbox.checked = !checkbox.checked;

      card.style.backgroundColor = checkbox.checked ? 'rgb(254, 226, 226)' : '';

      card.style.borderColor = checkbox.checked ? 'rgba(239, 68, 68, 0.35)' : '';

    })

    .toggleClassAbsentInSheet(rowIndex, 'kru', checkbox.checked);

}





function saveClassLog(e) {

  e.preventDefault();

  try {

    const role = state.currentUser ? (state.currentUser.role || '').toString().trim() : '';

    const isTeacher = (role === 'Teacher' || role === 'เธเธฃเธน');

    if (isTeacher) {

      showToast('เธเธธเธ“เนเธกเนเธกเธตเธชเธดเธ—เธเธดเนเนเธเธเธฒเธฃเธเธฑเธเธ—เธถเธเธซเธฃเธทเธญเนเธเนเนเธเธเธฅเธฒเธชเน€เธฃเธตเธขเธ', 'error');

      return;

    }



    const roomBranch = document.getElementById('class_room').value.trim();

    const user = getLogUser();

    const logsToAdd = [];

    const logsToUpdate = [];

    const recurringLogsPerTab = [];



    const numTabs = document.querySelectorAll('.class-tab-content').length || 4;

    for (let i = 0; i < numTabs; i++) {

      const g = id => document.getElementById(id + '_' + i);

      const subject = g('class_subject')?.value.trim() || '';

      if (!subject) continue; // skip empty tabs
      
      const listId = g('class_subject').getAttribute('list');
      if (listId) {
        const datalist = document.getElementById(listId);
        if (datalist) {
          const options = Array.from(datalist.options).map(opt => opt.value);
          if (subject.includes('เน€เธ”เธตเนเธขเธง') && !options.includes(subject)) {
             showToast(`เธเธฅเธฒเธช ${i+1}: เธเธทเนเธญเธเธญเธฃเนเธชเน€เธ”เนเธเน€เธ”เธตเนเธขเธง เธซเนเธฒเธกเธเธดเธกเธเนเธเนเธญเธเธงเธฒเธกเธ•เนเธญเธ—เนเธฒเธข (เธเธฃเธธเธ“เธฒเน€เธฅเธทเธญเธเธเธฒเธเธฃเธฒเธขเธเธฒเธฃเน€เธ—เนเธฒเธเธฑเนเธ)`, 'error');
             return; // Stop saving
          }
        }
      }



      const logData = {

        subject: subject,

        teacherRegular: g('class_teacher_reg')?.value || '',

        teacherSub: g('class_teacher_sub')?.value || '',

        timeStart: g('class_time_start')?.value || '',

        timeEnd: g('class_time_end')?.value || '',

        hours: g('class_hours')?.value.trim() || '',

        date: convertDateToSheet(g('class_date')?.value || ''),

        roomBranch,

        note: g('class_note')?.value.trim() || '',

        isPresentLive: parseInt(g('class_kids_live')?.value) || 0,

        isPresentOnline: parseInt(g('class_kids_online')?.value) || 0,

        isLeave: parseInt(g('class_kids_leave')?.value) || 0,

        isAbsent: parseInt(g('class_kids_absent')?.value) || 0,

        isMakeup: parseInt(g('class_kids_makeup')?.value) || 0,

        // isOrange removed from save

      };



      if (modalState.editingIndexes && modalState.editingIndexes[i] !== -1) {

        logsToUpdate.push({ rowIndex: modalState.editingIndexes[i], log: logData });

      } else {

        logsToAdd.push(logData);

        

        const isRecurring = g('class_is_recurring')?.checked;

        const recurringEnd = g('class_recurring_end_date')?.value;

        if (isRecurring && recurringEnd) {

          recurringLogsPerTab.push({ log: logData, endDate: recurringEnd });

        }

      }

    }

    

    if (logsToAdd.length === 0 && logsToUpdate.length === 0) {

      showToast('เธเธฃเธธเธ“เธฒเธเธฃเธญเธเธงเธดเธเธฒเน€เธฃเธตเธขเธเธญเธขเนเธฒเธเธเนเธญเธข 1 เธเธฅเธฒเธช', 'error');

      return;

    }



    // Create recurring copies if any

    const additionalRecurringLogs = [];

    let hasRecurringError = false;



    for (const r of recurringLogsPerTab) {

      if (!r.log.date || !r.endDate) {

        showToast('เธเธฃเธธเธ“เธฒเธฃเธฐเธเธธเธงเธฑเธเธ—เธตเนเน€เธฃเธดเนเธกเธ•เนเธเนเธฅเธฐเธชเธดเนเธเธชเธธเธ”เธเธญเธเธเธญเธฃเนเธชเธชเธณเธซเธฃเธฑเธเธเธฒเธฃเธเธฑเธเธ—เธถเธเธเนเธณ', 'error');

        hasRecurringError = true;

        break;

      }



      const currentStr = convertDateFromSheet(r.log.date);

      if (!currentStr) continue;

      const current = new Date(currentStr);

      const end = new Date(r.endDate);

      

      if (isNaN(current.getTime()) || isNaN(end.getTime())) {

        showToast('เธฃเธนเธเนเธเธเธงเธฑเธเธ—เธตเนเนเธกเนเธ–เธนเธเธ•เนเธญเธ', 'error');

        hasRecurringError = true;

        break;

      }

      

      if (end < current) {

        showToast('เธงเธฑเธเธ—เธตเนเธชเธดเนเธเธชเธธเธ”เธ•เนเธญเธเนเธกเนเธเนเธญเธขเธเธงเนเธฒเธงเธฑเธเธ—เธตเนเน€เธฃเธดเนเธกเธ•เนเธ', 'error');

        hasRecurringError = true;

        break;

      }



      const subject = r.log.subject || '';

      let maxWeeks = -1; // unlimited

      let typeName = '';

      

      if (subject.includes('เน€เธ”เธตเนเธขเธง')) {

        maxWeeks = 4;

        typeName = 'เน€เธ”เธตเนเธขเธง';

      } else if (subject.includes('เธขเนเธญเธข')) {

        maxWeeks = 8;

        typeName = 'เธขเนเธญเธข';

      } else if (subject.includes('เธซเธฅเธฑเธ')) {

        maxWeeks = -1;

      }

      

      const timeDiff = end.getTime() - current.getTime();

      const diffWeeks = Math.floor(timeDiff / (1000 * 3600 * 24 * 7));

      

      // If diffWeeks is e.g. 4, it means 5 total classes (start + 4 extra).

      // So if maxWeeks is 4, diffWeeks must be < 4 (max 3 extra classes, 4 total).

      if (maxWeeks !== -1 && diffWeeks >= maxWeeks) {

        showToast(`เธงเธดเธเธฒเน€เธฃเธตเธขเธเธ—เธตเนเธกเธตเธเธณเธงเนเธฒ "${typeName}" เธชเธฒเธกเธฒเธฃเธ–เธเธฑเธเธ—เธถเธเธเนเธณเนเธ”เนเนเธกเนเน€เธเธดเธ ${maxWeeks} เธชเธฑเธเธ”เธฒเธซเน (เธฃเธงเธกเธชเธฑเธเธ”เธฒเธซเนเนเธฃเธ)`, 'error');

        hasRecurringError = true;

        break;

      }

      

      const nextDate = new Date(current);

      nextDate.setDate(nextDate.getDate() + 7);

      while (nextDate <= end) {

        const copy = { ...r.log };

        const y = nextDate.getFullYear();

        const m = String(nextDate.getMonth() + 1).padStart(2, '0');

        const d = String(nextDate.getDate()).padStart(2, '0');

        copy.date = convertDateToSheet(`${y}-${m}-${d}`);

        additionalRecurringLogs.push(copy);

        nextDate.setDate(nextDate.getDate() + 7);

      }

    }



    if (hasRecurringError) {

      return; // Stop saving if validation failed

    }

    

    logsToAdd.push(...additionalRecurringLogs);



    // Close the modal immediately so the user can continue their work

    closeClassLogModal();

    showToast('เธเธณเธฅเธฑเธเธเธฑเธเธ—เธถเธเธเนเธญเธกเธนเธฅเธเธฅเธฒเธชเน€เธฃเธตเธขเธเนเธเน€เธเธทเนเธญเธเธซเธฅเธฑเธ...', 'info');



    google.script.run

      .withSuccessHandler(res => {

        if (res && res.success) {

          if (additionalRecurringLogs.length > 0) {

            showToast('เธเธฑเธเธ—เธถเธเธเธฅเธฒเธชเน€เธฃเธตเธขเธเธเนเธณเธชเธณเน€เธฃเนเธเธเธณเธเธงเธ ' + logsToAdd.length + ' เธเธฒเธ!', 'success');

          } else {

            showToast('เธเธฑเธเธ—เธถเธ/เนเธเนเนเธเธเนเธญเธกเธนเธฅเธเธฅเธฒเธชเน€เธฃเธตเธขเธเธชเธณเน€เธฃเนเธเนเธฅเนเธง!', 'success');

          }

          state.forceReloadGrid = true;

          const activePanel = document.querySelector('.nav-item.active')?.getAttribute('data-panel');

          window._forceDailyGridRefresh = true;
          window._forceTeacherGridRefresh = true;
          if (activePanel === 'daily_grid') loadDailyGrid(true);
          else loadRevenueLogs(true);
          loadTeacherSchedule(true); // background sync
          checkLowBalanceStudents();

        } else {

          showToast('เธเธฑเธเธ—เธถเธเธฅเนเธกเน€เธซเธฅเธง: ' + (res?.error || ''), 'error');

        }

      })

      .withFailureHandler(err => {

        showToast('เน€เธเธทเนเธญเธกเธ•เนเธญเธฅเนเธกเน€เธซเธฅเธง: ' + err.message, 'error');

      })

      .saveBatchClassLogs(logsToAdd, logsToUpdate, [], user);

  } catch (err) {

    console.error('Error in saveClassLog:', err);

    showToast('เน€เธเธดเธ”เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”: ' + err.message, 'error');

  }

}



function submitBatchClassLogs() {

  const role = state.currentUser ? (state.currentUser.role || '').toString().trim() : '';

  const isTeacher = (role === 'Teacher' || role === 'เธเธฃเธน');

  if (isTeacher) {

    showToast('เธเธธเธ“เนเธกเนเธกเธตเธชเธดเธ—เธเธดเนเนเธเธเธฒเธฃเธเธฑเธเธ—เธถเธเธเนเธญเธกเธนเธฅเธเธฅเธฒเธชเน€เธฃเธตเธขเธ', 'error');

    return;

  }

  

  if (modalState.newLogs.length === 0 && modalState.updatedLogs.length === 0 && modalState.deletedRows.length === 0) {

    showToast('เนเธกเนเธกเธตเธเธฒเธฃเน€เธเธฅเธตเนเธขเธเนเธเธฅเธเนเธ”เน เธ—เธตเนเธขเธฑเธเนเธกเนเนเธ”เนเธเธฑเธเธ—เธถเธ', 'info');

    closeClassLogModal();

    return;

  }

  

  // Close the modal immediately and save in background

  closeClassLogModal();

  showToast('เธเธณเธฅเธฑเธเธเธฑเธเธ—เธถเธเธเธฒเธฃเน€เธเธฅเธตเนเธขเธเนเธเธฅเธเธ—เธฑเนเธเธซเธกเธ”เนเธเน€เธเธทเนเธญเธเธซเธฅเธฑเธ...', 'info');

  const user = getLogUser();

  

  google.script.run

    .withSuccessHandler(res => {

      if (res && res.success) {

        showToast('เธเธฑเธเธ—เธถเธเธเธฒเธฃเน€เธเธฅเธตเนเธขเธเนเธเธฅเธเธ—เธฑเนเธเธซเธกเธ”เธชเธณเน€เธฃเนเธ!', 'success');

        const activePanel = document.querySelector('.nav-item.active')?.getAttribute('data-panel');

        if (activePanel === 'daily_grid') loadDailyGrid();

        else loadRevenueLogs();

        checkLowBalanceStudents();

      } else {

        showToast('เธเธฑเธเธ—เธถเธเธฅเนเธกเน€เธซเธฅเธง: ' + res.error, 'error');

      }

    })

    .withFailureHandler(err => {

      showToast('เน€เธเธทเนเธญเธกเธ•เนเธญเธฅเนเธกเน€เธซเธฅเธง: ' + err.message, 'error');

    })

    .saveBatchClassLogs(modalState.newLogs, modalState.updatedLogs, modalState.deletedRows, user);

}



function deleteClassLog(rowIndex) {

  const role = state.currentUser ? (state.currentUser.role || '').toString().trim() : '';

  const isTeacher = (role === 'Teacher' || role === 'เธเธฃเธน');

  if (isTeacher) {

    showToast('เธเธธเธ“เนเธกเนเธกเธตเธชเธดเธ—เธเธดเนเนเธเธเธฒเธฃเธฅเธเธเธฅเธฒเธชเน€เธฃเธตเธขเธ', 'error');

    return;

  }

  if (confirm('เธเธธเธ“เธ•เนเธญเธเธเธฒเธฃเธฅเธเธเธฑเธเธ—เธถเธเธเธฑเนเธงเนเธกเธเธชเธญเธเธเธฅเธฒเธชเธเธตเนเนเธเนเธซเธฃเธทเธญเนเธกเน?')) {

    setLoading(true, 'เธเธณเธฅเธฑเธเธฅเธเธเธฑเธเธ—เธถเธเธเธฑเนเธงเนเธกเธเธชเธญเธ...');

    const user = getLogUser();

    google.script.run

      .withSuccessHandler(res => {

        setLoading(false);

        if (res && res.success) {

          showToast('เธฅเธเธฃเธฒเธขเธเธฒเธฃเธชเธณเน€เธฃเนเธเนเธฅเนเธง', 'success');

          

          if (document.getElementById('class_modal').classList.contains('active')) {

            renderClassModalTodayList();

          }

          

          const activePanel = document.querySelector('.nav-item.active').getAttribute('data-panel');

          // Optimistic UI update
          state.classLogs = state.classLogs.filter(c => c.rowIndex !== rowIndex);
          if (activePanel === 'daily_grid') renderDailyGrid();
          else if (activePanel === 'teacher_schedule') renderTeacherScheduleGrid(document.getElementById('teacher_schedule_select').value);
          
          window._forceDailyGridRefresh = true;
          window._forceTeacherGridRefresh = true;
          if (activePanel === 'daily_grid') loadDailyGrid(true);
          else if (activePanel === 'teacher_schedule') loadTeacherSchedule(true);
          else loadRevenueLogs(true);
          
          checkLowBalanceStudents();

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



function loadTeacherSchedule(isSilent = false) {

  const teacher = document.getElementById('teacher_schedule_select').value;

  const container = document.getElementById('teacher_calendar_container');

  

  if (!teacher) {

    if (!isSilent) {

      container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 40px;">เธเธฃเธธเธ“เธฒเน€เธฅเธทเธญเธเธเธทเนเธญเธเธธเธ“เธเธฃเธนเธเธนเนเธชเธญเธเธ”เนเธฒเธเธเธ</div>`;

    }

    return;

  }

  

  if (!isSilent) {
    setLoading(true, 'เธเธณเธฅเธฑเธเธ”เธถเธเธ•เธฒเธฃเธฒเธเธชเธญเธเธเธธเธ“เธเธฃเธน ' + teacher + '...');
  }
  
  if (state.allClassLogsCache && !isSilent && window._forceTeacherGridRefresh !== true) {
    const data = state.allClassLogsCache;
    setTimeout(() => {
      setLoading(false);
      state.classLogs = data;
      state.teacherClasses = data.filter(c => 
        (c.teacherRegular && c.teacherRegular.toLowerCase().includes(teacher.toLowerCase().trim())) ||
        (c.teacherSub && c.teacherSub.toLowerCase().includes(teacher.toLowerCase().trim()))
      );
      renderTeacherScheduleGrid(teacher);
    }, 10);
    return;
  }
  window._forceTeacherGridRefresh = false;

  google.script.run
    .withSuccessHandler(data => {
      if (Array.isArray(data)) {
        state.allClassLogsCache = data;
      }

      if (!isSilent) setLoading(false);

      if (Array.isArray(data)) {

        state.classLogs = data; // Store all so showEditClassLogModal can find it!

        state.teacherClasses = data.filter(c => 

          (c.teacherRegular && c.teacherRegular.toLowerCase().includes(teacher.toLowerCase().trim())) ||

          (c.teacherSub && c.teacherSub.toLowerCase().includes(teacher.toLowerCase().trim()))

        );

        

        renderTeacherScheduleGrid(teacher);

      } else {

        if (!isSilent) showToast('เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เธ”เธถเธเธเนเธญเธกเธนเธฅเธ•เธฒเธฃเธฒเธเน€เธฃเธตเธขเธเธเธฃเธนเนเธ”เน: ' + (data ? data.error : 'unknown'), 'error');

      }

    })

    .withFailureHandler(err => {

      if (!isSilent) setLoading(false);

      if (!isSilent) showToast('เน€เธเธทเนเธญเธกเธ•เนเธญเธเธดเธ”เธเธฅเธฒเธ”: ' + err.message, 'error');

    })

    .getClassLogs('', getLogUser()); // Fetch ALL records

}



function renderTeacherScheduleGrid(teacher) {
  const container = document.getElementById('teacher_calendar_container');
  container.innerHTML = '';
  container.style.display = 'block';
  container.style.gridTemplateColumns = 'none';
  container.className = '';

  if (!state.teacherClasses || state.teacherClasses.length === 0) {
    container.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 40px;">เนเธกเนเธกเธตเธเนเธญเธกเธนเธฅเธ•เธฒเธฃเธฒเธเธชเธญเธเธเธญเธเธเธธเธ“เธเธฃเธนเธ—เนเธฒเธเธเธตเน</div>';
    return;
  }

  function parseTimeToHours(t) {
    if (!t) return null;
    var s = String(t).replace(':', '.').replace(/\s/g, '');
    var parts = s.split('.');
    var h = parseInt(parts[0], 10) || 0;
    var m = parseInt(parts[1], 10) || 0;
    return h + m / 60;
  }

  function parseSheetDate(dateStr) {
    if (!dateStr) return { sortKey: '0000-00-00' };
    var parts = dateStr.split('/');
    if (parts.length === 3) {
      var d = parseInt(parts[0], 10);
      var m = parseInt(parts[1], 10);
      var y = parseInt(parts[2], 10);
      var sortKey = y + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0');
      return { sortKey: sortKey };
    }
    return { sortKey: '0000-00-00' };
  }

  // Group by date
  var groupedByDate = {};
  state.teacherClasses.forEach(function(log) {
    var sortKey = parseSheetDate(log.date).sortKey;
    if (!groupedByDate[sortKey]) {
      groupedByDate[sortKey] = { dateStr: log.date, sortKey: sortKey, classes: [] };
    }
    groupedByDate[sortKey].classes.push(log);
  });

  var sortedDates = Object.values(groupedByDate).sort(function(a, b) {
    return a.sortKey.localeCompare(b.sortKey);
  });

  // Timeline constants - match admin daily grid exactly
  var HOUR_START = 8;
  var HOUR_END = 22;
  var TOTAL_HOURS = HOUR_END - HOUR_START;
  var COL_WIDTH = 180;
  var TIMELINE_WIDTH = TOTAL_HOURS * COL_WIDTH;
  var ROW_HEADER_WIDTH = 140;
  var CARD_ROW_HEIGHT = 120;

  // Build header
  var headerCols = '';
  for (var h = HOUR_START; h <= HOUR_END; h++) {
    var label = String(h).padStart(2, '0') + '.00';
    headerCols += '<div style="position:absolute; left:' + ((h - HOUR_START) * COL_WIDTH) + 'px; width:' + COL_WIDTH + 'px; text-align:center; font-weight:700; font-size:0.72rem; color:var(--text-main); padding:8px 0; box-sizing:border-box; border-right:1px dashed #e2e8f0;">' + label + '</div>';
  }

  var html = '<div style="width:100%; height:65vh; overflow:auto; border:1px solid var(--border-color); border-radius:8px; background:#fff; box-shadow:0 2px 4px rgba(0,0,0,0.02);">';

  // Sticky header row
  html += '<div style="position:sticky; top:0; z-index:20; display:flex; min-width:' + (ROW_HEADER_WIDTH + TIMELINE_WIDTH) + 'px; background:#f8fafc; border-bottom:2px solid var(--border-color);">';
  html += '<div style="position:sticky; left:0; z-index:30; min-width:' + ROW_HEADER_WIDTH + 'px; width:' + ROW_HEADER_WIDTH + 'px; padding:8px 10px; font-weight:700; font-size:0.72rem; color:var(--text-main); border-right:2px solid var(--border-color); background:#f8fafc; display:flex; align-items:center;">เธงเธฑเธเธ—เธตเนเธชเธญเธ</div>';
  html += '<div style="position:relative; width:' + TIMELINE_WIDTH + 'px; height:36px;">' + headerCols + '</div>';
  html += '</div>';

  // Data rows
  sortedDates.forEach(function(dateGroup) {
    var cards = [];
    dateGroup.classes.forEach(function(c) {
      var sh = parseTimeToHours(c.timeStart);
      var eh = parseTimeToHours(c.timeEnd);
      if (sh === null) return;
      if (eh === null || eh <= sh) eh = sh + 1;
      cards.push({ c: c, sh: sh, eh: eh });
    });
    cards.sort(function(a, b) { return a.sh - b.sh || a.eh - b.eh; });

    // Overlap stacking
    var rows = [];
    cards.forEach(function(card) {
      var placed = false;
      for (var r = 0; r < rows.length; r++) {
        var conflict = false;
        for (var k = 0; k < rows[r].length; k++) {
          if (card.sh < rows[r][k].eh && card.eh > rows[r][k].sh) {
            conflict = true;
            break;
          }
        }
        if (!conflict) {
          rows[r].push(card);
          card.row = r;
          placed = true;
          break;
        }
      }
      if (!placed) {
        card.row = rows.length;
        rows.push([card]);
      }
    });

    var maxRows = rows.length || 1;
    var rowHeight = maxRows * CARD_ROW_HEIGHT + 10;

    html += '<div style="display:flex; min-width:' + (ROW_HEADER_WIDTH + TIMELINE_WIDTH) + 'px; border-bottom:1px solid var(--border-color);">';

    // Left sticky date column
    var thDateStr = typeof formatDateTimeToThaiLong === 'function' ? formatDateTimeToThaiLong(dateGroup.dateStr) : dateGroup.dateStr;
    html += '<div style="position:sticky; left:0; z-index:10; min-width:' + ROW_HEADER_WIDTH + 'px; width:' + ROW_HEADER_WIDTH + 'px; padding:10px 8px; border-right:2px solid var(--border-color); background:#fff; box-shadow:2px 0 5px -2px rgba(0,0,0,0.05); display:flex; flex-direction:column; align-items:center; justify-content:center;">';
    html += '<div style="font-size:0.78rem; font-weight:700; color:var(--color-primary-hover); text-align:center; line-height:1.3;">' + thDateStr + '</div>';
    html += '<div style="font-size:0.6rem; color:var(--text-muted); margin-top:3px; background:rgba(0,0,0,0.04); padding:1px 5px; border-radius:4px;">' + cards.length + ' เธเธฅเธฒเธช</div>';
    html += '</div>';

    // Timeline area
    html += '<div style="position:relative; width:' + TIMELINE_WIDTH + 'px; min-height:' + rowHeight + 'px;">';

    // Background grid lines
    for (var gh = HOUR_START; gh <= HOUR_END; gh++) {
      html += '<div style="position:absolute; left:' + ((gh - HOUR_START) * COL_WIDTH) + 'px; top:0; bottom:0; width:1px; background:' + (gh === HOUR_END ? 'transparent' : '#f0f0f0') + ';"></div>';
    }

    // Cards - same style as admin daily grid
    cards.forEach(function(cardObj) {
      var c = cardObj.c;
      var leftPx = (cardObj.sh - HOUR_START) * COL_WIDTH + 2;
      var widthPx = (cardObj.eh - cardObj.sh) * COL_WIDTH - 4;
      var topPx = cardObj.row * CARD_ROW_HEIGHT + 4;

      // Color logic
      var isTeacherConfirmed = c.teacherConfirmed > 0;
      var cardBg = 'background:#fff;';
      var cardBorder = 'border:1px solid var(--border-color);';
      if (isTeacherConfirmed) {
        cardBg = 'background:rgba(25,135,84,0.08);';
        cardBorder = 'border:1.5px solid rgba(25,135,84,0.4);';
      } else {
        var subjStr = String(c.subject || '');
        var isPrivate = subjStr.includes('เน€เธ”เธตเนเธขเธง') || subjStr.includes('เธขเนเธญเธข');
        if (!isPrivate) {
          cardBg = 'background:rgba(56,189,248,0.08);';
          cardBorder = 'border:1.5px solid rgba(56,189,248,0.4);';
        }
      }

      // Branch color for left border
      var cleanRoom = (c.roomBranch || '').toLowerCase();
      var borderLeftColor = 'var(--border-color)';
      if (cleanRoom.includes('เธชเธฒเธเธฒ 1') || cleanRoom.includes('เธชเธฒเธเธฒ1')) {
        borderLeftColor = 'var(--color-success)';
      } else if (cleanRoom.includes('เธชเธฒเธเธฒ 2') || cleanRoom.includes('เธชเธฒเธเธฒ2')) {
        borderLeftColor = '#3b82f6';
      } else if (cleanRoom.includes('เธชเธฒเธเธฒ 3') || cleanRoom.includes('เธชเธฒเธเธฒ3')) {
        borderLeftColor = '#f59e0b';
      } else if (cleanRoom.includes('เธญเธญเธเนเธฅเธเน') || cleanRoom.includes('online')) {
        borderLeftColor = '#8b5cf6';
      }
      if (isTeacherConfirmed) borderLeftColor = '#15803d';

      // Attendance
      var attArr = [];
      attArr.push('เธชเธ”:' + (c.isPresentLive||0));
      attArr.push('เธญเธญเธ:' + (c.isPresentOnline||0));
      attArr.push('เธฅเธฒ:' + (c.isLeave||0));
      attArr.push('เธเธ”:' + (c.isMakeup||0));
      attArr.push('เธเธฒเธ”:' + (c.isAbsent||0));

      var confirmedBadge = isTeacherConfirmed ? '<div style="font-weight:bold; color:#2e7d32; font-size:0.58rem;">โ… เธขเธทเธเธขเธฑเธเนเธฅเนเธง</div>' : '';

      // Sub teacher check
      var isSub = c.teacherSub && c.teacherSub.toLowerCase().includes(teacher.toLowerCase().trim());
      var roleLabel = isSub ? '<span style="color:var(--color-danger); font-weight:bold;">[เธชเธญเธเนเธ—เธ]</span>' : '';

      // Room/device text
      var displayRoomText = c.roomBranch || '-';
      var displayDeviceText = '';
      var deviceMatch = displayRoomText.match(/(?:ipad|zoom).*/i);
      if (deviceMatch) {
        displayDeviceText = deviceMatch[0];
        displayRoomText = displayRoomText.replace(deviceMatch[0], '').trim();
      }

      html += '<div style="position:absolute; left:' + leftPx + 'px; top:' + topPx + 'px; width:' + widthPx + 'px; height:' + (CARD_ROW_HEIGHT - 8) + 'px; ' + cardBg + ' ' + cardBorder + ' border-left:4px solid ' + borderLeftColor + '; border-radius:6px; padding:4px 6px; font-size:0.62rem; box-sizing:border-box; display:flex; flex-direction:column; justify-content:space-between; overflow:hidden; box-shadow:0 1px 2px rgba(0,0,0,0.04); cursor:default;">';

      // Top: subject + time
      html += '<div>';
      html += '<div style="font-weight:700; font-size:0.68rem; color:var(--text-main); line-height:1.2; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="' + (c.subject||'').replace(/"/g,'&quot;') + '">' + formatSubjectName(c.subject) + ' ' + roleLabel + '</div>';
      html += '<span style="font-size:0.6rem; font-weight:bold; color:var(--color-primary-hover); background:rgba(0,132,255,0.06); padding:0px 5px; border-radius:10px; display:inline-block; margin-top:1px;">' + cleanTimeStr(c.timeStart) + ' - ' + cleanTimeStr(c.timeEnd) + '</span>';
      html += '</div>';

      // Middle: details
      html += '<div style="font-size:0.58rem; color:var(--text-muted); line-height:1.25; border-top:1px dashed var(--border-color); padding-top:2px; margin-top:2px; overflow:hidden;">';
      html += '<div style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">๐ข ' + displayRoomText + '</div>';
      if (displayDeviceText) html += '<div style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:var(--color-primary-hover);">๐’ป ' + displayDeviceText + '</div>';
      html += '<div style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"><b>เธเธฃเธนเธเธฃเธฐเธเธณ:</b> ' + (c.teacherRegular||'-') + '</div>';
      html += '<div style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"><b>เธเธฃเธนเนเธ—เธ:</b> ' + (c.teacherSub ? '<b>' + c.teacherSub + '</b>' : '-') + '</div>';
      html += confirmedBadge;
      html += '<div style="color:var(--color-primary-hover); font-size:0.55rem;">๐‘ฅ ' + attArr.join(' ') + '</div>';
      if (c.note) html += '<div style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-style:italic; color:#64748b;">๐“ ' + c.note + '</div>';
      html += '</div>';

      // Bottom: confirm + edit
      html += '<div style="display:flex; justify-content:flex-end; align-items:center; border-top:1px dashed rgba(0,0,0,0.06); padding-top:2px; margin-top:2px; gap:2px;" onclick="event.stopPropagation();">';
      if (isTeacherConfirmed) {
        html += '<button type="button" onclick="toggleDailyGridConfirm(' + c.rowIndex + ',false)" style="font-size:0.58rem; padding:1px 5px; background:#15803d; color:white; font-weight:700; border-radius:10px; border:none; cursor:pointer;">โ“ เธขเธทเธเธขเธฑเธ</button>';
      } else {
        html += '<button type="button" onclick="toggleDailyGridConfirm(' + c.rowIndex + ',true)" style="font-size:0.58rem; padding:1px 5px; background:#e2e8f0; color:#475569; font-weight:700; border-radius:10px; border:none; cursor:pointer;">เธฃเธญเธขเธทเธเธขเธฑเธ</button>';
      }
      html += '<button type="button" onclick="showEditClassLogModal(' + c.rowIndex + ')" style="padding:1px 3px; font-size:0.58rem; border:1px solid var(--border-color); background:#f8fafc; border-radius:3px; cursor:pointer; height:auto;" title="เนเธเนเนเธ">โ๏ธ</button>';
      html += '</div>';

      html += '</div>'; // end card

    });

    html += '</div>'; // end timeline area
    html += '</div>'; // end row
  });

  html += '</div>'; // end scroll container

  container.innerHTML = html;
}

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

    .getTeachersDB(getLogUser());

}



function renderTeacherProfilesTable(teachers) {

  const tbody = document.getElementById('teacher_profiles_tbody');

  tbody.innerHTML = '';

  

  teachers.forEach(t => {

    const tr = document.createElement('tr');

    const compVal = t.compensation || '150';

    tr.innerHTML = `

      <td style="font-weight:600;">${t.nickname}</td>

      <td>${t.fullName || '-'}</td>

      <td>${t.school || '-'}</td>

      <td>${formatPhone(t.phone) || '-'}</td>

      <td>${t.subjects || '-'}</td>

      <td>${t.bank || '-'}</td>

      <td>${t.accountNumber || '-'}</td>

      <td style="text-align: right; font-weight: 600; color: var(--color-primary-hover);">เธฟ${parseFloat(compVal).toLocaleString()}</td>

      <td>

        <button class="btn btn-secondary btn-icon" onclick="showEditTeacherModal('${t.nickname}', '${t.fullName}', '${t.school}', '${formatPhone(t.phone)}', '${t.subjects}', '${t.bank}', '${t.accountNumber}', '${compVal}')">โ๏ธ</button>

      </td>

    `;

    tbody.appendChild(tr);

  });

  

  if (teachers.length === 0) {

    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 40px;">เนเธกเนเธเธเธเธฃเธฐเธงเธฑเธ•เธดเธญเธฒเธเธฒเธฃเธขเนเนเธเธฃเธฐเธเธ</td></tr>`;

  }

}



function switchTeacherSubTab(tabName) {

  var tabProfiles = document.getElementById('tab_t_profiles');

  var tabCalc = document.getElementById('tab_t_calc');

  var panelProfiles = document.getElementById('teacher_subpanel_profiles');

  var panelCalc = document.getElementById('teacher_subpanel_calc');



  if (tabProfiles) tabProfiles.classList.remove('active');

  if (tabCalc) tabCalc.classList.remove('active');

  if (panelProfiles) panelProfiles.style.display = 'none';

  if (panelCalc) panelCalc.style.display = 'none';

  

  if (tabName === 'profiles') {

    if (tabProfiles) tabProfiles.classList.add('active');

    if (panelProfiles) panelProfiles.style.display = 'block';

    loadTeacherProfiles();

  } else {

    if (tabCalc) tabCalc.classList.add('active');

    if (panelCalc) panelCalc.style.display = 'block';

  }

}



function showAddEmployeeModal() {

  closeAllModals();

  document.getElementById('emp_username').value = '';

  document.getElementById('emp_password').value = '';

  document.getElementById('emp_role').value = 'Staff';

  document.getElementById('emp_nickname').value = '';

  document.getElementById('emp_fullname').value = '';

  document.getElementById('emp_phone').value = '';

  if(document.getElementById('add_employee_modal')) document.getElementById('add_employee_modal').style.display = 'flex';

}



function submitAddEmployee(e) {

  e.preventDefault();

  const data = {

    username: document.getElementById('emp_username').value.trim(),

    password: document.getElementById('emp_password').value.trim(),

    role: document.getElementById('emp_role').value,

    nickname: document.getElementById('emp_nickname').value.trim(),

    fullName: document.getElementById('emp_fullname').value.trim(),

    phone: document.getElementById('emp_phone').value.trim()

  };

  if (!data.username || !data.password) {

    showToast('เธเธฃเธธเธ“เธฒเธเธฃเธญเธเธเธทเนเธญเธเธนเนเนเธเนเนเธฅเธฐเธฃเธซเธฑเธชเธเนเธฒเธ', 'error');

    return;

  }

  setLoading(true, 'เธเธณเธฅเธฑเธเน€เธเธดเนเธกเธเธเธฑเธเธเธฒเธ...');

  google.script.run

    .withSuccessHandler(res => {

      setLoading(false);

      if (res && res.success) {

        showToast('เน€เธเธดเนเธกเธเธเธฑเธเธเธฒเธเธชเธณเน€เธฃเนเธ!', 'success');

        closeAllModals();

        loadEmployeeList();

      } else {

        showToast('เน€เธเธดเธ”เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”: ' + (res ? res.error : 'unknown'), 'error');

      }

    })

    .withFailureHandler(err => {

      setLoading(false);

      showToast('เน€เธเธทเนเธญเธกเธ•เนเธญเธฅเนเธกเน€เธซเธฅเธง: ' + err.message, 'error');

    })

    .addEmployee(data, getLogUser());

}



function loadEmployeeList() {

  google.script.run

    .withSuccessHandler(res => {

      const tbody = document.getElementById('employee_list_tbody');

      if (!tbody) return;

      tbody.innerHTML = '';

      if (res && Array.isArray(res)) {

        res.forEach(u => {

          const tr = document.createElement('tr');

          tr.innerHTML = `

            <td>${u.username || ''}</td>

            <td><span class="badge ${u.role === 'Admin' ? 'badge-primary' : u.role === 'Teacher' ? 'badge-warning' : 'badge-success'}">${u.role || 'Staff'}</span></td>

            <td>${u.nickname || '-'}</td>

            <td>${u.fullName || '-'}</td>

            <td>${u.phone || '-'}</td>

            <td style="text-align: center;">

              <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.75rem;" onclick="showEditEmployeePasswordModal('${u.username}')">๐”‘ เนเธเนเนเธเธฃเธซเธฑเธช</button>

            </td>

          `;

          tbody.appendChild(tr);

        });

        if (res.length === 0) {

          tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:30px;">เนเธกเนเธเธเธเนเธญเธกเธนเธฅเธเธเธฑเธเธเธฒเธ</td></tr>';

        }

      }

    })

    .withFailureHandler(err => {

      console.error('loadEmployeeList error:', err);

    })

    .getEmployeeList(getLogUser());

}



function showEditEmployeePasswordModal(username) {

  closeAllModals();

  document.getElementById('edit_emp_username').value = username;

  document.getElementById('edit_emp_password').value = '';

  if(document.getElementById('edit_employee_password_modal')) document.getElementById('edit_employee_password_modal').style.display = 'flex';

}



function submitEditEmployeePassword(e) {

  e.preventDefault();

  const username = document.getElementById('edit_emp_username').value;

  const newPassword = document.getElementById('edit_emp_password').value.trim();

  

  if (!newPassword) {

    showToast('เธเธฃเธธเธ“เธฒเธเธฃเธญเธเธฃเธซเธฑเธชเธเนเธฒเธเนเธซเธกเน', 'error');

    return;

  }

  

  setLoading(true, 'เธเธณเธฅเธฑเธเน€เธเธฅเธตเนเธขเธเธฃเธซเธฑเธชเธเนเธฒเธเธเธเธฑเธเธเธฒเธ...');

  google.script.run

    .withSuccessHandler(res => {

      setLoading(false);

      if (res && res.success) {

        showToast('เน€เธเธฅเธตเนเธขเธเธฃเธซเธฑเธชเธเนเธฒเธเธเธญเธเธเธเธฑเธเธเธฒเธเน€เธฃเธตเธขเธเธฃเนเธญเธข!', 'success');

        closeAllModals();

      } else {

        showToast('เน€เธเธดเธ”เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”: ' + (res ? res.error : 'unknown'), 'error');

      }

    })

    .withFailureHandler(err => {

      setLoading(false);

      showToast('เน€เธเธทเนเธญเธกเธ•เนเธญเธฅเนเธกเน€เธซเธฅเธง: ' + err.message, 'error');

    })

    .changeEmployeePasswordByAdmin(username, newPassword, getLogUser());

}



function showAddTeacherModal() {

  document.getElementById('teacher_form').reset();

  document.getElementById('t_compensation').value = '150';

  document.getElementById('teacher_modal_title').innerText = 'เน€เธเธดเนเธกเธเธฃเธฐเธงเธฑเธ•เธดเธเธธเธ“เธเธฃเธนเนเธซเธกเน';

  document.getElementById('t_nickname').readOnly = false;

  document.getElementById('teacher_modal').classList.add('active');

}



function showEditTeacherModal(nickname, fullName, school, phone, subjects, bank, accountNumber, compensation) {

  document.getElementById('teacher_form').reset();

  document.getElementById('teacher_modal_title').innerText = 'เนเธเนเนเธเธเธฃเธฐเธงเธฑเธ•เธดเธเธธเธ“เธเธฃเธน';

  document.getElementById('t_nickname').value = nickname;

  document.getElementById('t_nickname').readOnly = true; // Nickname is primary key

  document.getElementById('t_fullname').value = fullName !== '-' ? fullName : '';

  document.getElementById('t_school').value = school !== '-' ? school : '';

  document.getElementById('t_phone').value = phone !== '-' ? phone : '';

  document.getElementById('t_subjects').value = subjects !== '-' ? subjects : '';

  document.getElementById('t_bank').value = bank !== '-' ? bank : '';

  document.getElementById('t_account_number').value = accountNumber !== '-' ? accountNumber : '';

  document.getElementById('t_compensation').value = compensation && compensation !== '-' ? compensation : '150';

  

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

    compensation: parseFloat(document.getElementById('t_compensation').value) || 150

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

function loadStaffSalarySummary() {

  const yearEl = document.getElementById('staff_summary_year');

  const monthEl = document.getElementById('staff_summary_month');

  const typeEl = document.getElementById('staff_summary_account_type');

  if (!yearEl || !monthEl) return;

  

  const year = parseInt(yearEl.value);

  const month = parseInt(monthEl.value);

  const filterType = typeEl ? typeEl.value : 'all';

  

  const tbody = document.getElementById('staff_summary_tbody');

  if (tbody) {

    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 30px;">เธเธณเธฅเธฑเธเธ”เธถเธเธเนเธญเธกเธนเธฅ...</td></tr>`;

  }

  

  // Call backend to fetch all monthly pay data (including bank info and unconfirmed but with hours)

  google.script.run

    .withSuccessHandler(res => {

      if (!res || !res.success) {

        showToast('เธ”เธถเธเธเนเธญเธกเธนเธฅเธชเธฃเธธเธเธฃเธฒเธขเนเธ”เนเธฅเนเธกเน€เธซเธฅเธง: ' + (res ? res.error : 'เนเธกเนเธเธเธเนเธญเธกเธนเธฅ'), 'error');

        if (tbody) {

          tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-danger); padding: 30px;">เธ”เธถเธเธเนเธญเธกเธนเธฅเธฅเนเธกเน€เธซเธฅเธง</td></tr>`;

        }

        return;

      }

      

      const allData = res.data || [];

      

      // Filter 1: Only teachers with hours/classes > 0

      let filteredData = allData.filter(item => item.totalClasses > 0);

      

      // Filter 2: Account type

      if (filterType !== 'all') {

        filteredData = filteredData.filter(item => item.accountType === filterType);

      }

      

      // Sum totals

      let totalConfirmedPay = 0;

      let confirmedCount = 0;

      

      // Render table rows

      let html = '';

      if (filteredData.length === 0) {

        html = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 30px;">เนเธกเนเธเธเธเนเธญเธกเธนเธฅเธ•เธฒเธกเน€เธเธทเนเธญเธเนเธเธ—เธตเนเน€เธฅเธทเธญเธ</td></tr>`;

      } else {

        filteredData.forEach(match => {

          const isConfirmed = match.isConfirmed;

          

          let payText = '-';

          let deduction = parseFloat(match.guaranteeDeduction || 0);

          let deductionText = deduction > 0 ? '-เธฟ' + Math.round(deduction).toLocaleString() : 'เธฟ0';

          let timeText = '-';

          let statusHtml = '<span style="color: var(--text-muted); font-weight: 500;">โณ เธฃเธญเธขเธทเธเธขเธฑเธ</span>';

          

          if (isConfirmed) {

            confirmedCount++;

            totalConfirmedPay += parseFloat(match.totalPay || 0);

            payText = 'เธฟ' + Math.round(parseFloat(match.totalPay)).toLocaleString();

            

            const confirmedDate = new Date(match.confirmedAt);

            if (!isNaN(confirmedDate.getTime())) {

              const pad = (n) => n.toString().padStart(2, '0');

              const d = pad(confirmedDate.getDate());

              const mo = pad(confirmedDate.getMonth() + 1);

              const y = confirmedDate.getFullYear() + 543;

              const h = pad(confirmedDate.getHours());

              const mi = pad(confirmedDate.getMinutes());

              timeText = `${d}/${mo}/${y} ${h}:${mi}`;

            } else {

              timeText = match.confirmedAt;

            }

            statusHtml = '<span style="color: var(--color-success); font-weight: 700;">โ”๏ธ เธขเธทเธเธขเธฑเธเนเธฅเนเธง</span>';

          }

          

          html += `

            <tr style="height: 38px;">

              <td style="font-weight: 600; white-space: nowrap; padding: 4px 8px;">${match.teacherName || '-'}</td>

              <td style="color: var(--text-muted); font-size: 0.85rem; white-space: nowrap; padding: 4px 8px;">${match.bank || '-'}</td>

              <td style="color: var(--text-muted); font-size: 0.85rem; font-family: monospace; white-space: nowrap; padding: 4px 8px;">${match.accountNumber || '-'}</td>

              <td style="color: var(--text-muted); white-space: nowrap; padding: 4px 8px;">${getMonthName(month)}</td>

              <td style="color: var(--text-muted); white-space: nowrap; padding: 4px 8px;">${year + 543}</td>

              <td style="text-align: right; font-weight: 600; color: var(--color-danger); white-space: nowrap; padding: 4px 8px;">${deductionText}</td>

              <td style="text-align: right; font-weight: 700; color: ${isConfirmed ? 'var(--color-success)' : 'var(--text-muted)'}; white-space: nowrap; padding: 4px 8px;">${payText}</td>

              <td style="font-size: 0.8rem; color: var(--text-muted); white-space: nowrap; padding: 4px 8px;">${timeText}</td>

              <td style="text-align: center; font-size: 0.82rem; white-space: nowrap; padding: 4px 8px;">${statusHtml}</td>

            </tr>

          `;

        });

      }

      

      if (tbody) tbody.innerHTML = html;

      

      // Update banners

      const totalPayEl = document.getElementById('staff_summary_total_confirmed_pay');

      if (totalPayEl) {

        totalPayEl.innerText = 'เธฟ' + Math.round(totalConfirmedPay).toLocaleString();

      }

      

      const countEl = document.getElementById('staff_summary_confirmed_count');

      if (countEl) {

        countEl.innerText = `${confirmedCount} / ${filteredData.length} เธเธ`;

      }

    })

    .withFailureHandler(err => {

      showToast('เธเธฒเธฃเน€เธเธทเนเธญเธกเธ•เนเธญเธเธฒเธเธเนเธญเธกเธนเธฅเธฅเนเธกเน€เธซเธฅเธง: ' + err.message, 'error');

      if (tbody) {

        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-danger); padding: 30px;">เธเธฒเธฃเน€เธเธทเนเธญเธกเธ•เนเธญเธฅเนเธกเน€เธซเธฅเธง</td></tr>`;

      }

    })

    .getAllTeachersMonthlyPay(year, month);

}



function printStaffSalarySummary() {

  const panel = document.getElementById('staff_salary_summary_panel');

  if (!panel) return;

  

  const typeEl = document.getElementById('staff_summary_account_type');

  const filterType = typeEl ? typeEl.options[typeEl.selectedIndex].text : 'เธ—เธฑเนเธเธซเธกเธ”';

  const monthEl = document.getElementById('staff_summary_month');

  const monthText = monthEl ? monthEl.options[monthEl.selectedIndex].text : '';

  const yearEl = document.getElementById('staff_summary_year');

  const yearText = yearEl ? (parseInt(yearEl.value) + 543).toString() : '';



  const printWindow = window.open('', '_blank');

  

  // Clone table

  const tableResponsive = panel.querySelector('.table-responsive');

  if (!tableResponsive) {

    showToast('เนเธกเนเธเธเธเนเธญเธกเธนเธฅเธ•เธฒเธฃเธฒเธเธชเธณเธซเธฃเธฑเธเธเธดเธกเธเน', 'error');

    return;

  }

  const tableHtml = tableResponsive.innerHTML;

  

  const css = `

    <style>

      body { font-family: 'Sarabun', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #333; }

      h2 { text-align: center; margin-bottom: 5px; }

      h3 { text-align: center; margin-top: 0; color: #666; font-weight: normal; margin-bottom: 20px; }

      table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }

      th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }

      th { background-color: #f8f9fa; font-weight: bold; }

      td[style*="text-align: right"] { text-align: right; }

      td[style*="text-align: center"] { text-align: center; }

      .print-footer { margin-top: 30px; text-align: right; font-size: 12px; color: #777; }

      @media print {

        body { -webkit-print-color-adjust: exact; padding: 0; }

        .print-footer { position: fixed; bottom: 0; right: 0; }

      }

    </style>

  `;

  

  printWindow.document.write('<html><head><title>เธชเธฃเธธเธเธฃเธฒเธขเนเธ”เนเธเธฃเธน</title>' + css + '</head><body>');

  printWindow.document.write('<h2>เธฃเธฒเธขเธเธฒเธเธชเธฃเธธเธเธฃเธฒเธขเนเธ”เนเธเธฃเธน - ' + filterType + '</h2>');

  printWindow.document.write('<h3>เธเธฃเธฐเธเธณเน€เธ”เธทเธญเธ ' + monthText + ' เธเธต ' + yearText + '</h3>');

  printWindow.document.write(tableHtml);

  printWindow.document.write('<div class="print-footer">เธเธดเธกเธเนเน€เธกเธทเนเธญ: ' + new Date().toLocaleString('th-TH') + '</div>');

  printWindow.document.write('</body></html>');

  

  printWindow.document.close();

  printWindow.focus();

  setTimeout(() => {

    printWindow.print();

    printWindow.close();

  }, 500);

}



function getMonthName(m) {

  const monthNames = [

    'เธกเธเธฃเธฒเธเธก', 'เธเธธเธกเธ เธฒเธเธฑเธเธเน', 'เธกเธตเธเธฒเธเธก', 'เน€เธกเธฉเธฒเธขเธ',

    'เธเธคเธฉเธ เธฒเธเธก', 'เธกเธดเธ–เธธเธเธฒเธขเธ', 'เธเธฃเธเธเธฒเธเธก', 'เธชเธดเธเธซเธฒเธเธก',

    'เธเธฑเธเธขเธฒเธขเธ', 'เธ•เธธเธฅเธฒเธเธก', 'เธเธคเธจเธเธดเธเธฒเธขเธ', 'เธเธฑเธเธงเธฒเธเธก'

  ];

  return monthNames[m - 1] || '';

}



function runTeacherPayCalculation() {

  handleStaffPayrollFilterChange();

}



function handleStaffPayrollFilterChange() {

  const teacherSelect = document.getElementById('calc_teacher_select');

  if (!teacherSelect) return;

  const teacher = teacherSelect.value;

  

  if (!teacher || teacher.includes('เน€เธฅเธทเธญเธเธเธฃเธน')) {

    if(document.getElementById('staff_yearly_summary_banner')) document.getElementById('staff_yearly_summary_banner').style.display = 'none';

    if(document.getElementById('calc_result_card')) document.getElementById('calc_result_card').style.display = 'none';

    showToast('เธเธฃเธธเธ“เธฒเธฃเธฐเธเธธเธเธทเนเธญเธเธฃเธนเน€เธเธทเนเธญเธเธฃเธฐเธกเธงเธฅเธเธฅ', 'warning');

    return;

  }

  

  const yearPicker = document.getElementById('calc_year_picker');

  if (!yearPicker) return;

  const selectedYear = parseInt(yearPicker.value);

  

  const monthPicker = document.getElementById('calc_month_picker');

  const selectedMonth = monthPicker ? parseInt(monthPicker.value) : 1;

  

  setLoading(true, 'เธเธณเธฅเธฑเธเธเธณเธเธงเธ“เธฃเธฒเธขเนเธ”เนเธเธธเธ“เธเธฃเธนเธ—เธฑเนเธเธซเธกเธ” 12 เน€เธ”เธทเธญเธ...');

  

  if(document.getElementById('staff_yearly_summary_banner')) document.getElementById('staff_yearly_summary_banner').style.display = 'none';

  if(document.getElementById('calc_result_card')) document.getElementById('calc_result_card').style.display = 'none';

  

  // Reset yearly values

  document.getElementById('staff_yearly_total_pay').innerText = 'เธฟ0';

  document.getElementById('staff_yearly_total_hours').innerText = '0 เธเธก.';

  document.getElementById('staff_yearly_total_classes').innerText = '0 เธเธฅเธฒเธช';

  

  google.script.run

    .withSuccessHandler(res => {

      setLoading(false);

      if (!res || !res.success || !res.months) {

        showToast('เน€เธเธดเธ”เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”เนเธเธเธฒเธฃเธเธณเธเธงเธ“เน€เธเธดเธเน€เธ”เธทเธญเธ: ' + (res ? res.error : 'เนเธกเนเธเธเธเนเธญเธกเธนเธฅ'), 'error');

        return;

      }

      

      // Save in state

      state.staffYearlySalaryData = res;

      

      // Calculate sums across all 12 months

      let yearlyPay = 0;

      let yearlyHours = 0;

      let yearlyClasses = 0;

      

      for (let m = 1; m <= 12; m++) {

        const monthRes = res.months[m];

        if (monthRes && monthRes.success) {

          yearlyPay += monthRes.totalPay || 0;

          yearlyHours += monthRes.totalHours || 0;

          yearlyClasses += monthRes.totalClasses || 0;

        }

      }

      

      // Update yearly banner displays

      document.getElementById('staff_yearly_total_pay').innerText = 'เธฟ' + Math.round(yearlyPay).toLocaleString();

      document.getElementById('staff_yearly_total_hours').innerText = (Math.round(yearlyHours * 100) / 100).toLocaleString() + ' เธเธก.';

      document.getElementById('staff_yearly_total_classes').innerText = yearlyClasses.toLocaleString() + ' เธเธฅเธฒเธช';

      

      if(document.getElementById('staff_yearly_summary_banner')) document.getElementById('staff_yearly_summary_banner').style.display = 'block';

      

      // Load selected month

      handleStaffPayrollMonthChange();

    })

    .withFailureHandler(err => {

      setLoading(false);

      console.error("Staff yearly calculation failed:", err);

      showToast('เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เน€เธเธทเนเธญเธกเธ•เนเธญเน€เธเธดเธฃเนเธเน€เธงเธญเธฃเนเนเธ”เน: ' + err.message, 'error');

    })

    .calculateTeacherYearlyPay(teacher, selectedYear, getLogUser());

}



function handleStaffPayrollMonthChange() {

  if (!state.staffYearlySalaryData || !state.staffYearlySalaryData.months) return;

  

  const monthPicker = document.getElementById('calc_month_picker');

  if (!monthPicker) return;

  const m = parseInt(monthPicker.value);

  

  const monthRes = state.staffYearlySalaryData.months[m];

  if (monthRes) {

    const monthNames = [

      'เธกเธเธฃเธฒเธเธก', 'เธเธธเธกเธ เธฒเธเธฑเธเธเน', 'เธกเธตเธเธฒเธเธก', 'เน€เธกเธฉเธฒเธขเธ',

      'เธเธคเธฉเธ เธฒเธเธก', 'เธกเธดเธ–เธธเธเธฒเธขเธ', 'เธเธฃเธเธเธฒเธเธก', 'เธชเธดเธเธซเธฒเธเธก',

      'เธเธฑเธเธขเธฒเธขเธ', 'เธ•เธธเธฅเธฒเธเธก', 'เธเธคเธจเธเธดเธเธฒเธขเธ', 'เธเธฑเธเธงเธฒเธเธก'

    ];

    monthRes.monthName = monthNames[m - 1];

    

    // Calculate monthly totals and sums locally to ensure accuracy

    let sumMinutes = 0;

    monthRes.classes.forEach(c => {

      // if (c.numKids > 0) {
        sumMinutes += parseHoursLeftToMinutes(c.hours);

      // }
    });

    

    const sumHoursPart = Math.floor(sumMinutes / 60);

    const sumMinPart = sumMinutes % 60;

    const formattedSumHours = `${sumHoursPart} เธเธก. ${sumMinPart} เธเธฒเธ—เธต`;



    // Render detail

    if(document.getElementById('calc_result_card')) document.getElementById('calc_result_card').style.display = 'block';

    

    const formatIsoDateToThai = (isoDateStr) => {

      if (!isoDateStr) return '';

      if (isoDateStr.includes('/')) return formatDateToThai(isoDateStr);

      const parts = isoDateStr.split('-');

      if (parts.length === 3) {

        return formatDateToThai(`${parts[2]}/${parts[1]}/${parts[0]}`);

      }

      return isoDateStr;

    };

    

    const dateRangeStr = (monthRes.startDate && monthRes.endDate) ? ` (${formatIsoDateToThai(monthRes.startDate)} - ${formatIsoDateToThai(monthRes.endDate)})` : '';

    const titleText = monthRes.monthName ? `๐“ เธชเธฃเธธเธเธฃเธฒเธขเธฃเธฑเธเธเนเธฒเธชเธญเธเธเธฃเธฐเธเธณเน€เธ”เธทเธญเธ ${monthRes.monthName}${dateRangeStr}` : '๐“ เธชเธฃเธธเธเธฃเธฒเธขเธฃเธฑเธเธเนเธฒเธชเธญเธเธเธฃเธฐเธเธณเน€เธ”เธทเธญเธ';

    document.getElementById('calc_result_title').innerText = titleText;

    

    document.getElementById('calc_result_total_pay').innerText = 'เธฃเธฒเธขเนเธ”เนเธชเธธเธ—เธเธด: เธฟ' + (monthRes.totalPay || 0).toLocaleString();

    document.getElementById('calc_result_total_hours').innerText = formattedSumHours;

    document.getElementById('calc_result_total_classes').innerText = (monthRes.totalClasses || 0).toLocaleString() + ' เธเธฅเธฒเธช';

    

    const tbody = document.getElementById('calc_details_tbody');

    tbody.innerHTML = '';

    

    monthRes.classes.forEach(c => {

      let displayRole = c.role || 'เธเธฃเธนเธเธฃเธฐเธเธณ';

      if (displayRole === 'sub' || displayRole.includes('เธชเธญเธเนเธ—เธ') || displayRole.includes('เธเธฃเธนเนเธ—เธ')) {

        displayRole = 'เธเธฃเธนเนเธ—เธ';

      } else {

        displayRole = 'เธเธฃเธนเธเธฃเธฐเธเธณ';

      }

      

      const tr = document.createElement('tr');

      tr.style.fontSize = '0.70rem';

      if (displayRole === 'เธเธฃเธนเนเธ—เธ') {

        tr.style.backgroundColor = '#fff9cc';

      }

      tr.innerHTML = `

        <td style="white-space: nowrap;">${formatDateToThai(c.date)}</td>

        <td style="white-space: nowrap;"><div style="font-weight:600;">${c.subject}</div></td>

        <td style="white-space: nowrap;">${(c.room || '-').replace(/\s*zoom\s*\d*/gi, '').trim() || '-'}</td>

        <td style="white-space: nowrap; font-weight: 600; color: var(--color-primary-hover);">${formatHoursMinutes(c.hours)}</td>

        <td style="text-align: center; white-space: nowrap;">${c.numKids} เธเธ<br><span style="font-size: 0.6rem; color: #6c757d;">(เธชเธ”:${c.isPresentLive || 0}, เธญเธญเธ:${c.isPresentOnline || 0}, เธเธ”:${c.isMakeup || 0})</span></td>

        <td style="text-align: right; white-space: nowrap;">เธฟ${c.rate.toLocaleString()}</td>

        <td style="text-align: right; font-weight:600; color:var(--color-success); white-space: nowrap;">เธฟ${c.pay.toLocaleString()}</td>

        <td style="white-space: nowrap;"><span class="badge ${displayRole === 'เธเธฃเธนเนเธ—เธ' ? 'badge-warning' : 'badge-info'}" style="font-size: 0.65rem; padding: 4px 8px; font-weight: 600; border-radius: 6px;">${displayRole}</span></td>

      `;

      tbody.appendChild(tr);

    });

    

    if (monthRes.classes.length === 0) {

      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 40px; font-size: 0.70rem;">เนเธกเนเธเธเธฃเธฒเธขเธเธฒเธฃเธชเธญเธเธเธญเธเธเธธเธ“เธเธฃเธนเนเธเธเนเธงเธเน€เธงเธฅเธฒเธ—เธตเนเธฃเธฐเธเธธ</td></tr>`;

    }

  }

}



function getWeekRange(dateStr) {

  const parts = dateStr.split('/');

  if (parts.length !== 3) return { monday: new Date(0), key: 'Invalid Date' };

  let year = parseInt(parts[2], 10);

  if (year > 2400) year -= 543;

  const d = new Date(year, parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));

  const day = d.getDay();

  const diff = d.getDate() - day + (day === 0 ? -6 : 1);

  const monday = new Date(d.setDate(diff));

  monday.setHours(0,0,0,0);

  

  const sunday = new Date(monday);

  sunday.setDate(monday.getDate() + 6);

  

  const formatShort = (dt) => {

    const dayVal = dt.getDate();

    const monthVal = dt.getMonth() + 1;

    const yearVal = dt.getFullYear();

    return `${dayVal < 10 ? '0' + dayVal : dayVal}/${monthVal < 10 ? '0' + monthVal : monthVal}/${yearVal}`;

  };

  

  return {

    monday: monday,

    key: `${formatShort(monday)} - ${formatShort(sunday)}`

  };

}



// Global variable to store manager list

let _managerListCache = null;



// ---- Location Radius check ----

const ALLOWED_LOCATIONS = [

  { lat: 12.68475883090192, lng: 101.23382864474371, name: 'เธชเธ–เธฒเธเธ—เธตเนเธ—เธตเน 1' },

  { lat: 12.680386312883275, lng: 101.24089287612749, name: 'เธชเธ–เธฒเธเธ—เธตเนเธ—เธตเน 2' },

  { lat: 12.66513789018523, lng: 101.27400671795978, name: 'เธชเธ–เธฒเธเธ—เธตเนเธ—เธตเน 3' }

];



function calculateDistance(lat1, lon1, lat2, lon2) {

  const R = 6371e3; // Earth radius in meters

  const phi1 = lat1 * Math.PI / 180;

  const phi2 = lat2 * Math.PI / 180;

  const deltaPhi = (lat2 - lat1) * Math.PI / 180;

  const deltaLambda = (lon2 - lon1) * Math.PI / 180;



  const a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) +

            Math.cos(phi1) * Math.cos(phi2) *

            Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));



  return R * c; // Distance in meters

}



function checkLocationAccess(lat, lng) {

  const MAX_RADIUS = 100; // 100 meters

  let isWithinRange = false;

  let minDistance = Infinity;

  

  for (let loc of ALLOWED_LOCATIONS) {

    const dist = calculateDistance(lat, lng, loc.lat, loc.lng);

    if (dist <= MAX_RADIUS) {

      isWithinRange = true;

      break;

    }

    if (dist < minDistance) {

      minDistance = dist;

    }

  }

  

  return {

    allowed: isWithinRange,

    distance: minDistance

  };

}



function saveManagerCheckin(e) {

  e.preventDefault();

  

  if (!navigator.geolocation) {

    showToast('เน€เธเธฃเธฒเธงเนเน€เธเธญเธฃเนเนเธกเนเธฃเธญเธเธฃเธฑเธ Geolocation', 'error');

    return;

  }

  

  setLoading(true, 'เธเธณเธฅเธฑเธเธ”เธถเธเธเธดเธเธฑเธ”เธ•เธณเนเธซเธเนเธเธเธญเธเธเธธเธ“...');

  

  navigator.geolocation.getCurrentPosition(

    (position) => {

      const lat = position.coords.latitude;

      const lng = position.coords.longitude;

      

      // Radius limit validation

      const locCheck = checkLocationAccess(lat, lng);

      if (!locCheck.allowed) {

        setLoading(false);

        showToast(`เธเธธเธ“เธญเธขเธนเนเธเธญเธเธฃเธฐเธขเธฐเธเธทเนเธเธ—เธตเนเธเธเธดเธเธฑเธ•เธดเธเธฒเธ (เธซเนเธฒเธเธเธฒเธเธเธธเธ”เน€เธเนเธเธญเธดเธเธ—เธตเนเนเธเธฅเนเธ—เธตเนเธชเธธเธ”เธเธฃเธฐเธกเธฒเธ“ ${Math.round(locCheck.distance)} เน€เธกเธ•เธฃ / เธเธณเธเธฑเธ”เธฃเธฑเธจเธกเธตเนเธกเนเน€เธเธดเธ 100 เน€เธกเธ•เธฃ)`, 'error');

        return;

      }

      

      proceedSaveManagerCheckin(lat, lng);

    },

    (error) => {

      setLoading(false);

      showToast('เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เธ”เธถเธเธ•เธณเนเธซเธเนเธเนเธ”เน เธเธฃเธธเธ“เธฒเธญเธเธธเธเธฒเธ• Location', 'error');

    },

    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }

  );

}



async function proceedSaveManagerCheckin(lat, lng) {

  setLoading(true, 'เธเธณเธฅเธฑเธเธเธฃเธฐเธกเธงเธฅเธเธฅเธฃเธนเธเธ เธฒเธ...');

  

  const photoBase64 = await readFileAsBase64('checkin_photo');

  

  const logData = {

    type: 'checkin',

    managerName: document.getElementById('checkin_manager_name').value,

    date: convertDateToSheet(document.getElementById('checkin_date').value),

    workIn: document.getElementById('checkin_work_in').value,

    workOut: '',

    otIn: '',

    otOut: '',

    otDetail: '',

    isPresent: document.getElementById('checkin_status_present').checked,

    isAbsent: document.getElementById('checkin_status_absent').checked,

    lat: lat,

    lng: lng,

    photoIn: photoBase64

  };

  

  google.script.run

    .withSuccessHandler(res => {

      setLoading(false);

      if (res && res.success) {

        showToast('เน€เธเนเธเธญเธดเธเธชเธณเน€เธฃเนเธเน€เธฃเธตเธขเธเธฃเนเธญเธข โ“', 'success');

        closeManagerCheckinModal();

        loadManagerDailyLogs();

      } else {

        showToast('เธเธฑเธเธ—เธถเธเน€เธเนเธเธญเธดเธเนเธกเนเธชเธณเน€เธฃเนเธ: ' + (res.error || 'เนเธกเนเธ—เธฃเธฒเธเธชเธฒเน€เธซเธ•เธธ'), 'error');

      }

    })

    .withFailureHandler(err => {

      setLoading(false);

      showToast('เน€เธเธทเนเธญเธกเธ•เนเธญเธเธฑเนเธเน€เธเธดเธฃเนเธเน€เธงเธญเธฃเนเธเธดเธ”เธเธฅเธฒเธ”: ' + err.message, 'error');

    })

    .addManagerLog(logData, getLogUser());

}



// ====================================================

// CHECK-OUT Modal

// ====================================================

function showManagerCheckoutModal() {

  document.getElementById('manager_checkout_form').reset();

  document.getElementById('checkout_date').value = getTodayString();

  clearPhotoPreview('checkout_photo','checkout_photo_preview','checkout_photo_img');

  document.getElementById('manager_checkout_modal').classList.add('active');

  populateManagerSelect('checkout_manager_name');

}



function closeManagerCheckoutModal() {

  document.getElementById('manager_checkout_modal').classList.remove('active');

}



function saveManagerCheckout(e) {

  e.preventDefault();

  

  if (!navigator.geolocation) {

    showToast('เน€เธเธฃเธฒเธงเนเน€เธเธญเธฃเนเนเธกเนเธฃเธญเธเธฃเธฑเธ Geolocation', 'error');

    return;

  }

  

  setLoading(true, 'เธเธณเธฅเธฑเธเธ”เธถเธเธเธดเธเธฑเธ”เธ•เธณเนเธซเธเนเธเธเธญเธเธเธธเธ“...');

  

  navigator.geolocation.getCurrentPosition(

    (position) => {

      const lat = position.coords.latitude;

      const lng = position.coords.longitude;

      

      // Radius limit validation

      const locCheck = checkLocationAccess(lat, lng);

      if (!locCheck.allowed) {

        setLoading(false);

        showToast(`เธเธธเธ“เธญเธขเธนเนเธเธญเธเธฃเธฐเธขเธฐเธเธทเนเธเธ—เธตเนเธเธเธดเธเธฑเธ•เธดเธเธฒเธ (เธซเนเธฒเธเธเธฒเธเธเธธเธ”เน€เธเนเธเธญเธดเธเธ—เธตเนเนเธเธฅเนเธ—เธตเนเธชเธธเธ”เธเธฃเธฐเธกเธฒเธ“ ${Math.round(locCheck.distance)} เน€เธกเธ•เธฃ / เธเธณเธเธฑเธ”เธฃเธฑเธจเธกเธตเนเธกเนเน€เธเธดเธ 100 เน€เธกเธ•เธฃ)`, 'error');

        return;

      }

      

      proceedSaveManagerCheckout(lat, lng);

    },

    (error) => {

      setLoading(false);

      showToast('เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เธ”เธถเธเธ•เธณเนเธซเธเนเธเนเธ”เน เธเธฃเธธเธ“เธฒเธญเธเธธเธเธฒเธ• Location', 'error');

    },

    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }

  );

}



// ----------------------------------------------------

// 9. Manager Work Hour Logs (เน€เธงเธฅเธฒเธเธนเนเธเธฑเธ”เธเธฒเธฃ)

// ----------------------------------------------------

function loadManagerLogs() {

  setLoading(true, 'เธเธณเธฅเธฑเธเธ”เธถเธเธเธฃเธฐเธงเธฑเธ•เธดเธเธฒเธฃเธ—เธณเธเธฒเธเธเธญเธเธเธนเนเธเธฑเธ”เธเธฒเธฃ...');

  google.script.run

    .withSuccessHandler(data => {

      setLoading(false);

      if (Array.isArray(data)) {

        state.managerLogs = data;

        

        // Populate manager filter dropdown

        const filterSelect = document.getElementById('manager_log_filter');

        if (filterSelect) {

          const currentVal = filterSelect.value;

          filterSelect.innerHTML = '<option value="">-- เนเธชเธ”เธเธ—เธธเธเธเธ --</option>';

          const uniqueManagers = [...new Set(data.map(log => log.managerName).filter(Boolean))].sort();

          uniqueManagers.forEach(name => {

            const opt = document.createElement('option');

            opt.value = name;

            opt.textContent = name;

            filterSelect.appendChild(opt);

          });

          filterSelect.value = currentVal;

        }

        

        // Populate year dropdown

        const yearSelect = document.getElementById('manager_log_year');

        if (yearSelect) {

          const currentYearVal = yearSelect.value;

          yearSelect.innerHTML = '<option value="">-- เธ—เธธเธเธเธต --</option>';

          const uniqueYears = [...new Set(data.map(log => {

            if (!log.date) return '';

            const parts = log.date.split('/');

            return parts.length === 3 ? parts[2] : '';

          }).filter(Boolean))].sort().reverse();

          uniqueYears.forEach(yr => {

            const opt = document.createElement('option');

            opt.value = yr;

            opt.textContent = yr;

            yearSelect.appendChild(opt);

          });

          // Auto-select current year if not already set

          if (!currentYearVal) {

            const now = new Date();

            const currentYear = now.getFullYear().toString();

            if (uniqueYears.includes(currentYear)) {

              yearSelect.value = currentYear;

            }

          } else {

            yearSelect.value = currentYearVal;

          }

        }

        

        // Auto-select current month if not already set

        const monthSelect = document.getElementById('manager_log_month');

        if (monthSelect && !monthSelect.value) {

          const now = new Date();

          const currentMonth = String(now.getMonth() + 1).padStart(2, '0');

          monthSelect.value = currentMonth;

        }

        

        renderManagerLogsTable();

      } else {

        showToast('เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เนเธซเธฅเธ”เธเนเธญเธกเธนเธฅเธเธนเนเธเธฑเธ”เธเธฒเธฃ: ' + (data ? data.error : 'unknown'), 'error');

      }

    })

    .withFailureHandler(err => {

      setLoading(false);

      showToast('เธเธฒเธฃเธ”เธถเธเธเนเธญเธกเธนเธฅเธเธดเธ”เธเธฅเธฒเธ”: ' + err.message, 'error');

    })

    .getManagerOTLogs(getLogUser());

}



function renderManagerLogsTable() {

  const cardsContainer = document.getElementById('manager_logs_cards_container');

  if (!cardsContainer) return;

  cardsContainer.innerHTML = '';

  

  // Read filters

  const filterSelect = document.getElementById('manager_log_filter');

  const selectedManager = filterSelect ? filterSelect.value : '';

  const monthSelect = document.getElementById('manager_log_month');

  const selectedMonth = monthSelect ? monthSelect.value : '';

  const yearSelect = document.getElementById('manager_log_year');

  const selectedYear = yearSelect ? yearSelect.value : '';

  

  // Helper: parse "HH:mm" or numeric hours to total minutes

  const parseHoursToMins = (hhmm) => {

    if (!hhmm) return 0;

    const s = hhmm.toString().trim();

    const p = s.split(':');

    if (p.length === 2) {

      return (parseInt(p[0]) || 0) * 60 + (parseInt(p[1]) || 0);

    }

    const rawFloat = parseFloat(s);

    if (!isNaN(rawFloat)) {

      return Math.round(rawFloat * 60);

    }

    return 0;

  };

  

  const formatMinsToHHMM = (mins) => {

    if (mins <= 0) return '0 เธเธก. 0 เธเธฒเธ—เธต';

    return Math.floor(mins / 60) + ' เธเธก. ' + (mins % 60) + ' เธเธฒเธ—เธต';

  };

  

  // Helper: parse date string dd/MM/yyyy => {day, month, year}

  const parseDateParts = (dateStr) => {

    if (!dateStr) return null;

    const parts = dateStr.split('/');

    if (parts.length !== 3) return null;

    return { day: parts[0].padStart(2, '0'), month: parts[1].padStart(2, '0'), year: parts[2] };

  };

  

  // Filter logs

  let filteredLogs = state.managerLogs.filter(log => {

    if (selectedManager && log.managerName !== selectedManager) return false;

    if (selectedMonth || selectedYear) {

      const dp = parseDateParts(log.date);

      if (!dp) return false;

      if (selectedMonth && dp.month !== selectedMonth) return false;

      if (selectedYear && dp.year !== selectedYear) return false;

    }

    return true;

  });

  

  // Group by managerName

  const groupedByPerson = {};

  filteredLogs.forEach(log => {

    const name = log.managerName || 'เนเธกเนเธฃเธฐเธเธธเธเธทเนเธญ';

    if (!groupedByPerson[name]) groupedByPerson[name] = [];

    groupedByPerson[name].push(log);

  });

  

  // Calculate grand totals

  let grandWorkMins = 0;

  let grandOTMins = 0;

  let grandDays = 0;

  let grandPresent = 0;

  let grandAbsent = 0;

  

  const personNames = Object.keys(groupedByPerson).sort();

  

  personNames.forEach(name => {

    const logs = groupedByPerson[name];

    logs.forEach(log => {

      grandWorkMins += parseHoursToMins(log.workHours);

      grandOTMins += parseHoursToMins(log.otHours);

      grandDays++;

      if (log.isPresent) grandPresent++;

      if (!log.isPresent) grandAbsent++;

    });

  });

  

  // Render summary dashboard

  const summaryDiv = document.getElementById('manager_summary_dash');

  if (summaryDiv) {

    const monthLabel = selectedMonth ? ['','เธกเธเธฃเธฒเธเธก','เธเธธเธกเธ เธฒเธเธฑเธเธเน','เธกเธตเธเธฒเธเธก','เน€เธกเธฉเธฒเธขเธ','เธเธคเธฉเธ เธฒเธเธก','เธกเธดเธ–เธธเธเธฒเธขเธ','เธเธฃเธเธเธฒเธเธก','เธชเธดเธเธซเธฒเธเธก','เธเธฑเธเธขเธฒเธขเธ','เธ•เธธเธฅเธฒเธเธก','เธเธคเธจเธเธดเธเธฒเธขเธ','เธเธฑเธเธงเธฒเธเธก'][parseInt(selectedMonth)] : 'เธ—เธธเธเน€เธ”เธทเธญเธ';

    const periodLabel = monthLabel + (selectedYear ? ' ' + selectedYear : '');

    

    summaryDiv.innerHTML = '<div style="flex: 1; min-width: 180px; background: linear-gradient(135deg, #e0f2fe, #bae6fd); padding: 16px; border-radius: 12px; box-shadow: var(--shadow-sm); border: 1px solid #7dd3fc;"><div style="font-size: 0.8rem; color: #0369a1; font-weight: 600; margin-bottom: 4px;">๐“ เธฃเธงเธกเธเธก.เธ—เธณเธเธฒเธ (' + periodLabel + ')</div><div style="font-size: 1.3rem; font-weight: 700; color: #0c4a6e;">' + formatMinsToHHMM(grandWorkMins) + '</div></div>'

      + '<div style="flex: 1; min-width: 180px; background: linear-gradient(135deg, #ffedd5, #fed7aa); padding: 16px; border-radius: 12px; box-shadow: var(--shadow-sm); border: 1px solid #fdba74;"><div style="font-size: 0.8rem; color: #c2410c; font-weight: 600; margin-bottom: 4px;">โฐ เธฃเธงเธกเธเธก.OT (' + periodLabel + ')</div><div style="font-size: 1.3rem; font-weight: 700; color: #7c2d12;">' + formatMinsToHHMM(grandOTMins) + '</div></div>'

      + '<div style="flex: 1; min-width: 180px; background: linear-gradient(135deg, #dcfce7, #bbf7d0); padding: 16px; border-radius: 12px; box-shadow: var(--shadow-sm); border: 1px solid #86efac;"><div style="font-size: 0.8rem; color: #15803d; font-weight: 600; margin-bottom: 4px;">๐‘ฅ เธเธณเธเธงเธเธเธ</div><div style="font-size: 1.3rem; font-weight: 700; color: #14532d;">' + personNames.length + ' เธเธ</div></div>'

      + '<div style="flex: 1; min-width: 180px; background: linear-gradient(135deg, #fce7f3, #fbcfe8); padding: 16px; border-radius: 12px; box-shadow: var(--shadow-sm); border: 1px solid #f9a8d4;"><div style="font-size: 0.8rem; color: #be185d; font-weight: 600; margin-bottom: 4px;">โ… เธกเธฒเธเธเธดเธเธฑเธ•เธดเธเธฒเธ / โ เธซเธขเธธเธ”</div><div style="font-size: 1.3rem; font-weight: 700; color: #831843;">' + grandPresent + ' / ' + grandAbsent + ' เธงเธฑเธ</div></div>';

  }

  

  // Render per-person cards

  if (personNames.length === 0) {

    cardsContainer.innerHTML = '<div class="glass-panel" style="text-align: center; color: var(--text-muted); padding: 40px;">เนเธกเนเธกเธตเธเธฃเธฐเธงเธฑเธ•เธดเธเธฒเธฃเธเธฑเธเธ—เธถเธเน€เธงเธฅเธฒเธเธญเธเธเธนเนเธเธฑเธ”เธเธฒเธฃ เนเธเธเนเธงเธเน€เธงเธฅเธฒเธ—เธตเนเน€เธฅเธทเธญเธ</div>';

    return;

  }

  

  const personColors = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#84cc16'];

  

  personNames.forEach((name, pIdx) => {

    const logs = groupedByPerson[name];

    const color = personColors[pIdx % personColors.length];

    

    // Sort logs by date descending

    const sortedLogs = logs.slice().sort((a, b) => {

      const pa = parseDateParts(a.date);

      const pb = parseDateParts(b.date);

      if (!pa || !pb) return 0;

      const da = pa.year + pa.month + pa.day;

      const db = pb.year + pb.month + pb.day;

      return db.localeCompare(da);

    });

    

    // Calculate person totals

    let personWorkMins = 0;

    let personOTMins = 0;

    let personPresent = 0;

    let personAbsent = 0;

    

    sortedLogs.forEach(log => {

      personWorkMins += parseHoursToMins(log.workHours);

      personOTMins += parseHoursToMins(log.otHours);

      if (log.isPresent) personPresent++;

      if (!log.isPresent) personAbsent++;

    });

    

    // Build person card

    const card = document.createElement('div');

    card.className = 'glass-panel';

    card.style.cssText = 'margin-bottom: 20px; border-left: 4px solid ' + color + '; overflow: hidden;';

    

    // Person header with monthly summary

    let headerHtml = '<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; padding: 16px 20px; background: linear-gradient(135deg, ' + color + '10, ' + color + '05); border-bottom: 1px solid var(--border-color);">';

    headerHtml += '<div style="display: flex; align-items: center; gap: 12px;"><div style="width: 40px; height: 40px; border-radius: 50%; background: ' + color + '; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 1.1rem;">' + name.charAt(0) + '</div><div><div style="font-weight: 700; font-size: 1.1rem; color: var(--text-primary);">' + name + '</div><div style="font-size: 0.8rem; color: var(--text-muted);">' + sortedLogs.length + ' เธฃเธฒเธขเธเธฒเธฃ | เธกเธฒเธ—เธณเธเธฒเธ ' + personPresent + ' เธงเธฑเธ | เธซเธขเธธเธ” ' + personAbsent + ' เธงเธฑเธ</div></div></div>';

    headerHtml += '<div style="display: flex; gap: 16px; flex-wrap: wrap;">';

    headerHtml += '<div style="text-align: center; padding: 8px 16px; background: rgba(59,130,246,0.08); border-radius: 8px;"><div style="font-size: 0.7rem; color: #3b82f6; font-weight: 600;">เธฃเธงเธก เธเธก.เธ—เธณเธเธฒเธ</div><div style="font-size: 1.1rem; font-weight: 700; color: #1e40af;">' + formatMinsToHHMM(personWorkMins) + '</div></div>';

    headerHtml += '<div style="text-align: center; padding: 8px 16px; background: rgba(245,158,11,0.08); border-radius: 8px;"><div style="font-size: 0.7rem; color: #f59e0b; font-weight: 600;">เธฃเธงเธก เธเธก.OT</div><div style="font-size: 1.1rem; font-weight: 700; color: #92400e;">' + formatMinsToHHMM(personOTMins) + '</div></div>';

    headerHtml += '</div></div>';

    

    // Daily breakdown table

    let tableHtml = '<div class="table-responsive" style="margin: 0;"><table class="custom-table" style="margin: 0; border-radius: 0;"><thead><tr>'

      + '<th style="width: 130px;">เธงเธฑเธเธ—เธตเน</th>'

      + '<th style="width: 90px;">เน€เธเนเธฒเธเธฒเธ</th>'

      + '<th style="width: 55px;">เธฃเธนเธเน€เธเนเธฒ</th>'

      + '<th style="width: 90px;">เธญเธญเธเธเธฒเธ</th>'

      + '<th style="width: 55px;">เธฃเธนเธเธญเธญเธ</th>'

      + '<th style="width: 100px;">เธเธก.เธ—เธณเธเธฒเธ</th>'

      + '<th style="width: 90px;">เน€เธเนเธฒ OT</th>'

      + '<th style="width: 90px;">เธญเธญเธ OT</th>'

      + '<th style="width: 100px;">เธเธก.OT</th>'

      + '<th>เธฃเธฒเธขเธฅเธฐเน€เธญเธตเธขเธ” / เธซเธกเธฒเธขเน€เธซเธ•เธธ</th>'

      + '<th style="width: 100px;">เธชเธ–เธฒเธเธฐ</th>'

      + '</tr></thead><tbody>';

    

    sortedLogs.forEach(log => {

      // Location link

      let locHtml = '';

      if (log.lat && log.lng) {

        locHtml = ' <a href="https://maps.google.com/?q=' + log.lat + ',' + log.lng + '" target="_blank" style="font-size: 0.65rem; color: #0284c7; text-decoration: none;">๐“</a>';

      }

      

      // Calculate work hours from time if workHours not provided

      let workHoursDisplay = log.workHours || '';

      let otHoursDisplay = log.otHours || '';

      

      // Format hours display

      const fmtHrs = (h) => {

        if (!h) return '<span style="color: var(--text-muted);">-</span>';

        const mins = parseHoursToMins(h);

        if (mins <= 0) return '<span style="color: var(--text-muted);">-</span>';

        const hrs = Math.floor(mins / 60);

        const m = mins % 60;

        return '<span style="font-weight: 600;">' + hrs + ' เธเธก. ' + (m > 0 ? m + ' เธ.' : '') + '</span>';

      };

      

      // Photo thumbnail helper

      const photoThumb = (url) => {

        if (!url) return '<span style="color: var(--text-muted);">-</span>';

        return '<a href="' + url + '" target="_blank"><img src="' + url + '" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover; border: 1px solid var(--border-color); cursor: pointer;" onerror="this.parentElement.innerHTML=&#39;โ&#39;"></a>';

      };

      

      const statusBadge = log.isPresent 

        ? '<span class="badge badge-success" style="font-size: 0.75rem;">เธกเธฒเธ—เธณเธเธฒเธ</span>' 

        : '<span class="badge badge-danger" style="font-size: 0.75rem;">เธซเธขเธธเธ”เธเธฒเธ</span>';

      

      tableHtml += '<tr>'

        + '<td>' + formatDateToThai(log.date) + locHtml + '</td>'

        + '<td>' + (log.workIn || '<span style="color:var(--text-muted);">-</span>') + '</td>'

        + '<td style="text-align: center;">' + photoThumb(log.photoInUrl) + '</td>'

        + '<td>' + (log.workOut || '<span style="color:var(--text-muted);">-</span>') + '</td>'

        + '<td style="text-align: center;">' + photoThumb(log.photoOutUrl) + '</td>'

        + '<td>' + fmtHrs(workHoursDisplay) + '</td>'

        + '<td>' + (log.otIn || '<span style="color:var(--text-muted);">-</span>') + '</td>'

        + '<td>' + (log.otOut || '<span style="color:var(--text-muted);">-</span>') + '</td>'

        + '<td>' + fmtHrs(otHoursDisplay) + '</td>'

        + '<td style="font-size: 0.85rem;">' + (log.otDetail || '-') + '</td>'

        + '<td>' + statusBadge + '</td>'

        + '</tr>';

    });

    

    tableHtml += '</tbody></table></div>';

    

    card.innerHTML = headerHtml + tableHtml;

    cardsContainer.appendChild(card);

  });

}

// ---- Photo Preview / Base64 Helpers ----

function previewPhoto(inputId, previewId) {

  const input = document.getElementById(inputId);

  const preview = document.getElementById(previewId);

  const img = preview.querySelector('img');

  if (input.files && input.files[0]) {

    const reader = new FileReader();

    reader.onload = (e) => {

      img.src = e.target.result;

      preview.style.display = 'block';

    };

    reader.readAsDataURL(input.files[0]);

  }

}



function clearPhotoPreview(inputId, previewId, imgId) {

  document.getElementById(inputId).value = '';

  document.getElementById(previewId).style.display = 'none';

  document.getElementById(imgId).src = '';

}



function readFileAsBase64(inputId) {

  return new Promise((resolve) => {

    const input = document.getElementById(inputId);

    if (!input.files || !input.files[0]) { resolve(null); return; }

    const file = input.files[0];

    // Resize image to max 800px before converting

    const reader = new FileReader();

    reader.onload = (e) => {

      const img = new Image();

      img.onload = () => {

        const MAX = 800;

        let w = img.width, h = img.height;

        if (w > MAX || h > MAX) {

          if (w > h) { h = Math.round(h * MAX / w); w = MAX; }

          else { w = Math.round(w * MAX / h); h = MAX; }

        }

        const canvas = document.createElement('canvas');

        canvas.width = w; canvas.height = h;

        canvas.getContext('2d').drawImage(img, 0, 0, w, h);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.75);

        resolve(dataUrl);

      };

      img.onerror = () => resolve(null);

      img.src = e.target.result;

    };

    reader.onerror = () => resolve(null);

    reader.readAsDataURL(file);

  });

}



// ---- Populate Manager Dropdown (shared) ----

function populateManagerSelect(selectId) {

  const managerSelect = document.getElementById(selectId);

  if (!managerSelect) return;

  

  if (_managerListCache) {

    fillManagerOptions(managerSelect);

    return;

  }

  

  managerSelect.innerHTML = '<option value="">-- เธเธณเธฅเธฑเธเนเธซเธฅเธ” --</option>';

  google.script.run

    .withSuccessHandler(users => {

      _managerListCache = users;

      fillManagerOptions(managerSelect);

    })

    .withFailureHandler(() => {

      managerSelect.innerHTML = '<option value="">เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เนเธซเธฅเธ”เธฃเธฒเธขเธเธทเนเธญเนเธ”เน</option>';

    })

    .getUsersDB();

}



function fillManagerOptions(selectEl) {

  selectEl.innerHTML = '';

  if (!_managerListCache) return;

  

  const managers = _managerListCache.filter(u => {

    const fullName = (u[3] || '').toString();

    const nickname = (u[4] || '').toString();

    const role = (u[5] || '').toString();

    return fullName.includes('เธเธเธ') || nickname.includes('เธเธเธ') || role.toLowerCase() === 'manager';

  });

  

  if (managers.length === 0) {

    selectEl.innerHTML = '<option value="">-- เนเธกเนเธเธเธฃเธฒเธขเธเธทเนเธญ เธเธเธ. --</option>';

    return;

  }

  

  managers.forEach(m => {

    const name = m[3] ? m[3].toString() : (m[4] ? m[4].toString() : m[1]);

    const opt = document.createElement('option');

    opt.value = name;

    opt.textContent = name;

    selectEl.appendChild(opt);

  });

}



// Keep old function name for backward compatibility

function populateManagerDropdown() {

  const el = document.getElementById('manager_name');

  if (el) fillManagerOptions(el);

}



// ====================================================

// CHECK-IN Modal

// ====================================================

function showManagerCheckinModal() {

  document.getElementById('manager_checkin_form').reset();

  document.getElementById('checkin_date').value = getTodayString();

  clearPhotoPreview('checkin_photo','checkin_photo_preview','checkin_photo_img');

  document.getElementById('manager_checkin_modal').classList.add('active');

  populateManagerSelect('checkin_manager_name');

}



function closeManagerCheckinModal() {

  document.getElementById('manager_checkin_modal').classList.remove('active');

}









async function proceedSaveManagerCheckout(lat, lng) {

  setLoading(true, 'เธเธณเธฅเธฑเธเธเธฃเธฐเธกเธงเธฅเธเธฅเธฃเธนเธเธ เธฒเธ...');

  

  const photoBase64 = await readFileAsBase64('checkout_photo');

  

  const workOut = document.getElementById('checkout_work_out').value;

  const otIn = document.getElementById('checkout_ot_in').value;

  const otOut = document.getElementById('checkout_ot_out').value;

  

  let otHours = '';

  if (otIn && otOut) {

    const sParts = otIn.split(':');

    const eParts = otOut.split(':');

    const diff = (parseInt(eParts[0]) * 60 + parseInt(eParts[1])) - (parseInt(sParts[0]) * 60 + parseInt(sParts[1]));

    if (diff > 0) otHours = `${Math.floor(diff/60)}:${diff%60 < 10 ? '0'+(diff%60) : diff%60}`;

  }

  

  const logData = {

    type: 'checkout',

    managerName: document.getElementById('checkout_manager_name').value,

    date: convertDateToSheet(document.getElementById('checkout_date').value),

    workIn: '',

    workOut: workOut,

    otIn: otIn,

    otOut: otOut,

    otDetail: document.getElementById('checkout_ot_detail').value.trim(),

    isPresent: false,

    isAbsent: false,

    workHours: '',

    otHours: otHours,

    lat: lat,

    lng: lng,

    photoIn: '',

    photoOut: photoBase64 || ''

  };

  

  if (!logData.managerName) {

    setLoading(false);

    showToast('เธเธฃเธธเธ“เธฒเน€เธฅเธทเธญเธเธเธทเนเธญเธเธนเนเธเธฑเธ”เธเธฒเธฃ', 'warning');

    return;

  }

  

  setLoading(true, 'เธเธณเธฅเธฑเธเธเธฑเธเธ—เธถเธเน€เธงเธฅเธฒเธญเธญเธเธเธฒเธเนเธฅเธฐเธเธดเธเธฑเธ”...');

  const user = getLogUser();

  

  google.script.run

    .withSuccessHandler(res => {

      setLoading(false);

      if (res && res.success) {

        showToast('โ… เธเธฑเธเธ—เธถเธเน€เธงเธฅเธฒเธญเธญเธเธเธฒเธเธชเธณเน€เธฃเนเธ!', 'success');

        closeManagerCheckoutModal();

        loadManagerLogs();

      } else {

        showToast('เธเธฑเธเธ—เธถเธเธฅเนเธกเน€เธซเธฅเธง: ' + (res ? res.error : 'unknown'), 'error');

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

    .getActivityLogs(getLogUser());

}



function renderActivityLogsTable(logs) {

  const tbody = document.getElementById('activity_logs_tbody');

  tbody.innerHTML = '';

  

  logs.forEach(log => {

    const tr = document.createElement('tr');

    tr.innerHTML = `

      <td style="color:var(--text-muted);">${formatDateTimeToThaiLong(log.timestamp)}</td>

      <td><span class="badge badge-info">${log.user}</span></td>

      <td>${log.name || ''}</td>

      <td style="font-weight:600;">${log.action}</td>

      <td>${log.details}</td>

    `;

    tbody.appendChild(tr);

  });

  

  if (logs.length === 0) {

    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 40px;">เนเธกเนเธกเธตเธเนเธญเธกเธนเธฅเธเธฃเธฐเธงเธฑเธ•เธดเธเธฒเธฃเธ—เธณเธเธธเธฃเธเธฃเธฃเธกเนเธเธฃเธฐเธเธ</td></tr>`;

  }

}



// ----------------------------------------------------

// Version 53.8 New UI Helper Functions

// ----------------------------------------------------



function formatDateToThaiShort(dateStr) {

  return formatDateTimeToThaiLong(dateStr);

}



function toggleRecurringDate(idx) {

  const i = (typeof idx === 'number') ? idx : 0;

  const isRecurring = document.getElementById('class_is_recurring_' + i)?.checked;

  const container = document.getElementById('class_recurring_end_container_' + i);

  if (container) container.style.display = isRecurring ? 'block' : 'none';

  if (isRecurring) {

    const today = new Date();

    today.setMonth(today.getMonth() + 1);

    let day = today.getDate();

    let month = today.getMonth() + 1;

    const year = today.getFullYear();

    if (day < 10) day = '0' + day;

    if (month < 10) month = '0' + month;

    const endEl = document.getElementById('class_recurring_end_date_' + i);

    if (endEl) endEl.value = `${year}-${month}-${day}`;

  }

}



function loadDebtors(isSilent = false) {
  fetchCachedStudents(isSilent, students => {
    renderDebtorsTable();
  });
}



function renderDebtorsTable() {

  const tbody = document.getElementById('debtors_tbody');

  tbody.innerHTML = '';

  

  const debtors = state.students.filter(s => s.outstanding > 0);

  

  if (debtors.length === 0) {

    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 40px;">๐ เนเธกเนเธกเธตเธเธฑเธเน€เธฃเธตเธขเธเธเนเธฒเธเธเธณเธฃเธฐเน€เธเธดเธเธเนเธฒเน€เธฃเธตเธขเธเนเธเธฃเธฐเธเธ</td></tr>`;

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

    

    const roundList = s.round ? s.round.split(',').map(c => `<div style="margin-bottom:1px; white-space:nowrap;">${c.trim()}</div>`).join('') : '-';

    const courseText = `

      <div style="font-weight:500; font-size:0.65rem; white-space:nowrap;">${roundList}</div>

      <div style="font-size:0.6rem; color:var(--text-muted); margin-top:2px; white-space:nowrap;">เธเธฑเนเธ: ${s.grade || '-'} ${s.classSection || ''}</div>

    `;

    

    tr.innerHTML = `

      <td>${nameText}</td>

      <td>${courseText}</td>

      <td style="text-align: right; font-weight: 500; white-space: nowrap;">เธฟ${s.full.toLocaleString()}</td>

      <td style="text-align: right; font-weight: 500; color: var(--color-warning); white-space: nowrap;">เธฟ${(s.discount || 0).toLocaleString()}</td>

      <td style="text-align: right; font-weight: 500; color: var(--color-success); white-space: nowrap;">เธฟ${s.paid.toLocaleString()}</td>

      <td style="text-align: right; font-weight: 700; color: var(--color-danger); white-space: nowrap;">เธฟ${s.outstanding.toLocaleString()}</td>

      <td style="white-space: nowrap;"><span class="badge badge-info">${s.classType || 'เน€เธ”เธตเนเธขเธง'}</span></td>

      <td style="white-space: nowrap;">${formatDateTimeToThaiLong(s.paymentDate) || '-'}</td>

      <td>

        <button class="btn btn-primary btn-icon" onclick="showDebtorPaymentModal('${s.id}')" title="เธเธฑเธเธ—เธถเธเธเธณเธฃเธฐเน€เธเธดเธ">

          ๐ช เธเนเธฒเธขเน€เธเธดเธ

        </button>

      </td>

    `;

    

    tbody.appendChild(tr);

  });

}



function showDebtorPaymentModal(id) {

  const s = state.students.find(student => student.id == id);

  if (!s) return;

  

  document.getElementById('dp_student_id').value = s.id;

  document.getElementById('dp_student_display_name').innerText = `เธเธฑเธเน€เธฃเธตเธขเธ: ${s.name}`;

  document.getElementById('dp_course_display_name').innerText = `เธเธญเธฃเนเธช: ${s.round}`;

  document.getElementById('dp_balance_display').innerText = `เธขเธญเธ”เธเนเธฒเธเธเนเธฒเธขเน€เธ”เธดเธก: เธฟ${s.outstanding.toLocaleString()}`;

  document.getElementById('dp_paid').value = s.outstanding;

  document.getElementById('dp_payment_date').value = getTodayString();

  document.getElementById('dp_staff').value = getLogUser() || '';

  

  const channelSelect = document.getElementById('dp_payment_channel');

  channelSelect.innerHTML = '';

  

  const regChannelSelect = document.getElementById('pay_r1_channel');

  if (regChannelSelect) {

    channelSelect.innerHTML = regChannelSelect.innerHTML;

  } else {

    const channels = ['เธเธฃเธธเธเนเธ—เธข เธเธตเธเธดเนเธ', 'เธเธฃเธธเธเน€เธ—เธ เธเธตเธเธดเนเธ', 'SCB เธเธตเนเธเธดเนเธ', 'เธเธฃเธธเธเธจเธฃเธต เธเธตเนเธเธดเนเธ', 'TTB', 'เธเธชเธดเธเธฃ เธเธตเนเธเธดเนเธ', 'SCB เธเธธเธ“เธขเธฒเธข', 'เธเธฃเธธเธเธจเธฃเธต เธเธธเธ“เธ•เธฒ', 'เธเธฃเธธเธเธจเธฃเธต เธเธฑเธเธเธตเธเธฃเธดเธฉเธฑเธ—', 'เธเธชเธดเธเธฃ เธเธฑเธเธเธตเธเธฃเธดเธฉเธฑเธ—(เธเธ”)', 'เธเธชเธดเธเธฃ เธเธฑเธเธเธตเธเธฃเธดเธฉเธฑเธ—(เธชเนเธเธ)', 'TTB เธเธฑเธเธเธตเธเธฃเธดเธฉเธฑเธ—(เธเธ”)', 'TTB เธเธฑเธเธเธตเธเธฃเธดเธฉเธฑเธ—(เธชเนเธเธ)', 'เน€เธเธดเธเธชเธ”', 'เธเธตเนเธเธดเนเธ เนเธญเธ', 'เธเธตเนเธ•เนเธ เนเธญเธ'];

    channels.forEach(ch => {

      const opt = document.createElement('option');

      opt.value = ch;

      opt.innerText = ch;

      channelSelect.appendChild(opt);

    });

  }

  

  if (s.paymentChannel) {

    document.getElementById('dp_payment_channel').value = s.paymentChannel;

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

  document.getElementById('history_student_info').innerHTML = `<strong>เธเธณเธฅเธฑเธเนเธซเธฅเธ”เธเธฃเธฐเธงเธฑเธ•เธดเธเธญเธ:</strong> ${name} ${nickname ? '('+nickname+')' : ''}...`;

  document.getElementById('history_courses_tbody').innerHTML = `<tr><td colspan="8" style="text-align: center;">เธเธณเธฅเธฑเธเนเธซเธฅเธ”เธเนเธญเธกเธนเธฅเธเธญเธฃเนเธช...</td></tr>`;

  document.getElementById('history_lessons_tbody').innerHTML = `<tr><td colspan="6" style="text-align: center;">เธเธณเธฅเธฑเธเนเธซเธฅเธ”เธเธฃเธฐเธงเธฑเธ•เธดเน€เธเนเธฒเน€เธฃเธตเธขเธ...</td></tr>`;

  

  document.getElementById('student_history_modal').classList.add('active');

  

  google.script.run

    .withSuccessHandler(res => {

      if (res && res.success) {

        renderStudentHistory(name, nickname, res.courses, res.classes);

      } else {

        document.getElementById('history_student_info').innerText = 'เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เธ”เธถเธเธเนเธญเธกเธนเธฅเธเธฃเธฐเธงเธฑเธ•เธดเนเธ”เน: ' + (res ? res.error : 'unknown');

      }

    })

    .withFailureHandler(err => {

      document.getElementById('history_student_info').innerText = 'เน€เธเธทเนเธญเธกเธ•เนเธญเธฅเนเธกเน€เธซเธฅเธง: ' + err.message;

    })

    .getStudentHistoryData(name, nickname, getLogUser());

}



function renderStudentHistory(name, nickname, courses, classes) {

  const matchCourseFrontend = (dlSub, studCourse) => {

    if (!dlSub || !studCourse) return false;

    const cleanDl = dlSub.toLowerCase().replace(/\s+/g, '').trim();

    const cleanStud = studCourse.toLowerCase().replace(/\s+/g, '').trim();

    if (cleanDl === cleanStud) return true;

    const dlNumMatch = cleanDl.match(/\d+$/);

    const studNumMatch = cleanStud.match(/\d+$/);

    const dlNum = dlNumMatch ? dlNumMatch[0] : '';

    const studNum = studNumMatch ? studNumMatch[0] : '';

    if (dlNum !== studNum) return false;

    const baseDl = cleanDl.replace(/\d+$/, '');

    const baseStud = cleanStud.replace(/\d+$/, '');

    return baseDl === baseStud || baseDl.indexOf(baseStud) !== -1 || baseStud.indexOf(baseDl) !== -1;

  };



  const parseHoursFrontend = (str) => {

    if (!str) return 0;

    let s = str.toString().trim();

    if (s.includes('GMT') || s.includes('เน€เธงเธฅเธฒ') || s.includes('1899') || s.includes('1900') || s.length > 15) {

      try {

        let cleanStr = s.replace(/\s*GMT[+-]\d+.*$/i, '').trim();

        cleanStr = cleanStr.replace(/\s*GMT.*$/i, '').trim();

        cleanStr = cleanStr.replace(/([+-]\d{2}:?\d{2}|Z)$/i, '').trim();

        const parsed = Date.parse(cleanStr);

        if (!isNaN(parsed)) {

          const d = new Date(parsed);

          return (d.getHours() * 60) + d.getMinutes();

        }

      } catch (e) {}

    }

    if (s.includes('เธเธก.') && s.includes('เธเธฒเธ—เธต')) {

      const m = s.match(/(\d+)\s*เธเธก\.\s*(\d+)\s*เธเธฒเธ—เธต/);

      if (m) {

        return (parseInt(m[1], 10) * 60) + (parseInt(m[2], 10) || 0);

      }

    }

    if (s.includes(':')) {

      const parts = s.split(':');

      return (parseInt(parts[0], 10) * 60) + (parseInt(parts[1], 10) || 0);

    }

    const num = parseFloat(s);

    if (!isNaN(num)) return Math.round(num * 60);

    return 0;

  };



  const formatMinsFrontend = (mins) => {

    let isNegative = mins < 0;

    let absMins = Math.abs(mins);

    let hrs = Math.floor(absMins / 60);

    let rem = Math.round(absMins % 60);

    let str = hrs + ' เธเธก.';

    if (rem > 0 || hrs === 0) {

      str += ' ' + rem + ' เธเธฒเธ—เธต';

    }

    return (isNegative ? '-' : '') + str;

  };



  const getStudiedMins = (courseName) => {

    let sum = 0;

    classes.forEach(cl => {

      const isPresent = (cl.isPresentLive || 0) >= 1 || 

                        (cl.isPresentOnline || 0) >= 1 || 

                        (cl.isMakeup || 0) >= 1;

      if (isPresent && cl.subject) {

        if (matchCourseFrontend(cl.subject, courseName)) {

          sum += parseHoursFrontend(cl.hours);

        }

      }

    });

    return sum;

  };



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

      const ratePerHour = c.full > 0 ? (c.full / totalHours) : (c.classType.indexOf('เธขเนเธญเธข') !== -1 ? 150 : 250);

      

      const studiedMins = getStudiedMins(c.courseName);

      const purchasedMins = Math.round(((c.paid + c.carriedForward) / ratePerHour) * 60);

      const remainingMins = purchasedMins - studiedMins;

      

      const hoursAccumulatedStr = formatMinsFrontend(studiedMins);

      const hoursLeftStr = formatMinsFrontend(remainingMins);

      

      const isLowValue = remainingMins <= 60; // 1 เธเธฑเนเธงเนเธกเธเธซเธฃเธทเธญเธเนเธญเธขเธเธงเนเธฒ

      if (isLowValue) {

        tr.style.backgroundColor = '#ffebee';

      }

      

      tr.innerHTML = `

        <td style="font-weight: 600;">${c.courseName || '-'}</td>

        <td><span class="badge badge-info">${c.classType || 'เน€เธ”เธตเนเธขเธง'}</span></td>

        <td style="text-align: right;">เธฟ${c.full.toLocaleString()}</td>

        <td style="text-align: right; color: var(--color-success); font-weight: 600;">เธฟ${c.paid.toLocaleString()}</td>

        <td style="text-align: right;">${c.outstanding > 0 ? `<span class="badge badge-danger">เธเนเธฒเธ เธฟ${c.outstanding.toLocaleString()}</span>` : `<span class="badge badge-success">เธเธณเธฃเธฐเนเธฅเนเธง</span>`}</td>

        <td style="text-align: center; font-weight: 600;">${hoursAccumulatedStr}</td>

        <td style="text-align: center; font-weight: 600; ${remainingMins <= 0 ? 'color: var(--color-danger);' : ''}">${hoursLeftStr}</td>

        <td>${formatDateTimeToThaiLong(c.paymentDate) || '-'}</td>

        <td style="text-align: center;">

          <button class="btn btn-primary btn-icon" onclick="payFromHistory('${name.replace(/'/g, "\'")}', '${c.courseName.replace(/'/g, "\'")}')" title="เธฅเธเธขเธญเธ”เน€เธเธดเธเธเธณเธฃเธฐ">๐ช</button>

        </td>

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

        <td>${formatDateTimeToThaiLong(stripGarbageDate(c.date)) || stripGarbageDate(c.date) || '-'}</td>

        <td>${cleanTimeStr(stripGarbageDate(c.timeStart))} - ${cleanTimeStr(stripGarbageDate(c.timeEnd))} (${formatHoursMinutes(c.hours)})</td>

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



function payFromHistory(stdName, courseName) {

  closeStudentHistoryModal();

  if (!state.privateStudents || state.privateStudents.length === 0) return;

  const idx = state.privateStudents.findIndex(s => s.name.trim() === stdName.trim() && s.courseName.trim() === courseName.trim());

  if (idx !== -1) {

    showPrivatePaymentModal(idx);

  } else {

    const idx2 = state.privateStudents.findIndex(s => s.name.trim() === stdName.trim());

    if (idx2 !== -1) {

      showPrivatePaymentModal(idx2);

    }

  }

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

function loadReceipts(isSilent = false) {
  fetchCachedStudents(isSilent, data => {
    renderReceiptsTable();
  });
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

        <div class="student-course-display" data-id="${s.id}" data-type="${s.classType || ''}" data-round="${s.round || ''}" data-section="${s.classSection || ''}" style="font-size: 0.8rem; color: var(--text-muted);">เธเธณเธฅเธฑเธเนเธซเธฅเธ”เธเธญเธฃเนเธช...</div>

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

  

  // Now load student courses

  const mainGroupStudents = [];

  filtered.forEach(s => {

    const el = tbody.querySelector(`.student-course-display[data-id="${s.id}"]`);

    if (!el) return;

    

    const type = el.getAttribute('data-type');

    if (type.includes('เน€เธ”เธตเนเธขเธง') || type.includes('เธขเนเธญเธข')) {

      const round = el.getAttribute('data-round');

      const section = el.getAttribute('data-section');

      el.innerText = cleanSubjectName(round) || section || '-';

    } else {

      mainGroupStudents.push({

        id: s.id,

        name: s.name,

        nickname: s.nickname,

        grade: s.grade,

        branchLearn: s.branchLearn,

        classType: s.classType

      });

    }

  });

  

  if (mainGroupStudents.length > 0) {

    google.script.run

      .withSuccessHandler(coursesMap => {

        for (const studentId in coursesMap) {

          const el = tbody.querySelector(`.student-course-display[data-id="${studentId}"]`);

          if (el) {

            const list = coursesMap[studentId];

            if (Array.isArray(list) && list.length > 0) {

              el.innerHTML = list.map(c => `<div style="margin-bottom:2px;">${c}</div>`).join('');

            } else {

              el.innerText = '-';

            }

          }

        }

      })

      .getMultipleStudentsCourses(mainGroupStudents, getLogUser());

  }

}



function cleanSubjectName(roundStr) {

  if (!roundStr) return '';

  let str = roundStr.toString().trim();

  if (str.includes('1899')) return '';

  

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

  closeAllModals();

  const s = state.students.find(x => x.id === studentId);

  if (!s) {

    showToast('เนเธกเนเธเธเธเนเธญเธกเธนเธฅเธเธฑเธเน€เธฃเธตเธขเธเธฃเธฒเธขเธเธตเน', 'error');

    return;

  }

  

  // Set customer info

  document.getElementById('pr_customer').value = s.name + (s.nickname ? ' (' + s.nickname + ')' : '');

  document.getElementById('pr_phone').value = formatPhone(s.contact) || '';

  

  // Generate date in Thai Buddhist year (local year is 2026 -> 2569)

  const payDateToFormat = s.paymentDate || new Date();

  document.getElementById('pr_date').value = formatDateTimeToThaiLong(payDateToFormat);

  

  // Generate receipt number in format YYMMDDXXX

  let payDateObj = new Date();

  let payDateStr = s.paymentDate || '';

  if (payDateStr) {

    const parts = payDateStr.split('/');

    if (parts.length === 3) {

      payDateObj = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));

    }

  } else {

    payDateStr = `${payDateObj.getDate()}/${payDateObj.getMonth() + 1}/${payDateObj.getFullYear()}`;

  }

  

  const yearBE = payDateObj.getFullYear() + 543;

  const yy = yearBE.toString().slice(-2);

  const mm = String(payDateObj.getMonth() + 1).padStart(2, '0');

  const dd = String(payDateObj.getDate()).padStart(2, '0');

  

  // Find all students with same paymentDate

  const sameDayStudents = state.students.filter(x => (x.paymentDate || '') === payDateStr);

  sameDayStudents.sort((a, b) => (parseFloat(a.id) || 0) - (parseFloat(b.id) || 0) || a.name.localeCompare(b.name));

  const seqIndex = sameDayStudents.findIndex(x => x.id === s.id);

  const seqNum = seqIndex !== -1 ? (seqIndex + 1) : 1;

  const receiptNumber = `${yy}${mm}${dd}${String(seqNum).padStart(3, '0')}`;

  document.getElementById('pr_number').value = receiptNumber;

  

  // Default Tax ID

  document.getElementById('pr_tax_id').value = '0215562010486';

  document.getElementById('pr_address').value = 'เธญ.เน€เธกเธทเธญเธ เธ.เธฃเธฐเธขเธญเธ 21000';

  

  // Clear all 10 description and amount inputs

  for (let i = 1; i <= 10; i++) {

    document.getElementById(`pr_desc_${i}`).value = '';

    document.getElementById(`pr_amount_${i}`).value = '';

  }

  document.getElementById('pr_discount').value = 0;

  document.getElementById('pr_outstanding').value = 0;

  

  // Notes: default to empty

  document.getElementById('pr_note_1').value = '';

  document.getElementById('pr_note_2').value = '';

  document.getElementById('pr_note_3').value = '';

  

  // Payment channel

  const payChannel = s.paymentChannel || '';

  if (payChannel.toLowerCase().includes('เธชเธ”')) {

    document.getElementById('pr_payment_method').value = 'เน€เธเธดเธเธชเธ”';

  } else {

    document.getElementById('pr_payment_method').value = 'เน€เธเธดเธเนเธญเธ';

  }

  

  document.getElementById('pr_staff').value = s.staff || getLogUser() || '';

  

  // Auto-select branch based on s.branchLearn

  let studentBranch = '1';

  if (s.branchLearn && s.branchLearn.indexOf('2') !== -1) {

    studentBranch = '2';

  } else if (s.branchLearn && s.branchLearn.indexOf('3') !== -1) {

    studentBranch = '3';

  }

  document.getElementById('pr_branch_select').value = studentBranch;

  

  // Load branch details (address/phone)

  handleReceiptBranchChange();

  

  // Fetch detailed courses

  setLoading(true, 'เธเธณเธฅเธฑเธเธเนเธเธซเธฒเธฃเธฒเธขเธฅเธฐเน€เธญเธตเธขเธ”เธงเธดเธเธฒเน€เธฃเธตเธขเธเธเธฒเธเนเธเธฅเนเธเธตเธ•...');

  google.script.run

    .withSuccessHandler(courses => {

      setLoading(false);

      

      let totalCoursesPrice = 0;

      if (Array.isArray(courses) && courses.length > 0) {

        courses.forEach((c, idx) => {

          if (idx < 10) {

            const itemNum = idx + 1;

            let desc = c.courseName;

            if (c.dayTime) {

              desc += ` (${c.dayTime})`;

            }

            document.getElementById(`pr_desc_${itemNum}`).value = desc;

            const price = c.price || 0;

            document.getElementById(`pr_amount_${itemNum}`).value = price;

            totalCoursesPrice += price;

          }

        });

      } else {

        // Fallback to basic state.students matches

        const matches = state.students.filter(x => x.name === s.name && x.nickname === s.nickname);

        matches.forEach((m, idx) => {

          if (idx < 10) {

            const itemNum = idx + 1;

            document.getElementById(`pr_desc_${itemNum}`).value = cleanSubjectName(m.round) || m.classSection || '';

            const price = m.paid > 0 ? m.paid : (m.full || 0);

            document.getElementById(`pr_amount_${itemNum}`).value = price;

            totalCoursesPrice += price;

          }

        });

      }

      

      const regFull = s.full || 0;

      const computedDiscount = Math.max(0, totalCoursesPrice - regFull);

      document.getElementById('pr_discount').value = computedDiscount;

      document.getElementById('pr_outstanding').value = Math.max(0, (s.full || 0) - (s.paid || 0));

      

      updateReceiptPreview();

      // Open modal

      document.getElementById('print_receipt_modal').classList.add('active');

    })

    .withFailureHandler(err => {

      setLoading(false);

      

      let totalCoursesPrice = 0;

      // Fallback on error

      const matches = state.students.filter(x => x.name === s.name && x.nickname === s.nickname);

      matches.forEach((m, idx) => {

        if (idx < 10) {

          const itemNum = idx + 1;

          document.getElementById(`pr_desc_${itemNum}`).value = cleanSubjectName(m.round) || m.classSection || '';

          const price = m.paid > 0 ? m.paid : (m.full || 0);

          document.getElementById(`pr_amount_${itemNum}`).value = price;

          totalCoursesPrice += price;

        }

      });

      

      const regFull = s.full || 0;

      const computedDiscount = Math.max(0, totalCoursesPrice - regFull);

      document.getElementById('pr_discount').value = computedDiscount;

      document.getElementById('pr_outstanding').value = Math.max(0, (s.full || 0) - (s.paid || 0));

      

      updateReceiptPreview();

      // Open modal

      document.getElementById('print_receipt_modal').classList.add('active');

    })

    .getStudentDetailedCourses(s.name, s.nickname, s.grade, s.branchLearn, s.classType, getLogUser());

}



function handleReceiptBranchChange() {

  updateReceiptPreview();

}



function closePrintReceiptModal() {

  document.getElementById('print_receipt_modal').classList.remove('active');

}



function updateReceiptFromSelectedRounds(studentName) {

  const s = state.students.find(x => x.name === studentName);

  if (!s) return;

  

  const checkboxes = document.querySelectorAll('.pr-installment-cb:checked');

  if (checkboxes.length === 0) {

    const studentBranch = document.getElementById('pr_branch_select').value;

    

    for (let i = 1; i <= 10; i++) {

      document.getElementById(`pr_desc_${i}`).value = '';

      document.getElementById(`pr_amount_${i}`).value = '';

    }

    

    setLoading(true, 'เธเธณเธฅเธฑเธเธเธนเนเธเธทเธเธฃเธฒเธขเธฅเธฐเน€เธญเธตเธขเธ”เธงเธดเธเธฒเน€เธฃเธตเธขเธ...');

    google.script.run

      .withSuccessHandler(courses => {

        setLoading(false);

        let totalCoursesPrice = 0;

        if (Array.isArray(courses) && courses.length > 0) {

          courses.forEach((c, idx) => {

            if (idx < 10) {

              const itemNum = idx + 1;

              let desc = c.courseName;

              if (c.dayTime) desc += ` (${c.dayTime})`;

              document.getElementById(`pr_desc_${itemNum}`).value = desc;

              document.getElementById(`pr_amount_${itemNum}`).value = c.price || 0;

              totalCoursesPrice += c.price || 0;

            }

          });

        }

        

        const regFull = s.full || 0;

        document.getElementById('pr_discount').value = Math.max(0, totalCoursesPrice - regFull);

        document.getElementById('pr_outstanding').value = Math.max(0, (s.full || 0) - (s.paid || 0));

        

        const payChannel = s.paymentChannel || '';

        document.getElementById('pr_payment_method').value = payChannel.toLowerCase().includes('เธชเธ”') ? 'เน€เธเธดเธเธชเธ”' : 'เน€เธเธดเธเนเธญเธ';

        document.getElementById('pr_staff').value = s.staff || getLogUser() || '';

        document.getElementById('pr_date').value = formatDateTimeToThaiLong(s.paymentDate || new Date());

        

        updateReceiptPreview();

      })

      .getStudentDetailedCourses(s.name, s.nickname, s.grade, s.branchLearn, s.classType, getLogUser());

    return;

  }

  

  let totalSelectedAmount = 0;

  let selectedRounds = [];

  let latestDate = '';

  let latestChannel = 'เน€เธเธดเธเนเธญเธ';

  let latestStaff = '';

  let maxRoundSelected = 0;

  

  checkboxes.forEach(cb => {

    const amt = parseFloat(cb.getAttribute('data-amount')) || 0;

    const r = parseInt(cb.value);

    totalSelectedAmount += amt;

    selectedRounds.push(r);

    

    if (r > maxRoundSelected) {

      maxRoundSelected = r;

      latestDate = cb.getAttribute('data-date');

      latestChannel = cb.getAttribute('data-channel');

      latestStaff = cb.getAttribute('data-staff');

    }

  });

  

  selectedRounds.sort((a, b) => a - b);

  // เธเธเธฃเธฒเธขเธฅเธฐเน€เธญเธตเธขเธ”เธงเธดเธเธฒเน€เธฃเธตเธขเธเนเธฅเธฐเธฃเธฒเธเธฒเธงเธดเธเธฒเนเธ–เธง 1-10 เธ•เธฒเธกเน€เธ”เธดเธกเธ—เธธเธเธเธฃเธฐเธเธฒเธฃ เนเธกเนเนเธเนเนเธเธซเธฃเธทเธญเธฅเนเธฒเธเธเนเธฒ

  

  let totalPaidUpToMaxRound = 0;

  for (let r = 1; r <= maxRoundSelected; r++) {

    const amt = parseFloat(s[`payRound${r}_amount`]) || 0;

    totalPaidUpToMaxRound += amt;

  }

  

  const fullVal = s.full || 0;

  const outstanding = fullVal - totalPaidUpToMaxRound;

  

  document.getElementById('pr_discount').value = 0;

  document.getElementById('pr_outstanding').value = outstanding >= 0 ? outstanding : 0;

  

  if (latestDate) {

    document.getElementById('pr_date').value = formatDateTimeToThaiLong(latestDate);

  }

  

  if (latestChannel) {

    document.getElementById('pr_payment_method').value = latestChannel.toLowerCase().includes('เธชเธ”') ? 'เน€เธเธดเธเธชเธ”' : 'เน€เธเธดเธเนเธญเธ';

  }

  

  if (latestStaff) {

    document.getElementById('pr_staff').value = latestStaff;

  }

  

  updateReceiptPreview();

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



  const prDiscount = parseFloat(document.getElementById('pr_discount').value) || 0;

  const prOutstanding = parseFloat(document.getElementById('pr_outstanding').value) || 0;

  const netTotal = Math.max(0, totalAmount - prDiscount - prOutstanding);

  const totalText = thaiBahtText(netTotal);



  const headOfficeThai = 'เธชเธณเธเธฑเธเธเธฒเธเนเธซเธเน : 103/20 เธเธญเธขเนเธชเธเธเธฑเธเธ—เธฃเน 5 เธ–เธเธเนเธชเธเธเธฑเธเธ—เธฃเน เธ•.เน€เธเธดเธเธเธฃเธฐ เธญ.เน€เธกเธทเธญเธ เธ.เธฃเธฐเธขเธญเธ 21000 เนเธ—เธฃ. 097-210-7050 , 065-518-1855';

  const headOfficeEng = 'Head Office : 103/20 Soi Saengchan 5, Saengchan Road, Nernpra, Muang, Rayong 21000 Tel. 097-210-7050 , 065-518-1855';



  let branchAddressThai = headOfficeThai;

  let branchAddressEng = headOfficeEng;



  if (prBranchSelect === '2') {

    branchAddressThai = headOfficeThai + '<br>เธชเธฒเธเธฒ 2 : 2/17 เธ–เธเธเธงเธธเธ’เธดเธชเธฒเธฃ เธ•.เธ—เนเธฒเธเธฃเธฐเธ”เธนเน เธญ.เน€เธกเธทเธญเธ เธ.เธฃเธฐเธขเธญเธ 21000 เนเธ—เธฃ. 083-834-6067, 081-863-1311';

    branchAddressEng = headOfficeEng + '<br>Branch 2 : 2/17 Wuttisan Road, Tha Pradu, Muang, Rayong 21000 Tel. 083-834-6067, 081-863-1311';

  } else if (prBranchSelect === '3') {

    branchAddressThai = headOfficeThai + '<br>เธชเธฒเธเธฒ 3 : 13/7 เธก. 3 เธ–เธเธเธชเธธเธเธธเธกเธงเธดเธ— เธ•.เน€เธเธดเธเธเธฃเธฐ เธญ.เน€เธกเธทเธญเธ เธ.เธฃเธฐเธขเธญเธ 21000 เนเธ—เธฃ. 095-806-7979, 083-834-6067';

    branchAddressEng = headOfficeEng + '<br>Branch 3 : 13/7 Moo 3, Sukhumvit Road, Nernpra, Muang, Rayong 21000 Tel. 095-806-7979, 083-834-6067';

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

          <td style="width: 170px; text-align: right; vertical-align: middle; white-space: nowrap;">

            <div style="display: flex; justify-content: flex-end; align-items: center; gap: 12px;">

            <img src="data:image/jpeg;base64,${logo1Base64}" style="width: 78px; height: 78px; border-radius: 50%; object-fit: cover; display: block; border: 2px solid #1e3a8a;" />

            <img src="data:image/jpeg;base64,${logo2Base64}" style="width: 78px; height: 78px; border-radius: 50%; object-fit: cover; display: block; border: 2px solid #1e3a8a;" />

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

          <tr style="font-weight: bold;">

            <td colspan="2" style="text-align: right; padding: 4px !important;">เธฃเธงเธกเน€เธเธดเธ (Subtotal)</td>

            <td style="text-align: right; padding: 4px !important;">

              เธฟ${totalAmount.toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}

            </td>

          </tr>

          <tr style="font-weight: bold;">

            <td colspan="2" style="text-align: right; padding: 4px !important;">เธชเนเธงเธเธฅเธ” (Discount)</td>

            <td style="text-align: right; padding: 4px !important; color: #dc2626;">

              - เธฟ${prDiscount.toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}

            </td>

          </tr>

          <tr style="font-weight: bold;">

            <td colspan="2" style="text-align: right; padding: 4px !important;">เธเนเธฒเธเธเธณเธฃเธฐ (Outstanding)</td>

            <td style="text-align: right; padding: 4px !important; color: #dc2626;">

              - เธฟ${prOutstanding.toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}

            </td>

          </tr>

          <tr style="background-color: #fafafa; font-weight: bold;">

            <td colspan="2" style="text-align: right; padding: 6px !important;">เธเธณเธเธงเธเน€เธเธดเธเธฃเธงเธกเธ—เธฑเนเธเธชเธดเนเธ (Total Net)</td>

            <td style="text-align: right; font-size: 1.05rem; font-weight: 700; color: #1e3a8a; padding: 6px !important;">

              เธฟ${netTotal.toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}

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



function calculateInstallmentTotal() {

  let totalPaid = 0;

  let latestRound = 1;

  let hasPayment = false;

  

  for (let r = 1; r <= 4; r++) {

    const amt = parseFloat(document.getElementById(`pay_r${r}_amount`).value) || 0;

    totalPaid += amt;

    if (amt > 0) {

      latestRound = r;

      hasPayment = true;

    }

  }

  

  document.getElementById('student_paid').value = totalPaid;

  

  const fullVal = parseFloat(document.getElementById('student_full').value) || 0;

  const outstanding = fullVal - totalPaid;

  document.getElementById('student_outstanding').value = outstanding >= 0 ? outstanding : 0;

  

  // Copy latest round details to main fields (read-only summaries)

  if (hasPayment) {

    const dateVal = document.getElementById(`pay_r${latestRound}_date`).value;

    const channelVal = document.getElementById(`pay_r${latestRound}_channel`).value;

    const staffVal = document.getElementById(`pay_r${latestRound}_staff`).value.trim();

    const timeVal = document.getElementById(`pay_r${latestRound}_time`).value.trim();

    

    document.getElementById('student_pay_date').value = convertDateToSheet(dateVal);

    document.getElementById('student_pay_channel').value = channelVal;

    document.getElementById('student_staff').value = staffVal;

    document.getElementById('student_time_note').value = timeVal;

  } else {

    document.getElementById('student_pay_date').value = '';

    const payModeUnpaid = document.getElementById('pay_mode_unpaid');

    if (payModeUnpaid && payModeUnpaid.checked) {

      document.getElementById('student_pay_channel').value = 'เธขเธฑเธเนเธกเนเธเธณเธฃเธฐเน€เธเธดเธ';

    } else {

      document.getElementById('student_pay_channel').value = '';

    }

    document.getElementById('student_staff').value = '';

    document.getElementById('student_time_note').value = '';

  }

}



// ----------------------------------------------------

// Revenue Sub-Tabs and Summary Dashboard

// ----------------------------------------------------

function switchRevenueSubTab(tabName) {

  // Toggle active class on tab buttons

  const tabList = document.getElementById('tab_rev_list');

  const tabSummary = document.getElementById('tab_rev_summary');

  if (tabList) tabList.classList.toggle('active', tabName === 'list');

  if (tabSummary) tabSummary.classList.toggle('active', tabName === 'summary');

  

  // Toggle sub-panels display

  const panelList = document.getElementById('revenue_subpanel_list');

  const panelSummary = document.getElementById('revenue_subpanel_summary');

  if (panelList) panelList.style.display = tabName === 'list' ? 'block' : 'none';

  if (panelSummary) panelSummary.style.display = tabName === 'summary' ? 'block' : 'none';

  

  // Toggle Save button (only relevant for the interactive checkbox list)

  const saveBtn = document.getElementById('btn_save_revenue_logs');

  if (saveBtn) saveBtn.style.display = tabName === 'list' ? 'flex' : 'none';

  

  if (tabName === 'summary') {

    renderRevenueSummary();

  }

}



function parseDateDDMMYYYY(str) {

  if (!str) return 0;

  const parts = str.split('/');

  if (parts.length !== 3) return 0;

  return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10)).getTime();

}



function formatDateToThaiShortDate(dateObj) {

  const d = dateObj.getDate();

  const m = dateObj.getMonth() + 1;

  const y = dateObj.getFullYear();

  return `${d < 10 ? '0' + d : d}/${m < 10 ? '0' + m : m}/${y}`;

}



const thaiMonths = [

  'เธกเธเธฃเธฒเธเธก', 'เธเธธเธกเธ เธฒเธเธฑเธเธเน', 'เธกเธตเธเธฒเธเธก', 'เน€เธกเธฉเธฒเธขเธ', 'เธเธคเธฉเธ เธฒเธเธก', 'เธกเธดเธ–เธธเธเธฒเธขเธ',

  'เธเธฃเธเธเธฒเธเธก', 'เธชเธดเธเธซเธฒเธเธก', 'เธเธฑเธเธขเธฒเธขเธ', 'เธ•เธธเธฅเธฒเธเธก', 'เธเธคเธจเธเธดเธเธฒเธขเธ', 'เธเธฑเธเธงเธฒเธเธก'

];



function getMonthYearString(dateStr) {

  if (!dateStr) return 'เนเธกเนเธฃเธฐเธเธธ';

  const parts = dateStr.split('/');

  if (parts.length !== 3) return 'เนเธกเนเธฃเธฐเธเธธ';

  const monthIdx = parseInt(parts[1], 10) - 1;

  const year = parseInt(parts[2], 10);

  if (monthIdx < 0 || monthIdx > 11) return 'เนเธกเนเธฃเธฐเธเธธ';

  return `${thaiMonths[monthIdx]} ${year}`;

}



function getMonthYearSortKey(dateStr) {

  if (!dateStr) return 0;

  const parts = dateStr.split('/');

  if (parts.length !== 3) return 0;

  return parseInt(parts[2], 10) * 100 + parseInt(parts[1], 10);

}



function renderRevenueSummary() {

  const summaryCardsContainer = document.getElementById('revenue_summary_cards');

  if (!summaryCardsContainer) return; // not initialized or on another page

  

  const startDate = document.getElementById('log_start_date').value;

  const endDate = document.getElementById('log_end_date').value;

  if (!startDate || !endDate) return;

  

  const filtered = state.students.filter(s => isDateWithinRange(s.paymentDate, startDate, endDate));

  

  const branchGroups = {};

  const dailyGroups = {};

  const weeklyGroups = {};

  const monthlyGroups = {};

  

  let totalPaidSum = 0;

  let totalCount = 0;

  

  filtered.forEach(s => {

    const br = s.branchPay || s.branch || 'เธญเธทเนเธเน';

    const amt = parseFloat(s.paid) || 0;

    

    // Total

    totalPaidSum += amt;

    totalCount++;

    

    // Group by Branch

    if (!branchGroups[br]) {

      branchGroups[br] = { count: 0, sum: 0 };

    }

    branchGroups[br].count++;

    branchGroups[br].sum += amt;

    

    // Group by Daily

    const dateStr = s.paymentDate || 'เนเธกเนเธฃเธฐเธเธธ';

    if (!dailyGroups[dateStr]) {

      dailyGroups[dateStr] = { count: 0, sum: 0 };

    }

    dailyGroups[dateStr].count++;

    dailyGroups[dateStr].sum += amt;

    

    // Group by Weekly

    const parts = dateStr.split('/');

    if (parts.length === 3) {

      const date = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));

      if (!isNaN(date.getTime())) {

        const day = date.getDay();

        const diffToMonday = day === 0 ? -6 : 1 - day;

        const monday = new Date(date);

        monday.setDate(date.getDate() + diffToMonday);

        monday.setHours(0,0,0,0);

        const monTime = monday.getTime();

        

        const sunday = new Date(monday);

        sunday.setDate(monday.getDate() + 6);

        

        const rangeStr = `${formatDateToThaiShortDate(monday)} - ${formatDateToThaiShortDate(sunday)}`;

        if (!weeklyGroups[monTime]) {

          weeklyGroups[monTime] = { rangeStr: rangeStr, count: 0, sum: 0 };

        }

        weeklyGroups[monTime].count++;

        weeklyGroups[monTime].sum += amt;

      }

    }

    

    // Group by Monthly

    const sortKey = getMonthYearSortKey(dateStr);

    if (sortKey > 0) {

      const label = getMonthYearString(dateStr);

      if (!monthlyGroups[sortKey]) {

        monthlyGroups[sortKey] = { label: label, count: 0, sum: 0 };

      }

      monthlyGroups[sortKey].count++;

      monthlyGroups[sortKey].sum += amt;

    }

  });

  

  // Render Branch Cards

  let cardsHtml = `

    <div class="rev-summary-card" style="border-left: 4px solid var(--color-primary);">

      <div class="rev-summary-card-title">๐’ต เธขเธญเธ”เธฃเธงเธกเธ—เธฑเนเธเธซเธกเธ”</div>

      <div class="rev-summary-card-value" style="color: var(--color-primary-hover);">${totalPaidSum.toLocaleString()}</div>

      <div class="rev-summary-card-sub">เธเธณเธเธงเธ ${totalCount} เธฃเธฒเธขเธเธฒเธฃ</div>

    </div>

  `;

  

  const branchColors = {

    'เธชเธฒเธเธฒ1': '#3b82f6',

    'เธชเธฒเธเธฒ2': '#f97316',

    'เธชเธฒเธเธฒ3': '#a855f7',

    'เธชเธฒเธเธฒ 1': '#3b82f6',

    'เธชเธฒเธเธฒ 2': '#f97316',

    'เธชเธฒเธเธฒ 3': '#a855f7',

    'เธญเธญเธเนเธฅเธเน': '#14b8a6',

    'เธญเธทเนเธเน': '#64748b'

  };

  

  Object.keys(branchGroups).sort().forEach(br => {

    const color = branchColors[br] || '#10b981';

    const data = branchGroups[br];

    cardsHtml += `

      <div class="rev-summary-card" style="border-left: 4px solid ${color};">

        <div class="rev-summary-card-title">๐ข ${br}</div>

        <div class="rev-summary-card-value" style="color: ${color};">${data.sum.toLocaleString()}</div>

        <div class="rev-summary-card-sub">เธเธณเธเธงเธ ${data.count} เธฃเธฒเธขเธเธฒเธฃ</div>

      </div>

    `;

  });

  summaryCardsContainer.innerHTML = cardsHtml;

  

  // Populate Branch Table

  const branchTbody = document.getElementById('revenue_branch_summary_tbody');

  if (branchTbody) {

    branchTbody.innerHTML = '';

    const branches = Object.keys(branchGroups).sort();

    if (branches.length === 0) {

      branchTbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: var(--text-muted); padding: 20px;">เนเธกเนเธกเธตเธเนเธญเธกเธนเธฅเนเธเธเนเธงเธเธงเธฑเธเธ—เธตเนเน€เธฅเธทเธญเธ</td></tr>';

    } else {

      branches.forEach(br => {

        const tr = document.createElement('tr');

        tr.innerHTML = `

          <td style="font-weight:600;">${br}</td>

          <td style="text-align: right;">${branchGroups[br].count}</td>

          <td style="text-align: right; color: var(--color-success); font-weight: 600;">${branchGroups[br].sum.toLocaleString()}</td>

        `;

        branchTbody.appendChild(tr);

      });

    }

  }

  

  // Populate Daily Table

  const dailyTbody = document.getElementById('revenue_daily_summary_tbody');

  if (dailyTbody) {

    dailyTbody.innerHTML = '';

    const dailyKeys = Object.keys(dailyGroups).sort((a, b) => parseDateDDMMYYYY(b) - parseDateDDMMYYYY(a));

    if (dailyKeys.length === 0) {

      dailyTbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: var(--text-muted); padding: 20px;">เนเธกเนเธกเธตเธเนเธญเธกเธนเธฅเนเธเธเนเธงเธเธงเธฑเธเธ—เธตเนเน€เธฅเธทเธญเธ</td></tr>';

    } else {

      dailyKeys.forEach(dateStr => {

        const tr = document.createElement('tr');

        tr.innerHTML = `

          <td style="font-weight:600;">${dateStr}</td>

          <td style="text-align: right;">${dailyGroups[dateStr].count}</td>

          <td style="text-align: right; color: var(--color-success); font-weight: 600;">${dailyGroups[dateStr].sum.toLocaleString()}</td>

        `;

        dailyTbody.appendChild(tr);

      });

    }

  }

  

  // Populate Weekly Table

  const weeklyTbody = document.getElementById('revenue_weekly_summary_tbody');

  if (weeklyTbody) {

    weeklyTbody.innerHTML = '';

    const weeklyKeys = Object.keys(weeklyGroups).sort((a, b) => b - a);

    if (weeklyKeys.length === 0) {

      weeklyTbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: var(--text-muted); padding: 20px;">เนเธกเนเธกเธตเธเนเธญเธกเธนเธฅเนเธเธเนเธงเธเธงเธฑเธเธ—เธตเนเน€เธฅเธทเธญเธ</td></tr>';

    } else {

      weeklyKeys.forEach(monTime => {

        const tr = document.createElement('tr');

        tr.innerHTML = `

          <td style="font-weight:600;">${weeklyGroups[monTime].rangeStr}</td>

          <td style="text-align: right;">${weeklyGroups[monTime].count}</td>

          <td style="text-align: right; color: var(--color-success); font-weight: 600;">${weeklyGroups[monTime].sum.toLocaleString()}</td>

        `;

        weeklyTbody.appendChild(tr);

      });

    }

  }

  

  // Populate Monthly Table

  const monthlyTbody = document.getElementById('revenue_monthly_summary_tbody');

  if (monthlyTbody) {

    monthlyTbody.innerHTML = '';

    const monthlyKeys = Object.keys(monthlyGroups).sort((a, b) => b - a);

    if (monthlyKeys.length === 0) {

      monthlyTbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: var(--text-muted); padding: 20px;">เนเธกเนเธกเธตเธเนเธญเธกเธนเธฅเนเธเธเนเธงเธเธงเธฑเธเธ—เธตเนเน€เธฅเธทเธญเธ</td></tr>';

    } else {

      monthlyKeys.forEach(sortKey => {

        const tr = document.createElement('tr');

        tr.innerHTML = `

          <td style="font-weight:600;">${monthlyGroups[sortKey].label}</td>

          <td style="text-align: right;">${monthlyGroups[sortKey].count}</td>

          <td style="text-align: right; color: var(--color-success); font-weight: 600;">${monthlyGroups[sortKey].sum.toLocaleString()}</td>

        `;

        monthlyTbody.appendChild(tr);

      });

    }

  }

}



// ----------------------------------------------------

// User Profile Edit Logic

// ----------------------------------------------------

let profileImageDataUrl = ''; // Stores temporary uploaded profile image Base64



function openProfileModal() {

  const username = state.currentUser ? state.currentUser.username : '';

  if (!username) return;

  

  setLoading(true, 'เธเธณเธฅเธฑเธเธ”เธถเธเธเนเธญเธกเธนเธฅเนเธเธฃเนเธเธฅเน...');

  google.script.run

    .withSuccessHandler(res => {

      setLoading(false);

      if (res && res.success) {

        const p = res.profile;

        const uEl = document.getElementById('profile_username');

        if (uEl) uEl.value = p.username;

        const nEl = document.getElementById('profile_nickname');

        if (nEl) nEl.value = p.nickname || p.username;

        const fEl = document.getElementById('profile_fullname');

        if (fEl) fEl.value = p.fullName || '';

        const pEl = document.getElementById('profile_phone');
        if (pEl) pEl.value = p.phone || '';

        const schoolEl = document.getElementById('profile_school');
        if (schoolEl) schoolEl.value = p.school || '';

        const subjectsEl = document.getElementById('profile_subjects');
        if (subjectsEl) subjectsEl.value = p.subjects || '';

        const bEl = document.getElementById('profile_bank');
        if (bEl) {
          const bankVal = p.bank || '';
          // Try to find existing option
          let found = false;
          for (let opt of bEl.options) {
            if (opt.value === bankVal) { found = true; break; }
          }
          if (!found && bankVal) {
            // Add as "เธญเธทเนเธเน" or pick closest - set as เธญเธทเนเธเน
            bEl.value = 'เธญเธทเนเธเน';
          } else {
            bEl.value = bankVal;
          }
        }
        
        const aEl = document.getElementById('profile_account_no');
        if (aEl) aEl.value = p.accountNumber || '';
        
        const atEl = document.getElementById('profile_account_type');
        if (atEl) atEl.value = p.accountType || 'เธเธฑเธเธเธตเธ—เธฑเนเธงเนเธ';

        

        // Reset password fields

        const cpEl = document.getElementById('profile_curr_pass');

        if (cpEl) cpEl.value = '';

        const npEl = document.getElementById('profile_new_pass');

        if (npEl) npEl.value = '';

        const cfpEl = document.getElementById('profile_confirm_pass');

        if (cfpEl) cfpEl.value = '';

        if (document.getElementById('profile_confirm_pass_group')) {

          document.getElementById('profile_confirm_pass_group').style.display = 'none';

        }

        

        // Set up preview

        const imgEl = document.getElementById('profile_pic_preview_img');

        const textEl = document.getElementById('profile_pic_preview_text');

        

        profileImageDataUrl = p.profilePic || '';

        if (profileImageDataUrl) {

          if (imgEl) {

            imgEl.src = profileImageDataUrl;

            imgEl.style.display = 'block';

          }

          if (textEl) textEl.style.display = 'none';

        } else {

          if (imgEl) imgEl.style.display = 'none';

          const nameForInitials = p.nickname || p.username;

          if (textEl) {

            textEl.innerText = nameForInitials.substring(0, 2).toUpperCase();

            textEl.style.display = 'block';

          }

        }

        

        if (document.getElementById('profile_modal')) {

          document.getElementById('profile_modal').classList.add('active');

        }

      } else {

        showToast('เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เธ”เธถเธเธเนเธญเธกเธนเธฅเนเธเธฃเนเธเธฅเนเนเธ”เน: ' + res.error, 'error');

      }

    })

    .withFailureHandler(err => {

      setLoading(false);

      showToast('เน€เธเธดเธ”เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”เนเธเธเธฒเธฃเน€เธเธทเนเธญเธกเธ•เนเธญ: ' + err.message, 'error');

    })

    .getUserProfile(username);

}



function closeProfileModal() {

  if (document.getElementById('profile_modal')) {

    document.getElementById('profile_modal').classList.remove('active');

  }

  if (document.getElementById('profile_form')) {

    document.getElementById('profile_form').reset();

  }

  profileImageDataUrl = '';

}



function toggleProfileConfirmPassGroup() {

  const npEl = document.getElementById('profile_new_pass');

  const newPass = npEl ? npEl.value : '';

  const confirmGroup = document.getElementById('profile_confirm_pass_group');

  if (confirmGroup) {

    if (newPass.length > 0) {

      confirmGroup.style.display = 'block';

    } else {

      confirmGroup.style.display = 'none';

    }

  }

}



function handleProfilePicSelect(e) {

  const file = e.target.files[0];

  if (!file) return;

  

  const reader = new FileReader();

  reader.onload = function(event) {

    const img = new Image();

    img.onload = function() {

      // Resize image using Canvas to max 120x120px to keep base64 string short and fit inside Google Sheets cell

      const canvas = document.createElement('canvas');

      let width = img.width;

      let height = img.height;

      const maxSize = 120;

      

      if (width > height) {

        if (width > maxSize) {

          height = Math.round((height * maxSize) / width);

          width = maxSize;

        }

      } else {

        if (height > maxSize) {

          width = Math.round((width * maxSize) / height);

          height = maxSize;

        }

      }

      

      canvas.width = width;

      canvas.height = height;

      const ctx = canvas.getContext('2d');

      ctx.drawImage(img, 0, 0, width, height);

      

      profileImageDataUrl = canvas.toDataURL('image/jpeg', 0.85); // Compress as JPEG at 85% quality

      

      // Update preview in modal

      const imgEl = document.getElementById('profile_pic_preview_img');

      const textEl = document.getElementById('profile_pic_preview_text');

      if (imgEl) {

        imgEl.src = profileImageDataUrl;

        imgEl.style.display = 'block';

      }

      if (textEl) textEl.style.display = 'none';

    };

    img.src = event.target.result;

  };

  reader.readAsDataURL(file);

}



function saveUserProfileData(e) {

  e.preventDefault();

  const uEl = document.getElementById('profile_username');

  const username = uEl ? uEl.value : '';

  const nEl = document.getElementById('profile_nickname');

  const nickname = nEl ? nEl.value.trim() : '';

  const fEl = document.getElementById('profile_fullname');

  const fullName = fEl ? fEl.value.trim() : '';

  const pEl = document.getElementById('profile_phone');

  const phone = pEl ? pEl.value.trim() : '';

  const sEl = document.getElementById('profile_school');
  const school = sEl ? sEl.value.trim() : '';

  const subEl = document.getElementById('profile_subjects');
  const subjects = subEl ? subEl.value.trim() : '';

  const bEl = document.getElementById('profile_bank');

  const bank = bEl ? bEl.value.trim() : '';

  const aEl = document.getElementById('profile_account_no');
  const accountNo = aEl ? aEl.value.trim() : '';

  const atEl = document.getElementById('profile_account_type');
  const accountType = atEl ? atEl.value : 'เธเธฑเธเธเธตเธ—เธฑเนเธงเนเธ';

  

  const cpEl = document.getElementById('profile_curr_pass');

  const currentPass = cpEl ? cpEl.value : '';

  const npEl = document.getElementById('profile_new_pass');

  const newPass = npEl ? npEl.value : '';

  const cfpEl = document.getElementById('profile_confirm_pass');

  const confirmPass = cfpEl ? cfpEl.value : '';

  

  if (newPass.length > 0) {

    if (newPass.length < 4) {

      showToast('เธฃเธซเธฑเธชเธเนเธฒเธเนเธซเธกเนเธ•เนเธญเธเธกเธตเธเธงเธฒเธกเธขเธฒเธงเธญเธขเนเธฒเธเธเนเธญเธข 4 เธ•เธฑเธงเธญเธฑเธเธฉเธฃ', 'warning');

      return;

    }

    if (newPass !== confirmPass) {

      showToast('เธเธฒเธฃเธขเธทเธเธขเธฑเธเธฃเธซเธฑเธชเธเนเธฒเธเนเธซเธกเนเนเธกเนเธ•เธฃเธเธเธฑเธ', 'warning');

      return;

    }

    if (!currentPass) {

      showToast('เธเธฃเธธเธ“เธฒเธเธฃเธญเธเธฃเธซเธฑเธชเธเนเธฒเธเธเธฑเธเธเธธเธเธฑเธเน€เธเธทเนเธญเธขเธทเธเธขเธฑเธเธชเธดเธ—เธเธดเนเนเธเธเธฒเธฃเน€เธเธฅเธตเนเธขเธเธฃเธซเธฑเธชเธเนเธฒเธ', 'warning');

      return;

    }

  }

  

  const profileData = {

    nickname: nickname,

    fullName: fullName,

    phone: phone,
    school: school,
    subjects: subjects,
    bank: bank,
    accountNumber: accountNo,
    accountType: accountType,
    profilePic: profileImageDataUrl

  };

  

  setLoading(true, 'เธเธณเธฅเธฑเธเธเธฑเธเธ—เธถเธเธเนเธญเธกเธนเธฅเนเธเธฃเนเธเธฅเน...');

  

  // 1. Save profile details

  google.script.run

    .withSuccessHandler(res => {

      if (res && res.success) {

        // If password needs to be changed

        if (newPass.length > 0) {

          google.script.run

            .withSuccessHandler(passRes => {

              setLoading(false);

              if (passRes && passRes.success) {

                showToast('เธเธฑเธเธ—เธถเธเธเนเธญเธกเธนเธฅเนเธเธฃเนเธเธฅเนเนเธฅเธฐเน€เธเธฅเธตเนเธขเธเธฃเธซเธฑเธชเธเนเธฒเธเธชเธณเน€เธฃเนเธ!', 'success');

                updateSessionAndSidebar(nickname, profileImageDataUrl);

                closeProfileModal();

              } else {

                showToast('เธเธฑเธเธ—เธถเธเนเธเธฃเนเธเธฅเนเธชเธณเน€เธฃเนเธ เนเธ•เนเน€เธเธฅเธตเนเธขเธเธฃเธซเธฑเธชเธเนเธฒเธเธฅเนเธกเน€เธซเธฅเธง: ' + passRes.error, 'error');

              }

            })

            .withFailureHandler(err => {

              setLoading(false);

              showToast('เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”เธเธฒเธฃเน€เธเธทเนเธญเธกเธ•เนเธญเธฃเธฐเธซเธงเนเธฒเธเน€เธเธฅเธตเนเธขเธเธฃเธซเธฑเธชเธเนเธฒเธ: ' + err.message, 'error');

            })

            .changeUserPasswordOwn(username, currentPass, newPass);

        } else {

          setLoading(false);

          showToast('เธเธฑเธเธ—เธถเธเธเนเธญเธกเธนเธฅเนเธเธฃเนเธเธฅเนเธชเธณเน€เธฃเนเธ!', 'success');

          updateSessionAndSidebar(nickname, profileImageDataUrl);

          closeProfileModal();

        }

      } else {

        setLoading(false);

        showToast('เธเธฑเธเธ—เธถเธเธเนเธญเธกเธนเธฅเธฅเนเธกเน€เธซเธฅเธง: ' + res.error, 'error');

      }

    })

    .withFailureHandler(err => {

      setLoading(false);

      showToast('เน€เธเธดเธ”เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”เนเธเธเธฒเธฃเธชเนเธเธเนเธญเธกเธนเธฅ: ' + err.message, 'error');

    })

    .saveUserProfile(username, profileData, getLogUser());

}



function updateSessionAndSidebar(nickname, profilePic) {

  // Update local session

  if (state.currentUser) {

    state.currentUser.nickname = nickname;

    state.currentUser.profilePic = profilePic;

    sessionStorage.setItem('pookpik_session', JSON.stringify(state.currentUser));

    

    // Update displayed elements

    const displayName = nickname || state.currentUser.username;

    const isTeacher = (state.currentUser.role === 'Teacher' || state.currentUser.role === 'เธเธฃเธน');

    

    if (isTeacher) {

      document.getElementById('teacher_user_display').innerText = displayName;

      

      // Reload sidebar details as well

      google.script.run

        .withSuccessHandler(res => {

          if (res && res.success && res.profile) {

            const p = res.profile;

            const fullDisplayName = p.nickname ? `${p.nickname} (${p.username})` : p.username;

            document.getElementById('teacher_user_display').innerText = fullDisplayName;

            document.getElementById('teacher_sidebar_username').innerText = p.username || '-';
            document.getElementById('teacher_sidebar_fullname').innerText = p.fullName || '-';
            document.getElementById('teacher_sidebar_nickname').innerText = p.nickname || '-';
            document.getElementById('teacher_sidebar_phone').innerText = formatPhone(p.phone) || '-';
            document.getElementById('teacher_sidebar_school').innerText = p.school || '-';
            document.getElementById('teacher_sidebar_subjects').innerText = p.subjects || '-';
            document.getElementById('teacher_sidebar_account_type').innerText = p.accountType || '-';
            document.getElementById('teacher_sidebar_bank').innerText = p.bank || '-';
            document.getElementById('teacher_sidebar_account').innerText = p.accountNumber || '-';

          }

        })

        .getUserProfile(state.currentUser.username);

        

      const avatarLettersEl = document.getElementById('teacher_avatar_letters');

      if (profilePic && profilePic !== '-') {

        avatarLettersEl.innerHTML = `<img src="${profilePic}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;

        if (avatarLettersEl) avatarLettersEl.style.background = 'transparent';

      } else {

        if (avatarLettersEl) avatarLettersEl.innerText = displayName.substring(0, 2).toUpperCase();

        if (avatarLettersEl) avatarLettersEl.style.background = 'var(--color-brown)';

      }

    } else {

      document.getElementById('current_user_display').innerText = displayName;

      const avatarLettersEl = document.getElementById('avatar_letters');

      if (profilePic && profilePic !== '-') {

        avatarLettersEl.innerHTML = `<img src="${profilePic}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;

        if (avatarLettersEl) avatarLettersEl.style.background = 'transparent';

      } else {

        if (avatarLettersEl) avatarLettersEl.innerText = displayName.substring(0, 2).toUpperCase();

        if (avatarLettersEl) avatarLettersEl.style.background = 'var(--color-brown)';

      }

    }

  }

}



// ----------------------------------------------------

// DYNAMIC STUDENT EVALUATION FORM SYSTEM

// ----------------------------------------------------

var evalMathCriteria = [

  "1. เธเธทเนเธเธเธฒเธเธเธงเธฒเธกเธฃเธนเนเน€เธ”เธดเธกเธ—เธตเนเธ•เนเธญเธเนเธเนเนเธเธเธฒเธฃเธ•เนเธญเธขเธญเธ”เน€เธเธทเนเธญเธซเธฒเธ—เธตเนเธชเธญเธ",

  "2. เธเธงเธฒเธกเธชเธฒเธกเธฒเธฃเธ–เธเธฒเธฃเน€เธฃเธตเธขเธเธฃเธนเนเน€เธเธทเนเธญเธซเธฒเนเธซเธกเน",

  "3. เธเธงเธฒเธกเธชเธฒเธกเธฒเธฃเธ–เนเธเธเธฒเธฃเธงเธดเน€เธเธฃเธฒเธฐเธซเนเนเธเธ—เธขเน เนเธฅเธฐเธเธฑเธเธเธฃเธฐเน€เธ”เนเธเธเนเธญเธเธณเธ–เธฒเธก",

  "4. เธเธฒเธฃเธ•เธญเธเธเธณเธ–เธฒเธกเนเธเธซเนเธญเธเน€เธฃเธตเธขเธ",

  "5. เธเธฒเธฃเธ—เธณเนเธเธเธเธถเธเธซเธฑเธ”/ เธเนเธญเธชเธญเธเธฃเธฐเธ”เธฑเธเธเนเธฒเธข (เธเธณเธเธงเธ“)",

  "6. เธเธฒเธฃเธ—เธณเนเธเธเธเธถเธเธซเธฑเธ”/ เธเนเธญเธชเธญเธเธฃเธฐเธ”เธฑเธเธเธฅเธฒเธ (เน€เธเนเธเธเธงเธฒเธกเน€เธเนเธฒเนเธ เนเธฅเธฐเธเธฒเธฃเธเธณเนเธเนเธเน)",

  "7. เธเธฒเธฃเธ—เธณเนเธเธเธเธถเธเธซเธฑเธ”/เธเนเธญเธชเธญเธเธฃเธฐเธ”เธฑเธเธขเธฒเธ(เน€เธเนเธเนเธเธ—เธขเนเธเธฑเธเธซเธฒ)",

  "8. เธเธงเธฒเธกเธชเธฒเธกเธฒเธฃเธ–เนเธเธเธฒเธฃเธเธฅเธดเธเนเธเธฅเธ เนเธเนเธซเธฅเธฑเธ, เธเธ,  เธ—เธคเธฉเธเธต เธ•เธฅเธญเธ”เธเธเธญเธเธเนเธเธงเธฒเธกเธฃเธนเนเธ•เนเธฒเธ เน เน€เธเธทเนเธญเธซเธฒเธเธณเธ•เธญเธ",

  "9. เธชเธกเธฒเธเธดเนเธเธเธฒเธฃเน€เธฃเธตเธขเธ เนเธฅเธฐเธเธงเธฒเธกเธ•เธฑเนเธเนเธเน€เธฃเธตเธขเธ",

  "10. เธเธงเธฒเธกเธเธขเธฑเธเธซเธกเธฑเนเธเน€เธเธตเธขเธฃ",

  "11. เธเธงเธฒเธกเธเธเธ—เธเนเธเธเธฒเธฃเน€เธฃเธตเธขเธเธฃเธนเน"

];



var evalSciCriteria = [

  "1. เธเธทเนเธเธเธฒเธเธเธงเธฒเธกเธฃเธนเนเน€เธ”เธดเธกเธ—เธตเนเธ•เนเธญเธเนเธเนเนเธเธเธฒเธฃเธ•เนเธญเธขเธญเธ”เน€เธเธทเนเธญเธซเธฒเธ—เธตเนเธชเธญเธ",

  "2. เธเธงเธฒเธกเธชเธฒเธกเธฒเธฃเธ–เธเธฒเธฃเน€เธฃเธตเธขเธเธฃเธนเนเน€เธเธทเนเธญเธซเธฒเนเธซเธกเน",

  "3. เธเธงเธฒเธกเธชเธฒเธกเธฒเธฃเธ–เนเธเธเธฒเธฃเธงเธดเน€เธเธฃเธฒเธฐเธซเนเนเธเธ—เธขเน เนเธฅเธฐเธเธฑเธเธเธฃเธฐเน€เธ”เนเธเธเนเธญเธเธณเธ–เธฒเธก",

  "4. เธเธฒเธฃเธ•เธญเธเธเธณเธ–เธฒเธกเนเธเธซเนเธญเธเน€เธฃเธตเธขเธ",

  "5. เธเธฒเธฃเธ—เธณเนเธเธเธเธถเธเธซเธฑเธ”/เธเนเธญเธชเธญเธเธฃเธฐเธ”เธฑเธเธเนเธฒเธข (เธเธงเธฒเธกเธเธณ เธเธงเธฒเธกเน€เธเนเธฒเนเธ เธเธทเนเธเธเธฒเธ)",

  "6. เธเธฒเธฃเธ—เธณเนเธเธเธเธถเธเธซเธฑเธ”/ เธเนเธญเธชเธญเธเธฃเธฐเธ”เธฑเธเธเธฅเธฒเธ (เน€เธเนเธเธเธงเธฒเธกเน€เธเนเธฒเนเธ เนเธฅเธฐเธเธฒเธฃเธเธณเนเธเนเธเน)",

  "7. เธเธฒเธฃเธ—เธณเนเธเธเธเธถเธเธซเธฑเธ”/เธเนเธญเธชเธญเธเธฃเธฐเธ”เธฑเธเธขเธฒเธ (เน€เธเนเธเธเธฒเธฃเธงเธดเน€เธเธฃเธฒเธฐเธซเน เธชเธฑเธเน€เธเธฃเธฒเธฐเธซเน เธเธฃเธฐเธขเธธเธเธ•เน)",

  "8. เธเธงเธฒเธกเธชเธฒเธกเธฒเธฃเธ–เนเธเธเธฒเธฃเธเธฅเธดเธเนเธเธฅเธ เนเธเนเธซเธฅเธฑเธ, เธเธ, เธ—เธคเธฉเธเธต เธ•เธฅเธญเธ”เธเธเธญเธเธเนเธเธงเธฒเธกเธฃเธนเนเธ•เนเธฒเธ เน เน€เธเธทเนเธญเธซเธฒเธเธณเธ•เธญเธ",

  "9. เธชเธกเธฒเธเธดเนเธเธเธฒเธฃเน€เธฃเธตเธขเธ เนเธฅเธฐเธเธงเธฒเธกเธ•เธฑเนเธเนเธเน€เธฃเธตเธขเธ",

  "10. เธเธงเธฒเธกเธเธขเธฑเธเธซเธกเธฑเนเธเน€เธเธตเธขเธฃ",

  "11. เธเธงเธฒเธกเธเธเธ—เธเนเธเธเธฒเธฃเน€เธฃเธตเธขเธเธฃเธนเน"

];



var evalLangSocialCriteria = [

  "1. เธเธทเนเธเธเธฒเธเธเธงเธฒเธกเธฃเธนเนเน€เธ”เธดเธกเธ—เธตเนเธ•เนเธญเธเนเธเนเนเธเธเธฒเธฃเธ•เนเธญเธขเธญเธ”เน€เธเธทเนเธญเธซเธฒเธ—เธตเนเธชเธญเธ",

  "2. เธเธงเธฒเธกเธชเธฒเธกเธฒเธฃเธ–เธเธฒเธฃเน€เธฃเธตเธขเธเธฃเธนเนเน€เธเธทเนเธญเธซเธฒเนเธซเธกเน",

  "3. เธเธงเธฒเธกเธชเธฒเธกเธฒเธฃเธ–เนเธเธเธฒเธฃเธงเธดเน€เธเธฃเธฒเธฐเธซเนเนเธเธ—เธขเน เธเธฃเธฐเนเธขเธ เธฃเธนเธเนเธเธเธ•เนเธฒเธ เน",

  "4. เธเธฒเธฃเธ•เธญเธเธเธณเธ–เธฒเธกเนเธเธซเนเธญเธเน€เธฃเธตเธขเธ",

  "5. เธ—เธฑเธเธฉเธฐเธเธฒเธฃเธเธฑเธ (เธเธฑเธเนเธเธเธงเธฒเธกเธ–เธนเธเธ•เนเธญเธ)",

  "6. เธ—เธฑเธเธฉเธฐเธเธฒเธฃเธเธนเธ” (เธซเธฅเธฑเธเนเธงเธขเธฒเธเธฃเธ“เนเนเธฅเธฐเธเธฒเธฃเธญเธญเธเน€เธชเธตเธขเธเธ–เธนเธเธ•เนเธญเธ)",

  "7. เธ—เธฑเธเธฉเธฐเธเธฒเธฃเธญเนเธฒเธ (เธเธฒเธฃเธญเธญเธเน€เธชเธตเธขเธเนเธฅเธฐเธเธฑเธเนเธเธเธงเธฒเธกเธ–เธนเธเธ•เนเธญเธ)",

  "8. เธ—เธฑเธเธฉเธฐเธเธฒเธฃเน€เธเธตเธขเธ (เธซเธฅเธฑเธเนเธงเธขเธฒเธเธฃเธ“เน เนเธฅเธฐเธชเธฐเธเธ”เธ–เธนเธเธ•เนเธญเธ)",

  "9. เธชเธกเธฒเธเธดเนเธเธเธฒเธฃเน€เธฃเธตเธขเธ เนเธฅเธฐเธเธงเธฒเธกเธ•เธฑเนเธเนเธเน€เธฃเธตเธขเธ",

  "10. เธเธงเธฒเธกเธเธขเธฑเธเธซเธกเธฑเนเธเน€เธเธตเธขเธฃ",

  "11. เธเธงเธฒเธกเธเธเธ—เธเนเธเธเธฒเธฃเน€เธฃเธตเธขเธเธฃเธนเน"

];





function initEvaluationForm() {

  setLoading(true, 'เธเธณเธฅเธฑเธเนเธซเธฅเธ”เธเนเธญเธกเธนเธฅเธเธญเธฃเนเธชเธเธญเธเธเธธเธ“เธเธฃเธน...');

  

  // Set default date to today

  const today = new Date();

  const dateStr = today.getFullYear() + '-' + 

    String(today.getMonth() + 1).padStart(2, '0') + '-' + 

    String(today.getDate()).padStart(2, '0');

  const evalDateEl = document.getElementById('eval_date');

  if (evalDateEl) evalDateEl.value = dateStr;

  

  // Set teacher name

  const teacherInput = document.getElementById('eval_teacher');

  if (teacherInput) {

    teacherInput.value = state.currentUser ? (state.currentUser.nickname || state.currentUser.username || '') : '';

  }

  

  // Clean form fields

  document.getElementById('eval_grade').value = '';

  document.getElementById('eval_branch').value = '';

  document.getElementById('eval_subject').value = '';

  

  // Load evaluation history first to know who is already evaluated

  google.script.run

    .withSuccessHandler(function(list) {

      if (Array.isArray(list)) {

        state.evaluations = list;

      } else {

        state.evaluations = [];

      }

      

      // Fetch courses and students specific to this teacher

      google.script.run

        .withSuccessHandler(function(res) {

          setLoading(false);

          const courseSelect = document.getElementById('eval_course');

          const studentSelect = document.getElementById('eval_student');

          if (!courseSelect || !studentSelect) return;

          

          courseSelect.innerHTML = '<option value="">-- เน€เธฅเธทเธญเธเธเธญเธฃเนเธชเน€เธฃเธตเธขเธ --</option>';

          studentSelect.innerHTML = '<option value="">-- เน€เธฅเธทเธญเธเธเธฑเธเน€เธฃเธตเธขเธ --</option>';

          

          if (Array.isArray(res)) {

            state._teacherCourses = res; // Store globally

            res.forEach(function(c, idx) {

              const opt = document.createElement('option');

              opt.value = idx;

              opt.textContent = c.courseName;

              courseSelect.appendChild(opt);

            });

          } else {

            showToast('เนเธกเนเธเธเธ•เธฒเธฃเธฒเธเธชเธญเธเธเธญเธฃเนเธชเนเธ”เน เธเธญเธเธเธธเธ“เธเธฃเธน', 'warning');

          }

          

          // Default to Math/Science criteria grid at first

          renderEvalCriteriaGrid('math_sci');

        })

        .withFailureHandler(function(err) {

          setLoading(false);

          showToast('เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เธ”เธถเธเธเนเธญเธกเธนเธฅเธเธญเธฃเนเธชเธเธฃเธน: ' + err.message, 'error');

        })

        .getTeacherCoursesAndStudents(state.currentUser ? state.currentUser.username : getLogUser());

    })

    .withFailureHandler(function(err) {

      console.error('Failed to load evaluations list:', err);

      state.evaluations = [];

      setLoading(false);

    })

    .getEvaluationsList(getLogUser());

}



function onEvalCourseChange() {

  const courseSelect = document.getElementById('eval_course');

  const studentSelect = document.getElementById('eval_student');

  const subjectInput = document.getElementById('eval_subject');

  const gradeInput = document.getElementById('eval_grade');

  const branchInput = document.getElementById('eval_branch');

  

  if (!courseSelect || !studentSelect) return;

  

  const courseIdx = courseSelect.value;

  studentSelect.innerHTML = '<option value="">-- เน€เธฅเธทเธญเธเธเธฑเธเน€เธฃเธตเธขเธ --</option>';

  gradeInput.value = '';

  branchInput.value = '';

  subjectInput.value = '';

  

  if (courseIdx === '' || !state._teacherCourses || !state._teacherCourses[courseIdx]) {

    renderEvalCriteriaGrid('math_sci'); // default fallback

    return;

  }

  

  const course = state._teacherCourses[courseIdx];

  subjectInput.value = course.courseName;

  

  const selectedText = courseSelect.options[courseSelect.selectedIndex].text;

  const isSingleOrSubgroup = selectedText.includes('เน€เธ”เธตเนเธขเธง') || selectedText.includes('เธขเนเธญเธข');

  

  if (isSingleOrSubgroup) {

    setLoading(true, 'เธเธณเธฅเธฑเธเธเนเธเธซเธฒเธฃเธฒเธขเธฅเธฐเน€เธญเธตเธขเธ”เธเธญเธฃเนเธชเน€เธ”เธตเนเธขเธง/เธขเนเธญเธข...');

    google.script.run

      .withSuccessHandler(function(res) {

        setLoading(false);

        if (res && res.success && res.data) {

          const data = res.data;

          

          studentSelect.innerHTML = '';

          const opt = document.createElement('option');

          opt.value = data.studentName;

          opt.textContent = data.studentName;

          opt.selected = true;

          studentSelect.appendChild(opt);

          

          gradeInput.value = data.grade;

          branchInput.value = data.branch;

          subjectInput.value = data.subject;

        } else {

          populateRegularStudents(course);

        }

      })

      .withFailureHandler(function(err) {

        setLoading(false);

        populateRegularStudents(course);

      })

      .getLatestSingleOrSubgroupDetails(selectedText);

  } else {

    populateRegularStudents(course);

  }

  

  function populateRegularStudents(courseObj) {

    if (Array.isArray(courseObj.students)) {

      const evals = state.evaluations || [];

      courseObj.students.forEach(function(s, idx) {

        const hasEvaluated = evals.some(function(ev) {

          const cleanEvSub = (ev.subject || '').toString().trim().toLowerCase();

          const cleanCourseSub = (courseObj.courseName || '').toString().trim().toLowerCase();

          const cleanEvStuName = (ev.studentName || '').toString().trim().toLowerCase();

          const cleanStuName = (s.name || '').toString().trim().toLowerCase();

          const cleanStuNick = (s.nickname || '').toString().trim().toLowerCase();

          

          const isSubjectMatch = (cleanEvSub === cleanCourseSub);

          const isStudentMatch = (cleanEvStuName === cleanStuName || (cleanStuNick !== '' && cleanEvStuName.includes(cleanStuNick)));

          

          return isSubjectMatch && isStudentMatch;

        });

        

        if (!hasEvaluated) {

          const opt = document.createElement('option');

          opt.value = idx;

          opt.textContent = s.nickname ? s.name + ' (' + s.nickname + ')' : s.name;

          studentSelect.appendChild(opt);

        }

      });

      

      if (studentSelect.options.length === 1) {

        const opt = document.createElement('option');

        opt.value = "";

        opt.disabled = true;

        opt.textContent = "-- เธเธฃเธฐเน€เธกเธดเธเธเธฃเธเธ—เธธเธเธเธเนเธฅเนเธง --";

        studentSelect.appendChild(opt);

      }

    }

  }

  

  // Determine template based on subject keywords

  const subjectLower = course.courseName.toLowerCase();

  let templateType = 'math'; // default fallback

  

  if (subjectLower.includes('เธงเธดเธ—เธขเน') || subjectLower.includes('science') || 

      subjectLower.includes('เน€เธเธกเธต') || subjectLower.includes('chemistry') || subjectLower.includes('chem') ||

      subjectLower.includes('เธเธดเธชเธดเธเธชเน') || subjectLower.includes('physics') || subjectLower.includes('phy') ||

      subjectLower.includes('เธเธตเธงเธฐ') || subjectLower.includes('biology') || subjectLower.includes('bio')) {

    templateType = 'sci';

  } else if (subjectLower.includes('เธเธ“เธดเธ•') || subjectLower.includes('math')) {

    templateType = 'math';

  } else if (subjectLower.includes('เธญเธฑเธเธเธคเธฉ') || subjectLower.includes('english') || subjectLower.includes('eng') ||

             subjectLower.includes('เนเธ—เธข') || subjectLower.includes('thai') || 

             subjectLower.includes('เธชเธฑเธเธเธก') || subjectLower.includes('social')) {

    templateType = 'lang_social';

  }

  

  renderEvalCriteriaGrid(templateType);

  

  if(document.getElementById('split_feedback_container')) document.getElementById('split_feedback_container').style.display = 'flex';

  const singleFb = document.getElementById('single_feedback_container');

  if (singleFb) singleFb.style.display = 'none';

}

 

function renderEvalCriteriaGrid(type) {

  const tbody = document.getElementById('eval_criteria_tbody');

  const label = document.getElementById('eval_template_label');

  if (!tbody) return;

  

  tbody.innerHTML = '';

  let criteria;

  let labelText = '';

  let badgeClass = '';

  

  if (type === 'sci') {

    criteria = evalSciCriteria;

    labelText = 'เธซเธกเธงเธ”เธงเธดเธ—เธขเธฒเธจเธฒเธชเธ•เธฃเน/เธเธดเธชเธดเธเธชเน/เน€เธเธกเธต/เธเธตเธงเธงเธดเธ—เธขเธฒ';

    badgeClass = 'badge-success';

  } else if (type === 'math') {

    criteria = evalMathCriteria;

    labelText = 'เธซเธกเธงเธ”เธเธ“เธดเธ•เธจเธฒเธชเธ•เธฃเน/เธเธณเธเธงเธ“';

    badgeClass = 'badge-info';

  } else {

    criteria = evalLangSocialCriteria;

    labelText = 'เธซเธกเธงเธ”เธญเธฑเธเธเธคเธฉ/เนเธ—เธข/เธชเธฑเธเธเธก/เธ เธฒเธฉเธฒ';

    badgeClass = 'badge-primary';

  }

  

  if (label) {

    label.textContent = labelText;

    label.className = 'badge ' + badgeClass;

  }

  

  criteria.forEach(function(item, idx) {

    const tr = document.createElement('tr');

    tr.innerHTML = 

      `<td style="padding: 6px; font-weight: 500; font-size: 0.76rem;">${item}</td>` +

      `<td style="text-align: center; padding: 6px;"><input type="radio" name="score_${idx}" value="เนเธกเนเธเนเธฒเธ" required style="width:16px; height:16px; cursor:pointer;"></td>` +

      `<td style="text-align: center; padding: 6px;"><input type="radio" name="score_${idx}" value="เน€เธเธฃเธ” 1" required style="width:16px; height:16px; cursor:pointer;"></td>` +

      `<td style="text-align: center; padding: 6px;"><input type="radio" name="score_${idx}" value="เน€เธเธฃเธ” 2" required style="width:16px; height:16px; cursor:pointer;"></td>` +

      `<td style="text-align: center; padding: 6px;"><input type="radio" name="score_${idx}" value="เน€เธเธฃเธ” 3" required style="width:16px; height:16px; cursor:pointer;"></td>` +

      `<td style="text-align: center; padding: 6px;"><input type="radio" name="score_${idx}" value="เน€เธเธฃเธ” 4" required style="width:16px; height:16px; cursor:pointer;" checked></td>` +

      `<td style="text-align: center; padding: 6px;"><input type="radio" name="score_${idx}" value="เน€เธเธตเธขเธฃเธ•เธดเธเธดเธขเธก" required style="width:16px; height:16px; cursor:pointer;"></td>`;

    tbody.appendChild(tr);

  });

}



function handleEvalStudentChange() {

  const courseSelect = document.getElementById('eval_course');

  const studentSelect = document.getElementById('eval_student');

  const gradeInput = document.getElementById('eval_grade');

  const branchInput = document.getElementById('eval_branch');

  

  if (!courseSelect || !studentSelect || !gradeInput || !branchInput) return;

  

  const courseIdx = courseSelect.value;

  const studentIdx = studentSelect.value;

  

  if (courseIdx === '' || studentIdx === '' || !state._teacherCourses[courseIdx] || !state._teacherCourses[courseIdx].students[studentIdx]) {

    gradeInput.value = '';

    branchInput.value = '';

    return;

  }

  

  const student = state._teacherCourses[courseIdx].students[studentIdx];

  gradeInput.value = student.grade || '';

  branchInput.value = student.branch || '';

}



function submitStudentEvaluation(event) {

  event.preventDefault();

  

  const courseSelect = document.getElementById('eval_course');

  const studentSelect = document.getElementById('eval_student');

  

  const cIdx = courseSelect ? courseSelect.value : '';

  const sIdx = studentSelect ? studentSelect.value : '';

  

  if (cIdx === '' || sIdx === '' || !state._teacherCourses || !state._teacherCourses[cIdx]) {

    showToast('เธเธฃเธธเธ“เธฒเน€เธฅเธทเธญเธเธเธญเธฃเนเธชเนเธฅเธฐเธเธฑเธเน€เธฃเธตเธขเธเธเนเธญเธเธชเนเธเนเธเธเธฃเธฐเน€เธกเธดเธ', 'error');

    return;

  }

  

  const course = state._teacherCourses[cIdx];

  let student = null;

  

  const isPrivateOrSubgroup = isNaN(sIdx) || sIdx === '' || !course.students || !course.students[sIdx];

  if (isPrivateOrSubgroup) {

    let namePart = studentSelect.value;

    let nickPart = '';

    const matchParen = namePart.match(/(.+?)\((.+?)\)/);

    if (matchParen) {

      namePart = matchParen[1].trim();

      nickPart = matchParen[2].trim();

    }

    student = {

      name: namePart,

      nickname: nickPart,

      grade: document.getElementById('eval_grade').value || '',

      branch: document.getElementById('eval_branch').value || ''

    };

  } else {

    student = course.students[sIdx];

  }



  

  // Validate and gather the 6 sub-items for Strengths, Improvements, and Recommendations

  const validateAndGetFeedbackItems = (className, nameTh) => {

    const items = [];

    const inputs = document.querySelectorAll('.' + className);

    let filledCount = 0;

    let invalidLength = false;

    

    inputs.forEach(input => {

      const val = input.value.trim();

      if (val) {

        filledCount++;

        if (val.length < 50) {

          invalidLength = true;

        }

        items.push(val);

      }

    });

    

    if (filledCount < 3) {

      return { valid: false, error: `เธซเธฑเธงเธเนเธญ "${nameTh}" เธ•เนเธญเธเธ•เธญเธเธญเธขเนเธฒเธเธเนเธญเธข 3 เธเนเธญเธเธถเนเธเนเธ` };

    }

    if (invalidLength) {

      return { valid: false, error: `เธซเธฑเธงเธเนเธญ "${nameTh}" เนเธ•เนเธฅเธฐเธเนเธญเธ—เธตเนเธ•เธญเธเธเธฐเธ•เนเธญเธเธกเธตเธเธงเธฒเธกเธขเธฒเธง 50 เธ•เธฑเธงเธญเธฑเธเธฉเธฃเธเธถเนเธเนเธ` };

    }

    

    const formattedStr = items.map((val, idx) => `${idx + 1}. ${val}`).join('\n');

    return { valid: true, value: formattedStr };

  };



  const strengthsRes = validateAndGetFeedbackItems('eval-strength-item', 'เธเธธเธ”เน€เธ”เนเธเนเธเธเธฒเธฃเน€เธฃเธตเธขเธเธฃเธนเนเธเธญเธเธเธฑเธเน€เธฃเธตเธขเธเธ—เธตเนเธเธงเธฃเธฃเธฑเธเธฉเธฒเนเธงเน เนเธฅเธฐเธชเนเธเน€เธชเธฃเธดเธกเธ•เนเธญเนเธ');

  if (!strengthsRes.valid) {

    showToast(strengthsRes.error, 'error');

    return;

  }



  const improvementsRes = validateAndGetFeedbackItems('eval-improvement-item', 'เธเธฃเธฐเน€เธ”เนเธเธ—เธตเนเธเธงเธฃเนเธเนเนเธ เน€เธเธทเนเธญเนเธซเนเธเธฅเธเธฒเธฃเน€เธฃเธตเธขเธเธ”เธตเธเธถเนเธ');

  if (!improvementsRes.valid) {

    showToast(improvementsRes.error, 'error');

    return;

  }



  const recommendationsRes = validateAndGetFeedbackItems('eval-recommendation-item', 'เธเนเธญเน€เธชเธเธญเนเธเธฐเธญเธทเนเธเน เน€เธเธทเนเธญเธชเนเธเน€เธชเธฃเธดเธกเธจเธฑเธเธขเธ เธฒเธ');

  if (!recommendationsRes.valid) {

    showToast(recommendationsRes.error, 'error');

    return;

  }



  // Gather dynamic table ratings

  const ratings = {};

  const templateLabelText = document.getElementById('eval_template_label').textContent;

  let criteria;

  if (templateLabelText.includes('เธงเธดเธ—เธขเธฒเธจเธฒเธชเธ•เธฃเน')) {

    criteria = evalSciCriteria;

  } else if (templateLabelText.includes('เธเธ“เธดเธ•เธจเธฒเธชเธ•เธฃเน')) {

    criteria = evalMathCriteria;

  } else {

    criteria = evalLangSocialCriteria;

  }

  

  for (let i = 0; i < criteria.length; i++) {

    const radioGroup = document.getElementsByName('score_' + i);

    let selectedVal = 'เน€เธเธฃเธ” 4'; // default

    for (let r = 0; r < radioGroup.length; r++) {

      if (radioGroup[r].checked) {

        selectedVal = radioGroup[r].value;

        break;

      }

    }

    ratings[criteria[i]] = selectedVal;

  }

  

  const data = {

    studentName: student.name || '',

    nickname: student.nickname || '',

    grade: document.getElementById('eval_grade').value || '',

    branch: document.getElementById('eval_branch').value || '',

    date: document.getElementById('eval_date').value || '',

    subject: course.courseName || '',

    teacher: document.getElementById('eval_teacher').value || '',

    scores: ratings,

    strengths: strengthsRes.value,

    improvements: improvementsRes.value,

    recommendations: recommendationsRes.value

  };

  

  if (!data.date || !data.subject || !data.teacher) {

    showToast('เธเธฃเธธเธ“เธฒเธเธฃเธญเธเธเนเธญเธกเธนเธฅเนเธซเนเธเธฃเธเธ–เนเธงเธ (เธงเธฑเธเธ—เธตเน, เธงเธดเธเธฒ, เธเธฃเธนเธเธนเนเธเธฃเธฐเน€เธกเธดเธ)', 'error');

    return;

  }

  

  setLoading(true, 'เธเธณเธฅเธฑเธเธเธฑเธเธ—เธถเธเนเธเธเธฃเธฐเน€เธกเธดเธเธฅเธเธเธฒเธเธเนเธญเธกเธนเธฅ...');

  google.script.run

    .withSuccessHandler(function(res) {

      setLoading(false);

      if (res && res.success) {

        showToast('เธเธฑเธเธ—เธถเธเนเธเธเธฃเธฐเน€เธกเธดเธเธเธฑเธเน€เธฃเธตเธขเธเธชเธณเน€เธฃเนเธเน€เธฃเธตเธขเธเธฃเนเธญเธข โ“', 'success');

        

        // Reset inputs

        studentSelect.value = '';

        document.getElementById('eval_grade').value = '';

        document.getElementById('eval_branch').value = '';

        

        // Reset all 18 input fields

        document.querySelectorAll('.eval-strength-item, .eval-improvement-item, .eval-recommendation-item').forEach(input => {

          input.value = '';

        });

        

        // Reset radios back to "Grade 4" default

        for (let i = 0; i < criteria.length; i++) {

          const radioGroup = document.getElementsByName('score_' + i);

          if (radioGroup.length >= 6) {

            radioGroup[4].checked = true; // เน€เธเธฃเธ” 4

          }

        }

        

        // Refresh history

        loadEvaluationsList();

      } else {

        showToast('เธเธฑเธเธ—เธถเธเนเธเธเธฃเธฐเน€เธกเธดเธเธฅเนเธกเน€เธซเธฅเธง: ' + (res ? res.error : 'unknown'), 'error');

      }

    })

    .withFailureHandler(function(err) {

      setLoading(false);

      showToast('เน€เธเธดเธ”เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”: ' + err.message, 'error');

    })

    .submitEvaluation(data, getLogUser());

}



function loadEvaluationsList() {

  google.script.run

    .withSuccessHandler(function(list) {

      if (Array.isArray(list)) {

        state.evaluations = list;

      } else {

        state.evaluations = [];

      }

      

      // Re-trigger course change if a course is already selected to refresh the filtered student list

      const courseSelect = document.getElementById('eval_course');

      if (courseSelect && courseSelect.value !== '') {

        onEvalCourseChange();

      }

    })

    .withFailureHandler(function(err) {

      console.error('Failed to load evaluations list:', err);

      state.evaluations = [];

    })

    .getEvaluationsList(getLogUser());

}



function deleteAdminEvaluation(evalId) {

  const ev = window._adminEvalsCache.find(e => e.evalId === evalId);

  if (!ev) return;

  

  Swal.fire({

    title: 'เธขเธทเธเธขเธฑเธเธเธฒเธฃเธฅเธเนเธเธเธฃเธฐเน€เธกเธดเธ?',

    html: `เธเธธเธ“เธ•เนเธญเธเธเธฒเธฃเธฅเธเนเธเธเธฃเธฐเน€เธกเธดเธเธเธญเธ <b>${ev.studentName}</b> เนเธเนเธซเธฃเธทเธญเนเธกเน?<br><br><span style="color:red; font-size:0.9em;">เธเธฒเธฃเธเธฃเธฐเธ—เธณเธเธตเนเนเธกเนเธชเธฒเธกเธฒเธฃเธ–เธเธนเนเธเธทเธเนเธ”เน</span>`,

    icon: 'warning',

    showCancelButton: true,

    confirmButtonColor: '#d33',

    cancelButtonColor: '#3085d6',

    confirmButtonText: 'เธฅเธเธเนเธญเธกเธนเธฅ',

    cancelButtonText: 'เธขเธเน€เธฅเธดเธ'

  }).then((result) => {

    if (result.isConfirmed) {

      Swal.fire({

        title: 'เธเธณเธฅเธฑเธเธฅเธเธเนเธญเธกเธนเธฅ...',

        allowOutsideClick: false,

        didOpen: () => Swal.showLoading()

      });

      

      google.script.run

        .withSuccessHandler(function(response) {

          if (response.success) {

            Swal.fire('เธชเธณเน€เธฃเนเธ', 'เธฅเธเนเธเธเธฃเธฐเน€เธกเธดเธเน€เธฃเธตเธขเธเธฃเนเธญเธขเนเธฅเนเธง', 'success');

            loadAdminEvaluations(); // Reload the list

          } else {

            Swal.fire('เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”', response.error, 'error');

          }

        })

        .withFailureHandler(function(error) {

          Swal.fire('เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”', error.message, 'error');

        })

        .deleteEvaluation(evalId, window.currentUser);

    }

  });

}



function openAdminEvaluationEditModal(evalId) {

  // Find the evaluation in cache

  const ev = window._adminEvalsCache.find(e => e.evalId === evalId);

  if (!ev) {

    showToast('เนเธกเนเธเธเธเนเธญเธกเธนเธฅเนเธเธเธฃเธฐเน€เธกเธดเธเธเธตเน', 'error');

    return;

  }

  

  document.getElementById('admin_eval_id').value = ev.evalId;

  document.getElementById('admin_eval_course').value = ev.subject || '';

  document.getElementById('admin_eval_student').value = ev.studentName + (ev.nickname ? ' (' + ev.nickname + ')' : '');

  document.getElementById('admin_eval_grade').value = ev.grade || '';

  document.getElementById('admin_eval_branch').value = ev.branch || '';

  document.getElementById('admin_eval_date').value = convertDateFromSheet(ev.date) || '';

  document.getElementById('admin_eval_subject').value = ev.subject || '';

  document.getElementById('admin_eval_teacher_name').value = ev.teacher;

  

  // Parse criteria ratings

  const subjectLower = (ev.subject || '').toLowerCase();

  let templateType = 'lang_social';

  if (subjectLower.includes('เธงเธดเธ—เธขเน') || subjectLower.includes('science') || subjectLower.includes('เน€เธเธกเธต') || subjectLower.includes('chem') ||

      subjectLower.includes('เธเธดเธชเธดเธเธชเน') || subjectLower.includes('physics') || subjectLower.includes('phy') ||

      subjectLower.includes('เธเธตเธงเธฐ') || subjectLower.includes('biology') || subjectLower.includes('bio')) {

    templateType = 'sci';

  } else if (subjectLower.includes('เธเธ“เธดเธ•') || subjectLower.includes('math')) {

    templateType = 'math';

  }

  

  const tbody = document.getElementById('admin_eval_criteria_tbody');

  const label = document.getElementById('admin_eval_template_label');

  if (tbody) {

    tbody.innerHTML = '';

    let criteria;

    let labelText = '';

    let badgeClass = '';

    

    if (templateType === 'sci') {

      criteria = evalSciCriteria;

      labelText = 'เธซเธกเธงเธ”เธงเธดเธ—เธขเธฒเธจเธฒเธชเธ•เธฃเน/เธเธดเธชเธดเธเธชเน/เน€เธเธกเธต/เธเธตเธงเธงเธดเธ—เธขเธฒ';

      badgeClass = 'badge-success';

    } else if (templateType === 'math') {

      criteria = evalMathCriteria;

      labelText = 'เธซเธกเธงเธ”เธเธ“เธดเธ•เธจเธฒเธชเธ•เธฃเน/เธเธณเธเธงเธ“';

      badgeClass = 'badge-info';

    } else {

      criteria = evalLangSocialCriteria;

      labelText = 'เธซเธกเธงเธ”เธญเธฑเธเธเธคเธฉ/เนเธ—เธข/เธชเธฑเธเธเธก/เธ เธฒเธฉเธฒ';

      badgeClass = 'badge-primary';

    }

    

    if (label) {

      label.textContent = labelText;

      label.className = 'badge ' + badgeClass;

    }

    

    criteria.forEach(function(item, idx) {

      const savedVal = ev.scores ? ev.scores[item] : 'เน€เธเธฃเธ” 4';

      

      const tr = document.createElement('tr');

      tr.innerHTML = 

        `<td style="padding: 6px; font-weight: 500; font-size: 0.76rem;">${item}</td>` +

        `<td style="text-align: center; padding: 6px;"><input type="radio" name="admin_score_${idx}" value="เนเธกเนเธเนเธฒเธ" ${savedVal === 'เนเธกเนเธเนเธฒเธ' ? 'checked' : ''} style="width:16px; height:16px; cursor:pointer;"></td>` +

        `<td style="text-align: center; padding: 6px;"><input type="radio" name="admin_score_${idx}" value="เน€เธเธฃเธ” 1" ${savedVal === 'เน€เธเธฃเธ” 1' ? 'checked' : ''} style="width:16px; height:16px; cursor:pointer;"></td>` +

        `<td style="text-align: center; padding: 6px;"><input type="radio" name="admin_score_${idx}" value="เน€เธเธฃเธ” 2" ${savedVal === 'เน€เธเธฃเธ” 2' ? 'checked' : ''} style="width:16px; height:16px; cursor:pointer;"></td>` +

        `<td style="text-align: center; padding: 6px;"><input type="radio" name="admin_score_${idx}" value="เน€เธเธฃเธ” 3" ${savedVal === 'เน€เธเธฃเธ” 3' ? 'checked' : ''} style="width:16px; height:16px; cursor:pointer;"></td>` +

        `<td style="text-align: center; padding: 6px;"><input type="radio" name="admin_score_${idx}" value="เน€เธเธฃเธ” 4" ${savedVal === 'เน€เธเธฃเธ” 4' ? 'checked' : ''} style="width:16px; height:16px; cursor:pointer;"></td>` +

        `<td style="text-align: center; padding: 6px;"><input type="radio" name="admin_score_${idx}" value="เน€เธเธตเธขเธฃเธ•เธดเธเธดเธขเธก" ${savedVal === 'เน€เธเธตเธขเธฃเธ•เธดเธเธดเธขเธก' ? 'checked' : ''} style="width:16px; height:16px; cursor:pointer;"></td>`;

      tbody.appendChild(tr);

    });

  }

  

  // Helper to parse newline feedback

  function parseFeedbackItems(feedbackStr) {

    const items = Array(6).fill('');

    if (feedbackStr) {

      const lines = feedbackStr.split('\n');

      lines.forEach(line => {

        const match = line.match(/^\d+\s*\.\s*(.*)$/);

        if (match) {

          const numStr = line.match(/^(\d+)/);

          if (numStr) {

            const idx = parseInt(numStr[1]) - 1;

            if (idx >= 0 && idx < 6) {

              items[idx] = match[1].trim();

            }

          }

        } else if (line.trim() !== '') {

          const emptyIdx = items.indexOf('');

          if (emptyIdx !== -1) {

            items[emptyIdx] = line.trim();

          }

        }

      });

    }

    return items;

  }

  

  const strengths = parseFeedbackItems(ev.strengths);

  const improvements = parseFeedbackItems(ev.improvements);

  const recommendations = parseFeedbackItems(ev.recommendations);

  

  for (let i = 1; i <= 6; i++) {

    document.getElementById(`admin_eval_strength_${i}`).value = strengths[i - 1];

    document.getElementById(`admin_eval_improvement_${i}`).value = improvements[i - 1];

    document.getElementById(`admin_eval_recommendation_${i}`).value = recommendations[i - 1];

  }

  

  document.getElementById('admin_evaluation_edit_modal').classList.add('active');

}



function closeAdminEvaluationEditModal() {

  document.getElementById('admin_evaluation_edit_modal').classList.remove('active');

}



function saveAdminEvaluationEdit(e) {

  e.preventDefault();

  

  // Gather dynamic table ratings

  const ratings = {};

  const templateLabelText = document.getElementById('admin_eval_template_label').textContent;

  let criteria;

  if (templateLabelText.includes('เธงเธดเธ—เธขเธฒเธจเธฒเธชเธ•เธฃเน')) {

    criteria = evalSciCriteria;

  } else if (templateLabelText.includes('เธเธ“เธดเธ•เธจเธฒเธชเธ•เธฃเน')) {

    criteria = evalMathCriteria;

  } else {

    criteria = evalLangSocialCriteria;

  }

  

  for (let i = 0; i < criteria.length; i++) {

    const radioGroup = document.getElementsByName('admin_score_' + i);

    let selectedVal = 'เน€เธเธฃเธ” 4';

    for (let r = 0; r < radioGroup.length; r++) {

      if (radioGroup[r].checked) {

        selectedVal = radioGroup[r].value;

        break;

      }

    }

    ratings[criteria[i]] = selectedVal;

  }

  

  // Helper to validate and serialize feedback inputs

  const getFeedbackItems = (className, nameTh) => {

    const inputs = document.querySelectorAll('.' + className);

    const items = [];

    let emptyCount = 0;

    let invalidLength = false;

    

    inputs.forEach(input => {

      const val = input.value.trim();

      if (val) {

        items.push(val);

        if (val.length < 50) {

          invalidLength = true;

        }

      } else {

        emptyCount++;

      }

    });

    

    if (items.length < 3) {

      return { valid: false, error: `เธซเธฑเธงเธเนเธญ "${nameTh}" เธ•เนเธญเธเธ•เธญเธเธญเธขเนเธฒเธเธเนเธญเธข 3 เธเนเธญเธเธถเนเธเนเธ` };

    }

    if (invalidLength) {

      return { valid: false, error: `เธซเธฑเธงเธเนเธญ "${nameTh}" เนเธ•เนเธฅเธฐเธเนเธญเธ—เธตเนเธ•เธญเธเธเธฐเธ•เนเธญเธเธกเธตเธเธงเธฒเธกเธขเธฒเธง 50 เธ•เธฑเธงเธญเธฑเธเธฉเธฃเธเธถเนเธเนเธ` };

    }

    

    const formattedStr = items.map((val, idx) => `${idx + 1}. ${val}`).join('\n');

    return { valid: true, value: formattedStr };

  };

  

  const strengthsRes = getFeedbackItems('admin-eval-strength-item', 'เธเธธเธ”เน€เธ”เนเธเนเธเธเธฒเธฃเน€เธฃเธตเธขเธเธฃเธนเนเธเธญเธเธเธฑเธเน€เธฃเธตเธขเธเธ—เธตเนเธเธงเธฃเธฃเธฑเธเธฉเธฒเนเธงเน เนเธฅเธฐเธชเนเธเน€เธชเธฃเธดเธกเธ•เนเธญเนเธ');

  if (!strengthsRes.valid) {

    showToast(strengthsRes.error, 'error');

    return;

  }

  

  const improvementsRes = getFeedbackItems('admin-eval-improvement-item', 'เธเธฃเธฐเน€เธ”เนเธเธ—เธตเนเธเธงเธฃเนเธเนเนเธ เน€เธเธทเนเธญเนเธซเนเธเธฅเธเธฒเธฃเน€เธฃเธตเธขเธเธ”เธตเธเธถเนเธ');

  if (!improvementsRes.valid) {

    showToast(improvementsRes.error, 'error');

    return;

  }

  

  const recommendationsRes = getFeedbackItems('admin-eval-recommendation-item', 'เธเนเธญเน€เธชเธเธญเนเธเธฐเธญเธทเนเธเน เน€เธเธทเนเธญเธชเนเธเน€เธชเธฃเธดเธกเธจเธฑเธเธขเธ เธฒเธ');

  if (!recommendationsRes.valid) {

    showToast(recommendationsRes.error, 'error');

    return;

  }

  

  const evalData = {

    evalId: document.getElementById('admin_eval_id').value,

    date: convertDateToSheet(document.getElementById('admin_eval_date').value),

    teacher: document.getElementById('admin_eval_teacher_name').value.trim(),

    scores: ratings,

    strengths: strengthsRes.value,

    improvements: improvementsRes.value,

    recommendations: recommendationsRes.value

  };

  

  setLoading(true, 'เธเธณเธฅเธฑเธเธเธฑเธเธ—เธถเธเธเธฒเธฃเนเธเนเนเธ...');

  

  google.script.run

    .withSuccessHandler(res => {

      setLoading(false);

      if (res && res.success) {

        showToast('เธญเธฑเธเน€เธ”เธ•เนเธเธเธฃเธฐเน€เธกเธดเธเน€เธฃเธตเธขเธเธฃเนเธญเธขเนเธฅเนเธง!', 'success');

        closeAdminEvaluationEditModal();

        loadAdminEvaluationsDashboard();

      } else {

        showToast('เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เธญเธฑเธเน€เธ”เธ•เนเธ”เน: ' + res.error, 'error');

      }

    })

    .withFailureHandler(err => {

      setLoading(false);

      showToast('เน€เธเธทเนเธญเธกเธ•เนเธญเธเธดเธ”เธเธฅเธฒเธ”: ' + err.message, 'error');

    })

    .updateEvaluation(evalData, getLogUser());

}



// ----------------------------------------------------

// 15. Admin Evaluations Dashboard

// ----------------------------------------------------

window._adminEvalsCache = [];

function loadAdminEvaluationsDashboard(isSilent = false) {

  const container = document.getElementById('admin_evaluation_dashboard_container');

  if (!isSilent || !window._adminEvalsCache || window._adminEvalsCache.length === 0) {

    container.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-muted);">เธเธณเธฅเธฑเธเนเธซเธฅเธ”เธเนเธญเธกเธนเธฅเนเธเธเธฃเธฐเน€เธกเธดเธ...</div>';

  }

  

  google.script.run

    .withSuccessHandler(res => {

      if (res && res.error) {

        if (!isSilent) {

          container.innerHTML = `<div style="color:red; text-align:center; padding: 20px;">เธเธเธเนเธญเธเธดเธ”เธเธฅเธฒเธ”: ${res.error}</div>`;

        }

        return;

      }

      

      window._adminEvalsCache = res.evals || res || [];

      renderAdminEvaluationsDashboard(res);

    })

    .withFailureHandler(err => {

      if (!isSilent) {

        container.innerHTML = `<div style="color:red; text-align:center; padding: 20px;">เธเธเธเนเธญเธเธดเธ”เธเธฅเธฒเธ”: ${err.message}</div>`;

      }

    })

    .getAdminEvalStats(); // Fetch evaluations and course enrollment counts

}



function renderAdminEvaluationsDashboard(res) {

  const container = document.getElementById('admin_evaluation_dashboard_container');

  container.innerHTML = '';

  

  const evals = Array.isArray(res) ? res : (res.evals || []);

  const counts = Array.isArray(res) ? {} : (res.counts || {});

  

  if (!evals || evals.length === 0) {

    container.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-muted); background: white; border-radius: 8px;">เธขเธฑเธเนเธกเนเธกเธตเธเธฒเธฃเธเธฃเธฐเน€เธกเธดเธเธเธฑเธเน€เธฃเธตเธขเธ</div>';

    return;

  }

  

  // Group by Course

  const grouped = {};

  evals.forEach(ev => {

    const subj = ev.subject || 'เนเธกเนเธฃเธฐเธเธธเธงเธดเธเธฒ';

    if (!grouped[subj]) {

      grouped[subj] = [];

    }

    grouped[subj].push(ev);

  });

  

  const courses = Object.keys(grouped).sort();

  

  courses.forEach(course => {

    // Create course section

    const section = document.createElement('div');

    section.className = 'glass-panel';

    section.style.padding = '20px';

    section.style.marginBottom = '20px';

    

    // Course Header

    const header = document.createElement('div');

    header.style.cssText = 'font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700; color: var(--color-primary-hover); margin-bottom: 16px; border-bottom: 2px solid var(--border-color); padding-bottom: 8px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;';

    

    const totalStudents = counts[course] || 0;

    const evaluated = grouped[course].length;

    let badgeHtml = '';

    if (totalStudents > 0) {

      if (evaluated >= totalStudents) {

        badgeHtml = `<span class="badge badge-success" style="font-size: 0.75rem;">เธเธฃเธเนเธฅเนเธง (${evaluated} เธเธ)</span>`;

      } else {

        badgeHtml = `<span class="badge badge-warning" style="font-size: 0.75rem;">เน€เธซเธฅเธทเธญ ${totalStudents - evaluated} เธเธ (เธ—เธณเนเธฅเนเธง ${evaluated}/${totalStudents})</span>`;

      }

    } else {

      badgeHtml = `<span class="badge badge-info" style="font-size: 0.75rem;">เธเธฃเธฐเน€เธกเธดเธเนเธฅเนเธง ${evaluated} เธเธ</span>`;

    }

    

    header.innerHTML = `<span>๐“</span> ${course} ${badgeHtml}`;

    section.appendChild(header);

    

    const gridContainer = document.createElement('div');

    gridContainer.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; margin-top: 15px;';

    

    grouped[course].forEach(ev => {

      const card = document.createElement('div');

      card.style.cssText = 'background: white; border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; display: flex; flex-direction: column; justify-content: space-between; gap: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); transition: all 0.2s ease;';

      card.onmouseover = () => { card.style.boxShadow = '0 4px 8px rgba(0,0,0,0.08)'; card.style.transform = 'translateY(-2px)'; };

      card.onmouseout = () => { card.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)'; card.style.transform = 'translateY(0)'; };

      

      card.innerHTML = `

        <div style="font-weight: 600; font-size: 0.85rem; color: var(--text-color);">${ev.studentName}</div>

        <div style="display: flex; gap: 6px;">

          <button class="btn btn-secondary" style="flex: 1; padding: 6px; font-size: 0.75rem;" onclick="openAdminEvaluationEditModal('${ev.evalId}')">โ๏ธ เธ”เธน/เนเธเนเนเธเธเนเธญเธกเธนเธฅ</button>

          <button class="btn btn-danger" style="padding: 6px; font-size: 0.75rem;" onclick="deleteAdminEvaluation('${ev.evalId}')"><i class="fas fa-trash"></i> เธฅเธ</button>

        </div>

      `;

      gridContainer.appendChild(card);

    });

    

    section.appendChild(gridContainer);

    container.appendChild(section);

  });

}









// --- DYNAMIC REGISTRATION LOGIC ---



const PAYMENT_CHANNELS = [

  "เธเธฃเธธเธเนเธ—เธข เธเธตเธเธดเนเธ",

  "เธเธฃเธธเธเน€เธ—เธ เธเธตเธเธดเนเธ",

  "SCB เธเธตเนเธเธดเนเธ",

  "เธเธฃเธธเธเธจเธฃเธต เธเธตเนเธเธดเนเธ",

  "TTB",

  "เธเธชเธดเธเธฃ เธเธตเนเธเธดเนเธ",

  "SCB เธเธธเธ“เธขเธฒเธข",

  "เธเธฃเธธเธเธจเธฃเธต เธเธธเธ“เธ•เธฒ",

  "เธเธฃเธธเธเธจเธฃเธต เธเธฑเธเธเธตเธเธฃเธดเธฉเธฑเธ—",

  "เธเธชเธดเธเธฃ เธเธฑเธเธเธตเธเธฃเธดเธฉเธฑเธ—(เธเธ”)",

  "เธเธชเธดเธเธฃ เธเธฑเธเธเธตเธเธฃเธดเธฉเธฑเธ—(เธชเนเธเธ)",

  "TTB เธเธฑเธเธเธตเธเธฃเธดเธฉเธฑเธ—(เธเธ”)",

  "TTB เธเธฑเธเธเธตเธเธฃเธดเธฉเธฑเธ—(เธชเนเธเธ)",

  "เน€เธเธดเธเธชเธ”",

  "เธเธตเนเธเธดเนเธ เนเธญเธ",

  "เธเธตเนเธ•เนเธ เนเธญเธ"

];



function generateStudentBlock(idx) {

  const channelOptions = PAYMENT_CHANNELS.map(c => `<option value="${c}">${c}</option>`).join('');

  

  return `

    <div class="student-block" data-idx="${idx}" style="border: 2px solid var(--border-color); padding: 15px; margin-bottom: 20px; border-radius: 8px; background: #fff;">

      <div style="font-weight: bold; font-size: 1.1rem; margin-bottom: 15px; color: var(--color-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">

        เธเธฑเธเน€เธฃเธตเธขเธเธเธเธ—เธตเน ${idx + 1}

      </div>

      

      <div class="section-title-group">

        <div class="section-label">เธเนเธญเธกเธนเธฅเธชเนเธงเธเธ•เธฑเธงเธเธฑเธเน€เธฃเธตเธขเธ & เธ•เธดเธ”เธ•เนเธญ</div>

      </div>

      <div class="form-grid-3" style="margin-bottom: 20px;">

        <div class="form-group">

          <label class="form-label">เธเธทเนเธญ-เธเธฒเธกเธชเธเธธเธฅเธเธฑเธเน€เธฃเธตเธขเธ</label>

          <input type="text" id="student_name_${idx}" class="form-input" placeholder="เธเธทเนเธญเธเธฃเธดเธ เธเธฒเธกเธชเธเธธเธฅเธเธฃเธดเธ" required>

        </div>

        <div class="form-group">

          <label class="form-label">เธเธทเนเธญเน€เธฅเนเธ</label>

          <input type="text" id="student_nickname_${idx}" class="form-input" placeholder="เธเธทเนเธญเน€เธฅเนเธ" required>

        </div>

        <div class="form-group">

          <label class="form-label">เธเธทเนเธญเนเธฃเธเน€เธฃเธตเธขเธ</label>

          <input type="text" id="student_school_${idx}" class="form-input" list="student_school_list" placeholder="เธเธดเธกเธเนเธเธทเนเธญเนเธฃเธเน€เธฃเธตเธขเธ..." required>

        </div>

        <div class="form-group">

          <label class="form-label">เธ—เธฑเธ (Section)</label>

          <input type="text" id="student_class_section_${idx}" class="form-input" placeholder="เน€เธเนเธ เธ.2/69, เธก.5ex1" required>

        </div>

        <div class="form-group">

          <label class="form-label">เน€เธเธญเธฃเนเธ•เธดเธ”เธ•เนเธญเธเธนเนเธเธเธเธฃเธญเธ</label>

          <input type="text" id="student_contact_${idx}" class="form-input" placeholder="เน€เธเธญเธฃเนเนเธ—เธฃเธจเธฑเธเธ—เน" required oninput="formatPhoneAsYouType(this)">

        </div>

        <div class="form-group">

          <label class="form-label">เธเธทเนเธญเนเธเธฃเนเธเธฅเนเนเธฅเธเน (Line Name)</label>

          <input type="text" id="student_line_name_${idx}" class="form-input" placeholder="เน€เธเนเธ เนเธกเน เธ“เธ”เธฒ เธ.2/69">

        </div>

        <div class="form-group">

          <label class="form-label">ID Line</label>

          <input type="text" id="student_line_id_${idx}" class="form-input" placeholder="เนเธญเธ”เธตเนเธฅเธเน">

        </div>

      </div>



      <div class="section-title-group">

        <div class="section-label">เธเนเธญเธกเธนเธฅเธเธฒเธฃเธเธณเธฃเธฐเน€เธเธดเธ & เธเธฑเนเธงเนเธกเธเน€เธฃเธตเธขเธ</div>

      </div>

      

      <div class="form-grid-3" style="margin-bottom: 20px;">

        <div class="form-group form-group-full-3">

          <label class="form-label">เธฃเธนเธเนเธเธเธเธฒเธฃเธเธณเธฃเธฐเน€เธเธดเธ</label>

          <div style="display: flex; gap: 20px; align-items: center; background: #f8fafc; padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">

            <label class="radio-label" style="display: flex; align-items: center; gap: 8px; cursor: pointer;">

              <input type="radio" name="pay_mode_${idx}" id="pay_mode_cash_${idx}" value="cash" checked onchange="calculateBlockOutstanding(${idx})"> เธชเธ”

            </label>

            <label class="radio-label" style="display: flex; align-items: center; gap: 8px; cursor: pointer;">

              <input type="radio" name="pay_mode_${idx}" id="pay_mode_transfer_${idx}" value="transfer" onchange="calculateBlockOutstanding(${idx})"> เนเธญเธ

            </label>

            <label class="radio-label" style="display: flex; align-items: center; gap: 8px; cursor: pointer;">

              <input type="radio" name="pay_mode_${idx}" id="pay_mode_card_${idx}" value="card" onchange="calculateBlockOutstanding(${idx})"> เธเธฑเธ•เธฃเน€เธเธฃเธ”เธดเธ•

            </label>

            <label class="radio-label" style="display: flex; align-items: center; gap: 8px; cursor: pointer;">

              <input type="radio" name="pay_mode_${idx}" id="pay_mode_unpaid_${idx}" value="unpaid" onchange="calculateBlockOutstanding(${idx})"> เธขเธฑเธเนเธกเนเธเธณเธฃเธฐ

            </label>

          </div>

        </div>

        

        <div class="form-group">

          <label class="form-label">เธขเธญเธ”เธเธฃเธดเธ (เธเนเธฒเน€เธฃเธตเธขเธเน€เธ•เนเธก)</label>

          <input type="number" id="student_full_${idx}" class="form-input" placeholder="0" oninput="calculateBlockOutstanding(${idx})" required>

        </div>

        <div class="form-group">

          <label class="form-label">เธขเธญเธ”เธเนเธฒเธขเธฃเธงเธก (เธเธฒเธ—)</label>

          <input type="number" id="student_paid_${idx}" class="form-input highlight-input" placeholder="0" readonly>

        </div>

        <div class="form-group">

          <label class="form-label">เธขเธญเธ”เธเธเธเนเธฒเธ (เธเธฒเธ—)</label>

          <input type="number" id="student_outstanding_${idx}" class="form-input" placeholder="0" readonly style="background-color: #fee2e2; border-color: #fca5a5; font-weight: bold; color: #b91c1c;">

        </div>

        <div class="form-group" id="card_fee_group_${idx}" style="display:none;">

          <label class="form-label" style="color:var(--color-primary);">เธเนเธฒเธเธฃเธฃเธกเน€เธเธตเธขเธกเธฃเธนเธ”เธเธฑเธ•เธฃ (3%)</label>

          <input type="number" id="student_card_fee_${idx}" class="form-input" placeholder="0" readonly style="background-color: #f0fdf4; border-color: #bbf7d0; color: #15803d; font-weight:bold;">

        </div>

        <div class="form-group" id="total_with_card_group_${idx}" style="display:none;">

          <label class="form-label" style="color:var(--color-primary);">เธขเธญเธ”เธฃเธงเธกเธเนเธฒเธฃเธนเธ”เธเธฑเธ•เธฃ</label>

          <input type="number" id="student_total_with_card_${idx}" class="form-input" placeholder="0" readonly style="background-color: #f0fdf4; border-color: #bbf7d0; color: #15803d; font-weight:bold;">

        </div>

        

        <div class="form-group">

          <label class="form-label">เธซเธกเธฒเธขเน€เธซเธ•เธธเธเธฒเธฃเธเธณเธฃเธฐเน€เธเธดเธ/เน€เธงเธฅเธฒ</label>

          <input type="text" id="student_time_note_${idx}" class="form-input" placeholder="เน€เธเนเธ เธเธณเธฃเธฐเธชเธดเนเธเน€เธ”เธทเธญเธ, เน€เธฃเธตเธขเธ 17.00-19.00">

        </div>

        <div class="form-group">

          <label class="form-label">เธซเธกเธฒเธขเน€เธซเธ•เธธเธญเธทเนเธเน (Admin)</label>

          <input type="text" id="student_extra_note_${idx}" class="form-input" placeholder="เน€เธเนเธ เธเธญเนเธเน€เธชเธฃเนเธ, เธขเนเธฒเธขเธฃเธญเธ">

        </div>

        

        <div class="form-group form-group-full-3" style="background: rgba(245, 158, 11, 0.05); padding: 12px; border-radius: var(--radius-md); border: 1px dashed #f59e0b; margin-top: 10px;">

          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">

            <label class="form-label" style="color: #d97706; margin-bottom: 0;">เธกเธตเธขเธญเธ”เธขเธเธกเธฒ (เธขเนเธฒเธขเธเธญเธฃเนเธช / เน€เธฃเธตเธขเธเนเธกเนเธเธฃเธ)</label>

            <label class="switch">

              <input type="checkbox" id="has_carried_forward_${idx}" onchange="toggleCarriedForwardBlock(${idx})">

              <span class="slider round"></span>

            </label>

          </div>

          <div id="carried_forward_group_${idx}" style="display: none; grid-template-columns: 1fr; gap: 15px;">

            <div>

              <label class="form-label" style="font-size: 0.8rem;">เธเธณเธเธงเธเน€เธเธดเธเธ—เธตเนเธขเธเธกเธฒ (เธเธณเนเธเธซเธฑเธเธฅเธเธเธฑเธเธขเธญเธ”เธเธฃเธดเธ)</label>

              <input type="number" id="student_carried_forward_${idx}" class="form-input" placeholder="0" oninput="calculateBlockOutstanding(${idx})" value="0">

            </div>

          </div>

        </div>



        <div class="form-group" style="margin-top: 10px;">

          <label class="form-label">เธเธฑเนเธงเนเธกเธเน€เธฃเธตเธขเธเธ—เธฑเนเธเธซเธกเธ”</label>

          <input type="text" id="student_hours_${idx}" class="form-input" placeholder="เน€เธเนเธ 20 เธเธก.">

        </div>

        <div class="form-group" style="margin-top: 10px;">

          <label class="form-label">เธเธฑเนเธงเนเธกเธเน€เธฃเธตเธขเธเธเธเน€เธซเธฅเธทเธญ</label>

          <input type="text" id="student_hours_left_${idx}" class="form-input" placeholder="เน€เธเนเธ 15 เธเธก.">

        </div>

      </div>



      <div style="margin-top: 10px; margin-bottom: 25px; border-top: 1px solid var(--border-color); padding-top: 15px;">

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">

          <h4 style="font-size: 0.95rem; font-weight: 600; color: var(--color-primary);">เธเธฑเธเธ—เธถเธเนเธเนเธเธเธณเธฃเธฐ (เธเธฃเธญเธเน€เธเธเธฒเธฐเธฃเธญเธเธ—เธตเนเธเนเธฒเธขเนเธฅเนเธง)</h4>

        </div>

        

        ${[1, 2, 3].map(r => `

        <div class="installment-row" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-bottom: 12px; background: rgba(0,0,0,0.02); padding: 10px; border-radius: 6px;">

          <div>

            <label style="font-size: 0.7rem; color: #64748b;">เธเธฃเธฑเนเธเธ—เธตเน ${r}: เธงเธฑเธเธ—เธตเนเธเธณเธฃเธฐ</label>

            <input type="date" id="pay_r${r}_date_${idx}" class="form-input" style="padding: 4px; font-size: 0.8rem;">

          </div>

          <div>

            <label style="font-size: 0.7rem; color: #64748b;">เธเธณเธเธงเธเน€เธเธดเธ</label>

            <input type="number" id="pay_r${r}_amount_${idx}" class="form-input" style="padding: 4px; font-size: 0.8rem;" placeholder="0" oninput="calculateBlockOutstanding(${idx})">

          </div>

          <div>

            <label style="font-size: 0.7rem; color: #64748b;">เธเนเธญเธเธ—เธฒเธ</label>

            <select id="pay_r${r}_channel_${idx}" class="form-select" style="padding: 4px; font-size: 0.8rem;">

              <option value="">- เน€เธฅเธทเธญเธ -</option>

              ${channelOptions}

            </select>

          </div>

          <div>

            <label style="font-size: 0.7rem; color: #64748b;">เธเธเธฑเธเธเธฒเธเธ—เธตเนเธฃเธฑเธเน€เธเธดเธ</label>

            <input type="text" id="pay_r${r}_staff_${idx}" class="form-input" style="padding: 4px; font-size: 0.8rem;" placeholder="เธเธทเนเธญเธเธเธฑเธเธเธฒเธ">

          </div>

          <div>

            <label style="font-size: 0.7rem; color: #64748b;">เน€เธงเธฅเธฒ (Time)</label>

            <input type="time" id="pay_r${r}_time_${idx}" class="form-input" style="padding: 4px; font-size: 0.8rem;">

          </div>

        </div>

        `).join('')}

      </div>

    </div>

  `;

}



window.handleClassTypeChange = function() {

  const classType = document.getElementById('student_class_type').value;

  const sizeGroup = document.getElementById('subgroup_size_group');

  const checkboxGroup = document.getElementById('course_checkboxes_wrapper');

  

  // Reset

  sizeGroup.style.display = 'none';

  if(checkboxGroup) checkboxGroup.style.display = 'none';

  

  let numBlocks = 1;

  

  if (classType === 'เธเธฅเธธเนเธกเธซเธฅเธฑเธ') {

    if(checkboxGroup) checkboxGroup.style.display = 'grid';

    numBlocks = 1;

  } else if (classType === 'เธเธฅเธธเนเธกเธขเนเธญเธข') {

    sizeGroup.style.display = 'block';

    const size = document.getElementById('student_subgroup_size').value;

    if (size.includes('2-3')) numBlocks = 3;

    else if (size.includes('4-5')) numBlocks = 5;

    else if (size.includes('6-10')) numBlocks = 10;

  } else if (classType === 'เน€เธ”เธตเนเธขเธง') {

    numBlocks = 1;

  }

  

    const isEditing = !!document.getElementById('student_id').value;

  if (!isEditing) {

    renderStudentBlocks(numBlocks);

  } else {

    // Even if we are editing, we might need to show/hide the subgroup size dropdown

    // but we don't need to re-render the block, because it clears inputs.

  }

  handleGradeBranchChange();

};



window.renderStudentBlocks = function(numBlocks) {

  const container = document.getElementById('dynamic_students_container');

  let html = '';

  for(let i=0; i<numBlocks; i++) {

    html += generateStudentBlock(i);

  }

  container.innerHTML = html;

};



window.toggleCarriedForwardBlock = function(idx) {

  const checked = document.getElementById(`has_carried_forward_${idx}`).checked;

  const group = document.getElementById(`carried_forward_group_${idx}`);

  if(checked) {

    group.style.display = 'grid';

  } else {

    group.style.display = 'none';

    document.getElementById(`student_carried_forward_${idx}`).value = 0;

    calculateBlockOutstanding(idx);

  }

};



window.calculateBlockOutstanding = function(idx) {

  const fullEl = document.getElementById(`student_full_${idx}`);

  const r1El = document.getElementById(`pay_r1_amount_${idx}`);

  const r2El = document.getElementById(`pay_r2_amount_${idx}`);

  const r3El = document.getElementById(`pay_r3_amount_${idx}`);

  const paidEl = document.getElementById(`student_paid_${idx}`);

  const outstandingEl = document.getElementById(`student_outstanding_${idx}`);

  const carriedForwardEl = document.getElementById(`student_carried_forward_${idx}`);

  

  const isCard = document.getElementById(`pay_mode_card_${idx}`).checked;

  

  const cardFeeGroup = document.getElementById(`card_fee_group_${idx}`);

  const totalWithCardGroup = document.getElementById(`total_with_card_group_${idx}`);

  const cardFeeEl = document.getElementById(`student_card_fee_${idx}`);

  const totalWithCardEl = document.getElementById(`student_total_with_card_${idx}`);

  

  if(!fullEl) return;

  

  const full = parseFloat(fullEl.value) || 0;

  const r1 = parseFloat(r1El.value) || 0;

  const r2 = parseFloat(r2El.value) || 0;

  const r3 = parseFloat(r3El.value) || 0;

  const carriedForward = parseFloat(carriedForwardEl.value) || 0;

  

  let targetAmount = full - carriedForward;

  let totalPaid = r1 + r2 + r3;

  let outstanding = 0;

  

  if (isCard) {

    const fee = targetAmount * 0.03;

    const totalWithCard = targetAmount + fee;

    outstanding = totalWithCard - totalPaid;

    

    cardFeeGroup.style.display = 'block';

    totalWithCardGroup.style.display = 'block';

    cardFeeEl.value = fee.toFixed(2);

    totalWithCardEl.value = totalWithCard.toFixed(2);

  } else {

    outstanding = targetAmount - totalPaid;

    cardFeeGroup.style.display = 'none';

    totalWithCardGroup.style.display = 'none';

    cardFeeEl.value = '';

    totalWithCardEl.value = '';

  }

  

  paidEl.value = totalPaid;

  outstandingEl.value = outstanding;

};



// Replace original saveStudent



// Background registration queue system

let saveStudentQueue = [];

let isSavingStudent = false;



function updateBackgroundQueueIndicator() {

  let indicator = document.getElementById('bg_queue_indicator');

  if (saveStudentQueue.length > 0 || isSavingStudent) {

    if (!indicator) {

      indicator = document.createElement('div');

      indicator.id = 'bg_queue_indicator';

      indicator.style.position = 'fixed';

      indicator.style.bottom = '20px';

      indicator.style.right = '20px';

      indicator.style.background = 'rgba(15, 23, 42, 0.95)';

      indicator.style.color = '#fff';

      indicator.style.padding = '12px 18px';

      indicator.style.borderRadius = '30px';

      indicator.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.4)';

      indicator.style.zIndex = '9999';

      indicator.style.fontSize = '0.85rem';

      indicator.style.display = 'flex';

      indicator.style.alignItems = 'center';

      indicator.style.gap = '10px';

      indicator.style.fontWeight = '500';

      indicator.style.backdropFilter = 'blur(10px)';

      indicator.style.border = '1px solid rgba(255, 255, 255, 0.15)';

      indicator.style.transition = 'all 0.3s ease';

      document.body.appendChild(indicator);

    }

    const currentTask = isSavingStudent ? 1 : 0;

    const remaining = saveStudentQueue.length - currentTask;

    const countText = (remaining > 0) ? ` (เธเธณเธฅเธฑเธเธเธฑเธเธ—เธถเธ 1 เธฃเธฒเธขเธเธฒเธฃ, เน€เธซเธฅเธทเธญเนเธเธเธดเธง ${remaining} เธฃเธฒเธขเธเธฒเธฃ)` : " (เธเธณเธฅเธฑเธเธเธฑเธเธ—เธถเธเธฃเธฒเธขเธเธฒเธฃเธชเธธเธ”เธ—เนเธฒเธข)";

    indicator.innerHTML = `

      <span style="width: 14px; height: 14px; border: 2px solid #fff; border-right-color: transparent; border-radius: 50%; display: inline-block; animation: spin 1s linear infinite;"></span>

      <span>เธเธณเธฅเธฑเธเธเธฑเธเธ—เธถเธเธเนเธญเธกเธนเธฅเธเธฑเธเน€เธฃเธตเธขเธเนเธเน€เธเธทเนเธญเธเธซเธฅเธฑเธ${countText}</span>

    `;

    

    if (!document.getElementById('spin_style')) {

      const style = document.createElement('style');

      style.id = 'spin_style';

      style.innerHTML = '@keyframes spin { to { transform: rotate(360deg); } }';

      document.head.appendChild(style);

    }

  } else {

    if (indicator) {

      indicator.remove();

    }

  }

}



function processSaveStudentQueue() {

  if (isSavingStudent) return;

  if (saveStudentQueue.length === 0) {

    updateBackgroundQueueIndicator();

    return;

  }

  

  isSavingStudent = true;

  updateBackgroundQueueIndicator();

  

  const item = saveStudentQueue[0];

  

  google.script.run

    .withSuccessHandler(res => {

      isSavingStudent = false;

      if (res && res.success) {

        showToast(`เธเธฑเธเธ—เธถเธเธเนเธญเธกเธนเธฅเธเธญเธ ${item.studentData.StudentName} เธชเธณเน€เธฃเนเธ!`, 'success');

        saveStudentQueue.shift(); // Remove the completed task

        if (typeof window.loadGridData === 'function') {

          window.loadGridData();

        }

      } else {

        showToast(`เน€เธเธดเธ”เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”เนเธเธเธฒเธฃเธเธฑเธเธ—เธถเธเธเธญเธ ${item.studentData.StudentName}: ` + (res ? res.message : 'เนเธกเนเธ—เธฃเธฒเธเธชเธฒเน€เธซเธ•เธธ'), 'error');

        saveStudentQueue.shift();

      }

      processSaveStudentQueue();

    })

    .withFailureHandler(err => {

      isSavingStudent = false;

      showToast(`เธเธฒเธฃเน€เธเธทเนเธญเธกเธ•เนเธญเธเธฑเธ”เธเนเธญเธเนเธเธเธฒเธฃเธเธฑเธเธ—เธถเธเธเธญเธ ${item.studentData.StudentName}: ${err.message}`, 'error');

      saveStudentQueue.shift();

      processSaveStudentQueue();

    })

    .addStudentRegistration(item.studentData, item.logUser);

}



window.saveStudent = function(e) {

  e.preventDefault();

  

  const blocks = document.querySelectorAll('.student-block');

  if(blocks.length === 0) return;

  

  const classType = document.getElementById('student_class_type').value;

  const subgroupSize = classType === 'เธเธฅเธธเนเธกเธขเนเธญเธข' ? document.getElementById('student_subgroup_size').value : '';

  const grade = document.getElementById('student_grade').value;

  const branchLearn = document.getElementById('student_branch_learn').value;

  const branchPay = document.getElementById('student_branch_pay').value;

  

  // Shared course logic

  let courseStr = "";

  if (classType === 'เธเธฅเธธเนเธกเธซเธฅเธฑเธ') {

    const selectedCheckboxes = document.querySelectorAll('.course-checkbox:checked');

    if (selectedCheckboxes.length > 0) {

      courseStr = Array.from(selectedCheckboxes).map(cb => cb.value).join(', ');

    } else {

      showToast('เธเธฃเธธเธ“เธฒเน€เธฅเธทเธญเธเธงเธดเธเธฒเน€เธฃเธตเธขเธเธญเธขเนเธฒเธเธเนเธญเธข 1 เธงเธดเธเธฒ (เธเธฅเธธเนเธกเธซเธฅเธฑเธ)', 'error');

      return;

    }

  } else {

    courseStr = document.getElementById('shared_course_name').value.trim();

    if(!courseStr) {

      showToast('เธเธฃเธธเธ“เธฒเธฃเธฐเธเธธเธเธทเนเธญเธเธญเธฃเนเธช', 'error');

      return;

    }

  }

  

  const studentDataArray = [];

  

  blocks.forEach(block => {

    const idx = block.getAttribute('data-idx');

    const name = document.getElementById(`student_name_${idx}`).value.trim();

    if(!name) return; // skip empty slots in a subgroup

    

    // Check if Edit mode (we only edit 1 student at a time, so student_id is shared but only valid for blocks.length=1)

    const studentId = document.getElementById('student_id') ? document.getElementById('student_id').value : '';

    

    const obj = {
      id: studentId,
      date: new Date().toISOString().split('T')[0],
      grade: grade,
      name: name,
      nickname: document.getElementById(`student_nickname_${idx}`).value.trim(),
      school: document.getElementById(`student_school_${idx}`).value.trim(),
      classSection: document.getElementById(`student_class_section_${idx}`).value.trim(),
      contact: document.getElementById(`student_contact_${idx}`).value.trim(),
      lineName: document.getElementById(`student_line_name_${idx}`).value.trim(),
      lineId: document.getElementById(`student_line_id_${idx}`).value.trim(),
      branchLearn: branchLearn,
      branchPay: branchPay,
      classType: classType,
      subgroupCoursesSize: subgroupSize,
      
      round: courseStr,
      subgroupCourses: courseStr.split(',').map(s => s.trim()).filter(s => s),
      
      paymentChannel: document.getElementById(`pay_mode_unpaid_${idx}`) && document.getElementById(`pay_mode_unpaid_${idx}`).checked ? 'unpaid' : (document.getElementById(`pay_mode_card_${idx}`).checked ? 'card' : (document.getElementById(`pay_mode_transfer_${idx}`).checked ? 'transfer' : 'cash')),
      full: parseFloat(document.getElementById(`student_full_${idx}`).value) || 0,
      paid: parseFloat(document.getElementById(`student_paid_${idx}`).value) || 0,
      outstanding: parseFloat(document.getElementById(`student_outstanding_${idx}`).value) || 0,
      carriedForwardFee: document.getElementById(`has_carried_forward_${idx}`).checked ? (parseFloat(document.getElementById(`student_carried_forward_${idx}`).value) || 0) : 0,
      
      paymentTimeNote: document.getElementById(`student_time_note_${idx}`).value.trim(),
      extraNote: document.getElementById(`student_extra_note_${idx}`).value.trim(),
      classHours: document.getElementById(`student_hours_${idx}`).value.trim(),
      classHoursLeft: document.getElementById(`student_hours_left_${idx}`).value.trim(),
      
      payRound1_date: document.getElementById(`pay_r1_date_${idx}`).value,
      payRound1_amount: document.getElementById(`pay_r1_amount_${idx}`).value,
      payRound1_channel: document.getElementById(`pay_r1_channel_${idx}`).value,
      payRound1_staff: document.getElementById(`pay_r1_staff_${idx}`).value,
      payRound1_time: document.getElementById(`pay_r1_time_${idx}`).value,
      
      payRound2_date: document.getElementById(`pay_r2_date_${idx}`).value,
      payRound2_amount: document.getElementById(`pay_r2_amount_${idx}`).value,
      payRound2_channel: document.getElementById(`pay_r2_channel_${idx}`).value,
      payRound2_staff: document.getElementById(`pay_r2_staff_${idx}`).value,
      payRound2_time: document.getElementById(`pay_r2_time_${idx}`).value,
      
      payRound3_date: document.getElementById(`pay_r3_date_${idx}`).value,
      payRound3_amount: document.getElementById(`pay_r3_amount_${idx}`).value,
      payRound3_channel: document.getElementById(`pay_r3_channel_${idx}`).value,
      payRound3_staff: document.getElementById(`pay_r3_staff_${idx}`).value,
      payRound3_time: document.getElementById(`pay_r3_time_${idx}`).value,
      
      paymentDate: new Date().toISOString().split('T')[0],
      staff: getLogUser()
    };

    studentDataArray.push(obj);

  });

  

  if (studentDataArray.length === 0) {

    showToast('เธเธฃเธธเธ“เธฒเธเธฃเธญเธเธเนเธญเธกเธนเธฅเธเธฑเธเน€เธฃเธตเธขเธเธญเธขเนเธฒเธเธเนเธญเธข 1 เธเธ', 'error');

    return;

  }

  

  // Add to background queue

  studentDataArray.forEach(studentData => {

    saveStudentQueue.push({

      studentData: studentData,

      logUser: getLogUser()

    });

  });

  

  closeStudentModal();

  showToast(`เน€เธเธดเนเธกเธฃเธฒเธขเธเธทเนเธญเธเธฑเธเน€เธฃเธตเธขเธ ${studentDataArray.length} เธเธเน€เธเนเธฒเธเธดเธงเธเธฑเธเธ—เธถเธเนเธเน€เธเธทเนเธญเธเธซเธฅเธฑเธเน€เธฃเธตเธขเธเธฃเนเธญเธขเนเธฅเนเธง`, 'info');

  processSaveStudentQueue();

};



// Ensure modal reset logic resets the dynamic blocks

const originalOpenStudentModal = window.openStudentModal;

window.openStudentModal = function(id = null, studentName = null) {

  // If editing an existing student, we must render exactly 1 block

  if (id) {
    if (document.getElementById('btn_register_new_course')) {
      document.getElementById('btn_register_new_course').style.display = 'inline-flex';
    }

    renderStudentBlocks(1);

    document.getElementById('student_class_type').disabled = false; // Allow editing class type

    document.getElementById('student_id').value = id;

    document.getElementById('student_modal_title').innerText = 'เนเธเนเนเธเธเนเธญเธกเธนเธฅเธเธฑเธเน€เธฃเธตเธขเธ';

    

    // Helper function to populate form from data object
    function populateEditForm(data) {
      document.getElementById('student_class_type').value = data.ClassType || data.classType || 'เธเธฅเธธเนเธกเธซเธฅเธฑเธ';
      handleClassTypeChange();
      
      document.getElementById('student_grade').value = data.Grade || data.grade || 'เธ.1';
      document.getElementById('student_branch_learn').value = data.BranchLearn || data.branchLearn || 'เธชเธฒเธเธฒ1';
      document.getElementById('student_branch_pay').value = data.BranchPay || data.branchPay || 'เธชเธฒเธเธฒ1';
      
      const courseVal = data.Course || data.round || '';
      if (document.getElementById('shared_course_name')) {
        document.getElementById('shared_course_name').value = courseVal;
      }
      
      // Populate Block 0
      document.getElementById('student_name_0').value = data.StudentName || data.name || '';
      document.getElementById('student_nickname_0').value = data.Nickname || data.nickname || '';
      document.getElementById('student_school_0').value = data.School || data.school || '';
      document.getElementById('student_class_section_0').value = data.ClassSection || data.classSection || '';
      document.getElementById('student_contact_0').value = data.Contact || data.contact || '';
      document.getElementById('student_line_name_0').value = data.LineName || data.lineName || '';
      document.getElementById('student_line_id_0').value = data.LineID || data.lineId || '';
      
      // Payment mode
      const payChannel = data.PaymentChannel || data.paymentChannel || '';
      const payMode = data.PayMode || '';
      if (payMode === 'card' || payChannel.includes('เธฃเธนเธ”') || payChannel.includes('card')) {
        if (document.getElementById('pay_mode_card_0')) document.getElementById('pay_mode_card_0').checked = true;
      } else if (payMode === 'transfer' || payChannel.includes('เนเธญเธ') || payChannel.includes('เธเธชเธดเธเธฃ') || payChannel.includes('SCB') || payChannel.includes('เธเธฃเธธเธ')) {
        if (document.getElementById('pay_mode_transfer_0')) document.getElementById('pay_mode_transfer_0').checked = true;
      } else if (payChannel.includes('เธชเธ”') || payChannel.includes('cash')) {
        if (document.getElementById('pay_mode_cash_0')) document.getElementById('pay_mode_cash_0').checked = true;
      } else {
        if (document.getElementById('pay_mode_transfer_0')) document.getElementById('pay_mode_transfer_0').checked = true;
      }
      
      document.getElementById('student_full_0').value = data.FullAmount || data.full || '';
      document.getElementById('student_paid_0').value = data.PaidAmount || data.paid || '';
      document.getElementById('student_outstanding_0').value = data.Outstanding || data.outstanding || '';
      
      const cf = parseFloat(data.CarriedForward) || 0;
      if (cf > 0) {
        document.getElementById('has_carried_forward_0').checked = true;
        toggleCarriedForwardBlock(0);
        document.getElementById('student_carried_forward_0').value = cf;
      }
      
      if (document.getElementById('student_time_note_0')) document.getElementById('student_time_note_0').value = data.TimeNote || '';
      if (document.getElementById('student_extra_note_0')) document.getElementById('student_extra_note_0').value = data.ExtraNote || '';
      if (document.getElementById('student_hours_0')) document.getElementById('student_hours_0').value = cleanTimeStr(data.Hours || '') || '';
      if (document.getElementById('student_hours_left_0')) document.getElementById('student_hours_left_0').value = cleanTimeStr(data.HoursLeft || '') || '';
      
      // Installment data
      if (data.PayRound1Date) document.getElementById('pay_r1_date_0').value = data.PayRound1Date || '';
      if (data.PayRound1Amount) document.getElementById('pay_r1_amount_0').value = data.PayRound1Amount || '';
      if (data.PayRound1Channel) document.getElementById('pay_r1_channel_0').value = data.PayRound1Channel || '';
      if (data.PayRound1Staff) document.getElementById('pay_r1_staff_0').value = data.PayRound1Staff || '';
      if (data.PayRound1Time) document.getElementById('pay_r1_time_0').value = data.PayRound1Time || '';
      
      if (data.PayRound2Date) document.getElementById('pay_r2_date_0').value = data.PayRound2Date || '';
      if (data.PayRound2Amount) document.getElementById('pay_r2_amount_0').value = data.PayRound2Amount || '';
      if (data.PayRound2Channel) document.getElementById('pay_r2_channel_0').value = data.PayRound2Channel || '';
      if (data.PayRound2Staff) document.getElementById('pay_r2_staff_0').value = data.PayRound2Staff || '';
      if (data.PayRound2Time) document.getElementById('pay_r2_time_0').value = data.PayRound2Time || '';
      
      if (data.PayRound3Date) document.getElementById('pay_r3_date_0').value = data.PayRound3Date || '';
      if (data.PayRound3Amount) document.getElementById('pay_r3_amount_0').value = data.PayRound3Amount || '';
      if (data.PayRound3Channel) document.getElementById('pay_r3_channel_0').value = data.PayRound3Channel || '';
      if (data.PayRound3Staff) document.getElementById('pay_r3_staff_0').value = data.PayRound3Staff || '';
      if (data.PayRound3Time) document.getElementById('pay_r3_time_0').value = data.PayRound3Time || '';
      
      calculateBlockOutstanding(0);
      
      // For main group students, load course checkboxes from grade sheet
      const classTypeVal = data.ClassType || data.classType || '';
      if (isMainGroup(classTypeVal)) {
        const gradeVal = data.Grade || data.grade || '';
        const branchVal = data.BranchLearn || data.branchLearn || '';
        // Determine branch number from branch name
        let branchNum = '1';
        if (branchVal.includes('2')) branchNum = '2';
        else if (branchVal.includes('3')) branchNum = '3';
        
        // Map grade to sheet name
        let gradePrefix = gradeVal;
        const sheetName = gradePrefix + '/' + branchNum;
        
        // Load grade sheet courses
        handleGradeBranchChange();
      }
      
      // Load payment history
      const paySection = document.getElementById('payment_history_section');
      if (paySection) {
        paySection.style.display = 'block';
        loadPaymentHistory(data.id || data.Id || data.ID || data.StudentID);
      }
    }

    // Primary: Try local state.students first (data already loaded in table)
    const cleanName = studentName ? studentName.replace(/\s+/g, '').trim() : '';

    const localStudent = state.students.find(s => {
      if (s.id === id) return true;
      if (studentName && s.name === studentName) return true;
      if (studentName && s.name && s.name.replace(/\s+/g, '').trim() === cleanName) return true;
      if (s.name === id) return true;
      return false;
    });

    if (localStudent) {
      state.selectedStudent = localStudent;
      populateEditForm(localStudent);
      document.getElementById('student_modal').classList.add('active');
      return;
    }

    // Fallback: Try backend if not found locally
    setLoading(true, 'เธเธณเธฅเธฑเธเนเธซเธฅเธ”เธเนเธญเธกเธนเธฅ...');
    const lookupId = (id.startsWith('DB_') && studentName) ? studentName : id;

    // Helper function to fallback to Grade Sheet data
    const fallbackToGradeSheet = () => {
      const gsMatch = state.gradeSheetData && state.gradeSheetData.students ? 
            state.gradeSheetData.students.find(s => s.name && s.name.replace(/\s+/g, '').trim() === cleanName) : null;
      
      if (gsMatch) {
        const fakeData = {
          id: gsMatch.studentId || gsMatch.name,
          StudentName: gsMatch.name,
          Nickname: gsMatch.nickname || '',
          School: gsMatch.school || '',
          Contact: gsMatch.contact || '',
          LineName: gsMatch.lineName || '',
          LineID: gsMatch.lineId || '',
          ClassType: 'เธเธฅเธธเนเธกเธซเธฅเธฑเธ',
          Grade: gsMatch.grade || '',
          BranchLearn: gsMatch.branchLearn || gsMatch.branch || '',
          BranchPay: gsMatch.branchPay || '',
          FullAmount: gsMatch.full || 0,
          PaidAmount: gsMatch.paid || 0,
          Outstanding: gsMatch.outstanding || 0,
          Course: gsMatch.courses ? gsMatch.courses.map(c => c.courseName).join(', ') : ''
        };
        state.selectedStudent = fakeData;
        populateEditForm(fakeData);
        document.getElementById('student_modal').classList.add('active');
        showToast('เธ”เธถเธเธเนเธญเธกเธนเธฅเธเธฒเธเธ•เธฒเธฃเธฒเธเธเธฐเนเธเธ (เนเธกเนเธเธเนเธ StatusDB)', 'info');
      } else {
        showToast('เนเธกเนเธเธเธเนเธญเธกเธนเธฅเธเธฑเธเน€เธฃเธตเธขเธเธฃเธฒเธขเธเธตเนเนเธเธฃเธฐเธเธ', 'error');
      }
    };

    google.script.run
      .withSuccessHandler(res => {
        setLoading(false);
        if (res && res.success && res.data) {
          state.selectedStudent = res.data;
          populateEditForm(res.data);
          document.getElementById('student_modal').classList.add('active');
        } else {
          fallbackToGradeSheet();
        }
      })
      .withFailureHandler(err => {
        setLoading(false);
        fallbackToGradeSheet();
      })
      .getStudentData(lookupId);

  } else {

    // Add mode
    state.selectedStudent = null;

    if (document.getElementById('btn_register_new_course')) {
      document.getElementById('btn_register_new_course').style.display = 'none';
    }
    
    const paySection = document.getElementById('payment_history_section');
    if (paySection) {
      paySection.style.display = 'none';
    }

    document.getElementById('student_id').value = '';

    document.getElementById('student_form').reset();

    document.getElementById('student_modal_title').innerText = 'เธฅเธเธ—เธฐเน€เธเธตเธขเธเธเธฑเธเน€เธฃเธตเธขเธ (เนเธเธเธฅเธฐเน€เธญเธตเธขเธ”)';

    document.getElementById('student_class_type').disabled = false;

    document.getElementById('student_class_type').value = 'เธเธฅเธธเนเธกเธซเธฅเธฑเธ';

    handleClassTypeChange(); // Triggers renderStudentBlocks(1)

    document.getElementById('student_modal').classList.add('active');

  }

};



// Initialize Application

function initializeApp() {

  // Check Login Session first

  checkSession();
  
  // Load dynamic dropdown options
  initAvailableRounds();


  // Setup character counting for evaluation forms

  function setupCharCounting() {

    const inputs = document.querySelectorAll('.eval-strength-item, .eval-improvement-item, .eval-recommendation-item');

    inputs.forEach(input => {

      // Find if we already added a count span

      let countSpan = input.nextElementSibling;

      if (!countSpan || !countSpan.classList.contains('char-count-display')) {

         countSpan = document.createElement('span');

         countSpan.classList.add('char-count-display');

         countSpan.style.fontSize = '0.75rem';

         countSpan.style.color = '#888';

         countSpan.style.minWidth = '45px';

         countSpan.style.textAlign = 'right';

         

         // Insert after input

         if (input.parentNode) {

             input.parentNode.insertBefore(countSpan, input.nextSibling);

         }

      }

      

      function updateCount() {

         const count = input.value.length;

         countSpan.innerText = count + '/60';

         if (count > 0 && count < 60 && input.placeholder.includes('60')) {

             countSpan.style.color = 'red';

         } else {

             countSpan.style.color = '#888';

         }

      }

      

      input.addEventListener('input', updateCount);

      updateCount(); // Init

    });

  }

  setupCharCounting();

}

function jumpToLeaveClass(dateStr, rowIndex, roomBranch) {

  // Switch to daily_grid panel first

  switchPanel('daily_grid');

  

  // Ensure we are in daily view mode

  if (monthlyViewState.mode !== 'daily') {

    switchDailyGridView('daily');

  }

  

  // Switch to the correct branch tab if room info is available

  if (roomBranch) {

    const roomStr = roomBranch.toString().replace(/\s+/g, '');

    let targetBranch = 'เธชเธฒเธเธฒ1';

    if (roomStr.includes('เธชเธฒเธเธฒ3')) targetBranch = 'เธชเธฒเธเธฒ3';

    else if (roomStr.includes('เธชเธฒเธเธฒ2')) targetBranch = 'เธชเธฒเธเธฒ2';

    else if (roomStr.includes('เธญเธญเธเนเธฅเธเน')) targetBranch = 'เธชเธฒเธเธฒ2'; // online defaults to branch 2

    

    if (state.activeBranchFilter !== targetBranch) {

      state.activeBranchFilter = targetBranch;

      document.querySelectorAll('.branch-tab[data-branch]').forEach(t => {

        if (t.getAttribute('data-branch') === targetBranch) {

          t.classList.add('active');

        } else {

          t.classList.remove('active');

        }

      });

    }

  }

  

  // Convert date format

  const formattedDate = convertDateFromSheet(dateStr);

  const dateInput = document.getElementById('daily_grid_filter_date');

  

  if (dateInput) {

    state.pendingScrollRowIndex = rowIndex;

    if (dateInput.value !== formattedDate) {

      dateInput.value = formattedDate;

      loadDailyGrid();

    } else {

      // Same date โ€” just re-render with correct branch and scroll

      renderDailyGrid();

    }

  }

}



function highlightScheduledItem(rowIndex) {

  const el = document.getElementById(`scheduled_item_${rowIndex}`);

  if (el) {

    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    

    // Add border/glow highlight

    const originalBorder = el.style.border;

    const originalShadow = el.style.boxShadow;

    const originalBg = el.style.backgroundColor;

    el.style.border = '2.5px solid #f59e0b';

    el.style.boxShadow = '0 0 20px rgba(245, 158, 11, 0.7)';

    el.style.backgroundColor = 'rgb(254, 243, 199)';

    

    setTimeout(() => {

      el.style.border = originalBorder;

      el.style.boxShadow = originalShadow;

      el.style.backgroundColor = originalBg;

    }, 2500);

  } else {

    showToast('เนเธกเนเธเธเธเธฅเธฒเธชเน€เธฃเธตเธขเธเนเธเธซเธเนเธฒเธเธตเน (เธญเธฒเธเธ–เธนเธเธฅเธเธซเธฃเธทเธญเน€เธเธฅเธตเนเธขเธเธซเนเธญเธ)', 'warning');

  }

}



if (document.readyState === 'loading') {

  document.addEventListener('DOMContentLoaded', initializeApp);

} else {

  initializeApp();

}

// Validate if input matches an option in its datalist
function validateDatalistInput(input) {
  if (!input || !input.value) return;
  
  const listId = input.getAttribute('list');
  if (!listId) return;
  
  const datalist = document.getElementById(listId);
  if (!datalist) return;
  
  const options = Array.from(datalist.options).map(opt => opt.value);
  
  // If the typed value is not exactly one of the options
  if (!options.includes(input.value)) {
    // Apply strict validation only for private classes (contains 'เน€เธ”เธตเนเธขเธง')
    if (input.value.includes('เน€เธ”เธตเนเธขเธง')) {
      showToast('เธเธทเนเธญเธเธญเธฃเนเธชเน€เธ”เนเธเน€เธ”เธตเนเธขเธง เธเธฃเธธเธ“เธฒเน€เธฅเธทเธญเธเธเธฒเธเธฃเธฒเธขเธเธฒเธฃเธ—เธตเนเธกเธตเธญเธขเธนเนเน€เธ—เนเธฒเธเธฑเนเธ เธซเนเธฒเธกเธเธดเธกเธเนเธเนเธญเธเธงเธฒเธกเธ•เนเธญเธ—เนเธฒเธข', 'warning');
      input.value = ''; // Clear the invalid input
      input.focus();
    }
  }
}

function initAvailableRounds() {
  const select = document.getElementById('summary_round_filter');
  if (!select) return;
  google.script.run
    .withSuccessHandler(res => {
      if (res && res.success && res.rounds) {
        select.innerHTML = '';
        if (res.rounds.length === 0) {
          select.innerHTML = '<option value="">เนเธกเนเธกเธตเธฃเธญเธเน€เธฃเธตเธขเธเนเธเธฃเธฐเธเธ</option>';
          return;
        }
        res.rounds.forEach(r => {
          const opt = document.createElement('option');
          opt.value = r;
          opt.innerText = r;
          select.appendChild(opt);
        });
        
        // Load default summary right after filling dropdown
        loadRoundSummary(true);
      } else {
        select.innerHTML = '<option value="">เนเธซเธฅเธ”เธฅเนเธกเน€เธซเธฅเธง</option>';
      }
    })
    .getAvailableRounds();
}

window.registerNewCourseForCurrentStudent = function() {
  const name = document.getElementById('student_name_0').value;
  const nickname = document.getElementById('student_nickname_0').value;
  const school = document.getElementById('student_school_0').value;
  const section = document.getElementById('student_class_section_0').value;
  const contact = document.getElementById('student_contact_0').value;
  const lineName = document.getElementById('student_line_name_0').value;
  const lineId = document.getElementById('student_line_id_0').value;
  
  // Clear ID to switch to add mode
  document.getElementById('student_id').value = '';
  
  // Change title
  document.getElementById('student_modal_title').innerText = `เธฅเธเธ—เธฐเน€เธเธตเธขเธเธเธญเธฃเนเธชเนเธซเธกเนเธชเธณเธซเธฃเธฑเธ ${name}`;
  
  // Hide register button since we are now in add mode
  if (document.getElementById('btn_register_new_course')) {
    document.getElementById('btn_register_new_course').style.display = 'none';
  }
  
  // Reset payment and course fields
  if (document.getElementById('shared_course_name')) {
    document.getElementById('shared_course_name').value = '';
  }
  const checkboxes = document.querySelectorAll('.course-checkbox');
  checkboxes.forEach(cb => cb.checked = false);
  
  document.getElementById('student_full_0').value = '';
  document.getElementById('student_paid_0').value = '';
  document.getElementById('student_outstanding_0').value = '';
  
  // Reset installments
  for (let r = 1; r <= 3; r++) {
    if (document.getElementById(`pay_r${r}_date_0`)) document.getElementById(`pay_r${r}_date_0`).value = '';
    if (document.getElementById(`pay_r${r}_amount_0`)) document.getElementById(`pay_r${r}_amount_0`).value = '';
    if (document.getElementById(`pay_r${r}_channel_0`)) document.getElementById(`pay_r${r}_channel_0`).value = '';
    if (document.getElementById(`pay_r${r}_staff_0`)) document.getElementById(`pay_r${r}_staff_0`).value = '';
    if (document.getElementById(`pay_r${r}_time_0`)) document.getElementById(`pay_r${r}_time_0`).value = '';
  }
  
  // Uncheck carried forward
  if (document.getElementById('has_carried_forward_0')) {
    document.getElementById('has_carried_forward_0').checked = false;
    toggleCarriedForwardBlock(0);
  }
  
  showToast('เน€เธ•เธฃเธตเธขเธกเธเนเธญเธกเธนเธฅเธเธฃเธฐเธงเธฑเธ•เธดเธเธฑเธเน€เธฃเธตเธขเธเน€เธฃเธตเธขเธเธฃเนเธญเธข เธเธฃเธธเธ“เธฒเน€เธฅเธทเธญเธเธงเธดเธเธฒ/เธเธญเธฃเนเธชเนเธซเธกเนเนเธฅเธฐเธเธฃเธญเธเธฃเธฒเธขเธฅเธฐเน€เธญเธตเธขเธ”เธเธฒเธฃเธเธณเธฃเธฐเน€เธเธดเธ', 'success');
};

// ==========================================
// Payment History Functions
// ==========================================

function loadPaymentHistory(studentId) {
  const container = document.getElementById('payment_history_tbody');
  const totalEl = document.getElementById('payment_history_total');
  
  if (!container) return;
  
  container.innerHTML = '<tr><td colspan="7" style="padding: 20px; text-align: center; color: #94a3b8;">เธเธณเธฅเธฑเธเนเธซเธฅเธ”เธเธฃเธฐเธงเธฑเธ•เธด...</td></tr>';
  totalEl.innerText = '0 เธเธฒเธ—';
  
  google.script.run
    .withSuccessHandler(res => {
      if (res && res.success) {
        renderPaymentHistory(res.data);
      } else {
        container.innerHTML = `<tr><td colspan="7" style="padding: 20px; text-align: center; color: #ef4444;">เน€เธเธดเธ”เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”: ${res ? res.error : 'เนเธกเนเธ—เธฃเธฒเธเธชเธฒเน€เธซเธ•เธธ'}</td></tr>`;
      }
    })
    .withFailureHandler(err => {
      container.innerHTML = `<tr><td colspan="7" style="padding: 20px; text-align: center; color: #ef4444;">เธเธฒเธฃเน€เธเธทเนเธญเธกเธ•เนเธญเธฅเนเธกเน€เธซเธฅเธง: ${err.message}</td></tr>`;
    })
    .getStudentPayments(studentId);
}

function renderPaymentHistory(payments) {
  const container = document.getElementById('payment_history_tbody');
  const totalEl = document.getElementById('payment_history_total');
  
  if (!payments || payments.length === 0) {
    container.innerHTML = '<tr><td colspan="7" style="padding: 20px; text-align: center; color: #94a3b8;">เธขเธฑเธเนเธกเนเธกเธตเธเธฃเธฐเธงเธฑเธ•เธดเธเธฒเธฃเธเธณเธฃเธฐเน€เธเธดเธ</td></tr>';
    totalEl.innerText = '0 เธเธฒเธ—';
    return;
  }
  
  let html = '';
  let totalAmount = 0;
  
  payments.forEach((p, index) => {
    const amount = parseFloat(p.Amount) || 0;
    totalAmount += amount;
    
    html += `
      <tr style="border-bottom: 1px solid #f1f5f9; background: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'};">
        <td style="padding: 8px;">${p.Round || '-'}</td>
        <td style="padding: 8px;">${p.Date || '-'}</td>
        <td style="padding: 8px; text-align: right; font-weight: 500; color: #0f172a;">${amount.toLocaleString()}</td>
        <td style="padding: 8px;">${p.Channel || '-'}</td>
        <td style="padding: 8px;">${p.Receiver || '-'}</td>
        <td style="padding: 8px; font-size: 0.75rem; color: #64748b;">${p.Note || '-'}</td>
        <td style="padding: 8px; text-align: center;">
          <button type="button" class="btn btn-danger" onclick="deletePayment('${p.PaymentID}')" style="font-size: 0.7rem; padding: 4px 8px; background: #ef4444; border: none; color: white; border-radius: 4px; cursor: pointer;">เธฅเธ</button>
        </td>
      </tr>
    `;
  });
  
  container.innerHTML = html;
  totalEl.innerText = totalAmount.toLocaleString() + ' เธเธฒเธ—';
  
  // Update the paid amount input field
  const paidInput = document.getElementById('student_paid_0');
  if (paidInput) {
    paidInput.value = totalAmount;
    calculateBlockOutstanding(0);
  }
}

function showAddPaymentForm() {
  const form = document.getElementById('add_payment_form');
  if (form) {
    form.style.display = 'block';
    
    // Set default date to today
    const dateInput = document.getElementById('new_payment_date');
    if (dateInput && !dateInput.value) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }
  }
}

function hideAddPaymentForm() {
  const form = document.getElementById('add_payment_form');
  if (form) {
    form.style.display = 'none';
    
    // Reset fields
    document.getElementById('new_payment_amount').value = '';
    document.getElementById('new_payment_channel').value = '';
    document.getElementById('new_payment_receiver').value = '';
    document.getElementById('new_payment_round').value = '';
    document.getElementById('new_payment_note').value = '';
  }
}

function submitNewPayment() {
  const studentId = document.getElementById('student_id').value;
  if (!studentId) {
    showToast('เธเธฃเธธเธ“เธฒเธเธฑเธเธ—เธถเธเธเนเธญเธกเธนเธฅเธเธฑเธเน€เธฃเธตเธขเธเธเนเธญเธเน€เธเธดเนเธกเธเธฒเธฃเธเธณเธฃเธฐเน€เธเธดเธ', 'warning');
    return;
  }
  
  const amount = document.getElementById('new_payment_amount').value;
  if (!amount) {
    showToast('เธเธฃเธธเธ“เธฒเธฃเธฐเธเธธเธเธณเธเธงเธเน€เธเธดเธ', 'warning');
    return;
  }
  
  const paymentData = {
    StudentID: studentId,
    Amount: amount,
    Date: document.getElementById('new_payment_date').value,
    Channel: document.getElementById('new_payment_channel').value,
    Receiver: document.getElementById('new_payment_receiver').value,
    Round: document.getElementById('new_payment_round').value,
    Note: document.getElementById('new_payment_note').value,
    LogUser: state.currentUser ? state.currentUser.username : 'Unknown'
  };
  
  setLoading(true, 'เธเธณเธฅเธฑเธเธเธฑเธเธ—เธถเธเธฃเธฒเธขเธเธฒเธฃเธเธณเธฃเธฐเน€เธเธดเธ...');
  
  google.script.run
    .withSuccessHandler(res => {
      setLoading(false);
      if (res && res.success) {
        showToast('เน€เธเธดเนเธกเธฃเธฒเธขเธเธฒเธฃเธเธณเธฃเธฐเน€เธเธดเธเธชเธณเน€เธฃเนเธ', 'success');
        hideAddPaymentForm();
        loadPaymentHistory(studentId);
      } else {
        showToast('เน€เธเธดเธ”เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”: ' + (res ? res.error : 'เนเธกเนเธ—เธฃเธฒเธเธชเธฒเน€เธซเธ•เธธ'), 'error');
      }
    })
    .withFailureHandler(err => {
      setLoading(false);
      showToast('เธเธฒเธฃเน€เธเธทเนเธญเธกเธ•เนเธญเธฅเนเธกเน€เธซเธฅเธง: ' + err.message, 'error');
    })
    .addPayment(paymentData);
}

function deletePayment(paymentId) {
  if (!confirm('เธขเธทเธเธขเธฑเธเธ—เธตเนเธเธฐเธฅเธเธฃเธฒเธขเธเธฒเธฃเธเธณเธฃเธฐเน€เธเธดเธเธเธตเน?')) return;
  
  const studentId = document.getElementById('student_id').value;
  
  setLoading(true, 'เธเธณเธฅเธฑเธเธฅเธเธฃเธฒเธขเธเธฒเธฃ...');
  
  const user = state.currentUser ? state.currentUser.username : 'Unknown';
  
  google.script.run
    .withSuccessHandler(res => {
      setLoading(false);
      if (res && res.success) {
        showToast('เธฅเธเธฃเธฒเธขเธเธฒเธฃเธชเธณเน€เธฃเนเธ', 'success');
        loadPaymentHistory(studentId);
      } else {
        showToast('เน€เธเธดเธ”เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”: ' + (res ? res.error : 'เนเธกเนเธ—เธฃเธฒเธเธชเธฒเน€เธซเธ•เธธ'), 'error');
      }
    })
    .withFailureHandler(err => {
      setLoading(false);
      showToast('เธเธฒเธฃเน€เธเธทเนเธญเธกเธ•เนเธญเธฅเนเธกเน€เธซเธฅเธง: ' + err.message, 'error');
    })
    .deletePayment(paymentId, user);
}

    function syncMissingData(btn) {
      if (!confirm('เธ•เนเธญเธเธเธฒเธฃเธเธงเธฒเธ”เธเนเธญเธกเธนเธฅเน€เธ”เนเธเธ—เธตเนเธ•เธเธซเธฅเนเธเธเธฒเธเธ—เธธเธเธเธตเธ•เธเธฅเธฑเธเน€เธเนเธฒเธกเธฒเธ—เธตเน StatusDB เนเธเนเธซเธฃเธทเธญเนเธกเน?\n(เธเธฑเนเธเธ•เธญเธเธเธตเนเธญเธฒเธเนเธเนเน€เธงเธฅเธฒเธเธฃเธฐเธกเธฒเธ“ 1-2 เธเธฒเธ—เธต เนเธเธฐเธเธณเนเธซเนเธฃเธญเธเธเธเธงเนเธฒเธเธฐเน€เธชเธฃเนเธเธชเธดเนเธ)')) return;
      
      let originalText = '๐” เธเธดเธเธเนเธเนเธญเธกเธนเธฅเธ•เธเธซเธฅเนเธ';
      if (btn) {
        originalText = btn.innerHTML;
        btn.innerHTML = 'โณ เธเธณเธฅเธฑเธเธเธดเธเธเน...';
        btn.disabled = true;
      }
      
      showToast('เธเธณเธฅเธฑเธเธเธดเธเธเนเธเนเธญเธกเธนเธฅเธ•เธเธซเธฅเนเธ เธฃเธฐเธเธเธเธณเธฅเธฑเธเธเธงเธฒเธ”เธเนเธญเธกเธนเธฅเธเธฒเธเธ—เธธเธเธเธตเธ• เธเธฃเธธเธ“เธฒเธฃเธญเธชเธฑเธเธเธฃเธนเน...', 'warning');
      
      google.script.run
        .withSuccessHandler(res => {
          if (btn) {
            btn.innerHTML = originalText;
            btn.disabled = false;
          }
          if (res && res.success) {
            showToast('โ… เธเธดเธเธเนเน€เธชเธฃเนเธเธชเธกเธเธนเธฃเธ“เน! เธเธเธฃเธฒเธขเธเธทเนเธญเนเธซเธกเน ' + res.addedCount + ' เธเธ', 'success');
            if (res.addedCount > 0) {
              loadStatusDBAndStudents();
            }
          } else {
            showToast('โ เน€เธเธดเธ”เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”: ' + (res ? res.error : 'เนเธกเนเธ—เธฃเธฒเธเธชเธฒเน€เธซเธ•เธธ'), 'error');
          }
        })
        .withFailureHandler(err => {
          if (btn) {
            btn.innerHTML = originalText;
            btn.disabled = false;
          }
          showToast('โ เน€เธเธดเธ”เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”เนเธเธเธฒเธฃเน€เธเธทเนเธญเธกเธ•เนเธญ: ' + err.message, 'error');
        })
        .syncMissingStudentsToStatusDB();
    }



// ============================================
// Teacher Adjustments (Bonus / Deduction) Logic
// ============================================
function openTeacherAdjustmentModal() {
  const modal = document.getElementById('teacher_adjustment_modal');
  if (modal) {
    modal.style.display = 'flex';
    document.getElementById('adj_modal_amount').value = '';
    document.getElementById('adj_modal_note').value = '';
  }
}

function closeTeacherAdjustmentModal() {
  const modal = document.getElementById('teacher_adjustment_modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function submitTeacherAdjustment() {
  const type = document.getElementById('adj_modal_type').value;
  const amount = parseFloat(document.getElementById('adj_modal_amount').value);
  const note = document.getElementById('adj_modal_note').value;
  
  if (isNaN(amount) || amount <= 0) {
    Swal.fire('เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”', 'เธเธฃเธธเธ“เธฒเธฃเธฐเธเธธเธเธณเธเธงเธเน€เธเธดเธเนเธซเนเธ–เธนเธเธ•เนเธญเธ (เธกเธฒเธเธเธงเนเธฒ 0)', 'error');
    return;
  }
  
  const monthPicker = document.getElementById('teacher_salary_month_picker');
  const yearPicker = document.getElementById('teacher_salary_year_picker');
  
  if (!monthPicker || !yearPicker) return;
  
  const selectedMonth = parseInt(monthPicker.value);
  const selectedYear = parseInt(yearPicker.value);
  
  const data = {
    month: selectedMonth,
    year: selectedYear,
    type: type,
    amount: amount,
    note: note
  };
  
  setLoading(true, 'เธเธณเธฅเธฑเธเธเธฑเธเธ—เธถเธเธฃเธฒเธขเธเธฒเธฃ...');
  google.script.run
    .withSuccessHandler(res => {
      setLoading(false);
      if (res && res.success) {
        closeTeacherAdjustmentModal();
        Swal.fire({
          title: 'เธชเธณเน€เธฃเนเธ!',
          text: 'เธเธฑเธเธ—เธถเธเธฃเธฒเธขเธเธฒเธฃเน€เธฃเธตเธขเธเธฃเนเธญเธขเนเธฅเนเธง เธฃเธฐเธเธเธเธณเธฅเธฑเธเธเธณเธเธงเธ“เน€เธเธดเธเน€เธ”เธทเธญเธเนเธซเธกเน',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        // Reload data
        loadTeacherYearlySalary();
      } else {
        Swal.fire('เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”', 'เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เธเธฑเธเธ—เธถเธเนเธ”เน: ' + (res ? res.error : 'Unknown Error'), 'error');
      }
    })
    .withFailureHandler(err => {
      setLoading(false);
      Swal.fire('เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”', 'เน€เธเธดเธ”เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”เนเธเธเธฒเธฃเน€เธเธทเนเธญเธกเธ•เนเธญ: ' + err.message, 'error');
    })
    .saveTeacherAdjustment(data, state.username);
}


