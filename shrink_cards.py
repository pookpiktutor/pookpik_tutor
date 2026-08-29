import re

with open('src/JavaScript.js', 'r', encoding='utf-8') as f:
    content = f.read()

# gridTemplateColumns
content = re.sub(
    r"monthItemsContainer\.style\.gridTemplateColumns = 'repeat\(auto-fill, minmax\(210px, 1fr\)\)';",
    "monthItemsContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(160px, 1fr))';",
    content
)

# card padding
content = re.sub(
    r"card\.style\.padding = '10px 12px';",
    "card.style.padding = '8px 10px';",
    content
)

# card subject font size
content = re.sub(
    r"<div style=\"font-weight: 700; font-size: 0\.78rem; color: var\(--text-main\);",
    '<div style="font-weight: 700; font-size: 0.7rem; color: var(--text-main);',
    content
)

# card time font size
content = re.sub(
    r"<span style=\"font-size: 0\.7rem; font-weight: bold; color: var\(--color-primary-hover\);",
    '<span style="font-size: 0.65rem; font-weight: bold; color: var(--color-primary-hover);',
    content
)

# card detail font size
content = re.sub(
    r"<div style=\"font-size: 0\.72rem; color: var\(--text-muted\); display: flex; flex-direction: column;",
    '<div style="font-size: 0.65rem; color: var(--text-muted); display: flex; flex-direction: column;',
    content
)

# attendance badge font sizes
content = re.sub(
    r"style=\"font-size:0\.6rem; padding: 2px 4px;\"",
    'style="font-size:0.55rem; padding: 1px 3px;"',
    content
)

# the other attendance badge with background-color
content = re.sub(
    r"style=\"font-size:0\.6rem; background-color:#c095e7; color:white; padding: 2px 4px;\"",
    'style="font-size:0.55rem; background-color:#c095e7; color:white; padding: 1px 3px;"',
    content
)

# roleBadge and confirmedBadge font sizes
content = re.sub(
    r"font-size: 0\.6rem; font-weight: bold; padding: 1px 4px;",
    'font-size: 0.55rem; font-weight: bold; padding: 1px 3px;',
    content
)
content = re.sub(
    r"font-size:0\.63rem; padding:2px 6px;",
    'font-size:0.58rem; padding:1px 4px;',
    content
)

with open('src/JavaScript.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Card size reduced by 20%.")
