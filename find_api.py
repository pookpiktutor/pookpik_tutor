import re

with open('src/JavaScript.js', 'r', encoding='utf-8') as f:
    js = f.read()

calls = set()
for match in re.finditer(r'\.withFailureHandler.*?\)\s*\.([a-zA-Z0-9_]+)\(', js, re.DOTALL):
    calls.add(match.group(1))

print("API Calls from frontend:")
for call in sorted(list(calls)):
    print(call)
