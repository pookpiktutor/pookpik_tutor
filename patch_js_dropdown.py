import io

with io.open('src/JavaScript.js', 'r', encoding='utf-8') as f:
    js = f.read()

func = """
function initAvailableRounds() {
  const select = document.getElementById('summary_round_filter');
  if (!select) return;
  google.script.run
    .withSuccessHandler(res => {
      if (res && res.success && res.rounds) {
        select.innerHTML = '';
        if (res.rounds.length === 0) {
          select.innerHTML = '<option value="">ไม่มีรอบเรียนในระบบ</option>';
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
        select.innerHTML = '<option value="">โหลดล้มเหลว</option>';
      }
    })
    .getAvailableRounds();
}
"""

if "function initAvailableRounds" not in js:
    js += func

# Call initAvailableRounds on page load
# Find a place like document.addEventListener('DOMContentLoaded'
old_dom = """document.addEventListener('DOMContentLoaded', () => {

  loadData();

});"""
new_dom = """document.addEventListener('DOMContentLoaded', () => {

  loadData();
  initAvailableRounds();

});"""

if old_dom in js:
    js = js.replace(old_dom, new_dom)
else:
    print("[WARN] DOMContentLoaded pattern not found")

with io.open('src/JavaScript.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("[OK] Added initAvailableRounds to JavaScript.js")
