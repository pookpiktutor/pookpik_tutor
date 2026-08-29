import os
import re

def fix_mojibake(text):
    # Known mojibake pattern: CP1252 encoded strings that were originally CP874?
    # Actually, in JS it's usually just some characters
    # Let's try to just find all Thai-like mojibake and replace it.
    pass

filepath = 'dist/Code.js'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Let's try to encode to cp1252 and decode from cp874?
try:
    # This might fail if there are characters not in cp1252
    test_encode = content.encode('windows-1252').decode('windows-874')
    print("Success windows-1252 -> windows-874!")
except Exception as e:
    print(f"Failed windows-1252: {e}")

try:
    # Try Latin-1 -> windows-874
    test_encode2 = content.encode('latin1').decode('windows-874')
    print("Success latin1 -> windows-874!")
except Exception as e:
    print(f"Failed latin1: {e}")

try:
    # Try cp1252 -> utf-8
    test_encode3 = content.encode('windows-1252').decode('utf-8')
    print("Success windows-1252 -> utf-8!")
except Exception as e:
    print(f"Failed windows-1252 to utf8: {e}")
    
try:
    # Try cp874 -> utf-8
    test_encode4 = content.encode('windows-874').decode('utf-8')
    print("Success windows-874 -> utf-8!")
except Exception as e:
    print(f"Failed windows-874 to utf8: {e}")

