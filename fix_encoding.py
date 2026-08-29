import io

with io.open('Code_old.js', 'r', encoding='utf-16') as f:
    content = f.read()

# Let's find a mangled string to test
mangled = 'เน€เธ”เธตเนˆเธขเธง เธญเธ™เธธเธšเธฒเธฅ'
try:
    fixed = mangled.encode('cp1252').decode('utf-8')
    print("cp1252:", fixed)
except:
    pass

try:
    fixed = mangled.encode('cp874').decode('utf-8')
    print("cp874:", fixed)
except Exception as e:
    print("cp874 error:", e)

# Let's try to just use python's 'latin1' to 'utf-8' which is common for this kind of mojibake
try:
    fixed = mangled.encode('latin1').decode('utf-8')
    print("latin1:", fixed)
except:
    pass

# Or cp874
try:
    fixed = mangled.encode('windows-874').decode('utf-8')
    print("windows-874:", fixed)
except:
    pass

