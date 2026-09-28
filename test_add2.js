const fs = require('fs');
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycby6AJihwQhNODIuy9aMm4I-W9ow1kygpF10GA945oB2J9BhGai_fehpUV2dKJdoNKhyZg/exec';

async function test() {
  const payload = {
    functionName: 'addNewCoursesBatch',
    args: ['อนุบาล', 'สาขา2', [{ courseName: 'Test', price: 1500, dayTime: 'Test', sessions: 5 }], 'tester']
  };

  const res = await fetch(GAS_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(payload)
  });
  const text = await res.text();
  fs.writeFileSync('test_out.txt', text);
}
test();
