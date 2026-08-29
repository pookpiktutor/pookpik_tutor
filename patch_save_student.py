import re

def patch_js(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the start and end of the obj declaration
    start_str = "const obj = {"
    end_str = "studentDataArray.push(obj);"
    
    start_idx = content.find(start_str)
    end_idx = content.find(end_str, start_idx)
    
    if start_idx != -1 and end_idx != -1:
        replacement = """const obj = {
      id: studentId,
      date: new Date().toISOString().split('T')[0],
      grade: grade,
      name: name,
      nickname: document.getElementById(`student_nickname_${idx}`).value.trim(),
      school: document.getElementById(`student_school_${idx}`).value.trim(),
      classSection: document.getElementById(`student_class_section_${idx}`).value.trim(),
      contact: document.getElementById(`student_contact_${idx}`).value.trim(),
      lineName: document.getElementById(`student_line_name_${idx}`).value.trim(),
      lineId: document.getElementById(`student_line_id_${idx}`).value.trim(),
      branchLearn: branchLearn,
      branchPay: branchPay,
      classType: classType,
      subgroupCoursesSize: subgroupSize,
      
      round: courseStr,
      subgroupCourses: courseStr.split(',').map(s => s.trim()).filter(s => s),
      
      paymentChannel: document.getElementById(`pay_mode_unpaid_${idx}`) && document.getElementById(`pay_mode_unpaid_${idx}`).checked ? 'unpaid' : (document.getElementById(`pay_mode_card_${idx}`).checked ? 'card' : (document.getElementById(`pay_mode_transfer_${idx}`).checked ? 'transfer' : 'cash')),
      full: parseFloat(document.getElementById(`student_full_${idx}`).value) || 0,
      paid: parseFloat(document.getElementById(`student_paid_${idx}`).value) || 0,
      outstanding: parseFloat(document.getElementById(`student_outstanding_${idx}`).value) || 0,
      carriedForwardFee: document.getElementById(`has_carried_forward_${idx}`).checked ? (parseFloat(document.getElementById(`student_carried_forward_${idx}`).value) || 0) : 0,
      
      paymentTimeNote: document.getElementById(`student_time_note_${idx}`).value.trim(),
      extraNote: document.getElementById(`student_extra_note_${idx}`).value.trim(),
      classHours: document.getElementById(`student_hours_${idx}`).value.trim(),
      classHoursLeft: document.getElementById(`student_hours_left_${idx}`).value.trim(),
      
      payRound1_date: document.getElementById(`pay_r1_date_${idx}`).value,
      payRound1_amount: document.getElementById(`pay_r1_amount_${idx}`).value,
      payRound1_channel: document.getElementById(`pay_r1_channel_${idx}`).value,
      payRound1_staff: document.getElementById(`pay_r1_staff_${idx}`).value,
      payRound1_time: document.getElementById(`pay_r1_time_${idx}`).value,
      
      payRound2_date: document.getElementById(`pay_r2_date_${idx}`).value,
      payRound2_amount: document.getElementById(`pay_r2_amount_${idx}`).value,
      payRound2_channel: document.getElementById(`pay_r2_channel_${idx}`).value,
      payRound2_staff: document.getElementById(`pay_r2_staff_${idx}`).value,
      payRound2_time: document.getElementById(`pay_r2_time_${idx}`).value,
      
      payRound3_date: document.getElementById(`pay_r3_date_${idx}`).value,
      payRound3_amount: document.getElementById(`pay_r3_amount_${idx}`).value,
      payRound3_channel: document.getElementById(`pay_r3_channel_${idx}`).value,
      payRound3_staff: document.getElementById(`pay_r3_staff_${idx}`).value,
      payRound3_time: document.getElementById(`pay_r3_time_${idx}`).value,
      
      paymentDate: new Date().toISOString().split('T')[0],
      staff: getLogUser()
    };

    """
        content = content[:start_idx] + replacement + content[end_idx:]
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Replaced successfully!")
    else:
        print("Target not found!")

patch_js('src/JavaScript.js')
