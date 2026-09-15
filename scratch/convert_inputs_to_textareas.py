import re

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

def replace_input_with_textarea(match):
    full_match = match.group(0)
    id_m = re.search(r'id="([^"]+)"', full_match)
    class_m = re.search(r'class="([^"]+)"', full_match)
    oninput_m = re.search(r'oninput="([^"]+)"', full_match)
    ph_m = re.search(r'placeholder="([^"]+)"', full_match)
    
    item_id = id_m.group(1) if id_m else ''
    item_class = class_m.group(1) if class_m else ''
    item_oninput = oninput_m.group(1) if oninput_m else ''
    item_ph = ph_m.group(1) if ph_m else ''
    
    textarea_html = f'<textarea id="{item_id}" class="{item_class}" oninput="{item_oninput}; this.style.height=\'auto\'; this.style.height=this.scrollHeight+\'px\';" placeholder="{item_ph}" style="font-size: 0.85rem; width: 100%; min-height: 48px; resize: vertical; border-radius: 6px; padding: 6px 10px; line-height: 1.4; border: 1px solid var(--border-color); font-family: inherit;"></textarea>'
    return textarea_html

pattern_teacher = r'<input\s+type="text"\s+id="(strength_\d+|improvement_\d+|recommendation_\d+)"[^>]*>'
new_text = re.sub(pattern_teacher, replace_input_with_textarea, text)

pattern_admin = r'<input\s+type="text"\s+id="(admin_eval_strength_\d+|admin_eval_improvement_\d+|admin_eval_recommendation_\d+)"[^>]*>'
new_text = re.sub(pattern_admin, replace_input_with_textarea, new_text)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_text)

print('Successfully replaced inputs with textareas in index.html!')
