with open('public/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

target = 'function addChat(user,msg){\n  const c = document.getElementById(\'chat-stream\');'
replacement = '''function addChat(user,msg){
  if(user !== 'HỆ THỐNG' && typeof showTikTokActivity === 'function') {
    showTikTokActivity(user, msg, false);
  }
  const c = document.getElementById('chat-stream');'''

if target in html:
    html = html.replace(target, replacement)
    with open('public/index.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print('addChat hooked successfully!')
else:
    print('addChat target not found!')
