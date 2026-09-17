#!/usr/bin/env python3
import os

old_id = 'AKfycbyHw4MCZmepDEGiVhRaSYMCgzzQ4hJqwSO_ixi4wkbQ_9zBngYGCquDa6erf5CTFb48'
new_id = 'AKfycby6AJihwQhNODIuy9aMm4I-W9ow1kygpF10GA945oB2J9BhGai_fehpUV2dKJdoNKhyZg'
directory = 'g:/My Drive/0.งานสถาบัน/data_PookPik_Tutor'

replaced_count = 0
for root, dirs, files in os.walk(directory):
    if '.git' in root or 'node_modules' in root:
        continue
    for file in files:
        if file.endswith('.html') or file.endswith('.js'):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                if old_id in content:
                    new_content = content.replace(old_id, new_id)
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated URL in: {filepath}")
                    replaced_count += 1
            except Exception as e:
                print(f"Error reading {filepath}: {e}")

print(f"Total files updated: {replaced_count}")
