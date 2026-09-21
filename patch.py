import sys
sys.stdout.reconfigure(encoding='utf-8')
with open('src/ParentEval.html', 'r', encoding='utf-8') as f:
    content = f.read()

target = 'function renderResults(evals, queryName) {'

new_code = '''
window.pendingEvals = null;
window.pendingQueryName = null;

function renderResults(evals, queryName) {
  const container = document.getElementById('resultsContainer');
  if (!evals || evals.length === 0) {
    showEvaluationCards(evals, queryName);
    return;
  }
  if (localStorage.getItem('pookpik_survey_done') === 'true') {
    showEvaluationCards(evals, queryName);
  } else {
    window.pendingEvals = evals;
    window.pendingQueryName = queryName;
    showSatisfactionSurvey();
  }
}

function submitSatisfactionSurvey() {
  const btn = document.getElementById('btnSubmitSurvey');
  if (btn) btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> กำลังส่งข้อมูล...';
  
  const getRating = (name) => {
    const el = document.querySelector(\input[name="\"]:checked\);
    return el ? parseInt(el.value) : 0;
  };
  
  const phoneInput = document.getElementById('searchPhone');
  const data = {
    name: window.pendingQueryName,
    phone: phoneInput ? phoneInput.value : '',
    location: getRating('ratingLocation'),
    staff: getRating('ratingStaff'),
    teachers: getRating('ratingTeachers'),
    atmosphere: getRating('ratingAtmosphere'),
    content: getRating('ratingContent'),
    comments: document.getElementById('surveyComments') ? document.getElementById('surveyComments').value : ''
  };

  google.script.run
    .withSuccessHandler(function(res) {
      localStorage.setItem('pookpik_survey_done', 'true');
      showEvaluationCards(window.pendingEvals, window.pendingQueryName);
    })
    .withFailureHandler(function(err) {
      console.error(err);
      localStorage.setItem('pookpik_survey_done', 'true');
      showEvaluationCards(window.pendingEvals, window.pendingQueryName);
    })
    .saveSatisfactionSurvey(data);
}

function showSatisfactionSurvey() {
  const container = document.getElementById('resultsContainer');
  let html = \
    <div style="background: #fff; border-radius: 20px; padding: 25px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); margin-bottom: 20px; text-align: center;">
      <h3 style="font-size: 20px; font-weight: 700; color: #2d3748; margin-bottom: 10px;">กรุณาประเมินความพึงพอใจ</h3>
      <p style="color: #718096; font-size: 14.5px; margin-bottom: 20px;">เพื่อให้เราพัฒนาการบริการให้ดียิ่งขึ้น รบกวนเวลาให้คะแนนโรงเรียนกวดวิชาบ้านครูปุ๊กปิ๊กด้วยนะครับ (ทำเพียงครั้งเดียว)</p>
      
      <style>
        .survey-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; text-align: left; background: #f8fafc; padding: 10px 15px; border-radius: 12px; }
        .survey-label { font-weight: 600; color: #4a5568; }
        .survey-stars { display: flex; flex-direction: row-reverse; gap: 5px; }
        .survey-stars input { display: none; }
        .survey-stars label { font-size: 24px; color: #cbd5e1; cursor: pointer; transition: color 0.2s; margin: 0; padding: 0 2px; }
        .survey-stars input:checked ~ label,
        .survey-stars label:hover,
        .survey-stars label:hover ~ label { color: #f59e0b; }
        
        @media (max-width: 480px) {
          .survey-row { flex-direction: column; align-items: flex-start; gap: 8px; }
          .survey-stars label { font-size: 28px; }
        }
      </style>
  \;
  
  const criteria = [
    { id: 'ratingLocation', label: '🏫 ด้านสถานที่' },
    { id: 'ratingStaff', label: '👩‍💼 ด้านเจ้าหน้าที่/การบริการ' },
    { id: 'ratingTeachers', label: '👨‍🏫 ด้านครูผู้สอน' },
    { id: 'ratingAtmosphere', label: '✨ บรรยากาศการเรียน' },
    { id: 'ratingContent', label: '📚 เนื้อหาหลักสูตร' }
  ];
  
  criteria.forEach(c => {
    html += \
      <div class="survey-row">
        <span class="survey-label">\</span>
        <div class="survey-stars">
          <input type="radio" id="\5" name="\" value="5"><label for="\5">★</label>
          <input type="radio" id="\4" name="\" value="4"><label for="\4">★</label>
          <input type="radio" id="\3" name="\" value="3"><label for="\3">★</label>
          <input type="radio" id="\2" name="\" value="2"><label for="\2">★</label>
          <input type="radio" id="\1" name="\" value="1"><label for="\1">★</label>
        </div>
      </div>
    \;
  });
  
  html += \
      <div style="text-align: left; margin-bottom: 20px; margin-top: 20px;">
        <label class="survey-label" style="display: block; margin-bottom: 8px;">💬 ข้อเสนอแนะเพิ่มเติม (ถ้ามี)</label>
        <textarea id="surveyComments" style="width: 100%; padding: 12px; border-radius: 12px; border: 1px solid #cbd5e1; outline: none; font-family: inherit; resize: vertical; box-sizing: border-box;" rows="3" placeholder="ระบุข้อเสนอแนะ..."></textarea>
      </div>
      <button id="btnSubmitSurvey" onclick="submitSatisfactionSurvey()" style="background: linear-gradient(135deg, #ff6b8b, #ff8e53); color: white; border: none; padding: 12px 24px; border-radius: 50px; font-size: 16px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 10px rgba(255,107,139,0.3); transition: all 0.2s;">
        ส่งแบบประเมินและดูผลการเรียน
      </button>
    </div>
  \;
  container.innerHTML = html;
}

function showEvaluationCards(evals, queryName) {
'''

content = content.replace(target, new_code)
with open('src/ParentEval.html', 'w', encoding='utf-8') as f:
    f.write(content)
print('Replaced renderResults successfully')
