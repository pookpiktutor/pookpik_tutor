import re

with open('src/JavaScript.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('function handleLogin(e) {\n  e.preventDefault();', 'function handleLogin(e) {\n  if (e && typeof e.preventDefault === \'function\') e.preventDefault();')

with open('src/JavaScript.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched JavaScript.js")
