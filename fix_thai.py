import re

with open('Code.js', 'r', encoding='utf-8') as f:
    text = f.read()

def fix_match(m):
    s = m.group(0)
    try:
        return s.encode('windows-1252').decode('utf-8')
    except Exception:
        return s

# Match ONLY characters in the Latin-1 supplement (0x80 to 0xFF)
# Some corrupted thai characters might include other extended characters?
# The corrupted string is typically encoded windows-1252 bytes interpreted as UTF-8.
# Actually, windows-1252 has bytes like 0x81, 0x8D, 0x8F, 0x90, 0x9D which are not in ISO-8859-1.
# Let's just match any character <= U+00FF, excluding ASCII
fixed_text = re.sub(r'[\x80-\xFF]+', fix_match, text)

with open('Code.js', 'w', encoding='utf-8') as f:
    f.write(fixed_text)

print("Fixed encoding.")
