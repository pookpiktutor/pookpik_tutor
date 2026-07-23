import sys

file_path = "Code.js"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

replacements = [
    # 1. getClassLogs() Date extraction
    ("const dateRaw = cleanSheetDate(row[13]);", 
     "const dateRaw = cleanSheetDate(row[12]);"),
    
    # 2. getClassLogs() and getClassLogsForTeacher() object population
    ("isOrange: parseInt(row[11]) || 0,\n        hours: row[12] ? row[12].toString().trim() : '',",
     "isOrange: 0,\n        hours: row[11] ? row[11].toString().trim() : '',"),
    
    ("date: cleanSheetDate(row[13]),\n        roomBranch: row[14] ? row[14].toString().trim() : '',",
     "date: cleanSheetDate(row[12]),\n        roomBranch: row[13] ? row[13].toString().trim() : '',"),

    ("roomBranch: row[14] ? row[14].toString().trim() : '',\n        teacherConfirmed: row[15] ? (parseInt(row[15]) || 0) : 0,",
     "roomBranch: row[13] ? row[13].toString().trim() : '',\n        teacherConfirmed: row[14] ? (parseInt(row[14]) || 0) : 0,"),
    
    ("isOrange: parseInt(row[11]) || 0,\n        hours: parseHoursValue(row[12]),",
     "isOrange: 0,\n        hours: parseHoursValue(row[11]),"),
     
    ("hours: parseHoursValue(row[12]),\n        date: dateRaw,\n        roomBranch: row[14] ? row[14].toString().trim() : '',\n        teacherConfirmed: row[15] ? (parseInt(row[15]) || 0) : 0,",
     "hours: parseHoursValue(row[11]),\n        date: dateRaw,\n        roomBranch: row[13] ? row[13].toString().trim() : '',\n        teacherConfirmed: row[14] ? (parseInt(row[14]) || 0) : 0,"),

    ("hours: parseHoursValue(row[12]),\n        date: cleanSheetDate(row[13]),\n        roomBranch: row[14] ? row[14].toString().trim() : '',\n        teacherConfirmed: row[15] ? (parseInt(row[15]) || 0) : 0,",
     "hours: parseHoursValue(row[11]),\n        date: cleanSheetDate(row[12]),\n        roomBranch: row[13] ? row[13].toString().trim() : '',\n        teacherConfirmed: row[14] ? (parseInt(row[14]) || 0) : 0,"),

    # 3. getLogsBySubjectObject
    ("isOrange: parseInt(data[i][11]) || 0,\n          hours: data[i][12] ? data[i][12].toString().trim() : '',",
     "isOrange: 0,\n          hours: data[i][11] ? data[i][11].toString().trim() : '',"),
    
    ("date: dateRaw,\n          roomBranch: data[i][14] ? data[i][14].toString().trim() : '',",
     "date: dateRaw,\n          roomBranch: data[i][13] ? data[i][13].toString().trim() : '',"),

    # 4. Write operations (recordClassData, editClassData)
    ("log.isOrange ? parseInt(log.isOrange) || 0 : 0,\n      log.hours || '',",
     "log.hours || '',"),
    
    ("log.isOrange ? parseInt(log.isOrange, 10) || 0 : 0,\n      log.hours || '',",
     "log.hours || '',"),

    ("isOrange: parseInt(rowVals[11]) || 0,\n      hours: rowVals[12] ? rowVals[12].toString().trim() : '',\n      date: cleanSheetDate(rowVals[13]),",
     "isOrange: 0,\n      hours: rowVals[11] ? rowVals[11].toString().trim() : '',\n      date: cleanSheetDate(rowVals[12]),"),
     
    ("isOrange: parseInt(rowVals[11]) || 0,\n          hours: rowVals[12] ? rowVals[12].toString().trim() : '',\n          date: rowVals[13] ? rowVals[13].toString().trim() : '',",
     "isOrange: 0,\n          hours: rowVals[11] ? rowVals[11].toString().trim() : '',\n          date: rowVals[12] ? rowVals[12].toString().trim() : '',"),

    # Edit log
    ("log.isOrange ? parseInt(log.isOrange, 10) || 0 : 0,\n          log.hours || '', log.date || '', log.roomBranch || ''",
     "log.hours || '', log.date || '', log.roomBranch || ''"),
     
    ("log.isOrange ? parseInt(log.isOrange, 10) || 0 : 0,\n        log.hours || '', log.date || Utilities.formatDate(new Date(), 'Asia/Bangkok', 'd/M/yyyy'),\n        log.roomBranch || ''",
     "log.hours || '', log.date || Utilities.formatDate(new Date(), 'Asia/Bangkok', 'd/M/yyyy'),\n        log.roomBranch || ''"),

    # Summary functions reading Data Learn
    ("isOrange: parseInt(row[11], 10) || 0,\n            hours: row[12] ? row[12].toString().trim() : '',\n            date: cleanSheetDate(row[13]),\n            room: row[14] ? row[14].toString().trim() : '',",
     "isOrange: 0,\n            hours: row[11] ? row[11].toString().trim() : '',\n            date: cleanSheetDate(row[12]),\n            room: row[13] ? row[13].toString().trim() : '',"),

    # Calculate hours (Data Learn array)
    ("const hoursStr = dlRow[12] ? dlRow[12].toString().trim() : '';",
     "const hoursStr = dlRow[11] ? dlRow[11].toString().trim() : '';"),
     
    ("const dlDate = cleanSheetDate(dlRow[13]);",
     "const dlDate = cleanSheetDate(dlRow[12]);"),

]

for old_str, new_str in replacements:
    if old_str in content:
        content = content.replace(old_str, new_str)
    else:
        print(f"Warning: String not found in Code.js:\n{old_str}\n")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Update complete.")
