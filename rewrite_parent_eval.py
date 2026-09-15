import os
import re

file_path = 'g:/My Drive/0.งานสถาบัน/data_PookPik_Tutor/parent_eval.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

css_replacement = '''
    :root {
      --primary-color: #ff3366;
      --primary-gradient: linear-gradient(135deg, #ff3366 0%, #ff7b54 100%);
      --secondary-gradient: linear-gradient(135deg, #7d5fff 0%, #00d2ff 100%);
      --bg-color: #f0f4f8;
      --card-bg: rgba(255, 255, 255, 0.9);
      --card-blur: blur(16px);
      --text-main: #1e293b;
      --text-muted: #64748b;
      --border-color: rgba(255, 255, 255, 0.4);
      --shadow-sm: 0 4px 15px rgba(0, 0, 0, 0.03);
      --shadow-md: 0 10px 30px rgba(0, 0, 0, 0.08);
      --shadow-glow: 0 10px 30px rgba(255, 51, 102, 0.2);
      --radius-lg: 24px;
      --radius-md: 16px;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Prompt', sans-serif;
    }

    body {
      background-color: var(--bg-color);
      color: var(--text-main);
      min-height: 100vh;
      padding: 30px 15px;
      background-image: 
        radial-gradient(circle at 10% 20%, rgba(255, 51, 102, 0.08) 0%, transparent 40%),
        radial-gradient(circle at 90% 80%, rgba(125, 95, 255, 0.08) 0%, transparent 40%);
      background-attachment: fixed;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
    }

    /* Glassmorphism Cards */
    .header-card, .search-card, .eval-card, .status-box {
      background: var(--card-bg);
      backdrop-filter: var(--card-blur);
      -webkit-backdrop-filter: var(--card-blur);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
      border: 1px solid var(--border-color);
      position: relative;
      overflow: hidden;
      margin-bottom: 25px;
    }

    .header-card {
      padding: 30px;
      text-align: center;
    }

    .header-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 6px;
      background: var(--primary-gradient);
    }

    .logo-img {
      max-height: 90px;
      margin-bottom: 15px;
      filter: drop-shadow(0 4px 6px rgba(0,0,0,0.05));
    }

    .header-title {
      font-size: 26px;
      font-weight: 700;
      background: var(--primary-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 5px;
    }

    .header-subtitle {
      font-size: 16px;
      color: var(--text-muted);
      font-weight: 400;
    }

    .search-card {
      padding: 30px;
    }
    
    .status-box {
      text-align: center;
      padding: 50px 20px;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid rgba(255, 51, 102, 0.1);
      border-top: 4px solid var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px auto;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Premium Eval Card */
    .eval-card {
      padding: 0;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      animation: fadeIn 0.6s ease-out forwards;
      opacity: 0;
      transform: translateY(20px);
    }

    @keyframes fadeIn {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .eval-card:hover {
      transform: translateY(-5px);
      box-shadow: var(--shadow-glow);
    }

    .eval-header-bg {
      background: linear-gradient(135deg, rgba(255, 51, 102, 0.05) 0%, rgba(125, 95, 255, 0.05) 100%);
      padding: 25px 30px;
      border-bottom: 1px solid rgba(0,0,0,0.03);
    }

    .eval-body {
      padding: 25px 30px;
    }

    .course-badge {
      background: var(--primary-gradient);
      color: white;
      padding: 6px 16px;
      border-radius: 30px;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 4px 10px rgba(255, 51, 102, 0.2);
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .student-info-row {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
      margin-bottom: 25px;
      background: rgba(255,255,255,0.6);
      padding: 18px 24px;
      border-radius: var(--radius-md);
      border: 1px solid rgba(0,0,0,0.03);
    }

    .info-item {
      display: flex;
      flex-direction: column;
    }

    .info-item .label {
      font-size: 13px;
      color: var(--text-muted);
      font-weight: 500;
    }

    .info-item .val {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-main);
    }

    /* Ratings */
    .ratings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 25px;
    }

    .rating-box {
      background: white;
      border: 1px solid #edf2f7;
      border-radius: var(--radius-md);
      padding: 16px;
      text-align: center;
      transition: transform 0.2s;
      box-shadow: var(--shadow-sm);
    }
    
    .rating-box:hover {
      transform: scale(1.03);
    }

    .rating-box .rating-title {
      font-size: 13px;
      color: var(--text-muted);
      margin-bottom: 10px;
      font-weight: 500;
    }

    .rating-box .rating-val {
      font-size: 18px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      flex-direction: column;
    }

    .comments-box {
      background: white;
      padding: 20px;
      border-radius: var(--radius-md);
      margin-top: 15px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.02);
      border-left: 5px solid;
    }

    .comments-title {
      font-size: 15px;
      font-weight: 700;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .comments-text {
      font-size: 15px;
      color: #475569;
      line-height: 1.7;
      white-space: pre-line;
    }

    /* Hide the old search UI since this page is mostly for magic links */
    .search-card {
      display: none;
    }
'''

js_replacement = '''
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
            <h3 style="font-size: 22px; font-weight: 700; color: #1e293b; margin-bottom: 12px;">ไม่พบใบประเมินผลการเรียนที่เผยแพร่แล้ว</h3>
            <p style="color: #64748b; font-size: 15px; max-width: 500px; margin: 0 auto; line-height: 1.6;">
              ไม่พบใบประเมินที่ได้รับการยืนยันเผยแพร่ของ <strong style="color: var(--primary-color);">"${queryName}"</strong> ในระบบ
            </p>
          </div>
        `;
        return;
      }

      let html = `
        <div style="margin-bottom: 25px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 15px; animation: fadeIn 0.4s ease-out forwards;">
          <h2 style="font-size: 22px; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 12px;">
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
        const evalDate = ev.date || ev.evalDate || 'ล่าสุด';
        const gradeLevel = ev.grade || ev.gradeLevel || '-';
        const branchName = ev.branch || 'บ้านครูปุ๊กปิ๊ก TUTOR';

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
              <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 15px;">
                <div>
                  <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                    <span class="course-badge">
                      <i class="fa-solid fa-book-open"></i> ${courseName}
                    </span>
                    <span style="background: white; color: #475569; padding: 6px 14px; border-radius: 30px; font-size: 13px; font-weight: 600; box-shadow: var(--shadow-sm);">
                      <i class="fa-solid fa-school"></i> ${branchName}
                    </span>
                  </div>
                  <h3 style="font-size: 24px; font-weight: 700; color: #1e293b; margin: 0;">
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

              <div class="ratings-grid">
                ${ratings.map(r => `
                  <div class="rating-box">
                    <div class="rating-title">
                      <i class="fa-solid ${r.icon}" style="color: ${r.color}; margin-right: 4px;"></i> ${r.title}
                    </div>
                    <div class="rating-val">
                      ${getRatingBadge(r.val, r.color)}
                    </div>
                  </div>
                `).join('')}
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
'''

new_content = re.sub(r':root\s*\{.*?(?=</style>)', lambda m: css_replacement, content, flags=re.DOTALL)
new_content = re.sub(r'function renderResults\(evals, queryName\).*?container\.innerHTML = html;\s*\}', lambda m: js_replacement, new_content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)
