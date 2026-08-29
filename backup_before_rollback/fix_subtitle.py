#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fix subtitles: Move sub-headings below main page title for manager_logs and activity_logs panels.

Changes:
1. Index.html: Add page_subtitle div in topbar, hide toolbar heading in manager_logs_panel and activity_logs_panel
2. JavaScript.html: Set subtitle in switchPanel for those panels, clear it for others
3. Styles.html: Add CSS for page-subtitle and topbar-title-group
"""

import re

def fix_index():
    filepath = r'g:\My Drive\0.งานสถาบัน\data_PookPik_Tutor\Index.html'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add page_subtitle in topbar - wrap page_title and subtitle in a group
    old_topbar = '''<header class="topbar">\r\n          <div class="page-title" id="page_title">ระบบดูแลโรงเรียนกวดวิชา</div>\r\n          <div class="topbar-actions">'''
    new_topbar = '''<header class="topbar">\r\n          <div class="topbar-title-group">\r\n            <div class="page-title" id="page_title">ระบบดูแลโรงเรียนกวดวิชา</div>\r\n            <div class="page-subtitle" id="page_subtitle" style="display: none;"></div>\r\n          </div>\r\n          <div class="topbar-actions">'''
    
    if old_topbar in content:
        content = content.replace(old_topbar, new_topbar)
        print("[OK] Added page_subtitle in topbar")
    else:
        print("[FAIL] Could not find topbar pattern to add subtitle")
        # Try without \r\n
        old_topbar2 = old_topbar.replace('\r\n', '\n')
        new_topbar2 = new_topbar.replace('\r\n', '\n')
        if old_topbar2 in content:
            content = content.replace(old_topbar2, new_topbar2)
            print("[OK] Added page_subtitle in topbar (LF line endings)")
        else:
            print("[FAIL] Still could not find topbar pattern")

    # 2. Hide toolbar heading in manager_logs_panel  
    # The heading div in toolbar
    old_mgr_heading = '''<div style="font-family: var(--font-heading); font-size: 1.1rem; font-weight: 500;">\n                ประวัติการบันทึกเวลาและการทำงาน (ผจก.)\n              </div>'''
    new_mgr_heading = '''<div style="font-family: var(--font-heading); font-size: 1.1rem; font-weight: 500; display: none;">\n                ประวัติการบันทึกเวลาและการทำงาน (ผจก.)\n              </div>'''
    
    if old_mgr_heading in content:
        content = content.replace(old_mgr_heading, new_mgr_heading)
        print("[OK] Hidden manager_logs toolbar heading")
    else:
        print("[FAIL] Could not find manager_logs toolbar heading (trying alternate)")
        # Try with \r\n
        old_mgr2 = old_mgr_heading.replace('\n', '\r\n')
        new_mgr2 = new_mgr_heading.replace('\n', '\r\n')
        if old_mgr2 in content:
            content = content.replace(old_mgr2, new_mgr2)
            print("[OK] Hidden manager_logs toolbar heading (CRLF)")
        else:
            print("[FAIL] Still could not find manager_logs heading")

    # 3. Hide toolbar heading in activity_logs_panel
    old_act_heading = '''<div style="font-family: var(--font-heading); font-size: 1.1rem; font-weight: 500;">รายงานประวัติการเข้าใช้งานและการทำงานของระบบ</div>'''
    new_act_heading = '''<div style="font-family: var(--font-heading); font-size: 1.1rem; font-weight: 500; display: none;">รายงานประวัติการเข้าใช้งานและการทำงานของระบบ</div>'''
    
    if old_act_heading in content:
        content = content.replace(old_act_heading, new_act_heading)
        print("[OK] Hidden activity_logs toolbar heading")
    else:
        print("[FAIL] Could not find activity_logs toolbar heading")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("[OK] Index.html saved")


def fix_javascript():
    filepath = r'g:\My Drive\0.งานสถาบัน\data_PookPik_Tutor\JavaScript.html'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add subtitle logic after setting page_title
    old_js = "document.getElementById('page_title').innerText = titles[panelName] || 'ระบบดูแลโรงเรียนกวดวิชา';"
    
    subtitle_js = """document.getElementById('page_title').innerText = titles[panelName] || 'ระบบดูแลโรงเรียนกวดวิชา';
  
  // Set subtitle for specific panels
  const subtitles = {
    'manager_logs': 'ประวัติการบันทึกเวลาและการทำงาน (ผจก.)',
    'activity_logs': 'รายงานประวัติการเข้าใช้งานและการทำงานของระบบ'
  };
  const subtitleEl = document.getElementById('page_subtitle');
  if (subtitleEl) {
    if (subtitles[panelName]) {
      subtitleEl.innerText = subtitles[panelName];
      subtitleEl.style.display = '';
    } else {
      subtitleEl.innerText = '';
      subtitleEl.style.display = 'none';
    }
  }"""

    if old_js in content:
        content = content.replace(old_js, subtitle_js)
        print("[OK] Added subtitle logic in switchPanel")
    else:
        print("[FAIL] Could not find switchPanel page_title setter")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("[OK] JavaScript.html saved")


def fix_styles():
    filepath = r'g:\My Drive\0.งานสถาบัน\data_PookPik_Tutor\Styles.html'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add CSS for topbar-title-group and page-subtitle after .page-title styles
    old_css = """.page-title {\r\n\r\n  font-family: var(--font-heading);\r\n\r\n  font-size: 1.5rem;\r\n\r\n  font-weight: 600;\r\n\r\n  color: var(--text-main);\r\n\r\n}"""
    
    new_css = """.topbar-title-group {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 2px;\r\n  min-width: 0;\r\n}\r\n\r\n.page-title {\r\n\r\n  font-family: var(--font-heading);\r\n\r\n  font-size: 1.5rem;\r\n\r\n  font-weight: 600;\r\n\r\n  color: var(--text-main);\r\n\r\n}\r\n\r\n.page-subtitle {\r\n  font-family: var(--font-heading);\r\n  font-size: 1.0rem;\r\n  font-weight: 500;\r\n  color: var(--text-muted);\r\n  margin-top: 2px;\r\n}"""

    if old_css in content:
        content = content.replace(old_css, new_css)
        print("[OK] Added subtitle CSS")
    else:
        # Try with LF
        old_css2 = old_css.replace('\r\n', '\n')
        new_css2 = new_css.replace('\r\n', '\n')
        if old_css2 in content:
            content = content.replace(old_css2, new_css2)
            print("[OK] Added subtitle CSS (LF)")
        else:
            print("[FAIL] Could not find page-title CSS block")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("[OK] Styles.html saved")


if __name__ == '__main__':
    print("=== Fixing subtitle layout ===")
    fix_index()
    print()
    fix_javascript()
    print()
    fix_styles()
    print("\n=== Done! ===")
