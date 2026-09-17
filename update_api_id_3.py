import os

new_api_url = "https://script.google.com/macros/s/AKfycbzK7sEShW6AGBqweRt20rpI8V8fyrJC3Dlv3uVwVFlhJvcJ2ciJmRXHXc05tL7Ft_5z/exec"
old_api_id = "AKfycbyZHKlu_c263M9DdjpWlHpSDp5I5pjfu0IH3YglrfK6b8FhHse88DJ6QZRSp9-Qps2jnQ"
new_api_id = "AKfycbzK7sEShW6AGBqweRt20rpI8V8fyrJC3Dlv3uVwVFlhJvcJ2ciJmRXHXc05tL7Ft_5z"

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
