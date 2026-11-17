# -*- coding: utf-8 -*-
import json
import re

with open("public/index.html", "r", encoding="utf-8") as f:
    html = f.read()

# Update provinces array with plate and name
provinces_code = """const provinces = [
  // Miền Bắc
  {id:'lai_chau',   name:'Lai Châu',   plate:'25', region:'bac',   x:0.106, y:0.063, color:'#74b9ff'},
  {id:'dien_bien',  name:'Điện Biên',  plate:'27', region:'bac',   x:0.083, y:0.100, color:'#a8e6cf'},
  {id:'son_la',     name:'Sơn La',     plate:'26', region:'bac',   x:0.175, y:0.134, color:'#ffaaa5'},
  {id:'hoa_binh',   name:'Hòa Bình',   plate:'28', region:'bac',   x:0.307, y:0.163, color:'#81ecec'},
  {id:'lao_cai',    name:'Lào Cai',    plate:'24', region:'bac',   x:0.205, y:0.069, color:'#ff8b94'},
  {id:'yen_bai',    name:'Yên Bái',    plate:'21', region:'bac',   x:0.244, y:0.102, color:'#ffeaa7'},
  {id:'ha_giang',   name:'Hà Giang',   plate:'23', region:'bac',   x:0.277, y:0.034, color:'#dcedc1'},
  {id:'cao_bang',   name:'Cao Bằng',   plate:'11', region:'bac',   x:0.422, y:0.033, color:'#ffeaa7'},
  {id:'bac_kan',    name:'Bắc Kạn',   plate:'97', region:'bac',   x:0.383, y:0.063, color:'#74b9ff'},
  {id:'tuyen_quang',name:'Tuyên Quang',plate:'22', region:'bac',   x:0.314, y:0.077, color:'#ffd3b6'},
  {id:'thai_nguyen',name:'Thái Nguyên',plate:'20', region:'bac',   x:0.373, y:0.100, color:'#ffeaa7'},
  {id:'lang_son',   name:'Lạng Sơn',   plate:'12', region:'bac',   x:0.485, y:0.084, color:'#ffaaa5'},
  {id:'bac_giang',  name:'Bắc Giang',  plate:'98', region:'bac',   x:0.452, y:0.117, color:'#74b9ff'},
  {id:'quang_ninh', name:'Quảng Ninh', plate:'14', region:'bac',   x:0.568, y:0.132, color:'#dcedc1'},
  {id:'phu_tho',    name:'Phú Thọ',    plate:'19', region:'bac',   x:0.300, y:0.121, color:'#c5e1a5'},
  {id:'vinh_phuc',  name:'Vĩnh Phúc',  plate:'88', region:'bac',   x:0.343, y:0.115, color:'#a8e6cf'},
  {id:'bac_ninh',   name:'Bắc Ninh',   plate:'99', region:'bac',   x:0.419, y:0.128, color:'#fff59d'},
  {id:'ha_noi',     name:'Hà Nội',     plate:'30', region:'bac',   x:0.380, y:0.136, color:'#ff3838', isCapital:true},
  {id:'hai_duong',  name:'Hải Dương',  plate:'34', region:'bac',   x:0.436, y:0.144, color:'#ffe082'},
  {id:'hai_phong',  name:'Hải Phòng',  plate:'15', region:'bac',   x:0.498, y:0.157, color:'#80cbc4'},
  {id:'hung_yen',   name:'Hưng Yên',   plate:'89', region:'bac',   x:0.406, y:0.153, color:'#ce93d8'},
  {id:'ha_nam',     name:'Hà Nam',     plate:'90', region:'bac',   x:0.383, y:0.169, color:'#ffcc80'},
  {id:'nam_dinh',   name:'Nam Định',   plate:'18', region:'bac',   x:0.432, y:0.188, color:'#ffe082'},
  {id:'thai_binh',  name:'Thái Bình',  plate:'17', region:'bac',   x:0.459, y:0.172, color:'#ffab91'},
  {id:'ninh_binh',  name:'Ninh Bình',  plate:'35', region:'bac',   x:0.366, y:0.195, color:'#fff59d'},

  // Miền Trung
  {id:'thanh_hoa',   name:'Thanh Hóa',    plate:'36', region:'trung', x:0.323, y:0.220, color:'#ffeaa7'},
  {id:'nghe_an',     name:'Nghệ An',      plate:'37', region:'trung', x:0.274, y:0.262, color:'#ffaaa5'},
  {id:'ha_tinh',     name:'Hà Tĩnh',      plate:'38', region:'trung', x:0.347, y:0.322, color:'#ffeaa7'},
  {id:'quang_binh',  name:'Quảng Bình',   plate:'73', region:'trung', x:0.419, y:0.375, color:'#ffd3b6'},
  {id:'quang_tri',   name:'Quảng Trị',    plate:'74', region:'trung', x:0.485, y:0.418, color:'#81ecec'},
  {id:'thua_thien_hue',name:'Thừa Thiên Huế',plate:'75',region:'trung',x:0.551, y:0.446, color:'#74b9ff'},
  {id:'da_nang',     name:'Đà Nẵng',      plate:'43', region:'trung', x:0.614, y:0.460, color:'#fd79a8'},
  {id:'quang_nam',   name:'Quảng Nam',    plate:'92', region:'trung', x:0.614, y:0.494, color:'#a8e6cf'},
  {id:'quang_ngai',  name:'Quảng Ngãi',   plate:'76', region:'trung', x:0.696, y:0.523, color:'#74b9ff'},
  {id:'kon_tum',     name:'Kon Tum',      plate:'82', region:'trung', x:0.607, y:0.556, color:'#fff59d'},
  {id:'binh_dinh',   name:'Bình Định',    plate:'77', region:'trung', x:0.749, y:0.584, color:'#ffaaa5'},
  {id:'gia_lai',     name:'Gia Lai',      plate:'81', region:'trung', x:0.627, y:0.619, color:'#ffd3b6'},
  {id:'phu_yen',     name:'Phú Yên',      plate:'78', region:'trung', x:0.762, y:0.646, color:'#c5e1a5'},
  {id:'dak_lak',     name:'Đắk Lắk',      plate:'47', region:'trung', x:0.644, y:0.680, color:'#ffaaa5'},
  {id:'khanh_hoa',   name:'Khánh Hòa',    plate:'79', region:'trung', x:0.769, y:0.693, color:'#b0bec5'},
  {id:'dak_nong',    name:'Đắk Nông',     plate:'48', region:'trung', x:0.574, y:0.718, color:'#ffab91'},
  {id:'lam_dong',    name:'Lâm Đồng',     plate:'49', region:'trung', x:0.667, y:0.738, color:'#dcedc1'},
  {id:'ninh_thuan',  name:'Ninh Thuận',   plate:'85', region:'trung', x:0.752, y:0.739, color:'#ff8b94'},
  {id:'binh_thuan',  name:'Bình Thuận',   plate:'86', region:'trung', x:0.686, y:0.774, color:'#ffeaa7'},

  // Miền Nam
  {id:'binh_phuoc',   name:'Bình Phước',     plate:'93', region:'nam', x:0.502, y:0.747, color:'#dcedc1'},
  {id:'tay_ninh',     name:'Tây Ninh',       plate:'70', region:'nam', x:0.419, y:0.759, color:'#ffaaa5'},
  {id:'binh_duong',   name:'Bình Dương',     plate:'61', region:'nam', x:0.465, y:0.772, color:'#ffd3b6'},
  {id:'dong_nai',     name:'Đồng Nai',       plate:'60', region:'nam', x:0.531, y:0.789, color:'#81ecec'},
  {id:'ba_ria_vung_tau',name:'Vũng Tàu',    plate:'72', region:'nam', x:0.498, y:0.828, color:'#fd79a8'},
  {id:'tp_hcm',       name:'TP. HCM',        plate:'51', region:'nam', x:0.462, y:0.805, color:'#00cec9', isMajor:true},
  {id:'long_an',      name:'Long An',        plate:'62', region:'nam', x:0.413, y:0.812, color:'#ffeaa7'},
  {id:'tien_giang',   name:'Tiền Giang',     plate:'63', region:'nam', x:0.426, y:0.830, color:'#dcedc1'},
  {id:'dong_thap',    name:'Đồng Tháp',      plate:'66', region:'nam', x:0.350, y:0.816, color:'#ffaaa5'},
  {id:'an_giang',     name:'An Giang',       plate:'67', region:'nam', x:0.264, y:0.830, color:'#ffeaa7'},
  {id:'ben_tre',      name:'Bến Tre',        plate:'71', region:'nam', x:0.452, y:0.849, color:'#a8e6cf'},
  {id:'vinh_long',    name:'Vĩnh Long',      plate:'64', region:'nam', x:0.396, y:0.847, color:'#ffd3b6'},
  {id:'can_tho',      name:'Cần Thơ',        plate:'65', region:'nam', x:0.343, y:0.851, color:'#ffaaa5'},
  {id:'tra_vinh',     name:'Trà Vinh',       plate:'84', region:'nam', x:0.429, y:0.870, color:'#74b9ff'},
  {id:'hau_giang',    name:'Hậu Giang',      plate:'95', region:'nam', x:0.347, y:0.875, color:'#ffcc80'},
  {id:'soc_trang',    name:'Sóc Trăng',      plate:'83', region:'nam', x:0.393, y:0.895, color:'#c5e1a5'},
  {id:'kien_giang',   name:'Kiên Giang',     plate:'68', region:'nam', x:0.254, y:0.874, color:'#ff8b94'},
  {id:'bac_lieu',     name:'Bạc Liêu',       plate:'94', region:'nam', x:0.343, y:0.914, color:'#81ecec'},
  {id:'ca_mau',       name:'Cà Mau',         plate:'69', region:'nam', x:0.277, y:0.943, color:'#a8e6cf'}
];"""

html = re.sub(r'const provinces = \[.*?\];', provinces_code, html, flags=re.DOTALL)

# Update draw function to draw license plate badge instead of province name
new_draw_func = """function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // ---- 1. Vẽ ảnh bản đồ Việt Nam gốc ----
  if(mapImg.complete && mapImg.naturalWidth > 0){
    const mapAspect = mapImg.naturalWidth / mapImg.naturalHeight;
    const canvasAspect = canvas.width / canvas.height;
    let dw, dh, dx, dy;
    
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
    
    window.mapBounds = { dx, dy, dw, dh };
    ctx.drawImage(mapImg, dx, dy, dw, dh);
  }

  const b = window.mapBounds || { dx: 0, dy: 0, dw: canvas.width, dh: canvas.height };

  // ---- 2. Vẽ biển số xe của từng tỉnh (xóa tên tỉnh, chỉ hiển thị số xe) ----
  for(const p of provinces){
    const px = b.dx + p.x * b.dw;
    const py = b.dy + p.y * b.dh;
    p._cx = px;
    p._cy = py;

    const r = p.isCapital ? 10 : (p.isMajor ? 9 : 8);

    // Vòng tròn nền có màu viền đẹp mắt
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI*2);
    ctx.fillStyle = p.isCapital ? 'rgba(239, 68, 68, 0.85)' : 'rgba(15, 23, 42, 0.85)';
    ctx.fill();
    ctx.strokeStyle = p.color || '#38bdf8';
    ctx.lineWidth = p.isCapital ? 2 : 1.5;
    ctx.stroke();

    // Biển số xe hiển thị ở tâm
    ctx.fillStyle = '#ffffff';
    ctx.font = (p.isCapital ? 'bold 10px' : 'bold 9px') + ' sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p.plate, px, py);
  }
  ctx.textBaseline = 'alphabetic'; // reset

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

with open("public/index.html", "w", encoding="utf-8") as f:
    f.write(html)

print("Updated public/index.html with license plates successfully!")
