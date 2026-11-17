# -*- coding: utf-8 -*-
with open('public/dashboard.js', 'r', encoding='utf-8') as f:
    js = f.read()

target = 'function renderDashboardCards() {'
replacement = '''function renderDashboardCards() {
  fetchMatchHistoryFromDB().then(db => {
    const pill = document.getElementById('rw-total-db-matches');
    if (pill) {
      pill.textContent = (db.totalMatches || 0) + ' TRẬN';
    }
  });'''

if target in js:
    js = js.replace(target, replacement)
    with open('public/dashboard.js', 'w', encoding='utf-8') as f:
        f.write(js)
    print('Updated renderDashboardCards with DB match counter!')
