import sys, json

with open('scratch/presets_data.json', 'r', encoding='utf-8') as f:
    presets = json.load(f)

json_str = json.dumps(presets, ensure_ascii=False)

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Replace EVAL_PRESETS
start_mark = 'const EVAL_PRESETS = {'
start_idx = html.find(start_mark)
end_mark = '};\n\nfunction getSelectedSubjectKey'
end_idx = html.find(end_mark, start_idx)

if start_idx != -1 and end_idx != -1:
    html = html[:start_idx] + 'const EVAL_PRESETS = ' + json_str + html[end_idx+1:]
    print('1. EVAL_PRESETS replaced!')

# 2. Update getSelectedSubjectKey
old_get_key = '''function getSelectedSubjectKey(section, suffix) {
  const filterId = section + '_subject_filter' + (suffix ? '_' + suffix : '');
  const filterEl = document.getElementById(filterId);
  let subj = filterEl ? filterEl.value : 'general';
  if (subj === 'auto' || !subj) subj = 'general';
  return subj;
}'''

new_get_key = '''function getSelectedSubjectKey(section, suffix) {
  const filterId = section + '_subject_filter' + (suffix ? '_' + suffix : '');
  const filterEl = document.getElementById(filterId);
  let subj = filterEl ? filterEl.value : 'auto';
  
  if (subj === 'auto' || !subj) {
    let courseText = '';
    const courseEl = document.getElementById('eval_course');
    if (courseEl && courseEl.value !== '') {
      const idx = parseInt(courseEl.value);
      if (!isNaN(idx) && state._teacherCourses && state._teacherCourses[idx]) {
        courseText = state._teacherCourses[idx].courseName || state._teacherCourses[idx].subject || '';
      } else if (courseEl.options && courseEl.selectedIndex >= 0) {
        courseText = courseEl.options[courseEl.selectedIndex].text || '';
      }
    }
    
    const evalSubjEl = document.getElementById('eval_subject');
    if (evalSubjEl && evalSubjEl.value) {
      courseText += ' ' + evalSubjEl.value;
    }
    
    const lowerCourse = courseText.toLowerCase();
    
    if (lowerCourse.includes('อังกฤษ') || lowerCourse.includes('english') || lowerCourse.includes('eng')) subj = 'english';
    else if (lowerCourse.includes('ไทย') || lowerCourse.includes('thai')) subj = 'thai';
    else if (lowerCourse.includes('จีน') || lowerCourse.includes('chinese')) subj = 'chinese';
    else if (lowerCourse.includes('คณิต') || lowerCourse.includes('math')) subj = 'math';
    else if (lowerCourse.includes('ฟิสิกส์') || lowerCourse.includes('physics')) subj = 'physics';
    else if (lowerCourse.includes('เคมี') || lowerCourse.includes('chemistry')) subj = 'chemistry';
    else if (lowerCourse.includes('ชีวะ') || lowerCourse.includes('biology')) subj = 'biology';
    else if (lowerCourse.includes('สังคม') || lowerCourse.includes('social')) subj = 'social';
    else if (lowerCourse.includes('วิทย์') || lowerCourse.includes('science')) subj = 'science';
    else subj = 'general';
  }
  return subj;
}'''

if old_get_key in html:
    html = html.replace(old_get_key, new_get_key, 1)
    print('2. getSelectedSubjectKey updated!')

# 3. Update populateFeedbackPresetSelects options to not truncate
old_trunc = "const shortText = itemText.length > 45 ? itemText.substring(0, 45) + '...' : itemText;"
new_trunc = "const shortText = itemText;"
if old_trunc in html:
    html = html.replace(old_trunc, new_trunc, 1)
    print('3. Truncation removed!')

# 4. Trigger populateFeedbackPresetSelects in onEvalCourseChange
target_line = 'subjectInput.value = course.courseName;'
replacement_line = 'subjectInput.value = course.courseName;\n  if (typeof populateFeedbackPresetSelects === "function") populateFeedbackPresetSelects();'
if target_line in html:
    html = html.replace(target_line, replacement_line, 1)
    print('4. Trigger added to onEvalCourseChange!')

# 5. Trigger populateFeedbackPresetSelects in handleEvalStudentChange
target_line2 = 'branchInput.value = student.branch || \'\';'
replacement_line2 = 'branchInput.value = student.branch || \'\';\n  if (typeof populateFeedbackPresetSelects === "function") populateFeedbackPresetSelects();'
if target_line2 in html:
    html = html.replace(target_line2, replacement_line2, 1)
    print('5. Trigger added to handleEvalStudentChange!')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print('All changes applied smoothly to index.html!')
