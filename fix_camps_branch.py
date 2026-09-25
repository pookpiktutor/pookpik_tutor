import re
c = open('src/JavaScript.js', 'r', encoding='utf-8').read()
rep = """let lastChannel = c.pay_r3_date ? c.pay_r3_channel : (c.pay_r2_date ? c.pay_r2_channel : c.pay_r1_channel);
                  let matchedStudent = Object.values(studentMap).find(s => s.name === c.std_name) || {};
                  let cBranch = matchedStudent.branchPay || matchedStudent.branchLearn || '';"""
c = re.sub(r'let lastChannel = c\.pay_r3_date \? c\.pay_r3_channel : \(c\.pay_r2_date \? c\.pay_r2_channel : c\.pay_r1_channel\);', rep, c)
c = c.replace("branch: c.std_branch || '',", "branch: cBranch,")
open('src/JavaScript.js', 'w', encoding='utf-8').write(c)
print('Fixed camps branch mapping')
