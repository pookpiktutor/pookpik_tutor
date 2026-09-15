

function toggleCourseAllCheckboxes(headerCb, containerEl) {

  if (!containerEl) return;

  const checkboxes = containerEl.querySelectorAll('.admin-eval-select-checkbox');

  checkboxes.forEach(cb => {

    cb.checked = headerCb.checked;

  });

}



function publishSelectedAdminEvaluations() {

  const checkedEls = document.querySelectorAll('.admin-eval-select-checkbox:checked');

  const selectedIds = Array.from(checkedEls).map(el => el.getAttribute('data-eval-id')).filter(Boolean);



  if (selectedIds.length === 0) {

    showToast('กรุณาติ๊กเลือกใบประเมินที่ต้องการยืนยันเผยแพ่อย่างน้อย 1 รายการ', 'warning');

    return;

  }



  showCustomConfirm(

    `ยืนยันเผยแพร่ใบประเมินนักเรียนจำนวน <b>${selectedIds.length}</b> รายการพร้อมกันหรือไม่?<br><small style="color:var(--text-muted);">ใบประเมินที่เผยแพร่แล้ว ผู้ปกครองจะสามารถค้นหาและดูผ่านหน้าระบบผู้ปกครองได้ทันที</small>`,

    function() {

      showLoading(true, `กำลังบันทึกและเผยแพร่ใบประเมิน ${selectedIds.length} รายการ...`);

      let completedCount = 0;

      let hasError = false;



      selectedIds.forEach(evalId => {

        const ev = window._adminEvalsCache.find(e => e.evalId === evalId);

        if (!ev) {

          completedCount++;

          if (completedCount === selectedIds.length) {

            showLoading(false);

            showToast(`ยืนยันเผยแพร่ใบประเมินสำเร็จ ${selectedIds.length} รายการ`, 'success');

            loadAdminEvaluationsDashboard();

          }

          return;

        }



        // Send update to publish

        const payload = {

          evalId: ev.evalId,

          subject: ev.subject || '',

          studentName: ev.studentName || '',

          grade: ev.grade || '',

          branch: ev.branch || '',

          date: ev.date || '',

          teacher: ev.teacher || '',

          scores: ev.scores || {},

          strengths: ev.strengths || '',

          improvements: ev.improvements || '',

          recommendations: ev.recommendations || ''

        };



        google.script.run

          .withSuccessHandler(res => {

            completedCount++;

            if (completedCount === selectedIds.length) {

              showLoading(false);

              showToast(`🎉 ยืนยันเผยแพร่ใบประเมินสำเร็จทั้งหมด ${selectedIds.length} รายการแล้ว`, 'success');

              loadAdminEvaluationsDashboard();

            }

          })

          .withFailureHandler(err => {

            hasError = true;

            completedCount++;

            if (completedCount === selectedIds.length) {

              showLoading(false);

              showToast(`เกิดข้อผิดพลาดบางรายการ: ${err.message || err}`, 'error');

              loadAdminEvaluationsDashboard();

            }

          })

          .updateEvaluation(payload);

      });

    }

  );

}


