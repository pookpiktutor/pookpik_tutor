import json
import re

with open('scratch/presets_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Clean all (ข้อที่ ...) from all texts across all subjects, sections, and levels
cleaned_count = 0
for subj in data:
    for sec in data[subj]:
        for lvl in data[subj][sec]:
            new_items = []
            for item in data[subj][sec][lvl]:
                # Remove (ข้อที่ X) or (ข้อที่ ...)
                cleaned_item = re.sub(r'\s*\(\s*ข้อที่\s*\d+\s*\)', '', item).strip()
                cleaned_item = re.sub(r'\s*\(\s*ข้อที่\s*[^)]+\)', '', cleaned_item).strip()
                if cleaned_item != item:
                    cleaned_count += 1
                new_items.append(cleaned_item)
            data[subj][sec][lvl] = new_items

print(f'Cleaned (ข้อที่ ...) from {cleaned_count} items!')

with open('scratch/presets_data.json', 'w', encoding='utf-8') as out:
    json.dump(data, out, ensure_ascii=False)

print('Updated scratch/presets_data.json successfully!')
