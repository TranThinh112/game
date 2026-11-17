import { test, expect } from '@playwright/test';

test.describe('E2E Test Toàn Diện Dự Án Web - Đại Chiến 63 Tỉnh Thành', () => {

  test('BE - Kiểm tra các REST API cơ bản', async ({ request }) => {
    // 1. Kiểm tra API TTS
    const ttsRes = await request.get('/api/tts?text=Thử+nghiệm+âm+thanh');
    expect(ttsRes.status()).toBe(200);
    expect(ttsRes.headers()['content-type']).toContain('audio/mpeg');

    // 2. Kiểm tra API POST log
    const postLogRes = await request.post('/api/log', {
      data: {
        text: 'Kiểm tra log E2E test',
        className: 'log-info',
        time: '12:00:00'
      }
    });
    expect(postLogRes.status()).toBe(200);
    const postLogData = await postLogRes.json();
    expect(postLogData.success).toBe(true);

    // 3. Kiểm tra API GET logs
    const getLogsRes = await request.get('/api/logs');
    expect(getLogsRes.status()).toBe(200);
    const getLogsData = await getLogsRes.json();
    expect(Array.isArray(getLogsData.logs)).toBe(true);
    expect(getLogsData.total).toBeGreaterThan(0);

    // 4. Kiểm tra API action (broadcast event)
    const actionRes = await request.post('/api/action', {
      data: {
        user: 'Tướng Test E2E',
        provinceId: 'ha_noi',
        type: 'comment',
        comment: 'Tiến lên thủ đô!'
      }
    });
    expect(actionRes.status()).toBe(200);
    const actionData = await actionRes.json();
    expect(actionData.success).toBe(true);
  });

  test('FE - Load trang, Canvas & Web Audio/WebSocket khởi tạo', async ({ page }) => {
    const consoleErrors = [];
    const pageErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', err => pageErrors.push(err.message));

    await page.goto('/#/battle', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    // Kiểm tra title
    await expect(page).toHaveTitle(/Đại Chiến 63 Tỉnh Thành/);

    // Kiểm tra Canvas tồn tại và hiển thị
    const canvas = page.locator('#battle-canvas');
    await expect(canvas).toBeVisible();

    // Kiểm tra các biến cốt lõi trong window
    const clientState = await page.evaluate(() => {
      return {
        provincesCount: typeof provinces !== 'undefined' ? Object.keys(provinces).length : 0,
        hasWs: typeof ws !== 'undefined' && ws !== null ? ws.readyState : -1
      };
    });

    expect(clientState.provincesCount).toBe(63);
    // ws.readyState === 1 (OPEN)
    expect(clientState.hasWs).toBe(1);

    // Không có console error nghiêm trọng từ ứng dụng
    expect(consoleErrors.length).toBe(0);
    expect(pageErrors.length).toBe(0);
  });

  test('FE - Điều khiển Zoom, Tương tác UI và Auto-War', async ({ page }) => {
    await page.goto('/#/battle', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // 1. Thử zoom in, zoom out, reset
    const btnZoomIn = page.locator('#btn-zoom-in');
    const btnZoomOut = page.locator('#btn-zoom-out');
    const btnZoomReset = page.locator('#btn-zoom-reset');

    await expect(btnZoomIn).toBeVisible();
    await btnZoomIn.click();
    await page.waitForTimeout(200);
    await btnZoomOut.click();
    await page.waitForTimeout(200);
    await btnZoomReset.click();
    await page.waitForTimeout(200);

    // 2. Thử bật/tắt Auto-War
    const autoBtn = page.locator('#autoBtn');
    await expect(autoBtn).toBeVisible();
    await autoBtn.click();
    await page.waitForTimeout(500);
    await expect(autoBtn).toContainText('DỪNG AUTO-WAR');

    // Dừng Auto-War
    await autoBtn.click();
    await page.waitForTimeout(300);
    await expect(autoBtn).toContainText('KÍCH HOẠT AUTO-WAR');

    // 3. Test Nhập tên tướng lĩnh
    const nameInput = page.locator('#sim-user');
    await expect(nameInput).toBeVisible();
    await nameInput.fill('Chỉ Huy Trưởng E2E');
    expect(await nameInput.inputValue()).toBe('Chỉ Huy Trưởng E2E');
  });

  test('FE - Đo hiệu năng & độ mượt (Frame Rendering & Loop Check)', async ({ page }) => {
    await page.goto('/#/battle', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    const perfMetrics = await page.evaluate(async () => {
      // Đo thời gian thực thi của hàm draw() và update()
      const drawTimes = [];
      for (let i = 0; i < 5; i++) {
        const t0 = performance.now();
        window.draw();
        drawTimes.push(performance.now() - t0);
      }

      // Đo số frame requestAnimationFrame ghi nhận trong 1 giây
      const frames = await new Promise(resolve => {
        let count = 0;
        const start = performance.now();
        function loop() {
          count++;
          if (performance.now() - start < 1000) {
            requestAnimationFrame(loop);
          } else {
            resolve(count);
          }
        }
        requestAnimationFrame(loop);
      });

      const avgDraw = drawTimes.reduce((a, b) => a + b, 0) / drawTimes.length;
      return { avgDrawMs: avgDraw, framesInOneSec: frames };
    });

    console.log(`[PERF METRICS] Canvas Draw Avg: ${perfMetrics.avgDrawMs.toFixed(2)}ms, Loop rAF: ${perfMetrics.framesInOneSec} FPS`);

    // Thời gian vẽ draw() trên 1 frame không được quá 33ms (tương đương tối thiểu 30fps budget)
    expect(perfMetrics.avgDrawMs).toBeLessThan(33);
  });

});
