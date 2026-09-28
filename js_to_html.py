import os

with open('src/JavaScript.js', 'r', encoding='utf-8') as f:
    js_content = f.read()

html = f"<script>\n{js_content}\n</script>"

with open('JavaScript.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('Done JS to HTML!')
