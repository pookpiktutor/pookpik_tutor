import re

with open('Code.js', 'r', encoding='utf-8') as f:
    js = f.read()

backend_funcs = set()
for match in re.finditer(r'^function\s+([a-zA-Z0-9_]+)\s*\(', js, re.MULTILINE):
    backend_funcs.add(match.group(1))

with open('find_api.py', 'r', encoding='utf-8') as f:
    # Just run find_api.py logic again
    with open('src/JavaScript.js', 'r', encoding='utf-8') as f_js:
        front_js = f_js.read()
    front_calls = set()
    for m in re.finditer(r'\.withFailureHandler.*?\)\s*\.([a-zA-Z0-9_]+)\(', front_js, re.DOTALL):
        front_calls.add(m.group(1))

missing = front_calls - backend_funcs
# ignore 'then'
missing.discard('then')

print("Missing functions from Code.js:")
for m in sorted(list(missing)):
    print(m)
