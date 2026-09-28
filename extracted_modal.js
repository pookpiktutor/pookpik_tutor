+function showCampPaymentModal(timestamp) {
+  var item = currentCampsData.find(function(c) {
+    return String(c.timestamp) === String(timestamp);
+  });
+  if (!item) {
+    alert("เนเธกเนเธเธเธเนเธญเธกเธนเธฅเธเธฑเธเน€เธฃเธตเธขเธ");
+    return;
+  }
+  
+  document.getElementById('cp_timestamp').value = item.timestamp;
+  document.getElementById('cp_student_display_name').innerText = 'เธเธฑเธเน€เธฃเธตเธขเธ: ' + (item.std_name || '') + ' (' + (item.std_nickname || '') + ')';
+  document.getElementById('cp_camp_display_name').innerText = 'เธเนเธฒเธข: ' + (item.camp_name || '') + ' (เธเธต ' + (item.camp_year || '') + ')';
+  
+  var defaultFull = item.full || '';
+  if (!defaultFull || defaultFull === '0') {
+    var cName = (item.camp_name || '');
+    var cGrade = (item.class_level || '');
+    if (cName.includes('เน€เธฃเธตเธขเธ') || cName.includes('เธ•เธธเธฅเธฒเธเธก')) {
+      defaultFull = '4400';
+    } else if (cName.includes('เธชเธฒเธเธเธฑเธเธเธฑเธเธ•เนเธญเธเธ•เธดเธ”')) {
+      if (cGrade.includes('เธก.6')) {
+        defaultFull = '7900';
+      } else if (cGrade.includes('เธก.3')) {
+        defaultFull = '8900';
+      }
+    }
+  }
+  document.getElementById('cp_full').value = defaultFull;
+  document.getElementById('cp_paid').value = item.paid || '';
+  document.getElementById('cp_outstanding').value = item.outstanding || '';
+  
+  document.getElementById('cp_pay_r1_date').value = (item.pay_r1_date) ? convertDateTimeFromSheet(item.pay_r1_date).split('T')[0] : '';
+  document.getElementById('cp_pay_r1_amount').value = item.pay_r1_amount || '';
+  document.getElementById('cp_pay_r1_channel').value = item.pay_r1_channel || '';
+  
+  document.getElementById('cp_pay_r2_date').value = (item.pay_r2_date) ? convertDateTimeFromSheet(item.pay_r2_date).split('T')[0] : '';
+  document.getElementById('cp_pay_r2_amount').value = item.pay_r2_amount || '';
+  document.getElementById('cp_pay_r2_channel').value = item.pay_r2_channel || '';
+  
+  document.getElementById('cp_pay_r3_date').value = (item.pay_r3_date) ? convertDateTimeFromSheet(item.pay_r3_date).split('T')[0] : '';
+  document.getElementById('cp_pay_r3_amount').value = item.pay_r3_amount || '';
+  document.getElementById('cp_pay_r3_channel').value = item.pay_r3_channel || '';
+  
+  // Show auto-verify button if slip exists
+  var verifyBtn = document.getElementById('btn_auto_verify_slip');
+  if (verifyBtn) {
+    if (item.slip_url && item.slip_url !== '-' && item.slip_url !== '') {
+      verifyBtn.style.display = 'inline-block';
+      verifyBtn.setAttribute('data-slip-url', item.slip_url);
+    } else {
+      verifyBtn.style.display = 'none';
+    }
+  }
+
+  // Auto-calculate outstanding if not set
+  autoCalculateCampPayment();
+  
+  document.getElementById('camp_payment_modal').classList.add('active');
+}
+
+function closeCampPaymentModal() {
+  document.getElementById('camp_payment_modal').classList.remove('active');
+}
+
+function autoVerifySlip() {
+  var btn = document.getElementById('btn_auto_verify_slip');
+  var slipUrl = btn ? btn.getAttribute('data-slip-url') : '';
+  if (!slipUrl) {
+    alert('เนเธกเนเธเธ URL เธชเธฅเธดเธ');
+    return;
+  }
+  
+  btn.disabled = true;
+  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> เธเธณเธฅเธฑเธเธชเนเธเธ...';
+  
+  google.script.run
+    .withSuccessHandler(function(result) {
+      btn.disabled = false;
+      btn.innerHTML = '<i class="fas fa-magic"></i> เธชเนเธเธเธชเธฅเธดเธเธญเธฑเธ•เนเธเธกเธฑเธ•เธด';
+      
+      if (!result || !result.success) {
+        alert('เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เธชเนเธเธเธชเธฅเธดเธเนเธ”เน: ' + (result ? result.error : 'เนเธกเนเธ—เธฃเธฒเธเธชเธฒเน€เธซเธ•เธธ'));
+        return;
+      }
+      
+      var data = result.data;
+      
+      // Find the first empty round to fill in
+      var rounds = ['r1', 'r2', 'r3'];
+      var targetRound = null;
+      for (var ri = 0; ri < rounds.length; ri++) {
+        var amountEl = document.getElementById('cp_pay_' + rounds[ri] + '_amount');
+        if (amountEl && (!amountEl.value || amountEl.value === '0' || amountEl.value === '')) {
+          targetRound = rounds[ri];
+          break;
+        }
+      }
+      
+      if (!targetRound) {
+        alert('เธ—เธธเธเธเธงเธ”เธกเธตเธเนเธญเธกเธนเธฅเนเธฅเนเธง เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เน€เธเธดเนเธกเนเธ”เน');
+        return;
+      }
+      
+      // Fill in the data
+      if (data.amount) {
+        document.getElementById('cp_pay_' + targetRound + '_amount').value = data.amount;
+      }
+      if (data.date) {
+        // Convert DD/MM/YYYY to YYYY-MM-DD for input[type=date]
+        var parts = data.date.split('/');
+        if (parts.length === 3) {
+          var year = parseInt(parts[2]); // oops python inside string but this is JS in python string
+          if (year > 2500) year -= 543; // Convert Buddhist year to CE
+          var dateStr = year + '-' + parts[1].padStart(2, '0') + '-' + parts[0].padStart(2, '0');
+          document.getElementById('cp_pay_' + targetRound + '_date').value = dateStr;
+        }
+      }
+      if (data.time) {
+        var timeEl = document.getElementById('cp_pay_' + targetRound + '_time');
+        if (timeEl) timeEl.value = data.time;
+      }
+      if (data.channel) {
+        // Try to match channel to existing select options
+        var channelEl = document.getElementById('cp_pay_' + targetRound + '_channel');
+        if (channelEl) {
+          var bankName = data.channel.toLowerCase();
+          var matched = false;
+          for (var oi = 0; oi < channelEl.options.length; oi++) {
+            var optVal = channelEl.options[oi].value.toLowerCase();
+            if (optVal && (bankName.includes(optVal.split(' ')[0]) || optVal.includes(bankName.split(' ')[0]))) {
+              channelEl.selectedIndex = oi;
+              matched = true;
+              break;
+            }
+          }
+          if (!matched) {
+            // Add custom option
+            var newOpt = document.createElement('option');
+            newOpt.value = data.channel;
+            newOpt.text = data.channel;
+            channelEl.appendChild(newOpt);
+            channelEl.value = data.channel;
+          }
+        }
+      }
+      
+      autoCalculateCampPayment();
+      alert('เธชเนเธเธเธชเธฅเธดเธเน€เธชเธฃเนเธเธชเธดเนเธ! เธเธฃเธธเธ“เธฒเธ•เธฃเธงเธเธชเธญเธเธเนเธญเธกเธนเธฅเธเนเธญเธเธเธฑเธเธ—เธถเธ\n\nเธขเธญเธ”เน€เธเธดเธ: ' + (data.amount || '-') + ' เธเธฒเธ—\nเธงเธฑเธเธ—เธตเน: ' + (data.date || '-') + '\nเน€เธงเธฅเธฒ: ' + (data.time || '-') + '\nเธเนเธญเธเธ—เธฒเธ: ' + (data.channel || '-'));
+    })
+    .withFailureHandler(function(err) {
+      btn.disabled = false;
+      btn.innerHTML = '<i class="fas fa-magic"></i> เธชเนเธเธเธชเธฅเธดเธเธญเธฑเธ•เนเธเธกเธฑเธ•เธด';
+      alert('เน€เธเธดเธ”เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”: ' + err.message);
+    })
+    .verifySlipImage(slipUrl);
+}
+
+function autoCalculateCampPayment() {
+  var full = parseFloat(document.getElementById('cp_full').value) || 0;
+  var r1 = parseFloat(document.getElementById('cp_pay_r1_amount').value) || 0;
+  var r2 = parseFloat(document.getElementById('cp_pay_r2_amount').value) || 0;
+  var r3 = parseFloat(document.getElementById('cp_pay_r3_amount').value) || 0;
+  
+  var totalPaid = r1 + r2 + r3;
+  var outst = full - totalPaid;
+  
+  document.getElementById('cp_paid').value = totalPaid;
+  document.getElementById('cp_outstanding').value = outst;
+}
+
+function saveCampPaymentSubmit(e) {
+  e.preventDefault();
+  
+  var timestamp = document.getElementById('cp_timestamp').value;
+  var full = parseFloat(document.getElementById('cp_full').value) || 0;
+  var paid = parseFloat(document.getElementById('cp_paid').value) || 0;
+  var outst = parseFloat(document.getElementById('cp_outstanding').value) || 0;
+  
+  var paymentData = {
+    full: full,
+    paid: paid,
+    outstanding: outst,
+    pay_r1_date: document.getElementById('cp_pay_r1_date').value,
+    pay_r1_amount: parseFloat(document.getElementById('cp_pay_r1_amount').value) || 0,
+    pay_r1_channel: document.getElementById('cp_pay_r1_channel').value,
+    pay_r2_date: document.getElementById('cp_pay_r2_date').value,
+    pay_r2_amount: parseFloat(document.getElementById('cp_pay_r2_amount').value) || 0,
+    pay_r2_channel: document.getElementById('cp_pay_r2_channel').value,
+    pay_r3_date: document.getElementById('cp_pay_r3_date').value,
+    pay_r3_amount: parseFloat(document.getElementById('cp_pay_r3_amount').value) || 0,
+    pay_r3_channel: document.getElementById('cp_pay_r3_channel').value
+  };
+  
+  setLoading(true, "เธเธณเธฅเธฑเธเธเธฑเธเธ—เธถเธเธเนเธญเธกเธนเธฅ...");
+  
+  google.script.run.withSuccessHandler(function(res) {
+    setLoading(false);
+    if (res && res.success) {
+      closeCampPaymentModal();
+      showToast('เธเธฑเธเธ—เธถเธเธเธฒเธฃเธเธณเธฃเธฐเน€เธเธดเธเน€เธฃเธตเธขเธเธฃเนเธญเธขเนเธฅเนเธง', 'success');