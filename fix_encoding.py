with open('Code.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Encode to windows-1252 to get raw bytes, decode to utf-8
try:
    fixed_text = text.encode('windows-1252').decode('utf-8')
except Exception as e:
    # Handle cases where some characters cannot be encoded
    fixed_text = text.encode('windows-1252', errors='ignore').decode('utf-8', errors='ignore')

with open('Code.js', 'w', encoding='utf-8') as f:
    f.write(fixed_text)
print("Encoding fixed")
