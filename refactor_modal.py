import sys
import re

with open('JavaScript.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add editingRowIndex
content = content.replace("let modalState = {", "let editingRowIndex = -1;\nlet modalState = {")

# 2. Replace loadModalClasses
content = re.sub(r'function loadModalClasses\(callback\) \{[\s\S]*?\n\}', 
                 'function loadModalClasses(callback) { if(callback) callback(); }', 
                 content, count=1)

# 3. Replace showAddClassLogModal
new_add = """function showAddClassLogModal() {
  const role = state.currentUser ? (state.currentUser.role || '').toString().trim() : '';
  const isTeacher = (role === 'Teacher' || role === 'ครู');
  if (isTeacher) {
    showToast('คุณไม่มีสิทธิ์ในการเพิ่มคลาสเรียน', 'error');
    return;
  }
  refreshClassSubjectDatalist();
  
  // Preset date
  const activePanel = document.querySelector('.nav-item.active').getAttribute('data-panel');
  if (activePanel === 'daily_grid') {
    document.getElementById('class_date').value = document.getElementById('daily_grid_filter_date').value;
  } else {
    const logStartEl = document.getElementById('log_start_date');
    document.getElementById('class_date').value = logStartEl ? logStartEl.value : getTodayString();
  }
  
  editingRowIndex = -1;
  document.getElementById('class_row_index').value = '';
  document.getElementById('class_subject').value = '';
  document.getElementById('class_teacher_sub').value = '';
  document.getElementById('class_time_start').value = '';
  document.getElementById('class_time_end').value = '';
  document.getElementById('class_hours').value = '';
  document.getElementById('class_note').value = '';
  document.getElementById('class_kids_live').value = 0;
  document.getElementById('class_kids_online').value = 0;
  document.getElementById('class_kids_leave').value = 0;
  document.getElementById('class_kids_absent').value = 0;
  document.getElementById('class_kids_makeup').value = 0;
  document.getElementById('class_kids_orange').value = 0;
  document.getElementById('class_kids_sum').value = 0;
  
  document.getElementById('class_is_recurring').checked = false;
  document.getElementById('class_recurring_wrapper').style.display = 'block';
  document.getElementById('class_recurring_end_container').style.display = 'none';

  document.getElementById('class_modal_title').innerText = 'บันทึกชั่วโมงสอนคลาสใหม่';
  document.getElementById('class_submit_btn').innerText = '💾 บันทึก';
  document.getElementById('class_submit_btn').style.background = '#10b981';
  document.getElementById('class_modal').classList.add('active');
}"""
content = re.sub(r'function showAddClassLogModal\(\) \{[\s\S]*?\n\}\n\nfunction showEditClassLogModal', 
                 new_add + '\n\nfunction showEditClassLogModal', 
                 content, count=1)

# 4. Replace showEditClassLogModal
new_edit = """function showEditClassLogModal(rowIndex) {
  const role = state.currentUser ? (state.currentUser.role || '').toString().trim() : '';
  const isTeacher = (role === 'Teacher' || role === 'ครู');
  if (isTeacher) {
    showToast('คุณไม่มีสิทธิ์ในการแก้ไขคลาสเรียน', 'error');
    return;
  }
  
  const log = state.classLogs.find(l => l.rowIndex === rowIndex);
  if (!log) return;
  
  editingRowIndex = rowIndex;
  
  document.getElementById('class_row_index').value = log.rowIndex || '';
  document.getElementById('class_subject').value = log.subject;
  document.getElementById('class_teacher_reg').value = log.teacherRegular;
  document.getElementById('class_teacher_sub').value = log.teacherSub || '';
  document.getElementById('class_time_start').value = cleanTimeStr(log.timeStart);
  document.getElementById('class_time_end').value = cleanTimeStr(log.timeEnd);
  document.getElementById('class_hours').value = cleanTimeStr(log.hours);
  document.getElementById('class_date').value = convertDateFromSheet(log.date);
  document.getElementById('class_room').value = log.roomBranch;
  document.getElementById('class_note').value = log.note;
  
  document.getElementById('class_kids_live').value = log.isPresentLive || 0;
  document.getElementById('class_kids_online').value = log.isPresentOnline || 0;
  document.getElementById('class_kids_leave').value = log.isLeave || 0;
  document.getElementById('class_kids_absent').value = log.isAbsent || 0;
  document.getElementById('class_kids_makeup').value = log.isMakeup || 0;
  document.getElementById('class_kids_orange').value = log.isOrange || 0;
  
  updateClassKidsSum();
  
  document.getElementById('class_is_recurring').checked = false;
  document.getElementById('class_recurring_wrapper').style.display = 'none';
  document.getElementById('class_recurring_end_container').style.display = 'none';

  document.getElementById('class_modal_title').innerText = 'แก้ไขชั่วโมงสอนคลาสเรียน';
  document.getElementById('class_submit_btn').innerText = '💾 บันทึกการแก้ไข';
  document.getElementById('class_submit_btn').style.background = '#3b82f6';
  document.getElementById('class_modal').classList.add('active');
}"""
content = re.sub(r'function showEditClassLogModal\(rowIndex\) \{[\s\S]*?\n\}\n\nfunction closeClassLogModal', 
                 new_edit + '\n\nfunction closeClassLogModal', 
                 content, count=1)

# 5. Replace saveClassLog
new_save = """function saveClassLog(e) {
  e.preventDefault();
  const role = state.currentUser ? (state.currentUser.role || '').toString().trim() : '';
  const isTeacher = (role === 'Teacher' || role === 'ครู');
  if (isTeacher) {
    showToast('คุณไม่มีสิทธิ์ในการบันทึกหรือแก้ไขคลาสเรียน', 'error');
    return;
  }
  
  const logData = {
    subject: document.getElementById('class_subject').value.trim(),
    teacherRegular: document.getElementById('class_teacher_reg').value,
    teacherSub: document.getElementById('class_teacher_sub').value,
    timeStart: document.getElementById('class_time_start').value,
    timeEnd: document.getElementById('class_time_end').value,
    hours: document.getElementById('class_hours').value.trim(),
    date: convertDateToSheet(document.getElementById('class_date').value),
    roomBranch: document.getElementById('class_room').value.trim(),
    note: document.getElementById('class_note').value.trim(),
    
    isPresentLive: parseInt(document.getElementById('class_kids_live').value) || 0,
    isPresentOnline: parseInt(document.getElementById('class_kids_online').value) || 0,
    isLeave: parseInt(document.getElementById('class_kids_leave').value) || 0,
    isAbsent: parseInt(document.getElementById('class_kids_absent').value) || 0,
    isMakeup: parseInt(document.getElementById('class_kids_makeup').value) || 0,
    isOrange: parseInt(document.getElementById('class_kids_orange').value) || 0
  };

  const isRecurring = document.getElementById('class_is_recurring').checked;
  if (isRecurring && editingRowIndex === -1) {
    saveRecurringClassDirectly(logData);
    return;
  }

  setLoading(true, 'กำลังบันทึกข้อมูล...');
  const user = getLogUser();

  if (editingRowIndex !== -1) {
    logData.rowIndex = editingRowIndex;
    const updatedLogs = [{ rowIndex: editingRowIndex, log: logData }];
    
    google.script.run
      .withSuccessHandler(res => {
        setLoading(false);
        if (res && res.success) {
          showToast('บันทึกการแก้ไขสำเร็จ!', 'success');
          closeClassLogModal();
          const activePanel = document.querySelector('.nav-item.active').getAttribute('data-panel');
          if (activePanel === 'daily_grid') loadDailyGrid();
          else if (activePanel === 'teacher_schedule') loadTeacherSchedule(true);
          else loadRevenueLogs();
          checkLowBalanceStudents();
        } else {
          showToast('บันทึกล้มเหลว: ' + res.error, 'error');
        }
      })
      .withFailureHandler(err => {
        setLoading(false);
        showToast('เชื่อมต่อล้มเหลว: ' + err.message, 'error');
      })
      .saveBatchClassLogs([], updatedLogs, [], user);
  } else {
    const newLogs = [logData];
    
    google.script.run
      .withSuccessHandler(res => {
        setLoading(false);
        if (res && res.success) {
          showToast('เพิ่มคลาสเรียนสำเร็จ!', 'success');
          closeClassLogModal();
          const activePanel = document.querySelector('.nav-item.active').getAttribute('data-panel');
          if (activePanel === 'daily_grid') loadDailyGrid();
          else if (activePanel === 'teacher_schedule') loadTeacherSchedule(true);
          else loadRevenueLogs();
          checkLowBalanceStudents();
        } else {
          showToast('บันทึกล้มเหลว: ' + res.error, 'error');
        }
      })
      .withFailureHandler(err => {
        setLoading(false);
        showToast('เชื่อมต่อล้มเหลว: ' + err.message, 'error');
      })
      .saveBatchClassLogs(newLogs, [], [], user);
  }
}"""
content = re.sub(r'function saveClassLog\(e\) \{[\s\S]*?\n\}\n\nfunction saveRecurringClassDirectly', 
                 new_save + '\n\nfunction saveRecurringClassDirectly', 
                 content, count=1)

with open('JavaScript.html', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done!')
