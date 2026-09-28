const text = 'หลัก อังกฤษ ป.ต้น(ฝึกฝนเสริมทักษะ) MIDTERM 1/2569 อาทิตย์ 13.00-15.00';
const pattern = /\s+((?:MIDTERM|FINAL|เทอม|ตุลาคม|\d+\/\d+).*?)\s+(?:จันทร์|อังคาร|พุธ|พฤหัสบดี|พฤหัสฯ|พฤหัส|ศุกร์|เสาร์|อาทิตย์|จ\.|อ\.|พ\.|พฤ\.|ศ\.|ส\.|อา\.)/i;
const match = text.match(pattern);
console.log(match ? match[1] : 'NONE');
