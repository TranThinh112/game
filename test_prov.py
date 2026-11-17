# -*- coding: utf-8 -*-
import json, re

with open('public/index.html.backup_qk', 'r', encoding='utf-8') as f:
    text = f.read()

qk_mapping = {
    'ha_noi': 'btl_thu_do',
    'bac_ninh': 'qk1', 'bac_giang': 'qk1', 'lang_son': 'qk1', 'cao_bang': 'qk1', 'bac_kan': 'qk1', 'thai_nguyen': 'qk1',
    'ha_giang': 'qk2', 'lao_cai': 'qk2', 'lai_chau': 'qk2', 'dien_bien': 'qk2', 'son_la': 'qk2', 'yen_bai': 'qk2', 'tuyen_quang': 'qk2', 'phu_tho': 'qk2', 'vinh_phuc': 'qk2',
    'hai_phong': 'qk3', 'quang_ninh': 'qk3', 'hai_duong': 'qk3', 'hung_yen': 'qk3', 'thai_binh': 'qk3', 'nam_dinh': 'qk3', 'ha_nam': 'qk3', 'ninh_binh': 'qk3', 'hoa_binh': 'qk3',
    'thanh_hoa': 'qk4', 'nghe_an': 'qk4', 'ha_tinh': 'qk4', 'quang_binh': 'qk4', 'quang_tri': 'qk4', 'thua_thien_hue': 'qk4',
    'da_nang': 'qk5', 'quang_nam': 'qk5', 'quang_ngai': 'qk5', 'binh_dinh': 'qk5', 'phu_yen': 'qk5', 'khanh_hoa': 'qk5', 'ninh_thuan': 'qk5', 'kon_tum': 'qk5', 'gia_lai': 'qk5', 'dak_lak': 'qk5', 'dak_nong': 'qk5',
    'tp_hcm': 'qk7', 'ba_ria_vung_tau': 'qk7', 'binh_duong': 'qk7', 'binh_phuoc': 'qk7', 'dong_nai': 'qk7', 'tay_ninh': 'qk7', 'binh_thuan': 'qk7', 'lam_dong': 'qk7', 'long_an': 'qk7',
    'can_tho': 'qk9', 'an_giang': 'qk9', 'dong_thap': 'qk9', 'tien_giang': 'qk9', 'ben_tre': 'qk9', 'vinh_long': 'qk9', 'tra_vinh': 'qk9', 'hau_giang': 'qk9', 'soc_trang': 'qk9', 'bac_lieu': 'qk9', 'ca_mau': 'qk9', 'kien_giang': 'qk9'
}

m_prov = re.search(r'const provinces = (\[.*?\]);', text)
provs = json.loads(m_prov.group(1))
for p in provs:
    p['militaryZone'] = qk_mapping[p['id']]
    if p['id'] == 'ha_noi':
        p['hp'] = 1500
        p['maxHp'] = 1500
    else:
        p['hp'] = 1000
        p['maxHp'] = 1000

new_provs_json = json.dumps(provs, ensure_ascii=False)
text = text[:m_prov.start()] + f'const provinces = {new_provs_json};' + text[m_prov.end():]

m_init = re.search(r'const INITIAL_PROVINCES = JSON\.parse\(JSON\.stringify\((\[.*?\])\)\);', text)
text = text[:m_init.start()] + f'const INITIAL_PROVINCES = JSON.parse(JSON.stringify({new_provs_json}));' + text[m_init.end():]

print('Updated provinces successfully. Length:', len(text))
