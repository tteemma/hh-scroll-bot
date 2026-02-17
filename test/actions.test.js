const actions = require('../src/actions')

function createMockPage() {
  return {
    evaluate: jest.fn().mockResolvedValue(),
    waitForTimeout: jest.fn().mockResolvedValue(),
    mouse: {
      wheel: jest.fn().mockResolvedValue(),
      move: jest.fn().mockResolvedValue(),
    },
    click: jest.fn().mockResolvedValue(),
    $: jest.fn().mockResolvedValue({
      boundingBox: async () => ({ x: 0, y: 0, width: 100, height: 20 }),
    }),
    locator: jest.fn(() => ({
      count: jest.fn().mockResolvedValue(1),
      first: () => ({
        click: jest.fn().mockResolvedValue(),
      }),
      scrollIntoViewIfNeeded: jest.fn().mockResolvedValue(),
      click: jest.fn().mockResolvedValue(),
    })),
  }
}

describe('actions.js tests', () => {
  test('humanScroll делает scrollBy', async () => {
    const page = createMockPage()

    await actions.humanScroll(page)

    // проверяем что evaluate вызывался
    expect(page.evaluate).toHaveBeenCalled()
  })

  test('randomWheel крутит колесо', async () => {
    const page = createMockPage()

    await actions.randomWheel(page)

    expect(page.mouse.wheel).toHaveBeenCalled()
  })

  test('addToFavorite делает click если кнопка есть', async () => {
    const page = createMockPage()

    await actions.addToFavorite(page)

    expect(page.click).toHaveBeenCalled()
  })

  test('respondVacancy ищет кнопку отклика', async () => {
    const page = createMockPage()

    await actions.respondVacancy(page)

    expect(page.locator).toHaveBeenCalled()
  })
})
