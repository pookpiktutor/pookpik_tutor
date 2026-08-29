import re

def patch_js_and_styles():
    # 1. Patch src/JavaScript.js
    with open('src/JavaScript.js', 'r', encoding='utf-8') as f:
        js_content = f.read()

    # Change the filtering logic in renderDailyAttendanceSummary
    search_str = """  const branchFilter = (state.activeBranchFilter || 'สาขา1').replace(/\\s+/g, '');\n\n  const filteredLogs = (state.classLogs || []).filter(log => {\n\n    const logBranchClean = (log.roomBranch || '').replace(/\\s+/g, '');\n\n    return logBranchClean.includes(branchFilter);\n\n  });"""
    
    replace_str = """  const branchFilter = (state.activeBranchFilter || 'สาขา1').replace(/\\s+/g, '');\n  const filteredRooms = (state.rooms || []).filter(room => {\n    const roomBranchClean = (room.branch || '').replace(/\\s+/g, '');\n    return roomBranchClean.includes(branchFilter);\n  });\n\n  const filteredLogs = (state.classLogs || []).filter(log => {\n    return filteredRooms.some(room => matchRoomAndBranch(log.roomBranch, room.roomName, room.branch));\n  });"""
    
    if search_str in js_content:
        js_content = js_content.replace(search_str, replace_str)
        print("Patched JavaScript.js filtering logic")
    else:
        # Fallback regex if spacing differs
        pattern = r"const branchFilter.*?const filteredLogs.*?logBranchClean\.includes\(branchFilter\);\n\n  \}\);"
        match = re.search(pattern, js_content, re.DOTALL)
        if match:
            js_content = js_content.replace(match.group(0), replace_str)
            print("Patched JavaScript.js filtering logic (regex)")
        else:
            print("Could not find filtering logic in JavaScript.js")

    with open('src/JavaScript.js', 'w', encoding='utf-8') as f:
        f.write(js_content)


    # 2. Patch Styles.html
    with open('Styles.html', 'r', encoding='utf-8') as f:
        css_content = f.read()

    search_css = """  background: rgba(255, 255, 255, 0.45);\n  backdrop-filter: blur(16px);\n  -webkit-backdrop-filter: blur(16px);\n  border-radius: 12px;\n  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);"""
    replace_css = """  background: transparent;\n  /* Removed blur and shadow to make it completely transparent */\n  border-radius: 12px;"""
    
    if search_css in css_content:
        css_content = css_content.replace(search_css, replace_css)
        print("Patched Styles.html widget styling")
    else:
        print("Could not find task-queue-widget styling in Styles.html")

    with open('Styles.html', 'w', encoding='utf-8') as f:
        f.write(css_content)

patch_js_and_styles()
