const url = "https://script.google.com/macros/s/AKfycbyYjh5-6frv-AytBYl1EnWB46Vh5_VCkVVRg6XsU4A-KUJoR8nFh46XZ-ffvbtwiZHhhA/exec?action=getTeacherCoursesAndStudents&logUser=tutor_0001";

fetch(url, { redirect: 'follow' })
  .then(res => res.text())
  .then(text => {
    try {
      console.log(JSON.stringify(JSON.parse(text), null, 2));
    } catch(e) {
      console.log("Failed to parse:", text);
    }
  })
  .catch(err => console.error(err));
