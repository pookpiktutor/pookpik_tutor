
    // Cache of evaluations loaded
    let cachedEvaluations = null;

    function cleanNick(str) {
      if (!str) return '';
      return String(str)
        .replace(/^(ด\.ช\.|ด\.ญ\.|เด็กชาย|เด็กหญิง|น้อง|นาย|นางสาว|ดช|ดญ)\s*/g, '')
        .replace(/[\s\-_.\(\)]/g, '')
        .toLowerCase();
    }

    function fetchAllEvaluations(callback) {
      if (cachedEvaluations) {
        callback(null, cachedEvaluations);
        return;
      }

      // Check if google.script.run is available (GAS environment)
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
          .withSuccessHandler(function(res) {
            let data = res;
            if (typeof res === 'string') {
              try { data = JSON.parse(res); } catch(e){}
            }
            cachedEvaluations = (data && data.evaluations) ? data.evaluations : (Array.isArray(data) ? data : []);
            callback(null, cachedEvaluations);
          })
          .withFailureHandler(function(err) {
            console.error('GAS run error:', err);
            callback(err, null);
          })
          .getEvaluationsList('parent');
      } else {
        // Fallback fetch to WebApp API for standalone GitHub Pages
        const apiUrl = "https://script.google.com/macros/s/AKfycbz3O7i5vtnmOUZZv2iITeE6kftxH5JeYeB0VlDtzV5Of3rRGGq4HKJ2ZV41JTU7UOcNCQ/exec?action=getEvaluationsList&role=parent";
        fetch(apiUrl)
          .then(res => res.json())
          .then(data => {
            cachedEvaluations = (data && data.evaluations) ? data.evaluations : (Array.isArray(data) ? data : []);
            callback(null, cachedEvaluations);
          })
          .catch(err => {
            console.error('API fetch error:', err);
            callback(err, []);
          });
      }
    }

    function handleSearch(studentName) {
      if (!studentName) {
        Swal.fire({
          icon: 'warning',
          title: 'ไม่พบชื่อนักเรียน',
          text: 'ลิงก์ไม่สมบูรณ์',
          confirmButtonColor: '#ff6b8b'
        });
        return;
      }

      const resultsDiv = document.getElementById('resultsContainer');
      resultsDiv.innerHTML = `
        <div class="status-box">
          <div class="spinner"></div>
          <p style="color:#718096; font-size:15px;">กำลังโหลดใบประเมินผลการเรียน...</p>
        </div>
      `;

      fetchAllEvaluations(function(err, allEvals) {
        const list = allEvals || [];
        const cleanedQuery = cleanNick(studentName);

        // Filter published evaluations matching name/nickname
        const matched = list.filter(item => {
          // Check published status
          const isPublished = (item.isPublished === true || item.published === true || 
                               String(item.status).toLowerCase() === 'published' || 
                               String(item.status) === 'เผยแพร่แล้ว');
          if (!isPublished) return false;

          // Check Name / Nickname match
          const rawStdName = String(item.studentName || item.student_name || item.name || '');
          const rawStdNick = String(item.nickname || item.studentNickname || '');
          
          const stdNameClean = cleanNick(rawStdName);
          const stdNickClean = cleanNick(rawStdNick);
          
          const nameMatch = stdNameClean.includes(cleanedQuery) || 
                            cleanedQuery.includes(stdNameClean) ||
                            stdNickClean.includes(cleanedQuery) || 
                            cleanedQuery.includes(stdNickClean) ||
                            (cleanedQuery.length >= 2 && stdNickClean.length >= 2 && cleanedQuery.includes(stdNickClean)) ||
                            rawStdName.toLowerCase().includes(studentName.toLowerCase()) ||
                            rawStdNick.toLowerCase().includes(studentName.toLowerCase());

          return nameMatch;
        });

        renderResults(matched, studentName);
      });
    }

    
    function getRatingBadge(val, color) {
      // Determine level from text or val
      let stars = 3;
      let badgeColor = color;
      
      if (val.includes('ดีมาก') || val.includes('ยอดเยี่ยม') || val.includes('สม่ำเสมอ')) {
        stars = 5;
      } else if (val.includes('ดี') || val.includes('เรียบร้อย') || val.includes('ปานกลาง')) {
        stars = 4;
      } else if (val.includes('ควรปรับปรุง') || val.includes('ไม่สม่ำเสมอ') || val.includes('พอใช้')) {
        stars = 2;
        badgeColor = '#ef4444';
      }
      
      let starsHtml = '';
      for (let i = 0; i < 5; i++) {
        if (i < stars) {
          starsHtml += `<i class="fa-solid fa-star" style="color: #fbbf24; font-size: 14px;"></i>`;
        } else {
          starsHtml += `<i class="fa-regular fa-star" style="color: #e2e8f0; font-size: 14px;"></i>`;
        }
      }

      return `
        <div style="color: ${badgeColor};">${val}</div>
        <div style="margin-top: 6px; display: flex; gap: 4px; justify-content: center;">${starsHtml}</div>
      `;
    }

    function renderResults(evals, queryName) {
      const container = document.getElementById('resultsContainer');

      if (!evals || evals.length === 0) {
        container.innerHTML = `
          <div class="status-box">
            <div style="width: 80px; height: 80px; background: rgba(255, 51, 102, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto;">
              <i class="fa-solid fa-folder-open" style="font-size: 36px; color: var(--primary-color);"></i>
            </div>
            <h3 style="font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 12px;">ไม่พบใบประเมินผลการเรียนที่เผยแพร่แล้ว</h3>
            <p style="color: #64748b; font-size: 15px; max-width: 500px; margin: 0 auto; line-height: 1.6;">
              ไม่พบใบประเมินที่ได้รับการยืนยันเผยแพร่ของ <strong style="color: var(--primary-color);">"${queryName}"</strong> ในระบบ
            </p>
          </div>
        `;
        return;
      }

      let html = `
        <div style="margin-bottom: 25px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; animation: fadeIn 0.4s ease-out forwards;">
          <h2 style="font-size: 18px; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 12px;">
            <span style="background: var(--primary-gradient); color: white; width: 40px; height: 40px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: var(--shadow-glow);">
              <i class="fa-solid fa-award"></i>
            </span>
            รายงานผลการเรียน
          </h2>
          <span style="background: rgba(16, 185, 129, 0.1); color: #059669; font-size: 14px; font-weight: 600; padding: 8px 16px; border-radius: 30px; border: 1px solid rgba(16, 185, 129, 0.2); display: inline-flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-circle-check"></i> พบ ${evals.length} รายการ (เผยแพร่แล้ว)
          </span>
        </div>
      `;

      evals.forEach((ev, idx) => {
        const studentName = ev.studentName || ev.student_name || 'นักเรียน';
        const nickname = (ev.nickname || ev.studentNickname) ? `(${ev.nickname || ev.studentNickname})` : '';
        const courseName = ev.subject || ev.courseName || ev.course || 'คอร์สเรียน';
        const teacherName = ev.teacher || ev.teacherName || ev.kruName || 'ครูผู้สอน';
        let evalDate = ev.date || ev.evalDate || 'ล่าสุด';
        if (evalDate && evalDate.includes('T')) {
          const d = new Date(evalDate);
          if (!isNaN(d.getTime())) {
            evalDate = d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
          }
        }
        const gradeLevel = ev.grade || ev.gradeLevel || '-';
        const branchName = ev.branch || 'โรงเรียนกวดวิชาบ้านครูปุ๊กปิ๊ก';

        // Parse scores/ratings dynamically
        const scores = ev.scores || {};
        const ratings = [
          { title: 'ความตรงต่อเวลา & แต่งกาย', val: scores.attire || scores.attirePrep || ev.rating1 || 'ดีมาก', icon: 'fa-clock-rotate-left', color: '#ff3366' },
          { title: 'ความตั้งใจ & สมาธิ', val: scores.attention || scores.attentionFocus || ev.rating2 || 'ดีมาก', icon: 'fa-brain', color: '#7d5fff' },
          { title: 'ความเข้าใจเนื้อหา', val: scores.understanding || scores.comprehension || ev.rating3 || 'ดีมาก', icon: 'fa-lightbulb', color: '#0ea5e9' },
          { title: 'การส่งงาน & แบบฝึกหัด', val: scores.homework || scores.workCompletion || ev.rating4 || 'เรียบร้อยดี', icon: 'fa-pen-to-square', color: '#10b981' },
          { title: 'การมีส่วนร่วมในห้องเรียน', val: scores.behavior || ev.rating5 || 'สม่ำเสมอ', icon: 'fa-users', color: '#f59e0b' }
        ];

        const strengths = ev.strengths || '';
        const improvements = ev.improvements || '';
        const recommendations = ev.recommendations || ev.comments || ev.teacherComments || ev.feedback || '';

        html += `
          <div class="eval-card" style="animation-delay: ${idx * 0.15}s;">
            <div class="eval-header-bg">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px;">
                <div>
                  <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                    <span class="course-badge">
                      <i class="fa-solid fa-book-open"></i> ${courseName}
                    </span>
                    <span style="background: white; color: #475569; padding: 6px 14px; border-radius: 30px; font-size: 13px; font-weight: 600; box-shadow: var(--shadow-sm);">
                      <i class="fa-solid fa-school"></i> ${branchName.replace(/ipad/gi, '').replace(/jiped/gi, '').replace(/ห้องเรียน/g, 'ห้อง').trim()}
                    </span>
                  </div>
                  <h3 style="font-size: 18px; font-weight: 700; color: #1e293b; margin: 0;">
                    น้อง${studentName.replace(/^(ด\.ช\.|ด\.ญ\.|เด็กชาย|เด็กหญิง)\s*/, '')} <span style="color: var(--primary-color);">${nickname}</span>
                  </h3>
                </div>
                
                <div style="text-align: right; background: white; padding: 10px 16px; border-radius: 12px; box-shadow: var(--shadow-sm);">
                  <span style="font-size: 13px; color: #64748b; display: block; margin-bottom: 4px;">
                    <i class="fa-regular fa-calendar"></i> ประเมินเมื่อ: <strong>${evalDate}</strong>
                  </span>
                  <span style="font-size: 13px; color: #059669; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
                    <i class="fa-solid fa-shield-check"></i> รับรองผลแล้ว
                  </span>
                </div>
              </div>
            </div>

            <div class="eval-body">
              <div class="student-info-row">
                <div class="info-item" style="flex: 1; min-width: 120px;">
                  <span class="label"><i class="fa-solid fa-graduation-cap"></i> ระดับชั้น</span>
                  <span class="val">${gradeLevel}</span>
                </div>
                <div class="info-item" style="flex: 1; min-width: 120px;">
                  <span class="label"><i class="fa-solid fa-chalkboard-user"></i> ครูผู้สอน</span>
                  <span class="val" style="color: #7d5fff;">${teacherName}</span>
                </div>
              </div>

              <h4 style="font-size: 16px; font-weight: 700; color: #334155; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                <i class="fa-solid fa-chart-pie" style="color: var(--primary-color);"></i> สรุปผลการประเมินรายพฤติกรรม
              </h4>

              <div style="overflow-x: auto; margin-bottom: 25px; border-radius: 12px; box-shadow: var(--shadow-sm); border: 1px solid #e2e8f0;">
                <table style="width: 100%; border-collapse: collapse; background: white; text-align: left;">
                  <thead>
                    <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                      <th style="padding: 14px 16px; font-size: 14px; color: #475569; font-weight: 700; width: 50%;">ประเด็นการประเมิน</th>
                      <th style="padding: 14px 16px; text-align: center; font-size: 14px; color: #475569; font-weight: 700;">ผลการประเมิน</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${ratings.map((r, idx) => `
                      <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.2s; background: ${idx % 2 === 0 ? 'white' : '#fcfcfc'};">
                        <td style="padding: 14px 16px; font-size: 14px; color: #334155; font-weight: 600;">
                          <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 32px; height: 32px; border-radius: 8px; background: ${r.color}15; display: flex; align-items: center; justify-content: center;">
                              <i class="fa-solid ${r.icon}" style="color: ${r.color}; font-size: 14px;"></i>
                            </div>
                            ${r.title}
                          </div>
                        </td>
                        <td style="padding: 14px 16px; text-align: center;">
                          ${getRatingBadge(r.val, r.color)}
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>

              ${(strengths || improvements || recommendations) ? `
                <div style="margin-top: 30px; display: flex; flex-direction: column; gap: 16px;">
                  ${strengths ? `
                    <div class="comments-box" style="border-color: #10b981; background: linear-gradient(to right, rgba(16,185,129,0.05), transparent);">
                      <div class="comments-title" style="color: #059669;">
                        <i class="fa-solid fa-arrow-trend-up"></i> จุดเด่นที่ควรส่งเสริม
                      </div>
                      <div class="comments-text">${strengths}</div>
                    </div>
                  ` : ''}

                  ${improvements ? `
                    <div class="comments-box" style="border-color: #f59e0b; background: linear-gradient(to right, rgba(245,158,11,0.05), transparent);">
                      <div class="comments-title" style="color: #d97706;">
                        <i class="fa-solid fa-bullseye"></i> สิ่งที่ควรพัฒนา
                      </div>
                      <div class="comments-text">${improvements}</div>
                    </div>
                  ` : ''}

                  ${recommendations ? `
                    <div class="comments-box" style="border-color: var(--primary-color); background: linear-gradient(to right, rgba(255,51,102,0.05), transparent);">
                      <div class="comments-title" style="color: var(--primary-color);">
                        <i class="fa-solid fa-comment-dots"></i> ข้อเสนอแนะจากคุณครู
                      </div>
                      <div class="comments-text">${recommendations}</div>
                    </div>
                  ` : ''}
                </div>
              ` : ''}
            </div>
          </div>
        `;
      });

      container.innerHTML = html;
    }


    document.addEventListener('DOMContentLoaded', () => {
      const urlParams = new URLSearchParams(window.location.search);
      const ref = urlParams.get('ref');
      const resultsDiv = document.getElementById('resultsContainer');
      
      if (ref) {
        try {
          // Decode Base64 string to original student name
          const studentName = decodeURIComponent(escape(atob(ref)));
          
          // Trigger search automatically
          handleSearch(studentName);
        } catch (e) {
          console.error("Invalid magic link ref", e);
          Swal.fire({
            icon: 'error',
            title: 'ลิงก์ไม่ถูกต้อง',
            text: 'ลิงก์ส่วนตัวที่คุณเปิดไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง'
          });
        }
      } else {
        // No ref -> Display lock message
        resultsDiv.innerHTML = `
          <div class="status-box" style="margin-top: 30px;">
            <i class="fa-solid fa-lock" style="font-size: 40px; color: #cbd5e1; margin-bottom: 15px; display: block;"></i>
            <h3 style="color: #475569; margin-bottom: 8px;">ข้อมูลส่วนตัว</h3>
            <p style="color: #64748b; font-size: 15px; line-height: 1.5;">กรุณาเปิดลิงก์ส่วนตัว (Magic Link) ที่ได้รับจากแอดมิน เพื่อเข้าดูใบประเมิน<br>หากท่านยังไม่มีลิงก์ กรุณาติดต่อทีมงานค่ะ</p>
          </div>
        `;
      }
    });
  