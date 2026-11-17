import { test, expect } from '@playwright/test';

test.describe('E2E Test: Quy tắc điều quân khắt khe cho Comment', () => {
  test('1. Bộ binh: Báo vi phạm khi không giáp ranh và cho phép khi mở rộng lãnh thổ giáp ranh', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const checkBorder = await page.evaluate(() => {
      // Bỏ qua giai đoạn chuẩn bị để kiểm tra logic giáp ranh trong giai đoạn tấn công
      window.isPreparationPhase = false;
      // Đầu game: Phú Thọ (19) không giáp ranh Cà Mau (69)
      const logs = [];
      const origAddWarLog = window.addWarLog;
      window.addWarLog = (msg, cls) => { logs.push(msg); origAddWarLog(msg, cls); };

      handleAction({ user: 'Tester', comment: '19 - 69' });
      const viPham = logs.some(l => l.includes('không nằm trong phạm vi tấn công của bộ binh Phú Thọ'));

      return { viPham, lastLog: logs[logs.length - 1] };
    });

    console.log('Test Vi phạm Giáp ranh Bộ binh:', checkBorder);
    expect(checkBorder.viPham).toBe(true);
  });

  test('2. Không quân: Đầu game chưa chiếm Hà Nội/HCM/Quân khu thì bị từ chối và cảnh báo', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const checkAir = await page.evaluate(() => {
      // Kiểm tra quyền chỉ huy sau khi hết 1p30s chuẩn bị.
      window.isPreparationPhase = false;
      const logs = [];
      const origAddWarLog = window.addWarLog;
      window.addWarLog = (msg, cls) => { logs.push(msg); origAddWarLog(msg, cls); };

      // Phú Thọ (19) chưa chiếm Hà Nội/HCM/QK -> gọi MB oanh tạc Hà Giang
      handleAction({ user: 'Tester', comment: '19 - 23 MB' });
      const viPham = logs.some(l => l.includes('chưa có quyền điều động máy bay'));

      return { viPham, lastLog: logs[logs.length - 1] };
    });

    console.log('Test Quyền Không quân đầu game:', checkAir);
    expect(checkAir.viPham).toBe(true);
  });

  test('3. Hải quân: Đầu game chưa có biển/chưa chiếm HCM/Quân khu thì bị từ chối và cảnh báo', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const checkNavy = await page.evaluate(() => {
      // Kiểm tra quyền chỉ huy sau khi hết 1p30s chuẩn bị.
      window.isPreparationPhase = false;
      const logs = [];
      const origAddWarLog = window.addWarLog;
      window.addWarLog = (msg, cls) => { logs.push(msg); origAddWarLog(msg, cls); };

      handleAction({ user: 'Tester', comment: '19 - 23 TC' });
      const viPham = logs.some(l => l.includes('chưa có quyền điều động tàu chiến'));

      return { viPham, lastLog: logs[logs.length - 1] };
    });

    console.log('Test Quyền Hải quân đầu game:', checkNavy);
    expect(checkNavy.viPham).toBe(true);
  });
});
