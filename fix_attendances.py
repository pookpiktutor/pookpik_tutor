import re

def patch_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # In JavaScript.js, we replace the conditional pushes with unconditional pushes 
    # to ensure all statuses (Live, Online, Leave, Absent, Makeup) are ALWAYS shown.
    
    # Block 1 (Line ~1383, generateStudentBlock)
    content = re.sub(
        r'if \(c\.isPresentLive > 0\) attendances\.push\(`สด: \${c\.isPresentLive}`\);',
        r'attendances.push(`สด: ${c.isPresentLive || 0}`);',
        content
    )
    content = re.sub(
        r'if \(c\.isPresentOnline > 0\) attendances\.push\(`ออน: \${c\.isPresentOnline}`\);',
        r'attendances.push(`ออน: ${c.isPresentOnline || 0}`);',
        content
    )
    content = re.sub(
        r'if \(c\.isLeave > 0\) attendances\.push\(`ลา: \${c\.isLeave}`\);',
        r'attendances.push(`ลา: ${c.isLeave || 0}`);',
        content
    )
    content = re.sub(
        r'if \(c\.isAbsent > 0\) attendances\.push\(`ขาด: \${c\.isAbsent}`\);',
        r'attendances.push(`ขาด: ${c.isAbsent || 0}`);',
        content
    )
    content = re.sub(
        r'if \(c\.isMakeup > 0\) attendances\.push\(`ชด: \${c\.isMakeup}`\);',
        r'attendances.push(`ชด: ${c.isMakeup || 0}`);',
        content
    )
    
    # The condition `const attendanceSummaryHtml = attendances.length > 0 ...` is now always true because it has 5 elements.
    # Block 2 (Line ~8731) - same variables c
    # Block 3 (Line ~9503) - same variables c
    # All of these are using `c.` so the regex will replace them globally in the file.
    
    # Block 4 (Line ~12580) - uses `log.` instead of `c.`
    content = re.sub(
        r'if \(log\.isPresentLive > 0\) attendances\.push\(`<span class="badge badge-success" style="font-size:0\.6rem; padding: 2px 4px;">สด: \${log\.isPresentLive}<\/span>`\);',
        r'attendances.push(`<span class="badge badge-success" style="font-size:0.6rem; padding: 2px 4px;">สด: ${log.isPresentLive || 0}</span>`);',
        content
    )
    content = re.sub(
        r'if \(log\.isPresentOnline > 0\) attendances\.push\(`<span class="badge badge-info" style="font-size:0\.6rem; padding: 2px 4px;">ออน: \${log\.isPresentOnline}<\/span>`\);',
        r'attendances.push(`<span class="badge badge-info" style="font-size:0.6rem; padding: 2px 4px;">ออน: ${log.isPresentOnline || 0}</span>`);',
        content
    )
    content = re.sub(
        r'if \(log\.isLeave > 0\) attendances\.push\(`<span class="badge badge-warning" style="font-size:0\.6rem; padding: 2px 4px;">ลา: \${log\.isLeave}<\/span>`\);',
        r'attendances.push(`<span class="badge badge-warning" style="font-size:0.6rem; padding: 2px 4px;">ลา: ${log.isLeave || 0}</span>`);',
        content
    )
    content = re.sub(
        r'if \(log\.isAbsent > 0\) attendances\.push\(`<span class="badge badge-danger" style="font-size:0\.6rem; padding: 2px 4px;">ขาด: \${log\.isAbsent}<\/span>`\);',
        r'attendances.push(`<span class="badge badge-danger" style="font-size:0.6rem; padding: 2px 4px;">ขาด: ${log.isAbsent || 0}</span>`);',
        content
    )
    content = re.sub(
        r'if \(log\.isMakeup > 0\) attendances\.push\(`<span class="badge" style="font-size:0\.6rem; background-color:#c095e7; color:white; padding: 2px 4px;">ชด: \${log\.isMakeup}<\/span>`\);',
        r'attendances.push(`<span class="badge" style="font-size:0.6rem; background-color:#c095e7; color:white; padding: 2px 4px;">ชด: ${log.isMakeup || 0}</span>`);',
        content
    )
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

patch_file('src/JavaScript.js')
print("Done")
