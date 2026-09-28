import sys
import re

sys.stdout.reconfigure(encoding='utf-8')
with open('register.html', 'r', encoding='utf-8') as f:
    content = f.read()

print("Length of register.html:", len(content))

# Search for camp_form or camp_name
m = re.search(r'id=["\']camp_name["\']', content)
if m:
    start = max(0, m.start() - 300)
    end = min(len(content), m.start() + 2500)
    print("=== camp_name snippet ===")
    print(content[start:end])

# Search for calculateCampCost
m2 = re.search(r'function calculateCampCost', content)
if m2:
    start = max(0, m2.start() - 100)
    end = min(len(content), m2.start() + 2000)
    print("=== calculateCampCost snippet ===")
    print(content[start:end])
