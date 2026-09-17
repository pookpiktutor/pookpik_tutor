#!/usr/bin/env python3
import os
import re

directory = 'g:/My Drive/0.งานสถาบัน/data_PookPik_Tutor'

replacement = """        const deduplicatedMap = {};
        res.forEach(function(c) {
          let cleanName = (c.courseName || '').toString().trim();
          if (cleanName.includes('เดี่ยว') || cleanName.includes('ย่อย')) {
            // Strip trailing indicators like " 1", " 2", "ex1", " รอบ 1", "ครั้งที่ 1", etc.
            cleanName = cleanName.replace(/\\s*(ex|EX|รอบ|ครั้งที่|ครั้ง|#|-)?\\s*\\d+(\\.\\d+)?\\s*$/gi, '').trim();
          }
          c.courseName = cleanName;
          c.displayCourseName = cleanName;
          const dedupeKey = cleanName.toLowerCase().replace(/\\s+/g, '');
          
          if (!deduplicatedMap[dedupeKey]) {
            deduplicatedMap[dedupeKey] = c;
            if (!deduplicatedMap[dedupeKey].students) {
                deduplicatedMap[dedupeKey].students = {};
            }
          } else {
            // Merge students from duplicate courses so we don't lose anyone
            if (c.students) {
              if (!deduplicatedMap[dedupeKey].students) deduplicatedMap[dedupeKey].students = {};
              Object.assign(deduplicatedMap[dedupeKey].students, c.students);
            }
          }
        });
        const deduplicated = Object.values(deduplicatedMap);"""

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    pattern1 = re.compile(
        r'const\s+seenSingleSubgroup\s*=\s*new\s+Set\(\);\s*'
        r'const\s+deduplicated\s*=\s*\[\];\s*'
        r'res\.forEach\(function\(c\)\s*\{\s*'
        r'let\s+cleanName.*?\}\);\s*'
        r'\}\);', re.DOTALL
    )
    
    pattern2 = re.compile(
        r'const\s+seenSingleSubgroup\s*=\s*new\s+Set\(\);\s*'
        r'const\s+deduplicated\s*=\s*\[\];\s*'
        r'res\.forEach\(function\(c\)\s*\{\s*'
        r'let\s+cleanName.*?\}\s*\);\s*'
        r'\}\s*\);', re.DOTALL
    )
    
    new_content = pattern1.sub(lambda m: replacement, content)
    new_content = pattern2.sub(lambda m: replacement, new_content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk(directory):
    if '.git' in root or 'node_modules' in root:
        continue
    for file in files:
        if file.endswith('index.html'):
            process_file(os.path.join(root, file))

print("Done.")
