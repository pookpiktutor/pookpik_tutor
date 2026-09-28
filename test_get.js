fetch('https://script.google.com/macros/s/AKfycby6AJihwQhNODIuy9aMm4I-W9ow1kygpF10GA945oB2J9BhGai_fehpUV2dKJdoNKhyZg/exec?test=1', { redirect: 'follow' })
.then(r => r.json())
.then(d => console.log(d))
.catch(e => console.error(e));
