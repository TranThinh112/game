# -*- coding: utf-8 -*-
import sys, json, re

print('Reading public/index.html.backup_qk...')
with open('public/index.html.backup_qk', 'r', encoding='utf-8') as f:
    text = f.read()

print('Initial length:', len(text))
