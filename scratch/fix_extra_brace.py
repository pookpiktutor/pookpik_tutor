import sys

sys.stdout.reconfigure(encoding='utf-8')

for fname in ['register.html', 'src/register.html']:
    with open(fname, 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix the extra closing brace near btn_search_student_camp
    old_broken_part = '''.searchStudentRegistrationAndUnpaid(name);
        });
    }
    }
});'''
    new_fixed_part = '''.searchStudentRegistrationAndUnpaid(name);
        });
    }
});'''

    if old_broken_part in content:
        content = content.replace(old_broken_part, new_fixed_part)
        with open(fname, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Fixed extra brace in {fname}')
    else:
        print(f'Pattern not found in {fname}, checking manually...')
