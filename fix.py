def fix_file(filename):
    with open(filename, 'r', encoding='utf8') as f:
        c = f.read()
    
    # We want to replace escaped backticks and dollar signs with normal ones
    # In python string `\\`` matches `\``
    c = c.replace('\\`', '`').replace('\\$', '$')
    
    with open(filename, 'w', encoding='utf8') as f:
        f.write(c)

fix_file('new_renderDailyGrid.js')
fix_file('new_renderTeacherGrid.js')
