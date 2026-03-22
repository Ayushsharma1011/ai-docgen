const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000); // Wait for framer motion

  const bounds = await page.evaluate(() => {
    const hero = document.querySelector('section:nth-of-type(1)').getBoundingClientRect();
    const features = document.querySelector('section:nth-of-type(2)').getBoundingClientRect();
    const howItWorks = document.querySelector('section:nth-of-type(3)').getBoundingClientRect();

    return {
      hero: { y: hero.y, height: hero.height, bottom: hero.bottom },
      features: { y: features.y, height: features.height, bottom: features.bottom },
      howItWorks: { y: howItWorks.y, height: howItWorks.height, bottom: howItWorks.bottom },
    };
  });

  console.log(JSON.stringify(bounds, null, 2));
  await browser.close();
})();
