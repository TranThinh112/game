with open('public/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

helper_js = '''
// ==================================================================
// TIKTOK LIVE HUD INTERACTION HELPERS (NON-INVASIVE)
// ==================================================================
function toggleTikTokLeaderboard(){
  const hud = document.getElementById('tiktok-leaderboard-hud');
  const btn = document.getElementById('tiktok-lb-toggle-btn');
  if(!hud) return;
  hud.classList.toggle('collapsed');
  if(btn){
    btn.textContent = hud.classList.contains('collapsed') ? '◀' : '▶';
  }
}

function updateTikTokHUD(sortedEmpires){
  const listEl = document.getElementById('tiktok-lb-list');
  if(!listEl) return;
  
  if(!sortedEmpires || sortedEmpires.length === 0){
    listEl.innerHTML = '<div style=\"font-size:10px;color:#94a3b8;padding:4px;\">Đang nạp dữ liệu...</div>';
    return;
  }
  
  const topList = sortedEmpires.slice(0, 5);
  listEl.innerHTML = topList.map((emp, idx) => {
    const rankNum = (idx + 1) < 10 ? '0' + (idx + 1) : '' + (idx + 1);
    return '<div class=\"tiktok-lb-row\">' +
      '<span class=\"tiktok-lb-rank\">' + rankNum + '</span>' +
      '<div class=\"tiktok-lb-info\">' +
        '<span style=\"width:6px;height:6px;border-radius:50%;background:' + emp.color + ';flex-shrink:0;\"></span>' +
        '<span class=\"tiktok-lb-name\">' + emp.name + '</span>' +
        '<span class=\"tiktok-lb-plate\">' + emp.plate + '</span>' +
      '</div>' +
      '<span class=\"tiktok-lb-hp\">' + emp.count + '</span>' +
    '</div>';
  }).join('');
}

function showTikTokActivity(user, text, isGift = false){
  const stream = document.getElementById('tiktok-activity-stream');
  if(!stream) return;
  
  const chip = document.createElement('div');
  chip.className = 'tiktok-activity-chip' + (isGift ? ' gift' : '');
  chip.innerHTML = (isGift ? '🎁 ' : '💬 ') + '<strong>' + user + '</strong> ' + text;
  
  stream.appendChild(chip);
  
  setTimeout(() => {
    if(chip.parentNode) chip.parentNode.removeChild(chip);
  }, 4000);
  
  while(stream.children.length > 3){
    stream.removeChild(stream.firstChild);
  }
}

// Giả lập nhảy số lượng Viewer tham gia tăng độ kịch tính theo thời gian
setInterval(() => {
  const viewerEl = document.getElementById('tiktok-live-viewers');
  if(viewerEl){
    let cur = parseInt(viewerEl.textContent) || 240;
    let delta = Math.floor(Math.random() * 5) - 2;
    let nextVal = Math.max(180, cur + delta);
    viewerEl.textContent = nextVal;
  }
}, 4500);
'''

# Chèn helper_js trước updateLeaderboard
needle = 'function updateLeaderboard(){'
if needle in html and 'toggleTikTokLeaderboard' not in html:
    html = html.replace(needle, helper_js + '\n' + needle)
    print('Helper JS added!')

# Gọi updateTikTokHUD(sortedEmpires) bên trong updateLeaderboard
lb_needle = 'tbody.innerHTML = sortedEmpires.map((emp, idx) => {'
if lb_needle in html and 'updateTikTokHUD(sortedEmpires);' not in html:
    html = html.replace(lb_needle, 'updateTikTokHUD(sortedEmpires);\n  ' + lb_needle)
    print('updateTikTokHUD call injected!')

# Gọi showTikTokActivity trong addChat
chat_needle = 'function addChat(user,msg){\n  const chat = document.getElementById(\'chat-stream\');'
if chat_needle in html and 'showTikTokActivity' not in html:
    chat_replacement = '''function addChat(user,msg){
  if(user !== 'HỆ THỐNG') {
    showTikTokActivity(user, msg, false);
  }
  const chat = document.getElementById('chat-stream');'''
    html = html.replace(chat_needle, chat_replacement)
    print('addChat hooked with showTikTokActivity!')

with open('public/index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('SUCCESS!')
