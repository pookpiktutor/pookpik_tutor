const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbynoDYcenMy9LpNnclnJr4eAwMapcfvP1DyepgmVVo1YB6lL3pMiqkhcp64uoniRAMhcw/exec";

window.google = window.google || {};
window.google.script = window.google.script || {};

let isReady = false;
let queue = [];
let callbacks = {};
let msgId = 0;
let iframe = null;

function initIframe() {
  if (iframe) return;
  iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = GAS_WEB_APP_URL + "?setupIframe=true";
  document.body.appendChild(iframe);

  window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'IFRAME_READY') {
      isReady = true;
      queue.forEach(msg => iframe.contentWindow.postMessage(msg, '*'));
      queue = [];
    } else if (event.data && event.data.id) {
      const id = event.data.id;
      if (callbacks[id]) {
        if (event.data.success) {
          if (callbacks[id].success) callbacks[id].success(event.data.result);
        } else {
          if (callbacks[id].failure) callbacks[id].failure(new Error(event.data.error));
        }
        delete callbacks[id];
      }
    }
  });

  setTimeout(() => {
    if (!isReady) {
      alert("ระบบไม่สามารถเชื่อมต่อกับฐานข้อมูลได้ กรุณาตรวจสอบว่าอนุญาต Third-party cookies หรือปิดโหมดไม่ระบุตัวตน (Incognito) และอัปเดตโค้ดฝั่ง Google ให้ถูกต้อง");
    }
  }, 5000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initIframe);
} else {
  initIframe();
}

function createRunShim() {
  let successHandler = null;
  let failureHandler = null;

  const runner = {
    withSuccessHandler: function(handler) {
      successHandler = handler;
      return new Proxy(runner, proxyHandler);
    },
    withFailureHandler: function(handler) {
      failureHandler = handler;
      return new Proxy(runner, proxyHandler);
    }
  };

  const proxyHandler = {
    get: function(target, prop) {
      if (prop in target) {
        return target[prop];
      }
      
      return function(...args) {
        msgId++;
        const id = msgId;
        
        // Capture the handlers at the time of execution
        const sHandler = successHandler;
        const fHandler = failureHandler;
        
        callbacks[id] = { success: sHandler, failure: fHandler };
        
        const msg = {
          id: id,
          functionName: prop,
          arguments: args
        };

        if (isReady && iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage(msg, '*');
        } else {
          queue.push(msg);
        }
        
        // Reset handlers for the next call
        successHandler = null;
        failureHandler = null;
      };
    }
  };

  return new Proxy(runner, proxyHandler);
}

if (!window.google.script.run || !window.google.script.run._isShim) {
  window.google.script.run = createRunShim();
  window.google.script.run._isShim = true;
}
