import re

def patch_js(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # The function goes from "function updateTaskWidget() {" up to the closing brace.
    # We will replace the entire function.
    
    # We can use regex to find and replace the whole function.
    pattern = re.compile(r'function updateTaskWidget\(\) \{.*?\n\}\n', re.DOTALL)
    
    new_func = """function updateTaskWidget() {
  const widget = document.getElementById('task_queue_widget');
  if (!widget) return;

  const now = Date.now();
  window._bgTaskQueue = window._bgTaskQueue.filter(t => {
     if (t.status === 'success' || t.status === 'error') {
        return now - t.endTime < 5000;
     }
     return true;
  });

  const visibleTasks = window._bgTaskQueue.filter(t => !t.isSilent);

  if (visibleTasks.length === 0) {
    widget.style.display = 'flex';
    widget.innerHTML = `
      <div style="padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; color: #1e293b; font-size: 0.75rem; font-weight: 600;">
        <div><i class="fas fa-check-circle" style="color: #10b981; margin-right: 6px;"></i> สถานะระบบ</div>
        <div style="background: rgba(16, 185, 129, 0.15); color: #10b981; padding: 2px 8px; border-radius: 12px; font-size: 0.65rem;">พร้อมใช้งาน</div>
      </div>
    `;
    return;
  }
  
  widget.style.display = 'flex';
  const activeCount = visibleTasks.filter(t => t.status !== 'success' && t.status !== 'error').length;
  
  const displayTask = visibleTasks.find(t => t.status === 'running')
                      || visibleTasks.find(t => t.status === 'queued')
                      || visibleTasks[0];
                      
  let icon = '⏳';
  if (displayTask.status === 'running') icon = '<i class="fas fa-circle-notch fa-spin" style="color:#3b82f6;"></i>';
  else if (displayTask.status === 'success') icon = '✅';
  else if (displayTask.status === 'error') icon = '❌';

  widget.innerHTML = `
    <div style="padding: 8px 14px; display: flex; justify-content: space-between; align-items: center; color: #1e293b; font-size: 0.75rem; font-weight: 600; border-bottom: 1px solid rgba(0,0,0,0.06);">
      <div><i class="fas fa-tasks" style="color:#64748b; margin-right: 6px;"></i> สถานะระบบ</div>
      <div style="background: rgba(59, 130, 246, 0.15); color: #3b82f6; padding: 2px 8px; border-radius: 12px; font-size: 0.65rem;">${activeCount} งานกำลังทำ</div>
    </div>
    <div style="padding: 10px 14px; font-size: 0.7rem; color: #334155; display: flex; align-items: center; gap: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500;">
      ${icon} <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${displayTask.title}</span>
    </div>
  `;
}
"""
    
    if pattern.search(content):
        content = pattern.sub(new_func, content, count=1)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Replaced successfully!")
    else:
        print("Function not found!")

patch_js('src/JavaScript.js')
