function rand(min, max) {
  return Math.floor(Math.random() * (max - min) + min)
}

async function humanScroll(page) {
  const steps = rand(20, 60)

  for (let i = 0; i < steps; i++) {
    const direction = Math.random() < 0.7 ? 1 : -1
    const distance = rand(60, 140) * direction

    await page.evaluate(d => {
      window.scrollBy(0, d)
    }, distance)

    await page.waitForTimeout(rand(80, 200))
  }
}

async function randomWheel(page) {
  const steps = rand(3, 8)

  for (let i = 0; i < steps; i++) {
    const dir = Math.random() > 0.5 ? 1 : -1
    await page.mouse.wheel(0, rand(200, 500) * dir)
    await page.waitForTimeout(rand(400, 900))
  }
}

async function smoothMoveTo(page, selector) {
  const el = await page.$(selector)
  if (!el) return

  const box = await el.boundingBox()
  if (!box) return

  const targetX = box.x + box.width / 2
  const targetY = box.y + box.height / 2

  await page.mouse.move(targetX, targetY, { steps: 35 })
}

async function addToFavorite(page) {
  const selector = '[data-qa^="vacancy-search-mark-favorite"]'

  if (!(await page.locator(selector).count())) return

  await smoothMoveTo(page, selector)
  await page.waitForTimeout(rand(400, 900))
  await page.click(selector)
}

async function respondVacancy(page) {
  const selectors = [
    '[data-qa="vacancy-serp__vacancy_response"]',
    '[data-qa="vacancy-response-link-top"]',
    '[data-qa="vacancy-response-link-bottom"]',
  ]

  for (const selector of selectors) {
    const el = page.locator(selector)

    if (await el.count()) {
      await smoothMoveTo(page, selector)
      await page.waitForTimeout(rand(600, 1200))
      await el.first().click()
      break
    }
  }
}

async function smartNextPage(page) {
  await killOverlays(page)

  const pages = page.locator('[data-qa="pager-page"]')
  const count = await pages.count()

  if (!count) return

  const strategy = Math.random()
  let target

  if (strategy < 0.4) {
    target = pages.nth(rand(0, count))
  } else if (strategy < 0.8) {
    const nextBtn = page.locator('[data-qa="pager-next"]')
    if (await nextBtn.count()) target = nextBtn
  }

  if (!target) {
    target = pages.last()
  }

  await target.scrollIntoViewIfNeeded()
  await page.waitForTimeout(rand(300, 800))
  await target.click({ force: true })
}

async function closeCookies(page) {
  try {
    const cookieBtn = page.locator('[data-qa="cookies-policy-informer"] button')

    if (await cookieBtn.count()) {
      await cookieBtn.click({ force: true })
      await page.waitForTimeout(500)
    }
  } catch (e) {
    console.error(e)
  }
}

async function killOverlays(page) {
  await page.evaluate(() => {
    const blockers = document.querySelectorAll(`
      [data-qa="cookies-policy-informer"],
      #bottom-cookies-policy-informer,
      [class*="float-chatik-activator"],
      [class*="floating-button"]
    `)

    blockers.forEach(el => el.remove())
  })
}

module.exports = {
  humanScroll,
  randomWheel,
  addToFavorite,
  respondVacancy,
  smartNextPage,
  closeCookies,
  killOverlays,
}
