const { createBrowser } = require('./browser')
const actions = require('./actions')

function rand(min, max) {
  return Math.floor(Math.random() * (max - min) + min)
}

// ===== CLI CONFIG =====
const args = process.argv.slice(2)

const config = {
  respond: args.includes('--respond'),
  openVacancy: !args.includes('--no-open'),
}

console.log('CONFIG:', config)

// ===== MEMORY =====
const visitedVacancies = new Set()

function pickState() {
  const r = Math.random()

  if (r < 0.25) return 'scrollOnly'
  if (r < 0.45) return 'openVacancy'
  if (r < 0.65) return 'favorite'
  if (r < 0.85) return 'respond'
  return 'paginate'
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
    const state = pickState()

    await actions.humanScroll(page)

    const vacancies = await page.$$('[data-qa="serp-item__title"]')

    const fresh = []

    for (const v of vacancies) {
      const text = await v.innerText()
      if (!visitedVacancies.has(text)) {
        fresh.push({ el: v, id: text })
      }
    }

    if (!fresh.length) {
      visitedVacancies.clear()
      continue
    }

    const random = fresh[rand(0, fresh.length)]
    const vacancy = random.el

    visitedVacancies.add(random.id)

    if (state === 'scrollOnly') {
      await page.waitForTimeout(rand(2000, 5000))
      continue
    }

    if (state === 'favorite') {
      await actions.addToFavorite(page)
      await page.waitForTimeout(rand(2000, 4000))
      continue
    }

    if (state === 'respond' && config.respond && !config.openVacancy) {
      await actions.respondVacancy(page)
      await page.waitForTimeout(rand(2000, 4000))
      continue
    }

    if (state === 'openVacancy' && config.openVacancy) {
      const [vacancyPage] = await Promise.all([
        page.context().waitForEvent('page'),
        vacancy.click(),
      ])

      await vacancyPage.waitForLoadState('domcontentloaded')

      if (Math.random() > 0.5) {
        await actions.randomWheel(vacancyPage)
      }

      if (config.respond && Math.random() > 0.6) {
        await actions.respondVacancy(vacancyPage)
      }

      await vacancyPage.waitForTimeout(rand(2000, 6000))

      await vacancyPage.close()
      await page.bringToFront()

      continue
    }

    if (state === 'paginate') {
      await actions.smartNextPage(page)
      await page.waitForSelector('[data-qa="serp-item__title"]')
      continue
    }
  }
})()
