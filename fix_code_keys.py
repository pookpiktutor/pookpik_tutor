import re
c = open('Code.js', 'r', encoding='utf-8').read()
rep = """    const pStudentId = paymentData.studentId || paymentData.StudentID || '';
    const pAmount = paymentData.amount || paymentData.Amount || 0;
    const pDate = paymentData.date || paymentData.Date || timestamp;
    const pChannel = paymentData.channel || paymentData.Channel || '';
    const pReceiver = paymentData.receiver || paymentData.Receiver || '';
    const pRoundLabel = paymentData.roundLabel || paymentData.Round || '';
    
    let finalTimestamp = new Date();
    const pTime = paymentData.time || paymentData.Time || '';
    if (pTime && (paymentData.date || paymentData.Date)) {
      const dStr = (paymentData.date || paymentData.Date) + 'T' + pTime;
      const parsedD = new Date(dStr);
      if (!isNaN(parsedD)) finalTimestamp = parsedD;
    }
    
    const pNote = paymentData.note || paymentData.Note || '';

    sheet.appendRow([
      paymentId,
      pStudentId,
      finalTimestamp,
      parseFloat(pAmount) || 0,
      pDate,
      pChannel,
      pReceiver,
      pRoundLabel,
      pNote
    ]);"""
c = re.sub(r'const timestamp = new Date\(\);\s*sheet\.appendRow\(\[\s*paymentId,[\s\S]*?\]\);', rep, c)
open('Code.js', 'w', encoding='utf-8').write(c)
print('Fixed Code.js keys')
