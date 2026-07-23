# -*- coding: utf-8 -*-
"""Fix numKids display to use G+H+K and filter Zoom from roomBranch in frontend"""
import re

with open('src/JavaScript.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix numKids display: replace c.numKids with (c.isPresentLive + c.isPresentOnline + c.isMakeup)
# Line 1904 and 13484
content = content.replace(
    '${c.numKids} คน',
    '${(parseInt(c.isPresentLive)||0) + (parseInt(c.isPresentOnline)||0) + (parseInt(c.isMakeup)||0)} คน'
)

# Check c.numKids > 0 references (already commented out per earlier work)
# No action needed

with open('src/JavaScript.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed numKids display to use G+H+K')

# Now fix JavaScript.html to hide the orange input field
with open('JavaScript.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Find and comment out class_kids_orange input
html = re.sub(
    r'(<(?:div|span)[^>]*>[\s\S]*?class_kids_orange[\s\S]*?</(?:div|span)>)',
    lambda m: '<!-- ' + m.group(0) + ' -->',
    html,
    count=1
)

with open('JavaScript.html', 'w', encoding='utf-8') as f:
    f.write(html)

print('Hidden orange input in JavaScript.html')
