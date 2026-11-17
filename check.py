# -*- coding: utf-8 -*-
with open('public/index.html', 'r', encoding='utf-8') as f:
    text = f.read()
print('MILITARY_ZONES in text:', 'MILITARY_ZONES' in text)
