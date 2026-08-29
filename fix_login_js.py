import os

filepath = 'src/JavaScript.js'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("function handleLogin(e) {\n\n  e.preventDefault();", "function handleLogin(e) {\n\n  if (e && e.preventDefault) e.preventDefault();")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed handleLogin preventDefault.")
