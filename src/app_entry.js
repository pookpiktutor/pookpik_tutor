// app_entry.js - Main Application Entry Point
// Connects directly to Google Apps Script Web App for database operations
// No Firebase dependency - all data goes through GAS

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyYjh5-6frv-AytBYl1EnWB46Vh5_VCkVVRg6XsU4A-KUJoR8nFh46XZ-ffvbtwiZHhhA/exec";



// ─── google.script.run Bridge ─────────────────────────────────────────────────
// We expose window.google.script.run so that the original JavaScript.js code
// continues to work unchanged. Every function call triggers a fetch to GAS.
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

  return new Proxy(chain, {
    get(target, prop) {
      if (prop in target) return typeof target[prop] === 'function' ? target[prop].bind(target) : target[prop];
      return (...args) => {
        dispatch(prop, args, target);
        return undefined; 
      };
    }
  });
}

// Support builder pattern: google.script.run.withSuccessHandler(cb).methodName(args)
window.google.script.run = new Proxy({}, {
  get(_, propName) {
    if (propName !== 'withSuccessHandler' && propName !== 'withFailureHandler') {
      return (...args) => dispatch(propName, args, { _success: null, _failure: null });
    }

    const context = { _success: null, _failure: null };
    
    const handlerProxy = new Proxy(context, {
      get(target, method) {
        if (method === 'withSuccessHandler') {
          return (cb) => { target._success = cb; return handlerProxy; };
        }
        if (method === 'withFailureHandler') {
          return (cb) => { target._failure = cb; return handlerProxy; };
        }
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

// ─── Dispatch function: sends a request to the Google Apps Script Web App ───
async function dispatch(funcName, args, chain) {
  console.log(`[GAS Bridge] Calling ${funcName} on Google Sheets...`, args);
  try {
    const response = await fetch(WEB_APP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify({
        functionName: funcName,
        arguments: args
      })
    });
    const text = await response.text();
    const result = JSON.parse(text);
    console.log(`[GAS Bridge] Response for ${funcName}:`, result);
    if (chain._success) {
      chain._success(result);
    }
  } catch (err) {
    console.error(`[GAS Bridge] Error in ${funcName}:`, err);
    if (chain._failure) {
      chain._failure(err);
    }
  }
}

// ─── Override handleLogout to clear session storage ──────────────────────────
window.handleLogout = function(silent = false) {
  if (silent) {
    localStorage.removeItem('pookpik_session');
    localStorage.removeItem('last_active_time');
    if (window.state) { window.state.currentUser = null; }
    if (window.showLoginScreen) window.showLoginScreen();
    if (window.showToast) window.showToast('เซสชันหมดอายุเนื่องจากไม่มีความเคลื่อนไหวเกิน 1 ชั่วโมง', 'warning');
    return;
  }
  const confirmed = confirm('คุณต้องการออกจากระบบใช่หรือไม่?');
  if (confirmed) {
    localStorage.removeItem('pookpik_session');
    localStorage.removeItem('last_active_time');
    if (window.state) { window.state.currentUser = null; }
    if (window.showLoginScreen) window.showLoginScreen();
    if (window.showToast) window.showToast('ออกจากระบบเรียบร้อยแล้ว', 'info');
  }
};

// ─── Auto Logout Logic: 1 Hour of Inactivity ──────────────────────────────────
function updateActivityTime() {
  localStorage.setItem('last_active_time', Date.now().toString());
}

window.addEventListener('click', updateActivityTime);
window.addEventListener('mousemove', updateActivityTime);
window.addEventListener('keydown', updateActivityTime);
window.addEventListener('scroll', updateActivityTime);
window.addEventListener('touchstart', updateActivityTime);

updateActivityTime();

setInterval(() => {
  const session = localStorage.getItem('pookpik_session');
  if (!session) return; 

  const lastActive = parseInt(localStorage.getItem('last_active_time') || '0');
  if (!lastActive) {
    updateActivityTime();
    return;
  }

  const ONE_HOUR = 60 * 60 * 1000; 
  const timeElapsed = Date.now() - lastActive;

  if (timeElapsed > ONE_HOUR) {
    console.log('[Auth] Session expired due to 1 hour of inactivity. Logging out...');
    window.handleLogout(true); 
  }
}, 10000);

// ─── Load original JavaScript.js as a plain script (non-module) ───────────────
const s = document.createElement('script');
s.src = './src/JavaScript.js?v=' + Date.now();
s.onload = () => console.log('[App] JavaScript.js loaded and ready with GAS backend');
s.onerror = (e) => console.error('[App] Failed to load JavaScript.js', e);
document.head.appendChild(s);
