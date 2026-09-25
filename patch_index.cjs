const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Replace tab buttons
html = html.replace(
  /<button class="branch-tab active" id="tab_rev_list"[^>]*>.*?<\/button>/,
  '<button class="branch-tab active" id="tab_rev_paid" onclick="switchRevenueSubTab(\'paid\')">📋 รายการที่ชำระแล้ว</button>'
);
html = html.replace(
  /<button class="branch-tab" id="tab_rev_summary"[^>]*>.*?<\/button>/,
  '<button class="branch-tab" id="tab_rev_all" onclick="switchRevenueSubTab(\'all\')">📊 รายการลงทะเบียนทั้งหมด</button>'
);

// 2. Add "สาขา" column header after "ชั้น" in revenue table and rename "เช็คแล้ว" to "สถานะ"
// Find the revenue logs table header section 
const revenueTableStart = html.indexOf('revenue-logs-table');
if (revenueTableStart > -1) {
  // Find the thead section after revenue-logs-table
  const theadStart = html.indexOf('<thead>', revenueTableStart);
  const theadEnd = html.indexOf('</thead>', theadStart);
  if (theadStart > -1 && theadEnd > -1) {
    let thead = html.substring(theadStart, theadEnd + 8);
    
    // Add สาขา after ชั้น
    thead = thead.replace(
      '<th style="width: 1%;">ชั้น</th>\r\n',
      '<th style="width: 1%;">ชั้น</th>\r\n                      <th style="width: 1%;">สาขา</th>\r\n'
    );
    // Also try without \r
    thead = thead.replace(
      '<th style="width: 1%;">ชั้น</th>\n',
      '<th style="width: 1%;">ชั้น</th>\n                      <th style="width: 1%;">สาขา</th>\n'
    );
    
    // Rename เช็คแล้ว to สถานะ
    thead = thead.replace('เช็คแล้ว', 'สถานะ');
    
    html = html.substring(0, theadStart) + thead + html.substring(theadEnd + 8);
  }
}

// 3. Update switchRevenueSubTab function references  
html = html.replace(
  "switchRevenueSubTab('list')",
  "switchRevenueSubTab('paid')"
);

// 4. Update the switchRevenueSubTab function in the inline script
html = html.replace(
  "const tabList = document.getElementById('tab_rev_list');",
  "const tabList = document.getElementById('tab_rev_paid');"
);
html = html.replace(
  "const tabSummary = document.getElementById('tab_rev_summary');",
  "const tabSummary = document.getElementById('tab_rev_all');"
);
html = html.replace(
  "tabList.classList.toggle('active', tabName === 'list')",
  "tabList.classList.toggle('active', tabName === 'paid')"
);
html = html.replace(
  "tabSummary.classList.toggle('active', tabName === 'summary')",
  "tabSummary.classList.toggle('active', tabName === 'all')"
);
html = html.replace(
  "panelList.style.display = tabName === 'list'",
  "panelList.style.display = tabName === 'paid'"
);
html = html.replace(
  "panelSummary.style.display = tabName === 'summary'",
  "panelSummary.style.display = tabName === 'all'"
);

fs.writeFileSync('index.html', html, 'utf8');
console.log('index.html patched successfully');

// Verify
const check = fs.readFileSync('index.html', 'utf8');
console.log('tab_rev_paid found:', check.includes('tab_rev_paid'));
console.log('tab_rev_all found:', check.includes('tab_rev_all'));
console.log('สาขา header found:', check.includes('>สาขา</th>'));
console.log('สถานะ found:', check.includes('สถานะ'));
