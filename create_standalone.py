import os

with open("Register.html", "r", encoding="utf-8") as f:
    content = f.read()

proxy_script = """
<script>
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbxZdtCU5oSYMho7Fsne3nXXE4IFWVNj_wFagCrGi86ycFxPJiPsRbAu4KGm_-wN2YJRlQ/exec';
window.google = window.google || {};
window.google.script = window.google.script || {};
window.google.script.run = new Proxy({}, {
  get: function(target, prop) {
    if (prop === 'withSuccessHandler') {
      return function(handler) { target._successHandler = handler; return window.google.script.run; };
    }
    if (prop === 'withFailureHandler') {
      return function(handler) { target._failureHandler = handler; return window.google.script.run; };
    }
    return function(...args) {
      const successHandler = target._successHandler;
      const failureHandler = target._failureHandler;
      target._successHandler = undefined;
      target._failureHandler = undefined;
      fetch(GAS_API_URL, {
        redirect: 'follow',
        method: 'POST',
        body: JSON.stringify({ functionName: prop, arguments: args }),
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }
      }).then(response => response.json()).then(result => {
        if (result && result.error) { if (failureHandler) failureHandler(new Error(result.error)); }
        else { if (successHandler) successHandler(result); }
      }).catch(err => { if (failureHandler) failureHandler(err); });
    };
  }
});
</script>
<script>
"""

new_content = content.replace("<script>", proxy_script, 1)

with open("register.html", "w", encoding="utf-8") as f:
    f.write(new_content)

print("Created register.html")
