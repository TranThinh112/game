
const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 450, height: 800 } });
  await page.setContent("<h1>Test Playwright</h1>");
  await page.screenshot({ path: "test_pw.png" });
  await browser.close();
  console.log("Playwright works!");
})();
