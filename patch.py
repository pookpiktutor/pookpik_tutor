import re

with open('src/JavaScript.js', 'r', encoding='utf-8') as f:
    content = f.read()

pattern1 = r'<td style="text-align: center;">\$\{\(parseInt\(c\.isPresentLive\)\|\|0\) \+ \(parseInt\(c\.isPresentOnline\)\|\|0\) \+ \(parseInt\(c\.isMakeup\)\|\|0\)\} คน</td>'
replacement1 = r'<td style="text-align: center;">${c.numKids} คน<br><span style="font-size: 0.6rem; color: #6c757d;">(สด:${c.isPresentLive || 0}, ออน:${c.isPresentOnline || 0}, ชด:${c.isMakeup || 0})</span></td>'

pattern2 = r'<td style="text-align: center; white-space: nowrap;">\$\{\(parseInt\(c\.isPresentLive\)\|\|0\) \+ \(parseInt\(c\.isPresentOnline\)\|\|0\) \+ \(parseInt\(c\.isMakeup\)\|\|0\)\} คน</td>'
replacement2 = r'<td style="text-align: center; white-space: nowrap;">${c.numKids} คน<br><span style="font-size: 0.6rem; color: #6c757d;">(สด:${c.isPresentLive || 0}, ออน:${c.isPresentOnline || 0}, ชด:${c.isMakeup || 0})</span></td>'

content = re.sub(pattern1, replacement1, content)
content = re.sub(pattern2, replacement2, content)

with open('src/JavaScript.js', 'w', encoding='utf-8') as f:
    f.write(content)
print('Patched src/JavaScript.js')
