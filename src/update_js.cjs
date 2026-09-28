const fs = require('fs');
let c = fs.readFileSync('JavaScript.js', 'utf8');

const regex = /let optionsHtml = '';[\s\S]*?const channelSelect = `[\s\S]*?`;[\s\S]*?const checkedCheckbox = `[\s\S]*?`;/;

const replacement = `let channelSelect = '';
    let checkedCheckbox = '';

    if (state.activeRevenueTab === 'all') {
      const displayChannel = s.paymentChannel || '-';
      channelSelect = \`<span style="font-size: 0.85rem; color: var(--text-main);">\${displayChannel}</span>\`;
      checkedCheckbox = '';
    } else {
      let optionsHtml = '';
      channels.forEach(ch => { const isMatch = (ch === s.paymentChannel || (ch === '' && !s.paymentChannel)); const display = ch === '' ? '- เลือก -' : ch; optionsHtml += \`<option value="\${ch}" \${isMatch ? 'selected' : ''}>\${display}</option>\`; });
      channelSelect = \`
        <select class="form-select table-select pr-channel-select" data-id="\${s.id}" style="padding: 2px 4px; font-size: 0.85rem; min-width: 120px; height: 28px;">
          \${optionsHtml}
        </select>
      \`;
      checkedCheckbox = \`
        <input type="checkbox" class="pr-check-checkbox" data-id="\${s.id}" \${s.isChecked ? 'checked' : ''} onchange="this.closest('tr').classList.toggle('checked-row', this.checked)" style="width: 18px; height: 18px; cursor: pointer; margin-right: 8px; flex-shrink: 0;">
      \`;
    }`;

c = c.replace(regex, replacement);

c = c.replace(/<td style="white-space:nowrap; text-align: center; width: 1%;">/g, '<td style="white-space:nowrap; text-align: center;">');
c = c.replace(/<td style="white-space:nowrap; width: 1%;">/g, '<td style="white-space:nowrap;">');
c = c.replace(/<td style="white-space:nowrap; text-align: right; width: 1%;">/g, '<td style="white-space:nowrap; text-align: right;">');
c = c.replace(/<td style="white-space:nowrap; text-align: right; color: var\(--color-success\); font-weight: 600; width: 1%;">/g, '<td style="white-space:nowrap; text-align: right; color: var(--color-success); font-weight: 600;">');
c = c.replace(/<td style="text-align: center; white-space:nowrap; width: 1%;">/g, '<td style="text-align: center; white-space:nowrap;">');

fs.writeFileSync('JavaScript.js', c);
console.log("Replaced!");
