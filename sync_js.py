import io

with io.open('src/JavaScript.js', 'r', encoding='utf-8') as f:
    content = f.read()

html_content = '<script>\n' + content + '\n</script>'

with io.open('JavaScript.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

print("[OK] Synced src/JavaScript.js -> JavaScript.html")
