import os

with open('src/Index.html', 'r', encoding='utf-8') as f:
    html = f.read()

with open('Styles.html', 'r', encoding='utf-8') as f:
    styles = f.read()
    
with open('JavaScript.html', 'r', encoding='utf-8') as f:
    js = f.read()

html = html.replace("<?!= include('Styles'); ?>", styles)
html = html.replace("<?!= include('JavaScript'); ?>", js)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('Done!')
