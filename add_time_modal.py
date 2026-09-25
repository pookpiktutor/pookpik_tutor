import re
c = open('index.html', 'r', encoding='utf-8').read()
rep = """                  <div>
                    <label style="font-size: 0.75rem; color: #64748b;">เวลา</label>
                    <input type="time" id="new_payment_time" class="form-input" style="padding: 6px; font-size: 0.85rem;">
                  </div>
                  <div>
                    <label style="font-size: 0.75rem; color: #64748b;">ช่องทาง</label>"""
c = re.sub(r'<div>\s*<label style="font-size: 0\.75rem; color: #64748b;">ช่องทาง</label>', rep, c)

# Update submitNewPayment to include Time
rep_submit = """    Date: document.getElementById('new_payment_date').value,
    Time: document.getElementById('new_payment_time').value,
    Channel: document.getElementById('new_payment_channel').value,"""
c = re.sub(r'Date: document\.getElementById\(\'new_payment_date\'\)\.value,\s*Channel: document\.getElementById\(\'new_payment_channel\'\)\.value,', rep_submit, c)

# Update clear form
rep_clear = """    document.getElementById('new_payment_date').value = '';
    if (document.getElementById('new_payment_time')) document.getElementById('new_payment_time').value = '';
    document.getElementById('new_payment_channel').value = '';"""
c = re.sub(r'document\.getElementById\(\'new_payment_date\'\)\.value = \'\';\s*document\.getElementById\(\'new_payment_channel\'\)\.value = \'\';', rep_clear, c)

open('index.html', 'w', encoding='utf-8').write(c)
print("Updated index.html")
