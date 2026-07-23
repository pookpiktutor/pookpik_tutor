import re

def patch_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace `<br>ครูแทน:` with `<br>🔄 ครูแทน:`
    content = content.replace('<br>ครูแทน: ', '<br>🔄 ครูแทน: ')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

patch_file('src/JavaScript.js')
print("Done")
