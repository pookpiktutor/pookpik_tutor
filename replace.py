import re
with open('src/JavaScript.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace options loop
content = re.sub(
    r'channels\.forEach\(ch => \{\s*const selected = ch === s\.paymentChannel \? \'selected\' : \'\';\s*optionsHtml \+= `<option value=\"\$\{ch\}\" \$\{selected\}>\$\{ch\}<\/option>`;\s*\}\);',
    'channels.forEach(ch => { const isMatch = (ch === s.paymentChannel || (ch === \'\' && !s.paymentChannel)); const display = ch === \'\' ? \'- เลือก -\' : ch; optionsHtml += `<option value=\"${ch}\" ${isMatch ? \'selected\' : \'\'}>${display}</option>`; });',
    content
)

# Replace checkedCheckbox
content = re.sub(
    r'<input type=\"checkbox\" class=\"pr-check-checkbox\" data-id=\"\$\{s\.id\}\" \$\{s\.isChecked \? \'checked\' : \'\'\} onchange=\"this\.closest\(\'tr\'\)\.classList\.toggle\(\'checked-row\', this\.checked\)\" style=\"width: 18px; height: 18px; cursor: pointer;\">',
    '<input type=\"checkbox\" class=\"pr-check-checkbox\" data-id=\"${s.id}\" ${s.isChecked ? \'checked\' : \'\'} onchange=\"this.closest(\'tr\').classList.toggle(\'checked-row\', this.checked)\" style=\"width: 18px; height: 18px; cursor: pointer; margin-right: 8px; flex-shrink: 0;\">',
    content
)

# Replace tr.innerHTML first td
content = re.sub(
    r'<td style=\"white-space:nowrap;\"><div style=\"font-weight:600;\">\$\{s\.name\}\$\{s\.nickname \? ` \(\$\{s\.nickname\}\)` : \'\'\}<\/div><\/td>',
    '<td style=\"white-space:nowrap;\"><div style=\"display: flex; align-items: center;\">${checkedCheckbox}<div style=\"font-weight:600; white-space: normal; min-width: 150px;\">${s.name}${s.nickname ? ` (${s.nickname})` : \'\'}${s.isChecked ? \'<span style=\"font-size:0.7rem; color:green; background:#e8f5e9; padding:2px 6px; border-radius:4px; margin-left: 8px; border: 1px solid #a5d6a7;\">เช็คแล้ว</span>\' : \'\'}</div></div></td>',
    content
)

with open('src/JavaScript.js', 'w', encoding='utf-8') as f:
    f.write(content)