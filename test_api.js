const GAS_API_URL = 'https://script.google.com/macros/s/AKfycby6AJihwQhNODIuy9aMm4I-W9ow1kygpF10GA945oB2J9BhGai_fehpUV2dKJdoNKhyZg/exec';

fetch(GAS_API_URL, {
  redirect: 'follow',
  method: 'POST',
  body: JSON.stringify({ functionName: 'getDashboardData', arguments: [] }),
  headers: { 'Content-Type': 'text/plain;charset=utf-8' }
}).then(res => res.text()).then(text => {
  const match = text.match(/<title>(.*?)<\/title>/);
  console.log("TITLE:", match ? match[1] : 'No title');
  const bodyText = text.replace(/<[^>]+>/g, '').substring(0, 1000).replace(/\s+/g, ' ');
  console.log("TEXT:", bodyText);
}).catch(err => {
  console.error("ERROR", err);
});
