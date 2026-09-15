import os

def fix_file(filepath):
    if not os.path.exists(filepath):
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Fix encodeURIComponent in copyMagicLink
    # The old line: const encoded = btoa(unescape(encodeURIComponent(studentName)));
    # The fix for the URL: const link = baseUrl + '/parent_eval.html?ref=' + encodeURIComponent(encoded);
    # Since I wrote `const link = baseUrl + '/parent_eval.html?ref=' + encoded;`, I will replace that.
    content = content.replace("const link = baseUrl + '/parent_eval.html?ref=' + encoded;", "const link = baseUrl + '/parent_eval.html?ref=' + encodeURIComponent(encoded);")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Fixed {filepath}")

for f in ['index.html', 'public/index.html', 'src/JavaScript.js']:
    fix_file(f)

# 2. Fix parent_eval.html API URL
parent_eval_path = 'parent_eval.html'
if os.path.exists(parent_eval_path):
    with open(parent_eval_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    old_url = "https://script.google.com/macros/s/AKfycb0vLgG6sD2EshS088Xk9o0H7b6V6k9x4Y_Z_s4g_a8/exec"
    new_url = "https://script.google.com/macros/s/AKfycbz3O7i5vtnmOUZZv2iITeE6kftxH5JeYeB0VlDtzV5Of3rRGGq4HKJ2ZV41JTU7UOcNCQ/exec"
    
    content = content.replace(old_url, new_url)

    with open(parent_eval_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Fixed {parent_eval_path}")

