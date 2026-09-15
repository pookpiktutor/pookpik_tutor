import re

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace select tags without id
text = text.replace(
    '<select onchange="onSubjectFilterChange(\'strength\', \'\', this)"',
    '<select id="strength_subject_filter" onchange="onSubjectFilterChange(\'strength\', \'\', this)"'
)
text = text.replace(
    '<select onchange="onSubjectFilterChange(\'improvement\', \'\', this)"',
    '<select id="improvement_subject_filter" onchange="onSubjectFilterChange(\'improvement\', \'\', this)"'
)
text = text.replace(
    '<select onchange="onSubjectFilterChange(\'recommendation\', \'\', this)"',
    '<select id="recommendation_subject_filter" onchange="onSubjectFilterChange(\'recommendation\', \'\', this)"'
)

# Admin selects
text = text.replace(
    '<select onchange="onSubjectFilterChange(\'strength\', \'admin\', this)"',
    '<select id="strength_subject_filter_admin" onchange="onSubjectFilterChange(\'strength\', \'admin\', this)"'
)
text = text.replace(
    '<select onchange="onSubjectFilterChange(\'improvement\', \'admin\', this)"',
    '<select id="improvement_subject_filter_admin" onchange="onSubjectFilterChange(\'improvement\', \'admin\', this)"'
)
text = text.replace(
    '<select onchange="onSubjectFilterChange(\'recommendation\', \'admin\', this)"',
    '<select id="recommendation_subject_filter_admin" onchange="onSubjectFilterChange(\'recommendation\', \'admin\', this)"'
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)

print('IDs added to filter selects successfully!')
