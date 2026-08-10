import os
import re

# Sync JavaScript.html -> src/JavaScript.js
src_js = r'g:\My Drive\0.งานสถาบัน\data_PookPik_Tutor\JavaScript.html'
dst_js = r'g:\My Drive\0.งานสถาบัน\pookpik_tutor_repo\src\JavaScript.js'

with open(src_js, 'r', encoding='utf-8') as f:
    js_content = f.read()

# Remove <script> and </script> tags from the ends if present
js_content = re.sub(r'^\s*<script[^>]*>', '', js_content)
js_content = re.sub(r'</script>\s*$', '', js_content)

with open(dst_js, 'w', encoding='utf-8') as f:
    f.write(js_content)
print('Synced JavaScript.js')

# Sync index.html -> index.html
src_index = r'g:\My Drive\0.งานสถาบัน\data_PookPik_Tutor\index.html'
dst_index = r'g:\My Drive\0.งานสถาบัน\pookpik_tutor_repo\index.html'

with open(src_index, 'r', encoding='utf-8') as f:
    index_content = f.read()

# Replace <?!= include('JavaScript'); ?> with <script src="src/JavaScript.js?v=12345" charset="utf-8"></script>
import time
v = int(time.time())
index_content = re.sub(r'<\?!= include\(\'JavaScript\'\); \?>', f'<script src=\"src/JavaScript.js?v={v}\" charset=\"utf-8\"></script>', index_content)

with open(dst_index, 'w', encoding='utf-8') as f:
    f.write(index_content)
print('Synced index.html')
