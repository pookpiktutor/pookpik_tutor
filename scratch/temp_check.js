

  let slipFileData = null;

  window.addEventListener('DOMContentLoaded', () => {
    google.script.run
      .withSuccessHandler(function(res) {
        if (res && res.schools) {
          const list = document.getElementById('std_school_list');
          if (list) {
            list.innerHTML = '';
            const defaultSchools = [
              // ระยอง
              'โรงเรียนระยองวิทยาคม',
              'โรงเรียนอัสสัมชัญระยอง',
              'โรงเรียนเซนต์โยเซฟระยอง',
              'โรงเรียนอนุบาลระยอง',
              'โรงเรียนวัดป่าประดู่',
              'โรงเรียนตากสินระยอง',
              'โรงเรียนมารีวิทย์ระยอง',
              'โรงเรียนระยองวิทยาคมปากน้ำ',
              'โรงเรียนมาบตาพุดพันพิทยาคาร',
              'โรงเรียนสาธิตเทศบาลนครระยอง',
              // ชลบุรี
              'โรงเรียนชลราษฎรอำรุง',
              'โรงเรียนชลกันยานุกูล',
              'โรงเรียนอัสสัมชัญศรีราชา',
              'โรงเรียนดาราสมุทร',
              'โรงเรียนเซนต์พอลคอนแวนต์',
              'โรงเรียนสาธิตมหาวิทยาลัยบูรพา',
              'โรงเรียนวิทยาศาสตร์จุฬาภรณราชวิทยาลัย ชลบุรี',
              'โรงเรียนศรีราชา',
              'โรงเรียนมารีวิทย์บ่อวิน',
              'โรงเรียนมารีวิทย์สัตหีบ'
            ];
            const allSchools = new Set([...defaultSchools, ...(res.schools || [])]);
            
            allSchools.forEach(school => {
              const opt = document.createElement('option');
              opt.value = school;
              list.appendChild(opt);
            });
          }
        }
      })
      .withFailureHandler(function(err) {
        console.error('Failed to load schools:', err);
      })
      .getGeneralSettings();
  });

  function formatPhoneAsYouType(inputElement) {
    var val = inputElement.value.replace(/\D/g, '');
    if (val.length > 10) val = val.slice(0, 10);
    var formatted = '';
    if (val.length > 0) {
      if (val.length <= 3) {
        formatted = val;
      } else if (val.length <= 6) {
        formatted = val.slice(0, 3) + '-' + val.slice(3);
      } else {
        formatted = val.slice(0, 3) + '-' + val.slice(3, 6) + '-' + val.slice(6);
      }
    }
    inputElement.value = formatted;
  }

  function toggleAllCourses(masterCb) {
    var cbs = document.querySelectorAll('.course-checkbox');
    cbs.forEach(function(cb) {
      cb.checked = masterCb.checked;
    });
    recalcSelectedFees();
  }

  function toggleUnpaid(isChecked) {
    var transferInput = document.getElementById('transfer_amount');
    var slipGroup = document.getElementById('slip_upload_group');
    var fileInput = document.getElementById('file_input');
    
    if (isChecked) {
      transferInput.disabled = true;
      transferInput.value = 0;
      fileInput.required = false;
      slipGroup.style.display = 'none';
      recalcSelectedFees();
    } else {
      transferInput.disabled = false;
      transferInput.value = '';
      fileInput.required = true;
      slipGroup.style.display = 'block';
      recalcSelectedFees();
    }
  }

  function recalcSelectedFees(isInitial) {
    var courses = window._outstandingCourses || [];
    var cbs = document.querySelectorAll('.course-checkbox');
    var total = 0;
    var selectedNames = [];
    var fullPrices = [];

    cbs.forEach(function(cb) {
      if (cb.checked) {
        var idx = parseInt(cb.getAttribute('data-index'));
        if (!isNaN(idx) && courses[idx]) {
          var price = courses[idx].outstanding;
          total += price;
          fullPrices.push(price);
          selectedNames.push(courses[idx].courseName);
        }
      }
    });

    var classType = document.getElementById('class_type') ? document.getElementById('class_type').value : '';
    var discountInput = document.getElementById('discount_amount');
    
    // Auto calculate discount if Main Group
    if (classType && classType.indexOf('กลุ่มหลัก') !== -1) {
      fullPrices.sort((a, b) => b - a);
      var calcTotal = 0;
      fullPrices.forEach((price, idx) => {
        if (idx === 0 || idx === 1) {
          calcTotal += price;
        } else if (idx === 2) {
          calcTotal += price * 0.7; // 30% discount
        } else {
          calcTotal += price * 0.5; // 50% discount
        }
      });
      var autoDiscount = total - calcTotal;
      if (discountInput) {
        discountInput.value = autoDiscount;
      }
    } else {
      if (discountInput) discountInput.value = 0;
    }

    var discount = discountInput ? (parseFloat(discountInput.value) || 0) : 0;
    var netTotal = Math.max(0, total - discount);

    document.getElementById('fees_grand_total').textContent = '฿' + netTotal.toLocaleString(undefined, {minimumFractionDigits: 2});
    document.getElementById('selected_outstanding_courses').value = selectedNames.join(', ');
    document.getElementById('full_amount').value = netTotal;
    
    var transferInput = document.getElementById('transfer_amount');
    if (isInitial) {
      transferInput.value = total > 0 ? total : '';
    }
    
    var transferVal = parseFloat(transferInput.value) || 0;
    var remainingTotal = Math.max(0, total - transferVal);
    
    var remainingRow = document.getElementById('remaining_row');
    var remainingTotalSpan = document.getElementById('fees_remaining_total');
    
    if (transferVal > 0 && total > 0) {
      remainingRow.style.display = 'table-row';
      remainingTotalSpan.textContent = '฿' + remainingTotal.toLocaleString(undefined, {minimumFractionDigits: 2});
    } else {
      remainingRow.style.display = 'none';
    }
  }


  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    document.getElementById('upload_status').textContent = 'เลือกไฟล์สำเร็จ: ' + file.name;
    
    // Compress Image before upload to speed up submission
    const reader = new FileReader();
    reader.onload = function(event) {
      const img = new Image();
      img.onload = function() {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        
        document.getElementById('preview_img').src = dataUrl;
        document.getElementById('preview_container').style.display = 'block';
        
        // Save Compressed Base64
        slipFileData = {
          base64: dataUrl.split(',')[1],
          mimeType: 'image/jpeg',
          fileName: file.name
        };
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  function fetchAvailableCourses(isFromButton = false) {
    const grade = document.getElementById('std_grade').value.trim();
    const classType = document.getElementById('class_type').value.trim();
    const branchLearn = document.getElementById('branch_learn').value.trim();

    if (!grade || !classType || !branchLearn) {
      if (isFromButton) {
        alert('กรุณาเลือกสาขา ระดับชั้น และรูปแบบการเรียนเพื่อค้นหารายวิชา');
      }
      return;
    }

    const searchBtn = document.querySelector('.btn-secondary');
    const originalText = searchBtn.textContent;
    searchBtn.disabled = true;
    searchBtn.textContent = 'กำลังค้นหารายวิชา...';

    google.script.run
      .withSuccessHandler(res => {
        searchBtn.disabled = false;
        searchBtn.textContent = originalText;

        const container = document.getElementById('fees_display_container');
        const tbody = document.getElementById('fees_list_tbody');
        const grandTotalSpan = document.getElementById('fees_grand_total');
        const selectedCoursesInput = document.getElementById('selected_outstanding_courses');

        tbody.innerHTML = '';
        container.style.display = 'block';

        var outstandingCourses = [];
        if (res && res.success && Array.isArray(res.courses)) {
          outstandingCourses = res.courses;
        }

        if (outstandingCourses.length > 0) {
          // Store courses data globally for recalculation
          window._outstandingCourses = outstandingCourses;

          // Check if classType is "กลุ่มหลัก" and populate round
          const courseRoundContainer = document.getElementById('course_round_container');
          const courseRoundSelect = document.getElementById('course_round');
          
          if (classType === 'กลุ่มหลัก' && courseRoundContainer && courseRoundSelect) {
            const roundsSet = new Set();
            outstandingCourses.forEach(c => {
               const r = getCourseRound(c.courseName);
               if (r !== 'None') roundsSet.add(r);
            });
            courseRoundSelect.innerHTML = '<option value="AUTO">-- แสดงตามช่วงวันที่ (Auto) --</option><option value="ALL">-- แสดงทุกรอบ --</option>';
            const roundsArray = Array.from(roundsSet);
            roundsArray.forEach(r => {
               const opt = document.createElement('option');
               opt.value = r;
               opt.textContent = r;
               courseRoundSelect.appendChild(opt);
            });
            courseRoundContainer.style.display = 'grid'; // because row-grid uses display: grid
          } else {
            if (courseRoundContainer) courseRoundContainer.style.display = 'none';
            if (courseRoundSelect) courseRoundSelect.value = 'AUTO';
          }

          renderCourseCheckboxes();
        } else {
          var tr = document.createElement('tr');
          var td = document.createElement('td');
          td.colSpan = 4;
          td.style.padding = '20px';
          td.style.textAlign = 'center';
          td.style.color = '#64748b';
          td.textContent = 'ไม่พบคอร์สเรียนที่เปิดสอนสำหรับเงื่อนไขนี้';
          tr.appendChild(td);
          tbody.appendChild(tr);
        }
      })
      .withFailureHandler(err => {
        searchBtn.disabled = false;
        searchBtn.textContent = originalText;
        alert('เกิดข้อผิดพลาดในการดึงข้อมูล: ' + err.message);
      })
      .getAvailableCourses(grade, classType, branchLearn);
  }

  function getCourseRound(courseName) {
    if (!courseName) return 'None';
    const clean = courseName.toString().trim();
    
    let match = clean.match(/(MIDTERM\s*\d+|FINAL\s*\d+|ปิดเทอม\s*ต\.ค\.|SUMMER)(?:\s*\/?\s*\d+)?/i);
    if (match) {
        return match[0].toUpperCase();
    }

    return 'None';
  }

  function getAutoActiveRounds(dateObj) {
    if (!dateObj) dateObj = new Date();
    const m = dateObj.getMonth() + 1;
    const d = dateObj.getDate();
    const mmdd = m * 100 + d; 

    let activeRounds = [];
    if (mmdd >= 315 && mmdd <= 425) activeRounds.push('SUMMER');
    if (mmdd >= 415 && mmdd <= 715) activeRounds.push('MIDTERM 1');
    if (mmdd >= 601 && mmdd <= 930) activeRounds.push('FINAL 1');
    if (mmdd >= 901 && mmdd <= 1031) activeRounds.push('ปิดเทอม ต.ค.');
    if (mmdd >= 1001 && mmdd <= 1230) activeRounds.push('MIDTERM 2');
    if (mmdd >= 1201 || mmdd <= 229) activeRounds.push('FINAL 2');

    return activeRounds;
  }

  function renderCourseCheckboxes() {
    const tbody = document.getElementById('fees_list_tbody');
    tbody.innerHTML = '';
    
    const courseRoundSelect = document.getElementById('course_round');
    const selectedRound = courseRoundSelect ? courseRoundSelect.value : 'AUTO';
    
    let displayedCourses = window._outstandingCourses || [];
    
    if (selectedRound === 'AUTO') {
       const activeBaseRounds = getAutoActiveRounds();
       displayedCourses = displayedCourses.filter(c => {
          const r = getCourseRound(c.courseName);
          if (r === 'None') return false;
          return activeBaseRounds.some(base => r.toUpperCase().startsWith(base.toUpperCase()));
       });
    } else if (selectedRound !== 'ALL' && selectedRound !== '') {
       displayedCourses = displayedCourses.filter(c => getCourseRound(c.courseName) === selectedRound);
    }
    
    if (displayedCourses.length === 0) {
       var tr = document.createElement('tr');
       var td = document.createElement('td');
       td.colSpan = 4;
       td.style.padding = '20px';
       td.style.textAlign = 'center';
       td.style.color = '#64748b';
       td.textContent = 'ไม่พบคอร์สเรียนที่ตรงกับรอบที่เลือก';
       tr.appendChild(td);
       tbody.appendChild(tr);
       
       document.getElementById('select_all_courses').checked = false;
       document.getElementById('fees_grand_total').textContent = '฿0.00';
       document.getElementById('fees_grand_total').style.color = '#16a34a';
       document.getElementById('selected_outstanding_courses').value = '';
       document.getElementById('transfer_amount').value = '';
       return;
    }

    displayedCourses.forEach(function(c, idx) {
      // Find original index to map properly for data-index
      const originalIdx = window._outstandingCourses.indexOf(c);
      
      var tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid #e2e8f0';
      
      // Checkbox column
      var checkTd = document.createElement('td');
      checkTd.style.padding = '8px 4px';
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = false;
      cb.className = 'course-checkbox';
      cb.setAttribute('data-index', originalIdx);
      cb.style.cssText = 'width:18px;height:18px;cursor:pointer;accent-color:#0084ff;';
      cb.onchange = function() { recalcSelectedFees(); };
      checkTd.appendChild(cb);
      
      var nameTd = document.createElement('td');
      nameTd.style.padding = '8px 4px';
      nameTd.textContent = c.courseName || '-';
      
      var priceTd = document.createElement('td');
      priceTd.style.padding = '8px 4px';
      priceTd.style.textAlign = 'right';
      priceTd.textContent = c.full ? '฿' + c.full.toLocaleString(undefined, {minimumFractionDigits: 2}) : '-';
      
      var outstandingTd = document.createElement('td');
      outstandingTd.style.padding = '8px 4px';
      outstandingTd.style.textAlign = 'right';
      outstandingTd.style.fontWeight = '600';
      outstandingTd.style.color = '#ef4444';
      outstandingTd.textContent = c.outstanding ? '฿' + c.outstanding.toLocaleString(undefined, {minimumFractionDigits: 2}) : '-';

      tr.appendChild(checkTd);
      tr.appendChild(nameTd);
      tr.appendChild(priceTd);
      tr.appendChild(outstandingTd);
      tbody.appendChild(tr);
    });

    // Set select-all checkbox to unchecked
    document.getElementById('select_all_courses').checked = false;
    
    // Calculate totals
    recalcSelectedFees(false);
  }

  // --- Toast Notification System ---
  function showRegToast(message, type) {
    // Remove existing toast
    const old = document.getElementById('reg_toast');
    if (old) old.remove();

    const toast = document.createElement('div');
    toast.id = 'reg_toast';
    const bgColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#f59e0b';
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : '⚠️';
    toast.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:99999;padding:16px 28px;border-radius:12px;color:#fff;font-size:1rem;font-weight:600;box-shadow:0 8px 30px rgba(0,0,0,0.25);display:flex;align-items:center;gap:10px;animation:toastSlide 0.4s ease;background:' + bgColor + ';max-width:90vw;';
    toast.innerHTML = '<span style="font-size:1.3rem;">' + icon + '</span><span>' + message + '</span>';
    document.body.appendChild(toast);

    // Auto remove after 5s
    setTimeout(function() { if (toast.parentNode) toast.remove(); }, 5000);
  }

  function submitForm() {
    const submitBtn = document.getElementById('submit_btn');
    const btnSpinner = document.getElementById('btn_spinner');
    const btnText = document.getElementById('btn_text');

    try {
      // Validate required fields
      const name = document.getElementById('std_name').value.trim();
      const nickname = document.getElementById('std_nickname').value.trim();
      const contact = document.getElementById('parent_contact').value.trim();
      const school = document.getElementById('std_school').value.trim();

      if (!name) {
        showRegToast('กรุณากรอกชื่อ-นามสกุลนักเรียน', 'error');
        return;
      }
      if (!nickname) {
        showRegToast('กรุณากรอกชื่อเล่นนักเรียน', 'error');
        return;
      }
      if (!contact) {
        showRegToast('กรุณากรอกเบอร์โทรศัพท์ผู้ปกครอง', 'error');
        return;
      }
      if (!school) {
        showRegToast('กรุณากรอกโรงเรียนที่เรียนปัจจุบัน', 'error');
        return;
      }

      // Disable state
      submitBtn.disabled = true;
      btnSpinner.style.display = 'block';
      btnText.textContent = 'กำลังส่งข้อมูล...';
      showRegToast('กำลังส่งข้อมูลลงทะเบียน กรุณารอสักครู่...', 'warning');

      const outstandingCourses = document.getElementById('selected_outstanding_courses').value;
      const studentData = {
        name: name,
        nickname: nickname,
        school: school,
        grade: document.getElementById('std_grade').value,
        classSection: document.getElementById('class_section').value,
        classType: document.getElementById('class_type').value,
        course: outstandingCourses || 'สมัครเรียนใหม่ / คอร์สทั่วไป',
        contact: contact,
        lineId: document.getElementById('line_id').value.trim(),
        amount: parseFloat(document.getElementById('transfer_amount').value) || 0,
        fullAmount: parseFloat(document.getElementById('full_amount').value) || 0,
        branchLearn: document.getElementById('branch_learn').value
      };

      console.log('[Register] Submitting studentData:', JSON.stringify(studentData));
      console.log('[Register] slipFileData present:', slipFileData ? 'Yes (size: ' + (slipFileData.base64 ? slipFileData.base64.length : 0) + ')' : 'No');

      google.script.run
        .withSuccessHandler(function(res) {
          console.log('[Register] Success response:', JSON.stringify(res));
          // Reset state
          submitBtn.disabled = false;
          btnSpinner.style.display = 'none';
          btnText.textContent = 'ส่งข้อมูลลงทะเบียน';

          if (res && res.success) {
            showRegToast('🎉 ลงทะเบียนสำเร็จเรียบร้อยแล้ว!', 'success');
            setTimeout(function() {
              document.getElementById('form_view').style.display = 'none';
              document.getElementById('success_view').style.display = 'block';
            }, 1500);
          } else {
            showRegToast('เกิดข้อผิดพลาด: ' + (res ? res.error : 'ไม่ทราบสาเหตุ กรุณาลองใหม่อีกครั้ง'), 'error');
          }
        })
        .withFailureHandler(function(err) {
          console.error('[Register] Failure:', err);
          submitBtn.disabled = false;
          btnSpinner.style.display = 'none';
          btnText.textContent = 'ส่งข้อมูลลงทะเบียน';
          showRegToast('การส่งข้อมูลล้มเหลว: ' + (err.message || 'กรุณาลองใหม่อีกครั้ง'), 'error');
        })
        .submitPublicRegistration(studentData, slipFileData);

    } catch (ex) {
      console.error('[Register] Exception in submitForm:', ex);
      submitBtn.disabled = false;
      btnSpinner.style.display = 'none';
      btnText.textContent = 'ส่งข้อมูลลงทะเบียน';
      showRegToast('เกิดข้อผิดพลาดในระบบ: ' + ex.message, 'error');
    }
  }
