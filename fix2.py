import re

with open('Code.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace any occurrence of the corrupted string
content = re.sub(r"role = 'à¸„à¸£à¸¹à¹[^']*';", "role = 'ครูแทน';", content)
content = re.sub(r"role = 'à¸„à¸£à¸¹à¸›à¸£à¸°à¸ˆà¸³';", "role = 'ครูประจำ';", content)
content = re.sub(r"\'à¸„à¸£à¸¹à¸›à¸£à¸°à¸ˆà¸³\'", "'ครูประจำ'", content)
content = re.sub(r"\(à¸ˆà¸³à¸[^']*à¸±à¸”à¸ªà¸´à¸—à¸˜à¸´à¹Œà¸„à¸£à¸¹à¸œà¸¹à¹‰à¸ªà¸\xadà¸™\)", "(จำกัดสิทธิ์ครูผู้สอน)", content)
content = re.sub(r"\(à¸ˆà¸³à¸à¸±à¸”à¸ªà¸´à¸—à¸˜à¸´à¹Œà¸„à¸£à¸¹à¸œà¸¹à¹‰à¸ªà¸­à¸™\)", "(จำกัดสิทธิ์ครูผู้สอน)", content)

with open('Code.js', 'w', encoding='utf-8') as f:
    f.write(content)
print('fixed2')
