import re

with open("src/JavaScript.js", "r", encoding="utf-8") as f:
    js = f.read()

# 1. Update the teacher labels
js = js.replace("ครู: ${l.teacher}", "ครูประจำ: ${l.teacher}")
js = js.replace("ครู: ${c.teacherRegular}", "ครูประจำ: ${c.teacherRegular}")
js = js.replace("ครู: ${log.teacherRegular}", "ครูประจำ: ${log.teacherRegular}")

# 2. Update the sub teacher labels to always show
# The original code has: ${l.teacherSub ? ` ครูแทน: ${l.teacherSub}` : ' (ไม่มีครูแทน)'}
js = js.replace("${l.teacherSub ? ` ครูแทน: ${l.teacherSub}` : ' (ไม่มีครูแทน)'}", "<br>ครูแทน: ${l.teacherSub ? l.teacherSub : '-'}")

# In other places, they use `ครูแทน: ${c.teacherSub ? c.teacherSub : ''}`
js = js.replace("ครูแทน: ${c.teacherSub ? c.teacherSub : ''}", "<br>ครูแทน: ${c.teacherSub ? c.teacherSub : '-'}")
js = js.replace("ครูแทน: ${log.teacherSub ? log.teacherSub : ''}", "<br>ครูแทน: ${log.teacherSub ? log.teacherSub : '-'}")

# There are also places with `<div>ผู้สอน แทน: ${c.teacherSub ? c.teacherSub : ''}</div>` maybe?
js = js.replace("แทน: ${c.teacherSub ? c.teacherSub : ''}", "ครูแทน: ${c.teacherSub ? c.teacherSub : '-'}")
js = js.replace("แทน: ${log.teacherSub ? log.teacherSub : ''}", "ครูแทน: ${log.teacherSub ? log.teacherSub : '-'}")

with open("src/JavaScript.js", "w", encoding="utf-8") as f:
    f.write(js)

with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

# Add validation to datalist inputs
html = re.sub(r'(<input[^>]+list="class_subject[^>]+)>', r'\1 onblur="validateDatalistInput(this)">', html)
html = re.sub(r'(<input[^>]+list="class_subject_list"[^>]+)>', r'\1 onblur="validateDatalistInput(this)">', html)

# Some inputs might already have onblur, but this regex should be safe as long as they don't have it.
# Let's ensure no duplicate onblur="validateDatalistInput(this)"
html = html.replace(' onblur="validateDatalistInput(this)"> onblur="validateDatalistInput(this)">', ' onblur="validateDatalistInput(this)">')

with open("index.html", "w", encoding="utf-8") as f:
    f.write(html)
