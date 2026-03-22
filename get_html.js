const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);
  const html = await page.content();
  const fs = require('fs');
  fs.writeFileSync('page.html', html);
  await browser.close();
})();
