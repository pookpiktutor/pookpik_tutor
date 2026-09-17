import os

filepath = 'g:/My Drive/0.งานสถาบัน/data_PookPik_Tutor/parent_eval.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the broken </script> with a safely escaped one, or just remove the script block entirely and use outer JS.
broken_script = '''<p style="color: red; font-size: 12px; margin-top: 10px;" id="debugError"></p>
              <script>
                if (window.apiFetchError) {
                  document.getElementById('debugError').innerText = "Error: " + window.apiFetchError + " (Please contact admin)";
                }
              </script>'''

fixed_script = '''<p style="color: red; font-size: 12px; margin-top: 10px;" id="debugError"></p>'''

if broken_script in content:
    content = content.replace(broken_script, fixed_script)
    
    # Also add the script logic AFTER the innerHTML
    old_end = '''container.innerHTML = `
            <div class="status-box">'''
    new_end = '''container.innerHTML = `
            <div class="status-box">'''
    
    # Wait, the easier way is to just do this:
    old_full = '''              <script>
                if (window.apiFetchError) {
                  document.getElementById('debugError').innerText = "Error: " + window.apiFetchError + " (Please contact admin)";
                }
              </script>
            </div>
          `;
          return;
        }'''
    
    new_full = '''            </div>
          `;
          if (window.apiFetchError) {
            document.getElementById('debugError').innerText = "Error: " + window.apiFetchError + " (Please contact admin)";
          }
          return;
        }'''
    
    content = content.replace(old_full, new_full)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Fixed broken script tag!")
else:
    print("Could not find the broken script tag.")
