import re
import time

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

new_content = re.sub(r'v=\d+', 'v=' + str(int(time.time())), content)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)
print('Bumped version in index.html')
