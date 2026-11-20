

/* ========================================================================== */

/*                RAILWAY DASHBOARD & ROUTER CONTROLLER ENGINE                */

/* ========================================================================== */



window.MAPS_CATALOG = [

  {

    id: "vietnam_63",

    name: "Đại Chiến 63 Tỉnh Thành",

    code: "VN-63-ALL",

    tag: "Chính Thức",

    badge: "63 PROVINCES",

    desc: "Toàn bộ 63 tỉnh thành Việt Nam cùng Hoàng Sa, Trường Sa và Côn Đảo. Chế độ tranh đoạt lãnh thổ tối cao.",

    status: "production",

    serviceOnline: "1/1 map active",

    icon: "🇻🇳",

    subIcon: "⚔️",

    totalProvinces: 63,

    regionMode: "Phân vùng khi hợp nhất: 7 Quân Khu",

    activePlayable: true

  },

  {

    id: "mien_bac",

    name: "Chiến Khu Miền Bắc",

    code: "VN-NORTH-25",

    tag: "Đồng Bằng & Vùng Núi",

    badge: "25 TỈNH",

    desc: "Tập trung 25 tỉnh thành miền Bắc với trung tâm đầu não Thủ Đô Hà Nội và Vùng núi Tây Bắc, Đông Bắc.",

    status: "production",

    serviceOnline: "1/1 map active",

    icon: "🏔️",

    subIcon: "🛡️",

    totalProvinces: 25,

    regionMode: "Miền Bắc",

    activePlayable: true

  },

  {

    id: "mien_trung",

    name: "Mặt Trận Miền Trung",

    code: "VN-CENTRAL-19",

    tag: "Duyên Hải & Tây Nguyên",

    badge: "19 TỈNH",

    desc: "19 tỉnh thành duyên hải miền Trung và cao nguyên đất đỏ Tây Nguyên. Địa hình hiểm trở kéo dài.",

    status: "production",

    serviceOnline: "1/1 map active",

    icon: "🌊",

    subIcon: "🏖️",

    totalProvinces: 19,

    regionMode: "Miền Trung",

    activePlayable: true

  },

  {

    id: "mien_nam",

    name: "Nam Bộ Khởi Sắc",

    code: "VN-SOUTH-19",

    tag: "Đông Nam Bộ & Miền Tây",

    badge: "19 TỈNH",

    desc: "19 tỉnh thành Nam Bộ bao gồm TP. Hồ Chí Minh phồn hoa và miền Tây sông nước Cửu Long.",

    status: "production",

    serviceOnline: "1/1 map active",

    icon: "🌴",

    subIcon: "🚤",

    totalProvinces: 19,

    regionMode: "Miền Nam",

    activePlayable: true

  },

  {

    id: "hoang_sa_truong_sa",

    name: "Hải Chiến Biển Đảo",

    code: "VN-ISLANDS-SEAS",

    tag: "Quần Đảo & Duyên Hải",

    badge: "HẢI PHÒNG - BIỂN ĐÔNG",

    desc: "Mặt trận hải quân pháo kích quần đảo Hoàng Sa, Trường Sa, Côn Đảo và 28 tỉnh thành giáp biển.",

    status: "production",

    serviceOnline: "2/2 services online",

    icon: "⚓",

    subIcon: "🚢",

    totalProvinces: 28,

    regionMode: "Duyên Hải Biển Đảo",

    activePlayable: true

  },

  {

    id: "tam_ma_tranh_hung",

    name: "Tam Mã Tranh Hùng",

    code: "VN-TRIO-CAPITALS",

    tag: "3 Đại Đô Thị",

    badge: "HÀ NỘI - ĐÀ NẴNG - TP.HCM",

    desc: "Tam giác kinh tế - chính trị - văn hóa tối thượng với 3 siêu đô thị làm trung tâm chỉ huy.",

    status: "production",

    serviceOnline: "1/1 map active",

    icon: "👑",

    subIcon: "⚡",

    totalProvinces: 63,

    regionMode: "3 Đại Trụ Cột",

    activePlayable: true

  }

];



// ==========================================================================

// KET NOI PERSISTENT DATABASE CHO LICH SU TRAN DAU & BANG XEP HANG

// ==========================================================================

let cachedMatchData = {

  history: [],

  leaderboards: [],

  totalMatches: 0

};



async function fetchMatchHistoryFromDB() {

  try {

    const res = await fetch('/api/matches');

    if (res.ok) {

      const data = await res.json();

      cachedMatchData = data;

      return data;

    }

  } catch(e) {

    console.warn('[MATCH_DB] Chua the ket noi API:', e.message);

  }

  return cachedMatchData;

}



async function recordMatchWinner(winnerProv) {

  if (!winnerProv) return;

  const name = winnerProv.name || 'Vo dich';

  const plate = winnerProv.plate || '';

  const color = winnerProv.color || '#facc15';

  const mapId = window.currentSelectedMapId || 'vietnam_63';



  try {

    const res = await fetch('/api/matches', {

      method: 'POST',

      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify({

        matchId: window.currentMatchId || null,

        winnerName: name,

        winnerPlate: plate,

        color: color,

        mapId: mapId

      })

    });

    if (res.ok) {

      console.log('[MATCH_DB] Da luu ket qua vao Database Server thanh cong!');

      await fetchMatchHistoryFromDB();

    }

  } catch (err) {

    console.error('[MATCH_DB] Loi khi luu database:', err.message);

  }

}

window.recordMatchWinner = recordMatchWinner;



function renderMiniMapToCanvas(canvasEl, mapType) {

  if (!canvasEl) return;

  const ctx = canvasEl.getContext("2d");

  if (!ctx) return;



  const rect = canvasEl.getBoundingClientRect();

  const w = canvasEl.width = Math.max(340, canvasEl.clientWidth || Math.round(rect.width) || 380);
  const h = canvasEl.height = (canvasEl.id === "rw-detail-canvas" ? 520 : Math.max(200, canvasEl.clientHeight || Math.round(rect.height) || 200));



  const isDetail = (canvasEl.id === "rw-detail-canvas");



  // 0. To mau nen hai do gradient chuan #live

  const oceanGrad = ctx.createLinearGradient(0, 0, 0, h);

  oceanGrad.addColorStop(0, "#090e1f");

  oceanGrad.addColorStop(1, "#030611");

  ctx.fillStyle = oceanGrad;

  ctx.fillRect(0, 0, w, h);



  // 1. Luoi kinh vi tuyen hai do dac trung cua phong tac chien (War Room grid)

  ctx.save();

  ctx.strokeStyle = "rgba(56, 189, 248, 0.045)";

  ctx.lineWidth = 1;

  const gridStep = isDetail ? 36 : 28;

  for (let gx = 0; gx < w; gx += gridStep) {

    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke();

  }

  for (let gy = 0; gy < h; gy += gridStep) {

    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();

  }

  ctx.restore();



  // HE TRUC TOA DO DUA TREN INDEX.HTML

  // Chuẩn GEO_BOUNDS đất liền Việt Nam

  let bounds = {

    minLon: 102.14,

    maxLon: 109.50,

    minLat: 8.44,

    maxLat: 23.40

  };



  let regionBoundsScale = 1.0;

  if (mapType === "mien_bac") {

    bounds = { minLon: 102.0, maxLon: 108.5, minLat: 19.5, maxLat: 23.5 };

  } else if (mapType === "mien_trung") {

    bounds = { minLon: 105.0, maxLon: 110.0, minLat: 13.5, maxLat: 20.0 };

  } else if (mapType === "mien_nam") {

    bounds = { minLon: 104.0, maxLon: 108.5, minLat: 8.4, maxLat: 13.2 };

  }



  const pad = isDetail ? 12 : 8;

  const availW = w - pad * 2;

  const availH = h - pad;



  const geoW = (bounds.maxLon - bounds.minLon) * 1.02;

  const geoH = (bounds.maxLat - bounds.minLat);



  // Scale de khop tron ven S-curve

  const scaleX = availW / geoW;

  const scaleY = availH / (geoH + 0.85);

  const baseScale = Math.min(scaleX, scaleY);



  const drawW = geoW * baseScale;

  const baseOffsetX = (w - drawW) / 2;

  // Day bien gioi phia Bac sat len dinh canvas y=0 giong y het tran dau thuc te

  const baseOffsetY = 0.85 * baseScale;



  function toScreen(lon, lat) {

    const normX = (lon - bounds.minLon) / (bounds.maxLon - bounds.minLon);

    const normY = (bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat);

    const sx = baseOffsetX + normX * ((bounds.maxLon - bounds.minLon) * 1.02 * baseScale);

    const sy = baseOffsetY + normY * ((bounds.maxLat - bounds.minLat) * baseScale);

    return { x: sx, y: sy };

  }



  function drawFlagStar(c, cx, cy, spikes, outerRadius, innerRadius, rotOffset) {

    let rot = (rotOffset !== undefined) ? rotOffset : -Math.PI / 2;

    const stp = Math.PI / spikes;

    c.beginPath();

    c.moveTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);

    for (let i = 0; i < spikes; i++) {

      c.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);

      rot += stp;

      c.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);

      rot += stp;

    }

    c.closePath();

    c.fill();

  }



  function drawBadgeBoxHelper(c, x, y, width, height, radius) {

    c.beginPath();

    c.moveTo(x + radius, y);

    c.lineTo(x + width - radius, y);

    c.quadraticCurveTo(x + width, y, x + width, y + radius);

    c.lineTo(x + width, y + height - radius);

    c.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);

    c.lineTo(x + radius, y + height);

    c.quadraticCurveTo(x, y + height, x, y + height - radius);

    c.lineTo(x, y + radius);

    c.quadraticCurveTo(x, y, x + radius, y);

    c.closePath();

  }



  // 2. VE NUOC LANG GIENG CO CO QUOC GIA (TRUNG QUOC, LAO, CAMPUCHIA, THAILAND, MYANMAR)

  const neighborData = (typeof NEIGHBOR_COUNTRIES !== "undefined") ? NEIGHBOR_COUNTRIES : (window.NEIGHBOR_COUNTRIES || []);

  if (neighborData && neighborData.length > 0) {

    for (const country of neighborData) {

      if (!country.polygons || country.polygons.length === 0) continue;

      const cutLat = (country.flagType === "china") ? 24.25 : null;



      let sMinX = Infinity, sMaxX = -Infinity, sMinY = Infinity, sMaxY = -Infinity;

      for (const ring of country.polygons) {

        for (let i = 0; i < ring.length; i += 2) {

          const ptLat = (cutLat !== null) ? Math.min(cutLat, ring[i][1]) : ring[i][1];

          const p = toScreen(ring[i][0], ptLat);

          if (p.x < sMinX) sMinX = p.x;

          if (p.x > sMaxX) sMaxX = p.x;

          if (p.y < sMinY) sMinY = p.y;

          if (p.y > sMaxY) sMaxY = p.y;

        }

      }



      if (sMaxX < -100 || sMinX > w + 100 || sMaxY < -100 || sMinY > h + 100) continue;



      const cW = sMaxX - sMinX;

      const cH = sMaxY - sMinY;



      ctx.save();

      // Step A: Clip theo da giac lanh tho

      ctx.beginPath();

      for (const ring of country.polygons) {

        if (!ring || ring.length < 3) continue;

        const p0Lat = (cutLat !== null) ? Math.min(cutLat, ring[0][1]) : ring[0][1];

        const p0 = toScreen(ring[0][0], p0Lat);

        ctx.moveTo(p0.x, p0.y);

        for (let i = 1; i < ring.length; i++) {

          const ptLat = (cutLat !== null) ? Math.min(cutLat, ring[i][1]) : ring[i][1];

          const pt = toScreen(ring[i][0], ptLat);

          ctx.lineTo(pt.x, pt.y);

        }

        ctx.closePath();

      }

      ctx.clip();



      // Step B: To co quoc gia giong y het tran dau index.html

      if (country.flagType === "china") {

        ctx.fillStyle = "rgba(204, 0, 0, 0.28)";

        ctx.fillRect(sMinX - 20, sMinY - 20, cW + 40, cH + 40);



        const starAnchor = toScreen(100.3, 23.35);

        const starBaseScale = isDetail ? 16 : 9;

        ctx.fillStyle = "rgba(255, 222, 0, 0.70)";

        const bigR = starBaseScale * 1.5;

        drawFlagStar(ctx, starAnchor.x, starAnchor.y, 5, bigR, bigR * 0.38, -Math.PI / 2);



        const smR = bigR / 3;

        const smallStarOffsets = [

          { dx: 1.67 * bigR, dy: -1.00 * bigR },

          { dx: 2.33 * bigR, dy: -0.33 * bigR },

          { dx: 2.33 * bigR, dy:  0.67 * bigR },

          { dx: 1.67 * bigR, dy:  1.33 * bigR }

        ];

        for (const pos of smallStarOffsets) {

          const sx = starAnchor.x + pos.dx;

          const sy = starAnchor.y + pos.dy;

          const pointAngle = Math.atan2(starAnchor.y - sy, starAnchor.x - sx) - Math.PI / 2;

          drawFlagStar(ctx, sx, sy, 5, smR, smR * 0.38, pointAngle);

        }

      } else if (country.flagType === "laos") {

        const topY = sMinY;

        const hLaos = cH;

        ctx.fillStyle = "rgba(206, 17, 38, 0.28)";

        ctx.fillRect(sMinX - 20, topY, cW + 40, hLaos * 0.25);

        ctx.fillStyle = "rgba(0, 40, 104, 0.32)";

        ctx.fillRect(sMinX - 20, topY + hLaos * 0.25, cW + 40, hLaos * 0.50);

        ctx.fillStyle = "rgba(206, 17, 38, 0.28)";

        ctx.fillRect(sMinX - 20, topY + hLaos * 0.75, cW + 40, hLaos * 0.25);



        const laosCenter = toScreen(103.8, 18.2);

        const moonRadius = isDetail ? Math.max(12, Math.min(cW, cH) * 0.16) : Math.max(7, Math.min(cW, cH) * 0.12);

        ctx.fillStyle = "rgba(255, 255, 255, 0.55)";

        ctx.beginPath();

        ctx.arc(laosCenter.x, laosCenter.y, moonRadius, 0, Math.PI * 2);

        ctx.fill();

      } else if (country.flagType === "cambodia") {

        const topY = sMinY;

        const hCam = cH;

        ctx.fillStyle = "rgba(3, 46, 161, 0.28)";

        ctx.fillRect(sMinX - 20, topY, cW + 40, hCam * 0.25);

        ctx.fillStyle = "rgba(224, 0, 37, 0.32)";

        ctx.fillRect(sMinX - 20, topY + hCam * 0.25, cW + 40, hCam * 0.50);

        ctx.fillStyle = "rgba(3, 46, 161, 0.28)";

        ctx.fillRect(sMinX - 20, topY + hCam * 0.75, cW + 40, hCam * 0.25);



        const camCenter = toScreen(104.9, 12.5);

        const templeW = isDetail ? Math.max(20, Math.min(cW, cH) * 0.24) : Math.max(12, Math.min(cW, cH) * 0.18);

        const templeH = templeW * 0.65;

        ctx.fillStyle = "rgba(255, 255, 255, 0.65)";

        ctx.beginPath();

        ctx.rect(camCenter.x - templeW/2, camCenter.y + templeH * 0.15, templeW, templeH * 0.35);

        ctx.rect(camCenter.x - templeW * 0.42, camCenter.y, templeW * 0.84, templeH * 0.20);

        ctx.fill();



        ctx.beginPath();

        ctx.moveTo(camCenter.x, camCenter.y - templeH * 0.55);

        ctx.lineTo(camCenter.x - templeW * 0.12, camCenter.y);

        ctx.lineTo(camCenter.x + templeW * 0.12, camCenter.y);

        ctx.closePath();

        ctx.fill();

      } else if (country.flagType === "thailand") {

        const sH = cH / 6;

        ctx.fillStyle = "rgba(165, 25, 49, 0.24)";

        ctx.fillRect(sMinX - 20, sMinY, cW + 40, sH);

        ctx.fillStyle = "rgba(240, 240, 240, 0.24)";

        ctx.fillRect(sMinX - 20, sMinY + sH, cW + 40, sH);

        ctx.fillStyle = "rgba(45, 42, 74, 0.30)";

        ctx.fillRect(sMinX - 20, sMinY + sH * 2, cW + 40, sH * 2);

        ctx.fillStyle = "rgba(240, 240, 240, 0.24)";

        ctx.fillRect(sMinX - 20, sMinY + sH * 4, cW + 40, sH);

        ctx.fillStyle = "rgba(165, 25, 49, 0.24)";

        ctx.fillRect(sMinX - 20, sMinY + sH * 5, cW + 40, sH);

      }

      ctx.restore();



      // Step C: Duong ranh gioi bien gioi quoc gia net dut

      ctx.save();

      ctx.strokeStyle = country.strokeColor || "rgba(148, 163, 184, 0.36)";

      ctx.lineWidth = isDetail ? 1.2 : 0.9;

      ctx.setLineDash([4, 4]);

      for (const ring of country.polygons) {

        if (!ring || ring.length < 3) continue;

        ctx.beginPath();

        let inPath = false;

        for (let i = 0; i < ring.length; i++) {

          const pt = ring[i];

          if (cutLat !== null && pt[1] >= cutLat - 0.02) {

            inPath = false;

            continue;

          }

          const scr = toScreen(pt[0], pt[1]);

          if (!inPath) {

            ctx.moveTo(scr.x, scr.y);

            inPath = true;

          } else {

            ctx.lineTo(scr.x, scr.y);

          }

        }

        ctx.stroke();

      }

      ctx.restore();

    }

  }



  // 3. VE 63 TINH THANH DANG DA GIAC 2D SAC NET

  const polyData = (typeof VN_PROVINCE_POLYGONS !== "undefined") ? VN_PROVINCE_POLYGONS : (window.VN_PROVINCE_POLYGONS || {});

  const provList = (typeof INITIAL_PROVINCES !== "undefined" && INITIAL_PROVINCES.length) ? INITIAL_PROVINCES : ((window.INITIAL_PROVINCES && window.INITIAL_PROVINCES.length) ? window.INITIAL_PROVINCES : ((typeof provinces !== "undefined") ? provinces : (window.provinces || [])));



  if (polyData && Object.keys(polyData).length > 0) {

    for (const [pid, rings] of Object.entries(polyData)) {

      if (!rings || rings.length === 0) continue;

      const pObj = provList.find(p => p.id === pid);

      if (mapType === "mien_bac" && pObj && pObj.region !== "bac") continue;

      if (mapType === "mien_trung" && pObj && pObj.region !== "trung") continue;

      if (mapType === "mien_nam" && pObj && pObj.region !== "nam") continue;



      const pColor = pObj ? (pObj.color || "#38bdf8") : "#38bdf8";



      ctx.save();

      for (const ring of rings) {

        if (!ring || ring.length < 3) continue;

        ctx.beginPath();

        const p0 = toScreen(ring[0][0], ring[0][1]);

        ctx.moveTo(p0.x, p0.y);

        for (let i = 1; i < ring.length; i++) {

          const pt = toScreen(ring[i][0], ring[i][1]);

          ctx.lineTo(pt.x, pt.y);

        }

        ctx.closePath();



        ctx.fillStyle = pColor;

        ctx.fill();



        // Duong vien den than dam phan dinh tung tinh giong hinh tran dau

        ctx.strokeStyle = "rgba(10, 15, 30, 0.95)";

        ctx.lineWidth = isDetail ? 1.0 : 0.8;

        ctx.stroke();

      }

      ctx.restore();

    }

  }



  // 4. VE VIEN BO BIEN VIET NAM NEON GLOW (PHAT SANG CYAN)

  ctx.save();

  ctx.shadowColor = "rgba(56, 189, 248, 0.55)";

  ctx.shadowBlur = isDetail ? 8 : 4;

  ctx.strokeStyle = "rgba(56, 189, 248, 0.65)";

  ctx.lineWidth = isDetail ? 1.3 : 1.0;

  if (polyData) {

    for (const [pid, rings] of Object.entries(polyData)) {

      if (!rings) continue;

      const pObj = provList.find(p => p.id === pid);

      if (mapType === "mien_bac" && pObj && pObj.region !== "bac") continue;

      if (mapType === "mien_trung" && pObj && pObj.region !== "trung") continue;

      if (mapType === "mien_nam" && pObj && pObj.region !== "nam") continue;



      for (const ring of rings) {

        if (!ring || ring.length < 3) continue;

        ctx.beginPath();

        const p0 = toScreen(ring[0][0], ring[0][1]);

        ctx.moveTo(p0.x, p0.y);

        for (let i = 1; i < ring.length; i++) {

          const pt = toScreen(ring[i][0], ring[i][1]);

          ctx.lineTo(pt.x, pt.y);

        }

        ctx.closePath();

        ctx.stroke();

      }

    }

  }

  ctx.restore();



  // 5. VE 2 QUAN DAO HOANG SA & TRUONG SA + CON DAO (CHAM TRON + HALO + NHAN CHU)

  const islandDots = (typeof FIXED_ISLAND_DOTS !== "undefined") ? FIXED_ISLAND_DOTS : (window.FIXED_ISLAND_DOTS || []);

  if (islandDots && islandDots.length > 0 && mapType !== "mien_bac") {

    for (const dot of islandDots) {

      const pt = toScreen(dot.lon, dot.lat);

      if (pt.x >= -10 && pt.x <= w + 10 && pt.y >= -10 && pt.y <= h + 10) {

        ctx.save();

        // Vong phat sang cyan

        ctx.beginPath();

        const dotR = isDetail ? Math.max(2.8, (dot.r || 3.5) * 0.85) : Math.max(2.0, (dot.r || 3.5) * 0.55);

        ctx.arc(pt.x, pt.y, dotR + (isDetail ? 2.5 : 1.8), 0, Math.PI * 2);

        ctx.fillStyle = "rgba(56, 189, 248, 0.35)";

        ctx.fill();



        // Cham tron dao

        ctx.beginPath();

        ctx.arc(pt.x, pt.y, dotR, 0, Math.PI * 2);

        const ownerProv = provList.find(p => p.id === dot.provinceId) || { color: "#38bdf8" };

        ctx.fillStyle = ownerProv.color || "#38bdf8";

        ctx.fill();

        ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";

        ctx.lineWidth = 0.9;

        ctx.stroke();

        ctx.restore();

      }

    }



    // Nhan chu khang dinh chu quyen Hoang Sa & Truong Sa

    const hoangSaPt = toScreen(109.15, 16.95);

    const truongSaPt = toScreen(108.96, 9.15);



    ctx.save();

    ctx.shadowColor = "#38bdf8";

    ctx.shadowBlur = isDetail ? 6 : 4;

    ctx.fillStyle = "#e0f2fe";

    ctx.font = isDetail ? "bold 11px sans-serif" : "bold 8.5px sans-serif";

    ctx.textAlign = "left";

    ctx.textBaseline = "middle";



    if (hoangSaPt.x > 0 && hoangSaPt.x < w - 40 && hoangSaPt.y > 0 && hoangSaPt.y < h) {

      ctx.fillText("HOÀNG SA", hoangSaPt.x + (isDetail ? 10 : 7), hoangSaPt.y - 2);

    }

    if (truongSaPt.x > 0 && truongSaPt.x < w - 80 && truongSaPt.y > 0 && truongSaPt.y < h) {

      ctx.fillText(isDetail ? "TRƯỜNG SA (VIỆT NAM)" : "TRƯỜNG SA", truongSaPt.x + (isDetail ? 10 : 7), truongSaPt.y);

    }

    ctx.restore();

  }



  // 6. VE BIEN SO XE CHO TAT CA CAC TINH (HIEN TOAN BO BIEN SO, KO HIEN QUAN KHU)

  if (provList && provList.length > 0) {

    for (const p of provList) {

      if (!p.center) continue;

      if (mapType === "mien_bac" && p.region !== "bac") continue;

      if (mapType === "mien_trung" && p.region !== "trung") continue;

      if (mapType === "mien_nam" && p.region !== "nam") continue;



      const pos = toScreen(p.center[0], p.center[1]);

      if (pos.x < 10 || pos.x > w - 10 || pos.y < 10 || pos.y > h - 10) continue;



      const isHanoi = (p.plate === "30");

      const isHCM = (p.plate === "51");

      const isBig = isHanoi || isHCM;



      // O che do nho tren card, chi ve nhung tinh lon/thu phu de tranh roi mat

      if (!isDetail && !isBig && p.plate !== "43" && p.plate !== "15" && p.plate !== "65") {

        continue;

      }



      const bw = isBig ? (isDetail ? 22 : 19) : (isDetail ? 18 : 15);

      const bh = isBig ? (isDetail ? 16 : 14) : (isDetail ? 13 : 11);

      const bx = pos.x - bw / 2;

      const by = pos.y - bh / 2;



      ctx.save();

      ctx.shadowColor = isBig ? "#ff3838" : (p.color || "#38bdf8");

      ctx.shadowBlur = isBig ? 10 : 4;



      const bgGrad = ctx.createLinearGradient(bx, by, bx, by + bh);

      if (isBig) {

        bgGrad.addColorStop(0, "#991b1b");

        bgGrad.addColorStop(1, "#450a0a");

      } else {

        bgGrad.addColorStop(0, "rgba(15, 23, 42, 0.96)");

        bgGrad.addColorStop(1, "rgba(2, 6, 23, 0.98)");

      }

      ctx.fillStyle = bgGrad;

      drawBadgeBoxHelper(ctx, bx, by, bw, bh, 3);

      ctx.fill();



      ctx.strokeStyle = isBig ? "#facc15" : "rgba(255, 255, 255, 0.75)";

      ctx.lineWidth = isBig ? 1.6 : 1.0;

      ctx.stroke();

      ctx.restore();



      ctx.save();

      ctx.fillStyle = isBig ? "#fef08a" : "#ffffff";

      const fSize = isBig ? (isDetail ? "10.5px" : "9px") : (isDetail ? "9px" : "7.5px");

      ctx.font = "900 " + fSize + " \"Plus Jakarta Sans\", sans-serif";

      ctx.textAlign = "center";

      ctx.textBaseline = "middle";

      ctx.fillText(p.plate || "", pos.x, pos.y + 0.5);

      ctx.restore();

    }

  }

}

window.renderMiniMapToCanvas = renderMiniMapToCanvas;



window.currentSelectedMapId = "vietnam_63";



function navigateTo(route) {

  window.location.hash = route;

}

window.navigateTo = navigateTo;



function handleRoute() {

  const hash = window.location.hash || "#/";



  // Khi ở ngoài trận đấu (Dashboard / Map detail), khóa cứng toàn bộ giọng đọc và xóa sạch hàng đợi TTS

  if (!hash.startsWith("#/battle") && !hash.startsWith("#/pentest")) {

    const victoryModal = document.getElementById("victory-modal");
    if (victoryModal) victoryModal.classList.remove("active");

    if (typeof window.stopAllSpeech === 'function') window.stopAllSpeech();

    if (window.speechSynthesis) {

      try { window.speechSynthesis.cancel(); } catch(e){}

    }

  }



  const dashboardEl = document.getElementById("rw-dashboard-view");

  const detailEl = document.getElementById("rw-detail-view");

  const gameAppEl = document.getElementById("app");



  if (!dashboardEl || !detailEl || !gameAppEl) return;



  if (hash.startsWith("#/battle") || hash.startsWith("#/pentest")) {

    const battleMapId = hash.replace(/^#\/(?:battle|pentest)\//, "").trim() || "vietnam_63";
    window.currentSelectedMapId = battleMapId;

    document.body.classList.remove("dashboard-mode");

    document.body.classList.add("battle-mode");
    document.body.classList.toggle('pentest-mode', hash.startsWith('#/pentest/'));
    if(hash.startsWith('#/pentest/') && window._pentestRouteActive !== true){
      window._pentestRouteActive = true;
      setTimeout(() => { if(typeof window.resetNewMatch === 'function') window.resetNewMatch(true, true); }, 0);
    } else if(!hash.startsWith('#/pentest/')) {
      window._pentestRouteActive = false;
    }

    dashboardEl.style.display = "none";

    detailEl.style.display = "none";

    gameAppEl.style.display = "flex";

    

    setTimeout(() => {

      if (typeof resizeCanvas === "function") resizeCanvas();

    }, 60);

    return;

  }



  // Dashboard hoac Detail: bat che do cuon trang cho body

  document.body.classList.remove("battle-mode");

  document.body.classList.add("dashboard-mode");

  window.scrollTo({ top: 0, behavior: "instant" });



  if (hash.startsWith("#/map/")) {

    const mapId = hash.replace("#/map/", "").trim() || "vietnam_63";

    window.currentSelectedMapId = mapId;

    dashboardEl.style.display = "none";

    gameAppEl.style.display = "none";

    detailEl.style.display = "block";

    renderMapDetailView(mapId);

    return;

  }



  dashboardEl.style.display = "block";

  detailEl.style.display = "none";

  gameAppEl.style.display = "none";

  renderDashboardCards();

}

window.handleRoute = handleRoute;



function renderDashboardCards() {

  fetchMatchHistoryFromDB().then(db => {

    const pill = document.getElementById('rw-total-db-matches');

    if (pill) {

      pill.textContent = (db.totalMatches || 0) + ' TRẬN';

    }

  });

  const gridEl = document.getElementById("rw-maps-grid");

  if (!gridEl) return;



  gridEl.innerHTML = "";

  window.MAPS_CATALOG.forEach(m => {

    const card = document.createElement("div");

    card.className = "rw-card";

    card.onclick = () => navigateTo("#/map/" + m.id);



    card.innerHTML = 

      '<div class="rw-card-header">' +

        '<div class="rw-card-title-wrap">' +

          '<span style="font-size:18px;">' + m.icon + '</span>' +

          '<div class="rw-card-title">' + m.name + '</div>' +

        '</div>' +

        '<div class="rw-card-star">★</div>' +

      '</div>' +

      '<div class="rw-card-preview">' +

        '<canvas id="mini-canvas-' + m.id + '"></canvas>' +

        '<div class="rw-card-service-icons">' +

          '<div class="rw-service-icon-box" title="Chiến dịch">' + m.icon + '</div>' +

          '<div class="rw-service-icon-box" title="Chế độ tác chiến">' + m.subIcon + '</div>' +

        '</div>' +

        '<div class="rw-map-tag-overlay">' + m.badge + '</div>' +

      '</div>' +

      '<div class="rw-card-footer">' +

        '<div class="rw-status-indicator ' + (m.status === "production" ? "ready" : "") + '">' +

          '<div class="rw-status-dot"></div>' +

          '<span>' + m.status + '</span>' +

          '<span style="opacity:0.6;">·</span>' +

          '<span>' + m.serviceOnline + '</span>' +

        '</div>' +

        '<div class="rw-card-arrow">Chi tiết →</div>' +

      '</div>';



    gridEl.appendChild(card);



    setTimeout(() => {

      const c = document.getElementById("mini-canvas-" + m.id);

      if (c) renderMiniMapToCanvas(c, m.id);

    }, 15);

  });

}

window.renderDashboardCards = renderDashboardCards;



async function renderMapDetailView(mapId) {

  const mapData = window.MAPS_CATALOG.find(m => m.id === mapId) || window.MAPS_CATALOG[0];

  

  const titleEl = document.getElementById('rw-detail-title');

  const descEl = document.getElementById('rw-detail-desc');

  const badgeEl = document.getElementById('rw-detail-badge');

  const metaCountEl = document.getElementById('rw-meta-prov-count');

  const metaRegionEl = document.getElementById('rw-meta-region-mode');

  const breadcrumbEl = document.getElementById('rw-breadcrumb-mapname');



  if (titleEl) titleEl.innerHTML = mapData.icon + ' ' + mapData.name;

  if (descEl) descEl.textContent = mapData.desc;

  if (badgeEl) badgeEl.textContent = mapData.badge;

  if (metaCountEl) metaCountEl.textContent = mapData.totalProvinces + ' Tỉnh Thành';

  if (metaRegionEl) metaRegionEl.textContent = mapData.regionMode;

  if (breadcrumbEl) breadcrumbEl.textContent = mapData.name;



  const detailCanvas = document.getElementById('rw-detail-canvas');

  if (detailCanvas) {

    setTimeout(() => {

      renderMiniMapToCanvas(detailCanvas, mapData.id);

    }, 20);

  }



  // Lay du lieu thuc tu Database Server

  const dbData = await fetchMatchHistoryFromDB();

  const topList = (dbData.leaderboards || []).slice(0, 14); // Chi lay dung 14 tinh

  const topTbody = document.getElementById('rw-top-winners-tbody');

  if (topTbody) {

    topTbody.innerHTML = '';

    if (topList.length === 0) {

      topTbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:26px;color:rgba(255,255,255,0.45);font-style:italic;">Chưa có trận đấu nào được lưu trong Database.<br><span style="color:#8b5cf6;font-size:12px;font-style:normal;">⚡ Hãy bấm "VÀO TRẬN CHIẾN" và hoàn thành ván đấu để ghi danh lịch sử!</span></td></tr>';

    } else {

      topList.forEach((item, idx) => {

        const rankClass = idx === 0 ? 'rw-rank-1' : (idx === 1 ? 'rw-rank-2' : (idx === 2 ? 'rw-rank-3' : 'rw-rank-normal'));

        const tr = document.createElement('tr');

        tr.innerHTML = 

          '<td style="width:44px;"><div class="rw-rank-badge ' + rankClass + '">#' + (idx + 1) + '</div></td>' +

          '<td>' +

            '<div class="rw-prov-cell">' +

              '<div class="rw-prov-dot" style="background:' + item.color + ';box-shadow:0 0 8px ' + item.color + '"></div>' +

              '<span class="rw-prov-name">' + item.name + '</span>' +

              (item.plate ? ('<span class="rw-plate-pill">' + item.plate + '</span>') : '') +

            '</div>' +

          '</td>' +

          '<td style="text-align:right;font-weight:800;color:#facc15;font-size:14px;white-space:nowrap;">' + item.wins + ' <span style="font-size:11px;color:rgba(255,255,255,0.4);font-weight:600;">lần</span></td>';

        topTbody.appendChild(tr);

      });

    }

  }



  const recentList = (dbData.history || []).slice(0, 10); // Chi lay dung 10 tran gan nhat

  const recentContainer = document.getElementById('rw-recent-matches-container');

  if (recentContainer) {

    recentContainer.innerHTML = '';

    if (recentList.length === 0) {

      recentContainer.innerHTML = '<div style="text-align:center;padding:32px 16px;color:rgba(255,255,255,0.45);font-style:italic;">Lịch sử database đang trống.<br>Mọi chiến tích vô địch sẽ được hệ thống tự động lưu giữ tại đây.</div>';

    } else {

      recentList.forEach((m, idx) => {

        const div = document.createElement('div');

        div.className = 'rw-recent-item';

        div.innerHTML = 

          '<div class="rw-recent-match-id">' + (m.matchId || ('V' + String((idx + 1) % 10000).padStart(4, '0'))) + '</div>' +

          '<div class="rw-recent-winner">' +

            '<div class="rw-prov-dot" style="background:' + (m.color || '#facc15') + ';box-shadow:0 0 8px ' + (m.color || '#facc15') + '"></div>' +

            '<span class="rw-recent-prov-name">' + m.winnerName + '</span>' +

            (m.winnerPlate ? ('<span class="rw-plate-pill">' + m.winnerPlate + '</span>') : '') +

            '<span class="rw-recent-badge">🏆 QUÁN QUÂN</span>' +

          '</div>' +

          '<div class="rw-recent-time">' + (m.dateStr || 'Vừa xong') + '</div>';

        recentContainer.appendChild(div);

      });

    }

  }

}

window.renderMapDetailView = renderMapDetailView;



function launchBattleGame() {

  const mapId = window.currentSelectedMapId || "vietnam_63";

  console.log("[ROUTER] Launching battle game for map:", mapId);

  if(typeof window.resetNewMatch === "function") window.resetNewMatch(true, true);
  navigateTo("#/battle/" + mapId);

}

window.launchBattleGame = launchBattleGame;



window.addEventListener("hashchange", handleRoute);

window.addEventListener("DOMContentLoaded", () => {

  if (!window.location.hash || window.location.hash === "#") {

    window.location.hash = "#/";

  }

  handleRoute();

});



window.addEventListener("resize", () => {
  const detailEl = document.getElementById("rw-detail-view");
  if (detailEl && detailEl.style.display !== "none") {
    const detailCanvas = document.getElementById("rw-detail-canvas");
    if (detailCanvas && window.currentSelectedMapId) {
      renderMiniMapToCanvas(detailCanvas, window.currentSelectedMapId);
    }
  }
});
