// запуск браузера
const { chromium } = require('playwright')

async function createBrowser(storageState) {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 150,
  })

  const context = await browser.newContext({
    storageState: storageState || undefined,
    viewport: { width: 1400, height: 900 },
  })

  const page = await context.newPage()

  return { browser, context, page }
}

module.exports = { createBrowser }
