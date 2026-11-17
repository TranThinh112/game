const fs = require('fs');
try {
  const code = fs.readFileSync('public/dashboard.js', 'utf8');
  new Function(code);
  console.log('dashboard.js syntax is 100% VALID!');
} catch (err) {
  console.error('Syntax error:', err);
}
