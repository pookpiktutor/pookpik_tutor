import os
import re

filepath = 'g:/My Drive/0.งานสถาบัน/data_PookPik_Tutor/parent_eval.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

broken_part = """              </div>
                    <div class="rating-val">
                      ${getRatingBadge(r.val, r.color)}
                    </div>
                  </div>
                `).join('')}
              </div>"""

if broken_part in content:
    content = content.replace(broken_part, "              </div>")
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Fixed syntax error!")
else:
    print("Broken part not found!")
