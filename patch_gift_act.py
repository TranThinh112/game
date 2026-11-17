with open('public/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

target = 'addWarLog(\'🌹 [\' + data.user + \'] gửi quà tiếp viện +50 HP cho [\' + tgtProv.name + \']!\', \'log-info\');'
replacement = '''addWarLog('🌹 [' + data.user + '] gửi quà tiếp viện +50 HP cho [' + tgtProv.name + ']!', 'log-info');
      if(typeof showTikTokActivity === 'function') showTikTokActivity(data.user, 'tặng quà tiếp viện cho ' + tgtProv.name, true);'''

if target in html:
    html = html.replace(target, replacement)
    with open('public/index.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print('Gift activity connected!')
else:
    print('Target not found')
