import sys

sys.stdout.reconfigure(encoding='utf-8')

for target_js in ['src/JavaScript.js', 'JavaScript.js']:
    with open(target_js, 'r', encoding='utf-8') as f:
        content = f.read()

    # Update row inputs for installments to include time
    old_grid = '<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">'
    new_grid = '<div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 8px;">'
    
    old_date_col = '<div><label style="font-size:0.75rem;">วันที่</label><input type="date" id="camp_pay_r\' + r + \'_date" class="form-control form-control-sm" value="\' + dateVal + \'"></div>'
    new_datetime_cols = '''<div><label style="font-size:0.75rem;">วันที่</label><input type="date" id="camp_pay_r' + r + '_date" class="form-control form-control-sm" value="' + dateVal + '"></div>
    <div><label style="font-size:0.75rem;">เวลา</label><input type="time" id="camp_pay_r' + r + '_time" class="form-control form-control-sm" value="' + timeVal + '"></div>'''

    if 'camp_pay_r1_time' not in content:
        content = content.replace(old_grid, new_grid)
        content = content.replace(old_date_col, new_datetime_cols)

    with open(target_js, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Updated time fields in {target_js}')
