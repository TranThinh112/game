const { chromium } = require('@playwright/test');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:5050');
  await page.waitForTimeout(1000);

  const debugTarget = await page.evaluate(() => {
    const srcSelect = document.getElementById('select-source-prov');
    const tgtSelect = document.getElementById('select-target-prov');

    srcSelect.value = 'tp_hcm';
    updateTargetDropdown();

    const py = provinces.find(p => p.id === 'phu_yen');
    py.ownerId = 'dak_lak';

    // Thử thêm option dak_lak vào tgtSelect nếu chưa có
    let opt = Array.from(tgtSelect.options).find(o => o.value === 'dak_lak');
    if (!opt) {
      opt = document.createElement('option');
      opt.value = 'dak_lak';
      opt.text = 'Đắk Lắk';
      tgtSelect.appendChild(opt);
    }
    tgtSelect.value = 'dak_lak';

    const chosenTgtId = tgtSelect.value;
    const currentSrc = provinces.find(p => p.id === 'tp_hcm');
    const empireId = getEmpireId(currentSrc);
    const chosenTgt = provinces.find(p => p.id === chosenTgtId && getEmpireId(p) !== empireId);

    const enemyEmpireId = chosenTgt ? getEmpireId(chosenTgt) : null;
    const enemyProvs = enemyEmpireId ? getEmpireProvinces(enemyEmpireId) : [];
    const enemyCoastals = enemyProvs.filter(p => coastalProvinces.has(p.id));

    return {
      chosenTgtId,
      chosenTgt: chosenTgt ? chosenTgt.name : null,
      enemyEmpireId,
      enemyProvs: enemyProvs.map(p => p.id),
      enemyCoastals: enemyCoastals.map(p => p.id)
    };
  });

  console.log('debugTarget:', debugTarget);
  await browser.close();
})();
