# -*- coding: utf-8 -*-
import json
import re

with open("public/index.html", "r", encoding="utf-8") as f:
    html = f.read()

# 1. Update provinces array with coordinates that strictly match vietnam_map.png
provinces_code = """const provinces = [
  // Miền Bắc
  {id:'lai_chau',   name:'Lai Châu',   region:'bac',   x:0.106, y:0.063, color:'#74b9ff'},
  {id:'dien_bien',  name:'Điện Biên',  region:'bac',   x:0.083, y:0.100, color:'#a8e6cf'},
  {id:'son_la',     name:'Sơn La',     region:'bac',   x:0.175, y:0.134, color:'#ffaaa5'},
  {id:'hoa_binh',   name:'Hòa Bình',   region:'bac',   x:0.307, y:0.163, color:'#81ecec'},
  {id:'lao_cai',    name:'Lào Cai',    region:'bac',   x:0.205, y:0.069, color:'#ff8b94'},
  {id:'yen_bai',    name:'Yên Bái',    region:'bac',   x:0.244, y:0.102, color:'#ffeaa7'},
  {id:'ha_giang',   name:'Hà Giang',   region:'bac',   x:0.277, y:0.034, color:'#dcedc1'},
  {id:'cao_bang',   name:'Cao Bằng',   region:'bac',   x:0.422, y:0.033, color:'#ffeaa7'},
  {id:'bac_kan',    name:'Bắc Kạn',   region:'bac',   x:0.383, y:0.063, color:'#74b9ff'},
  {id:'tuyen_quang',name:'Tuyên Quang',region:'bac',   x:0.314, y:0.077, color:'#ffd3b6'},
  {id:'thai_nguyen',name:'Thái Nguyên',region:'bac',   x:0.373, y:0.100, color:'#ffeaa7'},
  {id:'lang_son',   name:'Lạng Sơn',   region:'bac',   x:0.485, y:0.084, color:'#ffaaa5'},
  {id:'bac_giang',  name:'Bắc Giang',  region:'bac',   x:0.452, y:0.117, color:'#74b9ff'},
  {id:'quang_ninh', name:'Quảng Ninh', region:'bac',   x:0.568, y:0.132, color:'#dcedc1'},
  {id:'phu_tho',    name:'Phú Thọ',    region:'bac',   x:0.300, y:0.121, color:'#c5e1a5'},
  {id:'vinh_phuc',  name:'Vĩnh Phúc',  region:'bac',   x:0.343, y:0.115, color:'#a8e6cf'},
  {id:'bac_ninh',   name:'Bắc Ninh',   region:'bac',   x:0.419, y:0.128, color:'#fff59d'},
  {id:'ha_noi',     name:'HÀ NỘI',    region:'bac',   x:0.380, y:0.136, color:'#ff3838', isCapital:true},
  {id:'hai_duong',  name:'Hải Dương', region:'bac',   x:0.436, y:0.144, color:'#ffe082'},
  {id:'hai_phong',  name:'Hải Phòng', region:'bac',   x:0.498, y:0.157, color:'#80cbc4'},
  {id:'hung_yen',   name:'Hưng Yên',   region:'bac',   x:0.406, y:0.153, color:'#ce93d8'},
  {id:'ha_nam',     name:'Hà Nam',     region:'bac',   x:0.383, y:0.169, color:'#ffcc80'},
  {id:'nam_dinh',   name:'Nam Định',   region:'bac',   x:0.432, y:0.188, color:'#ffe082'},
  {id:'thai_binh',  name:'Thái Bình',  region:'bac',   x:0.459, y:0.172, color:'#ffab91'},
  {id:'ninh_binh',  name:'Ninh Bình',  region:'bac',   x:0.366, y:0.195, color:'#fff59d'},

  // Miền Trung
  {id:'thanh_hoa',   name:'Thanh Hóa',    region:'trung', x:0.323, y:0.220, color:'#ffeaa7'},
  {id:'nghe_an',     name:'Nghệ An',      region:'trung', x:0.274, y:0.262, color:'#ffaaa5'},
  {id:'ha_tinh',     name:'Hà Tĩnh',      region:'trung', x:0.347, y:0.322, color:'#ffeaa7'},
  {id:'quang_binh',  name:'Quảng Bình',   region:'trung', x:0.419, y:0.375, color:'#ffd3b6'},
  {id:'quang_tri',   name:'Quảng Trị',    region:'trung', x:0.485, y:0.418, color:'#81ecec'},
  {id:'thua_thien_hue',name:'Thừa Thiên Huế',region:'trung',x:0.551, y:0.446, color:'#74b9ff'},
  {id:'da_nang',     name:'Đà Nẵng',      region:'trung', x:0.614, y:0.460, color:'#fd79a8'},
  {id:'quang_nam',   name:'Quảng Nam',    region:'trung', x:0.614, y:0.494, color:'#a8e6cf'},
  {id:'quang_ngai',  name:'Quảng Ngãi',   region:'trung', x:0.696, y:0.523, color:'#74b9ff'},
  {id:'kon_tum',     name:'Kon Tum',      region:'trung', x:0.607, y:0.556, color:'#fff59d'},
  {id:'binh_dinh',   name:'Bình Định',    region:'trung', x:0.749, y:0.584, color:'#ffaaa5'},
  {id:'gia_lai',     name:'Gia Lai',      region:'trung', x:0.627, y:0.619, color:'#ffd3b6'},
  {id:'phu_yen',     name:'Phú Yên',      region:'trung', x:0.762, y:0.646, color:'#c5e1a5'},
  {id:'dak_lak',     name:'Đắk Lắk',      region:'trung', x:0.644, y:0.680, color:'#ffaaa5'},
  {id:'khanh_hoa',   name:'Khánh Hòa',    region:'trung', x:0.769, y:0.693, color:'#b0bec5'},
  {id:'dak_nong',    name:'Đắk Nông',     region:'trung', x:0.574, y:0.718, color:'#ffab91'},
  {id:'lam_dong',    name:'Lâm Đồng',     region:'trung', x:0.667, y:0.738, color:'#dcedc1'},
  {id:'ninh_thuan',  name:'Ninh Thuận',   region:'trung', x:0.752, y:0.739, color:'#ff8b94'},
  {id:'binh_thuan',  name:'Bình Thuận',   region:'trung', x:0.686, y:0.774, color:'#ffeaa7'},

  // Miền Nam
  {id:'binh_phuoc',   name:'Bình Phước',     region:'nam', x:0.502, y:0.747, color:'#dcedc1'},
  {id:'tay_ninh',     name:'Tây Ninh',       region:'nam', x:0.419, y:0.759, color:'#ffaaa5'},
  {id:'binh_duong',   name:'Bình Dương',     region:'nam', x:0.465, y:0.772, color:'#ffd3b6'},
  {id:'dong_nai',     name:'Đồng Nai',       region:'nam', x:0.531, y:0.789, color:'#81ecec'},
  {id:'ba_ria_vung_tau',name:'Vũng Tàu',    region:'nam', x:0.498, y:0.828, color:'#fd79a8'},
  {id:'tp_hcm',       name:'TP. HCM',        region:'nam', x:0.462, y:0.805, color:'#00cec9', isMajor:true},
  {id:'long_an',      name:'Long An',        region:'nam', x:0.413, y:0.812, color:'#ffeaa7'},
  {id:'tien_giang',   name:'Tiền Giang',     region:'nam', x:0.426, y:0.830, color:'#dcedc1'},
  {id:'dong_thap',    name:'Đồng Tháp',      region:'nam', x:0.350, y:0.816, color:'#ffaaa5'},
  {id:'an_giang',     name:'An Giang',       region:'nam', x:0.264, y:0.830, color:'#ffeaa7'},
  {id:'ben_tre',      name:'Bến Tre',        region:'nam', x:0.452, y:0.849, color:'#a8e6cf'},
  {id:'vinh_long',    name:'Vĩnh Long',      region:'nam', x:0.396, y:0.847, color:'#ffd3b6'},
  {id:'can_tho',      name:'Cần Thơ',        region:'nam', x:0.343, y:0.851, color:'#ffaaa5'},
  {id:'tra_vinh',     name:'Trà Vinh',       region:'nam', x:0.429, y:0.870, color:'#74b9ff'},
  {id:'hau_giang',    name:'Hậu Giang',      region:'nam', x:0.347, y:0.875, color:'#ffcc80'},
  {id:'soc_trang',    name:'Sóc Trăng',      region:'nam', x:0.393, y:0.895, color:'#c5e1a5'},
  {id:'kien_giang',   name:'Kiên Giang',     region:'nam', x:0.254, y:0.874, color:'#ff8b94'},
  {id:'bac_lieu',     name:'Bạc Liêu',       region:'nam', x:0.343, y:0.914, color:'#81ecec'},
  {id:'ca_mau',       name:'Cà Mau',         region:'nam', x:0.277, y:0.943, color:'#a8e6cf'}
];"""

html = re.sub(r'const provinces = \[.*?\];', provinces_code, html, flags=re.DOTALL)

# 2. Add map image preloading right before draw function or after resizeCanvas
if 'const mapImg = new Image();' not in html:
    map_load_code = """
/* Load bản đồ Việt Nam gốc từ ảnh */
const mapImg = new Image();
mapImg.src = 'vietnam_map.png';
"""
    html = html.replace("const canvas = document.getElementById('battle-canvas');", "const canvas = document.getElementById('battle-canvas');\n" + map_load_code)

# 3. Replace draw function to draw the map first and then points/units
new_draw_func = """function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // ---- 1. Vẽ ảnh bản đồ Việt Nam khớp chính xác theo khung canvas ----
  if(mapImg.complete && mapImg.naturalWidth > 0){
    // Vẽ bản đồ vừa vặn với chiều cao hoặc tỉ lệ chuẩn
    const mapAspect = mapImg.naturalWidth / mapImg.naturalHeight;
    const canvasAspect = canvas.width / canvas.height;
    let dw, dh, dx, dy;
    
    // Khớp bản đồ theo khung canvas
    if(canvasAspect > mapAspect){
      dh = canvas.height;
      dw = dh * mapAspect;
      dx = (canvas.width - dw) / 2;
      dy = 0;
    }else{
      dw = canvas.width;
      dh = dw / mapAspect;
      dx = 0;
      dy = (canvas.height - dh) / 2;
    }
    
    // Lưu thông số vẽ để tính tọa độ tỉnh chuẩn xác
    window.mapBounds = { dx, dy, dw, dh };
    ctx.drawImage(mapImg, dx, dy, dw, dh);
  }

  const b = window.mapBounds || { dx: 0, dy: 0, dw: canvas.width, dh: canvas.height };

  // ---- 2. Vẽ điểm căn cứ các tỉnh (vòng tròn màu nhẹ và tên tỉnh) ----
  for(const p of provinces){
    const px = b.dx + p.x * b.dw;
    const py = b.dy + p.y * b.dh;
    p._cx = px;
    p._cy = py;

    // Vòng tròn định vị tỉnh
    ctx.beginPath();
    ctx.arc(px, py, p.isCapital ? 7 : (p.isMajor ? 6 : 4), 0, Math.PI*2);
    ctx.fillStyle = p.color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = p.isCapital ? 2 : 1;
    ctx.stroke();

    // Tên tỉnh
    ctx.fillStyle = p.isCapital ? '#ff3838' : '#ffffff';
    ctx.font = (p.isCapital ? 'bold 11px' : (p.isMajor ? 'bold 10px' : '9px')) + ' sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 4;
    ctx.fillText(p.name, px, py - (p.isCapital ? 9 : 6));
    ctx.shadowBlur = 0;
  }

  // ---- 3. Hiệu ứng shockwave / tia lửa ----
  for(const e of effects){
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.radius, 0, Math.PI*2);
    ctx.strokeStyle = e.color;
    ctx.globalAlpha = Math.max(0, e.alpha);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // ---- 4. Vẽ các đơn vị (lính) ----
  for(const u of units){
    const prov = provinces.find(p=>p.id===u.provinceId);
    ctx.beginPath();
    ctx.arc(u.x, u.y, u.radius, 0, Math.PI*2);
    ctx.fillStyle = provinceColor(prov);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = u.type==='boss' ? 3 : 1;
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = (u.type==='boss' ? 'bold 11px' : '9px') + ' sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 3;
    ctx.fillText(u.user, u.x, u.y - u.radius - 4);
    ctx.shadowBlur = 0;
  }

  requestAnimationFrame(()=>{ update(); draw(); });
}"""

html = re.sub(r'function draw\(\)\s*\{.*?\n\}', new_draw_func, html, flags=re.DOTALL)

# 4. In spawnUnit, spawn soldiers at the calculated map position
spawn_unit_code = """function spawnUnit(prov, user, type){
  const cfg = {
    soldier:{hp:30,spd:1.4,atk:1,r:6},
    cavalry:{hp:80,spd:2.2,atk:2,r:9},
    boss   :{hp:300,spd:0.9,atk:4,r:14}
  }[type];

  const b = window.mapBounds || { dx: 0, dy: 0, dw: canvas.width, dh: canvas.height };
  const pos = { x: prov._cx || (b.dx + prov.x * b.dw),
                y: prov._cy || (b.dy + prov.y * b.dh) };

  units.push({
    provinceId:prov.id,
    user,
    x: pos.x + Math.random()*20-10,
    y: pos.y + Math.random()*20-10,
    radius: cfg.r,
    hp: cfg.hp,
    maxHp: cfg.hp,
    speed: cfg.spd,
    attack: cfg.atk,
    type
  });
}"""

html = re.sub(r'function spawnUnit\(prov, user, type\)\s*\{.*?\n\}', spawn_unit_code, html, flags=re.DOTALL)

with open("public/index.html", "w", encoding="utf-8") as f:
    f.write(html)

print("Updated public/index.html successfully!")
