import re
c = open('src/JavaScript.js', 'r', encoding='utf-8').read()
rep = """
                  let pChannel = (row[5] || '').toString().trim();
                  if (pChannel.toLowerCase() === 'cash') pChannel = 'เงินสด';
                  else if (pChannel.toLowerCase() === 'transfer') pChannel = 'โอนเงิน';
                  else if (pChannel.toLowerCase() === 'card') pChannel = 'บัตรเครดิต';
                  else if (pChannel.toLowerCase() === 'unpaid') pChannel = 'ยังไม่ชำระ';
"""
c = re.sub(r'let std = studentMap\[stdId\] \|\| \{\};', 'let std = studentMap[stdId] || {};' + rep, c)
c = c.replace("paymentChannel: row[5] || '',", "paymentChannel: pChannel,")
open('src/JavaScript.js', 'w', encoding='utf-8').write(c)
print('Mapped paymentChannel in loadRevenueData')
