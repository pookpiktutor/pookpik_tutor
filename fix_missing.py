import re
import sys

def patch_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'index.html' in filepath:
        pass
    elif 'JavaScript.js' in filepath:
        # Fix 👨‍🏫 ครูประจำ: ... (แทน: ...) to use <br>ครูแทน:
        content = content.replace(
            "👨‍🏫 ครูประจำ: ${c.teacherRegular}${c.teacherSub ? ` (แทน: ${c.teacherSub})` : ''}",
            "👨‍🏫 ครูประจำ: ${c.teacherRegular}<br>ครูแทน: ${c.teacherSub ? c.teacherSub : '-'}"
        )
        content = content.replace(
            "👨‍🏫 ครูหลัก: ${log.teacherRegular}${log.teacherSub ? ` (แทน: ${log.teacherSub})` : ''}",
            "👨‍🏫 ครูประจำ: ${log.teacherRegular}<br>ครูแทน: ${log.teacherSub ? log.teacherSub : '-'}"
        )
        
        # We need to add attendanceSummary to generateStudentBlock
        # It's inside generateStudentBlock function, around line 1476.
        # Let's find where noteHtml is added.
        # First, generate the attendanceSummary in generateStudentBlock:
        target_code = """          const totalKids = (parseInt(c.isPresentLive) || 0) + (parseInt(c.isPresentOnline) || 0) + (parseInt(c.isMakeup) || 0);"""
        replacement_code = """          const totalKids = (parseInt(c.isPresentLive) || 0) + (parseInt(c.isPresentOnline) || 0) + (parseInt(c.isMakeup) || 0);
          
          const attendances = [];
          if (c.isPresentLive > 0) attendances.push(`สด: ${c.isPresentLive}`);
          if (c.isPresentOnline > 0) attendances.push(`ออน: ${c.isPresentOnline}`);
          if (c.isLeave > 0) attendances.push(`ลา: ${c.isLeave}`);
          if (c.isAbsent > 0) attendances.push(`ขาด: ${c.isAbsent}`);
          if (c.isMakeup > 0) attendances.push(`ชด: ${c.isMakeup}`);
          const attendanceSummaryHtml = attendances.length > 0 
            ? `<div style="font-size: 0.72rem; margin-top: 4px; color: var(--color-primary-hover); font-weight: 500;">👥 ${attendances.join(' ')}</div>` 
            : '';
"""
        content = content.replace(target_code, replacement_code)
        
        # Now inject attendanceSummaryHtml into the card HTML
        target_card_html = """            <div class="teacher-card-meta" style="gap: 6px;">"""
        replacement_card_html = """            <div class="teacher-card-meta" style="gap: 6px;">
              ${attendanceSummaryHtml}"""
        content = content.replace(target_card_html, replacement_card_html)
        
        # Let's ensure "ครูแทน" is consistently displayed in renderTeacherScheduleGrid (generateStudentBlock)
        # Wait, generateStudentBlock doesn't even show the teacher name in the card!
        # Ah, but the screenshot HAS the teacher name.
        # Could it be I'm looking at the WRONG function for the screenshot?
        # The screenshot has: "👨‍🏫 ครู: ครูน้ำตาล(ปิศาจร) วิทย์ ชีวะ"
        # Where is that? Let's check if my previous python script replaced something wrongly.
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

patch_file('src/JavaScript.js')
print("Done")
