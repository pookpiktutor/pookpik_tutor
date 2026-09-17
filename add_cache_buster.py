import os

filepath = 'g:/My Drive/0.งานสถาบัน/data_PookPik_Tutor/parent_eval.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the API URL to add a cache buster
old_line = 'const apiUrl = "https://script.google.com/macros/s/AKfycbzK7sEShW6AGBqweRt20rpI8V8fyrJC3Dlv3uVwVFlhJvcJ2ciJmRXHXc05tL7Ft_5z/exec?action=getEvaluationsList&role=parent";'
new_line = 'const apiUrl = "https://script.google.com/macros/s/AKfycbzK7sEShW6AGBqweRt20rpI8V8fyrJC3Dlv3uVwVFlhJvcJ2ciJmRXHXc05tL7Ft_5z/exec?action=getEvaluationsList&role=parent&t=" + new Date().getTime();'

if old_line in content:
    content = content.replace(old_line, new_line)
    
    # Also add some debug text to the empty state so we know if fetch failed!
    old_catch = """          .catch(err => {
            console.error('API fetch error:', err);
            callback(err, []);
          });"""
    new_catch = """          .catch(err => {
            console.error('API fetch error:', err);
            window.apiFetchError = err.toString();
            callback(err, []);
          });"""
    content = content.replace(old_catch, new_catch)
    
    old_empty = """<p style="color: #64748b; font-size: 15px; max-width: 500px; margin: 0 auto; line-height: 1.6;">
              ไม่พบใบประเมินที่ได้รับการยืนยันเผยแพร่ของ <strong style="color: var(--primary-color);">"${queryName}"</strong> ในระบบ
            </p>"""
    new_empty = """<p style="color: #64748b; font-size: 15px; max-width: 500px; margin: 0 auto; line-height: 1.6;">
              ไม่พบใบประเมินที่ได้รับการยืนยันเผยแพร่ของ <strong style="color: var(--primary-color);">"${queryName}"</strong> ในระบบ
            </p>
            <p style="color: red; font-size: 12px; margin-top: 10px;" id="debugError"></p>
            <script>
              if (window.apiFetchError) {
                document.getElementById('debugError').innerText = "Error: " + window.apiFetchError + " (Please contact admin)";
              }
            </script>"""
    content = content.replace(old_empty, new_empty)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated parent_eval.html")
else:
    print("Could not find the target line.")
