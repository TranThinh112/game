import { test, expect } from '@playwright/test';

test.describe('Kiểm thử chi tiết các tính năng Không quân, Hải quân và Nhạc vinh danh', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/#/battle', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
  });

  test('1. Kiểm thử phát nhạc đặc trưng khi vô địch (MusicService & Province Anthem)', async ({ page }) => {
    const victoryMusicLogs = [];
    page.on('console', msg => {
      const txt = msg.text();
      if (txt.includes('[VICTORY]') || txt.includes('[MusicService]')) {
        victoryMusicLogs.push(txt);
      }
    });

    const musicCatalog = await page.evaluate(async () => {
      const res = await fetch('/province-music.json');
      const data = await res.json();
      return {
        total: data.length,
        provinces: data.map(d => d.provinceId),
        hasAnGiang: data.some(d => d.provinceId === 'an_giang'),
        hasHaNoi: data.some(d => d.provinceId === 'ha_noi'),
        hasTpHcm: data.some(d => d.provinceId === 'tp_hcm')
      };
    });

    console.log('[E2E TEST 1] Music catalog stats:', musicCatalog);
    expect(musicCatalog.total).toBe(30);
    expect(musicCatalog.hasAnGiang).toBe(true);

    // Kích hoạt thử victory cho tỉnh An Giang (có bài hát trong catalog)
    const playAnGiangResult = await page.evaluate(() => {
      const ag = provinces.find(p => p.id === 'an_giang');
      if (window.triggerVictory && ag) {
        window.triggerVictory(ag);
        return {
          triggered: true,
          modalActive: document.getElementById('victory-modal') ? true : false,
          musicServiceExists: typeof window.MusicService !== 'undefined'
        };
      }
      return { triggered: false };
    });

    console.log('[E2E TEST 1] Trigger Victory An Giang:', playAnGiangResult);
    expect(playAnGiangResult.triggered).toBe(true);
    expect(playAnGiangResult.musicServiceExists).toBe(true);

    await page.waitForTimeout(1000);

    // Kích hoạt thử victory cho tỉnh Hà Nội (CHƯA có bài hát trong catalog)
    const playHaNoiResult = await page.evaluate(() => {
      const hn = provinces.find(p => p.id === 'ha_noi');
      if (window.triggerVictory && hn) {
        window.triggerVictory(hn);
        return {
          targetMusicId: hn.id,
          hasSong: window.MusicService ? window.MusicService.playProvinceMusic('ha_noi') : null
        };
      }
      return null;
    });

    console.log('[E2E TEST 1] Trigger Victory Ha Noi (Missing Song Check):', playHaNoiResult);
    // Nhận diện lỗi thiếu bài hát của Hà Nội
    // Bây giờ Hà Nội đã có bài hát Fallback Quốc Gia thành công
    expect(playHaNoiResult.hasSong).toBe(true);
  });

  test('2. Kiểm thử logic xuất chiến Tàu & Máy bay (Spawn & Mission State)', async ({ page }) => {
    const spawnResults = await page.evaluate(() => {
      const hn = provinces.find(p => p.id === 'ha_noi');
      const hp = provinces.find(p => p.id === 'hai_phong');
      const qn = provinces.find(p => p.id === 'quang_ninh');

      // 2.1. Test spawnAirMission (Không quân xuất kích)
      const airBefore = airMissions.length;
      spawnAirMission(hn, hp, 'Tướng Không Quân', 'BỘ TƯ LỆNH THỦ ĐÔ', 350, false);
      const airAfter = airMissions.length;
      const airItem = airMissions[airMissions.length - 1];

      // 2.2. Test spawnNavalMission (Hải quân xuất kích)
      const navyBefore = navalMissions.length;
      spawnNavalMission(qn, hp, 'Đô Đốc Hải Quân', 'VÙNG 1 HẢI QUÂN', 350, false);
      const navyAfter = navalMissions.length;
      const navyItem = navalMissions[navalMissions.length - 1];

      return {
        airSpawned: airAfter === airBefore + 1,
        airDamage: airItem ? airItem.damage : 0,
        airSpeed: airItem ? airItem.speed : 0,
        navySpawned: navyAfter === navyBefore + 1,
        navyDamage: navyItem ? navyItem.damage : 0,
        navyState: navyItem ? navyItem.state : null,
        navyShipCoords: navyItem ? { lon: navyItem.shipLon, lat: navyItem.shipLat } : null
      };
    });

    console.log('[E2E TEST 2] Spawn Air & Navy Missions:', spawnResults);
    expect(spawnResults.airSpawned).toBe(true);
    expect(spawnResults.airDamage).toBe(350);
    expect(spawnResults.navySpawned).toBe(true);
    expect(spawnResults.navyDamage).toBe(350);
    expect(spawnResults.navyState).toBe('sailing');
  });

  test('3. Kiểm thử dame trừ khi tấn công (-350 HP và chiếm tỉnh khi hết HP)', async ({ page }) => {
    const damageSimulation = await page.evaluate(async () => {
      const src = provinces.find(p => p.id === 'ha_noi');
      const tgt = provinces.find(p => p.id === 'hai_phong');

      tgt.hp = 1000;
      const hpInitial = tgt.hp;

      // Giả lập máy bay ném bom trúng đích (progress = 1.0)
      spawnAirMission(src, tgt, 'Tướng Test', 'BỘ TƯ LỆNH THỦ ĐÔ', 350, false);
      const air = airMissions[airMissions.length - 1];
      air.progress = 1.0;

      // Cho chạy 1 frame update để xử lý va chạm sát thương
      update();
      const hpAfterAir = tgt.hp;

      // Giả lập pháo hải quân chạm đích (shellProgress = 1.0)
      spawnNavalMission(src, tgt, 'Đô Đốc Test', 'HẢI QUÂN', 350, false);
      const navy = navalMissions[navalMissions.length - 1];
      navy.state = 'shelling';
      navy.shellProgress = 1.0;

      update();
      const hpAfterNavy = tgt.hp;

      // Kiểm tra khi mục tiêu còn ít máu (< 350) thì có kích hoạt onProvinceConquered đổi cờ không
      tgt.hp = 200;
      spawnAirMission(src, tgt, 'Tướng Test Kết Liễu', 'BỘ TƯ LỆNH THỦ ĐÔ', 350, false);
      const lethalAir = airMissions[airMissions.length - 1];
      lethalAir.progress = 1.0;

      update();
      const conqueredOwner = tgt.ownerId;

      return {
        hpInitial,
        hpAfterAir,
        hpAirDeduction: hpInitial - hpAfterAir,
        hpAfterNavy,
        hpNavyDeduction: hpAfterAir - hpAfterNavy,
        conqueredOwner
      };
    });

    console.log('[E2E TEST 3] Dame Deduction Simulation:', damageSimulation);
    expect(damageSimulation.hpAirDeduction).toBe(350);
    expect(damageSimulation.hpNavyDeduction).toBe(350);
    expect(damageSimulation.conqueredOwner).toBe('ha_noi');
  });

  test('4. Kiểm thử icon tàu và máy bay di chuyển trên Canvas (Icon, Angle & Wake/Smoke)', async ({ page }) => {
    const movementTest = await page.evaluate(async () => {
      const src = provinces.find(p => p.id === 'ha_noi');
      const tgt = provinces.find(p => p.id === 'quang_ninh');

      // Tạo mission máy bay và tàu
      spawnAirMission(src, tgt, 'Phi Đội 1', 'KHÔNG QUÂN', 350, false);
      spawnNavalMission(src, tgt, 'Hạm Đội 1', 'HẢI QUÂN', 350, false);

      const air = airMissions[airMissions.length - 1];
      const navy = navalMissions[navalMissions.length - 1];

      // Ghi nhận vị trí ban đầu
      const pAir1 = air.progress;
      const pNavy1 = navy.progress;
      const shipLon1 = navy.shipLon;

      // Cho update chạy 3 bước mô phỏng
      update();
      update();
      update();

      const pAir2 = air.progress;
      const pNavy2 = navy.progress;
      const shipLon2 = navy.shipLon;

      // Kiểm tra vệt khói và rẽ sóng
      const hasSmoke = air.smokeTrail.length > 0;
      const hasWake = navy.wakeTrail.length > 0;

      // Kiểm tra vẽ trên Canvas (không crash trong hàm draw)
      let drawSuccess = true;
      try {
        draw();
      } catch (e) {
        drawSuccess = false;
      }

      return {
        airProgressMoved: pAir2 > pAir1,
        navyProgressMoved: pNavy2 > pNavy1,
        shipMoved: shipLon2 !== shipLon1,
        hasSmoke,
        hasWake,
        drawSuccess
      };
    });

    console.log('[E2E TEST 4] Icon Movement & Rendering:', movementTest);
    expect(movementTest.airProgressMoved).toBe(true);
    expect(movementTest.navyProgressMoved).toBe(true);
    expect(movementTest.hasSmoke).toBe(true);
    expect(movementTest.hasWake).toBe(true);
    expect(movementTest.drawSuccess).toBe(true);
  });

  test('5. Kiểm thử giọng đọc TTS khi có Tàu / Máy bay xuất hiện', async ({ page }) => {
    const voiceTest = await page.evaluate(() => {
      const spokenHistory = [];
      const originalSpeak = window.speakText;
      window.speakText = function(text, priority) {
        spokenHistory.push({ text, priority });
        return originalSpeak.apply(this, arguments);
      };

      const hn = provinces.find(p => p.id === 'ha_noi');
      const hp = provinces.find(p => p.id === 'hai_phong');

      // 5.1. Spawn Air với announceVoice = true
      spawnAirMission(hn, hp, 'Chỉ Huy Trưởng', 'BỘ TƯ LỆNH THỦ ĐÔ', 350, true);

      // 5.2. Spawn Navy với announceVoice = true
      spawnNavalMission(hn, hp, 'Đô Đốc Hải Quân', 'VÙNG 1 HẢI QUÂN', 350, true);

      // 5.3. Gọi lệnh triggerAirStrikeOrder qua UI logic
      document.getElementById('select-source-prov').value = 'ha_noi';
      lastAirStrike = 0; // reset cooldown để kích hoạt
      triggerAirStrikeOrder();

      return {
        totalSpoken: spokenHistory.length,
        spokenHistory
      };
    });

    console.log('[E2E TEST 5] Voice Announcements for Air & Navy:', voiceTest);
    expect(voiceTest.totalSpoken).toBeGreaterThanOrEqual(3);

    const hasAirVoice = voiceTest.spokenHistory.some(s => s.text.includes('Không quân') || s.text.includes('tiêm kích') || s.text.includes('Máy bay'));
    const hasNavyVoice = voiceTest.spokenHistory.some(s => {
      const lower = s.text.toLowerCase();
      return lower.includes('hải quân') || lower.includes('tàu chiến') || lower.includes('pháo hạm') || lower.includes('pháo kích');
    });

    expect(hasAirVoice).toBe(true);
    expect(hasNavyVoice).toBe(true);
  });

});
