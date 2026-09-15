import sys, json

with open('scratch/presets_data.json', 'r', encoding='utf-8') as f:
    presets = json.load(f)

json_str = json.dumps(presets, ensure_ascii=False)

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Replace EVAL_PRESETS — find the line that starts with 'const EVAL_PRESETS ='
start_mark = 'const EVAL_PRESETS = '
start_idx = html.find(start_mark)
if start_idx != -1:
    # Find end of line (the JSON is on one line ending with ;)
    end_of_line = html.find('\n', start_idx)
    if end_of_line != -1:
        old_line = html[start_idx:end_of_line]
        new_line = 'const EVAL_PRESETS = ' + json_str + ';'
        html = html[:start_idx] + new_line + html[end_of_line:]
        print('1. EVAL_PRESETS replaced!')
    else:
        print('1. ERROR: Could not find end of EVAL_PRESETS line')
else:
    print('1. ERROR: EVAL_PRESETS not found')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print('Done! EVAL_PRESETS injection complete.')
