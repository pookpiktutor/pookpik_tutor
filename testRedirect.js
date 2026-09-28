const url = "https://script.google.com/macros/s/AKfycby6AJihwQhNODIuy9aMm4I-W9ow1kygpF10GA945oB2J9BhGai_fehpUV2dKJdoNKhyZg/exec";
fetch(url, { method: 'GET', redirect: 'follow' })
  .then(res => {
     console.log("Redirected URL:", res.url);
     return fetch(res.url + "?action=api&functionName=getAvailableCourses", {
         method: 'POST',
         body: JSON.stringify({ action: 'api', functionName: 'getAvailableCourses', arguments: [['อนุบาล', 'กลุ่มหลักตามตารางคอร์ส', 'สาขา 2 ข้างโรงเรียนระยองวิทยาคม']] }),
         headers: { 'Content-Type': 'text/plain' }
     });
  })
  .then(res => res.text())
  .then(txt => console.log("Response length:", txt.length, "Starts with:", txt.substring(0, 50)))
  .catch(console.error);
