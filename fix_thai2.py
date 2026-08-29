import re

with open('Code.js', 'r', encoding='utf-8') as f:
    text = f.read()

# All Thai characters corrupted as Windows-1252 start with 'à' (U+00E0).
# Let's define the specific strings we know are corrupted in Code.js:
corrupted_map = {
    'à¹„à¸¡à¹ˆà¸¡à¸µà¸„à¸£à¸¹à¹\x80à¸—à¸™': 'ไม่มีครูแทน',
    'à¹„à¸¡à¹ˆà¸¡à¸µà¸„à¸£à¸¹à¹\x81à¸—à¸™': 'ไม่มีครูแทน',
    'à¹„à¸¡à¹ˆà¸¡à¸µà¸œà¸¹à¹‰à¸ªà¸\xadà¸™à¹\x81à¸—à¸™': 'ไม่มีผู้สอนแทน',
    'à¸£à¸¢à¸§.': 'รยว.',
    'à¸„à¸£à¸¹à¸¥à¸²': 'ครูลา',
    'à¸„à¸£à¸¹à¸›à¸£à¸°à¸ˆà¸³': 'ครูประจำ',
    'à¸„à¸£à¸¹à¹\x81à¸—à¸™': 'ครูแทน',
    'à¸§à¸´à¸Šà¸²': 'วิชา',
    'à¹\x80à¸§à¸¥à¸²à¹\x80à¸£à¸´à¹ˆà¸¡': 'เวลาเริ่ม',
    'à¹\x80à¸§à¸¥à¸²à¸ˆà¸š': 'เวลาจบ',
    'à¸„à¸£à¸¹': 'ครู',
    'âš ï¸\x8f': '⚠️',
    '⚠️\xef\xbf\xbd': '⚠️' # Replacement character because of bad decoding
}

def fix_all(m):
    s = m.group(0)
    try:
        return s.encode('windows-1252').decode('utf-8')
    except:
        return s

fixed_text = re.sub(r'[àâ][^\s\w\(\)\[\]\{\}\.\,\;\:\'\"]+', fix_all, text)

# Just to be absolutely safe, hardcode replacements for the specific substitute teacher strings:
fixed_text = fixed_text.replace("cellC !== '⚠️à¹„à¸¡à¹ˆà¸¡à¸µà¸„à¸£à¸¹à¹à¸—à¸™'", "cellC !== '⚠️ไม่มีครูแทน'")
fixed_text = fixed_text.replace("cellC !== '⚠️ไม่มีครูทน'", "cellC !== '⚠️ไม่มีครูแทน'")
fixed_text = fixed_text.replace("cellC !== '⚠️ไม่มีครูทน'", "cellC !== '⚠️ไม่มีครูแทน'")
fixed_text = fixed_text.replace("cellC !== '(à¹„à¸¡à¹ˆà¸¡à¸µà¸œà¸¹à¹‰à¸ªà¸\xadà¸™à¹à¸—à¸™)'", "cellC !== '(ไม่มีผู้สอนแทน)'")
fixed_text = fixed_text.replace("cellC !== '(ไม่มีผู้สอนทน)'", "cellC !== '(ไม่มีผู้สอนแทน)'")
fixed_text = fixed_text.replace("role = 'ครูทน'", "role = 'ครูแทน'")
fixed_text = fixed_text.replace("role = 'à¸„à¸£à¸¹à¹à¸—à¸™'", "role = 'ครูแทน'")

with open('Code.js', 'w', encoding='utf-8') as f:
    f.write(fixed_text)

print("Fixed")
