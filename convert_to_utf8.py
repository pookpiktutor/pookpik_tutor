import io

with io.open('Code_old.js', 'r', encoding='utf-16') as f:
    content = f.read()

with io.open('Code.js', 'w', encoding='utf-8') as f:
    f.write(content)
