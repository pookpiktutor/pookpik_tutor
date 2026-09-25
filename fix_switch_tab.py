import re

# 1. Update switchRevenueSubTab in src/JavaScript.js
js_file = 'src/JavaScript.js'
with open(js_file, 'r', encoding='utf-8') as f:
    js_content = f.read()

new_func = """function switchRevenueSubTab(tabName) {
  state.activeRevenueTab = tabName;
  const tabList = document.getElementById('tab_rev_paid');
  const tabSummary = document.getElementById('tab_rev_all');
  if (tabList) tabList.classList.toggle('active', tabName === 'paid');
  if (tabSummary) tabSummary.classList.toggle('active', tabName === 'all');
  const panelList = document.getElementById('revenue_subpanel_list');
  const panelSummary = document.getElementById('revenue_subpanel_summary');
  if (panelList) panelList.style.display = 'block';
  if (panelSummary) panelSummary.style.display = 'block';
  const saveBtn = document.getElementById('btn_save_revenue_logs');
  if (saveBtn) saveBtn.style.display = tabName === 'paid' ? 'flex' : 'none';
  if (typeof renderRevenueLogs === 'function') renderRevenueLogs();
}"""

# Replace the existing function in src/JavaScript.js
js_content = re.sub(r'function switchRevenueSubTab\(tabName\).*?(?=\n\n|\n})', new_func, js_content, flags=re.DOTALL)

with open(js_file, 'w', encoding='utf-8') as f:
    f.write(js_content)


# 2. Remove the duplicated switchRevenueSubTab from index.html
html_file = 'index.html'
with open(html_file, 'r', encoding='utf-8') as f:
    html_content = f.read()

# We will just remove the entire function block starting with `function switchRevenueSubTab(tabName) {` down to its closing brace.
# Since we know it's around line 41412 and ends around 41492.
html_content = re.sub(r'function switchRevenueSubTab\(tabName\)\s*\{.*?\n\}\n', '', html_content, flags=re.DOTALL)

with open(html_file, 'w', encoding='utf-8') as f:
    f.write(html_content)

print("Fixed switchRevenueSubTab logic in both files")
