import os

new_api_url = "https://script.google.com/macros/s/AKfycbyZHKlu_c263M9DdjpWlHpSDp5I5pjfu0IH3YglrfK6b8FhHse88DJ6QZRSp9-Qps2jnQ/exec"
old_api_id = "AKfycbxrKH1GK2xCGhw_CVzxU8cuh9Zqtn7kJrCis2mJ1N7-L3OUHXMGEhtz6dDapqEYh_drjQ"
new_api_id = "AKfycbyZHKlu_c263M9DdjpWlHpSDp5I5pjfu0IH3YglrfK6b8FhHse88DJ6QZRSp9-Qps2jnQ"

files_to_update = [
    'g:/My Drive/0.งานสถาบัน/data_PookPik_Tutor/index.html',
    'g:/My Drive/0.งานสถาบัน/data_PookPik_Tutor/parent_eval.html'
]

for filepath in files_to_update:
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        updated_content = content.replace(old_api_id, new_api_id)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(updated_content)
        print(f"Updated {filepath}")
