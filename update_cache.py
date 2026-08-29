import os
import time

filepath = 'index.html'
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if 'src/JavaScript.js?v=' in line:
        # Update cache buster to current timestamp
        ts = int(time.time())
        line = line.replace('1786352930', str(ts))
    
    if '<script src="src/JavaScript.js" charset="utf-8"></script>' in line:
        continue # Remove the duplicate
        
    new_lines.append(line)

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Updated index.html cache buster and removed duplicate script tag.")
