const fs = require('fs');
const existing = fs.readFileSync('src/app_entry.js', 'utf8');
const needed = [
  'pingActiveUser','getAllCoursesFromGradeSheets',
  'updateStudentRegistration','addStudentRegistration','deleteStudentRegistration',
  'deleteCourseColumn','updateRevenues','getClassLogs',
  'getTeachersDB','addEmployee','changeEmployeePasswordByAdmin',
  'saveTeacherProfile','addManagerLog','getUsersDB',
  'getStudentHistoryData','getMultipleStudentsCourses',
  'changeUserPasswordOwn','updateEvaluation',
  'verifyLogin','getUserProfile','getStudentsList',
  'getDashboardData','getRoundSummary','saveGradeSheetData',
  'getGradeSheetData','getTeacherProfiles','getEmployeeList',
  'updateEmployee','deleteEmployee','getTeacherSchedule',
  'getClassLogsForRoom','getRevenueLogs','saveClassLogsGroup',
  'updateRevenues','getPrivateStudentsData','addPrivateStudent',
  'savePrivateStudentPayment','getDebtorsData','saveDebtorPayment',
  'getReceiptsData','generateReceipt','calculateTeacherPay',
  'getManagerLogs','saveManagerLog','deleteManagerLog',
  'getActivityLogs','getEvaluationForm','saveEvaluationForm',
  'getAdminEvaluationsDashboard','updateEvaluation',
  'getStudentDetail','deleteStudent','getStudentHistory',
  'saveGeneralSettings','getGeneralSettings','getRoomsData',
  'addRoom','deleteRoom','updateRoomSettings'
];
needed.forEach(n => {
  const has = existing.includes(`case '${n}'`);
  console.log((has ? 'YES' : 'MISSING') + ': ' + n);
});
