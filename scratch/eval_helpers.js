function updateCharCountBadge(inputEl, countSpanId) {
  if (!inputEl) return;
  const countSpan = document.getElementById(countSpanId);
  const val = inputEl.value || '';
  const len = val.length;
  if (countSpan) {
    countSpan.textContent = len + '/60 ตัวอักษร';
    if (len < 60 && len > 0) {
      countSpan.style.color = '#ef4444';
      countSpan.style.fontWeight = 'bold';
    } else if (len >= 60) {
      countSpan.style.color = '#10b981';
      countSpan.style.fontWeight = 'normal';
    } else {
      countSpan.style.color = '#9ca3af';
      countSpan.style.fontWeight = 'normal';
    }
  }
}

function getSelectedSubjectKey(section, suffix) {
  const filterId = section + '_subject_filter' + (suffix ? '_' + suffix : '');
  const filterEl = document.getElementById(filterId);
  let subj = filterEl ? filterEl.value : 'general';
  if (subj === 'auto' || !subj) subj = 'general';
  return subj;
}

function populateFeedbackPresetSelects() {
  const sections = ['strength', 'improvement', 'recommendation'];
  const suffixes = ['', 'admin'];
  sections.forEach(sec => {
    suffixes.forEach(suf => {
      for (let i = 1; i <= 6; i++) {
        const selectId = sec + '_' + i + '_select' + (suf ? '_' + suf : '');
        const selectEl = document.getElementById(selectId);
        if (!selectEl) continue;
        const subjKey = getSelectedSubjectKey(sec, suf);
        const subjData = (typeof EVAL_PRESETS !== 'undefined') ? (EVAL_PRESETS[subjKey] || EVAL_PRESETS['general']) : null;
        const secData = subjData ? subjData[sec] : null;
        selectEl.innerHTML = '<option value="">-- เลือกข้อความคำแนะนำสำเร็จรูป --</option>';
        if (secData) {
          const levelLabels = { advanced: '⭐ เด็กเก่ง', intermediate: '📘 เด็กกลาง', foundation: '🌱 เด็กอ่อน' };
          ['advanced', 'intermediate', 'foundation'].forEach(lvl => {
            const items = secData[lvl];
            if (items && items.length > 0) {
              const optgroup = document.createElement('optgroup');
              optgroup.label = levelLabels[lvl] || lvl;
              items.forEach((itemText, idx) => {
                const opt = document.createElement('option');
                opt.value = itemText;
                const shortText = itemText.length > 45 ? itemText.substring(0, 45) + '...' : itemText;
                opt.textContent = (idx + 1) + '. ' + shortText;
                optgroup.appendChild(opt);
              });
              selectEl.appendChild(optgroup);
            }
          });
        }
      }
    });
  });
}

function applyFeedbackPreset(selectEl, targetId) {
  if (!selectEl) return;
  const val = selectEl.value;
  const targetEl = document.getElementById(targetId);
  if (targetEl && val) {
    targetEl.value = val;
    const countId = targetId + '_count';
    updateCharCountBadge(targetEl, countId);
  }
}

function quickFillFeedbackSection(section, level, suffix) {
  const suf = suffix || '';
  const subjKey = getSelectedSubjectKey(section, suf);
  const subjData = (typeof EVAL_PRESETS !== 'undefined') ? (EVAL_PRESETS[subjKey] || EVAL_PRESETS['general']) : null;
  const items = (subjData && subjData[section] && subjData[section][level]) ? subjData[section][level] : [];
  if (!items || items.length === 0) return;
  for (let i = 1; i <= 6; i++) {
    const inputId = section + '_' + i + (suf ? '_' + suf : '');
    const selectId = section + '_' + i + '_select' + (suf ? '_' + suf : '');
    const countId = inputId + '_count';
    const inputEl = document.getElementById(inputId);
    const selectEl = document.getElementById(selectId);
    const itemText = items[i - 1] || items[0];
    if (inputEl) {
      inputEl.value = itemText;
      updateCharCountBadge(inputEl, countId);
    }
    if (selectEl) {
      selectEl.value = itemText;
    }
  }
}

function onSubjectFilterChange(section, suffix, selectEl) {
  populateFeedbackPresetSelects();
}

function clearFeedbackSection(section, suffix) {
  const suf = suffix || '';
  for (let i = 1; i <= 6; i++) {
    const inputId = section + '_' + i + (suf ? '_' + suf : '');
    const selectId = section + '_' + i + '_select' + (suf ? '_' + suf : '');
    const countId = inputId + '_count';
    const inputEl = document.getElementById(inputId);
    const selectEl = document.getElementById(selectId);
    if (inputEl) {
      inputEl.value = '';
      updateCharCountBadge(inputEl, countId);
    }
    if (selectEl) {
      selectEl.value = '';
    }
  }
}

setTimeout(function() {
  try {
    populateFeedbackPresetSelects();
  } catch(e) {
    console.error('Error populating evaluation presets:', e);
  }
}, 1000);
