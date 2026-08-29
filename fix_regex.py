# Fix over-escaped regex in matchRoomAndBranch in src/JavaScript.js
with open('src/JavaScript.js', 'r', encoding='utf-8') as f:
    content = f.read()

# The file has 4 real backslashes before s and d: \\\\s and \\\\d
# This causes the RegExp to see literal \\s instead of whitespace
# We need 2 real backslashes: \\s which gives \s (whitespace) in RegExp

# Find and print the bad line first
lines = content.split('\n')
bad_line_idx = None
for i, line in enumerate(lines):
    if 'roomRegex' in line:
        print(f"Found at line {i+1}: {repr(line)}")
        bad_line_idx = i
        break

if bad_line_idx is not None:
    # Replace 4-backslash-s with 2-backslash-s, and 4-backslash-d with 2-backslash-d
    old_line = lines[bad_line_idx]
    # In the file: \\\\s means 4 chars: \ \ s -> we want \\s (2 chars: \ s)
    new_line = old_line.replace('\\\\\\\\s', '\\\\s').replace('\\\\\\\\d', '\\\\d')
    print(f"New line: {repr(new_line)}")
    
    if old_line != new_line:
        lines[bad_line_idx] = new_line
        with open('src/JavaScript.js', 'w', encoding='utf-8') as f:
            f.write('\n'.join(lines))
        print("Fixed!")
    else:
        print("No change made - patterns might already be correct")
else:
    print("roomRegex line not found!")
