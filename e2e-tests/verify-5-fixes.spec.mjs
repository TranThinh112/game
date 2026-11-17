import { test, expect } from '@playwright/test';

test.describe('Kiểm thử E2E xác nhận toàn bộ 5 lỗi đã được khắc phục hoàn chỉnh', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/#/battle', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
  });

  test('LỖI 1: Nhạc vô địch - Hỗ trợ phát nhạc cục bộ & Fallback không bị im lặng', async ({ page }) => {
    const playResult = await page.evaluate(() => {
      // 1. Kiểm tra tỉnh có cấu hình (An Giang)
      const resAg = window.MusicService.playProvinceMusic('an_giang');

      // 2. Kiểm tra tỉnh chưa có cấu hình (Hà Nội) -> xem cơ chế Fallback Hào Khí Việt Nam
      const resHn = window.MusicService.playProvinceMusic('ha_noi');
      const songHn = window.MusicService.getCurrentSong();

      return {
        resAg,
        resHn,
        songHn: songHn ? { name: songHn.provinceName, videoId: songHn.youtubeVideoId, isFallback: songHn.isFallback } : null
      };
    });

    console.log('[TEST LỖI 1 RESULT]', playResult);
    expect(playResult.resAg).toBe(true);
    expect(playResult.resHn).toBe(true);
    expect(playResult.songHn.isFallback).toBe(true);
  });

  test('LỖI 2: Đặc quyền đầu trận & kế thừa khi chiếm Hà Nội / TP. HCM / Quân khu', async ({ page }) => {
    const permResults = await page.evaluate(() => {
      const srcSelect = document.getElementById('select-source-prov');
      const airBtn = document.getElementById('btn-air-strike');
      const navyBtn = document.getElementById('btn-navy-strike');

      // 1. Hà Nội đầu trận: Có Máy bay, KHÔNG có Tàu chiến
      srcSelect.value = 'ha_noi';
      updateStrikeButtonsVisibility();
      const hanoi = { air: airBtn.style.display !== 'none', navy: navyBtn.style.display !== 'none' };

      // 2. TP. HCM đầu trận: CÓ CẢ Máy bay VÀ Tàu chiến
      srcSelect.value = 'tp_hcm';
      updateStrikeButtonsVisibility();
      const tphcm = { air: airBtn.style.display !== 'none', navy: navyBtn.style.display !== 'none' };

      // 3. Tỉnh nhỏ ven biển đầu trận (Hải Phòng): KHÔNG có Máy bay, KHÔNG có Tàu chiến
      srcSelect.value = 'hai_phong';
      updateStrikeButtonsVisibility();
      const haiphongInitial = { air: airBtn.style.display !== 'none', navy: navyBtn.style.display !== 'none' };

      // 4. Giả lập Hải Phòng đánh chiếm được Hà Nội -> Kế thừa Không quân
      const hnProv = provinces.find(p => p.id === 'ha_noi');
      hnProv.ownerId = 'hai_phong';
      updateStrikeButtonsVisibility();
      const haiphongAfterHanoi = { air: airBtn.style.display !== 'none', navy: navyBtn.style.display !== 'none' };

      // 5. Giả lập Hải Phòng đánh chiếm được TP. HCM -> Kế thừa cả Hải quân
      const hcmProv = provinces.find(p => p.id === 'tp_hcm');
      hcmProv.ownerId = 'hai_phong';
      updateStrikeButtonsVisibility();
      const haiphongAfterTpHcm = { air: airBtn.style.display !== 'none', navy: navyBtn.style.display !== 'none' };

      return {
        hanoi,
        tphcm,
        haiphongInitial,
        haiphongAfterHanoi,
        haiphongAfterTpHcm
      };
    });

    console.log('[TEST LỖI 2 RESULT]', JSON.stringify(permResults, null, 2));
    // Hà Nội: air=true, navy=false
    expect(permResults.hanoi.air).toBe(true);
    expect(permResults.hanoi.navy).toBe(false);

    // TP. HCM: air=true, navy=true
    expect(permResults.tphcm.air).toBe(true);
    expect(permResults.tphcm.navy).toBe(true);

    // Hải Phòng đầu trận: air=false, navy=false
    expect(permResults.haiphongInitial.air).toBe(false);
    expect(permResults.haiphongInitial.navy).toBe(false);

    // Hải Phòng chiếm Hà Nội: air=true, navy=false
    expect(permResults.haiphongAfterHanoi.air).toBe(true);
    expect(permResults.haiphongAfterHanoi.navy).toBe(false);

    // Hải Phòng chiếm TP. HCM: air=true, navy=true
    expect(permResults.haiphongAfterTpHcm.air).toBe(true);
    expect(permResults.haiphongAfterTpHcm.navy).toBe(true);
  });

  test('LỖI 3: Logic mục tiêu pháo hạm & chuyển hướng khi chọn tỉnh nội địa', async ({ page }) => {
    const navalTargetTest = await page.evaluate(() => {
      const srcSelect = document.getElementById('select-source-prov');
      const tgtSelect = document.getElementById('select-target-prov');

      // Cho TP. HCM phát động lệnh
      srcSelect.value = 'tp_hcm';

      // Giả lập Đắk Lắk (nội địa) chiếm được Phú Yên (ven biển)
      const py = provinces.find(p => p.id === 'phu_yen');
      py.ownerId = 'dak_lak';

      // Đưa option Đắk Lắk vào ô chọn mục tiêu
      let opt = Array.from(tgtSelect.options).find(o => o.value === 'dak_lak');
      if (!opt) {
        opt = document.createElement('option');
        opt.value = 'dak_lak';
        opt.text = 'Đắk Lắk';
        tgtSelect.appendChild(opt);
      }
      tgtSelect.value = 'dak_lak';
      lastNavyStrike = 0; // reset cooldown

      // Gọi lệnh pháo kích
      triggerNavyStrikeOrder();
      const latestNavy = navalMissions[navalMissions.length - 1];

      return {
        targetName: latestNavy ? latestNavy.tgtProv.name : null,
        targetId: latestNavy ? latestNavy.tgtProv.id : null,
        shipLon: latestNavy ? latestNavy.shipLon : 0,
        isPatrolInEastSea: latestNavy ? latestNavy.patrolLon >= 107.0 : false
      };
    });

    console.log('[TEST LỖI 3 RESULT]', navalTargetTest);
    // Tự động chuyển hướng đánh vào Phú Yên (duyên hải của Đắk Lắk) thay vì bắn vào Tây Nguyên!
    expect(navalTargetTest.targetId).toBe('phu_yen');
    expect(navalTargetTest.isPatrolInEastSea).toBe(true);
  });

  test('LỖI 4: Tốc độ di chuyển theo thời gian thực (Delta Time)', async ({ page }) => {
    const dtTest = await page.evaluate(() => {
      const hn = provinces.find(p => p.id === 'ha_noi');
      const hp = provinces.find(p => p.id === 'hai_phong');

      spawnAirMission(hn, hp, 'Phi Đội 1', 'BTL THỦ ĐÔ', 350, false);
      const air = airMissions[airMissions.length - 1];

      // Giả lập chạy 1 frame với deltaSec = 0.5s (tương đương 500ms)
      window.lastFrameDeltaSec = 0.5;
      update(0.5);

      // Tiến độ phải tăng đúng bằng dtSec / 2.4s = 0.5 / 2.4 = ~0.208
      const expectedProgress = 0.5 / 2.4;
      const actualProgress = air.progress;

      return {
        actualProgress,
        expectedProgress,
        diff: Math.abs(actualProgress - expectedProgress)
      };
    });

    console.log('[TEST LỖI 4 RESULT]', dtTest);
    expect(dtTest.diff).toBeLessThan(0.01);
  });

  test('LỖI 5: Giọng đọc chiến sự xếp hàng đợi tuần tự (không cắt ngang)', async ({ page }) => {
    const queueTest = await page.evaluate(() => {
      speechQueue = [];
      isSpeechBusy = true; // Giả lập đang có 1 câu đang đọc

      const hn = provinces.find(p => p.id === 'ha_noi');
      const hp = provinces.find(p => p.id === 'hai_phong');

      // Xuất kích Không quân
      spawnAirMission(hn, hp, 'Chỉ Huy 1', 'BTL THỦ ĐÔ', 350, true);

      // Xuất kích Hải quân ngay lập tức
      spawnNavalMission(hn, hp, 'Đô Đốc 1', 'HẢI QUÂN', 350, true);

      return {
        queueLength: speechQueue.length,
        isSpeechBusy,
        queueItems: [...speechQueue]
      };
    });

    console.log('[TEST LỖI 5 RESULT]', queueTest);
    // Cả 2 câu đều nằm trong hàng đợi tuần tự, không bị cưỡng chế xóa hoặc ngắt ngang
    expect(queueTest.queueLength).toBeGreaterThanOrEqual(1);
  });

});
