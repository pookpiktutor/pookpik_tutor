import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace .month-tabs-container CSS
old_css = """.month-tabs-container {
            display: flex;
            gap: 4px;
            overflow-x: auto;
            padding: 4px;
            margin-bottom: 6px;
            background: rgba(15, 23, 42, 0.03);
            border-radius: 8px;
            border: 1px solid rgba(0, 0, 0, 0.02);
            scrollbar-width: none;
            -ms-overflow-style: none;
          }"""

new_css = """.month-tabs-container {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            padding: 8px;
            margin-bottom: 12px;
            background: rgba(15, 23, 42, 0.03);
            border-radius: 8px;
            border: 1px solid rgba(0, 0, 0, 0.02);
          }"""

if old_css in content:
    content = content.replace(old_css, new_css)
    print("Replaced exact CSS")
else:
    # Try regex
    content, count = re.subn(r'\.month-tabs-container\s*\{[^}]+\}', new_css, content)
    print(f"Regex replaced {count} times")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
