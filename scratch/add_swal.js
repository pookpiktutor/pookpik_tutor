import fs from 'fs';

const indexPath = 'src/Index.html';
let content = fs.readFileSync(indexPath, 'utf8');

const target = '<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>';
const replacement = '<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>\n  ' + target;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(indexPath, content, 'utf8');
  console.log('Successfully added SweetAlert2 CDN to src/Index.html');
} else {
  console.log('Target not found in src/Index.html');
}
