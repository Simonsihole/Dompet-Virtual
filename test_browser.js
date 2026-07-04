const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

  console.log('Navigating to Vercel app...');
  await page.goto('https://dompet-virtual.vercel.app/', { waitUntil: 'networkidle0' });
  
  console.log('Done loading. Checking root HTML...');
  const html = await page.evaluate(() => document.body.innerHTML);
  console.log('HTML length:', html.length);
  
  await browser.close();
})();
