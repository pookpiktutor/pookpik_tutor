import re

with open('src/JavaScript.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the overflow hidden hacks
pattern1 = r'''  // Prevent parent from scrolling - only the grid should scroll\s*var contentBody = container\.closest\('\.content-body'\);\s*if \(contentBody\) contentBody\.style\.setProperty\('overflow', 'hidden', 'important'\);\s*document\.body\.style\.setProperty\('overflow', 'hidden', 'important'\);\s*document\.documentElement\.style\.setProperty\('overflow', 'hidden', 'important'\);'''
content = re.sub(pattern1, '', content)

# Change height to 65vh
pattern2 = r'''var html = '<div style="width:100%; height:calc\(100vh - 180px\); overflow:auto;'''
replacement2 = '''var html = '<div style="width:100%; height:65vh; overflow:auto;'''
content = re.sub(pattern2, replacement2, content)

with open('src/JavaScript.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Daily Grid scrollbars fixed.")
