import re
import sys

def patch_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'index.html' in filepath:
        # Avoid duplicate onblur
        content = re.sub(r'(<input[^>]+list=\"class_subject_list_[^\"]+\"[^>]*) onblur=\"validateDatalistInput\(this\)\">', r'\1>', content)
        
        # Add onblur
        content = re.sub(r'(<input[^>]+list=\"class_subject_list_[^\"]+\"[^>]*)>', r'\1 onblur=\"validateDatalistInput(this)\">', content)

    elif 'JavaScript.js' in filepath:
        content = content.replace('ครู: ${l.teacher}', 'ครูประจำ: ${l.teacher}')
        content = content.replace('ครู: ${c.teacherRegular}', 'ครูประจำ: ${c.teacherRegular}')
        content = content.replace('ครู: ${log.teacherRegular}', 'ครูประจำ: ${log.teacherRegular}')
        
        # update sub teacher logic
        content = content.replace('${l.teacherSub ? ` ครูแทน: ${l.teacherSub}` : \' (ไม่มีครูแทน)\'}', '<br>ครูแทน: ${l.teacherSub ? l.teacherSub : \'-\'}')
        content = content.replace('ครูแทน: ${c.teacherSub ? c.teacherSub : \'\'}', '<br>ครูแทน: ${c.teacherSub ? c.teacherSub : \'-\'}')
        content = content.replace('ครูแทน: ${log.teacherSub ? log.teacherSub : \'\'}', '<br>ครูแทน: ${log.teacherSub ? log.teacherSub : \'-\'}')
        content = content.replace('แทน: ${c.teacherSub ? c.teacherSub : \'\'}', 'ครูแทน: ${c.teacherSub ? c.teacherSub : \'-\'}')
        content = content.replace('แทน: ${log.teacherSub ? log.teacherSub : \'\'}', 'ครูแทน: ${log.teacherSub ? log.teacherSub : \'-\'}')
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

patch_file('index.html')
patch_file('src/JavaScript.js')
