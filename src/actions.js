// плавный скролл (очень мягкий)
async function humanScroll(page) {
  const steps = 50

  for (let i = 0; i < steps; i++) {
    await page.evaluate(() => {
      window.scrollBy(0, 80)
    })

    await page.waitForTimeout(120 + Math.random() * 160)
  }
}

// плавное движение мыши к элементу
async function smoothMoveTo(page, selector) {
  const el = await page.$(selector)
  const box = await el.boundingBox()

  const targetX = box.x + box.width / 2
  const targetY = box.y + box.height / 2

  await page.mouse.move(targetX, targetY, { steps: 35 })
}

// добавить в избранное максимально мягко
async function addToFavorite(page) {
  const selector = '[data-qa^="vacancy-search-mark-favorite"]'

  await page.waitForSelector(selector)

  await smoothMoveTo(page, selector)

  await page.waitForTimeout(400 + Math.random() * 700)

  await page.click(selector)
}

// отклик
async function respondVacancy(page) {
  const selector = '[data-qa="vacancy-serp__vacancy_response"]'

  await page.waitForSelector(selector)

  await smoothMoveTo(page, selector)

  await page.waitForTimeout(600 + Math.random() * 900)

  await page.click(selector)
}

// переход на следующую страницу
async function nextPage(page) {
  const pages = await page.$$('[data-qa="pager-page"]')
  const lastPage = pages[pages.length - 1]

  const box = await lastPage.boundingBox()

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
    steps: 30,
  })

  await page.waitForTimeout(500 + Math.random() * 800)

  await lastPage.click()
}

module.exports = {
  humanScroll,
  addToFavorite,
  respondVacancy,
  nextPage,
}
