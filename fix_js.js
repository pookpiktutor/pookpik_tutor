const fs = require('fs');
let code = fs.readFileSync('g:/My Drive/0.งานสถาบัน/data_PookPik_Tutor/JavaScript.html', 'utf8');

const replacement = `document.addEventListener('DOMContentLoaded', () => {
  checkSession();
  if (typeof initEvalCharCounters === 'function') initEvalCharCounters();
});

function initEvalCharCounters() {
  const evalInputs = document.querySelectorAll('.eval-strength-item, .eval-improvement-item, .eval-recommendation-item');
  evalInputs.forEach(input => {
    const span = document.createElement('span');
    span.className = 'char-count';
    span.style.fontSize = '0.75rem';
    span.style.color = '#94a3b8';
    span.style.minWidth = '45px';
    span.style.textAlign = 'right';
    span.innerText = input.value.length + '/70';
    
    input.parentNode.insertBefore(span, input.nextSibling);
    
    input.addEventListener('input', function() {
      const len = this.value.length;
      span.innerText = len + '/70';
      if (len > 0 && len < 70) {
        span.style.color = '#ef4444';
      } else if (len >= 70) {
        span.style.color = '#10b981';
      } else {
        span.style.color = '#94a3b8';
      }
    });
  });
}`;

code = code.replace(/document\.addEventListener\('DOMContentLoaded', \(\) => \{\s*\/\/ Check Login Session first\s*checkSession\(\);\s*\}\);/, replacement);

fs.writeFileSync('g:/My Drive/0.งานสถาบัน/data_PookPik_Tutor/JavaScript.html', code);
console.log('Modified JavaScript.html with regex replace!');
