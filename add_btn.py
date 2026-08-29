import io

with io.open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

btn_sync_all = '<button class="btn btn-secondary btn-sync-financials" onclick="syncAllFinancials()" id="btn_sync_all_financials_top" style="font-size: 0.8rem; padding: 6px 12px; border: none; border-radius: var(--radius-sm); cursor: pointer; transition: all 0.2s;">🔄 ซิงค์ยอดเงินทั้งหมด</button>'
c = c.replace('<button class="btn btn-primary" onclick="syncDataLearnSubjects()"', btn_sync_all + '\n            <button class="btn btn-primary" onclick="syncDataLearnSubjects()"')

with io.open('index.html', 'w', encoding='utf-8') as f:
    f.write(c)
print("[OK] Topbar updated with sync button.")
