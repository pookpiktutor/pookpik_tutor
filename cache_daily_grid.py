import re

with open('src/JavaScript.js', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'''  if \(!isSilent\) \{\s*setLoading\(true, 'กำลังดึงตารางสอนรายห้องเรียนประจำวันที่ ' \+ formatDateToThai\(sheetDate\) \+ '\.\.\.'\);\s*\}\s*google\.script\.run\s*\.withSuccessHandler\(data => \{'''

replacement = """  if (!isSilent) {
    setLoading(true, 'กำลังดึงตารางสอนรายห้องเรียนประจำวันที่ ' + formatDateToThai(sheetDate) + '...');
  }
  
  if (state.dailyGridCache[sheetDate] && !isSilent && window._forceDailyGridRefresh !== true) {
    // Use cached data
    const data = state.dailyGridCache[sheetDate];
    setTimeout(() => {
      setLoading(false);
      state.rooms = data.rooms;
      state.classLogs = data.classes;
      state.enrollments = data.enrollments || {};
      renderDailyGrid();
      populateRoomsDatalist();
    }, 10);
    return;
  }
  window._forceDailyGridRefresh = false;

  google.script.run
    .withSuccessHandler(data => {
      if (data && !data.error) {
        state.dailyGridCache[sheetDate] = data; // Save to cache
      }"""

content = re.sub(pattern, replacement, content)

with open('src/JavaScript.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("loadDailyGrid cache implemented.")
