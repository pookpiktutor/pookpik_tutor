const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const target1 = '<div id="low_balance_warning_banner" style="display: none; background: linear-gradient(135deg, #fef2f2, #fee2e2); border-bottom: 2px solid #ef4444; padding: 8px 16px 0px 16px; font-size: 0.9rem; color: #991b1b; font-weight: 500; align-items: center; gap: 6px; flex-wrap: wrap; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); z-index: 100;">';

const target2 = '<div id="teacher_leave_warning_banner" style="display: none; background: linear-gradient(135deg, #fffbeb, #fef3c7); border-bottom: 2px solid #f59e0b; padding: 8px 16px 0px 16px; font-size: 0.9rem; color: #92400e; font-weight: 500; align-items: center; gap: 6px; flex-wrap: wrap; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); z-index: 100;">';

html = html.replace(target1, '<div style="position: relative;">\n          ' + target1.replace('z-index: 100;', 'z-index: 100; padding-right: 200px;'));

html = html.replace(target2, target2.replace('z-index: 100;', 'z-index: 100; padding-right: 200px;'));

const endTarget = '</div>\n        \n        <!-- TOP BAR -->';
const inlineLoader = `</div>

          <!-- Inline Loading Indicator -->
          <div id="inline_loading_indicator" style="display: none; position: absolute; top: 0; right: 0; height: 100%; min-height: 38px; align-items: center; padding: 0 16px; background: rgba(255,255,255,0.9); backdrop-filter: blur(4px); border-left: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; font-size: 0.85rem; color: #0f172a; font-weight: 600; gap: 8px; z-index: 105; box-shadow: -2px 0 5px rgba(0,0,0,0.05);">
            <svg style="animation: spin 1.5s linear infinite; width: 16px; height: 16px; color: #0f172a;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 6v6l4 2"></path>
            </svg>
            <span id="inline_loading_text">กำลังโหลดข้อมูล...</span>
          </div>
        </div>
        
        <!-- TOP BAR -->`;

html = html.replace(endTarget, inlineLoader);
fs.writeFileSync('index.html', html);
console.log('done');
