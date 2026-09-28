
function toggleCourseAllCheckboxes(headerCb, containerEl) {

  if (!containerEl) return;

  const checkboxes = containerEl.querySelectorAll('.admin-eval-select-checkbox');

  checkboxes.forEach(cb => {

    cb.checked = headerCb.checked;

  });

}



function publishSelectedAdminEvaluations() {
  const checkedEls = document.querySelectorAll('.admin-eval-select-checkbox:checked');
  
  if (checkedEls.length === 0) {
    showToast('กรุณาติ๊กเลือกใบประเมินที่ต้องการยืนยันเผยแพ่อย่างน้อย 1 รายการ', 'warning');
    return;
  }

  const selectedIds = Array.from(checkedEls).map(el => {
    return el.getAttribute('data-eval-id') || el.getAttribute('data-student-name');
  }).filter(Boolean);

  Swal.fire({
    title: '🌐 ยืนยันการเผยแพร่ใบประเมิน',
    html: `คุณต้องการยืนยันเผยแพร่ใบประเมินนักเรียนจำนวน <b style="color:#10b981; font-size:1.1rem;">${selectedIds.length}</b> รายการที่เลือกหรือไม่?<br><br><small style="color:#64748b;">* เมื่อยืนยันแล้ว ใบประเมินเหล่านี้จะมีสถานะ "เผยแพร่แล้ว" ในระบบและบันทึกสู่ Google Sheets ทันที</small>`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#10b981',
    cancelButtonColor: '#64748b',
    confirmButtonText: '🌐 ยืนยันเผยแพร่',
    cancelButtonText: 'ยกเลิก',
    customClass: {
      popup: 'swal2-center-popup'
    }
  }).then((result) => {
    if (result && result.isConfirmed) {
      showToast(`⏳ กำลังบันทึกและเผยแพร่ใบประเมิน ${selectedIds.length} รายการ...`, 'info');

      // 1. INSTANT OPTIMISTIC UI UPDATE: Update local cache & badge elements immediately
      if (window._adminEvalsCache && Array.isArray(window._adminEvalsCache)) {
        selectedIds.forEach(targetId => {
          const item = window._adminEvalsCache.find(e => e.evalId === targetId || e.studentName === targetId);
          if (item) {
            item.isPublished = true;
            item.status = 'published';
          }
        });
        // Re-render UI immediately so badges turn green right away
        if (typeof renderAdminEvaluationsDashboard === 'function') {
          renderAdminEvaluationsDashboard({ evals: window._adminEvalsCache, counts: window._adminEvalsCounts || {} });
        }
      }

      // 2. BACKEND SYNC: Call Apps Script to save to Google Sheets column O
      const doFallbackPublish = () => {
        let completed = 0;
        let errs = 0;
        const total = selectedIds.length;
        const cache = window._adminEvalsCache || [];
        selectedIds.forEach(targetId => {
          const ev = cache.find(e => e.evalId === targetId || e.studentName === targetId) || { evalId: targetId, studentName: targetId };
          const evalData = Object.assign({}, ev, { evalId: ev.evalId || targetId, isPublished: true, status: 'published' });
          google.script.run
            .withSuccessHandler(r => {
              completed++;
              if (!r || !r.success) errs++;
              if (completed === total) {
                showToast(`🎉 ยืนยันเผยแพร่ใบประเมินสำเร็จ ${total - errs}/${total} รายการแล้ว`, 'success');
              }
            })
            .withFailureHandler(() => {
              completed++;
              errs++;
              if (completed === total) {
                showToast(`🎉 ยืนยันเผยแพร่ใบประเมินสำเร็จ ${total - errs}/${total} รายการแล้ว`, 'success');
              }
            })
            .updateEvaluation(evalData, typeof getLogUser === 'function' ? getLogUser() : null);
        });
      };

      google.script.run
        .withSuccessHandler(res => {
          if (res && res.success && res.count > 0) {
            showToast(`🎉 ยืนยันเผยแพร่ใบประเมินสำเร็จทั้งหมด ${res.count} รายการแล้ว`, 'success');
          } else {
            doFallbackPublish();
          }
        })
        .withFailureHandler(err => {
          doFallbackPublish();
        })
        .batchPublishEvaluations(selectedIds, typeof getLogUser === 'function' ? getLogUser() : null);
    }
  });
}

window.toggleCourseAllCheckboxes = toggleCourseAllCheckboxes;
window.publishSelectedAdminEvaluations = publishSelectedAdminEvaluations;

