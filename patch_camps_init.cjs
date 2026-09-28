const fs = require('fs');
const code = fs.readFileSync('src/JavaScript.js', 'utf8');
const inject = `var campsFiltersInitialized = false;

function initCampsFilters(callback) {
  google.script.run.withSuccessHandler(function(res) {
    if (res) {
      var yearSelect = document.getElementById('camps_year_select');
      var nameSelect = document.getElementById('camps_name_select');
      if (yearSelect && res.academicYears) {
        var opts = '<option value="all">ทั้งหมด</option>';
        res.academicYears.forEach(function(y) {
          opts += '<option value="' + y + '">' + y + '</option>';
        });
        yearSelect.innerHTML = opts;
      }
      if (nameSelect && res.campNames) {
        var opts = '<option value="all">ทั้งหมด</option>';
        res.campNames.forEach(function(n) {
          opts += '<option value="' + n + '">' + n + '</option>';
        });
        nameSelect.innerHTML = opts;
      }
      campsFiltersInitialized = true;
    }
    if (callback) callback();
  }).withFailureHandler(function(err) {
    console.error('Failed to load camp filters', err);
    if (callback) callback();
  }).getCampsFilterOptions();
}

`;
fs.writeFileSync('src/JavaScript.js', code.replace('// Camps Dashboard Feature', '// Camps Dashboard Feature\n' + inject));
