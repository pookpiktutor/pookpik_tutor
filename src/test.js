
function testGetTeacherCourses() {
  var res = getTeacherCoursesAndStudents('tutor_0107');
  Logger.log(JSON.stringify(res));
  var cache = getCacheObject('teacher_courses_v4_tutor_0107');
  Logger.log('Cache: ' + JSON.stringify(cache));
}

