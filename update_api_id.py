import os

old_id = 'AKfycbz3O7i5vtnmOUZZv2iITeE6kftxH5JeYeB0VlDtzV5Of3rRGGq4HKJ2ZV41JTU7UOcNCQ'
new_id = 'AKfycbxrKH1GK2xCGhw_CVzxU8cuh9Zqtn7kJrCis2mJ1N7-L3OUHXMGEhtz6dDapqEYh_drjQ'

for filename in ['index.html', 'parent_eval.html']:
    filepath = os.path.join('g:/My Drive/0.งานสถาบัน/data_PookPik_Tutor', filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = content.replace(old_id, new_id)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {filename}")
