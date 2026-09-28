const fs = require('fs');
let c = fs.readFileSync('src/JavaScript.js', 'utf8');

const regex = /const channels = state\.settings\.paymentChannels \|\| \[\];([\s\S]*?)<td style="white-space:nowrap;"><div style="font-weight:600;">\$\{s\.name\}\$\{s\.nickname \? \ \(\$\{s\.nickname\}\)\ : ''\}<\/div><\/td>/;
const match = c.match(regex);
if (match) {
  let block = match[1];
  block = block.replace(/channels\.forEach\(ch => \{[\s\S]*?\}\);/, 'channels.forEach(ch => { const isMatch = (ch === s.paymentChannel || (ch === "" && !s.paymentChannel)); const display = ch === "" ? "- เลือก -" : ch; optionsHtml += \<option value="\\\" \\>\\</option>\; });');
  block = block.replace(/<input type="checkbox" class="pr-check-checkbox".*?>/, '<input type="checkbox" class="pr-check-checkbox" data-id="\\\" \\ onchange="this.closest(\\'tr\\').classList.toggle(\\'checked-row\\', this.checked)" style="width: 18px; height: 18px; cursor: pointer; margin-right: 8px; flex-shrink: 0;">');
  
  let newStr = 'const channels = [ "", "กรุงไทย พี่ปิ๊ก", "กรุงเทพ พี่ปิ๊ก", "SCB พี่ปิ๊ก", "กรุงศรี พี่ปิ๊ก", "TTB", "กสิกร คุณยาย", "SCB คุณยาย", "กรุงศรี คุณตา", "กรุงศรี บัญชีบริษัท", "กสิกร บัญชีบริษัท(กด)", "กสิกร บัญชีบริษัท(สแกน)", "TTB บัญชีบริษัท(กด)", "TTB บัญชีบริษัท(สแกน)", "เงินสด", "พี่ปิ๊ก โอน", "พี่ต้น โอน" ];' + block + '<td style="white-space:nowrap;"><div style="display: flex; align-items: center;">\n          \${checkedCheckbox}\n          <div style="font-weight:600; white-space: normal; min-width: 150px;">\n            \${s.name}\${s.nickname ? \ (\${s.nickname})\ : ""}\n            \${s.isChecked ? \'<span style="font-size:0.7rem; color:green; background:#e8f5e9; padding:2px 6px; border-radius:4px; margin-left: 8px; border: 1px solid #a5d6a7;">เช็คแล้ว</span>\' : ""}\n          </div>\n        </div>\n      </td>';
  
  c = c.replace(regex, newStr);
  fs.writeFileSync('src/JavaScript.js', c);
  console.log('Replaced');
} else {
  console.log('Not found');
}

