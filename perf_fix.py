import re

with open('Code.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Re-enable cache read in calculateTeacherYearlyPay (line ~9531)
# The commented-out line: // if (cached) return cached;
content = content.replace(
    '  // if (cached) return cached;\n',
    '  if (cached) return cached;\n'
)

# Fix 2: Optimize the loop in calculateTeacherYearlyPay
# Instead of looping classLogs 12 times, do a single pass and bucket by month
# We'll find the for (let m = 1; m <= 12; m++) loop and restructure it

# First, let's enable caching in getClassLogs too
# Look for: return logs; (at end of getClassLogs, right before the cache comment)
old_classlogs_end = """     // Cache for 2 minutes

    return logs;

  } catch (err) {

    return { error: err.message };

  }

}"""

new_classlogs_end = """    // Cache class logs for 3 minutes to speed up repeated calls
    const cacheKey = 'class_logs_all_v4';
    try { setCacheObject(cacheKey, logs, 180); } catch(e) {}

    return logs;

  } catch (err) {

    return { error: err.message };

  }

}"""

if old_classlogs_end in content:
    content = content.replace(old_classlogs_end, new_classlogs_end)
    print('Fix 2a: Added cache write in getClassLogs')
else:
    print('WARN: Fix 2a pattern not found')

# Fix 2b: Also read from cache at the start of getClassLogs
old_classlogs_start = """function getClassLogs(filterDate, logUser) {

  // """

new_classlogs_start = """function getClassLogs(filterDate, logUser) {

  // Try cache first (only when not filtering by date, to get all rows)
  if (!filterDate) {
    const cacheKey = 'class_logs_all_v4';
    const cached = getCacheObject(cacheKey);
    if (cached) return cached;
  }

  // """

if old_classlogs_start in content:
    content = content.replace(old_classlogs_start, new_classlogs_start)
    print('Fix 2b: Added cache read in getClassLogs')
else:
    print('WARN: Fix 2b pattern not found')

with open('Code.js', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done')
