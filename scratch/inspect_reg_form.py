import sys
import re

sys.stdout.reconfigure(encoding='utf-8')
with open('register.html', 'r', encoding='utf-8') as f:
    content = f.read()

m1 = content.find('<form id="camp_form">')
m2 = content.find('</form>', m1)
print("=== camp_form HTML ===")
print(content[m1:m2+7])

m3 = content.find('function calculateCampCost()')
print("=== calculateCampCost JS ===")
print(content[m3:m3+1500])
