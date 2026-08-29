const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const target = `<div id="inline_loading_indicator" style="display: none; position: absolute; top: 0; right: 0; height: 100%; min-height: 38px; align-items: center; padding: 0 16px; background: rgba(255,255,255,0.9); backdrop-filter: blur(4px); border-left: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; font-size: 0.85rem; color: #0f172a; font-weight: 600; gap: 8px; z-index: 105; box-shadow: -2px 0 5px rgba(0,0,0,0.05);">`;
const replacement = `<div id="inline_loading_indicator" style="display: none; position: fixed; top: 12px; right: 12px; min-height: 36px; align-items: center; padding: 0 16px; background: rgba(255, 255, 255, 0.4); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.6); border-radius: 20px; font-size: 0.85rem; color: #0f172a; font-weight: 600; gap: 8px; z-index: 9999; box-shadow: 0 4px 15px rgba(0,0,0,0.08);">`;

html = html.replace(target, replacement);
fs.writeFileSync('index.html', html);
console.log('done');
