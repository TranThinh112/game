import { test, expect } from "@playwright/test";

test.describe("E2E Test Toàn diện - Bắt Comment & Sự kiện Quà tặng (Prompt 1 - 4)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/battle");
    await page.waitForTimeout(1500);
  });

  // NHÓM 1: HỒI MÁU HP
  test("1.1. Comment biển số (19, +19) và tên tỉnh (Phú Thọ, phu tho): hồi +100 HP", async ({ page }) => {
    const res = await page.evaluate(() => {
      const p = provinces.find(x => x.plate === "19");
      p.hp = 300; // set 300 HP ban đầu
      const results = [];

      // 1. Comment tên có dấu "Phú Thọ" -> 400
      handleAction({ user: "Viewer1", comment: "Phú Thọ" });
      results.push({ step: "Phú Thọ", hp: p.hp });

      // 2. Comment biển số "19" -> 500
      handleAction({ user: "Viewer2", comment: "19" });
      results.push({ step: "19", hp: p.hp });

      // 3. Comment không dấu "phu tho" -> 600
      handleAction({ user: "Viewer3", comment: "phu tho" });
      results.push({ step: "phu tho", hp: p.hp });

      // 4. Comment "+19" -> 700
      handleAction({ user: "Viewer4", comment: "+19" });
      results.push({ step: "+19", hp: p.hp });

      return { province: p.name, plate: p.plate, results };
    });

    console.log("[TEST 1.1 LOG]", JSON.stringify(res, null, 2));
    expect(res.results[0].hp).toBe(400);
    expect(res.results[1].hp).toBe(500);
    expect(res.results[2].hp).toBe(600);
    expect(res.results[3].hp).toBe(700);
  });

  test("1.2. Khi tỉnh đã đầy 1000/1000 HP: hệ thống báo ĐẦY MÁU (1000), không báo ảo +100 HP", async ({ page }) => {
    const res = await page.evaluate(() => {
      const p = provinces.find(x => x.plate === "19");
      p.hp = 1000;
      let popupText = "";
      const origPopup = window.popupDamage;
      window.popupDamage = (x, y, txt, col, isCrit) => {
        popupText = txt;
        origPopup(x, y, txt, col, isCrit);
      };

      const logs = [];
      const origLog = window.addWarLog;
      window.addWarLog = (msg, cls) => { logs.push(msg); origLog(msg, cls); };

      handleAction({ user: "ViewerFull", comment: "19" });
      return { hp: p.hp, popupText, lastLog: logs[logs.length - 1] };
    });

    console.log("[TEST 1.2 LOG]", JSON.stringify(res, null, 2));
    expect(res.hp).toBe(1000);
    expect(res.popupText).toContain("ĐẦY MÁU");
    expect(res.lastLog).toContain("đã đạt giới hạn tối đa");
  });

  // NHÓM 2: QUY TẮC BỘ BINH
  test("2.1. Comment đánh giáp ranh (19 - 88 Phú Thọ đánh Vĩnh Phúc): hệ thống cho phép xuất quân", async ({ page }) => {
    const res = await page.evaluate(() => {
      const logs = [];
      const origLog = window.addWarLog;
      window.addWarLog = (msg, cls) => { logs.push(msg); origLog(msg, cls); };

      const uBefore = (typeof units !== "undefined") ? units.length : 0;
      handleAction({ user: "ViewerMarch", comment: "19 - 88" });
      const uAfter = (typeof units !== "undefined") ? units.length : 0;

      const marchLog = logs.some(l => l.includes("tiến công [Vĩnh Phúc]") || l.includes("tiến quân sang Vĩnh Phúc"));
      return { allowed: marchLog, uBefore, uAfter, logs: logs.slice(-2) };
    });

    console.log("[TEST 2.1 LOG]", JSON.stringify(res, null, 2));
    expect(res.allowed).toBe(true);
  });

  test("2.2. Comment đánh không giáp ranh (19 - 69 Phú Thọ đánh Cà Mau): từ chối, hiện NGOÀI PHẠM VI! và ghi log cảnh báo", async ({ page }) => {
    const res = await page.evaluate(() => {
      let popupText = "";
      const origPopup = window.popupDamage;
      window.popupDamage = (x, y, txt, col, isCrit) => {
        popupText = txt;
        origPopup(x, y, txt, col, isCrit);
      };

      const logs = [];
      const origLog = window.addWarLog;
      window.addWarLog = (msg, cls) => { logs.push(msg); origLog(msg, cls); };

      handleAction({ user: "ViewerCheat", comment: "19 - 69" });
      const viPham = logs.some(l => l.includes("không nằm trong phạm vi tấn công của bộ binh Phú Thọ"));
      return { viPham, popupText, lastLog: logs[logs.length - 1] };
    });

    console.log("[TEST 2.2 LOG]", JSON.stringify(res, null, 2));
    expect(res.viPham).toBe(true);
    expect(res.popupText).toBe("NGOÀI PHẠM VI!");
  });

  // NHÓM 3: QUY TẮC KHÔNG QUÂN & HẢI QUÂN
  test("3.1. Comment Không quân trái phép (19 - 88 MB): từ chối, popup CHƯA CÓ QUYỀN MB!, cảnh báo Phú Thọ chưa có quyền", async ({ page }) => {
    const res = await page.evaluate(() => {
      let popupText = "";
      const origPopup = window.popupDamage;
      window.popupDamage = (x, y, txt, col, isCrit) => {
        popupText = txt;
        origPopup(x, y, txt, col, isCrit);
      };

      const logs = [];
      const origLog = window.addWarLog;
      window.addWarLog = (msg, cls) => { logs.push(msg); origLog(msg, cls); };

      handleAction({ user: "ViewerAir", comment: "19 - 88 MB" });
      const viPham = logs.some(l => l.includes("Phú Thọ chưa có quyền điều động máy bay"));
      return { viPham, popupText, lastLog: logs[logs.length - 1] };
    });

    console.log("[TEST 3.1 LOG]", JSON.stringify(res, null, 2));
    expect(res.viPham).toBe(true);
    expect(res.popupText).toBe("CHƯA CÓ QUYỀN MB!");
  });

  test("3.2. Comment Hải quân trái phép (19 - 88 TC): từ chối, popup CHƯA CÓ QUYỀN TC!, cảnh báo Phú Thọ chưa có quyền", async ({ page }) => {
    const res = await page.evaluate(() => {
      let popupText = "";
      const origPopup = window.popupDamage;
      window.popupDamage = (x, y, txt, col, isCrit) => {
        popupText = txt;
        origPopup(x, y, txt, col, isCrit);
      };

      const logs = [];
      const origLog = window.addWarLog;
      window.addWarLog = (msg, cls) => { logs.push(msg); origLog(msg, cls); };

      handleAction({ user: "ViewerNavy", comment: "19 - 88 TC" });
      const viPham = logs.some(l => l.includes("Phú Thọ chưa có quyền điều động tàu chiến"));
      return { viPham, popupText, lastLog: logs[logs.length - 1] };
    });

    console.log("[TEST 3.2 LOG]", JSON.stringify(res, null, 2));
    expect(res.viPham).toBe(true);
    expect(res.popupText).toBe("CHƯA CÓ QUYỀN TC!");
  });

  // NHÓM 4: PHÂN TẦNG ĐẶC QUYỀN QUÀ TẶNG
  test("4.1. Quà Hoa 1-49 xu: hồi +50 HP và spawn lính chi viện", async ({ page }) => {
    const res = await page.evaluate(() => {
      const p = provinces.find(x => x.plate === "19");
      p.hp = 500;
      let spawned = null;
      const origSpawn = window.spawnUnit;
      window.spawnUnit = (prov, user, type) => {
        spawned = { prov: prov.name, user, type };
        origSpawn(prov, user, type);
      };

      handleAction({ type: "gift", giftValue: 10, user: "Donator10", provinceId: p.id, sourceProvinceId: p.id });
      return { hpAfter: p.hp, spawned };
    });

    console.log("[TEST 4.1 LOG]", JSON.stringify(res, null, 2));
    expect(res.hpAfter).toBe(550);
    expect(res.spawned.type).toBe("soldier");
  });

  test("4.2. Quà Donut 50-199 xu: hồi +150 HP, spawn kỵ binh và chi viện không kích", async ({ page }) => {
    const res = await page.evaluate(() => {
      const p = provinces.find(x => x.plate === "19");
      p.hp = 500;
      let airMission = null;
      const origAir = window.spawnAirMission;
      window.spawnAirMission = (src, tgt, user, squad, dmg, sound) => {
        airMission = { src: src.name, tgt: tgt.name, user, dmg };
        origAir(src, tgt, user, squad, dmg, sound);
      };

      handleAction({ type: "gift", giftValue: 100, user: "Donator100", provinceId: p.id, sourceProvinceId: p.id });
      return { hpAfter: p.hp, airMission };
    });

    console.log("[TEST 4.2 LOG]", JSON.stringify(res, null, 2));
    expect(res.hpAfter).toBe(650);
    expect(res.airMission).toBeTruthy();
    expect(res.airMission.dmg).toBe(250);
  });

  test("4.3. Quà Boss 200-1999 xu: hồi +300 HP và triệu hồi Đại Tướng Boss chiến trường", async ({ page }) => {
    const res = await page.evaluate(() => {
      const p = provinces.find(x => x.plate === "19");
      p.hp = 500;
      let bossUnit = null;
      const origSpawn = window.spawnUnit;
      window.spawnUnit = (prov, user, type) => {
        if(type === "boss") bossUnit = { prov: prov.name, user, type };
        origSpawn(prov, user, type);
      };

      handleAction({ type: "gift", giftValue: 500, user: "Donator500", provinceId: p.id, sourceProvinceId: p.id });
      return { hpAfter: p.hp, bossUnit };
    });

    console.log("[TEST 4.3 LOG]", JSON.stringify(res, null, 2));
    expect(res.hpAfter).toBe(800);
    expect(res.bossUnit.type).toBe("boss");
  });

  test("4.4. Quà Sư Tử >= 2000 xu: phục sinh độc lập, hồi full 1000 HP, 2 vòng shockwave và MVP banner", async ({ page }) => {
    const res = await page.evaluate(() => {
      const p = provinces.find(x => x.plate === "19");
      // Giả lập Phú Thọ đang bị đô hộ bởi Hà Nội
      p.ownerId = "ha_noi";
      p.ownerName = "Hà Nội";
      p.hp = 50;

      let shockwaves = [];
      const origShock = window.createShockwave;
      window.createShockwave = (x, y, col) => {
        shockwaves.push({ x, y, col });
        origShock(x, y, col);
      };

      handleAction({ type: "gift", giftValue: 2000, user: "VIP_Lion", provinceId: p.id, sourceProvinceId: p.id });
      
      const mvpBanner = document.getElementById("mvp-banner");
      return {
        hpAfter: p.hp,
        ownerIdAfter: p.ownerId,
        ownerNameAfter: p.ownerName,
        isIndependent: p.ownerId === p.id,
        shockwavesCount: shockwaves.length,
        mvpText: mvpBanner ? mvpBanner.innerText : ""
      };
    });

    console.log("[TEST 4.4 LOG]", JSON.stringify(res, null, 2));
    expect(res.hpAfter).toBe(1000);
    expect(res.isIndependent).toBe(true);
    expect(res.shockwavesCount).toBe(2);
    expect(res.mvpText).toContain("VIP_Lion");
    expect(res.mvpText).toContain("2000 xu");
  });
});
