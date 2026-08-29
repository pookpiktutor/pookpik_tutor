import os

filepath = 'src/JavaScript.js'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

new_content = content.replace("\\`", "`")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"Replaced backticks. Validating syntax with node...")
os.system(f"node -c {filepath}")
