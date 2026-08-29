with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

target = "<datalist id=\"teachers_datalist\"></datalist>\n</body>\n</html>"
replacement = "<datalist id=\"teachers_datalist\"></datalist>\n    <!-- GITHUB PAGES SCRIPT IMPORT -->\n    <script src=\"src/JavaScript.js\" charset=\"utf-8\"></script>\n</body>\n</html>"

import re
text = re.sub(r"<datalist id=\"teachers_datalist\"></datalist>\s*</body>\s*</html>", replacement, text)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)
print("Updated index.html")
