const { createBrowser } = require('./browser')
const actions = require('./actions')

function rand(min, max) {
  return Math.floor(Math.random() * (max - min) + min)
}

;(async () => {
  const { page } = await createBrowser('auth.json')

  const searchUrl =
    'https://hh.ru/search/vacancy?ored_clusters=true&hhtmFrom=vacancy_search_list&hhtmFromLabel=vacancy_search_line&search_field=name&search_field=company_name&search_field=description&enable_snippets=false&L_save_area=true&text=React+OR+Frontend-developer+OR+Frontend-разработчик&excluded_text=backend%2C+full-stack%2C+fullstack%2C+junior'

  await page.goto(searchUrl, {
    waitUntil: 'domcontentloaded',
    timeout: 0,
  })

  await actions.closeCookies(page)

  await page.waitForSelector('[data-qa="serp-item__title"]')

  while (true) {
    // мягкий случайный скролл
    await actions.humanScroll(page)

    const vacancies = await page.$$('[data-qa="serp-item__title"]')

    // случайная вакансия на странице
    const randomIndex = rand(0, vacancies.length)
    const vacancy = vacancies[randomIndex]

    // плавно подвести мышь
    const box = await vacancy.boundingBox()

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
      steps: rand(20, 40),
    })

    await page.waitForTimeout(rand(600, 1400))

    // иногда добавить в избранное прямо в списке
    if (Math.random() > 0.5) {
      await actions.addToFavorite(page)
    }

    // открыть вакансию
    const [vacancyPage] = await Promise.all([
      page.context().waitForEvent('page'),
      vacancy.click(),
    ])

    await vacancyPage.waitForLoadState('domcontentloaded')

    // --- случайный сценарий действий ---
    const behavior = rand(0, 3)

    // if (behavior === 0) {
    //   await actions.respondVacancy(vacancyPage)
    // }

    if (behavior === 1) {
      await vacancyPage.mouse.wheel(0, 600)
      await vacancyPage.waitForTimeout(rand(1500, 3000))
    }

    if (behavior === 2) {
      // await actions.respondVacancy(vacancyPage)
      await vacancyPage.mouse.wheel(0, 400)
    }

    await vacancyPage.waitForTimeout(rand(2000, 5000))

    await vacancyPage.close()

    await page.bringToFront()

    // иногда перейти на следующую страницу
    if (Math.random() > 0.7) {
      await actions.killOverlays(page)
      await actions.nextPage(page)
      await page.waitForSelector('[data-qa="serp-item__title"]')
    }

    await page.waitForTimeout(rand(2000, 6000))
  }
})()
