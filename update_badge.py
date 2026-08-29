import re

with open('JavaScript.html', 'r', encoding='utf-8') as f:
    content = f.read()

target1 = """    if (displayRole && displayRole.includes('สอนแทน')) {
      displayRole = 'สอนแทน';
    }"""

replacement1 = """    if (displayRole && (displayRole.includes('สอนแทน') || displayRole.includes('ครูแทน'))) {
      displayRole = 'ครูแทน';
    }"""

content = content.replace(target1, replacement1)

target2 = """<td><span class="badge ${c.role.includes('สอนแทน') ? 'badge-warning' : 'badge-success'}">${displayRole}</span></td>"""

replacement2 = """<td><span class="badge ${(c.role.includes('สอนแทน') || c.role.includes('ครูแทน')) ? 'badge-warning' : 'badge-success'}">${displayRole}</span></td>"""

content = content.replace(target2, replacement2)

with open('JavaScript.html', 'w', encoding='utf-8') as f:
    f.write(content)
