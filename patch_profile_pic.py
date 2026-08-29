import os

file_path = r"g:\My Drive\0.งานสถาบัน\data_PookPik_Tutor\JavaScript.html"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("if (state.currentUser.profilePic) {", "if (state.currentUser.profilePic && state.currentUser.profilePic !== '-') {")
content = content.replace("if (profilePic) {", "if (profilePic && profilePic !== '-') {")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Patched JavaScript.html successfully.")
